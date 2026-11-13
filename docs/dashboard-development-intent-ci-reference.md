# Intent prior-build reference

Part of [CI status](dashboard-development-intent-ci-status.md). The project
wall-time history compares its latest represented landing, in recorded trunk
order, with complete prior measurements in the same retained local snapshot.
The existing latest measured build, dated points, gaps, judgment and Proof
remain available. A horizontal dashed line marks the displayed endpoint's
**Prior-build average**, never a retrospective average curve.

The retained window holds 20 distinct measured builds total. An endpoint
that occupies one of those builds leaves at most 19 prior builds; older
endpoints may leave fewer. On Open Dough that window may span only about a
day. The view reports the actual number used and their actual date span.
Retention is unchanged, and excluded or missing evidence is never replaced
by older provider data.

A prior sample needs a represented landing before the exact endpoint and
a measured revision before it, using the shared local Git revision order.
A build attempt counts once even when several landings share it. The selected
attempt is always excluded from its own reference, including its earlier
represented landings. An earlier cancelled landing's later build cannot
supply prior evidence when that measured revision is at or after the endpoint.
Unavailable measured-revision order is an explained exclusion. Completion
timestamps and story identity never determine this boundary.

Wall-time eligibility requires a successful attempt with valid ISO start and
completion bounds, a validated nonempty proof summary, and every published
declared part present and unambiguous. Equal start/completion bounds are a
measured zero; reversed bounds are invalid. Entry-only proof without test
durations or file breakdown suffices for wall time. This proves completeness
of the declared published proof, not that every possible test or undeclared
workflow job ran. Failed, pending, missing, empty and ambiguous evidence retain
their own explanations, without a numeric substitute. Invalid measured start
dates use the valid landing receipt date in the evidence; external reference
dates are checked as ISO instants before display.

Calculate the median once across comparable candidates (mean of the middle
pair for even counts). Exclude values strictly greater than 115% of that
median, then take the arithmetic mean of the remaining values. Use unrounded
measurements throughout, without iterative filtering. Complete fast values
and measured zero remain eligible; a zero median excludes positive values
and retains zeros. At least five post-filter samples are required to show
an average or difference. Four show their evidence and insufficient comparable
history. These initial calibration choices limit unusually slow samples'
influence and avoid presenting one or two runs as a stable reference; they
are not a validated statistical confidence interval or a slowdown judgment.

For prior values 100, 100, 100, 100, 115 and 116 seconds, the median is 100;
115 stays and 116 is excluded. The five-build average is 103 seconds. A selected
120-second landing shows +17 seconds and the rounded percentage from 17/103.
A zero average still permits an elapsed difference, with percentage explicitly
unavailable. If selected proof or timing is unusable, a usable prior average
remains visible beside the selected status that says why, without a change.

Every timing history shares one compact readout
(`dashboard/src/IntentCiPriorBuildReference.tsx`): the selected timing, or its
status in the chart's own words (**Failed build**, **No timing** with its
reason, such as a pending build); the **Prior-build average** with how many
prior builds it used, or **Insufficient history**; then the signed elapsed and
percentage change against that average. The change shows only when both are
usable. Its sign carries the direction in either appearance, and the figure
repeats it in the faster or slower CI cue colour. A build that stands in for
the selected landing is named briefly (**Reused equivalent first-parent
build**, **Later trunk build, includes later changes**).

A Done CI comparison shows its wall-time history between the Baseline, Branch
and Landed endpoints and the by-entry table: a brief status when the history
at its published landing is missing, out of retention, empty or unordered,
the compact readout, and the shared chart of the selected landing and the
verified retained observations through it, never newer landings. A labelled
refresh icon reads it again; a failed read keeps the last history of the same
landing beside its alert and a short **Retry history**. It lists no build
records or membership.

Project history's **Builds and evidence** keeps the observed values and gaps,
plus dated reference evidence labelled ✓ Included, × Excluded, and ◆ Selected
after the median and 15% rule, as the saved follow-up reference does. Both
keep provenance and build links available to keyboard, screen-reader and phone
readers. The line and metrics are derived again whenever the endpoint or
retained snapshot changes. History retains its own failure feedback and
independent refresh lifecycle. Reading, refreshing,
revisiting and restarting use only retained local evidence, without CI
acquisition caused by browsing.
[Automatic landed CI follow-up](dashboard-ci-follow-up.md) can separately retain
one original/repeat comparison against the exact saved reference. Its sample
and exclusions remain fixed while this ordinary reference follows retention.
Causal attribution, configurable thresholds/windows and more retention/backfill
remain deferred.

The rule lives in `dashboard/src/ciPriorBuildReference.ts`; wall-time projection
is `dashboard/server/ciWallTimeReference.ts`. It reuses the collector/store,
authenticated history reader and attempt/provenance owners under
[ADR 0001](adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002](adrs/0002-software-development-lifecycle-principles-accepted.md) and
[ADR 0008](adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
The ordinary reference is derived from its retained snapshot; the follow-up
ledger separately freezes the actual decision evidence.
