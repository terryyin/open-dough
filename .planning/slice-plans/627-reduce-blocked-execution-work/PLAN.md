# Reduce blocked execution work

**Identity:** SEED-356#reduce-total-model-work-during-blocked-execution
**Source:** [refined story](../../seeds/SEED-356-reduce-blocked-execution-effort.md#reduce-total-model-work-during-blocked-execution)

**Source review:** [source-only commitments](source-review.md)

## Goal and decisions

Explain and reproduce the original prolonged-pause failure before selecting one
targeted reduction. Terry authorized this plan update and continuation on
2026-11-15 after the differential-review recommendation. The forced-wake result
is a valid narrow opportunity stop, not a falsification of the original
long-wait hypothesis or a measured non-regression result. Preserve that evidence.

Keep the source's gain/quality bars and approved six-journey cap (3 used, 3 remaining).
Terry approved two fixed 180-second native windows as the scoped exception
recorded in the source. Finish controlled observation/export proof before the
fresh blocked baseline; no optimization or candidate until it reproduces the
targeted behavior and supports a worthwhile removal. A new runtime, protocol or general phase-loading rewrite is not
selected. Retain the existing context/dependency/supplier-resolution owners;
revisit PFE only if the investigation supports a changed responsibility.

Follow Accepted ADRs [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md) and
[0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md). Edit reusable
guidance in `Distribution/src/skills/`; do not hand-sync installed copies.

## Slices

### 1. Probe a fresh baseline and select one removal or stop with evidence
Type: Behavior
Status: done
Proof: a passing paused-supplier assessment and complete coordinator/worker usage
support one plausible whole-task saving; otherwise retain the invalid/inconclusive
observation, repair a discovered test defect under AGENTS.md's failure policy,
and stop the optimization without claiming a passing baseline or improvement.
Deterministic repair proof must preserve rejection of real harness inspection.

Freeze the execution's current pre-change SHA. Use the maintained
[baseline capture](../../../Distribution/tests/native-comparison-baselines.md#save-one-frozen-baseline)
with `--case paused-supplier --baseline <SHA> --model gpt-6.1-sol --effort xhigh`
and a new `--save-baseline` path. Inspect
`.capture.originalAssessment == "pass"` and `.usage.status == "complete"`.
Read only the trace portions needed to choose one reduction, including setup
and the qualifying turn. Record baseline SHA, runtime/settings, cost and the
selected removal here. If no reduction is supported, do not build a helper.
This paid probe owns native availability, fresh cost and opportunity uncertainty.
The invalid observation below settles that probe's stop branch; the missing
usable baseline and selection stay owned by G1 and slice 2. Terry's 2026-11-15
"approved. continue" grants four additional native journeys after that stop.

### 2. Explain the original pause versus the fresh hold
Type: Behavior
Status: done
Proof: an evidence-linked comparison identifies context, instructions, active
handles, wait results, canonical agreement timing, supplier state and guidance
revisions in both sessions;
it separates a demonstrated trigger from unproved explanations.

Read the original coordinator around its supplier-pause acknowledgement and
447-request wait, and the fresh four-turn capture. Retain only bounded excerpts,
counts and raw locators in a linked investigation record. Determine whether the
original loop had a live wait/observer or supplier-agent handle absent from the
fixture, whether instructions/guidance changed, and what lets the fresh session
hold and end. These are questions, not assumed causes. Reuse the corrected
native reader and existing evidence; no paid session or product edit in this
slice. If evidence is insufficient, name the smallest missing observation.

Accepted [differential investigation](differential-investigation.md): the original
already completed an attention handoff before the explicit “you watch it”
follow-up. Its live publication watch then returned empty nonterminal receipts
while the supplier was paused. The fixture omits that follow-up/resource and
starts with a dependency block added by the later human correction. Captured
stop/no-empty-call guidance matches; no intervening fix is established. The
record gives exact raw locators and the next normal-watch reproduction profile.
Delivery disposition: `records-only`; no product/test edit or refactor needed.

### 3. Establish a faithful reproducer or an evidenced current resolution
Type: Behavior
Status: planned
Proof: the reproducer preserves the observed causal condition, exercises normal
wait/resume and detects unwanted repeated model work; a current baseline must
exhibit that behavior before any optimization. Alternatively, evidence explains
why current behavior already resolves the original failure.

Use slice 2's [minimum profile](differential-investigation.md#minimum-next-reproduction-profile)
to update the smallest maintained case/harness boundary. Supplier events must
arrive during an active watch turn; the existing after-turn event loop cannot
stand in for that condition. Reapply PFE before adding an in-flight harness seam.
Keep forced-wake and ordinary-supplier cases as correctness regressions. Do not
encode the expected decision in the agent prompt. Controlled checks validate
inputs, observation, rejection cases and retention; they do not prove native
model behavior. Preserve partial work, exact supplier judgment, one qualifying
continuation and owned/independent proof. Before any native probe, make the
expensive-proof decision and reserve its full remaining evaluation allocation.
No new event-delivery runtime, daemon or general context protocol is authorized.
If reproduction needs such a consequential change, retain the concrete evidence
and decision instead of inventing it. Update remaining work from the result.

The [reviewed reproducer design](reproducer-design.md) assigns in-flight
scheduling, supplier fixtures, supervision and decoding to their existing owners.
Controlled-clock delivery and cleanup checks passed. Terry's latest approval
settles the native intervals and six-journey allocation. Complete authentic
handle/exposure decoding and compact phase-evidence replay before the native
baseline; no product optimization is selected.

Controlled in-flight/supplier regressions, authentic receipt calibration,
controlled deadline scheduling, conservative exposure and compact replay passed.
Independent refactoring and thirteen receipt/exposure plus two mocked-scheduler
cases passed; existing affected ownership/retention proof remains accepted.
Preparation `754bff87e4bff396fa258d7221b01cba1cde23ac` passed exact CI
`43686419444/1` before its single frozen native baseline.

The [native opportunity record](../../../Distribution/tests/native-comparison/supplier-watch/comparisons/seed356-watch-baseline-20261115-opportunity.md)
retains the complete passing journey: 76 responses, 8,936,838 processed tokens,
zero interventions, correct hold and one qualifying continuation with final proof.
Publications arrived at +180.050s/+360.046s. The first successful watch began
only after nonqualification; manual live exposure in window 2 is at least
58.920s. All three wait receipts were nonempty. Automated handle/exposure/signal
remain unknown; the frozen two-empty/distinct-response/same-watch signal was
not demonstrated. This neither resolves nor disproves the prolonged-pause hypothesis.
Even all directly charged unchanged-window work is only 11.92% of whole-task
cost, including useful work; no plausible targeted 20% removal was demonstrated.
Stop before optimization under the source rule. Slice 3/G2 remain open; no
candidate, matched saving or non-regression claim. Budget now 3/6 consumed.
Further work needs a new decision; a fresh full comparison needs four journeys
but only three remain. Recommend no more paid runs before an evidence-supported
exposure design can separate watch setup from prolonged waiting and justify
whole-task opportunity. Preserve the immutable export and raw evidence.

### 4. Make one supported change and judge the matched result
Type: Behavior
Status: planned
Proof: baseline reproduces the targeted failure; candidate preserves outcomes and
proof, reduces whole-task blocked tokens at least 20% without more requests or
interventions, and adds no more than 5% unblocked tokens with no extra requests
or interventions. No gain is inferred from unchanged guidance or one baseline.

Only select this slice after the faithful baseline and a plausible targeted
removal exist. Prefer deletion and existing owners; a helper replaces its
observed agent procedure. Retain full coordinator/worker usage and recovery
cost. Use the maintained comparison/export path under matched task, events,
assessor, host/version, settings and authority. Reader changes invalidate reuse
of the earlier capture; do not rewrite input hashes or waive compatibility.
The original four-journey reservation now has three unused after the inconclusive
blocked baseline. A fresh complete pair of pairs needs a new budget decision.
No extra retry or automatic reacquisition may exceed the six-journey cap. On failed quality, unknown
usage, missed bar or exhausted allocation, revert only candidate product edits
and retain the result; no favorable rerun or design expansion.

## Proof, premises and delivery

- On 2026-11-15 at `688f09b9f`, `PATH=/opt/homebrew/bin:$PATH
  Distribution/tests/native-comparison.sh --list` selected both supplier cases;
  local Node is 24.21.0 and Codex CLI 0.169.0. Native authentication and paid
  execution remain slice 1's probe, not assumed success.
- In this preparation checkout, `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
  Distribution/tests/native-comparison-paused-supplier.sh
  Distribution/tests/native-comparison-unblocked-supplier.sh` passed. These run
  controlled journeys that accept correct continuation and reject early
  publication, lost/rerouted work, duplicate continuation and missing proof.
  Native cost is unproved until the slices run. The runner forces all three
  wake events; this plan claims no suppressed wakes.
- Local gates: representative skill review and focused checks for changed
  behavior; reuse the above assessor proof while unchanged. Follow the maintained
  [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  start fully awake; on AC use `caffeinate -s -i` for long native runs; on battery
  plug in or use `caffeinate -i` with lid open and inspect the sleep log. Inspect
  load/memory before expensive runs and sequence these owned journeys.
- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written to every delegation and repair. Independent post-change refactoring,
  focused proof, coordinator commit/publication and asynchronous CI repair use
  `dough-execute-plan`; stop after the bounded experiment rather than grow it.
  Apply [this project's failure policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written alongside the shared policy.

Remaining work has three separate proof loops: differential explanation, faithful
reproduction/current-resolution judgment, then one conditional measured change.
No numeric slice time limit was supplied; use the source’s native budget.

## Execution context

Established 2026-11-15: story-branch; owned execution workspace
`/Users/terryyin/git/open-dough/.worktrees/reduce-total-model-work-during-blocked-execution`,
branch `codex/reduce-total-model-work-during-blocked-execution`; originating and
integration checkout `/Users/terryyin/git/open-dough` (preserve other owners).
Publisher `dashboard-territory.local-open-dough`, agent `darren-chan`; starting
revision `81146589ef7832d100f1f0a4557f5169d01b9f07`, accepted claim and pre-change
baseline `45f965a1bb59f049f9828097971d7621c13c64d6`, confirmed on `origin/main`
and the execution branch. Authorized target is `origin/main`; ordinary delivery
uses the remote execution branch. No second Take. No numeric slice limit supplied;
retain the source's approved six-journey hard budget and existing planning authority.

Checkout-owned locked npm and browser setup plus native prerequisite check and
`npm run typecheck:dashboard` passed with Node 24.21.0 and Chromium 158.0.8127.18.
Selective formatting is `npm run format`; `.githooks/pre-commit` checks staged lint
and typechecks script changes without mutation.

CI observer: GitHub `terryyin/open-dough`, `ci.yml` (CI, id 351271804), target
`codex/reduce-total-model-work-during-blocked-execution`, coordinator `seed356-darren`,
current cell `g335:10`, session `65049`, directory `/tmp/dough-ci-501/watch-MRhWE3`, PID 6637.
Prior `/tmp/dough-ci-501/watch-eh23m4` stopped at the human decision with confirmed
shutdown and CI for `1a4a640e87a5ba76739ba3362e40001e5e41e124` unobserved. Checkout-bound runtime; do not register the trunk claim
on this execution-branch observer.

Expensive-proof decision executed: one sequential native baseline at frozen
`754bff87`, after exact preparation CI, under `caffeinate -s -i` on AC/awake
Territory.local (16 CPUs, 48 GiB/54% free, load 11.01/10.37/8.47; Codex 0.169.0).
The delegated owner reconsidered contention before launch and observed terminal
exit 0; no owned probe processes remain. Other work stayed with its owners.
Journey 3/6 consumed; no retry, optimization or further paid proof authorized
by this inconclusive result. See the native record for literal command and raw paths.

## Probe evidence and resumed measurement

The [initial probe and detector-repair history](probe-history.md) retains the
invalid journey, literal commands, raw evidence, deterministic proof and CI repair.
The repaired increment `863ea5690d85f9f2da3ade7a370426ac20b44ad2` is published on
the execution branch and covered by the resumed observer above.

The resumed paused-supplier journey (2/5) passed all four behavioral turns.
[Original export](../../../Distribution/tests/native-comparison/paused-supplier/comparisons/seed356-resumed-baseline-863ea5690.json)
remains unknown and byte-identical; a shared reader defect misidentified forked
workers after copied parent metadata. Eight focused checks and independent
refactoring validate the bounded repair. A new [corrected export](../../../Distribution/tests/native-comparison/paused-supplier/comparisons/seed356-resumed-baseline-863ea5690-accounting-corrected.json)
replays the same complete raw attempt, preserving capture hashes and input
manifest: 77 responses, 8,861,703 processed tokens, 8,614,144 cached input,
213,172 uncached input, 34,387 output, zero native developer interventions.

The [opportunity and stop record](../../../Distribution/tests/native-comparison/paused-supplier/comparisons/seed356-resumed-baseline-863ea5690-opportunity.md)
retains literal commands, per-turn costs, raw evidence, observed no-removal
judgment, repair proof and visible evaluation cost. Reader changes remain
material for comparison reuse; no compatibility exemption or provenance rewrite
was introduced. No additional native run or candidate comparison was launched.
The narrow probe stop remains historical evidence. The newly authorized
differential investigation resumes at slice 2; no improvement is claimed.

## Story obligations

### G1. No usable fresh baseline or supported reduction
Reported: slice 1 — "The native baseline was invalidated by a false-positive harness-inspection detector and stopped; complete-task usage and a worthwhile removal remain unproved."
Story clause: "Unknown usage remains unknown and cannot support a token-saving verdict."
Disposition: receiving slice 4
Commitment: A026
### G2. Repetition or current resolution remain unproved
Reported: slice 3 — "The fresh frozen baseline passed quality and timing; automated watch exposure remains unknown, manual exposure is limited and repeated empty model activity was not demonstrated. No current resolution or supported reduction is established."
Story clause: "Any new reproducer must exercise the normal wait/resume path, preserve the causal condition found in the original trace, and demonstrate the unwanted baseline behavior before an implementation or further paid comparison."
Disposition: return
Commitment: A012, A023, A024, A025, A078
