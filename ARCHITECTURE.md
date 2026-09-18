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
  createdAt: Timestamp

checkins/{token}                   # doc ID = the signup token (crypto.randomUUID())
  userId: string                   # references users/{email}
  date: Timestamp
  completedAt: Timestamp | null
  breatheNote: string | null       # optional — breathe step may be guidance only
  reflection: string | null
  gratitude: string | null
  intention: string | null
  createdAt: Timestamp
```

Using the email as the `users` doc ID and the token as the `checkins` doc ID means both lookups Prisma did with `findUnique` become plain `.doc(id).get()` calls, and duplicate-signup protection comes from `.create()` throwing `ALREADY_EXISTS` rather than a separate find-then-write race.

---

## Folder Structure

```
src/
  app/
    page.tsx                    # Sign-up page (SSR)
    layout.tsx
    error.tsx
    loading.tsx
    api/
      signup/
        route.ts                # POST — create user, send emails
      checkin/
        complete/
          route.ts              # POST — save check-in responses
  features/
    signup/
      components/
        SignupForm/
          SignupForm.tsx
          SignupForm.test.tsx
          index.ts
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
    db/
      firestore.ts               # Firestore Admin SDK singleton + collection refs
    email/
      mailer.ts                  # Nodemailer transport (Mailpit SMTP)
      templates/
        welcome.ts               # Welcome email HTML
        checkin.ts               # Daily check-in email HTML with token link
    validation/
      email.ts                   # Email format check used by /api/signup
  types/
    index.ts
  providers/
    AppProviders.tsx
e2e/
  signup.spec.ts
  checkin.spec.ts
firebase.json                    # Firestore emulator config for local dev
firestore.rules                  # Deny-all — only the Admin SDK talks to Firestore
firestore.indexes.json
apphosting.yaml                  # Firebase App Hosting runtime config
.env.example
```

---

## API Routes

### `POST /api/signup`
**Body:** `{ name: string, email: string }`
**Actions:**
1. Validate input, including email format
2. Create `users/{email}` doc — fails atomically (400) if it already exists
3. Create `checkins/{token}` doc with a fresh `crypto.randomUUID()` token
4. Send welcome email via Mailpit
5. Send check-in email with link: `http://localhost:3000/checkin/[token]`
6. Return `{ success: true, emailDelivered: boolean }`

**Errors:** 400 if email invalid or already registered, 500 on unexpected Firestore failure.
A failure to *send* email is reported as `emailDelivered: false` on an otherwise-200 response — the account and check-in doc already exist by that point, so a mail outage shouldn't look like the whole signup failed.

### `GET /checkin/[token]`
- Page route — looks up check-in by token
- If not found or already completed: show appropriate state
- If valid: render `<CheckInFlow>`

### `POST /api/checkin/complete`
**Body:** `{ token: string, reflection: string, gratitude: string, intention: string }`
**Actions:**
1. Find check-in by token
2. Validate not already completed
3. Save responses + set `completedAt`
4. Return `{ success: true }`

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
| Scheduling | Sign-up triggers immediate check-in email | Cron job | Avoids scheduler complexity in Docker; documented in REFLECTION.md |
| Auth | None — token-based access | Firebase Auth | Brief doesn't require password auth; token link is sufficient |
| Check-in flow | Single page, client-side steps | Separate routes per step | Better UX, simpler state management, faster to build |
