# Complete story-linked ad hoc sessions in the Dashboard

**Identity:** SEED-439#complete-story-linked-ad-hoc-sessions
**Source:** [Complete story-linked ad hoc sessions in the Dashboard](../../seeds/SEED-439-complete-story-linked-ad-hoc-sessions.md#complete-story-linked-ad-hoc-sessions)

## Goal and boundaries

Every remaining independent Dashboard start publishes a Taken story before
opening its native session. This covers default and scheduled starts, since
isolated starts already do so through SEED-432. Follow-ups start on their
existing Taken or Done story. The same story and exact published session
comparisons remain reviewable in Recently done and Intent after checkout
retirement and from another clone. Ship one production switch that retires
standalone sessions. Keep review repository adoption, Intent session
selection, follow-up context composition, and open follow-up card cues in
their respective stories.

This plan continues plan 813 of
SEED-432#finish-story-linked-ad-hoc-sessions after the developer split it at
its delivered slice 3 boundary. The original seven slices here were slices
4–10 there. The
original's overrun history carries forward. Its slice 3 overran at 15 active
minutes, and its fixture migration became
[SEED-433](../../seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#run-dashboard-launch-tests-on-an-installed-project).

## Direction and current decisions

- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  gives each session one story, gives Git authority over membership and
  published comparisons, and keeps native launches and retries machine-local.
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  guides the shared typed story binding across launch, Land and review.
  [ADR 0004, Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  requires the complete released payload for the installed admission boundary.
- [Start ad hoc work under a story](../../../docs/dashboard-ux-ui-north-star.md#start-ad-hoc-work-under-a-story)
  supplies the Start, refusal, Retry and card behavior. [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  supplies story scope, published comparisons and missing-evidence cues. The
  [ADR 0008 repository roles](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
  keep publication independent of review storage. Use the published comparison
  contract already on trunk. If [SEED-428](https://github.com/terryyin/open-dough/blob/5813f8d95b5816e984540785e4e3d0e439c2c1ff/.planning/seeds/SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository)
  lands during execution, recheck the exact-range proof on the integrated reader
  and keep its repository routing and fixed file reads.
- Reuse Distribution's installed `execution-start.mjs` owned draft, admission
  and recovery for independent starts. Keep the Dashboard attempt owner as the
  boundary for admitting, continuing and settling local launch effects. The
  launch request can express input before admission. The accepted native
  handoff, bound launch, and reporting authority carry the canonical story.
  Existing `followUpAdmission` resolves source context, `launchLandingReservation`
  validates and pins an exact pair, and ordinary published story/session
  readers supply review. Extend those owners with the binding and remove
  superseded standalone paths once the common paths cover their consumers.
- Follow [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Reuse the installed bare-origin and native protocol seams, mount Start and
  review cues on Vitest, and keep real multi-boundary journeys in E2E.
- Use Story Branch Mode so the production watcher can stay on compatible code
  until the final cutover. Slice 10 defines the production checkpoint and
  retained landing. Preparation is limited to this plan and its evidence.
- Wrapping up SEED-432 lands its isolated admission on trunk and in
  production ahead of this story. Its default, scheduled and follow-up
  starts stay standalone until this story's slices 1–3. Slices 6–8 retire
  standalone behavior before the slice 10 switch.

## Execution context

- Story Branch Mode, publisher `dashboard-territory.local-open-dough`, agent
  Nao-chan. The Dashboard-established worktree and published branch are
  `codex/complete-story-linked-ad-hoc-sessions-in-the-das`. The starting
  revision is `e5b15f59e8b7c1af9fd794742fb3b9c36adb55da`. The accepted claim on
  `origin/main` and the initial branch tip are
  `b8f9bdee2101310e777a98856c2255f0e9400d75`. The claim has no CI observation
  from this coordinator.
- Branch CI uses GitHub Actions `ci.yml`, display name `CI`. Codex coordinator
  `codex-3590fff6-1048-4858-86f6-c5ed59686e1c` owns the stream in
  `/tmp/dough-ci-501/watch-x0NEyR`, PID `97432`, session `39948`, cell `g308:10`.
- After SEED-442 closed, execution merged its integrated fixture history
  and the current Add Project and Intent contracts at `a6b3b62e`. Dashboard
  typecheck, nine E2E and twelve backend cases passed the reconciliation.
  The previous observer's stop was confirmed. The same coordinator rearmed
  for this branch in `/tmp/dough-ci-501/watch-4GogZe`, PID `82162`, session
  `40845`, cell `g419:219`.
- On the unchanged claim revision, the backend admission retry, refusal and
  `agent-launch-start-session` selection and the isolated Start E2E selection
  passed 21 backend cases and three E2E cases under the macOS sleep guard. Run
  records are
  `slice-1-base-backend.log.run.json` and
  `slice-1-base-isolated-e2e.log.run.json` in the worktree's Git evidence directory.

## Decisive premises and preparation evidence

| Consuming operation | Observation and result | Remaining proof |
| --- | --- | --- |
| Dashboard independently publishes a story through installed admission | SEED-426 integrated the installed owned-draft admission at `96feeac0c`. SEED-432 integrated isolated Dashboard admission through `dashboard/server/isolatedSessionAdmission.ts`. Its `admitted-session-retry` and `admitted-session-refusal` cases cover receipt refusal followed by one native start, and a competing claim or origin mismatch with no native start. The isolated E2E covers publication before dispatch, attachment bytes and one Session entry. | Slices 1–2 extend the same admission to default and scheduled starts. |
| Launch consumers run on an installed project | SEED-433 (plan 816), integrated at `672fc3210`, gives every fixture-created catalog project both installed host layouts and a matching bare origin. Its E2E gate passed 779 cases and its backend gate passed 1,984. | Slice 1 updates only story-dependent expectations. |
| Default-choice admission production rule | Plan 813's first slice 3 attempt (`slice-3-attempts/attempt-1.patch` in the private evidence below) made every non-follow-up ad hoc launch admit its story. It published the claim from an owned claim checkout under `admission-worktrees`, kept the borrowed checkout's HEAD and branch, and ran the Codex and Cursor refusals before admission. With it, duplicate-launch backend cases passed 13 of 13 and Cursor E2E passed. The problems E2E failed only because the terminal panel stayed closed after a resumed Start. | Re-apply on current interfaces in slice 1. The start-command helpers now live in `executionStartCommands.ts`. |
| Declared story-linked Land reaches a guard that needs repair | The v0.3.113 production case reproduced prepare at `c80f0559a` with a 409, `This is not the session's authorized branch landing.` `decideRetainedLanding` returned the same 409 from the archived record, and plan 813's slice 1 reproduced it again. Git retains `fe21e4639..0bdef6cb2`. | Slice 4 proves the supported open shape through the installed publisher with a real bare origin. A historical closed context stays archived. |
| Production inventory and cutover inputs | Plan 813 slice 1 observed this at `2b0356a1e` (`slice-1/REPORT.md`):<br>- The deployed reader at `4283cb8d4` parsed a stable copy: 1,659 launch rows and 1,674 attempts.<br>- Seven records were open. Six were linked and stay open. One live Claude session without a story field continues as verified unbound.<br>- The Cursor timeout and the `bb509114` context are archived. The Lizard record stays closed and unlinked.<br>- Writers are the unmanaged watcher process and the Cursor and Claude launchd agents. A disposable-home tar rollback restored an identical tree. | Slice 10 repeats the inventory against a fresh copy and the candidate reader. Its owner performs the live writer hold and chooses how to restart the watcher. |
| Legacy frontend removal and size comparison | At `c9b0f149a`, the legacy runner selected ten standalone cases across six specs. The private `baseline-counts-matched.log` at `46dd56241` records 52,374 Distribution lines (13,946 Markdown), 131,034 Dashboard source lines and 5,960 executable cases. | Slice 6 verifies zero standalone cases. Slice 10 compares like-for-like totals against its actual execution base. |

Private evidence lives under the common Git directory:
- `open-dough/evidence/SEED-439-complete-story-linked-ad-hoc-sessions`, holding plan 813's `slice-1`, `slice-2` and `slice-3-attempts` records;
- `open-dough/evidence/SEED-426-ad-hoc-cutover-handoff`.

The actual execution base and accepted claim have identical test inputs.
The baseline is 50,784 Distribution lines, 130,720 Dashboard lines, and
5,767 executable cases. The Distribution Node leaf proof is CI
`45590106112` at `3edf13a3f`, which has the same test inputs as the
execution base. Local runner discovery and case summaries are in
`story-833-base-*` in this worktree's Git evidence directory.

Keep production data, native identifiers and restore copies out of Git.

## Ordered slices

### 1. Open a default-checkout session on its admitted story
Type: Behavior
Status: done
Proof: The selected native checkout launches only after the installed claim
reaches the bare origin. The borrowed HEAD, index and existing changes are
intact and the Board carries the same admitted identity on Retry. A resumed
Start opens its terminal.

Apply the default-choice rule from the parked attempt (`slice-3-attempts/attempt-1.patch`). Every non-follow-up ad
hoc launch is admitted, with its claim published from an owned claim checkout
under `admission-worktrees`. The borrowed checkout keeps its HEAD and branch,
and the Codex and Cursor refusals run before admission. Keep existing writer
and checkout-change checks, native landing policy and host requirements.
Update the migrated consumers' story-dependent expectations, such as the
Session entry on the Taken story card and the "Ad hoc work" title. Keep each
distinct duplicate, history, reload, input and refusal assertion. Cover blank
first input, attachment-only, explicit auto-land and existing changes on the
borrowed route. The attempt already showed these on this route:
- duplicate-launch backend cases at 13 of 13, in
  `admitted-session-duplicate`;
- Cursor E2E passing;
- the problems E2E failing only because the terminal panel stays closed after
  a resumed Start.

Codex E2E was not migrated. Before applying the rule, rerun SEED-432's
`admitted-session-(retry|refusal)`, `agent-launch-start-session` and isolated
E2E families on the base. Then rerun the duplicate family, the
`agent-launch-ad-hoc-{problems,codex,cursor}` selection and the consumers the
consumer trace reaches. A retained default start should not read as an
"established start", so align its wording with the borrowed checkout. Owned
claim cleanup attaches to ordinary completion in slice 5.

SEED-432's Intent Coverage check at `03b6dc4ab` returned Insufficient
evidence. A fault making `isolatedSessionAdmission.ts` report admitted without a
confirmed publication still opened no native session. The kept-start guard in
`unattachedStart.ts` refused it, so only the refusal wording changed. When this
slice moves default starts onto that guard, also fault it. Confirm that
`claudeLaunchCalls()` stays empty in `admitted-session-retry`, or add an
assertion that does.

Accepted proof: The held bare-origin push verified publication before native
dispatch on Claude and Codex with the borrowed HEAD, branch and index intact.
Receipt recovery reused the same SHA and opened just one session. The
Problems, Codex, Cursor and history E2E selection passed all 10 cases,
including Retry opening the terminal. The default origin-refusal fault failed
at the zero-native-calls assertion only after the kept-start gate was bypassed.
The implementation report, refactor proof and consumer dispositions are in
`SLICE-1-REPORT.md`, `slice-1-refactor-consumer-trace.md` and
`slice-1-consumer-dispositions.md` in the worktree's Git evidence directory.
The independent refactor generalized the server admission name and used
existing Story card and Start dialog page objects. Typecheck, seven backend
admission cases, 17 E2E cases and the six supplementary consumer selections
passed. Converting the 16 remaining launch E2E files with unnamed steps is a
refactor follow-up for wrap-up; representative cases are the Codex Ad hoc,
Claude Problems and Cursor session recovery journeys.

Branch CI run 45600082746/1 identified 15 E2E failures in the compact Start,
session columns, Cursor lifecycle and sidebar, and production watcher drain.
The repair preserved the supported session observations and gives the watcher
test its own installed launch origin. Local proof passed 25 session and phone
E2E cases, 10 watcher cases, 10 mounted layout cases and Dashboard typecheck.
The independent refactor rechecked both explicit stop override cases. See
[the diagnosis](diagnosis-ci-45600082746.md) and the Git evidence repair report.

### 2. Admit scheduled feedback and show Start's admission states
Type: Behavior
Status: done
Proof: Scheduled feedback publishes its story before the native start. Mounted
Start shows pending, refusal, accepted and Retry for a default-choice
admission.

Scheduled feedback already dispatches through the common launch boundary.
Add proof there without editing the 292-line scheduler. Mount Start on Vitest
through pending, refusal, accepted and Retry. Reuse SEED-432's admission
recovery proof where the same installed path is used.

Accepted proof: A due watch list and held bare-origin push verified no Codex
thread before the Take. The first native creation callback captured the exact
published revision, and the native record kept that story identity and due
date on the selected checkout. The mounted default Start closed its dialog,
showed pending and refusal, retried the same request, ignored the older
refusal, and focused the terminal on acceptance. Four scheduled backend,
five scheduled E2E and three mounted cases passed, as did the explicit
auto-land recheck and typecheck. The mounted selection passed again after
the slice 1 CI repair. `SLICE-2-REPORT.md` and
`slice-2-consumer-dispositions.md` hold the commands and observations in the
worktree's Git evidence directory.

### 3. Follow up under the source story
Type: Behavior
Status: done
Proof: Card and session actions for published Taken and Done sources yield a
new session ID on the same story, with membership unchanged.

Resolve the story through the existing story/session follow-up boundary.
Check unavailable and mismatched sources before a new native start. An
already accepted attempt may continue from its verified binding after its
source session expires. Preserve composed context delivery and workspace and
host rules. Extend the follow-up identity and published range admission
families and the E2E session-origin action.

Accepted proof: The Taken and Done card and session actions opened a new native
session under their published story and left membership intact. Mismatched,
unavailable, unbound and forged sources did not dispatch or change trunk. Retry
used the server-verified identity after source expiry. The active attempt keeps
`request.followUp.storyIdentity`; the native launch record keeps
`request.storyIdentity`. Exact range admission, original context and reporting,
and nonduplicated closed follow-ups kept their existing behavior. The
independent refactor shares the pinned backlog read between typed card and
session admission. Its 54 backend and 11 browser cases passed with typecheck.
See `SLICE-3-REPORT.md` and `slice-3-refactor-consumer-dispositions.md` in the
worktree's Git evidence directory.

Branch CI run 45611041207/1 found six stale observations of the Taken Follow
up action. The repair proves exact focus order and control counts, plus
stable published facts when local session state changes. Thirteen mounted
and 15 E2E cases passed. `CI-REPAIR-45611041207-REPORT.md` holds the evidence.

### 4. Land under the bound story with the exact accepted comparison
Type: Behavior
Status: done
Proof: A declared-branch follow-up lands through the installed publisher.
A retained or expired-attempt retry reads and reports the same pair without
another push.

Bind retained and newly issued contexts to the launch's verified story, host,
repository, workspace, branch, remote, target and declared Git evidence.
Use the existing candidate validation and pin/record path across the
prepare, accepted publication and reporting retry. Extend the branch
landing handoff and capture proof with the v0.3.113 shape and mismatches.
Observe trunk unchanged on refusal. Verify the same authority boundary for
newly admitted independent work. Preserve the closed incident's Git
comparison as history and grant no synthetic receipt.

Keep the landing authority and policy available when a borrowed-checkout
Start with Automatically land leaves the native terminal waiting for the
developer's first input. Prove the blank launch and retained landing authority
together for the case that slice 1 leaves on its existing native handoff.

Accepted proof: The historical declared-branch shape reproduced a 409 on
the installed publisher before push. The accepted candidate verifies the
bound story and declared Git authority, pins the exact comparison before
push, and reads the original pair after a reporting retry and retirement.
The same boundary covers newly admitted and expired-attempt launches. A
blank borrowed Automatically land Start leaves the terminal awaiting input,
keeps the selected policy and authority, and the installed publisher finds
the prepared context without a flag when publication is invoked. See
`SLICE-4-REPORT.md` and `slice-4-consumer-dispositions.md` in the worktree's
Git evidence directory.

### 5. Return to completed ad hoc work in ordinary review
Type: Behavior
Status: done
Proof: Complete admitted work via the installed workflow, then read its
story and exact session ranges in Recently done and Intent in a second clone
with empty launch storage.

Read Done membership and session records after trunk advances. Preserve range
order, warnings, and independently retained session identity. Verify ordinary
no-change completion. Retire the clean owned execution or claim workspace
after the established closure and containment checks. The borrowed native
checkout remains available with its existing work. Add this admitted producer
to the `recently-done-published-sessions` journey or reuse its fresh-reader
observations where the input and endpoint contract match.

Accepted proof: Installed native publication and ordinary wrap-up produced
the exact accepted native and closure ranges, including for no-change work.
The owned claim retired and the borrowed checkout's HEAD, index and worktree
were preserved, even when requested as the refresh checkout through a symlink.
A second clone with empty launch storage read the Done story, both ranges
and the original Intent completion after unrelated trunk advancement. The
installed operation requires the original native evidence and stops before
retirement if another launch displaced it. See `SLICE-5-REPORT.md` and
`slice-5-consumer-dispositions.md` in the worktree's Git evidence directory.

### 6. Retire standalone Board entries and review selection
Type: Behavior
Status: done
Proof: Taken and Recently done list story cards and their sessions.
Story-linked selection, review and warnings pass, including published
comparisons after local expiry. The legacy runner discovers zero standalone
cases in the named selection.

Remove standalone row, selection and review affordances through their
frontend owners. Remove the two remaining `recently-done-ad-hoc-*` specs,
the review cue evidence and races specs, and the standalone cases in
`recently-done-sessions-select` and `recently-done-story-sessions`. Settle
affected mounted callers through the common story route. Nest the existing
published comparison under the matching Done story so both the native and
closure range are reachable. Preserve the published reader, warnings and
Startup recovery entry for the receiving slices.

At the paused checkpoint, the nested comparison, fresh-clone exact ranges,
warnings, and linked frontend, sidebar and native control selections passed.
Two additional browser cases failed because the shared progressive fixture
still places an unbound session directly in Taken and Recently done. Keep
applicable story paging, held-read, focus and panel behavior while migrating
that fixture. The clock paused at 14.4 active minutes. A second proof loop
needs more time than the current slice has available. The developer split
that proof work into [SEED-442, plan 844](https://github.com/terryyin/open-dough/blob/900ddc3d840c0283c1b36e49d95dd1dad9107f92/.planning/slice-plans/844-exercise-board-navigation-on-published-story-fixtures/PLAN.md).
Resume from its accepted fixture proof. Reconcile the verified
`slice-6-paused.patch` from `aed91f904`, then recheck the combined Board
candidate and close G8 before publishing the increment. See
`SLICE-6-REPORT.md`, `slice-6-consumer-dispositions.md` and
`slice-6-remaining-journey-check.log.run.json` in the worktree's Git evidence
directory.

The full parked Board composition with SEED-442's fixture revision
`d311b0a9` passed Dashboard typecheck, 34 browser cases and 60 frontend
cases on a detached merge of `aed91f904` and trunk `68d6f8fc`. It
reused the six migrated fixture paths from the supplier. The verified
`board-composed.patch` and run records are under
`seed-442-consumer-proof` in the worktree's Git evidence directory.
The restored Board change preserves the six integrated supplier fixture paths.
On `846d13b66`, the combined change passed Dashboard typecheck, 34 browser
cases and 60 mounted frontend cases. The legacy runner found 11 harness
cases in three files and zero retired standalone cases. The run records
are `slice-6-restored-{types,e2e,frontend,legacy-list}.log.run.json` in the
worktree's Git evidence directory. The slice finished implementation at
14.5 active minutes. The independent refactor kept the published-session
review locator in the shared review page object. All 15 affected browser
cases and the static gate passed. See `slice-6-board-refactor-e2e.proof.json`
and `slice-6-board-refactor-static.log.run.json`.

### 7. Retire standalone startup and inventory
Type: Behavior
Status: done
Proof: New and retained admitted starts only settle into an active session
with verified story membership. The original verified unbound attempt can
Continue with its original reference and checkout through recovery.

Trace independent and follow-up admission, native adapters, Continue and
active inventory. Remove superseded standalone startup and native handoffs
and fixture shapes specific to them. Keep unbound recovery as an attempt
and preserve its distinct verified recovery transition for the production
reader. Preserve blank Start, selected policy and the same native input.
When a linked session becomes Done while its history disclosure is
collapsed, keep keyboard focus on a visible control or entry on its story.
Prove the default terminal return as well as the existing visible-history
path.

Admitted starts and Follow up retain the shared installed workspace setup.
The active inventory requires a story binding. For old stored rows, slice 10
owns verifying that binding against published membership. Startup recovery
uses the historical Claude attempt's exact reporting reference and verifies
its native ID and saved checkout each time Continue runs. The browser test
discards the first successful reply, reloads, and opens the original terminal
from the same attempt with no new launch, input, publication, or Board row.
See `slice-7-boundaries-v3.proof.json`, `slice-7-inventory-v4.proof.json`,
`slice-7-mounted-v4.proof.json`, and `slice-7-responsive-v6.proof.json` in
the worktree's Git evidence directory. The last run replaces the stale blank
Codex fixture's result from the 12-case inventory run. Implementation
finished at 14.9 active minutes. After the independent refactor, all 36
selected backend, seven mounted, and 19 browser cases passed with typecheck,
lint, and formatting. The records are `slice-7-refactor-{backend,mounted,e2e}.proof.json`
and `slice-7-refactor-static-v2.log.run.json`.

### 8. Retire standalone completion and review routes
Type: Behavior
Status: planned
Proof: Land, completion and review use story-bound authority and common
published reads. Historic exact story comparisons remain readable.

Trace Land, Done, review and installed callers. Remove superseded
standalone completion and review routes and reporting shapes in Dashboard
and Distribution, their obsolete tests and guidance. Trace historic Git
session records explicitly and protect their supported durable evidence
under the common story path. Preserve the story-bound retained publication
and reporting evidence needed by slice 9.

### 9. Carry the landing selection into the workflow after blank Start
Type: Behavior
Status: planned
Proof: The approved blank Start and invoked workflow behavior is observed at
the native input and installed publication boundaries. The selected launch
alone supplies any inherited landing authorization.

The completion and review proof in slice 5 is independent of the policy
delivery path. Slice 4 proved exact capture context discovery once publication
starts. The installed workflow currently learns policy from explicit options
or the Established session handoff, and blank native startup carries no such
handoff. The developer needs to decide whether to preserve both behaviors with
a session-bound handoff, require explicit policy on workflow invocation, or
restore generated startup input for Automatically land. Before implementing,
record that decision and its proof. A checkout-level capture pointer cannot
authorize another caller in the same checkout. The production switch depends
on settling this behavior.

Use the same verified launch identity to test one borrowed checkout reused
by a later independent launch before the earlier claim closes. Verify that
each launch's accepted comparison remains recoverable through ordinary
completion with no second push and no inferred range. Preserve the earlier
claim when evidence is unavailable.

### 10. Switch production to the reconciled story-linked store
Type: Behavior
Status: planned
Proof: The production candidate reads a complete migrated private copy and
opens the preserved linked launch. After the production switch, reconcile
every row and related reference before resuming writes.

Rehearse with the actual production candidate, selected complete client
payload, and a fresh private copy. Preserve open linked IDs and corroborate
closed associations with published evidence. Archive other closed rows and
their companion evidence. Keep Continue for the verified unbound attempt
with its original workspace and reference. Resolve or hold any unverified
open row. Verify the candidate schema and the real Dashboard reader,
including launch lookup, attempt continuation in the isolated rehearsal,
and published review. Save a restorable original and account for each
converted, retained, or archived row in the affected stores.

After proof and before triggering the production watcher, the production
owner approves the cutover window and its
[Dough Land `--keep-worktree` step](../../../.agents/skills/dough-land/SKILL.md#establish-completion-before-landing).
This checkpoint covers landing the reviewed story branch and the coordinated
installed-client update and Dashboard activation under their existing
authority. Hold writers and automatic replacement before that landing,
reinventory production, and apply the rehearsed store switch with verified
readback. Failure keeps writes held while the complete previous reader and
store are restored. Accept only after the candidate reader sees the complete
active store. Retire migration-only code after acceptance and preserve the
restore copy and Git evidence.

Use the same source and executable count method at the actual execution base
and candidate, with the post-revert baseline kept for historical comparison.
Count tracked UTF-8 lines in `Distribution/src`, `dashboard/src`, and
`dashboard/server` by code and Markdown. Use `OPEN_DOUGH_TEST_DIR=Distribution/tests
bash scripts/test-jobs.sh` with matching Node leaf proof and one case per
shell job. Count Dashboard frontend/backend `--list` and E2E
`--list --reporter=list` rows once per runner. Record the case counts and
isolate unrelated trunk deltas. Require both production areas and the
combined case count to fall.

## Proof gates and concern review

Run the owning slice's focused checks and the installed
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run Dashboard typecheck for changed Dashboard contracts and installation proof
for changed shipped operations. On macOS, start awake on AC under
`caffeinate -s -i`. On battery plug in or start awake with the lid open under
`caffeinate -i` and check the sleep log.

Default-route admission cost sizing twice: SEED-426 overran at 14.7 active
minutes, and plan 813's slice 3 overran at 15. Both times the cost was moving
consumer fixtures, which SEED-433 has since delivered. Slices 1–2 reuse
SEED-432's isolated admission protocol. Slice 1 starts by rerunning SEED-432's
admission families on the current base as its baseline. The historical
312-line Codex input spec was 195 lines at plan 813's preparation base. If it
reaches the maintained size check, keep attachment and reporting proof
separate from startup policy. The execution branch keeps the older paths
through slice 5. The removal has independent frontend, startup/inventory,
and completion/review proof loops, so slices 6–8 execute them separately
on the story branch. Land only after those loops and the production
rehearsal pass.

## Story obligations

### G1. Live migration evidence needs disposition (first reported in plan 813 slice 1)
Reported: slice 1 — "SEED-426 observed an open standalone Claude launch, a Cursor timeout without conclusive native binding, and one Lizard review with unavailable completion history."
Story clause: "Switch production startup, completion and review together."
Disposition: receiving slice 10

### G2. Default launch compatibility must be verified (first reported in plan 813 slice 2)
Reported: slice 1 — "SEED-426 found nine duplicate-launch backend failures and eight browser problems, Codex or Cursor failures on the unpublished default route."
Story clause: "A new independent start publishes one canonical story and its Taken assignment before opening a native session."
Disposition: proved by slice 1: `admitted-session-duplicate.spec.ts` holds the bare-origin push across Claude and Codex Start and observes the same published identity, borrowed checkout state and one native dispatch; `admitted-session-retry.spec.ts` recovers the same receipt; the final Problems, Codex and Cursor E2E selection observes the Taken Story card, history and open terminal on Retry.

### G3. Retained Land must recognize the admitted story (first reported in plan 813 slice 1)
Reported: slice 1 — "The preserved isolated Dashboard path uses legacy established-session landing authority."
Story clause: "Land checks the bound story and declared Git authority before push."
Disposition: proved by slice 4: the installed publisher reaches prepare and capture in `declared-worktree-publication.spec.ts`; bound independent and expired-attempt launches preserve the accepted pair in the `agent-launch-start-session-landing` backend family.

### G4. Borrowed default claims need an ordinary closure path (first reported in plan 813 slice 2)
Reported: slice 1 — "The unpublished default admission uses a separate owned claim worktree and leaves the borrowed session checkout intact."
Story clause: "Ordinary completion and review use the story's membership and published session records."
Disposition: proved by slice 5: `admitted-session-completion.spec.ts` lands native work and closes the separate claim through installed operations, then reads both ranges from a second clone; the admitted no-change backend cases prove normal closure with unchanged borrowed checkout and the quiet receipt.

### G5. Blank automatic-landing Start uses its existing native handoff
Reported: slice 1 — "A borrowed Automatically land Start with no developer text opens the terminal after submitting its generated established-session block, reporting context and Taken story binding as native first input."
Story clause: "A blank start opens the terminal awaiting the developer's first input after admission, subject to the selected host's native input requirements."
Disposition: proved by slice 4: `agent-launch-start-session-landing.spec.ts` observes zero native startup input, a visible terminal, retained policy and exact capture through the installed publisher with no explicit landing-context argument.

### G6. The ordinary workflow needs the retained landing selection after blank Start
Reported: slice 4 — "The Dashboard retains Automatically land after a blank borrowed Start, and the installed publisher discovers its capture context once invoked. The invoked workflow currently learns landing policy from explicit options or the native Established session handoff, which blank Start does not supply."
Story clause: "Preserve native access and writer checks, the chosen checkout and landing policy, and the original first input."
Disposition: receiving slice 9

### G7. Retain each borrowed launch's evidence until its claim closes
Reported: slice 5 — "Another accepted launch on the same checkout can replace the native worktree's session evidence. If the original launch landed and that exact evidence is absent during adoption, closure stops and keeps its claim checkout."
Story clause: "Each published session keeps its own accepted comparison and supports reporting recovery without another push."
Disposition: receiving slice 9

### G8. Progressive Board fixtures still rely on standalone placement
Reported: slice 6 — "Two browser journeys failed when their shared fixture expected an unbound launch at ordinal 27 to appear in Taken or Recently done."
Story clause: "Remove the remaining legacy standalone frontend cases and keep applicable story-linked selection, review and warning coverage."
Disposition: proved by slice 6: `slice-6-restored-e2e.proof.json` records the published Done catalog's progressive demand and refresh, held linked destination reveal, ordinary native and final report returns, and nested exact session review. It uses SEED-442's integrated fixtures and the restored Board change. `slice-6-restored-frontend.proof.json` and the legacy listing verify the replacement of standalone board and review coverage.

### G9. Keyboard return can target a hidden Done session
Reported: slice 6 — "The supplier and the parked Board candidate both finish a terminal Mark as done with the linked Done history collapsed. The nested session is attached but hidden and focus falls to the body."
Story clause: "Remove the remaining legacy standalone frontend cases and keep applicable story-linked selection, review and warning coverage."
Disposition: proved by slice 7: `recently-done-progressive-navigation.spec.ts` marks the linked native session Done with history collapsed, verifies terminal closure, and observes focus on the owning visible story card. Its existing open-history journey keeps focus on the linked session entry. Both cases passed in the focused inventory and refactor browser runs.
