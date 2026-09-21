# Verify Cursor and Claude-hook coexistence

## Source and remaining outcome

This is the unfinished acceptance from Quick 032, a follow-up correction to
Quick 031's CI-hook registration work. The original plans and their full history
remain recoverable in Git.

The completed Quick 032 outcomes remain accepted and are not reopened:

- managed-hook command variants refuse before install/update writes (`876ea9d`);
- Claude Code can perform an ordinary remembered-source update and use the
  installed ADR guidance (`d8ff5b5`, `1db2817`); and
- Claude Code's native CI observer delivers once and shuts down cleanly
  (`353311e`).

The remaining outcome is to establish that an installation containing both
native Cursor hooks and project Claude hooks behaves safely when Cursor's
third-party Claude compatibility is enabled: Cursor invokes the Claude hook,
the Claude adapter declines the Cursor-shaped event, and the native Cursor
adapter delivers one CI failure exactly once.

The prior bounded run on Cursor 3.19.13 did not observe the project
`.claude/settings.json` hook. Its negative result is retained at
`evidence/cursor-claude-compatibility/README.md`. Current
[Cursor third-party-hook documentation](https://prod.cursor.com/docs/reference/third-party-hooks)
now explicitly lists project `.claude/settings.json` as a supported hook source,
and the locally available Cursor version was 3.21.16 at this refinement. This
changed host evidence justifies one fresh run; it does not establish success.

## Scope and decisions

Include one fresh native Cursor acceptance using the current Open Dough source,
an installer-created disposable project, both managed hook configurations, and
Cursor's third-party import enabled. Record the exact source commit, Cursor
version, compatibility setting, invoked hook sources, Cursor-shaped Claude-hook
input, delivery count, mailbox shutdown result, and before/after settings hashes.

Preserve these decisions:

- `.cursor/hooks.json` is Open Dough's supported Cursor delivery path. It does
  not depend on Claude compatibility mode.
- `.claude/settings.json` remains installed for Claude Code. When Cursor imports
  it, `ci-host-hook.mjs claude` must ignore input carrying `cursor_version`, so
  only the native Cursor adapter can claim a notification.
- [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  requires one installation to populate the supported native layouts and
  coexist with unrelated guidance.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  requires native evidence at the affected integration boundary; deterministic
  tests or native Cursor delivery alone cannot prove Claude-hook import.
- Use the current source checkout as the candidate. Do not reuse the old
  `fc36853` candidate or treat the Cursor 3.19.13 result as current acceptance.
- Run one bounded fresh session. Retry only after a concrete setup or product
  change, or a newly supported diagnostic hypothesis.

Exclude revalidation of the three completed outcomes, release publication,
installer redesign, general hook-system conformance testing, user-level Claude
configuration, unrelated host adapters, and speculative compatibility work.
Do not move or duplicate hook registration to compensate for a host failure.
Changing the supported registration contract requires a separate human decision.

## Ordered slice

### 1. Verify one delivery when Cursor imports the project Claude hook
Type: Behavior
Status: planned

Behavior: Given a freshly installed disposable project containing the managed
Cursor and Claude hook configurations, with Cursor's third-party import enabled,
a native Cursor session invokes both applicable hook sources. The Claude adapter
declines the event identified by `cursor_version`, the native Cursor adapter
delivers one unpredictable controlled CI failure exactly once, exact mailbox
shutdown reports no unread event, and neither settings file changes.

Proof:

1. Record current `HEAD`, `cursor --version`, and the current official Cursor
   third-party-hook contract. Create a committed disposable project through the
   real installer and verify its `.cursor/hooks.json` and
   `.claude/settings.json` match the candidate payload before starting Cursor.
2. Confirm third-party import is enabled. Snapshot both settings files, then
   start one controlled observer using the existing Quick 032 `gh` stand-in
   updated only if the current watcher contract requires it. Keep the failure
   identity unpredictable and absent from the prompt.
3. Through a real Cursor session, observe both the native Cursor hook and the
   imported project Claude hook. Capture the actual Claude-hook input and verify
   it contains `cursor_version`. Prefer Cursor's hook diagnostics; temporary
   tracing is allowed only in the disposable fixture and must be removed before
   the final clean acceptance run.
4. Verify the native adapter delivers the controlled failure once, later tool
   boundaries stay quiet, and
   `ci-mailbox.mjs stop <recorded-mailbox>` reports
   `recordedThrough: 1`, `deliveredThrough: 1`, and `unread: 0`. Verify both
   settings files remain byte-identical.
5. Run the focused deterministic checks for the duplicate-delivery guard and
   hook process boundary:

   ```sh
   node --test \
     src/skills/dough-execute-plan/scripts/ci-host-hook.test.mjs \
     src/skills/dough-execute-plan/scripts/ci-host-hook-process.test.mjs \
     src/skills/dough-execute-plan/scripts/ci-cursor-lifecycle.test.mjs
   bash tests/install-ci-host-hooks.sh
   ```

If the current Cursor version still does not invoke the project Claude hook,
retain the version, enabled setting, exact project configuration, and Cursor
hook diagnostics, then stop this slice as pending. Do not infer success from
native Cursor delivery and do not change registration placement without a human
decision. If Cursor invokes the hook but Open Dough mishandles its input, repair
only the smallest implicated adapter or deterministic test seam, rerun the
focused checks, reinstall the clean candidate, and repeat the native acceptance.

Safe stopping point: the complete coexistence behavior is proven against one
current clean candidate, or a current documented-host contradiction is retained
with the specific decision or external change needed. No partially instrumented
fixture counts as acceptance.

## Proof ownership and completion

| Promise | Owner | Completion signal |
| --- | --- | --- |
| Cursor imports the installed project Claude hook | Slice 1 | Native invocation and actual Cursor-shaped input observed |
| Compatibility does not duplicate CI delivery | Slice 1 | Claude guard observed; one native delivery; later boundaries quiet |
| Shutdown and host settings remain clean | Slice 1 | Exact terminal counts and byte-identical settings |

After the slice passes, mark it done with the candidate identity and concise
verdict. The completed correction can then proceed through retrospective and
story wrap-up, which remove this plan and spent evidence from the current tree
while preserving Git history.
