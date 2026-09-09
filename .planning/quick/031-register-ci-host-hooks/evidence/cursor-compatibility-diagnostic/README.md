# Cursor Claude-compatibility diagnostic

Date: 2026-09-09

## Requirement and result

Slice 12 required evidence that Cursor's Claude compatibility was explicitly
active and actually invoked the installed Claude hook adapter with a
`cursor_version` payload, exercising the adapter's duplicate-delivery guard.

Result: **not established**. Cursor's native hook delivered the controlled CI
failure and shut down cleanly, but the manually instrumented Claude
`PostToolUse` handler did not execute. No raw compatibility payload or guard
outcome exists. Per the one-final-run bound, no retry was made.

This is negative diagnostic evidence. It is not installer proof and must not be
used to claim the installer emitted the instrumented command.

## Candidate and fixture

- Retained root: `/private/tmp/dough-031-compat.z5UpNq`
- Open Dough source base: `8ebbd45b24cf8c41f7c3e3a18e61f8d70f9c891b`
- Disposable candidate commit/tag: `1bdaa4f6e13c010b0c7f4886584c29fa4168da0f` / `v0.3.4`
- Installed fixture commit: `12a8be7b29bf3101e804b7988a3f05c4f5f3137a`
- Fresh final checkout: `/private/tmp/dough-031-compat.z5UpNq/final-checkout`
- Cursor agent: `2026.09.08-6caf4ff`
- Real candidate installation used to create the committed fixture:

```text
bash /private/tmp/dough-031-compat.z5UpNq/source/install.sh --target /private/tmp/dough-031-compat.z5UpNq/target --source /private/tmp/dough-031-compat.z5UpNq/source --platform cursor
```

The Cursor Settings UI showed the switch `Include Third-Party Plugins, Skills,
and Other Configs` with value `on` immediately before these diagnostics. This
is the setting required by Cursor's third-party-hooks documentation.

## Preserved attempts

1. The first command never started Cursor because its restricted `PATH` omitted
   the Cursor executable. No native session was created.
2. Native session `f2abc56a-276b-43d2-bb0a-93e528527142` used a process-level
   `node` tracer. Native Cursor delivery passed, but the tracer recorded no
   Claude invocation. Its transcript is under `attempt-1/` and its stopped
   mailbox remains `/tmp/dough-ci-501/watch-y1j4JD`.
3. Fresh native session `4db393cd-255c-4398-8771-c9c4256aee1c` added a separate
   diagnostic handler in ignored `.claude/settings.local.json`. Native Cursor
   delivery passed, but that handler recorded no invocation. Its transcript is
   under `attempt-2/` and its stopped mailbox remains
   `/tmp/dough-ci-501/watch-l4iCuG`.
4. The one authorized final diagnostic is recorded below. It instrumented the
   installed managed `PostToolUse` command itself so a loader ambiguity about
   `.claude/settings.local.json` could not explain another missing trace.

Prior Slice 6 evidence under `../cursor/` is unchanged and remains valid for
native Cursor readiness, failure delivery, shutdown, and tracked-settings
preservation. It did not prove Claude compatibility.

## Final diagnostic instrumentation

The fresh clone began with the installer's exact `.claude/settings.json`, saved
as `final/claude-installer.json`. For diagnosis only, the first (PostToolUse)
managed command was replaced with:

```text
/private/tmp/dough-031-compat.z5UpNq/final-compat-hook.sh
```

That wrapper would append stdin to
`trace/final-compat-inputs.jsonl`, invoke the byte-identical installed adapter
as `ci-host-hook.mjs claude`, and append stdout to
`trace/final-compat-outputs.jsonl`. The adapter's candidate and installed bytes
both had SHA-256:

```text
0a43d89ee01910473c177098ec305446ead2f504aa7e0ec06c6c79b91bf559ae
```

Only this disposable fixture setting was changed. The installed adapter,
Cursor settings, source candidate, and Open Dough checkout were not modified by
the instrumentation. `final/claude-instrumented-before.json` records the exact
manual change.

## Final native command

```text
PATH=/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin /Users/terryyin/.local/bin/cursor agent --print --force --trust --sandbox enabled --output-format json --workspace /private/tmp/dough-031-compat.z5UpNq/final-checkout <bounded acceptance prompt>
```

Native Cursor session: `cca6bd56-b4bf-4341-80fe-0b475c0fff79`. The retained
prompt and tool results are in `final/native-transcript.jsonl`.

proof:
  command: native Cursor command above, with the complete prompt retained in `final/native-transcript.jsonl`
  covers: fresh native readiness, one controlled failure delivery, and exact observer shutdown while the diagnostic Claude PostToolUse command is configured
  result: pass for native Cursor delivery and shutdown; fail for Claude compatibility invocation

The unpredictable controlled failure was run `933`, attempt `1`, job `1933`,
`acceptance-final-7c38b12e6da950f4`. It was absent from the prompt and reached
the owning coordinator.

Exact observer shutdown for `/tmp/dough-ci-501/watch-ZZN0K8`:

```json
{"status":"stopped","coverage":{"state":"ended","pendingCi":"unobserved"},"evidence":{"recordedThrough":1,"deliveredThrough":1,"unread":0}}
```

The mailbox request, event, delivery progress, worker record, and result are
retained under `final/mailbox/`.

## Compatibility observation

After the native session, neither `trace/final-compat-inputs.jsonl` nor
`trace/final-compat-outputs.jsonl` existed. Therefore:

- the configured Claude `PostToolUse` compatibility handler did not fire;
- no raw native payload containing `cursor_version` was observed;
- the `host === "claude" && input.cursor_version` guard was not exercised at
  the native compatibility boundary; and
- successful native Cursor delivery came from `.cursor/hooks.json`, not from
  the instrumented Claude handler.

No second final attempt was run.

## Settings preservation

- Instrumented Claude setting before/after SHA-256:
  `cab9fc113c143aa984f6954e0744d4f4601dce05d65724bd3c5dc824a1ecfd65d`
- Cursor setting before/after SHA-256:
  `f8059924c9a499119fae8738f1295236ef28f420aae514859443eb3e854e6cbb`

The before/after files are retained under `final/`. The diagnostic setting is
intentionally different from `final/claude-installer.json` (SHA-256
`cb72caffb4070f7fc3643b07daddde5ad62e762e57fc7993b281e9a0659acb3a`),
so it is not represented as installer-created configuration.

The existing installer-created Cursor configuration remains valid for native
Cursor readiness, failure delivery, and shutdown. This diagnostic does not
establish that the installer-created Claude configuration coexists through
Cursor's compatibility loader.

## SEED-007 release-impact review

The proposed `0.3.4` content changes both
`src/skills/dough-update/SKILL.md` and
`src/skills/dough-adr-awareness/SKILL.md` relative to `v0.3.3`. The updater now
authorizes and inspects managed host-hook registration, and the ADR skill has
the selected executing-agent perspective changes. These are exactly the update
and subsequent installed ADR-use boundaries owned by SEED-007 Story 3.

Slice 7's Claude run proves ordinary update-created hook registration and native
notification delivery, but its retained evidence explicitly makes no
SEED-007 ADR-guidance-use claim. SEED-007 remains Pending and is affected by the
selected release content; it cannot be waived by the hook-only run.

## Release readiness

**Not ready to publish `0.3.4`.** Two ADR 0005 acceptance gaps remain:

1. Slice 12 R5 has negative evidence rather than the required native Cursor
   Claude-compatibility invocation/payload proof.
2. The affected SEED-007 standalone Claude update plus installed ADR-guidance
   use remains Pending.

No product defect was demonstrated in the Claude adapter guard itself because
the compatibility loader never invoked the diagnostic handler. Resolving that
host/runtime condition or making a human-owned release-scope/acceptance decision
is required before publication.
