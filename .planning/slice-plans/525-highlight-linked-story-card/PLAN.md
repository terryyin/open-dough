# Destination cue on story card reveal

**Identity:** SEED-270#highlight-linked-story-card

**Source:** [Highlight the destination of a story link](../../seeds/SEED-270-highlight-linked-story-card.md#highlight-linked-story-card)
**Source review:** [source-review.md](source-review.md)

## Goal and boundaries

A developer who follows a story reference or opens a direct story URL can
immediately tell which card arrived, even among similar cards and even when
that card is already selected or already in view. Arrival uses a brief
**destination cue** on the revealed card, distinct from the selected story's
[Highlight](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts).
Reduced motion gets a brief static cue. Selection, inspect, scroll, and
keyboard focus keep
[dashboard navigation](../../../docs/dashboard-navigation.md) behavior.

Exclusions:

- Exact glow, pulse, or color beyond brief and noticeable.
- A spoken live-region announcement beyond focusing the card.
- Amending ADR 0008's UI vocabulary table (human vocabulary maintenance).
- Cues for non-story destinations.

## Current decisions

- **Reuse shared reveal.** Attach the cue to `revealStory`
  (`dashboard/src/pageEntries.ts`), which story references
  (`storyNavigation.tsx`), direct story URLs (`StoryDestination.tsx`), and
  other callers already use for bring-into-view and focus. Do not add a
  parallel navigation stack.
- **Name it Destination cue, not Highlight.** Highlight remains the selected
  story's inset accent ring and pale fill (`story-card-selected`). The
  destination cue is a separate, brief mark that composes with Highlight and
  does not select the destination.
  [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-ui-vocabulary) ·
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
- **Borrow the finite mark pattern, not startup pulse.** Card startup uses an
  infinite `story-card-startup-pulse` for progressing launches
  (`agent-launch.css`). Destination arrival needs a one-shot mark that ends
  on its own; reuse reduced-motion handling via `prefersReducedMotion` /
  `@media (prefers-reduced-motion: reduce)` as those paths already do.
- **Re-cue on each reveal call.** Each successful `revealStory` invocation
  shows the cue again (restart the mark if the class is already present).
  Dependency follows already re-call reveal; URL destinations cue when a
  navigation asks for the destination again.

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Seed example 1: cue on dependency reveal, selection stays none | Slice 1 | Focused dependency navigation case shows the destination cue on the supplier after follow, and the supplier is not `story-card-selected` unless already selected. |
| Seed example 2: cue again while already selected and in view | Slice 1 | After selecting the destination, following the same reference again shows the cue again while Highlight remains. |
| Seed example 3: reduced-motion static cue on a Done reveal | Slice 1 | With `reducedMotion: "reduce"`, a Done story reference's revealed card shows a brief static destination cue (no motion animation), then returns to normal; selection unchanged. |
| Existing reveal contracts | Slice 1 | Existing story-reference and notification destination cases that assert focus, reading place, and selection/inspect rules still pass. |

## Decisive premises

Observed on 2026-11-08T07:30Z at `5eb6379d14f84e0ef0cc75f8fa2977bdd04c594f`
in this worktree on macOS with Node v24.21.0. Scratch edits were reverted
before any record write.

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 1 attaches cue to shared reveal | Read `revealStory` in `dashboard/src/pageEntries.ts` and its callers in `StoryDestination.tsx` and `storyNavigation.tsx` | Reveal focuses the card and calls `keepInView`; no destination cue class or style exists today. Callers share that one entry. |
| Slice 1 must not overload Highlight | Read ADR 0008 Dashboard UI concepts and `story-cards.css` `.story-card-selected` | Highlight is defined as the selected story's visual indication only. |
| Pointer users need a cue beyond focus | Chromium Playwright: click a control that programmatically `focus()`es another element; check `matches(':focus-visible')` | `visible: false` after pointer activation; `visible: true` after keyboard Enter. Dashboard uses `:focus-visible` only (`styles.css`). |
| Slice 1 proof can discriminate the cue class | Scratch: add `story-card-destination-cue` in `revealStory`, assert it in `story-reference-navigation.spec.ts` "a dependency opens its active story…", run `npm run test:dashboard -- dashboard/tests/navigation/story-reference-navigation.spec.ts -g "a dependency opens its active story" --workers=1`; then remove the class and rerun the same assertion | With the class: quiet pass (exit 0). Without: failed expect `toHaveClass(/story-card-destination-cue/)`, received `"story-card"`. Scratch reverted. |
| Reduced-motion CSS can replace animation with a static mark | Chromium Playwright: one-shot `animation` vs `@media (prefers-reduced-motion: reduce)` static outline on the same class | Normal: `animationName: cue`, `0.4s`. Reduced: `animationName: none`, `0s`, solid outline present. |
| Startup pulse is the wrong mark to reuse as-is | Read `agent-launch.css` `.story-card-startup-progressing` | Infinite 1.2s pulse for launch progress, not a finite arrival cue. |

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Never sleep, never use `test.slow()`, and keep the default timeouts. For full
runs on awake macOS with AC power, use `caffeinate -s -i` and put Homebrew Bash
first on `PATH`. On battery, follow the lid-open procedure and check the sleep
log. [Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Slice 1's focused proof is dashboard Playwright under
`npm run test:dashboard -- <paths> --workers=1` (or 2 when stable), plus
`npm run typecheck:dashboard` when TypeScript surfaces change. Prefer extending
`dashboard/tests/navigation/story-reference-*.spec.ts` and the Done reference
cases, reusing `expectSelected` from `storyCardSelection.ts` and reduced-motion
emulation already used in those folders.

## Slices

### 1. Destination cue on every story card reveal

Type: Behavior
Status: done
Proof: Outside-in proof table rows for examples 1–3 and existing reveal
contracts. Discriminating observations: destination cue present after follow,
absent (or ended) after the brief period / on other cards; Highlight and
inspect unchanged per the examples; reduced-motion path shows no motion
animation on the cue.

Behavior: developer follows a story reference or opens a direct story URL that
successfully reveals a card → that card shows a brief destination cue (static
under reduced motion) and existing reveal focus/scroll still happen → the cue
ends, leaving Highlight only when the story is selected; following the same
destination again shows the cue again.

Implement the cue in the shared `revealStory` path, document the Destination
cue name in dashboard navigation guidance beside the existing reveal rules, and
keep Highlight's meaning unchanged.

Accepted proof (slice 1): `npm run typecheck:dashboard` pass;
`npm run test:dashboard -- dashboard/tests/navigation/story-reference-navigation.spec.ts dashboard/tests/navigation/story-reference-done.spec.ts dashboard/tests/navigation/notification-story-navigation.spec.ts dashboard/tests/navigation/story-destination-repeat-cue.spec.ts --workers=2`
15 passed after refactor; whole `dashboard/tests/navigation` folder 109
passed on the unchanged reveal path. Fault checks: removing the restart or the
reduced-motion `animation: none`, or cueing only a card's first reveal, each
failed the matching spec. Refactor: duration lives only in `destinationCueMs`
(CSS fallback removed); one duplicated focus/detail check removed.

CI repair (run 42461690145, dashboard 11/12, at `df0b6e7`):
`story-review-trunk-own-since.spec.ts:172` timed out because `openStoryReview`
pressed "Review changes" while the Taken card was still reading its agent
profile. The card grew between press and release, so no click reached the
button (trace and screencast evidence). The cue change is not on this path.
The fix: `openStoryReview` (`dashboard/tests/support/storyReviewMark.ts`) waits
until the card shows no "Reading …" placeholder before pressing. A scratch
held-profile spec failed 3/3 before the fix and passed 3/3 after; all 23
helper-using specs passed (64). Refactor disposition: already-traced repair
within this repair return.

## Execution complete

Product advice: no change. The Destination cue meets the story through the one
shared reveal path, without new navigation state. Adding "Destination cue" to
ADR 0008's Dashboard UI vocabulary stays the human vocabulary step the story
excludes. Process: DD-457 (prose brief narrowed a key example).

## Concern evidence

- Slice-plan refinement: not needed — one Behavior owns one cohesive reveal
  cue; no fragmented outcomes, no Structure ahead of a second Behavior, and no
  competing domain rules.
- Remaining slice-specific concerns: none identified in this review.

## Story obligations

### G1. A full page load of the story URL cues the card but starts with no selection or open detail
Reported: slice 1 — "a full page load of the story URL (or reload) shows the cue, but selection, open detail and the Side panel do not survive it, because the page load itself resets them, not the reveal."
Story clause: "Existing selection, detail opening, scrolling, and keyboard focus follow"
Disposition: no user cost "they can immediately tell which card the link brought into view": inspected `pageStorySelection.tsx` (selection is page-lifetime `useState`) and `dashboardRoute.ts` (popstate builds a fresh route so `StoryDestination` re-reveals); every in-page repeat route (Back, Settings → Back to dashboard) keeps Highlight, detail and Side panel while re-cueing (`story-destination-repeat-cue.spec.ts`), and a full page load still cues the arrived card (`notification-story-navigation.spec.ts` after `goto`). Reset on a new page is unchanged existing navigation, not caused by the reveal.

### G2. A card className re-render during the cue ends it early
Reported: slice 1 — "A React re-render that changes a card's className during the 1.6 s cue (for example a selection or startup change) would drop the cue early."
Story clause: "shows a brief, noticeable"
Disposition: no user cost "they can immediately tell which card the link brought into view": inspected the three `revealStory` callers; none changes the card's className during the cue (inspection and the already-selected Highlight keep the cue in `story-reference-navigation.spec.ts`), so the developer always sees the cue on arrival; only a later deliberate selection or a launch start shortens an already-seen mark.
