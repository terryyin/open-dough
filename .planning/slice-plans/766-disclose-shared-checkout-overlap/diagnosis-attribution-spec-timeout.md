# Diagnosis: attribution-spec-timeout

Identity: SEED-418#disclose-shared-checkout-overlap; diagnosis name `attribution-spec-timeout`.

## Failure signature

- `dashboard/backend-tests/review/ad-hoc-branch-entry-attribution.spec.ts` :21 and :89 both
  "Test timed out in 5000ms" (Vitest default) in the 3-file backend run (coord-s3-1, load ~19)
  and the full backend run (s3-backend-full-2); pass alone at the same load in ~3.1 s / ~2.9 s
  (coord-s3-3).

## Attribution

The spec imports branchEntryProposal.ts, sessionBranchCapture.ts and doneCaptureCaseBuilder;
this story changed none of them. Not this story's change; the repair is still owed.

## Round 1 (started 13:56)

- attr-before-alone (load 9.1): pass, 1806 ms / 1226 ms.
- attr-before-combo (load 6.5): pass, 1133 ms / 744 ms. No reproduction at low load.
- Instrument: a PATH `git` wrapper outside the repo (`/tmp/attr-gitwrap/bin/git`, logs start/end
  and args) on a single-spec run (load 7.8; 1896 ms / 1059 ms). 130 git processes, all serial,
  one every ~18 ms (git ~11 ms + spawn overhead). Test :21 alone spawns ~75:
  - template build (once per worker, cached snapshot) 13; workspace claim 2; places 2;
    earlier work 4;
  - `proposeBranchEntry` (setup, product code) 13 — of which `readBranchWorkspace` 10;
  - `performWork` merging trunk work (clone, commit, push, pull, commit) 12;
  - `captureBranchResult` (the action) 27 — `readBranchWorkspace` 10 again, `sharedFirstParent`
    4 calls x 2 `rev-list` = 8, plus merge-base/ls-remote/cat-file/merge-tree;
  - assertions 4.
  Test :89 spawns ~55 with the same shape.
- H1: the case is spawn-bound (serial git processes ~ all of its time), so its duration scales
  with process-spawn latency under load and crosses 5000 ms at load ~19 with other files'
  workers spawning in parallel.
  Experiment: the reproducing 3-file combination under forced load (`yes` generators to reach
  load ~19). Stopping count: 2 runs.
- attr-load-combo1..2 (forced: 16 `yes`, load 16.5-18.7): pass, :21 3316/3376 ms, :89
  2717/2440 ms — 3x the idle durations, ~66% of the 5000 ms bound.
- attr-load-combo3 (28 `yes`, load 27-31): :21 4542 ms; attr-load-combo4 (44 `yes`, load 39-44):
  :21 4223 ms. CPU burners alone did not force the timeout; durations track spawn latency.
- H1 confirmed as the cause of the budget pressure: per-process cost rises from ~18 ms idle to
  ~40-90 ms at load 15-19, and the case runs ~55 serial Git processes (test :21), so it sits at
  60-90% of 5000 ms under the coordinator's load and crosses it when other workers spawn too.
  The timeout itself was not forced locally (no failing reproduction before the fix beyond the
  coordinator's coord-s3-1 / s3-backend-full-2).

## Fix (uncommitted)

- `dashboard/server/sessionBranchCapture.ts` `readBranchWorkspace`: one `rev-parse` reads
  top level, common directory, `HEAD^{commit}`, `HEAD^{tree}` and the symbolic HEAD (revisions
  before `--symbolic-full-name`, which applies to the arguments after it — verified in a scratch
  repo); one `rev-parse HEAD --symbolic-full-name HEAD` rechecks after the snapshot. 10 -> 5 Git
  processes per read; proposal and capture each read once.
- `captureBranchResult`: the workspace read runs beside the trunk observation; the base
  ancestry check runs beside the manual landing comparison (read-only).
- `dashboard/server/sessionBranchAttribution.ts` `attributeBranchResult`: the three independent
  `sharedFirstParent` reads run together; outcomes unchanged (any throw still answers ambiguous).
- Spec :21: the trunk import is committed and pushed from the Default main checkout and merged by
  hand in the topic worktree (`committing` + `pushingToTrunk`, then `mergingTipByHand` at the
  same `at(40)`), instead of `mergingTrunkWork`, which clones origin and pulls. Same files, same
  merge topology, same expectations.
- Git processes for the spec file: 130 -> 110 (wrapper count); capture's serial chain ~27 -> ~13.

## After (paired A/B, base in a scratch worktree at 71efa45, removed after)

3-file combination, alternating base/candidate at the same load:

| pair | load | base :21 / :89 | candidate :21 / :94 |
| --- | --- | --- | --- |
| 4 | 17.0 / 16.1 | 2210 / 1206 | 1396 / 823 |
| 5 | 16.1 / 15.3 | 1926 / 1152 | 1456 / 834 |
| 6 | 15.2 / 14.4 | 1756 / 1109 | 948 / 647 |

Earlier pairs 1-3 (load 12-17) carried only the product changes: :89 -20-27%, :21 unchanged.
With the spec change, :21 -25 to -46%, :89 -28 to -42%.

Temporary diagnostic edits: none in the checkout (wrapper and scratch worktree were outside it,
both removed). Unrelated defects: none found.

Round count 1; cumulative active minutes ~8 (clock).

## Consumer proof

- attr-consumers (load 11.3 -> 15.4): `review/` plus declared launch publications,
  landing pin/persistence and agent-completion identity: 50 files, 221 tests passed; this spec
  :21 2808 ms, :94 2535 ms inside that 50-file run (about 50-56% of the bound).
- attr-typecheck2: `npm run --silent typecheck:dashboard` exit 0.

## Leading residual

Under parallel load the case still runs about 50 serial Git processes; most are the case's setup
(per-worker template build 13, claim/places/work ~10, proposal ~6, trunk import ~7). A further
cut would need a run-prepared repository snapshot (`registerPreparedPrefix`) for the Done capture
cases, which is a shared support change outside this repair.
