# Read done records for the catalog through one product rule

**Identity:** SEED-262#share-done-catalog-record-reading

**Source:** [Read done records for the catalog through one product rule](../../seeds/SEED-262-faster-dashboard-test-feedback.md#share-done-catalog-record-reading)
**Source review:** [Source-only commitments](source-review.md)

## Provenance and findings

Retrospective correction of SEED-262#declare-fake-github-planning-data (plan
530 at `ca9edef63:.planning/slice-plans/530-declare-fake-github-planning-data/PLAN.md`;
commits `673fee7a4` through `3b8ae2b6e`).

- Slice 1 (`673fee7a4`) replaced the Git materializer's call to the product's
  `rebuildDoneCatalog` with `tests/support/revision-done-catalog.mjs`
  `doneCatalogOf`, which copies `readDoneRecordFiles`' record-name filter,
  name order and `gitBlobHash` from
  `src/skills/dough-product-backlog/scripts/product-backlog-complete.mjs`
  and then calls the shared `catalogDoneRecords`/`renderDoneCatalog`.
- Both fixture outputs (Git materializer and served files) now go through that
  copy, so the renderer-equality case in
  `tests/support/repository-revision-files.test.mjs` compares the copy with
  itself; no test pins fixture catalogs to the product's reading rule.
- `dashboard/tests/listingAnswers.ts` `gitBlobSha` is a further copy of the
  same Git blob hash, predating plan 530.

## Preserved promises and constraints

- Served catalogs, records and listings stay byte-identical; served paths per
  test are unchanged (plan 530's promises).
- The done catalog stays derived only from record files; `rebuildDoneCatalog`'s
  result summary and file effects are unchanged.
- Rendering stays in memory for served files (no disk or Git).

## Current decisions

- Export from `product-backlog-done-catalog.mjs` (or the module that owns
  catalog derivation) a pure operation taking `{ fileName, bytes }` entries and
  returning the readable record files in name order with text and blob, plus
  the Git blob hash it uses. `readDoneRecordFiles` reads the directory and
  calls it; `doneCatalogOf` maps its files map to entries and calls it;
  `listingAnswers.gitBlobSha` uses the exported hash.

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| One reading rule | Slice 1 | A product node test of the pure operation (filter, order, hash of a known blob); `git grep 'createHash("sha1")'` shows no Git blob hash copy outside the product module; `doneCatalogOf` and `readDoneRecordFiles` call the export. |
| Unchanged bytes | Slice 1 | The product-backlog done-catalog and complete tests, `tests/support/repository-revision-files.test.mjs`, and the dashboard done-catalog, listed-records, revision-reuse and recently done specs pass unchanged. |

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests):
a failing or flaky test is a defect to fix, reproducing it on main is
attribution, not an exemption, and CI failing on a revision this execution
published is this execution's to repair. For full runs on awake macOS with AC
power, use `caffeinate -s -i` and put Homebrew Bash first on `PATH`;
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Focused: `bash scripts/test.sh <paths>` and
`npm run test:dashboard -- <paths> --workers=2`; `npm run typecheck:dashboard`.
The product module is in the released payload, so run the whole `npm test`
once before landing.

## Slices

### 1. Share the done-record reading rule

Type: Structure

Status: done

Proof: the observations in the table above.

Move the record-name filter, name order and Git blob hash into one exported
pure operation; make `readDoneRecordFiles`, `doneCatalogOf` and
`listingAnswers.gitBlobSha` use it; delete the copies.

Accepted proof: `doneRecordFilesOf` and `gitBlobHash` are exported from
`product-backlog-complete.mjs`, not the done-catalog module, which the
browser imports and keeps free of Node-only imports. The new named-bytes test
in `tests/support/product-backlog-done-catalog.test.mjs` observes filter,
order, text and a `git hash-object` blob. `bash scripts/test.sh` over the
done-catalog, complete, done-record, git-done-catalog, identity-evidence and
repository-revision-files tests, `npm run typecheck:dashboard`, and 84
dashboard done-catalog, listed-records, revision-reuse, agent-settings and
recently-done specs passed. Per-commitment observations are in
[source-review.md](source-review.md). The refactor pass made no edits.

## Execution complete

Product advice: no change. The correction leaves one product rule for selecting, ordering and hashing done record files; the remaining `isDoneRecordFileName` callers use that shared predicate for other purposes, and no queued story is affected.
