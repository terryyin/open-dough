# Prove Dashboard launch admission and settlement in Node Vitest

**Identity:** SEED-413#prove-launch-starts-and-recovery-on-vitest

**Source:** [Prove Dashboard launch admission and settlement in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-starts-and-recovery-on-vitest)

## Goal and scope

Give Dashboard maintainers fast typed proof for request refusal, durable
kept-first admission, settlement under the write lock, and protections for
open sessions and already confirmed own launches. Dispose of the eight
legacy backend spec paths mapped below. Production restart, actual native
input, Git publication and receipt failure keep their E2E observations.

The developer selected the boundary after slice 4. Original slices 5–8,
the six legacy specs they cover, and the pending slice 5 changes move to
[Prove Dashboard worker recovery and drain in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-worker-recovery-on-vitest).

## Current decisions

- Follow the North Star on [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e),
  and [acting as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows).
  Use the [direct domain mapping in ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [local operational state in ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [the proof and cost comparison in ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- Reuse [wire admission](../../../dashboard/server/agentLaunchAdmission.ts)
  and the [answer adapter](../../../dashboard/server/launchBoundaryAnswer.ts)
  for method, origin, request parsing and dispatch. Use the existing
  [launch owner](../../../dashboard/server/launchAttemptOwner.ts) and its
  `AttemptRun` input for durable admission and handoff proof. Use the
  [machine JSON store](../../../dashboard/server/machineJsonStore.ts) for
  filesystem locking and replacement, and the existing
  [continuation owner](../../../dashboard/server/launchAttemptContinuation.ts)
  for selection under lock. Keep one meaning for each persisted state and
  one authoritative check under the lock. Origin remains authoritative for
  published story facts.
- The direct Node [independent writers](../../../dashboard/backend-tests/launches/agent-launch-cross-server-accept.spec.ts)
  and [admission-close](../../../dashboard/backend-tests/launches/launch-attempt-admission-close.spec.ts)
  cases already exercise real isolated machine files. Extend that pattern with
  `AgentLaunchRequest`, the real private attempt and record files, and
  deferred typed handoffs at the effect being held. Bind stores to the same
  private machine in both processes when independence is the observation.
  Reuse the existing decision and storage owners. Avoid starting Vite,
  mounting Chromium or preparing a Git origin for their unit cases.
- Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for requests,
  stories and kept records. Use the Dashboard entry and existing
  [page objects](../../../.agents/skills/dough-page-objects/SKILL.md) when
  extending an E2E journey. Leave malformed wire inputs visible. Add zero
  test-support wrappers. Remove support only when its last consumer has
  moved and the replacement observes the same effect.

## Decisive premises

Observed in the owned preparation checkout at `07435ba0f` on 25 November
2026 with Node 24.21.0 and Chromium, one worker, local locked dependencies,
and macOS on AC under `caffeinate -s -i`. Other work was running on the host.
Use these runs for behavioral evidence and take a comparable pair for the
execution's performance claim.

| Premise | Consuming operation and result |
| --- | --- |
| The maintained backend selector reaches the kept-first and interrupted paths | The exact first-plan backend command below passed all 60 cases on the first attempt (54 Chromium across 14 legacy specs and six Node across three controls). Chromium took 234.137 s summed, 1–20,939 ms per case, with 23 at or below 100 ms. The Node controls took 4.281 s summed, about 1–1,576 ms per case, with two at or below 100 ms. The whole selection took 268.66 s wall. It observed refused duplicate effects, real kept-first writes, retained-input replay and last-record checks under contention. |
| Existing Node owners can observe admission before effects and across independent writers | The same backend command restricted to `agent-launch-cross-server-accept` and `launch-attempt-(admission-close|worker)` ran six Node cases, all passing on the first attempt in 18.01 s wall. Closing during the real file replacement kept the exact request without calling the run function. Distinct stories were admitted and concurrent requests for one story produced one winner across processes. |
| Restart, handoff, verification and reconciliation reach their real consumers | The launch E2E command below passed all eight Chromium cases on the first attempt, in 101.80 s wall and 92.146 s summed. It recovered the original claim after the owner process exited, followed one session across servers, verified the session in the kept workspace, and reconciled after the completed report and published Take were read. |
| The updater waits through settlement on its actual preview | The watcher E2E command below passed all ten Chromium deployment cases on the first attempt, in 89.41 s wall and 66.362 s summed. The held-update case observed 503 at closed admission while the old preview still served, then saw the accepted attempt settled in the first drain receipt before replacement. |

## Execution context

- Story Branch Mode in `/Users/terryyin/git/open-dough/.worktrees/prove-dashboard-launch-starts-and-recovery-in-no`
  on `codex/prove-dashboard-launch-starts-and-recovery-in-no`. Publisher
  `dashboard-territory.local-open-dough`, agent Koharu-chan, integration
  `origin/main`. The established published claim and first increment's
  publication base were `dddc9adfa11f8553d23b4a28442291757d6e2f05` on
  the remote execution branch. Starting revision `1c30d89b7f57f2b85239f7ef2fc503fef08c97a5`.
  The start reported changed readiness. The source and plan matched trunk
  `6b267497e02efe0c5c24f0fdcccd17b900641fee` at execution entry.
- Locked npm setup, Chromium 158.0.8127.18 prerequisite, and Dashboard
  typecheck passed on Node 24.21.0. GitHub Actions `ci.yml` observes
  `terryyin/open-dough` on the execution branch through coordinator
  `seed-413-launch-vitest-543ac591`. The initial stream
  `/tmp/dough-ci-501/watch-yG851C` stopped on the first CI handoff.
  `/tmp/dough-ci-501/watch-fJHtXy` stopped on the second handoff.
  The live stream is `/tmp/dough-ci-501/watch-wsI7Am`, PID 64227,
  session 3872, cell `g601:11`.
- The mapped backend baseline at the published claim passed all 60 cases
  with one worker on awake macOS on AC. Chromium selected 54 cases in 14
  specs (47.831 s summed, 0–4,794 ms reported, 26 at or below 100 ms).
  Node selected six cases in three controls (0.795 s summed, 0.481–266.093
  ms, three at or below 100 ms). The selection took 55.60 s elapsed.
  The run record is `backend-baseline.json` in the worktree's Git evidence
  directory. Host load at setup was 7.71 over one minute with 48% memory
  free and other browser processes present. Repeat one worker on the same
  AC-powered host and reconsider the relative-cost claim if load or
  competing proof changes materially.
- The retained launch E2E selection at the claim passed all eight cases in
  five specs on the first attempt (44.038 s summed, 47.53 s elapsed). The
  one-worker run overlapped the first slice's editing period. The proof
  record is `launch-e2e-baseline.json` in the worktree's Git evidence
  directory. Reuse this observation while the product and E2E paths match.
- The retained `agent-launch-publication-receipt-failure.spec.ts` passed
  both execution and refinement cases on the first attempt (10.697 s
  summed, 15.92 s elapsed). The real installed publication succeeded, the
  failed receipt stopped native dispatch, and Continue kept the same
  attempt, publication, worktree and claim. The proof record is
  `receipt-failure-e2e.json` in the same evidence directory.
- CI run 45771446265 for accepted slice 1 `452af72a9` was cancelled
  after the accepted slice 2 push started run 45772659282 on the same
  workflow and branch. The former attempt's complete diagnostic lists
  zero failed jobs. The workflow cancels superseded push runs, so completion
  remains attached to the newer candidate.
- The next push at `678668f9d` likewise superseded CI run 45772659282.
  The cancelled attempt lists zero failed jobs in its complete diagnostic.
  The new same-target run is 45773942749.
- The developer deferred diagnosis of the original frontend disconnect
  until a matching failure appears again in ordinary CI. The temporary
  capture was removed. See the [frontend diagnosis](diagnosis-frontend-browser-connection.md)
  and the [separate E2E repair](diagnosis-intent-ci-follow-up-navigation.md).
- The in-progress slice 5 changes are recoverable through the
  [follow-up plan](../857-prove-launch-worker-recovery-on-vitest/PLAN.md).
- The first bounded hosted frontend capture passed. A backend test in the
  same run exposed a setup race between a readable attempt file and a
  settled owner. The [worktree retry diagnosis](diagnosis-worktree-update-retry-refusal.md)
  retains the forced interleaving and evidence for the test setup repair.

## Ordered slices

### 1. Refuse an invalid launch before dispatch

Type: Behavior
Status: done
Estimate: 8–12 active minutes.

Proof: Malformed or disallowed inputs reach the production request admission
and return their actual 400, 403, 404, or method-refusal answer without a
Start or Continue call. Cover origin and Host, unknown project, malformed
JSON, wrong workflow, identity, title, instruction, and change query.
Supply an admitted origin, configured source lookup and tracked launch
operations for the applicable checks. Verify real successful dispatch in
the retained Start journeys. Convert `agent-launch-refusal.spec.ts`.

Accepted proof: the maintained backend selector ran 30 Node cases and
zero Chromium cases for this spec. All 23 legacy cases have receiving
assertions, with compound change-query and JSON cases made individual and
one explicit malformed Continue case added. `expectRefusal` observes the
production status, body and absence of Start and Continue calls on each
refusal. The successful absent-attempt read uses the real owner on the
private configured machine. Dashboard typecheck passed. The retained
restart E2E begins through the real Start and observes the accepted
attempt eventually settle with one native launch. The focused selector is
`launches/agent-launch-refusal\.spec\.ts$`. See `slice-1-return.md` and
`slice-1-reviewed-refusals.json` in the Git evidence directory. The change is
confined to the subject spec, with reusable production admission and
local test setup, so the acceptance review found no refactor candidate.

### 2. Keep the exact request before starting work

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: Call the launch owner with a typed request, a private machine store
and a held `AttemptRun`. Read kept request and publication before releasing
work. Try a competing workflow for the same story while it is held and
confirm only one effect. A store failure refuses without effect, and a
later publication-receipt write failure preserves the known stop. Check
that removal of the caller's wait does not stop settlement. Retain the
independent-writer case for the cross-process lock and the installed
baseline's first-input and Git publication signals through the retained
E2E. Convert `agent-launch-acceptance.spec.ts`.

Replace the existing 260-line spec's HTTP, Git origin, native-process
setup and teardown with its cohesive launch-owner cases. Keep one spec
under 250 lines around the attempt lifecycle, with private machine files
and typed handoffs. The named E2E consumers keep the actual Git and
native effects, including the existing publication receipt failure
journey. The baseline selector and shared browser fixtures remain
available to their other callers.

Accepted proof: three migrated Node cases and four retained independent
writer and admission-close cases passed. Chromium selected zero. The
launch effect reads the exact saved request, worker, and initial receipt
on entry, and a held native handoff keeps competitors blocked after
publication. The initial write refusal dispatches nothing. The actual
`attemptRun` stops on failed receipt replacement, preserves the known
publication in memory, and leaves the store bytes intact. The receipt
failure and second-server journeys keep real publication and native
effects. Dashboard typecheck passed. See `slice-2-return.md` and
`slice-2-acceptance-2.json` in the Git evidence directory. The acceptance
review found no refactor candidate within the cohesive subject spec.

### 3. Keep settlement observable while writing

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: Hold the actual write at reporting then at outcome replacement in a
private store. The typed change reader shows a kept running attempt and the
settled outcome after the owner releases the lock. Read again after a
stale in-flight answer, including the gap when the replacement is readable
but the writer still owns the lock. Use a real second Node process where
the first process's lock supplies the condition. Keep the acquisition and
release within test lifetime. Convert `agent-launch-acceptance-kept-first.spec.ts`
and remove the temporary HTTP/Vite host in
`accepted-attempt-settlement.spec.ts`. The two cleanup cases fault the
retired Playwright fixture itself. Remove them together with its local
server and held-push teardown after tracing the retained follower helper
and its callers.

Accepted proof: the two migrated Node specs and admission-close control
passed with zero Chromium selections. The production run retains the
running answer during the real reporting and outcome replacements. The
independent Node owner returns a stale running answer while the parent can
read the replacement and observe the lock. Its second answer shows the
settled outcome with the lock released. The two nested Playwright tests
covered only the removed fixture, and the retained HTTP follower and its
E2E callers still exercise the real process and native effects. Dashboard
typecheck passed. See `slice-3-return.md` and `slice-3-final-settlement.json`
in the Git evidence directory. The acceptance review found no refactor
candidate in the subject specs.

### 4. Protect an open story and continue only its own launch

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: Pass the configured source, typed requests and real kept records
through pre-acceptance and Continue. An unrelated open session or
unreadable record refuses the effect, and another story can still start.
An own confirmed record settles the same attempt with no second effect.
With a competing writer holding and releasing the real lock, check that
Continue sees the newer running or settled state and re-reads an own
record that appeared after pre-acceptance. Assert that the refused paths
preserve store bytes. Retire the three open-session and own-record cases
only after observing all three results at the typed boundary.

Accepted proof: 18 migrated Node cases and three independent-writer
controls passed with zero Chromium. The configured launch owner refuses
open or unreadable records without dispatch and leaves both files intact,
while other stories and released records stay eligible. Continue settles
its own record on the original attempt without a new effect. At the real
machine lock it preserves newer running and settled attempts and picks up
a record added after pre-acceptance. The retained story-card E2E passed
Mark Done, Delete record and stale-dialog refusal (one case, 13.113 s
case time, 19.93 s elapsed). Dashboard typecheck passed. The independent
refactor review made no edits and confirmed both former callers of
`openStorySessionAcceptance.ts` migrated. See `slice-4-return.md`,
`slice-4-final-open-session.json`, and `open-session-e2e.json` in Git evidence.

## Proof ownership and local gate

Files are relative to `dashboard/backend-tests/launches/`.

| Slice | Legacy selection | Observable proof |
| --- | --- | --- |
| 1 | `agent-launch-refusal.spec.ts` | Typed refusal and zero dispatch |
| 2 | `agent-launch-acceptance.spec.ts` | Kept exact request, no duplicate effect, refusal and receipt stops, and detached completion |
| 3 | `agent-launch-acceptance-kept-first.spec.ts`, `agent-launch-acceptance-kept-first-cleanup.spec.ts`, `accepted-attempt-settlement.spec.ts` | Running while reporting or settlement is held, release before the follower's settled answer, and retirement of the old test-local teardown contract |
| 4 | `agent-launch-open-session.spec.ts`, `agent-launch-open-session-continue.spec.ts`, `agent-launch-own-record-continuation-race.spec.ts` | Same-story block, own-record settlement, last evidence under lock, unreadable evidence preserved |

The slice records above account for each migrated or retired observation
and retain the process, Git and native proof at its existing E2E boundary.
Check the combined maintained backend selection once with one worker and
record its Node and Chromium counts. The earlier 14-spec benchmark describes
the pre-split population. Use per-slice comparable evidence for that
population's retained subset before making a time comparison.

```sh
selection='launches/(accepted-attempt-settlement|agent-launch-(acceptance(-kept-first)?|cross-server-accept|open-session(-continue)?|own-record-continuation-race|refusal)|launch-attempt-(admission-close|worker))\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
```

Use awake macOS on AC under `caffeinate -s -i` for long local checks per
[AGENTS.md](../../../AGENTS.md). Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to each failure and repair handoff. Keep default test timeouts.

## Delivered-boundary verification

The retained selection passed 59 Node Vitest cases across ten files, with
zero Chromium selections, one worker, and 4.44 s elapsed. This includes
three maintained Node control files and the seven surviving files in
the eight-path disposition. The full proof record is
`retained-admission-combined.json` in worktree Git evidence. The former
cleanup spec and its fixture were retired in slice 3. The named E2E
observations in the slice records remain the process-side proof.

The Intent Coverage check on `39d0aafd3ce7b4b555723ac5390f4c6bb2bd17d3`
observed the durable instruction change before dispatch in a scratch
witness. The maintained exact-disk assertion caught it; restoration passed.
Keep that assertion. No further coverage action is needed for that path.

## Plan review

Slices 1–4 delivered the independent admission and settlement boundary with
accepted focused proof. Former slices 5–8 and their remaining promises are
mapped in [plan 857](../857-prove-launch-worker-recovery-on-vitest/PLAN.md).
