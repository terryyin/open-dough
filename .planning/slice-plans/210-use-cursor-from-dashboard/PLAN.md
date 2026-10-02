# Use Cursor from the dashboard

**Identity:** SEED-052#use-cursor-from-dashboard
**Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard).
**Authority:** Terry requested slice planning on 2026-10-02, after choosing the scope split; preparation only.
**Preparation:** Reuse the established owned workspace
`/Users/terryyin/git/open-dough/.worktrees/use-cursor-for-the-established-dashboard-workflows`,
branch `cursor/use-cursor-for-the-established-dashboard-workflows`, starting revision
`51c65a7796027969fa3a9b6fc7954ed21a3ac31b`; agent `mike.li-chan`, remote `origin`,
target `main`, integration checkout `/Users/terryyin/git/open-dough`.
The existing Preparing assignment remains published; retain this draft for review.

## Execution

- Mode: story-branch. This execution created the workspace.
- Workspace: `/Users/terryyin/git/open-dough/.worktrees/use-cursor-for-the-established-dashboard-workflows`
- Branch: `cursor/use-cursor-for-the-established-dashboard-workflows`
- Integration checkout: `/Users/terryyin/git/open-dough`
- Remote: `origin`. Trunk target: `main`. Increment target: the remote execution branch.
- Published claim: `0ae15498c2de5d3a169dcec8c609c27cd60f3f09` on `origin/main`.
- Starting revision: `f7d1140011044be2536b0c7aa09f4be7b35b82fc`. Previously published base for the first increment: `0ae15498c2de5d3a169dcec8c609c27cd60f3f09`.
- Agent: `stanly-chan`. Publisher: `cursor-mac-lan-use-cursor-from-dashboard`.
- CI source: GitHub Actions. Workflow selector `ci.yml`, display name `CI`, verified on `main` (`workflowName: CI`). Observer `/tmp/dough-ci-501/watch-aPxS2Q` watches the execution branch. The trunk claim is `pendingCi: unobserved`.

## Goal and scope

A developer can run execution, refinement, and an unattached session on
Cursor's CLI from the dashboard, then find that session and continue it in
the embedded terminal, in the dashboard workspace, with that workflow's
existing handoff.

Cursor is offered beside Claude Code and Codex. Default omits `--model`.
The dashboard stores the UUID from `create-chat` before the first prompt.
The launch uses `cursor-agent --workspace` on
`<project folder>/.worktrees/<story slug>`, branch `cursor/<slug>`, and does
not pass `-w`, `--worktree`, `--trust`, `--force`, or `--yolo`. The embedded
terminal resumes with `cursor-agent --workspace <path> --resume <uuid>`.
This story does not read Cursor activity, so a Cursor session is not shown
as working, waiting, or review. One real committing launch is this story's
native proof.

Defer passive activity, attention, a confirmed-absence signal for a valid
UUID, rename, interrupt, native stop, tmux `persist`, and a model picker to
[See Cursor activity and use its native controls](../../seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-native-activity-and-controls).
Leave Claude Code and Codex behavior unchanged.

## Existing solutions and direction

PFE searched host launch, session records, terminal attachment, and the
launch dialog. Reuse `LaunchHost` in `dashboard/server/launchHosts.ts`, host
facts in `dashboard/src/hostDescription.ts`, the discriminated session union
in `dashboard/src/launchRecord.ts`, and `dashboard/server/terminalAttachments.ts`.
Add one Cursor module and a Cursor session variant. Do not add a second
dialog, store, or launch flow, and do not add `cursor` branches in shared
server or browser code.

The fixture pattern in `dashboard/tests/support/fakeCodex.ts` is the proof
stand-in for repeatable launches. It is not Cursor's implementation.
`agent-launch-start.spec.ts` already proves a Claude execution start against
the real installed start script; Cursor slices keep that proof and add a
Cursor fixture rather than replacing it.

Follow [North Star: agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
and [a start establishes claim and workspace before the session](../../NORTH-STAR.md#a-start-establishes-claim-and-workspace-before-the-session).
Accepted [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
keeps an unsupported operation unavailable and requires Cursor evidence for
Cursor behavior. No conflict, exception, or new North Star topic.

## Observed premises and proof boundaries

Observed in this workspace on 2026-10-02. The CLI probes used
`cursor-agent` 2026.10.01-e373342. Code reads are at trunk `de8a72e5` plus
this uncommitted seed draft. This worktree has no `node_modules`, so the
dashboard specs below were not executed during planning.

- `rg -n hostRuntimes dashboard/server/launchHosts.ts` shows `cursor` mapped
  to `undefined`. `rg -n skillSigil dashboard/src/hostDescription.ts` shows
  Cursor has a name and `cursor/` branch namespace, an empty model map, and
  no skill sigil. `launchHosts` keeps a host unoffered until that sigil
  exists. Slice 1 adds the sigil and the runtime together.
- `dashboard/src/launchRecord.ts` unions only Claude and Codex session
  variants. Slice 1 adds a Cursor variant with `sessionId`, `name`, and the
  workspace plus resume args it needs. It does not copy Claude's `shortId`
  or Codex's endpoint.
- `dashboard/src/LaunchHostModel.tsx` lists `launchHosts` and renders model
  options from that host's `models` map, with an empty value meaning Default.
  An empty Cursor model map therefore offers only Default.
- `dashboard/server/terminalAttachments.ts` refuses attachment when
  `launchHost(session).attach` is absent. Slice 3 supplies Cursor `attach`.
  Slice 4 leaves `sessions` and `stop` absent so activity is not polled and
  native stop is not offered.
- On 2026-10-02, `create-chat` printed a UUID before any prompt and wrote no
  local transcript. `--print --output-format json --resume <uuid>` returned
  that `session_id`. A non-UUID failed before a reply. A well-formed UUID
  that was never created was claimed, so absence of a valid UUID is not an
  error. `--workspace` on a worktree inside this trusted project did not ask
  for `--trust`. An unknown `--model` failed before a reply. `ls` is an
  interactive UI and fails in a non-TTY. No rename command and no passive
  status command were available. An interactive `--resume` survived SIGHUP
  and remained resumable after SIGTERM. These settle the argv slices 1–4
  encode. They do not settle the interactive ready frame or that a skill
  handoff produces a commit. Slice 5 is that probe; its failure stops
  completion and revises the host prompt before the story is done. Slices
  1–4 do not depend on the model following the skill.

## Ordered slices

### 1. Start Cursor execution in the dashboard workspace
Type: Behavior
Status: done
Proof: Story example 1. A fixture `cursor-agent` records argv and prints a
UUID from `create-chat`. The card shows that Cursor session. Claude's
`agent-launch-start.spec.ts` and Codex's `agent-launch-start-codex.spec.ts`
still pass.

Accepted proof: `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-cursor.spec.ts dashboard/tests/agent-launch-start.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts --workers=2` passed after refactor, and `npm run typecheck:dashboard` passed. The observing test is `dashboard/tests/agent-launch-start-cursor.spec.ts` ("a queued story starts Cursor execution in the dashboard workspace and the card shows that session"). Setup is the real installed start script, a bare origin, and the fixture binary on `PATH`. The assertion sees the dialog on Cursor with an empty model, the card text and UUID, the UUID stored before the prompt, argv `--workspace` and `--resume`, the `/dough-execute-plan` handoff, branch `cursor/story-a`, and no forbidden flags.

Behavior: A queued story can start execution and the fixture CLI is
installed. The developer chooses Cursor, leaves Default, and starts
execution. The service stores the printed UUID before the prompt, launches
with `cursor-agent --workspace <dashboard workspace>` and `--resume <uuid>`,
and the prompt contains the execution skill and the established-start
handoff. The recorded command omits `--model`, `-w`, `--worktree`,
`--trust`, `--force`, and `--yolo`. The branch is `cursor/<slug>`.

Add the Cursor `LaunchHost`, the session variant, and a skill sigil so the
host is offered. Keep native commands in the Cursor module. Prove it in a
new `dashboard/tests/agent-launch-start-cursor.spec.ts` using the same real
installed start script and bare origin as the Claude start spec, with the
fixture binary on `PATH`. Run:

`env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-cursor.spec.ts dashboard/tests/agent-launch-start.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts --workers=2`

Safe stopping point: Cursor execution launch works against the fixture.
Refinement, ad hoc, and the embedded terminal are still absent.

### 2. Start Cursor refinement and an unattached session
Type: Behavior
Status: planned
Proof: Story examples 2 and 3, except the embedded open in example 3.
Refinement carries the preparation handoff. Ad hoc stores a session with no
story and only the optional instruction.

Behavior: The same Cursor host accepts refinement and Start session. A
refinement launch's prompt contains the preparation handoff. An unattached
launch records no story identity and does not invent a skill line when the
developer leaves the instruction empty. Published assignment facts, not the
launch record, remain what can show a story as being prepared.

Extend `agent-launch-start-cursor.spec.ts`, following the separation in
`agent-launch-preparation-codex.spec.ts` and
`agent-launch-ad-hoc-codex.spec.ts`. Run those Cursor cases plus the two
Codex specs named here. Safe stopping point: all three workflows launch.
The terminal still cannot attach.

### 3. Attach the embedded Cursor terminal
Type: Behavior
Status: planned
Proof: Story example 4. After a recorded Cursor session, the terminal
process is `cursor-agent --workspace <recorded path> --resume <stored uuid>`.

Behavior: The developer selects the session after the server has restarted.
Attachment uses Cursor's `attach`. It does not call `claude attach` or
`codex resume`. The fixture's ready callback admits the terminal. Ending
the dashboard client leaves the stored uuid resumable by the fixture.

Prove it in `dashboard/tests/agent-terminal-cursor.spec.ts`, beside
`agent-terminal-codex.spec.ts`. Run both. Safe stopping point: the embedded
resume command works against the fixture.

### 4. Show a Cursor session without borrowed activity or controls
Type: Behavior
Status: planned
Proof: Story examples 5 and 6.

Behavior: A launched Cursor session is visible. The sessions view does not
show working, waiting, or review from a Cursor poll. Unknown wording comes
from Cursor's host description. Stop and rename are absent. Delete record
remains, because it does not need a native operation.

Leave `sessions`, `stop`, and `rename` unimplemented on the Cursor host.
Assert the projected operations and the rendered unknown wording in the
Cursor terminal spec or a focused session-list spec. Re-run the slice 3
command and one existing Codex observation spec,
`dashboard/tests/agent-launch-codex-observation.spec.ts`, so Codex activity
still comes from Codex. Safe stopping point: Cursor is usable for launch
and attach without pretending to know native activity.

### 5. Commit once through a real Cursor launch
Type: Behavior
Status: planned
Proof: The story's committing run. A disposable git repository, the real
`cursor-agent` 2026.10.01-e373342 or a newer installed CLI, and one
dashboard execution start.

Behavior: The developer starts Cursor execution with Default against that
repository. The real CLI prints a UUID, receives the execution handoff, and
commits one file in the dashboard workspace. The card shows that uuid.
Opening the embedded terminal reaches a visible Cursor prompt for the same
uuid, which is the ready frame this plan has not yet seen. Ending that
client leaves the uuid resumable.

This is the paid probe. Do it only after slices 1–4. Slice 1 confirms the
first prompt only when that `cursor-agent` process exits 0. The observed
interactive client stays running, so this probe must treat a still-running
client as the launched session rather than waiting for it to exit. If the
CLI rejects the argv or the handoff does not commit, stop and revise the
Cursor host before calling the story done. Do not borrow another host's
command to make the commit succeed. Record the ready-frame text observed
on the real PTY in this plan. Slices 1–4 stay valid against the fixture
when this probe changes prompt wording or that wait.

No automated `npm` command covers this slice. The proof is the commit, the
stored uuid, and the recorded ready frame.

## Verification

No numeric slice target or hard limit was supplied. Each slice has one
proof loop. Run `npm run typecheck:dashboard` after the session-union and
host-module edits. Apply execution's post-change refactoring and
delivery gates, and run `git diff --check`. The named dashboard specs are
the local proof. Hosted CI adds no further local suite gate. Slice 5 is the
native acceptance for this story; fixture success does not replace it.

## Current decisions

- Cursor joins the existing host boundary. A native fact that does not fit
  stops the affected slice for a human decision.
- Default means omitting `--model`.
- The fixture encodes the CLI contract observed on 2026-10-02. Slice 5 is
  the committing and ready-frame probe.

## Learnings

- The fixture exits immediately, and the host confirms the first prompt only
  when that process exits 0. The interactive client observed on 2026-10-02
  does not exit, so slice 5 has to accept a still-running client. Slices 2–4
  keep the fixture contract.
- An empty ad-hoc instruction makes `cursorPrompt` return undefined, and
  launch then refuses before `create-chat`. Slice 2 still records that
  session with no story and no invented skill line.
