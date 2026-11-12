# Source review — SEED-324#pass-landed-ci-repeat-checks-under-high-load

Launch: a fresh general-purpose reviewer without conversation inheritance, 2026-11-12, at execution start (`095f2bff9`), before slice 1's delegation.
Input: the story's Goal, Scope (with required restrictions and scope limits) and Key examples from
[the seed](../../seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#pass-landed-ci-repeat-checks-under-high-load), verbatim, plus the four spec paths that "the checks named above" names. No plan, product, proof or slice scope.
Instruction: use only that text, read no files, change nothing; return numbered individual commitments.

Explicit exclusions returned: no product behavior changes; SEED-287 owns the admission cases and first-in-worker preparation; SEED-319 owns the reconciliation, follow-up reading and receipt boundary observations; the cost of one fake `gh` call stays; the node suite's follow-up tests stay; runs outside the profile are recorded and not counted; no timeout override, `test.slow()`, sleep, retry, skip or runner mode.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | Maintainers get a passing verdict from the landed CI repeat and follow-up checks named above while other work holds the machine at a one-minute load of 30–50 | slice 6 | |
| G1.1 | Named check: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts | slice 6 | |
| G1.2 | Named check: dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts | slice 6 | |
| G1.3 | Named check: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts | slice 6 | |
| G1.4 | Named check: dashboard/tests/intent/intent-ci-follow-up.spec.ts | slice 6 | |
| G2 | with the default 30 s case timeout | slice 6 | |
| G3 | the default 5 s expectations | slice 6 | |
| G4 | and wide margin | slice 6 | |
| G5 | Each check gets there by doing much less | slice 6 | |
| G6 | one case keeps the real receipt-to-request journey | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…" is the only case calling scenario.ingest in the two backend specs |
| G7 | every other case starts from the state that journey leaves on a machine | slice 5 | |
| S1 | A one-minute load average of 30–50 before and after a run | slice 6 | |
| S2 | on two workers | slice 6 | |
| S3 | Across the four named specs, at most one case takes a real receipt through ingestion, collection and admission to the provider's rerun request | slice 6 | |
| S4 | That case keeps what only the journey shows | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…": every expectation S4.1–S4.4 names |
| S4.1 | a Done receipt at exactly 105 s against five 100 s prior builds leads to exactly one rerun request for run 71 | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…": "one rerun request" and "rerun requests" [71]; F1 fails it by the bound |
| S4.2 | the intent is saved before the request is sent | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…": "intent saved before the request is sent"; F14 fails it |
| S4.3 | the accepted request is saved after the reply | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…": "accepted saved after the reply"; F8b fails it |
| S4.4 | the request the product wrote is read as a card | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…": "accepted request's card" read from the request the product wrote; F15 fails it |
| S5 | The other cases arrange what a machine already keeps | slice 5 | |
| S5.1 | its follow-up ledger | slice 2 | observed: dashboard/tests/support/ciFollowUpKeptLanding.ts keepRepeats writes the ledger from makeMe.aCiFollowUpEntry; dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "saved reply" |
| S5.2 | landed CI history | slice 2 | observed: ciFollowUpKeptPriors.ts keptPriors().measuredIn(makeMe.aLandedCiHistory) with makeMe.aKeptBuild; dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts cards read averageMs 100000 and originalMs 120000 from it |
| S5.3 | launch records | slice 2 | observed: ciFollowUpKeptLanding.ts keeps the landing's and priors' launch records through makeMe.aLaunchRecord, landedRecord and keepMoreLaunchRecords |
| S5.4 | and where a card is read the story's real published completion | slice 2 | observed: ciFollowUpKeptLanding.ts keepRepeatLanding uses completedPublishedStory; dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts exact one-card arrays |
| S6 | then run real collection and reading in a real server | slice 5 | |
| S7 | the provider's refused and uncertain replies, from an unspent eligible receipt the machine keeps, through the real rerun request | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request the provider refuses…": stage eligible receipt, replyToRerun(403), "saved reply" refused, "refused card" originalMs 120000 averageMs 100000, "rerun requests" [71] |
| S7.1 | the provider's refused replies are covered | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request the provider refuses…": stage eligible receipt, replyToRerun(403), "saved reply" refused, "refused card" originalMs 120000 averageMs 100000, "rerun requests" [71] |
| S7.2 | the provider's uncertain replies are covered | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request gets no definitive reply…": replyToRerun(503), setRepeat 104 s, "stays unverified" repeatMs 104000, "rerun requests" [71] |
| S7.3 | both start from an unspent eligible receipt the machine keeps | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request the provider refuses…": stage eligible receipt, replyToRerun(403), "saved reply" refused, "refused card" originalMs 120000 averageMs 100000, "rerun requests" [71] |
| S7.4 | both go through the real rerun request | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request the provider refuses…": stage eligible receipt, replyToRerun(403), "saved reply" refused, "refused card" originalMs 120000 averageMs 100000, "rerun requests" [71] |
| S8 | what a later collection pass and a restart do with an accepted request | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts "a kept accepted request asks for no rerun…": every expectation S8.1–S8.7 names |
| S8.1 | a later collection pass is covered | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts "a kept accepted request asks for no rerun…": "a whole pass" by the waiting request's run 72, then "no second request" |
| S8.2 | a restart is covered | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts "a kept accepted request asks for no rerun…": a fresh server starts on the kept accepted request and sends nothing ("no second request", "rerun requests" []) |
| S8.3 | in progress | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts "a kept accepted request asks for no rerun…": "progress read" and "progress card"; F16 fails it |
| S8.4 | slow | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts "a kept accepted request asks for no rerun…": "repeat read" and "slow card" 105000/106000/100000; F3 fails it |
| S8.5 | the original kept in history | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts "a kept accepted request asks for no rerun…": "original kept" run/71/1 at 105000; F17 fails it |
| S8.6 | no second request | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts "a kept accepted request asks for no rerun…": "no second request" and "rerun requests" []; F2 fails it three runs of three |
| S8.7 | from a saved accepted request as the saved-request cases already do | slice 3 | observed: dashboard/tests/support/ciFollowUpRepeatStage.ts stage "accepted request" through keepRepeatLanding and keepRepeats, the saved-request owner |
| S9 | the machine setting and the red Done warning with its totals on a phone, from a saved request for a published completion | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts: the settings case and the phone warning case, no scenario.ingest |
| S9.1 | the machine setting | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts "automatic CI follow-up is off on a machine until its user enables it in Settings…": "off until enabled", "on once enabled", "provisional rule"; F13 fails it |
| S9.2 | the red Done warning with its totals on a phone | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts "a kept accepted request reads its repeat in progress, then at 106 seconds a red textual Done warning…" at 390 px: "red warning", totals, "Done" |
| S9.3 | both from a saved request for a published completion | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts warning case: keepRepeatLanding stage accepted request for the published completion; the settings row reads the machine setting and needs no request |
| S10 | the Intent reading of both attempts and their frozen reference | slice 5 | |
| S10.1 | the Intent reading of both attempts | slice 5 | |
| S10.2 | and their frozen reference | slice 5 | |
| S10.3 | from a settled request and kept history | slice 5 | |
| S10.4 | in a server that collects nothing | slice 5 | |
| S10.5 | divided so that no single case carries the first render, the proof navigation, the reload, the revisit and the Development selection together | slice 5 | |
| S10.5.1 | first render stays covered | slice 5 | |
| S10.5.2 | proof navigation stays covered | slice 5 | |
| S10.5.3 | reload stays covered | slice 5 | |
| S10.5.4 | revisit stays covered | slice 5 | |
| S10.5.5 | Development selection stays covered | slice 5 | |
| S11 | Every promise the seven current cases protect keeps an owner among maintained checks | slice 5 | |
| S12 | The plan holds a coverage map of those promises | slice 1 | observed: PLAN.md "Coverage map": 22 rows C1–C22, unchanged by slice 1 |
| S13 | and one deliberate product fault per promise | slice 1 | observed: PLAN.md "Verification" fault table F1–F24; every coverage row names its fault |
| S14 | An observation leaves a journey only after its fault fails the check that takes it over | slice 5 | |
| S15 | SEED-314's faults F1–F11 keep an owner | slice 6 | |
| S15.1 | F1 keeps an owner | slice 3 | observed: PLAN.md Slice 3 record: F1 fails the journey by the 30 s bound |
| S15.2 | F2 keeps an owner | slice 2 | observed: PLAN.md Slice 2 record: F2 fails the refused case at "rerun requests" ([71, 71, 71, 71]) |
| S15.3 | F3 keeps an owner | slice 3 | observed: PLAN.md Slice 3 record: F3 fails the accepted-request case at "slow card" |
| S15.4 | F4 keeps an owner | slice 3 | observed: PLAN.md Decisive premises, F1–F11 row: the saved-request case owns it; that case, heldRequest and keepRepeats observations unchanged in slices 2–3 |
| S15.5 | F5 keeps an owner | slice 3 | observed: PLAN.md Decisive premises, F1–F11 row: the saved-request case owns it; that case, heldRequest and keepRepeats observations unchanged in slices 2–3 |
| S15.6 | F6 keeps an owner | slice 3 | observed: PLAN.md Decisive premises, F1–F11 row: the saved-request case owns it; that case, heldRequest and keepRepeats observations unchanged in slices 2–3 |
| S15.7 | F7 keeps an owner | slice 3 | observed: PLAN.md Decisive premises, F1–F11 row: the saved-request case owns it; that case, heldRequest and keepRepeats observations unchanged in slices 2–3 |
| S15.8 | F8 keeps an owner | slice 2 | observed: PLAN.md Slice 2 record: F8 fails the refused case at "saved reply" (accepted for refused) |
| S15.9 | F9 keeps an owner | slice 2 | observed: PLAN.md Slice 2 record: F9 fails the uncertain case at its card (recovered for unverified) |
| S15.10 | F10 keeps an owner | slice 6 | |
| S15.11 | F11 keeps an owner | slice 6 | |
| S16 | Kept state is arranged through shared MakeMe builders | slice 5 | |
| S17 | builders are typed by the product's own ledger, history and record types | slice 2 | observed: ciFollowUpKeptLanding.ts and ciFollowUpKeptPriors.ts: builders typed by the product's types, no casts; typecheck:dashboard clean |
| S17.1 | typed by the product's ledger type | slice 2 | observed: dashboard/tests/support/ciFollowUpKeptLanding.ts keepRepeats writes the ledger from makeMe.aCiFollowUpEntry; dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "saved reply" |
| S17.2 | typed by the product's history type | slice 2 | observed: ciFollowUpKeptPriors.ts keptPriors().measuredIn(makeMe.aLandedCiHistory) with makeMe.aKeptBuild; dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts cards read averageMs 100000 and originalMs 120000 from it |
| S17.3 | typed by the product's record type | slice 2 | observed: ciFollowUpKeptLanding.ts keeps the landing's and priors' launch records through makeMe.aLaunchRecord, landedRecord and keepMoreLaunchRecords |
| S18 | and provider facts through the existing fake GitHub | slice 2 | observed: ciFollowUpRepeatRun.ts providerRepeatRun.replyToRerun and serveRepeatRuns over the existing fake GitHub |
| S19 | A saved request the product's schema refuses fails its case | slice 2 | observed: PLAN.md Slice 2 record: a kept entry with eligible "yes", and a held request with workflowId "7", fail their cases at "saved reply" |
| S20 | The one journey reads the request the product itself wrote through to a card, so a difference between what the product writes and what the builders arrange still fails a check | slice 3 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a Done receipt at exactly 105 seconds…": "accepted request's card" read from the request the product wrote; F15 fails it |
| S21 | After a provider fact changes, a case waits for the event it depends on | slice 6 | |
| S21.1 | alternative event: the provider's answer to the read | slice 6 | |
| S21.2 | alternative event: the request's arrival | slice 6 | |
| S21.3 | alternative event: the saved request changing | slice 6 | |
| S22 | No case keeps a 5 s observation whose wait is one collection pass on a machine that keeps a full history | slice 6 | |
| S23 | Each of their cases gives the result the base gives it in the same load window | slice 3 | observed: PLAN.md Slice 3 record: the eight specs importing ciFollowUpScenario.ts, base 20 of 20 and candidate 21 of 21 at two workers and at one, back to back |
| S23.1 | admission specs give the base's result | slice 3 | observed: PLAN.md Slice 3 record: the eight specs importing ciFollowUpScenario.ts, base 20 of 20 and candidate 21 of 21 at two workers and at one, back to back |
| S23.2 | reconciliation specs give the base's result | slice 3 | observed: PLAN.md Slice 3 record: the eight specs importing ciFollowUpScenario.ts, base 20 of 20 and candidate 21 of 21 at two workers and at one, back to back |
| S23.3 | follow-up reading specs give the base's result | slice 3 | observed: PLAN.md Slice 3 record: the eight specs importing ciFollowUpScenario.ts, base 20 of 20 and candidate 21 of 21 at two workers and at one, back to back |
| S23.4 | receipt boundary specs give the base's result | slice 3 | observed: PLAN.md Slice 3 record: the eight specs importing ciFollowUpScenario.ts, base 20 of 20 and candidate 21 of 21 at two workers and at one, back to back |
| R1 | keep the default case timeout | slice 6 | |
| R2 | and the default expectation timeout | slice 6 | |
| R3 | no timeout overrides, test.slow(), sleeps, retries or skips to absorb load | slice 6 | |
| R3.1 | no timeout overrides | slice 6 | |
| R3.2 | no test.slow() | slice 6 | |
| R3.3 | no sleeps | slice 6 | |
| R3.4 | no retries | slice 6 | |
| R3.5 | no skips | slice 6 | |
| R4 | A flaky check is failing under the project's failing and flaky test policy until it is stable locally and in CI | slice 6 | |
| R4.1 | stable locally | slice 6 | |
| R4.2 | stable in CI | target CI | |
| L1 | No product behavior changes. The checks change, with their support modules | slice 6 | |
| L2 | this story's edits to those two modules merge with that (SEED-287's collectPriors and prepareRepeatPriors return) | slice 3 | observed: PLAN.md Slice 3 record and Slice 3 acceptance: git merge-file of ciFollowUpScenario.ts and ciFollowUpPriors.ts against SEED-287 is clean; ciFollowUpPriors.ts unedited |
| L3 | This story counts first-in-worker preparation in every case's time and does not change it | slice 6 | |
| L4 | This story lowers the number of calls a case waits for | slice 6 | |
| L5 | node suite tests are credited only where the coverage map names the promise they already own | slice 3 | observed: PLAN.md coverage row C5: the node ledger test is credited for the second dashboard only, after F12 failed it; the file is unchanged |
| E1 | The profile passes with margin: load 30–50, the four named specs on two workers three times in a row | slice 6 | |
| E1.1 | every case passes each time | slice 6 | |
| E1.2 | no case takes more than 15 s | slice 6 | |
| E1.3 | or 25 s when it runs first in its worker | slice 6 | |
| E1.4 | A run whose load before or after lies outside the profile is recorded and not counted | slice 6 | |
| E2 | One journey: count the cases that ingest a receipt → one, where the base has five | slice 6 | |
| E3 | A provider reply without a journey: kept five 100 s prior builds, a Done landing at 120 s, its unspent eligible receipt; a production dashboard starts there | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request the provider refuses…": stage eligible receipt, replyToRerun(403), "saved reply" refused, "refused card" originalMs 120000 averageMs 100000, "rerun requests" [71] |
| E3.1 | 403: the provider receives exactly one rerun request for run 71 | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request the provider refuses…": stage eligible receipt, replyToRerun(403), "saved reply" refused, "refused card" originalMs 120000 averageMs 100000, "rerun requests" [71] |
| E3.2 | 403: the card reads refused | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request the provider refuses…": stage eligible receipt, replyToRerun(403), "saved reply" refused, "refused card" originalMs 120000 averageMs 100000, "rerun requests" [71] |
| E3.3 | 403: beside the 120 s original | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request the provider refuses…": stage eligible receipt, replyToRerun(403), "saved reply" refused, "refused card" originalMs 120000 averageMs 100000, "rerun requests" [71] |
| E3.4 | 403: and the 100 s average | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request the provider refuses…": stage eligible receipt, replyToRerun(403), "saved reply" refused, "refused card" originalMs 120000 averageMs 100000, "rerun requests" [71] |
| E3.5 | 503 and a later 104 s passing repeat: the card stays unverified | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request gets no definitive reply…": replyToRerun(503), setRepeat 104 s, "stays unverified" repeatMs 104000, "rerun requests" [71] |
| E3.6 | 503: and shows the 104 s repeat | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts "a kept eligible receipt whose rerun request gets no definitive reply…": replyToRerun(503), setRepeat 104 s, "stays unverified" repeatMs 104000, "rerun requests" [71] |
| E4 | The warning without a journey: Story A published as completed, an accepted request 105 s against 100 s, repeat passed in 106 s, card read on a phone | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts warning case arrangement: Story A published as completed, accepted request 105 s against 100 s, setRepeat 106 s, viewport 390 by 844 |
| E4.1 | a red textual warning shows | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts warning case "red warning" rgb(220, 38, 38); F19 by colour fails it |
| E4.2 | Original 1 min 45 s | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts warning case "original": Original 1 min 45 s |
| E4.3 | Repeat 1 min 46 s | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts warning case "repeat": Repeat 1 min 46 s |
| E4.4 | Saved average 1 min 40 s | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts warning case "saved average": Saved average 1 min 40 s |
| E4.5 | "does not prove a regression or its cause" | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts warning case "caution"; F19 fails it |
| E4.6 | without sideways scroll | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts warning case "warning whole on the phone" (toBeInViewport ratio 1) and expectNoSidewaysScrollIn; a 480 px warning fails it |
| E4.7 | No receipt was ingested | slice 4 | observed: dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts: no scenario.ingest in the spec; warning case "no rerun request" [] |
| E5 | The reading without acquiring CI: settled recovered request, 120 s then 100 s, frozen reference of five prior builds used and one 116 s outlier excluded, non-collecting dashboard, phone | slice 5 | |
| E5.1 | both attempts are read | slice 5 | |
| E5.2 | their links are read | slice 5 | |
| E5.3 | the reference evidence is read | slice 5 | |
| E5.4 | the provider receives no CI request from first render | slice 5 | |
| E5.5 | the provider receives no CI request from reload | slice 5 | |
| E5.6 | the provider receives no CI request from revisit | slice 5 | |
| E6 | Each promise still has a check that catches it: one deliberate product fault per promise in the coverage map → the named check runs | slice 5 | |
| E6.1 | it fails | slice 5 | |
| E6.2 | at an expectation that names the promise | slice 5 | |
| E7 | A saved request that breaks the product's schema → its case runs → the case fails | slice 2 | observed: PLAN.md Slice 2 record: a kept entry with eligible "yes", and a held request with workflowId "7", fail their cases at "saved reply" |
| E8 | Much faster: base and candidate run the four specs on one worker back to back under the same load, three passing observations each | slice 6 | |
| E8.1 | the candidate's median wall time is at most two-thirds of the base's | slice 6 | |
| E9 | Hosted CI | slice 6 | |
| E9.1 | The same spec paths pass in hosted CI on the published revision | slice 6 | |
| E9.2 | with no added timeout | slice 6 | |
| E9.3 | with no added sleep | slice 6 | |
| E9.4 | with no added retry | slice 6 | |
| E9.5 | with no added skip | slice 6 | |
| E9.6 | with no added runner mode | slice 6 | |
