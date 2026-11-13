# Record evidence once per independently observable source promise

**Source:** [refined story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#review-independently-observable-promises)
**Identity:** SEED-010#review-independently-observable-promises

## Goal and scope

Let planned-execution coordinators retain an independent source review that
catches missing proof without separately allocating and observing reasons,
restatements or other context with no independent result. Keep each promise's
conditions, alternatives, justified restrictions and original source traceable.

Change the review/execution guidance at its existing seams, retaining the
current source-review table and obligation CLI. No schema, automatic prose
classifier, bulk-recording API, new lifecycle owner, release or client rollout
is included. Do not weaken evidence sufficiency, isolation, amendment refresh,
execution authority or post-execution completion. Source-only review is still
obtained by execution, not written by this preparation.

## Existing solution and decisions

PFE: `src/skills/dough-execute-plan/references/obtain-source-review.md` owns
the fresh review's input and promise extraction. Its current instruction to
number every list item explains the recorded symptom. `story-obligations.md`
owns retention, allocation and observation, with the existing
`story-obligations.mjs record/list/check` boundary enforcing row ownership and
missing-proof refusals. `delegation.md` and `wrap-up.md` already link those
owners. Change those existing rules rather than adding another ledger or
coordinator-side filter that silently discards the reviewer's ids.

One common rule: a row owes an observable result under its source conditions.
Several clauses describing that same result can share the row and sufficient
observation; distinct results or separately checkable alternatives still owe
proof, even when one command runs their tests. Preserve source text/locations
for attached qualifications. Keep non-promissory context outside the numbered
allocations, and retain a numbered promise when contextual wording also
contains a checkable outcome. Do not reinterpret scope limits as rejection rules.

Relevant Accepted decisions:

- [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md): author Proposed guidance in `src/skills`; do not hand-sync installed copies or fabricate a containing release.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md): keep one behavioral home, direct runtime wording and project-relative context. Apply the [maintainer behavior review](../../../AGENTS.md#behavior-review).
- [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md): representative useful behavior review for this conventional guidance change; no new discovery/integration mechanism or routine per-tool matrix. CLI replay proves record integration, not native agent behavior. Reuse unchanged host integration only for that boundary; do not claim native behavior on an unobserved host.
- [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md): compare bookkeeping against retained reviews, keep useful gap detection, and distinguish delivered guidance from an observed ordinary-use improvement.

The existing `.planning/NORTH-STAR.md` topics govern the dashboard; this change
needs no new architectural direction. No Accepted-ADR conflict was identified.

## Outside-in proof and decisive premises

All preparation observations below were made in this owned checkout at
`ec7ec98a01ec6ed9040dcc019d6bd3f82375b9c1` on 2026-11-13. Scratch production
edits were restored before writing the seed or this plan. No implementation
or candidate guidance replay has been performed by preparation.

| Premise and consuming operation | Observation, result and remaining work |
| --- | --- |
| Small historical replay can recover both source and old allocations | `git show f595336fb608dcfebfaa01685141db1b61fbcaf6:.planning/seeds/SEED-320-conditional-terminal-opening.md` and the same revision's `.planning/slice-plans/597-open-terminal-only-without-a-custom-instruction/source-review.md` recover the full input and 44 rows. Rows 1.4, 3.3, 5.5 and 9.3 repeat reasons or nearby outcomes. Fresh candidate review remains slice work. |
| Compound historical replay can recover source and old allocations | `git show ebaf16f6336d2d9111f95984b907a006b67f3c04:.planning/seeds/SEED-316-mobile-terminal-text-selection.md` and the same revision's `.planning/slice-plans/591-select-and-copy-terminal-text-on-mobile/source-review.md` recover the input and 112 rows, including context U1 and repeated automated-proof limits X5. Fresh candidate review remains slice work. |
| The known pronunciation miss is a source promise, not an inferred product requirement | Read-only `git -C /Users/terryyin/git/doughnut show e9f109c3c25b0355a897161f8a8180fdfb22a1a5:.planning/seeds/SEED-124-save-pronunciations-as-note-properties.md`: UI explicitly requires hiding `て` within `挙げて`; Scope separately refuses a reading as the written answer. [ODF-481](../../../docs/maintainer/findings/ODF-481.md) records the missed proof. Replay the source clauses, not Doughnut's implementation or live notebook. The input is also recoverable from that repository and revision if the local checkout moves. |
| Existing record contract carries qualified source text, refusal and lifecycle ownership without a new schema | `node --test src/skills/dough-execute-plan/scripts/story-obligations-source-review*.test.mjs`: 26/26 passed, 3.67 seconds. Tests drive `record/list/check` with real Markdown and distinguish allocated, unobserved, disposed and lifecycle-pending rows. This proves the unchanged record boundary, not candidate extraction quality. |
| Maintained proof detects loss of the missing-observation gate | Scratch-disabled the `item.observed === undefined && !item.obligation` branch in `story-obligation-source-review.mjs`; `node --test --test-name-pattern 'the allocated slice cannot finish until its commitment is observed' src/skills/dough-execute-plan/scripts/story-obligations-source-review.test.mjs` failed (`true !== false`). Restoring the bytes made that same command pass, 1/1. No remaining scratch diff. |

No cheap current-state premise remains unobserved. A fresh review of changed
guidance is the slice's intended product observation, not a prerequisite for
preparing this plan. No paid, credentialed or developer-operated probe is needed.

| Source promise / example | Owner | Required observation |
| --- | --- | --- |
| One observation covers repeated descriptions of a single qualified result; context adds no independent rows (examples 1, 3, 5) | Slice 1 | Fresh source-only small/compound returns compared with the retained 44/112 rows; identify removed duplication and trace every retained result/condition to source. Include a settled baseline, hypothesis and proof-method explanation as context counterexamples if absent from a replay source. |
| Distinct alternatives, qualified results and genuine restrictions remain provable (examples 2, 4) | Slice 1 | Blank versus typed terminal results stay separately checkable. Pronunciation inside another word and refusing the reading as a written answer remain explicit; standalone-only proof leaves the inside-word result unaccepted. |
| Existing independent review, source provenance and all returned ids remain owned | Slice 1 | Retain fresh launch/input/return evidence; source-only reviewer sees no plan, product or expected answer. Retain every returned id with its attached conditions in the existing table. Review unchanged-source reuse and human-amendment replacement paths. |
| Missing proof blocks acceptance, or has a disposing obligation; post-execution promises retain later owners (example 5) | Slice 1 | CLI replay lists each selected promise, refuses withheld proof, accepts sufficient observed/disposed rows, and reports `landing`, `target CI`, `reporting` rows pending with empty observation cells. Never use a successful check as proof of semantic sufficiency. |
| Delivered response and containing release remain attributable | Slice 1 | Update ODF-481 with the response revision and bounded replay result; mark containing release pending until an actual tag contains it. Release/rollout remains separate work. |

## Ordered slices

### 1. Review and accept independently observable source promises
Type: Behavior
Status: planned
Proof: Fresh small and compound source-only reviews, the pronunciation/alternative
counterexamples, and real obligation CLI replay under the mapping above.

Behavior: Given original story text that repeats a qualified result and also
contains distinct outcomes and explanatory context, when an independent reviewer
extracts the source promises and the coordinator allocates and accepts them,
the same result is recorded once with all its conditions; distinct alternatives,
restrictions and missing proof remain visible and owned.

- Change extraction guidance in `obtain-source-review.md` and align the
  retention/observation instructions in `story-obligations.md` only as needed.
  Preserve timing, isolation and caller links. A reviewer return that still
  fragments non-promissory context is a failed behavior review, not permission
  for the coordinator to delete returned ids.
- Walk invocation, required source context and useful outcome under AGENTS.md.
  Use fresh isolated reviewers as the execution guidance requires, supplying
  only recovered source text, explicit amendments and the candidate brief.
  Inspect their actual inputs/returns. Evaluate each against source privately,
  without feeding expected groupings or proof gaps to the reviewer. Retain
  temporary replay evidence beside this plan for acceptance and retrospective.
- Compare allocation counts and duplicated observation text with historical
  returns, but accept only when every independent result and qualification is
  still traceable and the unnecessary allocations disappear. Model/runtime
  differences limit causal comparison; make no time/token saving claim.
- Put candidate returns through the existing table and CLI in disposable
  replay directories. Withhold the typed-input or inside-word observation to
  demonstrate an unaccepted result, then supply sufficient evidence or a real
  linked gap. Include a separately justified restriction and a lifecycle row.
  Do not run the archived dashboard/Doughnut product journeys: the promise
  here concerns review/acceptance, not those products' current behavior.
- Run focused source-review tests and any affected guidance tests. Change
  prose assertions only where their old expectation conflicts with the story;
  do not add a prose snapshot or an automatic semantic classifier. Before any
  test authoring, use installed `dough-makeme` selection for its exact path;
  `src/skills/**/*.test.mjs` selects MakeMe, no page-object convention. Reuse
  `story-obligations-test-fixtures.mjs` and the shared CLI fixture boundary.
- Trace changed guidance to `delegation.md`, `wrap-up.md`, obligation scripts,
  guidance tests and payload/reference consumers. Record dispositions using
  the installed consumer-trace procedure. Run consumers the effect reaches;
  reuse unchanged record/lifecycle evidence only where its boundary holds.
- Refactor the implicated concept before commit and deliver through the
  execution skill's normal workflow. Record the bounded evaluation and
  response provenance in ODF-481; do not close ordinary-use effectiveness by
  inference or release the payload as part of this slice.

Safe stopping point: coherent candidate guidance, reviewed example outputs and
passing affected checks; no pending row is accepted solely to reduce the count.
One cohesive proof loop owns guidance, representative review, record integration
and cleanup. No independent feature is hidden in a later slice. There is no
supplied numeric slice target or hard limit; do not invent one.

## Local gates, delivery and failure policy

Focused local command:
`node --test src/skills/dough-execute-plan/scripts/story-obligations-source-review*.test.mjs`.
Add directly affected guidance/consumer checks from the trace; a full dashboard
or repository run is not required for this guidance-only change. Hosted checks
remain owned after publication under execution's normal asynchronous CI repair.
Use the project's [failure policy](../../../AGENTS.md#failing-and-flaky-tests)
as written, including repair of failing/flaky and base-attributed failures and
preservation of a separately evidenced active repair owner's files.

For a long local run, start fully awake. The maintained
[macOS sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos)
is `caffeinate -s -i` on AC power; on battery plug in, or keep the lid open
under `caffeinate -i` and inspect the sleep log afterwards. Full runs share
the project's suite admission. Inspect actual host headroom before expensive
proof, and never use sleeps, `test.slow()` or suite/hook timeout overrides.

The expected guidance files are currently 54 and 231 lines; the implicated
source-review guidance test is 109 lines and ODF-481 is 140 lines. None is
already over the 250-line refactor limit. Keep cohesive files within that
limit; if the retention file grows beyond it, move its source-review record
responsibility to one focused reference and update callers and payload checks.
Do not split by arbitrary line counts or duplicate the behavioral rule.

## Current decisions and concern evidence

- Keep one Behavior slice: extraction and acceptance share one promise model
  and one representative replay loop; splitting by guidance/test/record layers
  would leave the useful result unfinished.
- No source-review schema or CLI behavior change is required by current
  evidence. Reconsider only on concrete replay failure within this scope.
- Slice-plan refinement was not needed: the single slice has one bounded
  outcome, mapped proof and settled premises, without interim behavior.
- No remaining slice-specific, cumulative-design, proof-ownership or sizing
  concern was identified. No human decision is needed before Take.

## Learnings

None beyond the preparation observations above.
