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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/503-invoke-intent-coverage-manually/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"404ae6d3290c03c3534ed92d6a022cc6b5e0287e6f8dc47f325ca3b5d8a023da","plan":"56c66b2e319731adde5b2fbe56b26a9ba46313539110bc0a8a141f988c8ef51a"}}
```

**Goal.** A developer can invoke the installed `dough-intent-coverage` skill
for one selected story and use its sourced assessment to decide which test
protections to keep, clarify, or strengthen. The developer can see the cost of
that assessment alongside its findings.

**Scope.**

- Resolve the selected story's recorded promises and the revision being
  assessed. Use this project's maintained tests and its own focused commands.
  Cite the test setup and assertions that support each observed result, and
  describe the boundary of the evidence. Distinguish an evidenced protection,
  an evidenced gap, and missing evidence. Ask for the specific missing story
  input when there is no reliable basis to identify the intended behavior.
- Return the assessment with measured end-to-end wall-clock time including
  setup, runs, and report preparation. Show test runtime separately when
  observed. Give human and agent effort separately when supported. For each
  figure, state the unit and basis and label it measured or estimated. Mark
  unavailable values explicitly. The caller chooses whether and where to save
  the result. [Architectural North Star](../NORTH-STAR.md#intent-assessment-results-carry-their-cost).
- Demonstrate the installed invocation in a project with browser and unit
  tests and in a project with a different test stack. Use one shared source
  for Codex, Cursor, and Claude Code and follow the normal versioned delivery
  path. [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) ·
  [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) ·
  [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
- Use the assessment method supported by the recorded prerequisite once it
  is satisfied. The [pilot result](#pilot-result) supports a targeted break
  check during ordinary review. This story's broader public scope still
  awaits evidence and Terry's decision to proceed.
- Defer automatic invocation, done-record storage, and dashboard rendering to
  [the wrap-up story](#assess-intent-coverage-during-wrap-up). The manual
  assessment addresses the selected story's test protection. Product-wide
  audits, aggregate code coverage, and repairs to the assessed project's
  tests are separate work.

**Key examples.**

- In a project with browser and unit tests, a developer asks about a selected
  story whose browser journey checks a visible outcome and whose unit test
  checks an underlying decision. The assessment cites what each assertion
  observes. If a maintained fixture exercises a consequential combined path
  and its assertion misses the promised result, the assessment explains that
  gap with the setup and assertion evidence.
- In a Python project using pytest, the developer invokes the same skill on a
  selected story. The assessment uses that project's command and distinguishes
  a behavior observed through a component from a claim about a separate entry
  point, such as the CLI. The invocation returns findings and cost evidence
  directly to the caller.
- When a relevant check cannot run, the assessment identifies the missing
  observation and gives the strongest supported verdict. It reports measured
  elapsed time for the attempt and marks unavailable test runtime and effort
  explicitly.

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
