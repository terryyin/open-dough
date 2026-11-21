# Name an unavailable published-session review as published changes

**Identity:** SEED-418#name-unavailable-published-session-review
**Source:** [Name an unavailable published-session review as published changes](../../seeds/SEED-418-review-published-session-changes.md#name-unavailable-published-session-review)

## Correction input

- **Provenance.** Outcome review of the completed execution of
  SEED-418#correct-published-session-review (plan 746 at
  `6302d70889f6b798df1fd8d8a5381e71d729f3ae:.planning/slice-plans/746-correct-published-session-review/PLAN.md`,
  attributable commits `126fabd26..576150249` after Take
  `343b15f2c89edef12b755475e513d5561277a90e`). Slice 3's refactor already
  named this residue. Rechecked at `576150249` on 2026-11-21.
- **Preserved promises.** Plan 746's promises and history stay as written: a
  successful published-session review answers `kind: "published-session"` with
  published-changes wording and close time; kept-session wording stays on
  `session-commits` only; a developer can still open a published session from
  a machine without launch history when Git holds the pair.
- **Genuine constraints.** ADR 0008 durable project state versus local
  operational state, and the North Star on directly testable production code,
  apply. Plan 747 still owns multiple ranges and other workflows' records.
- **Boundaries.** Does not change Land routing, listing suppression, fetch
  bounds, listing gaps, or opening-read budgets already delivered in plan 746.

### Findings

1. **Unavailable published gap still looks like kept session commits.**
   When the recorded pair is missing from this machine's Git,
   `publishedSessionReview` returns `unavailableSessionCommitsReview`, which
   answers `kind: "landing-unavailable"` with `comparison: "session-commits"`.
   `reviewsSessionCommits` then matches, so the review description becomes
   "Read-only: this session's kept commits." and the toolbar name becomes
   "Session commits", while the explanation text still says published
   commits. The success path already uses `kind: "published-session"`.

## Goal and scope

A developer who opens a published session whose recorded commits this machine
lacks still sees a published-session gap: the chrome names published changes,
not kept session commits, and the explanation remains the published-missing
wording.

**Exclusions.** Does not change the successful published-session answer, kept
session unavailable gaps, or Land / listing / fetch work from plan 746.

## Current decisions

- **Published unavailable has its own comparison.** Stop calling
  `unavailableSessionCommitsReview` from `publishedSessionReview`. Answer
  `kind: "landing-unavailable"` with `comparison: "published-session"` (widen
  the contract literal union) and the same published-missing explanations.
  Extend `reviewsPublishedSession` so that unavailable shape names published
  changes the way the success kind does. Kept-session callers keep
  `comparison: "session-commits"`.

## Decisive premises

Observed read-only in this checkout at `576150249` on 2026-11-21.

| Consuming operation | Observation |
| --- | --- |
| Unavailable published answer shape (slice 1) | `publishedSessionReview` returns `unavailableSessionCommitsReview(...)` when the pair is missing (`dashboard/server/publishedSessionReview.ts:107-116`). That helper sets `comparison: "session-commits"` (`storyReviewSessionCommits.ts:95-102`). |
| UI chrome for that shape (slice 1) | `npx tsx` importing `storyReviewContract.ts` with `{ kind: "landing-unavailable", comparison: "session-commits" }` yields `reviewsSessionCommits: true`, `reviewsPublishedSession: false`. `reviewDescription` then returns "Read-only: this session's kept commits." (`StoryReviewContext.tsx:26-27`); `toolbarComparisonName` returns `sessionCommitsName` ("Session commits") (`StoryReviewToolbar.tsx:62-63`). |
| Existing backend gap proof (slice 1) | `published-session-review.spec.ts` already expects `kind: "landing-unavailable"` and the published-missing explanation; it does not yet refuse `comparison: "session-commits"`. |

## Outside-in proof

| Promise | Owning slice and observation |
| --- | --- |
| An unavailable published-session review names published changes, not kept session commits | 1. A frontend case mounts the unavailable answer and shows published-session chrome / description, with no "kept" / "Session commits" chrome. Backend asserts `comparison: "published-session"` (or equivalent) and keeps the published-missing explanation. Kept-session unavailable cases still use `session-commits`. |

## Ordered slices

### 1. Unavailable published review names published changes

Type: Behavior
Status: pending

**Behavior.**
- **Pre-condition:** a published session record whose recorded pair this
  machine's Git lacks.
- **Trigger:** opening that session's review.
- **Postcondition:** the answer is `landing-unavailable` with
  `comparison: "published-session"` and the published-missing explanation.
  The page names published changes (description / toolbar), not kept session
  commits. Kept-session unavailable gaps are unchanged.

**Proof.**
- Extend `published-session-review.spec.ts` so the missing-pair case asserts
  the published comparison and fails while `comparison` is still
  `"session-commits"`.
- Add or extend a frontend case in `published-session-subject.spec.ts` that
  mounts the unavailable published answer and fails on kept-session chrome.
- Existing kept-session unavailable cases still pass.
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- review/published-session-review review/ad-hoc-review-kept-unavailable
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:frontend -- review/published-session-subject
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```

## Local gates

- Apply the
  [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written.
- Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) where its test
  selection applies.
- Keep default timeouts and never use `test.slow()`.
- Use the pinned Node from `.node-version`.
- Run each slice's focused commands as written, with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`.
  Hosted CI settles the full groups.

## Plan review

Slice-plan refinement was not needed. One Behavior slice owns the one finding
with its own proof loop. Plan size is one slice. This review found no remaining
slice-specific concern.
