---
id: SEED-258
status: active
planted: 2026-11-07
scope: epic
---

# Dough Intent Coverage

<a id="dough-intent-coverage"></a>

### Assess story intent coverage across projects and during wrap-up

**Identity:** SEED-258#dough-intent-coverage
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-258#dough-intent-coverage","dependencies":[{"supplier":{"identity":"SEED-192#assess-story-intent-protection","href":"seeds/SEED-192-review-product-intent.md#assess-story-intent-protection"},"implementation":"Use the completed Open Dough trial's reports and evaluation to decompose and implement public intent coverage.","rationale":"The trial establishes whether the assessment produces useful decisions at a justified cost and which parts merit reuse before generalizing the workflow.","condition":"The three trial reports and cross-case summary are committed and retained, and Terry's recorded evaluation authorizes proceeding with the public skill follow-up.","state":"waiting","resolution":{"revision":"8f830f448f78c4180303af0c773c0d4332961bb2","path":".planning/seeds/SEED-192-review-product-intent.md#assess-story-intent-protection","summary":"The completed trial reports and Terry's evaluation remain recoverable at b0ad4c799d4b659ed072591e8dc0e66b4caefc2e:docs/intent-coverage-trial/README.md. The trial exposed useful test gaps, missed both calibration journeys, and had no timed ordinary-review baseline. Evidence for routine adoption is inconclusive. The SEED-258 decomposition starts with a short manual comparison; public delivery and automatic wrap-up remain conditional on the results and Terry's decision.\nCondition remains unresolved: The three trial reports and cross-case summary are committed and retained, and Terry's recorded evaluation authorizes proceeding with the public skill follow-up.\nAccepted integration: 786a34629fe59747955497e2d963c5ac5cbf2bfe on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

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

## Story decomposition

<a id="compare-manual-intent-coverage"></a>

### 1. Compare a short manual intent assessment with ordinary review

**Identity:** SEED-258#compare-manual-intent-coverage
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Terry can decide whether an AI-assisted assessment improves
  decisions about protecting story intent at a worthwhile cost.
- **Evaluation.** Agree on the effort budget and criteria before reviewing a
  small shared set of recent completed stories. Compare an independent
  ordinary review with a short manual AI assessment of the same stories and
  revisions. Record verified decisions, consequential misses, unsupported
  claims, and end-to-end effort, including setup, agent and test time, and
  developer reading and verification. An equivalent useful outcome with
  lower total effort can qualify. Terry records whether to proceed, narrow
  the approach, or stop.
- **Boundary.** Use existing project tools and brief, sourced findings. A
  selective break check can verify that the test catches a specific fault or
  expose a gap when the fault reaches the intended path and the test passes.
  If execution evidence is unavailable, record the uncertainty. If a review
  is blinded to later evidence, verify the checkpoint remains readable with
  inherited Git object alternates cleared and a known later object is
  unavailable.
- **Prerequisite.** Existing story and test evidence for the chosen cases.
  The archived trial provides examples and prior findings.
- **Effort and stopping point.** Smallest candidate, with confidence depending
  on access to two independent reviews. The comparison and any useful test
  decisions stand on their own if public delivery is declined.

<a id="invoke-intent-coverage-manually"></a>

### 2. Invoke Dough Intent Coverage manually across test mixes

**Identity:** SEED-258#invoke-intent-coverage-manually
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer can invoke the public `dough-intent-coverage`
  skill for a selected story and receive a sourced account of the promises
  the project's tests protect.
- **Evaluation.** A developer invokes the installed skill in a project with
  browser and unit tests and in a project with a different test stack. The
  assessment uses each project's own test commands and relates end-to-end,
  integration, and unit assertions to the promises they exercise. It
  distinguishes observed results, gaps, and missing evidence. The skill
  returns the assessment as output and the caller decides whether and where
  to save it.
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
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer can close an eligible story and read the
  assessment afterward without a separate invocation.
- **Evaluation.** Wrap-up calls the same assessment before cleaning up the
  story's source records and stores the returned result in the story's
  done-record JSON beside the backlog. A repeat wrap-up leaves one result.
  The existing rolling 30-day cleanup prunes the result with the record.
  Settle eligibility and the handling of incomplete evidence in refinement.
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
- **Prerequisite.** A usable manual skill and evidence from its use that
  justifies the additional wrap-up cost.
- **Effort and stopping point.** Narrower than public delivery, with
  uncertainty around eligibility and recovery. The recent assessment stays
  readable through the existing completion record.

## Ordering and scope reduction

Select the comparison first when this work is revisited. Its findings decide
whether to select the manual skill. Automatic invocation is the first
candidate to defer if the manual skill gives sufficient value. Effort is
comparative and unbanded because Open Dough has no established S/M/L
calibration. The three sections are decomposition candidates.

## Separate test follow-up candidates from the trial

- **First priority.** Give Branch and Landed distinct counts and durations
  in precise CI Summary tests at entry, folder, and file scope. Replay the
  Branch-for-Landed substitution and verify the tests catch it.
- Reach the Recently done **Select story** control through actual Tab
  navigation while retaining the Enter and Space activation checks.
- Exercise maintenance selection with an otherwise eligible hidden project
  and verify the consumer still selects it. The existing save-and-reload
  check establishes the inventory input.

These are test opportunities identified at the trial's trunk recheck.
[Test follow-up rationale][trial-test-candidates].

## When to surface

Surface the first candidate when Terry selects a measured comparison. Review
the later candidates against its outcome and the cost of the manual workflow
before selecting them.

[trial-evidence]: https://github.com/terryyin/open-dough/blob/b0ad4c799d4b659ed072591e8dc0e66b4caefc2e/docs/intent-coverage-trial/README.md
[trial-test-candidates]: https://github.com/terryyin/open-dough/blob/b0ad4c799d4b659ed072591e8dc0e66b4caefc2e/docs/intent-coverage-trial/README.md#test-follow-up-candidates
