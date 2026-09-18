# CLAUDE.md — Project Conventions

This file defines the conventions, architecture decisions, and working preferences for this project.
Claude Code should follow these guidelines in every interaction unless explicitly instructed otherwise.

> This is a Firestore/Firebase-hosting variant of [ajneil/afh-tech-test](https://github.com/ajneil/afh-tech-test).
> See [MIGRATION.md](./MIGRATION.md) for what changed from the original and why.

See also:
- `STYLE_GUIDE.md` — visual design, brand tokens, component style
- `ARCHITECTURE.md` — data model, folder structure, API design
- `PLAN.md` — scope decisions, feature priority, time allocation
- `AGENTS.md` — Next.js version-specific rules — read before writing any Next.js code

---

## Stack Overview

- **Framework:** Next.js (App Router)
- **Database:** Firestore via `firebase-admin`
- **Email:** Nodemailer + Mailpit (local SMTP)
- **Infrastructure:** Firebase App Hosting + Firestore emulator for local dev
- **State:** useState for local UI state, Zustand if cross-component state is needed
- **Styling:** Tailwind CSS
- **Testing:** Vitest + React Testing Library + Playwright

---

## Folder Structure

Follow a Bulletproof React lite convention:

```
src/
  app/                          # Next.js App Router (pages, layouts, API routes)
  features/
    [feature-name]/
      components/
        MyComponent/
          MyComponent.tsx
          MyComponent.test.tsx
          index.ts
      hooks/
      utils/
      types.ts
      index.ts
  components/                   # Truly global/shared UI components
  lib/
    db/
      firestore.ts               # Firestore Admin SDK singleton + collection refs
    email/
      mailer.ts                 # Nodemailer transport
      templates/                # Email HTML templates
  types/
  providers/
```

- Features are self-contained. Cross-feature imports go through `index.ts` public APIs only.
- Never import directly into a feature's internal files from another feature.

---

## Rendering Strategy

- **Default to SSR** using React Server Components.
- **`'use client'`** is opt-in only — use when a component requires interactivity, browser APIs, or hooks.
- The sign-up page shell is a Server Component. The check-in flow is a client component (`CheckInFlow`).
- API routes live in `src/app/api/`.

---

## State Management

| Scenario | Tool |
|---|---|
| Local UI state (form inputs, step progression) | `useState` |
| Shared cross-component state | Zustand (if needed) |

The check-in flow step state lives in `useCheckIn` hook — no Zustand needed unless complexity grows.

---

## Testing Philosophy

**Tests are written before implementation (TDD).**

- Write the test first.
- Implement only enough code to make the test pass.
- Refactor with confidence.

### Testing Stack

| Layer | Tool |
|---|---|
| Unit & integration | Vitest |
| Component | React Testing Library (RTL) |
| End-to-end | Playwright |

### Conventions

- Test files live alongside the code they test.
- Playwright e2e tests live in `e2e/` at the project root.
- Mock `@/lib/db/firestore` and Nodemailer in unit/component tests.
- Prefer testing behaviour over implementation detail.

---

## Database Conventions

- Firestore Admin SDK client is a singleton in `src/lib/db/firestore.ts` — never call `initializeApp`/`getFirestore` directly in route handlers.
- Two top-level collections: `users` (doc ID = normalized lowercase email, so uniqueness comes from `.create()` failing rather than a separate lookup) and `checkins` (doc ID = the signup token, so a check-in lookup is a single `.doc(token).get()` with no query needed).
- Firestore is reached only through the Admin SDK on the server — `firestore.rules` denies all direct client access.
- Local dev uses the Firestore emulator (`firebase emulators:start`); never point local dev at production Firestore.
- Never expose raw database errors to the client — catch and return appropriate HTTP status codes.

---

## Email Conventions

- Nodemailer transport configured in `src/lib/email/mailer.ts`.
- SMTP config read from environment variables (`SMTP_HOST`, `SMTP_PORT`).
- Email HTML templates are functions in `src/lib/email/templates/` that return HTML strings.
- Never hardcode SMTP credentials — use environment variables.

---

## Firebase Conventions

- `firebase.json` configures the Firestore emulator for local dev — no real Firebase project needed to develop locally.
- `apphosting.yaml` configures the production runtime (Firebase App Hosting) — env vars, instance limits.
- `.env.local` gitignored; never commit service-account keys or real SMTP credentials.

---

## Storybook Compatibility

- Components should be renderable in isolation where possible.
- Prefer props over direct DB/API access in components — keep data fetching in route handlers and hooks.

---

## Claude Code Working Preferences

- **Always write tests before implementation.**
- **Confirm tests pass before moving to the next task.**
- Work feature by feature, not layer by layer.
- When making architectural decisions not covered here, flag the decision and reasoning before proceeding.
- Keep commits small and focused — one logical change at a time.
- When in doubt, prefer explicit over clever.
- Firebase Auth is still out of scope — this project only uses Firestore + Firebase App Hosting, not the auth product.
