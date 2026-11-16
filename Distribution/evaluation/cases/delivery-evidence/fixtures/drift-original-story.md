# SEED-145: Reliable and timely entering through autonomation

<a id="story-reviewable-entry-decision"></a>
### Review a reproducible entry decision with clear waiting and exclusion reasons

**Identity:** SEED-145#story-reviewable-entry-decision
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/412-reviewable-entry-decision/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2dbefcc17e15a2b10ce08f04f03f1772b503966a04a609bdf8f65e25a08914b2","plan":"10f0a1888ae221cbcdc292b9076f2ee4bf38c9d92478d3e56c92041a870e7b37"}}
```

Refined 2026-10-24 against the current code: live signals are ordered by
relative strength (`pygardon/auto_trading/signals.py`) while the genome's
`fill_priority` order is computed and discarded; nothing records the session or
candidate coverage of a generation; exclusions other than missing labels and
excluded instruments are silent; an order intent links to its signal only by
symbol.

**Goal.** The owner operating the activated Sharadar live strategy approves
entries from one understandable **entry decision**: the record of one
*Generate signals* run that shows what it read, how it ranked, what it
excluded and why, and what today's controls admit. The owner stops
reconstructing freshness, ranking and admission by hand, and an intent
approved later provably belongs to the decision reviewed. This is the
standard-work increment of the Jidoka progression: the manual path becomes
reproducible before any later story repeats it unattended.

**Scope — required behavior.**

- *Decision inputs.* The decision shows the live strategies scanned (name and
  id), the completed market session it is as of, the daily source, when it was
  generated, the regime gate's verdict for the fill session, and candidate
  coverage: how many candidates the source supplied, how many had a bar
  through the session and were evaluated, and how many were not evaluated
  (no bar through the session or too short a history).
- *Rank.* Eligible setups are ordered by the causal low-risk baseline: setup
  ATR divided by the planned buy-stop price, lower first; ties by newer setup,
  then symbol. That one order is shown, stored, followed by entry sync when it
  places approved intents, and decides which proposal a symbol keeps when
  several live strategies propose it. Each row shows its rank position and
  the rank inputs (ATR at setup, buy stop, their ratio) so the owner can
  reproduce the order. The decision names its rank source. Relative strength
  stays visible as information and orders nothing.
- *Exclusion reasons.* Every candidate that produced a setup inside the alive
  window but is not ranked is listed with the filter that removed it:
  outside the Area, relative-strength gate, missing sector or industry label,
  excluded instrument, already held, already ordered. Candidates with no
  setup are not listed. A risk-off regime is one decision-level fact ("no
  entries this session"), not a row per symbol. Not-evaluated candidates
  appear as a count.
- *Waiting.* Rows ranked beyond the per-sync order cap are marked waiting
  with that cap, because entry sync places approved intents in rank order and
  defers the rest. The decision shows the capacity fact that applies today:
  the number of entry orders per sync.
- *Incomplete evidence.* When candidates were not evaluated, the decision is
  labelled incomplete coverage with its counts, and an empty ranked list
  reads as "no setups among the evaluated candidates, N not evaluated", never
  as a plain no-setups day. The existing refusal when benchmark or index bars
  do not reach the session stays a visible refusal.
- *Traceability.* Each decision has an identity. Each order intent records
  and shows the decision it was computed from. Approving or modifying an
  intent names the decision the owner reviewed; the approval audit row
  records it.

**Scope — rejection constraints.** Approving or modifying an intent while
naming a superseded decision is refused, with the instruction to review the
current decision: the seed's standard-work rule that a rank or input change
after review requires a fresh decision. No fallback rank source exists: ATR
and buy stop are eligibility conditions of every ranked setup, so a missing
rank input is unrepresentable and the generation builds no substitute order.

**Deferred promises** (neither built nor verified here): funded capacity,
reservations and limits (the [portfolio
story](SEED-144-sharadar-winner-confidence.md#story-live-portfolio-limit-enforcement));
choosing or activating any other rank source (RPR, relative strength, a
selection control); automatic or scheduled generation; broker submission,
protection confirmation and the intent's GTD versus the placed order's GTC
time in force; releasing intents left `deferred` by an earlier cap; listing
not-evaluated candidates by symbol; the history page.

**Assumptions.** One live strategy is enabled in production; several are
handled by the same rank key without further promise. Only the latest
decision is kept, as the latest generation is today. The decision identity
changes when signals are generated; the owner's own sizing edits recompute
quantities under the same decision. The per-sync cap is the only admission
control until the portfolio story lands.

**Key examples.**

1. *Rank.* Setups AAA (ATR 3.0, buy stop 100.00, ratio 0.030) and BBB (ATR
   2.0, buy stop 100.00, ratio 0.020); AAA has the higher relative strength →
   Generate → BBB ranks 1, AAA ranks 2; both rows show ATR, buy stop and
   ratio; the decision names the low-risk baseline as rank source. Approving
   both and syncing with a cap of 1 places BBB and defers AAA.
2. *Decision inputs.* 120 candidates supplied, 118 with a bar through session
   S → Generate → the decision shows the strategy, session S, the source,
   generated-at, regime risk-on, and "118 of 120 evaluated, 2 not evaluated".
3. *Exclusion reasons.* CCC has a setup but fails the relative-strength gate;
   DDD has a setup but is outside the Area at that session → Generate → the
   excluded list shows "CCC: relative-strength gate" and "DDD: outside Area";
   neither is ranked; existing reasons keep their places.
4. *Incomplete evidence.* The source reaches session S for the benchmark but
   40 of 120 candidates stop at S−1 → Generate → the decision is labelled
   incomplete coverage, "80 of 120 evaluated, 40 not evaluated", and an
   empty list reads "No setups among 80 evaluated candidates; 40 not
   evaluated".
5. *Regime.* The market index is risk-off for the fill session → Generate →
   the decision shows "regime: risk-off, no entries this session"; the empty
   list carries that reason.
6. *Waiting.* Cap 3, five ranked setups → ranks 4 and 5 read "waiting:
   beyond the per-sync cap of 3"; the decision shows "3 entry orders per
   sync".
7. *Traceability.* Decision D1 is on screen; AAA's intent shows D1 →
   Generate again produces D2 and recomputes intents → approving AAA while
   naming D1 is refused and AAA stays proposed; approving while naming D2
   succeeds and its audit row records D2.

**UI.** The existing setup-signals section of the Auto Trading page carries
the decision: a facts header above the table (strategy, session, source,
generated-at, regime, coverage, rank source, capacity, decision identity),
rank and ratio columns, a waiting label per row, the extended excluded list,
and the coverage-aware empty state. Intents show their decision identity and
send it with approve and modify.

**Architecture.** No ADR change. Auto Trading owns the entry decision
([ADR-0001](../../docs/adrs/0001-ubiquitous-language-accepted.md)); Market
Data supplies the bars. *Entry decision* is the user-facing name of the
record one Generate run already leaves; wrap-up proposes its glossary line
for [ADR-0002](../../docs/adrs/0002-trading-ubiquitous-language.md), which
the owner accepts.

- **Value / safe stop:** a reproducible manual entry workflow is useful even
  if automation stops here; no new live ranking policy beyond the stated
  baseline is activated.
- **Effort hypothesis:** 2–4 hours, moderate confidence: six behaviors over
  generation, the generation and intent records, one request field, the
  existing signals section, and the existing tests that pin relative-strength
  order.
- **Prerequisites:** none; show today's capacity truthfully and integrate the
  shared controls as the portfolio story publishes them.
