# Preparation context and execution gates

The active [plan](PLAN.md) owns execution; these are its unchanged preparation
findings, execution gates and accepted observations.

## Architecture and PFE

Apply [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002 — whole-product focus and reuse](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
The [ADR index](../../../docs/adrs/README.md) and relevant in-file Accepted
statuses agree; no successor, conflict or exception applies. This local design
belongs with Intent under ADR 0000. The existing
[North Star](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
already establishes shared evidence interpretation and local derivation; no
new architecture topic or aggregate store is needed.

PFE originally at `0d92177ead4aaf8f9364afeddd9d5227d0208e52`, 2026-11-09;
delivered-history contracts reconciled at `0c32a9335` later that day:

- [The delivered project history](../../../docs/dashboard-development-intent-ci-status.md)
  owns retained landing-to-attempt evidence, trunk ordering, distinct-build
  windows, project presentation and local read lifecycle.
  [Delivered scope history](../../../docs/dashboard-development-intent-ci-comparison.md) owns
  retained validated proof, supported entry/path/unit readings, Done endpoint
  selection and entry/folder/file history. The project wall-time owner is now
  delivered at `0c32a9335`: `landedCiCollection.ts`, `landedCiHistoryStore.ts`,
  `landedCiMeasuredBuilds.ts` and `intentCiHistoryRead.ts` keep/read the newest
  20 distinct measured builds and their gaps. Stored builds carry timings and
  identities and retained validated proof summaries. Scope history includes
  proof backfill for already-final wall-time builds. Reuse that delivered
  proof contract when integrating completeness-based averages;
  a wall-time point alone does not establish complete test proof. Preserve
  active owners' uncommitted files. Do not duplicate collection, storage or
  resolution.
- Existing `publishedStoryEndpoints.ts` and `intentCiComparisonResolve.ts`
  distinguish the published Done endpoint from the measured Landed slot.
  Reuse that fact via the history reading context; story identity, completion
  date or measured revision alone is not a replacement endpoint.
- `ciScopeProof.ts`, `ciProofTiming.ts` and `ciScopeComparisonTiming.ts` own
  path aggregation, longest owning entry, complete/partial/not-recorded time,
  entry-only totals, breakdown requirements and measured zero. Reuse these
  meanings. Wall-time proof completeness is different: all declared parts
  present in a validated nonempty summary, even without test durations.
  Do not reject a complete scope for an unrelated entry's gap or invent proof
  of undeclared workflow coverage.
- `ciProofTimeWords.ts` and `storyCiRelativeChange.ts` own wall-time bounds,
  precise scope duration differences and percentage only against a positive
  reference. Reuse formatting and arithmetic; `Baseline` continues to mean
  the existing story endpoint, while the new reference is `Prior-build average`.
- `IntentCiComparisonSummary.tsx`, `IntentScopeProof.tsx` and
  `IntentFileProof.tsx` are the current reading owners. Extend their delivered
  history presentation rather than creating another Intent route. Follow the
  [delivered CI status history](../../../docs/dashboard-development-intent-ci-status.md)
  and `IntentCiHistory.tsx` for dated points/gaps and readable build evidence.
  Add one horizontal reference for the displayed endpoint, not a rolling
  historical curve. The spent plan's mockup is no longer an active input.

One common rule selects prior attempts, projects the requested comparable
measure, records exclusion reasons, and derives the reference. Wall-time and
scope-time eligibility differ for a domain reason; they do not need separate
collectors or unrelated averaging algorithms. Derive each answer afresh from
one retained snapshot rather than persisting a competing aggregate authority.

No start-blocking dependency is recorded. The shared direction and independent
selection/calculation work allow execution to start without completed supplier
implementations. Integration waits for their published owners, with actual
contract reconciliation in the affected slice. Shared files and delivery order
alone are not a supplier prerequisite. If delivered behavior invalidates these
assumptions, reassess the same plan before dependent edits.

## Decisive premises and observed results

Observed in this owned checkout at `0d92177ead4aaf8f9364afeddd9d5227d0208e52`
on 2026-11-09. `npm ci --ignore-scripts` succeeded; no product code was changed.

| Premise / consuming operation | Observation in the consuming form/profile | Result and remainder |
| --- | --- | --- |
| Existing timing and relative-change owners handle measured/zero/unrecorded input and precise scope differences | Shared-MakeMe Node probe below in this checkout, Node v24.21.0 | Complete 1200 ms and zero both measured; untimed entry has present part but no test timing; zero reference gives +1.2 s without relative; 1200→1500 gives +300 ms and +25%. Confirms distinct wall completeness and test timing. No new averaging behavior is claimed. |
| Browser proof route can load the selected existing Intent scenarios | `npm run test:dashboard -- --list dashboard/tests/intent/intent-ci-status-execution-time.spec.ts dashboard/tests/intent/intent-ci-comparison.spec.ts` after local install | Exit 0. Settles runner/spec-import prefix only; actual new comparison journeys remain failing-first execution work. Tests use isolated FakeGitHub/local store, not production data. |
| History and Done-source work can be consumed without duplicating owners | Initial preparation read plans 550/551/554; amendment at `0c32a9335` read maintained Intent CI status/story docs and delivered collector/store/window/local reader | Project wall-time history is delivered with 20 measured builds total, gaps and shared-build references, but no stored proof summary. Plan 554 supplies validated proof retention/backfill and scoped readings; averages must not infer completeness from a wall-time point. Independent calculation can still start; reconcile proof extension before integration. This contract observation claims no new behavior proof. |

```sh
node --input-type=module <<'NODE'
import { makeMe } from './tests/support/makeMe.mjs';
import { entryTimingOf } from './dashboard/src/ciProofTiming.ts';
import { timeChangeOf } from './dashboard/src/storyCiRelativeChange.ts';
import { executionTimeDifferenceWords, relativePercentWords } from './dashboard/src/ciProofTimeWords.ts';
const complete = makeMe.aCiProofEntry.at('tests').counting(2).timed(1200).please();
const zero = makeMe.aCiProofEntry.at('tests').counting(2).timed(0).please();
const noTiming = makeMe.aCiProofEntry.at('tests').counting(2).please();
const positive = timeChangeOf(1200,1500,executionTimeDifferenceWords);
console.log(JSON.stringify({complete:entryTimingOf(complete),zero:entryTimingOf(zero),noTiming:entryTimingOf(noTiming),noTimingPartStatus:noTiming.parts[0].status,zeroBaseline:timeChangeOf(0,1200,executionTimeDifferenceWords),positive,percent:relativePercentWords(positive.relative)}));
NODE
```

## Verification and delivery gates

Use the installed execution workflow for source review, independent post-change
refactoring, consumer trace, focused proof, agent commits and applicable final CI
repair. New behavior must fail its proof when disabled. Inspect enclosing text,
roles/counts, selectors, shared fixture/provider contracts and authenticated
read consumers as changes become concrete; choose affected suites from that
trace instead of weakening existing comparisons. Update maintained Intent timing
documentation with the shipped rule, scope and limitations.

Local gate: each new capability's focused journey/contracts and affected existing
history/comparison/timing consumers, `npm run typecheck:dashboard`, and applicable
lint/format hooks. Start long runs fully awake. On AC wrap them in
`caffeinate -s -i`; on battery plug in or use `caffeinate -i` with lid open and
inspect the sleep log, per
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Use Homebrew Bash 5 first on PATH for shell checks. Inspect host load/memory,
competing work and expected cost before expensive proof, sequence owned heavy
work or reduce workers while preserving coverage. Full suites are not routine
local gates for this bounded change; published CI failures remain owned.

Starting preservation commands, supplemented with new capability-named specs
and actual supplier-history consumer tests once published:

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/intent-ci-proof-timing.test.mjs tests/support/intent-scope-proof.test.mjs tests/support/intent-scope-comparison-wording.test.mjs
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison.spec.ts tests/intent/intent-ci-comparison-relative.spec.ts tests/intent/intent-summary-story-comparison.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts --workers=1
npm run typecheck:dashboard
```

[The project's failing and flaky test policy applies as written](../../../AGENTS.md#failing-and-flaky-tests),
including failures on base, published CI ownership, preserving another active
repair owner's uncommitted files, and the exact scope of human exceptions.
Never rerun until green as a fix. Use observable events or controlled clocks,
never sleeps or `test.slow()`. Keep default timeouts; an essential override
belongs inside its individual test only.

Three Behavior slices each close one reading journey using the common rule;
there is no speculative Structure slice or separate testing slice. No numeric
slice target or hard limit is supplied; size by these bounded proof loops and
reassess at the first failed integration assumption rather than accumulating
special cases. Preserve safe states and follow the execution escalation rules.

## Slice 1 acceptance

Slice 1 semantic proof accepted 2026-11-10; delivery remains pending independent
refactoring. Original setup → expected reference → actual assertions are mapped
per id in source-review.md, with exact commands/setup/observations and causal
failure repairs in /tmp/seed285-slice1-return.md. Accepted: 12 reference/date
contracts, retained proof/order/scope contracts, 25 chart observations (24 reused
plus repaired provenance), 37 supplier observations (34 reused plus 3 precise
matcher repairs), 19 enclosing observations (12 reused plus all 7 repaired
journeys), isolated restart/local-only/phone/keyboard/provenance, and final
TypeScript check. Broad failed runs retain their verdicts; every failed case has
causal correction and current passing proof. No observation remains deferred.
Freshness unchanged at trunk 6894595d; no incoming named-sibling product effect.
The source-only review is unchanged; this accepts proof without renewing Ready.


Independent refactor accepted: common rule solely owns ordering; prepared-reading
fixture name and used canonical builder are coherent. Twelve contracts, real
local-order API and both relative journeys, typecheck and whitespace passed.
Correspondence/trace: `/tmp/seed285-refactor1-return.md`; unchanged proof reused.

Typing/fixture lint repair accepted after guarded formatting refusal, before any
commit or push. Explicit measured-value/median/ISO/fixture guards preserve facts;
12 contracts and typecheck passed; browser observations reused. See refactor
report addendum and `/tmp/seed285-refactor1-typing-consumer-trace.md`.

## Incoming integration evidence

Trunk `f1a992a7` publishes a test-only collector-quiescence repair in
`landed-ci-history-gaps.spec.ts`: stop collection before asserting provider-free
scope reads. Preserve that repair and this branch's additive reference-answer
expectations during eventual history-preserving trunk integration. No Intent
reference/domain behavior changed; current product proof remains applicable.

## Delivered-history amendment — 2026-11-09

Terry's follow-up reconciles this plan with the delivered 20-build store and
plan 554's proof-retention responsibility. Retain all three Behavior slices,
their existing proof maps and calibration. No larger window, slice replacement,
sizing exception, resplit or execution is introduced. Reassess against the
actual published proof extension before dependent integration.

## Slice 2 acceptance

Slice 2 semantic proof accepted; exact-source input and independent-lifecycle
corrections G2/G3/G4 are proved below. Commands/setup/actual assertions and trace
are retained in /tmp/seed285-slice2-return.md; main lifecycle passed at default
30s in 12.688s, retry0. Fifteen affected observations, nine contract files and
final typecheck passed. Source freshness unchanged at trunk f1a992a7.
Independent refactor accepted: one shared endpoint-history lifecycle; six focused
reader journeys, typecheck and whitespace passed. Exact correspondence/commands
are in `/tmp/seed285-refactor2-return.md`; guarded delivery remains pending.
