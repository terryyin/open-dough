# Show and keep the effort a Claude Code launch runs with

**Identity:** SEED-388#show-the-effort-a-launch-runs-with
**Source:** [Show and keep the effort a Claude Code launch runs with](../../seeds/SEED-388-measure-and-control-agent-launch-cost.md#show-the-effort-a-launch-runs-with)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Every Claude Code session the dashboard starts runs at an effort Open Dough
names before it starts: `medium` unless the developer chooses another level.
The story section owns the scope, decision, deferred promises and key
examples; this plan adds none.

Assumptions: Codex and Cursor effort behavior is unchanged; no Claude Code
configuration is read or written; records kept before this change are not
rewritten.

## Existing solution and direction

PFE result: the effort choice and its passing already exist; this story
changes their default and naming.

- `dashboard/src/hostDescription.ts` — Claude Code's fixed `efforts`. Add the
  host's default effort and the measured relative-cost words beside it, so the
  dialog, the server default and the feedback maintenance status read one
  description.
- `dashboard/server/agentLaunchAccept.ts` `acceptLaunchRequest` — the one
  point every launch reaches before its attempt and record are kept: the
  dialog's HTTP admission (`agentLaunchAdmission.ts`), story starts, and
  feedback maintenance (`feedbackMaintenanceCheck.ts` calls
  `AgentLaunches.accept` directly). A Claude Code request with no effort is
  given the host's default there, so the record keeps what was passed.
- `dashboard/src/LaunchReasoningEffort.tsx` `FixedReasoningEffort` — the
  Claude Code selector; `dashboard/src/useLaunchSettings.ts` resets effort to
  `""` on host change and fresh opening.
- `dashboard/src/launchWorkflow.ts` `launchSubject` — the record's requested
  model and options words consumed by `SessionDetails.tsx` and
  `SessionEntry.tsx`.
- `dashboard/src/FeedbackMaintenanceSettings.tsx` `describe` — the status line.

[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
machine-local configuration stays the developer's; passing a flag per session
writes none. No North Star topic is needed.

## Current decisions

- The default is applied on the server at `acceptLaunchRequest`, not only in
  the dialog, so feedback maintenance and any other caller get it.
- A continued or retried attempt keeps its recorded request: an attempt
  recorded before this change, without effort, continues without one.
- Relative-cost words: high and xhigh "about 3× medium's cost", max "about 7×
  medium's cost"; `medium` reads "Open Dough default"; `low` carries no figure.
  Exact wording is settled in slice 2 within these figures.

## Proof ownership

The [November effort baseline](../../seeds/SEED-388-measure-and-control-agent-launch-cost.md#show-the-effort-a-launch-runs-with)
measured median Opus slice-agent cost of 0.47M weighted input-token equivalents
at medium (193 agents), 1.53M at high (54), 1.55M at xhigh (9), and 3.35M
at max (20). The sample spans different stories and supports approximate
cost labels. It supplies no estimate for low.

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| Default launch passes `--effort medium` and its record keeps it | 1: `dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts` — the "passes no model or effort" case becomes "passes Open Dough's default effort when none is chosen": story and ad hoc argv contain `--effort medium` after any model, and `record.request.effort` is `medium` |
| A chosen effort is still passed as chosen | 1: same spec's existing "chosen effort" case stays green |
| Feedback maintenance on Claude Code runs at the default | 1: `dashboard/backend-tests/launches/feedback-maintenance-launch.spec.ts` asserts the launch argv holds `--effort medium` |
| User-level `high` no longer applies | 1: follows from the passed flag (premise below); no product reading of settings |
| Dialog opens on `medium`, no "Use your Claude Code setting", cost words before Start | 2: `dashboard/frontend-tests/launches/agent-launch-model.spec.ts` — Claude Code options read low, medium (Open Dough default), high, xhigh, max with their cost words; opening, Cancel/reopen and switching back from Codex all show `medium`; choosing `max` shows its words in the feedback line |
| Session details name the requested effort; older records show none | 3: `dashboard/frontend-tests/launches/agent-launch-model-entries.spec.ts` — a record with `effort: "max"` shows "Effort: max (requested)" in Session details; a record without effort shows no effort line |
| Feedback maintenance status names the effort | 4: `e2e/configuration/system-settings-feedback-maintenance.spec.ts` — On for Claude Code reads "…, medium effort"; a Codex choice without effort keeps its current words |
| Maintained words | 1: `dashboard/server/hosts/claude/launch.ts` and `runtime.ts` headers; 2: `dashboard/AGENT-LAUNCH.md` effort paragraph; 3: `dashboard/AGENT-LAUNCH-SESSION-ENTRIES.md`; 4: `dashboard/FEEDBACK-MAINTENANCE.md` |

Consumers of the server default, found by the scratch run below, are updated
in slice 1 to expect `--effort medium` in their exact argv or record:
`agent-launch-acceptance.spec.ts` (2 cases), `agent-launch-ad-hoc-boundary`,
`agent-launch-boundary`, `agent-launch-model-boundary`,
`agent-launch-options-boundary`, `agent-launch-options-groups`,
`agent-launch-start-taken-refused`, `agent-launch-start` (all under
`dashboard/backend-tests/launches/`). Frontend consumers of the dialog's
empty Claude Code value: `agent-launch-model.spec.ts` and
`agent-launch-native-effort.spec.ts` (switch to Claude Code expects `""`).

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| Every Claude Code launch, including feedback maintenance, passes through `acceptLaunchRequest` before its argv and record | Slice 1 default placement | 2026-11-16, this workspace at `dc391a69a` with the integration `node_modules` linked: scratch line at the top of `acceptLaunchRequest` giving Claude Code requests without effort `effort: "medium"`, then `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/backend.playwright.config.ts --reporter=line --max-failures=0 launches/` → 319 passed, 9 failed, each on exact argv or record now holding `--effort medium` (list above). A scratch assertion in `dashboard/tests/support/feedbackMaintenanceServer.ts` `launchedInput` showed the feedback maintenance argv `["--bg", "--name", "Open Dough · Ad hoc · Feedback maintenance", "--model", "opus", "--effort", "medium", …]`. Both scratch edits reverted. |
| An explicit `--effort` overrides the user-level Claude Code setting | Example "User-level high" | Retained: `~/.open-dough/dashboard/agent-launches.json` records a refinement launch on Fable with `effort: "high"`; its transcript `3d5ebf4f-…` (first response 2026-11-15T08:41Z) records `"effort":"high"` on every response, while `~/.claude/settings.json` (modified 2026-11-15T03:21Z) sets Fable's `modelSettings` effort `medium`. Proxy note: the user-level value there was `medium`, not `high`; the flag wins over the setting regardless of its value, so the difference cannot change the outcome. |
| Subagents run at the session's effort | Example "User-level high" (subagents) | Retained: session `5f2ce866-…` (2026-11-09) ran `max`; all 11 subagent transcripts record only `"effort":"max"`. |

## Concerns

Slice-plan refinement was not needed: one server default (slice 1) and three
surfaces naming the effort (slices 2–4), each with its own proof loop and no
special-case model. Slice 1 changes nine existing specs' expected argv; that
is mechanical but counts toward its 15 minutes. This review found no
remaining slice-specific concern.

## Ordered slices

Each slice targets 15 active minutes. Before changing tests, apply MakeMe and
page-object selection (AGENTS.md) and the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Local gate for each slice: the named specs,
`npm run typecheck:dashboard` and `npm run lint`; the full launch backend
directory runs in slice 1 because the default reaches every launch. Start
fully awake and wrap long or full runs on AC power in `caffeinate -s -i`
([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)).

### 1. A Claude Code launch with no chosen effort runs at Open Dough's default
Type: Behavior
Status: done
Proof: slice 1 rows above;
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/backend.playwright.config.ts --reporter=list launches/`.

Behavior: a Claude Code launch request (dialog, story start or feedback
maintenance) with no effort → `claude --bg` receives `--effort medium` and the
launch record keeps `effort: "medium"`; a chosen effort is passed unchanged;
Codex and Cursor requests are untouched.

Learning: the default is applied after the submitted and retained-attempt
answers, so continuations keep their recorded request. Beyond the planned
`launches/` consumers, about 20 specs in `backend-tests/sessions/`, shared
support and `e2e/` assert exact Claude argv or kept starts; all were updated
and run (backend `launches/` 374, `sessions/`+related 256, e2e 54 passed).
Serial-mode files hid a second failure the scratch count missed. Active time
about 21 minutes, over target on those mechanical consumers.

### 2. The launch dialog opens Claude Code on medium and names the cost of higher levels
Type: Behavior
Status: planned
Proof: slice 2 row above, plus `agent-launch-native-effort.spec.ts`,
`agent-launch-dialog-layout.spec.ts` and
`agent-launch-start-session-layout.spec.ts` under
`dashboard/frontend.playwright.config.ts`.

Behavior: opening Start session, Start execution or Start refinement on
Claude Code, or switching back to it → Reasoning effort shows `medium` as Open
Dough's default and offers no "Use your Claude Code setting"; high, xhigh and
max name their relative cost; Start sends the shown level.

### 3. Session details name the effort a session was started with
Type: Behavior
Status: planned
Proof: slice 3 row above, plus `dashboard/frontend-tests/sessions/compact-session-entry.spec.ts`.

Behavior: a launch record with an effort → Session details read "Effort:
<level> (requested)" beside the requested model; a record without effort
shows no effort line.

### 4. Feedback maintenance names the effort its Claude Code sessions run with
Type: Behavior
Status: planned
Proof: slice 4 row above.

Behavior: feedback maintenance On for Claude Code with no saved effort → the
status line names `medium effort`, the host default slice 1 passes.
