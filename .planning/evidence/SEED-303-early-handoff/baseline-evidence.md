# Historical combined probes and overlap

This record retains runs 1–4 of the original 45-check selection at execution
Take `17a2f12052f50acf1f844855ea2e16b45377a630`: the first unmodified probe,
then measurements after the necessary [repeat request wait correction](repeat-wait-evidence.md).
The later corrected, frozen three-run baseline is in [comparable baseline](comparable-baseline.md);
its implementation and elapsed series are kept separate from these probes.
The historical 260.84-second sum was two separate exploratory invocations.
The [coverage map](coverage-map.md) names all45 selected cases, their distinct
observations, candidate surviving boundaries and faults each must detect.
Candidate proof remains unaccepted until an executable observation establishes it.

## Protocol

macOS host,16 logical CPUs,48GiB memory, awake on AC under `caffeinate -s -i`.
The selected checkout ran locked `npm ci`, native Chromium check and dashboard
typecheck successfully before this probe. The npm download cache, normal
Playwright browser/transform caches and OS filesystem cache were left in their
ordinary state. Dependencies were not copied from another checkout. Each
invocation has a fresh run-artifact owner, current-source app/server/origin
preparation and teardown. No setup is moved outside the timed command.

Literal selector and invocation (replace `$proof_root` with the caller-owned
private evidence directory and use a new JSON/log destination for every run):

```sh
selected='production-watcher-failures\.spec\.ts|production-watcher-updates\.spec\.ts|landed-ci-automatic-repeat\.spec\.ts|story-review-touch\.spec\.ts|cursor-session-scope-continuation\.spec\.ts'
selected="$selected|each Taken card shows its published agent profile|auto refresh rate limit: a rate-limited check waits"
selected="$selected|deployment installs, builds, and serves its pinned commit|sessions a replaced runner last held are revived|a Take.s older snapshot arriving late"
OPEN_DOUGH_DASHBOARD_PROOF_RECORD="$proof_root/run1.json" \
  /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- \
  --workers=1 --grep "$selected" > "$proof_root/run1.log" 2>&1
```

The normal strict reporter is retained. Assess terminal command exit together
with `phase: completed`, `terminal.strictStatus: passed`, selected count and
all attempt outcomes. A running/listed record establishes no passing baseline.
Whole `/usr/bin/time real` includes discovery, all shared/hook/fixture setup,
test bodies and teardown; summed case durations and timeline gaps remain
separate measurements. Tests declared through `productionUpdatePolicies.ts`
and `productionUpdateJourney.ts` belong to the selected updates journey.

## Measurement state

Raw transcript/log/load evidence: `/tmp/seed303-baseline-H5jSFc`.

| Run | Strict result | Whole elapsed | Conditions and disposition |
| --- | --- | --- | --- |
| 1 | Failed:42passed,3failed,0skipped, retry0 | 667.26s shell;665.338s runner | Started2026-11-11T00:57:50Z at load5.07/7.79/9.14 (preceding readiness memory52%free). SEED-287 then started its separately owned controlled-pressure continuation; observed load21.73 at00:59:32Z and22.96 at01:02:51Z. Immediate end load12.66/18.37/15.65; the later headroom check had38%free memory. This is a failed loaded contextual observation, not a comparable idle baseline. |
| 2 | Passed45/45, exit0, retry0/no skips | 296.64s shell;296.024s runner | Parent accepted the necessary causal-wait correction after three focused strict7/7 passes. Immediate load5.41/8.70/10.82→4.52/5.90/8.87; memory40→39%free, awake on AC, no deliberate-pressure worker. Same original45 selector and one worker. |
| 3 | Passed45/45, exit0, retry0/no skips | 323.00s shell;322.400s runner | Same corrected file hash, original45 selector and one worker. Load5.02/5.89/8.76→6.64/6.61/8.31; memory39→41%free,awake on AC. Ordinary production preview and SEED-304 whole-checkout lint were observed; peak sampled1min load8.11, no deliberate pressure. |
| 4 | Failed:44passed,1timedOut, exit1, retry0/no skips | 384.53s shell;383.929s runner | Same corrected hash and original45 selector, one worker. Before load6.54/6.57/8.26,memory41%free,awake on AC. Ordinary production preview briefly112%CPU; no deliberate pressure or heavy competing test at launch. Sampled load later jumped24.26/13.46/10.36; provenance unknown, no live pressure process at inspection. Cursor revival expired its case budget during initial second launch. |

The config’s output directory stamp00:57:50.763Z precedes the reporter’s
`run.startedAt`00:58:39.977Z by49.214s. That is an observed discovery/startup
interval of the full-suite grep selection, not an irreducible final floor.
An ordinary explicit file selection may avoid unrelated discovery. No new
runner mode or timing machinery is justified by this observation.


### Failed-run phase observations

| Proof declaration | Cases | Summed case seconds | First-start to last-end span seconds |
| --- | ---: | ---: | ---: |
| production-watcher-failures.spec.ts | 10 | 123.236 | 142.575 |
| production-watcher-updates.spec.ts | 6 | 44.938 | 61.905 |
| productionUpdatePolicies.ts | 8 | 73.262 | 73.327 |
| productionUpdateJourney.ts | 1 | 17.449 | 17.449 |
| landed-ci-automatic-repeat.spec.ts | 7 | 117.748 | 122.412 |
| production-deployment.spec.ts | 1 | 20.182 | 20.182 |
| responsive-session-reconciliation.spec.ts | 1 | 28.896 | 28.896 |
| auto-refresh-rate-limit.spec.ts | 1 | 29.404 | 29.404 |
| story-review-touch.spec.ts | 4 | 51.520 | 51.544 |
| cursor-runner-replacement.spec.ts | 1 | 13.906 | 13.906 |
| cursor-session-scope-continuation.spec.ts | 4 | 24.705 | 24.722 |
| taken-agent-profile.spec.ts | 1 | 7.558 | 7.558 |

Summed case durations total552.804s. The difference from shell elapsed is not hidden work: it contains normal runner discovery/initialization, shared/hook/worker preparation, inter-test gaps and final teardown. Each declaration span excludes preparation outside its first/last attempt; their sum cannot replace the whole-command elapsed measurement. No subprocess-phase tracing was installed. The existing strict record supports these case/gap observations; it does not attribute individual npm/build/source phases.

### Failed observations remain owned

The recovered, cancelled and uncertain repeat variants failed at `landed-ci-automatic-repeat.spec.ts:106`: the default5s `expect.poll(() => scenario.repeatCalls.length).toBe(1)` expired with0 after successful receipt prepare/accept responses. The variant-specific outcome change had not run. The other42cases passed, but that does not settle these failures. Raw diagnostics and the three traces remain in `dashboard/test-results/2026-11-11T00-57-50.763Z-12371`, and normal output/strict JSON remain at the private evidence directory above.

Bounded inspection: `LandedCiCollection.collect` resolves newest-first landing history before invoking `collectCiFollowUps`; `collected()` serializes and queues a nudge behind an active pass. Receipt200 means ingestion, not completed collection or rerun readiness. Each variant prepares five prior landings. `ciFollowUpScenario` already records actual `actions-workflow-rerun` arrival before invoking its `holdSubmission` callback. That existing callback can resolve an event Promise under the unchanged case deadline, retaining the independent exactly-one assertion. At the initial probe return this was the smallest causal-wait diagnostic/repair candidate and had not yet been implemented or proved. The subsequent correction and its current proof are recorded separately below.

The failed traces retain the default-poll errors, not subsequent provider calls; teardown closes the server immediately. Therefore delay beyond5s versus never-admitted is not yet distinguished by an observed later request. At the initial return no exact active repair owner was established. SEED-287’s syntheticgh optimization was a related cost lead, not proof of ownership or repair. The coordinator subsequently assigned and accepted the separate causal-wait correction before authorizing the comparable baseline below. The sleep log contains no sleep/wake in this run’s window (latest entries were7November), excluding sleep as its cause.

## Comparable baseline implementation basis

Runs2–4 use HEAD `17a2f12052f50acf1f844855ea2e16b45377a630` plus only the
accepted, uncommitted test-wait correction in
`dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts`.
The corrected file’s SHA256 is
`5925c9545a0a83ba51d1fed9ba1b6fff43f4c8f6c2bc1b752277341561bb9894`;
the retained Git diff is `run2-repeat-wait.diff` and its Git blob identity is
`289af503b`. The other runtime/test source, locked dependencies and selector
remain at HEAD. Planning/evidence edits do not change test execution.
The same file hash is checked before each measurement. This is the
pre-optimization baseline of unchanged protections after a necessary wait
repair. No time benefit is attributed to that repair or compared with failed,
pressured run1. A future accepted tree can confirm this implementation basis.

The coordinator accepted the existing-callback request-arrival wait and three
strict7/7 focused passes under the default case deadline before authorizing
these runs. See the separate repair record for literal commands and
observations. G1 remains the coordinator’s acceptance responsibility. The
original pressured trace still cannot establish whether its admission arrived
late or never happened; the narrower synchronization defect and its current
proof are stated independently.

## Third attempted baseline: Cursor lifetime prerequisite fails

Run4 failed at `cursor-runner-replacement.spec.ts:84`, in
`launchSecondHeldSession` at `cursorSessionRecovery.ts:182`, before its revival
subject. The second Start button was present and enabled. The trace shows
14.128s before hooks (origin fixture10.718s; dashboard2.875s nested),9.541s
waiting for first input acceptance, and two initial story action clicks of
about3s each. The final second Start click had only350.5ms before the unchanged
30s case budget expired. This is exhaustion by incidental initial lifetime
preparation, not evidence of a broken Start locator or a revival regression.

Raw trace/error context: `dashboard/test-results/2026-11-11T01-34-53.967Z-1996/`
under `tests-sessions-cursor-runn-a4212--third-launch-stays-running-chromium`.
Bounded parsed events are retained at
`/tmp/seed303-baseline-H5jSFc/run4-cursor-trace-summary.json`.
The sleep log has no sleep/wake during this run. Sampled load rose from4.20
at09:38 to24.26 at09:41; no contemporaneous live pressure/test process supplied
its provenance. Attribution to external load does not dispose of the failure.

SEED-287’s lifetime helper is a relevant reuse lead, but its accepted changes
target helper-survival and replacement-controls; this full revival spec is
unchanged there. At that stop, no exact active repair owner or accepted fix was proved for
this newly observed failure. No retry or further baseline was launched. All
seven repeat cases passed in run4, but the complete selection remains failed.
At that return, repair/coordination and three comparable passing observations
remained outstanding; runs2/3 alone did not complete slice1. The subsequent
[Cursor correction](cursor-repair-evidence.md) and [frozen cohort](comparable-baseline.md)
retain the later accepted work without erasing this failed verdict.

## Provisional cost order from the two passing observations

| Family | Cases | Summed case seconds, runs2–3 |
| --- | ---: | ---: |
| Watcher failure plus updates | 25 | 104.537–118.747 |
| Touch review | 4 | 54.332–56.635 |
| Cursor revival plus scope continuation | 5 | 37.943–40.824 |
| Repeat admission and outcomes | 7 | 32.525–41.924 |
| Rate limit | 1 | 21.655–21.696 |
| Pending Take | 1 | 9.216–10.036 |
| Pinned deployment | 1 | 8.337–8.358 |
| Taken profile | 1 | 7.937–8.637 |

Runner time outside summed cases was16.378/18.707s; before-selection intervals
were4.288/4.429s. These are ordinary measured costs, not irreducible floors.
The fastest passing whole command296.64s is266.64s above the30s bound. No
improvement is claimed from these pre-optimization observations or from their
difference from the pressured failed run. The supported next independent probe
remains minimal real deployment preparation, because its measured8.3s body
already consumes the illustrative8s watcher-plus-pinning allocation before any
watcher lifecycle. That allocation requires an observed preparation/build gain;
it is not an accepted budget. Follow with the stateful watcher and actual
request-owner probes, preserving all map obligations and the binding threshold.

## SEED-287 ownership and accepted overlap

Trunk/source comparison at probe entry: `origin/main` was82342b0488; changes
since this execution Take were planning-only. SEED-287’s published execution
branch at8f52f39fb had not landed on trunk. Its plan’s completed slices and
proof below are branch-accepted evidence and useful candidate inputs, not
implemented changes in this checkout. Do not duplicate or overwrite that owner.

- Slice3 preserves the same liveC through outage into failedD/failed restore,
  moves SIGHUP quiet exit/cleanup onto the existing restart journey, and removes
  the standaloneC reactivation. Its actual no-opHUP/stale-parent fault checks
  discriminate the retained proof. See SEED-287 `watcher-evidence.md`.
- Slice4 shares one immutable current full-source Git snapshot through the
  existing run-artifact owner, while retaining private mutable fixture repos,
  HOME and initially empty origins and real install/build/start. Its three
  original32/changed31 two-worker family pairs median156.894→136.401s,
  saving20.493s. Cold snapshot3.532/3.352/3.461s is charged inside elapsed.
  These two-worker branch measurements are not this story’s one-worker baseline
  or a universal20.49s saving. See `source-ingestion-evidence.md`.
- Slice6 reduces a still-overflowing touch line and overlaps exact required
  cold inputs through the established worker/run owner. Three default30s
  four-case pressure passes retain real native reading/rotation geometry.
  Touch/preparation/pageTest/intent-comparison files remain actively edited in
  that checkout; do not write there. See `touch-evidence.md`.
- Slice10 establishes two necessary real execution/native lifetimes at the
  public launch boundary for helper-survival/replacement-controls. Full revival
  spec remains unchanged; last-held-key proof alone does not establish revival.
  Three4-case families passed there, with11 unchanged UI/model/scope owners
  inspected/passed before removing initial UI. See `cursor-evidence.md`.
- Slice11 changes the existing syntheticgh transport while preserving argv,
  binary output, status, auth/holds,PID/signals and cleanup. It affects setup
  across these families. Its measured source/sort family proof and all moved
  work belong to that execution. See `transport-evidence.md`.
- Its slice12 controlled-pressure comparison continuation was active during run1 (PID7819 ended by01:09Z),
  followed by final default/full-suite/hosted/shard obligations in slice13.
  Neither that owner’s unfinished proof nor its uncommitted files are claimed
  by this story.

No hosted/local failure of that execution is excused by attribution. This
probe retains [the failure policy](../../../AGENTS.md#failing-and-flaky-tests)
as written, and coordination only applies where an actual active owner holds
the exact repair.

## Remaining premise and next experiment

The working count hypothesis stays30 distinct checks from45. The map finds
one branch-supported removal candidate (standalone post-HUP C restart),
but its existing retained restart currently requires a full seven-case serial
family. It is not a free net reduction; all necessary proof must be counted. All other substitutions remain hypotheses. Pure qualification,
last-held keys, settlement helpers and unknown-verdict checks do not by
existence prove their stateful browser/process counterparts.

The parent’s bounded slice4 inspection found that production request admission
still calls fixed `Date.now()` in `KeptAdmissions.refusal/answered` and
`ReadAdmission.endOfTurn`; existing `heldBack(now)`/`answered(answer, now)`
public policy inputs may prove deadline logic separately. Controlled time
through the actual request-owning process is not already an established
runtime contract. Inspect that prerequisite before a released-owner change;
retain the plan’s stop for a wider authority/contract decision. No clock,
routing or credential path is changed by this probe.

Slice2’s smallest supported real deployment/source preparation remains the
next independent cost probe after baseline acceptance. Slice3 must carry the
accepted SEED-287 overlap, then establish minimum genuine watcher/stateful Git
proof before deleting stages. The historical provisional cost order above is
not combined with the later [corrected cohort](comparable-baseline.md).
The final under-30-second/count outcome remains open. No threshold, coverage
or production-boundary promise is weakened here.
