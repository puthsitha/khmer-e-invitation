# Deployment (Netlify + Firebase)

## Environments

| Environment | Branch | Netlify context   | Firebase project      |
| ----------- | ------ | ----------------- | ---------------------- |
| Development | `dev`  | Branch deploy      | `khmer-einvite-dev`    |
| UAT         | `uat`  | Branch deploy      | `khmer-einvite-uat`    |
| Production  | `main` | Production deploy  | `khmer-einvite-prod`   |

Netlify builds this Next.js app via `@netlify/plugin-nextjs` (configured in `netlify.toml`). Each branch above maps to its own Netlify deploy context, and each context talks to its own Firebase project so that dev/uat/prod data never mix.

## Setting environment variables in Netlify

1. Go to **Site settings → Environment variables** in the Netlify UI.
2. Add each key from `.env.example` (the `NEXT_PUBLIC_FIREBASE_*` keys).
3. Use the **"Different value per deploy context"** option so `dev`, `uat`, and `production` each point at their own Firebase project's config values.
4. Never commit real values — `.env.local` (git-ignored) is for local development only, populated from `.env.example`.

## Promotion flow

Feature branches → `dev` → `uat` → `main`, matching the branch flow in the project's commit/branching rules.

1. Merge a feature branch into `dev`. Netlify branch-deploys it against the dev Firebase project. Verify the change there.
2. Merge `dev` into `uat` once it's stable. Verify against the UAT Firebase project (closer to production-like data/usage).
3. Merge `uat` into `main` to ship to production.

## Firebase plan: staying on Spark (free)

This project intentionally stays on the **Spark (free) plan** for now (see the master prompt, §2/§2a, and `AGENTS`/project notes for the full reasoning):

- Firestore/Auth usage is far under Spark's daily free quota (50K reads / 20K writes per day) at this app's scale.
- Background video is embedded via unlisted YouTube/Vimeo, never uploaded to Firebase Storage — this avoids the one real cost risk (media bandwidth).
- Storage is only used for size-capped gallery photos and background music; upload limits are enforced in the dashboard UI and in Storage/Firestore security rules (owner-write, public-read).

**Reminder:** periodically check the Firebase console's **Usage** tab (Firestore reads/writes, Storage stored/downloaded) for each project. Spark shuts off a product for the rest of the calendar month if its free quota is exceeded, so catching a climbing trend early matters more than it would on Blaze.

### Upgrade path

If guest traffic or media usage grows, move to the **Blaze** plan with a budget alert (e.g. $5–10) instead of staying on Spark — Blaze still costs $0 until the same free quotas are exceeded, but it doesn't hard-cut the service off mid-event. This is a billing/config change in the Firebase console, not a code rebuild, as long as the app continues to respect the upload limits and security rules already in place.
