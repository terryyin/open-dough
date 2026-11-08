# Source review

A fresh general-purpose reviewer (no conversation inheritance) received only the
story section `SEED-262#declare-fake-github-planning-data` (Goal, Scope, Key
examples, Evaluation, Architecture; story-state block removed), was told to read
no other project files and change nothing, and returned the numbered
commitments below on 2026-11-08. Ids 31–36 are its exclusions and
qualifications that the story states as commitments. Scope's file list is a
dated snapshot, not a closed list.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A maintainer reading a dashboard journey that serves a project through the fake GitHub can see which planning facts that project publishes at each revision | slice 3 | |
| 2 | The served files come from the same repository description that Git fixtures use | slice 1 | observed: tests/support/repository-revision-files.test.mjs 'each revision a description renders without Git holds the same files and bytes as its materialized commit'; renderRevisionFiles in tests/support/repository-revision-files.mjs |
| 3 | The served files are rendered with the production encoders | slice 1 | observed: tests/support/repository-revision-files.test.mjs 'each revision a description renders without Git holds the same files and bytes as its materialized commit'; renderRevisionFiles in tests/support/repository-revision-files.mjs |
| 4 | Dashboard feedback must not get slower | slice 3 | |
| 5 | A `makeMe.aRepository` description renders to the published files of each named revision without Git, as the files the fake GitHub serves (`PublishedRevision`) | slice 1 | observed: tests/support/repository-revision-files.test.mjs 'each revision a description renders without Git holds the same files and bytes as its materialized commit'; renderRevisionFiles in tests/support/repository-revision-files.mjs |
| 6 | A later revision serves the earlier revisions' files with its own changes and removals applied, as Git would publish them | slice 1 | observed: tests/support/repository-revision-files.test.mjs 'each revision a description renders without Git holds the same files and bytes as its materialized commit'; renderRevisionFiles in tests/support/repository-revision-files.mjs |
| 7.1 | Rendering uses the Git materializer's encoder for backlog membership | slice 1 | observed: tests/support/repository-revision-files.test.mjs 'each revision a description renders without Git holds the same files and bytes as its materialized commit'; renderRevisionFiles in tests/support/repository-revision-files.mjs |
| 7.2 | Rendering uses the Git materializer's encoder for story states | slice 1 | observed: tests/support/repository-revision-files.test.mjs 'each revision a description renders without Git holds the same files and bytes as its materialized commit'; renderRevisionFiles in tests/support/repository-revision-files.mjs |
| 7.3 | Rendering uses the Git materializer's encoder for agent profiles | slice 1 | observed: tests/support/repository-revision-files.test.mjs 'each revision a description renders without Git holds the same files and bytes as its materialized commit'; renderRevisionFiles in tests/support/repository-revision-files.mjs |
| 7.4 | Rendering uses the Git materializer's encoder for done records | slice 1 | observed: tests/support/repository-revision-files.test.mjs 'each revision a description renders without Git holds the same files and bytes as its materialized commit'; renderRevisionFiles in tests/support/repository-revision-files.mjs |
| 7.5 | Rendering uses the Git materializer's encoder for the rebuilt done catalog | slice 1 | observed: tests/support/repository-revision-files.test.mjs 'each revision a description renders without Git holds the same files and bytes as its materialized commit'; renderRevisionFiles in tests/support/repository-revision-files.mjs |
| 8 | The Git materializer and this rendering share one file renderer | slice 1 | observed: tests/support/repository-revision-files.test.mjs 'each revision a description renders without Git holds the same files and bytes as its materialized commit'; renderRevisionFiles in tests/support/repository-revision-files.mjs |
| 9.1 | `refreshJourney.ts` declares its published planning files | slice 1 | observed: dashboard/tests/refreshJourney.ts declares A, B, C in one makeMe.aRepository description; refresh family 65 passed twice |
| 9.2 | `notificationStoryJourney.ts` declares its published planning files | slice 2 | observed: dashboard/tests/notificationStoryJourney.ts targetBacklog(column) and notificationOrigins are makeMe.aRepository descriptions; notification-story-navigation and session-alerts-navigation pass |
| 9.3 | `sessionNavigationJourney.ts` declares its published planning files | slice 2 | observed: dashboard/tests/sessionNavigationJourney.ts pushes pygardonBacklog declared in dashboard/tests/pygardonProject.ts; sessions sidebar navigation specs pass |
| 9.4 | `sourceNavigationJourney.ts` declares its published planning files | slice 2 | observed: dashboard/tests/sourceNavigationJourney.ts linkedBacklog is a description (direction, 2 taken, 9 queued), bytes identical |
| 9.5 | `doughnutProject.ts` declares its published planning files | slice 2 | observed: dashboard/tests/doughnutProject.ts describedRevision with declared backlog and seed file; doughnutJourney specs pass |
| 9.6 | `recentlyDoneRecords.ts` declares its published planning files | slice 3 | |
| 9.7 | `accessibleBoard.ts` declares its published planning files | slice 2 | observed: dashboard/tests/accessibleBoard.ts longBacklog and largeBacklog are descriptions; accessible-board, board-* specs pass with identical bytes |
| 9.8 | `takenAgentProfileRecords.ts` declares its published planning files | slice 3 | |
| 9.9 | `agentRosterRecords.ts` declares its published planning files | slice 3 | |
| 9.10 | `authenticatedAvatarRecords.ts` declares its published planning files | slice 3 | |
| 9.11 | The shared, resuming and turn read supports declare their published planning files | slice 3 | |
| 9.12 | Specs under `observation`, `sessions`, `stories`, `navigation`, `configuration` and `runtime` that build their own backlog text declare it | slice 3 | |
| 10 | Helpers that already call `renderPublishedBacklog` but hand-write seeds or records (e.g. `catalogProjectRecords.ts`) move to the same description | slice 3 | |
| 11 | A seed's prose that the dashboard reads stays a declared file in the revision | slice 3 | |
| 12 | That seed's story state comes from the declared facts | slice 3 | |
| 13 | Moving published files (`publishMovingFiles` with `moveTrunk` and `moveBranch`) take their revisions from named revisions of one description | slice 1 | observed: dashboard/tests/describedRevisions.ts returns PublishedRevision per name, typechecked against publishMovingFiles/moveTrunk/moveBranch; runtime moving-files use proved by slice 2/3 migrations |
| 14 | The fake GitHub's answers, observation and held or failing reads stay in the harness | slice 1 | observed: diff leaves publishedFiles.ts, publishedMovingOrigin.ts and publishOrigin answers unchanged; served-path logs before/after equal for 103 tests |
| 15 | Literal bytes stay at the call site where a spec proves them: malformed or truncated backlogs, legacy shapes, unreadable records, deliberately invalid input | slice 3 | |
| 16 | The surrounding valid files in such cases are built from the description | slice 3 | |
| 17 | Superseded literal templates (e.g. `emptyBacklog`) are removed once their last consumer declares its facts | slice 3 | |
| 18 | A helper doing both Git building and fake GitHub serving migrates its fake GitHub files here | slice 2 | observed: dashboard/tests/support/projectAddMachine.ts fake GitHub backlog is describedBacklog(makeMe.aRepository.please()); Git origin untouched |
| 19 | KE1: a journey with no stated planning facts gets an empty valid backlog; board shows no stories; `emptyBacklog` is gone | slice 1 | observed: emptyBacklog deleted from originAnswers.ts; accessible-board, frame-board-look, project-selection, published-work, direction-disclosure empty-board assertions pass with makeMe.aRepository.please() |
| 20 | KE2: refresh journey declares A and B; moving trunk A to B shows the same titles and order; unchanged seeds at B are served from A's files | slice 1 | observed: refreshJourney.ts revisions A/B; refresh family titlesOfA/titlesOfB assertions pass; cumulative files from A proved by the renderer equality test (B keeps A's seed, plan and done record) |
| 21 | KE3: served profile, records and catalog equal what `renderAgentProfile`, `renderDoneRecord` and the catalog encoder write; cards read as today | slice 3 | |
| 22 | KE4: read-failure spec still serves its malformed backlog tail literally at the call site, verdict unchanged | slice 1 | observed: dashboard/tests/observation/read-failure.spec.ts backlogWith literal tails; line 13/14 and 'lines 9 and 14' verdicts pass unchanged |
| 23 | KE4: a long-title layout case declares long titles, direction and identities as facts | slice 2 | observed: dashboard/tests/accessibleBoard.ts longBacklog declares the long title, longIdentity, longPath#longAnchor, longPlan and the direction with the unbroken word as facts |
| 24 | KE5: no dashboard helper or spec serving the fake GitHub writes `# Product backlog` text, except a call site whose spec proves those bytes | slice 3 | |
| 25 | Migrated specs keep their verdicts and assertions | slice 3 | |
| 26 | A reviewer can name each journey's served planning facts from its call site or fixture file | slice 3 | |
| 27.1 | Record focused run times before and after for one refresh or navigation family | slice 1 | observed: refresh family before 71 s (load 12.5) and 69 s (11.7); after 64 s (11.6) and 63 s (9.6) |
| 27.2 | Record focused run times before and after for one recently done or profile family | slice 3 | |
| 28 | Those run times must not regress beyond run-to-run noise | slice 3 | |
| 29 | The same description materializes as a Git origin or renders as served files through one renderer, so the same facts publish the same bytes | slice 1 | observed: tests/support/repository-revision-files.test.mjs 'each revision a description renders without Git holds the same files and bytes as its materialized commit'; renderRevisionFiles in tests/support/repository-revision-files.mjs |
| 30 | Rendering stays in memory; the done catalog uses the pure catalog encoder rather than a directory rebuild | slice 1 | observed: tests/support/repository-revision-files.test.mjs 'each revision a description renders without Git holds the same files and bytes as its materialized commit'; renderRevisionFiles in tests/support/repository-revision-files.mjs |
| 31 | Adds no new MakeMe concept beyond what a migrated case needs to state its driving facts | slice 3 | |
| 32 | Changes no dashboard product behavior | slice 3 | |
| 33 | Changes no fake GitHub answer shape | slice 3 | |
| 34 | Git reuse is out of scope | slice 3 | |
| 35 | Git-origin migration of helpers is out of scope | slice 3 | |
| 36 | No native evidence change; no paid run needed | slice 3 | |
