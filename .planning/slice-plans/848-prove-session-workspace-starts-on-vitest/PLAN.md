# Prove Dashboard session workspace choices in Node Vitest

**Identity:** SEED-413#prove-session-workspace-starts-on-vitest

**Source:** [Prove Dashboard session workspace choices in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest)

## Goal and scope

Move the surviving backend unit proof for workspace choice, confirmation,
story admission, startup recovery, landing, expiry, and scheduled feedback
from the legacy runner to Node Vitest. All 18 original paths below, and the
cutover's `admitted-session-duplicate.spec.ts`, need a disposition. Preserve native dispatch, installed command and Git proof at
their actual boundaries. The [campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage)
assigns the generic launch lifecycle, host options and protocol, ordinary
follow-up, retained record readers, and runner removal to other stories.
Observe the cutover's chosen blank-start policy. Product policy and
production data migration belong to SEED-439.

## Current decisions

- Begin from accepted trunk after the recorded SEED-439 prerequisite clears.
  Use its completion evidence to identify the delivered contract and proof
  owners. [Plan 833](https://github.com/terryyin/open-dough/blob/1ee3eb03b59a2133fdb73dddaf28c9d44fef2de8/.planning/slice-plans/833-complete-story-linked-ad-hoc-sessions/PLAN.md)
  records the supplier's delivered contract and acceptance evidence.
- Follow the North Star on [direct production test boundaries](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Vitest for unit checks and Playwright for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e),
  and [immediate browser actions](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  for any E2E changes. Apply [ADR 0002's domain mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [ADR 0008's state ownership](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [ADR 0010's improvement comparison](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
  The origin owns membership and accepted revisions. Local records keep
  the selected checkout, launch progress and authority required for recovery.
- Follow the production path from [launch admission](../../../dashboard/server/agentLaunchAdmission.ts)
  through [request acceptance](../../../dashboard/server/agentLaunchAccept.ts),
  [workspace/start selection](../../../dashboard/server/unattachedStart.ts),
  [kept starts](../../../dashboard/server/sessionStartStore.ts), and
  [continuation](../../../dashboard/server/launchAttemptContinuation.ts).
  Reuse the integrated admission and landing owners. Borrowed and isolated
  starts vary the checkout and Git authority in the same launch contract.
  Scheduling is a caller of that contract. Keep the delivery and expiry
  rules with their existing production owners. If a case needs a wide
  fixture, narrow the production seam at its own boundary in that slice.
- Use the real private machine JSON store for kept state, real checkout
  and bare origin for Git observations, and a typed recording collaborator
  at the effect a Node case must observe. Leave process/protocol and
  installed-tool behavior with a real boundary check. Use
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for valid fixtures
  and [Dashboard page objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  for any browser proof changes. Add zero test-support wrappers. Remove
  unused fixture code after tracing its last consumer.

## Decisive premises

| Consuming operation | Observation and remaining check |
| --- | --- |
| Identify the legacy paths to account for before choosing replacement cases. | At preparation revision `53b05ed59`, after SEED-439 integrated, Node 24.21.0 ran the maintained `groupFiles(backendGroup)` selector (603 backend specs, 310 Vitest). All 18 mapped basenames still exist under `dashboard/backend-tests/launches/`, each matched once and selects Playwright. The cutover rewrote ten of them and added `admitted-session-duplicate.spec.ts` (Playwright, one case per Claude and Codex host: the borrowed checkout opens only after its claim reaches the origin). No other story owned it, so slice 1 does. The original run at `07435ba0f` passed 40 legacy cases with 182.387 s summed case time; that is historical pre-cutover context. |
| Establish the replacement baseline and prove installed admission and landing at the delivered boundaries. | The integrated contract is [plan 833](https://github.com/terryyin/open-dough/blob/1ee3eb03b59a2133fdb73dddaf28c9d44fef2de8/.planning/slice-plans/833-complete-story-linked-ad-hoc-sessions/PLAN.md) at `1ee3eb03b`, accepted as `672ce9a0c`. Blank Start stays blank at the native host, and the landing selection reaches the invoked workflow through its existing handoff (its slice 9, G5 and G6). At `53b05ed59`, every retained E2E path and production owner this plan names exists, along with the delivered `e2e/launches/agent-launch-unbound-continuation.spec.ts`. Slice 1 reruns the scoped backend baseline in the owned checkout before editing; it measures cost and does not decide a slice's outcome. |

## Ordered slices

### 1. Start in the borrowed checkout on the admitted story

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Begin with the cutover probe. Trace all 18 mapped paths and
`admitted-session-duplicate.spec.ts` through the cutover's rewrites and
replacement assertions. Run the
runner listing and a focused built-in borrowed Start against the delivered
profile with a private origin. Confirm the actual story binding at dispatch,
and locate the live blank-start, scheduled, and landing readers. Capture the
comparable scoped backend baseline before editing. Where an assertion has
already moved or product behavior was retired, record the evidence and the
surviving owner, including any new cutover spec that inherits a mapped
case. If the integrated contracts or the baseline cannot be verified, stop
dependent migration and revise the affected slices before porting cases.

Proof. A typed ad hoc Start through the production admission and start
handler returns the selected execution checkout and common repository.
Drive explicit and default checkout choice, blank input and title, long or
unusable title input, and refusals still owned by the accepted route. Verify
one published Taken story before the recorded launch effect and the same
session on that story. Use an actual checkout, an admitted source and launch
request, a fixed clock where the title depends on time, and the native
handoff recorder. Observe that a blank launch stays blank at the actual
host in the retained E2E. Preserve exact text at the first-input boundary
in slice 2. Retire standalone inventory expectations with the supplier's
story-membership proof.

Outcome (7 active minutes). Probe at `dffa94bab`: all 19 mapped paths
existed on the legacy runner and none of their assertions had moved. Live
readers are `hostLaunch.ts`, `retainedLandingDecision.ts` and
`branchLandingContext.ts` for blank Start and landing, and
`feedbackMaintenanceCheck.ts` with `repeatingCheck.ts` for scheduling.
No production seam was needed. `started()` in `launchStart.ts` already
takes the checkout, start-store factory and env. Each case needs its own
`HOME` (`vi.stubEnv`), or it reads the previous case's kept start. A Codex
origin needs `startOrigin(repository, { host: "codex" })`, kept once in
`beforeAll`.

- `ad-hoc-start-labels.spec.ts` (6 node cases) owns the admitted title
  (text, blank, spaces, control character, 40-character cut), the
  as-typed instruction, and the refusal of an identity.
- `ad-hoc-borrowed-start.spec.ts` (Claude instructed, Claude blank,
  Codex) owns one published Taken story and profile on the origin when
  Start returns. It also owns the execution checkout as workspace with
  HEAD, symbolic-ref, index and status unchanged, and `defaultStart`'s
  checkout and common repository. Native dispatch follows the awaited
  `started()` in `launchRun.ts`. Slice 3 owns the held-admission zero-call
  observation for the same contract.
- Retained owners: `e2e/launches/agent-launch-ad-hoc.spec.ts` (session
  name, blank prompt, cwd, session under its Taken story, sidebar).
  `agent-launch-model-boundary.spec.ts` keeps default effort.
  `agent-launch-refusal.spec.ts` keeps the 403, 404 and over-limit 400.
  `agent-launch-duplicate.spec.ts` keeps the duplicate answer, and the
  Codex input specs keep `firstInput`. Standalone inventory is retired
  against SEED-439's story-membership proof.
- Removed `agent-launch-ad-hoc-boundary`, `agent-launch-ad-hoc-sessions`
  and `admitted-session-duplicate`. All their support exports keep other
  consumers. Bash `--list` shows both new files on `[node]` and zero
  legacy cases for the removed paths.
- Cost, one worker: before, 13 Playwright cases, 25.6 s summed, 36.9 s
  wall. After, 9 node cases, 7.1 s summed, 10.1 s wall, with no failures
  or retries. The three Git cases run 2.3–3.6 s each and the title cases
  about 1 ms.

### 2. Start with existing changes only after confirmation

Type: Behavior
Status: done
Estimate: 10–14 active minutes.

Proof. Submit a borrowed checkout containing staged, unstaged and untracked
changes. With no confirmation or stale confirmation, the real checkout
probe returns the current fingerprint with no attempt or native dispatch.
Confirm that fingerprint through Start and read the request, checkout and
native handoff. Verify the fingerprint stays out of retained input, the
developer's bytes and order survive, and index, branch and working tree
still hold the same changes. Preserve the default policy and refusal for
any unsupported tracked request still present after cutover. Use the typed
ad hoc request with explicit policy and confirmation, real temporary Git
state, and a tracked effect at dispatch. Retain real Codex and Cursor
workspace and input observations through the existing E2E when they
distinguish those paths. Extend those journeys only for observations the
supplier still needs and that no retained native check sees.

Outcome (5 active minutes). `ad-hoc-existing-changes-start.spec.ts` (4
node cases) runs a real borrowed checkout with staged, changed, deleted
and untracked files. `unconfirmedStart` answers the same `existing-changes`
fingerprint (count 4) whether the policy is absent or named, and also for a
stale confirmation, and keeps no record. A confirmed request then returns
undefined, and `started()` publishes the Taken story on the borrowed
checkout. `recordedRequest` drops `existingChanges`. The shared
`unattachedInput` keeps the developer's whitespace-laden text byte for byte
and in order, for review and auto-land, and never includes the
fingerprint. Symbolic-ref, HEAD, `ls-files --stage` and porcelain status
are unchanged. The request schema refuses an ad hoc `tracking` choice.
`cursor-missing-workspace.spec.ts` owns the stale-workspace answer, which
names the path instead of asking to install Cursor.

- Retained owners: `e2e/launches/agent-launch-ad-hoc-cursor.spec.ts` holds
  the borrowed cwd, `--workspace`, no skill line, and refusal of a blank
  start with a model. `agent-launch-ad-hoc-codex.spec.ts` holds the single
  text item, `thread/start` cwd, `turn/start` and exact bytes.
  `agent-launch-start-session-existing-changes.spec.ts` holds the dialog,
  the stale refusal and attempts with no confirmation.
  `agent-launch-uncertain-continuation.spec.ts` holds the missing
  workspace on continuation.
- Removed `agent-launch-start-session-existing-changes-boundary` and
  `agent-launch-ad-hoc-cursor-established`. The Codex existing-changes case
  left `agent-launch-ad-hoc-codex-input.spec.ts`; slice 8 owns its two
  remaining cases.
- Cost, one worker: the slice's 6 Playwright cases took 23.1 s summed.
  The node cases that replace them take about 5.5 s: Git cases 0.8–2.6 s,
  unit cases 2–4 ms. Slices 1 and 2 share `checkoutState` in
  `dashboard/test-support/support/executionCheckoutChanges.ts` for the
  unchanged-checkout observation.

### 3. Open the isolated checkout only after published admission

Type: Behavior
Status: done
Estimate: 10–14 active minutes.

Proof. Give the production Start owner a typed isolated request and a
selected host with a private worktree and bare origin. Hold the admission
result and observe zero native calls until it verifies the actual published
Taken identity. An origin mismatch or definitive refusal opens no native
session. Losing a provisional claim to a competitor leaves the competitor
intact and allows a fresh draft when Continue actually needs it. A lost reply
after acceptance reconciles the already-published claim without allocating
another one. Use the installed command where Git publication and receipt
parsing are the observation, with recorded native dispatch and kept
attempts. Retain the isolated E2E for real cwd, one worktree, first-input
handoff and order relative to publication. Reuse the same admission
contract proven in slice 1.
Slice 1 found no held-admission observation for the borrowed start, and
slice 2 removed the Cursor isolated case that read Cursor's `--workspace`
argument naming the new worktree. Observe both here at the same native
dispatch, or name a retained check that does.

Outcome (6 active minutes). `attemptRun` now takes its native dispatch as
a typed service. Production passes the `launchHost` registry from
`agentLaunches.ts`. The refactor moved the native session into
`nativeSessionRun.ts` and kept the workflow start in `launchRun.ts`
(257 to 189 lines).

- `admitted-session-start.spec.ts` (6 node cases) runs the isolated and
  borrowed workspaces through `attemptRun` with a recording dispatch, a
  real bare origin and the installed start.
  - Held admission: while the origin's pre-receive hook holds the
    publish, there are zero dispatches and the origin is unchanged. After
    release there is one dispatch on the published Taken identity and
    revision, in the selected workspace.
  - Origin mismatch: the start is refused with zero dispatches.
  - Lost publication reply: the claim is kept with `publishedSha`. On
    Continue, the same receipt is noted, there is no new claim, and there
    is one dispatch.
- `admitted-session-competing-claim.spec.ts` (1 case) owns the lost
  isolated claim. The competitor stays intact and Continue drafts a new
  identity with one dispatch. The case measured 6.2 s, so it alone
  overrides its timeout.
- Retained owners: `agent-launch-start-session-isolated-codex.spec.ts`
  stays as the Codex owner of `thread/start` cwd and ordered input,
  because the isolated E2E is Claude-only. `e2e/launches/agent-launch-start-cursor.spec.ts`
  maps a created worktree to Cursor's `--workspace`. No check reads that
  argument for an ad hoc isolated start itself.
- Removed `admitted-session-refusal` (2 cases) and `admitted-session-retry`
  (3 cases). The 5 Playwright cases took 12.5 s summed; the 7 node cases
  take about 15 s, held by the real origin hooks and the race.

### 4. Continue from the kept checkout and policy

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof. Exercise the typed Start and Continue inputs through the delivered
session-start owner with the private session-start and attempt stores.
Begin with no workspace, a worktree created before reply, or a kept
establishment whose formatter or native start stopped. Reopen the same
attempt and check workspace, branch, policy, story and input at the effect.
Observe the original receipt guard before retrying after unreadable output.
A definitive stop before establishment leaves no kept workspace decision,
so a later independent Start can choose again. If the session exists with
uncertain input, recovery observes that session without a second send.
A distinct landing policy cannot accidentally resume the waiting session.
Use actual temporary Git state where slug reuse or existence is tested,
and a held installed-result or native callback at the interrupted effect.
Retain restart and native acknowledgment observations in E2E.

Outcome (11 active minutes). All 11 legacy cases now run in Node Vitest
through `attemptRun`: Start, then Continue on the same attempt. They use a
recording `NativeDispatch`, a real bare origin, the recorded installed
start, private stores and a separate `HOME` per case.

- `isolated-start-after-establishment.spec.ts` covers two stops: a native
  stop and a formatter stop. After either, Continue launches with the same
  workspace, branch, landing and input, and runs no second installed start.
- `isolated-start-before-establishment.spec.ts` covers three things:
  - A stop before any workspace keeps nothing, so a fresh Start takes
    `session-2` from a real branch.
  - A worktree created before the reply, killed at the held start's worker.
    The case checks the unreadable-output wording, the kept workspace and
    branch, and the original claim identity that guards the retry.
  - A worktree created after the reply, under the same checks.
- `execution-checkout-start-stops.spec.ts` covers the execution checkout:
  - a topic-branch refusal;
  - an unreadable result that publishes nothing;
  - a kept start that asks about existing changes on Continue, then
    continues in the checkout.
- `pending-input-continuation.spec.ts` covers a kept Codex record whose
  first input is uncertain. Continue calls `recover` once and makes zero
  launches. A distinct auto-land choice starts a new session and leaves
  that record kept.
- `session-policy-installation.spec.ts` covers `withSessionPolicy`
  refusing choices the installation cannot establish.
- Retained owners: the recovery, failed and Codex-recovery E2E journeys
  keep the real timed-out wait, restart and native acknowledgment.
- Removed `agent-launch-start-session-failed-boundary`, `-identity`,
  `-kept`, `-lost` and `-stops`.
- Cost, one worker. Before: 11 Playwright cases, 36.1 s wall. After: 11
  node cases, about 14 s summed, 18 s wall. Git cases take 1.7–2.8 s,
  stops about 0.4 s and policy cases a few milliseconds.
- Follow-up for the owner: about 90 lines of attempt-run setup now repeat
  across 8 backend specs. The repeated parts are origin preparation, the
  `HOME` stub with project configuration and done marks, the recording
  dispatch, and the `attemptRun` call. The plan forbids test-support
  wrappers. Removing the repetition needs either a production-contract
  change, such as grouping `attemptRun`'s note callbacks, or permission
  for a shared harness.

### 5. Capture a landing under the selected authority

Type: Behavior
Status: done
Estimate: 10–14 active minutes.

Proof. Feed the delivered launch policy to the production start and the
typed landing submission to the landing owner, using a story-bound
launch, a real private repository, `LandingSubmission` and real or
private `LandingStores`. Confirm the opt-in from Start through the
installed caller for the delivered blank and instructed flows. Confirmation
of existing changes alone leaves the landing choice as selected. An
authorized prepare and record pins the real candidate/base and returns
the accepted comparison. Mismatched bound story, host, origin, workspace,
branch or target refuses at the relevant guard without a push or retained
preparation. Keep installed discovery and actual Git publication in E2E.
The typed receiver covers matching and refusal variants at its actual
boundary, with receipts and persisted state as observations.

Outcome (9 active minutes). `story-bound-landing-capture.spec.ts` (2 node
cases) runs an isolated Wait for review Start through production
`started()`, `prepareAttemptReporting`, `keepAttempt` and `handleLanding`.
It uses the machine `LandingStores`, a real bare origin and
`makeMe.aLandingSubmission`. No native dispatch is needed, so it adds no
copy of the attempt-run setup.

- The kept attempt binds the landing repository to the common Git
  directory, the session workspace and branch, the Taken story, the origin
  and `refs/heads/main`.
- The first input runs in this order: the Established session block, the
  reporting block with `--landing-context`, the story, then the text.
- Six refusals leave no preparation, no held pins and an unchanged origin.
  A missing identity, another story, a foreign remote and a foreign target
  each get a 409 that refuses the landing as unauthorized. A `codex` host
  and another dashboard origin each get a 404 for an unknown reporting
  launch.
- Prepare pins the base and revision under `refs/open-dough/one-shot/…`.
  After the push, record returns the same receipt as
  `pending-native-session`, which is correct before any launch record
  exists.
- `recorded` with a launch record stays with the landing-context E2E and
  `declared-blank-launch-publication.spec.ts`. Installed discovery and Git
  publication also stay in E2E.
- Slice 2's `ad-hoc-existing-changes-start.spec.ts` already shows that
  confirming existing changes keeps the selected landing.
- The submission carries no workspace or branch. That guard is in
  `retainedLandingDecision.ts`, and slice 6 owns it.
- Removed `agent-launch-start-session-landing-admission` and
  `-landing-boundary`, and the support function
  `expectBorrowedLandingArtifacts`, whose last consumer was one of those
  specs.
- Cost, one worker: 3 Playwright cases took 17.5 s summed and 20.7 s wall.
  The 2 node cases take 3.4 s summed.
- No separate refactor pass ran. The change is the slice's own spec, dead
  support removal and comment pointers, and no refactor-check candidate
  was found.

### 6. Read the accepted comparison after startup expiry

Type: Behavior
Status: done
Estimate: 8–12 active minutes.

Proof. Start from a bound launch and real Git endpoints. Exercise the
production landing reporter once with an old settled attempt present, then
with the attempt actually absent and the retained record still present.
An unacknowledged reporting reply replays the same pair and does not
republish Git. Compare the prepared pins, accepted revision and retained
receipt, and observe unchanged attempt-store state on the retained path.
Refuse changed or deleted authority without recreating the record.
Include the workspace and branch mismatch guard in
`retainedLandingDecision.ts` that slice 5 could not reach. Use
`LandingSubmission`, the retained authority read from the real machine
record, a controlled clock for expiry, and the private origin. The actual
publisher's retry belongs to the retained installed/E2E journey.

Outcome (3 active minutes). `retained-landing-after-expiry.spec.ts` (2
node cases) binds an isolated auto-land Start through `started()`,
`prepareAttemptReporting`, `keepAttempt` and `bindRecord`, then settles
it. A Date-only fake clock expires the attempt through the production
`replaceAttempts`.

- The retained record holds the attempt's authority and `settledAt`.
- With the old settled attempt present, prepare pins the base and
  revision. With the attempt dropped, record returns the same receipt as
  `recorded` and keeps the landing and preparation.
- A replayed record returns the identical receipt. Origin main, the pins
  and `launch-attempts.json` stay byte-identical.
- Each of these gets a 409 and leaves the record unchanged with no pins:
  another story, a changed workspace, a changed branch (the
  `expiredAttemptRecord` guard), and a deleted reporting session. After
  `deleteRecord`, prepare gets a 404.
- The installed reporting-only retry stays with
  `declared-blank-launch-publication.spec.ts` and the landing-context E2E.
- Removed `agent-launch-start-session-landing-retained`. One Playwright
  case took 5.0 s; the two node cases take 1.3 s and 1.8 s.
- About 45 lines of Start-to-reporting setup repeat between this spec and
  slice 5's spec. This joins the slice 4 setup follow-up.

### 7. Prune only the expired attempt's startup evidence

Type: Behavior
Status: done
Estimate: 6–10 active minutes.

Proof. Place old settled, current settled and unsettled
`LaunchAttemptRecord` values across projects in a private machine store
with their own kept starts and attachment directories. Trigger a normal
attempt write through the production store, then read the surviving
attempts and launch records and compare the checkout inventory before and
after. Confirm cleanup follows a successful replacement and touches only
the expired attempt's evidence. Keep the actual filesystem, clock and
worktree in the test. The retained landing reader is slice 6's separate
consumer of the evidence that survives.

Outcome (4 active minutes). `expired-attempt-pruning.spec.ts` (2 node
cases) uses a private machine store, a real checkout with a
`claude/session` worktree, and the Date-only fake clock.

- The production `keepAttempt` write keeps exactly the unsettled and
  current attempts.
- It removes the expired attempts' kept starts and attachment directories
  in both projects.
- It keeps another project's start under the same key, the launch
  records, the worktree list, refs and branch.
- A `replaceAttempts` that leaves the store, or one that throws, removes
  nothing.
- Removed `agent-launch-start-session-retention`. Its held installed
  Start was only setup, and slices 3 and 4 and the isolated E2E still
  cover it. One Playwright case took 2.8 s; the two node cases take
  0.3 s.
- Builder catch: `makeMe.anAcceptedAttempt.ended({ kind: "uncertain" })`
  without `explanation` builds an attempt the store's schema rejects.
- No separate refactor pass ran. The change is the slice's own spec, and
  no refactor-check candidate was found.

### 8. Admit one scheduled feedback session and notify once

Type: Behavior
Status: done
Estimate: 10–14 active minutes.

Proof. An authorized due-date review and configured host choice reach the
actual maintenance check. Supply a fixed local date, typed review and
session state, an observable admission effect and notification sink, and
private settings and records where persistence matters. Exercise the due
check and completion report through their production owners. Confirm
default effort and the selected source/policy reach admission, a held or
refused launch opens no native session, a successful due launch happens
once, an attention report notifies once with the session open, and the
same due date stays consumed after the session ends and is deleted.
Retain the scheduled E2E and supplier's held-admission proof for ordering
actual publication before native dispatch. Keep scheduler and notification
behavior in their own existing producers.
The reduced legacy `agent-launch-ad-hoc-codex-input.spec.ts` keeps the due
Codex `$maintain-feedback-cycle` skill-item case and "HTTP text preserves
exact bytes once; completed blank launches permit another deliberate
session". Slice 2 and the retained Codex E2E now own the exact bytes. Port
the repeated blank launch here, or retire it against the campaign's launch
lifecycle owner, and remove the file.

Outcome (6 active minutes). `FeedbackMaintenanceCheck` now takes its
review read as a required collaborator. `launchBoundary.ts` supplies the
exported production `publishedReview()`.
`feedback-maintenance-due-admission.spec.ts` (3 node cases) drives the
real check loop. It uses a fixed local date, the production project
configuration, authorization in a private `HOME`, a typed review read, and
recorded `accept`/`attempts` at the check's own `Launches` boundary.

- A held admission adds no attempt, is retried, and its row shows the due
  date and reason.
- A due launch is admitted once with no effort set, so admission applies
  the default. Nothing more is read or admitted while the session runs.
  The due date stays used after the session ends and its record is
  deleted.
- On Codex with effort `high`, the request keeps host and effort, and
  `codexInput` begins with `$maintain-feedback-cycle` and its skill item.
- Nothing is admitted in these cases: the setting is off, the date is not
  due, there is no due block, the review is unread, or an open session
  already holds the invocation.
- Retained owners:
  - `session-alerts-unread-report.spec.ts` (Vitest) notifies once.
  - `agent-launch-model-boundary.spec.ts` keeps the host's default effort.
  - `feedback-maintenance-boundary.spec.ts` keeps the page refusal.
  - `feedback-maintenance-admission.spec.ts` and the scheduled E2E keep
    Codex cwd, the reporting block and the Taken story before dispatch.
  - `agent-launch-duplicate.spec.ts`, the campaign's launch lifecycle
    owner, keeps the repeated launch after completion.
  - `authenticated-read-diagnostics.spec.ts` keeps the failed ref read
    diagnostic.
- Removed `feedback-maintenance-launch`, the reduced
  `agent-launch-ad-hoc-codex-input`, the eligibility cases module, and the
  support exports that only those used. Five Playwright cases took 30.8 s
  summed; the 3 node cases take 64–252 ms.

## Story comparison

Every promise ran on one worker, Node 24.21.0, with locked dependencies
and the backend proof record.

- Legacy before:
  - 45 ported Playwright cases across 18 removed paths. Per-slice summed
    case time was 25.6, 23.1, 12.5, (36.1 wall), 17.5, 5.0, 2.8 and
    30.8 s.
  - All passed on the first attempt with no retries.
  - The historical pre-cutover figure was 40 cases at 182.4 s summed. The
    cutover had already rewritten ten files and added
    `admitted-session-duplicate`.
- After:
  - The 15 new Vitest files (`story-after.json`) hold 43 node cases. All
    passed on the first attempt with no retries.
  - Summed case time is 42.5 s and wall time 58.4 s.
  - 13 cases run under 100 ms. 30 cases are over, because each observes
    real Git, an installed start or a held origin.
- Still on Playwright:
  - `agent-launch-start-session-isolated-codex.spec.ts` (1 case, 3.0 s) is
    the retained Codex native owner from slice 3. It reads `thread/start`
    cwd and ordered input, which the Claude-only isolated E2E lacks. This
    plan retained it, so its runner move belongs with the campaign's runner
    removal.
  - The mapped legacy count is otherwise zero.
- Fixtures removed: `expectBorrowedLandingArtifacts`,
  `feedbackMaintenanceLaunchEligibilityCases.ts`, `pushWatchList`,
  `turnOff` and `withdrawFeedbackMaintenance`.
- Support added: one `checkoutState` reader in
  `executionCheckoutChanges.ts`.
- Production seams added: `attemptRun`'s typed `NativeDispatch`, which
  `nativeSessionRun.ts` uses, and `FeedbackMaintenanceCheck`'s required
  review read.

## Proof ownership and historical inventory

The filenames below are relative to `dashboard/backend-tests/launches/`.
They identify the pre-cutover files even when the supplier moves or retires
them. At execution, record per-case dispositions in this plan, with a
named replacement and observable proof for each surviving assertion.
Standalone-only cases require an accepted removal or a maintained
story-linked equivalent.

| Slice | Historical paths and independently retained observations |
| --- | --- |
| 1 | `agent-launch-ad-hoc-boundary.spec.ts`, `agent-launch-ad-hoc-sessions.spec.ts` for request, checkout, title, record and inventory, and the cutover's `admitted-session-duplicate.spec.ts` for claim publication before the borrowed checkout opens with HEAD and index intact. Keep `e2e/launches/agent-launch-ad-hoc.spec.ts` and `agent-launch-ad-hoc-instructed.spec.ts` for the visible blank/instructed session and terminal behavior. |
| 2 | `agent-launch-start-session-existing-changes-boundary.spec.ts`, `agent-launch-ad-hoc-cursor-established.spec.ts`, `agent-launch-ad-hoc-codex-input.spec.ts` for the confirmation, exact input, cwd and dirty checkout. The latter also contributes scheduled skill input to slice 8. Preserve the Cursor cases' blank and isolated handoffs and stale-workspace refusal through the reached production and native checks. Inspect `e2e/launches/agent-launch-start-session-existing-changes.spec.ts`, `agent-launch-ad-hoc-codex.spec.ts` and `agent-launch-ad-hoc-cursor.spec.ts` before dropping any protocol assertion. |
| 3 | `admitted-session-refusal.spec.ts`, `admitted-session-retry.spec.ts`, `agent-launch-start-session-isolated-codex.spec.ts`. Preserve real admitted checkout and publication ordering in `e2e/launches/agent-launch-start-session-isolated.spec.ts`; retain the Codex native variant for cwd and ordered materialization if the E2E lacks it. |
| 4 | `agent-launch-start-session-failed-boundary.spec.ts`, `agent-launch-start-session-identity.spec.ts`, `agent-launch-start-session-kept.spec.ts`, `agent-launch-start-session-lost.spec.ts`, `agent-launch-start-session-stops.spec.ts`. Keep `e2e/launches/agent-launch-start-session-recovery.spec.ts`, `agent-launch-start-session-failed.spec.ts`, `agent-launch-ad-hoc-codex-recovery.spec.ts` and the delivered unbound-continuation journey for their distinct UI, real installed and native observations. |
| 5 | `agent-launch-start-session-landing-admission.spec.ts`, `agent-launch-start-session-landing-boundary.spec.ts`. Keep `e2e/launches/agent-launch-start-session-landing-context.spec.ts`, `agent-launch-start-session-isolated-auto-land.spec.ts` and the supplier's installed declared-landing proof. |
| 6 | `agent-launch-start-session-landing-retained.spec.ts`. Read the post-expiry receipt and the pinned endpoints through the delivered record and preserve the installed reporting-only retry observation from SEED-439. |
| 7 | `agent-launch-start-session-retention.spec.ts`. The real machine-store write and filesystem check own cross-project pruning and workspace survival. |
| 8 | `feedback-maintenance-launch.spec.ts` and the scheduled skill-input cases in `agent-launch-ad-hoc-codex-input.spec.ts`. Retain `e2e/launches/feedback-maintenance-launch.spec.ts`, `feedback-maintenance-launch-held.spec.ts` and the supplier's scheduled-admission check for actual due-row, installed and native launch observations. |

## Local gates and comparison

- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to the plan and all repair handoffs. Keep default test timeouts and use
  the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  as production seams and fixtures change. Trace the Start/Continue route,
  installed handoff and publisher, scheduler, kept-store readers, and
  shared support that the changed output reaches. Record the command,
  setup, observation and result for each reached purpose.
- Run focused backend checks with
  `npm run test:dashboard:backend -- --workers=1 <spec paths>`.
  Use the same selector with `--list` and the maintained runner
  classification to confirm surviving cases are discovered on the intended
  engine and the scoped legacy count is zero. Select named E2E paths with
  `npm run test:e2e -- --workers=1 <spec paths>` for the boundaries above,
  and run `npm run typecheck:dashboard` for TS contract and proof changes.
  Run affected installed checks if a shipped contract changes. For long
  macOS checks use a fully awake machine on AC with `caffeinate -s -i`
  per [AGENTS.md](../../../AGENTS.md).
- Compare the same post-cutover promise selection before and after
  migration with one worker, locked dependencies, matching Node and
  Chromium, proof records and host conditions. Record runner classification,
  first-attempt counts, failures/retries, summed case time and wall time,
  with retained E2E counted separately. Use
  `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` for the backend runner record.
  If the supplier has already changed the footprint, report the reconciled
  baseline alongside the historical 40-case result and attribute the
  difference. Include removed fixtures and any added proof in the cost
  comparison. The [campaign baseline](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage)
  records the comparison conditions. Record the case distribution around
  the campaign’s roughly 100 ms unit-test target.

## Readiness review

Slice-plan refinement was unnecessary because each slice has a distinct
observation and uses the same delivered launch and retention boundaries.
Eight slices. Rereviewed at `53b05ed59` after the cutover dependency was
satisfied: the mapped paths, retained boundaries and production owners
exist, and the one unowned cutover spec joins slice 1. No slice-specific
concern remains.

## Execution complete

Product advice:
- Run the correction
  [Restore dropped session workspace proof](../854-restore-session-workspace-vitest-proof/PLAN.md)
  before the queued launch families
  [Launch starts and recovery](../846-prove-launch-starts-and-recovery-on-vitest/PLAN.md)
  and [Host launch choices and first input](../849-prove-native-first-input-on-vitest/PLAN.md).
  - Its first slice settles the `attemptRun` services contract and the
    accepted-attempt MakeMe step. Those families would otherwise copy the
    same setup.
  - Its last slice moves this story's remaining Codex isolated case off the
    legacy backend runner. Runner retirement waits on that.
- The process review is deferred to wrap-up's Intent Coverage check.
