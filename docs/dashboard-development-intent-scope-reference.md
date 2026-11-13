# Prior-build references for test scopes

Part of [CI timing comparison](dashboard-development-intent-ci-comparison.md).

## Collected timing history

Project Intent and Done stories show **Test execution time history** first in
entry and folder **Summary**, above the sortable child table whose immediate
folders and files still open their own views, and first in file **Proof**,
above its endpoint comparison or proof table. It reads as the Done CI wall time
history does (see [CI comparison](dashboard-development-intent-ci-comparison.md)):
a brief status, the shared compact prior-build readout, and the shared dated
chart with its failed and unavailable marks and per-mark readouts. It is
labelled cumulative test execution time, not CI wall time. No selected story
is needed in Project Intent. File history stays available across Purpose/Proof
navigation, keeping its unit choice, and when live Proof is absent.

Project Intent ends at the last observed configured-trunk head; the history
names its branch and observation time, and the readout its revision. A later snapshot of the same head keeps
that observation time: elapsed time alone reads no history. Showing Project
Intent, an observed new head and **Check again** read locally collected history.
The last answer has its own read time, distinct from the trunk observation; a
refresh labels the old answer **Previously retrieved history** until a new
answer replaces it. A failed refresh keeps that matching answer and its chart
beside a short alert and **Retry history**, independently of the comparison. An answer for another project, scope or endpoint is never
shown as the current one. Reading and retry acquire no historical CI proof.

A Done story ends at its exact published result's landing,
independent of the build that measured it or another publication of the same
story. Visiting Project Intent while it stays selected uses the project endpoint;
returning restores its Done series, selected test and reading place. A project
endpoint without a collected observation remains named, with supported earlier
observations, an endpoint gap mark and a brief status. Unknown ancestry is conservative;
neither an older CI measured revision nor the latest collected landing silently
replaces the observed head. Background landing collection retains each measured attempt's validated
GitHub Actions or adapter proof once. History reads use that local evidence,
including after server restart, as their
[glance answer](dashboard-development-intent-ci-reference.md#glance-history-read):
each build's dated reading per unit or its typed gap and reason, and each
unit's compact reference figures, without membership, run or landing records.
Opening, drilling or revisiting Summary or file Proof, including history Retry,
never acquires historical CI proof. Folder readings include every published
descendant, even files absent from the visible source tree; membership is the
scope observed at each build.

Collection can resume a known attempt's missing proof or unanswered acquisition
after restart, including retained builds whose wall-time resolution was already
final. It keeps proof acquisition separate from that final landing resolution.
Validated summaries stay immutable; answered corrupt archives and explicit
expired, invalid, mismatched or oversized proof remain explained gaps. Proof,
builds and their landing references share the project's bounded retained cohort;
browsing neither extends that window nor reconstructs evicted evidence.
The cohort follows accepted recorded-landing ancestry across all merge
parents, filtered to retained recorded revisions, independently of when
landing reports arrive. A merge with the story as its first parent still
includes earlier accepted trunk landings. Collected ordering remains usable
if explicit launch-record deletion removes landing pins, or local Git
repositories or objects become unavailable. Launch-history retention does not
remove those pins. Unverifiable positions get an explicit explanation and do
not enter the through-landing series. An upstream rate limit does not withhold
these local history reads. The confirmed-skip CI resolver keeps its separate
first-parent equivalent-build rule.

The history keeps one build observation per attempt, with separate test-case
and test-file series for its declared evidence. One chart shows one unit at a
time: with both units present, **Test cases** and **Test file** (in a
Summary, **Test files**) choose the unit, and the compact readout's value and
average and the chart's scale change together; units never share a scale. A
file's test-case timing is the aggregate of its test cases. Each series plots
complete cumulative test execution time by build date, including measured
zero; each mark names its date, timing or status, and its build's role. A
legacy-only result declares no unit history and its brief status names the
unknown unit. When an equivalent or later trunk build supplies the endpoint's
measurement, the readout names that build after the timing. History matches the recorded owning entry, repository
path and declared unit. It does not infer historical renames or use current
trunk's scopes to fill unavailable evidence. Unsupported entry/path/unit changes and unavailable,
partial or untimed proof break the line and keep their reasons. Earlier supported
segments remain readable when the endpoint is a gap. These are
observations of each build's scope, not timing attributed to the story. The
history has its own local read failure and retry, preserving other evidence,
the selected story, Purpose/Proof navigation and comparison.
An unreadable retained store is a failed local read; an absent store is empty
history.

## Prior-build references

Project Intent and Done entry and folder Summary, and file Proof, show a
**Prior-build average** for the chosen test-case or test-file measure. This is cumulative
test execution time, separate from the wall-time reference in CI comparison.
The chart's points and gaps remain visible, with one dashed horizontal
reference for the displayed endpoint rather than a retrospective average curve.

The comparison uses the observed configured-trunk endpoint or exact published
Done landing, with its evidenced owning entry, repository path and counted unit. Entry-only totals can measure an entry;
folders and files need complete supporting breakdown. Another entry's missing
proof does not reject a complete target scope.

The shared prior-build rule uses retained represented landings before that exact
endpoint, deduplicates measured attempts and excludes the selected attempt and
measured revisions at or after the endpoint. It computes the median once,
excludes values strictly over 115% of the median, and averages at least five
remaining complete matching values. Complete fast readings and measured zeros
remain eligible. The existing 20-build retention window is unchanged; excluded
samples are never replaced by acquisition or backfill.

The compact readout shows the endpoint's timing or status, the average with
its sample count, and the precise signed elapsed and percentage difference in
the faster/slower cue colour. Fewer than five values show **Insufficient
history** with the observations still charted. A zero average permits elapsed
difference but no percentage.
When selected timing is partial or unmeasured, its evidenced scope identity can
still retain a matching earlier reference, with an explicit unavailable
difference. Missing selected identity keeps labelled historical units and owning
entry segments but establishes no combined reference; current trunk or an older
owner never supplies a substitute identity. Changed owners/units, absent paths,
missing breakdown and incomplete timing retain their specific exclusion reasons.

The chart and readout carry the reading by pointer, keyboard, touch and screen
reader.
