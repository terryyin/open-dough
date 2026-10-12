---
id: SEED-132
status: active
planted: 2026-10-12
planted_during: Authorized retrospective-findings runbook maintenance
trigger_when: Prevent reported story failures and missed consumers from passing slice acceptance
scope: medium
---

# SEED-132: Acceptance follows reachable behavior

## Why This Matters

Developers need an accepted slice to preserve the story's promises along the
paths its guidance and changed behavior actually reach. Recent executions
accepted explicit limitations as costless without tracing those paths, or
selected proof that missed consumers despite the released consumer-coverage
response. Both problems produced later corrections; their identities and
execution evidence remain in the finding catalog.

These two responses improve confidence in parallel story delivery. They do
not change the product direction or implement the client products' repairs.

## Stories

<a id="accept-indirect-consumer-proof-natively"></a>

### 3. Accept indirect consumer discovery and proof judgment natively

**Identity:** SEED-132#accept-indirect-consumer-proof-natively
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/306-native-indirect-consumer-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9b300e0102c2d9b3ffe921dd5d9ae62f5f60c6fdeac2f41bd57f0743c6048683","plan":"c54df633099f174e40a81d7c26ff93a7ff5d80771b0bad068dc21e51333325da"}}
```
**Covered work:** [The consumer-proof story](https://github.com/terryyin/open-dough/blob/cfdca05274dc9845b7f9666e35a0ad68ce6ec73b/.planning/seeds/SEED-132-acceptance-follows-reachable-behavior.md#prove-indirect-consumers-before-acceptance)
and [plan 304](https://github.com/terryyin/open-dough/blob/cfdca05274dc9845b7f9666e35a0ad68ce6ec73b/.planning/slice-plans/304-prove-indirect-consumers/PLAN.md), affecting
`executable-proof.md`, implementation delegation and slice proof acceptance.

**Goal:** A developer releasing Open Dough can judge indirect-consumer discovery
and proof acceptance from observed native use, reducing preventable later CI
repairs. Native implementation and acceptance discover consumers from the changed
effect and obtain sufficient observations, or leave dependent work unaccepted,
while reusing proof for unrelated boundaries.

**Scope:** Assess the implemented shared consumer-selection rule and its delegation
and acceptance callers in isolated projects using candidate-installed guidance.
Include representative fixture reconstruction, bounded native invocation, reliable
observation and immediate judgment where needed for this acceptance. Existing
runner, host adapters and retention mechanisms remain the starting point.

Preserve aggregate-assertion purpose, no-store caller preconditions, proportional
proof selection, equivalent-purpose reuse, the changed-surface-suite rule and the
project's failure policy. A named green selection, self-report or later CI cannot
justify accepting an affected unobserved boundary. No automatic consumer graph,
universal full-suite mandate, new acceptance schema, historical application repair,
release, or restart of ODF-150's failed watch is promised. Failures of the candidate
remain pending and are diagnosed before a retry; acceptance work alone does not
authorize changing the underlying guidance's product scope.

**Tools and selection:** Codex, Cursor and Claude Code each need recorded
evidence or justified reuse for affected requirements. Select fresh behavioral
runs by unresolved risk; verified Claude Code recurrences require aggregate
output and changed I/O preconditions. Reuse shared integration evidence only for
matching unchanged mechanisms; it does not prove this behavior. No host-by-case
matrix is required. Resolve native-run authority and selection before execution;
paid runs remain explicitly invoked and outside default tests and CI.

**Key examples:**

1. Given a heading and session list whose order changes, a fresh implementation
   session receives the change and repository surface without a missing-test hint
   → follows rendered text into enclosing observations → discovers and inspects
   the aggregate membership assertion, obtains its result, and aligns the changed
   behavior and legitimate assertion purpose before accepting dependent delivery.
2. Given entry-point scenarios with no data-source store, including missing/blank
   preset references and a named-genome holding that should return an error row,
   a read changes from conditional to unconditional → the session follows the
   entry point and its actual setup → observes the affected no-store results and
   repairs within the promised behavior or leaves the delivery unaccepted. Adding
   the missing store or dropping the error-row promise is not passing proof.
3. Given an implementation return with green named proof and a discovered caller
   left for CI → native acceptance obtains sufficient caller proof or marks the
   dependent promise incomplete before delivery. Naming the caller alone does not
   establish acceptance; independent valid evidence is retained.
4. Given an independent status formatter reached by neither change and sufficient
   unchanged-boundary evidence → selection and acceptance reuse that evidence
   without demanding unrelated reruns. An obsolete exclusion of a now-reached
   consumer is reassessed; equivalent purposes may share sufficient observation,
   but the distinct no-store purposes still need covered results.
5. Given complete or incomplete native output → the maintainer checks installed
   skill use, discovered boundary, actual setup/assertion, observed execution and
   acceptance decision → records pass, failure or pending per affected requirement
   and host. A prose claim, exit zero, replay or fixture-only pass cannot become
   native behavior proof.

**Reusable evidence and limits:** Plan 304's historical walkthrough records
intended guidance decisions, not native use. The `delivery-evidence/consumers`
fixture observes a changed factory contract, a stale stand-in exclusion and an
unchanged badge; its deterministic results do not exercise aggregate text or
conditional I/O. Neither source implies a native pass or universal integration recheck.

**Completion:** Before affected release under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md), assess selected
native runs or justified reusable evidence against every affected requirement
on each tool. Require evidence of installed skill use, discovered boundary,
observed result and acceptance decision; self-report, exit zero and consumer
lists alone are insufficient. Record candidate, runtime, inputs, decisive
evidence and judgment while active. Missing proof remains pending; delivery does
not complete this acceptance story or restart ODF-150's failed watch.
