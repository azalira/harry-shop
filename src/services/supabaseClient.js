import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Variables d'environnement Supabase manquantes (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)")
}
export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'products'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const isAbsoluteUrl = (value) => /^(https?:|blob:|data:)/i.test(value)
const storageUrlPattern = /storage\/v1\/object\/(?:public|sign)\/([^\/]+)\/(.+)/i

const extractStoragePath = (value) => {
  if (!value) return null
  const match = value.match(storageUrlPattern)
  if (!match) return null
  const bucket = match[1]
  const path = match[2].split('?')[0]
  return bucket === STORAGE_BUCKET ? path : null
}

export const resolveStorageUrl = async (value, expiresIn = 60 * 60) => {
  if (!value) return null

  if (isAbsoluteUrl(value)) {
    const extractedPath = extractStoragePath(value)
    if (!extractedPath) return value
    value = extractedPath
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(value, expiresIn)

  if (error) {
    console.error('Erreur création signed URL Supabase :', error.message || error)
    return null
  }

  return data?.signedUrl || null
}