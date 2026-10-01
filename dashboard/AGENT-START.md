# Dashboard mechanical start and recovery

The [agent launch](AGENT-LAUNCH.md) runs the selected installed skill before starting a native session.

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
The workspace is `<project>/.worktrees/<title slug>`, independent of native host
worktree features; the branch names the host. Slugs are lowercase hyphenated
words, accents removed, at most 48 characters, `story` for no usable words,
and numbered when workspace folders or host branches collide.

Start runs only when origin is the catalog repository and the story is not
already starting in this server. Progress is registered synchronously before
running: preparing, then launching. Another request is refused without a second
start. Every page reads those local phases, but the card stays where origin
places it. Across servers the installed script owns claim/assignment conflict
and publication; refusals name origin's owner when readable.

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
`DOUGH_START_TIMEOUT_MS` for tests). Expiry reports uncertain and the script
continues recording its result. Retry resumes the kept workspace/branch,
publisher/model and recovery, yielding existing/resumed execution or continued
preparation instead of a second publication. An execution interrupted before
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
