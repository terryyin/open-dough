# Review a story's merged one-shot change

**Identity:** SEED-088#review-merged-one-shot-change
**Source:** [refined story](../../seeds/SEED-088-dashboard-story-code-review.md#review-merged-one-shot-change).
**Prepared:** 2026-10-08, planning only, in
`/Users/terryyin/git/open-dough/.worktrees/review-a-story-s-merged-one-shot-change`
on `codex/review-a-story-s-merged-one-shot-change`, continuing the published
Preparing assignment for `ebacky-chan`. Target: `origin/main`; integration
checkout: `/Users/terryyin/git/open-dough`. Starting revision:
`db9026fade984650bf6573d7d252d544b3c1bd97`.

## Goal and boundaries

A developer can select a story's retained one-shot run and review its combined
delivered change after landing and workspace retirement, without searching
trunk's commits. Refinement leaves the story queued; execution can close it,
so both the ordinary story card and Recently done must reach this review.

Include reliable launch-bound capture of the final delivery base and accepted
revision; automatic and later explicit landing; a comparison independent of
today's trunk and of the retired workspace; every retained run, newest first;
the existing file browser, counts, diffs, file moves and side panel; preserving
the live workspace's comparisons and mark; Refresh and restart continuity;
object preservation; honest empty/unavailable states; and reporting-only
recovery without another publication. Default-checkout content joined into the
one-shot result belongs in the delivered comparison.

Use the seed's draft defaults: **Landed one-shot runs**, initially selecting
the newest captured run, with the current workspace comparison still the
opening default when readable. Otherwise show the newest captured run; if no
captured run exists, expose the retained run's evidence gap. A selected landed
run has no Mark reviewed control and never replaces the workspace mark.

Deferred: reconstructing old landings without captured evidence; discovering
other machines' or non-dashboard runs; extending record retention; combining
runs; selecting commits within a run; run-specific marks; arbitrary story
commits interwoven on trunk; ordinary landed Story Branch Mode reviews. No
release, installed-copy update, native-host activation change, new story-state
grammar, or CI observer is included.

## Existing solutions and selected approach

PFE followed the delivery, recording and review responsibilities across source
skills, dashboard production code, installed fixtures and their consumers.

| Responsibility | Evidence and decision |
| --- | --- |
| Identify what actually landed | **Change** the existing publication contract. `execution-increment-publication.mjs` returns accepted `receipt.sha`, target and final `suffixBase`; its normal and retry `beforePush` callbacks currently expose only candidate and attempt. `execution-increment-resume.mjs` returns the accepted SHA but loses the base. Carry the same comparison through pre-push retention, acceptance and resume; do not compute a new baseline from current trunk. |
| Report to the original launch, including before native binding | **Change** the existing launch reporting channel: `completionReporting.ts` copies the installed standalone CLI into a directory outside the workspace; admission resolves an exact accepted attempt, reservation retains write-ahead evidence, and binding imports retained facts. Add a separate landing-record operation with this identity and retry discipline. A landing receipt is independent of completion outcome, message and native Done. Do not implement another session registry or overwrite the attempt's existing start-publication receipt. |
| Persist and retain comparison objects | **Reuse** `machineJsonStore.ts`, attempt-before-record lock ordering and the existing launch documents. **Change** their typed records to carry the applied landing fact, preserving it through binding and other writers. `storyReviewMarks.ts` already pins Git objects before saving their metadata; apply that ordering to the two comparison ends with launch-specific refs. The server resolves the common repository from the established workspace while it still exists. |
| Compare two trees and read one file | **Reuse** `storyReviewFiles.ts`'s `changedFrom` for complete tree comparisons and `storyReviewSnapshot.ts`'s file diffs. **Modularize** the view only as needed: `SnapshotView` already receives a `ReviewComparison` and explicit destination tree, but requires workspace-specific snapshot and empty-state facts. Keep workspace restatement in `storyReviewComparison.ts` and live selection in `useStoryReviewComparison.ts`; expose historical context through the common view. Add historical admission to the same file-diff boundary, using the chosen run's saved repository. |
| Offer all runs without disturbing the latest-workspace rule | **Change** review availability and selection alongside `reviewWorkspaceOf`, which remains the owner of the latest live workspace. Derive retained one-shot runs from their established tracking and exact project/work identity; map captured facts to the same runs. Extend the existing panel and comparison switch rather than adding a second panel. |
| Reach a completed story | **Change** `RecentlyDone`/`DoneStoryCard` to use the same review action. Recently done currently has its own card and nests only marked-done sessions; its view also retains the full machine-record read. Supply that full read for review availability, independently of which sessions are nested, and keep published done identity/title as card context. |
| Obtain outside-in proof | **Reuse** `startOrigin.ts` (real source skills copied into host-specific installed roots, local bare origin), `oneShotLaunch.ts`, `storyReviewWorktree.ts`, real reporting CLI helpers and preview servers. Native/gh/CI provider answers supply external preconditions; the installed scripts, receiver, storage, Git, retirement and rendered review must establish the outcomes. Do not seed the landing metadata in a fixture that claims to prove capture. |

Relevant Accepted decisions are [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md)
(feature design here), [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one authoritative comparison and distinct publication/completion facts),
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
(edit `src/skills/`, keep runtime standalone, leave managed installed copies to
released updates), and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one shared runtime instruction, with project-local context).
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) and
[AGENTS.md](../../../AGENTS.md) supply proportionate skill behavior review:
walk a representative one-shot landing through invocation, required context,
accepted comparison and useful outcome. Protocol fixtures are functional
proof, not native agent acceptance. Existing host activation is unchanged;
do not commission paid native runs or claim new native evidence from these tests.

Follow the existing [North Star](../../NORTH-STAR.md) topics **Remote history
and optional local refresh**, **Agent launch as a requested assignment**,
and **Dashboard-owned CI observation and session delivery**: local evidence
does not own story state, and accepted publication is independent of refresh
and observation. No new topic or ADR is needed. Proposed ADRs are not constraints.

## Current decisions and integration boundaries

- One landing comparison is the accepted candidate and the actual base of its
  owned published suffix, with the authorized remote target. Retain that pair
  for each candidate before its push, updating it after a reconciliation.
  Reuse the reporting CLI's launch-specific retained-request directory for
  interrupted handoff; do not invent a parallel publication catalog.
- The new reporting operation verifies acceptance against the established
  launch's authorized remote/target and repository, not the caller's message.
  Validate object types, the comparison ancestry and target containment. A
  supplied path or another launch's identity cannot select a repository.
  Unknown or unconfirmed candidates are refused, leaving an actionable gap.
- Recording is a write; pin both ends before publishing their metadata. A
  historical read uses the captured repository and pair and writes no ref,
  index or checkout content. A missing repository/object is unavailable; a
  fresh clone does not silently replace the captured repository.
- Use a landing-record operation distinct from the final completion report.
  It can return a launch-only receipt before native binding without setting
  Done, renaming/stopping the host, completing the story, or starting CI.
  Completion remains the final operation after the existing finish duties.
- Normal capture precedes retirement; recording failure never reverses an
  accepted push. Retain exact retry input outside the workspace, report the
  gap, and retry only recording. No revised run comparison is inferred from
  a current HEAD, completion date, subject or moving trunk.
- Historical requests name source, identity and retained launch reference;
  file requests also carry the admitted comparison objects and literal paths.
  The boundary checks these against that run and uses the same Git diff
  reader. Keep the current workspace request and mark contracts compatible.
- The delivered [Commits comparison](../../../dashboard/STORY-REVIEW-COMMITS.md)
  shares the panel, comparison switch, admission and comparison view.
  Its Commits choice remains a workspace comparison, with its range selection
  and refresh behavior owned by `useStoryReviewComparison.ts`. Reuse that
  implementation; historical fixed pairs need no restatement or separate diff
  engine. The [dashboard CI plan](../224-dashboard-owned-ci-monitoring/PLAN.md)
  also uses launch reporting; share its channel while retaining distinct
  landing, CI and completion facts.

## Decisive premises and observations

The initial observation baseline was `db9026fa`. Fetched `origin/main` was
`812969d420f03888179f4a699c3a7eafae67025d`; a path-scoped diff found no changes
to the relied-on publication, resume, reporting, binding, review or done-card
production files. Origin already allocates plan 280, so this plan uses 281.

Landing reconciled onto `b1d4dcd38482b0eed180280261fc310cf3a93b81`, where
Commits had landed and its spent plan was removed. Reading the current panel,
selection hook, admission, shared comparison and file-list code confirmed the
same fixed-pair approach. The current ownership and proof expectations above
include Commits; the earlier test observations below retain their original
baseline and do not claim acceptance of that sibling's implementation.

| Premise | Operation consuming it | Observation and result |
| --- | --- | --- |
| The final delivery base excludes intervening trunk and can be used directly | Slices 1–3's captured diff | Isolated observation C called production `publishExecutionIncrement` after `advanceOriginFromAnotherWriter`, asserted `suffixBase` equals that writer's commit, and consumed `git diff --name-only <suffixBase> <receipt.sha>`: only `increment.txt`, excluding `other-writer.txt`. |
| Comparison objects can outlive the retired worktree without altering a surviving checkout | Slice 2's pins; slice 3's repository read | C pinned both commit ends, actually removed the execution worktree and branch, deleted its remote-tracking tip, expired reflogs and ran `git gc --quiet --prune=now`. Reading the pinned pair still yielded only `increment.txt`; HEAD, status, index and diffs of the surviving checkout matched their pre-observation values. Git 2.50.1. |
| Real one-shot starts establish the exact launch context and reporting command in both installed layouts | Slice 2's workflow handoff and capture | B passed all `agent-launch-session-options.spec.ts` cases: refinement/execution, isolated/default checkout, review/auto-land, Claude and Codex input. `expectEstablishedOneShot` consumes installed formatter/start results, checks identity/base/target and untouched origin; `expectReportingBlock` checks the surviving copied CLI. The fixture substitutes native provider transport, not these operations. |
| The real copied CLI, receiver and store can report to an older launch, survive retirement and recover a lost acknowledgment | Slices 2 and 5's reporting protocol | B passed `agent-completion-identity.spec.ts` and `agent-completion-recovery.spec.ts`: the child runs the actual copied installed CLI against the production receiver; recovery exercises actual closure/retirement, receiver loss, a real write fault and lost acknowledgment. These prove the reusable delivery discipline, not the new landing fields or their early-binding preservation. |
| Existing review lists/counts/file diffs, refresh, mark persistence and refusal provide usable outside-in proof | Slices 3–4's common view and admission | B passed `story-review.spec.ts`, landed, refresh, mark and refusal specs. The main journey consumes actual Git snapshot/diff endpoints and asserts only story files; mark proof restarts the server and prunes objects; refusal checks no Git/checkout change. New historical admission and mark exclusion remain slice-owned proof. |
| Recently done retains identity and a full machine-record read independently of nested session filtering | Slice 6's review availability | Reading `RecentlyDone`, `DoneStoryCard`, `recentlyDoneView` and their callers found no existing review action. B passed recently-done story-sessions and progressive-navigation consumers. `view.records` is the full read; nested `sessions` includes only marked-done records, so it cannot alone supply historical review availability. |
| Resume already preserves the delivered base | Slice 1's interrupted handoff | **Disproved by reading through the result:** `execution-increment-resume.mjs` consumes `resumeInterruptedPublication` and exposes SHA/target without `suffixBase`; callers in one-shot, auto-land and managed-resume tests rely on it. Slice 1 adds explicitly retained base continuity; it must not infer the base from the accepted tip's parent. |

Observation commands from the workspace root:

```sh
# A: five source proof files passed through the required runner, Bash 5 first.
env PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=2 npm test -- src/skills/dough-execute-plan/scripts/execution-increment-publication-reconciliation.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume.test.mjs src/skills/dough-execute-plan/scripts/publication-resume.test.mjs src/skills/dough-execute-plan/scripts/one-shot-queued.test.mjs src/skills/dough-story-refinement/scripts/one-shot-refinement.test.mjs

# B: pinned Node 24.21.0; prerequisites passed, then 28 checks passed in 1.1m.
env PATH="/tmp/dough-planning-node.amtxSO/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" node scripts/setup-native.mjs check
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS PATH="/tmp/dough-planning-node.amtxSO/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" npm run test:dashboard -- --workers=1 --max-failures=3 --reporter=line dashboard/tests/story-review.spec.ts dashboard/tests/story-review-landed.spec.ts dashboard/tests/story-review-refresh.spec.ts dashboard/tests/story-review-mark.spec.ts dashboard/tests/story-review-refusal.spec.ts dashboard/tests/agent-completion-identity.spec.ts dashboard/tests/agent-completion-recovery.spec.ts dashboard/tests/agent-launch-session-options.spec.ts dashboard/tests/recently-done-story-sessions.spec.ts dashboard/tests/recently-done-progressive-navigation.spec.ts

# C: one isolated temporary observation through the runner; passed.
env PATH="/tmp/dough-planning-node.amtxSO/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 npm test -- /tmp/dough-one-shot-proof.XXXXXX.mjs
```

C used `publication-test-fixtures.mjs`'s `createCleanTrunkFixture`, production
`publishExecutionIncrement` and these consuming operations, with assertions
on their results; its temporary script is removed after planning:

```js
const c = await advanceOriginFromAnotherWriter(f.origin);
const result = await publishExecutionIncrement({
  workspace: f.execution, branch: "exec/story",
  previouslyPublishedBase: f.trunkSha, targetRef: "refs/heads/main",
  validate: async () => ({ ok: true }),
});
assert.equal(result.suffixBase, c);
const compare = async (cwd) =>
  (await git(cwd, "diff", "--name-only", result.suffixBase, result.receipt.sha)).stdout.trim();
assert.equal(await compare(f.execution), "increment.txt");
const before = await captureCheckout(f.integration);
await git(f.integration, "update-ref", "refs/open-dough/landed/probe/base", result.suffixBase);
await git(f.integration, "update-ref", "refs/open-dough/landed/probe/result", result.receipt.sha);
await git(f.integration, "worktree", "remove", f.execution);
await git(f.integration, "branch", "-D", "exec/story");
await git(f.integration, "update-ref", "-d", "refs/remotes/origin/main");
await git(f.integration, "reflog", "expire", "--expire=now", "--all");
await git(f.integration, "gc", "--quiet", "--prune=now");
assert.equal(await compare(f.integration), "increment.txt");
assert.deepEqual(await captureCheckout(f.integration), before);
```

Baseline limits: the initial dashboard run could not start fixture servers
because this worktree lacked `node_modules/.bin/vite`. After restoring access
to matching locked dependencies, a broader 86-check run on unselected Node
24.5 passed 72 and failed 14 with startup/browser/read timeouts. It is not
whole-suite acceptance. B deliberately changed to the repository's selected
Node, checked Chromium, and observed the exact relied-on journeys. Remaining
unselected broad-run failures are not claimed fixed; relevant consumers must
be green when their contracts change. New landing storage, recovery and UI are
planned outcomes, not premises treated as already implemented. No paid,
credentialed or external-state probe is needed.

## Promise ownership

| Final promise / seed example | Owning slice and observable proof |
| --- | --- |
| Final base/candidate after reconciliation, several commits, default-checkout owned content; example 2 | 1: production delivery and resume contract consumed by actual tree diffs, preserving publication/CI behavior |
| Capture automatic/later explicit refinement or execution against exact launch; accepted publication independent of completion/refresh/CI; examples 1 and 7 | 2: installed handoff and reporting CLI → real acceptance verification/store/receipt, with no native Done or story mutation |
| Preserve objects for retained evidence, no arbitrary request paths, rejected candidates never labeled landed | 2: pins survive actual retirement/GC; refusal and checkout snapshots; 5 owns interrupted writes |
| File list, counts, renames, binary/text diffs and navigation use the fixed pair after retirement, restart and subsequent trunk changes; examples 1 and 5 | 3: captured-through-CLI result → rendered review and file endpoints; read-only assertions |
| Old evidence gap, missing repository/object, valid empty comparison; example 6 | 3: selecting each state gives the right explanation and no substitute files |
| All retained runs, live workspace coexistence, keyboard choice, mark exclusion, Refresh retaining selection; example 3 | 4: multi-run browser journey plus existing review/panel consumers |
| Lost push result/recording acknowledgment, real write refusal, early native binding and late writers; example 7 | 5: durable retry and binding journeys, exact pair/launch survives, push count unchanged |
| Completed execution remains reviewable without seed/plan/worktree; example 4 | 6: real queued one-shot closure → published done card → same historical comparison, including default-checkout content |

## Ordered slices

### 1. Carry one delivery comparison through publication and resume
Type: Structure
Status: planned
Proof: Extend the production publication/resume suites so they consume the
returned pair in a diff, including a multi-commit suffix rebased onto another
writer's commit and a resume after that accepted candidate is an ancestor of
a newer trunk. Assert callback retention identifies the final base before each
push, the accepted pair is unchanged on resume, and no push/CI registration,
ownership, validation or default-checkout behavior regresses. Cover the
default-checkout suffix that includes pre-existing unpublished commits.

Internal change: expose the final suffix base alongside the candidate to the
existing pre-push retention callback and carry the explicitly retained pair
through managed delivery/resume. Align their CLI consumers and guidance with
that contract. Legacy callers without retained comparison context continue
their current resume semantics, but cannot manufacture historical review
evidence; new one-shot handoffs carry it. Do not redefine publication acceptance
or broaden delivery authority. This immediately enables slice 2's durable
launch-bound recording, including interruption between push and response.

Safe stopping point: existing publication remains useful and compatible;
the new comparison handoff is available, with no review promise exposed yet.

### 2. Retain an accepted one-shot landing against its own launch
Type: Behavior
Status: planned
Proof: Add `dashboard/tests/one-shot-landing-capture.spec.ts`: real dashboard
one-shot start, installed source delivery/handoff and reporting CLI, real local
bare origin, production receiver and saved launch record. Observe a successful
receipt and exact pair for refinement and execution; verify source/identity,
object types and target containment; reject a failed/unconfirmed push and a
foreign launch or request path. Pin before saving, retire the real worktree,
prune Git and read both ends. Explicit record deletion removes only that
launch's pins and preserves another retained comparison. Check the report
changes no completion, Done, story membership, index or checkout bytes. Run the affected completion,
session-policy and native input grammar consumers.

Behavior: An accepted dashboard one-shot landing has a final comparison → the
workflow records it before retirement using its supplied reporting context →
that particular launch keeps a confirmed fixed comparison independently of
completion and later finish problems, with needed objects retained.

Extend the standalone installed reporting CLI with a landing-record operation
and exact retained retry payload, and the existing receiver/store discipline
with the separate typed fact. Capture repository context server-side from the
established workspace. Use launch-specific comparison refs. Apply the existing
retention filter to offered facts; remove this fact's pins on explicit record
deletion with recoverable ordering, without adding a daemon or history catalog.
Keep old records/scripts readable and explain unavailable capture capabilities.
Update the source one-shot execution/refinement, Dough Land and shared reporting
handoff at their existing behavioral homes. Preserve the final completion
operation and its exact launch context, and the host builders' blank intent and
paragraph grammar. New runtime dependencies, if needed, must be declared and
copied with the standalone CLI; do not edit managed installed copies.

Interim behavior: historical inspection arrives in slice 3; ordinary recording
and retry are available now, while slice 5 proves and completes interrupted
and early-binding paths. Failed capture retains exact input and a visible gap;
it never authorizes another push.

Safe stopping point: a developer receives durable accepted landing evidence
and can recover its reporting input even after the workspace is gone.

### 3. Inspect a captured run after its workspace and branch are retired
Type: Behavior
Status: planned
Proof: Add `dashboard/tests/story-review-one-shot.spec.ts`, starting with
capture through slice 2's real CLI rather than writing landing metadata into
the store. Retire worktree/branch, open Review changes, assert heading/pair,
exact changed paths, counts and selected file diff. Exercise rename, binary
and ordinary text through the existing browser and moves. Advance/revert trunk,
restart the dashboard and assert the original comparison remains. Observe
legacy missing capture, missing repository/object and a valid empty comparison;
every unavailable state has no guessed/substitute list. Preserve the review,
file and same-origin refusal checks and compare repository refs/index/status
before and after historical reads.

Behavior: A story has one retained captured run and no readable workspace →
Review changes opens the newest captured run → the existing side panel shows
its delivered change, from saved base to accepted result, without needing the
old workspace or today's trunk as a baseline.

Introduce the historical response/admission at the existing review boundary.
Resolve the saved common repository and admit the chosen launch and pair;
reuse the file-list/count/diff operations and common view. Keep historical
heading, empty state and unavailable reason explicit rather than presenting a
historical result as a live workspace snapshot. Hidden Mark reviewed is a
workspace-only control, including at the request boundary where appropriate.
Keep feature documentation in `dashboard/AGENT-LAUNCH-REVIEW.md` current.

Safe stopping point: the primary landed-refinement example is reviewable.
The newest captured run is initially shown; slice 4 adds the full choice.

### 4. Choose retained runs alongside the live workspace review
Type: Behavior
Status: planned
Proof: Add `dashboard/tests/story-review-one-shot-choice.spec.ts`: two captured
one-shot runs, one older uncaptured run and a newer standard launch. By keyboard
choose each run; assert workflow/time/revision/target, exact files/diffs, one
selection and explicit missing-evidence feedback. Switch to the live marked
workspace and back; observe the mark and stored reviewed ref are untouched.
Refresh after another capture keeps the selected run; remove/expire the selected
record and Refresh chooses the newest captured run, or the supported gap state
when none remains. Run the whole affected review/panel suite and action/focus
consumers, preserving the delivered Commits selection, refresh and range reads.

Behavior: Several retained runs coexist with a live workspace → the developer
chooses Landed one-shot runs and a particular run → only that run's fixed
comparison is shown; Refresh retains that run while available, and returning
to workspace review restores its current comparison and mark.

Derive all run choices newest first from one retained-record read, not from
latest-workspace selection or Git subjects. Use one panel selection state;
never let an earlier asynchronous run/file response answer a later choice.
Keep maximize, resize, Hide/Show files, Close/focus return and narrow layout
behavior. Document opening/selection/refresh defaults with the review.

Safe stopping point: every retained refinement or execution run can be chosen
without replacing the live review's meaning or mark.

### 5. Recover landing evidence without repeating accepted work
Type: Behavior
Status: planned
Proof: Add `dashboard/tests/one-shot-landing-recovery.spec.ts` using production
receiver, real filesystem fault/acknowledgment-loss seams and the copied CLI.
Lose a push response after reconciliation and use the retained candidate/base
from slice 1; resume confirms the same pair with no push. Interrupt recording
before its record write, lose its acknowledgment, report before native binding,
apply a late binding writer and send a newer completion report. Retry returns
the same landing evidence once, bound only to that launch; no metadata, mark,
message or explicit Done intent is lost. Deleted/mismatched launches refuse
without recreation. Run the entire completion/binding/recovery and record
deletion/retention consumers affected by the saved fact.

Behavior: Remote accepted the run, but its response or landing-record delivery
was interrupted → resume or retry the retained reporting input → the original
launch keeps the exact accepted comparison once, while push count is unchanged
and a newer launch and completion report remain independent.

Use the existing write-ahead and attempt-before-record ordering, preserving
the fact through early native binding and all later record writers. An expired
or deleted record cannot be resurrected by retry. A failed capture remains an
attention gap until acknowledged; report the original accepted publication
separately from that gap. Complete source retry/handoff guidance and its
representative behavior review rather than adding another recovery registry.

Safe stopping point: the review evidence is recoverable through supported
landing/reporting interruptions without duplicate publication.

### 6. Review a completed one-shot execution from Recently done
Type: Behavior
Status: planned
Proof: Add `dashboard/tests/recently-done-one-shot-review.spec.ts`: perform an
installed queued one-shot execution, include earlier pending/default-checkout
content, close its backlog/story/plan with the installed workflow, then land
and capture through the real reporting channel. Publish the done record into
the page fixture and retire the workspace. Open its review from Recently done;
assert the same delivered pair/content and no need for the deleted seed.
Also keep the review reachable when accepted publication has an unfinished
attention report and its session is still open. Preserve ordinary done-card
session nesting, progressive reading, identity/title, edge counts and focus
return after Close. Run the affected Recently done surface's suites.

Behavior: A one-shot execution closed the queued story and its result landed →
the developer chooses Review changes on its Recently done card → the same
historical run review opens, including checkout content joined into delivery,
even though the canonical seed/plan and execution workspace are gone.

Give `DoneStoryCard` the configured project context and full retained launch
read for the shared review action. Its existing nested sessions remain filtered
as today; review availability cannot depend on native availability, quiet
completion or the deleted story source. Update the maintained Recently done
and review documentation where those interactions are owned.

Safe stopping point: the full story works for both queued refinements and
completed executions.

## Verification, delivery and sizing

Use the selected Node in `.node-version`, Bash 5 first on PATH and matching
locked dependencies/Chromium under [native setup](../../../tests/native-setup.md).
The preparation observations used an official checksum-verified temporary
Node 24.21.0; execution resolves its own retained prerequisites and does not
depend on that temporary path. The temporary dependency link and observation
script are removed after planning.

Run Node/shell checks through `npm test -- <owning files>` per
[tests/README.md](../../../tests/README.md). Slice 1 owns publication,
reconciliation, managed-delivery/resume, racing-suffix, one-shot and auto-land
consumers; search every caller of changed callback/receipt/resume fields and
select all affected purposes, including CLI callers. Slice 2 owns the new
capture spec, `agent-completion*.spec.ts`, `agent-launch-session-*.spec.ts`, and
reporting-input consumers found by searching `expectReportingBlock` and
`expectAdHocReportingInput` (including Cursor, preparation and ad-hoc builders).
Slice 5 owns early binding, recovery and deletion consumers as well. Extend
functional source guidance tests where their contract changes; if runtime files
or dependencies change, run `tests/payload-declaration-links.sh` and applicable
public-payload delivery checks. A prose-only conventional change uses the
representative behavior review, not a routine tool-discovery matrix.

For UI slices use the environment cleanup and production Playwright command
shape in B with the owning spec plus affected existing suites. Slices 3–4 own
`dashboard/tests/story-review*.spec.ts`, panel replacement/switching and
`side-panel-width*.spec.ts` where shared view geometry or frame contracts change.
Slice 6 owns the Recently done story/session and progressive suites, including
report/Cursor navigation when their shared card/view/focus contracts change.
Inspect whole-surface element/role/count assertions; preserve unrelated purpose
while adding the narrowly available action. Run `npm run typecheck:dashboard`
for the shared TypeScript schema/props/admission changes. These are local
integration checks justified by affected contracts. Hosted CI's full suite is
not an extra mandatory local gate, and old timeouts are not waived for an
affected consumer.

Each slice keeps its implementation, outside-in proof, documentation and
post-change cleanup together. Authorized execution follows the installed
[execute-plan workflow](../../../.agents/skills/dough-execute-plan/SKILL.md)
for independent refactoring, proof acceptance, selective formatting, agent
commits, delivery and asynchronous CI ownership. This plan authorizes none of
Take, execution, commit, publication, landing, cleanup or completion reporting.

No numeric target/hard limit was supplied. Slice 1 is one compatibility/proof
loop and immediately enables slice 2. Each Behavior has one owned observation:
capture, inspect, choose, recover, or reach a completed story. Recovery is kept
separate because write ordering and lost acceptance are consequential failure
boundaries; it is not a test-only slice. The common fixed-pair rule handles all
run variants. If an attempt discovers an additional independent outcome or
overruns, preserve attempt-owned work and revise the same remaining plan under
ordinary sizing guidance; do not weaken the source examples or add a handler
per workflow/host.

## Preparation review

Cumulative design: one publication comparison, one launch reporting channel,
the existing record store and binding discipline, one common diff/view, one
run selection and the same story-card review action. Refinement/execution,
isolated/default checkout, ordinary/done card and normal/retried delivery
exercise those owners rather than creating separate recognizers or diff engines.

Slice-plan refinement was not needed: the six boundaries have one proof loop
each, the sole Structure immediately enables capture, and the named interim
states preserve useful behavior and recoverable evidence. There are six slices,
no sizing exceptions and no resplit recommendation. No remaining slice-specific
concern was identified in this preparation review. The disproved resume-base
premise is owned by slice 1 rather than relied on as an existing capability;
the broad-run baseline limits do not substitute for fresh B/C observations.

The current story's goal, scope and seven examples map to these slices;
the relied-on current behavior and Git engine assumptions were observed.
Record the planned approach and a ready assessment against the current story
and plan digests through the shared recorder. Readiness is preparation judgment,
not execution authority. Keep the seed and plan as uncommitted drafts in the
same retained workspace with its Preparing assignment.
