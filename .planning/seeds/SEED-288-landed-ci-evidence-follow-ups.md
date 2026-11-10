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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/565-reuse-adapter-equivalent-timing/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e53de55c03d8473a5909ab4424f37b34e640907ccf80f2cd88aacc8066961e20","plan":"312d2035979fd94cf67afb277c381fded1b113289f855c42682ec1771976f06f"}}
```

#### Goal

A developer using a CI adapter can see a confirmed skipped landing's CI wall
time from its equivalent first-parent build in project history and Done-story
CI comparison, even when that build publishes no CI proof summary. Timing
history stays usable for frequent planning-only landings without inventing
test proof.

#### Scope

Required behavior:

- **Shared Landed timing vs proof.** In the shared Landed interpretation used by
  background collection, project **CI wall time history**, and Done-story CI
  comparison, a confirmed skip may reuse its equivalent build's wall time when
  that build passed and its attempt has valid start and later completion
  bounds. Usable attempt wall time no longer depends on a published CI proof
  summary. Missing proof stays an explicit gap for proof-dependent figures
  (entry counts, cumulative test execution time, scoped proof rows): it never
  becomes zero or invented test evidence. Comparison keeps naming the
  represented landing separately from the measured build and attempt, and
  several landings that share one attempt remain one history point.
- **Adapter equivalence and identity.** Equivalence stays the nearest earlier
  first-parent build already used for confirmed skips. Adapter discovery
  continues to identify the attempt by revision, run and attempt id through the
  maintained adapter fixtures; an ambiguous or otherwise unestablishable
  adapter attempt identity stays unusable and keeps its own gap wording. An
  adapter attempt that never publishes a proof summary is the ordinary case
  this story measures.
- **Recover retained No CI proof summary gaps.** Final stored
  `No CI proof summary` answers for confirmed skips that the new rule would
  measure are not left permanently final. After the rule change, ordinary
  collection and Done comparison recovery (collection pass, **Check again**, or
  the same-process recovery paths already used for pending Landed evidence)
  re-resolve those landings so they become the reused-equivalent point with
  that attempt's wall time. Changing only the live resolver must not leave
  retained adapter planning-only gaps unchanged.
- **Gaps that stay gaps.** No equivalent build, a failed or still-running
  equivalent, invalid or missing timing bounds, cancelled-landing paths, and
  unconfirmed skips keep their existing gap or pending reasons. GitHub Actions
  skips whose equivalent build publishes usable proof keep today's proof-backed
  reuse.

Required restrictions: keep confirmed-skip and first-parent equivalence
safeguards; do not invent proof, zero-fill missing proof, or present
proof-less wall time as complete test evidence. Browsing history or comparison
still acquires no upstream CI.

Deferred promises: adapter protocol changes, broader cancelled-landing reuse
without proof, a new history window, upstream acquisition during browsing, and
relaxing
[SEED-285#compare-landed-timing-with-recent-builds](SEED-285-landed-ci-timing-history.md#compare-landed-timing-with-recent-builds)
complete-published-proof eligibility for moving-average candidates.

#### Key examples

1. **Timed adapter skip becomes a point.** Adapter project: code landing P's
   attempt passed in 6 min 5 s with start and completion; planning-only landing
   S has no attempt of its own; discovery names P as S's nearest earlier
   first-parent build and answers no proof summary for that attempt → project
   history shows one measured point for P that also stands for S as reused
   equivalent, with P's wall time; S is not a `No CI proof summary` gap. Done
   comparison for S shows that Landed wall time with equivalent provenance and
   keeps proof-dependent figures unavailable with the explicit missing-proof
   reason.
2. **Shared attempt, one point.** Two planning-only adapter landings both
   resolve to the same successful timed attempt R → history lists one point for
   R naming both landings as reused equivalent; wall time is not duplicated.
3. **Missing proof is not zero evidence.** The reused equivalent supplies wall
   time, and the adapter still publishes no proof summary → counts and
   cumulative test execution time stay explicit gaps or unavailable; they are
   never shown as zero and no test rows are invented.
4. **Timing or equivalence absent.** Planning-only T's equivalent attempt has
   no start or completion; Q's attempt stopped without a verdict; U has no
   equivalent build → each keeps its existing final gap
   (`CI wall time not recorded`, cancelled / no later reuse, or
   `Equivalent timing unavailable`), not a measured point.
5. **Retained no-proof gaps recover.** Before the rule change, S was stored as
   a final `No CI proof summary` gap naming reused equivalent P. After the
   change, the next collection pass (or Done **Check again** / same-process
   recovery) re-resolves S → S joins P's measured point with P's wall time;
   restarting the dashboard alone without re-resolution does not leave the old
   final gap as the lasting answer once recovery has run.
6. **Identity and safeguards unchanged.** An ambiguous adapter attempt, or a
   retained adapter identity that cannot be established, stays an identity gap.
   A code landing with no run still does not reuse an ancestor. Cancelled
   adapter landings do not gain proof-free later-build wall time in this
   story.
