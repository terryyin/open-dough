---
id: SEED-275
status: active
planted: 2026-11-08
scope: story
---

# Review a selected story in Intent tabs

The [approved Story tabs mockup](SEED-275-story-intent-tabs/intent-story-tabs.html)
is the visual target for Intent story tab work.

<a id="align-story-tabs-records"></a>

### Align story tab cost records, Taken heading, and wording

**Identity:** SEED-275#align-story-tabs-records
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/541-align-story-tabs-records/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c67b654f1c13cd93d05a6a5dd992b124ef644a35688ad769046beab72eb21419","plan":"45a04f04e084676dc1995c393b20fc5348920168d347c60477e9674efefcfe05"}}
```

**Goal.** Maintainers and developers reading Intent's request-cost contract,
its tests, and a Taken story's CI tab get an accurate account of the delivered
story tabs. The correction is bounded to the retrospective findings for
SEED-275#story-intent-tabs.

**Scope.** Make the request docs state that hidden story and trunk CI stay
followed, and protect that cost with request counts in the Project Intent
visit journey. Stop a Taken story's CI status from repeating its title under the
persistent header. Correct stale homepage, segmented-strip, and Intent-tab
wording in the touched comments and test titles. Behavior other than the
Taken heading line is unchanged.
[Plan](../slice-plans/541-align-story-tabs-records/PLAN.md)

<a id="preserve-story-on-panel-close"></a>

### Keep the selected story when the Side panel closes

**Identity:** SEED-275#preserve-story-on-panel-close
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/546-preserve-story-on-panel-close/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"da4990c41554a636b622adc88ef1fd394dd0c33d5fe2a962c2b42a76616316dc","plan":"d19c266170baaf8cccf481db70e0bc73b3962e1a5f7393da3af05e2faf923f2a"}}
```

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
