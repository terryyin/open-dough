# Stop repeating Git work in shared publication

**Identity:** SEED-421#stop-repeating-git-work-in-shared-publication

**Source:** [Stop repeating Git work in shared publication](../../seeds/SEED-421-stop-repeating-git-work-in-shared-publication.md#stop-repeating-git-work-in-shared-publication)

**Source review:** [Source-only review](source-review.md)

## Goal and scope

Bring the existing declared blank Default main launch case within its 5 s
timeout at representative load around 25 by reducing redundant Git work.
Preserve the assertions, launch and session receipts, refusal and recovery
behavior, and safe retirement. The test's branch removal, reflog expiration
and garbage collection make the pin-lifetime assertion meaningful. Retain
those fixture operations. Production retirement still owns its fresh
containment, ownership and cleanliness checks. Optimize it only where the
trace demonstrates duplication within that operation. Test setup speedups,
timeouts, new workflow paths and changes to retention policy are outside
this story.

## Existing owners and decisions

- Change the existing [increment publisher](../../../Distribution/src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs)
  and its [remote operations](../../../Distribution/src/skills/dough-execute-plan/scripts/execution-increment-publication-support.mjs).
  Reuse the candidate and base already carried by each attempt. The
  [history-preserving publisher](../../../Distribution/src/skills/dough-execute-plan/scripts/history-preserving-publish.mjs)
  combines published histories, so its merge orchestration has a different
  responsibility. Reuse shared Git operations where their contracts fit.
- Keep remote integration with the workflow and acceptance evidence with
  the Dashboard receiver, as set out in [ADR 0008, Project dashboard domain
  and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them).
  [Publish the candidate](../../../Distribution/src/skills/dough-execute-plan/references/publish-the-candidate.md)
  governs fresh initial, rejected-push and post-push observations. Preserve
  the authorized ref, ordinary push, transport bounds and independent
  checkout maintenance. The Dashboard verifies remote containment on record
  even though the publisher also confirms acceptance.
- The receiver's [landing reservation](../../../dashboard/server/launchLandingReservation.ts)
  already binds the delivery to its repository, target and immutable pair.
  Use that binding and the held Git refs to reuse preparation evidence. The
  metadata and refs can lag one another after an interrupted write. Preserve
  recovery when a prepared pin is missing or wrong. No new durable record.
- Keep edits to the Git adapter's existing public surface small. If
  [publication-git.mjs](../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs)
  (279 lines at preparation) needs an edit, slice 2 owns moving subprocess
  and bounded transport mechanics into a cohesive module, keeping Git
  repository operations and existing exports stable for publication, claim,
  refresh, retirement and installed consumers. Prove bounded transport,
  abort and those callers with their existing boundary checks.

## Baseline and decisive premises

| Premise and consuming operation | Observed form and result | Remaining verification |
| --- | --- | --- |
| Installed publisher runs the real candidate and records the comparison through Dashboard admission, pins and store | On `692b57f590ac` in this worktree, Node 24.21.0, Apple Git 2.50.1, AC, `CI=1 GIT_TRACE2_EVENT=<private trace> caffeinate -s -i npm run --silent test:dashboard:backend -- --workers=1 declared-blank-launch-publication.spec.ts`. One case passed in 1,286 ms, initial 1-minute load 12.78. Trace2 counted 61 root Git starts and 89 including nested Git. Before-push preparation, trunk acceptance, exact retry after retirement and pin deletion all passed. | The matching load comparison below is still owed. |
| Candidate checks and ref writes repeat on a real unchanged-base publication | In the same trace, root starts 28–29 run the same candidate tree read. Starts 30–32 and 42–44 recheck the same commit types and ancestry. Starts 35–36 and 47–48 write the same two landing refs. The publisher's post-push fetch, tracking lookup and target query are starts 39–41. The receiver independently fetches the authorized target and checks containment at 45–46. The test's own before/after queries are 37 and 49. | Preserve the observations at changed-state boundaries. Compare commands by role and count after each slice. |
| Rejection, invalid inputs and recovery use retained candidate/base and preserve remote work | At the same revision, `npm test --` with the six focused Distribution files listed below exited 0 on Bash 5 with two job slots. The tests assert a new final pair after replay, bounded contention, refusal of invalid bases and comparisons, and transport timeouts before and after acceptance. | Re-run each reached consumer after changes. |
| Candidate checks protect canonical and custom backlogs | At the same revision, `caffeinate -s -i node --test --test-concurrency=2 Distribution/tests/skills/dough-execute-plan/publication-{completed-identity,misplaced-agent-profile}.test.mjs` passed 16 cases. Fresh, history-preserving and resumed publication held candidates that restored completed work or misplaced an agent profile. Unrelated valid work still published. | Slice 1 repeats the checks after deduplication. |
| The original timeout occurs under contention | The queued seed at `72d22311d` records the installed-publisher case at 5,088 ms in a group run around load 25. The queue and assignment commits leave the observed implementation and spec untouched. The current trace reproduces the redundant work at lower load. | In the first slice, sample the unchanged candidate under comparable load when the host can support the workload. If needed, use a private runner with equivalent Git and worker conditions. Record command, roster, workers, Git/Node versions, one-minute load and case durations. If the load profile cannot be reached or invalidates the timing approach, stop the dependent timing claim and amend the measurement plan before accepting speed proof. |

Compare the same spec and selection on the baseline and final candidate with
the same Trace2 root-start count. Record totals with the same test fixture,
several matched samples under representative load, and their actual durations.
The prior estimate of roughly ten fewer starts is a sizing hypothesis.
Deterministic process savings and passing timings answer different parts
of the example.

### Execution baseline

On the established Take revision `78de2f1d3`, with Node 24.21.0, Apple
Git 2.50.1 and AC power, the same traced single case ran in 1,773 ms with
61 root starts and 89 including nested Git. The two candidate tree reads
were starts 28 and 29.

The grouped run used six requested workers under the AC guard and no
artificial load. The runner selected eight Chromium launch and capture
cases followed by the two installed-publisher Node cases. Three samples
of the blank launch case took 2,378, 3,335 and
3,741 ms. Their one-minute host loads before and after were 13.32–25.47,
25.47–27.88 and 27.88–26.65. Use the last two as the representative
baseline and retain the first sample with its lower starting load.
The literal commands and outputs are in `s1-baseline-single.log.run.json`
and `s1-baseline-group.log.run.json` in the checkout's Git evidence
directory. Repeat that selection and capture the same host readings for
the final comparison.

The publisher spec imports this repository's installed Claude payload.
For after-change measurements, the repository installer copies the
candidate payload into an independent disposable checkout of the baseline
with its own locked dependencies. The payload comparison verifies the
installation before proof. The two observed complete baseline payloads
were byte-equivalent on the relevant scripts. A disposable baseline run at
host load above 35 replayed the 5 s timeout in 5,181 ms during pre-push
preparation. Its partial trace is retained as `s1-installed-baseline.trace`.

## Execution context

- Identity and publisher: SEED-421#stop-repeating-git-work-in-shared-publication,
  `dashboard-territory.local-open-dough`, Yua-chan.
- Story Branch Mode in the Dashboard-established owned worktree
  `stop-repeating-git-work-in-shared-publication`, branch
  `codex/stop-repeating-git-work-in-shared-publication`, with `origin/main`
  as the authorized integration target.
- Starting revision `3105c0727f6a7ba3a080b9300b0faec45dc60e32`.
  Published Take and initial story branch revision
  `78de2f1d3d8085605f07ac8707929562ffb4629c`.

## Ordered slices

### 1. Validate each immutable publication candidate once
Type: Behavior

Status: done

With a validated owned suffix, publish through the shared increment entry
point. The unchanged candidate avoids a repeated done-record check between
initial validation and pre-push. A replayed initial or retry candidate still
gets its own check. Preserve the refusal before reconciliation and the refusal
before any push of a newly invalid candidate. Run the baseline case before and
after and compare the tree reads. Run the Distribution candidate refusal and
racing-suffix cases, including `publication-completed-identity.test.mjs` and
`publication-misplaced-agent-profile.test.mjs`.
If a test misses an invalid rewritten candidate, extend the existing shared
publisher boundary to prove the changed check.

The candidate-installed blank launch passed in 3,526 ms at one-minute
host load 23.17–25.32. Trace2 counted 60 root starts and 88 including
nested Git. The same immutable candidate had one backlog tree read.
The original and rewritten refusal checks observed no publication receipt
and an unchanged authorized remote tip. The two rewrite cases distinguish
trunk advancement before fetch and during the first push attempt.
`s1-return.md` in the checkout's Git evidence directory maps the assertions,
28 passing Distribution jobs and six passing installed Dashboard cases
to the literal commands, run results, and consumer boundaries.
The independent refactor made the two race triggers explicit in the test
cases. Only that test file needed renewed proof and it passed, as recorded
in `s1-refactor-verified.log.run.json`.

### 2. Confirm the target once after each successful push
Type: Behavior

Status: planned

When an ordinary push returns, derive acceptance and its receipt from one
fresh observation of the authorized target. Collapse duplicate reads only
where that observation proves the same fact, including a missing branch and
custom remote/tracking configuration. Keep the initially fetched base,
fresh reads after rejection or ambiguous responses, existing exact-match and
recovery semantics, and separate refresh and retirement safeguards. Test
with real bare remotes through increment publication and interrupted recovery.
Observe remote acceptance without a default checkout change, the rewritten
candidate after a competing push, and bounded timeout and second rejection.
Compare the blank launch trace for one less redundant post-push observation
without removing the receiver's independent confirmation.

### 3. Reuse prepared landing evidence while recording acceptance
Type: Behavior

Status: planned

Given the receiver's matching prepared delivery, record still confirms the
revision on the authorized remote. Reuse validated facts for the same
immutable comparison and avoid rewriting healthy pins. Repair missing or
wrong pins before committing accepted metadata. Preserve a different pair's
refusal, exact retry after retirement and release on deletion. Use the
declared-blank and declared-worktree installed-publisher journeys and the
launch admission, retained and one-shot capture backend cases. If needed,
add one receiver-boundary case that prepares a real pair, removes one held
pin, publishes, then checks the recorded receipt and both repaired refs.
Compare the final root counts and run the matched group timing and full-suite
gates before implementation landing.

## Local gates

- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  for every failure. Run the local gates fully awake on AC under
  `caffeinate -s -i` per [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  On battery, follow that reference's fully awake, lid-open `caffeinate -i`
  procedure and inspect the sleep log. Check host headroom before long runs
  and use the maintained suite admission and worker controls.
- Focused Distribution proof uses Bash 5 and `npm test --` with
  `Distribution/tests/skills/dough-execute-plan/` files
  `execution-increment-publication-base-identity.test.mjs`,
  `execution-increment-publication-unresolvable-base.test.mjs`,
  `publication-racing-suffix.test.mjs`,
  `publication-racing-suffix-replay.test.mjs`,
  `publication-resume-comparison.test.mjs` and
  `publication-transport-bound.test.mjs`. Include reached publication,
  closure and maintenance cases from the actual edits. Dashboard backend
  proof uses `npm run --silent test:dashboard:backend -- --workers=1 <specs>`.
- Trace actual changed surfaces with the installed consumer-trace script
  before accepting each slice. Initial tracing from `publishExecutionIncrement`,
  `resolveLandingComparison`, `pinPair` and `retireAdHocBranch` reaches
  increment delivery, session closing, supplier integration, Dashboard
  attempt and retained landings and the session pin helpers. Run affected
  readers and writing journeys. Historical reports and unchanged retirement
  test helpers are evidence or setup. If a shared pin helper changes, include
  manual landing, branch attribution and session deletion consumers.
- Before landing implementation run the full Distribution, Dashboard Backend,
  Dashboard Frontend and E2E suites using `npm test`,
  `npm run test:dashboard:backend`, `npm run test:dashboard:frontend` and
  `npm run test:e2e`. The story calls for full suites because the installed
  publisher, reporting receiver and retained evidence have consumers across
  workflows. Hold the existing assertions and default timeouts. Run installed
  distribution parity checks for any script changes.

## Plan review

Slice-plan refinement was unnecessary. Each slice removes repeated work at
one coherent proof boundary, with candidate observations scoped by commit
and remote observations scoped by operation. The load-dependent observation
is bounded above. The review identified no other slice-specific concern.
