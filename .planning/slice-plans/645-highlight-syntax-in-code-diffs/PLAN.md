# Highlight syntax in code diffs

**Identity:** SEED-351#highlight-syntax-in-code-diffs
**Source:** [Highlight syntax in code diffs](../../seeds/SEED-351-highlight-syntax-in-code-diffs.md#highlight-syntax-in-code-diffs)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer reviewing a story reads each file diff with its code's syntax
styled while the change stays as easy to follow as today. The story section
owns the scope, deferred promises and key examples; this plan adds none.

Assumptions: path extension alone selects the grammar; one token palette
and syntax style serves Intent's source reading and diffs; no server,
contract or new dependency changes (Shiki 4.6.0 already ships the grammars
and palettes).

## Existing solution and direction

PFE result: reuse and extend. `dashboard/src/sourceHighlight.ts` already
loads Shiki's core, seven grammars and two palettes on demand and returns
token lines with both appearances' colours; `SourceLines.tsx` and
`source-lines.css` render them. `StoryReviewFileDiff.tsx` already reads the
printed diff and both sides' whole text (`FileLineSides`) for context
expansion. The diff gains no second highlighter, token model or read.

- One rule for every line: a line's tokens are its side's token line at its
  line number, removed lines from the old side and all others from the new
  side. Printed and revealed lines share it through `diffLineItems`.
- The token `<span>` rendering moves out of `SourceLines.tsx` into one shared
  component both readers use. Its shared stylesheet owns token styling;
  source and diff stylesheets own their line layout and backgrounds.
- The whole-text highlighting effect in `SourceLines.tsx` becomes a shared
  hook, retaining plain-first rendering and cancellation of obsolete results.
  Intent uses it once and a diff uses it for each side. The diff owns only
  selecting the side and indexing the token line, not another highlighting
  lifecycle, token model, renderer or colour rule.
- High-contrast GitHub palettes with the light foregrounds mixed 25% toward
  `--text` through that shared token rule keep all readers consistent and
  readable on today's backgrounds. No diff-specific foreground override.
- New logic lives in new modules; expected edits touch no file over 250
  lines (`StoryReviewDiffLines.tsx` 214, `StoryReviewContextGap.tsx` 155,
  `StoryReviewFileDiff.tsx` 156, `SourceLines.tsx` 116, `sourceHighlight.ts`
  123, `story-review-diff.css` 192, `dashboard-system-appearance.spec.ts`
  225). `dashboard/README.md` and `docs/dashboard-development-intent.md` sit
  at 250 and are not edited; the diff's words go in
  `dashboard/STORY-REVIEW-FILES.md`.
- ADR 0008: browser presentation only; product words say “syntax styling”,
  since “Highlight” names the selected Story card. North Star
  ([contrast](../../../docs/dashboard-ux-ui-north-star.md)): 4.5:1 for text.

## Current decisions

The developer requires one cohesive rendering solution and the same syntax
appearance in source and diff reviews. Matching code, language, lexical
context and system appearance means equal computed token colours and syntax
styles, even on added and removed lines. Diff markers, gutters and backgrounds
keep conveying change kind. Intent's explicit syntax hint and the diff's path
are different inputs to the existing grammar registry, not separate engines.

## Proof ownership

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| Readable colours in Intent; shared rendering and lifecycle | 1: appearance spec: a keyword and a comment token in Intent source reach 4.5:1 in dark and light, and still change colour with the system appearance. Existing Intent browsing and target/recovery journeys preserve source text and navigation after extraction. |
| Same solution and external syntax appearance | 1–2: code review traces both readers through the shared highlighter, hook, token component and stylesheet; slice 2 frontend journey supplies identical whole-file text to Intent and a diff and compares computed foregrounds and syntax styles for keyword, identifier, string and comment tokens on every line kind in dark, then light. Deliberately changing only the diff's token colour must fail this comparison. |
| Language by path; lines styled per side; multi-line comment; removed string vs added code; revealed context; change kind kept; copy unchanged; plain for other files | 2: new frontend spec with controlled diff and text answers: keyword and string colours differ on an added, a removed and an unchanged line; a hunk inside a comment is comment-coloured; the removed line is string-coloured where the added one is not; 20 revealed lines carry tokens; line text, markers, numbers and backgrounds equal the plain diff's; selected text of three lines equals the plain text; a `.md` diff has no token element. |
| Readable colours on changed lines, both appearances, live switch | 2: same spec: `expectReadableContrast` on a comment and a keyword token on added, removed and unchanged lines in dark, then light after `setColorScheme`, with no new diff or text request. |
| Arrival; unavailable text or grammar; no message | 3: frontend cases hold text and the grammar module independently: printed lines show plain and complete; released, they gain tokens without changing scroll position, revealed context or an open line menu. Unavailable text leaves plain lines and only the existing context problem and Retry; after Retry answers text, lines gain tokens. A failed grammar load leaves plain code and no added message. |
| Unchanged line menus, Follow up, context expansion, binary notes | 2–3: `e2e/review/story-review-diff-context.spec.ts`, `story-review-diff-line-follow-up.spec.ts` and `story-review-panes.spec.ts` stay green unchanged. |
| Maintained words | 2: `STORY-REVIEW-FILES.md` describes syntax styling of diffs; `sourceHighlight.ts`'s header names the palettes in use. |

## Decisive premises

Retained observations on 2026-11-15 at `f03e95948` in the preparation workspace,
with the integration checkout's `node_modules` linked for the observation (same
`package-lock.json`) and the link and scratch edits removed afterwards.
Playwright ran as
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list <selection>`.

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| Today's palettes fail 4.5:1 on changed lines | Slices 1–2 palette choice | Scratch Node script: Shiki 4.6.0 `codeToTokensWithThemes` over TypeScript, Python, Java, shell and Gherkin samples, WCAG ratio against `--surface`/`--raised-surface` with `--ready`/`--problem` mixed at 14% (`appearance.css`, `story-review-diff.css`). github-light: 2.5–3.7 on changed lines, 3.2–4.45 plain; github-dark: 2.4–2.9 on changed lines, 3.35 plain (comments). Confirmed. |
| A shared foreground rule reaches 4.5:1 without diff-only styling | Slices 1–2 | Fresh observation at `7286966d4`, 2026-11-15: scratch `sourceHighlight.ts` uses both high-contrast palettes; `source-lines.css` mixes light tokens 25% toward `--text` for all readers. `node --input-type=module` calls the real `highlightSourceLines` on samples of all seven grammars, then Playwright Chromium `setContent` paints their eight resulting colours per appearance using the actual `appearance.css`, `source-lines.css`, `story-review-diff.css`. `composedColours.ts` measures unchanged/added/removed over both `--surface` and `--raised-surface`: minimum 4.9498 light, 5.3911 dark; computed foregrounds identical across all line kinds/surfaces. This is palette feasibility, not proof of the unimplemented diff integration. |
| The shared palette keeps Intent's appearance proof and fixes unreadable comments | Slice 1 | Fresh scratch comment assertion using existing `sourceToken` and `expectReadableContrast` in `dashboard-system-appearance`, same literal Playwright command above: fails at 3.7291 with today's palette; passes (1 test, 5.9 s) with both high-contrast palettes and the shared light adjustment. It reads comment and keyword in both appearances and switches live. Scratch edits and dependency symlink reverted before preparation writes. |
| Grammar arrival/failure can be observed at the browser boundary | Slice 3 | At `7286966d4`, scratch appearance spec aborts `/assets/typescript-[^/]+\.js`, observes that request, then checks complete plain source text, zero token spans and no added failure text: 1 passed (8.4 s), same Playwright command/profile. `intent-purpose-case.spec.ts` already holds/releases the corresponding Gherkin module while checking target-line position; reuse that interception pattern. All scratch edits reverted. |
| A frontend spec can supply a diff and both sides' text by path | Slices 2–3 proof route | Read `tests/support/frontendStoryReviewRoutes.ts`: `fileByPath`, `textByPath`, held and queued answers for both endpoints. Ran `review/`: 3 passed, opening a review and its file diff through these routes. Token rendering in a built-app spec is observed by the appearance spec above. |
| Composed line backgrounds are measurable | Slice 2 contrast proof | Read `tests/accessibleReading.ts`: `expectReadableContrast` composes translucent backgrounds up the parent chain (`colorBehind`), the same translucent `color-mix(… transparent)` form as `.story-review-added`. Existing specs already measure text over such fills this way (`dashboard-system-appearance`, 1 passed above; `intent-ci-cues-dark-contrast`). |
| Whole-side tokenization is quick enough to need no cap | Slice 2 | Scratch Node timing: a 2,446-line TypeScript text tokenized in about 0.2 s. |

The retained paths that these observations consume are unchanged between
`f03e95948` and `7286966d4` (checked with `git diff` on the highlighter,
source/diff CSS, appearance spec, colour helpers and frontend review routes).
The CSS probe uses the exact consuming rules and both possible backing
surfaces; ancestry affects contrast only through those composed backgrounds.
It proves the shared palette approach on the samples; execution still owns
actual source/diff equality and contrast proof through the mounted app.

## Concerns

Slice-plan refinement ran: retain all three boundaries. Slice 1 delivers
readable source through the common pipeline, slice 2 integrates the common
pipeline into diffs, and slice 3 isolates asynchronous preservation/recovery
risk. The cumulative rule stays token-line lookup by side and line number;
later cases extend its observations, not its model. Three slices are below
the eight-slice limit; this review found no remaining slice-specific concern.

## Ordered slices

Each slice targets 15 active minutes.

### 1. Intent source tokens reach text contrast
Type: Behavior
Status: done
Proof: `dashboard/frontend-tests/dashboard-system-appearance.spec.ts` gains a
comment in its highlighted fixture and asserts the keyword and the comment
token at 4.5:1 in dark and in light;
`npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list dashboard-system-appearance`;
`npm run test:e2e -- --reporter=list intent/intent-code-browse intent/intent-gherkin-browse`;
`npm run test:dashboard:integrated -- --reporter=list intent/intent-source-target-recovery intent/intent-purpose-case`;
`npm run typecheck:dashboard`; `npm run lint`.

Behavior: Intent source with a comment, dark or light appearance → every
token reads at 4.5:1 on the source surface and still follows a live
appearance change. `sourceHighlight.ts` loads `github-light-high-contrast`
and `github-dark-high-contrast` in place of the two palettes it loads now.
The shared token stylesheet applies the same light adjustment in every
reader. Extract token rendering and the whole-text highlighting hook from
`SourceLines.tsx`, with Intent using both immediately. Keep line wrappers,
copyable text and target-line navigation unchanged. Write the failing comment
assertion first; extraction must not add a second span renderer or effect.

Accepted: comment contrast red at 3.729, then green in
`dashboard-system-appearance`; shared `SourceTokens.tsx`,
`useSourceHighlight.ts` and `source-tokens.css` now own rendering, lifecycle
and the light 25% mix. Learning: `intent-code-browse-java` pinned exact old
palette colours; it now asserts keyword/string difference and a scheme
change. Later diff proof compares colours between readers rather than
pinning palette values.

### 2. A file diff styles its code by the file's language
Type: Behavior
Status: done
Proof: new `dashboard/frontend-tests/review/story-review-diff-syntax.spec.ts`
(≤250 lines, page-object locators beside `tests/support/reviewPanes.ts`) as in
the proof table; `... --reporter=list review/ dashboard-system-appearance`;
`npm run test:e2e -- --reporter=list review/story-review-diff-context review/story-review-diff-line-follow-up review/story-review-panes`;
`npm run typecheck:dashboard`; `npm run lint`.

Behavior: a review's diff of a `.ts` file whose two sides' text is read →
each printed or revealed line's code is token-coloured, removed lines as in
the old file and others as in the new; markers, numbers, backgrounds, copied
text and accessible text are unchanged; tokens on added and removed lines
keep 4.5:1 in both appearances; a `.md` diff stays plain.

- `sourceHighlight.ts`: a path → language function over the story's
  extensions, beside `sourceLanguage`.
- A new module tokenizes each side's text once per file (both sides joined
  from `FileLineSides`' source text) and answers a line's tokens by kind and
  number; `FileDiff` passes the file's path; `diffLineItems` renders the
  marker followed by the shared token component, or the plain text.
- Use slice 1's shared highlighting hook for each side; tokenization is on
  whole text, never individual printed hunks or revealed chunks. Reuse the
  existing grammar loaders and token model. Path mapping lives beside
  `sourceLanguage`, delegating to the same supported grammars.
- Reuse the shared token stylesheet unchanged. Compare actual computed
  colours, font weight/style and text decoration with Intent for matching
  token roles, including added/removed lines, in both appearances. Also
  exercise representative path mapping for each supported grammar, the listed
  extension aliases, renamed paths and a plain unsupported file through
  frontend review responses. Do not test a second highlighter stand-in.
- Reword `STORY-REVIEW-FILES.md` and the `sourceHighlight.ts` header.

Accepted: `diffLineTokens.ts` reads each side's tokens through the shared
hook and renders through `SourceTokens`; three frontend specs
(`story-review-diff-syntax*.spec.ts`) observe line kinds, comment and string
context, 20 revealed lines, plain-twin equality of markers, numbers,
backgrounds, accessible and copied text, 4.5:1 in both appearances, equality
with Intent's computed token styles, and path mapping. A diff-only colour
rule failed the equality check. A line whose tokens do not spell its text
stays plain.

### 3. Styling arrives without disturbing the diff
Type: Behavior
Status: planned
Proof: cases in `story-review-diff-syntax-arrival.spec.ts`, using existing
held/queued answers and browser module interception for grammar failure, as
in the proof table; same commands as slice 2.

Behavior: the diff shows before its text or grammar is read → plain complete
lines; styling arrives → same scroll position, revealed context, line
numbers and open line menu; a side's text is unavailable → plain lines with
only the existing context problem and Retry, styled after a successful Retry. Correct whatever
the held-answer, grammar failure and Retry cases show within the shared
pipeline; when slice 2's implementation already satisfies them, the slice
delivers the discriminating preservation/recovery proof alone.

## Local gates and execution discipline

Apply the linked [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Run Playwright with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES` and
`--reporter=list`. Per [AGENTS.md](../../../AGENTS.md), keep default
timeouts, never use `test.slow()`, and apply MakeMe and page-object selection
before test edits. The focused specs above are the local gate; the full
suites run in hosted CI. The local-gate sleep guard is
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC wrap long or full runs in `caffeinate -s -i`.
