# Automatic landed CI follow-up

Automatic CI follow-up runs by default for every GitHub Actions project on the
production dashboard. The machine whose dashboard records a landing receipt
follows that landing up. Development dashboards request no rerun, because
unreleased dashboard code must not act on real CI. Projects with a custom CI
adapter keep their existing CI reading and get no rerun.

Follow-up starts from newly recorded landing receipts, and each receipt keeps
the admission it was recorded with. A landing with no recorded receipt never
runs, and there is no historical batch. Existing requests and their evidence
remain observable and reviewable. The machine retains receipt admission, spent
allowances and follow-up evidence in
`~/.open-dough/dashboard/ci-follow-up.json`. Unreadable allowance evidence blocks
new action and preserves its bytes; it never becomes an empty fresh allowance.

Background collection can request one full repeat of the original observed
workflow run at the exact published Done landing. Its original measurement
must be successful, complete and at least 5% slower than a sufficient positive
[prior-build average](dashboard-development-intent-ci-reference.md). The rule
is provisional and deterministic, not statistically calibrated. It uses the
same five-sample minimum and single median/15% outlier filter as the ordinary
reference. A zero reference supplies no percentage trigger. Equivalent reuse,
later builds and incomplete or incomparable evidence cannot establish this
landing's qualifying original measurement.

Every wall time spans provider-reported attempt start through completion,
including reference samples. This does not promise every queue phase.
The decision saves the actual sample, exclusions, average and 5% rule. The
original and repeated measurement are both judged against that saved reference.
New landings, ordinary window eviction, changed workflow configuration and a
restart do not rewrite it. The original remains that landing's one ordinary
sample under the normal completeness/outlier rule; the selectively requested
repeat never replaces it or adds a second sample.

The machine atomically spends the allowance before submitting the full rerun.
Duplicate receipts and multiple production processes on this machine share
that allowance. An ambiguous response or interruption never causes automatic
resubmission, even if the interruption happened before the command ran.
Request intent or acceptance is distinct from an observed CI outcome. A new
attempt number alone cannot prove a full repeat: carried-forward jobs or
ambiguous attempts retain an unverified explanation.

Recently done keeps the story Done and displays:

- **CI rerun in progress** only after CI is observed queued or running.
- **Possible CI slowdown**, in red with text, when a complete successful repeat
  remains at or above the saved threshold.
- **CI timing returned to range** when the complete successful repeat is below it.
- A particular unverified explanation for refusal, uncertain acceptance,
  failure, cancellation, incomplete proof or unavailable comparable evidence.

**Review original, repeat and saved reference** opens the selected published
Done landing in Intent. Published completion history determines that landing;
a newer receipt naming the same story cannot replace it. The reading shows
each attempt's revision, workflow/run/attempt identity, bounds, wall time,
proof completeness and exact-attempt build link when valid. Signed elapsed and
percentage differences use the same saved average. The actual saved builds,
included/excluded status and exclusion reasons remain inspectable.

Opening, revisiting, refreshing or reloading this retained route and its local
history performs no CI acquisition or action. Background collection alone
acquires follow-up outcomes. The route is known before Intent mounts, so its
initial loading state cannot start the ordinary live comparison readers.
Normal Intent keeps its existing reading behavior. Selected story source and
file/folder Proof continue to describe the original selected landing; there
is no separate repeat-specific scoped-proof browser or chart.

Two observed timings warrant investigation, not a claim about a regression's
cause or statistical confidence. Adaptive repeats, configurable thresholds,
new historical backfill and generic adapter mutation remain deferred. The
usefulness of the provisional 5% calibration remains a learning question.

See [project configuration](../dashboard/PROJECT-CONFIGURATION.md) and the
ordinary [Intent CI comparison](dashboard-development-intent-ci-comparison.md).
