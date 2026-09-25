# MIGRATION.md

This repo is a Firestore/Firebase Hosting variant of
[ajneil/afh-tech-test](https://github.com/ajneil/afh-tech-test), which is left
unchanged as the original submission. Same app, same feature set — different
backing store and deployment target, picked to make hosting cheap on Firebase.

## Why a separate repo

The original was built against a specific brief (`docker compose up`, no
external dependencies). Rebuilding it in place would have overwritten a
finished, working submission. This repo exists so both versions stand on
their own.

## What changed

| Area | Original | This repo | Why |
|---|---|---|---|
| Database | PostgreSQL + Prisma | Firestore (`firebase-admin`, server-side only) | No always-on Cloud SQL instance to pay for; Firestore's free tier covers this app's traffic entirely |
| Local dev | `docker compose up` (app + Postgres + Mailpit) | Firestore emulator + `npm run dev` (Mailpit run separately) | No Postgres container needed once the DB is Firestore |
| Deployment | Docker image → Cloud Run (not set up in the original) | Firebase App Hosting (`apphosting.yaml`), deploys from source, no Dockerfile | App Hosting has native Next.js support and a genuinely free tier at low traffic |
| Docs | `CLAUDE.md`/`ARCHITECTURE.md`/`REFLECTION.md` describe the Postgres/Docker build | Same docs, updated in place to describe Firestore/Firebase, with notes pointing back to the original's reasoning where it's now superseded | Keeping stale docs would misdescribe the actual code |

## Bugs fixed along the way

These were found reviewing the original before starting the rewrite. None are
present in this repo:

1. **No email format validation** — `/api/signup` accepted any non-empty
   string as an email. Fixed with a basic format check before any write happens.
   (Since superseded: sign-in now goes through Firebase Auth, which validates and
   verifies the address.)
2. **Signup race condition** — the original checked `findUnique` then
   `create`'d the user as two separate steps, so two concurrent signups with
   the same email could both pass the check and both try to create the user.
   This repo creates the `users/{email}` doc with Firestore's `.create()`,
   which fails atomically if the doc already exists — no separate check, no
   race window.
3. **Inconsistent state on email failure** — the original created the user
   and check-in records, then sent two emails inline; if either `sendEmail`
   call threw, the route returned a generic 500 even though the account had
   already been created, so a retry would then fail with "already
   registered" despite the user never receiving a link. This repo separates
   the two concerns: account/check-in creation is the thing that can fail the
   request, email delivery is reported back as `emailDelivered: false` on an
   otherwise-successful response rather than masquerading as a full failure.
4. **Playwright artifact tracked in git** — `test-results/.last-run.json` was
   committed because `.gitignore` didn't exclude `/test-results` or
   `/playwright-report`. Both are now ignored.

## Still true in both repos

Everything the original's `REFLECTION.md` already flagged as a known
limitation — no rate limiting on `/api/signup`, tokens that don't expire, no
CSRF protection, no daily scheduler — is still true here. This rewrite fixed
bugs that were found, not scope.

## Running this repo

```bash
firebase emulators:start   # Firestore emulator (:8080 data, :4000 UI)
npm run dev                # Next.js dev server (:3000)
```

Point `SMTP_HOST`/`SMTP_PORT` at a local Mailpit instance or any SMTP sandbox
for testing email locally — see `.env.local` (gitignored).

To deploy: create a Firebase project, `firebase use --add`, then
`firebase deploy` for Firestore rules/indexes and set up an App Hosting
backend pointing at this repo (`firebase apphosting:backends:create`). Fill in
the real `APP_URL` and SMTP provider details in `apphosting.yaml` first.
