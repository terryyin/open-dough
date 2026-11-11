# Apply shared MakeMe rules per test entry

**Identity:** SEED-307#apply-shared-makeme-rules-per-entry
**Source:** [Refined story](../../seeds/SEED-307-shared-test-pattern-rules.md#apply-shared-makeme-rules-per-entry)

## Goal and scope

A developer opts an existing test entry into one shared MakeMe convention.
Agents apply it during ordinary test authoring, Dough execution and implicated
post-change refactoring, while other entries retain their local practice.
Use `intent.locations[].makeMe: true` in `.planning/open-dough.json`; omission
and `false` are off. Preserve existing kind/include and sources selection.

The source owns the full convention, boundary examples and exclusions. This
plan implements that outcome, including language-neutral examples, coherent
standalone selection, changed-source detection, shared callers and delivery.
It does not release or update projects, change their opt-ins, remove local
rules, convert their suites, or implement the sibling page-object story.

## Architecture and current decisions

- Use a discoverable `dough-makeme` skill with a lean applicability gate and
  one conditional convention reference. Add explicit invocation at execution's
  test-authoring boundary and refactoring discovery; do not repeat the rule in
  callers. Existing skill discovery, not a new host hook, is the candidate for
  ordinary authoring. Slice 1 must observe it before dependent implementation.
- Expose the existing declaration/selection responsibility as shared runtime
  code. Keep one semantic owner for dashboard listing, file admission, syntax,
  story overlays and installed rule selection. Preserve POSIX case-sensitive
  patterns, sources precedence and unknown syntax hints; do not substitute a
  directory-prefix or a second glob grammar. A selected enabled entry applies;
  another matching entry's false flag is no veto. Invalid flags never opt in.
- Reuse `changedAgainst`'s Git selection knowledge from
  `src/skills/dough-execute-plan/scripts/consumer-trace-terms.mjs` by exposing
  path collection separately from consumer-term extraction where needed.
  Collect NUL-delimited paths against HEAD plus untracked sources, preserving
  staged/unstaged changes and both move paths. Accept supplied committed
  disposition ranges/paths as part of the same refactor scope. A declared
  test source, rather than every support file in its folder, activates an entry.
- Runtime must need only installed local files and the established Node
  prerequisite. A generated standalone matcher bundle can retain the locked
  minimatch behavior without a target project's npm installation. Keep its
  source, regeneration command and upstream license together; generated output
  is never a separately edited behavior source. Use existing Rolldown tooling.
- Follow Accepted [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  for one domain owner and PFE; [ADR 0004 — Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  for standalone use, preserved configuration and shared host behavior;
  [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  for one conditional rule home and project-relative audience; and
  [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  plus [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  for declaration, representative behavior review and truthful native proof.
  The ADR index and relevant records agree; no conflict was found. Existing
  North Star topics concern dashboard state/launch ownership and add no rule
  selection direction. No new topic or ADR is warranted.

### Already-oversized expected edit

`install.sh` is 344 lines, almost entirely its payload array. Slice 4 owns a
cohesive extraction of the execution skill's payload declaration (the largest
skill group) into a data-only fragment under `src/install/`, leaving the main
installer and that fragment below 250 lines. Keep `install.sh`'s assembled
`managed_files` as the single authoritative payload declaration, with no
parallel inventory. Its read-only declaration reader must read that fragment
without running an installer, and still read historical literal arrays.
Align `open-dough-release-version.sh`, historical-declaration recovery in
`open-dough-release-leftovers.sh`, release fixture construction in
`tests/support/releaseTestData.mjs`, and all traced declaration consumers.
Installation/update and declaration proofs below preserve their contract.
Do not replace cohesive extraction with arbitrary line folding. If execution
finds that the seam needs a different architecture or wider responsibility,
return that evidence before proceeding. Other inspected expected guidance and
selection edits are below 250 lines (execute skill 243, delegation 240,
refactor skill 158, parser 174, selector 142); keep additions proportionate.

## Decisive premises and observations

Observed in this preparation checkout at `4d7a2ff66` on 2026-11-11:

| Premise / consuming operation | Observation, result and remainder |
| --- | --- |
| Current entry selection can own both legacy and sources membership | `node --input-type=module` imported `declaredLocations` and `locationSelectsRepositoryPath`; MakeMe-built locations selected `frontend/src/a.spec.ts` and `checks/a.check`, excluded sibling production/Markdown files and uppercase `.TS`. The exact new `makeMe` input was projected away (`futurePropertyRetained:false`), so slice 2 must deliberately preserve it. No current opt-in support is assumed. |
| Existing glob semantics can run without dashboard/npm runtime dependencies | In the same Node profile, `rolldown({input:'dashboard/src/intentLocationSelection.ts',platform:'node',logLevel:'silent'})` then `bundle.generate({format:'esm',minify:true})` produced a 26,417-byte entry with no imports. Importing its code as a data URL selected `checks/nested/a.test`, excluded `a.TEST` and `a.txt`. This settles standalone feasibility; generated provenance/license and final installed execution remain slice 2/4 proof. No scratch edits remained. |
| Current native entry points are available, but discovery is unproved | `codex --version` → `0.167.1`; `claude --version` → `2.1.321`; `cursor agent --version` → `2026.11.10-731fb78`. Existing `tests/support/native-run-supervise.sh`, `native-codex.sh` and shared native stream readers provide the route. No paid session was run; the consuming ordinary-authoring operation, authentication and fresh candidate activation are bounded by slice 1's early probe. |
| Shared convention comes from actual practice, with local mechanics | Source inspection and representative builder/caller tracing reached Donut's Java/TS fluent construction, relationship derivation and fresh factory behavior; revisions and source paths are in the seed. Java persistence and some wall-clock defaults differ from Open Dough/Pygardon. The common rule therefore leaves persistence/language syntax local and states deterministic defaults as a preference. Native application remains owed, not inferred from source inspection. |

The selection observations are direct calls to the consuming functions, not a
claim that existing tests already prove the new rule. No new test is represented
as passing. Native observation is the only paid/credentialed unresolved premise;
its permitted early probe stops dependent slices if the mechanism fails.

## Ordered slices and proof ownership

### 1. Establish that ordinary test work receives scoped MakeMe guidance
Type: Behavior
Status: planned
Proof: Early native probe using the existing native host adapters and shared
stream readers. Keep one candidate skill and a tiny MakeMe-built project with
two configured entries, one enabled and one disabled, plus a usable builder.
Prompt ordinary test work without naming the skill or supplying the convention.

Behavior: A fresh agent receives an ordinary test-authoring task → discovers the
candidate skill, resolves applicability and changes the enabled test through
the builder while respecting the other entry's existing practice. Inspect actual
skill/reference reads, selected entry evidence and resulting tests; self-report,
exit zero or merely copying the skill cannot pass. Check action/expectation
independence and explicit meaningful facts in the result. Run representative
fresh use on Codex, Cursor and Claude Code, sharing the scenario/assessment
definition rather than multiplying language-by-host cases. Use an opted-out-only
fresh task where earlier enabled context could hide the gating result.

This is an early probe because the remaining consuming step spends native
inference and requires host authentication. Execute it before building the
full resolver or choosing final routing. Missing credentials, unavailable native
use or discovery failure stops slices 2–4 and returns the evidence for planning;
do not silently replace ordinary authoring with explicit invocation, introduce
new hooks, or narrow the promise. Preserve a bounded useful result and passing
cheap harness checks; no release declaration or target-project adoption occurs.

### 2. Apply one language-neutral convention through configured file membership
Type: Behavior
Status: planned
Proof: Add focused Node contract tests at the new skill's public selection
boundary, using MakeMe-built entry/settings data. Run through
`npm test -- <new selector test paths>`; run the existing Intent admission and
listing consumers affected by exposing their owner, including
`npm run test:dashboard -- dashboard/backend-tests/intent/authenticated-read-intent-selection.spec.ts`.

Behavior: Test work identifies its project and source paths → the shared gate
selects only enabled matching entries and loads the convention once → ordinary
authoring and execution receive the same applicable guidance. Cover omission,
false, true, non-boolean flags, missing/malformed/unreadable configuration,
kind/include and sources precedence, custom extensions, case and folder-sibling
boundaries. Preserve existing valid listing/admission and syntax behavior.
Keep diagnostics distinct from successful no-opt-in. Link the execution caller
before its test-writing delegation, including planless work and newly added tests.

Walk the seed's builder, invalid-input and optimization examples against the
actual guidance. Review definition, defaults, factory/chaining/completion,
relationship consistency, project-owned persistence, independent answers and
proof-preserving optimization. Do not enforce prose wording or JavaScript
punctuation as a language-neutral contract. Extend slice 1's native evidence
only where final instructions, selection or invocation changed its boundary.

### 3. Reapply the same rule to implicated tests during refactoring
Type: Behavior
Status: planned
Proof: Public changed-scope command tests materialize MakeMe repository
descriptions, then perform the Git actions under proof at the call site. Run
`npm test -- <new changed-scope test paths>`. Reuse native adapters for one
representative mixed-entry refactor journey; record coverage/reuse per host.

Behavior: Post-change refactoring discovers its actual scope → deterministically
resolves changed test paths against entry opt-ins before its decision pass →
loads the same rule and corrects implicated enabled test setup within existing
refactor authority, leaving the other entry's practice intact. Cover staged,
unstaged, untracked, moves across the boundary, supplied committed dispositions
and production-only changes. Include a fault that a path-prefix-only or
unstaged-only detector misses. Both move paths discover affected context, but
the current destination determines applicability: an opted-out destination
receives no MakeMe requirement, and deletion alone requires no conversion.
The useful-result journey must observe builder
reuse/extension and preserved assertions, not only a selected-entry report.
Recheck entries implicated by refactor edits if they extend its test scope.

### 4. Install and update the complete standalone rule with existing host layouts
Type: Behavior
Status: planned
Proof: Real isolated install/update operations built from MakeMe release
descriptions; compare the added guidance/runtime bytes in `.agents/skills` and
`.claude/skills`, preserve configuration and unrelated guidance, and run the
installed resolver outside the source project without project npm dependencies.
Use `npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/update-adds-new-payload-skill.sh tests/story-payload-update.sh`
plus focused declaration-reader/release-fixture regression tests required by
the cohesive extraction. Trace and run additional affected consumers.

Behavior: A project installs or updates the promoted payload → gets the shared
gate, convention and complete local runtime in the existing layouts → its own
entry opt-ins remain unchanged, and fresh use follows the same scoped behavior.
Complete the declaration extraction above as part of this delivery boundary.
Keep older inline-declaration releases readable, including historical leftover
recovery. Regenerate the matcher from its source and verify final installed
membership behavior, license and absence of external runtime imports.
Reuse shared host installation/discovery evidence only where the mechanism and
inputs still correspond. Refresh native behavior from slices 1–3 where final
payload changes invalidate it. Complete all affected host requirements before
release eligibility; no release or rollout is performed by this story.

## Verification and delivery gates

Every source promise has an owner: per-entry selection/backward compatibility,
shared convention, examples and execution routing → slice 2; ordinary discovery
→ slice 1 with final correspondence in 2/4; automatic refactoring and change
scope → slice 3; standalone cross-tool delivery/preservation → slice 4.
Use negative controls for the new selectors and native assessments. Preserve
independent expectations, complete deletion relationships and test isolation.

Follow [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
as written in every delegation and repair handoff. Use the shared MakeMe API for
domain test data. No wall-clock sleeps, `test.slow()` or suite/hook timeout
overrides. Post-change refactoring, focused proof, agent commits, publication
and applicable final CI stay owned by Execute Plan's normal delivery workflow.
Run `git diff --check` and this project's selective pre-commit gates.
For shared JS/TS contracts also run `npm run typecheck:dashboard` because the
dashboard consumes their inferred types; broader local suites need actual
consumer impact, not merely CI configuration. Use the maintained runner.

Before expensive native/browser verification inspect current load, available
memory, competing owned work and relevant duration evidence; choose bounded
concurrency on the actual host and retain that decision with execution context.
For long macOS runs start fully awake; on AC use `caffeinate -s -i`. On battery
plug in, or keep the lid open under `caffeinate -i` and inspect sleep logs under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Sleep-invalid proof is rerun under that policy, never accepted as a pass.

## Plan concern assessment

Slice-plan refinement ran after independent review, clarified current-path
applicability in slice 3 and retained all four boundaries: one model owns
applicability, one rule owns the convention, and each slice has one bounded
observation/delivery loop. There were no consolidate, split or escalate findings
and no supplied numeric sizing exception or story-resplit recommendation.
Slice 4 includes the necessary declaration reorganization rather than a
standalone cleanup outcome. No remaining slice-specific concern was found
outside the explicitly bounded native activation premise in slice 1. Failure
of that probe stops dependent work and changes the plan; it is not evidence of
readiness for a substitute activation mechanism. This plan grants no execution.
