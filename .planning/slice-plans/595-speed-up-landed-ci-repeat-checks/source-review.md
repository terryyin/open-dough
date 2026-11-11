# Source review: speed up landed CI repeat checks

Launch: one fresh general-purpose reviewer on 2026-11-11, before the first
implementation delegation, with no conversation inheritance. Input: the
story's Goal, Scope, required restrictions, scope limits, Key examples and the
three Success measure bullets from
[SEED-314](../../seeds/SEED-314-landed-ci-repeat-checks.md#speed-up-landed-ci-repeat-checks),
and nothing else: no plan, product, proof or slice scope. Instruction: use only
that text, read no project files, change nothing, and return numbered
individual commitments.

Return: 135 commitments, recorded below as returned. Row 28.2 was returned as
"the card reads"; the story names no card there, so the row carries the
story's own words.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Dashboard maintainers get faster feedback on automatic repeat after a landed CI result. | slice 5 | |
| 2 | That feedback gives the same verdict under the machine's usual load as in CI. | slice 5 | |
| 3a | Real receipt ingestion, collection and admission still prove exactly one rerun request. | slice 3 | |
| 3b | That one rerun request survives a second server. | slice 3 | |
| 3c | That one rerun request survives a restart. | slice 3 | |
| 4 | Each repeat outcome keeps a check that catches its own regression. | slice 4 | |
| 5 | Ordinary CI continues to catch the same product regressions. | slice 5 | |
| 6a | The family is the twelve cases of two specs; landed-ci-automatic-repeat.spec.ts has one lifecycle case and six outcome cases. | slice 1 | observed: PLAN.md Execution base: proof record selects 12; base landed-ci-automatic-repeat.spec.ts:14 lifecycle case and the six-variant loop at :94-102 |
| 6b | landed-ci-repeat-verdict.spec.ts has five cases for a completed repeat whose provider conclusion is absent or unknown. | slice 1 | observed: base landed-ci-repeat-verdict.spec.ts:10-17: five cases for undefined, null, neutral, skipped and provider-future-state |
| 7a | On main every case prepares five prior builds and a published story, ingests a receipt and waits for collection and admission. | slice 1 | observed: base specs: every case calls prepareRepeatScenario (five priors and a published story in ciFollowUpScenario.ts:59-62), scenario.ingest and a wait for the rerun request |
| 7b | Eleven of them then differ in one provider answer each. | slice 1 | observed: base specs: eleven non-lifecycle cases each keyed by one provider fact; uncertain and verdict undefined and null state a later second fact, as the key examples do |
| 8a.1 | Keep a real journey from receipt ingestion through collection and admission for the accepted request with its whole lifecycle (a thing only the real rerun request can show). | slice 3 | |
| 8a.2 | Keep a real journey from receipt ingestion through collection and admission for the refused request. | slice 3 | |
| 8a.3 | Keep a real journey from receipt ingestion through collection and admission for the request whose acceptance is uncertain. | slice 3 | |
| 9a.1 | Prove the recovered outcome, which provider facts decide after an accepted request. | slice 3 | |
| 9a.2 | Prove the failed outcome, which provider facts decide after an accepted request. | slice 3 | |
| 9a.3 | Prove the cancelled outcome, which provider facts decide after an accepted request. | slice 3 | |
| 9a.4 | Prove the partial proof outcome, which provider facts decide after an accepted request. | slice 3 | |
| 9a.5 | Prove the five absent or unknown conclusions, which provider facts decide after an accepted request. | slice 4 | |
| 9b | These outcomes are proved where the dashboard reads those facts. | slice 4 | |
| 9c.1 | These outcomes are proved without a published story of their own. | slice 4 | |
| 9c.2 | These outcomes are proved without prior builds of their own. | slice 4 | |
| 9c.3 | These outcomes are proved without receipt ingestion of their own. | slice 4 | |
| 9c.4 | These outcomes are proved without admission of their own. | slice 4 | |
| 10a | A case prepares only what its own assertions use. | slice 2 | observed: slice 2 traces: the twelve family cases hold only baseURL, origin, github and startServer fixtures, no Fixture "dashboard" step (PLAN.md slice 2 accepted proof) |
| 10b | Every case on main starts a dashboard server through the page fixture and never asks it anything. | slice 2 | observed: base traces: Fixture "dashboard" in the seven automatic-repeat cases (Decisive premises) and the five verdict cases (slice 2 accepted proof), none asking it anything |
| 11a.1 | Establish surviving proof before removing a case. | slice 4 | |
| 11a.2 | Establish surviving proof before removing a step. | slice 4 | |
| 11a.3 | Establish surviving proof before removing an assertion. | slice 4 | |
| 11b | Surviving proof means: a deliberate fault it detected fails a remaining check. | slice 4 | |
| 12a | Count every credited replacement check, wherever it lives, inside the measured selection. | slice 5 | |
| 12b | Count all preparation inside the measured selection. | slice 5 | |
| 13a | Arrange domain data through shared MakeMe. | slice 4 | |
| 13b | Serve provider facts through the existing external-provider fixture. | slice 4 | |
| 14a | Exactly once stays an exact count of the rerun requests the provider received. | slice 4 | |
| 14b | That count is taken in a journey that waits for the request's own arrival. | slice 4 | |
| 14c | Reason: a count polled for 5 s after the receipt sees zero under load. | slice 4 | |
| 14d | Reason: that polling failed three cases before the automatic-repeat spec was repaired. | slice 4 | |
| 14e | Reason: the verdict spec still polls that way and failed in all four runs of unchanged main that included it during this refinement. | slice 4 | |
| 15a.1 | A refused outcome comes from the provider's actual reply to the rerun request. | slice 3 | |
| 15a.2 | An uncertain outcome comes from the provider's actual reply to the rerun request. | slice 3 | |
| 15b.1 | Reason: recording a refusal as accepted is a fault in how that reply is handled. | slice 3 | |
| 15b.2 | Reason: sending again after a reply is a fault in how that reply is handled. | slice 3 | |
| 15c | Reason: a saved outcome does not exercise those faults. | slice 3 | |
| 16a | Five prior builds stay behind every admission. | slice 3 | |
| 16b | Reason: the product forms a reference from at least five included builds. | slice 3 | |
| 16c | Preparation shrinks by not repeating it. | slice 3 | |
| 16d | Preparation does not shrink by going below that minimum of five. | slice 3 | |
| 17a | Every case in the family passes inside the default 30 s under local load 20–30 on 2 workers. | slice 5 | |
| 17b | Each case passes with its 5 s observations. | slice 5 | |
| 17c | No case gets a timeout allowance. | slice 5 | |
| 17d | Reason: on main six of the seven runs taken at load 19–40 failed a family case, and the failure policy counts that as failing. | slice 5 | |
| 18a.1 | No internal mocks obtain a saving. | slice 5 | |
| 18a.2 | No wall-clock sleeps obtain a saving. | slice 5 | |
| 18a.3 | No retries obtain a saving. | slice 5 | |
| 18a.4 | No skips obtain a saving. | slice 5 | |
| 18a.5 | No timeout inflation obtains a saving. | slice 5 | |
| 18a.6 | No special runner modes obtain a saving. | slice 5 | |
| 19 | Preserve ordinary CI selection. | slice 5 | |
| 20 | Product code stays as it is. | slice 5 | |
| 21a.1 | The admission repeat spec (needs a journey for every case) keeps its cases and assertions. | slice 4 | |
| 21a.2 | The receipt boundary repeat spec keeps its cases and assertions. | slice 4 | |
| 21a.3 | The reconciliation repeat spec keeps its cases and assertions. | slice 4 | |
| 21a.4 | The follow-up reading repeat spec keeps its cases and assertions. | slice 4 | |
| 21a.5 | The two browser journeys keep their cases and assertions. | slice 4 | |
| 21b | Those specs and journeys share this family's scenario. | slice 4 | |
| 21c | Those specs and journeys must keep passing as they do. | slice 4 | |
| 21d | Those specs and journeys are promised no saving. | slice 4 | |
| 22 | First-in-worker origin preparation stays with SEED-287. | slice 5 | |
| 23 | Local-only archived experiments are excluded from the maintained selection. | slice 5 | |
| 24a | The 5 s observations of the admission spec, which also miss under load on main, belong to SEED-287 by Terry's routing on 2026-11-11. | slice 1 | observed: SEED-314 seed scope limits and PLAN.md Admission misses owned by SEED-287; routing commit 44f3e0186 is in the base |
| 24b | SEED-287's scope names the cases. | slice 1 | observed: SEED-287-dashboard-journeys-within-default-timeout.md:117-131 names the admission cases and no-proof recovery :36 |
| 24c | Two of that spec's five cases failed in the two two-worker runs of unchanged main at load 19–23, each waiting 5 s after the receipt for a collected history or card. | slice 1 | observed: recorded preparation evidence in the SEED-314 seed run table, PLAN.md Admission misses and SEED-287 :123-125; the three agree |
| 25.1 | Accepted once, through restart: follow-up is off by default. | slice 3 | |
| 25.2 | Accepted once: follow-up is turned on. | slice 3 | |
| 25.3 | Accepted once: a new Done receipt whose CI took exactly 105 s against five 100 s prior builds is ingested. | slice 3 | |
| 25.4 | Accepted once: the dashboard saves its intent before the provider replies. | slice 3 | |
| 25.5 | Accepted once: the dashboard marks the intent accepted afterwards. | slice 3 | |
| 25.6 | Accepted once: the same receipt again sends nothing more. | slice 3 | |
| 25.7 | Accepted once: a second server sends nothing more. | slice 3 | |
| 25.8 | Accepted once: the card shows the rerun in progress. | slice 3 | |
| 25.9 | Accepted once: the card then shows "Possible CI slowdown" once the repeat takes 106 s. | slice 3 | |
| 25.10 | Accepted once: the card shows original 105 s, repeat 106 s and average 100 s. | slice 3 | |
| 25.11 | Accepted once: history still selects the original attempt. | slice 3 | |
| 25.12 | Accepted once: after a restart the card is still slow. | slice 3 | |
| 25.13 | Accepted once: after a restart the provider has received one request. | slice 3 | |
| 26.1 | Refused: the provider answers the rerun request 403. | slice 3 | |
| 26.2 | Refused: the card says the request was refused. | slice 3 | |
| 26.3 | Refused: the card stays unverified. | slice 3 | |
| 26.4 | Refused: the card shows original 120 s and average 100 s. | slice 3 | |
| 26.5 | Refused: no second request follows. | slice 3 | |
| 27.1 | Uncertain: the provider answers 503. | slice 3 | |
| 27.2 | Uncertain: the card says acceptance is uncertain. | slice 3 | |
| 27.3 | Uncertain: a 104 s repeat that appears later shows as repeat 104 s. | slice 3 | |
| 27.4 | Uncertain: the card stays unverified (also after the later 104 s repeat). | slice 3 | |
| 27.5 | Uncertain: no second request follows. | slice 3 | |
| 28.1 | Recovered: an accepted request for a 120 s original against a 100 s average sees a full 104 s repeat. | slice 3 | |
| 28.2 | Recovered: "CI timing returned to range". | slice 3 | |
| 28.3 | Recovered: the outcome is recovered. | slice 3 | |
| 29.1 | Failed: the repeat concludes with failure; unverified, naming failed. | slice 3 | |
| 29.2 | Cancelled: the repeat is cancelled; unverified, naming cancelled. | slice 3 | |
| 29.3 | Failed and cancelled: never measured as a pass. | slice 3 | |
| 30 | Partial proof: the repeat's jobs are carried forward from the original; "Full comparable repeat is unverified". | slice 3 | |
| 31.1 | No verdict: a completed repeat whose conclusion is absent says it has no provider verdict. | slice 4 | |
| 31.2 | No verdict: a completed repeat whose conclusion is null says it has no provider verdict. | slice 4 | |
| 31.3 | Unknown verdict: neutral says "CI reported" that value. | slice 4 | |
| 31.4 | Unknown verdict: skipped says "CI reported" that value. | slice 4 | |
| 31.5 | Unknown verdict: a value the dashboard does not know says "CI reported" that value. | slice 4 | |
| 31.6 | No or unknown verdict: each stays unverified. | slice 4 | |
| 31.7 | No or unknown verdict: none reads as failed. | slice 4 | |
| 31.8 | When a success verdict then arrives for an absent conclusion, the 106 s repeat reads slow. | slice 4 | |
| 31.9 | When a success verdict then arrives for a null conclusion, the 106 s repeat reads slow. | slice 4 | |
| 32.1 | The original stays: each outcome keeps the original 120 s beside it. | slice 4 | |
| 32.2 | The original stays: each outcome keeps the 100 s average beside it. | slice 4 | |
| 32.3 | The original stays: turning follow-up off leaves the saved original readable. | slice 3 | |
| 33a.1 | Honest proof: "an original at exactly 105 s is not admitted" fails a remaining check. | slice 3 | |
| 33a.2 | Honest proof: "a later collection pass sends a second request" fails a remaining check. | slice 3 | |
| 33a.3 | Honest proof: "a 106 s repeat is not slow" fails a remaining check. | slice 3 | |
| 33a.4 | Honest proof: "a 104 s repeat stays slow" fails a remaining check. | slice 3 | |
| 33a.5 | Honest proof: "a failed or cancelled repeat is measured as a pass" fails a remaining check. | slice 3 | |
| 33a.6 | Honest proof: "carried-forward jobs count as a full repeat" fails a remaining check. | slice 3 | |
| 33a.7 | Honest proof: "a refusal is saved as accepted" fails a remaining check. | slice 3 | |
| 33a.8 | Honest proof: "a later passing repeat clears an uncertain acceptance" fails a remaining check. | slice 3 | |
| 33a.9 | Honest proof: "an absent or unknown conclusion reads as failed" fails a remaining check. | slice 4 | |
| 33b | Each of these fails a remaining check "as it fails one on main". | slice 4 | |
| 33c | Main does not tell a cancelled repeat from a failed one, and this story promises no more there. | slice 3 | |
| 34 | Under load: at local load 20–30 on 2 workers every case in the family passes inside the default 30 s. | slice 5 | |
| 35 | The comparison and the result worth keeping are set before the measured run. | slice 5 | |
| 36a | At least a quarter less whole-command wall time on the family's ordinary one-worker selection, `npm run test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts --workers=1`. | slice 5 | |
| 36b | The measured selection adds any other file that holds a credited replacement check. | slice 5 | |
| 36c | The measure is taken with every preparation and teardown paid. | slice 5 | |
| 36d | Compare with the execution base in alternating runs under the same load. | slice 5 | |
| 36e | Three passing observations of each (base and result). | slice 5 | |
| 37 | At most three cases pay for five prior builds, a published story and receipt-to-admission collection, against twelve on main. | slice 5 | |
| 38 | At local load 20–30 on 2 workers every case passes inside the default 30 s in three consecutive runs. | slice 5 | |
