---
id: SEED-275
status: active
planted: 2026-11-08
scope: story
---

# Review a selected story in Intent tabs

The [approved Story tabs mockup](SEED-275-story-intent-tabs/intent-story-tabs.html)
is the visual target for Intent story tab work.

<a id="preserve-story-on-panel-close"></a>

### Keep the selected story when the Side panel closes

**Identity:** SEED-275#preserve-story-on-panel-close

**Goal.** A developer can dismiss a review, terminal, or final report and
continue working with the story they currently have selected.

**Scope.** Apply the selection rule in [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
to every Side panel dismissal, including when marking a session done or
deleting its record closes the panel. Preserve the selection at the time of
dismissal. Keep keyboard return to the opening control when it is available
and use the dashboard's fallback when it has disappeared. Align the dashboard
navigation and Intent guidance with the delivered behavior.

**Key examples**

- In Intent's **Changed tests** tab, a developer reads a file's Proof, opens
  **Review changes** from the story header using the keyboard, and closes it.
  The same story, tab, file, and reading position are present, and focus
  returns to the header button.
- With story A's final report open, a developer selects story B and closes
  the report. Story B stays selected and supplies the story evidence in
  Intent.
- Closing a story's terminal removes its **Shown in terminal** indicator
  and keeps the currently selected story highlighted. Dismissing a session
  panel through **Mark as done** or deletion also preserves the current
  selection. If no story is selected, the dashboard stays at project scope.
