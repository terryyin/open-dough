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
This supports the targeted technique. Generalizing a public skill needs
further evidence, and automatic wrap-up depends on that skill. The pilot
also identified one test improvement: give the noncausal CI comparison
wording assertion an independent expected result.
[Comparison and decision](https://github.com/terryyin/open-dough/blob/72e0c2f318a4283bff32acd5767a27ecaa576ba8/.planning/slice-plans/498-compare-manual-intent-coverage/comparison.md#delegated-decision)

## Story decomposition

<a id="invoke-intent-coverage-manually"></a>

### 2. Invoke Dough Intent Coverage manually across test mixes

**Identity:** SEED-258#invoke-intent-coverage-manually
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-258#invoke-intent-coverage-manually","dependencies":[{"supplier":{"identity":"SEED-258#compare-manual-intent-coverage","href":"seeds/SEED-258-dough-intent-coverage.md#compare-manual-intent-coverage"},"implementation":"Generalize the assessment method that the measured manual comparison supports.","rationale":"The public skill needs a demonstrated improvement over ordinary review before it is generalized.","condition":"The measured comparison records verified decisions, consequential misses, and total effort, and Terry records a decision to proceed with generalizing the method.","state":"waiting","resolution":{"revision":"72e0c2f318a4283bff32acd5767a27ecaa576ba8","path":".planning/seeds/SEED-258-dough-intent-coverage.md#compare-manual-intent-coverage","summary":"The measured pilot supports one targeted scratch break check on demand during ordinary review. The assessment missed the proofless-then-running Landed defect, and comparable total effort is unavailable. The delegated decision was Narrow. Generalizing a public skill still requires evidence and a decision to proceed. The surviving pilot result links to the pinned comparison.\nCondition remains unresolved: The measured comparison records verified decisions, consequential misses, and total effort, and Terry records a decision to proceed with generalizing the method.\nAccepted integration: 98d9b8512b48ff91f629fb913dd29ba23067ff9e on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer can invoke the public `dough-intent-coverage`
  skill for a selected story and receive a sourced account of the promises
  the project's tests protect, along with the time and effort it took to
  assess them.
- **Evaluation.** A developer invokes the installed skill in a project with
  browser and unit tests and in a project with a different test stack. The
  assessment uses each project's own test commands and relates end-to-end,
  integration, and unit assertions to the promises they exercise. It
  distinguishes observed results, gaps, and missing evidence. The skill
  returns the assessment and its cost evidence as output. The rendered
  assessment shows measured end-to-end wall-clock time, separate test
  runtime, and human and agent effort where there is a basis to report it.
  Show the units and evidence labels for measured and estimated figures and
  identify unavailable values. The caller decides whether and where to save
  the result.
  [Architectural North Star](../NORTH-STAR.md#intent-assessment-results-carry-their-cost).
- **Prerequisite.** A measured pilot that Terry judges worth generalizing.
  Use the supported method and project conventions with one shared source
  for Codex, Cursor, and Claude Code.
  [AGENTS.md](../../AGENTS.md),
  [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md),
  [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
- **Effort and stopping point.** Largest candidate because it needs evidence
  across real test mixes and supported hosts. Manual invocation is useful
  on its own if wrap-up integration is deferred.

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
