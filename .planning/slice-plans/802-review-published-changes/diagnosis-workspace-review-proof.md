# Workspace review proof diagnosis

The slice-4 removal is parked in the owned checkout at the 49e2b24f published
base. Its 126-path return and focused results are in the checkout evidence
`slice-4-report.md` and `slice-4-return-paths.txt`.

The local AC macOS consumer proofs used three workers on a 16-core, 48-GiB
machine with load about six and no other owned verification. The mounted
gate passed all 468 cases. The backend gate passed 89 browser cases and 231
Vitest cases. It found two completed-gap tests that still expect workspace
operation (ambiguity and no-launch 404) and one 5-second timeout in the
published literal-pair case. That exact typed case earlier passed at 1.9
seconds with one worker. The E2E gate passed 88 cases and timed out in the
retained-choice race. The browser trace shows Landed runs was already chosen.

Hypotheses for round 1: the race waits for a request that a click on the
already chosen radio no longer starts, and the typed timeout is the aggregate
cost of repeating the same real Git admission under concurrent backend load.
Use one reproduction or discriminating instrumentation for each. Preserve
the assertion-specific regression and use the default test timeouts. The
retired-route probe initially reached Node's strip-only parser rather than
the registration boundary. Retry it once with TypeScript transformation.

## Round 1 discriminating commands

The route registration recheck was limited to one direct import with Node
TypeScript transformation. Browser diagnosis used the failing trace's actual
test actions and network timeline, so a second unchanged browser attempt adds
no necessary evidence.

For the backend timeout, run the same Vitest file selection once at three
workers with Git Trace2 enabled. The extra diagnostic emits timings without
changing test code or timeouts. Record actual emitted commands and their
attribution to the named literal-pair case, even if the deadline does not
reproduce. The workload gate is roughly 16 cores and 48 GiB, AC, one owned
three-worker backend run and no competing owned test gate. The earlier both-
engine backend run's Vitest phase used the same file selection and 3 workers.

### Findings

- Route registration passed. Node with `--experimental-transform-types`
  imported `launchBoundaryPaths` directly. The retired
  `/__agent-launch/review/range` is absent. The review, file diff and file text
  routes remain registered. The exact invocation and zero exit are in
  `slice-4-diagnosis-route.log.run.json`.
- The captured race trace (`slice-4-diagnosis-choice-race.trace.zip`) confirms
  the new default loaded the second run and its `second.txt` diff before
  checking the already selected Landed runs radio. The radio check completed
  at trace time 128248 ms. No review request followed it. The test awaited
  `heldRun.ready` until the 30-second test deadline. The proposed repair starts
  on the first explicit run, holds the next review request as the user
  chooses the second, and confirms the first stays selected after release.
  Keep the separate held-file request and narrow layout assertions. This is
  a stale workspace-era trigger in the candidate journey, with no evidence
  of stale-response handling failing.
- The instrumented Vitest command passed 232 cases in 51 files with three
  workers. The literal-pair case took 3028 ms. It timed out at 5142 ms in the
  earlier three-worker run, and passed at about 1902 ms with one worker. Among
  112 matched cases taking more than 100 ms in the diagnostic run, the median
  original duration was 2.10 times the diagnostic duration. The earlier
  Vitest phase overall took 41.95 seconds and the diagnostic 21.62 seconds.
  This evidence does not isolate a particular competing process.
- The Git Trace2 instrument isolates the timed test's exact literal-path
  reader and observes 281 Git command starts across five comparison walks.
  Each walk starts 55 to 58 commands, including four merge-tree commands
  and two fetches, and took 395 to 603 ms in the diagnostic run. The published
  reader and this test are identical on the published base and candidate.
  The candidate's file admission edits remove only the unnamed-workspace
  fallback, after the published-head branch. A loaded environment exposed
  the existing test's repeated work over an unnecessarily rich merge
  fixture. This attribution does not waive the repair.
- Use a straight real published branch for the literal-pair test. Keep its
  four literal diff, exact prior text, wrong path and wrong baseline
  assertions. The separate merge case continues to prove authored merge
  differences. Keep original default timeouts. Run the repaired case with
  its original three-worker selection once and compare traced walks and
  timings. The diagnostic command, one terminal run, original and diagnostic
  JSON results and Trace2 output are retained in the checkout evidence.
- The two backend completed-gap failures are deterministic stale
  expectations. Keep the completed published pair and literal file
  assertions around local workspace ambiguity. The active request now
  answers an explicit unavailable published comparison, including when
  another story has no published record or retained launch.

No product or test code changed during round 1. There were no temporary
checkout edits to revert. The previous stopped implementation files and
focused proofs remain parked. The diagnosis outputs are in checkout evidence.

### Refactor candidates after renewed proof

The following symbols have no surviving callers. Remove the orphaned
`support/storyReviewCommitChoice.ts`, the mounted details range-heading
and uncommitted file controls, and their dead CSS selectors. In
`reviewChangesContext.ts`, retain `expectSharedCheckoutWarning`, called by
the published session journey. Drop only unused workspace context operations.
The legacy browser scenario fixtures intentionally keep workspace changes
when proving published review excludes them.
