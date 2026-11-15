## Slice 3 inventory (recovered-assignment group)

Starting size for this group (before edits): 6 specs, 589 lines, 8 tests
as Playwright lists them (including the parameterized legacy/paged evidence
pair as two). No overlapping eligibility-rule cases merged: each starting
test observes a distinct product rule under a non-equivalent setup
(wrapper withdrawal vs genuine correction vs launch-backed eligibility vs
legacy association survival vs atomic publication). Grouping after
migration: same six specs. `aCodexRollout.withCwd` added for project-join
session meta used by evidence and mixed.

| Starting test | Distinct behaviors (as assertions observe) | Surviving test |
| --- | --- | --- |
| `recovered-assignment-evidence` (legacy + paged): wrapper correction withdraws old charges while preserving every observation and candidate | Wrapper-only rescan → `unsupported-task-assignment` + `task-start-unknown`; charges withdrawn; observations/candidates retained; independent title claims kept; private content stripped; idempotent; legacy wire and paged migration both covered | same titles (parameterized) |
| `recovered-assignment-legacy`: legacy effective association without candidates survives beside a rejected task when neither response is rescanned | Effective-only association rebuilt with candidates; sibling rejected task uncharged; observations unchanged when valid file removed | same title |
| `recovered-assignment-legacy`: independent retained assignment sources preserve eligibility when their native row disappears | Dual field sources kept; `launchedAt` cleared without `unsupported-task-assignment`; usage still charged; associations survive native-root removal | same title |
| `recovered-assignment-mixed`: wrapper followed by genuine mixed content corrects the same old task start | Rejected wrapper + supported genuine evidence; `launchedAt` and workflow/effort from genuine; private content stripped | same title |
| `recovered-assignment-publication`: failed correction publication leaves prior assignment readable before a successful retry | Injected `usage.json` rename failure; prior history unchanged; retry clears launch and records unsupported gap | same title |
| `recovered-assignment-replay`: rejected assignment survives missing inputs, later genuine assignment restores eligibility and launch timing stays authoritative | Wrapper rejection with zero charges; history survives missing root; genuine restores eligibility; operational launch time wins; store bytes unchanged; survives root removal | same title |
| `recovered-assignment-retained`: retained launch is eligible despite wrapper rejection and unavailable sources never reject independent legacy starts | Launch-backed task stays eligible with rejected evidence and charged usage; independent unavailable-source task keeps `launchedAt` without unsupported gap; rerun reports zero unsupported | same title |

No scratch-break: no behavior moved onto materially different setup.

### Slice 3 concision (recovered-assignment group)

| Metric | Before | After |
| --- | --- | --- |
| Spec files | 6 | 6 |
| Lines (`wc -l`) | 589 | 608 (builder chains; wrappers/genuine inputs stay literal) |
| Tests (Playwright list) | 8 | 8 |
| `at` imports from harness in group | 4 specs | none (cases use `usageHistoryDefaultAt` when asserting time) |
| `nativeFile(` in group | many | none (`writeCodexSession` only; no layout-under-proof cases) |
| `meta`/`context`/`response` helpers in group | yes | none |

Family after slice 3 focused run: **46 passed**.
