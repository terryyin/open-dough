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
This plan retains the local refinement and grants no execution or publication.

## Goal and boundaries

Show the newest ten top-level Recently done entries first. Read older entries'
details only when the developer requests the next batch or navigation requires
a longer prefix. Preserve the combined story/session ordering and grouping,
access to retained sessions, and exact navigation through the selected target.
Allow return to the first ten without deleting records or closing a panel.

Use the story's interaction defaults: batches of ten, downward scrolling and an
equivalent explicit reveal action; collapse returns to the heading; same-project
refresh preserves the requested range, while reload and project switching reset
it unless an explicit selection requires more. The source's sidebar membership
question below remains a human-owned scope decision.

Deferred: different retention windows, search/filtering, persisted range state,
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
  nested sessions again. Keep one heading/edge-count meaning.
- `recordsBesideBacklog.ts`, `PinnedTexts`, the authenticated read boundary,
  `mapPool`, and the existing `gh` admission/cooldown already own reachable
  published paths, immutable blob reuse, and bounded reads. Expose a catalog
  read and selected-record reads through those owners. Catalog membership and
  directory hashes must agree at the pinned revision before its metadata is
  trusted. Do not broaden the endpoint into arbitrary repository access.
- `sessionNavigation.ts` owns selection and `workFocus.ts` owns `keepInView`,
  cancellation on the developer's own movement, column reveal, and motion.
  Delay a selection's existing reveal until its demanded target actually
  exists; do not create a second navigation coordinator. The current effect
  marks navigation revealed even when its target is absent, so adding a DOM
  query after rendering alone is insufficient.
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

## Current decisions and open source question

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
4. One requested prefix of the combined entries owns all detail demand.
   Explicit reveal and scroll add ten, exact-target navigation takes the
   maximum of the current prefix and target position, and collapse requests
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
7. **Open: actual sidebar access to the target in slice 5.** `openSessionsOf`
   excludes saved Done sessions; `columnSessionsOf` places open sessions of
   completed stories in Taken. The direct older-done sidebar example cannot
   currently be triggered. Terry chooses either adding saved Done session
   access (recommended), or keeping sidebar membership and narrowing the
   source example to selections that resolve to Recently done. Before slice 5,
   align the seed and this same plan with that answer, including its real
   outside-in trigger and any affected sidebar promises. Do not implement a
   new sidebar group or invent a fixture-only selection before that decision.

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
| A saved Done session cannot be chosen from the sidebar; consumed by slice 5's trigger | Same probe keeps a saved Done session belonging to the oldest published card, observes that session in Recently done, opens the sidebar, and observes zero entries for it | Direct navigation precondition is false, not supplied by a fixture; source decision remains open |
| Existing readers/projection preserve mixed ordering, retention, grouping, read gaps and count meaning; consumed by slices 2–3 and 7 | `npm run test:dashboard -- recently-done-stories.spec.ts recently-done-story-sessions.spec.ts recently-done-read-latency.spec.ts` | Existing journeys pass; the held done body reaches actual `gh`, unrelated Taken facts arrive, and its bounded failure remains a done gap |
| Existing selection goes through project read, actual entry lookup, column reveal and motion handling; consumed by slice 5 | `npm run test:dashboard -- session-sidebar-navigation-cases.spec.ts dashboard-columns-paging-sessions-sidebar.spec.ts` | Existing open-session/Backlog/Taken journeys pass, including narrow/reduced-motion and abandoned project selections. They do not cover a saved Done target or asynchronous prefix loading |
| Completion's real CLI writes/replaces authoritative records and prunes at the recorded window; consumed by catalog production in slice 1 | `npm test -- tests/support/product-backlog-complete-done-record.test.mjs`, through the repository runner in scratch Git projects | Passes; fixtures run the source CLI with a controlled completion time rather than faking completion. Catalog production and new installed behavior still need implementation proof |
| A directory listing can validate a derived catalog without fetching each body; consumed by slice 2 | Read `recordsBesideBacklog.ts`, `ghContents.ts`, `PinnedTexts.blobReader`, and `listingAnswers.ts`; the successful probe consumes those listings and body hashes | Paths/blob hashes are available at the resolved revision. No completion timestamp is available in today's listing; catalog/body consistency must be proved in the new producer/read journey |
| The API and fixture contract has consumers beyond Recently done specs; consumed by slices 2–3 | `rg -l 'done=records\|done-records-at\|parseDoneRecordFile\|renderDoneRecord\|readDoneStories\|performListedRecordsRead' dashboard tests src scripts`, and searches for the resulting fixture/helper imports and literal gap/count text | Includes authenticated refusal/cooldown/listed-record specs, all revision-reuse consumers, published fact arrival/isolation/reading/failure/measurement consumers, and session-column membership. Keep their observation purposes; do not treat an initial membership assertion as detail proof |
| Installed producer changes require complete standalone helper delivery; consumed by slice 1 | Read `install.sh`, `tests/product-backlog-payload-update.sh`, and its offline runtime helpers | New runtime helpers need payload declarations. Existing offline invocation runs from the Claude root; extend catalog/completion use to both managed roots rather than equating file presence with useful behavior |

The relevant cheap current journeys have been observed. No paid, production,
or owner-held probe is needed for the independent slices. The sidebar question
is a product decision, not something an implementation probe can approve.

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
`recently-done-progressive-loading.spec.ts`, `recently-done-progressive-scroll.spec.ts`,
`recently-done-progressive-navigation.spec.ts`, and
`recently-done-progressive-state.spec.ts`. Publish genuine catalog/body data,
with at least one end-to-end publication produced by the real completion or
catalog-backfill CLI. Observe request paths/revisions as well as visible cards;
hold a hidden body and prove that no request reaches it before demand.

Preserved consumer groups, selected by the inspected use rather than filename:

- **Record production/delivery:** `npm test --
  tests/support/product-backlog-complete-done-record.test.mjs
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
- **Navigation/paging:** `npm run test:dashboard -- session-sidebar-navigation.spec.ts
  session-sidebar-navigation-cases.spec.ts dashboard-columns-paging.spec.ts
  dashboard-columns-paging-side-panel.spec.ts dashboard-columns-paging-sessions-sidebar.spec.ts
  dashboard-columns-kept.spec.ts`. If the human selects additional sidebar
  membership, add the sidebar membership, row/state, keyboard, reading, and
  alert/count consumers found by the resulting change before accepting proof.

Update the raw-publication fixtures and endpoint callers together when retiring
the eager contract. A fixture's catalog supplies published metadata only; it
must not serve pre-cut card lists or call the product's range/navigation owner
on the test's behalf. Preserve malformed-record, incomplete-count, failed-read,
and revision-isolation observations instead of weakening their assertions.

| Final promise | Owning slice / observable proof |
| --- | --- |
| Authoritative completion order is available without fetching every hidden body; existing records can be adopted | 1–2: real CLI backfill/completion, hash-set validation, selected reachable body requests, and installed use |
| Initially ten combined entries, nested sessions counted once; fewer/empty boundary; details outside prefix unread | 3: built preview with mixed 35-entry publication and nested sessions; exact cards/order, actual body calls, six/zero boundary |
| Explicit next-ten reveal, remaining-five exhaustion, truthful counts/loading, failed batch retains readable entries and retries once | 3: next requests and UI through 10→20→30→35; held/failed demanded body and retry |
| Downward user scrolling requests the same next batch; no initial/resize/hidden-column/upward/autonomous reveal | 4: real page scrolling and request deltas with shown/hidden columns, large viewport and reduced motion |
| Sidebar target 27 reveals exactly through 27, preserves longer prefix and existing panel/focus/column behavior, repeat selection works | 5: actual agreed sidebar trigger, held target read, entries 1–27 visible and 28–35 unrequested, narrow/cross-project/reduced-motion journeys |
| Collapse restores ten/heading/useful focus, retains records and panel, and defeats a late extension/navigation answer | 6: extended list with a panel and held older answer, collapse by keyboard, late release, then fresh reveal/reselection |
| Refresh preserves range/current ordering/valid focus or selected target; reload/switch reset; layout changes retain range | 7: real publication/check/refresh, focus near boundary, removed target, reload/project selection and panel/column resizing |
| Details are pinned/reused only for their project/revision; obsolete answers cannot change another view; read admission and unrelated facts remain intact | 2–3 and 5–7: two-revision/two-project request observations and existing authenticated/arrival/isolation consumers |

## Slices

### 1. Published completions expose a rebuildable minimal catalog

Type: Behavior
Status: planned
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

### 2. Published done metadata admits only requested record details

Type: Structure
Status: planned
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

### 3. A short initial list can explicitly reveal the next ten

Type: Behavior
Status: planned
Proof: add `recently-done-progressive-loading.spec.ts`; run it and the Done
projection and independent arrivals group, plus the changed authenticated
consumers and typechecking. The 35-entry journey observes ten initial cards,
ten-more actions through exhaustion, mixed ordering/nested session cardinality,
and exact body request deltas. Holding a suffix body must not reach `gh` before
its reveal. A demanded failure retains the usable prefix and its retry neither
duplicates entries nor rereads healthy immutable bodies unnecessarily.

Behavior: opening a valid published catalog plus local session records → show
the first ten of their combined logical entries and demand only their body
details → invoking the explicit reveal action demands the next ten, or the
remaining entries, without resetting focus/scroll. Show meaningful loading,
older availability, exhaustion, and affected retryable gaps. Fewer than ten and
known empty sets keep their existing meanings. Retire the eager read path;
keep revision-check settlement separate from intentional unread suffixes.

Safe stopping point: explicit access can reach every eligible older entry and
the initial view saves body reads. Scroll automation and exact sidebar prefix
navigation are interim omissions replaced by slices 4 and 5; they do not remove
records or independent terminal/report access.

### 4. Reading further requests another batch

Type: Behavior
Status: planned
Proof: add `recently-done-progressive-scroll.spec.ts`; run it with the initial
list spec and dashboard column paging/kept/side-panel consumers. Observe wheel,
keyboard and touch-equivalent downward reading at the shown boundary, repeated
batches and the final partial batch. Prove no autonomous extension from initial
boundary visibility, resizing, horizontal paging, upward movement, or scrolling
another shown column while Recently done is hidden. Observe actual body calls.

Behavior: the developer scrolls downward to the shown Recently done prefix's
end → request the same next-ten operation as the explicit action, once per
renewed forward reading demand. Keep one range and one batch request owner;
do not use a permanently intersecting sentinel to drain the archive. Preserve
ordinary page scroll, focus, column position, and reduced-motion behavior.

Safe stopping point: ordinary progressive reading and explicit accessible
reveal both reach all retained entries through the same rule.

### 5. A selected done session reveals the exact prefix through its target

Type: Behavior
Status: planned
Proof: `recently-done-progressive-navigation.spec.ts` must use the real sidebar
trigger selected in the open source decision, not inject a selected session or
make a closed row visible only in the fixture. Run the Navigation/paging group
and affected sidebar consumers. With ten shown and the target at 27, hold its
body, select it, observe the pending demand, release it, and prove the target is
in view only after entries through 27 are available. Bodies 28–35 remain unread.
Also cover an already shown target, a longer existing prefix, repeat selection,
hidden column, cross-project navigation, reduced motion, missing/unreadable
target, and abandonment for another selection/project before the answer.

Behavior: an actual permitted sidebar choice targets a done entry beyond the
shown prefix → extend exactly through that entry, await its current demand,
then apply the existing panel/selection/focus and column-reveal behavior.
Keep newer selection and developer movement authoritative while reads finish.

Source decision required: the present sidebar cannot supply this trigger.
Until Terry answers and the seed/plan are aligned, this slice is stopped and
the whole plan is not ready for execution. Adding sidebar access would require
its corresponding membership/attention/keyboard proof in this same plan;
keeping membership requires the narrower agreed example. No new sidebar
behavior is authorized merely by this heading.

### 6. Collapse returns to ten and supersedes older demand

Type: Behavior
Status: planned
Proof: add collapse cases in `recently-done-progressive-state.spec.ts`, run
alongside the reveal/navigation specs and Navigation/paging consumers. Extend
the list with an open terminal/report, hold another batch or target answer,
invoke collapse from the keyboard, then release the held answer. Observe ten
entries, the heading/useful focus, unchanged panel/session state, no automatic
tail reopening, and working fresh scroll/explicit reveal/reselection.

Behavior: more than ten entries are shown → **Show latest 10**, reachable
without traversing the loaded tail, requests ten and supersedes outstanding
extension/navigation → restore the heading and a retained focus home. Preserve
the records and open panel. Cache reuse is allowed; no hidden body is requested
just to collapse, and a late answer cannot restore obsolete range or scrolling.

Safe stopping point: the extended view has a reliable short-list recovery path
and all prior reveal mechanisms remain available.

### 7. Refresh preserves reading range and a new project starts short

Type: Behavior
Status: planned
Proof: extend `recently-done-progressive-state.spec.ts`; run all four capability
specs, the Done projection/independent arrivals group, changed revision-reuse
consumers, and Navigation/paging consumers. Publish a new revision through the
normal check, including a new first entry, an unchanged body, a changed body,
and expiry/removal. Observe current ordering, range and focus/target retention,
correct revision-specific requests/reuse, and useful focus after removal.
Reload and switch away/back to observe reset; sidebar selection into another
project still reveals its target. Opening/closing panels and resizing columns
retain range. Hold an old project/revision answer and release it after leaving.

Behavior: a same-project refresh replaces the published snapshot → retain the
requested prefix count, extending only as needed for a still-present focused
entry or selected navigation target, and clamp scroll when content shrinks.
A reload or project switch starts at ten unless a new explicit navigation
requires more. Obsolete answers cannot affect the newly selected view; shown
facts, counts and read gaps remain associated with their own project/revision.

Safe stopping point: the complete range lifecycle is delivered. Assimilate the
result into `dashboard/README.md` and session-history/navigation documentation
alongside the final producer/adoption contract; retain this seed and plan for
the authorized execution retrospective and wrap-up.

## Cumulative review and remaining concern

The seven slices evolve one derived catalog, one combined logical entry list,
one requested prefix, and the existing selection owner. Different triggers do
not gain separate lists, caches, or navigation rules. The only preparatory
Structure is directly followed by the Behavior that consumes it. Each other
slice owns one observable capability and its focused proof, including its
cleanup. The source supplies no numeric target or hard limit, and none is
invented. No boundary-specific refactoring pass is needed for this sequence;
the open navigation issue requires a source decision rather than reslicing.

Remaining concern: current sidebar membership prevents slice 5's direct saved
Done trigger; adding that access would expand the recorded range/read boundary.
Its full proof and potential additional sidebar scope cannot be selected by this plan.
Record `not-ready` until the human answer has aligned the seed, that slice,
and its consumer proof. Other observed premises do not substitute for the
missing trigger, and no existing open-session navigation test is claimed as
proof of the promised saved-Done journey.
