# A Cursor launch or recover wait ends within a bound with a clear message

**Identity:** SEED-129#bounded-cursor-launch-wait
**Source:** [refined story](../../seeds/SEED-129-bounded-cursor-launch-wait.md#bounded-cursor-launch-wait).
**Prepared:** 2026-10-10, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/a-cursor-launch-or-recover-wait-ends-within-a-bo`
on `cursor/a-cursor-launch-or-recover-wait-ends-within-a-bo`, under the
preparation assignment for `YeongSheng-chan`. Publication target: `origin/main`;
integration checkout: `/Users/terryyin/git/open-dough`.

## Goal and boundaries

When Cursor stays alive but never shows that it took the launch or recovery
instruction, Start or Recover answers within the shared launch wait bound with
a clear unconfirmed-delivery message and next step, instead of waiting
indefinitely or treating an expired keep wait as an ordinary successful launch.
A Cursor that answers in ordinary time starts or recovers exactly as today.

In scope, from the story: both Cursor keep waits on `LaunchInstruction`
(never-ready screen; paste chip submitted then silent); bound =
`DOUGH_LAUNCH_TIMEOUT_MS` (default 30s); Start expiry → `uncertain` /
`timed-out` (not `launched`); Recover expiry → `failed`; client left kept;
first-input state not invented or revoked.

Material exclusions, from the story: changing when paste-chip Enter confirms
first input; bounding non-Cursor hosts; a dashboard control to stop the
runner; new ADR work.

## Published baseline and integration context

Origin was fetched at `5fb3a20b` (`origin/main`). The highest plan directory
allocated on that history is `282-dashboard-suite-stable-under-load`;
`283-bounded-cursor-launch-wait` was free immediately before this write. This
workspace is at `5fb3a20b` with the uncommitted refined seed for this story.

No North Star topic governs the Cursor keep wait. Accepted ADR 0001
(ubiquitous language) keeps `uncertain` / `timed-out` / kept-session wording.
ADR 0008 remains Proposed and non-binding; launch stays local evidence. No
Accepted ADR conflicts. This plan adds no North Star topic.

## Existing solutions and selected approach

PFE for three responsibilities: the shared launch wait duration, Start's
answer when keep is still open at abort, and Recover's keep wait.

| Need | Finding |
| --- | --- |
| Shared launch wait duration | **Reuse** `launchTimeoutMs()` in `dashboard/server/launchRun.ts` (`DOUGH_LAUNCH_TIMEOUT_MS`, default 30_000). Export it (or move the same function to a tiny shared module next to it) so Recover reads one rule. Tests already set the env through `launchTimeoutMs` on the dashboard server. |
| Start answer when keep expires | **Change** `dashboard/server/hosts/cursor/launch.ts`. It already races `keepCursorClient` against `untilAbort(signal)`. When the abort wins, the `"aborted"` branch falls through to `{ kind: "launched" }`. Return the existing `timedOut(session)` path instead, with explanation text specialized to instruction delivery when a session id exists (kept session + continue via resume / terminal). Do not hang up the client. |
| Recover keep wait | **Change** `dashboard/server/hosts/cursor/recover.ts` (and only as needed `keepCursorClient` / `postJson` if a signal is the cleanest race). Race the keep against the same launch-wait duration; on expiry answer `failed` with the same class of explanation. Leave the client kept. |
| Outside-in proof for Start | **Change** `dashboard/tests/agent-terminal-cursor-launch.spec.ts` and, if needed, `dashboard/tests/fixtures/fake-cursor` / `support/fakeCursor.ts`. The existing "launch wait abort…" case already uses `paintDelayMs: 3_000` with `launchTimeoutMs: 1_500` and proves the client stays and later acceptance; it does not yet assert the launch body. Extend it for `uncertain` / `timed-out`, and add a paste-chip silent path (fixture must not repaint after paste Enter). |
| Outside-in proof for Recover | **Change** `dashboard/tests/cursor-session-recovery.spec.ts` (same Cursor start support). Use a short `launchTimeoutMs` and a delayed or silent attach so Recover's keep cannot settle before the bound; assert `failed` and that ordinary Recover still recovers. |

Common rule: when Cursor's keep has not settled when the shared launch wait
ends, answer the waiting Start or Recover with unconfirmed delivery; leave
the kept client and first-input record alone. Ordinary keep settlement is
unchanged.

## Current decisions

- One duration for Start and Recover: exported `launchTimeoutMs()` (same env
  and default as today). No second constant.
- Start expiry uses `kind: "uncertain"`, `reason: "timed-out"`. Recover expiry
  uses `kind: "failed"` (Recover has no uncertain shape).
- Expiry never sends hangup/SIGHUP to the Cursor client.
- Expiry does not rewrite `firstInput`. Paste-chip Enter may already have
  confirmed it; never-ready leaves it uncertain.
- Wording stays in the existing timed-out family, specialized to instruction
  delivery when a session exists (kept + how to continue). Exact sentence is
  owned by the Start slice and reused by Recover's failed explanation.
- Hosted CI remains the post-publish gate; local proof is the focused Cursor
  launch and recover specs named in the slices.

## Decisive premises and observations

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Start abort while keep is open returns `launched` | Slice 1 | Read `dashboard/server/hosts/cursor/launch.ts` lines 178–200: `Promise.race` with `"aborted"` skips the failure branch and returns `launched`. | Confirmed |
| `timedOut(session)` already returns `uncertain` / `timed-out` with a kept-session continue sentence | Slice 1 | Same file, `timedOut` at lines 64–74. | Confirmed |
| Shared launch wait is `DOUGH_LAUNCH_TIMEOUT_MS` default 30s on `attemptRun` | Slices 1–2 | Read `dashboard/server/launchRun.ts` lines 30–37 and 82–84. | Confirmed |
| Existing abort journey leaves the client and allows later acceptance | Slice 1 proof | Read `dashboard/tests/agent-terminal-cursor-launch.spec.ts` lines 206–230: `paintDelayMs: 3_000`, `launchTimeoutMs: 1_500`; asserts uncertain then confirmed after paint; does not assert launch body. | Confirmed; body assertion is the slice gap |
| Fake-cursor repaints after paste Enter, so it cannot stay silent after chip submit today | Slice 1 paste proof | Read `dashboard/tests/fixtures/fake-cursor` lines 227–234: after pending paste + Enter it calls `paint()`. | Confirmed; slice 1 adds a hold-after-paste fixture control |
| Recover awaits keep with no deadline | Slice 2 | Read `dashboard/server/hosts/cursor/recover.ts` (`keepCursorClient` with no signal) and `runnerClient.ts` `postJson` for `/keep` (no request timeout; sessions GET has 2s). | Confirmed |
| Ordinary Recover proof entry exists | Slice 2 regression | `dashboard/tests/cursor-session-recovery.spec.ts` "Recover on the idle composer with confirmed first input…". | Confirmed |

## Ordered slices

### 1. Start keep-wait expiry answers uncertain timed-out
Type: Behavior
Status: done
Proof: Accepted. Command: `env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-terminal-cursor-launch.spec.ts dashboard/tests/agent-terminal-cursor-launch-wait.spec.ts` (pass, 18 tests). Wait-expiry observations live in `agent-terminal-cursor-launch-wait.spec.ts` (dev/preview): (a) delayed paint with launch wait shorter than paint — body `uncertain`/`timed-out` with instruction-delivery explanation, client running, first input uncertain at return, later paint confirms; (b) paste chip submitted then held silent (`holdAfterPaste`) — same timed-out body, first input remains confirmed, client running. Ordinary ready launch in `agent-terminal-cursor-launch.spec.ts` still returns `launched`. Product: `launch.ts` abort → `timedOut(session)`; `launchTimeoutMs()` exported from `launchRun.ts`.

Behavior: Cursor keep has not settled (never ready, or paste chip submitted then silent) and the shared launch wait ends → Start answers `uncertain` / `timed-out` naming unconfirmed instruction delivery and how to continue; the client stays kept; first-input state is unchanged; a Cursor that settles before the bound still launches as today.

### 2. Recover keep-wait expiry answers failed within the same bound
Type: Behavior
Status: planned
Proof: Focused case in `dashboard/tests/cursor-session-recovery.spec.ts` with a short `launchTimeoutMs` and an attach that cannot settle keep before that bound — Recover answers `failed` with the same class of explanation within the bound; runner still holds the client when applicable. Existing idle-composer Recover case still recovers and types one continuation. Command: focused Playwright for that recover spec (same pattern as existing recover proofs).

Behavior: Developer Recover on a Cursor session whose keep has not settled when the shared launch wait ends → Recover answers `failed` with the unconfirmed-delivery explanation; the client is not hung up; a Recover whose keep settles in ordinary time still returns `recovered` as today.

## Learnings

- Ordinary Cursor launch proofs that shortened `launchTimeoutMs` below keep settle time were accidentally green under the old abort→`launched` bug; with correct timed-out abort they need a settle-capable wait (or no override).
- Quiet reporter treats Node `FORCE_COLOR`/`NO_COLOR` warnings as stray PRINTED output (non-zero exit); run focused dashboard Playwright with those env vars unset.
