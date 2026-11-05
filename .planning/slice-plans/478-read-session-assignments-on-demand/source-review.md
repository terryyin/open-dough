# Source review

Launch: fresh general-purpose reviewer (Task), source text only — Goal, Scope,
key examples, deferred exclusions, and “no new control or wording” from
`.planning/seeds/SEED-240-reliable-dashboard-updates-and-session-details.md#read-session-assignments-on-demand`.
No plan, return, product, proof, or current-slice scope supplied. Reviewer read
no other project files.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer opening the Board, the Sessions sidebar, or Recently done reads the overview without each collapsed Session entry asking for historical assignment credit it does not show. | slice 1 | observed: session-attribution.spec.ts: historicalAt(refiningAllocation) and historicalAt(unreadableRevision) empty after openUntilRead; SessionEntry used from Board, Sessions lists, RecentlyDone |
| 2 | When they open a Session entry’s Session details, they still get that session’s original allocation credit. | slice 1 | observed: session-attribution.spec.ts: open original → ContainText historical allocator credit |
| 3 | Request cost stays tied to what the developer asks to see. | slice 1 | observed: dashboard/GITHUB-REQUESTS.md on-demand Session details sentence; collapsed ask nothing |
| 4 | A Session entry asks for its historical assignment credit only while its Session details are open. | slice 1 | observed: SessionDetails.tsx: open && SessionAssignment; SessionEntry passes open={detailsOpen} |
| 5 | Opening Session details reads that session’s original allocation at its saved project, revision, agent, and work identity, as today. | slice 1 | observed: session-attribution.spec.ts: open original → historical at saved revision; SessionAssignment unchanged readers |
| 6 | Opening Session details shows that credit with the existing wording, including “Reading human developer…” while it is read. | slice 1 | observed: session-attribution.spec.ts: ContainText Reading human developer… under held route; then historical wording |
| 7 | Closing Session details while the read is under way abandons that page’s read; nothing it would have answered is shown later. | slice 1 | observed: session-attribution.spec.ts: hold first saved-revision request, close, release → .session-assignment count 0 |
| 8 | Reopening Session details asks again through the existing readers. | slice 1 | observed: session-attribution.spec.ts: reopen after abandon → ContainText historical; missing reopen asks unreadableRevision again |
| 9 | On reopen: a remembered answer costs no further GitHub read; a failed one is asked again. | slice 1 | observed: session-attribution.spec.ts fail-once route then reopen → historical; pinnedTexts.ts server memo unchanged for remembered GitHub |
| 10 | The Board’s own profile read at its revision, which story cards use, is unchanged. | slice 1 | observed: session-attribution.spec.ts: profileListingsAt(announced).length > 0 after overview |
| 11 | Local launch facts in Session details render whether or not credit is readable. | slice 1 | observed: session-attribution.spec.ts: missing/unreadable open shows Model requested; fail-once keeps Model: Fable |
| 12 | An unreadable or unrecorded history keeps today’s “Human developer unknown” line. | slice 1 | observed: session-attribution.spec.ts: missing and legacy ContainText unknown; fail-once → unknown |
| 13 | A line whose known original allocation the story card already shows is still omitted once that is known; until then it shows as reading. | slice 1 | observed: session-attribution.spec.ts: duplicate open → .session-assignment count 0; SessionAssignment still shows reading while reading |
| 14 | A retained Recently done session still asks the page’s history read when its details are opened. | slice 1 | observed: RecentlyDone.tsx renders SessionEntry; SessionDetails mounts SessionAssignment when open |
| 15 | For a retained Recently done session, credit is read once that full entry supplies the saved revision. | slice 1 | observed: SessionAssignment.tsx: revision from publishedSha; effect returns until revision/agent/source present |
| 16 | GitHub request accounting states that opening a Session details costs, at that session’s saved revision, what a first read of that revision’s profiles costs, unless the dashboard process already remembers it. | slice 1 | observed: dashboard/GITHUB-REQUESTS.md: Opening a Session details costs, at that session's saved revision… |
| 17 | No new control or wording. | slice 1 | observed: SessionEntry/SessionDetails: no new control or wording; existing Session details disclosure |
| 18 | Distinguishing an unreadable history from an unrecorded one in the details’ wording is deferred / not needed for this request-saving outcome. |  | G1 |
| 19 | Keeping an answer in the page across close and reopen is deferred / not needed for this request-saving outcome. |  | G2 |
| 20 | Recording credit in the local launch record is deferred / not needed for this request-saving outcome (and would place a published assignment fact in machine-local evidence, which ADR 0008 assigns to the repository). |  | G3 |
| 21 | Board with three collapsed Session entries at three different publication revisions: after the overview settles, the page has asked for no profile listing or profile addition at any of those three revisions; the Board’s own profile read at its revision still happened. | slice 1 | observed: session-attribution.spec.ts: three saved revisions refiningAllocation / none / ff…ff; historicalAt empty; Board profiles at announced |
| 22 | Developer opens one entry’s Session details: “Reading human developer…” shows, then that session’s original allocator, even though a later assignment in the current project reuses the same agent name; the other two entries still have asked nothing. | slice 1 | observed: session-attribution.spec.ts: open original → historical; afterOriginalOpen has saved revision only; reuse later shows historical not Later Allocator |
| 23 | Entry whose original allocation matches the story card’s current assignment is opened: assignment line shows as reading, then is omitted; the rest of its details stay. | slice 1 | observed: session-attribution.spec.ts: duplicate open → .session-assignment 0; other details (model, refinement, workspace, actions) visible |
| 24 | Developer opens an entry and closes it before the read answers: nothing is shown later from that read. | slice 1 | observed: session-attribution.spec.ts: hold, close, release → .session-assignment count 0 |
| 25 | Reopening after that abandoned read reads again; when the first read had reached GitHub, the second asks GitHub nothing more. | slice 1 | observed: session-attribution.spec.ts: reopen after abandon → historical; server pinned memo for remembered GitHub (unchanged) |
| 26 | History cannot be read: opened details show launch facts and “Human developer unknown”; closing and reopening asks again. | slice 1 | observed: session-attribution.spec.ts: missing open → unknown + model; close/reopen asks unreadableRevision again |
