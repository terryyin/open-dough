# Recovery holds after a path is reused and after finish reruns

**Identity:** SEED-121#recovery-holds-after-reuse-and-rerun
**Source:** [correction story](../../seeds/SEED-121-execution-observer-ownership.md#recovery-holds-after-reuse-and-rerun),
written by the execution retrospective of plan 291 on 2026-10-10.
**Provenance:** SEED-121#recovery-steps-reach-their-observer, whose story and
plan are at
`481f15a3a4e41f55e2915590320b549a754237ca:.planning/seeds/SEED-121-execution-observer-ownership.md`
(anchor `recovery-steps-reach-their-observer`) and
`481f15a3a4e41f55e2915590320b549a754237ca:.planning/slice-plans/291-recovery-steps-reach-their-observer/PLAN.md`;
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

Decided by the developer on 2026-10-10: `request.json` keeps the `identity`
field plan 291 added; slice 1 builds on it.

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

- **One ended covering observer beside a live one that does not cover.**
  `finish` selects the ended one, as before plan 291, and may retire on its
  receipt while the live observer runs to its budget. With several ended ones
  it selects the live one. Recommended: prefer the live observer in both, in a
  later correction, once a journey shows the retirement consequence.
- **Observers armed before plan 291.** They carry no `identity`; after their
  worktree is removed `stop` cannot reach them, as before, and a `finish`
  rerun no longer reaches them through the retired path. Recommended: no
  change, since such an observer ends within its eight-hour budget.
- **Ambient `finish` rerun after retirement.** Such a rerun with no covering
  observer registers on, completes, and stops the caller's one live observer
  of the target, as it already did while the worktree existed. Recommended:
  keep it, since that observer is this coordinator's own, and pin it with a
  test.
- **`success` beside `failure`.** When one ended observer recorded the final
  closure as failed and another as succeeded, as after a CI re-run, `finish`
  reports the `ended` gap and a rerun after retirement reports its coverage as
  lost. Recommended: keep the gap, since nothing in the records orders the two
  attempts.
- **One ended covering observer whose record is `incomplete`.** `finish`
  completes on it and may retire, as before plan 291. Recommended: decide it
  with the first decision above, since both ask what a sole ended observer may
  settle.
- **Native closure cases.** On Claude Code and Cursor they prove only that
  `finish` establishes its own observer, and the assessor has no signal for
  an absent `--session-json` or for `notifies`. Recommended: add those two
  assessor signals when the next paid run is authorized.

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
Status: done
Proof: Extend `ci-mailbox-removed-worktree.test.mjs` through the installed
`stop` after the removed path exists again.
Accepted proof: `npm test -- src/skills/dough-execute-plan/scripts/ci-mailbox-removed-worktree.test.mjs`,
four tests through the installed `stop`: the removed path recreated empty, a
different repository created at it refused with no `stop` file while the
arming repository still stops the observer, and a mailbox stripped of its
`identity` read through its arming checkout. Consumers run green: the
`ci-*`, `watch-ci-*`, `execution-increment-*`, `trunk-closure*`, and
`closure-*` suites, `tests/git-publication-native.sh` and its owned-context,
evidence-identity, and assessor checks. The `ci-notify-hosts.md` sentence is
exact and unchanged.

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
Status: done
Proof: Extend the several-ended journey in `trunk-closure-owner-gaps.test.mjs`
with the rerun from the management context after retirement.
Accepted proof: `npm test -- src/skills/dough-story-wrap-up/scripts/trunk-closure-owner-gaps.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-observer-selection.test.mjs`.
The journey's installed `finish` rerun after retirement completes on the
observer that completed the closure with cleanup `already-absent`, and another
coordinator's rerun stays at `step: "observation"`. The selection suite proves,
on real ended observers whose records their own writer produced, the one
whose record holds a verdict beside cancelled or empty records, the first of
several whose verdicts agree, a `not_required` record through its basis, and
the `ended` gap when none holds a verdict or the verdicts differ. Consumers
run green: the `trunk-closure*` and `closure-*` suites, the `ci-mailbox-await`
importers, the guidance suites, `tests/native-evidence-identity.sh`, and
`tests/git-publication-native.sh`.

Learning: nothing records that completion ran, so `finish` reads "completed
it" from the observer's own coverage record. With none live it repeats
completion on the first ended covering observer whose record holds a CI
verdict for the closure when every recorded verdict is the same, and keeps the
`ended` gap when none holds one or they differ. A cancelled attempt's
`incomplete` record neither identifies an observer nor counts against one. A
first `finish` therefore also completes on such an observer instead of asking
for a `deliver`.

Returned after the retrospective's review: the first accepted rule counted
`incomplete` as the closure's result, so a first `finish` over several ended
observers that each recorded a cancelled attempt selected one, and `success`
beside `incomplete` left the rerun unsettled. Both were observed with a
scratch selection test at `31fd11c6` and are now the failing-first tests of
the selection suite.

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
Status: done
Proof: Closure and gap-table suites stay green.
Accepted proof: `npm test -- src/skills/dough-story-wrap-up/scripts/trunk-closure*.test.mjs src/skills/dough-story-wrap-up/scripts/closure-*.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-observation-gaps.test.mjs`
green. The gap-table proof reads its kinds, and the fields each carries, from
`classifyObservers` and was seen to fail on an emptied step, an `undefined`
step, a classifier kind the table lacks, and a reason reading a field its
kind lacks.

Remove the journey's `resume` step and its fixture helper. Make the gap
table's unit proof assert that every kind and command yields a reason with a
step and no `undefined` without copying each phrase, cover every kind the
classifier returns, and pass `registered` only for `finish`.

Safe stopping point: the correction is complete.

## Execution complete

Product advice: no backlog change. The correction and its review findings are
delivered within this plan; nothing new is recommended for the queue. Six
developer decisions stay open under "Decisions for the developer", each with
a recommendation, and the paid native runs under "Pending native evidence"
still need authorization.

## Story obligations

### G1. A mailbox without an identity after its worktree is removed is unasserted
Reported: slice 1 — "A no-identity mailbox after its worktree is removed (refused from the default checkout, as before plan 291) is not asserted; it is covered only by the code equivalence above."
Story clause: "A mailbox that recorded its arming identity is read by that identity"
Disposition: no user cost "A coordinator recovering an ended observer keeps reaching it when the removed worktree's path exists again": the goal covers mailboxes that recorded an identity; one without it keeps the behavior it had, and `checkoutIdentity` returns the resolved path for a missing root exactly as the removed branch did

### G2. A non-repository arming directory that later becomes a repository is refused
Reported: slice 1 — "a mailbox armed from a directory that was not a Git toplevel (identity = its path) that later becomes a Git repository at the same path is now refused to that repository, where before the live read matched."
Story clause: "whatever its recorded path has become, and a different repository at that"
Disposition: no user cost "A coordinator recovering an ended observer keeps reaching it when the removed worktree's path exists again": observers are armed from an execution checkout, which is a Git worktree; the refusal is the recorded-identity rule the scope states, applied to a case no coordinator reaches

### G3. Only `stop` is driven after the path is reused
Reported: slice 1 — "Only `stop` is exercised through the reused path; other readers (`register-push`, `await-revision`, `complete-revision`, `acknowledge`, hooks) share the same `readMailbox` rule and are not separately driven after path reuse."
Story clause: "A mailbox that recorded its arming identity is read by that identity"
Disposition: no user cost "A coordinator recovering an ended observer keeps reaching it when the removed worktree's path exists again": `readMailbox` is the only caller of `armingIdentity` and every reader goes through it, so the one driven reader exercises the rule the others share

### G4. Agreeing and differing results are proven at selection only
Reported: slice 2 — "The agreeing and differing cases through the installed `finish`; they are proven at `select` only."
Story clause: "one of which completed it, repeats completion on that one"
Disposition: proved by slice 2: `trunk-closure-observer-selection.test.mjs` "closure selects, among several ended observers…" proves the selection on real ended observers, and the journey in `trunk-closure-owner-gaps.test.mjs` proves a selected ended observer flows through the installed `finish` to completion and `already-absent` cleanup

### G5. The none-completed gap is asserted before retirement only
Reported: slice 2 — "None completed after retirement; the none-completed gap is asserted before retirement only."
Story clause: "one of which completed it, repeats completion on that one"
Disposition: proved by slice 2: the selection reads only the observers' records, never the worktree; `trunk-closure-observer-selection.test.mjs` "closure selects none of several ended observers…" and the journey's pre-retirement `several` assertions hold the gap and its step

### G6. A `not_required` record and the late-live observer beside several ended ones
Reported: slice 2 — "a `not_required` record whose basis carries the verdict; only `success` and `failure` states are exercised." and "Several ended covering observers beside a late-claimed live one (the removed \"went live … none is live\" contradiction)."
Story clause: "one of which completed it, repeats completion on that one"
Disposition: proved by slice 2: `trunk-closure-observer-selection.test.mjs` "closure selects the ended observer whose record holds a verdict beside ended observers whose records hold a cancelled attempt…" drives the `not_required` basis; the late-live reason comes from the one classification that also empties the ended set, proved by "closure names an observer its coordinator claimed after its observers were listed…"

### G7. The gap-table proof no longer compares one meaning across commands
Reported: slice 3 — "The \"one meaning across commands\" check is weaker than before." and "For `missing`, whose meaning has internal `; ` clauses, a late divergence would shift the split and pass."
Story clause: "The guidance rows and tests the recovery-steps correction left inexact or"
Disposition: no user cost "This corrects residue the": the proof now derives each meaning from where the commands' reasons part, so it holds whatever the wording; each kind's meaning must still be non-empty and distinct, and the installed journeys assert the reasons each command prints

### G8. A cancelled attempt's record counted as the closure's result (first reported in slice 2)
Reported: slice 2 — "Agreement on `incomplete`, and a `not_required` record whose basis carries the verdict; only `success` and `failure` states are exercised."
Story clause: "one of which completed it, repeats completion on that one"
Disposition: proved by slice 2: returned after the retrospective's review and corrected; `trunk-closure-observer-selection.test.mjs` "closure selects none of several ended observers whose records each hold only a cancelled attempt of the final closure" and "closure selects the ended observer whose record holds a verdict beside ended observers whose records hold a cancelled attempt…"

### G9. The verdict rule is proven at selection, not through the installed `finish`
Reported: slice 2 — "that a first `finish` over several `incomplete` ended observers now keeps resources and prints the `deliver` step is proven at `select` only, not through the installed `finish`."
Story clause: "one of which completed it, repeats completion on that one"
Disposition: proved by slice 2: the rule lives in `select`; the journey in `trunk-closure-owner-gaps.test.mjs` proves through the installed `finish` both that a selection gap keeps resources with the `deliver` step and that a selected ended observer completes with `already-absent` cleanup

## Execution resume context

- Mode: Story Branch; workspace
  `.worktrees/recovery-holds-after-a-path-is-reused-and-after`, branch
  `claude/recovery-holds-after-a-path-is-reused-and-after`, remote `origin`,
  trunk `main`; agent `dbs-chan`.
- Claim `4364af24b74ceeea423c4fd833fb55be363a8f1a` accepted on `origin/main`,
  starting revision `34d496c21a5b32655bb5f9ae307d65bb5adb7ede`.
- Slice 1 accepted on the execution branch at
  `cb8444204a721f4ffdc81723aecc0d566aa53453`, slice 2 at
  `36a747227fd39926e9c55d459b652f0b3c83639b`, slice 3 at
  `31fd11c64834ba26234ef99c00f53b64de750c18`; observer
  `/tmp/dough-ci-501/watch-GHUmnS`.
- CI source: GitHub Actions `ci.yml` on the execution branch, observed
  through managed delivery.

## Verification and gates

Run focused suites through `npm test -- <paths>` with the Node in
`.node-version` and Bash 5 first on `PATH`, per
[tests/README.md](../../../tests/README.md). Each slice includes proof
acceptance, independent post-change refactoring, and coordinator-owned
formatting and delivery. Paid native runs are manual only.

## Pending native evidence

Carried from the delivered ownership story and its corrections under ADR 0005.
No native run exists for any of these; substitute and replay results are not
native acceptance, and each run is paid and needs the developer's
authorization.

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
- The fixture stop in `tests/support/native-harness-observation.sh` reads the
  recorded identity; that file is hashed into the story-branch-closure
  evidence identity as well as the trunk-closure and git-publication ones.

## Sequence review and sizing

No slice target or limit was supplied. Each slice owns one outcome with its
proof. No concern remains inside this plan; the developer decisions above stay
outside it.
