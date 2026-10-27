# Dashboard story review

The [agent launch contract](AGENT-LAUNCH.md#story-review) links here for a
story's read-only review of its workspace or a landed run's change in the side panel.

Every completed-story card in Recently done offers **Review changes**, including
stories completed in a terminal or on another machine with no local launch.
When no readable workspace or usable captured landing exists, **Published
completion** shows a fixed comparison reconstructed from the configured
project's published Git history. The done record's path history identifies the
completion revision; its recorded agent and all discoverable historical owning
agents' execution profiles attribute the story commits. The existing published
commit rule removes those commits from that fixed revision, leaving other
stories' interleaved changes out. This works after the story branch and
workspace are deleted and remains fixed as trunk advances. It uses the same
file browser and literal file diffs, without launch or marking semantics.

A completion with missing agent or claim history, unreadable Git objects, or
unresolvable merge attribution explains that evidence gap instead of guessing
or showing an empty successful comparison. Clean merges are checked against
Git's automatic merge tree; additional merge resolutions need attribution
that the historical profiles do not supply. Files whose story changes are
inseparable from another writer's changes retain the existing explicit
“includes trunk's changes” explanation and their own declared comparison base.
Other stories' merge resolutions leave the comparison available when their
resolution paths do not affect this story. The executing agent's own merges,
the completion integration, and resolutions affecting attributed story paths
must have enough evidence to separate their changes.
Historical file requests must match the configured project, exact story,
completion revision, comparison objects, and a literal listed file. Opening
and Refresh fetch published history; selecting a historical file validates
against that already fetched history and performs no network fetch.
The configured folder must still be its own Git checkout; a parent checkout's
history is refused before reading or fetching a comparison.
When retained landed runs are also listed, the Comparison control can switch
between them and Published completion.

A story with a kept launch record naming a workspace or landed run
offers **Review changes** on its active card beside **Inspect story**, or on
its Recently done card. An active story without a launch workspace offers it
too when local Git finds its worktree on this machine; the [reviewed workspace](STORY-REVIEW-WORKSPACE.md)
says which workspace a review reads. It opens a read-only review, defaulting to the readable
workspace's change against trunk; otherwise it opens the newest captured landed
run, or the newest landed run's evidence gap. The [landed comparison](STORY-REVIEW-LANDED-RUNS.md)
uses its fixed delivered pair after workspace retirement. The action leads with
a compare icon and ends with an arrow
toward the side panel where the review opens; both are decorative, so its name
stays “Review changes”. The review
compares a snapshot of the workspace with the merge-base of its head and
freshly fetched `<remote>/<target>`, so trunk changes merged into the story
and the story's already-landed commits stay out. The snapshot covers commits
plus staged, unstaged and untracked files, and leaves out ignored ones. It is
written as a tree object through a temporary index, so the workspace's own
index and status stay as they were.

A Trunk Mode story's agent publishes each increment onto trunk, where other
people's commits interleave with it, so that merge-base already holds the
story's published work. Its baseline is then the merge-base's tree with the
story's published commits taken out, so all changes lists the published,
unpublished and uncommitted changes together and leaves out every other
commit on trunk, even one that changed another part of a file the story
changed (`server/storyPublishedCommits.ts`). The agent is the one the reviewed
worktree's own Git config names as author (`author.name` and `author.email`
read with `git config --worktree`, as the execution start writes them); a
worktree naming none is reviewed against the merge-base. Among the commits
that agent authored that the merge-base holds
(`git rev-list --topo-order --parents --fixed-strings --author=<email>`), a
commit is the story's when it has one parent and the agent's profile in that
parent's tree names the story and records a `mode`, an execution claim; the
profiles are read with one `git cat-file --batch-check` and one `--batch` of
the distinct blobs. The walk runs newest first and stops at the claim, the
commit whose own profile names the story while its parent's does not, so the
claim, preparation commits, merges, and the agent's commits for another story
stay trunk's. Each story commit is taken out newest first by
`git merge-tree --write-tree --name-only -z --merge-base=<commit> <tree so far>
<commit's first parent>`, the restatement the changes since the review use,
which writes tree objects and touches no index, worktree, or ref. A file
whose story change Git cannot take out, because trunk then changed the same
lines, is conflicted in that restatement: all changes lists it with its kind,
counts and diff from trunk as it was before the story's first change to it,
the tree of the first parent of the oldest story commit that changed its path
(`git diff-tree --no-commit-id -r --name-only -z <commit>`), which is the
file's `includesTrunkFrom`, so the line's net change by both is shown rather
than hidden. Its control's name, its row, and its diff heading say it
“includes trunk's changes”, as in the changes since the review, and the
committed work alone lists it the same way. The answer
then carries `published`, the trunk revision the commits were taken out of
(`trunk`, the merge-base) and how many (`commits`), and `baseline` names the
resulting tree; with nothing published since the claim it carries no
`published` and `baseline` is the merge-base. Commits and its Uncommitted
changes item stay the worktree's own, with the merge-base as their points, so
a published commit is not listed there. Taking the commits out needs Git 2.45
or later, as restating the mark does; when this machine's Git cannot (an
older one says the tree is not a commit, and any other failed restatement
counts the same), the review is not failed: nothing is taken out, `baseline`
stays the merge-base, `published` also carries `kept: "not-restated"`, the
context line reads as for any worktree, and the review's status region says,
for as long as that snapshot is shown, “This machine's Git cannot take the
story's 2 published commits out of trunk, so All changes shows only what is
not yet published.” (`src/StoryReviewFeedback.tsx`). A mark taken against
trunk less the story's commits is then one this Git cannot restate on the
merge-base, which [review marks](STORY-REVIEW-MARKS.md) explain.

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
workspace with no changes and a trunk that cannot be
fetched; it never lists files against an unfetched baseline. Requests name
only the project, the work identity and, for a file diff, the snapshot's
object IDs and paths, never a filesystem path
(`server/storyReviewAdmission.ts`, `server/storyReviewSnapshot.ts`).

The review opens in the page's one side panel, beside a dashboard that stays
usable, not in a modal dialog (`src/StoryReview.tsx`). It replaces
whatever the panel showed: a terminal detaches without ending or marking its
session done, and opening a session afterwards replaces the review. Each
opening, the first or one after Close or replacement, reads a fresh snapshot
for the project and story it names; a read still pending for an earlier story
never answers a later one. Review changes for the review already shown moves
the keyboard into that review and keeps its snapshot; Refresh is the explicit
re-read. Maximize/Restore and the Panel divider keep the snapshot
and selection without reading again. The
header names the story and offers Refresh, Maximize/Restore and Close as frame
icon controls shared with the terminal. Directly beneath the header, the
review's top stays in place while the panes beneath it scroll. It holds
the context line, the review's feedback, and, for a snapshot, its marking
controls: the Comparison switch, the changes since the review's heading, and
Mark reviewed with what the review says of the mark
(`src/StoryReviewContextLine.tsx`, `src/StoryReview.tsx`,
`src/StoryReviewMark.tsx`). The context line is one line that never wraps:
branch, the baseline's short revision with the `<remote>/<target>` it meets,
worktree, and, while the comparison shown lists files, Hide files / Show
files for the file browser. Values that do not fit are shortened, the
worktree first. Activating the line, by pointer or keyboard, shows every value
in full, the whole baseline revision and where the branch meets trunk
included, and activating it again returns it to one line; its name reads
every value in full in either state. With the story's published commits taken
out, the baseline names the trunk revision they were taken out of: the one
line reads `<short revision> <remote>/<target> less <n> story commits` and the
full form `<revision> where <branch> meets <remote>/<target>, less the story's
<n> published commits`. The review's other mentions of the baseline, with no
changes and after Refresh, name that trunk revision too (`baselineRevision` in
`src/storyReviewContract.ts`). That the review is read-only is the
review's accessible description, not a visible line. The feedback region,
beneath the context line, announces reading, refreshing, refreshed, and
problem messages, and an unavailable review's explanation. A review with no
changes shows its context line above “No changes”, and changes since the
review with no file above “Nothing changed since the review.”; none of these
nor an unavailable review shows the file browser or a diff.

With touch input, the context disclosure, comparison labels, file and folder
rows, commit rows and uncommitted-changes label offer at least the shared
44px control height. The top has a bounded share of the panel's height and
scrolls when its context or explanations need more room; expanded context
values also scroll within their disclosure (`src/story-review-touch.css`).
This leaves room to read the diff at short landscape heights. Refresh,
Maximize/Restore and Close stay
in the header, so they remain reachable while reading or scrolling context.

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

Phone and tablet views use those same panes and panel controls. Rotation
keeps the selected comparison and file and the diff's reading position;
Maximize/Restore and Hide files/Show files need no Panel divider dragging.
Long code lines scroll sideways inside the diff, and file names inside the
browser, without widening the page. A pane's scroll position can be clamped
when its enlarged view no longer has enough content below that position.

The [review mark](STORY-REVIEW-MARKS.md) keeps the whole snapshot shown,
including when uncommitted changes are excluded from the displayed comparison.
It supplies Changes since the review and explains how integrated trunk changes
are left out, or why an earlier mark cannot be compared.

The [Commits comparison](STORY-REVIEW-COMMITS.md) lists the snapshot's
first-parent commits and Uncommitted changes, compares a contiguous range,
and preserves its chosen endpoints through Refresh.

The [Landed runs comparison](STORY-REVIEW-LANDED-RUNS.md) offers every landed
refinement or execution run, one-shot or a claimed Story Branch Mode launch's
trunk integration, alongside the workspace comparisons, using each run's fixed
delivered pair after retirement.
