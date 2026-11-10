# Source-only review

**Launch:** Fresh general-purpose reviewer (`inherit`), no conversation
inheritance; instructed to use only the supplied Goal, Scope, key examples and
exclusions for SEED-288#reuse-adapter-equivalent-timing, read no other project
files, and change nothing.

**Input:** Story section Goal, Scope (required behavior, restrictions, deferred
promises), and Key examples 1–6 from
`.planning/seeds/SEED-288-landed-ci-evidence-follow-ups.md#reuse-adapter-equivalent-timing`.
No plan, return, product, proof, suspected omission, or current-slice scope.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer using a CI adapter can see a confirmed skipped landing’s CI wall time from its equivalent first-parent build in project history and Done-story CI comparison, even when that build publishes no CI proof summary. | slice 2 | observed: history recovery + Done memory reopen: measured wall time for retained no-proof equivalent skips |
| 2 | Timing history stays usable for frequent planning-only landings without inventing test proof. | slice 1 | observed: intent-ci-wall-time-history-adapter.spec.ts: S joins P measured point; no invented proof rows |
| 3.1 | A confirmed skip may reuse its equivalent build’s wall time when that build passed and its attempt has valid start and later completion bounds. | slice 1 | observed: exactSkippedEquivalent.ts: timed pass + start/completion → asSlot(measured); adapter history point |
| 3.2 | Usable attempt wall time no longer depends on a published CI proof summary. | slice 1 | observed: exactSkippedEquivalent.ts: proof.kind summary OR unavailable/none with wall time → measured slot |
| 3.3 | Missing proof stays an explicit gap for proof-dependent figures (entry counts, cumulative test execution time, scoped proof rows). | slice 1 | observed: intent-ci-comparison-skipped-landed.spec.ts: Landed cells 'This run published no CI proof summary.'; Branch active |
| 3.4 | Missing proof never becomes zero or invented test evidence. | slice 1 | observed: intent-ci-comparison-adapter-planning-skip.spec.ts: Branch active + missing-proof reason; no invented counts |
| 3.5 | Comparison keeps naming the represented landing separately from the measured build and attempt. | slice 1 | observed: intent-ci-comparison-skipped-landed.spec.ts: identity shows equivalent build trunkSide, not olderBaseline |
| 3.6 | Several landings that share one attempt remain one history point. | slice 1 | observed: intent-ci-wall-time-history-adapter.spec.ts: one point landings exact P + equivalent S |
| 4.1 | Equivalence stays the nearest earlier first-parent build already used for confirmed skips. | slice 1 | observed: exactSkippedEquivalent.ts: nearestAncestorBuild only; adapter history S→P |
| 4.2 | Adapter discovery continues to identify the attempt by revision, run and attempt id through the maintained adapter fixtures. | slice 1 | observed: intent-ci-wall-time-history-adapter.spec.ts: Attempt attempt-p links for P/S via adapter fixtures |
| 4.3 | An ambiguous or otherwise unestablishable adapter attempt identity stays unusable and keeps its own gap wording. | slice 1 | observed: unchanged identity-gap paths; no-build code landing test retained in skipped-landed.spec.ts |
| 4.4 | An adapter attempt that never publishes a proof summary is the ordinary case this story measures. | slice 1 | observed: adapter history + Done adapter planning-only skip: no summary, wall time measured |
| 5.1 | Final stored `No CI proof summary` answers for confirmed skips that the new rule would measure are not left permanently final. | slice 2 | observed: landedCiNoProofReopen.ts reopenableRetainedNoProofSkip; collection re-resolves eligible finals |
| 5.2 | After the rule change, ordinary collection and Done comparison recovery (collection pass, **Check again**, or the same-process recovery paths already used for pending Landed evidence) re-resolve those landings so they become the reused-equivalent point with that attempt’s wall time. | slice 2 | observed: landed-ci-history-no-proof-recovery.spec.ts collection pass; answer-memory Check-again path |
| 5.3 | Changing only the live resolver must not leave retained adapter planning-only gaps unchanged. | slice 2 | observed: seeded final no-proof recovers on next collection; restart-without-collection leaves gap |
| 6.1 | No equivalent build keeps its existing gap or pending reason. | slice 1 | observed: adapter history: T gap reason no-equivalent |
| 6.2 | A failed or still-running equivalent keeps its existing gap or pending reason. | slice 1 | observed: adapter history: Q gap reason cancelled (stopped without verdict) |
| 6.3 | Invalid or missing timing bounds keep their existing gap or pending reason. | slice 1 | observed: adapter history: U gap reason not-recorded (no start/completion) |
| 6.4 | Cancelled-landing paths keep their existing gap or pending reason. | slice 1 | observed: cancelled path unchanged; later-build reuse without proof deferred (G2) |
| 6.5 | Unconfirmed skips keep their existing gap or pending reason. | slice 1 | observed: confirmed-skip path only; unconfirmed skips not opened |
| 6.6 | GitHub Actions skips whose equivalent build publishes usable proof keep today’s proof-backed reuse. | slice 1 | observed: intent-ci-comparison-skipped-landed.spec.ts proof-backed reuse journey retained; provenance GHA with summary still points |
| 7.1 | Keep confirmed-skip and first-parent equivalence safeguards. | slice 1 | observed: exactSkippedEquivalent: never walks past one equivalent; no-build skip keeps no ancestor |
| 7.2 | Do not invent proof. | slice 1 | observed: proof figures stay missing-proof wording; no summary invented |
| 7.3 | Do not zero-fill missing proof. | slice 1 | observed: Landed entry cells missingProof string, not zero |
| 7.4 | Do not present proof-less wall time as complete test evidence. | slice 1 | observed: activeComparisonOf path: Baseline compared with Branch when no Landed summary |
| 7.5 | Browsing history or comparison still acquires no upstream CI. | slice 1 | observed: docs + adapter Done: no browse upstream acquisition; no actions- calls in adapter journey |
| 8 | Timed adapter skip becomes a point. Adapter project: code landing P’s attempt passed in 6 min 5 s with start and completion; planning-only landing S has no attempt of its own; discovery names P as S’s nearest earlier first-parent build and answers no proof summary for that attempt → project history shows one measured point for P that also stands for S as reused equivalent, with P’s wall time; S is not a `No CI proof summary` gap. Done comparison for S shows that Landed wall time with equivalent provenance and keeps proof-dependent figures unavailable with the explicit missing-proof reason. | slice 1 | observed: adapter history S on P 6m5s; Done adapter planning-only Landed wall 5 min + missing-proof |
| 9 | Shared attempt, one point. Two planning-only adapter landings both resolve to the same successful timed attempt R → history lists one point for R naming both landings as reused equivalent; wall time is not duplicated. | slice 1 | observed: adapter history one point naming P and S; provenance shared-attempt journeys |
| 10 | Missing proof is not zero evidence. The reused equivalent supplies wall time, and the adapter still publishes no proof summary → counts and cumulative test execution time stay explicit gaps or unavailable; they are never shown as zero and no test rows are invented. | slice 1 | observed: skipped.spec.ts + adapter.spec.ts: wall present; counts/rows missing-proof not zero |
| 11 | Timing or equivalence absent. Planning-only T’s equivalent attempt has no start or completion; Q’s attempt stopped without a verdict; U has no equivalent build → each keeps its existing final gap (`CI wall time not recorded`, cancelled / no later reuse, or `Equivalent timing unavailable`), not a measured point. | slice 1 | observed: adapter history Q/U/T keep cancelled/not-recorded/no-equivalent gaps |
| 12 | Retained no-proof gaps recover. Before the rule change, S was stored as a final `No CI proof summary` gap naming reused equivalent P. After the change, the next collection pass (or Done **Check again** / same-process recovery) re-resolves S → S joins P’s measured point with P’s wall time; restarting the dashboard alone without re-resolution does not leave the old final gap as the lasting answer once recovery has run. | slice 2 | observed: no-proof-recovery.spec.ts: S joins timed equivalent point after collection; without collection gap remains |
| 13 | Identity and safeguards unchanged. An ambiguous adapter attempt, or a retained adapter identity that cannot be established, stays an identity gap. A code landing with no run still does not reuse an ancestor. Cancelled adapter landings do not gain proof-free later-build wall time in this story. | slice 1 | observed: skipped no-build code landing; cancelled reuse deferred; identity gaps unchanged |
| 14.1 | Deferred / out of scope: Adapter protocol changes. |  | G1 |
| 14.2 | Deferred / out of scope: Broader cancelled-landing reuse without proof. |  | G2 |
| 14.3 | Deferred / out of scope: A new history window. |  | G3 |
| 14.4 | Deferred / out of scope: Upstream acquisition during browsing. |  | G4 |
| 14.5 | Deferred / out of scope: Relaxing SEED-285#compare-landed-timing-with-recent-builds complete-published-proof eligibility for moving-average candidates. |  | G5 |
