# Source review: SEED-270#highlight-linked-story-card

Launch: fresh general-purpose subagent (no conversation inheritance, no fork)
on 2026-11-08 during execution by ruuf-chan. Input: only the seed section's
Goal, Scope, Key examples and Architecture text from
`.planning/seeds/SEED-270-highlight-linked-story-card.md#highlight-linked-story-card`,
with instructions to read no other files and change nothing. No plan, product,
proof, or slice scope was supplied.

Examples (illustrative, not rejection rules): E1 dependency reference to one
of several unselected Backlog cards; E2 repeat follow or direct URL to the
already-selected, in-view card; E3 reduced-motion Recently done reference.
Exclusions: X1 exact glow/pulse/colour; X2 spoken live-region announcement;
X3 amending ADR 0008's vocabulary table; X4 non-story destinations.
Qualifications: Q1 only successful reveals; Q2 "brief and noticeable" is the
only visual standard; Q3 navigation behaviour inherited unchanged; Q4 card
focus is the extent of announcement.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: when a developer follows a story link in the dashboard, or opens a direct story URL, they can tell right away which card the link brought into view, even when several similar cards are present. | slice 1 | observed: dashboard/tests/navigation/story-reference-navigation.spec.ts "a dependency opens its active story…" expectDestinationCue with one cued card among Backlog cards; dashboard/tests/navigation/notification-story-navigation.spec.ts "reload, direct open, and history…" cue after goto(storyUrl) |
| 2 | Each successful card reveal from a story reference shows a brief, noticeable destination cue on that card. | slice 1 | observed: dashboard/tests/navigation/story-reference-navigation.spec.ts "a dependency opens its active story…" expectDestinationCue(supplier) after dependency follow; dashboard/tests/navigation/story-reference-done.spec.ts "a delayed Done detail … reduced-motion viewport" Done reference |
| 3 | Each successful card reveal from a direct story destination (direct story URL) shows a brief, noticeable destination cue on that card. | slice 1 | observed: dashboard/tests/navigation/notification-story-navigation.spec.ts "reload, direct open, and history…" expectDestinationCue after goto(storyUrl()) and goBack() |
| 4.1 | The cue appears when the destination is already the selected story. | slice 1 | observed: dashboard/tests/navigation/story-reference-navigation.spec.ts "a dependency opens its active story…" cue after follow with expectSelected(supplier,true); dashboard/tests/navigation/story-destination-repeat-cue.spec.ts "asking again for the selected…" cue with expectSelected(card,true) |
| 4.2 | The cue appears when the destination is not the selected story. | slice 1 | observed: dashboard/tests/navigation/story-reference-navigation.spec.ts "a dependency opens its active story…" first follow, dashboard/tests/navigation/story-reference-done.spec.ts "a delayed Done detail … reduced-motion viewport", dashboard/tests/navigation/notification-story-navigation.spec.ts "reload, direct open, and history…" with expectSelected(...,false) |
| 5 | Following the same destination again shows the cue again. | slice 1 | observed: dashboard/tests/navigation/story-reference-navigation.spec.ts "a dependency opens its active story…" second and third follows re-cue, restart past original timer; dashboard/tests/navigation/story-destination-repeat-cue.spec.ts "asking again for the selected…" Back and Settings → Back to dashboard re-cue |
| 5.1 | This includes when the card is already in view. | slice 1 | observed: dashboard/tests/navigation/story-reference-navigation.spec.ts "a dependency opens its active story…" re-cue of in-view supplier; dashboard/tests/navigation/story-destination-repeat-cue.spec.ts "asking again for the selected…" toBeInViewport precondition then re-cue |
| 6 | With reduced motion enabled, the destination gets a brief static cue instead of motion. | slice 1 | observed: dashboard/tests/navigation/story-reference-done.spec.ts "a delayed Done detail … reduced-motion viewport" expectDestinationCue {motion:false}: ::after animationName none with ring; expectCueEnds |
| 7 | The cue is brief: it ends and the card returns to its normal appearance. | slice 1 | observed: expectCueEnds (dashboard/tests/destinationCue.ts) in dashboard/tests/navigation/story-reference-navigation.spec.ts "a dependency opens its active story…", dashboard/tests/navigation/story-reference-done.spec.ts "a delayed Done detail … reduced-motion viewport", dashboard/tests/navigation/notification-story-navigation.spec.ts "reload, direct open, and history…", dashboard/tests/navigation/story-destination-repeat-cue.spec.ts "asking again for the selected…": class gone, ::after content none |
| 8 | Only the destination card is cued; no other card gets the cue. | slice 1 | observed: expectDestinationCue asserts .story-card-destination-cue count 1; expectCueEnds count 0 |
| 9.1 | Selection keeps following dashboard navigation. | slice 1 | observed: dashboard/tests/navigation/story-reference-navigation.spec.ts "a dependency opens its active story…"/dashboard/tests/navigation/story-reference-done.spec.ts "a delayed Done detail … reduced-motion viewport" .story-card-selected count 0 and expectSelected false after follow; dashboard/tests/navigation/story-destination-repeat-cue.spec.ts "asking again for the selected…" expectSelected true kept |
| 9.2 | Detail opening keeps following dashboard navigation. | slice 1 | observed: dashboard/tests/navigation/story-reference-navigation.spec.ts "a dependency opens its active story…" Detail for Story B and Hide detail visible; dashboard/tests/navigation/story-destination-repeat-cue.spec.ts "asking again for the selected…" expectInspected(card,true) kept |
| 9.3 | Scrolling keeps following dashboard navigation. | slice 1 | observed: existing expectReadingTop/toBeInViewport in SRN, SRD, NSN; dashboard/tests/navigation folder 109 passed |
| 9.4 | Keyboard focus keeps following dashboard navigation. | slice 1 | observed: toBeFocused after each follow in dashboard/tests/navigation/story-reference-navigation.spec.ts "a dependency opens its active story…", dashboard/tests/navigation/story-reference-done.spec.ts "a delayed Done detail … reduced-motion viewport", dashboard/tests/navigation/notification-story-navigation.spec.ts "reload, direct open, and history…", dashboard/tests/navigation/story-destination-repeat-cue.spec.ts "asking again for the selected…" |
| 10 | Restriction: the destination cue is not the selected story's Highlight. | slice 1 | observed: dashboard/src/story-cards.css .story-card-destination-cue::after overlay separate from unchanged .story-card-selected; dashboard/tests/navigation/story-reference-navigation.spec.ts "a dependency opens its active story…" expectSelected(true) while cued |
| 11 | Restriction: a reveal leaves selection as navigation already does; it does not select the destination to mark arrival. | slice 1 | observed: dashboard/tests/navigation/story-reference-navigation.spec.ts "a dependency opens its active story…"/dashboard/tests/navigation/story-reference-done.spec.ts "a delayed Done detail … reduced-motion viewport" .story-card-selected count 0 after follow; dashboard/src/destinationCue.ts touches only class and style |
| 12 | When the destination is already selected, the Highlight stays the selection mark; selection, open detail, and Side panel content stay as they were. | slice 1 | observed: dashboard/tests/navigation/story-destination-repeat-cue.spec.ts "asking again for the selected…": expectSelected(card,true), expectInspected(card,true), Side panel review h2 Story A kept across re-cues |
| 13 | The cue is attached to the shared card reveal path that story references and direct story URLs already share. | slice 1 | observed: dashboard/src/pageEntries.ts revealStory calls cueDestination; callers storyNavigation.tsx, StoryDestination.tsx, Columns.tsx |
| 13.1 | No parallel navigation stack. | slice 1 | observed: single call in revealStory; no new navigation module |
| 14.1 | The cue has a name distinct from Highlight in navigation guidance. | slice 1 | observed: docs/dashboard-navigation.md Destination cue paragraph |
| 14.2 | The cue has a name distinct from Highlight in code. | slice 1 | observed: dashboard/src/destinationCue.ts cueDestination, class story-card-destination-cue |
| 14.3 | The cue has a name distinct from Highlight in tests. | slice 1 | observed: dashboard/tests/destinationCue.ts expectDestinationCue/expectCueEnds |
| 15 | Highlight is not overloaded to serve as the cue. | slice 1 | observed: dashboard/src/story-cards.css .story-card-selected unchanged; cue is a separate ::after overlay |
