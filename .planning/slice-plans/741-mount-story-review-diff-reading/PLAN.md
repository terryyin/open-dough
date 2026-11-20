# Read a story review's diff emphasis and syntax in mounted cases

**Identity:** SEED-413#mount-story-review-diff-reading
**Source:** [Read a story review's diff emphasis and syntax in mounted cases](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#mount-story-review-diff-reading)
**Source review:** [Source-only commitments](source-review.md)

## Execution context

- Story Branch Mode, publisher `dashboard-territory.local-open-dough`, agent
  Shunka-chan, remote `origin`, integration target `main`. The accepted
  Take and initial story-branch base are `4e991ea00624cb78ffdb3c047f96f7100ed5d4ee`
  from starting revision `6faffac1b3632a45f622f3acc05aebcc17aaecf2`.
- Owned workspace `/Users/terryyin/git/open-dough/.worktrees/read-a-story-review-s-diff-emphasis-and-syntax-i`,
  branch `codex/read-a-story-review-s-diff-emphasis-and-syntax-i`.
  Integration checkout `/Users/terryyin/git/open-dough`.
- GitHub Actions `ci.yml` (CI), observing the story branch. Codex coordinator
  `shunka-741`, observer directory `/tmp/dough-ci-501/watch-KeMUBs`,
  PID 23134, stream session 1808, cell `g44:14`.
- Slice 1 accepted on the story branch at
  `c87a616154910043189fe0f8a2cb58b482b8e0ce` and registered with this
  observer. Its candidate used the Take revision as its suffix base.
- Slice 2 accepted on the story branch at
  `25052be823395ed2057735af3d6260e6effd12a7` and registered with the same
  observer. Its candidate used slice 1 as its suffix base.
- Slice 3 accepted on the story branch at
  `44add151125fbd7bad1811a180eab78013b4c9ef` and registered with the same
  observer. Its candidate used slice 2 as its suffix base.
- Slice 4 accepted on the story branch at
  `30eb1f3f98c14b9f854fa215f39886c150c56a6f` and registered with the same
  observer. Its candidate used slice 3 as its suffix base.
- Slice 5 accepted on the story branch at
  `a3563cf186b557b084c5f219bbdc1597ca46f1d2` and registered with the same
  observer. Its candidate used slice 4 as its suffix base.

## Goal and scope

Dashboard developers read how a reviewed file's diff marks changed words and
styles its code as plain Vitest cases on mounted Chromium, built from a
printed diff and the file's two texts. The cases move out of eight built-app
`dashboard/frontend-tests/review/story-review-diff-*` specs (22 cases, 54.5
summed seconds in CI run 44741808717).

Two owners carry the moved cases:

- `DiffLines` in `dashboard/src/StoryReviewDiffLines.tsx`, as it is today.
  Its typed inputs are `printed`, `sides`, `lineTokens`, `textProblem`,
  `contextReading`, `onRetryText` and the two optional line callbacks.
- The styled reading of one file, extracted from `FileDiff` in slice 2. Its
  typed inputs are the file's path, the printed diff, the file's text when
  read (`ReviewedFileText` of kind `text`), an optional `syntax` hint, and
  what `DiffLines` already takes for the context problem, Retry and line
  callbacks. It needs no provider and makes no request.

These cases stay built-app cases in the parent story, each in its present
spec: the Retry that reads a file's text again and a grammar that fails to
load (`story-review-diff-syntax-arrival`), which Intent settings revision
supplies a hint, including the published Done review
(`story-review-diff-syntax-intent-hints`), and the comparison with Intent's
source reading (`story-review-diff-syntax-appearance`). A spec that keeps a
case keeps its file and its support.

## Key examples and proof

| Example | Observation and owner |
| --- | --- |
| A changed word | `DiffLines` over the `limit.txt` diff marks `20` as a deletion and `25` as an insertion, underlined and not struck through, with no mark on the unchanged line. Selecting both lines copies the two plain lines. Slice 1. |
| No emphasis where it would mislead | A pure addition, a revealed context line, a low-similarity rewrite and the several-hundred-line block show no marks, and the small block beside the large one marks `20` and `25`. A rewrap, a split call and a re-indent mark only what changed. Slice 1. |
| Each side styles from its own whole text | The styled reading of a TypeScript diff gives a removed line the old text's tokens and other lines, revealed context included, the new text's. Markers, numbers and backgrounds equal the plain diff's. Slice 3. |
| The path chooses the grammar, then the hint | Each supported extension styles its keyword. A rename follows its new path. A path with no grammar is plain, takes a known hint, stays plain under an unfamiliar one, and a path's grammar wins over a hint. Markdown, JSON and CSS tokens take distinct colours. Slice 3. |
| Styling arrives in place | The reading shows complete plain lines with marks before its text is given. Given the text, the same lines gain tokens, marks stay on the same words, and the reading position, revealed context and an open line menu are kept. Slice 4. |
| Readable in both appearances | Under dark and light, a token inside an insertion or deletion reads at 4.5:1 on the composed tint, the underline at 3:1 against the line, added, removed and unchanged tokens read at 4.5:1, and the colours differ between appearances with no new input given. Slice 5. |
| The moved cases cost less | The focused command's elapsed time before and after, and each mounted case's time. Slice 6. |

## Decisions and existing owners

- Follow the
  [test support North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Which entry a case uses](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and the [improvement ADR](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Mount through `mountComponent`. Render and act directly, with no `act`
  wrapping and no `IS_REACT_ACT_ENVIRONMENT`, and wait through
  `expect.element` and `expect.poll`.
- The extraction moves presentation only. `FileDiff` keeps both
  `useReviewRead` calls, `useDiffStoryNote`, `useDoneStoryFollowUp`, the
  Retry round and the status messages, and renders the extracted reading with
  what it read. `useDiffLineTokens` and `textLines` move with the reading.
  The story-review workspace and Intent's story view keep calling `FileDiff`
  unchanged.
- Cases state their diffs and texts as typed values in the spec or in a
  case-data module beside the specs. The word-emphasis diffs now in
  `dashboard/test-support/support/diffWordEmphasisFixtures.ts` move there
  when their last built-app consumer moves. Tokens for a case that observes
  them arriving come from the production `highlightSourceLines`.
- One page object beside the specs reads a diff: a line by its new or old
  number, its insertions and deletions, its tokens, the revealed lines and
  the copied selection. The Playwright selectors in
  `dashboard/test-support/support/reviewDiffSyntax.ts` stay for the retained
  built-app cases and E2E.
- Colour scheme is set through CDP `Emulation.setEmulatedMedia` and cleared
  when the case ends. Contrast uses the pure colour math in
  `dashboard/test-support/composedColours.ts`, composed in the page by the
  diff page object.
- Before deleting a built-app case, list it with the mounted case that
  carries each of its assertions in the slice's delivery note. Two completed
  families lost an assertion at this step.

## Decisive premises observed

Preparation base `815ccb9c7`, 2026-11-20, this owned worktree, AC power, Node
24.21.0, `npm ci`, one-minute load 12–14. Each observation ran a scratch spec
under `dashboard/frontend-tests/` through
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:frontend -- <spec> --workers=2`
and the scratch spec was removed afterwards.

| Consuming operation | Observation and result | Limit and consequence |
| --- | --- | --- |
| `DiffLines` mounts alone with `printed` and `sides` and shows word emphasis (slice 1) | Mounted with the `limit` diff and both texts through `mountComponent`. The insertion read `25`, the deletion read `20` with `text-decoration-line: underline`, and **Show 20 preceding lines** revealed the omitted list. Passed. | One diff shape. The other six shapes use the same input. |
| Production tokens reach `DiffLines` in the mounted page (slices 3 and 4) | In the same case `highlightSourceLines(text, "typescript")` answered in the page, and a rerender with those tokens put `.source-token` spans inside the insertion while it still read `25`. The whole case took 776 ms. | The hook `useDiffLineTokens` was not mounted. Slice 2's extraction is its first mounted caller, and slice 3 fails early if a grammar does not load there. |
| Appearance follows an emulated colour scheme in a mounted case (slice 5) | CDP `Emulation.setEmulatedMedia` with `prefers-color-scheme` switched `matchMedia` both ways. The insertion's underline read `rgb(164, 223, 193)` in dark and `rgb(27, 110, 60)` in light, and the line's tint changed with it. Passed in 34 ms. | Chromium reports the tint as `color(srgb … / 0.14)`. Slice 5 confirms `composedColours.ts` reads that form and extends the page object's reading if it does not. |
| The built-app cases are the baseline (slice 6) | CI run 44741808717 at `93235af49`: word emphasis 13.4 s (7 cases), composition 6.9 s (3), syntax 3.4 s (1), paths 6.1 s (1), languages 6.5 s (3), appearance 4.3 s (1), arrival 9.3 s (4), hints 4.6 s (2). | Hosted time. Slice 6 takes the local focused baseline at the execution base before the first move. |

## Slices

### 1. Changed words read as marks on a mounted diff

Type: Behavior
Status: done

Take the local focused baseline first: run the eight built-app specs alone,
three times, and keep the elapsed times for slice 6. Then mount `DiffLines`
for the seven cases of `story-review-diff-word-emphasis.spec.ts`, with the
diff page object and the case data beside the specs, and remove the built-app
file.

**Proof.** The mounted word-emphasis spec passes with all seven titles. One
scratch break in `emphasizedRangesByLine` (drop the similarity limit) fails
the rewrite case and is reverted.

**Local baseline.** All three runs of the plan's focused frontend command
passed with two workers at clean `4e991ea00` on the AC-powered execution
Mac, Node 24.21.0. Elapsed times were 30.924, 29.209 and 28.382 seconds
(median 29.209 seconds). One-minute load at launch was 7.49. The run
records are `baseline-{1,2,3}.log.run.json` in the checkout's Git evidence
directory.

**Observed.** The seven old titles each have a mounted counterpart with the
same title in `story-review-diff-word-emphasis-mounted.spec.ts`. The seven
mounted cases and the three retained composition cases passed together. The
scratch break gave the rewrite unexpected word marks, and the similarity limit
was restored. The case and assertion map is in `slice-1-return.md`, and the
actual mixed selection is in `slice-1-restored-diffs.proof.json`.

### 2. The styled reading of one file stands alone

Type: Structure
Status: done

Extract from `FileDiff` the component that turns a path, printed diff, read
text and hint into styled `DiffLines`. `FileDiff` keeps its reads, notes and
Follow up and renders it. This enables slice 3's mounted syntax cases.

**Proof.** `npm run typecheck:dashboard`. The seven remaining built-app
`story-review-diff-*` specs pass unchanged, with
`review/story-review-notes.spec.ts` and the other review, Intent story and
E2E readers of a file diff that the consumer trace names.

**Observed.** `StyledFileDiff` owns the two sides and syntax tokens.
`FileDiff` still owns both service reads, Retry, notes and Follow up.
Typecheck passed, and the reached readers passed 75 frontend and 81 E2E
cases with no retries, including all 15 cases in the seven retained diff
specs. The exact selections, observed assertions and trace are in
`slice-2-return.md` in Git evidence.

### 3. A file's path and hint style each side of its diff

Type: Behavior
Status: done

Mount the extracted reading for the syntax case, the paths case, the three
language cases, and the hint-to-grammar assertions of the first hints case:
a path-silent file under a known hint, an unfamiliar hint, and a path grammar
that wins. Remove `story-review-diff-syntax.spec.ts`, `-syntax-paths` and
`-syntax-appearance-languages`. Leave in the hints spec the assertions about
where a hint comes from.

**Proof.** The mounted syntax specs pass. One scratch break that reads a
removed line's tokens from the new side fails the per-side case and is
reverted.

**Observed.** The moving syntax examples produced 30 mounted cases, and all
44 focused cases passed across the mounted and retained readers. The scratch
break lost the old line's visible keyword and was restored. The live and
published Done hint provenance cases passed in their built-app spec. The
case and assertion map is in `slice-3-retirement-map.md`, and exact proof
and consumer dispositions are in `slice-3-return.md` in Git evidence.

### 4. Styling arrives without moving the reader

Type: Behavior
Status: done

Mount the extracted reading without text, then give it the text. This covers
the complete plain lines gaining syntax and the composition case that sees
the same words marked before and after tokens. For the case with revealed
context, mount the same reader with text on a path that has no grammar, reveal
the lines and open the line menu, then give the mounted reader a TypeScript
hint. `DiffLines` derives its available context from the text, so this case
starts with text and uses the production highlighter when styling arrives.
The Retry and failed-grammar cases stay in `story-review-diff-syntax-arrival.spec.ts`.

**Proof.** The mounted arrival spec passes. The reading position is compared
as the same line's measured place across text or styling arrival, including
the case whose context was already revealed.

**Observed.** All three moved cases passed through the mounted reader. The
same line's measured position stayed fixed in both scrolled examples. All
20 revealed lines gained syntax under the same line menu, and the same
changed words remained marked when their text arrived. All 44 focused cases
and typecheck passed, with the exact coverage map and commands in
`slice-4-retirement-map.md` and `slice-4-return.md` in Git evidence.

### 5. Marks and tokens stay readable in dark and light

Type: Behavior
Status: done

Mount the two remaining composition cases and the contrast assertions of the
appearance case under both colour schemes, switching the scheme without
giving the component new input. Remove
`story-review-diff-word-emphasis-composition.spec.ts`. Leave in the
appearance spec the comparison with Intent's source reading.

**Proof.** The mounted appearance spec passes in both schemes. One scratch
break that removes the dark underline colour fails the 3:1 assertion and is
reverted.

**Observed.** The three mounted appearance cases passed, including 4.5:1
token and 3:1 underline checks in both schemes. Removing the dark deletion
colour failed the underline check at 2.10:1 and was reverted. The retained
built-app case confirms source appearance equivalence and no file reads
through both scheme readings. All 48 focused cases and typecheck passed.
Proof and coverage are in `slice-5-return.md` and
`slice-5-retirement-map.md` in Git evidence.

### 6. The moved cases leave their support and show their cost

Type: Behavior
Status: done

Remove each `dashboard/test-support/` export or module left with no consumer
(`diffWordEmphasisOpen.ts`, `diffWordEmphasisFixtures.ts`, and unread exports
of `reviewDiffSyntax.ts` and `syntaxGrammar.ts`). Run the mounted specs with
the retained built-app specs three times, interleaved with a rerun of the
baseline revision when load differs, and record elapsed time and time per
mounted case in the parent story's
[state section](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#frontend-group-state-after-seven-families),
with the cases left built-app and their owner.

**Proof.** The recorded comparison, the support line count before and after,
and a list pairing every removed built-app title with its mounted case.

**Observed.** All six interleaved focused runs passed. The 22 built-app
baseline cases took 38.85, 31.57 and 24.37 seconds. The revised selection
of 43 mounted and five retained built-app cases took 21.41, 17.96 and
13.18 seconds, a 43% reduction in median elapsed time. The five audited
support files fell from 568 to 220 lines. The parent state records
retained owners, loads and per-case medians. The three retained Intent
grammar cases, exact fixture comparison and typecheck passed. See
`slice-6-return.md` and `slice-6-retirement-map.md` in Git evidence.

## Case migration

Spec names in the table omit the common `story-review-diff-` prefix and
`.spec.ts` suffix. The slice returns record the observing assertions.

| Built-app spec | Original title | Mounted proof |
| --- | --- | --- |
| `word-emphasis` | changed words in a block are deletions and insertions; copy stays plain | Same title in `word-emphasis-mounted`. |
| `word-emphasis` | a three-line rewrap gaining a word emphasizes only that word | Same title in `word-emphasis-mounted`. |
| `word-emphasis` | splitting a call across lines emphasizes the added comma, indent and argument | Same title in `word-emphasis-mounted`. |
| `word-emphasis` | re-indent emphasizes the changed whitespace on both lines | Same title in `word-emphasis-mounted`. |
| `word-emphasis` | a pure addition and revealed context have no word emphasis | Same title in `word-emphasis-mounted`. |
| `word-emphasis` | a low-similarity rewrite stays line-level with no word emphasis | Same title in `word-emphasis-mounted`. |
| `word-emphasis` | a several-hundred-line block stays line-level while a small block is emphasized | Same title in `word-emphasis-mounted`. |
| `syntax` | a TypeScript diff styles each line by its side's whole text and keeps the plain diff's change facts | Same title in `syntax-mounted`. |
| `syntax-paths` | each supported extension and a rename's new path style the diff; other files stay plain | The supported path, renamed path and plain path cases in `syntax-paths-mounted`. |
| `syntax-appearance-languages` | a modified README heading and fence take distinct token colours while markers and backgrounds stay | Same title in `syntax-languages-mounted`. |
| `syntax-appearance-languages` | a JSON property name and string value take distinct colours from each other and punctuation | Same title in `syntax-languages-mounted`. |
| `syntax-appearance-languages` | a removed CSS property and colour value differ and stay readable when appearance switches | Same title in `syntax-languages-mounted`. |
| `syntax-arrival` | a diff shown before its text is read stays plain and complete until the text arrives | Same title in `syntax-arrival-mounted`. |
| `syntax-arrival` | styling that arrives after the diff keeps the reading position, revealed context and an open line menu | Same title in `syntax-arrival-mounted`. |
| `word-emphasis-composition` | emphasis is present before tokens arrive and stays on the same words after | Same title in `syntax-arrival-mounted`. |
| `word-emphasis-composition` | styled changed words keep token colours inside insertions and deletions | Same title in `syntax-appearance-mounted`. |
| `word-emphasis-composition` | emphasized tokens and underlines stay readable in light and dark | Same title in `syntax-appearance-mounted`. |

The composition case's file-read assertion stays with `FileDiff` in the
retained `syntax-appearance` case. It observes both appearance readings
before the Intent navigation.

| Narrowed built-app case | Mounted proof and retained owner |
| --- | --- |
| Intent syntax hints style path-silent diffs; path grammar, outside Intent and unfamiliar hints stay as today | The known hint, rename, unfamiliar hint and path precedence cases run in `syntax-paths-mounted`. The retained `syntax-intent-hints` case observes the live snapshot revision, the configured and renamed files, and the outside-location file. |
| diff tokens read at 4.5:1 in both appearances and match Intent's source reading of the same code | `diff tokens on added, removed and unchanged lines read at 4.5:1 in both appearances` runs in `syntax-appearance-mounted`. The built-app `syntax-appearance` case compares the diff and Intent readers and checks for additional file reads. |

## Local gates and review

- Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page objects](../../../.agents/skills/dough-page-objects/SKILL.md) to the
  new specs, and the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to every failure. Keep default test timeouts and never use `test.slow()`.
  On AC power use `caffeinate -s -i` under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Focused frontend command:
  `npm run --silent test:dashboard:frontend -- review/story-review-diff --workers=2`,
  prefixed with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
  For a mixed selection, inspect the
  `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` to confirm both engines ran.
  The mixed word-emphasis and composition run reported both engines there,
  although the foreground output listed only the Vitest cases.
- Run `npm run typecheck:dashboard` and `npm run lint` for each slice. Run
  the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  over slice 2's extraction and each slice's removed support, and run every
  reached consumer. The full frontend group runs in CI.
- Expected production edits touch `StoryReviewFileDiff.tsx` (163 lines) and
  one new file. `StoryReviewDiffLines.tsx` (237 lines) is not edited. Split
  a mounted spec by outcome before it passes 250 lines.
- Slice-plan refinement was not needed: each slice has one owner and one
  proof loop, and slice 2 is the only preparation, placed before the
  behavior it enables. No slice-specific concern remains.
