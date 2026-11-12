# Make later-proof Intent comparison checks fast and stable under load

**Identity:** SEED-326#pass-later-proof-comparison-checks-under-load

**Source:** [Story](../../seeds/SEED-326-later-proof-comparison-checks-under-load.md#pass-later-proof-comparison-checks-under-load)

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
  under 10 s.

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
| Load profile, three consecutive passes, slowest under 10 s | 3 | Logs and loads recorded in this plan |
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
Status: planned
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

### 2. Retire history past the walk from the real-server cases
Type: Behavior
Status: planned
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

### 3. Pass at the promised load and in hosted CI
Type: Behavior
Status: planned
Proof: Recorded loads, logs and case times for three consecutive runs, then
the hosted CI verdict and file time on the published revision.

Behavior: The one-minute load is 30–50 → the file runs three times in a row
on two workers → every case passes each time and the slowest case body is
under 10 s; the published revision passes hosted CI with the remaining
cases' verdicts unchanged and the file's recorded time below 38 s.

- Raise load only with CPU-bound processes started from the job's temporary
  directory and stopped afterwards; record `uptime` before and after each
  run. External load already inside the range needs no added load.
- A run that starts or ends below 30 is not counted. A pass above 50 counts.
  A failure above 50 is recorded with its loads and repeated inside the
  range once, as a test of the stated load explanation; a failure inside the
  range is a defect under the failure policy.
- The earlier slices' fault controls are not repeated here.

## Current decisions

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
