# SEED-149: Select the native GitHub workflow from project settings

<a id="native-ci-workflow"></a>

### Select the native GitHub workflow from project settings

**Identity:** SEED-149#native-ci-workflow
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** A project can select its existing GitHub Actions workflow through
`.planning/open-dough.json`, including when the observer starts outside a
development shell, without maintaining a custom CI adapter.

**Scope:** Add the native `ciWorkflow` setting, reuse the existing GitHub
acquisition and configuration behavior, and document its selection precedence.
Keep custom command adapters and the default workflow behavior compatible.

**Examples:**

- `{"ciWorkflow":"python-app.yml"}` selects that native workflow with no
  `DOUGH_CI_WORKFLOW` environment variable.
- `DOUGH_CI_WORKFLOW` continues to override project selection.
- An absent setting or absent project file retains `ci.yml`.
- Malformed native workflow settings fail with an actionable explanation;
  existing command-adapter projects continue working.
- Existing diagnostics and observation use the same selected workflow.

**Authority and delivery:** The user authorized this Open Dough change and then
updating Lizard to consume it and remove its adapter and tests. Execute this
bounded native-setting change as one contextual planless slice. Release and
the downstream Lizard migration follow after the upstream outcome is integrated.
The maintainer's release-and-update-clients workflow supplies its next-patch
version and finalization defaults, scoped to Open Dough itself and Lizard.

**Constraints:** Follow ADR 0004's one project-owned settings file and ordinary
whole-payload update. Preserve the existing environment override. Edit shared
source under `src/skills/`; installed managed copies change only through a
released update. Native host discovery and notification bridges are unchanged.
