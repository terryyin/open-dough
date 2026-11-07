---
id: SEED-258
status: active
planted: 2026-11-07
scope: epic
---

# Dough Intent Coverage

<a id="dough-intent-coverage"></a>

### Assess story intent coverage across projects and during wrap-up

The pilot and the remaining stories grew out of the original intent coverage backlog item.

**Parent outcome.** Developers can decide which promises in a completed
story are protected by its maintained tests and which protections to retain,
clarify, or strengthen. The sequence below tests whether the assessment
earns the cost of making it a public skill and invoking it during wrap-up.

## Why this matters

The Open Dough trial traced three completed stories to their implementation
and maintained tests. All focused baselines passed. Two deliberate production
faults reached the relevant behavior while the original tests stayed green.
One removed a Recently done control from Tab order while the test focused it
programmatically. The other substituted Branch CI figures for Landed figures
while the fixtures gave both runs identical counts and durations. The review
also distinguished saved project membership from proof that downstream
maintenance consumers still select hidden projects.

The independent assessment missed both known calibration journeys: clicking
inside an opened disclosure and opening Review from Intent for a marked story.
It found related weaknesses without exercising the two specific paths. Across
the three cases, assessors spent about 20 minutes in total, plus about two
minutes for the trunk recheck. Coordination, developer review, and a timed
ordinary-review baseline were unmeasured. These results support testing a
shorter comparison and leave routine adoption inconclusive.
[Trial evidence and Terry's evaluation][trial-evidence].

## Alternatives and decision

Ordinary review remains the baseline. Deferring saves assessment effort but
leaves the value of the useful fault probes unanswered. Repeating the full
historical exercise would produce more verdicts while leaving the comparison
cost unanswered. Start with a short manual assessment beside an independent
ordinary review on the same completed stories. Pursue a public skill when
Terry judges that the verified decisions and important misses justify the
total effort. Evaluate automatic wrap-up after developers have used the
manual skill. [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Pilot result

**Narrow.** Use one targeted scratch break check on demand during ordinary
review when an important promise has a plausible failure that an existing
assertion may let through. Start from a passing focused baseline, confirm
that the scratch fault reaches the intended assertion, restore the edit,
and record the cost and scope of the result.

The delegated review found that the broader assessment missed the
proofless-then-running Landed defect. The three break checks showed what
their respective tests catch. Comparable total effort remains unavailable.
The evidence supports the targeted technique. A broader assessment and
automatic wrap-up would need further evidence. The pilot also identified
one test improvement. Give the noncausal CI comparison wording assertion
an independent expected result.
[Comparison and decision](https://github.com/terryyin/open-dough/blob/72e0c2f318a4283bff32acd5767a27ecaa576ba8/.planning/slice-plans/498-compare-manual-intent-coverage/comparison.md#delegated-decision)

## Terry's decision

On 2026-11-08 Terry chose **Narrow** for the public manual skill. Offer one
targeted scratch break check when ordinary review raises a plausible
protection gap for an important promise. The pilot's miss and incomplete
effort comparison limit the decision to this technique. Evaluate automatic
use separately after observing developers use the manual skill.

## Story decomposition

<a id="invoke-intent-coverage-manually"></a>

### 2. Invoke Dough Intent Coverage manually across test mixes

**Identity:** SEED-258#invoke-intent-coverage-manually
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-258#invoke-intent-coverage-manually","dependencies":[{"supplier":{"identity":"SEED-258#compare-manual-intent-coverage","href":"seeds/SEED-258-dough-intent-coverage.md#compare-manual-intent-coverage"},"implementation":"Deliver the supported targeted scratch break check through the public manually invoked skill.","rationale":"The manual skill needs evidence for the on-demand technique it will offer during ordinary review.","condition":"The completed pilot demonstrates one targeted scratch break check with a passing baseline, a fault reaching the intended assertion, and a passing restored run, and Terry approves the Narrow method for the public manual skill.","state":"satisfied","resolution":{"revision":"72e0c2f318a4283bff32acd5767a27ecaa576ba8","path":".planning/seeds/SEED-258-dough-intent-coverage.md#compare-manual-intent-coverage","summary":"The measured pilot supports one targeted scratch break check on demand during ordinary review. The assessment missed the proofless-then-running Landed defect, and comparable total effort is unavailable. The delegated decision was Narrow. Generalizing a public skill still requires evidence and a decision to proceed. The surviving pilot result links to the pinned comparison.\nCondition remains unresolved: The measured comparison records verified decisions, consequential misses, and total effort, and Terry records a decision to proceed with generalizing the method.\nAccepted integration: 98d9b8512b48ff91f629fb913dd29ba23067ff9e on origin/refs/heads/main.\nAgreement correction using 72e0c2f318a4283bff32acd5767a27ecaa576ba8:.planning/seeds/SEED-258-dough-intent-coverage.md#compare-manual-intent-coverage:\nThe retained comparison (Plan 498, comparison.md, Delegated decision) supports one targeted scratch break check. Its Open Dough focused run (assessment-254.md, Focused runs) passed at baseline, failed at the intended Landed assertion after the scratch edit, and passed after restoration. Terry approved Narrow on 2026-11-08 in the current seed's Terry's decision section. That explicit scope choice replaces the broader generalization and comparable-total-effort requirements. The missed proofless-then-running defect and unavailable comparable effort remain limits of the broader pilot. The consumer owns authoring and delivery of the manual skill.\nCondition satisfied: The completed pilot demonstrates one targeted scratch break check with a passing baseline, a fault reaching the intended assertion, and a passing restored run, and Terry approves the Narrow method for the public manual skill.\nAccepted integration: 98d9b8512b48ff91f629fb913dd29ba23067ff9e on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/503-invoke-intent-coverage-manually/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5e5dd752d150d03a6368bf2736338e2cf32a82a439495d6cec6b9cf64bd6ad8a","plan":"4a8cff7704d74af79db936f93b0093fd84a12d63ba34ff0920e9d999893145d8"}}
```

**Goal.** During ordinary review, a developer can invoke the installed
`dough-intent-coverage` skill to find out whether an existing test catches one
plausible fault in an important story promise. The result helps the developer
decide whether to retain or strengthen that specific protection.

**Scope.**

- Identify the selected story, revision, promise, plausible fault, and
  maintained assertion. Ask for the missing story source when the promise
  cannot be established. Use this project's focused test command and an
  isolated scratch checkout of the selected revision.
- Establish a passing baseline, introduce one temporary fault, and check
  whether it reaches the intended assertion. Restore the edit even when the
  run fails, verify restoration, and rerun the focused check. Report whether
  the assertion caught the fault, allowed the observed wrong behavior, or
  yielded insufficient evidence. Cite the fixture, assertion, and run
  observations that support the result. Limit the finding to that promise,
  fault, and observed path.
- Return the result directly to the caller with measured elapsed time from
  invocation through reporting, including setup and runs. Show test runtime
  separately when observed, and human and agent effort separately when
  supported. Give the unit, basis, and measured or estimated label for each
  figure. Mark unavailable values explicitly. The caller owns persistence.
  [Architectural North Star](../NORTH-STAR.md#intent-assessment-results-carry-their-cost).
- Demonstrate the same invocation in a project with browser and unit tests
  and in a project with a different test stack. Use one shared source and
  the normal versioned delivery path. [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) ·
  [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) ·
  [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
- The [wrap-up story](#assess-intent-coverage-during-wrap-up) owns any
  automatic invocation, done-record storage, and dashboard rendering.
  Test repairs and broader assessments are separate work.

**Key examples.**

- In Open Dough, a cancelled landing waiting for later proof must be able
  to pick up a newly available build. A targeted scratch fault freezes the
  waiting answer. The focused browser journey passes at baseline, fails at
  the assertion for the newly available result, and passes after restoration.
  The report credits that browser assertion for this fault and path.
- In Lizard, a C lookup table with distinct designated initializer rows
  should produce no duplicates. The focused pytest case catches a scratch
  fault that stops counting designated fields and their values as data.
  The report credits the duplicate-detector extension path exercised by
  the case and returns its cost evidence.
- If the focused run stays green while independent evidence shows the
  fault changed the behavior under test, report the assertion gap. If
  setup or reach cannot be established, report the missing observation and
  the cost of the attempt. A failing baseline ends the probe before any
  scratch fault is applied.

<a id="assess-intent-coverage-during-wrap-up"></a>

### 3. Find the intent assessment in a recently done story

**Identity:** SEED-258#assess-intent-coverage-during-wrap-up
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-258#assess-intent-coverage-during-wrap-up","dependencies":[{"supplier":{"identity":"SEED-258#invoke-intent-coverage-manually","href":"seeds/SEED-258-dough-intent-coverage.md#invoke-intent-coverage-manually"},"implementation":"Invoke the public manual skill from wrap-up and store the returned result in the done-story record.","rationale":"Wrap-up consumes the same proven assessment that developers can invoke manually.","condition":"The public dough-intent-coverage skill can be invoked manually, returns its assessment as output, and has been demonstrated with different test stacks.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer can close an eligible story and read the
  assessment afterward without a separate invocation.
- **Evaluation.** Wrap-up calls the same assessment before cleaning up the
  story's source records and stores the returned result, including its
  timing and effort evidence, in the story's done-record JSON beside the
  backlog. The rendered assessment for the recently done story shows the
  recorded wall-clock time, separate test runtime, and any reported effort,
  preserving the units, evidence labels, and unavailable values. A repeat
  wrap-up leaves one result. The existing rolling 30-day cleanup prunes the
  result with the record.
  Settle eligibility and the handling of incomplete evidence in refinement.
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
- **Prerequisite.** A usable manual skill and evidence from its use that
  justifies the additional wrap-up cost.
- **Effort and stopping point.** Narrower than public delivery, with
  uncertainty around eligibility and recovery. The recent assessment stays
  readable through the existing completion record.

## Ordering and scope reduction

The manual skill waits for evidence and a decision to generalize. Wrap-up
waits for the manual skill, and its additional cost is evaluated before
execution.

## Separate test follow-up candidates from the trial

- Reach the Recently done **Select story** control through actual Tab
  navigation while retaining the Enter and Space activation checks.
- Exercise maintenance selection with an otherwise eligible hidden project
  and verify the consumer still selects it. The existing save-and-reload
  check establishes the inventory input.

These are test opportunities identified at the trial's trunk recheck.
[Test follow-up rationale][trial-test-candidates].

[trial-evidence]: https://github.com/terryyin/open-dough/blob/b0ad4c799d4b659ed072591e8dc0e66b4caefc2e/docs/intent-coverage-trial/README.md
[trial-test-candidates]: https://github.com/terryyin/open-dough/blob/b0ad4c799d4b659ed072591e8dc0e66b4caefc2e/docs/intent-coverage-trial/README.md#test-follow-up-candidates
