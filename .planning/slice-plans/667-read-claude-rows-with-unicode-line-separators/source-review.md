# Source review

Launched 2026-11-16 as a fresh general-purpose agent without conversation
inheritance, given only the selected story's Goal, Scope and Key examples from
[SEED-388#read-claude-rows-with-unicode-line-separators](../../seeds/SEED-388-measure-and-control-agent-launch-cost.md#read-claude-rows-with-unicode-line-separators),
with the source-only reviewer instructions. It read no project files.

Unnumbered context: today's cause (`readline` treats U+2028/U+2029 as line
ends); the reason (last known Claude Code reader gap before the comparable-run
measure); "Refresh rereads only sessions that changed" explains recovery
through import; automatic repair of stored history is excluded; SEED-124's
12.74M vs 15.42M and 82 of 434 missing are the baseline for 9 and 10.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Claude Code row with a raw separator is read whole and its response counted, no `malformed-native-row` gap for that file (Goal; Scope 1; Key example 1) | slice 1 | observed: dashboard/backend-tests/usage-history/native-line-separators.spec.ts "counts a Claude Code row whose text holds line separators…": assistant text with U+2028+U+2029 → import → launch task requests 2, output 24; only malformed-native-row is the appended truncated row (fails on readline reader) |
| 2 | Later rows whose parent link runs through that row reach their launch (Goal; Key example 1) | slice 1 | observed: dashboard/backend-tests/usage-history/native-line-separators.spec.ts same case: 'climbing' assistant parented to the separator row is counted in the launch task (requests 2) |
| 3 | Codex row with a raw U+2029 is read whole, with no gap (Scope 1; Key example 2) | slice 1 | observed: dashboard/backend-tests/usage-history/native-line-separators.spec.ts "counts a Codex rollout whose row text holds a paragraph separator": developer input with U+2029 → import → response counted (requests 1), no malformed-native-row (fails on readline reader) |
| 4 | Refresh reads separator rows whole, the same as import (Scope 1) | slice 1 | observed: dashboard/backend-tests/usage-history/token-index-refresh-line-separators.spec.ts: separator transcript first read by Refresh → launch task requests 2, no malformed-native-row (readline reader gives 0) |
| 5 | A gap's line number is the file's line (Scope 1) | slice 1 | observed: dashboard/backend-tests/usage-history/native-line-separators.spec.ts Claude case: the truncated row's gap carries line = the file's newline-counted line after a row holding two separators |
| 6 | A row still invalid JSON stays one `malformed-native-row` gap at its own line; earlier responses still counted (Scope 2; Key example 3) | slice 1 | observed: dashboard/backend-tests/usage-history/native-line-separators.spec.ts Claude case: appended truncated last row is exactly one malformed-native-row at its own line while earlier responses count; codex-coverage.spec.ts damaged-files case green in the usage-history run (106 passed) |
| 7 | The reader stays bounded in memory: no whole-file read (Scope 2) | slice 1 | observed: dashboard/server/nativeUsageFiles.ts jsonLines: frames streamed chunks at 0x0A, holding only the pending partial row; no whole-file read |
| 8 | Existing stores gain the responses on their next `import` (Scope 3) | slice 1 | observed: real-store import 2026-11-16 20:38–20:55 (caffeinate -s -i, AC, --since 2026-09-16+08): store responses 538,550 → 539,892; session 6410f8b0 353 → 435; 1,146 launches all kept (1,150 after) |
| 9 | One real-store import gives SEED-124's launch all its responses (Key example 4; Goal) | slice 1 | observed: same import, deriveUsageTaskSummary on ~/.open-dough store: SEED-124#save-pronunciations-as-note-properties execution launch 353 → 435 responses, task gaps [] |
| 10 | SEED-124's launch cost matches its 15.42M transcript cost (Key example 4; Goal) | slice 1 | observed: same summary, tokenIndex with the Claude tariff: execution launch 12.74M → 15.42M; refinement launch unchanged 6.16M |
