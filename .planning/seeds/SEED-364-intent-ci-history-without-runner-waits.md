---
id: SEED-364
status: active
planted: 2026-11-15
planted_during: Developer selected the existing CI time without runner waits for the Intent CI history chart
trigger_when: selected from the product backlog
scope: story
---

# SEED-364 — Chart CI time without runner waits in Intent

<a id="chart-ci-time-without-runner-waits"></a>

### Chart CI time without runner waits in Intent

**Identity:** SEED-364#chart-ci-time-without-runner-waits

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer reading the history chart in Project Intent’s **CI status** can
see whether CI execution is getting faster or slower independently of the
time jobs spend waiting for runners.

#### Scope

Use the existing **CI time without runner waits** from the
[CI timing comparison](../../docs/dashboard-development-intent-ci-comparison.md#intent-ci-timing-comparison)
throughout the [CI history section](../../docs/dashboard-development-intent-ci-status.md).
The measure uses the longest dependency chain of job durations, accounting
for parallel work and excluding runner waits both before and between jobs.

Use that measure for the chart points and their readouts, **Latest measured
build**, the selected landing’s time, and the times in **Builds and evidence**.
Calculate the **Prior-build average**, its sample count and evidence, and the
elapsed and percentage change against it from the same measure. Label the
history and its chart to identify the measure.

Retain the measure for the build attempt the history point represents.
When the retained evidence cannot supply a measurement, show a gap with
its reason and exclude it from the chart’s prior-build average.

#### Key examples

- A two-minute job runs before a three-minute dependent job. The first job
  waits 30 seconds for a runner and the second waits a minute. The chart
  shows **5 min** for the build. Longer runner waits alone leave that
  value at **5 min**.
- Five eligible prior builds each measured **5 min** without runner waits.
  The latest landing measures **4 min**. Its plotted point and build readouts
  show **4 min**, the chart’s reference line and the prior-build readout show
  **5 min** using five builds, and the UI shows **−1 min (−20%)** against
  that average.
- A retained build has wall time and lacks the evidence needed to calculate
  time without runner waits. Its chart mark explains that the measure is
  unavailable. The average uses the eligible builds with the measure.
