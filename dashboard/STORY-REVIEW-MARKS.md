# Dashboard review marks

Review marks extend the [story review](AGENT-LAUNCH-REVIEW.md), using the
comparison and panes that review already shows.

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
unreachable tree; the ref touches no tracked file, index, or status. The
baseline of a Trunk Mode story with published commits is an unreachable tree
as well, so marking first points
`refs/open-dough/reviewed-baseline/<identity>` at the snapshot's baseline, a
tree or a commit, replaced with the mark the same way: the baseline tree is
kept for the next review to restate the mark from. Both refs are set before
the mark is kept, and a mark requires its tree and its baseline's tree, which
a baseline commit peels to; a commit range's points keep commits as their
baselines. In each ref, each identity character other than a
letter, digit, `#`, `_`, or `-` is written as `%XX`.

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
radios saying which is shown, “Since the review”, “All changes”, or “Commits”,
including when nothing changed since the review. Commits is offered whenever
the snapshot lists story commits; an unmarked story opens on All changes and
offers Commits without Since the review. Switching between All changes and
Since the review uses the same snapshot and reads nothing anew
(`src/StoryReviewComparison.tsx`); while all changes are shown, the
review says an earlier snapshot, or this one, is marked and when. Refresh
keeps the comparison shown, of the new snapshot; every opening starts on the
changes since the review. When the repository no longer holds the marked
tree or its baseline (the project was cloned anew, say; checked with
`git rev-parse --verify --quiet` before restating), the earlier review cannot
be compared: the answer carries the mark and `markUncomparable: "unreadable"`
in place of `since`, and the review says an earlier snapshot is marked but can
no longer be read, and shows all changes, with Commits still offered when the
snapshot lists commits. Mark reviewed then starts again from the snapshot shown.

While All changes is shown and the snapshot holds uncommitted changes
(staged, unstaged or untracked), the marking controls offer a native checkbox,
**Include uncommitted changes**, on at every opening. Turned off, the file
browser, counts, total, diffs and file moves show the same snapshot's
committed work alone: the answer also carries `committed`, the files from
`baseline` to the head's tree with that tree, read as `files` is whenever the
snapshot's tree differs from the head's (`server/storyReviewSnapshot.ts`), and
its file diffs name the head's tree as `tree`. Toggling takes no new snapshot;
only the selected file's diff is read. The selected file stays selected while
the files shown list it, and otherwise the first file is. While the check is
off, one line, also the check's accessible description, says “Uncommitted
changes are left out. Mark reviewed still marks the whole snapshot.”, and
Mark reviewed does mark the whole snapshot, as it does in Commits. With
nothing committed, the body says “Nothing is committed yet: every change in
this worktree is uncommitted.” and the check stays to turn back on. A snapshot
without uncommitted changes carries no `committed` and offers no check, as
Commits lists no Uncommitted changes item then; neither do Since the review,
Commits or a landed comparison (`src/useStoryReviewComparison.ts`,
`src/StoryReviewMark.tsx`). The check's state is the panel's
(`src/StoryReview.tsx`): Refresh keeps it while the new snapshot still
holds uncommitted changes, and a snapshot that holds none resets it to on, so
uncommitted changes appearing later are included again. Switching to Since the
review, Commits or a landed run and back to All changes keeps it. Refresh
announces the file count of the comparison shown, so with the check off it
announces the committed files' (`src/StoryReviewFeedback.tsx`).

Trunk merged into the story after the mark stays out of the changes since the
review, as it does from all changes (`server/storyReviewComparison.ts`). With an
unchanged baseline the marked tree is compared directly and nothing is
restated. Otherwise the marked tree is restated on the current baseline by
`git merge-tree --write-tree --name-only -z --merge-base=<marked baseline>
<marked tree> <current baseline>`, which writes a tree object and touches no
index, worktree, or ref. A merge driver can print lines before the result;
the first object ID among NUL- or newline-separated fields is the restated
tree. Conflicted filenames after that tree remain NUL-separated, preserving
newlines within their names. A story slice
that landed on trunk after the mark is therefore not listed. A Trunk Mode
story's commit published after the mark is listed, since the current baseline
is trunk less the story's published commits and so never holds it; the marked
baseline may be a commit and the current one a tree, or the reverse, and
`--merge-base` takes either. Each file Git
names as conflicted, one trunk and the story both changed in a way it cannot
separate, is listed with its kind and diff from the marked tree to the
snapshot tree (the file's `includesTrunkFrom`), so no story change is hidden.
One the story kept as marked, with no diff from the marked tree, is listed
instead with its kind and diff from the current baseline (its
`includesTrunkFrom`), showing the story's version against trunk's. A
conflicted file's control's name, its row, and its diff heading say it
“includes trunk's changes”. When the snapshot's baseline differs from the
mark's as a tree (`since.trunkIntegrated`, so a mark taken against the
merge-base commit before the story published anything equals the later tree
of trunk less the story's commits), the heading says “Trunk was integrated
since the mark”, which for a Trunk Mode story with published commits is when
trunk gained a change other than the story's own publication, and with no
file left the review says “Nothing changed since the review beyond what trunk
now holds.”, since story work that reached trunk after the mark counts as
trunk's. Exit 0 is a clean restatement and exit 1 is a conflicted restatement
when that object ID is present; other exits cannot restate the mark.
Restating needs Git 2.45 or later, which merges trees given with
`--merge-base`, as taking a Trunk Mode story's published commits out of trunk
does; when this machine's Git cannot restate the mark (an older one
says the tree is not a commit), the review is not failed: the answer carries
the mark and `markUncomparable: "not-restated"` in place of `since`, and the
review says this machine's Git cannot leave out trunk's changes integrated
since, so the earlier review cannot be compared across them, and shows all
changes, with Commits still offered when the snapshot lists commits. Mark reviewed then starts again from the snapshot
shown, on whose unchanged baseline the next review needs no restating. A
restatement the closed response aborted still fails, and any Git failure
outside restating still answers that the workspace's changes could not be read.
