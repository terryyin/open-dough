# Recently done reads beside owners, keeps the session look, and closes completely

**Identity:** SEED-107#recently-done-correction
**Source:** [correction story](../../seeds/SEED-107-dashboard-recently-done.md#recently-done-correction),
a bounded retrospective correction of the completed execution of
`SEED-107#recently-done` (recoverable at `1f929859:.planning/seeds/SEED-107-dashboard-recently-done.md`)
under plan 253 (recoverable at
`1f929859:.planning/slice-plans/253-dashboard-recently-done/PLAN.md`). Reviewed commits:
0f334e41, 0b669ed2, 0acb8a8a, 73958ca3, 53333034, 179c375c.
**Prepared:** 2026-10-06. Planning only, in the story's established
workspace (branch `claude/dashboard-shows-recently-done-stories-with-their`).

## Goal and boundaries

One bounded correction of the delivered Recently done story: the done-record
read no longer holds back or fails owners, preparation, and progress, and it
stops costing one sequential `gh` call per record per revision; a story's
sessions look as they did inside a work card, and the same inside a done
card; unreadable done records are proved as the column lists them; and the
one-shot closure guidance names the done records in the result commit.

Preserved promises: every Scope item and key example of
`SEED-107#recently-done` (recoverable at `1f929859:.planning/seeds/SEED-107-dashboard-recently-done.md`)
as delivered, including “When done records cannot be read, the column says so
and still lists the sessions” and the 30-day window. Plan 253's decisions
stay: one JSON file per done story, read only through the local boundary's
listed read, format owned by the shared done-record module.

Material exclusions: no new done-record field, format, or window; no change to
which records are listed or how a record is parsed; no LRU or size change to
`PinnedTexts` (see Current decisions); no change to the agent-profile read's
results, settings text, or reachability checks beyond sharing the faster
listed read.

## Current findings

1. **The done read gates the published read.**
   `dashboard/src/publishedWorkRead.ts` awaits `readDoneStories` in the same
   `Promise.all` as `enrichPreparation` and `readAssignments`; the first
   snapshot with owners is shown only after it. At the shared 30 s
   `readWaitLimitMs`, a still-unanswered done read sets `bound.aborted` before
   `snapshotUnread` is taken, so the whole snapshot ends as a read problem.
   `dashboard/server/listedRecordsRead.ts` `performListedRecordsRead` reads each
   listed file one `gh` call at a time; `dashboard/server/pinnedTexts.ts` keys
   every text by revision (500 entries, oldest first out), so each new revision
   rereads every record. About 150 stories complete in 30 days here.
2. **CSS regression from slice 4's refactor.** 53333034 replaced
   `.card-sessions .session-entry { background: var(--panel) }` with a
   selector added to `.launch-local { color: var(--quiet) }` in
   `dashboard/src/agent-launch.css`. Work-card session entries now take
   `.session-entry`'s `--surface`, the card's own background, and quiet text;
   `.done-story-sessions` entries never had the panel background.
3. **One-shot guidance.** `src/skills/dough-execute-plan/references/one-shot.md`
   “Complete a queued story in the same commit” does not say the result commit
   includes the done records `complete` wrote or removed. 0b669ed2 fixed the
   same omission in the shell substitutes (`commit -a` left the new untracked
   record behind and workspace retirement failed in CI).
4. **Untested unreadable-record display.** `RecentlyDone.tsx` `DoneReadGaps`
   lists “Unreadable done records” with no test, and the step “an unreadable
   done record: the column says so…” in
   `dashboard/tests/recently-done-stories.spec.ts` proves a failed connection.

## Direction and PFE

- **Later detail, not snapshot read.** The published read already has the
  rule this needs: humans and slice clocks are “later details of the same
  read… their latency and failure, the bound included, stay their own”
  (`readPublishedWork`'s comment; `readAttributedAssignments` with its partial
  callback; `detailGapProblem` in `readWaitBound.ts`). Done stories become one
  more such detail: started with the profile and preparation reads, shown in
  whatever snapshot is shown when they answer, awaited only before the final
  snapshot, and their bound gap is the column's `unavailable` problem, never
  `snapshotUnread`. `readDoneStories` already turns any failure into
  `unavailable`. No new progress mechanism.
- **Concurrent listed reads.** `dashboard/src/repositoryFileReads.ts` has a
  private `mapPool` (bounded worker pool, limit 4) for preparation reads. Move
  it to one shared module and use it in `performListedRecordsRead`; do not
  write a second pool.
- **Reuse by blob.** GitHub's contents listing already carries each file's
  blob `sha`; `listRepositoryDirectoryViaGh` drops it. Keep one listing memo:
  the listing keeps each file's name and `sha`, the existing `lister` answers
  the names its other callers use, and the listed read remembers each text
  under its blob `sha`, which never changes, so a later revision whose listing
  names the same blob asks GitHub nothing for it.
- **One listed-records shape (PFE on agent profiles).** Agent profiles go
  through the same `performListedRecordsRead` and are also reread at every
  revision; their count is small (Taken and Preparing work), so they gain the
  change by sharing it, not by a second path. `branchReachability.ts` and
  other `lister` callers keep names only.
- **CSS.** Restore the panel background for entries inside both card kinds in
  one rule; `.launch-local` keeps its own quiet rule.
- **Guidance.** Written once for the executing agent, per
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md);
  `dough-product-backlog/SKILL.md` and `dough-story-wrap-up/SKILL.md` already
  name the done record as a closure change and are the wording to match.

No Accepted ADR conflicts. No North Star topic is needed; plan 253's topic
already governs the record.

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| A held done record read holds back owners, preparation, and progress (slice 2's symptom) | One temporary probe spec (deleted after the run) built on `profile-addition-latency.spec.ts`'s `publishes` + held-answer pattern with one done record whose content read waited: `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts dashboard/tests/zz-probe-done-hold.spec.ts --reporter=line` → while held the Taken card read “Reading agent profile… Reading preparation… Reading plan slices…”; on release it showed “Akiho-chan · Fixture Committer · Claude Code” and “Current slice started 12 min ago”, then the done card. 1 passed. |
| At the bound the whole snapshot fails (slice 2) | Read `readPublishedWork`: `show(...)` with owners first runs after the `Promise.all`; `snapshotUnread = bound.aborted` is taken after it, and `bound.throwIfAborted()` ends the read with the read problem. |
| Done failure already becomes the column's gap (slice 2) | `doneStories.ts` `readDoneStories` catches every error from `readDoneRecordsAt` and returns `{ status: "unavailable" }`; `DoneReadGaps` renders it. |
| A later detail's held/bound journey has a harness (slice 2) | `profile-addition-latency.spec.ts`: `pausePageClockAt`, `publishes(...)` with a wrapping `RepositoryAnswerer` holding one request, `page.clock.runFor(30_000)` after membership shows. |
| Unreadable records are shown but untested (slice 2) | `grep -rln "is unreadable:\|Unreadable done\|schemaVersion must be" dashboard/tests` → no done-record hit (only agent-profile matches in `agentRosterRecords.ts`, `taken-agent-profile.spec.ts`). `product-backlog-done-record.mjs` `parseDoneRecord` answers “done record schemaVersion must be 1”, `parseDoneRecordFile` “done record names another identity”. |
| The failed-read step is misnamed (slice 2) | `recently-done-stories.spec.ts` line 132: step “an unreadable done record…” publishes `unanswered: [unanswered]`, a lost connection, and asserts “Done stories could not be read.” |
| Records are read one at a time and keyed by revision (slice 3) | `listedRecordsRead.ts` lines 116–119 `for … await readPinned(path)`; `pinnedTexts.ts` `key(source, revision, path)`, `pinnedTextLimit = 500`. |
| GitHub's listing carries each blob's `sha` (slice 3) | `gh api -H "Accept: application/vnd.github+json" "repos/terryyin/open-dough/contents/.planning/slice-plans?ref=main" --jq '.[0] \| {name,type,sha}'` → `{"name":"224-dashboard-owned-ci-monitoring","sha":"93fc81ab…","type":"dir"}`, equal to `git ls-tree origin/main`'s object id. `listRepositoryDirectoryViaGh` keeps only `name`. |
| The fake listing has no `sha` (slice 3) | `dashboard/tests/originAnswers.ts` `directoryListingAnswer` emits `{ name, path, type }`; callers: `publishedFiles.ts`, `publishedOrigin.ts` (2), `committedOrigin.ts`, `support/fakeGitHub.ts`, `authenticated-read-agent-settings.spec.ts`. |
| One listed read serves both kinds; other listers need names only (slice 3) | `performedRead.ts` calls `performListedRecordsRead` for `agent-profiles-at` and `done-records-at`; `pinned.lister` callers: `performedRead.ts`, `performedBranchRead.ts` (2), `performedRevisionCheck.ts`, `branchReachability.ts` via `listedAgentProfilePaths`. |
| A bounded pool exists (slice 3) | `dashboard/src/repositoryFileReads.ts` private `mapPool`, `fileReadConcurrency = 4`, used by `loadRepositoryTexts`. |
| A listed read's failure names the file being read (slice 3) | `performedRead.ts` keeps one `reading` updated by the `naming` callback and reports it on failure; concurrent reads would make the last-named file win. |
| The CSS rule was removed (slice 1) | `git show 53333034 -- dashboard/src/agent-launch.css`: `-.card-sessions .session-entry { background: var(--panel); }`, `+.card-sessions .session-entry,` on the `.launch-local` quiet rule. `.session-entry` sets `background: var(--surface)`; `.card` (`stages.css`) is `--surface`; `--panel` `#ffffff`, `--surface` `#f6f6f3`, `--quiet` `#55554f`. Done cards render `StorySessions className="done-story-sessions"` (`DoneStoryCard.tsx`); work cards `className="card-sessions"` (`CardSessions.tsx`). |
| Existing journeys reach both card kinds' sessions (slice 1) | `agent-launch-card-sessions.spec.ts` steps at lines 133/156 (Preparing and Taken cards' sessions) and 172 (done card); `recently-done-story-sessions.spec.ts` line 101 (done card's open and done sessions). |
| The guidance omits done records (slice 4) | `one-shot.md` “Complete a queued story in the same commit” names `complete`, the story section, and the plan, not `.planning/done/`; `grep -n "done record" src/skills/dough-execute-plan/references/one-shot.md` → none. |
| Next free plan number | `git ls-tree origin/main .planning/slice-plans/` → highest 255; this checkout has 254; the sibling worktree `story-branch-increments-publish-only-to-their-ex` holds an uncommitted `256-story-branch-delivery-target`. Allocated 257. |

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| Work-card session entries have the panel background and card text color | 1 | Computed-style assertion in `agent-launch-card-sessions.spec.ts` |
| Done-card session entries have the panel background | 1 | Computed-style assertion in `recently-done-story-sessions.spec.ts` |
| `.launch-local` stays quiet | 1 | Same assertions on the note inside an entry |
| The look reads as before | 1 | Visual check against 53333034^ |
| Owners, preparation, and progress show while a done read is held; done cards follow | 2 | Held-record journey |
| A done read unanswered at the bound is the column's gap, not the project's read problem | 2 | Held-record journey past the bound |
| Unreadable done records are listed by file with their problem, readable ones still shown | 2 | Malformed-record journey step |
| A failed done read is said and sessions still listed (preserved) | 2 | Renamed existing step |
| Records are read concurrently | 3 | Boundary spec: several record reads reach GitHub before any answers |
| An unchanged record is not reread at a new revision; a changed one is | 3 | Boundary spec over two revisions, counting `gh` content calls |
| A failed record read names that record | 3 | Boundary spec with one failing record among several |
| Agent profiles keep their results and gain the same reuse | 3 | Boundary spec profile case; existing profile journeys green |
| One-shot result commit includes `complete`'s done records | 4 | Behavior review per AGENTS.md |

## Ordered slices

### 1. A story's sessions are set off inside its card again
Type: Behavior
Status: done — the proof command passed (2 tests; before the fix both failed
on the surface background), plus `agent-terminal-done.spec.ts`, whose colour
helpers moved to the shared `dashboard/tests/pageColours.ts`. The Taken card's
screenshots before 53333034 and after the fix matched by eye.
Proof: `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-card-sessions.spec.ts dashboard/tests/recently-done-story-sessions.spec.ts --reporter=line`,
with the new assertions failing on the current CSS first. Assert computed
style, not class names: a session entry inside a Taken or Preparing card has
`background-color` equal to the page's resolved `--panel` and the card's text
`color`, not `--quiet`; an entry inside a done card has the same panel
background; the entry's `.launch-local` note keeps the quiet color. Then a
visual check: screenshots of a work card with sessions and a done card with
sessions, from one of these journeys, compared with the same view at
53333034^ for the work card.

Behavior: A developer looks at a card holding sessions, on a work card or a
done card, and sees each session entry on the panel background in ordinary
text, distinct from the card, as work cards were before 53333034.

Deliver together: one rule giving `.card-sessions .session-entry` and
`.done-story-sessions .session-entry` the panel background; `.launch-local`
alone on its quiet rule; the two specs' assertions.

### 2. Recently done is read as its own detail and says which records it cannot read
Type: Behavior
Status: done — the proof command plus `recently-done-story-sessions.spec.ts`
passed (9 tests; the new journey's 2 tests failed on the old code). After the
refactor the whole dashboard suite passed (1094). The held-answer harness is
shared in `dashboard/tests/support/heldGitHubAnswer.ts`.
Proof: `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts dashboard/tests/recently-done-stories.spec.ts dashboard/tests/recently-done-read-latency.spec.ts dashboard/tests/profile-addition-latency.spec.ts dashboard/tests/taken-agent-profile.spec.ts --reporter=line`
(`recently-done-read-latency.spec.ts` is the new journey; name it at
execution if a better existing home appears). The new journey, built like
`profile-addition-latency.spec.ts`, pauses the page clock, publishes the
slice clock records plus done records, and holds one done record's content
read, failing on the current code first: (a) while held, a Taken card shows
its owner, preparation, and “Current slice started 12 min ago”, and no done
card shows; on release the done cards appear and no read problem is shown;
(b) held past `page.clock.runFor(30_000)`, after membership shows (plan 253's
learning: await the startup read before advancing page time), the Taken
cards keep owners and clocks, the column says done stories could not be
read and still lists sessions, and the project shows no read problem. In
`recently-done-stories.spec.ts`, the step at line 132 is renamed for a failed
done-record read, and a new step publishes a record with `schemaVersion: 2`
and a record whose file name names another identity beside readable ones:
the “Unreadable done records” list names each file with “done record
schemaVersion must be 1” and “done record names another identity”, the
readable cards still show, and the sessions are still listed.

Behavior: A developer opens a project whose done records answer slowly or
not at all, or include malformed ones. Owners, preparation, and progress are
never held back or failed by them; done cards fill in when their read
answers; a read that never answers or a malformed record is said in the
column (findings 1 and 4).

Deliver together: `readPublishedWork` starting `readDoneStories` beside the
profile and preparation reads, showing its result in the next snapshot shown,
and awaiting it only before the final snapshot, outside `snapshotUnread`; the
comment's list of later details; the new journey and the
`recently-done-stories.spec.ts` changes.

### 3. Listed records are read together and reused while unchanged
Type: Behavior
Status: done — the proof command passed (37 tests). After the refactor it
passed with the listing seam's consumers added (70 tests). The full dashboard
suite passed (1098). Of the new boundary tests, 1, 2 and 4 failed on the old
code. Test 3 failed when records were named as each read started. Agent
profiles are still kept by path as well, because the story branch reads use
that (`branchReachability.ts`).
Proof: `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts dashboard/tests/authenticated-read-listed-records.spec.ts dashboard/tests/authenticated-read-agent-settings.spec.ts dashboard/tests/authenticated-read-refusal.spec.ts dashboard/tests/authenticated-branch-read-boundary.spec.ts dashboard/tests/recently-done-stories.spec.ts dashboard/tests/recently-done-story-sessions.spec.ts dashboard/tests/taken-agent-profile.spec.ts dashboard/tests/agent-roster.spec.ts dashboard/tests/backlog-preparing.spec.ts --reporter=line`
plus `npm run typecheck:dashboard`. The new boundary spec
(`authenticated-read-listed-records.spec.ts`, real HTTP against the local
boundary and the fake GitHub, as `authenticated-read-agent-settings.spec.ts`
does) observes the `gh` calls: with every record read held, more than one
done record read reaches GitHub before any answers; a `done=records` read at
a second revision whose listing names the same blob for all records but one
asks GitHub for that one record's content only and answers every record's
text; one failing record among several fails the read naming that record; a
profile read at a second revision with an unchanged profile asks for no
profile content and answers the same profiles and settings. The remaining
specs are the listing's and the listed read's existing consumers.

Behavior: A developer's dashboard on a project with many done records reads
them in a few bounded rounds at the first revision and only the new or
changed ones at each later revision (finding 1's cost), for done records and
agent profiles alike.

Deliver together: `listRepositoryDirectoryViaGh` keeping each file's `sha`;
the one listing memo answering names to `lister`'s callers and entries to the
listed read; texts remembered under the blob `sha`; `mapPool` moved to one
shared module and used by `performListedRecordsRead` and `loadRepositoryTexts`;
failure naming that names the failed record under concurrency; the fake
listing answers carrying each file's Git blob `sha` as GitHub's do.

### 4. One-shot closure commits the done records
Type: Behavior
Status: done — the behavior review walked one queued one-shot story. The
section names `complete`'s done record, profile, and expired records and puts
them in the result commit. `one-shot-guidance.test.mjs` passed with 9 tests
after the new assertion moved into its own test.
Proof: Behavior review per AGENTS.md walking one one-shot queued story: the
agent runs `complete`, sees the new `.planning/done/` record (untracked) and
any removed expired records in status, and includes them in the result
commit; the description and section still say when the step applies; nothing
asks the agent for missing input it cannot supply. Then
`grep -n "done record" src/skills/dough-execute-plan/references/one-shot.md`
finds the sentence, and
`node --test src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs`
(which reads this section; 8 pass at planning) gains an assertion that the
section names the done records and stays green.

Behavior: An agent closing a queued story in one shot commits the entry's
removal, the released profile, the done record `complete` wrote, and the
expired done records it removed in the one result commit (finding 3).

Deliver together: one sentence or clause in “Complete a queued story in the
same commit”, in the executing agent's terms, matching the wrap-up and
product-backlog wording.

## Current decisions

- Slices are independent and ordered by impact: 1 is visible now; 2 removes
  the user-visible hold and failure; 3 removes the cost on real projects; 4 is
  guidance. Each is a safe stopping point.
- Done stories are a later detail of the published read under the same wait
  bound; a done read unanswered at the bound is the column's
  `unavailable` problem, not the snapshot's.
- Texts are reused by blob `sha` inside the existing `PinnedTexts` memo; its
  500-entry, oldest-first limit stays. An evicted blob is reread once, not
  every revision. Change the limit or eviction only with evidence from
  execution.
- The pool limit for listed reads is a named constant beside the read; start
  from the existing 4 and change it only with a measured reason.
- Local proof is the focused commands per slice, with `NODE_ENV` unset. The
  repository pre-commit hook and hosted CI run the wider checks.

## Learnings

- None yet. Carried from plan 253: a journey that advances the page clock
  must first await the startup read, or cards stay locked; a fresh worktree
  needs `env -u NODE_ENV npm ci` before journeys run.
