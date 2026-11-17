# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `dashboard/src/story-review-touch.css` | changed path |
| `story-review-touch.css` | basename of `dashboard/src/story-review-touch.css` |
| `story-review-code` | supplied |

## Scope

Whole checkout at `4298fddeb0c3`, including uncommitted and untracked files: 7024 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `dashboard/src/story-review-touch.css`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/src/DiffLineNumber.tsx` | `story-review-code` | 39: `const pane = root.current?.closest(".story-review-code");` | run: complete phone/tablet touch surface plus context, line Follow up, panes and retained review selection; inspect reviewPanes/code height, scroll and pageFits assertions |
| `dashboard/src/story-review-diff.css` | `story-review-code` | 20: `.story-review-diff > .story-review-code {` | run: complete phone/tablet touch surface plus context, line Follow up, panes and retained review selection; inspect reviewPanes/code height, scroll and pageFits assertions |
| `dashboard/src/StoryReview.tsx` | `story-review-touch.css` | 28: `import "./story-review-touch.css";` | run: complete phone/tablet touch surface plus context, line Follow up, panes and retained review selection; inspect reviewPanes/code height, scroll and pageFits assertions |
| `dashboard/src/StoryReviewDiffLines.tsx` | `story-review-code` | 183: `className="story-review-code"` | run: complete phone/tablet touch surface plus context, line Follow up, panes and retained review selection; inspect reviewPanes/code height, scroll and pageFits assertions |

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/tests/sidePanelWidthPage.ts` | `story-review-code` | 34: `".story-review-code",` | reused: mouse-only width helper purpose is unchanged by any-pointer:coarse minimum; whole review pane geometry separately renewed |

### Test support or stand-in

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/tests/support/reviewPanes.ts` | `story-review-code` | 18: `export const codePane = (diff: Locator) => diff.locator(".story-review-code");` | run: complete phone/tablet touch surface plus context, line Follow up, panes and retained review selection; inspect reviewPanes/code height, scroll and pageFits assertions |
| `dashboard/tests/support/reviewTouchReading.ts` | `story-review-code` | 43: `const pane = element.closest(".story-review-code") as HTMLElement;` | run: complete phone/tablet touch surface plus context, line Follow up, panes and retained review selection; inspect reviewPanes/code height, scroll and pageFits assertions |

### Journey or feature

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `e2e/review/story-review-diff-context.spec.ts` | `story-review-code` | 153: `const scroller = el.closest(".story-review-code");` | run: complete phone/tablet touch surface plus context, line Follow up, panes and retained review selection; inspect reviewPanes/code height, scroll and pageFits assertions |

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/AGENT-LAUNCH-REVIEW.md` | `story-review-touch.css` | 202: `` values also scroll within their disclosure (`src/story-review-touch.css`). `` | excluded: maintained guidance describes behavior; no runtime consumer |

## Changed geometry and proof

Whole real review/ plus Intent Addnote/Followup initially returned102 passed and1 failed (3.0m). The phone rotation assertion at storyReviewTouchContext.ts:98 expected code height>=40 and observed2. New workspace file actions consumed the short landscape pane. No assertion changed. A coarse-pointer code minimum of var(--control-size) preserves a usable code viewport; the existing scrollable review body handles controls that need more room. story-review-touch.css remains50lines.
Full touch spec and exact-endpoint workspace journey passed5 (16.2s): phone/tablet choose/read and preserve file, comparison and both reading positions through rotation/panelcontrols; code>=40/44, pageFits, no rereads, touch reachability and close focus all retained. Renewed other geometry/line-context consumers separately. Earlier102 behavioral observations remain applicable outside this CSS minimum and were not described as a fully green initial command.

Terminal renewal: real context expansion, line Follow up (copy plus pointer/keyboard/touch/Escape/outside/revealed context), both pane geometries and both retained review cases passed7 (16.8s). Frontend Intent reuse purpose passed1 (3.3s).
