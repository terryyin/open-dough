---
id: SEED-088
status: active
planted: 2026-10-03
planted_during: Terry's request to capture consolidated story code review in the dashboard
trigger_when: A developer wants to review all changes in a story's worktree from the dashboard
scope: unestimated
---

# SEED-088: Dashboard story code review

## Why This Matters

A developer reviewing a story needs to see its combined result across the
worktree. One dashboard review UI makes the complete change understandable
without piecing together individual commits or session outputs.

## Story

<a id="dashboard-story-code-review"></a>

### Review all story worktree changes in one dashboard UI

**Identity:** SEED-088#dashboard-story-code-review
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer can open a code review for a story in the dashboard,
browse every changed file in its worktree, and inspect the consolidated code
diff in one review UI.

**Scope:**

- Open the review from the story in the dashboard and identify the worktree
  being reviewed.
- Consolidate the worktree's changes into one overall review, including changes
  across story commits and current staged, unstaged, and newly added files.
  Show each file's combined result against the review baseline.
- Provide a changed-file browser that the developer can toggle shown or
  hidden. Selecting a file displays its code diff in the same review UI.
- Show additions and removals in the diff. Keep added, deleted, and renamed
  files discoverable, and explain when a file has no textual diff.
- Make an empty change set or an unavailable story worktree clear to the
  developer.

**Key examples:**

1. A story has changes spread over several commits plus staged and unstaged
   edits and a new file. Opening its review shows the combined changed-file
   set and each file's resulting diff in one UI.
2. The developer selects a changed file, reads its diff, hides the file browser
   to give the code more space, then shows it again to select another file.
3. A file was deleted or renamed. The changed-file browser exposes that change
   and the review presents its diff or applicable file-change information.
4. The worktree has no changes against the baseline, or it has been retired.
   The dashboard explains the observed state.

**Open decisions for refinement:** Establish the comparison baseline for a
story, including how it behaves as trunk advances or story changes land;
decide how the review refreshes when the worktree changes and how a story with
multiple associated worktrees selects its review target.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- Terry's 2026-10-03 request: capture this story at the top of the backlog;
  consolidate all worktree changes into one dashboard code review with a
  toggleable changed-file browser and a code diff view.
