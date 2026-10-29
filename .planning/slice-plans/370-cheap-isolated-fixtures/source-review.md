# Independent source review

Fresh reviewer `/root/fixture_source_contract`, fork_turns none, received only
this selected story's original Goal, Scope, Examples, Evaluation and Excluded
text. The launch required no file reads or edits and individual numbered source
clauses without plan, implementation or acceptance context. Its actual returned
commitments, qualifications, journey examples and exclusions are retained below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Make isolated dashboard fixtures cheaper. | slice 2 |  |
| C2 | Preserve existing coverage. | slice 2 |  |
| C3 | Preserve fixture isolation. | slice 2 |  |
| C4 | Measure the effect on CI time. | slice 2 |  |
| C5 | Target repeated preview-server bootstrap. | slice 2 |  |
| C6 | Target Git fixture preparation. | slice 1 | observed: startOriginPreparation.ts replaces repeated copying/indexing with packed immutable seeds and private native clones; final45-case wall41.26s to30.88s |
| C7 | Target installed-skill fixture preparation. | slice 1 | observed: single installedStartSkills manifest; complete initial tree parity and actual installed starts in final guards/ordinary consumers |
| C8 | Preserve every existing scenario. | slice 2 |  |
| C9 | Preserve every existing assertion. | slice 2 |  |
| C10 | Preserve each private HOME. | slice 1 | observed: start-origin-isolation.spec.ts independent HOME markers, peer snapshots and cleanup; no shared writable HOME |
| C11 | Preserve each writable Git origin. | slice 1 | observed: concurrent real starts/private pushes plus distinct writable origin pack/config/ref state and peer fsck |
| C12 | Preserve each writable worktree. | slice 1 | observed: private native clones/indexes, distinct physical packs, arbitrary edits and first project fsck after origin corruption |
| C13 | Preserve each HTTP server. | slice 2 |  |
| C14 | Preserve each browser context. | slice 2 |  |
| C15 | Preserve each fixture’s fake-service state. | slice 2 |  |
| C16 | Preserve every strict verdict. | slice 2 |  |
| C17 | Keep native-touch observations unchanged. | slice 2 |  |
| C18 | Keep every-control observations unchanged. | slice 2 |  |
| C19 | Profile fixture substeps before selecting experiments. | slice 1 | observed: real five-origin subprofile before selection, origin-profile-before.json; existing full CI reports separate fixture costs |
| C20 | Compare the same normal local test family before and after. | slice 1 | observed: local-comparison-final.json: same45 full names/verdicts, wall41.26s to30.88s; eager preparation included |
| C21 | Use identical workers for that local comparison. | slice 1 | observed: literal normal command uses unchanged default8workers on the same16CPU host |
| C22 | Use identical filters for that local comparison. | slice 1 | observed: identical five file filters in family-before and family-stable commands, retained in slice1-proof.md |
| C23 | Use identical relevant environment for that local comparison. | slice 1 | observed: both use env -u NO_COLOR, unchanged compile-cache disable policy, same dependency state; host load variance explicitly retained |
| C24 | Compare full hosted CI on a named baseline revision and a named candidate revision. | slice 2 |  |
| C25 | Include case equality in the hosted comparison. | slice 2 |  |
| C26 | Include verdict equality in the hosted comparison. | slice 2 |  |
| C27 | Include fixture costs in the hosted comparison. | slice 2 |  |
| C28 | Include queue time in the hosted comparison. | slice 2 |  |
| C29 | Include job time in the hosted comparison. | slice 2 |  |
| C30 | Include suite time in the hosted comparison. | slice 2 |  |
| C31 | Include uncertainty in the hosted comparison. | slice 2 |  |
| C32 | Report inconclusive experiments honestly. | slice 2 |  |
| C33 | Report rejected experiments honestly. | slice 2 |  |
| Q1 | Reused preparation must be immutable. | slice 2 |  |
| Q2 | Reuse preparation only when measurements justify it. | slice 2 |  |
| Q3 | Retain only supported gains. | slice 2 |  |
| J1 | Two concurrent tests can edit their own fixtures independently. | slice 1 | observed: final concurrent guard: real installed starts and private file edit/commit in Promise.all |
| J2 | Two concurrent tests can publish their own fixtures independently. | slice 1 | observed: final concurrent guard: independent Take and private branch publication, each origin reads its own content |
| J3 | Two concurrent tests can stop their own fixtures independently. | slice 2 |  |
| J4 | Two concurrent tests can clean up their own fixtures independently. | slice 1 | observed: first and second cleanup preserve active peers/later instances; prepared input snapshots remain unchanged |
| J5 | In that concurrent journey, neither test changes the other test’s files. | slice 1 | observed: peer complete file hashes unchanged after arbitrary HOME/worktree/config/pack edits and cleanup |
| J6 | In that concurrent journey, neither test changes the other test’s refs. | slice 1 | observed: peer refs unchanged after real private publications and cleanup; original initial ref layout preserved |
| J7 | In that concurrent journey, neither test changes the other test’s server. | slice 2 |  |
| J8 | In that concurrent journey, neither test changes the other test’s state. | slice 2 |  |
| J9 | In that concurrent journey, neither test changes the other test’s results. | slice 2 |  |
| J10 | Prepared source reflects the current working tree on each run. | slice 1 | observed: fresh preparations from changed working-tree source install new marker while earlier instance remains unchanged; default source root and initial trees match baseline |
| J11 | Successive runs never consume a stale cache. | slice 1 | observed: two distinct fresh preparation roots plus no-setup fresh source; no persistent cache survives invocation/run |
| J12 | Source skills remain installed through the real entry points. | slice 1 | observed: same real installed source layouts for Claude and sharedCodex/Cursor; initial tree parity |
| J13 | Source skills remain exercised through the real entry points. | slice 1 | observed: real takenByAnotherAgent and ordinary Claude/Codex/Cursor consumers; no command outcome stub introduced |
| J14 | Failures retain cleanup behavior. | slice 1 | observed: failure guard removes own missing-input/partial-clone machines and preparation; peer unchanged; globalSetup owns normal run cleanup |
| J15 | Failures retain unexpected-error behavior. | slice 1 | observed: missing-source ENOENT and real cloneGit128/badconfig errors retained rather than swallowed |
| X1 | Shared mutable Git origins. | slice 1 | observed: five distinct physical object packs, no hardlinks/alternates; arbitrary writable mutation does not affect seed or peers |
| X2 | Shared mutable servers. | slice 2 |  |
| X3 | Shared mutable HOME. | slice 2 |  |
| X4 | Shared mutable fake-service state. | slice 2 |  |
| X5 | Scenario removal. | slice 2 |  |
| X6 | Assertion removal. | slice 2 |  |
| X7 | Skips. | slice 2 |  |
| X8 | Retries. | slice 2 |  |
| X9 | Browser-clock changes. | slice 2 |  |
| X10 | Coarser native input. | slice 2 |  |
| X11 | Deployment-policy tier changes. | slice 2 |  |
| X12 | Additional CI shards. | slice 2 |  |
| X13 | Additional CI workers. | slice 2 |  |
| X14 | Product feature changes. | slice 2 |  |
| X15 | Release work. | slice 2 |  |
