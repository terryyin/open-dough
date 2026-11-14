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

- Reuse launchHistory.ts, operational launchRecordDocument.ts, project configuration and shared machine lock/durable replacement. Existing supplier/PFE evidence is retained in [execution history](execution-history.md#original-existing-solution-assessment).
- One usageRecords/task/measurement model and writer owns keyed host/session/response facts, separate attribution, monotonic evidence and explicit corrections. Recovered entries never fabricate operational launches; routine launch reads/writes do not scan usage.
- Uncached input/cache read/cache write/output are disjoint; reasoning and cache lifetimes refine rather than add totals. Preserve raw values and unknowns; a response is charged at most once. Explicit native phase can settle progressive snapshots, while genuinely competing facts stay unknown.
- [ADR0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state), [ADR0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution) and the [North Star launch model](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment) govern file evidence and direct domain mapping. No database, workflow authority, collector schedule or new architecture topic.

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
| Earliest dates, host/coverage counts and material gaps reported for real recovery; import is repeatable | 11: run report, persisted-record reconciliation and second run on the same machine corpus |

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

Behavior: fixture-sized native evidence and configured projects import → the report separates configured/unknown/unassigned/excluded populations, in-window/unknown/outside activity, categorized counters and missing values. Tilde paths resolve through the existing local-folder rule. Long native ancestry and equal-time requests retain exact response/boundary/worker-join provenance without multiplying intermediate or descriptive task sources. Replay keeps one fact. The preserved implementation and 25-case proof own this result; first real persistence is accepted in6; corrected metadata and repeated accounting remain owned by7–9.

### 6. Persist and read bounded usage snapshots
Type: Structure
Status: done
Proof: 32 quiet actual-CLI import cases, typecheck, first real import, bounded fresh reconciliation/streamed export, and exact saved-manifest comparison after gap normalization.

Delivered: immutable bounded pages and a small atomic manifest reuse the existing lock/durable replacement while preserving logical v1/legacy reads, all measurements/provenance, alias/replay semantics, and monthly launch history. Failure/orphan/concurrent/held-reader contracts pass. Narrow task/report reads release native graphs; CLI export streams beyond V8's string cap. First real import succeeded with default heap,2475tasks/513761observations/640908measurements; subsequent gap-key normalization retained every logical fact. Full proof, fingerprints and refactor dispositions are in execution history and the maintained recovery receipt. This accepted run can be the first of two for9 when still applicable; no blind limit increase or whole-corpus string/copy.

### 7. Correct injected context mistaken for a task assignment
Type: Behavior
Status: done
Proof: actual-CLI legacy/paged recovery fixtures with injected-only and mixed genuine assignment rows, persisted correction, replay and source removal.

Recognized host-injected context is not a user assignment. Classify content parts before first-assignment detection, retaining genuine mixed-message intent. Persist bounded supported/rejected assignment evidence (native turn, source row, timestamp and reason; no text). Reconcile it through the existing task model/writer: a proved wrapper-derived start can be replaced by genuine assignment evidence while independent metadata/claims and retained launch facts survive. A wrapper-only catalog record remains inspectable as unsupported, with unknown start and an explicit report count, outside claimed human-task populations. Missing files or absent facts alone never reject a boundary.

Apply effective assignment eligibility to every persisted association, including observations absent from the new scan. Preserve historical candidate/source audit but withdraw unsupported effective charges; retain every observation, counter and measurement. Replay/source disappearance cannot restore invalid assignment or erase valid facts; later positive launch evidence can establish eligibility. Use the shared lock/atomic snapshot, not a reset/deletion facility. Prove both legacy and paged correction, mixed-content safety, retained/independent facts, later enrichment, atomic failure, unchanged workflow inputs and fresh readability. NativeTaskFacts.ts is231lines: put context classification/assignment evidence in cohesive helpers if needed; reuse task reconciliation, schema and bounded writer ownership.

### 8. Resolve explicit historical task references
Type: Behavior
Status: done
Proof: actual-CLI local Git fixtures for numbered historical plans and same-message established identity, with ambiguous/conflicting counterexamples.

An explicit numeric execute-plan argument resolves only a unique matching historical plan at the evidenced repository/revision; follow its recorded source using the existing canonical historical readers, including the observed older quick-plan source header. An explicitly labelled identity in the same user's Established start/preparation can supply intent, agreeing with any invocation argument; conflicting references remain unknown. Argless later invocations do not inherit a prior story, and incidental/custom-tool reads do not establish intent. Do not build a general orchestration-code parser. Preserve pinned Git/source provenance, deleted-story behavior, source removal and no workflow mutation. HistoricalUsageStory.ts is221lines: separate plan-reference discovery from canonical story resolution if needed, retaining one reader representation.

### 9. Bound assignment eligibility matching work
Type: Structure
Status: done
Proof: unchanged43 quiet CLI cases/typecheck, exact paused-stack attribution, and successful454.904-second default-heap import with fresh old-fact comparison.

Move cheap host/session/turn/conflict checks before pure assignment eligibility and short-circuit its known-true cases before deep source comparisons. Preserve all policies, keys, fields and attribution results. A paused owned stack proved repeated hasUsageAssignment JSON comparisons in final Codex association; the prior739.140-second attempt was interrupted before persistence, its manifest unchanged and inspector closed. The restored3-file repair and diagnostic receipt are complete compatible work; independent refactor/delivery remain. Successful import preserved all513761 old observations/640908 measurements and audit, with467 genuinely new IDs; finality remains10's separate correction, not proved final totals.

### 10. Reconcile explicit terminal Claude measurements
Type: Behavior
Status: done
Proof: new actual-CLI partial/terminal and legacy-enrichment/replay cases plus all previous usage specs; no real import before this delivery.

Retain bounded native stop/phase metadata on each Claude measurement, using explicit null as progressive and a supported stop reason as terminal; missing/unknown markers remain distinguishable. Enrich the same physical/native measurement's absent phase without duplicating or erasing its raw counters/source. Terminal output (and supported output-subset fields) can settle earlier explicitly progressive values for the same API message; never sum snapshots/iterations or select latest/maximum. Distinct conflicting terminal or unclassified facts remain unknown. Explicit progressive-only output is not a measured final output; retain its raw value and expose the incomplete-output gap. Preserve legacy unclassified behavior, Codex/input/cache rules, first/last times, lineage/settings, identity and every source fact. Recompute measurement-derived gaps as evidence settles; native stop reasons never complete a task/story.

PFE: extend usageRecords/claudeUsage and the existing shared reconcileObservation/writer, extracting cohesive measurement enrichment/selection if needed. Three actual sampled rows progress from output3/8/4 with stop_reason:null to same-ID tool_use outputs690/843/1083; no unavailable data or heuristic is needed. [Official streaming](https://platform.claude.com/docs/en/build-with-claude/streaming) documents cumulative streaming usage; [stop reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons) identify completed response generation. Prove legacy stored conflicts become supported values, earlier raw facts survive, later partial rows cannot overwrite finals, terminal conflicts/unknown source facts stay unresolved, replay/collector overlap/source removal stay one count, and workflow/privacy/failure contracts hold. The second final-code real pair belongs11 after current proof.

### 11. Recover this machine's history and report its limits
Type: Behavior
Status: done
Proof: current import-report fixtures, two successful real imports on the final task/terminal-measurement interpretation, and fresh-process reconciliation;6 remains the capacity/measurement baseline.

Behavior: configured projects and retained native evidence are available → documented import since `2026-09-16T00:00:00+08:00` → stored history and report agree on task/usage dates, host/coverage counts and material gaps. Repeat → old IDs/counters never multiply; distinguish genuine new observations and compatible enrichment. Keep task start distinct from in-window activity, including older roots and workers. Inspect bounded representatives of material metadata gaps before calling retained facts unavailable. Do not infer counters/origin/identity. A paused-stack-proved eligibility hot path is already repaired in9; current fixture proof must precede both final-code live runs.

Record timezone, roster including hidden projects, native roots, exact commands, runtime revision plus dirty-source fingerprint, and scan boundaries. Native inputs remain read-only; shared snapshot locking coexists with the dashboard. Preserve privacy and operational/backlog/assignment facts. Retain only metadata/count evidence in enduring usage documentation, with older counter, missing-source, unknown-boundary/origin/identity and auxiliary coverage limits. No UI, collector scheduling, pricing, billing, Cursor or unavailable-source recovery.

## Verification, sizing and concern review

- Local import gate on AC: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --workers=2`, default quiet reporter. Apply the maintained [macOS sleep guard/power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos): battery needs AC or awake/open-lid `caffeinate -i` plus sleep-log inspection.
- Run `npm run typecheck:dashboard` for contracts. Reuse unchanged 11 history/delete and project-configuration observations; renew reached consumers. New MakeMe runtime imports retain native-evidence-identity proof. Live scale/import actions require current regression proof first.
- Failure policy: [AGENTS.md#failing-and-flaky-tests](../../../AGENTS.md#failing-and-flaky-tests) applies as written, including local/CI differences and owned repair. No numeric target or hard limit was supplied.
- Refinement ran after actual corpus evidence disproved monolithic serialization. Retain completed 1–4; split old 5 into a useful report/lineage result, immediately necessary bounded storage Structure, and the original real-accounting Behavior. Eleven slices after metadata and terminal-measurement reassessment; no story resplit recommended. Scope and beneficiary unchanged.
- Cumulative design: one native observation/reconciliation model, one file-based snapshot codec and existing atomic/lock primitives. No new North Star topic or ADR; ADR 0002/0008 and the cited launch model still govern. First-live capacity and lossless gap normalization are proved by6. Task evidence7–8 and explicit measurement finality10 precede final pair/report11; each live step requires current regression proof.

## Refinement premises and retained work

Historical scale premises and the metadata reassessment are retained in [execution history](execution-history.md#metadata-reassessment-before-the-repeat). Bounded first import/storage proof is accepted; remaining uncertainty is corrected task metadata and repeat accounting. No new scope, claim or preparation assignment.

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
Disposition: proved by slice 11: default-heap terminal-first and terminal-repeat exited 0 in 440.195s and 438.244s; bounded paged snapshot and streamed CLI reads succeeded; reconciliation retained all prior response IDs/raw facts and repeat preserved all 514402 old observations unchanged, adding only 42 genuine Codex IDs. Final receipt documents exact corpus, memory, counts, dates, phase corrections and explicit unknowns.
Commitment: 1
### G10. Reject injected context as task assignment evidence
Reported: slice 7 — "Bounded actual metadata inspection before the repeat found plugin/AGENTS/environment injection supplying first-task timestamps; one earliest file has no genuine assignment. Skipping future wrappers alone cannot repair persisted starts and monotonic association candidates."
Story clause: "Recover the project, workflow or task, story identity and title at the time, tool, model, effort, launch settings, timing, outcome, and usage where supported."
Disposition: proved by slice 7: recovered-assignment evidence/legacy/mixed/replay/retained/publication actual CLI specs prove source-specific correction, all-response preservation and durable effective eligibility; final40 quiet cases and typecheck passed after independent refactor
Commitment: 57
### G11. Resolve supported explicit historical plan references
Reported: slice 7 — "A retained numeric execute-plan50 invocation has one historical quick plan whose source explicitly identifies SEED-013; the current resolver leaves it unknown. Same-message established identity is positive intent, while prior context and incidental tool reads cannot settle later argless invocations."
Story clause: "Use recorded workflow invocations and historical seed, plan, backlog, or completion records to resolve story references."
Disposition: proved by slice 8: historical-task references/context actual CLI specs resolve unique numbered old source and same-message identity with pinned Git provenance; ambiguous/conflicting/fenced/injected/incidental refs remain unresolved; final43 quiet cases and typecheck passed after independent refactor
Commitment: 60

### G12. Use explicit terminal Claude usage to settle progressive measurements
Reported: slice 9 — "Bounded review after successful9 import found three same-message Claude samples with partial null-stop outputs3/8/4 followed by explicit tool_use outputs690/843/1083; stored output remains unknown because the decoder discards native finality. These are supported terminal facts, not a latest/maximum inference."
Story clause: "A later scan may add evidence or fill a gap"
Disposition: proved by slice 10: claude-completion/replay actual CLI cases settle explicit terminal values, preserve progressive/raw/unclassified evidence and legacy enrichment without duplication; final47 quiet cases and typecheck passed after independent refactor
Commitment: 94
## Execution evidence

Accepted proof, refactor and publication receipts are retained in [execution history](execution-history.md).

## Execution complete

Product advice: no change. Existing queued host usage-view stories can consume the shared records and writer; documented retained-evidence gaps imply no new scope. Process review remains selected and deferred to wrap-up after Intent Coverage.
