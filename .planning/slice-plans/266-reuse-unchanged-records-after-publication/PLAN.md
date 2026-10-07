# Refresh published work without rereading unchanged files

**Identity:** SEED-113#reuse-unchanged-records-after-publication
**Source:** [refined story](../../seeds/SEED-113-dashboard-github-responsiveness.md#reuse-unchanged-records-after-publication).
**Prepared:** 2026-10-07. Planning only, in the story's existing preparation
workspace on `claude/refresh-published-work-without-rereading-unchang`.

## Goal and boundaries

When the configured ref names a new commit, the dashboard shows that commit by
reading only what GitHub's own account of the commits since the revision this
dashboard process last read shows to have changed. Unchanged backlog, seed,
plan, profile, setting, and done-record text and listings are reused as the new
revision's own; changed records are read at the new revision; a profile's
allocation history or a plan's last commit time is reused only when no commit
between the two revisions touched it. Every revision, provenance, and gap
qualification of a full read is kept.

Include the story's five required behaviors, its evidence and failure
constraints, and its sixteen key examples.

**Intent clarified on main, 2026-10-07:** Terry's frequent "Human developer
unknown" report and request-count concern make unchanged assignment credit an
explicit acceptance journey. Preserve the existing execution identity and
completed-slice proof; the additional proof belongs to remaining slice 3.
Several assignments can credit the same human, but credit stays owned by each
assignment's addition. Reuse established credit on unchanged-path evidence;
rate-limit recovery belongs to its sibling story, and ordinary transient
failure retries remain deferred there.

Reads at a story branch head keep today's cost. Sharing held text across
separately launched dashboard processes or across a restart, a request-count
or latency budget, the commit comparison launch settlement makes, avatar
reads, cooldowns, and bounded demand are deferred or belong to other stories.

## Base this plan is written against

Trunk at `2eb5b0644c660b3753f88ba7928b089153a23738`, the revision this
preparation was announced at, which contains the sharing story's `execGh` with
its process-wide `OutstandingReads` and the rate-limit story's plan but not
its delivery. The queued correction
[SEED-113#shared-read-waiter-residue-correction](../../seeds/SEED-113-dashboard-github-responsiveness.md#shared-read-waiter-residue-correction)
and the queued
rate-limit recovery story (recoverable at `11c71766:.planning/seeds/SEED-113-dashboard-github-responsiveness.md#recover-consistently-from-rate-limits`)
both change `ghRead.ts`; no slice here depends on either state, and the
comparison read reuses what `containmentRead.ts` already does with a refused
answer, so a cooldown delivered first or later applies to it as to every read.

## Existing solutions and current decisions

PFE over the dashboard server, page, and test support found the owners this
plan reuses or changes; no new boundary, store, or API is introduced.

- **One memo already recalls answers by commit and by blob.** `PinnedTexts`
  (`dashboard/server/pinnedTexts.ts`) keeps text, listings, last commit times,
  and additions under `<repository>\0<revision>\0<entry>`, listed records'
  text under their blob sha, and one path's change per walked commit under
  `<commit>\0<path>\0change`, all in one bounded insertion-ordered map of 500
  entries. Decision: the evidence of what changed between two revisions, and
  the whole change list of each commit, join that memo under their own entry
  shapes; `recalled` gains one fallback before reading, and no second cache
  or store is added.
- **A commit's change list is already read, for one path.**
  `commitChangeViaGh` (`dashboard/server/ghProfileAddition.ts`) asks
  `commits/<sha>` and keeps only the one path's status and the committer.
  Decision: slice 1 remembers the whole answer by commit and derives that one
  path's change from it, so the addition walk and the new evidence ask GitHub
  about a commit once between them.
- **A comparison of two commits is already read.** `containsViaGh`
  (`dashboard/server/containmentRead.ts`) asks `compare/<base>...<head>` with
  `--include`, reads `status` through `parseIncluded`, and recognizes a rate
  limit through `limitedAsDirected`. Decision: the evidence read asks the same
  endpoint with `per_page=10` for `status`, `total_commits`, and the listed
  commits' shas, through the same answer parsing; launch settlement's read is
  not changed.
- **Identical `gh` calls are already shared.** `execGh` runs every call through
  `OutstandingReads` keyed by its arguments, so the reads a page issues at a
  new revision at once share one comparison and one read per commit.
- **The boundary already knows which revisions the ref named.** `perform`'s
  `ref` case and `performRevisionCheck` answer the revision the source's ref
  names; a branch head is resolved and remembered separately in `BranchHeads`.
  Decision: evidence is attempted only for a revision the source's ref
  resolution or check named for this process, against the latest revision at
  which this process answered the source's backlog; a branch head never gets
  evidence, so branch reads keep today's cost.
- **The fake GitHub already parses comparisons and commits.** `parseRequest`
  (`dashboard/tests/support/ghRequest.ts`) recognizes `compare` and `commit`
  requests; `publishMovingFiles` (`dashboard/tests/publishedFiles.ts`) and
  `publishMovingOrigin` answer a comparison with no connection and a commit
  only when a path's history lists it. Decision: slice 2 lets a trunk move
  name the commits it was made by, each with its change list, so the fake
  answers the comparison of the previous trunk with the new one as ahead by
  them; a move without them keeps answering no connection, which the boundary
  treats as no evidence.

Current decisions this plan fixes:

- **The bound.** Evidence is used when the comparison is `ahead` or
  `identical`, `total_commits` is at most 10, and every listed commit's change
  list is whole: fewer than 300 files, GitHub's page size for a commit's files.
  Otherwise the pair is remembered as no evidence.
- **What a commit touched.** Each changed file's `filename`, and its
  `previous_filename` when GitHub gives one, whatever the status. A listing at
  a directory is reused only when no touched path lies under it.
- **Failure.** A comparison or commit read that fails is not remembered; the
  read that needed it proceeds as today. A rate-limited one is reported as any
  rate-limited read is, through the existing `limitedAsDirected` path.

The North Star topic
[Reuse is established by the commits between](../../NORTH-STAR.md#reuse-is-established-by-the-commits-between)
records this direction until the code explains it. Accepted ADR 0000 keeps the
design with the feature; ADR 0002's high cohesion is why one memo rule serves
text, listings, additions, and commit times alike. No Accepted decision
conflicts.

## Decisive premises and observations

Observations ran in this preparation workspace at trunk
`2eb5b0644c660b3753f88ba7928b089153a23738` with dependencies from
`env -u NODE_ENV npm ci --ignore-scripts --offline`. O1 started an isolated dev
server over real HTTP with the synthetic `gh`; O2 asked the real GitHub,
read-only, six times; O3 read GitHub's documentation.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| At a new trunk revision whose records are unchanged, the backlog, each seed and plan the backlog names, the setting file, the profile and done listings, each profile's history listing, and each Taken plan's last commit time are asked again; listed profiles and done records are not. | Slices 2–3's remedy and proof entry. | O1, a temporary page probe through `dashboardTest.ts` and `publishMovingFiles`, removed after the run: at revision A it asked `ref main`, the backlog, the seed, both listings, the profile, the plan, `open-dough.json`, the profile's history list, the plan's commit time, and one commit; after `moveTrunk` to B with identical files and a reload it asked `ref main`, the backlog, both listings, the seed, `open-dough.json`, the plan, the profile's history list, and the plan's commit time again, and no profile or done record. Reproduced. |
| GitHub's comparison reports `status`, `ahead_by`, `behind_by`, `total_commits`, the listed commits, and the net changed files; `per_page` bounds the commits listed while `total_commits` counts them all; a reversed pair is `behind`. | Slice 2's evidence read and bound. | O2 on `terryyin/open-dough`: `compare/f0045db1...2eb5b064?per_page=10` answered `status: ahead`, `ahead_by: 1`, `total_commits: 1`, one commit, one file (`.planning/agents/yeongsheng-chan.json` added); `compare/64e4268c...2eb5b064?per_page=1` answered `total_commits: 2` with one commit listed; `compare/2eb5b064...64e4268c` answered `status: behind`, `behind_by: 2`, `total_commits: 0`. |
| A commit's answer names its parents and each changed file with its status. | Slices 1–2's change list. | O2: `commits/2eb5b064` answered `parents: [f0045db1…]` and `files: [{ ".planning/agents/yeongsheng-chan.json", added }]`. |
| GitHub lists at most 300 of a commit's files in one answer and at most 250 commits of a comparison without paging. | The bound and the "whole" test. | O3, GitHub's REST documentation for commits, fetched 2026-10-07: "If there are more than 300 files in the commit diff … the response will include pagination link headers for the remaining files, up to a limit of 3000 files"; a comparison without paging "is limited to 250 commits", and its changed files "includes up to 300 changed files for the entire comparison". No commit in this repository's last 3000 reaches 300 files, so the paginated shape itself is not observed here; the bound treats 300 listed files as not whole. |
| The addition walk reads each commit's whole answer and keeps one path's change of it; the memo is one bounded insertion-ordered map. | Slice 1's structure and slice 2's memory bound. | Reading `ghProfileAddition.ts` (`commitChangeViaGh` parses `answer.files` and keeps `status` for `path`) and `pinnedTexts.ts` (`kept` evicts the oldest beyond 500 entries; `adder` keys the change by `<commit>\0<path>\0change`). |
| A check-found revision is read with `backlog-at`, which names the revision alone; the boundary learns which revisions the ref named from its own `ref` and check answers. | The base and eligibility decision. | Reading `src/authenticatedRead.ts` (a membership read with `revision` names it alone; a check names `since`), `server/requestedRead.ts` (`backlog-at`), `performedRead.ts` (`ref` answers `revision`), and `performedRevisionCheck.ts` (`checks.check` answers `revision` and `changed: revision !== since`). |
| Identical `gh` calls from concurrent requests share one subprocess. | Slice 2: one comparison and one read per commit for a page's burst of reads at the new revision. | Reading `ghRead.ts`: `execGh` runs through `outstandingGh.waitFor(JSON.stringify(args), …)`. |
| The fake GitHub answers a comparison with no connection and a commit only when a history lists it. | Slice 2's test support. | Reading `tests/publishedFiles.ts` (`compare` → `noConnection`; `commit` → `commitAnswerIn(revisions, sha) ?? noConnection`) and `tests/publishedOrigin.ts`. |
| Which existing journeys move the trunk and assert what was asked. | Slices 2–3's regression set. | `grep -ln "moveTrunk(\|origin.push(\|\.push(revision" dashboard/tests/*.spec.ts` with a count of call assertions: `auto-refresh-branches`, `project-read-isolation`, `auto-refresh-project-isolation`, `read-failure`, `reopened-project-reads`, `auto-refresh-visibility`, `published-facts-isolation`, `direction-disclosure`, `auto-refresh`, `auto-refresh-rate-limit`, `auto-refresh-detail-recovery`, `accessible-overview-keyboard`, `preparation-legend`, `dashboard-header`, `auto-refresh-unusable-branch`, `project-keyboard-navigation-focus`, `auto-refresh-recovery`, `agent-roster-avatar`, `settled-page`, `frame-overview-look`. `reopened-project-reads.spec.ts` asserts the unchanged seed is read again at B, which slice 2 reverses. The suite was not run against a crude change: the exact failing set is learned at slice 2 by running these twenty. |
| The workspace lints clean with the story and North Star changes. | Delivery gate. | `env -u NODE_ENV node scripts/lint.mjs`: "All matched files use Prettier code style!". |

Literal observation commands, run from the preparation workspace:

```sh
# O1 — temporary page probe dashboard/tests/reuse-planning-probe.spec.ts, removed after the run; passed, writing the reads above
PROBE_OUT="$CLAUDE_JOB_DIR/tmp/probe.json" env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- reuse-planning-probe.spec.ts --workers=1

# O2 — the real gh, read-only
gh api "repos/terryyin/open-dough/compare/f0045db1418b04c08e9067f5678b64b44e034cff...2eb5b0644c660b3753f88ba7928b089153a23738?per_page=10" --jq '{status, ahead_by, behind_by, total_commits, commits: (.commits|length), files: (.files|map({filename,status}))}'
gh api "repos/terryyin/open-dough/compare/64e4268c...2eb5b0644c660b3753f88ba7928b089153a23738?per_page=1" --jq '{status, total_commits, commits: (.commits|length), files: (.files|length)}'
gh api "repos/terryyin/open-dough/compare/2eb5b0644c660b3753f88ba7928b089153a23738...64e4268c" --jq '{status, ahead_by, behind_by, total_commits}'
gh api "repos/terryyin/open-dough/commits/2eb5b0644c660b3753f88ba7928b089153a23738" --jq '{sha, parents: (.parents|map(.sha)), files: (.files|map({filename,status}))}'

# O3 — GitHub's documentation, https://docs.github.com/en/rest/commits/commits
```

These observations establish today's behavior, GitHub's answer shapes, and a
usable proof route, not the remedy.

## Promise and proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| A read at the new revision of a path no commit between changed is answered from what is held at the revision last read, without a `gh` call, and kept as the new revision's own: backlog, seeds, plans, both listings, profiles, the setting file, done records. | 2: boundary cases counting `gh` calls at B for each kind of read; the page journey of an unrelated commit. |
| A path a commit between changed, or that the evidence does not cover, is read at the new revision as today, and its facts appear at the observed revision. | 2: a changed seed, a new seed named by a changed backlog, an added done record, a changed plan. |
| Absence stays absence: a named record the new revision lacks is missing, a profile or done record its listing no longer names is gone, and held text never fills them. | 2: a missing record asked at B; a profile removed by a commit between is not shown and its text not served. |
| Only GitHub's account establishes reuse; a comparison that is not ahead, beyond the bound, or with a change list not given whole establishes nothing and is remembered as no evidence; a failed comparison or commit read is not remembered and the read proceeds as today; a rate-limited one is reported as any rate-limited read. | 2: `behind` and `diverged`, `total_commits` 11, a 300-file commit, a connection failure then a later success, and a `Retry-After` refusal. |
| Evidence cost is one comparison and one read per commit between, each remembered by commit, and no listed record is reused worse than today. | 1–2: the addition walk asks each commit once across revisions; a page's burst at B shares one comparison and one commit read. |
| A branch head read never compares. | 2: a story branch plan read at a moved head asks the plan and its commit time only. |
| A profile's addition, its committer, and a path's last commit time are reused only when no commit between touched the path; identical text is never that evidence; a removed and re-added profile credits the re-adding commit. | 3: boundary cases on `committed=added` and `committed=last` at B; the page journey crediting the new committer. |
| Several assignments crediting one human retain their separate attribution after an unrelated publication, with zero profile-history or addition-commit requests beyond shared change evidence; when one profile is touched only its history is read. | 3: a seven-profile page journey observing cards, details, and roster credit while counting history and commit calls separately from comparison evidence and avatar images, followed by a one-profile change. |
| Observation is otherwise unchanged: the page replaces the whole view with the new revision and keeps revision, retrieval time, group arrival, and gaps; a reload, second tab, or return to a read revision costs what it costs today; memory stays bounded. | 2–3: the twenty trunk-moving journeys and `reopened-project-reads.spec.ts`; the memo keeps its one 500-entry bound. |
| The reading contract and request accounting describe the result. | 2, 3: `dashboard/PUBLISHED-OBSERVATION.md` and `dashboard/GITHUB-REQUESTS.md`, each changed with the behavior it describes. |

## Ordered slices

### 1. A commit's change list is remembered whole, by commit

Type: Structure
Status: planned
Proof: `authenticated-read-profile-addition.spec.ts`,
`profile-addition-latency.spec.ts`, `taken-agent-profile-refresh.spec.ts`,
and `agent-roster-avatar.spec.ts` stay green, including their assertions that
each walked commit is asked once; `npm run typecheck:dashboard`.

Internal change: `commitChangeViaGh` becomes a read of one commit's whole
record, `commitViaGh` in `ghProfileAddition.ts` (or a new
`ghCommit.ts` it and slice 2 share): the sha, the committer name, date,
matched login, and avatar as today, and every changed file's `filename`,
`status`, and `previous_filename`, with whether the list is whole (fewer than
300 files). `PinnedTexts.adder` remembers that record under
`<repository>\0<commit>\0commit` and derives the one path's `CommitChange`
from it, so the walk answers exactly what it answers today, including the
ended walk for a path the list does not name. The `\0change` entry shape goes.

Enables slice 2, whose evidence is the same commit records.

### 2. Records and listings unchanged since the revision last read are not read again

Type: Behavior
Status: planned
Proof: New `dashboard/tests/authenticated-read-revision-reuse.spec.ts` at the
boundary through `startDashboardServer` and `rawRequest`, with one answerer
publishing revisions A and B, the comparison, and the commits between, counting
the `gh` calls GitHub received; new page journey
`dashboard/tests/unchanged-records-refresh.spec.ts` through `dashboardTest.ts`
and `publishMovingFiles`; `reopened-project-reads.spec.ts` reworded for its
last step; and the twenty trunk-moving journeys named in the premises.

Behavior: a dashboard process has answered a source's backlog at revision A and
holds its records → the source's ref resolution or check names B, and reads at
B arrive → the boundary compares A with B once (`compare/A...B?per_page=10`,
through the containment read's answer parsing) and reads each listed commit's
record once (slice 1); when B is ahead of or identical to A, at most 10 commits
lie between, and every change list is whole, each read at B of a path no
commit touched (a file, a listing with no touched path under it) is answered
from what is held at A and kept under B, without a `gh` call; every other read
at B asks GitHub as today. The comparison and the commit reads are attempted
only for a revision the source's ref named for this process, never for a
branch head, and the base is the latest revision at which this process
answered the source's backlog. A `behind`, `diverged`, over-bound, or not-whole
answer is remembered as no evidence for the pair; a failed comparison or commit
read is not remembered, and the read that needed it proceeds as today; a
rate-limited one is reported as any rate-limited read. A listed profile or done
record keeps its reuse by blob sha. Covers the story's examples of an unrelated
commit, a changed seed, a new seed with a changed backlog, an added done record
with a changed plan, a removed profile, a missing record, a non-descendant
revision, the bound, the failure, a move from A past B to C, a restarted
server, and a second tab.

Test support: `publishMovingFiles.moveTrunk(at, by)` takes the commits the
move was made by, each a sha, a committer, and the files it changed, and the
fake answers `compare/<previous trunk>...<at>` as ahead by them (with
`total_commits` their count, `per_page` honoured) and each sha's `commit`
request with its change list; a comparison of any other pair answers
`diverged`, and a move without `by` keeps answering no connection. A boundary
answerer in the new spec composes the same answers from
`originAnswers.ts` and `pathHistoryAnswers.ts`.

Documentation: `dashboard/PUBLISHED-OBSERVATION.md` (what a newly found
commit reads) and `dashboard/GITHUB-REQUESTS.md` (what a newly published commit
costs: the comparison, one read per commit between, and the changed records).

### 3. History facts are reused only when no commit between touched the path

Type: Behavior
Status: planned
Proof: New cases in `authenticated-read-revision-reuse.spec.ts` for
`committed=added` and `committed=last` at B; a journey in
`unchanged-records-refresh.spec.ts` whose Taken card keeps its credited human
and slice clock after an unrelated commit with no history list or commit time
asked, and credits the re-adding committer after a profile is removed and
re-added with identical text; `taken-agent-profile-refresh.spec.ts` and
`profile-addition-latency.spec.ts` stay green.

Expand the journey to seven readable assignments crediting one human. After
an unrelated single-commit publication, observe each credited committer on its
card and detail and in the roster, and assert its original allocation commit
through the addition-read boundary. Count zero profile-history listings or
addition-commit requests beyond the comparison and its shared commit record.
Then publish a modification of one profile:
only its history is listed and walked, while the other six credits reuse
their own evidence. Retain the removed-and-re-added example with a different
committer even when profile bytes are identical. These call assertions prove
the request reduction; equal human names are never the cache key. Existing
avatar and unknown-reason cases remain regressions.

Behavior: the evidence of slice 2 is held for A and B → a read at B asks which
commit added a listed profile's allocation, or when a plan or profile was last
committed → when no commit between touched the path, the addition or commit
time held at A is answered and kept under B without a `gh` call; when one did,
the history is listed and walked, or the commit time read, at B as today, so a
profile removed by one commit and re-added by another with identical text
credits the re-adding commit's committer and time. Identical text, held under
a blob sha or otherwise, is never consulted for this.

Documentation: `dashboard/GITHUB-REQUESTS.md` (history listings and commit
times at a new revision).

## Verification, sizing, and delivery

Each slice owns its product change, outside-in proof, and cleanup together.
Write behavior tests at the existing boundary and page seams; inject no
prepared memo and add no product test hook. The quiet reporter requires silent
passing journeys; clear conflicting color variables, and `NODE_ENV` in a
dashboard-launched session.

At each slice, run its new spec and the named regressions it reaches:
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <spec files> --workers=2`.
Run `npm run typecheck:dashboard` for the changed server contracts. Slice 2
changes what every read at a resolved revision answers, so run the whole
`npm run test:dashboard` before delivering it; slice 3 changes the addition and
commit-time reads every Taken card waits on, so run it before delivering slice
3 too.

Execution follows the installed post-change-refactoring and delivery workflow.
The local commit gate is the check-only `.githooks/pre-commit`, which runs
`npm run --silent lint -- --staged`. Hosted checks remain owned by execution's
publication and CI workflow. Keep the enduring behavior in the tests,
`dashboard/PUBLISHED-OBSERVATION.md`, and `dashboard/GITHUB-REQUESTS.md`. At
wrap-up, retire the North Star topic this plan follows.

No numeric slice target, hard limit, or S/M/L bands were supplied. Each slice
has one proof loop. Slice 2 is the largest: one memo fallback, one evidence
read, and the test support for commits between revisions, with the twenty
trunk-moving journeys as its regression set. If execution disproves an observed
premise or the boundedness of a slice, stop safely and revise the remaining
plan within the same outcome; story-boundary changes stay with Terry.
