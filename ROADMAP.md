# Roadmap

Living document: what is done, what is next, and the decisions behind it.
Each work session starts from here.

## Current goal

Make Toro a **working, secure, well-documented application** that holds up to a
technical review (portfolio / internship applications). A public launch to real
students comes after that, once moderation and legal pages are in place.

## Decisions

| Date | Decision |
|---|---|
| 2026-10-17 | Prioritise security and code quality over new features. |
| 2026-10-17 | No partner names or logos until there is a formal agreement with an institution. |
| 2026-10-17 | The university picker in profile settings stays: it is user-provided data, not an endorsement. |
| 2026-10-17 | Work happens on short-lived branches, one small commit per change, English commit messages. |
| 2026-10-17 | AGENTS.md is merged into CLAUDE.md; CLAUDE.md is the single source of project rules. |

## Done

- [x] Inbox realtime fix, edit-form image cleanup, delete button state
- [ ] Remove unverified partnership claims from the footer and home page
- [ ] Lint passes with zero errors
- [ ] Stop sending private profile fields (phone number) to public pages
- [ ] Block protocol-relative open redirects (`//evil.com`)
- [ ] README and `.env.example`
- [ ] Clean repository structure, rewrite CLAUDE.md

## Next — security hardening (do before anything else)

| # | Task | Effort | Depends on |
|---|---|---|---|
| S1 | Export the live Supabase schema + RLS policies into `supabase/migrations/` so they are versioned | M | Supabase dashboard / CLI access |
| S2 | Audit RLS on `profiles`, `listings`, `messages`, `subscribers` and storage; test with the anon key | M | S1 |
| S3 | Hide `phone_number` at the database level (column privileges or a public view), not only in queries | S | S1 |
| S4 | Move listing create/edit and inbox sends into Server Actions with server-side validation | M | — |
| S5 | Rate limiting on messages, listing creation and `/api/subscribe` (Postgres function or Upstash) | M | S4 |
| S6 | Confirm student verification (`is_verified`) runs only server-side with a strict domain allowlist | S | S1 |
| S7 | Escape user input used in PostgREST `.or()` search filters | S | — |

## Then — minimum for real users

| # | Feature | Effort | Depends on |
|---|---|---|---|
| F1 | Privacy policy + terms of use pages (GDPR), working footer links | S (text needs legal review) | — |
| F2 | Report listing / user + founder email via Resend + simple admin view | M | S2, S4 |
| F3 | Email notification on new message (Resend) | S–M | S4 |
| F4 | Waitlist confirmation email (Resend) or remove the "check your email" copy | S | — |
| F5 | i18n: Italian / English / Turkish | L | F1 copy |
| F6 | Turin neighbourhood filter | S | S1 |
| F7 | Replace "launching soon" section with real onboarding CTA | S | F1, F2 |

## Nice to have

- Saved listings, share buttons, image messages, request board, trust badges
- Automated tests (Playwright smoke test for login → create listing → message)
- `next/image` for remote images (currently plain `<img>`; lint warnings only)
