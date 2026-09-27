# Keep paused work when a conflicting restore applied nothing

## Source

**Identity:** SEED-008#unapplied-restore-kept

[Correction story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#unapplied-restore-kept).
A bounded retrospective correction of the completed execution of
`SEED-008#truthful-repair-restore` under plan 115 (recoverable at
`f6a3d4c:.planning/slice-plans/115-truthful-repair-restore/PLAN.md`): claim `b11bb98`,
attributable commits `8f88364` (slice 1) and `ab3cb42` (slice 2) on branch
`claude/115-truthful-repair-restore`, starting revision `a1c2375`. That
correction's promises stay as delivered; this one adds no feature promise.
The retrospective authorized planning only; execution needs its own
authority.

## Goal and scope

A coordinator finishing a conflicting CI repair restore never discards paused
work that the restore did not put back in the tree. One correction outcome,
owned by the findings below, each checked against `ab3cb42`.

### Current findings

- **R1 — a guided drop discards unapplied work (defect).** Reproduced in a
  disposable repository at `ab3cb42`: paused work stages a change to `t.txt`,
  the repair commits a different change to `t.txt`; `restore --record` fails
  with "conflicts in index. Try without --index." and reports `conflict`,
  `applied: "none"`, `stagedNotRestored: ["t.txt"]`, `paths: []`, with the
  tree showing only the repair. `ci-monitor.md` step 5 then says to resolve
  overlaps and finish with `drop --record`, which succeeds and leaves the
  paused work only as a dangling OID in the record.
- **R2 — an unapplied conflict names no path, and `none`/`all` are untested
  (coverage gap).** `conflictPaths` does not parse Git's "patch failed:
  PATH" lines, the only path naming on this failure. `applied: "none"` and
  `"all"` were observed through the CLI only during plan 115.
- **R3 — step 5 guidance proof is split (test residue).** Step 5 phrase
  assertions (`save`/`restore` commands, not `pop`, never assuming
  `stash@{0}`) sit inside a delivery-routing test in
  `execution-increment-delivery.test.mjs`, while
  `shared-checkout-writers-guidance.test.mjs` now holds the focused step 5
  test "the coordinator finishes a resolved repair conflict through the
  stash script, never dropping by hand".

### Preserved promises and constraints

- Plan 115's receipts and proof stay: `partial` reports `stagedNotRestored`;
  `drop --record` confirms by OID and reports `dropped`, `mismatch`, or
  `missing`; a conflict keeps the entry and names its OID.
- Never touch a stash entry whose OID this execution did not record; no
  `pop`, `--all`, reset, or clean in the script or the guidance.
- `ci-monitor.md` stays at 250 lines or fewer; it has no headroom, so new
  step 5 wording replaces existing words.

### Excluded

- Retrying an unapplied restore without `--index` (a behavior change for a
  later decision); reporting saved unstaged paths that return staged; the
  untested rename and "would be overwritten" parsing branches.

## Current decisions

- **Remember the restore outcome.** `restore --record` writes its last
  outcome (`status` and `applied`) into the record file it read; the record
  stays private and outside the checkout.
- **Refuse an unapplied drop.** `drop --record` refuses, keeping the entry,
  when the record's last restore reported `applied: "none"`; the receipt
  names the OID and a distinct status (for example `unapplied`), exit 1.
  A record with no restore outcome keeps plan 115's behavior.
- **Guidance.** Step 5 says `none` means nothing was put back: keep the entry,
  report the OID and paths, and stop. Keep the `partial` and drop wording.
- **Test home.** Move the step 5 phrase assertions from
  `execution-increment-delivery.test.mjs` into the focused step 5 test in
  `shared-checkout-writers-guidance.test.mjs`, keeping each assertion's
  paraphrase tolerance; the delivery-routing test keeps its routing checks.

## Outside-in proof and verification

| Finding | Proof |
| --- | --- |
| R1 | `ci-repair-stash.test.mjs`: a staged change conflicting in the index → `restore` reports `none` with the path; `drop --record` then reports the refusal, exit 1, and the stack and tree are unchanged; guidance test finds that `none` keeps the entry and stops |
| R2 | same file: the `none` case asserts `paths` names the conflicting file; an `all` case (repair committed the identical change) asserts `applied: "all"` |
| R3 | `shared-checkout-writers-guidance.test.mjs` holds every step 5 assertion; `execution-increment-delivery.test.mjs` no longer asserts step 5 wording; both pass |

Focused commands, through the runner with Bash 5 first on `PATH`:
`npm test -- src/skills/dough-execute-plan/scripts/ci-repair-stash.test.mjs
src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs
src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs`.
Full gate before delivery: `npm test` and `npm run lint`.

## Ordered slices

### 1. A restore that applied nothing is never finished by a drop
Type: Behavior
Status: done
Proof: R1 and R2 rows above.

Accepted proof: the focused command above plus
`execution-increment-publication.test.mjs` (a `restoreRepairStash`
consumer), exit 0; full `npm test` and lint, exit 0.
`ci-repair-stash.test.mjs` "a restore whose staged work conflicts in the
index applies nothing, names the path, and its drop is refused with the entry
and tree kept" (`applied: "none"`, `paths: ["staged.txt"]`, drop `unapplied`
exit 1, stack and tree unchanged) and "a restore whose repair committed the
identical staged change reports all applied, and its drop proceeds"; the step 5
test in `shared-checkout-writers-guidance.test.mjs` requires `none` to report
OID and paths, keep the entry, and stop.

Learnings: `conflictPaths` and the applied-state reading moved to
`ci-repair-stash-applied.mjs` to keep the script under its size limit; a new
script module must also be listed in `install.sh`. The `all` case pinned
existing behavior and did not fail first.

Behavior: paused staged work conflicting in the index → the coordinator runs
`restore --record` → the receipt reports `none` with the conflicting path and
the record remembers it; `drop --record` refuses and keeps the entry; step 5
says to keep it and stop. An identical repair reports `all`.

### 2. Step 5 guidance proof has one home
Type: Structure
Status: done
Proof: R3 row above.

Accepted proof: the focused command above, exit 0. The five step 5 phrase
assertions left "execution entry routes name the same increment and repair
owner" unchanged in regex; `restore`, not `pop`, and `stash@{0}` now read
step 5 only, while `save` and "never nest stash/repair cycles" read the whole
reference, where that wording lives. The routing test keeps only "Do not use
a second repair push".

Structure: the step 5 phrase assertions move into the focused guidance test
without weakening any of them.
