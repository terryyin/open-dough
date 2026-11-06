---
id: SEED-247
status: active
planted: 2026-11-06
planted_during: Terry Yin's clarification that individual Intent files still need Purpose and Proof tabs
trigger_when: A developer selects an individual file in the dashboard's Intent perspective
scope: story
---

# SEED-247: Restore Purpose and Proof for individual Intent files

## Request and context

Terry clarified on 2026-11-06 that the earlier simplification of Intent was
not intended to remove Purpose and Proof from individual files. Each file
needs its source as Purpose and its observed runtime performance as Proof.
An executed story's selection should expose the differences, including the
change in execution time. Keep folders and sections as they are for now.

The current [Intent reading guidance](../../docs/dashboard-development-intent.md)
describes file source and story diffs under Purpose, with a selected story's
compact CI timing comparison above it. That comparison alone does not supply
the requested file-level Proof tab. This story restores the file-level
distinction while retaining the existing folder and section summaries.

## Story

<a id="restore-file-purpose-and-proof"></a>

### Restore Purpose and Proof tabs for individual Intent files

**Identity:** SEED-247#restore-file-purpose-and-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer, including Terry, reading a test file in Intent
and reviewing how an executed story changed its behavior and runtime cost.

**Outcome:** Selecting an individual file offers Purpose and Proof tabs.
Purpose is the file's actual source text. Proof shows that file's runtime
results and execution time from published CI proof. With an executed story
selected, the developer can review its source diff and the file's measured
execution-time differences in the existing story comparison.

**Requested scope:**

- Apply the Purpose/Proof tabs to individual files in configured Intent
  locations. Preserve the existing source reader and selected-story source
  diff as Purpose.
- Populate Proof from the file's runtime evidence in CI proof, including
  results and execution time. Keep evidence associated with its actual
  revision and run; selecting Proof reads evidence rather than executing tests.
- For a selected executed story, show the file's comparison using the
  existing baseline, branch and landed evidence where applicable, with
  measured times and signed timing differences. Keep missing measurements
  explicit and retain the qualification that observed timing differences
  between builds are not automatically attributable to the story.
- Leave folder and section presentation and behavior unchanged, including
  the current summaries and comparisons.

**Examples to evaluate:**

1. Select an individual file with no story selected. Purpose shows its source;
   Proof shows that file's published runtime results and execution time.
2. Select a completed story and a file it changed. Purpose exposes the story's
   source diff. Proof shows the file's runtime comparison and signed timing
   differences between the available story endpoints.
3. A file took 12.5 seconds at baseline and 10 seconds in the landed proof.
   Its Proof comparison shows both measurements and a -2.5 second difference.
4. A file or comparison endpoint has no usable runtime proof. Proof explains
   the gap, without treating absence as zero or borrowing another file's
   measurements; Purpose remains readable.
5. Select a folder or section before and after the change. Its existing
   summary, navigation and story comparison remain as they are today.

**Priority:** First queued item, on Terry's explicit instruction. Other
queued work retains its relative order.

## References

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current Development and Intent behavior](../../docs/dashboard-development-intent.md).
- [Completed entry, folder and file comparison story](../done/SEED-245_compare-story-intent-entry-folder-and-file-summaries.json).
