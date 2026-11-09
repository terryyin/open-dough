---
id: SEED-284
status: active
planted: 2026-11-09
scope: story
---

# Optimize tests from existing CI proof

<a id="read-distinct-attempts-and-hidden-waits"></a>

### Read distinct attempts, an adapter's selection, and waits a mean hides

**Identity:** SEED-284#read-distinct-attempts-and-hidden-waits
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/559-read-distinct-attempts-and-hidden-waits/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2f47e249e2ef0a9be9becbecf4b7eb8cf1a93822ff6f13480af526898e22ddd9","plan":"ee7e827e897a57d545e205869943a5ff494998b8560b2f412dfb6dac55f3ea1d"}}
```

**Goal.** A developer whose project asks this skill to optimize tests gets a
saving worth keeping that rests on distinct CI attempts, the test selection
named even when the project reads CI through an adapter, and leads that a
per-case mean does not hide. The correction is bounded to the retrospective
findings for SEED-284#optimize-tests-from-ci-proof, which the Pygardon pilot
exposed.

**Scope.** In `src/skills/dough-test-optimization/references/evidence-and-leads.md`:
the variation behind the saving worth keeping comes from reader tables that
name different attempts, reached through the revision before the previous
table's attempt; the selection behind a CI adapter is traced from the adapter
command the table's Source line names to the CI job and test command it
reports; and a lead's mean per case is not taken as each case's cost before
its cases' own waits or timings are read. The reader, the record formats and
Intent stay unchanged. Plan:
[559](../slice-plans/559-read-distinct-attempts-and-hidden-waits/PLAN.md).
