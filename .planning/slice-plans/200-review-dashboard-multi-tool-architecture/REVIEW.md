# Dashboard multi-tool architecture review

**Identity:** SEED-069#review-dashboard-multi-tool-architecture
**Plan:** [PLAN.md](PLAN.md)
**Reviewed revision:** `6ac22ba8` (branch `claude/review-dashboard-architecture-before-adding-more`)

This review traces a refinement launch and an execution launch, for Claude Code
and for Codex, from the dialog request through admission, preparation handoff,
workspace selection, recording, and failure or retry recovery. It reads server
code (`dashboard/server/`) and browser code (`dashboard/src/`). Paths below are
relative to `dashboard/` unless they start with `src/skills/` or `.planning/`.

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
   start (`server/startWorkflows.ts:98-141`). For execution this is
   `server/executionStart.ts:75-206`; for refinement it is
   `server/preparationStart.ts`. The start chooses the workspace
   (`server/startLaunch.ts:101-133`) and formats the handoff with the selected
   host's installed formatter (`server/executionStart.ts:209-228`,
   `server/preparationCommand.ts:55-70`).
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
| Installed skill location | `server/launchHosts.ts:78-87`; callers `server/executionStart.ts:44-72`, `server/preparationCommand.ts:21-50`, `server/launchOptions.ts:34-39`, `server/launchSessionPolicy.ts:33-40` | `installedSkillPath` | `.claude/skills` (`server/claudeHost.ts:23-24`) | `.agents/skills` (`server/codexHost.ts:13-14`) |
| Workflow start and handoff text | `server/launchStart.ts:57-136`, `server/startWorkflows.ts:72-147`, `server/startLaunch.ts` | none (the installed formatter is chosen by host) | — | — |
| Native instruction | — | `launch` | `claudeInstruction`, `server/hosts/claude/launch.ts:34-49` | `codexInput`, `server/hosts/codex/input.ts:10-51` |
| Host and model choice | `src/LaunchHostModel.tsx`, `src/sessionCapabilities.ts:3-10`, `src/launchWorkflow.ts:107-122`, `server/agentLaunchAdmission.ts:168-179` | none | `--model` passed through (`server/hosts/claude/launch.ts:145`) | model refused at admission |
| Start capability offered to the dialog | `server/launchCatalog.ts:24-35`, `:111-124`, `src/launchOffers.ts:38-77` | `installedSkillPath` (indirect) | legacy host-less lists | `establishingHosts` rows |

### Findings

**L1-1 — The list of hosts is spelled in several places.** Confirmed.
- `server/launchHosts.ts:68-76` dispatches with a `claude`/`codex` ternary.
- `src/sessionCapabilities.ts:3` keeps a second list (`launchHosts`). The server
  uses it to loop over hosts (`server/launchCatalog.ts:46`, `:114`, `:131`;
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

*Priority:* **before Cursor**. This table is where L1-2, L1-4, and L4-3 land.

**L1-2 — The model check at `agentLaunchAdmission.ts:174` is a native
difference that belongs behind the host boundary.** Confirmed.
- The shared request schema takes only Claude model aliases
  (`src/launchRequest.ts:35`, from `src/launchWorkflow.ts:107-122`, "The models
  a launch may ask Claude Code for").
- Codex is then refused by name, with Claude-specific wording
  (`server/agentLaunchAdmission.ts:174-179`).
- The dialog repeats the same rule (`src/LaunchHostModel.tsx:56`).
- Kept starts store the same Claude aliases (`server/startStore.ts:42`,
  `src/agentLaunch.ts:147`) and pass them to the start scripts
  (`server/executionStart.ts:165`, `server/preparationStart.ts:201`).

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
  `server/preparationCommand.ts:42`).
- `server/launchCatalog.ts:111-124` already answers the same fact for every host.

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
  (`server/launchStart.ts:57-136`, `server/startWorkflows.ts:98-147`).
- The script, formatter, and options files are found through
  `installedSkillPath(host, …)` (`server/launchHosts.ts:78-87`). Callers are
  `server/executionStart.ts:50`, `:67`, `:214-220`;
  `server/preparationCommand.ts:28`, `:45`, `:60-66`; and
  `server/launchOptions.ts:39`.
- The host is passed to the script as `--host`
  (`server/executionStart.ts:163-164`, `server/preparationStart.ts:199-200`).
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
  `server/preparationCommand.ts:42`, `:58` all default `host = "claude"`.
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
- Retries match on host as well (`src/launchRequest.ts:115-127`).

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
  (`server/agentLaunches.ts:143-146`, `src/launchRequest.ts:115-127`).
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
  (`server/launchRun.ts:52-58`, `server/startWorkflows.ts:112-135`).

*Reason:* the categories are native. What shared code adds is about the
workflow, not the host.

**R4-3 — A kept start survives a failed session and stays with its host.**
`server/launchStart.ts:70-71`, `server/startLaunch.ts:83-95`, and
`server/launchRun.ts:67-70` (the start is removed only after a session is
recorded).

*Reason:* recovering the start belongs to the workflow, and pinning it to the
host prevents a cross-host takeover.

## Host-name grep coverage

The review ran
`grep -rnE '=== "codex"|=== "claude"|!== "codex"|!== "claude"' dashboard/server dashboard/src`
at `6ac22ba8`.

| Hit | Disposition |
| --- | --- |
| `server/agentLaunches.ts:144` | F4-1 |
| `server/agentLaunches.ts:178` | F4-2 |
| `server/agentLaunchAdmission.ts:174` | L1-2 |
| `server/claudeHost.ts:15` | Retained. The host module checks its own session (I3-1 removes the need once the schema is per host). |
| `server/launchHosts.ts:71`, `:73` | L1-1 (the dispatch ternary) |
| `server/hosts/codex/terminal.ts:9` | Retained. The check is inside the Codex host module. Terminal detail is deferred to slice 2. |
| `src/sessionCapabilities.ts:5`, `:7` (`hostName`) | L1-1 |
| `src/sessionCapabilities.ts:12`, `:15` | Deferred to session-side |
| `src/launchRecord.ts:28` | I3-1 |
| `src/agentLaunchClient.ts:52` | F4-3 |
| `src/launchOffers.ts:57` | L1-3 |
| `src/sessionShown.ts:51`, `:55`, `:118` | Deferred to session-side |
| `src/LaunchHostModel.tsx:56` | L1-2 |
| `src/StartLaunch.tsx:191` | L1-4 |

Host literals the grep pattern misses, found by a wider search and covered here:

- `= "claude"` defaults: W2-2 and I3-3.
- `server/startGit.ts:44-50`: L1-1.
- `src/launchCreation.ts:12-25`: I3-2.
- `src/launchWorkflow.ts:43`, `:65`: L1-5.

**Deferred to session-side (slice 2):**
- `src/sessionCapabilities.ts:11-16` (`embeddedTerminal`, `marksDone`).
- `src/sessionShown.ts:51`, `:55`, `:118`.
- `src/LaunchSession.tsx:21-29` ("Continue in Codex", keyed on whether a
  continuation exists rather than on the host).
- `server/agentLaunchAdmission.ts:242`. Attach refusal says "Claude Code no
  longer lists this session" for every host.
- `server/hosts/codex/terminal.ts:9`.

## 5. Native session observation and lifecycle (slice 2)

## 6. Continuation and terminal interaction (slice 2)

## Test ownership (slice 2)

## Cursor questions (slice 2)

## Limitations (slice 2)

## Ranking (slice 2)
