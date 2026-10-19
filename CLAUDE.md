# CLAUDE.md

Project rules and memory for AI coding assistants working on Toro.
Read this first, then [ROADMAP.md](ROADMAP.md) for what to work on next.

## Project

Toro is a services marketplace for students in Turin (tutoring, cleaning,
consular paperwork, elderly care, moving, tech help, language exchange).
Founders: Öykü (computer engineering, Politecnico) and Ogi (business, UniTO).
Status: pre-launch. Current goal: a working, secure, well-documented app that holds
up to a technical review; public launch later. Production URL: `SITE_URL` in `lib/site.js`.

## Working agreement

- Reply to the user in **Turkish**; keep all code, comments, commit messages and
  docs in **English**.
- Show a plan and wait for approval before writing code. Work step by step.
- One small, focused commit per change. Work on a branch, not directly on `main`.
- Explain briefly what each change does and why; the user wants to understand the code.
- Ask when unsure. Do not refactor working code outside the requested scope.
- Keep [ROADMAP.md](ROADMAP.md) current: tick finished items, record decisions.

## Stack

Next.js 16.2 (App Router, Turbopack, React Compiler) · React 19 · JavaScript (no
TypeScript, deliberate) · Tailwind CSS v4 · Framer Motion 12 · Supabase (Postgres,
Auth with e-mail + Google + LinkedIn OIDC, Storage, Realtime) · Resend (installed,
not used yet) · Vercel.

Commands: `npm run dev`, `npm run build`, `npm run lint`, `npm test`. Before
committing, build, lint and tests must pass with zero errors and zero warnings.
Images use `next/image`; pass `unoptimized={!canOptimizeImage(src)}` (`lib/images.js`)
for user-provided URLs. GitHub Actions (`.github/workflows/ci.yml`) runs the same checks
on every PR with placeholder env values.

## Structure

```
app/
  actions/account.js       deleteUserAccount (uses admin client)
  actions/listings.js      deleteListing, toggleListingActive
  actions/messages.js      sendMessage
  actions/profile.js       savePersonalInfo (phone → private_profiles)
  actions/verification.js  requestStudentCode, confirmStudentCode (admin client + Resend)
  actions/contact.js       sendContactMessage → CONTACT_INBOX_EMAIL
  actions/reports.js       reportContent (validation, daily limit, founders e-mail)
  actions/moderation.js    resolveReport (admin only)
  admin/reports/           moderation page (404 for non-admins)
  privacy/ terms/ contact/ static legal pages and contact form
  not-found.jsx            branded 404
  api/subscribe/route.js   waitlist insert into `subscribers`
  auth/callback/route.js   OAuth code exchange → onboarding or ?next
  inbox/                   realtime inbox
  listings/                browse (paginated), [id] detail, [id]/edit, create, my
  login/  reset-password/  onboarding/
  profile/page.jsx         redirects to /u/[username] or /onboarding
  profile/edit/            settings (personal, academic, security, delete account)
  u/[username]/            public profile
  layout.js                fetches user server-side, renders Header/Footer
components/                <Name>Client.jsx per route + shared UI: Header, Footer, AuthShell (auth split layout),
                           LegalPage, ListingCard (every listing grid), Avatar, CategoryIcon, PasswordStrength,
                           SampleBadge, ToretBull
lib/categories.js          CATEGORIES (value, label, examples, icon), CATEGORY_LABEL, CATEGORY_ICON, PRICE_TYPES
lib/password.js            PASSWORD_RULES, isStrongPassword (mirrors Supabase Auth policy)
lib/profile.js             PUBLIC_PROFILE_COLUMNS
lib/redirect.js            safeRedirectPath()
lib/site.js                SITE_URL, SITE_HOST, CONTACT_EMAIL, LEGAL_LAST_UPDATED
utils/supabase/            client.js, server.js, proxy.js (session helper), admin.js (getSupabaseAdmin, secret key)
utils/upload.js            image validation, WebP compression, Storage upload
utils/email.js             sendEmail() via Resend (server-only)
proxy.js                   middleware entry point (Next.js 16 name)
supabase/migrations/       versioned SQL schema, RLS policies, triggers
supabase/audit/            read-only catalog queries to verify RLS and schema
supabase/seed/             demo data (listings.is_sample = true)
tests/                     node:test unit tests (redirects, password policy, categories ↔ DB CHECK)
.github/workflows/ci.yml   lint → test → build
docs/screenshots/          README images
public/images/             optimised media: hero.mp4, hero-poster.jpg, torino-river.jpg, og-image.jpg, toret/*.jpg
```

## Architecture rules

- **Server/Client split:** `app/<route>/page.jsx` is a Server Component that checks
  auth, fetches data and passes props; `components/<Name>Client.jsx` handles
  interaction, animation and realtime. Do not fetch in a client component when a
  server parent can.
- **Middleware is `proxy.js`** and exports `proxy` and `config` directly (no
  re-exports). **Never create `middleware.js`**: Next.js 16 fails if both exist.
  It guards `/profile`, `/listings/create`, `/listings/my`, `/listings/[id]/edit`
  and `/inbox`, and sends users without a username (from JWT `user_metadata`) to
  `/onboarding`.
- **Defense in depth:** protected pages also call `getUser()` and redirect.
- **Imports:** always the `@/` alias, never `../../`.
- **Naming:** pages `page.jsx`, client components `PascalCaseClient.jsx`, utilities
  `camelCase.js`, SQL `supabase/migrations/YYYYMMDDHHMMSS_snake_case.sql`.
- Call `router.refresh()` (client) or `revalidatePath()` (server) after every mutation.

## Security rules

- Use `supabase.auth.getUser()` on the server. **Never** use `getSession()`.
- RLS stays enabled on every table. The admin (secret key) client is used only in
  server code (Server Actions, server pages), never imported by client code. Call
  `getSupabaseAdmin()` inside the function, never at module level: the build must
  not need any server secret (CI builds without them). Only `NEXT_PUBLIC_*` vars may
  reach the browser.
- Validate route params before querying: UUID regex for ids,
  `/^[a-z0-9_]{3,30}$/` for usernames.
- Every redirect target from user input goes through `safeRedirectPath()`.
- Never select `profiles(*)` or `select('*')` on someone else's profile. Use
  `PUBLIC_PROFILE_COLUMNS`. `phone_number` is private.
- New mutations go in Server Actions with server-side validation, not direct
  client-side `insert`/`update`. Legacy client writes are tracked in ROADMAP (S4).
- Keep SQL in `supabase/migrations/`, never in JS files.

## Database

Schema lives in `supabase/migrations/` (timestamped SQL, applied by hand in the
Supabase SQL Editor; `…120000_baseline.sql` mirrors what was live on 2026-10-17
and is not re-run). Wrap each migration in `begin; … commit;`. Breaking changes go
expand → deploy app → contract (see the phone-number migrations). After schema
changes, re-run `supabase/audit/*.sql` (read-only) to confirm the result.

- **profiles** (world-readable): id (= auth.users.id), username (unique,
  `^[a-z0-9_]{3,30}$`), full_name ≤100, avatar_url, bio ≤300, languages text[] ≤15,
  location ≤100, skills ≤300, university ≤150, department ≤150, is_verified,
  created_at. Row created by `handle_new_user()` on auth signup.
- **private_profiles** (owner-only RLS): id → profiles, phone_number, updated_at,
  student_email (unique), student_verified_at. Anything a stranger must not see
  goes here, never in `profiles`. Clients may write only phone_number/updated_at.
- **student_verifications** (service role only, no client grants): pending
  codes as HMAC (`VERIFICATION_CODE_SECRET`), attempts, expires_at, consumed_at.
- **listings:** id, user_id → profiles, title ≤100, description ≤1000, category
  (CHECK = `lib/categories.js` values), price 0–10000, price_type (CHECK), location,
  languages, is_active, image_url, created_at. Anyone sees active rows; owners see
  and edit their own.
- **messages:** id, listing_id, sender_id, receiver_id, content 1–500, read,
  created_at. Participants read; inserts must concern a listing owned by sender or
  receiver (`listing_belongs_to_either()`); receivers may UPDATE only `read`
  (column grant). In the `supabase_realtime` publication. FK names
  `messages_listing_id_fkey`, `messages_sender_id_fkey` and
  `messages_receiver_id_fkey` must stay exact: the inbox query uses them as
  PostgREST join hints.
- **reports:** reporter_id, target_type (listing|user), target_id, reason (CHECK =
  `lib/reports.js`), details ≤1000, status (open|dismissed|actioned), resolved_at/by.
  Insert-only for the reporter; read and resolved only with the service role on
  `/admin/reports` (`getAdminUser` in `utils/supabase/adminGuard.js`, admins have
  `private_profiles.is_admin`).
- **Moderation:** `listings.is_removed` (+ removed_reason, removed_at) hides a listing
  from everyone but its owner; listing insert/update grants are column lists that
  exclude these columns. Add new editable listing columns to those grants.
- **subscribers:** email (lowercase, unique). anon/authenticated may INSERT only;
  nobody can read it through the API.
- **is_verified** is granted only by `confirmStudentCode` (service role) after a
  code sent to an `is_student_email()` address is confirmed. The sign-up e-mail
  is irrelevant. Client column grants on `profiles` exclude it — when adding an
  editable profile column, add it to the grants in a migration too.
- **Storage:** public bucket `toro-uploads` (5 MB, images only). Paths
  `avatars/{uid}/…` and `listings/{uid}/{listingId}/…`; users can write, read
  and list only their own folder; files are served by public URL.

Column conventions: snake_case, booleans `is_*`, timestamps `*_at`, FKs `{table}_id`.
Adding a category or price type needs both `lib/categories.js` and a migration
updating the CHECK constraint.

## Design system

- Colors are Tailwind tokens only: `toro-dark` #132600, `toro-gold` #C9963E,
  `toro-light` #FFFFFF (page background, light text on dark), `toro-sage` #EEF1E8
  (light sage section bands). Cards on white need a thin border. No raw hex in
  `className`. Gold buttons use dark text.
- Fonts: **Inter** (`font-sans`) for all text, headings included (bold +
  `tracking-tight` for page and section titles). Cormorant (`font-logo`) is only for
  the "Toro" wordmark. Both come from next/font in `app/layout.js`.
- Layout: every page-level block uses `.toro-container` (max-w-6xl, px-6) so the
  header, sections and footer line up. Do not use other max-widths for sections.
- Global classes (`app/globals.css`): `.toro-input` (every input, textarea and
  select), `.toro-btn-primary`, `.toro-btn-gold`, `.toro-btn-outline`,
  `.toro-card`, `.toro-empty-state`.
- Shapes: what you click is a pill (`rounded-full`): buttons (via `.toro-btn-*`),
  search bars and the button inside them, chips, tags, badges and avatars. What you
  type in is `rounded-xl` (12 px, via `.toro-input`, textareas too). Cards and
  modals `rounded-2xl` or `rounded-[2rem]`. Borders are thin and solid (`border-toro-dark/10`), **never dashed**.
- People: always render `<Avatar profile={…} />` (photo, or initials on a colour
  derived from the profile id), never ad-hoc initials.
- Photos: use our own (`public/images/toret/` are stills from our Toret footage).
  No stock photos and no recognisable faces or children.
- Listing grids always use `<ListingCard />`: text-first, with the category icon,
  provider and price, and no cover photo. An uploaded `image_url` is shown only
  on the listing detail page, with no stock fallback. Horizontal carousels use
  native scroll with `scroll-snap` (see Latest services in HomeClient).
- Copy: plain punctuation, no em dashes (—) in UI text.
- Contrast: informational secondary text is at least `text-toro-dark/65`
  (`text-toro-light/65` on dark), which passes WCAG AA. Lighter values only for
  decoration. Keyboard focus uses the global gold `:focus-visible` outline.
- Glass effects (backdrop-blur, white/10 fills) belong to the hero only.
- Empty states use the `.toro-empty-state` pattern: ToretBull icon, heading,
  short text, CTA.
- Never define CATEGORIES or PRICE_TYPES locally. Import them from `@/lib/categories`.

## Gotchas

- **Inbox layout:** the outer wrapper is `height: calc(100dvh - 72px)`. Every flex
  child carries `min-h-0`. The message list is `flex-1 min-h-0 overflow-y-auto`.
  `scrollIntoView` must use `block: 'nearest'`, otherwise the window scrolls. If
  the header height changes, update the 72px.
- **Inbox state:** `InboxClient` owns all messages and one realtime channel
  (`receiver_id = me`). `ThreadView` derives its list from props and keeps only
  optimistic sends locally.
- **React Compiler lint:** `react-hooks/set-state-in-effect` is an error. Adjust
  state during render (store the previous value) or move the update into an event
  handler.
- Media: keep files in `public/images/`, optimised before committing (hero video
  ≤1 MB H.264 without audio, photos ≤200 KB). The hero video only loads on
  ≥768 px screens with motion allowed (`HeroBackground` in HomeClient).
- Adding a category: add it to `lib/categories.js` (with `examples` and `icon`)
  **and** a migration updating `listings_category_check`; `npm test` fails if
  they disagree.
- Passwords: validate with `isStrongPassword` and show `<PasswordStrength />`
  (the requirements checklist). Keep `lib/password.js` in sync with the Supabase
  Auth password settings.
- Auth pages (AuthShell): on desktop exactly one viewport tall
  (`grid-rows-[minmax(0,1fr)]`); the form column is `relative`, starts at a fixed
  offset (never vertically centred, or the heading jumps between modes) and scrolls
  on its own.
- Home header: `position: fixed`, large and transparent at the top, compact after
  80 px (large again under 20 px). Never resize it with scroll-linked values; that
  changed the layout and bounced.
- Demo listings have `is_sample = true` and show `<SampleBadge />`.
- i18n (IT/EN/TR) is planned. All UI text is English today (`<html lang="en">`).
