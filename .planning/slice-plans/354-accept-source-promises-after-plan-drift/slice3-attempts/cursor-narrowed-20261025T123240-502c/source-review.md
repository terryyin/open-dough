# Source review — SEED-145#story-reviewable-entry-decision

## Launch and input

Fresh general-purpose reviewer (no conversation inheritance). Input was only the
selected story section's Goal, Scope (required behavior, rejection constraints,
deferred promises, assumptions), key examples, UI, architecture, and value /
prerequisites text from
`.planning/seeds/SEED-145-entry-autonomation.md#story-reviewable-entry-decision`.
No plan, return, product, proof, or current-slice scope was supplied. Reviewer
was instructed to derive numbered commitments only from those inputs, change
nothing, and read no other project files. Agent id:
`84a37f40-8f86-4646-82c1-2df7ac03b48e`.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Owner approves entries from one understandable entry decision | | |
| 2 | An entry decision is the record of one Generate signals run | | |
| 3 | That record shows what the run read | slice 3 | |
| 4 | That record shows how the run ranked | slice 1 | |
| 5 | That record shows what it excluded and why | slice 4 | observed: `entry/decision.py` `excluded_candidates` + `history`; `tests/test_decision.py` |
| 6 | That record shows what today's controls admit | slice 6 | |
| 7 | Owner stops reconstructing freshness, ranking, and admission by hand | | |
| 8 | An intent approved later provably belongs to the decision reviewed | slice 7 | |
| 9 | Manual path becomes reproducible before unattended repetition (Jidoka) | | |
| 10 | Decision shows live strategies scanned by name | slice 3 | |
| 11 | Decision shows live strategies scanned by id | slice 3 | |
| 12 | Decision shows the completed market session it is as of | slice 3 | |
| 13 | Decision shows the daily source | slice 3 | |
| 14 | Decision shows when it was generated | slice 3 | |
| 15 | Decision shows the regime gate's verdict for the fill session | slice 3 | |
| 16 | Coverage: how many candidates the source supplied | slice 3 | |
| 17 | Coverage: how many had a bar through the session and were evaluated | slice 3 | |
| 18 | Coverage: how many were not evaluated | slice 3 | |
| 19 | Eligible setups ordered by ATR ÷ buy-stop, lower first | slice 1 | |
| 20 | Ties by newer setup, then symbol | slice 1 | |
| 21 | That one order is shown | slice 1 | |
| 22 | That one order is stored | slice 1 | |
| 23 | Entry sync follows that order when placing approved intents | slice 1 | |
| 24 | That order decides which proposal a symbol keeps across live strategies | slice 1 | |
| 25 | Each ranked row shows its rank position | slice 1 | |
| 26 | Each ranked row shows ATR at setup | slice 1 | |
| 27 | Each ranked row shows buy stop | slice 1 | |
| 28 | Each ranked row shows their ratio | slice 1 | |
| 29 | The decision names its rank source | slice 1 | |
| 30 | Relative strength stays visible as information | slice 1 | |
| 31 | Relative strength orders nothing | slice 1 | |
| 32 | Every candidate with a setup in the alive window but not ranked is listed with the filter that removed it | slice 4 | observed: `excluded_candidates` and `history` from `python3 entry/decision.py`; `tests/test_decision.py` |
| 32.1 | Filter: outside the Area | slice 4 | observed: `{"symbol":"DDD","dimension":"outside_area"}` in `excluded_candidates`; `test_filtered_setups_appear_with_their_reason` |
| 32.2 | Filter: relative-strength gate | slice 4 | observed: `{"symbol":"CCC","dimension":"relative_strength_gate"}` in `excluded_candidates`; `test_filtered_setups_appear_with_their_reason` |
| 32.3 | Filter: missing sector or industry label | slice 4 | observed: EEE `sector`, GGG `industry` in `excluded_candidates`; `test_excluded_list_keeps_existing_reasons_in_order` |
| 32.4 | Filter: excluded instrument | slice 4 | observed: FFF `excluded_instrument` in `excluded_candidates`; `test_excluded_list_keeps_existing_reasons_in_order` |
| 32.5 | Filter: already held | slice 4 | observed: HHH in `history` with `already_held`; `test_history_keeps_its_reasons` |
| 32.6 | Filter: already ordered | slice 4 | observed: OOO in `history` with `already_ordered`; `test_history_keeps_its_reasons` |
| 33 | Candidates with no setup are not listed | slice 4 | observed: NNN absent from ranked/excluded/history; `test_candidates_without_a_setup_are_not_listed` |
| 34 | Risk-off is one decision-level fact, not a row per symbol | slice 5 | |
| 35 | Not-evaluated candidates appear as a count | slice 5 | |
| 36 | Rows beyond the per-sync cap are marked waiting with that cap | slice 6 | |
| 37 | Qualification: entry sync places approved intents in rank order and defers the rest | slice 6 | |
| 38 | Decision shows today's capacity: entry orders per sync | slice 6 | |
| 39 | Incomplete coverage labelled with its counts when candidates were not evaluated | slice 5 | |
| 40 | Empty ranked list with not-evaluated reads as no setups among evaluated, N not evaluated | slice 5 | |
| 41 | That empty list never reads as a plain no-setups day | slice 5 | |
| 42 | Missing benchmark/index bars refusal stays a visible refusal | slice 5 | |
| 43 | Each decision has an identity | slice 7 | |
| 44 | Each order intent records the decision it was computed from | slice 7 | |
| 45 | Each order intent shows the decision it was computed from | slice 7 | |
| 46 | Approving an intent names the decision the owner reviewed | slice 7 | |
| 47 | Modifying an intent names the decision the owner reviewed | slice 7 | |
| 48 | The approval audit row records the named decision | slice 7 | |
| 49 | Approving while naming a superseded decision is refused | slice 7 | |
| 50 | Modifying while naming a superseded decision is refused | slice 7 | |
| 51 | Refusal instructs to review the current decision | slice 7 | |
| 52 | Rank or input change after review requires a fresh decision | slice 7 | |
| 53 | No fallback rank source exists | slice 1 | |
| 54 | ATR and buy stop are eligibility conditions of every ranked setup | slice 1 | |
| 55 | A missing rank input is unrepresentable | slice 1 | |
| 56 | Generation builds no substitute order | slice 1 | |
| 57 | Exclusion: funded capacity, reservations and limits | excluded | excluded "funded capacity, reservations and limits" |
| 58 | Exclusion: choosing or activating any other rank source | excluded | excluded "choosing or activating any other rank source (RPR, relative strength, a selection control)" |
| 59 | Exclusion: automatic or scheduled generation | excluded | excluded "automatic or scheduled generation" |
| 60 | Exclusion: broker submission | excluded | excluded "broker submission" |
| 61 | Exclusion: protection confirmation | excluded | excluded "protection confirmation" |
| 62 | Exclusion: intent GTD versus placed order GTC time in force | excluded | excluded "the intent's GTD versus the placed order's GTC time in force" |
| 63 | Exclusion: releasing intents left deferred by an earlier cap | excluded | excluded "releasing intents left `deferred` by an earlier cap" |
| 64 | Exclusion: listing not-evaluated candidates by symbol | excluded | excluded "listing not-evaluated candidates by symbol" |
| 65 | Exclusion: the history page | excluded | excluded "the history page" |
| 66 | Qualification: one live strategy enabled in production | | |
| 67 | Qualification: several strategies share the same rank key | | |
| 68 | Qualification: only the latest decision is kept | | |
| 69 | Qualification: decision identity changes when signals are generated | slice 7 | |
| 70 | Qualification: owner sizing edits recompute under the same decision | slice 7 | |
| 71 | Qualification: per-sync cap is the only admission control until portfolio story | slice 6 | |
| 72 | Journey example 1 — Rank (AAA/BBB low-risk order; RS does not order) | slice 1 | |
| 73 | Journey example 2 — Decision inputs coverage | slice 3 | |
| 74 | Journey example 3 — Exclusion reasons (CCC relative-strength gate; DDD outside Area; neither ranked; existing reasons keep places) | slice 4 | observed: setup `entry/inputs.json` CCC/DDD filters; product JSON stdout; `test_filtered_setups_appear_with_their_reason` + `test_excluded_list_keeps_existing_reasons_in_order` |
| 75 | Journey example 4 — Incomplete evidence | slice 5 | |
| 76 | Journey example 5 — Regime risk-off | slice 5 | |
| 77 | Journey example 6 — Waiting beyond per-sync cap | slice 6 | |
| 78 | Journey example 7 — Traceability D1/D2 | slice 7 | |
| 79 | Auto Trading setup-signals section carries the decision | | |
| 80 | Facts header shows strategy | slice 3 | |
| 81 | Facts header shows session | slice 3 | |
| 82 | Facts header shows source | slice 3 | |
| 83 | Facts header shows generated-at | slice 3 | |
| 84 | Facts header shows regime | slice 3 | |
| 85 | Facts header shows coverage | slice 3 | |
| 86 | Facts header shows rank source | slice 1 | |
| 87 | Facts header shows capacity | slice 6 | |
| 88 | Facts header shows decision identity | slice 7 | |
| 89 | Table includes rank and ratio columns | slice 1 | |
| 90 | Table includes a waiting label per row | slice 6 | |
| 91 | Table includes the extended excluded list | slice 4 | observed: replay boundary is JSON `excluded_candidates` from `python3 entry/decision.py` (no UI surface in this checkout) |
| 92 | Coverage-aware empty state | slice 5 | |
| 93 | Intents show their decision identity | slice 7 | |
| 94 | Intents send decision identity with approve | slice 7 | |
| 95 | Intents send decision identity with modify | slice 7 | |
| 96 | Qualification: no ADR change | | |
| 97 | Qualification: Auto Trading owns the entry decision; Market Data supplies bars | | |
| 98 | Qualification: Entry decision is the user-facing name of the generation record | | |
| 99 | Qualification: wrap-up proposes glossary line for ADR-0002 | | |
| 100 | Qualification: reproducible manual workflow is a safe stop | | |
| 101 | Qualification: no new live ranking policy beyond the stated baseline | | |
| 102 | Qualification: prerequisites none; show today's capacity truthfully | | |

## Slice 4 comparison

| Id | Trigger / setup | Source-expected | Actual observation | Disposition |
| --- | --- | --- | --- | --- |
| 74 / 32.1–32.2 | CCC setup + `relative_strength_gate`; DDD setup + `outside_area` in `entry/inputs.json` | Excluded list shows CCC relative-strength gate and DDD outside Area; neither ranked | `excluded_candidates` contains both rows; neither symbol in `ranked`; unittest pass | accepted |
| 32.3–32.4 | EEE `sector`, GGG `industry`, FFF `excluded_instrument` | Existing label and instrument reasons keep their places | Same three rows present, ordered by symbol then dimension | accepted |
| 32.5–32.6 | HHH in holdings; OOO in entry_orders | Already held / already ordered reasons remain visible | `history` rows `already_held` / `already_ordered` (plan Current decision: history, not excluded list) | accepted |
| 33 | NNN has no setup | Not listed | Absent from ranked, excluded_candidates, and history | accepted |
| 5 / 32 / 91 | Filtered setups from scan | Decision shows what it excluded and why / extended excluded list | JSON `excluded_candidates` ordered by symbol then dimension; focused tests pass | accepted |
