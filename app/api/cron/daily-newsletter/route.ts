// app/api/cron/daily-newsletter/route.ts
import 'server-only'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendNewsletter } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// KST 기준 YYYY-MM-DD
function kstDateKey() {
  const now = Date.now()
  const nowKST = new Date(now + 9 * 60 * 60 * 1000)
  return nowKST.toISOString().slice(0, 10)
}

export async function GET(req: Request) {
  const ua = headers().get('user-agent') || ''
  const { searchParams } = new URL(req.url)
  const dry   = searchParams.get('dry') === '1'
  const force = searchParams.get('force') === '1'
  const limit = Number(searchParams.get('limit') || '0') // 0 = 제한없음
  const only  = searchParams.get('to')?.trim().toLowerCase() // 특정 주소만 발송 테스트
  const testDate = searchParams.get('date') // 테스트용 날짜

  // vercel-cron 외 접근 차단(테스트 때는 force=1)
  if (!force && !ua.includes('vercel-cron/1.0')) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'not vercel cron' })
  }

  const dateKey = testDate || kstDateKey()

  // 멱등 잠금: dry 모드일 때는 DB 잠금/기록 생략
  if (!dry) {
    const { error: lockErr } = await supabaseAdmin
      .from('daily_sends')
      .insert({ date_key: dateKey, started_at: new Date().toISOString() })
    if (lockErr) {
      // 유니크 충돌이면 이미 발송됨
      return NextResponse.json({ ok: true, deduped: true, dateKey })
    }
  }

  // === 구독자 로드 ===
  let emails: string[] = []

  if (only) {
    emails = [only]
  } else {
    // ⚠️ 여기서 'newsletter_subscribers' 사용 (이전 'subscribers' 아님)
    // is_active = true인 구독자만 발송 대상으로 선정
    const q = supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    // 제한이 있으면 적용
    if (limit > 0) q.limit(limit)

    const { data, error } = await q
    if (error) {
      if (!dry) {
        await supabaseAdmin
          .from('daily_sends')
          .update({ completed_at: new Date().toISOString(), error_msg: error.message })
          .eq('date_key', dateKey)
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    emails = (data || []).map((r: any) => r.email).filter(Boolean)
  }

  if (dry) {
    return NextResponse.json({ ok: true, dateKey, dry: true, total: emails.length, sent: 0, failed: 0, failures: [] })
  }

  // === 실제 발송 ===
  let sent = 0
  const failures: { email: string; error: string }[] = []
  for (const email of emails) {
    try {
      await sendNewsletter(email)
      sent++
    } catch (e: any) {
      failures.push({ email, error: e?.message || 'unknown error' })
    }
  }

  await supabaseAdmin
    .from('daily_sends')
    .update({
      completed_at: new Date().toISOString(),
      sent_count: sent,
      fail_count: failures.length,
    })
    .eq('date_key', dateKey)

  return NextResponse.json({
    ok: true,
    dateKey,
    total: emails.length,
    sent,
    failed: failures.length,
    failures,
  })
}