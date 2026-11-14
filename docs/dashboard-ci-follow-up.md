# Automatic landed CI follow-up

Automatic CI follow-up runs by default on the production dashboard for GitHub
Actions projects and custom CI projects declaring `ciAdapter` and `ciRebuild`.
The machine whose dashboard records a landing receipt
follows that landing up. Another machine never holds that receipt, so it cannot
request a duplicate rerun, and dashboards on one machine share the ledger's
lock. Development dashboards request no rerun, because
unreleased dashboard code must not act on real CI. No additional follow-up setting
is needed.
Projects declaring only `ciAdapter` keep their existing CI readings and get no
repeat, including for retained GitHub Actions receipts.

Follow-up starts from newly recorded landing receipts, and each receipt keeps
the admission it was recorded with. A landing with no recorded receipt never
runs, and there is no historical batch. Existing requests and their evidence
remain observable and reviewable. The machine retains receipt admission, spent
allowances and follow-up evidence in
`~/.open-dough/dashboard/ci-follow-up.json`. Unreadable allowance evidence blocks
new action and preserves its bytes; it never becomes an empty fresh allowance.

Background collection can request one full repeat of the original observed
check at the exact published Done landing. Its original measurement
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
New landings, ordinary window eviction, changed check configuration and a
restart do not rewrite it. The original remains that landing's one ordinary
sample under the normal completeness/outlier rule; the selectively requested
repeat never replaces it or adds a second sample.

The machine atomically spends the allowance before submitting the full rerun.
Duplicate receipts and multiple production processes on this machine share
that allowance. A refusal, ambiguous response or interruption never causes automatic
resubmission, even if the interruption happened before the command ran.
GitHub Actions retains its built-in full-workflow trigger. For custom CI,
[`ciRebuild`](../Distribution/src/skills/dough-execute-plan/manuals/custom-ci-rebuild.md) is a
project-owned command beside `ciAdapter` in `.planning/open-dough.json`. It asks
for a new full check of the original revision and returns accepted with its exact
new identity, refused with a reason, or uncertain with a reason. The provider
owns admission, queueing and outcome; existing queued or running work is refused,
never attributed as a newly accepted repeat. A nonzero exit, timeout, oversized
output or invalid answer is uncertain and never resent. The read-only execution
observer never calls this trigger.

One shared flow owns admission, spending the allowance, outcome retention and the
review. Its selected provider prepares and freezes the original evidence,
submits the one request, then observes and judges the exact repeat's comparability.
Both providers feed the same saved-reference verdict. Saved requests retain
shared decision fields plus provider-specific identity and evidence; historical
untagged requests remain readable as GitHub Actions requests.

Request intent or acceptance is distinct from an observed CI outcome. A new
attempt number alone cannot prove a full repeat: carried-forward jobs or
ambiguous attempts retain an unverified explanation. Custom discovery must list
the exact accepted identity even while queued. A comparable repeat has a distinct
text-form attempt identity, the original revision/check/context, successful
ordered bounds after the original ends, and complete proof covering the
original's declarations. Extra complete proof is allowed.

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
each attempt's revision, run/attempt identity, workflow or custom check/context,
bounds, wall time, proof completeness and listed provider link when available.
GitHub links name the exact attempt. Signed elapsed and
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
new historical backfill and cross-machine coordination remain deferred. The
usefulness of the provisional 5% calibration remains a learning question.

See [project configuration](../dashboard/PROJECT-CONFIGURATION.md) and the
ordinary [Intent CI comparison](dashboard-development-intent-ci-comparison.md).
