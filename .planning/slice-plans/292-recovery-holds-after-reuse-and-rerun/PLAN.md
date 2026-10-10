# Recovery holds after a path is reused and after finish reruns

**Identity:** SEED-121#recovery-holds-after-reuse-and-rerun
**Source:** [correction story](../../seeds/SEED-121-execution-observer-ownership.md#recovery-holds-after-reuse-and-rerun),
written by the execution retrospective of plan 291 on 2026-10-10.
**Provenance:** SEED-121#recovery-steps-reach-their-observer, whose story and
plan are at
`7e27929ff5d147631bb1c3ed4d6a576070caa457:.planning/seeds/SEED-121-execution-observer-ownership.md`
(anchor `recovery-steps-reach-their-observer`) and
`7e27929ff5d147631bb1c3ed4d6a576070caa457:.planning/slice-plans/291-recovery-steps-reach-their-observer/PLAN.md`;
reviewed commits `f8baebc9`, `85c8fb51`, `7e27929f` on
`origin/claude/recovery-steps-reach-the-observer-they-name` after claim
`48ec2ca9`. Planning only; this plan grants no Take, execution, or
publication.

## Goal and boundaries

A coordinator's recovery of an ended observer holds on two edges plan 291 left
open. Preserve plan 291's delivered behavior and plans 288 and 280's promises:
one access rule for every mailbox reader, an unrelated repository refused,
owner-first selection, no owner-free fallback, accepted publication reported
beside any coverage gap, sibling observers untouched, existing CLI forms, and
`ambiguous` meaning several live observers. No new record field, owner model,
or CLI flag. Product changes stay in `src/skills/`.

## Current findings

Reviewed at `7e27929f`.

| Finding | Evidence | Impact |
| --- | --- | --- |
| The recorded arming identity is used only while the recorded path is absent | `armingIdentity` in `ci-mailbox-location.mjs` reads the live path whenever `request.root` exists | Once anything recreates the removed worktree's path, `stop` is refused again; a different repository created at that path reads the mailbox |
| A `finish` rerun cannot settle after several ended observers registered the final closure and one completed it | `ownedObservers.select` in `trunk-closure-observer.mjs` selects an ended covering observer only when it is the one covering observer, and reads no completion | The rerun `wrap-up-closure-publication.md` promises ("repeats completion on this coordinator's observer that covers it") reports `step: "observation"`, `ownership: "ended"`, and "report the final closure's coverage as lost" after a successful closure |
| Guidance states the two rules more broadly than they hold | `wrap-up-closure-publication.md` `step: "observation"` row says "none of this coordinator's observers covers it"; `ci-notify-hosts.md` says an observer "keeps the identity of the worktree that armed it after that worktree is removed" | The first contradicts the reason `finish` prints for several ended observers; the second is false for a recreated path until slice 1 |
| The journey test carries a step it does not need | `await journey.resume(final)` in `trunk-closure-owner-gaps.test.mjs` and the `resume` helper in `trunk-closure-owner-test-fixtures.mjs` exist for it alone; `deliver` already registers the accepted closure | A fixture surface with no proof behind it |
| The gap table's unit proof restates the table's wording | `stepStart` and the step alternation in `execution-increment-observation-gaps.test.mjs` copy each recovery phrase; the kind list is copied by hand; `registered` is passed for `deliver` and `resume`, which no caller does | Rewording breaks the test with no behavior change, and a new kind would go uncovered |
| `hostGap` classifies again after `select` | `trunk-closure-observer.mjs` calls `classifyOwnedObservation` inside the gap | An observer claimed between the two could print "went live" beside "none is live"; not observed |

## Decisions for the developer

Outside this plan until decided; each names what the answer changes.

- **The `identity` field.** Plan 291 said "No new owner model, schema, or CLI
  flag"; slice 1 added `identity` to `request.json` because Git keeps no trace
  of a removed worktree and `stop <directory>` is not told the retired path.
  The independent review found no field-free rule that still refuses an
  unrelated repository. Recommended: accept the field; slice 1 below builds on
  it. Rejecting it removes slice 1 and returns `stop` to refusing a removed
  worktree's observer.
- **One ended covering observer beside a live one that does not cover.**
  `finish` selects the ended one, as before plan 291, and may retire on its
  receipt while the live observer runs to its budget. With several ended ones
  it selects the live one. Recommended: prefer the live observer in both, in a
  later correction, once a journey shows the retirement consequence.
- **Observers armed before plan 291.** They carry no `identity`; after their
  worktree is removed `stop` cannot reach them, as before, and a `finish`
  rerun no longer reaches them through the retired path. Recommended: no
  change, since such an observer ends within its eight-hour budget.
- **Ambient `finish` rerun after retirement** and **native closure cases**,
  carried unchanged from plan 291.

## Observed premises

Observed on 2026-10-10 at `7e27929f` in this plan's checkout; no product file
changed.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| A recreated path defeats the recorded identity | Slice 1 | Scratch repository: `createMailbox` from a linked worktree, `git worktree remove`, `mkdir` of the same path, `readMailbox` from the default checkout; then a different repository initialized at that path, read from the original and from the new one | Refused "CI mailbox belongs to another checkout"; with the other repository there, the original is refused and the new one reads it |
| A `finish` rerun after the several-ended journey does not settle | Slice 2 | A scratch copy of the journey "finish whose coordinator's ended observers each registered the final closure…" with one more installed `finish` from the management context after retirement, as the owner by `--session-json` | `ok: false`, `step: "observation"`, `ownership: "ended"`, "3 of its observers each registered this revision and none is live", `cleanup: "not-performed"` |
| The journey passes without its `resume` step | Slice 3 | The same scratch copy with `await journey.resume(final)` deleted | Passes |

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| A mailbox is read by its recorded identity whatever its path became | Slice 1: the installed `stop` in `ci-mailbox-removed-worktree.test.mjs` after the path is recreated; the mailbox refused from a different repository created at that path |
| A rerun settles on the observer that completed the final closure | Slice 2: the installed `finish` rerun from the management context in `trunk-closure-owner-gaps.test.mjs` |
| Tests and fixtures carry only what their proofs use | Slice 3: the closure and gap-table suites stay green |

## Ordered slices

### 1. A mailbox is read by the identity it recorded
Type: Behavior
Status: planned
Proof: Extend `ci-mailbox-removed-worktree.test.mjs` through the installed
`stop` after the removed path exists again.

Behavior: An observer recorded its arming identity and its worktree was
removed → the path is recreated, empty or as another repository → `stop` from
a checkout of the arming repository still stops it with a confirmed terminal
result, and the repository now at that path is refused. A mailbox without a
recorded identity is read as today.

Correct the `ci-notify-hosts.md` sentence only if it is still inexact. Run the
mailbox, hook, closure, and managed-delivery consumers, and
`tests/git-publication-native.sh`, whose fixture stop reads the recorded
identity.

Safe stopping point: the access rule depends on no path that can change.

### 2. A finish rerun settles on the observer that completed the closure
Type: Behavior
Status: planned
Proof: Extend the several-ended journey in `trunk-closure-owner-gaps.test.mjs`
with the rerun from the management context after retirement.

Behavior: Several of a coordinator's ended observers registered the final
closure and one completed it → `finish` reruns after retirement → it repeats
completion on that observer and reports cleanup `already-absent`, for its
owner only. With none completed, the gap and its step stay as plan 291 left
them.

Start from the observed rerun above as the failing test. State the
`step: "observation"` row of `wrap-up-closure-publication.md` so it matches
the reasons `finish` prints. Classify once for the selection and its gap.

Safe stopping point: the promised rerun holds for every observer history.

### 3. Proofs carry only what they use
Type: Structure
Status: planned
Proof: Closure and gap-table suites stay green.

Remove the journey's `resume` step and its fixture helper. Make the gap
table's unit proof assert that every kind and command yields a reason with a
step and no `undefined` without copying each phrase, cover every kind the
classifier returns, and pass `registered` only for `finish`.

Safe stopping point: the correction is complete.

## Verification and gates

Run focused suites through `npm test -- <paths>` with the Node in
`.node-version` and Bash 5 first on `PATH`, per
[tests/README.md](../../../tests/README.md). Each slice includes proof
acceptance, independent post-change refactoring, and coordinator-owned
formatting and delivery. Paid native runs are manual only.

## Pending native evidence

Carried from plan 291 under ADR 0005, unchanged, with one addition: the
fixture stop in `tests/support/native-harness-observation.sh` now reads the
recorded identity, and that file is hashed into the story-branch-closure
evidence identity as well as the trunk-closure and git-publication ones. No
native run exists for any of these; each run is paid and needs the
developer's authorization.

## Sequence review and sizing

No slice target or limit was supplied. Each slice owns one outcome with its
proof. Slice 1 depends on the developer's first decision above; slices 2 and 3
do not.
