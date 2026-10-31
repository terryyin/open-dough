# Make explicit dashboard re-reads observe fresh evidence

**Identity:** SEED-206#explicit-reread-freshness
**Source:** [Make explicit dashboard re-reads observe fresh evidence](../../seeds/SEED-206-explicit-reread-freshness.md#explicit-reread-freshness)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer who switches the Host in a story launch or Start session dialog
sees offers based on evidence obtained after that switch when the dialog's
explicit re-read completes. The re-read is answered only by an observation
that began after it arrived: never by a settled observation inside the
one-second reuse window, and never by one already running when it arrived.
At most one observation runs at a time; concurrent fresh re-reads share one
suitable observation. Regular polls and the notification observer keep their
existing sharing, one-second reuse, unchanged answers, bounded waits,
retryable failures, and independent departure.

## Exclusions and assumptions

- Observation expiry, lower settled heap, GitHub request sharing,
  story-specific session reads, a general refresh framework, and fresh reads
  for actions other than the dialogs' Host switch are excluded.
- A fresh re-read may still carry the page's held revision; when nothing
  changed, the small unchanged answer is a correct fresh answer.
- How the page marks a read as fresh (for example a request header beside
  `x-open-dough-sessions-revision`) is an implementation choice; it crosses
  the HTTP boundary and is checked as external input.

## Outside-in proof

| Example / promise | Owner | Observable proof |
| --- | --- | --- |
| 1. Settled observation inside the reuse window does not answer a fresh re-read | Slice 1 | `tests/boundary/shared-observation.spec.ts`: a fresh demand within a long reuse window starts a new observation; an ordinary demand is still served by the settled one. Boundary HTTP spec (`tests/boundary/`, `sessionsReuseMs: 60_000`): after a full read, change the project's installed Codex options; a fresh ask returns a new revision carrying B, an ordinary ask with the held revision is still answered unchanged |
| 2. An observation running before the re-read cannot complete it with stale evidence; no overlap | Slice 1 | `shared-observation.spec.ts`: hold an observation, issue a fresh demand, release; the fresh demand resolves to the next observation's value, and no second observation starts before the first settles |
| 3. Concurrent fresh re-reads share one suitable observation; ordinary polls keep sharing | Slice 1 | `shared-observation.spec.ts`: several fresh demands arriving while one older observation runs resolve to one later observation (one extra start); ordinary demands keep the existing sharing cases green |
| Preserved unchanged answers, bounded waits, retryable failures, independent departure | Slice 1 | Existing `shared-observation.spec.ts` cases, `tests/boundary/agent-launch-sessions-unchanged.spec.ts`, `agent-launch-codex-observation-sharing.spec.ts`, `agent-launch-codex-observation-wait.spec.ts` stay green; the fresh path's bound and departure share the same waiter code |
| Story launch dialog Host switch shows fresh offers without waiting for the next poll | Slice 2 | Page journey patterned on `agent-launch-options-exclusive.spec.ts` with `sessionsReuseMs: 60_000`: page reads offers, installed Codex options change, Host switched to Codex, dialog shows B's option before 15 seconds |
| Start session dialog Host switch takes the same fresh path | Slice 2 | Same journey shape from the project actions Start session dialog, or a request observation showing its Host switch sends the fresh marker and the dialog renders the fresh answer |
| Observation contract documented | Slice 1 | `dashboard/AGENT-LAUNCH-OBSERVATION.md` observation paragraph names the fresh re-read rule |

## Existing solutions (PFE)

- `server/sharedObservation.ts` already gives one-at-a-time observation,
  key-based exclusion, bounded waits and departure. Extend its `demand` with a
  freshness requirement (an observation started at or after the demand
  arrived) rather than adding a second coordinator; the key-mismatch loop
  already shows the wait-then-start shape a fresh demand needs.
- `server/machineSessionObservation.ts` `answerFor` / `observed` pass the
  freshness requirement from the request; the notification observer keeps
  ordinary demands.
- `src/machineSessionsReads.ts` / `src/agentLaunches.ts`: `rereadOffers`
  already forces an immediate read and aborts the superseded one; mark that
  read fresh, leaving polls unmarked.

## Decisive premises

| Premise | Settlement |
| --- | --- |
| Offers come from each project's installed skill files, outside the observation key | Observed: `server/launchCatalog.ts` `offeredDefinitions` / `establishingHosts` read `projectFolder(source)`; the key is `[configuredProjects(), machineDocumentsRevision()]` in `machineSessionObservation.ts` |
| Both dialogs re-read through the same client path | Observed: `StartLaunch.tsx` and `StartSession.tsx` call `onHostChanged`, wired to `launches.rereadOffers` in `StoryCardLaunches.tsx` and `ProjectActions.tsx` |
| Tests can widen the reuse window to make staleness observable | Observed: `tests/support/fakeClaude.ts` `sessionsReuseMs` sets `DOUGH_SESSIONS_REUSE_MS` (default 1 ms in tests) |
| A page journey can change installed options and switch Host | Observed: `agent-launch-options-exclusive.spec.ts` uses `installRefinementSkill` and the dialog's `Host` combobox |

No premise needs a probe before `ready`.

## Slices

### 1. A fresh sessions read is answered only by an observation begun after it
Type: Behavior
Status: done
Proof: `npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/boundary/shared-observation.spec.ts`
plus `agent-launch-sessions-fresh.spec.ts`, `agent-launch-sessions-unchanged.spec.ts`,
`agent-launch-codex-observation-sharing.spec.ts` and
`agent-launch-codex-observation-wait.spec.ts`; `npm run typecheck:dashboard`.
Accepted: those five Playwright boundary files (12 passed) and typecheck after
implementation and post-change refactor; HTTP marker `x-open-dough-sessions-fresh`.

Behavior: After a full sessions answer under a 60-second reuse window, the
project's installed Codex options change → a sessions request marked fresh
→ a new revision carrying the changed offers, while an unmarked request
holding the old revision is still answered unchanged. A fresh request
arriving while an observation runs waits for it and is answered by the next
one, shared with other fresh requests that arrived meanwhile, never
overlapping. Observation contract lives in
`dashboard/AGENT-LAUNCH-OBSERVATION.md` (linked from HISTORY).

### 2. Switching the dialog's Host shows fresh offers
Type: Behavior
Status: planned
Proof: new page journey (story launch dialog and Start session dialog) with
`sessionsReuseMs: 60_000`; `agent-launch-options-exclusive.spec.ts` and the
held-revision journey `agent-launch-held-revision-after-action.spec.ts` stay
green; run the consumer trace for the changed read helper.

Behavior: A page has read offers; the project's installed Codex options then
change → the developer switches the dialog's Host to Codex → the dialog shows
the changed option once its re-read completes, without waiting for the next
15-second poll. Regular polls stay unmarked.

## Current decisions

- Freshness is a property of the demand (started at or after arrival), not a
  new key part; ordinary demands keep the one-second reuse.
- Freshness uses a monotonic observation generation so same-millisecond
  pre-arrival runs are not treated as fresh (`Date.now()` alone is insufficient).

## Story obligations

### G1. Observation expiry deferred
Reported: slice 1 — "Observation expiry"
Story clause: "Observation expiry"
Disposition: excluded "Observation expiry"
Commitment: 10.1

### G2. Lower settled heap deferred
Reported: slice 1 — "lower settled heap"
Story clause: "lower settled heap"
Disposition: excluded "lower settled heap"
Commitment: 10.2

### G3. GitHub request sharing deferred
Reported: slice 1 — "changes to GitHub request sharing"
Story clause: "changes to GitHub request sharing"
Disposition: excluded "changes to GitHub request sharing"
Commitment: 10.3

### G4. Story-specific session reads deferred
Reported: slice 1 — "story-specific session reads"
Story clause: "story-specific session reads"
Disposition: excluded "story-specific session reads"
Commitment: 10.4

### G5. General refresh framework deferred
Reported: slice 1 — "a general refresh framework"
Story clause: "a general refresh framework"
Disposition: excluded "a general refresh framework"
Commitment: 10.5

### G6. Fresh reads for other actions deferred
Reported: slice 1 — "fresh reads for actions other than the dialogs' Host switch"
Story clause: "fresh reads for actions other than the dialogs' Host switch"
Disposition: excluded "fresh reads for actions other than the dialogs' Host switch"
Commitment: 10.6

## Plan review

- Slice-plan refinement: not needed — two Behavior slices, server boundary
  then page, each with one proof loop and no cumulative special-case design.
- Remaining slice-specific concerns: none.
