# Dashboard story review

The [agent launch contract](AGENT-LAUNCH.md#story-review) links here for a
story's read-only review of its workspace and how the side panel shows it.

A card whose story has a kept launch record naming a workspace offers **Review
changes** beside **Inspect story**: a read-only review of what that workspace
would add to trunk now. The most recent such record by `launchedAt`, whether
it names a start or a preparation, picks the workspace (`reviewWorkspaceOf` in
`src/storyReview.ts`, shared by the card and the boundary). The review
compares a snapshot of the workspace with the merge-base of its head and
freshly fetched `<remote>/<target>`, so trunk changes merged into the story
and the story's already-landed commits stay out. The snapshot covers commits
plus staged, unstaged and untracked files, and leaves out ignored ones. It is
written as a tree object through a temporary index, so the workspace's own
index and status stay as they were.

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
icon controls shared with the terminal. Close or Command+Shift+Escape returns
the keyboard to Review changes, or to the story's card when that control is
no longer shown. A review is not a session: it marks no session entry as shown.
