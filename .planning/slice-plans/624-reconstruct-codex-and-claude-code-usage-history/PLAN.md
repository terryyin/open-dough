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
| Known operational and archived launches gain durable categorized usage, model/effort, lineage, scope and coverage | 1–3, 6: CLI import followed by a fresh-process read of persisted evidence |
| One count across reruns, duplicate rows/files, retries and later collector overlap; failed persistence is recoverable | 1–3, 6: same native request replayed and enriched through the shared writer; totals stay stable, failed write retains prior readable data |
| Codex descendants and archive/compression count only owning responses in attributable task turns | 2: root, child, copied ancestor, unrelated task and compressed archive scenario |
| Claude session and workers count each API message once, including repeated/updated streaming records | 3: root/worker, resumed task boundary and duplicate message scenario |
| Pruned tasks recover project, workflow/task, historical identity/title, host, settings, timing and outcome where supported | 4: local Git revisions with renamed/deleted story and recorded invocation; inspect each field's evidence |
| Dashboard/native/unknown origin reflects evidence; unknown/ambiguous values stay explicit | 2–4: no launch reference, contradictory join and missing Git/source cases |
| No raw transcript/prompt copying, no fabricated operational sessions or workflow writes; native sources can disappear after import | 4, 6: inspect persisted JSON and unchanged operational/backlog/assignment inputs, remove native fixture, read again |
| Earliest dates, host/coverage counts and material gaps reported for real recovery; import is repeatable | 7: run report, persisted-record reconciliation and second run on the same machine corpus |

## Preparation evidence

The [retained preparation premises and observations](execution-history.md#decisive-premises-and-observations) include native format/decoder, historical-source and runner evidence; reuse settled observations within their stated limits.

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

Behavior delivered: retained Claude root/worker transcripts import one observation per owning API message ID, enriching compatible streaming rows without addition. Known model/effort and disjoint categories/cache-write lifetimes survive; explicit resumed-task evidence separates tasks, unknown lineage/auxiliary/missing transcripts remain gaps. Reimport/collector replay keep stable totals. Full proof below; original slice text recoverable at `b854bc525f1ae8dd55b448afe2395af5ca7eeb73`.

### 4. Reconstruct tasks whose dashboard record was pruned
Type: Behavior
Status: done
Proof: new `recovered-tasks.spec.ts` with local Git history and both native hosts.

Behavior delivered: pruned native tasks import into recovered history with configured project, workflow/task, historical story identity/title, host, supported settings/timing/outcome and per-field evidence. Git references are revision-pinned and survive deleted/renamed stories; origins require positive evidence, unknowns/conflicts remain explicit. No fabricated operational sessions, prompt/transcript copying, workflow writes or erased facts on replay/source removal. Supported new evidence enriches the same native task. Full proof below via linked execution history; original slice text recoverable at `2678bb0cbbc3f7917330d30404ecd5b75e43e00e`.

### 5. Report scoped usage and bound native lineage attribution
Type: Behavior
Status: done
Proof: `import-report.spec.ts`, `import-report-window.spec.ts`, `claude-lineage-size.spec.ts`, and retained import specs through the actual CLI.

Behavior: fixture-sized native evidence and configured projects import → the report separates configured/unknown/unassigned/excluded populations, in-window/unknown/outside activity, categorized counters and missing values. Tilde paths resolve through the existing local-folder rule. Long native ancestry and equal-time requests retain exact response/boundary/worker-join provenance without multiplying intermediate or descriptive task sources. Replay keeps one fact. The preserved implementation and 25-case proof own this result; real-corpus persistence remains an explicit interim limitation owned by slices 6–7.

### 6. Persist and read bounded usage snapshots
Type: Structure
Status: planned
Proof: new actual-CLI storage/read/export cases alongside all earlier import specs; first real-corpus capacity observation after current regression proof.

Internal change: replace only usage's monolithic physical JSON encoding with bounded immutable partitions and a small atomically replaced manifest in the existing history directory. Reuse `machineJsonLock.ts`, `readMachineJsonLocked` where suitable, and `durableJsonReplacement.ts`; preserve one shared host-neutral observation/task/association model and writer. Preserve v1 logical records, legacy v1 reads, counter/identity/reconciliation semantics, privacy and monthly launch-history behavior. No database, workflow authority or per-host store. Whole-history comparison/export must not construct an over-limit string; bounded reads/writes must avoid cloning the whole persisted corpus alongside the incoming batch.

Prove legacy data, fresh-process record/read/export equivalence, retry/enrichment and cross-process updates. A failed page or manifest publication leaves the previous snapshot readable; orphan/unreferenced pages never add facts. A reader holding an earlier manifest remains coherent while a writer publishes. Use observable barriers, never sleeps. Retain exact endpoint provenance and all competing measurements; physical partitioning cannot discard facts to satisfy limits. These changes enable only the immediately following corpus Behavior.

Early capacity probe: after current fixture/contract proof passes, run the authorized first real import on this machine with the default Node heap and current source fingerprint, then a fresh persisted read/export or equivalent bounded reconciliation. This may supply the first successful run for slice 7. Record memory/duration/serialization sizes. A failure stops slice 7 and triggers reassessment; do not raise limits blindly or claim corpus capability from small fixtures. The state-changing scale observation is explicitly owned here after its cheap regression prerequisite.

### 7. Recover this machine's history and report its limits
Type: Behavior
Status: planned
Proof: import-report fixtures, two successful real imports (reusing the accepted first run from slice 6 when still applicable), and fresh-process persisted-record reconciliation.

Behavior: configured projects and retained native evidence are available → documented import since `2026-09-16T00:00:00+08:00` → stored history and report agree on task/usage dates, host/coverage counts and material gaps. Repeat → old IDs/counters never multiply; distinguish genuine new observations and compatible enrichment. Keep task start distinct from in-window activity, including older roots and workers. Inspect bounded representatives of material metadata gaps before calling retained facts unavailable. Do not infer counters/origin/identity.

Record timezone, roster including hidden projects, native roots, exact commands, runtime revision plus dirty-source fingerprint, and scan boundaries. Native inputs remain read-only; shared snapshot locking coexists with the dashboard. Preserve privacy and operational/backlog/assignment facts. Retain only metadata/count evidence in enduring usage documentation, with older counter, missing-source, unknown-boundary/origin/identity and auxiliary coverage limits. No UI, collector scheduling, pricing, billing, Cursor or unavailable-source recovery.

## Verification, sizing and concern review

- Local import gate on AC: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --workers=2`, default quiet reporter. Apply the maintained [macOS sleep guard/power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos): battery needs AC or awake/open-lid `caffeinate -i` plus sleep-log inspection.
- Run `npm run typecheck:dashboard` for contracts. Reuse unchanged 11 history/delete and project-configuration observations; renew reached consumers. New MakeMe runtime imports retain native-evidence-identity proof. Live scale/import actions require current regression proof first.
- Failure policy: [AGENTS.md#failing-and-flaky-tests](../../../AGENTS.md#failing-and-flaky-tests) applies as written, including local/CI differences and owned repair. No numeric target or hard limit was supplied.
- Refinement ran after actual corpus evidence disproved monolithic serialization. Retain completed 1–4; split old 5 into a useful report/lineage result, immediately necessary bounded storage Structure, and the original real-accounting Behavior. Seven slices; no story resplit recommended. Scope and beneficiary unchanged.
- Cumulative design: one native observation/reconciliation model, one file-based snapshot codec and existing atomic/lock primitives. No new North Star topic or ADR; ADR 0002/0008 and the cited launch model still govern. The remaining scale uncertainty is the explicitly guarded first-live probe in 6, whose failure stops 7; no other blocking concern identified.

## Refinement premises and retained work

- Real Node 24.21.0 census at fingerprint `e82e3d51a5d78e901598f66c70f7d440a11bac3c0c909479ff513e1f4427f023`: 2,475 tasks/11,320,655 compact value chars; 513,618 observations/978,160,558 chars and 640,765 measurements; 513,618 associations/432,936,435 chars; 12,272 gaps/2,636,673 chars. Largest observation 15,690 bytes. V8 string cap 536,870,888 chars, so even compact whole-document JSON fails; individual current facts fit bounded partitions. Census deliberately suppressed persistence and exited; no real snapshot exists.
- PFE: monthly launch JSONL is append-only and cannot publish reconciled snapshots atomically; CI artifacts are immutable remote proof readers, not local usage writers. Reuse existing machine write-lock/durable replacement for the small manifest and bounded files; add only the missing usage codec/read/export seam. Atomic snapshot and actual memory capacity remain slice-6 proof, with the stated early live probe.
- Old slice 5 source-work elapsed 49m33s (17:30:49Z fixture birth to 18:20:22Z freeze; earlier reads unmeasured), no CI pause or supplied hard limit. Compatible report/tilde/window/lineage fixes have 25 passing CLI cases, typecheck, configuration boundary and native-evidence-identity proof. No real import succeeded. Preserve those boundaries rather than redo implementation.
- All 17 attempt-owned product/doc files were parked and checksummed, with no shared stash or unrelated changes touched, before this rewrite: `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/seed358-refinement-park-xxypwfkh/manifest.json`. Restore verified completed work for slice 5; slice 6 starts fresh after its delivery. Same owned workspace/Taken identity/mode/branch retained; no second claim or preparation assignment.

## Execution context

Established workspace `/Users/terryyin/git/open-dough/.worktrees/reconstruct-codex-and-claude-code-usage-history`, branch `codex/reconstruct-codex-and-claude-code-usage-history`, mode story-branch. Publisher `dashboard-territory.local-open-dough`, agent `mrsn-chan`; identity above. Origin `terryyin/open-dough`, trunk `refs/heads/main`, increments to `refs/heads/codex/reconstruct-codex-and-claude-code-usage-history`. Existing linked worktree reused; no second claim or integration-checkout mutation.

Starting revision `ecb5de7eaf25afd137eaa7458abc31b8640c70de`; established published base/candidate `a2bf0f9625455299ad0f8776e1be915aa6d8e797` confirmed on both remote targets. Trunk claim CI unobserved. Setup: Node 24.21.0, `node scripts/setup-native.mjs npm` passed, existing launch-history backend `--list --reporter=list` selected four cases. Check-only `.githooks/pre-commit` owns staged lint and typecheck; selective formatting uses `npm run --silent format` (npm supplies local tool PATH); importer triggers no generation. Worktree author is `mrsn-chan`, so delivery uses agent commit. Existing replanning authority retained; no explicit override or numeric hard limit.

Observer, repair and proof-launch context is retained in [execution history](execution-history.md).

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

### G4. Pruned older task with only in-window worker work
Reported: slice 4 — "Coordinator inspection of recoveredUsageTasks.ts found cutoff eligibility checking only the root session response list; an older pruned task whose only in-window work is an attributable descendant could be discarded."
Story clause: "an older conversation can contribute attributable work within it without including its earlier usage"
Disposition: proved by slice 4: recovered-gaps.spec.ts old root task retained through only attributable in-window worker; nativeTaskActivity.ts reuses host associations and old usage is excluded
Commitment: 76
### G5. Retained returned-to-backlog outcome from named sibling
Reported: slice 4 — "Freshness inspection at cec45b4be4378c46429a0f39b98b49d486a71d12 found named sibling product fe871dfe5 adding a returnedToBacklog receipt; the earlier schema would strip that supported closure fact during import."
Story clause: "timing, outcome, and usage where supported"
Disposition: proved by slice 4: returned-outcome.spec.ts matching and stale receipts, report attention without raw text, compatible native-to-retained outcome enrichment and conflicting claims; exact additive supplier schema hunk adopted
Commitment: 58
### G6. Observe existing assignment input remains unchanged
Reported: slice 4 — "Coordinator acceptance found native/backlog/configuration and operational bytes guarded, but no existing assignment input in the slice 4 immutability fixture, despite the plan naming that observation."
Story clause: "or change backlog or assignment facts"
Disposition: proved by slice 4: recovered-tasks.spec.ts canonical existing assignment bytes, repository HEAD and working-tree state unchanged after actual CLI; no operational or workflow writes
Commitment: 91

### G7. Resolve configured tilde paths before real recovery
Reported: slice 5 — "Slice 5 pre-live roster inspection found five of six configured localPath values use ~/git paths; passing them literally to Git would fabricate unavailable historical sources and can prevent project joins."
Story clause: "Recover the project"
Disposition: proved by slice 5: import-report.spec.ts tilde-configured historical project recovery red configuredWork0 versus2, then green using shared localFolder with supplied home; old configuration boundary remains passing
Commitment: 49
### G8. Keep unknown activity windows distinct from outside-window evidence
Reported: slice 5 — "Coordinator report inspection found work eligibility omitted recorded lastActivityAt and labeled every other task outsideWindowTasks, potentially treating unknown timing as a proved exclusion."
Story clause: "counts by host and coverage"
Disposition: proved by slice 5: import-report-window.spec.ts actual CLI persisted tasks distinguishes lastActivityAt in-window from genuinely outside and unresolved windows; unknown dates never become proved exclusions
Commitment: 112
### G9. Bounded lineage evidence must allow the real corpus import to finish
Reported: slice 5 — "Slice 5 actual import SIGABRTed at the 4496293888-byte Node heap limit after 16m08s with no usage store written. A 4.3MB Claude file produced 85256 parent-source references for 249 assistant rows; repeated ancestor provenance, not missing machine RAM, challenged corpus feasibility. Repair bounded lineage traversal/provenance while retaining exact response, task-boundary and worker-join evidence; no blind heap-limit increase. A bounded-heap fixture then exposed a second amplification: all lastActivityAt task sources copied into every association for same-time responses; retain that failing shape and restrict association provenance to actual join evidence. The repaired candidate then failed Invalid string length after 6m59.760s without persistence; a read-only census proved approximately 1.4GB compact record values, so the same plan now owns bounded physical storage in slice 6 and successful repeated machine recovery in slice 7."
Story clause: "A developer can account for the Codex and Claude Code work and token usage in the dashboard's projects since Open Dough became stable on 2026-09-16, including launches whose dashboard records were pruned."
Disposition: interim until slices 6, 7
Commitment: 1
## Execution evidence

Accepted proof, refactor and publication receipts are retained in [execution history](execution-history.md).
