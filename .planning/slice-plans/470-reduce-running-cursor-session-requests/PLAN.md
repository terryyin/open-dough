# Keep Running Cursor sessions current with fewer local requests

**Identity:** SEED-232#reduce-running-cursor-session-requests
**Source:** [selected story](../../seeds/SEED-232-reduce-dashboard-refresh-traffic.md#reduce-running-cursor-session-requests)
in SEED-232, refined 2026-11-04 with explore, borrow, challenge, clarify,
investigate and architecture.
**Source review:** [source-review.md](./source-review.md)
**Prepared:** 2026-11-04. Planning only, in the story's established workspace
(branch `cursor/keep-running-cursor-sessions-current-with-fewer`, agent
aki-chan), continuing the refinement in the same session.

## Goal and boundaries

A developer watching the expanded Running Cursor sessions section sees which
sessions the Cursor runner holds and what their labels say, while a quiet
watch costs about one browser list ask and at most one runner `/sessions`
read per second instead of on the order of sixteen of each, and a
session-list or label change still appears within about one second of the
change. The story's seven key examples and its evaluation basis are the
acceptance.

Included: settled held-session observation reuse for about one second under
the current home and machine-document revision; the section's ask gap raised
to that same bound; collapse, hide, and failure behavior as today; the
machine-session observation document stating the reuse. Excluded, as the
story records: SSE or push for local sessions; cross-process settled sharing;
unchanged/digest answers as the primary saving; a sub-second continuous
watch; aligning this section to the Board's 15-second pace; changes to row
contents, terminal open, the runner protocol, or machine-session page pace.

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout. Local full suites follow `tests/local-test-resources.md`: Bash 5
on PATH, and on AC power `caffeinate -s -i` around the run
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).

## Direction and PFE

- **Reuse the held-session SharedObservation.** `heldCursorSessionEvidence`
  (`dashboard/server/hosts/cursor/heldSessions.ts`) already joins overlapping
  asks through `SharedObservation` with `reuseMs: () => 0`. Set that window
  to the machine-session reuse,
  `configuredLimit("DOUGH_SESSIONS_REUSE_MS", 1_000)`, under the existing
  `[home, machineDocumentsRevision]` key. Failures and unanswered waits keep
  no settled answer. No second cache, daemon, or runner-protocol change.
- **Match the section's ask gap to the window.** `askGapMs` in
  `dashboard/src/RunningCursorSessions.tsx` becomes `1_000`, so a quiet
  expanded section asks about once per second and is answered from the
  settled observation when still inside the window. Demand lifecycle
  (collapse, sidebar close, hidden document, single owned read) stays.
- **Rewrite proofs that assumed zero reuse.** The sharing journey and the
  held-sessions-revision overlapping case today assert that the next ask
  after settle re-reads the runner; they become within-window reuse and
  past-window re-read (and keep in-flight sharing).
- **Documentation.** `dashboard/AGENT-LAUNCH-OBSERVATION.md` currently says
  Running Cursor sessions reads "join the one runner read in flight, with no
  reuse once it settles." Update that sentence to the one-second settled
  reuse under the same home and machine documents.

Accepted decisions: machine-local evidence stays rebuildable from the runner
and launch records, with no new daemon, database or scheduler
([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md));
the evaluation basis and the one-second freshness trade-off are stated before
the observed run
([ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md));
reuse before new machinery
([ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)).
No ADR conflict; no North Star topic is needed.

## Decisive premises

| Premise | Consuming operation, observed form, revision | Result | Unverified remainder |
| --- | --- | --- | --- |
| Today the expanded section asks again 50 ms after each settle, and held-session reuse is zero, so a quiet fast runner is asked on the order of sixteen times a second | `askGapMs = 50` and `reuseMs: () => 0` read at `09e6bc225`; twenty live `GET /sessions` to the machine's runner (port from `~/.open-dough/dashboard/cursor-runner.json`) at 50 ms gaps on 2026-11-04 | True: 16.6 reads/s, three held sessions, ~2.1 KiB answers | — |
| Overlapping list and sessions asks share one in-flight runner read, and today's next ask after settle re-reads | `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/cursor-runner-sessions-sharing.spec.ts dashboard/tests/boundary/cursor-held-sessions-revision.spec.ts dashboard/tests/boundary/shared-observation.spec.ts dashboard/tests/cursor-runner-sessions-demand.spec.ts` at `09e6bc225` after `npm ci`, 2026-11-04 | True: 10 passed, including "the next ask after it settles reads again" | — |
| Raising held-session reuse to 1 s and the ask gap to 1 s fails exactly the proofs that require a re-read immediately after settle, while listing, follow-up label, demand, and unreachable journeys stay green | Scratch edit of those two constants, same Playwright set plus `cursor-runner-sessions.spec.ts`, then revert, at `09e6bc225`, 2026-11-04 | True: sharing and "overlapping asks under unchanged documents" failed (first ask after launch answered from the settled observation without a new runner read while the gate held); 9 other cases passed, including follow-up prompt within Playwright's expect | Slice 1 rewrites those two proofs; slice 2 owns quiet-rate and change-within-bound counts |
| `SharedObservation` already serves settled reuse, joins in flight, keeps nothing from a failure, and keys by inputs | `shared-observation.spec.ts` in the run above | True | — |
| Machine-session observation already defaults that reuse to 1 s under `DOUGH_SESSIONS_REUSE_MS` | `machineSessionObservation.ts` `configuredLimit("DOUGH_SESSIONS_REUSE_MS", 1_000)` read at `09e6bc225` | True | Held sessions adopt the same limit name so one knob stays one window |

## Outside-in proof

| Story example | Owning slice | Observable signal |
| --- | --- | --- |
| 1 quiet watch (boundary), 4 seen again under reuse, 6 unreachable / failure not reused | 1 | Boundary/sharing specs: a second list ask within the window costs no runner read; past the window it reads again; overlapping asks still share one in-flight read; a failed or unanswered observation keeps nothing for the next ask |
| 1 quiet watch (page), 2 label change, 3 list membership, 5 collapse ends demand | 2 | Journey: expanded quiet section for ~10 s starts about ten list asks (not on the order of a hundred); `cursor.showReady()` updates the row to the follow-up label within about one second; collapse starts no further asks; existing demand and listing specs stay green |
| 7 independent of Git | 2 | No published-revision path changes; the quiet-rate journey does not open a second project or assert Board requests |
| Evaluation basis | 2 | The quiet-rate and change-within-bound journey records counts against the story's baseline; no separate production restart required |

Local gates: for slice 1,
`dashboard/tests/cursor-runner-sessions-sharing.spec.ts`,
`dashboard/tests/boundary/cursor-held-sessions-revision.spec.ts`,
`dashboard/tests/boundary/shared-observation.spec.ts`, and any new sibling
boundary case they gain; for slice 2,
`dashboard/tests/cursor-runner-sessions-demand.spec.ts`,
`dashboard/tests/cursor-runner-sessions.spec.ts`, and the quiet-rate /
change-within-bound journey beside them, through
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`;
`npm run --silent typecheck:dashboard` and `npm run --silent format` before
each commit. Run the focused cursor-runner and held-sessions specs above as
the local suite for this path; hosted CI runs the full suites after
publication and its failures stay owned under the policy above.

## Ordered slices

### 1. Settled held-session reads answer within one second
Type: Behavior
Status: done
Proof: `heldSessions.ts` uses `configuredLimit("DOUGH_SESSIONS_REUSE_MS", 1_000)`
as `SharedObservation`'s reuse window under the existing home and
machine-document key; `cursor-runner-sessions-sharing.spec.ts` and the
overlapping case in `cursor-held-sessions-revision.spec.ts` assert a second
list ask within the window costs no runner `/sessions` read, a ask past the
window (or with the limit at zero) reads again, and overlapping asks still
share one in-flight read; a failure keeps no settled answer for the next ask.
`AGENT-LAUNCH-OBSERVATION.md` states the one-second settled reuse for Running
Cursor sessions reads. Existing revision-while-outstanding labeling stays
green.
Behavior: A Running Cursor sessions list ask (or another held-evidence reader)
reaches this process → it is answered from the held-session observation last
settled for that home and machine-document revision within about one second,
joins the outstanding one, or reads the runner, and never reuses a failed or
unanswered observation.

### 2. The expanded section asks once per second and still shows changes promptly
Type: Behavior
Status: done
Proof: `askGapMs` in `RunningCursorSessions.tsx` is `1_000`; the demand spec's
gap-related waits follow that constant; a journey keeps the section expanded
and quiet for about ten seconds and counts about ten browser list asks (and,
where the runner gate is installed, about ten runner reads), then flips the
held screen with `cursor.showReady()` and shows the follow-up label within
about one second; collapse still ends further asks. Listing, unreachable, and
feedback journeys stay green.
Behavior: The Sessions sidebar is open and Running Cursor sessions is
expanded on a quiet runner → about one list ask leaves the browser per
second, and a label or membership change appears in the section within about
one second; collapsing the section ends that demand.

## Execution complete

Product advice: no change. Deferred SSE, cross-process settled sharing, and
digest answers remain with SEED-232 siblings already Taken; this traffic cut
does not warrant backlog movement. Hosted full-suite conclusions remain
conditional on applicable CI for the final execution revision.

## Current decisions

- The reuse window is the machine-session window,
  `DOUGH_SESSIONS_REUSE_MS` defaulting to 1_000 ms, so held evidence has one
  age bound. The section's ask gap matches that default in the client.
- The observation key stays home plus machine-document revision; a launch
  record write still demands under the new revision.
- Separately launched dashboards share only in-flight reads, as today; settled
  cross-process reuse stays deferred.
- Slice 1 alone already cuts dashboard-to-runner traffic for every held
  reader; slice 2 cuts browser-to-dashboard traffic from the section. Both
  are required for the story's dual-path evaluation. Together they are a safe
  stopping point with fixture proof of the evaluation basis.

## Learnings

- Test harness default `DOUGH_SESSIONS_REUSE_MS=1` (fakeClaude) expires a
  launch's settled observation almost immediately; proofs of the production
  one-second window must set `sessionsReuseMs` / `extraEnv` to `1000` and wait
  past that window before forcing a new in-flight read.
- Dashboard tests under `tsconfig.node` cannot import `.tsx` modules; keep
  shared constants such as `askGapMs` in a `.ts` module
  (`cursorRunnerSessions.ts`).

## Accepted proof

### Slice 1

```
proof:
  command: env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/cursor-runner-sessions-sharing.spec.ts dashboard/tests/boundary/cursor-held-sessions-revision.spec.ts dashboard/tests/boundary/shared-observation.spec.ts
  covers: within-window settled reuse; past-window re-read; in-flight sharing; failure keeps no settled answer; revision-while-outstanding labeling
  boundary: held-session SharedObservation + SharedObservation unit
  observations:
    - cursor-runner-sessions-sharing.spec.ts within-window askList: sessionsReads unchanged; past window greater
    - cursor-held-sessions-revision.spec.ts overlapping asks: same within/past-window; in-flight before+1
    - cursor-held-sessions-revision.spec.ts record while outstanding: before+2 labeling
    - shared-observation.spec.ts failed observation: next demand starts===2
  setup: DOUGH_SESSIONS_REUSE_MS=1000 via sessionsReuseMs / extraEnv; holdRunnerSessionsReads gate
  result: pass
```

```
proof:
  command: npm run --silent typecheck:dashboard
  covers: dashboard TypeScript for the change surface
  boundary: dashboard types
  observations:
    - exit_code 0
  setup: none
  result: pass
```

### Slice 2

```
proof:
  command: env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/cursor-runner-sessions-demand.spec.ts dashboard/tests/cursor-runner-sessions.spec.ts dashboard/tests/cursor-runner-sessions-quiet-rate.spec.ts
  covers: quiet ~1 ask/s; label and membership leave within ~1s; collapse ends demand; listing/unreachable/feedback; demand lifecycle with 1s gap
  boundary: browser list ask pace + section demand
  observations:
    - quiet-rate: 8–12 browser asks and runner reads in 10s; follow-up within askGapMs+500; membership leave rows→0 within bound; collapse freezes demand
    - demand.spec: slowerThanAskGapMs follows askGapMs
    - cursor-runner-sessions.spec.ts: listing/not-running/unreachable/feedback green
  setup: holdRunnerSessionsReads for runner counts; askGapMs from cursorRunnerSessions.ts
  result: pass (10 tests)
```

```
proof:
  command: npm run --silent typecheck:dashboard
  covers: askGapMs export and quiet-rate/demand imports after refactor
  boundary: dashboard types
  observations:
    - exit_code 0 after refactor re-run
  setup: none
  result: pass
```

## Concern evidence

Slice-plan refinement was not needed: each slice owns one proof loop, the
sequence reuses the existing shared observation rather than a second sharing
rule, and no slice-specific concern remains. No interim behavior between the
slices changes the product promise beyond the documents matching slice 1
before the section's ask gap lands in slice 2.


## Story obligations

### X-D1. Deferred SSE/push local sessions
Reported: slice 1 — "Deferred: delivering local session updates over SSE or another push without recurring browser asks."
Story clause: "delivering local session updates over SSE or another push without recurring browser asks (sibling published-SSE growth path)"
Disposition: excluded "delivering local session updates over SSE or another push without recurring browser asks (sibling published-SSE growth path)"
Commitment: D1


### X-D2. Deferred cross-process settled sharing
Reported: slice 1 — "Deferred: sharing settled runner observations across separately launched dashboard processes."
Story clause: "sharing settled runner observations across separately launched dashboard processes"
Disposition: excluded "sharing settled runner observations across separately launched dashboard processes"
Commitment: D2

### X-D3. Deferred digest answers
Reported: slice 1 — "Deferred: unchanged / digest answers that shrink quiet response bytes while the ask pace stays high."
Story clause: "unchanged / digest answers that shrink quiet response bytes while the ask pace stays high"
Disposition: excluded "unchanged / digest answers that shrink quiet response bytes while the ask pace stays high"
Commitment: D3

### X-D4. Deferred sub-second continuous watch
Reported: slice 1 — "Deferred: a sub-second continuous watch."
Story clause: "a sub-second continuous watch"
Disposition: excluded "a sub-second continuous watch"
Commitment: D4

### X-D5. Deferred Board 15-second pace
Reported: slice 1 — "Deferred: aligning this section to the Board's 15-second pace."
Story clause: "aligning this section to the Board's 15-second pace"
Disposition: excluded "aligning this section to the Board's 15-second pace"
Commitment: D5

### X-S1. No row-content change
Reported: slice 1 — "Scope limit: no change to what a row shows."
Story clause: "no change to what a row shows"
Disposition: excluded "no change to what a row shows"
Commitment: S1

### X-S2. No terminal-open change
Reported: slice 1 — "Scope limit: no change to how choosing a row opens the terminal."
Story clause: "how choosing a row opens the terminal"
Disposition: excluded "how choosing a row opens the terminal"
Commitment: S2
### X-S3. No new daemon
Reported: slice 1 — "Scope limit: no new daemon."
Story clause: "no new daemon"
Disposition: excluded "no new daemon"
Commitment: S3

### X-S4. No new database
Reported: slice 1 — "Scope limit: no new database."
Story clause: "no new daemon, database, or scheduler"
Disposition: excluded "no new daemon, database, or scheduler"
Commitment: S4
### X-S5. No new scheduler
Reported: slice 1 — "Scope limit: no new scheduler."
Story clause: "no new daemon, database, or scheduler"
Disposition: excluded "no new daemon, database, or scheduler"
Commitment: S5
### X-S6. No runner-protocol change
Reported: slice 1 — "Scope limit: no change to the runner protocol."
Story clause: "no change to the runner protocol"
Disposition: excluded "no change to the runner protocol"
Commitment: S6

### X-S7. No machine-session page-pace change
Reported: slice 1 — "Scope limit: no change to machine-session observation's own 15-second page pace."
Story clause: "machine-session observation's own 15-second page pace"
Disposition: excluded "machine-session observation's own 15-second page pace"
Commitment: S7
### X-S8. No published-progress list
Reported: slice 1 — "Scope limit: no carrying of this list on the published-progress stream."
Story clause: "no carrying of this list on the published-progress stream"
Disposition: excluded "no carrying of this list on the published-progress stream"
Commitment: S8