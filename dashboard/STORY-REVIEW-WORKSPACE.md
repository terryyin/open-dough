# Story review workspace

Which workspace a [story review](AGENT-LAUNCH-REVIEW.md) reads.

One rule picks it for the card that offers **Review changes** and for the
boundary that answers the review, its file diffs and its mark
(`reviewWorkspaceOf` in `src/storyReviewWorkspace.ts`). The most recent kept
launch record by `launchedAt`, whether it names a start or a preparation,
picks the workspace before any found worktree.

Without such a record, an active story's review reads the worktree local Git
finds on this machine, as for a Trunk Mode story taken in a terminal: a
linked worktree of the project's local checkout, on a branch, whose own Git
config names an agent as author and whose head commits that agent's profile
naming the story (`server/localWorkspaces.ts`, answered with the machine's
sessions as `workspaces`). The review reads that worktree as it reads a
launched one, against the project's trunk on `origin`; nothing in it says how
the worktree was found, and without such a worktree the card offers no
review.

A worktree counts for the story its own head names and for no other. One the
same agent left on trunk before the claim commits no profile for it, and one
still on an earlier story's claim names that story, so neither is this
story's and the review reads the story's worktree alone.

Several worktrees holding the story's claim are not chosen between. The card
still offers **Review changes**, and the review opens with one explanation in
its feedback, where an unreadable trunk is explained: “Several worktrees on
this machine hold this story's claim for <agent>: <a>, <b>. The review cannot
choose one.”, each worktree as the context line would show it, in path order.
It shows no context line, files, diff, or marking controls, and the file,
range and mark requests are refused with the same words (409), so none of
those worktrees is read or marked. A kept launch record naming a workspace
still comes first, however many worktrees are found.
