# Stopped revision-stream CI failure

Failure policy: [Failing and flaky tests](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Round 1

- Story branch implementation `fec5889e53be32035a1a03b9316a733d42082fca`,
  current checkout `abf6c37065c74d90137ced044b8c28da5805b770`.
  No unfinished tracked or untracked work was parked.
- [CI run 45354881438, attempt 1, E2E shard 4/6](https://github.com/terryyin/open-dough/actions/runs/45354881438/job/138310258982)
  failed at `e2e/observation/revision-stream-stopped.spec.ts:161`.
  After SIGSTOP and advancing page time 45 s, the page had no
  `alert` with the lost-freshness text. The first inventory still had
  one backend shard in progress. The bounded diagnostic is in Git evidence.
- The story's net diff does not edit revision-stream scheduling or its test.
  The first slice's branch CI passed, and the later published attempt
  failed once. No other recorded active owner of this exact repair was found.
- Initial hypothesis: a heartbeat delivered before the stopped process is
  quiescent can reset the silence timer after page time starts advancing.
  Inspect the failing trace and run one focused local journey, then choose
  a controlled discriminator if natural proof does not reproduce.
- The first local macOS run at one worker exited 0 under AC sleep guard.
  Worktrees for Review published changes and the wall-time history story
  were running separate verification. The CI trace's browser frame at
  90705.497 ms was already connected, before the SIGSTOP step at 90961.313 ms.
  The failure snapshot still showed connected at A.
- Controlled experiment, one stopped-stream journey only: defer the second
  genuine EventSource message until the first 250 ms of fake time have
  passed after SIGSTOP. This models a queued delivery, keeps the original
  45 s span and existing assertion, and should reproduce the missing alert.
- The held-event re-dispatch run passed, so it did not establish that the
  product callback was reached. One instrumented attempt now defers and calls
  the actual onmessage handler, independently recording its fake page time
  and the silence timer's arming time. The maintained assertion stays intact.
- The controlled callback reached the product at fake time 1790154000250
  (250 ms into the stopped interval). The 45,000 ms silence timer rearmed
  at the same time. The exact original lost-alert assertion then failed
  at the end of the original 45 s advance. The temporary instrumentation
  was restored. Git evidence retains `stream-ci-queued-callback.log`, its
  run record, the temporary patch source, and the failed-run trace.
  One diagnosis round, 3.4 active minutes recorded at the decisive run.

## Repair

- Wait for the first real connected cue before SIGSTOP. The stopped-stream
  fixture now leaves its next wall-clock answer outside the default test
  timeout. This removes the race while retaining the exact client advance,
  the stopped process, and the entire reopen and recovery sequence. The
  504 listing case keeps its fast fixture.
- Run the two affected file cases once under AC sleep guard. The fix should
  establish the original deadline and recovery assertions without extra page
  time. Run Dashboard typecheck once.
  Both browser cases passed at one worker in 20.9 s, and Dashboard typecheck
  and the diff check passed. Git evidence retains the exact commands in
  `stream-ci-repaired.log.run.json` and `stream-ci-repair-types.log.run.json`.
- Hosted validation hypothesis: one normal push-triggered CI attempt on
  the repaired candidate will pass the full E2E shard. The fixture removes
  the in-flight second answer that postponed the deadline in the forced
  reproduction. If that attempt fails, inspect the new evidence before any
  new run.
