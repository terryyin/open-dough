# Expand dashboard diff context from the line-number gutter

**Source:** [Selected story](../../seeds/SEED-189-dashboard-diff-context-expansion.md#expand-dashboard-diff-context)
**Identity:** SEED-189#expand-dashboard-diff-context

## Goal and scope

A developer reviewing a story's changed files in the Side panel story review
can reveal omitted unchanged lines around a change with directional load-more
controls in the line-number gutter, without leaving the review. Each
activation reveals 20 lines (or fewer when fewer remain) from the same file
revisions as the comparison being reviewed.

**Exclusions:** Changing the initial hunk context Git prints; one-click
whole-gap or whole-file expand; matching GitHub chrome beyond the directional
gutter interaction; side-by-side or word-level diffs; persisting expansion
across files or sessions.

**Assumptions:** Story review already admits one file under concrete
`baseline`/`from` and `tree` object IDs (and optional rename `oldPath`). The
printed unified diff remains the first paint; omitted ranges are filled from
those revisions' file text.

## PFE and architecture

- **Reuse:** `dashboard/src/StoryReviewFileDiff.tsx`, `unifiedDiff.ts`,
  `storyReviewFileResponse.ts` / `AdmittedFileDiff` admission, and the
  Playwright story-review journey in `dashboard/tests/story-review.spec.ts`
  (with `storyReviewWorktree` fixtures).
- **Change:** Extend the admitted review-file path so the Side panel can read
  revision-consistent file text for the same comparison identity as the
  printed diff, and splice 20-line windows into omitted gaps with gutter
  controls.
- **Gap (do not force):** `repositoryFileReads.ts` / `fileContentCache.ts`
  serve published remote authenticated reads, not local admitted review trees.
  Borrow their caching idea only if a second fetch of the same review blob
  appears in the same panel session; do not route review trees through the
  published-read boundary.
- **ADR:** Follow
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  story review is Side panel content; expansion windows are disposable
  presentation state; Git remains the observation source. No North Star topic
  warranted.

## Outside-in proof

| Key example | Signal |
| --- | --- |
| Upward expand before a hunk | Playwright: a fixture with omitted lines above a hunk; activating the upward gutter control inserts the preceding unchanged lines (≤20) immediately above, with correct old/new numbers |
| Bidirectional gap between hunks | Same journey: downward after the earlier hunk and upward before the later hunk each reveal from their end of the gap; repeats close the gap with no duplicate lines; controls become unavailable when exhausted |
| Downward after the final hunk | Same journey: downward control reveals following lines; none beyond EOF |
| Additions/removals keep markers | Expanding unchanged context leaves existing `+`/`-` styling and numbering intact |
| Scroll position usable | Expanding upward above a mid-viewport hunk keeps that hunk's previously visible lines in view |
| Context unread / retry | With the content read failing for that file, the printed diff remains; failure is visible at the control and retry recovers when the read succeeds |

Focused command (owned checkout):

```text
npx playwright test --config dashboard/playwright.config.ts dashboard/tests/story-review.spec.ts
```

Extend that file (or a tightly paired sibling under `dashboard/tests/` that
shares `storyReviewWorktree`) with the expand cases; keep existing diff
assertions green. Admission-shaped server cases for the new file-text answer
belong beside existing `story-review-*-admission` / boundary file-diff checks
when the Structure slice adds them.

## Ordered slices

### 1. Review can read admitted file text at the comparison trees
Type: Structure
Status: planned
Proof: An admission/boundary check: the same admitted `baseline`, `tree`,
`path` (and `oldPath` when renamed) that serve today's printed diff can return
the file's text at those trees (or a typed unavailable explanation). Focused
server/admission tests beside the existing review-file admission cases pass;
existing printed-diff answers stay unchanged.

Internal change: Expose revision-consistent file text for an admitted review
file under the same launch-boundary admission as
`storyReviewFileEndpoint`, without inventing a second comparison identity.
Enables: slice 2's expansion from that text.

### 2. Directional gutter controls reveal twenty-line omitted context
Type: Behavior
Status: planned
Proof: The outside-in table above through the focused Playwright command (and
any paired expand-only sibling kept in that command). Discriminating check:
with expansion disabled in a scratch edit, the new expand assertions fail
while today's printed hunk assertions still describe the first paint.

Behavior: A story-review file diff whose printed hunks omit unchanged lines
before, between, or after hunks → the developer activates a directional
gutter control at that boundary (pointer, keyboard, or touch) → up to 20
unchanged lines from the comparison's file revisions appear at that end of
the gap, once each, with correct old/new numbers and markers; repeated
activation exhausts the gap; controls are unavailable at file bounds; upward
expansion keeps the prior reading place usable; a failed context read leaves
the printed diff readable and offers retry.

## Current decisions

- Chunk size is **20** lines per activation (GitHub-like; story refinement).
- Expansion model is **splice from revision file text**, not a larger
  reprinted `git diff -U…`.
- First paint keeps Git's default printed context; this story does not raise
  `-U`.

## Decisive premises

- **Default unified diffs omit inter-hunk lines.** Consuming operation: gap
  detection between printed hunks. Observation (2026-10-30, this workspace):
  `git diff --no-index` of two 26-line files differing at lines 4 and 23 with
  default context printed two hunks and omitted the middle unchanged span
  (`h`–`s`), confirming omitted gaps exist without a larger `-U`.
- **`git show <tree>:path` returns file text for review tree object IDs.**
  Consuming operation: Structure slice file-text read. Observation
  (2026-10-30, this workspace): `HEAD^{tree}` is type `tree`, and
  `git show "${tree}:dashboard/src/unifiedDiff.ts"` / `StoryReviewFileDiff.tsx`
  returned file text.
- **Printed diff UI has no expand controls today.** Consuming operation:
  Behavior slice first paint. Observation: `StoryReviewFileDiff.tsx` renders
  only hunk lists from `printed`; no gutter expand affordance.
- **Proof route exists in this checkout.** Consuming operation: Behavior
  proof. Observation: `dashboard/tests/story-review.spec.ts` already asserts
  printed hunk lines and line numbers via `storyReviewWorktree`; the focused
  Playwright config path is the named command above.

## Concern evidence

- Slice-plan refinement: not needed — two slices, one Structure immediately
  before its Behavior, one outside-in proof loop, no independent second
  outcome or accumulating special-case design.
- Remaining slice-specific concerns: none identified.
