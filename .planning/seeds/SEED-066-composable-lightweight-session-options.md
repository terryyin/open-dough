---
id: SEED-066
status: active
planted: 2026-10-01
planted_during: Maintainer request to capture composable lightweight session options
trigger_when: A developer wants lightweight refinement or execution with explicit workspace and landing choices
scope: small
---

# SEED-066: Composable lightweight session options

## Why This Matters

Small reassessments currently incur ordinary dashboard refinement setup and a
published Preparing announcement. Static inspection reported four fetches, an
announcement push, remote confirmation, worktree creation, and agent launch in
a typical fresh setup. Network delay remains a hypothesis, not measured latency.

Current one-shot work applies only to execution, skips Taken and agent profiles,
uses an owned workspace, and normally publishes the verified result. Developers
want lightweight refinement too, with independent workspace and landing choices.
Unattached conversations need those choices through a separately delivered story.

## Shared Architecture Direction

Terry explicitly requires careful upfront architecture design for both stories.
The responsibility model below is preparation input, not an executable plan or
an approved new ADR. Before implementation, review it against actual shared
runtime and launch operations and resolve consequential contract questions.

### Separate the meanings

| Concept | Responsibility | Must remain independent of |
| --- | --- | --- |
| Workflow / work identity | Requested refinement, execution, or unattached conversation; applicable claim and completion lifecycle | Workspace and landing selections |
| One-shot selection | Explicit lightweight tracking for eligible work; no new published assignment | Location and publication intent |
| Workspace choice | Isolated owned workspace or established default checkout on the project's trunk branch | Tracking and landing intent |
| Landing choice | Review by default for one-shot; explicit auto-land after verification and resolved decisions | Location, readiness, and implementation authority |
| Dashboard warning confirmation | Authorize including existing uncommitted changes in the checkout result after warning | Story admission, assignment, and selection of auto-land |

Retain explicit one-shot as the lightweight selector, extending it to
refinement. Exact flag spelling is not selected. Neither location nor landing
selection implies one-shot; disabling it in an unattached conversation does not
create or assign a story. Established sessions keep their workspace and lifecycle
rather than being silently migrated by a changed launch selection.

### Keep each responsibility in one home

- Shared workflow guidance/runtime owns eligibility, workspace establishment,
  verification, disposition, publication, and recovery. Reuse the existing
  preparation recorder, execution lifecycle, and landing responsibilities;
  reconcile one-shot's current publication contract with review by default.
  Avoid separate dashboard and direct-invocation versions of those rules.
- Dashboard launch orchestration owns the pre-launch uncommitted-change warning.
  Any uncommitted change in the selected default checkout triggers a warning,
  including changes already there before this task. Continue only after user
  confirmation; cancel starts nothing. Confirmation authorizes including the
  existing changes in the checkout result, including committing everything,
  but does not select auto-land or waive review. Auto-land remains independent.
  A direct skill invocation has no clean-main prerequisite and no equivalent
  warning/confirmation requirement. Skills preserve existing content and apply
  normal Git and publication contracts without treating dirtiness as a veto.
- The launch handoff carries resolved workflow/tracking choices, actual workspace,
  remote/trunk target, and landing intent once. Native host adapters translate
  that handoff with minimal host-specific spelling. The server and native session
  must not independently create a second workspace or assignment.
- Keep warning confirmation as local launch evidence rather than durable story
  state. A changed request or changed observed content must not silently reuse
  confirmation for a different warning. Recheck at the launch boundary; do not
  invent a checkout owner registry or locking subsystem.
- Durable story facts remain in their canonical repository homes. The dashboard
  derives published facts from origin; local drafts, warning confirmation, and
  native launch observations are local evidence. Review-waiting results are not
  represented as remotely published preparation or completion.
- Reuse Dough Land's remote publication/recovery contract. It lands all checkout
  changes and unpublished commits; it does not select only this task's paths.
  Warning confirmation authorizes including pre-existing uncommitted content;
  landing policy separately determines whether to pause for review. Do not
  invent a selective landing mechanism or a clean-main requirement. Publish, refresh, CI, and workspace cleanup are distinct outcomes.

### Constraints and design review

Follow [ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
and [AGENTS.md](../../AGENTS.md): one shared behavioral source, runtime audience
is the established project, published guidance is authored in `src/skills/`,
and installed managed copies are not hand-synchronized.
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
keeps readiness separate from authority and ordinary tracked execution integrated
in small increments. This story changes one-shot disposition, not ordinary
tracked execution's continuous publication.
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires affected native behavior proof across Codex, Cursor, and Claude Code;
deterministic launch checks do not substitute for native skill evidence.
ADRs 0007, 0008, and 0009 remain Proposed; no status change or exception is made.

Before each story's implementation, walk its full request → launch → native
handoff → retained result → review/auto-land → recovery journey. Check all four
workspace/landing combinations, direct invocation versus dashboard warning,
assignment ownership changes, and interrupted publication. For the second story,
include a conversation that never requests work and one that later invokes a
workflow. Name reused runtime operations and missing contracts in its eventual
plan; resolve blocking architecture questions before dependent implementation.
Do not prescribe components or slices merely from these conceptual boundaries.

## Stories

<a id="unattached-session-options"></a>

### Choose workspace and automatic landing for unattached Start session

**Identity:** SEED-066#unattached-session-options
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/298-unattached-session-options/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d601ff0c6d9ee30420947ecdda1c73244c5b703e4b29a6956928e3872f3b9643","plan":"408b2067d132ade57d007392461c8834db1f310f40d167e58bc65bf4543912bc"}}
```

**Goal:** A developer starting an unattached Start session from the project row
chooses where that conversation runs, the default checkout or an isolated
workspace, and whether results it later verifies land automatically, with the
same words and the same existing-changes confirmation as one-shot story
sessions. The choices create no story, Take, or assignment; they only
establish where the session works and what the developer has authorized in
advance. This gives lightweight conversations the workspace and landing control
the one-shot story dialogs already have, through one shared policy.

#### Scope

Required behavior:

- The Start session dialog offers the Session group's **Workspace** (Isolated
  workspace / Default main) and **After checks** (Wait for review /
  Automatically land) choices with the shared words, the line beside Start
  that names the choices and what Start authorizes, and a Command details
  disclosure that says where the session runs. It offers no Tracking choice:
  an unattached session has no work to track at launch, and a workflow the
  developer later invokes carries its own tracking in its instruction.
- The no-selection default is **Default main · Wait for review**. Decision:
  this keeps today's behavior, a conversation in the project folder; an
  isolated worktree for every conversation would accumulate workspaces that no
  landing retires; the existing-changes confirmation covers the remaining
  risk. The default is a stated choice, not an inference from the configured
  folder.
- A Default main start, including the default choices, follows the shared
  existing-changes contract: any uncommitted change in the default checkout
  shows the confirmation screen in place of the choices; Back and Cancel start
  nothing; Continue with existing changes starts the session with those
  changes preserved and never changes the landing choice. A clean checkout
  starts without a warning.
- An Isolated workspace start establishes one owned worktree under
  `.worktrees/` at fetched trunk, on the selected host's branch namespace,
  through the installed shared start, never by dashboard reimplementation, and
  publishes nothing. The native session opens in that worktree. The slug comes
  from the session's label (its instruction text, or `session` when the label
  is a time), numbered on collision as story workspaces are.
- The launch hands the established session context to the native session
  once, as a block in its first message beside the reporting context, on every
  host: workspace, its role (`isolated` or `default-checkout`), branch, remote,
  trunk target, landing intent, and starting revision. The block is sent when
  any choice is non-default; the default choices start as today, with or
  without an instruction, and a blank instruction with them stays a blank
  native launch. Launch and
  session records keep the policy and the workspace as local evidence, and
  the Sessions sidebar shows that workspace as it does for one-shot starts.
- A workflow or skill the developer later invokes in that session applies the
  established context instead of selecting a place of its own: the installed
  skills' one-shot, planless, and contextual paths work in the established
  workspace and branch and retain its starting revision; a standard tracked
  invocation is given the established workspace and branch and reports the
  installed start's answer, so no second workspace is created silently. The
  session's landing intent is the developer's advance keep for results that
  session lands, through one-shot delivery or Dough Land, with the launch's
  landing context. It grants no execution, admission, or Take: tracking,
  verification, and completion come from the invoked workflow and its
  instruction.
- A start that stops or expires keeps the workspace and branch it established
  with the attempt, so Continue from Startup recovery resumes that place and
  creates no second worktree.
- A Start session whose Workspace or After checks choice differs from a
  pending session's starts a new session; it never resumes that pending
  conversation in its workspace.
- An unattached session's landing is captured for its launch with no story
  identity: a result it lands, through one-shot delivery or Dough Land, keeps
  its landing evidence with the launch record.

Deferred promises (not built or verified here):

- No Tracking choice in Start session, no automatic story or task selection,
  and no change to the execution and refinement dialogs.
- No new cleanup for an unattached isolated worktree that never lands. Dough
  Land's existing retirement handles a worktree whose work trunk contains;
  otherwise it stays, as a review-waiting one-shot result does.
- Review-waiting results of an unattached session are not represented as
  published preparation or completion; origin alone decides story facts.
- No new hosts.

Boundary assumptions:

- The shared policy definition stays the one owner of values, flags, and
  words; an unattached request carries workspace and landing only. The rule
  that non-default workspace and landing need one-shot tracking is a story
  workflow rule and does not apply to a session with no workflow.
- Confirming existing changes authorizes including them in whatever the
  session later commits; it never selects automatic landing.
- A direct skill invocation outside a dashboard launch keeps its existing
  contracts: no clean-main prerequisite, no confirmation.
- Native behavior proof on Claude Code, Codex, and Cursor (ADR 0005) is the
  paid manual observation of
  [Observe an unattached Start session on the native hosts](#unattached-session-native-observation),
  run once a release installs this story's payload; deterministic launch
  tests do not substitute for it.

#### Key examples

- Clean default checkout; the developer opens Start session, keeps the
  defaults, types “Explain how launch records are stored”, Start → the
  session starts in the project folder with that text and the reporting
  context, as today: no established block, no story, Take, or assignment.
- Default checkout with two uncommitted files; Start session with the default
  choices, Start → “Existing changes in default main” lists the two paths and
  says that continuing includes them in this session's result and that Wait
  for review remains selected. Back returns to the choices unchanged; Cancel
  starts nothing; Continue with existing changes starts the session in the
  project folder with both files untouched.
- Isolated workspace · Wait for review, instruction “Tidy the README wording”
  → a worktree `.worktrees/tidy-the-readme-wording` on
  `claude/tidy-the-readme-wording` at fetched trunk; the session opens there,
  its first message carries the established session block and the reporting
  context; nothing is pushed and no card changes. The session edits and
  commits; the result waits in that worktree until the developer asks the
  session to land it, which Dough Land does from that worktree and then retires
  it.
- Isolated workspace · Automatically land, blank instruction → the line beside
  Start says verified results land on origin without another review and that
  pressing Start authorizes that push; the session's first message is the
  established block alone. The developer only asks questions → nothing lands
  and nothing claims completion. Later they type
  `/dough-execute-plan SEED-X#story --one-shot` → the one-shot start uses the
  established worktree, the story stays queued, and the verified result lands
  automatically with the launch's landing context, closing the story in that
  commit.
- Default main session; the developer types
  `/dough-story-refinement SEED-Y#story` → the refinement announces its
  Preparing assignment and prepares in its own owned workspace exactly as a
  direct invocation from the default checkout does today; the session's
  landing choice grants that tracked lifecycle nothing.
- Codex selected, Isolated workspace · Wait for review → the native
  conversation starts with the worktree as its working directory and the same
  block; Cursor starts with that worktree as `--workspace`, and a blank Cursor
  start with a chosen model stays refused.
- Isolated workspace start whose script wait expires → “Startup needs
  reconciliation” beside Start session names the worktree; Continue resumes
  the kept workspace and branch and creates no second worktree.

#### UI

Follow the story dialogs' hierarchy rather than a second design: instruction
(focused on opening), Host and Model on one row, the Session group in view
with Workspace and After checks radio groups and no Tracking group, then the
Command details disclosure, Cancel and Start. The line always in view beside
Start reads `Default main · Wait for review` with “The session runs in this
project's folder on default main, with its existing changes; nothing is
published.”, or for Automatically land “…verified results land on origin
without another review. Pressing Start authorizes that push.” Command details
say where the session runs and show the established block's fields; Start
session has no command line. The existing-changes screen is the story
dialogs' screen. Validate narrow widths and 200% zoom before accepting the
dialog; there is no story title to stretch it.

#### Architecture

The seed's shared direction above places each responsibility; this story adds
only the unattached handoff. Planning names the reused operations and probes
the contracts below before dependent slices.

- **Request and records.** An unattached request carries `policy` (workspace,
  landing) and the transient `existingChanges` fingerprint; the launch
  boundary runs the same unconfirmed-changes check for it as for a story
  start. Records keep policy and workspace, never the fingerprint.
- **Establishment.** The launch boundary establishes an isolated workspace
  through the installed shared start for unlisted one-shot work (an owned
  workspace at fetched trunk, publishing nothing) or the default checkout
  taken as it is, with its branch and ongoing-operation checks. Probe which
  installed operation accepts a start with no identity and what its receipt
  carries before choosing between reusing it and adding a thin shared session
  operation beside it. The dashboard creates no worktree itself and the native
  session creates none.
- **Handoff.** An “Established session” block, distinct from the established
  one-shot start and preparation blocks because it names no tracking,
  identity, or agent, spelled by the shared session policy's owner and
  prepended by each host adapter where it prepends established starts.
- **Inheritance.** The installed skills gain one shared rule for an established
  session: one-shot, planless, and contextual paths take workspace, role,
  branch, and starting revision from the block and skip workspace selection;
  tracking comes from the invocation; the block's landing is the advance keep
  for that session's landings and is independent of workspace. Probe whether
  the installed tracked start accepts an existing established worktree
  (`existing` or `continued`) so the standard-invocation example promises
  only what the start answers.
- **Evidence.** Everything here is local launch evidence; origin decides story
  facts. ADRs 0002, 0005, and 0006 apply as the shared direction records; no
  new ADR or status change.

#### Dependency and boundary

The shared session policy, one-shot refinement and execution, the
default-checkout confirmation, and the launch landing context are delivered;
this story extends them to the project row's Start session. The story dialogs
stay useful without it.

<a id="unattached-session-native-observation"></a>

### Observe an unattached Start session on the native hosts

**Identity:** SEED-066#unattached-session-native-observation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** A developer who relies on Start session's Workspace and After checks
choices knows, from an observation on real Claude Code, Codex, and Cursor
sessions, that each native host opens in the established place, reads the
“Established session” block, and lets a later invoked workflow use that place
and landing intent. This is the ADR 0005 proof of
[Choose workspace and automatic landing for unattached Start session](#unattached-session-options),
split from it because the observation needs a released payload that exists
only after that story lands.

#### Scope

Required behavior:

- The developer runs the observation below on each of Claude Code, Codex, and
  Cursor and records what was observed against each expectation.
- A discrepancy becomes a bounded correction before this story closes; an
  observation with no discrepancy changes no product behavior.

Boundary assumptions:

- Each native run is paid and manual; an agent does not run it.
- The starting state needs the release that carries the delivered story's
  payload installed for each observed host.

#### Key examples

- Claude Code, Isolated workspace · Automatically land, no text → the
  conversation opens in `.worktrees/session` with the block as its first
  message; a question lands nothing; `/dough-execute-plan <queued trivial
  story> --one-shot` reuses that worktree and lands the verified result with
  no landing request.
- A project whose installed skills predate the payload → the dialog disables
  the two non-default choices and says why; the observation for that host ends
  there.

#### Decisions before running

- Release order: ADR 0005 asks for native acceptance before affected behavior
  is released, while this observation needs a release that installs the
  payload. The delivering execution's coordinator recommended releasing first
  and treating this story as the acceptance gate, since the two non-default
  choices stay disabled wherever the payload is absent.
- Coverage: the observation below does not cover Isolated workspace · Wait
  for review landed later by Dough Land, a Default main session invoking
  refinement, or `landing: review` being honored. Their only proof is the
  guidance and start-script tests. The recommendation was to add the first two
  as journeys.

#### Observation

Three paid native sessions and one short Claude Code session:

- Starting state: a project whose installed skills, for each host observed,
  include `established-session.mjs`, `references/established-session.md`, the
  `dashboard-landing.mjs` that exports `acceptsLandingWithoutIdentity`, and
  the start with the path-identity comparison; a dashboard built from this
  branch; a clean default checkout; one queued trivial story per host.
  Without that payload the dialog disables the two non-default choices, which
  is the expected answer and ends the observation for that host.
- Per host (Claude Code, Codex, Cursor), in breadth first:
  1. Start session, Isolated workspace · Automatically land, no text. Expect
     the line beside Start to name the push Start authorizes; one worktree
     `.worktrees/session` on `<host>/session`; the conversation opening there;
     its first message being the block (`workspace role: isolated`, `landing:
     auto-land`, a `startingRevision`, no `fetched` line) then the reporting
     context naming `--landing-context`; the Sessions sidebar naming the
     worktree; origin unchanged.
  2. Ask a question. Expect an answer and nothing committed, pushed, or
     reported complete.
  3. Type `/dough-execute-plan <queued trivial story> --one-shot`. Expect the
     start to answer `prepared` with `created: false` for that worktree, no
     second worktree, the story left queued until the result commit closes it,
     the verified result landed on origin with no landing request, the launch
     record holding the landing with no identity, and the worktree retired.
- Claude Code only: with one uncommitted file in the default checkout, Start
  session with the default choices and a line of text. Expect “Existing
  changes in default main”, Back keeping the text, and Continue starting in
  the project folder with the file untouched and no block.
- Depth, if time remains: let one Isolated start outlast its wait
  (`DOUGH_START_TIMEOUT_MS`) and Continue it from Startup recovery, expecting
  the same worktree; start a second blank Start session with other choices
  while one is pending, expecting a new session.
- Record per host: the dashboard version, the installed payload version, what
  was observed against each expectation, and any discrepancy with its
  evidence.

Safe stopping point: ADR 0005 evidence recorded; the story is complete.

<a id="unattached-start-leftovers"></a>

### Leave nothing behind after an unattached start

**Identity:** SEED-066#unattached-start-leftovers
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/300-unattached-start-leftovers/PLAN.md"}
```

**Goal:** A developer whose Isolated workspace start succeeded but whose native
session did not start is told which worktree was left and reuses it on the
next try, and this machine's kept unattached starts do not outlive their
attempts. This is a bounded correction from the execution retrospective of
[Choose workspace and automatic landing for unattached Start session](#unattached-session-options);
it adds no feature promise.

#### Scope

- A failed native launch after an established unattached session names the
  workspace and branch left and keeps the start, so Continue or the same Start
  again reuses it.
- A kept unattached start is removed when its attempt is pruned.
- The story's interim residue is removed: the unread `created` fact and the
  documentation sentence the source no longer supports.
- Each Start session rule is proved once at the boundary that owns it.

Plan: [300-unattached-start-leftovers](../slice-plans/300-unattached-start-leftovers/PLAN.md).

## Existing Behavior to Reconcile

- [Current one-shot guidance](../../src/skills/dough-execute-plan/references/one-shot.md)
  excludes refinement and normally publishes execution automatically. The new
  review default must reconcile startup publication-authority assumptions,
  retention, later landing, queued-story closure, and recovery.
- [Dashboard launch documentation](../../dashboard/AGENT-LAUNCH.md),
  [launch startup](../../dashboard/server/launchStart.ts), and
  [Claude host launcher](../../dashboard/server/hosts/claude/launch.ts) show that
  ad hoc launch skips workflow establishment and currently supplies only the
  user's instruction in the configured project folder. This is not proof of a
  default-main checkout or review-before-publication contract. The obsolete
  `dashboard/server/claudeLaunch.ts` reference has been replaced here.
- [Dough Land](../../src/skills/dough-land/SKILL.md) accepts dirty default-checkout
  work and unpublished temporary branches, and lands all checkout changes and
  unpublished commits. It does not itself close backlog work or release
  assignments. Calling workflows retain those obligations.

## Breadcrumbs

- Terry's 2026-10-01 refinement direction: change one-shot to review by default;
  create a separate unattached Start session story immediately after this one;
  require upfront architecture design for both; dashboard warns on any
  uncommitted default-checkout change and permits confirmation to proceed;
  skills need no clean-main prerequisite. Follow-up clarification authorizes
  committing all checkout content on warning confirmation while leaving the
  auto-land/review choice independent; careful domain, architecture, and UI design
  precede executable slice selection.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Preparation disposition](../../src/skills/dough-story-refinement/references/preparation-disposition.md).
