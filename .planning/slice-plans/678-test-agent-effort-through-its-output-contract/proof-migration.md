# Proof migration

Working record for [the plan](PLAN.md). Add a row before deleting or merging
an existing case.

| Old file/test and protected fault | Surviving named example and assertion | Owning slice | Accepted proof |
| --- | --- | --- | --- |
| cursor-selection "ambiguous families list recoverable roots…" (G8: duplicate Cursor family silently chosen; unusable list) | Same test, kept; production `cursorEffortReport` type import replaced by `agentEffortSelection.ts` readers; adds readable list equality and exact public catalog keys | 1 | Slice 1 focused family |
| cursor-selection "names whole-family evidence when requested time boundaries are unprovable" (G9: Cursor window silently applied) | Same test, unchanged assertions on `appliedBoundary` nulls, gap and readable boundary | 1 | Slice 1 focused family |
| native-family "explicit retained family remains inspectable…" (G11: project filter drops explicit family) | Same test, unchanged | 1 | Slice 1 focused family |
| coverage "ambiguous story selection lists usable task ids…" (example 5 refusal; missing counters unavailable) | Kept for its missing-counter fault (slice 3); refusal/list/selection now also owned by selection "an exact story identity with several tasks is refused…" | 1/3 | Slice 1 focused family; slice 3 decides any merge |
| ownership both-host CLI cases (G1: later replies/workers ownership) | Unchanged; regrouping deferred because their assertions are cost figures read through slice-2 report readers | 1/2 | Slice 1 focused family |
| report "a selected launch reports coordinator and failed/cancelled workers once…" (example 1; 666 G1 replies/workers; read-only bytes) | Moved to `agent-effort-cost-report.spec.ts`, same name; JSON via `agentEffortCost.ts` `costReport`; readable surface now asserts `Combined known figures` input 140/output 13, `Selection` task/boundary, definition line and `contradictory-lineage` gap instead of label presence only | 2 | Slice 2 focused family |
| report "bounded Claude family counts streaming responses once…" (Claude disjoint input, 5m/1h lifetimes) | Moved to `agent-effort-cost-report.spec.ts`, unchanged assertions through `costReport` | 2 | Slice 2 focused family |
| ownership both-host CLI cases (666 G1 later replies/workers; next-task exclusion) | Moved to `agent-effort-cost-ownership.spec.ts`, unchanged assertions through `costReport` | 2 | Slice 2 focused family |
| cursor "belonging nested workers…" and "consistent known tool ids once…" (666 G7 replayed ids, G10 settings absence, G16 aliases) | Moved to `agent-effort-cost-cursor.spec.ts`, unchanged assertions through `cursorCost` | 2 | Slice 2 focused family |
| peaks, settings specs (666 G2/G5/G12 per-agent maxima, Codex inclusive input, requested vs observed settings, guidance) | Renamed `agent-effort-cost-peaks.spec.ts` / `agent-effort-cost-settings.spec.ts`, unchanged; still read through harness `report` (cwd-dependent guidance case) — type replacement remains with slice 3/4 (G2) | 2→3/4 | Slice 2 focused family |
| native-family "explicit retained family remains inspectable…" (666 G11) | Merged unchanged into `agent-effort-selection.spec.ts` (how selections resolve), read through `costReport` | 2 | Slice 2 focused family |
