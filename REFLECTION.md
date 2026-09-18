# REFLECTION.md

> **Note on this variant:** this repo forked from [ajneil/afh-tech-test](https://github.com/ajneil/afh-tech-test) to explore hosting the same app cheaply on Firebase. That changes the calculus in the "PostgreSQL + Prisma over Firestore" section below — the original reasoning was optimizing for a zero-dependency `docker compose up` demo, this one is optimizing for a $0 Firebase deployment (no always-on Cloud SQL instance) — so it reaches the opposite conclusion on the same trade-off. See [MIGRATION.md](./MIGRATION.md) for the concrete changes.

## Trade-offs

### PostgreSQL + Prisma over Firestore (original rationale — see note above)
The brief required everything to run via `docker compose up`. PostgreSQL fits naturally into that setup — a single `postgres:16-alpine` service, no emulator, no Firebase project, no internet dependency. Prisma gives a typed schema, auto-generated migrations, and a clean singleton pattern in Next.js. Firestore would have required the Firebase local emulator, additional configuration, and a Firebase project to exist in the background — more moving parts for no benefit in this context.

### Immediate check-in email on sign-up rather than a daily scheduler
A real daily email system would need a scheduler — something like `pg-cron` inside Postgres, a Cloud Scheduler job, a queue worker, or a `node-cron` process in a separate Docker service. All of those add meaningful complexity to the Docker setup and are hard to test cleanly. The decision made here was to send the check-in email immediately at sign-up, so the end-to-end flow is demonstrable without a scheduler. In production, the right approach would be a daily scheduled job (pg-cron, Cloud Scheduler, or a message queue) that creates a new `CheckIn` record and sends the email at a consistent time each day.

### Token-based access rather than full authentication
The brief asks users to "sign up" and receive a check-in link — it doesn't specify password-based login. Token links in email are a standard pattern for single-use, low-friction access (used by tools like Notion, Slack, and Linear for magic links). The trade-off is that tokens don't expire and aren't invalidated on reuse after the check-in is completed — both of which would be easy to add with a `tokenExpiresAt` column and a revocation check.

### Single-page client-side step progression over separate routes
The 4-step check-in flow lives in a single page, with step state managed in the `useCheckIn` hook. This means the URL doesn't change between steps, so users can't deep-link to a specific step or use the browser back button to go back a step. The trade-off was accepted because: the flow is short (4 steps, a few minutes), back-navigation within a check-in isn't a meaningful use case, and a single client-side state machine is vastly simpler than 4 separate routes with shared state.

### Client-side check-in page loading over pure SSR
The original design fetched the check-in token status server-side in a Server Component. This was changed to add a `GET /api/checkin/[token]` endpoint and a client-side `CheckInLoader` component. The primary reason was testability: Playwright's `page.route()` can intercept client-side fetch calls but can't mock Prisma queries inside a Server Component. The client-side approach also gives the page a loading state, which is a genuine UX improvement. The trade-off is a brief loading flash on first render instead of fully populated SSR.

### What I would do differently with more time
- **Real daily scheduler** — a `pg-cron` job or a lightweight worker service that creates and sends check-ins on a daily schedule
- **Token expiry** — add `tokenExpiresAt` to the `CheckIn` model so links expire after 24–48 hours
- **Email unsubscribe** — a one-click unsubscribe link in every email, stored as a boolean on the `User` model
- **Rate limiting on `/api/signup`** — to prevent the endpoint being used to spam email addresses
- **Response history page** — a page where users can see their past check-ins (authenticated via a magic link)
- **Proper staging environment** — a second Docker Compose file or environment configuration for a staging/preview deployment

---

## Limitations

- **No daily delivery** — the system sends one check-in email at sign-up, not a recurring daily one. This is the most significant functional gap versus a production system.
- **No rate limiting** — the `/api/signup` endpoint can be called repeatedly with different email addresses, which could be used to spam inboxes via Mailpit (in development) or a real SMTP server.
- **Token links don't expire** — once a check-in link is created, it's valid indefinitely until the check-in is completed. A `tokenExpiresAt` field would fix this.
- **No email unsubscribe mechanism** — there's no way for a user to opt out of future emails without contacting an admin.
- **No Docker entrypoint test coverage** — the `prisma migrate deploy && npm start` entrypoint in the Dockerfile is not covered by any automated test. A failure here (e.g. a bad migration) would only surface at Docker startup.
- **No CSRF protection on API routes** — for a public-facing production system, the POST endpoints should validate the `Origin` header or use a CSRF token.

---

## AI usage

**Planning (Claude.ai before any code was written):**
Architecture and scope decisions were made upfront in a planning conversation with Claude.ai. This produced ARCHITECTURE.md, PLAN.md, CLAUDE.md, and STYLE_GUIDE.md — defining the data model, folder structure, API design, testing strategy, Docker setup, and brand tokens before a single line of code was written. The key decisions (PostgreSQL over Firestore, immediate email over scheduler, token auth over password auth) were made deliberately in that planning phase, not discovered during implementation.

**Implementation (Claude Code with tests-first prompts):**
Claude Code was used for implementation across three structured prompts:
1. Infrastructure and data layer (Prisma schema, mailer, email templates, Docker Compose, sign-up API)
2. UI layer (SignupForm, CheckInFlow, step components, ProgressIndicator, check-in complete API)
3. E2E tests, accessibility, polish, and documentation

Each prompt required tests to be written before implementation, and required confirmation that tests passed before moving on.

**Code review and corrections:**
- The Vitest config initially didn't exclude the `e2e/` directory, causing Playwright spec files to be picked up by Vitest and fail. This was caught immediately when running the full test suite and fixed by adding an `exclude` pattern.
- The check-in page was originally a pure Server Component with direct Prisma access. During E2E test writing it became clear that `page.route()` can't intercept server-side Prisma calls, so the architecture was refactored to use a client-side loader and a status API endpoint. This is documented above as a deliberate trade-off.
- Step components initially had textareas without associated `<label>` elements — caught during the accessibility pass and fixed with visually-hidden `sr-only` labels linked by `htmlFor`/`id`.

**What AI accelerated:**
Boilerplate and structure — scaffolding the feature folders, writing repetitive test cases, generating email HTML with inline CSS, and writing Docker configuration. The architectural decisions, trade-offs, and design choices were made by me and reflected in the planning documents before Claude Code was given any implementation task.
