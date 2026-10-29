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
| C6 | Target Git fixture preparation. | slice 1 |  |
| C7 | Target installed-skill fixture preparation. | slice 1 |  |
| C8 | Preserve every existing scenario. | slice 2 |  |
| C9 | Preserve every existing assertion. | slice 2 |  |
| C10 | Preserve each private HOME. | slice 1 |  |
| C11 | Preserve each writable Git origin. | slice 1 |  |
| C12 | Preserve each writable worktree. | slice 1 |  |
| C13 | Preserve each HTTP server. | slice 2 |  |
| C14 | Preserve each browser context. | slice 2 |  |
| C15 | Preserve each fixture’s fake-service state. | slice 2 |  |
| C16 | Preserve every strict verdict. | slice 2 |  |
| C17 | Keep native-touch observations unchanged. | slice 2 |  |
| C18 | Keep every-control observations unchanged. | slice 2 |  |
| C19 | Profile fixture substeps before selecting experiments. | slice 1 | observed: real five-origin subprofile before selection, origin-profile-before.json; existing full CI reports separate fixture costs |
| C20 | Compare the same normal local test family before and after. | slice 1 |  |
| C21 | Use identical workers for that local comparison. | slice 1 |  |
| C22 | Use identical filters for that local comparison. | slice 1 |  |
| C23 | Use identical relevant environment for that local comparison. | slice 1 |  |
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
| J1 | Two concurrent tests can edit their own fixtures independently. | slice 1 |  |
| J2 | Two concurrent tests can publish their own fixtures independently. | slice 1 |  |
| J3 | Two concurrent tests can stop their own fixtures independently. | slice 2 |  |
| J4 | Two concurrent tests can clean up their own fixtures independently. | slice 1 |  |
| J5 | In that concurrent journey, neither test changes the other test’s files. | slice 1 |  |
| J6 | In that concurrent journey, neither test changes the other test’s refs. | slice 1 |  |
| J7 | In that concurrent journey, neither test changes the other test’s server. | slice 2 |  |
| J8 | In that concurrent journey, neither test changes the other test’s state. | slice 2 |  |
| J9 | In that concurrent journey, neither test changes the other test’s results. | slice 2 |  |
| J10 | Prepared source reflects the current working tree on each run. | slice 1 |  |
| J11 | Successive runs never consume a stale cache. | slice 1 |  |
| J12 | Source skills remain installed through the real entry points. | slice 1 |  |
| J13 | Source skills remain exercised through the real entry points. | slice 1 |  |
| J14 | Failures retain cleanup behavior. | slice 1 |  |
| J15 | Failures retain unexpected-error behavior. | slice 1 |  |
| X1 | Shared mutable Git origins. | slice 1 |  |
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
