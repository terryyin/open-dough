# Dashboard multi-tool architecture review

**Identity:** SEED-069#review-dashboard-multi-tool-architecture
**Plan:** [PLAN.md](PLAN.md)
**Reviewed revision:** `6ac22ba8` for §§1–4 and `47ef4368` for §§5–6 and the
later sections (branch `claude/review-dashboard-architecture-before-adding-more`).
The dashboard code is the same at both revisions. All citations were rechecked at `1cdd476c` (a merge of `main` that changed launch-preparation, launch-record and terminal-panel files), and line numbers are given at `1cdd476c`.

This review traces a refinement launch and an execution launch, for Claude Code
and for Codex, from the dialog request through admission, preparation handoff,
workspace selection, recording, and failure or retry recovery (§§1–4). It then
traces observation, attention, the done mark, rename, stop, embedded terminal
attachment, and continuation (§§5–6). It reads server code
(`dashboard/server/`), browser code (`dashboard/src/`), and the browser specs
(`dashboard/tests/`). Paths below are relative to `dashboard/` unless they start
with `src/skills/` or `.planning/`.

The yardstick is the North Star rule that host-specific code stays in one module
per host behind `LaunchHost` (`server/launchHosts.ts:22-66`). Under ADR 0005,
nothing here claims how Cursor behaves. Each "consequence for Cursor" says what
a Cursor implementer would have to touch outside a Cursor host module.

Labels: **Confirmed** means the code was read and says so. **Question** means
evidence is still needed. Priority is **before Cursor** or **later**.

## Traced path

The two workflows and two hosts share one path. Host-specific steps are marked.

1. **Dialog.** `src/StartLaunch.tsx:88-90` keeps the selected host, which starts
   as `"claude"`. A kept start fixes the host (`:90`, `:163-170`).
   `src/LaunchHostModel.tsx:39-62` offers the hosts and models. The command
   preview is built at `src/StartLaunch.tsx:190-193`.
2. **Request.** `src/launchAttempts.ts:128-144` builds the request.
   `src/agentLaunchClient.ts:56-90` POSTs it and turns transport failures into
   host-worded uncertainty (`:44-54`).
3. **Admission.** `server/agentLaunchAdmission.ts:161-187` checks the schema,
   checks that the host exists (`:168-173`), refuses a Codex model (`:174-179`),
   reads the host's installed options (`server/launchOptions.ts:88`), and reads
   the session policy.
4. **Duplicate and creation gates (Codex only).**
   `server/agentLaunches.ts:143-152` refuses a duplicate in-flight launch.
   `:177-187` blocks on an unresolved creation.
5. **Preparation handoff.** `server/launchStart.ts:57-136` runs the workflow
   start (`server/startWorkflows.ts:99-142`). For execution this is
   `server/executionStart.ts:75-206`; for refinement it is
   `server/preparationStart.ts`. The start chooses the workspace
   (`server/startLaunch.ts:101-133`) and formats the handoff with the selected
   host's installed formatter (`server/executionStart.ts:209-228`,
   `server/preparationCommand.ts:96-116`).
6. **Native launch.** `server/launchRun.ts:34-51` calls `host.launch` for a new
   launch, or `host.recover` when first input is pending.
   - Claude: `server/hosts/claude/launch.ts:133-168`.
   - Codex: `server/hosts/codex/launch.ts:17-130`, or
     `server/hosts/codex/recovery.ts:28-153` for recovery.
7. **Recording.** `server/launchRun.ts:60-66` keeps Claude's record after the
   session is confirmed. Codex writes its record earlier, through
   `server/launchRecording.ts:19-57`, before its first input is sent
   (`server/hosts/codex/launch.ts:35`, `:65`, `:80`), and again once that
   input is accepted (`:86`).

## 1. Launch and preparation handoff

| Responsibility | Shared module(s) | `LaunchHost` operation | Claude Code | Codex |
| --- | --- | --- | --- | --- |
| Host dispatch | `server/launchHosts.ts:68-76` | lookup only | `server/claudeHost.ts:21-33` | `server/codexHost.ts:11-22` |
| Installed skill location | `server/launchHosts.ts:78-87`; callers `server/executionStart.ts:44-72`, `server/preparationCommand.ts:25-91`, `server/launchOptions.ts:34-39`, `server/launchSessionPolicy.ts:36-48` | `installedSkillPath` | `.claude/skills` (`server/claudeHost.ts:23-24`) | `.agents/skills` (`server/codexHost.ts:13-14`) |
| Workflow start and handoff text | `server/launchStart.ts:57-136`, `server/startWorkflows.ts:73-148`, `server/startLaunch.ts` | none (the installed formatter is chosen by host) | — | — |
| Native instruction | — | `launch` | `claudeInstruction`, `server/hosts/claude/launch.ts:34-49` | `codexInput`, `server/hosts/codex/input.ts:10-51` |
| Host and model choice | `src/LaunchHostModel.tsx`, `src/sessionCapabilities.ts:3-10`, `src/launchWorkflow.ts:107-122`, `server/agentLaunchAdmission.ts:168-179` | none | `--model` passed through (`server/hosts/claude/launch.ts:145`) | model refused at admission |
| Start capability offered to the dialog | `server/launchCatalog.ts:24-35`, `:109-122`, `src/launchOffers.ts:38-77` | `installedSkillPath` (indirect) | legacy host-less lists | `establishingHosts` rows |

### Findings

**L1-1 — The list of hosts is spelled in several places.** Confirmed.
- `server/launchHosts.ts:68-76` dispatches with a `claude`/`codex` ternary.
- `src/sessionCapabilities.ts:3` keeps a second list (`launchHosts`). The server
  uses it to loop over hosts (`server/launchCatalog.ts:46`, `:112`, `:129`;
  `server/agentLaunches.ts:237`).
- `src/sessionCapabilities.ts:4-10` maps names with a fallback: any host other
  than `claude` or `codex` is named "Cursor".
- `src/AgentAssignmentFacts.tsx:32-36` holds a third label table.
- `server/startGit.ts:40-50` spells the branch prefixes `claude/`, `codex/`, and
  `cursor/` by hand. The request schema accepts all of
  `agentHosts` (`src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs:81-83`).

*Consequence for Cursor:* the implementer must edit the dispatch, the
`launchHosts` list, and every per-host ternary in `src/sessionCapabilities.ts`.
The fallbacks already return a Cursor answer without any Cursor code, which
runs against ADR 0005.

*Improvement:* keep one host table in `src/sessionCapabilities.ts`, keyed by
`agentHosts`. It holds browser-safe facts: display name, skill sigil, offered
models, recovery hint, and capability flags. Change `server/launchHosts.ts` to
look hosts up in a `Partial<Record<host, LaunchHost>>` instead of a ternary.
Derive the refs in `server/startGit.ts` from `agentHosts`. Reuse the label
table in `src/AgentAssignmentFacts.tsx` or merge it into the host table.

*Priority:* **before Cursor**. This table is where L1-2, L1-4, F4-3, and S5-1 land.

**L1-2 — The model check at `agentLaunchAdmission.ts:174` is a native
difference that belongs behind the host boundary.** Confirmed.
- The shared request schema takes only Claude model aliases
  (`src/launchRequest.ts:36`, from `src/launchWorkflow.ts:107-122`, "The models
  a launch may ask Claude Code for").
- Codex is then refused by name, with Claude-specific wording
  (`server/agentLaunchAdmission.ts:174-179`).
- The dialog repeats the same rule (`src/LaunchHostModel.tsx:56`).
- Kept starts store the same Claude aliases (`server/startStore.ts:42`,
  `src/agentLaunch.ts:147`) and pass them to the start scripts
  (`server/executionStart.ts:165`, `server/preparationCommand.ts:56`).

Which models a host offers is a native fact. The current code expresses it as a
shared Claude vocabulary plus a Codex exclusion.

*Consequence for Cursor:* the implementer would extend the admission ternary,
the dialog ternary, and possibly the shared model enum.

*Improvement:* each host declares its offered models in the host table (L1-1).
Admission refuses any model that is not in the selected host's list. The dialog
lists the same entries. `launchModels` in `src/launchWorkflow.ts` becomes
Claude's entry.

*Priority:* **before Cursor**. Whether Cursor offers models is a Cursor
question.

**L1-3 — Start capability has a Claude-only legacy read path.** Confirmed.
- `src/launchOffers.ts:56-62` answers Claude from the host-less `establishing`
  and `establishingPreparation` lists.
- Every other host is answered from `establishingHosts` rows.
- The server builds the host-less lists by calling `establishes(project)` with
  no host (`server/launchCatalog.ts:29`, served from
  `server/agentLaunchPlugin.ts:132-133`). That relies on the hidden default
  `host = "claude"` (`server/executionStart.ts:64`,
  `server/preparationCommand.ts:83`).
- `server/launchCatalog.ts:109-122` already answers the same fact for every host.

So one shared rule is encoded twice, and the old encoding means Claude.

*Consequence for Cursor:* nothing to add, because Cursor takes the
`establishingHosts` path. A reader still has to know that the two paths should
agree.

*Improvement:* read `establishingHosts` for every host in
`src/launchOffers.ts`. Drop `establishing` and `establishingPreparation` from
`server/agentLaunches.ts:83-91`, `server/agentLaunchPlugin.ts:61-62` and
`:132-133`, and `src/agentLaunches.ts:68-69`.

*Priority:* **later**.

**L1-4 — The skill sigil is spelled in the dialog as well as in the host
modules.** Confirmed.
- `src/StartLaunch.tsx:191` previews `$skill` for Codex and `/skill` for
  everything else.
- The real instructions are built in `server/hosts/claude/launch.ts:43` and
  `server/hosts/codex/input.ts:30`.

*Consequence for Cursor:* the preview would silently show `/skill` until someone
edits `src/StartLaunch.tsx`.

*Improvement:* put the sigil in the host table (L1-1). Use it in the dialog and
in both host modules' instruction builders.

*Priority:* **before Cursor**. It is cheap, and otherwise the preview shows
`/skill` for any new host whether or not that host uses it.

**L1-5 — The pending words hard-code "Claude Code" and are rewritten by string
replacement.** Confirmed.
- `src/launchWorkflow.ts:43` and `:65` say "Starting … in Claude Code…".
- `src/StartLaunch.tsx:105-106` replaces the text "Claude Code" with
  `hostName(host)`.
- The comment at `src/launchWorkflow.ts:92` still says Claude Code launches the
  session.

*Consequence for Cursor:* none beyond `hostName`, as long as the text stays
literal. The design is fragile.

*Improvement:* make `pending` in `src/launchWorkflow.ts` a function of the host
name and call it from `src/StartLaunch.tsx`.

*Priority:* **later**.

### Retain decisions

**R1-1 — Preparation handoff is shared, and the host is chosen in one place.**
- The workflow start, the timeout, and the kept start are host-neutral
  (`server/launchStart.ts:57-136`, `server/startWorkflows.ts:99-148`).
- The script, formatter, and options files are found through
  `installedSkillPath(host, …)` (`server/launchHosts.ts:78-87`). Callers are
  `server/executionStart.ts:50`, `:67`, `:214-220`;
  `server/preparationCommand.ts:69`, `:86`, `:101-107`; and
  `server/launchOptions.ts:39`.
- The host is passed to the script as `--host`
  (`server/executionStart.ts:163-164`, `server/preparationCommand.ts:54-55`).
- Each host builds its own native instruction around the same formatted
  handoff (`server/hosts/claude/launch.ts:42-48`,
  `server/hosts/codex/input.ts:26-37`).

*Reason:* this is the split ADR 0005 asks for: shared logic once, plus small
per-host adapters.

**R1-2 — An unavailable host is refused, never replaced by another host.**
`server/agentLaunchAdmission.ts:168-173` refuses a host that `launchHost`
does not know, and `server/launchRun.ts:24-27` throws rather than substitute
one. `cursor`, which the schema accepts, is refused today.

*Reason:* matches `server/launchHosts.ts:1-2` and ADR 0005.

## 2. Workspace context

| Responsibility | Shared module(s) | `LaunchHost` operation | Claude Code | Codex |
| --- | --- | --- | --- | --- |
| Workspace and branch choice | `server/startLaunch.ts:97-133`, `server/launchWorkspace.ts:56-70`, `server/startGit.ts:36-53` | none | — | — |
| Default-checkout existing changes | `server/launchStart.ts:72-77` | none | — | — |
| Kept start pinned to its host | `server/startLaunch.ts:83-95`, `server/launchStart.ts:70-71`, `src/StartLaunch.tsx:90` | none | — | — |
| Where the session opens | passed as `established.workspace` (`server/hostLaunch.ts:114-118`) | `launch` | `startedIn`, `server/hosts/claude/launch.ts:140` | `workspace`, `server/hosts/codex/launch.ts:33` |
| Session workspace in the record | `start` and `preparation` facts (`src/launchRecord.ts:60-121`) | `launch` | not recorded for ad hoc launches | `continuation.workspace` (`server/hosts/codex/launch.ts:46-57`) |

### Findings

**W2-1 — Each host repeats "open in the established workspace, else the
project folder".** Confirmed. See `server/hosts/claude/launch.ts:140` and
`server/hosts/codex/launch.ts:33`. Recovery checks the saved workspace instead
(`server/hosts/codex/recovery.ts:48-55`).

*Consequence for Cursor:* the implementer must repeat the same fallback.

*Improvement:* resolve the workspace once in `server/launchRun.ts`. Pass it
through the `launch` signature (`server/launchHosts.ts:29-36`), keeping
`established` for the handoff only.

*Priority:* **later**.

**W2-2 — Shared helpers silently default the host to Claude.** Confirmed.
- `server/launchWorkspace.ts:60`, `server/launchOptions.ts:34`,
  `server/executionStart.ts:64`, `:212`, and
  `server/preparationCommand.ts:83`, `:99` all default `host = "claude"`.
- Only `server/launchCatalog.ts:29` relies on the default (see L1-3). Every
  other caller passes the host.

*Consequence for Cursor:* a new call site that forgets the host would quietly
use Claude's `.claude/skills` paths and the `claude/` branch prefix. That is
host substitution, which ADR 0005 forbids.

*Improvement:* make `host` a required parameter in these functions. This is a
type-only change that lands with L1-3.

*Priority:* **before Cursor**. It is cheap and guards against substitution.

**W2-3 — Only Codex records the session's workspace on the session.**
Confirmed.
- Codex writes `continuation.workspace` (`server/hosts/codex/launch.ts:46-57`).
- Claude keeps the workspace only in `start` or `preparation` facts. An ad hoc
  launch keeps none (`server/launchRun.ts:60-65`).
- The browser shows "Workspace" only when there is a continuation
  (`src/LaunchSession.tsx:21-25`).

*Consequence for Cursor:* the implementer must decide which of the two places
the workspace goes. Nothing shared states the rule.

*Improvement:* record the session's opened workspace as a common field through
`server/launchRecording.ts` and `server/launchRun.ts`. Keep `continuation` for
native arguments only.

*Priority:* **later**.

### Retain decisions

**R2-1 — Workspace choice and slug reservation are shared.**
- One rule names the workspace `.worktrees/<slug>` and the branch
  `<host>/<slug>` (`server/launchWorkspace.ts:56-70`).
- Slugs are reserved across every host's branches (`server/startGit.ts:34-53`).
- A kept start is resumed only with its own host (`server/startLaunch.ts:83-95`).

*Reason:* workspace selection belongs to the workflow, not the host. The only
host input is the branch prefix (but see L1-1 for its spelling).

**R2-2 — The default-checkout change check is shared.**
`server/launchStart.ts:72-77` runs it before any host code.

*Reason:* the check concerns the project, not the host.

## 3. Conversation identity and persistence

| Responsibility | Shared module(s) | `LaunchHost` operation | Claude Code | Codex |
| --- | --- | --- | --- | --- |
| Identity key | `src/sessionReference.ts:1-14` (`host:sessionId`) | none | — | — |
| Session schema | `src/launchRecord.ts:11-37` | none | `shortId` alias, required (`:27-35`) | `continuation` (`:17-25`) |
| Identity source | — | `launch` | printed short id, confirmed in the listing (`server/hosts/claude/launch.ts:156-167`) | `thread/start` id (`server/hosts/codex/launch.ts:38-59`) |
| Durable writes | `server/launchRecording.ts:19-57`, `server/launchRecordStore.ts`, `server/launchRun.ts:60-66` | `launch` receives `LaunchRecording` | written by `launchRun` after confirmation | written by the host before input (`server/hosts/codex/launch.ts:35`, `:65`) |
| Pre-identity creation evidence | `src/launchCreation.ts`, `server/launchRecordDocument.ts:31-34`, `server/launchRecordStore.ts:163-203` | `launch` (via `record.creating`) | not used | `server/hosts/codex/launch.ts:35`, `:108` |

### Findings

**I3-1 — The shared session schema carries each host's identity fields and a
Claude-only rule.** Confirmed.
- `src/launchRecord.ts:11-35` puts Claude's `shortId` and Codex's
  `continuation` (with `endpoint` and `args`) side by side as optional fields.
- A refinement requires `shortId` when `session.host === "claude"` (`:28`).
- `server/claudeHost.ts:14-19` checks the same thing again inside the host.

*Consequence for Cursor:* the implementer would add optional fields and
possibly another host-name refinement to the shared `src/launchRecord.ts`.

*Improvement:* turn `hostSessionSchema` in `src/launchRecord.ts` into a
`z.discriminatedUnion("host", …)`, with one variant per delivered host. Each
host's identity shape is then stated once, and the `:28` refinement goes away.

*Priority:* **before Cursor**. Where Cursor's identity shape goes is decided
here. Whether Cursor has a resumable id is a Cursor question.

**I3-2 — Creation evidence is shaped like Codex but kept in shared modules.**
Confirmed.
- The shared `creationSchema` has `workspace` and `endpoint`
  (`src/launchCreation.ts:6-10`).
- The same file builds a `codex resume --remote …` command (`:12-22`) and
  Codex recovery words (`:23-25`).
- `LaunchRecording.creating(workspace, endpoint)` has the same Codex shape
  (`server/launchRecording.ts:16`, `:46-52`).

*Consequence for Cursor:* if Cursor needs evidence from before its identity
exists, the implementer must reuse the Codex-shaped `endpoint` field or edit
`src/launchCreation.ts` and `server/launchRecording.ts`.

*Improvement:* let a creation record carry host-supplied continuation arguments,
the way `HostSession.continuation.args` already does (`src/launchRecord.ts:21`).
Then `src/launchCreation.ts` can format generic words with `hostName`. Lands
with F4-2.

*Priority:* **before Cursor**.

**I3-3 — Host-less stored starts, requests, and answers default to Claude.** Question.
- Several schemas default the host to `"claude"`: `src/agentLaunch.ts:146`,
  `:183`, `:188`; `server/startStore.ts:37`, `:124`; `src/doneMark.ts:25`;
  `src/deleteRecord.ts:24`; and attach admission
  (`server/agentLaunchAdmission.ts:226`).
- Only `server/startStore.ts:37`, `:124` and `src/agentLaunch.ts:146` (the
  kept-start schema) are stored records. `src/doneMark.ts:25`,
  `src/deleteRecord.ts:24` and `server/agentLaunchAdmission.ts:226` are
  requests. The offered-definition defaults (`src/agentLaunch.ts:183`, `:188`)
  are already unused by the current server (`server/launchCatalog.ts:61`,
  `:64`).
- `AGENT-LAUNCH.md:50` documents that older actions without a host address
  Claude only.

The defaults are deliberate compatibility. What is not known is whether any
host-less data or callers remain.

*Consequence for Cursor:* none. Cursor requests always carry a host.

*Improvement:* if no host-less records remain, remove the defaults from these
schemas.

*Priority:* **later**.

### Retain decisions

**R3-1 — Identity is host-qualified end to end.**
- `sessionKey` keys the store, done, delete, and attach lookups by host plus
  native id (`src/sessionReference.ts:12-14`, `server/launchRecordStore.ts:50`,
  `server/agentLaunchAdmission.ts:104-124`, which call `server/agentLaunches.ts:127`).
- Retries match on host as well (`src/launchRequest.ts:112-124`).

*Reason:* this is the single domain model ADR 0001 and ADR 0002 §3 ask for.

**R3-2 — Two write timings, one shared writer.**
- Claude's record is written after confirmation (`server/launchRun.ts:60-66`).
- Codex writes early through `LaunchRecording`
  (`server/hosts/codex/launch.ts:65-86`).
- `server/launchRun.ts:60` joins both through `evidence.retained`.

*Reason:* when a record can exist is a native difference: Claude's id appears
only after `--bg`, while a Codex thread exists before its first input. The
shared writer keeps the store rules, such as never recreating a deleted record
(`server/launchRecordStore.ts:135-159`), in one place.

## 4. Failure and retry recovery

| Responsibility | Shared module(s) | `LaunchHost` operation | Claude Code | Codex |
| --- | --- | --- | --- | --- |
| In-flight duplicate refusal | `server/agentLaunches.ts:143-152` | none (host-name gate) | not applied | applied |
| Unresolved creation blocks a retry | `server/agentLaunches.ts:177-187`, `server/launchRecordStore.ts:163-172` | none (host-name gate) | not applied | applied |
| Pending first-input retry | `server/agentLaunches.ts:188-198`, `server/launchRun.ts:34-51` | `recover` (optional) | absent, so the answer is uncertain | `server/hosts/codex/recovery.ts:28-153` |
| Native failure categories | `server/launchRun.ts:52-58` appends the start's published facts | `launch` | `server/hosts/claude/launch.ts:68-121` | `server/hosts/codex/launch.ts:89-128` |
| Start timeout and kept start | `server/launchStart.ts:21-31`, `:91-113`; `server/startStore.ts` | none | — | — |
| Browser transport uncertainty | `src/agentLaunchClient.ts:44-54` | none | `claude agents` hint | "native Codex conversations" hint |

### Findings

**F4-1 — The in-flight duplicate refusal at `agentLaunches.ts:144` is a shared
rule applied to only one host.** Confirmed.
- The check uses only host-neutral parts: `this.running` and `sameLaunch`
  (`server/agentLaunches.ts:143-146`, `src/launchRequest.ts:112-124`).
- Nothing in it is native to Codex.
- For Claude, a second identical launch is stopped only by the start gate
  (`server/startLaunch.ts:197-205`), which covers only workflows with an
  installed start, and by the disabled button on the same page
  (`src/StartLaunch.tsx:141`).
- So an ad hoc or start-less Claude launch requested twice, for example from
  two open pages, starts two sessions.

*Consequence for Cursor:* the implementer must decide whether to add `cursor`
to this name check.

*Improvement:* apply the guard to every host in `server/agentLaunches.ts`. If
Claude must stay unguarded, key the guard on a declared `LaunchHost` capability
instead of a host name.

*Priority:* **before Cursor**. Whether Claude should also be guarded is a
product decision for Terry.

**F4-2 — The creation reconciliation at `agentLaunches.ts:178` is a shared
rule gated by host name, and its words and command are native Codex text in
shared code.** Confirmed.
- The rule "an unresolved creation blocks a new launch" uses the shared store,
  and `creationOf` already matches on host (`server/launchRecordStore.ts:163-172`
  through `sameLaunch`).
- Removing the gate is not neutral, though. With an unreadable store,
  `creationOf` returns `"unreadable"` (`:167`). Claude launches would then be
  refused, where today they go ahead.
- The real condition is that a host needs durable evidence before native
  creation. Codex enforces this inside its own module
  (`server/hosts/codex/launch.ts:31-35`: the record is required at `:31-32`
  and `creating` is written at `:35`, before `thread/start` at `:39`).
- The recovery text names Codex in `server/agentLaunches.ts:185` and
  `src/launchCreation.ts:12-25`.

*Verdict:* the gate is a shared rule tied to one host by name. The words and
command are native knowledge that leaked out of the host module.

*Consequence for Cursor:* the implementer must edit the name check and, if
Cursor creates identity in stages, the Codex wording.

*Improvement:* move the check into `server/launchRecording.ts`, so that it
applies to any host that calls `creating`, or declare the need on `LaunchHost`.
Format the recovery words from host-supplied continuation arguments (I3-2).

*Priority:* **before Cursor**.

**F4-3 — The browser's "no trusted answer" hint is a two-way host branch that
gives Codex text to any other host.** Confirmed.
- `src/agentLaunchClient.ts:52` gives Claude "Check `claude agents`" and gives
  every other host "native Codex conversations".
- `src/agentLaunchClient.ts:44` copies the Claude sentence from
  `server/hosts/claude/launch.ts:68`.

*Consequence for Cursor:* Cursor users would be told to check Codex until this
file changes.

*Improvement:* add a per-host recovery hint to the host table in
`src/sessionCapabilities.ts` (L1-1). Use it here and in
`server/hosts/claude/launch.ts:68`.

*Priority:* **before Cursor**.

### Retain decisions

**R4-1 — The pending-input retry is host-neutral and uses an optional
operation.**
- `server/agentLaunches.ts:188-198` finds a record with unconfirmed first
  input.
- `server/launchRun.ts:44-51` calls `recover` only when the host supplies it,
  and otherwise answers uncertain.
- Claude records carry no `firstInput`, so this path never selects them.

*Reason:* this is the boundary's "absent operation is unavailable" rule
(`server/launchHosts.ts:1-2`). A host without `recover` gets the
uncertain answer with no host-specific code.

**R4-2 — Failure classification stays private to each host.**
- Claude's categories, such as not installed, untrusted folder, refused, and
  timed out, live in `server/hosts/claude/launch.ts:68-121`.
- Codex's live in `server/hosts/codex/launch.ts:89-128`.
- Shared code only adds the workflow's "published without session" sentence
  (`server/launchRun.ts:52-58`, `server/startWorkflows.ts:113-136`).

*Reason:* the categories are native. What shared code adds is about the
workflow, not the host.

**R4-3 — A kept start survives a failed session and stays with its host.**
`server/launchStart.ts:70-71`, `server/startLaunch.ts:83-95`, and
`server/launchRun.ts:67-70` (the start is removed only after a session is
recorded).

*Reason:* recovering the start belongs to the workflow, and pinning it to the
host prevents a cross-host takeover.

## 5. Native session observation and lifecycle

Traced path, for both hosts: the page and the alert loop read
`AgentLaunches.machineSessions` (`server/agentLaunches.ts:71-77`); done,
delete, and attach read one record through `stateOf` (`:113-119`). Both go
through `withStates` (`server/launchStates.ts:38-59`), which calls each host's
`sessions` once. The browser reads the normalized state through
`src/sessionShown.ts`. Mark as done runs `markSessionDone`
(`server/doneMarks.ts:14-62`): local intent first, then `rename`, detach,
and `stop`.

| Responsibility | Shared module(s) | `LaunchHost` operation | Claude Code | Codex |
| --- | --- | --- | --- | --- |
| Observation read, deadline, isolation | `server/launchStates.ts:9-59`, `server/agentLaunches.ts:71-77`, `:113-119` | `sessions` (optional) | one machine listing, `observeClaudeSessions` (`server/hosts/claude/runtime.ts:196-223`) | per saved endpoint, `codexSessions` (`server/hosts/codex/sessions.ts:104-165`) |
| Normalized state vocabulary | `sessionStateSchema`, `src/launchRecord.ts:166-190` | `sessions` returns it | `activityOf` (`server/hosts/claude/runtime.ts:133-150`) | `state` (`server/hosts/codex/sessions.ts:20-102`) |
| Reading, attention, counts | `src/sessionShown.ts:40-152` | none | — (default wording) | wording and alert branches by name (`:51`, `:55`, `:118`) |
| Alerts | `server/sessionAlerts.ts:85-161`, `alertReading` (`src/sessionShown.ts:111-131`) | none (reads `machineSessions`) | — | — |
| Mark as done | `server/doneMarks.ts:14-62`, admission `server/agentLaunchAdmission.ts:126-143`, `src/doneMark.ts:22-37` | `stop` required, `rename` optional | `claude stop <alias>` (`server/hosts/claude/runtime.ts:99-107`) | `turn/interrupt` of the in-progress turn (`server/hosts/codex/done.ts:49-84`) |
| Done rename | `doneSessionName` (`src/doneMark.ts:35-37`) | `rename` (gets a typing callback) | types `/rename` into the open attachment, waits for the listing (`server/hosts/claude/rename.ts:31-68`) | `thread/name/set` (`server/hosts/codex/done.ts:38-47`) |
| Delete record | `server/agentLaunchPlugin.ts:96-113`, `recordDeletable` (`src/launchRecord.ts:201-212`) | none | — | — |
| Browser done and terminal offers | `marksDone`, `embeddedTerminal` (`src/sessionCapabilities.ts:11-16`) | none (restates `stop`, `attach`) | listed by name | listed by name |
| Server shutdown | `server/agentLaunchPlugin.ts:196-200`, `server/agentLaunches.ts:231-238` | `close` (optional) | none | `closeCodexConnections` (`server/hosts/codex/conversation.ts:16-19`) |

### Findings

**S5-1 — The browser restates which hosts can mark done and attach, by host
name.** Confirmed.
- `src/sessionCapabilities.ts:11-16` answers `embeddedTerminal` and
  `marksDone` with `host === "claude" || host === "codex"`.
- The server decides the same facts from the optional operations:
  `server/agentLaunchAdmission.ts:139` (`stop`), `:234` (`attach`),
  `server/doneMarks.ts:21-24`, and `server/terminalAttachments.ts:45-49`.
- The browser flags gate every action: `src/LaunchSession.tsx:50`,
  `src/TerminalSplit.tsx:153`, `src/StartSession.tsx:91`,
`src/TerminalPanel.tsx:121`, and `src/sessionRecordActions.tsx:22`.

*Consequence for Cursor:* the implementer must edit both functions as well as
the host module. If the two lists disagree, the page offers an action the
server refuses, or hides one the server would admit.

*Improvement:* derive both flags from `launchHost(host)?.stop` and `?.attach`
on the server. Serve them per host in the sessions answer
(`server/agentLaunchPlugin.ts:126-139`, where `establishingHosts` already
travels), or hold them in the L1-1 host table with a check that the table
matches the operations. Then the two functions read that fact.

*Priority:* **before Cursor**. It lands with L1-1.

**S5-2 — The "unknown" reading is worded by host name, and any other host gets
Claude's words.** Confirmed.
- `src/sessionShown.ts:48-60`: Codex reads "Live observation unavailable" /
  "Continue this conversation in Codex". Every other host reads "State
  unknown" / "Claude Code's session list could not be read".

*Consequence for Cursor:* an unknown Cursor session would be explained as an
unreadable Claude Code list until someone edits `src/sessionShown.ts`.

*Improvement:* make one shared unknown reading in `src/sessionShown.ts`, worded
with `hostName(session.host)` (`src/sessionCapabilities.ts:4-10`). The two
current notes mean different things (an unreadable listing compared with a
conversation to continue elsewhere), so the shared wording is Terry's decision.

*Priority:* **before Cursor**. It is cheap, and otherwise the wrong host is
named.

**S5-3 — Whether an unrecognized state alerts depends on the host's name.**
Confirmed.
- `src/sessionShown.ts:117-122` suppresses the alert for a Codex
  `available`/`unknown` state. For Claude the same state alerts as "State not
  recognized" (`:83-92`, `:124-130`).
- Both behaviors are tested. `tests/session-alerts.spec.ts` "raises one for
  each other reading: … and not recognized" covers Claude.
  `tests/agent-launch-codex-observation-alerts.spec.ts` "… stay silent for
  unreadable or unrecognized states" covers Codex. Both passed in this review's
  run.
- What drives the difference is native. Codex puts a partial read failure in
  the same shape: "Codex's latest turn could not be read"
  (`server/hosts/codex/sessions.ts:99-101`), next to unrecognized statuses
  (`:57-60`, `:72-73`, `:93-97`). Claude uses the shape only for an
  unrecognized listing state (`server/hosts/claude/runtime.ts:147-148`,
  `:179-181`).
- `AGENT-LAUNCH.md:138` and `:148` state both rules.

*Verdict:* the shared rule is that unknown never alerts and unrecognized may.
That rule is applied by host name because the state vocabulary cannot say
"partly unread".

*Consequence for Cursor:* the implementer must decide whether Cursor's
unrecognized states alert, by editing `src/sessionShown.ts`. Otherwise they
fall under Claude's rule.

*Improvement:* say it in the vocabulary. Either Codex answers an unread latest
turn as `{ kind: "unknown" }` (`server/hosts/codex/sessions.ts:99-101`), or
`sessionStateSchema` (`src/launchRecord.ts:169-188`) gains one host-set field
that `alertReading` reads in place of the name. Whether Codex's unrecognized
statuses should then alert as Claude's do is a product decision for Terry.

*Priority:* **before Cursor**.

**S5-4 — Host operations take their timing and folder from unstated
conventions.** Confirmed.
- **Observation deadline.** Codex settles each endpoint at 9 seconds so that
  it beats the shared 10-second deadline
  (`server/hosts/codex/sessions.ts:111-116`, `server/launchStates.ts:9`,
  `:21-30`). If it misses, the shared race drops every observation for that
  host (`:23-27`).
- **Rename deadline.** `rename` has no signal (`server/launchHosts.ts:56-60`).
  Claude waits 5 seconds (`server/hosts/claude/rename.ts:9`, `:16-23`) and
  Codex 10 (`server/hosts/codex/done.ts:39`). `stop` gets the shared
  10-second signal (`server/doneMarks.ts:12`, `:51`).
- **Folder.** `sessions` receives the home folder for the page and alert reads
  (`server/agentLaunches.ts:71-77`, `server/projectFolders.ts:27-29`), but the
  project folder for done, delete, and attach (`server/agentLaunches.ts:113-119`).
  Claude runs its listing there (`server/hosts/claude/runtime.ts:35-39`).
  Codex ignores the folder (`server/codexHost.ts:17`).

*Consequence for Cursor:* the implementer has to read shared code to learn
its time budget. It cannot treat `folder` as the session's project.

*Improvement:* in `server/launchStates.ts`, give `sessions` a signal that aborts
before the hard expiry. Pass `rename` an `AbortSignal` from
`server/doneMarks.ts`, as `stop` already gets. State in the `LaunchHost` type
(`server/launchHosts.ts:43-65`) what `folder` means.

*Priority:* **later**.

**S5-5 — Shared comments still describe a Claude-only, host-less boundary.**
Confirmed.
- `server/agentLaunchPlugin.ts:8-12` says delete waits on "Claude Code's
  listing" and gives the terminal path as `?source=&session=`.
- `server/agentLaunchPlugin.ts:20-21` says a session "Claude Code no longer
  lists is refused before any `claude attach`".
- `src/agentTerminal.ts:3` gives `?source=<project id>&session=<session id>`.
  The page also sends `host` (`src/useAttachedTerminal.ts:15-20`).

*Consequence for Cursor:* the comments mislead about the shared contract.

*Improvement:* reword them in the first session-side change that touches these
files.

*Priority:* **later**.

### Retain decisions

**R5-1 — Observation is one shared, bounded, host-isolated read.**
- `server/launchStates.ts:38-59` groups records by host and calls each host's
  `sessions` once.
- A host with no `sessions`, a host that throws, and a host that overruns the
  deadline are each limited to that host's records, which read unknown
  (`:17-35`). An omitted target is unknown, never absent (`:53-58`).
- `tests/launch-observations.spec.ts` proves this with both real host objects
  substituted. It passed in this review's run.

*Reason:* this is the North Star rule that hosts reuse shared polling, and the
boundary's rule that an absent operation is unavailable
(`server/launchHosts.ts:1-2`).

**R5-2 — One state vocabulary, one reading, and one alert loop.**
- Each host maps its native state into `sessionStateSchema`
  (`src/launchRecord.ts:166-190`).
- Attention, labels, and counts are shared (`src/sessionShown.ts:28-38`,
  `:133-152`).
- The alert loop, its baseline, and its `osascript` call are host-neutral
  (`server/sessionAlerts.ts:118-155`).
- The host supplies only provenance text (`waitingFor`, `description`;
  `src/launchRecord.ts:182-184`, `server/hosts/codex/sessions.ts:66-68`).

*Reason:* this matches "Each host normalizes its native activity; common
presentation owns its user meaning". S5-2 and S5-3 are the two places where
presentation still reads the host's name.

**R5-3 — The done sequence is shared, and native operations stay with each
host.**
- Local intent is saved before any native call (`server/doneMarks.ts:25-28`).
- Each native operation is an attempt with a bounded diagnostic (`:29-38`,
  `:54-60`; `server/hostLaunch.ts:14-24`).
- `stop` is skipped only on confirmed absence (`:48-53`). This rule is shared,
  not Claude's.
- `rename` gets a typing callback and runs before detachment, because Claude
  renames through its open attachment (`:39-47`,
  `server/hosts/claude/rename.ts:41-48`). Codex ignores the callback
  (`server/hosts/codex/done.ts:38-47`).

*Reason:* the order serves the stricter host at no cost to the other. An
optional `rename` lets a host with no native rename keep the done name in the
record only.

**R5-4 — Delete record is host-neutral.**
`server/agentLaunchPlugin.ts:96-113` rereads state and deletes only
host-qualified evidence. `recordDeletable` (`src/launchRecord.ts:201-212`)
names no host.

*Reason:* deleting a record concerns the dashboard's evidence, not the host.

**R5-5 — Monitoring is passive, and shutdown detaches.**
- Codex observation is read-only (`server/hosts/codex/sessions.ts:1`).
- Closing a Codex client never interrupts a turn (`server/hosts/codex/rpc.ts:1-2`).
- On server close, every host's optional `close` runs
  (`server/agentLaunches.ts:231-238`, `server/hosts/codex/conversation.ts:16-19`).

*Reason:* this matches the North Star's "read-only monitoring must not resume a
conversation or take its interactive control". The host list used at `:237` is
L1-1's.

## 6. Continuation and terminal interaction

Traced path: Open terminal (`src/LaunchSession.tsx:50-62`) mounts
`src/TerminalPanel.tsx`. That mounts `useAttachedTerminal`
(`src/useAttachedTerminal.ts:32-159`), which opens
`/__agent-terminal?source&session&host`. Admission (`server/agentLaunchAdmission.ts:218-250`)
requires a kept record in an existing project folder, a host with `attach`,
and a state that `attachOpens` (`src/launchRecord.ts:194-196`).
`TerminalAttachments.connect` (`server/terminalAttachments.ts:41-127`) calls
`host.attach` and relays the PTY.

| Responsibility | Shared module(s) | `LaunchHost` operation | Claude Code | Codex |
| --- | --- | --- | --- | --- |
| Upgrade admission and refusal | `server/agentTerminals.ts:34-104`, `server/agentLaunchAdmission.ts:218-250` | `attach` presence | — | — |
| Native attach process | — | `attach` returns `{ pty, ready? }` | `claude attach <alias>` in the project folder (`server/hosts/claude/runtime.ts:84-95`, `server/claudeHost.ts:27-29`) | `codex resume --remote … --cd … --no-alt-screen <id>` in the saved workspace (`server/hosts/codex/terminal.ts:5-28`) |
| Wire protocol | `src/agentTerminal.ts:13-37` | none | — | — |
| PTY relay, resize, input | `server/terminalAttachments.ts:77-123`, `src/useAttachedTerminal.ts:50-145` | none | — | — |
| Readiness | `server/terminalAttachments.ts:65-76`, `:103-116`; screen evidence `src/useAttachedTerminal.ts:61-121` | `attach().ready` (optional) | absent: ready at once | composer cursor frame (`server/hosts/codex/terminal.ts:31-41`) |
| Done reopened by attaching | `server/terminalAttachments.ts:68-74` | none (timed by `ready`) | at attach start | after readiness |
| Detach and server close | `server/terminalAttachments.ts:129-168`, `server/agentTerminals.ts:114-122` | none | SIGHUP | SIGHUP |
| Typing into an attachment, ending attachments | `server/terminalAttachments.ts:142-161`, `server/agentTerminals.ts:106-112` | used by `rename` | `/rename` | unused |
| Continuation shown to the developer | `src/LaunchSession.tsx:21-49`, `shellCommand` (`src/sessionCapabilities.ts:17-19`) | `launch` supplies `continuation` | none | `continuation.args` (`server/hosts/codex/launch.ts:46-58`) |

### Findings

**T6-1 — Attach refusal says "Claude Code" for every host.** Confirmed.
- `server/agentLaunchAdmission.ts:240-243` refuses an unavailable session with
  "Claude Code no longer lists this session." The selected host is already looked up
six lines earlier (`launchHost(record.session.host)`, `:234`), and
  `server/terminalAttachments.ts:60` already uses `host.name`.
- Only the Claude path is tested (`tests/agent-terminal-boundary.spec.ts`
  "refuses an upgrade for a session Claude Code no longer lists, without
attaching", and `tests/agent-terminal-reopen.spec.ts` "keeps a done session Claude Code no longer lists done when its upgrade is refused").

*Consequence for Cursor:* an unavailable Cursor session would be refused in
Claude Code's name.

*Improvement:* word the refusal with the selected `LaunchHost`'s `name` in
`server/agentLaunchAdmission.ts`.

*Priority:* **before Cursor**. It is one line.

**T6-2 — The continuation display is labeled Codex, and its shape requires a
Codex endpoint.** Confirmed.
- `src/LaunchSession.tsx:21-29` shows "Continue in Codex" whenever any record
  has a `continuation`, whatever its host.
- The shared `continuation` requires `endpoint` (`src/launchRecord.ts:17-25`).
  Only Codex reads it (`server/hosts/codex/sessions.ts:147`,
  `server/hosts/codex/done.ts:20`, `server/hosts/codex/terminal.ts:8-10`).

*Consequence for Cursor:* if Cursor records a continuation command, the page
says "Continue in Codex", and the implementer must invent an `endpoint` or
edit the shared schema.

*Improvement:* label the line with `hostName(record.session.host)` in
`src/LaunchSession.tsx`. Move `endpoint` into the Codex variant of I3-1's
discriminated union. Keep `args` and `notice` shared, and put `workspace`
where W2-3 decides.

*Priority:* **before Cursor**. It lands with I3-1.

**T6-3 — Codex's resume command is spelled in three places.** Confirmed.
- `server/hosts/codex/launch.ts:49-57` records `continuation.args`.
- `server/hosts/codex/terminal.ts:11-21` spawns its own copy and adds
  `--no-alt-screen`.
- The shared `src/launchCreation.ts:12-22` builds a picker variant
  (`--include-non-interactive`).

*Consequence for Cursor:* none beyond I3-2, which already covers
`src/launchCreation.ts`.

*Improvement:* add one private builder in `server/hosts/codex/terminal.ts`,
used by `launch.ts` and the attach. The creation command follows I3-2.

*Priority:* **later**.

**T6-4 — A missing saved workspace fails attachment with generic words.**
Confirmed by reading the code. The cause was demonstrated by SEED-073's
investigation, and its recurrence is a question.
- Admission checks only the project folder
  (`server/agentLaunches.ts:132-135`).
- Codex spawns in `continuation.workspace` (`server/hosts/codex/terminal.ts:17-24`).
- An exit before readiness closes with 1011 and "Codex could not be attached"
  (`server/terminalAttachments.ts:86-95`). The page shows "The session could
  not be attached" with Reconnect (`src/useAttachedTerminal.ts:124-133`,
  `src/TerminalPanel.tsx:60-64`).
- SEED-073's preserved evidence (commit `ae224699`, the seed's last version before `a13ac883` removed it) reproduced the
  failure with a missing workspace. It found Reconnect cannot repair it, and
  recorded the remaining acceptance examples.

*Consequence for Cursor:* nothing shared states whether a session's workspace
must still exist when someone attaches. The implementer decides alone.

*Improvement:* once W2-3 records the session workspace as a common fact,
`admittedAttach` (`server/agentLaunchAdmission.ts:218-250`) checks it with
`folderExists` (`server/projectFolders.ts:31-37`). It then refuses with an
actionable explanation before spawning.

*Priority:* **later**. Terry closed SEED-073 without selecting a repair. The remaining acceptance examples in its last version (commit `ae224699`) are the natural story.

### Retain decisions

**R6-1 — The shared terminal transport is retained.** This is the decision the
plan requires.
- A host supplies only `{ pty, ready? }` (`server/launchHosts.ts:48-55`;
  `server/claudeHost.ts:27-29`; `server/hosts/codex/terminal.ts:5-43`).
- Everything else is shared, and names no host apart from the host-less attach default `"claude"` (`server/agentLaunchAdmission.ts:226`, I3-3) and the 410 wording (T6-1):
  - upgrade path, refusal, and origin check (`server/agentTerminals.ts:34-104`,
    `server/agentLaunchAdmission.ts:218-233`);
  - the wire protocol (`src/agentTerminal.ts:13-37`);
  - PTY relay, input, and resize (`server/terminalAttachments.ts:77-123`);
  - typing, newest-attachment choice, and ending by host-qualified key
    (`:142-161`);
  - the browser terminal and its endings (`src/useAttachedTerminal.ts`,
`src/TerminalPanel.tsx:60-64`).
- Both hosts pass through the same code. `tests/agent-terminal-boundary.spec.ts`
  covers Claude and `tests/agent-terminal-codex.spec.ts` covers Codex. Both
  passed in this review's run.

*Reason:* this matches the North Star's "Hosts reuse the shared … terminal
transport" and ADR 0005's minimal adapter. The `IPty` type in the boundary
(`server/launchHosts.ts:3`, `:53`) assumes an attachable CLI process. Whether
Cursor has one is a Cursor question (CQ-3).

**R6-2 — Detachment stays distinct from interruption.**
- Closing a socket, switching the panel, or closing the server sends SIGHUP
  to the client only (`server/terminalAttachments.ts:129-140`, `:163-168`;
  `server/agentTerminals.ts:114-122`).
- Native interruption happens only through `stop` from Mark as done
  (`server/doneMarks.ts:48-53`).

*Reason:* this is the North Star's "client detachment stays distinct from
explicit per-conversation interruption".

**R6-3 — Readiness is an optional host signal, and shared code times the done
reopen by it.**
- `server/terminalAttachments.ts:65-76` and `:103-116` keep a done mark until
  the host's `ready` accepts a rendered screen. The browser's evidence of a
  rendered screen is host-neutral (`src/useAttachedTerminal.ts:61-121`).
- An absent `ready` means ready at once. That is Claude's documented
  behavior, "Claude retains its immediate admitted-attachment behavior"
  (`AGENT-LAUNCH.md:175`), and `tests/agent-terminal-reopen.spec.ts` "reopens
  a session marked done once its attach starts" tests it.

*Reason:* when an attachment counts as ready is native. The shared code needs
only the predicate. Unlike other optional operations, an absent `ready` means
"ready at once", not "unavailable", so the implementer must choose it
deliberately (CQ-3).

**R6-4 — The continuation command is supplied by the host and shown by shared
code.**
- The host records `continuation.args` (`src/launchRecord.ts:21`,
  `server/hosts/codex/launch.ts:49-57`).
- The page shell-quotes it with the shared `shellCommand`
  (`src/sessionCapabilities.ts:17-19`, `src/LaunchSession.tsx:28`) and never
  runs it.

*Reason:* the host owns the native command, and shared code only displays it.
The label is T6-2's concern.

## Host-name grep coverage

The review ran
`grep -rnE '=== "codex"|=== "claude"|!== "codex"|!== "claude"' dashboard/server dashboard/src`
at `6ac22ba8`. It was rerun at `47ef4368` (the dashboard code is unchanged) and at `1cdd476c`, with the same 19 hits on the same lines.

| Hit | Disposition |
| --- | --- |
| `server/agentLaunches.ts:144` | F4-1 |
| `server/agentLaunches.ts:178` | F4-2 |
| `server/agentLaunchAdmission.ts:174` | L1-2 |
| `server/claudeHost.ts:15` | Retained. The host module checks its own session (I3-1 removes the need once the schema is per host). |
| `server/launchHosts.ts:71`, `:73` | L1-1 (the dispatch ternary) |
| `server/hosts/codex/terminal.ts:9` | R6-1. The check is inside the Codex host module. I3-1 and T6-2 make the type say it. |
| `src/sessionCapabilities.ts:5`, `:7` (`hostName`) | L1-1 |
| `src/sessionCapabilities.ts:12`, `:15` | S5-1 |
| `src/launchRecord.ts:28` | I3-1 |
| `src/agentLaunchClient.ts:52` | F4-3 |
| `src/launchOffers.ts:57` | L1-3 |
| `src/sessionShown.ts:51`, `:55` | S5-2 |
| `src/sessionShown.ts:118` | S5-3 |
| `src/LaunchHostModel.tsx:56` | L1-2 |
| `src/StartLaunch.tsx:191` | L1-4 |

The wider check (plan learning) ran
`grep -rnE '"claude"|"codex"' dashboard/server dashboard/src`, excluding
`dashboard/server/hosts/`, `claudeHost.ts`, and `codexHost.ts`, at `47ef4368` and again at `1cdd476c`.
It found 41 hits. The 17 hits from the table above that lie outside the excluded
files appear again, and every other hit is listed here:

- `server/launchWorkspace.ts:60`, `server/launchOptions.ts:34`,
  `server/executionStart.ts:64`, `:212`, `server/preparationCommand.ts:83`,
`:99`: W2-2.
- `server/agentLaunchAdmission.ts:226`, `server/startStore.ts:37`, `:124`,
  `src/agentLaunch.ts:146`, `:183`, `:188`, `src/doneMark.ts:25`,
  `src/deleteRecord.ts:24`: I3-3.
- `src/sessionCapabilities.ts:3` (`launchHosts`): L1-1.
- `src/launchCreation.ts:14`: I3-2 and F4-2 (with T6-3).
- `src/LaunchDialog.tsx:48`, `src/launchAttempts.ts:140`, `:153`,
  `src/launchOffers.ts:56`, `:63`, `src/optionsOffer.ts:28`: the browser side of
  W2-2. These are optional-parameter defaults to `"claude"`. Both dialogs pass
  `host` (`src/StartSession.tsx:80`, `src/StartLaunch.tsx:162`), so the defaults
  apply only when a caller omits the host. W2-2's improvement extends to them.
- `src/StartSession.tsx:41`, `src/StartLaunch.tsx:89`: no finding. These set the
  dialog's initial selection to Claude Code. The developer sees the choice and
  can change it (`src/LaunchHostModel.tsx:39-62`), so nothing is substituted.
  Which host is preselected is a product default.

Host words that neither pattern matches, found with
`grep -rn 'Claude Code\|Codex\|claude agents'` outside the host modules:

- `server/agentLaunchAdmission.ts:242`: T6-1.
- `src/LaunchSession.tsx:27`: T6-2.
- `src/sessionShown.ts:56-57`: S5-2.
- `server/agentLaunchPlugin.ts:9`, `:20`: S5-5.
- `server/agentLaunches.ts:185`, `src/launchCreation.ts:24`: F4-2 and I3-2.
- `src/agentLaunchClient.ts:44`: F4-3.
- `src/launchWorkflow.ts:43`, `:65`, `:92`, `src/StartLaunch.tsx:105-106`: L1-5.
- `src/launchWorkflow.ts:107-109`, `src/launchRequest.ts:131`,
  `src/LaunchHostModel.tsx:3`, `server/agentLaunchAdmission.ts:177`: L1-2.
- `src/AgentAssignmentFacts.tsx:33-34`: L1-1. Lines `:82` and `:118` are example
  text in comments.

## Test ownership

Families were classified from spec headers, titles, and fixture imports.
`tests/support/codexLaunch.ts` supplies the Codex protocol substitute, with
`codexTerminal.ts` and `codexObservation.ts` built on it. Claude specs use
`tests/support/fakeClaude.ts` through `tests/launchJourney.ts` and
`tests/agentLaunchBoundary.ts`. ADR 0005 asks that shared logic be tested once, with
each tool's differences tested on their own.

**1. Launch and preparation handoff.**
- *Shared, proven once:* the workflow start, kept start, and duplicate-start
  gate (`agent-launch-start*.spec.ts`, `agent-launch-preparation-*.spec.ts`
  without `codex`, `execution-start-result.spec.ts`,
  `preparation-start-result.spec.ts`, `start-store.spec.ts`).
- *Native:* the Claude instruction and `--bg` (`agent-launch-boundary.spec.ts`,
  `agent-launch-model-boundary.spec.ts`). The Codex input
  (`agent-launch-codex.spec.ts`, `agent-launch-ad-hoc-codex-input.spec.ts`).
- *Duplicated:* `agent-launch-start-codex.spec.ts` ("publishes one claim and
  retries its retained workspace") and `agent-launch-preparation-codex.spec.ts`
  ("refusal retains its published preparation") prove the shared start rules
  again through Codex.
- *Shared but proven for one host only:* none found for the handoff itself.

**2. Workspace context.**
- *Shared, once:* `launch-workspace.spec.ts` (slug, numbering, bounds).
- *Native:* its "Codex shares collisions across host branches" case (the branch
  prefix), and Codex's continuation workspace
  (`agent-launch-preparation-codex-continuation.spec.ts`).
- *One host only:* the card's Workspace line is proven for Claude's `start`
  and `preparation` facts (`agent-launch-preparation-workspace.spec.ts`). No
  spec proves a missing session workspace at attach (T6-4).

**3. Conversation identity and persistence.**
- *Shared:* host-qualified identity, proven in four places:
  `agent-launch-host-identity.spec.ts`, `agent-launch-codex.spec.ts` ("keeps
  equal IDs distinct"), `agent-terminal-done-codex-boundary.spec.ts` ("an equal
  Claude ID keeps its attachment"), and `launch-observations.spec.ts`
  (`same-native-id`). Each proves equal-ID separation for a different
  operation. The overlap is only in the fixtures.
- *Shared:* store rules (`agent-launch-records.spec.ts`, Claude only).
- *Native:* Codex early writes and creation evidence
  (`agent-launch-codex-creation.spec.ts`, `agent-launch-codex-confirmation.spec.ts`).

**4. Failure and retry recovery.**
- *Native, Claude:* failure categories (`agent-launch-boundary.spec.ts`,
  `agent-launch-ad-hoc-problems.spec.ts`, `agent-launch-card-problems.spec.ts`).
- *Native, Codex:* reconciliation (`agent-launch-codex-reconciliation.spec.ts`,
  `-recovery`, `agent-launch-ad-hoc-codex-recovery.spec.ts`,
  `agent-launch-preparation-codex-recovery.spec.ts`, `-retry`,
  `agent-launch-start-codex-recovery.spec.ts`).
- *One host only:* the in-flight duplicate refusal (F4-1) is proven only for
  Codex (`agent-launch-preparation-codex-recovery.spec.ts`). No spec shows a
  duplicate start-less Claude launch, which matches F4-1's finding that none
  is refused.
- *Named for one host:* the shared recording-failure rule is proven once,
  directly on `started()`, with a Codex request
  (`agent-launch-preparation-store-failure.spec.ts`). It sits beside the Codex
  family in name only.

**5. Native session observation and lifecycle.**
- *Shared, once:* the observation seam (`launch-observations.spec.ts`).
- *Native mapping:* Claude in `agent-launch-session-listing.spec.ts`, Codex in
  `agent-launch-codex-observation-status.spec.ts` and `-boundary`.
- *Duplicated:*
  - Presentation and counts: `agent-launch-card-session-states.spec.ts`,
    `agent-launch-recent-session-states.spec.ts`, and
    `session-sidebar-state-edge.spec.ts` (Claude), then again in
    `agent-launch-codex-observation.spec.ts` ("appear consistently on cards,
    Recent sessions and sidebar … with their attention counts"). Only the
    Codex wording (S5-2) justifies the second family.
  - The alert baseline and de-duplication: `session-alerts.spec.ts` (Claude),
    then `agent-launch-codex-observation-alerts.spec.ts`. Only S5-3's
    suppression is a Codex difference.
  - Done admission refusal: `agent-launch-done-refusal.spec.ts` (Claude) and
    `agent-launch-done-codex.spec.ts` "unrecorded and cross-origin done
    requests fail before native reads or writes".
- *Misplaced:* `agent-launch-done-codex-races.spec.ts` holds "shared Claude stop
  failure retains intent and current Working …", which substitutes `claude`.
- *One host only:*
  - "A late lifecycle or done failure cannot recreate a deleted record" is
    shared (`server/launchRecordStore.ts:135-159`), but only Codex specs prove
    it (`agent-launch-done-codex-intent.spec.ts`,
    `agent-launch-codex-lifetime.spec.ts`,
    `agent-launch-codex-observation-boundary.spec.ts`).
  - Delete record (`agent-launch-delete.spec.ts`,
    `agent-launch-card-delete*.spec.ts`, `agent-launch-recent-delete.spec.ts`)
    and the sidebar family (`session-sidebar*.spec.ts`) are proven only with
    Claude. That is acceptable, because the code names no host (R5-4).
- *Native done:* Claude `/rename` and listing (`agent-launch-done.spec.ts`,
  `agent-launch-done-stop.spec.ts`). Codex interrupt target
  (`agent-launch-done-codex-races.spec.ts`).

**6. Continuation and terminal interaction.**
- *Shared, once:* transport, HMR, and refusal (`agent-terminal-boundary.spec.ts`,
  Claude). Panel lifetime and reconnect (`agent-terminal-lifetime.spec.ts`).
  Done and delete from the panel (`agent-terminal-done.spec.ts`,
  `agent-terminal-delete.spec.ts`).
- *Native:* the Codex resume arguments and readiness
  (`agent-terminal-codex.spec.ts`, `agent-terminal-codex-page.spec.ts`).
  Claude's immediate reopen (`agent-terminal-reopen.spec.ts`,
  `agent-terminal-done-reopen.spec.ts`).
- *Duplicated:*
  - Server close: `agent-terminal-close.spec.ts` (Claude) and
    `agent-terminal-codex-close.spec.ts` (Codex).
  - Input, resize, SIGHUP detach, and the 404 and 403 refusals:
    `agent-terminal-codex.spec.ts`, its first case, repeats
    `agent-terminal-boundary.spec.ts`.
  - Keyboard, resize, and reconnect on the page:
    `agent-terminal-codex-page.spec.ts` repeats `agent-terminal-lifetime.spec.ts`.
- *One host only:*
  - Shared readiness gating (`server/terminalAttachments.ts:65-116`) is proven
    only through Codex, which is natural because only Codex supplies `ready`.
  - The 410 refusal of an unavailable session is proven only for Claude
    (T6-1).
  - The continuation display is proven only for Codex.
  - Panel header controls (`agent-terminal-avatar.spec.ts`,
    `agent-terminal-keyboard.spec.ts`, `agent-terminal-maximize.spec.ts`,
    added after `47ef4368`) are proven only with Claude, which is acceptable
    because the panel code names no host.

**TO-1 — Shared behavior that a host family proves again.** Confirmed by the
listings above.

*Consequence for Cursor:* an implementer who copies the Codex families would
add a third copy of the shared presentation, alert, done-refusal, and terminal
transport and close proofs.

*Improvement:* keep one host-neutral proof per shared rule, using whichever
substitute is cheaper. Trim the per-host families to native differences. Move
the misplaced Claude stop case into `agent-launch-done-stop.spec.ts`. Prove
the deleted-record rule once without Codex. Use `tests/dashboardTest.ts`
fixtures, with `codexLaunch.ts` only where Codex is native.

*Priority:* **later**. See the ranking for why it could move earlier.

## Cursor questions

These are open questions for the
[Cursor story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard).
Each needs native Cursor evidence. None is a finding, and none assumes an
answer.

- **CQ-1 (`sessions`, R5-1, S5-3).** Can Cursor's CLI list or read a recorded
  conversation's state without resuming it or taking interactive control?
  Can it tell confirmed absence from an unreadable answer? Which native states
  map to working, waiting (and with what reason), review, failed, interrupted,
  and awaiting instruction? Should an unrecognized state alert?
- **CQ-2 (identity, I3-1, R3-2, I3-2).** What identifier does Cursor return for
  a conversation, and when: before or after first input? Does it need a
  separate alias for attach or stop, as Claude does? Is there evidence to keep
  before identity exists?
- **CQ-3 (`attach`, R6-1, R6-3, T6-4).** Is there an interactive CLI process
  that attaches to an existing conversation through a PTY? What screen shows
  that the attachment is ready, if anything does? Does attaching depend on the
  original workspace still existing?
- **CQ-4 (detach, R6-2).** Does ending that client (SIGHUP) leave the
  conversation and its work running?
- **CQ-5 (`stop`, `rename`, R5-3).** Is there a native way to interrupt current
  work while keeping history, and to rename a conversation? Can either be
  confirmed?
- **CQ-6 (continuation, T6-2, R6-4).** What ordinary-terminal command continues
  a recorded conversation, and which recorded arguments does it need?
- **CQ-7 (`close`, S5-4).** Does the dashboard hold any native connection that
  must be released when the server closes? Does a listing depend on the
  folder it runs in?
- **CQ-8 (launch side, L1-2, L1-4, F4-3).** Which models can a launch select?
  How is a skill invoked (sigil)? What should the "no trusted answer" hint tell
  the developer to check?

## Limitations

- **Read-only method.** No native Claude, Codex, or Cursor process ran. Native
  behavior is known only from the code and the substitutes the specs encode,
  some pinned to observed versions (for example Codex 0.159.3,
  `server/hosts/codex/sessions.ts:25`, `server/hosts/codex/blank.ts:2`). At `47ef4368`, this
review ran only these existing unpaid specs: `launch-observations.spec.ts`,
  `session-alerts.spec.ts`, `agent-launch-codex-observation-alerts.spec.ts`
  (11 passed), and `agent-terminal-boundary.spec.ts`,
  `agent-terminal-codex.spec.ts`, `agent-terminal-close.spec.ts`,
  `agent-terminal-codex-close.spec.ts` (39 passed across dev and preview).
- **Codex attachment recovery (SEED-073).** SEED-073 was closed without
  repair at Terry's request. Commit `ae224699` preserved the investigation in
  the seed: a missing saved workspace reproduces the attachment failure, and
  Reconnect cannot repair it. That commit also added
  `docs/dashboard-session-troubleshooting.md`. Commit `a13ac883` ("Close
  terminal attachment investigation without repair") then removed the seed and
  its Taken entry from `.planning/PRODUCT-BACKLOG.md`. When the workspace was
  removed is still unconfirmed. This review assesses recovery only from code
  (T6-4). It does not establish whether other causes exist or how a
  retired-workspace conversation should be recovered.
- **Test classification** comes from headers, titles, and fixture imports, not
  from every assertion. A "duplicated" judgment means the same shared rule
  appears in both families. It does not mean the cases are identical.
- **Cursor.** Nothing here establishes how Cursor behaves (ADR 0005). Each
  "consequence for Cursor" names only the shared code an implementer would
  touch.
- **Wording.** S5-2 and the T6-1 and T6-2 labels need Terry's choice of shared
  wording.

## Maintained documentation and ADR verdict

`dashboard/AGENT-LAUNCH.md` was corrected to describe the current code. Line
numbers are the edited document's. No code changed.

- **Host boundary (`:45-50`).** Old: common code does not call another host's
  private helpers. New: still true for imports, but shared code branches on
  host name: dispatch and browser host names and flags
  (`server/launchHosts.ts:71-73`, `src/sessionCapabilities.ts:5-15`), the Codex
  model refusal (`server/agentLaunchAdmission.ts:174`,
  `src/LaunchHostModel.tsx:56`), the Codex-only gates
  (`server/agentLaunches.ts:144`, `:178`), the Claude alias rule
  (`src/launchRecord.ts:28`), and host wording in shared messages
  (`src/agentLaunchClient.ts:52`, `server/agentLaunchAdmission.ts:242`,
  `src/LaunchSession.tsx:27`). Covers L1-1, L1-2, I3-1, F4-1–F4-3, S5-1, T6-1,
  T6-2.
- **Normalized state (`:131-134`).** Old: host adapters normalize native state
  for shared presentation and alerts. New: adds that shared presentation still
  words the unknown reading and withholds the alert for an unrecognized Codex
  state by host name (`src/sessionShown.ts:51`, `:55`, `:118-122`; S5-2, S5-3).
  The alert rules at `:143` and `:153` are accurate and stay unchanged.
- **Attachment refusal (`:172-174`).** Old: "missing folder" is refused. New:
  a missing *project* folder is refused, a removed Codex workspace is not, with
  a link to `docs/dashboard-session-troubleshooting.md`
  (`server/agentLaunches.ts:132-135`, `server/hosts/codex/terminal.ts:17-24`;
  T6-4).
- **Done order (`:190-192`).** Old: save intent, close attachments, then
  rename and stop. New: save intent, rename, close attachments, then stop
  unless the session is confirmed unavailable (`server/doneMarks.ts:25-28`,
  `:39-47`, `:47`, `:48-53`; R5-3).
- **Claude done (`:195-196`).** Old: Claude retains `/rename`, listing
  confirmation, and its listed-or-unknown stop behavior. New: Claude types
  `/rename` into an open attachment, if any, and waits for the listing; the
  stop rule is the shared one above (`server/hosts/claude/rename.ts:29-67`,
  `server/doneMarks.ts:48-53`).

Checked and kept: the dispatch sentence (`:45`, `server/launchHosts.ts:68-76`);
host-qualified identity and Claude's alias (`:50-54`, R3-1, I3-1); host-less
actions addressing Claude (`:54`, I3-3); missing Codex endpoints never falling
back to Claude (`:100-101`); the per-host alert rules (`:143`, `:153`, which
the new `:132-134` sentence attributes to host name); Claude's immediate
attachment (`:182`, R6-3); and the shared transport (`:175-176`, R6-1).

**ADR verdict: no ADR change.** The host boundary concerns only the dashboard,
which no general-purpose agent relies on. ADR 0005 already governs it: minimal
adapters, shared logic tested once, and no inference of one tool's success from
another's. The findings apply that decision, and none changes it. Accepted ADRs
0001 and 0002 §3 are applied by R3-1 and are unchanged. Proposed ADR 0008's
local layer covers workspace activity and checkout refresh, and calls a launch
local evidence that never settles a story. No finding contradicts that wording;
host adapters and native session observation are below its level of detail.

## Ranking

Each item is a candidate story, and findings that share one improvement are
merged into one item. "Before Cursor" items change shared code that a Cursor
implementer would otherwise have to edit, or that would otherwise answer for
Cursor without Cursor evidence. "Later" items are coherence work that Cursor
does not depend on.

### Before Cursor

1. **One host description in place of host-name ternaries** (L1-1, L1-4,
   F4-3, S5-1).
   - *Change:* dispatch through a `Partial<Record<host, LaunchHost>>`. Keep one
     browser-safe host table with name, skill sigil, and "no trusted answer"
     hint. Derive the mark-done and terminal flags from `LaunchHost`'s
     optional operations. Derive the branch prefixes from `agentHosts`.
   - *Reuses:* `src/sessionCapabilities.ts`, `server/launchHosts.ts`, and the
     sessions answer in `server/agentLaunchPlugin.ts`.
   - *Why first:* items 2 and 6 build on it. It also removes the
     fallbacks that already answer "Cursor" or give Codex text to any other
     host.
2. **Host-neutral session words** (S5-2, T6-1, and T6-2's label).
   - *Change:* word the unknown reading, the attach refusal, and the
     continuation label with the host's name.
   - *Reuses:* `hostName` and `LaunchHost.name`, in `src/sessionShown.ts`,
     `server/agentLaunchAdmission.ts`, and `src/LaunchSession.tsx`. L1-5 can
     join if the story stays small.
   - *Why here:* it is cheap and visible. Otherwise a new host's sessions are
     explained in Claude's or Codex's name. The wording is Terry's choice.
3. **Required host parameters** (W2-2, including its browser side).
   - *Change:* remove the `host = "claude"` defaults from shared server and
     browser helpers.
   - *Reuses:* the existing signatures. This is a type-only change.
   - *Why here:* it is independent and cheap, and it stops silent substitution
     at any new call site.
4. **One schema variant per host** (I3-1, plus T6-2's `endpoint`).
   - *Change:* turn `hostSessionSchema` into a discriminated union by `host`,
     with `shortId` in Claude's variant and `endpoint` in Codex's.
   - *Reuses:* `src/launchRecord.ts`.
   - *Why here:* it decides where Cursor's identity and continuation go
     before Cursor adds optional fields to a shared shape.
5. **Alert meaning stated in the vocabulary** (S5-3).
   - *Change:* express "partly unread" or "do not alert" as a host-set fact,
     and drop the name check in `alertReading`.
   - *Reuses:* `sessionStateSchema` in `src/launchRecord.ts` and
     `server/hosts/codex/sessions.ts`.
   - *Why here:* otherwise Cursor's unrecognized states inherit Claude's
     alert rule. It needs Terry's decision on whether Codex's unrecognized
     states should alert.
6. **Host-declared models** (L1-2).
   - *Change:* each host lists its offered models. Admission and the dialog
     read that list.
   - *Reuses:* item 1's table, with `launchModels` in `src/launchWorkflow.ts`
     as Claude's entry.
   - *Why here:* it depends on item 1. Until it lands, Cursor would extend two
     ternaries and possibly the shared enum.
7. **Generic creation evidence and its reconciliation gate** (F4-2, I3-2).
   - *Change:* apply the unresolved-creation gate to any host that records
     creation. Carry host-supplied continuation arguments, and word the
     recovery with the host's name.
   - *Reuses:* `server/launchRecording.ts` and `src/launchCreation.ts`.
   - *Why here:* it matters only if Cursor creates identity in stages (CQ-2),
     so it comes after the cheaper items.
8. **Duplicate in-flight guard for every host** (F4-1).
   - *Change:* apply the `sameLaunch` guard to every host, or key it on a
     declared capability.
   - *Reuses:* `server/agentLaunches.ts`.
   - *Why last:* it is a behavior change for Claude, and whether Claude should
     be guarded is Terry's product decision. Until then, a Cursor implementer has only to
choose whether to join a name check.

### Later

9. **The session workspace as a checked common fact** (W2-3, T6-4).
   - *Change:* record the opened workspace on every session. Refuse an attach
     whose workspace is gone, with an actionable explanation.
   - *Reuses:* `server/launchRecording.ts`, `server/launchRun.ts`,
     `admittedAttach`, and `folderExists`.
   - *Why here:* it covers the remaining acceptance examples in SEED-073's last version (commit `ae224699`). It is first among
     "later" because it is the one item with a reproduced user-facing failure.
10. **Resolve the workspace once** (W2-1).
    - *Change:* pass the resolved workspace through `launch`.
    - *Reuses:* `server/launchRun.ts` and `server/launchHosts.ts`.
    - *Why here:* it removes a repeated fallback. It pairs naturally with
      item 9.
11. **Prove shared behavior once** (TO-1).
    - *Change:* consolidate the duplicated shared proofs into host-neutral
      specs. Keep per-host families for native differences.
    - *Reuses:* `tests/dashboardTest.ts` and the existing substitutes.
    - *Why here:* it improves feedback, and Cursor does not depend on it. It
      could move ahead of the Cursor story if Terry wants Cursor's spec family
      to start as native-only.
12. **Explicit operation timing and folder** (S5-4).
    - *Change:* add a shared observation margin and a rename signal, and state
      what `folder` means.
    - *Reuses:* `server/launchStates.ts`, `server/doneMarks.ts`, and
      `server/launchHosts.ts`.
    - *Why here:* nothing breaks today. It makes the contract readable.
13. **One start-capability read path and no host-less defaults** (L1-3,
    I3-3).
    - *Change:* read `establishingHosts` for every host, then drop the legacy
      lists and the defaults once no host-less data remains.
    - *Reuses:* `src/launchOffers.ts`, `server/launchCatalog.ts`, and the
      stored-start schemas.
    - *Why here:* it needs the I3-3 question answered first.
14. **One Codex resume builder** (T6-3).
    - *Change:* build the resume command in one private place.
    - *Reuses:* `server/hosts/codex/terminal.ts`.
    - *Why here:* it is Codex-internal.
15. **Pending words as a function of the host** (L1-5).
    - *Change:* make `pending` take the host's name.
    - *Reuses:* `src/launchWorkflow.ts`.
    - *Why here:* it works today, and only its form is fragile. It can join
      item 2.
16. **Shared comments match the boundary** (S5-5).
    - *Change:* reword the stale comments.
    - *Reuses:* the files themselves.
    - *Why last:* this is not a story on its own. It belongs with whichever
      session-side item first touches these files.
