# Keep a Cursor session Working while its CI is still running

**Source:** [Selected story](../../seeds/SEED-175-cursor-session-working-during-owned-ci.md#keep-cursor-session-working-while-its-ci-runs)
**Identity:** SEED-175#keep-cursor-session-working-while-its-ci-runs

## Goal and scope

A developer watching a Cursor execution on the dashboard sees the session as
**Working**, and not needing review, while that conversation still owns a fresh
non-terminal CI revision. Once that CI is terminal and the composer is idle,
the session reads **Ready for review** again.

At the follow-up-prompt reading after a confirmed first instruction, ask
whether this conversation still owns fresh open background work, and answer
that for CI by reading the mailbox the worker already wrote. An idle composer
stays **Working** when that mailbox's owner claim is this repository, host
`cursor`, and this conversation, and `freshPendingRevision` still reports a
pending attempt or queue observation inside its freshness window. Keep the
existing unfinished-subagent reading. A live stop-hint screen stays **Working**
without consulting the mailbox.

**Exclusions:** No agent-written registry and no second CI record beside the
mailbox. Worker-process liveness is not evidence. A missing, unreadable, or
stale mailbox does not establish **Working**. Another conversation's CI on the
same repository does not change this session. A child-owned mailbox is not this
conversation's claim. Do not start a worker or poll the CI provider from the
dashboard. Do not treat a parent transcript that lacks `turn_ended` as pending
work. Do not implement timer leases or mark **Working** from a wall-clock
deadline. Do not change **Ready for review** to mean wrap-up is unfinished.

## Existing solutions and decisive premises

PFE: extend the Cursor host held-session classifier
(`dashboard/server/hosts/cursor/sessions.ts` → `observeHeldCursorSession`) the
same way unfinished belonging subagents already do
(`dashboard/server/hosts/cursor/unfinishedSubagents.ts`). Reuse the existing CI
mailbox as the sole CI evidence store:

- `mailboxRoot` / `DOUGH_CI_MAILBOX_ROOT` and `listMailboxDirectories` for
  discovery (`ci-mailbox-location.mjs`, `ci-mailbox-match.mjs`)
- `observerOwner`, `readOwnerClaim`, and `checkoutIdentity` for the conversation
  claim (`ci-observer-owner.mjs`, `ci-mailbox-location.mjs`)
- `readRevisionCoverage` and `freshPendingRevision` for freshness
  (`ci-mailbox-revision-records.mjs`)

Do not treat `listOwnedMailboxes` / `isLiveMatchingMailbox` as the Working
criterion: those filter by repo/branch and worker liveness for observer reuse,
while this story matches the owner claim alone and forbids worker liveness as
evidence. Do not invent a parallel CI status store. ADR 0008 keeps
machine-local mailbox evidence as observation the dashboard may read; missing
or unreadable evidence must not invent Working. No temporary North Star topic
is warranted.

Settled in this preparation checkout
(`cursor/keep-a-cursor-session-working-while-its-ci-is-st` at announcement
revision `8d62e185`):

- Idle confirmed follow-up with only finished or absent belonging subagents
  observes `review`
  (`dashboard/tests/boundary/cursor-session-belonging-subagents.spec.ts`:
  `only turn_ended siblings keep review`, passed).
- A live stop-hint label observes `working` without needing transcripts (same
  file: `a live stop-hint label observes working without needing transcripts`,
  passed).
- Owner-matched discovery over staged mailboxes finds fresh pending coverage;
  a different conversation's or child-owned mailbox is a different claim;
  terminal and past-`pendingFreshnessMs` observations are not fresh (direct
  observation of `listMailboxDirectories` + `readOwnerClaim` +
  `freshPendingRevision` / `registerPushedRevision` /
  `publishRevisionRecord` in this checkout; `pendingFreshnessMs` is 120000).
- `npm install` was required once in this checkout so the boundary suite could
  run; `node_modules/` stays untracked.

## Ordered slices

### 1. Idle follow-up stays Working while this conversation owns fresh CI
Type: Behavior
Status: planned
Proof: Boundary tests beside
`dashboard/tests/boundary/cursor-session-belonging-subagents.spec.ts` that call
`observeHeldCursorSession` with a confirmed follow-up held session and a
temporary mailbox storage root (injectable like `home` for subagents;
production keeps `mailboxRoot`). Stage an owner claim for
`observerOwner({ root: continuation.workspace, host: "cursor", session:
sessionId, child: "" })` and a fresh pending revision: activity is `working`
and does not count as needing review. After that revision is `success` or
`failure`, or when the pending observation is older than the freshness window,
or when the mailbox is missing/unreadable, or when only another conversation's
or a child-owned mailbox has pending coverage, or when only a live worker
identity remains with every owned revision terminal: activity is `review`.
Unfinished belonging subagents still map to `working`. A live stop-hint label
stays `working` without reading the mailbox. Prefer the ordinary focused
Playwright selection for that boundary file; do not start a worker or call the
CI provider from the dashboard path under test.

Behavior: Pre-condition — held Cursor session at the follow-up prompt after a
confirmed first instruction (or already showing the live stop hint).
Trigger — dashboard classifies the held session.
Postcondition — the session reads Working while this conversation's mailbox
owner claim still has a fresh pending CI revision; otherwise the existing
idle/review and unfinished-subagent rules apply unchanged.

## Current decisions

Preparation only: this plan grants no Take or execution. Story Branch Mode will
reuse this owned workspace and branch when execution is separately authorized.
Coordinator owns formatting, hooks, commits, publication, and closure during
execution. CI Working evidence is a read of the existing mailbox only. Inject
mailbox storage for tests; production uses the shared observer directory.

## Story obligations

## Plan concern review

Refinement was not needed: one outside-in outcome, existing mailbox and
subagent adapter patterns reused, and decisive premises settled by observation
in this checkout. No remaining slice-specific concern or human-owned decision
was identified.
