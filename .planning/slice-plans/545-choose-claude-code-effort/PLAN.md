# Choose Claude Code effort when starting a session

**Source:** [Choose Claude Code effort when starting a session](../../seeds/SEED-280-choose-claude-code-effort.md#choose-claude-code-effort)
**Source review:** [source review](source-review.md)

**Identity:** SEED-280#choose-claude-code-effort

## Goal and scope

A developer starting a Claude Code session from the dashboard's Start
session, follow-up, or story workflow dialog can choose its reasoning effort:
"Use your Claude Code setting" (the default, sending nothing) or low, medium,
high, xhigh, or max. An explicit choice starts `claude --bg` with
`--effort <level>` for that session only; launch admission refuses any other
Claude Code effort before `claude` runs.

Exclusions, as the seed records: the feedback maintenance setting keeps its
Codex-only effort; Codex and Cursor effort behavior is unchanged; the
dashboard reports no effective effort; no Claude Code configuration is
written; attaching does not resend effort.

## Existing solution and current decisions

- PFE: reuse the shared Reasoning effort field
  (`dashboard/src/LaunchReasoningEffort.tsx`, `src/launchEffort.ts`,
  `src/LaunchHostModel.tsx`, `src/useLaunchSettings.ts`), which already
  serves Codex and Cursor from host options. Claude Code has no options
  catalog; its model aliases are static facts in `src/hostDescription.ts`.
  Add Claude Code's effort levels there beside its `models`, as a static
  host fact, and let the shared field read them for a host without a
  catalog. Do not add a Claude options catalog or `host-options` read.
- Claude's effort choices do not depend on Model. The field's default label
  and note name "your Claude Code setting"; there is no "Reading…" state or
  "cannot be verified" block for Claude.
- `LaunchDialog.tsx` already sends `effort` for Codex and Cursor; include
  Claude. `StartSession` and `StartLaunch` both render `LaunchDialog`, and
  follow-ups open the Start session dialog
  ([LAUNCH-FOLLOW-UP.md](../../../dashboard/LAUNCH-FOLLOW-UP.md)), so one
  dialog change reaches all three starts. Feedback maintenance keeps passing
  `effortHosts={["codex"]}`.
- `server/launchSettingsAdmission.ts` refuses effort for every host except
  Codex and Cursor. Admit a Claude effort only when it is one of the static
  levels, otherwise refuse with 400 naming the supported levels.
- `server/hosts/claude/runtime.ts` `startClaudeInBackground` adds
  `--effort <level>` after `--model` when the recorded request carries one;
  `launch.ts` passes `request.effort`. Retries and continuations reuse the
  recorded request, so they carry it like the model. `attachClaude` is
  unchanged.
- Update the Claude paragraphs of
  [AGENT-LAUNCH-HOSTS.md](../../../dashboard/AGENT-LAUNCH-HOSTS.md) and the
  effort paragraph of [AGENT-LAUNCH.md](../../../dashboard/AGENT-LAUNCH.md),
  and the comments at the top of `server/hosts/claude/launch.ts` and above
  `startClaudeInBackground`, which say no effort is passed.
- This follows the existing host-description pattern under
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md);
  no consequential new direction or North Star topic is warranted.

## Outside-in proof ownership

| Promise | Owner | Observable proof |
| --- | --- | --- |
| An explicit Claude effort starts the session with `--effort <level>` after `--model` and before the instruction, and the record keeps it | Slice 1 | New case in `dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts` asserting the fake `claude` argv and record. |
| The default sends no effort and the record has none | Slice 1 | Extend that spec's existing "passes no model" case to assert no `--effort`. |
| A Claude effort outside the levels is refused before `claude` runs | Slice 1 | New refusal case there: status 400, message naming the levels, no new `--bg` call. |
| The dialog offers "Use your Claude Code setting" plus the five levels for Claude Code, independent of Model, and starts with the chosen one; switching host clears it | Slice 1 | New case in `dashboard/tests/launches/agent-launch-model.spec.ts`: option texts, Start sends the effort (fake `claude` argv), host switch to Codex resets the field. |
| Codex, Cursor, and feedback-maintenance effort behavior is unchanged | Slice 1 | Run the existing families listed under Local gates. |

The native premise that `--effort` reaches a background session is settled
below; no paid native run is part of this plan.

## Ordered slices

### 1. Claude Code effort choice at session start
Type: Behavior
Status: done
Proof: the proof table rows above, plus the unchanged families under Local gates.

Behavior: Claude Code selected in a Start session, follow-up, or story
workflow dialog → choose high and Start → `claude --bg … --model <m>
--effort high <instruction>` runs and the record keeps `effort: "high"`;
the default sends no `--effort`; a request with `effort: "extreme"` is
refused before `claude` runs.

Execution (2026-11-09, story-branch `claude/choose-claude-code-effort-when-starting-a-sessio`,
published claim `8ad9f87d4`): accepted. Claude Code's levels are a static
`efforts` host fact in `src/hostDescription.ts`; `LaunchReasoningEffort` renders
a fixed-effort field for such a host. Proof: the two planned specs, the
continuation case in `backend-tests/launches/agent-launch-uncertain-continuation.spec.ts`
(the continued attempt carries the recorded `--effort max`), the Local gates
families, and the whole `tests/launches` plus `backend-tests/launches` run.
Learning: the new field joins the dialogs' tab order, so the two layout
specs' tab sequences and the Codex host-switch case (which asserted Claude had
no effort field) changed with it.

## Decisive premises

Observed on 2026-11-09 at `a25beb00a3332c24e088712bc6e322bbb4831ad4` in the
owned preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/choose-claude-code-effort-when-starting-a-sessio`.
Profile: macOS (Darwin 25.6.0), Node 24.21.0, Homebrew Bash, Chromium
153.0.8010.12 after `setup-native.mjs npm`, `browser`, and `check` (all exit 0),
Claude Code 2.1.319. Scratch edits were reverted before any record write.

| Premise and consuming operation | Observation | Result and remainder |
| --- | --- | --- |
| Claude Code accepts `--effort` with the five levels, and the flag reaches a `--bg` session | `claude --help`; then `claude --bg --name effort-probe-SEED-280 --effort low` in this checkout with no prompt (unpaid), `claude logs`, then `claude stop` and `claude rm`. | Help lists `--effort <level>` (low, medium, high, xhigh, max). The session screen read "Opus 5.5 with low effort" and "○ low · /effort". Settled for 2.1.319. |
| Claude Code's session listing cannot confirm effort | `claude agents --json --all` field names. | `cwd, id, kind, name, sessionId, startedAt, state`: no effort. The dashboard reports the request only, as the seed says. |
| The boundary route can carry and refuse Claude effort, and the planned case discriminates | E1: scratch runtime/launch/admission change plus a scratch case in the model boundary spec, run whole. F1: runtime and launch reverted, admission and case kept, case run alone. | E1 exit 0, 18 passed (5.9 s). F1 exit 1: argv lacked the two `--effort` elements. All scratch edits reverted; diff empty outside the seed. |

The per-model drop of an unsupported effort comes from Claude Code's bundled
text, not a run; it does not change what this plan sends or proves.

Literal consuming commands (from the checkout root):

```sh
# E1 and F1 (F1 adds -g "scratch")
PATH=/opt/homebrew/bin:$PATH env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts --reporter=list
```

## Local gates

Apply [test automation](../../../AGENTS.md#test-automation), the shared
[MakeMe API](../../../tests/README.md#test-data-architecture), and the
[failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. Launch requests here are inputs whose exact form is under test,
so they stay at the call site.

Run checks with Bash 5 first on `PATH` and
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`. The
maintained macOS sleep guard is `caffeinate -s -i` on AC power; on battery,
plug in or start fully awake with lid open under `caffeinate -i` and inspect
the sleep log afterwards, under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

Focused checks, because the change touches the shared effort field and
admission: `npm run typecheck:dashboard`; the two specs above; the Codex and
Cursor effort families (`tests/launches/agent-launch-codex-model.spec.ts`,
`tests/launches/agent-launch-cursor-model.spec.ts`,
`backend-tests/launches/agent-launch-codex-model-boundary.spec.ts`); and
feedback maintenance (`tests/configuration/system-settings-feedback-maintenance.spec.ts`,
`backend-tests/configuration/feedback-maintenance-boundary.spec.ts`). No
whole local suite is required; hosted CI runs it after publication. Run
`node scripts/lint.mjs --staged` before commits.

## Plan review

Slice-plan refinement was not needed: one outcome, one proof loop, and the
change stays inside the existing effort field, admission, and Claude runtime.
This review identified no remaining slice-specific concern.
