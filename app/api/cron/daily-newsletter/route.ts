import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createTransporter, createNewsletterHTML } from '@/lib/email';
import { fetchNewsByTab, summarizeWithGlossary } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // 0) 권한: Vercel Cron 또는 force=1 허용
  const ua = headers().get('user-agent') || '';
  const url = new URL(req.url);
  const force = url.searchParams.get('force') === '1';
  const dry   = url.searchParams.get('dry') === '1';
  const only  = url.searchParams.get('only') || '';
  const dateParam = url.searchParams.get('date') || '';

  if (!ua.includes('vercel-cron/') && !force) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'not vercel cron' });
  }

  // 1) 날짜 키(KST)
  const nowKST = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const dateKey = dateParam || nowKST.toISOString().slice(0, 10); // YYYY-MM-DD
  const subjectDate = nowKST.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  // 2) Supabase(admin)
  const supabase = getSupabaseAdmin();

  // 3) 멱등 잠금
  if (!dry) {
    const { error: lockErr } = await supabase
      .from('daily_sends')
      .insert({ date_key: dateKey, started_at: new Date().toISOString() });

    if (lockErr && (lockErr as any).code === '23505') {
      return NextResponse.json({ ok: true, deduped: true, dateKey });
    }
    if (lockErr) {
      return NextResponse.json({ ok: false, step: 'insert_lock', error: lockErr.message }, { status: 500 });
    }
  }

  // 4) 구독자
  const { data: subs, error: subsErr } = await supabase
    .from('subscribers')
    .select('email')
    .eq('status', 'subscribed');
  if (subsErr) return NextResponse.json({ ok: false, step: 'load_subscribers', error: subsErr.message }, { status: 500 });

  let recipients = subs || [];
  if (only) recipients = recipients.filter(r => r.email === only);

  // 5) 뉴스 수집/요약(1회 수행)
  const tabs = ['정책뉴스', '시장분석', '지원혜택', '초보자용', '신혼부부용', '투자자용'];
  const collected: any[] = [];
  for (const tab of tabs) {
    try {
      const items = await fetchNewsByTab(tab);
      const top = items.slice(0, 4).map(n => ({ ...n, title: `${tab} | ${n.title}` }));
      collected.push(...top);
    } catch (e) {
      console.error(`[cron] ${tab} 수집 실패:`, e);
    }
  }

  const newsWithSummaries = await Promise.all(
    collected.map(async (news) => {
      const res = await summarizeWithGlossary(news.title, news.content || '', news.category || '정책뉴스');
      return {
        ...news,
        summary: news.summary && news.summary.trim().length > 0 ? news.summary : res.summary,
        glossary: res.glossary
      };
    })
  );

  // 6) HTML 베이스(수신자별 이메일만 치환)
  let htmlBase = createNewsletterHTML(newsWithSummaries, subjectDate); // {{EMAIL}} 포함되어 있어야 함

  // 7) 트랜스포터 1회 생성
  const transporter = await createTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

  // 8) 전송
  let sent = 0, failed = 0;
  const failures: Array<{ to: string; error: string }> = [];

  if (!dry) {
    for (const r of recipients) {
      const html = htmlBase.replace(/\{\{EMAIL\}\}/g, r.email);
      try {
        await transporter.sendMail({
          from: `"ziply" <${fromAddress}>`,
          to: r.email,
          subject: `[ziply] ${subjectDate} 오늘의 부동산 뉴스`,
          html
        });
        sent++;
      } catch (e: any) {
        failed++;
        failures.push({ to: r.email, error: e.message });
      }
    }

    await supabase
      .from('daily_sends')
      .update({ completed_at: new Date().toISOString(), sent_count: sent, failed_count: failed })
      .eq('date_key', dateKey);
  }

  return NextResponse.json({ ok: true, dateKey, dry, total: recipients.length, sent, failed, failures });
}