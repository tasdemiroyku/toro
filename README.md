# Toro

**A hyperlocal services marketplace for students in Turin (Torino), Italy.**

Students offer and book everyday services from each other: tutoring, cleaning,
help with consular paperwork, elderly care, moving, tech support and language
exchange. The name comes from the *Toret*, Turin's green cast-iron bull fountains.

**Live demo:** https://toro-next.vercel.app

> Status: pre-launch. The core marketplace works end to end. Listings marked
> "Sample" are demo content. Moderation, legal
> pages and translations are on the [roadmap](ROADMAP.md) before opening to
> real users.

## Features

- **Accounts:** e-mail/password, Google and LinkedIn sign-in (Supabase Auth),
  password reset, onboarding with a unique username
- **Listings:** create, edit, pause and delete, with optional cover photos.
  Images are compressed to WebP in the browser before upload.
- **Search:** keyword search over listings and people, category filter,
  server-side pagination with shareable URLs (`?q=`, `?category=`, `?page=`)
- **Public profiles:** `/u/[username]` with bio, languages, skills and active listings
- **Messaging:** a realtime inbox per listing (Supabase Realtime), with read
  receipts and an unread indicator in the header
- **Verified students:** anyone can join; the badge is earned by confirming a
  one-time code sent to a university e-mail (via Resend)
- **Account deletion:** removes the profile, listings, messages, private data and
  uploaded photos (GDPR right to erasure)
- **Legal & contact:** Privacy Policy, Terms of Use and a contact form that
  e-mails the team without exposing an address
- **Fast first load:** optimised hero media, no video on mobile, self-hosted
  SVG category covers (about 4 KB each)

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| UI | React 19 with React Compiler, Tailwind CSS v4, Framer Motion |
| Backend | Supabase: PostgreSQL, Auth, Storage, Realtime |
| Hosting | Vercel |

## Architecture

```
app/<route>/page.jsx        Server Component: auth check, data fetching, metadata
components/<Name>Client.jsx Client Component: interaction, animation, realtime
app/actions/*.js            Server Actions for mutations that need server trust
proxy.js                    Next.js 16 middleware: session refresh, route guards
```

- **Data is fetched on the server.** Pages query Supabase in Server Components
  and pass plain props to client components.
- **Authentication** is verified with `supabase.auth.getUser()` on the server. It is
  checked twice: in `proxy.js` and again inside each protected page.
- **Authorization** is enforced in PostgreSQL with Row Level Security. The browser
  only ever holds the public anon key; ownership is also re-checked in Server Actions.

## Security notes

- **Row Level Security on every table**, versioned in
  [`supabase/migrations/`](supabase/migrations) and verified with the read-only
  queries in [`supabase/audit/`](supabase/audit). The browser only holds the anon
  key; the service-role key is used in one Server Action (account deletion).
- **Private data is separated from public data.** Profiles are public by design, so
  phone numbers live in an owner-only `private_profiles` table. Public pages also
  select an explicit column allow-list (`lib/profile.js`).
- **Least-privilege column grants.** For example, the receiver of a message can
  update only its `read` flag.
- **The database validates input itself.** CHECK constraints cover categories,
  price types and text lengths, so the public API cannot bypass the UI's rules.
- **The Verified Student badge** can only be granted by the server, after the user
  enters a 6-digit code sent to an allow-listed university address. Codes are
  stored as HMACs, expire after 15 minutes, allow 5 attempts and are rate-limited.
  Each university address can verify only one account. Column grants stop clients
  from writing `is_verified`.
- Every post-login redirect goes through `safeRedirectPath()` (`lib/redirect.js`),
  which blocks open redirects such as `//evil.com`.
- Route parameters are validated (UUID and username regexes) before any query runs.
- Next steps, such as rate limiting and moving the remaining client-side writes
  into Server Actions, are tracked in [ROADMAP.md](ROADMAP.md).

## Getting started

Requirements: Node.js 20+ and a Supabase project.

```bash
git clone https://github.com/tasdemiroyku/toro.git
cd toro
npm install
cp .env.example .env.local   # then fill in your Supabase keys
npm run dev                  # http://localhost:3000
```

In the Supabase dashboard:

- Run the files in `supabase/migrations/` in the SQL Editor, in filename order.
  They create the tables, policies, triggers and the `toro-uploads` bucket.
- Enable the Google and LinkedIn (OIDC) providers.
- Add `http://localhost:3000/auth/callback` to the allowed redirect URLs.

| Script | Purpose |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (Next.js Core Web Vitals rules) |

## Project structure

```
app/
  actions/           Server Actions (account, listings, messages, profile)
  api/subscribe/     Waitlist endpoint
  auth/callback/     OAuth code exchange
  inbox/ listings/ login/ onboarding/ profile/ reset-password/ u/[username]/
components/          Client components (<Name>Client.jsx) and shared UI
lib/                 Constants and pure helpers (categories, redirects, profile columns)
utils/supabase/      Browser, server, middleware and admin Supabase clients
utils/upload.js      Image validation, compression and Storage upload
proxy.js             Middleware entry point (Next.js 16 naming)
supabase/migrations/ Versioned schema: tables, RLS policies, triggers, storage
supabase/audit/      Read-only SQL to verify policies and schema
```

## Authors

Built in Turin by Öykü ([@tasdemiroyku](https://github.com/tasdemiroyku), Computer
Engineering, Politecnico di Torino) and Ogi (Business, Università di Torino).
