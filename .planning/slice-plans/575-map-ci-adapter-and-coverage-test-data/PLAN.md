# Make CI adapter attempt, queue and coverage test setup map directly to the domain

**Identity:** SEED-261#map-ci-adapter-and-coverage-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-ci-adapter-and-coverage-test-data)
**Source review:** [Source-only review](source-review.md)

## Goal and boundaries

Maintainers can trace arranged custom CI attempts, queue progress and stored
revision coverage through one MakeMe entry point, preserving independent proof.
Convert valid facts, repair exposed mappings, remove/delegate displaced setup,
and retain converted cases on that owner. The roughly 60-file estimate locates
consumers; it neither defines completion nor limits edits.

GitHub run/job, proof fragment/summary and native shell setup stay with sibling
stories. Keep real Git, executed commands and their observed results, adapter
programs/encoding, workers, wake-ups, clocks and cleanup in harnesses. Keep
malformed, legacy and contradictory inputs literal when their exact form is
under proof. Expectations stay independently written. No new adapter protocol,
CI policy, UI, timing algorithm, installation or native acceptance is selected.

## Current decisions and PFE

- Extend [`aCiAdapterAttempt`](../../../tests/support/ciTimingTestData.mjs)
  behind [`makeMe`](../../../tests/support/makeMe.mjs). Its existing passed,
  untimed, pending and incomplete construction already serves comparisons and
  landed timing. Add only consumer-needed construction, including failure,
  arbitrary URLs, optional ordering/timing and unattested legacy targets. Do
  not make a completion timestamp silently become an ordering requirement.
- The authority for discovery shape and normalization is
  [`ci-command-attempts`](../../../src/skills/dough-execute-plan/scripts/ci-command-attempts.mjs);
  queue input belongs to
  [`ci-command-adapter`](../../../src/skills/dough-execute-plan/scripts/ci-command-adapter.mjs).
  Preserve string/number identities and absent optional fields. A builder
  returns the boundary's real shape, not a suite-specific intermediate model.
  Use production type/schema/encoder inputs in JSDoc; where these JavaScript
  owners have no named input type, document the existing contract at its owner
  rather than duplicating it as a new test-only authority. No semantics change
  is implied by exposing a type.
- Add shared queue-entry and revision-coverage construction with real consumers.
  [`ci-mailbox-revision-records`](../../../src/skills/dough-execute-plan/scripts/ci-mailbox-revision-records.mjs)
  owns stored records; observation, applicability and integrated judgment own
  how they are produced. Queue progress has no verdict or attempt identity;
  a stored record may carry locally observed queue/attempt freshness, ancestor
  basis or integrated evidence without becoming an adapter response. Use the
  real JSON publication seam for stored starting facts. Never seed the coverage
  a worker test promises to observe, or manufacture a completion receipt.
- Reuse the actual normalization path when a custom-attempt fixture needs its
  observed projection. Preserve independently arranged reader/view facts in
  the existing `aStoryCiComparison`, `aRevisionCiRun` and landed-CI builders;
  do not replace a derived view with raw discovery input. Keep genuine
  transport and observation boundaries, minimizing additional translation.
- `passed` in `intentCiAdapterProofProject`, `attempt`/`makeAttempt` in Node
  adapter readers, and `commandAttempt`/`queueEntry` in revision fixtures are
  existing duplicate construction candidates. Delegate or remove them while
  preserving response routing. `accepted` in integrated-state judge fixtures
  arranges a coverage record; its `validated`/`unresolved` helpers express
  independent expectations and stay independent. The custom journey provider
  actually executes the covered command through the real example adapter:
  retain that evidence instead of replacing its output with a builder.
- Follow [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  [ADR 0005, Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci),
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  and [test data architecture](../../../tests/test-data-architecture.md).
  The comparison is today's duplicate construction: readable driving facts,
  one canonical construction rule, fewer local factories, unchanged meaningful
  assertions. No performance gain is claimed. The existing
  [North Star: One Intent workspace with landed CI evidence](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
  retains attempt/revision/landing distinctions; no new direction is needed.
- Execute in Story Branch Mode. No slice acts from trunk or needs a new
  supplier agreement. Reconcile other SEED-261 conversions and landed-CI work
  without rewriting their facts or claims; shared files alone are no dependency.

## Learnings

- SEED-261#map-github-actions-ci-test-data landed the MakeMe CI/launch split
  (`ciMakeMe.mjs` / `launchMakeMe.mjs`). Slice 1 absorbed that trunk
  reorganization before delivery; `aCiAdapterAttempt` stays on the CI group.
- Verbose MakeMe call sites pushed `intent-ci-proof-adapter-reasons.spec.ts`
  over 250 lines; shared Intent `passed`/`failed` listed-attempt helpers
  restored size without post-`please()` mutation. Dashboard tests need a TS
  `type` alias for listed-attempt options, not a JSDoc `@typedef` alone.

## Cohesive organization

At preparation revision `05fa641a6f56141a21cb95714409c6eb8a59cc2c`, MakeMe
is 244 lines and its timing/adapter module 98. No inspected expected edit is
already over 250 lines. New getters may cross that threshold: slice 1 keeps
construction/type knowledge in CI domain modules and, as necessary, composes
a CI builder group behind the unchanged public entry point. The GitHub story's
reorganization has landed and was reused. Preserve fresh independent
values, every existing caller's type inference and the native runtime import
closure; dashboard typecheck, native-evidence identity and traced consumers
prove those boundaries. Recheck sizes for each actual edit and keep cohesive
cleanup with its owning slice, including tests near the limit. Current sizes
after slice 1: `makeMe.mjs` 201, `ciMakeMe.mjs` 196, `ciTimingTestData.mjs` 141.

## Outside-in proof ownership

| Source promise | Owner and observation |
| --- | --- |
| Example 1: opaque/numeric identity, outcome and legacy omission survive acquisition | Slice 3: command acquisition and emitted failure assertions; slice 1: status/proof requests retain identity. |
| Example 2: eligible retry, check/context, ambiguity, absent timing and shared evidence | Slice 1: real revision lookup and displayed proof identity; slice 2: endpoint, timing, proof-request and retained-history assertions. |
| Example 3: fresh queue progress has no verdict and is withdrawn appropriately | Slice 4: real controlled-poll worker, recorded progress, absent checkedBy/verdict, replacement and withdrawal. |
| Example 4: ancestor basis, exact supersession and policy/ancestry validation remain distinct | Slice 4: revision-coverage families and integrated judge; retain custom executed-command journey proof. |
| Example 5: stored basis is consumed honestly and completion owns shutdown | Slice 5: real await/complete CLI receipts, verdict/source, unresolved reasons and worker lifetime. |
| All scopes: shared setup, visible driving facts, independent expectations, no obsolete factories | Each consuming slice: compare replaced values/encoded bytes, trace callers, remove displaced construction and unused variants. Final slice checks remaining scoped setup. |

## Settled premises and preparation observations

Observed on 2026-11-10 in this assigned checkout at `05fa641a6`, on Node
24.21.0 and Chromium 153.0.8010.12 after native npm/browser/check setup passed.
Commands ran baseline, scratch conversion, fault and exact restoration.
Temporary MakeMe methods copied the facts; scratch bytes were restored before writes.

`N` means `bash scripts/test.sh` with these exact four arguments:
`tests/support/dashboard-ci-adapter-revision-lookup.test.mjs`,
`src/skills/dough-execute-plan/scripts/ci-command-attempts.test.mjs`,
`src/skills/dough-execute-plan/scripts/ci-queue-coverage.test.mjs`, and
`src/skills/dough-execute-plan/scripts/ci-mailbox-complete.test.mjs`.

`D` means `node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts tests/intent/intent-ci-proof-adapter.spec.ts --grep "a ciAdapter attempt's proof is read" --workers=1 --reporter=line`.

`C` means `node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts tests/intent/intent-ci-comparison-adapter.spec.ts backend-tests/intent/landed-ci-scope-adapter-shared-attempt.spec.ts --workers=1 --reporter=line`.

| Premise and consuming operation | Observed result; unverified remainder |
| --- | --- |
| Shared attempt facts survive normalization with optional fields and check ownership | `N`: baseline exit 0 (39.5 s), scratch `attempt` factory using `aCiAdapterAttempt.with(...).please()` exit 0 (32.5 s), restoration exit 0 (31.1 s). A separate same-runner fault forced only `runId` to `wrong-run`: exit 1 (0.6 s), independent identity/retention assertions failed; exact restoration exit 0 (0.6 s). Changing only attemptId to one common value did not discriminate these particular assertions; the display probe below owns attempt-ID discrimination. |
| Queue facts reach real adapter discovery, controlled polling and mailbox projection | In the same `N` conversion, `commandAttempt` and `queueEntry` delegated to temporary MakeMe construction; all four suites passed. Changing only queue branch to `wrong-target` failed the independent exact queue/freshness assertions and coalesced progress observation (`N` fault exit 1, 29.6 s). Original target restored with the passing `N` result above. |
| Stored not-required coverage reaches real completion and confirmed shutdown | In the same `N` conversion, the ignored-only completion case published a MakeMe record through `publishJson`; passed. Changing only its ancestor basis from success to failure failed the existing verdict assertion (actual failure, expected success) in the same fault run. Exact restoration passed. Worker-produced records stayed produced by workers. |
| Attempt identity reaches the dashboard verdict, displayed proof and real adapter request | `D`: baseline 1 passed (20.0 s), shared `passed` helper delegated to temporary `aCiAdapterAttempt.with` and 1 passed (5.8 s). Changing only built attemptId to `wrong-attempt` failed the existing evidence-label assertion (16.0 s); exact restoration 1 passed (8.5 s). The retained numeric-ID/request assertions also passed. |
| Shared attempt construction reaches comparison timing and retained-history identity/deduplication | `C`: baseline 2 passed (20.3 s); existing `.passed` delegated its same canonical output to temporary `.with`, 2 passed (24.5 s). Changing only run 402's completion by one minute failed the independent Branch wall-time assertion (4 min 20 s instead of 3 min 20 s). Changing only `shared-run` to `wrong-shared` failed the independent collected-build identity assertion. Fault run: 2 failed (37.7 s); exact restoration: 2 passed (27.2 s). |

The two Node drivers used:
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i python3 <temporary-driver>`.
Browser-only `C` omitted the unused repository-job variable. All drivers ran
sequentially and restored bytes in `finally`.
Before launch this AC-powered 16-CPU Mac had load 30.63, 44% free memory and
other worktrees' focused browser/lint work. Chose one repository job and one
browser worker, sequenced, with no full run; unrelated processes stayed owned.
These observations settle the existing consuming routes and conversion seams.
Implementation still owes complete traced proof; these probes cover their named routes.

## Proof and delivery gates

Follow [AGENTS test automation](../../../AGENTS.md#test-automation) and [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written; carry that link or verbatim policy into every delegation brief and
repair handoff. Failures/flakes remain repair obligations, including on the
base and through final CI. Preserve an active repair owner's files; never
substitute rerun-until-green or timeout relaxation for repair.

Use [Execute Plan](../../../.agents/skills/dough-execute-plan/SKILL.md) for
independent post-change refactoring, focused proof, commits, publication and
asynchronous CI repair. At each diff run its installed consumer-trace command
with `--base HEAD`, including changed helper exports as terms. Starting terms:
`aCiAdapterAttempt`, `passed`, `makeAttempt`, `commandAttempt`, `queueEntry`,
`accepted`, `publishRevisionRecord`, `adapterSlot`, `aRevisionCoverage` and
`aCiQueueEntry`. Follow helper exports into consuming tests and give every
consumer a run, reused or reasoned excluded disposition. The groups below
are current starting selections, not exclusions for indirect consumers.

Local gate: follow [native setup](../../../tests/native-setup.md), select
Homebrew Bash 5 and the pinned Node, and unset the three variables used above.
Run Node checks through `bash scripts/test.sh` with exact paths. Each slice
runs its named consumer suites and `npm run lint`; shared JavaScript changes
also run `npm run typecheck:dashboard` and the MakeMe closure check
`bash scripts/test.sh tests/native-evidence-identity.sh`. Keep dashboard runtime
imports out of builders; use type-only imports. Compare boundary values before
moving defaults and retain deliberate omission and invalidity at call sites.

Before long selections inspect current load, memory and competing work; keep
owned heavy work sequential with one or two dashboard workers. Start fully
awake on macOS; on AC wrap full/long runs in `caffeinate -s -i`; on battery
plug in or use `caffeinate -i` awake with lid open and inspect the sleep log,
under [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Use controlled clocks/event waits and default timeouts; never `test.slow()` or
suite/group/hook overrides. Traced distributed consumers suffice locally.
Hosted CI failures remain owned through final CI under the linked policy.

## Slices

### 1. Status and proof readers share the selected adapter attempt
Type: Behavior
Status: done
Proof: Examples 1–2. Run dashboard `tests/launches/agent-launch-base-ci-adapter.spec.ts`, `tests/intent/intent-ci-status-reads.spec.ts`, `tests/intent/intent-ci-proof-adapter` and backend `ci-proof-memory-adapter` selections. Node: `tests/support/dashboard-story-branch-ci-adapter.test.mjs`, `dashboard-ci-adapter-revision-lookup.test.mjs` and `dashboard-ci-adapter-proof.test.mjs` in that same directory.

MakeMe supplies a valid discovery attempt → real acquisition, revision lookup
and status/proof reads consume it → the existing base warning, running ancestor,
retry/check/context, ambiguity and proof-request assertions retain their meaning.
Extend the existing attempt builder and perform any public-entry reorganization.
Delegate/remove `passed`, Node `attempt`/`makeAttempt` and inline valid attempts,
including data embedded in generated adapter programs. Build facts before
encoding the program/JSON; keep held reads, faults and exact protocol examples
explicit. Run all indirect consumers of the changed shared helper in this slice.

### 2. Comparisons and retained history share exact attempt evidence
Type: Behavior
Status: done
Proof: Example 2. Run dashboard `tests/intent/intent-ci-comparison-adapter`, `tests/intent/intent-ci-wall-time-history-adapter.spec.ts`, backend `landed-ci-scope-adapter`, `landed-ci-proof-adapter-units.spec.ts`, and mounted comparison presentation consumers traced from `mountedComparisonAdapterCases`.

Adapter facts come from the same MakeMe owner → comparison and collection use
their actual acquisition and retained records → independent endpoint identity,
missing timing, ambiguity, shared-attempt deduplication and proof-read counts
stay unchanged. Retain the already-converted comparison answers and timing
cases; convert remaining attempt overrides and view/identity facts through
their existing canonical builders. Keep proof artifact construction with its
sibling and actual storage/collection with the harness. Remove duplicate
adapter identity assembly only where the existing projection can own it.

### 3. Command observation preserves opaque attempts and failure evidence
Type: Behavior
Status: done
Proof: Example 1. Run all `ci-command-adapter*.test.mjs` plus `ci-command-attempts.test.mjs` through the Node runner under `src/skills/dough-execute-plan/scripts/`; include traced observer/CLI consumers.

Shared valid attempt facts enter a generated adapter response → the real
command acquisition/observer reads successive polls → pending, success,
failure, incomplete, ordering and retained history preserve the same identity
and diagnostics. Delegate the controlled fixture's response facts and direct
valid snapshots. Keep argv/stdin/limits, process failures and exact malformed
responses under their existing proof. No generated process needs an import
of the test library when the parent can encode already-built facts.

### 4. Revision observation keeps queue progress separate from coverage
Type: Behavior
Status: done
Proof: Examples 3–4. Run `ci-queue-coverage.test.mjs`, all `ci-revision-coverage*.test.mjs`, `watch-ci-execution-coverage.test.mjs`, `ci-mailbox-revision-records-boundary.test.mjs`, `ci-integrated-state-judge*.test.mjs`, `ci-integrated-state-ineligible.test.mjs`, `ci-integrated-state-stop.test.mjs`, `ci-integrated-state-custom.test.mjs` and traced integrated-state journeys in the same script directory.

MakeMe supplies queue/attempt inputs or a judge's accepted starting record →
real polling, applicability and ancestry judgment run → progress, inherited
basis, exact supersession and integrated validation stay distinct. Add the
queue/coverage builders with these consumers; delegate `queueEntry`,
`commandAttempt` and `accepted`. Convert valid arranged records without
rebuilding observed outputs or expected `validated`/`unresolved` results.
Preserve real Git and executed custom-provider evidence and the malformed
queue counterexamples. Exercise every indirect completion consumer of the
revision fixture before publishing its delegated constructors.

### 5. Mailbox completion consumes recorded evidence without inventing it
Type: Behavior
Status: done
Proof: Example 5. Run `ci-mailbox-await.test.mjs`, `ci-mailbox-complete.test.mjs`, `ci-mailbox-pending-completion.test.mjs`, all `ci-mailbox-completion-*.test.mjs`, `ci-mailbox-worker-loss.test.mjs`, and traced mailbox launch/CLI consumers in the same script directory.

Shared construction supplies only valid stored starting facts → real wait or
complete reads them → verdict/source, unresolved reasons, expiry and shutdown
assertions stay independent. Convert record literals in imported await/complete
case modules, completion fixtures and worker-loss setup; keep malformed bytes,
worker signals, result files and real observer-produced coverage in their
existing roles. Keep GitHub run construction on its sibling's owner. Audit
the scoped families for remaining hand-built valid attempts/queue/coverage,
remove dead constructors/variants, and finish the final traced consumer checks,
reusing unchanged accepted proof whose boundaries still match.

## Readiness review

Plan refinement was not needed: five cohesive conversion outcomes keep setup,
preserved proof and displaced-construction removal together. The same attempt
construction serves dashboard and command consumers; queue and stored coverage
retain their different authorities. No project numeric slice limit is supplied.
Reviewed all five examples against their slices and consuming observations.
No remaining slice-specific, cumulative-design, proof-route, scope or human-owned
decision concern was identified. Every implementation slice remains planned.


## Story obligations

### X1. GitHub run/job conversion stays with sibling
Reported: slice 1 — "Source review commits GitHub run/job conversion remains with its sibling story."
Story clause: "GitHub run/job, CI proof fragment/summary, and native shell setup conversion remain with their sibling stories."
Disposition: excluded "GitHub run/job, CI proof fragment/summary, and native shell setup conversion remain with their sibling stories."
Commitment: 8.1


### X2. CI proof fragment/summary conversion stays with sibling
Reported: slice 1 — "Source review commits CI proof fragment/summary conversion remains with its sibling story."
Story clause: "GitHub run/job, CI proof fragment/summary, and native shell setup conversion remain with their sibling stories."
Disposition: excluded "GitHub run/job, CI proof fragment/summary, and native shell setup conversion remain with their sibling stories."
Commitment: 8.2

### X3. Native shell setup conversion stays with sibling
Reported: slice 1 — "Source review commits native shell setup conversion remains with its sibling story."
Story clause: "GitHub run/job, CI proof fragment/summary, and native shell setup conversion remain with their sibling stories."
Disposition: excluded "GitHub run/job, CI proof fragment/summary, and native shell setup conversion remain with their sibling stories."
Commitment: 8.3

### X4. Mixed tests convert only this story facts
Reported: slice 1 — "Source review commits mixed tests convert only this story facts."
Story clause: "Mixed tests convert this story's facts only."
Disposition: excluded "Mixed tests convert this story's facts only."
Commitment: 8.4

## Execution complete

Product advice: Keep backlog order with next SEED-261#map-ci-proof-test-data,
then installation/native; no reorder or new queue item from this review.
Assimilate MakeMe ownership of adapter attempt, queue, and revision-coverage
arranged facts; thin fixture delegates are intentional. Tip harness repairs
(private Vite comparison-renderer cache; nested test-runner-split isolation
from outer CI SPLIT) stay on the candidate outside story scope unless recurrence
after landing shows guidance debt. Process findings from the two harness repairs
were not written to DearDough.md (999-line ceiling); wrap-up may retain them
manually if wanted.