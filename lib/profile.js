/**
 * lib/profile.js
 *
 * Columns of `profiles` that are safe to send to any visitor.
 * Use this instead of `profiles(*)` whenever the profile is not the viewer's own:
 * a wildcard select would ship private fields (e.g. phone_number) to the browser.
 */
export const PUBLIC_PROFILE_COLUMNS =
  'id, username, full_name, avatar_url, bio, languages, location, skills, university, department, is_verified, created_at'
