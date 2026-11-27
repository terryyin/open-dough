# Open the Board from the verified Git trunk

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#open-the-board-from-the-verified-git-trunk)

**Identity:** SEED-430#open-the-board-from-the-verified-git-trunk

**Split from:** [SEED-430#open-and-refresh-board-at-verified-trunk](https://github.com/terryyin/open-dough/blob/374ccd86b15fdb1909590cc447b863bb34bb65f6/.planning/seeds/SEED-430-read-published-project-data-from-local-git.md#open-and-refresh-board-at-verified-trunk)
on 2026-11-26, former plan 828 slices 4–6. That story's slices 1–3 are the
shared verified-origin check and the detail proofs that leave membership out.
Uncommitted slice 1 edits below remain in worktree
`/Users/terryyin/git/open-dough/.worktrees/open-the-board-from-the-verified-git-trunk`
on `claude/open-the-board-from-the-verified-git-trunk`. Do not revert them
and do not treat them as part of the landed first half. Continue from that
worktree while it still holds the edits.

## Goal and scope

Open the Board at the origin-verified trunk with no REST membership fallback.
A cold open that cannot verify trunk shows no Board and says why. Remove the
REST membership dispatch and everything that loses its last caller with it.

Exclusions: visible confirmation time, manual Refresh, durable confirmation,
and fetch elision ([plan 853](../853-refresh-published-board-in-place/PLAN.md));
automatic observation, branches, other records, and Review callers
([plan 823](../823-follow-published-progress-from-local-git/PLAN.md)).

## Current decisions

- Execution resumes only after
  SEED-430#move-authenticated-read-proofs-off-the-board-ref-read lands (done
  2026-11-27); its retargeted specs pass with this plan's slice 1 server
  switch applied. Slice 1 then reruns its proof on the merged trunk.

- The switch point is the `ref` case in
  [performed reads](../../../dashboard/server/performedRead.ts). It calls the
  shared verified-origin check and does not fall back to REST.
  `resolveRevisionViaGh` keeps its callers in `revisionChecks.ts`,
  `feedbackMaintenanceCheck.ts`, and `followUpStory.ts`. A revision a check
  already named still uses `backlog-at`.
- Cold Git failure is shown as unavailable, except an explicit refusal, which
  keeps its established outcome. A pending open ends at the 30-second Board
  deadline. Slice 5 owns that copy; slice 1 does not add it.
- Hold a real transfer with `remote.origin.uploadpack` and `heldUploadPack`.
  Test support gains no wrapper.
- `pinned.answeredBacklog` records the trunk backlog as the base a later
  named revision is compared with. Call it after `observeProjectRevision`.

## Outside-in proof

| Promise | Proof owner |
| --- | --- |
| Cold Board opens at the exact verified commit, and two tabs share one held check | Slice 1 |
| Cold failures show no Board and never fall back to REST | Slice 2 |
| Superseded membership paths lose their last use | Slice 3 |

## Ordered slices

### 1. Open the Board at verified Git trunk

Type: Behavior
Status: planned

Behavior: With an accessible origin and an absent execution checkout, opening
the Board shows the backlog at the exact verified commit. Two tabs opening
one project share one held check; closing one leaves the other to finish.

The uncommitted switch is already in the worktree named above:
`performVerifiedTrunkRead` answers the `ref` case, calls `answeredBacklog`,
and the shared-open, first-open, unchanged-refresh, reopened-project, and
direction-disclosure proofs were being moved off REST membership.
`limited-reading-membership.spec.ts` is deleted in that same uncommitted
tree. Proof is not accepted. Continue that proof; do not start over.

Proof: Delete the REST `ref` dispatch. Move `shared-observer-reads.spec.ts`
and the backend shared-open and first-open cases to the upload-pack gate;
make "fails for good" a missing trunk. Retire
`limited-reading-membership.spec.ts` and any membership limit control it
alone used. Check the exact rendered revision and zero REST membership
calls. Run the former slice 3 files and the affected observation suites.
Budget 14 active minutes.

### 2. Report cold Git failures at the Board

Type: Behavior
Status: planned

Behavior: An unavailable origin, missing trunk, or unreadable backlog shows
no cold Board and names the problem as unavailable; an explicit refusal keeps
its established outcome. A pending open ends at the Board deadline and later
recovers.

Proof: Wire mapping and rendered states with a REST fixture that would answer
membership, showing zero fallback attempts. Preserve the first-open failure
wait and cross-project isolation through the real Git boundary. Budget 12
active minutes.

Move to Git cold failures, or delete where a kept case already proves the
promise, the REST cold-open cases the split left here: `read-failure`,
`transient-read-exclusions`, `project-read-recovery`, `project-read-isolation`'s
held first open, `authenticated-project-observation`, the empty-page,
pinned-backlog and stalled cases of `transient-read-recovery`, the reload step
in `limitedReadingJourney.ts` shared by the `limited-reading-*` specs,
`authenticated-read-revision-backlog`, and the logged-out cold-open case of
`authenticated-read-retained-answers`. This outgrows the budget: refine this
slice before execution resumes.

### 3. Retire the old membership-only support

Type: Structure
Status: planned

Change: Remove orphaned Board-specific REST handling, helpers, test controls,
and docs that no caller reaches after slice 1. Keep `resolveRevisionViaGh`
at its three remaining callers and the `backlog-at` and reachability readers.

Proof: Trace every deleted reference to its tests and docs; run the Dashboard
Backend Test and E2E Test suites. Budget 13 active minutes.

## Learnings

On 2026-11-26 plan 828 slices 1–4 overran. Slices 1–3 of that plan were
published. This plan's slice 1 has the uncommitted Git trunk switch and
stopped during proof. `published-work.spec.ts` and
`transient-read-recovery.spec.ts` still hold the REST ref and were not
re-proved against the Git open.

On 2026-11-26 the slice 1 switch was carried into this workspace. The named
specs and `published-work.spec.ts` pass against the Git open; the two
promises pass. It also fails about 45 other spec files (roughly 67 cases;
run logs `s1-backend.log` and `s1-e2e-obs.log` in the checkout's
`open-dough/evidence`). They produce generic authenticated-read behavior
(incident records, diagnostics, rate-limit waits, cooldown, subprocess and
output bounds, retained answers, shared request owner, in-process fake gh)
and cold-open failures by failing the REST `ref` answer, which the Git open
no longer asks. The plan's premise that only the named specs move is false.
Execution stopped for a scope decision; slice 1 is not delivered.

## Local gate

Run focused checks and Dashboard typecheck for each changed boundary. Slice 3
runs both full Dashboard suites because it deletes shared fixture controls.
Run long checks under `caffeinate -s -i` on AC power.
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
