---
id: SEED-288
status: active
planted: 2026-11-09
planted_during: Terry Yin's follow-up to the completed landed CI wall-time history
trigger_when: A skipped adapter landing loses equivalent build timing, or a Done CI comparison keeps a gap after evidence becomes available
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

<a id="refresh-pending-landed-evidence"></a>

### Keep Done CI comparisons refreshable while landed evidence is pending

**Identity:** SEED-288#refresh-pending-landed-evidence
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer reviewing a Done story can recover its Landed
  comparison when GitHub creates the run or answers the proof read, without
  restarting the dashboard process.
- **Expected versus actual.** A landing with a run not created yet, or an
  unanswered proof read, remains pending and can be read again. The report
  found the Done comparison instead remembers the resulting No build or proof
  gap for the process lifetime. Project history already waits for those facts.
  At the reported revision, `intentCiComparisonAnswers.ts` accepts
  `finalSlot` results as final, while `landedCiResolution.ts` adds its own
  `stillAwaited` checks for run creation and unanswered proof.
- **Evaluation.** Arrange a landing recorded before its GitHub run exists;
  read the Done comparison; then make the run available and Check again in the
  same process. The comparison becomes the measured build. Hold or transiently
  fail the equivalent/later build's proof read, then answer it: another read
  recovers. Exercise the same facts through history and comparison and observe
  the same pending/final judgment. An answered missing, expired, invalid or
  unreadable artifact remains a final explained gap and keeps final-answer
  reuse. A running equivalent build stays refreshable too.
- **Boundary.** Move the pending/final decision to the shared Landed rule;
  preserve exact/equivalent/later-build provenance, existing final-answer
  reuse and Taken freshness. Use the delivered bounded no-run wait (until CI
  builds past the revision or one hour after its landing receipt) and the
  distinction between an unanswered provider request and an answered unusable
  artifact. Do not introduce a cache TTL, timed UI polling or another resolver.
- **Remaining uncertainty.** Reproduce the report with controlled CI answers;
  confirm how the shared comparison receives the landing receipt/time needed
  by the no-run bound. Reconcile with the active comparison-test work in
  SEED-286; shared files alone do not make it a blocking dependency.
- **Value / effort.** Prevents stale negative evidence and disagreement between
  two views of the same landing. The effort driver is sharing finality across
  collection, resolution and comparison memory while preserving terminal gaps.

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
