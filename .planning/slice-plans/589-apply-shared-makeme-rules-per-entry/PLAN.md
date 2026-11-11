# Apply shared MakeMe rules per test entry

**Identity:** SEED-307#apply-shared-makeme-rules-per-entry
**Source:** [Refined story](../../seeds/SEED-307-shared-test-pattern-rules.md#apply-shared-makeme-rules-per-entry)
**Source review:** [Source-only commitments](source-review.md)

## Execution context

- Story branch: `codex/apply-shared-makeme-rules-per-entry`, workspace this worktree, publisher `dashboard-territory.local-open-dough`, agent `aki-chan`, `origin` / trunk `main`.
- Starting revision `31f14719b1ab8330680ee2e7fefdf9742b242746`; claim `24f1647fb91aea54cced8e5ff5f0321579b29353`; accepted slice 1 and current published base `ec131e188ece02d28504c610a2812f0c325798d2` on the execution branch. Checkout-local locked setup passed; selective formatting `npm run format`, check-only hook lint/typecheck, agent commits.
- Live CI: GitHub `terryyin/open-dough`, `ci.yml` / `CI`, execution-branch target, coordinator `aki-chan-seed307`, directory `/tmp/dough-ci-501/watch-cUOT3m`, PID `64581`, stream `85379`, cell `g228:4`.
- [Slice 1 evidence and retained startup/stop history](slice-1-evidence.md) owns native commands, proof locations, source freshness and the explicitly waived Cursor gap. No numeric slice limit; existing replanning authority retained. Current awake AC load 6.78/5.60/7.51; one native CLI at a time, focused proof only, reconsider changed pressure.

## Goal and scope

Terry's 2026-11-11 instruction, "skip the cursor test this time then", waives
Cursor native probes for this execution only. Preserve selector, standalone
installation and other-host native proof. Report Cursor native application as
unverified; this is no future default or release-eligibility claim. The seed
retains the authorized proof exception. The credential stop no longer holds
dependent slices within this waiver; no authentication change is authorized.

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

Slice 4 must split the 344-line installer through the cohesive execution-payload
fragment and align its readers/fixtures under the [settled reorganization decision](preparation-evidence.md#already-oversized-expected-edit).
Keep the assembled managed-files array authoritative and both files below 250 lines.

## Decisive premises and observations

[Preparation observations](preparation-evidence.md) retain settled selection,
standalone Rolldown feasibility and convention-source evidence. Native outcomes
and Terry's Cursor exception are in [slice 1 evidence](slice-1-evidence.md).

## Ordered slices

### 1. Establish that ordinary test work receives scoped MakeMe guidance
Type: Behavior
Status: done
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
Status: done
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
Keep diagnostics distinct from successful no-opt-in. Execution-caller hookup
is delivered with its complete declared dependencies in slice 4.

Walk the seed's builder, invalid-input and optimization examples against the
actual guidance. Review definition, defaults, factory/chaining/completion,
relationship consistency, project-owned persistence, independent answers and
proof-preserving optimization. Do not enforce prose wording or JavaScript
punctuation as a language-neutral contract. Extend slice 1's native evidence
only where final instructions, selection or invocation changed its boundary.

### 3. Resolve changed test-entry scope for refactoring
Type: Behavior
Status: planned
Proof: Public changed-scope command tests materialize MakeMe repository
descriptions, then perform the Git actions under proof at the call site. Run
`npm test -- <new changed-scope test paths>`. Native refactor application and
the managed refactor caller are delivered with the complete payload in slice 4.

Behavior: The changed-scope command deterministically resolves current test
paths against entry opt-ins for the refactor consumer. Cover staged,
unstaged, untracked, moves across the boundary, supplied committed dispositions
and production-only changes. Include a fault that a path-prefix-only or
unstaged-only detector misses. Both move paths discover affected context, but
the current destination determines applicability: an opted-out destination
receives no MakeMe requirement, and deletion alone requires no conversion.
Slice 4 connects this command before the refactor decision pass, rechecks
extended scope, and proves builder reuse/extension with preserved assertions.

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
Connect execution test-authoring delegation, including planless work and newly
added test paths, to the shared gate in this same declared-payload increment.
Connect the refactor decision pass to changed-entry selection, recheck expanded
scope, and prove one mixed-entry useful refactor journey on Codex and Claude.
Preserve opted-out practice and assertions; Cursor native remains waived.
Keep older inline-declaration releases readable, including historical leftover
recovery. Regenerate the matcher from its source and verify final installed
membership behavior, license and absence of external runtime imports.
Reuse shared host installation/discovery evidence only where the mechanism and
inputs still correspond. Refresh native behavior from slices 1–3 where final
payload changes invalidate it. Complete all affected host requirements before
release eligibility; no release or rollout is performed by this story.

## Verification and delivery gates

Every source promise has an owner: per-entry selection/backward compatibility,
shared convention and examples → slice 2; ordinary discovery
→ slice 1 with final correspondence in 2/4; changed-source resolution → slice 3;
workflow hookup, useful refactoring and standalone delivery/preservation → slice 4.
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

## Story obligations

### G4. Refactor caller shares the declared-payload dependency
Reported: slice 2 — "The managed refactor Markdown caller also requires the unpromoted skill; its hookup and useful native refactor journey move to slice 4 with declaration, while slice 3 proves changed-source resolution."
Story clause: "During post-change refactoring, automatically resolve the entries of changed test sources and load the same convention for opted-in entries."
Disposition: receiving slice 4


### G3. Execution caller requires complete payload declaration
Reported: slice 2 — "Managed Markdown links to the unpromoted skill would fail tests/payload-declaration-links.sh lines 26–57; caller hookup moves to the complete payload increment without weakening that check."
Story clause: "Provide one shared, discoverable MakeMe guidance source for ordinary test authoring and Dough execution."
Disposition: receiving slice 4


### G1. Native authoring remains unproved on Cursor and Claude
Reported: slice 1 — "Cursor mixed failed before inference because authentication is required; Cursor opted-out and both Claude journeys are unobserved. Codex mixed and fresh opted-out passed."
Story clause: "Deliver one standalone shared behavior through the existing Codex, Cursor and Claude Code skill layouts."
Disposition: owner changed "For this execution only, Cursor native probes are waived."

### G2. Candidate entry membership is provisional prose
Reported: slice 1 — "The early candidate manually evaluates the tiny fixture's simple membership; the final deterministic resolver and refreshed native correspondence remain owed."
Story clause: "File membership retains the entry's `kind`/`include` or `sources` selection; folder containment alone does not select a test."
Disposition: proved by slice 2: slice-2-evidence.md public selector contracts and refreshed native correspondence


### G5. Register public selector proof in the default runner
Reported: slice 2 — "Coordinator inspection found tests/node-test-files selects only src/skills/*/scripts/*.test.mjs and tests/support/*.test.mjs, so the two new tests/*.test.mjs files pass named runs but are absent from default CI discovery."
Story clause: "Verify selection and useful authoring and refactoring outcomes"
Disposition: proved by slice 2: slice-2-evidence.md default-runner registration proof and independent narrow review
Commitment: C48
