# PLAN.md — Daily Check-In System

> This is the original planning doc, unchanged from [ajneil/afh-tech-test](https://github.com/ajneil/afh-tech-test) — it describes the Docker/Postgres brief this project started from. This repo later swapped the database and deployment target to Firestore/Firebase App Hosting; see [MIGRATION.md](./MIGRATION.md) for what changed and why. Kept as-is here since it's a record of the original scope decisions, not a description of this repo's current code.

## Brief Summary

Build a full-stack system where a user signs up to receive a Daily Check-In email. The email contains a unique link to an interactive 4-step guided experience (Breathe, Reflect, Gratitude, Intention). Users submit their responses. Everything runs via `docker compose up` with Mailpit for local email.

---

## Scope Decisions

### What I'm building fully

| Feature | Reason |
|---|---|
| Sign-up form (name + email) | Core requirement |
| Welcome email via Mailpit | Core requirement |
| Daily check-in email with unique tokenised link | Core requirement |
| 4-step check-in flow (single page, client-side progression) | Core requirement |
| Response submission and storage (PostgreSQL) | Core requirement |
| Docker Compose (Next.js + PostgreSQL + Mailpit) | Core requirement — must run via `docker compose up` |
| Loading, empty, and error states | Good engineering practice |
| Responsive layout | Expected for any web submission |

### What I'm deliberately not building

| Skipped | Reason |
|---|---|
| Real cron job / scheduler | Complex Docker setup; instead seed a check-in and provide an API trigger |
| User authentication / passwords | Brief says "sign up" — email registration is sufficient |
| User dashboard / response history | Not in brief |
| Firebase / App Hosting | Docker-first brief — PostgreSQL is simpler and more natural |

### Cron strategy

A real daily email scheduler would require a cron service in Docker. Instead:
- On sign-up, immediately create a check-in record and send the check-in email
- Document in REFLECTION.md that production would use a scheduled job (pg-cron, Cloud Scheduler, etc.)
- This satisfies the brief ("receive a Daily Check-In email") without burning 20 minutes on scheduler setup

---

## Time Allocation (90 minutes)

| Phase | Task | Time |
|---|---|---|
| 0–5 mins | Git init, drop convention files, create Next.js project | 5 mins |
| 5–20 mins | Docker Compose + Prisma schema + DB migration + Mailpit config | 15 mins |
| 20–35 mins | Sign-up API route + welcome email + check-in record + check-in email | 15 mins |
| 35–50 mins | Sign-up form UI + submission flow | 15 mins |
| 50–70 mins | Check-in page — 4-step flow, client-side progression, response submission | 20 mins |
| 70–80 mins | Loading, error, success states + responsive polish | 10 mins |
| 80–90 mins | REFLECTION.md + README + final test of full flow | 10 mins |

---

## Prioritisation Principle

If time runs short: a working end-to-end flow (sign up → email → check-in → submit) with rough UI beats a polished UI with a broken email flow. The email + token mechanics are the core of the brief — nail those first.
