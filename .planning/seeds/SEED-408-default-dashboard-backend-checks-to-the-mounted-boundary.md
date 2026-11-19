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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/715-default-dashboard-backend-checks-to-the-mounted-boundary/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6107ec38df0218dc2747a52339c347881e6656a4587c336a6b4c7a5c89db5502","plan":"7e7aaaf7f81da7fc8ce3ece44ea7d8474f08df94f46532d62ac997200128e3ab"}}
```

**Goal:** Developers waiting for Dashboard Backend Test get the same assertions
and answers sooner. Ordinary boundary-mode starts mount in the test worker by
default, so they skip a server process. Cases that need a live server name
their reason. Dev, preview, frontend, and E2E entries keep their current
behavior. The gain is judged under
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

**Acceptance:** Refinement on 2026-11-19 replaced the inherited 800-start floor.
That floor was an estimate from the 1,028-start baseline. The routing audit put
the ceiling at about 790 without dropping live proofs. The story now requires
all of the following:

- The whole backend suite passes with its product assertions unchanged.
- Every boundary-mode backend start that names no live reason mounts. Every
  live boundary start names one of the entry rule's reasons.
- For the matched starts, the mounted start and first-close time sums to less
  than one quarter of the live time.
- The median `dashboard-backend` test-step time across five main runs after
  landing is lower than across the five before. Local wall time counts only
  from runs that alternate both defaults in one sitting.
- Full frontend and E2E runs mount nothing.
- The backend entry rule describes the delivered default and its live reasons.

**Scope:**

- Switch Dashboard Backend Test's boundary-mode default to the opt-in mount
  delivered by SEED-403, using the preserved candidate and its focused repairs.
- A case that fails on the mount gets its cause found, under the failure
  policy. Sometimes server state outlives one mount and reaches the next case
  in the worker, such as a module-level memo. That state then belongs to the
  mount's own lifetime. Any other cause is named in the case's live request.
  No case is skipped, and no assertion is loosened.
- Keep the fixture's failure diagnostics on a mounted server. They attach fake
  GitHub calls without child output, close even when diagnostics fail, keep
  the case's original failure, and restore the worker before the next mount.
- Update the entry rule and the `dashboardServer.ts` header to the delivered
  option names and reasons.

**Key examples:**

- An ordinary backend case starts a boundary-mode server without asking. Its
  boundaries mount in the worker and its assertions pass unchanged.
- A case that proves Cursor work, the incident lifecycle, a second or killed
  server, or the server program asks for the live server with that reason. It
  gets a live process.
- A case that fails only on the mount because its own child command inherits
  the mount environment names that reason. It gets the live server and keeps
  its assertion.
- An E2E or Dashboard Frontend case starts a boundary-mode server. It gets the
  live server, and the full runs record zero mounts.
- A done story's follow-up was read in one mounted case. A later case in the
  same worker cannot read that record, so its follow-up is refused with 502.
- A mounted case fails its assertion. Its report shows that original failure
  with the fake GitHub calls, and the next case in the worker mounts with a
  restored HOME.

**Scope limits:** This story does not move browser cases, change dev or preview
starts, relocate tests below the boundary, return cases held live for a named
reason, or put live proofs on the stand-in. Mounted count is recorded as
evidence and is not a gate.

**Provenance:** Remaining slices 7 and 8 of
`SEED-403#reach-dashboard-backend-checks-through-the-mounted-boundary`. Its
published branch tip `73f859a5da6e9e45f6bb6c194693b23e685f713c` preserves the
original seed, trial and delivery records. The
[mapped plan](../slice-plans/715-default-dashboard-backend-checks-to-the-mounted-boundary/PLAN.md)
carries the candidate and measured result for refinement.
