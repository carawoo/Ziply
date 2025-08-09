import { NextRequest, NextResponse } from 'next/server'
import { sendSubscriptionConfirmation } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'email is required' }, { status: 400 })
    }
    await sendSubscriptionConfirmation(email.trim().toLowerCase())
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'unknown error' }, { status: 500 })
  }
}
