# Native usage in launch history

Usage is machine-local evidence in the dashboard's existing
`~/.open-dough/dashboard/launch-history/` store. `usage.json` contains task units,
native response observations, task associations and coverage gaps. Monthly
`YYYY-MM.jsonl` launch records keep their existing format and reader. Ordinary
operational launch reads and writes do not scan native files or usage history.
There is no application database or new workflow authority (ADR 0008).

Run the offline importer with the Node version in `.node-version`, from this
repository:

```sh
node dashboard/server/importUsageHistory.ts import \
  --since '2026-09-16T00:00:00+08:00'
node dashboard/server/importUsageHistory.ts read
```

`--home <directory>` selects the machine home containing retained and operational
launch evidence. `--codex-root <directory>` selects an active Codex rollout root
and may be repeated; its default is `<home>/.codex/sessions`. `--store <file>`
selects an explicit alternate usage document for both commands. `--since` uses
recorded response timestamps, including in-window responses of older sessions;
the default cutoff above is midnight Singapore time, not UTC midnight. Native
inputs are read only. No API request, native session launch, billing lookup or
workflow mutation occurs. Use an isolated home/store for fixture experiments.

The current retained-launch path reads plain active Codex JSONL response usage.
Workers, archived/compressed input and pruned-task reconstruction have separate
planned import paths. A retained task without an evidenced native turn boundary
keeps unavailable/unattributed usage; it is never assigned a conversation total.
An unsupported or unavailable source stays a coverage gap. An import report's
counts describe persisted evidence, not provider-wide accounting.

A task is a launch, identified by project, host, session and evidenced initial
turn (or retained launch time when that turn is unknown). Requested model,
effort, workflow options and policy stay on the task. Observed model, effort,
approval policy and sandbox stay on response observations, so settings may
change within one task without rewriting its launch request. Launch source
references point to operational or retained history files. The importer copies
no launch instructions, prompts or transcript bodies into usage records.

A native response has one key: host, owning session/thread and response/message
ID. `observations` holds its native identifiers, timestamp, source file/line,
observed settings, measurements and normalized counters. `associations` names
at most one task for that key. Conflicting task candidates stay unresolved.
Repeated rows, files and later collector replay reconcile that same observation;
they never add its counters a second time. Source measurements remain inspectable.
Additional measurements may fill missing counters. Conflicting measured values
produce unknown affected counters and a `contradictory-measurements` gap rather
than choosing one value.

The distinct token categories are uncached input, cache reads, cache writes and
output. For Codex, reported input includes cached categories: uncached input is
input minus cache reads minus cache writes only when all components are known
and consistent. Missing values are `null`; explicit measured zero stays zero.
Reasoning output is a subset of output, not an additional total. Cache-write
lifetime fields refine cache writes, never add to them. Native total,
turn-cumulative, thread-cumulative, lifetime and compaction summaries are not
additional response charges. Each measurement preserves its original numeric
source fields and accounting definition.

`coverage: measured` means the response has all four core components;
`partial` means some are missing and `unavailable` means all are missing. It
never means complete provider or task coverage. `taskUsage(history, taskId)`
derives measured subtotals from uniquely associated responses. Each category
has a corresponding `unmeasured` count; no measured component yields `null`,
including a task with no attributable responses. Inspect gaps before interpreting
those subtotals.

Shared collectors and readers use `dashboard/server/usageHistory.ts`:

- `writeUsageHistory(batch, file?)` validates and reconciles `UsageBatch` from
  `usageRecords.ts`, holding the existing machine-document lock across its
  read/modify/atomic durable replacement. Pass native measurements, task facts
  and associations; do not increment previously stored totals. Response IDs
  must match `responseKey(host, sessionId, responseId)`.
- `readUsageHistory(file?)` reads imported facts without opening native files.
- `taskUsage(history, taskId)` derives one task's categorized usage on demand.

A failed write retains the prior readable document; retrying imports missing
facts once. An unreadable usage document is preserved and refuses automatic
overwrite. Importing and reading remain useful after native files disappear.
