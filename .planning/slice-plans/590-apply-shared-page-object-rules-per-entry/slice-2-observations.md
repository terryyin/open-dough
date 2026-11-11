# Slice 2 observations

Base `48fd7667f08c15e5121be38593e11fb659f20298`; same owned checkout/branch and execution identity as PLAN.md.
No commit, publication, refactor pass, formatting, or hook-owned lint by implementation agent.
Follow [AGENTS.md failure policy](../../../AGENTS.md#failing-and-flaky-tests) as written.

## Current result and receiving gap G2

One pure declaration grammar moved to `dashboard/src/intentLocationsDeclaration.ts`; server exports/types remain available. Boolean flags are retained independently. Safe-path validation moved unchanged to existing `repositoryPath.ts`, reexported server-side. Existing membership source remains the sole matcher. The shared public `test-entry-rules.mjs` command uses a generated import-free ESM runtime from those owners and the two-rule selector; no second matcher or generic registry.

Generation: `PATH=/opt/homebrew/bin:$PATH node scripts/build-test-entry-rules.mjs`; check: `PATH=/opt/homebrew/bin:$PATH node scripts/build-test-entry-rules.mjs --check` (pass). Generated source provenance and all bundled dependency licenses travel beside the runtime. Payload declarations/install/update remain slice 4.

The lean page-object gate and execution delegation share `references/test-entry-rules.md`. Planned/planless delegation checks known test paths before authoring; authors must check newly identified intended paths before writing tests. One convention owner remains `dough-page-objects/references/convention.md`.

**G2, uncovered source scope/key example 1:** “Deliver standalone guidance through Codex, Cursor and Claude Code's existing skill layouts; prove useful application and all four MakeMe/page-object choices.” Commitments 44/46 and the both/MakeMe-only portion of 72 remain owed. Commitment 71's four-entry selection is proved, not their authored application. Named MakeMe sibling is absent from pinned trunk `c6d2645eea2fe0a440a21d6015da12212117761c`; no sibling worktree inspected/edited and no substitute convention invented.

Current failure path is explicit: with `makeMe:true`, the command resolves applicability and returns `makeMe:true` plus the independent `pageObjects` result. `status:resolved` is only selection. The common reference requires unavailable selected guidance to be reported unresolved and withholds edits requiring it; independent page-object work may continue. There is no shared MakeMe source to load in this Proposed candidate. Receiving work must integrate the actual MakeMe owner through normal integration, reconcile this common boundary, and observe useful both/MakeMe-only authored results before counting the four-choice promise complete. This is no request to drop scope or to treat selector output as application.

## Focused proof

P1 command: `PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/test-entry-rules.test.mjs tests/support/test-entry-rules-standalone.test.mjs tests/support/page-object-native-fixture.test.mjs` — pass, exit 0.
Setup: `makeMe.anIntentLocation`, `makeMe.intentSettings`; exact invalid values remain in cases. Filesystem and copied script layout are harness actions. No test file must exist for selection.
Signals: four-entry booleans; include excludes production sibling; custom sources override legacy fields; case-sensitive extension and glob; overlapping true entries independently win; absent/false/non-boolean flags off; malformed/unreadable distinct from absence; unsafe inputs never widen membership. Generated correspondence `--check` performs no writes; copied command executes outside this repository without npm dependencies; malformed JSON exits 1 with unresolved output. Fixture executes copied command under Codex/Cursor `.agents` and Claude `.claude` roots with expected source-specific results.
Initial copied command exposed `/tmp` versus `/private/tmp` direct-entry identity mismatch. Fixed by reusing existing `ci-direct-entry.mjs`; full P1 rerun passed.

P2 command: `PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- dashboard/backend-tests/intent/authenticated-read-intent-selection.spec.ts` — pass, exit 0.
Setup: existing shared MakeMe settings/repository harness; first declaration explicitly selects page objects true/MakeMe false.
Signals: public authenticated listing echoes both flags and admits matching spec, refuses unmatched production sibling without reading contents; existing sources precedence/custom selection remains green.

P3 command: `PATH=/opt/homebrew/bin:$PATH npm run test:dashboard -- dashboard/backend-tests/intent/authenticated-read-intent-locations.spec.ts dashboard/backend-tests/intent/authenticated-read-intent-locations-problems.spec.ts dashboard/backend-tests/intent/intent-location-syntax.spec.ts dashboard/backend-tests/intent/intent-story-overlay.spec.ts dashboard/backend-tests/observation/authenticated-read-refusal.spec.ts` — pass, exit 0. Existing fixture setups/proof retain listing, problem distinction, source syntax, overlay membership and authenticated refusal after parser/path modularization.

P4 command: `PATH=/opt/homebrew/bin:$PATH npm run typecheck:dashboard` — pass, exit 0. Covers shared JS/TS declarations/builders and existing frontend/backend consumers.

P5 command: `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i npm test -- tests/support/page-object-native-browser-proof.mjs` — pass, exit 0. MakeMe-described library/browser fixture; control scenario preserves held-read loading/order/request evidence, visible expected titles; wrong expected title fails with expected and actual. This harness control is not native-authored use.

P6 command: `PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/consumer-trace-guidance.test.mjs src/skills/dough-execute-plan/scripts/interrupted-delegation-guidance.test.mjs src/skills/dough-execute-plan/scripts/overdue-delegated-verification-guidance.test.mjs src/skills/dough-execute-plan/scripts/read-budget-guidance.test.mjs src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-guidance.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-source-review-guidance.test.mjs tests/support/intent-candidates-location-match.test.mjs` — pass, exit 0. Existing static guidance contracts and MakeMe-built candidate-location behavior remain green. Static checks do not prove application.

`git diff --check` — pass. Changed implementation files are at most 250 lines; largest touched existing files are backend selection spec244 and delegation244 before coordinator formatting. No full suite run.

## Native renewal and reusable evidence

Host basis: macOS AC power, 100% charged, load2.88/3.76/5.24, memory-pressure reports50% free; no competing active browser/native authoring session found. Existing idle Cursor MCP sessions and CI observers preserved. One native session at a time under `caffeinate -s -i`; both commands reached terminal exit and owned watchdogs/browser/server ended.

N1 command: `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash tests/support/page-object-native-run.sh codex on /tmp/page-object-307-slice2-codex-on` — exit0, exited/complete; codex-cli0.167.1.
Setup: unchanged MakeMe-described library project, manual candidate copy, browser pageObjects true and makeMe absent/off; prompt supplies scenario only, no rule/visibility cue.
Signals: native calls read lean gate and common reference; installed CLI returns browser source `makeMe:false,pageObjects:true`; convention loaded. Authored `project/browser/library.spec.mjs` reuses LibraryPage→ItemPanel, keeps Atlas/Boreal order and values visible, awaits heldRead.started then showsLoading, asserts ['atlas'] before release and ['atlas','boreal'] after handoff. Actual `node run-tests.mjs browser/library.spec.mjs` outputs SCENARIO PASSED. Only requested scenario added beyond installed harness.

N2 command: `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash tests/support/page-object-native-run.sh codex off /tmp/page-object-307-slice2-codex-off` — exit0, exited/complete; codex-cli0.167.1.
Setup: fresh project/session; both entries pageObjects false, makeMe absent/off.
Signals: native reads gate/common reference and invokes installed CLI for legacy path -> both false; no convention loaded. Authored legacy scenario uses direct UI mechanics, independent held read, loading/title/read-order assertions and passes SCENARIO PASSED. Application/harness unchanged.

Both directories retain events/calls/response/version/result, actual authored source and candidate-hashes.json. After these runs, the common reference clarified unavailable selected-rule behavior and selection status; only MakeMe-true missing-guidance path is affected, which N1/N2 never enter. Runtime and exercised pageObjects paths are unchanged.

Claude: reuse slice1's actual native discovery/Skill activation (same description/native layout), independent visibility/convention application, and useful passing browser scenario. No fresh observation of Claude invoking the new command is claimed; shared command behavior is now directly proved and representative new-gate authoring observed in Codex. Assess final gate/delivery correspondence in slice4; do not infer Claude's new native invocation from Codex.
Cursor: Terry's explicit current-execution native skip remains skipped/unverified. No auth retry. P1 deterministic copied-layout command proof covers Cursor's `.agents` path; installer/update delivery remains slice4.

Convention walk: retained Donut `4e328b86ead11bf711ec84071a34bd7170effa9e` source observation (native-observations.md#preparation-investigation), plus current `dashboard/tests/writing-journeys.md#fluent-phases-in-the-side-panel-content-journeys`. Focused scoped controls/handoffs are useful; guide keeps widths/rooms/read counts/holds/native records outside phases and limits its cue pilot to three journeys. Shared convention preserves these boundaries without imposing its runner/base class/framework. Language-neutral examples show caller-visible expected titles and keyboard/mouse choices, useful object returns, local async/construction mechanics, exact contracts, meaningful synchronization, assertions with caller-supplied expectations and expected/actual diagnostics. Held responses, requests, records and measurements remain illustrative independent observations.

Applicable ADRs 0002/0003/0004/0005/0006 and index read; statuses agree, no conflicts. Their one-owner, standalone-local, Proposed-stage, native-evidence and executing-project audience constraints govern the seam. Maintainer review follows [AGENTS.md](../../../AGENTS.md#behavior-review).

## Consumer trace

Command: `PATH=/opt/homebrew/bin:$PATH node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/apply-shared-page-object-rules-per-entry --base 48fd7667f08c15e5121be38593e11fb659f20298 --path dashboard/server/intentLocationsSettings.ts --path dashboard/src/intentLocationsDeclaration.ts --path dashboard/src/repositoryPath.ts --path src/skills/dough-execute-plan/scripts/test-entry-rules.mjs --term declaredLocations --term isSafeRepositoryPath --term pageObjects --term test-entry-rules --term withRules > /tmp/page-object-307-slice2-consumer-trace.md` — exit0.
Every located consumer has a disposition there. Direct declaration/listing/admission consumers run P2/P3/P4; path helper move preserves body/exports with authenticated refusal/typecheck. Existing frontend display DTO intentionally ignores additional testing flags; existing membership/syntax/overlay behavior remains. Shared delegation contract readers run P6. Native fixture users run P1/P5/N1/N2. Installed managed snapshots, historical records and generic basename/symbol matches are excluded with reasons; source edits do not update managed copies. No extra proof selected solely from CI configuration.

## Supplied slice promises

Each original commitment text is retained below; observations distinguish selection from application.

| Id | Original source text | Observation |
| --- | --- | --- |
| 2 | Page-object selection is independent of MakeMe selection. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 4 | Selection uses `intent.locations[].pageObjects: true` in `.planning/open-dough.json`. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 5 | File membership follows MakeMe’s existing semantics. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 6 | Overlap follows MakeMe’s existing semantics. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 7 | A matching opted-in entry applies the rule. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 8 | Another matching entry’s opt-out does not veto an opt-in. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 11 | That convention covers Dough execution. | Execution delegation loads the common selection reference before planned/planless test work and assigns new-path checks. |
| 20 | Draw the convention from Donut’s e2e-authoring guidance. | Retained Donut source observation plus browser-guide walk; focused mechanics/handoffs/independent evidence retained. |
| 21 | Draw the convention from the browser journey guide. | Retained Donut source observation plus browser-guide walk; focused mechanics/handoffs/independent evidence retained. |
| 22 | Keep action order visible at the caller. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 23 | Keep scenario variants visible at the caller. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 24 | Keep inputs visible at the caller. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 25 | Keep expected values visible at the caller. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 26 | Give scoped locators one focused page or component owner. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 27 | Give browser mechanics one focused page or component owner. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 28 | Give observable waits one focused page or component owner. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 29 | Reuse or extend existing owners. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 30 | Use domain-named actions. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 31 | Use domain-named observations. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 32 | Show language-neutral examples. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 33 | Show fluent handoffs where useful. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 34 | Follow the project’s asynchronous mechanics. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 35 | Follow the project’s construction mechanics. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 36 | Preserve independent boundary evidence at a meaningful observation boundary. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 37 | Keep keyboard variants explicit. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 38 | Keep mouse variants explicit. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 39 | Keep exact contracts under proof explicit. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 44 | Prove the choice with both MakeMe and page objects enabled. | OWED: both-true authored MakeMe use; shared MakeMe guidance unavailable (G2). |
| 45 | Prove the choice with only page objects enabled. | N1: fresh page-only native result passes after installed selector invocation. |
| 46 | Prove the choice with only MakeMe enabled. | OWED: MakeMe-only authored builder use; shared MakeMe guidance unavailable (G2). |
| 47 | Prove the choice with neither enabled. | N2: fresh neither-selected task keeps direct mechanics, passes, no convention read. |
| 48 | An omitted page-object flag does not enable the rule. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 49 | A false page-object flag does not enable the rule. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 50 | A non-boolean page-object value does not enable the rule. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 51 | Missing configuration means the rule is off. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 52 | Malformed configuration is reported unresolved. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 53 | Unreadable configuration is reported unresolved. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 55 | Assertions may run inside the focused owner. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 56 | Allowing assertions inside the owner does not remove the requirement to keep expectations explicit at the caller. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 57 | Fluent handoffs are conditional on usefulness. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 58 | Held-response order is an illustrative form of independent boundary evidence. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 59 | Request counts are another illustrative form. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 60 | Native records are another illustrative form. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 61 | Measurements are another illustrative form. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 71 | Four entries select, respectively, both flags, page objects only, MakeMe only, and neither. | P1 arranges four independent entries and asserts all four selections; no authored-use claim for MakeMe cases. |
| 72 | Agents authoring tests for those entries receive exactly the conventions selected by each entry. | PARTIAL: N1/N2 useful page-only/neither results; both/MakeMe-only authored application owed (G2). |
| 73 | Existing entries without a page-object flag retain their previous practice. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 74 | An enabled entry includes `**/*.spec.ts`. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 75 | A spec and a production file in its folder are considered; only the matching spec activates the rule. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 76 | A `sources` entry selects a custom extension. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 77 | An overlapping false entry does not veto the true entry. | P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 95 | No browser-abstraction requirement for non-browser work. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 96 | No Cypress requirement. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 97 | No Gherkin requirement. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 98 | No Open Dough phase-runner requirement. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 99 | No Open Dough cue-runner requirement. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 100 | No base-class requirement. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 101 | No universal fluent conversion. | Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |

## Generator provenance correction after independent review

Independent refactor found Rolldown minification had stripped the requested output.banner comments, contradicting the initial provenance claim. Added a focused artifact contract; `PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/test-entry-rules-standalone.test.mjs` failed on the missing Generated-by/Do-not-edit header. The generator now prefixes its maintained provenance after minification, and normal generation supplies both marker lines plus the adjacent license filename. No generated code was hand edited.

Correction paths: `scripts/build-test-entry-rules.mjs`, generated `src/skills/dough-execute-plan/scripts/test-entry-rules-runtime.mjs`, `tests/support/test-entry-rules-standalone.test.mjs`, this evidence. The independent refactor's `.withRules` native fixture edit was preserved.

Commands: `PATH=/opt/homebrew/bin:$PATH node scripts/build-test-entry-rules.mjs`; `PATH=/opt/homebrew/bin:$PATH node scripts/build-test-entry-rules.mjs --check`; `PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/test-entry-rules.test.mjs tests/support/test-entry-rules-standalone.test.mjs` — all exit0. New assertion observes the actual generated header, exact regeneration command/Do-not-edit marker, license reference and readable nonempty adjacent license file. Existing correspondence check performs no writes; isolated copied command still selects the new source and reports malformed settings unresolved.

Consumer effect: generated artifact gains two comment lines only. Independent byte comparison against `/tmp/page-object-307-slice2-runtime-before-provenance.mjs` confirms the executable body is identical. Direct runtime importer, isolated command copies and native fixture copies keep the same execution behavior; generator/correspondence/provenance consumers are covered by the focused commands above. Existing native/Intent observations remain corresponding and were not rerun. `git diff --check` passes.

## Independent refactoring acceptance

Refactor 2 uses `.withRules(...)` for native fixture valid flags. Focused fixture
test and rematerialization comparison passed: all ten settings/application/harness
files match accepted on/off fixtures byte for byte. Provenance correction was
independently inspected; only two comment lines differ from native runtime copies.
P2–P6 and N1/N2 remain corresponding; P1 fixture and standalone proof renewed.
All nine fixture consumers dispositioned in
`/tmp/page-object-307-refactor2-consumer-trace.md`. REFACTOR COMPLETE.
