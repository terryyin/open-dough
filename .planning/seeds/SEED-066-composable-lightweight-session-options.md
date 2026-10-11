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

<a id="unattached-session-native-observation"></a>

### Observe an unattached Start session on the native hosts

**Identity:** SEED-066#unattached-session-native-observation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/301-unattached-session-native-observation/PLAN.md","assessment":"not-ready","reasons":["The required established-session payload is not released or installed in an observed target project: establishesUnattached returned false for Claude Code, Codex and Cursor in the preparation checkout. Terry must arrange release/install under the approved exception, then obtain a fresh capability result in the selected observation project before native Start journeys can run."],"basis":{"document":"6b836ece32660f61b6eec6d845ec28a69298762befa45e8f816b91bdc407707b","plan":"865737d770301c9fc115a0c38b924f2ee5b2bf29a19dc4c607c102f328ab1283"}}
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
- The required payload is not in `v0.3.59`, the highest numeric remote release
  observed on 2026-10-11. Release ownership remains with Terry; execution needs
  the release carrying this payload installed for each selected host. No release
  number is selected by this preparation.

Current preparation evidence (2026-10-11, revision `4e4c2c01`):
`git ls-remote --tags origin 'v0.3.*'` identifies `v0.3.59` as the highest remote
numeric release. `git ls-tree v0.3.59
src/skills/dough-execute-plan/references/established-session.md` returns no
entry; `git tag --contains e5e26130` returns no tag. The source reference and
helper are declared in `install.sh`, but source presence is neither installed
payload nor native acceptance. The plan records the actual installation
capability check and its unavailable result for all three hosts.

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
  verified committed result retained there, no push, and no retirement. Later
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

<a id="unattached-start-leftovers"></a>

### Leave nothing behind after an unattached start

**Identity:** SEED-066#unattached-start-leftovers
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/300-unattached-start-leftovers/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"86f09fb99b1956eb3ab5a1369fb22a7bfbd61c38a85e75d95d375de90920f979","plan":"bd534b19e18368bbd68685936ac80609f0b0f312276007e42685b36ca3f33c5a"}}
```

**Goal:** A developer whose Isolated workspace start succeeded but whose native
session did not start is told which workspace and branch remain and can resume
that established start on the next try. This machine's kept start records
expire with their attempts. This is a bounded correction from the execution
retrospective of
the delivered Start session choices (`dashboard/LAUNCH-START.md`, “Start
session”); it adds no feature promise.

#### Scope

- A failed native launch after an established unattached session names the
  workspace and branch left and keeps the start, so Continue or the same Start
  again reuses it.
- A kept unattached start is removed when its attempt is pruned.
- The story's interim residue is removed: the unread `created` fact and the
  documentation sentence the source no longer supports.
- Each Start session rule is proved once at the boundary that owns it.

Deferred promises: deleting a worktree that never lands, displaying a landed
run, and observing the real native hosts stay outside this correction. The
last remains the separate native-observation story above. Key examples,
findings, preserved promises, and executable proof stay in the correction plan.

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
