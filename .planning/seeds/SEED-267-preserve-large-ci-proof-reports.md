---
id: SEED-267
status: active
planted: 2026-11-08
scope: story
---

# CI proof report size limits

<a id="preserve-large-ci-proof-reports"></a>

### Preserve large CI proof reports and surface size failures

**Identity:** SEED-267#preserve-large-ci-proof-reports

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** Developers reviewing CI proof in Intent can see complete reports
with file-level timings and immediately recognize when a size limit prevents
the proof from being read.

**Context.** The shared CI adapter reader caps responses at 64 KiB. Pygardon
published proof reports of about 157 KiB with timings for 1,213 pytest files.
Its adapter stripped the pytest breakdown to fit the cap and returned the
remaining report as a success.

**Scope.** Give proof responses a substantially larger, finite byte limit
with headroom for reports of this size. Keep the 64 KiB limit for other CI
adapter responses. Document that a successful proof response carries the
complete report and that a size failure must be explicit at either end of
the adapter boundary.

**Evaluation.**

- A proof report larger than 64 KiB and within the proof limit reaches Intent
  with all its file timings and totals intact.
- If a complete report exceeds the proof limit, the read fails as soon as
  the excess is detected. Intent shows a prominent error beside the affected
  attempt's proof, names the limit and the actual size when known, and
  distinguishes the failure from a build that published no proof. Only a
  complete report can be displayed or cached as successful proof.
- An oversized non-proof adapter response is still rejected at 64 KiB.

See the [dashboard guidance on visible source failures](../../docs/dashboard-ux-ui-north-star.md#empty-loading-and-error-states).
