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
its kind told by the name's style (`src/story-review-files.css`): an added name is
in the ready color, a modified one in plain text, a deleted one struck
through in the quiet color, and a renamed one italic. Modified takes the
plain style because every listed file is changed. The kind's words remain
where they are read: each file's control is named, and titled for hover, by
its kind and full path (`Deleted gone.txt`, `Renamed old/a.ts → new/a.ts`),
and the selected file's diff is headed by the same words.

The list and every file diff come from that one snapshot until Refresh takes
a new one. A file's diff is Git's unified diff from the baseline to the
snapshot tree, with renames diffed against their old path. Binary and
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
icon controls shared with the terminal. Directly beneath the header, the review's fixed top stays in view while
the panes beneath it scroll. It holds the context line and the review's
feedback (`src/StoryReviewSnapshotView.tsx`, `src/StoryReviewPanel.tsx`). The
context line is one line that never wraps: branch, the baseline's short
revision with the `<remote>/<target>` it meets, worktree, and Hide files /
Show files for the file browser. Values that do not fit are shortened, the
worktree first. Activating the line, by pointer or keyboard, shows every value
in full, the whole baseline revision and where the branch meets trunk
included, and activating it again returns it to one line; its name reads
every value in full in either state. That the review is read-only is the
review's accessible description, not a visible line. The feedback region,
beneath the context line, announces reading, refreshing, refreshed, and
problem messages, and an unavailable review's explanation. A review with no
changes shows its context line above “No changes”; neither it nor an
unavailable review shows the file browser or a diff.

Beneath the fixed top, the file browser and the selected file's diff share
all the panel's remaining height, and the review's body does not scroll as a
whole (`src/story-review.css`). The browser is a full-height sidebar that
scrolls down on its own and sideways for long names. The diff's heading, the
file's kind and path, stays above its code, which scrolls down and sideways
within the diff; the code region takes the keyboard, so it scrolls by
keyboard too. Scrolling either pane leaves the other and the fixed top in
place. Selecting a file shows its diff from the top and leaves the browser
where it was scrolled. A review with changes opens on the first file in the
browser's order, its rows read from top to bottom with every folder expanded
(`reviewFileOrder` in `src/reviewFileTree.ts`), so a folder that comes first
opens on its first file. Previous file and Next file, icon controls beside
the diff's heading (`src/StoryReviewFileMoves.tsx`), move the selection one
file along that same order. A move into a collapsed folder expands it and any
collapsed folders holding it, and scrolls the browser, never the page, to
bring the selected row into view; the diff shows from the top. Previous file
is unavailable on the first file and Next file on the last, each still
focusable. Refresh keeps the browser's place, its collapsed
folders, and the selected file while the new snapshot lists it, and
otherwise selects the first file. Maximize/Restore and resizing keep both
panes' places. Where the panel is too narrow for the browser beside the
diff, the browser sits above the diff with at most two fifths of the height,
each still scrolling on its own; Hide files gives the diff the whole work
area. Close or Command+Shift+Escape returns the keyboard to Review changes,
or to the story's card when that control is no longer shown. A review is not
a session: it marks no session entry as shown.
