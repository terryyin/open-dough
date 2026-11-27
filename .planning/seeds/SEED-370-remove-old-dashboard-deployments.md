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

- **Goal.** A developer running the production dashboard sees an orderly
  watcher shutdown as orderly: when the watcher ends on SIGHUP, the served
  preview's incident record shows `process-ended` after its
  `process-started`, so the dashboard does not read that preview as lost.
- **Evidence.** Found 2026-11-27 while executing
  `SEED-413#fast-runtime-unit-cases`: tying an assertion to the preview's own
  process group in `e2e/runtime/production-watcher.spec.ts` "SIGHUP quietly
  ends production and its checkouts…" showed `process-started` and no
  `process-ended` for that preview. A preview replaced by the next published
  main does record both.
- **Key example.** The watcher serves a published commit and receives SIGHUP:
  the preview's process entries are `process-started` then `process-ended`.
