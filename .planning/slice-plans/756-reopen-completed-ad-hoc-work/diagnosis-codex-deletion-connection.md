# Diagnose the Codex deletion test's connection count

- Revision `81055d1c345da92ecef21ee586d022a8d476e2bd`, GitHub Actions
  [run 45154088348](https://github.com/terryyin/open-dough/actions/runs/45154088348),
  attempt 1, dashboard-backend shard 1, step 12. The deletion lifetime
  case at `agent-launch-codex-lifetime.spec.ts:191` expected one open
  socket after launch and saw two, before it exercised deletion.
- Round 1. Hypothesis: an independent native session observation can
  overlap the retained input connection. Reproduce once with a bounded
  instrumented fixture if the first focused run does not expose the count,
  identify each socket, then prove deletion and post-deletion failure
  with the retained connection named explicitly.
- Slice 6 is parked and excluded from the proof and repair. Follow the
  [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

The unmodified isolated case passed once. A controlled passive
`thread/read` for the launched thread, held with the existing vendor fixture
before the original assertion, reproduced the CI signal exactly. The
connection count was two while the assertion required one. The held read
and the accepted `turn/start` belong to different connections. Proof records
are `repair5-repro.log.run.json` and
`repair5-overlap-repro.log.run.json` in the worktree's Git evidence directory.

The repair keeps the overlap and captures the fake vendor socket that
accepted `turn/start`. The real deletion receives an unreadable result from
its own native read. The case verifies the record was deleted and the turn
connection is still present, disconnects that specific connection, releases
the independent observation, and checks both the durable record and the
machine session response. Production and the fake's existing all-connection
failure control are unchanged.

The repaired test and its eight focused companion cases passed on their
first Chromium attempt. Dashboard typecheck and whitespace checks passed.
See `repair5-report.md` and the exact run records in the worktree's Git
evidence directory. The next CI run should validate the targeted deletion
case under the same full-shard load that exposed the original assertion.
- The terminal original attempt inventory contains that one failing case.
  Publish one repair candidate. The same shard should pass with the held
  observation and accepted-turn socket exercised on every run.
