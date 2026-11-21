# Read System settings' sections and the Usage charts in mounted cases

**Identity:** SEED-413#mount-system-settings-sections-and-usage-charts
**Source:** [Read System settings' sections and the Usage charts in mounted cases](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#mount-system-settings-sections-and-usage-charts)
**Source review:** [Numbered source review](source-review.md)

## Execution context

Story Branch Mode in the dashboard-owned worktree, branch
`codex/read-system-settings-sections-and-the-usage-char`. The established
claim `0759aff061bdf15d18ed216fe045454f4b5d67d4` is on `origin/main`
and the published story branch. Starting revision `17fe6c2c4`.
Sola-chan, publisher `dashboard-territory.local-open-dough`.

GitHub Actions `ci.yml` observer for the story branch
(`sola-chan-seed413-749`, `/tmp/dough-ci-501/watch-GxjafV`, PID 95092,
Codex session 14239 and cell g114:13).

Before any changes, the nine built-app specs passed three times at the claim
revision. Wall time was 25.624, 26.558 and 36.570 seconds with two workers,
Node 24.21.0, AC power, 55% free memory before launch, and one-minute load
5.53, 7.47 and 12.23 at the three launches. Run records and per-file times
are in the checkout's Git evidence directory as `slice1-baseline-*`.

## Goal and scope

Dashboard developers read the proof of the Usage charts and of the OpenAI,
terminal theme and Projects settings as plain Vitest cases on mounted
Chromium, with each setting and Token index answer given as a typed reply.
Nine built-app specs in `dashboard/frontend-tests/configuration/` move
(29 cases, 48.3 summed seconds in CI run 44855532096):

- `system-settings-usage-average`, `-compare`, `-legend`, `-overflow` and
  `-spacing` (20 cases) onto `SystemSettingsUsage` over its existing
  `UsageSource`;
- `system-settings-openai` (4 cases) onto `OpenAISettings`;
- `system-settings-terminal-theme` (2) onto `TerminalThemeSettings` under
  `SavedTerminalThemeProvider`;
- `system-settings-project-management-touch` (1) and `project-add-dialog`
  (2) onto `ProjectsSettings` under `ProjectsOnPage`.

`dashboard-system-appearance`, `project-hide-selection`,
`system-settings-navigation`, `system-settings-look`, the
`e2e/configuration/` journeys and the full-group timing comparison stay as
they are.

## Key examples and proof

| Example | Observation and owner |
| --- | --- |
| Medians and above-scale tasks | The rolling median is distinct above dots in light and dark and never enlarges ordinary geometry. A one-million median and a 65-million task show separately. An in-scale median breaks across above-scale observations and all-large medians stay explicit. At a narrow window and at 200% zoom the day control, task actions and overflow values read without hovering. Slice 1. |
| The compared key | The key and summary swatches show each shown tool's marks, a hidden tool leaves the key, and the compared key fits without sideways scroll in light and dark at each viewport. Slice 1. |
| Two tools compared | Both tools share one time axis and scale with their own medians, units and notes, keeping each task's tool through inspection. Marks differ by shape, partial ones keep the caution stroke, and the selected task is the one larger diamond. An empty tool says so and a failed read names its tool. Tool choices work by keyboard and a compared point opens by touch in light and dark without sideways scroll. Slice 2. |
| Large tasks and equal spacing | Large tasks keep their values and dates. Coincident 65,000,000 and 70,000,000 tasks stay separate by pointer, touch and keyboard with partial details and focus return. Exactly fifty million stays ordinary and measured zero keeps an honest scale. Equal spacing gives each task one slot in completion order, keeps medians on their tasks and restores time positions; an above-scale median stands at its task's slot; spacing works by keyboard and touch in both appearances. Slice 3. |
| Setting sources keep the refusal wording | Each page source turns a refused read or change into the endpoint's own message or its section's fallback. Slice 4. |
| A held OpenAI status | A held status read released after a save, a Remove, or a save after a refused read cannot overwrite the result. On touch the password draft and configured key survive reduced height, rotation, a refused save and explicit recovery. Slice 5. |
| Terminal theme and Projects | Light and Solarized samples keep their palette while the section follows the appearance. On touch a refused Solarized Dark save keeps the saved theme shown and Retry is reachable after rotation. On touch at reduced height a refused project save retries with the exact draft. An origin mismatch stays linked to the path, keeps both inputs and saves nothing; Cancel and Escape save nothing, return focus and keep arrows inside the modal. Slice 6. |
| The moved cases cost less | The focused command's elapsed time before and after, and each mounted case's time. Slice 7. |

## Decisions and existing owners

- Follow the
  [test support North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Which entry a case uses](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and the [improvement ADR](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Mount through `mountComponent`. Render and act directly, with no `act`
  wrapping and no `IS_REACT_ACT_ENVIRONMENT`, and wait through
  `expect.element` and `expect.poll`.
- The chart cases reuse what
  [the Usage Token index story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#usage-token-index-reading-after-migration)
  left: `UsageSource`, `makeMe.aTokenIndexAnswer` on `pageMakeMe.mjs`, and
  `system-settings-usage-page.ts` with `system-settings-usage-tools-page.ts`.
  Chart readings (marks, axis, legend, readouts, slots) join those page
  objects or a sibling chart page object beside them. The Playwright
  `usageChartPage.ts`, `usageLegendPage.ts`, `usageSpacingPage.ts` and
  `usageToolsPage.ts` stay while E2E uses them.
- Each section reads and changes through a typed source behind its reading
  hook, as `UsageSource` and `storyNotesState(source)` do: OpenAI's status,
  save and remove; the terminal theme's read and save behind
  `SavedTerminalThemeProvider`; the project settings read and project
  changes. Each page source alone knows its endpoints and refusal wording,
  and is what `SystemSettings` and the page provider pass. A case supplies
  replies of the shared contracts (`openAIConfiguration.ts`,
  `terminalThemeSetting.ts`, `projectConfiguration.ts`).
- Setting answers come from page-loadable MakeMe steps where a builder
  exists (`terminalThemeSettingTestData.mjs`,
  `projectConfigurationTestData.mjs`) once they load in the page; a plain
  typed literal suffices for the one-field OpenAI status.
- A case that observes a pending read or save holds its own deferred reply.
  Neither becomes a shared helper.
- Size and rotation use the mounted viewport (`mountComponent`'s
  `viewport`, `page.viewport`). 200% zoom adds CDP
  `Emulation.setDeviceMetricsOverride` with `deviceScaleFactor: 2` at the
  halved viewport; colour scheme uses CDP `Emulation.setEmulatedMedia`.
  Touch reaches a control with CDP `Input.dispatchTouchEvent`. Each is
  cleared when its case ends.
- Before deleting a built-app case, list it with the mounted case that
  carries each of its assertions in the slice's delivery note. Remove a case
  without a mounted replacement only when an E2E journey proves the same
  thing, and name the journey.

## Decisive premises observed

Preparation base `8e8ea0e28`, 2026-11-21, this owned worktree, AC power, Node
24.21.0, `npm ci`, one-minute load 8–10. Each observation ran a scratch spec
under `dashboard/frontend-tests/configuration/` through
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:frontend -- <spec> --workers=2`,
and each scratch spec was removed afterwards.

| Consuming operation | Observation and result | Limit and consequence |
| --- | --- | --- |
| A mounted chart mark answers touch (slices 1–3) | `mountUsage` over a source answering 65,000,000 and 70,000,000; one CDP `touchStart`/`touchEnd` at the first mark's centre left it pressed as `Nov 1 · Codex · Selected task · 65,000,000 · Large task above 50 million`. 690–759 ms. | Pointer and keyboard selection already run in the mounted `selectPoint`. |
| Zoom and colour scheme reach the mounted page (slices 1–3, 5, 6) | CDP `Emulation.setDeviceMetricsOverride` with `deviceScaleFactor: 2` gave `devicePixelRatio` 2, and `setEmulatedMedia` made `prefers-color-scheme: dark` match. The override's width and height left the frame at 390×844. | The CSS viewport comes from `page.viewport`; CDP sets only the scale factor. |
| Sections mount alone and read (slices 4–6) | `OpenAISettings` alone at 390×500 asked `/__openai-configuration` and showed its configured status 85–96 ms after mount; `page.viewport(500, 390)` then gave `innerWidth` 500 and `innerHeight` 390. `ProjectsSettings` under `ProjectsOnPage` and `TerminalThemeSettings` under `SavedTerminalThemeProvider` asked `/__project-configuration/settings` and `/__terminal-theme`, and showed `Projects`, `Add project`, the project's label and `Sample: Solarized Dark` from a stubbed answer, in 101 ms. | `fetch` stubs stand in for slice 4's sources; they answer the same reads. |
| Built-app baseline (slice 7) | CI run 44855532096 at `be03d5643`: average 6.1 s (5 cases), compare 9.8 s (5), legend 5.2 s (3), overflow 4.6 s (3), spacing 7.7 s (4), openai 5.4 s (4), terminal theme 3.5 s (2), project management touch 2.2 s (1), project add dialog 3.8 s (2). | Hosted time. Slice 1 takes the local focused baseline at the execution base before any change. |

## Slices

### 1. Medians, large values and the compared key read in mounted charts

Type: Behavior
Status: done

Take the local focused baseline first: run the nine built-app specs alone,
three times, and keep the elapsed times for slice 7. Then move
`-usage-average` (5 cases) and `-usage-legend` (3), adding chart readings to
the mounted Usage page objects and the zoom and appearance steps. Remove
both built-app files.

**Proof.** The mounted specs pass with all eight titles. One scratch break
that draws the median at ordinary dot size fails the geometry case and is
reverted.

The [case mapping](case-mapping.md#slice-1) records the eight replacements.
Configuration passed with all 24 mounted cases and the retained built-app
specs. Typecheck passed. Reducing the solitary median to the dot's rendered
width failed the expected geometry assertion, then the production file was
restored and checked before the final Configuration run. See local proof
records `slice1-configuration`, `slice1-typecheck-final` and
`slice1-median-scratch`.

### 2. Two tools compare on one axis

Type: Behavior
Status: done

Move `-usage-compare` (5 cases), each tool answered or refused by its own
source reply. Remove the built-app file.

**Proof.** The mounted spec passes. One scratch break that gives both tools
the same mark shape fails the shape case and is reverted.

### 3. Large tasks and equal spacing keep their places

Type: Behavior
Status: done

Move `-usage-overflow` (3 cases) and `-usage-spacing` (4), selecting by
pointer, CDP touch and keyboard. Remove both built-app files.

**Proof.** The mounted specs pass. One scratch break that merges coincident
large marks fails the coincident case and is reverted.

### 4. Settings sections read and change through typed sources

Type: Structure
Status: done

Give `OpenAISettings`, `SavedTerminalThemeProvider` and `ProjectsSettings`
their typed sources, with the page sources passed by `SystemSettings` and
the page provider. One mounted case per page source proves its refusal
wording. This enables slices 5 and 6.

**Proof.** `npm run typecheck:dashboard`. The built-app
`system-settings-openai`, `-terminal-theme`, `-project-management-touch`,
`-look`, `project-add-dialog` and `project-hide-selection` specs pass
unchanged, and the `e2e/configuration/` OpenAI, terminal theme and project
journeys pass. The page-source cases pass.

### 5. A held OpenAI status cannot overwrite a change

Type: Behavior
Status: done

Move the four `system-settings-openai` cases, each holding its own status
reply. Remove the built-app file.

**Proof.** The mounted spec passes. One scratch break that applies a status
answer arriving after a change fails the held-status cases and is reverted.

### 6. Terminal theme and project changes recover from refusals

Type: Behavior
Status: done

Move `-terminal-theme` (2 cases), `-project-management-touch` (1) and
`project-add-dialog` (2), each refusing or holding its own reply. Remove the
three built-app files.

**Proof.** The mounted specs pass. One scratch break that retries a project
save with an emptied draft fails the touch case and is reverted.

### 7. The moved cases leave their support and show their cost

Type: Behavior
Status: done

Remove each `dashboard/test-support/` export or module left with no
consumer, keeping what the four remaining Configuration specs, other
folders and E2E use. Run the mounted specs three times, interleaved with a
rerun of the baseline revision when load differs, and record elapsed time
and time per mounted case in the parent story's
[state section](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#frontend-group-state-after-seven-families).

**Proof.** The recorded comparison, the support line count before and after,
and a list pairing every removed built-app title with its mounted case or
the E2E journey that owns it.

## Execution complete

Product advice: no change. Keep the remaining frontend families in their
existing order. The focused migration preserved all 29 case identities and
reduced median local elapsed time from 27.731 s to 14.366 s at two workers.
The four framed Settings specs and the end-to-end machine workflows retain
their original boundaries.

## Local gates and review

- Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page objects](../../../.agents/skills/dough-page-objects/SKILL.md) to the
  new specs, and the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to every failure. Keep default test timeouts and never use `test.slow()`.
  On AC power use `caffeinate -s -i` under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Focused frontend command:
  `npm run --silent test:dashboard:frontend -- configuration/ --workers=2`,
  prefixed with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
  A selection mixing both engines runs only its Vitest specs, so run the
  built-app specs by file for their own result. The E2E journeys run through
  `npm run test:e2e -- configuration/`.
- Run `npm run typecheck:dashboard` and `npm run lint` for each slice. Run
  the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  over slice 4's sources and each slice's removed support, and run every
  reached consumer. `SavedTerminalThemeProvider` also serves the terminals,
  so slice 4 runs `terminals/` as its consumer. A builder added to
  `pageMakeMe.mjs` is loaded by every mounted spec, so that slice also runs
  `stories/`, `sessions/sessions-sidebar` and `review/` as page consumers.
  The full frontend group runs in CI.
- Expected production edits touch `OpenAISettings.tsx` (158 lines),
  `savedTerminalTheme.ts` (125), `ProjectsSettings.tsx` (132),
  `SystemSettings.tsx` (77) and small source modules. Split a mounted spec
  by outcome before it passes 250 lines.
- Slice-plan refinement was not needed: three chart slices on an existing
  owner and source, one preparation placed before the two section slices it
  enables, and one proof loop per slice. No slice-specific concern remains.
