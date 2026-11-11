# Apply shared page-object rules per test entry

**Identity:** SEED-307#apply-shared-page-object-rules-per-entry
**Source:** [Refined story](../../seeds/SEED-307-shared-test-pattern-rules.md#apply-shared-page-object-rules-per-entry)
**Source review:** [Source-only review](source-review.md)
**Reference:** [MakeMe refinement and plan](../../seeds/SEED-307-shared-test-pattern-rules.md#apply-shared-makeme-rules-per-entry),
[plan 589](../589-apply-shared-makeme-rules-per-entry/PLAN.md)

## Goal and scope

A developer selects one shared page-object convention per existing test entry
with `intent.locations[].pageObjects: true` in `.planning/open-dough.json`.
Agents apply it during ordinary browser test authoring, Dough execution and
implicated post-change refactoring. MakeMe remains independently selectable;
omitted, false or non-boolean flags do not enable either rule.

The source owns the convention and examples. Keep scenario order, concrete
inputs, expected values and independent evidence visible while focused objects
own shared UI mechanics. Deliver standalone guidance through existing host
layouts. No release, rollout, opt-in edits, local-rule removal, unrelated test
conversion, universal fluent framework or generic policy registry is included.

## Architecture and current decisions

- Use a discoverable `dough-page-objects` skill with a lean applicability gate
  and one conditional convention reference. Explicit execution and refactor
  callers load that same source. Use MakeMe's discovery mechanism if its proof
  corresponds; different naming/description and the page-object behavior still
  need their own useful-result observation. Never count selection as application.
- Reuse the existing declaration, file-selection and changed-source owners.
  `kind`/`include`, `sources` precedence, custom extensions, POSIX case-sensitive
  patterns and overlap semantics remain one model. Each matching true flag
  independently activates its convention; an opt-out is no veto. Report missing
  configuration as off and malformed/unreadable configuration as unresolved.
- The active MakeMe execution (Aki-chan at preparation time) owns exposing
  standalone selection, changed paths, execution/refactor callers and installer
  declaration extraction. At execution, inspect the integrated result and reuse
  its actual owner/contracts. Do not assume an unpublished API or edit that
  execution's worktree. If it has not integrated, expose the existing owner
  coherently for this outcome and reconcile through normal integration; do not
  build another matcher or competing rule-specific path collector. Shared code
  alone justifies no blocking dependency under ADR 0002.
- Reuse or extend page/component owners. Domain-named actions and observations
  expose scenario variants and caller-supplied expectations. Fluent methods may
  return the object reached or `this`; async/queue mechanics remain local.
  Do not prescribe Cypress, Gherkin, a phase runner, a base class, router rules
  or Donut's busy attribute. Keep causally important transport holds, request
  counts, records and measurements at their independent observation boundary.
- Follow Accepted [ADR 0002 — Lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  for one owner, PFE and integration; [ADR 0004 — Installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  for project-owned configuration and standalone local use; and
  [ADR 0006 — Executing-agent guidance](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  for one conditional source and project-relative audience. Follow
  [ADR 0003 — Release lifecycle](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  and [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  for promotion, representative behavior review and requirement-specific native
  evidence/reuse. The index and records agree; no conflict or exception was found.
  Existing North Star topics add no rule-selection direction; no new topic is needed.

### Expected edit sizes and coherent ownership

At `1c470849e`, `install.sh` is 344 lines. The MakeMe plan already selects
extraction of the execution payload group into a data-only `src/install/`
fragment, retaining assembled `managed_files` as the sole declaration. Slice 4
reuses that extraction when integrated; if still necessary here, it owns those
same cohesive seams, historical inline-declaration reading, release/leftover
readers, release fixtures and affected consumer proof. Do not fold arbitrary
lines or invent another payload inventory. Reconcile the chosen structure before
dependent edits if upstream changed it. Other inspected expected edits are below
250 lines: parser 174, selector 142, execution skill 243, delegation 240, refactor
skill 158. Keep additions below the maintained limit with focused references;
recheck actual integrated files before implementation, including new shared owners.

## Decisive premises and observations

Observed in this owned preparation checkout at `1c470849e` on 2026-11-11:

| Premise / consuming operation | Observation, result and remainder |
| --- | --- |
| Existing membership selects actual test files and can serve independent flags | `node --input-type=module` imported `makeMe`, `declaredLocations` and `locationSelectsRepositoryPath`. MakeMe-built `browser` (`typescript`, `**/*.spec.ts`) and `checks` (`sources: **/*.check`) declarations carried exact `pageObjects:true` and different `makeMe` values. Parsing then matching selected `browser/a.spec.ts` and `checks/nested/a.check`, excluded `browser/a.ts` and `browser/a.spec.TS`; `flagsRetained:false`. Slice 2 must retain flags explicitly; current opt-in behavior is not assumed. Node was `v24.21.0`. |
| Standalone matching can preserve the current grammar without project npm dependencies | Reuse the MakeMe plan's 2026-11-11 observation at `4d7a2ff66`: Rolldown generated a 26,417-byte import-free ESM matcher; importing it selected nested `.test`, excluding `.TEST` and `.txt`. `git diff --name-only 4d7a2ff66..HEAD -- dashboard/src/intentLocationSelection.ts package-lock.json package.json` was empty here. This unchanged source/toolchain makes that feasibility result correspond. Final installed execution remains slice 4 proof. |
| The portable convention has an actual source without requiring a cue framework | Donut `4e328b86ead11bf711ec84071a34bd7170effa9e`, `.agents/skills/e2e-authoring/SKILL.md`, supplies focused mechanics, fluent handoffs and expected/actual diagnostics. The browser guide and side-panel specs here preserve independent evidence and limit the phase pilot to three journeys. These observations support the chosen portable seam, not a claim that new agents apply it. |
| Native authoring has an unpaid setup route; discovery/useful results remain unproved | `bash` sourced `tests/support/git-publication-native-run.sh` and invoked `git_publication_run_native_command` for each host with an isolated temporary `project`, the current checkout as protected candidate, and prompt `Author a browser test in the configured entry.` Only the final `native_run_owned_or_fail` was intercepted to print arguments; stream decoding was skipped. Actual version capture and Codex preparation ran. Assembly produced isolated `codex exec --ignore-user-config ... --json -C <project>`, `cursor agent --print --force --trust --sandbox disabled --output-format stream-json --workspace <project>`, and writable `claude --print --dangerously-skip-permissions --no-session-persistence --output-format stream-json --verbose`. Running the exact generated Codex `sandbox-exec` prefix with `/usr/bin/true` exited 0. Versions were `0.167.1`, `2026.11.10-731fb78`, `2.1.321`. No inference ran. Authentication, actual host execution, candidate activation and browser outcomes remain slice 1's credentialed/paid probe. |

No scratch edits remain. No automated test or native application result is
claimed by these observations. New proof must discriminate the behavior it owns.

## Execution context

Jane-chan; Story Branch Mode; publisher `dashboard-territory.local-open-dough`.
Owned workspace and branch: this checkout, `codex/apply-shared-page-object-rules-per-entry`.
Origin trunk `main`; increment target `refs/heads/codex/apply-shared-page-object-rules-per-entry`.
Starting revision `2599c7a5db27aac64c5923b592b7f5b66079d348`; published base/candidate
`48fd7667f08c15e5121be38593e11fb659f20298` (slice 1 accepted on execution branch). CI observer coordinator `jane-chan-307`,
`/tmp/dough-ci-501/watch-qLujG5`, cell `g230:3`, session 51876, PID 34832.
See [execution context and retained proof](native-observations.md#execution-context)
for checkout setup, accepted observations, Cursor exception and recovery boundary.
No numeric slice budget supplied; existing planned refinement authority applies.

## Story obligations

### G1. Cursor ordinary-authoring observation needs authentication
Reported: slice 1 — "Cursor exited before authoring because its CLI requires authentication; no discovery or useful application was observed."
Story clause: "Deliver standalone guidance through Codex, Cursor and Claude Code's existing skill layouts; prove useful application and all four MakeMe/page-object choices."
Disposition: owner changed "For this execution, Terry authorizes skipping the Cursor native authoring probe"
Commitment: 43


### G2. Useful MakeMe application awaits the real shared convention
Reported: slice 2 — "Selector proof covers four choices; both-enabled and MakeMe-only native-authored outcomes remain unperformed because shared MakeMe guidance is not integrated. Unavailable selected guidance is unresolved and dependent edits are withheld."
Story clause: "Deliver standalone guidance through Codex, Cursor and Claude Code's existing skill layouts; prove useful application and all four MakeMe/page-object choices."
Disposition: receiving slice 4
Commitment: 44, 46, 72

### G3. Generated artifact provenance was stripped
Reported: slice 2 — "Independent refactoring found minification removed the claimed runtime provenance marker; generator correction and observing proof are required."
Story clause: "Deliver standalone guidance through Codex, Cursor and Claude Code's existing skill layouts"
Disposition: proved by slice 2: slice-2-observations.md#generator-provenance-correction-after-independent-review; generated artifact header, readable adjacent license and byte-identical executable body

## Ordered slices

### 1. Observe scoped page-object guidance during ordinary browser test work
Type: Behavior
Status: done
Proof: Early native probe through maintained native adapters, supervision and
stream readers, using the writable launch profile observed above rather than
the read-only ADR context launcher. Use an isolated MakeMe-built project with a focused UI
owner, a small running browser scenario and opted-in/opted-out entries. Prompt
ordinary test work without naming the skill or giving its convention.

Behavior: A fresh agent authors a named-item navigation/check scenario → discovers
the conditional rule, checks the source entry, reuses or extends the shared control
owner and leaves action order, input and expected item visible. Inspect actual
skill/reference reads and resulting passing tests, including independent held-read
or record evidence outside UI mechanics. Change the expected item in a reversible
negative control: the scenario must fail with meaningful expected/actual context.
Use an opted-out-only fresh task where prior enabled context could hide gating.

Record evidence/reuse per Codex, Cursor and Claude Code. Reuse MakeMe integration
evidence only for matching mechanisms/inputs; its behavior proof does not establish
this convention. Share the scenario and assessment, rather than a host/language
matrix. This is an early probe because the remaining operation spends inference
and needs authentication. Unavailable native use, failed discovery or an unusable
result stops dependent slices 2–4 and returns evidence for planning (the
explicit Cursor exception above applies only to this execution); do not silently
introduce hooks, require explicit invocation or narrow ordinary authoring. Keep a
bounded useful candidate and passing cheap harness proof; no release occurs.

### 2. Apply the convention independently through configured test membership
Type: Behavior
Status: done
Proof: Focused contracts at the public shared rule-selection boundary using
MakeMe-built settings. Run `npm test -- <affected rule-selection tests>` and,
if declaration/selection ownership changes, the affected Intent consumers through
`npm run test:dashboard -- dashboard/backend-tests/intent/authenticated-read-intent-selection.spec.ts`.

Behavior: Browser test authoring/execution identifies project and source paths →
the shared owner selects independent conventions → only matching opted-in entries
load the page-object rule. Cover both flags, either alone and neither; absent,
false and invalid values; malformed/unreadable configuration; include/sources
precedence, custom extensions, case and overlapping opt-ins. Keep diagnostics
distinct from successful opt-out. Preserve MakeMe selection and listing/admission.
Link execution before test-authoring delegation for planned and planless work,
including newly added tests. Reuse the common caller rather than parallel paths.

Walk source examples against the written rule: domain actions/observations,
focused locator ownership, visible variants/expectations, meaningful synchronization,
project-specific async/fluent mechanics, independent observations and diagnostics.
Assertions inside objects are allowed; no arbitrary direct-API ban or framework
conversion is introduced. Use language-neutral examples and link maintainer review
to `AGENTS.md`. Extend slice 1 native proof only for changed boundaries. For the
four flag combinations inspect useful authored results as well as selector output;
MakeMe-only work must still use its builder without receiving a page-object rule.

### 3. Apply the same rule automatically during implicated refactoring
Type: Behavior
Status: planned
Proof: Public changed-scope command contracts, materializing MakeMe repository
descriptions with Git actions/independent expectations at the call site, through
`npm test -- <affected changed-scope tests>`. One representative native mixed-entry
refactor journey inspects the corrected tests; record coverage/reuse per host.

Behavior: Post-change refactoring discovers changed test sources → resolves their
independent flags and loads the same convention once → corrects implicated enabled
tests through existing owners while preserving caller intent and independent proof.
Other entries keep their practice. Reuse staged, unstaged, untracked and committed
disposition discovery, both move paths and production-only handling; current path
determines application, and deletion alone invents no conversion. Include a case
an unstaged-only or folder-prefix implementation misses. Recheck applicability if
refactoring extends scope. Preserve MakeMe's same-boundary behavior without
duplicating its collector; never use this rule to expand refactor authority.

### 4. Deliver a complete standalone rule through installation and updating
Type: Behavior
Status: planned
Proof: Real isolated install/update operations from MakeMe release descriptions,
using `npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/update-adds-new-payload-skill.sh tests/story-payload-update.sh`
and affected declaration-reader/release-fixture regression tests. Run the installed
selector outside this source project without project npm dependencies.

Behavior: Installation/update supplies the shared gate, convention and runtime in
`.agents/skills` and `.claude/skills` → fresh use retains independent opt-ins and
the same useful behavior. Preserve project configuration and unrelated guidance;
verify complete bytes/references, generated matcher provenance/license where used,
and no external runtime imports. Reuse the integrated declaration extraction above,
or complete it coherently with traced readers and historical inline declarations.
Refresh native proof invalidated by final payload/routing changes; record justified
reuse for unchanged host requirements. Complete affected native requirements before
release eligibility, without performing a release or rollout in this story.

## Verification and delivery gates

| Source promise | Owning slice and observable proof |
| --- | --- |
| Ordinary discovery and readable shared browser behavior | 1, with final correspondence in 2/4; actual reads, resulting passing scenario and discriminating expected-value failure |
| Independent flags, membership, backward compatibility, diagnostics and execution | 2; public contracts, useful authored outcomes for all four choices, preserved Intent/MakeMe consumers |
| Automatic changed-source refactoring, scope and preserved evidence | 3; changed-scope command contracts plus useful mixed-entry refactor result |
| Standalone cross-tool delivery and preservation | 4; real install/update, installed execution, per-host evidence/reuse |

Follow [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
as written in every delegation and repair handoff. Use shared MakeMe domain data;
keep actions, independent expectations and exact inputs under proof outside it.
No sleeps, `test.slow()` or suite/hook timeout overrides. Execute Plan retains
normal independent refactoring, agent commits, publication and final CI ownership.
Run `git diff --check`, selective pre-commit gates and the maintained runner. Run
`npm run typecheck:dashboard` when shared JS/TS contracts affect dashboard types;
broader local proof requires traced consumer impact, not just CI configuration.

Before expensive native/browser runs inspect host load, memory, competing work
and duration evidence, then choose bounded concurrency. For long macOS runs start
fully awake; on AC use `caffeinate -s -i`. On battery plug in or keep the lid open
under `caffeinate -i` and inspect sleep logs under [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Sleep-invalid proof must be rerun under that policy.

## Plan concern assessment

Slice-plan refinement ran after independent review: retain all four reference
boundaries, each with one cohesive observation/delivery loop. The native proof-route
concern was settled through unpaid command assembly and the actual Codex isolation
prefix; writable host profiles are explicit. Common applicability, path discovery
and convention ownership remain single. No consolidate, split or escalate finding,
story-resplit recommendation or sizing exception remained. No remaining slice-specific
concern was found outside the permitted early native probe in slice 1. Failure
there stops dependent work and changes the plan; it does not establish readiness
for a substitute mechanism. No numeric sizing limit or exception was supplied.
This plan grants no execution authority.
