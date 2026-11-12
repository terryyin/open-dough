# Slice4 freshness portion of finding2 — ADR0010

Comparison: audited source7eab3d6ca, preparation47b348b3a, accepted slice3 base dec6294f22a582e7ec4801749a4e576b380af17a. Scope is Refresh control and snapshot operation ownership; tree/displayed-file gains were accepted in slice3 and are reused unchanged. No suite-speed or human reading-time claim.

Both baseline commit-refresh examples repeated:

```ts
let refreshed = nextSnapshot(page);
await review.getByRole("button", { name: "Refresh", exact: true }).click();
const second = await refreshed;
```

Now the named operation states the answer required by the case:

```ts
const second = await refreshReview(review, { exact: true });
```

The first/second/third/fourth commit setup, selected range, held file diff ready/release/delivery, expected new head/virtual tree and feedback stay in the scenario. The shared operation registers nextSnapshot before pressing, parses its snapshot answer and adds no file/range-read wait. Explicit expectReviewRead remains where refreshed chosen ranges move. chooseCommit's before-and-after waits remain unchanged.

The baseline uncommitted-check-refresh source owns a second local Refresh wrapper (7lines). It is removed in favor of the same snapshot owner; scenario-supplied file arrays, 4/5/7/8 counts, checked/unchecked/absent states, left-out message and binary-request tree/baseline assertions stay visible. Earlier shared displayed-file owners are unchanged.

Keyboard/focus case still shows:

```ts
const refresh = reviewRefresh(review);
await refresh.focus();
await refresh.press("Enter");
// independent refreshed count, old/new diff and focus assertions follow
```

The control alone does not click, await a snapshot, finish a pending read, choose facts or release a response. reviewRead.refreshAndRead still owns feedback waiting; launchLandingReview.refreshReview still owns its separate HTTP boundary/schema parse. Exact matching is preserved at every existing exact:true call; defaults remain false for original partial-name callers. Touch still supplies tapWhereShown and then expectReviewRead, with exact:true as in its generic control predecessor.

Mechanics sites across dashboard/tests, counted by TypeScript AST:

| Refresh mechanics | audit | preparation | accepted slice3 | slice4 |
| --- | --- | --- | --- | --- |
| Direct Refresh button locators |23sites/13files|23sites/13files|23sites/13files|1site/1file|
| Additional generic-control Refresh caller |1 touch owner|1 touch owner|1 touch owner|0; delegates to same reviewRefresh|

All nine region/comparison/run/check declarations moved byte-for-byte from storyReviewMark into reviewControls, with stable public re-exports. This is the provided cohesive seam decision: browser controls separate from mark-store/worktree fixture logic. No query/scope/wait change or wider panel migration. Raw storyReviewMark shrinks247→220lines; new reviewControls is52lines. Existing owner modules plus new module grow28lines combined (including imports/re-exports/options/touch delegate); the ten changed specs shrink24lines, so these15files grow4lines before coordinator-owned formatting. Max raw file size246lines. Final repair fixture selection, if any, must be accounted separately.

The useful result is a readable Refresh operation beside explicit revision/check facts, one selector owner across snapshot/feedback/HTTP/keyboard/touch callers, and removal of repeated mutable nextSnapshot/click/await sequences plus a duplicate local wrapper. These gains justify the28owner lines and one cohesive module. Fewer future control edit sites are a source-structure inference, not an observed rename experiment. Current browser proof and preserved independent assertions support behavior preservation beyond counts. Baseline specimens and exact counts are retained in unique /tmp/seed300-review-582-slice4-{audit,prep}-*.ts and inspection.json; Git retains original sources.

## Delivered cold fixture activation and merged-context proof

The G2 local fixture dependency adds12spec lines and no shared worker registration or new preparation mechanism. It requests existing queuedCodexPreviewReady before private origin setup; two independent cold run records confirm2.943/2.655s origin preparation plus concurrent app/server completion before private requests. Full native3launch/2capture, held/run/file/divider/narrow/HideFiles/focus protocol passed at12.455/10.811s. Power/workload changed as well, so the full elapsed gain is not attributed to those12lines. This concrete cold-budget relocation earns its cost without sharing mutable origin/native state.

Across all16owned TypeScript files, owners grow28lines, the ten mechanics specs shrink24 and G2adds12: net16lines. New reviewControls52, storyReviewMark247→220; all raw sources remain≤246. No source formatting was performed. Further shape/cost review belongs to the coordinator's independent refactor.

Current proof candidate is merge bcfacd6be263f812dc019eb21f2e9f6a81eb1818 with the same16uncommitted TypeScript changes. Incoming Done Reviewed is a separate StoryReviewStateAction after Review changes; snapshot marks and matching names/scopes are unchanged. The incoming pageSidePanel content-before-selection ordering reaches review entry. Current53-case strict superset renews full49 plus4DoneIntent live/captured handoffs; those4replace old runtime reuse for that merged boundary. Touch4passed in the developer's moderately busy target with no source reduction; phone full retention8.728s completes321steps/98DOM reads/16taps, versus previous incomplete252steps/79reads/12taps at timeout. These different conditions demonstrate the preserved complete journey at supported concurrency, not safety under every workload or a new general harness speed improvement.

Original failed49 and failedtouch verdicts remain failed and recoverable. No independent narrow touch-code defect was identified from distributed delays; no geometry batching, fixture/observation reduction, split journey, new timeout or retry was added. The developer explicitly supports moderate concurrent development and does not require a quiet machine. Prior extreme recurring pressure is retained as context and a proof limit; it is not an exemption from the required current strict gates.
