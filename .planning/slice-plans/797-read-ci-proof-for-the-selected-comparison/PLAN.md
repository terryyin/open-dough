# Read CI proof for the selected comparison

**Identity:** SEED-420#read-proof-for-the-comparison
**Source:** [Read CI proof for the selected comparison](../../seeds/SEED-420-unified-intent-review.md#read-proof-for-the-comparison)

## Goal and scope

A reviewer can choose a captured landed run or a Taken commit range in
Intent and see which existing CI runs measured it. The endpoint table,
Changes counts, Summary and file Proof use the same two endpoints and
explain what can be compared. Preserve default Baseline, Branch and Landed
behavior, Home CI status and overview, and whole-story Intent coverage.
A captured run with no revision pair retains the whole-story proof and
scope note. Keep disjoint session ranges, the story-only branch view and
running new CI outside this delivery.

## Decisions and existing owners

- [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  keeps the measured build and a missing matching baseline visible, and
  preserves the path and comparison through proof navigation. [ADR 0008,
  Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
  ties proof to measured revisions and distinguishes observed differences
  from attribution. Keep the existing observed-build framing, scope and
  declared-unit rules. Home keeps showing failures in untouched tests.
- Extend the existing authenticated comparison reader, its source acquisition
  and its timing/slot conversion. Put selected endpoint resolution in a
  separate cohesive module. Reuse the revision walk, attempt selection and
  build cues. Whole-story lookup can prefer older usable artifacts or use a
  later trunk result under its established rules. For a selected range,
  choose the measured build by revision first and report missing proof as a
  gap. Bound the end walk to the comparison so it cannot use the start or
  work outside the selection. Reuse complete first-parent ancestry where
  available and report unreadable revisions as unavailable. Keep requested
  revision status distinct from the measured revision/run.
- Carry one typed revision pair through the existing read and answer and
  key it by source, story and pair. Require two full commit IDs together
  to keep ambiguous input and revision expressions away from Git and the
  CI provider. Associate each measured artifact with its run, attempt and
  revision. Keep the default request and its cache path; selected gaps and
  pending results remain refreshable.
- Derive the range from the admitted Review selection. A captured run's
  recorded pair supplies commits. A Taken range uses the boundary commits
  of the contiguous selection, including the first selected commit's
  first parent. Git trees and a merge base describe the diff and can
  differ from those commit IDs. The workspace's last committed head and
  the default comparison provide the context for the unmeasured-changes
  notice. A synthetic tree supplies no CI endpoint.
- Reuse `IntentCiEvidence`, `ciComparisonReading`, and `ciComparisonProofs`
  for the selection, its read lifetime and its endpoint proof. Project
  Judgment and whole-story CI retain their current source, including the
  measured build named by Intent coverage. Compare controls and file
  navigation stay in their existing owners. Teach the shared comparison
  presentation about the selection's end, so the UI and Counts rules
  share the same Baseline and Selection meanings without manufacturing a
  Branch or Landed result for a chosen range.
- Follow [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  and [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use typed history, run and proof inputs at the real read, and mount the
  Intent owner with typed external reads. New checks use Vitest. Reuse
  the existing Playwright end-to-end default comparison journey.
- [The abandoned attempt](../../seeds/SEED-420-unified-intent-review.md#read-proof-for-the-comparison)
  overran at the frontend cutover. Keep transport, evidence lifetime and
  rendering in independently verifiable increments. Keep `IntentPerspective`
  (249 lines), `IntentPage` (247) and `IntentFileReading` (242) as composition
  sites by passing a narrow value or replacing an existing note. Put any
  needed movement at the evidence or presentation seam in the slice that
  uses it. Omit absent optional properties under exact optional types.

## Premises observed during preparation

Observations ran in the owned checkout at `82383b4a4` on 2026-11-23 with
Node 24.21.0 on macOS AC power.

| Consuming operation | Observation and consequence |
| --- | --- |
| Endpoint lookup with a measured start and an unbuilt result | `caffeinate -s -i npm run test:dashboard:backend -- dashboard/backend-tests/intent/ci-comparison-selection.spec.ts` selected five cases and passed strictly. The real read with only a start build showed that build as Baseline and no Landed build. A default Baseline also passed a nearer proofless build in favor of an older usable ancestor. Slice 1 retains both default behaviors and proves the selected-range walk and selection policy separately. |
| Switching a mounted Intent to a captured run or commit range | `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-story-compare-evidence.spec.ts dashboard/frontend-tests/intent/intent-story-compare-gaps.spec.ts` passed seven Chromium cases. A captured run with its own pair showed the same measured default build and proof labels after switching. A commit range kept the default evidence. Unreadable ranges/runs kept the overview and their retry/return controls. Slices 3 and 5 change the selected view expectations while retaining the whole-story coverage and review gaps. |
| A first-parent range at the actual Git boundary | `caffeinate -s -i node_modules/.bin/vitest run --config dashboard/backend.vitest.config.mts dashboard/backend-tests/review/story-review-range-contribution.spec.ts` passed all three selected cases. Real Git produced the chosen merge's first-parent and end trees and the read preserved the end and widened the expected files. This verifies range reading against a real merge. Slice 6 adds and proves the first-parent commit ID on the snapshot wire. Slice 7 proves the CI reader consumes commit IDs rather than the tree pair. |

## Proof and local gates

Use the focused backend and frontend group commands above with the specs
named for each slice, plus `npm run typecheck:dashboard` after contract or
view wiring changes. Keep `npm run test:e2e -- e2e/intent/intent-ci-comparison.spec.ts`
as the integrated default-route control. Run longer checks on awake macOS
with AC power under `caffeinate -s -i`. On battery, use `caffeinate -i` with
the lid open and inspect the sleep log. Follow
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos),
the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and the MakeMe and page-object selection in [AGENTS.md](../../../AGENTS.md).

The preparation [consumer trace](../../../Distribution/src/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
searched `readComparison`, `WholeStoryNote`, `Describes the whole story`,
`ComparisonEndpointsTable`, `scopeComparisonRowsOf` and
`intent=ci-comparison`. The authenticated client and parser cases own
wire compatibility. The mounted evidence, fixed comparison, gaps and
Done reference lifecycle cases reach the selection and note. The Changes
tree, Summary, file Proof and table entry readers reach shared row
projection. Run the reached count, unit, timing and sort tests under their
current runners where a changed projection feeds them. Historical records
are context for earlier versions. Trace each actual diff, including the
Review snapshot stand-ins for slices 6 and 7, and record each reached consumer's
disposition under the linked procedure.

| Final promise | Owner and observing boundary |
| --- | --- |
| Default endpoints, counts, live judgment, overview, and failed untouched tests retain their current evidence | Slices 1–3 and 5, default authenticated read, mounted default and adjacent CI status, and integrated default journey |
| A supported choice names measured revisions and runs, with exact/ancestor cues; default restores and stale responses stay off screen | Slice 1 at the authenticated reader, 2 at the disposable reading owner, 3 for a captured run and 7 for a Taken range in mounted Intent |
| Both sides use the same measured pair across the selected surfaces, e.g. 1 → 9 comparable cases | Slice 3 at the endpoint table, 4 at Changes counts, 5 at Summary and file Proof, with setup that distinguishes the whole-story and two selected builds |
| Missing baseline and absence of any build covering selected work have distinct reasons, with one-sided readings and no delta | Slice 1 at lookup, 3 at the table, 4 and 5 at their count and proof displays |
| Scope stays accurate for a run without revisions and for Intent coverage | Slices 3 and 5 in mounted Intent, including the whole-story build named by coverage |
| Including uncommitted changes names the committed build and explains the unmeasured portion | Slice 8 in mounted Intent, with a dirty workspace and inclusion toggled |

## Slices

### 1. Resolve the CI endpoints for a requested revision range

Type: Behavior
Status: done
Estimated active work: 12–15 minutes.

Given a story and a pair of commit IDs, the authenticated read returns the
pair and the measured start/end slots. Select a completed baseline at or
before the start and the result at the end or its nearest measured
first-parent ancestor inside the range. Preserve ordinary no-pair answers.
Report a missing baseline, an unbuilt range or unreadable evidence at the
affected slot. Reuse the repository's existing Git and CI inputs. Keep the
selected resolver out of `intentCiComparisonResolve.ts`. The UI still sends
the default request at this boundary.

Proof. Extend the real comparison reader and parser checks with typed
revision history, run listings and artifacts. Observe an ancestor baseline,
a measured end, a start-only run that cannot supply the result, and a
completion-only run. Exercise empty/reversed or unrelated bounds without
reporting an older end, malformed or half pairs without Git/provider calls,
and a default answer using its established slots. Use the same isolated
reader to show that a response for one pair cannot satisfy another request.

Accepted proof uses the authenticated parser and real comparison reader
with typed history, run and artifact inputs. The 130-case backend run
covers measured and missing endpoints, pending attempts, invalid bounds,
selected cache isolation and existing comparison behavior.
The six neighboring landed-history cases, shared lookup and parser
checks, dashboard typecheck, and integrated default Intent journey also
passed. The run records and consumer trace are in this checkout's Git
evidence directory with `slice-a-return.md`.

### 2. Bind a CI reading to its comparison

Type: Structure
Status: done
Estimated active work: 8–12 minutes.

Extend the typed client and reading owner for slice 3. Identify and validate
selected answers against source, identity and pair. Invalidate or abort
the previous selected read on change, and read endpoint proof for the
current answer through the same run/attempt owner. Keep the default reading
independent for whole-story coverage and overview. The mounted page still
requests the default through its existing entry points.

The authenticated request carries `start` and `end` together.
`SelectedCiComparisonAnswer` echoes the source ID, story, and range
and carries Baseline and Selection slots on success. Validation must
retain the distinction between this reply and default comparison answers.

Proof. Use the client wire-validation spec and a typed delayed-read case at
`ciComparisonReading`. Change the selection before a response arrives and
observe that the old result cannot populate the new selection. Exercise
Check again and returning to default. Keep the current mounted default
lifecycle and strict-mode checks green.

Accepted proof covers authenticated source, story and range validation, a
held answer released after changing ranges, Check again, restoration of the
default answer, and the actual measured numeric and adapter attempts.
The 42 backend and 153 mounted Chromium cases, the default and Taken
adapter E2E journeys, and dashboard typecheck passed. See
`slice-b-return.md` and its run records in this checkout's Git evidence
directory. The provider takes an optional `selectedRange` and exposes
`selectedComparison` alongside its whole-story reading.

### 3. Name the measured builds for a captured landed run

Type: Behavior
Status: done
Estimated active work: 10–14 minutes.

In a Done story, choosing a readable captured run with recorded revisions
shows Baseline and Selection in the endpoint table, each with the measured
revision and run and its build-source cue. Present a missing side in place
and keep the side that ran visible. Restore Published completion's default
words and endpoints when the reviewer returns to it. A run without revisions follows
the whole-story fallback, and Intent coverage still names its whole-story
build. Supply the selected range from the Review selection to the reading owner.
An earlier completed attempt at the same revision keeps the exact-revision
cue while its rerun is pending.
Until slices 4 and 5, suppress whole-story Counts in selected Changes and scope
views where they could be mistaken for selected proof, using an explicit
whole-story scope marker where the whole-story proof itself is shown.

Proof. Extend `intent-story-compare-evidence.spec.ts` using a default,
a landed run whose measured releases differ, and a legacy run with no pair.
Assert the requested pair and the rendered row labels and run identities
in the page. Use a separate mounted gap case to name the absent side and
keep the reviewer on the selected run. Preserve the unreadable review
controls and the coverage note in `intent-story-compare-gaps.spec.ts`.

Accepted proof observed distinct measured revisions and attempts, exact and
ancestor cues, a missing selected build with the Baseline still visible,
Check again, restoration of Published completion, and the whole-story
marks for coverage and legacy runs. The 144 mounted cases, seven E2E cases,
19-case focused rerun and typecheck passed. See `slice-c-return.md` and its
run records in this checkout's Git evidence directory.

### 4. Show selected build counts in Changes

Type: Behavior
Status: done
Estimated active work: 8–12 minutes.

In a selected captured run, the Changes counts read the same Baseline
and Selection proof chosen in slice 3. Compare existing declared units, preserve
an observed count with its evidence gap, and explain a missing side where
a delta would be displayed. Restore selected Changes counts in place of
the interim behavior. Share count interpretation with slice 5 through the
existing comparison row model.

Proof. Mount Intent with a captured-run file that has one baseline case
and nine selection cases, and different counts in the default builds.
Choose the run, observe 1 → 9 in Changes, and return to the default. Feed
the same entry point a one-sided build and check the observed count and
reason. Keep the unrelated overview and count-unit cases unchanged.

Accepted proof shows the captured builds' 1 → 9 in the file and location
controls and restores the default count of 4. Separate mounted cases
keep the measured side visible with the missing baseline or end reason,
and retain partial counts and different declared units without a delta.
The 151 frontend cases, nine E2E cases, 13 Distribution specs and
typecheck passed. See `slice-d-return.md` in the checkout's Git evidence
directory. Summary and file Proof can share `selectionScopeComparisonRowsOf`.

### 5. Read the same proof in Summary and file Proof

Type: Behavior
Status: planned
Estimated active work: 10–14 minutes.

Open a scope Summary or file Proof from the selected Changes. Show the
same pair and row interpretation, including gaps and the one-sided count.
Replace the remaining interim scope marker with selected proof. Retain the
whole-story note for the legacy fallback and keep Intent coverage on its
own whole-story reading. Home keeps the existing status and overview
proof. Returning to the diff preserves path and comparison.

Proof. Extend the mounted selected-run journey to open the scope and
file, trace their proof subjects to the same two attempts, and compare
their counts with Changes. Give missing baseline and unbuilt range cases
their one-sided observations. Keep the established Summary/file rename,
proof-unit and proof-gap checks for shared projection, and the existing
Home/default CI proof checks for the unaffected route.

### 6. Carry the first-parent commit through Review

Type: Structure
Status: planned
Estimated active work: 7–11 minutes.

Expose the first-parent commit ID from the `%P` field already read by
`storyReviewCommits` on the typed Review commit item. Retain the tree
and merge-base fields and the behavior of Changes and Review changes.
Support older inputs through the existing optional/absence path. This
gives slice 7 a commit boundary without guessing from trees.

Proof. Read the real snapshot with the existing temporary Git repository
fixtures. Check that a selected merge's serialized parent is its first
parent commit and differs from the other parent and from its tree.
Retain the existing first-parent range diff and mounted commit chooser
proof.

### 7. Follow a Taken story’s commit range

Type: Behavior
Status: planned
Estimated active work: 8–12 minutes.

Choose a contiguous range of commits in a Taken story. Feed its first
selected commit's first parent and last selected commit through the
shared range resolver and evidence views. Returning to All changes
restores default evidence. Preserve the existing branch status and
compare reading. Unreadable selection and older Review data without
endpoints cannot present a fabricated selection delta.

Proof. Mount Intent with several available commits, choose a later
range, and distinguish its parent from the story start and from the
selected commit's tree. Observe the ancestor baseline and exact or
in-range end and the same selected proof in Changes and file Proof.
Keep the Taken mode and unreadable-range controls in their existing
journeys. At the backend read, verify the Taken profile still uses its
own CI source.

### 8. Explain which workspace changes CI did not measure

Type: Behavior
Status: planned
Estimated active work: 7–10 minutes.

In a Taken workspace showing All changes with uncommitted edits, say
that those edits were unmeasured and name the last committed build.
Reuse the current reading when it measured that head. If its measured
revision differs, use the existing revision lookup to read the head's
build identity or explain its absence. Default status and endpoints keep
their current rules.
Turning off inclusion removes the notice. Do not treat a snapshot tree
or an unrelated default build as proof for those edits.

Proof. Use the dirty workspace setup from
`intent-story-compare-uncommitted.spec.ts` with distinct head and tree
IDs and a named head build. Toggle inclusion, then check the visible
notice and its build in the affected CI proof. Exercise a head without a
matching build so prior proof is never described as a build of that head.

## Preparation assessment

A separate slice-plan refinement pass was unnecessary once the read,
selection lifetime, display and Review commit boundary had independent
proof loops. Slices 4 and 5 replace the interim scope behavior from slice 3. The
retained preparation observations supported the chosen read and mount
routes. The review identified no remaining slice-specific concern.

## Execution context

- Nao-chan, Story Branch Mode, publisher `dashboard-territory.local-open-dough`.
  The owned checkout is `.worktrees/read-ci-proof-for-the-selected-comparison`
  on `codex/read-ci-proof-for-the-selected-comparison`. The default checkout
  is `/Users/terryyin/git/open-dough` on `main`.
- Starting revision `577b4f02741b4c39a5e7bc6a15a119cfaa0e240d`. Take
  `4402f50fd76ef8394a948605a293fa05961cf1c2` was accepted on `origin/main`
  and published to the execution branch. The authorized trunk is
  `origin/main`. Use the existing authority for in-plan refinement.
- Slice 1 was accepted on the execution branch at
  `29cd3167dc1e598ad77c8669a2f1673dd73c8320`.
- Slice 2 was accepted on the execution branch at
  `c215a5a99ab7d4129a70c26c91ecf3bf368d842a`.
- Slice 3 was accepted on the execution branch at
  `8eb04d479e69be3e9be23971fce64483cb3af401`.
- Codex observer of `ci.yml` on the execution branch, coordinator
  `nao-9b9c27ea`, directory `/tmp/dough-ci-501/watch-dv7wpQ`, process
  `33667`, cell `g458:11`, session `61453`. The claim preceded this observer.

## Story obligations

### G1. Selected Changes counts

Reported: slice 3 — "Changes tree counts are suppressed while the selected comparison is attached."
Story clause: "For a Taken story's commit range or a Done story's captured landed run with revisions, the endpoint table, Changes counts, the selected scope's Summary and file Proof share one pair of build readings."
Disposition: proved by slice 4: Mounted captured-run file and location controls in dashboard/frontend-tests/intent/intent-story-compare-selected-counts.spec.ts, including default restoration, one-sided readings, partial proof and distinct units.

### G2. Selected Summary and file Proof

Reported: slice 3 — "Summary and file Proof direct the reviewer to CI comparison while the selected comparison is attached."
Story clause: "For a Taken story's commit range or a Done story's captured landed run with revisions, the endpoint table, Changes counts, the selected scope's Summary and file Proof share one pair of build readings."
Disposition: interim until slices 5

### G3. Revision formats admitted by Intent

Reported: slice 3 — "Landing capture independently allows 64-hex IDs."
Story clause: "A reviewer reading a story in Intent can tell what CI measured for the comparison they chose, not only for the whole story."
Disposition: no user cost "A reviewer reading a story in Intent can tell what CI measured for the comparison they chose, not only for the whole story.": The dashboard's project-addition flow verifies the configured GitHub repository and matching origin. Intent's existing historical location, candidate and attempt-proof entry points require full 40-hex pins for both default and adapter evidence. The selected read uses those same supported pins. A retained record outside that contract keeps the established whole-story scope marker.
