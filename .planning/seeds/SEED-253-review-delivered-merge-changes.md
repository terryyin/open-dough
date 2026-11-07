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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/491-review-delivered-merge-changes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"89a0ea72b61ef6a01c5629a5b988c52ed1d6965458098fd19c90cf87a7663416","plan":"45fbe98a6243dadd76fe2db4cca6316ea881ed8df9a6014bebfc2de3bdcba107"}}
```

**Beneficiary:** A developer reviewing a completed story's delivered changes in
**Review changes** or Intent's selected-story overlay.

**Goal:** A developer opening **Review changes** for a completed story can
inspect its delivered changes, including the changes made during its merges and
landing, even after the story branch, workspace, or local launch record is
gone, and even after later merges carry the story's existing done record.

**Scope:**

- **Required behavior:**
  - Tie a completed story's published completion revision to its own delivery:
    the newest trunk-first owning merge that integrates the commit where its
    done record was added, or that done-record commit itself when the story
    completed on trunk or fast-forwarded onto trunk without a trunk-first owning
    merge. A later merge by another story that carries the existing done record
    onto a new first-parent path must not replace the story's completion
    revision.
  - Remove the merge-attribution refusals that rejected the whole comparison
    when an owning or completion merge edited paths outside Git's reported
    conflict list, or when another story's non-owning merge resolved a conflict
    on a path this story also changed.
  - Include the story's non-conflicted merge and landing edits (changes between
    Git's automatic merge tree and the committed merge tree on non-conflicted
    paths in the story's owning/completion merges) in the story's subtracted
    changes so those files and diffs appear in the published completion review
    and Intent's selected-story overlay.
  - Ignore `git merge-tree` directory-rename false positives on paths that the
    story branch did not change and that the merge kept identical to its trunk
    parent (such as another active agent's profile in `.planning/agents/`), so
    unrelated trunk files are neither listed as story changes nor flagged as
    mixed work.
  - Identify mixed changes where the story's contribution and concurrent work
    cannot be separated (genuine conflict resolutions in the story's
    owning/completion merges and files whose story commits or merge edits
    cannot be cleanly restated out of trunk), showing those files with
    `includesTrunkFrom` (“includes trunk's changes”) compared from before the
    mixed work while other files keep their isolated story attribution.
  - When comparison evidence is genuinely missing (such as a missing or
    unreadable done record, unrecoverable or ambiguous execution agent, shallow
    or missing claim history, unreadable Git objects, or an unsupported Git
    `merge-tree`), explain that specific gap; when a local captured run is
    missing or unreadable while published history can establish the completion
    comparison, show the published completion comparison and explain the gap on
    the explicit run choice.
- **Required restrictions:**
  - Keep historical file diff and file text requests bound to the configured
    project, exact story, established completion revision, admitted comparison
    trees (`baseline` or the file's `includesTrunkFrom`), and literal listed
    paths, without network fetches on file selection. Justification: preserves
    the read-only local admission boundary and immutable snapshot guarantees.
  - Do not guess an execution owner when the done record omits `agent` and
    published claim history before the done record is missing, shallow, or names
    multiple execution agents. Justification: prevents attributing another
    story's commits to an unrecoverable completion.
- **Scope limits:**
  - Does not change live workspace review, review marks, or captured landed-run
    storage.
  - Does not add a sub-file line-by-line blame UI inside a single conflicted
    hunk beyond the existing `includesTrunkFrom` (“includes trunk's changes”)
    comparison base and diff presentation.
- **Deferred, neither promised nor prevented:** Sub-file hunk splitting for
  files that combine conflict resolution and independent hunks in the same file.

**Key examples:**

1. A Story Branch landing (or story-branch integration merge of trunk) resolves
   a conflict on `shared.txt` and also edits or adds a path Git did not flag as
   conflicted (such as `merge-resolution.txt`, a renamed test file, or a
   restored `.planning/agents/<other>.json` profile that `git merge-tree`
   directory-rename heuristics moved) → **Review changes** and Intent's
   selected-story overlay open with the delivered files and diffs, including
   the landing edits, marking `shared.txt` as “includes trunk's changes” and
   leaving untouched trunk files (such as `<other>.json`) out of the story's
   diff.
2. Another story's merge on trunk resolves a conflict on a file this story also
   modified → **Review changes** opens with this story's delivered comparison,
   isolating this story's change when Git can restate it cleanly and marking
   the file as “includes trunk's changes” when concurrent work overwrote or
   overlapped the same lines.
3. A completed story (`SEED-248` at `e6948bfce`, or a Trunk Mode / fast-forward
   completion) is already on trunk when a later story branch (branched before
   that completion) merges trunk as its second parent (`199a61b8d`) and
   fast-forwards trunk → reopening **Review changes** or selecting the earlier
   story in Intent still names the earlier story's own completion revision
   (`e6948bfce`) and shows its own delivered comparison.
4. A completed story's local captured landing is missing or unreadable while
   published completion history is intact → **Review changes** opens on
   **Published completion** with the established files and diffs, while
   switching to **Landed runs** explains that run's specific capture gap; if
   published claim history itself is shallow or missing, **Review changes**
   explains that specific gap without guessing files.

**Architecture:** Reconstructing a completed story's comparison from published
Git history on `origin` without requiring a surviving worktree, story branch, or
local launch record follows
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(durable project state on `origin`, distinguishing mixed or missing evidence
from a blanket failure) and
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md),
and aligns with the branching and integration mechanics in Proposed
[ADR 0009 — Git branching and integration](../../docs/adrs/0009-git-branching-and-integration.md).
Endpoint recovery in `dashboard/server/storyPublishedEndpoints.ts` anchors the
completion revision to the commit that added the done record or the newest
trunk-first owning merge that integrated it, rather than trunk's current
`--first-parent` path. Commit and merge attribution in
`dashboard/server/storyCompletedCommits.ts` decomposes each owning/completion
merge into genuine conflict paths (`resolutions` with `includesTrunkFrom`),
non-conflicted merge edits (restated in `trunkLess` against the pre-edit merge
tree where conflicted and untouched trunk paths retain the merge tree's blobs),
and untouched trunk paths affected only by `merge-tree` directory-rename
heuristics. No conflict with Accepted ADRs exists.

[Published completion review](../../dashboard/AGENT-LAUNCH-REVIEW.md)
describes the published completion attribution rule. [Landed run review](../../dashboard/STORY-REVIEW-LANDED-RUNS.md)
describes the comparison of the trunk revision immediately before a
publication with the revision it accepted.
