# Open a queued story's published slice plan

Status: planned.

Identity: `SEED-021#open-queued-story-slice-plan`

Source: [refined story](../../seeds/SEED-021-observe-published-story-progress.md#open-queued-story-slice-plan).
Terry requested slice planning and plan refinement if needed on 2026-09-23.
This plan grants no Take or implementation authority.

## Goal and scope

A developer reviewing the dashboard can open a queued story's associated slice
plan from its card and expanded detail, even when the backlog does not repeat
the association already recorded in the canonical story. Resolve the link from
published records and pin repository navigation to the inspected revision.
Preserve story identity, queue order, canonical navigation, independent
preparation/readiness facts, and existing Taken and legacy explicit plan links.

Use the existing public and private project read paths. Present one normal
keyboard-accessible "Slice plan" destination per card/detail when the association
is unambiguous. Preserve an explicit fragment when both recorded paths name the
same file. No association means no invented plan. Read failure or an unsupported
slice layout does not erase a valid recorded destination. Invalid targets remain
non-clickable with a reason. Conflicts remain explicit without choosing a plan;
raw recorded references may remain inspectable as qualified source evidence.
External references keep their existing unpinned/external meaning.

No backlog-format migration, duplicate metadata requirement, new writer or
payload release is indicated. No plan editor/viewer, modal, new workflow stage,
automatic planning/Take, local discovery, or execution-branch inspection is
promised. The story remains queued while this plan is prepared.

## Existing solutions and current decisions

Follow Accepted [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
and [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
one canonical record per fact; planning, readiness, and progress are distinct;
reuse the suitable existing domain solution. ADR 0008 is Proposed, not binding.
The [North Star topic on backlog interpretation and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
already supports the shared typed snapshot and separate UI. No new architectural
topic or change to that direction is needed.

PFE findings from refinement, checked against the current callers:

| Responsibility | Existing owner and selected use |
| --- | --- |
| Recorded backlog links and story-state | Shared readers under `src/skills/dough-product-backlog/scripts/`; reuse their meaning, with no dashboard Markdown parser or filename discovery. |
| Association and disagreement | `dashboard/src/planAssociation.ts`, `publicEntryFacts.ts`, and `preparationEnrichment.ts`; expose navigation from the same recorded association used by preparation and slices. Preserve original backlog evidence so a derived link cannot overwrite it or manufacture agreement. |
| Destination resolution | `dashboard/src/sourceLink.ts`; reuse `resolveSourceLink` with the containing canonical file for story-state paths, the backlog file for explicit backlog paths, and the snapshot's repository/revision. Preserve existing scheme/path checks and explicit anchors. |
| Card/detail source links | `WorkStages.tsx`, `StoryDetail.tsx`, and `RecordedLink.tsx`; share the navigation choice and qualification across both views. Keep focus identity/role compatible with `workFocus.ts`; labels alone must not create divergent link policy. |
| Public/private reads | `repositoryFileReads.ts` and the existing private read boundary feed the same enrichment. No new endpoint, authentication flow, or fetch on opening detail. |

All unqualified source files in the table are under `dashboard/src/`.
Choose the smallest typed projection that preserves raw evidence separately from
derived navigation; exact function/type placement belongs to implementation.
Do not populate the raw backlog `entry.plan` with inferred data before conflict
checking. Never gate navigation on a ready assessment or successful plan parse.
For a conflict, label retained raw references as disputed evidence rather than
offering an agreed "Slice plan" action. A stale or unavailable assessment still
does not invalidate an otherwise unambiguous recorded destination.

## Ordered slices

### 1. Navigate to the recorded slice plan from a queued story

Type: Behavior
Status: planned

Behavior: a published queued story records a plan association only in its
canonical preparation state -> load the dashboard and follow "Slice plan" from
the card or expanded detail -> open that project's plan at the inspected
revision, keeping canonical navigation, membership, and readiness unchanged.
Refresh reflects the next published association; opening detail uses the current
snapshot. Missing, conflicting, invalid, and unreadable evidence follows the
same navigation rule and qualifications above.

Deliver association-to-navigation projection, both UI consumers, focused proof,
and affected documentation together. Update the source-navigation paragraph in
`dashboard/README.md` for the two containing-file bases and derived links; remove
its stale claim that story/plan contents are never fetched. Keep broader README
cleanup out. Necessary small modularization belongs inside this behavior; no
independent preparatory Structure slice is justified.

Proof ownership (all rows belong to slice 1):

| Promise | Setup and observable proof |
| --- | --- |
| Canonical-only association opens the correct plan | Extend `story-readiness.spec.ts` using `storyReadinessFixture.ts` and `committedOrigin.ts`. The current queued `plannedBlocked` fixture repeats its plan in the backlog: add an explicit fixture variant omitting that link while retaining real CLI-recorded planned state and committed plan bytes. Assert the queue card's resolved href, revision, label, and canonical link; activate the plan link through a controlled GitHub document route and observe the destination. Do not inject `entry.plan` or a derived URL as fixture output. |
| Card/detail agree, normal keyboard use, no detail fetch | Extend the same journey and `story-readiness-accessible.spec.ts`/`storyReadinessAccessible.ts`. Assert one plan action in the visible source-link area, its identical destination after expanding detail, unchanged repository-read count, and keyboard activation. Preserve focus by work identity across refresh; existing narrow/zoom observation must keep the new link reachable. |
| Public and private project context | Reuse the canonical-only variant in `story-readiness-private.spec.ts`'s existing dev/preview journeys. Observe the queued link and expanded detail against the Pygardon repository and fixture revision through the existing synthetic `gh` boundary. No live private credentials or repository contents are required. Public transport uses committed Git bytes at the HTTP boundary. |
| Readiness independence and refresh | Extend `storyReadinessGaps.ts` and the public journey: Not ready and Needs reassessment retain the plan link with unchanged labels; a later committed association plus Refresh updates the link path/revision. A failed refresh retains the previous snapshot's link and existing warning. Assert membership/order remain as recorded and fixture repository state gains no dashboard-originated mutation. |
| Agreement, fragments, and compatibility | Extend `source-navigation.spec.ts` and the committed-story fixture. Equivalent seed-relative/backlog-relative paths yield one destination with the explicit fragment. Existing Taken links, canonical-plan entries, and legacy explicit links still navigate; external references retain their unpinned label and unsafe schemes/path escapes remain non-clickable. Update affected label selectors coherently instead of keeping a second naming policy. |
| Conflicts, missing associations, and unavailable content | Extend `story-readiness-gaps.spec.ts`/`storyReadinessGaps.ts`: disagreeing paths or planned-versus-planless show the existing conflict, no agreed plan action or borrowed slice progress, and qualified raw evidence. Absent association creates no link; malformed canonical state creates no derived association. Fail the associated plan read and separately use an unsupported slice layout: preserve the valid pinned link while showing the dependent gap. Exercise an invalid story-state path through the real reader, not a fabricated display error. |

The current browser tests establish useful setup and regression assertions,
not proof that the new link already works. Extend those observations at the
navigation boundary; helper return values or prebuilt display snapshots are
insufficient. Focused pure-rule checks may supplement edge cases, but must not
replace the canonical-only public/private browser observations.

Focused execution commands from the eventual implementation checkout:

```sh
npm run typecheck:dashboard
npm run test:dashboard -- source-navigation.spec.ts story-readiness.spec.ts story-readiness-gaps.spec.ts story-readiness-private.spec.ts story-readiness-accessible.spec.ts
```

The Playwright configuration builds and serves production assets for each run;
the private spec also owns its isolated dev/preview servers. Prepare dependencies
with the project's `npm ci` and Chromium setup if absent. These commands are
planned proof, not passes recorded by this planning session. Broaden testing only
for a changed shared boundary or an execution/CI requirement.

Safe stopping point: one coherent navigation behavior works across the existing
observation paths with evidence qualifications intact. It is useful without
ownership or branch-inspection work. Do not deliver a half-wired card/detail
policy or mark the slice done while one mapped promise remains unproved.

## Execution gates and sizing

Use the installed execution workflow after separate execution authorization:
resolve mode, workspace, selective formatting and hook contract before claiming;
publish the Taken claim with this plan, accept outside-in proof, run independent
post-change refactoring, then format/check and publish the validated increment
with its CI observation. Preserve unrelated local work. No generated payload or
release action is triggered by dashboard-only work. Retain the source and plan
for the execution retrospective and story wrap-up.

One cohesive Behavior slice, including implementation, focused verification,
documentation and cleanup. No numeric slice target, hard limit, or timing
exception was supplied. Existing readers, both UI consumers, and fixture
boundaries are known; no new persistence or infrastructure assumption needs an
experiment. Reassess before expanding if implementation uncovers incompatible
caller purposes or requires a new domain policy/schema.

## Boundary review and preparation evidence

Review result: retain the single slice. Splitting association projection from
its UI would leave no usable result; splitting card from detail would create
inconsistent navigation. Public/private transport and gap examples exercise
the same common rule, with existing infrastructure; they do not justify
parallel link models or separate integration/testing slices. Necessary error
qualification belongs with the first delivered link, not a later hardening pass.
No split, consolidation, or scope escalation was needed. No slice-specific
blocking concern was identified in this review.

All checkable source promises are mapped above. This is planning judgment, not
executed product proof. Record readiness against the final story and plan
digests; it does not authorize execution. Preserve meaningful future learnings,
accepted proof commands/results, and resume decisions in this plan when work
is authorized, without copying operational traces here.

Preparation used an owned worktree from published revision `7534a15`. The
existing root is `.planning/quick/NNN-name/PLAN.md`; 080 was the highest current
allocation and 081 was checked absent immediately before creation. The story
remains in Backlog and its canonical record links this plan. This session has
not run or claimed implementation proof.
