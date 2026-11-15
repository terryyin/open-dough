# ODF-150 — pygardon execution evidence

[Canonical finding, response and assessment](ODF-150.md#odf-150).

### Retained source evidence — Pygardon (2026-10-28)

**Source:** [Pygardon / DearDough.md](https://github.com/terryyin/pygardon/blob/af32a91bd77f44d43a43743e1cacee6c6e39af79/DearDough.md).

- Execution: SEED-120#story-duckdb-2-close-race; first implementation `0aaf2312968ef988cac03adc8c4c76ddf5fb7282`
  - Timestamp: unknown (2026-10-27 execution conversation) · Tool: Codex · Open Dough release: unknown
  - Evidence: `222610d0ae524287e519d634512b4af287f982c7:.planning/slice-plans/433-duckdb-close-race/PLAN.md`, G6/G8 and host-proof continuation; `/private/tmp/duckdb2-full-host-docker.log`.
  - Observed effect: The cross-version preflight covered fifteen real provisioning/copy destinations but missed historical-export fixture constructors consumed by retained 1.5.6 images. The 169-case Docker run finished after 4725.49s with thirteen failures, ten caused by unreadable version-69 historical fixtures. A direct constructor/old-reader probe then reproduced the shared cause; repaired affected coverage passed.
  - Inference: Before the required broad runtime proof, trace retained-image inputs through their fixture constructors and test their actual old-reader boundary. The final full coverage remains necessary; this narrower preflight could have avoided late setup failures.

- Execution: SEED-20261032#story-holding-protection-observation; first implementation `b9325a5f7201fd730a24995ad3122ddf8eaeb373`
  - Timestamp: 2026-10-28T12:08:00+08:00 · Tool: Cursor · Open Dough release: unknown
  - Evidence: slice 2 SHA `01b38731c54700184fa7102f616f82c85e7ce13a`; CI attempt `958ec944-e56b-4028-91de-74160236eb53` failed `tests/auto_trading/test_signals_persist.py::test_persist_entry_decision_rejects_fresh_signal_when_symbol_is_held` (HoldingRecord equality after `upsert_holding` auto-assigned `obligation_id`); repair `a2766fc28e67d934aef72ea8b533d519ef9335c3`; coordinator stash/restore of in-flight slice 3 around the repair.
  - Observed effect: Slice 2's focused holdings/observation proof and consumer selection omitted a persist-equality consumer of `upsert_holding`'s new obligation lifecycle field. The failure arrived in CI after slice 3 had already started; stash/repair/restore recovered without product rollback.
  - Inference: A lifecycle field added on upsert needs equality/round-trip consumers of HoldingRecord persistence in the same proof set, not only observation/GET suites.

### Retained source evidence — Pygardon (2026-10-28)

**Source:** [Pygardon / docs/process-findings/proof-and-acceptance.md](https://github.com/terryyin/pygardon/blob/af32a91bd77f44d43a43743e1cacee6c6e39af79/docs/process-findings/proof-and-acceptance.md).

- Execution: SEED-014#story-session-keepalive (first implementation a7e416db9978d19ce13a7eca3bb285ce6fcc9477)
  - Timestamp: unknown · Tool: Codex · Open Dough release: unknown
  - Evidence: `1e2371d86a525d884fdb392b152ed59e11f8d093:.planning/slice-plans/433-ibkr-session-keepalive/EVIDENCE.md`, CI repair; owned revision `1e7fa38e574015ce363628530a7573380e890510`, attempt `070c8a5a-9527-4623-be33-9bbb1051f1ca`, repair `723b50b67c9de9f394159c4b1475fb48fb74bad5`.
  - Observed effect: Acceptance reused presumed equivalent API coverage instead of running the named monitoring browser consumer after owned-Run eligibility changed. That scenario failed in CI with held-request count zero because its installation fixture left Run off; the other 133 scenarios passed. Explicit eligible fixture setup, red reproduction and focused/shared browser proof repaired it without weakening the cancellation or zero-restart assertions.
  - Inference: An equivalent boundary claim missed a consumer's decisive starting state. The complete caller/setup path, rather than passing nearby API cases, determines whether browser proof can be reused.

- Execution: SEED-145#story-entry-round-reconciliation, plan `.planning/slice-plans/430-entry-round-follow-up/PLAN.md` (recoverable at `ba4163ec1b80165802e7cff266d2e85472e43a25`; Take `05ca480dc445fcae4cf36a0bf0f3b9f295148230`), first implementation commit `7f878c03bf6a08deaa4864babfcf27cf523c8c5c`
  - Provenance: Timestamp: unknown (2026-10-27, CI on `c33ab2e9e7e4ed8fc706b47a44131aacb5bdb1bc`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.72
  - Evidence: slice 4 (`842118e63efa9890655f8b01fa7ddb5f7c4c672e`) imported `pygardon_service/entry_round_follow_up_wake.py` from `service_lifecycle.py`; its term-based consumer trace and the broad lifespan selection omitted `tests/test_qualification_source.py`, whose startup scope walker follows imports; CI attempt `4d85fdb3-956c-4227-8a2c-981c48134a0c` failed `test_real_startup_scope_covers_bootstrap_dependencies_not_request_calculations`; repaired in `51da834f8526b9513892f1604c65dcac05cac7a4` (`DISPATCH_BOUNDARIES`)
  - Observed effect: A consumer reached through the import graph, not by any changed name, failed only in CI one slice later.
  - Inference: A change that adds a startup import edge needs the startup qualification source tests in its proof; a name-based trace cannot see import-graph consumers.

- Execution: SEED-20261025#story-shared-admission-conditions (first implementation d753983bcaa6e6f48f2e90f11fce820b6372e005)
  - Timestamp: unknown (2026-10-27 execution conversation) · Tool: Codex · Open Dough release: unknown
  - Evidence: registered revision `d753983bcaa6e6f48f2e90f11fce820b6372e005`, CI attempt `2cd815fd-11f4-400e-82df-3d0dc7597e7c`; `tests/test_auto_trading_signals_intent_eligibility_api.py::test_deferred_intent_keeps_its_status_refusal_while_a_broker_read_fails`; repair `830f10537c60ef2ce35f11d0dc3f575d33ec6a0a`.
  - Observed effect: The reason-contract trace named `admission_reasons` and the preview function, but acceptance did not follow `read_admissions` into its third test module. CI found one stale shared-diagnostic expectation after 5739 passing tests. Focused red reproduction and 14 passing admission tests repaired the missed consumer while preserving deferred refusal, unknown status, Capacity diagnostic and no submission.
  - Inference: Proof selection must follow the reached test helper's callers; a completed symbol trace and nearby passing API suites did not establish coverage of the combined deferred/unknown journey.

### Additional retained evidence — pygardon (2026-11-01)

**Source:** [docs/process-findings/proof-and-acceptance.md](https://github.com/terryyin/pygardon/blob/ddb61fbcd4b54a217669d7f3d2e42ac21ace1a41/docs/process-findings/proof-and-acceptance.md).

- Execution: SEED-145#story-timely-entry-preparation; first implementation 437ad09be3bda5f2cf690e5f7a090b465dfec80b
  - Timestamp: unknown · Tool: Codex · Open Dough release: unknown
  - Evidence: CI for 437ad09be (attempt a6037c2d-c357-4f6f-8f1b-74bd266a6fba) exposed qualification-source traversal and process-wide fake timer interference; CI for d824be9a4 (0f59f5fb-ba59-4e0a-988c-496264091d15) exposed exchange_calendars import in idle service startup. Repairs 0e03fbeb5/a453b6a0c reproduced failures and renewed startup/scheduling consumers.
  - Observed effect: Initial bounded proof passed but omitted these indirect startup consumers, producing two repair increments. Explicit fresh-process unprovisioned, empty-selection and disabled-selection tests now observe idle behavior.

- Execution: SEED-20261043#story-backtest-faithful-dynamic-entry-allocation (plan `.planning/slice-plans/443-dynamic-entry-order-replacement/PLAN.md`; first implementation `f75915c55ab8a89bd8f24863d4e3339b5dad00f2`)
  - Timestamp: unknown (2026-10-29, CI for 2b095b71a, run a4c5c742-4ed2-4e33-bb76-bb6582fecf1d) · Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: 0.3.74
  - Evidence: slice 3 added `broker_order.working_since`; its 116-file keyword selection (entry_sync, broker-order storage, order-intents, readiness) passed 525 tests, but CI failed `tests/test_production_store_shapes.py::test_serving_shapes_are_retained_by_service_bootstrap`, whose fixture `tests/fixtures/startup_stores.py` lists migrated serving columns; repair cfb5e01bf.
  - Observed effect: one CI repair cycle (stash, repair agent, refactor agent, publish, restore) after an accepted slice.
  - Inference: a schema change's consumers include serving-store shape fixtures that no product-module keyword reaches; tracing the changed table name, not the edited modules, would have selected it.

- Execution: SEED-20261052#story-automatic-forced-sale-at-open; first implementation `fb17076af15e4483bbf36483747afa4efce4625f`; spent plan/source recoverable at before-cleanup `47536d6a9f1ef93465127daeb2a5f0663f43d75f:.planning/slice-plans/451-automatic-forced-sale-at-open/`
  - Timestamp: 2026-10-29T19:36:00+08:00 · Tool: Cursor · Open Dough release: 0.3.76
  - Evidence: slice 1 added `us_equity_session_n_after` with local deadline proofs at force-sell day 20 (`tests/test_auto_trading_opening_deadline_api.py`, `tests/test_us_equity_calendar_range.py`); CI on `fb17076af` failed when STPH1-style fixtures exercise `force_sell_nth_day` 10000 and `sessions_distance(start, last) + 1` overran `sessions_window`; repair `5d5dbfc58` dropped the `+ 1` and added `test_us_equity_session_n_after_large_n_clamps_to_last_loaded_session`.
  - Observed effect: one CI repair cycle (stash slice-2 work, repair, restore) after an accepted slice-1 publish.
  - Inference: story-shaped n=20 calendar proofs did not select the existing large-n entry/exit fixtures that consume the same helper; clamp symmetry with `us_equity_session_n_before` was the missing consumer check.

### Retained source evidence — pygardon / DD-382 (2026-11-01)

**Source mapping:** pygardon / DD-382 → ODF-150.

**Source recovery:** `ddb61fbcd4b54a217669d7f3d2e42ac21ace1a41:docs/project-findings/maintenance-observations.md`.

Slice 6 of SEED-20261044 rewrote overlapping owner-operation serialization tests
from Execute to Sync holdings and kept waiting on `lock_queued` latency events.
Those events emit only when `entry_latency.current_operation` is set; Sync never
enters `entry_operation` (the removed Execute route did). The accepted slice-6
proof selection omitted the rewritten serialization module. CI on `370f61f8c`
hung three cases in `wait_until` for `lock_queued`; a local focused run hung the
same way. Plan learnings for an earlier slice had already noted Sync's missing
`entry_operation("submit")` wrap.

- Execution: SEED-20261044#story-automatic-entry-without-execute-button (`62a6a9011` first implementation commit after Take `ea6b2d173`)
  - Timestamp: 2026-10-29T17:08:29+08:00 · Tool: Cursor · Model: unknown · Open Dough release: 0.3.76
  - Evidence: commit `370f61f8c` (`tests/auto_trading_entry_authority_serialization_support.py` `sync_queued`; `pygardon/auto_trading/entry_write_lock.py`); CI observer `/tmp/dough-ci-501/watch-tP5dqG` event `000000000002.json`; plan learnings at before-cleanup `0849a8b4c` path `.planning/slice-plans/449-automatic-entry-without-execute-button/PLAN.md` slice 3
  - Observed effect: three overlapping-Sync serialization tests hang until the hang bound; slice 6 published without those cases in accepted proof
  - Inference: Execute-specific latency observation was copied onto Sync without a Sync-valid contention signal; proof selection followed the plan's listed globs rather than every rewritten Execute consumer

**Shared facet:** Selection omitted a rewritten consumer module. The repaired Execute-to-Sync observation seam and full local facet stay in ProjectFindings; count this execution once.

### Retained source evidence — pygardon / DD-395 (2026-11-01)

**Source mapping:** pygardon / DD-395 → ODF-150.

**Source recovery:** `ddb61fbcd4b54a217669d7f3d2e42ac21ace1a41:DearDough.md`.

After preparation and protection moved into `order_synchronization_loop`, the
longer owner wake held `db_lock` across broker work while opening-sale still
contacted the gateway before taking the same lock. Concurrent protection or
submission under the job wake deadlocked with opening-sale. Focused order-sync
phase proof did not drive that sibling interaction; CI and wake drivers also
needed EntryPreparation lifecycle and sibling-wake suspension repairs in the
same tip increment.

- Execution: SEED-20261064#story-sharadar-dependent-order-synchronization (plan at before-cleanup `97b18bb549734832baef6b1285a598d5f284a865:.planning/slice-plans/464-sharadar-dependent-order-synchronization/PLAN.md`; first implementation `d924ec4e69db0c3fb117d21b8c15258d586cd78b`)
  - Timestamp: 2026-10-31T08:37:37+08:00 · Tool: Cursor · Model: auto · Open Dough release: 0.3.78
  - Evidence: repair commit `117e9957b` (`pygardon_service/opening_sale_wake.py` takes write lock before gateway; `app.py` / generate path lazily ensures preparation; `tests/order_synchronization_wake_support.py` and related drivers suspend sibling wakes; PLAN CI-repair note after slices 8–12). Prior CI batch on tip after Jobs journey (`90730ee4c`) plus generate AttributeError at HEAD during repair triage (compaction segment_001/002).
  - Observed effect: one additional tip repair after slices 5–12 published; opening-sale lock order and preparation mount/lifecycle corrected without reopening done slices.
  - Inference: absorbing formerly independent wakes under one lock-holding reconcile owner must prove remaining sibling loops' lock/gateway ordering and any create_app lifecycle the absorbed path used to own; phase suites alone do not.

### Additional retained evidence — pygardon (2026-11-03)

**Source:** [pygardon / DearDough.md](https://github.com/terryyin/pygardon/blob/5193068c56557f9f794affba956c847a9c5620ab/DearDough.md).

Execution release 0.3.80 contains SEED-208's response; the indirect-consumer miss still reached CI. Counterevidence for current consumer-proof follow-through.

- Execution: SEED-20261070#story-measured-shared-test-infrastructure / `60b7a10a4066b0181e3c1ca1d62cac8b8a66a2b0:.planning/slice-plans/482-measured-shared-test-infrastructure/PLAN.md` / first implementation `b29437999`
  - Timestamp: 2026-11-02T08:26:00+07:00 · Tool: Cursor · Open Dough release: 0.3.80
  - Evidence: slice 4 publish `962f536a5` amortized `prepare("first")` into shared `selection` with focused proof only on `tests/test_durable_qualification.py`; implementer return disclosed “other selection consumers not re-run”; CI run `16c82c35-a7aa-47c2-b146-d533e4229678` failed on `test_qualification_execution_inputs` / `guest_admission` / `retention*` (`Attempt identity has conflicting inputs`); repair `596c6fa49` adapted those consumers
  - Observed effect: shared-fixture change shipped green on narrow durable proof, then CI caught indirect selection consumers; repair restored intended boundaries
  - Inference: proof followed the edited durable cases rather than the changed `selection` caller flow (ODF-150 shape); disclosed gap did not stop publication

### Retained evidence — Pygardon / DD-490 (2026-11-15)

**Source:** [Pygardon / DD-490](https://github.com/terryyin/pygardon/blob/4e9f1a43f8a9e91d0fc44644311f11a158d41236/DearDough.md#L661).

Related performance evidence: a broad fixture change reached an already-measured family outside the local proof selection. This is measurable consumer impact. It is distinct from a behavioral test failure and shares its execution with DD-491; combined frequency counts it once.

- Execution: SEED-20261102#faster-store-backed-python-checks
  - Timestamp: 2026-11-12, time of day not recorded (the day's slices ran between about 00:30 and 15:30 +08)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96
  - Evidence: `bc02191a4d0df42ca54a272ddcdfb902a1c126a2:.planning/slice-plans/515-faster-store-backed-python-checks/PLAN.md` (Learnings, Slice 2 in CI; slices 2 and 5); CI attempts `1c059490` (650.8 s for `tests/auto_trading`), `e8e3fd5b` (824.1 s), `7d6fb0f9` (666.6 s)
  - Observed effect: the regression was delivered, then found by reading the next attempt's per-family sums, and removed two slices later; three slices were delivered on top of it meanwhile.
  - Inference: comparing every already-measured family in the delivered revision's CI proof before starting the next slice would have caught it one slice earlier; the local sample could not, because it left out the family that paid.

### Retained evidence — Pygardon / DD-491 (2026-11-15)

**Source:** [Pygardon / DD-491](https://github.com/terryyin/pygardon/blob/4e9f1a43f8a9e91d0fc44644311f11a158d41236/DearDough.md#L675).

**Source mapping:** Pygardon / DD-491 → ODF-150. Both harness changes reached host-Docker consumers excluded from ordinary CI or focused proof. The deferred run found the missing behavior, a stale-row difference in the first execution and a stub-checkout impact in the second. Both faults were repaired before integration. The retained evidence identifies omitted or deferred consumer proof; exact trace commands are not retained.

- Execution: SEED-20261102#faster-store-backed-python-checks
  - Timestamp: 2026-11-12, time of day not recorded (the day's slices ran between about 00:30 and 15:30 +08)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96
  - Evidence: the same plan at `bc02191a4` (slice 13; Execution complete, third item); `0e30afa525a704c4330c127862f963692e6fb67c`
  - Observed effect: one defect reached the execution branch and was corrected before integration. The run that found it took about 40 minutes for 132 cases; the check-image cases under `tests/ci` could not run because `apt-get` refused the pinned snapshot repository, and four cases failed on engine free space, so that selection stayed partly unverified.
  - Inference: a plan whose change reaches every test should list the selections CI omits among its consumers and name their run in the slice that makes the change.

- Execution: SEED-20261105#host-docker-test-entry
  - Timestamp: 2026-11-13T01:03+08:00 (host-Docker run start; failures read about 02:12+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97
  - Evidence: plan `522-host-docker-test-entry` at `e3d44336f` (Learnings, slices 2 and 4); fix in `81894a8f1` (`copy_stub_check_source`)
  - Observed effect: slice 2 moved `tests/conftest.py` to the repository root and was accepted on `--setup-plan` equality and the ordinary suite; slice 4's serial `host_docker_tests` run found 11 CI fault cases failing because stub checkouts with a truncated recipe now loaded the root conftest. Fixed before integration.
  - Inference: the plan deliberately deferred the host-Docker run to its last slice and used `--setup-plan` as the interim proof; fixture equality cannot show what a conftest does inside a copied checkout.
