# Make fluent Side panel page objects easier to extend

**Identity:** SEED-268#adjust-fluent-side-panel-page-objects

**Source:** [Make fluent Side panel page objects easier to extend](../../seeds/SEED-268-fluent-side-panel-pilot-follow-up.md#adjust-fluent-side-panel-page-objects)

**Source review:** [source-review.md](source-review.md)

## Goal and boundaries

A dashboard test maintainer adds a page object or hand-off in the Side panel
pilot by editing the destination's module and the phase's page-object set,
and reads each negative Story card check as a named operation. The seed's
scope, key examples and evaluation are the source; this plan adds no promise.

Exclusions, from the seed: no page objects for other journeys, no new journey
behavior, no route a spec does not use (the extension probe is reverted), and
no signature change to shared helpers such as `storyCardSelection.ts`, whose
boolean `expectSelected` and `expectInspected` serve 29 test files. Wider
adoption belongs to `SEED-268#conclude-fluent-side-panel-pilot`.

## Current decisions

- **The set is the navigation context.** `PageObject` takes the phase's
  `SidePanelPages` (with `page` and `cues`) instead of constructing
  destinations. Hand-offs return `this.pages.<object>`: `StoryCard`
  `reviewChanges*()` → `storyReview`, `readFinalReport()` → `finalReport`,
  `openTerminal()` → `terminal`; `SessionsSidebar.openEntry()` → `terminal`;
  `StoryReview.close()` and the base `sidePanel` getter → `sidePanel`;
  `SidePanel.storyReview`/`finalReport` → the set's. `StoryCard(title)` stays
  created by `board.storyCard(title)`. So the set gains `storyReview` and
  `finalReport`; specs keep reaching them through `sidePanel.` as today, and
  may also destructure them. `pagesOf` builds the set once per phase and
  hands each object that same set (for example by filling one object whose
  members are created with a reference to it); exact wiring is the
  executor's choice.
- **Modules.** The base moves to its own module (`fluentPageObject.ts` or a
  similar name stating its role); `SidePanel` gets its own module; `StoryReview`
  and `FinalReport` share a content module unless its size argues for two.
  `sidePanelContentPages.ts` disappears rather than staying as a
  re-export. Page-object modules import the base at run time and
  `SidePanelPages` only with `import type`; only `sidePanelPages.ts` imports
  every class. `PerspectiveChoice`, `Intent` and `PanelDivider` stay in
  `sidePanelPages.ts` unless its size requires moving them.
- **Named negatives** are three new `StoryCard` methods calling the unchanged
  `storyCardSelection.ts` helpers with `false` and the Terminal mark's
  `toHaveCount(0)`; `expectSelected()`, `expectInspected()` and
  `expectShownInTerminal()` lose their boolean. Cue names stay
  `not selected`, `not inspected`, `not shown in terminal`.
- **Evaluation home.** The revised-design evaluation is written in this plan
  under `## Revised design evaluation`, beside the seed's baseline, so the
  conclusion story reads it from trunk.

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Three journeys pass on the revised design | Slices 1–2 | Both pilot specs pass (3 tests) with the command under Local gates. |
| Cue names and order unchanged (seed example: hand-off through the set) | Slices 1–2 | Before slice 1, run both specs with `--reporter=json` at the plan's base and keep the phase › cue step-title tree (extraction as in the premise row below) in the job tmp directory; after each slice the same extraction is identical, since the named negatives keep their cue names. |
| Back from content without a run-time import (seed example: back from content) | Slice 1 | `close().expectItems(0)` still runs in the replacement journey; `git grep` of the new content module shows the Side panel module only in an `import type` line, and `npm run typecheck:dashboard` passes. |
| Extension probe (seed example) | Slice 1 | Scratch: `FinalReport` gains a hand-off returning `this.pages.board`, used once in a replacement-spec phase (e.g. after reading Story B's report, `board.storyCard("Story B")` expect shown). Record the files `git diff --stat` touches (expected: the content module and the spec only), type-check, run the spec, revert, and record the result in the evaluation. |
| Named negatives (seed example) | Slice 2 | `git grep -n "(false)"` in both pilot specs and page-object modules finds no Story card negative boolean; the switching spec's nine sites read `expectNotSelected()`, `expectNotInspected()` or `expectNotShownInTerminal()`, and the step-tree diff stays identical. |
| Diagnostics preserved | Slice 2 | Controlled failure: change one spec's expected value (e.g. a `expectStory("Story A")` to `"Story Z"`), run; the failure names test › phase › cue, shows expected and received, and later cues of that phase do not appear in the step tree. Restore and pass. |
| Sizes and locator ownership | Slice 2 | `wc -l` of every pilot page-object module, `support/cueSheet.ts` and both specs against the seed's baseline, none above 250; `git grep -n '"Review changes"' dashboard/tests/*Pages.ts dashboard/tests/fluent*.ts` (and any new pilot module) finds only `StoryCard`'s locator. |

## Decisive premises

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 1: a content module may name the set with `import type` while `sidePanelPages.ts` imports it at run time | 2026-11-08 at `c9a6d31c5`, scratch (reverted): `sidePanelContentPages.ts` gained `import type { SidePanelPages } from "./sidePanelPages.ts"` and typed its `sidePanel` getter as `SidePanelPages["sidePanel"]`; ran `npm run --silent typecheck:dashboard` and `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/tests/navigation/side-panel-content-replacement.spec.ts dashboard/tests/navigation/side-panel-content-switching.spec.ts --reporter=list` | Type-check passed; 3 passed (3.8–5.2 s each). The type-only cycle loads under Playwright's transform and `tsc --build`. |
| Proof route and baseline: the three journeys run locally in this worktree | Same run, after `node scripts/setup-native.mjs npm` and `browser` | 3 passed at the plan's base. |
| Cue-order proof: the JSON reporter carries phase › cue step titles | 2026-11-08 at `c9a6d31c5`: the switching spec with `--reporter=json`; a node script walked `suites → specs → tests → results → steps` recursively | 93 step titles, including `Story card "Story B": not selected` and `Story card "Story A": not shown in terminal`, in phase order. |
| Affected consumers are only the pilot | `git grep -l` for each of `sidePanelContentPages`, `sidePanelPages`, `storyCardPages` and `terminalPages` under `dashboard` at `c9a6d31c5` | Only the pilot's page-object modules, its two specs, the `support/cueSheet.ts` comment and `writing-journeys.md`; the type-check covers every importer. `storyCardSelection.ts` is not changed. |
| Diagnostics: a failed cue reports test › phase › cue with expected and received and stops later cues | Pilot evaluation, plan 506 at `e0d4735e1`, “Failures” | Held then; `support/cueSheet.ts` is not changed by this plan, so slice 2 reobserves it on the revised page objects rather than relying on it. |

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Never sleep, never use `test.slow()`, keep default timeouts. For longer runs
on awake macOS with AC power, use `caffeinate -s -i` with Homebrew Bash first
on `PATH`; on battery follow the lid-open procedure.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Each slice runs, with `NO_COLOR`, `FORCE_COLOR` and
`GIT_ALTERNATE_OBJECT_DIRECTORIES` unset:

- `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/navigation/side-panel-content-replacement.spec.ts dashboard/tests/navigation/side-panel-content-switching.spec.ts`
  (list and json reporters as the proof table says);
- `npm run typecheck:dashboard`;
- `npm run --silent lint` (or the formatter and lint on the changed files).

No full local suite: only the pilot's test modules change, and the
type-check covers every importer. Hosted CI runs the full suites after
publication.

## Slices

### 1. A hand-off reaches its destination through the phase's set

Type: Behavior

Status: done

Proof: three journeys pass with an identical step tree; back-from-content
import check; the extension probe, recorded and reverted.

Behavior: a maintainer adding a hand-off in the Side panel pilot → edits the
destination's own module and the phase that uses it → it type-checks and the
journey runs, with no module holding the base, the Side panel and its
contents together. Includes the set-based navigation, the base, Side panel
and content modules, removing `sidePanelContentPages.ts`, updated header
comments, and the “Fluent phases” section of
`dashboard/tests/writing-journeys.md` naming the new modules and that
objects hand off through the set.

Accepted proof (2026-11-08): both pilot specs 3 passed (6.1 s, 4.6 s,
6.0 s); the JSON step tree equals the base's after masking the per-run
session id (`sed -E 's/attached [0-9a-f]{8}/attached <id>/'` on both, since
`Terminal: shows "attached <8 hex>"` comes from `randomUUID()`); type-check
and lint pass. Modules: `fluentPageObject.ts` 41, `sidePanelFramePages.ts`
98, `storyReviewPages.ts` 121, `finalReportPages.ts` 19 (two content modules,
so the probe edits only the Final report's), `sidePanelPages.ts` 147 (the set
is now one exported `SidePanelPages` class whose field initializers build
each object with `this`), `storyCardPages.ts` 157, `terminalPages.ts` 97.
`storyReviewPages.ts` imports neither the Side panel nor the set; `close()`
uses the base's `sidePanel` getter. Extension probe: `FinalReport` gained
`get board()` returning `this.pages.board`, used once after
`.expectText(storyBReport)` as `.board.storyCard("Story B").expectShown()`;
it touched only `finalReportPages.ts` (+5) and the replacement spec (+2)
(`git diff --stat` missed the then-untracked module), type-checked, 2
passed, reverted with the step tree again equal to the base's.

### 2. Negative Story card checks read as named operations, and the revised design is evaluated

Type: Behavior

Status: done

Proof: named-negatives check, identical step tree, controlled failure, and
the sizes and locator-ownership record, as mapped above.

Behavior: a reader of the switching journey → reads a negative Story card
check → sees `expectNotSelected()`, `expectNotInspected()` or
`expectNotShownInTerminal()` at the spec line, with the cue named as before.
Then the `## Revised design evaluation` section records the three journeys'
results and durations, the extension probe's touched files, the controlled
failure's report, module and spec sizes against the seed's baseline, and the
`Review changes` locator's owners.

## Revised design evaluation

Observed 2026-11-08 on slice 1's commit `1112b8feb` plus slice 2's named
negatives, against the seed's baseline from the pilot at `77741589a`. Runs
used `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`
and the command under Local gates.

**Journeys.** 3 passed, 2 workers (list reporter, 11.9 s wall; JSON
reporter run, 12.3 s wall):

| Journey (seed's Evaluation) | Test | List | JSON |
| --- | --- | --- | --- |
| Review, another story's review, and final report replacement, including the held response race and panel controls | replacement spec, “a review, another story's review, and a final report replace each other in the one side panel” | 5.3 s | 4.7 s |
| Review and final report retention across Board and Intent, including the selected file and Intent's separate comparison | replacement spec, “a review and a final report stay shown with their selection while the page changes to Intent and back” | 4.1 s | 4.0 s |
| Review and Terminal replacement beside the Board, including reattachment of the same session | switching spec, “review and terminal take turns in the one side panel beside a usable Board” | 4.4 s | 4.5 s |

The JSON phase › cue step tree (171 lines) is identical to the plan's base
after masking the per-run Terminal session id
(`sed -E 's/attached [0-9a-f]{8}/attached <id>/'`), after slice 1 and again
after slice 2: cue names and order are unchanged, including
`Story card "Story B": not selected`, `Story card "Story A": not inspected`
and `Story card "Story A": not shown in terminal`.

**Named negatives.** The switching spec's nine former boolean negatives now
read `expectNotSelected()` (7), `expectNotInspected()` (1) and
`expectNotShownInTerminal()` (1); `git grep -n "(false)"` over both specs and
every pilot page-object module finds none. `StoryCard`'s positive
`expectSelected()`, `expectInspected()` and `expectShownInTerminal()` take no
argument. `storyCardSelection.ts` is unchanged; the named operations call its
boolean `expectSelected` and `expectInspected` with `true` or `false`.

**Extension probe** (slice 1, reverted). `FinalReport` gained `get board()`
returning `this.pages.board`, used once in the replacement spec as
`.board.storyCard("Story B").expectShown()` after reading Story B's report.
It touched only `finalReportPages.ts` (+5) and
`side-panel-content-replacement.spec.ts` (+2); type-check passed and the spec
passed (2 tests). After the revert the step tree again equalled the base's.

**Controlled failure.** Scratch change in the replacement spec's phase
“Story B's review replaces Story A's, still reading”:
`sidePanel.storyReview.expectStory("Story A")` → `"Story Z"`. The list
reporter reported:

```text
1) [chromium] › dashboard/tests/navigation/side-panel-content-replacement.spec.ts:66:1 › a review, another story's review, and a final report replace each other in the one side panel › Story B's review replaces Story A's, still reading › Story review: of Story Z

  Error: expect(locator).toHaveText(expected) failed

  Locator:  getByRole('region', { name: 'Story review' }).getByRole('heading', { level: 2 })
  Expected: "Story Z"
  Received: "Story A"
  Timeout:  5000ms
     at tests/storyReviewPages.ts:30
```

The JSON step tree of that failed run ends at the failing cue; the phase's
later cues (`says "Reading the story's changes…"`, `Story card "Story B":
Review changes`, …) and later phases do not appear:

```text
# a review, another story's review, and a final report replace each other in the one side panel [failed]
  Story A's review opens on its held read
    Story card "Story A": Review changes
  Story B's review replaces Story A's, still reading
    Story review: of Story Z
```

Restored, the replacement spec passed (2 passed, 4.6 s and 3.4 s).

**Sizes** (lines, `wc -l`; none above 250):

| Module | Pilot baseline | Revised |
| --- | --- | --- |
| `sidePanelContentPages.ts` | 246 | removed |
| `fluentPageObject.ts` (base) | — | 41 |
| `sidePanelFramePages.ts` (Side panel) | — | 98 |
| `storyReviewPages.ts` | — | 121 |
| `finalReportPages.ts` | — | 19 |
| `sidePanelPages.ts` (phase and set) | 139 | 147 |
| `storyCardPages.ts` | 161 | 173 |
| `terminalPages.ts` | 96 | 97 |
| `support/cueSheet.ts` (unchanged) | 65 | 65 |
| Runner and page objects | 709 | 761 |
| `side-panel-content-replacement.spec.ts` | 250 | 250 |
| `side-panel-content-switching.spec.ts` | 239 | 239 |
| Boolean negative calls in the switching spec | 9 | 0 |

The largest page-object module is now 173 lines (was 246). The 52-line
growth is module headers and imports for four modules instead of one, the
set's `storyReview` and `finalReport` members, and the three named negative
methods.

**`Review changes` locator.** `git grep -n '"Review changes"'
dashboard/tests/*Pages.ts dashboard/tests/fluent*.ts` finds one line,
`storyCardPages.ts:47` (`StoryCard`'s `#reviewChanges`): still one owner.

**Checks.** `npm run --silent typecheck:dashboard` passed;
`npm run --silent lint` passed. Consumers: only the two pilot specs construct
or call `StoryCard` (`git grep` of `storyCardPages` and `.storyCard(` under
`dashboard`: the two specs, `sidePanelPages.ts` and `writing-journeys.md`);
both specs ran above. The 29 test files that call `storyCardSelection.ts`'s
`expectSelected`/`expectInspected` use that unchanged module directly, so
they were not rerun; the type-check covers every importer.

## Plan review

Refinement not needed: two slices, each one cohesive outcome over the same
three-journey proof loop, with the evaluation placed after both changes it
measures. No remaining slice-specific concern: the decisive premises (type-only
back-reference, proof route, step-tree extraction, consumer set) are observed
above, and diagnostics are reobserved in slice 2.
