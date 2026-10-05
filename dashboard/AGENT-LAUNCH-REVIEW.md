# Dashboard story review

The [agent launch contract](AGENT-LAUNCH.md#story-review) links here for a
story's read-only review of its workspace and how the side panel shows it.

A card whose story has a kept launch record naming a workspace offers **Review
changes** beside **Inspect story**: a read-only review of what that workspace
would add to trunk now. It leads with a compare icon and ends with an arrow
toward the side panel where the review opens; both are decorative, so its name
stays “Review changes”. The most recent such record by `launchedAt`, whether
it names a start or a preparation, picks the workspace (`reviewWorkspaceOf` in
`src/storyReview.ts`, shared by the card and the boundary). The review
compares a snapshot of the workspace with the merge-base of its head and
freshly fetched `<remote>/<target>`, so trunk changes merged into the story
and the story's already-landed commits stay out. The snapshot covers commits
plus staged, unstaged and untracked files, and leaves out ignored ones. It is
written as a tree object through a temporary index, so the workspace's own
index and status stay as they were.

The file browser shows the snapshot's changed files under the folders that
hold them, each file by its name, with files at the repository root at the
top level (`src/reviewFileTree.ts`). A chain of folders that each hold only
one folder is one row naming the chain (`docs/adrs/drafts`). A renamed file
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
its kind told by the name's style (`src/story-review-files.css`): an added name is
in the ready color, a modified one in plain text, a deleted one struck
through in the quiet color, and a renamed one italic. Modified takes the
plain style because every listed file is changed. The kind's words remain
where they are read: each file's control is named, and titled for hover, by
its kind and full path (`Deleted gone.txt`, `Renamed old/a.ts → new/a.ts`),
and the selected file's diff is headed by the same words. Beside a file's
name its row shows how many lines its diff adds and removes (`+2 −1`), and
its control is described by them in words (`2 lines added, 1 line removed`).
The snapshot reads them with `git diff --numstat -M -z` over the same _from_
tree and tree as each comparison's file list, joined by path
(`server/storyReviewFiles.ts`), so no request reads them per file: counts in
all changes run from the baseline, counts in the changes since the review
from the restated tree, and a file that includes trunk's changes counts from
its `includesTrunkFrom`, as its diff does. A file shows counts only when its diff adds or
removes a line: a binary, mode-only, or empty file shows none. A collapsed
folder's count stays the changed files it holds.

The list and every file diff come from that one snapshot until Refresh takes
a new one. A file's diff is Git's unified diff from its _from_ tree in the
comparison shown, the baseline, the restated or the marked tree, to the
snapshot tree, with renames diffed against their old path; the file diff
request names that _from_ tree as `baseline`. Each line shows its number in
the old file, the new file, or both, counted from its hunk's header
(`src/unifiedDiff.ts`); Git's no-newline note takes none. The numbers are
generated beside the line, outside its text, so copying code leaves them
behind and assistive technology reads the code alone. Binary and
mode-only changes say they have no textual diff. The review explains a
workspace with no changes, a missing worktree, and a trunk that cannot be
fetched; it never lists files against an unfetched baseline. Requests name
only the project, the work identity and, for a file diff, the snapshot's
object IDs and paths, never a filesystem path
(`server/storyReviewAdmission.ts`, `server/storyReviewSnapshot.ts`).

The review opens in the page's one side panel, beside a dashboard that stays
usable, not in a modal dialog (`src/StoryReviewPanel.tsx`). It replaces
whatever the panel showed: a terminal detaches without ending or marking its
session done, and opening a session afterwards replaces the review. Each
opening, the first or one after Close or replacement, reads a fresh snapshot
for the project and story it names; a read still pending for an earlier story
never answers a later one. Review changes for the review already shown moves
the keyboard into that review and keeps its snapshot; Refresh is the explicit
re-read. Maximize/Restore and resizing the panel by its edge keep the snapshot
and selection without reading again. The
header names the story and offers Refresh, Maximize/Restore and Close as frame
icon controls shared with the terminal. Directly beneath the header, the
review's fixed top stays in view while the panes beneath it scroll. It holds
the context line, the review's feedback, and, for a snapshot, its marking
controls: the Comparison switch, the changes since the review's heading, and
Mark reviewed with what the review says of the mark
(`src/StoryReviewContextLine.tsx`, `src/StoryReviewPanel.tsx`,
`src/StoryReviewMark.tsx`). The context line is one line that never wraps:
branch, the baseline's short revision with the `<remote>/<target>` it meets,
worktree, and, while the comparison shown lists files, Hide files / Show
files for the file browser. Values that do not fit are shortened, the
worktree first. Activating the line, by pointer or keyboard, shows every value
in full, the whole baseline revision and where the branch meets trunk
included, and activating it again returns it to one line; its name reads
every value in full in either state. That the review is read-only is the
review's accessible description, not a visible line. The feedback region,
beneath the context line, announces reading, refreshing, refreshed, and
problem messages, and an unavailable review's explanation. A review with no
changes shows its context line above “No changes”, and changes since the
review with no file above “Nothing changed since the review.”; none of these
nor an unavailable review shows the file browser or a diff.

Beneath the fixed top, the file browser and the selected file's diff share
all the panel's remaining height, and the review's body does not scroll as a
whole (`src/story-review.css`). The browser is a full-height sidebar that
scrolls down on its own and sideways for long names. The diff's heading, the
file's kind and path, stays above its code, which scrolls down and sideways
within the diff; the code region takes the keyboard, so it scrolls by
keyboard too. Scrolling either pane leaves the other and the fixed top in
place. Selecting a file shows its diff from the top and leaves the browser
where it was scrolled. A review with changes opens on the first file in the
browser's order for the comparison shown, its rows read from top to bottom with every folder expanded
(`reviewFileOrder` in `src/reviewFileTree.ts`), so a folder that comes first
opens on its first file. Previous file and Next file, icon controls beside
the diff's heading (`src/StoryReviewFileMoves.tsx`), move the selection one
file along that same order. A move into a collapsed folder expands it and any
collapsed folders holding it, and scrolls the browser, never the page, to
bring the selected row into view; the diff shows from the top. Previous file
is unavailable on the first file and Next file on the last, each still
focusable. The browser and both moves follow the comparison shown, so they
never reach a file it does not list. Refresh, or switching to the other
comparison, keeps the browser's place, its collapsed folders, and the
selected file while the files shown list it, and otherwise selects the first
file. Maximize/Restore and resizing keep both
panes' places. Where the panel is too narrow for the browser beside the
diff, the browser sits above the diff with at most two fifths of the height,
each still scrolling on its own; Hide files gives the diff the whole work
area. Close or Command+Shift+Escape returns the keyboard to Review changes,
or to the story's card when that control is no longer shown. A review is not
a session: it marks no session entry as shown.

**Mark reviewed** marks the snapshot the review shows: its tree and the
baseline it was compared with, never a newer state of the workspace, so what
the agent wrote after the snapshot was taken stays unmarked. A story has one
mark on this machine; marking again replaces it. The review then says the
snapshot shown is marked, or that an earlier snapshot is, and when, through a
`<time>` element. Opening, closing, refreshing, or replacing the review marks
nothing. The mark is kept by project and work identity in
`~/.open-dough/dashboard/review-marks.json`, so it outlives a dashboard
restart, and belongs to the story, whichever launch's workspace the review
reads (`server/storyReviewMarks.ts`). Its request is a same-origin POST to
`/__agent-launch/review/mark` naming the project, the work identity, and the
snapshot's `tree` and `baseline`, never a path; the workspace comes from
`reviewWorkspaceOf` as for the review. Marking points
`refs/open-dough/reviewed/<identity>` of the story's repository at the marked
tree, replaced with the mark, so Git's housekeeping keeps that otherwise
unreachable tree; the ref touches no tracked file, index, or status. In the
ref, each identity character other than a letter, digit, `#`, `_`, or `-` is
written as `%XX`.

With a mark, the review opens on **the changes since the review**: the same
snapshot compared with the marked tree restated on the current baseline
instead of with the baseline, in the same
file browser and diff view. It is headed “Changes since the review” and says
what it compares, from the snapshot marked reviewed, with the mark's
`<time>`, to this snapshot. The answer carries both comparisons of the one
snapshot: `files` from the baseline, and `since` with its _from_ tree (the
restated tree) and its files. A file the agent wrote after the marked snapshot
was taken is listed, even one written before the mark was made. When the
snapshot equals the marked one, the review says “Nothing changed since the
review.” Mark reviewed there marks the whole current snapshot, which the next
review compares with. A marked story's review offers a **Comparison** switch,
radios saying which is shown, “Since the review” or “All changes”, including
when nothing changed since the review; an unmarked story's review offers none.
Switching shows the other comparison of the same snapshot and reads nothing
anew (`src/StoryReviewComparison.tsx`); while all changes are shown, the
review says an earlier snapshot, or this one, is marked and when. Refresh
keeps the comparison shown, of the new snapshot; every opening starts on the
changes since the review. When the repository no longer holds the marked
tree or its baseline (the project was cloned anew, say; checked with
`git rev-parse --verify --quiet` before restating), the earlier review cannot
be compared: the answer carries the mark and `markUncomparable: "unreadable"`
in place of `since`, and the review says an earlier snapshot is marked but can
no longer be read, and shows all changes without the switch. Mark reviewed
then starts again from the snapshot shown.

Trunk merged into the story after the mark stays out of the changes since the
review, as it does from all changes (`server/storyReviewSince.ts`). With an
unchanged baseline the marked tree is compared directly and nothing is
restated. Otherwise the marked tree is restated on the current baseline by
`git merge-tree --write-tree --name-only -z --merge-base=<marked baseline>
<marked tree> <current baseline>`, which writes a tree object and touches no
index, worktree, or ref; its first field is the restated tree. A story slice
that landed on trunk after the mark is therefore not listed. Each file Git
names as conflicted, one trunk and the story both changed in a way it cannot
separate, is listed with its kind and diff from the marked tree to the
snapshot tree (the file's `includesTrunkFrom`), so no story change is hidden.
One the story kept as marked, with no diff from the marked tree, is listed
instead with its kind and diff from the current baseline (its
`includesTrunkFrom`), showing the story's version against trunk's. A
conflicted file's control's name, its row, and its diff heading say it
“includes trunk's changes”. When the snapshot's baseline differs from the
mark's, the heading says “Trunk was integrated since the mark”, and with no
file left the review says “Nothing changed since the review beyond what trunk
now holds.”, since story work that reached trunk after the mark counts as
trunk's. Only an exit of 1 whose first field is an object ID is a conflicted
restatement. Restating needs Git 2.45 or later, which merges trees given with
`--merge-base`; when this machine's Git cannot restate the mark (an older one
says the tree is not a commit), the review is not failed: the answer carries
the mark and `markUncomparable: "not-restated"` in place of `since`, and the
review says this machine's Git cannot leave out trunk's changes integrated
since, so the earlier review cannot be compared across them, and shows all
changes without the switch. Mark reviewed then starts again from the snapshot
shown, on whose unchanged baseline the next review needs no restating. A
restatement the closed response aborted still fails, and any Git failure
outside restating still answers that the workspace's changes could not be
read.
