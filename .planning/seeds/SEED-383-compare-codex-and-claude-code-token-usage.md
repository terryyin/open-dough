---
id: SEED-383
status: active
planted: 2026-11-16
planted_during: Terry asked to compare dashboard token usage for Codex and Claude Code
trigger_when: selected from the product backlog
scope: story
---

# SEED-383 — Compare Codex and Claude Code token usage

<a id="compare-codex-and-claude-code-token-usage"></a>

### Compare Codex and Claude Code token usage

**Identity:** SEED-383#compare-codex-and-claude-code-token-usage

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can compare the token index of finished dashboard-launched Codex
and Claude Code tasks in [System settings → Usage](../../dashboard/src/SystemSettingsUsage.tsx).
They can see when usage occurred and give closely timed tasks equal room on the
chart when comparing individual tasks.

#### Key examples

- Replace the single Tool dropdown with a selection that lets a developer show
  Codex, Claude Code, or both. With both selected, their task points and
  rolling medians overlap on one chart with distinct, labeled colors and a
  common token index scale. Deselecting one tool hides its series. Both
  choices and the spacing control stay visible and usable on narrow screens.
- The Model dropdown offers the models available from the selected tools and
  one **All models** option that covers all selected tools. Turning off a tool
  removes models offered only by that tool. Keep the chosen model if it is still
  available, or return to **All models** when it is no longer offered.
- In the time view, both series use the same completion-time axis over the
  selected period. Tasks finished at the same time share a horizontal position,
  and gaps between tasks are proportional to elapsed time.
- Turning on equal task spacing gives each visible task one equal-width slot
  in a single chronological sequence across the selected tools. The axis shows
  task order, and selecting a point still shows the task's actual completion
  time and token index. Turning the option off restores the shared time axis.
