# Choose the model when starting a session

## Source and authority

- **Identity:** SEED-052#choose-session-model
- **Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#choose-session-model)
  (Goal, Scope, Key examples, UI, Architecture, and Terry's choices of
  2026-09-30: Default plus Fable, Opus and Sonnet aliases, all three dialogs, a
  "requested" display, no remembered choice, one launch domain).
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

A developer starting a session from any launch dialog (Start execution, Start
refinement, Start session) can pick Default, Fable, Opus or Sonnet; the session
starts with `--model <alias>` (Default passes nothing), and its entry, wherever
listed, reads "Model: <Name> (requested)". Every dialog opens on Default.

Excluded (from the story): free-text or full model names, Haiku, effort or
permission choices, changing a running session's model, remembering the last
choice, showing the model Claude Code actually runs, Codex and Cursor.
Considered and excluded here: a model line in the terminal toolbar (the story
names entries, not the toolbar); a pre-launch availability check; parsing
Claude Code's stderr to classify an unusable model (decision 3).

## Direction followed

The story's Architecture and the North Star topic
[Launch domain (design not yet built)](../../../docs/dashboard-ux-ui-north-star.md#launch-domain-design-not-yet-built):
one launch domain, the model an option independent of the subject, each thing
spelled once. No Accepted ADR constrains it (ADR 0008 stays Proposed). The plan
follows the topic like this: the model table beside `launchWorkflows` (slice 1);
the optional model in the request part shared by both request kinds (slice 1);
one command builder in `claudeLaunch.ts` (slice 1); one launch-options value
handed by the one dialog component (slices 2-3); one reading of a record in
`launchSubject` (slice 4). Slice 5 retires the topic once the code explains it.

## PFE: what is reused

Everything below exists on trunk from the ad hoc story (reread at `a3f8b7ea`).

- **Request and record:** `agentLaunch.ts` `storyLaunchRequestSchema`,
  `adHocLaunchRequestSchema`, `agentLaunchRequestSchema`,
  `recordedLaunchRequestSchema`, and `launchRecordSchema`; `launchRecordStore.ts`
  keeps them unchanged in location and retention.
- **Command:** `server/claudeLaunch.ts` (`claudeInstruction`,
  `claudeSessionName`, `launchClaude`, `failedLaunch`) and
  `server/claudeCode.ts` `startClaudeInBackground`.
- **Dialog:** `LaunchDialog.tsx` (one modal, mounted only while open, so each
  opening starts fresh) and `useLaunchDialogLauncher`; `StartLaunch.tsx`,
  `StartSession.tsx` and `CardLaunches.tsx` are its callers.
- **Client:** `agentLaunches.ts` `start`, `startAdHoc`, `instructionOf`.
- **Reading a record:** `launchSubject` in `agentLaunch.ts`, read by
  `SessionEntry`, `SidebarEntry`, `TerminalPanel`, `TerminalSplit`.
- **Proof support:** `tests/agentLaunchBoundary.ts` (raw HTTP), `launchJourney.ts`,
  `launchCardPage.ts`, `dashboard.claudeLaunchCalls()`, `claudeScenario`.

## Current findings

1. Only two schemas, one client hook and one server function read a request's
   `instruction`; `model` follows the same path (`grep -rn "\.instruction\|instructionOf"
   dashboard/src dashboard/server`).
2. `adHocLaunchRequestSchema` is a `z.strictObject`, so a `model` field must be
   added to it explicitly.
3. `startClaudeInBackground` builds argv as `["--bg","--name",name,...instruction]`;
   the instruction is a positional and must stay last, so `--model <alias>`
   goes before it.
4. The fake `claude` reads only `--name` and records the rest of argv, so it
   accepts `--model` unchanged.
5. `LaunchDialog.onStart` takes `instruction: string` and `useAgentLaunches`
   `start`/`startAdHoc` take positional `instruction`, so a second option today
   means editing four callers; slice 2 removes that.

## Current decisions

1. **Alias table.** `launchModels` beside `launchWorkflows`:
   `fable`/Fable, `opus`/Opus, `sonnet`/Sonnet, in that order; Default is the
   absence of `model`. The schema enum, the dialog choices and the entry words
   read it; no other file spells an alias.
2. **`model` is optional in one shared request-options shape** spread into both
   request kinds; records kept before this change parse unchanged.
3. **An unusable model reads as the existing refusal, naming the model.**
   Claude Code's stderr for an unusable model is unobserved and observing it
   starts a paid session. The plan therefore does not parse stderr: when a
   model was requested, the existing "refused" explanation also names it
   ("... with model Opus"). A rejection that only appears after the session
   starts is covered by the entry's "(requested)" wording. The real behavior is
   recorded as a learning at the manual observation (slice 5).
4. **The model line appears only for a requested model.** Default requests
   nothing, so the entry says nothing.
5. **Nothing is remembered.** The dialog is mounted per opening, so the choice
   is component state and never leaves it.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| The ad hoc story's `launchSubject`, request union and shared `LaunchDialog` are on trunk | `git ls-tree origin/main dashboard/src/LaunchDialog.tsx`; reread of `agentLaunch.ts`, `agentLaunches.ts`, `claudeLaunch.ts`, `claudeCode.ts` at `a3f8b7ea` | **Holds** (2026-09-30): the story landed on trunk and the files match the PFE list. |
| Only the listed places read a request's instruction | `grep -rn "\.instruction\|instructionOf\|launchInstructionLimit" dashboard/src dashboard/server` in that worktree | Holds (findings 1) |
| Ad hoc schema rejects unknown fields | Read of `adHocLaunchRequestSchema` (`z.strictObject`) | Holds; finding 2 |
| The fake `claude` accepts extra argv and records it | `sed -n 165,215p dashboard/tests/fixtures/fake-claude`, `claudeLaunchCalls` use in `agent-launch-card.spec.ts:166` | Holds |
| Claude Code accepts `--model <alias>` with aliases `fable`, `opus`, `sonnet` | `claude --help` on this machine: "`--model <model>` ... alias ... e.g. 'fable', 'opus', or 'sonnet'" | Holds for the flag; whether `--bg` honors it is the manual observation in slice 5 |
| Claude Code's session listing reports no model | `claude agents --json --all`: entries carry `id, cwd, kind, startedAt, sessionId, name, state` only | Holds; hence "requested" wording |
| Sidebar, card and Recent entries all read a record through `launchSubject` | `grep -rn launchSubject dashboard/src` (SessionEntry, SidebarEntry, TerminalPanel, TerminalSplit) | Holds |
| Nothing but Playwright proves the dashboard; no unit runner | `dashboard/package` scripts: `test:dashboard`, `typecheck:dashboard` | Holds; boundary cases go in raw-HTTP specs |
| Real `claude --bg --model opus` starts an Opus session | Needs a paid session | **Probe:** slice 5's manual observation, developer-run; it stops nothing else |
| Plan numbering | `origin/main` plans end at 172 | 173 |

## Proof ownership

Local gates for every slice: the focused specs named, plus
`npm run typecheck:dashboard`. Nothing broader locally; CI runs the suite.

| Promise | Slice | Observation |
| --- | --- | --- |
| A chosen model adds `--model <alias>` before the instruction to the same `claude --bg --name ...`; Default adds nothing; story and ad hoc alike | 1 | `agent-launch-model-boundary.spec.ts` (raw HTTP, `claudeLaunchCalls`) |
| An alias outside the table, or a model on a non-Claude host, is refused before any `claude` runs | 1 | same spec |
| The record keeps the requested alias and older records still parse | 1 | same spec, `agent-launch-records.spec.ts` unchanged |
| A refused launch with a model names that model; none named without | 1 | same spec |
| Dialogs and launches behave exactly as before | 2 | `agent-launch-card.spec.ts`, `agent-launch-card-problems.spec.ts`, `agent-launch-ad-hoc.spec.ts` unedited and green |
| Every dialog offers Model: Default, Fable, Opus, Sonnet after the instruction, on Default each opening; choosing sends the alias; Cancel or Escape sends nothing | 3 | `agent-launch-model.spec.ts` |
| A refused launch with a model shows "Launch failed" beside its action, no entry | 3 | same spec |
| Entries on a card, in Recent sessions and in the sidebar read "Model: <Name> (requested)" for a requested model, nothing for Default, across reload | 4 | `agent-launch-model-entries.spec.ts` |
| Agent launch and the North Star state the delivered behavior; the North Star topic is gone | 5 | string check below |
| A real Opus launch runs Opus | 5 | manual observation, developer-run |

## Slices

### 1. The launch boundary starts a session on a chosen model
Type: Behavior
Status: done
Proof: `dashboard/tests/agent-launch-model-boundary.spec.ts`, beside
`agent-launch-ad-hoc-boundary.spec.ts`, over raw HTTP in dev and preview with the
synthetic `claude` (helpers in `agentLaunchBoundary.ts`), asserting
`claudeLaunchCalls`, the answered record and the machine's sessions.
- Story execution request with `model: "opus"` and instruction "go" → argv
  `["--bg","--name","Open Dough · Execution · <title>","--model","opus","/dough-execute-plan <identity>\n\ngo"]`.
- Ad hoc request with `model: "sonnet"` and no text → argv
  `["--bg","--name","Open Dough · Ad hoc · <time label>","--model","sonnet"]`.
- No `model` → argv exactly as today for both kinds
  (`agent-launch-boundary.spec.ts`, `agent-launch-ad-hoc-boundary.spec.ts`
  pass unedited).
- The answered record's request carries `model`; `GET` lists it; a record kept
  in the earlier shape is still answered (`agent-launch-records.spec.ts`
  unedited).
- `model: "haiku"`, `"gpt"`, an empty string, or a non-string → 400 before any
  `claude` (`claudeCalls` empty); host not Claude Code with a model → 400.
- Scenario `refused` with `model: "opus"` → `failed`/`refused` whose
  explanation names Opus; without a model the explanation is unchanged.

Behavior: recorded project folder, request with a model → session started,
confirmed in Claude Code's listing, record kept with the alias. Adds
`launchModels` (alias, name, order) beside `launchWorkflows`, an optional
`model` in one shared options shape spread into the story and ad hoc request
schemas, `startClaudeInBackground` taking `{instruction, model}` and
`launchClaude` naming the model in the refusal, `--model <alias>` built in that
one place.

### 2. A launch dialog hands its caller one launch-options value
Type: Structure
Status: done
Proof: unchanged behavior. `agent-launch-card.spec.ts`,
`agent-launch-card-problems.spec.ts`, `agent-launch-ad-hoc.spec.ts`,
`agent-launch-ad-hoc-terminal.spec.ts` pass unedited and
`npm run typecheck:dashboard` is clean.

Internal change: `LaunchDialog`'s `onStart` takes a launch-options value
(`{instruction}`) instead of `instruction: string`, and `useAgentLaunches`
`start` and `startAdHoc` take it too, with `instructionOf` becoming the one
place that turns the value into the request's optional fields. `StartLaunch`,
`StartSession`, `CardLaunches` and `App` pass it through. Enables slice 3: the
model joins that value and that component, not each caller.

### 3. A developer chooses the model in every launch dialog
Type: Behavior
Status: planned
Proof: `dashboard/tests/agent-launch-model.spec.ts` with the launch journey and
`dashboard.claudeLaunchCalls()`, plus the ad hoc page helpers.
- Start refinement → dialog shows "Model" after the instruction field, choices
  "Default (your Claude Code setting)", "Fable", "Opus", "Sonnet" on Default;
  choose Opus, Start → argv carries `--model opus`; the same for Start
  execution and, with Sonnet, Start session.
- Default left unchanged → argv has no `--model`.
- Fable chosen, Cancel or Escape, reopen any dialog → nothing started, dialog
  on Default. Opus launched, then the same dialog again → Default.
- Tab order: instruction field, Model, Start, Cancel; keyboard still starts in
  the text field.
- Scenario `refused` with Opus → "Launch failed" beside the action, dialog
  closed, no entry.

Behavior: dialog open → developer picks a model and Starts → the launch request
carries it. Adds the native "Model" control to `LaunchDialog`, its value in the
launch-options value, and its forwarding in `useAgentLaunches`; choices read
`launchModels`.

### 4. A session entry says which model was requested
Type: Behavior
Status: planned
Proof: `dashboard/tests/agent-launch-model-entries.spec.ts`.
- Launch a story session with Opus → its card entry, its Recent sessions entry
  and its sidebar entry each read "Model: Opus (requested)".
- Launch with Default → none of them has a model line.
- Ad hoc launch with Sonnet → its Recent sessions and sidebar entries read
  "Model: Sonnet (requested)".
- Reload the page → the lines remain.

Behavior: recorded launch with a model → every entry lists what was asked, not
what runs. Adds the model words to `launchSubject` and renders them in
`SessionEntry` and `SidebarEntry`.

### 5. The enduring documents state the choice and the design topic retires
Type: Behavior
Status: planned
Proof: string check that `dashboard/AGENT-LAUNCH.md` no longer says launches
pass no model, states the choices, the `--model` argument, Default, the
"requested" line and that nothing is remembered; that the North Star's launch
row names the Model choice and no "Launch domain (design not yet built)"
heading remains; `grep -rn "launch-domain-design" docs dashboard` finds nothing; typecheck and the dashboard README/tests guide agree with the
delivered words. Manual, developer-run and paid, so no other slice waits on
it: launch with Opus and confirm in the session's terminal that it runs Opus;
record what Claude Code says for an unusable model as a learning here.

Behavior: reader of the dashboard's documents → finds the delivered launch
model choice described once, in delivered words. Updates AGENT-LAUNCH.md and
the North Star, removes the topic, and keeps the seed's Goal and Scope only
(planning wrap-up owns that closure).

## Learnings

- With `exactOptionalPropertyTypes` on, `startClaudeInBackground`'s options type
  spells `T | undefined` instead of using `?` fields.
- `LaunchChoices` derives from the request's `instruction` field with
  `NonNullable<...>`; `Required<Pick<...>>` kept `| undefined` and failed
  the typecheck.

## Accepted proof

- Slice 1: `npx playwright test --config dashboard/playwright.config.ts
  dashboard/tests/agent-launch-model-boundary.spec.ts
  dashboard/tests/agent-launch-boundary.spec.ts
  dashboard/tests/agent-launch-ad-hoc-boundary.spec.ts
  dashboard/tests/agent-launch-records.spec.ts --reporter=line` → 73 passed
  (raw HTTP in dev and preview, synthetic `claude`, `claudeLaunchCalls`);
  `npm run typecheck:dashboard` clean. The three existing specs are unedited.
- Slice 2: `npx playwright test --config dashboard/playwright.config.ts
  dashboard/tests/agent-launch-card.spec.ts
  dashboard/tests/agent-launch-card-problems.spec.ts
  dashboard/tests/agent-launch-ad-hoc.spec.ts
  dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts --reporter=line` → 18
  passed, specs unedited (browser, launch requests intercepted, no real
  `claude`); `npm run typecheck:dashboard` clean.
