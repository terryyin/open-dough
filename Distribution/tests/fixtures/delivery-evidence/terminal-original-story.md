# SEED-106: Initial-risk and terminal-position evidence

<a id="story-terminal-capacity-reconciliation"></a>
### Measure portfolio admissions released by supported terminal treatment

**Identity:** SEED-106#story-terminal-capacity-reconciliation
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-106#story-terminal-capacity-reconciliation","dependencies":[{"supplier":{"identity":"SEED-106#story-supported-terminal-treatment","href":"seeds/SEED-106-sharadar-search-confidence.md#story-supported-terminal-treatment"},"implementation":"Qualified terminal exposure/event evidence and explicitly owner-approved cash availability, successor holding or sale, release timing and slot/classification treatment for the retained candidate's bounded admission comparison.","rationale":"Counterfactual admissions require a justified event and exact approved state transition; historical rejection counts cannot supply it. Shared code and ordinary reconciliation cannot choose cash availability, successor occupancy or release timing, nor establish unattributed exposure.","condition":"The supplier has completed and supplied evidence sufficient to define the promised terminal state transitions, and the owner has approved the cash/successor/slot rules. A gap-only report, unsupported timing or unapproved policy leaves the gate unsatisfied.","state":"satisfied","resolution":{"revision":"d16cda2b4d9b53c19219320a594b5514340b06f2","path":".planning/seeds/SEED-106-sharadar-search-confidence.md#story-supported-terminal-treatment","summary":"Directly satisfied. The supplier's record (.planning/research/terminal-position-materiality/treatment.md, treatment.json; check_treatment.py passes) defines each terminal state transition from qualified evidence (completion dates, attributed 0.1 residual weight, successor marks) and records the owner's 2026-10-14 approval (\"accept recommendations.\") of the cash/successor/slot rules: the event is recognized at the completion session, the slot is released for admissions from the next session, and the successor is sold at its first session so it occupies no slot and needs no classification. Its derived readiness row is met for all four holdings; this story carries modeling replacement admissions from the session after recognition.\nCondition satisfied: The supplier has completed and supplied evidence sufficient to define the promised terminal state transitions, and the owner has approved the cash/successor/slot rules. A gap-only report, unsupported timing or unapproved policy leaves the gate unsatisfied.\nAccepted integration: 25c226c4f135494627cf06543296e11a1ed77be5 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/340-terminal-capacity-reconciliation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f0080c7af102db777bbfa99925d89e8297e26f60210b0d7ba01c0f76210d091b","plan":"99ca8ee24b0ab7a60d80aa5d7a19fde817c53854b56ecc0e22fcd915659be98c"}}
```

**Goal.** The owner learns whether releasing the four terminal holdings'
slots (CPN, IPHI, LNKD, XEC) under the
[supported terminal treatment record](../research/terminal-position-materiality/treatment.md#selected-treatment)
would have changed the retained candidate's later admissions, and how those
replacement admissions change its full-period profitability, risk and
volume-gate point comparison beyond the direct event values, in both the
reference and the ablation arm. This resolves capacity gap C within its
supported scope and separates the capacity effect from the direct effect the
[terminal economics record](../research/terminal-position-materiality/economics.md) measures.

**Scope.**

Required:

- A reproducible counterfactual replay beside the materiality assessment,
  following the inventory/valuation pattern: `replacement.py` hash-checks the
  frozen inputs and `treatment.json` before running, reads the development
  profile only, writes no frozen input, dataset, strategy or production store,
  and prints `replacement.json`; `replacement.md` records it;
  `check_replacement.py` checks the record against the JSON.
- The replay runs the retained evaluator revision `d3f0546e2e3b` from a
  detached pinned checkout (`tmp/research/pinned-evaluator-d3f0546` under the
  integration checkout, created with `git worktree add --detach` and prepared
  with `scripts/prepare-worktree.sh`), because the current trunk evaluator's
  entry protection requires hourly session bars the frozen Sharadar profile
  does not hold. The calculation asserts that the imported `pygardon` package
  comes from a checkout whose `pygardon` tree is the pinned one.
- Baseline reconciliation first: with no terminal event applied, the replay of
  each arm reproduces its retained result exactly (trades, statistics, daily
  returns, fill events and admission ledger), so every later difference is
  caused by the terminal events alone.
- Terminal events from `treatment.json` only, with the sibling's event values
  and shock rule: on its recognition session each holding leaves the book at
  the selected value (`δ = w × (V/P − 1)` on that session; a successor sale
  charged at each cost level through the engine's own exit-fill accounting; no
  charge on a cash-out; distributions uncredited), its trade record closes at
  that value with reason `terminal_treatment`, and its position, sector and
  industry occupancy is released for admissions from the next portfolio
  session. Successors are sold at their first session and occupy no slot, so
  no successor exposure is retained.
- Everything else fixed: strategy, area and dataset, candidate ordering (setup
  day, priority score, symbol), caps, exit rules and the 0/5/10/20/40bps grid.
- Outputs for both arms: the released run's trades, admission ledger and cost
  rows; the comparison with the baseline ledger by decision identity (symbol,
  setup day, fill day): gained admissions, lost admissions and identities
  present in only one ledger, each with its trade outcome; replacements
  attributed by the chronological windows between releases, where a change
  between one release and the next belongs to the holdings released so far and
  later changes are labelled cascades of earlier replacements; metrics per
  cost level for baseline, fixed-admission reconciled (the sibling record's
  numbers) and released paths, with direct = fixed − baseline, capacity =
  released − fixed and total = released − baseline; and the
  ablation-minus-reference CAGR point differences beside the original
  −0.1723pp and −0.2103pp.
- The [materiality assessment](../research/terminal-position-materiality.md#conclusion-specific-materiality)
  rows for profitability, risk, the economic gate comparison and continuous
  2026 name the replacement record for path C and state what remains open; the
  C gap paragraph says what the replay resolved; `check_assessment.py` follows.
- Labels on every result: a modeled counterfactual at the pinned evaluator
  with current, not point-in-time, Sharadar classifications; point
  differences are not a new gate test; the completed inconclusive verdict and
  its four failed lower bounds stand; no live-readiness conclusion;
  `inventory.json`, `valuation.json`, `capacity.json`, `treatment.json` and
  the sibling's `economics.json` stay unchanged.

Rejection constraints:

- No bootstrap, interval, margin or verdict recomputation: the volume study's
  predeclared decision is complete and this seed forbids reinterpreting it.
- No dataset, strategy or production write, and no new search or model run:
  ADR-0003's data planes and this seed's direction decision. The replay is a
  research computation over the frozen handoff in the development profile.
- Product code gains no corporate-action, delisting or terminal-event
  feature: this seed keeps broader corporate-action infrastructure out of
  scope, so the terminal-event hook lives in the research script and wraps
  the pinned engine's session runner in-process.
- Missing evidence never becomes a value: only marks `treatment.json` records
  as observed or selected enter a number; a hash mismatch, an evaluator tree
  other than the pinned one, a baseline that does not reproduce exactly, or a
  holding whose trade count is not one stops the calculation with an
  assertion, producing no JSON.

Deferred, neither built nor verified here:

- Single-holding release replays and the owner's unselected policies (later
  recognition, settlement lag, idle cash, holding the successor).
- Terminal treatment of the original and incumbent candidates, so no
  corrected ranking.
- Point-in-time classifications, actual account cash, settlement and
  liquidity of the replacement fills.

**Key examples.** Counts and metrics below were observed in refinement on
2026-10-16 with a scratch hook on the reference arm; the record must reproduce
them.

1. Baseline reconciliation: from the pinned checkout with no event applied,
   the reference replay yields 722 trades and the ablation replay 733, and
   every retained field (statistics, trades, daily returns, fill events,
   admission ledger, excluded candidates) equals the frozen result. The same
   replay from the current trunk evaluator stops with
   `RequiredIntradaySessionUnavailableError` and is not used.
2. LNKD, either arm: the book holds ten names on 2016-12-08; LNKD closes at
   196 (`δ ≈ +2.04e−5`), its trade record reads exit 2016-12-08 at 196,
   reason `terminal_treatment`, and from 2016-12-09 the admission check sees
   one position fewer than the baseline until a replacement is admitted.
3. IPHI at 20bps: 2021-04-20 closes at `66 + 2.323 × 45.84 = 172.48632`
   (`δ₁ ≈ +1.256e−4`) and releases the slot; on 2021-04-21 the MRVL part sells
   at `110.29604` as an exit fill the cost grid charges (`δ₂ ≈ +0.002083` at
   20bps); MRVL never occupies a slot.
4. Attribution, reference arm: a decision rejected `positions_cap` with ten
   open in the baseline and admitted in the released run is a gained
   admission with its trade outcome; one admitted in the baseline but rejected
   in the released run is a lost admission. The released reference run has
   895 trade records, 197 gained and 24 lost admissions over the same 1,761
   decision identities, no unresolved position and six ordinary end-window
   open positions.
5. Windows: a gained admission filled between 2016-12-09 and 2018-03-08 is
   attributed to LNKD's release alone; one filled after 2021-10-01 to all four
   releases and the cascade of earlier replacements, and is labelled so.
6. Metrics, reference at 20bps: baseline CAGR 8.470418% and maximum loss
   14.250587%; released CAGR ≈ 11.94% with maximum loss ≈ 21.65%; the record
   shows baseline, fixed and released for both arms at every level, the three
   differences, and the gate point differences beside −0.1723pp and −0.2103pp
   with the verdict row unchanged.
7. Boundary: a tampered `treatment.json`, a `pygardon` import from a
   non-pinned tree, or a baseline mismatch stops the calculation by assertion
   with no JSON written.

**Effort hypothesis:** 2–4 hours, medium confidence: exact replay and the
release hook were demonstrated in refinement; the new work is the harness,
the ledger comparison, the records and about ten minutes of engine time.

**Safe stopping point:** `replacement.json` with both arms' released results
and the baseline reconciliation; the record and assessment rows can follow.
