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

export async function POST(req: Request) {
  try {
    const { email: rawEmail } = await req.json()
    const email = (rawEmail || '').trim().toLowerCase()
    if (!email) {
      return NextResponse.json({ success: false, error: 'email is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email, is_active: true }, { onConflict: 'email' })
      .select('email, is_active')

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'unknown error' }, { status: 500 })
  }
}


