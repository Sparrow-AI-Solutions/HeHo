import { createClient as createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const getUserIdFromBearer = async (authorizationHeader: string | null): Promise<string | null> => {
  if (!authorizationHeader?.startsWith('Bearer ')) return null
  const hehoApiKey = authorizationHeader.slice(7).trim()
  if (!hehoApiKey) return null

  const admin = createAdminClient()
  const { data: user } = await admin
    .from('users')
    .select('id')
    .eq('heho_api_key', hehoApiKey)
    .maybeSingle()

  return user?.id || null
}

export const getUserIdFromSession = async (): Promise<string | null> => {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export const userOwnsChatbot = async (userId: string, chatbotId: string): Promise<boolean> => {
  const admin = createAdminClient()
  const { data } = await admin
    .from('chatbots')
    .select('id')
    .eq('id', chatbotId)
    .eq('user_id', userId)
    .maybeSingle()

  return Boolean(data)
}

