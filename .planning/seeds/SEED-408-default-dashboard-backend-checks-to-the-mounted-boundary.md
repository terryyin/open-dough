---
id: SEED-408
status: active
planted: 2026-11-19
planted_during: Terry requested a separate story for the remaining dashboard backend migration
trigger_when: selected from the backlog
scope: one story
---

# SEED-408 — Default dashboard backend checks to the mounted boundary

<a id="default-dashboard-backend-checks-to-the-mounted-boundary"></a>

### Default dashboard backend checks to the mounted boundary

**Identity:** SEED-408#default-dashboard-backend-checks-to-the-mounted-boundary
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-408#default-dashboard-backend-checks-to-the-mounted-boundary","dependencies":[{"supplier":{"identity":"SEED-403#reach-dashboard-backend-checks-through-the-mounted-boundary","href":"seeds/SEED-403-reach-dashboard-backend-checks-through-the-mounted-boundary.md#reach-dashboard-backend-checks-through-the-mounted-boundary"},"implementation":"The opt-in mounted boundary, scoped configuration lifetime, and named live-server requests land on trunk.","rationale":"The backend-wide default switches the existing, proven opt-in fixture. Starting from trunk before that fixture lands would require recreating it and would invalidate the preserved candidate base.","condition":"The opt-in boundary fixture and explicit live-server reasons are integrated on origin/main.","state":"satisfied","resolution":{"revision":"8ecdfda610f31df06b50572d846d86d8c72ca8d3","path":".planning/seeds/SEED-403-reach-dashboard-backend-checks-through-the-mounted-boundary.md#reach-dashboard-backend-checks-through-the-mounted-boundary","summary":"Directly satisfied. The integrated dashboard test launcher exposes the opt-in mounted boundary, the scoped configuration lifetime and explicit live reasons per start. The retained plan records six done slices and the mounted HTTP, environment restoration, real Cursor, two-server and other live-route proofs. The branch CI receipt covers the closure with the before-cleanup revision as its basis.\nCondition satisfied: The opt-in boundary fixture and explicit live-server reasons are integrated on origin/main.\nAccepted integration: ec26ab60522fb093fd39af2075b0774cd30fb10b on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/715-default-dashboard-backend-checks-to-the-mounted-boundary/PLAN.md","assessment":"not-ready","reasons":["Refine the remaining migration and settle the 800-start gate or authorize wider scope; the measured candidate mounted 702 starts."],"basis":{"document":"a61cdee86e3b51f5a0d6b2990cb9ca44edadf368e30c4e061abbfb6699d3c4fa","plan":"48990dd899719db1c24f391639550e7c5d6c3f20147f9acae2f602995af575c0"}}
```

**Goal:** Developers waiting for Dashboard Backend Test get the same assertions
and answers from ordinary boundary-mode starts mounted in the test worker. Cases
that need a live server still name their reason. Dev, preview, frontend, and E2E
entries keep their current behavior.

**Acceptance:** Keep the existing product assertions and browser test layers.
The carried acceptance requires at least 800 mounted starts, matched start and
first-close time below one quarter of the live time, and a lower median
`dashboard-backend` test-step time across five main runs after landing than
across five before. Record local wall time only from alternating runs in one
sitting. Run the full backend, frontend, and E2E groups and observe zero mounts
in the latter two. The backend entry rule must describe the delivered default
and its live reasons.

**Decision before execution:** The first strict backend run observed 702
mounted starts out of 952 successful boundary starts. The routing audit found
no supported way to meet 800 in the earlier scope while retaining the live
proofs. At refinement, settle whether to retain 800 with a wider migration or
authorize a revised target. Pick the smallest sound scope, preserving the
product assertions. The user requested separate execution.

**Scope limits:** The carry-over scope excludes moving browser cases, changing
dev or preview starts, and relocating tests below the boundary. Keep justified
live exceptions until a later decision authorizes moving the affected cases.

**Provenance:** Remaining slices 7 and 8 of
`SEED-403#reach-dashboard-backend-checks-through-the-mounted-boundary`. Its
published branch tip `73f859a5da6e9e45f6bb6c194693b23e685f713c` preserves the
original seed, trial and delivery records. The
[mapped plan](../slice-plans/715-default-dashboard-backend-checks-to-the-mounted-boundary/PLAN.md)
carries the candidate and measured result for refinement.
