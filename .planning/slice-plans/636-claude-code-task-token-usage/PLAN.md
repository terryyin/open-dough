# View token usage for dashboard-launched Claude Code tasks

**Identity:** SEED-359#view-claude-code-task-token-usage
**Source:** [View token usage for dashboard-launched Claude Code tasks](../../seeds/SEED-359-claude-code-task-token-usage.md#view-claude-code-task-token-usage)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Add a Claude Code cohort to System settings → Usage that follows every rule of
the delivered Codex cohort, weighted by a versioned Claude tariff that prices
five-minute and one-hour cache writes separately, and kept current by Refresh.
The source owns the final behavior and examples. Terry chose on 2026-11-15 to
defer a per-category token breakdown for both tools, and to show the
auxiliary-work limit as one cohort note instead of marking every task partial.

Exclude live in-progress usage, scheduled refresh, billing reconciliation,
OpenTelemetry, Cursor, a category breakdown, and new history recovery: the
offline import already holds 633 of 646 Claude dashboard launch tasks.
Preparation authorizes no execution.

## Existing solution and architecture

PFE found every part needed and no second reader. The importer's Claude reader
(`claudeUsage.ts`, `claudeUsageCounters.ts`, `claudeUsageLineage.ts`) already
reads root and worker transcripts, counts each message ID once, records the
five-minute/one-hour cache-write split per response, and assigns responses to
launch tasks. The Usage pipeline (`SystemSettingsUsage` → `usageTokenIndex.ts`
→ `usageBoundary` → `tokenIndexCohort` → `tokenIndex`) is tool-agnostic except
at four Codex-only points: the summary keeps `host === "codex"` tasks
(`usageTaskSummary.ts`), the boundary passes `codexTariff`, the cohort type and
Tool filter offer only `"codex"`, and Refresh (`usageRefresh.ts`) reads only
Codex rollouts. Remove those four restrictions; add no parallel Claude
pipeline.

Two consequential gaps carry through the store. Session contribution entries
(`usageContributions.ts`) sum only total `cacheWrite`, so the split is lost;
and the Claude reader keeps no `speed`. Contribution entries gain the
five-minute and one-hour counters beside the total (`null` when a response
lacks the split, as the counters already report), and the Claude reader keeps
`message.usage.speed` as the response's service tier, as Codex keeps its tier.
The Token index prices a cache write by its split when the tariff has split
rates; a Claude entry whose writes are not fully split is unpriced. The Codex
tariff keeps pricing writes at the input rate, unchanged.

The Claude tariff is source data beside the Codex one in `usageTariffs.ts`:
Anthropic API list prices read on the execution day, standard speed
(`recorded: ["standard"]`), reference Claude Opus 5.5. It covers every model
observed in dashboard Claude usage (Opus 5.5, Fable 5.2, Fable 5.1, Sonnet 5.5,
Haiku 5.5, Opus 4.8); `<synthetic>` entries carry zero tokens and need a rate
of zero, not an unpriced task. Haiku 5.5's long-prompt price tier is not
recorded per response, so price it at its base tier and say so in the tariff's
source note (one observed response). The prices skill gives Opus 5.5 4/20,
cache read 0.20, Fable 5.2 8/40, read 0.20; writes are 1.25× (five-minute) and
2× (one-hour) input. Execution reads the remaining cache-read rates from the
rate card, not from memory.

Refresh reads Claude transcripts under `<home>/.claude/projects` like Codex
rollouts: every file of each session one of whose files (root
`<session>.jsonl` or `<session>/subagents/agent-*.jsonl`) changed since the
check, then keeps only known tasks' sessions and their gaps, and writes
through the same batch writer, which replaces each read session's
contribution. Generalize the Codex-specific reading in `usageRefresh.ts` into
one per-host reading step rather than a second Refresh.

Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one representation per concept),
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(derived presentation over recorded evidence, no database),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(native validation on real transcripts, slice 5) and
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
(an observation, not an improvement claim). No conflict found; no North Star
topic is needed.

**Coordination.** [SEED-369's plan](../634-recent-token-usage/PLAN.md) is
Taken and edits the same Usage view, wire types, filters and cohort. The two
stories have independent outcomes; execution starts from fetched trunk and
rebases over whatever of 634 has landed, keeping both stories' proofs green.

## Proof ownership

| Source promise | Owning slice and observable proof |
| --- | --- |
| Split cache writes survive into stored history; speed recorded | 1: Backend import of a Claude transcript with both write kinds and `speed` stores per-entry five-minute/one-hour counts and tier; Codex contributions and task totals unchanged (existing session-contribution specs). |
| Cohort, filters, worker rates, tariff label; examples 1, 6 | 2: Backend cohort over a Claude store (Fable root, Haiku worker) gives independently computed indices; Frontend/E2E choose Claude Code, see the Claude tariff label and points; choosing Codex shows the unchanged Codex answer. |
| Cache-write mix; example 2 | 2: Backend two equal-token Opus 5.5 tasks, one-hour vs five-minute writes → expected indices differ by the write-rate difference. |
| Unpriced model, fast speed, unsplit writes; example 5 | 2: Backend tasks with an unknown model, `speed: "fast"`, and a contribution without split are unpriced and counted in the note. |
| Partial Claude gaps and auxiliary note; example 4 | 3: Backend missing root transcript makes a task partial with that gap, out of the average; Frontend detail names the gap; the Claude Code cohort shows the background-work note and Codex does not. |
| Refresh brings Claude usage once; example 3 | 4: Backend Refresh after a new Claude launch with a worker adds its point; a repeated unchanged Refresh leaves store bytes unchanged; a duplicated transcript response counts once; E2E Refresh with a Claude transcript shows the new point and the tool-neutral checking text. |
| Real history priced; native validation | 5: on this machine, after backing up `usage.json`, the offline import fills the split; the real dashboard's Claude Code cohort shows priced points, and Refresh adds today's launches. |

During implementation generate the installed
[consumer-trace record](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
from the actual diff. Known consumers to account for: the contribution entry
shape (`usageContributions.ts`, `usageTaskSummary.ts`, earlier-store
conversion, repeated-check byte stability), the `TokenIndexCohort.tool` type
and URL query (`usageTokenIndex.ts`, `UsageFilters`, page objects), the
checking text (`SystemSettingsUsage`, E2E Refresh case), and
`usageCoverageGaps` (detail wording).

## Ordered slices

Each slice targets 15 active minutes, including proof and cleanup.

### 1. Keep the cache-write split and speed in stored Claude usage
Type: Structure
Status: done
Proof: Backend `usage-history/claude-usage`, `session-contributions`,
`repeated-checks`, `earlier-store-conversion` and `token-index` specs; a new
case imports a transcript with five-minute and one-hour writes and
`speed: "standard"` and reads both counters and the tier from the stored
entry.

Contribution entries add the two write counters, summed like the others and
`null`-propagating like `missing`; the Claude reader records speed as the
response's service tier, which then groups entries as Codex's tier does. No
Usage output changes: Codex has no split and keeps its totals. Enables
slice 2's Claude pricing. An earlier store's entries without the counters read
as unsplit.

Delivered: entries carry `tokens.cacheWrite5m` and `tokens.cacheWrite1h` beside
`cacheWrite` only while every summed response reported the split; an unsplit
entry (Codex, an earlier store, a response without `cache_creation`) omits
both keys rather than storing `null`, so Codex and earlier entries stay
byte-identical. Slice 2 reads an absent key as unsplit. Claude `speed` is the
entry's `tier`. Proof: `claude-usage-split.spec.ts` plus the whole backend
`usage-history` folder (79 passed) and the dashboard typecheck.

### 2. Choose Claude Code and read its Token index
Type: Behavior
Status: done
Proof: Source examples 1, 2, 5, 6; Backend cohort/eligibility cases with
independently computed figures; Frontend `system-settings-usage` and E2E
`configuration/system-settings-usage.spec.ts` choose Claude Code from an
imported Claude transcript store.

Behavior: a store with finished Claude dashboard launches → choose Tool
Claude Code → their points, average and detail appear under the named Claude
tariff, workers weighted at their own models; switching back to Codex shows
the Codex answer unchanged. The summary keeps dashboard tasks of both hosts;
the cohort selects the tool's host; the boundary selects the tool's tariff.
Model options keep the tool's observed models. Switching tool keeps the
workflow and resets a model/effort the new tool does not offer.

Delivered: tools are host ids (`?tool=codex|claude`, default Codex, unknown
refused); the summary (format v5) keeps both hosts' dashboard tasks and the
cache-write split; the cohort keeps `task.host === tool`; the boundary uses
`usageTariffs[tool]`. Tariff `claude-2026-11-15` holds the list prices read
that day with split write rates; a group with writes but no complete split is
unpriced, a zero-write group needs none, `<synthetic>` is zero-rated. Proof:
backend `token-index-claude*.spec.ts` (85 in `usage-history`), frontend
`system-settings-usage-tool.spec.ts` (16), E2E
`configuration/system-settings-usage-tools.spec.ts` (4), typecheck. Learning:
a controlled select whose value matches no option shows the first one, so a
reset check needs a route answer that offers only the tool's real models.

### 3. Show Claude coverage honestly
Type: Behavior
Status: planned
Proof: Source example 4; Backend coverage case with a missing root
transcript and one with only `auxiliary-usage-not-covered`; Frontend detail
wording and the cohort note.

Behavior: a Claude launch with a missing root transcript → partial mark, the
gap named in detail, out of the average; a launch with only the auxiliary
limit stays measured, and the Claude Code cohort shows one note that
background agent-view summaries, recaps and idle compaction are not included.
Codex shows no such note.

### 4. Refresh brings in new Claude usage
Type: Behavior
Status: planned
Proof: Source example 3; Backend `token-index-refresh` new cases (new Claude
launch with a worker, repeated unchanged Refresh byte-stable, duplicate
transcript response once, unrelated Claude session ignored); E2E Refresh case
writes a Claude transcript through `writeClaudeSession` and sees the new point;
existing Codex Refresh cases stay green.

Behavior: a Claude launch finishes after the last check → Refresh → its root
and worker usage appear; Refresh again changes nothing. The checking
indication reads "Checking for new usage…" for both tools. Update the Refresh
description in `dashboard/USAGE-HISTORY.md` (250 lines now): reword the
Codex-only sentences in place, or move the Usage-view paragraph to the Token
index document SEED-369 adds if it has landed, keeping both files within the
size check.

### 5. Price this machine's Claude history and validate natively
Type: Behavior
Status: planned
Proof: Retained run record in this plan: backup path, import command and its
report counts, the real dashboard's Claude Code cohort (priced, partial and
unpriced counts) before and after, and one Refresh adding today's launches.

Behavior: Terry's real store holds Claude contributions without the split →
back up `~/.open-dough/dashboard/launch-history/usage.json`, run
`node dashboard/server/importUsageHistory.ts import --since '2026-09-16T00:00:00+08:00'`
from the landed revision with the `.node-version` Node → the dashboard's
Claude Code cohort shows priced points for retained launches; launches whose
transcripts are gone stay unpriced and are counted. Compare one finished
session's index with its transcript's last `cost-state` USD total as a sanity
check of the tariff (a control total, not a product feature); a mismatch is a
tariff defect to fix before closing. This slice changes the developer's own
local store only, after the backup, through the documented importer.

## Local gates and execution discipline

Apply the linked [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Execution uses [Dough Execute Plan](../../../.agents/skills/dough-execute-plan/SKILL.md)
with independent post-change refactoring, affected proof, delivery and CI
observation; this preparation starts none of them.

Focused commands:

- `npm run test:dashboard:backend -- usage-history/token-index usage-history/claude usage-history/session-contribution usage-history/repeated-checks usage-history/earlier-store`
- `npm run test:dashboard:frontend -- system-settings-usage`
- `npm run test:e2e -- configuration/system-settings-usage.spec.ts`
- `npm run typecheck:dashboard`; selective formatting and precommit hooks.

Run Playwright with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`
and `--reporter=list`. Per [AGENTS.md](../../../AGENTS.md), keep default
timeouts, never use `test.slow()`, and apply MakeMe and page-object selection
before test edits; reuse `importHarness.ts` (`writeClaudeSession`) and the
existing Usage page objects.

The local-gate sleep guard is [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC wrap long or full runs in `caffeinate -s -i`. Load was
10–15 during preparation; inspect load before broad runs.

Expected edited files and sizes: `usageContributions.ts` 208,
`claudeUsageLineage.ts` 216 (likely untouched), `usageTaskSummary.ts` 157,
`usageRefresh.ts` 146, `claudeUsage.ts` 116, `usageTariffs.ts` 62,
`tokenIndex.ts` 42, `tokenIndexCohort.ts` 88, `usageBoundary.ts` 78,
`usageTaskGaps.ts` 82, `src/usageTokenIndex.ts` 151, `UsageFilters.tsx` 111,
`SystemSettingsUsage.tsx` 133, `UsageTaskDetail.tsx` 135. If `usageRefresh.ts`
grows past the size check when generalized, split the per-host file selection
(Codex rollouts by thread, Claude transcripts by session) into its own module.
`USAGE-HISTORY.md` and `README.md` are at 250 lines: slice 4 owns any
reorganization.

## Premises, observations and concerns

Observed in this checkout on 2026-11-15 at `baffb006077e01d09f7393ac7bbda0ee20c48923`,
with the integration checkout's `node_modules` linked read-only (same lockfile)
and removed afterwards. No product edits were made.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| The Usage route and Refresh are Codex-only at four points | Read `usageTaskSummary.ts:120` (`host !== "codex"`), `usageBoundary.ts` (`codexTariff`), `UsageFilters.tsx` (one Codex choice), `usageRefresh.ts` (Codex rollouts only). Real store: 646 Claude dashboard tasks, 633 with usage, latest Claude response 2026-11-14T17:00Z; today's five Claude launches have none although Refresh ran at 08:21Z. | — |
| Existing usage proofs are runnable here | `npx playwright test --config dashboard/backend.playwright.config.ts --reporter=list usage-history/token-index usage-history/claude-usage usage-history/session-contributions`: 14 passed. | Frontend/E2E Usage specs not run in preparation; slices 2–4 run them. |
| The importer's Claude reader, run on one session's files, assigns as the full import does | Scratch script (job tmp) ran `claudeUsage` + `claudeAssociation` with `launchCatalog` tasks on session `92cad1b7…` (17 files): 1,320 responses, 261 root + 1,059 worker, all to its launch task — identical to the store's 1,320 from the full import. On today's `2de30615…`: 501 assigned; 133 from 07:02Z onward unassigned, a later turn, matching the rule that later activity of another task stays out. | Slice 4 proves the Refresh wiring with fixtures. |
| Every Claude response records the cache-write split, consistent with its total | Scan of 3,444 transcripts under `~/.claude/projects`: 272,341 responses, all with `cache_creation`, zero mismatches; 546.2M five-minute vs 394.2M one-hour write tokens. | — |
| Contribution entries drop the split | Real `usage.json` session entries hold `uncachedInput, cacheRead, cacheWrite, output` only. | Slice 1. |
| Claude speed is recorded but not read | `grep` over transcripts: 272,326 `"speed":"standard"`, no other value; probe observations had no `serviceTier`. | Slice 1. |
| Transcripts are current while a task runs | This session's transcript mtime and last row timestamp were within 4 s of `date -u`. | — |
| `auxiliary-usage-not-covered` does not currently make tasks partial | `usageCoverageGaps` in `src/usageTokenIndex.ts` omits it; `missing-root-transcript-usage` is also omitted. | Slice 3 adds the root-transcript gap. |

Concerns: none blocking. The `cost-state` comparison in slice 5 is a sanity
check whose mismatch would send execution back to the tariff, not a premise
this plan relies on. Plan refinement was not needed: five slices, one
preparatory Structure immediately before the Behavior it enables, each
Behavior with its own proof loop, and one common rule (tool → host → tariff)
rather than Claude special cases.
