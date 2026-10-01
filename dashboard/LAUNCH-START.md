# Dashboard launch start

How a story launch establishes its start before the native session, recovers
it, and applies the dialog's Session choices. [Agent launch](AGENT-LAUNCH.md)
owns the rest of the launch contract.

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
`src/hostDescription.ts` (`claude/` or `codex/` for current starts). Slugs are
lowercase hyphenated words, accents removed, at most 48 characters, `story` for
no usable words, and numbered when workspace folders or any known host namespace
collide. The same descriptions supply collision lookup for `claude/`, `codex/`
and `cursor/`; recognizing Cursor branches does not offer a Cursor runtime.

Start runs only when origin is the catalog repository and the story has no
unresolved [launch attempt](AGENT-LAUNCH.md#startup-handoff-and-reconciliation)
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

The script is never aborted by its bounded wait (two minutes by default,
`DOUGH_START_TIMEOUT_MS` for tests). Expiry reports uncertain, so the start
needs reconciliation, and the script continues recording its result.
Continuing that attempt from Startup recovery, or a kept start's Start, resumes
the kept workspace/branch, publisher/model and recovery, yielding
existing/resumed execution or continued preparation instead of a second
publication. An execution interrupted before
its result is retained uses workspace HEAD/parent only on its kept branch;
the installed script validates the isolated claim or refuses it.

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

### Existing changes in default main

Before a Default main start, the boundary reads the default checkout's
`git status` (staged, changed, deleted and untracked paths; never content).
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
