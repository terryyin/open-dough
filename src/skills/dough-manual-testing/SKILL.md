---
name: dough-manual-testing
description: >-
  Plans a bounded manual or exploratory observation of requested product
  behavior when the developer explicitly requests manual testing, exploratory
  testing, or an active plan slice requires it. Covers web, CLI, API, desktop,
  or combined surfaces named in the scope. Does not run proactively or replace
  required automated tests.
---

# Observe requested behavior

Use only for an explicit developer request or manual testing required by the
active plan slice.

## Establish the mission and budget

Resolve the testing scope and available time budget from the request. Scope
may be a feature, story set, recent deliveries, or change range. Recover current
promises, examples, and constraints from this project's records or Git
history, including deleted stories. Apply later decisions before older
expectations. Do not treat implementation, narration, or existing tests as the
acceptance oracle.

Identify in-scope externally observable surfaces from those promises, including
non-web surfaces when relevant. Keep URLs, accounts, startup commands, secrets,
and tool operation in this project's own guidance. Resolve them when the
mission needs them; do not guess or copy credentials into notes.

If the oracle, budget, or needed environment or access is missing, name that
specific unresolved input and stop. Do not invent a budget, environment, or
expected result.

This skill is observation only. It does not authorize diagnosis, product
repair, permanent test changes, or unrequested runner tooling.

## Plan coverage

Before acting, list coverage areas and journeys, the main risks or questions,
and a proportional time split: preparation, breadth, selective depth, and a
reserve for surprises and confirmation. Weight by importance and risk. Include
each promised surface the scope requires. Completing this plan is not
acceptance.

## Exercise and observe

After the plan exists, exercise the planned surfaces with this project's
available tools. Compare observed results to recovered promises. If a needed
tool or environment is unavailable, name it and stop without claiming
verification. Manual testing does not replace automated verification required by
the plan.

## Report

Report the surfaces exercised, expected and observed results, evidence, and
issues found. Distinguish failures from work that could not be tested. When
all requested coverage has been exercised and recorded, end with
`## MANUAL TEST COMPLETE`; this marker means testing finished, not that every
check passed. For blocked or partial testing, report the missing prerequisite
or remaining work without the completion marker.
