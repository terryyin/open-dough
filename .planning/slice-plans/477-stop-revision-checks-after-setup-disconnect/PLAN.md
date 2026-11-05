# Stop revision checks when a page leaves during stream setup

**Identity:** SEED-240#stop-revision-checks-after-setup-disconnect
**Source:** [selected story](../../seeds/SEED-240-reliable-dashboard-updates-and-session-details.md#stop-revision-checks-after-setup-disconnect)
**Source review:** [source-review.md](./source-review.md)
**Prepared:** 2026-11-05; preparation only. Execution is not authorized by this plan.

## Goal and boundaries

A revision-stream open whose page departs, or whose dashboard boundary closes,
while request-owner scope resolution is still pending asks GitHub nothing for
that open and leaves no pace, observation or tracked lifetime; a live page
sharing the source and scope keeps its observations, and the observation ends
when that last live page leaves. The story section owns the goal, scope, key
examples and architecture; this plan does not restate them.

Included: admission-time departure and shutdown handling in
`dashboard/server/revisionStreamObservation.ts` (and
`dashboard/server/sourceRevisionStream.ts` only as joining needs), a test hold
on the synthetic `gh auth token`, an in-process boundary spec, and one sentence
in `dashboard/PUBLISHED-OBSERVATION.md`. Excluded (from the story): cancelling
the local scope lookup, browser reconnect and freshness behavior, and measuring
production frequency.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to execution, verification, delegation and repair
handoffs.

**Local gate:** the slice runs `npm run lint`, `npm run typecheck:dashboard`
and its focused proof
(`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts <specs> --reporter=list`
with Homebrew Bash 5 first on `PATH`). Because the synthetic `gh`
(`dashboard/tests/fixtures/fake-gh`) is loaded by every dashboard spec, run
`npm run test:dashboard` once before landing the story branch. For that long
run follow the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC use `caffeinate -s -i`; on battery plug in or keep
the lid open under `caffeinate -i` and inspect the sleep log afterwards.
Hosted CI on the published story branch remains owned under the failure
policy.

## Existing solutions and direction

- **Use the boundary's tracked lifetime.** `installAuthenticatedReadMiddleware`
  (`dashboard/server/authenticatedRead.ts`) already ends every controller in
  `boundary.tracked` on close, and `SourceRevisionStream` already ends a
  subscriber through its controller's abort. Give each admitted stream its
  pending-open controller in `tracked` before awaiting `requestOwnerScope()`,
  abort it on the request's or response's `close`, and after resolution join
  an observation only while it is unaborted and the observation registry is
  not closed; otherwise end the response and remove the controller. Hand the
  same controller (or its departure) to `SourceRevisionStream.open` so no
  departure between admission and join is lost. `RevisionStreamObservation.close()`
  marks the registry closed so a resumed open cannot recreate an entry after
  `byKey` was cleared.
- **Rejected:** rechecking only `res.destroyed` after the await covers the
  departed page but not a closed boundary; making `SourceRevisionStream.open`
  defensive alone leaves the shutdown path rebuilding an observation outside
  the cleared registry.
- **Hold fixture.** `dashboard/tests/fixtures/fake-gh` answers `gh auth token`
  without asking the fake GitHub. Add an env-named hold file
  (`FAKE_GH_AUTH_HOLD`): while it exists the `auth` branch records that it was
  reached and waits; absent the variable, behavior is unchanged. A fresh
  `DOUGH_GITHUB_REQUEST_OWNER_ROOT` from `fakeGhEnv` changes the endpoint
  signature, so each test's first stream open runs that `auth` once.
- **In-process route.** Follow
  `dashboard/tests/boundary/authenticated-read-plugin-hooks.spec.ts`: drive
  `localBoundaryPlugin` with `installAuthenticatedReadMiddleware` on a plain
  `http.Server`, so `closeServer()` closes the boundary while this process and
  the fake GitHub keep observing. An out-of-process server close ends the
  process and would hide the shutdown leak. Extract shared setup from the
  plugin-hooks spec only if the two specs would otherwise duplicate it.
- Accepted ADR: [0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  (in-process observation, no database); no conflict.

## Decisive premises observed during preparation

| Premise | Consuming operation | Observation (form, profile) | When | Result |
| --- | --- | --- | --- | --- |
| The defect reproduces in the slice's proof form | In-process plugin boundary, scratch spec with a held fake `gh auth`, `DOUGH_REVISION_STREAM_MS=80`, `DOUGH_REVISION_CHECK_REUSE_MS=0` | Scratch `dashboard/tests/boundary/zz-scratch-setup-departure.spec.ts`, run with the local-gate Playwright command; reverted | 2026-11-05 at `e6cf08fa8` | Page departs during hold: matching-refs 0 → 3 → 9 over 1.2 s after release. Boundary closed during hold: 0 → 3 → 9. Teardown then failed "A test asked GitHub without a request owner of its own", the leak outliving the test |
| Holding `gh auth token` holds scope resolution | Same | Same scratch; hold marker written by the fake `auth` branch | Same | Reached once per test; opens waited until release |
| Repeated listings need the reuse window disabled at a lowered pace | Same | Same scratch first run without `DOUGH_REVISION_CHECK_REUSE_MS` | Same | Only one listing in 1.2 s; with `0`, one per pace |
| Two opens held on one resolution resume together; the departed one keeps the shared observation alive after the live page leaves | Same | Scratch `zz-scratch-shared.spec.ts`: one live `openEventStream`, one `abandonedRequest` cut during hold; reverted | Same | `auth` ran once; live received its first answer at `a1a1…`; matching-refs 5 while live, 7 at its close, 14 after 0.8 s more |

These observations also establish discrimination: each assertion of zero
further listings below fails on today's code.

## Outside-in proof

| Promise (story example) | Slice | Observation |
| --- | --- | --- |
| A page departing during held setup causes no listing | 1 | New in-process spec: hold, `abandonedRequest` cut after the hold is reached, release; zero matching-refs over several paces |
| A live page keeps shared observations; its close ends them | 1 | Same spec: live stream plus departing open under one hold; live receives first and paced answers; zero matching-refs after the live close settles |
| A boundary closed during held setup acquires nothing | 1 | Same spec: hold, open, `closeServer()`, release; zero matching-refs, the response ends, and teardown reports no ownerless GitHub request |
| A connected page through a slow resolution is answered as today | 1 | Same spec's live stream, plus the existing `authenticated-read-revision-stream.spec.ts` and plugin-hooks spec unchanged and green |
| The observation contract names setup departure | 1 | `dashboard/PUBLISHED-OBSERVATION.md` sentence |

## Slices

### 1. Departure during stream setup releases its observation demand

Type: Behavior
Status: done
Proof: accepted. Focused command
`export PATH="/opt/homebrew/bin:$PATH" && env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/tests/boundary/authenticated-read-revision-stream-setup-departure.spec.ts dashboard/tests/boundary/authenticated-read-revision-stream.spec.ts dashboard/tests/boundary/authenticated-read-plugin-hooks.spec.ts dashboard/tests/revision-stream.spec.ts dashboard/tests/revision-stream-lost.spec.ts dashboard/tests/revision-stream-visibility.spec.ts --reporter=list`
(implementer: 21 passed; coordinator reconfirmed setup-departure 4/4; refactor reconfirmed setup-departure + plugin-hooks 5/5 after helper extract). Observations: depart `matchingRefsSince === 0`; live+depart keeps listings then zero after live close; boundary close zero + `responseEnded`; connected first+paced events. Product: admission `AbortController` in `tracked` before `requestOwnerScope()`; join only while unaborted and `!registryClosed`; `SourceRevisionStream.open(..., admission)` refuses aborted/closed join. Contract sentence in `dashboard/PUBLISHED-OBSERVATION.md`. Lint and `typecheck:dashboard` passed.

Behavior: a stream open is admitted and its scope resolution is held → the
page departs or the boundary closes, then resolution finishes → no listing,
pace or tracked lifetime follows for that open, a live page sharing the source
and scope keeps its answers, and the observation ends with the last live page.

## Current decisions

- One slice: the fixture hold, the admission change and the spec form one
  observable outcome; neither half is useful alone.
- The local scope lookup is not cancelled (story scope limit).
- Admission controller is a required join argument (not optional with fallback).
- Registry closed state is the field `registryClosed` (not a getter over `closed`).
- In-process authenticated-read close proofs share `startInProcessBoundaryHttp`.

## Concern evidence

Refinement not needed: one cohesive slice with settled premises and mapped
proof. This review identified no remaining slice-specific concern.

## Learnings

- Holding `gh auth token` via `FAKE_GH_AUTH_HOLD` is enough to keep scope
  resolution pending without cancelling the lookup.
- Extract shared in-process boundary HTTP wiring when a second authenticated-read
  close proof would otherwise duplicate plugin-hooks setup.


## Story obligations

### Q1. Local scope lookup not cancelled
Reported: slice 1 — "Source review Q1 — local scope lookup itself is not cancelled"
Story clause: "the local scope lookup itself is not cancelled; it is shared and cached for the process and asks GitHub nothing"
Disposition: excluded "the local scope lookup itself is not cancelled; it is shared and cached for the process and asks GitHub nothing"
Commitment: Q1


### X1. Evidence context not acceptance commitment
Reported: slice 1 — "Source review X1 — evidence/reproduction context only"
Story clause: "A controlled reproduction using the current server classes"
Disposition: excluded "A controlled reproduction using the current server classes"
Commitment: X1

### X2. Browser reconnect and freshness deferred
Reported: slice 1 — "Source review X2 — browser reconnect and freshness belong elsewhere"
Story clause: "browser reconnect and freshness behavior belong to
  [Show lost freshness across repeated revision-stream failures](#show-freshness-loss-across-stream-retries)"
Disposition: excluded "browser reconnect and freshness behavior belong to
  [Show lost freshness across repeated revision-stream failures](#show-freshness-loss-across-stream-retries)"
Commitment: X2
### X3. Production frequency not measured
Reported: slice 1 — "Source review X3 — measuring production frequency is not undertaken"
Story clause: "measuring production frequency is not undertaken"
Disposition: excluded "measuring production frequency is not undertaken"
Commitment: X3