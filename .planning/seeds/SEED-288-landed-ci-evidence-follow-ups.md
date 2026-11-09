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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/558-refresh-pending-landed-evidence/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c261505179a5596bdd91c6fa273a81904e69a76de46526bf4b8c0b2cb15bb59b","plan":"92e519668188ed969758355c826b8a9425c4fdcb676e2c824baa2ef264f9c930"}}
```

**Goal.** A developer reviewing a Done story can recover its Landed CI
comparison when the run or its proof becomes available, using Check again or
selecting the story again in the same dashboard process. Pending evidence must
not become a permanently remembered negative answer.

**Scope.** Share the existing Landed pending/final judgment between history
collection and Done comparison memory. A queued/running build, a cancelled
landing awaiting a later build, an unread CI request, an unanswered equivalent
or later-build proof read, and a run that CI may still create stay refreshable.
An answered missing, expired, invalid or unopenable artifact is a final
explained gap; completed answers retain final-answer reuse. Preserve build
selection, exact/equivalent/later provenance, timing explanations, endpoint
proof reuse, and Taken freshness.

Keep the existing no-run bound: a later first-parent trunk run within the
existing walk, the walk's limit, or one hour after the matching recorded
landing settles the wait. Match any available receipt to the project, target,
story and resolved landed revision; another preparation or execution landing
must not supply its age. Published comparison remains available without local
capture evidence, as ADR 0008 requires. An unknown receipt time is not evidence
that the hour expired: do not substitute completion/commit time or restart a
clock on each read; the remaining CI and walk evidence can still settle it.

This increment adds no cache TTL, timed UI polling, second resolver, adapter
protocol or broader build reuse. Separating adapter wall time from test proof
belongs to the sibling story below. Changing Trunk Mode's existing completion
ancestor selection is outside this story; sharing finality must preserve it.

**Key examples.**

1. A captured landing has no run on the first read. GitHub then creates a
   queued run and completes it. Check again in the same process advances
   through the pending states to the measured exact build; selecting the story
   again also recovers. History given the same landing facts agrees.
2. A confirmed skip's equivalent build, or a cancelled landing's later build,
   has a proof request held, transiently failed or not answered with a valid
   artifact listing. Read again after the provider answers: Landed recovers
   with the same represented revision and equivalent/later provenance. This
   wait remains pending even beyond an hour. A running equivalent build also
   remains refreshable until it finishes.
3. CI answers that an artifact is missing, expired, invalid or cannot be
   opened. The explained gap is final. Repeated reads reuse the final answer
   and valid proofs without further provider requests; no gap becomes zero.
4. No run appears for a captured landing. Before its one-hour deadline it is
   pending; at that deadline, or once CI builds past it under the existing
   first-parent bound, it is final No build. An unrelated receipt changes
   neither the deadline nor the judgment. Without a matching receipt the
   published comparison still works and unknown age alone cannot finalize it.
5. Final Done answers remain remembered, Taken answers follow live evidence,
   and Baseline/Branch behavior and both execution modes retain their existing
   selection semantics.

**Evidence and continuation.** The two reported stale negatives reproduced
through the real Check again control at the preparation revision; history's
pending-proof and no-run bounds passed under controlled CI/clock answers.
Published endpoints supply no receipt time today; landing records and retained
history already hold it. The [slice plan](../slice-plans/558-refresh-pending-landed-evidence/PLAN.md)
owns the shared rule, receipt propagation, and discriminating preservation
proof. SEED-286's active test optimization is coordination context, not a
product prerequisite.

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
