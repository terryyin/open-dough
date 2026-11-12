# Dashboard checks selected for faster feedback

The production dashboard's landed CI cache held the passing [run 42924665989,
attempt 1](https://github.com/terryyin/open-dough/actions/runs/42924665989) at
7eab3d6ca. It completed on 11 November 2026 at 07:40:53 Singapore time.
The Playwright reports for all 13 shards reconciled exactly to the cache's
994 Dashboard file entries, 2,619 case outcomes and 10,581.107 summed case
seconds. This includes browser, backend and frontend tests. There were 2,611
passing cases and eight other outcomes. The slowest shard took 271.7 seconds
of runner elapsed and contained none of the five individual leaders.

## Five individual cases

| Case | CI case seconds | Local case seconds | Observed cost |
| --- | ---: | ---: | --- |
| [Taken cards show their published agent profile](../../dashboard/tests/stories/taken-agent-profile.spec.ts#L25) | 26.288 | 6.491 | The desktop and narrow mark step took 9.611 seconds. Portrait checks took 4.639 seconds. Repeated column settling, inspection, image loading and geometry dominate the CI case. |
| [Auto-refresh honors the rate limit](../../dashboard/tests/observation/auto-refresh-rate-limit.spec.ts#L75) | 26.036 | 21.594 | The request owner's real clock holds back reads through a two-second retry and a reset beyond the 15-second refresh pace. The restore step took 18.735 seconds in CI. [SEED-315](../seeds/SEED-315-provider-rate-limit-checks.md#speed-up-provider-rate-limit-checks) removed these waits; the candidate entry it resolved is recoverable at `2ed4aa4fb:.planning/TEST-OPTIMIZATION-CANDIDATES.md` (`#auto-refresh-rate-limit-real-waits`). |
| [Deployment serves the pinned revision](../../dashboard/backend-tests/runtime/production-deployment.spec.ts#L61) | 25.741 | 8.896 | A real Git fixture, pinned fetch, npm install, build and preview. Local subprocesses accounted for 2.645 seconds in Git, 1.413 in npm ci and 1.785 in the build. |
| [A replaced Cursor runner revives its held sessions](../../dashboard/tests/sessions/cursor-runner-replacement.spec.ts#L84) | 23.927 | 11.263 | The first input, second launch record and third launch record took 4.460, 2.875 and 1.859 seconds to observe in CI. Opening the existing terminals and replacing the runner are separate state transitions. |
| [A pending Take stays protected through stale and unrelated revisions](../../dashboard/tests/launches/responsive-session-reconciliation.spec.ts#L46) | 23.814 | 10.130 | The held push and publication waits took 2.864 and 1.899 seconds. The failed comparison, independently arriving profile and final seed read add further observable transitions. |

## Five leading cached file entries

| Entry | Cases | CI case seconds | Local case seconds | Observed cost |
| --- | ---: | ---: | ---: | --- |
| [Production watcher failures](../../dashboard/tests/runtime/production-watcher-failures.spec.ts) | 10 | 129.164 | 44.677 | Serial real staging, build and preview failure, retry, restoration, restart and cleanup. The earlier five cached passing runs ranged from 92.455 to 155.592 case seconds. |
| [Production update policies](../../dashboard/tests/runtime/productionUpdatePolicies.ts) | 8 | 92.748 | 31.452 | Three policy cases activate a new deployment and one stages a fault. The other cases observe the same serial watcher's qualification decisions. The owning [updates spec](../../dashboard/tests/runtime/production-watcher-updates.spec.ts) also registers seven cases in two other declaration files. Include them in timing so shared staging is charged once across all 15 cases, 157.089 CI case seconds. |
| [Landed CI automatic repeat](../../dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts) | 7 | 59.215 | 36.853 | Each case repeats five predecessor landings, receipt ingestion, collection and admission. The observable POST wait cost about 2.9–3.9 seconds per case in CI and 1.85 seconds locally, including collection and poll cadence. |
| [Story review by touch](../../dashboard/tests/review/story-review-touch.spec.ts) | 4 | 58.948 | 25.546 | Each case opens a 64-file comparison. Two wide-line cases drove 53 native drag strokes and 212 touch moves in a separate local trace. CI's Playwright step totals omit some protocol activity. |
| [Cursor scope continuation](../../dashboard/tests/sessions/cursor-session-scope-continuation.spec.ts) | 4 | 56.970 | 23.959 | Four different outcomes repeat an execution launch. Observing first input acceptance took 16.285 CI seconds across these cases. |

The two watcher journeys used 16 local staging installs and 16 staging build
invocations. Thirteen builds succeeded, two hit deliberate faults, and one was
cancelled. The updates journey also installed its development fixture once.
Both local profiles passed with one worker on AC power at 62f8c5162, with
Playwright step and subprocess timings captured in temporary files. The
40-case family profile took 200.73 seconds elapsed and the five-case profile
60.11 seconds. Their sum is exploratory because each invocation paid startup
and had its own cache and load conditions.

## Reproduce the starting selection

Use the normal Dashboard runner with installed dependencies. The expression
includes all tests registered by the five leading suites and precisely the
five individual leaders. At preparation revision 5a5f5e922 this selection
lists 45 cases. Remove list mode for the timed baseline.

~~~sh
selected='production-watcher-failures\.spec\.ts|production-watcher-updates\.spec\.ts|landed-ci-automatic-repeat\.spec\.ts|story-review-touch\.spec\.ts|cursor-session-scope-continuation\.spec\.ts'
selected="$selected|each Taken card shows its published agent profile|auto refresh rate limit: a rate-limited check waits"
selected="$selected|deployment installs, builds, and serves its pinned commit|sessions a replaced runner last held are revived|a Take.s older snapshot arriving late"
proof_dir=$(mktemp -d)
OPEN_DOUGH_DASHBOARD_PROOF_RECORD="$proof_dir/selection.json" \
  npm run --silent test:dashboard -- --workers=1 --list --grep "$selected"
~~~

For the timed baseline use a fresh proof-record destination for each attempt,
omit list mode, and measure the entire command with /usr/bin/time -p. On
macOS under AC power run npm under caffeinate -s -i. Read the
[strict runner transcript](../../dashboard/tests/proof-record.md) with the
command exit. Keep the normal reporter. A passing list establishes
selection only. The final selector follows the retained promises and includes
any existing checks credited with replacement proof.
