# Open Dough Project Findings

Project-owned retrospective findings: problems in how this repository builds,
tests, and proves Open Dough, rather than in the published Open Dough skills or
their release payload. General execution lessons and published-skill defects
remain in [DearDough.md](DearDough.md), which also keeps local-number
allocation (DD-NNN) and removed-finding recovery references. An occurrence in
this repository alone does not make a cause project-specific. Original finding
codes and occurrence evidence are retained.

Reviewed on 2026-09-27 against `7ebcb07c`. Frequency counts distinct
executions, not commands, retries, or repairs.

## Priority assessment

1. **Test-runner settings reaching what the runner starts (DD-114) — first.**
   Two executions on 2026-09-27 (plans 122 and 120): one red CI run, and one
   product guard whose test passed even with the guard removed. Both concrete
   leaks are repaired; nothing yet stops the next runner setting from leaking.
   Its generic facet, a consumer check that misses non-import consumers, is
   already published guidance tracked as ODF-003 and ODF-118 in
   [DearDough.md](DearDough.md); this file owns the runner's own design.
2. **Behavior audits that miss guidance-directed actions (DD-113) — low, not
   queued.** One execution; its missed merge was corrected by plan 121
   (`178e0346`), and no recurrence is recorded. A story would buy little until
   it recurs.

No other project-owned problem is supported, so only one story is queued.

Resolved and removed on 2026-09-27: ODF-060 (a new payload file published
without its declarations). `install.sh`'s `managed_files` is now the only
declaration, `tests/payload-declaration-links.sh` (`c7112a5`) catches an
undeclared linked file locally without installing, and the 17 payload files
added from 2026-09-26 through `40cb0bca` needed no declaration repair. Its
record is recoverable at `7ebcb07c:DearDough.md`.

ODF-096 (native acceptance fixtures that could not pass) was reviewed and left
in DearDough.md: its plan's rule came from published slice planning, and the
published planning-premise response covers it.

## Test-runner settings reaching what the runner starts (first priority)

**Follow-up:** queued, not resolved:
[Keep the test runner's own settings from reaching the checks it starts](.planning/seeds/SEED-051-isolate-test-runner-settings.md#isolate-runner-settings)
covers the split occurrence (plan 122). The plan 120 occurrence, a setting the
runner shares with every check on purpose reaching product code under test, is
not part of it: `23a3a759` repaired that case, and the general proof-design
concern stays with the published guidance tracked as ODF-003 and ODF-118.

### DD-114 — A new runner setting reached checks that start the runner; only CI's split jobs showed it

Slice 1 proved `OPEN_DOUGH_TEST_SPLIT` over substitute checks, but runner tests that start the runner themselves inherited the CI job's split and ran only a share of their own substitutes. The existing precedent that jobs do not inherit `OPEN_DOUGH_TEST_TIMES` was not applied to the new setting.

#### Occurrences

- Execution: `SEED-046#ci-verdict-round-2` / plan 122, first related implementation commit `a034dfd`
  - Timestamp: 2026-09-27T02:16:29Z (CI run 36287963592 `test (1/2)` failed)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac`
  - Evidence: run 36287963592 of `a2a3765`: five `tests/test-runner-*.sh` failures, e.g. `all.record names [alpha.sh delta.sh]`; repair `ceae01c` unsets the split after listing jobs and asserts no substitute inherits it.
  - Observed effect: one red CI run, two agents paused behind a repair stash, and a repair plus refactor pass (about 10 minutes).
  - Inference: Qualified. Slice 1's proof could have run the suite as each share (`OPEN_DOUGH_TEST_SPLIT=1/2 npm test`), which reproduced the failure locally during the repair.
- Execution: `SEED-048#explicit-test-environment` / plan 120, first related implementation commit `818907d`
  - Timestamp: 2026-09-27T10:00:37+08:00 (`818907d`, concurrent with plan 122's `ceae01c`, so not a recurrence after that repair)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown
  - Evidence: `818907d` made `scripts/test-environment.bash` export `user.useConfigOnly=true` through `GIT_CONFIG_COUNT` to every check. Product code started by `workspace-publication-startup-agent-credit.test.mjs` inherited it, so with `workspace-agent-authorship.mjs`'s own `-c user.useConfigOnly=true` guard removed the check still passed. Found by plan 120's retrospective mutation (correction plan 127, finding 1); repaired by `23a3a759`.
  - Observed effect: a product safeguard without effective proof until the retrospective; one correction slice.
  - Inference: Qualified, related mechanism. Here the runner gave a setting to checks on purpose, and it also reached the product code under test. Together with the split leak, each runner-level setting was repaired separately, and nothing states which settings may reach what the runner starts.

## Behavior audits that miss guidance-directed actions (low priority, not selected)

Open Dough's behavior is carried by both scripts and the skill guidance that
directs agents, so an audit of where a behavior happens has to cover both.

### DD-113 — The planning audit of commit paths missed commits made by following guidance

The planning audit listed only the scripts that create agent-authored commits. It missed the merge commit that guidance tells the agent to make in its owned workspace, so a scope promise went unplanned until the retrospective.

#### Occurrences

- Execution: `SEED-047#agent-and-developer-credit` / plan 119, first related implementation commit `01a3e2c`
  - Timestamp: 2026-09-27T07:47:40+08:00 (plan `e023a7f`)
  - Tool: Codex
  - Open Dough release: modified; revision 1b66466; base 0.3.41
  - Evidence: plan 119's PFE names the scripts that create commits (`--author` / `commit-tree`). `publish-the-candidate.md` "Preserve published history" and `product-backlog-git-merge.mjs` `commitAcceptedMerge` still make an agent-authored integration merge without the credit, as merge `199ae44` shows. Correction plan 121.
  - Observed effect: one follow-up correction story. Qualified inference: an audit that greps scripts for commit creation cannot see commits that guidance directs.

## Retention

- Moved from `DearDough.md` at `7ebcb07c`: ODF-060, DD-113, DD-114.
- Recovery: `7ebcb07c:DearDough.md` (ODF-060 before its resolved removal).
