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
folder shows no count, and the heading's total stays the snapshot's. Expanding
a folder restores its rows as they were, and collapsing the folder that holds
the selected file keeps the selection and its diff. Collapsed folders are kept
by path: Refresh keeps each one the new snapshot still has collapsed and shows
folders new to it expanded, while every folder shows expanded each time a
review opens. A row shows the file's name alone,
its kind told by the name's style (`src/story-review.css`): an added name is
in the ready color, a modified one in plain text, a deleted one struck
through in the quiet color, and a renamed one italic. Modified takes the
plain style because every listed file is changed. The kind's words remain
where they are read: each file's control is named, and titled for hover, by
its kind and full path (`Deleted gone.txt`, `Renamed old/a.ts → new/a.ts`),
and the selected file's diff is headed by the same words.

The list and every file diff come from that one snapshot until Refresh takes
a new one. A file's diff is Git's unified diff from its _from_ tree in the
comparison shown, the baseline, the restated or the marked tree, to the
snapshot tree, with renames diffed against their old path; the file diff
request names that _from_ tree as `baseline`. Binary and
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
icon controls shared with the terminal. Close or Command+Shift+Escape returns
the keyboard to Review changes, or to the story's card when that control is
no longer shown. A review is not a session: it marks no session entry as shown.

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
be compared: the answer carries the mark and `markUnreadable` in place of
`since`, and the review says an earlier snapshot is marked but can no longer
be read, and shows all changes without the switch. Mark reviewed then starts
again from the snapshot shown. Any other Git failure still answers that the
workspace's changes could not be read.

Trunk merged into the story after the mark stays out of the changes since the
review, as it does from all changes (`server/storyReviewSince.ts`). The
marked tree is restated on the current baseline by
`git merge-tree --write-tree --name-only -z --merge-base=<marked baseline>
<marked tree> <current baseline>`, which writes a tree object and touches no
index, worktree, or ref; its first field is the restated tree, and with an
unchanged baseline it is the marked tree itself. A story slice that landed on
trunk after the mark is therefore not listed. Each file Git names as
conflicted, one trunk and the story both changed in a way it cannot separate,
is listed with its kind and diff from the marked tree to the snapshot tree
(the file's `includesTrunkFrom`), so no story change is hidden; its control's
name, its row, and its diff heading say it “includes trunk's changes”. When
the snapshot's baseline differs from the mark's, the heading says “Trunk was
integrated since the mark”. Restating needs Git 2.45 or later, which merges
trees given with `--merge-base`.
