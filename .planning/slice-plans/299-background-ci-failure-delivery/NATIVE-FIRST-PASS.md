# First native feasibility pass

Supporting record for [plan 299](PLAN.md); slice status and current execution
ownership remain in that plan. This record grants no execution authority.

#### Claude Code evidence (2026-10-11, Claude Code 2.1.296, 16 budgeted steps, 13 model turns)

Probe: `tests/support/background-ci-wakeup-native-probe.sh --native claude`
with its PTY and transcript helpers, in a private fixture project. Retained
transcripts, logs and ledger: `~/.claude/jobs/6f44ebc2/tmp/native-claude/`
(machine-local). Tokens named below appear in those transcripts.

| Route | Command | Observed |
| --- | --- | --- |
| Exited standalone session | `claude -p TEXT --resume ID` and `claude --bg --resume ID TEXT` | Same session ID and transcript, token once, working directory kept. Permission mode fell from the session's `default` to the developer's own setting (`auto`). Re-passing the mode was not observed. |
| Background session whose process is alive and idle | `claude --bg --resume ID TEXT` | Exit 0 but started a copy under a new ID ("already running in the background, so this started a copy"); the copy consumed the text. Not same-session delivery. |
| Same, or busy, or waiting on approval | `claude -p TEXT --resume ID` | Exit 1, "That session is running in the background", no model call, session undisturbed. A clean not-delivered. |
| Stopped background session | `claude stop SHORT`, then `claude --bg --resume ID TEXT` with no other option | Same ID, saved name, permission mode and model kept, token once. With any extra option it starts a copy instead. |
| Idle or busy, typed into `claude attach` | PTY typing | Idle: becomes the next turn. Busy: queued and absorbed at a tool boundary of the running turn. |
| Waiting on approval, typed into `claude attach` | PTY typing | The pending permission prompt was accepted and the text was lost. Unsafe. |
| Coordinator and child identity | transcript records | A subagent shares the `sessionId` and has its own `agentId` and `isSidechain: true`; delivery by session ID lands in the main thread. |
| State without AI | `claude agents --json --all --cwd DIR` | `status` busy, idle or waiting and `waitingFor`, only while the process lives. |

Capability gaps against the required forms, returned to Terry:

1. A dashboard background session keeps its process after a turn. No observed
   command hands text to that live session under its own ID without typing
   into its terminal. The one same-ID, policy-preserving route requires
   stopping it first.
2. An exited standalone session continues under its ID but under the
   developer's current permission setting, not the one it ran with.
3. A standalone session still open in a terminal was not probed; no route
   other than terminal typing is known.

Terry accepted the idle-only stop/resume candidate on 2026-10-12; slice 5 and
the Claude part of slices 3 and 8 still wait for matching safety proof. The
existing hook delivery at a tool or Stop boundary is unaffected and still
reaches a busy coordinator. Early evidence for G11: a background session's
shell reached a private request owner under `/tmp` and was answered; that
covers only an unsandboxed host. Codex and Cursor are not yet probed.

Read-only follow-up (2026-10-12): the installed `claude --help`,
`claude agents --help` and `claude attach --help` expose no direct live-session
send command. Official [agent-view documentation](https://code.claude.com/docs/en/agent-view)
describes a peek-panel reply route distinct from attachment; its recipient and
approval safety are unproved here. Official
[channels reference](https://code.claude.com/docs/en/channels-reference) describes
inbound MCP events, but a custom channel currently needs a development
allowlist bypass and interactive confirmation; that bypass is ignored in print
or SDK mode. Neither document is native feasibility evidence or a selected
production route. The original Claude requirements and capability decision remain.

While a native host session of each kind is running, also observe whether a
process it starts can reach the request owner's endpoint and be answered
(early evidence for obligation G11, which slice 11 still owns).

#### Partial Codex and Cursor evidence (2026-10-12)

The first bounded pass used Codex CLI/App Server `0.162.1` and Cursor agent
`2026.10.01-e373342`. Private fixture, commands, ledger and native observations
remain at `/tmp/dough-bg-native-E886R8/`. The ledger contains nine Codex paid
attempts and three Cursor paid attempts (two Cursor model turns; the first
input raced fixture trust and never reached the model). The native defaults
selected the models; no model or permission flag was added on continuation.
These are transport feasibility observations, not installed-runtime filtering,
dashboard enrollment, or skill-behavior acceptance.

| Required route / question | Native observation and evidence |
| --- | --- |
| Codex dashboard App Server mechanism, idle | Private Unix WebSocket App Server thread `01a12ce6-a7c6-7092-8e21-6845b524b6b3`; ID-only `thread/resume` followed by `turn/start` accepted `CODEX_IDLE_E886R8` as turn `01a12ce6-b864-7e92-8319-69ee281e1d5a`. Native history contains one user input and its reply. `logs/codex-dashboard-history.json` and `logs/rpc.jsonl` retain the signals. The dashboard itself was not invoked. |
| Same App Server thread, busy | During native shell execution, `turn/steer` with `expectedTurnId` accepted `CODEX_BUSY_E886R8` under the existing turn `01a12ce6-c17f-7c01-80c5-430b24ac8c4f`; native history includes the token once and a final reply after the command ended. No new turn or thread was created for steering. |
| Same thread, lost reply | The client closed immediately after sending `CODEX_LOST_E886R8`; reconnect/read reconciled one accepted user input in turn `01a12ce7-506d-71d2-b528-42ea32ae6be4`, with no resend. `logs/codex-dashboard-reconciled.json` retains it. This establishes this observed acceptance, not an exactly-once guarantee across every crash window. |
| Codex standalone interactive CLI after process exit | Ordinary `codex --no-alt-screen --cd /tmp/dough-bg-native-E886R8/project` completed its initial turn and exited 0 after Ctrl-D, naming reconnect thread `01a12cea-08cd-72b3-952b-16adede860dc`. The existing managed daemon accepted ID-only resume and `CODEX_CLI_EXIT_E886R8` under that ID, turn `01a12ceb-561e-7e51-99d8-6fe0a247ce20`. `logs/codex-cli-initial.txt` and `logs/codex-cli-resume-history.json` retain the observations. |
| Codex workspace and policy | App Server ID-only resume kept `on-request`, `workspaceWrite`, and disabled network; inherited standalone CLI kept its original YOLO/`never`/`dangerFullAccess` setting. `/tmp` and `/private/tmp` are the same canonical fixture workspace. A restrictive standalone session and a still-open CLI were not observed. |
| Codex G11 early endpoint evidence, corrected after effective-policy inspection | First native restrictive shell attempt to start the private request owner timed out. The same delivered `ci-github-diagnostic.mjs workflow owner/repo` succeeded outside the sandbox. Prewarmed turn `01a12cea-0aa4-71b0-8086-cf97be1a8b9d` returned workflow 7001 and exit 0, but its actual native `turn_context` has `danger-full-access`; the earlier claim that it proved restrictive sandbox access was withdrawn. Source: `/Users/terryyin/.codex/sessions/2026/10/12/rollout-2026-10-12T06-37-56-01a12ce6-a7c6-7092-8e21-6845b524b6b3.jsonl`. It proves unrestricted access only. The later still-open CLI's effective `workspace-write` / network-disabled command also timed out. Restrictive G11 remains unresolved. |
| Codex approval/input safety | Two bounded approval setup attempts did not establish a pending request: a harmless command ran without a prompt, and `request_permissions` was unavailable to the native model. The first harness ended exit 1 on its observation timeout; the second ended exit 1 when interrupting an already-completed turn. No approval response or failure token was sent while approval was pending. Waiting-on-approval/input safety remains unproved. |
| Cursor standalone interactive CLI, idle terminal typing | Exact chat `8038544e-3d10-494b-846c-7aeeb925c686`, created for this fixture only, accepted `CURSOR_IDLE_E886R8` via its owned PTY. Native stored user request `d3f20351-804e-47e5-81f3-32bc52b19f76` and assistant message `msg_p4rESyu-3LYxF7-6d5665fa-aws_ue1_0` retain it. `logs/cursor-interactive.txt` and `logs/cursor-owned-transcript.json` retain evidence; the PTY ended exit 0 / signal 1. This is terminal typing, not verified runtime-adapter acceptance. |
| Cursor exited CLI | `cursor-agent --workspace /tmp/dough-bg-native-E886R8/project --resume 8038544e-3d10-494b-846c-7aeeb925c686 --print --output-format stream-json` accepted `CURSOR_EXIT_E886R8` under the original ID; native result request `9262b37e-8afa-40b0-92fd-b56af8c29073` ended success/exit 0. `logs/cursor-exited-resume.jsonl` and stored native messages retain evidence. Original setting was Run Everything with sandbox disabled. Official Cursor documentation says print mode has full write access; this does not prove preservation for a restrictive session. |
| Cursor alternate non-terminal candidate | [Official ACP documentation](https://prod.cursor.com/docs/cli/acp) describes `session/load`, `session/prompt` and separate permission/input requests; installed `agent help acp` confirms the command. No ACP model run or same-session continuation was performed. It is a candidate requiring native proof, not a pass or an IDE endpoint. |
| Codex desktop and Cursor IDE | No verified continuation endpoint for an original conversation was established. Workspace-opening CLI commands and documentation do not prove conversation binding. These required forms remain missing; no desktop/IDE model run or replacement conversation was created. |

These first-pass gaps were returned under G23. The [resumed pass](NATIVE-RESUMED-PASS.md) updates
their current proof state without replacing the original reported evidence.

Cleanup: the private App Server's exact command/PID `82196` was verified before
SIGTERM; command session `80841` ended exit 0. Its private request owner PID
`8552` had already exited. `logs/cleanup.jsonl` retains the receipt. The shared
managed Codex daemon was preserved. This probe did not operate the coordinator
CI observer; its later explicit shutdown is retained in [execution history](EXECUTION-HISTORY.md). Private native histories and the fixture remain for the current
decision. There are no live owned model commands or command watches from this
first pass.
