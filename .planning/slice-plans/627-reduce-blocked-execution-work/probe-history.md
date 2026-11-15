# Initial native probe and detector repairs

Historical evidence for [the active execution plan](PLAN.md). The initial native
attempt and its failed observation are retained unchanged. This history does
not establish a passing, complete-cost baseline for the resumed comparison.

## Slice 1 observation — invalid native baseline, 2026-11-15

The one authorized baseline froze `45f965a1bb59f049f9828097971d7621c13c64d6`
(not the abandoned implementation), with native Codex 0.169.0, Node 24.21.0,
`gpt-6.1-sol` / `xhigh`, AC power and `caffeinate -s -i`. Prelaunch load was
4.35/4.45/3.84 with 65% memory free; recorded journey load was 4.15/4.41/3.83
to 6.23/5.54/4.65. Literal launch:

```sh
env PATH="/opt/homebrew/bin:$PATH" TMPDIR=/Users/terryyin/tmp/native-comparison \
  caffeinate -s -i Distribution/tests/native-comparison.sh --native codex \
  --case paused-supplier --baseline 45f965a1bb59f049f9828097971d7621c13c64d6 \
  --model gpt-6.1-sol --effort xhigh \
  --save-baseline Distribution/tests/native-comparison/paused-supplier/comparisons/seed356-20261114T233327Z-baseline.json \
  --results-dir /Users/terryyin/tmp/seed356-native-results
```

Terminal exit 2; no usable baseline was exported. The
[case-local stop record](../../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T233920-362e-stop.md)
retains the outcome, exact false-positive commands, partial usage and budget
judgment. Raw attempt:
`/Users/terryyin/tmp/seed356-native-results/codex/native-comparison/paused-supplier/20261114T233920-362e`.
Turns 1–3 held correctly; ordinary absolute workspace reads matched the bare
`native-comparison` detector. No harness source was read. The failed observation
stays unchanged. The coordinator stopped the exact owned Codex group with
`owned_process_group_terminate 97955 97955 15`; the controller retained the
interrupted turn 4, exporter refused it, and all owned PIDs ended.

Whole-task usage is unknown (`retainedUsage.status: unknown`, `totals: null`);
26 observed responses total 1,468,842 partial tokens, not a complete-task result.
No optimization/helper was started and no saving is supported. One invalid
journey of four is consumed; a fresh blocked pair plus unblocked pair need four
more, exceeding three remaining. Stop before any further native run or selection;
a new human budget decision is required. The discovered detector defect is
repaired only with deterministic proof below.

### Accepted deterministic repair proof

The new `Distribution/tests/native-harness-inspection.sh` failed before repair
with `turn 1 inspected the native harness`. Its controlled host actually reads
installed guidance by absolute workspace path. After narrowing the runner's
generated detector to literal controller/source roots and relative harness paths,
the four-turn legitimate-read journey passes; six source/controller/relative/mixed
inspection journeys are rejected by the unchanged observer/assessors.

Passing terminal command (session 82047, exit 0):

```sh
env PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh \
  Distribution/tests/native-harness-inspection.sh \
  Distribution/tests/native-comparison-paused-supplier.sh \
  Distribution/tests/native-comparison-unblocked-supplier.sh \
  Distribution/tests/native-comparison-doughnut-title-precedence.sh \
  Distribution/tests/native-comparison-pairs.sh \
  Distribution/tests/native-comparison-baselines.sh
```

Coordinator inspection confirms `check_journey` observes the actual assessor
verdict and inspection rejection reason. The shared detector API, task/events,
assessors and runtime guidance remain unchanged. Consumer trace:
`/tmp/seed356-inspection-consumer-trace.md`, all 23 consumers dispositioned.
The changed runner's three case families, pair and baseline entry points are
covered by the above checks; the owned-proof-only caller never reaches the
changed pattern construction. Historical archives stay byte-identical.
The [case-local stop record](../../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T233920-362e-stop.md)
retains the bounded result and visible evaluation costs.

Independent refactor returned `## REFACTOR COMPLETE`: one literal-root escape
pass and shared relative-path suffix, with no API or assertion change. All six
checks above passed again (session 68295, exit 0), using
`env PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i bash scripts/test.sh`
with the same six paths. Territory.local was on AC at natural load 16.71/9.65/6.64,
62% memory free; reduced concurrency preserved coverage. Trace:
`/tmp/seed356-refactor-consumer-trace.md`. Refactor elapsed approximately six
minutes; no further native journey. `git diff --check` passed.

CI run `43655558326/1` found inline stream encoding and rejection-helper guard
violations in the new test. Repair reuses the shared substitute encoder and
`native_assessor_rejects_observed`, without guard/detector/assessor changes.
Terminal proof (session 99864, exit 0, fourteen checks):
`env PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh Distribution/tests/native-harness-inspection.sh Distribution/tests/native-stream-replay.sh Distribution/tests/native-assessor-counterexample-guard.sh Distribution/tests/native-comparison-*.sh`.
Trace `/tmp/seed356-ci-guard-consumer-trace.md` covers shared fixture defaults and faults.

## Controlled-increment CI repair

Published `1a4a640e87a5ba76739ba3362e40001e5e41e124` failed
[run 43673938258/1](https://github.com/terryyin/open-dough/actions/runs/43673938258):
the filtered catalog still expected one blocked case, and refresh exceeded its
normalized 64-second budget. Repair preserves the full catalog and exact-byte
recovery, retains digest caching, batches blob reads, and avoids unused or
same-commit payload extraction. Two local 180-second deadline failures also
received an assertion-preserving behavior split. Final targeted proof passed;
Exact repair CI for `8e98d67e2e3712bbaeffbc7e7200f010d622cccc` passed
[run 43679045962/1](https://github.com/terryyin/open-dough/actions/runs/43679045962),
including the unchanged 64/926-second budget gates. No new native
journey was launched. Literal commands, terminal outcomes and consumer tracing
are retained in `/tmp/seed356-repair-handoff.json` and its linked evidence.

Evaluation cost remains visible separately from candidate cost. At
2026-11-15T04:42:37.849Z the active coordinator session snapshot contained 428
unique owned responses and 85,771,321 processed tokens: 84,043,136 cached input,
1,427,330 uncached input and 300,855 output. The existing shared Codex reader
reported no unknown/conflicting usage records. This is a partial whole-session
snapshot, excluding workers, native journeys and later responses. Together with
the known native-journey floor of 10,330,545, the visible combined floor is
96,101,866 tokens, not a complete total, billing claim or measured improvement.
The snapshot is `/tmp/seed356-root-evaluation-usage-snapshot.json`; its source is
the current coordinator rollout `01a1dc65-0f52-7a51-b646-7322bc75ad39`.

## Approved supplier-watch native probe

The [frozen native record](../../../Distribution/tests/native-comparison/supplier-watch/comparisons/seed356-watch-baseline-20261115-opportunity.md)
retains exact preparation CI, the single command, publication timing, authentic
manual watch review and immutable export. Quality passed; reproduction and a
worthwhile removal did not. Budget 3/6 consumed, no candidate/retry. Known native
evaluation now totals at least 19,267,383 processed tokens, including the earlier
partial invalid journey. Adding the already-recorded root snapshot gives a
visible floor of 105,038,704; workers and later coordinator work remain excluded.
These are evaluation costs, not complete billing or an improvement measurement.
