# Touch review titles name what each viewport runs

**Source:** [Match touch review titles to what each viewport runs](../../seeds/SEED-321-match-touch-review-titles-to-viewport-coverage.md#match-touch-review-titles-to-viewport-coverage)
**Identity:** SEED-321#match-touch-review-titles-to-viewport-coverage

## Goal and scope

Each of the four touch review cases carries a title naming what its viewport
runs, and what each case runs comes from the same per-viewport declaration as
its title, so no case can skip beats its title claims. The seed owns the scope,
scope limits and key examples.

Excluded: renaming `largeReviewRevision`, `largeWorktree`, the `large changes`
commit or `chooseLargeChangesCommitByTouch` (shared with the desktop 63-file
review and already parameterized by each consumer's facts); the stroke-count
comment, which no longer exists; any change to assertions, strokes, comparison
facts, native touch input, timeouts or product code. Historical title text in
`.planning/done/` and `.planning/evidence/SEED-303-*` records what ran then and
stays unchanged.

## Existing solution and direction

PFE: [story-review-touch.spec.ts](../../../dashboard/tests/review/story-review-touch.spec.ts)
loops over `launchTouchViewports` with shared titles.
[storyReviewTouchJourney.ts](../../../dashboard/tests/support/storyReviewTouchJourney.ts)
exports `ownsSharedObservations(page)`, which compares the page's current width
with the phone's portrait width; it is consumed there and in
[storyReviewTouchContext.ts](../../../dashboard/tests/support/storyReviewTouchContext.ts)
after the rotation loop. The phone-only beats are already cohesive functions:
`observeSharedControlsByTouch` and `keepReviewContextThroughPanelControls`.
The review, side panel and control owners [Express review and Side panel test intent through page objects](https://github.com/terryyin/open-dough/blob/26bcdab755a81875c698cb51eb941037646bcb7f/.planning/seeds/SEED-300-dashboard-test-page-objects.md#express-review-test-intent-through-page-objects) left in place stay as they
are; no new helper family.

Direction: the spec declares, per touch viewport, each case's title and whether
that case runs the phone-only beats (a field on a spec-local viewport entry, or
distinct journey entry points the spec names; execution chooses the simpler
form). The journeys take that declaration as a parameter instead of reading
page size, and `ownsSharedObservations` is deleted. Support comments that say
"each case title describes the phone's journey" are updated to say each
viewport's title describes its own. Proposed titles, refinable in wording:

| Viewport | Reading case | Context case |
| --- | --- | --- |
| phone | chooses a comparison and file and reads within each pane | keeps the chosen file and reading places through rotation and panel controls |
| tablet | chooses a file and reads within each pane under the opened comparison | keeps the chosen file and reading places through rotation, Maximize and Restore |

No ADR or North Star direction is involved: this is test wording and
test-support parameter ownership within existing conventions.

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
| The four cases pass in this checkout and route | Baseline: 4 passed (28.9 s), exit 0. | None. |
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
| Every reading, context and panel assertion, the four cases and native touch input are preserved | 1 | Focused command: 4 passed; the diff changes no assertion, stroke or comparison fact. |

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

- Follow [the failing/flaky-test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written; a base failure is attribution, never an exemption.
- Before test edits, run installed `test-entry-rules.mjs` for actual paths and
  apply [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) and
  [dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md) as
  resolved. No sleeps, `test.slow()` or timeout overrides.
- Local gate: the focused command and scratch probes above, `npm run
  typecheck:dashboard`, post-change refactoring, staged lint and ordinary
  delivery. Run `consumer-trace.mjs --checkout <workspace> --base HEAD` with
  `--term ownsSharedObservations` and the old title text, dispositioning each
  consumer. No full local suite: the change is confined to one spec and its two
  support files, which no other test imports. Hosted CI runs the shard.
- Run under maintained `caffeinate -s -i` on AC, per
  [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos);
  on battery, `caffeinate -i` awake with the lid open and read the sleep log.
- No spec is added or renamed, so the thirteen-shard deal is unchanged.

## Current decisions and plan review

One slice owns one outcome and one proof loop; titles and ownership are the
same declaration, so splitting them would ship titles whose beats still come
from page size. No Structure slice, numeric slice target, trunk-only step or
human checkpoint is needed. Slice-plan refinement was not needed: no boundary,
cumulative design, sizing or proof-ownership concern was identified. This review
identified no remaining slice-specific concern.
