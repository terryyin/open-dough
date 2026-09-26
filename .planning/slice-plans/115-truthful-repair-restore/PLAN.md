# Report conflicting repair restores truthfully

## Source

**Identity:** SEED-008#truthful-repair-restore

[Correction story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#truthful-repair-restore).
A bounded retrospective correction of the completed execution of
`SEED-008#preserve-other-executions-work` under plan 114
(`.planning/slice-plans/114-preserve-other-writers/PLAN.md`): claim `b22ecab`,
attributable commits `f157f0e` (slice 1) and `86e5069` (slice 2) on branch
`claude/114-preserve-other-writers`, base `fe6a661`. That story's promises
stay as delivered; this correction adds no feature promise. The retrospective
authorized planning only; execution needs its own authority.

## Goal and scope

A coordinator resuming after a CI repair knows exactly what a conflicting
restore already put back in the tree, and finishes that restore without
handling the shared stash stack by hand. One correction outcome, owned by the
findings below, each checked against `86e5069`.

### Current findings

- **F1 — a conflict receipt misreports what was applied (defect).**
  `ci-repair-stash.mjs` `restoreRepairStash` returns `applied: false` whenever
  `git stash apply --index` exits non-zero. In a disposable fixture shaped like
  test "a restore that conflicts with the repair…", Git had already left
  `UU` markers and restored the untracked file, and printed "Index was not
  unstashed" (saved staged state lost); with a repair that adds a path the
  paused work had untracked ("already exists, no checkout"), every tracked
  change was applied while the receipt still said `applied: false`.
  `ci-monitor.md` step 5 tells the coordinator to act on "whether it was
  `applied`", inviting a second apply or a wrong resolution. The conflict
  test does not assert `applied` or the tree.
- **F2 — the conflict path drops the entry by hand (residue).**
  `ci-monitor.md` step 5 ("then drop only that OID's entry by its current
  selector") sends the coordinator back to resolving a selector and running
  `git stash drop` itself — the improvised stack handling ODF-093 recorded,
  and a contradiction of step 3's "Never stash, pop, reset, or clean by hand".
  The script already has the logic (`dropExact`) but no command for it.
- **F3 — the drop is not confirmed (coverage gap).** `dropExact` lists, then
  drops by selector; another writer's push in between would shift the
  selector. Git cannot drop by OID, but `stash drop` reports the dropped OID,
  so a mismatch can be detected and reported.
- **F5 — test file size (residue).** `ci-repair-stash.test.mjs` is 255 lines,
  over the 250-line file-size check; new cases must not grow it further.

### Preserved promises and constraints

- Story key examples 1–4 of `preserve-other-executions-work` keep their
  current proof and behavior; a conflict still keeps the entry and names the
  paths and OID.
- Never touch a stash entry whose OID this execution did not record.
- No `pop`, `--all`, reset, or clean in the script or the guidance.

### Excluded

- Detecting other sessions' concurrent stash pushes beyond reporting a
  dropped-OID mismatch; branch or HEAD checks on restore; the untested
  rename and "would be overwritten" parsing branches (low impact, reported
  only); ODF-084.

## Current decisions

- **Receipt shape.** On a failed apply, compare the saved inventory with the
  tree after the attempt: report `applied` as `none`, `partial`, or `all`
  (replacing the boolean on `conflict` receipts only, since `resumed` and
  `missing` already state it) and list saved staged paths whose index state
  was not restored (`unstagedPaths` or a similarly explicit name).
- **Drop command.** `drop --record <file>` reuses `dropExact`, parses the
  dropped OID from `git stash drop` output, and returns `dropped` with the
  selector, `mismatch` (with both OIDs) when Git dropped a different entry,
  or `missing` when the OID is no longer on the stack. Restore's own final
  drop uses the same confirmation.
- **Guidance.** `ci-monitor.md` step 5 names `drop --record` after a resolved
  conflict and says what to do with `partial` (restage the listed paths, do
  not reapply). Keep the file within 250 lines.
- **Tests.** Extend the existing conflict case rather than adding a parallel
  one; move fixture helpers to a sibling support module if needed to keep the
  test file under 250 lines.

## Outside-in proof and verification

| Finding | Proof |
| --- | --- |
| F1 | `ci-repair-stash.test.mjs` conflict case asserts `applied: "partial"`, the conflicted path, the restored untracked file, and the saved staged path reported as not restored; a second case with a repair that adds the paused work's untracked path asserts the real applied state |
| F2 | same file: after resolving the conflict, `drop --record` removes only the recorded entry while a foreign entry pushed after the save stays; guidance test on `ci-monitor.md` step 5 (paraphrase tolerant) finds the drop command and no hand `stash drop` |
| F3 | same file: a drop whose recorded OID is gone reports `missing` and changes nothing; mismatch detection proved at the parsing boundary (unit-level) if a deterministic race fixture is not practical |

Focused commands: `node --test src/skills/dough-execute-plan/scripts/ci-repair-stash.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs`.
Full gate before delivery: `npm test` and `npm run lint`.

## Ordered slices

### 1. A conflicting restore reports exactly what it applied
Type: Behavior
Status: planned
Proof: F1 rows above.

Behavior: saved work whose restore conflicts with the repair → the coordinator
runs `restore --record` → the receipt states `partial`/`all`/`none` applied,
the conflicting paths, and the saved staged paths not restored; the entry
stays on the stack.

### 2. The coordinator finishes a resolved conflict through the script
Type: Behavior
Status: planned
Proof: F2 and F3 rows above.

Behavior: a resolved conflict with the entry still on the stack and a foreign
entry above it → the coordinator runs `drop --record` → only the recorded OID
is dropped and confirmed; a vanished entry reports `missing`; `ci-monitor.md`
step 5 directs this command instead of a hand drop.
