---
id: SEED-245
status: active
planted: 2026-11-05
planted_during: Terry Yin's request for the next story after selected-story CI timing comparisons, showing start-to-end differences at Intent entry, folder, and file levels
trigger_when: A developer selects a story, especially a done story, and browses Intent entries, folders, or files
scope: story
---

# SEED-245: Compare a story's Intent entry, folder, and file summaries

<a id="compare-story-intent-entry-folder-and-file-summaries"></a>

### Compare a story's Intent entry, folder, and file summaries

**Identity:** SEED-245#compare-story-intent-entry-folder-and-file-summaries
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and goal.** A developer reviewing a selected story, especially
a done story, can drill into Intent and see what changed between that story's
start and end at entry, folder, and file levels. Before/after summary values
and their differences, including test execution time and proof counts where
recorded, make the overall change understandable at the scope being read.

**Requested behavior.**

- **Entry level.** Selecting an Intent entry shows its start and end summary
  values and their differences. Its immediate-child summary table also shows
  the differences for each child folder or file so the developer can locate
  the parts contributing to the entry's overall change.
- **Folder level.** Selecting a folder shows its own start-to-end summary
  differences and the corresponding differences in its immediate file and
  folder rows. Drilling into a nested folder keeps the same selected story
  and comparison endpoints.
- **File level.** Selecting a test file shows that file's start and end
  summary values and differences, including its test execution time and
  available proof figures, alongside the existing source/diff reading.
- **Same comparison throughout.** Use the selected story's start baseline
  and result endpoints established by
  [the preceding timing-comparison story](SEED-244-story-ci-timing-changes.md#compare-story-ci-timing-changes).
  Preserve its distinction between final story-branch and landed results
  where both apply, and identify which comparison each summary describes.
  Entry, folder, and file figures refer to the same builds and revisions
  as the corresponding homepage comparison.
- **Completed-story history.** A done story's start/end comparisons remain
  tied to that story after branch/profile cleanup and later trunk changes.
  An executing story's available current comparison is identified as
  provisional rather than a completed result.
- **Readable differences.** Show before and after values with signed changes
  for comparable numerical figures. Explain added, removed, or renamed paths
  using the available story comparison evidence. Keep incomplete or missing
  timing/proof explicit; an absent measurement is not a measured zero.
  Evidence gaps at one scope do not hide supported differences elsewhere.

**Key examples.**

1. Select a done story, open Intent, and select an entry. Its summary shows
   start and end execution time with the difference; the child rows expose
   the corresponding differences for its immediate folders and files.
2. Open a child folder, then a nested folder, then a test file. Each level
   shows its own before/after summary and differences using the same story
   endpoints. A file whose execution time changed from 10 s to 14 s shows
   both values and **+4 s**; a faster sibling shows a negative difference.
3. A Story Branch Mode story has different branch and landed timing results.
   The drill-down identifies which result it compares with the shared start
   baseline, consistently with the homepage; it does not mix one result's
   entry total with another result's file figures.
4. The story added one test file, removed another, and renamed a third. The
   summaries identify those changes, preserve usable navigation to the
   available historical evidence, and do not invent measurements for absent
   endpoints. An unavailable file duration has an explanation.
5. Select the same done story after newer work lands on trunk and its branch
   is deleted. The entry, folder, and file comparisons still describe that
   story's start and completion. Selecting another story replaces all three
   levels' comparison context consistently.

**Refinement context.** This extends SEED-244's homepage comparisons into
the entry/folder/file summary views requested by
[SEED-243](../done/SEED-243_improve-intent-home-and-selection-summaries.json).
Determine which maintained historical CI evidence supplies each summary
figure at these scopes and the gaps that must remain visible. Reuse the
existing story source comparison and path-change evidence. The request
captures summary differences, including timing, without selecting a new
proof storage design or restoring removed local proof.

**Priority and scope.** Terry requested this immediately after SEED-244,
as the third queued story, directly on `main` and synchronized with `origin`.
Queue order does not itself establish a blocking dependency. Refinement,
implementation planning, and UI changes remain future work.
