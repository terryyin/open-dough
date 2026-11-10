# Keep each unit's gaps and name visible in Intent CI proof

**Identity:** SEED-281#keep-unit-gaps-and-names-visible

**Source:** [Correction story](../../seeds/SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#keep-unit-gaps-and-names-visible)

**Source review:** [Source-only commitments](source-review.md)

## Source and provenance

Retrospective correction of SEED-281#distinguish-test-cases-and-files-in-ci-proof
(plan 547), reviewed commits `2c1f3122b`, `cee79fdb6`, `365762415` and
`e6de30d46`, released in 0.3.93 at `f97a3f1d2`. The original story promises
that each count names its unit, that missing evidence stays visible at the
level the publisher reports it (example 37), and that an unavailable or
unreported result keeps its evidence gap.

## Current findings at `f97a3f1d2`

1. **A partial unit disappears below its entry.** `dashboard/src/ciScopeProof.ts`
   `holdsResultInside` requires matched paths for a unit with a file breakdown,
   and `unitResultsAt` keeps only units holding results (or the first unit).
   `ciScopeComparisonUnits.ts` then drops that unit's group and turns it into
   an unreported `—`. A location whose test files lost part 2 shows only its
   test cases in a folder or file Summary, and its test files row reads `1 → —`.
   Introduced by plan 547 for locations reporting both units.
2. **Rows name no unit when no later build measured it.**
   `ciScopeComparisonCountsCell.ts` adds the unit only after a later measured
   total: a Baseline-only unit reads `1 → —`, a removed two-unit file reads
   `5 → removed` and `1 → removed`, and a row with nothing counted reads
   `nothing counted`, so a scope's two unit rows cannot be told apart.
3. **Comparison test support serves other evidence than arranged.**
   `dashboard/tests/support/storyCiComparisonEntrySummaries.ts` serves every
   `evidence.parts` entry as a present fragment and keeps a breakdown only
   when `of === 1`, so `missingPart` would be served as a present zero.
4. **A duplicate test.** `tests/support/ci-proof-action-units.test.mjs` repeats
   `ci-proof-units-cli.test.mjs`'s adapter recipe test; the action's unit
   logic is replayed with ci.yml's inputs in `ci-proof-actions.test.mjs`.

## Preserved promises and constraints

- One evidence per unit, per-unit comparison rows, legacy results never
  compare, a unit only one build reports is no measured zero, version 1 reads
  as legacy, and story exclusions (no layout redesign, no change to which
  builds are compared).
- Not decided here: whether a count difference or cue may cross a missing or
  ambiguous part (an older weakness in `ciScopeComparisonCounts.ts`). The
  developer owns that product choice; this plan neither adds nor removes such
  differences.

## Outside-in proof ownership

| Correction promise | Owner | Observable proof |
| --- | --- | --- |
| A unit with a missing or ambiguous part, or no breakdown, stays at folder and file scopes with its gap; in a comparison it is a gap endpoint, never `—` | 1 | Node cases in `tests/support/intent-scope-proof-units.test.mjs` and `intent-scope-comparison-unit-retention.test.mjs` arranged through MakeMe (`missingPart`, `brokenDown`). |
| Every compared row names its unit, including Baseline-only, removed, nothing-counted and gap-only rows | 1 | Node cases for a Baseline-only unit and a removed two-unit file; aligned expectations in `dashboard-ci-comparison-entries.test.mjs` and `summaryComparison*ExpectedRows.ts`, proven by their journeys. |
| Comparison test support serves the evidence arranged; no duplicate action test | 2 | A Node check that served entries equal the arranged ones, including a missing part and a multi-part breakdown; `ci-proof-actions.test.mjs` and `ci-proof-units-cli.test.mjs` keep the deleted test's proof. |

## Slices

### 1. Keep each unit’s gaps and name visible at every compared scope

Type: Behavior
Status: done
Proof: ownership rows 1 and 2; focused real scope/row contracts and the complete Intent consumer suite.

Precondition: a location reports test cases and test files; one unit has missing,
ambiguous, or present-but-unbroken parts, or no later build measures a unit that
Baseline reports. Trigger: read its entry, folder or file proof/comparison.

Outcome: each qualifying unit retains its own gap rather than disappearing,
reading as unreported, or becoming a measured zero; every known compared unit
row names its unit visibly. A missing test-files part beside complete cases
keeps `no CI result` and its own `part 2 of 2 missing` explanation. Baseline-only
reads `1 test file → —`; removed rows read `5 test cases → removed` and
`1 test file → removed`; an empty unit reads `nothing counted as test files`,
reusing established CI status wording. Rows with only gap endpoints also name
their known unit (G3), including the retained no-breakdown rows. Complete absence,
legacy/nonmatching-unit rules, and count/difference semantics stay as specified
above. No layout or compared-build changes.

Reuse the already implemented retention and canonical MakeMe proof. Add the
missing naming cases failing first, align all reached expectation helpers and
journeys, and finish one shared unit/evidence result before its first increment.
Owned required-gate repairs preserve their original observations and defaults.

### 2. Serve exactly the arranged comparison evidence

Type: Structure
Status: planned
Proof: ownership row 3.

Change: `storyCiComparisonEntrySummaries.ts` serves only present parts and
keeps every present part’s breakdown, so MakeMe-arranged gaps reach the
comparison as gaps; delete `tests/support/ci-proof-action-units.test.mjs`.
This directly owns retrospective findings 3 and 4 while preserving external
behavior. Prove the served evidence equals its arranged canonical facts and
retain the distinct CLI/action proof in the two existing owning suites.

## Proof and delivery gates

Follow [AGENTS.md test automation](../../../AGENTS.md#test-automation) and
[native setup](../../../tests/native-setup.md). Run the affected Node tests
through `bash scripts/test.sh`, `npm run typecheck:dashboard`, `npm run lint`,
and before delivering slice 1 `npm run test:dashboard -- tests/intent`
(the consumer boundary of scope and comparison rows), as one background run by
the coordinator with workers chosen for the current load. Trace wording and
row changes with the installed consumer trace.

Local gate: start fully awake; on AC guard long runs with `caffeinate -s -i`;
on battery use `caffeinate -i` with the lid open and read the sleep log
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).
Carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff; attribution is no
exemption. SEED-286 and SEED-287 own the Intent journeys' load timeouts.

## Decisive premises

Observed on 2026-11-09 in the execution checkout at `88c244f77` (code identical
to `f97a3f1d2`) with scratch probes that import the modules and write nothing
(`node <probe>.mts`, job-local `outcome-review/`).

| Premise / consuming operation | Literal observation and result | Remainder |
| --- | --- | --- |
| A partial unit disappears below its entry (slice 1) | `hidden-partial-unit.mts`: location `t` with test cases at `t/a` and test files at `t/c` (part 2 of 2 missing); single-run `t/a` printed only `case \| 3 passed test cases \| 1 of 1 part present`; compared `t/a` printed `test files \| 1 → — \| 1 of 2 parts present`. `empty-folder-parts.mts`: `t/b` printed only `case \| no CI result \| 1 of 1 part present`. | Slice 1 adds the Node cases that fail first. |
| Rows lack their unit (slice 1) | `baseline-only-unit.mts`: `test files \| 1 → —`; overall `5 → 7 test cases (+2); 1 test file → —`. `removed-two-units.mts`: `5 → removed` and `1 → removed`. | Slice 1 adds the missing naming cases that fail first. |
| Test support serves a missing part as present (slice 2) | `missing-part.mts`: parts `[present, missing]` served as `[present, present 0/0/0]`; `missing-part-breakdown.mts`: served evidence had no `files`. | Slice 2's Node check fails first. |

## Current decisions

- One correction for findings 1–4; finding 5 of the review (slow comparison
  journeys) belongs to SEED-286, and the count-difference-across-gaps choice to
  the developer.

## Execution context

- Established Story Branch Mode execution: SEED-281#keep-unit-gaps-and-names-visible; publisher `dashboard-territory.local-open-dough`; agent `chaifeng-chan`; owned execution checkout `/Users/terryyin/git/open-dough/.worktrees/keep-each-unit-s-gaps-and-name-visible-in-intent`; branch `codex/keep-each-unit-s-gaps-and-name-visible-in-intent`. No new claim.
- Starting revision `d8c088e51ced412ec71a0c1e9ce1e3e440dafd74`; accepted claim and initial candidate `f75a5e64d37eea73802a125acecd60add4d5dda5`, confirmed on `origin/main` and the remote execution branch. Increment target is that branch; integration target is `origin/main`.
- Setup: checkout-local `npm ci` with unchanged lockfile, Node 24.21.0, native Chromium check and dashboard typecheck passed. Use `PATH=/opt/homebrew/bin:$PATH` for Bash 5+. Hooks are check-only staged lint and dashboard typecheck. Formatter is changed-files `npm run format`.
- CI source: GitHub Actions `terryyin/open-dough`, verified `ci.yml` (workflow 351271804, name CI). Codex observer coordinator `seed281-chaifeng`, directory `/tmp/dough-ci-501/watch-B92WTd`, PID 99021, session 91371, yielded cell `g713:11`, bound to this checkout and remote execution branch. Trunk claim CI is unobserved.
- No numeric slice target or hard limit supplied; use one bounded proof loop per planned slice. No additional replanning authority requested; retain planned refinement authority.
- Expensive proof: coordinator owns the complete Intent gate before current slice 1 delivery, one owned heavy command at a time; each launch uses the actual host/power/workload decision recorded with its latest evidence below. Named sibling SEED-286 owns its exact active comparison timing repair. SEED-287 is queued and supplies no active-owner exemption for the required Done repairs. Preserve other owners’ processes and files.


## Story obligations

### G1. Keep each unit when every breakdown is unavailable
Reported: slice 1 — "Coordinator inspection found endpointUnitsOf collapses every no-breakdown group to one scope-wide gap, including mixed-unit entries; the slice implementation and two new focused comparison cases correct this."
Story clause: "Below the entry, a unit whose parts are missing or ambiguous, or present without a file breakdown, stays at a folder or file scope with its gap instead of disappearing or reading as unreported."
Disposition: proved by slice 1: tests/support/intent-scope-comparison-unit-retention.test.mjs — mixed-unit comparisons retain each no-breakdown unit; a lone no-breakdown unit keeps its identity. Inspected scopeEndpointUnitsOf to endpointUnitsOf to comparedRowsOf and row endpoint paths; named groups preserve own gaps, and the focused 13-check command passed.
Commitment: C4


### G3. Name rows whose every endpoint is a gap
Reported: slice 1 — "Coordinator inspection found that all-no-breakdown mixed-unit comparison rows retain units in cells.units, but CiProofFigures renders only cells.counts and child/file rows have no visible unit label. Unit naming in slice 2 must cover gap-only rows as well as the enumerated Baseline-only, removed, and nothing-counted examples."
Story clause: "which unit every compared row counts, at every scope."
Disposition: proved by slice 1: tests/support/intent-scope-comparison-unit-names.test.mjs: real scopeComparisonRowsOf Counts cells, canonical MakeMe facts, all nine cases passed; final independent-refactor 13-file Node command terminated 0. CiProofFigures consumes these Counts cells; complete Intent gate is separately held by G5. Inspected endpoint groups through rowEndpointOf, countsCellText and CiProofFigures; mixed and single no-breakdown groups, partial no-result units and unmatched nothing-counted groups retain visible unit names. Unknown complete absence stays generic.
Commitment: C3
### G4. Preserve the cold Proof transition in required browser repair (corrected; renew native evidence)
Reported: slice 1 — "Independent acceptance found the repaired Proof case selected Proof before the push, whereas the original failed journey restored Purpose after project refresh and then opened Proof. Cached Proof could pass without the original transition. Return to repair implementation before accepting this browser proof."
Story clause: "Developers reading Intent's CI proof and comparisons"
Disposition: proved by slice 1: current-identity cold Proof journey in /tmp/seed281-resume-focused-proof-1.json; strict terminal passed, one Proof case 8.666 s, actual ready Purpose restoration then cold Proof and refreshed-project roundtrip. Current MakeMe identity is exercised; implementation remains unchanged.

### G5. Required Intent gate awaits the active sorting-repair owner
Reported: slice 1 — "The coordinator’s second full Intent run selected 386 cases and terminated failed: 385 passed and the comparison Summary sorting journey timed out. SEED-286/ealden-chan already owns the exact comparison-family repair, with active uncommitted sorting/support work in its separate execution checkout. Preserve that work; obtain the accepted upstream repair and renew this gate rather than writing a duplicate repair."
Story clause: "Developers reading Intent's CI proof and comparisons"
Disposition: proved by slice 1: /tmp/seed281-final-full-intent-proof-1.json, exact root command session 89529 terminated 0; strict passed all 389 current-tree cases in 1061.883 s at 04:39:08.775Z, preserving every default budget and original scope/summary/Done/native assertion. Concrete input/readiness/worker repairs and final refactoring precede this gate; prior failed and contended verdicts remain in linked history and current evidence. Historical comparison timing repair remains with exact active SEED-286/ealden-chan at 76015682179bcf87353da6c1cbbc6da5b86e11ca, whose integrated family/exact published CI is still its remaining gate. Under the active-owner clause, preserve that work and write no duplicate repair; this local pass does not claim that a retry established its repair or that the separate performance story is complete. This slice's own applicable published CI remains owed to the execution observer.

### G6. Canonical endpoint arrangement in the new retention proof
Reported: slice 1 — "Final data review found the new retention test directly constructed a production ComparisonEndpointProof envelope outside MakeMe. The shared typed aComparisonEndpointProof getter and delegated test helper now correct that project-rule violation without changing evidence facts or assertions."
Story clause: "Comparison test support serves the evidence a test arranges"
Disposition: proved by slice 1: tests/support/makeMe.mjs typed FactBuilder/copyFacts API and intent-scope-comparison-unit-retention.test.mjs; retention and native-evidence-identity checks plus dashboard typecheck terminated 0. Fresh independent refactor accepted the data concept with no edits.

### G7. Current full gate exposes two further Done reading timeouts
Reported: slice 1 — "The final combined full Intent run timed out in intent-done-landed-review-mode.spec.ts while waiting for live review source, and intent-done-prior-execution.spec.ts while opening the original completed review. Both exhausted the default 30-second test budget; actual cause is not yet accepted."
Story clause: "Developers reading Intent's CI proof and comparisons"
Disposition: proved by slice 1: /tmp/seed281-done-input-focused-proof-2.json, terminal exit 0 and strict passed all 15 complete original Done/default-history/input-contract cases in 198.468 s. Inspected initial published-read readiness, actual canonical Take/implementation/CLI completion inputs, held historical/live responses, selected source and final diff/focus/history assertions. All seven original and two additional native timeout journeys completed at their default budgets after the concrete input/worker/readiness corrections and prospective sequencing against the known competing full-family process. Failed contended verdicts remain; this is current boundary proof, not a claim that warming repairs every historical native cost or that arbitrary host load is safe. The required final complete Intent verdict remains G5.

### G8. Required-gate repair introduced a separate worker fixture population
Reported: slice 1 — "PFE acceptance found queuedOriginReady declared in intent-done-retained-landing.spec.ts, contrary to the maintained single worker-registration owner in support/pageTest.ts. Its origin-input purpose is valid, but the local declaration creates a distinct worker fixture pool and must be corrected without adding resources to unrelated callers."
Story clause: "Developers reading Intent's CI proof and comparisons"
Disposition: proved by slice 1: pageTest is the sole nonauto queuedCodexOriginReady registration, with demand only in the five actual native Done consumers. /tmp/seed281-done-input-focused-proof-2.json passed all five real native readers and unrelated ordinary/Claude-origin consumers, with no added queued dependency for those other callers. Pinned worker fixture setup uses its own default project-timeout slot; no timeout override or result moved to setup. Combined dashboard TSC and inspected registration/import/caller paths confirm one worker pool, canonical input owner and original caller cleanup.

## Earlier execution evidence

[Execution history](execution-history.md) retains the initial acceptance, failed and passing browser observations, prior stop, retry and two-slice refinement. Current slices, obligations and accepted final-candidate proof remain below and above this link. No earlier verdict is discarded or reclassified.

## Current combined slice 1 proof

- The pre-naming two-worker run ended strict failed: 386 selected, 383 passed, one failed and two timed out, duration 1186.607 s. Evidence `/tmp/seed281-resume-full-intent-proof-1.json`, retained output `dashboard/test-results/2026-11-10T01-58-04.621Z-40704/`. `proof-record-interruption.spec.ts` exhausted its generic five-second readiness poll before SIGINT; both missing-run Check again/reselection journeys exhausted their default test budgets. The comparison-family journeys remain with the exact active SEED-286 owner, without duplicate changes here.
- Owned readiness repair: `waitForProofState` observes actual proof snapshots until progress, producer exit, or actionable read/predicate error, using the remaining default test deadline through the established timeout-0 matcher pattern. Only ENOENT is pending. Original SIGINT, forced group kill, intentional eight-second run deadline, final record assertions and caller-owned cleanup remain. Historical child output was discarded, so slow startup versus early exit is not retrospectively distinguishable; no stronger cause is claimed.
- Focused readiness command terminated 0, strict passed all 21 cases in 11.953 s: `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed281-proof-record-focused-1.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/seed281-proof-record-times-1.txt caffeinate -s -i npm run test:dashboard -- backend-tests/intent/proof-record --workers=2`. New real-process checks observe early exit, original predicate error, EISDIR read error and caller cleanup. Trace `/tmp/seed281-proof-record-consumer-trace.md` accounts for all importers; unchanged construction, reading and split APIs reuse their observations. This does not replace the required final full Intent verdict.
- Unit naming now passes all nine MakeMe-arranged cases in `intent-scope-comparison-unit-names.test.mjs`: Baseline-only and removed units across entry/folder/file, empty units, mixed and single-unit no-breakdown rows, partial gap-only rows, and unmatched empty groups. The no-breakdown classification is preserved for the existing never-in-compared-builds guard; endpoint groups carry wording context without changing arithmetic, timing, sort keys or cues. Expected rows in both browser helpers were aligned. Focused Node command terminated 0: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/intent-scope-*.test.mjs tests/support/intent-ci-proof-*.test.mjs tests/support/intent-ci-comparison-*.test.mjs tests/support/dashboard-ci-comparison-entries.test.mjs`. Traces `/tmp/seed281-unit-names-consumer-trace.md` and `/tmp/seed281-unit-names-focused-consumer-trace.md` reach the enclosing browser observations; their final current-tree gate remains outstanding.
- Combined dashboard typecheck terminated 0 after both implementation writers froze. A fresh independent combined refactor owns the two over-size comparison modules; root will accept its return and run the resulting combined typecheck before the final current-tree Intent selection. No formatting, lint, staging, commit or publication has occurred.
- Independent combined refactor `/root/refactor_combined_units` returned frozen edits and `## REFACTOR COMPLETE`: endpoint wording moved to `ciScopeComparisonEndpointCountWords.ts`, row matching/projection to `ciScopeComparisonUnitRows.ts`, original exports preserved. Formatted sizes are 241/88/155/109 lines for CountsCell/new wording/Units/new rows; all 27 changed files fit the 250-line limit. Type-only imports avoid a runtime cycle; classifications and arithmetic remain unchanged. Final 13-file focused Node command above and `git diff --check` terminated 0. Traces `/tmp/seed281-combined-refactor-consumer-trace.md` and `/tmp/seed281-combined-refactor-focused-consumer-trace.md` dispose all consumers. Backend readiness and earlier repair proof stay valid because those boundaries were untouched.
- Final current-tree full Intent selection is required after the actual naming and readiness changes; it is not an unchanged retry of the earlier failed tree. Pre-launch local macOS at 11:09: AC charged, 16 CPUs, load 3.88/4.59/4.97, 70% free memory. Prior two-worker complete selection took 19m47s, selected 386 cases; three added backend checks make 389 expected. Use maintained ordinary two workers under `caffeinate -s -i`, sequence all owned heavy work, preserve other worktrees. Unknown competing future load is not a waived defect. Reconsider after actual failure/contention or changed ownership; retain strict failed verdicts. Root owns command and terminal evidence `/tmp/seed281-combined-full-intent-proof-1.json` and `/tmp/seed281-combined-full-intent-times-1.txt`. SEED-286 remains active, now at `c216dc242`, not on fetched trunk `7ff9a21f8`; no duplicate comparison timing repair is authorized by this run.
- Combined post-refactor TSC terminated 0. Full Intent run terminated exit 1, strict failed: 389 selected, 382 passed, six timed out and one failed, 1067.801 s, from 03:11:36.428Z to 03:29:23.022Z. All comparison journeys, the earlier retained-landing reading repair, and all proof-record interruption cases passed in this run; that observation does not establish a fix for the still-owned historical SEED-286 defect. Seven current failures remain G7: landed-review-mode, prior-execution, refresh-proof, refresh-reading, retained-workspace, review-modes and source-selection. No unchanged broad retry is authorized by this verdict.
- Bounded read-only diagnosis `/root/done_gate_diagnosis`: six outer-budget failures accumulated actual setup/serial reads; later reported aria-busy/showColumn errors in two were teardown collateral. The refresh-proof inner five-second rest poll never obtained its first bounding box while Done data was arriving, so readiness was charged to a movement observation. At 11:22 local load was 26.02/16.80/10.87, memory 62% free; a separate worktree's full two-worker Intent run began at 11:14:58 after this run began. It and its files were observed only, never stopped or changed. No sleep occurred in the run window. Contention attribution is no exemption or repair.
- PFE revisited the existing owners before further implementation: `dashboard/tests/README.md` synchronization requires waiting for the actual answer before an assertion's bound; `pageRequestNotes.ts` owns published-work/chained-read readiness. The same README and `support/pageTest.ts` require every worker fixture registration in pageTest to preserve one worker population; the earlier local `queuedOriginReady` fixture must be corrected. New responsibility or promised transitions will not move into fabricated setup; a bounded candidate/consumer assessment is in progress. [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md) requires one coherent existing owner and stop-and-fix; [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md) preserves real published state, selection and reading semantics; [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md) requires retaining the useful observations and stating cost/benefit limits. Index and relevant in-file statuses are Accepted, with no supersession or conflicting decision found.


## Bounded Done gate repair decision — 2026-11-10 11:38

- The combined full selection terminated strict failed: 389 selected, 382 passed, six timed out and one failed; 1067.801 s, 03:11:36.428–03:29:23.022Z. Retain `/tmp/seed281-combined-full-intent-proof-1.json` and its seven original journeys. Trace diagnosis distinguishes six cumulative default-budget failures from the first board bounding-box wait consuming the rest poll. Later landed-review and review-mode assertions continued during teardown and do not independently establish product defects. Competing owned work increased load to 26; no sleep entry was found in the observed run window. These facts waive no failure under [the project policy](../../../AGENTS.md#failing-and-flaky-tests).
- PFE selected existing owners: `pageRequestNotes.openUntilRead` before initial Done-board movement, the one worker-fixture registration home `pageTest`, and an explicit plain-trunk input path in `completedPublishedStory`. Keep default shared/interleaved and variant history unchanged. Opt in only inspected retained-workspace/review-mode, project-refresh Purpose/Proof and first source-selection completion inputs; keep canonical Take, actual changes, real CLI completion/publication and every original browser transition/assertion. Reject unsupported plain-path combinations. The landed-review-mode input may omit its unrelated pre-integration writer because its later trunk publication still supplies the distinct observed head.
- Move queued Codex-origin input preparation to a nonauto worker fixture registered only in `pageTest`, demanded only by relevant native readers. The pinned Playwright runner gives worker fixtures their own default project-timeout slot; no timeout override or mandatory resource for unrelated callers follows. Initial board readiness must not await the held comparison/locations transitions.
- This input/readiness repair does not yet settle native prior-execution's cumulative budget: it already omits the unrelated writer. Preserve its complete original journey in the focused selection and diagnose recurrence separately. G5, G7 and G8 remain open pending evidence and independent acceptance. No product, admission, animation or default-timeout policy changes are authorized.


## Bounded Done input proof return — 2026-11-10 11:53

- Implemented only the selected test-input/readiness owners. `completedPublishedStory` keeps its original default rich history and opts inspected plain trunk readers into `completedStoryInput`; incompatible variants, integration edits, shared-parent setup and before-completion hooks reject before mutation. New implementation facts use MakeMe repository revisions. Initial Done selection and source-selection use the existing published-work wait before unchanged Board movement/rest checks. All browser assertions, live/historical transitions and default budgets remain.
- `queuedCodexOriginReady` is registered nonauto solely in `pageTest`. All five actual native Done consumers now demand that same existing queued input through `beforeAll`; completion-provenance and default-answer-selection were added only after the focused command terminated. No new mandatory resource is requested by other consumers. The first native focused case had a cold origin fixture at 0.015–6.128 s, while default-answer already had a warm copy at 0.020–1.165 s but its native launch did not finish until 27.327 s. Input preparation explains the first cost only; it does not settle the second failure.
- Literal command: `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed281-done-input-focused-proof-1.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/seed281-done-input-focused-times-1.txt caffeinate -s -i npm run test:dashboard -- tests/intent/intent-done tests/intent/intent-story-completed.spec.ts backend-tests/review/story-review-uninterleaved-input.spec.ts --workers=1`. Owned session 74746 terminated exit 1. Strict failed: 15 selected, six passed, seven timed out and two failed, 482.603 s, 03:43:11.953–03:51:12.301Z. Artifacts: `dashboard/test-results/2026-11-10T03-43-09.594Z-76317/`. No sleep entry was found in the observed window. Preflight AC charged, 58% free memory, load 9.09/8.40/9.27; observed load later reached 30.61/24.34/17.30 with another owner's complete Intent family active. No process or admission policy was changed.
- Positive original observations: cold Purpose-to-Proof refresh 28.057 s; Purpose/reading-place refresh 22.408 s; unchanged-default project freshness 24.415 s; retained capture reading 29.639 s; unavailable-history retained-workspace 22.089 s; incompatible-input rejection contract 12.109 s. These observations apply to their own unchanged boundaries after the final two native demand declarations.
- Remaining failures are retained individually: completion-provenance, default-answer-selection, landed-review-mode, prior-execution, readable retained-workspace, review-modes and full-history completed-story timed out; published retained-landing and source-selection failed at their outer test deadline during initial Board entry. Native landed setup itself continued past its budget before opening the Board, so readiness is not its complete repair. Readable-workspace and review-modes still expired during original historical diff reading. No count/text assertion mismatch or common product defect was established; every failed verdict still needs its actual cause/disposition and missing observation. No unchanged retry follows. G5/G7/G8 remain open for coordinator acceptance and the final required gate.
- Consumer records: `/tmp/seed281-done-input-consumer-trace.md` and `/tmp/seed281-done-input-enclosing-consumer-trace.md`. Default/variant completion bodies retain their former semantics; the original full-history browser was selected and its later diff journey timed out, so this focused verdict does not replace its required complete observation. The enclosing comparison/summary continuations remain the coordinator's complete Intent gate. Root owns independent refactor, final typecheck, changed-environment proof selection and delivery. No formatting, lint, TSC, commit or publication ran in this repair.
- Coordinator combined TSC on the frozen repair terminated 0 (session 60015). Inspection retained the original full-history defaults and exact assertions; failed published-retained/source-selection reports were outer-deadline failures during Board entry, not different expected text. The final two input-demand declarations await the next native observation.
- Expensive-proof reassessment: a known simultaneous complete Intent family concentrates real native/Git work, and the focused launch's headroom premise did not hold (load reached 30.61). No further unchanged run is launched into that overlap. Existing resource guidance explicitly keeps named/path selections independent, so its full-suite admission cannot be silently broadened. The coordinator defers the next current-candidate observation until the observed competing runner PID 88024 ends, then reassesses actual active workload/load/memory/power. A read-only Darwin exit observer (owned PID 98833, session 55309) observes that event without signalling the other owner. This is bounded diagnosis of the changed environment and current inputs, not a passing-retry repair claim or waiver; independent fixture/assertion defects remain owed. No timeout, admission, animation or coverage policy changes follow.
- The read-only observer terminated 0 after observing PID 88024's exit; its own kqueue closed and process ended. Pre-launch 12:00 local macOS: no other dashboard runner in bounded process inventory, AC charged, 16 CPUs, 59% free memory, load falling to 6.53/16.00/17.18. Root owns one bounded 15-case current-candidate observation at one worker under `caffeinate -s -i`, using the same Done/default-history/incompatible-input selection and final two native fixture demands. Hypothesis: overlapping complete families were a material cause of the varying setup/read deadlines; this observes the concrete corrections with the known competing family absent. Require every original oracle/default budget and strict pass; any independent assertion or recurring fixture defect returns for repair. This is not a measured speedup or blanket flakiness disposition. Literal command uses `/tmp/seed281-done-input-focused-proof-2.json` and `/tmp/seed281-done-input-focused-times-2.txt`; prior failed evidence remains. No other root heavy command runs; reconsider after any new competition/failure before another expensive attempt.
- That exact coordinator-owned command (session 36722) terminated 0, strict passed all 15 in 198.468 s at 04:04:12.504Z. Native completion-provenance/default selection/landed live mode/prior execution passed in 18.241/13.756/13.761/15.767 s; cold Proof/Purpose refresh passed in 13.196/10.756 s; both retained landing readers, readable/unavailable workspace, held mode/source transitions and incompatible-input rejection all passed. The default rich-history comparison completed in 22.141 s with its original outsideCount 6 / nine-file oracle. No promise was moved out of proof. Conditions differ from the failed contended run, so no isolated speedup or universal load guarantee is claimed. G7/G8 now record these sufficient current observations; G5 still owns the required final complete Intent gate. Production unit/retention Node proof and backend interruption proof remain valid because their implementations were untouched by this repair. A fresh independent refactor now reviews the implicated completion-input, fixture and readiness responsibilities before final full proof/delivery.
- Independent `/root/refactor_done_inputs` returned frozen edits and `## REFACTOR COMPLETE`. One canonical Take/MakeMe implementation/optional rich history/CLI publication sequence now lives in `completedPublishedStory`; `completedStoryInput` owns options, refusal and shared implementation facts. Original rich-history statements and publication tail are AST-identical modulo formatting. Only these two modules changed (241/49 formatted lines); readiness/native registration and production comparison code stayed unchanged. Trace `/tmp/seed281-done-refactor-consumer-trace.md` disposes all 75 consumers and retired/new exports. Root inspected the actual guard, canonical files and unchanged history branches.
- Refactor proof terminated 0, strict passed 12 in 131.562 s at 04:11:58.421Z: `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed281-done-refactor-proof-1.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/seed281-done-refactor-times-1.txt caffeinate -s -i npm run test:dashboard -- backend-tests/review/story-review-completed.spec.ts backend-tests/review/story-review-completed-conflicts.spec.ts backend-tests/review/story-review-uninterleaved-input.spec.ts tests/intent/intent-done-review-modes.spec.ts tests/intent/intent-done-project-refresh-proof.spec.ts --workers=1`. Whole backend suites observe Trunk/Story Branch isolation, immutable literal diffs, later history, own/non-owning/conflict variants, and unchanged refs/status on refusal; browser cases preserve cold Proof and held live/historical review transitions. Unchanged native/readiness observations remain applicable. Root combined TSC session 77123 then terminated 0.
- The planning-record size return is resolved without an exception: the cohesive earlier execution/retry block moved verbatim to linked `execution-history.md`; live slices, obligations and current accepted proof remain here. All 40 changed files were in-memory formatted/count-checked (no writes), maximum 242 lines; the linked history has 65 and this plan remains below 250. The obligations listing still succeeds. No failed verdict, source promise or progress was deleted or reclassified. Formatter/lint/staging/commit/publication remain pending behind G5.
- G5 launch reassessment at 12:18: AC charged, 16 CPUs, 57% free memory, load 14.34/12.29/13.39. A fresh SEED-286 complete performance family (runner 45518) and a three-case, one-worker comparison selection are active elsewhere; root defers the long gate rather than overlapping the known large family. Read-only observer session 4899 / PID 17798 owns only its kqueue until runner 45518 exits; no other owner is signalled. All implementation/refactor writers are frozen, combined types and affected proof passed. Once that family ends, recheck actual workloads/headroom and run the complete 389-case Intent selection at ordinary two workers, under `caffeinate -s -i`, with evidence `/tmp/seed281-final-full-intent-proof-1.json` and `/tmp/seed281-final-full-intent-times-1.txt`. Prior complete run cost 17m48s; expect roughly 18–20m. Root owns terminal observation; strict pass is required. New competition/failure calls for reassessment, not unchanged retries or an altered gate.
- Observer 4899 terminated 0 after runner 45518 exited and closed its own kqueue. Actual launch 12:21 local macOS: no other dashboard runner in bounded inventory, AC charged, 16 CPUs, 56% free memory, falling load 8.74/11.21/12.79. All root writers/other heavy commands are idle. Root launches `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed281-final-full-intent-proof-1.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/seed281-final-full-intent-times-1.txt caffeinate -s -i npm run test:dashboard -- tests/intent --workers=2`, owning its terminal result and any actual failure diagnosis. This is the required final-current-tree observation after concrete input/readiness/refactor corrections and the known competing family’s exit, not an unchanged overloaded retry.
- Final complete local gate accepted: that exact command/session 89529 terminated 0, phase completed, runner/strict passed, 389 selected and 389 passed, 1061.883 s, 04:21:28.405–04:39:08.775Z. All 13 Done readers, full-history comparison, real interruption, unit/comparison/summary journeys completed with their original assertions and default budgets. Proof/times are the two final-full files above. G5 records the current local boundary and the retained exact external-owner coordination separately; no historical verdict is erased or called repaired by a retry.
- Delivery source freshness is unchanged at fetched trunk `6894595d74b58a6a4f90ba7f2b02d88cacc3b924`, base accepted claim `f75a5e64d37eea73802a125acecd60add4d5dda5`. Named SEED-286 remains Taken with active branch work (760156821), and SEED-287 remains queued; neither has a closing/attributed product landing in pinned trunk that changes this slice's relied-on unit/count/sort/fixture behavior. Targeted pinned diff of those boundaries is empty. No amendment or readiness renewal is needed. CI observer PID 70291 is still live under exact directory F7Jdln/coordinator seed281-chaifeng; no increment has yet been staged, committed, published or registered.
- First guarded fresh preparation stopped at formatting: eleven lint findings in the five readiness hooks and fixture property (`require-await`, unused expression and invalid void property). It committed/published nothing and preserved the formatting edits/index. Mechanical repair uses `undefined` as the existing readiness value, explicit `use(undefined)`, and hooks returning `Promise.resolve` of that already-resolved fixture value. This preserves fixture demand/setup order and the same resolved hook promise; no origin generation, browser action, assertion, default budget or lifecycle changed. The accepted complete 389-case/default/native proof remains semantically correspondent; retry only the failed preparation and its mandatory checks. No fresh candidate receipt exists yet.
- Second fresh preparation passed selective format and required full lint, checked obligations and marked current slice 1 done in the owned working plan, then stopped on staged whitespace: one new blank line at history EOF. Forty owned files are staged; no commit/publication/candidate receipt exists. Trim only trailing EOF whitespace, preserve all history content and staged ownership, and retry the same fresh request. Its selected already-done status is the documented preparation recovery, not delivered progress. No semantic proof is invalidated by the record whitespace repair.
