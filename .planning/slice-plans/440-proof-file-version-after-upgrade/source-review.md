# Source review: SEED-192#proof-file-version-after-upgrade

Launch: a fresh general-purpose reviewer with no conversation inheritance,
started 2026-11-02 by the execution coordinator. Its input was only the
correction story's Goal, Scope and Key example (seed section 6a) and the two
corrected-story clauses quoted in the plan's Goal and scope. It was told to
read no project files, change nothing, and return numbered commitments.

Reviewer reading notes: commitment 2 leaves the mechanism open while 3.1 and
3.2 hold; 5.1 requires the blob to be supplied, not a refusal to match.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | After a dashboard upgrade, a developer reading a feature file's Proof in Intent sees "This file version" whenever the observation's recorded blob matches the published feature file, including when an earlier dashboard remembered the listing before listings carried blob shas | slice 1 | observed: dashboard/tests/boundary/authenticated-read-intent-proof-retained.spec.ts process two at B answers featureBlobs for both features after a shaless \0tree entry at A; intent-cucumber-proof.spec.ts renders "This file version" for a matching blob |
| 2 | A remembered feature listing that has no blob shas is never used for the file-version match | slice 1 | observed: pinnedTexts.ts treeLister key ${directory}\0tree\0sha; dashboard/tests/boundary/authenticated-read-intent-proof-retained.spec.ts B rereads the feature tree (two trees) instead of recalling the planted shaless entry; failed first with featureBlobs {} |
| 3.1 | One tree read per location and revision is kept | slice 1 | observed: dashboard/tests/boundary/authenticated-read-intent-proof-retained.spec.ts B asks exactly two trees (feature, touched proof folder), C exactly one |
| 3.2 | A listing is still reused across revisions that did not touch its folder | slice 1 | observed: dashboard/tests/boundary/authenticated-read-intent-proof-retained.spec.ts C, after a proof-only commit, asks one tree and answers the same featureBlobs |
| 3.3 | Every Proof state is kept | slice 1 | observed: intent-cucumber-proof.spec.ts, intent-cucumber-proof-absent.spec.ts, intent-selection-reads.spec.ts unchanged and passing (26 passed with neighbors) |
| 3.4 | Every Proof journey is kept | slice 1 | observed: same journeys plus full dashboard/tests/boundary folder, 921 passed |
| 4.1 | It says whether the observation was on this version of the file or the file has changed since | slice 1 | observed: intent-cucumber-proof.spec.ts lines 48-72 assert both "This file version" and "Earlier file version", passing |
| 4.2 | Proof never claims more than it observed | slice 1 | observed: dashboard/tests/boundary/authenticated-read-intent-proof-retained.spec.ts B answers each feature's real gitBlobSha, so a match is decided only from observed blobs; shaless listing never reaches the match |
| 5.1 | Shaless listing retained at A, B changes only the proof folder: Intent at B answers the blob of every listed feature | slice 1 | observed: dashboard/tests/boundary/authenticated-read-intent-proof-retained.spec.ts second process at B: proofOf(body) matches featureBlobs for both listed features |
| 5.2 | At B, a matching observation reads "This file version" | slice 1 | observed: dashboard/tests/boundary/authenticated-read-intent-proof-retained.spec.ts B featureBlobs equal published blobs; intent-cucumber-proof.spec.ts:56 renders "This file version" when the observation blob matches featureBlobs |
| 6 | Exclusion: test-tier consolidation of the proof answer's other variants is not part of this correction | slice 1 | observed: no test-tier consolidation in the diff (pinnedTexts.ts and one new spec only) |
