// lib/supabase-admin.ts (server-only)
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// 필수 ENV 보장 헬퍼
function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v || v.trim() === '') {
    throw new Error(`Missing env: ${name}`)
  }
  return v
}

// dev HMR에서도 싱글톤 유지용 전역 캐시 선언
declare global {
  // eslint-disable-next-line no-var
  var _supabaseAdmin: SupabaseClient | undefined
}

/** 하위호환 유지: 함수 형태 */
export function getSupabaseAdmin(): SupabaseClient {
  if (globalThis._supabaseAdmin) return globalThis._supabaseAdmin

  // 필요 시 SUPABASE_URL도 fallback으로 허용
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    requireEnv('SUPABASE_URL') // 둘 중 하나는 있어야 함

  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

  globalThis._supabaseAdmin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return globalThis._supabaseAdmin
}

/** 선호: 즉시 평가된 싱글톤 인스턴스 */
export const supabaseAdmin: SupabaseClient = getSupabaseAdmin()