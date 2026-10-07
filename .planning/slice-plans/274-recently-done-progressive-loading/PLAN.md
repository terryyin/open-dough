# Recently done reveals older entries on demand

**Identity:** SEED-119#recently-done-progressive-loading
**Source:** [refined story](../../seeds/SEED-119-recently-done-progressive-loading.md#recently-done-progressive-loading).
**Prepared:** 2026-10-07, planning only. Established workspace
`/Users/terryyin/git/open-dough/.worktrees/show-the-latest-10-done-items-and-reveal-older-i`,
branch `codex/show-the-latest-10-done-items-and-reveal-older-i`, starting revision
`c512f02dec09c703267cb09852330ba58ed60b92`. Preparing agent: ealden-chan.
Publication target, if separately authorized: `origin/main`; optional integration
checkout: `/Users/terryyin/git/open-dough`. Origin was inspected at
`714f0f5fee0aab5ca08b5d4fc765c089dbf62877`, where plan 273 is already allocated.
Refined 2026-10-07 by philip-chan on branch
`claude/show-the-latest-10-done-items-and-reveal-older-i` after Terry's two
decisions below; the scroll slice was removed and the navigation slice took its
real triggers. This plan retains the local refinement and grants no execution
or publication.

## Goal and boundaries

Show the newest ten top-level Recently done entries first. Read older entries'
details only when the developer requests the next batch or an existing journey
whose destination is a done entry requires a longer prefix. Preserve the
combined story/session ordering and grouping, access to retained sessions, and
exact navigation through the destination. Allow return to the first ten
without deleting records or closing a panel.

Use the story's interaction defaults and Terry's decisions: batches of ten
through one explicit reveal action, which is the only reveal trigger; Sessions
sidebar membership unchanged, with reveal-through for the dashboard's existing
journeys onto a done entry (Mark as done returning the keyboard to the
session's entry in its new home, closing a terminal or report returning to its
session there, and a sidebar choice resolving to a done entry, such as a
Running Cursor sessions row); collapse returns to the heading; same-project
refresh preserves the requested range, while reload and project switching
reset it unless a journey requires more.

Deferred: scroll-triggered reveal, listing saved Done sessions in the Sessions
sidebar, different retention windows, search/filtering, persisted range state,
new automatic retry policy, cross-tab/persistent caches, a general list or
viewport framework, and unrelated column-height or reveal/count corrections.
No version bump, release tag, installed managed-copy edit, or automatic mutation
of another configured project's records belongs to this plan.

## Existing solution and direction

PFE followed record production, published reads, grouping, range demand,
navigation, and their consumers across `src/skills`, `dashboard`, `scripts`,
`tests`, and the payload declaration:

- `product-backlog-done-record.mjs` owns identity filenames, record validation,
  completion times, and the 30-day window. `product-backlog-complete.mjs` owns
  writing/replacing and pruning records. Extend these owners with a derived
  minimal catalog; keep the existing version-1 records authoritative. The
  catalog's valid entries need only record identity, filename, completion time,
  and the corresponding body blob hash; unreadable records retain named gaps.
  Card title, developer, agent, host, model, and report content stay out of it.
- There is no existing ordered lightweight catalog. The GitHub directory
  listing gives filenames and blob hashes, not completion times. Commit times
  cannot substitute for recorded completion times. Reading all full bodies to
  construct a catalog during each dashboard visit would violate this story.
- `product-backlog-store.mjs` already owns cooperating file locking and atomic
  replacement. Reuse it for completion/catalog regeneration in the same
  cooperating backlog operation; do not invent another lock or registry. A
  catalog is a disposable projection, rebuilt from final record files after
  reconciliation, not a second manually merged history of completions.
- `RecentlyDone.tsx` and `columnSessions.ts` own the combined newest-first
  top-level entries and nested sessions. Change that projection to use known
  catalog identities/order before details arrive. Select one prefix of that
  combined list; do not apply ten separately to stories and sessions or count
  nested sessions again. Keep one heading/edge-count meaning. A standalone
  session entry renders from this machine's record alone (`SessionEntry.tsx`),
  so a demanded prefix's body reads name only the published stories inside it.
- `recordsBesideBacklog.ts`, `PinnedTexts`, the authenticated read boundary,
  `mapPool`, and the existing `gh` admission/cooldown already own reachable
  published paths, immutable blob reuse, and bounded reads. Expose a catalog
  read and selected-record reads through those owners. Catalog membership and
  directory hashes must agree at the pinned revision before its metadata is
  trusted. Do not broaden the endpoint into arbitrary repository access.
- Three existing journeys end on a session's entry wherever it now lives, and
  all three resolve it through `sessionEntry` in `pageSessions.ts`:
  `pageSidePanel.ts` returns the keyboard after Mark as done or a closed
  terminal/report to the invoking control while it exists, otherwise to the
  session's entry, otherwise to `workHome`, which falls back to the column
  when the entry is hidden; `sessionNavigation.ts` reveals a sidebar choice's
  entry or containing card through `workFocus.ts`'s `keepInView`, cancelling
  on the developer's own movement, with column reveal and motion handling.
  Give the range one owner that a destination session can demand a prefix
  from, consulted by those resolvers before they look for the entry; do not
  create a second navigation coordinator or a second focus-return rule.
  Because the catalog fixes an entry's logical place before its body arrives,
  the destination's entry can render at once and `sessionEntry` can find it;
  the intervening story cards arrive as their demanded bodies do. The current
  navigation effect marks a going revealed even when its target is absent, so
  adding a DOM query after rendering alone is insufficient.
- `publishedObservation.ts` and `snapshotRetrieval.ts` own revision/project
  isolation and independent fact arrivals. Range is transient presentation
  state, distinct from a read's completeness or a published lifecycle fact.
  Hidden undemanded details must not keep ordinary revision checks unsettled.
- The test boundary records actual `gh` requests and can hold/fail individual
  bodies. `listingAnswers.ts` computes real Git blob hashes, rather than
  inventing names. Reuse those boundaries; fixtures must not preselect the
  prefix or perform the navigation that the product must establish.

Follow [North Star: One backlog interpretation, separate observation and
presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation),
including its authenticated-read and configured-source direction, and
[One owner admits reads to GitHub](../../NORTH-STAR.md#one-owner-admits-reads-to-github).
No new North Star topic is needed: a derived record catalog and transient range
fit those established responsibilities. Reconcile with the neighboring reading
recovery and paged-column stories without introducing a blocking dependency.

Accepted [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
and [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
require one domain meaning and cohesive shared responsibilities. For the changed
producer's delivered helpers, follow
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md), and
[AGENTS.md](../../../AGENTS.md): author in `src/skills`, declare required runtime
files in `install.sh`, prove installed use, and leave actual release/install
adoption distinct from source implementation. Dashboard ADR 0008 is Proposed.
No Accepted decision conflict or exception was found.

## Current decisions

1. A hidden `.catalog.json` beside the done records is a derived metadata
   projection, excluded by the existing record-filename rule. Completion and
   expiry pruning regenerate it; an ordinary `catalog-done --file <backlog>`
   operation rebuilds it for existing records without moving the queue or
   changing record bodies. Keep pure format/validation separate from Node
   filesystem orchestration so the browser uses the same domain reader.
2. Compare the catalog's record set and hashes with the pinned directory
   listing. Missing, stale, malformed, or unsupported catalog evidence with
   existing records is an explicit metadata gap, not an empty archive or an
   eager fallback. A confirmed absent/empty done-record set is empty. Record
   the recommended strict catalog behavior; the compatibility question was
   offered during planning and no answer is represented as agreement.
3. Backfill this project's catalog in an authorized implementation increment.
   Other projects adopt the producer through the normal released payload and
   explicitly publish their rebuilt catalog. Do not claim a source-only change
   updates existing installed writers. An older writer changing record files
   invalidates its catalog and exposes the repair path; it never silently
   establishes a complete fresh list from stale metadata.
4. One requested prefix of the combined entries owns all detail demand. The
   explicit reveal adds ten, a journey onto a done entry takes the maximum of
   the current prefix and the destination's position, and collapse requests
   ten. Body reads name only the stories needed by that prefix. Already valid
   immutable bodies may be reused; collapse does not promise to erase caches.
5. Request ownership includes project, published revision, and superseding
   demand. Old answers may remain reusable immutable server data but cannot
   extend or alter a collapsed list, a newer selection, or another project.
   Keep loaded entries usable during additional reads and retry only the
   affected demanded range through the existing admission/wait policy.
6. Catalog knowledge establishes logical placement before card facts arrive.
   A pending/gap entry must not duplicate its sessions as newer standalone
   entries or reshuffle the prefix when its title/credit arrives. Keep local
   session actions reachable. When published ownership itself is unknown,
   retain the existing standalone recovery access and incomplete count.
7. **Terry, 2026-10-07: Sessions sidebar membership is unchanged.** Its main
   list keeps excluding saved Done sessions; `columnSessionsOf` keeps placing
   open sessions of completed stories in Taken. The navigation slice's
   triggers are the dashboard's existing journeys onto a done entry: Mark as
   done from a Taken entry, the terminal, or the report panel; closing a
   terminal or report whose session is done; and a sidebar choice that
   resolves to a done entry, which today is a Running Cursor sessions row the
   runner still holds. No new sidebar group, membership rule, or
   fixture-only selection is created.
8. **Terry, 2026-10-07: the explicit reveal action is the only reveal
   trigger.** Scrolling, resizing, horizontal paging, initial boundary
   visibility, and collapse never request a batch. Scroll-triggered reveal is
   deferred, so no scroll observer, sentinel, or viewport rule is built.

## Observed decisive premises

At product revision `c512f02d`, with only preparation prose changed, observations
used Node 24.21.0, Playwright 1.63.0/Chromium 153.0.8010.12, and Bash 5 on PATH.
An initial run failed before product observation because local Vite was absent;
local locked dependencies were installed. A subsequent prerequisite check found
the default Node was 24.5.0. A temporary official Node 24.21.0 installation
settled that gap and `scripts/setup-native.mjs check` passed. Those failed setup
runs establish no product behavior. The disposable probe's first assertion
used the wrong request-wrapper field; corrected to the existing `request`
shape before the successful observation below. Probe source is removed.

The literal observation prefix was:
`env -u NODE_ENV -u FORCE_COLOR -u NO_COLOR PATH=/tmp/open-dough-seed119-node.HQSWbV/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH`.
The temporary Node path is observation setup, not a required project location.

| Premise and consuming operation | Observation | Result / limit |
| --- | --- | --- |
| The current cold journey fetches every body; consumed by choosing a published catalog in slices 1–3 | Disposable `recently-done-planning-observation.spec.ts`, using the real built preview/read boundary, 35 records from the shared renderer, actual `gh` request notes, and no viewport-driven request substitution; run with `npm run test:dashboard -- recently-done-planning-observation.spec.ts` | 35 cards and exactly 35 done-body content requests before scrolling. Baseline is eager; it proves neither the new catalog nor future savings |
| A saved Done session cannot be chosen from the sidebar's main list; consumed by the trigger decision for slice 4 | Same probe keeps a saved Done session belonging to the oldest published card, observes that session in Recently done, opens the sidebar, and observes zero entries for it | Confirmed. Terry kept that membership (decision 7); slice 4 uses the existing journeys instead of a new sidebar entry |
| Mark as done moves a session from its card into Recently done as an entry this machine renders, and the keyboard returns through the side panel's return rule; consumed by slice 4's primary trigger | `npm run test:dashboard -- agent-terminal-done.spec.ts agent-launch-done.spec.ts cursor-runner-sessions.spec.ts` at the refinement revision, with the same prefix, after `npm ci` with `NODE_ENV` unset restored the devDependencies a production-inheriting session had skipped | Existing journeys pass: Mark as done from the terminal closes the panel and Recently done shows the entry Done, and a Running Cursor sessions row opens its session. Neither covers a hidden destination or a prefix demand; slice 4 proves those |
| Existing readers/projection preserve mixed ordering, retention, grouping, read gaps and count meaning; consumed by slices 2–3 and 6 | `npm run test:dashboard -- recently-done-stories.spec.ts recently-done-story-sessions.spec.ts recently-done-read-latency.spec.ts` | Existing journeys pass; the held done body reaches actual `gh`, unrelated Taken facts arrive, and its bounded failure remains a done gap |
| Existing selection goes through project read, actual entry lookup, column reveal and motion handling; consumed by slice 4 | `npm run test:dashboard -- session-sidebar-navigation-cases.spec.ts dashboard-columns-paging-sessions-sidebar.spec.ts` | Existing open-session/Backlog/Taken journeys pass, including narrow/reduced-motion and abandoned project selections. They do not cover a done destination or asynchronous prefix loading |
| Completion's real CLI writes/replaces authoritative records and prunes at the recorded window; consumed by catalog production in slice 1 | `npm test -- tests/support/product-backlog-complete-done-record.test.mjs`, through the repository runner in scratch Git projects | Passes; fixtures run the source CLI with a controlled completion time rather than faking completion. Catalog production and new installed behavior still need implementation proof |
| A directory listing can validate a derived catalog without fetching each body; consumed by slice 2 | Read `recordsBesideBacklog.ts`, `ghContents.ts`, `PinnedTexts.blobReader`, and `listingAnswers.ts`; the successful probe consumes those listings and body hashes | Paths/blob hashes are available at the resolved revision. No completion timestamp is available in today's listing; catalog/body consistency must be proved in the new producer/read journey |
| The API and fixture contract has consumers beyond Recently done specs; consumed by slices 2–3 | `rg -l 'done=records\|done-records-at\|parseDoneRecordFile\|renderDoneRecord\|readDoneStories\|performListedRecordsRead' dashboard tests src scripts`, and searches for the resulting fixture/helper imports and literal gap/count text | Includes authenticated refusal/cooldown/listed-record specs, all revision-reuse consumers, published fact arrival/isolation/reading/failure/measurement consumers, and session-column membership. Keep their observation purposes; do not treat an initial membership assertion as detail proof |
| Installed producer changes require complete standalone helper delivery; consumed by slice 1 | Read `install.sh`, `tests/product-backlog-payload-update.sh`, and its offline runtime helpers | New runtime helpers need payload declarations. Existing offline invocation runs from the Claude root; extend catalog/completion use to both managed roots rather than equating file presence with useful behavior |

Refinement note, 2026-10-07: the keyboard-return rule was read in
`pageSidePanel.ts` (invoking control while it has client rects, else the
session's entry, else `workHome`, which returns the column) and the entry
lookup in `pageSessions.ts`; the standalone entry's local rendering was read in
`RecentlyDone.tsx` and `SessionEntry.tsx`. A first run of the third row's
specs failed before product observation because this worktree had no
devDependencies (`vite` ENOENT); that run establishes no product behavior.
Whether
the Cursor runner still holds a session after Done requests its native stop is
unknown and not decisive: the Running Cursor sessions path is one trigger
among three, and slice 4's proof must drive it with the runner fixture that
`cursor-runner-sessions.spec.ts` already uses, holding a done record, rather
than assume the runner's timing.

The relevant cheap current journeys have been observed. No paid, production,
or owner-held probe is needed for the slices.

## Proof and execution gates

Follow [tests/README.md](../../../tests/README.md) and
[native prerequisites](../../../tests/native-setup.md): use `.node-version`,
Bash 5 first on PATH, locked dependencies and Chromium, and the repository
runner for shell/Node checks. Unset `NODE_ENV`, `FORCE_COLOR`, and `NO_COLOR` for
dashboard checks. Each dashboard invocation builds the production assets.

Run the named affected proof at slice boundaries, plus dashboard typechecking
when dashboard contracts change and lint for the edited source/guidance.
Independent post-change refactoring and delivery use the installed execution
workflow when execution is separately authorized. No numeric slice timing
policy is supplied; each slice includes edits, focused proof, and local cleanup
in one loop. Stop/replan on contrary catalog, navigation, or sizing evidence.
Hosted CI owns its configured remaining checks after authorized publication;
the whole product/dashboard suite is not invented as a local gate here.

New page proof lives in capability-named specs:
`recently-done-progressive-loading.spec.ts`,
`recently-done-progressive-navigation.spec.ts`, and
`recently-done-progressive-state.spec.ts`. Publish genuine catalog/body data,
with at least one end-to-end publication produced by the real completion or
catalog-backfill CLI. Observe request paths/revisions as well as visible cards;
hold a hidden body and prove that no request reaches it before demand.

Preserved consumer groups, selected by the inspected use rather than filename:

- **Record production/delivery:** `npm test --
  tests/support/product-backlog-complete-done-record.test.mjs
  tests/support/product-backlog-complete-done-catalog.test.mjs
  tests/support/product-backlog-done-catalog.test.mjs
  tests/support/product-backlog-complete.test.mjs
  tests/support/product-backlog-complete-profile.test.mjs
  tests/product-backlog-payload-update.sh tests/payload-declaration-links.sh`.
  Extend installed offline catalog and completion proof to Codex/Cursor's
  `.agents` root and Claude's `.claude` root. New guidance also receives the
  representative behavior review from AGENTS.md, with existing native discovery
  mechanisms reused rather than launching paid sessions for a CLI extension.
- **Authenticated reads:** `npm run test:dashboard -- authenticated-read-refusal.spec.ts
  authenticated-read-listed-records.spec.ts authenticated-read-cooldown.spec.ts
  authenticated-read-cooldown-reach.spec.ts authenticated-read-revision-reuse.spec.ts
  authenticated-read-revision-reuse-compared.spec.ts
  authenticated-read-revision-reuse-history.spec.ts
  authenticated-read-revision-reuse-bounds.spec.ts
  authenticated-read-revision-reuse-failures.spec.ts`.
- **Done projection and independent arrivals:** `npm run test:dashboard --
  recently-done-stories.spec.ts recently-done-story-sessions.spec.ts
  recently-done-read-latency.spec.ts session-column-membership.spec.ts
  published-facts-arrival.spec.ts published-facts-isolation.spec.ts
  published-facts-reading.spec.ts published-facts-failures.spec.ts
  observation-measurements.spec.ts`.
- **Navigation, Done journeys, and paging:** `npm run test:dashboard --
  session-sidebar-navigation.spec.ts session-sidebar-navigation-cases.spec.ts
  agent-terminal-done.spec.ts agent-launch-done.spec.ts
  agent-launch-recent-sessions.spec.ts agent-launch-recent-delete.spec.ts
  cursor-runner-sessions.spec.ts dashboard-columns-paging.spec.ts
  dashboard-columns-paging-side-panel.spec.ts
  dashboard-columns-paging-sessions-sidebar.spec.ts
  dashboard-columns-kept.spec.ts`.

Update the raw-publication fixtures and endpoint callers together when retiring
the eager contract. A fixture's catalog supplies published metadata only; it
must not serve pre-cut card lists, pre-mark a session done in Recently done's
place, or call the product's range/navigation owner on the test's behalf.
Preserve malformed-record, incomplete-count, failed-read, and
revision-isolation observations instead of weakening their assertions.

| Final promise | Owning slice / observable proof |
| --- | --- |
| Authoritative completion order is available without fetching every hidden body; existing records can be adopted | 1–2: real CLI backfill/completion, hash-set validation, selected reachable body requests, and installed use |
| Initially ten combined entries, nested sessions counted once; fewer/empty boundary; details outside prefix unread | 3: built preview with mixed 35-entry publication and nested sessions; exact cards/order, actual body calls, six/zero boundary |
| Explicit next-ten reveal naming the remaining count, remaining-five exhaustion, truthful counts/loading, failed batch retains readable entries and retries once; page scrolling reads nothing | 3: next requests and UI through 10→20→30→35; held/failed demanded body and retry; scrolling to the shown end with three columns shown and with Recently done hidden produces no request |
| A journey onto done entry 27 reveals exactly through 27, lands keyboard and view on it, preserves a longer prefix and existing panel/focus/column behavior, repeat journey works | 4: Mark as done on a long-launched Taken session, terminal/report close, and a Running Cursor sessions row; held intervening story body, entries 1–27 visible and 28–35 unrequested, narrow/cross-project/reduced-motion journeys |
| Collapse restores ten/heading/useful focus, retains records and panel, and defeats a late extension/journey answer | 5: extended list with a panel and held older answer, collapse by keyboard, late release, then fresh reveal/journey |
| Refresh preserves range/current ordering/valid focus or destination; reload/switch reset; layout changes retain range | 6: real publication/check/refresh, focus near boundary, removed destination, reload/project selection and panel/column resizing |
| Details are pinned/reused only for their project/revision; obsolete answers cannot change another view; read admission and unrelated facts remain intact | 2–6: two-revision/two-project request observations and existing authenticated/arrival/isolation consumers |

## Slices

### 1. Published completions expose a rebuildable minimal catalog

Type: Behavior
Status: done
Proof: extend the real completion CLI tests and installed payload runtime proof;
run the Record production/delivery group. Add a rebuild case with existing
records, invalid records, and an alternate backlog location; compare record and
backlog bytes before/after. Verify body hashes with Git, replacement/expiry,
dropped work, and cooperating completions retaining both records/catalog rows.

Behavior: a project completes work, prunes expired records, or explicitly
rebuilds its existing done metadata → it publishes a deterministic minimal
catalog matching its authoritative record files without changing their
identity/title/time or adding a completion for dropped work. An unreadable body
remains named evidence, not a fabricated timestamp. Backfill this project's
current records as part of the implementation result; no other project is
automatically changed. Document catalog adoption/repair and derived-file
reconciliation with the existing completion contract. Declare required helpers
in the payload and prove standalone use with the source unavailable.

Safe stopping point: records and existing dashboard behavior remain valid; the
published metadata and installed producer are useful preparation for deferred
reading. Source implementation is not presented as a release or local upgrade.

Accepted proof and learnings (2026-10-07, terry-chan):

- Catalog owner: `src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs`,
  Node-free, exporting `doneCatalogFileName`, `doneCatalogPath`
  (`done/.catalog.json`), `catalogDoneRecords`, `renderDoneCatalog`,
  `parseDoneCatalog` (strict: schemaVersion 1, exact keys, published order,
  unique names, identity/file agreement, UTC ISO times, 40/64-hex blobs) and
  `doneCatalogMismatch(catalog, [{fileName, blob}])` (record-named files only).
  Format: `{schemaVersion:1, records:[{fileName, identity, completedAt, blob}]
  newest first with file-name ties, unreadable:[{fileName, blob}]}`. The
  catalog does not apply the 30-day window; readers keep `isWithinDoneWindow`.
  A catalog exists only while a record-named file exists.
- `complete` now closes beside-backlog files, including `rebuildDoneCatalog`,
  inside the backlog lock through the store's `applyReportedChange` close
  step; `catalog-done [--file]` rebuilds under the same lock. This
  repository's `.planning/done/.catalog.json` was backfilled by the real CLI.
- Proof: the Record production/delivery group above (with the two catalog test
  files), all `tests/support/product-backlog-*.test.mjs`, the `complete`
  callers in `dough-execute-plan`/`dough-story-refinement`/supplier tests,
  the changed-guidance and install tests, `npm run typecheck:dashboard`, and
  the Done projection group plus `authenticated-read-listed-records.spec.ts`
  (35 passed); `recently-done-stories.spec.ts` asserts the hidden catalog is
  never read by today's eager reader. Installed proof runs from `.agents` and
  `.claude` roots with the source removed.
- Known limits: blob hashes are SHA-1 of working-tree bytes, so a SHA-256 or
  filtered repository surfaces as a mismatch gap, not wrong data. The test
  fixture `dashboard/tests/recentlyDoneRecords.ts` publishes a placeholder
  catalog that slice 2/3 must replace with a generated one.

### 2. Published done metadata admits only requested record details

Type: Structure
Status: done
Proof: run the Authenticated reads group, plus `npm run typecheck:dashboard`.
At the real local read boundary, obtain catalog metadata at revision A; request
a subset of its bodies and observe only those upstream requests. Prove path,
revision, catalog-set/hash, missing/stale metadata, malformed record, cancellation,
cache reuse, and cooldown refusals, including an arbitrary/unlisted path taking
no unauthorized read. Existing full-display UI journeys remain green.

Structure: expose catalog reads and catalog-reachable individual body reads
through the existing authenticated boundary, pinned lister/blob reader and
shared pure format rules. Keep credential handling and global admission where
they are. This immediately enables slice 3's initial ten and explicit batches.
The existing eager browser call remains an explicitly temporary adapter until
slice 3; do not duplicate validation or catalog ownership in that adapter.

Safe stopping point: existing UI remains usable while the demand boundary is
proved. This slice claims no initial-load savings. Slice 3 removes the eager
browser call and updates its API/fixture consumers together.

Accepted proof and learnings (2026-10-07, terry-chan):

- Endpoint: `done=catalog` answers `{revision, catalog}` or `{revision, gap}`
  after `dashboard/server/doneCatalogRead.ts` agrees the shared catalog with the
  pinned listing (no record files → rendered empty catalog). `done=bodies&file=…`
  (≤100 record file names) reads only names the agreeing catalog lists, through
  `readListedTexts` in `listedRecordsRead.ts`; an unlisted name or a gap is a
  404 with no record read, a bad shape a 400 before `gh`.
- Client: `readDoneCatalogAt` and `readDoneRecordBodiesAt` in
  `dashboard/src/authenticatedDoneRead.ts`; both check the answered revision.
  The catalog is not windowed. Fixture helper `dashboard/tests/doneCatalogAnswers.ts`
  (`withDoneCatalog`) renders genuine catalogs with real blob hashes.
- Temporary eager adapter for slice 3 to retire: `readDoneRecordsAt`
  (`done=records`, server kind `done-records-at`) used by `readDoneStories`;
  `dashboard/tests/recentlyDoneRecords.ts` still publishes a placeholder catalog.
- Proof: `npm run typecheck:dashboard`; the Authenticated reads group plus
  `authenticated-read-done-catalog{,-gaps,-refusal}.spec.ts`,
  `authenticated-avatar.spec.ts`, `authenticated-read-profile-addition.spec.ts`
  (106 passed: exact recorded `gh` requests for catalog/subset bodies, later
  revision and other project, five gaps, unlisted names with zero `gh`,
  parameter refusals, cancellation, cache reuse, cooldown);
  `recently-done-stories`/`-story-sessions`/`-read-latency` (6 passed);
  `published-facts-isolation`, `authenticated-read-shared`,
  `authenticated-read-directed-wait`, `authenticated-branch-read-boundary`,
  `authenticated-read-agent-settings` (17 passed); catalog shell tests.

### 3. A short initial list reveals the next ten only when asked

Type: Behavior
Status: done
Proof: add `recently-done-progressive-loading.spec.ts`; run it and the Done
projection and independent arrivals group, the changed authenticated
consumers, the paging consumers of the Navigation group, and typechecking. The
35-entry journey observes ten initial cards, the reveal action naming 25
remaining, ten-more reveals through exhaustion, mixed ordering/nested session
cardinality, and exact body request deltas. Holding a suffix body must not
reach `gh` before its reveal. Real page scrolling to the shown end, with all
three columns shown and with Recently done hidden, and resizing produce no
request. A demanded failure retains the usable prefix and its retry neither
duplicates entries nor rereads healthy immutable bodies unnecessarily.

Behavior: opening a valid published catalog plus local session records → show
the first ten of their combined logical entries and demand only their body
details → invoking the explicit reveal action demands the next ten, or the
remaining entries, without resetting focus/scroll; nothing else demands a
batch. Show meaningful loading, older availability with the remaining count,
exhaustion, and affected retryable gaps. Fewer than ten and known empty sets
keep their existing meanings. Retire the eager read path; keep revision-check
settlement separate from intentional unread suffixes.

Safe stopping point: explicit access can reach every eligible older entry and
the initial view saves body reads. Exact prefix navigation for a journey onto
a hidden done entry is an interim omission replaced by slice 4; until then
such a journey keeps today's fallback and removes no record or independent
terminal/report access.

Accepted proof and learnings (2026-10-08, terry-chan):

- Range owner: `useRecentlyDoneRange(sourceId)` in
  `dashboard/src/recentlyDoneRange.ts` (`requested`, `reveal(shown)`,
  `doneBatch = 10`), used by `useRecentlyDone` in
  `dashboard/src/recentlyDoneView.ts` (combined `newestFirst` list, called by
  `DashboardColumns`). Demanded record reads live in `dashboard/src/doneDetails.ts`;
  `readDoneStories` now waits only for the catalog, so unread suffixes never
  hold revision checks. The eager `done=records` read is retired; the shared
  per-read cap is `doneRecordsPerRead` in `authenticatedReadRules.ts`.
  `pageSidePanel` and `sessionNavigation` sit above `DashboardColumns`, so
  slice 4 lifts or exposes the range owner (keyed by source) rather than
  adding a second one; catalog placement already renders a destination's
  entry/card with its `data-shows-session`/`data-done-story` marks once the
  range covers it.
- Wording: footer "Showing N of M entries."; action "Show 10 of K older
  entries" / "Show the K older entries" / "Reading done stories…";
  exhaustion "All M entries are shown."; card "Reading done story…" /
  "This done story could not be read."; gap "Done stories could not be read. …"
  with "Retry done stories".
- Accepted limits: one demanded group is one read, so a failing record fails
  its group's cards until Retry (healthy blobs are not reread at `gh`);
  catalog-unreadable records are read to name their problem, since they hold
  no place in the list; rate-limited reads wait for the developer's Retry.
- Proof: `recently-done-progressive-loading.spec.ts` (35-entry publication
  whose catalog comes from the real `catalog-done` CLI; exact records asked at
  10/20/30/35, held entry 13 never asked before reveal, wheel scroll at 80rem,
  40rem paging/resize read nothing, focus and positions retained; failed
  record plus one Retry; six/empty boundaries), the Done projection group, all
  `authenticated-read-*` specs, paging and Done-journey groups, typecheck,
  plus project-overview/isolation/navigation/refresh consumers.

### 4. A journey onto a done entry reveals the exact prefix through it

Type: Behavior
Status: planned
Proof: add `recently-done-progressive-navigation.spec.ts`, driving each real
trigger from decision 7 rather than injecting a selection or pre-marking the
session in place. Run it with the Navigation, Done journeys, and paging group.
With ten shown, a standalone Taken session launched long enough ago to be
entry 27: hold an intervening story body, Mark as done from its Taken entry,
observe the pending demand, release the body, and prove the entry is focused
and in view only once entries through 27 are present, with bodies 28–35
unread. Repeat the arrival through Mark as done in the terminal panel (panel
closes), through closing a terminal whose session is already done, and
through a Running Cursor sessions row holding a done record. Also cover an
already shown destination, a longer existing prefix, a repeat journey, hidden
column, cross-project sidebar choice, reduced motion, a destination absent
from the read list, and abandonment for another selection/project before the
answer.

Behavior: an existing journey's destination is a done entry beyond the shown
prefix → the range owner extends exactly through that entry, the entry
renders in its logical place at once, intervening story cards arrive as their
demanded bodies do, and the existing keyboard-return and selection/reveal
rules then apply to that entry with their panel, focus, column-reveal, and
motion behavior unchanged. Keep newer selection and developer movement
authoritative while reads finish. Sidebar membership and `columnSessionsOf`
placement are untouched.

Safe stopping point: every way the dashboard already lands on a done entry
works with the short list, and no journey loses its session.

### 5. Collapse returns to ten and supersedes older demand

Type: Behavior
Status: planned
Proof: add collapse cases in `recently-done-progressive-state.spec.ts`, run
alongside the reveal/navigation specs and the Navigation group. Extend the
list with an open terminal/report, hold another batch or destination answer,
invoke collapse from the keyboard, then release the held answer. Observe ten
entries, the heading/useful focus, unchanged panel/session state, no automatic
tail reopening, and working fresh reveal/journey.

Behavior: more than ten entries are shown → **Show latest 10**, reachable
without traversing the loaded tail, requests ten and supersedes outstanding
extension/journey demand → restore the heading and a retained focus home.
Preserve the records and open panel. Cache reuse is allowed; no hidden body is
requested just to collapse, and a late answer cannot restore obsolete range or
scrolling.

Safe stopping point: the extended view has a reliable short-list recovery path
and the reveal action and journeys remain available.

### 6. Refresh preserves reading range and a new project starts short

Type: Behavior
Status: planned
Proof: extend `recently-done-progressive-state.spec.ts`; run all three
capability specs, the Done projection/independent arrivals group, changed
revision-reuse consumers, and the Navigation group. Publish a new revision
through the normal check, including a new first entry, an unchanged body, a
changed body, and expiry/removal. Observe current ordering, range and
focus/destination retention, correct revision-specific requests/reuse, and
useful focus after removal. Reload and switch away/back to observe reset; a
sidebar choice into another project still reveals its done destination.
Opening/closing panels and resizing columns retain range. Hold an old
project/revision answer and release it after leaving.

Behavior: a same-project refresh replaces the published snapshot → retain the
requested prefix count, extending only as needed for a still-present focused
entry or journey destination, and clamp scroll when content shrinks. A reload
or project switch starts at ten unless a new journey requires more. Obsolete
answers cannot affect the newly selected view; shown facts, counts and read
gaps remain associated with their own project/revision.

Safe stopping point: the complete range lifecycle is delivered. Assimilate the
result into `dashboard/README.md` and session-history/navigation documentation
alongside the final producer/adoption contract; retain this seed and plan for
the authorized execution retrospective and wrap-up.

## Cumulative review

The six slices evolve one derived catalog, one combined logical entry list,
one requested prefix, and the existing entry resolvers. The explicit reveal and
the three journeys are triggers on that one range owner; they gain no separate
lists, caches, or navigation rules, and the removed scroll trigger left no
machinery behind. The only preparatory Structure is directly followed by the
Behavior that consumes it. Each other slice owns one observable capability and
its focused proof, including its cleanup. The source supplies no numeric
target or hard limit, and none is invented. No boundary-specific refactoring
pass is needed for this sequence. Both human-owned source questions are
answered and recorded as decisions 7 and 8; no remaining concern blocks
execution once it is separately authorized.
