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

Commands: `npm run dev`, `npm run build`, `npm run lint`. Before committing, both
`build` and `lint` must pass with zero errors. `<img>` warnings are accepted for now.

## Structure

```
app/
  actions/account.js       deleteUserAccount (uses admin client)
  actions/listings.js      deleteListing, toggleListingActive
  actions/messages.js      sendMessage
  actions/profile.js       savePersonalInfo (phone → private_profiles)
  api/subscribe/route.js   waitlist insert into `subscribers`
  auth/callback/route.js   OAuth code exchange → onboarding or ?next
  inbox/                   realtime inbox
  listings/                browse (paginated), [id] detail, [id]/edit, create, my
  login/  reset-password/  onboarding/
  profile/page.jsx         redirects to /u/[username] or /onboarding
  profile/edit/            settings (personal, academic, security, delete account)
  u/[username]/            public profile
  layout.js                fetches user server-side, renders Header/Footer
components/                <Name>Client.jsx per route + Header, Footer, ToretBull, ToroLoader
lib/categories.js          CATEGORIES, CATEGORY_LABEL, CATEGORY_DEFAULT_IMAGE, PRICE_TYPES, PRICE_TYPE_LABEL
lib/profile.js             PUBLIC_PROFILE_COLUMNS
lib/redirect.js            safeRedirectPath()
lib/site.js                SITE_URL, SITE_HOST (the only place the domain is written)
utils/supabase/            client.js, server.js, proxy.js (session helper), admin.js (secret key)
utils/upload.js            image validation, WebP compression, Storage upload
proxy.js                   middleware entry point (Next.js 16 name)
supabase/migrations/       versioned SQL schema, RLS policies, triggers
supabase/audit/            read-only catalog queries to verify RLS and schema
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
  Server Actions, never imported by client code. Only `NEXT_PUBLIC_*` vars may
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
- **private_profiles** (owner-only RLS): id → profiles, phone_number, updated_at.
  Anything a stranger must not see goes here, never in `profiles`.
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
- **subscribers:** email (lowercase, unique). anon/authenticated may INSERT only;
  nobody can read it through the API.
- **is_verified** is computed by `set_profile_verification()` (profiles trigger)
  and `sync_profile_verification()` (auth.users trigger): confirmed e-mail +
  `is_student_email()` allowlist. Never set it from app code.
- **Storage:** public bucket `toro-uploads` (5 MB, images only). Paths
  `avatars/{uid}/…` and `listings/{uid}/{listingId}/…`; users can write, read
  and list only their own folder; files are served by public URL.

Column conventions: snake_case, booleans `is_*`, timestamps `*_at`, FKs `{table}_id`.
Adding a category or price type needs both `lib/categories.js` and a migration
updating the CHECK constraint.

## Design system

- Colors are Tailwind tokens only: `toro-dark` #132600, `toro-gold` #C9963E,
  `toro-light` #FAFAF7. No raw hex in `className`.
- Fonts: headings use `var(--font-cormorant)` (Cormorant Garamond 600/700);
  body is system sans.
- Global classes (`app/globals.css`): `.toro-input` (every input, textarea and
  select), `.toro-btn-primary`, `.toro-btn-gold`, `.toro-btn-outline`,
  `.toro-card`, `.toro-empty-state`.
- Shapes: inputs and buttons `rounded-full`; cards and modals `rounded-2xl` or
  `rounded-[2rem]`. Borders are thin and solid (`border-toro-dark/10`), **never dashed**.
- Listing covers always fall back to a category image:
  `listing.image_url || CATEGORY_DEFAULT_IMAGE[listing.category] || null`.
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
- Default cover images are Unsplash URLs; replace them with self-hosted assets
  before launch.
- i18n (IT/EN/TR) is planned. All UI text is English today, while `<html lang="it">`.
