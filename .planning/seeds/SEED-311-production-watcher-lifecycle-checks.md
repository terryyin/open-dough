---
id: SEED-311
status: active
planted: 2026-11-11
planted_during: Terry's early handoff of SEED-303 into five independent optimization stories
trigger_when: Maintainers select this CI test family for faster trustworthy feedback
scope: story
---

# SEED-311 — Speed up production watcher lifecycle checks

<a id="speed-up-production-watcher-lifecycle-checks"></a>

### Speed up production watcher lifecycle checks

**Identity:** SEED-311#speed-up-production-watcher-lifecycle-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/589-speed-up-production-watcher-lifecycle-checks/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ce3b59566e20f35aeee2408605d4a0bbe444570b84b73fb6c5a07cc535f0fb02","plan":"17dc30036d5d022e2f813893d13c306f3b3975a8b88257eab8ae88c5e47e1e5b"}}
```

#### Goal

Dashboard maintainers get substantially faster local feedback on how the
production watcher selects, deploys, replaces and recovers published main.
Ordinary CI continues to catch the same product regressions.

#### Scope

- Minimize each input to what its assertions distinguish. Exercise Open Dough's
  behavior through actual Git, subprocesses, files and HTTP where their
  interaction matters. Use the shared MakeMe builders for domain data.
- Use real events to drive each transition and let the next action proceed on
  that event. Replace fixed sleeps and test polling. Failure deadlines can
  bound an absent event. Keep the public watch interval's production behavior.
- Keep representative full-dashboard startup, update and shutdown journeys.
  Move detailed failure, restoration and process-lifetime cases to cheaper
  real production boundaries only after equivalent proof exists. Preserve
  coverage for published reads, durable launch admission and runner lifetime.
- Use no mocks in the replacement proof. Retain exact checks of port ownership,
  published versus dirty local source, accepted starts, shared bytes and
  identity, and independent development and runner processes.
- Keep the delivered Git update-selection checks. The standalone pinning and
  distribution proof belongs to SEED-303. Preserve normal CI selection, default
  timeout policy and the [failure policy](../../AGENTS.md#failing-and-flaky-tests).

#### Key examples

- A watcher stages exactly B while origin advances to C. B replaces A at the
  same URL after accepted starts settle. Shared records and configuration
  retain their contents and identity, and C is available for the later check.
- A build failure leaves A serving. A failed preview start restores A. The
  unchanged candidate remains retryable. Failed restoration reports both
  causes and closes the URL. An unexpected preview exit ends the owning watcher.
- An unavailable origin preserves the working dashboard. When origin returns,
  the watcher resumes. Quiet, excluded and rejected ranges avoid staging.
- SIGTERM during a build, SIGHUP, and SIGINT end owned processes and retire
  checkouts. Independent services, the runner and its client stay alive.
  Restart serves the current published commit. An occupied port stays owned by
  its existing listener.

#### Success measure

Save at least 25 seconds of whole-command wall time on the same ordinary
one-worker selection with every replacement, preparation and teardown paid.
Budget around 90 seconds from the retained 129.90-second local comparison.
Require repeated passing observations and a fresh comparison on the current
execution base. The 85.50–93.61-second feasibility result retained 31 cases
and included only partial synchronization changes. The 11.22-second
lower-boundary trial covered four recovery cases and established a restoration
fault control. Retain the live watcher observations whose faults it did not
exercise.

#### Provenance

Extracted from [SEED-303](SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks)
under the [slice mapping](../evidence/SEED-303-early-handoff/README.md).
The [watcher evidence](../evidence/SEED-303-early-handoff/watcher-evidence.md)
records delivered Git selection work. The [preview evidence](../evidence/SEED-303-early-handoff/preview-evidence.md)
records the earlier shared-output experiment and its coverage gaps.
