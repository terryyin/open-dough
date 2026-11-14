# Reconstruct Codex and Claude Code usage history

**Identity:** SEED-358#reconstruct-codex-and-claude-code-usage-history
**Source:** [selected story](../../seeds/SEED-358-dashboard-launch-history.md#reconstruct-codex-and-claude-code-usage-history)

**Source review:** [independent commitments](source-review.md)

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
Status: done
Proof: new `retained-usage.spec.ts`, using the command and persisted read.

Behavior delivered: retained operational/history Codex root-turn evidence imports one request observation with native IDs, source, settings, categorized tokens and explicit coverage. Restart/reimport/overlapping writer preserve one count; failed persistence keeps prior data and retries once. The shared representation/writer serves this path; old history remains readable, routine operational reads/writes do not scan usage, and the same documented CLI/source/store options serve fixtures and real import. Full acceptance evidence below; original slice text recoverable at `e8c33461577e6d744dfbe5f5c4aceb0e9a7107fc`.

### 2. Attribute recoverable Codex usage across workers and archives
Type: Behavior
Status: done
Proof: new `codex-usage.spec.ts` through the import command; rerun slice 1.

Behavior delivered: active, archived and compressed Codex rollouts import each owning response once through explicit thread/turn/parent lineage, including attributable workers across successive task turns; copied ancestors and unrelated/ambiguous work stay outside task totals. Unsupported counters, missing workers and corrupt/truncated files retain explicit gaps alongside valid independent evidence. Lifetime/token_count/compaction snapshots never supply additive usage; local evidence is not provider-wide accounting. Full proof below; original slice text recoverable at `a01e54f6c3a4952ea38bd55be3d2f9691504c7d7`.

### 3. Import Claude Code session and worker usage
Type: Behavior
Status: done
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
  Use the default quiet reporter (omit `--reporter=list`) for final acceptance so passing-test output is rejected as in CI. At slice 1 and after history-contract changes also run
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

## Execution context

Established workspace `/Users/terryyin/git/open-dough/.worktrees/reconstruct-codex-and-claude-code-usage-history`, branch `codex/reconstruct-codex-and-claude-code-usage-history`, mode story-branch. Publisher `dashboard-territory.local-open-dough`, agent `mrsn-chan`; identity above. Origin `terryyin/open-dough`, trunk `refs/heads/main`, increments to `refs/heads/codex/reconstruct-codex-and-claude-code-usage-history`. Existing linked worktree reused; no second claim or integration-checkout mutation.

Starting revision `ecb5de7eaf25afd137eaa7458abc31b8640c70de`; established published base/candidate `a2bf0f9625455299ad0f8776e1be915aa6d8e797` confirmed on both remote targets. Trunk claim CI unobserved. Setup: Node 24.21.0, `node scripts/setup-native.mjs npm` passed, existing launch-history backend `--list --reporter=list` selected four cases. Check-only `.githooks/pre-commit` owns staged lint and typecheck; selective formatting uses `npm run --silent format` (npm supplies local tool PATH); importer triggers no generation. Worktree author is `mrsn-chan`, so delivery uses agent commit. Existing replanning authority retained; no explicit override or numeric hard limit.

CI repair (43613508834/1, published slice1 `e8c33461577e6d744dfbe5f5c4aceb0e9a7107fc`): complete inventory had one PRINTED failure, expected CLI stderr leaked via execFileSync. One-line `stdio: "pipe"` in importHarness.ts preserves thrown stderr/status and assertions. Accepted as already traced within refactor1 harness boundary, no new representation/path. Quiet-reporter red: import prefix above plus `usage-persistence.spec.ts --workers=2` without reporter override, exit1 PRINTED; green entire usage-history directory without reporter override, all6 cases exit0 with empty output; typecheck and whitespace pass. Freshness unchanged at `706387653e180d0e3bab5998ba12a5399aa20b2e`, no incoming supplier behavior. Slice2 preserved in coordinator stash record `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-6h4ghW/record.json`; repair published `8dcffe2123dbf577dcea5e522ff271907ad89834` (suffix base `e8c33461577e6d744dfbe5f5c4aceb0e9a7107fc`), observer attached; restore receipt resumed/applied, owned entry dropped, same slice2 agent resumed. This is current published base.

CI: Codex yielded cell `g263:10`, session 90340, coordinator `seed358-mrsn-chan`, directory `/tmp/dough-ci-501/watch-m0RUal`, PID 49693. Bound to this checkout and repository, target execution branch; push workflow `ci.yml` active, display name CI. Retain this stream through increments.

Proof launch decision (Mac, 2026-11-14): AC, 65% free memory, load 4.74/4.02/4.04; one unrelated CPU-bound Claude host-exit test, no competing proof owned by this execution. Implementation owner runs focused backend cases with bounded workers under `caffeinate -s -i` for long checks; reconfirm headroom before expensive verification, reconsider on contention. Failure policy remains [AGENTS.md](../../../AGENTS.md#failing-and-flaky-tests) without exemptions.

## Story obligations

### G1. Conflicting observed settings
Reported: slice 1 — "Coordinator inspection of usageReconciliation.ts found known response settings silently overwritten on replay without retaining their evidence or ambiguity."
Story clause: "Store model and effort when known"
Disposition: proved by slice 1: usage-reconciliation.spec.ts conflicting observed settings test and usageReconciliation.ts per-measurement settings reconciliation
Commitment: 15


### G2. Independent valid response without session metadata
Reported: slice 2 — "Slice 2 pause identified that the ownMetadata guard discards a valid filename-owning response when session metadata is absent or damaged; counter-availability coverage also needs to distinguish unsupported counters from missing evidence."
Story clause: "Read Codex response usage from active and archived rollouts"
Disposition: proved by slice 2: codex-coverage.spec.ts independent owning response survives missing metadata and legacy task totals remain null; nativeUsageFiles.ts preserves independent decodable lines
Commitment: 38

### G3. Claude partial lineage and auxiliary evidence
Reported: slice 3 — "Slice 3 leaves unclassified human-input boundaries, orphan or missing workers and unavailable auxiliary usage explicitly unresolved rather than assigning whole-conversation totals."
Story clause: "Represent missing or partial measurements explicitly"
Disposition: proved by slice 3: claude-usage.spec.ts unresolved association/native-lineage and auxiliary gaps; claude-coverage.spec.ts missing/orphan worker and unavailable task subtotals; USAGE-HISTORY.md describes retained-evidence coverage
Commitment: 44
## Accepted slice evidence

1. Retained Codex: actual CLI/fresh-process reads in `retained-usage.spec.ts` observe categories, settings, sources, one-count replay/enrichment, contradictions, missing→zero, and native-source independence. Operational scan trap passes; native payload keys verified against Nov14 sample. `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history dashboard/backend-tests/sessions/launch-history-aged-out.spec.ts dashboard/backend-tests/sessions/launch-history-removed.spec.ts dashboard/backend-tests/sessions/agent-launch-delete.spec.ts --workers=2 --reporter=list`: 15 passed (4 new +11 existing). Updated import-only selection: 6 passed; final `--grep 'preserves prior' --workers=1` case passed after correcting injector to actual CLI rename error, exact stderr/status checked. `npm run typecheck:dashboard` passed. Consumer trace `/tmp/seed358-slice1-consumers.md`: new API has no unchanged production callers; additive effort builder leaves omitted-effort consumers unchanged; old history contract regression above retained. Source freshness unchanged at `74bc48c5b968b48443df355effbdfd0f908cb29c`; incoming named sibling only preparation/Take, no changed supplier history behavior. Independent refactor split six cases across retained-usage, usage-reconciliation and usage-persistence specs with retainedUsageTest.ts fixture; actual CLI 6/6 passed in 2.7s, earlier11 history cases unchanged. No production refactor; final hook owns current typecheck. Mechanical lint repair stayed within accepted return paths/trace (guards/assert narrowing and unknown JSON types, no new domain representation); import6/6 and typecheck passed. Published `e8c33461577e6d744dfbe5f5c4aceb0e9a7107fc` to origin execution branch (suffix base `a2bf0f9625455299ad0f8776e1be915aa6d8e797`); observer reused and attached. This is the retained published base for slice 2.

2. Codex workers/archives: `codex-usage.spec.ts` observes copied ancestors, multilevel lineage, successive tasks, unresolved worker, older-root cutoff and replay; `codex-coverage.spec.ts` observes missing metadata survival, corrupt zstd/truncated line, missing source/workers and unavailable legacy counters. Actual CLI/fresh reads through isolated HOME. `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --workers=2`: 9 cases passed with quiet reporter; `npm run typecheck:dashboard` passed. AC/free65%, load3.37/4.93/4.80, bounded2workers. Consumer trace `/tmp/seed358-slice2-consumers.md` dispositions inspected; old reader/store untouched. Source unchanged at `9c4afa5e4469730ebbb891c4d39087d6ee29de99`; no incoming supplier changes. Independent refactor2: none — already clean; no edits/tests, whitespace/sizes and consumers checked, accepted proof unchanged. Published `a01e54f6c3a4952ea38bd55be3d2f9691504c7d7` (suffix base `8dcffe2123dbf577dcea5e522ff271907ad89834`) on origin execution branch; observer attached. Current published base for slice3.

3. Claude: root/worker native keys verified metadata-only; `claude-usage.spec.ts` and `claude-coverage.spec.ts` observe API-ID deduplication, compatible streaming enrichment/first-last times, disjoint cache/lifetime counters, observed model/effort, explicit resumed launch refs and same-ref continuation, unknown boundaries/unjoined workers, contradictory counters/lineage, replay and native removal. Quiet gate from slice2 (whole usage directory,2workers):12/12 passed; `npm run typecheck:dashboard` and whitespace passed. Trace `/tmp/seed358-slice3-consumers.md`: shared schema/reconciliation reaches Codex readers/writer and all usage tests, all covered; unrelated generic identifiers excluded. AC/free65%, load6.69/5.20/5.19. Source freshness unchanged `9c4afa5e4469730ebbb891c4d39087d6ee29de99`, no new sibling changes. Independent refactor3 unified only the duplicated file-collection loop in usageImport.ts; current CLI12/12 and typecheck passed again,9.8s; trace `/tmp/seed358-slice3-refactor-consumers.md` complete. Lint correction made references a tuple and Claude attribution return the enriched clone plus association; sole importer caller replaces that observation explicitly. CLI12/12 and typecheck passed; independent refactor3-repair found clean, proof reused, no edits/tests. Delivery pending.
