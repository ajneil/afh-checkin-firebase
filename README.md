# Daily Check-In — Firestore + Firebase Hosting Edition

A full-stack daily check-in system built with Next.js, Firestore, Firebase Auth
and Nodemailer. People sign in with Google or with their name and email (a
passwordless sign-in link). Each morning at around 7:30 in their own time zone
they get an email with a short, personal prompt written by Claude from their
recent check-ins, and a tokenised link to a guided 4-step experience (Breathe →
Reflect → Gratitude → Intention). Signed in, the home page shows today's prompt,
recent check-ins and a switch for the morning emails.

This is a Firestore/Firebase Hosting variant of
**[ajneil/afh-tech-test](https://github.com/ajneil/afh-tech-test)**, which
uses PostgreSQL + Docker Compose and is left as the original submission. This
repo swaps the database and deployment target to make hosting the same app
cheap on Firebase — see **[MIGRATION.md](./MIGRATION.md)** for exactly what
changed, why, and which bugs were fixed along the way.

---

## Running locally

No Docker needed for the app itself:

```bash
cp .env.example .env.local           # emulator settings; edit if needed
firebase emulators:start             # Terminal 1: Auth (:9099) + Firestore (:8080), UI on :4000
npm install && npm run dev           # Terminal 2: http://localhost:3000
docker run -p 8025:8025 -p 1025:1025 axllent/mailpit   # Terminal 3 (optional): email UI on :8025
```

## How to test the flow

1. Go to http://localhost:3000 and enter a name and email, then **Email me a sign-in link**.
2. The Auth emulator doesn't send real email: open the link from the Auth tab of the
   emulator UI (http://localhost:4000/auth) or from the emulator's terminal output.
3. You land on your home page. **Start today's check-in**, complete the 4 steps, and
   your answers appear under **Recent check-ins**.
4. Trigger the morning email (it only sends to people for whom it's 7–10am locally):
   `curl -X POST -H "Authorization: Bearer local-secret" http://localhost:3000/api/cron/morning`
   and open it in Mailpit.

Without `ANTHROPIC_API_KEY`, morning prompts come from a hand-written list.

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

1. Create a Firebase project (Blaze plan, which App Hosting needs) and run `firebase use --add`.
2. **Authentication → Sign-in method:** enable **Google**, and **Email/Password** with
   **Email link (passwordless sign-in)** turned on. Add the App Hosting domain under
   **Settings → Authorised domains**.
3. Register a web app and copy its config into the `NEXT_PUBLIC_FIREBASE_*` values in
   `apphosting.yaml`; set `APP_URL`, `SMTP_HOST`/`SMTP_PORT` and `MAIL_FROM` for your email provider.
4. Create the secrets: `firebase apphosting:secrets:set SMTP_USER` (and `SMTP_PASS`,
   `CRON_SECRET`, optionally `ANTHROPIC_API_KEY`).
5. `firebase deploy --only firestore` to publish rules and indexes, then create the App
   Hosting backend: `firebase apphosting:backends:create`.
6. Schedule the morning job hourly at :30 (each person gets it at 7:30 local time):

   ```bash
   gcloud scheduler jobs create http afh-morning-checkin \
     --schedule="30 * * * *" --time-zone="Etc/UTC" \
     --uri="https://YOUR-APP-URL/api/cron/morning" --http-method=POST \
     --headers="Authorization=Bearer YOUR-CRON-SECRET" --location=europe-west2
   ```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | Firestore via `firebase-admin` |
| Sign-in | Firebase Auth (Google, email link) + session cookie |
| Morning prompt | Claude via `@anthropic-ai/sdk` |
| Scheduling | Cloud Scheduler → `/api/cron/morning` |
| Email transport | Nodemailer |
| Local email server | Mailpit |
| Local DB / auth | Firestore + Auth emulators |
| Hosting | Firebase App Hosting |
| Styling | Tailwind CSS v4 |
| Unit / component tests | Vitest + React Testing Library |
| E2E tests | Playwright |
