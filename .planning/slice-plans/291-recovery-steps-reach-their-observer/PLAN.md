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
Status: planned
Proof: Extend the mailbox CLI suite through the installed `stop` from the
default checkout after `git worktree remove`.

Behavior: An observer was armed from a worktree that no longer exists → its
coordinator runs `ci-mailbox.mjs stop <directory>` from another checkout of
the repository → the observer stops with a confirmed terminal result. A
mailbox of another repository is refused as today.

Give the mailbox commands and closure one access rule for a removed
worktree's observer in place of the list `observerAccess` builds. Run the
mailbox, hook, closure, and managed-delivery consumers.

Safe stopping point: the stop step works wherever guidance sends a caller.

### 2. Every gap reason ends in a step
Type: Behavior
Status: planned
Proof: A table-wide unit proof, and `trunk-closure-owner-gaps.test.mjs` for
the several-ended case.

Behavior: `finish` finds several of its coordinator's observers that each
registered the final closure and none live → its gap names that state with the
step the other ended cases use, and after the coordinator's next `deliver`
establishes a live observer the rerun registers on it, completes, and retires.
`ownership: "ambiguous"` keeps the one meaning of several live observers. No
reason any command can print ends in `undefined`.

Start from the observed journey above as the failing test.

Safe stopping point: one vocabulary, each entry with a step.

### 3. Rerun proofs keep one host for host-independent rules
Type: Structure
Status: planned
Proof: Closure suites stay green.

Run the default-checkout arming journey on one host and keep the per-host
difference, the session field, where it is asserted. Name the surviving
coverage for each removed case.

Safe stopping point: the correction is complete.

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
