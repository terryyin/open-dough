# Reconstruct Codex and Claude Code usage history

**Identity:** SEED-358#reconstruct-codex-and-claude-code-usage-history
**Source:** [selected story](../../seeds/SEED-358-dashboard-launch-history.md#reconstruct-codex-and-claude-code-usage-history)

## Goal and scope

Recover this machine's Codex and Claude Code work and reported token usage for
the dashboard's configured projects since 2026-09-16, including tasks whose
launch records were pruned. The developer evaluates persisted records and a
repeatable import report. No new UI is required.

Include operational and retained launches, active and archived Codex rollouts
(including compressed files), Claude root and worker transcripts, historical
project/story resolution, field provenance, and explicit coverage gaps.
Keep requested and observed model/effort/settings distinct. Preserve missing
counters and ambiguous associations rather than supplying zero or invented facts.
Exclude live polling/telemetry installation, UI, Cursor reconstruction, pricing,
billing, and unavailable-source recovery. Never copy raw prompts or transcripts
into new history records or use recovery to change workflow state.

## Existing solutions and direction

- Reuse the delivered history directory and reader in
  `dashboard/server/launchHistory.ts`, operational evidence from
  `launchRecordDocument.ts`, project configuration from
  `projectConfiguration.ts`, and the existing machine-store locking and
  replacement discipline. The supplier agreement in the story is satisfied by
  accepted `f5c1adff32830a9f4e4992913fd7b8a9f72cfc83`; its recoverable
  plan at `3463243925b666be7b7c6065a03cee85f8c09b6e` records both slices
  done and 11/11 backend proof.
- PFE: passive Codex session reads and Claude listing normalize availability;
  they do not collect native request usage. Existing native-comparison usage
  artifacts and the [audit](../../../docs/maintainer/session-token-efficiency-research.md)
  supply accounting examples, not a reusable importer. Add host-native usage
  readers, keeping shared attribution/persistence rules in one place.
- Existing history entries require a complete operational `LaunchRecord` and
  deduplicate by project/session. Recovered tasks may lack those required
  fields, and one conversation may contain multiple tasks. Evolve history with
  an explicitly recovered-task representation and keyed usage evidence alongside
  existing entries; do not fabricate short IDs, endpoints or launch requests.
  Preserve old entries and their reader's contract. Routine session reads and
  writes still do not scan usage/history.
- Native response identity is host + owning session/thread + response/message
  ID. Store the observation separately from its task association so replay,
  streaming rows and future live overlap reconcile one fact. Reconcile a more
  complete observation without adding its counters again; contradictory facts
  retain a gap. A response is charged to at most one task. Ambiguous evidence
  remains available without being included in several totals.
- Keep uncached input, cache reads, cache writes and output disjoint. Codex
  inclusive input includes cached categories; derive uncached only when the
  supplied fields permit it. Preserve source values/definitions and unknown
  components. Reasoning is an output subset; cache-write lifetime splits are
  refinements of cache writes, never extra tokens.
- Follow [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state):
  files hold machine-local evidence, with no application database or independent
  workflow authority. Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  and the [North Star's launch model](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment).
  An importer is a local operation over retained evidence, not a new native
  launch or collector scheduler. No new North Star topic or ADR is needed.

## Outside-in proof ownership

New specs below live under `dashboard/backend-tests/usage-history/`.
Each invokes the actual import command against an isolated HOME, native-shaped
files and local Git history, then reads persisted records after a new process.
The command must not call a paid API, start a native session or alter its inputs.
Use the selected MakeMe convention via
[dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) before authoring
tests; .planning/open-dough.json selects these backend specs.
Assertions observe recovered evidence and aggregates, not the fixture builder.

| Final promise | Owning slice and observation |
| --- | --- |
| Known operational and archived launches gain durable categorized usage, model/effort, lineage, scope and coverage | 1–3: CLI import followed by a fresh-process read of persisted evidence |
| One count across reruns, duplicate rows/files, retries and later collector overlap; failed persistence is recoverable | 1–3: same native request replayed and enriched through the shared writer; totals stay stable, failed write retains prior readable data |
| Codex descendants and archive/compression count only owning responses in attributable task turns | 2: root, child, copied ancestor, unrelated task and compressed archive scenario |
| Claude session and workers count each API message once, including repeated/updated streaming records | 3: root/worker, resumed task boundary and duplicate message scenario |
| Pruned tasks recover project, workflow/task, historical identity/title, host, settings, timing and outcome where supported | 4: local Git revisions with renamed/deleted story and recorded invocation; inspect each field's evidence |
| Dashboard/native/unknown origin reflects evidence; unknown/ambiguous values stay explicit | 2–4: no launch reference, contradictory join and missing Git/source cases |
| No raw transcript/prompt copying, no fabricated operational sessions or workflow writes; native sources can disappear after import | 4: inspect persisted JSON and unchanged operational/backlog/assignment inputs, remove native fixture, read again |
| Earliest dates, host/coverage counts and material gaps reported for real recovery; import is repeatable | 5: run report, persisted-record reconciliation and second run on the same machine corpus |

## Decisive premises and observations

Observed 2026-11-14 in this preparation; no product code was edited.
Native samples are retained external evidence, not fixtures to commit verbatim.

| Consuming operation / premise | Observation and limits |
| --- | --- |
| History can preserve launches without native files | Accepted supplier code and retained 11/11 proof cited above cover aged-out/removal transfer, retry deduplication and failure retention. They prove the old history contract only, not the new importer. |
| Native decoder can read actual Codex compression | Node 24.21.0 `createReadStream(file).pipe(createZstdDecompress())` with readline/JSON parsing consumed Nov 7 worker `01a1b548-84ab-7240-a940-8a72564202cd` on this Mac: six unique owning responses, input 1509104, cached input 1486336, output 1352. It contained copied parent metadata but no foreign usage rows, so fork exclusion still needs slice 2's fault-discriminating fixture. `zstd -dc` also decoded a Sep 20 archive with no per-response counters. Native extensions were .jsonl and .jsonl.zst; do not assume older files have counters. |
| Owning-response identity and categories are available | Read Nov 14 rollout `01a1da6b-8784-7e63-96e0-db7c2f6d6081`: top-level `token_usage_record` carries thread_id, turn_id, root_turn_id, response_id and usage. One response reported input 317035, cached input 316032, cache-write 0, output 347. The Nov 7 worker's source records parent_thread_id; containing-file ownership must survive copied session_meta rows. |
| Claude per-message evidence repeats in real transcripts | Read session `6ccc791e-e1f3-4b69-9794-049c6189dfa5`: assistant rows expose message.id/model/usage, requestId, cwd, sessionId, effort and timestamps. The same input/cache/output usage appears on repeated rows. Cache lifetime splits are present. This establishes native shape, not full-task coverage; missing auxiliary/worker evidence stays a gap. |
| Metadata can use historical project facts | Existing audit uses the configured production roster, cwd/worktree and Git origin, plus parent linkage. The source seed and research require revision-pinned historical story resolution. Slice 4 proves the new resolver against real local Git revisions; current filenames alone cannot settle history. |
| Proof entry point | At `f5c1adff3`, Node 24.21.0 matches .node-version; `node scripts/setup-native.mjs npm` installed locked dependencies. `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/sessions/launch-history-aged-out.spec.ts dashboard/backend-tests/sessions/launch-history-removed.spec.ts --list --reporter=list` selected all four history cases in this worktree. This observes the unpaid runner prefix only. New importer specs must first fail on absent behavior; existing launch tests do not prove import. |

The native file inventory found 2,755 active plain Codex files, 9,183 active
compressed files, 1,290 compressed archived files and 3,444 Claude JSONL files.
These are machine-wide file counts at observation time, not recovered project
tasks or coverage results. Stream the corpus; do not load all transcripts into
memory. Partial files and unavailable decoders yield explicit gaps and safe retry.

## Ordered slices

### 1. Import usage for a retained Codex task
Type: Behavior
Status: planned
Proof: new `retained-usage.spec.ts`, using the command and persisted read.

Behavior: operational or retained launch evidence identifies a Codex root turn
with response usage → run a local import → the history store holds one request
observation linked to the launch, its native IDs and source location, known
settings, normalized categories and explicit coverage. A restart, repeated import
or overlapping writer of that response preserves one count. An injected write
failure preserves existing data and a retry succeeds once.

Deliver the shared usage representation and writer only as required by this
path. Keep old history readable, and prove no routine operational read/write
starts scanning usage files. Document the runnable command and explicit native
source/store options so tests and the real import use the same path.

### 2. Attribute recoverable Codex usage across workers and archives
Type: Behavior
Status: planned
Proof: new `codex-usage.spec.ts` through the import command; rerun slice 1.

Behavior: active, archived and compressed rollouts contain own responses,
copied fork history, workers and successive task turns → import → each own
response is counted once in its evidenced task, including attributable worker
work. Unrelated turns and ambiguous workers remain outside that task's total,
with the unresolved association retained. Older unsupported counters, missing
workers and corrupt/truncated files report coverage gaps while valid independent
observations survive. Do not sum token_count, lifetime or compaction snapshots.

Use explicit thread/turn/parent lineage, not directory proximity or title
matching. No full-provider coverage claim follows from locally complete files.

### 3. Import Claude Code session and worker usage
Type: Behavior
Status: planned
Proof: new `claude-usage.spec.ts` through the same import command and writer.

Behavior: a retained Claude launch has root/worker transcripts with repeated
API message IDs and resumed activity → import → the task holds one observation
per owning message, known model/effort and disjoint token categories, including
cache-write lifetimes where known. Updated streaming rows enrich the observation
without addition. Another task's activity stays separate; unavailable lineage,
auxiliary work and missing transcripts remain explicit gaps. Reimport and
cross-source replay through the shared writer leave stable totals.

### 4. Reconstruct tasks whose dashboard record was pruned
Type: Behavior
Status: planned
Proof: new `recovered-tasks.spec.ts` with local Git history and both native hosts.

Behavior: an in-window native task has no operational/history launch entry →
import using configured project evidence and recorded workflow invocations →
history retains a recovered task with supported historical metadata and per-field
source references, plus usage from slices 1–3. A dashboard launch reference or
comparable positive evidence establishes dashboard origin; otherwise use native
or unknown as supported. Preserve unresolved story/title/settings/timing/outcome
instead of treating current Git facts or last transcript activity as completion.

Use configured repositories and their historical seed/plan/backlog/completion
facts; do not require deleted worktrees or rewrite project history. Capture no
raw prompt/transcript bodies. Preserve unknown required launch fields through
the recovered representation. Repeating with new corroborating evidence enriches
the same task, and deleting native fixture files does not erase imported facts.

### 5. Recover this machine's history and report its limits
Type: Behavior
Status: planned
Proof: new `import-report.spec.ts`, then the real command twice and stored reads.

Behavior: configured projects and retained native evidence are available →
run the documented import from 2026-09-16 → persisted history and the report
agree on recovered tasks and usage, earliest recovered task/usage dates, counts
by host and coverage, and material gaps. Repeat → existing facts and counters
do not multiply; genuinely new observations may add evidence.

Record the cutoff's timezone, configured roster (including hidden projects),
native roots, command, runtime revision and scan boundary. Work in the window
can belong to an older root; do not charge its out-of-window responses.
Document unavailable older counters, unresolved origin/identity, missing sources,
ambiguous task boundaries and auxiliary coverage. Run fixture proof before
writing the real dashboard store. Read native sources only; use the existing
store's concurrency discipline alongside the running dashboard. Retain the
small metadata/count report, never raw transcripts, in the established research
document or enduring usage-history documentation.

## Verification, sizing and concern review

- Local gate: the new spec(s) for each slice plus earlier import specs through
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --reporter=list`.
  At slice 1 and after history-contract changes also run
  `dashboard/backend-tests/sessions/launch-history-aged-out.spec.ts`,
  `launch-history-removed.spec.ts` and `agent-launch-delete.spec.ts` through
  that config. Run `npm run typecheck:dashboard` for changed TS contracts.
  Trace consumers before changing shared contracts; retain discriminating
  assertions at the import boundary. No UI change requires browser-UI proof.
- Each slice owns implementation, focused proof and cleanup in one loop. A safe
  stop leaves only the delivered host/evidence paths supported with honest gaps.
  No numeric target or hard limit is supplied; none is invented. Cumulative
  design: two native decoders feed one observation/attribution/store rule,
  followed by reconstruction and a corpus run; no separate per-host store.
- Before the corpus run or expensive verification, inspect this Mac's workload,
  memory, competing owned runs and available duration evidence. Choose bounded
  streaming/concurrency and retain that launch decision; reconsider on contention.
  Long local runs follow the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  on AC use `caffeinate -s -i`; on battery plug in, or run awake with lid open
  under `caffeinate -i` and inspect the sleep log afterwards.
- Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written, including local/CI differences and owned CI repair.
- Refinement: not needed; the five Behavior slices each have one evaluable
  import/recovery result and proof loop. No preparatory layer-only slice.
- Remaining slice-specific concerns: none identified. Native completeness is
  an explicitly measured coverage result, not a premise of complete accounting.
