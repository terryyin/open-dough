---
id: SEED-025
status: active
planted: 2026-09-23
planted_during: Longer-term product backlog capture requested by the maintainer
trigger_when: Extending backlog visibility to preparation before execution
scope: unknown
---

# SEED-025: Make story preparation visible in the product backlog

## Why This Matters

For Terry and developers coordinating stories, preparation can remain unfinished
in an owned worktree while the published backlog makes the story look untouched.
Another developer may duplicate that preparation or start from published material
without knowing that someone is reconsidering it. This matters particularly when
preparation spans sessions or waits for a product answer.

Existing canonical story records and dashboard badges already express refinement,
approach, and readiness. The missing fact is who has undertaken preparation that
has not yet landed. Ad hoc work without an existing backlog representative is a
separate problem owned by SEED-028.

## Story Decomposition

<a id="show-backlog-preparation-states"></a>

### 1. See refinement in progress and prepared stories in the product backlog

**Identity:** SEED-025#show-backlog-preparation-states
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/099-published-preparing-assignments/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6086ed6dd84ead0190b87822f91ec8f5e3405131275b17271f8105327bffa071","plan":"4f881ca1a41c67227a76fb1badcd128a8c0558d3c287eb51fb5f53d6cd3895e7"}}
```

**Status:** Refined and slice-planned on 2026-09-25. Product decisions are
resolved. The [execution plan](../quick/099-published-preparing-assignments/PLAN.md)
is unexecuted; preparation files remain uncommitted for review.

#### Goal

A developer viewing the published backlog can identify a story being prepared,
see its assigned developer, and coordinate before duplicating preparation or
starting work from material being reconsidered. Finished preparation remains
understandable through the existing refinement, approach, and readiness facts.

#### Scope

- Use one activity state named **Preparing** for story refinement, slice planning,
  and plan refinement before execution. Do not distinguish those activities with
  separate in-progress states. Continuing them within one preparation session
  retains the assignment.
- Apply this behavior to an existing queued story with a stable identity. Keep
  its backlog membership, identity, and priority throughout preparation. No
  product-backlog document format change is required by this story; exact record
  representation remains an implementation choice using authoritative records.
- Before substantive refinement or planning starts, publish the Preparing activity
  for the story and its developer assignment in a committed announcement to
  origin/main (or the project's authorized remote trunk). Confirm that publication
  before beginning the preparation work. A local worktree, local commit, or
  conversation alone is not a shared announcement. The announcement does not
  publish the unfinished draft or require a remote preparation branch.
- After the announcement is confirmed on remote trunk, attempt to fast-forward
  the established default checkout through its existing safe refresh procedure,
  before beginning substantive preparation. Do not switch a busy checkout to main
  or overwrite local work. Report a dirty, busy, or diverged checkout as a deferred
  refresh; that local condition does not undo publication or block preparation in
  its owned workspace. If the announcement itself cannot be published, preserve
  the owned workspace and stop before substantive preparation.
- Select the next available named developer from the same 29-name rotation used
  by execution. Names occupied by either preparation or execution are unavailable
  to another assignment. Continue after the latest published assignment, skipping
  occupied names and wrapping around; release does not reset the rotation.
  Preserve the existing behavior when only the just-released name is available,
  and the existing no-available-name outcome when all names are occupied. An
  existing profile on remote trunk occupies the name and must not be overwritten
  for another assignment. When a released name is selected on a later turn, create
  a fresh profile with that assignment's actual tool/model information.
- The dashboard shows Preparing and the assigned developer with the developer
  information available from the assignment, including host/model when recorded.
  It observes published evidence without requiring the preparer's local machine.
  Preparing records an undertaking; it does not assert that an agent is currently
  running. Rotation names identify work assignments, not newly spawned AI sessions.
- Confirmed landing of the retained preparation result ends Preparing and releases
  its developer in the published project state automatically, by removing the
  active assignment profile as part of the landing outcome. No separate manual
  release command or user decision is required after successful landing. Keep the
  story in the backlog; ending preparation is not completing or removing the story. A failed landing
  must not falsely show that preparation ended or the developer was released.
- A pause, wait for an answer, or end of a conversation turn retains Preparing
  and its assignment. Resume uses that assignment. Explicit abandonment ends the
  assignment through a published change while retaining the queued story and any
  recoverable draft/worktree; abandoning an assignment does not itself authorize
  discarding draft content.
- Do not expire or recycle occupied names based on age or silence. A lingering
  profile is evidence to inspect, not proof that the work is abandoned. Retain its
  story association and published history for diagnosis. If all names are occupied,
  report the assignments for inspection rather than silently reclaiming one.
  Recovery removes only an identified, confirmed-abandoned assignment and leaves
  unrelated work intact. Normal completion cleanup must be safely retryable.
- Continuing the same AI conversation after landing does not retain the released
  identity. Starting another preparation or execution obtains the next available
  assignment under that workflow; ordinary conversation alone assigns no name.
- After landing, continue showing the actual recorded refinement, approach, and
  readiness facts. A refined story without a plan may remain unready. Landing or
  ending Preparing does not itself grant readiness, Take, or execution authority.
  Later authorized execution obtains an assignment through the shared rotation.
- Starting a new preparation pass on a previously prepared story can show Preparing
  alongside its existing preparation facts. Apply existing invalidation and
  reassessment semantics to substantive changes; starting activity alone is not
  evidence that the previous readiness assessment is invalid.

**Material constraints:** One authoritative repository record per fact; dashboard
views derive from published records. Activity, backlog membership, preparation
quality, and execution authorization remain distinct. These follow
[Accepted ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
The dashboard and Git architecture drafts (ADRs 0008 and 0009) remain Proposed,
not additional accepted constraints.

**Deferred promises:** Ad hoc work capture belongs to
[SEED-028](SEED-028-track-ad-hoc-work.md#track-ad-hoc-work). This story does not
promise live heartbeats, agent-session scheduling, a new
readiness model, or preparation tracking inside an already Taken execution.
Collaborator messaging, transfer/takeover, and exclusive locking of a story
are not required to deliver the selected visibility outcome. Do not interpret
an assignment as proof of exclusive ownership or execution permission.

#### Key examples

1. **Visible before landing:** A queued story awaits preparation. Before an agent begins
   refining it in an owned worktree, its Preparing announcement and assignment
   are committed and published to remote trunk, and default-checkout refresh is
   attempted. The published backlog view shows Preparing
   and that developer while the draft remains local, with the same story identity
   and priority. Moving on to slice planning in the same session does not choose
   another developer or introduce a different activity state.
2. **Shared rotation:** Yui is executing a story and Akiho is the most recently
   assigned developer. Preparation of another queued story selects Yuma when
   available. Its published assignment makes Yuma unavailable for a new execution
   or preparation assignment.
3. **Land refinement only:** A Preparing story has a retained refinement but no
   plan or selected planless approach. Its result lands, Preparing ends, and its
   developer is released. The story remains queued and shows refined with its
   actual approach/readiness, rather than becoming ready merely because it landed.
4. **Land prepared work:** Refinement and planning finish in one preparation
   session. The retained result and its actual readiness assessment land.
   Preparing ends, the developer is released, and the dashboard shows the recorded
   planned/readiness facts. Execution still requires separate authorization.
5. **Release preserves rotation:** Yuma's preparation lands and releases Yuma.
   With no intervening assignment and Sola available, the next assignment uses
   Sola even though Yuma is free again. The completed preparation does not remove
   its story from the queue.
6. **Announcement and checkout freshness:** An announcement cannot reach remote
   trunk, so substantive preparation does not start. Alternatively, the announcement
   publishes successfully but the default checkout contains unrelated edits:
   preserve those edits, report refresh deferred, and proceed in the owned
   preparation workspace from the published basis.
7. **Publication not confirmed:** A preparation result has been written locally
   but its landing fails. The remote view continues to show the published Preparing
   assignment; local completion is not reported as a published release.
8. **Reconsider published preparation:** A queued story already has recorded
   refinement and planning. A new preparation pass shows Preparing and its assigned
   developer while preserving the meaning of the existing facts. Other developers
   can coordinate with that preparer before relying on the prior material.

9. **Pause and abandonment:** Preparation waits for the developer's answer across
   sessions. Its assignment remains occupied and resume keeps the name. The
   developer later explicitly abandons that preparation: publish the end of the
   assignment, retain the queued story, and preserve the recoverable draft unless
   its discard was separately authorized.
10. **Lingering profile:** A profile remains after an interrupted cleanup. Its age
    does not make its name available. Inspection can trace the assignment to its
    work and Git history. A retry completes the original cleanup when applicable;
    confirmed abandonment can release that assignment. A delayed cleanup must not
    delete a newer assignment that has since reused the same name.
11. **Same conversation, new work:** Preparation lands and its profile is removed.
    The conversation continues with another authorized assignment. Rotation selects
    the next available name and records its current tool/model, without requiring
    a fresh AI conversation or reusing the released identity automatically.

#### UI

Make Preparing and developer information readable on the corresponding story in
the dashboard. Retain the story's backlog priority and existing preparation badges.
No separate Refining or Planning in-progress states are needed. Exact placement
and visual styling may follow the existing dashboard conventions; the activity
must not imply a mandatory lifecycle stage that every story must pass through.

**Value / learning:** Test whether published preparation ownership avoids duplicated
work and makes preparation spanning sessions easier to coordinate. A chat message
or published draft branch is a smaller alternative, but requires backlog readers
to reconstruct the activity elsewhere.

**Depends on:** Existing canonical story state, published assignment and developer
rotation, preparation landing, and dashboard reading. The ad hoc work story is not
a prerequisite.

**Effort hypothesis:** Four bounded slices are planned; no numeric sizing policy
was supplied. See the execution plan for boundaries and proof.

**Safe stopping point:** Queued preparation and its developer are visible before
landing, with correct release afterward, without changing queue priority or
conflating preparation with execution authorization.

#### Architecture recommendations for planning

These recommendations apply the agreed behavior and Accepted ADR 0002's coherent
representation principle. They are planning input, not an executable slice plan
or new Accepted ADR.

- **One assignment concept:** A reusable developer name is distinct from its
  current work assignment and from the host AI conversation. Extend the existing
  assignment representation to distinguish preparation from execution. Derive
  Preparing from the active preparation assignment; avoid maintaining a second
  independent activity flag with a competing lifecycle. Canonical story records
  continue owning refinement, approach, and readiness.
- **One allocator and profile lifecycle:** Reuse the fixed roster, rotation,
  occupied-name checks, profile parsing, and Git history semantics. The current
  agent-profile module and execution-start selection already own these concepts.
  Expose shared responsibilities as needed instead of copying an allocator into
  preparation. Execution-specific mode and branch data must not be fabricated for
  preparation; extend the representation to express each activity honestly while
  continuing to read existing execution profiles.
- **Separate assignment release from story completion:** The existing complete
  operation removes both the backlog entry and matching profiles. Reuse its
  release responsibility independently for preparation, leaving execution's
  completion behavior intact. Keep landing result and assignment release in one
  coherent published outcome where possible, with retryable recovery. Verify the
  particular assignment being ended, not just the reusable name or story, so an
  old retry cannot delete a later assignment.
- **One publication and checkout-maintenance path:** Reuse the owned-workspace,
  fetch/reconcile/publish, remote confirmation, and safe default-checkout refresh
  responsibilities already used by execution. Recheck allocation against remote
  state on publication contention; a rejected or ambiguous push must not permit
  substantive preparation before its announcement is confirmed. Publishing the
  announcement and landing the retained draft remain distinct lifecycle actions.
- **One derived dashboard view:** Extend the existing published-profile reader and
  developer display beyond Taken entries to queued preparation. Read assignments
  and story facts from a consistent published snapshot. Preserve explicit missing,
  unreadable, or conflicting evidence rather than inferring live activity. Do not
  add a dashboard-owned assignment store or a heartbeat/expiry service.

The reuse assessment found the roster/profile contract in
`src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs`,
selection and publication orchestration in `src/skills/dough-execute-plan/scripts/`,
release in `product-backlog-complete.mjs`, and published profile consumption in
`dashboard/src/publishedWork.ts` and `TakenOwnerFacts.tsx`. These are responsibility
owners to assess during planning, not a prescribed file split or command API.

## ADR alignment

Concise, reader-facing updates have been drafted in
[ADR 0007](../../docs/adrs/0007-software-development-lifecycles.md#shared-work-assignments)
for the shared assignment lifecycle and
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md#domain-concepts-and-relationships)
for identity, assignment, and derived Preparing state. Both remain Proposed and
uncommitted for review. ADR 0009 already supplies the remote-publication and
independent default-checkout-refresh direction. No Accepted ADR was changed.
The plan follows the agreed story outcome and Accepted ADR 0002; it does not rely
on accepting ADR 0007's unrelated delayed-integration proposal.

## Open Decisions for Refinement

None remain for the selected product outcome. Pause, abandonment, and diagnostic
retention were agreed in the discussion. Architecture recommendations above remain
available for planning review; exact schema, command shape, and module boundaries
are implementation choices. ADR acceptance remains human-owned and does not authorize implementation or
resolve ADR 0007's unrelated existing conflict. The planned approach and recorded
readiness assessment refer to the linked execution plan.

## Ordering and When to Surface

Retain the story's current backlog position and its identity. The original
end-of-backlog capture instruction is historical; the current canonical backlog
owns priority. Preparation does not reprioritize this story or SEED-028, or authorize
implementation. Slice planning was subsequently requested explicitly.

## Breadcrumbs

- Maintainer request on 2026-09-23 to capture preparation states.
- Refinement discussion on 2026-09-25: retain this story separately from ad hoc
  work; select Preparing, share the execution developer rotation, show developer
  information, and release the developer when preparation lands.
- Follow-up clarification: publish the announcement before substantive preparation,
  then attempt safe default-checkout fast-forward. Existing execution releases a
  name by deleting its active profile during completion, not by overwriting an
  occupied profile on its next rotation turn.
- Execution investigation on 2026-09-25: assignment selection uses trunk history
  even after release; completion removes matching active profiles. Nineteen
  focused assignment, startup, and release tests passed. Preparation needs release
  without execution completion's removal of the backlog entry.
- Maintainer confirmed pause retention, automatic release on landing, explicit
  abandonment, and preserving lingering assignments as diagnostic evidence;
  requested ADR recommendations and cohesive implementation direction.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Story dashboard](../../dashboard/README.md).
- [Preparation recording](../../src/skills/dough-product-backlog/references/record-preparation.md).
