# Source review — SEED-324#pass-landed-ci-repeat-checks-under-high-load

Launch: a fresh general-purpose reviewer without conversation inheritance, 2026-11-12, after Terry's amendment of the story (`aeb5681b7`), before slice 6's delegation. It replaces the review taken at execution start (`095f2bff9`), whose finer rows and observations for the unchanged text are carried into the rows below.
Input: one file holding the story's Goal, Scope (with required restrictions and scope limits) and Key examples from
[the seed](../../seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#pass-landed-ci-repeat-checks-under-high-load), verbatim after the amendment, plus the four spec paths that "the checks named above" names. No plan, product, proof or slice scope.
Instruction: read only that file, change nothing; return numbered individual commitments.
Key examples 1 and 8 were amended again by Terry on 2026-11-12 (after slice 6); a second fresh reviewer read the amended text and returned their rows E1.1–E1.8 and E8.1–E8.7, which replace the earlier ones. The sentences reporting the former figures are history, not commitments.

Explicit exclusions returned: no product behavior changes; no timeout override, `test.slow()`, sleep, retry, skip or runner mode; SEED-287 landed and trunk holds its work; SEED-319 owns the reconciliation, follow-up reading and receipt boundary observations; the cost of one fake `gh` call stays; the node suite's follow-up tests stay; runs outside the profile are recorded and not counted.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | Maintainers get a passing verdict from the landed CI repeat and follow-up checks named above while other work holds the machine at a one-minute load of 30–50 | slice 10 |  |
| G2 | with the default 30 s case timeout | slice 10 |  |
| G3 | the default 5 s expectations | slice 10 |  |
| G4 | and wide margin | slice 10 |  |
| G5 | Each check gets there by doing much less | slice 10 |  |
| G6 | one case keeps the real receipt-to-request journey | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…" is the only case calling scenario.ingest in the two backend specs |
| G7 | every other case starts from the state that journey leaves on a machine | slice 5 | observed: grep: one scenario.ingest across the seven selection specs, in landed-ci-automatic-repeat.spec.ts; every other case keeps a landing or saved requests |
| S1.1 | Load profile: A one-minute load average of 30–50 before and after a run | slice 10 |  |
| S1.2 | Load profile: on two workers | slice 10 |  |
| S1.3 | Load profile (qualification): This is the range in which these checks failed, and this preparation's reading of "moderately high CPU usage"; Terry named no figure. | slice 10 |  |
| S2.1 | Across the four named specs, at most one case takes a real receipt through ingestion, collection and admission to the provider's rerun request. Five do today. | slice 10 |  |
| S2.2 | a Done receipt at exactly 105 s against five 100 s prior builds leads to exactly one rerun request for run 71 | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…": "one rerun request" and "rerun requests" [71]; F1 fails it by the bound |
| S2.3 | the intent is saved before the request is sent | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…": "intent saved before the request is sent"; F14 fails it |
| S2.4 | the accepted request is saved after the reply | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…": "accepted saved after the reply"; F8b fails it |
| S2.5 | the request the product wrote is read as a card | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…": "accepted request's card" read from the request the product wrote; F15 fails it |
| S3.1 | The other cases arrange what a machine already keeps (its follow-up ledger, landed CI history and launch records, and where a card is read the story's real published completion) | slice 5 | observed: ciFollowUpKeptLanding.ts keepRepeatLanding at its three stages and saveRepeatRequests arrange ledger, history and launch records for every non-journey case |
| S3.2 | then run real collection and reading in a real server | slice 5 | observed: the backend cases start a collecting server (startServer) and the Intent cases a preview reader (ciFollowUpSettledReading.ts); no product seam |
| S3.3 | the provider's refused and uncertain replies, from an unspent eligible receipt the machine keeps, through the real rerun request | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request the provider refuses…": stage eligible receipt, replyToRerun(403), "saved reply" refused, "refused card" originalMs 120000 averageMs 100000, "rerun requests" [71] |
| S3.4 | what a later collection pass and a restart do with an accepted request (in progress, slow, the original kept in history, no second request), from a saved accepted request as the saved-request cases already do | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts "a kept accepted request asks for no rerun…": every expectation S8.1–S8.7 names |
| S3.5 | the machine setting and the red Done warning with its totals on a phone, from a saved request for a published completion | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts: the settings case and the phone warning case, no scenario.ingest |
| S3.6 | the Intent reading of both attempts and their frozen reference, from a settled request and kept history in a server that collects nothing | slice 5 | observed: dashboard/tests/intent/intent-ci-follow-up.spec.ts (reading): per-attempt revision, workflow, start, wall time, difference and completeness |
| S3.7 | divided so that no single case carries the first render, the proof navigation, the reload, the revisit and the Development selection together | slice 5 | observed: three cases in three files: reading (first render), proof (proof navigation), return (reload, revisit, Development selection) |
| S4.1 | Every promise the seven current cases protect keeps an owner among maintained checks. | slice 5 | observed: PLAN.md Slice 5 record, base-assertion walk, and coverage map C1–C22: every promise has an owner |
| S4.2 | The plan holds a coverage map of those promises | slice 1 | observed: PLAN.md "Coverage map": 22 rows C1–C22, unchanged by slice 1 |
| S4.3 | and one deliberate product fault per promise | slice 1 | observed: PLAN.md "Verification" fault table F1–F24; every coverage row names its fault |
| S4.4 | An observation leaves a journey only after its fault fails the check that takes it over. | slice 5 | observed: PLAN.md Slice 2–5 records: each coverage-map fault failed its owner at a labelled expectation before the journey's observation left (F1 by the bound, a recorded decision) |
| S4.5 | SEED-314's faults F1–F11 keep an owner. | slice 10 |  |
| S5.1 | Kept state is arranged through shared MakeMe builders typed by the product's own ledger, history and record types | slice 5 | observed: ciFollowUpKeptLanding.ts, ciFollowUpKeptPriors.ts, ciFollowUpRepeatStage.ts, ciFollowUpSavedRequests.ts: makeMe builders only |
| S5.2 | and provider facts through the existing fake GitHub | slice 2 | observed: ciFollowUpRepeatRun.ts providerRepeatRun.replyToRerun and serveRepeatRuns over the existing fake GitHub |
| S5.3 | A saved request the product's schema refuses fails its case. | slice 2 | observed: PLAN.md Slice 2 record: a kept entry with eligible "yes", and a held request with workflowId "7", fail their cases at "saved reply" |
| S5.4 | The one journey reads the request the product itself wrote through to a card, so a difference between what the product writes and what the builders arrange still fails a check. | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…": "accepted request's card" read from the request the product wrote; F15 fails it |
| S6.1 | After a provider fact changes, a case waits for the event it depends on: the provider's answer to the read, the request's arrival, or the saved request changing. | slice 10 |  |
| S6.2 | No case keeps a 5 s observation whose wait is one collection pass on a machine that keeps a full history. | slice 10 |  |
| S7.1 | The admission, reconciliation, follow-up reading and receipt boundary specs use `prepareRepeatScenario` too. Each of their cases gives the result the base gives it in the same load window. | slice 3 | observed: PLAN.md Slice 3 record: the eight specs importing ciFollowUpScenario.ts, base 20 of 20 and candidate 21 of 21 at two workers and at one, back to back |
| S8.1 | Amended 2026-11-12: It may change what a case pays before its own first step: the `origin` fixture's first use in a worker | slice 7 | observed: dashboard/tests/support/pageTest.ts queuedClaudeBoundaryReady and queuedClaudePreviewReady request the queued origin and server bundle for the named specs' workers; PLAN.md Slice 7 record: first-case origin 0.2–0.5 s |
| S8.2 | Amended 2026-11-12: when the run's app build is produced | slice 7 | observed: pageTest.ts prepareServerInputs(…, "preview"): the app build is requested by the first page case's worker fixture; PLAN.md Slice 7 record: first page dashboard 1.0–1.8 s |
| S8.3 | Amended 2026-11-12: and the published story and server each case arranges, through a kept published-story arrangement that cases share | slice 8 |  |
| S8.4 | Amended 2026-11-12: Every spec that uses a changed fixture keeps its cases and assertions and gives the result it gave before. | slice 8 |  |
| S9.1 | Amended 2026-11-12: `dashboard/tests/intent/intent-project-scope-timing-refresh.spec.ts` joins the named specs | slice 9 |  |
| S9.2 | Amended 2026-11-12: its two cases pass in the same profile with the same figures | slice 10 |  |
| S9.3 | Amended 2026-11-12: Each observation that leaves real collection for kept history keeps an owner among maintained checks, shown by a deliberate product fault. | slice 9 |  |
| R1 | keep the default case timeout | slice 10 |  |
| R2 | and the default expectation timeout | slice 10 |  |
| R3 | no timeout overrides to absorb load | slice 10 |  |
| R4 | no `test.slow()` to absorb load | slice 10 |  |
| R5 | no sleeps to absorb load | slice 10 |  |
| R6 | no retries to absorb load | slice 10 |  |
| R7 | no skips to absorb load | slice 10 |  |
| R8 | A flaky check is failing under the project's failing and flaky test policy until it is stable locally and in CI. | target CI |  |
| L1 | No product behavior changes. The checks change, with their support modules. | slice 10 |  |
| L2 | This story counts first-in-worker preparation in every case's time | slice 10 |  |
| L3 | Amended 2026-11-12: and, since the amendment above, may change it | slice 7 | observed: PLAN.md Slice 7 record: first-in-worker preparation moved to SEED-287's worker fixtures for the named specs; artifacts, startOrigin and global setup unchanged |
| L4 | The cost of one fake `gh` call (a Node process per call) stays as it is. | slice 10 |  |
| L5 | This story lowers the number of calls a case waits for. | slice 10 |  |
| L6 | The repository node suite's follow-up policy, reading and ledger tests stay as they are | slice 3 | observed: PLAN.md coverage row C5: the node ledger test is credited for the second dashboard only, after F12 failed it; the file is unchanged |
| L7 | and are credited only where the coverage map names the promise they already own | slice 3 | observed: PLAN.md coverage row C5: the node ledger test is credited for the second dashboard only, after F12 failed it; the file is unchanged |
| E1.1 | Amended 2026-11-12: Other work holds the one-minute load at 30–50 | slice 10 | |
| E1.2 | Amended 2026-11-12: the four named specs run on two workers | slice 10 | |
| E1.3 | Amended 2026-11-12: three times in a row | slice 10 | |
| E1.4 | Amended 2026-11-12: every case passes each time | slice 10 | |
| E1.5 | Amended 2026-11-12: no case takes more than 25 s | slice 10 | |
| E1.6 | Amended 2026-11-12: A run whose load before or after lies outside the profile is recorded | slice 10 | |
| E1.7 | Amended 2026-11-12: A run whose load before or after lies outside the profile is not counted | slice 10 | |
| E1.8 | Amended 2026-11-12: the named specs include the project scope timing refresh spec | slice 10 | |
| E2.1 | The four specs → count the cases that ingest a receipt → one, where the base has five. | slice 10 |  |
| E3.1 | 403 → a production dashboard starts there → the provider receives exactly one rerun request for run 71 | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request the provider refuses…": stage eligible receipt, replyToRerun(403), "saved reply" refused, "refused card" originalMs 120000 averageMs 100000, "rerun requests" [71] |
| E3.2 | and the card reads refused beside the 120 s original and the 100 s average | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request the provider refuses…": stage eligible receipt, replyToRerun(403), "saved reply" refused, "refused card" originalMs 120000 averageMs 100000, "rerun requests" [71] |
| E3.3 | With 503 and a later 104 s passing repeat, the card stays unverified | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request gets no definitive reply…": replyToRerun(503), setRepeat 104 s, "stays unverified" repeatMs 104000, "rerun requests" [71] |
| E3.4 | and shows the 104 s repeat | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request gets no definitive reply…": replyToRerun(503), setRepeat 104 s, "stays unverified" repeatMs 104000, "rerun requests" [71] |
| E4.1 | a red textual warning shows Original 1 min 45 s, Repeat 1 min 46 s, Saved average 1 min 40 s | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts warning case "red warning" rgb(220, 38, 38); F19 by colour fails it |
| E4.2 | "does not prove a regression or its cause" | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts warning case "caution"; F19 fails it |
| E4.3 | without sideways scroll | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts warning case "warning whole on the phone" (toBeInViewport ratio 1) and expectNoSidewaysScrollIn; a 480 px warning fails it |
| E4.4 | No receipt was ingested. | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts: no scenario.ingest in the spec; warning case "no rerun request" [] |
| E5.1 | a dashboard that collects nothing opens the card's comparison on a phone → both attempts, their links and the reference evidence are read | slice 5 | observed: dashboard/tests/intent/intent-ci-follow-up.spec.ts (reading): per-attempt revision, workflow, start, wall time, difference and completeness |
| E5.2 | and the provider receives no CI request from first render, reload or revisit | slice 5 | observed: dashboard/tests/intent/intent-ci-follow-up.spec.ts (reading): "no CI request from first render"; F21 fails it |
| E6.1 | One deliberate product fault per promise in the coverage map → the named check runs → it fails at an expectation that names the promise. | slice 5 | observed: PLAN.md Slice 2–5 records: each coverage-map fault failed its owner at a labelled expectation before the journey's observation left (F1 by the bound, a recorded decision) |
| E7.1 | A saved request that breaks the product's schema → its case runs → the case fails. | slice 2 | observed: PLAN.md Slice 2 record: a kept entry with eligible "yes", and a held request with workflowId "7", fail their cases at "saved reply" |
| E8.1 | Amended 2026-11-12: The base and the candidate run the named specs on one worker | slice 10 | |
| E8.2 | Amended 2026-11-12: back to back under the same load | slice 10 | |
| E8.3 | Amended 2026-11-12: three passing observations each | slice 10 | |
| E8.4 | Amended 2026-11-12: the candidate's median wall time is no more than 10% above the base's | slice 10 | |
| E8.5 | Amended 2026-11-12: over one passing run the candidate makes fewer provider calls than the base | slice 10 | |
| E8.6 | Amended 2026-11-12: The base is trunk as merged into the story branch, which holds SEED-287's faster journeys | slice 10 | |
| E8.7 | Amended 2026-11-12: the named specs include the project scope timing refresh spec | slice 10 | |
| E9.1 | The same spec paths pass in hosted CI on the published revision | slice 10 |  |
| E9.2 | with no added timeout, sleep, retry, skip or runner mode | slice 10 |  |
