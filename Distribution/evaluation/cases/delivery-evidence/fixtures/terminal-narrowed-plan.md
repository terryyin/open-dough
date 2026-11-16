# Measure portfolio admissions released by supported terminal treatment

**Identity:** SEED-106#story-terminal-capacity-reconciliation
**Source:** [selected story](../../seeds/SEED-106-sharadar-search-confidence.md)

## Execution boundary

This is a controlled acceptance replay of the record-producing part of slice 3,
adapted from Pygardon's plan at `cffbd3264`. It is not the research calculation.
The supplied precomputed data are the historical summary fields from
`fe322751e`'s `replacement.json`, including both arms, every cost level, the
gate point comparison and the continuous-2026 segment. No costly evaluator
run or ledger reconstruction is required by this returned increment.

## Ordered slices

### 1. The landed economic record supplies the event values
Type: Structure
Status: done
Proof: existing supplier event values and hashes are retained in the precomputed
input. This replay does not independently reverify that earlier research.

Owns the supplier boundary, event values and approved treatment. No supplier
or event-policy changes are returned here.

### 2. Released-slot replay of both arms at the pinned evaluator
Type: Behavior
Status: done
Proof: the existing research supplies both arms' baseline reconciliation,
terminal events, retained trades, admission ledgers and released cost rows.
The current fixture consumes the historical summary; it neither reruns nor
independently proves that expensive calculation or its tamper/wrong-tree stops.

Owns pinned evaluator and development-profile constraints, baseline equality,
terminal-event state transitions, fixed strategy/caps/cost grid, input guards,
unchanged earlier inputs and the detailed trades/ledgers. These are unchanged
prerequisites, not new work claimed by the current producer.

### 3. Changed admissions, attribution windows and effect decomposition
Type: Behavior
Status: planned
Proof: `python3 research/replacement.py > research/replacement.json` and
`python3 research/check_replacement.py` exit 0. The deterministic producer
preserves both arms' precomputed counts, baseline/fixed/released metrics and
direct/capacity/total effects at every cost level, gate point differences and
continuous-2026 results, and emits the labels listed below. The supplied
`replacement.md` label table is the focused check's comparison surface;
the full narrative record still belongs to slice 4.

The precomputed research owns ledger identity comparison, gained/lost outcomes,
chronological windows and cascade attribution; this returned sub-boundary
changes only summary publication and labels. No new admission calculation or
research result is claimed by accepting it.

Labels:

- scope: Modeled counterfactual at the pinned evaluator, not observed trading.
- classifications: Current classifications of the frozen candidate.
- gate: Not a gate test: point differences only.
- verdict: The gate verdict and the four failed lower bounds stand.
- successor: No successor exposure is retained after a sale.
- capacity_path_c: Resolved within this scope.

### 4. Replacement record with its focused check
Type: Behavior
Status: planned
Proof: the later narrative record and its focused check compare all prose
numbers, label rows and reproduction commands against the JSON and pinned
inputs, including local links and the earlier records' unchanged hashes.

Owns `replacement.md`, all human-readable tables, reproduction instructions,
trunk failure explanation, baseline reconciliation prose and its focused
record check. None of that narrative work is returned by this increment.

### 5. The materiality assessment names the replacement record for path C
Type: Behavior
Status: planned
Proof: the assessment check observes profitability, risk, economic gate
comparison and continuous-2026 rows, the C gap paragraph and preserved verdict.

Owns assessment updates, remaining capacity unknowns and the closing verdict.
The original story's exclusions and approved treatment remain applicable.
