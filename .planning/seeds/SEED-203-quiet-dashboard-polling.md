# SEED-203: Quiet dashboard polling

<a id="quiet-dashboard-polling"></a>

### Quiet dashboard polling

**Identity:** SEED-203#quiet-dashboard-polling
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"6e6d53969d49d18a59f7b5db2322b3770f70d794bdc7bc52800b4507482a914e"}}
```

**Goal:** Keep the production dashboard watcher quiet during routine successful
checks of published main.

Remove the repeating `Checked published main: <commit>.` output. Keep polling,
deployment, policy-skip, failure, and shutdown behavior intact. Update existing
watcher proof to observe polling without requiring user-facing check messages.

**Examples:** Repeated checks of unchanged main produce no check lines; a new
qualifying commit still deploys; a failed origin read remains visible and polling
continues after recovery.
