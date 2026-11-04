# Make selected-story Intent easier to scan

**Identity:** SEED-228#compact-selected-story-intent
**Source:** [selected story](../../seeds/SEED-228-compact-selected-story-intent.md#compact-selected-story-intent)
in SEED-228, refined 2026-11-04 from Terry's annotated screenshot of the
selected-story Intent view.
**Source review:** [source-review.md](source-review.md)
**Prepared:** 2026-11-04. Planning only, in the story's established workspace
(branch `claude/make-selected-story-intent-easier-to-scan`, agent ebacky-chan).

## Goal and boundaries

A developer reviewing a selected story in Intent tells at a glance which
story scopes the tree, and tells location headers apart from their files and
folders without mistaking selection for expansion or change. The story's
eight key examples are the evaluation.

Included scope:

- the lens and the story-only scope (`dashboard/src/IntentStoryLens.tsx`,
  `dashboard/src/intent-story-lens.css`) become one compact summary owned by
  the **Intent** reading mode: placed at the top of the locations column in
  `dashboard/src/IntentBrowser.tsx` and above the locations explanations in
  `dashboard/src/IntentPerspective.tsx` (only when the **Intent** tab is
  chosen), no longer above the mode strip;
- the location header styles (`dashboard/src/intent-perspective.css`,
  `dashboard/src/change-kinds.css`, `dashboard/src/IntentLocationGroup.tsx`);
- the Intent guidance `docs/dashboard-development-intent.md`, whose rule that
  folders and locations containing changes share one background is replaced.

Material exclusions (from the story): the lens in **Optimization
Candidates** and **CI status** (CI status keeps its own "Story branch of …"),
keeping the summary's expansion across reloads or in storage, any new way to
clear or change the selected story, and the styles of Review changes' browser
and of Intent's folder and file rows.

Assumptions: apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written throughout, including delegated work and CI repair.

## Direction and PFE

- **One owner for the summary.** `useIntentStoryLens` stays the page-level
  comparison read in `IntentPerspective` and feeds the overlay as now. The
  summary component replaces both `IntentStoryLens` and `StoryChangesScope`
  (one component, one CSS file); the outside count and story-only choice
  exist only when a tree does, so the explanation path passes the summary
  without them. No second lens, no generic disclosure framework: a native
  `<details>`/`<summary>` or a button with `aria-expanded` is the execution's
  choice, provided it is keyboard-operable and announces its state.
- **Visual channels.** Level (location vs. row) takes a header background,
  selection takes the accent background over the whole header, expansion
  stays the caret, and a location's changes take a mark (for example an edge
  or badge in the `--ready` colour) that does not replace the header's own
  background. Folder rows keep the shared contains-changes background. Use
  the existing tokens (`--accent`, `--ready`, `--line`, `--edge`); add no
  new palette.
- **Wording.** ADR 0008's ubiquitous language reserves **Highlight** for the
  Story card; code, tests and docs say "selected background" for a location.
  "Selected story only" and "… outside Intent locations are shown in Review
  changes." keep their words
  ([ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
  Intent stays at its published revision (ADR 0008); nothing here reads
  more.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The lens renders above the mode strip for every mode, and the selected location background covers only the name button, not the caret; unchanged location headers share the page background with rows | Slices 1 and 2 start from it | Headless Chromium against the running dashboard (open-dough, story SEED-192#read-vitest-proof selected, Intent, `tests` selected), screenshots in the job temp directory | Observed as stated |
| Location headers containing changes share the folders' contains-changes background, asserted by a journey | Slice 2 replaces that rule and that assertion | `dashboard/src/change-kinds.css:29-33`; `dashboard/tests/intent-story-changes.spec.ts:111-131` asserts equality | Settled by source read; the journey runs green now (next row) |
| The Intent story journeys run in this workspace | Every slice's proof | `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-story-changes.spec.ts dashboard/tests/intent-story-changes-gaps.spec.ts` after `node scripts/setup-native.mjs npm` and `browser` | 3 passed (13.9 s), 2026-11-04 |
| Without readable locations, `IntentBody` renders an explanation panel shared by **Intent** and **Optimization Candidates**, with no browser | Slice 1 places the summary there only for the **Intent** tab | `dashboard/src/IntentPerspective.tsx:136-180` | Settled by source read; slice 1's journey observes it |

## Outside-in proof

| Story example | Owning slice | Observable signal |
| --- | --- | --- |
| 1 summary in the column, strip under the banner | 1 | `intent-story-changes.spec.ts`: the "Selected story" region sits inside `.intent-locations` before the first location; nothing between the banner and the mode strip; the region holds the story title, the checkbox and the outside count with **Review changes** |
| 2 long title, disclosure | 1 | Same journey with a long-titled story fixture: compact title on one line with the full title as hover text; after the disclosure, the full title, identity and "Compared … with …" revisions |
| 3 disclosure keeps state | 1 | `intent-story-changes-only.spec.ts`: file selected with **Selected story only** on; expand then collapse; same file pressed and read, same folders open, checkbox checked |
| 4 failure with Retry, compact | 1 | `intent-story-changes-gaps.spec.ts`: compact summary says the changes could not be read with **Retry**, which then shows the changes; the unavailable story says so compactly |
| 8 no locations | 1 | New step on a not-configured project with a selected story: summary above "no intent locations are configured"; **Optimization Candidates** shows no summary |
| 5 no story, header vs rows | 2 | `intent-gherkin-groups.spec.ts` (or the browse journey): header computed background differs from transparent folder and file rows |
| 6 selected vs expanded | 2 | Same journey: selected location's caret and name share the selected background across the header's width; an expanded unselected header keeps the location background |
| 7 changed location vs changed folder vs selection | 2 | `intent-story-changes.spec.ts` step rewritten: a changed location header's background differs from a changed folder row's; it carries the change mark an unchanged location header lacks, and keeps it when selected |

Consumers to carry with slice 1 (the summary's text and placement):
`dashboard/tests/support/intentStoryPage.ts` (`lens`, `openReviewFromIntent`
via `.intent-story-outside`), `intent-story-changes.spec.ts` (name text
"Story Story A SEED-A#a"), `intent-story-changes-landed-run.spec.ts`,
`intent-story-changes-gaps.spec.ts`, `intent-story-changes-only.spec.ts`,
`intent-story-changes-marked.spec.ts`, `intent-story-changes-moves.spec.ts`,
`intent-story-completed.spec.ts`, `story-card-selection.spec.ts`, and the
CI status story journeys (`intent-ci-status-story*.spec.ts`) for the lens's
absence there. Revisions and identity are now behind the disclosure, so
readers of `.intent-story-revisions` expand first. Record the trace with the
installed consumer-trace script, adding `--term 'Selected story'` and
`--term 'intent-story-'`.

Local gates: the focused journeys named per slice, then every
`dashboard/tests/intent-*.spec.ts` plus `story-card-selection.spec.ts` before
each publication (the suite covering the changed surface); `npm run
typecheck:dashboard`; `npm run --silent format` before each commit. Hosted
CI runs the full suites after publication and its failures stay owned under
the policy above. A whole local dashboard run, if taken, uses Bash 5 on PATH
and on AC power `caffeinate -s -i`
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).

## Ordered slices

### 1. The selected story is one compact summary at the top of the Intent tab
Type: Behavior
Status: done
Proof: examples 1–4 and 8 in the journeys above, with the consumer list
updated and its trace recorded; a headless screenshot of the compact and
expanded summary at 1400 px and at a width where the tree stacks above the
reading pane, kept in the job temp directory and read before acceptance.

Behavior: a story is selected and Intent shows the **Intent** tab → the
developer reads the locations column, expands and collapses the summary, or
switches modes → the mode strip sits under the banner; one compact summary
heads the column (or the locations explanation) with the title, the
story-only choice, the outside count and action, and any reading, unavailable
or failed state (with **Retry**); the disclosure reveals full title, identity
and revisions or the full explanation without changing selection, tree
expansion or the choice; **Optimization Candidates** and **CI status** show
no summary. `docs/dashboard-development-intent.md` describes the summary in
place of the lens above the strip.

### 2. Location headers stand apart from rows, and selection fills the header
Type: Behavior
Status: done
Proof: examples 5–7 in the journeys above, comparing computed backgrounds of
header, caret, folder row and file row; a headless screenshot with a story
selected (changed and unchanged locations, one selected, one expanded) in
light and dark colour schemes, read before acceptance.

Behavior: Intent shows locations, with or without a selected story → the
developer selects a location or expands another → every header has a
location background distinct from rows; the selected header carries the
selected background caret to edge; expansion shows only by the caret; a
location containing changes shows a change mark that survives selection and
differs from a changed folder row. `docs/dashboard-development-intent.md`
replaces "Folders and locations containing changes share one background".

## Current decisions

- The summary belongs to the **Intent** reading mode, not the perspective;
  CI status keeps naming the story itself.
- Selection by background, expansion by caret, a location's changes by a
  mark; folder rows keep the shared contains-changes background.

## Accepted proof

- Slice 1 (2026-11-04): `npm run typecheck:dashboard`; `env -u NO_COLOR -u
  FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts
  --reporter=list dashboard/tests/intent-*.spec.ts
  dashboard/tests/story-card-selection.spec.ts` → 83 passed after the refactor
  (load about 29). Observations per commitment are in
  [source-review.md](source-review.md). Screenshots of the compact and expanded
  summary at 1400 px, 700 px and on the not-configured explanation were read
  before acceptance.
- Slice 2 (2026-11-04): the same command plus
  `dashboard/tests/story-review.spec.ts dashboard/tests/story-review-tree.spec.ts`
  (they share `change-kinds.css` and `story-review-files.css`) → 85 passed after
  the refactor. Screenshots with and without a selected story, one location
  selected and one expanded, were read before acceptance; the dashboard has no
  dark colour scheme, so dark emulation renders the light palette.

## Learnings

- The Intent tab renders the summary on two paths in turn (the "Reading
  Intent locations…" panel, then the browser), so the disclosure's expanded
  state lives in `IntentPerspective` (`expandedStory`), not in the summary.
- The refactor split the files that crossed 250 lines: `IntentStoryComparison.tsx`,
  `useIntentStoryTree.ts`, `useIntentLocations.ts`, and `IntentCandidatesPanel`
  in `IntentCandidatesRecord.tsx`. Slice 2 starts from those.
- A location's selected fill is the file browser's shared selected-row rule
  (`story-review-files.css`), applied to the header; rows are inside `li`,
  the location name is not, so the name takes no fill of its own.
- Changed and unchanged headers are compared through the same header before
  and after deselection, since the story fixture changes both locations.

## Concern evidence

Refinement was not needed: two independent Behavior slices, each one proof
loop over existing journeys, with no repeated special case or hidden
preparation. This review identified no remaining slice-specific concern.

## Execution complete

Product advice: no correction needed; the summary and location headers meet
the story's examples. Terry may judge on screen whether the grey location
header band and the muted green changed-folder background contrast enough;
both are existing-token tints. The dashboard has no dark colour scheme, so
nothing dark-specific was observed.
