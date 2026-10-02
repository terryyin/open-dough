---
id: SEED-081
status: active
planted: 2026-10-02
planted_during: Terry's request for dashboard Codex model and effort selection
scope: story
---

# SEED-081: Choose Codex model and effort when starting a dashboard session

## Why This Matters

Developers starting a Codex session from the dashboard need to choose the model
and reasoning effort for the work they are about to start, without leaving the
dashboard to change their tool configuration.

## Story

<a id="codex-session-model-and-effort"></a>

### Choose Codex model and effort when starting a dashboard session

**Identity:** SEED-081#codex-session-model-and-effort
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer starting a Codex session in the dashboard can select its
model and reasoning effort, and the launched session uses those selections.

**Captured scope:**

- Offer model and reasoning-effort choices when Codex is selected in dashboard
  session startup, including unattached Start session and story workflow starts.
- Carry the selected values into the actual Codex session launch.
- Make supported model/effort combinations understandable before launch; do not
  silently substitute a different model or effort for an explicit choice.
- Preserve a usable configured-default path when the developer does not choose
  an override.

**Key examples:**

- A developer selects Codex, a supported model, and a supported effort, then
  starts the session → the session runs with that model and effort.
- The developer changes models before starting → effort choices reflect what
  the new model supports, and the developer can resolve an incompatible choice
  before launch.
- The developer starts without overriding model or effort → the session uses
  the applicable Codex defaults.

**Refinement questions:** Establish how the installed Codex host supplies its
available models and supported effort levels, how defaults are displayed, and
whether choices persist across launches. Confirm the affected startup dialogs
and launch/resume boundaries against the current product before planning.
No fixed model list, persistence policy, or execution plan is selected here.

**Boundary:** This captures Codex startup configuration. Model selection for
other hosts and changing an already running session are separate outcomes.

**Capture:** Terry requested this story at the top of the product backlog on
2026-10-02, authorizing capture, commit, and synchronization on main. This is
queued work; capture does not authorize feature implementation.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard-initiated agent work](SEED-052-start-agent-work-from-dashboard.md)
  established configured-default model behavior for the initial launch stories.
- [Unattached session options](SEED-066-composable-lightweight-session-options.md#unattached-session-options)
  concerns workspace and landing choices, independently of model and effort.
