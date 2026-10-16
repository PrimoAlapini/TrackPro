/**
 * Public API functions for read-only access without authentication
 * Uses direct REST API calls to bypass RLS policies
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
}

async function publicFetch<T>(table: string, options: RequestOptions = {}): Promise<T> {
  const url = `${SUPABASE_URL}/rest/v1/${table}`
  
  const headers = {
    'apikey': SUPABASE_KEY,
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
  }

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, fetchOptions)
  
  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`)
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function getPublicDossiers() {
  return publicFetch('dossiers?order=created_at.desc')
}

export async function getPublicPieces(dossierId?: string) {
  if (dossierId) {
    return publicFetch(`pieces?dossier_id=eq.${dossierId}&order=ordre.asc`)
  }
  return publicFetch('pieces?order=ordre.asc')
}

export async function getPublicSuiviPieces(dossierId?: string) {
  if (dossierId) {
    return publicFetch(`suivi_pieces?dossier_id=eq.${dossierId}`)
  }
  return publicFetch('suivi_pieces')
}

export async function getPublicMembers() {
  return publicFetch('membres?order=nom.asc')
}
