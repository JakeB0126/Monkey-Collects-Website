# AGENTS.md — Sealed Pokémon Product Store

These instructions apply to the whole repo unless a more specific file overrides them.

## Project Goal

Build a simple ecommerce site for selling sealed Pokémon products such as booster boxes, elite trainer boxes, booster bundles, collection boxes, tins, and packs.

Ship a reliable v1 quickly. Prioritize product browsing, inventory correctness, admin product management, and checkout readiness over extra features.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Stripe Checkout later
- Vercel deployment

## Build Rules

### Rule 1 — Think Before Coding
State assumptions explicitly. If uncertain, ask rather than guess.
Present multiple interpretations when ambiguity exists.
Push back when a simpler approach exists.
Stop when confused. Name what's unclear.

### Rule 2 — Simplicity First
Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.
Test: would a senior engineer say this is overcomplicated? If yes, simplify.

### Rule 3 — Surgical Changes
Touch only what you must. Clean up only your own mess.
Don't improve adjacent code, comments, or formatting.
Don't refactor what isn't broken. Match existing style.

### Rule 4 — Goal-Driven Execution
Define success criteria. Loop until verified.
Don't blindly follow steps. Define success and iterate.
Strong success criteria let you loop independently.

### Rule 5 — Use the Model Only for Judgment Calls
Use the model for classification, drafting, summarization, extraction, architecture judgment, and debugging explanations.
Do not use the model for routing, retries, deterministic transforms, or anything code can reliably answer.
If code can answer, code answers.

### Rule 6 — Token Budgets Are Not Advisory
Per-task: 4,000 tokens. Per-session: 30,000 tokens.
If approaching budget, summarize and start fresh.
Surface the breach. Do not silently overrun.

### Rule 7 — Surface Conflicts, Don't Average Them
If two patterns contradict, pick one: more recent, simpler, or more tested.
Explain why. Flag the other for cleanup.
Don't blend conflicting patterns.

### Rule 8 — Read Before You Write
Before adding code, read exports, immediate callers, shared utilities, existing types, and existing patterns.
"Looks orthogonal" is dangerous. If unsure why code is structured a way, ask.

### Rule 9 — Tests Verify Intent, Not Just Behavior
Tests must encode why behavior matters, not just what happens.
A test that can't fail when business logic changes is wrong.

### Rule 10 — Checkpoint After Every Significant Step
Summarize what was done, what's verified, what's left, and any uncertainty.
Don't continue from a state you can't describe back.
If you lose track, stop and restate.

### Rule 11 — Match Codebase Conventions
Conformance > taste inside the codebase.
If a convention seems harmful, surface it. Don't fork silently.

### Rule 12 — Fail Loud
"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if tests were skipped.
Default to surfacing uncertainty, not hiding it.

## Ecommerce Safety Rules

Never trust client-side values for price, stock, product status, cart totals, or checkout totals.

Before checkout, verify product availability and current price on the server.

When Stripe is added, Stripe webhooks are the source of truth for completed payment. Never mark an order as paid based only on a success-page redirect.

V1 core ecommerce is implemented.

Current focus:
- V1.1 customer accounts
- saved carts
- order history
- storefront polish
- deployment stability

Do not add large new systems unless explicitly requested.

For roadmap ideas, see:
- `agents/ROADMAP.md`
- `agents/FRONTEND-DIRECTION.md`
- `agents/BACKEND-NOTES.md`