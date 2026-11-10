# Prior-build references for test scopes

Part of [CI timing comparison](dashboard-development-intent-ci-comparison.md).

## Collected timing history

For a Done story, entry and folder **Summary** and file **Proof** also show
**Test execution time history** beside the existing evidence. File history
stays available across Purpose/Proof navigation and when live Proof is absent.
The endpoint is the published Done result's landing,
independent of the build that measured it or another publication of the same
story. Background landing collection retains each measured attempt's validated
GitHub Actions or adapter proof once. History reads use that local evidence,
including after server restart.
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

The history keeps one common build observation and evidence row per attempt,
with separate test-case and test-file histories for its declared evidence. Each
history plots complete cumulative test execution time, including measured zero,
with dates, represented landings and the common measured build link. A mixed
legacy result adds an unknown-unit note without adding another history; a
legacy-only result remains a unit gap, even if its old label names test cases.
It names equivalent-build reuse and later-build measurements separately from
the selected landing. History matches the recorded owning entry, repository
path and declared unit. It does not infer historical renames or use current
trunk's scopes to fill unavailable evidence. Unsupported entry/path/unit changes and unavailable,
partial or untimed proof break the line and keep their reasons. Earlier supported
segments remain readable when the selected landing is a gap. These are
observations of each build's scope, not timing attributed to the story. The
history has its own local read failure and retry, preserving other evidence,
the selected story, Purpose/Proof navigation and comparison.
An unreadable retained store is a failed local read; an absent store is empty
history.

## Prior-build references

A Done story's entry and folder Summary, and file Proof, show a **Prior-build
average** for each declared test-case or test-file measure. This is cumulative
test execution time, separate from the wall-time reference in CI comparison.
The existing observed points and gaps remain visible, with one horizontal
reference for the displayed landing rather than a retrospective average curve.

The comparison uses the exact published Done landing and its evidenced owning
entry, repository path and counted unit. Entry-only totals can measure an entry;
folders and files need complete supporting breakdown. Another entry's missing
proof does not reject a complete target scope.

The shared prior-build rule uses retained represented landings before that exact
endpoint, deduplicates measured attempts and excludes the selected attempt and
measured revisions at or after the endpoint. It computes the median once,
excludes values strictly over 115% of the median, and averages at least five
remaining complete matching values. Complete fast readings and measured zeros
remain eligible. The existing 20-build retention window is unchanged; excluded
samples are never replaced by acquisition or backfill.

Precise elapsed and percentage differences accompany the average, sample count
and date span. A zero average permits elapsed difference but no percentage.
When selected timing is partial or unmeasured, its evidenced scope identity can
still retain a matching earlier reference, with an explicit unavailable
difference. Missing selected identity keeps labelled historical units and owning
entry segments but establishes no combined reference; current trunk or an older
owner never supplies a substitute identity. Changed owners/units, absent paths,
missing breakdown and incomplete timing retain their specific exclusion reasons.

Included, excluded and selected evidence has words and marks, dates, precise
values or reasons, provenance and build links. This evidence remains available
to keyboard, screen-reader and phone readers.
