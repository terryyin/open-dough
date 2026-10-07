# Reuse evidence names every path a merge between changed

**Identity:** SEED-113#reuse-evidence-merge-correction
**Source:** [correction story](../../seeds/SEED-113-dashboard-github-responsiveness.md#reuse-evidence-merge-correction),
from the execution retrospective of SEED-113#reuse-unchanged-records-after-publication
(story `962c717c8a7dfccd09467a2dc18064afe43a1cc2:.planning/seeds/SEED-113-dashboard-github-responsiveness.md#reuse-unchanged-records-after-publication`,
plan `962c717c8a7dfccd09467a2dc18064afe43a1cc2:.planning/slice-plans/266-reuse-unchanged-records-after-publication/PLAN.md`,
slices 1–3 done), delivered by commits 945857c9, 81b24c14 and d6192d89, with load
fixes 7d8319bc and 0b2613f4, on
`claude/refresh-published-work-without-rereading-unchang`.
**Prepared:** 2026-10-07. Planning only, in the execution's checkout at
`0b2613f4`.

## Goal and boundaries

At a revision the configured ref newly names, a path that differs from the
revision last read is read at the new revision even when the commit that
changed it is a merge whose own change list does not name it. The touched set
between two revisions becomes the union of each listed commit's own files
(kept, because history facts need per-commit touches) and the files GitHub's
comparison of the two revisions names, taken from the comparison request
already made. The story's untested examples of a failing commit read and a
rename gain proof, and the reuse tests' load-fragile or misleading support is
corrected. The intermittent `shared-observer-reads.spec.ts:232` failure seen
under load during plan 266's execution is fixed so that the journey gives the
same result locally and in CI (added by Terry, 2026-10-07).

Exclusions, recorded as product advice rather than correction: two sources on
one repository cancelling each other's reuse (a cost, never wrong content),
repeated failing comparisons (the story requires a failure not to be
remembered), and consolidating the overlapping boundary and page test layers
(optional and not needed for this outcome).

## Current findings

1. **A merge can hide a changed path.** `touchedBetweenViaGh`
   (`dashboard/server/commitsBetween.ts:61-73`) returns only the union of each
   listed commit's own `files`. GitHub lists a merge commit's files against its
   first parent. When revision A is on one line and a merge in `A..B` has a
   first parent off A's line, a resolution that drops A's change to path `p`
   leaves `p` different between A and B while no listed commit names it, so
   A's text, listing, addition, or commit time is served as B's. This breaks
   the story's promises "only GitHub's account establishes reuse" and "a path
   a commit between changed … is read at the new revision".
2. **Untested story examples.** A failing commit-record read is untested (only
   a failing comparison is, at
   `dashboard/tests/authenticated-read-revision-reuse-failures.spec.ts:27`);
   a rename or copy through `previous_filename` is untested
   (`ChangedFile.previous_filename` in `dashboard/tests/pathHistoryAnswers.ts:186`
   is set by no test).
3. **Load-fragile or misleading test support.**
   - The burst case waits a fixed 300 ms
     (`authenticated-read-revision-reuse-failures.spec.ts:117`) on the comment
     "Every read reaches its comparison within moments of the first"; under
     load it silently proves less.
   - The same case's `comparing` override (lines 86-90) answers exactly what
     the publication already answers, under a comment that describes the hold
     at lines 95-101.
   - `committedOrigin` (`dashboard/tests/committedOrigin.ts:140`) tells the
     containment comparison from the reuse comparison by `perPage !== 1`, so
     a change of either page size silently changes which one it answers.
   - `publishMovingFiles` (`dashboard/tests/publishedFiles.ts:126-140`)
     answers any comparison other than one recorded move as `diverged`,
     including `A...C` after two moves, which GitHub answers `ahead`; and no
     fake comparison names any files.

## Preserved promises and constraints

Every promise, constraint, and key example of
SEED-113#reuse-unchanged-records-after-publication and plan 266's accepted
proof: one comparison and one read per commit between (no new request), the
bound of 10 commits, a not-whole commit change list establishing nothing, a
failed comparison or commit read not remembered, a rate-limited one reported
as such, blob reuse of listed records, branch heads never compared, history
facts reused only when no commit between touched the path, and a removed and
re-added profile walked again. The containment read launch settlement makes
keeps its request (`per_page=1`, `--jq .status`).

## Current decisions

- **The comparison's files join the touched set.** The reuse comparison's
  `--jq` adds `.files[].filename, .files[].previous_filename` after the
  commits; with the commits' count already required to equal `total_commits`,
  the lines after the shas split evenly into filenames and previous filenames
  (an empty line for none). Each non-empty one is touched. The per-commit
  union stays.
- **A comparison that may not name every file establishes nothing.** 300 or
  more listed files, GitHub's cap for a comparison, is remembered as no
  evidence, as a not-whole commit list is today.
- **Fakes answer comparisons as GitHub does.** A fake comparison's `files`
  are told from the two published revisions' file maps (added, removed,
  modified), never from the made commits, so a fixture can publish a merge
  whose own list omits a changed path. The fake `--jq` prints a null value as
  an empty line, as the real `gh` does. `publishMovingFiles` answers a pair
  joined by recorded moves as ahead by their commits, the reverse as behind,
  and anything else as diverged. `committedOrigin` recognizes the containment
  comparison by what it asks (its `--jq .status`), through a named predicate.
- **The burst case asserts what holds under any interleaving.** It keeps the
  hold until the first comparison arrives, drops the fixed sleep and the
  no-op override, and asserts one comparison and one commit read; joining
  in-flight `gh` calls stays proven by the shared-read specs.

## Decisive premises and observations

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| GitHub's commit answer for a merge lists files against its first parent only. | Finding 1 and slice 1's merge example. | O1: `commits/8cc33280` answered parents `[945857c9, de58b69a]` and 78 files; locally `git diff --name-only 8cc33280^1 8cc33280` is 78 files, `^2` is 7. `commits/de58b69a`: 6 files, matching `^1` (6), not `^2` (8). True. |
| For a head that descends from its base, the comparison's `files` are the net diff between the two, independent of `per_page`. | Slice 1's remedy. | O2: `compare/de58b69a…8cc33280?per_page=10` answered `ahead`, `total_commits: 2`, 7 files; `git diff --name-only` of the pair is 7 files; with `per_page=1` it still listed 7 files. True. |
| A renamed file in the comparison names `previous_filename`. | Slice 1's rename via the comparison. | O3: `compare/7bf4f5e5^1…7bf4f5e5` named `dashboard/tests/agent-launch-session-state-pace.spec.ts` with `previous_filename` `dashboard/tests/agent-launch-recent-session-states.spec.ts`. True. |
| GitHub's comparison lists at most 300 changed files, on the first page only. | The 300-file decision. | O4, GitHub REST docs (Compare two commits), fetched 2026-10-07: "The list of changed files is only shown on the first page of results, and it includes up to 300 changed files for the entire comparison." True; the reuse comparison is a single first page. |
| The real `gh --jq` prints a null as an empty line; the fake prints `null`. | The jq layout and the fake correction. | O5: `gh api repos/terryyin/open-dough --jq '.nonexistent, .name'` printed `\n open-dough\n`; the candidate jq on the merge pair printed status, 2, two shas, 7 filenames, then 7 empty lines. Reading `dashboard/tests/support/ghReply.ts` `applyJq`: `JSON.stringify(value ?? null)` prints `null`. True. |
| Changing the fake's null printing changes no other reading. | Slice 1's consumer set. | `grep -rn -- '"--jq"' dashboard/server` names `projectAddition.ts` (`ref === "" \|\| ref === "null"`), `ghRead.ts` `lastCommitTimeViaGh` (`usableCommitterDate` rejects any non-date), `ghRevision.ts` (`commitNamedBy` requires a sha), and `containmentRead.ts` (`.status`, set membership). Each refuses `""` as it refuses `null`. True by reading; the whole suite confirms. |
| The fake `--jq` supports only comma-joined paths with `[]` and `[n]`. | The jq shape. | Reading `ghReply.ts` `jqValues`: no pipes, `length`, or `select`. The decided jq uses paths only. True. |
| The comparison read is consumed only by `touchedBetweenViaGh` and the containment read; its answer fakes are `comparisonAnswers.ts`, `publishedFiles.ts`, `revisionReuseOrigin.ts`, and `committedOrigin.ts`. | Slices 1–2's consumers. | `grep -rn "comparisonViaGh\|touchedBetweenViaGh" dashboard/server dashboard/src` and `grep -rn "aheadByAnswer\|compareAnswer\|comparisonIn\|kind === \"compare\"" dashboard/tests`. True. |
| `GhCall` carries its argv, so a fake can tell a comparison by its `--jq`. | Slice 2's `committedOrigin` predicate. | Reading `dashboard/tests/support/fakeGitHub.ts:34-36`: `GhCall = { argv, request }`. True. |
| The burst case passes under any interleaving without the sleep, since a read arriving after the comparison is answered recalls the remembered touched list. | Slice 2's burst decision. | Reading `pinnedMemo.ts:109-134`: `unchangedSince` recalls the touched list through `recalledJson` under `<B>\0\0since\0<A>`, and every call runs through `execGh`'s `OutstandingReads`. True by reading; slice 2 runs it. |
| The documents describing what a new commit reads name only the commits' change lists. | Slice 1's documentation. | `grep -n -i "comparison\|change list" dashboard/GITHUB-REQUESTS.md dashboard/PUBLISHED-OBSERVATION.md .planning/NORTH-STAR.md`: `GITHUB-REQUESTS.md:36-54`, `PUBLISHED-OBSERVATION.md:36-46`, North Star "Reuse is established by the commits between". True. |

Literal observation commands (read-only), run from this checkout:

```sh
# O1 — merge commit file lists against each parent
for m in 8cc33280 de58b69a; do gh api repos/terryyin/open-dough/commits/$(git rev-parse $m) --jq '{sha:.sha[0:8],parents:[.parents[].sha[0:8]],files:(.files|length)}'; git diff --name-only $m^1 $m | wc -l; git diff --name-only $m^2 $m | wc -l; done
# O2 — comparison files are the net diff
A=$(git rev-parse de58b69a); B=$(git rev-parse 8cc33280)
gh api "repos/terryyin/open-dough/compare/$A...$B?per_page=10" --jq '{status,ahead_by,total_commits,commits:(.commits|length),files:(.files|length)}'
gh api "repos/terryyin/open-dough/compare/$A...$B?per_page=1" --jq '{commits:(.commits|length),files:(.files|length)}'
git diff --name-only $A $B | wc -l
# O3 — a rename in a comparison
c=7bf4f5e5bd4a83fccad4fbf0253ec7fb5ba210ea
gh api "repos/terryyin/open-dough/compare/$(git rev-parse $c^1)...$c?per_page=10" --jq '{status,files:[.files[]|select(.status=="renamed")|{filename,previous_filename}]}'
# O4 — https://docs.github.com/en/rest/commits/commits#compare-two-commits
# O5 — gh prints a null as an empty line; the decided jq on a real comparison
gh api repos/terryyin/open-dough --jq '.nonexistent, .name' | od -c
gh api "repos/terryyin/open-dough/compare/$A...$B?per_page=10" --jq '.status, .total_commits, .commits[].sha, .files[].filename, .files[].previous_filename'
```

The literal merge-dropping-a-change case (finding 1) is not observed on
GitHub: no such merge exists in this repository and creating one would write
to it. It follows from O1 and O2; slice 1's first new case reproduces it
red against the current code before the fix.

## Promise and proof ownership

| Correction outcome or preserved promise | Owning slice and observable proof |
| --- | --- |
| A path changed between A and B that no listed commit names (a merge) is read at B, and its facts appear at B; other untouched records are still reused. | 1: boundary case, red first, whose `gh` calls at B are the comparison, the merge's commit, and that path's read. |
| A path renamed away between A and B is not served from A, whether a commit's own list or only the comparison names the rename. | 1 (comparison) and 2 (a commit's own `previous_filename`): the old path, still named by the backlog, is missing at B. |
| A comparison listing 300 files establishes nothing and is not asked again. | 1: boundary case asking only the comparison once, then reading B as before. |
| A failing commit-record read is not remembered, and the read proceeds as today. | 2: boundary case; a later read asks the commit again and reuses. |
| Every plan 266 promise and its accepted proof stay green; no request is added. | 1–2: `authenticated-read-revision-reuse*.spec.ts`, `unchanged-records-refresh.spec.ts`, `unchanged-assignment-credit.spec.ts`, `reopened-project-reads.spec.ts`, the trunk-moving journeys, and the whole dashboard suite. |
| The containment read is unchanged. | 1–2: `authenticated-read-containment.spec.ts` and the committed-origin journeys. |
| `shared-observer-reads.spec.ts` "revision checks from two tabs share one head listing…" passes repeatedly under load: no call counted after its settle belongs to an earlier read. | 3: its cause confirmed from a failing trace, then repeated runs under load (`--repeat-each` with CPU stress) all pass. |
| The request accounting and reading contract describe the evidence. | 1: `dashboard/GITHUB-REQUESTS.md`, `dashboard/PUBLISHED-OBSERVATION.md`, and the North Star topic while it exists. |

## Ordered slices

### 1. A merge between the revisions cannot hide a changed path

Type: Behavior
Status: done
Accepted proof: `authenticated-read-revision-reuse-compared.spec.ts` "a seed
that differs between A and B is read at B though the merge between does not
name it" and "a seed the comparison names as renamed away, though no commit
between does, is missing at B", and `authenticated-read-revision-reuse-bounds.spec.ts`
"a comparison naming 300 files establishes nothing…", each with its exact `gh`
call list and each red before the fix; typecheck, every
`authenticated-read-*.spec.ts`, `project-add-*`, `reopened-project-reads`,
`unchanged-assignment-credit`, `unchanged-records-refresh`, and the whole
dashboard suite green except the load flake slice 3 owns
(`shared-observer-reads.spec.ts:232`, one extra `"content"` call at load ~30).
Learnings: a comparison listing fewer commits than `total_commits` with ten
or fewer between is now a failure rather than no evidence, since the files
follow the shas; with `per_page=10` GitHub lists them all. The North Star
bullet no longer exists, so only the two dashboard documents changed. Fake
comparisons are built through `aheadBy(commits)` in `comparisonAnswers.ts`,
which slice 2's `publishMovingFiles` and burst-case changes reuse.
Proof: new cases in `dashboard/tests/authenticated-read-revision-reuse.spec.ts`
(or `-bounds.spec.ts` for the 300-file case) through `revisionReuseBoundary`,
with exact `gh` call lists; the first fails against the current code before
the fix. Then every `authenticated-read-*.spec.ts`,
`unchanged-records-refresh.spec.ts`, `unchanged-assignment-credit.spec.ts`,
`reopened-project-reads.spec.ts`, `project-add-*.spec.ts`, typecheck, and the
whole dashboard suite.

Behavior: a process has read the source at A → the ref names B, reached by a
merge whose own change list omits seed `p` that differs between A and B →
the read of `p` at B asks GitHub and answers B's text; the backlog and other
records are reused; the calls are `compare A...B`, `commit <merge>`, and
`content p@B`. Also: a comparison naming a rename whose commits do not leaves
the old path missing at B; a comparison listing 300 files reuses nothing and
is asked once.

Product change: `touchedBetweenViaGh` asks the extended `--jq`, splits the
lines after the commit shas into filenames and previous filenames, returns
null for 300 or more files, and adds each non-empty name to the per-commit
union.

Test support: `aheadByAnswer` takes the comparison's `files`;
`revisionReuseOrigin` and `publishMovingFiles` tell them from the two
published revisions' file maps, with an explicit override for the 300-file
case; `ghReply.ts` prints a null as an empty line.

Documentation: `GITHUB-REQUESTS.md` and `PUBLISHED-OBSERVATION.md` say the
records the comparison or its commits changed are read, and that a comparison
naming 300 files is not whole; the North Star bullet "Change is learned once
per new revision" likewise, if the topic is still present.

### 2. The reuse proofs cover a failing commit read and a rename, and their fakes answer as GitHub does

Type: Structure
Status: done
Accepted proof: `authenticated-read-revision-reuse-failures.spec.ts` "a commit
between that fails to be read is not remembered…" and
`authenticated-read-revision-reuse-compared.spec.ts` "a seed a commit between
renames away, though the comparison does not name it, …", each with its exact
`gh` call list and each failing under a temporary product mutation; the burst
case 30/30 with `--repeat-each=30`; typecheck; the reuse, containment, and
every `committedOrigin`/`publishMovingFiles` spec (108 passed); the whole
suite green but for one load flake, `story-readiness.spec.ts:40` (six
`doughnutPaths` where seven were expected, the agent setting read missing),
which passed 10/10 on repeat.
Learnings: a seed read must be reachable from the backlog at that revision,
so a "new path is read" case has a commit between change the backlog too.
Isolating a commit's own `previous_filename` needs a comparison faked to name
no files, since GitHub's would name both paths. `story-readiness.spec.ts:40`
looks like slice 3's kind of early count; slice 3 checks whether the same
settle cause explains it.
Proof: the new cases below pass; `authenticated-read-revision-reuse*.spec.ts`,
`authenticated-read-containment.spec.ts`, the specs using `committedOrigin`
and `publishMovingFiles` (`grep -ln "committedOrigin\|publishMovingFiles" dashboard/tests/*.spec.ts`),
and typecheck stay green.

Correction: removes the test-suite weaknesses of findings 2 and 3 with no
product change.

- `authenticated-read-revision-reuse-failures.spec.ts` gains a case where the
  commit between fails to be read (not a rate limit): the read at B is
  answered from GitHub, and a later read asks the commit again and reuses.
- `authenticated-read-revision-reuse.spec.ts` gains a case where a commit
  between renames a seed the backlog still names (`previous_filename` on its
  own record): the old path is missing at B and the new one is read.
- The burst case drops the 300 ms sleep, the no-op `comparing` override, and
  their comments, keeping the hold until the first comparison arrives and its
  exact call list.
- `committedOrigin` recognizes the containment comparison by its `--jq
  .status` through a named predicate beside `comparisonIn`, instead of
  `perPage !== 1`.
- `publishMovingFiles` answers a comparison of two trunk revisions joined by
  recorded moves as ahead by their commits (no connection if a move named
  none), the reverse as behind, and others as diverged.

### 3. Call counts after a settled page are not taken while an earlier read is still landing

Type: Structure
Status: done
Accepted proof: the cause is confirmed as a test defect, not a product race.
`expectSettledPage` returns before the agent-profile read (the `.planning/agents`
listing, then `.planning/open-dough.json`) and the done-records read land when
the page shows nothing that depends on them. Holding those reads reproduced
the flake signature in `shared-observer-reads.spec.ts:232`,
`story-readiness.spec.ts` (six `doughnutPaths` of seven), `auto-refresh.spec.ts:146`
(pace over 15250 ms), and, by matching signature, `authenticated-project-overview.spec.ts:47`.
`pageRequestNotes.ts` `noteReadsBesidePreparation` now waits for both answers
before each count; `selectSettledDoughnut` reuses it. Under CPU stress (load
~50–60), those four specs with `--repeat-each=30 --workers=12` gave 270
passed; typecheck clean; the whole dashboard suite green; the refactored
callers (`published-facts-isolation`, `auto-refresh-project-isolation`) green.
Learnings: with no Taken work, `expectOwnersNotRecorded` proves nothing, so a
count must wait on the boundary answers, noted before they are asked. Other
specs counting right after `expectSettledPage` on such a page were not
audited; any that flake share this cause and this remedy.
Proof: `shared-observer-reads.spec.ts` fails before the fix in a deterministic
reproduction (for example holding the late read with `page.route`, or slowed
answers), then passes with `--repeat-each=30 --workers=12` under CPU load;
every spec whose call counts follow the changed wait stays green.

Correction: during plan 266's execution,
`dashboard/tests/shared-observer-reads.spec.ts:232` ("revision checks from two
tabs share one head listing…") failed once in three runs at load about 28 with
one extra `"content"` call. The likely cause, unconfirmed: the journey helper
`expectSettledPage` returns before the agent-profile read lands, so a call
count taken right after it includes that read. A neighbouring flake of the same
kind in `auto-refresh-visibility.spec.ts` was fixed by waiting for owners
(`expectOwnersNotRecorded`) before counting (commit `84ec09b9`). Confirm the
cause from a failing trace first. Then fix it where it lives: in this spec when
only it counts too early, or in the settle helper when the helper is what
returns before the page's reads have landed, keeping what each caller asserts.
A product race found instead stops this slice for a decision. No assertion is
weakened and no fixed sleep is added.

## Verification and delivery

Run from this checkout with `NODE_ENV` unset:
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <spec files> --workers=2`,
and `env -u NODE_ENV npm run typecheck:dashboard`. Slice 1 changes what every
fake comparison and every fake `--jq` null answers, which the trunk-moving
journeys reach, so run the whole
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard` before
delivering it. A whole-suite run in this checkout uses a private Playwright
`--output $CLAUDE_JOB_DIR/tmp/<dir>` when another run may be in progress.

Execution follows the installed post-change-refactoring and delivery workflow.
The local commit gate is the check-only `.githooks/pre-commit`
(`npm run --silent lint -- --staged`). Hosted checks stay owned by execution's
publication and CI workflow.

No numeric slice target or hard limit was supplied. Each slice has one proof
loop: slice 1 a product change of one function with its fakes and documents,
slice 2 test support and two regression cases, slice 3 one diagnosed test
wait. If execution disproves an
observed premise, stop and revise the remaining plan within this outcome.

## Execution complete

Product advice: no change to the queue. The plan's recorded exclusions stay
advice only: two sources on one repository cancelling each other's reuse (a
cost, never wrong content), repeated failing comparisons, and consolidating
the overlapping boundary and page test layers. The rename through a commit's
own `previous_filename` is now proven only with a comparison faked to name no
files, since GitHub's comparison names both paths; the per-commit rename
union is kept for history facts, not for content. Specs that count calls
right after `expectSettledPage` on a page with no Taken work were not
audited; a reviewed sample (`auto-refresh-recovery`, `auto-refresh-rate-limit`)
counts only after later checks, so no correction is planned, and a recurrence
takes `noteReadsBesidePreparation` as its remedy.
