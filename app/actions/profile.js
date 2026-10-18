'use server'

import { createClient } from '@/utils/supabase/server'

// Mirrors the CHECK constraints in supabase/migrations
const PHONE_RE = /^\+?[0-9 ()-]{6,20}$/
const MAX_LANGUAGES = 15

// Trim, cap the length and store empty strings as NULL
function cleanText(value, maxLength) {
  if (typeof value !== 'string') return null
  return value.trim().slice(0, maxLength) || null
}

/**
 * Saves the "Personal Info" section of profile settings.
 * Public fields go to `profiles`; the phone number goes to `private_profiles`,
 * which only its owner can read.
 * Returns { error } instead of throwing so the message reaches the UI in production.
 */
export async function savePersonalInfo({ fullName, bio, languages, skills, phoneNumber }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in again.' }

  const phone = cleanText(phoneNumber, 20)
  if (phone && !PHONE_RE.test(phone)) {
    return { error: 'Please enter a valid phone number.' }
  }

  const cleanLanguages = Array.isArray(languages)
    ? languages.filter(l => typeof l === 'string' && l.length <= 30).slice(0, MAX_LANGUAGES)
    : []

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: cleanText(fullName, 100),
      bio:       cleanText(bio, 300),
      languages: cleanLanguages,
      skills:    cleanText(skills, 300),
    })
    .eq('id', user.id)

  if (profileError) return { error: 'Could not save your profile.' }

  const { error: privateError } = await supabase
    .from('private_profiles')
    .upsert({ id: user.id, phone_number: phone, updated_at: new Date().toISOString() })

  if (privateError) return { error: 'Could not save your phone number.' }

  return { success: true }
}
