# Done catalog stays current through Git integration; failed reads recover on refresh

**Identity:** SEED-119#done-catalog-currency-correction
**Source:** [correction story](../../seeds/SEED-119-recently-done-progressive-loading.md#done-catalog-currency-correction),
from the execution retrospective of
SEED-119#recently-done-progressive-loading (story section at `e74fabcc:.planning/seeds/SEED-119-recently-done-progressive-loading.md`).
**Prepared:** 2026-10-08, planning only, in the established execution checkout
`/Users/terryyin/git/open-dough/.worktrees/show-the-latest-10-done-items-and-reveal-older-i`
on `claude/show-the-latest-10-done-items-and-reveal-older-i` at `742e6b9a`,
whose coordinator commits these records. Publication target, if separately
authorized: `origin/main`. This plan grants no execution or publication.

## Provenance

- Original contract: the story section and
  plan 274 (`e74fabcc:.planning/slice-plans/274-recently-done-progressive-loading/PLAN.md`) as they stand at
  `742e6b9a`. Their promises, decisions 1–8, and attribution are unchanged.
- Reviewed manifest: `62238f21` (catalog producer), `988d0267` (catalog and
  named-record reads), `a6dbc253` (short list and reveal), `c98b364c`
  (journeys), `d04890e8` and `fbab9e3a` (test repairs), `670b27fa` (collapse),
  `742e6b9a` (refresh and reset). CI is green on `742e6b9a`.

## Findings (current, evidenced)

1. **Record-changing Git operations leave the catalog stale, and the gap
   offers no repair.** `dashboard/server/doneCatalogRead.ts:140-157` treats a
   missing or disagreeing catalog as a gap; `dashboard/src/doneStories.ts:74-78`
   says "Done stories could not be read. The done catalog does not describe…"
   and never names `catalog-done`, which appears nowhere in `dashboard/src` or
   `dashboard/server`. The merge, rebase, and cherry-pick adapters under
   `src/skills/dough-product-backlog/scripts/` contain no catalog step;
   `references/merge-conflicts.md:107-118` and the skill's "Adopt or repair the
   done catalog" section leave the rebuild to prose. The publication paths that
   choose between an adapter and raw Git (`history-preserving-publication.mjs`
   `backlogTouched`, `owned-suffix-reconciliation.mjs` `suffixTouchesBacklog`)
   look only at the backlog file.
2. **A failed record read persists across refreshes until a manual Retry.**
   `dashboard/src/doneDetails.ts` keeps settled details keyed by file name and
   blob for the shown project; `failed` entries leave only through `retry`. A
   same-project refresh to a new revision keeps showing "This done story could
   not be read." for unchanged blobs, whereas the retired eager read asked
   again each revision.
3. **A stale comment.** `dashboard/server/readOutcome.ts:49-50` still describes
   "the done records listed beside the backlog at a revision", the retired
   eager `done=records` read.

## Goal and boundaries

One correction outcome: the done catalog stays a current description of the
record files through every record-changing operation the producer owns, a
catalog that does not is repaired by a step the dashboard names, and a
same-project refresh no longer carries a failed record read forward.

Included:

- The merge, rebase, and cherry-pick adapters rebuild the catalog from the
  final record files whenever the operation changed anything in the done
  directory beside the backlog, and a conflict in the derived catalog alone
  never stops them. The publication paths that choose between an adapter and
  raw Git route a done-directory change through the adapter.
- The guidance (`SKILL.md` "Adopt or repair the done catalog",
  `references/merge-conflicts.md`, `catalog-done` usage text) states that the
  adapters keep the catalog current and keeps the manual `catalog-done`
  rebuild only for changes outside them (raw Git, hand edits, older installed
  copies, adopting records written before catalogs). Replace the outdated
  instruction; do not add a negated one.
- The catalog-disagreement gap names the repair: the project's product backlog
  `catalog-done`, then publishing the rebuilt catalog. A failed catalog read
  (network, wait bound, rate limit) keeps its existing wording.
- A same-project refresh to a new revision asks again for shown records whose
  read failed; read and content-unreadable answers keep their blob reuse.
- The stale `readOutcome.ts` comment describes the catalogued read.

Excluded and open (Terry's decisions, not represented as agreed):

- Strict catalog mode versus a compatibility path for projects without a
  current catalog (plan 274 decision 2 records strict as a recommendation).
  No eager fallback is planned.
- Release ordering between the producer payload and the dashboard. Until a
  release is installed, this repository's installed producer copies under
  `.agents/` and `.claude/` cannot rebuild the catalog; do not hand-edit them.
- Timed automatic recovery, failure classification, and backoff for done
  records at an unchanged revision belong to
  [temporary reading recovery](../../seeds/SEED-118-dashboard-reading-reliability.md#recover-from-temporary-github-failures)
  (Taken, plan 273). This correction adds no timer, retry loop, or failure
  category; it restores per-revision demand, which that story's "a new snapshot
  replaces the old one under the published reading contract" already assumes.
- A fast-forward authors no content, so it rebuilds nothing; a ref whose own
  catalog is stale keeps surfacing as the dashboard gap with its named repair.
- Validating intermediate replayed commits' catalogs; only the operation's
  result is promised.

## Existing solution and direction

- `rebuildDoneCatalog(backlogDirectory)` in `product-backlog-complete.mjs`
  already derives, writes, or removes the catalog from final record files and
  reports the outcome (`reportCatalogDone`). Reuse it from the adapters; if it
  moves to a module the adapters and `complete` both import, keep one owner.
- `ensureDriverRegistered` self-registers an attributed Git merge driver for
  the backlog path; Git invokes such a driver identically in merge, rebase,
  and cherry-pick (existing adapter tests). Register the catalog path the same
  way, with a driver that never reports a conflict and writes a provisional
  three-way row combination keyed by record file name; the completion rebuild
  is authoritative. A driver cannot rebuild from records: Git may write the
  catalog before the record files (`.catalog.json` sorts first).
- `commitAcceptedMerge` concludes a merge with developer credit through
  `creditMergeInProgress`. Stage the rebuilt catalog before that commit, so the
  merge commit itself carries it, on both `merge` and `continue`.
- Rebase and cherry-pick report `rebased`/`picked` after their aggregate gates.
  At that accepted completion, including after `continue`, rebuild and, only
  when the catalog bytes changed, add one commit at the tip that changes only
  the catalog, credited with `creditDeveloper` like other agent commits in an
  owned workspace. No replayed commit is rewritten. `disputed`, `refused`,
  `conflict`, `blocked`, and `empty` stops rebuild and commit nothing.
- `workspace-publication-push.mjs` and `execution-increment-publication.mjs`
  read `HEAD`/the branch after the replay, so an extra tip commit becomes the
  candidate without caller changes.
- `useDoneDetails` owns record demand and reuse; its revision effect already
  abandons in-flight reads. Drop `failed` settled entries for the new revision
  there; do not add a second demand owner or touch `retry`'s meaning.

Accepted [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md), and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
apply to the producer change: author in `src/skills`, declare new runtime files
in `install.sh`, prove installed use from both roots, and write guidance for
the executing agent. The North Star topics plan 274 followed still govern the
dashboard reads; no new topic is needed. No Accepted-ADR conflict was found.

## Current decisions

1. "The operation changed the done directory" means a path under the done
   directory beside the backlog differs between the merge base and either side
   (merge), or between the upstream and the replayed or picked commits (rebase,
   cherry-pick). An operation that changes no done path leaves catalog bytes
   untouched, so it never adopts a catalog on its own.
2. Rebase and cherry-pick add one catalog-only tip commit when needed rather
   than amending a replayed commit. Merge stages the catalog into its own
   commit.
3. The catalog driver is part of the adapters' self-registration; a malformed
   side makes it keep the current side's bytes without a conflict, and the
   completion rebuild settles the content.
4. A refresh re-demands only failed reads of records the new revision still
   needs. Content-unreadable records (deterministic for their blob) and read
   records keep their reuse. Same-revision retry stays the developer's Retry
   until SEED-118's recovery lands.

## Observed decisive premises

Prefix for every command:
`env -u NODE_ENV -u FORCE_COLOR -u NO_COLOR PATH=/tmp/open-dough-seed119-node.HQSWbV/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH`.

| Premise and consuming operation | Observation | Result |
| --- | --- | --- |
| A clean Git merge of `origin/main` into this branch leaves a catalog missing records; consumed by slice 1's merge rebuild | `git merge-tree --write-tree HEAD origin/main` (origin at `456244c1`), then list `.planning/done/` and the merged catalog's rows | 15 record files, 13 catalog rows; `SEED-106_paged-columns-height-follows-shown.json` and `SEED-118_show-cards-before-expensive-cache-validation.json` absent. `origin/main` publishes no catalog |
| The adapters have no catalog step; consumed by slices 1–2 | `grep` for `catalog` in `scripts/product-backlog-git-*.mjs` | No hit; only `complete`, `catalog-done`, usage, and report mention it |
| The adapters' real-CLI tests run locally and pass; consumed as the slices' baseline | `npm test -- tests/support/product-backlog-git-merge.test.mjs tests/support/product-backlog-git-rebase-clean.test.mjs tests/support/product-backlog-git-cherry-pick-clean.test.mjs tests/support/product-backlog-done-catalog.test.mjs` | Exit 0 |
| An attributed driver for a second path beside the backlog runs during a replay; consumed by slices 1–2's catalog driver | Scratch repository with `/p/done/.catalog.json merge=cat` in `.git/info/attributes`, both sides changing the catalog, `git rebase main` | Driver ran, its output became the replayed catalog, no stop. Cherry-pick's driver invocation is established by the existing cherry-pick adapter tests |
| Publication takes the post-replay tip, so an extra commit becomes the candidate; consumed by slice 2 | Read `workspace-publication-push.mjs` (`sha = revParse(HEAD)` after `replaySuffix`) and `execution-increment-publication.mjs` (`revParse(branch)` after `reconcileOwnedSuffix`) | Confirmed; no count or patch-id check of the suffix |
| Routing to the adapters looks only at the backlog path; consumed by slices 1–2's routing change | Read `history-preserving-publication.mjs` `backlogTouched` (called from `constructCandidate`, imported by `dough-story-wrap-up` closure integration) and `owned-suffix-reconciliation.mjs` `suffixTouchesBacklog` | Both diff only `-- <backlog>` |
| A failed record read survives a same-project new revision; consumed by slice 4 | Disposable spec (removed) using `movingMain`, `answeringFirst(…, isRecord(<first-ten story>), noConnection)`, then publishing `[newest, ...entries]` and `refreshedTo` | At the new revision only the new record was asked; 7 cards still said "This done story could not be read." |
| The catalog gap text has one producer and one page assertion; consumed by slice 3 | `rg "does not describe" dashboard` | `src/doneStories.ts:77` and `tests/recently-done-stories.spec.ts:180`; `authenticated-read-done-catalog-gaps.spec.ts` asserts server gaps, not the page sentence |

## Proof and execution gates

Follow [tests/README.md](../../../tests/README.md) and
[native prerequisites](../../../tests/native-setup.md); unset `NODE_ENV`,
`FORCE_COLOR`, and `NO_COLOR`. No paid or native host run is needed. Run the
named groups at slice boundaries, plus lint for edited sources and guidance and
`npm run typecheck:dashboard` for dashboard slices. Hosted CI owns the rest
after authorized publication.

Consumer groups, selected by inspected use:

- **Git adapters:** `npm test -- tests/support/product-backlog-git-merge.test.mjs
  tests/support/product-backlog-git-merge-conflict.test.mjs
  tests/support/product-backlog-git-merge-hook.test.mjs
  tests/support/product-backlog-git-merge-agent-credit.test.mjs
  tests/support/product-backlog-git-rebase.test.mjs
  tests/support/product-backlog-git-rebase-clean.test.mjs
  tests/support/product-backlog-git-rebase-clean-accepted.test.mjs
  tests/support/product-backlog-git-rebase-onto.test.mjs
  tests/support/product-backlog-git-rebase-sequence.test.mjs
  tests/support/product-backlog-git-cherry-pick.test.mjs
  tests/support/product-backlog-git-cherry-pick-clean.test.mjs
  tests/support/product-backlog-git-cherry-pick-sequence.test.mjs`, plus the
  new capability-named `tests/support/product-backlog-git-done-catalog.test.mjs`.
- **Record production/delivery:** `npm test --
  tests/support/product-backlog-complete-done-record.test.mjs
  tests/support/product-backlog-complete-done-catalog.test.mjs
  tests/support/product-backlog-done-catalog.test.mjs
  tests/product-backlog-payload-update.sh tests/payload-declaration-links.sh`.
- **Publication and integration:** `npm test --
  src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs
  src/skills/dough-execute-plan/scripts/execution-increment-publication-reconciliation.test.mjs
  src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-reconciliation.test.mjs
  src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-reconciliation-stops.test.mjs
  src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs
  src/skills/dough-execute-plan/scripts/publication.test.mjs
  src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs
  src/skills/dough-story-wrap-up/scripts/closure-story-integration-agent-credit.test.mjs
  src/skills/dough-story-wrap-up/scripts/closure-story-branch-cleanup.test.mjs`.
- **Done projection and catalog reads:** `npm run test:dashboard --
  recently-done-stories.spec.ts recently-done-story-sessions.spec.ts
  recently-done-read-latency.spec.ts authenticated-read-done-catalog.spec.ts
  authenticated-read-done-catalog-gaps.spec.ts
  authenticated-read-done-catalog-refusal.spec.ts`.
- **Progressive range:** `npm run test:dashboard --
  recently-done-progressive-loading.spec.ts
  recently-done-progressive-refresh.spec.ts
  recently-done-progressive-reset.spec.ts
  recently-done-progressive-state.spec.ts
  recently-done-progressive-navigation.spec.ts
  authenticated-read-revision-reuse.spec.ts
  authenticated-read-revision-reuse-failures.spec.ts
  published-facts-failures.spec.ts`.

Producer proof runs the source adapters' real CLIs in scratch Git projects
through `tests/support/product-backlog-git-fixture.mjs`, with record files and
catalogs written by the real `complete`/`catalog-done` CLI and blob hashes
computed by Git. The installed proof extends
`tests/helpers/product-backlog-payload-runtime.bash`'s offline Git merge proof
so an incoming done record yields a current catalog, run from both the `.agents`
and `.claude` roots with the source removed. Any new runtime file is declared in
`install.sh` and checked by `tests/payload-declaration-links.sh`. Changed
guidance receives the AGENTS.md behavior review.

| Correction promise | Owning slice / observable proof |
| --- | --- |
| Merges through the adapter leave a current catalog; a catalog-only conflict never stops; record conflicts still stop; unrelated merges and fast-forwards leave catalog bytes alone | 1: real merge CLI in scratch projects, installed merge proof from both roots |
| Rebases and cherry-picks through the adapters end with a current catalog in at most one catalog-only tip commit; stops commit nothing; publication routes done-directory changes through the adapters | 2: real rebase/cherry-pick CLIs; publication and closure integration tests |
| The page names `catalog-done` for a catalog that does not describe the records, and keeps a failed catalog read's wording | 3: `recently-done-stories.spec.ts` |
| A new revision asks again for failed reads only | 4: extended `recently-done-progressive-refresh.spec.ts` |

## Slices

### 1. A merge through the backlog adapter leaves a current done catalog

Type: Behavior
Status: planned
Proof: add `tests/support/product-backlog-git-done-catalog.test.mjs` merge
cases: (a) the incoming side adds two records without a catalog (the
`origin/main` shape) and the merge commit's catalog lists all records at Git's
blob hashes; (b) both sides complete work, so both change the catalog, and the
merge finishes without a stop; (c) one record conflicts, the merge stops with
the catalog not yet committed, and `continue` after the human's resolution
commits a catalog matching the resolved record; (d) a merge changing no done
path leaves catalog bytes identical; (e) a fast-forward adds no commit. Cover
`history-preserving-publication`'s routing: a published tip changing only done
files goes through the adapter. Extend the installed offline merge proof to an
incoming record from both roots. Run the Git adapters, Record
production/delivery, and Publication and integration groups.

Behavior: an authorized merge through `product-backlog-git-merge.mjs` whose
sides changed the done directory → the merge commit, credited as today,
contains a catalog that `catalog-done` would produce from its record files; a
catalog-only conflict is resolved without a stop; other stops are unchanged.

Safe stopping point: merges, including wrap-up's history-preserving
integration, keep the catalog current; rebase and cherry-pick still need the
documented manual rebuild, which the guidance continues to state.

### 2. Rebases and cherry-picks through the backlog adapters end with a current done catalog

Type: Behavior
Status: planned
Proof: extend `product-backlog-git-done-catalog.test.mjs` with rebase and
cherry-pick cases: a replayed suffix completing work onto an upstream that
added records (with and without its own catalog) ends with a catalog listing
every record, in one added catalog-only tip commit only when the result's
catalog would otherwise differ; both sides changing the catalog replays
without a stop; a record conflict stops and `continue` finishes with a current
catalog; a `disputed` aggregate commits nothing extra; in an agent's owned
workspace the added commit carries the developer credit. Cover
`owned-suffix-reconciliation`'s routing for a suffix changing only done files.
Update the guidance and usage text, then run the behavior review. Run the Git
adapters, Record production/delivery, and Publication and integration groups.

Behavior: an authorized rebase or cherry-pick through the adapters that
changed the done directory → at its accepted completion the branch tip's
catalog matches its record files; the publication paths hand such changes to
the adapters; the guidance names the manual rebuild only for changes outside
them.

Safe stopping point: every record-changing operation the producer owns keeps
the catalog current, delivered in source; installed copies change only through
a release.

### 3. A catalog that does not describe the records names its repair

Type: Behavior
Status: planned
Proof: update the "done records published without a catalog" step of
`recently-done-stories.spec.ts` to the new sentence and add a stale-catalog
publication (a record the catalog does not list) showing the same repair;
keep the failed-catalog-read step's existing wording. Run the Done projection
and catalog reads group and `npm run typecheck:dashboard`; search
`dashboard/README.md`, `dashboard/AGENT-LAUNCH-HISTORY.md#recently-done-range`,
and `dashboard/GITHUB-REQUESTS.md` for the gap and repair wording and keep them
consistent with the page.

Behavior: the published catalog is missing, stale, malformed, or unsupported
beside existing records → Recently done's gap keeps saying the done stories
could not be read and why, and names the product backlog's `catalog-done`
rebuild followed by publishing the result.

Safe stopping point: a developer meeting the strict-mode gap knows the repair.

### 4. A new revision asks again for done records whose read failed

Type: Behavior
Status: planned
Proof: extend `recently-done-progressive-refresh.spec.ts`, using
`dashboard/tests/recentlyDoneRefresh.ts` (`movingMain`, `refreshedTo`,
`recordsAskedAt`) with `answeringFirst(…, isRecord(…), noConnection)`: a
first-ten record read fails, the page shows the failure, then a same-project
revision with a newer entry and unchanged blobs is shown → the failed group's
records are asked once at the new revision and their cards show; healthy
records are not asked again; a content-unreadable record is not asked again; a
read failing again at the new revision shows the failure with Retry. Run the
Progressive range group and `npm run typecheck:dashboard`. Correct the
`readOutcome.ts:49-50` comment to the catalogued record read.

Behavior: a same-project refresh replaces the shown revision → records still
needed whose earlier read failed are demanded again at the new revision, while
read and content-unreadable details keep their blob reuse; an unchanged
revision asks nothing new.

Safe stopping point: the correction is complete; assimilate the per-revision
demand sentence into `dashboard/AGENT-LAUNCH-HISTORY.md#recently-done-range`
if it states reuse, and retain this story and plan for wrap-up.

## Cumulative review

Slices 1–2 extend the existing adapters and their shared driver registration
with one derived-file rebuild owned by the catalog producer; slice 2 reuses
slice 1's driver and done-path predicate rather than adding a second rule.
Slices 3–4 change one sentence's producer and one demand owner. Each slice owns
one observable outcome and its focused proof. Refinement was not needed: no
slice combines independent outcomes or depends on an unproved structure, and
no numeric slice target was supplied.
