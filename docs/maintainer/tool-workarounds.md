# Tool workarounds

Keep one entry per active workaround under
[ADR 0005](../adrs/0005-cross-tool-validation-accepted.md#6-recheck-tool-specific-workarounds).
Record the observed tool and revision, Distribution location and introducing
revision, first release tag when known, reproduction, retirement criteria, and
latest review. Each review records its date, tested revisions, evidence,
decision (keep, simplify, retire, or inconclusive), and next review trigger.
Use Git for earlier reviews and retired entries.

## Review order

1. **Right problem.** Trace the observed failure to its cause. Check whether
   it comes from the tool, the Distribution, or unnecessary work the workflow
   asks the agent to do. Identify what would prevent it at its source.
2. **Still necessary.** Exercise the real workflow on the current tool with a
   pinned payload and the workaround disabled. Record the build, surface, and
   outcome. Treat missing evidence as inconclusive.
3. **Right solution.** If the problem persists, compare the workaround with the
   simplest viable approach. Check that it preserves the outcome before
   keeping, simplifying, or retiring the workaround.

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
- **2026-11-25 review.** **Right problem:** an outer tool return can wake the
  model while the same command is still running. **Still necessary:** in the
  current Codex session a quiet 28-second command stayed live after a default
  cell wait returned at 11 seconds. The next explicit wait received the
  original exit status. This establishes the early return, with supplier and
  CI retirement verdicts still pending. **Right solution:** keep the longer
  same-cell wait for now. Check whether the shared recipe alone meets the
  supplier limits before carrying a supplier-specific copy forward.

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
- **Last review.** 2026-11-25. **Right problem:** a failure must reach its
  coordinator during ongoing work so it can act at a safe boundary.
  **Still necessary:** the shipped bridge passed its controlled checks. The
  ability of a native hook to deliver equivalent events in this workflow is
  unverified. **Right solution:** keep the bridge pending that comparison.
  Test native hook delivery against the same failure, recipient, and unread
  event behavior before carrying forward the cell and manual handles. Static
  host review used Codex `0.172.0`.

## Claude Code subagent identity in CI commands

- **Patch and basis.** The [CI adapter](../../Distribution/src/skills/dough-execute-plan/references/ci-notify-hosts.md)
  uses explicit `--session-json` with the session and agent IDs when the
  observer belongs to a subagent. `CLAUDE_CODE_SESSION_ID` supplies only the
  session. The current instruction dates to `80ab062fb` (`v0.3.59`).
  [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- **Recheck.** Arm a subagent-owned observer and run delivery, resume, and
  finish through the agent's own tool. Simplify when the command can obtain
  the hook's exact owner directly and a sibling cannot claim its events.
- **Last review.** 2026-11-25, inconclusive. **Right problem:** event ownership
  matters if a subagent actually owns the observer. First identify a supported
  workflow that needs that ownership. **Still necessary:** Claude Code
  `2.1.332` documentation distinguishes the shell session ID from the hook's
  agent ID. The controlled check supplies both IDs itself. Native access to
  the agent ID in the workflow remains unverified. **Right solution:** if
  supported work always assigns observers to the top-level coordinator, review
  whether the special case can go. Otherwise compare automatic identity
  transfer with explicit JSON. [ODF-232](findings/ODF-232.md#odf-232)

## Cursor exit-file proof wait

- **Patch and basis.** The [blocking shell loop](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#by-host)
  waits for the exit file or deadline. Introduced in `9dba5f5bc` (`v0.3.101`).
  Cursor describes background completion wakeups and `AwaitShell` on a
  Cursor surface. [Cursor's explanation](https://forum.cursor.com/t/foreground-shell-commands-trigger-an-automatic-extra-agent-request-after-the-main-turn-finishes/172103)
- **Right problem.** Proof commands that outlive the Shell foreground window
  needed a durable wait for the real exit status or a caller deadline; Cursor
  historically lacked a reliable completion handback for background shells.
- **Still necessary.** No on this recorded surface. With the exit-file loop
  temporarily disabled and no hidden substitute, native `AwaitShell` delivered
  a real nonzero exit once within the deadline without needless model wakes,
  and returned a usable still-running observation when the wait budget ended
  before the command finished.
- **Right solution.** Prefer native `AwaitShell` (or foreground Shell when it
  fits) on Cursor agent surfaces that expose it. The until/sleep/exit-file
  polling loop is no longer the required wait on this build.
- **Evidence.** Build: agent CLI `2026.11.22-e9042b2`; Cursor IDE `3.31.15`
  (`3eb8c133…`, arm64). Surface: Cursor agent with Shell + AwaitShell (Task
  subagent). Payload / HEAD: `76e8e0651496d17394f1f8fe4ae5b12797234599`.
  Disable method: temporary edit of the Cursor bullet in
  `.claude/skills/dough-execute-plan/references/wait-for-proof.md#by-host`
  (reverted after the check). Receipts under the worktree evidence dir:
  `slice1-meta.txt`, `slice1-awaitshell-receipts.txt`,
  `slice1-nonzero-terminal.txt`, `slice1-nonzero.exit` (`42`),
  `slice1-deadline-terminal.txt` (still running after ~27s wait budget).
- **Disposition.** retire. Product follow-up queued:
  [SEED-441#retire-cursor-exit-file-proof-wait](../../.planning/seeds/SEED-441-retire-cursor-exit-file-proof-wait.md#retire-cursor-exit-file-proof-wait)
  (this story does not patch Distribution guidance).
- **Next review trigger.** Cursor agent or AwaitShell regression that drops
  durable background wait / exit delivery; otherwise the next scheduled
  maintainer workaround recheck.
- **Last review.** 2026-11-25, retire for Cursor agent + AwaitShell on CLI
  `2026.11.22-e9042b2` / IDE `3.31.15`. Native evidence in SEED-440 slice 1.
  [SEED-440](../../.planning/seeds/SEED-440-recheck-cursor-workarounds.md#recheck-cursor-workarounds).

## Cursor generation identity for CI delivery

- **Patch and basis.** The [CI hook](../../Distribution/src/skills/dough-execute-plan/scripts/ci-host-hook.mjs#L54)
  bridges from a Shell command that supplies the conversation but lacks the
  hook generation. It adopts the real generation at the owning hook boundary.
  Introduced in `c02158fc3` (`v0.3.57`). Cursor `2026.10.19-6bbf2c4` verified
  ownership and registration. [ODF-154](findings/ODF-154.md#odf-154)
- **Right problem.** Yes. Managed CI delivery runs from Shell, which exposes
  conversation identity but not the hook `generation_id` the Cursor adapter
  requires to bind a failure once to the owning agent.
- **Still necessary.** Yes on this recorded surface. Disabling the
  managed-generation adopt path leaves `recorded=managed-delivery` and gates
  out the owning real hook (missed delivery). The coordinator owner's
  generation file records a `generation_id` distinct from its
  `conversation_id`, so Shell `CURSOR_CONVERSATION_ID` is not a native
  substitute for hook generation. Child Shell still has no `generation_id`
  env field; `CURSOR_REQUEST_ID` differs from hook `generation_id` and must
  not be used as a substitute. A beforeSubmitPrompt / new-prompt boundary was
  not exercised in this child Task (gap noted; does not overturn keep).
- **Right solution.** Keep the temporary `managed-delivery` placeholder and
  adopt-at-owning-hook bridge. No retire or simplify product change from this
  review.
- **Evidence.** Build: agent CLI `2026.11.22-e9042b2`; Cursor IDE `3.31.15`
  (`3eb8c133…`, arm64). Surface: Cursor agent with Shell + hooks (Task child;
  coordinator parent via transcript path and mailbox generation file).
  Payload / HEAD: `abb6d3de8d3b202a54a219953638f0af76fecfae`. Diagnostic
  wrapper on the loaded `.agents` `ci-host-hook.mjs` (reverted). Receipts
  under the worktree evidence dir: `slice2-shell-identity-summary.txt`,
  `slice2-hook-live-captures.jsonl`, `slice2-parent-generation-divergence.txt`,
  `slice2-still-necessary-gate.json`, `slice2-owner-compare.json`,
  `slice2-full-report.md`.
- **Disposition.** keep (no follow-up product change).
- **Next review trigger.** Cursor exposes a Shell-visible generation identity
  equal to hook `generation_id` across parent, child, and new prompts; or a
  maintainer recheck that captures a beforeSubmitPrompt generation change and
  a live parent hook payload.
- **Last review.** 2026-11-25, keep for Cursor agent + hooks on CLI
  `2026.11.22-e9042b2` / IDE `3.31.15`. Native evidence in SEED-440 slice 2.
  [SEED-440](../../.planning/seeds/SEED-440-recheck-cursor-workarounds.md#recheck-cursor-workarounds).

## Cursor importing Claude Code hooks

- **Patch and basis.** The Claude adapters skip Cursor payloads marked with
  `cursor_version` in the [CI hook](../../Distribution/src/skills/dough-execute-plan/scripts/ci-host-hook.mjs),
  [backlog guard](../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-guard-hook.mjs),
  and [slice-clock hook](../../Distribution/src/skills/dough-execute-plan/scripts/slice-clock-hook.mjs).
  Relevant revisions are `b2a046135`, `49e8e2416`, and `67672cc03`. Cursor
  documents third-party hook imports enabled by default.
  [Cursor's hook import behavior](https://prod.cursor.com/docs/reference/third-party-hooks)
- **Right problem.** Yes. With both hook sets installed, Cursor runs matching
  hooks from every source (project `.cursor/hooks.json` and imported
  `.claude/settings.json`). Claude-path adapters therefore receive the same
  Cursor events that carry `cursor_version`, so without a guard both native and
  imported adapters can act on one intended action.
- **Still necessary.** Yes on this recorded surface. Live `postToolUse` for
  Shell invoked both Cursor-native (`host=cursor` via `.agents` scripts) and
  Claude-import (`host=claude` via `.claude` scripts) adapters on the same
  payload with `cursor_version=2026.11.22-e9042b2`. With the skip enabled, the
  Claude path no-ops. With the skip temporarily disabled (and a forced
  dual-effect probe for the slice-clock intended action), both adapters emitted
  non-empty additional context and both effects were delivered into the agent
  turn. Native dispatch does not ensure one effective handler.
- **Right solution.** Keep the `cursor_version` skip on Claude adapters so only
  the native Cursor adapter produces effects for Cursor sessions. No simpler
  native single-handler guard was observed; scoped uninstall of one hook set
  would drop a supported host. No retire or simplify product change from this
  review.
- **Evidence.** Build: agent CLI `2026.11.22-e9042b2`; Cursor IDE `3.31.15`
  (`3eb8c133…`, arm64). Surface: Cursor agent with hooks (this Task). Payload /
  HEAD: `2579a9abfbb587292997850266c3152d69642d3f`. Install: project
  `.cursor/hooks.json` and `.claude/settings.json` both present; third-party
  imports documented as default-on
  ([third-party hooks](https://cursor.com/docs/reference/third-party-hooks):
  "All matching hooks from every source run"). Disable method: temporary
  instrumentation and skip disable in loaded `.agents` / `.claude` hook copies
  (reverted). Receipts under the worktree evidence dir:
  `slice3-install-state.txt`, `slice3-receipts-skip-on.jsonl`,
  `slice3-effects-skip-on.jsonl`, `slice3-receipts-skip-off.jsonl`,
  `slice3-effects-skip-off.jsonl`, `slice3-dual-system-reminder.txt`,
  `slice3-full-report.md`.
- **Disposition.** keep (no follow-up product change).
- **Next review trigger.** Cursor documents or exposes a native single-handler
  dispatch / scoped import that prevents Claude-path hooks from running on
  Cursor payloads; or a maintainer recheck after a third-party-hooks behavior
  change.
- **Last review.** 2026-11-25, keep for Cursor agent + dual hook sets on CLI
  `2026.11.22-e9042b2` / IDE `3.31.15`. Native evidence in SEED-440 slice 3.
  [SEED-440](../../.planning/seeds/SEED-440-recheck-cursor-workarounds.md#recheck-cursor-workarounds).

## Cursor tool hook with an empty working directory

- **Patch and basis.** The [slice-clock hook](../../Distribution/src/skills/dough-execute-plan/scripts/slice-clock-hook.mjs)
  falls back to `workspace_roots[0]` when `cwd` is empty. Introduced in
  `67672cc03` (`v0.3.103`). A subagent tool call on Cursor
  `2026.11.13-eacade1` showed this input.
  [Native observation](https://github.com/terryyin/open-dough/blob/67672cc03b28bc6aaf4c127b1e39cf7327737e2d/.planning/slice-plans/667-count-slice-active-time-deterministically/PLAN.md)
- **Right problem.** Yes. Cursor `postToolUse` often delivers an empty `cwd`
  (Shell default) or omits `cwd` (Read/Grep) while naming the workspace in
  `workspace_roots`. Without a fallback, the slice-clock hook cannot take the
  checkout from the native event and would rely on the loaded script's
  `checkoutRoot`, which is not the command's declared working identity.
- **Still necessary.** Yes on this recorded surface. Live Task-subagent
  `postToolUse` in the linked worktree showed Shell `cwd: ""` with
  `workspace_roots[0]` equal to the worktree; Read/Grep omitted `cwd` with the
  same roots. Explicit Shell `working_directory` fills top-level `cwd` (including
  to `/tmp`), so filled `cwd` is the tool working directory, not a reliable
  checkout id. Temporarily disabling `workspace_roots[0]` (leaving
  `cwd || checkoutRoot` only, no hidden cwd filler) still left empty `cwd` on
  default Shell; native input alone does not identify the checkout. Multi-root
  was not available; in this single-root case `roots[0]` matched the worktree
  and would not mis-identify it, but empty `cwd` still requires the fallback.
  Live coordinator/parent hook stdin was not captured from this child Task
  (parent conversation inferred from the child transcript path only).
- **Right solution.** Keep `cwd || workspace_roots?.[0] || checkoutRoot`. No
  simpler native field reliably names the checkout when `cwd` is empty. No
  retire or simplify product change from this review.
- **Evidence.** Build: agent CLI `2026.11.22-e9042b2`; Cursor IDE `3.31.15`
  (`3eb8c133…`, arm64). Surface: Cursor agent with hooks (this Task =
  subagent in linked worktree). Payload / HEAD:
  `33244f7cf23c7fee46528315c4078c388acf735f`. Disable method: temporary
  removal of `workspace_roots[0]` in loaded `.agents` / `.claude`
  `slice-clock-hook.mjs` copies (reverted). Receipts under the worktree
  evidence dir: `slice4-hook-captures.jsonl`, `slice4-cwd-matrix.txt`,
  `slice4-still-necessary-verdict.json`, `slice4-fallback-probe-on.json`,
  `slice4-parent-coordinator-note.txt`, `slice4-multiroot-observation.txt`,
  `slice4-full-report.md`.
- **Disposition.** keep (no follow-up product change).
- **Next review trigger.** Cursor fills `cwd` with the project checkout on
  every tool hook (including default Shell and non-Shell tools) without
  requiring an explicit `working_directory`; or a maintainer recheck that
  captures live coordinator hook stdin and a multi-root workspace where
  `workspace_roots[0]` differs from the command checkout.
- **Last review.** 2026-11-25, keep for Cursor agent + hooks on CLI
  `2026.11.22-e9042b2` / IDE `3.31.15`. Native evidence in SEED-440 slice 4.
  [SEED-440](../../.planning/seeds/SEED-440-recheck-cursor-workarounds.md#recheck-cursor-workarounds).

## Cursor interrupted-delegation boundary (ODF-229)

- **Not a Distribution workaround entry.** Reviews whether any Cursor-specific
  cancellation or proof-return gap remains beyond the general
  [interrupted-delegation recovery](../../Distribution/src/skills/dough-execute-plan/references/interrupted-delegation.md)
  practice. Finding home: [ODF-229](findings/ODF-229.md#odf-229).
- **2026-11-25 boundary (SEED-440 slice 5).** Build: agent CLI
  `2026.11.22-e9042b2`; Cursor IDE `3.31.15` (`3eb8c133…`, arm64). Surface:
  this Cursor session with native Task. Payload / HEAD:
  `1ce7f1bc53061a6d1004dbbcf1089f8b72c3d937`. Slices 1–4 returned ordinary
  Task proof reports; no deliberate Task interruption was run. Verdict: no
  Cursor-specific product gap beyond the general recovery practice was
  evidenced. ODF-229 stays open for pending native interruption observation.
  No product follow-up queued from this boundary. Evidence: ODF-229 boundary
  note; `slice5-full-report.md`.
