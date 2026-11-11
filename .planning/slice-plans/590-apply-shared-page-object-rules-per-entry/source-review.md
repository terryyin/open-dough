# Source review

Provenance: Fresh `collaboration.spawn_agent` task `/root/source_review_exception`, `fork_turns: none`. Only the original story Goal/Scope/Examples/Exclusions plus Terry’s explicit Cursor native exception were supplied. No files were read during the review. The input is retained in the conversation. This supersedes the prior `/root/source_review` unchanged-source extraction.

Source-only extraction; no files read or changed. Examples below remain illustrative and do not introduce additional rejection constraints.

Commitments: rows 1–47. Qualifications: rows 48–70. Illustrative trigger and journey examples: rows 71–87. Exclusions: rows 88–101.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer can select shared page-object guidance per test entry. | slice 4 |  |
| 2 | Page-object selection is independent of MakeMe selection. | slice 2 |  |
| 3 | An agent receives the page-object rule when its entry selects it. | slice 4 |  |
| 4 | Selection uses `intent.locations[].pageObjects: true` in `.planning/open-dough.json`. | slice 2 |  |
| 5 | File membership follows MakeMe’s existing semantics. | slice 2 |  |
| 6 | Overlap follows MakeMe’s existing semantics. | slice 2 |  |
| 7 | A matching opted-in entry applies the rule. | slice 2 |  |
| 8 | Another matching entry’s opt-out does not veto an opt-in. | slice 2 |  |
| 9 | Provide one discoverable, conditional convention. | slice 1 | observed: native-observations.md: Codex enabled and clean Claude actual gate/config/convention reads; fresh Codex opted-out no convention read; Cursor waived via G1 |
| 10 | That convention covers ordinary browser authoring. | slice 1 | observed: native-observations.md: clean Claude ordinary prompt, Skill activation and passing browser/library.spec.mjs |
| 11 | That convention covers Dough execution. | slice 2 |  |
| 12 | That convention covers refactoring implicated by the change. | slice 3 |  |
| 13 | Changed-source scope follows MakeMe’s existing scope. | slice 3 |  |
| 14 | That scope includes staged changes. | slice 3 |  |
| 15 | That scope includes unstaged changes. | slice 3 |  |
| 16 | That scope includes untracked files. | slice 3 |  |
| 17 | That scope includes moves. | slice 3 |  |
| 18 | That scope includes supplied committed dispositions. | slice 3 |  |
| 19 | Current file membership determines application. | slice 3 |  |
| 20 | Draw the convention from Donut’s e2e-authoring guidance. | slice 2 |  |
| 21 | Draw the convention from the browser journey guide. | slice 2 |  |
| 22 | Keep action order visible at the caller. | slice 2 |  |
| 23 | Keep scenario variants visible at the caller. | slice 2 |  |
| 24 | Keep inputs visible at the caller. | slice 2 |  |
| 25 | Keep expected values visible at the caller. | slice 2 |  |
| 26 | Give scoped locators one focused page or component owner. | slice 2 |  |
| 27 | Give browser mechanics one focused page or component owner. | slice 2 |  |
| 28 | Give observable waits one focused page or component owner. | slice 2 |  |
| 29 | Reuse or extend existing owners. | slice 2 |  |
| 30 | Use domain-named actions. | slice 2 |  |
| 31 | Use domain-named observations. | slice 2 |  |
| 32 | Show language-neutral examples. | slice 2 |  |
| 33 | Show fluent handoffs where useful. | slice 2 |  |
| 34 | Follow the project’s asynchronous mechanics. | slice 2 |  |
| 35 | Follow the project’s construction mechanics. | slice 2 |  |
| 36 | Preserve independent boundary evidence at a meaningful observation boundary. | slice 2 |  |
| 37 | Keep keyboard variants explicit. | slice 2 |  |
| 38 | Keep mouse variants explicit. | slice 2 |  |
| 39 | Keep exact contracts under proof explicit. | slice 2 |  |
| 40 | Deliver standalone guidance through Codex’s existing skill layout. | slice 4 |  |
| 41 | Deliver standalone guidance through Cursor’s existing skill layout. | slice 4 |  |
| 42 | Deliver standalone guidance through Claude Code’s existing skill layout. | slice 4 |  |
| 43 | Prove useful application of the guidance. |  | G1 |
| 44 | Prove the choice with both MakeMe and page objects enabled. | slice 2 |  |
| 45 | Prove the choice with only page objects enabled. | slice 2 |  |
| 46 | Prove the choice with only MakeMe enabled. | slice 2 |  |
| 47 | Prove the choice with neither enabled. | slice 2 |  |
| 48 | An omitted page-object flag does not enable the rule. | slice 2 |  |
| 49 | A false page-object flag does not enable the rule. | slice 2 |  |
| 50 | A non-boolean page-object value does not enable the rule. | slice 2 |  |
| 51 | Missing configuration means the rule is off. | slice 2 |  |
| 52 | Malformed configuration is reported unresolved. | slice 2 |  |
| 53 | Unreadable configuration is reported unresolved. | slice 2 |  |
| 54 | Deletion alone requires no conversion. | slice 3 |  |
| 55 | Assertions may run inside the focused owner. | slice 2 |  |
| 56 | Allowing assertions inside the owner does not remove the requirement to keep expectations explicit at the caller. | slice 2 |  |
| 57 | Fluent handoffs are conditional on usefulness. | slice 2 |  |
| 58 | Held-response order is an illustrative form of independent boundary evidence. | slice 2 |  |
| 59 | Request counts are another illustrative form. | slice 2 |  |
| 60 | Native records are another illustrative form. | slice 2 |  |
| 61 | Measurements are another illustrative form. | slice 2 |  |
| 62 | The native Cursor authoring probe exited with “Authentication required.” | slice 1 | observed: /tmp/page-object-307-cursor-on/stderr.log and result.txt: authentication required, exit 1, no native authoring |
| 63 | Terry’s “skip the cursor test this time” waives that native Cursor probe for this execution. | slice 1 | observed: selected story Execution exception: Terry authorizes skipping this execution's Cursor native probe |
| 64 | Record that probe as skipped or unverified. | slice 1 | observed: native-observations.md Explicit execution exception: Cursor skipped/unverified |
| 65 | Do not record that probe as passed. | slice 1 | observed: native-observations.md Explicit execution exception: no Cursor pass claimed |
| 66 | The amendment authorizes continuation. | slice 1 | observed: selected story Execution exception and PLAN execution context: continuation authorized |
| 67 | Deterministic Cursor delivery checks remain required. | slice 4 |  |
| 68 | The waiver does not become a default for later work. | slice 4 |  |
| 69 | Product behavior remains required. | slice 4 |  |
| 70 | All other promises remain required. | slice 4 |  |
| 71 | Four entries select, respectively, both flags, page objects only, MakeMe only, and neither. | slice 2 |  |
| 72 | Agents authoring tests for those entries receive exactly the conventions selected by each entry. | slice 2 |  |
| 73 | Existing entries without a page-object flag retain their previous practice. | slice 2 |  |
| 74 | An enabled entry includes `**/*.spec.ts`. | slice 2 |  |
| 75 | A spec and a production file in its folder are considered; only the matching spec activates the rule. | slice 2 |  |
| 76 | A `sources` entry selects a custom extension. | slice 2 |  |
| 77 | An overlapping false entry does not veto the true entry. | slice 2 |  |
| 78 | A browser scenario opens a named item. | slice 1 | observed: /tmp/page-object-307-claude-clean-on/project/browser/library.spec.mjs: openItem('Atlas'), SCENARIO PASSED |
| 79 | The scenario follows a handoff. | slice 1 | observed: /tmp/page-object-307-claude-clean-on/project/browser/library.spec.mjs: followRelatedItem then showsItem('Boreal') |
| 80 | An added test using shared controls uses an existing owner. | slice 1 | observed: /tmp/page-object-307-claude-clean-on/project/browser/library.spec.mjs: existing LibraryPage/ItemPanel reused |
| 81 | The caller shows the action order. | slice 1 | observed: /tmp/page-object-307-claude-clean-on/project/browser/library.spec.mjs: Atlas open, held release, related handoff, Boreal expectation |
| 82 | The caller shows the expected item. | slice 1 | observed: /tmp/page-object-307-claude-clean-on/project/browser/library.spec.mjs: explicit Atlas and Boreal expected values without prompt convention cue |
| 83 | An independent held-read observation remains visible. | slice 1 | observed: /tmp/page-object-307-claude-clean-on/project/browser/library.spec.mjs: heldAtlas.started, independent requests, release, finally disposal |
| 84 | An incorrect expected item produces an actionable expected-versus-actual failure. | slice 1 | observed: /tmp/page-object-307-codex-on/negative-control.log: Wrong expected item versus actual Boreal; scenario restored |
| 85 | Mixed changed tests undergo refactoring. | slice 3 |  |
| 86 | Opted-in tests reuse focused objects while preserving intent. | slice 3 |  |
| 87 | Moving a test out of selected membership imposes no page-object rule at its destination. | slice 3 |  |
| 88 | No release work. | slice 4 |  |
| 89 | No project rollout. | slice 4 |  |
| 90 | No opt-in changes. | slice 4 |  |
| 91 | No local-rule removal. | slice 4 |  |
| 92 | No unrelated suite conversion. | slice 4 |  |
| 93 | No new test framework. | slice 4 |  |
| 94 | No generic policy registry. | slice 4 |  |
| 95 | No browser-abstraction requirement for non-browser work. | slice 2 |  |
| 96 | No Cypress requirement. | slice 2 |  |
| 97 | No Gherkin requirement. | slice 2 |  |
| 98 | No Open Dough phase-runner requirement. | slice 2 |  |
| 99 | No Open Dough cue-runner requirement. | slice 2 |  |
| 100 | No base-class requirement. | slice 2 |  |
| 101 | No universal fluent conversion. | slice 2 |  |
