# Grouped-promise record acceptance

2026-11-15; base `04c71683349ce43ddc0afa3b90c91967fa0ddf26`.
Only `story-obligations.md` retention/observation wording changed in this slice.
The extraction rule stays in `obtain-source-review.md`; no CLI/schema/lifecycle
owner, evidence-sufficiency, reuse or amendment authority changed.

## Actual commands and terminal observations

From the execution checkout, run:

```sh
node .agents/skills/dough-execute-plan/scripts/test-entry-rules.mjs --project . --source Distribution/tests/skills/dough-execute-plan/story-obligations-source-review.test.mjs --source Distribution/tests/skills/dough-execute-plan/story-obligations-source-review-lifecycle.test.mjs
node .planning/slice-plans/616-review-independently-observable-promises/replays/acceptance-cli.mjs
PATH="/opt/homebrew/bin:$PATH" npm test -- Distribution/tests/skills/dough-execute-plan/story-obligations-source-review*.test.mjs Distribution/tests/skills/dough-execute-plan/story-obligations-documented-examples.test.mjs Distribution/tests/installation/payload-declaration-links.sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base 04c71683349ce43ddc0afa3b90c91967fa0ddf26 --path Distribution/src/skills/dough-execute-plan/references/story-obligations.md --term 'qualified source text' --term 'source conditions' --term 'story-obligations.md'
```

Selector: `status: resolved`; both sources select `makeMe: true`,
`pageObjects: false`. Read the installed MakeMe convention; replay uses the
existing `reviewed` fixture and its MakeMe-backed slice builder. No maintained
test was edited. The shared `story-obligations-test-cli.mjs` boundary spawns the
real Distribution `record/list/check` CLI, asserts one JSON stdout result,
empty stderr and exit status matching `ok` for every call. Fixtures create
isolated temporary directories and clean them in `finally`.

The final replay exited 0 and printed:
`PASS: all 26 + 39 + 1 returned ids retained; structural refusal, acceptance, semantic-gap and lifecycle assertions passed.`
[Exact terminal JSON](acceptance-terminal.md) retains every call/result;
[replay program](acceptance-cli.mjs) retains literal per-call options and
assertions. The repository runner above exited 0 for the four source-review
files, documented examples and payload links. See [runner output](acceptance-gates.md).
No test timeout, sleep, retry or archived product journey was used.

## Source comparison and observing boundaries

- SMALL26 comes from the actual [small return](small.md), including its shared
  host/journey qualification and unnumbered context. All 26 exact ids and full
  qualified text are compared against actual `list` results after allocation.
  With id 2 unobserved, `check --slice 1` returns `unobserved-commitment` for 2.
  After a fixture-only observation marker, slice and completion checks pass.
  [Final record](acceptance-small-record.md).
- PRONUNCIATION39 comes from the actual [return](pronunciation-return.md),
  including its shared property-entry qualification and unnumbered context.
  All P01–P39 texts and ids are compared against actual `list` results.
  With P11 unobserved, the slice check returns `unobserved-commitment`.
  A deliberately standalone-only marker makes the presence-based check pass,
  while P11 still expressly requires `て` inside `挙げて`: this is a semantic
  proof gap, not accepted product behavior. The replay replaces that marker
  with G11, quoting the actual inside-word source clause, receiving slice 2.
  Slice 1 passes; slice-2 listing carries G11/P11; completion refuses
  `open-obligation`. [Final record](acceptance-pronunciation-record.md).
- [Lifecycle replay](lifecycle.md) retains both fresh isolated launches, exact
  inputs and unmodified returns. The first source additionally promised
  shutdown; its two ids are source-correct independent results, not an
  extraction failure. The second constructed source promises only final
  target CI after landing; its one returned id keeps baseline/hypothesis as
  context. `record --lifecycle 'target CI'` leaves the last cell empty.
  Slice `list` returns no commitments because lifecycle rows belong to no
  slice; it does not return `pendingLifecycle`. Both slice and completion
  `check` report the row in `pendingLifecycle` with qualified text and owner.
  Early `--observed` returns `observed-lifecycle-commitment` without mutation.
  [Final record](acceptance-lifecycle-record.md). No final-CI receipt is claimed.

These are structural integration observations. Fixture markers are not proof
of historical Dashboard or Doughnut behavior, nor semantic evidence sufficiency.
The archived product journeys and live notebook were never exercised.
The source-only extractions themselves are bounded agent behavior observations;
no matched-model, cross-host, time/token saving or ordinary-use claim follows.

## Consumer and unchanged-boundary review

The [complete trace](acceptance-consumers.md) retains every located consumer
with its disposition. Followed source-only review from execute SKILL through
delegation into `obtain-source-review`, then table retention, allocation,
listing and acceptance in wrap-up. The full qualified P11 mismatch demonstrates
why wrap-up's qualification/journey rule remains necessary after grouping.
Followed resplit's acceptance refresh link and refinement planning's execution
ownership: unchanged source reuses its retained review; a human amendment
requires fresh isolated review, replacement and reallocation of every id.
The reviewer still chooses boundaries; the coordinator cannot discard ids.

Source-review script/record consumers and refusal assertions remain unchanged;
focused runner observes them. Documented-example tests execute the existing
record form, and payload links check the existing managed reference path.
Installed copies remain released source and were not hand-synchronized.
Earlier extraction/consumer proof remains valid at its unchanged boundary.

ODF-481 now records first response `8ac10364f82362f3dac2504304a52645ed661456`,
26/44, 43/112 and pronunciation-39 outcomes and these limits. First containing
release and ordinary-use evidence stay pending under existing finding
maintenance. No release, rollout, new lifecycle owner or finding closure.

## Implementation notes

Two scratch harness assumptions were corrected before the passing replay:
multiline returned text must be whitespace-normalized into one Markdown table
cell, and slice listing does not expose `pendingLifecycle`. Neither was a
production failure; production scripts were unchanged. The full original
lifecycle return remains separately retained without normalization.

Slice source ids 6, 8, 15–29: qualified record text/provenance and mixed outcomes
are retained by the guide and replay; unchanged reuse/amendment paths and
reviewer authority are inspected above; every id is retained/allocated in the
existing cells/record; missing proof refuses or receives G11; lifecycle timing
and owner are asserted; response/release/improvement provenance is in ODF-481.
No uncovered slice promise remains except the explicitly pending actual
containing release and ordinary-use observation, owned by finding maintenance.
Active implementation: approximately 14 minutes, excluding reviewer and command
runtime; no new overrun or replanning authority used.
