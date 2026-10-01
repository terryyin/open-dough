---
id: SEED-077
status: active
planted: 2026-10-01
planted_during: Wrap-up of SEED-072#responsive-session-start-reconciliation, when Ubuntu package mirror stalls cancelled trunk CI
scope: story
---

# SEED-077: Keep CI independent of package mirror stalls

## Why This Matters

Every dashboard shard installs Playwright's system packages from the runner's
Ubuntu package mirror on each run. On 2026-10-01 that mirror stalled for hours:
shards spent 4–6 minutes in “Install Playwright Chromium” and hit the
6-minute job limit before any test ran, cancelling trunk and branch runs alike
(trunk runs for `285bd213`, `103ffacb` and `1e14e23f`; run 36884993415 needed
two reruns of its cancelled shards before every job passed). Developers and
agents then cannot tell a real failure from mirror weather, and executions
waste repair or rerun cycles.

## Story

<a id="ci-independent-of-package-mirror-stalls"></a>

### Keep CI checks independent of package mirror stalls

**Identity:** SEED-077#ci-independent-of-package-mirror-stalls

- **Goal:** A developer or agent publishing to trunk or a story branch gets a CI
  verdict about the code even while the runner's Ubuntu package mirror is slow
  or stalled.
- **Scope:** How CI jobs obtain the system packages the browser suite needs
  (for example caching or reusing them, or relying on what the runner image
  already provides) and how a stalled download is bounded so it surfaces as an
  infrastructure failure instead of consuming the test budget. Preserve every
  check that runs today, its per-job and total time budgets, and shard balance.
- **Key examples:**
  1. The package mirror stalls → a dashboard shard runs → it reaches and
     finishes its tests within the job limit, or fails fast naming the package
     download as the cause, never cancelled mid-suite by the time limit.
  2. The mirror is healthy → CI wall time is no worse than today.
- **Capture:** Terry asked for this story on 2026-10-01 after the wrap-up
  report's evidence (cancelled shards logged `Ign:` lines from
  `azure.archive.ubuntu.com` until the job limit).
