# Correct stale token totals for completed Dashboard tasks

**Identity:** SEED-422#correct-stale-token-totals
**Source:** [Correct stale token totals for completed Dashboard tasks](../../seeds/SEED-422-correct-stale-dashboard-token-totals.md#correct-stale-token-totals)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer reading the Usage trend sees, after Refresh, each finished
Dashboard task's full attributable Codex or Claude Code usage, and a rolling
median built only from complete totals. Included: Refresh attributes a
launch's turns after a developer reply for both hosts, a finished task whose
usage was last read before it ended shows provisional and stays out of the
median, and the production usage history is repaired and reconciled.

Excluded: the index formula, tariffs, cohort filters and median window;
recovering tasks from native evidence alone during Refresh (a typed workflow's
own task stays with the offline import); evidence no longer on disk, which
stays partial.

## Current decisions

- **Root cause.** The product rule already exists in
  [`token-index-developer-reply.spec.ts`](../../../dashboard/backend-tests/usage-history/token-index-developer-reply.spec.ts):
  a launch's index includes the turns after a developer reply in its session
  until an input starts another task. Only the offline import applies it. The
  import passes a native task sink to `claudeUsage`/`codexUsage` and derives
  the turns each task claims (`usageScan.ts` → `recoveredUsageTasks`).
  [Refresh](../../../dashboard/server/usageRefresh.ts) passes no sink, so a
  task keeps only the turns it held at the last import. A reply turn's
  responses get no association, `collectContributions` skips them, and the
  task stays `measured`. Refresh replaces the session's contribution with
  that reading, and the check time then moves past it. SEED-404's execution
  session `47460e10-…` stopped at 28 responses this way when the developer
  typed `Resume` at 16:43:27Z on 2026-11-18. The 832 later responses
  resolved to `unresolved-task-association`.
- **Shared rule, two hosts.** Refresh derives the same turn claims as the
  import for the sessions it reads, limited to tasks it already knows, and
  keeps them through the existing `canonicalUsageTasks` merge. One
  derivation serves both hosts. Slice 1 introduces it with Claude Code;
  Slice 2 extends the proof and any host-specific wiring to Codex. Do not add
  a second reply recognizer in Refresh. Reuse the import's facts and
  `nativeTaskActivity`. Read only the claims of known tasks; never create
  recovered tasks in Refresh.
- **Provisional rule.** A finished task is provisional when its end is later
  than the last usage check the chart answer already reads
  (`lastUsageCheck`). Its end is the reported outcome time, else the
  launch's done time, else its last activity. Provisional is a third coverage
  kind beside `measured` and `partial`: it is excluded from the median like
  partial and clears once a Refresh starts after the task ended. The chart
  draws it with the hollow mark partial uses. Its words are "Provisional" in
  the point description, the cohort note and the detail ("Provisional ·
  finished after the last usage check"). The legend's hollow key reads
  "{tool} partial or provisional".
- **Production repair uses the existing offline import.** It reads every
  retained session whole, applies the reply rule, and keeps sessions it
  cannot read. No separate backfill code. Rehearse on a copy, back up
  `~/.open-dough/dashboard/launch-history/usage.json` and `usage-check.json`,
  run it against production, and let the summary cache rederive from the
  changed store digest.
- Trunk Mode is not required. No slice acts from trunk.

## Local gate

On macOS run from an awake machine on AC with `caffeinate -s -i`, the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Keep default test timeouts and follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`:

- backend: `npm run --silent test:dashboard:backend -- <paths> --workers=2`,
  with the slice's named specs plus `dashboard/backend-tests/usage-history/token-index-*`,
  `repeated-checks*`, `session-contribution*`, `usage-check-freshness`,
  `recovered-*` and `claude-usage`/`codex-usage`. They are the readers of
  task claims, contributions and coverage that the trace below found.
- frontend: `npm run --silent test:dashboard:frontend -- dashboard/frontend-tests/configuration/system-settings-usage*.spec.ts --workers=2`
  for Slice 4.
- `npm run typecheck:dashboard` for changed production inputs.

Run the consumer-trace script per slice with terms `nativeTurns`,
`unresolved-task-association`, `coverage.kind` and `UsageTaskCoverage`.

## Decisive premises

| Premise | Consuming operation | Form and profile | Result |
| --- | --- | --- | --- |
| Refresh drops a launch's reply turns even when it rereads the session | `refreshUsageHistory` on a store with the check before the session's changes | Scratch `node --experimental-strip-types` at `e3abe937f` on a copy of the production store (check set to 2026-11-18T15:31Z), real `~/.claude/projects`, 2026-11-22 | Session `47460e10-…` stayed at 28 responses. Its reading held 860 responses: 28 assigned, 832 `unresolved-task-association` from 16:43:30Z, after the human `Resume` prompt at 16:43:27Z |
| The planned backend proof fails without the fix | Backend Vitest through `importClaude` → `usageServer().refresh()` with a reply written after the import, two Refreshes, `chart("?tool=claude")` | Scratch spec beside `token-index-developer-reply.spec.ts` (reverted), `npm run test:dashboard:backend -- … --workers=2`, `e3abe937f`, 2026-11-22 | Failed: index `1950`, expected `4900` |
| Codex Refresh drops a reply turn written after the import | Backend Vitest through `runImport` with only the launch turn, then `codexReply()` written, two Refreshes, `storedUsage` | Scratch spec beside `token-index-developer-reply-codex.spec.ts` (reverted), same runner, `e3abe937f`, 2026-11-22 | Failed: the launch's root usage differed in `responses` and `output` from the expected 2 responses / 400 output |
| Refresh's tasks lack reply turns because Refresh reads no task facts | Read `usageRefresh.ts` `claudeReading`/`codexReading` against `usageScan.ts` | Code at `e3abe937f` | Neither reading passes a task sink, and Refresh calls no `recoveredUsageTasks`. The import passes both |
| The offline import already attributes the reply turns and is the repair path | `importUsageHistory.ts import` against a copy of the production store | `node --experimental-strip-types dashboard/server/importUsageHistory.ts import --home ~ --store <copy> --claude-root <SEED-404 session's project dir> --codex-root <empty dir>` at `e3abe937f`, 2026-11-22 | Session `47460e10-…` went from 28 to 860 responses, all for its one task, and the task now claims 3 native turns. Slice 5 compares Codex tasks on the full rehearsal |
| A full-corpus import completes from the executing shell | The Slice 5 rehearsal and production run | Full import against a store copy from this background session, 2026-11-22 | Not settled: the import stopped making progress for about 5 hours at 0% CPU. Each `git rev-parse` it ran in a session cwd under `~/Documents/stock analysis` hung for minutes, because macOS privacy protection blocks `~/Documents` there. Slice 5 starts with an early probe: run the full rehearsal from a shell with Documents access, which is the developer's own terminal through `! <command>` or a granted host. If none is available, stop Slice 5 and report |
| The chart answer can judge provisional without new reads | `usageBoundary.ts` `tokenIndex` | Code at `e3abe937f` | It already reads `lastUsageCheck(store)` and the retained launch ends beside the summary |

## Slices

### 1. Refresh counts a Claude Code launch's turns after a developer reply

Type: Behavior
Status: done
Proof: new cases in `token-index-refresh-developer-reply.spec.ts` (split from
`token-index-developer-reply.spec.ts` by the refactor pass; shared fixtures in
`dashboard/test-support/usage-history/claudeReplyLaunch.ts`), failing first as
observed above.

Delivered: `nativeTaskActivity.ts` `knownTaskClaims(facts, known)` keeps only
native units matching exactly one known task; `usageRefresh.ts`
`claudeReading` passes a fact sink to `claudeUsage`, associates against
`canonicalUsageTasks([...tasks, ...claims])`, and the write merges every
reading's `claims`. `codexReading` returns `claims: []` for Slice 2, which
wires it the same way. A matched task also takes the fact's source.
Follow-up for wrap-up: `claudeReplyLaunch.ts` exports about ten data helpers
that belong as MakeMe steps on `ClaudeTranscriptBuilder`
(`Distribution/tests/support/claudeTranscriptTestData.mjs`, already over the
size limit).

Behavior: a launch imported with only its launch turn → the developer
replies (`Resume`) and the session writes more responses and a worker →
Refresh shows launch + reply + worker in the index (4,900 + worker). Two more
Refreshes leave it unchanged. A typed `/dough-land` after the reply → its
turns and later replies do not count in the launch after Refresh. Another
launch's reporting context in the same session → its turns are not the first
launch's.

### 2. Refresh counts a Codex launch's turns after a developer reply

Type: Behavior
Status: done
Proof: matching cases in `token-index-refresh-developer-reply-codex.spec.ts`,
failing first.

Delivered: `codexReading` passes a fact sink to `codexUsage`; both readings
share `usageRefresh.ts` `claimedTasks(facts, tasks)` for the claims and the
tasks to associate against.

Behavior: a Codex launch imported with only its launch turn → a reply turn in
the same thread, with a spawned worker, writes more responses → Refresh counts
the reply turn and the worker once. Repeated Refreshes do not change it. A
typed workflow turn takes no responses into the launch.

### 3. A finished task read before it ended is provisional and out of the median

Type: Behavior
Status: done
Proof: backend cases in `token-index-provisional.spec.ts` through
`usageServer().chart()`.

Delivered: `tokenIndexTask.ts` `UsageReading.checkedAt` (null before the first
check) and `endedAfterCheck`; coverage is partial, else provisional, else
measured. `UsageTaskCoverage` gains `provisional`. Slice 4 inherits three
frontend reads that still treat provisional as measured (G3):
`TokenIndexTrend.tsx` mark choice, `UsageToolSummary.tsx` cohort note count,
and `UsageTaskDetail.tsx` `coverageWords` ("No known gaps").

Behavior: a launch is marked done after the last usage check → its point has
`coverage.kind === "provisional"` and the median skips it. After a Refresh
that starts after the end → `measured` and counted. A task ended before the
check stays measured. A task with gaps stays partial, which takes precedence.

### 4. The Usage view shows provisional tasks

Type: Behavior
Status: done
Proof: `system-settings-usage-legend.spec.ts` and
`system-settings-usage-selection.spec.ts` (or the nearest Usage spec by its
page objects) with a provisional task in the answer.

Behavior: a cohort answer holding a provisional task → its point uses the
hollow mark and describes "Provisional". The cohort note counts "1
provisional". The selected task's detail reads "Provisional · finished after
the last usage check". The legend's hollow key reads "partial or
provisional".

Delivered: the point description, cohort note, detail and key use the fixed
words; the large-task overflow note reads "Partial and provisional coverage
remain marked." The shared chart keeps its `partial` field name for the
hollow mark.

### 5. Production usage history matches retained native evidence

Type: Behavior
Status: done
Proof: recorded reconciliation in this plan: per-host changed tasks, the
SEED-404 total and the opening Claude Code median before and after, the
backup path, and a second run's unchanged store digest.

Early probe: the full rehearsal finishes on a copy in a shell that can read
`~/Documents`. If it hangs there, stop this slice and report the blocking
directory. Do not patch the import's git access within this story.

Behavior: the production store holds stale totals → rehearse the offline
import on a copy and compare per-task totals and the opening medians. Check
SEED-404's execution against the manual recount (12.64M from 860 responses)
and the median (3.28M → 4.09M). Name each changed Codex task. Back up the
store and check record, run the import against production, and reload Usage:
the totals match the rehearsal. Sessions without retained evidence keep their
stored contribution, and their gaps show. A second run leaves the store
digest unchanged.

Reconciliation (2026-11-22): rehearsal on a copy under the job's tmp,
then production. The full import ran only once this session's shell had
`~/Documents` access; `!` commands hung like the background shell.

- SEED-404 execution: 0.38M → 12.64M measured, served by the production
  Usage answer after the repair.
- Claude Code: 25 finished tasks changed, for example SEED-384 review focus
  7.84M → 12.87M and SEED-413 backend unit tests 2.43M → 11.87M. Codex: 11 changed:
  SEED-073 renew question 12.64M → 30.3M, SEED-20261111 service root
  15.51M → 25.29M, SEED-345 compare effort 12.77M → 14.66M, SEED-345 recover
  evidence 3.12M → 8.3M, SEED-389 silent wait 0.92M → 1.35M, SEED-391 effort
  redo 0.51M → 18.04M, SEED-393 unrelated launches 1.09M → 2.32M, SEED-401
  repeat findings 4.9M → 10.4M, SEED-403 mounted boundary 14.05M → 15.72M,
  SEED-404 Doughnut speed 14.21M → 19.7M, SEED-413 launch proof
  24.38M → 31.15M. Four provisional tasks became measured.
- Medians (execution, last 30 days): Claude Code ends 8.90M → 9.67M; at
  SEED-404's end 5.39M → 6.57M. Codex ends 10.45M → 13.61M. The story's
  3.28M → 4.09M was in neither series; Terry chose to record the actual.
- Backup: `~/.open-dough/dashboard/launch-history/backups/before-SEED-422-20261122160034`.
- Second run: every finished task unchanged in the rehearsal and in
  production; only tasks of sessions live during the run gained new
  responses, so the store digest still moves while sessions write.
- Partial tasks keep their gaps (SEED-101#story-1, SEED-281 CI proof).
- Clock: 15.2 active minutes, an overrun from waiting on the detached
  imports outside the clock's `run`; the remaining work was verification of
  an authorized production operation, so it continued instead of reverting.

## Execution complete

Product advice: no backlog change beyond the retrospective correction
[SEED-422#build-claude-reply-fixtures-with-makeme](../773-build-claude-reply-fixtures-with-makeme/PLAN.md),
which moves the reply fixtures' transcript data into MakeMe steps. Process
review is deferred into wrap-up behind the Intent Coverage check.

## Story obligations

### G1. Refresh rereads only sessions changed since the check
Reported: slice 1 — "Refresh only rereads sessions with a file modified since the check. A stale session that never changes again is only repaired by the offline import (Slice 5)."
Story clause: "whether written before or after the previous check"
Disposition: proved by slice 5: PLAN.md Slice 5 reconciliation — the offline import reread every retained session and SEED-404 went from 0.38M to 12.64M
Commitment: 2

### G2. Rolling median after a correcting Refresh not observed
Reported: slice 1 — "The rolling median is a gap. It only starts at the 10th eligible task."
Story clause: "the point and trend update"
Disposition: proved by slice 3: dashboard/backend-tests/usage-history/token-index-provisional.spec.ts G2 case — ten-launch Claude cohort, a developer reply read by Refresh moves the median from [1950] to [3425]
Commitment: 5

### G3. Provisional points read as measured in the Usage view (first reported in slice 3)
Reported: slice 3 — "Until Slice 4 changes them, three frontend reads treat provisional exactly like measured"
Story clause: "shows that state on its point"
Disposition: proved by slice 4: dashboard/frontend-tests/configuration/system-settings-usage-legend.spec.ts provisional case observes the hollow mark and "Provisional" point text (TokenIndexTrend), "1 provisional" cohort note (UsageToolSummary) and the detail words (UsageTaskDetail)

## Plan review

Slice-plan refinement was not needed. Five slices follow distinct outcomes:
Claude Code and Codex Refresh attribution share one derivation, introduced
once and extended once. Provisional splits server eligibility from its
presentation because they have different proof loops. The production repair
reuses the existing import and adds no code. No remaining slice-specific
concern was identified. Slice 5 is bounded by its early probe for the full
import's host access.
