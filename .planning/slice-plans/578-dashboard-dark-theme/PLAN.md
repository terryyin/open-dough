# Read the whole dashboard in the system's dark appearance

**Identity:** SEED-278#dashboard-dark-theme
**Source:** [Refined story](../../seeds/SEED-278-dashboard-dark-theme.md#dashboard-dark-theme)

## Goal and boundaries

A developer can read Development and project/story Intent in one coherent dark
appearance following their system, including the evidence behind the work.
Preserve today's light appearance and reading state when appearance changes.
The [approved Story tabs mockup](../../seeds/SEED-275-story-intent-tabs/intent-story-tabs.html)
supplies the dark story-reading reference, not a new layout commitment.

Include the frame, Board/cards/badges, Sessions sidebar, dashboard Side panel
readers and chrome, dialogs, settings, tabs, CI comparison/history, Changed
tests, coverage, source and diffs. Preserve the separately chosen terminal
palette and its sample. No dashboard theme switch, appearance persistence,
per-project choice, terminal policy change, new layout or animation is owed.

## Current decisions and PFE

- Reuse and extend `dashboard/src/styles.css`'s semantic visual roles. Its
  consumers already own surfaces, text, borders, hover, selection and focus
  throughout the product. Keep one definition for each shared meaning; add
  paired foreground/fill roles where a light text color would fail on a newly
  bright status/accent fill. Preserve light values. Do not globally filter the
  page or duplicate palettes per view.
- Normalize the actual remaining fixed dashboard colors: preparation badges
  and dependency-problem fill in `story-cards.css`, the location header in
  `intent-location-group.css`, CI status fallback colors in
  `intent-ci-status.css`, and status-count foregrounds in `sessions-toggle.css`.
  Recheck filled primary controls in `frame-controls.css` on both normal and
  hover backgrounds. Existing `intent-ci-cues.css`, `change-kinds.css`,
  `story-review-diff.css` and `intent-ci-history.css` own cue/diff/chart meanings;
  adapt their role values or composition where actual contrast requires it.
- Reuse `SourceLines.tsx` and `sourceHighlight.ts` for every whole-file source
  reader. The existing highlighter emits inline github-light colors, which
  cannot follow a background token. The installed Shiki supports light/dark
  token variants; keep its current light palette and make both palettes
  available to the existing source rendering. Prefer CSS selection of those
  variants so a system change updates already rendered text without a new
  fetch, navigation, remount, or tokenization. Preserve immediate plain text,
  unsupported-language/failure fallback, copying and line targeting.
- `terminalThemes.ts`, `TerminalThemeSettings.tsx` and xterm own terminal
  colors and explicit palette choices, not dashboard appearance. Keep their
  output and previews independent; theme surrounding controls normally.
- Search of product CSS, inline source styles, terminal configuration and
  existing comparison rendering found these suitable owners. No competing
  theme store/provider or new shared framework is needed. Palette definitions
  may live in a cohesive stylesheet imported by `styles.css` if keeping them
  there would mix responsibilities or exceed the file-size rule.
- Follow [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#spatial-presentation-remains-derived)
  for presentation independent of project facts, and
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  for one representation per meaning. The ADR index and relevant in-file
  statuses agree; no supersession, conflict, exception or new ADR is needed.
  The existing [North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
  and [UX/UI direction](../../../docs/dashboard-ux-ui-north-star.md) support
  this ordinary presentation change; no new North Star topic is warranted.
- No execution mode or trunk-only product step is required by the story. This
  preparation authorizes neither Take nor implementation.

## Outside-in proof ownership

| Story example | Owning observation in slice 1 |
| --- | --- |
| 1: complete dark dashboard frame | A frontend page journey opens the real built app with shared MakeMe-based service facts; checks Board/card/badge, sidebar, Side panel chrome, dialog, settings, error/recovery text and keyboard focus on composed dark surfaces. |
| 2: approved story-reading appearance | An integrated selected Done story visits CI comparison, Changed tests with files shown/hidden and Intent coverage at desktop and 390px; inspect generated captures against the approved dark reference. |
| 3: evidence stays readable | The same story journey covers selected/focused CI-cued rows and diff signs; source browsing covers highlighted and plain fallback text. Mounted comparison rendering covers composed cue variants; a timing chart covers marks/labels and its textual values. |
| 4: system changes preserve reading | Change emulated system appearance on the mounted page both ways, asserting colors update while project/story/file, panel/dialog, source text and reading position persist. Reuse terminal-theme journeys to prove the explicit chosen palette remains effective. |

Use observable rendered color pairs, independent contrast calculations and
meaningful state/text assertions, not equality to the same production token
as proof of legibility. For normal text require at least 4.5:1; for meaningful
control boundaries, focus indicators and chart marks require at least 3:1
against adjacent colors. Resolve opacity and composed cue backgrounds before
measuring. Decorative dividers need no artificial contrast requirement.
Retain textual/sign/line-style meaning alongside colors. Visual review verifies
coherence and the reference relationship; it does not replace contrast proof.

Do not duplicate every existing journey in two appearances. Put new color and
live-change variants in focused frontend/mounted checks, and retain one real
integrated story route. Use `comparisonRendering.ts` for actual production CSS
and components, not copied HTML. All arranged domain data uses the shared
`makeMe.aThing.please()` API and existing publishers; exact source/report input
and independent expectations stay at call sites.

## Premises and observed preparation evidence

Observations below used this owned checkout at
`d07fdaf39699fb539d39394638922dbed9b0b123` on 2026-11-10, Node 24.21.0,
locked Playwright/Chromium 153.0.8010.12, and Shiki 4.5.0. Native setup npm and
`node scripts/setup-native.mjs check` completed. Scratch files and style
injection were removed before canonical writes. These are preparation
observations, not implementation acceptance.

| Premise / consuming operation | Form, result and remaining obligation |
| --- | --- |
| A real page follows shared surface roles, but dark preference currently leaves it light | Temporary frontend spec run with `caffeinate -s -i npm run test:dashboard -- dashboard/frontend-tests/dark-theme-preparation-observation.spec.ts --workers=1`: open `openFrontendTakenBacklog`, change light→dark, then browse a real `SourceLines` test source. Both root backgrounds were `rgb(246, 246, 243)`. Injecting only shared dark surface/text roles changed the root and source background to `rgb(17, 23, 34)`. The page stayed mounted and the source remained visible at 390px. Badge fills and the dark location header stayed pale. Outcome: shared roles are the right seam; changing root values alone is insufficient. |
| Existing highlighted tokens do not adapt with their background | In that same built-page observation the `export` token stayed `rgb(215, 58, 73)` after the source surface darkened. Traced `SourceLines`'s inline color to `sourceHighlight`'s github-light tokenization. Outcome: include token rendering in the same slice, not a later patch. New appearance/contrast assertions remain owed. |
| Shiki can supply both palettes without re-tokenization on system change | Isolated `node --input-type=module` observation loaded the installed `shiki/core`, JavaScript regex engine, TypeScript grammar and github-light/github-dark. `codeToTokensWithThemes` returned both variants for `export const message = "hello";`. Rendered the returned `export` variants as CSS properties in locked Chromium and changed emulated preference: computed color changed from `rgb(215, 58, 73)` to `rgb(249, 117, 131)` with the same text and no new tokenization. This isolates the same library/engine/browser mechanism; the source-file fixture above separately reaches the built React reader. Integration and full token contrast remain the slice's acceptance work. |
| Existing integrated routes reach selected Done-story cues/diffs/coverage and hinted/plain source | `caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-story-ci-cues.spec.ts dashboard/tests/intent/intent-code-browse-sources.spec.ts dashboard/tests/intent/intent-story-completed.spec.ts --workers=1` passed all three journeys in this checkout. The real completed-story fixture reached saved coverage and review/Intent diff equivalence; the cue journey reached composed selection/change marks; the source journey reached hinted and ungrammared files. Their current color-distinction assertions alone do not discriminate a coherent dark theme. Add the rendered dark/contrast assertions described above. |

## Proof, organization and delivery gates

Apply [AGENTS test automation](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. Carry that policy link or its verbatim text into every delegation
brief and repair handoff. Failures, including base failures, remain defects to
repair; preserve any exact repair already owned by another active execution.

Use [Execute Plan](../../../.agents/skills/dough-execute-plan/SKILL.md) for
independent post-change refactoring, proof, commit/delivery, asynchronous CI
repair and eventual wrap-up. Run the installed consumer trace at the actual
diff with `--base HEAD`; include semantic roles, `highlightSourceLines`,
`SourceLines`, and any changed helper exports as terms. Trace through helpers
to observing journeys, recording run/reused/reasoned-excluded dispositions.
Group equivalent visual-role consumers under sufficient real rendering proof;
retain distinct assertions for status, filled controls, source and terminal
content. Server persistence and workflow parsing are unchanged boundaries.

No expected product edit is already over 250 lines: `styles.css` 180,
`story-cards.css` 228, `intent-ci-status.css` 229, `SourceLines.tsx` 107,
`sourceHighlight.ts` 101; the other named stylesheets are smaller. Recheck each
actual edit. Keep a new appearance spec and contrast support cohesive rather
than expanding unrelated large specs; `intent-story-ci-cues.spec.ts` is already
238 lines and should retain its existing case if the new journey lives beside
it. No edit to the already-251-line `agent-launch.css` is currently expected;
if needed, first settle its cohesive reorganization under the existing rule.

Local gate: select [native setup](../../../tests/native-setup.md)'s pinned Node
and Bash 5. Run new appearance/contrast checks plus the current source,
completed-story/cue, frame keyboard/header, System settings terminal-theme,
and terminal-theme journeys affected by the diff. Starting retained routes:
`dashboard/tests/intent/intent-code-browse-sources.spec.ts`,
`intent-story-ci-cues.spec.ts`, and `intent-story-completed.spec.ts`.
Run `npm run typecheck:dashboard` and `npm run lint`. Include additional actual
color/geometry consumers identified by tracing; no full repository run is
required merely for a palette change. Hosted CI failures remain owned through
applicable final CI under the policy above.

Before a long selection inspect load, memory and competing work; keep owned
heavy commands sequential and use one or two browser workers. The preparation
observations ran with one worker on AC at load about 5.8. Start fully awake;
on macOS AC use `caffeinate -s -i` for long/full runs. On battery plug in or
start awake with lid open under `caffeinate -i` and inspect the sleep log,
following [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Use event waits/controlled clocks and default timeouts, never wall-clock waits,
`test.slow()` or suite/group/hook timeout overrides.

## Slices

### 1. Read dashboard work and evidence in the system appearance
Type: Behavior
Status: planned
Proof: All four story examples through the owned observations and local gates above.

Given a dark system preference → open Development and browse the same project's
story in Intent, its evidence and dashboard controls → the whole reading
journey has coherent dark surfaces and legible semantic cues. Change system
appearance while reading → colors update together, reading state and explicit
terminal palette remain, and light restores today's appearance.

Implement shared adaptive role pairs, normalize remaining fixed dashboard
colors and adapt source token rendering together. Cover composed selected,
focused, hovered, error and disabled states, native form appearance and source
fallbacks. Keep proof, visual review, required documentation and local cleanup
with this behavior. Assimilate enduring appearance/terminal-boundary knowledge
into the existing dashboard guide at delivery, rather than leaving it only in
this seed/plan.

## Readiness review

Slice-plan refinement was not needed: one automatic presentation rule owns one
complete reading outcome and proof loop. Splitting root colors from source and
status adaptation would create a temporarily unreadable dark page. Existing
roles/highlighter remain the common model; terminal palette independence is a
real existing user choice. No numeric slice limit is supplied. Reviewed all
four examples, traced consuming seams and observed routes against this slice.
No remaining scope, premise, proof-route, sizing, cumulative-design or
human-owned decision concern was identified. Implementation and its acceptance
proof remain planned.
