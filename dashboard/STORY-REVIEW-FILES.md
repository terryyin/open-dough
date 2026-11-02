# Story review file browser

The [story review](AGENT-LAUNCH-REVIEW.md)'s file browser, whose tree model
and change-kind styles Intent shares, shows the snapshot's changed files under
the folders that hold them, each file by its name, with files at the
repository root at the top level (`src/reviewFileTree.ts`). A chain of
folders that each hold only one folder is one row naming the chain
(`docs/adrs/drafts`). A renamed file
sits once, at its new path; its old folder shows nothing for it. Each folder
is a disclosure button (`aria-expanded`) that collapses and expands by
pointer or keyboard; the browser is not an ARIA tree, which would promise
arrow-key navigation. A collapsed folder hides its files and subfolders, and
its row shows how many changed files it holds at any depth; its control is
named by the folder and that count (`dashboard 3 changed files`). An expanded
folder shows no count, and the heading's total stays that of the comparison
shown. Expanding a folder restores its rows as they were, and collapsing the
folder that holds the selected file keeps the selection and its diff.
Collapsed folders are kept by path: Refresh keeps each one the new snapshot
still has collapsed and shows folders new to it expanded, while every folder
shows expanded each time a review opens. A row shows the file's name alone,
its kind told by the name's style, the change-kind styles Intent shares
(`src/change-kinds.css`): an added name is in the ready color, a modified one
in the accent color, a deleted one struck through in the quiet color, and a
renamed one italic; an unchanged file, which only Intent lists, keeps plain
text. The tree model marks each file's kind and whether each folder contains
changes (`src/reviewFileTree.ts`). The kind's words remain where they are
read: each file's control is named, and titled for hover, by its kind and full
path (`Deleted gone.txt`, `Renamed old/a.ts → new/a.ts`), and the selected
file's diff is headed by the same words. Beside a file's
name its row shows how many lines its diff adds and removes (`+2 −1`), and
its control is described by them in words (`2 lines added, 1 line removed`).
The snapshot reads them with `git diff --numstat -M -z` over the same _from_
tree and tree as each comparison's file list, joined by path
(`server/storyReviewFiles.ts`), so no request reads them per file: counts in
all changes run from the baseline, counts in the changes since the review
from the restated tree, and a file that includes trunk's changes counts from
its `includesTrunkFrom`, as its diff does. A file shows counts only when its
diff adds or removes a line: a binary, mode-only, or empty file shows none. A
collapsed folder's count stays the changed files it holds.
