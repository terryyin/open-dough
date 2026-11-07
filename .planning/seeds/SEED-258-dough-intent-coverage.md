---
id: SEED-258
status: active
planted: 2026-11-07
scope: story
---

# Dough Intent Coverage

<a id="dough-intent-coverage"></a>

### Assess story intent coverage across projects and during wrap-up

**Identity:** SEED-258#dough-intent-coverage
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-258#dough-intent-coverage","dependencies":[{"supplier":{"identity":"SEED-192#assess-story-intent-protection","href":"seeds/SEED-192-review-product-intent.md#assess-story-intent-protection"},"implementation":"Use the completed Open Dough trial's reports and evaluation to decompose and implement public intent coverage.","rationale":"The trial establishes whether the assessment produces useful decisions at a justified cost and which parts merit reuse before generalizing the workflow.","condition":"The three trial reports and cross-case summary are committed and retained, and Terry's recorded evaluation authorizes proceeding with the public skill follow-up.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary.** A developer who wants to know which promises in a completed
story are protected by its project's maintained tests.

**Outcome.** Open Dough provides a public `dough-intent-coverage` skill that
developers can invoke manually for a selected story. Story Wrap Up also
invokes the same assessment automatically while the story's source and
execution evidence are available. The developer can recover the report
after closure and use it to decide which protections to retain, clarify,
or strengthen.

**Scope to decompose**

- Generalize the method that the
  [Open Dough trial](../../docs/intent-coverage-trial/README.md)
  supports. Resolve the story, delivered implementation, relevant tests,
  and proof commands in the established project. Account for projects that
  use different frameworks and a mix of end-to-end, integration, and unit
  tests. Ground findings in the behavior each test actually asserts and the
  evidence available for it.
- Author the public skill in one shared source for Codex, Cursor, and Claude
  Code. Follow the release and runtime conventions in
  [AGENTS.md](../../AGENTS.md),
  [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md), and
  [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
- Have wrap-up call the same assessment before cleaning up the source records.
  Carry the trial's evidence and developer feedback into the decisions about
  which stories qualify, the report's durable home, repeat invocation, and
  how wrap-up reports incomplete assessment evidence.

**Evaluation examples.** A developer invokes the installed skill manually in
a project with browser tests and unit tests. The report relates both test
levels to the story's promises and names any gap in the available evidence.
In a project using a different test stack, completing an eligible story
triggers the assessment through wrap-up and leaves a report the developer
can read after closure.

**Before proceeding.** Use the committed trial reports and Terry's evaluation
to decide whether the method merits this work. If Terry elects to proceed,
decompose this queued outcome into smaller stories before refinement,
slice planning, or execution. Keep the manual skill, cross-project test
support, and automatic wrap-up invocation in the scope of that decomposition.
