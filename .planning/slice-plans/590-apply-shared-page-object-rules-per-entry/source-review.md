# Source review

Provenance: Fresh `collaboration.spawn_agent` task `/root/source_review_exception`, `fork_turns: none`. Only the original story Goal/Scope/Examples/Exclusions plus Terry’s explicit Cursor native exception were supplied. No files were read during the review. The input is retained in the conversation. This supersedes the prior `/root/source_review` unchanged-source extraction.

Source-only extraction; no files read or changed. Examples below remain illustrative and do not introduce additional rejection constraints.

Commitments: rows 1–47. Qualifications: rows 48–70. Illustrative trigger and journey examples: rows 71–87. Exclusions: rows 88–101.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer can select shared page-object guidance per test entry. | slice 4 | observed: slice-4-makeme-integration.md: P1 installed independent flags and useful both/MakeMe-only/neither results; corresponding page-only proof retained |
| 2 | Page-object selection is independent of MakeMe selection. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 3 | An agent receives the page-object rule when its entry selects it. | slice 4 | observed: slice-4-makeme-integration.md: actual selected guide reads and authored outcomes, with shared routing observed in MakeMe-only/neither; matching page-only proof retained |
| 4 | Selection uses `intent.locations[].pageObjects: true` in `.planning/open-dough.json`. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 5 | File membership follows MakeMe’s existing semantics. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 6 | Overlap follows MakeMe’s existing semantics. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 7 | A matching opted-in entry applies the rule. | slice 2 | observed: slice-2-observations.md: P1 overlapping opt-in selection and N1 actual selected convention load with passing authored scenario |
| 8 | Another matching entry’s opt-out does not veto an opt-in. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 9 | Provide one discoverable, conditional convention. | slice 1 | observed: native-observations.md: Codex enabled and clean Claude actual gate/config/convention reads; fresh Codex opted-out no convention read; Cursor waived via G1 |
| 10 | That convention covers ordinary browser authoring. | slice 1 | observed: native-observations.md: clean Claude ordinary prompt, Skill activation and passing browser/library.spec.mjs |
| 11 | That convention covers Dough execution. | slice 2 | observed: slice-2-observations.md: Execution delegation loads the common selection reference before planned/planless test work and assigns new-path checks. |
| 12 | That convention covers refactoring implicated by the change. | slice 3 | observed: slice-3-observations.md: Shared refactor link and N1 actual corrected browser result. |
| 13 | Changed-source scope follows MakeMe’s existing scope. | slice 3 | observed: slice-3-observations.md: One extracted existing Git owner and unchanged independent selector; actual MakeMe guidance remains G2. |
| 14 | That scope includes staged changes. | slice 3 | observed: slice-3-observations.md: P1 reversed-worktree staged case and N1 staged new test. |
| 15 | That scope includes unstaged changes. | slice 3 | observed: slice-3-observations.md: P1 public changed-command case. |
| 16 | That scope includes untracked files. | slice 3 | observed: slice-3-observations.md: P1 new spec and N1 legacy untracked scenario. |
| 17 | That scope includes moves. | slice 3 | observed: slice-3-observations.md: P1 both-path discovery, staged/unstaged destinations and real installed move. |
| 18 | That scope includes supplied committed dispositions. | slice 3 | observed: slice-3-observations.md: P1 exact supplied commit, unrelated committed history omitted, duplicate supplied commit deduplicated. |
| 19 | Current file membership determines application. |  | G5 |
| 20 | Draw the convention from Donut’s e2e-authoring guidance. | slice 2 | observed: slice-2-observations.md: Retained Donut source observation plus browser-guide walk; focused mechanics/handoffs/independent evidence retained. |
| 21 | Draw the convention from the browser journey guide. | slice 2 | observed: slice-2-observations.md: Retained Donut source observation plus browser-guide walk; focused mechanics/handoffs/independent evidence retained. |
| 22 | Keep action order visible at the caller. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 23 | Keep scenario variants visible at the caller. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 24 | Keep inputs visible at the caller. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 25 | Keep expected values visible at the caller. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 26 | Give scoped locators one focused page or component owner. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 27 | Give browser mechanics one focused page or component owner. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 28 | Give observable waits one focused page or component owner. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 29 | Reuse or extend existing owners. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 30 | Use domain-named actions. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 31 | Use domain-named observations. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 32 | Show language-neutral examples. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 33 | Show fluent handoffs where useful. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 34 | Follow the project’s asynchronous mechanics. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 35 | Follow the project’s construction mechanics. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 36 | Preserve independent boundary evidence at a meaningful observation boundary. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 37 | Keep keyboard variants explicit. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 38 | Keep mouse variants explicit. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 39 | Keep exact contracts under proof explicit. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 40 | Deliver standalone guidance through Codex’s existing skill layout. | slice 4 | observed: slice-4-observations.md: P1 actual .agents installation/update/runtime; accepted Codex native proof reused. |
| 41 | Deliver standalone guidance through Cursor’s existing skill layout. | slice 4 | observed: slice-4-observations.md: P1 Cursor install context and shared .agents bytes/runtime; native skip remains explicit. |
| 42 | Deliver standalone guidance through Claude Code’s existing skill layout. | slice 4 | observed: slice-4-observations.md: P1 .claude delivery and fresh N1 complete installed use. |
| 43 | Prove useful application of the guidance. |  | G1 |
| 44 | Prove the choice with both MakeMe and page objects enabled. |  | G2 |
| 45 | Prove the choice with only page objects enabled. | slice 2 | observed: slice-2-observations.md: N1: fresh page-only native result passes after installed selector invocation. |
| 46 | Prove the choice with only MakeMe enabled. |  | G2 |
| 47 | Prove the choice with neither enabled. | slice 2 | observed: slice-2-observations.md: N2: fresh neither-selected task keeps direct mechanics, passes, no convention read. |
| 48 | An omitted page-object flag does not enable the rule. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 49 | A false page-object flag does not enable the rule. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 50 | A non-boolean page-object value does not enable the rule. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 51 | Missing configuration means the rule is off. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 52 | Malformed configuration is reported unresolved. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 53 | Unreadable configuration is reported unresolved. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 54 | Deletion alone requires no conversion. | slice 3 | observed: slice-3-observations.md: P1 deletion-only returns no current sources. |
| 55 | Assertions may run inside the focused owner. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 56 | Allowing assertions inside the owner does not remove the requirement to keep expectations explicit at the caller. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 57 | Fluent handoffs are conditional on usefulness. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 58 | Held-response order is an illustrative form of independent boundary evidence. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 59 | Request counts are another illustrative form. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 60 | Native records are another illustrative form. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 61 | Measurements are another illustrative form. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 62 | The native Cursor authoring probe exited with “Authentication required.” | slice 1 | observed: /tmp/page-object-307-cursor-on/stderr.log and result.txt: authentication required, exit 1, no native authoring |
| 63 | Terry’s “skip the cursor test this time” waives that native Cursor probe for this execution. | slice 1 | observed: selected story Execution exception: Terry authorizes skipping this execution's Cursor native probe |
| 64 | Record that probe as skipped or unverified. | slice 1 | observed: native-observations.md Explicit execution exception: Cursor skipped/unverified |
| 65 | Do not record that probe as passed. | slice 1 | observed: native-observations.md Explicit execution exception: no Cursor pass claimed |
| 66 | The amendment authorizes continuation. | slice 1 | observed: selected story Execution exception and PLAN execution context: continuation authorized |
| 67 | Deterministic Cursor delivery checks remain required. | slice 4 | observed: slice-4-observations.md: P1 actual Cursor installation/update plus installed runtime assertions. |
| 68 | The waiver does not become a default for later work. | slice 4 | observed: slice-4-observations.md: Current-execution native skip only; no future waiver added. |
| 69 | Product behavior remains required. | slice 4 | observed: slice-4-makeme-integration.md: all product promises retained; G2 real shared-guide and authored-use proof accepted |
| 70 | All other promises remain required. | slice 4 | observed: slice-4-makeme-integration.md: no other promise waived; G2 is proved and Cursor remains the sole explicit native exception |
| 71 | Four entries select, respectively, both flags, page objects only, MakeMe only, and neither. | slice 2 | observed: slice-2-observations.md: P1 arranges four independent entries and asserts all four selections; no authored-use claim for MakeMe cases. |
| 72 | Agents authoring tests for those entries receive exactly the conventions selected by each entry. |  | G2 |
| 73 | Existing entries without a page-object flag retain their previous practice. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 74 | An enabled entry includes `**/*.spec.ts`. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 75 | A spec and a production file in its folder are considered; only the matching spec activates the rule. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 76 | A `sources` entry selects a custom extension. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 77 | An overlapping false entry does not veto the true entry. | slice 2 | observed: slice-2-observations.md: P1/P2; independent flags and exact membership/diagnostic assertions pass. |
| 78 | A browser scenario opens a named item. | slice 1 | observed: /tmp/page-object-307-claude-clean-on/project/browser/library.spec.mjs: openItem('Atlas'), SCENARIO PASSED |
| 79 | The scenario follows a handoff. | slice 1 | observed: /tmp/page-object-307-claude-clean-on/project/browser/library.spec.mjs: followRelatedItem then showsItem('Boreal') |
| 80 | An added test using shared controls uses an existing owner. | slice 1 | observed: /tmp/page-object-307-claude-clean-on/project/browser/library.spec.mjs: existing LibraryPage/ItemPanel reused |
| 81 | The caller shows the action order. | slice 1 | observed: /tmp/page-object-307-claude-clean-on/project/browser/library.spec.mjs: Atlas open, held release, related handoff, Boreal expectation |
| 82 | The caller shows the expected item. | slice 1 | observed: /tmp/page-object-307-claude-clean-on/project/browser/library.spec.mjs: explicit Atlas and Boreal expected values without prompt convention cue |
| 83 | An independent held-read observation remains visible. | slice 1 | observed: /tmp/page-object-307-claude-clean-on/project/browser/library.spec.mjs: heldAtlas.started, independent requests, release, finally disposal |
| 84 | An incorrect expected item produces an actionable expected-versus-actual failure. | slice 1 | observed: /tmp/page-object-307-codex-on/negative-control.log: Wrong expected item versus actual Boreal; scenario restored |
| 85 | Mixed changed tests undergo refactoring. | slice 3 | observed: slice-3-observations.md: N1 discovers staged enabled/untracked off tests, corrects enabled and preserves off practice; both pass. |
| 86 | Opted-in tests reuse focused objects while preserving intent. | slice 3 | observed: slice-3-observations.md: N1 LibraryPage/ItemPanel result retains Atlas/Boreal/order/held-read/request proof. |
| 87 | Moving a test out of selected membership imposes no page-object rule at its destination. | slice 3 | observed: slice-3-observations.md: P1 staged destination legacy/out.spec.mjs has pageObjects false; deleted browser source omitted. |
| 88 | No release work. | slice 4 | observed: slice-4-observations.md: Only isolated fixture versions/tags; source VERSION/CHANGELOG/tags untouched. |
| 89 | No project rollout. | slice 4 | observed: slice-4-observations.md: Only isolated temporary project installations. |
| 90 | No opt-in changes. | slice 4 | observed: slice-4-observations.md: Real project configuration untouched; fixture flags describe proof cases. |
| 91 | No local-rule removal. | slice 4 | observed: slice-4-observations.md: No project-local guidance removed; sentinels preserved. |
| 92 | No unrelated suite conversion. | slice 4 | observed: slice-4-observations.md: Only fixture/proof support and focused observations changed. |
| 93 | No new test framework. | slice 4 | observed: slice-4-observations.md: Existing runner, native adapters, supervision, stream reader and browser harness. |
| 94 | No generic policy registry. | slice 4 | observed: slice-4-observations.md: Existing one declaration, parser/matcher and shared selection command reused. |
| 95 | No browser-abstraction requirement for non-browser work. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 96 | No Cypress requirement. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 97 | No Gherkin requirement. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 98 | No Open Dough phase-runner requirement. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 99 | No Open Dough cue-runner requirement. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 100 | No base-class requirement. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
| 101 | No universal fluent conversion. | slice 2 | observed: slice-2-observations.md: Convention walk below; N1 preserves applicable intent/evidence; illustrative variants remain explicit. |
