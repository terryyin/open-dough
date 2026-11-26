# Verify origin trunk and detach membership from detail proofs

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#open-and-refresh-board-at-verified-trunk)

**Identity:** SEED-430#open-and-refresh-board-at-verified-trunk

**Split from:** Plan 824, then on 2026-11-26 the open-and-Refresh slices moved to
[plan 853](../853-refresh-published-board-in-place/PLAN.md). On 2026-11-26 the
developer cut this story at the delivered boundary: slices 1–3 stay here, and
slices 4–6 moved to
[plan 856](../856-open-the-board-from-the-verified-git-trunk/PLAN.md)
([SEED-430#open-the-board-from-the-verified-git-trunk](../../seeds/SEED-430-read-published-project-data-from-local-git.md#open-the-board-from-the-verified-git-trunk)).

## Goal and scope

Verify the exact trunk origin advertises, share that check across eligible
opens, and make the detail, credit, and recovery proofs compare their own
reads without a REST membership read. The Board route, cold failure copy,
and membership retirement are plan 856.

## Current decisions

- Follow [Share one refresh](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  makes origin authoritative and keeps the Review repository apart from the
  execution checkout.
- Probe with `ls-remote --exit-code`, fetch `refs/heads/<ref>`, and accept it
  only when `FETCH_HEAD` is the probed commit. Do not move
  `refs/remotes/origin/*`. Classify under `LC_ALL=C`: 401/403 stderr is
  refusal, exit 2 after a successful probe is a missing trunk, and any other
  128 is unavailable.
- Share one check per project, origin URL, and credential. A departing waiter
  releases only itself. The Board's 30-second bound stays apart from Review's
  cold sync allowance.
- Hold a real transfer with `remote.origin.uploadpack` and `heldUploadPack`.
  Test support gains no wrapper.

## Outside-in proof

| Promise | Proof owner |
| --- | --- |
| Exact origin pin, including a move during transfer, and refused, missing, or unavailable transport | Slice 1 |
| Eligible opens share, projects are isolated, a waiter can leave, the wait is bounded | Slice 2 |
| Detail, credit, and recovery proofs omit membership and still require their own reads | Slice 3 |

## Ordered slices

### 1. Verify an exact origin trunk candidate

Type: Structure
Status: done

Change: Probe the configured ref, fetch the advertised commit into the Review
repository, reject a different fetched commit, and read the backlog at the
probed commit. Classify refusal, missing trunk, and unavailable.

Proof: Accepted at `verifiedOriginTrunk` in `verified-origin-trunk.spec.ts`.
Six tests and `npm run --silent typecheck:dashboard` exited 0. Published as
`2dca752cf7bf75737c07f6f84635967658514c53`.

### 2. Share bounded Git checks between eligible opens

Type: Structure
Status: done

Change: Run the slice 1 check inside one shared observation per project,
origin URL, and credential. A qualifying open joins; a departing waiter
releases only itself; the Board deadline ends the wait.

Proof: Accepted in `shared-verified-origin-trunk.spec.ts`: one shared fetch,
one waiter leaves, a second project proceeds, and a 50ms join is unanswered.
Published as `c532c7b0ae87b4b257231cf69b2a31c00aab18a6`.

### 3. Prove detail and recovery reads apart from membership

Type: Structure
Status: done

Change: In the detail, credit, and recovery cases, compare only the reads
each case promises and leave the membership operation out of the compared
list. Limit a detail read in `limit-recovery-tabs.spec.ts`. Count only
backlog paths in direction disclosure.

Proof: Accepted on REST. The eight edited specs passed, and
`limit-recovery-tabs.spec.ts` passed after both tabs opened before the
cooldown. Published as `11264ea38b4a45592ff54328f60ef90a33899870`.

## Learnings

On 2026-11-26 the developer stopped execution after slices 1–3 and split the
unfinished Board open, cold Git failures, and membership retirement into plan
856. Slices 1–3 were already published. Slice 4's uncommitted edits stay in
the execution worktree and are not part of this story.

## Execution identity

Story Branch Mode. Workspace
`/Users/terryyin/git/open-dough/.worktrees/open-the-published-board-at-verified-git-trunk`
on `cursor/open-the-published-board-at-verified-git-trunk`. Publisher
`dashboard-territory.local-open-dough`, agent Sola-chan. Trunk `origin/main`.
