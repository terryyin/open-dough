---
id: SEED-288
status: active
planted: 2026-11-09
planted_during: Terry Yin's follow-up to the completed landed CI wall-time history
trigger_when: A skipped adapter landing loses equivalent build timing
scope: epic
---

# SEED-288 — Keep landed CI evidence usable and current

## Why this matters

The completed SEED-285#see-landed-ci-wall-time-history exposed two follow-ups
in the Landed interpretation shared by project history and Done-story CI
comparison. Developers need usable timing for confirmed adapter skips and
comparison gaps that recover when CI has not answered yet. Terry requested
both stories be queued, without implementing them in this maintenance session.

The execution report at `2fbb06ad2586cd583221b037ec6fe58eb5f2abdc`, followed by
the link correction at `0c32a933570e3a7f2362b526618e64e59139ae22`, supplies the
observations below. The delivered behavior is described in
[Intent CI status](../../docs/dashboard-development-intent-ci-status.md) and
[CI timing comparison](../../docs/dashboard-development-intent-ci-comparison.md).

<a id="reuse-adapter-equivalent-timing"></a>

### Reuse equivalent CI adapter build timing for a skipped landing

**Identity:** SEED-288#reuse-adapter-equivalent-timing
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer using a CI adapter can see a confirmed skipped
  landing's CI wall time from its equivalent first-parent build even when
  that build publishes no CI proof summary.
- **Evidence.** The execution report counted 174 planning-only landings among
  371 Pygardon landings. They appeared as No CI proof summary gaps because
  the shared Landed rule requires usable proof before reusing an equivalent
  build. Treat this as the reported sample, not a newly measured count.
- **Evaluation.** A confirmed adapter skip with an equivalent successful build
  and valid start/completion bounds supplies that build's wall time in both
  project history and Done-story CI comparison. Both name the represented
  landing separately from the measured build and attempt. Several landings
  sharing the attempt make one history point. Missing proof remains explicit
  for counts and cumulative test execution time; it never becomes zero or
  invented test evidence. No equivalent build, failed/running evidence or
  invalid timing keeps its own gap or pending reason.
- **Boundary.** Separate usable attempt wall time from availability of test
  proof in the shared Landed interpretation. Keep confirmed-skip and
  first-parent equivalence safeguards. This story adds no adapter protocol,
  broader cancelled-landing reuse, new history window or upstream acquisition
  during browsing. It does not relax the moving-average story's requirement
  for complete published proof.
- **Remaining uncertainty.** Refinement should confirm adapter equivalence
  evidence and identity guarantees with the maintained adapter fixtures and
  specify recovery of retained No CI proof summary gaps after the rule changes.
  Such gaps are currently final in the store; changing the resolver alone
  would leave them unchanged.
- **Value / effort.** Makes adapter timing history useful for frequent
  planning-only landings. The effort driver is one shared timing/proof
  distinction with consistent collection, persistence and comparison behavior.
