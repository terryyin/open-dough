# Diagnosis: claude-launch-call-unseen

## Signatures
- S1 (backend): agent-launch-duplicate.spec.ts :136 :141 :189 :225 — `held()` poll
  `native.claudeLaunches()` toHaveLength(1) times out at 3 s (spec:115); recorded
  calls are `[]`. Passing in the same run: :146 :158 (story requests, held), :209
  (ad hoc, refused/launched). Failing set = ad hoc requests + `held` scenario.
- S2 (e2e): agent-launch-claude-verification.spec.ts :85 :176 —
  `dashboard.claudeLaunchCalls()` toHaveLength(1) times out at 5 s
  (dashboard/test-support/claudeVerification.ts:44).
- The fake `claude` appends to calls.jsonl before any scenario handling, so `[]`
  means the fake was never started (or started after the poll).

## Reproduction rate and conditions
- Prior: s3-head-launch.log (5fc03cd, macOS, load 20-40, 4/4 S1 failures);
  s3-e2e2/e2e3/e2e-head logs (S2).

## Attribution
- Identical at base 5fc03cd (s3-head-launch.log, s3-e2e-head.log); hosted CI green
  on main and this branch (ci.yml 45970211439, 45967682712). Story changes do not
  touch the launch path under test.

## Hypotheses and experiments
- H1 (batch r1-alone, stop after 1 run): S1 reproduces with agent-launch-duplicate.spec.ts
  alone at current load (~21) under this session's environment.
  Result: NOT reproduced. 7/7 pass alone at load 18.7 (r1-alone.log, r1-alone.json);
  :136 took 1346 ms, :225 4504 ms (vs 3-s poll bound inside).
- H2 (batch r1-pair, stop after 1 run): S1 needs the second file running in parallel
  (the failing s3-head-launch command: duplicate + model-boundary).
  Result: NOT reproduced. 15/15 pass at load 16 (r1-pair.log). :136 3443 ms, close to
  its 3-s inner poll; S1 looks load-sensitive (ad hoc start runs the installed
  session-start script before `claude`, dashboard/server/unattachedStart.ts:143),
  unlike S2, which failed 3/3 (s3-e2e2/3/head). S2 error-context shows the card at
  "Local startup in progress" — the execution start script had not finished.
- H3 (batch r1-e2e, stop after 1 run each): S2 reproduces now at load ~16 (run A,
  session env); and it is the inherited Claude Code session environment (run B:
  same command with every CLAUDE*/AI_AGENT variable unset). A fails + B passes
  confirms H3.
  Result: NOT reproduced. A (session env) and B (Claude env unset) both pass 3/3 at
  load 15-17 (r1-e2eA.log, r1-e2eB.log). Inherited-environment cause is not
  supported: the session env passes at low load. Failures track load (S2 3/3 at
  load 27-30; S1 once at load ~25+ beside a second file). In the failing runs the
  one-shot case :132 passed while standard :85/:176 failed; backend story starts
  passed while ad hoc failed — the failing kinds run a longer start before `claude`.

## Temporary diagnostic edits to revert
- dashboard/test-support/claudeVerification.ts:44 — 60-s poll + append of
  acceptance-to-launch-call ms to jobs tmp diag-timing.txt. REVERTED at round end
  (git diff clean for that file). No parked changes in the tested tree.

- H4 (batch r1-timing, stop after 1 run each; instrument + injection): the
  acceptance-to-`claude` interval of the standard execution start is a load-scaled
  duration, not a hang: (C) measured at ambient load, (D) with injected CPU load
  (24 `yes` busy loops on 16 cores) it exceeds 5 s but still completes within 60 s.
  Result (diag-timing.txt; r1-timingC/D logs, both exit 0, 3/3 pass):
  C, load 11.8: one-shot 1879 ms; standard 4895 ms and 2878 ms.
  D, injected load 24-32: one-shot 1861 ms; standard 2867 ms and 3861 ms.
  Values sit on Playwright's expect.poll cumulative interval steps (100, 350, 850,
  1850, 2850, 3850, 4850 ms), so the real interval is within the preceding 1 s
  step. No hang: the call always arrives; the standard execution start alone takes
  ~2-5 s before `claude` is spawned at load 12-32, against the default 5-s poll
  bound at claudeVerification.ts:44. H4 confirmed as far as "load-scaled
  duration, not a hang"; injected load alone did not push it past 5 s this round.
- Side checks: no /etc/gitconfig; only /usr/bin/git (Apple shim, ~30 ms per call,
  20 calls 0.59 s) — not dominant. Trunk 013d9c0be keeps the same default-bound
  poll (origin/main claudeVerification.ts:46) and changes only which trunk Git
  reads see, so it does not address this.

## Ruled-out environments
- Inherited Claude Code session env (CLAUDE*/AI_AGENT): with and without it 3/3 pass
  at load ~16 (r1-e2eA/B). Not ruled out at high load (no reproduction this round).
- Real `claude` on PATH: fake records every call first thing
  (fixtures/fake-claude:38-41) and calls arrive in all runs this round.

## Reproduction command
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run test:e2e -- e2e/launches/agent-launch-claude-verification.spec.ts
(S1: OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=... npm run --silent test:dashboard:backend -- dashboard/backend-tests/launches/agent-launch-duplicate.spec.ts dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts)
Reproduction rate this round: 0/5 runs (load 12-32, one with injected load).

## Unrelated defects
- None found.

## Leading hypothesis
Fixed time bounds on a load-scaled start: S2's default 5-s expect.poll
(claudeVerification.ts:44) and S1's 3-s poll (agent-launch-duplicate.spec.ts:116)
cover the whole start before `claude` (S2: installed execution start script,
Node + Git subprocesses; S1: ad hoc session-start script,
dashboard/server/unattachedStart.ts:143). Measured 2.9-4.9 s for S2 at load 12-32
on this machine; failing runs at load 27-30 exceeded 5 s. CI hosts are unloaded, so
the bound holds there. This is "a fixed bound a loaded machine legitimately
exceeds"; the case-local allowance (e.g. the 30-s bound the next poll at
claudeVerification.ts:47-49 already uses) or a faster start is the developer's call.
Not confirmed by a failing-before reproduction yet.

## Next discriminating experiment
Reproduce S2 under sustained load >=30 (the failing condition; injected `yes` load
reached only 24-32 briefly) with the timing instrument, to capture an interval
>5 s that still completes — confirms the bound, not a hang. Optionally break the
standard start's time down by phase (startProgress) to see whether any single
step dominates.

## Rounds
Round 1, cumulative active minutes ~4 (clock status at round end).

## Round 1 continuation
- H5 (batch r1-timingE, stop after 1 run): with sustained injected load (40 `yes`
  loops, 45 s warm-up, target load >=30) and the timing instrument (re-applied at
  claudeVerification.ts:44, same DIAG lines, reverted after), the standard start's
  acceptance-to-`claude` interval exceeds 5 s and still completes within 60 s.
  Result (r1-timingE.log, exit 1; load 42 at start, 70 at end; poll interval 100 ms):
  one-shot 3587 ms; standard 6701 ms (> 5 s, still completed) and 4401 ms. The
  instrumented 60-s poll let S2's step pass; :176 then failed later at
  agent-launch-claude-verification.spec.ts:196 (`toContainText`, default 5-s
  timeout, element not found) — another fixed default bound under the same load.
  H5 confirmed: the interval is load-scaled and exceeds the 5-s default under
  load; it is not a hang and not environment-specific. Instrument REVERTED
  (claudeVerification.ts clean). The forced-load run (40 `yes` loops on 16 cores)
  is the reproduction to reuse as proof for any allowance.

## Verdict after round 1
Cause found: fixed default bounds (S2: 5-s expect.poll at claudeVerification.ts:44;
S1: 3-s poll at agent-launch-duplicate.spec.ts:116) on a start that legitimately
scales with machine load (Node + Git start subprocesses before `claude`). No
environment defect; trunk 013d9c0be does not change it. A case-local allowance
(or a faster start) is the developer's call — not applied. Downstream default
bounds in the same journeys (e.g. :196) also exceed 5 s at load ~70.
Round 1 complete; cumulative active minutes ~5.

## Full backend suite before landing (2026-11-27)

- Full `test:dashboard:backend` at `81ffd498f` (load 21–23 after a ~20 min
  wait for the machine-wide suite admission): 14 of 1,659 Vitest cases failed
  in eight files, all launch and review journeys this story did not edit.
  Hosted CI run 45998466973 on the same revision passed.
- Rerun of only those eight files with `--workers 4` (load 12–14): 38 passed;
  `agent-launch-duplicate.spec.ts:189` and `:225` failed again with the same
  unseen Claude launch call. The other six files' failures were load timing.
- Disposition pending the developer: a case-local allowance on the launch-call
  waits, or a faster launch start.
