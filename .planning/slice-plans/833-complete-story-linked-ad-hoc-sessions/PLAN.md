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
its delivered slice 3 boundary. Slices 1–7 here were slices 4–10 there. The
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
  until the final cutover. Slice 7 defines the production checkpoint and
  retained landing. Preparation is limited to this plan and its evidence.
- Wrapping up SEED-432 lands its isolated admission on trunk and in
  production ahead of this story. Its default, scheduled and follow-up
  starts stay standalone until this story's slices 1–3, and slice 6 retires
  them before the slice 7 switch.

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
| Production inventory and cutover inputs | Plan 813 slice 1 observed this at `2b0356a1e` (`slice-1/REPORT.md`):<br>- The deployed reader at `4283cb8d4` parsed a stable copy: 1,659 launch rows and 1,674 attempts.<br>- Seven records were open. Six were linked and stay open. One live Claude session without a story field continues as verified unbound.<br>- The Cursor timeout and the `bb509114` context are archived. The Lizard record stays closed and unlinked.<br>- Writers are the unmanaged watcher process and the Cursor and Claude launchd agents. A disposable-home tar rollback restored an identical tree. | Slice 7 repeats the inventory against a fresh copy and the candidate reader. Its owner performs the live writer hold and chooses how to restart the watcher. |
| Legacy frontend removal and size comparison | At `c9b0f149a`, the legacy runner selected ten standalone cases across six specs. The private `baseline-counts-matched.log` at `46dd56241` records 52,374 Distribution lines (13,946 Markdown), 131,034 Dashboard source lines and 5,960 executable cases. | Slice 6 verifies zero standalone cases. Slice 7 compares like-for-like totals against its actual execution base. |

Private evidence lives under the common Git directory:
- `open-dough/evidence/SEED-439-complete-story-linked-ad-hoc-sessions`, holding plan 813's `slice-1`, `slice-2` and `slice-3-attempts` records;
- `open-dough/evidence/SEED-426-ad-hoc-cutover-handoff`.

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

### 4. Land under the bound story with the exact accepted comparison
Type: Behavior
Status: planned
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

### 5. Return to completed ad hoc work in ordinary review
Type: Behavior
Status: planned
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

### 6. Retire standalone startup, completion and review
Type: Behavior
Status: planned
Proof: Only story-linked sessions reach active views, launch/reporting stores,
and review routes. Ordinary selection, review and warnings pass and the
legacy runner discovers zero standalone cases.

Trace admissions, follow-ups, Land, Done, review and their installed callers.
Remove the superseded startup and completion paths in Dashboard and
Distribution, the standalone row/selection and published-session review
branches, supported fixture shapes that represent them, and their guidance.
Remove the two remaining `recently-done-ad-hoc-*` specs, the review cue
evidence and races specs, and the standalone cases in
`recently-done-sessions-select` and `recently-done-story-sessions`.
Protect the common published comparisons, including a story's session review
after local expiry. Trace historic Git session records explicitly and keep
their durable published evidence readable by the common story path. Keep
any interim standalone callers from slices 1–5 out of production until this
slice and the cutover have passed.

### 7. Switch production to the reconciled story-linked store
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
`caffeinate -i` and check the sleep log. Follow
[local suite admission and machine sleep](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).

Default-route admission cost sizing twice: SEED-426 overran at 14.7 active
minutes, and plan 813's slice 3 overran at 15. Both times the cost was moving
consumer fixtures, which SEED-433 has since delivered. Slices 1–2 reuse
SEED-432's isolated admission protocol. Slice 1 starts by rerunning SEED-432's
admission families on the current base as its baseline. The historical
312-line Codex input spec was 195 lines at plan 813's preparation base. If it
reaches the maintained size check, keep attachment and reporting proof
separate from startup policy. The execution branch keeps the older paths
through slice 5, and slice 6 removes them before the production switch.

## Story obligations

### G1. Live migration evidence needs disposition (first reported in plan 813 slice 1)
Reported: slice 1 — "SEED-426 observed an open standalone Claude launch, a Cursor timeout without conclusive native binding, and one Lizard review with unavailable completion history."
Story clause: "Switch production startup, completion and review together."
Disposition: receiving slice 7

### G2. Default launch compatibility must be verified (first reported in plan 813 slice 2)
Reported: slice 1 — "SEED-426 found nine duplicate-launch backend failures and eight browser problems, Codex or Cursor failures on the unpublished default route."
Story clause: "A new independent start publishes one canonical story and its Taken assignment before opening a native session."
Disposition: proved by slice 1: `admitted-session-duplicate.spec.ts` holds the bare-origin push across Claude and Codex Start and observes the same published identity, borrowed checkout state and one native dispatch; `admitted-session-retry.spec.ts` recovers the same receipt; the final Problems, Codex and Cursor E2E selection observes the Taken Story card, history and open terminal on Retry.

### G3. Retained Land must recognize the admitted story (first reported in plan 813 slice 1)
Reported: slice 1 — "The preserved isolated Dashboard path uses legacy established-session landing authority."
Story clause: "Land checks the bound story and declared Git authority before push."
Disposition: receiving slice 4

### G4. Borrowed default claims need an ordinary closure path (first reported in plan 813 slice 2)
Reported: slice 1 — "The unpublished default admission uses a separate owned claim worktree and leaves the borrowed session checkout intact."
Story clause: "Ordinary completion and review use the story's membership and published session records."
Disposition: receiving slice 5

### G5. Blank automatic-landing Start uses its existing native handoff
Reported: slice 1 — "A borrowed Automatically land Start with no developer text opens the terminal after submitting its generated established-session block, reporting context and Taken story binding as native first input."
Story clause: "A blank start opens the terminal awaiting the developer's first input after admission, subject to the selected host's native input requirements."
Disposition: receiving slice 4
