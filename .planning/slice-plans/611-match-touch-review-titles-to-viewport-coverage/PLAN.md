# Touch review titles name what each viewport runs

**Source:** [Match touch review titles to what each viewport runs](../../seeds/SEED-321-match-touch-review-titles-to-viewport-coverage.md#match-touch-review-titles-to-viewport-coverage)
**Identity:** SEED-321#match-touch-review-titles-to-viewport-coverage

## Goal and scope

Each of the four touch review cases carries a title naming what its viewport
runs, and what each case runs comes from the same per-viewport declaration as
its title, so no case can skip beats its title claims. The seed owns the scope,
scope limits and key examples.

Use published comparisons for the phone and tablet. Preserve the four journeys,
their reading and panel assertions within those comparisons, and native touch
input. Product code, timeouts, and shared helper renames are outside this plan.

## Existing solution and direction

PFE: [story-review-touch.spec.ts](../../../e2e/review/story-review-touch.spec.ts)
loops over `launchTouchViewports` with shared titles.
[storyReviewTouchJourney.ts](../../../dashboard/test-support/support/storyReviewTouchJourney.ts)
exports `ownsSharedObservations(page)`, which compares the page's current width
with the phone's portrait width; it is consumed there and in
[storyReviewTouchContext.ts](../../../dashboard/test-support/support/storyReviewTouchContext.ts)
after the rotation loop. The phone-only beats are already cohesive functions:
`observeSharedControlsByTouch` and `keepReviewContextThroughPanelControls`.
The review, side panel and control owners [Express review and Side panel test intent through page objects](https://github.com/terryyin/open-dough/blob/26bcdab755a81875c698cb51eb941037646bcb7f/.planning/seeds/SEED-300-dashboard-test-page-objects.md#express-review-test-intent-through-page-objects) left in place stay as they
are; no new helper family.

The spec declares each case's title and beats for its viewport and drives
those beats through the existing page objects. The phone explicitly chooses
between published comparisons. Delete `ownsSharedObservations` and the two
journey wrappers. Proposed titles:

| Viewport | Reading case | Context case |
| --- | --- | --- |
| phone | chooses a comparison and file and reads within each pane | keeps the chosen file and reading places through rotation and panel controls |
| tablet | chooses a file and reads within each pane under the opened comparison | keeps the chosen file and reading places through rotation, Maximize and Restore |

Follow the [Architectural North Star](../../NORTH-STAR.md): test support holds
only MakeMe builders and page objects, so retire `storyReviewTouchJourney.ts`
and `storyReviewTouchContext.ts` from `dashboard/test-support/support/` rather
than adding wrapper parameters, expressing the viewport steps in
`e2e/review/story-review-touch.spec.ts` over the `ReviewChanges` and Side panel
page objects.

## Decisive premises and preparation observations

All observations in this workspace at `14a670355665972395b1593c9c448e3cbc6f6891`
on 2026-11-13, Node 24.21.0, Homebrew Bash first on `PATH`, `caffeinate -s -i`,
`NO_COLOR`, `FORCE_COLOR` and `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset, load
4–12, after `node scripts/setup-native.mjs npm|browser|check` exited 0. Command
`npm run --silent test:dashboard:integrated -- tests/review/story-review-touch.spec.ts --workers=1 --reporter=list`
from the checkout root. Every scratch edit was reverted by `git checkout` and
`git status --porcelain` afterwards showed only the seed.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| The four cases pass through the current E2E entry point with published comparison fixtures | Earlier baseline: 4 passed (28.9 s), exit 0, through the runner above. | Rerun the four cases with the current fixtures after the published-review cutover. |
| A scratch throw at the start of both phone-only beats discriminates which viewport runs them | Throws in `observeSharedControlsByTouch` and `keepReviewContextThroughPanelControls`: both phone cases failed with the scratch errors, both tablet cases passed (16.9 s). | Re-run after the change as the slice's discrimination proof. |
| Page-width ownership lets a phone case skip beats its title claims | Scratch `await page.setViewportSize(landscape)` before the ownership check plus the panel-controls throw, `-g keeps`: both cases passed (10.4 s); the phone context case skipped every panel control. | The slice must turn this phone case into a failure under the same scratch. |
| Changing the phone's width breaks ownership (initial seed example) | False. Phone portrait width scratch-set to 391 with both throws: phone cases still failed with the scratch errors, tablet passed (18.1 s), because the check compares with the phone constant. The seed example was replaced by the orientation case above. | None. |
| Only the touch journey and context support consume `ownsSharedObservations` and the journey exports; the titles have no live consumer | `git grep` over the checkout: the helper and `openReviewByTouch`/`TouchReview` appear only in the spec and the two support files; title text appears only there and in historical `.planning/done/` and `.planning/evidence/SEED-303-*` records. | Execution reruns `consumer-trace.mjs` on the diff. |
| Test conventions | `test-entry-rules.mjs --project . --source <spec> --source <two support files>`: the spec is MakeMe + page objects; the support files are unselected by path and follow the consuming spec's conventions per AGENTS.md. | None. |

## Outside-in proof ownership

| Promise | Slice | Observable proof |
| --- | --- | --- |
| Each viewport's titles name what it runs; tablet titles claim neither comparison choice nor panel controls; phone titles keep both | 1 | `--reporter=list` output of the focused command lists the four per-viewport titles. |
| A case runs exactly the beats its declaration names, independent of page size at the moment | 1 | Scratch throws in both phone-only beats: phone cases fail with the scratch errors, tablet cases pass. Adding the scratch landscape resize before the former ownership point: the phone context case now fails with the panel-controls scratch error. Revert and confirm a clean diff. |
| All four published-review journeys preserve their reading, context, panel and native touch proof | 1 | Focused E2E command: 4 passed. Match each surviving observation to its published comparison and viewport. |

## Ordered slices

### 1. Each touch review case names and runs what its viewport covers
Type: Behavior
Status: planned
Proof: the three rows above, plus `npm run typecheck:dashboard` and staged lint.

Behavior: the touch review spec with shared titles and page-width ownership →
the phone and tablet cases run → the list shows per-viewport titles, the four
cases pass, and the scratch probes show the phone alone runs its beats whatever
size the page has when they are reached.

## Verification and delivery

- Follow [the shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written; a base failure is attribution, never an exemption.
- Before test edits, run installed `test-entry-rules.mjs` for actual paths and
  apply [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) and
  [dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md) as
  resolved. No sleeps, `test.slow()` or timeout overrides.
- Focused command: `npm run test:e2e -- e2e/review/story-review-touch.spec.ts
  --workers=1 --reporter=list`.
- Local gate: the focused command and scratch probes above, `npm run
  typecheck:dashboard`, post-change refactoring, staged lint and ordinary
  delivery. Run `consumer-trace.mjs --checkout <workspace> --base HEAD` with
  `--term ownsSharedObservations` and the old title text, dispositioning each
  consumer. No full local suite: the change is confined to one spec and its two
  support files, which no other test imports. Hosted CI runs the shard.
- Run under `caffeinate -s -i` on AC;
  on battery, `caffeinate -i` awake with the lid open and read the sleep log.
- No spec is added or renamed, so the thirteen-shard deal is unchanged.

## Current decisions and plan review

One slice owns the titles and the viewport-specific beats they describe.
Refresh the E2E baseline and proof roster after the published-review cutover.
