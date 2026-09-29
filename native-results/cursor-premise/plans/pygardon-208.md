# Remove TFDC behavior that no supported path reaches

**Identity:** SEED-047#story-tfdc-dead-behavior-removal

Source:
[Remove TFDC behavior that no supported path reaches](../../seeds/SEED-047-tfdc-search-and-verify-simplification.md#story-tfdc-dead-behavior-removal)

Audit inventory:
[Proven-dead behavior and code](../../research/tfdc-search-and-verify-audit.md#proven-dead-behavior-and-code--dead-code-story)

## Preparation workspace

Local checkout role (no publish; target selection omitted per instruction):

- owned workspace: `/private/tmp/cursor-premise-20260929/pygardon`, branch `main`,
  starting revision `9ae8e1e4cfb772dd7a0b39fae566a4edc6c602e6`, reused disposable
  checkout supplied by the planning-only instruction (not created by this session)
- originating checkout: same path
- integration checkout: none in this disposable session

## Outcome and scope

The owner reads and maintains only TFDC behavior that a supported path reaches.
Remove, across layers and tests, the audit's proven-dead inventory when
re-verification at removal time still finds each item unreachable from any user
or operator entry point, supported interface (API models, generated CLI client,
frontend), or persisted data that must still be read. No user or operator
outcome changes.

Included: dormant exit rules and their `ExitReason` values; the short side;
unused search neighbor helpers; Sortino eval dispatch while keeping the
stored/served ranking field when still required; contract-missing eval
fallbacks when no longer required by retained rows; production test seams;
unused Verify stream parameters and identity enrich hooks; always-daily
session-bar dispatch residue and dead `min_bar_count` fallbacks; test-only
product helpers (relocate under tests when tests still need them); history-,
source-text-, and delivery-id-pinning tests.

Material exclusions (sibling or stay-and-report):

- owner-decided corrections, including second-Area removal and
  `ensure_linked_live_strategies` / auto-ensure behavior
- representation consolidation and legacy persisted-data conversion
- `untranslatable_fields` while present on API models / generated clients
- `symbol_stats` while emitted on the Verify stream or referenced by parse
  contracts
- Sortino **field** on stored/served contracts and portfolio stats; only the
  unused eval dispatch is in scope, and only when retained data does not need it
- intraday coverage reporting and successful no-trades symbol count
  (preservation boundary)

## Existing solutions and constraints

PFE: delete or relocate dead paths in their current owners; do not add a
cleanup framework, compatibility shim, or second representation. Shared proof
entry is `tests/test_tfdc_search_and_verify_agreement.py` plus the existing
TFDC Python, frontend, and E2E suites. Strategies skill applies for portfolio,
Verify, and genome edits; run `openapi-codegen` only when HTTP models or routes
actually change.

Accepted ADR-0003 (`docs/adrs/0003-settings-environments-and-data-planes-accepted.md`)
still governs store writer ownership and test data-plane isolation; this story
does not relocate store writers. ADR-0002 and ADR-0004 remain Proposed and do
not add requirements. No North Star topic is warranted: this is ordinary
dead-path removal on the existing model.

## Decisive premises (observed)

| Premise | Observation | Result |
| --- | --- | --- |
| Policy JSON never enables dormant exits | `full_session_ohlc_exit_params_from_json` builds `FullSessionOhlcExitParams` from `_EXIT_KEYS` plus volume/pre-close/order-cost/intraday fields only; no `trend_failure_*`, `time_stop_*`, or `trail_tight_atr_mult` reads | Supported. Defaults stay false/None; exit branches are unreachable from saved policy JSON |
| Dormant exit machinery still exists | Fields on `exit_params.py` / `exit/state.py`; branches in `exit/position.py`; `ExitReason` includes `trend_failure` / `time_stop`; precompute wires trend-failure SMA | Supported as removal target |
| Short side has no composer/UI setter | `side == "short"` / `short_execution` only in portfolio fill/collect/params; no genome or frontend setter found | Supported |
| `repaired_search_neighbor` unused by GA | Defined in `operators.py`; GA uses `mutate`/`crossover` + `_named_search_neighbor`; only `tests/search_run/test_operators.py` calls it | Supported |
| Sortino is an eval map key; default ranking is sharpe | `_RANKING_PORTFOLIO_KEYS` includes `"sortino"`; `DEFAULT_RANKING_METRIC` / holdout metric are `"sharpe"`; Search monitor can display a sealed `sortino` contract in frontend tests | Supported; remove dispatch only if re-verification shows no retained-data need (legacy-data owns conversion) |
| Contract-missing eval fallbacks exist | `stored_indicator_lookback` / `stored_ranking_metric` / `stored_ranking_span` return defaults when `run.search_contract is None` | Supported; keep until legacy null-contract rows are gone or proven absent |
| `ga_worker_eval` is a test seam | Module attribute defaulting to `eval_genome_on_freeze`; only tests monkeypatch it | Supported |
| `bind_freeze_eval` identity branch | Returns `eval_fn` unchanged when it is not `eval_genome_on_freeze` | Supported as seam residue |
| Verify stream dead hooks | `post_run_notifications` never passed; `symbols=` override unused by TFDC/random callers; `enrich_complete_params` is identity in `verify_stream_support.py` | Supported |
| `untranslatable_fields` on supported interfaces | Present on live-strategy API models, frontend generated types, and CLI generated models; no non-generated frontend consumer | Stay and report under removal condition |
| `symbol_stats` still emitted | NDJSON `symbolDone` includes `symbol_stats`; frontend parse comment references it | Stay pending re-verification of stream/parse contract |
| Always-daily session-bar dispatch | `_daily_session_bar_source` accepts all three exit kinds and always returns the daily loader | Supported as simplify/remove target for the dispatch residue |
| Test-only product helpers | `gate_baseline_genome` used from tests + agreement test; `update_named_genome_genome` has no callers; `reproject_linked_live_strategies` only tested, while `ensure_linked_live_strategies` is production; `GeneSpace.seeds` never read; `GeneSpace.key_of`/`canonical_key` only asserted in tests (`genome_identity` remains production); `in_area_on_date` only referenced from tests | Supported with per-symbol re-verification; do not remove `ensure_linked_*` or `genome_identity` |
| History-pinning tests exist | `test_legacy_tfdc_verify_route_returns_404`; source-text asserts in search-run persist / verify complete-stats; numbered `test_tfdc_genome_mapping_{1,3,4}.py`; vacuous `skipped_positions_cap >= 0` | Supported |
| Agreement proof exists | `tests/test_tfdc_search_and_verify_agreement.py` (`test_search_eval_and_verify_agree_on_the_same_genome`) | Supported as shared regression entry |

## Ordered slices and proof ownership

Each slice targets about five minutes including focused proof and cleanup.
After ten minutes stop and refine unless a focused command itself accounts for
the elapsed time. Every removal re-verifies reachability first; reachable or
retained-data-required items stay and are reported in Learnings — they are not
forced out. Each slice leaves the suite green on its own.

### Proof ownership map

| Promise | Owning slice |
| --- | --- |
| Dormant exit rules and related `ExitReason` values gone; same trades/stats | 1 |
| Short side gone; long-only results unchanged | 2 |
| Unused search neighbors gone from product | 3 |
| Production search eval test seams gone | 4 |
| Sortino eval dispatch / contract-missing fallbacks removed or stayed with evidence | 5 |
| Unused Verify stream params and identity enrich gone; stayed fields reported | 6 |
| Always-daily dispatch residue and dead min-bar fallbacks gone | 7 |
| Genome test footholds relocated; unused GeneSpace wiring removed | 8 |
| Callerless catalog/area/reproject helpers and route seams removed | 9 |
| History/source-text/delivery-id pinning tests gone | 10 |
| Removed names absent from product/API/clients/frontend; agreement + TFDC suites green | 11 |

### 1. Remove dormant exit rules
Type: Behavior
Status: planned

Pre-condition: a saved live strategy's exit policy JSON cannot set
`trend_failure_exit`, `time_stop_exit`, or `trail_tight_atr_mult`.
Trigger: remove those rules, related min-holding/min-risk fields, state fields,
precompute wiring, and `ExitReason` values `trend_failure` / `time_stop` from
product, API, CLI, and frontend names.
Postcondition: Verify and search eval of that strategy produce the same trades
and statistics as before; no product/API/CLI/frontend code names the removed
rules.

Proof: re-verify parser non-reads; extend or rely on agreement plus focused
TFDC exit/portfolio tests that currently exercise live exits; grep removed
names absent from product trees.
Command: `nix develop -c scripts/check-worktree.sh pytest tests/test_tfdc_search_and_verify_agreement.py tests/strategies/test_trend_following_double_crossover_portfolio.py tests/test_strategies_trend_following_double_crossover_verify_api.py`

### 2. Remove the short side
Type: Behavior
Status: planned

Pre-condition: no composer or UI sets a short side.
Trigger: remove `TradeSide` short, `short_execution`, and short fill/queue/position
branches.
Postcondition: long-only results are unchanged; short names are absent from
product paths that previously carried them.

Proof: re-verify no setters; agreement + focused portfolio/fill tests remain
green; absence grep for short-side product names.
Command: `nix develop -c scripts/check-worktree.sh pytest tests/test_tfdc_search_and_verify_agreement.py tests/strategies/test_trend_following_double_crossover_portfolio.py`

### 3. Drop unused search neighbor helpers
Type: Structure
Status: planned

Internal change: remove `repaired_search_neighbor` and any still-unused
`repaired_neighbor` search wrappers that GA does not call; keep
`mutate`/`crossover`/`_named_search_neighbor`. Adjust or delete the neighbor-only
unit test.
Enables: cleaner search operator surface for later seam and fallback removals.

Proof: operator/selection tests and a focused search-run eval smoke stay green;
no production caller of the removed helpers.
Command: `nix develop -c scripts/check-worktree.sh pytest tests/search_run/test_operators.py tests/search_run/test_run_evals.py`

### 4. Remove search eval test seams from production
Type: Structure
Status: planned

Internal change: eliminate the `ga_worker_eval` module seam and the
`bind_freeze_eval` identity branch, wiring production eval directly; relocate
any still-needed test injection under `tests/` (for example the existing worker
stub) without preserving a production monkeypatch attribute.
Enables: honest production eval signatures before fallback narrowing.

Proof: search-run CLI/holdout/eval tests that used the seam still pass via
test-owned injection; agreement stays green.
Command: `nix develop -c scripts/check-worktree.sh pytest tests/search_run/test_eval.py tests/search_run/test_run_evals.py tests/search_run/test_search_run_cli_holdout.py tests/test_tfdc_search_and_verify_agreement.py`

### 5. Narrow Sortino dispatch and contract-missing fallbacks
Type: Behavior
Status: planned

Pre-condition: ranking defaults and holdouts use sharpe; Sortino remains a
portfolio stat field.
Trigger: re-verify whether any supported writer still seals `ranking_metric:
"sortino"` or whether eval must keep the map entry for retained rows; re-verify
whether `search_contract is None` still occurs for rows that must be readable.
Postcondition: unused Sortino **eval dispatch** and unused contract-missing
fallbacks are removed, **or** each stayed item is reported with its consumer /
retained-data evidence. The stored/served ranking field and `sortino_ratio`
stats field remain.

Proof: search-run ranking/eval tests; explicit Learnings entry for any stay;
do not invent production inventory — if only legacy rows could justify a stay,
keep the path and name that dependency for the legacy-data story.
Command: `nix develop -c scripts/check-worktree.sh pytest tests/search_run/test_eval_on_freeze.py tests/search_run/test_run_evals.py tests/search_run/test_search_run_cli_persist.py`

### 6. Strip unused Verify stream hooks
Type: Structure
Status: planned

Internal change: remove unused `post_run_notifications`, unused `symbols`
override, and the identity `enrich_complete_params` hook from the NDJSON
pipeline and call sites. Re-verify `symbol_stats` and `untranslatable_fields`;
keep them when still on supported interfaces and report.
Enables: thinner Verify transport before session-bar simplification.

Proof: focused Verify API/stream tests green; absence of removed parameter
names; Learnings lists stayed fields with consumers.
Command: `nix develop -c scripts/check-worktree.sh pytest tests/test_strategies_trend_following_double_crossover_verify_api.py tests/strategies/test_verify_complete_stats.py tests/test_tfdc_search_and_verify_agreement.py`
API generation only if response models change.

### 7. Simplify always-daily session bars and dead min-bar fallbacks
Type: Structure
Status: planned

Internal change: remove the exit-kind dispatch that always returns the daily
session-bar loader, and dead `min_bar_count` fallbacks that compose already
makes unreachable, after re-verifying call sites. Preserve real intraday
provisioning for hourly-OHLC execution/exit evidence.
Enables: less Verify composition noise before helper relocation.

Proof: Verify complete-stats and portfolio/area tests green; agreement green.
Command: `nix develop -c scripts/check-worktree.sh pytest tests/strategies/test_verify_complete_stats.py tests/strategies/test_tfdc_portfolio_area_membership.py tests/test_tfdc_search_and_verify_agreement.py`

### 8. Relocate genome test footholds
Type: Structure
Status: planned

Internal change: move `gate_baseline_genome` under tests; remove unread
`GeneSpace.seeds` / unused `canonical_key` wiring after re-verifying
`genome_identity` remains the production identity function; remove
`collapse_inactive` only if re-verification still finds no dependents beyond
the off sentinel itself; remove the scalar setup monkeypatch seam when still
test-only.
Enables: genome package no longer hosts search/test footholds.

Proof: genome tests and agreement import the relocated foothold from test
support; identity/eval tests that use `genome_identity` stay green.
Command: `nix develop -c scripts/check-worktree.sh pytest tests/genome tests/test_tfdc_search_and_verify_agreement.py tests/search_run/test_eval.py`

### 9. Remove callerless catalog and area helpers
Type: Structure
Status: planned

Internal change: delete or relocate `update_named_genome_genome` if still
callerless; remove `reproject_linked_live_strategies` if still test-only
without touching `ensure_linked_live_strategies`; remove `in_area_on_date` if
still unused by product membership; remove route-level Verify test seams still
present only for monkeypatches.
Enables: catalog/area/live-strategy surfaces match reached operators.

Proof: named-genome, area, auto-trading reproject, and Verify route tests
updated or green; production keepers retained.
Command: `nix develop -c scripts/check-worktree.sh pytest tests/areas/test_in_area_on_date.py tests/auto_trading/test_live_strategy_reproject.py tests/strategy_catalog tests/test_strategies_trend_following_double_crossover_verify_api.py`

### 10. Drop history-pinning tests
Type: Structure
Status: planned

Internal change: remove or rewrite tests that pin removed routes (404), source
text, field absence as history, delivery sequence numbers in names/modules, and
the vacuous `skipped_positions_cap >= 0` assertion. Rename capability-named
files where delivery numbering is the only reason for the name. Do not delete
behavioral coverage that still protects current promises.
Enables: final absence proof without fighting historical pins.

Proof: affected test modules collect/pass; no new delivery-number names
introduced.
Command: `nix develop -c scripts/check-worktree.sh pytest tests/test_strategies_trend_following_double_crossover_verify_api.py tests/search_run/test_search_run_cli_persist.py tests/strategies/test_verify_complete_stats.py tests/genome`

### 11. Confirm removed names absent with agreement green
Type: Behavior
Status: planned

Pre-condition: slices 1–10 completed or explicitly stayed with evidence.
Trigger: product-wide absence check for names this plan removed; run agreement
plus a representative TFDC Python band; run frontend tests only if frontend
names changed; note E2E only when scenarios referenced removed names.
Postcondition: removed names are absent from product code, API models,
generated clients, and frontend; stayed items remain listed in Learnings;
agreement and the exercised TFDC suites are green.

Proof: absence grep over `pygardon`, `pygardon_service`, `cli`, `frontend/src`
(excluding stayed reported names); agreement + focused TFDC band.
Commands:
`nix develop -c scripts/check-worktree.sh pytest tests/test_tfdc_search_and_verify_agreement.py tests/search_run tests/strategies tests/genome tests/areas -q`
and, if frontend product names changed,
`nix develop -c scripts/check-worktree.sh pnpm -C frontend test`

## Execution gates

Planning-only preparation does not run product proofs. When execution is later
authorized: prepare the worktree before the first proof or commit; use
dough-execute-plan; independent post-change refactor; openapi-codegen when
contracts change; one coordinator `format:changed`; check-only staged lint;
commit/push per completed slice. Hosted CI is not a local gate for every
change; local proof is the owning slice commands above. CI observer preflight
applies only when an observer is launched.

## Current decisions

- Removal condition is authoritative: reachable or retained-data-required items
  stay and are reported; they are not forced out.
- `untranslatable_fields` and `symbol_stats` start as stay candidates because
  they remain on supported interfaces / stream payload.
- `ensure_linked_live_strategies` and second-Area removal stay outside this
  plan (owner-decided story).
- No new North Star topic.

## Learnings

None yet.
