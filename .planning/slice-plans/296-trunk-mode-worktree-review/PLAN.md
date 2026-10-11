# A Trunk Mode story started outside the dashboard offers Review changes

**Identity:** SEED-088#review-trunk-mode-story-worktree
**Source:** [story](../../seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-worktree),
refined 2026-10-11. Planning only; this plan grants no Take, execution, or
publication.

## Goal and boundaries

A developer on the machine where a Trunk Mode story's agent works can open
the story review on that agent's worktree although no dashboard launch
started it, and read its unpublished commits and uncommitted files as they
would a launched story's.

Preserved: every review a kept launch record offers today, and which
workspace it reads; the snapshot, its fetch and baseline; All changes, Since
the review, Commits and its Uncommitted changes item; Mark reviewed; the
landed comparisons; a never-launched story with no worktree on this machine
offering no Review changes.

Excluded, as the story records: reviewing only the story's own changes once
they reached trunk (the
[sibling story](../../seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes));
starting Trunk Mode from the dashboard; worktrees that are not linked
worktrees of the project's local checkout; a separate promise for Story
Branch Mode stories taken in a terminal, which the same rule serves without
reading a mode.

## Architecture

The dashboard's local boundary gains one more machine-local reading beside
its kept launch records: the project's local checkout's linked worktrees
(`git worktree list --porcelain` in `projectFolder(source).path`), each
worktree's per-worktree Git author (`git config --worktree --get
author.name`, what `workspace-agent-authorship.mjs` writes) and the agent
profile its head commits for that agent (`git show
HEAD:<agents directory>/<agent>.json`, the directory
`agentProfileDirectoryOf(source)` already resolves beside the backlog). A
worktree whose author is a known agent and whose head's profile for that
agent names the story's identity holds that story's claim. The Proposed
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
places worktree locations in this local operational view and never on
origin; nothing here reads them from the published snapshot, and nothing is
published.

The sessions answer (`case "sessions"` in `server/launchBoundaryAnswer.ts`,
parsed by `launchRecordsSchema`) carries the result as `workspaces`: one
entry per qualifying worktree with its project, identity, agent, path as the
page shows it, and branch. The shared rule `reviewWorkspaceOf` in
`src/storyReviewWorkspace.ts`, used by the card's `StoryReviewAction` and by
`reviewRequest` and `reviewedWorkspace` on the server, takes these entries
beside the records: the most recent record naming a workspace wins as today;
without one, a single entry for the story is the workspace, and several
entries are an ambiguity the review explains. The snapshot, file, range and
mark requests therefore read the same worktree because they resolve through
the same rule and the same answer. The snapshot reader needs only a
workspace, branch, remote and target, so its parameter narrows to that shape
(`ReviewedWorkspace`), which an `EstablishedContext` satisfies; a
Git-resolved worktree supplies `remote: "origin"` and the project's `ref` as
target, exactly as `executionStart.ts` does for a launch.

Considered and set aside, as the story records: recording the worktree path
in the published profile; matching by the profile's `branch`, which a Trunk
Mode profile records as `origin/main`; a hand-written launch record for a
terminal start. Also set aside: a separate request for a story's worktree,
since the sessions read already runs on the page's schedule and the card
needs the fact at the same time as the records; and synthesizing a launch
record for a found worktree, which would present Git evidence as a launch
that never happened. No Accepted ADR constrains this; the North Star's
"Remote history and optional local refresh" topic is unaffected, and no new
topic is warranted: the change extends built design that
`dashboard/AGENT-LAUNCH-REVIEW.md` records.

## Current decisions

- **Scan.** On each sessions read, for each configured project whose local
  folder exists: list worktrees, pass over the main worktree and any without
  a branch, read each remaining worktree's author and its head's profile for
  that agent. A Git failure on one worktree passes that worktree over; a
  failure listing a project's worktrees leaves that project without entries.
  The card then offers nothing, as on a machine without the worktree. No
  caching until a measured need: the scan is one `git worktree list` and two
  reads per linked worktree, on the existing 15 s schedule.
- **Precedence.** A kept launch record naming a workspace is still chosen
  first by `launchedAt`, before any Git entry; a record whose workspace is
  gone keeps its landed-run fallback as today.
- **Ambiguity words.** Several entries for one story answer the review as
  `unavailable` with the explanation “Several worktrees on this machine hold
  this story's claim for <agent>: <a>, <b>. The review cannot choose one.”,
  the paths as the context line would show them. The card still offers Review
  changes, so the developer learns why instead of seeing nothing.
- **Context line.** Shows the resolved worktree's branch and path exactly as
  for a launched workspace; nothing says the worktree came from Git.
- **Fixture.** `startOrigin.takenByAnotherAgent` gains a Trunk Mode variant
  (or an options argument) that runs the real start with `--mode trunk` and a
  workspace under `<project>/.worktrees/`, so the worktree is a linked
  worktree of the configured project exactly as a terminal `--trunk` start
  leaves it, with author config and profile written by the real scripts.

## Observed premises

Observed on 2026-10-11 in this worktree at `c032593e` with Node 24.21.0 after
`node scripts/setup-native.mjs npm`, `browser` and `check`; the scratch spec
and the fixture observation script were removed afterwards and no product
file changed.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| A real Trunk Mode start leaves a linked worktree the integration checkout lists, authored by the agent, with the claim at its head | Slice 1's scan and fixture | Script against `src/skills/dough-execute-plan/scripts` fixtures: `createQueuedTrunk`, `startCliResult(trunk, "trunk")`, then `git worktree list --porcelain` in the integration, `git config --worktree --get author.name` in the workspace, the committed profile, `rev-parse HEAD` and `origin/main` | Listed with `branch refs/heads/exec/trunk`; author `Yui-chan`; `.planning/agents/yui-chan.json` at the claim head names `SEED-A#a`, `mode: "trunk"`, `branch: "origin/main"`; head equals `origin/main`; the integration's own worktree config names no author |
| The existing review of a worktree whose head sits on trunk shows unpublished commits and uncommitted files, and after publication the uncommitted files alone, with Commits offering Uncommitted changes | Slice 1's review promise | Scratch Playwright spec on `unchangedWorktree` plus one commit and an untracked `notes.md`, a kept launch record, `openReview`; then `git push origin HEAD:main` from the worktree and Refresh | Before: `files` `notes.md`, `slice.txt`; `commits` one. After: `files` `notes.md`; `commits` none; `uncommitted` present; Commits radio offered; its rows `["Uncommitted changes"]` |
| A single review spec runs in this checkout through the project command | Every slice's proof | `npm run test:dashboard -- dashboard/tests/zz-scratch-trunk-premise.spec.ts` | Passed, including the build |
| The dashboard's configured test project is the fixture's checkout, so its worktrees are the project's | Slice 1's spec | Existing passing specs show the launched worktree relative to the project folder through `shownStartWorkspace(projectFolder(source), …)` (`story-review-context-line.spec.ts`) | Relied on as existing green behavior |

Consumers found for the changed surfaces: `launchRecordsSchema` (page parse
of the sessions answer; `workspaces` defaults to `[]` so an answer without it
still parses); `reviewWorkspaceOf` callers `StoryReviewAction.tsx`,
`storyReviewRequest.ts`, `storyReviewWorkspaceAdmission.ts` and the unit
spec `story-review-workspace.spec.ts`; `storyReviewSnapshot`'s
`EstablishedContext` parameter; and the two specs that take Story A through
the real start without a launch record,
`agent-launch-start-refusal.spec.ts` and
`responsive-session-reconciliation-refusals.spec.ts`, whose card will now
offer Review changes, since that Story Branch Mode worktree qualifies too.

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| A Taken story's card offers Review changes with no launch record when the project's checkout lists a linked worktree authored by its agent holding its claim | Slice 1 spec: after the Trunk Mode real start, Story A's card shows “Review changes” without `keepLaunchRecord` |
| The review reads that worktree: All changes lists the unpublished commit's files and the untracked file; Commits lists Uncommitted changes above the commit; the context line names its branch and worktree | Slice 1 spec: rows and context line values |
| After publication the head equals trunk: Refresh lists the uncommitted files alone and Commits offers Uncommitted changes with no commit | Slice 1 spec: `git push origin HEAD:main` from the worktree, Refresh |
| Mark reviewed and Since the review work on the resolved worktree | Slice 1 spec: mark, edit a file, Refresh, Since the review lists it; the mark request answers 200 |
| A kept launch record's workspace keeps precedence over a Git entry | Slice 1 unit cases in `story-review-workspace.spec.ts` |
| No qualifying worktree on this machine: no Review changes, Inspect story unchanged | Slice 1: existing specs on Taken cards without records stay green (`story-review-nothing.spec.ts`, the start-refusal specs' other assertions) |
| A worktree the agent left from an earlier story, at a head without this story's claim, is passed over | Slice 2 spec: a second worktree authored by the agent at the pre-claim trunk commit; the review reads the story's worktree alone |
| Two worktrees holding the claim: the review explains and names them, lists no files, offers no marking | Slice 2 spec: a second worktree on another branch at the claim head with the agent's author config |
| Existing review behavior unchanged | Each slice: every `dashboard/tests/story-review*.spec.ts`, `recently-done-one-shot-review.spec.ts`, and the two start-refusal specs green; `npm run typecheck:dashboard` clean |

## Ordered slices

### 1. A Taken story's worktree found by local Git offers Review changes
Type: Behavior
Status: done
Proof: New spec `dashboard/tests/story-review-trunk-worktree.spec.ts` for the
first four rows of the proof table on the new Trunk Mode fixture; new cases in
`story-review-workspace.spec.ts` for precedence; the story-review spec suite
and the two start-refusal specs named above; `npm run typecheck:dashboard` and
`npm run lint`.

Behavior: Yui-chan holds Story A in Trunk Mode, taken by the real start in a
terminal into `<project>/.worktrees/trunk-a`, with one commit past
`origin/main` and an untracked `notes.md`; this machine has no launch record
for it → the developer opens the backlog → the Taken card offers Review
changes → the review opens on All changes listing the commit's files and
`notes.md`, Commits lists Uncommitted changes above the one commit, and the
context line names the worktree's branch and `.worktrees/trunk-a`. The agent
publishes the commit → Refresh → All changes lists `notes.md` alone and
Commits offers Uncommitted changes with no commit. Mark reviewed marks the
snapshot; after an edit, Refresh opens Since the review on it. A story with a
kept launch record keeps reading it.

Change: a server module (for example `server/localWorkspaces.ts`) scans each
configured project's linked worktrees as the decisions describe and answers
`workspaces` in the sessions answer; `launchRecordsSchema` and
`MachineSessions` carry it to the page; `reviewWorkspaceOf` takes the entries
and returns a record's established context, a Git entry, or an ambiguity;
`StoryReviewAction` offers the action for a record or an entry;
`reviewRequest`, `reviewedWorkspace` and the mark path resolve through the
same rule, building the Git entry's reviewed workspace with `origin` and the
project's `ref`; `storyReviewSnapshot` takes `ReviewedWorkspace`. The
ambiguity returned here is answered in slice 2; until then the rule treats
several entries as none. `startOrigin.ts` gains the Trunk Mode start under
`.worktrees/`. `dashboard/AGENT-LAUNCH-REVIEW.md`'s opening paragraph says
which stories offer Review changes and how a worktree is found without a
launch record.

Interim behavior: several qualifying worktrees offer no Review changes until
slice 2 explains them.

Safe stopping point: the story's main outcome is delivered.

### 2. Stale worktrees are passed over and an ambiguous pair is explained
Type: Behavior
Status: planned
Proof: New cases in `story-review-trunk-worktree.spec.ts` (or a sibling
`story-review-trunk-worktree-ambiguity.spec.ts` if the file grows past its
neighbours' size) for the two remaining proof rows; the story-review spec
suite; typecheck and lint.

Behavior: The checkout also lists a worktree authored by Yui-chan at the
trunk commit before the claim → the card offers Review changes and the review
reads `.worktrees/trunk-a` alone. A second worktree on another branch at the
claim head, authored by Yui-chan → Review changes opens a review whose
feedback says several worktrees on this machine hold the story's claim for
Yui-chan, naming both as the context line would show them, with no file
browser, diff, or marking controls.

Change: the server answers the ambiguity as an `unavailable` review with the
decided words; `StoryReviewAction` offers the action for an ambiguity too;
`reviewWorkspaceOf`'s unit cases cover a stale entry (none is produced for
it, since the scan already requires the claim) and two entries. Complete
`dashboard/STORY-REVIEW-WORKSPACE.md`, where slice 1's refactor moved the
workspace rule, with the stale and ambiguous rules.

Safe stopping point: the story's outcome is delivered.

## Execution

Story Branch Mode in `.worktrees/a-trunk-mode-story-started-outside-the-dashboard`
on `claude/a-trunk-mode-story-started-outside-the-dashboard`, agent
stanly-chan; claim `2cb26084` accepted on `origin/main`. Increments publish to
the remote execution branch, observed there through managed delivery (GitHub
Actions, `ci.yml`).

Slice 1 accepted proof: `npm run test:dashboard --
dashboard/tests/story-review-trunk-worktree.spec.ts
dashboard/tests/story-review-workspace.spec.ts` (8 passed after the refactor);
the full `npm run test:dashboard` before the refactor, green except the
failure below; `npm run typecheck:dashboard` and `npm run lint` clean.

Learnings for remaining work:

- The rule and `ReviewedWorkspace` live in `src/storyReviewWorkspace.ts`; the
  server resolves through `resolvedWorkspace` in
  `server/storyReviewWorkspaceAdmission.ts`, which reads local Git only when no
  record names a workspace. Slice 2's ambiguity answer belongs on that path.
- Refresh keeps the comparison shown, so the spec selects Since the review
  after Refresh, as the launched-workspace specs do.
- The scan was measured on this repository's checkout: 15 worktrees, about
  0.6 s read one after another, so no caching.
- One full-suite failure is unrelated and unrepaired:
  `project-read-recovery.spec.ts` “a later failed check keeps only Pygardon's
  previous snapshot” reported “No revision check was made within a minute.”
  under a load average near 29. Its trace
  (`dashboard/test-results/2026-10-11T00-23-28.895Z/`) shows the sessions
  answers returning in 2–7 ms, four detail reads aborted, then a whole
  Pygardon read answered 502 before the step's check was noted. 27 further
  repeats passed, so the cause is located but not reproduced.

## Story obligations

### G1. Several qualifying worktrees offer no review
Reported: slice 1 — "several qualifying worktrees offer no Review changes until slice 2 explains them"
Story clause: "Review changes opens a review that says so and names them"
Disposition: receiving slice 2

### G2. Scan failure paths have no test
Reported: slice 1 — "Scan failure paths have no test: a Git failure on one worktree, a failed worktree listing, a detached worktree, or a project folder that is itself a linked worktree."
Story clause: "the card offers no Review changes"
Disposition: no user cost "can open the story review on that agent's worktree": a worktree that cannot be read is passed over, which leaves the card as it is today on a machine without the worktree.

### G3. Story Branch cards in the start-refusal specs are not asserted
Reported: slice 1 — "that Story A's card in the two start-refusal specs now shows Review changes (its Story Branch worktree qualifies) is expected but not asserted anywhere"
Story clause: "this story verifies Trunk Mode only"
Disposition: excluded "this story verifies Trunk Mode only"

### G4. No new spec for another machine
Reported: slice 1 — "no new spec; it relies on existing specs where no worktree qualifies"
Story clause: "the card offers no Review changes"
Disposition: proved by slice 1: `dashboard/tests/story-review-nothing.spec.ts` “a story whose kept launch record names no workspace offers no review”, whose card has no Review changes button and whose review request answers 404 with the scan running

### G5. Scan cost was not measured
Reported: slice 1 — "A checkout with many worktrees, such as this repository's, pays that every read. This was not measured."
Story clause: "the project's local checkout lists a linked worktree"
Disposition: no user cost "can open the story review on that agent's worktree": measured at acceptance, 15 worktrees read in about 0.6 s one after another on the 15 s schedule.

### G6. Since the review is selected after Refresh
Reported: slice 1 — "the spec selects the \"Since the review\" radio after Refresh rather than expecting Refresh to open on it"
Story clause: "as for a launched workspace"
Disposition: proved by slice 1: `dashboard/tests/story-review-trunk-worktree.spec.ts` asserts the refreshed snapshot's `since.files` and the Since the review rows; `story-review-comparison.spec.ts` “Refresh keeps all changes shown” is the launched behavior
