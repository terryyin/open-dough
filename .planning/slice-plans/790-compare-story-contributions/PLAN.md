# Compare a story branch with and without incoming trunk changes

**Identity:** SEED-420#compare-story-contributions
**Source:** [Compare a story branch with and without incoming trunk changes](../../seeds/SEED-420-unified-intent-review.md#compare-story-contributions)

## Goal and scope

A developer reviewing a branch story in Intent starts with the story's
contribution and can use **Include merged changes** to see the full net diff
ending at the same revision or worktree snapshot. Cover the Done completion,
Taken workspace and contiguous commit range. Keep own merge edits and identify
mixed resolutions in the attributed view. A comparison change drives the same
file and folder listing, revision header, diff and note context. Existing
captured landings and recorded session ranges keep their exact pairs and
shared-checkout provenance. The scope does not add a session picker,
combined ranges, comparison-specific CI proof, or a new record format.

## Current decisions and existing owners

- [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
  makes the comparison and path part of Intent's shared reading context.
  Build Done comparisons from published history and live comparisons from the
  admitted workspace. A measured CI revision stays attached to its evidence.
- [Review in Intent — Sessions and Compare, Files, Home and Proof](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent).
  Add the checkbox in Intent's existing Compare disclosure. The attributed
  view opens by default. A wider comparison updates the file and folder
  detail in place while current whole-story proof keeps its measured-build
  wording. Keep the existing captured-landing and recorded-range identities.
- Reuse the owners found by [Dough PFE](../../../.agents/skills/dough-pfe/SKILL.md).
  `storyCompletionEndpoints` already establishes the story start, mode and
  immutable completion. `completedStoryAttribution` and `trunkLess` supply
  the Done contribution. `storyReviewWorkspaceSnapshot` and
  `storyReviewCommits` supply a fixed workspace observation and existing
  first-parent points. `compareReviewPoints` already restates ranges on
  the destination trunk baseline and carries inseparable paths through owning
  integrations. The raw comparison uses `changedFrom` across the original
  points before restatement. Use these owners for both choices.
- `storyComparisonShown` and `diffStartOf` already carry the chosen tree,
  files and per-file start into Intent. Reuse that projection for list, counts,
  diff and note context. For historical files rederive the allowed pair from
  the named completion, mode and path in `admitHistoricalReviewedFile`;
  keep the exact-pair and rename checks even when both comparisons end at
  the same tree. Retained runs and published session pairs continue to
  use their own checks.
- [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  Bind the choice through the production Intent composition and typed reads.
  Keep new isolated UI checks in Chromium Vitest and new Git/service logic
  checks in Node Vitest. Use the maintained E2E page objects for the live
  cross-boundary journey. Follow [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  and [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).

## Decisive premises

Observations are from the preparation worktree at `c67b936fa` on
2026-11-23 with Node 24.21.0, Apple Git 2.50.1, and AC power. The
commands below ran from this worktree.

| Consuming operation | Observation and result |
| --- | --- |
| Recover a Done story start and compare the two bases with a single end | Imported `storyCompletionEndpoints`, `completedStoryAttribution`, `trunkLess` and `changedFrom` from the Dashboard server in `node --disable-warning=ExperimentalWarning --input-type=module`. Passed the project's `.planning/PRODUCT-BACKLOG.md`, identity `SEED-413#correct-landing-record-writes-and-tests` and published revision `daf6997db` to the endpoints reader. It returned Story Branch Mode, claim `7ed7478c8`, story start `f7190a3b1` and completion `daf6997db`. `changedFrom` omitted `dashboard/backend-tests/review/ad-hoc-session-branch-handoff.spec.ts` from `44a059b → daf6997db` and returned that path with +239/−30 from `f7190a3b1 → daf6997db`. The observation used the same repository and Git routines the review server consumes. The configured-source UI and file admission use there is covered by the Done Intent baseline below. |
| Keep merge attribution and gaps at the existing review boundary | `caffeinate -s -i npm run test:dashboard:backend -- review/story-review-completed-merge-tree.spec.ts review/story-review-completed-conflicts.spec.ts review/story-review-workspace.spec.ts --workers=2 --reporter=list` passed 12. The real-Git conflict response read the resolving diff and kept clean edits while excluding an incoming-only file. The old-Git case reached the explicit gap. The workspace checks preserved named-launch precedence and ambiguity. |
| Preserve recorded ranges and their provenance | The mixed backend run selected `review/published-session-ranges.spec.ts` in Vitest. Six checks passed, including reading each exact pair, refusing a cross-pair diff and distinguishing shared-checkout markers by selected range. |
| Use existing Intent comparison selection and evidence behavior | `caffeinate -s -i npm run test:dashboard:frontend -- intent/intent-story-compare-uncommitted.spec.ts intent/intent-story-compare-commits.spec.ts intent/intent-story-compare-done.spec.ts intent/intent-story-compare-evidence.spec.ts` passed seven Chromium cases. They reached committed-only refresh, a bounded range through navigation, Done-to-landed-and-back, and the existing whole-story evidence note. These baseline checks predate the new checkbox. |
| Read a live or historical comparison through Intent's production entry | `caffeinate -s -i npm run test:e2e -- --reporter=list --workers=2 intent-story-changes.spec.ts intent-story-changes-moves.spec.ts intent-done-retained-workspace.spec.ts` passed five Chromium cases. They reached the Taken worktree diff, moved and deleted files, and the published Done comparison and history gap with a retained worktree still present. |
| Read a bounded trunk merge, a direct-trunk story and a captured landing | `caffeinate -s -i npm run test:e2e -- --reporter=list --workers=2 story-review-commit-trunk.spec.ts story-review-trunk-own-changes.spec.ts story-review-story-branch-landed.spec.ts` passed seven Chromium cases. The range displayed the story's edits, genuine conflicts and original or destination baseline as appropriate. Direct-trunk changes followed their published attribution, and the captured landing read the fixed pair after retirement. The range boundary is shared with Intent. |

## Ordered slices

### 1. A Done branch comparison widens from its recorded story start

Type: Behavior
Status: done

From a fetched Done story whose branch history is recoverable, open Intent and
show the attributed comparison. Widen to the net changes from the recorded
story start to that same completion. Bind the checkbox, range label, changed
paths and folder counts to the selected comparison. Keep diff and note reads
on the corresponding admitted pair. Use the existing unavailability response
when history cannot establish the choice.

Proof: Use a Done branch-only history fixture with an incoming edit on a
separate path. Open the story after retirement through its normal Intent
entry. Observe the two bases against one completion, the folder count, the
appearing file and its diff. Uncheck on the incoming-only file and observe
the cleared diff, then switch with a common file selected and inspect its
note context. At the real-Git read boundary admit the correct widened
historical pair and refuse a wrong baseline or unlisted rename path. Cover
the existing missing-history and retained-workspace behavior in
`e2e/intent/intent-done-retained-workspace.spec.ts`.

Accepted: Dashboard typecheck, the retired and retained Done Intent journeys,
file and line notes, touch Review, and the focused Chromium comparison, context,
reading, evidence and session cases passed. Real-Git historical admission
observed a shared end tree, the widened text pair, rename refusal and acceptance,
and the same pair in follow-up. The shared checkbox and displayed baseline passed
focused browser reruns after independent refactoring.

### 2. A Taken branch widens with the current worktree choice

Type: Behavior
Status: done

Given a Taken branch whose admitted history establishes its start, take the
raw pair from that story start and the same recorded head or temporary
worktree tree used by the attributed default. Use the existing branch claim
and commit points to establish the interval, including the start before a
trunk integration. Keep the uncommitted control independent from widening.
Refresh keeps the selected choice when the refreshed history supports it.

Proof: Add incoming trunk work, a branch change and an uncommitted file to
a real Taken branch fixture. In Intent switch the merged and uncommitted
controls and check the raw and attributed paths, header and selected diff.
Refresh after an additional branch commit and check the new revision while
both choices persist. Read the alternate tree through existing workspace
admission. Preserve the live source and rename journey in
`e2e/intent/intent-story-changes.spec.ts` and
`e2e/intent/intent-story-changes-moves.spec.ts`.

Accepted: Dashboard typecheck, real-Git branch history and file admission,
and focused Chromium and browser journeys passed. The Taken card showed its
attributed snapshot before widening to incoming changes. The wider diff and
note used the recorded story start and committed tree. The mixed resolution
retained its file-specific start. Both choices and the selected incoming file
survived Refresh. Done, captured landing, live rename and Trunk Mode cases passed.

### 3. A selected commit range widens only between its own endpoints

Type: Behavior
Status: done

Choose a contiguous branch range across a trunk merge. Its attributed read
uses the existing range restatement, including the owning merge's edits and
the file-specific baselines for mixed paths. Widen using the same range's
original first-parent start and end tree. Offer no fabricated attributed
result if Git cannot restate a needed integration.

Proof: Extend the real-Git histories used by
`e2e/review/story-review-commit-trunk.spec.ts`. Inspect the range in Intent.
Cover an incoming-only path, an edit authored during a clean merge, a mixed
conflict with a readable resolution diff, and subsequent trunk outside the
range. Observe membership, range labels and per-file baselines in each
choice. Keep ordinary commit and uncommitted-only selections readable.

Accepted: Dashboard typecheck and focused real-Git backend, Chromium and
end-to-end cases passed. Intent selected the two middle integrations and
showed the clean merge edit and mixed-file resolution. Widening used the
selected first-parent tree and the same end in the heading and note. Incoming
files entered the list while later integrated trunk stayed outside the range.
The file lost its attribution flag in the widened view. The unsupported-Git
case returned the attribution gap without an alternate pair.

### 4. Fixed and unavailable comparisons explain their own evidence

Type: Behavior
Status: planned

On switching from a branch to a captured landing, direct-trunk story,
recorded session pair, or an unavailable branch comparison, use the
capability of the new comparison. Fixed pairs keep their recorded range
and warning, and gaps keep their explanation. Switching back returns the
default contribution of a newly opened branch story. When a wider branch
view is displayed, keep whole-story CI comparison, Proof and Intent
coverage attached to the evidence they already read.

Proof: In a mounted production Intent case, switch between a widened
branch, captured landing and a Trunk Mode story, and check the checkbox,
header, selected file and whole-story evidence note. Hold an old reply
across a story switch to ensure it cannot populate files for another
story. Rerun the marked and unmarked session-range cases with their
warning and diff, and the existing gap, retry and evidence cases in
`dashboard/frontend-tests/intent/intent-story-compare-{gaps,evidence}.spec.ts`.

## Execution evidence

- Story Branch Mode uses `codex/compare-a-story-branch-with-and-without-incoming`
  and `origin/main`. Start `388848a640e5f937e952ea2a59b94701d144a2be`,
  published claim `f3c0fe94ab66cf39d500dc0e76f4ab3cdf4ae3f7`.
  GitHub Actions `ci.yml` observes the remote story branch during execution.
## Verification and delivery

- Run focused checks from the owned checkout. The [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  uses `caffeinate -s -i` on AC. On battery, plug in or start fully awake
  with the lid open under `caffeinate -i` and inspect the sleep log.
  Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- At each slice boundary, run the dashboard typecheck and the reached
  frontend, backend or E2E cases through their normal npm targets. Apply
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page-object selection](../../../.agents/skills/dough-page-objects/SKILL.md)
  to changes in test sources. Keep old clients' default review requests
  working, including Side panel and outbound note/follow-up context.
- Use the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  on actual changes. Include selectors that decide default evidence, file
  and folder selection, diff and text routes, note context, session readers
  and review fixtures. Prove their reached promises before delivery through
  the [execution workflow](../../../.agents/skills/dough-execute-plan/SKILL.md).
- Keep comparison shapes in their existing typed owners.
  `storyReviewContract.ts` is 249 lines and `IntentStoryComparison.tsx`
  is 246. Slice 1 can place endpoint and capability shapes beside the
  existing comparison contracts and display the selected range through
  `IntentComparedContext`. If these edits cross the 250-line check,
  move pair/range contracts out of the envelope, or move range display out
  of the lens state module, respectively. Preserve their current callers
  and repeat the comparison and evidence baseline checks in Slice 1.

## Readiness review

Dedicated slice-plan refinement was unnecessary. The slices follow the
available comparison selections and each has a complete external proof loop.
All branch comparisons use the same rule: one endpoint for both choices,
with a raw original start or the attributed start and its per-file exceptions.
The fixed record case exercises the evidence boundary for that rule. No
additional Structure slice is needed for the selected approach. No remaining
slice-specific concern was found.
