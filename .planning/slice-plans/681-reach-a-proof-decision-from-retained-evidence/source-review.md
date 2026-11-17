# Source-only review

Fresh general-purpose reviewer (`53d4be73-953c-4b5e-bf34-8ae70746e1ac`),
launched with no conversation inheritance on 2026-11-17. Its input contained
only the selected story's Goal, Scope, key examples, exclusions, Evaluation
and Baseline text for
SEED-345#reach-a-proof-decision-from-retained-evidence. No plan, return,
product, proof, suspected omission or current-slice scope was supplied. It
read no project files and changed none.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | In `dough-execute-plan` coordinator acceptance—the accept-proof sequence, including its source-review comparison and consumer-trace check—a slice is accepted as soon as required evidence settles the decision, and the coordinator moves straight to the refactor pass without further edge-case deliberation. Acceptance ends once: each source promise, affected consumer and required gate has a decisive observation; the story obligations are recorded; and no expected/actual mismatch remains unresolved. (Goal: “gets each slice accepted as soon as the required evidence settles”; “does not keep deliberating over possible edge cases once proof is sufficient.” Scope: three ending conditions; “moves straight to the refactor pass.” Ex. 1: SEED-348 slice 5 with 104 E2E and 23 frontend green, promises mapped to inspected assertions, consumer trace dispositions, plan names interim → accepts and dispatches refactor without exploring further edge cases. Ex. 4: wonders about an unpromised interaction but can name neither mismatch nor gap → does not investigate during acceptance and accepts.) | slice 1 | observed: wrap-up.md Accept proof exit + refactor-move sentences; acceptance-stopping-rule.test.mjs first test |
| 2 | A real expected/actual mismatch still stops acceptance; the stopping rule never suppresses it. (Goal: “A real mismatch … still stops acceptance.” Ex. 2: inspected assertion differs from the promise—e.g. note saved under the wrong view → coordinator returns the slice with that expected/actual mismatch.) | slice 1 | observed: wrap-up.md retained “Return a concrete expected/actual mismatch”; asserted in acceptance-stopping-rule.test.mjs |
| 3 | Missing proof / an evidence gap still stops acceptance: the coordinator names a specific promise, consumer or gate without a sufficient observation and obtains or returns for that observation before accepting. (Goal: “missing proof still stops acceptance.” Scope: further inspection may name “a specific evidence gap: a promise, consumer or gate without a sufficient observation.” Ex. 3: filtered run selected fewer tests than claimed promises need → names the uncovered promise and obtains or returns for that observation before accepting.) | slice 1 | observed: wrap-up.md further-inspection evidence-gap clause + retained filtered-proof incompleteness paragraph; asserted in acceptance-stopping-rule.test.mjs |
| 4 | Any further inspection after the evidence is decisive must first name either a concrete expected/actual mismatch or a specific evidence gap (promise, consumer or gate without a sufficient observation). (Scope: “Any further inspection must first name….” Evaluation keep criterion: “each inspection after the evidence is decisive names a mismatch or gap.”) | slice 1 | observed: wrap-up.md “Further inspection needs a named…”; asserted in acceptance-stopping-rule.test.mjs |
| 5 | Broad search results that are generic or historical (e.g. retired plans, done records or unrelated text matches) get one supported grouped disposition with its reason, rather than one judgment per match; only relevant consumers are inspected. (Scope: “get one supported grouped disposition rather than one judgment per match.” Ex. 5: hundreds of matches, mostly done records and retired plans → dispose as one group with reason; inspect only relevant consumers.) | slice 1 | observed: executable-proof.md Record the consumer trace grouped excluded sentence; asserted in acceptance-stopping-rule.test.mjs second test |
| 6 | The stopping instruction is edited on this rule’s owner in place, and no competing rule is added elsewhere. (Scope: “Edit this rule’s owner in place and add no competing rule elsewhere.”) | slice 1 | observed: owned edits only in wrap-up.md Accept proof and executable-proof.md Record the consumer trace (plus structure test); no competing rule file |
| 7 | Contrary wording that invites open-ended scrutiny is removed. (Scope: “Remove contrary wording that invites open-ended scrutiny.”) | slice 1 | observed: Accept proof now gates further inspection on a named mismatch or evidence gap; open-ended “Examine a limit…” / unclear-boundary scrutiny removed from that section |
| 8 | Deterministic guidance checks come with the change. (Evaluation: “Deterministic guidance checks come with the change.”) | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/acceptance-stopping-rule.test.mjs; focused set exit 0 with sibling structure tests |

## Unnumbered source context

- Identity: SEED-345#reach-a-proof-decision-from-retained-evidence.
- Reason/benefit: trims coordinator time and context at every slice boundary without weakening proof.
- Refactoring stays deliberately unbounded; the independent refactor pass and its lack of a time bound are unchanged.
- Scope limits / start simple: instructions only—no timer, budget or slice clock change (Terry asked for simple instructions first).
- Unchanged baselines: every required proof row (ODF-314); consumer reach owned by SEED-393 consumer-verification; failure policy; CI-repair diagnosis rounds.
- Outside this delivery: execution retrospectives and story review; retaining output and compact hand-backs (sibling story).
- Evaluation method (not product promises): no paid comparison; judge keep/stop from the next real planned execution’s trace, on any host, against the baseline.
- Baseline: SEED-348#collect-notes-for-story-follow-ups slice 5 (evaluation only).
- Priority and effort: raised near the top at Terry’s 2026-11-17 request; small, medium confidence—one guidance owner and its checks.
