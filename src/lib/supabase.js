import { createClient } from '@supabase/supabase-js'
import { ATHLETES } from '../data/athletes.js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = (url && key) ? createClient(url, key) : null

// Load all athletes from Supabase. If the table is empty, seed it with the 9 roster athletes.
// Returns: { athletes: [...], status: 'ok' | 'missing-keys' | 'no-table' | 'error', error?: string }
export async function loadAthletes() {
  if (!supabase) return { athletes: [], status: 'missing-keys' }

  try {
    const { data, error } = await supabase.from('athletes').select('id, data').order('id')

    if (error) {
      if (error.code === '42P01') return { athletes: [], status: 'no-table', error: error.message }
      return { athletes: [], status: 'error', error: error.message }
    }

    if (!data || data.length === 0) {
      const seed = ATHLETES.map(a => ({ id: a.id, data: a }))
      const { error: seedErr } = await supabase.from('athletes').upsert(seed)
      if (seedErr) return { athletes: ATHLETES, status: 'ok', error: `Using local roster (seed failed: ${seedErr.message})` }
      return { athletes: ATHLETES, status: 'ok' }
    }

    const byId = Object.fromEntries(data.map(r => [r.id, r.data]))
    const ordered = ATHLETES.map(a => byId[a.id] || a)
    return { athletes: ordered, status: 'ok' }
  } catch (e) {
    return { athletes: ATHLETES, status: 'error', error: e.message }
  }
}

export async function loadAthleteSessions(athleteId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('id, athlete_id, date, category, data, created_at')
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false })
    if (error) return []
    return data || []
  } catch {
    return []
  }
}
