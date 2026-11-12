---
id: SEED-329
status: active
planted: 2026-11-12
scope: story
---

# Use shared MakeMe and page-object guidance

<a id="use-shared-test-guidance"></a>

### Use shared MakeMe and page-object guidance

**Identity:** SEED-329#use-shared-test-guidance
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/603-use-shared-test-guidance/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"65fa3eabf1bb14de3c263da8194931a9d04489d1d76ac501b6ac5a452ece047f","plan":"9d65cd1aecda0a2c80536d986026033144f9c10ce4b0251d0a99f9fd0b4c0fce"}}
```

#### Goal

A maintainer authoring or refactoring Open Dough tests gets the same MakeMe
and page-object guidance that the project publishes for other repositories.
The matching Intent entry selects the convention, so shared guidance can
evolve without a second local statement drifting away from it.

#### Scope

- Replace the unconditional MakeMe rule in
  [AGENTS.md](../../AGENTS.md#test-automation) and overlapping convention
  prose in the [test data guide](../../tests/test-data-architecture.md) and
  [dashboard journey guide](../../dashboard/tests/writing-journeys.md) with
  routing to the installed shared skills. Keep one owner for each shared rule.
- Preserve the project's builder entry point, typing and import-closure
  constraints, storage and encoding distinctions, test harness boundaries,
  fixture ownership, and domain API examples. Preserve the dashboard pilot's
  local machinery, observations, evaluation links and adoption boundary.
- Retain MakeMe selection for the five current Intent entries and page-object
  selection for browser specs. Close the discovered gap for scheduled Node
  tests under `tests/*.test.mjs` and `tests/support/*.test.mjs` through the
  existing `tests` entry's supported mixed-source declaration. Keep its path
  identity and each source's syntax.
- Explain how a selected test's convention guides its supporting builder,
  Node helper or page object without claiming that folder containment alone
  selects the helper. A shell check's domain arrangements still use the
  project's Node/MakeMe boundary. Other sources retain their project practice.

#### Scope limits

- Existing test suites and shared skill sources are read and used for
  representative verification; this story adds no test conversion or shared
  convention change. [SEED-300](SEED-300-dashboard-test-page-objects.md)
  continues to own dashboard page-object refactoring and wider fluent adoption.
- No installer, release, host adapter or new convention-selection mechanism
  is needed. This changes Open Dough's own configuration and local guidance.

#### Key examples

1. A maintainer changes
   `dashboard/tests/navigation/side-panel-content-replacement.spec.ts` or
   `dashboard/frontend-tests/intent-project-scope-history-recovery.spec.ts`
   → the installed selector enables MakeMe and page objects → the shared
   skills own those conventions, while the local guides supply the actual
   builders, harness and recorded pilot context.
2. A maintainer arranges data for a backend spec, `tests/install.sh`, or a
   skill's `*.test.mjs` → its matching entry enables MakeMe independently
   of page objects → setup uses `tests/support/makeMe.mjs`; the shell check
   reaches it through a Node helper such as `tests/support/release-source.mjs`.
3. A maintainer adds or changes `tests/makeme-selection.test.mjs` or
   `tests/support/repository-description.test.mjs` → those runner-scheduled
   sources match the `tests` entry alongside its shell checks → MakeMe is
   selected, page objects remain off, and Intent retains shell/JavaScript
   syntax for the corresponding files.
4. Work on a selected spec implicates `dashboard/tests/storyCardPages.ts`,
   or a selected shell check implicates `tests/support/release-source.mjs`
   → the maintainer carries the consuming test's selected convention into
   that support work → the helper's own unmatched path is not mistaken for
   an opt-in or a reason to bypass the shared rule in the selected test.
5. A maintainer follows the revised journey guide → the same three fluent
   pilot journeys, measured trade-offs, controlled failure and evaluation
   links remain available → routing to shared guidance does not authorize
   additional conversions or change the pilot's wider-adoption decision.

<a id="guard-scheduled-test-makeme-selection"></a>

### Guard scheduled-test MakeMe selection

**Identity:** SEED-329#guard-scheduled-test-makeme-selection
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/605-guard-scheduled-test-makeme-selection/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"84f5e0e89b50790661cf4df7658faf7bb3e194866793205401db282ad3e9e79c","plan":"9d9c28defa34f2c5dabadb4c938feaaafb30246b5eedafa9402a7cc190f470d4"}}
```

#### Goal

A maintainer changing this repository's Intent locations or runner globs learns
at once when a runner-scheduled test stops selecting MakeMe. That keeps the
closed selection gap from reopening unnoticed.

#### Scope

- One maintained check reads this repository's own `.planning/open-dough.json`,
  `tests/node-test-files` globs and `tests/*.sh`, and confirms that every
  scheduled source selects MakeMe with page objects off. It also confirms the
  `tests` location keeps its shell and JavaScript syntax hints.
- Plan: [605](../slice-plans/605-guard-scheduled-test-makeme-selection/PLAN.md)
