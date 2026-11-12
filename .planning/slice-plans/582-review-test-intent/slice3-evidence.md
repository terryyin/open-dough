# Slice 3 acceptance evidence

Current review checkout/branch and accepted base `2d09261f65209cb7c6c719f170b5fe8f383ea7eb`
were verified against both proof records. Generic older temporary handoff/singular
proof-command files belong to another completed SEED-300 story and are excluded.

# Slice 3 implementation return

57 TypeScript files are owned, listed in /tmp/seed300-slice3-changed-paths.txt.
No plan/record, fixture/domain-data, production, commit, publication or formatting change.

| Source commitment | Actual observation |
| --- | --- |
| 19,27 | tree/tree-collapse retain caller file order, selected first/nested row, kind/title/accessibility facts, Enter/Tab input; file-moves walks the exact supplied order and preserves disabled/focus/scroll checks. |
| 20,28 | panes/file-moves retain exact diff text, separate code/browser scroll, zero top on a new file, fixed geometry; fluent and Intent comparisons retain chosen-file/diff facts. |
| 21,29 | full diff-context test retains twenty-line direction/count input, exact text/number arrays, no duplicates/EOF behavior, force-click reading-place threshold, failed-read printed diff and Retry. Line-count spec keeps exact count/description values and binary/mode-only absence. |
| 22,23 | tree keyboard focus, pane scroll/focus, all four touch viewport journeys and one-shot held-answer race retain exact inputs, selected file, reading positions and independent geometry/request observations. |

Owners: reviewTreeRows provides changedFilesList/listedFile/fileDiff/fileLineCounts;
reviewPanes provides codePane/diffLines/diffHeading; expandContextDiff owns context
expansion/hunk lookup. Existing fluent and procedural callers delegate without
new actions/waits. Matching options and scope are carried unchanged; treeFolder
also serves the existing regex-named folder controls.

Proof, all terminal first attempts:
- Four representative tree/context/pane/fluent cases passed in 29.580s.
- All 48 changed specs plus touch and both fluent specs: 104 cases/51 specs,
  strict passed, retry 0, 817.343s (13m37.3s).
- Final dashboard typecheck and git diff --check passed.
- Source inspection preserves 1,289 matcher argument/order entries, 251 input
  calls, all test/step titles and 180 explicit exact:true options per file.
  The earlier broader 1,292 count included three ordinary conversion methods.
- No sleep/wake event in either proof window; see sleep-log.json.

Literal commands: /tmp/seed300-slice3-proof-commands.txt.
Results: /tmp/seed300-slice3-{representative,cohort}-proof.json.
Complete trace: /tmp/seed300-slice3-consumer-trace.md (147 rows: 6 run, 7 reused,
134 excluded; changed sources are listed separately and all changed specs ran).

Trace follows actual helper calls through comparison, file movement, panes,
context/retry, both touch journeys, fluent replacement/switching and native/live/
completed Intent-to-review equality. Prior slice-2 observations are reused only
for named unchanged readers after inspecting exact query/scope/wait equality.
The existing Intent diffCode facade now purely delegates to codePane(scope),
which expands to the exact original scope.locator(".story-review-code"). Other
unchanged Intent workflows are not newly claimed as runtime-verified; the current
changed Intent cases exercise both Purpose and Review query scopes. Unchanged
exports/types, generic names, production definitions and independent DOM probes
are excluded with per-row reasons. No functional consumer contract changed.

Before/after and cost: /tmp/seed300-slice3-benefit-cost.md and counts.json.
All edited files remain within 250 after in-memory formatting preview; no disk
formatting ran. No timeout, skip, retry, causal wait or assertion was weakened.
No runtime failures or remaining implementation gaps. Mechanical compile errors
from an import/name collision were corrected before the passing final typecheck.

Host decision: awake/lid open on battery, one worker under caffeinate -i; at
cohort launch battery 36%, load 9.91/19.22/19.43. No other owned heavy proof.
Freshness was settled by the coordinator at pinned trunk 3e104c841 before cohort.
Approximately 36 minutes elapsed including the 13m37s cohort.

# Finding 2 — tree, file and diff reading

Compared both audit `7eab3d6ca` and preparation `47b348b3a`. Full representative
tree/context sources are retained at `/tmp/seed300-slice3-<revision>-<spec>`;
Git retains the originals. Counts are in `/tmp/seed300-slice3-counts.json`.

| Playwright locator mechanics | Audit sites/files | Preparation sites/files | Current |
| --- | --- | --- | --- |
| File-diff region | 47/27 | 47/27 | 1 owner |
| Code pane | 26/16 | 10/7 | 1 owner |
| Rendered diff lines | 18/5 | 18/5 | 1 owner |
| File line-count label | 9/6 | 9/6 | 1 owner |
| Named changed-file count lists | 91/34 | 91/34 | 0 raw count-name lookups; 1 changedFilesList owner |

The differing audit/preparation code-pane counts include earlier product changes;
not every historical reduction is attributed to this slice. Independent DOM
geometry probes remain literal and inspectable; these counts concern Locator sites.

Both baselines' nested-file example repeats button/region/heading/CSS plumbing:

```ts
await files.getByRole("button", { name: "Added dashboard/src/a.tsx" }).press("Enter");
const diff = review.getByRole("region", { name: "Added dashboard/src/a.tsx" });
await expect(diff.getByRole("heading", { level: 3 })).toHaveText("Added dashboard/src/a.tsx");
await expect(diff.locator("li.story-review-line")).toHaveText(["+added"]);
```

The current source states the same selected file, Enter input and independent facts:

```ts
await listedFile(files, "Added dashboard/src/a.tsx").press("Enter");
const diff = fileDiff(review, "Added dashboard/src/a.tsx");
await expect(diffHeading(diff, { level: 3 })).toHaveText("Added dashboard/src/a.tsx");
await expect(diffLines(diff)).toHaveText(["+added"]);
```

Context reading names `contextExpansion(beforeGap, /Show 20 preceding/)` beside
its unchanged click/Enter/tap input and exact expected lines/numbers. Tree order,
selected-row state, counts, scroll/focus, reading place and geometry stay at their
original observing boundaries. No helper derives an expected value or completes a read.

Formatted cost compared with this slice's base `2d09261f`: existing owners grow
24 lines in reviewTreeRows, 12 in reviewPanes, 9 in expandContextDiff and 5 in the
fluent StoryReview facade. Across all 57 edited files, formatted source falls
from 9,194 to 9,161 lines (33 fewer); maximum is 249. There is no new framework,
module or fluent conversion. The existing small owner APIs reduce scattered
mechanics while retaining explicit inputs/outcomes. That maintenance/readability
gain justifies the 50 owner lines under ADR 0010; no human-time or suite-speed
improvement is claimed. Later freshness work remains slice 4's responsibility.

## Literal commands

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice3-representative-proof.json caffeinate -i npm run test:dashboard -- '/dashboard/tests/review/story-review-tree.spec.ts' '/dashboard/tests/review/story-review-diff-context.spec.ts' '/dashboard/tests/review/story-review-panes.spec.ts' '/dashboard/tests/navigation/side-panel-content-replacement.spec.ts' --grep "a story's changed files|directional gutter controls|a large review's browser|a review, another story's review" --workers=1
OPEN_DOUGH_DASHBOARD_PROOF_RECORD='/tmp/seed300-slice3-cohort-proof.json' caffeinate -i npm run test:dashboard -- '/dashboard/tests/intent/intent-done-landed-review-mode\.spec\.ts$' '/dashboard/tests/intent/intent-done-review-modes\.spec\.ts$' '/dashboard/tests/intent/intent-story-changes-landed-run\.spec\.ts$' '/dashboard/tests/intent/intent-story-changes-marked\.spec\.ts$' '/dashboard/tests/intent/intent-story-changes\.spec\.ts$' '/dashboard/tests/intent/intent-story-completed\.spec\.ts$' '/dashboard/tests/intent/intent-story-review-return\.spec\.ts$' '/dashboard/tests/navigation/side-panel-content-replacement\.spec\.ts$' '/dashboard/tests/navigation/side-panel-content-switching\.spec\.ts$' '/dashboard/tests/navigation/side-panel-width-covering\.spec\.ts$' '/dashboard/tests/navigation/side-panel-width\.spec\.ts$' '/dashboard/tests/review/recently-done-one-shot-review\.spec\.ts$' '/dashboard/tests/review/story-review-commit-races\.spec\.ts$' '/dashboard/tests/review/story-review-commit-ranges\.spec\.ts$' '/dashboard/tests/review/story-review-commit-refresh\.spec\.ts$' '/dashboard/tests/review/story-review-commit-renames\.spec\.ts$' '/dashboard/tests/review/story-review-commit-trunk\.spec\.ts$' '/dashboard/tests/review/story-review-commit-worktree\.spec\.ts$' '/dashboard/tests/review/story-review-commits\.spec\.ts$' '/dashboard/tests/review/story-review-comparison-files\.spec\.ts$' '/dashboard/tests/review/story-review-comparison\.spec\.ts$' '/dashboard/tests/review/story-review-completed-merge-edits\.spec\.ts$' '/dashboard/tests/review/story-review-completed\.spec\.ts$' '/dashboard/tests/review/story-review-diff-context\.spec\.ts$' '/dashboard/tests/review/story-review-file-moves\.spec\.ts$' '/dashboard/tests/review/story-review-landed\.spec\.ts$' '/dashboard/tests/review/story-review-line-counts\.spec\.ts$' '/dashboard/tests/review/story-review-mark\.spec\.ts$' '/dashboard/tests/review/story-review-nothing\.spec\.ts$' '/dashboard/tests/review/story-review-one-shot-choice-races\.spec\.ts$' '/dashboard/tests/review/story-review-one-shot-choice\.spec\.ts$' '/dashboard/tests/review/story-review-one-shot-unavailable\.spec\.ts$' '/dashboard/tests/review/story-review-one-shot\.spec\.ts$' '/dashboard/tests/review/story-review-panes\.spec\.ts$' '/dashboard/tests/review/story-review-refresh\.spec\.ts$' '/dashboard/tests/review/story-review-since-trunk\.spec\.ts$' '/dashboard/tests/review/story-review-since\.spec\.ts$' '/dashboard/tests/review/story-review-story-branch-landed\.spec\.ts$' '/dashboard/tests/review/story-review-touch\.spec\.ts$' '/dashboard/tests/review/story-review-tree-collapse\.spec\.ts$' '/dashboard/tests/review/story-review-tree\.spec\.ts$' '/dashboard/tests/review/story-review-trunk-own-changes\.spec\.ts$' '/dashboard/tests/review/story-review-trunk-own-flagged\.spec\.ts$' '/dashboard/tests/review/story-review-trunk-own-older-git\.spec\.ts$' '/dashboard/tests/review/story-review-trunk-own-since\.spec\.ts$' '/dashboard/tests/review/story-review-trunk-worktree-ambiguity\.spec\.ts$' '/dashboard/tests/review/story-review-trunk-worktree\.spec\.ts$' '/dashboard/tests/review/story-review-uncommitted-check-refresh\.spec\.ts$' '/dashboard/tests/review/story-review-uncommitted-check\.spec\.ts$' '/dashboard/tests/review/story-review\.spec\.ts$' '/dashboard/tests/sessions/recently-done-sessions-select-ad-hoc-review\.spec\.ts$' '--workers=1'
npm run typecheck:dashboard
git diff --check
node /tmp/seed300-slice3-preservation.mjs
```

Freshness unchanged at `3e104c8411f9c6553eb94ecabd16156c77b5834e`; prior named-sibling
inspection still applies, with no new trunk movement or product change. Incoming
convention compatibility is part of independent refactor review. The existing
branch configuration remains fixed for the live CI observer.

Resource at acceptance: battery27%, estimated42 minutes, load22.24/21.71/20.67;
lid open/awake. Optional AC-availability question pending; no required proof was
deferred. Independent `/root/refactor3` removed the redundant private diffCode alias;
its two internal sites now call codePane directly. Public reader/query/wait
boundaries and runtime proof are unchanged. Typecheck and diff check passed;
no browser rerun. Trace `/tmp/seed300-review-582-refactor3-consumer-trace.md`:14
reused/61 excluded. Final formatted total is two lines below the earlier cost
comparison (35 fewer than base). All files remain within250; no gaps.
`## REFACTOR COMPLETE`.
