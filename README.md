# Daily Check-In — Firestore + Firebase Hosting Edition

A full-stack daily check-in system built with Next.js, Firestore, and
Nodemailer. Users sign up with their name and email, receive a welcome email
and an immediate check-in email containing a unique tokenised link. Clicking
that link opens a guided 4-step experience (Breathe → Reflect → Gratitude →
Intention) where they submit their responses, which are stored in Firestore.

This is a Firestore/Firebase Hosting variant of
**[ajneil/afh-tech-test](https://github.com/ajneil/afh-tech-test)**, which
uses PostgreSQL + Docker Compose and is left as the original submission. This
repo swaps the database and deployment target to make hosting the same app
cheap on Firebase — see **[MIGRATION.md](./MIGRATION.md)** for exactly what
changed, why, and which bugs were fixed along the way.

---

## Running locally

No Docker needed — two processes:

```bash
# Terminal 1: Firestore emulator
firebase emulators:start

# Terminal 2: Next.js dev server
npm install
npm run dev
```

- **App:** http://localhost:3000
- **Firestore emulator UI:** http://localhost:4000

For email, run Mailpit separately (or point `SMTP_HOST`/`SMTP_PORT` at any
SMTP sandbox):

```bash
docker run -p 8025:8025 -p 1025:1025 axllent/mailpit
```

- **Mailpit (email UI):** http://localhost:8025

Set these in `.env.local` (gitignored):

```env
FIRESTORE_EMULATOR_HOST=localhost:8080
SMTP_HOST=localhost
SMTP_PORT=1025
APP_URL=http://localhost:3000
```

---

## How to test the flow

1. Go to http://localhost:3000
2. Sign up with your name and email
3. Open Mailpit at http://localhost:8025
4. You'll see two emails — a welcome email and a check-in email. Open the check-in email.
5. Click **"Start your check-in"** to open the tokenised check-in link
6. Complete the 4-step guided experience and submit

---

## Running tests

```bash
# Unit + component tests (Vitest)
npm test

# E2E tests (Playwright) — requires the dev server to be running
npx playwright test
```

The Vitest suite covers unit tests for email templates, API routes, the
`useCheckIn` hook, and all UI components. Playwright E2E tests mock API
responses with `page.route()` and do not require a running database.

---

## Deploying

1. Create a Firebase project and run `firebase use --add`
2. `firebase deploy --only firestore` to publish `firestore.rules` / `firestore.indexes.json`
3. Fill in the real `APP_URL` and a production SMTP provider in `apphosting.yaml`
4. Set up an App Hosting backend pointing at this repo (`firebase apphosting:backends:create`) — it builds and deploys straight from source, no Dockerfile involved

Firestore's free tier and App Hosting's scale-to-zero pricing mean this stays
free or near-free at low traffic.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | Firestore via `firebase-admin` |
| Email transport | Nodemailer |
| Local email server | Mailpit |
| Local DB | Firestore emulator |
| Hosting | Firebase App Hosting |
| Styling | Tailwind CSS v4 |
| Unit / component tests | Vitest + React Testing Library |
| E2E tests | Playwright |
