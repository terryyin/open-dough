# Read CI proof for the selected comparison

**Identity:** SEED-420#read-proof-for-the-comparison
**Source:** [Read CI proof for the selected comparison](../../seeds/SEED-420-unified-intent-review.md#read-proof-for-the-comparison)

## Goal and scope

A reviewer in Intent can tell what CI measured for the chosen **Compare**
selection, and whether the runs support a delta for that work. The CI
comparison, the Changes counts and a scope's Summary and file Proof follow a
Done story's captured landed run and a Taken story's commit range. Today they
stay on the whole story and say so. The default comparison and Home's CI
overview are unchanged. Intent coverage keeps its whole-story note.

Excluded: several sessions selected together
([SEED-418](../../seeds/SEED-418-review-published-session-changes.md#review-selected-sessions-together)),
the story-only view of
[compare-story-contributions](../../seeds/SEED-420-unified-intent-review.md#compare-story-contributions),
and running new CI builds.

## Decisions and existing owners

- [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent):
  name the measured build and explain a missing matching baseline. A failing
  unchanged test stays in Home's overview proof.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
  keeps the comparison a read of existing CI evidence.
- [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Drive the real comparison read with typed external facts
  (`backend-tests/support/storyCiComparisonEvidence.ts`). Drive the mounted
  Intent with typed CI reads
  (`frontend-tests/intent/intent-story-compare-page.ts`).
- **One rule for both sides.** A selection's start and end use the story's
  existing lookups. `lookupBaselineBuild(start)` gives the newest completed
  build at or before the start. `lookupResultBuild(end, start)` gives the
  end's build or the nearest measured ancestor after the start, with the
  start excluded (`server/baseCiRevisionLookup.ts`,
  `server/baseCiRevisionNearest.ts`). Exact, ancestor, equivalent and later
  keep their selection words (`src/storyCiComparisonWording.ts`). Do not add
  a second walk or wording for selections.
- **The read carries the selection.** The `intent=ci-comparison` read
  (`server/intentCiComparisonParse.ts`,
  `src/authenticatedIntentCiComparisonRead.ts`) accepts an optional pair of
  full 40-hex `from` and `to` revisions and refuses anything else before any
  Git or `gh` call. Without the pair, the answer is today's Baseline, Branch
  and Landed comparison. Answers are remembered per story and selection
  (`server/intentCiComparisonAnswers.ts`).
- **Wording.** A selection shows two endpoints, **Baseline** and
  **Selection**, under a caption that names the chosen comparison. The table
  keeps the same columns. Counts read Baseline → Selection. Keep the wording
  consistent with the Changes tab and Review changes. Execution may refine
  the endpoint name in both places together.
- **Delta support.** Show a delta only when both sides have a build.
  Otherwise show the side that ran, with the existing wording such as
  **9 passed at completion**, and give the reason in place. The reason is
  either the missing matching baseline or that no build includes the
  selected changes. The end walk's start exclusion produces the second
  case.
- **Selections without revisions.** A captured landed run whose choice
  recorded no `comparison` (`src/storyReviewLandedRun.ts`) keeps the
  whole-story note, and its proof stays on the whole story.

## Decisive premises

| Consuming operation | Observation and result |
| --- | --- |
| The end walk excludes the start's own build | The real read with `storyStart` = the start applies `boundExclusive` in `nearestRevisionBuild`. `backend-tests/intent/ci-comparison-selection.spec.ts` covers this case: "a result never borrows the start build when the story has no result build". It passed in the hosted backend suite of CI run [45133100286](https://github.com/terryyin/open-dough/actions/runs/45133100286) at `405a99ed7` on 2026-11-23. Nothing under `dashboard/server` or `dashboard/backend-tests` has changed between that revision and `f51284027`. A selection's start goes through the same parameter. |
| A captured landed run names its revisions | `reviewRunChoiceSchema.comparison` holds `{ base, revision }` but is optional, as read at `f51284027`. Runs without it keep the whole-story note, a decision recorded above. |
| A commit range names its start revision | `ReviewCommit` (`src/storyReviewContract.ts`) carries `revision`, `fromTree` and `fromBaseline` but not the parent commit, as read at `f51284027`. `server/storyReviewCommits.ts` already reads `%P`. Slice 3 adds the first parent to the commit item. |
| Today's whole-story note is asserted | `frontend-tests/intent/intent-story-compare-evidence.spec.ts` asserts "Describes the whole story, not the chosen comparison." for CI comparison, Proof and Intent coverage under a commit range and a landed run. Slices 1 and 3 change those expectations for CI comparison and Proof only. |

## Slices and outside-in proof

### 1. A Done story's chosen landed run reads its own Baseline and Selection builds

Type: Behavior
Status: planned

Pre-condition: a Done story whose captured landed run recorded `base` and
`revision`, with CI builds near both. Trigger: choose **Landed runs** and
the run in Intent's Compare. Result: CI comparison shows Baseline at or
before `base` and Selection at `revision`, each with its revision, run and
selection words. The Changes counts, Summary and file Proof read those two
builds without the whole-story note. Choosing **Published completion**
restores the story's Baseline, Branch and Landed builds and counts.

Extend the read's parse, wire validation and client with the optional pair.
Resolve the selection through the same lookups and slot conversion
(`asComparisonSlot`) as the story's endpoints. Let Intent's CI evidence owner
(`src/IntentCiEvidence.tsx`, `src/useIntentCiComparison.ts`) key its read
by story and selection. It gets the selection from the comparison that Intent
shows (`src/useStoryComparison.ts`).

**Proof.** In a new backend spec beside `ci-comparison-selection.spec.ts`,
use the real read. A selected pair resolves to Baseline and Selection,
including an ancestor on the start side. A malformed or half pair is
refused in `ci-comparison-client-wire-validation.spec.ts`. In
`intent-story-compare-evidence.spec.ts`, the landed-run case sees both builds
named and the counts change between published completion and the run. CI
comparison and Proof no longer show the note, and Intent coverage still does.
Keep `e2e/intent/intent-ci-comparison.spec.ts` green as the default
comparison's journey.

### 2. A selection without a supporting pair of builds explains the missing delta

Type: Behavior
Status: planned

Pre-condition: a chosen selection with only one usable side. Trigger: open
CI comparison, Changes or a scope's Summary. Result: the side that ran is
named with its counts and no delta, such as **9 passed at completion**. The
missing side gives its reason. With no start build, the reason is that no
matching baseline was found at or before the selection's start. With no end
build after the start, the reason is that no build includes the selected
changes. The default comparison's explanations are unchanged.

**Proof.** Backend cases with the real read cover the start without a build
and the end commits never built. In the second case, the start's build is
not borrowed for the end. Mounted cases in
`intent-ci-comparison-endpoints.spec.ts` and the scope comparison's count
cell (`src/ciScopeComparisonCountsCell.ts`) show the one-sided wording and
reason without a fabricated delta or zero.

### 3. A Taken story's commit range reads its own builds and names unmeasured changes

Type: Behavior
Status: planned

Pre-condition: a Taken story with pushed commits. Trigger: choose
**Commits** and a range. Result: Baseline is the newest build at or before
the first chosen commit's parent. Selection is the last chosen commit's
build or its nearest measured ancestor inside the range. Both are named as
in slice 1. With **All changes** and uncommitted changes included, the proof
names the last commit's build and says the uncommitted changes were not
measured. Excluding them removes that statement.

Add the first parent revision to the commit item (`server/storyReviewCommits.ts`,
`src/storyReviewContract.ts`). Resolve the Taken selection through the
existing Taken path (`server/intentCiComparisonTakenResolve.ts`), keeping its
provisional wording.

**Proof.** A backend case with the real read covers a Taken selection with
an ancestor start and an exact end. The commit-range case in
`intent-story-compare-evidence.spec.ts` names both builds without the
whole-story note. A mounted case shows the unmeasured-changes statement,
which goes away when uncommitted changes are excluded. Keep
`e2e/intent/intent-ci-comparison-taken.spec.ts` green.

## Verification and delivery

- Local gate follows the [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Run from the owned checkout under `caffeinate -s -i` on AC. On battery,
  plug in, or start fully awake with the lid open under `caffeinate -i` and
  inspect the sleep log. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- The checkout has no `node_modules`. Install with the pinned Node from
  `.node-version` before the first run.
- Run the dashboard typecheck. Run the reached backend specs with
  `npm run test:dashboard:backend -- <specs>` and the mounted specs with
  `npm run test:dashboard:frontend -- <specs> --workers=2`. Run the two named
  E2E journeys. Use the installed
  [consumer trace](../../../.claude/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  against each actual diff. The comparison answer and the commit item reach
  Review changes, the Changes tab and Intent's Summary and Proof.
- Refactor and verify at each slice boundary through the installed
  [execution workflow](../../../.claude/skills/dough-execute-plan/SKILL.md).

## Readiness review

Dedicated slice-plan refinement was not needed. The three slices extend one
comparison rule to the chosen selection. Each adds one observable outcome
with its own real-read and mounted proof, and slices 2 and 3 reuse slice 1's
read. This review found no remaining slice-specific concern.
