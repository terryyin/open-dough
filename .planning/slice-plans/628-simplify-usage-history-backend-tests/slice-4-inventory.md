## Slice 4 inventory (recovered and historical task group)

Starting size for this group (before edits): 7 specs, 1,314 lines, 10 tests
as Playwright lists them. Consolidation (**28**): only the equivalent Codex
`recordHistoricalTask` pair consolidates — `historical-task-context` replay
folds into `historical-task-references` (named survivor). Distinct replay stays
on `recovered-tasks` (deleted-story Git recovery) and `historical-tasks` (Claude
multi-turn Git reads); those setups are not equivalent to the survivor.
`recovered-tasks` also keeps native-root survival without re-import;
`historical-task-references` keeps re-import after root and repository removal.
Grouping after migration: same seven specs. `aCodexRollout.withGit` and
`aClaudeTranscript.withCwd` added; `recordHistoricalTask` builds through the
Codex builder.

| Starting test | Distinct behaviors (as assertions observe) | Surviving test |
| --- | --- | --- |
| `recovered-tasks`: recovers pruned native task facts from historical deleted stories without copying private input or mutating workflow | Recovered kind/project/workflow/identity/title from deleted seed+plan at recorded revision; charged usage; fieldSources include git seed and plan; private prompt stripped; workflow/git/backlog/projects untouched; import idempotence on this deleted-story setup; history survives native-root removal without re-import | same title (distinct replay kept; not folded into **28**) |
| `recovered-boundaries`: keeps successive native tasks distinct and enriches the same task with later retained corroboration | Two turns → distinct tasks; requested settings + observed model/effort; native origin on second; later retained launch → kind launch, title/identity; store bytes unchanged; charges unchanged | same title |
| `recovered-boundaries`: leaves incidental examples and contradictory project joins unknown and excludes a positively unrelated project | Fenced example directives → null workflow/identity; unrelated repository_url excluded from observations; one charged task remains | same title |
| `recovered-corroboration`: joins later Claude retained timestamp identity to one recovered task and preserves facts after source removal | Native Claude reporting context → dashboard origin; later retained launch enriches title/identity/workflow; charges once; survives Claude-root removal on re-import | same title |
| `recovered-corroboration`: retains contradictory historical facts and reporting project joins without selecting a current title | Conflicting revision titles/identities → null fields + contradictory gaps and claims; wrong reporting project → null project + `contradictory-project-evidence`; conflict task uncharged | same title |
| `recovered-gaps`: uses recorded repository evidence for a deleted worktree and leaves unavailable revisions and unknown projects honest | Deleted cwd + repository_url → historical title at recorded revision; out-of-window root response excluded; worker `root_turn_id` charged; missing objects → `unresolved-historical-story`; unknown cwd → `unresolved-project` + `task-start-unknown` | same title |
| `historical-tasks`: recovers Claude historical renamed seed, backlog and completion facts from recorded Git reads with separate report outcomes | Renamed seed title at activity revision; done catalog title + reported-incomplete outcome; backlog title; git fieldSources; private report stripped; Claude import idempotence on this multi-turn Git-read setup | same title (distinct Claude replay kept) |
| `historical-task-references`: resolves only the unique numbered historical plan and retains pinned source facts through replay and source removal | Unique `50` → identity/title/sources; duplicate/missing/fenced unresolved; private prompt stripped; import idempotence; re-import after native+repo removal keeps facts and reports `native-source-unavailable` | same title (**28** survivor: holds replay formerly also on `historical-task-context`) |
| `historical-task-context`: uses only same-message labelled established identity and keeps conflicting explicit references unresolved with claims | Established/preparation/agreeing/longerCloser/surrounding resolve; conflicting/unavailable/fenced/injected/incidental stay null; conflicting claims kept; injected stays supported workflow | same title (replay folded into `historical-task-references` **28**) |
| `historical-task-context`: later argumentless workflow does not inherit prior established intent or incidental orchestration reads | Prior established identity retained; later bare `$dough-execute-plan` + incidental cat reads → null identity/title | same title |

No scratch-break: the only moved replay (`historical-task-context` →
`historical-task-references`) stays on the equivalent `recordHistoricalTask`
Codex harness. Distinct replays on `recovered-tasks` and `historical-tasks`
were not moved.

### Slice 4 concision (recovered and historical task group)

| Metric | Before | After |
| --- | --- | --- |
| Spec files | 7 | 7 |
| Lines (`wc -l`) | 1,314 | 1,265 |
| Tests (Playwright list) | 10 | 10 |
| `at` imports from harness in group | yes | none (cases use `usageHistoryDefaultAt` when asserting time) |
| `nativeFile(` in group | many | none (`writeCodexSession` / `writeClaudeSession` / `recordHistoricalTask` only) |
| `meta`/`context`/`response` helpers in group | yes | none |

Family after slice 4 focused run: **46 passed**.
