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
| 2026-10-17 | Project renamed from `toro-next` to `toro` (repo, package, folder). Domain change pending; `lib/site.js` holds the URL. |
| 2026-10-17 | Phone numbers live in an owner-only `private_profiles` table (not dropped), kept for future contact features. |
| 2026-10-17 | Anyone can sign up with any e-mail. The student badge needs a code sent to a university e-mail (not the sign-up address). One university address per account. |
| 2026-10-17 | Commits keep the `Co-Authored-By: Claude` trailer (transparency). From now on: feature branch → PR with description → merge. |
| 2026-10-17 | Schema changes are SQL files in `supabase/migrations/`, written in the repo and applied by hand in the Supabase SQL Editor. Breaking changes use expand → deploy → contract. |

## Done

- [x] Inbox realtime fix, edit-form image cleanup, delete button state
- [x] Remove unverified partnership claims from the footer and home page
- [x] Lint passes with zero errors
- [x] Stop sending private profile fields (phone number) to public pages
- [x] Block protocol-relative open redirects (`//evil.com`)
- [x] README and `.env.example`
- [x] Clean repository structure, rewrite CLAUDE.md
- [x] Verified on production: no `phone_number` in page HTML
- [x] RLS audit of all tables and storage (two catalog queries, 2026-10-17)
- [x] Migrations written: baseline, messages hardening, realtime, private phone table, verification trigger, policy cleanup, subscribers, constraints

## In progress — apply the migrations (branch `security/rls-hardening`)

1. ✅ `20261017120100` … `20261017120600` applied (2026-10-17)
2. ✅ `20261017130000_student_code_verification.sql` applied
3. ✅ Vercel environment variables set (`VERIFICATION_CODE_SECRET`, `RESEND_FROM_EMAIL`)
4. Merge [PR #1](https://github.com/tasdemiroyku/toro/pull/1) → Vercel deploys the code that uses `private_profiles`
5. Run `20261017120700_drop_profiles_phone_number.sql`
6. Re-run `supabase/audit/*.sql` and test: messages, profile save, avatar upload,
   waitlist, student verification
7. Buy a domain and verify it in Resend, otherwise codes reach only the Resend
   account owner

## Audit findings (2026-10-17)

| Finding | Fix |
|---|---|
| Receivers could edit any column of a received message | `20261017120100` |
| `messages` was not in the realtime publication, so live inbox updates never fired | `20261017120150` |
| `phone_number` readable by anyone through the API | `20261017120200`, `…700` |
| Messages could be sent about unrelated listings | `20261017120100` |
| Two conflicting verification triggers; suffix match; unconfirmed e-mails verified | `20261017120300` |
| Duplicate profile and legacy storage policies; bucket listing open to all | `20261017120400` |
| `subscribers` table missing, so the waitlist always failed | `20261017120500` |
| No DB checks for category/price type, nullable flags, duplicate username check, unindexed FKs | `20261017120600` |

## Next — security hardening (do before anything else)

| # | Task | Effort | Depends on |
|---|---|---|---|
| ~~S1~~ | ~~Version the live schema in `supabase/migrations/`~~ (baseline) | — | — |
| ~~S2~~ | ~~Audit RLS on all tables and storage~~ | — | — |
| ~~S3~~ | ~~Hide `phone_number` at the database level~~ (`private_profiles`) | — | — |
| S4 | Move listing create/edit, inbox sends, academic info and avatar URL saves into Server Actions (personal info done) | M | — |
| S5 | Rate limiting on messages, listing creation and `/api/subscribe` (Postgres function or Upstash) | M | S4 |
| ~~S6~~ | ~~Server-side student verification with a strict allowlist~~ | — | — |
| S7 | Escape user input used in PostgREST `.or()` search filters | S | — |

## Then — minimum for real users

| # | Feature | Effort | Depends on |
|---|---|---|---|
| F1 | Privacy policy + terms of use pages (GDPR), working footer links | S (text needs legal review) | — |
| F2 | Report listing / user + founder email via Resend + simple admin view | M | S2, S4 |
| F3 | Email notification on new message (Resend) | S–M | S4 |
| F4 | Waitlist confirmation e-mail via Resend (table fixed in `20261017120500`) | S | — |
| F5 | i18n: Italian / English / Turkish | L | F1 copy |
| F6 | Turin neighbourhood filter | S | S1 |
| F7 | Replace "launching soon" section with real onboarding CTA | S | F1, F2 |

## Nice to have

- Saved listings, share buttons, image messages, request board, trust badges
- Automated tests (Playwright smoke test for login → create listing → message)
- `next/image` for remote images (currently plain `<img>`; lint warnings only)
