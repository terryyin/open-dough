---
id: SEED-210
status: active
planted: 2026-11-01
---

# Confirm a broken base before starting execution

<a id="confirm-broken-base-before-start"></a>

### Confirm a broken base before starting plan execution

**Identity:** SEED-210#confirm-broken-base-before-start
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer starting a plan execution from the Open Dough
dashboard.

**Goal:** Do not silently start new work on a base whose CI is failing. Before
the dashboard creates the execution workspace and branch, it checks the CI
result of the origin base revision the work will start from. When that CI did
not pass, the developer confirms whether to proceed on a broken build before
anything is created.

**Scope:**

- Dashboard plan-execution start only, checked before workspace and branch
  creation.
- Implement the check for projects whose CI runs on GitHub (GitHub Actions
  results for the origin base revision).
- A passing base starts as today, without an extra prompt. A failing base asks
  for confirmation naming the base revision and the failure; declining creates
  no workspace or branch. CI that is still running or cannot be read is shown
  truthfully rather than treated as passing.
- Customized CI (for example the PyGardon project's own CI): during execution,
  assess whether Open Dough can already obtain the base revision's CI result.
  If it can, include it in this story. If more work is needed, possibly in the
  PyGardon project itself, generate a new story for it and add it to the top
  of this repository's product backlog as an output of this story.

**Key examples:**

- Origin `main` CI passed → Start proceeds directly to workspace creation.
- Origin `main` CI failed → the dashboard asks "Base CI failed — proceed on a
  broken build?"; Cancel leaves no workspace or branch; Proceed starts normally.
- Customized-CI project whose result is not yet readable → the follow-up
  story exists at the top of the backlog when this story completes.
