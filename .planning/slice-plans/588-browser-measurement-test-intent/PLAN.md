# Express browser-measurement test intent through shared setup

**Identity:** SEED-300#express-browser-measurement-test-intent
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-browser-measurement-test-intent)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Goal and provisional scope

A developer can read what a browser-measurement proof calls and independently
observes while repeated fixture DOM, coordinate and CDP touch setup has one
test-side owner. Receive the original **Browser measurement proofs** finding,
including same-sequence sibling callers in frontend and runtime proofs.

The source audit was at `7eab3d6ca`; current inspection was at `9779b93c1`.
No original executable plan existed; this receives an audit finding and maps
its independent proof loops, not fictional original slices. Refinement must
confirm worthwhile repeated setup, concrete examples and proof cohorts before
making this plan executable.

The direct utility call, its exact input and independent measurement evidence
remain visible. Do not route a test of a measurement utility through the same
utility to construct its expected answer. Runtime direct browser-turn, trace,
document metadata and request-draining observations serve their tested
contracts; retain them directly. No broad page-object conversion or product
measurement change is promised.

## Architecture and existing owners

Reuse `dashboard/tests/partArrangement.ts`, `controlReachability.ts`,
`touchGestures.ts` and existing test-side DOM/layout primitives where they
actually own repeated setup. Frontend fixture DOM is an exact input under test,
not domain data to hide in an unrelated builder. MakeMe remains required for
any dashboard domain data a case does arrange.

[ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires the setup saving and source clarity to justify helper cost against the
audit baseline. A direct measurement or literal fixture can remain when it is
the independent tested contract; disposition it with evidence rather than
extracting every DOM lookup. [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps presentation measurements distinct from authoritative project facts.
This story adds no new architecture machinery or persisted state.

No inspected expected helper owner exceeds 250 lines. Preserve arrangement,
reachability and native touch ownership instead of creating a shared utility
that owns both measurement implementation and its expected observation.

## Provisional slices and proof ownership

Commands are illustrative until refinement confirms the exact cases and
transitive consumers. Each slice records repeated setup adopted or direct
evidence retained, with a representative source comparison and all assertions.

### 1. Make arrangement-observation setup readable without obscuring the call
Type: Behavior
Status: planned
Proof: Share only repeated fixture lookup/coordinate setup around direct
arrangement utility calls. Preserve independent cross-turn scrolling,
overlap/absence mutations and expected failure evidence. Illustrative:
`npm run test:dashboard -- 'frontend-tests/observation-measurements.spec.ts'`.

Behavior: A developer reads a browser arrangement case → sees the direct
utility call beside independent fixture and measurement facts → repeated setup
has a clear owner where useful, and the original positive and fault checks pass.

### 2. Make reachability setup readable with independent expected geometry
Type: Behavior
Status: planned
Proof: Reuse repeated fixture/coordinate primitives only where they do not
derive expected reachability through the function being tested. Preserve exact
dimensions, direct call and discriminating movement/visibility observations.
Illustrative: `npm run test:dashboard -- 'frontend-tests/control-reachability-observation.spec.ts'`.

Behavior: A developer reads a control-reachability case → sees the direct
operation and its independent geometry expectation → repeated surrounding
mechanics are shared where worthwhile, with original browser checks passing.

### 3. Make native touch setup readable while retaining frame and call evidence
Type: Behavior
Status: planned
Proof: Share repeated CDP/fixture setup around direct touch utility calls;
retain native dispatch calls, frame observations, reading predicate, exact
movement and cleanup. Inspect runtime observation-measurements callers and
retain direct browser-turn/trace/metadata/drain evidence that serves the
contract. Illustrative:
`npm run test:dashboard -- 'frontend-tests/touch-reading-observation.spec.ts' 'backend-tests/runtime/observation-measurements.spec.ts'`.

Behavior: A developer reads a touch-observation case → follows the direct
utility call and independent frame/event evidence → setup ownership improves
without hiding the contract, and unchanged native/runtime observations pass.

## Refinement and verification still required

Resume `dough-story-refinement`, realign this same plan, then perform slice-plan
refinement and record the assessment. This provisional plan grants no readiness,
Take or execution. Refinement must inspect whether repeated setup warrants
extraction and observe the consuming proof; a justified direct-observation
disposition is valid without adding a helper.

Use changed specs plus transitive consumers and `npm run typecheck:dashboard`
for shared TypeScript changes. Broader local gates need changed shared
fixture/consumer evidence or another requirement; CI configuration alone does
not impose a full local suite. Preserve original expectations, exact tested
inputs, test tiers, causal waits, controlled clocks, helds and native/HTTP/Git/
record evidence. Use MakeMe for domain data. Carry the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff. Keep default timeouts;
no wall-clock sleeps or `test.slow()`.
For long macOS runs start fully awake: on AC use `caffeinate -s -i`; on battery
plug in or keep the lid open under `caffeinate -i` and inspect sleep logs under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
