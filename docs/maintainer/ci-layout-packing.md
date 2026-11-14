# CI layout ranking — 2026-11-14

This is an artifact-first exploratory ranking for SEED-350, before candidate
selection or workflow implementation. No candidate below is kept or measured.
The [active protocol](ci-layout-measurements.md#prospective-protocol--2026-11-14)
allows one selected candidate and at most six workflows; that screen cannot
complete the story's repeated no-worse solo/overlap proof or remaining search.
The [failure policy](../../AGENTS.md#failing-and-flaky-tests) applies as written.

## Exact current evidence

B is `55da0eecf6803945b66d5a23b00dd7802374550d`, frozen as
`codex/seed-350-ci-screen-baseline`. Existing push
[43575040009/1](https://github.com/terryyin/open-dough/actions/runs/43575040009)
succeeded. Its [exact-attempt record](ci-layout-evidence/43575040009-attempt-1.jsonl)
retains all run/job timestamps, setup, artifact inventory and complete proof.
It took **296 seconds** from creation to last required completion, with
21 initial / 22 total jobs, 3,933 runner-seconds and a maximum 80-second queue.
The longest test host was integrated 1/5 at 266 seconds; proof used 24 seconds.
Their 290-second queue-free chain is a diagnostic reference, not acceptance.

All five entries had every declared part present and no failed result:
652 unique discovered checks (651 Distribution file units plus the outside
self-installation check), and 2,829 unique browser case identities/outcomes
(2,821 expected, eight skipped). Browser spec selections were E2E 307,
integrated 270, frontend 57 and backend 434. Proof may name imported case
modules as files; spec counts cannot replace case identity comparison.
Every browser HTML report recorded `actualWorkers: 4`. Distribution slot count
was not logged; its code derives `getconf _NPROCESSORS_ONLN`. Four Distribution
slots below are a model assumption, never an observed fact.

The read-only `060c09c94` to `55da0eecf` diff included E2E case-module moves,
spec renames and source metadata. Earlier artifacts therefore cannot establish
this exact workload. The current run supplied every newly unrecorded duration:

| Newly recorded Distribution check suffix | Observed seconds |
| --- | ---: |
| `native-comparison-doughnut-title-precedence.sh` | 1.1 |
| `native-comparison-incomplete.sh` | 13.4 |
| `native-comparison-pairs.sh` | 14.9 |
| `native-comparison-paused-supplier.sh` | 9.7 |
| `native-comparison-refresh.sh` | 24.4 |
| `native-comparison.sh` | 0.2 |
| `support/native-codex-session.test.mjs` | 0.2 |

The [typed model records](ci-layout-evidence/packing-20261114.jsonl) retain
input hashes, all 40 existing/refreshed group-count estimates, per-share work,
20 baseline calibration observations, 45 historical group observations and
these whole-layout hypotheses. Raw artifacts and inspectable scripts remain
under `/tmp/seed350-ci-layout-20261114/packing/` and its `M55da-*` siblings.

## Method and uncertainty

Used the real `scripts/share-deal.mjs` through `scripts/test-shares.mjs`;
no product optimizer, scheduling code or test was added. Discovery listed
checks/specs without running them. Copied every list and indexed part to
scratch, refreshed there from every exact-current timing artifact, and dealt
all counts using both existing and refreshed weights. Current discoveries and
timing labels matched exactly, with zero missing/extra labels in every group.
Refresh uses the existing runner-factor normalization, preserving list speed:
Distribution 1.006, E2E 0.809, integrated 0.669, frontend 0.591, backend 0.800.
The unrounded factors are used by the owner; printed factors are rounded.

Raw current work totals are 2,221.8 / 4,167.5 / 3,196.3 / 142.5 / 2,238.3
seconds for Distribution / E2E / integrated / frontend / backend. These totals
are work, not job wall times. Playwright runs fully parallel cases, with serial
files and shared hooks. The model keeps every serial-annotated file indivisible
(including the 121.1-second production update chain), splits other files into
recorded case durations, and spreads their remaining shared-hook work across
those cases. Four-worker list scheduling and a separate indivisible-file
schedule provide two approximations; neither reproduces native dispatch order.

For each actual baseline part, compare modeled execution with its suite-step
wall time, then add observed outside-suite time (checkout, acquisition,
uploads and cleanup). Central estimates use median residual/setup; cautious
estimates use maximum residual/setup and the slower scheduling approximation.
Baseline non-task residuals are roughly 8–19 seconds. Observed outside-suite
ranges are Distribution 17–22, E2E 21–31, integrated 19–35, frontend 28 and
backend 20–28 seconds. These intervals are sensitivity estimates, not confidence
intervals or guaranteed bounds. Different packing may change fixture repetition,
CPU contention, setup, scheduling gaps and runner speed.

The nine older successful diagnostic runs (eight matched-block runs plus C2)
have different workload and confounded load. For common labels with current
recorded durations at least two seconds, their per-run median old/current
ratios ranged Distribution 0.696–1.017, E2E 0.746–0.974, integrated
0.939–1.180, frontend 0.913–1.504 and backend 0.953–1.143. Outside-suite
ranges reached 15–32 / 17–44 / 18–41 / 20–31 / 18–38 seconds respectively.
These observations expose variation wider than the proposed headroom; they
are not matched causal comparisons or adoption proof. Queueing, background
work and account-wide activity remain outside this queue-free model.

## All count frontiers

Maximum estimated runner seconds per test host, rounded to whole seconds.
The full per-share estimates and normalized work are retained in JSONL.

| Group | Count | Existing weights | Refreshed weights |
| --- | ---: | ---: | ---: |
| Distribution | 4 | 196–206 | 170–180 |
| Distribution | 3 | 224–233 | 216–226 |
| Distribution | 2 | 326–336 | 309–319 |
| Distribution | 1 | 587–596 | 587–596 |
| E2E | 6 | 246–254 | 213–221 |
| E2E | 5 | 258–266 | 248–256 |
| E2E | 4 | 318–327 | 300–308 |
| E2E | 3 | 400–408 | 388–395 |
| E2E | 2 | 615–622 | 560–568 |
| E2E | 1 | 1081–1088 | 1081–1088 |
| Integrated | 5 | 255–267 | 203–214 |
| Integrated | 4 | 245–256 | 243–254 |
| Integrated | 3 | 315–326 | 310–321 |
| Integrated | 2 | 448–458 | 443–454 |
| Integrated | 1 | 843–854 | 843–854 |
| Frontend | 1 | 78 | 78 |
| Backend | 4 | 200–208 | 179–187 |
| Backend | 3 | 241–248 | 226–234 |
| Backend | 2 | 328–336 | 319–327 |
| Backend | 1 | 600–607 | 600–607 |

## Ranked whole layouts

Counts are Distribution / E2E / integrated / frontend / backend. Every row
retains all logical producers and a separate final proof job. Verdict estimates
add the observed 24-second proof job to the modeled critical host; they exclude
queues and dependency dispatch latency. These are hypotheses, not measurements.

| Priority / ID | Counts; placement | Initial / total | Queue-free verdict seconds | Classification |
| --- | --- | ---: | ---: | --- |
| 1 / H1 | 3/5/4/1/3; fresh weights; frontend + lint | **16 / 17** | **272–280** | Strongest screen hypothesis; 10–18 s modeled headroom to B's 290 s chain |
| 2 / H3 | 3/6/4/1/3; fresh weights; frontend + lint | 17 / 18 | 267–278 | More headroom for one extra job |
| 3 / H2 | 3/5/4/1/3; fresh weights; lint separate | 17 / 18 | 272–280 | Count-only fallback; no cohosting logic |
| 4 / H4 | 3/5/4/1/3; existing weights; frontend + lint | 16 / 17 | 282–290 | Narrower headroom; fresh evidence favors refresh |
| 5 / H5 | 3/6/5/1/4; existing weights; lint separate | 20 / 21 | 279–291 | Prior D3-only hypothesis, current workload |
| 6 / H6 | 4/6/5/1/4; existing weights; frontend + lint | 20 / 21 | 279–291 | Packing-only fallback; current critical path persists |
| R1 | 2/5/4/1/3; fresh; frontend + lint | 15 / 16 | 333–343 | Predicted Distribution bottleneck risk; unmeasured |
| R2 | 3/4/4/1/3; fresh; frontend + lint | 15 / 16 | 324–332 | Predicted E2E bottleneck risk; unmeasured |
| R3 | 3/5/3/1/3; fresh; frontend + lint | 15 / 16 | 334–345 | Predicted integrated bottleneck risk; unmeasured |
| R4 | 3/5/4/1/2; fresh; frontend + lint | 15 / 16 | 343–351 | Predicted backend bottleneck risk; unmeasured |

H1's central estimated runner consumption is approximately 3,772 seconds,
versus B's observed 3,933; that saving is modeled. Sequential frontend and
lint share checkout/Node/npm. Their observed test and lint/typecheck work
suggests a 215–233-second host, below H1's E2E critical host. Keep frontend's
existing producer/caller and use the reusable browser workflow's optional
lint capability, with independently guarded lint and typecheck steps. Keep
frontend tests/reports observable if lint fails, and lint/typecheck observable
if frontend tests fail. Concurrent four-worker groups on one runner are unknown:
CPU oversubscription makes additive timing inappropriate.

A proof job merged into a host that starts after every producer would add its
other work to the critical tail (frontend + lint + proof around 463 seconds
with H1's critical test host), so that placement is predicted infeasible.
An initially running host that waits for other producers and then summarizes
could remove the proof job/setup, but requires a new artifact/job barrier,
occupies a runner while waiting, and lacks measured failure/cancellation behavior.
It stays unknown and outside this first implementation. Frontend on a D3 or
backend3 host adds about 50 suite seconds plus browser setup to a 216/226-second
host; lint offers more slack. Further combinations, simultaneous cohosting and
proof waiting remain search questions, not measured rejections or a count floor.

## Required owners before H1 can be screened

- `.github/workflows/ci.yml`: counts 3/5/4/1/3; remove standalone lint;
  request optional lint on the existing frontend caller; proof declaration
  `Distribution=3:file`, E2E/integrated/frontend/backend = 5/4/1/3 cases.
- `.github/workflows/browser-test-group.yml`: optional lint capability using
  existing setup and artifact/proof path; independently guarded lint acquisition,
  lint and typecheck. Preserve each group's settings, command, worker policy,
  deadline, producer identity, reports and partial-failure proof.
- All five duration-list owners and indexed parts: refresh from current exact
  evidence, retaining normalization/source. Scratch refresh leaves browser files
  at 22/136/159 E2E, 22/90/168 integrated, 61 frontend and 66/173/205 backend
  lines. No additional browser owner exceeds 250 lines.
- Distribution `longest-first`: currently 660 lines/645 recorded labels;
  refresh would be 667 lines/652 labels. Before editing, settle its coherent
  index parts: root shell/outside checks 102, support 208, execute-plan 261
  split into CI versus other lifecycle tests, and other skill checks 81.
  A candidate CI seam (`ci-`, `github-`, `notify-`, `watch-ci-`, `observer-owner-`)
  has 123 labels, leaving 138 lifecycle labels. Root owns the exact seam decision.
  Reuse existing `# Include:` storage; do not add a format or library.
- `Distribution/tests/time-budget`: retain per-check 64 and review aggregate
  926 for three shares. Refreshed normalized maximum share work is 738 seconds;
  current B's four-share aggregate is 694. This repacking budget is not speed
  evidence. Two/one shares would need separately reviewed aggregate budgets.
- Existing workflow contract tests reached by the counts/budget/placement:
  `ci-browser-groups`, `ci-proof-actions`, `ci-proof-declaration`,
  `browser-group-shards`, `test-runner-deadline-cutoff` under
  `Distribution/tests/support/`. Root already resolved MakeMe/page-object entry
  rules for these owners. Resolve any additional test owner before editing it.

Smallest focused verification: verify exactly-once allocation unions for all
652 checks and 307/270/57/434 specs; compare parsed duration maps before/after
index partitioning; run the five existing workflow checks, including a focused
cohosting failure-path assertion and workflow static validation. Use existing
`duration-list.test.mjs` / `test-shares.test.mjs` for changed index/refresh reach;
run `test-runner-budget.sh` if its budget owner changes. Preserve the maintained
macOS AC sleep guard for authorized local checks. Full tests, actual producer
outcomes and exact current case identities/outcomes are then owned by hosted
proof, compared with B; local checks cannot establish runtime headroom.

No formatter, hook, test, benchmark, commit, publication, experiment dispatch or
product implementation was performed in this analysis. Scratch commands were
`acquire-packing-run.py`, `prepare.py` (real CLI refresh), `deal.mjs` (real dealer
and discovery only), `model.py`, `variation.py` and `record.py`, run from this
owned checkout. Root must select a candidate and settle the list seam before
implementation; the six-run cap and all original final proof/search obligations
remain active.

## Selected H1 implementation — practical adoption after early closure

Root selected H1 after reviewing this ranking. The original candidate at 97b0 had
D3/E5/I4/F1/B3, optional lint on the existing frontend caller, and 16 initial /
17 total jobs. All timing lists now use exact 55da artifacts and normalization;
Distribution uses the five approved indexed parts. Parsed refreshed maps and
every modeled count's allocations match before/after partitioning, with exactly
652 checks and 307/270/57/434 browser specs. D3 deals 219/216/217 checks and
738.1 normalized seconds per share; budgets remain per-check 64 / aggregate 926.

The [local correctness record](ci-layout-evidence/h1-local-correctness-20261114.jsonl)
retains 17 passing focused repository checks, the passing named backend spec,
actionlint v1.7.12 success on both workflows, resource choice and remaining gates.
The backend contract fixture alone removes the synthetic lint job and changes
old matrix labels to H1; its nine case identities, timestamps and expected
360,000 ms remain unchanged. No product calculation or browser journey changed.
`ci-lint-setup.sh` skips its Linux-only probes on macOS. `native-setup.sh` passed
its portable checks; its GNU-timeout-gated hosted Node fallback probe also stayed
unobserved because `timeout` is absent locally. Hosted Linux owns both boundaries.

Frontend step names/IDs are `Run lint`/`lint`, `Type-check the dashboard`/`typecheck`
and `Run the group's browser tests`/`suite`. All use `!cancelled()` and their own
prerequisite outcomes; lint tools are acquired before test work, and lint/typecheck
run before frontend's suite. Acquire exact hosted step outcomes: lint/typecheck
must each execute once and succeed; Intent fragments alone cannot prove them.
A shared diagnostic shell anchor has context-specific actual Node/cache-failure
guards, so checkout failure cannot be mislabeled as Node acquisition failure.
Whole-checkout consumer traces and all 479 dispositions are inspectable in the
retained scratch `packing/` directory as bounded typed records. Root subsequently
accepted the independent refactor (provenance comments only); the six-run
screen and the subsequent report repair are retained as separate evidence. The developer later adopted this reasonable first reduction; minimum/search claims remain open in SEED-355.

Hosted H1 subsequently passed in 280 s with a 2 s maximum queue, matching the
forecast's upper end. Distribution's longest suite was 181 s (202 s runner time);
its file-second sum was 1,781.3, versus 2,221.8 in the source and 1,880 in screen B.
The completed screen is inconclusive after its report collision; smaller counts
remain unmeasured. Re-rank repaired CI evidence; no old budget establishes a floor.
