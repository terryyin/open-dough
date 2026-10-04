# Review files as a folder tree

**Identity:** SEED-088#review-files-as-folder-tree
**Source:** [story](../../seeds/SEED-088-dashboard-story-code-review.md#review-files-as-folder-tree).
**Prepared:** 2026-10-04. Planning only; this plan authorizes no
implementation or publication.

## Goal and scope

A developer reviewing a story sees its changed files in their folder structure,
collapses and expands folders to focus on one area, and reads each file's
change kind from the styling of its name instead of a status word.

Included: the story's Scope as recorded in the seed. Excluded, as the story
defers them: collapse-all and expand-all, filtering by kind, remembering
collapsed folders after the review closes, and arrow-key tree navigation. The
snapshot, its endpoints, Refresh, Hide/Show files, selection, and the diff are
unchanged; no server change is planned.

## Existing solution

The review's file browser is `dashboard/src/StoryReviewSnapshotView.tsx`
(`ReviewedFileName`, the flat `<ul>`, `selectedPath`, `browserShown`), styled by
`dashboard/src/story-review.css`. The snapshot already gives every file's full
path, kind, and a rename's `oldPath` (`dashboard/src/storyReview.ts`). The
dashboard has no folder tree to reuse; its disclosures are `<details>` and
buttons with `aria-expanded`. The tree is therefore a change to this one view,
plus a pure function that arranges the snapshot's files into folders.

## Current decisions

- **One tree model.** A pure function turns `ReviewedFile[]` into nested folder
  and file nodes, with single-folder chains compacted and each folder knowing
  its changed-file count. Rendering, counts, and collapse all read that one
  model; a renamed file is placed by `path` only.
- **Disclosure, not a tree widget.** Folders are buttons with `aria-expanded`
  in nested lists, as the dashboard's other disclosures are. `role="tree"`
  would promise the arrow-key navigation the story defers.
- **A file's accessible name stays `<Kind> <full path>`** (`Renamed <old> →
  <new>` for a rename), and the same words are its hover text. The specs that
  reach a file by that button name keep working unchanged.
- **Kind text and the North Star.** `docs/dashboard-ux-ui-north-star.md`
  ("Visual and accessibility direction") says text must carry every status
  conveyed by color. The kind is carried in words by the accessible name, the
  hover text, and the selected file's diff heading; deleted and renamed also
  differ by shape. Added and modified differ on sight by color alone, which
  Terry chose on 2026-10-04.
- **Colors** come from the existing tokens: `--ready` for added, `--quiet` for
  deleted (`dashboard/src/styles.css`).
- **Collapsed folders are keyed by folder path** in the view's state, beside
  `selectedPath`, so they survive Refresh exactly as the selection does and
  reset on each opening.
- **The tree journey gets its own spec and worktree**
  (`dashboard/tests/story-review-tree.spec.ts`, built with the helpers in
  `dashboard/tests/support/storyReviewWorktree.ts`). The shared fixture keeps
  its seven files, so the specs that count them are not disturbed.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The proof command runs here and the review specs pass before any change | every slice's proof | `env -u NODE_ENV npm ci`, then the proof command below over `story-review story-panel-replacement story-panel-switching` | 17 passed on trunk `a4a26daf` (2026-10-04) |
| A rename is one snapshot file with `path` and `oldPath` | slice 1 placement | read `reviewedFileSchema` in `dashboard/src/storyReview.ts`; `story-review.spec.ts` lists `Renamed old.txt → new.txt` once | holds |
| Other specs reach file rows through the list named `N changed files` and buttons named `<Kind> <path>` | slices 1–2 keeping those names | `grep` over `dashboard/tests` | holds: `story-review`, `-refresh`, `-landed`, `-nothing`, `story-panel-replacement`, `story-panel-switching` |
| Some assertions read the kind word as visible row text | slices 1–2 rewriting them | same `grep` | `toHaveText([...])` on list items in `story-review.spec.ts:121`, `story-review-refresh.spec.ts:82`, `story-review-landed.spec.ts:29`; `toContainText("Added …")` in `story-review-refresh.spec.ts:116`, `story-panel-switching.spec.ts:112`, `story-panel-replacement.spec.ts:93` |
| Refresh keeps the snapshot view's state | slice 3 refresh example | `story-review-refresh.spec.ts` asserts the selection survives Refresh and passed above | holds |
| Pure dashboard modules are proved by Playwright specs that import them | slice 1 unit proof | `dashboard/tests/story-review-diff.spec.ts` imports `../src/unifiedDiff.ts` | holds |

## Proof ownership

Proof command for every slice:
`env -u NODE_ENV -u npm_config_local_prefix -u npm_package_json ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts --reporter=line --workers=2 story-review story-panel-replacement story-panel-switching`,
plus `npm run typecheck:dashboard`.

| Promise | Slice | Observable proof |
| --- | --- | --- |
| Files shown under their folders; root files at top level; a row shows the file's name | 1 | tree journey: example 1's rows and nesting |
| Single-folder chains are one row | 1 | pure spec for the arranging function; tree journey: `docs/adrs/drafts` |
| Rename once at its new path; old path on hover and in the diff heading; old folder absent | 1 | pure spec; tree journey: rename example |
| Accessible name and hover carry kind and full path | 1 | tree journey: button names and `title`; the other review specs still find their buttons |
| Diff heading keeps kind word and full path | 1 | tree journey selects a nested file; existing diff steps in `story-review.spec.ts` stay green |
| Folders start expanded on every opening | 1, 3 | tree journey at opening; after collapse, Close and reopen shows all expanded |
| Kind shown by styling, no status word in a row | 2 | tree journey: visible row text is the name only; computed color, `line-through`, and italic per kind |
| Folder collapses and expands by pointer and keyboard and states which | 3 | tree journey: `aria-expanded`, Enter and click |
| Collapsed folder shows its hidden count at any depth; expanded shows none; heading count unchanged | 3 | tree journey: collapse example |
| Collapsing keeps the selection and diff | 3 | tree journey |
| Refresh keeps collapsed folders; new folders start expanded | 3 | tree journey: refresh example |

## Ordered slices

### 1. Changed files under their folders
Type: Behavior
Status: done
Proof: new pure spec for the arranging function (nesting, compaction, root
files, rename placement, folder counts, stable order); new
`story-review-tree.spec.ts` journey for the seed's first, second, and rename
examples; list-item text assertions in `story-review`, `-refresh`, and
`-landed` rewritten to the tree's rows; the proof command above.

Behavior: a snapshot lists files in several folders, a deep single-file chain,
a root file, and a cross-folder rename → the developer opens the review → the
browser shows each file by name under its expanded folders, the chain as one
row, the root file at the top level, and the rename once under its new folder
with its old path on hover; every file is still reached by `<Kind> <full
path>`, and selecting one heads its diff with the kind word and full path.

Interim: rows still show the kind word before the name. Slice 2 replaces it.
`dashboard/AGENT-LAUNCH-REVIEW.md` describes the tree.

Accepted proof: the proof command passed 22 (17 baseline, 4 in
`story-review-folders.spec.ts` for `reviewFileTree`, 1 journey in
`story-review-tree.spec.ts` on `nestedWorktree`); typecheck clean;
`side-panel-width` 7 passed for its button-name consumers.

Learnings for slices 2–3: `treeRows` (`dashboard/tests/support/reviewTreeRows.ts`)
reads a row as its list item's first element, so a folder's toggle must stay
first in its item. Folder rows are list items, so counts of the list's items or
buttons include them; `story-review-nothing.spec.ts` now relies on the list's
name for its count. The three `toContainText("Added …")` checks still pass only
because their files sit at the root.

### 2. Change kind by the style of the name
Type: Behavior
Status: done
Proof: tree journey asserts each row's visible text is the file name alone and
its computed style per kind (added `--ready` color, modified the plain text
color, deleted `line-through` in `--quiet`, renamed italic); a keyboard-focused
deleted row's accessible name is `Deleted <full path>`; the three
`toContainText("Added …")` assertions move to the button's accessible name;
the proof command above.

Behavior: the tree shows added, modified, deleted, and renamed files → the
developer reads the browser → no row shows a status word; the added name is
green, the modified plain, the deleted struck through and muted, the renamed
italic, and assistive technology and hover still give the kind in words.

The now-unused kind column styling leaves `story-review.css`; the diff heading
keeps its kind word. `dashboard/AGENT-LAUNCH-REVIEW.md` states the
styling and where the words remain.

Accepted proof: the proof command plus `side-panel-width` passed 29; typecheck
clean. The tree journey compares each name's computed style with tokens the
page resolves, and reads the keyboard-focused deleted row's accessible name.
`story-review.spec.ts` now proves each fixture file's kind by its buttons'
accessible names; its refusal step moved to `story-review-refusal.spec.ts`.

### 3. Collapse and expand folders
Type: Behavior
Status: done
Proof: tree journey for the seed's collapse, selection-kept, and refresh
examples, by Enter and by click, with `aria-expanded` on each folder and the
count shown only while collapsed; reopening after Close shows every folder
expanded; the proof command above.

Behavior: every folder is expanded → the developer collapses a folder → its
files and subfolders are hidden, the row shows how many changed files it holds
at any depth, the heading's total and the selected file's diff stay, and
expanding restores what was inside as it was; Refresh keeps it collapsed while
the new snapshot still has it and shows folders new to the snapshot expanded.

`dashboard/AGENT-LAUNCH-REVIEW.md` states collapse, the count, and what
Refresh and reopening keep.

Accepted proof: the proof command plus `side-panel-width` passed 31; typecheck
clean. The collapse, selection-kept, Refresh, and reopen steps are in
`story-review-tree-collapse.spec.ts`, split by refactoring from the tree
journey. A collapsed folder's accessible name carries its count
(`dashboard 3 changed files`). The browser's rows moved to
`dashboard/src/StoryReviewFileTree.tsx`.
