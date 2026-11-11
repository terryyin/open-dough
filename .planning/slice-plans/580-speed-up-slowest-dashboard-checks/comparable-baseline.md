# Comparable baseline after necessary test corrections

Three consecutive ordinary runs of the original 45-case selection strictly
passed. Whole elapsed was **266.38 / 287.15 / 303.80 seconds**, median
**287.15 seconds**. This establishes the corrected pre-optimization baseline;
it proves no under-30-second result or reduction in maintained checks.

The [historical probes](baseline-evidence.md) retain failed runs 1/4 and the
earlier passing runs 2/3. Their implementations or conditions differ; they are
not combined into this cohort, and no saving is claimed across them. The
historical 260.84 seconds was two separate exploratory invocations.

## Frozen implementation and preparation

Execution checkout and branch remain those in [execution context](execution-context.md).
HEAD was `17a2f12052f50acf1f844855ea2e16b45377a630` plus the accepted necessary
[repeat wait](repeat-wait-evidence.md) and [Cursor setup](cursor-repair-evidence.md)
corrections. No further test/product/fixture change preceded these measurements.

| Execution input | SHA256 |
| --- | --- |
| `dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts` | `5925c9545a0a83ba51d1fed9ba1b6fff43f4c8f6c2bc1b752277341561bb9894` |
| `dashboard/tests/sessions/cursor-runner-replacement.spec.ts` | `2d57e0ea77d0eff3b60b5170600e68fd8f6e20debec0f11a8b406961533d7ad4` |
| `dashboard/tests/support/heldCursorExecutions.ts` | `0ae6e71bb718f521d385ecff874a783d9c488d9328da0f268503a401aa8f657f` |

After this frozen cohort, mechanical delivery removed an unnecessary `async`
from the repeat outcome callback and explicitly returned `Promise.resolve()`.
The same signal and already fulfilled hook Promise preserve the observed path;
see [delivery correspondence](repeat-wait-evidence.md#mechanical-delivery-correction).
The delivery repeat-spec SHA256 is `387af5c4b67f80b175bebafe28f2cbbb196408381cc75540215363720bc78583`;
the table above records the actual measured bytes. No new timing is claimed.

The helper is byte-identical to committed SEED-287 source at
`84afbf850a1ca41f62c599122adf9cc981376a77`, Git blob
`95520703216e4e44ee0aa4a13860bbea7b887a4a`, at its canonical path. Only that
helper was reused; the other checkout and its uncommitted work were untouched.
The coordinator's pre-cohort freshness basis was trunk
`28cf896d38d64aaff6af0f7c3954704ff360f169`; SEED-287 had not landed there.

All changed/untracked checkout inputs, including evidence, stayed frozen
through this cohort. Before each run and after the final terminal result,
all 10 changed/untracked file hashes/modes and the tracked diff matched the
initial snapshot. Diff SHA256 was
`71e0ca1c5639c85112d4e6acbe4c025b8528b43b56bdb87b53a111a50a34a2cd`.
Those private snapshots describe the measured inputs; these records were
written only after the final freeze check. The three execution-file hashes
above allow a later accepted tree to identify the same implementation.

Locked `npm ci`, native Chromium validation and dashboard typecheck had already
passed in this exact checkout. No acquisition ran between measurements.
Normal npm download, Playwright transform/browser and OS caches were retained;
no artifact was prebuilt outside the timed command. Each invocation paid for
its own run-artifact owner, current-source preparation, app/server/origin work,
all test/hook/fixture work and teardown. No shared mutable install was copied.

## Literal command and strict observations

Each invocation used the following command with `run=5`, then `6`, then `7`.
The actual private evidence directory is shown; reproduction needs a fresh
parent directory and unused proof destinations.

```sh
proof_root=/tmp/seed303-baseline-H5jSFc
selected='production-watcher-failures\.spec\.ts|production-watcher-updates\.spec\.ts|landed-ci-automatic-repeat\.spec\.ts|story-review-touch\.spec\.ts|cursor-session-scope-continuation\.spec\.ts'
selected="$selected|each Taken card shows its published agent profile|auto refresh rate limit: a rate-limited check waits"
selected="$selected|deployment installs, builds, and serves its pinned commit|sessions a replaced runner last held are revived|a Take.s older snapshot arriving late"
run=5
OPEN_DOUGH_DASHBOARD_PROOF_RECORD="$proof_root/run$run.json" \
  /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- \
  --workers=1 --grep "$selected" > "$proof_root/run$run.log" 2>&1
```

All three terminal command exits were 0. Each record has schema 1,
`phase: completed`, runner/strict status `passed`, 45 selected cases and
45 passed attempts, retry/repetition index 0, with no skips. The complete
project/file/title identity set matches the original 45-case selection.
No narrower selector or additional UI test was credited as replacement proof.

Setup and observing assertions remain mapped in the [45-case coverage map](coverage-map.md).
The actual boundaries include published Git/main and real builds/previews,
watcher faults/baselines/signals/cleanup, real receipt collection and exactly-one
rerun with every outcome, browser/request-owner pacing, published profile data,
real native touch/rotation, real Cursor publications/PTY/scope/revival, and the
pending Take's stale/unrelated/partial/full snapshot sequence. The necessary
Cursor helper constructs two real execution/native preconditions; stale joins,
the third UI launch, automatic revival and persisted/visible assertions still
run in the selected case. The repeat callback observes the real POST before
the independent exact request and outcome assertions.

## Host and elapsed comparison

Same 16-logical-CPU, 48-GiB macOS host, awake on AC under `caffeinate -s -i`.
Each pre-launch inspection supported one worker; no deliberate pressure or
competing heavy test was observed. Ordinary application/VM/system activity
remained. Immediate command metadata, rather than preceding readiness samples:

| Run | UTC start | Load before → after (1/5/15 min) | Memory free before → after |
| --- | --- | --- | --- |
| 5 | 02:00:02 | 3.28/4.01/5.42 → 5.08/5.12/5.57 | 46% → 45% |
| 6 | 02:05:21 | 4.06/4.83/5.44 → 3.14/4.63/5.30 | 46% → 43% |
| 7 | 02:10:40 | 3.00/4.41/5.18 → 5.19/4.50/4.97 | 44% → 44% |

| Measurement, seconds | Run 5 | Run 6 | Run 7 |
| --- | ---: | ---: | ---: |
| Whole `/usr/bin/time real` | 266.380 | 287.150 | 303.800 |
| Runner total | 265.811 | 286.538 | 303.263 |
| Summed case durations | 248.642 | 270.800 | 268.643 |
| Runner outside summed cases | 17.169 | 15.738 | 34.620 |
| Before-selection interval, included above | 4.262 | 3.811 | 4.229 |

The before-selection interval is from the config output stamp to reporter
start. The remaining runner difference includes shared/hook/worker preparation,
inter-case gaps and teardown; the existing transcript does not attribute
individual install/build/source phases. Run 7's larger unallocated interval is
retained in whole elapsed. These are measured costs, not irreducible floors.
Normal host and touch timing varied despite identical inputs; report the full
range and median, with no causal claim from different loads.

## Family costs and next probes

Summed case seconds below remain distinct from whole elapsed and family spans.

| Proof family | Cases | Run 5 | Run 6 | Run 7 |
| --- | ---: | ---: | ---: | ---: |
| Watcher failures | 10 | 47.777 | 52.919 | 44.106 |
| Watcher updates, including both declaration helpers | 15 | 60.913 | 58.928 | 60.904 |
| Repeat admission and outcomes | 7 | 30.216 | 30.209 | 31.979 |
| Pinned deployment | 1 | 8.629 | 7.969 | 8.197 |
| Pending Take | 1 | 8.681 | 9.033 | 8.990 |
| Rate limit | 1 | 21.575 | 21.624 | 20.450 |
| Touch review | 4 | 33.083 | 51.362 | 52.069 |
| Cursor revival | 1 | 10.070 | 9.874 | 11.835 |
| Cursor scope continuation | 4 | 20.632 | 20.817 | 21.760 |
| Taken profile | 1 | 7.066 | 8.065 | 8.353 |

Watcher bodies dominate at 105.010–111.847 seconds, followed by touch
33.083–52.069, Cursor 30.691–33.595 and repeat 30.209–31.979. Rate pacing still
pays roughly 20–22 seconds. All displaced proof must stay inside future timing.

Keep the planned next probe at the smallest real pinned deployment: its current
8-second body already consumes the illustrative watcher-plus-pinning allocation.
A proposed worthwhile hypothesis is a simpler supported fixture with a matched
2–4-second whole-pinning reduction. Measure that before extending it; do not
multiply a single-case saving across stages without observing the actual family
and all moved work. The minimum genuine build/preview floor remains open.

Then test fewer real watcher stages/stateful Git proof. Removing only source
copy or a serial case label does not establish the needed combined gain.
The rate-limit experiment has a conditional roughly 18–20-second opportunity
from paid deadlines, but controlled time must reach the actual request owner.
Its current fixed-clock process contract and the plan's wider-authority stop
remain unresolved; policy inputs alone are not equivalent browser/admission proof.

The working 30-check target stays a hypothesis. Existing HUP/restart proof
currently brings a seven-case serial dependency; no free net-one removal is
credited. Establish every mapped fault before deleting proof. SEED-287 watcher,
touch and transport work remains owned and unlanded; only the canonical Cursor
helper has been explicitly reused and proved here.

The median command is 257.15 seconds above the binding 30-second threshold.
Known observations do not yet establish a strategy that closes that gap.
Minimum source/build cost, stage reduction, cheaper coherent UI/session/repeat
proof, final materially lower count and three under-30-second passes remain
open premises for their owning experiments. No promise or threshold is relaxed.

## Inspectable evidence

Private root: `/tmp/seed303-baseline-H5jSFc`. `run5/6/7.json` are the original
strict transcripts; matching logs retain exact `time` output and exits/load/
power/memory sidecars. `run5/6/7-summary.json` and
`frozen-cohort-summary.json` contain derived phase calculations only.
`run5/6/7-input-basis.json` and `cohort-end-input-basis.json` retain the matching
input identities; associated diffs retain the measured uncommitted basis.
No raw log or duplicate completion note is added to the repository. All three
commands ended; no verification watch remains. Coordinator acceptance still
owns statuses, source commitments, G1/G2 disposition and delivery.
