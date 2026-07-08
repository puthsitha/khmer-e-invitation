# Deployment (Netlify + Firebase)

## Environments

| Environment | Branch | Netlify context   | Firebase project      |
| ----------- | ------ | ----------------- | ---------------------- |
| Development | `dev`  | Branch deploy      | `einvitation-2ff36` (Firebase project "eInvitation")    |
| UAT         | `uat`  | Branch deploy      | *(not yet created — placeholder `khmer-einvite-uat`)*    |
| Production  | `main` | Production deploy  | *(not yet created — placeholder `khmer-einvite-prod`)*   |

Only the dev project exists so far. Create the UAT/production Firebase projects when you're ready to promote past dev, then update `.firebaserc` and this table with their real project IDs (Firebase auto-generates the ID from the name you pick, so it won't necessarily match the placeholder above).

Netlify builds this Next.js app via `@netlify/plugin-nextjs` (configured in `netlify.toml`). Each branch above maps to its own Netlify deploy context, and each context talks to its own Firebase project so that dev/uat/prod data never mix.

## Setting environment variables in Netlify

1. Go to **Site settings → Environment variables** in the Netlify UI.
2. Add each key from `.env.example` (the `NEXT_PUBLIC_FIREBASE_*` keys).
3. Use the **"Different value per deploy context"** option so `dev`, `uat`, and `production` each point at their own Firebase project's config values.
4. Never commit real values — `.env.local` (git-ignored) is for local development only, populated from `.env.example`.

## Firebase project setup (per environment)

For each Firebase project (dev is `einvitation-2ff36`; create UAT/production the same way when needed):

1. **Enable Auth providers**: Firebase console → Authentication → Sign-in method → enable **Email/Password** and **Google**.
2. **Create a Firestore database** (production mode) and a **Storage bucket** in the same console.
3. **Copy the web app config** (Project settings → General → Your apps) into the matching Netlify context's `NEXT_PUBLIC_FIREBASE_*` environment variables.
4. **Deploy security rules** — `firestore.rules` and `storage.rules` in this repo are the source of truth (owner-write / public-read, enforcing the upload caps from §2a). Deploy with the Firebase CLI (already a dev dependency):

   ```bash
   npx firebase login
   npm run firebase:rules:dev    # or :uat / :prod
   ```

   `.firebaserc` maps the `dev`/`uat`/`production` aliases to the three project IDs above.

   `firebase.json`'s `storage.bucket` is currently hardcoded to the dev bucket (`einvitation-2ff36.firebasestorage.app`) — the Firebase CLI needs an explicit bucket name to resolve `storage:rules` deploys, and there's only one real project so far. When UAT/production projects exist, switch `firebase.json`'s `storage` config to the [multi-target array form](https://firebase.google.com/docs/cli/targets) (one `{ "target": ..., "bucket": ..., "rules": "storage.rules" }` per environment, applied via `firebase target:apply storage <name> <bucket>`) instead of a single hardcoded bucket.

## Bootstrapping the first admin

Every account created through `/register` (or Google sign-in) always gets `role: "user"` — both the client code and `firestore.rules` enforce this, so there's no self-serve way to become an admin. The very first admin per environment has to be promoted manually:

1. Register a normal account through the app's `/register` page.
2. Firebase Console → the environment's project → **Firestore Database** → `users` collection → find the document for that account (match by the `email` field; the document ID is the user's UID).
3. Edit the `role` field from `"user"` to `"admin"` and save. Console edits bypass security rules, so this works even though the app itself blocks self-promotion.
4. Log out and back in at `/login` — the app now redirects admins straight to `/admin`.

After that first admin exists, promote any further admins from inside the app at `/admin/users` ("Make admin") instead of editing Firestore directly.

## Promotion flow

Feature branches → `dev` → `uat` → `main`, matching the branch flow in the project's commit/branching rules.

1. Merge a feature branch into `dev`. Netlify branch-deploys it against the dev Firebase project. Verify the change there.
2. Merge `dev` into `uat` once it's stable. Verify against the UAT Firebase project (closer to production-like data/usage).
3. Merge `uat` into `main` to ship to production.

## Firebase plan: staying on Spark (free)

The `einvitation-2ff36` dev project shows as **Blaze** in the Firebase console (Blaze is required to even view/enable some products in newer Firebase projects, so this can happen without any billing charge). The app itself still respects the Spark-era constraints below regardless of which plan the console shows — no Cloud Functions, capped media uploads, no billing-dependent features — so there's nothing to change here. If real charges ever become a concern, set a budget alert on the project (Google Cloud Console → Billing → Budgets & alerts, e.g. $5–10) as described in the upgrade path below.

This project was originally scoped to stay on the **Spark (free) plan** (see the master prompt, §2/§2a, and `AGENTS`/project notes for the full reasoning):

- Firestore/Auth usage is far under Spark's daily free quota (50K reads / 20K writes per day) at this app's scale.
- Background video is embedded via unlisted YouTube/Vimeo, never uploaded to Firebase Storage — this avoids the one real cost risk (media bandwidth).
- Storage is only used for size-capped gallery photos and background music; upload limits are enforced in the dashboard UI and in Storage/Firestore security rules (owner-write, public-read).

**Reminder:** periodically check the Firebase console's **Usage** tab (Firestore reads/writes, Storage stored/downloaded) for each project. Spark shuts off a product for the rest of the calendar month if its free quota is exceeded, so catching a climbing trend early matters more than it would on Blaze.

### Upgrade path

If guest traffic or media usage grows, move to the **Blaze** plan with a budget alert (e.g. $5–10) instead of staying on Spark — Blaze still costs $0 until the same free quotas are exceeded, but it doesn't hard-cut the service off mid-event. This is a billing/config change in the Firebase console, not a code rebuild, as long as the app continues to respect the upload limits and security rules already in place.
