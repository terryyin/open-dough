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
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
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

Read-only inspection on 2026-11-05 at `c26dc102453dc17c8338e50dbfeaef2dea9948e2`
and `a71a33113a4b9634202c4ae0add63c76a7ec83e2` found:

- A new observed revision puts `useIntentLocations` into loading;
  `IntentPerspective` replaces the browser with that explanation and keys its
  selection owner by source and revision. Leaving Intent also unmounts it in
  `ConfiguredDashboard`. These paths explain lost reading state. A literal
  whole-browser reload has not been reproduced; do not claim that diagnosis
  or a measured frequency.
- `IntentProofSummary` requests every contained file with concurrency four
  through `readRepositoryFileAt`, and recomputes figures as answers arrive.
  Selecting a different folder mounts another summary. The documented large
  `dashboard/tests` location has roughly seven hundred spec files. This is
  evidence of repeated work, not a measured current latency or traffic total;
  the active local-proof removal story already deletes these calculations.
- Source reading uses published GitHub data through the local authenticated
  boundary, rather than a cached developer checkout. `PinnedTexts` and
  `PinnedMemo` cache immutable texts and trees, including blob-SHA reuse;
  `RetainedAnswers` retains successful answers across processes with a default
  64 MiB budget. `fileContentCache` provides a bounded 16 MiB browser cache,
  but Intent's file and summary readers bypass it. Existing upstream request
  sharing does not eliminate frontend/backend requests or bytes. The HTTP
  boundary currently answers with `Cache-Control: no-store`.
- Published-revision SSE already runs at page scope independently of the
  perspective, with shared backend observations and a 15-second pace; its
  fallback is revision checking. It conveys revision/branch-head answers,
  not file text or calculation progress. Source is immutable at a pinned
  commit; CI can change at that same commit without a branch-head event.
- The selected-story lens reads comparison metadata, including paths, change
  kinds, renames and line counts, without sending source or diff bodies.
  Opening a changed file can additionally request published source that its
  displayed diff does not use. Preserve the useful metadata path while
  removing unnecessary content transfers.

These are observations of the product before the two active stories below
finish. Recheck their integrated result when planning this story; deleted
local-proof code is diagnostic history, not an implementation target.

**Scope.**

Required behavior:

- **Stable reading of one revision.** Keep the selected location, folder or
  file, expansion, reading position and applicable view choices through
  background revision observations and switches between Development and
  Intent. Keep each project's reading state scoped to that project. A newer
  published revision produces a small **New revision available** notice;
  it does not clear the current reading or fetch replacement source bodies.
  Applying the update deliberately loads the replacement metadata while
  keeping usable content visible, then preserves navigation by path where
  valid. Explain a selected path that disappeared. Development's published
  observation may advance independently of the Intent revision being read.
- **Metadata first.** Opening Intent with no selected file returns compact
  location/tree metadata, server-calculated counts and the CI homepage answer
  from its existing owner. Folder navigation uses that metadata or one compact
  answer for the requested scope. Return only the structure and summary data
  useful for the configured Intent locations and current navigation; avoid
  repeated whole-tree payloads. File counts should use the tree, without
  fetching and parsing every source file. The initial navigation must not
  wait for an unrelated source scan or calculation.
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
- **Cached backend results.** Any surviving source-derived summary needed
  by this story is computed in the backend and returned as compact figures,
  never as a collection of file bodies for frontend calculation. Prefer tree
  metadata and already published CI summaries over source scans. Reuse the
  existing bounded, rebuildable caches and upstream request sharing; share
  concurrent calculations as well. Reuse unchanged content across revisions
  where its Git identity establishes that it is unchanged. Cache keys must
  distinguish repository, revision/content identity, relevant Intent settings,
  selection/comparison identity and calculation/response version as needed.
  Eviction or restart produces an on-demand miss, not a bulk download.
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
5. Two pages request the same cold summary. One backend calculation answers
   both with compact results. One page leaves; the other still receives its
   answer. Unchanged file identities reuse extracted results at a later
   revision; changed files/settings produce the appropriate new answer.
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

**Relationship to work already in progress.**

- [Remove local proof from Open Dough](SEED-238-remove-local-proof.md#remove-local-proof)
  (`SEED-238#remove-local-proof`) owns deleting the expensive committed-proof
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
  remain the delivery owners. The three
  [SEED-240 follow-ups](SEED-240-reliable-dashboard-updates-and-session-details.md)
  own stream freshness warnings, abandoned setup and hidden Session details;
  this story does not duplicate those repairs.

**Architecture and existing solutions.**

[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
requires rebuildable derived caches and keeps Git origin authoritative,
without an application database or dependence on a developer checkout.
The proposed backend index is a derived reading aid. Reuse
`dashboard/server/pinnedTexts.ts`, `pinnedMemo.ts`, `revisionMemo.ts`,
`retainedAnswers.ts` and the existing shared `gh` reads before adding a new
representation. Browser content reuse already has `fileContentCache.ts` and
`repositoryFileReads.ts`; preserve their bounded retention and revision
identity when exposing a suitable shared read. SSE belongs to the existing
published-observation lifecycle. Cache record shape and endpoint organization
remain implementation-planning choices.

**Evaluation.** Follow
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md):
record a before/after baseline using the same project revision, folder size,
browser/server cache conditions and navigation journey. Use a representative
large Intent location. Compare frontend/backend request counts and response
bytes, upstream GitHub reads, backend calculation reuse, and time to first
usable navigation/selected content. Include cold open, warm revisit,
perspective return, selected-story navigation, update notification/application,
and a failed read. Establish the baseline after accounting for the active
stories so their gains are not attributed to this one. The zero-body,
single-file and cache-hit examples above are observable acceptance targets;
latency/byte savings remain unmeasured until evaluated. Reuse relevant browser
and boundary tests when the executable plan is prepared.

This project's [failing and flaky tests policy](../../AGENTS.md#failing-and-flaky-tests)
applies as written. This record captures one refined story for the first
Backlog position; it supplies no executable plan, readiness assessment, Take
or implementation authority. No unanswered product decision currently blocks
slice planning.
