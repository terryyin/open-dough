# Source review: SEED-202#bounded-dashboard-refresh

**Launch:** 2026-10-31, a fresh general-purpose reviewer with no conversation
inheritance, during slice 1 execution by pyo-chan (Claude Code). It read no
project files, ran no commands, and changed nothing.

**Input:** only the selected story's Beneficiary, Goal, Scope, Deferred
promises, Resource interpretation, and Key examples, verbatim from
[the story](../../seeds/SEED-202-bounded-dashboard-refresh.md#bounded-dashboard-refresh)
at `7ad60a6f`. No plan, return, product, or proof was supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| B1 | Beneficiary: developers viewing the same dashboard from several browsers or devices | slice 4 | |
| B2 | Beneficiary: every viewer of a machine whose launch and attempt documents have grown to several megabytes | slice 4 | |
| G1 | Every viewer's machine-session refresh is served from one bounded shared observation and reusable parsed machine documents | slice 4 | |
| G2 | The Running Cursor sessions list is served from one bounded shared observation and reusable parsed machine documents | slice 4 | |
| G3 | The notification observer is served from one bounded shared observation and reusable parsed machine documents | slice 4 | |
| G4.1 | The cost of expensive observation stops multiplying with viewer count and refresh frequency | slice 4 | |
| G4.2 | The cost of parsing stops multiplying with viewer count and refresh frequency | slice 4 | |
| G4.3 | Per-refresh answer bytes stop multiplying with viewer count and refresh frequency | slice 4 | |
| G5 | Session state stays as current as today | slice 4 | |
| G6 | Session state stays as correct as today | slice 4 | |
| 1.1 | The parsed, validated launch-record document is reused while its underlying file is unchanged | slice 1 | observed: dashboard/tests/boundary/machine-json-reuse.spec.ts "parses an unchanged document once…"; scratch probe on real 5.4 MB records: 0 parses on unchanged refreshes |
| 1.2 | The parsed, validated launch-attempt document is reused while its underlying file is unchanged | slice 1 | observed: scratch probe on real 5.2 MB attempts: 0 parses on unchanged refreshes, 1 after rename |
| 1.3 | File identity is re-checked on every read | slice 1 | observed: dashboard/server/machineJsonStore.ts readMachineJson stat identity (ino, mtimeNs, size) on every read |
| 1.4 | When another dashboard process replaces the file, the next read observes the replacement | slice 1 | observed: dashboard/tests/boundary/agent-launch-records-replaced.spec.ts "answers a launch another server recorded after this server already read the store" |
| 1.5 | A missing file still holds the empty document | slice 1 | observed: dashboard/tests/boundary/machine-json-reuse.spec.ts missing-file test (empty document, then the written file) |
| 1.6 | An unreadable replacement is still answered as unreadable | slice 1 | observed: dashboard/tests/boundary/agent-launch-records-replaced.spec.ts "answers no records once a store already read is replaced by an unreadable file…" |
| 1.7 | A schema-invalid replacement is still answered as unreadable | slice 1 | observed: machineJsonStore.ts parsedMachineJson schema failure holds nothing; launch-attempt-retention.spec.ts unreadable cases green |
| 1.8 | An unreadable or invalid replacement is never hidden behind an earlier parse | slice 1 | observed: dashboard/tests/boundary/agent-launch-records-replaced.spec.ts same-size same-mtime unreadable replacement answers []; mutation without ino check fails |
| 1.9 | Retention filtering still applies at read time | slice 1 | observed: launchRecordStore.ts / launchAttemptStore.ts filter at read time unchanged; launch-attempt-retention.spec.ts green |
| 1.10.1 | Writes keep their lock | slice 1 | observed: machineJsonStore.ts replaceMachineJson acquireWriteLock unchanged; agent-launch-records.spec.ts concurrent done marks test green |
| 1.10.2 | Writes keep their authoritative read | slice 1 | observed: dashboard/tests/boundary/machine-json-reuse.spec.ts write-path test (authoritative parse, stored not the held object) |
| 1.10.3 | Writes keep their atomic replacement | slice 1 | observed: machineJsonStore.ts temp-file rename unchanged; dashboard/tests/boundary 876 passed |
| 2.1 | Browser `/sessions` refreshes join one running observation | slice 2 | |
| 2.2 | The notification observer joins the same running observation | slice 2 | |
| 2.3 | A result that settled at most 1 second earlier serves later demand | slice 2 | |
| 2.4 | Running Cursor sessions reads join one running held-session read | slice 4 | |
| 2.5 | Running Cursor sessions reads get no settled reuse | slice 4 | |
| 2.6 | Running Cursor sessions reads keep the list's current live cadence | slice 4 | |
| 3.1 | A `/sessions` answer carries the revision of the observation it reports | slice 3 | |
| 3.2 | A viewer that sends the revision it already holds receives a small unchanged answer instead of the full records and attempts | slice 3 | |
| 3.3 | A viewer with no revision receives the full answer | slice 3 | |
| 3.4 | A viewer with an older revision receives the full answer | slice 3 | |
| 4.1.1 | At most one running observation exists for machine sessions | slice 2 | |
| 4.1.2 | At most one running observation exists for Cursor held sessions | slice 4 | |
| 4.2.1 | Retained shared data is one parsed copy per machine document | slice 1 | observed: machineJsonStore.ts heldDocuments Map, one entry per file path |
| 4.2.2 | Retained shared data also includes the latest observation per kind, and nothing more | slice 4 | |
| 4.3 | A waiter whose shared observation exceeds the existing read-wait bound receives an explicit retryable answer | slice 2 | |
| 4.4.1 | A departing viewer stops waiting | slice 2 | |
| 4.4.2 | A hidden viewer stops waiting | slice 2 | |
| 4.4.3 | When a viewer stops waiting, the shared observation is not cancelled for other viewers | slice 2 | |
| 4.4.4 | When a viewer stops waiting, the shared observation is not cancelled for the notification observer | slice 2 | |
| 4.5.1 | The next demand after a bound starts a fresh observation | slice 2 | |
| 4.5.2 | The next demand after a failure starts a fresh observation | slice 2 | |
| 5.1.1 | The shared observation depends only on machine-local evidence: the configured project catalog | slice 2 | |
| 5.1.2 | ... the machine documents | slice 2 | |
| 5.1.3 | ... the native host listings | slice 2 | |
| 5.2 | A project catalog change starts a new observation instead of reusing one from the earlier catalog | slice 2 | |
| R1 | For a fixed set of projects, sessions, and source data, extra viewers must not create separate retained observation datasets | slice 4 | |
| R2 | For the same fixed set, extra viewers must not create unlimited observation work | slice 4 | |
| R3 | Individual connections and full answers still cost memory; the story bounds the shared work behind them | slice 4 | |
| R4 | Repeated unchanged answers are made small | slice 3 | |
| R5 | Non-claim: byte-for-byte constant total process memory for arbitrarily many simultaneous connections | slice 4 | |
| X1 | Sharing GitHub-backed revision checks across viewers, deferred to the sibling story "Share GitHub revision checks across viewers" | slice 4 | |
| X2 | Story-specific session reads (`stateOf`, recorded lookups, launch verification) get no shared-observation promise | slice 4 | |
| X2a | Those story-specific reads may adopt the parsed-document reuse (optional, not promised) | slice 1 | observed: stateOf and recorded lookups read through readMachineJson, so they adopt the reuse |
| X3 | Terminal-stream flow control is a separate concern | slice 4 | |
| X4 | Browser-side retention is a separate concern | slice 4 | |
| X5 | Other dashboard memory sources are separate concerns | slice 4 | |
| E1.T | Eight viewers and the notification observer request machine sessions at the same moment against unchanged documents | slice 2 | |
| E1.R1 | Each receives the same records and attempts | slice 2 | |
| E1.R2 | The launch document is parsed at most once | slice 2 | |
| E1.R3 | The attempt document is parsed at most once | slice 2 | |
| E1.R4 | Native host listings run once, not once per viewer | slice 2 | |
| E2.T1 | Viewer A's refresh settles; viewer B asks 400 ms later | slice 2 | |
| E2.R1 | B receives A's observation without a new one | slice 2 | |
| E2.T2 | Viewer C asks 1.5 s after it settled | slice 2 | |
| E2.R2 | A fresh observation runs | slice 2 | |
| E3.T1 | A viewer holds revision *r*, and nothing changed by its next 15-second refresh | slice 3 | |
| E3.R1 | It receives an unchanged answer of a few hundred bytes instead of about 9 MB | slice 3 | |
| E3.T2 | A session's state changed | slice 3 | |
| E3.R2 | The observation's revision differs | slice 3 | |
| E3.R3 | It receives the full answer | slice 3 | |
| E4.T1 | A second dashboard process records a launch, atomically replacing the launch-record file | slice 1 | observed: dashboard/tests/boundary/agent-launch-records-replaced.spec.ts cross-server launch test setup |
| E4.R1 | This process's next read includes the new record, at most 1 second plus one observation later | slice 2 | |
| E4.T2 | A replacement is not valid JSON, or fails the schema | slice 1 | observed: dashboard/tests/boundary/agent-launch-records-replaced.spec.ts unreadable same-size replacement setup |
| E4.R2 | The read answers unreadable exactly as today, not the previously parsed document | slice 1 | observed: dashboard/tests/boundary/agent-launch-records-replaced.spec.ts unreadable replacement answers [] and file left in place, no .unreadable copy |
| E5.T | A native host listing stalls past the read-wait bound while three viewers wait and one closes its tab | slice 2 | |
| E5.R1 | The closed viewer's wait ends with no effect on the others | slice 2 | |
| E5.R2 | The remaining waiters get a retryable answer at the bound | slice 2 | |
| E5.R3 | No second observation starts while the first still runs | slice 2 | |
| E5.R4 | The next refresh after it settles succeeds | slice 2 | |
| E6.T | Running Cursor sessions is open in several browsers: three expanded lists poll at their live cadence | slice 4 | |
| E6.R1 | Overlapping asks share one runner read | slice 4 | |
| E6.R2 | Each read reuses the parsed launch-record document instead of parsing 5.4 MB again | slice 1 | observed: hosts/cursor/heldSessions.ts keptRecordsByProject → readStoredRecords → readMachineJson held parse |
| E7.T | Repeated refresh cycles at one, three, and eight concurrent viewers on this machine's documents | slice 4 | |
| E7.R1 | Peak heap is no higher than the one-viewer baseline plus answer serialization | slice 4 | |
| E7.R2 | Heap settles back to the baseline | slice 4 | |
| E7.R3 | Parse counts are independent of viewer count | slice 4 | |
| E7.R4 | Observation counts are independent of viewer count | slice 4 | |
