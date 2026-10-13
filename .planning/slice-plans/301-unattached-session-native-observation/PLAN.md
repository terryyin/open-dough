# Observe an unattached Start session on the native hosts

**Identity:** SEED-066#unattached-session-native-observation
**Source:** [selected story](../../seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-native-observation)

## Goal and scope

Give the developer native evidence that Start session opens in the established
workspace and a later invoked workflow honors that workspace and landing intent
on Claude Code, Codex, and Cursor. Add the two review journeys Terry selected on
2026-10-11. An observation with no discrepancy changes no product behavior.

Five manually operated paid sessions: one isolated auto-land execution per
host, one isolated review execution followed by explicit landing on Claude
Code, and one default-main warning/refinement/review journey on Claude Code.
Run one initial attempt per journey; assess failure before agreeing a retry.
Agent work is preparation and assessment of supplied evidence, not running the
paid native sessions. The developer chooses the observation project from the
verified projects below, with its remote, queued fixture stories, host models,
and session time budget at execution setup; record actual paths, target,
versions and revisions before observation.

Excluded: creating a release, installing untagged source as managed skills,
new test runners, a full host-by-scenario matrix, native Default main auto-land,
and implementation of hypothetical defects. Optional timeout recovery and
parallel pending-session exploration stay optional and cannot replace required
coverage. A discovered discrepancy requires a bounded correction and affected
re-observation before closure; do not pre-plan unknown repairs. The
[start-leftovers correction](../../done/SEED-066_unattached-start-leftovers.json)
closed on 2026-10-11; its completion does not supply this story's native proof.

## Current decisions and prerequisite

Terry explicitly approved release first on 2026-10-11, as the seed recommended:
a context-specific exception to [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md).
The release makes the required installed payload available; acceptance remains
pending until this story's native evidence passes. The exception grants neither
a release version nor execution authority to this preparation.

**Observation project:** Terry names it and its publication target at Take,
from the five dashboard-configured projects whose complete tagged installation
and capability result are in [preflight](PREFLIGHT.md). Each publishes to its own
configured remote and trunk. A project outside that set, or one whose installed
version record no longer reads `0.3.60`, repeats both checks against its actual
path before slice 1; a failing check leaves that project's native journeys
pending. The choice of project carries no unobserved premise.

[ADR 0003 — Release lifecycle](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
requires tagged payload;
[ADR 0004 — Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
requires the complete locally installed release rather than copied individual
helpers; [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires evidence per affected host, distinguishes native behavior from
substitute processes, and owns evidence assessment and cleanup. Follow
[AGENTS.md](../../../AGENTS.md); do not hand-synchronize managed installations.
This plan introduces no architecture decision or runtime guidance change.

## Reused paths and decisive premises

PFE finds the observation route already exists: [Start session](../../../dashboard/LAUNCH-START.md#start-session),
`dashboard/server/unattachedStart.ts`, native adapters under
`dashboard/server/hosts/`, and the released form of
[Established session](../../../src/skills/dough-execute-plan/references/established-session.md).
The installed workflow start owns workspace reuse; one-shot execution/refinement
owns tracking and result disposition; Dough Land owns publication and retirement.
The [North Star host seam](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
supports those existing homes.
Reuse these operations and their receipts; add no harness or parallel state store.
PFE rechecked these responsibilities against `unattachedStart.ts`, the source
`established-session.md` and `one-shot.md` on 2026-10-12. Review disposition
already closes queued work in the local result commit; remote backlog state
changes only when that commit lands. Judge these two locations separately.

[Preflight and execution setup](PREFLIGHT.md) retain the preparation workspace,
complete tagged-installation and capability commands/results, selected project,
deployment, hosts, fixtures and baseline. These checks establish the setup,
not native behavior.

Slice 1 is the early paid probe in the project named at Take. At preparation,
native instruction consumption, CWD, workflow reuse, publication and retirement
remain unobserved. A failed probe stops dependent journeys for assessment and
correction; evidence reuse requires an unchanged requirement/environment boundary.
Deterministic start/guidance specs prove their own boundaries, not native behavior.

## Outside-in proof ownership

Use a fresh native session per journey, with prompts naming the work rather
than supplying the expected answer. Observe the native transcript/tool activity,
Git worktree inventory and status, fetched remote history/backlog, dashboard
session workspace, and launch landing receipt. An agent's statement or exit 0
alone is insufficient. Retain concise judged evidence with this plan during
execution: requirement, host/runtime/model, dashboard revision, installed release,
project/workspace/target, fixture story, literal input, observed result and
relevant native/receipt references. Distinguish fresh evidence from justified
reuse; remove spent artifacts under ADR 0005 at closure.

| Promise | Owning slice and discriminating observation |
| --- | --- |
| Each native host opens the chosen isolated workspace, receives the block, and reuses it for a later workflow | 1–3: native CWD, first input and actual start receipt; exactly one workspace, no new assignment |
| A question alone claims, commits, pushes and completes nothing | 1–3: before/after Git and launch completion state |
| Auto-land honors launch intent without another landing request | 1–3: native workflow invocation omits landing flags; accepted result SHA, queued-story closure, original launch capture and retirement |
| Review retains the isolated result until requested | 4: local result commit includes closure, while remote still queues the story; explicit Dough Land publishes the result and closure, captures the original launch and retires the owned workspace |
| Default-main warning preserves input and work; refinement waits for review | 5: Back/Continue behavior, unchanged file at launch, same checkout and committed combined result after refinement, no push or new assignment |
| Older installations cannot offer unsupported choices | Preflight of each affected host: disabled controls and explanation; count only this guard as covered, leave native journey pending |
| Every discrepancy is resolved before closure | Owning failed slice stays unfinished; link bounded correction and its subsequent native result |

## Ordered slices

### 1. Claude Code consumes the isolated auto-land handoff
Type: Behavior
Status: done
Proof: developer observes the source story's per-host steps 1–3 on Claude Code.

[Judged observation](AUTO-LAND-OBSERVATIONS.md#1-claude-code) retains the native
setup, exact inputs, receipts, results and discrepancies.

Behavior: with the prerequisite installed and a clean observation project,
Start session · Isolated workspace · Automatically land, no text → one session
workspace (normally `.worktrees/session`, collision suffix when needed) on the
host branch; native CWD and sidebar match; first input contains `workspace role:
isolated`, `landing: auto-land`, `startingRevision`, no `fetched`, and reporting
context with `--landing-context`; no initial publication or claim. Ask a
question → answer only. Invoke one-shot execution of the prepared trivial story
with the host's native skill syntax, without `--auto-land` → start reports
`prepared`, `created: false`, verified result lands with no extra request,
original launch capture has no story identity, story closes and worktree retires.

This is the first paid probe. Failure stops dependent paid observations until
its cause and affected boundaries are assessed. Success proves Claude Code
only. Safe stop preserves its judged evidence and leaves other hosts pending.

### 2. Codex consumes the same isolated auto-land intent
Type: Behavior
Status: done
Proof: same complete journey as slice 1 in a fresh Codex session, using Codex's
native skill invocation syntax and a different queued fixture story.

[Judged observation](AUTO-LAND-OBSERVATIONS.md#2-codex) retains the native
setup, exact inputs, receipts, results and discrepancies.

Behavior: after the prerequisite and probe, repeat start → question → one-shot
execution → landing in Codex. Observe its own native CWD, instruction, start,
Git result and launch capture. Do not infer success from Claude Code. Safe stop
leaves Cursor and the review journeys pending.

### 3. Cursor consumes the same isolated auto-land intent
Type: Behavior
Status: done
Proof: same complete journey as slice 1 in a fresh Cursor session with a distinct
fixture story, including visible instruction submission in its native terminal.

[Judged observation](AUTO-LAND-OBSERVATIONS.md#3-cursor) retains the native
setup, exact inputs, receipts, results and discrepancies.

Behavior: start → question → one-shot execution → landing uses the established
Cursor workspace, not a host-created second worktree. Judge Cursor's own
instruction consumption, start receipt, result and original launch capture.
Safe stop retains three-host auto-land proof; review remains pending.

Trust correction passed on 2026-10-14; [fresh native evidence](AUTO-LAND-OBSERVATIONS.md#cursor-trust-correction-re-observation)
resolves that discrepancy. Retirement and missing Cursor completion remain
separate; this slice retains the gated-retirement ordering limitation.

### 4. An isolated review result waits and later lands
Type: Behavior
Status: done
Proof: source story's Claude Code isolated review journey; compare the remote
and owned workspace before review and after explicit Dough Land.

[Judged observation](REVIEW-OBSERVATIONS.md#4-isolated-review-and-explicit-landing) retains the native
setup, exact inputs, receipts, results and discrepancies.

Behavior: Start session · Isolated workspace · Wait for review → established
`landing: review`; invoke one-shot execution without landing flags → verified
committed result and story closure stay in the same owned workspace; remote
trunk is unchanged and still queues the story. Explicitly invoke Dough Land →
the retained-result ownership recheck and landing publish that result and closure,
capture the original launch's landing context and retire the owned workspace.
A missing closure or unsolicited
push is a discrepancy, not permission to revise the expected behavior.

### 5. Default-main refinement preserves changes and waits for review
Type: Behavior
Status: done
Proof: source story's Claude Code default-main warning plus refinement journey,
with a harmless existing file and an unassigned queued refinement fixture.

[Judged observation](REVIEW-OBSERVATIONS.md#5-default-main-refinement) retains the native
setup, exact inputs, receipts, results and discrepancies.

Behavior: default Start choices with text and an existing uncommitted file →
warning; Back preserves text; Continue opens the default checkout with that
file untouched and no Established session block. Invoke
`dough-story-refinement <identity> --one-shot --default-main` → same default
checkout, refined seed and existing file committed together, no Preparing or
Take, no push or retirement. The retained result and branch are available for
review. Explicit `--default-main` is essential because this launch sends no
block; the check proves the default path, not inherited block intent.

The operator retains the review result for a later explicit disposition; its
absence from published preparation is expected. Do not delete or publish it as
observation cleanup. Safe stop records the result and its location accurately.

## Execution complete

Product advice: no correction beyond the two already closed. Three candidates
for the backlog owner, none queued: Lizard's CI workflow is `python-app.yml`,
so installed completion cannot observe its CI; Cursor's one-shot execution sent
no dashboard completion report on 2026-10-13; a deleted Cursor attempt left
kept-start state that blocked a fresh launch (plan 304 evidence).

## Observation outcome

Judged 2026-10-14: every promise in the proof table has passing native evidence on each affected host. Slices 2, 4 and 5 passed on 2026-10-13; slices 1 and 3 passed except for two discrepancies, both corrected and re-observed:

1. **Retirement after an auto-land one-shot execution was read two ways.**
   Corrected by `SEED-066#retire-established-session-worktree` in release
   `0.3.61`; Claude Code and Cursor then retired the session worktree
   ([re-observation](RETIREMENT-OBSERVATIONS.md)). Completed plan: `53e21c3cffe9193174c77c5e524b10c4920e49f3:.planning/slice-plans/304-retire-established-session-worktree/PLAN.md`.
2. **Cursor's workspace trust prompt blocked an isolated Start unseen.**
   Corrected by `SEED-066#cursor-trust-prompt-at-session-start`
   ([fresh Cursor proof](AUTO-LAND-OBSERVATIONS.md#cursor-trust-correction-re-observation)).
   Completed plan: `4bd36244a6eb0d9227500b488d19dd58aec202b6:.planning/slice-plans/305-cursor-trust-prompt-at-session-start/PLAN.md`.

Accepted limitation, outside this story's promises: installed CI completion
answered `observation_unavailable` in Lizard, so both re-observed sessions
retired before an observer-confirmed green; that ordering stays unproved.

On Terry's instruction (2026-10-13) the leftover Lizard worktrees were retired
and slice 5's retained `ea7fae3` was dropped.

## Review and execution gates

The sequence uses one established-session model and one proof loop per native
journey. No implementation structure is prescribed. Slice-plan refinement is
not needed: no fragmented outcome, duplicated implementation or unmapped promise
was identified. No blocking concern remains: the installed-payload premise is
observed in every configured project, and naming one of them with its fixture
stories is execution setup.
Paid host behavior is bounded by slice 1's early probe; it is not claimed settled.

Use the project's execution delivery/refactoring gates when authorized; no
automated suite substitutes for paid observations. Validate links, preparation
records and whitespace for planning-only changes; normal commit hooks still run.
Unknown defects return through bounded correction and appropriate focused tests,
without speculative repairs.
Do not mark the story complete while any required host, review journey, or
result-affecting discrepancy remains pending. No execution-complete record is
written during preparation.
