# Source-only review — SEED-278#dashboard-dark-theme

**Launch:** Fresh general-purpose reviewer (agent `22e0a88a-aa78-4618-85ed-1ece400d3933`), model inherit, no conversation inheritance.
**Input:** Goal, Scope, key examples, and Scope limits / deferred promises from `.planning/seeds/SEED-278-dashboard-dark-theme.md#dashboard-dark-theme` only. No plan, product, proof, or other project files.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer whose system prefers a dark appearance can read the whole dashboard in a coherent dark theme instead of a light page with a few dark-tuned CI cues. | slice 1 | observed: dashboard/src/appearance.css dark roles + frontend-tests/dashboard-system-appearance.spec.ts dark Board/cards/controls/settings |
| 2 | Work and its evidence remain readable in the same session under that dark theme. | slice 1 | observed: tests/intent/intent-story-dark-appearance.spec.ts Done-story CI/Changed tests/coverage/source/diff/chart under dark |
| 3.1 | Follow the system color-scheme preference across: the dashboard frame | slice 1 | observed: appearance.css --surface/--text on documentElement; expectDarkSurface |
| 3.2 | Follow the system color-scheme preference across: Development | slice 1 | observed: dashboard-system-appearance.spec.ts Development Board/cards under dark |
| 3.3 | Follow the system color-scheme preference across: project Intent | slice 1 | observed: dashboard-system-appearance.spec.ts Open Dough project Intent under dark |
| 3.4 | Follow the system color-scheme preference across: story Intent | slice 1 | observed: intent-story-dark-appearance.spec.ts selected Done story Intent tabs under dark |
| 4.1 | Include dark-theme treatment for: the banner | slice 1 | observed: appearance.css + README; banner consumes shared surface/text roles |
| 4.2 | Include dark-theme treatment for: Board | slice 1 | observed: dashboard-system-appearance.spec.ts Board headings contrast |
| 4.3 | Include dark-theme treatment for: story cards | slice 1 | observed: dashboard-system-appearance.spec.ts story article headings contrast |
| 4.4 | Include dark-theme treatment for: badges | slice 1 | observed: story-cards.css badge role pairs; preparation legend contrast in dashboard-system-appearance.spec.ts |
| 4.5 | Include dark-theme treatment for: Sessions sidebar | slice 1 | observed: dashboard-system-appearance.spec.ts Sessions sidebar heading contrast |
| 4.6 | Include dark-theme treatment for: Side panel chrome | slice 1 | observed: dashboard-system-appearance.spec.ts Side panel/Sessions chrome under dark |
| 4.7 | Include dark-theme treatment for: Side panel dashboard readers | slice 1 | observed: intent-story-dark-appearance.spec.ts Purpose source/diff readers under dark |
| 4.8 | Include dark-theme treatment for: dialogs | slice 1 | observed: dashboard-system-appearance.spec.ts launch dialog + preparation legend dialog contrast |
| 4.9 | Include dark-theme treatment for: System settings | slice 1 | observed: dashboard-system-appearance.spec.ts System settings heading; system-settings-terminal-theme-appearance.spec.ts |
| 4.10 | Include dark-theme treatment for: story tabs | slice 1 | observed: intent-story-dark-appearance.spec.ts chooseStoryTab CI/Changed tests/coverage |
| 4.11 | Include dark-theme treatment for: CI comparison | slice 1 | observed: intent-story-dark-appearance.spec.ts CI comparison region contrast |
| 4.12 | Include dark-theme treatment for: CI history | slice 1 | observed: intent-story-dark-appearance.spec.ts Summary timing history extent/points |
| 4.13 | Include dark-theme treatment for: Changed tests | slice 1 | observed: intent-story-dark-appearance.spec.ts Changed tests files shown/hidden at 1280 and 390 |
| 4.14 | Include dark-theme treatment for: Intent coverage | slice 1 | observed: intent-story-dark-appearance.spec.ts Intent coverage heading and missing-evidence text |
| 5.1 | Keep legible together: surfaces | slice 1 | observed: expectDarkSurface / expectReadableContrast composed backgrounds |
| 5.2 | Keep legible together: ordinary text | slice 1 | observed: expectReadableContrast default 4.5:1 on headings and body |
| 5.3 | Keep legible together: quiet text | slice 1 | observed: quiet text via --quiet; line numbers expectReadableContrast |
| 5.4 | Keep legible together: links | slice 1 | observed: links use --accent adaptive pair in appearance.css |
| 5.5 | Keep legible together: controls | slice 1 | observed: expectPrimaryControlReadable / expectControlContrast |
| 5.6 | Keep legible together: hover | slice 1 | observed: appearance.css --hover; primary hover uses --accent-strong |
| 5.7 | Keep legible together: selection | slice 1 | observed: intent-story-dark-appearance.spec.ts selected file aria-pressed |
| 5.8 | Keep legible together: keyboard focus | slice 1 | observed: expectFocusReadable outline ≥3:1; dashboard-system-appearance.spec.ts Start focus |
| 5.9 | Keep legible together: status cues | slice 1 | observed: intent-ci-cues-dark-contrast.spec.ts composed cue variants; intent-story-dark-appearance cued row |
| 5.10 | Keep legible together: charts | slice 1 | observed: expectChartMarkContrast on history points |
| 5.11 | Keep legible together: source tokens | slice 1 | observed: sourceHighlight codeToTokensWithThemes; source-lines.css --shiki-light/dark; export token contrast |
| 5.12 | Keep legible together: diff marks | slice 1 | observed: story-review-diff.css + intent-story-dark-appearance added/removed line contrast |
| 6 | Use the approved mockup’s dark appearance as the reference for the story-reading surfaces. | slice 1 | observed: intent-story-dark-appearance.spec.ts story-dark-1280/390.png captures vs approved mockup reference |
| 7 | Extend that mockup’s visual relationships to the rest of the existing dashboard. | slice 1 | observed: appearance.css dark role relationships extended beyond story tabs to frame/Board/settings |
| 8 | Changing system appearance while the page is open updates the page’s presentation. | slice 1 | observed: setColorScheme emulateMedia; surfaces/tokens update in both appearance specs |
| 9.1 | That update does not lose: the selected project | slice 1 | observed: dashboard-system-appearance.spec.ts expectProjectChoice Open Dough across light↔dark |
| 9.2 | That update does not lose: perspective | slice 1 | observed: dashboard-system-appearance.spec.ts Intent checked / Development unchecked across light↔dark |
| 9.3 | That update does not lose: story | slice 1 | observed: intent-story-dark-appearance.spec.ts data-selected-story persists across light↔dark |
| 9.4 | That update does not lose: file | slice 1 | observed: dashboard-system-appearance.spec.ts selected highlightedPath source remains across light↔dark |
| 9.5 | That update does not lose: reading place | slice 1 | observed: dashboard-system-appearance.spec.ts source text and export token persist across light↔dark |
| 9.6 | That update does not lose: open panel/dialog | slice 1 | observed: dashboard-system-appearance.spec.ts Sessions sidebar remains open and readable across light↔dark |
| 10 | The light preference keeps today’s appearance. | slice 1 | observed: expectLightSurface restores rgb(246,246,243)/rgb(29,29,27) |
| 11 | Existing labels, signs, line styles, and focus/selection distinctions continue to carry meaning alongside color. | slice 1 | observed: retained cue signs/line styles; focus/selection attributes remain; contrast alongside color |
| 12 | The terminal’s chosen palette keeps its existing meaning independently of dashboard appearance. | slice 1 | observed: system-settings-terminal-theme-appearance.spec.ts Light/Solarized sample palette unchanged under dark chrome |
| 13 | The terminal’s settings sample keeps its existing meaning independently of dashboard appearance. | slice 1 | observed: same spec Sample: label + sampleScreen colours for Light and Solarized Dark |
| 14 | Surrounding dashboard controls of the terminal follow the system appearance. | slice 1 | observed: same spec System settings / Terminal theme headings follow system contrast |
| 15 | This preserves an explicit user choice rather than treating terminal output as dashboard chrome. | slice 1 | observed: terminalThemes untouched; expectNoAppearanceSwitch; sample independent of dashboard roles |
| 16 | Scope limits / deferred promises are delivery limits, not reasons to reject otherwise supported browsing or data. | slice 1 | observed: Scope limits not used to reject browsing; journeys exercise supported Done-story and frame paths |
| 17.1 | Dark system preference → open Development and inspect a story, show Sessions, open a Side panel and a launch/help dialog, or visit System settings → the dashboard surfaces form one dark presentation with readable: controls | slice 1 | observed: dashboard-system-appearance.spec.ts primary/dialog controls under dark |
| 17.2 | … with readable: preparation/status badges | slice 1 | observed: preparation legend badge labels contrast under dark |
| 17.3 | … with readable: quiet notes | slice 1 | observed: quiet notes via --quiet contrast on line numbers / muted CI text roles |
| 17.4 | … with readable: errors | slice 1 | observed: intent-ci-status.css --problem; problem-soft roles for error/recovery surfaces |
| 17.5 | … with readable: keyboard focus | slice 1 | observed: expectFocusReadable keyboard focus under dark |
| 18.1 | Dark system preference and a selected Done story → visit CI comparison, Changed tests with its file sidebar shown and hidden, and Intent coverage → match the dark side of the approved Story tabs mockup at: desktop width | slice 1 | observed: intent-story-dark-appearance.spec.ts viewport 1280 capture story-dark-1280.png |
| 18.2 | … match the dark side of the approved Story tabs mockup at: narrow width | slice 1 | observed: intent-story-dark-appearance.spec.ts viewport 390 capture story-dark-390.png |
| 19 | In that same journey, the coverage report remains readable. | slice 1 | observed: Intent coverage heading/text expectReadableContrast |
| 20 | In that same journey, missing-evidence explanations remain readable. | slice 1 | observed: Intent coverage missing-evidence paragraph expectReadableContrast |
| 21.1 | Dark preference → read a highlighted test source and a changed-file diff, select/focus a row carrying CI cues, and inspect a timing chart → remain distinguishable on their actual composed backgrounds: source text | slice 1 | observed: highlighted source token expectReadableContrast under dark |
| 21.2 | … line numbers | slice 1 | observed: source-line-number expectReadableContrast |
| 21.3 | … additions/removals | slice 1 | observed: story-review-added/removed expectReadableContrast when present |
| 21.4 | … selection | slice 1 | observed: selected file aria-pressed under dark |
| 21.5 | … focus | slice 1 | observed: focused cued file under dark |
| 21.6 | … change marks | slice 1 | observed: expectCueState / composed cue marks under dark |
| 21.7 | … faster/slower cues | slice 1 | observed: slower-light duration cue in intent-story-dark-appearance + mounted cue contrast |
| 21.8 | … chart values | slice 1 | observed: history extent text + chart mark contrast |
| 22 | A plain or ungrammared file stays readable too. | slice 1 | observed: plain notes.check source without spans; expectReadableContrast |
| 23 | An open Intent source with a selected file and reading place → change the system between light and dark → the page and highlighted source update together without navigation or lost reading state. | slice 1 | observed: dashboard-system-appearance + intent-story-dark-appearance live light↔dark without navigation |
| 24 | Returning to light restores today’s appearance. | slice 1 | observed: expectLightSurface after return to light |
| 25 | A terminal using a chosen Light or Solarized palette retains that choice through the same change. | slice 1 | observed: system-settings-terminal-theme-appearance.spec.ts Light and Solarized Dark samples retain palette through scheme flips |
| 26.1 | Outside this increment: a dashboard-specific appearance switch | slice 1 | observed: expectNoAppearanceSwitch: no dark/light mode appearance controls |
| 26.2 | Outside this increment: a saved appearance override | slice 1 | observed: no saved appearance override API/UI added; preference is system-only |
| 26.3 | Outside this increment: a per-project theme | slice 1 | observed: no per-project theme control; project choice unchanged |
| 26.4 | Outside this increment: a new terminal palette policy | slice 1 | observed: terminalThemes.ts / TerminalThemeSettings.tsx untouched; existing palette choice preserved |
| 26.5 | Outside this increment: a layout redesign | slice 1 | observed: no layout redesign; structure/CSS roles only |
| 26.6 | Outside this increment: new animations | slice 1 | observed: no new animations added |
