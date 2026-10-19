# Security policy

Toro is a pre-launch student project, but it handles real accounts, so security
reports are welcome and taken seriously.

## Reporting a vulnerability

Please report privately, not in a public issue:

- **GitHub:** the repository's **Security** tab → **Report a vulnerability**
  (private vulnerability reporting is enabled), or
- **Contact form:** [torotorino.vercel.app/contact](https://torotorino.vercel.app/contact),
  which goes straight to the founders.

Include the affected URL or file, steps to reproduce and the impact you expect.
We aim to reply within 7 days and to fix confirmed issues before discussing them
publicly. Please do not access other people's data, run denial-of-service tests
or send automated traffic to the live site.

## Scope

- The live site and the code in this repository (`main` is what is deployed)
- The database policies in `supabase/migrations/` (Row Level Security, column
  grants, storage policies)

Out of scope: findings that need a compromised device or browser, and reports
from automated scanners without a working proof of concept.

## How the project is protected

- Authorization is enforced in PostgreSQL with Row Level Security; the browser only
  holds the public anon key. The secret key is used only in server code.
- `main` accepts changes only through pull requests that pass CI (lint, unit tests,
  a build without server secrets, Playwright end-to-end tests).
- CodeQL code scanning runs on every pull request; `npm audit --omit=dev` is kept
  at zero known vulnerabilities.
