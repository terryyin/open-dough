# Slice 2 inventory (Claude group)

Starting size for this group (before edits): 6 specs, 1,117 lines, 11 tests
as Playwright lists them. No overlapping cases merged: each starting test
observes a distinct product rule (or a distinct setup for the same named
concern, such as completion counting versus enrichment replay). The long-chain
memory case stays its own file. Grouping after migration: same six specs.

| Starting test | Distinct behaviors (as assertions observe) | Surviving test |
| --- | --- | --- |
| `claude-usage`: imports retained Claude root and explicitly joined worker messages once across streaming updates and resumed tasks | Streamed updates of one message count once (`msg-root` / `lastAt`); worker under `subagents/` charged to root via agent-result join; changed observed settings on later root message; later human task → `unresolved-task-association`; private content stripped; import idempotence; history survives native-root removal | `claude-usage`: same title (key example 25.1–25.3) |
| `claude-coverage`: keeps explicit resumed launch boundaries separate, permits evidenced follow-up, and retains conflicting messages without double charge | Two launches in one session charge separately; follow-up on first reference stays with first; collector replay does not raise totals; contradictory stream measurements null output and keep both; contradictory task lineage nulls association | `claude-coverage`: same title |
| `claude-coverage`: retains independent partial workers and reports missing transcripts and unsupported API identities honestly | Missing worker → `missing-worker-evidence`; orphan outside `subagents/` → `unjoined-worker-evidence`; request-only assistant → `unsupported-response-identity`; task uncharged / `no-attributable-response-usage`; private orphan prompt stripped | `claude-coverage`: same title |
| `claude-completion`: counts explicit terminal output once, even before a later progressive snapshot, without completing the task | Terminal `stop_reason` wins over earlier/later progress; reasoning from terminal; task not completed; private response text stripped | `claude-completion`: same title |
| `claude-completion`: keeps incomplete progress and competing terminal or unclassified evidence unknown while preserving legacy counters | Progress-only → `incomplete-output`; missing terminal output; legacy omit-stop keeps counters; conflicting/unknown/unsupported competes → `contradictory-measurements` | `claude-completion`: same title |
| `claude-completion-replay`: enriches existing raw measurements in place and keeps terminal evidence across replay, collector overlap and source removal | Legacy conflict enriches in place when stop reasons appear; measurement bodies stable aside from completion; collector overlap adds sources; survives source removal | `claude-completion-replay`: same title |
| `claude-completion-replay`: retains unavailable legacy conflicts and changed numeric evidence on the same native row | Dropped unavailable row + changed terminal keep all reported outputs and contradiction | `claude-completion-replay`: same title |
| `claude-lineage-size`: imports a long Claude parent chain within bounded memory and retains one response charge with its provenance | 1500-row parent chain under `--max-old-space-size=128`; all charged to launch; provenance line numbers; private assignment stripped | `claude-lineage-size`: same title (distinct survivor **29**) |
| `returned-outcome`: keeps a matching returned-to-backlog receipt distinct from ordinary reports and ignores a stale marker | Retained return disposition; stale operational marker ignored; attention flag; private message stripped; store bytes unchanged; idempotent | `returned-outcome`: same title |
| `returned-outcome`: enriches a native report with matching retained return evidence without inventing a conflicting outcome | Native complete then retained return enriches disposition without contradiction | `returned-outcome`: same title |
| `returned-outcome`: retains conflicting report kind and time as evidence instead of selecting the newest report | Complete vs unfinished → null outcome, both claims kept | `returned-outcome`: same title |

No scratch-break: no behavior moved onto materially different setup.

## Slice 2 concision (Claude group)

| Metric | Before | After |
| --- | --- | --- |
| Spec files | 6 | 6 |
| Lines (`wc -l`) | 1,117 | 1,117 (builder chains; net readability via `makeMe.aClaudeTranscript`) |
| Tests (Playwright list) | 11 | 11 |
| `at` imports from harness in group | 6 specs | none (cases use `usageHistoryDefaultAt` when asserting time) |
| `nativeFile(` in group | many | 2, both layout under proof (`subagents/`, orphan `workers/`) |

Family after slice 2 focused run: **46 passed**.
