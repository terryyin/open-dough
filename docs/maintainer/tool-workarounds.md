# Tool workarounds

Keep one entry per active workaround under
[ADR 0005](../adrs/0005-cross-tool-validation-accepted.md#6-recheck-tool-specific-workarounds).
Record the observed tool and revision, Distribution location and introducing
revision, first release tag when known, reproduction, retirement criteria, and
latest review. Each review records its date, tested revisions, evidence,
decision (keep, simplify, retire, or inconclusive), and next review trigger.
Use Git for earlier reviews and retired entries.

## Codex wakes during supplier watches, proofs, and CI completion

- **Symptom.** Early returns during a quiet supplier watch prompted excess model
  requests on Codex CLI `0.171.0`, Code Mode enabled, `gpt-6.2-sol` at high effort.
- **Distribution patch.** The [Codex example under Watch a paused supplier](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#watch-a-paused-supplier)
  makes the five-minute waits explicit. Introduced in
  [`5bbbc506a`](https://github.com/terryyin/open-dough/commit/5bbbc506a3a6d9b1b3ef1352df6d122c8c6710d5).
  First release tag pending.
- **Proof and CI waits.** The [shared foreground wait](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#codex-foreground-waits)
  keeps shell polls inside one Code Mode cell and resumes that cell if it
  yields. Introduced in `bc3d8b734`, released in `v0.3.107`. In the
  [matched Codex 0.170.0 trace](https://github.com/terryyin/open-dough/blob/bc3d8b7344c74f055707fc49e6877927356d1017/.planning/slice-plans/698-let-a-long-codex-wait-run-without-model-requests/PLAN.md#slice-1-measured-wait-window),
  a 275-second proof went from five intermediate requests to zero. Rerun a
  quiet proof and a CI completion that crosses a wait boundary through the
  native path. Verify the original exit status or CI receipt, unchanged
  deadline, and comparable or fewer wait-only requests.
- **Reproduce.** Pin the Distribution payload in an isolated native Codex
  session with a local bare Git remote. Remove the supplier-specific Codex
  example and its wait instructions, restoring the generic long-proof route.
  In one run, wait about nine minutes, push a provisional change, then push the
  qualifying change after the provisional receipt and before the next watch.
  In another, keep the remote unchanged through a deadline just over five
  minutes away. Save the rollout and independent push timestamps. Use the
  [native check procedure](../../Distribution/evaluation/guidance-checks.md#redo-the-source-phase-for-an-uncovered-finding)
  and the [SEED-431 comparison](https://github.com/terryyin/open-dough/blob/44c865eeb3a18ae7a91a0d49e08f1f680984e9e4/.planning/slice-plans/809-reduce-codex-wakes-during-supplier-watches/PLAN.md#first-matched-comparison).
- **Retire when.** Each unchanged interval has at most one watch-only model
  request per started five minutes, with at least 90% cached input if there are
  any. Exclude the initial launch and receipt judgment. Treat ambiguous
  attribution that could change the verdict as inconclusive. The provisional
  publication keeps the hold, the retry keeps the same remote, refs, and
  absolute deadline, and the qualifying publication resumes work once. Expiry
  preserves partial work and records the resume condition.
- **Last review.** 2026-11-24, keep. On the profile above, the observed counts
  went from 10 to 1 for publication and from 5 to 1 for expiry. The comparison
  used prepatch `faddac224a` and the revised guidance in `5bbbc506a`.
  Recheck after a Codex release affecting command or cell waits, or in a
  periodic review once a newer Codex build is available.

## Codex yielded CI notification bridge

- **Patch and basis.** The [Codex adapter](../../Distribution/src/skills/dough-execute-plan/references/ci-notify-codex.md)
  relays CI events inside a yielded cell with `notify` and carries exact stream
  ownership into delivery. The adapter was present at `b2a046135` (`v0.3.3`),
  with the retained coordinator and directory added in `8d2bbee8b` (`v0.3.58`).
  Codex documents that finishing a background hook does not start a new turn.
  [Background hook behavior](https://learn.chatgpt.com/docs/hooks#how-background-hooks-run)
- **Recheck.** While a coordinator works, release a CI failure for its accepted
  revision. Evaluate any native callback for correct recipient, one delivery
  at a safe boundary, and continued accounting for unread events. Retire the
  cell and manual handles if that route preserves those behaviors.
- **Last review.** 2026-11-25, keep pending native evidence. Static review
  against Codex `0.172.0`. Recheck when Codex changes background notifications.

## Claude Code subagent identity in CI commands

- **Patch and basis.** The [CI adapter](../../Distribution/src/skills/dough-execute-plan/references/ci-notify-hosts.md)
  uses explicit `--session-json` with the session and agent IDs when the
  observer belongs to a subagent. `CLAUDE_CODE_SESSION_ID` supplies only the
  session. The current instruction dates to `80ab062fb` (`v0.3.59`).
  [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- **Recheck.** Arm a subagent-owned observer and run delivery, resume, and
  finish through the agent's own tool. Simplify when the command can obtain
  the hook's exact owner directly and a sibling cannot claim its events.
- **Last review.** 2026-11-25, keep. Static review against Claude Code
  `2.1.332`. Recheck when shell or hook identity fields change.

## Cursor exit-file proof wait

- **Patch and basis.** The [blocking shell loop](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#by-host)
  waits for the exit file or deadline. Introduced in `9dba5f5bc` (`v0.3.101`).
  Cursor describes background completion wakeups and `AwaitShell` on a
  Cursor surface. [Cursor's explanation](https://forum.cursor.com/t/foreground-shell-commands-trigger-an-automatic-extra-agent-request-after-the-main-turn-finishes/172103)
- **Recheck.** Run the normal proof workflow with a command that crosses the
  foreground window and exits nonzero, then a command that reaches the
  deadline. Assess whether native waiting delivers the real result once,
  honors the deadline, and avoids needless model wakes.
- **Last review.** 2026-11-25, inconclusive for Cursor CLI
  `2026.11.22-e9042b2`. Static evidence only. Recheck in
  [SEED-440](../../.planning/seeds/SEED-440-recheck-cursor-workarounds.md#recheck-cursor-workarounds).

## Cursor generation identity for CI delivery

- **Patch and basis.** The [CI hook](../../Distribution/src/skills/dough-execute-plan/scripts/ci-host-hook.mjs#L54)
  bridges from a Shell command that supplies the conversation but lacks the
  hook generation. It adopts the real generation at the owning hook boundary.
  Introduced in `c02158fc3` (`v0.3.57`). Cursor `2026.10.19-6bbf2c4` verified
  ownership and registration. [ODF-154](findings/ODF-154.md#odf-154)
- **Recheck.** Compare the identifiers exposed to Shell and hooks for a parent
  and child, including across a new prompt. Remove the temporary generation if
  a common native identity delivers the failure once to the correct agent.
- **Last review.** 2026-11-25, keep pending the native check in SEED-440.

## Cursor importing Claude Code hooks

- **Patch and basis.** The Claude adapters skip Cursor payloads marked with
  `cursor_version` in the [CI hook](../../Distribution/src/skills/dough-execute-plan/scripts/ci-host-hook.mjs),
  [backlog guard](../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-guard-hook.mjs),
  and [slice-clock hook](../../Distribution/src/skills/dough-execute-plan/scripts/slice-clock-hook.mjs).
  Relevant revisions are `b2a046135`, `49e8e2416`, and `67672cc03`. Cursor
  documents third-party hook imports enabled by default.
  [Cursor's hook import behavior](https://prod.cursor.com/docs/reference/third-party-hooks)
- **Recheck.** Install both sets of hooks with imports enabled. Observe which
  handlers receive each event and which can produce effects. Simplify when
  native dispatch or a scoped configuration ensures one effective handler
  for each intended action.
- **Last review.** 2026-11-25, keep pending the native check in SEED-440.

## Cursor tool hook with an empty working directory

- **Patch and basis.** The [slice-clock hook](../../Distribution/src/skills/dough-execute-plan/scripts/slice-clock-hook.mjs)
  falls back to `workspace_roots[0]` when `cwd` is empty. Introduced in
  `67672cc03` (`v0.3.103`). A subagent tool call on Cursor
  `2026.11.13-eacade1` showed this input.
  [Native observation](https://github.com/terryyin/open-dough/blob/67672cc03b28bc6aaf4c127b1e39cf7327737e2d/.planning/slice-plans/667-count-slice-active-time-deterministically/PLAN.md)
- **Recheck.** Capture the hook input from the coordinator and a subagent in
  a linked worktree. Drop the fallback when the native event reliably identifies
  the command's own checkout, including with multiple workspace roots.
- **Last review.** 2026-11-25, keep pending the native check in SEED-440.
