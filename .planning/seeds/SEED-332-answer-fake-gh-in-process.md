---
id: SEED-332
status: active
planted: 2026-11-13
planted_during: SEED-324#pass-landed-ci-repeat-checks-under-high-load execution, whose dashboard checks spent most of their time under CPU-bound contention in the fake gh's Node process per call
trigger_when: Terry accepted this story at SEED-324's execution handoff on 2026-11-13
scope: story
---

# SEED-332 — Dashboard checks answer GitHub reads without a process per call

## Why this matters

Dashboard checks read GitHub through a fake `gh`. The original report named
a Node process per call; by this preparation, `e7a9265c4` had replaced that
client with shell and curl. Each API call still starts processes and creates
temporary transport files. Under CPU-bound contention that cost matters: in
SEED-324's measurements with foreground CPU burners at load 31–48, the project
scope timing refresh case spent most of its 28 s waiting for the Done
comparison read's 21 calls, and both refresh cases reached the 30 s bound on
trunk and on that story's branch alike. SEED-324 kept the per-call cost out of
scope and Terry chose to take it up here.

Loaded failures seen on trunk and on SEED-324's branch alike, at load 30–70,
are this story's first evidence: `start-origin-isolation.spec.ts:140`
(DD-479), `intent-summary-story-comparison-sort.spec.ts:72`,
`intent-story-changes-landed-run.spec.ts:75`,
`intent-done-default-answer-selection.spec.ts:42`, and five scope-history
specs (`intent-scope-collected-file-timing-gaps`,
`intent-scope-collected-file-timing-history`,
`intent-scope-collected-timing-history`, `intent-scope-prior-build-states`,
`intent-scope-prior-build-average`, whose journey SEED-331 moved into
`intent-scope-glance` at `92574ccd3`).

<a id="answer-fake-gh-reads-in-process"></a>

### Answer fake GitHub reads without a process per call

**Identity:** SEED-332#answer-fake-gh-reads-in-process
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/610-answer-fake-gh-reads-in-process/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"851cf739b7adcad05b4e68d95b7723aad2e7c3ff95c4d2a5d4cba6dc2d16ff08","plan":"bcdd1a766bc54fea1f765e1b56aa28eec010039997d96ca39402135b62d74e00"}}
```

#### Goal

Maintainers get passing dashboard checks while other work keeps the machine's
CPUs busy, because a check's GitHub reads cost no new process each: the cases
named above and SEED-324's landed CI repeat checks pass with the default 30 s
case timeout under CPU-bound contention at a one-minute load of 30–50.

#### Scope

- The fake `gh` the dashboard checks use, and how a dashboard server under
  test reaches it. Ordinary simulated API calls answer in an already-running
  test process without starting a process for each call. Starting a private
  request owner or resolving its login may still use processes.
- Preserve the real authenticated read boundary and request-owner admission,
  outstanding-call sharing, rate-limit interpretation, cancellation and
  shutdown. Reuse the existing fake GitHub's answerers and `gh` response
  conversion, including exact argv, binary bodies, HTTP status and headers,
  nonzero exits, held answers and provider actions that the current checks use.
- Keep the native CLI path for checks whose observation requires actual
  process creation, PIDs, signals, owner replacement or orphan cleanup. Those
  observations are independently necessary proof of the production process
  boundary; simulated PIDs or removed assertions would lose that proof.
- Preserve test isolation between machines, request owners, simultaneous
  servers and hosted shards. A fake transport failure must not reach live
  GitHub or fall back to the machine's real `gh`.
- Evaluate the named loaded failures and SEED-324's landed CI repeat checks
  with two local workers, default case timeouts and unchanged observations.
  Record natural load and actual CPU contention; burners are diagnostic
  evidence, not the natural-load acceptance required by
  [local test resources](../../tests/local-test-resources.md#load-while-measuring).
  Hosted CI retains its thirteen shards, CPU-derived worker count and current
  deadlines; compare recorded shard times and require the changed suite to pass.
- Scope limits: no product behavior changes or production `gh` transport
  changes; no timeout increases, removed journeys, reduced assertions,
  new GitHub answer model, or general test-runner redesign. No numeric
  speedup is promised beyond removing per-call process creation and meeting
  the existing default timeout under the stated load.

#### Key examples

- A Done comparison needs 21 GitHub reads while the machine has natural
  CPU-bound load 30–50. Opening it and refreshing Project Intent complete
  within each case's default 30 s budget; no simulated API read launches
  its own subprocess.
- A fake GitHub holds one shared read while two consumers wait. One leaves,
  the other still receives the answer after release. When the last waiter
  leaves or the server closes, the held transport ends and teardown leaves
  no request or owner behind.
- A response contains binary bytes, or a non-success HTTP status with
  headers and stderr. The ordinary transport presents the same answer as
  the installed synthetic CLI. A rate-limit response still changes request
  admission through the real owner, and a workflow repeat is still recorded
  by the same fake provider.
- A subprocess-lifecycle check holds a real `gh`, closes its consumer and
  observes its PID disappear and its SIGTERM record. It continues using
  the native CLI path and keeps those assertions.
- Two servers use separate fake GitHubs with different answers, while a
  restart or a deliberately shared owner preserves its own scope. Reads
  remain isolated, including on a hosted shard; missing or closed fake
  endpoints fail locally.
