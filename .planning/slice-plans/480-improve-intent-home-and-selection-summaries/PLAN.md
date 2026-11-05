# Improve Intent home and selection summaries

**Identity:** SEED-243#improve-intent-home-and-selection-summaries
**Source:** [selected story](../../seeds/SEED-243-intent-home-and-selection-summaries.md#improve-intent-home-and-selection-summaries)
**Prepared:** 2026-11-05. Preparation only; execution needs its own instruction.

## Goal and boundaries

A developer compares Intent entries and their CI proof in aligned columns,
drills into CI-backed entry/folder summaries with cumulative execution time,
and deliberately returns home through Intent without losing the Selected
story's CI branch lens. The source owns scope, examples and the two decisions
Terry accepted; this plan organizes their execution.

Included: semantic homepage and immediate-child tables, deliberate home
activation, file aggregates in the existing CI evidence pipeline, honest
coverage/timing gaps, and replacing selection summaries' source-scanning
proof calculation with that evidence. Existing file reading and tree
navigation remain usable. Historical timing comparisons belong to SEED-244.
This work does not undertake a new runner, local proof generation, CI
case-detail reading, table sorting/filtering, or updates to other projects'
CI producers. Naturally supported inputs need no artificial rejection.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to this plan, execution, delegation, verification and
repair handoffs.

**Local gate:** after slice-local cleanup/refactoring, run the slice's proof,
`npm run lint` and `npm run typecheck:dashboard`. Use
`node --test <paths>` for the pure collector checks and
`npm test -- <paths>` for other named repository checks. For browser proof,
use `npm run test:dashboard -- <specs> --workers=2`, with Homebrew Bash 5
first on PATH. The shared Intent surface has distributed consumers: after
each UI slice run all `dashboard/tests/intent-*.spec.ts` and
`dashboard/tests/development-intent-frame*.spec.ts`, including maintained
replacements when SEED-241 has landed. The consumer table below explains
why. A full unrelated repository suite is not a local gate solely because
CI runs it. For long runs follow the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC use `caffeinate -s -i`; on battery plug in, or keep
the lid open under `caffeinate -i` and inspect the sleep log afterwards.
Use the shared full-suite admission when a full run becomes necessary.
Published execution CI remains owned through its applicable final result.

## Existing solutions and architecture

- **One CI evidence pipeline.** The workflow's composite actions invoke
  `src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs` directly.
  Its report converters, `ci-proof-contract.mjs` and `ci-proof-collect.mjs`
  already own result units, entry ownership, run identity, declared parts,
  exclusions and summed durations. Extend them rather than adding another
  report or inferring file results from entry totals. Edit source guidance
  and scripts under `src/skills`; do not hand-synchronize managed installed
  copies. Keep the publishing reference and CLI examples coherent, walking
  one representative publishing use under the
  [maintainer guidance](../../../AGENTS.md#skill-authoring).
- **One validated read path.** `ciProofArtifact.ts` and `ciAdapterProof.ts`
  validate with the shared contract. `ciProof.ts` separately parses the
  browser answer and must retain the extension too. Reuse those boundaries,
  immutable attempt caches and `shownRunOf`; preserve the judged branch and
  completed-ancestor selection, mismatch refusals, retry and freshness rules.
- **Shared evidence, different scopes.** `IntentCiStatus` and
  `IntentCiProof` currently own judgment and proof under the home view.
  Expose their existing result/read ownership at the Intent scope that
  serves home and selections, retaining branch identity and explicit read
  states. Do not introduce a second CI selector or ask CI again for every
  folder click. `ciProofWording.ts` supplies the vocabulary; use a shared
  execution-time formatter with enough recorded precision to compare child
  scopes. Keep CI wall time's existing meaning and presentation distinct.
- **Hierarchy and opening.** Reuse `immediateChildrenOf` and the browser's
  order and `onOpen`/reveal behavior. Its old surrounding summary calculation
  reads all source files and combines local observations; that acquisition
  does not serve CI summaries. Retire its obsolete summary-only paths after
  tracing consumers, preserving independent file-reading behavior.
- **Explicit action ownership.** `IntentTabs` already receives every click,
  including a click on its selected tab. Keep direct activation separate
  from arrow/Home/End selection and programmatic `onModeChange("intent")`:
  the latter also follows child and candidate opens. Clear only browsing
  selection, not Selected story, tree expansion, reading revision or filters.
- **Accepted decisions.** [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  governs independent Selected story state, disposable reading state,
  rebuildable views and qualified evidence.
  [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
  governs Purpose/Proof and observed results. Under
  [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md), this is
  product-intent design, not a new ADR. Index and relevant in-file statuses
  agree; no conflict, supersession or exception was found. The
  [UX North Star's evidence/freshness and accessibility direction](../../../docs/dashboard-ux-ui-north-star.md)
  applies. Established direction suffices; no new North Star topic is needed.
- **SEED-241 coordination.** Its active plan moves reading state into
  page-held ownership and makes background updates deliberate. Consume its
  current landed shape when execution starts; preserve its reading-state
  contract. Shared files are a reconciliation concern, not a blocking
  dependency. Do not change its scope or edit its workspace. In this
  checkout source-scanning summaries still exist despite older diagnostic
  prose saying their removal had landed; current code and consumers govern
  the work actually required.

## Decisive premises and retained observations

Observed on 2026-11-05 in this owned preparation workspace at
`edc058a91be9b175c952415c1a9f69b8e9d51659`, Node `v24.21.0`.
Fetched `origin/main` at `089d88de7c4c23c831f74b164c677c55ec1e22c8`
adds unrelated planning records and an accepted-attempt-settlement boundary
test repair; the observed Intent and CI proof paths did not change.
All scratch product edits were restored. Recheck an observation
only when a later source change reaches its promise.

| Premise and consuming operation | Form/profile and observed result | Remainder |
| --- | --- | --- |
| Home is empty browsing selection, and existing clearing proof discriminates it; slice 2 | `npm run test:dashboard -- dashboard/tests/intent-ci-status-homepage.spec.ts dashboard/tests/intent-ci-status.spec.ts dashboard/tests/intent-entry-folder-summaries-folders.spec.ts --workers=2` passed four tests. A scratch no-op `onClearSelection` control made the homepage spec fail at `intentCiStatusPage.ts:85` expecting CI visible; restoring it and rerunning the homepage spec with `--workers=1` passed. The initial absent worktree dependencies were repaired with `npm ci`; lockfile unchanged. | New activation semantics get their own proof in slice 2. |
| Raw paths are lost before the summary consumer; slice 3 must extend the pipeline | `node --input-type=module` importing the actual converters and collector: outcomes `passed\ttests/folder/a.sh` and `failed\ttests/folder/b.sh`, times `0.2`/`0.4`, entry `tests`, part/of/attempt `1`, revision `a` repeated 40, then `summarize` for run 1 returned only entry counts 1/1/0 and duration 600 ms. A completed Playwright record with `location.file=/workspace/dashboard/tests/folder/a.spec.ts`, expected outcome and 200 ms likewise yielded only entry counts and duration. Neither retained child paths. | New representation is implementation in slice 3, not a presumed existing capability. |
| Existing converter/collector timing and identity behavior is a usable regression baseline; slices 1 and 3 | `node --test src/skills/dough-test-optimization/scripts/ci-proof-fragments.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-duration.test.mjs` passed 17/17. Inspected assertions include retries counted once as tests with all finished-attempt durations, missing/ambiguous parts excluded and old durations absent. | Within-part timing completeness is new work; part-level duration presence does not establish it. |
| Whole entry totals can exceed the visible inventory; slice 3 | Read `.planning/open-dough.json`'s `tests` include `*.sh` and the actual `fragmentsFromOutcomes` longest-containing-entry rule. The in-memory observation above counts a nested check regardless of that tree filter. | Terry chose existing totals plus an explicit unlisted contribution; do not change includes. |
| Naive file rows need size management; slice 3 | The consuming readers enforce extracted GitHub JSON at 1 MiB and adapter stdout at 64 KiB. A toy object encoding for the actual 744 dashboard spec paths was 86,915 bytes before full identity/parts. This is a proxy sizing warning, not a claimed fit of a selected encoding. | Slice 3 measures its actual produced artifact against the GitHub bound and tests boundary refusal. No adapter producer migration or claim of full-file adapter fit is made. |

## Outside-in proof and consumers

| Source promise / examples | Owning slice and observation |
| --- | --- |
| Comparable homepage entries, retained Proof and CI wall time (1) | Slice 1: CI proof specs inspect semantic table headers and declaration-ordered cells with unchanged counts, units, time, parts/gaps and attempt identity. Wall time remains separate; unknown is not zero. |
| Direct home activation, absent old button, Selected story retained (4, 7) | Slice 2: homepage journey starts at entry, folder and file, clicks the active Intent tab, and uses Enter/Space. Assert CI home and the same judged story branch. Arrow/Home/End and child/candidate opens retain their targets. |
| Entry root, child folders and direct files; nested folder/file drill-down (2, 3) | Slice 3: a new CI-backed summary journey uses actual collector output through the artifact/read boundary; assert root totals, exactly immediate-child table rows, nested summaries, revealed selection, and exact file reading. No source body request occurs for summary navigation. |
| Partial/unavailable proof and time, old evidence, unlisted contributions (5, 6) | Slice 3: missing/ambiguous parts, mixed present parts with and without breakdown, one file with timed and untimed tests, a true zero, an entry-only summary and unavailable proof leave inventory usable and explain their distinct gaps. Include root shell plus nested support check: entry totals retain both and visible rows do not silently account for the hidden contribution. |
| Evidence identity and revision, no false current-source claim (8) | Slice 3: ancestor and story-branch evidence is labelled with run/attempt/revision beside scope summaries; added/unmatched paths show no invented result. Changing selection/branch during a held read cannot render the old answer as the new scope's evidence. |
| Consistent timing semantics and meaningful comparison | Slices 1 and 3: tests/checks stay distinct; retries add duration without adding tests; cumulative execution can exceed CI wall time. Two different sub-minute child durations remain distinguishable at supported precision. Any displayed partial subtotal is explicitly partial. |

The focused Intent suite is the complete UI consumer surface for this
change, not just files naming tables. Before accepting each change, run the
installed consumer-trace command against its diff and disposition each
consumer as run, reused or excluded with the reason the effect cannot reach
it. Carry these known effects into its `--term` arguments:

| Consumer/effect | Required treatment |
| --- | --- |
| `intent-ci-proof*.spec.ts`, execution-time and wall-time specs: listitems and flattened text | Migrate to table/header/row/cell assertions, retaining declaration order, counts, gaps, identity and timing distinctions. Migrate absence assertions to zero evidence body rows plus the exact explanation; zero old listitems would be vacuous. Shared fixtures/stand-ins must retain the extension through the real browser parser. |
| `intentCiStatusPage.ts` and homepage/story/story-gaps/freshness/kept/side-panel specs: return-home and branch lens | Replace helper use of the removed button with direct Intent activation; keep branch identity, running-completed-ancestor selection, freshness, absent locations and covering Side panel coverage. |
| `intentSummaryProofCostPage.ts`, `intent-entry-folder*.spec.ts`, `intent-summary-{proof-cost,slowest,drill-down}.spec.ts` | Replace summary-only local-observation fixtures and source-scan expectations with named-CI scenarios. Keep immediate-child order, root files, hierarchy, reveal, keyboard and completeness proof. Do not weaken them to broad container text assertions. |
| Framework summary and mixed file/summary specs (`intent-{pytest,vitest,cucumber,node-test,playwright}-proof*`), generation, absent/unusable and Purpose/Proof tabs | Deliberately migrate summary provenance/counting/slowest/history expectations; preserve independent file-reading promises that survive. Obsolete local-observation tests do not define restrictions on the new CI summaries. |
| Candidate open/case/tab journeys, `intent-selection-reads.spec.ts`, Development frame | Prove programmatic opens retain targets and direct activation alone clears. Preserve the current source's background/perspective semantics; when SEED-241 lands, use its migrated assertions, including summary navigation's zero source-body reads. |
| Shared contract/CLI, server archive/adapter readers, browser schema | Run converter, collector, duration and CLI suites plus `tests/support/{ci-proof-declaration,dashboard-ci-proof-read,dashboard-ci-proof-parse}.test.mjs` and `src/skills/dough-execute-plan/scripts/ci-command-adapter-proof.test.mjs`. Add missing extension/size/coverage assertions at those boundaries. |

## Slices

### 1. Compare homepage proof entries in aligned columns
Type: Behavior
Status: planned
Proof: the CI proof, ancestor, adapter, reasons, execution-time and wall-time
specs, then the focused Intent suite and local gate.

**Behavior:** open Intent home with a named completed attempt → inspect
Proof → each declared entry has an aligned path, counts/unit, cumulative
execution time and completeness/gaps; Proof identity and CI wall time remain.

Replace entry-list markup with a semantic table and update its observing
fixtures/assertions. Reuse the existing proof reader and wording. Establish
only the shared row/formatting pieces actually useful to this table and the
later scope tables. Preserve all unavailable/partial/ancestor/adapter paths.
Confirm meaningful text/status and keyboard access at narrow width and 200%
zoom in the automated browser journey; contain any table overflow within
the reading pane. Update the maintained Intent documentation.

**Safe stop:** home comparisons improve; entry/folder reading still uses the
prior summary until slice 3. No new claim of file-granular CI proof is made.

### 2. Return home by deliberately activating Intent
Type: Behavior
Status: planned
Proof: expanded homepage/story journey plus candidate-open, candidate tab
keyboard, summary drill-down and focused Intent suites; local gate.

**Behavior:** an entry/folder/file is selected → directly activate Intent by
click, Enter or Space, including while active → browsing selection clears
and CI home returns for the same Selected story. The old return button is
absent. Arrow/Home/End restore reading; programmatic target opens still open
their target.

Wire an explicit home action between the strip and selection owner without
changing the generic mode setter's meaning. Keep reading revision,
expansion, filters, project state and Selected story independent. Adapt
`intentCiStatusPage.ts` and all helper consumers to the accepted action.
Update documentation for direct versus arrow-key selection.

**Safe stop:** navigation is final and independent of evidence granularity.

### 3. Compare and drill into CI-backed entry and folder tables
Type: Behavior
Status: planned
Proof: one collector-output → validated artifact/adapter read → browser
summary journey, contract/CLI/boundary checks above, all focused Intent
consumers and local gate.

**Behavior:** CI has published file contributions → select an entry or
folder → see its root figures and immediate children with comparable counts,
time and coverage; drill through folders or open files. Old/incomplete CI
evidence keeps navigation useful with explicit gaps. Every figure describes
its scope and named CI evidence, including contributions outside the tree.

Extend the existing artifact with optional file aggregates and explicit
coverage/timing information, keeping entry-only summaries valid. Normalize
Playwright file locations from the record's actual run context into
repository paths; never publish machine-absolute paths. Preserve longest
entry ownership and check/test units, final test outcomes and retry time.
Keep counts/duration for unassignable contributions accounted for rather
than fabricating paths. Exclude missing/ambiguous parts as before; without
an expected-file manifest they leave affected child completeness partial.
Distinguish no published breakdown, no matched contribution, measured zero
and missing time within an otherwise present part.

Carry the extension through both shared server validation and the browser
schema. Keep old adapter `proof` operations and limits: an entry-only answer
still shows totals and explains absent breakdown. Do not silently truncate
files or call an incomplete subset complete. Measure actual selected
encoding on representative current-project file inventory against the 1 MiB
GitHub bound, and exercise explicit over-limit/malformed/refusal cases.
Preserve existing adapter over-limit behavior; this story promises no
unmeasured full-file encoding fit or external producer rollout.

Use one existing judgment/proof owner across home and summary views. Derive
scope aggregates by path from that answer, independently of visible
inventory; use inventory for immediate-child rows and explain the
unlisted/unassigned contribution. Preserve evidence revision qualifications
when the tree and attempt differ. Guard late answers by full source,
branch/attempt and selection identity. Replace summary-only source scans
with this path and retire obsolete calculation/orchestration after tracing
its consumers; preserve source-on-demand file reading. Update CI publishing
references and Intent documentation in the same slice.

The new outside-in fixture must start with raw runner reports and run the
actual CLI `fragment` conversion, then `summarize`, before supplying its
artifact/answer. The existing `proofSummary` helper constructs fragments
directly and cannot prove the converters preserve paths. Inspect actual
serialized bytes and assert their values survive the browser's separate
parser. Include two files and a nested folder, root files, the hidden
support-check example, partial timing, missing shard, old summary, ancestor
evidence and a late response. Focused contract cases also cover two present
parts where only one publishes a breakdown (entry totals include both,
children remain partial), and one file containing a timed and an untimed
test/attempt (its known subtotal remains partial). Use these focused cases
for permutations rather than repeating the full UI journey for every invalid
input.

**Safe stop:** all source examples have final behavior. Each slice's proof
must be green before delivery; no CI-breaking intermediary is publishable.

## Current decisions and readiness review

Terry's accepted decisions are recorded in the source. No pre-Take human
decision, product dependency or paid/native observation is required. This
preparation does not select an execution mode, Take the story, or start it.

The common model is one attempt's contributions, grouped by path independently
of the browsing inventory, with counts and timing qualified by coverage.
Homepage and scope summaries share that meaning; home activation is an
independent interaction. Slice 3 includes publication and its consuming UI
because separating them would leave an unconsumed representation and split
the same proof journey. No speculative framework or separate per-folder
aggregation rule is planned.

Slice-plan refinement ran to close proof gaps in conversion, mixed old/new
parts and within-file timing completeness. Retain slices 1, 2 and 3: each
owns one observable outcome and proof loop; the cross-boundary evidence work
remains together. No slices were replaced, no sizing exception was needed,
and no numeric slice target or hard limit was supplied. The resulting count
is three, with no resplit recommendation. This review found no remaining
slice-specific concern. The adapter-size proxy is not an assumption of fit;
legacy compatibility and existing refusals are preserved, and actual GitHub
artifact size is an explicit slice-3 acceptance observation. The preparation
recorder owns the readiness assessment after review; execution is not started.
