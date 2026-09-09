# Cursor Claude-compatibility diagnostic (Quick 032 Slice 4)

Date: 2026-09-09

## Requirement and result

Slice 4 required evidence that a fresh Cursor session with installer-created
Cursor and Claude configurations, and Claude compatibility explicitly active, actually
invoked the installed Claude hook adapter so the `cursor_version` duplicate-delivery
guard could be observed, while one native CI failure reached the owning coordinator
once and shutdown left both settings files unchanged.

Result: **not established** for the Claude compatibility invocation. Native Cursor
delivery and clean shutdown passed. The disposable PostToolUse wrapper was never
executed, so no raw compatibility payload or guard outcome exists.

This is negative diagnostic evidence. It is not installer proof and must not be
used to claim the installer emitted the instrumented command. Per the one-bounded-run
rule, no unchanged retry was made.

## Candidate and fixture

- Retained root: `/private/tmp/dough-032-compat.slyRFx`
- Open Dough source commit: `fc36853557302365d32a31179fe3ea89f45c4546`
- Installed fixture commit: `878fcae60274a042d7a0a149b1b3d0d4356b8beb`
- Cursor CLI/agent: `3.19.13` (`dd066f332fcea7382764400fde902f61920648d0`, arm64)
- Real candidate installation:

```text
bash /private/tmp/dough-032-compat.slyRFx/source/install.sh --target /private/tmp/dough-032-compat.slyRFx/target --source /private/tmp/dough-032-compat.slyRFx/source --platform cursor
```

New versus Quick 031's three negative diagnostics: current Cursor 3.19.13 (was
`2026.09.08-6caf4ff`) and `--sandbox disabled` (031 used `--sandbox enabled`).

## Compatibility setting

Official loader requirement (inspected at execution:
https://cursor.com/docs/reference/third-party-hooks): enable
Cursor Settings → Rules, Skills, Subagents → Include third-party Plugins, Skills,
and other configs. Quick 031 recorded that control as `on` in the desktop UI on
this machine earlier the same day.

This coordinator session (workspace `/Users/terryyin/git/open-dough`) independently
shows the loader is active for Claude user config: Cursor hook logs contain 1154
runs of user-level `~/.claude/settings.json` GSD commands and 770 runs of the
native project adapter `ci-host-hook.mjs cursor`, and **0** runs of
`ci-host-hook.mjs claude`. Project `.claude/settings.json` is present and valid.

## Disposable native command

```text
PATH=/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /Users/terryyin/.local/bin/cursor agent --print --force --trust --sandbox disabled --output-format json --workspace /private/tmp/dough-032-compat.slyRFx/target <bounded acceptance prompt>
```

Native Cursor session: `3a3300b7-9fd2-4d56-9825-6b6c1da1298f`. Transcript:
`native-result.json`. Prompt: `acceptance-prompt.txt` (does not contain the
failure job name).

proof:
  command: native Cursor command above, with the complete prompt retained in `acceptance-prompt.txt` and result in `native-result.json`
  covers: installer-created Cursor+Claude settings, sandbox-disabled CLI Agent, one controlled failure delivery, exact observer shutdown while the diagnostic Claude PostToolUse command is configured
  result: pass for native Cursor delivery and shutdown; fail for Claude compatibility invocation

The unpredictable controlled failure job name was `acceptance-323a51f0d4ede0d4`
(baked into the local `gh` stand-in, absent from the prompt). Mailbox
`/tmp/dough-ci-501/watch-EHDQhY` stopped with:

```json
{"status":"stopped","coverage":{"state":"ended","pendingCi":"unobserved"},"evidence":{"recordedThrough":1,"deliveredThrough":1,"unread":0}}
```

The mailbox request, event, delivery progress, worker record, and result are
retained under `mailbox/`.

## Compatibility observation

After the native session, `trace/final-compat-inputs.jsonl` and
`final-compat-outputs.jsonl` were not created (`trace-observation.txt`). Therefore:

- the configured Claude `PostToolUse` compatibility handler did not fire;
- no raw native payload containing `cursor_version` was observed;
- the `host === "claude" && input.cursor_version` guard was not exercised at
  the native compatibility boundary; and
- successful native Cursor delivery came from `.cursor/hooks.json`, not from
  the instrumented Claude handler.

No second attempt was run. Changing where Open Dough registers the Claude adapter
so Cursor's third-party loader would pick it up would change the supported host
contract and needs an explicit human decision.

## Settings preservation

Instrumented Claude setting before/after SHA-256:
`1b8ccf02b554b020769f2bd5e2424bc6bce3391a9696318e478e812d2e0ce80a`

Cursor setting before/after SHA-256:
`5dbe9c694b23b93f3f0ff98356f52bb5cfd585172211c9e123973a8cc712499e`

The diagnostic PostToolUse command is intentionally different from
`claude-installer.json` (the installer's exact fragment), so it is not
represented as installer-created configuration.

## SEED-001 / Quick 031 R5

R5 remains pending. Native Cursor readiness, failure delivery, and shutdown remain
valid. This run does not establish that installer-created Claude configuration
coexists through Cursor's compatibility loader.
