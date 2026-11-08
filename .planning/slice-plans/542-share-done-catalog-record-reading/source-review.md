# Source-only review

A fresh Claude Code general-purpose reviewer, launched without conversation
inheritance, received only the story's Goal and Scope from
SEED-262#share-done-catalog-record-reading and was instructed to read no project
files, run no commands and change nothing.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A maintainer who changes how the done catalog selects, orders or hashes record files makes that change in one product place. | slice 1 | observed: product-backlog-complete.mjs owns doneRecordFilesOf (filter, name order, text) and the exported gitBlobHash; no other copy remains. |
| 2 | Every test fixture that publishes a catalog follows that one product place, so a change there reaches each such fixture. | slice 1 | observed: repository-revision-files.mjs serves and materializes catalogs through doneCatalogOf, which calls doneRecordFilesOf; repository-revision-files.test.mjs passed. |
| 3.1 | The product's done-record reading for the catalog becomes one pure operation over named record bytes, covering record-name filtering. | slice 1 | observed: product-backlog-done-catalog.test.mjs named-bytes test drops .catalog.json and notes.txt. |
| 3.2 | That operation covers ordering by name. | slice 1 | observed: the same test returns SEED-1_earlier before SEED-2_later from reversed input. |
| 3.3 | That operation covers record text. | slice 1 | observed: the same test returns the rendered MakeMe done record's text unchanged. |
| 3.4 | That operation covers the Git blob hash. | slice 1 | observed: the same test hashes "hello\n" to ce013625…, the git hash-object value. |
| 4.1 | The directory rebuild of the catalog uses that one operation. | slice 1 | observed: readDoneRecordFiles passes read bytes to doneRecordFilesOf; complete, done-catalog and identity-evidence tests passed. |
| 4.2 | The test renderer's catalog uses that one operation. | slice 1 | observed: doneCatalogOf maps its files to entries and calls doneRecordFilesOf; its own filter, sort and hash are deleted. |
| 5 | Test helpers that compute a Git blob hash for a published file use the product's hash instead of a copy of it. | slice 1 | observed: listingAnswers.gitBlobSha adapts text to the product's gitBlobHash; git grep for createHash("sha1") finds only the product hash plus an etag and a path hash that are not Git blob hashes. |
| 6.1 | Catalog bytes stay unchanged. | slice 1 | observed: existing catalog equality and rebuild tests passed unchanged; 84 dashboard done-catalog, listed-records, revision-reuse and recently-done specs passed. |
| 6.2 | Record bytes stay unchanged. | slice 1 | observed: record files are only read; complete and done-record tests passed unchanged. |
| 6.3 | Served paths stay unchanged. | slice 1 | observed: no served path changed; listed-records and revision-reuse specs passed unchanged. |
| 6.4 | Product behavior stays unchanged. | slice 1 | observed: rebuildDoneCatalog is unchanged and reads the same files in the same order; its tests passed unchanged. |
| 7 | The correction's scope stays limited to the items above and does not reopen SEED-262#declare-fake-github-planning-data's wider outcome. | slice 1 | observed: the diff touches only the product reading module, the two test helpers and one new test. |
