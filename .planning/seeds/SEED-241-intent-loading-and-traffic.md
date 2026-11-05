---
id: SEED-241
status: active
planted: 2026-11-05
planted_during: Terry Yin's report of disruptive Intent refreshes and slow loading, followed by the request for cached backend calculations and less frontend/backend traffic
trigger_when: A developer opens Intent, browses folders or files, or continues reading while published work changes
scope: story
---

# SEED-241: Load Intent without disruption or bulk source transfer

<a id="load-intent-without-disruption-or-bulk-source-transfer"></a>

### Load Intent without disruption or bulk source transfer

**Identity:** SEED-241#load-intent-without-disruption-or-bulk-source-transfer
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/477-load-intent-without-disruption/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1612364cbe28f13d46e5aadef8ce9eed559eced01de3b7bb5195b4292ffd3023","plan":"2f99faf90cf96153e851b6c9a560e8cca4200d0fdc63b6ebf9e0253f240d6f31"}}
```

**Goal.** A developer can open and browse Intent promptly, keep their reading
place while published work changes, and revisit content without repeated
transfers or calculations. Intent sends compact navigation and backend-derived
summaries to the frontend, and sends source content only for a file the
developer asks to read. This reduces interruptions and the network cost of
reviewing product intent and its CI evidence.

**Report and evidence.** Terry reports occasional unexpected refreshes that
appear to reload everything, and slow calculation/counting when opening Intent
or selecting folders. Terry explicitly prioritizes frontend/backend request
count and transferred bytes, on-demand file content, and cached backend
calculations. The accepted proposal is a reader of one published revision,
with a compact backend index and summaries, stable navigation, and reuse of
existing caches and revision notifications.

Observed on 2026-11-05 at `1406517aeb8a3e52b121d8ee119ce08cbe26448e`, after
local-proof removal (`SEED-238`) landed and while the CI homepage story
(`SEED-239`) is still executing on its own branch:

- **Revision observations reset Intent.** A newer observed revision puts
  `useIntentLocations` into loading, `IntentPerspective` replaces the
  browser with "Reading Intent locations…", and its selection owner is keyed
  by source and revision. The maintained spec
  `dashboard/tests/intent-selection-reads.spec.ts` ("a new published revision
  reads the locations again and starts with nothing selected") passes and
  asserts exactly that. Trunk moves with every landing, so this is the
  likeliest explanation of refreshes that "reload everything". A literal
  whole-browser reload has not been reproduced.
- **Leaving Intent loses the place and repeats reads.** In a scratch
  Playwright journey on the pygardon fixture, opening a file, another file and
  the first again read the first file twice. Switching to Development and back
  re-read the locations and returned with the group collapsed and nothing
  selected (`ConfiguredDashboard` unmounts Intent).
- **Story diffs add an unused source read.** In the same scratch run with the
  selected-story fixture, opening a modified file's diff also sent the plain
  `path=dashboard/tests/a.spec.ts` read that its displayed diff does not use
  (`useIntentFileRead` reads every selected file the revision lists).
- **Navigation metadata is already compact and backend-cached.** The
  locations answer lists each location's file paths. For Open Dough's own
  trunk it was 67,758 bytes for 1,087 paths (`dashboard/tests` 713,
  `tests` 82, `src/skills` 292): 2.5 s cold, 9 ms warm from the backend memo,
  sent uncompressed. A source file read (8,346 bytes) took 2.8 s cold and
  4 ms warm. Folder Summaries count from that list and make no request. No
  surviving Intent summary fetches source bodies, since local-proof removal
  deleted `IntentProofSummary`.
- **Browser caches are not used by Intent.** `fileContentCache` (16 MiB,
  LRU) serves only `repositoryFileReads.ts`. Intent's file read, locations
  read and story-review diff reads (`useReviewRead`, `cache: "no-store"`)
  keep answers only while their component is mounted. The HTTP boundary
  answers `Cache-Control: no-store`.
- **Backend reuse exists.** `PinnedTexts`/`PinnedMemo` keep pinned texts and
  trees with blob-SHA reuse across revisions, `RetainedAnswers` keeps answers
  across processes (64 MiB), and a request can await a `gh` call another
  request began (`dashboard/server/readTiming.ts`).
- **Revision delivery is page-scoped.** Published-revision SSE runs
  independently of the perspective, with a 15-second pace and
  revision-check fallback. It conveys revisions, not file text. CI can change
  at the same commit without a branch-head event.

Deleted local-proof code is diagnostic history, not an implementation
target.

**Scope.**

Required behavior:

- **Stable reading of one revision.** Keep the selected location, folder or
  file, expansion, reading position and applicable view choices through
  background revision observations and switches between Development and
  Intent. Keep each project's reading state scoped to that project: another
  project's selection never appears, and a project change starts that
  project's reading afresh, as the mode choice does today. A newer
  published revision produces a small **New revision available** notice;
  it does not clear the current reading or fetch replacement source bodies.
  Several newer revisions give one notice, and applying it moves to the
  latest observed. Applying the update deliberately loads the replacement
  metadata while keeping usable content visible, then preserves navigation
  by path where valid. Explain a selected path that disappeared. The reading
  revision holds Purpose and Optimization Candidates; the CI homepage keeps
  following the live observed head under its own triggers, and Development's
  published observation may advance independently of the Intent revision
  being read.
- **Metadata first.** Opening Intent with no selected file asks for the
  locations answer (paths only) once per reading revision, beside the CI
  homepage answer from its existing owner. Folder navigation and counts use
  that answer and make no request. The initial navigation waits for no
  source scan or calculation. Keep these properties, which the integrated
  product already has.
- **Source on demand.** Fetch source or a file's diff only when that file is
  explicitly opened, including a candidate link, a positioned case, a restored
  explicit selection, or applying an update to the file already selected.
  Do not prefetch source bodies for sibling files, folder summaries, hidden
  panes or the story lens. Preserve changed-file highlighting, renames,
  deleted-file metadata and **Selected story only** without bulk diff bodies.
  Avoid an unused published-source read when the selected file displays a
  story comparison instead. Presentation work such as syntax highlighting
  stays a frontend concern; source-derived inventory and aggregate
  calculations belong in the backend.
- **Backend stays the calculator.** No surviving Intent summary needs
  source-derived calculation: folder counts and child lists come from the
  locations answer's paths. Keep it that way. Any count or summary this
  story shows comes from tree metadata or an existing backend answer, never
  from file bodies sent for frontend calculation. The existing backend memos
  and request sharing already answer warm reads in milliseconds; this story
  adds no backend index, calculation cache or job system.
- **Avoid repeat transfers.** Keep a bounded browser cache of compact
  navigation, summaries and files actually requested. Revisiting a cached
  item at the same revision, including after a perspective switch, makes no
  repeat content request. Overlapping requests for the same content share
  their work. Distinguish frontend/backend savings from backend/GitHub cache
  hits; both matter, and one does not establish the other.
- **Useful loading and recovery.** Show cached content immediately when it
  matches the requested identity. Mark only the content still loading; keep
  the rest usable and preserve the reading place through slow or failed
  refreshes. Distinguish an empty folder from an unavailable or incomplete
  answer. Retry the affected read without discarding valid cached content.
  Late answers for a departed project, story, revision or selection cannot
  replace the current answer. One reader leaving must not cancel work that
  another reader still needs.
- **Reuse revision delivery.** Use the existing shared revision notification
  for the update notice. Add no separate persistent Intent source stream or
  recurring source/summary polling. Finite content requests finish when their
  answers are ready. A cold computation can show a local progress indicator;
  a separate progress-stream/job system is not part of this story.

Required restrictions and their reasons:

- Source/diff bodies only follow a requested file: Terry explicitly requires
  reduced frontend/backend traffic and rejects bulk source transfer for
  frontend calculation.
- Every displayed answer retains its project, revision and, where applicable,
  story/comparison or CI attempt identity. This prevents mixing different
  products, file versions and observations while work is asynchronous.
- Cached immutable source metadata and live CI observations have different
  lifetimes. An earlier CI answer must retain the homepage's freshness label;
  a refresh failure cannot make it newly verified. Failed or partial reads
  must not become permanently cached successful empty summaries.

Scope limits:

- Consume the resulting product of local-proof removal; add no replacement
  local-proof inventory, per-case history, duration/cost calculation or
  archive. Only surviving navigation/summary responsibilities move or gain
  caching.
- Keep the CI homepage's single cache owner, target checks, timing semantics,
  process-only retention and existing refresh triggers. This story adds no
  live CI-completion subscription, time-based CI polling or persistent CI
  history.
- A new database, cloned/bare repository mirror, generic indexing platform,
  cache-management UI, comprehensive progress service and SSE transport
  rewrite are outside this increment. Reuse existing solutions first.
- Repairing an independently reproduced literal browser reload is conditional
  on evidence that it is part of this loading discrepancy; there is no claim
  that it has been reproduced. Do not turn that uncertainty into a reason to
  postpone the confirmed reading-state and traffic improvements.

**Key examples.**

1. Open Intent with no selected file and browse a location and child folder.
   The CI homepage and navigation become usable; folder counts and any needed
   summary come as metadata. Network observation shows zero source/diff-body
   responses, including when a selected story supplies change highlights.
2. Open one previously unread ordinary source file. At most one file-content
   request transfers that file, with no sibling source. Visit its parent and
   reopen it, then leave Intent and return: while the answers remain within
   the bounded cache, there are zero repeat content requests or backend
   calculations and the reading place is restored.
3. Open a changed file through the selected-story lens or a candidate's case
   link. Only content needed for that selected file is requested, its
   comparison/case position stays correct, and an unused plain-source read
   does not accompany a displayed diff. Renames and deleted files retain
   their existing explanations and explicit reading behavior.
4. While a file or folder is selected, the shared observer detects a new
   trunk revision. Intent keeps the shown revision, content, selection,
   expansion and scroll, displays the update notice, and transfers no source
   just because of the event. Apply the update: replacement metadata arrives
   without blanking the view, a still-present selected path remains selected,
   and only an already selected file may need its new content. A deleted path
   has a clear explanation instead of silently showing another file.
5. Select the 713-file `dashboard/tests` location, then several of its
   folders. Each Summary shows its count and children from the locations
   answer; no request leaves the page, and no file body is fetched for a
   count.
6. A file, summary or metadata refresh fails. Valid shown content remains
   readable, the affected failure and retry are visible, and initial failure,
   partial evidence and a real empty result stay distinct. A late answer
   after a project/story change cannot overwrite the new target. An evicted
   entry is read only when needed again.
7. Return to the CI homepage with a kept answer. The judgment, counts and
   timings appear with its retrieval time while the existing fresh read runs;
   failure keeps that answer visibly qualified. CI can complete or be rerun
   at the same commit, so a source cache hit or unchanged revision event does
   not establish a fresh CI judgment. Preserve the homepage's show,
   new-observed-head and **Check again** triggers.

Deferred promises (considered, not delivered here; naturally supported
behavior stays intact):

- Reading state and browser caches across a page reload, or retained per
  project across a project change. Both are in-memory page state.
- Keeping a changed file's line anchored after applying an update. The
  reading pane keeps its scroll offset and the new text replaces the old in
  place.
- Reusing a selected file's text across revisions by blob identity in the
  browser. After an update, the selected file is read again at the new
  revision; the backend's blob-SHA reuse keeps that read cheap.
- Response compression or HTTP caching on the read boundary, which keeps
  `no-store`.

**UI.** The developer reviewing intent decides when to move to newer
published work. The notice sits with the Intent reading, not over it, and
names the change in words: "New revision available — showing `<short sha>`"
with one **Show latest** action. It announces politely (a status, not an
alert) and takes no focus. While the update loads, the shown reading stays
and a local "Updating…" indicator marks it. If the update fails, the shown
reading stays with the failure and a retry beside the notice. A selected
path that no longer exists after the update reads "`<path>` is not in
revision `<short sha>`" in Purpose, and no other file is selected in its
place. Layout and components remain implementation choices.

**Relationship to work already in progress.**

- [Remove local proof from Open Dough](../done/SEED-238_remove-local-proof.json)
  (`SEED-238#remove-local-proof`, done) deleted the expensive committed-proof
  reads, proof-only summary calculations and their UI. This story preserves
  its surviving Purpose browsing and simple folder counts; it must not move
  the deleted feature into a new backend service.
- [Show CI status and timing on the Intent homepage](SEED-239-intent-home-ci-status.md#show-ci-status-on-intent-home)
  (`SEED-239#show-ci-status-on-intent-home`) owns the homepage, CI judgment,
  proof counts/timings and backend cache with visible freshness. Reuse that
  result while separating the source-reading snapshot from live observation.
  Its CI refresh-on-show/new-head/**Check again** contract stays intact.
- These are coordination relationships, not blocking prerequisites: stable
  reading state and demand-driven traffic work can start independently, and
  shared files alone do not require supplier completion. Reconcile against
  their latest integrated shapes before planning and during implementation;
  leave both Taken stories and their owned edits with their current owners.
- The [earlier deferred Intent proposal](SEED-225-restore-dashboard-responsiveness.md#deferred-proposals)
  is background evidence, not another queued implementation. Terry's current
  explicit request supplies the scope and authority for this story; it does
  not inherit the older proposal's outage-evidence prerequisite.
- [Existing published SSE delivery](../done/SEED-232_see-published-changes-over-sse.json)
  and [shared GitHub refreshes](../done/SEED-232_share-published-git-refreshes.json)
  remain the delivery owners. The three completed SEED-240 follow-ups —
  [freshness loss across stream retries](../done/SEED-240_show-freshness-loss-across-stream-retries.json),
  [stop revision checks after setup disconnect](../done/SEED-240_stop-revision-checks-after-setup-disconnect.json),
  and [read session assignments on demand](../done/SEED-240_read-session-assignments-on-demand.json)
  — own stream freshness warnings, abandoned setup and hidden Session details;
  this story does not duplicate those repairs.

**Architecture and existing solutions.**

[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
requires rebuildable derived caches and keeps Git origin authoritative,
without an application database or dependence on a developer checkout.
Browser reading state and caches are disposable
page state under that decision, kept in memory like the per-project mode
choice (`dashboard/src/pageIntentMode.tsx`) and story selection
(`pageStorySelection.tsx`). They hold answers fixed by their identity:
locations and file text by repository and revision, and a story file's diff
by its comparison's from and tree revisions. Reuse `fileContentCache.ts`'s
bounded LRU for file text. Live answers (the story comparison listing, CI)
keep their own owners and freshness. Server memos (`pinnedTexts.ts`,
`pinnedMemo.ts`, `revisionMemo.ts`, `retainedAnswers.ts`) and the shared `gh`
reads stay as they are. SSE stays with the existing published-observation
lifecycle. No Accepted decision conflicts.

Approaches compared (Explore and Borrow) against the goal and Terry's
accepted "reader of one revision" proposal:

- **Pinned reading with notice and page-held answers (selected).** It
  removes every observed disruption and repeat read with browser state
  only.
- **Follow new revisions automatically, preserving the selection by path.**
  It avoids a notice, but content still changes under the reader and every
  landing re-reads. This would replace the accepted proposal, so it stays
  Terry's call and is not pursued.
- **Per-folder tree endpoint or backend index.** This is unnecessary: the
  whole locations answer is 68 KB once per revision and folders already
  cost nothing.
- **HTTP caching of revision-pinned answers.** The browser would serve
  repeats, but limited and failed answers and the boundary's `no-store`
  contract make it riskier than the existing in-memory caches. Deferred.
- **Borrowed: a feed reader's "new posts" banner.** The feed maps to the
  Intent tree, new posts to a newer revision, and the scroll anchor to the
  selected path. The pin, the non-blocking banner and the deliberate apply
  carry over. The analogy breaks because a revision can delete or rename the
  anchor, which a feed never does, so the missing-path explanation is this
  story's own. Content-addressed caching (a blob SHA as identity) was also
  considered; it is the deferred cross-revision reuse above.

**Evaluation.** Follow
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md):
record a before/after baseline using the same project revision, folder size,
browser/server cache conditions and navigation journey. Use a representative
large Intent location. Compare frontend/backend request counts and response
bytes, upstream GitHub reads, backend calculation reuse, and time to first
usable navigation/selected content. Include cold open, warm revisit,
perspective return, selected-story navigation, update notification/application,
and a failed read. Establish the baseline after accounting for the active
stories so their gains are not attributed to this one; the request counts
in this story's journey exclude CI reads, which the CI homepage story owns. The zero-body,
single-file and cache-hit examples above are observable acceptance targets;
latency/byte savings remain unmeasured until evaluated. Reuse relevant browser
and boundary tests when the executable plan is prepared.

This project's [failing and flaky tests policy](../../AGENTS.md#failing-and-flaky-tests)
applies as written.
