# Architectural North Star

Temporary direction for current work; revise when evidence changes it and retire
realized topics after checking affected stories. Accepted ADRs remain authoritative.

## Remote history and optional local refresh

The selected direction uses the project's remote trunk as the integration
boundary for every owned workspace. Before isolated story implementation starts,
publish its Taken claim to that trunk. Fresh workspaces and queued source
selection use fetched remote history. A default checkout is optional and may
remain the developer's playground. Publication, execution ownership,
checkout freshness when applicable, and CI coverage retain their own evidence.

| Concept | Meaning and owner |
| --- | --- |
| Work identity and Taken membership | Stable story identity and queue selection, owned by the backlog contract and mutation/reconciliation scripts. |
| Execution identity and workspace | Mode, owned checkout/branch, base revision, publication destination, and publication authority, owned by execution-location guidance. |
| Publication | Reconcile owned changes with fetched remote history, validate the candidate, publish through the authorized destination, and retain the accepted revision. |
| Optional default checkout | A developer's local checkout, whose content and revision neither supply nor veto owned-worktree startup or remote publication. |
| Checkout freshness | The observed local relationship to fetched trunk and any optional refresh outcome, when a checkout is supplied. |
| CI coverage | Observation of a specific published revision on a particular target, owned by the existing observer. |

Publication, default-checkout maintenance, claim-before-implementation, and
mode destinations are established in the installed execute-plan publication and
checkout-maintenance guidance. Preserve preparation disposition, story-branch
publication ownership, and CI attribution in active plans or conversation
context. Report a coverage gap when the configured observer covers a different
target from a published claim.

After accepted trunk publication, attempt a safe fast-forward when a default
checkout is supplied; preserve pending local work and report a skipped,
deferred, stopped, or failed refresh separately. Its absence never blocks owned
work. Dough Land and wrap-up retain their publication, refresh, retirement,
review, history-recovery, and CI duties. Explicit current-checkout work needs
no automated ownership or handoff mechanism. Owned
workspaces use the same remote contract across machines and worktrees.

Keep this direction while the selected stories need it; retire it when lasting
behavior is established in authoritative guidance. Describe the intended
contract directly in guidance and proof, with change history retained in Git.
Follow Accepted [ADR 0001](../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002](../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
and [ADR 0006](../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
[ADR 0009](../docs/adrs/0009-git-branching-and-integration.md) records the Git
proposal; human-owned ADR status decisions remain separate from this planning
direction.

## One backlog interpretation, separate observation and presentation

For the first dashboard, keep the existing pure backlog document, identity, and
direction readers as the owners of those meanings. Their current import graph
has no filesystem dependency. A published spelling those readers refuse is a
read problem, or a bounded compatibility change there, never a second dashboard
grammar. Within a
small `dashboard/` application, distinguish reading a GitHub ref and its pinned
backlog content, projecting the shared reader's result into a typed snapshot
with source evidence, and rendering that snapshot plus transient retrieval state.
The connected-stage presentation derives card membership/order from that
snapshot, keyed by work identity. Start with semantic work cards, simple
connectors, and ordinary layout/reflow; do not build a viewport or animation
framework before this reading goal needs one. When useful, keep zoom/pan,
focused work, and transitions as separate UI state: they neither change
repository facts nor represent machine-local coordination. Zoom reveals
already-read facts; animation explains navigation or observed changes. Neither
requires a new story-state schema or persistence.
Use ordinary functions and components; these responsibilities do not require
services, repositories, plugin interfaces, or separate packages. The browser
must not import filesystem/store/merge orchestration. A snapshot describes
published membership; loading and refresh failure describe observation, not
new story lifecycle states. This direction supports the
[story dashboard](../dashboard/README.md) and its later project and readiness work,
following [ADR 0001](../docs/adrs/0001-ubiquitous-language-accepted.md) and
[ADR 0002](../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
Agent assignments are published facts like any other: an execution or
preparation assignment is the agent profile on trunk, and the page derives
Taken owners and Preparing from that profile's presence. The agent roster is
one more view of that snapshot, and a commission's human developer is the
committer of the commit that added its profile's current allocation; avatar
images, like every GitHub read, come through the local boundary and never
become assignment evidence. Keep later feature,
structure, and local operational models out until their selected behavior needs
them.
UI choices stay in the separate
[UX/UI North Star](../docs/dashboard-ux-ui-north-star.md).


For the dashboard, every configured project is read through the
launching person's local `gh` authentication (Terry's decisions of 2026-09-21
for Pygardon and 2026-09-23 for Open Dough and Doughnut). Keep
credential/process responsibility in one narrow loopback read boundary of the
existing local dashboard launch, shared by dev and built preview. It returns
published revision and pinned file data for the same browser interpretation;
no direct browser-to-GitHub path remains. Credentials never enter browser
assets. Configured project identity bounds the local reader's requests; no arbitrary proxy
or new state authority is needed. Selection is transient UI state, with one
project's observation visible at a time. This direction does not create
coordination between the observed projects or adopt Proposed ADR 0008.
Terry's decision of 2026-10-02 adds and removes projects through the dashboard,
using a GitHub URL and local checkout path. The local server saves one ordered
project configuration per environment on this machine: built production and
live development. These are machine-local settings; the observed repository
continues to own project state.

## One owner admits reads to GitHub

For [rate-limit recovery that waits, resumes, and labels as promised](seeds/SEED-113-dashboard-github-responsiveness.md#rate-limit-recovery-residue-correction),
the local read boundary of one launched dashboard server owns what reaches
GitHub. Its single `gh` invocation is the only place every tab, project, and
kind of read passes, so the login's allowance has one owner there. Pages do not
coordinate with one another, and nothing is stored outside that process's
memory.

- **Admission precedes a read.** A read reaches GitHub only when no cooldown
  stands and a turn is free. Admission, reachability, and interpretation of the
  answer stay with each dashboard request above it; a request refused there
  takes no turn.
- **A cooldown is one fact of the process**: the time before which nothing is
  asked. Any read's rate-limit refusal sets it, from GitHub's direction or from
  the backoff when GitHub directs none, and only ever later. It is not a
  property of a page, a project, or a kind of read, and the page's own resume
  time is only what the boundary told it.
- **The direction is learned once.** How a refusal is recognized as a rate
  limit, and what wait it directs, has one representation for every `gh` call,
  generalizing what the revision check and commit comparison learn today.
- **Turns bound demand.** One count of reads under way covers the process and
  is the only rule for GitHub demand across groups, tabs, and projects. A
  group's own pool still orders that group's requests and stops it at its
  first failure. After a cooldown one read goes first; its answer reopens the
  turns.
- **Admission counts reads, not waiters.** Where one outstanding read serves
  several requests under the topic above, it holds one turn, and a cooldown
  refuses the read once for all of them. A request waiting for a turn is owned
  as a waiting request is there: its disconnect and its 30-second bound end its
  wait, and closing the server ends all of them.
- **One recovery on the page.** A limited read, check, or detail reports the
  same thing, a limit and a resume time, and the page has one way to show it
  and to read again what was withheld.

Proactive use of the remaining allowance, coordination beyond one process, and
priority among kinds of read are not built ahead. Retire this topic when that
correction is delivered.

## Agent launch as a requested assignment

Starting agent work from the dashboard
([SEED-052](seeds/SEED-052-start-agent-work-from-dashboard.md), beginning with
[launch execution](../dashboard/AGENT-LAUNCH.md)) adds the dashboard's first
action. Model it in the vocabulary the dashboard
already reads, so later launch stories extend one model instead of adding
parallel ones:

- An **agent launch** starts one **workflow** on one work item, through one
  host (`claude`, `codex`, and `cursor`, from `agentHosts`), with an
  optional developer instruction. A workflow names the skill it runs and the
  published **activity** (from `agentActivities`) whose assignment it asks
  for: execution runs `dough-execute-plan` and asks for an execution
  assignment; refinement runs `dough-story-refinement` and asks for a
  preparation assignment. One activity can host several workflows (planning
  also prepares), which is why the launch names the workflow rather than the
  activity. Workflows are added when a story delivers them, in one table that
  the boundary, host, and card all read; no per-workflow copy of the action or
  dialog is built. The agent's ordinary workflow still owns workspaces, Take,
  preparation, and publication.
- A **launch record** is machine-local operational evidence (ADR 0008's later
  local layer): the request, when it was launched, and the host **session** it
  started. It never settles, moves, or becomes story state: its session stays
  listed until the developer marks it done or an explicitly reported successful
  Land/Wrap Up completion without an attention message marks that session done,
  whatever the story's published stage. Later stories list, persist, and attach to these same records rather
  than inventing a session registry.
- Each **host** owns how to start and identify its sessions (for Claude Code:
  `claude --bg`, which chooses and prints its own session id, confirmed
  through `claude agents --json`) and how a developer reaches one (`claude attach`).
  Host-specific code stays in one module per host behind the `LaunchHost`
  boundary in `dashboard/server/launchHosts.ts`; an operation a host lacks is
  unavailable, never supplied by another host. Shared code reads host facts
  (name, skill sigil, offered models, recovery hint and optional native-check
  advice) from one host description, and offered operations from the host
  boundary ([native hosts](../dashboard/AGENT-LAUNCH-HOSTS.md)); each host's
  identity and continuation have their own session record variant; session
  wording names the session's own host and alerting follows facts the host
  reports; and shared launch gates apply to every host rather than to one by
  name.
- Each configured project's **local folder** is a machine-local fact held by the
  local server, not by published project state.
- **Sessions are the machine's, not a project's.** Launch records sit in one
  store on this machine. Observe the recorded host-qualified conversations;
  Claude's machine-wide listing can supply that observation, while Codex reads
  the saved native thread and endpoint. The page reads them once
  for every configured project and holds one session state, apart from project
  selection; cards, Recently done, and the Sessions sidebar
  each derive their view by project and identity from it. Actions on one
  session (attach, stop, Mark as done) still run in its project's folder.
  Published observation stays one project at a time; later hosts join the
  same read through their own module.

Each host normalizes its native activity; common presentation owns its user
meaning. Saved conversation existence, current native activity and the
developer's local done mark are distinct: an unloaded conversation can retain
resumable history, and a completed turn does not complete its story. Read-only
monitoring must not resume a conversation or take its interactive control.
Hosts reuse the shared polling, alerts and terminal transport; client
detachment stays distinct from explicit per-conversation interruption. Cursor
proves its own native boundary rather than inheriting Claude's or Codex's, and
composable session policy supplies actual context without another registry or
an assumption that every conversation has an assignment. Follow Accepted ADRs
[0001](../docs/adrs/0001-ubiquitous-language-accepted.md),
[0002](../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [0005](../docs/adrs/0005-cross-tool-validation-accepted.md).

Process and filesystem responsibility stays in the existing local loopback
boundary: the launch endpoint sits beside the read endpoint in the same Vite
launch, reuses its loopback and same-origin refusal before any process starts,
passes fixed argument arrays (never a shell string), and keeps launch records
in the common machine-local store. Native runtime infrastructure stays owned
by its host. The dashboard adds no database and no daemon for story state.
Cursor's terminal process is the exception: one machine-local runner owns
it, as the dashboard terminal and command documentation describe. Claude
Code and Codex stay with their hosts. The browser holds
only transient dialog and request state and derives what a card shows from the
published snapshot plus launch records. This extends, and does not replace,
the read boundary topic above and ADR 0008's origin authority.

## A start establishes claim and workspace before the session

The delivered execution start and its siblings in
[SEED-052](seeds/SEED-052-start-agent-work-from-dashboard.md) (refinement's
preparation start, Codex, Cursor) share one model, so each adds a row to a
table, never a second flow. Model it in the launch vocabulary above.

| Domain concept | Meaning | Owner (module) |
| --- | --- | --- |
| **Workflow** | Gains a `start` kind: what mechanical preparation precedes its session (`execution-start`, `preparation-assignment`, or none for ad hoc). | The one `launchWorkflows` table (`src/agentLaunch.ts`). |
| **Start** | A workflow's deterministic establishment of a published claim and an owned workspace, run before its session by the project's installed skill script, never reimplemented by the dashboard (PFE: `execution-start.mjs` already fetches, selects the workspace, names the agent, publishes the Take, and reports recovery). | `server/startWorkflows.ts` selects the shared start; `executionStart.ts` and `preparationStart.ts` own their installed command/result boundaries. |
| **Workspace choice** | Where the start puts its checkout: a path and branch, decided by the dashboard for every host, never by a host's own worktree feature: `<project folder>/.worktrees/<story slug>`. Inside the project folder the folder's trust covers it (Claude Code probed; Codex resolves a linked worktree's trust to its main repository; Cursor inherits trust down the folder tree, observed 2026-09-30), and outside `~/.codex/worktrees` and `~/.cursor/worktrees` those tools' automatic cleanup does not reach it. The branch names the selected host, such as `claude/<slug>`, `codex/<slug>`, or `cursor/<slug>`. | The shared pure function `server/launchWorkspace.ts`; host branches and workspace folders share collision checks. |
| **Established start** | The start's typed result: identity, publisher id, workspace, branch, mode, remote and target, agent, `publishedSha`, `startingRevision`, `candidateSha`, plan. The handoff to the session. | Shared type in `src/agentLaunch.ts`. |
| **Start record** | Machine-local, write-ahead evidence of one start: written *before* the script runs (publisher id, workspace, branch), updated with the established start, removed when a launch record keeps it. It is what a retry resumes. Never a story fact; origin's Take decides Taken. | `server/startStore.ts`, beside `launchRecordStore.ts` on the same file discipline (one shared JSON-file helper). |
| **Start progress** | Which phase a running start is in (`preparing`, then `launching`), held in server memory and answered with the machine's sessions so every page shows it. A stored start with no running process is *interrupted*, not running. | `AgentLaunches` (`server/agentLaunches.ts`) owns both, keyed by project and identity. |
| **Handoff** | The host spells the skill invocation plus the installed established-start handoff; the skill consumes it as its own start result. | The host's private input builder consumes the selected installed formatter; the invoked skill owns established-start reuse. |

Rules that keep later stories additive:

- **Order.** Admit, then start, then session. The record store and the host see a
  session only once the start is established; a failed session leaves the start
  record, so the story's claim never loses its workspace.
- **Ownership.** One start per project and identity in this server (a second
  request is refused as already starting). Across servers and machines the
  script's publisher-id and origin ownership check decides; a story Taken by
  another agent is refused with its owner. Retry reuses the story's start record,
  so the same publisher id, workspace, and branch make the script's answer
  `existing` or `resumed` instead of a second claim or workspace.
- **Agent.** The claim names host and the chosen model (omitted on Default). A
  retry after a published claim keeps that claim's model; the session's requested
  model may differ, and the record says what was requested.
- **Integration checkout.** The project's folder is the script's `--integration`:
  it refreshes that checkout only when safe and reports the rest, so a dirty
  folder never blocks the start.
- **Host seam.** Host modules own the skill root
  (`.claude/skills` for Claude Code; `.agents/skills` for Codex and Cursor),
  native conversation start in the chosen workspace (Codex daemon `thread/start`
  with CWD; Cursor `--workspace`, never native `--worktree` / `-w`), and listing
  where the host supplies passive status. Cursor does not. The
  workspace choice is shared, not a host convention. The start and the record are host-agnostic and take
  only `host`, `model`, and the workspace choice. The common contract contains only delivered operations; native helpers remain
  private behind one public module per delivered host.
- **Failure kinds** stay in the existing `failed` / `uncertain` launch results,
  with a `start` field when a claim may be published, so cards keep one wording.

Retire this topic when the sibling stories have delivered their rows and the
code and tests carry it; keep any lasting rule in `dashboard/AGENT-LAUNCH.md`.

## Composable session policy and workflow-owned start

For the queued [unattached Start session](seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options)
story, reuse the delivered session policy rather than adding ad hoc controls:
tracking, workspace, and landing come from the one installed policy contract,
workflow start establishes the actual context once, and dashboard and native
adapters consume that context. Default-checkout confirmation stays a launch-time
acknowledgment that never activates auto-land. Retire this topic when that story
is delivered; keep any lasting rule in `dashboard/LAUNCH-START.md`.

## Dashboard-owned CI observation and session delivery

For [dashboard-owned CI monitoring](seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring),
an execution session started with `--external-ci` registers each accepted
publication through the same installed reporting CLI and loopback boundary as
explicit skill completion. It starts no observer and does not wait at
completion.

The dashboard runs the session workspace's installed observer engine under its
own mailbox root, so standalone hooks never claim those mailboxes. It keeps
registrations and per-revision CI state in the existing machine-local launch
records. When a failure needs action, it wakes the session through an optional
`deliver` operation on the host boundary. That operation's presence alone
decides whether the option is offered. Claude Code continues an exited session
with `--bg --resume` and types into a loaded one.

Lost observation or delivery stays visible and never becomes success. The
standalone observer, hook bridge, and completion wait are unchanged. This is
supported by Accepted ADRs 0001, 0004, 0005, and 0006. Move the lasting
feature rules to the dashboard launch documentation at wrap-up, and retire
this topic when Codex and Cursor delivery no longer need it.
