# Highlight syntax in code diffs

**Identity:** SEED-351#highlight-syntax-in-code-diffs
**Source:** [Highlight syntax in code diffs](../../seeds/SEED-351-highlight-syntax-in-code-diffs.md#highlight-syntax-in-code-diffs)

## Goal and scope

A developer reviewing a story reads each file diff with its code's syntax
styled while the change stays as easy to follow as today. The story section
owns the scope, deferred promises and key examples; this plan adds none.

Assumptions: path extension alone selects the grammar; one token palette
serves Intent's source reading and diffs; no server, contract or new
dependency changes (Shiki 4.6.0 already ships the grammars and palettes).

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
  component both readers use, with `source-lines.css`'s token rule.
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

## Proof ownership

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| Readable colours in Intent; one palette | 1: appearance spec: a keyword and a comment token in Intent source reach 4.5:1 in dark and light, and still change colour with the system appearance. |
| Language by path; lines styled per side; multi-line comment; removed string vs added code; revealed context; change kind kept; copy unchanged; plain for other files | 2: new frontend spec with controlled diff and text answers: keyword and string colours differ on an added, a removed and an unchanged line; a hunk inside a comment is comment-coloured; the removed line is string-coloured where the added one is not; 20 revealed lines carry tokens; line text, markers, numbers and backgrounds equal the plain diff's; selected text of three lines equals the plain text; a `.md` diff has no token element. |
| Readable colours on changed lines, both appearances, live switch | 2: same spec: `expectReadableContrast` on a comment and a keyword token on added, removed and unchanged lines in dark, then light after `setColorScheme`, with no new diff or text request. |
| Arrival; unavailable text; no message | 3: same spec file: with the text answer held the printed lines show plain and complete; released, they gain tokens with the code scroller's position unchanged; an unavailable text answer leaves plain lines and only the existing context problem and Retry; after Retry answers text, lines gain tokens. |
| Unchanged line menus, Follow up, context expansion, binary notes | 2–3: `e2e/review/story-review-diff-context.spec.ts`, `story-review-diff-line-follow-up.spec.ts` and `story-review-panes.spec.ts` stay green unchanged. |
| Maintained words | 2: `STORY-REVIEW-FILES.md` describes syntax styling of diffs; `sourceHighlight.ts`'s header names the palettes in use. |

## Decisive premises

Observed on 2026-11-15 at `f03e95948` in the preparation workspace, with the
integration checkout's `node_modules` linked for the observation (same
`package-lock.json`) and the link and scratch edits removed afterwards.
Playwright ran as
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list <selection>`.

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| Today's palettes fail 4.5:1 on changed lines | Slices 1–2 palette choice | Scratch Node script: Shiki 4.6.0 `codeToTokensWithThemes` over TypeScript, Python, Java, shell and Gherkin samples, WCAG ratio against `--surface`/`--raised-surface` with `--ready`/`--problem` mixed at 14% (`appearance.css`, `story-review-diff.css`). github-light: 2.5–3.7 on changed lines, 3.2–4.45 plain; github-dark: 2.4–2.9 on changed lines, 3.35 plain (comments). Confirmed. |
| A shipped palette pair reaches 4.5:1 | Slices 1–2 | Same script over all bundled themes: `github-dark-high-contrast` ≥5.4 on every line kind; `github-light-high-contrast` ≥4.65 plain and 3.65 on changed lines (comment `#66707b`), ≥4.97 once its tokens are mixed 25% toward `--text` there. Both modules exist in `node_modules/@shikijs/themes/dist`. Sample-based: a grammar scope outside the samples could differ, and slice 2's browser contrast assertions are the proof. |
| The palette swap keeps Intent's appearance proof | Slice 1 | Scratch edit of `sourceHighlight.ts` to the two high-contrast palettes, then `dashboard-system-appearance`: 1 passed (its build includes the edit: built-app specs build per run). Reverted. |
| A frontend spec can supply a diff and both sides' text by path | Slices 2–3 proof route | Read `tests/support/frontendStoryReviewRoutes.ts`: `fileByPath`, `textByPath`, held and queued answers for both endpoints. Ran `review/`: 3 passed, opening a review and its file diff through these routes. Token rendering in a built-app spec is observed by the appearance spec above. |
| Composed line backgrounds are measurable | Slice 2 contrast proof | Read `tests/accessibleReading.ts`: `expectReadableContrast` composes translucent backgrounds up the parent chain (`colorBehind`), the same translucent `color-mix(… transparent)` form as `.story-review-added`. Existing specs already measure text over such fills this way (`dashboard-system-appearance`, 1 passed above; `intent-ci-cues-dark-contrast`). |
| Whole-side tokenization is quick enough to need no cap | Slice 2 | Scratch Node timing: a 2,446-line TypeScript text tokenized in about 0.2 s. |

## Concerns

Slice-plan refinement was not needed: three slices, each with its own proof
loop, exercising one token-per-side-line rule. This review found no remaining
slice-specific concern.

## Ordered slices

Each slice targets 15 active minutes.

### 1. Intent source tokens reach text contrast
Type: Behavior
Status: planned
Proof: `dashboard/frontend-tests/dashboard-system-appearance.spec.ts` gains a
comment in its highlighted fixture and asserts the keyword and the comment
token at 4.5:1 in dark and in light;
`npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list dashboard-system-appearance`;
`npm run typecheck:dashboard`; `npm run lint`.

Behavior: Intent source with a comment, dark or light appearance → every
token reads at 4.5:1 on the source surface and still follows a live
appearance change. `sourceHighlight.ts` loads `github-light-high-contrast`
and `github-dark-high-contrast` in place of the two palettes it loads now.
Write the failing comment assertion first.

### 2. A file diff styles its code by the file's language
Type: Behavior
Status: planned
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
- CSS: on `.story-review-added` and `.story-review-removed`, the light token
  colour is mixed toward `--text` by the least amount the contrast assertions
  need (25% measured).
- Reword `STORY-REVIEW-FILES.md` and the `sourceHighlight.ts` header.

### 3. Styling arrives without disturbing the diff
Type: Behavior
Status: planned
Proof: cases added to `story-review-diff-syntax.spec.ts` (or a sibling when
it would pass 250 lines) as in the proof table; same commands as slice 2.

Behavior: the diff shows before its text or grammar is read → plain complete
lines; styling arrives → same scroll position, revealed context and line
numbers; a side's text is unavailable → plain lines with only the existing
context problem and Retry, styled after a successful Retry. Correct whatever
the held-answer and Retry cases show; when slice 2's implementation already
satisfies them, the slice delivers the proof alone.

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
