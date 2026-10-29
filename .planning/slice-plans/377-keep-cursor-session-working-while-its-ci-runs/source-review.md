# Source review — SEED-175#keep-cursor-session-working-while-its-ci-runs

## Launch and input

Fresh general-purpose reviewer with no conversation inheritance. Inputs were
only the selected story section Goal, Scope, Scope limits, and Key examples
from
`.planning/seeds/SEED-175-cursor-session-working-during-owned-ci.md#keep-cursor-session-working-while-its-ci-runs`.
No plan, return, product, proof, or current-slice scope was supplied. The
reviewer was instructed to read no other project files and change nothing.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | While that Cursor conversation still owns a fresh non-terminal CI revision, the session reads **Working**. | slice 1 | observed: `cursor-session-owned-pending-ci.spec.ts` `owner-matched fresh pending revision observes working` → activity `working` |
| 2 | While that same condition holds, the session does not ask for review. | slice 1 | observed: same assertion expects activity `working` (not `review`) |
| 3 | Once that CI is terminal and the composer is idle, the session reads **Ready for review** again. | slice 1 | observed: `owned revision success observes review` and `owned revision failure observes review` |
| 4 | In the follow-up-prompt reading, after a confirmed first instruction, ask whether this conversation still owns fresh open background work. | slice 1 | observed: `sessions.ts` follow-up + `firstInput.state === "confirmed"` path calls `hasOwnedFreshPendingCi` |
| 5 | Answer that question for CI only (not for other kinds of background work beyond what is already kept). | slice 1 | observed: new path only consults mailbox via `ownedPendingCi.ts`; unfinished-subagent path unchanged |
| 6 | Read the mailbox the worker has already written (do not invent another write path for this answer). | slice 1 | observed: `ownedPendingCi.ts` uses `listMailboxDirectories` / `readOwnerClaim` / `readRevisionCoverage` / `freshPendingRevision` |
| 7.1 | An idle composer stays **Working** when mailbox owner claim is this repository. | slice 1 | observed: `observerOwner({ root: workspace, ... })` match in `ownedPendingCi.ts`; owner-matched fresh pending → `working` |
| 7.2 | An idle composer stays **Working** when mailbox owner claim is host `cursor`. | slice 1 | observed: `observerOwner({ ..., host: "cursor", ... })` in `ownedPendingCi.ts` |
| 7.3 | An idle composer stays **Working** when mailbox owner claim is this conversation. | slice 1 | observed: owner uses `session: sessionId` and `child: ""`; other-conversation / child-owned cases stay `review` |
| 7.4 | An idle composer stays **Working** when `freshPendingRevision` still reports a pending attempt or queue observation inside its freshness window. | slice 1 | observed: `freshPendingRevision(revision, now)` gate; stale pending → `review` |
| 8 | Keep the existing unfinished-subagent reading. | slice 1 | observed: `unfinished belonging subagents still observe working` and belonging-subagents regression suite |
| 9 | A screen that already shows the live stop hint stays **Working** without consulting the mailbox. | slice 1 | observed: `a live stop-hint label observes working without reading the mailbox` (working label returns before mailbox; conflicting other-session pending staged) |
| 10 | “Fresh open background work” for this story’s CI answer is evidenced only from the worker-written mailbox and `freshPendingRevision` freshness, not from process liveness or wall-clock deadlines. | slice 1 | observed: adapter ignores worker identity; live-worker + terminal revisions → `review`; no deadline path |
| 11 | Owner claim for CI Working is the conjunction of repository + host `cursor` + this conversation (see 7.1–7.3). | slice 1 | observed: `observerOwner` + exact `claim !== owner` continue in `ownedPendingCi.ts` |
| 12 | Pending coverage may be either a pending attempt or a queue observation, provided it is inside the freshness window (see 7.4). | slice 1 | observed: `freshPendingRevision` on `readRevisionCoverage` entries (mailbox pending/queue coverage already modeled there) |
| 13 | After owned CI is terminal, an idle composer stays **Ready for review** even when the plan says execution is complete and awaiting wrap-up — **Ready for review** is not redefined to mean wrap-up is unfinished. | slice 1 | observed: terminal success/failure → `review`; classifier does not read plan wrap-up state |
| 14 | Do not add a registry the agent writes. | slice 1 | observed: no new agent-written registry; only mailbox reads |
| 15 | Do not copy CI into a second record beside the mailbox. | slice 1 | observed: sole store remains skill mailbox scripts |
| 16 | A live worker process is not evidence of **Working**. | slice 1 | observed: `live worker identity with terminal owned revisions observes review` |
| 17 | A missing mailbox does not establish **Working**. | slice 1 | observed: `missing mailbox storage observes review` |
| 18 | An unreadable mailbox does not establish **Working**. | slice 1 | observed: `unreadable mailbox storage observes review` |
| 19 | A stale mailbox (pending observation older than the freshness window) does not establish **Working**. | slice 1 | observed: `pending observation older than freshness window observes review` |
| 20 | Another conversation’s CI on the same repository does not change this session. | slice 1 | observed: `another conversation's pending mailbox observes review` |
| 21 | A child-owned mailbox is not this conversation’s claim. | slice 1 | observed: `child-owned pending mailbox observes review` |
| 22 | Do not start a worker from the dashboard. | slice 1 | observed: classifier only reads mailbox directories; no worker start |
| 23 | Do not poll the CI provider from the dashboard. | slice 1 | observed: no CI provider client in owned-pending path |
| 24 | Do not treat a parent transcript that lacks `turn_ended` as pending work. | slice 1 | observed: CI path does not read parent transcripts; unfinished-subagent rule unchanged |
| 25 | Do not implement timer leases. | slice 1 | observed: no timer-lease module or Working path from leases |
| 26 | Do not mark a session **Working** from a wall-clock deadline. | slice 1 | observed: Working for CI only via `freshPendingRevision` on mailbox coverage |
| 27 | Do not change **Ready for review** to mean wrap-up is unfinished. | slice 1 | observed: same as 13 — terminal idle → `review` without wrap-up reinterpretation |
| 28 | Example 1 — Working: follow-up, owned mailbox, pending fresh coverage → **Working**, not needing review. | slice 1 | observed: `owner-matched fresh pending revision observes working` |
| 29 | Example 2 — Ready after terminal CI: same session after `success` or `failure`, idle → **Ready for review**. | slice 1 | observed: `owned revision success/failure observes review` |
| 30 | Example 3 — Ready when mailbox missing, unreadable, or stale → **Ready for review**. | slice 1 | observed: missing / unreadable / stale tests → `review` |
| 31 | Example 4 — Ready despite live worker with every owned revision terminal → **Ready for review**. | slice 1 | observed: `live worker identity with terminal owned revisions observes review` |
| 32 | Example 5 — Other conversation’s pending CI → this idle session **Ready for review**. | slice 1 | observed: `another conversation's pending mailbox observes review` |
| 33 | Example 6 — IBKR deadline alone does not make **Working**. | slice 1 | observed: no deadline/timer Working path; idle without owned fresh pending stays `review` |
