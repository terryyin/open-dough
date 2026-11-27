---
id: SEED-370
status: active
planted: 2026-11-15
planted_during: Terry cleaned up 2.5 GB of unused production dashboard deployments by hand
trigger_when: selected from the product backlog
scope: story
---

# SEED-370 — Remove old dashboard deployments automatically

<a id="remove-old-dashboard-deployments-automatically"></a>

### Remove old dashboard deployments automatically

**Identity:** SEED-370#remove-old-dashboard-deployments-automatically
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

For a developer running the production dashboard, keep
`~/.open-dough/dashboard/deployments` from growing without bound: old
deployments are removed automatically, while every deployment a running
dashboard, watcher, preview or runner still uses, and the recent ones, stay.

#### Starting evidence

- `stageDeployment` in `dashboard/server/productionDeployment.mjs` creates one
  owned directory per published commit (about 400–500 MB each after `npm ci`)
  and only removes it when staging fails. Nothing removes older ones.
- On 2026-11-15 the folder held 3.0 GB; six deployments from 7 Oct to 3 Nov
  that no process used took 2.5 GB and were deleted by hand. Three
  deployments were in use at the same time, so "in use" is not only the
  current one.
- Two abandoned `landed-ci-history.json.*.tmp` files (25 MB) from interrupted
  writes were also found and removed; leftover temporary files beside machine
  documents may belong in the same refinement if the cause is shared.

#### Scope to refine

- Define "old": keep the deployment in use and a small number of recent ones
  (for example for rollback); remove the rest.
- Never remove a deployment that a running process uses.
- Choose when removal runs (after a successful deployment switch is the likely
  point) and how a failed removal is reported.

<a id="close-preview-incident-record-on-sighup"></a>

### Close the preview's incident record when the watcher ends on SIGHUP

**Identity:** SEED-370#close-preview-incident-record-on-sighup
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/889-close-preview-incident-record-on-sighup/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5fc2bb40006d782d1606db3b60d0770722e132c57be9a08a1620c87a72ee7a94","plan":"d44ea0cd3b19c26c23498d03dc2db514fbfbf5c2830d2098c4a130e81931cb31"}}
```

#### Goal

Give developers an accurate account of why their production dashboard stopped.
When SIGHUP ends the watcher cleanly, the served preview closes its own incident
record so subsequent diagnostics report that preview as ended.

#### Scope

Finish the served preview's record as part of the watcher's existing shutdown.
The watcher still retires its deployment checkouts and leaves development, the
Cursor runner, and the connected client running. An unexpectedly killed preview
must still be reported as lost, since an end entry means the preview completed
its own close. Deployment retention, repairs to historical records, and changes
to the diagnostics format are outside this story.

#### Key examples

- With a published commit serving beside development and a connected Cursor
  client, send SIGHUP to the watcher. After the watcher exits, the preview that
  was serving has `process-started` followed by `process-ended` in the incident
  record. Its URL has stopped serving and its checkouts are retired. Development,
  the runner and the same client remain available.
- When a published update replaces the running preview, the retired preview
  still records its own start and end. A preview killed outright still has an
  incomplete record and is reported as lost by subsequent diagnostics.

#### Starting evidence

The [fast runtime cases' execution](https://github.com/terryyin/open-dough/blob/7fdf8e265edfb72ded348f3845080a186f5a39f1/.planning/slice-plans/879-prove-runtime-in-fast-unit-cases/PLAN.md#1-decide-production-deployments-from-typed-origin-and-checkout-state)
found the missing end entry on 2026-11-27 by tracing the production watcher test
to the served preview's process group. The replacement case observed both entries.
