# ARCHITECTURE.md — Daily Check-In System

> This is a Firestore/Firebase App Hosting variant of [ajneil/afh-tech-test](https://github.com/ajneil/afh-tech-test).
> See [MIGRATION.md](./MIGRATION.md) for what changed and why.

## Overview

A Next.js App Router application with Firestore as the database (via `firebase-admin`), email delivery via Nodemailer + Mailpit for local dev, and the Firestore emulator for local development. Deploys to Firebase App Hosting for production.

---

## System Architecture

```
Local dev:
┌───────────────────────────────────────────────────┐
│  ┌──────────┐  ┌────────────────────┐  ┌────────┐ │
│  │  Next.js │  │ Firestore emulator  │  │Mailpit │ │
│  │  :3000   │  │  :8080 (data)        │  │ :8025  │ │
│  │  (npm    │  │  :4000 (emulator UI) │  │        │ │
│  │   run    │  └──────────┬───────────┘  └───┬────┘ │
│  │   dev)   │             │                   │      │
│  └────┬─────┘             │                   │      │
│       └───────────────────┴───────────────────┘      │
└───────────────────────────────────────────────────┘

Production:
┌────────────────────────┐      ┌──────────┐
│  Firebase App Hosting   │──────│ Firestore │
│  (Next.js, autoscaled)  │      └──────────┘
└────────────────────────┘
```

- **Next.js** — app server, API routes, UI
- **Firestore** — user and check-in data via the Admin SDK, server-side only
- **Mailpit** — local SMTP server, web UI at `localhost:8025` to verify emails (dev only — swap for a real SMTP provider in production)

---

## Database Schema (Firestore)

No formal schema file — Firestore is schemaless, so the shape is documented here and enforced in code (`src/lib/db/firestore.ts`).

```
users/{email}                      # doc ID = normalized lowercase email
  name: string
  email: string
  uid: string | null               # Firebase Auth UID (null for pre-sign-in accounts)
  timeZone: string                 # IANA zone from the browser at sign-in
  morningEmails: boolean
  createdAt: Timestamp

users/{email}/days/{YYYY-MM-DD}    # one per person per local calendar day
  day: string
  token: string                    # → checkins/{token}
  prompt: string                   # the morning prompt for that day
  emailedAt: Timestamp | null      # set after the morning email is sent
  createdAt: Timestamp

checkins/{token}                   # doc ID = crypto.randomUUID()
  userId: string                   # references users/{email}
  day: string | null
  prompt: string | null
  date: Timestamp
  completedAt: Timestamp | null
  breatheNote: string | null
  reflection: string | null
  gratitude: string | null
  intention: string | null
  createdAt: Timestamp
```

The day doc and its check-in are written in one batch whose `create()` fails if the day
already exists, so concurrent requests (the morning job and someone opening the app)
always converge on a single check-in per day. Recent check-ins are read through the day
docs, so no composite index is needed.

---

## Sign-in

Firebase Auth runs in the browser only to prove identity, via Google (`signInWithPopup`)
or a passwordless email link (`sendSignInLinkToEmail` → `/auth/finish`). The client posts
the fresh ID token to `POST /api/session`, which verifies it with the Admin SDK (verified
email, signed in within five minutes), creates or links `users/{email}`, and sets a 14-day
httpOnly `__session` cookie (the only cookie Firebase's CDN forwards). Server Components
call `getCurrentUser()`; the browser keeps no Firebase state. Accounts are keyed by email,
so Google and email-link sign-ins for the same address are one person.

## Morning emails and AI prompt

Cloud Scheduler calls `POST /api/cron/morning` hourly at :30 with `Authorization: Bearer
$CRON_SECRET`. For each person with `morningEmails` on, whose local time is 07:00–09:59,
the job gets or creates today's check-in and sends it unless it was already emailed or
completed; `emailedAt` is set after sending so a failed send is retried by the next run.

The prompt comes from `gemini-3.6-flash` on Vertex AI (`@google/genai`) with low thinking,
given the person's first name and last three completed check-ins as data. It authenticates
as the App Hosting service account, so there is no API key; `GEMINI_MODEL` and
`GOOGLE_CLOUD_LOCATION` (default `global`) can override the model and region. Any error,
safety block, truncated or over-long reply, or missing `GOOGLE_CLOUD_PROJECT` falls back to
a hand-written prompt, so an email is never blocked on the AI. Note that recent answers are
sent to Vertex AI to write the prompt; the home page says so.

---

## Folder Structure

```
src/
  app/
    page.tsx                    # Sign-in for visitors, Dashboard when signed in (SSR)
    actions.ts                  # Server actions: start today's check-in, email preference
    auth/finish/page.tsx        # Completes an email-link sign-in
    layout.tsx
    api/
      session/route.ts          # POST sign in (ID token → session cookie), DELETE sign out
      cron/morning/route.ts     # POST — morning email job (Cloud Scheduler)
      checkin/
        complete/
          route.ts              # POST — save check-in responses
  features/
    auth/
      components/
        SignInForm/              # Google + name/email link (props only)
        SignInSection/           # Wires SignInForm to Firebase Auth
        FinishSignIn/            # Email-link completion
        SignOutButton/
      utils/
        signIn.ts                # Browser Firebase Auth flows → /api/session
        authErrorMessage.ts
      index.ts
    today/
      components/
        Dashboard/               # Today's prompt, recent check-ins, email switch
      index.ts
    checkin/
      components/
        CheckInFlow/
          CheckInFlow.tsx        # Client component — manages step state
          CheckInFlow.test.tsx
          index.ts
        steps/
          BreatheStep/
            BreatheStep.tsx
            BreatheStep.test.tsx
            index.ts
          ReflectStep/
          GratitudeStep/
          IntentionStep/
        ProgressIndicator/
          ProgressIndicator.tsx
          ProgressIndicator.test.tsx
          index.ts
      hooks/
        useCheckIn.ts            # Step progression and form state
        useCheckIn.test.ts
      types.ts
      index.ts
  lib/
    ai/
      morningPrompt.ts           # Gemini-written morning prompt, hand-written fallback
    auth/
      currentUser.ts             # Session cookie → signed-in person
    checkins/
      daily.ts                   # One check-in per person per local day
    db/
      firestore.ts               # Admin SDK singleton (Firestore + Auth) + collection refs
    firebase/
      client.ts                  # Browser Firebase Auth (emulator-aware)
    morning/
      sendMorningEmails.ts       # The 7:30 local-time email job
    time/
      localTime.ts
    email/
      mailer.ts                  # Nodemailer transport (Mailpit SMTP)
      templates/
        welcome.ts               # Welcome email HTML
        checkin.ts               # Daily check-in email HTML with token link
  types/
    index.ts
  providers/
    AppProviders.tsx
e2e/
  signin.spec.ts
  checkin.spec.ts
firebase.json                    # Auth + Firestore emulator config for local dev
firestore.rules                  # Deny-all — only the Admin SDK talks to Firestore
firestore.indexes.json
apphosting.yaml                  # Firebase App Hosting runtime config
.env.example
```

---

## API Routes and Server Actions

| Route | Purpose |
|---|---|
| `POST /api/session` | `{ idToken, name?, timeZone? }` → verify, create/link account, set session cookie, welcome email for new accounts |
| `DELETE /api/session` | Sign out (clear cookie) |
| `POST /api/cron/morning` | Morning email job; requires `Authorization: Bearer $CRON_SECRET` |
| `GET /api/checkin/[token]` | `{ status: 'pending' \| 'completed' \| 'not_found', prompt? }` |
| `POST /api/checkin/complete` | `{ token, reflection, gratitude, intention }` → save responses once |
| `startTodaysCheckIn` (action) | Get or create today's check-in for the signed-in person, redirect to it |
| `setMorningEmails` (action) | Turn morning emails on or off |

A failure to *send* email never fails the request that caused it: sign-in still succeeds
if the welcome email fails, and the morning job reports `{ sent, skipped, failed }`.

---

## Check-In Flow (Client-side)

4 steps managed by `useCheckIn` hook:

```
Step 1: Breathe     — Guidance text, breathing animation, "I'm ready" button
Step 2: Reflect     — "How are you feeling right now?" textarea
Step 3: Gratitude   — "What are you grateful for today?" textarea
Step 4: Intention   — "What one thing will you do today?" textarea + Submit
```

State shape:
```typescript
type CheckInState = {
  step: 1 | 2 | 3 | 4
  reflection: string
  gratitude: string
  intention: string
  submitting: boolean
  submitted: boolean
  error: string | null
}
```

---

## Email Templates

### Welcome email
- Warm, on-brand HTML
- Confirms sign-up
- Sets expectation for daily check-in email

### Daily check-in email
- Warm subject line e.g. "Your Daily Check-In is ready 🌱"
- Brief intro
- Single CTA button: "Start your check-in"
- Link: `http://localhost:3000/checkin/[token]`

---

## Local Dev Services

No Docker — two processes:

```bash
firebase emulators:start   # Firestore emulator: data on :8080, UI on :4000
npm run dev                # Next.js dev server on :3000, points at the emulator
```

Mailpit still needs a local SMTP target for testing email; run it standalone
(`docker run -p 8025:8025 -p 1025:1025 axllent/mailpit`) or point `SMTP_HOST`
at any SMTP sandbox you already have running.

---

## Environment Variables

```env
FIRESTORE_EMULATOR_HOST=localhost:8080   # local dev only — unset in production
SMTP_HOST=localhost
SMTP_PORT=1025
APP_URL=http://localhost:3000
```

In production (Firebase App Hosting), `FIRESTORE_EMULATOR_HOST` is unset so the
Admin SDK talks to real Firestore using Application Default Credentials — no
service-account key needs to be committed or configured. `SMTP_HOST`/`SMTP_PORT`
must point at a real transactional email provider; see `apphosting.yaml`.

---

## Testing Strategy

| Layer | Tool | What's tested |
|---|---|---|
| Unit | Vitest | useCheckIn hook, email template generation, API input validation |
| Component | RTL | SignupForm, CheckInFlow step progression, ProgressIndicator |
| E2E | Playwright | Sign up flow, check-in flow end-to-end |

---

## Tradeoffs & Decisions

| Decision | Chosen | Alternative | Reason |
|---|---|---|---|
| Database | Firestore via `firebase-admin` | PostgreSQL + Prisma (the [original repo](https://github.com/ajneil/afh-tech-test)) | This variant optimizes for cheap Firebase-native hosting — no always-on Cloud SQL instance to pay for, and App Hosting deploys straight from source with no Dockerfile |
| Email | Nodemailer + Mailpit (dev) | Firebase Extensions | Self-contained locally; swap for a real SMTP provider in production either way |
| Scheduling | Cloud Scheduler → API route, hourly, per-person local time | Cloud Functions scheduled function | Keeps all logic (templates, AI, data access) in the one Next.js app; one `gcloud` command to set up |
| Auth | Firebase Auth (Google + email link) → server session cookie | Tokens only (original) | People asked for accounts and history; email link needs no password and works for any address; Firestore stays server-only |
| Check-in flow | Single page, client-side steps | Separate routes per step | Better UX, simpler state management, faster to build |
