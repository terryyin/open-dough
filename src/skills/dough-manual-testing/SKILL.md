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
repair, or unrequested runner tooling.

## Plan coverage

Before acting, list coverage areas and journeys, the main risks or questions,
and a proportional time split: preparation, breadth, selective depth, and a
reserve for surprises and confirmation. Weight by importance and risk. Include
each promised surface the scope requires. Completing this plan is not
acceptance.

## Prepare a starting state

Choose the cheapest reliable route: existing setup, a whole or partial
automated journey, or a temporary harness or test, including a setup-only
feature scenario using existing steps. Skip setup when the current state
already serves.

Confirm state, session, and required services remain available for external
observation; a finished batch run may not leave them usable. Preserve isolation
and cleanup. Reuse compatible states. Remove owned temporary artifacts.

Missing reuse is a possible improvement, not authority for permanent test or
runner changes. If no supported route leaves a usable starting state, name that
limitation and stop.

## Exercise and observe

After a usable starting state exists, exercise the planned surfaces with this
project's available tools and compare to recovered promises. If a needed tool
or environment is unavailable, name it and stop without claiming verification.
This does not replace required automated verification.

## Report

Report surfaces exercised, expected versus observed results, evidence, and
issues; distinguish failures from untested work. When requested coverage is
done, end with `## MANUAL TEST COMPLETE` (finished, not all-passed). For
blocked or partial testing, report the gap without that marker.
