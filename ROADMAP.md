# Roadmap

Living document: what is done, what is next, and the decisions behind it.
Each work session starts from here.

## Current goal

Make Toro a **working, secure, well-documented application** that holds up to a
technical review (portfolio / internship applications). A public launch to real
students comes after that: see "Before the public launch" below.

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
| 2026-10-18 | Listing cards are text-first (no cover photos); category illustrations are used for the home page category tiles; uploaded photos appear on the detail page only. Demo listings are labelled "Sample". |
| 2026-10-18 | No public e-mail address until the domain exists; `/contact` form delivers to a server-only inbox variable. |
| 2026-10-18 | Portfolio-ready: Inter everywhere (Cormorant only for the logo), one page container, ten categories (+ Pet Care, Translation & Proofreading, Design & Media; Consular shown as Paperwork & Bureaucracy), compact category tiles, CI and unit tests, "All rights reserved" licence. |
| 2026-10-18 | Home refresh: benefit-led hero ("Help from students, around the corner.") with glass search used only in the hero, How it works, provider CTA instead of a waitlist band (waitlist moved to the footer), WCAG AA text contrast. |
| 2026-10-18 | White page background with one light sage band (`toro-sage`). A warm ivory base and a street-grid pattern were tried and rejected. |
| 2026-10-18 | Shapes: buttons, search bars, chips and badges are pills; form fields and textareas are 12 px; cards are 16 px or more. (A 12 px-everywhere version looked dated next to the pill chips.) |
| 2026-10-18 | Home layout: category tiles on the sage band; "How it works" and "Why Toro" merged into one dark section (they repeated the same three-column layout). |
| 2026-10-18 | `main` is protected by a GitHub ruleset: no deletion or force push, changes only through pull requests that pass CI ("Lint, test and build"). No required reviews while there is one maintainer. |
| 2026-10-18 | README kept short (about 75 lines); architecture, decisions and project layout live in `docs/ARCHITECTURE.md`. |
| 2026-10-19 | The build must not need any server secret: the admin client is created on first use (`getSupabaseAdmin()`), and CI builds without secrets. |
| 2026-10-19 | End-to-end tests (Playwright) browse as a logged-out visitor against a production build, read live public data with the anon key, and use the installed Chrome. Logged-in flows stay manual for now (no test accounts in CI). |
| 2026-10-19 | Dependencies: patch security advisories promptly, but prefer releases that are at least two weeks old (Next.js 16.3.8, Playwright 1.63.0). `npm audit --omit=dev` stays at zero. |
| 2026-10-19 | GitHub security: CodeQL default setup and private vulnerability reporting are on; `SECURITY.md` describes how to report. |
| 2026-10-19 | `listings.image_url` may only be null or a file in that listing's own Storage folder (`toro-uploads/listings/{user_id}/{id}/`), enforced by a CHECK constraint and mirrored by `isListingImageUrl` on the detail page. The project URL is written in the migration because Postgres cannot know it (it is public anyway). Storing a path instead of a URL was cleaner but needed an expand/contract migration. Avatars stay unrestricted: Google and LinkedIn avatar URLs are copied at sign-up. |
| 2026-10-19 | Demo URL is `torotorino.vercel.app`; `toro-next.vercel.app` redirects to it. Both stay in the Supabase redirect URLs until a custom domain replaces them. |

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
- [x] All security migrations applied and verified with the anon key; [PR #1](https://github.com/tasdemiroyku/toro/pull/1) merged (2026-10-18)
- [x] Student badge via one-time code to a university e-mail
- [x] Hero video and images optimised (mobile home media 4.9 MB → 35 KB)
- [x] Branded, self-hosted category covers (no Unsplash hot-links)
- [x] Login / sign-up / reset redesign
- [x] Privacy Policy, Terms of Use, contact form (e-mails the founders)
- [x] Demo data seed with Sample labels; branded 404; uploaded photos deleted with the account
- [x] Portfolio polish (PR #4) and home refresh: CI + tests, README showcase, consistent typography/layout, 10 categories
- [x] Visual polish and home layout (PR #6, #8): auth fits the window, white background with a sage band, pill buttons, one How it works section
- [x] Reports and moderation (PR #7): report listings and users, `/admin/reports`, listing removal, admin flag
- [x] Search text escaped in PostgREST filters (PR #9), `next/image` everywhere with zero lint warnings (PR #10)
- [x] Playwright end-to-end smoke tests in CI (PR #11); Next.js 16.3.8 security update (PR #12)
- [x] Branch protection on `main`, CodeQL, private vulnerability reporting, `SECURITY.md`
- [x] Listing photos only from the listing's own Storage folder (S8): migration
      `20261019120000`, detail page check, unit tests

## Before the public launch

Open steps, mostly outside the code:

- [x] Apply `20261019120000_listings_image_url_check.sql` in the Supabase SQL Editor
      (run the check query in its header first; expected 0 rows)
- [ ] Buy a domain, verify it in Resend, then set `RESEND_FROM_EMAIL`, `CONTACT_EMAIL`
      and `SITE_URL` (and add the domain to the Supabase Auth redirect URLs)
- [ ] Send one contact-form message and one report on production to confirm
      `CONTACT_INBOX_EMAIL` and Resend deliver
- [ ] Legal review of `/privacy` and `/terms`
- [ ] `delete from listings where is_sample` (and the three demo accounts)
- [x] GitHub: add the repository variables `NEXT_PUBLIC_SUPABASE_URL` and
      `NEXT_PUBLIC_SUPABASE_ANON_KEY` so the Playwright job runs in CI
- [x] GitHub: upload `docs/social-preview.jpg` under Settings → Social preview

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
| ~~S7~~ | ~~Escape user input used in PostgREST `.or()` search filters~~ (PR #9) | — | — |
| ~~S8~~ | ~~Restrict `listings.image_url` to our Storage bucket with a CHECK constraint~~ (`20261019120000`) | — | — |

## Then — minimum for real users

| # | Feature | Effort | Depends on |
|---|---|---|---|
| ~~F1~~ | ~~Privacy policy + terms of use pages~~ (done; legal review pending) | — | — |
| ~~F2~~ | ~~Report listing / user, founder e-mail, admin view~~ (PR #7) | — | — |
| F3 | Email notification on new message (Resend) | S–M | S4 |
| F4 | Waitlist confirmation e-mail via Resend (table fixed in `20261017120500`) | S | — |
| F5 | i18n: Italian / English / Turkish | L | F1 copy |
| F6 | Turin neighbourhood filter | S | S1 |
| ~~F7~~ | ~~Replace "launching soon" section with real onboarding CTA~~ (home refresh) | — | — |

## Nice to have

- Saved listings, share buttons, image messages, request board, trust badges
- Logged-in end-to-end tests (login → create listing → message) with dedicated test accounts
