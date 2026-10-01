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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Developers starting an unattached dashboard conversation can choose its
workspace and landing intent without those choices creating a story or assignment.

#### Scope

- Offer the same independent workspace and auto-land choices in Start session,
  using the shared contract delivered by the preceding story.
- Carry the choices and actual workspace into the existing native hosts without
  silently invoking story refinement/execution or manufacturing a selected task.
- Follow the shared default-checkout warning contract: any uncommitted change
  warns before dashboard launch; explicit confirmation allows continuation.
- A conversation alone creates no result to land. If the developer later requests
  work or invokes a skill, its instruction and applicable workflow determine
  tracking, verification, and completion. Turning one-shot off does not itself
  admit or assign work. Preserve recoverable review-waiting results.
- Require careful upfront architecture review of the ad hoc launch path and
  subsequent workflow handoff before implementation, using the shared direction
  above. Do not duplicate the first story's runtime policies in host prompts.

#### Key examples

- Unattached conversation + either/both choices → launch in the selected location
  with the stated landing intent, without a story, Take, or assignment publication.
- Unattached conversation + no work requested → no automatic landing or fabricated
  completion; ordinary conversation remains possible.
- Default checkout has uncommitted changes + Start → warning; cancel starts
  nothing, confirmation starts while preserving those changes.
- Unattached session later explicitly invokes a workflow → apply that workflow
  using the established context rather than silently creating a second workspace
  or granting execution from a workspace/publication option.

#### Dependency, boundary, and open decisions

Reuse the delivered shared session policy and publication contracts; the story
dialogs remain useful without this dialog extension. Do not add new hosts or automatic task selection.

This is a captured follow-up, not a completed refinement. Settle the no-selection
workspace default for unattached conversations (currently the configured project
folder) and how later workflow invocation inherits established options. Warning
confirmation includes existing content, independently of landing policy. Review the
actual ad hoc handoff before planning; do not infer default main or review policy
from today's configured folder alone.

<a id="align-one-shot-callers-with-review-default"></a>

### Align one-shot callers and starts with the review default

**Identity:** SEED-066#align-one-shot-callers-with-review-default
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/196-align-one-shot-callers-with-review-default/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c89c2432fbb14bed0d68c22e0fb54cf863862286c8193027e47d13b260e279ec","plan":"d196e5f4338502e8c497981c4d659e5e45fbd209e734f17909d3bcd299e277fc"}}
```

**Goal:** Developers and agents relying on one-shot work get guidance, start
refusals, and session-policy rules that agree with the review default delivered
by `SEED-066#composable-lightweight-session-options`, so a kept result is
landed through its guarded path and the default checkout is never treated as an
owned tracked workspace.

**Scope:** A bounded retrospective correction. Update one-shot callers' wording
and the review report's landing route; refuse owned or tracked starts that name
the repository's main worktree; keep the one-shot-only choice rule and one-shot
context detection in one place each; consolidate the duplicated queued one-shot
test fixtures. Preserve every promise of the original story. No new feature
promise, Dough Land change, host, or native case.

**Plan:** [bounded correction input and slices](../slice-plans/196-align-one-shot-callers-with-review-default/PLAN.md).

<a id="dough-land-kept-one-shot-ownership"></a>

### Check how Dough Land handles a kept one-shot result whose story was taken

**Identity:** SEED-066#dough-land-kept-one-shot-ownership
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer who lands a kept one-shot execution result with Dough Land
instead of the guarded one-shot landing never publishes a queued story's closure
over another owner's claim.

#### Scope

- First observe, without paid native runs: keep a queued one-shot execution
  result (result plus story closure) in its owned workspace, publish a rival
  Take of that story to the remote, then run Dough Land on the workspace.
  Record whether it stops with nothing pushed (for example through the backlog
  merge adapter's conflict) or publishes the closure over the rival claim.
- If it stops with nothing pushed, keep Dough Land unchanged and retain the
  observation as proof; the review report's guarded landing route is enough.
- If it publishes over the claim, Dough Land runs the same ownership recheck the
  guarded one-shot landing uses before each push, as one-shot refinement already
  does, or refuses and names the guarded route. Choosing between redirect and
  refusal is a human decision at that point. A Dough Land guidance change needs
  manual paid native re-acceptance of the affected landing journeys.

#### Out of scope

- Unlisted one-shot results, which carry no story to protect.
- One-shot refinement, which already rechecks before Dough Land pushes.

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
