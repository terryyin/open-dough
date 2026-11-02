# Independent source review

Launch: fresh general-purpose agent `/root/source_commitments`, `fork_turns: none`,
no other project files or tools, no changes. The launch and full returned review
are retained in this execution's conversation.

Input: the selected seed's Beneficiary, Goal, Scope, Considered and deferred,
and all four Key examples, with this explicit human amendment:
"we will execute plan 444 as recommended, update it so it including a permanent
delayed-start regression. Keep the runner-wide timeout and progress output
deferred. then land". No plan, implementation, proof, or suspected omission was
supplied.

Reviewer: `/root/source_commitments`. The following commitment text is the
reviewer's returned individual commitments; all belong to the single slice.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | The local suite finishes in finite time. | slice 1 | observed: Full local npm test finished in517.00s, coordinator session41908 terminal exit0; /tmp/open-dough-plan444-full-suite.log. |
| C02 | The local suite produces a named result. | slice 1 | observed: The intentional late-recording mutation reported the exact delayed-start test name and timeout through the normal quiet-on-pass runner; successful runs retain silence. |
| C03 | Late fixture logging under load does not deadlock `github-request-owned-calls`. | slice 1 | observed: github-request-owned-calls.test.mjs: permanent delayed-start test passes alone and with four simultaneous normal-runner copies; fixture startup delayed 3500 ms in its original PID. |
| C04 | A remaining hang in that file produces a reported failure. | slice 1 | observed: Isolated late-recording mutation: normal runner exit 1 named the delayed-start test with test timed out after 30000ms; implementation agent transcript chunk 1fd287, session 61854. |
| C05 | `tests/dashboard-concurrent-runs.sh` passes alone. | slice 1 | observed: PATH=/opt/homebrew/bin:$PATH env -u NO_COLOR -u FORCE_COLOR bash scripts/test.sh tests/dashboard-concurrent-runs.sh passed alone, coordinator session 73366 terminal exit 0. |
| C06 | `tests/dashboard-concurrent-runs.sh` passes within the full suite. | slice 1 | observed: Full local npm test exit0 includes tests/dashboard-concurrent-runs.sh; no dashboard ENOENT or other failure report in /tmp/open-dough-plan444-full-suite.log. |
| C07 | Full-suite execution can finish during story delivery publication gates. | slice 1 | observed: The actual repository delivery-gate command npm test terminally passed in517.00s; source/test fixes remove the observed indefinite held-call blocker. |
| C08 | Every fixture `gh` call is recorded against `OwnedCalls` when spawned. | slice 1 | observed: leftCalls.call records each real ownership record immediately after spawn; wrong-argument/hour-early identity counterexamples and the process-table-only probe intentionally retain their distinct purpose. |
| C09 | Recognition of a test’s held call does not depend on fixture logging latency. | slice 1 | observed: Permanent delayed-start test delays actual fixture startup 3500 ms in the same PID, asserts asked.at-started>=3500, then earlierCallsEnded([], generation 2), exit143 and no record. |
| C10 | `startSlackMs` remains unchanged. | slice 1 | observed: git diff against accepted Take 39424d5b touches only the owned test and planning records; production startSlackMs is unchanged. |
| C11 | The production recognition rule remains unchanged. | slice 1 | observed: git diff against accepted Take 39424d5b leaves github-request-owned-calls.mjs recognition unchanged; existing false-identity counterexamples still pass. |
| C12 | Every test in `github-request-owned-calls.test.mjs` has a finite bound. | slice 1 | observed: Every test uses local test(name,run), which delegates directly to nodeTest(name,{timeout:30000},run); focused and four-copy proof passed after this refactor, preserving individual names and Node timeout semantics. |
| C13 | A remaining wait for an exit that never arrives fails promptly through that bound. | slice 1 | observed: Late-recording mutation made the permanent regression await an unsignalled exit; it terminated with test timed out after 30000ms (implementation transcript chunk 1fd287). |
| C14 | The timeout failure identifies the affected test and the timeout. | slice 1 | observed: Mutation normal runner printed not ok: a held call is recognized after its fixture starts 3.5 seconds late, location, and test timed out after 30000ms. |
| C15 | The owned-calls test file terminates after the illustrated timeout. | slice 1 | observed: Mutation command through scripts/test.sh exited 1 at the per-test bound; implementation session 61854 terminal observation, not an ongoing process. |
| C16 | Teardown still ends the affected fixture `gh`. | slice 1 | observed: leftCalls.call registers SIGKILL teardown awaiting exit; after the mutation timeout its observed fixture PID91153 was absent (ProcessLookupError). |
| C17 | The illustrated timeout journey leaves no fixture `gh` running. | slice 1 | observed: Implementation agent checked os.kill(91153,0) after named mutation timeout and observed ProcessLookupError; scratch mutant removed, actual source never mutated. |
| C18 | A permanent, focused delayed-start regression is included. | slice 1 | observed: Committed-change candidate adds the permanent named delayed-start test directly to the normal github-request-owned-calls.test.mjs job; focused and four-copy normal-runner proof pass. |
| C19 | The regression proves that a call logged more than two seconds after spawn is ended with exit status `143`. | slice 1 | observed: Permanent regression asserts asked.at-started>=3500 then await left.exit equals143, after generation2 earlierCallsEnded. |
| C20 | The regression proves that the ended call’s record is removed. | slice 1 | observed: Permanent regression asserts records() deeply equals[] after the delayed owned call exits. |
| C21 | In that illustrated generation transition, generation 2’s `earlierCallsEnded` answers `[]`. | slice 1 | observed: Permanent regression supplies OwnedCalls(directory,1) at spawn and asserts earlierCallsEnded(directory,2) deeply equals[]. |
| C22 | The owned-calls test file passes alone. | slice 1 | observed: PATH=/opt/homebrew/bin:$PATH env -u NO_COLOR -u FORCE_COLOR bash scripts/test.sh src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs passed on final assertions, implementation transcript. |
| C23 | The owned-calls test file passes under suite-like parallelism. | slice 1 | observed: Four simultaneous normal-runner copies terminally passed on final assertions; implementation chunk54c572/session22097; /tmp/plan444-parallel-final.eKYxEs/{1,2,3,4}.log are empty. |
| C24 | Full local `npm test` is run after the fix. | slice 1 | observed: PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_TIMES=/tmp/open-dough-plan444-times.txt /usr/bin/time -p env -u NO_COLOR -u FORCE_COLOR npm test ran after the at-spawn fix and permanent regression, exit0, real517.00s. |
| C25 | The full local run has no specified dashboard-results `ENOENT` failure. | slice 1 | observed: Full normal local runner produced no failure diagnostics and exit0; dashboard-concurrent-runs job included, no dashboard/test-results ENOENT. |
| C26 | If the race recurs, its parent-directory removal or noncreation cause is identified. | slice 1 | observed: Conditional recurrence trigger did not occur: standalone dashboard-concurrent and full npm test both passed; no parent-removal/noncreation defect was reproduced. |
| C27 | If the race recurs, that race is fixed within this story. | slice 1 | observed: No concurrent-results recurrence in the required runs; existing Playwright mitigation retained and conditional repair not triggered. |
| C28 | The GitHub request-owner production path remains unchanged. | slice 1 | observed: Production request-owner paths unchanged in diff against accepted Take39424d5b; all implementation edits reside in github-request-owned-calls.test.mjs. |
| C29 | A runner-wide test timeout remains deferred. | slice 1 | observed: scripts/test.sh unchanged; timeout option exists only in the selected test file; Plan444 explicitly retains runner-wide deferral. |
| C30 | Live local-suite progress output remains deferred. | slice 1 | observed: scripts/test.sh and reporters unchanged; focused and four-copy passing logs empty; Plan444 explicitly retains live-progress deferral. |
| C31 | Plan 444 is updated to include the permanent delayed-start regression. | slice 1 | observed: Plan444 Outside-in proof and Behavior slice now require a permanent normal-suite delayed-start regression and a discriminating temporary mutation. |
| C32 | Plan 444 is executed as recommended. | slice 1 | observed: The single authorized Behavior slice is implemented and its focused, four-copy, mutation and full local promises observed; delivery and closure remain coordinator-owned. |
| C33 | Landing follows the requested plan update and execution. | slice 1 | observed: Ordering observed: Plan444 amendment preceded implementation; execution proof passed before any landing. Coordinator owns authorized post-execution delivery/closure and Dough Land; no premature landing performed. |

## Qualifications, examples, and exclusions from the return

- The beneficiary runs local `npm test` or dashboard Playwright in this
  repository. The file-specific timeout does not extend to other test files.
- C07 covers completion enabled by resolving these blockers; unrelated
  publication gates are not promised to succeed.
- C08 uses production spawn-time recording as its reference. Source comparison:
  the original scope qualifies this with "a test's own held call"; deliberately
  false identity records and process-table probes must remain meaningful
  counterexamples, rather than being replaced by correct ownership records.
- C18–C21 retain the 3.5-second example: generation 1 records at spawn;
  generation 2 answers `[]`; the call exits 143 after `told-to-end`; its
  record disappears. The general threshold is more than two seconds.
- C12–C17 retain the no-exit example: the finite bound elapses, reports the
  affected test and timeout, ends the file, and leaves no fixture `gh` running.
- C22's command is `bash scripts/test.sh
  src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs`.
- C23 allows other owned-calls copies or CPU load; both are not required.
- C26–C27 are conditional on recurrence; removal and noncreation are
  alternative causes, not a prescribed diagnosis.
- "As recommended" qualifies C32; the source-only input supplied no further
  recommendation text. The actual recommendation and human amendment remain
  in the conversation for coordinator comparison.
- C10/C11/C28 exclude production and recognition-slack changes. C29/C30 defer
  global timeout and live progress changes, preserving silent-on-pass behavior.
- Caller `| tee | tail` buffering creates no runner-buffering repair promise.
  Recurrence elsewhere may justify a separate story, but no future story is
  promised here.

## Expected versus observed

- Delayed startup (C03/C08/C09/C18–C23): the test wraps the fixture executable
  with a 3500 ms delayed `require` in the same process. It observes the actual
  fixture's timestamp, generation-2 result `[]`, exit 143, matching
  `told-to-end` PID and empty records. Focused and four simultaneous normal
  runner copies passed. Deliberately invalid ownership records remain distinct
  counterexamples; this is consistent with the source's "test's own held call"
  qualification.
- No-exit journey (C02/C04/C12–C17): a scratch copy moved ownership recording
  after acknowledgment and selected only the permanent test. The normal
  runner reported that exact test and `test timed out after 30000ms`, then
  exited 1. The agent observed PID 91153 absent afterward. Source was never
  mutated; the scratch copy was removed. This tests a named failure while
  retaining silent passing runs, reconciling the goal with the explicit quiet
  output constraint.
- Dashboard standalone (C05): normal runner command exited 0 in coordinator
  session 73366. Full-suite promises (C01/C06/C07/C24/C25) passed in session
  41908, exit 0, real 517.00 s. The race did not recur, so conditional repair
  C26/C27 did not trigger. The unchanged dashboard mitigation is retained.
- Refactor: local `test(name, run)` delegates to Node with the same 30000 ms
  per-test bound, preserving callbacks and names. Focused and four simultaneous
  normal-runner copies passed again; broader unchanged product, runner and
  dashboard proof reuses the full verdict. Mutation proof remains applicable
  to unchanged at-spawn recording, teardown and Node timeout semantics.
- Scope and sequencing (C10/C11/C28–C33): production, shared runner and
  reporters are unchanged. Plan amendment preceded implementation. Execution
  delivery and later landing remain coordinator workflow duties; C33 requires
  that ordering and is not extra runtime behavior inside this test slice.

## Literal mutation observation

From the execution checkout:

```sh
PATH=/opt/homebrew/bin:$PATH env -u NO_COLOR -u FORCE_COLOR bash scripts/test.sh /var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/plan444-mutation.p38w97f2/owned-calls.test.mjs
```

The scratch import wrapper registered only
`a held call is recognized after its fixture starts 3.5 seconds late` with
Node's test runner. Module imports still used this execution checkout. The
helper's ownership recording moved to immediately after its startup `until`.
Terminal evidence: implementation agent session 61854, chunk `1fd287`, exit 1;
its following tool result checked PID 91153 with `os.kill(pid, 0)` and received
`ProcessLookupError`. Full output and final four-copy orchestration are retained
in that agent's follow-up in this execution's conversation. Final four-copy
logs remain at `/tmp/plan444-parallel-final.eKYxEs/{1,2,3,4}.log` (all empty).
