# Cursor/Claude compatibility acceptance (resolved)

Date: 2026-09-21

## Requirement and result

The remaining Quick 032 outcome required evidence that a fresh Cursor session
with installer-created Cursor and Claude configurations, and Cursor's
third-party import active, invokes the imported Claude hook adapter (so the
`cursor_version` duplicate-delivery guard is exercised) while the native
Cursor adapter delivers one controlled CI failure exactly once and shutdown
leaves both settings files unchanged.

Result: **established**. Cursor 3.21.16 imports and invokes the project
`.claude/settings.json` `PostToolUse` hook with `cursor_version` present; the
Claude adapter's guard declines that event (`{}`); the native `.cursor/hooks.json`
adapter delivered the controlled failure exactly once; mailbox shutdown
reported `recordedThrough: 1`, `deliveredThrough: 1`, `unread: 0`; and both
settings files stayed byte-identical before and after.

This resolves Slice 4's prior "not established" finding
(`../cursor-claude-compatibility/README.md`, Cursor 3.19.13). Current
[Cursor third-party-hook documentation](https://prod.cursor.com/docs/reference/third-party-hooks)
lists project `.claude/settings.json` as a supported source and states the
import setting ("Include Third-Party Plugins, Skills, and Other Configs",
Cursor Settings → Agents → Third-Party Imports) is on by default; this
machine's Cursor application state (`cursor/hasShownThirdPartyExtensibilityNotification: true`
in `state.vscdb`, no recorded off-value) and the direct observation below both
confirm it is active for this account.

## Candidate

- Open Dough source checkout: `claude/032-cursor-claude-compatibility` at
  `f6d3c6c35a0758813160e124b4d0678bdb3bf34f` (`source-commit.txt`).
- Cursor CLI/agent: `3.21.16` (`8ae78e8eee1e63479c7e0504b664bc0a80c68000`, arm64,
  `cursor-version.txt`).
- Disposable fixture project, installed through the real installer
  (`bash install.sh --target <fixture>/target --source <source checkout> --platform cursor`,
  which registers `.codex/hooks.json`, `.cursor/hooks.json`, and
  `.claude/settings.json` together regardless of the `--platform` value) and
  committed at `6dac7ad8e30569b7e914ddb6ac2ff210697a910e` (`fixture-commit.txt`).
  Retained fixture root:
  `/Users/terryyin/.claude/jobs/d74ca3d7/tmp/dough-032-compat` (job-scoped
  scratch space; not part of this repository).

## Diagnostic run: Claude-hook invocation and guard

A disposable `PostToolUse` tracer (`compat-hook.sh`, never committed) was
substituted for the installed Claude `PostToolUse` command only in the
uncommitted working tree, logging the raw input before forwarding it
unchanged to the real `ci-host-hook.mjs claude` and logging its output. A
non-interactive native session
(`cursor agent --print --force --trust --sandbox disabled --workspace <fixture>/target`,
session `a678e120-134a-4cd8-909a-f7ed492b98e7`) ran one `Shell` tool call.

Captured input (`diagnostic-final-compat-inputs.jsonl`) shows Cursor invoking
the imported hook with `"hook_event_name":"postToolUse"` and
`"cursor_version":"2026.09.18-9a7762b"` present, alongside Cursor-shaped
fields (`conversation_id`, `generation_id`, `tool_output` as a JSON string).
The real hook's captured output (`diagnostic-final-compat-outputs.jsonl`) is
`{}`, confirming `selectCiEvents` took the
`host === "claude" && input.cursor_version` guard branch and produced no
context or acknowledgement.

The tracer and its trace files were removed and `.claude/settings.json`
restored via `git checkout -- .claude/settings.json` before the acceptance
run below; `claude-settings-before.sha256` (taken immediately after installer
commit `6dac7ad`) and the post-run hash below are identical, confirming the
restore was exact.

## Clean acceptance run: native delivery, guard coexistence, and shutdown

With the fixture back at its exact installer-committed state, one further
native session (no tracer, `acceptance-prompt.txt`, session
`1330b4c2-7b3e-4be6-a1cc-ad13ed781a38`, `native-result.json`) was launched
with `CONTROLLED_GH_TOKEN`/`CONTROLLED_GH_REPO`/`CONTROLLED_GH_BRANCH`/`CONTROLLED_GH_MODE`
set only in the launching shell's environment (never in the prompt), pointing
`gh` at the retained `evidence/claude-ci-watch/controlled-gh.py` stand-in
(unmodified; its `run list`/`run view --json jobs`/`run view --json
attempt,status,conclusion,url` shapes still match `ci-runs.mjs` and
`ci-failures.mjs` on this candidate). The session:

1. ran the readiness probe and received `CI_MONITOR_READY`;
2. started exactly one observer (`/tmp/dough-ci-501/watch-xbnFDa`);
3. ran one further harmless command, after which the host delivered
   `{"type":"CI_FAILURE", ... ,"failedJobs":[{"jobId":101,"name":"acceptance-a86a9da4e43c25b6","conclusion":"failure"}]}` —
   the exact unpredictable job name baked into the launch environment and
   absent from the prompt; and
4. stopped that exact observer, receiving
   `{"status":"stopped","coverage":{"state":"ended","pendingCi":"unobserved"},"evidence":{"recordedThrough":1,"deliveredThrough":1,"unread":0}}`.

The coordinator independently re-read the mailbox directory's own
`delivery.json`, `result.json`, and `events/000000000001.json`
(`mailbox/`) after the session exited and confirmed they match the session's
reported text exactly, and confirmed no `ci-mailbox.mjs worker` process for
this mailbox remained running.

Because the diagnostic and clean runs used the identical fixture identity
(same installer-committed settings, same Cursor version, same third-party
import state), the Claude-hook decline observed in the diagnostic run and the
single native delivery observed in the clean run together establish the
required coexistence: both hook sources are invoked on one candidate, only
the native adapter claims the notification, and no duplicate delivery
occurs.

## Settings preservation

```text
.claude/settings.json  before f711034bf996a97cc264dc31d19984f14ab885b0755f6932cf5a58ee99ff5ec7
.claude/settings.json  after  f711034bf996a97cc264dc31d19984f14ab885b0755f6932cf5a58ee99ff5ec7
.cursor/hooks.json     before 02ee50ec9203193c7bc82b8913259e91c3f0bd20e0eae6fc0eeec676ff7a23a6
.cursor/hooks.json     after  02ee50ec9203193c7bc82b8913259e91c3f0bd20e0eae6fc0eeec676ff7a23a6
```

`git status --short` in the fixture reported no changes after the clean
acceptance run.

## Focused deterministic checks

```sh
node --test \
  src/skills/dough-execute-plan/scripts/ci-host-hook.test.mjs \
  src/skills/dough-execute-plan/scripts/ci-host-hook-process.test.mjs \
  src/skills/dough-execute-plan/scripts/ci-cursor-lifecycle.test.mjs
# tests 22, pass 22, fail 0
bash tests/install-ci-host-hooks.sh
# PASS
```

## SEED-001 / Quick 031 R5

R5 is now fully established: native Cursor readiness, failure delivery, and
shutdown were already valid, and this run establishes that installer-created
Claude configuration coexists safely through Cursor's compatibility loader on
the current candidate.
