# Make later-proof Intent comparison checks fast and stable under load

**Identity:** SEED-326#pass-later-proof-comparison-checks-under-load

**Source:** [Story](../../seeds/SEED-326-later-proof-comparison-checks-under-load.md#pass-later-proof-comparison-checks-under-load)

**Source review:** [source review](source-review.md)

## Goal and scope

Maintainers get a fast passing verdict from the "later" pending-proof checks
of the Intent CI comparison under a one-minute load of 30–50, with the
default case timeout and wide margin. Everything past the 30-revision walk is
proven in process with supplied history; no real-server case builds history
past the walk or pays a `gh` process start per walked revision.

Excluded: batching the product's revision lookups in
`dashboard/server/laterTrunkBuild.ts`, a cheaper synthetic `gh` start, the
shared landing fixture's 2.2 s, and the SEED-324 checks. The "equivalent"
cases change only where the shared setup requires it. The walk limit stays a
product constant with no test-only setting.

Under [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
the baseline is the file at `c680e64e0`, and the result worth keeping is the
load-independent call count and ratio in the measure below with every promise
still caught by a named check. The work adds no product structure and follows
the existing in-process comparison harness
(`dashboard/backend-tests/support/storyCiComparisonEvidence.ts`,
`finalityComparisonFacts.ts`, `finalityArtifacts.ts`); no North Star topic
applies.

## Measure

File: `dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts`.
Focused command, from the repository root with Homebrew `bin` first on `PATH`:

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES \
  npx playwright test --config dashboard/playwright.config.ts \
  dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts \
  --workers=1 --reporter=list
```

- Count: no case's recorded `gh` calls include a lookup per walked revision.
  Baseline: the line-31 "later" case made 120 calls, 101 of them
  `actions-runs`; its "equivalent" sibling made 29 and 12.
- Ratio: in one run, each remaining "later" case body takes at most 1.5 times
  its "equivalent" sibling. Baseline at load 4–6: 4.6 s against 3.8–4.5 s for
  line 31 (3.0 s against 1.1 s after server start), 3.0 s against 2.7–2.8 s
  for the provider wait; at load 45 the line-31 "later" body took 15.5 s.
- Load: three consecutive two-worker runs at load 30–50, slowest case body
  under 20 s.

## Promise ownership

| Source promise | Owning slice | Owning check after this plan |
| --- | --- | --- |
| Unanswered proof keeps a later landing pending past the walk limit and after the landing hour | 1 | The six cases of `ci-comparison-finality-unanswered.spec.ts`, unchanged, and slice 1's judgment check |
| The landed history's pending gap waits for proof of the represented run, for later provenance | 1 | Slice 1's judgment check on `landedSlotResolution`; the history projection of a proof gap stays with the "equivalent" real-server case and `landed-ci-history-pending-proof.spec.ts` |
| Real malformed listing bytes reach pending through the default parsers | 2 | The "equivalent" line-31 case, unchanged; the parser does not branch on provenance, which slice 2's fault control confirms |
| The measured point carries `later` provenance once proof answers | 1, 2 | Slice 1's judgment check for the recovered slot; `landed-ci-history-pending-sources.spec.ts` for the real-server later point |
| Final answers reuse proof without another `gh` call | 2 | The "equivalent" line-31 case; later memory in `ci-comparison-finality-unanswered.spec.ts` and `ci-comparison-memory-later.spec.ts` |
| A provider wait holds a later read, repeats ask nothing, and it recovers under the same owner once the owner clock ends the wait | 2 | The "later" provider-wait case, kept, without extra revisions |
| Coverage map and one fault control per promise | 1, 2 | Table in `dashboard/tests/intent-ci-comparison-proof.md`; each scratch fault's failing check recorded in this plan |
| Speed target and no call per walked revision | 2 | The measure above |
| Load profile, three consecutive passes, slowest under 20 s | 3 | Logs and loads recorded in this plan |
| Hosted CI passes with unchanged verdicts and a lower file time | 3 | The CI run on the published revision |
| Candidate `later-comparison-walk-gh-starts` resolved; proof guide aligned | 2 | The two documents' diff |

## Decisive premises

Observed on 12 November 2026 in this workspace at `c680e64e0`, with the
focused command above, one-minute load 4–7. Scratch edits were reverted.

| Premise | Consuming operation | Observation | Result | Remainder |
| --- | --- | --- | --- | --- |
| The walk costs the line-31 "later" case about 90 extra `gh` starts | Slice 2 count | Scratch `console.log` of `github.calls` in the case | "later" 120 calls (101 `actions-runs`), 79 by the first read; "equivalent" 29 (12) | None |
| The provider-wait "later" case needs no history past the walk | Slice 2 | Scratch `29 → 0` in both `pendingLandedComparison` calls | Passed unchanged in 2.8 s, still `unavailable` on the first read | None |
| The line-31 "later" real-server join can be shown at the trunk head | Slice 2 approach | Same scratch run | False: the history gap is `waitsFor: "later-build"` with no run, not `proof` of run 201. First read then makes 23 calls (11 `actions-runs`) | The join moves in process (slice 1) |
| The collection judgment is reachable in process for a later landing past the walk | Slice 1 | Scratch spec: `representedFinalityFacts("later", 30)`, malformed listing through `finalityArtifacts`, `lookupResultBuild` with `storyBranchLandedExactLookup(true, trunkHead)`, then `landedSlotResolution` | `{"kind":"pending","waitsFor":"proof","run":{"runId":201,"runAttempt":1}}` in 3 ms, 32 in-process lookups; with 0 revisions `later-build` | `landingResolution` itself answers `read` here because the supplied history has no `origin/<ref>`; the check calls the two functions it wraps |
| The in-process checks fail without the rule | Slices 1, 2 fault control | Scratch `&& false` on the `proofUnanswered` line of `stillAwaited`, then the scratch spec and `ci-comparison-finality-unanswered.spec.ts` | Scratch check failed (slot final `none`); all six finality cases failed; the 0-revision arrangement stayed green | Remaining faults are slice-owned controls |
| No fault is caught only by a head-ended "later" line-31 real-server case | Slice 2 removal | One fault observed: the head arrangement does not notice ignored unanswered proof | Supports removal | Open for the other faults; slice 2's fault table decides and both branches are bounded there |

## Slices

### 1. Own the later past-the-walk proof wait in process
Type: Behavior
Status: done
Proof: A new case beside `ci-comparison-finality-unanswered.spec.ts`, built
from `representedFinalityFacts("later", 30)` and `finalityArtifacts`, reads
the landed slot through `lookupResultBuild` and judges it with
`landedSlotResolution` on a supplied clock three hours after receipt. Run
that spec file through the focused command form. Fault controls, each a
scratch edit that must fail this case and is then reverted: ignore
`proofUnanswered` in `stillAwaited`; drop the walk's `unavailable` build in
`laterTrunkBuild.ts`; report the walk's end as `head` when the bound was
reached.

Behavior: A later-provenance landing has a completion plus 30 following
revisions and a malformed artifact listing for run 201 → the collection
judgment runs → pending, waiting for proof of run 201 attempt 1; once the
listing answers, the same judgment is the build at the represented revision
with `later` selection. No server, Git repository or process starts.

Accepted proof (12 November 2026): `ci-comparison-finality-later-judgment.spec.ts`
passes in 5 ms beside the six unchanged finality cases; typecheck passes.
Reverted scratch faults, each failing its pending assertion:

| Fault | New case receives | Six finality cases |
| --- | --- | --- |
| `stillAwaited` ignores `proofUnanswered` | final `none` | all fail |
| The walk drops its `unavailable` build | `none`, no later build within 30 revisions | three "later" fail |
| The walk's end reported as `head` at the bound | pending `later-build`, no run | all pass: only the new case catches it |
| `stillAwaited` drops pending after the landing hour | final `none` | all fail |

No fault was run against the recovered `later` build half; slice 2's map
names `landed-ci-history-pending-sources.spec.ts` for the real-server point.

### 2. Retire history past the walk from the real-server cases
Type: Behavior
Status: done
Proof: The focused command; scratch call counts for each remaining case; the
ratio in the measure; `npm run typecheck:dashboard`. Fault table, each fault
a reverted scratch edit with the named failing check: malformed listing
treated as an answered final absence (the "equivalent" line-31 case); a
final read that asks GitHub again (the same case); a repeat read during a
provider wait that asks again, and an owner-clock end that does not release
the read (the "later" provider-wait case); plus slice 1's three. Run
`landed-ci-history-pending-sources.spec.ts` and
`landed-ci-history-pending-proof.spec.ts` as the neighbours the map names.

Behavior: The pending-proof file runs → no case builds later revisions or
makes a `gh` call per walked revision, each remaining "later" case is within
1.5 times its "equivalent" sibling, and every promise in the ownership table
fails its named check under its fault.

- Drop the extra revisions from both `pendingLandedComparison` calls and the
  `laterRevisionsAfterCompletion` parameter with its import of
  `commitTrunkChanges`; `trunkCommitBatch.ts` keeps its other caller,
  `landedCiTrunk.ts`.
- The line-31 "later" case: remove it when the fault table shows no fault
  that only a head-ended version catches. If one does, keep the case at the
  head with the `later-build` gap it then shows, and record that fault in
  the coverage map.
- Rewrite the pending-proof rows and the "malformed-provider connection"
  paragraph of `dashboard/tests/intent-ci-comparison-proof.md` as the
  coverage map; resolve `later-comparison-walk-gh-starts` in
  `.planning/TEST-OPTIMIZATION-CANDIDATES.md`; leave
  `dashboard/longest-first-additions` to its recorded-run source.

Accepted proof (12 November 2026): the "later" line-31 case is removed. A
scratch head-ended variant passed with a malformed listing treated as
answered, and every fault it failed under is caught by the "equivalent" case
or the in-process later checks; the parser and the comparison reader take no
provenance. The file has three cases. One run, one worker, load 4.9–5.0:

| Case | Body | `gh` calls | `actions-runs` |
| --- | --- | --- | --- |
| equivalent recovers | 3.9 s | 33 | 14 |
| equivalent provider wait | 2.9 s | 20 | 8 |
| later provider wait | 3.2 s (ratio 1.10) | 20 | 8 |

Reverted scratch faults and the failing check:

| Fault | Failing check and assertion |
| --- | --- |
| Unreadable listing answered without its unanswered mark (`ciProofArtifact.ts`) | "equivalent" malformed case, pending-gap poll |
| The comparison reader ignores its kept answer (`intentCiComparisonRead.ts`) | The same case, final `toEqual(recovered)` |
| The request owner asks during a standing wait | "later" provider-wait case, first read no longer `unavailable`; its repeat-count assertion is not reached |
| The wait outlasts the owner clock | "later" provider-wait case, recovered build |
| The later walk selects its build as `equivalent` | Judgment check, "later" provider-wait case, `landed-ci-history-pending-sources.spec.ts` |
| The history maps a `later` selection to `equivalent` | `landed-ci-history-pending-sources.spec.ts` only |

No fault was run against the same-owner-process assertion. Neighbours (16
cases), typecheck and the candidate-record tests pass.

### 3. Pass at the promised load and in hosted CI
Type: Behavior
Status: done
Proof: Recorded loads, logs and case times for three consecutive runs, then
the hosted CI verdict and file time on the published revision.

Behavior: The one-minute load is 30–50 → the file runs three times in a row
on two workers → every case passes each time and the slowest case body is
under 20 s; the published revision passes hosted CI with the remaining
cases' verdicts unchanged and the file's recorded time below 38 s.

- Raise load only with CPU-bound processes started from the job's temporary
  directory and stopped afterwards; record `uptime` before and after each
  run. External load already inside the range needs no added load.
- A run that starts or ends below 30 is not counted. A pass above 50 counts.
  A failure above 50 is recorded with its loads and repeated inside the
  range once, as a test of the stated load explanation; a failure inside the
  range is a defect under the failure policy.
- The earlier slices' fault controls are not repeated here.

Load observation (12 November 2026, `3befd9f85`, AC power under
`caffeinate -s -i`, 30 CPU-bound helpers over external load, all stopped by
recorded PID), before Terry restated the example:

| Run | Load before → after | Result | equivalent recovers | equivalent provider wait | later provider wait |
| --- | --- | --- | --- | --- | --- |
| 1, counted | 36.75 → 38.30 | 3 passed | 14.5 s | 14.0 s | 8.1 s |
| Diagnostic with a step reporter, not counted | 39.39 → 39.39 | 3 passed | 16.5 s | 17.1 s | 10.1 s |

The verdicts are stable and inside the default timeout, but the slowest case
body is not under 10 s, so the three-run count stopped at one (obligation
OB2). In the diagnostic run the first case on each worker spent 5.8–6.0 s in
the `origin` fixture, and each test function took 9–11 s between its expect
steps: the real-server requests and 20–33 `gh` process starts. Both
"equivalent" cases are slower than the remaining "later" case. The remaining
cost is the shared landing fixture and the synthetic `gh` start, which the
story's scope limits exclude, so the story's key example "the slowest case
body stays under 10 s" and those limits cannot both hold. Affected source:
the story's Key examples (load example) and Scope limits; the decision is
Terry's. Logs: the job's temporary `slice3` directory (`run-1.log`,
`run-diagnostic.log`).

Hosted CI (12 November 2026): run 43166540689 attempt 1 at `3befd9f85`
succeeded on the story branch. Its `dashboard-times` record the pending-proof
file at 12.9 s (38.4 s in `dashboard/longest-first-additions`), the judgment
check at 0.0 s and the six finality cases at 0.1 s.

Counted runs (12 November 2026, after the restatement to 20 s; 30 helpers
over external load of about 18, stopped by recorded PID; plain list
reporter; on battery under `caffeinate -s -i`, no sleep or wake in the
window):

| Run | Load before → after | Result | equivalent recovers | equivalent provider wait | later provider wait |
| --- | --- | --- | --- | --- | --- |
| 1 | 37.14 → 38.36 | 3 passed | 13.9 s | 14.3 s | 9.3 s |
| 2 | 38.33 → 40.49 | 3 passed | 16.2 s | 16.2 s | 8.5 s |
| 3 | 40.49 → 40.28 | 3 passed | 14.2 s | 14.5 s | 7.6 s |

The three runs are consecutive. The slowest body, 16.2 s, is 3.8 s inside
the restated limit; loads above about 41 were not observed.

## Execution complete

Product advice: no backlog change. The product review found no correction:
the removed case's faults stay caught by the in-process judgment check, the
"equivalent" case and `landed-ci-history-pending-sources.spec.ts`. Under
load 37–40 every remaining real-server case still takes 8–16 s, spent in the
shared landing fixture and 20–33 `gh` process starts; that is evidence for
SEED-287 and SEED-324, which own load-sensitive dashboard checks, should
either take a cheaper synthetic `gh` start in scope. Batching the product's
revision lookups in `laterTrunkBuild.ts` remains unowned. The process review
is deferred into wrap-up with the Intent Coverage check.

## Current decisions

- On 12 November 2026 Terry accepted restating the load example from a
  slowest case body under 10 s to under 20 s, after the observation recorded
  under slice 3. The counted run and the diagnostic run above predate the
  restatement; three new consecutive runs are owed.
- Terry asked on 12 November 2026 for a different testing approach that is
  fast and stable under moderately high CPU load. The load range, the 10 s
  margin and the 1.5 ratio are refinement's figures; Terry gave none.
- The product's sequential lookups are unchanged; batching them is a product
  change no story owns.
- Under external load, speed is judged by the call count and the same-run
  ratio, not by waiting for a quiet host.

## Concern evidence

Slice-plan refinement was not needed: each slice holds one outcome and one
proof loop, and slice 2's removal decision is bounded by its fault table
with both branches written. No remaining slice-specific concern was
identified in this review.

## Local gates

Run the focused selections above and the named neighbours, with
`npm run typecheck:dashboard` and `npm run lint` for the changed TypeScript.
No full local suite is required: the changed support function has only this
file as its caller. Follow the
[failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
verbatim in every delegation or repair handoff. Keep default test timeouts
and shared MakeMe data. Start long macOS runs awake: on AC use
`caffeinate -s -i`; on battery plug in or keep the lid open under
`caffeinate -i` and inspect sleep logs, following
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).


## Story obligations

### OB1. No real-server check shows a later point after a proof wait
Reported: slice 2 — "No maintained check shows a later-provenance point in the public history after a proof wait in a real server."
Story clause: "the public landed history shows the pending gap waiting for proof, then the measured point with `later` provenance once proof answers"
Disposition: proved by slice 2: ci-comparison-finality-later-judgment.spec.ts asserts the recovered slot's later selection after the proof wait, and landed-ci-history-pending-sources.spec.ts asserts the public later point; the path between them, provenanceOf in landedCiMeasuredBuilds.ts, reads only the slot's selection, and scratch faults on the walk's selection and on that projection each fail one of the two. The story keeps real-server history inside the walk, where this gap waits for a later build
Commitment: S2.5


### OB2. Slowest case body exceeds 10 s at the promised load
Reported: slice 3 — "Every case passed, but the slowest case took 14.5 s at one-minute load 36.8–38.3, against the promised under 10 s."
Story clause: "the slowest case body stays under 20 s"
Disposition: owner changed "the slowest case body stays under 20 s"
Commitment: E4.2