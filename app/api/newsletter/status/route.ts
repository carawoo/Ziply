import 'server-only'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')?.trim().toLowerCase()

  // 1) 헬스 체크: email 없이 호출하면 OK만 리턴
  if (!email) {
    return NextResponse.json({ ok: true, service: 'ziply', time: new Date().toISOString() })
  }

  // 2) 이메일 조회
  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers') // 스키마에 맞춰 컬럼명 맞추기
    .select('email, created_at')     // is_active 없으면 created_at로
    .eq('email', email)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, data })
}

export async function HEAD() {
  return new Response(null, { status: 200 })
}