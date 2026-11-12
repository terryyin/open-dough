---
id: SEED-325
status: active
planted: 2026-11-12
planted_during: Terry reported that Java JUnit test files were missing from Intent
trigger_when: Terry asked for JUnit support as the first story in the product backlog
scope: story
---

# SEED-325 — JUnit tests in Intent

<a id="review-junit-tests-in-intent"></a>

### Review JUnit tests in Intent

**Identity:** SEED-325#review-junit-tests-in-intent
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer reviewing a Java project can find its JUnit test files in the
Intent test browser and open them in **Purpose** to read the behavior they
cover. Terry reported that those files are currently missing from the list.

#### Scope to refine

- Reproduce the missing files using the project's Intent location settings.
  Start with the existing [source selection and browsing behavior](../../docs/dashboard-development-intent.md).
- Improve cohesion by bringing equivalent behavior across test types into the
  shared Intent flow for listing, opening, and reviewing tests. Limit Java or
  JUnit specialization to recognition of test files or details that requires
  knowledge of Java or JUnit.
- Use the existing **Purpose** view for JUnit source, following
  [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).

#### Key examples to refine

- A configured Java project lists a JUnit test file under its package folders
  in Intent. Selecting the file opens its source in **Purpose**.
- In a project with JUnit and another supported test type, a developer can
  browse and open both through the same Intent controls and review flow.
