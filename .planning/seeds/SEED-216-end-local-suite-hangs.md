---
id: SEED-216
status: active
planted: 2026-11-02
planted_during: SEED-192#review-story-intent-impact stopped after local suite hang
trigger_when: Local npm test or dashboard concurrent runs hang or race in this repository
scope: Open Dough local test-suite reliability for held GitHub fixture calls and concurrent Playwright output dirs
---

# SEED-216: End local suite hangs that stall delivery

## Why This Matters

A developer running Open Dough's full local suite can lose hours when one job
never finishes and progress is invisible. That blocks ordinary story delivery
gates even when product work is otherwise ready.

## Selected Stories

<a id="fix-owned-calls-start-slack-hang"></a>

### 1. End the held-gh start-slack deadlock and concurrent test-results race

**Identity:** SEED-216#fix-owned-calls-start-slack-hang

**Beneficiary:** A developer running `npm test` or local dashboard Playwright
in this repository, including during story delivery publication gates.

**Goal:** The local suite no longer stalls indefinitely on
`github-request-owned-calls` when fixture `gh` log calls are held, and two
near-simultaneous dashboard Playwright runs no longer fail with `ENOENT`
creating `dashboard/test-results/<stamp>`. After the fix, `npm test` completes
with a finite result under normal local parallelism, and
`tests/dashboard-concurrent-runs.sh` stays green alone and under the full
suite.

**Facts observed (2026-11-02, during SEED-192#review-story-intent-impact):**

- Hang symptom: `npm test` sat for tens of minutes on
  `src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs`
  with a live child
  `…/ci-github-acquisition-*/gh api --include repos/owner/repo/actions/jobs/1/logs`
  at 0% CPU. The same file alone finished in ~5s (11 pass). Node was launched
  with `--test-timeout=0`, so the stuck test never timed out.
- Root cause (reproduced): fixture `gh` uses `holdLogs: true` and waits on
  `release-logs` until signalled. `OwnedCalls.started()` records `startedAtMs`
  after `await call(...)`, and the first test records both calls only after
  the second is up. `earlierCallsEnded` signals only when `ps` shows matching
  args and start within `startSlackMs` (2s). When spawn→`started()` exceeds
  that window under suite load, recognition returns `"another"`, the record is
  removed without killing `gh`, and the test deadlocks on `await left.exit`
  (expects 143). Teardown that would `SIGKILL` runs only after the test ends.
- Controlled repro: delay 3.5s before `started()` → `earlierCallsEnded` returns
  `[]`, live `gh` unsignalled, exit wait times out.
- Contributing opacity: piping `npm test` through `| tee | tail -N` held all
  output until the suite finished, so a hung job looked like total stagnation.
- Separate flake under full suite: `tests/dashboard-concurrent-runs.sh` failed
  twice with
  `ENOENT: mkdir '…/dashboard/test-results/<iso-stamp>'` when the parent
  `test-results` directory was missing. Alone, the script passed repeatedly.
  Partial mitigation already in tree: Playwright run stamps include pid, refuse
  an empty stamp, and `mkdirSync` the `test-results` parent before Playwright
  starts (`dashboard/playwright.config.ts`). Confirm under full `npm test` as
  part of this story; extend if the race remains.

**Scope:**

- Fix recognition/recording so a held call the test owns is still ended when
  spawn-to-record latency exceeds today's 2s slack (record start at spawn,
  widen/replace the slack rule, or fail closed without awaiting an exit that
  will never come).
- Ensure teardown or the test cannot deadlock on `await exit` when the process
  was not signalled; keep `--test-timeout=0` from masking infinite waits, or
  give this file a finite timeout.
- Prove with a focused regression that a delayed `started()` still ends the
  held `gh`, and that the owned-calls file passes alone and under suite-like
  parallelism.
- Confirm or finish the concurrent `test-results` parent/stamp fix so
  `dashboard-concurrent-runs` passes under full `npm test`.
- Do not redesign the GitHub request-owner production path beyond what these
  tests require.

**Key examples:**

1. With holdLogs `gh` spawned and `started()` delayed >2s, `earlierCallsEnded`
   still ends that process (or the test fails fast without hanging).
2. `node --test …/github-request-owned-calls.test.mjs` passes alone.
3. `npm test` completes without an indefinite owned-calls job.
4. `tests/dashboard-concurrent-runs.sh` passes; full `npm test` does not fail
   that script with `ENOENT` on `dashboard/test-results/<stamp>`.
