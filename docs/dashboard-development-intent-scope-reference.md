# Prior-build references for test scopes

A Done story's entry and folder Summary, and file Proof, show a **Prior-build
average** for each declared test-case or test-file measure. This is cumulative
test execution time, separate from the wall-time reference in CI comparison.
The existing observed points and gaps remain visible, with one horizontal
reference for the displayed landing rather than a retrospective average curve.

The comparison uses the exact published Done landing and its evidenced owning
entry, repository path and counted unit. Entry-only totals can measure an entry;
folders and files need complete supporting breakdown. Folder membership is each
build's published membership, including files outside the visible source tree.
Another entry's missing proof does not reject a complete target scope.

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
to keyboard, screen-reader and phone readers. Browsing, drilling and revisiting,
including after server restart, derives the answer from local collected proof.
The independent local history retry preserves the selected story and existing
Purpose/Proof navigation and comparison.
