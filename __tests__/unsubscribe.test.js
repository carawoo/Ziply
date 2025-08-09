require('dotenv').config({ path: '.env' })
const assert = require('assert')
const { createClient } = require('@supabase/supabase-js')
const { fetch } = require('undici')
globalThis.fetch = globalThis.fetch || fetch

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) throw new Error('Supabase env missing')

const supabase = createClient(url, key)

async function callUnsubscribe(email) {
  const base = process.env.APP_BASE_URL || 'http://localhost:3001'
  const res = await fetch(`${base.replace(/\/$/, '')}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`)
  return await res.json()
}

;(async () => {
  const email = `test+${Date.now()}@example.com`
  // 1) Seed subscriber
  let { error } = await supabase.from('newsletter_subscribers').insert({ email, is_active: true })
  assert(!error, 'seed insert failed')
  // 2) Unsubscribe via API
  const result = await callUnsubscribe(email)
  assert(result.success, 'unsubscribe api failed')
  // 3) Verify
  const { data } = await supabase.from('newsletter_subscribers').select('is_active').eq('email', email).single()
  assert(data && data.is_active === false, 'is_active not false')
  console.log('✅ unsubscribe flow passed')
})().catch((e) => {
  console.error('❌ test failed', e)
  process.exit(1)
})


