---
id: SEED-182
status: active
planted: 2026-10-30
planted_during: Terry's request to standardize test optimization findings
trigger_when: An optimization pass records remaining candidates or accepts necessary slow-test cost
scope: a standard project record for test optimization candidates and accepted costs
---

# SEED-182: Standardize Test Optimization Candidates

## Why This Matters

For Terry and agents optimizing project tests, findings currently live wherever
an earlier pass happened to leave them: an active plan or a project-specific
timing document. There is no standard record for pending candidates or accepted
slow-test costs. Useful decisions can be hard to find after plans are removed
or another pass starts.

Terry selected one story: establish the standard project record and the
guidance that uses it. This seed queues that outcome; it is not an executable
plan.

## Selected Stories

<a id="standardize-test-optimization-candidates"></a>

### Standardize Test Optimization Candidates under the planning folder

**Identity:** SEED-182#standardize-test-optimization-candidates
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer or agent running test optimization or resolving
its recorded findings in a project.

**Outcome:** Every new or updated optimization pass can find, write, and
interpret its findings in one official project record, including accepted
slow-test costs, without relying on a spent plan or an agent conversation.

**Scope:**

- Standardize `.planning/TEST-OPTIMIZATION-CANDIDATES.md`, headed exactly
  `Test Optimization Candidates`, as the durable home for these findings.
- Define a consistent human-readable format that subsequent agents can
  interpret. Cover pending candidates, accepted necessary costs,
  approved profile-only exclusions, and obligations transferred to a replacement
  story or plan. Preserve the distinction between a proposed change and work
  actually implemented.
- Include the evidence needed to judge a finding: stable reference, test
  locations and scope, observed cost and measurement conditions, unique
  protection, alternatives attempted, disposition and rationale, date, needed
  human decisions, and links to relevant evidence or follow-up work.
- Retain a concise result summary sufficient to review the latest pass:
  command/scope and revision, comparable before/after wall time and case counts
  when available, actual outcome and measurement limits, and evidence links.
  Distinguish measured gain, no demonstrated gain, and incomplete measurement.
  Keep raw profiles outside the record.
- Give an explicit empty convention and handle an absent record consistently.
  Make the optimization, `--resolve`, and wrap-up guidance use this same home
  and format so unresolved findings survive plan cleanup. Creating or updating
  it during an authorized pass must not depend on a pre-existing custom file.
- Keep accepted slow-test cost distinct from an operational profiling exclusion.
  A documented acceptance alone must not silently disable or filter a test;
  normal verification and CI coverage stay intact. Later passes preserve and
  consult the recorded decisions.

**Evaluation:** A new pass writes a pending finding to the standard file;
`--resolve` can record its necessary-cost decision or transfer its obligation
to a replacement plan there; a later pass finds that disposition after the
original plan has been cleaned up. An empty record is unambiguous, and a
consumer can distinguish it from a missing or unreadable record.

**Explicit exclusion (Terry, 2026-10-30):** Do not inspect, rewrite, relocate,
or automatically migrate the existing findings or file structures in maintained
projects as part of this story or its update rollout. Terry will separately ask
agents to perform a one-time migration after updating. No legacy-location
discovery or migration compatibility layer is required by this story.

**Safe stopping point:** The file and guidance are useful on their own. This
story does not implement the recorded optimization candidates or introduce
a new test-runner exclusion mechanism.

## Ordering and Boundaries

Terry requested this as the first queued story and subsequently abandoned the
separate dashboard review story. Leave currently Taken work in place. No
implementation, release, project update, client migration, or execution claim
is authorized by this backlog edit. The exact record syntax belongs to this
story's refinement. Effort bands are unassigned because the project has no
S/M/L calibration. The main uncertainty is keeping the record simple while
reliably readable.

Follow [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
when authoring the shared runtime guidance: address the agent in its established
project and keep one authoritative behavioral source. No ADR exception is
proposed.

## Breadcrumbs

- Terry's 2026-10-30 request in this conversation: standardize the planning
  file and format, exclude automatic migrations, keep only this first story,
  abandon the dashboard review story, and land the result.
- [Current optimization guidance](../../src/skills/dough-test-optimization/SKILL.md).
- [Current candidate resolution](../../src/skills/dough-test-optimization/references/resolving-candidates.md).
- [Existing project-specific findings and accepted costs](../../docs/maintainer/dashboard-test-timings.md#resolved-2026-10-30-resolve).
