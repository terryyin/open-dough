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
