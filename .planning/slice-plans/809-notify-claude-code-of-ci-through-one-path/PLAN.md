# Notify Claude Code of CI results through one path

**Identity:** SEED-423#notify-claude-code-of-ci-through-one-path
**Source:** [Notify Claude Code of CI results through one path](../../seeds/SEED-423-shrink-the-installed-distribution.md#notify-claude-code-of-ci-through-one-path)

## Goal and scope

A Claude Code execution completes CI through the shared `complete-revision`
operation and the synchronous hook bridge that Codex and Cursor use. The
installation no longer ships, registers or offers the live-Claude background
handoff, and an update of an existing installation removes its former Stop
entry. No new wake-up mechanism replaces it: a turn that ends with CI pending
learns of a failure at its next interaction.

Exclusions: this repository's own installed copies under `.claude/`,
`.agents/` and `.claude/settings.json` change at the next client update, not
here. `CHANGELOG.md` belongs to the release. Historic findings
(`docs/maintainer/findings/ODF-321.md`,
`docs/maintainer/empirical-process-control-research.md`) and recorded native
streams under `Distribution/evaluation/tests/fixtures/native-streams/` keep
their mentions as records.

## Current decisions

- Retire the registration with the asset change, before the scripts go, so
  no slice leaves an installed Stop hook naming a missing script.
- The hook registrar removes only the exact former managed entry (the
  `ci-background-hook.mjs` command with `timeout: 610` and
  `asyncRewake: true` in its own wrapper). A locally changed copy is no longer
  a managed entry and stays as the developer left it; it is not a conflict.
  Keep the retirement as data next to the host fragment inventory in
  `open-dough-register-hooks-fragments.mjs`, not as a second merge policy.
- Removed payload files leave existing installations through the existing
  release-leftover handling, as for the CI reuse scripts in `7717dff12`; no
  installer work for files.

## Decisive premises

Observed in this owned checkout at `d8200be3c` with Node from
`.node-version`; every scratch edit was reverted.

| Consuming operation | Observation and result |
| --- | --- |
| An update re-registers hooks from the current asset; slice 1 needs to know whether a dropped asset entry leaves the target. | Created an empty target, ran `node Distribution/src/install/open-dough-register-hooks.mjs apply <target> <checkout>`, then scratch-removed the asyncRewake wrapper from `claude-hooks.json` and ran the same command. It printed `hooks: all host registrations already current; left unwritten.` and the target's Claude Stop hooks still listed `ci-background-hook.mjs`. The registrar has no retirement today; slice 1 adds it. |
| Without the handoff's deference, the synchronous Claude Stop hook still delivers a ready failure once (key example 2). | Scratch-deleted the `readBackgroundHandoff` import and its `continue` line from `ci-host-hook.mjs`, then `env -u NO_COLOR -u FORCE_COLOR node --test --test-reporter=tap Distribution/tests/skills/dough-execute-plan/ci-claude-lifecycle.test.mjs Distribution/tests/skills/dough-execute-plan/ci-host-hook-process.test.mjs` passed 4 of 4, including the Claude Stop `decision: block` delivery and interrupted-hook redelivery. |
| Nothing outside the handoff imports its scripts. | `git grep ci-background` over `Distribution/src`, `dashboard`, `scripts` and `.github`: only the five scripts, `ci-host-hook.mjs` (the deference above), `claude-hooks.json` and three references. Tests: `ci-background-handoff.test.mjs`, `ci-background-lifecycle.test.mjs`, `ci-background-test-fixtures.mjs`, `install-ci-background-hook.sh`. |

## Slices

### 1. Installation retires the background wake hook

Type: Behavior
Status: planned

Behavior: A project installed with the former asyncRewake Stop entry,
unchanged, runs install or update → the entry is gone, the synchronous
`ci-host-hook.mjs` Stop and PostToolUse entries and unrelated handlers and
local settings remain. A locally edited former entry is left untouched. A
fresh install registers no asyncRewake hook (key examples 3 and 4).

**Proof.** Replace `Distribution/tests/installation/install-ci-background-hook.sh`
with an installation scenario that seeds the former exact entry plus an
unrelated Stop handler, runs `install.sh`, and asserts the result above, then
repeats with a locally edited former entry and asserts it survives with no
`conflicting-managed-hooks` refusal. Check that it fails with the retirement
disabled. Run it with the other `Distribution/tests/installation/install-ci-host-hooks.sh`
and `update-skip-verified.sh` scenarios through `scripts/test.sh`.

### 2. Claude Code completes CI through the shared operation only

Type: Behavior
Status: planned

Behavior: A Claude Code Story Branch execution at its final handoff runs
`complete-revision` and handles its receipt; when it reports `pending`, the
turn ends with the observer retained and a later failure arrives once through
the ordinary hook at the next interaction (key examples 1 and 2). The five
`ci-background-*` scripts, `ci-background-handoff.md`, the deference in
`ci-host-hook.mjs`, the handoff tests and
`docs/maintainer/ci-background-delivery.md` are gone, and
`ci-completion-wait.md`, `ci-notify-hosts.md` and `finish-or-stop.md` no
longer offer or mention a background alternative.

**Proof.** `ci-claude-lifecycle.test.mjs`, `ci-claude-worker-loss-lifecycle.test.mjs`
and the `ci-host-hook-*.test.mjs` files pass through `scripts/test.sh`. The
consumer search `git grep -n -i "ci-background\|background handoff\|asyncRewake\|CI_BACKGROUND"`
outside the excluded records returns nothing. Run the guidance and payload
inventory checks that read the changed references (the
`Distribution/tests/skills/dough-execute-plan` and installation payload
scenarios that the consumer trace reaches).

## Concern evidence

Slice-plan refinement was not needed: two slices, each with one outcome and
proof loop, ordered so no interim state breaks an installation. This review
found no remaining slice-specific concern.

## Verification and delivery

- Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Apply [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) when
  changing selected tests.
- Use the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  on the removal: search the script names, `readBackgroundHandoff`,
  `asyncRewake`, `CI_BACKGROUND_HANDOFF` and the reference links.
- Changed guidance under `Distribution/src/skills/` is product code: apply
  [author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md).
- Local gate: the focused proof each slice names through `scripts/test.sh`.
  For a full run, follow the [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  and use `caffeinate -s -i` on AC power. Hosted CI runs the normal suites.
  Apply the ordinary post-change refactor, commit and publication gates.
