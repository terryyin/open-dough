---
id: SEED-314
status: active
planted: 2026-11-11
planted_during: Terry's early handoff of SEED-303 into five independent optimization stories
trigger_when: Maintainers select this CI test family for faster trustworthy feedback
scope: story
---

# SEED-314 — Speed up landed CI repeat checks

<a id="speed-up-landed-ci-repeat-checks"></a>

### Speed up landed CI repeat checks

**Identity:** SEED-314#speed-up-landed-ci-repeat-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/595-speed-up-landed-ci-repeat-checks/PLAN.md","assessment":"not-ready","reasons":["Terry has not yet routed the admission spec's 5 s observation misses under load on main: to SEED-287 (recommended, and this plan then stands as written) or to this story as one more slice through plan refinement. See the plan's Decision before Take."],"basis":{"document":"522c97c723ec1bfb80586a9d433b9dfc81710943ade052b50be10ddf3f986bac","plan":"9cd73adf889f3686a9fd21e26d047f95f6c1e85124feeca8bf6d2ebb07ea82d1"}}
```

#### Goal

Dashboard maintainers get faster feedback on automatic repeat after a landed CI
result, with the same verdict under the machine's usual load as in CI. Real
receipt ingestion, collection and admission still prove exactly one rerun
request that survives a second server and a restart. Each repeat outcome keeps
a check that catches its own regression. Ordinary CI continues to catch the
same product regressions.

#### Scope

The family is the twelve cases of two specs:
[landed-ci-automatic-repeat.spec.ts](../../dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts),
with one lifecycle case and six outcome cases, and
[landed-ci-repeat-verdict.spec.ts](../../dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts),
with five cases for a completed repeat whose provider conclusion is absent or
unknown. On main every case prepares five prior builds and a published story,
ingests a receipt and waits for collection and admission. Eleven of them then
differ in one provider answer each.

- Keep a real journey from receipt ingestion through collection and admission
  for each thing only the real rerun request can show: the accepted request
  with its whole lifecycle, the refused request, and the request whose
  acceptance is uncertain.
- Prove the outcomes that provider facts decide after an accepted request
  where the dashboard reads those facts, without a published story, prior
  builds, receipt ingestion and admission of their own. These are recovered,
  failed, cancelled and partial proof, and the five absent or unknown
  conclusions.
- A case prepares only what its own assertions use. Every case on main starts
  a dashboard server through the page fixture and never asks it anything.
- Establish surviving proof before removing a case, step or assertion: a
  deliberate fault it detected fails a remaining check.
- Count every credited replacement check, wherever it lives, and all
  preparation inside the measured selection.
- Arrange domain data through shared MakeMe and serve provider facts through
  the existing external-provider fixture.

Required restrictions and reasons:

- Exactly once stays an exact count of the rerun requests the provider
  received, in a journey that waits for the request's own arrival. A count
  polled for 5 s after the receipt sees zero under load: it failed three cases
  before the automatic-repeat spec was repaired
  ([repeat wait evidence](../evidence/SEED-303-early-handoff/repeat-wait-evidence.md)),
  and the verdict spec still polls that way and failed in all four runs of
  unchanged main that included it during this refinement.
- A refused or uncertain outcome comes from the provider's actual reply to the
  rerun request. Recording a refusal as accepted, or sending again after a
  reply, are faults in how that reply is handled; a saved outcome does not
  exercise them.
- Five prior builds stay behind every admission. The product forms a reference
  from at least five included builds
  ([prior-build reference](../../dashboard/src/ciPriorBuildReference.ts)), so
  preparation shrinks by not repeating it, not by going below that minimum.
- Every case in the family passes inside the default 30 s, with its 5 s
  observations, under local load 20–30 on 2 workers, and no case gets a
  timeout allowance. On main six of the seven runs taken at load 19–40 failed
  a family case, and the
  [failure policy](../../AGENTS.md#failing-and-flaky-tests) counts that as
  failing.
- No internal mocks, wall-clock sleeps, retries, skips, timeout inflation or
  special runner modes obtain a saving. Preserve ordinary CI selection.

Scope limits: product code stays as it is. The repeat specs that need a
journey for every case (admission, receipt boundary, reconciliation, follow-up
reading) and the two browser journeys keep their cases and assertions; they
share this family's scenario, must keep passing as they do, and are promised
no saving. First-in-worker origin preparation stays with
[SEED-287](SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout).
Local-only archived experiments are excluded from the maintained selection.

Open decision, Terry's: who repairs the 5 s observations of the admission
spec, which also miss under load on main. Two of its five cases failed in the
two two-worker runs of unchanged main at load 19–23, each waiting 5 s after
the receipt for a collected history or card. Waiting for persisted collector
results is a pattern SEED-287 names, and its cases predate these specs.
Recommended: SEED-287, which leaves this story as bounded here. Routed here,
that repair becomes one more slice of this story's plan.

#### Key examples

- **Accepted once, through restart.** Follow-up is off by default and is
  turned on. A new Done receipt whose CI took exactly 105 s against five
  100 s prior builds is ingested. The dashboard saves its intent before the
  provider replies and marks it accepted afterwards. The same receipt again
  and a second server send nothing more. The card shows the rerun in progress,
  then "Possible CI slowdown" once the repeat takes 106 s, with original
  105 s, repeat 106 s and average 100 s. History still selects the original
  attempt. After a restart the card is still slow and the provider has
  received one request.
- **Refused.** The provider answers the rerun request 403. The card says the
  request was refused and stays unverified, with original 120 s and average
  100 s. No second request follows.
- **Uncertain.** The provider answers 503. The card says acceptance is
  uncertain. A 104 s repeat that appears later shows as repeat 104 s and the
  card stays unverified. No second request follows.
- **Recovered.** An accepted request for a 120 s original against a 100 s
  average sees a full 104 s repeat: "CI timing returned to range", recovered.
- **Failed and cancelled.** The repeat concludes with failure, or is
  cancelled: unverified, naming failed or cancelled, never measured as a
  pass.
- **Partial proof.** The repeat's jobs are carried forward from the original:
  "Full comparable repeat is unverified".
- **No verdict, or an unknown one.** A completed repeat whose conclusion is
  absent or null says it has no provider verdict; neutral, skipped or a value
  the dashboard does not know says "CI reported" that value. Each stays
  unverified and none reads as failed. When a success verdict then arrives for
  an absent or null one, the 106 s repeat reads slow.
- **The original stays.** Each outcome keeps the original 120 s and the 100 s
  average beside it. Turning follow-up off leaves the saved original
  readable.
- **Honest proof.** Each of these fails a remaining check, as it fails one on
  main: an original at exactly 105 s is not admitted; a later collection pass
  sends a second request; a 106 s repeat is not slow; a 104 s repeat stays
  slow; a failed or cancelled repeat is measured as a pass; carried-forward
  jobs count as a full repeat; a refusal is saved as accepted; a later passing
  repeat clears an uncertain acceptance; an absent or unknown conclusion reads
  as failed. Main does not tell a cancelled repeat from a failed one, and this
  story promises no more there.
- **Under load.** At local load 20–30 on 2 workers every case in the family
  passes inside the default 30 s.

#### Success measure

The comparison and the result worth keeping, set before the measured run:

- At least a quarter less whole-command wall time on the family's ordinary
  one-worker selection,
  `npm run test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts --workers=1`,
  plus any other file that holds a credited replacement check, with every
  preparation and teardown paid. Compare with the execution base in
  alternating runs under the same load, three passing observations of each.
- At most three cases pay for five prior builds, a published story and
  receipt-to-admission collection, against twelve on main.
- At local load 20–30 on 2 workers every case passes inside the default 30 s
  in three consecutive runs.

The retained quiet baseline covers the automatic-repeat spec only: 30.2–32.0 s
summed over its seven cases and 41.8–47.7 s for its focused command
([comparable baseline](../evidence/SEED-303-early-handoff/comparable-baseline.md),
[repeat wait evidence](../evidence/SEED-303-early-handoff/repeat-wait-evidence.md)).
A probe at `f9ed9f52b` on 2026-11-11 ran the unchanged cases while other work
held the machine's one-minute load between 12 and 34.

Where an outcome case spends its time, from the five automatic-repeat cases
that were not first in their worker, on one worker at load 13–18:

| Phase | Seconds |
| --- | ---: |
| Five prior builds | 0.5–0.7 |
| Published story | 1.3–1.6 |
| Own server start and turning follow-up on | 0.3–0.5 |
| Receipt ingestion | 0.6–1.2 |
| Wait for the rerun request | 2.5–3.1 |
| Poll for the outcome | 1.6–2.0 |
| Two more reads and the off switch | 1.8–3.2 |
| Fixtures and teardown | 1.1–1.3 |
| Whole case | 10.5–11.7 |

Traced runs put the page fixture's dashboard server, which no case asks, at
0.8 s of those fixtures at load 13–15 and at 2.0–3.6 s at load 22–27.

A scratch case copied the saved accepted request onto a second origin with no
prior builds, story or receipt. At load 24–27 that origin took 0.3 s, and a
server started there saved the recovered outcome 1.3 s later. The dashboard
shows no card there, because a card needs the published completion, so the
saved request is where that outcome reads.

Runs of unchanged main, in the order taken:

| Selection | Workers | Load before → after | Elapsed | Result |
| --- | ---: | --- | ---: | --- |
| automatic repeat, traced | 1 | 26.7 → 21.9 | 205 s | lifecycle 31.1 s and recovered 31.0 s timed out |
| automatic repeat | 1 | 20.4 → 33.8 | 201 s | lifecycle 31.0 s and recovered 31.3 s timed out |
| automatic repeat | 1 | 30.4 → 26.8 | 83 s | 7 passed |
| admission, verdict, no-proof recovery | 2 | 19.2 → 20.4 | 84 s | 1 admission and 1 verdict case missed a 5 s observation |
| admission, verdict, no-proof recovery | 2 | 20.4 → 23.5 | 96 s | 2 admission and 2 verdict cases missed one |
| the family | 1 | 18.8 → 25.3 | 261 s | 3 verdict cases missed the 5 s count; lifecycle passed in 30.06 s |
| the family, under burners | 2 | 22.4 → 40.3 | 182 s | 8 of 12 failed |

With the unused server scratched away the automatic-repeat spec passed twice,
in 115 s at load 14.9 → 20.4 and in 124 s at load 33.8 → 30.4. The same seven
unchanged cases took between 83 and 205 s as the other work changed, so a
single pair of runs decides nothing here. That is why the measure alternates
three observations of each and also counts journeys.

#### Provenance and evidence

Extracted by Terry's instruction from [SEED-303](SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks),
with the [slice mapping](../evidence/SEED-303-early-handoff/README.md).
Use [repeat-wait-evidence.md](../evidence/SEED-303-early-handoff/repeat-wait-evidence.md) and
[comparable-baseline.md](../evidence/SEED-303-early-handoff/comparable-baseline.md) as retained evidence, not a new baseline.
