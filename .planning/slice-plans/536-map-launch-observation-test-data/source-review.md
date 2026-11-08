# Source review: SEED-261#map-launch-observation-test-data

Launch: a fresh general-purpose subagent (no conversation inheritance, fork or resume) received only the story's Goal, Scope, Key examples and Architecture text from `.planning/seeds/SEED-261-share-domain-test-data.md#map-launch-observation-test-data` (relative links reduced to names), with instructions to read no project files, change nothing, and return numbered commitments with compound items split. It received no plan, product, proof or slice scope. Returned 2026-11-08 during execution by bastiaan-chan; the table below keeps each returned id and text, with the coordinator's slice allocation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | Maintainers can read a dashboard test's starting facts in the product's vocabulary, including: | slice 4 | |
| G1.1 | the kept launch being observed | slice 1 | observed: dashboard/backend-tests/launches/launch-observations.spec.ts targets built by makeMe.aLaunchRecord; host stubs expect(records).toEqual([targets[n]]) |
| G1.2 | the host's report | slice 1 | observed: dashboard/backend-tests/launches/launch-observations.spec.ts test 1: codex stub reports makeMe.aSessionState.retained('review'); answer states equal [unknown, retained review] |
| G1.3 | the answer the page has read | slice 2 | |
| G1.4 | the machine's accepted attempts | slice 3 | |
| G2 | The same facts are recognizable across: | slice 4 | |
| G2.1 | backend rules | slice 1 | observed: done-question-rule, session-working-count-rule, session-unread-rule, session-alerts-helper specs arrange states via makeMe.aSessionState and keep their rule assertions |
| G2.2 | frontend substitutes | slice 4 | |
| G2.3 | integrated journeys | slice 3 | |
| G3 | The evidence for each outcome stays visible | slice 4 | |
| S1 | Arrange valid answers through the shared MakeMe entry point for: | slice 4 | |
| S1.1 | `SessionState` | slice 1 | observed: makeMe.aSessionState (tests/support/launchObservationTestData.mjs SessionStateBuilder) used in all five slice-1 specs |
| S1.2 | `LaunchWithState` | slice 1 | observed: makeMe.anObservedLaunch (ObservedLaunchBuilder) builds LaunchWithState in session-unread-rule retired and session-alerts-helper working |
| S1.3 | machine sessions answers | slice 4 | |
| S2 | Compose a live record with the kept record it observes | slice 1 | observed: ObservedLaunchBuilder.of(kept record from makeMe.aLaunchRecord).withSessionState(...); session-unread-rule sessionShown(retired) label Completed with attention |
| S3 | Keep these distinct: | slice 2 | |
| S3.1 | loaded availability | slice 1 | observed: session-working-count-rule loaded('working'\|'awaiting-instruction') workingCount 2 |
| S3.2 | retained availability | slice 1 | observed: dashboard/backend-tests/launches/launch-observations.spec.ts test 1 retained review expectation |
| S3.3 | activity such as working, waiting and review (the list is illustrative: "such as") | slice 1 | observed: done-question-rule cases separate working, waiting and review via says; working-count excludes awaiting-instruction |
| S3.4 | unknown observation | slice 1 | observed: dashboard/backend-tests/launches/launch-observations.spec.ts tests 1 and 2 { kind: 'unknown' }; working-count unknown(cursorHeldLabel.working) counts |
| S3.5 | confirmed unavailability | slice 2 | |
| S4 | A stale read, or a page holding its last answer, is expressed through the read that produced it | slice 2 | |
| S5 | Arrange accepted attempts through MakeMe | slice 3 | |
| S6 | Arrange attempt observations through MakeMe | slice 3 | |
| S7 | A kept attempt retains its incoming request and its acceptance facts | slice 3 | |
| S8 | A live attempt observation adds: | slice 3 | |
| S8.1 | the answering server's ownership | slice 3 | |
| S8.2 | activity | slice 3 | |
| S9 | An attempt can precede a launch record | slice 3 | |
| S10 | A launched outcome references: | slice 3 | |
| S10.1 | its host | slice 3 | |
| S10.2 | its native session ID | slice 3 | |
| S11 | Convert the scoped observation and attempt factories, either by deleting them or by making them delegate to MakeMe (both options allowed) | slice 4 | |
| S12 | Keep case-driving facts at the call site | slice 4 | |
| S13 | Preserve these where a case depends on their form: | slice 4 | |
| S13.1 | independent expectations | slice 4 | |
| S13.2 | the operations under proof | slice 4 | |
| S13.3 | explicit native protocol inputs | slice 2 | |
| S13.4 | exact wire omissions | slice 4 | |
| S13.5 | legacy data | slice 3 | |
| S13.6 | injected faults | slice 3 | |
| S14 | Mixed cases convert the observation or attempt facts they arrange here | slice 4 | |
| S15 | Product behavior is preserved | slice 4 | |
| S16 | Contracts are preserved | slice 4 | |
| E1 | Two kept records share a native ID across different hosts. One host's read fails and the other reports a retained session ready for review. | slice 1 | observed: dashboard/backend-tests/launches/launch-observations.spec.ts test 1: claude and codex targets share sessionId same-native-id; claude host throws, codex reports retained review |
| E1.1 | The answer still carries both records | slice 1 | observed: dashboard/backend-tests/launches/launch-observations.spec.ts test 1 expect(answer sessions).toEqual(targets sessions) |
| E1.2 | The records keep their respective states: unknown for one, retained-review for the other | slice 1 | observed: dashboard/backend-tests/launches/launch-observations.spec.ts test 1 states toEqual [{kind:'unknown'}, {available, retained, review}]; withStates fallback mutation to unavailable fails it |
| E2 | A card has shown a session ready for review, and a later machine read is refused with a retryable 503 | slice 2 | |
| E2.1 | The page keeps that entry and its last shown state | slice 2 | |
| E2.2 | Contrast case: a successful read that reports confirmed unavailability can instead show "Session unavailable" | slice 2 | |
| E3 | A story has an accepted attempt that the answering server owns and that is still running, with no launched outcome or kept session. The page reads that machine answer. | slice 4 | |
| E3.1 | The card shows startup in progress | slice 4 | |
| E3.2 | The card disables its Start actions | slice 4 | |
| E3.3 | When a launch does settle, the attempt identifies the session by host and ID | slice 3 | |
| E4 | A read receives one of these (alternatives): | slice 3 | |
| E4.1 | an unfamiliar native status | slice 2 | |
| E4.2 | a missing protocol field | slice 2 | |
| E4.3 | corrupt attempt-store text | slice 3 | |
| E4.4 | The case supplies that exact evidence | slice 3 | |
| E4.5 | The case observes the same unknown or unreadable result after conversion | slice 3 | |
| A1 | Compose the existing product shapes at the boundary the test arranges | slice 4 | |
| A2 | The stored record and the host-qualified session identity come from `LaunchRecord` | slice 1 | observed: dashboard/backend-tests/launches/launch-observations.spec.ts targets from makeMe.aLaunchRecord (LaunchRecord, host-qualified session); join keyed by host and sessionId |
| A3 | `LaunchWithState` joins transient session evidence to that record | slice 1 | observed: dashboard/backend-tests/launches/launch-observations.spec.ts withStates joins host reports to kept targets; ObservedLaunchBuilder composes LaunchWithState from LaunchRecord |
| A4 | `MachineAnswer` carries the facts the dashboard reads at its own boundary | slice 4 | |
| A5 | `AttemptObservation` carries the facts the dashboard reads at its own boundary | slice 3 | |
| A6 | Follows ADR 0002 §5: use a clear domain model and map directly to it throughout the solution | slice 4 | |
| A7 | Follows ADR 0008: project dashboard domain and architecture (durable project state and local operational state) | slice 4 | |
| A8 | Keep real host observation in the tests that prove that operation | slice 2 | |
| A9 | Keep attempt acceptance in the tests that prove that operation | slice 3 | |
| A10 | Rationale: a fixture that supplies both an input and its expected interpretation would hide the very regressions those tests catch | slice 4 | |
| X1 | Kept record persistence and its writer belong to the kept record story (exclusion) | slice 4 | |
| X2 | Completion and landing keep their own setup conversions (exclusion) | slice 4 | |
| X3 | Host continuation and terminal setup keep their own setup conversions (exclusion) | slice 4 | |
| X4 | Machine-local project configuration keeps its own setup conversions (exclusion) | slice 4 | |
