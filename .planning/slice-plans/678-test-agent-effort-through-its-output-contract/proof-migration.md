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
