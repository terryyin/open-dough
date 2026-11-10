# Show no count difference across a missing or ambiguous part

**Identity:** SEED-281#no-count-difference-across-gaps

**Source:** [Refined story](../../seeds/SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#no-count-difference-across-gaps)

**Source review:** [Source-only commitments](source-review.md)

## Goal and scope

Developers comparing builds in Intent can read observed counts without a lost or conflicting shard masquerading as a change in tests. Keep each endpoint's
observed totals, units and missing/ambiguous parts; compare a declared unit
only when its parts are complete at both endpoints. This applies to signed
differences, equality wording and count cues, including overall Counts and
entry, folder, file and outside rows. An unobserved scope under an incomplete
unit is a gap, not evidence that tests were added or removed.

Baseline → Branch and Baseline → Landed are separate comparisons. Other
complete units remain comparable. One partial contributing entry makes its
unit's overall count incomplete; do not substitute a complete-entry subtotal.
Missing durations do not make complete counts incomplete.

Preserve existing unit matching, legacy results, measured zero versus
unreported, complete-evidence added/removed behavior, timing, build selection,
sorting by observed counts and agreed-cue semantics. No layout, collection,
provider, persistence or refresh redesign; no matching-shard comparison or
attribution of observed change to the story.

## Direction and existing solutions

PFE: `ciScopeComparisonUnits.ts` already interprets each endpoint's evidence
per unit for every scope. Extend this count interpretation and its consumers
in `ciScopeComparisonCounts.ts`, `ciScopeComparisonCountsCell.ts` and
`ciScopeComparisonCues.ts`. `storyCiComparisonCountsWords.ts` currently
reduces evidence to numeric totals too early; keep the completeness needed
by its wording and cue through aggregation. Derive both from one coherent
rule rather than adding a presentation guard to each view.

`ciProofTiming.ts` already distinguishes observed figures from a supported
comparison and supplies missing/ambiguous part wording. Reuse that distinction
and suitable parts-gap interpretation. Do not gate counts on measured timing:
timing also depends on recorded durations and breakdowns. Extend only the
existing representations needed for this outcome; no separate completeness
store or framework.

This follows [One Intent workspace with landed CI evidence](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence),
[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
(missing/conflicting evidence differs from an explicit negative result), and
[ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
(required restrictions need a product reason). Unsupported count-change
claims are withheld for correctness; another unit's completeness is not a
reason to withhold a valid comparison. ADR index and relevant record statuses
agree; no conflict or exception is needed. This intent-specific design belongs
here and in maintained product documentation under
[ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md).

### Alternatives, challenge and clarification

Selected: gate each unit and endpoint pair on its own parts. Gap labels alone
leave misleading claims; suppressing every unit hides supported comparisons.
Matching-shard subsets remain deferred. The reconciliation analogy explains
withholding a change while retaining observations; it proves neither a fixed
test population nor causation. Cover equality and false added/removed claims,
with explanatory endpoint gaps on the existing comparison → Summary → Proof path.

## Outside-in proof ownership

All promises below belong to slice 1. Add discriminating regression cases
before changing behavior; the current partial-count output must fail them.

| Promise | Observable proof |
| --- | --- |
| Missing or ambiguous parts at either endpoint keep totals and gaps, without signed/equality claims or count cues | Extend `tests/support/intent-scope-comparison-unit-gaps.test.mjs` and `intent-scope-comparison-cues.test.mjs` through `scopeComparisonRowsOf`; cover entry, folder and file, including equal totals |
| Baseline → Branch and Baseline → Landed are independent; complete other units and untimed complete counts still compare | Regression cases through the same row boundary and `intent-scope-comparison-wording.test.mjs`, with complete and partial endpoints together |
| A scope hidden by an incomplete unit is a gap, never inferred added/removed; outside figures keep the same rule | Row cases in `intent-scope-comparison-unit-gaps.test.mjs` through `scopeComparisonRowsOf` and `outsideComparisonRowsOf`; include reverse endpoints and complete-evidence absence controls |
| Overall words and cue keep observed totals/gaps and withhold the whole affected unit's difference, preserving complete units | Extend `tests/support/intent-ci-comparison-overall-counts.test.mjs` through `overallCountsWords` and `overallCountsCue`, including partial and complete entries in the same unit |
| The rule reaches the rendered overall Counts, entry rows, Summary, file Proof and tree count cues, including accessible comparison evidence | Add bounded journeys in `dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts`: one overall/entry journey and one drill-down/tree journey; use existing page expectations and assert text, gap explanation and cue state independently |
| Complete comparisons, legacy/unreported/zero distinctions, timing and observed-count sorting remain valid | Existing affected Node suites and Intent browser suite, including `intent-ci-comparison-units.spec.ts` and comparison-sort journeys |

Test domain data uses the shared `makeMe.aCiProofEntry` and
`makeMe.aCiProofEvidence` builders (`missingPart`, `inParts`, `brokenDown`),
with the decisive facts at the call site and independent expectations outside
the builder. Verify the browser fixture's served evidence actually retains
those facts; a missing part served as present zero cannot prove this story.

## Slices

### 1. Compare counts only when the unit's evidence supports the claim

Type: Behavior
Status: done
Proof: every row of the outside-in proof table, through the focused Node
checks and the Intent browser consumer boundary below.

Behavior: a developer opens a story's CI comparison whose test cases have a
missing or ambiguous part at Baseline or a later build, while its test files
are complete. Counts retains observations and endpoint gaps, with no case
difference, equality claim or cue; test files retain their supported change.
The same rule holds on drilling into a location, folder, file or outside row,
for a scope absent from a present shard, and for the overall unit total. A
complete Baseline/Landed pair remains comparable beside a partial Branch, and
vice versa. Complete counts still compare without timings.

Keep classification, aggregation, rendering consumers, regression proof and
local cleanup together. One slice owns this one evidence rule end to end;
splitting rows from overall Counts would temporarily give contradictory
count-change claims for the same evidence. No preparatory Structure slice is
needed. After edits, apply the installed post-change refactoring workflow,
then run proof. Update the maintained comparison semantics in
`docs/dashboard-development-intent-ci-comparison.md` with the proven rule.

## Consumer trace and verification gates

The count interpretation feeds `ciScopeComparison.ts`, the overall comparison,
`IntentCiComparison.tsx`, Summary and file Proof, and
`intentTreeComparison.ts` / agreed tree cues. Counts text also enters tree
accessible names; totals drive observed-count sorting. Trace changes through
these enclosing observations, not only direct imports. At execution, run the
installed consumer-trace script against the actual diff, adding terms for
`no change`, `removed`, `added`, `countsCellText`, `overallCountsWords`,
`publishUnitsComparison` and affected page helpers as needed; give every
located consumer a run/reused/excluded disposition.

Focused Node gate (include any newly added test file):

```sh
bash scripts/test.sh \
  tests/support/intent-scope-comparison-unit-gaps.test.mjs \
  tests/support/intent-scope-comparison-units.test.mjs \
  tests/support/intent-scope-comparison-wording.test.mjs \
  tests/support/intent-scope-comparison-cues.test.mjs \
  tests/support/intent-ci-comparison-overall-counts.test.mjs \
  tests/support/dashboard-ci-comparison-entries.test.mjs \
  tests/support/intent-ci-comparison-sort.test.mjs
```

Run `npm run typecheck:dashboard` and `npm run lint`. Before delivery, run
`npm run test:dashboard -- tests/intent` as one coordinator-owned background
run. This broader local gate is selected because the changed count model and
wording reach the entire Intent comparison, tree and drill-down surfaces,
including aggregate and accessible-name observations. It is not a requirement
to run every repository or dashboard test. Select an economical worker count
after checking current host load and competing work under the installed
executable-proof guidance; keep all selected coverage. Resolve prerequisites
through [native setup](../../../tests/native-setup.md), keeping the selected
Node version and newer Bash on PATH.

Local gate: start fully awake; on AC guard long runs with `caffeinate -s -i`;
on battery use `caffeinate -i` with the lid open and read the sleep log, under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Follow [AGENTS.md test automation](../../../AGENTS.md#test-automation) and
carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written, by this link or verbatim, into every delegation and repair
handoff. A failing or flaky check remains a defect; an earlier origin does not
exclude repair. Preserve an exact active repair owner's files and report that
owner and the remaining gate rather than duplicating the repair.

## Decisive premises

Observed in this owned preparation checkout on 2026-11-10 at
`7dc1d895619d362ca9e447d326936ba829bd70c8`. The read-only MakeMe probe is
`/tmp/seed-281-count-gaps-observation.mjs`; literal command:
`node /tmp/seed-281-count-gaps-observation.mjs`. Output is retained at
`/tmp/seed-281-count-gaps-observation.out`. It imports the actual TypeScript
comparison modules under the selected Node 24.21.0, arranges summaries with
MakeMe, and calls their public consuming operations; it does not edit product
files or assert that future regressions already exist.

| Premise / consuming operation | Input and observed result | Remainder |
| --- | --- | --- |
| Parts completeness is lost from row count comparison | `scopeComparisonRowsOf` at `t`, `t/f`, `t/f/a.ts`: Baseline 1,000 cases with missing or ambiguous part 2, Landed 1,090 complete → `1,000 → 1,090 test cases (+90)` and more-light cue. Complete files 1 → 2 still compare. | Slice 1 adds failing regressions and carries completeness through the count model |
| Eligibility must be pairwise and include equality | Complete Baseline 1,000, partial Branch 1,090, complete Landed 1,120 → both differences; reversing partial Branch/Landed likewise compares both. Equal partial 1,000 → `no change`. | Slice 1 keeps only supported pairs and no partial equality claim |
| Missing scope is currently mistaken for absence | Baseline file `t/f/a.ts`; Landed has only `t/other.ts` in its present shard plus missing part 2 → folder and file read `1,000 → removed`, while the row retains the missing-part gap. | Slice 1 must preserve uncertainty instead of inferring absence, in both directions |
| Outside rows use the same unsupported rule | `outsideComparisonRowsOf`: ghost-file cases 5 → partial 7 → `(+2)` and count cue. | Same slice and shared classification |
| Overall aggregation also loses completeness | `overallCountsWords` / `overallCountsCue` with partial Baseline 1,000 and complete Landed 1,090 → `(+90)` and count cue. | Slice 1 adds a mixed-entry regression so dropping incomplete entries cannot falsely pass |
| Timing availability is not count completeness | Complete untimed case parts 1,000 → 1,090 → `(+90)` and more-light cue, while timing says `No timings`. | Preserve this independently observed behavior |
| The current browser helper alters the decisive input | `node /tmp/seed-281-served-gaps-observation.mjs`, same checkout/date/Node: pass MakeMe evidence with 5 cases at `t/a.ts` and missing part 2 through `entryProofs` → served summary has parts `[present 5, present 0]` and no files. | Slice 1 must reuse or complete the shared serving correction and verify the served shape before accepting browser proof |

These observations settle the symptom and domain-model premise. Future proof
is new discriminating regression work, not a claim that an existing test
catches the defect. Browser evidence serving is an observed implementation
gap, addressed at its existing owner boundary below; no readiness claim relies
on the current helper faithfully serving missing parts.

## Coordination and current decisions

- Execution: established Story Branch Mode, workspace/branch as supplied in
  this session; agent `mrsn-chan`, publisher `dashboard-territory.local-open-dough`.
  Accepted claim `abb44e0faa1d6957d36c60e6634f0af87f355603` on `origin/main`;
  starting revision `914ea96e2653de11c86c1f7f329dfe76191afb78`. No second start.
  Existing in-scope replanning authority retained; no numeric slice budget supplied.
- Setup: Node 24.21.0, locked npm/browser acquisition passed; native `check`
  passed (Chromium 153.0.8010.12). Use `PATH=/opt/homebrew/bin:$PATH` for Bash5.
  `npm run format` is selective; pre-commit checks staged lint and typecheck.
- Observer: GitHub `terryyin/open-dough`, verified `ci.yml` / `CI`, target the
  execution branch, coordinator `mrsn-chan-count-gaps`; `/tmp/dough-ci-501/watch-Rddl4s`,
  PID 78731, session 95721, cell `g804:3`. Earlier trunk claim CI is unobserved.
- Sibling 557 remains at claim `f75a5e64d` with active uncommitted gap-retention
  changes and Intent proof; fixture-serving slice 3 has not started. Preserve
  that checkout and settle accepted sibling changes before dependent delivery.

- [Keep each unit's gaps and name visible](../../seeds/SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#keep-unit-gaps-and-names-visible)
  / [plan 557](../557-keep-unit-gaps-and-names-visible/PLAN.md) already owns
  below-entry unit-gap retention and faithful multipart/gap proof serving in
  `storyCiComparisonEntrySummaries.ts`. At execution, inspect its published
  result and actual active execution before overlapping edits; a Taken profile
  alone does not prove a repair is running. Reuse a published correction. If an
  exact active execution owns the necessary gap-retention or helper correction,
  preserve its files and coordinate that overlap while continuing independent
  count classification and aggregation. Otherwise slice 1 owns the necessary
  changes in those existing shared responsibilities as part of this outcome
  and its proof; do not leave required work waiting on an assumed owner or add
  competing representations. Shared paths alone create no blocking story
  dependency, and the count work can start independently.
- If the browser fixture still changes arranged gaps into present zero, the
  browser proof remains outstanding until slice 1 reuses or completes that
  shared correction and a served-evidence check verifies the input. Never
  accept green browser assertions on a different evidence shape.

## Plan concern assessment

One Behavior slice owns the comparison rule, aggregation and observing surfaces
in the existing per-unit model. Known serving/retention gaps remain slice-1
obligations; establish the arranged evidence and complete proof before delivery.

## Story obligations

### G1. Hidden scope still reads removed
Reported: slice 1 — "The new hidden-scope regression fails at intent-scope-comparison-count-gaps.test.mjs:103 with 1,000 → removed. Active sibling plan 557 owns ciScopeProof.ts / ciScopeComparisonUnits.ts gap retention; preserve its uncommitted work and reuse its publication before renewed proof."
Story clause: "A scope not observed under an incomplete unit is a gap, not evidence of added or removed tests."
Disposition: proved by slice 1: tests/support/intent-scope-comparison-unobserved-counts.test.mjs hidden/all-missing/outside assertions and consuming sorting; see source-review.md for inspected paths and terminal 16-file proof.

### G2. Test evidence preparation remains incomplete
Reported: slice 1 — "New Node suites use raw comparison-summary wrappers pending sibling 557's active canonical aComparisonEndpointProof builder. entryProofs still turns missing fragments into present zeroes and loses multipart breakdown; faithful serving and its served-shape check remain required."
Story clause: "Keep the observed count totals, their unit, and each endpoint's missing or ambiguous part visible."
Disposition: proved by slice 1: canonical MakeMe envelopes plus story-ci-comparison-entry-summaries.test.mjs actual producer equality across all endpoints; see source-review.md for red/green and terminal proof.

### G3. Integrated count observations remain unaccepted
Reported: slice 1 — "Two browser journeys are authored in intent-ci-comparison-count-gaps.spec.ts but unrun. Summary, Proof, tree/accessibility and overall/entry integration plus the broad Intent gate remain open; consumer trace lists them open rather than excluded. Coordinator continuation: both new journeys passed, but the first full 386-case gate timed out at the final request wait in intent-ci-comparison-drilldown-relative.spec.ts:43. Preserve that failed verdict and diagnose before repeating; source-review.md retains its evidence."
Story clause: "Apply the rule to entry, folder, file and outside rows, the tree's count cues, and overall Counts."
Disposition: proved by slice 1: Counts, Summary, file Proof, tree/accessibility and existing comparison observations passed in the complete 386-case run (385 passed, one unrelated freshness-test race). Whole repaired freshness/story/history files passed 7/7; unchanged observations reused, failed verdicts retained. See verification.md.

### G4. Independent refactoring and final gates remain open
Reported: slice 1 — "ciScopeComparisonCountsCell.ts is 253 lines; extract cohesive endpoint wording/selection helpers preserving countsCellText. Coordinator refactor, formatting and lint remain outstanding; no slice done mark, commit or publication occurred. Proof and recovery details are retained beside this plan in source-review.md."
Story clause: "Keep this one rule across views"
Disposition: proved by slice 1: independent refactor passes completed all count and gate-repair seams; all owned files at most 250 lines, focused Node proof, 8/8 Board paging, full Intent observations and final 7/7 repairs accepted. Lint, formatting, typecheck and whitespace passed; see verification.md.
