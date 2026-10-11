# Review only a Trunk Mode story's own changes

**Identity:** SEED-088#review-trunk-mode-story-changes
**Source:** [story](../../seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes),
refined 2026-10-11. Planning only; this plan grants no Take, execution, or
publication.

## Goal and boundaries

A developer reviewing a Trunk Mode story on the machine that holds its
worktree sees the story's own changes, published, unpublished and
uncommitted, in one review, with every other commit on trunk left out even
where the story's published commits interleave with them.

Preserved: every review a worktree offers today, and which worktree it reads;
the snapshot, its fetch, and the worktree's own index and status; All changes,
Since the review, Commits with its Uncommitted changes item, Include
uncommitted changes, Mark reviewed, and the landed comparisons; a story with
nothing published since its claim, and a Story Branch Mode story whose agent's
commits reach trunk only at wrap-up, reviewed exactly as today.

Excluded, as the story records: Commits listing the story's published commits
or ranging across them; reviewing a completed Trunk Mode story from Recently
done after its worktree is retired; a merge commit the agent published, which
counts as trunk's; separating the story's lines from trunk's inside a file Git
flags; a review from another machine, or of a worktree the
[sibling story](../../seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-worktree)
does not find.

## Architecture

Found elsewhere and reused: the restatement in
`dashboard/server/storyReviewComparison.ts` (`restatedPoint`, Git's
`merge-tree --write-tree --name-only -z --merge-base=…`, the conflicted-path
parsing of `restatementFrom`, and `compareReviewPoints`' flagging of
inseparable files with `includesTrunkFrom`); the snapshot in
`storyReviewSnapshot.ts`, whose `baseline`, `files`, `committed`, `since`,
mark, and file diff already name trees, never paths; the agent profile module
under `src/skills/dough-product-backlog/scripts/`, whose directory
`agentProfileDirectoryOf(source)` resolves beside the backlog; and the
per-worktree authorship `workspace-agent-authorship.mjs` writes
(`author.name`, `author.email`), which the sibling story also reads.

The review's **baseline generalizes from a commit on trunk to a review point**:
with no published story commit it stays the merge-base commit; with some, it
is that merge-base's tree with the story's published commits taken out, built
by reverse-applying each story commit newest first,
`git merge-tree --write-tree --name-only -z --merge-base=<commit> <tree so far> <commit's first parent>`.
Every consumer of `baseline` then reads the story's own changes: `files`,
`committed`, the mark, the restatement of `since` (`--merge-base` accepts a
tree, observed below), and the file diff. The commits list and the
Uncommitted changes item keep the merge-base commit as their points, since
`git log` walks commits and those ranges stay the worktree's. The snapshot
answer gains one field saying the story's published commits were taken out
of which trunk revision, and how many, or that they could not be, which the
context line and feedback read. The mark keeps the baseline tree reachable
beside the marked tree, since an unreferenced tree is pruned by housekeeping
(observed below).

**Recognizing the story's commits** is one more local reading of the
project's Git history beside the sibling's worktree resolution, from the same
facts: the worktree's configured author and the agent's profile at a
revision. One shared helper answers whether the agent's profile at a revision
names a story as an execution claim (records a `mode`), used by this scan and,
once landed, by the sibling's head check; until then this plan adds it and the
sibling adopts it. Nothing is published and no publication changes.

Considered and set aside, as the story records: a commit trailer; landed-run
capture per publication; forward replay of story commits onto pre-story trunk
(the snapshot side would be synthetic); comparing from the claim. Also set
aside here: finding the claim through GitHub's profile history
(`ghProfileAddition.ts` serves credited developers from the authenticated
read boundary; the review reads local Git and must work offline from trunk's
fetch alone); and caching the scan, since it is one `rev-list` and one
`cat-file --batch-check` per snapshot. The Proposed ADR 0008 and ADR 0009
inform this and bind nothing; no Accepted ADR constrains it; no North Star
topic is warranted, since the change extends the built design that
`dashboard/AGENT-LAUNCH-REVIEW.md` records.

## Current decisions

- **Agent.** The reviewed worktree's `git config --worktree --get author.name`
  and `author.email`; a worktree without them has no story commits to take
  out, so the review is today's.
- **Story commits.** Walk `git rev-list --author=<author.email> <merge-base>`
  newest first (the merge-base of head and fetched trunk, which holds every
  commit the agent published). A commit is the story's when it has one
  parent and the agent's profile in its parent's tree
  (`<parent>:<profile directory>/<agent>.json`, read through
  `git cat-file --batch-check` then `--batch` for the distinct blobs) names
  the story's identity and records a `mode`. Stop at the claim: a commit
  whose own profile names the story while its parent's does not. The claim,
  preparation commits (profiles with `activity`), merges, and the agent's
  commits for other stories are therefore left in trunk.
- **Baseline point.** Start from the merge-base's tree; for each story commit
  newest first, reverse-apply as above. Exit 0 and 1 (with a tree) succeed;
  exit 1's NUL-separated paths after the tree are inseparable. Any other
  failure takes nothing out: `baseline` stays the merge-base commit and the
  answer says the story's published commits could not be taken out
  (`not-restated`).
- **Flagged files.** An inseparable path is listed from `includesTrunkFrom` =
  the tree of the first parent of the oldest story commit that changed that
  path (`git diff-tree --no-commit-id -r --name-only <commit>`), with its kind,
  counts and diff from there, as `compareReviewPoints` lists a conflicted file
  from the marked tree. A separated path is listed from the baseline point.
- **Answer field.** `published: { trunk: <merge-base commit>, commits: <n> }`
  when `n > 0` and taken out; `published: { trunk, commits, kept:
  "not-restated" }` when they could not be; absent when `n = 0`. `baseline`
  stays one object id (tree or commit), so the file and mark requests are
  unchanged.
- **Context line.** With `published` taken out, the one-line form reads
  `<short baseline> <remote>/<target> less <n> story commits` and the full
  form `<baseline> where <branch> meets <remote>/<target>, less the story's
  <n> published commits`; the hidden text mirrors the full form as today.
  Without `published`, the line is unchanged.
- **Feedback.** With `kept: "not-restated"`, the feedback region says “This
  machine's Git cannot take the story's <n> published commits out of trunk, so
  All changes shows only what is not yet published.”, in the place the
  uncomparable mark is explained.
- **Mark.** `reviewPointObjects` requires `${baseline}^{tree}` (a commit peels
  to its tree). `markReviewedResponse` also points
  `refs/open-dough/reviewed-baseline/<identity>` at the baseline, written
  before the mark is kept. `trunkIntegratedSince` is unchanged: only a change
  on trunk other than the story's own publication changes the baseline tree,
  so the heading appears exactly when trunk's own changes arrived.
- **Fixture.** A Trunk Mode-shaped Story A in `dashboard/tests/support/`:
  Story A moved to **Taken**, the roster agent `Yui-chan`'s profile
  (`mode: "trunk"`, `branch: "origin/main"`) committed on trunk as the claim
  authored by the agent, a worktree with `extensions.worktreeConfig` and
  per-worktree `author.name`/`author.email`, story commits pushed from the
  worktree to `origin/main`, other developers' commits from the project
  checkout (pull before writing), the worktree rebased onto fetched trunk, a
  kept launch record, and the card read from the Taken region. An unknown
  agent name makes the profile unreadable (observed), so the roster name is
  required. Reuse the sibling's Trunk Mode real-start fixture instead once it
  has landed, if it gives the same shape. Specs must print nothing: a passing
  spec that writes output fails the project command (observed).

## Observed premises

Observed on 2026-10-11 in this worktree at `10c84990` with Git 2.50.1 and Node
24.21.0 after `node scripts/setup-native.mjs npm` and `browser`; the scratch
spec, its results and the scratch repository were removed and no product
file changed.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Published story commits are linear commits authored by the agent, with the profile naming the story in every tree from the claim to the closure's parent, and removed at the closure | Slice 1's scan | This repository's history: `git log --first-parent 29b9c41c^..16954fb4`, `git show <commit>:.planning/agents/steven-chan.json` at the claim, a middle commit, the closure's parent and the closure; `git log -1 --format='%an %cn'` | Thirteen commits by `steven-chan`, committer Terry Yin; the profile names the identity with `mode` at the claim, middle and closure parent; absent at the closure (which deletes it) |
| Reverse-applying interleaved story commits from the tip with `merge-tree` leaves exactly the story's changes and flags a line both changed | Slice 1 and 2 | Scratch repository: base, `S1` (a.txt line 1), `O1` (b.txt), `S2` (d.txt, c.txt line 3), `O2` (a.txt line 5), `O3` (c.txt line 3); `merge-tree --write-tree --merge-base=S2 TIP S2^` then `--merge-base=S1 <tree> S1^`; `git diff --stat <tree> TIP` | First step exits 1 naming `c.txt`; second exits 0 with a tree given as “ours”; the diff lists `a.txt` (line 1 only), `c.txt`, `d.txt`, not `b.txt` |
| `merge-tree --merge-base` accepts a tree, with trees on both sides | Slice 3's restatement of the mark on a tree baseline | `merge-tree --write-tree --name-only -z --merge-base=<tree> <tree> <tree>` | Exit 0, one tree written |
| An unreferenced tree is pruned and a ref keeps one | Slice 3's second ref | `update-ref refs/open-dough/reviewed-baseline/x <tree2>`, `git gc --prune=now`, `cat-file -t` on both trees | `tree2` kept; the unreferenced `tree1` gone |
| Author filtering and profile reads are one `rev-list` and one `cat-file --batch-check` | Slice 1's scan | `git rev-list --author=yui@x <claim>..HEAD` piped as `<sha>:.planning/agents/yui-chan.json` lines into `cat-file --batch-check` | Each commit's and parent's blob answered in one process |
| Today's review of a Trunk Mode-shaped worktree lists the uncommitted files alone, with trunk's tip as baseline | Slice 1's starting point and fixture | Scratch spec with the fixture decided above (two story commits `s1`, `s2` interleaved with `o1`, `o2`, `o3`, head rebased onto trunk, untracked `notes.md`), kept launch record, Taken card's Review changes, `npm run test:dashboard -- dashboard/tests/zz-scratch-trunk-own.spec.ts` | `files: ["notes.md"]`, `baseline` equal to `origin/main`, `commits: 0`, context line `Baseline a617e4d`; the worktree's author `Yui-chan`; two commits by the agent after the claim |
| A profile for a name outside the roster is unreadable | Fixture | The same spec with `yui-chan` | Taken stage listed “Agent profile yui-chan.json is unreadable: unknown agent: yui-chan”, card “Owner not recorded” |

Consumers found for the changed surfaces: `reviewPointObjects`
(`storyReviewMarks.ts`, `storyReviewComparison.ts`'s `holdsPoint`,
`storyReviewRange.ts` through admission); `storyReviewSchema`'s `baseline`
(`src/storyReview.ts`, parsed by the page; stays an object id);
`StoryReviewContextLine.tsx` and `dashboard/tests/support/reviewContextLine.ts`
with `story-review-context-line.spec.ts`; `StoryReviewFeedback.tsx`; the
`files` elements' optional `includesTrunkFrom`, which the file browser already
flags for `since`; `storyReviewSnapshot`'s `storyCommits(baseline, …)` and
`uncommitted` points, which keep the merge-base; and every
`dashboard/tests/story-review*.spec.ts`, whose worktrees have no configured
author and so keep today's baseline.

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| All changes lists the published, unpublished and uncommitted changes and not other commits' files; a file both changed in different places shows the story's hunk alone | Slice 1 spec: rows `a.ts`, `d.md`, `notes.md`; `a.ts` diff adds `a one` only |
| The context line names the baseline as trunk less the story's published commits | Slice 1 spec: one-line text and full form |
| The claim, preparation commits, the agent's earlier-story commits, and merges are left in trunk | Slice 1 spec: a `Mina-chan` preparation commit and an earlier `Yui-chan` story's commit on trunk list no file |
| Commits stays the worktree's: Uncommitted changes above `u1`, no published commit; Include uncommitted changes off keeps the published and unpublished files | Slice 1 spec |
| Nothing published, or a Story Branch worktree: today's review | Slice 1: existing `story-review*.spec.ts`, `recently-done-one-shot-review.spec.ts` green; a case with the claim alone on trunk reads `baseline` equal to the merge-base and no `published` |
| A file trunk and the story both changed inseparably is flagged and diffed from trunk before the story's first change to it | Slice 2 spec: `c.ts includes trunk's changes`, diff `-c 3` / `+c trunk` |
| Since the review lists a story commit published after the mark and leaves trunk's out; with trunk's own changes the heading says trunk was integrated, without them it does not; the mark survives housekeeping | Slice 3 spec: mark, publish `s3` and `o4`, Refresh: `e.ts` alone with the heading; a variant publishing `s3` alone: `e.ts` without it; `git gc --prune=now` in the fixture then Refresh still compares |
| An older Git keeps the published commits in and says why | Slice 4 spec on `olderGit`: rows `notes.md`, feedback text, `published.kept` |
| Existing review behavior unchanged | Each slice: `dashboard/tests/story-review*.spec.ts`, `recently-done-one-shot-review.spec.ts` green; `npm run typecheck:dashboard` and `npm run lint` clean |

## Story obligations

### G1. Mark reviewed refused on a tree baseline
Reported: slice 1 — "Mark reviewed is refused on a published Trunk Mode story until slice 3."
Story clause: "Mark reviewed act on this comparison as they do today"
Disposition: proved by slice 3: `dashboard/tests/story-review-trunk-own-since.spec.ts`, step "the snapshot is marked as any story's is, its baseline tree kept beside its tree"

### G2. Inseparable file listed without its flag
Reported: slice 1 — "It is listed from the restated tree without a flag, and that tree holds Git's conflict markers for it."
Story clause: "A file whose story change and trunk change Git cannot separate is listed flagged"
Disposition: proved by slice 2: `dashboard/tests/story-review-trunk-own-flagged.spec.ts`, "a file trunk rewrote where the story changed it is flagged as including trunk's changes"

### G3. A Git that cannot restate says nothing
Reported: slice 1 — "Baseline stays the merge-base and no `published` is answered; `kept: \"not-restated\"` and its feedback are slice 4."
Story clause: "its feedback says the story's published commits could not be taken out of trunk and why"
Disposition: receiving slice 4

### G4. Singular commit wording untested
Reported: slice 1 — "Singular wording is my choice and untested"
Story clause: "its one-line form says how many"
Disposition: proved by slice 2: `dashboard/tests/story-review-trunk-own-flagged.spec.ts`, step "the context line counts one published commit"

### G5. Preparation profile with activity not exercised
Reported: slice 1 — "The fixture uses it only as a Git author of `prep.md`, with no profile file, so \"profile with `activity`\" is not exercised directly."
Story clause: "the preparation agent's commits for this story"
Disposition: proved by slice 1: `dashboard/tests/story-review-trunk-own-changes.spec.ts` lists exactly `d.md`, `notes.md`, `src/a.ts`, leaving out the preparation agent's `prep.md`

### G6. Flagged file kept as its origin, or renamed, untested in All changes
Reported: slice 2 — "The kept-as-origin fallback: a flagged file whose snapshot content equals its origin is listed from the merge-base."
Story clause: "as Since the review flags such a file today"
Disposition: proved by slice 2: All changes and Since the review list flagged files through the one `listedFrom` of `dashboard/server/storyReviewComparison.ts`, whose kept and renamed paths `dashboard/tests/story-review-since-trunk.spec.ts` ("a conflicted file the story kept as marked is flagged and diffed from the baseline") observes

### G7. A mark on a tree baseline compared with a later commit baseline
Reported: slice 3 — "Tree-baseline mark later compared against a commit baseline (the `not-restated` path on older Git) — slice 4."
Story clause: "the review shows the unpublished and uncommitted changes against trunk as today"
Disposition: receiving slice 4

### G8. Trunk advanced by commits that leave its tree unchanged
Reported: slice 3 — "if trunk advanced between mark and snapshot by commits whose net tree is identical (empty commit, or a change and its revert), the heading no longer shows."
Story clause: "sees the story's own changes, published, unpublished and uncommitted, in one review"
Disposition: no user cost "sees the story's own changes, published, unpublished and uncommitted, in one review": trunk holding the same files as at the mark brought nothing into the changes since the review, so the heading has nothing to explain

## Ordered slices

### 1. All changes shows a Trunk Mode story's published changes beside its unpublished ones
Type: Behavior
Status: done
Accepted proof: `npm run test:dashboard -- dashboard/tests/story-review-trunk-own-changes.spec.ts`
(two tests); `npm run test:dashboard -- dashboard/tests/story-review dashboard/tests/recently-done-one-shot-review.spec.ts`;
`npm run typecheck:dashboard`; `npm run lint`.
Learnings: `server/storyPublishedCommits.ts` holds the scan
(`publishedStoryCommits`), `trunkLess`, and the shared `namesExecutionClaim`;
`gitRunner`'s `GitCall` gained `input` for the batched profile reads. The page
names a tree baseline by `baselineRevision` (`published.trunk`) in the context
line, the refreshed feedback and the no-changes text. The mark's schemas moved
to `src/reviewMark.ts`, re-exported by `storyReview.ts`.
`storyReviewSnapshot.ts` is at 240 of 250 lines, so slices 2 to 4 place their
listing and failure detail outside it. The kept launch record stays
`story-branch` shaped: the launch schema admits no other mode, and Trunk Mode
is recognized from the worktree's author and the profile.
Proof: New spec `dashboard/tests/story-review-trunk-own-changes.spec.ts` on
the new fixture for the first five proof rows; the story-review spec suite;
`npm run typecheck:dashboard` and `npm run lint`.

Behavior: Yui-chan holds Story A in Trunk Mode in `.worktrees/story-a`; after
the claim she published `s1` (first line of `src/a.ts`) and `s2` (`d.md`), with
`o1` (`src/b.ts`), `o2` (last line of `src/a.ts`) and a `Mina-chan`
preparation commit between them; the head equals `origin/main`, `u1`
(`src/g.ts`) is unpublished and `notes.md` untracked → Review changes → All
changes lists `src/a.ts`, `d.md`, `src/g.ts` and `notes.md`, the `a.ts` diff
adds `a one` alone, the context line reads the trunk revision less 2 story
commits; Commits lists Uncommitted changes above `u1`; Include uncommitted
changes off lists `src/a.ts`, `d.md`, `src/g.ts`. With the claim alone on
trunk, the answer carries no `published` and today's baseline.

Change: a server module (for example `server/storyPublishedCommits.ts`) reads
the worktree's author and scans as the decisions describe, sharing the
profile-names-story helper with the sibling's head check; `storyReviewSnapshot`
builds the baseline point and answers `published`; `src/storyReview.ts` adds
the field; `StoryReviewContextLine.tsx` reads it; the fixture module and the
spec; `dashboard/AGENT-LAUNCH-REVIEW.md`'s baseline paragraph says what the
baseline is for a story with published commits and how they are recognized.

Interim behavior: a file trunk and the story both changed inseparably is
listed from the restated tree without a flag until slice 2.

Safe stopping point: the story's main outcome is delivered.

### 2. A file trunk and the story both changed is flagged with trunk's changes included
Type: Behavior
Status: done
Accepted proof: `npm run test:dashboard -- dashboard/tests/story-review-trunk-own-changes.spec.ts dashboard/tests/story-review-trunk-own-flagged.spec.ts`
(four tests); the story-review suite and `recently-done-one-shot-review.spec.ts`;
`npm run typecheck:dashboard`; `npm run lint`.
Learnings: `listedFrom` in `server/storyReviewComparison.ts` is the one
listing of flagged files, for All changes and Since the review; `trunkLess`
answers `{ tree, inseparable }`, each inseparable path with its origin tree.
The flagged cases live in `tests/story-review-trunk-own-flagged.spec.ts`; the
fixture takes `published: 0 | 1 | 2` and `publishRewrittenLine` stages named
paths so the untracked `notes.md` stays out of a story commit. Slice 3's
cases go in their own spec file.
Proof: New case in `story-review-trunk-own-changes.spec.ts` for the flagged
file; the story-review spec suite; typecheck and lint.

Behavior: Ken-chan's `o3` rewrote the line `s2` changed in `src/c.ts` →
Refresh → `src/c.ts` is listed as “Modified src/c.ts, includes trunk's
changes”, counted and diffed from trunk before `s2` (`-c 3`, `+c trunk`); the
other files stay as before.

Change: the baseline point carries its inseparable paths; the snapshot lists
them from their `includesTrunkFrom` as `compareReviewPoints` lists a
conflicted file, reusing its selection and rename handling where it fits
rather than a second copy; the doc names the flag in All changes.

Safe stopping point: All changes is complete.

### 3. Since the review follows the story-only baseline and keeps it
Type: Behavior
Status: done
Accepted proof: `npm run test:dashboard -- dashboard/tests/story-review-trunk-own-since.spec.ts`
(four tests); the story-review suite and `recently-done-one-shot-review.spec.ts`;
`one-shot-landing-recovery.spec.ts` and `one-shot-landing-recovery-retention.spec.ts`;
`npm run typecheck:dashboard`; `npm run lint`.
Learnings: only the mark and the comparison's from point accept a tree
baseline (`reviewPointObjects(point, "tree")`); a commit range's points stay
commits, since `story-review-commit-admission.spec.ts` requires a tree there to
be refused. Whether trunk was integrated since the mark is answered by the
server as `since.trunkIntegrated`, the two baselines compared as trees
(`baselinesDiffer`), because a mark taken before the first publication holds a
commit whose tree equals the later baseline tree; the page's
`trunkIntegratedSince` is gone. A commit range keeps comparing its commits.
Marks are replaced, never deleted, and the baseline ref follows the same
overwrite. The fixture's authorship and publication helpers are in
`tests/support/storyReviewTrunkCommits.ts`.
Proof: New cases in `story-review-trunk-own-changes.spec.ts` (or a sibling
`story-review-trunk-own-since.spec.ts` if the file grows past its
neighbours') for the Since the review row; `story-review-mark.spec.ts`,
`story-review-since*.spec.ts`; typecheck and lint.

Behavior: the developer activates Mark reviewed; Yui-chan publishes `s3`
(`src/e.ts`) and Ken-chan `o4` (`src/f.ts`); the worktree is rebased onto
trunk → Refresh → Since the review, headed “Trunk was integrated since the
mark”, lists `src/e.ts` alone; All changes lists `src/a.ts`, `d.md`,
`src/e.ts`, `src/g.ts`, `notes.md`. Had only `s3` been published, Since the
review lists `src/e.ts` without that heading. After `git gc --prune=now` in
the project's repository, Refresh still compares with the mark.

Change: `reviewPointObjects` requires the baseline as a tree;
`markReviewedResponse` points the second ref at the baseline; the doc's mark
and Since the review paragraphs say the baseline tree is kept and that a
story commit published after the mark is listed.

Safe stopping point: the story's outcome is delivered for current Git.

### 4. An older Git keeps the published commits in and says why
Type: Behavior
Status: planned
Proof: New case on the `olderGit` fixture; the story-review spec suite;
typecheck and lint.

Behavior: the machine's Git refuses `merge-tree` → Review changes → All changes
lists `notes.md` and `src/g.ts` against trunk's merge-base, the context line
reads as today, and the feedback says this machine's Git cannot take the
story's published commits out of trunk; `published.kept` is `not-restated`.

Change: the baseline point's failure path answers `kept`;
`StoryReviewFeedback.tsx` explains it; the doc's Git-version sentence covers
it beside the mark's.

Safe stopping point: the story's outcome is delivered.
