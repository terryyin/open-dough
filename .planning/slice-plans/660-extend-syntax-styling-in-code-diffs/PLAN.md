# Extend syntax styling in code diffs

**Identity:** SEED-377#extend-syntax-styling-in-code-diffs
**Source:** [Extend syntax styling in code diffs](../../seeds/SEED-377-extend-syntax-styling-in-code-diffs.md#extend-syntax-styling-in-code-diffs)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

A developer reviewing a story gets syntax styling on Markdown, JSON, CSS and
YAML file diffs through the shared highlighter SEED-351 already uses. The
story section owns the scope, deferred promises and key examples; this plan
adds none.

Assumptions: path extension alone still selects the grammar for diffs; Intent
`syntax` hints gain the four new language ids for the same grammars; no
server, contract or new dependency (Shiki already ships the language modules);
one shared palette and style rule stay as today.

## Existing solution and direction

PFE result: change the existing shared highlighter. `dashboard/src/sourceHighlight.ts`
owns on-demand grammar loading, `pathLanguage`, `sourceLanguage` and
`highlightSourceLines`. Diffs consume it through `diffLineTokens.ts` /
`useSourceHighlight` / `SourceTokens`; Intent through `sourceLanguage` and the
same pipeline. Extending `languageLoaders`, `extensionLanguages` and the
Intent hint switch keeps one representation
([ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)).
Story review does not load Intent locations. Product words stay “syntax
styling” ([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
North Star text contrast 4.5:1 remains the readability bar.

## Current decisions

Diffs keep path-only language selection. Intent-hint fallback in diffs,
word-level emphasis and a styling control stay deferred as the seed records.

## Proof ownership

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| `.md`, `.json`, `.css`, `.yaml` / `.yml` diffs style by path; rename by new path; unmapped path stays plain | 1: extend `story-review-diff-syntax-paths.spec.ts` — move md/json into styled set with a keyword/token assertion, add css and yaml/yml cases, keep an unmapped extension (e.g. `.txt`) plain |
| Markers, backgrounds, copy unchanged for a new-language line | 1: existing `story-review-diff-syntax.spec.ts` change-kind / copy cases stay green; path spec still asserts `+` plus code text on styled lines |
| 4.5:1 on a new-language token on changed lines, both appearances | 1: extend `story-review-diff-syntax-appearance.spec.ts` (or equivalent) with one Markdown or JSON token on an added line through `expectReadableContrast` in dark and light |
| Intent `syntax` hint names markdown / json / css / yaml → same grammar | 1: `intent-location-syntax.spec.ts` (or `sourceLanguage` cases it already drives) accepts the four hints |
| Maintained words | 1: `STORY-REVIEW-FILES.md` and `sourceHighlight.ts` header name the eleven path grammars |

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| `@shikijs/langs` modules for `markdown`, `json`, `css` and `yaml` load under the dashboard's Shiki 4.6.0 stack | Slice 1 grammar registration | 2026-11-16 in this preparation workspace, `dashboard/`: dynamic `import("@shikijs/langs/<id>")` for each of the four ids succeeded (`OK object`). |
| Tokens from those grammars under the existing high-contrast palettes and light `color-mix` rule meet 4.5:1 on unchanged / added / removed approximate surfaces | Slice 1 contrast proof viability | 2026-11-16 standalone Node probe (no product edit): `createHighlighterCore` + both github-*-high-contrast themes; samples for markdown, json, css, yaml; light foregrounds mixed 25% toward text; WCAG contrast against white/`#0d1117` with 14% ready/problem mixes. Minimum ratio **8.96** (markdown, dark, added). Feasibility only; execution still owns mounted-app contrast proof. |
| Path proof today treats `.md` / `.json` as plain and lists every styled extension | Slice 1 proof rewrite | Read `dashboard/frontend-tests/review/story-review-diff-syntax-paths.spec.ts`: `styled` holds the seven-language extensions; `plain` is `README.md` and `data.json` with `codeTokens` count 0. Extending that table is the discriminating route. |

## Concerns

Slice-plan refinement was not needed: one Behavior slice, one cumulative rule
(extend the existing grammar registry and path/hint maps), below the
eight-slice limit. This review found no remaining slice-specific concern.

## Ordered slices

Each slice targets 15 active minutes.

### 1. Diffs and Intent style Markdown, JSON, CSS and YAML
Type: Behavior
Status: done
Proof: update
`dashboard/frontend-tests/review/story-review-diff-syntax-paths.spec.ts` as in
the proof table; keep
`story-review-diff-syntax.spec.ts`,
`story-review-diff-syntax-appearance.spec.ts` and
`story-review-diff-syntax-arrival.spec.ts` green with any appearance case for
a new-language token;
`dashboard/backend-tests/intent/intent-location-syntax.spec.ts` covers the
new hints;
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list review/story-review-diff-syntax review/story-review-diff-syntax-paths review/story-review-diff-syntax-appearance review/story-review-diff-syntax-arrival`;
`npx playwright test --config dashboard/backend.playwright.config.ts --reporter=list intent/intent-location-syntax` (or this project's equivalent backend Intent syntax command);
`npm run typecheck:dashboard`; `npm run lint`.

Behavior: a story-review diff whose path is `.md`, `.json`, `.css`, `.yaml` or
`.yml` → line code is token-coloured through the shared highlighter; a rename
follows the new path; a path with no mapped extension stays plain; Intent
source reading styles when its `syntax` hint is `markdown`, `json`, `css` or
`yaml`; markers, numbers, backgrounds, copy, arrival and 4.5:1 on both
appearances stay as SEED-351 left them.

- `sourceHighlight.ts`: add the four language loaders; map the listed
  extensions in `pathLanguage`; accept the four hints in `sourceLanguage`.
- No second highlighter, token model, stylesheet or Intent-locations load in
  story review.
- Reword `STORY-REVIEW-FILES.md` and the module header for the extended set.
- Before changing tests, apply MakeMe and page-object selection for the
  dashboard frontend / backend Intent entries.

## Story obligations

### G1. Intent-hint language selection for diffs
Reported: slice 1 — "Styling a story-review diff by a project's Intent `syntax` hint when the path's extension names no grammar"
Story clause: "Styling a story-review diff by a project's Intent `syntax` hint when the path's extension names no grammar"
Disposition: excluded "Styling a story-review diff by a project's Intent `syntax` hint when the path's extension names no grammar"
Commitment: X1

### G2. Word-level change emphasis
Reported: slice 1 — "Emphasis of the changed words within a changed line"
Story clause: "Emphasis of the changed words within a changed line"
Disposition: excluded "Emphasis of the changed words within a changed line"
Commitment: X2

### G3. Styling on/off or palette control
Reported: slice 1 — "A control to turn styling off or choose a palette"
Story clause: "A control to turn styling off or choose a palette"
Disposition: excluded "A control to turn styling off or choose a palette"
Commitment: X3

## Local gates and execution discipline

Apply the linked
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Run Playwright with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES` and
`--reporter=list`. Per [AGENTS.md](../../../AGENTS.md), keep default
timeouts, never use `test.slow()`, and apply MakeMe and page-object selection
before test edits. The focused specs above are the local gate; the full
suites run in hosted CI. The local-gate sleep guard is
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC wrap long or full runs in `caffeinate -s -i`.

## Learnings

- Developer-authorized seed amend: Markdown fence may match plain under shared
  high-contrast themes; heading stays distinct from plain and fence.
- Appearance proof for new languages lives in
  `story-review-diff-syntax-appearance-languages.spec.ts` after the post-change
  file-size split; the TypeScript contrast/Intent-match suite stays in
  `story-review-diff-syntax-appearance.spec.ts`.
- Plain companion paths in syntax fixtures must sort before the styled path so
  auto-open does not consume a one-shot unavailable answer (`base.txt` before
  `greet.ts`).
