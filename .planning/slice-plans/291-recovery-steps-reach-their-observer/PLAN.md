# Recovery steps reach the observer they name

**Identity:** SEED-121#recovery-steps-reach-their-observer
**Source:** [correction story](../../seeds/SEED-121-execution-observer-ownership.md#recovery-steps-reach-their-observer),
written by the execution retrospective of plan 288 on 2026-10-10.
**Provenance:** SEED-121#settle-observer-owner-edges, whose story and plan are
recoverable at
`2d373a2e015ff37d99a575232fe33abd71516349:.planning/seeds/SEED-121-execution-observer-ownership.md`
(anchor `settle-observer-owner-edges`) and
`2d373a2e015ff37d99a575232fe33abd71516349:.planning/slice-plans/288-observer-owner-edges/PLAN.md`;
reviewed commits `1ff314d3`,
`fc795844`, `b058ab61`, `8f348077` on
`origin/claude/settle-observer-ownership-at-its-recovery-edges` after claim
`6d19d738`. Planning only; this plan grants no Take, execution, or
publication.

## Goal and boundaries

A coordinator that follows a coverage gap's recovery step can carry it out.
Preserve plan 288's delivered behavior and plan 280's promises: owner-first
selection, no owner-free fallback, accepted publication reported beside any
coverage gap, sibling observers untouched, existing CLI forms, and Story
Branch Mode target binding. No new owner model, schema, or CLI flag. Modify
published guidance in `src/skills/` only.

## Current findings

Reviewed at `8f348077`.

| Finding | Evidence | Impact |
| --- | --- | --- |
| The stop a replacing session is told to run cannot reach an observer armed from a removed worktree | `ci-mailbox.mjs` `stop`, `register-push`, `acknowledge`, `await-revision`, and `complete-revision` read the mailbox with the default single root; `ownObserverRecovery` in `ci-host-bridge.mjs` and `wrap-up-closure-publication.md` name `ci-mailbox.mjs stop <recorded directory>`; only closure reads through `observerAccess` | The session gets "CI mailbox belongs to another checkout" and the worker runs to its budget; two access rules serve one concept |
| `ownerGapReason("deliver", …)` ends in `; undefined` for four kinds | `execution-increment-observation-gaps.mjs` `establishesOwn` has no `deliver` entry | Latent: `establishObservation` calls it only for several live observers, but the table promises a step per command |
| `finish` reports `ownership: "ambiguous"` with two meanings | `hostGap` in `trunk-closure-observer.mjs` keeps its own text, with no step, when several observers that are not live each registered the final closure; the shared table uses the value for several live observers | A coordinator cannot tell which recovery applies, and in the first case `finish` cannot retire: a later live observer of its own does not change the selection; no test reaches it |
| Closure rerun proofs repeat host-independent rules per host | `trunk-closure-owner.test.mjs` runs host by arming checkout, four retire-and-rerun journeys; hosts differ only in the session field | About 26 s for the file under load; the access rule is proven twice |

## Decisions for the developer

Outside this plan until decided; each names what the answer changes.

- **Ambient `finish` rerun after retirement.** Such a rerun with no covering
  observer registers on, completes, and stops the caller's one live observer
  of the target, as it already did while the worktree existed. Recommended:
  keep it, since that observer is this coordinator's own, and pin it with a
  test.
- **Native closure cases.** On Claude Code and Cursor they prove only that
  `finish` establishes its own observer, and the assessor has no signal for
  an absent `--session-json` or for `notifies`. Recommended: add those two
  assessor signals when the next paid run is authorized.

## Observed premises

Observed on 2026-10-10 at `8f348077`; no product file changed.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| A mailbox armed from a worktree becomes unreadable from the default checkout once that worktree is removed | Slice 1 | Scratch repository with one linked worktree; `createMailbox` with the worktree as root; `readMailbox` from the default checkout before and after `git worktree remove`, then with the list `[removed path, <repo>/.git]` | Readable before; "CI mailbox belongs to another checkout" after; readable through the list |
| `deliver` has no recovery step for the kinds that are not live | Slice 2 | `ownerGapReason("deliver", …)` for `missing`, `ended`, `lost`, `unavailable` | Each reason ends in `; undefined` |
| Installed commands can leave several ended observers that each registered the final closure | Slice 2 | `closureBesideSibling` for Claude Code: `deliver` registers the final closure on the owner's observer; that observer is stopped; the owner's next `deliver` establishes a second and `resume` registers the final closure on it; it is stopped; `finish --created-for-work` | `step: "observation"`, `ownership: "ambiguous"`, "owns 2 observers … that could carry the final closure …; none is chosen for it", cleanup not performed |

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| The taught stop reaches a removed worktree's observer | Slice 1: installed `ci-mailbox.mjs stop` from the default checkout on an observer armed from a worktree that was then removed reports the confirmed terminal result; an unrelated repository's mailbox is still refused |
| Every gap reason ends in a step with one meaning per `ownership` | Slice 2: unit proof over every kind and command of the shared table; the closure owner-gaps suite for the several-ended case |
| Rerun proofs keep their journeys at lower cost | Slice 3: the closure suites stay green with the default-checkout arming on one host |

## Ordered slices

### 1. The stop command reaches an observer armed from a removed worktree
Type: Behavior
Status: done
Proof: `npm test -- src/skills/dough-execute-plan/scripts/ci-mailbox-removed-worktree.test.mjs`
runs the installed `stop` from the default checkout after `git worktree remove`
against a live worker: confirmed terminal receipt, and an unrelated
repository's mailbox refused while it exists and after it is deleted.

Behavior: An observer was armed from a worktree that no longer exists → its
coordinator runs `ci-mailbox.mjs stop <directory>` from another checkout of
the repository → the observer stops with a confirmed terminal result. A
mailbox of another repository is refused as today.

Give the mailbox commands and closure one access rule for a removed
worktree's observer in place of the list `observerAccess` builds. Run the
mailbox, hook, closure, and managed-delivery consumers.

Safe stopping point: the stop step works wherever guidance sends a caller.

Learning: Git keeps no trace of a removed worktree, and `stop <directory>` is
not told the retired path, so the one access rule needs a recorded fact:
`createMailbox` writes the arming checkout's identity as `identity` in
`request.json`, and `readMailbox` uses it once the recorded root is gone. The
coordinator read "no new schema" as the owner model and CLI, which are
unchanged; the developer may revisit that reading. `readMailbox` takes one
root, `observerAccess` returns one root, and `ownerRoot` is gone.

### 2. Every gap reason ends in a step
Type: Behavior
Status: done
Proof: `execution-increment-observation-gaps.test.mjs` over every kind and
command of the table; `trunk-closure-owner-gaps.test.mjs` for the
several-ended journey through the installed `finish`, its rerun, and
retirement; `trunk-closure-observer-selection.test.mjs` for a live observer
that has yet to register the closure.

Behavior: `finish` finds several of its coordinator's observers that each
registered the final closure and none live → its gap names that state with the
step the other ended cases use, and after the coordinator's next `deliver`
establishes a live observer the rerun registers on it, completes, and retires.
`ownership: "ambiguous"` keeps the one meaning of several live observers. No
reason any command can print ends in `undefined`.

Start from the observed journey above as the failing test.

Safe stopping point: one vocabulary, each entry with a step.

Learning: An observer the next `deliver` establishes after the closure was
accepted registers it, and the earlier selection already chose it; only the
`ambiguous` label and the missing step were wrong on that path. A live
observer not yet told of the closure was passed over, and is now selected
beside several ended ones. `ownerGapReason` takes the several ended observers
as `registered`.

### 3. Rerun proofs keep one host for host-independent rules
Type: Structure
Status: done
Proof: `npm test -- src/skills/dough-story-wrap-up/scripts/trunk-closure*.test.mjs`
stays green with three rerun journeys in `trunk-closure-owner.test.mjs`.

Run the default-checkout arming journey on one host and keep the per-host
difference, the session field, where it is asserted. Name the surviving
coverage for each removed case.

Safe stopping point: the correction is complete.

Removed: the Cursor rerun armed from the default checkout. Its session field
stays in the Cursor rerun armed from the execution worktree; arming from the
default checkout and the rerun after retirement stay in the Claude Code and
Codex default-checkout reruns. The file's CPU time fell by roughly a tenth;
wall time under load showed no reliable difference.

## Story obligations

### G1. Observers armed before the change stay unreachable after removal
Reported: slice 1 — "Observers armed before this change carry no `identity` and behave as before (unreachable after their worktree is removed)."
Story clause: "the stop command reaches an observer armed from a worktree that is now gone"
Disposition: no user cost "A coordinator that follows a coverage gap's recovery step can carry it out": such an observer was armed by a runtime older than this correction and ends within its eight-hour budget; every observer armed after delivery records the identity. The retrospective found the report inexact: a `finish` rerun reached such an observer through the retired path before this slice and no longer does, within the same budget.

### G2. Only stop is proven through the CLI on a removed worktree
Reported: slice 1 — "Only `stop` is proven through the CLI on a removed worktree's observer. `register-push`, `acknowledge`, `await-revision` and `complete-revision` share the same `readMailbox` rule but have no removed-worktree case of their own."
Story clause: "The mailbox commands a recovery step names read an observer of the repository whichever of its worktrees armed it, also after that worktree was removed."
Disposition: proved by slice 1: the recovery step names `stop`, proved in `ci-mailbox-removed-worktree.test.mjs`; registration and completion on a retired worktree's observer run through the same `readMailbox` in the retire-and-rerun journeys of `trunk-closure-owner.test.mjs` and `trunk-closure-resume.test.mjs`.

### G3. Mixed ended and lost observers report the first classification
Reported: slice 2 — "Mixed states (one ended, one lost) report the first classification plus the `N of its observers…` clause; only the both-ended case is tested."
Story clause: "`ownership` values keep one meaning per command"
Disposition: no user cost "A coordinator that follows a coverage gap's recovery step can carry it out": `ended`, `lost`, and `unavailable` end in the same step for each command, and the reason lists every such observer.

### G4. The deliver step for kinds that are not live has only the unit proof
Reported: slice 2 — "The deliver step for not-live kinds has only the unit proof, since no `deliver` path prints it."
Story clause: "Each gap reason `deliver`, `resume`, and `finish` can print ends in a"
Disposition: proved by slice 2: `execution-increment-observation-gaps.test.mjs`, "every kind's reason for deliver, resume, and finish ends in a step naming a command to run"; no installed `deliver` path reaches those kinds.

### G5. Cursor armed from the default checkout has no end-to-end rerun
Reported: slice 3 — "Cursor armed from the default checkout no longer has an end-to-end case."
Story clause: "The closure rerun proofs keep one host for rules that do not differ by host."
Disposition: proved by slice 3: `trunk-closure-owner.test.mjs` keeps the Cursor session field in its execution-worktree rerun and the default-checkout arming in the Claude Code rerun; the arming checkout reaches product code only through `checkoutIdentity`, which reads no host.

## Execution complete

Product advice: no backlog change. The retrospective wrote one follow-up
correction, [SEED-121#recovery-holds-after-reuse-and-rerun](../292-recovery-holds-after-reuse-and-rerun/PLAN.md),
unqueued. Decide first whether `request.json` keeps the `identity` field this
execution added against "No new owner model, schema, or CLI flag"; the
follow-up's first slice builds on it.

## Verification and gates

Run focused suites through `npm test -- <paths>` with the Node in
`.node-version` and Bash 5 first on `PATH`, per
[tests/README.md](../../../tests/README.md). Each slice includes proof
acceptance, independent post-change refactoring, and coordinator-owned
formatting and delivery. Paid native runs are manual only.

## Pending native evidence

Carried from the delivered ownership story and its recovery-edges correction
under ADR 0005. No native run exists
for any of these; substitute and replay results are not native acceptance, and
each run is paid and needs the developer's authorization.

- Cursor and Claude Code: concurrent `deliver`, repair, and completion with the
  ambient session identity; `resume` and `finish` with ambient identity or
  `--session-json`.
- Codex: arm the documented cell with `COORDINATOR` set, confirm
  `<directory>/owner` after the first yielded output, run `deliver` with
  `--coordinator` and `--observer-directory`, and expect
  `observation.state: "reused"` on that directory; repeat with a second
  coordinator's stream live on the same target. Then `resume` and `finish` with
  the same inputs.
- Claude Code subagent coordinator: whether its Bash tool carries its parent's
  `CLAUDE_CODE_SESSION_ID` and whether it can state its own `agent_id` are
  unobserved. On the developer's decision of 2026-10-10 the guidance and
  receipt state only that the variable names the session alone and that an
  observer claimed with an `agent_id` is named by `--session-json` with both.
- Trunk-closure harness, every case
  `tests/git-publication-native.sh --native HOST --case trunk-closure/...`
  after its arming change: on Claude Code and Cursor one `finish` without
  `--session-json` whose receipt's `notifies` names the tool's variable; on
  Codex one `finish` carrying the note's coordinator and stream directory with
  `observation.state: "reused"`. `tests/native-publication.md` records the
  commands.
- Retained trunk-closure and git-publication evidence identities changed with
  the hashed modules.

## Sequence review and sizing

No slice target or limit was supplied. Each slice owns one outcome with its
proof. No concern remains inside this plan; the two developer decisions above stay outside it.
