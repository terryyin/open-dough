# Review changes from completed ad hoc sessions

**Identity:** SEED-379#review-changes-from-completed-ad-hoc-sessions
**Source:** [Review changes from completed ad hoc sessions](../../seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#review-changes-from-completed-ad-hoc-sessions)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A standalone ad hoc session entry in the Board's **Recently done** offers
**Review changes**, which opens the launch record's retained landing as a
fixed, read-only comparison in the side panel. No evidence is captured anew.

Exclusions: capture for default launches, shared-checkout attribution and
own-branch results (the seed's two later stories); an ad hoc row linked to a
published Done story, which keeps opening that story; open ad hoc sessions;
the Sessions sidebar's Recently done sessions list; Follow up from a file or
line of an ad hoc review; Mark reviewed and a Comparison switch for an ad hoc
review.

## Architecture

The seed's [Architecture](../../seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#review-changes-from-completed-ad-hoc-sessions)
names the concepts. Found elsewhere and reused:

- **Comparison reader.** `landedStoryReview` (`dashboard/server/storyReviewLanded.ts`)
  reads a record's `landing` from its saved repository and already returns the
  unreadable-repository and unreadable-object explanations. It depends on no
  story identity. Its workflow gate and the two `workflow` enums in
  `dashboard/src/storyReviewLandedRun.ts` are what exclude ad hoc.
- **Session naming.** `namedSession` (`dashboard/server/sessionAdmission.ts`)
  resolves a kept record from a request that names a session. The Recently
  done overview leaves a Done session's reporting reference out
  (`dashboard/src/sessionListing.ts`), so the ad hoc review names the session,
  never the reference. File reads then name the `reference` the landed answer
  carries, as a story's landed-run file reads do.
- **Panel and action.** `StoryReview.tsx`, its read hooks, and the
  `start-launch-button` markup of `StoryReviewAction.tsx`. `SessionEntry`
  already takes a `followUp` slot from `RecentlyDoneEntry.tsx`.
- **Close and selection.** `pageSidePanel.ts` already returns the keyboard to
  a closed request's control, else to its session's entry, and
  `selectStoryOf` clears the selected story for a request with no story.

Reviewed work is one discriminated subject: `{ source, identity }` or
`{ source, session }`. The server admits either through the same review
request and file admission functions; the client's review request carries
the same subject. No second panel, route family or diff reader is added.

Files this work expects to edit that are at or near the 250-line limit
([file size](../../../.claude/skills/dough-post-change-refactor/references/refactor-checks.md#file-size)):
`SessionEntry.tsx` 250, `PageFrame.tsx` 249, `pageSidePanel.ts` 246,
`storyReviewContract.ts` 246, `StoryReview.tsx` 245. None is over it now.
Each owning slice keeps them within it by cohesive extraction:

| File | Seam | Slice |
| --- | --- | --- |
| `storyReviewContract.ts` | the reviewed-work subject and its query spelling move to a module of their own | 1 |
| `pageSidePanel.ts`, `PageFrame.tsx` | the review request's identity (`sameStory`, the panel key) becomes the subject's own comparison in `pageStoryReviews.ts` | 4 |
| `StoryReview.tsx` | the header's title and subtitle become a subject heading component | 4 |
| `SessionEntry.tsx` | unchanged: the action arrives through the existing slot | 5 |

## Settled premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The landed reader reads an ad hoc record's landing after its worktree is gone | slice 1 | 2026-11-16 at `3fa005160`: `landedStoryReview` bundled with esbuild into the job's scratch directory and called with a kept open-dough ad hoc record whose workspace no longer exists; then the same bundle with the workflow gate and the two `workflow` enums relaxed in the scratch copy only | as built: `landing-unavailable`, “This launch's workflow has no landed review.”; relaxed: `landed` with 3 files and the captured context |
| A default launch has no established place, and the reader assumes one | slice 2 | same probe with a kept default launch record | throws on `isEstablishedOneShot(undefined)`; slice 2 gives that case its own explanation before the reader |
| Retained ad hoc landings are readable | the goal's value | 2026-11-16: `git cat-file -e` of base and revision in each record's saved repository, all 66 kept ad hoc landings on the maintainer's machine | all readable |
| The backend proof route runs with ad hoc records and real Git | slices 1–3 | 2026-11-16 at `3fa005160`: `npx playwright test --config dashboard/backend.playwright.config.ts --reporter=list review/story-review-stored-runs.spec.ts sessions/completed-story-association.spec.ts` | 8 passed |
| The frontend proof route runs for Recently done ad hoc entries and the review action | slices 4–6 | same time and revision: `npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list sessions/recently-done-sessions-select-ad-hoc-check.spec.ts review/story-review-action.spec.ts` | 2 passed |
| A standalone Done entry's overview record carries its session and leaves out its landing and reporting reference | slices 1, 5 | read at `3fa005160`: `historyOnlyFields` in `dashboard/src/sessionListing.ts`; `RecentlyDoneEntry.tsx` renders the entry from `each.session` | holds by reading; slice 5's spec serves the overview without those fields, which fails the slice if the action needed them |

## Outside-in proof and local gates

- Before authoring or changing a test, apply
  [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md) and
  [`dough-page-objects`](../../../.agents/skills/dough-page-objects/SKILL.md).
  Launch records and landings come from the launch MakeMe builders
  (`Distribution/tests/support/launchMakeMe.mjs`: `aLaunchRecord().adHoc(…)`,
  `aLaunchLanding`); browser steps go through `tests/storyReviewPages.ts` and
  `tests/recentlyDoneColumn.ts`.
- Focused proof, after `node scripts/setup-native.mjs npm` and `browser`,
  from the repository root, for the specs each slice names:
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/backend.playwright.config.ts --reporter=list <paths under backend-tests/>`,
  and the same with `dashboard/frontend.playwright.config.ts` for paths under
  `frontend-tests/`. `scripts/test.sh` refuses Playwright specs (observed
  2026-11-16).
- Slice 4 changes shared review plumbing, so it also runs
  `dashboard/frontend-tests/review/`, `dashboard/frontend-tests/stories/recently-done-review-*.spec.ts`
  and `dashboard/frontend-tests/intent/intent-done-*review*.spec.ts`. Slice 1
  changes shared admission, so it also runs `dashboard/backend-tests/review/`.
- No slice needs a full local suite. One that does runs under
  `caffeinate -s -i` on AC power from a fully awake machine
  ([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)).
- Failures and flakes follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Timeouts keep their defaults; `test.slow()` is not used.

| Promise | Owner |
| --- | --- |
| A landed ad hoc session's entry opens its fixed comparison after worktree removal and trunk advance | 1 (answer), 3 (diffs), 5 (panel) |
| A session completed before this story with a retained landing opens the same way | 1 |
| A session without a landing says its changes were not captured and lists no files | 2, 6 |
| An unreadable saved repository or objects explain the unavailable comparison | 2, 6 |
| An empty retained pair says the delivered comparison is empty | 2, 6 |
| The review is read-only with one comparison: no Comparison switch, no Mark reviewed, no line Follow up | 5 |
| Header names the session; context line names launch time, remote target, base and accepted revision | 5 |
| Close returns the keyboard to the entry's Review changes; Recently done keeps its range and counts | 5 |
| Every standalone ad hoc entry offers the action; a linked ad hoc row still reveals its story | 5 |
| Story reviews behave as before | 1, 4 |
| No request supplies a path; file reads match the retained pair and a listed path | 1, 3 |
| Product documentation describes the ad hoc review | 6 |

## Slices

### 1. An ad hoc review request answers the retained landing

Type: Behavior
Status: done
Proof: new `dashboard/backend-tests/review/ad-hoc-review.spec.ts`; `dashboard/backend-tests/review/` stays green.

Behavior: a kept ad hoc record with a landing captured in a real repository,
whose worktree was then removed and whose trunk advanced → a review request
naming the project and that session → a `landed` answer whose files are those
between the captured base and accepted revision, with workflow `ad-hoc`, the
launch time, remote target, base and revision, and no run choices. A request
naming both a story identity and a session, a session of a story launch, or
an unknown session is refused.

The subject (`identity` or `session`) is admitted once in
`storyReviewRequest.ts`; the reader's workflow gate and the two enums admit
`ad-hoc`.

Accepted proof (2026-11-16):
- `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/backend.playwright.config.ts --reporter=list dashboard/backend-tests/review/ad-hoc-review.spec.ts` → 2 passed (landed after worktree gone + trunk advance; refusals for story session, unknown, dual subject; HEAD/index unchanged).
- same command with `dashboard/backend-tests/review/` → 93 passed.
Learning: kept Done records older than retention are invisible to `keptSession`; proof uses a fresh `markedDone()`.

### 2. An ad hoc review explains missing, unreadable and empty evidence

Type: Behavior
Status: done
Proof: the same spec, further tests.

Behavior: a default launch's record with no landing → “This session's changes
were not captured.” as `landing-unavailable`, with no files. A landing whose
saved repository is gone, or whose objects are missing → the reader's existing
explanations. A landing whose base and revision hold the same tree → `landed`
with no files.

Accepted proof (2026-11-16):
- `ad-hoc-review.spec.ts` → 5 passed (not-captured raw JSON; missing repo/objects; empty landed).
- `dashboard/backend-tests/review/` → 96 passed.
Learning: default launches have no established place; session admission must short-circuit no-landing before requiring one.

### 3. An ad hoc review's file diff and file text are admitted

Type: Behavior
Status: done
Proof: the same spec, further tests; `backend-tests/review/story-review-file-text-admission.spec.ts` and `-refusal.spec.ts` stay green.

Behavior: the answer of slice 1 → a file diff request and a file text request
naming the project, the session, the answer's reference, pair and one listed
path (the old path for a rename) → the literal diff and text. A path outside
the list, another pair, or another session's reference is refused with the
existing “does not belong to this captured run” answer.

`admitHistoricalReviewedFile` resolves the run from the subject instead of
only from a story identity.

Accepted proof (2026-11-16):
- `ad-hoc-review.spec.ts` → 7 passed (rename oldPath admit; foreign path/pair/reference refuse).
- `dashboard/backend-tests/review/` → 98 passed (plan's `-refusal.spec.ts` name does not exist as a file; coverage is in this suite).
Learning: shared subject URL admission lives in `reviewedWorkSubjectAdmission.ts` for review and file reads.

### 4. The review panel takes a reviewed-work subject

Type: Structure
Status: planned
Proof: the frontend review, Recently done review and Intent review specs named under local gates stay green.

Internal change: the client's review request, its sameness comparison, the
panel key, the default and file read queries, and the header heading take the
subject `{ source, identity }` or `{ source, session }` instead of a bare
identity, with the extractions the Architecture table names. Story reviews
read and render as before. Enables slice 5.

### 5. A Recently done ad hoc entry opens its review

Type: Behavior
Status: planned
Proof: new `dashboard/frontend-tests/sessions/recently-done-ad-hoc-review.spec.ts` with controlled review answers.

Behavior: a standalone ad hoc Done entry listed without its landing or
reference → **Review changes** on the entry → the side panel shows the
session's label as its title, the landed context line, the file browser and
the first file's diff; it shows no Comparison switch, Mark reviewed or line
Follow up menu, and the selected story is cleared. Close returns the keyboard
to the entry's **Review changes** and Recently done's range and counts are
as they were. An entry without a landing offers the action too. A linked ad
hoc row keeps revealing its story
(`recently-done-sessions-select-ad-hoc-check.spec.ts` stays green).

`RecentlyDoneEntry.tsx` passes the action beside `SessionFollowUp` through
`SessionEntry`'s existing slot.

### 6. The panel explains an ad hoc review without a comparison

Type: Behavior
Status: planned
Proof: the slice 5 spec, further tests; documentation read.

Behavior: the not-captured, unreadable and empty answers of slice 2 → the
panel shows the explanation, or that this session's delivered comparison is
empty, with no file browser or diff.

The slice also brings `dashboard/AGENT-LAUNCH-REVIEW.md`,
`STORY-REVIEW-LANDED-RUNS.md` and `AGENT-LAUNCH-COMPLETION.md` in line: an
unattached session's captured landing is reviewed from its Recently done
entry.

## Current decisions

- Three stories; this plan is the first. Terry, 2026-11-16.
- The action is offered on every standalone ad hoc Done entry, so an absent
  comparison is explained where the developer looks.
- The ad hoc review names the session, since the overview withholds the
  reporting reference.
- Server and client proof stay at their own boundaries; both parse the shared
  `storyReviewContract` schemas, which carry the `ad-hoc` workflow once.

## Refinement and concerns

Slice-plan refinement was not needed: six slices, each one proof loop within
the size limit, with every promise owned. This review identified no remaining
slice-specific concern.
