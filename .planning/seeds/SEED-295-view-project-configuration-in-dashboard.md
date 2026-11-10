---
id: SEED-295
status: active
planted: 2026-11-10
scope: story
---

# View each project's Open Dough configuration in dashboard settings

<a id="inspect-project-configuration-in-dashboard"></a>

### View each project's Open Dough configuration in dashboard settings

**Identity:** SEED-295#inspect-project-configuration-in-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A maintainer can inspect each configured project's `.planning/open-dough.json`
from **System settings → Projects** without opening the project checkout in an
editor.

- When two projects have different settings, the view for each project shows
  the settings from its own file.
- When a project's file is absent or cannot be read, its view explains that
  rather than showing settings from another project.
- The view provides no editing or saving actions. Opening it leaves the
  project configuration unchanged.
