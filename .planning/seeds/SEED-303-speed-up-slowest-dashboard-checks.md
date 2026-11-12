---
id: SEED-303
status: active
planted: 2026-11-11
scope: story
---

# SEED-303 — Speed up the remaining Dashboard checks

<a id="speed-up-slowest-dashboard-checks"></a>

### Speed up the remaining Dashboard checks

**Identity:** SEED-303#speed-up-slowest-dashboard-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/580-speed-up-slowest-dashboard-checks/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2153333974d0baf2344004cc09c0aeb91fa112c7fce3cc23f910583ca7a02bb9","plan":"002b506f67a54af10181e0ff54bc44130f7aeda1683e0474cc1781cfbfe9eaff"}}
```

#### Goal

Dashboard maintainers get the remaining CI protection for Taken agent
profiles, pending-Take reconciliation and pinned deployment from one ordinary
local command with one Playwright worker in under 45 seconds elapsed, counting
startup, shared preparation, every maintained or credited replacement check and
teardown. Each behavior keeps its distinct protection. Shorter checks also keep
their margin under the default 30-second test timeout when the host is busy.

#### Scope

The remaining selection is three maintained CI checks:

- `dashboard/tests/stories/taken-agent-profile.spec.ts` — each Taken card shows
  its published agent profile, or says plainly that none is recorded or readable;
- `dashboard/tests/launches/responsive-session-reconciliation.spec.ts` — a
  Take's older snapshot arriving late and an unrelated revision keep it
  protected, and its fully read accepted revision returns the Taken actions;
- `dashboard/backend-tests/runtime/production-deployment.spec.ts` — deployment
  installs, builds and serves its pinned commit in isolation after main advances.

Required behavior:

- Keep correct Taken owner/detail, mode, branch, tool/model, missing versus
  unreadable assignments, distinct portraits/icons, meaningful widths and
  accessibility observable with the smallest useful board.
- Keep pending Take actions protected through stale/unrelated and partial
  accepted reads, comparison failure/recovery, final complete snapshot and
  persisted reconciliation across reload.
- Retain the already improved real pinned-deployment case unchanged: main may
  advance after selection, while the isolated checkout/build/HTTP content,
  curated cartoons/icons, origin boundaries and process shutdown remain correct.
  Its time counts in the selection; it is not a reduction target.
- Reduce repeated inspections, repeated assertions and the preparation these
  checks themselves request, each removal naming the surviving proof of the same
  promise. Use shared MakeMe, existing external fixtures and real public
  boundaries; preserve ordinary CI selection.

Measure:

- The selection has a matched whole-command loaded baseline with per-check and
  outside-check seconds and load-independent counts; use it before further
  reduction. Quiet-host figures that stand in for the ratio remain the retained
  45-case median until a quiet matched baseline for this selection is observed.
- Judge the 45-second promise on a host that supports one worker as the retained
  baseline's did (one-minute load in single digits): three consecutive passing
  runs, each below 45 seconds.
- While other work keeps the host busy, do not wait for it. Alternate the
  baseline revision and the candidate under the same load, record the loads, and
  keep the result when the candidate's median elapsed is at most the baseline's
  median multiplied by 45 and divided by the quiet-host baseline, together with
  the reduced counts. The quiet-host three-run check then remains owed to the
  first quiet opportunity and is reported as such, not claimed.

Scope limits:

- Run-wide startup that every Dashboard run pays regardless of selection counts
  in the elapsed time but is not changed here. The pinned-deployment case remains
  unchanged and is not a reduction target. After the matched baseline showed the
  former 30-second promise unreachable without changing startup or the pinned
  case, Terry authorized a different target: 45 seconds for this selection,
  keeping browser reductions for busy-host margin under the default test timeout.
- The five extracted families are owned by SEED-311–315. Their work and timings
  do not belong in this selection, and no aggregate promise spans them.
- Local-only archived experiments are excluded.

No new internal mocks, wall-clock sleeps, retries, skips, timeout inflation or
special runner mode may manufacture a saving. Follow the
[failure policy](../../AGENTS.md#failing-and-flaky-tests).

#### Key examples

- A small published board shows the correct owner and detail; absent and malformed
  profiles remain distinct, with portrait/icon, viewport and accessibility proof.
  A mark already proved at one width for one card is not inspected again for
  every card at every width unless the width changes what that card shows.
- A pending Take remains protected through stale/unrelated and partial accepted
  snapshots; actions return only after the fully accepted snapshot is read, and
  persisted reconciliation survives reload.
- After a revision is selected and main advances, the real preview serves that
  selected revision and preserves source/build isolation, assets, origin policy
  and shutdown boundaries.
- On a quiet host, three consecutive passing ordinary one-worker runs of the
  three checks each finish below 45 seconds, including all setup and
  replacement proof.
- On a busy host, the candidate and the baseline alternate under the same
  recorded load; the candidate's median meets the ratio above and the reduced
  counts hold, and the report says the quiet-host check is still owed.
- A removed inspection whose promise no surviving check observes is restored;
  the saving does not count.

#### Observed before planning

- Quiet-host case durations retained from the former selection: pending Take
  9.03 s, Taken profile 8.07 s, pinned deployment 7.97 s (5.87 s in the
  latest retained 24-case run). The former 45-case and 24-case commands spent
  about 16 s outside their cases; this selection's own share is unmeasured.
- 12 November 2026, at `81bf54e11`, one worker, one-minute load 43–61 from
  other work: with the default timeout the pinned case passed in 54–57 s and
  both browser checks ended at the 30-second test timeout in two runs
  (199.82 s and 169.51 s). A scratch run with the timeout raised on the command
  line only, to attribute time, passed 3/3 in 165.05 s: pinned 48.7 s, pending
  Take 53.0 s, Taken profile 26.9 s, about 36 s outside the cases.
- In that traced run the pending-Take check spent 18.3 s of 53.3 s in its
  `origin` (9.1 s) and `dashboard` (8.7 s) fixtures over 668 trace steps. The
  profile check ran 988 trace steps; its mark inspection at two widths took
  10.8 s of 26.9 s and its portrait step 3.6 s.

#### Retained plan and evidence

The [remaining slice plan](../slice-plans/580-speed-up-slowest-dashboard-checks/PLAN.md)
carries this story. Completed improvements remain in the product. The
[early-handoff mapping and retained evidence](../evidence/SEED-303-early-handoff/README.md)
account for every former slice and the five independent follow-ups; that
handoff returned unfinished work to the backlog and neither completed nor
dropped it.
