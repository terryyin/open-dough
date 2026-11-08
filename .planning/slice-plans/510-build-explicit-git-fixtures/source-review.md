# Source-only review

Fresh isolated Codex agent `/root/source_review` (no inherited turns) received
only the selected seed’s Goal, Scope, Key examples and Evaluation. It was
directed to use those inputs, read no project files, and return numbered
commitments without implementation or slice assignments. Its returned
commitments follow with coordinator allocations.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A maintainer can identify the facts that drive each migrated test from its call site. | slice 4 | |
| 2 | Driving facts include the repository’s stories. | slice 4 | |
| 3 | Driving facts include its published records. | slice 4 | |
| 4 | Driving facts include its ordered revisions. | slice 4 | |
| 5 | Driving facts include the commit facts the product reads. | slice 4 | |
| 6 | A test that declares no facts gets a minimal valid project repository. | slice 2 | |
| 7 | `makeMe.aRepository.please()` with no facts gives a description that materializes to a bare origin. | slice 2 | |
| 8 | The default origin has a `main` branch. | slice 2 | |
| 9 | Default `main` contains one commit. | slice 2 | |
| 10 | That commit contains an empty product backlog. | slice 2 | |
| 11 | The default backlog is valid and the backlog CLI reads it without error. | slice 2 | |
| 12 | Extend the shared MakeMe entry point with a repository description. | slice 1 | observed: tests/support/makeMe.mjs aRepository getter returns the shared RepositoryBuilder |
| 13 | The description holds trunk revisions in order. | slice 1 | observed: tests/support/repositoryTestData.mjs withRevision and please build ordered named plain facts without I/O |
| 14 | Each trunk revision has a name. | slice 1 | observed: tests/support/repositoryTestData.mjs withRevision and please build ordered named plain facts without I/O |
| 15 | Each revision states its published facts. | slice 1 | observed: tests/support/repositoryTestData.mjs withRevision and please build ordered named plain facts without I/O |
| 16 | Compose those facts from the canonical builders. | slice 1 | observed: dashboard/tests/launchJourney.ts storyColumnsRepository composes MakeMe agent profiles and done record with the canonical revision facts |
| 17 | Compose those facts using production encoders. | slice 1 | observed: tests/support/repository-fixture.mjs writeRevision and published-backlog.mjs renderPublishedBacklog encode queued and Taken membership using production renderBacklog and renderEntry |
| 18 | Published facts cover backlog entries. | slice 1 | observed: tests/support/repository-fixture.mjs writeRevision and published-backlog.mjs renderPublishedBacklog encode queued and Taken membership using production renderBacklog and renderEntry |
| 19 | Published facts cover backlog membership. | slice 1 | observed: tests/support/repository-fixture.mjs writeRevision and published-backlog.mjs renderPublishedBacklog encode queued and Taken membership using production renderBacklog and renderEntry |
| 20 | Published facts cover seeds. | slice 1 | observed: dashboard/tests/launchJourney.ts queuedDashboardRepository declares seed and state; repository-fixture.mjs writeStoryState uses recordStoryState and scratch queued trees match |
| 21 | Published facts cover story state. | slice 1 | observed: dashboard/tests/launchJourney.ts queuedDashboardRepository declares seed and state; repository-fixture.mjs writeStoryState uses recordStoryState and scratch queued trees match |
| 22 | Published facts cover agent profiles. | slice 1 | observed: dashboard/tests/launchJourney.ts preparing and taken agentProfiles use MakeMe and renderAgentProfile; scratch profile bytes match |
| 23 | Published facts cover done records. | slice 1 | observed: dashboard/tests/launchJourney.ts completed revision declares doneRecords; repository-fixture.mjs writes production record and catalog; scratch done files match |
| 24 | Published facts cover the done catalog. | slice 1 | observed: dashboard/tests/launchJourney.ts completed revision declares doneRecords; repository-fixture.mjs writes production record and catalog; scratch done files match |
| 25 | The description states the agent as commit author where the product reads that fact. | slice 1 | observed: proof.md slice 1 scratch comparison preserves authors and committers at named Git revisions; preparing and session-attribution specs observe credited committers |
| 26 | The description states the developer as committer where the product reads that fact. | slice 1 | observed: proof.md slice 1 scratch comparison preserves authors and committers at named Git revisions; preparing and session-attribution specs observe credited committers |
| 27 | `.please()` returns plain data. | slice 1 | observed: tests/support/repositoryTestData.mjs withRevision and please build ordered named plain facts without I/O |
| 28 | `.please()` touches no Git. | slice 1 | observed: tests/support/repositoryTestData.mjs withRevision and please build ordered named plain facts without I/O |
| 29 | Add one shared materializer in the test harness. | slice 1 | observed: tests/support/repository-fixture.mjs materializeRepository owns real Git, paths, named SHAs and teardown; proof.md scratch fixture inspection and teardown |
| 30 | The materializer creates a real bare origin from a description. | slice 1 | observed: tests/support/repository-fixture.mjs materializeRepository owns real Git, paths, named SHAs and teardown; proof.md scratch fixture inspection and teardown |
| 31 | It provides checkouts when the case needs them. | slice 1 | observed: tests/support/repository-fixture.mjs materializeRepository owns real Git, paths, named SHAs and teardown; proof.md scratch fixture inspection and teardown |
| 32 | It returns the commit corresponding to each named revision. | slice 1 | observed: tests/support/repository-fixture.mjs materializeRepository owns real Git, paths, named SHAs and teardown; proof.md scratch fixture inspection and teardown |
| 33 | It returns a cleanup. | slice 1 | observed: tests/support/repository-fixture.mjs materializeRepository owns real Git, paths, named SHAs and teardown; proof.md scratch fixture inspection and teardown |
| 34 | The harness owns Git operations under the test data architecture. | slice 1 | observed: tests/support/repository-fixture.mjs materializeRepository owns real Git, paths, named SHAs and teardown; proof.md scratch fixture inspection and teardown |
| 35 | The harness owns directories under the test data architecture. | slice 1 | observed: tests/support/repository-fixture.mjs materializeRepository owns real Git, paths, named SHAs and teardown; proof.md scratch fixture inspection and teardown |
| 36 | The harness owns teardown under the test data architecture. | slice 1 | observed: tests/support/repository-fixture.mjs materializeRepository owns real Git, paths, named SHAs and teardown; proof.md scratch fixture inspection and teardown |
| 37 | Migrate the queued-trunk family. | slice 4 | |
| 38 | Start with the attention spec’s story-columns history. | slice 1 | observed: dashboard/tests/launchJourney.ts publishStoryColumnsJourney and publishLaunchJourney use the shared real-Git materializer; attention consumes the named story columns |
| 39 | The family includes `createQueuedTrunk`. | slice 3 | |
| 40 | The family includes `createPreparationTrunk`. | slice 2 | |
| 41 | The family includes the startup sibling fixture. | slice 3 | |
| 42 | The family includes the admission sibling fixture. | slice 3 | |
| 43 | The family includes the one-shot sibling fixture. | slice 2 | |
| 44 | The family includes the supplier-dependency fixture. | slice 4 | |
| 45 | The family includes the dashboard `launchJourney`. | slice 1 | observed: dashboard/tests/launchJourney.ts publishStoryColumnsJourney and publishLaunchJourney use the shared real-Git materializer; attention consumes the named story columns |
| 46 | The family includes every non-native test that arranges a repository through those helpers. | slice 4 | |
| 47 | Each migrated helper delegates to the shared path or is removed when superseded. | slice 4 | |
| 48 | After migration, no non-native consumer in this family calls a superseded helper. | slice 4 | |
| 49 | After migration, no non-native consumer in this family retains its own `git init` for this setup. | slice 4 | |
| 50 | Move existing per-process reuse of an identical starting repository behind the materializer. | slice 1 | observed: tests/support/repository-fixture.mjs repositoryTemplate caches identical descriptions per process and materializeRepository copies a private origin; proof.md independent mutation check |
| 51 | Preserve that reuse so feedback does not slow before the reuse story. | slice 4 | |
| 52 | Fixture reuse and caching work beyond preserving the existing reuse belong to faster Git fixture construction. | slice 4 | |
| 53 | Native scenario fixtures retain their current setup. | slice 4 | |
| 54 | The native startup fixture keeps its call to `createQueuedTrunk`. | slice 4 | |
| 55 | Native scenario fixtures move with the shell release and native fixtures story. | slice 4 | |
| 56 | Only the four native scenario fixtures still call `createQueuedTrunk` or `createPreparationTrunk` pending that story. | slice 4 | |
| 57 | Other fixture hubs belong to their own sibling stories. | slice 4 | |
| 58 | Execution starts after the published agent profile pilot lands. | slice 1 | observed: published pilot 327b56af4 is an ancestor of the established Take 16d42d6ac; tests/support/makeMe.mjs exports anAgentProfile and the seed dependency records satisfaction |
| 59 | That pilot creates `tests/support/makeMe.mjs`. | slice 1 | observed: published pilot 327b56af4 is an ancestor of the established Take 16d42d6ac; tests/support/makeMe.mjs exports anAgentProfile and the seed dependency records satisfaction |
| 60 | That pilot creates `anAgentProfile`. | slice 1 | observed: published pilot 327b56af4 is an ancestor of the established Take 16d42d6ac; tests/support/makeMe.mjs exports anAgentProfile and the seed dependency records satisfaction |
| 61 | Arrange a transition directly when the test does not prove that transition. | slice 4 | |
| 62 | This replaces replaying `start` solely to arrange state. | slice 1 | observed: dashboard/tests/launchJourney.ts only materializes declared prepare, take and complete facts; no production command call in either publisher |
| 63 | This replaces replaying `take` solely to arrange state. | slice 1 | observed: dashboard/tests/launchJourney.ts only materializes declared prepare, take and complete facts; no production command call in either publisher |
| 64 | This replaces replaying `complete` solely to arrange state. | slice 1 | observed: dashboard/tests/launchJourney.ts only materializes declared prepare, take and complete facts; no production command call in either publisher |
| 65 | The command a test proves runs for real on the materialized repository. | slice 4 | |
| 66 | Push races remain Git operations in the test. | slice 3 | |
| 67 | Rejected publications remain Git operations in the test. | slice 3 | |
| 68 | Merges remain Git operations in the test. | slice 4 | |
| 69 | Ancestry walks remain Git operations in the test. | slice 4 | |
| 70 | Exact malformed input under proof stays literal at the call site. | slice 3 | |
| 71 | Exact legacy input under proof stays literal at the call site. | slice 3 | |
| 72 | The description carries that input verbatim as file bytes. | slice 3 | |
| 73 | The materializer writes those bytes verbatim. | slice 3 | |
| 74 | The spec declares Story A Ready. | slice 1 | observed: dashboard/tests/launchJourney.ts queuedDashboardRepository declares A/B Ready and unrefined C last; scratch queued files match |
| 75 | The spec declares Story B Ready. | slice 1 | observed: dashboard/tests/launchJourney.ts queuedDashboardRepository declares A/B Ready and unrefined C last; scratch queued files match |
| 76 | The spec declares Story C queued last. | slice 1 | observed: dashboard/tests/launchJourney.ts queuedDashboardRepository declares A/B Ready and unrefined C last; scratch queued files match |
| 77 | The spec declares Story C unrefined. | slice 1 | observed: dashboard/tests/launchJourney.ts queuedDashboardRepository declares A/B Ready and unrefined C last; scratch queued files match |
| 78 | The first named revision records Yui-chan announcing preparation of B. | slice 1 | observed: dashboard/tests/launchJourney.ts preparing revision and proof.md scratch delta of only .planning/agents/yui-chan.json |
| 79 | The first transition changes only the Yui-chan profile. | slice 1 | observed: dashboard/tests/launchJourney.ts preparing revision and proof.md scratch delta of only .planning/agents/yui-chan.json |
| 80 | The second named revision records Akiho-chan taking B. | slice 1 | observed: dashboard/tests/launchJourney.ts taken revision and proof.md scratch delta of the backlog and .planning/agents/akiho-chan.json |
| 81 | The second transition changes the backlog. | slice 1 | observed: dashboard/tests/launchJourney.ts taken revision and proof.md scratch delta of the backlog and .planning/agents/akiho-chan.json |
| 82 | The second transition changes the Akiho-chan profile. | slice 1 | observed: dashboard/tests/launchJourney.ts taken revision and proof.md scratch delta of the backlog and .planning/agents/akiho-chan.json |
| 83 | The third named revision records completion of C. | slice 1 | observed: dashboard/tests/launchJourney.ts completed revision and proof.md scratch delta of the backlog, SEED-C_c.json and .catalog.json |
| 84 | The third transition changes the backlog. | slice 1 | observed: dashboard/tests/launchJourney.ts completed revision and proof.md scratch delta of the backlog, SEED-C_c.json and .catalog.json |
| 85 | The third transition changes the done record. | slice 1 | observed: dashboard/tests/launchJourney.ts completed revision and proof.md scratch delta of the backlog, SEED-C_c.json and .catalog.json |
| 86 | The third transition changes the catalog. | slice 1 | observed: dashboard/tests/launchJourney.ts completed revision and proof.md scratch delta of the backlog, SEED-C_c.json and .catalog.json |
| 87 | Each agent commit is authored by its agent. | slice 1 | observed: proof.md slice 1 scratch comparison preserves authors and committers at named Git revisions; preparing and session-attribution specs observe credited committers |
| 88 | Each agent commit is committed by the developer the card credits. | slice 1 | observed: proof.md slice 1 scratch comparison preserves authors and committers at named Git revisions; preparing and session-attribution specs observe credited committers |
| 89 | Each materialized named revision preserves the published files produced by today’s replay. | slice 1 | observed: proof.md scratch comparison: every published file matches command replay at each named story-columns and launch revision |
| 90 | Each materialized named revision preserves the corresponding author. | slice 1 | observed: proof.md slice 1 scratch comparison preserves authors and committers at named Git revisions; preparing and session-attribution specs observe credited committers |
| 91 | Each materialized named revision preserves the corresponding committer. | slice 1 | observed: proof.md slice 1 scratch comparison preserves authors and committers at named Git revisions; preparing and session-attribution specs observe credited committers |
| 92 | No production command runs during the attention setup. | slice 1 | observed: dashboard/tests/launchJourney.ts only materializes declared prepare, take and complete facts; no production command call in either publisher |
| 93 | The attention spec keeps its assertions. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts unchanged membership and count assertions; both strict records pass twice before and after |
| 94 | The announce test declares a rival Yui-chan execution profile on trunk. | slice 2 | |
| 95 | The announce test runs the real `start`. | slice 2 | |
| 96 | `start` still announces the next free name. | slice 2 | |
| 97 | The trunk profile file contains `renderAgentProfile`’s bytes. | slice 2 | |
| 98 | The workspace-publication race test uses the builder for its starting trunk. | slice 3 | |
| 99 | The competing push stays in the race test. | slice 3 | |
| 100 | The race test still asserts the rejection. | slice 3 | |
| 101 | A malformed-backlog recovery case declares the exact malformed bytes as a file in the description. | slice 3 | |
| 102 | The materializer writes that malformed backlog verbatim. | slice 3 | |
| 103 | Migrated tests keep their verdicts. | slice 4 | |
| 104 | Migrated tests keep their assertions. | slice 4 | |
| 105 | Record the attention spec’s fixture time before and after under the same conditions. | slice 1 | observed: proof.md pre-change timing baseline and slice 1 accepted proof record matching fixture selection, clock, worker count and timings with host-load caveat |
| 106 | Record the attention spec’s focused run time before and after under the same conditions. | slice 1 | observed: proof.md pre-change timing baseline and slice 1 accepted proof record matching fixture selection, clock, worker count and timings with host-load caveat |
| 107 | Choose one migrated skill selection. | slice 2 | |
| 108 | Record that skill selection’s fixture time before and after under the same conditions. | slice 2 | |
| 109 | Record that skill selection’s focused run time before and after under the same conditions. | slice 2 | |
| 110 | The recorded timings form the baseline for the reuse story. | slice 4 | |
