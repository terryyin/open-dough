# Source review

Fresh general-purpose reviewer, no inherited context, launched 2026-11-08 by the
coordinator before slice 1 delegation. Input: the seed section's Goal, Scope and
Key examples for SEED-261#map-launch-and-session-test-data, verbatim, with the
instruction to read no other files, change nothing, and return numbered
commitments. Rows below are the reviewer's return (key-example rows drop the
reviewer's parenthetical cross-reference only).

Reviewer qualifications: S1 covers only valid kept records; S1.2 and S1.3 lists
are examples, not closed lists; S4.1 permits a mismatch only when it is under
proof and stated at the call site; S6 keeps the existing clock source.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | Maintainers reviewing dashboard tests can see which kept launches a case starts from. | slice 4 | |
| G1.1 | Each kept launch's setup shows the story or instruction it was requested for. | slice 4 | |
| G1.2 | Each kept launch's setup shows its host session. | slice 4 | |
| G1.3 | Each kept launch's setup shows the workspace its start established. | slice 4 | |
| G1.4 | Each kept launch's setup shows when it was launched. | slice 4 | |
| G2 | Kept launches are expressed in the vocabulary of the persisted `LaunchRecord`. | slice 4 | |
| G3 | The same kept launch reads the same way in frontend, backend and integrated tests. | slice 4 | |
| G4 | A test cannot keep a launch the dashboard itself would never record. | slice 4 | |
| S1 | Every valid kept launch record in the machine launch store is built through `makeMe.aLaunchRecord`. | slice 4 | |
| S1.1 | `makeMe.aLaunchRecord` is extended with the variants its new consumers need. | slice 4 | |
| S1.2 | Conversion covers cases that keep records in the store across the three dashboard roots, including: | slice 3 | |
| S1.2.1 | launch history | slice 2 | |
| S1.2.2 | Recently done | slice 2 | |
| S1.2.3 | the sessions listing | slice 2 | |
| S1.2.4 | story cards and side panels | slice 3 | |
| S1.2.5 | review | slice 3 | |
| S1.2.6 | configuration | slice 3 | |
| S1.2.7 | runtime cases | slice 3 | |
| S1.3 | Suite-local record factories displaced by the builder are moved or deleted. Examples, not a closed list: `storyALaunchRecord`, `machineLaunchRecords`, `sharedLaunchRecord`, `sessionsReplay*`, `recentlyDone*`, `localTakenSessions`. | slice 3 | |
| S2 | The harness has one owner for keeping records in the machine launch store. | slice 1 | observed: dashboard/tests/support/launchStore.ts keepLaunchStoreText is the single store write; slice 1 run of 301 specs, 796 passed (tmp/slice1-1.log) |
| S2.1 | That owner writes the store's own document shape. | slice 1 | observed: launchStore.ts LaunchStoreDocument { [project]: (LaunchRecord\|CreationRecord)[] } written with JSON.stringify, no retention |
| S2.2 | It can write that shape for one project or for several. | slice 1 | observed: launchStore.ts keepLaunchStore(home, byProject) and keepMoreLaunchRecords; agent-launch-open-session writes two projects |
| S2.3 | The current separate store writers are routed through that owner. | slice 1 | observed: grep of agent-launches.json writes outside launchStore.ts under dashboard/{tests,backend-tests,frontend-tests}: only reads, lock/fault-hook paths and fake-cursor reads remain; 27 byte checks ALL SAME (tmp/bytes/compare.mts) |
| S2.4 | The store file and its location stay harness layers, not builder facts. | slice 1 | observed: launchStore.ts takes MachineHome (home or server) for location; builder unchanged |
| S3 | An incoming launch request stays distinct from the request a record keeps. | slice 3 | |
| S3.1 | Conversions in the style of `launchRequest as LaunchRecord["request"]` are removed from stored setup. | slice 3 | |
| S3.2 | A record states its request through the builder. | slice 3 | |
| S4 | In valid setup, a record's host and its session's host are the same. | slice 4 | |
| S4.1 | The launch-record session rules no longer wrap a Claude session in a Codex request, unless that contradiction is what the case proves. | slice 4 | |
| S5 | Exact store text, malformed records, legacy records and retention-boundary records stay explicit where they are the subject, for example `seedStore` text and the launch-record schema specs. | slice 4 | |
| S6 | Times that drive retention stay visible at the call site. | slice 2 | |
| S6.1 | Those times are still measured from the server's clock wherever they are today. | slice 2 | |
| S7 | Evaluate each converted family against its original cases: | slice 4 | |
| S7.1 | the facts that drive each outcome stay visible; | slice 4 | |
| S7.2 | assertions catch the same failure; | slice 4 | |
| S7.3 | the shared setup removes a translation or a second model. | slice 4 | |
| X1 | Launch request bodies sent to start a launch are test actions and stay as they are. Only a body reused as a kept record's request changes. | slice 3 | |
| X2 | These setup families belong to sibling stories, so this story leaves them alone: | slice 4 | |
| X2.1 | live observation (`LaunchWithState`, `SessionState`, machine answer) | slice 4 | |
| X2.2 | accepted attempts | slice 4 | |
| X2.3 | completion and landing setup | slice 4 | |
| X2.4 | Codex and Cursor continuation and terminal setup | slice 4 | |
| X2.5 | machine-local project configuration | slice 4 | |
| X3 | In a mixed case, the kept record is converted here and the other family's setup is left for its story. | slice 3 | |
| X4 | Product contracts do not change. | slice 4 | |
| X5 | UI behavior does not change. | slice 4 | |
| E1 | Key example 1: two projects each keep an execution launch of one story, and one is marked Done yesterday. When the sessions sidebar loads, Recently done lists only the Done one, under its project. | slice 2 | |
| E1.1 | In that test, both records are stated through `makeMe.aLaunchRecord`. | slice 2 | |
| E1.2 | In that test, both records are written through the one store owner. | slice 2 | |
| E1.3 | In that test, the expected rows are written independently of the builder. | slice 2 | |
| E2 | Key example 2: a dashboard server starts with a kept launch shared from the machine store. Its record is built as a recorded execution request with a Claude session, not as the incoming launch body cast to a record. | slice 3 | |
| E2.1 | The server's answer matches that record. | slice 3 | |
| E3 | Key example 3: the launch-record session rules accept a Claude session with its alias. The record wrapping it is a Claude record. | slice 4 | |
| E3.1 | A case that proves a mismatched host states that mismatch itself. | slice 4 | |
| E4 | Key example 4: the store holds text with an older record shape or an invalid entry. The test still writes those exact bytes. | slice 4 | |
| E4.1 | The dashboard's handling of those bytes is observed as before. | slice 4 | |
