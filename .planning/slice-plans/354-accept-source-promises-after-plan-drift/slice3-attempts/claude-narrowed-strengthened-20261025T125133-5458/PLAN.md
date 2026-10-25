# Review a reproducible entry decision with clear waiting and exclusion reasons

**Identity:** SEED-145#story-reviewable-entry-decision
**Source:** [refined story](../../seeds/SEED-145-entry-autonomation.md#story-reviewable-entry-decision)
**Source review:** [source-review.md](source-review.md)

## Execution boundary

This is a controlled acceptance replay of slice 4, adapted from Pygardon's
plan 412 at `c50b14d6d^`. It is not the historical service. `entry/decision.py`
assembles the entry decision from the supplied `entry/inputs.json` (the
candidates with their scan outcomes, the holdings and the resting entry
orders) and stands in for the generation route, the scan's filtered setups and
the store. `python3 entry/decision.py` prints the decision as JSON. Slices 1–3
are represented by the supplied inputs and the committed product; slices 5–7
are later work, not returned here. The Goal and scope, slice 4's Behavior,
slices 5–7 and the Current decisions are the historical plan's text; slices
1–3 and slice 4's Proof are adapted to this replay.

## Goal and scope

The owner operating the activated Sharadar live strategy approves entries from
one **entry decision**: the record of one *Generate signals* run that shows
what it read (strategies, session, source, regime, candidate coverage), how it
ranked (the causal low-risk baseline, with each row's rank inputs), what it
excluded and why, what today's per-sync cap admits, and which decision each
order intent was computed from. Approving or modifying an intent names the
decision reviewed and is refused when that decision has been superseded.

Included: the generation record becomes the entry decision (identity,
generated-at, session, strategies, regime verdict, coverage counts, rank
source); the low-risk order replaces relative-strength order in generation,
dedupe, storage order, the signals table and the order entry sync follows;
rank, ATR, buy stop and ratio per row; filter exclusions `outside_area` and
`relative_strength_gate` beside the existing label and instrument exclusions;
coverage-aware and regime-aware empty states; a waiting label beyond the
per-sync cap; `decision_id` on order intents, in approve and modify requests,
and in the approval audit; one feature document.

Excluded (the story's deferred promises): funded capacity, reservations and
limits (SEED-144#story-live-portfolio-limit-enforcement); any other rank
source or a rank selection control; scheduled generation; broker submission,
protection confirmation and the GTD-intent versus GTC-order time in force;
releasing intents left `deferred` by an earlier cap (observed:
`reconcile_entry_place.py` sets `deferred`, nothing returns them to
`proposed` before the next regeneration); listing not-evaluated candidates by
symbol; the history page; a per-symbol listing of candidates never in the
Area during the alive window (the Area is the universe, so they are not
candidates). These observations are recorded here for the later entry
stories, not acted on.

Assumptions: one live strategy is enabled in production, and the same rank
key decides the per-symbol row when several are; only the latest decision is
kept, as only the latest generation is today; the decision identity changes
when signals are generated, while the owner's own sizing edits recompute
quantities under the same decision; schema additions follow the store's
existing probe-and-`ALTER` pattern (ADR-0004 is deferred).

## Ordered slices

### 1. Eligible setups rank by the low-risk baseline
Type: Behavior
Status: done
Proof: the committed `entry/decision.py` ranks eligible setups by ATR ÷ buy stop, lower first, then newer setup, then symbol. This replay does not independently reverify the historical ranking work.

### 2. The scan reports coverage, regime verdict and filtered setups
Type: Structure
Status: done
Proof: the supplied `entry/inputs.json` carries each candidate's scan outcome, including the filter that removed a setup. This replay does not rerun the scan.

### 3. The decision shows its inputs
Type: Behavior
Status: done
Proof: the decision's inputs are supplied; the header and API are not part of this replay.

### 4. Filtered setups appear with their reason
Type: Behavior
Status: planned
Proof: `python3 -m unittest discover -s tests -p 'test_*.py'` exits 0. Seeded with CCC, whose setup fails the relative-strength gate, and DDD, whose setup session is outside the Area → `excluded_candidates` lists `CCC: relative_strength_gate` and `DDD: outside_area`, neither is ranked, and the existing label and instrument reasons keep their places.

Behavior: the generation's `excluded_candidates` gains the two filter
dimensions from slice 2's `filtered_setups`, ordered by symbol then
dimension as today; the frontend `Record` gains both labels; existing label
and instrument reasons keep their places; already-held and already-ordered
rows stay in history with their existing reasons.

### 5. Incomplete coverage and a risk-off regime read as evidence
Type: Behavior
Status: planned
Proof: API test: one candidate's bars stop at S−1 → `candidates_evaluated` is one fewer than `candidates_supplied` and `coverage` is `incomplete`; section spec covers three empty states (no decision yet → "No current setup signals."; complete coverage → "No setups among N evaluated candidates."; incomplete → "No setups among N evaluated candidates; M not evaluated." with the header flagged "coverage incomplete"); a risk-off decision renders "Regime risk-off: no entries this session." as the empty state and in the header; `AutoTradingPage.spec.tsx:188` keeps the no-decision text; `tests/strategies/test_market_index_load.py` keeps the 422 refusal.

Behavior: the response marks `coverage: complete | incomplete` from the two
counts and the frontend renders the empty state and header flag from the
decision; the missing-benchmark refusal is unchanged and still surfaces as
the generate error.

### 6. Rows beyond the per-sync cap wait
Type: Behavior
Status: planned
Proof: API test with `max_orders_per_run` 1 and two ranked signals → rows carry `admission: within_cap` then `waiting`, and `decision.capacity.max_orders_per_run` is 1; section spec renders "waiting: beyond the per-sync cap of 1" and the capacity fact; `pnpm generate:api`.

Behavior: the server derives each row's admission from its rank position
against the safety record's cap, projecting that every ranked row were
approved; the decision shows "Capacity: N entry orders per sync". No cap
semantics change.

### 7. Order intents trace to the decision reviewed
Type: Behavior
Status: planned
Proof: API test: generate (D1), approve `AAA` naming D1 → 200 and the audit row records D1; generate again (D2), approve `AAA` naming D1 → 409 "The entry decision changed; review the current decision before approving." and the intent stays `proposed`; approve naming D2 → 200; modify follows the same rule; `AutoTradingOrderIntentsSection.spec.tsx` asserts approve and modify send the displayed `decision_id` and shows it per row; E2E `auto_trading.feature:74` and `:90` stay green through the UI; `pnpm generate:api`; the feature document gains the traceability rule.

Behavior: `order_intent` gains a nullable `decision_id` stamped by
`recompute_order_intents` from the current decision (preserved approved and
owner-modified rows keep theirs); the intent row shows it; approve gains a
body `{decision_id}` and modify's body gains the field, both required; a
request whose `decision_id` differs from the current decision's identity is
refused with 409 and changes nothing; `write_order_intent_audit` records the
named decision. The E2E prelude's directly seeded approved intents carry no
decision and are unaffected, because the check compares against the current
decision, not the row.

## Current decisions

- Rank key: `atr_at_setup / buy_stop` (the planned buy-stop price, not the
  limit), ascending, then newer setup date, then symbol: the existing
  `low_risk` fill-priority key, reused rather than re-expressed.
- The Area is the universe: a symbol never in the Area during the alive window
  is not a candidate and is not listed; a setup at an out-of-Area session of a
  symbol otherwise in the Area is listed as `outside_area`.
- The regime verdict is one decision-level fact, never a row per symbol.
- The excluded list carries filter outcomes; held and ordered symbols stay in
  history with their existing reasons.
- The waiting label projects approval of every ranked row against the current
  per-sync cap; it is information, not an admission control.
- Decision identity is a UUID per generation; approval and modification check
  the named decision against the current one.
- "Entry decision" is the user-facing and new-identifier name; the
  `setup_signal_generation` table keeps its name. Wrap-up proposes the
  glossary line for ADR-0002.

## Story obligations

### G1. Already held and already ordered are missing from the excluded list (acceptance observed HHH and OOO absent from `excluded_candidates` in `python3 entry/decision.py` stdout; `test_history_keeps_its_reasons` pins them in `history`)
Reported: slice 4 — "Held and ordered symbols are untouched: they keep their existing reasons in the decision's `history`."
Story clause: "Every candidate that produced a setup inside the alive window but is not ranked is listed with the filter that removed it: outside the Area, relative-strength gate, missing sector or industry label, excluded instrument, already held, already ordered."
Disposition: return
Commitment: 3.1, 3.1.5, 3.1.6

### G2. Excluded rows lack the owner-facing reason labels (independently discovered at slice 4 acceptance)
Reported: slice 4 — "Acceptance observed only the dimension codes `relative_strength_gate` and `outside_area`; neither the return nor the product supplies the labels slice 4's Behavior assigns to the frontend `Record`."
Story clause: "the excluded list shows "CCC: relative-strength gate" and "DDD: outside Area""
Disposition: return
Commitment: E3, U.5

### G3. Rank storage, entry sync, dedupe, relative-strength visibility and rank columns are not observable (first reported in slice 4)
Reported: slice 1 — "Discovered at slice 4 acceptance: `entry/decision.py` has no store, entry sync, multi-strategy dedupe, relative-strength field or signals table, and `entry/inputs.json` gives AAA no relative strength, so example 1's contrary-strength precondition is absent."
Story clause: "That one order is shown, stored, followed by entry sync when it places approved intents, and decides which proposal a symbol keeps when several live strategies propose it."
Disposition: return
Commitment: 2.3, 2.4, 2.5, 2.9, U.3, E1, E1b

### G4. Decision inputs and the facts header are not observable (first reported in slice 4)
Reported: slice 3 — "Discovered at slice 4 acceptance: `python3 entry/decision.py` stdout carries only `market_session`; strategies, source, generated-at, regime and coverage counts are absent from both `entry/inputs.json` and the decision, and there is no page."
Story clause: "The decision shows the live strategies scanned (name and id), the completed market session it is as of, the daily source, when it was generated, the regime gate's verdict for the fill session, and candidate coverage"
Disposition: return
Commitment: 1.1, 1.3, 1.4, 1.5, 1.6, 1.6.1, 1.6.2, 1.6.3, 1.6.3a, 1.6.3b, U.1, U.2, U.2.1, U.2.2, U.2.3, U.2.4, U.2.5, U.2.7, E2

### G5. Deferred promises
Reported: slice 4 — "Allocated at the first source-review acceptance; the story defers these."
Story clause: "neither built nor verified here"
Disposition: excluded "neither built nor verified here"
Commitment: D.1, D.2, D.3, D.4, D.5, D.6, D.7, D.8, D.9
