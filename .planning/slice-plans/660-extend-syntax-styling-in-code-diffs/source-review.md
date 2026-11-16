# Source-only review — SEED-377#extend-syntax-styling-in-code-diffs

Launch: fresh general-purpose agent (no conversation inheritance) after the
developer-authorized seed amendment (README fence may match plain under shared
themes). Input was only the selected story Goal, Scope, key examples, UI and
deferred exclusions from
`.planning/seeds/SEED-377-extend-syntax-styling-in-code-diffs.md#extend-syntax-styling-in-code-diffs`.
No plan, product, proof or current-slice scope was supplied. Reviewer read no
other project files.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reviewing a story in the dashboard gets syntax styling on Markdown, JSON, CSS and YAML file diffs — languages SEED-351 left plain. | slice 1 | observed: story-review-diff-syntax-paths.spec.ts styled md/json/css/yaml/yml |
| 2 | That styling uses the same shared highlighter and appearance Intent's source reading already uses. | slice 1 | observed: sourceHighlight.ts shared loaders + appearance Intent match for TS |
| 3 | More of the files they read scan as structured text without making changes harder to follow. | slice 1 | observed: paths+appearance new-language tokens; markers/backgrounds kept |
| 4 | Extend the shared on-demand highlighter (`dashboard/src/sourceHighlight.ts`) so story-review file diffs style four further languages by path, keeping every SEED-351 constraint. | slice 1 | observed: sourceHighlight.ts languageLoaders/pathLanguage/sourceLanguage |
| 5.1 | Languages added by path: Markdown (`.md`) | slice 1 | observed: paths.spec.ts README.md keyword token |
| 5.2 | Languages added by path: JSON (`.json`) | slice 1 | observed: paths.spec.ts data.json keyword token |
| 5.3 | Languages added by path: CSS (`.css`) | slice 1 | observed: paths.spec.ts a.css keyword token |
| 5.4 | Languages added by path: YAML (`.yaml`, `.yml`) | slice 1 | observed: paths.spec.ts a.yaml/a.yml keyword tokens |
| 6 | A renamed file is still styled by its new path. | slice 1 | observed: paths.spec.ts rename old.txt→new.ts and settings.yaml→settings.yml |
| 7 | Any other file whose extension names none of those grammars stays plain text. | slice 1 | observed: paths.spec.ts notes.txt and rename to .txt zero tokens |
| 8 | Intent's source reading and story-review diffs keep one highlighter, token model, rendering and style rule. | slice 1 | observed: sourceHighlight.ts single module; diffs+Intent consumers unchanged owners |
| 9 | The new grammars load through that same owner. | slice 1 | observed: sourceHighlight.ts markdown/json/css/yaml loaders |
| 10 | When Intent's `syntax` hint names one of the new languages, Intent's source reading styles with it. | slice 1 | observed: intent-location-syntax.spec.ts markdown/json/css/yaml hints |
| 11 | Diffs keep selecting language by path. | slice 1 | observed: pathLanguage only; no Intent locations in story review |
| 12 | Matching code in the same language, lexical context and system appearance has the same token colours in both views. | slice 1 | observed: appearance.spec.ts TS diff tokens equal Intent source reading |
| 13 | Each line keeps its `+`, `-` or space marker. | slice 1 | observed: story-review-diff-syntax.spec.ts markers; appearance README +/- |
| 14 | Each line keeps its line numbers. | slice 1 | observed: story-review-diff-syntax.spec.ts lineFacts include numbers |
| 15 | Each line keeps its added or removed background. | slice 1 | observed: story-review-diff-syntax.spec.ts backgrounds; appearance added/removed classes |
| 16 | Copied code stays the plain markers and text. | slice 1 | observed: story-review-diff-syntax.spec.ts selectedText equals plain copy |
| 17 | Token colour never replaces markers, line numbers, or change backgrounds (nor replaces them in copied code). | slice 1 | observed: story-review-diff-syntax.spec.ts copy/markers/backgrounds equal plain |
| 18 | Every token meets the North Star's 4.5:1 text contrast against the composed background of its line, on added, removed and unchanged lines, in light and dark. | slice 1 | observed: appearance.spec.ts TS + appearance-languages JSON/CSS expectReadableContrast dark/light |
| 19 | A system appearance change restyles tokens already shown. | slice 1 | observed: appearance-languages CSS dark≠light; appearance.spec.ts TS scheme switch |
| 20 | No diff-only palette. | slice 1 | observed: no palette module; shared github-*-high-contrast only |
| 21 | The diff shows as plain text first. | slice 1 | observed: story-review-diff-syntax-arrival.spec.ts plain-first |
| 22 | Styling arrives when the file's text and grammar are ready. | slice 1 | observed: story-review-diff-syntax-arrival.spec.ts styling when ready |
| 23 | Arrival does not move the reading position. | slice 1 | observed: story-review-diff-syntax-arrival.spec.ts reading position |
| 24 | Arrival does not close an open line menu. | slice 1 | observed: story-review-diff-syntax-arrival.spec.ts line menu |
| 25 | Arrival does not collapse revealed context. | slice 1 | observed: story-review-diff-syntax-arrival.spec.ts revealed context |
| 26 | When text or grammar cannot be read, affected lines stay plain with no new message. | slice 1 | observed: arrival unavailable stays plain; no new message surface |
| 27 | Unchanged: Line Follow up. | slice 1 | observed: story-review-diff-syntax.spec.ts Follow up unchanged (SEED-351) |
| 28 | Unchanged: context expansion and Retry. | slice 1 | observed: story-review-diff-syntax.spec.ts context expansion; Retry surface unchanged |
| 29 | Unchanged: binary and no-textual-diff notes. | slice 1 | observed: no change to binary/no-textual-diff notes |
| 30 | Unchanged: what assistive technology reads of each line. | slice 1 | observed: story-review-diff-syntax.spec.ts ariaSnapshot equals plain |
| 31 | No new control, label or message. | slice 1 | observed: no new control/label/message in product diff |
| 32 | The reviewer only sees syntax styling on paths that were plain under SEED-351 when those paths are Markdown, JSON, CSS or YAML. | slice 1 | observed: paths.spec.ts md/json/css/yaml styled; was plain under SEED-351 |
| 33 | Change kind stays told by marker and line background; syntax only by the colour of the code's characters. | slice 1 | observed: syntax.spec + appearance markers/backgrounds vs token colour |
| Q1 | Diffs still select language by path only (including under deferred Intent-hint wiring). | slice 1 | observed: diffs pathLanguage only |
| Q2 | This repository's current Intent `sources` already use extensions `pathLanguage` covers. | slice 1 | observed: PROJECT-CONFIGURATION.md sources use path extensions |
| Q3 | Under shared high-contrast themes, a fence token may match plain text colour. | slice 1 | observed: amended seed + appearance-languages README heading≠fence/plain; fence may match plain |
| Q4 | CSS removed-rule colouring is read from the old whole file. | slice 1 | observed: stylesheetDiff removed line from old whole file fixture |
| Q5 | Intent hint alternatives for the new languages: `markdown`, or `json`, or `css`, or `yaml`. | slice 1 | observed: intent-location-syntax.spec.ts four hint cases |
| Q6 | TypeScript (`.ts`) remains styled as today. | slice 1 | observed: paths.spec.ts a.ts still styled |
| E1 | Modified `README.md`: heading colour distinct from plain text and from the fence; under shared high-contrast themes the fence may match plain; added keeps `+` and ready background; removed keeps `-` and problem background. | slice 1 | observed: appearance-languages.spec.ts README heading≠fence/plain; +/- backgrounds |
| E2 | `config.json` property name and string take different colours from each other and punctuation; markers and change backgrounds stay. | slice 1 | observed: appearance-languages.spec.ts JSON name≠value≠punctuation; marker/class |
| E3 | `.css` removed rule: property and value colours differ; appearance switch restyles at 4.5:1 on that line's background. | slice 1 | observed: appearance-languages.spec.ts CSS --accent≠#ff0000; contrast+appearance switch |
| E4 | Renamed `settings.yaml` → `settings.yml` styled as YAML by the new path. | slice 1 | observed: paths.spec.ts settings.yaml→settings.yml YAML token |
| E5 | Intent `syntax` hint `markdown`/`json`/`css`/`yaml` uses the same new grammar and appearance as the matching path diffs. | slice 1 | observed: intent-location-syntax + shared sourceHighlight grammars |
| E6 | `.ts` still styled; unmapped path (e.g. `scripts/setup.test`) stays plain. | slice 1 | observed: paths.spec.ts a.ts styled; notes.txt plain |
| E7 | Copy three styled JSON lines → clipboard matches plain diff: markers and code, no line numbers. | slice 1 | observed: story-review-diff-syntax.spec.ts copy equals plain markers+code |
| X1 | Styling a story-review diff by a project's Intent `syntax` hint when the path's extension names no grammar — deferred. | | G1 |
| X2 | Emphasis of the changed words within a changed line — deferred. | | G2 |
| X3 | A control to turn styling off or choose a palette — deferred. | | G3 |
