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

<a id="review-files-as-folder-tree"></a>

### Browse a review's changed files as a collapsible folder tree

**Identity:** SEED-088#review-files-as-folder-tree
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/243-review-files-as-folder-tree/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8d3dff3e7d3b2748de497392fc7bbd1d062b9b54a51d2106891fa4ffaa714cb6","plan":"ba02a86d99dea62fb33d9c46a1531e725c8b6dc5ca141014cb50b491a9ade1e4"}}
```

**Goal:** A developer reviewing a story sees its changed files organized in
their folder structure rather than as a flat list, and can collapse and expand
folders to focus on one area of a large change. Each file's change kind is
visible at a glance without spending width on words.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH.md#story-review); its snapshot,
Refresh, Hide/Show files, file selection, and diff stay as they are.

- The file browser shows the snapshot's changed files as a tree of the folders
  that contain them. A file row shows the file's name; files at the repository
  root sit at the top level.
- A chain of folders that each hold only one folder is one row naming the
  chain (`docs/adrs/drafts`), collapsed and expanded as one.
- Every folder starts expanded each time a review opens. A folder can be
  collapsed and expanded by pointer and keyboard, and says which state it is
  in to assistive technology.
- A collapsed folder shows how many changed files it hides, at any depth. An
  expanded folder shows no count.
- Change kind is shown on the file's name, as editorial track-changes marks a
  manuscript: added is green, modified is plain, deleted is struck through and
  muted, renamed is italic. Deleted and renamed differ from the rest by shape,
  not only by color.
- The kind word and the full path stay in each file's accessible name and
  appear on hover (`Deleted gone.txt`, `Renamed old/a.ts → new/a.ts`), so a
  reviewer who cannot see the styling, or is unsure of it, still gets the kind.
- A renamed file appears once, at its new path. Its old path shows on hover
  and in the diff heading. The old folder shows nothing for it.
- The diff heading keeps the selected file's kind word and full path, since
  its tree row shows only the name.
- Collapsing a folder that holds the selected file keeps the selection and its
  diff. Refresh keeps collapsed folders collapsed while the new snapshot still
  has them; folders new to the snapshot start expanded.

Deferred: collapse-all and expand-all, filtering by kind, remembering
collapsed folders after the review is closed, and arrow-key tree navigation.

**Key examples:**

- Snapshot lists `dashboard/src/a.tsx` (added), `dashboard/src/b.ts`
  (modified), `dashboard/server/c.ts` (deleted), and `README.md` (modified) →
  the review opens → the browser shows `dashboard` holding `server` and `src`,
  each expanded with its file, and `README.md` at the top level; `a.tsx` is
  green, `b.ts` and `README.md` plain, `c.ts` struck through and muted; no row
  shows a status word.
- The only changed file under `docs` is `docs/adrs/drafts/0009-tree.md` → the
  review opens → one folder row `docs/adrs/drafts` holds `0009-tree.md`.
- `dashboard` is expanded and holds three changed files across `server` and
  `src` → the developer collapses `dashboard` → its files and subfolders
  disappear, the row shows 3, and the heading still says 4 changed files →
  expanding it restores `server` and `src` as they were.
- `old/a.ts` was renamed to `new/a.ts` and nothing else under `old` changed →
  the review opens → `a.ts` is italic under `new`, no `old` folder is shown,
  hovering the row shows `Renamed old/a.ts → new/a.ts`, and selecting it heads
  the diff with the same words.
- `b.ts` is selected and its diff is shown → the developer collapses
  `dashboard/src` → the diff of `b.ts` stays.
- `dashboard/server` is collapsed → the developer refreshes and the new
  snapshot adds `scripts/x.mjs` → `dashboard/server` is still collapsed and
  `scripts` is expanded.
- A screen-reader user moves to the struck-through row `c.ts` → it is
  announced as `Deleted dashboard/server/c.ts`.

<a id="review-selected-commits"></a>

### Review the combined changes of selected story commits

**Identity:** SEED-088#review-selected-commits
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer reviewing a story can choose a range of the story's commits
in the review and see their combined changes in the same review UI, as
IntelliJ's history review allows. This lets them examine one part of a long
story without the rest of the diff.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH.md#story-review). To be refined: how the
developer selects the range, and how trunk-integration merge commits in the
story's history are handled.

<a id="review-changes-since-last-review"></a>

### Review only what changed since the last review

**Identity:** SEED-088#review-changes-since-last-review
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer who already reviewed a story while its agent kept working
can review only the changes made since that review, so repeated reviews of a
long-running story take less time.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH.md#story-review). To be refined: what marks
a snapshot as reviewed, where that mark is kept on this machine, and how trunk
integration between the two snapshots is shown.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- Terry's 2026-10-03 request: capture this story at the top of the backlog;
  consolidate all worktree changes into one dashboard code review with a
  toggleable changed-file browser and a code diff view.
- 2026-10-03 refinement: Terry asked for the narrowest scope that delivers the
  review. The model is GitHub's pull request changed files view and
  IntelliJ's combined review of several commits. Terry chose the unlanded-vs-trunk
  baseline, a snapshot with Refresh, and the latest launch's worktree.
- [Dough Land](../../src/skills/dough-land/SKILL.md) computes a landing baseline
  from the accepted SHA, the starting revision, or the merge-base. The review
  uses only the merge-base, because trunk merges into a published story branch
  would make a starting-revision baseline show trunk changes as story changes.
- `dashboard/server/defaultCheckoutChanges.ts` already reads the default
  checkout's changed paths with `git status`.
- Terry's 2026-10-04 request: capture at the top of the backlog a folder-tree
  view of the review's changed files, expanded by default, with change kind
  (including deletion) shown by style rather than wording to save space.
- 2026-10-04 refinement: Terry chose editorial-markup kind styling, compacted
  single-child folder chains, a rename shown once at its new path, and a
  changed-file count on collapsed folders. The styling and the count borrow
  from manuscript track-changes and margin change bars. The analogy breaks
  where a manuscript has no unmarked-but-changed text and no reader who cannot
  see the marks: here every listed file is changed, so modified takes the
  plain style, and the kind stays in words for assistive technology and hover.
