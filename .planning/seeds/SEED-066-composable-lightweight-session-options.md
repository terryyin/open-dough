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

<a id="composable-lightweight-session-options"></a>

### Choose workspace and automatic landing independently for lightweight refinement and execution

**Identity:** SEED-066#composable-lightweight-session-options
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/191-composable-lightweight-session-options/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7c5bd175bcbfe9b8cee559776ad6631aa1208f030382e7eb5b1d518377ff7726","plan":"7154de2d1cbc7769d3647e1839fd35fc2a973de480384c8887498686905971dd"}}
```

**Slice plan:** [Composable lightweight session options](../slice-plans/191-composable-lightweight-session-options/PLAN.md)

**Goal:** Developers doing small refinement or execution can avoid unnecessary
assignment setup and independently choose where work happens and whether its
verified result waits for review or lands automatically, through skill invocation
and the dashboard's refinement/execution dialogs.

#### Scope

- Extend explicitly selected one-shot to refinement. It writes preparation facts
  through the existing recorder, without a new published Preparing assignment or
  Take. One-shot execution retains applicable eligibility, verification,
  escalation, completion, closure, and CI obligations.
- Adopt isolated workspace + wait for review as the one-shot default, replacing
  current automatic publication. Auto-land is opt-in. Offer independent default
  checkout and auto-land choices with the same meaning in direct invocation and
  the two story launch dialogs; preserve existing refinement options.
- Default-checkout work uses the established default checkout on the resolved
  trunk branch, without another worktree or temporary branch. Resolve its actual
  location and branch; a configured project folder alone does not establish them.
  No skill-level clean-checkout requirement is added. Dashboard launch warns on
  any uncommitted change and permits confirmed continuation.
- Auto-land supplies advance publication intent for the requested result after
  applicable verification succeeds and no blocking issue, conflict, or
  coordinator/human decision remains. Preserve normal ownership, authority,
  non-force reconciliation, affected-proof rechecking, and recovery obligations.
- Review-waiting and stopped results stay recoverable in the actual checkout.
  Report path, branch, changes, verification, and unresolved decisions; ending
  the session does not delete the checkout or draft. Later explicit landing
  continues from that result.
- Refinement publication leaves the story queued; it neither completes nor Takes
  it. Record refinement/approach/readiness truthfully: refined alone is not Ready.
  Release an existing assignment through its applicable lifecycle when needed.
  Execution retains its applicable completion and assignment-release obligations.
- Existing Taken work, established Preparing sessions, or another owner cannot
  be bypassed by these options. Ordinary tracked lifecycle is not silently
  converted to one-shot, and a lightweight overrun follows existing escalation.

#### Key examples

The four combinations below apply to an explicitly selected eligible one-shot
refinement or execution, through direct invocation or its dashboard dialog.

| Pre-condition → trigger | Result |
| --- | --- |
| Neither option selected → successful requested work | Use isolation, publish no new assignment, and retain a verified local result for review. |
| Default checkout only → requested work | Work directly on trunk there without a temporary branch/worktree; retain the result for review. |
| Auto-land only → verification passes and decisions are resolved | Work in isolation, land to the authorized remote target, and apply workflow cleanup obligations. |
| Both selected → verification passes and decisions are resolved | Work in the default checkout and land under the same conditions; retain the default checkout. |
| Default checkout contains any uncommitted change → dashboard Start | Warn before launch; cancel launches nothing; explicit confirmation permits launch and inclusion of existing content in the result; the landing selection is unchanged. |
| Default checkout is dirty → direct skill invocation | No dashboard warning or clean-main gate is imported into the skill; proceed within requested authority and preserve existing content. |
| Auto-land selected → verification fails or a domain/coordinator decision remains | Stop automatic landing, report the evidence/decision, and retain the local result. |
| Refinement updates examples and preparation facts → retain or land | The story remains queued; an unselected approach gets no invented Ready assessment. |
| Another owner takes the queued story before landing → publication attempt | Stop on changed ownership/membership, preserve the result, and leave the other claim intact. |
| Review-waiting result → explicit instruction to land | Reuse and verify the retained result and continue its applicable publication lifecycle. |
| Established Preparing session → resume | Reuse its recorded workspace and assignment; do not start a second lightweight preparation. |

#### Deferred promises and constraints

Unattached Start session controls belong to the next story below. No launch-time
SLA, zero-fetch guarantee, timing benchmark, network diagnosis, arbitrary checkout
picker, new dashboard host, owner registry, or publication queue is promised.
Example counts do not restrict naturally supported combinations. Human-owned
decisions and existing publication obligations remain genuine constraints.

#### UI and open decisions

Explain workspace and auto-land independently, show actual launch effects, and
keep one-shot explicit rather than inferring it from either choice. The dirty
warning is dashboard-only and overridable. Keep host/model selection,
cancellation, existing refinement combinations, and refusal reporting coherent.

Terry clarified that warning confirmation authorizes including existing changes
and committing everything in the checkout; it does not select auto-land. With
review selected, the combined result still waits for review. With auto-land
selected separately, the verified combined result may land without another
review stop. Use the same distinction for both stories.

Upfront architecture and UX/UI design are required in this story's slice plan.
Retain explicit one-shot; exact flag spelling is a design choice. Planning is
authorized; implementation is not authorized by this request.

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

Queue immediately after `SEED-066#composable-lightweight-session-options`.
Reuse its shared option and publication contracts; the first story remains useful
without this dialog extension. Do not add new hosts or automatic task selection.

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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/196-align-one-shot-callers-with-review-default/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c89c2432fbb14bed0d68c22e0fb54cf863862286c8193027e47d13b260e279ec","plan":"9a504fcf1036b46807d0049334286d887d2eb73c1c9b550ed6e868758a60064a"}}
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
