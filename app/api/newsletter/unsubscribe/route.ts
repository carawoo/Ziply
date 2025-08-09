import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string
  if (!url || !key) {
    throw new Error('Supabase env not configured')
  }
  return createClient(url, key)
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')?.trim().toLowerCase()
    const redirect = searchParams.get('redirect')
    if (!email) {
      return NextResponse.json({ success: false, error: 'email is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email, is_active: false }, { onConflict: 'email' })
      .select('email, is_active')

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (redirect) {
      const baseUrl = process.env.APP_BASE_URL || 'https://ziply-nine.vercel.app'
      const url = `${baseUrl.replace(/\/$/, '')}/newsletter?unsubscribed=1`
      return NextResponse.redirect(url)
    }

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'unknown error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const emailRaw = body?.email || new URL(req.url).searchParams.get('email')
    const email = (emailRaw || '').trim().toLowerCase()
    if (!email) {
      return NextResponse.json({ success: false, error: 'email is required' }, { status: 400 })
    }
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email, is_active: false }, { onConflict: 'email' })
      .select('email, is_active')

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'unknown error' }, { status: 500 })
  }
}


