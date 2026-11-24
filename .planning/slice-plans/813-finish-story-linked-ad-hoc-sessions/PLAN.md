# Finish story-linked ad hoc sessions in the Dashboard

**Identity:** SEED-432#finish-story-linked-ad-hoc-sessions
**Source:** [Finish story-linked ad hoc sessions in the Dashboard](../../seeds/SEED-432-finish-story-linked-ad-hoc-sessions.md#finish-story-linked-ad-hoc-sessions)

## Goal and boundaries

An independent Dashboard start publishes a Taken story before opening its
native session. Follow-ups start on their existing Taken or Done story.
The same story and exact published session comparisons remain reviewable in
Recently done and Intent after checkout retirement and from another clone.
Ship one production switch. Keep review repository adoption, Intent session
selection, follow-up context composition, and open follow-up card cues in
their respective stories.

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
  [Review repository direction](../../NORTH-STAR.md#read-published-comparisons-from-the-review-repository)
  keeps publication independent of review storage. Use the published comparison
  contract already on trunk. If [SEED-428](../../seeds/SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository)
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

## Decisive premises and preparation evidence

| Consuming operation | Observation and result | Remaining proof |
| --- | --- | --- |
| Dashboard independently publishes a story through installed admission | Supplier SEED-426 integrated at `96feeac0c`. Its installed bare-origin proof covers the first seed, lost reply, retained candidate retry on the same worktree, unrelated edits, and ordinary completion. The subsequent simplification at `cc52f5e3e` retains that contract. | Slice 1 checks the actual selected installed payload. Slices 2–5 prove the Dashboard adapter, its receipt gating, and the native dispatch ordering. |
| Reuse the prior isolated and borrowed launch approach on current trunk | The isolated reference is `121b9158b`. The default candidate is `refs/dough/resplit/SEED-426-dashboard-admission` at `2ebb057d0`. At `c9b0f149a`, a dry three-way apply of the Dashboard and E2E delta between those two revisions found nine conflicts and three paths removed from trunk. In the private handoff, `slice-5-final-backend-e2e.log` and `slice-5-board-retry-and-refusal.log` show real publication before native dispatch, borrowed index preservation, receipt recovery, Board/Retry and scheduled feedback. `slice-5-remaining-consumers.log` records nine backend and eight browser compatibility failures against that candidate. | The plan uses the archived sequence and failure map as design input. Start from current interfaces. Slices 2–5 need fresh observations on the new candidate. |
| Existing launch consumers can distinguish admission regressions | At `c9b0f149a`, `npm run test:dashboard:backend -- 'agent-launch-duplicate\.spec\.ts\|agent-launch-follow-up-identity\.spec\.ts\|story-branch-retained-landing\.spec\.ts' --workers=1 --reporter=line` passed 20 cases. It observes one conversation under contention, refusal and retry, follow-up recovery after expiry, and an existing claimed story's retained landing. E2E discovery with `--list --reporter=list` selected nine ad hoc problem/Codex/Cursor cases, two follow-up cases, and two published review cases. `npm run test:e2e -- recently-done-published-sessions.spec.ts --workers=1 --reporter=line` passed both, including the same ranges without local launch evidence and the shared-checkout warning. | Slice 3 runs the nine browser cases and the backend duplicate family against the new precondition. Slices 4–6 extend the distinct story, branch-context and fresh-reader proofs. |
| Declared story-linked Land reaches a guard that needs repair | The v0.3.113 production case reproduced prepare at `c80f0559a` with a 409, `This is not the session's authorized branch landing.` The current `decideRetainedLanding` at `c9b0f149a` returned the same 409 from the archived record and matching authority, with the Git directory redirected to a missing scratch path. The closed record has no accepted Dashboard receipt. Git retains `fe21e4639..0bdef6cb2`. | Slice 5 proves the supported open shape through the installed publisher with a real bare origin. A historical closed context stays archived. |
| Production inventory and the full migrated store can be read together | On 2026-11-24, the active preview at `4283cb8d4` read all 1,657 launch document entries using its own `readStoredRecords` under `node --experimental-transform-types`. Eight bound records were open, six with an explicit story field. The count is about stored shape. The two remaining rows need native and published correlation. The older private snapshot used the deployed reader and found an unresolved Cursor start and a Lizard record with missing completion history. | Slice 1 verifies live bindings, owned checkouts, installed payload, and the writer/activation sequence. Slice 10 uses a fresh snapshot and the candidate's real production reader before writes resume. |
| Legacy frontend removal and size comparison | At `c9b0f149a`, `npm run test:dashboard:frontend -- --list` selected ten legacy standalone cases across six specs and eleven unrelated harness cases. `a2d149089` and `10581e20a` account for the difference from the original standalone count. The private `baseline-counts-matched.log` at `46dd56241` records 52,374 Distribution lines (13,946 Markdown), 131,034 Dashboard source lines, and 5,960 executable cases. | Slice 9 verifies zero standalone cases while preserving relevant story-linked proof. Slice 10 compares like-for-like totals and attributes story deltas against its actual execution base. |

The private evidence lives under the common Git directory at
`open-dough/evidence/SEED-426-ad-hoc-cutover-handoff`. Use the retained
`.log.run.json` files for commands, revisions, and exact results. Keep
production data, native identifiers, and restore copies out of Git.

## Ordered slices

### 1. Verify the production cutover inputs
Type: Structure
Status: done
Proof: A private copy parses through the deployed reader, and every open or
interrupted record has a disposition backed by native and published evidence.

Inspect the active watcher and deployment, and test the selected project's
installed admission entry and native host availability. Check attempt-to-launch
references, native binding or confirmed absence, workspace ownership and
published story membership. Check the earlier Cursor timeout, the unbound
rows, and the Lizard evidence if still present. Verify in a disposable home
how to hold the watcher and all writers, including schedules, with a complete
backup and rollback path. Capture a stable inventory with per-store counts
before and after copying. Record exact host, reader and native observations
before dependent work. The cutover owner supplies any live-only access and
keeps production writes outside this probe. A missing native or ownership
observation, unavailable installed capability, or unverified writer hold
stops the dependent work and changes the migration plan. Repeat the inventory
against the final candidate and fresh inputs in slice 10.

Result at `2b0356a1e` (private `slice-1/REPORT.md` and run records in this
worktree's evidence location): the preview runs deployment `4283cb8d4`, and
its reader parsed a copy whose per-store inventory matched production before
and after copying (1,659 launch rows, 1,674 attempts). Seven records are open.
Six carry a Taken story with matching native binding and owned worktree, and
stay open and linked. One live Claude session has no story field. Its branch
carries a trunk admission, so it continues as verified unbound and slice 10 may
link it. The Cursor timeout has confirmed native absence and an untouched clean
worktree, so it is archived. The Lizard record stays closed and unlinked
because its association is unavailable. The `bb509114` context still returns
the expected 409 and is archived as history. No open row is unsafe for slices 2–9.
Writers are the unmanaged watcher process, which owns the preview and its
in-server schedules, plus the Cursor and Claude launchd agents. The watcher
plist is not loaded, and there is no crontab. A disposable-home rehearsal
restored a tar backup to an identical 26,758-file manifest. Slice 10's owner
still performs the live hold, which this probe did not exercise. That owner
also chooses whether to restart the watcher as it runs today or through
launchd, and budgets about three minutes for the manifest. Installed
`execution-start.mjs --admit` published on a scratch bare origin only with a
publisher ID, a linked worktree, the seed draft in the integration checkout,
preparation recorded first, and a `**Goal:**` line. Slices 2–5 must meet those
inputs. Native CLIs are present: claude 2.1.331, codex-cli 0.171.0 and
cursor-agent 2026.11.22.

### 2. Open an isolated Dashboard session on its admitted story
Type: Behavior
Status: done
Proof: An isolated Start session publishes one remote Taken story before native
dispatch and then shows one ordinary Session entry, including after Continue.

Use the owned worktree and its Take as the comparison base. Keep review and
auto-land choices, native first input and attachment bytes. Observe a held push
with zero native starts, receipt-write refusal or a lost reply followed by
one native launch under the accepted identity, and a competing or mismatched
claim that opens no native session. Reuse Start's current attempt recording
and workspace selection. Exercise the real installed script and a moving
bare origin. Keep removed files from the old isolated patch recoverable in Git.

Result: trunk had removed isolated admission in a single commit,
`fc66bdb8e`. Reverse-applying that commit conflicted in two files only, and
those were resolved on current interfaces. `isolatedSessionAdmission.ts` drafts
and admits through the installed script. The script writes its own owned draft,
so slice 1's hand-seeded inputs do not apply. `startsStory` in
`launchRequest.ts` selects isolated, non-follow-up ad hoc Starts. The first
input gains a `Taken story:` line, and a blank admitted Start sends no input.
Refusal keeps the existing "Continue session start of …" control.
`admitted-session-retry` and `admitted-session-refusal` observe these cases:
- receipt refusal followed by one native start;
- a competing claim and an origin mismatch, with no native start;
- in the isolated E2E, publication before dispatch, attachment bytes and one
  Session entry.

The recovery E2E observes a held start with no native call until Continue.
"The story admission can be retried." still has no assertion. Slice 3 reuses
this admission and its proof seams, `isolatedSessionAdmissionProof.ts`
and `startSessionLanding.ts`.

### 3. Put default-route launch consumers on an installed project and origin
Type: Structure
Status: planned
Proof: Every backend and E2E consumer that starts default-choice ad hoc work
runs on the installed project with a matching bare origin. Its existing
assertions pass unchanged against the current standalone route.

The first slice 3 attempt stopped after 8.8 active minutes, with its patch kept
privately as `slice-3/attempt-1.patch`. Extending admission to the default
choices was a small production change. The cost was in about 70 backend and
E2E consumers whose fixtures have no installed project or origin. Each of them
stops with "do not establish a session" once admission applies, which is the
same failure as the earlier 14.7-minute overrun. The developer split the slice
so this migration lands first, by consumer family and with no behavior change,
and CI stays green. Reuse the `preparationPage` installed project and origin
seam and slice 2's proof support. Do not change what a consumer asserts. Use
the attempt's consumer trace and file list to select families, including
`agent-launch-ad-hoc-codex`. When a family cannot move without a behavior
change, leave it for slice 4 and name it.

The second attempt migrated no family per spec. Within the remaining time it
added only `launchTimeoutMs` to `preparationPage`. It also found that
`launchJourney` families, about 120 files, read a Taken `readyStory` card that
the origin fixture's project lacks. Migrate through the shared seam instead of
spec by spec. The default `dashboardTest` catalog project's checkout gets the
run-wide prepared start origin from `startOriginPreparation`, which carries
installed skills and a bare `main`. A MakeMe builder step seeds
`launchJourney`'s Taken story into that origin. This keeps assertions
unchanged, and the readiness check runs once in the shared fixture.

The slice overran at 15 active minutes. Its final attempt disproved the
no-behavior-change premise. The catalog project is created in
`fakeClaude.ts`. When it is installed with a bare origin, the server's launch
path changes:
- launch instructions gain the reporting context;
- story launches go through the real installed start and are refused unless
  their story is queued on origin;
- the not-installed refusal becomes a start refusal.

With the seam wired, ad hoc E2E and the duplicate family still passed, but the
full backend run failed 11 specs. Examples are `agent-launch-ad-hoc-boundary`,
`agent-launch-environment`, `agent-launch-done-refusal` and
`agent-launch-boundary`. The trace reached 364 spec files. The seam and the
`launchTimeoutMs` change are parked as private `slice-3/attempt-4.patch`.
Moving these consumers is behavior work for their expectations, and the plan
is at the ten-slice cap. That makes it a human decision, not a slice
refinement.

### 4. Open a default-checkout session on its admitted story
Type: Behavior
Status: planned
Proof: The selected native checkout launches only after the installed claim
reaches the bare origin. The borrowed HEAD, index and existing changes are
intact and the Board carries the same admitted identity on Retry. A resumed
Start opens its terminal.

Apply the default-choice rule from the parked attempt. Every non-follow-up ad
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

Codex E2E was not migrated. Rerun the duplicate family, the
`agent-launch-ad-hoc-{problems,codex,cursor}` selection and the consumers the
consumer trace reaches. A retained default start should not read as an
"established start", so align its wording with the borrowed checkout. Owned
claim cleanup attaches to ordinary completion in slice 8.

### 5. Admit scheduled feedback and show Start's admission states
Type: Behavior
Status: planned
Proof: Scheduled feedback publishes its story before the native start. Mounted
Start shows pending, refusal, accepted and Retry for a default-choice
admission.

Scheduled feedback already dispatches through the common launch boundary.
Add proof there without editing the 292-line scheduler. Mount Start on Vitest
through pending, refusal, accepted and Retry. Reuse slice 2's admission
recovery proof where the same installed path is used.

### 6. Follow up under the source story
Type: Behavior
Status: planned
Proof: Card and session actions for published Taken and Done sources yield a
new session ID on the same story, with membership unchanged.

Resolve the story through the existing story/session follow-up boundary.
Check unavailable and mismatched sources before a new native start. An
already accepted attempt may continue from its verified binding after its
source session expires. Preserve composed context delivery and workspace and
host rules. Extend the follow-up identity and published range admission
families and the E2E session-origin action.

### 7. Land under the bound story with the exact accepted comparison
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

### 8. Return to completed ad hoc work in ordinary review
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

### 9. Retire standalone startup, completion and review
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
any interim standalone callers from slices 2–8 out of production until this
slice and the cutover have passed.

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
`caffeinate -i` and check the sleep log. Follow
[local suite admission and machine sleep](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).

Plan refinement retained independent admission, follow-up, Land, completion,
and retirement proofs. The default route overran once in SEED-426, at 14.7
active minutes, and stopped unfinished in this plan's first slice 3 attempt.
Both times the cost was consumer fixture migration. The developer split that
work into slices 3–5, which brings the plan to the ten-slice split limit.
Slices 4–5 reuse slice 2's isolated protocol. The historical 312-line Codex
input spec is 195 lines at the preparation base. If it reaches the maintained
size check, keep attachment/reporting proof separate from startup policy. The
execution branch keeps the older paths through slice 8, and slice 9 removes
them before the production switch. Slice 1 bounds the owner-held production
premises before dependent work.

## Story obligations

### G1. Live migration evidence needs disposition
Reported: slice 1 — "SEED-426 observed an open standalone Claude launch, a Cursor timeout without conclusive native binding, and one Lizard review with unavailable completion history."
Story clause: "Switch production startup, completion and review together."
Disposition: receiving slice 10

### G2. Default launch compatibility must be verified
Reported: slice 2 — "SEED-426 found nine duplicate-launch backend failures and eight browser problems, Codex or Cursor failures on the unpublished default route."
Story clause: "A new independent start publishes one canonical story and its Taken assignment before opening a native session."
Disposition: receiving slice 4

### G3. Retained Land must recognize the admitted story
Reported: slice 1 — "The preserved isolated Dashboard path uses legacy established-session landing authority."
Story clause: "Land checks the bound story and declared Git authority before push."
Disposition: receiving slice 7

### G4. Borrowed default claims need an ordinary closure path
Reported: slice 2 — "The unpublished default admission uses a separate owned claim worktree and leaves the borrowed session checkout intact."
Story clause: "Ordinary completion and review use the story's membership and published session records."
Disposition: receiving slice 8
