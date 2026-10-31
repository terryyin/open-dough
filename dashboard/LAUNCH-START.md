# Dashboard launch start

How a story launch establishes its start before the native session, recovers
it, and applies the dialog's Session choices. [Agent launch](AGENT-LAUNCH.md)
owns the rest of the launch contract.

[Launch editing by touch](LAUNCH-TOUCH.md) describes viewport changes and input.

## Mechanical start and recovery

The selected installed skill establishes a start only when it ships both its
start script and its handoff formatter. Otherwise it launches in the project
without a claim/announcement or workspace. Capability follows the selected
installation, not a workflow-specific host ban. The dialog describes the
published Take or Preparing announcement and `.worktrees` workspace only after
that capability is read; pressing Start authorizes the described publication.

The existing skill script, never dashboard reimplementation, establishes the
start before a native session. Execution runs `execution-start.mjs start` with
integration/workspace/branch/identity, stable machine/project publisher, story
branch mode, origin/target, push/workspace authority, selected host and optional
model. Refinement runs `preparation-assignment.mjs start` with the corresponding
preparation inputs. Each uses its selected installation's own formatter once.
Shared launch choices, installed capability/definition/options readers,
workspace selection and formatters require callers to supply the host explicitly.
The dialog's initial Claude Code choice and host-less external request and
stored-record compatibility defaults remain at their boundaries.
The workspace is `<project>/.worktrees/<title slug>`, independent of native host
worktree features; the branch uses that host's namespace from
`src/hostDescription.ts` (`claude/`, `codex/`, or `cursor/`). Slugs are
lowercase hyphenated words, accents removed, at most 48 characters, `story` for
no usable words (`session` for a session with no story), and numbered when
workspace folders or any known host namespace collide. The same descriptions
supply collision lookup for `claude/`, `codex/`, and `cursor/`.

Start runs only when origin is the catalog repository and the story has no
unresolved [launch attempt](AGENT-LAUNCH-STARTUP.md)
on this machine. Progress is registered synchronously before running: preparing,
then launching. Another request for the story, in either workflow, is refused
without a second start. Every page reads those local phases, but the card stays
where origin places it. Across servers the installed script owns
claim/assignment conflict and publication; refusals name origin's owner when
readable.

`execution-starts.json` and `refinement-starts.json` beside launch records retain
one start per project/story/workflow before the script runs: host, selected
model, workspace, branch, time, and execution publisher. Missing predecessor
host means Claude. Retry preserves the claim host/model; another host is refused.
A kept-start dialog names that context and resumes with its host. Claude may
request a different session model, recorded separately from the claim model.
Execution records retain established start or recovery SHAs; refinement
retains its preparation. A stopped start that could have committed/published,
or gave no readable result, is retained with workspace/branch and recovery.
A stop that made no assignment removes its record; refinement also removes
only the workspace/branch that attempt created.

The start wait is a warning threshold (two minutes by default,
`DOUGH_START_TIMEOUT_MS` for tests). Crossing it notes `slowSince` on the
attempt, which stays unsettled and owned while the script runs; time alone
never aborts the script or settles the attempt. A second start is refused and
Continue starts nothing while it runs. When the script finishes, its answer
proceeds normally: a refusal stops, or an established start records its receipt
and launches one native session automatically, without a manual continuation.

A published receipt must be retained in
`~/.open-dough/dashboard/launch-attempts.json` before the native session.
If recording it fails, the attempt answers `failed`/`unrecorded`: publication
succeeded, with the known agent and workspace, but the receipt could not be
recorded in that file. No native session starts. The kept start, workspace,
branch and assignment remain; repair the file and Continue to keep the receipt
and launch once through the installed command's `existing` or `continue`
answer. Other failed attempt notes remain answered from memory while the file
keeps its earlier conservative state; a restart reads that interrupted state.

Continuing an interrupted or failed attempt from Startup recovery, or a kept
start's Start, resumes the kept workspace/branch, publisher/model and recovery,
yielding existing/resumed execution or continued preparation instead of a
second publication. An execution interrupted before its result is retained
uses workspace HEAD/parent only on its kept branch; the installed script
validates the isolated claim or refuses it.

Refinement retry uses the installed command's `continue` operation. It verifies
the retained workspace, branch and exact allocation on fetched origin before
continuing. A missing workspace or inconsistent ownership keeps the saved start
and published assignment, names the known agent/workspace, and asks for
reconciliation. Repeating retry creates no replacement workspace, announcement
or native conversation. An older installed command that cannot verify
continuation also stops safely. A start with an uncertain announcement result
stays uncertain; a new announcement is allowed only after the installed command
explicitly verified that its earlier announcement was not accepted.

A published start followed by native refusal keeps recovery and explains
“Taken by <Agent>” or “Preparing as <Agent>; no session started”, with workspace.
Its card offers Start with “Started here, no session yet”; the dialog explains
that the publication is already established. The kept start is removed only
when a durable launch record carries those established facts. Records display
the established workspace without making it a story fact.

## Session choices

A story dialog's Session group stays in view, never behind a disclosure, with
labeled radio groups. Tracking is Standard or One-shot (“One-shot creates no
published assignment.”). Standard keeps its workflow's own workspace and
publication, so Workspace and After checks appear only for One-shot, which
starts from Isolated workspace and Wait for review. Workspace offers Isolated
workspace or Default main; After checks offers Wait for review or
Automatically land. A one-shot dialog's line beside Start names the choices
(`Default main · One-shot · Wait for review`), that no assignment is published,
and whether its result waits for review or lands, which Start then authorizes.
Command details say where the session runs and show the policy's flags after
the identity, before any options.

The policy's values and flags are the shared definition in the installed
`dough-execute-plan/scripts/session-policy.mjs`, which the dashboard imports
from source (`src/launchRequest.ts`); requests, start records and launch records
keep the semantic `policy`, never flags, and an absent policy is standard.
Flags are rendered only where a command is written: the start script's
arguments and the native command line (`/<skill> <identity> --one-shot
[--default-main] [--auto-land] <options>`). One-shot is offered only when the
selected host's installation starts the workflow and ships that policy (the
machine answer's `sessionPolicies`); otherwise the radio is disabled with why,
and a one-shot choice left from another host disables Start. The boundary
refuses before any start or native call a one-shot policy the installation
cannot take, and Default main or Automatically land without one-shot.

A one-shot execution runs `execution-start.mjs start --one-shot` with workspace
authority, adding `--push-authorized` only for Automatically land and no
publisher. A one-shot refinement runs `preparation-assignment.mjs start
--one-shot`. Default main passes the project folder as the workspace on the
target branch, with no integration checkout. The start publishes nothing; its
`prepared` receipt becomes the established context (`tracking: "one-shot"`,
workspace and its `role`, branch, remote/target, `landing`,
`startingRevision`), which the installed formatter writes as the instruction's
block and the record keeps. It names no agent, so nothing says Taken or
Preparing. A kept one-shot start shows its policy and resumes as it was,
whatever the reopened dialog would choose; once established, it reuses its
context without rerunning the start. One-shot execution's kept start stays on
the Backlog card.

### Start session

The shared launch dialog's Attach images control is the same on Start session
as on story starts: images leave the browser only with Start, are copied under
`~/.open-dough/dashboard/launch-attachments/<attempt>/` (never into a
repository or workspace), and appear in the first input as the shared
developer-part path list after the typed text. See [Agent launch](AGENT-LAUNCH.md).

The project row's Start session offers the same Session group with two
choices and no Tracking: Workspace (Isolated workspace or Default main) and
After checks (Wait for review or Automatically land), in the story dialogs'
words. A session with no story has nothing to track at launch; a workflow
invoked in it later carries its own tracking. No selection is Default main ·
Wait for review, a stated default rather than an inference from the folder.
The line beside Start names the choices (`Isolated workspace · Automatically
land`), where the session runs, and that nothing is published or that verified
results land on origin, which Start then authorizes. Command details say where
it runs and name the established session's fields; there is no command line.
The other choices are offered only when the selected host's installation ships
the start, the shared policy and `established-session.mjs` (`ad-hoc` in the
machine answer's `sessionPolicies`); otherwise those radios are disabled with
why, a choice left from another host disables Start, and the boundary refuses
such a request before anything starts.

Default main · Wait for review runs no start and sends no block: the session
opens in the project folder with only the developer's text and the reporting
context, or blank. Every other combination runs `execution-start.mjs start
--one-shot` with no identity or publisher (`server/unattachedStart.ts`), adding
`--auto-land --push-authorized` only for Automatically land. Default main
passes `--default-main` with the project folder on the target branch, and the
session opens in the project folder. Isolated workspace passes `--integration
<project>` and a new `<project>/.worktrees/<slug>` on the selected host's
branch namespace, which the start, never the dashboard, creates at fetched
trunk; the session opens in that worktree (Claude Code's working directory,
Codex's `cwd`, Cursor's `--workspace`). Its slug follows the workspace rule
above from the session's label text, `session` when the label is a time or
holds no usable word. The start publishes nothing, Takes nothing and changes
no card. Its `prepared` receipt becomes the launch record's
`establishedSession` (workspace and its `role`, branch, remote/target,
`landing`, `startingRevision`, and `fetched` for Default main), which the
installed formatter writes as the first input's “Established session” block
before the reporting context and the text, and which supplies the Sessions
sidebar's and the terminal's saved workspace as a one-shot start does. The
reporting context of a launch that established a session names the launch's
[landing context](AGENT-LAUNCH-COMPLETION.md), which carries no story identity,
where the installed landing module takes one.

A session has no story, so its start is kept by its launch attempt:
`session-starts.json` beside the workflows' start stores holds, per project
and attempt, the host, workspace, branch and time, written before the script
runs (`server/sessionStartStore.ts`). The script is never aborted by its wait.
Expiry answers uncertain: “The session's start did not finish within the wait;
it publishes nothing. The start was kept and goes on in workspace … on branch
…, where it can be resumed.”, for Default main as for an isolated workspace.
When the script ends, its established session is kept with the start; a
script that stopped left nothing to resume and removes it. Continuing that
attempt from Startup recovery goes on in the kept workspace on the kept branch
and selects no other: with an established session kept, the session opens
there with that block and the script does not run again; with none kept (the
server ended before the script answered), the same start runs again for that
workspace and branch, which makes it or takes a clean existing one as it is
(`prepared`, `created: false`). Older installed starts require an existing
workspace's path to match the spelling Git uses for its top level, so a kept
workspace is handed to them as its real path. Current source accepts equivalent
symlinks; the conversion remains for compatibility until the installed release
payload includes that comparison. While the earlier script still runs in this
server, the continuation is answered “This session's earlier start is still
running on this machine, so it was not continued.” and the attempt stays as it
was. An isolated continuation is not asked about default main's changes; a
Default main one is, and changes it did not confirm stop it as they stop a
story's Default main continuation. A native refusal or formatter failure after
establishment stays a definite failure: no session was started. Its answer names
the retained workspace and branch and says nothing was published; Startup recovery
offers Continue without suggesting that a native session may exist. Continue or
the same Start request resumes the established session, preserving its workspace,
landing choice and handoff without running the start again. Successful launch
removes its spent kept start; a failure before establishment removes it. A start
refused before any workspace existed keeps
nothing, and a later Start session chooses its workspace afresh. A
conversation whose first input is unconfirmed is recovered by the same
continuation with no start run.

When the launch workspace is already known, Start or Continue checks that
workspace's selected-host Open Dough installation for the helpers this launch
will consume before further publication or native launch. Compatibility is
capability completeness in that workspace, not a VERSION match with the main
checkout. An older install that already has the needed helpers proceeds without
fetching release support. Missing required helpers fail with a definite
actionable pre-launch explanation that preserves any kept assignment and
start, never an uncaught helper-copy error or an uncertain-session claim.
Startup recovery then offers **Update worktree and retry**: the existing
whole-payload release updater (`open-dough-release.sh apply`) runs for that
exact worktree into both native skill roots, without automatic `--force`, then
Continue-equivalent resume reuses the retained start. A refused or failed
update does not launch.

When a successful attempt-store write prunes a settled attempt past its 30-day
retention, it also removes that attempt's kept session start. A refused or failed
write removes neither. Current and unsettled attempts retain their starts, and a
late script result cannot recreate a pruned start. This removes machine records;
the Git workspace and branch remain available.

An ad hoc launch's identity (`sameLaunch` in `src/launchRequest.ts`) is its
project, host and instruction with its Workspace and After checks choices, a
request naming none having the default ones. A Start session repeating all of
them resumes its retained established start or recovers a kept conversation whose
first input is unconfirmed; one whose choices differ starts a new session in its own place and leaves that
conversation and its workspace to their own continuation.

### Existing changes in default main

Before a Default main start, the boundary reads the default checkout's
`git status` (staged, changed, deleted and untracked paths; never content).
The project row's Start session in Default main is such a start: its request
carries the unattached policy of the shared definition (workspace and landing,
no tracking), and one naming no policy runs in Default main and waits for
review. An Isolated workspace session is not asked, and leaves the default
checkout's changes as they are.
Unless the request names the fingerprint of what it now observes, nothing starts
and the dialog shows, in place of its choices, “Existing changes in default
main”, the changed paths and count, “Continuing includes these changes in this
session's result. When committed, all checkout changes are committed
together.”, and “Wait for review remains selected” or “Automatically land
remains selected; verified changes may land without another review.” The
heading takes the keyboard. Back (or Escape) returns to the choices and text as
they were, at Start; Continue with existing changes sends the same request with
the fingerprint and never changes the landing. The fingerprint hashes HEAD, the
status and each path's size and modification times, so content changed after
the warning asks again. It is a local comparison, not a kept confirmation, and
the record keeps no fingerprint. A clean checkout starts without a warning.
