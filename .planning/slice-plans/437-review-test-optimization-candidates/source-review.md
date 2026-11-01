# Source review: SEED-192#review-test-optimization-candidates

Launch: fresh general-purpose reviewer (no conversation inheritance); inputs
were only the story Goal, Selected direction, Scope, Scope limits, Required
restrictions, Key examples, promise-bearing UX/UI, and promise-bearing
Architecture clauses from
`.planning/seeds/SEED-192-review-product-intent.md#review-test-optimization-candidates`.
No plan, implementation return, product, or proof was supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | For the selected project, Intent offers its Test Optimization Candidates record. | slice 2 | observed: IntentCandidatesRecord + intent-test-optimization-candidates.spec.ts candidates control and record view |
| 2 | The record is read from `.planning/TEST-OPTIMIZATION-CANDIDATES.md`. | slice 2 | observed: dashboard/src/testOptimizationCandidatesPath.ts fixed path; intentCandidatesRead.ts; boundary authenticated-read-intent-candidates.spec.ts |
| 3 | The record is read at the same published revision Intent names for its locations. | slice 2 | observed: readIntentCandidatesAt at work.revision; expectCandidatesRevision in journey |
| 4 | The view names that revision. | slice 2 | observed: expectCandidatesRevision; IntentCandidatesRecord names revision |
| 5 | Every pending candidate appears. | slice 2 | observed: intent-test-optimization-candidates.spec.ts Pending region count 1 launch-records-poll-waits |
| 6 | Every accepted necessary cost appears. | slice 2 | observed: Accepted region count 3 accepted slugs |
| 7 | Entries appear in the record's order. | slice 2 | observed: accepted heading order story-review…, agent-launch-poles, long-integrated-journeys |
| 8 | Pending entries appear under their own labelled group. | slice 2 | observed: region Pending candidates |
| 9 | Accepted entries appear under their own labelled group. | slice 2 | observed: region Accepted necessary costs |
| 10 | Each entry shows its slug. | slice 2 | observed: article headings by slug |
| 11.1 | Each entry shows its recorded field: locations | slice 2 | observed: poles term Locations / scope + definition path text |
| 11.2 | Each entry shows its recorded field: observed cost with its measurement conditions | slice 2 | observed: poles term Observed cost |
| 11.3 | Each entry shows its recorded field: unique protection | slice 2 | observed: poles term Unique protection |
| 11.4 | Each entry shows its recorded field: alternatives attempted | slice 2 | observed: poles term Alternatives attempted |
| 11.5 | Each entry shows its recorded field: disposition and rationale | slice 2 | observed: poles Disposition / rationale accepted necessary cost |
| 11.6 | Each entry shows its recorded field: date | slice 2 | observed: poles Date 2026-10-30 |
| 11.7 | Each entry shows its recorded field: any human decision needed | slice 2 | observed: launch-records-poll-waits Human decision needed field in journey |
| 11.8 | Each entry shows its recorded field: evidence | slice 2 | observed: poles Evidence / follow-up; evidence Markdown link |
| 12 | Entries appear regardless of duration. | slice 2 | observed: entries shown without duration filter (fixture includes varied costs) |
| 13 | Entries appear regardless of measurement. | slice 2 | observed: entries shown without measurement filter |
| 14 | Entries appear regardless of runtime report. | slice 2 | observed: entries shown without runtime-report filter |
| 15 | Accepted costs keep their rationale. | slice 2 | observed: poles disposition keeps accepted necessary cost rationale |
| 16 | Accepted costs are never shown as skipped or excluded. | slice 2 | observed: poles disposition not.toContainText skipped/excluded-as-a-cost |
| 17.1 | Other recorded section Profile-only exclusions may appear under its own heading using the same rule | slice 2 | observed: region Profile-only exclusions None. |
| 17.2 | Other recorded section Transferred obligations may appear under its own heading using the same rule | slice 2 | observed: region Transferred obligations None. |
| 17.3 | Other recorded section Latest pass may appear under its own heading using the same rule | slice 2 | observed: region Latest pass fixture pass text |
| 18 | Only pending and accepted are promised and verified. | slice 2 | observed: journey verifies pending/accepted; other sections shown not as acceptance promise |
| 19 | Profile-only exclusions must never be presented as accepted costs. | slice 2 | observed: Profile-only exclusions under own heading None.; not mixed into Accepted |
| 20.1 | In Locations, a full repository path that matches exactly one configured Intent-location file opens that file in Purpose | slice 3 | observed: intent-test-optimization-candidates-open.spec.ts Ex1 opens full path polesSecond into Purpose |
| 20.2 | In Locations, a Markdown link resolved relative to the record that matches exactly one configured Intent-location file opens that file in Purpose | slice 3 | observed: unit Markdown link relative to .planning/; evidence Intent open in open.spec.ts |
| 20.3 | In Locations, a bare filename that matches exactly one configured Intent-location file opens that file in Purpose | slice 3 | observed: open.spec.ts Doughnut bare cli_notebook_lfs.feature opens unique feature |
| 21 | An opened file becomes the same selection the location tree shows. | slice 3 | observed: Ex1 tree button aria-pressed true for opened path |
| 22 | A family that names several files links each one. | slice 3 | observed: Ex2 four file buttons remain after opening one |
| 23.1 | Unambiguous case by line (`path:line`) positions Purpose at that case | slice 4 | observed: intent-test-optimization-candidates-case.spec.ts path:line journey |
| 23.2 | Unambiguous case by unique `path::name` positions Purpose at that case | slice 4 | observed: case.spec.ts Pygardon configured ::name at line |
| 23.3 | Unambiguous named Gherkin scenario positions Purpose at that case | slice 4 | observed: case.spec.ts Gherkin scenario named exactly once |
| 24 | Otherwise the file opens at its start, with the recorded case text kept beside the link. | slice 4 | observed: case.spec.ts duplicate case name opens at file start; case text beside link |
| 25 | After reading a test, the developer returns to the record view at the entry they came from. | slice 3 | observed: Ex1 candidates control returns to agent-launch-poles article |
| 26 | The record remains shown on return. | slice 3 | observed: Ex1 candidates control aria-pressed true after return |
| 27 | Opening a test neither rereads the record. | slice 3 | observed: Ex1 data-candidates-reads unchanged on return |
| 28 | Opening a test neither resets the record. | slice 3 | observed: Ex1 data-candidates-reads unchanged on return |
| 29 | A reference to a test file that cannot be opened stays as recorded text with its specific reason. | slice 3 | observed: Ex3/Ex6/outside keep recorded text with reasons |
| 30.1 | Gap reason: not published at this revision (missing or moved) | slice 3 | observed: Ex6 not published at this revision |
| 30.2 | Gap reason: outside the project's configured Intent locations | slice 3 | observed: Pygardon outside configured Intent locations |
| 30.3 | Gap reason: names several files (each listed by full path, none opened on its own) | slice 3 | observed: Ex3 names several files with two full-path choices |
| 31 | Prose without a file reference stays plain text and claims no gap. | slice 3 | observed: Doughnut prose no gap warnings |
| 32 | Evidence and other recorded text keep their wording. | slice 2 | observed: RecordedMarkdownText keeps wording; sha:path text retained |
| 33.1 | Recorded Markdown link to a configured test file opens in Intent | slice 3 | observed: Evidence Markdown link second-server journey opens in Intent |
| 33.2 | Any other recorded Markdown link opens the published snapshot at the read revision | slice 2 | observed: evidence link href pinned blob at revision |
| 34 | Text such as `40e1d2f9:path` stays as recorded. | slice 2 | observed: 40e1d2f9:.planning/... stays as recorded text |
| 35 | An absent record has its own explanation. | slice 2 | observed: Ex7 absent Doughnut explanation |
| 36 | An unreadable read has its own explanation and retry. | slice 2 | observed: Ex7 unreadable with Retry button |
| 37 | A mismatched file has its own explanation. | slice 2 | observed: Ex7 mismatched Pygardon explanation |
| 38 | A readable record whose pending and accepted groups are both `None.` has its own explanation. | slice 2 | observed: Ex7 empty both-None. explanation |
| 39 | A mismatched record shows no partial guess. | slice 2 | observed: mismatched not.toContainText partial body |
| 40 | These record states do not disturb browsing the Intent locations. | slice 2 | observed: Ex7 each state still opens location tree files |
| 41 | Automated dashboard proof uses fixtures shaped like the real records. | slice 5 | observed: slices 2–4 fixtures (backticked, bare, ambiguous, linked, unconfigured, absent) in intentCandidates* and journeys |
| 42 | Story completion needs Terry's evaluation on the real Open Dough record. | slice 5 | observed: production Intent at 469cdf7; entries link; ambiguous story-review keeps several-files; authorized agent judgment matches editor-usable review |
| 43 | Story completion needs a recorded look at Doughnut and Pygardon at their current revisions. | slice 5 | observed: Doughnut f700975 mismatched record explanation; Pygardon 6307fef many python links plus outside/not-published/prose gaps |
| 44 | Apply the repository's failing and flaky test policy. | slice 5 | observed: failing/flaky policy applied through CI repair of story-reference race and suite isolation fixes during delivery |
| 45 | Never open a guessed file. | slice 3 | observed: matcher never guesses; Ex3 opens none alone |
| 46 | Ambiguous or unmatched references never select a test on their own. | slice 3 | observed: Ex3 neither opens without developer choice |
| 47 | Read the record and the location files at the same named revision. | slice 2 | observed: same revision for locations and candidates read; boundary pinned-only |
| 48 | Keep the record's own vocabulary and groups. | slice 2 | observed: Pending/Accepted vocabulary and labelled groups |
| 49 | Acceptance filters nothing, as the record format requires. | slice 2 | observed: accepted entries keep rationale; no skip/exclusion presentation |
| 50 | Show the record's entries as a list inside Intent. | slice 2 | observed: record view lists entries as articles under groups |
| 51 | Read them at the same published revision as the Intent locations. | slice 2 | observed: expectCandidatesRevision matches Intent locations revision |
| 52 | Recognize each location reference the Locations field records. | slice 3 | observed: segmentLocationReferences + matcher over Locations text |
| 53 | Match each such reference against the files of the project's configured Intent locations at that revision. | slice 3 | observed: matchRecordedLocationReference vs IntentLocation.files inventory |
| 54 | A match selects the file in the same Intent selection the location tree uses. | slice 3 | observed: Ex1 setSelection via shared owner; tree marks path |
| 55 | Every other reference stays visible as recorded text, with an explanation where it names a test file that cannot be opened. | slice 3 | observed: gap reasons beside recorded text for unopenable refs |
| 56 | A developer first sees the record's groups and entries, then decides which test to read. | slice 2 | observed: default candidates view then tree select decides test to read |
| 57.1 | Feedback and recovery include the specific gap reasons | slice 3 | observed: several/outside/not-published reason strings in journeys |
| 57.2 | Feedback and recovery include retry for a failed read | slice 2 | observed: Ex7 unreadable Retry button |
| 57.3 | Feedback and recovery include returning to the entry | slice 3 | observed: Ex1 return to entry via candidates control |
| 58 | The record and the source reader share one Intent selection. | slice 3 | observed: record open drives same IntentWorkspaceSelection as tree |
| 59 | The entry the developer came from survives reading a test. | slice 3 | observed: Ex1 originating entry visible after return |
| 60 | Ambiguous names make the developer choose. | slice 3 | observed: Ex3 developer chooses among listed full paths |
| 61 | Layout, placement, and control treatment are planning and design details. |  | G-D61 |
| 62 | Both stay keyboard-operable. | slice 2 | observed: candidates control focus + Enter returns to record |
| 63 | Both stay usable at narrow width, like the existing Intent browser. | slice 2 | observed: viewport 420px record and control visible |
| 64 | This adds a second published record in Intent. | slice 2 | observed: Intent offers Test Optimization Candidates as second published record |
| 65 | This adds a second way to select source in Intent. | slice 3 | observed: Locations buttons second way to select source |
| 66 | Shared Intent selection: the selected file, and the case when one is identified, moves from IntentBrowser's local state to one owner for the project's Intent workspace. | slice 1 | observed: dashboard/src/intentWorkspaceSelection.ts IntentSelection path+optional caseTarget; IntentPerspective.tsx keyed IntentWorkspaceSelectionProvider; IntentBrowser.tsx uses useIntentWorkspaceSelection (no local path state); Intent journeys 12 passed |
| 67 | The location tree and the record view both use that shared selection. | slice 3 | observed: tree and record view share intentWorkspaceSelection |
| E1 | Journey: Open Dough groups/fields; open path from entry; return to entry | slice 3 | observed: open.spec.ts Ex1 open and return |
| E2 | Journey: multi-file family each linked; others remain after opening one | slice 3 | observed: open.spec.ts Ex2 multi-file family |
| E3 | Journey: ambiguous bare name lists two full paths; neither opens alone | slice 3 | observed: open.spec.ts Ex3 ambiguous bare name |
| E4 | Journey: outside configured explanation; after configure, opens at `::name` case | slice 4 | observed: case.spec.ts configured ::name variant; outside remains in open.spec.ts |
| E5 | Journey: prose without gap; bare unique `.feature` opens | slice 3 | observed: open.spec.ts Doughnut prose + bare unique |
| E6 | Journey: not published at this revision; opens nothing | slice 3 | observed: open.spec.ts Ex6 not published |
| E7 | Journey: absent record explanation; both-`None.` explanation; browsing unchanged | slice 2 | observed: intent-test-optimization-candidates-states.spec.ts Ex7 absent/empty/mismatched/unreadable |
| D1 | Deferred: structured location syntax in the candidate-record format |  | G-D1 |
| D2 | Deferred: any change to the dough-test-optimization skill |  | G-D2 |
| D3 | Deferred: badges or marks for candidates in the location tree |  | G-D3 |
| D4 | Deferred: runtime Proof, profiling, or automated assessment |  | G-D4 |
| D5 | Deferred: editing, moving, or deciding entries |  | G-D5 |
| D6 | Deferred: changing any project's Intent location configuration |  | G-D6 |
| D7 | Deferred: story-scoped filtering of entries |  | G-D7 |
