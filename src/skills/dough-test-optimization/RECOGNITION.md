# Recognition: dough-test-optimization

Review: ready for maintainer review

## Original clues

On-demand `test-optimization` at `.agents/skills/test-optimization/SKILL.md`
in the supplied `../doughnut` checkout. Its template, four references, and
directly linked testing context were inspected. The linked package testing
rules led to `unit-testing.mdc`, the authoritative small-test style. Project
identity is provenance, never a recognition condition.

SHA-256 baselines captured before writing; all paths below are relative to that
source checkout. Recompute these to check source integrity.
The extraction-time recheck on 2026-09-15 matched all 11 files unchanged.

| Inspected source | SHA-256 |
| --- | --- |
| `.agents/skills/test-optimization/SKILL.md` | `6b7d2e1051ccb5717421e3813dfe94ee25f0b65ce343786d0f37f7edcc1273fa` |
| `.agents/skills/test-optimization/plan-template.md` | `7cc726783e7a63a940d421e22d8dd652ab55e632cb71d5ca3cbf1d9aa9377fee` |
| `.agents/skills/test-optimization/references/e2e-profile-parsing.md` | `2b17807530d9cae9c630e85c6ccfe7a78264ae5e8347ecd73b94372f8f8f42dd` |
| `.agents/skills/test-optimization/references/optimization-tactics.md` | `b9ac739a1c76f5b8808cd82377fcd1afe19e8c1cd901e4a975a1cd6a9a28d793` |
| `.agents/skills/test-optimization/references/resolving-candidates.md` | `f71fec7fc75de2fd6fdffac1075ad5cf91477c554c759c03740aab0cd3e960a3` |
| `.agents/skills/test-optimization/references/verification.md` | `0636e12ef9b4aaf951f38afe272fb017cbecf4729b09ab6f6c6c12f123acc66a` |
| `.cursor/rules/frontend-testing.mdc` | `23614a2a07e4bc8e448e82e0b137e1cad4b967c707f4301685d2c7fc54505045` |
| `.cursor/rules/backend-testing.mdc` | `452c942a97fe3a53ce3cd469def6863e6ed939d3bae02dda51471e92b83a8843` |
| `.cursor/rules/e2e-authoring.mdc` | `0b369cee0f5c2900c9d4576aac041107d612db324968389d3a8c8f720870e22a` |
| `.cursor/rules/cli.mdc` | `3785a9ca9ac25eb6569d9cbb821a4849090ca37d3648432b1e70f129ece5b974` |
| `.cursor/rules/unit-testing.mdc` | `ea1e217ca122efa82ad90450992c1ab1b0dc8f15a924f6838de110f7094719f0` |

## Purpose

Shorten local test feedback without reducing behavioral coverage or confidence.
Fewer redundant cases, less code, and cleaner design are complementary means
to that time-saving goal, not independent substitutes for it.

## Triggers

Optimize or speed up tests, investigate slow tests, reduce test redundancy, or
profile test performance. Profile-only requests stop at findings; `--resolve`
triages recorded candidates without running an optimization pass.

## Distinguishing behavior

- Full selected-scope baseline and comparable re-profile, focused intermediate
  verification, deterministic synchronization, and evidence before consolidation.
- Slowest tests seed investigation; aggregate cost and related behavior expand
  it across files and test boundaries. Removes the source's file-or-three-test
  grouping, rank adjacency, hard top-10% scope, and first-applicable-tactic limit.
- Family analysis survives smaller execution slices. Discovery follows a cost
  hypothesis and stops when more inspection no longer changes the experiment or
  proof. Measured experiments precede delivery; ineffective changes are revised
  or undone, and results can redirect the remaining strategy.
- Merges the reusable small-test preferences into the existing authoritative
  [behavioral test guidance](../dough-post-change-refactor/references/refactor-checks.md#tests-as-behavioral-documentation),
  also consumed by refactoring and retrospective. Stable boundaries, real lower
  layers, focused/delta assertions, concise builders, and complete destructive
  fixtures share that home rather than acquiring a second optimization copy.
- Retains execute-plan delegation, delivery, and its normal retrospective. The
  maintainer's request to omit retrospective applied only to the critical review.
  Uses current Open Dough plan
  conventions; wrap-up owns history cleanup after review. Corrects the source's
  summed-duration-as-CPU label and red-reprofile fallback to partial timings/CI.

## Client project context

Task-selected scope, actual test boundaries and locations, literal profile and
verification commands, environment and service requirements, relevant project
test/architecture rules, plan conventions and execution authority. Candidate
records and profile-only exclusions are optional existing mechanisms.

Runtime dependencies are the linked shared behavioral guidance, executable-plan
format, execute-plan workflow, and story wrap-up with their existing dependencies.
No installer declaration or installed managed copy is changed by extraction.

## Differences that rule out replacement

This is an on-demand extraction, not a replacement for the linked automatically
applied `unit-testing.mdc` or scoped package rules. Their reusable style is merged
as context for this skill and existing consumers; automatic application outside
those workflows is not delivered. Any separate rule replacement requires manual
delivery design and review.

Project-specific taxonomy (only unit/E2E), controller/CLI/package layout, Nix
wrapper, concrete commands, selectors, builder names, annotations, reporter parser,
skip tag, candidate path, GSD paths, hooks, and domain ADR policies are not imposed.
In particular, the local loud-failure exemption and migration-harness deletion
policy are not portable defaults. Selector performance remains a measured tactic,
with project and accessibility proof preserved.

Fixed-rank batches, edits restricted to slow tests, internal-mock-heavy unit tests,
lost integration proof, automatic normal-test skipping, or deleting review evidence
at execution completion are not equivalent behavior. `--resolve` preserves obvious
profile-only exclusion authority subject to project policy and retains unresolved
decisions rather than claiming completion while a question remains open.

## Validation needed

Representative authoring walkthrough, 2026-09-15, under
[AGENTS.md](../../../AGENTS.md) and ADRs
[0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):

- **Invocation context:** a request to speed up checkout validation selects
  optimization; a profile-only request stops after measurement. A resolve-only
  invocation neither profiles nor implements its replacement plan.
- **Required context:** in a project with browser scenarios, API tests, and
  in-process pricing tests, resolve its existing commands and boundaries without
  requiring Doughnut's names or layout. Missing profile command stops measurement;
  missing candidate file does not. Missing plan root stops plan creation.
- **Useful outcome:** slow checkout scenarios across several files lead to the
  full related validation family, including fast unit siblings outside the top
  decile. An equally slow unrelated export test stays separate. Consolidate
  equivalent rule examples, keep their distinct edge/error protections in real
  stable-boundary tests, retain the real checkout/persistence journey, and remove
  repeated setup. Each deletion has surviving proof before it occurs. Measure
  all replacement cases and the same local-run conditions; assess support code
  as part of design simplification.
  Parameterizing unchanged cases alone cannot establish fewer executions.
- **Shared-cost grouping:** checkout and export tests using one expensive
  fixture remain distinct behavior families. Assign the fixture change once,
  include both consumers in verification, and avoid counting its saving twice.
- **Experiment feedback:** removing repeated checkout setup passes behavioral
  checks but makes the focused run slower. Undo that experiment's edits before
  delivery, retain the finding, and revise the hypothesis toward repeated process
  startup. Stop expanding discovery once the needed consumers and proof are
  understood. Judge a successful replacement against local feedback time;
  if focused improvement disappears in the final local run, investigate again.
- **Timing caution:** a small apparent gain after a warm run is inconclusive
  until a comparable check supports it. No fixed statistical protocol is required.
- **Resolve-only planning:** a candidate with stale timing evidence creates a
  replacement plan whose first prerequisite obtains a valid baseline during
  later execution. Resolution itself runs no profile or optimization. Candidates
  stored only in a completed plan remain live until resolved or transferred;
  cleanup cannot discard their outstanding decisions.
- **Boundary check:** a proposed mock that bypasses checkout persistence conflicts
  with the integration promise. Cite that promise and keep the real proof; if
  changing the promise is necessary, stop that path for the human decision.
  Missing after-profile evidence leaves measurement incomplete. A slow candidate
  remains in profiles until an authorized profile-only disposition is applied.

This is a guidance walkthrough, not an executed optimization or measured speedup.
Before promotion, maintainer review still needs to accept the invocation-context,
required-client-context, and useful-outcome behavior above, including the shared
style revision. Apply the relevant delivery checks when promotion is selected;
extraction itself leaves the new skill outside the declared payload.
