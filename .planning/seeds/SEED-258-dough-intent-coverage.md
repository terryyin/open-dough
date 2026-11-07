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
{"schemaVersion":1,"identity":"SEED-258#dough-intent-coverage","dependencies":[{"supplier":{"identity":"SEED-192#assess-story-intent-protection","href":"seeds/SEED-192-review-product-intent.md#assess-story-intent-protection"},"implementation":"Use the completed Open Dough trial's reports and evaluation to decompose and implement public intent coverage.","rationale":"The trial establishes whether the assessment produces useful decisions at a justified cost and which parts merit reuse before generalizing the workflow.","condition":"The three trial reports and cross-case summary are committed and retained, and Terry's recorded evaluation authorizes proceeding with the public skill follow-up.","state":"waiting","resolution":{"revision":"8f830f448f78c4180303af0c773c0d4332961bb2","path":".planning/seeds/SEED-192-review-product-intent.md#assess-story-intent-protection","summary":"The three reports and summary are retained at docs/intent-coverage-trial/README.md. Terry's evaluation found useful test gaps and inconclusive evidence for routine adoption. He explicitly kept SEED-258 waiting. If the method is revisited, compare a short manual pilot with ordinary review on the same stories before reconsidering public delivery.\nCondition remains unresolved: The three trial reports and cross-case summary are committed and retained, and Terry's recorded evaluation authorizes proceeding with the public skill follow-up.\nAccepted integration: 786a34629fe59747955497e2d963c5ac5cbf2bfe on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary.** A developer who wants to know which promises in a completed
story are protected by its project's maintained tests.

**Outcome.** Open Dough provides a public `dough-intent-coverage` skill that
developers can invoke manually for a selected story. Story Wrap Up also
invokes the same assessment automatically while the story's source and
execution evidence are available. The developer can read the assessment in
the skill's output or, after wrap-up, in the story's recent done record, and
use it to decide which protections to retain, clarify, or strengthen.

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
- Return the assessment as the skill's output. The caller decides whether
  and where to persist it.
- Have wrap-up call the same assessment before cleaning up the source records
  and store the result in the story's JSON done record beside the backlog
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)).
  The result is pruned with that record under the existing rolling 30-day
  retention policy. Carry the trial's evidence and developer feedback into
  the decisions about which stories qualify, repeat invocation, and how
  wrap-up reports incomplete assessment evidence.

**Evaluation examples.** A developer invokes the installed skill manually in
a project with browser tests and unit tests. The skill returns an assessment
that relates both test levels to the story's promises and names any gap in the
available evidence. In a project using a different test stack, wrap-up runs
the same assessment for an eligible story and records the result in its
done-story JSON. When the rolling cleanup prunes that record, the result is
pruned with it.

**Before proceeding.** Use the committed trial reports and Terry's evaluation
to decide whether the method merits this work. If Terry elects to proceed,
decompose this queued outcome into smaller stories before refinement,
slice planning, or execution. Keep the manual skill, cross-project test
support, and automatic wrap-up invocation in the scope of that decomposition.
