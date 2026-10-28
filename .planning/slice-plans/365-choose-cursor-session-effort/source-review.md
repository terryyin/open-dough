# Source review — SEED-160#choose-cursor-session-effort

**Launch:** Fresh general-purpose reviewer (Task), no conversation inheritance;
input was only the selected story Goal, Scope, Constraints, Deferred promises,
Key examples, Evaluation notes, and “Human amendments: none.” Reviewer read no
other project files.

**Returned commitments:** retained below from that reviewer’s numbered return.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer starting a Cursor session from the dashboard can see the supported reasoning-effort choices for the selected Cursor model in the existing start dialog. Qualification: Applies in the existing Cursor start dialog where Model is already offered (story, refinement, and ad hoc). Trigger: Key example 1. | slice 1 | observed: `dashboard/tests/cursorEffortDialogCases.ts` `a multi-effort Cursor model lists effort choices and Start sends the composed listed id` — after selecting `fixture-orb`, Reasoning effort options are `low` / `high` / `high-fast` |
| 2 | The developer can choose one of the supported reasoning-effort choices shown for the selected Cursor model. Qualification: Only when the selected model has listed effort variants. | slice 1 | observed: same test selects `high-fast` and Start proceeds |
| 3 | The new session starts with that chosen effort applied. Qualification: Applied by composing the matching listed model id and passing it as `--model` on the first Cursor client, reusing existing session-scoped model application. | slice 1 | observed: same test — first attach argv includes `--model fixture-orb-high-fast`; launch record keeps `{ model: "fixture-orb", effort: "high-fast" }` |
| 4 | Present Reasoning effort for Cursor when the selected model has listed effort variants. Qualification: Only for Cursor; only when the selected model has listed effort variants. Absent or empty when there are no separable effort variants. | slice 1 | observed: `dashboard/src/LaunchHostModel.tsx` `showEffort` for cursor only when selected model has efforts; multi-effort test shows control after `fixture-orb` and `toHaveCount(0)` before that |
| 4a.1 | Derive model offerings only from the live `cursor-agent models` catalog. | slice 1 | observed: `dashboard/server/hosts/cursor/options.ts` projects listed lines via `projectCursorModels`; live `cursor-agent models` in this checkout: 270 listed → 57 projected, 0 composition mismatches, 0 unreachable listed ids |
| 4a.2 | Derive effort offerings only from the live `cursor-agent models` catalog. | slice 1 | observed: `dashboard/server/hosts/cursor/modelIds.ts` `projectCursorModels` builds efforts only from listed ids; live check above |
| 4a.3 | Never invent an effort Cursor did not list. | slice 1 | observed: live check above (mismatch 0); admission refuses unsupported pairs in `Cursor effort admission refuses unsupported pairs…` |
| 5 | Starting with an explicit model and effort composes the matching listed model id and passes it as `--model` on the first Cursor client. Qualification: Composition must match a listed id from the live catalog; reuses existing session-scoped model application. Trigger: Key example 1. | slice 1 | observed: `composeCursorListedId` in `dashboard/server/hosts/cursor/launch.ts`; Playwright argv `--model fixture-orb-high-fast` / admission `--model fixture-orb-low` |
| 6 | Reuse the existing session-scoped model application for applying the composed `--model` at start. Exclusion: Do not change Cursor resume/attach to re-send `--model` beyond today’s session-scoped behavior. | slice 1 | observed: launch still scopes via `establishCursorSessionScope` and puts `--model` only on the first terminal client args; `resumeFlags` unchanged (no model); `dashboard/AGENT-LAUNCH-HOSTS.md` still states stored resume never carries it |
| 7.1 | Changing the selected model refreshes the effort choices. | slice 1 | observed: `dashboard/tests/cursorEffortDialogCases.ts` `switching Cursor model retains unsupported effort as invalid and blocks Start` — after switch to `fixture-luna`, medium becomes a valid choice for that model |
| 7.2 | Changing the selected model keeps an incompatible prior effort from being silently applied. Alternatives preserved: Start stays blocked or the effort is cleared. | slice 1 | observed: same case — effort value `high` retained with `aria-invalid`, Start disabled, “cannot be verified” (blocked alternative) |
| 8 | Default (your Cursor setting) still omits `--model` and offers no effort override. Trigger: Key example 3. | slice 1 | observed: existing Default proofs in `agent-launch-cursor-model.spec.ts` (`expectDefaultLaunchHasNoScope` / Default still starts); multi-effort test leaves effort control absent while Model is Default |
| 9 | Admission may accept `effort` for Cursor under those catalog rules. | slice 1 | observed: `dashboard/server/launchSettingsAdmission.ts` admits Cursor effort under catalog; admission test accepts `fixture-orb` + `low` |
| 9a | Claude and other non-Codex hosts stay without effort. | slice 1 | observed: admission still refuses effort unless host is `codex` or `cursor`; `LaunchHostModel` `effortHosts` defaults to codex+cursor only |
| 10 | When a listed Cursor id has no separable effort variants (bare or legacy id), Reasoning effort is absent or empty; Start still sends that exact listed id as `--model`. Alternatives: absent or empty. Trigger: Key example 4. | slice 1 | observed: projection yields `efforts: []` for bare-only groups (`modelIds.ts`); multi-effort test `toHaveCount(0)` for effort while Auto/GPT-5.2 selected; existing `execution on a Cursor-listed model…` still sends `--model gpt-5.2` |
| 11.1 | Reuse the shared launch request field already used for Codex effort where it fits. | slice 1 | observed: `LaunchDialog.tsx` sends shared `effort` for cursor; request retained on launch record |
| 11.2 | Reuse dialog patterns already used for Codex effort where they fit. | slice 1 | observed: shared `LaunchReasoningEffort` / `launchEfforts` / `effortBlocked` with Cursor-specific copy |
| 11.3 | Do not send Codex’s `model_reasoning_effort` config on Cursor. | slice 1 | observed: Cursor launch path composes `--model` only; no `model_reasoning_effort` in cursor host launch diff |
| 12 | When Cursor lists fast variants, offer them as distinct effort choices for that model (labeled from the native name), still composed into one listed id. Exclusion: Do not require a third Fast control. | slice 1 | observed: effort options include `high-fast — Fixture Orb High Fast`; composed `--model fixture-orb-high-fast` |
| E1 | Do not rely on unsupported bracket `--model` overrides. | slice 1 | observed: composition uses plain listed ids via `composeCursorListedId`; no bracket syntax |
| E2 | Do not change Cursor resume/attach to re-send `--model` beyond today’s session-scoped behavior. | slice 1 | observed: same as 6 |
| E3 | Do not require a third Fast control. | slice 1 | observed: same as 12 — fast is an effort choice |
| E4 | Do not send Codex’s `model_reasoning_effort` config on Cursor. | slice 1 | observed: same as 11.3 |
| E5 | Claude and other non-Codex hosts stay without effort. | slice 1 | observed: same as 9a |
| E6 | Never invent an effort Cursor did not list; offerings only from live `cursor-agent models`. | slice 1 | observed: same as 4a.1–4a.3 |
| E7 | Do not treat help-text bracket examples as a launch mechanism. | slice 1 | observed: same as E1 |

Deferred promises D1–D6 were not allocated as delivery commitments. Feedback-maintenance Cursor effort (D2) remains excluded via `FeedbackMaintenanceSettings` `effortHosts={["codex"]}`.
