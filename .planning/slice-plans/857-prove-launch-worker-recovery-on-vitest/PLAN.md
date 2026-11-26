# Prove Dashboard worker recovery and drain in Node Vitest

**Identity:** SEED-413#prove-launch-worker-recovery-on-vitest

**Source:** [Prove Dashboard worker recovery and drain in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-worker-recovery-on-vitest)

## Goal and scope

Give maintainers fast feedback on the launch decisions that protect an accepted
attempt through interruption, retry, settlement and Dashboard replacement. Move
the 16 cases in six backend Playwright specs to typed Node Vitest or their
receiving E2E journeys. Preserve real process, native input, Git and deployment
observations. Runner cutover and unrelated launch families have separate owners.

Former plan 846 delivered admission and settlement through slice 4. Its slices
5–8 transferred here. Former slice 5 maps to 1–3 below, 6 to 4, 7 to 5–6 and
8 to 7. The supplier's [landed plan](https://github.com/terryyin/open-dough/blob/420905723de59e71180451879726f684dcc7915e/.planning/slice-plans/846-prove-launch-starts-and-recovery-on-vitest/PLAN.md)
and the seed's satisfied dependency retain that history.

## Current decisions

- Apply the North Star topics [Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use typed owners and MakeMe data with private machine files. Keep process
  observations at their current receivers. The phone journey also follows
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows).
- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  favors a direct domain model. [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  places attempts on the machine and published story claims in Git. Under
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  compare the same behavioral workload, setup, support removed and elapsed
  feedback time. Report the native and deployment costs separately.
- PFE found the production owner and locked readmission in
  [LaunchAttemptOwner](../../../dashboard/server/launchAttemptOwner.ts) and
  [admitAttempt](../../../dashboard/server/launchAttemptAdmit.ts). A retry runs
  from the request reread under the machine lock. An eligible recorded launch
  can settle before pre-launch checks. Worker liveness, freshness of a read
  and admission during drain are separate decisions over that same attempt.
  Use the installed [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md)
  selection for backend data and [page objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  for the E2E interaction. Add no test-support wrapper.

## Decisive premises and baseline

Observed at `2a141478d649a326982889c87422ca1a5d362ac6` on 26 November
2026 in the owned preparation checkout, macOS on AC, Node 24.21.0, locked
`npm ci`, one worker per command under `caffeinate -s -i`. The host had
47% free memory and a load average of 6.47 at entry. Some runs overlapped.
Use the measurements for selection and sizing. Take a matched pair without
overlap for a speed claim.

| Consuming operation | Observed result |
| --- | --- |
| Backend command below on the integrated source | All 16 legacy Chromium cases and six Node controls passed first try in 56.16 s wall. The case times and ownership are listed below. |
| [Parked patch](SLICE-1-IN-PROGRESS.patch), originally against `0e58f2b6b` (stash `fb912b73b25715ba9388f02248c51b6fae666a83`) | `git apply --check` passed for all four paths. Applied in scratch, its three specs plus the own-record race ran 12 Node cases. Nine passed. Two lacked the required observed session state and one never reached host recovery. Typecheck also rejected the obsolete run arguments and `Promise.withResolvers`. Recover only the portions assigned to the current slice. |
| Typed continuation on the current contracts | Scratch used `attemptRun(source, own, { progress, notes, doneMarks, native })`, `AttemptRun(own, notes)`, explicit MakeMe session state and ordinary held promises. The one-shot fixture reported `notes.publication({ kind: "none" })` before timing out. All 15 cases in the three patch specs plus `agent-launch-{open-session-continue,own-record-continuation-race}` passed, as did Dashboard typecheck. Dropping effort from the dispatch to `owned.own` on retry failed the two-request assertion at `max`; restoring it passed. Dropping it before the locked reread had no effect. |
| Launch E2E command below | All 11 Chromium cases passed first try in 80.70 s wall. Restart observed one attempt ID, Take, worktree and launch. The second-server cases observed the live child and the later native worker, then a recoverable claim after owner death. Completed reconciliation read a descendant of the Take and found the durable marker on reload. Verification checked the native listing and one launch. |
| Native receivers for retry | The Codex lost-acknowledgment case counted one thread and one turn and observed resumed history. Disabling the production history match in scratch changed the Continue answer from launched to uncertain and failed that case. It passed after restoration. In the phone recovery journey, selecting `max` through `storyLaunchChoices` and reading both synthetic Claude invocations yielded `["max", "max"]` after the explicit Continue. The unchanged journey previously checked only the instruction on both calls. |
| Whole serial watcher command below | All 10 deployment cases passed first try in 112.01 s wall. [The held update](../../../e2e/runtime/productionHeldUpdate.ts) observed the old PID serving, 503 on Start, the accepted ID in the first drain receipt, and the same launched session on the replacement. The Node slice owns Continue's 503 and the separate publication hold. |

The patch and fault edits were reverted after observation. No slice has been
delivered. Backend paths below are relative to `dashboard/backend-tests/launches`.

| Baseline spec (omit `.spec.ts`) | Case times in ms, in runner order | Receiving slices |
| --- | --- | --- |
| agent-launch-continuation-interrupted | 3085 | 2 |
| agent-launch-uncertain-continuation | 5011, 5765, 1196, 1156, 1023, 1080, 1040 | 1, 3 |
| agent-launch-worker-handoff | 3850 | 4 |
| agent-launch-change-wait | 4486, 4093, 470 | 5 |
| settled-attempt-reconciliation | 4, 3, 9 | 6 |
| dashboard-update-drain | 3685 | 7 |
| Node controls (cross-server accept, admission close, worker) | 484, 535, 545 / 13 / 51, 1 | 2–7 as affected |

## Ordered slices

### 1. Settle Continue from its own launch before checking the checkout

Type: Behavior
Status: done
Estimate: 10–15 active minutes.

Call `LaunchAttemptOwner.continueAttempt` on interrupted and uncertain
execution and refinement records. With two eligible records and distractors
of another workflow, story or earlier time, observe the newest eligible
session, cleared worker and warning, and one durable settlement. Preserve
compatibility with existing launch records lacking explicit first-input state.
A missing checkout refuses a fresh Start but permits settlement from the
record. A failed attempt-file replacement preserves both stores and refuses
without dispatch. A pre-acceptance record alone cannot settle the attempt.

Use the confirmed-continuation part of the patch and the existing
`agent-launch-open-session-continue` and `agent-launch-own-record-continuation-race`
controls. Assert the precheck and run were never called on own settlement.
Remove only the five received cases from the legacy uncertain spec and its
sole runtime import of `ownRecordContinuation.ts`. The Intent code-browse
journey supplies that filename and its source as fixture literals. The
consumer trace found no runtime dependency there.

Delivered: `agent-launch-confirmed-continuation` holds six Node cases. The
focused selection with the two remaining uncertain Chromium cases and both
controls passed 15 of 15. Letting own settlement run the precheck failed five
of the six. `ownRecordContinuation.ts` was deleted. Refactor follow-up for
wrap-up: launch-owner specs repeat HOME, configuration and owner setup because
those production stores read the environment rather than typed inputs.

### 2. Recover the interrupted attempt's original conversation

Type: Behavior
Status: done
Estimate: 10–15 active minutes.

Convert `agent-launch-continuation-interrupted` in place. With a dead worker,
a pending first input and retained workspace, refuse fresh Starts of either
workflow, unknown IDs, wrong projects and premature reconciliation without
writing. Continue the original ID through the real owner and `attemptRun`
with its current services. Observe the saved record at native recovery,
confirmed input, same request and acceptance time, one session, no new launch,
refusal after settlement and idempotent reconciliation. Use the
[Codex recovery](../../../e2e/launches/agent-launch-codex-recovery.spec.ts)
assertions on native thread, cwd and turn count alongside
[restart](../../../e2e/launches/responsive-session-recovery-restart.spec.ts)
and [verification](../../../e2e/launches/responsive-session-recovery-verification.spec.ts).
A held host callback alone cannot establish native receipt.

Delivered: the spec is one Node case through `attemptRun` with
`native: () => ({ launch, recover })`, replacing the patch's host spies. The
four-spec focused selection passed 14 of 14 on Node with no Chromium case.
Letting reconciliation write before settlement failed it. Native receipt stays
with the three E2E receivers, which were unchanged. Refactor pass skipped: only
the subject spec changed, and its setup repetition is slice 1's follow-up.

### 3. Retry a timed-out launch at its saved effort while protecting a live launch

Type: Behavior
Status: done
Estimate: 10–15 active minutes.

Convert the last two `agent-launch-uncertain-continuation` cases. A timed-out
one-shot refuses both fresh workflows, retries its kept request only on
Continue, then refuses another Continue. Exercise slow-but-live as the
counterexample with held `AttemptRunNotes.slow` and a publication before final
settlement. Observe one dispatch, the same ID, cleared warning and worker.
Use the verified patch adaptations above. Preserve the native effort check at
the existing [phone recovery journey](../../../e2e/launches/agent-launch-story-card-problems.spec.ts)
by selecting `max` and reading both actual Claude arguments. Keep its
existing first-input, call-count and user-visible assertions.

Delivered: `agent-launch-uncertain-continuation` stays in place as two Node
cases with no Chromium case. An observed launch needs explicit session state.
The five-spec focused selection passed 16 of 16, and the phone journey passed
with `["max", "max"]`. Dropping effort from the retry dispatch failed the Node
retry case and the phone journey. Refactor pass skipped: only the subject specs
changed, through the existing `storyLaunchChoices` page object.

### 4. Protect both worker handoff windows

Type: Behavior
Status: done
Estimate: 10–15 active minutes.

Replace the duplicate server setup in `agent-launch-worker-handoff` with two
owners over one private attempt file. Observe the durable server worker before
the child's note is written. After a real child's exit, hold replacement by
the native worker while the recorded server still lives. At each window the
other owner reads running but unowned, refuses Start and Continue, and
dispatches nothing. Use the existing worker-note and file-replacement seams
in `launch-attempt-worker` and `agent-launch-acceptance-kept-first`. Drive
the note through its producer so deleting the server PID or admitting a
competitor too early fails the check. After settlement the worker is cleared.
The [second-server](../../../e2e/launches/agent-launch-second-server.spec.ts)
and [orphan](../../../e2e/launches/agent-launch-second-server-orphan.spec.ts)
journeys own actual server death, child survival and one published claim.

Delivered: one Node case where both owners share the test process, so
`process.pid` is the live recorded server and a real `node -e ""` child
supplies the dead script worker. A held `rename` keeps the native-worker
replacement. The five-spec selection passed 8 of 8 on Node. The new spec
passed five times alone. Dropping `serverPid` from `attemptWorker` or
treating an unowned worker as not running failed it. The `heldWhile` hook
preamble lost its only user and was removed. Its consumers, the completion
recovery and start-store specs, passed. Refactor pass skipped: only the
subject spec changed, plus that dead-code removal.

### 5. Answer a change wait from the reader's observed count

Type: Behavior
Status: planned
Estimate: 8–12 active minutes.

Convert `agent-launch-change-wait` at `changedAttempt(owner, id, waitMs, seen)`.
Let a real owner publish a worker note before the reader waits. The stale
count immediately receives the newer worker and count. The current count
waits for the next note or settlement. For a different live process the
answer stays pending until its bound and returns unchanged. A persisted
worker of this server, before local ownership, answers immediately. Control
the timer at the wait boundary and read the owner's actual observations.

### 6. Reconcile only from sufficiently recent settlement evidence

Type: Behavior
Status: planned
Estimate: 5–10 active minutes.

Convert the three already direct `settled-attempt-reconciliation` cases.
Exercise `settlement`, `askedAfterSettling` and the machine reconciliation
write. An outcome takes precedence over a completed report, a historical
outcome can lack a time, and an unfinished report alone cannot settle.
Check just before, at and after the report time. Inspect the persisted marker
after success and its absence on running, interrupted or uncertain attempts.
The [completed-report journey](../../../e2e/launches/responsive-session-reconciliation-completed.spec.ts)
owns the published read, failed refresh, restored story actions and reload.

### 7. Drain the accepted launch before replacing its preview

Type: Behavior
Status: planned
Estimate: 10–15 active minutes.

Convert `dashboard-update-drain` at the typed `AgentLaunches` entry.
Use its production composition of `LaunchAdmission` and `LaunchAttemptOwner`.
Hold admission as it registers, then hold publication and native confirmation.
After drain closes admission, Start and Continue reject with status 503.
Releasing publication alone leaves drain pending. At its resolution read the
launched outcome for the accepted ID from disk, one session and one dispatch.
Reuse the held-write pattern in `agent-launch-acceptance-kept-first` to
distinguish a settled callback from a completed durable write. The whole
[watcher journey](../../../e2e/runtime/production-watcher-updates.spec.ts)
owns HTTP, live preview continuity and replacement at the original URL.

## Proof and local gate

From the checkout root use fresh absolute proof paths and one worker. For
the final comparison include every surviving receiver, including any renamed
Node spec, and account for retired paths. All six original paths must have
a disposition and the backend selection must have zero Chromium cases.
The backend selector includes the proposed confirmed-continuation spec
so it also runs after that file is added. Run the phone journey with the launch selection for slice 3.

```sh
proof=$(mktemp -d)
selection='launches/(agent-launch-(change-wait|confirmed-continuation|continuation-interrupted|uncertain-continuation|worker-handoff|cross-server-accept)|dashboard-update-drain|settled-attempt-reconciliation|launch-attempt-(admission-close|worker))\.spec\.ts$'
launch='e2e/launches/(agent-launch-(codex-recovery|second-server(-orphan)?)|responsive-session-(recovery-(restart|verification)|reconciliation-completed))\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$proof/backend.json" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$proof/launch.json" /usr/bin/time -p npm run test:e2e -- "$launch" --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$proof/phone.json" npm run test:e2e -- 'e2e/launches/agent-launch-story-card-problems\.spec\.ts$' --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$proof/drain.json" /usr/bin/time -p npm run test:e2e -- 'e2e/runtime/production-watcher-updates\.spec\.ts$' --workers=1
```

Run the focused receiving specs per slice. Trace changed support and its
callers with the [consumer-trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
before removal. Run `npm run typecheck:dashboard` for typed changes and apply
the independent refactoring and delivery gates before each slice commit. Use
the default timeouts and run long local checks on awake macOS on AC under
`caffeinate -s -i` per [AGENTS.md](../../../AGENTS.md). Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to every failure and repair handoff.

Slice-plan refinement split continuation by its three distinct receivers and
separated waiting for a change from recording reconciliation. All seven slices
retain one proof loop within the active-time limit. No remaining slice-specific
concern was identified.
