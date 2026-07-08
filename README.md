# Khmer E-Invitation

A fully responsive Next.js (TypeScript) web app for creating and sending beautiful, animated digital invitations in a Khmer cultural style — starting with wedding, then extensible to birthday and special event categories.

## Tech stack

- **Framework**: Next.js 16 (App Router), TypeScript
- **Styling/Animation**: Tailwind CSS + Framer Motion, custom Khmer (`Moul`, `Kantumruy Pro`) + Latin (`Playfair Display`, `Inter`) fonts via `next/font`
- **i18n**: `next-intl`, Khmer (`km`) default / English (`en`) secondary, locale-prefixed routes
- **Backend**: Firebase (Auth, Firestore, Storage) on the Spark (free) plan — see `DEPLOYMENT.md`
- **Deploy target**: Netlify (`@netlify/plugin-nextjs`)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Firebase project's config
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to the default Khmer locale at `/km`.

## Project structure

```
src/
  app/[locale]/        # locale-prefixed routes (km default, en secondary)
    i/[invitationSlug]/  # public viewer site
    dashboard/           # authenticated user (couple/host) site
    admin/               # authenticated admin site
  components/
    ui/                  # shared UI primitives
    sections/            # invitation viewer sections (Phase 4+)
  i18n/                  # next-intl routing/navigation/request config
  lib/firebase/          # Firebase SDK client setup
  types/                 # shared TypeScript types (data model)
messages/                # km.json / en.json translation catalogs
.claude/
  commands/              # /debug, /fix-and-review
  skills/frontend-design/ # this project's visual/animation system
```

## Commit convention

Commit messages are validated by a `commit-msg` git hook — see `docs/COMMIT_CONVENTION.md`. The hook is installed automatically on `npm install` via the `prepare` script (`git config core.hooksPath .githooks`).

## Deployment

See `DEPLOYMENT.md` for the dev/uat/production branch → Netlify → Firebase project mapping and promotion flow.
