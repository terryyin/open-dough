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

The original one-shot workflow applied only to execution and normally published
its result. Lightweight refinement, review by default, and independent workspace
and landing choices have since been delivered, including unattached Start
session choices. Their native acceptance remains the selected story below.

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

<a id="unattached-session-native-observation"></a>

### Observe an unattached Start session on the native hosts

**Identity:** SEED-066#unattached-session-native-observation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/301-unattached-session-native-observation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"020fdcf13cd921bdaf3b1a20a537103331807740c39a4239bea4fd46ae6dcf83","plan":"280ee0a80d4a12d9c00e3aa2c8f174f3c64c47b0a91646799e54ea653aedd50b"}}
```

**Goal:** A developer who relies on Start session's Workspace and After checks
choices knows, from an observation on real Claude Code, Codex, and Cursor
sessions, that each native host opens in the established place, reads the
“Established session” block, and lets a later invoked workflow use that place
and landing intent. This is the ADR 0005 proof of Start session's Workspace
and After checks choices (`dashboard/LAUNCH-START.md`, “Start session”, and
the installed `dough-execute-plan/references/established-session.md`); it
needs a release that installs that payload.

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
- A host without the required payload can demonstrate the compatibility
  guard only. Its workflow and landing observations remain pending; disabled
  choices do not establish native acceptance for that host.

#### Key examples

- Claude Code, Isolated workspace · Automatically land, no text → the
  conversation opens in `.worktrees/session` with the block as its first
  message; a question lands nothing; `/dough-execute-plan <queued trivial
  story> --one-shot` reuses that worktree and lands the verified result with
  no landing request.
- A project whose installed skills predate the payload → the dialog disables
  the two non-default choices and says why; the observation for that host ends
  there.
- Claude Code, Isolated workspace · Wait for review → one-shot execution
  commits its verified result and queued-story closure locally; remote trunk
  still queues the story. A later explicit Dough Land publishes the retained
  result and closure, captures the original launch, and retires the worktree.
- Claude Code, Default main · Wait for review, existing harmless changes →
  warning confirmation preserves those changes at launch; explicit one-shot
  refinement with `--default-main` commits them with the refinement for review,
  with no assignment, push, or retirement.

#### Architecture

Observation follows the existing responsibility boundaries: the dashboard
selects and hands off session policy; the installed shared start establishes
and reuses the workspace; the invoked workflow owns tracking, verification and
queued-story closure; Dough Land owns publication and retirement. The launch
record is local evidence, not story state. No new runtime or storage owner is
needed for this observation.

The dashboard's `establishesUnattached` consumer checks for the installed start,
session policy and formatter. A false result blocks non-default starts; a true
result alone proves neither complete released payload nor native instruction
consumption, landing capture or workspace reuse. Inspect the complete tagged
installation under [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
and [ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md),
then obtain native behavior proof under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
The release-first exception below remains the only exception needed; Proposed
ADRs 0007–0009 add no binding constraint.

#### Decisions and release prerequisite

- On 2026-10-11 Terry approved the seed's release-first recommendation as an
  explicit exception to [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
  for the unattached Start session payload: release and install that payload
  before these paid native observations. The reason is that the observation
  needs the released installation and non-default choices stay disabled without
  it. Native acceptance remains pending, never inferred from the release.
  This exception does not change ADR 0005 generally or itself perform a release.
- Terry also selected both missing review journeys: Isolated workspace · Wait
  for review followed by a later Dough Land, and Default main · Wait for review
  followed by one-shot refinement with its result retained for review.
- The required payload is released in `v0.3.60` (tagged revision
  `f87b344806b899b1ef3d79bd8eaea013b63d3ad2`), still the highest numeric
  release on origin on 2026-10-13. No further release is a prerequisite for
  this story.
- Terry names the observation project and its publication target when the
  story is taken, from the dashboard's configured projects verified below.
  Another project, or one whose installation has changed since, repeats the
  plan's installation and capability checks before the first paid journey.

Current preparation evidence (2026-10-13, revision `f5f850fd`): every project
the dashboard is configured with on this machine (Open Dough, Doughnut,
Pygardon, Terry Talks, Lizard) has a clean default checkout whose installed
version records read `0.3.60`, with all 242 files declared by that tag's
`install.sh` matching byte for byte in both `.agents/skills` and
`.claude/skills`. The dashboard's `establishesUnattached` consumer returns
`true` for Claude Code, Codex and Cursor against each project's path. The
dashboard, Start session contract and released payload this story observes are
unchanged since the 2026-10-12 review. This settles the installed-payload
prerequisite for those projects; it proves no native acceptance. The plan
records the literal observations and their boundaries. No paid native journey
has been run by this preparation.

#### Observation

Five paid native sessions, run manually by the developer: three auto-land
journeys and two review journeys. Each journey is bounded to one initial
attempt; a failure is assessed before any separately agreed retry.

- Starting state: a project whose installed skills, for each host observed,
  include `established-session.mjs`, `references/established-session.md`, the
  `dashboard-landing.mjs` that exports `acceptsLandingWithoutIdentity`, and
  the start with the path-identity comparison; a dashboard revision carrying
  Start session choices; a clean default checkout; one unassigned queued
  trivial story per execution journey and one
  unassigned queued story with sufficient refinement input for the default-main
  journey. Use an observation project and publication target selected by the
  developer; record its actual paths and revisions before running.
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
  3. Invoke `dough-execute-plan <queued trivial story> --one-shot` using
     that host's native skill syntax. Expect the
     start to answer `prepared` with `created: false` for that worktree, no
     second worktree, the story left queued until the result commit closes it,
     the verified result landed on origin with no landing request, the launch
     record holding the landing with no identity, and the worktree retired.
- Claude Code, Isolated workspace · Wait for review: start a fresh blank
  conversation, then invoke one-shot execution of a different queued trivial
  story without landing flags. Expect the established worktree reused, a
  verified committed result and queued-story closure retained there, with the
  story still queued on remote trunk, no push, and no retirement. Later
  explicitly invoke Dough Land in that conversation. Expect that exact
  retained result published to the established target, the original launch's
  landing context captured, queued-story closure handled by the invoked
  workflow, and the owned worktree retired. Record before-review and
  after-landing evidence separately.
- Claude Code, Default main · Wait for review: with one harmless uncommitted
  file and a line of text, expect “Existing changes in default main”, Back
  preserving the text, and Continue opening in the project folder with the
  file untouched and no Established session block. Invoke
  `dough-story-refinement <queued story> --one-shot --default-main` there.
  Expect refinement and the existing file committed together in default main,
  the result retained for review, no Preparing/Take, no push, and no checkout
  retirement. These default launch choices send no block: the explicit
  `--default-main` invocation selects the refinement workspace; do not claim
  this case proves block inheritance. Confirmation includes the existing
  file in the result but does not authorize automatic landing.
- Depth, if time remains: let one Isolated start outlast its wait
  (`DOUGH_START_TIMEOUT_MS`) and Continue it from Startup recovery, expecting
  the same worktree; start a second blank Start session with other choices
  while one is pending, expecting a new session.
- Record per host: the dashboard version, the installed payload version, what
  was observed against each expectation, and any discrepancy with its
  evidence.

Plan: [301-unattached-session-native-observation](../slice-plans/301-unattached-session-native-observation/PLAN.md).

Safe stopping point: every required native expectation has passing evidence
or justified reuse for each affected host, and discrepancies have been resolved
through bounded corrections before closure. Missing payload, unavailable
hosts, failed runs, and inconclusive observations remain pending; recording
them alone does not complete the story.

<a id="cursor-trust-prompt-at-session-start"></a>

### See and answer Cursor's workspace trust prompt when a session starts

**Identity:** SEED-066#cursor-trust-prompt-at-session-start
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/305-cursor-trust-prompt-at-session-start/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7aa7ff3d0cc89360da02924cd9c728878cffef2a67e209b6e791f9f73eea0724","plan":"57e96cef882a3047426a82e0a4fb8b51728892b077593272d9fefc09be6d5ddb"}}
```

**Goal:** A developer who starts a Cursor session in a workspace Cursor has
not trusted learns from the dashboard that Cursor is waiting for workspace
trust, sees that prompt in the session's terminal, and gets the first input
delivered once they answer it. This is a bounded correction of a discrepancy
the [native observation](#unattached-session-native-observation) found on
2026-10-13.

#### Scope

- When the launch wait ends while the kept Cursor client shows its workspace
  trust prompt, the launch answer, Startup recovery and the session entry say
  that Cursor is waiting for workspace trust and that it is answered in the
  session's terminal.
- Opening that session's terminal shows the prompt the client currently holds.
- Answering the prompt there delivers the kept first input and confirms it, as
  it already does.
- The dashboard still passes no trust flag and answers no prompt itself.
- Other uncertain launch outcomes keep their current wording.

Plan: [305-cursor-trust-prompt-at-session-start](../slice-plans/305-cursor-trust-prompt-at-session-start/PLAN.md).

## Current Implemented Baseline

- [One-shot execution](../../src/skills/dough-execute-plan/references/one-shot.md)
  retains verified results for review by default, with queued-story closure in
  the local result commit. Explicit auto-land publishes after verification;
  later landing rechecks remote ownership before publication.
  [One-shot refinement](../../src/skills/dough-story-refinement/references/one-shot-refinement.md)
  supports the same independent workspace and landing choices without a new
  Preparing assignment.
- [Dashboard launch documentation](../../dashboard/AGENT-LAUNCH.md),
  [launch startup](../../dashboard/server/launchStart.ts), and
  [unattached start](../../dashboard/server/unattachedStart.ts) distinguish
  Default main · Wait for review (no start or Established session block) from
  the other choices (installed shared start, retained workspace and formatted
  block). [Start session](../../dashboard/LAUNCH-START.md#start-session) owns
  the maintained contract. Source inspection is not native acceptance.
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
