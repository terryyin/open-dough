# Source review

Launch: a fresh general-purpose reviewer with no conversation inheritance,
given only the story section of SEED-334#move-story-reference-checks (Goal,
Scope, scope limits, key examples, safe stopping point, provenance) as of
`ac8d1fc21`, told to read no project files and change nothing, and to number
independently observable promises. Returned 2026-11-18.

Context (unnumbered): the provenance and resplit; the group retiring next as
the reason; the 6-of-7 specs, 1,075 lines and 19 tests baseline; the method of
SEED-334#retire-integrated-ui-test-and-its-documents; the scope limits
(`source-navigation`, retirement and `dashboard/tests/` Markdown elsewhere; no
product behavior change, new group or tier, speed or shard target); the safe
stopping point (active-reference or Done-reference specs alone are complete).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The protection for following a story reference (active or Done, by identity, with cancellation and recovery) lives in the Dashboard Frontend Test group with controlled answers instead of a real dashboard server | slice 8 | |
| 2 | The six specs are converted and leave the interim group, so `source-navigation` is its last spec | slice 8 | |
| 3a | Every distinct assertion in the six specs is kept; Frontend-boundary assertions go under `dashboard/frontend-tests/navigation/` | slice 8 | |
| 3b | An assertion gets a Backend or representative E2E home only when its rule needs the real server | slice 8 | |
| 3c | Where an existing maintained case already makes the same assertion, that case is named as its home | slice 8 | |
| 4a | A read the interim case counted at GitHub becomes a count of the page's own reads | slice 7 | |
| 4b | A count only the server decides (e.g. what its cache spares) keeps a Backend home | slice 7 | |
| 5a | The real Take behind a starting story stays protected by E2E `launches/agent-launch-start-dependencies.spec.ts` | slice 2 | |
| 5b | A Frontend case observes the protected Inspect while the page's start is unanswered | slice 2 | |
| 6a | The interim group stays runnable with `source-navigation` alone | slice 8 | |
| 6b | The group's CI shard declaration is reduced to what selects a spec | slice 8 | |
| 7 | Test support the deletions leave without a consumer is removed | slice 8 | |
| 8a | Story A waits on Story B: following the reference opens Story B's detail at its reading top, keyboard on the card, a cue that does not select it | slice 1 | observed: dashboard/frontend-tests/navigation/story-reference-navigation.spec.ts first test, step 'following the reference opens Story B's detail at its reading top…' (focus, expectReadingTop, cue, no .story-card-selected, expectSelected false) |
| 8b | Following again while the cue fades restarts the cue and keeps the selection and detail made meanwhile | slice 1 | observed: dashboard/frontend-tests/navigation/story-reference-navigation.spec.ts first test, step 'following while the cue fades restarts it…' (expectDestinationCueRestarted, selected, Hide detail, focus) |
| 8c | The canonical record opens the GitHub blob of the published revision | slice 1 | observed: dashboard/frontend-tests/navigation/story-reference-navigation.spec.ts first test, step 'the canonical record opens GitHub's blob of the published revision' (popup URL = blob at services.revision) |
| 8d | A later revision leaves the keyboard where the developer put it | slice 1 | observed: dashboard/frontend-tests/navigation/story-reference-navigation.spec.ts first test, step 'a later revision leaves the keyboard on Story A's Inspect' |
| 9a | Story B starting with its start unanswered: the reference moves the keyboard to its card and leaves the protected detail closed | slice 2 | |
| 9b | In that state the page sends no further launch or attach request | slice 2 | |
| 10a | Two stories share one seed: each reference opens the story its identity names | slice 3 | |
| 10b | Pygardon tells `SEED-B#b` in a seed of its own: the reference opens that story in the shown project | slice 3 | |
| 10c | References can be followed by keyboard and by tap | slice 3 | |
| 10d | At narrow width with reduced motion, the reveal is reduced-motion | slice 3 | |
| 11a | `SEED-C#c` not queued: its reference reads "unavailable" | slice 4 | |
| 11b | A retry while the backlog read is held reads "Reading…" | slice 4 | |
| 11c | A retry whose read fails reads "Could not read…" | slice 4 | |
| 11d | Once Story C is queued, a retry reaches it | slice 4 | |
| 11e | Choosing Pygardon or another story's Inspect during a pending retry wins, with no late focus or detail | slice 4 | |
| 12a | A reference to the 27th Done story, ten shown, grows the range to "Showing 27 of 35 entries" and keeps it | slice 5 | |
| 12b | That jump makes the page ask only for the shown records and the referenced suppliers | slice 5 | |
| 12c | While that record is held, the destination reads "Reading done story…" | slice 5 | |
| 12d | If the record read fails, the destination shows its identified gap and "Retry done stories" recovers it | slice 6 | |
| 13a | While the Done destination is pending, Inspect supersedes the jump: the record arrives and the keyboard stays where the developer moved it | slice 8 | |
| 13b | Same as 13a with "Show latest 10" | slice 8 | |
| 13c | Same as 13a with a pointer down | slice 8 | |
| 13d | Same as 13a with Tab away | slice 8 | |
| 14a | An expired or unlisted reference reads "unavailable" and triggers no further read | slice 7 | |
| 14b | A loading or failed Done catalog reads differently from absence | slice 7 | |
| 14c | An inspection chosen while the catalog is loading or failed stays when the catalog heals | slice 7 | |
