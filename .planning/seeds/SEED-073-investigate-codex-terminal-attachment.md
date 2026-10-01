---
id: SEED-073
status: active
planted: 2026-10-01
planted_during: Terry's report of a dashboard Codex terminal attachment failure
scope: story
---

# SEED-073: Investigate Codex terminal attachment failure

<a id="investigate-codex-terminal-attachment"></a>

### Investigate Codex terminal attachment failure

**Identity:** SEED-073#investigate-codex-terminal-attachment
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Establish why opening the recorded refinement session fails to attach and report an evidence-backed cause and recovery direction.
- **Scope:** Diagnose the supplied local session and attachment boundary. This request authorizes investigation, not product repair.
- **Expected:** Open terminal attaches the recorded Codex conversation when its retained workspace and endpoint are usable.
- **Observed:** The panel says “The session could not be attached” and offers Reconnect, with no terminal output.
- **Evidence:** Terry's two screenshots name session `01a0f67a-d156-7360-906b-db4f9d1fc70e`, endpoint `unix:///Users/terryyin/.codex/app-server-control/app-server-control.sock`, and workspace `/Users/terryyin/git/open-dough/.worktrees/keep-the-dashboard-responsive-while-session-star`. The card reports first input accepted and ready for review.
- **Unknown:** Whether the saved workspace, endpoint, native conversation, or terminal process failed; whether reconnect changes the outcome.

## Breadcrumbs

- Terry's investigation request and screenshots in this chat, 2026-10-01.

## Investigation evidence, 2026-10-01

**Closure decision:** Terry requested wrap-up for now and will revisit if the failure recurs. The investigation is complete within that selected scope; removal timing remains unknown, and no repair or follow-up implementation is selected.

- The screenshot's saved workspace is currently absent from the filesystem and registered Git worktrees. Its saved Unix socket exists.
- The recorded session ID is currently absent from this machine's launch-store document. Its native conversation could not be retrieved through the app's read-thread tool. These observations do not establish when removal happened or that native history was deleted.
- `dashboard/server/hosts/codex/terminal.ts` supplies the saved workspace both as the terminal process working directory and Codex's `--cd` argument. It does not resolve a missing workspace.
- A disposable process probe through the same PTY library ran `/usr/bin/true` in the screenshot's missing workspace and exited with code 1, without output. Running the same probe in the existing default project directory exited with code 0. No Codex conversation was resumed or input submitted by this probe.
- `dashboard/server/terminalAttachments.ts` maps a terminal exit before readiness to the generic attachment-failed state. This explains how a missing workspace produces the blank terminal and screenshot message.
- **Disposition:** A missing saved workspace is a demonstrated attachment failure and the likely explanation for this screenshot. The original failure's timing and workspace-removal provenance remain unconfirmed. No product repair is authorized or implemented. Reconnect cannot repair this missing-directory condition.
- **Remaining acceptance examples:** Diagnose a missing saved workspace with an actionable explanation; retain native conversation identity after preparation workspace retirement; select any recovery workspace only under the existing ownership contract, without silently creating a replacement conversation or claim.
- **Retained checkout:** `/Users/terryyin/git/open-dough/.worktrees/investigate-codex-terminal-attachment`, branch `codex/investigate-codex-terminal-attachment`, created for this investigation at `c6546963f5250d0c6d76c7b7cd75aa8286278bdc`. Admission published at `ffb58c5107e6c2fd32b43e94af178ea3ae6eeb57`; investigation evidence is a local draft. The admitted item stays Taken while the original failure and repair disposition remain unresolved.
