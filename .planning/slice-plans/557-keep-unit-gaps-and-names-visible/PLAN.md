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
Status: done
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


### G9. Reuse the active faithful-serving correction before slice 2 completion
Reported: slice 2 — "At slice 2 entry the comparison helper correction and canonical served-evidence contract are already uncommitted in the actively executing no-count-difference-across-gaps checkout; its complete Intent run is observed running. Preserve that exact owner while completing independent duplicate-test removal, then reuse accepted correction and observe its actual served shape."
Story clause: "Comparison test support serves the evidence a test arranges"
Disposition: proved by slice 2: reused the published faithful helper/equality correction from peer 6217de68c3af5dc2b63ecfd91a2fa5a65b5d2956, then independently consolidated its canonical conversion with adapter inputs. Four canonical equality cases passed after refactor, including missing/ambiguous multipart, files/unassigned, unbroken and supported legacy-null evidence. Inspected MakeMe facts through proofInputsForEntries, proofSummaryForEntries, real collector and served artifacts to actual comparison and adapter readers. /tmp/seed281-slice2-refactor-proof-1.json strictly passed all 17 affected comparison/backend cases; peer production count policy was not copied.
Commitment: C8
## Earlier execution evidence

[Execution history](execution-history.md) retains the initial acceptance, failed and passing browser observations, prior stop, retry and two-slice refinement. Current slices, obligations and accepted final-candidate proof remain below and above this link. No earlier verdict is discarded or reclassified.

## Published slice 1 result

Slice 1 is published as `b7e35aa83838aa1eeefdafac8ad726b5c4dbecd7` on the recorded execution branch; its original suffix base is `f75a5e64d37eea73802a125acecd60add4d5dda5`. Local strict proof passed all 389 Intent cases, plus affected Node and backend/default/variant contracts. Guarded preparation, hooks and agent credit passed. [Execution history](execution-history.md) preserves all exact commands, failed and passing verdicts, refactor returns, source freshness, mechanical recovery and publication receipt. No trunk publication or landing-context capture has occurred.

The live observer reports CI coverage success for this exact SHA (run `42758189932`, attempt `1`). It remains running for slice 2 and the final applicable-revision completion operation; this is not its shutdown receipt. Next delivery uses b7e35aa as its previously-published base.

## Slice 2 accepted proof

- The exact active peer correction became public as mrsn-chan’s `6217de68c3af5dc2b63ecfd91a2fa5a65b5d2956`, verified on the remote execution ref. Only its helper and canonical test were reused; no peer production count-policy changes or checkout mutations occurred. The Git-ref event observer ended with terminal 0. G9 now records current served-shape acceptance.
- Canonical equality: `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_TIMES=/tmp/seed281-slice2-equality-times-1.txt OPEN_DOUGH_TEST_OUTCOMES=/tmp/seed281-slice2-equality-outcomes-1.txt bash scripts/test.sh tests/support/story-ci-comparison-entry-summaries.test.mjs` passed all four cases. Missing/ambiguous multipart, files/unassigned, unbroken parts and supported legacy-null/no-present provenance remain exact through the real collector at all three build endpoints. Present/null contradicts documented producer provenance and supplies no authority to change admission policy.
- Actual consumers: `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed281-slice2-helper-proof-1.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/seed281-slice2-helper-times-1.txt caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison-relative.spec.ts tests/intent/intent-ci-comparison-sort.spec.ts tests/intent/intent-summary-story-comparison-signed-sort.spec.ts tests/intent/intent-ci-comparison-units.spec.ts --workers=2` terminated 0: 13 selected/strict passed, 52.242 s. Real published-story inputs and served artifacts reach original sorting, Counts, Parts, tree and file observations. AC, 46% free memory, load 4.10/3.07/3.83, no competing runner; one owned heavy command and default budgets.
- C9: `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_TIMES=/tmp/seed281-slice2-node-times.txt OPEN_DOUGH_TEST_OUTCOMES=/tmp/seed281-slice2-node-outcomes.txt caffeinate -s -i bash scripts/test.sh tests/support/ci-proof-actions.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-units-cli.test.mjs` passed all four cases, 0.532 s. Deleted duplicate’s untimed 0/2 oracle lives in the surviving CLI case; real action wiring remains distinct. No stale timing entry; share preview passed 573 jobs within all ceilings. Historical plan563 is already retired on trunk and stays untouched.
- Return `/tmp/seed281-slice2-proof-return.md` and final trace `/tmp/seed281-slice2-final-consumer-trace.md` retain concrete setups/assertions and all 590 consumer dispositions. Root inspected served shape, real collector and all actual consumers. Combined dashboard typecheck terminated 0; whitespace passed. Slice-1 proof remains valid for unchanged production/input boundaries; no blanket rerun is needed. Independent refactor and guarded publication remain owed.

## Slice 2 refactor and delivery boundary

Fresh independent `/root/refactor_slice2_final` consolidated canonical entry-to-collector conversion into `ciProofEntryInputs.ts`, shared by comparison summaries and the preserved `proofSummaryForEntry` adapter API. `ProofBreakdown` now names the already forwarded optional unassigned figures; removing them would lose actual collector evidence. Only the test-support seam changed. All changed files remain below 250 lines.

Post-refactor canonical equality passed all four cases. The complete four comparison files and four actual backend adapter files passed all 17 selected cases, without retries or timeout changes, in `/tmp/seed281-slice2-refactor-proof-1.json` (67.164 s, terminal 0). Root inspected the actual mixed-unit readings, adapter retention, contextual identity, shared-attempt, restart and failure recovery observations; combined dashboard typecheck session 24355 terminated 0 after the final extraction edits. Original action/CLI proof and published slice-1 production proof remain applicable.

Source freshness returned unchanged at pinned trunk `f1a992a75154f58bde278ef13dc8deba5c375771`, from Take/base `f75a5e64d37eea73802a125acecd60add4d5dda5`. Named SEED-286 and the no-count correction remain Taken, and SEED-287 queued there; no named sibling’s accepted trunk product change affects the slice. All 20 source commitments have current observations or proved linked obligations. The next fresh increment retains b7e35aa as previous-published base and the existing F7Jdln observer.

Refactor accepted with literal `## REFACTOR COMPLETE`: `/tmp/seed281-slice2-refactor-return.md`; `/tmp/seed281-slice2-refactor-consumer-trace.md` disposes all 627 consumers. Canonical post-refactor command: `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_TIMES=/tmp/seed281-slice2-refactor-equality-times.txt OPEN_DOUGH_TEST_OUTCOMES=/tmp/seed281-slice2-refactor-equality-outcomes.txt bash scripts/test.sh tests/support/story-ci-comparison-entry-summaries.test.mjs`. Browser/backend command extends the four-file slice-2 command with `backend-tests/intent/landed-ci-proof-adapter-units.spec.ts backend-tests/intent/landed-ci-scope-adapter-identity.spec.ts backend-tests/intent/landed-ci-scope-adapter-shared-attempt.spec.ts backend-tests/intent/landed-ci-scope-proof-adapter-recovery.spec.ts`, using proof/times `/tmp/seed281-slice2-refactor-{proof,times}-1` with their respective `.json`/`.txt` suffixes. Current proof replaces the pre-extraction helper observation; unchanged setups and assertions were retained. No uncovered affected consumer remains.

## Execution retrospective

Reviewed one planned execution, including its retry, against the earliest ready three-slice plan at f75a5e64 and the evidenced two-slice refinement. Manifest: f75a5e64 is published Take/planning provenance; b7e35aa is retention/naming and owned required-gate repair; 3c3c1da7 is faithful fixture/dedup and shared-conversion refactor. These are the uncontaminated execution publications; peer 6217de68 supplied only two explicitly reused support files, not its product policy. Interleaved trunk stories are excluded.

Outcome: all source commitments are observed or proved; every slice is done. Production gap ownership, known-unit wording and unchanged arithmetic/absence/legacy rules remain coherent through scope, comparison, row and renderer boundaries. Shared canonical fixture conversion is singular; native input/readiness repairs preserve actual publication, defaults, cold transitions and failure signals. Existing domain-rule Node proof, 389-case complete Intent proof, current equality/action/CLI and 17-case actual-consumer proof are sufficient at their recorded boundaries. E2E journeys retain meaningful integration; detailed cases stay at stable domain contracts, and the duplicate adapter recipe's useful oracles remain in its survivor. No additional correction or suite cleanup is supported.

Direction remains aligned with honest published evidence and typed domain mapping (dashboard delivery direction; Accepted ADRs 0002 and 0008); no architectural exception is required. Product advice is no change: no-count and SEED-286 have since landed on pinned trunk, while queued SEED-287 owns the separate remaining performance concern. Process review is enabled by project configuration. ODF-396 received one supported occurrence (planning-basename trace noise), preserving all prior rows and bounded log content; no guidance change or finding implementation is authorized. Earlier agent-history details are limited to retained coordinator/accepted returns; this occurrence uses the current observed trace and actual return only.

## Execution complete

Product advice: no change — the bounded correction is fulfilled; separately authorized count policy and comparison performance have landed, and queued SEED-287 retains the remaining performance concern.

## Completion publication boundary

Freshness is unchanged on 4dc395f0e841661431e51e8f938d4570ba5433cf. Slice 2 publication is 3c3c1da7f49cffdea90a56ded4238487627bd08a, suffix base b7e35aa83838aa1eeefdafac8ad726b5c4dbecd7, with F7Jdln observation reused. This completion increment changes records only, so accepted semantic proof remains applicable. The final applicable branch CI and confirmed observer shutdown remain owed after publication; pending CI is not a success claim.

At the final source check, trunk advanced to 4dc395f0e841661431e51e8f938d4570ba5433cf. Attributed closure commits dacb72f7 (no-count story, integrated by 86d1aabc) and 626b2deb (SEED-286, integrated by 4dc395f0) preserve this selected source. Their retention predicate and faithful helper agree with the accepted correction; their new partial-count policy and faster comparison setup are separately authorized. This branch does not depend on the old across-gap difference policy. Story Wrap Up owns cohesive integration of their endpoint/count seams with our unit-name metadata and renewed affected proof before trunk publication; no human product choice is pending.
