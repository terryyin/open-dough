# Source-only review

Launch: collaboration agent `/root/source_review`, fresh context (`fork_turns: none`). Input: only the selected story's title, identity, Goal and Scope as recorded in SEED-388, with instructions to read no files, change nothing, and enumerate independently observable promises. The launch and actual return are retained in this execution conversation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Reader gaps name their host. Applies to Codex and Claude Code. Source: "Reader gaps name their host, so import and Refresh replace them with the gaps a reread still reports, on Codex and Claude Code alike." | slice 1 | observed: native-reader-gaps.spec.ts initial reported assertion: both reader codes, hosts and operations persist host/source |
| 2 | Import rereading a session replaces its reader gaps with those the reread still reports. Applies to Codex and Claude Code. Source: "Reader gaps name their host, so import and Refresh replace them with the gaps a reread still reports, on Codex and Claude Code alike." Repeated outcome: "A maintainer reading the Usage store sees only the reader gaps a session's native files still have." | slice 1 | observed: native-reader-gaps.spec.ts Import cases: repeated damage retained once; repaired file removes hosted gap and contributes response |
| 3 | Refresh rereading a session replaces its reader gaps with those the reread still reports. Applies to Codex and Claude Code. Source: "Reader gaps name their host, so import and Refresh replace them with the gaps a reread still reports, on Codex and Claude Code alike." Repeated outcome: "A maintainer reading the Usage store sees only the reader gaps a session's native files still have." | slice 1 | observed: native-reader-gaps.spec.ts Refresh cases through POST /__usage/refresh: repaired hosted gap gone and restored response counted |
| 4 | Already stored gaps without a host remain unchanged. Source: "Gaps already stored without a host stay as they are: automatic repair of stored history stays excluded." | slice 1 | observed: native-reader-gaps.spec.ts all eight cases retain exact legacy hostless gap after rereads of same session; gapSessionKeys absent-host branch unchanged |

Unnumbered reviewer context: The baseline identifies "malformed-native-row and native-source-unreadable gaps" as lacking a host. The example is "a live transcript's half-written last row, seen once by Refresh," whose gap currently persists "after the row completes." This illustrates the replacement outcome above. The source identifies this work as a correction of SEED-388#read-claude-rows-with-unicode-line-separators.
