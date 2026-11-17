# Source review

Launch: fresh general-purpose reviewer (Sonnet), no conversation inheritance,
fork or resume, 2026-11-18. Input: the verbatim Goal, Scope, Scope limits, Key
examples and a one-line Provenance of
[the source story](../../seeds/SEED-334-product-wide-end-to-end-tests.md#retire-integrated-ui-test-and-its-documents)
with the source-only instructions; no plan, product, proof or slice scope.

Unnumbered context returned: controlled answers replace the real server so the
group can retire later; sizing facts (4 of 11 specs, 564 of 1,885 lines, 11
tests); scope limits (other seven specs, retirement and `dashboard/tests/`
Markdown belong to successors; no product change, new group or tier, speed or
shard target); provenance; the earlier conversion as method baseline; key
examples are journeys, not rejection rules.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal + Scope 1: arrival-from-URL and card-selection protection kept in Dashboard Frontend Test with controlled answers; the four specs (11 tests) converted with each distinct assertion at its real boundary (Frontend under `dashboard/frontend-tests/navigation/`, Backend/E2E only for a real-server rule, or a named existing maintained case) | slice 4 | |
| 2 | Goal: the four converted specs no longer remain in the interim group; seven remain (story-reference and source navigation) | slice 4 | |
| 3 | Scope 2: the interim group stays runnable for its seven remaining specs, CI shard declaration unchanged | slice 4 | |
| 4a | Key example 1: cold `?project=doughnut&story=SEED-777#shared-story` with Doughnut's revision held — no early scroll | slice 1 | observed: dashboard/frontend-tests/navigation/story-url-destination.spec.ts "cold story URL waits…" step 'while Doughnut's revision is held': held.held > 0, revealsOf toEqual([]), card toHaveCount(0) |
| 4b | Key example 1: in that state the page does not read Open Dough | slice 1 | observed: dashboard/frontend-tests/navigation/story-url-destination.spec.ts "cold story URL waits…" same step: countProjectReads(page, 'open-dough') toBe(0) |
| 4c | Key example 1: once answered, Doughnut's card holds the keyboard in view | slice 1 | observed: dashboard/frontend-tests/navigation/story-url-destination.spec.ts "cold story URL waits…" step 'once answered': expectArrivedAt(card) (focused, in view 0.99), Tab then expectKeyboardWithin(card) |
| 4d | Key example 1: once answered, the route keeps the story | slice 1 | observed: dashboard/frontend-tests/navigation/story-url-destination.spec.ts "cold story URL waits…" step 'once answered': expectRoute story=SEED-777#shared-story, empty hash |
| 4e | Key example 1: the Frontend case holds and releases that answer itself | slice 1 | observed: dashboard/frontend-tests/navigation/story-url-destination.spec.ts "cold story URL waits…": holdProjectReads(page, "doughnut", releases) (dashboard/tests/holdAuthenticatedReads.ts) then held.release() in the case |
| 5a | Key example 2: an absent story reads differently from the other outcomes | slice 2 | |
| 5b | Key example 2: an unknown project reads distinctively | slice 2 | |
| 5c | Key example 2: a failed story read reads distinctively | slice 2 | |
| 5d | Key example 2: "Retry story destination" recovers the failed read | slice 2 | |
| 5e | Key example 2: a project choice made meanwhile wins, without a late reveal | slice 2 | |
| 6a | Key example 3: asking again (Back from Intent, Back from Settings) for the selected, inspected, reviewed destination cues it again | slice 3 | |
| 6b | Key example 3: the repeat keeps selection, detail and review heading | slice 3 | |
| 7a | Key example 4: clicking a card's empty area toggles its selection | slice 4 | |
| 7b | Key example 4: that click does not open detail | slice 4 | |
| 7c | Key example 4: Inspect leaves the selection alone | slice 4 | |
| 7d | Key example 4: a disabled Start leaves the selection alone | slice 4 | |
| 7e | Key example 4: a session entry leaves the selection alone | slice 4 | |
| 7f | Key example 4: the Dependencies disclosure with its explanation leaves the selection alone | slice 4 | |
| 8 | Key example 5: where an interim assertion observed a synthetic host ("no launch, no attach"), the Frontend case observes that the page sent no launch or attach request | slice 4 | |
