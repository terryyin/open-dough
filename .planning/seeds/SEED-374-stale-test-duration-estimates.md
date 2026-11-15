---
id: SEED-374
status: active
planted: 2026-11-15
planted_during: Project-local retrospective findings maintenance
trigger_when: selected from the product backlog
scope: story
---

# SEED-374 — See stale test duration estimates before relying on CI headroom

<a id="see-stale-test-duration-estimates"></a>

### See stale test duration estimates before relying on CI headroom

**Identity:** SEED-374#see-stale-test-duration-estimates

Contributors changing the Distribution test inventory can tell when the
pre-push share preview has enough recent timing evidence to judge budget
headroom and when they need to refresh the timing list.

[DD-537](../../docs/maintainer/project-test-findings.md#dd-537) records the
failed share. The preview estimated 178.2 s of headroom while estimating 26
existing jobs at 1.5 s each. The refreshed list exposed the thin margin.

Use the existing Distribution share preview and timing-refresh path. Evaluate
a recorded fixture that reproduces stale-list optimism and a current list
with one genuinely new job. A contributor should be able to recognize the
stale case and the next step from the preview. A new job should still be
identifiable as an estimate. Keep share allocation and CI budgets in scope
only as inputs to that judgment.
