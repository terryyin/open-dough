# Review every completed story

**Identity:** SEED-139#review-completed-stories
**Source:** [story](../../seeds/SEED-139-completed-story-review.md#review-completed-stories)

## Goal and scope

Every published completed-story card offers Review changes, independently of
this machine's launch history. A historical review uses published completion
and execution evidence, survives workspace retirement and later trunk changes,
and explains insufficient evidence. Preserve active workspace and retained
landed-run reviews. File browsing and diffs use the existing review surface.

## Design and existing solutions

PFE: extend `storyPublishedCommits.ts`'s existing attribution rule to accept the
agent named by a published completion, rather than deriving that agent solely
from a live worktree. Its `trunkLess` already removes only attributed commits
and reports files inseparable from another author's changes. Resolve a fixed
completion revision from the published done record's Git history; compare
against that revision, never today's trunk or a timestamp guess. Reuse the
done-record parser and path owner, configured project Git boundary, changed-file
reader, diff browser, same-origin admission and bounded response signal.

Keep workspace selection and locally captured runs compatible. When no usable
local review exists, a published completion supplies the historical review.
Missing agent/claim/objects or an inseparable attribution must be visible as
an evidence gap or the existing explicit per-file inclusion explanation; none
may silently become unrelated files or an empty successful comparison.

The published comparison is a story fact, not a fabricated dashboard launch.
Give it its own context in the existing panel as needed. Admit its file requests
against the same configured source/story, fixed comparison and actual changed
paths, without accepting repository paths, arbitrary trees or review marks.
Necessary coherence spans the published Git reader, review admission/response
and browser types/rendering; refactoring this comparison concept across these
parts is authorized by this plan. No new database, completion-record schema,
installed skill edits or independent history-attribution implementation.

ADR 0002, Software development lifecycle principles
(`docs/adrs/0002-software-development-lifecycle-principles-accepted.md`), requires
whole-product cohesion and one representation of the same conceptual solution.
ADR 0001, Ubiquitous language, supplies the story/slice distinction. The dashboard
ADR 0008 is Proposed, not binding. No Accepted ADR conflict was found.

## Preparation observations and decisive premises

Observed in `/Users/terryyin/git/open-dough/.worktrees/completed-story-review`
at claim `2a601e3e`, Node 24.21.0, with an independent locked `npm ci` install.
`npm run typecheck:dashboard` passed there.

The existing attribution consuming operation was probed with an explicitly
supplied completion agent in a disposable copy of `storyPublishedCommits.ts`:
`node --experimental-transform-types --input-type=module` imported the copy,
looked up the done record's last published change with `git log -1`, and called
`publishedStoryCommits` at that completion. For
`SEED-138#compute-execution-readiness`, completion `e535dc46`, it returned seven
actual story implementation/completion commits, excluding its claim and later
work. The copy was removed before this plan write. This settles the reuse
premise and need for an explicit historical agent. The proof owns new synthetic
interleaving, branch-integration and history-gap examples; no existing passing
test is claimed to prove the new behavior.

## Outside-in proof ownership

- One real-page journey completes a story through the existing CLI in a fixture
  repository without retaining a dashboard launch, opens its Recently done
  Review changes action, selects an actual changed file and observes its diff.
  Advance trunk, refresh/reopen and observe the same fixed historical result.
  Observe the absent action before implementation to establish discrimination.
- HTTP boundary tests own attribution variants: interleaved other-story commits,
  Story Branch and Trunk publication, missing/ambiguous historical evidence,
  exact project/story and comparison/file admission, and historical immutability.
  Fixtures create actual commits/profiles/completions; do not seed the returned
  comparison as a fixture outcome.
- Existing workspace, landed-run and published-commit review tests protect
  preserved behaviors; trace changed schema/request consumers and run affected
  specs. Typecheck and the staged check-only lint hook protect contract drift.

## Ordered slices

### 1. Review a completed story from published evidence on any machine

Type: Behavior
Status: done

A completed story has no usable local launch review. The developer opens Review
changes from its Recently done card. The panel reads the story's fixed published
changes, browses real file diffs and preserves them through later trunk updates.
Interleaved work stays excluded. Incomplete evidence is explained on opening.
Active workspace and retained landed-run choices remain usable.

Proof: new completed-story browser journey and focused HTTP boundary specs;
the related existing story-review specs, selected after tracing changed
consumers; `npm run typecheck:dashboard`; `git diff --check`. All required
commands are run from the execution checkout and observed to completion.
New proof must discriminate against the pre-change behavior. Focused test
selection expands only when changed consumers or observed failures require it.

One cohesive vertical outcome and proof loop; no numeric slice budget is
specified by this project. Replanning within this same authorized goal is
allowed if new evidence invalidates this boundary.

## Current decisions

Refinement is ready for slice planning. One cohesive slice needs no additional
slice-plan refinement; no unresolved slice concern was identified. Missing
historical evidence has a truthful review outcome, not a guessed diff.

## Execution identity

- Origin/integration checkout: `/Users/terryyin/git/open-dough` (unrelated
  maintainer research remains untracked and untouched).
- Owned created checkout: `/Users/terryyin/git/open-dough/.worktrees/completed-story-review`.
- Branch: `codex/completed-story-review`; publisher `codex-completed-story-review-20261018`;
  Story Branch Mode; agent `DavidKo-chan`.
- Accepted claim: `2a601e3e2a0c68218d4c0a7b246787c4c91f76c1`, based on
  `50d0a60328a8bd562b1208a564092363095832a5`, published to `origin/main`.
  The default checkout refresh was deferred for pending edits. Claim CI is
  unobserved; planning-only claim is excluded by the workflow's path filter.
- Delivery target: `origin/codex/completed-story-review` in
  `terryyin/open-dough`; final closure uses the authorized remote trunk.
- Approved plan publication: `621b4ef1` was reconciled and accepted on
  `origin/main` as `65df38e6c922a70a0f23f08c56c39ff38dd3897b`. The resumed
  start returned `existing`; no second claim was created. Current implementation
  is based on that accepted plan revision. First execution-branch delivery uses
  its prior accepted branch tip, the claim `2a601e3e`.
- CI source: GitHub Actions, verified selector `ci.yml`, name `CI`.
  The approval pause stopped the original observer with no unread events and
  verified PID exit. Resumed Codex coordinator `completed-story-review-20261018`
  uses directory `/tmp/dough-ci-501/watch-AEXrPa`, PID 75571, session 72688,
  yielded cell 48.

## Learnings

The fixed completion is its first-parent publication revision, including a
Story Branch integration performed by another author. All historical owning
agents use the same attribution rule. Merge-resolution ambiguity is limited
to the owning agent's merges, the completion integration, or resolution paths
that affect this story; unrelated resolved merges do not invalidate it.

Completed-card requests explicitly permit historical fallback. Active requests
retain their existing absence/error semantics without a historical fetch.
Individual historical file reads validate against already fetched ancestry,
not another network fetch. A configured folder must itself be the real Git
root before any fetch or read; a parent repository is never substituted.

The first broad proof command used a bare `story-review` regex. Playwright
matched this checkout's directory name and collected 1,533 tests in 512 files.
The implementation agent stopped that owned run after about nine minutes and
observed terminal exit 1. It is not accepted proof. The anchored replacement
was collected before execution: 122 tests in 48 unique files, with no unrelated
file. An earlier mixed-candidate run and insufficient root-counterexample
setups are likewise unclaimed; later stable runs replace them.

## Accepted implementation proof

- `env -u NO_COLOR npm run test:dashboard -- --workers=2 'dashboard/tests/(boundary/)?story-review[^/]*\.spec\.ts$|dashboard/tests/recently-done-one-shot-review\.spec\.ts$'`:
  terminal exit 0, 122 tests in 48 files, session 37571. Coordinator checked
  `/tmp/dough-completed-review-selection-final-20261018.json`: 48 unique files,
  122 tests, no unexpected basename. This covers all review consumers including
  active snapshots, marks, commits/ranges, captured runs, refusals and refresh.
- `env -u NO_COLOR npm run test:dashboard -- --workers=2 dashboard/tests/boundary/story-review-completed.spec.ts dashboard/tests/story-review-completed.spec.ts`:
  terminal exit 0, final 12 tests in two files, session 91407. This follows the
  only later product edit, the Git-root guard. The coordinator inspected the
  browser's real file diff, interleaved-work exclusion, immutable refresh/reopen
  and retained-run round trip; boundary assertions for both execution modes,
  takeover diffs, exact comparison/literal-file admission, offline file reads,
  missing/ambiguous history, unrelated merges, inseparable baseline, error
  fallback, and rejection of actual parent-repository borrowing.
- `npm run typecheck:dashboard && git diff --check`: terminal exit 0 on the
  final implementation candidate, session 5719. Dependencies remain pinned to
  the checkout-bound setup.
- Discrimination: before implementation the browser's action assertion failed
  (`dashboard/test-results/2026-10-18T00-01-07.330Z`). Before the root guard the
  corrected real-Git counterexample returned a published parent comparison
  (`dashboard/test-results/2026-10-18T00-35-14.425Z`). The final passes include
  both repaired behaviors. No comparison was seeded in setup.

## Accepted independent refactoring

The fresh refactor agent returned `REFACTOR COMPLETE`. Shared profile evidence,
completed-history validation and workspace snapshots now each have one owner.
The coordinator inspected the fallback consolidation, fixed-comparison body,
context and common browser toggle. Existing attribution and workspace algorithms
were extracted unchanged. The nine original boundary scenario bodies were
preserved across admission/project, attribution and evidence-gap specs.

- `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/dough-completed-refactor-proof-20261018.json env -u NO_COLOR npm run test:dashboard -- --workers=2 'dashboard/tests/(boundary/story-review-completed(-attribution|-gaps)?|story-review(-completed|-context-line|-refresh|-trunk-own-changes|-trunk-own-flagged|-trunk-own-older-git|-trunk-own-since|-landed|-story-branch-landed|-one-shot|-one-shot-unavailable|-one-shot-choice|-one-shot-choice-refresh|-one-shot-choice-races|-mark|-commits|-since)?|recently-done-one-shot-review)\.spec\.ts$'`:
  session 41076 terminal exit 0, 49 tests in 22 files. The coordinator checked
  the completed proof record: exactly 49 passing attempts. This replaces the
  moved completed boundary proof and protects the extracted review consumers.
- `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/dough-completed-refactor-toggle-proof-20261018.json env -u NO_COLOR npm run test:dashboard -- --workers=2 'dashboard/tests/(story-review|story-review-one-shot|story-review-completed|story-review-context-line)\.spec\.ts$'`:
  session 18914 terminal exit 0, four tests in four files. The coordinator
  inspected the shared toggle and the added published hide/show assertions;
  the record confirms four passing attempts, covering workspace, context layout,
  captured and published comparisons after the last edit.
- `npm run typecheck:dashboard && git diff --check`: session 20287 terminal
  exit 0. The coordinator applied selective Prettier formatting to owned
  TypeScript files. Unchanged admission/schema/diff proof is reused.

Slice obligations passed before the done transition. Delivery and CI remain
pending; the done slice records accepted implementation and refactoring proof.

## Story obligations

### G1. Dedicated fixtures do not enumerate every unavailable Git-history shape
Reported: slice 1 — "merges with more than two parents return an unavailable explanation and have no dedicated fixture; missing-object handling is exercised through shallow history, not separate object corruption."
Story clause: "Where published evidence cannot identify the work safely, explain the missing evidence in that review rather than guessing or treating missing evidence as an empty change."
Disposition: no user cost "Let a developer review the changes of a completed story in Recently done regardless of which machine or interface executed it.": The reported limit is dedicated test enumeration. The coordinator inspected the explicit unsupported-parent-count refusal and shared Git-failure-to-explanation path; missing claim, missing agent and ambiguous merge assertions observe the promised unavailable policy. The source requires truthful unavailable behavior, not a separate fixture for every Git failure. Those two dedicated variants remain untested, and no claim is made that they ran.

### G2. Ambiguous local workspaces prevent independent published review
Reported: slice 1 — "Coordinator final inspection found that an ambiguous local workspace result blocks a completed card's independently validated published comparison."
Story clause: "Resolve a fixed historical comparison from the project's published completion and execution evidence, independently of retained dashboard launches, retired workspaces and deleted story branches."
Disposition: proved by slice 1: `dashboard/tests/boundary/story-review-completed-gaps.spec.ts`, scenario "a published completion remains reviewable while local workspaces are ambiguous". The coordinator inspected the completed-only entry into the existing published reader and its file admission, plus real CLI history and two local claimed workspaces. Active requests choose neither before/after; completed requests equal the original published comparison and read its actual literal-file diff. `env -u NO_COLOR npm run test:dashboard -- --workers=1 dashboard/tests/boundary/story-review-completed-gaps.spec.ts --grep 'published completion remains reviewable while local workspaces are ambiguous'` passed, session 28010, after first failing on the missing fallback at `dashboard/test-results/2026-10-18T00-55-31.547Z`. Typecheck/diffcheck passed in session 48847. A fresh final refactor agent returned `REFACTOR COMPLETE`, made no edits, and reused that unchanged proof; no additional test run was required.

