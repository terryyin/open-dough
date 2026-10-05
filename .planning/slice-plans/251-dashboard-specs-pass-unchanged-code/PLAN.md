# Dashboard specs pass CI on a revision that changes no code

**Identity:** SEED-100#dashboard-specs-pass-unchanged-code
**Source:** [refined story](../../seeds/SEED-100-project-checks-trustworthy.md#dashboard-specs-pass-unchanged-code).
**Prepared:** 2026-10-05. Planning only, in the established preparation workspace.

## Goal and boundaries

The dashboard suite passes on CI's runners every time it runs on a revision
that changes no code, and anyone can show that for a revision by running the
suite there repeatedly.

Scope, constraints, and key examples are those of the source story. Material
exclusions:

- Running the repetition on a schedule or automatically after a push.
- The same verdict on a loaded developer machine (DD-224 and DD-226 stay open).
- Repairs in the `lint` and `test` jobs. The repeated run names a failure
  there; this story does not repair it.
- Any retry, skip, quarantine, or removed assertion as a repair.

## Direction and PFE

Established structure supports the work. No
[North Star](../../NORTH-STAR.md) topic governs it and none is added; the
dashboard-owned CI observation topic is about a session's own publications,
not a diagnostic run. No Accepted ADR constrains it.

PFE findings and choices:

- **The repeated run is CI itself, dispatched again.** `ci.yml` already has
  `workflow_dispatch` and no concurrency group, so the same revision can run
  it any number of times. Each dispatch runs the `dashboard` job exactly as a
  push does: same commands, same nine shards, a fresh runner per shard. The
  repeated run is therefore a script that dispatches `ci.yml` on a ref N
  times and reads the results. `ci.yml` does not change, so pushes and pull
  requests are unaffected by construction, the checks that pin `ci.yml`
  (`tests/ci-container.sh`, `tests/ci-lint-setup.sh`, `tests/native-setup.sh`)
  need no change, and the run works from a story branch before it lands.
  Rejected: a second workflow or a repetition matrix, which would copy or
  restructure the `dashboard` job and could not be dispatched from a branch
  until it was on trunk.
- **Each dispatch also runs `lint` and `test`.** That is four extra jobs per
  repetition on a public repository. The result names any failed job outside
  `dashboard` by job name, so it is not mistaken for a pass.
- **One reader of CI through `gh`.** `scripts/ci-test-times.sh` already reads
  `ci.yml` runs through `gh`, and `tests/ci-test-times.sh` proves it with a
  `gh` stand-in that logs calls and serves fixtures. The new script and its
  check follow that shape and its failure wording ("gh … failed: …").
- **Failing specs come from the quiet reporter's line.**
  `dashboard/tests/support/quietReporter.ts` prints
  `FAIL: <file>:<line> › <title> (<status>)` for each failing test, and
  `gh run view <run> --log-failed` carries it. The script counts those lines
  per spec location across runs. It adds no reporter and no artifact.
- **Runner use.** The script keeps at most two repetitions in progress at a
  time by default, so other sessions' pushes still get runners. Twenty
  repetitions then take roughly 40 minutes of waiting.

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| `ci.yml` can be dispatched on a branch ref and runs the whole workflow (slices 1, 2) | `gh run list --workflow ci.yml --event workflow_dispatch --limit 5` → five successful runs on story branches, newest 36945682786 (2026-10-02). `grep -n concurrency .github/workflows/ci.yml` → none. |
| This machine's `gh` may dispatch a workflow (slice 2) | `gh auth status` → scopes include `repo`. Not observed: an actual dispatch from this workspace. Slice 2 is the probe. |
| A failed run's log names each failing spec on one `FAIL:` line (slice 1) | `gh run view <run> --log-failed \| grep FAIL:` on runs 37169060163, 37206540831, 37245324663, 37264804452, 37266736909 → one `FAIL: dashboard/tests/<spec>:<line> › …` line per failing test each time. |
| The two named specs still fail on a revision with every repair so far (slices 3, 4) | Cursor: run 37245324663 on `01f7d61f`, which contains `aeb9c33d` and `48c9bbc7` (`git merge-base --is-ancestor`). Acceptance: no commit to the spec since `7b6ddcce` (2026-10-03), before both failures. |
| Focused local repetition reproduces the two failures (considered for slices 3, 4) | **False.** `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts agent-launch-acceptance.spec.ts:96 --repeat-each 24`, then the same for `agent-launch-ad-hoc-cursor.spec.ts:43`, at load average 30–41 → exit 0, no `FAIL:` line. The plan reproduces on CI's runners (slice 2) and forces the losing order at the cause (slices 3, 4). |
| In the acceptance spec the server's answer runs ahead of the kept file (slice 3) | Failing logs: at `:138` the answer of `attempts(server)` carried `reporting` while the kept file read on the next line did not; at `:157` the answer showed `launched` while the kept file had no `outcome`. Cause not yet located in code. |
| `agent-launch-card-noted-start.spec.ts:170` and `agent-launch-start-phases.spec.ts:24` depend on timing (slice 5) | Not observed. They failed on revisions that did not touch them (runs 37264804452, 37266830648, 37266736909). Slice 2 settles it. |
| CI keeps a failed run's trace for seven days (slices 3–5) | `ci.yml` "Keep the Playwright report": `retention-days: 7`, uploading `dashboard/test-results/`. Traces of the 2026-10-04 failures expire on 2026-10-11; slice 2's failures bring fresh ones. |

## Outside-in proof

| Promise | Owner | Observable proof |
| --- | --- | --- |
| A repeated run on one chosen revision, started on demand, taking the number of repetitions | 1, 2 | `tests/ci-repeat.sh` (stand-in); slice 2's real run on the branch |
| Its result names each failing spec and its repetition count | 1, 2 | Stand-in fixture with a spec failing in some runs; slice 2's recorded result |
| The two named specs are repaired at their cause | 3, 4 | Forced-order check red before, green after; 0 of 20 in slice 6 |
| Every other spec the repeated run shows failing is repaired | 5 | Same proof shape per cause; 0 of 20 in slice 6 |
| A real product race is repaired in the product, assertion kept | 3, 4, 5 | The spec's assertions unchanged or stronger in the repair's diff |
| No retry, skip, quarantine, or removed proof | 3, 4, 5 | `retries: 0` unchanged; the repair diffs remove no assertion |
| 20 consecutive repetitions pass on one revision with all repairs | 6 | The repeated run's result and its run IDs |
| Pushes and pull requests run the suite once, as today | 1 | `git diff main -- .github/workflows/ci.yml` is empty at completion |

## Slices

Local proof per slice is the focused check named below, run through
`npm test -- <path>` or `npm run test:dashboard -- <spec>`, plus `npm run lint`
and, for dashboard changes, `npm run typecheck:dashboard`. In a session the
dashboard launched, prepare with `env -u NODE_ENV npm ci` first (DD-220).

### 1. A repeated CI run names each failing spec and how often it failed
Type: Behavior
Status: done
Proof: `npm test -- tests/ci-repeat.sh`, a new shell check with a `gh` stand-in.

Behavior: given a ref and a number of repetitions →
`bash scripts/ci-repeat.sh <repetitions> [ref]` dispatches `ci.yml` on that
ref that many times (default ref: the current branch; at most two in progress
at once), waits for each run to finish, and prints one line per failing spec
location with the number of repetitions it failed in, any failed job outside
`dashboard` by name with its count, the run IDs, and the totals. It exits 0
only when every repetition passed. When `gh` fails to dispatch, list, or read
a run it says which call failed and exits non-zero without claiming a result.

The stand-in check covers: all repetitions pass; one spec fails in some
repetitions while the others pass (the story's second example); a spec failing
in two shards of one run counts once for that run; a failed `test` job is
named; a cancelled or unfinished run is reported and not counted as a pass;
`gh` failing; and a malformed repetition count refused before any dispatch.
The script identifies its own runs (dispatch event, ref, head revision,
created after its start) so another session's run on the same ref is not
counted. Document the command beside the container helper in
`tests/README.md`.

### 2. The unrepaired revision's failing specs are known
Type: Behavior (probe)
Status: done
Proof: the result of `bash scripts/ci-repeat.sh 20` on this branch's published
revision after slice 1, recorded under Learnings with its run IDs.

Behavior: the branch holds slice 1 and no repair → the repeated run is
triggered with 20 repetitions → it finishes with a result that lists the
specs that failed and their counts, matching what the runs' pages show for at
least two of the failed runs checked by hand.

This is the first real dispatch. If dispatching, identifying the runs, or
reading their logs does not work against GitHub, stop and correct slice 1
before any repair. The result sets slice 5's list. If no spec fails in 20
repetitions, run 20 more once; if still none, record that, keep slices 3 and
4 on their logged evidence, and drop slice 5. Waiting on CI is this slice's
external-wait exception.

### 3. The kept launch record is settled when the acceptance spec reads it
Type: Behavior
Status: done
Proof: a forced-order check that fails before the repair and passes after;
`npm run test:dashboard -- agent-launch-acceptance.spec.ts`.

Behavior: an accepted launch is publishing or settling while its kept record
is read → `agent-launch-acceptance.spec.ts:96` runs → it passes, still proving
the record is kept with its exact request before publication, shows the
published revision, and settles as launched.

Find from the code and a retained trace why the server's answer carried
`reporting` and `outcome` before the kept file did. If the server answers
before the record is durably kept, that is a product race against "is kept
before publication": repair the order in the server and keep the assertions.
If the file is correct and the spec compares two reads taken at different
moments, read once or wait for the kept state. Before repairing, make the
losing order happen on purpose (for example by holding the write at the seam
the cause names) and see the spec fail the way CI did.

### 4. A pasted Cursor instruction is shown as accepted on a slow runner
Type: Behavior
Status: done
Proof: a forced-order check that fails before the repair and passes after;
`npm run test:dashboard -- agent-launch-ad-hoc-cursor.spec.ts`.

Behavior: the Cursor client is slow to show or submit the pasted
instruction's chip → an ad hoc Cursor session starts with "why is the CI
slow?" → the session shows "First input accepted" and never "First input
acceptance uncertain".

`aeb9c33d` and `48c9bbc7` each closed one path to "uncertain", and the spec
failed afterwards on a revision with both. Start from a trace of that
failure (run 37245324663, or a fresh one from slice 2) and
`server/launchInstruction.ts` and `server/hosts/cursor/launch.ts`, and list
every path by which a launch returns while acceptance is unknown. Force the
remaining one in the fake Cursor before repairing. Lengthening the 5 s wait
is a repair only if the trace shows the page reaching "accepted" later; in
the logged failure it showed "uncertain", which a longer wait does not
change.

### 5. Every other spec the repeated run showed failing is repaired
Type: Behavior
Status: done
Proof: per cause, a forced-order check red before and green after, or, where
no seam can force it, the spec's count in a 20-repetition run before and
after; then the spec's own file through `npm run test:dashboard`.

Behavior: a spec other than the two above failed in slice 2's result on an
unchanged revision → the suite runs on CI's runners → that spec passes, with
its assertions kept.

Work one cause at a time, most frequent first, and commit each repair
separately. Expected candidates:
`agent-launch-card-noted-start.spec.ts:170` and
`agent-launch-start-phases.spec.ts:24`. A spec that slice 2 did not show
failing is not repaired on suspicion. If slice 2 shows more than four
distinct causes beyond slices 3 and 4, repair the four most frequent, then
stop and report the rest with their counts so the remainder can become its
own story.

### 6. Twenty consecutive repetitions pass on the repaired revision
Type: Behavior
Status: planned
Proof: `bash scripts/ci-repeat.sh 20` on the revision that holds every
repair exits 0; record the revision and run IDs under Learnings.

Behavior: the branch holds slices 1 and 3–5 → 20 repetitions are triggered on
that one revision → every job of every repetition passes.

A failure returns to slice 5's loop for that spec, and the 20 start again on
the new revision. A failed `lint` or `test` job is recorded as a finding and
that repetition rerun; it is not this story's repair. If a second full round
still fails, stop and report the remaining specs and counts. Waiting on CI is
this slice's external-wait exception.

## Current decisions

- The repeated run dispatches the existing `ci.yml`; the workflow file is not
  edited.
- A repair is proved at its cause by a forced order where a seam allows it.
  Local repetition is not used as proof, because it did not reproduce either
  named failure.
- Slice 2 runs before any repair so the before-counts exist.

## Learnings

- Slice 1 accepted proof: `PATH=/opt/homebrew/bin:$PATH env -u NODE_ENV npm test -- tests/ci-repeat.sh tests/ci-test-times.sh`
  → pass (stand-in cases in `tests/ci-repeat.sh`, fixture in
  `tests/helpers/ci-repeat-fixture.bash`). The script claims its own run as the
  oldest matching dispatch run absent from the listing taken just before its
  dispatch, rather than by creation time. The stand-in ignores `--jq`, so the
  real `gh api`, `run list`, and `run view --json` shapes are first exercised
  in slice 2. Shell checks need Bash 5 first on `PATH` on this machine.
- Slice 3: the `:138` failure (runs 37169060163, 8cb57afc) was a product
  race. `launchRun.ts` put `reporting` on the owned in-memory attempt before
  keeping it, and `attempts()` answers memory for owned attempts. It now keeps
  first, as `note()` already did. The `:157` failure (run 37206540831,
  2e9d5a70) was the same race in `note()`, already repaired by `9e3aff60`
  without a forced-order check; run 37245324663 failed only on the Cursor
  spec. `agent-launch-acceptance-kept-first.spec.ts` holds the attempts-file
  replacement that first carries `reporting`, then `outcome`, and asserts the
  answer equals the kept file: red before the repair (and for `outcome` with
  the pre-`9e3aff60` `note()` restored), green after. The acceptance spec also
  waits for the held Claude launch after `published`. Server fs loaders now
  share `tests/support/serverFsHook.ts`. Committed before slice 2 finished but
  published only after it, so slice 2's repetitions all ran on `3a0ff700`.
- Slice 4: run 37245324663's trace shows the launch returning `launched`
  295 ms after accept with `firstInput: uncertain` kept, and the page not
  rereading for 15 s, so a longer wait could not repair it. Of the paths by
  which a paste settles the launch wait while acceptance is unknown, the one
  that best fits the trace (a late empty-composer screen) was already closed by
  `4f6d9f89`, after the failing revision. The remaining one was open: a screen
  with neither chip nor composer settled the wait on any finished frame, even
  one that had shown the composer. `KeptClientScreen` now records the screen
  each finished frame showed, and the paste wait settles only on a frame that
  itself showed neither. The fake Cursor's split-paint mode
  (`cursorSplitPaintMs`) forces it in
  `agent-launch-ad-hoc-cursor-split-screen.spec.ts`: red before (also red with
  the pre-`4f6d9f89` file), green after; 133 cursor/terminal tests pass. Not
  repaired: before any instruction is entered, a not-ready screen plus a
  finished frame still settles the wait as uncertain; the fake does not reach
  it and changing it changes when the instruction is entered.
- Slice 2: `bash scripts/ci-repeat.sh 20` on `3a0ff700` (slice 1, no repair)
  → exit 1, "Passed 19 of 20 repetitions, 1 failed". Only failure:
  `production-qualification.spec.ts:36` › qualification spans the whole
  published range, including deletions and both rename endpoints, 1 of 20, in
  `dashboard (9/9)` of run 37299517796. Checked by hand: 37299517796's failed
  job and `FAIL:` line, and 37295878138 (dispatch, `3a0ff700`, every job
  success). Runs: 37295878138 37295893357 37296437524 37296638373 37296886962
  37297088628 37297344675 37297482447 37297790709 37297983335 37298180085
  37298430500 37298572951 37298882373 37299018715 37299324340 37299517796
  37299718000 37299983254 37300243191. Neither named spec failed in these 20;
  slices 3 and 4 rest on their logged evidence. Slice 5's list is
  `production-qualification.spec.ts:36`; the expected candidates
  (`agent-launch-card-noted-start.spec.ts:170`,
  `agent-launch-start-phases.spec.ts:24`) did not fail and are not repaired.
- Slice 5: `production-qualification.spec.ts:36` failed with `ENOTEMPTY …
  inspections/…/objects/pack` from the product's own cleanup, not an
  assertion. After `git fetch`, Git detaches `git maintenance run --auto`,
  which kept writing into the owned inspection repository while
  `qualifyPublishedRange` removed it; `stageDeployment` had the same race.
  Both fetch through `fetchIntoOwnedDirectory` with `maintenance.auto=false`.
  A `GIT_EXEC_PATH` wrapper whose `git maintenance` keeps writing until the
  directory is gone forces the order in a new test in that spec: red before,
  green after; the 16 `production-` specs pass. No other dashboard server path
  fetches into a repository it later removes.
