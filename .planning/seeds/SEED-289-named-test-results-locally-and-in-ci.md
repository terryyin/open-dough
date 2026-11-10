---
id: SEED-289
status: active
planted: 2026-11-10
planted_during: Open Dough project findings maintenance in the combined feedback cycle of 2026-11-10
trigger_when: A layout check passes in scripts/ci-container.sh but fails on the hosted runner
scope: epic
---

# SEED-289 — Named test results that match locally and in CI

## Why this matters

`scripts/ci-container.sh` cannot reproduce the hosted runner's text widths.
In [DD-435](../../ProjectFindings.md#dd-435) the same narrow-width check in
`dashboard/tests/intent/intent-ci-proof.spec.ts` failed hosted CI twice
(runs 42059477099 and 42379612785) after passing on macOS and in the
container, costing two stash/repair/restore cycles and about 227k
repair-agent tokens. The second repair forces Verdana inside the spec, a
stand-in each new layout-measuring check must remember.

<a id="match-hosted-fonts-in-ci-container"></a>

### Give the local CI container the hosted runner's fonts

**Identity:** SEED-289#match-hosted-fonts-in-ci-container
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** An agent checking a layout-measuring dashboard spec in
  `scripts/ci-container.sh` gets the hosted runner's result before publishing.
- **Evaluation.** In the container, the `intent-ci-proof.spec.ts:150`
  narrow-width check measures the hosted widths: it fails on the two
  pre-repair revisions DD-435 records (parents of `4ad55b56d` and of
  `68e5f52b3`, without the spec's Verdana override) and passes on current
  trunk. `tests/ci-container.sh` checks the font set against the hosted
  runner's.
- **Boundary.** Whether to remove the per-spec Verdana override once the
  container matches is decided in refinement. Other hosted-only differences
  stay out of scope.
- **Value / learning.** Removes a recurring CI-only failure class for each new
  narrow-width check.
- **Safe stopping point.** The image change alone, with its check, is
  complete.
