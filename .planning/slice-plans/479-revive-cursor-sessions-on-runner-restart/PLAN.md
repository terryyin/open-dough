# Revive previous Cursor sessions when the runner restarts

**Identity:** SEED-242#revive-cursor-sessions-when-the-runner-restarts
**Source:** [selected story](../../seeds/SEED-242-revive-cursor-sessions-when-the-runner-restarts.md#revive-cursor-sessions-when-the-runner-restarts)
**Source review:** [source-only review](source-review.md)
**Prepared:** 2026-11-05; preparation only. Execution is not authorized by this plan.

## Goal and boundaries

After the machine-local Cursor runner restarts or is replaced, every unfinished
session that runner was holding runs again under the new runner on its recorded
chat, without the developer using Recover on each one. The story section owns
the goal, scope, key examples, selected approach, and deferred promises; this
plan does not restate them.

Included: durable machine-local evidence of which Cursor sessions the runner
last held; automatic resume of those unfinished sessions onto a current runner
through the existing Recover keep path at the new-work / current-runner
boundary; proof updates to the maintained replacement and machine-restart
journeys; a short maintained description update where runner restart behavior
is already documented. Excluded (from the story): dual runners, drain-before-
replace, stronger Working-within-wait than Recover, reviving sessions the
previous runner was not holding, Claude/Codex changes, observation-triggered
replace or revive.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to execution, verification, delegation and repair
handoffs.

**Local gate:** each slice runs `npm run lint`, `npm run typecheck:dashboard`
and its focused proof
(`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts <specs> --reporter=list`
with Homebrew Bash 5 first on `PATH`; a fresh worktree first runs
`node scripts/setup-native.mjs npm` and `browser`). The change sits on the
shared Cursor runner and Recover path those journeys already exercise, so no
whole local suite is required before landing. Running `npm run test:dashboard`
anyway follows the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC use `caffeinate -s -i`; on battery plug in or keep
the lid open under `caffeinate -i` and inspect the sleep log afterwards.
Hosted CI on the published revision remains owned under the failure policy.

## Existing solutions and direction

PFE: change the existing Cursor runner lifecycle and reuse Recover wholesale.

| Responsibility | Existing owner and use |
| --- | --- |
| Current-runner guarantee and replacement | `dashboard/server/hosts/cursor/runnerCurrent.ts` / `runnerProcess.ts` — replace or start only for new work; observation never replaces. Gains a post-settle revive of last-held unfinished sessions. |
| Resume one unfinished Cursor session | `recover.ts` (`recoverCursorSession` → `keepCursorClient`) — conversation, scope, continuation-when-confirmed, timeout-kept contract. Auto-revive calls the same keep/resume path; developer Recover remains for sessions that still fail. |
| Held membership today | In-memory in the runner (`TerminalAttachments` / `/sessions`); joined to launch records in `heldSessions.ts`. No durable last-held file exists (observed in preparation). |
| Unfinished / Recover eligibility | `sessionUnfinished` / `sessionRecoverable` in `dashboard/src/sessionRecovery.ts` — filter revive candidates; do not start done or completed sessions. |
| Launch record identity | Existing kept launch records under the machine home — unchanged authority for conversation, workspace, and scope. |

**Selected shape.** Persist last-held Cursor session keys as machine-local
operational evidence under the runner directory (beside `cursor-runner.json`).
Update that set when a client is kept and when it is deliberately hung up
(Stop / hangup API). On runner process shutdown, leave the pre-shutdown held
set recorded so SIGTERM replacement and dirty kill both retain candidates.
After a current-runner ensure starts or replaces a runner, resume each
unfinished last-held session the new runner does not hold, through the Recover
keep path, without the developer clicking Recover.

**Re-entrancy constraint (settled).** `keepCursorClient` reaches
`ensureCurrentCursorRunner` via `startOncePerHome` on `pendingCurrentStarts`.
A nested `keepCursorClient` / `recoverCursorSession` while
`ensureCurrentCursorRunnerOnce` is still the in-flight promise waits on that
same promise and deadlocks. Revival therefore must keep onto the already
accepting current runner (known port / accepting-port keep) or run only after
the ensure promise has settled and must not call `ensureCurrentCursorRunner`
again for those keeps. The triggering new-work keep remains the path that
ensured currency.

**Rejected for this plan:** scanning every unfinished not-running Cursor
record (revives sessions the previous runner was not holding); dual-runner or
drain-before-replace (deferred by plan 334 and this story); calling Recover
through `currentCursorRunnerPort` from inside the ensure lock.

Accepted ADRs: [0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(last-held and live agent presence stay machine-local operational evidence;
published records are not the home of “running”); [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(deterministic fake-Cursor proof delivers; native `cursor-agent` revival across
a real replacement remains pending and unclaimed); [0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
Session entry / Running Cursor sessions vocabulary. No Accepted ADR conflict.
No new North Star topic: the one-machine-runner model and Recover reuse stay
inside existing runner documentation.

## Decisive premises observed during preparation

| Premise | Consuming operation | Observation (form, profile) | When | Result |
| --- | --- | --- | --- | --- |
| After stale-runner replacement by new work, previously held unfinished sessions read “The agent is not running.” with Recover offered | `cursor-runner-replacement.spec.ts` replacement journey assertions | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/tests/cursor-runner-replacement.spec.ts --reporter=list` after `node scripts/setup-native.mjs npm` and `browser` | 2026-11-05 on this preparation checkout | 2 passed; replacement journey asserts `agentNotRunningLabel` and Recover on both previously held sessions, then manual Recover resumes the scoped one |
| Nested `keepCursorClient` / recover inside an in-flight `ensureCurrentCursorRunner` waits on the same `startOncePerHome` promise | Call graph: `keepCursorClient` → `currentCursorRunnerPort` → `ensureCurrentCursorRunner` → `startOncePerHome(pendingCurrentStarts, …)` | Source read of `runnerClient.ts` and `runnerProcess.ts` `startOncePerHome` | 2026-11-05 | Confirmed: concurrent callers for the same home share one promise; nested keep during ensure deadlocks. Slice 2 must keep-on-accepting-port or revive only after ensure settles |
| No durable last-held artifact exists under the Cursor runner host today | Search for last-held / held persistence beside `cursor-runner.json` | `rg` over `dashboard/server/hosts/cursor` and `runnerPaths.ts`; listing of runner path helpers | 2026-11-05 | Only `heldSessions.ts` join of live `/sessions`; no last-held file. Slice 1 must add machine-local evidence |

## Outside-in proof

| Promise (story example) | Slice | Observation |
| --- | --- | --- |
| Deliberate hangup removes a session from last-held; keep records it; process death leaves last-held intact | 1 | Boundary / helper proof under `dashboard/tests/boundary/` (or support-driven runner fixture): keep → keys present; `/hangup` → key gone; kill-leaving-address → keys still present for the sessions that were held |
| Stale runner holds two unfinished sessions → third launch replaces → both previous sessions held again on the new runner without Recover; third launch still running | 2 | Extend `dashboard/tests/cursor-runner-replacement.spec.ts`: after replacement, previously held entries no longer show `agentNotRunningLabel` / Recover; attaches include both prior session ids on the replacement pid; third session remains attached |
| Machine-restart (dead pid, stale address) → next new-work path holds the previously held unfinished session again without Recover | 2 | Extend `dashboard/tests/cursor-session-recovery-restart.spec.ts` (or sibling): after kill-leaving-address, a new-work keep/launch leaves the prior session held on the fresh runner with no Recover click |
| Finished / not-previously-held unfinished records are not started; one revive failure leaves Recover on that entry and does not block others | 2 | Same replacement journey fixture extended, or focused companion: done/not-held controls stay not-running; inject one failing resume and assert siblings held and the failed entry still offers Recover |
| Listing / open on a stale runner still neither replaces nor revives | 2 | Existing observation half of `cursor-runner-replacement.spec.ts` stays green (stale pid unchanged until new work) |
| Claude/Codex restart behavior unchanged | 2 | No Claude/Codex module edits; existing focused Claude/Codex terminal-close specs named in plan 334 stay out of this change set |

## Ordered slices

### 1. Remember which Cursor sessions the runner last held
Type: Structure
Status: done
Proof: Boundary proof that keep publishes session keys into durable
machine-local last-held evidence under the runner directory; deliberate
hangup removes that session’s key; killing the runner while leaving its
address does not clear the keys for sessions it held.

Internal change: Add a single machine-local last-held representation beside
the existing runner address (path helper next to `cursorRunnerAddressFile`),
owned by the Cursor runner host. Publish or refresh it when a client is kept
and when it is deliberately hung up. On runner shutdown, retain the
pre-shutdown held set (do not treat process-exit hangups as deliberate Stop).
Expose a read for the dashboard’s revive path. No user-visible change yet:
replacement still leaves sessions not-running until slice 2.

Accepted proof (reuse): `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/tests/boundary/cursor-runner-last-held.spec.ts --reporter=list` — 1 passed; keep publishes both keys into `cursor-runner-last-held.json`, `/hangup` removes one, `killCursorRunnerLeavingAddress` retains the remaining key. Surfaces: `rememberCursorRunnerLastHeld` / `forgetCursorRunnerLastHeld` / `readCursorRunnerLastHeld` in `runnerPaths.ts`; keep/hangup in `runnerKeep.ts`.

Immediate next Behavior: slice 2 resumes unfinished last-held sessions after
current-runner start or replace.

### 2. Resume last-held unfinished sessions on the new runner without Recover
Type: Behavior
Status: planned
Proof: Fake-Cursor journeys above — replacement of a stale runner holding two
unfinished sessions leaves both held on the replacement without Recover while
the triggering launch stays running; machine-restart shape plus next new work
holds the prior unfinished session again without Recover; failure and
not-held/done controls as in the proof table. Observation on a stale runner
still starts nothing.

Behavior: Given unfinished Cursor sessions recorded in last-held and not held
by the accepting current runner, when new work ensures a current runner
(start after death or replace of a stale runner), then each such session is
resumed through the Recover keep path onto that runner so the dashboard no
longer says the agent is not running, without a Recover click. A session that
fails to resume stays unfinished with Recover offered; others still resume.
Sessions not in last-held, and finished or marked-done sessions, are not
started. Revival must not call `ensureCurrentCursorRunner` for its keeps
(settled premise): keep onto the accepting current port, or only after ensure
has settled, so the triggering ensure cannot deadlock. Prefer sequential
resume so each session gets Recover’s existing keep/timeout contract; do not
claim a stronger Working-within-wait guarantee. Update maintained runner /
terminal docs where they still say replaced held sessions only stand as
Recover records.

Safe stopping point: the whole incident journey — stale replace or dead
runner, previously held unfinished sessions running again without per-session
Recover — is observable end to end through the dashboard.

## Current decisions

- Revival is automatic only for unfinished sessions named by durable last-held
  evidence, at the current-runner new-work boundary — not on observation.
- Auto-revive reuses Recover’s keep/continuation/timeout-kept semantics;
  Working-within-wait under concurrency stays deferred as the story records.
- Native `cursor-agent` revival across a real runner replacement remains
  pending under ADR 0005 and is claimed nowhere in delivery evidence.
- Keep must **union-add** last-held keys (not rewrite from the live held set);
  otherwise a post-restart keep of new work would drop prior last-held
  candidates slice 2 needs to revive.

## Concern evidence

- Slice-plan refinement: not needed — two slices, one Structure immediately
  before its Behavior, one proof loop for the story outcome, no independent
  second outcome, no disputed constraint, and the re-entrancy constraint is
  settled and named in slice 2.
- Remaining slice-specific concerns: none identified.


## Story obligations

### X1. Deferred Working-within-wait under concurrent revival
Reported: slice 1 — "source review — deferred promise 18.1"
Story clause: "Guaranteeing that every revived session reaches Working with an accepted continuation inside the shared launch wait under concurrent revival"
Disposition: excluded "Guaranteeing that every revived session reaches Working with an accepted continuation inside the shared launch wait under concurrent revival"
Commitment: 18.1


### X2. Deferred auto-revive of never-held unfinished sessions
Reported: slice 1 — "source review — deferred promise 18.2"
Story clause: "auto-reviving unfinished not-running sessions that were never held by the replaced runner"
Disposition: excluded "auto-reviving unfinished not-running sessions that were never held by the replaced runner"
Commitment: 18.2

### X3. Deferred changing when replacement is triggered
Reported: slice 1 — "source review — deferred promise 18.3"
Story clause: "changing when replacement itself is triggered"
Disposition: excluded "changing when replacement itself is triggered"
Commitment: 18.3

### X4. No dual live runner generations
Reported: slice 1 — "source review — scope limit 27a"
Story clause: "No dual live runner generations."
Disposition: excluded "No dual live runner generations."
Commitment: 27a

### X5. No draining held sessions before replacement
Reported: slice 1 — "source review — scope limit 27b"
Story clause: "No draining held sessions before replacement."
Disposition: excluded "No draining held sessions before replacement."
Commitment: 27b

### X6. No preserving in-flight turn partial output
Reported: slice 1 — "source review — scope limit 27c"
Story clause: "No preserving a live in-flight turn's partial output across the process boundary."
Disposition: excluded "No preserving a live in-flight turn's partial output across the process boundary."
Commitment: 27c

### X7. No revival of sessions the dashboard did not launch
Reported: slice 1 — "source review — scope limit 27d"
Story clause: "No revival of sessions the dashboard did not launch."
Disposition: excluded "No revival of sessions the dashboard did not launch."
Commitment: 27d

### X8. No new developer ceremony for runner replaced
Reported: slice 1 — "source review — scope limit 27e"
Story clause: "No new developer ceremony or control for "runner was replaced.""
Disposition: excluded "No new developer ceremony or control for "runner was replaced.""
Commitment: 27e