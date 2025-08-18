// lib/supabase-admin.ts (server-only, lazy)
import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _admin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  // ← 런타임에만 읽고 검사 (빌드 시 import 단계에서 throw 금지)
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase env missing: set SUPABASE_URL(or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  if (_admin) return _admin
  _admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _admin
}

// 하위호환: 기존에 supabaseAdmin "값"을 import하던 코드도 동작하도록 Proxy로 lazy 위임
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    // 첫 접근 시점에만 실제 클라이언트 생성
    const real = getSupabaseAdmin() as any
    return real[prop]
  },
})