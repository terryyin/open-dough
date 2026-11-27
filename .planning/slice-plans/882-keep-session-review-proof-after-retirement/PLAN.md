# Keep Intent's session review and its proof whole after the retirement

**Identity:** SEED-418#keep-session-review-proof-after-retirement

**Source:** [Keep Intent's session review and its proof whole after the retirement](../../seeds/SEED-418-review-published-session-changes.md#keep-session-review-proof-after-retirement)

## Provenance

Retrospective correction of
[SEED-418#select-a-story-session-for-review](../../seeds/SEED-418-review-published-session-changes.md#select-a-story-session-for-review),
executed in plan 876 on branch
`claude/open-session-changes-in-intent-and-retire-the-si` from `d4defcbb2`:
`68950353` (session scope), `e4b50a2b` (runs, warning, no-record session),
`72f6de87` (Proof follows the session), `6acf7874` (Follow up), `f7e9755f`
(Side panel frame specs on a terminal), `06cf55f9` (Review session changes
opens Intent; unreachable specs deleted), `78b2b222` (CI repair), `5dda721b`
(Side panel review retired). The original promises stand: the scope list,
**Whole story** as the start for a Selected story chosen otherwise, Source,
diff and Proof using the chosen session or run, and proving through Intent
the behavior the removed specs covered.

## Current findings

Read at `5dda721b`.

1. **Reselection returns to the card's session.** `useStoryComparison.ts`
   keeps the last opening per identity in `lastOpening` (lines 57–66) and
   passes `opened: explicit?.session` (line 112) to
   `useStorySessionScope`. `IntentPerspective.tsx:169` renders the lens
   without a per-story key, so after **Review session changes** on story X,
   selecting Y and then X again rebuilds X's scope at that session. The seed
   says a Selected story chosen otherwise starts at **Whole story**.
   `intent-story-compare-sessions.spec.ts:156` chooses the session through
   the radio group, so it does not reach this path.
2. **A chosen session's first read measures the whole story.**
   `sessionEvidenceOf` (`IntentStorySummary.tsx:127`) returns `{}` while
   the comparison is `reading`, so `IntentCiEvidenceProvider` shows the
   story's CI comparison until the session's read settles; `shownMemory` is
   keyed by `scopeKey`, so nothing is carried on a first read.
3. **Diff context expansion lost its proof.** `06cf55f9` deleted
   `e2e/review/story-review-diff-context.spec.ts`, which opened Intent
   through `openExpandDiff` → `openIntentReviewChanges`
   (`d4defcbb2:dashboard/test-support/support/expandContextDiff.ts:30`) and
   measured `.intent-reading`; only its header said Side panel. Nothing at
   `5dda721b` proves 20-line steps, closing an inter-hunk gap without
   duplicate lines and the "Show 6 following" remainder, the end-of-file
   stop, no whole-gap shortcut, numbering and change markers on revealed
   lines, or the hunk keeping its place when expanding upward
   (`diffContextExpansion.ts`, `StoryReviewContextGap.tsx`). Its fixtures
   remain in `expandContextDiff.ts` without a caller.
4. **Published sessions kept across a refresh lost their proof.**
   `5dda721b` deleted `review/published-session-subject.spec.ts`, whose case
   "a refresh keeps the shown published sessions until the new revision
   lists them" was the only test of the `publishedSessions` carry in
   `carriedFacts.ts:180-183`. Intent's Sessions list and the chosen
   session's record now read it through `useCurrentPublishedSessions`
   (`useStorySessionScope.ts:45-50`). The deleted
   `review/story-review-details.spec.ts` case "the chosen session run
   survives Refresh" has no Intent counterpart either.
5. **The story's session list lives in Follow up's module.**
   `followUpSessions.ts` holds `storySessions`, `SessionScope` and
   `storySessionScopes` (Intent's scope) beside Follow up's
   `FollowUpSession`, `isFollowUpSession` and request helpers. The server
   imports only `storyFollowUpSessions`, `followUpSessionContext` and
   `followUpSessionSelected`.
6. **Leftovers.** `test-support/support/reviewPanes.ts` `expectSpansWorkarea`
   and `expectDrawerOver` have no callers.
   `e2e/intent/intent-session-scope.spec.ts:138` repeats observations made by
   `e2e/sessions/recently-done-published-sessions.spec.ts:113,197` and the
   frontend `intent-story-compare-session-runs.spec.ts:50,64`. The
   `side-panel-content-replacement.spec.ts:20` step "a held read never
   answers a later session's changes" is a one-service Intent race with no
   frontend counterpart.

## Current decisions

- An opening's session applies to the opening that carried it; any other
  selection of the story starts at **Whole story**.
- A chosen session's pending read measures nothing in Proof; it shows the
  existing reading state rather than the story's measurement.
- Context-expansion rules are one service's behavior: prove them in frontend
  specs beside `review/story-review-diff-styled-rendering.spec.ts`. Keep one
  Intent E2E for the reading place kept while expanding upward, which needs
  real layout.
- Move the story session list into a session-listing module; Follow up's
  names and the server's imports stay.
- Story Branch Mode or Trunk Mode is chosen at Take.

## Ordered slices

### 1. A story selected again starts at Whole story
Type: Behavior
Status: planned

Behavior: **Review session changes** opened story X at session S → the
developer selects story Y and then X again → X shows **Whole story** chosen
and its story comparison.

Proof: A frontend spec beside `intent-session-review-opening.spec.ts` that
opens through the card, selects another story, reselects, and observes
**Whole story** checked; it fails at `5dda721b`.

### 2. A chosen session's pending read measures nothing
Type: Behavior
Status: planned

Behavior: A session is chosen and its review is still being read → Proof and
the CI comparison show no story measurement and no whole-story note until the
session's range arrives.

Proof: A held session read in `intent-story-compare-session-evidence.spec.ts`
observes no story measurement while held, then the session's range after
release.

### 3. Prove Intent's diff context expansion again
Type: Structure
Status: planned

Change: Frontend specs prove 20-line steps from the comparison's file text,
closing an inter-hunk gap without duplicates and the remainder step, the
end-of-file stop, no whole-gap shortcut, and numbering and change markers on
revealed lines. One Intent E2E proves the hunk keeps its reading place when
expanding upward, using the `expandContextDiff.ts` fixtures through Intent;
remove fixtures nothing uses afterwards.

Proof: The new specs pass, and each rule's case fails when that rule is
broken in `diffContextExpansion.ts` or `StoryReviewContextGap.tsx`.

### 4. Prove published sessions and the chosen run across a refresh
Type: Structure
Status: planned

Change: Prove the `publishedSessions` carry through Intent: with a session
chosen, a refresh that has not yet listed the new revision keeps the Sessions
choice and the chosen session's comparison. Prove a chosen session's range 2
stays chosen with its tree after Refresh.

Proof: Both cases pass, and the first fails when `carriedFacts.ts` stops
carrying `publishedSessions`.

### 5. Give the session list its own module and drop leftovers
Type: Structure
Status: planned

Change: Move `storySessions`, `SessionScope` and `storySessionScopes` from
`followUpSessions.ts` into a session-listing module that Intent and Follow up
import. Delete `expectSpansWorkarea` and `expectDrawerOver`. Remove
`intent-session-scope.spec.ts:138`. Add a frontend case for a held session A
read not answering a later choice of session B beside
`intent-story-compare-sessions.spec.ts`, then narrow
`side-panel-content-replacement.spec.ts` to the final-report frame.

Proof: `npm run typecheck:dashboard`, `npm run lint`, the
`intent-story-compare-*` and Follow up frontend specs, the new race case, and
`e2e/intent/intent-session-scope.spec.ts`,
`e2e/sessions/recently-done-published-sessions.spec.ts` and
`e2e/navigation/side-panel-content-replacement.spec.ts`.

## Proof ownership and local gate

| Finding | Slice |
| --- | --- |
| 1 Reselection starts at Whole story | 1 |
| 2 Pending session read | 2 |
| 3 Diff context expansion proof | 3 |
| 4 Refresh carry and chosen run | 4 |
| 5, 6 Module, leftovers, redundant and misplaced E2E | 5 |

Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run focused specs with `npm run test:dashboard:frontend -- <files>` and
`OPEN_DOUGH_E2E_PROOF_RECORD=<tmp> caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:e2e -- <files>`,
plus `npm run typecheck:dashboard`, on awake macOS on AC under
`caffeinate -s -i` per [AGENTS.md](../../../AGENTS.md).

## Plan review

Each slice owns one finding and its proof loop; five slices are within the
limit. Slices 3–5 are Structure that restore or relocate proof and code
without changing behavior.
