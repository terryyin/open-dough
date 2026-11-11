# Slice 3 implementation handoff

Uncommitted implementation only; no commit/push/done/refactor/format/lint.
Checkout `/Users/terryyin/git/open-dough/.worktrees/express-intent-test-reading-through-page-objects`,
branch `codex/express-intent-test-reading-through-page-objects`, story-branch origin/main.
Identity `SEED-300#express-dashboard-test-intent-through-page-objects`, publisher
`dashboard-territory.local-open-dough`, agent `stanly-chan`; accepted base
`298d51c27b626fb99f171bebba279b91e091d06d`, prior suffix base `71d39d5965906dd4dcd28d4d3cd0c1ffcb0a4385`.
Planning/source-review changes are coordinator-owned and preserved.

## Implemented outcome and ownership

- Existing `intentCiStatusPage.ts` owns `ciStatusReading`: state, freshness, checked
  timestamp, checking and gap. `expectCiAnswer` takes the exact expected answer;
  `expectCiScope` owns the exact named heading formerly in story fixtures.
- `expectKeptCiAnswer` reads caller-supplied state, freshness, checking and optional
  timestamp only. It triggers no read, clock change, release or navigation.
  Existing `expectKeptStoryCi` delegates its shared observation to that owner.
- Existing `intentCiProofPage.ts` owns unavailable/checking and labeled unit-line
  reading. All expected reasons, unit values, styles and accessibility descriptions
  stay explicit; `expectProofRows` retains row/cell/line cardinality and order.
- Mixed-unit Summary/file Proof reading uses existing scope/file owners:
  `expectScopeUnitFigures`, `expectScopeTableRows`, `expectFileProofRows`.
  Generic semantic table observation is unchanged; file navigation is now explicit
  in `intent-ci-proof-units.spec.ts`, including each independently expected file row.
- Swept state/checking/unavailable/unit-line selector siblings across status/Proof,
  story visits, homepage activation, history, Summary-kept and mounted comparison.
  Exact state-before-Proof sibling adjacency remains direct in `intent-ci-proof.spec.ts`,
  because that structural relationship is its tested contract. History sample dates
  and evidence-label timestamps retain their own separate owners/boundaries.
- No production changes, test-tier conversion, timeout change or setup responsibility
  moved. Domain setup stays MakeMe. Holds/releases/clocks/HTTP/Git/store facts,
  pointer/keyboard/focus and every original expected value remain scenario-visible.

Owned paths `/tmp/seed300-slice3-owned-paths.json` (31 dashboard files).

## Source commitments and observed boundaries

| Commitments | Setup / observation locations |
| --- | --- |
|14,15,64,65,66,67|`intent-ci-status-freshness.spec.ts` warm case supplies successful then failed CI answers, advances a controlled clock, holds the next answer, expects the old Passed answer and its original timestamp plus Previous retrieval/checking, releases, then expects Failed and fresh status. Its late-answer case keeps branch and held releases/request settlement explicit. `intent-ci-status-kept.spec.ts` retains no-read evidence across time/unrelated branch and verifies a later new-head answer/timestamp. `intent-ci-status-story.spec.ts` retains held failing/running branch transitions. |
|60,61|`expectChecked`, `ciStatusReading`, `expectKeptCiAnswer` and their full freshness/homepage/story cases retain exact timestamps, checking absence/presence, stale qualification and failed-refresh alert. `intent-summary-ci-proof-kept.spec.ts` still compares its exact homepage retrieval text/time with Summary evidence. |
|62|`expectCiScope` receives explicit branch/story names in all former `expectNamed` callers; status-story-gaps retains each independently expected no-branch explanation, no status/link and independent branch-request absence. |
|63|`intent-ci-proof-adapter-reasons.spec.ts` keeps caller reason arrays, unchanged verdict, request counts and remembered attempt outside readers. `intent-ci-proof-units.spec.ts` independently expects labeled homepage units, separate scope unit figures/rows and complete per-file rows with gaps. Grouped-location/accessibility and status-sort keep exact unit-line labels/descriptions and native interactions. |

Setup only supplies published project/branch data and CI/adapter answers; the real
Intent renders and assertions read its UI. Every held release remains outside
observation helpers, in the original causal position. No source commitment known unproved.

## Normal proof

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice3-proof.json npm run test:dashboard -- tests/intent/intent-ci-comparison-mounted-wording.spec.ts tests/intent/intent-ci-comparison-taken.spec.ts tests/intent/intent-ci-proof-accessibility.spec.ts tests/intent/intent-ci-proof-adapter-reasons.spec.ts tests/intent/intent-ci-proof-adapter.spec.ts tests/intent/intent-ci-proof-ancestor.spec.ts tests/intent/intent-ci-proof-grouped-location.spec.ts tests/intent/intent-ci-proof-legacy-results.spec.ts tests/intent/intent-ci-proof-reasons.spec.ts tests/intent/intent-ci-proof-sources.spec.ts tests/intent/intent-ci-proof-units.spec.ts tests/intent/intent-ci-proof.spec.ts tests/intent/intent-ci-status-execution-time.spec.ts tests/intent/intent-ci-status-freshness.spec.ts tests/intent/intent-ci-status-homepage.spec.ts tests/intent/intent-ci-status-kept.spec.ts tests/intent/intent-ci-status-read-boundary.spec.ts tests/intent/intent-ci-status-reads.spec.ts tests/intent/intent-ci-status-side-panel.spec.ts tests/intent/intent-ci-status-sort.spec.ts tests/intent/intent-ci-status-story-gaps.spec.ts tests/intent/intent-ci-status-story.spec.ts tests/intent/intent-ci-status-wall-time.spec.ts tests/intent/intent-ci-status.spec.ts tests/intent/intent-ci-wall-time-history.spec.ts tests/intent/intent-home-activation.spec.ts tests/intent/intent-project-visit-ci.spec.ts tests/intent/intent-summary-ci-proof-kept.spec.ts --workers=1
```

Terminal exit0, selected84 cases across28 specs, all84 expected and all attempts
passed without retry. Runner and strict verdict passed; run
`59a29569-a907-4d8a-9df9-1258000ec2f9`,196.0s. Terminal record
`/tmp/seed300-slice3-proof.json`; exact command also retained in
`/tmp/seed300-slice3-proof-command.txt`.

`npm run typecheck:dashboard` and `git diff --check` passed after all edits.
An initial typecheck caught mechanical unused/stale imports from renaming the
scope observation; those imports were corrected, then typecheck passed.

## Restored scratch discrimination

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice3-scratch-proof.json npm run test:dashboard -- tests/intent/intent-ci-status-freshness.spec.ts --grep 'a warm Intent show returns' --workers=1
```

Temporarily made `expectKeptCiAnswer` read checking text as the expected answer.
Exactly1 warm-held case failed at its caller Passed answer versus actual
`Checking the CI of main…`, after the old answer and held refresh were established.
The terminal scratch exit1 was observed; exact status-reader bytes restored in
`finally` before normal proof. Evidence `/tmp/seed300-slice3-scratch-proof.json`
and `/tmp/seed300-slice3-scratch.log`. Existing semantic-table body and its prior
accepted missing-selector discrimination remain unchanged.

## Consumer trace and reuse

Installed consumer-trace ran from this checkout with `--base HEAD` and terms
`ciStatusReading`, `expectCiAnswer`, `expectCiScope`, `expectKeptCiAnswer`,
`ciProofReading`, `expectScopeUnitFigures`, `expectScopeTableRows`, `expectFileProofRows`,
retired `expectNamed`, and receiving wrapper `expectKeptStoryCi`. Raw record
`/tmp/seed300-slice3-consumer-trace-raw.md`, every located disposition in
`/tmp/seed300-slice3-consumer-trace.md`. The28-spec selection combines the whole
status/Proof family, all changed spec siblings, and the spec importing changed
`mountedComparisonTakenCases.ts`. Other shared-owner importers use unchanged
operations; no new observation reaches their boundary. Pure lexical production,
record and historical references are excluded. Existing slice1/2 proof remains
valid for unchanged comparison, table, scope and other exported operations.

## Source reading and cost

Before: each scenario reconstructed `.intent-ci-state`, status/time/checking
locators, and the unit journey mixed selection with row-reading loops. After:
`expectKeptCiAnswer(panel, {state, freshness, checkedAt, checking})` states the
answer retained while the explicit next read is held; expected facts and the
release/replacement remain adjacent in the scenario. Scope/file navigation is
separate from named complete-row observations. At both `7eab3d6ca` and execution
HEAD the state/checking/unavailable selectors had100 occurrences across23
implicated files; they now have one component owner each (except the intentional
state→Proof adjacency contract). Unit-line selectors also have one owner.
The cost is small procedural observations in existing modules, no framework.

Oversized source decision was settled with coordinator before dependent edits:
freshness263 and homepage255 shorten along the retained-answer/scope reading
seam, preserving every hold/release/clock/request/expectation. Read-only normal
Prettier projection of every changed code file: maximum248 (homepage and story
records); all others below240. No formatting was applied.

## Resource and remaining state

Local Mac16 logical CPUs/48GiB/AC; normal prelaunch load7.99, free40%. One worker
under `caffeinate -s -i`, unchanged default timeouts. Other worktree proof was
known and preserved. Reconsider this bounded choice if workload/contention/failure
changes its basis. No product or architecture decision remains.

No active proof command or code writer remains. No failures/gaps/obligations
remain from implementation. Coordinator still owes freshness, acceptance,
independent refactor, formatting and delivery.

Coordinator acceptance: freshness unchanged at31f14719b; incoming work since4d7a2ff66 is planning/profiles only (SEED307 refinement and SEED311 preparation/Take), no sibling product change. Inspected kept-answer helper/freshness causal sequence and full unit-row/navigation diff; all allocated commitments accepted.

## Independent refactor and publication boundary

`/root/refactor3` returned `## REFACTOR COMPLETE`. Distinct own+table versus
table-only operations retained; `expectScopeRows` delegates identical table/path/rows
to `expectScopeTableRows`. File Proof comment broadened to its existing ordinary
and compared responsibility. Inspected identical arguments and preserved reader.
All84-case and earlier unchanged general-scope proofs reused; no tests repeated.
Whitespace passed, projected maximum248. Complete handoff/consumer dispositions:
`/tmp/seed300-refactor3-handoff.md`, `/tmp/seed300-refactor3-consumer-trace.md`.
Final freshness unchanged pinned31f14719b; same planning-only incoming changes,
no named sibling behavior or accepted proof affected. No unresolved gap.
