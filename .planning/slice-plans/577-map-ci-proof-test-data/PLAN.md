# Make CI proof evidence test setup map directly to the domain

**Identity:** SEED-261#map-ci-proof-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-ci-proof-test-data)
**Source review:** [Numbered source commitments](source-review.md)

## Goal and boundaries

Maintainers can trace arranged CI proof fragments, summaries, entries,
evidence, runner proof records and listed summary artifacts through one MakeMe
entry point, preserving independent proof. Convert valid facts, repair exposed
mappings (path-based unit inference and positional part tuples/casts),
remove/delegate displaced setup, and retain converted cases on that owner. The
roughly 35-file estimate locates consumers; it neither defines completion nor
limits edits.

GitHub run/job, adapter attempt/queue/coverage and installation/native setup
stay with sibling stories. Keep real report conversion, collector
summarization, artifact zip assembly/download, parse failures, size limits,
source positions, clocks and teardown in harnesses. Keep malformed, legacy and
contradictory exact JSON and captured archive bytes literal when their form is
under proof. Expectations stay independently written. No new UI, collector
protocol, proof-unit policy, CI workflow or installation is selected.

## Current decisions and PFE

- Extend the existing
  [`aCiProofFragment`](../../../tests/support/ciProofFragmentTestData.mjs),
  [`aCiProofSummary`](../../../tests/support/ciProofSummaryTestData.mjs),
  [`aCiProof`](../../../tests/support/ciProofTestData.mjs),
  [`aCiProofEntry`](../../../tests/support/ciProofEntryTestData.mjs),
  [`aCiProofEvidence`](../../../tests/support/ciProofEvidenceTestData.mjs),
  [`aCiProofArtifact`](../../../tests/support/ciProofArtifactTestData.mjs) and
  [`aDashboardProofRecord`](../../../tests/support/dashboardProofRecordTestData.mjs)
  builders behind [`makeMe`](../../../tests/support/makeMe.mjs) /
  [`ciMakeMe`](../../../tests/support/ciMakeMe.mjs). Add only
  consumer-needed construction. Do not invent another proof representation or
  make an incidental default invent unit, attempt identity or measured time.
- Production authorities:
  [`ci-proof-contract`](../../../src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs)
  (fragment/summary schemas and attempt identity),
  [`ci-proof-fragments`](../../../src/skills/dough-test-optimization/scripts/ci-proof-fragments.mjs)
  (report conversion and unit assignment),
  [`ci-proof-collect`](../../../src/skills/dough-test-optimization/scripts/ci-proof-collect.mjs)
  (collector), and
  [`ciProof`](../../../dashboard/src/ciProof.ts) (dashboard read shape). A
  builder returns the boundary's real shape. Prefer production constructors at
  the write boundary; avoid suite-specific intermediate models and unnecessary
  casts.
- [`ci-proof-test-fixtures`](../../../src/skills/dough-test-optimization/scripts/ci-proof-test-fixtures.mjs)
  (`locatedRecord`, `playwrightRecord`, `fragment`/`fragmentOf` wrappers) and
  positional `ProofPart` / declaration tuples in
  [`ciProofArtifacts`](../../../dashboard/tests/support/ciProofArtifacts.ts)
  are duplicate construction to remove or thin. Keep harness helpers that only
  assemble real collector input, zip bytes or Origin answers once domain facts
  come from MakeMe (`proofSummaryForEntries`, `zipOf`, `summaryZipAnswer`,
  `runArtifactsAnswer` are candidates to keep as thin transport when they no
  longer invent domain facts).
- An outcomes path under `dashboard/tests` does not become test cases; Playwright
  cases stay cases regardless of path. A summary and its fragments share one
  attempt identity and checked revision. Present, missing and ambiguous parts,
  a recorded zero, absent evidence and unavailable reasons stay distinct. File
  breakdown paths never count as test files.
- Follow [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  [ADR 0005, Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci),
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  and [test data architecture](../../../tests/test-data-architecture.md).
  The comparison is today's duplicate construction: readable driving facts,
  one canonical construction rule, fewer local factories, unchanged meaningful
  assertions. No performance gain is claimed. The existing
  [North Star: One Intent workspace with landed CI evidence](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
  retains attempt/revision/proof distinctions; no new direction is needed.
- Execute in Story Branch Mode. No slice acts from trunk or needs a new
  supplier agreement. Reconcile other SEED-261 conversions without rewriting
  their facts or claims; shared files alone are no dependency.

## Cohesive organization

At preparation revision `5deb0028f6b023eaa7a2d19c2a3e76bb31685cbe`,
`ciProofEvidenceTestData.mjs` is 245 lines and `ciMakeMe.mjs` 196. No inspected
expected edit is already over 250 lines. New getters may cross that threshold:
keep construction/type knowledge in CI proof domain modules and compose through
the unchanged public entry. Recheck sizes for each actual edit and keep
cohesive cleanup with its owning slice, including tests near the limit.

## Outside-in proof ownership

| Source promise | Owner and observation |
| --- | --- |
| Example 1: path does not invent units; declarations exclude wrong-unit fragments | Slice 1: unit-declarations, units, outcomes, fragments and CLI unit assertions. |
| Example 2: shared attempt/revision identity; missing and ambiguous parts | Slice 1: collector/summary identity assertions; slice 2: read-boundary and unavailable/mismatch cases. |
| Example 3: case and file units stay apart; breakdown paths are not file counts | Slice 2: Node unit/breakdown readers; slice 3: Intent proof and comparison unit displays. |
| Example 4: MakeMe entries reach real collector/zip; legacy JSON and unavailable reasons stay literal | Slice 3: dashboard journeys; slice 4: remaining fixture removal and unavailable/corrupt/oversized cases. |
| All scopes: shared setup, visible driving facts, independent expectations, no obsolete factories | Each consuming slice: compare replaced values/encoded bytes, trace callers, remove displaced construction and unused variants. Final slice checks remaining scoped setup. |

## Settled premises and preparation observations

Observed on 2026-11-10 in this assigned checkout at `5deb0028f`, on Node
24.21.0 and Chromium 153.0.8010.12 after native npm/browser/check setup passed.
Commands ran baseline, scratch conversion, fault and exact restoration.
Scratch product edits were restored before plan writes; only the seed draft
remained dirty.

`N` means `bash scripts/test.sh` with these exact three arguments:
`src/skills/dough-test-optimization/scripts/ci-proof-unit-declarations.test.mjs`,
`src/skills/dough-test-optimization/scripts/ci-proof-fragments.test.mjs`, and
`tests/support/dashboard-ci-proof-units-read.test.mjs`.

`U` means `bash scripts/test.sh` with
`src/skills/dough-test-optimization/scripts/ci-proof-unit-declarations.test.mjs`
alone.

`D` means `node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts tests/intent/intent-ci-status-sort.spec.ts --workers=1 --reporter=line`.

| Premise and consuming operation | Observed result; unverified remainder |
| --- | --- |
| Runner proof records reach fragment conversion and unit/read assertions through MakeMe | `N`: baseline exit 0; scratch `locatedRecord` delegating to `aDashboardProofRecord.from(...).withTest(...).please()` exit 0; restoration exit 0. |
| Undeclared outcomes stay legacy; inventing `case` breaks the existing unit-declaration assertion | `U`: fault changing outcomes `unit === undefined` to `{ unit: "case" }` failed the independent expected legacy/`checks` deep-equal for `dashboard/backend-tests` and `tests` (exit 1); exact restoration exit 0. Playwright `dashboard/tests` remained cases in both runs. |
| Positional dashboard summary tuples can be replaced by MakeMe entries through `proofSummaryForEntries` | `D`: baseline 1 passed (~14.5 s); scratch MakeMe entries + `proofSummaryForEntries` 1 passed (~11.7 s). Changing only `tests/a` duration from 12_500 to 1 failed the independent "12.5 s" time-cell assertion (expected `12.5 s`, received `1 ms`); exact restoration 1 passed (~15.4 s). |

The Node drivers used:
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i`.
Browser `D` omitted the unused repository-job variable. All drivers ran
sequentially and restored bytes before writes.
Before launch this AC-powered Mac had load about 21 with other worktrees'
work. Chose one repository job and one browser worker, sequenced, with no full
run; unrelated processes stayed owned.
These observations settle the existing consuming routes and conversion seams.
Implementation still owes complete traced proof; these probes cover their named
routes.

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
`aCiProofFragment`, `aCiProofSummary`, `aCiProof`, `aCiProofEntry`,
`aCiProofEvidence`, `aCiProofArtifact`, `aDashboardProofRecord`,
`locatedRecord`, `playwrightRecord`, `fragmentOf`, `proofSummary`,
`proofSummaryForEntries`, `counts` and `ProofPart`. Follow helper exports into
consuming tests and give every consumer a run, reused or reasoned excluded
disposition. The groups below are current starting selections, not exclusions
for indirect consumers.

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

Slice evidence: [1](slice-1-proof.md), [2](slice-2-proof.md).

### 1. Collector and converter tests state units through MakeMe
Type: Behavior
Status: done
Proof: Examples 1–2. Run `ci-proof-unit-declarations.test.mjs`, `ci-proof-units.test.mjs`, `ci-proof-units-cli.test.mjs`, `ci-proof-outcomes.test.mjs`, `ci-proof-fragments.test.mjs`, `ci-proof-legacy-results.test.mjs`, `ci-proof-collect.test.mjs`, `ci-proof-summary.test.mjs`, `ci-proof-duration.test.mjs`, `ci-proof-breakdown.test.mjs`, `ci-proof-breakdown-summary.test.mjs`, `ci-proof-attempt.test.mjs` and `tests/support/ci-proof-actions.test.mjs` through the Node runner; include traced CLI/fixture consumers of the changed helpers.

MakeMe supplies runner proof records and fragments with explicit units → real
converters and the collector consume them → unit, identity, part-status and
count assertions retain their meaning. Delegate/remove `locatedRecord`,
`playwrightRecord` and `fragment`/`fragmentOf` wrappers as consumers move.
Extend existing builders only where a real consumer needs construction. Keep
exact malformed report bytes and independently written expectations outside
builders. Run all indirect consumers of each changed shared helper in this
slice.

### 2. Node readers share MakeMe proof entries and summaries
Type: Behavior
Status: done
Proof: Examples 2–3. Run `tests/support/dashboard-ci-proof-units-read.test.mjs`, `dashboard-ci-proof-breakdown-read.test.mjs`, `dashboard-ci-proof-read.test.mjs`, skill `ci-proof-read.test.mjs`, `ci-proof-archive.test.mjs`, `ci-proof-scope*.test.mjs` and traced Node support proof/scope consumers.

Shared construction supplies valid entries/evidence or a starting summary →
real archive/check/read boundaries consume them → unit separation, breakdown
figures, present/missing/ambiguous parts and identity mismatch stay distinct.
Prefer `aCiProofEntry`/`aCiProofEvidence`/`aCiProofSummary` over reconstructing
domain facts as positional tuples. Keep exact version-1 JSON, corrupt archives
and size-limit cases literal. Retain thin zip/Origin helpers that only encode
already-built facts.

### 3. Dashboard proof journeys arrange evidence through MakeMe
Type: Behavior
Status: planned
Proof: Examples 3–4. Run dashboard `tests/intent/intent-ci-proof*.spec.ts`, `intent-ci-status-sort.spec.ts`, `intent-ci-status-execution-time.spec.ts`, `intent-summary-ci-proof*.spec.ts`, backend `landed-ci-proof*` and `landed-ci-scope-*` selections that still build proof summaries, plus traced comparison/fixture modules under `dashboard/tests/support/*Proof*` and `intentSummaryCiProofFixtures.ts`.

MakeMe entries reach Intent Proof through the real collector or artifact zip →
independent time, counts, unit wording, ancestor and unavailable assertions
stay unchanged. Convert remaining `proofSummary(... ProofPart tuples)` call
sites; thin or remove the tuple API once unused. Keep GitHub run/job and
adapter attempt construction on sibling owners. Preserve exact legacy JSON and
independently written expectations.

### 4. Displaced proof fixtures are gone from scoped consumers
Type: Behavior
Status: planned
Proof: Example 4 and remaining scoped setup. Audit remaining
`ci-proof-test-fixtures` and `ciProofArtifacts` domain constructors; run any
still-unconverted traced consumers from slices 1–3, `tests/support/ci-proof-*.test.mjs`, native-evidence identity, dashboard typecheck and lint.

Suite-local valid proof construction is removed or delegates to MakeMe → mixed
tests convert only this story's facts → unavailable reasons, expired/oversized
artifacts and leftover harness-only helpers remain in their proof roles. Delete
builder variants with no useful consumer. Finish the final traced consumer
checks, reusing unchanged accepted proof whose boundaries still match.

## Readiness review

Plan refinement was not needed: four cohesive conversion outcomes keep setup,
preserved proof and displaced-construction removal together. Runner records,
fragments, summaries and dashboard reads share one MakeMe owner while transport
helpers stay thin. No project numeric slice limit is supplied. Reviewed all
four examples against their slices and consuming observations. No remaining
slice-specific, cumulative-design, proof-route, scope or human-owned decision
concern was identified. Every implementation slice remains planned.

Execution context: [retained identity and observer](execution.md).

## Story obligations

### G1. Preserve mixed timing and ambiguous part facts
Reported: slice 2 — "An explicitly timed first part, untimed second present part, and ambiguous third part cannot be represented by existing inParts + appended withUnbrokenPart without changing gap wording."
Story clause: "preserving the existing independent behavioral proof"
Disposition: proved by slice 2: slice-2-proof.md G1, intent-ci-proof-timing.test.mjs partial timing and dashboard-ci-comparison-entry-gaps.test.mjs partial endpoint independent assertions
