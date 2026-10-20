# Keep Cursor sessions resumable across runner and machine restarts

**Source:** [SEED-052#cursor-runner-restart-resume](../../seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-runner-restart-resume)
**Identity:** SEED-052#cursor-runner-restart-resume

## Goal and scope

A recorded Cursor session that was resumable before its machine-local
runner or the machine restarted is resumable again through the dashboard,
and new Cursor work always runs on the dashboard's current runner code.
A runner that cannot prove it runs the current build — including every
runner started before build proof existed — is never silently reused for
new work: it is replaced at the next new-work boundary, and the sessions
it held stand as resumable launch records, never lost work.

Included: runner build proof and stale detection; replacement triggered
only by new work (`exec`/`create-chat`, a new keep, Recover); held
sessions of a replaced runner remaining visible, not-running, and
resumable with their saved conversation and recorded configuration
scope; preserved dashboard-restart reattach to a surviving current
runner; preserved refusal when the recorded workspace or scope is gone.

Excluded: resuming sessions the dashboard did not launch; preserving a
live in-flight turn across a restart; dual runner generations; draining
held sessions before replacement; any change to Claude or Codex runner
behavior; any user-facing stale-runner ceremony or new control. Reading
or listing sessions never starts or replaces a runner.

## Architecture and reuse

PFE decision: change the existing runner lifecycle boundary; reuse the
launch record, Recover, and runner start/stop machinery wholesale. Keep
one representation of each responsibility.

| Responsibility | Existing owner and use |
| --- | --- |
| Runner start, reuse, stop | `dashboard/server/hosts/cursor/runnerProcess.ts` owns starting one machine runner, reusing an accepting one, and stopping it. It gains build comparison and a current-build guarantee for new work; start-if-absent stays for startup and attach. |
| Runner address | `runnerPaths.ts` records `{port, pid}` under the machine home. The runner's build proof lives with this operational record (or the wire answer beside it), never in a launch record or project state. |
| Runner wire protocol | `runnerProtocol.ts` already tolerates older runners omitting newer fields (the `workspaceTrust`/`screen` precedent). Build proof follows that pattern: missing proof is readable and means stale. |
| New-work entries | `runnerClient.ts` (`execOnRunner`, `keepCursorClient`) and `recover.ts` are the new-work paths. Launch (`launch.ts`) reaches the runner only through them, so no launch-side change should be needed. |
| Held-session reading and attach | `heldSessions.ts`, `readCursorRunnerSessions`, and `terminalBridge.ts` observe or join the accepting runner. Reads never trigger replacement; the bridge joins a still-held client on the accepting runner and treats attaching to a not-held session as the resume it is (slice 1). |
| Resumption after a runner ends | `recover.ts` already resumes the recorded command with the recorded scope and types a continuation only on confirmed first input. Replacement reuses it unchanged; a replaced runner's sessions are exactly its not-held case. |
| Runner lifetime across dashboard restarts | The runner is its own process group and outlives the dashboard server (`cursorRunnerRestart.ts` proves same-client reattach). Replacement keys on runner build, never on dashboard process lifetime. |

Follow Accepted [ADR 0005 — native acceptance](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
deterministic fake-Cursor proof delivers this story; native resumption
with real `cursor-agent` across a real restart remains pending
verification and is claimed nowhere here. ADR 0008 is Proposed and is
cited as direction only: build proof is machine-local operational
evidence, rebuilt at runner start, consistent with its split between
published project state and local evidence. The North Star's
one-machine-runner topic stays true; no new North Star topic, database,
daemon, or ADR is needed. No Accepted ADR conflicts.

Build identity must distinguish current from stale in both serving
modes the dashboard actually runs: the bundled `runnerMain.mjs` and the
source `runnerMain.ts` with its sibling modules. An identity computed
from only the entry file is insufficient in source mode, where the
runner's behavior lives in the modules it imports; the slice's proof
must show a runner-only sibling change moves the identity in source
mode, and the bundled entry's content moves it in bundled mode. The
exact digest inputs are chosen inside slice 1 against that proof; a
hand-bumped version constant alone does not satisfy it, because the
model-scope failure was precisely a code change nobody stamped.

## Outside-in proof ownership

| Source examples / promise | Observable proof |
| --- | --- |
| 1: runner or machine restart → recorded session resumes with its scope | Existing `cursor-session-recovery.spec.ts` runner-death Recover journey (observed passing at planning) plus slice 3's restart-shaped journey with a scoped session. |
| 2, 6: stale or pre-proof runner → next launch/resume runs current code; replaced only once | Slice 1: a stand-in runner answering without proof, and a real runner whose recorded proof is made stale, both replaced before a keep/exec completes; the replacement pid answers later work and no second replacement follows. |
| 4: held sessions of a replaced runner stand as resumable records | Slice 2 journey: two held sessions, an unrelated new launch triggers replacement, both records read not-running with Recover offered, none done or deleted. |
| 4 (cont.): Recover after replacement resumes the same conversation and scope | Slice 2: Recover on one replaced session resumes the same chat id, with the recorded configuration scope applied when the record has one, on the current runner. |
| 5, 3: reads and held attach never replace; dashboard restart reattaches a current runner's client | Slice 2: listing and opening a held session on a stale-proof runner starts no process and changes no pid; existing `cursorRunnerRestart.ts` same-client proof stays green for a current runner. |
| 7: missing workspace or scope at resume still refuses, starting nothing | Existing Recover refusal cases in `cursor-session-recovery.spec.ts` and scope-unavailable handling in `recover.ts` stay green unchanged. |
| 8: Claude and Codex restart behavior unchanged | Focused existing Claude/Codex terminal-close boundary specs named in slice 3 stay green; this story touches no Claude/Codex module. |
| Observation never starts or replaces a runner | Existing `cursor-runner-sessions.spec.ts` not-running/unreachable cases stay green, extended in slice 2 with a stale-proof runner read. |

## Ordered slices

### 1. New Cursor work never runs on a stale or unproved runner
Type: Behavior
Status: done
Proof: Boundary proof with a stand-in runner that answers the wire
protocol with a wrong or missing build proof, and a journey with a real
runner whose recorded proof is turned stale while it holds a client:
the next keep or `exec` replaces that runner (old pid gone, new pid
accepting, current proof recorded) before the work is answered, and a
second new-work call reuses the replacement. Source-mode proof shows a
runner-only sibling-module change alters the computed identity.

Behavior: Given an accepting Cursor runner whose build proof is absent
or differs from the build this dashboard would start now, when a launch
`exec`, a new keep, or a Recover asks the runner for new work, then the
stale runner is stopped and a current runner started first, and the
work runs there. Given a runner whose proof matches, the same calls
reuse it untouched. Given no runner, they start one as today.

- Add runner build proof at the runner boundary: the runner publishes
  the identity of the code it is running with its address/wire answers,
  and the dashboard computes the identity of the runner it would start
  from the same resolved code (bundled entry or source tree), so the
  comparison needs no hand-maintained version constant.
- Split the runner-port resolution by intent in `runnerProcess.ts` /
  `runnerClient.ts`: new-work callers (`execOnRunner`,
  `keepCursorClient`, and through it launch and Recover) require a
  current runner, replacing a stale one through the existing
  `stopCursorRunner` + start path under the existing start lock, so
  concurrent new work replaces once. Start-if-absent callers
  (`launchBoundary` readiness, handoff release, hangup, session
  reads) keep today's semantics and never replace. The terminal
  bridge splits by what the accepting runner holds, checked with the
  read that starts nothing: attaching to a client it still holds
  joins that client on the accepting runner, while attaching to a
  session it does not hold is a resume and takes the new-work
  current-runner path first.
- Treat a live runner whose proof cannot be read (pre-proof runners,
  malformed address, protocol answers without the field) as stale for
  new work, while reads keep answering `unreachable` exactly as today
  for a runner that does not answer the protocol at all. Distinguish
  "answers but proves nothing current" (replace for new work) from
  "does not answer" (today's failure wording, no agent started).
- Keep the one-runner invariant: replacement ends the old process
  before the new one publishes its address, and the existing
  pid-alive + port-accepting checks still guard against port reuse.

Safe stopping point: new work provably runs only on a current runner;
held-session consequences of replacement are still slice 2's, and
nothing user-visible has changed yet for recorded sessions.

### 2. Sessions a replaced runner held remain resumable records
Type: Behavior
Status: planned
Proof: Fake-Cursor dashboard journey in the recovery/runner specs:
launch two sessions (one with a recorded configuration scope), turn
the live runner's proof stale, then launch a third session. The first
two records read not-running with Recover offered and no done/deleted
state; listing and opening either held session before the trigger
changed no pid and started nothing. Recover on the scoped session then
resumes the same chat id under its recorded scope on the replacement
runner; dashboard-restart reattach of a current runner's held client
(`cursorRunnerRestart.ts`) still passes.

Behavior: Given a stale runner holding recorded sessions, when
replacement happens at a new-work boundary, then each held session
ends as its launch record — not running, conversation and recorded
scope intact, Recover offered — and resuming it runs on the current
runner. Merely listing, opening, or stopping a held session before any
new work leaves the stale runner and its clients untouched.

- Verify the join in `heldSessions.ts` and the session-state reading
  already classify a replaced runner's sessions as not-held records
  with the existing Recover offer; repair only where replacement
  leaves a stale held reading, a missing record, or a wrong label.
- Keep Recover's existing guards in force for replaced sessions:
  missing workspace or unreadable recorded scope refuses and starts
  nothing; no fallback to the shared Cursor configuration.
- Ensure no record mutation follows replacement itself: records are
  neither deleted, marked done, nor given a completion; only the
  runner's in-memory clients end (its shutdown already hangs them up).
- Update the maintained runner descriptions
  (`dashboard/COMMANDS.md`, `dashboard/AGENT-LAUNCH-TERMINALS.md`) where
  they state the runner is simply reused when accepting, so they name
  build-current reuse for new work and start-if-absent observation.

Safe stopping point: the whole update journey — stale runner, held
sessions, new launch, Recover — is observable end to end through the
dashboard with no silent loss.

### 3. Restart resumability holds in the restart shapes developers hit
Type: Behavior
Status: planned
Proof: Restart-shaped fake-Cursor journeys: runner killed with its
address left stale (machine-restart shape) → reopening/Recover resumes
the recorded session on a freshly started current runner; production
watcher shape (a new dashboard deployment serving while the previous
deployment's runner survives with stale proof) → first new launch runs
current code. Focused Claude/Codex terminal-close boundary specs stay
green.

Behavior: Given the runner process is gone after a machine restart —
dead pid, stale address — when the developer reopens or recovers a
recorded session, then a current runner starts and the saved
conversation resumes. Given only the dashboard was replaced, held
clients of a still-current runner are reattached, not resumed.

- Cover the dead-pid/stale-address path through `ensureCursorRunner`'s
  existing acceptance checks; repair only if a reused pid or port can
  make a dead runner look current (identity comparison from slice 1 is
  the guard: an unrelated process proves no current build).
- Exercise the deployment shape at the boundary the production watcher
  uses (`scripts/watch-dashboard.mjs` ensures a runner once and the
  preview's launch boundary ensures on start): neither ensure replaces
  a stale runner on its own; the first real launch through the new
  deployment does, per slice 1.
- Name the pending native verification in the delivery evidence
  without claiming it: real `cursor-agent` resumption after a real
  runner kill and after a real machine reboot, with a scoped session,
  remains outstanding under ADR 0005 until a native run observes it.

Safe stopping point: every restart shape in the story's examples has
deterministic proof or an explicitly pending native check; the story
can close on deterministic evidence with the native gap named.

## Current decisions

- Replacement policy is replace-at-next-new-work, per the refined
  story's scope: held sessions end as resumable records. Drain-first
  and dual-generation were considered in the seed's Exploration and are
  not built.
- Build proof missing means stale. There is no grace mode for
  pre-proof runners; the one replacement they incur is the migration.
- Observation (session reads, Running Cursor list, alerts polling) and
  server startup never replace a runner. `launchBoundary`'s readiness
  ensure stays start-if-absent; a dashboard update alone kills no held
  client until new work is actually requested.
- This preparation authorizes no execution, Take, release, or native
  Cursor run. Slices remain planned and the story queued.

## Decisive premises and observations

Observed on 2026-10-21 in this workspace at
`7734cafd5b9b98bffabf20b03a2626da581b0e96`.

1. **Stale reuse is silent by construction.** The runner address holds
   only `{port, pid}` (`runnerPaths.ts`), the wire protocol has no
   version field (`runnerProtocol.ts`), and `ensureCursorRunner`
   returns true for any accepting runner (`runnerProcess.ts`). No
   consumer can distinguish current from stale today; slice 1 adds
   the missing proof rather than fixing a wrong comparison.
2. **Recover after runner death already works deterministically.**
   Ran the focused spec (worktree `node_modules` temporarily linked
   from the integration checkout, removed afterwards):

   ```sh
   npx playwright test --config dashboard/playwright.config.ts \
     dashboard/tests/cursor-session-recovery.spec.ts \
     -g "runner not running offers Recover" --reporter=line
   ```

   Result: 1 passed (4.9s) — after `stopCursorRunner`, Recover starts
   a runner and resumes the same chat. Slice 3 therefore proves
   restart shapes around an existing working core, not a new resume
   mechanism.
3. **Held clients are runner-memory only; conversations are not.**
   `TerminalAttachments` holds clients in a process-local map and its
   `close()` hangs them up, while records, chats, and scopes persist
   under the machine home (scope chats symlink to shared chats,
   `sessionScope.ts`). Replacing a runner cannot delete a saved
   conversation; slice 2's proof still observes the records' visible
   state after a real replacement rather than trusting this trace.
4. **Server startup eagerly ensures a runner.** `launchBoundary`
   returns `ready: ensureCursorRunner()`, so making the shared ensure
   stale-replacing would kill held clients on every dashboard restart
   and break the proved same-client reattach. The intent split in
   slice 1 is load-bearing, not stylistic.
5. **Native resumption is unobserved.** No local evidence shows real
   `cursor-agent --resume` surviving a real kill or reboot; the fake
   Cursor proves only the dashboard's half. This premise is not
   settled and is not bounded by a probe slice, because no unpaid,
   side-effect-free local observation reaches it. It is recorded as
   pending native verification under ADR 0005 in slice 3 and blocks
   no deterministic slice; no slice may claim it.

## Learnings

The scope-env failure in the model-scope story was not a missing kill
switch — `stopCursorRunner` already existed — but missing knowledge:
nothing could tell the developer or the dashboard that the accepting
runner was old. The fix is therefore proof first and replacement
second; a dashboard that restarts its runner on every start would
trade that silent failure for killing held clients on every restart.
