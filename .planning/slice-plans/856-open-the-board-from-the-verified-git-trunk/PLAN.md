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

- Slices 1–3 leave REST cold-open cases failing until slice 4 moves the
  last of them. Deliver slices 1–3 as local commits
  (`--authority local-only`) and publish them with slice 4 once its suites
  pass, so no red revision is published. Slices 5–8 likewise stay local and
  publish with slice 9, which repairs the failed CI of `4a2c3d3a5`.
- The switch point is the `ref` case in
  [performed reads](../../../dashboard/server/performedRead.ts). It calls the
  shared verified-origin check and does not fall back to REST.
  `resolveRevisionViaGh` keeps its callers in `revisionChecks.ts`,
  `feedbackMaintenanceCheck.ts`, and `followUpStory.ts`. A revision a check
  already named still uses `backlog-at`.
- Cold Git failure is shown as unavailable, except an explicit refusal, which
  keeps its established outcome. A pending open ends at the 30-second Board
  deadline. Slices 2 and 3 own that copy; slice 1 does not add it.
- Hold a real transfer with `remote.origin.uploadpack` and `heldUploadPack`.
  Test support gains no wrapper.
- `pinned.answeredBacklog` records the trunk backlog as the base a later
  named revision is compared with. Call it after `observeProjectRevision`.

## Outside-in proof

| Promise | Proof owner |
| --- | --- |
| Cold Board opens at the exact verified commit, and two tabs share one held check | Slice 1 |
| Cold failures show no Board and never fall back to REST | Slice 2 |
| A pending cold open ends at the deadline and recovers | Slice 3 |
| Cold opens stay isolated per project and journey | Slice 4 |
| Superseded membership paths lose their last use | Slice 5 |
| Every other journey opens the Board from Git and both suites pass | Slices 6–9 |

## Ordered slices

### 1. Open the Board at verified Git trunk

Type: Behavior
Status: done

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
Status: done

Behavior: An unavailable origin, missing trunk, or unreadable backlog shows
no cold Board and names the problem as unavailable; an explicit refusal keeps
its established outcome. Nothing falls back to REST membership.

Proof: Move `e2e/observation/read-failure.spec.ts` (5 cases) and
`transient-read-exclusions.spec.ts` (5) to Git origin failures (unreachable
origin, missing trunk, refused credential, unreadable backlog), each with a
REST fixture that would answer membership and zero REST membership calls.
Move or delete `authenticated-read-revision-backlog.spec.ts` and the
logged-out cold-open case of `authenticated-read-retained-answers.spec.ts`.
Budget 14 active minutes.

### 3. End a pending cold open at the deadline and recover it

Type: Behavior
Status: done

Behavior: A cold open held at the Git transfer ends at the Board deadline,
then recovers on its own; an eligible cold failure retries on its schedule.

Proof: Move the cold cases of `transient-read-recovery.spec.ts` (empty-page
503s, pinned backlog, stalled read), `transient-recovery-lifecycle.spec.ts`
(hidden page, two pages sharing recovery) and `project-read-recovery.spec.ts`
(2) to an origin failure or `heldUploadPack` hold. Budget 14 active minutes.

### 4. Keep cold opens isolated per project and per journey

Type: Behavior
Status: done

Behavior: A held or failed cold open of one project never affects another,
each catalog project opens at its verified trunk, and a reload during an API
limit opens the Board from Git.

Proof: Move `project-read-isolation.spec.ts` (3) to an upload-pack hold,
`authenticated-project-observation.spec.ts` and
`catalogProjectExpectations.ts` off REST `commits/<ref>`, and the reload
step in `limitedReadingJourney.ts` shared by the three `limited-reading-*`
specs. Then run `e2e/observation`, the two story specs and the backend
observation and runtime suites, all green. Budget 14 active minutes.

### 5. Retire the old membership-only support

Type: Structure
Status: done

Change: Remove orphaned Board-specific REST handling, helpers, test controls,
and docs that no caller reaches after slice 1. Keep `resolveRevisionViaGh`
at its three remaining callers and the `backlog-at` and reachability readers.
The fake gh `ref` answers, `hold("main")`/`answerWith("main")` and the
zero-REST-membership readers stay: revision checks, feedback maintenance and
follow-up stories still reach them.

Proof: Trace every deleted reference to its tests and docs; typecheck and
the consumers' specs. The full-suite run of this slice found no failure
caused by its deletions. Budget 13 active minutes.

### 6. Open configuration and navigation journeys from Git

Type: Behavior
Status: done

Behavior: Adding, configuring and removing a project, and story URL history,
open the Board from the verified Git trunk.

Proof: Move `e2e/configuration/project-add.spec.ts` (expects REST
`commits/release%2Bstable`), `project-configuration.spec.ts`,
`project-remove-selection.spec.ts` and `e2e/navigation/story-url-history.spec.ts`
(its read problem must come from a Git origin failure) to Git-origin
fixtures. Budget 14 active minutes.

### 7. Gate launch reconciliation journeys on the Git open

Type: Behavior
Status: done

Behavior: Launch and responsive-session reconciliation journeys that gated
or failed the Board's REST cold open gate it at the Git transfer instead.

Proof: Move `e2e/launches/responsive-session-{reconciliation,reconciliation-completed,reconciliation-refusals,recovery}.spec.ts`
and `agent-launch-{claude-verification,story-card,story-card-problems}.spec.ts`
off `hold("main")`/`answerWith("main")` cold-open gates, using
`heldTrunkTransfer.ts` or a Git origin failure. Budget 14 active minutes.

### 8. Read session journeys' backlog from Git

Type: Behavior
Status: done

Behavior: Session sidebar, alerts and recently-done session journeys show
the backlog read from the verified Git trunk.

Proof: Move `e2e/sessions/{cursor-session-recovery,cursor-sessions-sidebar-navigation,recently-done-returned-sessions,recently-done-sessions-sidebar-reopen,session-alerts-navigation,sessions-sidebar-navigation-cases,sessions-sidebar-navigation}.spec.ts`
off REST `PRODUCT-BACKLOG.md?ref=…` assertions and REST-only publishing.
Budget 14 active minutes.

### 9. Publish story and review journeys through Git

Type: Behavior
Status: planned

Behavior: Story readiness, agent roster, recently-done navigation and
review journeys open the Board from a published Git origin.

Proof: Move `e2e/stories/{story-readiness,agent-roster,agent-roster-avatar,recently-done-progressive-navigation}.spec.ts`
and `e2e/review/{story-review-initial-sync,recently-done-one-shot-review}.spec.ts`
to Git-origin publishing; retire `contentPathsRead`'s `ref` branch if
story-readiness was its last caller. Then run the Dashboard Backend Test and
E2E Test full suites. Budget 14 active minutes.

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

On 2026-11-27, after the prerequisite landed, slice 1 reran on merged trunk
`43050914d` (load about 9). Its promises pass: `published-work`,
`shared-observer-reads`, `first-open-waits-for-read` and
`authenticated-read-shared`. Every other failure is a REST cold-open case
now owned by slices 2–4, including two `transient-recovery-lifecycle` cases
that the prerequisite left on the cold open. Run records `r2-backend` and
`r2-e2e` are in the checkout's `open-dough/evidence`.

Slice 2 (2026-11-27) maps an unverified trunk to one `unavailable` failure
naming origin, trunk or backlog; only an unavailable origin recovers on its
own. Refusal stays the check's HTTP 401/403. It removed the REST 429 and
no-commit cold-open cases, which a Board open no longer reaches. Open for
the developer: the seed's transport evidence calls GitHub's "Repository not
found" a refusal, but the delivered `verifiedOriginTrunk.ts` and its spec
treat it, and "Authentication failed", as unavailable, so they retry.
REST `mainReads` no longer counts cold opens; slices 3–4 use
`noteColdOpens` in `transientRecoveryPage.ts` instead.

Slice 3 (2026-11-27) holds or disconnects the Git transfer through
`dashboard/test-support/heldTrunkTransfer.ts`, which `sharedObserverOpen.ts` shares.
It deleted the pinned-backlog recovery case: one Git transfer reads trunk and
backlog together, and an unreadable backlog no longer recovers on its own.
`heldUploadPack` must be set up before the first open and holds every later
call; the dashboard's process-group close ends a transfer still held.

Slice 4 (2026-11-27): `e2e/observation` plus the two story specs passed
(126). The backend observation and runtime run failed only in
`kept-history-worker.spec.ts` (:30, :75) and `mounted-boundary-server.spec.ts`
(:170), at load 22–34 from other worktrees. This story does not touch those
files, and they passed on a targeted rerun at load 26–30. Slices 1–4 publish
on that targeted proof and the hosted CI verdict, which this execution owns.
A Board opened from Git during an API limit still reads at the revision, so
count Board-open requests only.

Slice 5's full E2E run (2026-11-27, load 22→10) found 26 cases in 24 files
outside `e2e/observation` that still assumed the REST cold open; slice 4 had
proved only `e2e/observation`. Hosted CI for `4a2c3d3a5` failed on the same
cases (run 45930629943, e2e shards 1, 2, 5, 6). Slice 5's proof was split
into slices 6–9 by spec group, as allowed for splitting the slice in
progress. Backend `agent-launch-duplicate.spec.ts:189` and
`agent-launch-start-duplicate.spec.ts:79` fail at load 23–36 at the base too.

Slice 6 (2026-11-27) needed no new publishing: `projectAddMachine`,
`projectConfigurationMachine` and `publishMovingHistory` already route the
Board through Git, so only REST assertions changed. `MovingHistory.disconnectGit()`
replaces `answerWith("main", 503)`; disconnect after any step that itself runs
Git against the route. `readsOfRepository` names one repository's reads.

Slice 7 (2026-11-27): launch reconciliation's fresh read is a Git check, so
REST `hold("main")`, `answerWith("main")` and `follows:false` no longer gate
or pin the Board. `holdLaterTrunkTransfers` (`laterTrunkTransfers.ts`) gates
reads after the open with `fail`, `releaseAt(revision)` and `release`;
`disconnectGit()` before Start fails the start's own push. Journeys that need
the Board to keep the opened trunk pass `keepsOpenedTrunk: true`. Slice 9
must settle `agent-launch-claude-verification.spec.ts:176`, a 5-second
launch-call poll that failed at load 16–28 here and at the base, and passed
alone: green in the full suite or hosted CI, or repaired.

Slice 8 (2026-11-27): every session fixture already published through Git;
only REST backlog `?ref=` assertions and a REST backlog hold changed. The
navigation journey now offers `holdPygardonOpen`, through
`dashboard/test-support/heldTrunkTransfer.ts`. All of `e2e/sessions` passed.

## Local gate

Run focused checks and Dashboard typecheck for each changed boundary. Slice 9
runs both full Dashboard suites because it deletes shared fixture controls.
Run long checks under `caffeinate -s -i` on AC power.
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
