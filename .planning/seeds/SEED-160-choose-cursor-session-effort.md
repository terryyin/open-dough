---
id: SEED-160
status: active
planted: 2026-10-28
planted_during: Maintainer report of missing Cursor effort selection
trigger_when: Starting a Cursor session from the dashboard
scope: small
---

# SEED-160: Choose effort when starting a Cursor session

## Why This Matters

Terry reported that the dashboard's Cursor start dialog has no option to choose
effort. Developers starting a Cursor session need to see the available effort
choices in that dialog and select the effort for their work before starting.

## Selected Story

<a id="choose-cursor-session-effort"></a>

### Choose effort when starting a Cursor session

**Identity:** SEED-160#choose-cursor-session-effort
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / outcome:** A developer starting a Cursor session from the dashboard can
see and choose a supported reasoning effort in the start dialog, and the
session starts with that choice applied.

**Scope:** Show the available effort choices for the selected Cursor model in
the existing start dialog and carry the selected effort through session startup.
Determine Cursor's supported choices and how they are applied during refinement;
the report does not establish specific effort values or a launch mechanism.

**Key examples:**

- A developer selects Cursor and a model with effort choices in the start dialog
  → the dialog lists those choices → selecting one and starting the session
  applies that effort to the new session.
- A developer changes the selected Cursor model → the dialog reflects the new
  model's supported effort choices and prevents an unsupported selection from
  being silently applied.

**Evaluation:** Observe the Cursor start dialog listing supported effort choices,
then verify that a session started with a selected effort uses it. Establish the
native Cursor capability during refinement before selecting an implementation.

## Breadcrumbs

- Terry's report and instruction on 2026-10-28: list effort in the Cursor session
  start dialog, place this story at the top of the product backlog, and commit
  and synchronize the planning change directly on main.
- [Product backlog](../PRODUCT-BACKLOG.md).
