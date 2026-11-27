# Keep Intent's session review and its proof whole after the retirement

**Identity:** SEED-418#keep-session-review-proof-after-retirement

**Source:** [Keep Intent's session review and its proof whole after the retirement](../../seeds/SEED-418-review-published-session-changes.md#keep-session-review-proof-after-retirement)

## Provenance

Retrospective correction of
[SEED-418#select-a-story-session-for-review](https://github.com/terryyin/open-dough/blob/d60293a1adee86582e595aa450738616b4954f38/.planning/seeds/SEED-418-review-published-session-changes.md#select-a-story-session-for-review),
executed in plan 876 (recoverable at `d60293a1a:.planning/slice-plans/876-open-session-changes-in-intent/PLAN.md`) on branch
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

Read at `5dda721b`; the named product files are unchanged at `a0f4b5a8e`,
where the premises below were observed.

1. **Reselection returns to the card's session.** `useStoryComparison.ts`
   keeps the last opening per identity in `lastOpening` (lines 57–66) and
   passes `opened: explicit?.session` (line 112) to
   `useStorySessionScope`. `IntentPerspective.tsx:169` renders the lens
   without a per-story key, so after **Review session changes** on story X,
   selecting Y and then X again from **Recent stories**, which keeps Intent
   mounted, rebuilds X's scope at that session. Reselecting through the
   Board's cards (Development, card, Intent) remounts the lens and already
   starts at **Whole story**. The seed says a Selected story chosen otherwise
   starts at **Whole story**.
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
   measured `.intent-reading`; only its header said Side panel. The 20-line
   step is still proved by `story-review-diff-styled-rendering.spec.ts`,
   `story-review-diff-late-styling.spec.ts` and
   `story-review-diff-grammar-failure-mount.spec.ts`, which count 20 revealed
   lines. Nothing proves closing an inter-hunk gap without
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
Status: done

Behavior: **Review session changes** opened story X at session S → the
developer selects story Y and then X again → X shows **Whole story** chosen
and its story comparison.

Proof: A case in `intent-session-review-opening.spec.ts` whose Board frame
lists a second Done story: it selects that story's card, opens the first
story through **Review session changes**, selects the other story and then
the first through **Recent stories** (`intent-recent-stories-page.ts`
`chooseRow`), and observes **Whole story** checked. Premise P1 observed this
case failing at `a0f4b5a8e`.

Accepted on `d7eff060e`: `useStoryComparison.ts` drops `lastOpening` once the
hook renders another story without its own opening. The case "a story selected
again after Review session changes starts at Whole story" fails without that
and passes with it. The `dashboard/frontend-tests/intent` folder and the
Recently done and Side panel E2E specs pass.

Learning: trunk delivered the sibling `SEED-418#review-scope-dropdown`
(`0c7a1f771`, `392ecc8c4`) during execution. The branch fast-forwarded to it.
The scope control is now a dropdown: **Whole story** is read from
`intentStoryCompare().scope`, not a checked radio. Mount helpers live in
`intent-session-review-mount.ts`. Slices 2–5 still apply, with
`storySessionScopes` still in `followUpSessions.ts`.

### 2. A chosen session's pending read measures nothing
Type: Behavior
Status: done

Behavior: A session is chosen and its review is still being read → Proof and
the CI comparison show no story measurement and no whole-story note until the
session's range arrives.

Proof: A held session read in `intent-story-compare-session-evidence.spec.ts`
observes no story measurement while held, then the session's range after
release.

Accepted on `767b1bd76`: the lens reports `sessionChosen` from the session
scope. Proof uses it instead of the shown comparison's session, so a session
opened through **Review session changes** also measures nothing on its first
read. While reading, the CI comparison shows `storyChangesGapWords.reading`.
New cases in `intent-story-compare-session-evidence.spec.ts` (dropdown) and
`intent-session-review-opening.spec.ts` (opening) fail without the product
change. The Intent and Follow up frontend specs and
`e2e/intent/intent-session-scope.spec.ts` pass.

Learning: finding 2 named only `sessionEvidenceOf`. Proof also asked
`compareOf(...)?.session`, which is undefined until a comparison is shown.

### 3. Prove Intent's diff context expansion again
Type: Structure
Status: done

Change: Frontend specs prove, from the comparison's file text, closing an
inter-hunk gap without duplicates and the remainder step, the
end-of-file stop, no whole-gap shortcut, and numbering and change markers on
revealed lines. One Intent E2E proves the hunk keeps its reading place when
expanding upward, using the `expandContextDiff.ts` fixtures through Intent;
remove fixtures nothing uses afterwards.

Proof: The new specs pass, and each rule's case fails when that rule is
broken in `diffContextExpansion.ts` or `StoryReviewContextGap.tsx`.

Accepted on `5dca9bbdc`:
- `review/story-review-diff-context-expansion.spec.ts` proves:
  - the directional steps without a whole-gap shortcut;
  - the inter-hunk close with "Show 6 following lines";
  - the end-of-file stop at 20 then 10;
  - numbering and markers on revealed lines.
- `e2e/intent/intent-diff-context-expansion.spec.ts` proves the hunk stays in
  place when context is shown above it.
- Scratch breaks, each failing its case: chunk 7; remainder ignoring `fromEnd`;
  expansion past the remainder; the end-of-file guard; numbering +1; revealed
  lines marked added; an extra "Show all" control; upward place-keeping
  disabled.
- Learning: dropping `remaining > 0` from `showDown` in
  `StoryReviewContextGap.tsx` changes nothing, because the control row renders
  only while lines remain. The end-of-file rule lives in
  `diffContextExpansion.ts`.

CI on `3def01aa7` (run `45996969418`): `dashboard-frontend` lost its browser
connection after 253 of 327 files, with no assertion failure. That is the
closure owned by the Taken `SEED-413#keep-full-frontend-runs-connected`. It is
not repaired here. The same closure recurred on `3494989eb` (run
`46015067766`, 245 of 332 files).

CI repair on `4cce05fd2` (run `46001524031`):
`intent-home-activation-scope.spec.ts:134` hit a race inherited from trunk. The
page object read `aria-expanded`, yielded, then clicked, so it could close a
folder that Intent opened during the yield. `expandButton` reads the state and
clicks in the same task. It is now used by the folder, CI homepage and session
card disclosures. Evidence:
[diagnosis record](diagnosis-home-activation-scope-folder-expand.md).

### 4. Prove published sessions and the chosen run across a refresh
Type: Structure
Status: done

Change: Prove the `publishedSessions` carry through Intent: with a session
chosen, a refresh that has not yet listed the new revision keeps the Sessions
choice and the chosen session's comparison. Prove a chosen session's range 2
stays chosen with its tree after Refresh.

Proof: Both cases pass, and the first fails when `carriedFacts.ts` stops
carrying `publishedSessions`.

Accepted on `95fa1281f`.

The case "a refresh keeps the opened session and its comparison until the new
revision lists its sessions", in `intent-session-review-opening.spec.ts`, runs
the real refresh read. It holds the new revision's session list through the
Board frame supply's `listPublishedSessions` reader. With the carry removed,
it fails at the held Sessions list.

The case "a chosen session's range 2 stays chosen with its tree after Refresh",
in `intent-story-compare-session-runs.spec.ts`, passes.

Learning: for an opened session, only the Sessions list shows the carry. The
scope label and the comparison survive without it.

### 5. Give the session list its own module and drop leftovers
Type: Structure
Status: done

Change: Move `storySessions`, `SessionScope` and `storySessionScopes` from
`followUpSessions.ts` into a session-listing module that Intent and Follow up
import. Delete `expectSpansWorkarea` and `expectDrawerOver`. Remove
`intent-session-scope.spec.ts:138`. Add a frontend case for a held session A
read not answering a later choice of session B beside
`intent-story-compare-sessions.spec.ts`, then narrow
`side-panel-content-replacement.spec.ts` to the final-report frame.

Before removing `intent-session-scope.spec.ts:138`, break in a scratch edit
the two-run choice and the shared-checkout warning it observes and confirm
the named Recently done E2E and `intent-story-compare-session-runs.spec.ts`
cases fail; keep the case if one stays green.

Proof: `npm run typecheck:dashboard`, `npm run lint`, the
`intent-story-compare-*` and Follow up frontend specs, the new race case, and
`e2e/intent/intent-session-scope.spec.ts`,
`e2e/sessions/recently-done-published-sessions.spec.ts` and
`e2e/navigation/side-panel-content-replacement.spec.ts`.

Accepted on `308492186`.
- The story's session list and the sibling's `AdHocSessionDetails`, which
  `SessionScope` carries, moved to `dashboard/src/storySessions.ts`.
  `followUpSessions.ts` keeps Follow up's names, and the server's imports are
  unchanged.
- `expectSpansWorkarea` and `expectDrawerOver` are deleted.
- The two-run and warning case in `intent-session-scope.spec.ts` is removed
  after the gate. Breaking the two-run choice failed Recently done `:113` and
  `:197` and session-runs `:50`, `:64` and `:82`. Breaking the warning failed
  `:197` and `:82`.
- `executionName` in `intent-story-compare-page.ts` names execution scopes for
  the Intent specs.
- The race case was not added and the Side panel step was not narrowed. See
  G1.

## Execution complete

Product advice:
- A correction is planned and ready but not queued:
  [Retire the held-read race step that cannot fail](../../seeds/SEED-418-review-published-session-changes.md#prove-or-retire-held-read-race-step)
  ([plan 890](../890-prove-or-retire-held-read-race-step/PLAN.md)).
  Going back to Development unmounts Intent, so the Side panel step can never
  fail. The `useReviewRead.ts` checks stay proved by
  `intent-story-compare-fixed.spec.ts:159`.
- Fold these into the refinement of the queued
  `SEED-418#review-selected-sessions-together`:
  - `StorySummary` carries both `sessionChosen` and `session` from one
    chosen-session key. A single optional chosen-session value would keep
    future changes to one place.
  - The Review scope dropdown is disabled while a read is pending. Choosing
    several sessions may mean several reads.
- Low priority, and older than this story: session keys
  (`followUpSessionKey`, `FollowUpSessionChoice`) still come from Follow up's
  request schema, so a change to Follow up's request format would silently
  change Intent's scope keys.
- Learning for intent-protection review: the retired specs' descriptions named
  the Side panel while they tested Intent. Deliberate break checks found the
  missing proof where test names did not.

## Story obligations

### G1. The held-read race keeps its E2E proof
Reported: slice 5 — "The new race case passes but has not been shown to catch the race"
Story clause: "so Intent's diff and session review cannot regress silently"
Disposition: no user cost "so Intent's diff and session review cannot regress silently": this story removes no race proof. The step "a held read never answers a later session's changes" at `e2e/navigation/side-panel-content-replacement.spec.ts:48` is unchanged from before the story and passed on this candidate (`s5c-sidepanel`). Bypassing both `useReviewRead.ts` staleness checks never made the late answer show in the frontend mount, and the Review scope dropdown is disabled while a read is pending. No break has been shown to fail that step either; the retrospective's correction [Retire the held-read race step that cannot fail](../../seeds/SEED-418-review-published-session-changes.md#prove-or-retire-held-read-race-step) owns that question.

## Decisive premises

Observed at `a0f4b5a8e` in this preparation's workspace with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:frontend -- <files>`
and the E2E command below; every scratch edit was reverted.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| P1 Reselection through Recent stories returns to the opened session | Slice 1's case | The slice 1 case as a scratch test in `intent-session-review-opening.spec.ts`; the same journey through the Board's cards | Recent stories: **Whole story** not checked (fails). Board cards: passes, so the fix's route is Recent stories |
| P2 A held session read shows the story's measurement | Slice 2's case | Scratch case in `intent-story-compare-session-evidence.spec.ts` holding the `published` review read after choosing the session, CI comparison tab | Landed endpoint stayed `ccccccc exact revision`, the story's measurement (fails) |
| P3 Expansion rules other than the 20-line step are unproved | Slice 3's specs | Scratch `CONTEXT_EXPAND_CHUNK = 7`: whole frontend suite; then remainder ignoring `fromEnd`, expansion past the remainder, and revealed numbering +1, each against `frontend-tests/review` and `frontend-tests/intent` (435 cases); numbering +1 also against `e2e/review/story-review-diff-line-follow-up.spec.ts` and `story-review-diff-add-note.spec.ts` | Chunk 7 fails the three review specs named in finding 3; each other break passes every case |
| P4 The `publishedSessions` carry is unproved | Slice 4's first case | Scratch removal of the carry in `carriedFacts.ts`: whole frontend suite (324 files) and `e2e/intent/intent-session-scope.spec.ts`, `e2e/sessions/recently-done-published-sessions.spec.ts` | No case fails; `intent-story-compare-done.spec.ts:48` failed once in the full run at load ~20 and passed alone with the same edits |

Slice 3's place-kept E2E and slice 4's chosen-run case are proved by their
own slices; the move in slice 5 is checked by `npm run typecheck:dashboard`.

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
