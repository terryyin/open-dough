# Show CI status in an Intent tab

**Identity:** SEED-219#intent-ci-status-tab
**Source:** [selected story](../../seeds/SEED-219-intent-ci-status-tab.md#intent-ci-status-tab).
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A **CI status** tab, third in Intent's reading strip, shows the selected
check's judgment for the project's trunk, or, with a selected story that has a
published Story Branch Mode branch, for that branch. It names the branch,
states Passed, Failed, Running or Could not be read with the judged revision,
later commits without a result, run link and, while running, the nearest
completed ancestor. Stories without such a branch are named and explained,
with no status. The chosen Intent tab is kept per project across perspective
switches and new revisions. The judgment is re-read when shown, when the
branch changes, when the revision check sees that branch's head move, and on
**Check again**.

Exclusions, from the story: landing-revision CI for done stories, trunk
commits of Trunk Mode stories, other checks, timed polling, owning or starting
CI, URL state, selecting a story from Intent. Required restrictions (seed):
no missing result as passed and no branch's result under another's name; only
names the existing safe-branch rule accepts reach the judgment.

Assumption: page-level story selection (`dashboard/src/pageStorySelection.tsx`)
is on trunk from SEED-192#review-story-intent-impact slice 1 and is read, not
changed. If that story's resumed execution changes the selection API, align
with it rather than adding a second owner.

## Existing solutions and decisions

PFE:

- **Judgment.** `dashboard/server/baseCiJudgment.ts` (`judgeBaseCi`) and
  `baseCiNearest.ts` (`judgeNearest`) judge `source.ref` from the commit
  listing and the selected check's runs (GitHub Actions `branch=` filter, or
  `ciAdapter` discover with `branch`). Its only caller is
  `server/launchStart.ts`. Generalize it into a judgment of a named branch of
  the published source, used by both callers; the launch keeps judging the
  trunk unchanged. For a story branch on GitHub Actions, add the trunk's runs
  listing so a shared ancestor's trunk run counts, and carry each result's run
  branch. The adapter path passes the story branch to discover and adds no
  trunk merge (the adapter owns its discover semantics).
- **Which branch.** `dashboard/src/progressRoute.ts` (`routeOf`) already
  decides a Taken entry's story branch from its owner: not recorded,
  profiles unreadable, conflicting profiles, Trunk Mode, unsafe name, or the
  branch. Extract that decision as one story-branch rule; `routeOf` keeps its
  plan-specific cases on top of it, and the CI status tab uses it for the
  selected entry (queued and Recently done entries have no owner, so no
  branch).
- **Read boundary.** Add one authenticated read beside the Intent reads
  (`server/intentRequestedRead.ts`, `intentReadParameters.ts`,
  `src/authenticatedIntentRead.ts` pattern), answered through the same
  request owner, wait bound and refusal contract. The branch parameter passes
  `isSafeBranchName` (`src/authenticatedReadRules.ts`); the trunk is the
  source's configured ref. `server/projectFolders.ts` `projectFolder(source)`
  supplies the CI settings folder as for the launch.
- **Display.** `src/LaunchBaseCi.tsx` already words state, short SHA,
  subject, later commits and completed ancestor for the launch dialog. Extract
  the shared wording (state names, later-commit line, ancestor line) for both
  views; the dialog keeps its headings and actions.
- **Tabs.** `src/IntentModeTabs.tsx` holds the strip; `IntentBrowser.tsx`
  holds the mode in local state under a provider keyed by revision, and the
  strip only renders when locations are configured. Lift the chosen mode to a
  page-level per-project owner beside story selection (`PageFrame.tsx`
  providers), and render the strip from `IntentPerspective.tsx` above its
  configuration branches.
- **Head changes.** `src/authenticatedRead.ts`'s revision check reports
  watched story-branch heads; `src/movedBranchProgress.ts` follows them. The
  CI tab re-reads when the watched head of its branch changes. Only branches
  routed for slice progress are watched; a Story Branch Mode entry without a
  counted plan is not, and relies on **Check again** (accepted; no new
  watch).
- **Fixtures.** `dashboard/tests/support/baseCiActions.ts`
  (`actionsForRuns`, `actionsRunsAnswer(runs, branch)`,
  `headCommitListAnswer`), `serveOriginBaseCi.ts`, Intent page helpers
  `dashboard/tests/intentPerspectivePage.ts`, and story selection helpers
  `dashboard/tests/storyCardSelection.ts`.

Accepted decisions:
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(observe without owning, nothing kept beyond the page, disposable page state),
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(reuse), [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
(Story branch, Trunk, Intent vocabulary). No conflict. No North Star topic is
needed: the design lives in the seed's Architecture section and, once built,
in the maintained docs below.

Maintained docs to update with the behavior:
[Development and Intent](../../../docs/dashboard-development-intent.md),
[Dashboard GitHub requests](../../../dashboard/GITHUB-REQUESTS.md), and the
Intent paragraph of [dashboard README](../../../dashboard/README.md).

## Domain rule

One judgment: for a branch B of the published source, list B's history (up
to 30 commits) and the selected check's results for commits in it, then take
the newest result at B's head or its nearest ancestor that has one. A result
belongs to its commit whichever branch's push produced it; for a story branch
the candidates are B's runs plus the trunk's runs. The trunk judged for the
launch and for the tab is the same call. Which B: no selected story → trunk;
a selected story → the story-branch rule's branch, or its named gap.

## Outside-in proof

| Example (seed) | Owning slice | Observation |
| --- | --- | --- |
| 1 trunk Passed, later commits | 1 | new `dashboard/tests/intent-ci-status.spec.ts`: tab names `main`, Passed, short SHA, subject, "2 later commits…", run link |
| 9 no Intent locations | 1 | same spec, not-configured project still offers CI status |
| 8 could not be read + Check again | 1 | runs answer fails, then Check again succeeds; tab names `main` throughout |
| 7 running + completed ancestor, Check again | 1 | running at head shows ancestor Passed; Check again after run completes shows Passed |
| 2 tab kept on return | 2 | `intent-ci-status-kept.spec.ts`: choose CI status, Development, back: still CI status; Candidates likewise |
| 10 new revision keeps tab, project change resets | 2 | same spec: revision check publishes new trunk head → tab still chosen and re-read; switch project → Intent |
| 2 story branch Failed vs main Passed | 4 | `intent-ci-status-story.spec.ts` with a Taken Story Branch Mode entry selected |
| 3 shared-commit trunk run | 4 | branch with only planning commits judged at trunk ancestor, "run on main" |
| 4 no branch (queued, done, Trunk Mode) | 4 | each names the story and "no published story branch", no state |
| 4' unknown / unsafe / not published | 4 | conflicting profiles, unsafe name, branch head missing each named, no state |
| 5 clear → main | 4 | deselect returns to `main` |
| 4 selection change never shows earlier result | 4 | delayed answer for first branch arrives after second selection; only second shown |
| 7' head move re-reads | 5 | revision check reports new head of the shown branch → judgment re-read without Check again |
| launch judgment unchanged | 3 | `agent-launch-base-ci*.spec.ts` (4 specs) green |
| progress routing unchanged | 3 | `branch-slice-progress`, `branch-progress-reading`, `auto-refresh-branches`, `auto-refresh-unusable-branch` specs green |

## Ordered slices

### 1. Trunk CI status in Intent
Type: Behavior
Status: done
Proof: `dashboard/tests/intent-ci-status.spec.ts` (examples 1, 9) and
`intent-ci-status-reads.spec.ts` (examples 7, 8, adapter, refusals);
`agent-launch-base-ci*.spec.ts` green after the judgment generalization;
Intent and frame journeys (`dashboard/tests/*intent*.spec.ts`,
`development-intent*.spec.ts`) green after the strip moves.

Pre-condition: a project with a published trunk and fake Actions runs.
Trigger: open Intent, choose **CI status**. Result: a third tab, keyboard
operable like the others, shows across the content area without the tree:
the branch name (`main`), the state, judged short SHA and subject, later
commits without a result, run link, running's completed ancestor, and when it
was checked; **Check again** re-reads. Could not be read names the reason.
Offered when Intent locations are absent or unreadable. Implementation: the
judgment takes a named branch (trunk here), a new authenticated `ci-status`
read answers it, shared base-CI wording is extracted from `LaunchBaseCi.tsx`,
and the strip renders from `IntentPerspective`. Mode stays local in this
slice (reset as today). Docs: Intent section and GitHub requests (three
requests per judgment: history, runs, and the existing workflow lookup; O1).

Learning (slice 1): the strip now renders before the revision is known, so a
mode keyed on `source:revision` resets when the revision arrives; slice 1
keeps a choice made before the first known revision, and slice 2's
page-level owner must preserve that.

Accepted proof (slice 1, 2026-11-02): `intent-ci-status.spec.ts` and
`intent-ci-status-reads.spec.ts` 6 passed; launch base-CI, all `*intent*`,
the touched boundary and `publishedFiles` consumer specs 129 passed after
refactor; full `npm test` passed; whole dashboard suite 1898 passed, 1 failed
(`boundary/agent-launch-sessions-unchanged.spec.ts`, unrelated sessions
revision, passes 30/30 alone): flaky under load, repaired as its own
increment under the failure policy.

### 2. Keep the chosen Intent tab per project
Type: Behavior
Status: done
Proof: `dashboard/tests/intent-ci-status-kept.spec.ts` (examples 2's return
and 10); Candidates journeys
(`intent-test-optimization-candidates*.spec.ts`) green, with one added
assertion that Candidates shown across a revision change reads the new
revision's record.

Pre-condition: a chosen Intent tab. Trigger: switch to Development and back;
a new trunk revision; switch project. Result: the tab stays across the first
two (CI status re-reads at the new trunk head; Candidates reads its record at
the new revision); a project change starts on **Intent**. Mode moves to a
page-level per-project owner beside story selection. Settled premise below:
no existing journey asserts the reset.

Accepted proof (slice 2, 2026-11-02): `intent-ci-status-kept.spec.ts`
(keep across Development and back, new trunk revision re-read, project
change resets; mutation-checked) and
`intent-test-optimization-candidates-revision.spec.ts` (Candidates at the new
revision), with every `*intent*` spec, `story-card-selection` and
`recently-done-sessions-sidebar`: 51 passed after refactor. The owner is
`dashboard/src/pageIntentMode.tsx` under `PageFrame`; the whole-suite gate
runs with slice 3's on the final state.

### 3. One story-branch rule and a branch judgment with shared-commit results
Type: Structure
Status: done
Proof: progress journeys (`branch-slice-progress`, `branch-progress-reading`,
`auto-refresh-branches`, `auto-refresh-unusable-branch`,
`published-facts-failures`, `taken-execution-complete` specs) and
`agent-launch-base-ci*.spec.ts` green; a focused unit test of the extracted
rule's cases (not recorded, unreadable, conflicting, trunk, unsafe, branch)
and of the nearest-ancestor rule merging trunk runs with run branch carried.

Accepted proof (slice 3, 2026-11-02): `tests/support/dashboard-story-branch-ci.test.mjs`
(rule cases, trunk-run merge with `runBranch`, mutation-checked); progress,
launch base-CI and CI status journeys 34 passed; full `npm test` passed and
the whole dashboard suite 1902 passed on the final state (also covering
slice 2's `PageFrame` owner). For slice 4: `storyBranchOf(entry.owner)` in
`dashboard/src/storyBranch.ts` (only kind `branch` is judged; `unsafe` keeps
the recorded name for wording); the `ci-status` answer carries `runBranch`
and `completedAncestor.runBranch`; the fake origin must answer the trunk's
runs listing and the branch-name history.

Extract the story-branch decision from `routeOf` into one rule both progress
and CI status use; `routeOf` keeps the plan cases. Let the judgment of a
story branch also list the trunk's runs for GitHub Actions and carry each
judged result's run branch. External behavior unchanged. Enables slice 4.

### 4. CI status follows the selected story's branch
Type: Behavior
Status: done
Proof: `dashboard/tests/intent-ci-status-story.spec.ts` (examples 2, 3, 4,
4', 5, the stale-answer case, and source example 7 on a story branch: Running
at head with its completed ancestor, then Passed after Check again).

Pre-condition: board entries: a Taken Story Branch Mode story with its own
failing run, one with only planning commits over a passing trunk ancestor,
a Trunk Mode story, a queued story, a Recently done story, conflicting
profiles, an unsafe recorded name, and a recorded branch not published.
Trigger: select each on Development, return to Intent's CI status, then
deselect. Result: as the examples say; the tab never shows a judgment read
for a previous selection; the run branch is named when it differs from the
judged branch. Docs: Intent section and GitHub requests (four requests for a
story branch: history, its runs, the trunk's runs, workflow lookup).

Accepted proof (slice 4, 2026-11-02): `intent-ci-status-story.spec.ts`
(examples 2, 3, 4 with a held stale answer, 6, 7 on a story branch, four
requests) and `intent-ci-status-story-gaps.spec.ts` (queued, Preparing, Trunk
Mode, done, conflicting, unsafe, unpublished, unreadable profiles), repeated
×3; 74 Intent, selection, progress and launch specs passed after refactor;
mutation-checked run-branch wording and unpublished mark. The target is
`ciTargetOf` (`dashboard/src/intentCiTarget.ts`); a branch absent on GitHub
(history 404) reads as no longer published. For slice 5: story branches are
watched only when routed for progress; feed the shown branch's watched head
from `checkPublishedRevision(...).heads` into `JudgedBranch`.

### 5. Re-read when the shown branch's head moves
Type: Behavior
Status: done
Proof: added case in `intent-ci-status-story.spec.ts` and
`intent-ci-status-kept.spec.ts`: the revision check reports a new head for
the shown story branch (and trunk) and the judgment is read again without
**Check again**; an unrelated branch's move reads nothing.

Pre-condition: CI status shown for a watched branch. Trigger: the existing
revision check finds its head moved. Result: one new judgment read; the
checked time updates. No timed polling.

Accepted proof (slice 5, 2026-11-02): `intent-ci-status-story.spec.ts` push
test (time alone reads nothing; a push to the watched shown branch re-reads
with four requests and a new checked time; a watched branch moving while
`main` is shown reads no judgment) and the kept spec's "time alone and
another branch moving" step; mutation-checked. The head followed is
`CiTarget.head` in `dashboard/src/intentCiTarget.ts`. Final state: full
`npm test` passed and the whole dashboard suite 1906 passed.

## Execution complete

Product advice: no backlog change. The retrospective planned one bounded
correction,
[SEED-219#ci-status-review-corrections](../../seeds/SEED-219-intent-ci-status-tab.md#ci-status-review-corrections)
([plan 448](../448-ci-status-review-corrections/PLAN.md)): a trunk history 404
reads as an unpublished `main` without its reason, the Intent doc overstates
trunk runs for `ciAdapter` story branches, `branch` carries two read
meanings, and two end-to-end tests overlap. Open for Terry: whether `ciAdapter`
projects should also count trunk runs of shared commits (plan 447 narrowed the
story's "Results on shared commits" to GitHub Actions). For later refinement:
SEED-192#assess-story-intent-protection should decide whether it needs the
deferred landing-revision CI, and SEED-192#check-cucumber-proof-in-ci should
reuse `judgeBranchCi` rather than add a second CI read.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| No existing journey depends on Intent's tab resetting on perspective switch, revision or project change (slice 2 sizing and consumers) | Intent and Development↔Intent journeys | Scratch edit in `IntentBrowser.tsx` keeping the chosen mode in a module variable across remounts, then `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list --workers=4` on every `dashboard/tests/*intent*.spec.ts` and `development-intent*.spec.ts`, then revert (2026-11-02, at `bb5c22f4`) | 37 passed, 0 failed: no consumer asserts the reset; slice 2 owns new proof for keep and project-change reset |
| GitHub Actions runs filtered by a story branch find results for that branch's history (slice 3/4 rule) | `listRuns({branch})` the judgment uses | `gh api repos/terryyin/open-dough/actions/workflows/ci.yml/runs?branch=<b>` for `codex/last-successful-intent-proof`, `codex/fix-owned-calls-start-slack-hang`, `cursor/read-the-latest-doughnut-cypress-cucumber-proof`, plus their `commits?sha=` histories (2026-11-02) | False: `total_count` 0 for all three; their heads are planning commits over `4774f60`, which has a `main` push run (success). Plan adds trunk runs for story branches (slice 3) |
| Recorded Story Branch Mode branches can be unpublished | slice 4 "not published" case | `.planning/agents/*.json` records `codex/remove-candidate-pass-summary`; `git branch -r` after fetch lacks it (2026-11-02) | True: real case, kept in slice 4 |
| Base-CI fixtures can answer a non-`main` branch | slice 4 fixtures | `actionsRunsAnswer(runs, branch)` takes the branch (`dashboard/tests/support/baseCiActions.ts`); `ghRequest.ts` parses `commits?sha=` into `revision`; `committedOrigin.ts` answers target history only for `main` or a readable SHA | Not yet: a branch-name history is unanswered. Slice 4 adds branch-name routing to the fake origin as part of its journey setup; the plan does not assume it exists |

## Local gates

- Focused proof per slice as listed, run with
  `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`.
- Slices 1 and 3 change shared runtime paths (the launch's base-CI judgment;
  progress routing). Before publishing either, run the full `npm test` and
  the whole dashboard suite on the final state (project practice for shared
  runtime-path changes), with Bash 5 (`/opt/homebrew/bin`) first on `PATH`.
- Failing and flaky tests follow this project's policy as written in
  [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests);
  carry it, by link or verbatim, into every delegation and repair handoff.

## Current decisions

- Terry (2026-11-02): no-branch stories get an explanation and no status;
  the chosen Intent tab is kept per project; re-read on show, branch change,
  head change and Check again, no polling.
- Story-branch results include trunk runs of shared commits, naming the run's
  branch (seed, from the premise above).

## Concern evidence

Slice-plan refinement was not needed: each slice has one proof loop, the
Structure slice sits directly before the Behavior it enables, and the domain
rule is one judgment with one branch rule. This review found no remaining
slice-specific concern.


## Story obligations

### O1. Judgment request count includes the workflow lookup
Reported: slice 1 — "Request count is three, not two. One judgment is three gh requests: the history listing, the runs listing, and a lookup of the workflow"
Story clause: "Each judgment read costs the existing judgment's requests"
Disposition: no user cost "The story's observable outcome is a correct, attributed CI judgment beside Intent": the tab calls the launch's unchanged judgment (judgeBranchCi via createGitHubActions), whose per-judgment workflow lookup already existed; no request is added beyond the existing judgment, and dashboard/GITHUB-REQUESTS.md states the actual three (history, runs, workflow lookup) as asserted by intent-ci-status.spec.ts "CI status names main…"
Commitment: S8.1
