# Resume blocked execution on a qualifying change

**Source:** [refined story](../../seeds/SEED-345-session-token-efficiency.md#resume-when-blocked-work-can-advance)
**Identity:** SEED-345#resume-when-blocked-work-can-advance

## Goal and scope

Let a developer leave authorized execution blocked on a paused supplier or host
usage hold, without recurring model checks or reconstructing the execution.
Resume that same work once when its condition qualifies and delivery is supported;
otherwise preserve it and give actionable attention. Terry selected this boundary
on 2026-11-14. A successful automatic Codex journey is required; declaring every
host unsupported cannot fulfill it.

Retain ownership, workspace/branch, accepted proof and revision, unfinished work,
exact condition, supported continuation and next observation/recovery owner.
Keep execution authority, supplier-condition judgment, CI receipt/recovery and
overdue-verification rules. No automatic recovery after host/session exit or
quota resets is promised. Running-verification efficiency, general measurement
tooling, compaction, release and rollout remain outside this increment. These
limits require no rejection of cases the chosen simple mechanism naturally handles.

## Existing solution and architecture

PFE found these owners; change or expose a suitable existing seam before adding
another representation:

- `src/skills/dough-execute-plan/references/delegation.md` and
  `overdue-delegated-verification.md` own waiting and liveness. Add one shared
  blocked-execution rule at this execution boundary, linked by callers. A
  running command keeps its owner and supported continuation; do not replace
  that lifecycle with a supplier watcher.
- `src/skills/dough-product-backlog/references/supplier-dependencies.md` owns
  canonical agreements and evidenced satisfaction. A supplier event invites
  reassessment; neither a new SHA nor completion automatically satisfies prose.
- The existing Codex `dashboard/server/hosts/codex/{rpc,recovery,terminal}.ts`
  boundaries preserve identity and uncertain acceptance. They are reuse
  candidates, not an existing supplier-resume service. Probe the host boundary
  before choosing whether to reuse native yielded delivery or expose a cohesive
  transport seam. Installed workflow runtime must not depend on a running
  dashboard or import dashboard TypeScript as a new runtime prerequisite.
- `ci-notify-codex.md`, `ci-notify-hosts.md`, `ci-background-handoff.md` and
  `ci-completion-recovery.md` retain their CI meanings. The live-Claude CI handoff
  does not establish supplier delivery or exited-session recovery. Reuse its
  applicable transport only when the native probe verifies the same contract;
  do not add a second CI supervisor or retarget another owner's observer.

The common rule is a held execution with one owner and an exact condition:
non-model observation produces relevant evidence or attention, and the owning
execution reconciles current condition and acceptance before continuing. Borrowing
queue delivery suggests reconciling the observation/wait race and repeated events;
it cannot provide semantic satisfaction or exactly-once execution by itself.
Retain uncertainty rather than blindly resubmitting a native input.

Follow current Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(cohesion, one representation and suitable reuse),
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(author Proposed runtime changes in `src/skills`, never hand-sync installed copies),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(Native validation and A/B testing, including Terry's 2026-11-14 update),
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one executing-agent behavioral source),
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(repository authority versus local operational evidence), and
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
(equivalent useful outcomes at worthwhile total cost).
The existing [North Star's session boundary](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
supports these responsibilities; no additional topic or ADR is needed.
No Accepted-ADR conflict was found. ADRs 0007 and 0009 remain Proposed.

## Outside-in proof and decisive premises

Preparation observations below are from this owned checkout at
`99fba7f8485ce3cf27ae6ba66aed863b2c4dc763`, 2026-11-14. There were no scratch
production edits. CLI/source discovery is not a successful native-resume result.

| Premise and consuming operation | Observation and remaining work |
| --- | --- |
| The reported wait was a paused prerequisite, not a running verification | Retained SEED-324 coordinator message at 2026-11-13 16:41:34 UTC confirms pause and no publication. The seed links the local history locator and measured interval. Reconstruct that shape in isolated fixtures; do not use the live SEED-332 execution as a test target. |
| Codex offers saved-thread continuation controls | Local `codex --version` returned 0.169.0; `codex app-server --help` exposes native transport tooling. The existing recovery adapter reads/resumes the saved ID and reconciles acceptance; the official lifecycle page linked in the seed describes thread resume/turn start. The unpaid prefix succeeded. Actual delivery across the held-turn boundary, acknowledgment, configuration preservation and races remain Slice 1's state-changing native probe; no daemon, session or credentials were accessed by preparation. |
| The audited Claude usage notice supplies a reset condition | False: all four retained rate-limit notices omit a reset time; local Claude 2.1.325 help/listing exposes no structured reset field. This rules out a guessed six-hour timer. Slice 3 checks a supported read-only signal if available and otherwise proves explicit unavailable-signal fallback; no real quota exhaustion or credit purchase is required. |
| Existing managed CI recovery can retain deadlines, failures and predecessor records | `node --test src/skills/dough-execute-plan/scripts/execution-completion-recovery.test.mjs` passed all 4 scenarios plus their parent (5 tests, 3.79s): interruption/rerun, ordinary success, unread failure retention and controlled-clock inherited expiry. This is unchanged CI-boundary evidence, not supplier-wake proof. The earlier name-filtered invocation selected no nested scenarios and supplies no proof. |
| A maintained native publication case already exercises supplier resume | No such case is claimed. `tests/native-publication.md` and `tests/git-publication-native.sh` describe the existing runner and opt-in native route, not this new journey. Slice 1 builds the smallest isolated controller using the existing per-host stream reader; substitutes/replay cannot establish native delivery. |

Only a native session crossing the selected hold boundary can settle the
remaining delivery premise; preparation stops before that paid, state-changing
operation. Slice 1 bounds it before dependent implementation. No developer-operated
instrument is currently needed; a native trust/permission decision retains its
ordinary owner if encountered.

| Source example / final promise | Owner | Required observation |
| --- | --- | --- |
| 1: paused work remains recoverable with no model checks of unchanged state | Slice 2 | Start through the workflow entry, retain partial work and accepted proof, enroll the condition, drive unchanged/relevant/unrelated fixture events, and inspect request/continuation counts and retained state. |
| 2: a qualifying change continues the right authorized execution once | Slices 1, 2 | Native Codex re-entry without typed resume, then maintained command-level lifecycle proof. Verify owner, checkout, revision, authority and condition; a publication with insufficient proof leaves the condition blocked. |
| 3: repetition or uncertain acceptance creates no duplicate writer/submission | Slice 2 | Repeat/race the same event, change between initial read and enrollment, and lose acknowledgment after submission. Reconcile native history; retain uncertainty and actionable recovery without blind resend. |
| 4: meaningful deadline or lost signal/CI observation gives actionable status | Slice 3 | Controlled-clock expiry, unavailable/ended delivery and ended CI observation retain local proof, name recovery/owner and preserve the applicable CI receipt requirement. Keep genuine running-command overdue checks intact. |
| 5: host usage hold has an evidenced condition or explicit missing-signal fallback | Slice 3 | Observed limit input plus supported reset evidence or its absence yields the corresponding continuation/attention. No model switch, purchase, guessed reset or new execution authority. |
| Shared behavior and worthwhile improvement | Slice 4 | Representative Codex comparison, shared behavior review and risk-selected affected-host checks; explicit evidence limits; same publication/proof decisions, fewer idle requests, no extra rescue, and total implementation/evaluation cost disclosed. |

## Ordered slices

### 1. Observe automatic Codex continuation across a blocked turn
Type: Behavior
Status: planned
Proof: One isolated native held-execution journey with event/acceptance records.

Give the maintainer an observed feasibility result before selecting delivery
implementation. Use a disposable project/session with synthetic supplier evidence
and no real project publication. Under execution authority, minimally exercise
native wait/notification or saved-thread continuation into the same owner after
it yields. Preserve native workspace, model, policy and permission settings.
Drive the signal after a confirmed held state, replay it, and observe one
continuation, no recurring idle model requests and no developer-typed resume.
Record the exact transport, lifetime, identity, accepted turn and recovery limit.

Use the existing native host stream reader and retention contracts; expected
results belong in the assessment, not the agent prompt. A fixture invoking an
inner callback or a replay is not native continuation. Bound this to one probe
journey and its cheapest diagnostic follow-up; do not build a general scheduler.
If the available host cannot deliver, preserve the result and stop dependent
slices to revise the approach within scope. Do not weaken the required automatic
Codex result or declare delivery ready from API presence alone.

### 2. Hold and resume the same execution on relevant supplier evidence
Type: Behavior
Status: planned
Proof: Workflow-command lifecycle scenarios plus the selected native Codex path.

After Slice 1 succeeds, implement the smallest coherent retained-hold and delivery
path at the existing execution boundary. Give the developer recoverable work
while the supplier is unchanged and automatic continuation when the exact
condition qualifies. Retain the fields in scope, enroll/reconcile without a
lost-change window, and suppress repeat delivery to an already-handled execution.
Revalidate owner/authority and current supplier evidence before continuing.
Uncertain acceptance stays explicit and recoverable; never launch a replacement
writer or blindly resend. Naturally general condition handling needs no fixture
count limits or separate handlers for every example.

Keep shared policy in one runtime home with only necessary host bindings.
Update delegation callers and documentation together; retain the existing
running-verification route. Use command-level fixtures with real retained files
and native transport substitutes for deterministic errors/races, observing through
the workflow entry rather than supplying the promised state in test setup.

### 3. Give actionable attention when blocked execution cannot safely resume
Type: Behavior
Status: planned
Proof: Controlled events/clock through the same held-execution entry and output.

Extend that same lifecycle for meaningful deadlines, unavailable/lost signaling,
and usage holds. State the attention route and its supported lifetime when
enrolling. If no live route can deliver, report the limitation before yielding;
never promise a spontaneous alert after all relevant hosts/processes have exited.
Retain the condition, known state, accepted local proof, outstanding CI proof,
exact recovery and owner. Use the existing expected proof window/CI coverage
rules; invent no universal duration or new command timeout.

Check supported read-only host reset evidence without inducing a real usage
limit. Absence takes the agreed attention fallback. A fixture-provided reset
tests handling only; it does not prove a real host publishes that signal.
Exercise repeated attention/recovery and CI coverage loss; reuse SEED-343 managed
completion recovery rather than rearming observers or manufacturing CI success.
An unavailable native route stays visibly unavailable on that host.

### 4. Verify useful behavior and effort on representative native journeys
Type: Behavior
Status: planned
Proof: Retained native comparison, required host-specific observations and review.

Run the complete supported Codex supplier-pause journey from workflow invocation
through hold, qualifying evidence, resumed work and the same publication/proof
decision as a stated baseline. Reuse the research interval as historical problem
evidence; it is not a matched runtime baseline. Establish a bounded prospective
baseline/candidate with the same fixture, host/configuration, proof and relevant
events. Pin the payload source revision and installed content in each isolated
arm, varying only the blocked-wait behavior. Keep the smallest runnable example
with its real-work origin, workflow/problem and host/environment traits; do not
build the general comparison tooling owned by SEED-346. Record coordinator plus
worker requests/tokens where native history
provides them, idle-only requests, rescues, and tool/evaluation/maintenance effort.
Success requires zero recurring model requests solely for unchanged blocked
state, one accepted continuation and no extra developer rescue. Claim observed
improvement only for the comparable result actually obtained.

Review shared guidance's invocation, required context and useful outcome under
AGENTS.md for Cursor and Claude, including executing-project audience and the
fallback's truthful status. Reuse evidence only when behavior, integration and
runtime conditions still match. Select additional native cases for a new or
materially changed host integration or consequential acceptance risk, recording
why that host needs the observation; conventional guidance alone adds no routine
per-host native gate. Keep unobserved paths explicit and withhold release until
the required native evidence exists under current ADR 0005. Judge run artifacts
now, remove spent artifacts at wrap-up, and retain reusable examples and lasting
findings. No full host-by-scenario matrix is required.

## Current decisions, verification and concern review

- Preparation only: this plan authorizes no execution. No source review or
  execution-complete record is written during planning. Execution obtains its
  independent source review and retains obligations through its normal workflow.
- No blocking story dependency is introduced. SEED-343 is already delivered;
  SEED-332's live work is evidence, not a required test resource or supplier of
  this implementation. The effort-accounting sibling is not a prerequisite.
  The preparation's first landing incorporated Terry's updated ADR 0005 at
  `9900b8d21922c8cd97ffc9e872e76a0ff59af489`; this plan follows that policy.
- Follow [the project's failing/flaky-test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written for every local and published failure. Existing failures remain
  repair obligations unless another active execution owns that exact repair.
- Before changing tests, resolve their source paths through installed
  dough-makeme and, for browser tests, dough-page-objects and this project's
  `intent.locations`. Prefer runtime/command proof; no UI redesign is required.
  Use observable events or a controlled clock, never wall-clock sleeps,
  `test.slow()` or suite/hook timeout overrides.
- Local gates: affected command/runtime tests and retained CI-recovery tests,
  native probe/comparison, payload/reference checks when changed, applicable
  lint/typecheck and required refactoring/reviews before commit. Full-suite work
  follows [local resource admission](../../../tests/local-test-resources.md).
  On fully awake macOS use `caffeinate -s -i` for long/full runs on AC power;
  on battery plug in, or use the maintained lid-open `caffeinate -i` alternative
  and inspect the sleep log. Hosted CI is still owned through the applicable
  final revision; configuration alone adds no unrelated local full-suite gate.
- Expected guidance edit seams are currently below the 250-line refactor check:
  execute-plan SKILL.md 247, delegation.md 244, overdue-delegated-verification.md
  59; candidate Codex recovery.ts 154 and rpc.ts 194. Keep the shared blocked
  lifecycle in its focused home rather than expanding callers past the limit.
  Reassess any newly implicated oversized file before implementation.
- No numeric slice target was supplied; each slice has one bounded observation
  loop. Probe failure stops dependent work; it is not permission to widen scope.
- Slice-plan refinement was not needed: feasibility, the cohesive hold/resume
  result, attention/recovery and native evaluation have distinct proof loops.
  No remaining slice-boundary or cumulative-design concern was identified.
  The only unsettled delivery premise is bounded by the permitted early native
  probe in Slice 1; it remains unproved until that slice runs.

## Learnings

No implementation, native-resume result or measured improvement yet.
