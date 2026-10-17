# Toro

**A hyperlocal services marketplace for students in Turin (Torino), Italy.**

Students offer and book everyday services from each other: tutoring, cleaning,
help with consular paperwork, elderly care, moving, tech support and language
exchange. The name comes from the *Toret*, Turin's green cast-iron bull fountains.

**Live demo:** https://toro-next.vercel.app

> Status: pre-launch. The core marketplace works end to end. Moderation, legal
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
- **Verified students:** a badge for accounts registered with a university e-mail
- **Account deletion:** removes the profile and the auth user (GDPR right to erasure)

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

- Database access from the browser relies on Row Level Security. The service-role key
  is used only in one Server Action (account deletion) and never reaches the client.
- Public pages select an explicit allow-list of profile columns
  (`lib/profile.js`), so private fields such as phone numbers are never
  serialised into HTML.
- Every post-login redirect goes through `safeRedirectPath()` (`lib/redirect.js`),
  which blocks open redirects such as `//evil.com`.
- Route parameters are validated (UUID and username regexes) before any query runs.
- Planned hardening work is tracked in [ROADMAP.md](ROADMAP.md): versioning and
  auditing the RLS policies, rate limiting, and server-side validation for every
  mutation.

## Getting started

Requirements: Node.js 20+ and a Supabase project.

```bash
git clone https://github.com/tasdemiroyku/toro-next.git
cd toro-next
npm install
cp .env.example .env.local   # then fill in your Supabase keys
npm run dev                  # http://localhost:3000
```

In the Supabase dashboard:

- Enable the Google and LinkedIn (OIDC) providers.
- Add `http://localhost:3000/auth/callback` to the allowed redirect URLs.
- Create a public storage bucket named `toro-uploads`.

| Script | Purpose |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (Next.js Core Web Vitals rules) |

## Project structure

```
app/
  actions/           Server Actions (account, listings, messages)
  api/subscribe/     Waitlist endpoint
  auth/callback/     OAuth code exchange
  inbox/ listings/ login/ onboarding/ profile/ reset-password/ u/[username]/
components/          Client components (<Name>Client.jsx) and shared UI
lib/                 Constants and pure helpers (categories, redirects, profile columns)
utils/supabase/      Browser, server, middleware and admin Supabase clients
utils/upload.js      Image validation, compression and Storage upload
proxy.js             Middleware entry point (Next.js 16 naming)
```

## Authors

Built in Turin by Öykü ([@tasdemiroyku](https://github.com/tasdemiroyku), Computer
Engineering, Politecnico di Torino) and Ogi (Business, Università di Torino).
