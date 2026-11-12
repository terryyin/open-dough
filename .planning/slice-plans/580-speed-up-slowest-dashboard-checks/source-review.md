# Source review — SEED-303#speed-up-slowest-dashboard-checks

## Launch and input

- Reviewer: fresh general-purpose agent (`16fafbd9-95bc-4367-b420-29cba7d96cf7`), no conversation inheritance.
- Input: only the amended selected story Goal, Scope, key examples and exclusions from
  `.planning/seeds/SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks`
  (45-second target after Terry's authorized amendment).
- Constraints given: read no other project files; change nothing; return numbered
  commitments with compound sub-ids; derive promises, not slice ownership.
- Replaces the prior review that reflected the former 30-second promise.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | One ordinary local command with one Playwright worker covers the remaining CI protection for Taken agent profiles, pending-Take reconciliation and pinned deployment in under 45 seconds elapsed, including startup, shared preparation, every maintained or credited replacement check, and teardown. | slice 4 | observed: busy form candidate median 46.97 within threshold 57.48; proof/slice4-summary.json |
| 2 | Each of the three behaviors keeps its distinct protection. | slice 4 | observed: three distinct specs still selected and passed under moderate load; pinned unchanged |
| 3 | Shorter checks keep margin under the default 30-second test timeout when the host is busy. | slice 4 | observed: profile under 30s every candidate run; pending under 30s on C1-C3; extreme-load timeouts on both revisions in proof/slice4-summary.json |
| 4 | The remaining selection is exactly these three maintained CI checks. | slice 4 | observed: `--list` Total 3 tests in 3 files (`proof/slice4-discovery.log`) |
| 4a.1 | Each Taken card shows its published agent profile, or says plainly that none is recorded or readable. | slice 2 | observed: taken-agent-profile.spec.ts: card profile/missing/unreadable assertions + focused proof |
| 4a.2 | A Take's older snapshot arriving late and an unrelated revision keep it protected, and its fully read accepted revision returns the Taken actions. | slice 3 | observed: responsive-session-reconciliation.spec.ts pending journey + file grep 2/2 |
| 4a.3 | Deployment installs, builds, and serves its pinned commit in isolation after main advances. | slice 4 | observed: pinned spec unchanged; passed in credited candidate runs |
| 5.1 | Correct Taken owner/detail remains observable. | slice 2 | observed: taken-agent-profile.spec.ts: owner/detail steps |
| 5.2 | Mode remains observable. | slice 2 | observed: taken-agent-profile.spec.ts: mode in detail |
| 5.3 | Branch remains observable. | slice 2 | observed: taken-agent-profile.spec.ts: branch detail |
| 5.4 | Tool/model remains observable. | slice 2 | observed: taken-agent-profile.spec.ts: tool/model assertions |
| 5.5 | Missing versus unreadable assignments remain observable (and distinct). | slice 2 | observed: taken-agent-profile.spec.ts: missing vs unreadable (older/malformed) |
| 5.6 | Distinct portraits/icons remain observable. | slice 2 | observed: taken-agent-profile.spec.ts: expectPortrait distinct agents |
| 5.7 | Meaningful widths remain observable. | slice 2 | observed: taken-agent-profile.spec.ts: desktop + narrow viewport marks |
| 5.8 | Accessibility remains observable. | slice 2 | observed: taken-agent-profile.spec.ts: accessible owner/detail text |
| 5.9 | These are observable with the smallest useful board. | slice 2 | observed: takenAgentProfileRecords.ts board + this check |
| 6.1 | Pending Take actions stay protected through stale/unrelated reads. | slice 3 | observed: stale/unrelated protection + expectProtected/expectActionsUnavailable |
| 6.2 | Pending Take actions stay protected through partial accepted reads. | slice 3 | observed: partial accepted (held seed) + expectActionsUnavailable |
| 6.3 | Comparison failure/recovery remains covered. | slice 3 | observed: compare failure + reload recovery; compares list length 3 |
| 6.4 | Final complete snapshot remains covered. | slice 3 | observed: final complete snapshot returns Taken actions |
| 6.5 | Persisted reconciliation across reload remains covered. | slice 3 | observed: reloadUntilRead persistence without re-asking GitHub |
| 7 | The already improved real pinned-deployment case is retained unchanged. | slice 4 | observed: git diff vs `658d1fef` is empty (`proof/slice4-pinned-unchanged.txt`) |
| 8.1 | Main may advance after selection. | slice 4 | observed: unchanged pinned case still asserts post-advance isolation |
| 8.2 | Isolated checkout/build/HTTP content remains correct. | slice 4 | observed: unchanged pinned case |
| 8.3 | Curated cartoons/icons remain correct. | slice 4 | observed: unchanged pinned case |
| 8.4 | Origin boundaries remain correct. | slice 4 | observed: unchanged pinned case |
| 8.5 | Process shutdown remains correct. | slice 4 | observed: unchanged pinned case |
| 9 | Pinned-deployment time counts in the selection elapsed total and is not a reduction target. | slice 4 | observed: pinned durations in every slice4 run; no product change |
| 10.1 | Reduce repeated inspections these checks themselves request. | slice 2 | observed: proof/slice2-observations.md removal table; counts 18→6 inspected |
| 10.2 | Reduce repeated assertions these checks themselves request. | slice 2 | observed: proof/slice2-observations.md removal table; reduced mark/assertion repeats |
| 10.3 | Reduce the preparation these checks themselves request. | slice 3 | observed: proof/slice3-observations.md removal table; overlap Claude/publication; thin protection |
| 10.4 | Each removal names the surviving proof of the same promise. | slice 4 | observed: slice2/slice3 removal tables name survivors; no unnamed removal restored |
| 11.1 | Use shared MakeMe. | slice 2 | observed: unchanged MakeMe via takenAgentProfileRecords |
| 11.2 | Use existing external fixtures. | slice 2 | observed: unchanged publishFiles/external fixtures |
| 11.3 | Use real public boundaries. | slice 2 | observed: real publishFiles boundary unchanged |
| 11.4 | Preserve ordinary CI selection. | slice 4 | observed: three titles via unchanged command; ordinary suite membership |
| 12 | A matched whole-command loaded baseline exists with per-check and outside-check seconds and load-independent counts, and is used before further reduction. | slice 1 | observed: PLAN.md Slice 1 baseline + proof/baseline-summary.json |
| 13 | Until a quiet matched baseline for this selection is observed, quiet-host figures that stand in for the ratio remain the retained 45-case median. | slice 4 | observed: ratio used Q≈41.4 s stand-in; quiet matched baseline still absent |
| 14.1 | Judge on a host that supports one worker as the retained baseline's did (one-minute load in single digits). |  | Q1 |
| 14.2 | Three consecutive passing runs. |  | Q1 |
| 14.3 | Each run below 45 seconds. |  | Q1 |
| 15.1 | Do not wait for a quiet host while other work keeps the host busy. | slice 4 | observed: proceeded with busy alternation |
| 15.2 | Alternate the baseline revision and the candidate under the same load. | slice 4 | observed: B1–C5 alternation; baseline temp checkout |
| 15.3 | Record the loads. | slice 4 | observed: per-run load-before/after + summary table |
| 15.4 | Keep the result when the candidate's median elapsed ≤ (baseline median × 45 / quiet-host baseline), together with the reduced counts. | slice 4 | observed: 46.97 ≤ 57.48; reduced counts hold |
| 15.5 | The quiet-host three-run check remains owed to the first quiet opportunity. | slice 4 | observed: reported owed |
| 15.6 | That owed quiet-host check is reported as owed, not claimed. | slice 4 | observed: plan + proof mark owed / not claimed |
| 16 | Run-wide startup that every Dashboard run pays regardless of selection counts in elapsed time and is not changed here. | slice 1 | observed: PLAN.md stop resolution; startup unchanged |
| 17.1 | Former 30-second promise is superseded for this selection by Terry-authorized 45 seconds. | slice 4 | observed: measure uses 45 s / ratio×45 |
| 17.2 | Browser reductions remain aimed at busy-host margin under the default test timeout. | slice 4 | observed: profile margin under load; pending still vulnerable at extreme load |
| 18.1 | Work of the five extracted families (SEED-311–315) does not belong in this selection. |  | E1 |
| 18.2 | Timings of those families do not belong in this selection. |  | E1 |
| 18.3 | No aggregate promise spans this selection and those families. |  | E1 |
| 19 | Local-only archived experiments are excluded. |  | E2 |
| 20.1 | No new internal mocks to manufacture a saving. |  | E3 |
| 20.2 | No wall-clock sleeps to manufacture a saving. |  | E3 |
| 20.3 | No retries to manufacture a saving. |  | E3 |
| 20.4 | No skips to manufacture a saving. |  | E3 |
| 20.5 | No timeout inflation to manufacture a saving. |  | E3 |
| 20.6 | No special runner mode to manufacture a saving. |  | E3 |
| 21 | Follow the project failure policy for failing and flaky tests. | slice 4 | observed: extreme-load pending timeouts attributed on both revisions; not waived as green-by-rerun |
| 22.1 | Small published board shows correct owner and detail. | slice 2 | observed: taken-agent-profile.spec.ts owner/detail on small board |
| 22.2 | Absent and malformed profiles remain distinct. | slice 2 | observed: absent/malformed distinct steps |
| 22.3 | Portrait/icon, viewport, and accessibility proof accompany that case. | slice 2 | observed: portrait/viewport/a11y assertions retained |
| 23 | A mark already proved at one width for one card is not re-inspected for every card at every width unless the width changes what that card shows. | slice 2 | observed: proof/slice2-observations.md unique desktop marks + one narrow recheck |
| 24.1 | Pending Take stays protected through stale/unrelated snapshots. | slice 3 | observed: stale/unrelated snapshots keep actions unavailable |
| 24.2 | Pending Take stays protected through partial accepted snapshots. | slice 3 | observed: partial accepted snapshots keep protection |
| 24.3 | Actions return only after the fully accepted snapshot is read. | slice 3 | observed: actions after fully accepted snapshot enabled Inspect |
| 24.4 | Persisted reconciliation survives reload. | slice 3 | observed: persisted reconciliation survives reload |
| 25.1 | Real preview serves the selected revision after main advances. | slice 4 | observed: unchanged pinned case still covers |
| 25.2 | Source/build isolation is preserved. | slice 4 | observed: unchanged pinned case |
| 25.3 | Assets are preserved. | slice 4 | observed: unchanged pinned case |
| 25.4 | Origin policy is preserved. | slice 4 | observed: unchanged pinned case |
| 25.5 | Shutdown boundaries are preserved. | slice 4 | observed: unchanged pinned case |
| 26 | Quiet host: three consecutive passing ordinary one-worker runs of the three checks each finish below 45 seconds, including all setup and replacement proof. |  | Q1 |
| 27.1 | Candidate and baseline alternate under the same recorded load. | slice 4 | observed: B1–C5 |
| 27.2 | Candidate median meets the stated ratio and reduced counts hold. | slice 4 | observed: 46.97 ≤ 57.48; slice2/3 counts |
| 27.3 | Report states the quiet-host check is still owed. | slice 4 | observed: plan + proof/slice4-* |
| 28.1 | A removed inspection whose promise no surviving check observes is restored. | slice 4 | observed: survivors named in slice2/3 tables; none restored |
| 28.2 | That saving does not count. | slice 4 | observed: no unnamed removal credited |
