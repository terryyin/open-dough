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
Status: planned

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
- CI source: GitHub Actions, verified selector `ci.yml`, name `CI`.
  Codex coordinator `completed-story-review-20261018`, directory
  `/tmp/dough-ci-501/watch-s7ih1b`, PID 46636, session 67792, yielded cell 24.

## Learnings

None beyond the recorded preparation observations.

