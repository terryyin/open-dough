# Source review — SEED-330#make-ci-follow-up-automatic

Launched 2026-11-12 before the first implementation delegation as a fresh
general-purpose sub-agent with no conversation inheritance. Its only input was
the story's Goal, Scope (required behavior and scope limits) and Key examples,
extracted verbatim from `.planning/seeds/SEED-330-dashboard-ci-follow-up.md`
(the lines from `#### Goal` up to `#### Architecture`) into a temporary file.
It was told to read no other project file, change nothing, number each
commitment, split compound items and list exclusions. Its return follows
unchanged; the Slice and Observation columns are the coordinator's.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | Developer gets the existing automatic slowdown check for new qualifying GitHub Actions landings in every project on the production dashboard | slice 1 | observed: landed-ci-automatic-repeat.spec.ts 105-second journey (no setting step; one call [71], progress then slow card 105000/106000/100000); ciFollowUpAdmission.ts registerFollowUpReceipt eligible: true |
| G2 | ...with zero setup | slice 1 | observed: landed-ci-automatic-repeat.spec.ts 105-second journey (no setting step; one call [71], progress then slow card 105000/106000/100000); ciFollowUpAdmission.ts registerFollowUpReceipt eligible: true |
| G3 | ...regardless of the project's former setting | slice 1 | observed: ci-follow-up-ledger.test.mjs "after an upgrade each earlier receipt keeps its recorded admission…" (new receipt spent once) |
| G4 | Observing a slow landing needs no prior decision to switch the check on, on any project or machine | slice 1 | observed: landed-ci-automatic-repeat.spec.ts 105-second journey (no setting step; one call [71], progress then slow card 105000/106000/100000); ciFollowUpAdmission.ts registerFollowUpReceipt eligible: true |
| 1a | No setting: remove the **Enable automatic CI follow-up on this machine** control | slice 1 | observed: CiFollowUpViews.tsx CiFollowUpSetting deleted; SystemSettings.tsx placement removed; .ci-follow-up-setting CSS removed |
| 1b | Remove the whole follow-up part of each **System settings → Projects** row, namely: | slice 1 | observed: CiFollowUpViews.tsx CiFollowUpSetting deleted; SystemSettings.tsx placement removed; .ci-follow-up-setting CSS removed |
| 1b.1 | its On/Off state | slice 1 | observed: CiFollowUpViews.tsx CiFollowUpSetting deleted; SystemSettings.tsx placement removed; .ci-follow-up-setting CSS removed |
| 1b.2 | its explanation | slice 1 | observed: CiFollowUpViews.tsx CiFollowUpSetting deleted; SystemSettings.tsx placement removed; .ci-follow-up-setting CSS removed |
| 1b.3 | its production action machine | slice 1 | observed: CiFollowUpViews.tsx CiFollowUpSetting deleted; SystemSettings.tsx placement removed; .ci-follow-up-setting CSS removed |
| 1b.4 | its rule note | slice 1 | observed: CiFollowUpViews.tsx CiFollowUpSetting deleted; SystemSettings.tsx placement removed; .ci-follow-up-setting CSS removed |
| 1c | Remove the server write path | slice 1 | observed: ciFollowUpBoundary.ts: POST branch removed, non-GET answers 405 |
| 1d | Remove opt-in and opt-out logic | slice 1 | observed: saveFollowUpSetting and hasRepeatAuthority removed from ciFollowUpAdmission.ts, ciFollowUpCollection.ts, ciFollowUpStore.ts |
| 1e | Remove the stored per-project setting | slice 1 | observed: ciFollowUpStore.ts schema has only landings; plan premise row "old ledger setting dropped" (file keys became ["landings"]) |
| 1f | Remove the stored machine designation | slice 1 | observed: ciFollowUpStore.ts schema has only landings; plan premise row "old ledger setting dropped" (file keys became ["landings"]) |
| 1g | The follow-up read keeps serving Recently done cards | slice 1 | observed: followUpCards reads in follow-up specs; ciFollowUpBoundary.ts followUpAnswer returns cards; useCiFollowUps unchanged |
| 1h | The follow-up read keeps serving the retained review route | slice 1 | observed: intent-ci-follow-up.spec.ts review route; landed-ci-follow-up-reading.spec.ts retained GET (ciFollowUpBoundary.ts GET kept) |
| 2a | Authority from the receipt: the machine that records a landing receipt is the one that follows that landing up, through its production dashboard | slice 1 | observed: landed-ci-automatic-repeat.spec.ts 105-second journey (no setting step; one call [71], progress then slow card 105000/106000/100000); ciFollowUpAdmission.ts registerFollowUpReceipt eligible: true |
| 2b | No machine is configured or named for it | slice 1 | observed: ciFollowUpStore.ts and ciFollowUpBoundary.ts carry no hostname or machine field |
| 2c | Development dashboards still request no rerun (unreleased dashboard code must not act on real CI) | slice 1 | observed: ciFollowUpCollection.ts collectCiFollowUps: projectEnvironment() and adapter guards unchanged in diff |
| 2d | Projects with a custom CI adapter keep their existing CI reading | slice 1 | observed: ciFollowUpCollection.ts collectCiFollowUps: projectEnvironment() and adapter guards unchanged in diff |
| 2e | Projects with a custom CI adapter get no rerun (see X6) | slice 1 | observed: ciFollowUpCollection.ts collectCiFollowUps: projectEnvironment() and adapter guards unchanged in diff |
| 3 | Same follow-up: a newly recorded, qualifying GitHub Actions landing gets the existing one full rerun on the same revision, with the same: | slice 1 | observed: landed-ci-automatic-repeat.spec.ts 105-second journey (no setting step; one call [71], progress then slow card 105000/106000/100000); ciFollowUpAdmission.ts registerFollowUpReceipt eligible: true |
| 3.1 | 5% rule | slice 1 | observed: landed-ci-repeat-admission.spec.ts 104-second case (no repeat); rule text on Recently done card; ci-follow-up-policy.test.mjs |
| 3.2 | saved reference | slice 1 | observed: landed-ci-repeat-reconciliation.spec.ts frozen decision case; landed-ci-follow-up-reading.spec.ts saved samples |
| 3.3 | one-request allowance | slice 1 | observed: landed-ci-automatic-repeat.spec.ts 105-second journey (no setting step; one call [71], progress then slow card 105000/106000/100000); ciFollowUpAdmission.ts registerFollowUpReceipt eligible: true |
| 3.4 | deduplication | slice 1 | observed: ci-follow-up-ledger.test.mjs two independent processes and interruption cases; landed-ci-automatic-repeat.spec.ts 105-second journey (no setting step; one call [71], progress then slow card 105000/106000/100000) restart no second call |
| 3.5 | evidence | slice 1 | observed: landed-ci-automatic-repeat.spec.ts 105-second journey (intent saved before reply, slow card totals); landed-ci-repeat-admission.spec.ts "an eligible Done receipt whose original jobs are incomplete explains why and requests no repeat" |
| 3.6 | Recently done cards | slice 1 | observed: recently-done-ci-automatic-repeat.spec.ts phone journey ("CI rerun in progress" then red "Possible CI slowdown") |
| 3.7 | review route | slice 1 | observed: intent-ci-follow-up.spec.ts review route; landed-ci-follow-up-reading.spec.ts retained GET (ciFollowUpBoundary.ts GET kept) |
| 4a | Upgrade starts with new receipts: remove the setting and designation from an existing machine's follow-up ledger | slice 1 | observed: ciFollowUpStore.ts schema has only landings; plan premise row "old ledger setting dropped" (file keys became ["landings"]) |
| 4b | ...with no compatibility flag | slice 1 | observed: ciFollowUpStore.ts schema has only landings; plan premise row "old ledger setting dropped" (file keys became ["landings"]) |
| 4c | ...with no archive | slice 1 | observed: ciFollowUpStore.ts schema has only landings; plan premise row "old ledger setting dropped" (file keys became ["landings"]) |
| 4d | ...with no history of former settings | slice 1 | observed: ciFollowUpStore.ts schema has only landings; plan premise row "old ledger setting dropped" (file keys became ["landings"]) |
| 4e | Each receipt keeps the admission it was recorded with: | slice 1 | observed: ci-follow-up-ledger.test.mjs "after an upgrade each earlier receipt keeps its recorded admission…" (off false, admitted true, fresh true then false, unrecorded false) |
| 4e.1 | a receipt recorded while follow-up was off never becomes eligible | slice 1 | observed: ci-follow-up-ledger.test.mjs "after an upgrade each earlier receipt keeps its recorded admission…" (off false, admitted true, fresh true then false, unrecorded false) |
| 4e.2 | an admitted receipt not yet requested continues | slice 1 | observed: ci-follow-up-ledger.test.mjs "after an upgrade each earlier receipt keeps its recorded admission…" (off false, admitted true, fresh true then false, unrecorded false) |
| 4e.3 | a landing with no recorded receipt never runs | slice 1 | observed: ci-follow-up-ledger.test.mjs "after an upgrade each earlier receipt keeps its recorded admission…" (off false, admitted true, fresh true then false, unrecorded false) |
| 4f | No historical batch runs | slice 1 | observed: collectCiFollowUps spends only ledger-admitted receipts; no batch code in diff |
| 5a | Guidance: update `docs/dashboard-ci-follow-up.md` to describe follow-up that runs by default with no setting | slice 1 | observed: docs/dashboard-ci-follow-up.md opening paragraphs |
| 5b | Update `dashboard/PROJECT-CONFIGURATION.md` to describe follow-up that runs by default with no setting | slice 1 | observed: dashboard/PROJECT-CONFIGURATION.md follow-up sentence |
| 6a | Tests: delete tests and fixtures dedicated to the retired setting | slice 1 | observed: landed-ci-repeat-receipt-boundary.spec.ts deleted; three admission cases, two ledger cases, setting helper, worker setting action, POST helper deleted |
| 6b | In mixed tests, remove the setting steps and assertions | slice 1 | observed: mixed specs (automatic-repeat, reading, reconciliation, admission, intent-ci-follow-up, recently-done) keep rerun assertions without setting steps |
| 6c | In mixed tests, keep the coverage of the rerun behavior itself | slice 1 | observed: mixed specs keep rerun assertions without setting steps; the jobs-incomplete explanation of a deleted mixed case kept as landed-ci-repeat-admission.spec.ts "an eligible Done receipt whose original jobs are incomplete…" |
| 6d | Add no negative or absence tests for the removed setting | slice 1 | observed: diff adds no absence or negative assertion for the setting |
| 7a | Reconciliation: retire setting coverage from the shared specs as trunk holds them when this story executes (SEED-324 done-slice coverage: Settings case, coverage rows C1 and C16, faults F13 and F18) | slice 1 | observed: trunk forms edited (SEED-324 unlanded at freshness check d64125223); SEED-324 branch untouched |
| 7b | ...including SEED-324's reshaped forms once landed | slice 1 | observed: trunk forms edited (SEED-324 unlanded at freshness check d64125223); SEED-324 branch untouched |
| 7c | If SEED-324 lands after this story, its merge of trunk keeps the removal | landing | |
| 7d | Shared files justify no blocking dependency (on SEED-324) | slice 1 | observed: no dependency recorded in backlog or plan |
| K1 | Never configured: GitHub Actions project with no follow-up setting on production dashboard → Done receipt lands at 105 s against five 100 s prior builds → one full rerun of its run is requested | slice 1 | observed: landed-ci-automatic-repeat.spec.ts 105-second journey (no setting step; one call [71], progress then slow card 105000/106000/100000); ciFollowUpAdmission.ts registerFollowUpReceipt eligible: true |
| K1.1 | Recently done shows **CI rerun in progress**, then the slow or returned-to-range result | slice 1 | observed: recently-done-ci-automatic-repeat.spec.ts phone journey ("CI rerun in progress" then red "Possible CI slowdown") |
| K1.2 | No Settings step happens | slice 1 | observed: landed-ci-automatic-repeat.spec.ts 105-second journey (no setting step; one call [71], progress then slow card 105000/106000/100000); ciFollowUpAdmission.ts registerFollowUpReceipt eligible: true |
| K2 | Formerly off: follow-up off before upgrade → a new qualifying Done landing after the upgrade gets one rerun | slice 1 | observed: ci-follow-up-ledger.test.mjs "after an upgrade each earlier receipt keeps its recorded admission…" (new receipt spent once) |
| K2.1 | A qualifying landing recorded before the upgrade gets none | slice 1 | observed: ci-follow-up-ledger.test.mjs "after an upgrade each earlier receipt keeps its recorded admission…" (off false, admitted true, fresh true then false, unrecorded false) |
| K3 | Formerly designated elsewhere: ledger named another host as action machine → after upgrade, this machine's own new qualifying receipts get a rerun | slice 1 | observed: plan premise row: ledger naming another authority, new receipt spend answered true; ciFollowUpStore.ts holds no authority |
| K4 | Settings: **System settings → Projects** → each row shows name, repository, local path, hidden state and Client configuration | slice 1 | observed: System settings journeys (dashboard/tests/configuration) passed; load failures of two empty-project cases passed on workers=2 rerun |
| K4.1 | ...and nothing about automatic CI follow-up | slice 1 | observed: CiFollowUpViews.tsx CiFollowUpSetting deleted; SystemSettings.tsx placement removed; .ci-follow-up-setting CSS removed |
| K5 | Existing ledger: holding three enabled project settings, eligible receipts and spent requests → after upgrade holds no setting or designation | slice 1 | observed: ciFollowUpStore.ts schema has only landings; plan premise row "old ledger setting dropped" (file keys became ["landings"]) |
| K5.1 | Existing requests remain observable and reviewable from their Recently done cards | slice 1 | observed: saveRepeatRequests specs (ledger without projects) read their requests; landed-ci-follow-up-reading.spec.ts |
| K6 | Not this dashboard's action, unchanged: development dashboard's collection meets a qualifying receipt → no rerun requested | slice 1 | observed: ciFollowUpCollection.ts collectCiFollowUps: projectEnvironment() and adapter guards unchanged in diff |
| K6.1 | Project with a custom CI adapter lands a qualifying build → no rerun requested | slice 1 | observed: ciFollowUpCollection.ts collectCiFollowUps: projectEnvironment() and adapter guards unchanged in diff |
| K6.2 | Both through the existing collection guards, which this story leaves as they are | slice 1 | observed: ciFollowUpCollection.ts collectCiFollowUps: projectEnvironment() and adapter guards unchanged in diff |
| X1 | Exclusion: cross-machine coordination stays out of scope (receipt authority already keeps one machine per landing) | slice 1 | observed: diff adds no cross-machine coordination, threshold, adaptive repeat, backfill, opt-out or adapter rerun |
| X2 | Exclusion: configurable thresholds stay deferred | slice 1 | observed: diff adds no cross-machine coordination, threshold, adaptive repeat, backfill, opt-out or adapter rerun |
| X3 | Exclusion: adaptive repeats stay deferred | slice 1 | observed: diff adds no cross-machine coordination, threshold, adaptive repeat, backfill, opt-out or adapter rerun |
| X4 | Exclusion: historical backfill stays deferred | slice 1 | observed: diff adds no cross-machine coordination, threshold, adaptive repeat, backfill, opt-out or adapter rerun |
| X5 | Exclusion: keeping an opt-out with a default of on is not this story, because the developer asked for the control's removal | slice 1 | observed: diff adds no cross-machine coordination, threshold, adaptive repeat, backfill, opt-out or adapter rerun |
| X6 | Exclusion: reruns for projects with a custom CI adapter belong to the custom trigger story (#invoke-custom-ci-rebuilds), not this one | slice 1 | observed: diff adds no cross-machine coordination, threshold, adaptive repeat, backfill, opt-out or adapter rerun |
| X7 | Exclusion: the existing collection guards for development dashboards and custom-adapter projects are left as they are (K6) | slice 1 | observed: ciFollowUpCollection.ts collectCiFollowUps: projectEnvironment() and adapter guards unchanged in diff |
