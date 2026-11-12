# Slice 2 — shared review entry and comparison controls

Source expectations11,13–18,54–55: procedural/fluent Review changes callers share
one owner; branch/trunk/completed/one-shot/Intent entry and comparison retain
caller facts, operation-specific waits and independent accessible-name/Tab proof.

Current output: storyCardControls.reviewChanges owns the shared card action;
storyReviewMark owns comparison choices, touch labels and retained-run chooser.
StoryCard and procedural openings reuse it without adding waits. Intent entry
returns its existing read review. Exact snapshot and held-read protocols remain
in their original operations/scenarios; commit-choice doublewait is unchanged.

Inspected boundaries: action spec retains independent Review changes/git-compare/
arrow-right expectations and Tab/Enter order; comparison retains expected file
counts, marked revision and no reread; one-shot choice/races retain keyboard
Space, selected run/file, old-answer release and unchanged mark/refs; completed
Intent callers retain their published revision/source/diff expectations.

Proof: representative3cases (action contract, procedural same-snapshot comparison,
full fluent held replacement) passed. Broad cohort216cases/101specs passed,
retry0,1517.592s. Final correction/consumer cohort14cases/5specs passed,
retry0,126.183s; typecheck and diff check passed. No sleep/wake event in broad
run's window. The broad regex also selected backend review cases; that is an
observed selection cost, not evidence they consume these browser helpers.

G1: board-scroll's explicit exact:true option was temporarily widened during
migration. reviewRegion now accepts its caller's option without changing the
existing default, and board-scroll explicitly supplies exact:true. Both viewport
cases passed in final renewal; see storyReviewMark.ts31–35 and board-scroll.ts46.

Source preservation inspection: all titles and1232 assertion arguments/order
entries preserved across57editedfiles; this is supporting source inspection,
not an equivalence claim for locator targets. Files are under250 before formatting.

Freshness: unchanged at3e104c8411f9c6553eb94ecabd16156c77b5834e, base8aa440077.
Named sibling Terminal/session/Board changes since8aa are preparation/claim records;
no accepted product change reaches this slice. Accepted e3638d5b3 enables shared
test conventions in trunk's Intent entries. Its CI settings are unchanged;
current branch configuration stays fixed while its observer runs. Incoming
conventions are reviewed for compatibility within this story's authorized scope.

Host: battery/lid open/awake, one worker under caffeinate-i; load rose from18.02
to38.08/35.20/27.16, battery59%. Live progress was observed past the original
10–15minute estimate, through terminal216/216; no duplicate run or timeout change.
No other coordinator-owned heavy proof ran.

Consumer trace: `/tmp/seed300-slice2-consumer-trace.md`, installed script at
base14d6f4e9f, exact control effects supplied;1358 rows dispositioned (41 run,
1 reused,1316 excluded). Changed specs were all selected. Transitive tracing
followed readReview into oneShotReview and completed/retained Intent cases,
openReviewFromIntent into live/completed Intent scenarios, and openStoryReview
into the additional destination-cue case. Unchanged exports/types, unrelated
Board expectShown, generic comparison vocabulary and historical records are
excluded by inspected effect. No unexcluded consumer lacks proof.

## Finding 1 evaluation under ADR 0010

Compared against both audit7eab3d6ca and preparation47b348b3a:

| Mechanics edit sites | Audit | Preparation | Current owner |
| --- | --- | --- | --- |
| Review changes locator |32 sites/26 files|32 sites/26 files|1 in storyCardControls|
| Review region locator |37 sites/31 files|37 sites/31 files|1 in storyReviewMark|
| Named comparison radio mechanics |49 sites/21 files|51 sites/22 files|comparisonChoice|

Both baselines' representative same-snapshot case repeated group/radio lookup:

```ts
await comparison(review)
  .getByRole("radio", { name: "Since the review" })
  .press("ArrowDown");
```

Now the same input and independent expected comparison/file count surround a
named shared choice:

```ts
await comparisonChoice(review, "Since the review").press("ArrowDown");
await expectShown(review, "All changes");
await expect(review.getByRole("list", { name: "13 changed files" })).toBeVisible();
```

The action-contract case uses reviewChanges(inspectionGroup(card)), retaining
independent expected accessible name, both glyphs and Tab/Enter protocol. Both
procedural openStoryReview and fluent StoryCard reach the same owner. That owner
never presses or waits, so held reads remain pending until the scenario acts.

Cost before formatting:4 extra lines in storyCardControls and18 net lines in
storyReviewMark (including imports and matching options), plus one useful return
from existing openReviewFromIntent. No new module/framework/fluent conversion.
Some specs gain imports; comparison-heavy bodies shrink. Fewer maintenance sites
and clearer action/choice names justify these small existing-owner APIs. Future
edit saving is inferred from the source structure; no new rename experiment,
speed or measured human reading-time claim is made. Protocol preservation and
runtime proof support the judgment beyond locator counts. Baseline sources/counts
and full comparison are inspectable in `/tmp/seed300-slice2-benefit-cost.md` and
`/tmp/seed300-slice2-counts.json`; original revisions remain available in Git.

## Literal proof commands

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice2-representative-proof.json caffeinate -i npm run test:dashboard -- tests/review/story-review-action.spec.ts tests/review/story-review-comparison.spec.ts tests/navigation/side-panel-content-replacement.spec.ts --grep "the inspection group|the switch shows the same snapshot|a review, another story's review" --workers=1
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice2-cohort-proof.json caffeinate -i npm run test:dashboard -- /tests/review/ tests/intent/intent-done-completion-provenance.spec.ts tests/intent/intent-done-landed-review-mode.spec.ts tests/intent/intent-done-prior-execution.spec.ts tests/intent/intent-done-retained-landing.spec.ts tests/intent/intent-done-retained-workspace.spec.ts tests/intent/intent-done-review-modes.spec.ts tests/intent/intent-story-changes-landed-run.spec.ts tests/intent/intent-story-changes-marked.spec.ts tests/intent/intent-story-changes-moves.spec.ts tests/intent/intent-story-changes.spec.ts tests/intent/intent-story-completed-source.spec.ts tests/intent/intent-story-completed.spec.ts tests/intent/intent-story-review-return.spec.ts tests/intent/intent-summary-story-comparison-renamed.spec.ts tests/navigation/board-scroll.spec.ts tests/navigation/side-panel-width.spec.ts tests/navigation/side-panel-width-kept.spec.ts tests/navigation/side-panel-width-covering.spec.ts tests/navigation/side-panel-content-replacement.spec.ts tests/navigation/side-panel-content-switching.spec.ts tests/sessions/recently-done-sessions-select-ad-hoc-review.spec.ts --workers=1
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice2-final-proof.json caffeinate -i npm run test:dashboard -- tests/review/story-review-completed.spec.ts tests/review/story-review-uncommitted-check-refresh.spec.ts tests/navigation/board-scroll.spec.ts tests/navigation/story-destination-repeat-cue.spec.ts --workers=1
npm run typecheck:dashboard
git diff --check
```

Acceptance mapping and actual setup/observation locations are retained in
`/tmp/seed300-slice2-acceptance.md`. All181 original explicit exact:true options
remain at their call sites. No timeout, sleep, retry, skip or protocol line was
introduced. Initial cohort and final edits have matching proof; no gaps remain.
Independent `/root/refactor2`: none — already clean; no edits/tests,
`## REFACTOR COMPLETE`. Accepted proof unchanged; formatting preview keeps all
57 TypeScript files within250. Incoming conventions are compatible within scope.
