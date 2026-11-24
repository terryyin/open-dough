---
id: SEED-428
status: active
planted: 2026-11-24
planted_during: Developer decision to separate Review repository adoption from published-only review
trigger_when: selected from the product backlog after published-only review lands
scope: one story
---

# SEED-428 — Read published reviews from the Review repository

<a id="read-reviews-from-the-review-repository"></a>

### Read published reviews from the Review repository

**Identity:** SEED-428#read-reviews-from-the-review-repository
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/803-read-reviews-from-the-review-repository/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3ea46d654d849cc676d4ebf3af596ae737cc432f00a18039d01c63ad20c1e25b","plan":"169aad71267eae92d5922076c34a80ee9d9f9f1336a3e7d7d8b2a05a0ba082d4"}}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-428#read-reviews-from-the-review-repository","dependencies":[{"supplier":{"identity":"SEED-427#review-published-changes","href":"seeds/SEED-427-review-published-changes.md#review-published-changes"},"implementation":"Published story and session comparisons with local-only review retired","rationale":"Adoption starts from the published comparison contract and uses the surviving readers and tests as its parity baseline.","condition":"SEED-427 has landed on origin/main. Published story and session comparisons are the supported review paths, and review of unpushed commits and working-tree changes has been removed.","state":"satisfied","resolution":{"revision":"d0489607774ee6a3dd2c69b3fd5e0409288e68ab","path":".planning/seeds/SEED-427-review-published-changes.md#review-published-changes","summary":"Origin main accepted 590083ad044b2ba750a9be7840c2b12e2119affe. The delivered plan records published Taken branch and trunk comparisons, Done story landings, and exact Done session ranges. Story Review Published Taken covers rejection of local-only commits, Story Review Published Landing verifies the exact origin pair, and Recently Done Published Sessions covers a selected pair after trunk advances. Slices 4 and 7 removed workspace reviews and their capture.\nCondition satisfied: SEED-427 has landed on origin/main. Published story and session comparisons are the supported review paths, and review of unpushed commits and working-tree changes has been removed.\nAccepted integration: 590083ad044b2ba750a9be7840c2b12e2119affe on origin/refs/heads/main."}}]}
```

**Goal.** A developer reviewing published work in Intent's **Review changes**
gets the same published comparison whether or not this machine's execution
checkout is present, intact, or on another branch, and keeps browsing it when
origin is unreachable. Switching files reads local Git only, so navigation
stays fast and works offline. The dashboard stops fetching into, and depending
on, the developer's own checkout. This is the first published reader on the
Review repository that
[SEED-430](SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git)
extends to the rest of the Dashboard.

**Starting point.**
[SEED-427](https://github.com/terryyin/open-dough/blob/d0489607774ee6a3dd2c69b3fd5e0409288e68ab/.planning/seeds/SEED-427-review-published-changes.md#review-published-changes)
delivered the published story and session comparisons. Their readers resolve
every comparison and every file read in the configured execution checkout. They
refuse when it is not this project's Git root and fetch into it. A failed fetch
makes the review unavailable, and each Taken file read fetches trunk and the
story branch again. The temporary design direction lives in the
[Architectural North Star](../NORTH-STAR.md#read-published-comparisons-from-the-review-repository)
and is retired when adoption lands.

**Scope.**

- Required behavior:
  - Resolve Taken story branch and trunk comparisons, Done story completions,
    accepted landing pairs, and recorded published session ranges from the
    project's Review repository. Read their file lists, diffs, file text, and
    the source, Proof, notes, and follow-up context at the same endpoints.
  - Keep attribution, comparison selection, **Include merged changes**, and
    every existing explanation of missing or uncertain evidence unchanged.
  - Concurrent opens for one project share one fetch.
  - File reads admit a file only when it belongs to the named comparison at its
    fixed endpoints, and they make no remote request.
  - When a sync fails and the Review repository already holds the comparison,
    answer it with a sync notice. The notice names the problem and when the
    project last synced. Refresh in the open review keeps the shown comparison
    and the selected file. A cold review with no readable comparison stays
    unavailable and names the failed sync.
  - Once every review reader has moved, retire the replaced execution-checkout
    review access, its Git-root checks, and support code left without a caller.
- Scope limits (deferred promises, not rejections):
  - CI comparisons, Board and Side panel reads, Intent location trees, the
    repository inventory shown when **Changes only** is off, and a shared
    refresh across them stay on their current paths. SEED-430 owns them. Where
    those paths share a helper with review, the helper takes the repository it
    reads, and both keep working.
  - No expiry or age limit for the last synced comparison and no confirmation
    clock beyond the sync notice. SEED-430 owns live confirmation timing.
  - Removing a project leaves its Review repository on disk. Clean-up and disk
    reclamation are deferred. The repository is a rebuildable cache.
  - CI-provider reads stay with CI. Execution, publication, and landing keep
    their own Git operations in owned workspaces.
- Boundary assumptions:
  - The Review repository receives objects only by fetching from the
    configured project's authorized origin. A locally present object still
    does not prove that a live comparison is published. Admission checks the
    named endpoint against the refs from the last successful sync.

**Key examples.**

- *Checkout gone.* The configured execution checkout is renamed. The developer
  opens a Done story's review → the same completion endpoints, changed paths,
  literal diff, and Proof context appear as before the rename. The checkout's
  refs and objects are unchanged by the read.
- *Taken story with interleaved trunk.* A Story Branch Mode story has merged
  trunk once. The developer opens it with **Include merged changes** off, then
  on → the same attributed comparisons as today, read from the Review
  repository.
- *Offline reopen.* The developer reviewed a Taken story yesterday. Origin is
  now unreachable. They reopen it → the comparison from the last sync appears
  with a notice that origin could not be reached, naming the problem and
  showing the last sync time. They switch between three files → each exact
  diff appears with zero remote requests.
- *Cold and offline.* A story never opened on this machine is opened while
  origin is unreachable → the review is unavailable and names the failed
  sync. Refresh after origin recovers opens it.
- *Refresh advances.* The developer has `src/a.ts` selected in a Taken review.
  The agent publishes another commit and the developer presses Refresh → the
  comparison advances, and `src/a.ts` stays selected while it is still in the
  comparison. If Refresh fails instead, the shown comparison and selection
  stay, with the sync notice.
- *Shared fetch and fixed reads.* Two browser tabs open the same project's
  review at once → one fetch serves both. A file request naming a path outside
  the comparison, or a head outside the last synced published branch, is
  refused without a fetch.
- *Recorded session range.* A Recently done published session is opened after
  trunk advanced and its worktree was retired → its recorded range, notes, and
  file diffs appear exactly as recorded.

**Architecture.**

- *New concept and owner.* One Review repository per configured project, as
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
  defines it. It is a bare repository under the machine's dashboard home. A
  single module owns its location, creation, origin, fetch, and sync record:
  the last successful sync and the last failure. ADR 0008 allows fetching and
  caching remote Git data and requires that a published reader not need a
  developer's clone. Deleting the repository loses nothing authoritative; the
  next sync rebuilds it.
- *Origin and transport.* Fetch from the configured project's repository on
  GitHub through the authenticated Git transport. Do not use the checkout's
  remotes or objects. Object alternates into the checkout are excluded because
  they would reintroduce the dependency. A retained observation from plan 802's
  preparation fetched this project's trunk into a fresh bare repository with
  `gh auth git-credential`. Test fixtures substitute a local origin through Git
  `insteadOf`, as the start-origin fixture already does.
- *Generalization.* Review readers take the Review repository path as a typed
  input instead of resolving `executionCheckout(source)` and checking its Git
  root. The shared per-repository fetch in `gitTargetFetch.ts` keys on the
  Review repository. Helpers that CI also calls stay parameterized by
  repository, so CI keeps its checkout until SEED-430 moves it. File admission
  validates against the comparison's fixed endpoints from local refs only.
- *Growth path.* SEED-430 turns this module's fetch and sync record into the
  project's single refresh coordinator. This story builds no coordinator,
  observer, or cross-reader status beyond the review's sync notice.

**Effort hypothesis.** L. Four reader families plus file admission move, with
one new repository module and the sync notice.
