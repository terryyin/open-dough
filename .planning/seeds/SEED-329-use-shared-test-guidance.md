---
id: SEED-329
status: active
planted: 2026-11-12
scope: story
---

# Use shared MakeMe and page-object guidance

<a id="use-shared-test-guidance"></a>

### Use shared MakeMe and page-object guidance

**Identity:** SEED-329#use-shared-test-guidance
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A maintainer authoring or refactoring Open Dough tests gets the same MakeMe
and page-object guidance that the project publishes for other repositories.
The matching Intent entry selects the convention.

#### Scope

- Audit the unconditional MakeMe rule in [AGENTS.md](../../AGENTS.md#test-automation)
  and overlapping local instructions in the [test data guide](../../tests/test-data-architecture.md)
  and [dashboard journey guide](../../dashboard/tests/writing-journeys.md).
  Remove restatements of the shared conventions and point local guidance to
  the installed skills where useful. Keep local API paths, test harness
  boundaries, fixture ownership, and the recorded dashboard pilot evidence.
- Verify that selected browser specs resolve the page-object rule and that
  all five current MakeMe entries still resolve domain setup to the project
  builders, including shell checks that arrange data through Node helpers.
  Check callers outside the existing include patterns before retiring the
  blanket rule and settle any gap in how their conventions are selected.
- Keep the existing test suites and shared skill sources in scope only for
  reading and representative verification. SEED-300 continues to own dashboard
  page-object refactoring.
