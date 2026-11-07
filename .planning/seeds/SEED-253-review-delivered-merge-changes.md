---
id: SEED-253
status: active
planted: 2026-11-07
scope: story
---

# Review delivered merge changes

## Context

**Review changes** can refuse the whole published completion comparison when a
merge includes edits outside Git's reported conflict paths. In SEED-246
(`60cb82d67`), restoring an agent profile to `.planning/agents/` triggered the
refusal and hid the delivered code. SEED-248 was reviewable at `e6948bfce`, but
the later merge `199a61b8d` brought its existing done record onto a different
first-parent path. The review mistook that merge for SEED-248's completion and
refused its diff.

## Story

<a id="review-delivered-merge-changes"></a>

### Review a completed story including its merge changes

**Identity:** SEED-253#review-delivered-merge-changes

**Goal:** A developer opening **Review changes** for a completed story can
inspect its delivered changes, including the changes made during landing, even
after the story branch, workspace, or local launch record is gone.

**Expected behavior**

- Remove the refusal based on merge attribution. Include the landing changes
  in the overall review when the delivered comparison can be established.
- Identify mixed changes where the story's contribution and concurrent work
  cannot be separated. If some comparison evidence is genuinely missing, show
  the changes that can be established and explain the specific gap.
- Keep the completed story's comparison tied to its delivery when later work
  lands, even if a later merge carries the story's existing done record.

**Examples**

1. A landing resolves a conflict and edits a path Git did not flag. Review
   opens with the delivered files and diffs, including those landing edits.
2. Another story's merge carries a completed story's existing done record.
   Reopening the earlier story still shows its own delivered comparison.

[Published completion review](../../dashboard/AGENT-LAUNCH-REVIEW.md)
describes the current attribution rule. [Landed run review](../../dashboard/STORY-REVIEW-LANDED-RUNS.md)
describes the existing comparison of the trunk revision immediately before a
publication with the revision it accepted.
