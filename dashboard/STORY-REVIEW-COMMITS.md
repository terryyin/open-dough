# Story review commit ranges

The Commits comparison extends the [story review](AGENT-LAUNCH-REVIEW.md).

The snapshot also lists the story's commits after its baseline along the
first-parent line, newest first (`server/storyReviewCommits.ts`). Commits
shows each by short revision, subject, and committer time, with merges saying
“Integrated trunk”. The newest item alone is selected initially; its heading
names the count and both ends. While one item is selected, choosing another
extends the contiguous range to it in either direction. With two or more
selected, choosing an item starts a new range of one there. Every selected
item states its membership. Its file browser, counts, and diff compare the
oldest commit's first parent's tree with the newest item's tree, so later
items stay out. While the snapshot differs from the head, Uncommitted changes
is listed above the commits without a revision or timestamp; alone it compares
the head's tree to the snapshot's, including staged, unstaged, and untracked
files and excluding ignored files. With the oldest commit it equals All
changes. Its heading names Uncommitted changes and the number of actual
commits in the range. Hide files
keeps its diff visible. A commit that changes no files says “The chosen commits
changed nothing.” A snapshot with no commits and no changes offers no Commits.

The range read is a GET to `/__agent-launch/review/range`, naming `source`,
`identity`, `fromTree`, `fromBaseline`, `tree`, and `baseline`; the four objects
are supplied by the snapshot's list and verified in the resolved repository
(`server/storyReviewAdmission.ts`, `server/storyReviewRange.ts`). Its answer is
the comparison's `from`, `files`, and destination `tree`, or why it is
unavailable. Each chosen range reads its own two points; an earlier pending
read never supplies a later choice. Across a trunk integration, the shared
point comparison restates the oldest parent's tree onto the newest baseline
and leaves trunk's changes out. An optional `integrations` JSON array carries
selected merges' listed `fromTree`, `fromBaseline`, and destination `baseline`
object IDs, validated and verified in that repository. The same restatement
finds their inseparable paths and unions them with the outer comparison's,
so a conflict remains flagged even when the oldest parent's tree predates
the story edit or its resolution restores that original content. Git's rename
records map those conflicts to both outer trees. File kinds, old paths, and
counts come from complete comparisons before flagged files are selected, so
an intervening rename keeps its original old path and its flag. The server
accepts no paths and recomputes no commit history. Its heading says trunk was integrated within
the range. A clean merge alone changed nothing; a conflicted merge alone
shows the file its resolution changed, including trunk's changes. Older Git
that cannot restate the range says why in the feedback region and lists no
files; ranges below the integration still show.

Commits first defaults to the newest item of the snapshot then shown. Refresh
keeps both chosen endpoint identities while listed, even if a new commit
appears above them; a retained Uncommitted changes endpoint uses its refreshed
points. A vanished endpoint resets the range permanently to the newest item,
including when committing removes Uncommitted changes. Its later return cannot
restore the old range. Switching comparisons preserves the chosen range;
closing and opening starts again. Refresh announces the file count of the
comparison shown, waiting for a refreshed range read to settle. Mark reviewed
in Commits still marks the whole snapshot, and a marked story's next opening
starts on Since the review.
