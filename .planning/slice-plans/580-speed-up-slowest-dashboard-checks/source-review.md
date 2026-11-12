# Source review — SEED-303#speed-up-slowest-dashboard-checks

## Launch and input

- Reviewer: fresh general-purpose agent (`fe5c77bc-5716-4cb8-b68c-880414dc489b`), no conversation inheritance.
- Input: only the selected story Goal, Scope, key examples and exclusions from
  `.planning/seeds/SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks`.
- Constraints given: read no other project files; change nothing; return numbered
  commitments with compound sub-ids; derive promises, not slice ownership.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Dashboard maintainers get the remaining CI protection for Taken agent profiles, pending-Take reconciliation, and pinned deployment from one ordinary local command. | slice 4 | |
| 2 | That command runs with one Playwright worker. | slice 4 | |
| 3 | Elapsed time is under 30 seconds, counting startup, shared preparation, every maintained or credited replacement check, and teardown. | slice 4 | |
| 4 | Each of those behaviors keeps its distinct protection. | slice 4 | |
| 5 | Shorter checks also keep their margin under the default 30-second test timeout when the host is busy. | slice 4 | |
| 6 | The remaining selection is exactly these three maintained CI checks. | slice 4 | |
| 6.1 | `dashboard/tests/stories/taken-agent-profile.spec.ts` | slice 4 | |
| 6.2 | `dashboard/tests/launches/responsive-session-reconciliation.spec.ts` | slice 4 | |
| 6.3 | `dashboard/backend-tests/runtime/production-deployment.spec.ts` | slice 4 | |
| 7 | Each Taken card shows its published agent profile, or says plainly that none is recorded or readable. | slice 2 | |
| 8 | A Take's older snapshot arriving late and an unrelated revision keep it protected. | slice 3 | |
| 9 | Its fully read accepted revision returns the Taken actions. | slice 3 | |
| 10 | Deployment installs, builds, and serves its pinned commit in isolation after main advances. | slice 4 | |
| 11.1 | Keep correct Taken owner/detail with the smallest useful board. | slice 2 | |
| 11.2 | Keep mode observable with the smallest useful board. | slice 2 | |
| 11.3 | Keep branch observable with the smallest useful board. | slice 2 | |
| 11.4 | Keep tool/model observable with the smallest useful board. | slice 2 | |
| 11.5 | Keep missing versus unreadable assignments observable with the smallest useful board. | slice 2 | |
| 11.6 | Keep distinct portraits/icons observable with the smallest useful board. | slice 2 | |
| 11.7 | Keep meaningful widths observable with the smallest useful board. | slice 2 | |
| 11.8 | Keep accessibility observable with the smallest useful board. | slice 2 | |
| 12.1 | Keep pending Take actions protected through stale/unrelated reads. | slice 3 | |
| 12.2 | Keep pending Take actions protected through partial accepted reads. | slice 3 | |
| 12.3 | Keep pending Take actions protected through comparison failure/recovery. | slice 3 | |
| 12.4 | Keep pending Take actions protected through final complete snapshot. | slice 3 | |
| 12.5 | Keep pending Take actions protected through persisted reconciliation across reload. | slice 3 | |
| 13 | Retain the already improved real pinned-deployment case unchanged. | slice 4 | |
| 14 | Main may advance after selection while the pinned case remains correct. | slice 4 | |
| 15.1 | Isolated checkout/build/HTTP content remain correct for the pinned case. | slice 4 | |
| 15.2 | Curated cartoons/icons remain correct for the pinned case. | slice 4 | |
| 15.3 | Origin boundaries remain correct for the pinned case. | slice 4 | |
| 15.4 | Process shutdown remains correct for the pinned case. | slice 4 | |
| 16 | Its time counts in the selection; it is not a reduction target. | slice 4 | |
| 17 | Reduce repeated inspections, repeated assertions, and the preparation these checks themselves request. | slice 2 | |
| 18 | Each such removal names the surviving proof of the same promise. | slice 4 | |
| 19.1 | Use shared MakeMe. | slice 2 | |
| 19.2 | Use existing external fixtures. | slice 2 | |
| 19.3 | Use real public boundaries. | slice 2 | |
| 19.4 | Preserve ordinary CI selection. | slice 4 | |
| 20 | Establish a matched whole-command baseline before the first reduction. | slice 1 | observed: PLAN.md Slice 1 baseline + proof/baseline-summary.json whole-command runs |
| 21 | That baseline records per-check and outside-check seconds. | slice 1 | observed: proof/baseline-summary.json per-check and outside-check seconds; PLAN.md Slice 1 baseline table |
| 22 | Record a load-independent count for each reduced check (for example trace steps, card inspections, viewport passes, fixture preparations). | slice 1 | observed: proof/baseline-summary.json attribution_run counts; proof/attribution-summary.json |
| 23 | Judge the 30-second promise on a host that supports one worker as the retained baseline's did (one-minute load in single digits). | slice 4 | |
| 24 | Three consecutive passing runs, each below 30 seconds. | slice 4 | |
| 25 | While other work keeps the host busy, do not wait for it. | slice 4 | |
| 26 | Alternate the baseline revision and the candidate under the same load, and record the loads. | slice 4 | |
| 27 | Keep the result when the candidate's median elapsed is at most the baseline's median multiplied by 30 and divided by the quiet-host baseline, together with the reduced counts. | slice 4 | |
| 28 | The quiet-host three-run check then remains owed to the first quiet opportunity and is reported as such, not claimed. | slice 4 | |
| 29 | Run-wide startup that every Dashboard run pays regardless of selection counts in the elapsed time but is not changed here. | slice 1 | observed: proof/baseline-summary.json outside_check_s; PLAN.md stop probe (startup unchanged) |
| 30 | If the matched baseline shows the promise cannot be met without changing that run-wide startup or the pinned case, that returns to Terry as a decision before further reduction. | slice 1 | observed: PLAN.md stop fired; slices 2-4 blocked for Terry |
| 31 | The five extracted families owned by SEED-311–315: their work and timings do not belong in this selection, and no aggregate promise spans them. |  | E1 |
| 32 | Local-only archived experiments are excluded. |  | E2 |
| 33.1 | No new internal mocks may manufacture a saving. |  | E3 |
| 33.2 | No new wall-clock sleeps may manufacture a saving. |  | E3 |
| 33.3 | No new retries may manufacture a saving. |  | E3 |
| 33.4 | No new skips may manufacture a saving. |  | E3 |
| 33.5 | No new timeout inflation may manufacture a saving. |  | E3 |
| 33.6 | No new special runner mode may manufacture a saving. |  | E3 |
| 34 | Follow the failure policy linked at `../../AGENTS.md#failing-and-flaky-tests`. | slice 4 | |
| 35 | A small published board shows the correct owner and detail; absent and malformed profiles remain distinct, with portrait/icon, viewport and accessibility proof. | slice 2 | |
| 36 | A mark already proved at one width for one card is not inspected again for every card at every width unless the width changes what that card shows. | slice 2 | |
| 37 | A pending Take remains protected through stale/unrelated and partial accepted snapshots; actions return only after the fully accepted snapshot is read; persisted reconciliation survives reload. | slice 3 | |
| 38 | After a revision is selected and main advances, the real preview serves that selected revision and preserves source/build isolation, assets, origin policy, and shutdown boundaries. | slice 4 | |
| 39 | On a quiet host, three consecutive passing ordinary one-worker runs of the three checks each finish below 30 seconds, including all setup and replacement proof. | slice 4 | |
| 40 | On a busy host, the candidate and the baseline alternate under the same recorded load; the candidate's median meets the stated ratio and the reduced counts hold; the report says the quiet-host check is still owed. | slice 4 | |
| 41 | A removed inspection whose promise no surviving check observes is restored; the saving does not count. | slice 4 | |
