# See when an execution has finished and what it learned

## Source

**Identity:** SEED-021#see-finished-execution

Story 5 in
[SEED-021](../../seeds/SEED-021-observe-published-story-progress.md#see-finished-execution),
refined with Terry on 2026-09-24. The seed owns goal, scope, key examples, and
deferred promises; this plan restates only what the slices need.

## Goal and scope

When a planned execution finishes, execute-plan makes one completion commit
and publishes it before the completion CI wait. That commit holds the plan's
execution-complete record with a required product-advice entry, plus the
retrospective's correction plan or process findings when there are any. The
dashboard shows such a Taken story as "execution complete, awaiting wrap-up"
with the advice, sourced where delivered Taken progress is read. Wrap-up uses the
recorded advice when its conversation has none, then deletes the plan as
today. The retrospective stays review-only.

Excluded (seed deferred promises):
- Showing process findings, correction plans, or CI verdicts in the dashboard.
- A "slices done, retrospective running" state.
- Changes to what the retrospective reviews or how it words advice.
- Wholly planless quick executions.
- Age warnings.

Facts this plan relies on:

- **Builds on delivered Taken progress (story 3, on trunk since `e78171b`).**
  Behavior is described in `dashboard/README.md`. Slices 1 and 2 reuse:
  - the `## Slices` compatibility in the shared plan reader;
  - the card bar (`dashboard/src/SliceProgress.tsx`, with `PlanSlicesNote`
    and `ProgressSourceLabel`) and clock (`dashboard/src/SliceClock.tsx`);
  - the clock start (`startOf`/`withSliceClocks` in
    `dashboard/src/sliceClockStart.ts`): the later of the plan's last commit
    at the source ref and the Take, read through `readLastCommitTimeAt`;
  - source routing (`routeOf` in `dashboard/src/progressRoute.ts`,
    `withProgressSources` in `dashboard/src/progressSource.ts`): trunk, the
    recorded branch head, the labelled trunk copy, or a gap;
  - the automatic check's re-read of a moved recorded branch
    (`readMovedProgress` in `dashboard/src/movedBranchProgress.ts`), which
    re-reads that entry's plan and clock only.

  Test support: `publishFiles` with `branches` and `committed` maps
  (`dashboard/tests/publishedFiles.ts`), `branchProgressRecords.ts`,
  `sliceClockRecords.ts`, and the paused-clock helpers in
  `autoRefreshJourney.ts`. Specs: `taken-slice-progress`,
  `taken-slice-clock`, `branch-slice-progress`, `auto-refresh-branches`.
- **Correction 095 is queued first.** It records the resolved plan path once
  on `WorkEntry`, removes `story-readiness-slices-heading.spec.ts`, and
  renames the auto-refresh check helpers. Build on its result; if 095 has not
  run, the reuse above is unchanged.
- **Card wording follows the delivered terms.** Counts say "N of M slices
  recorded complete" and the clock "Current slice started N min ago"; the
  UX/UI North Star records both. The complete state uses the same pattern.
- **The shared plan reader owns plan meaning.**
  `src/skills/dough-product-backlog/scripts/product-backlog-plan-reader.mjs`
  (`readPlanSlices`) has one product caller,
  `dashboard/src/storyPlan.ts`, which projects its answer with zod. It follows
  the North Star topic
  [One backlog interpretation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation).
  The completion record is read there, not by a dashboard grammar.
- **Plan elements today.** The planning guidance
  (`src/skills/dough-story-refinement/references/planning.md#write-an-executable-plan`)
  names six elements. It defines no plan-level `Status:` line; the
  `Status: planned.` header some plans carry is informal and stays unread.
- **Publication already covers both modes.**
  [Publish an execution increment or repair](../../../src/skills/dough-execute-plan/references/trunk-publication.md#publish-an-execution-increment-or-repair)
  pushes to trunk in Trunk Mode and to the recorded story branch in Story
  Branch Mode. It also attaches the CI observer.
  [Await the applicable revision at completion](../../../src/skills/dough-execute-plan/references/ci-monitor.md#await-the-applicable-revision-at-completion)
  waits on the last accepted registered revision, and already follows a
  revision whose changes CI ignores to its recorded basis. Open Dough's CI
  ignores `.planning/**` and `docs/**`, but `DearDough.md` at the root is not
  ignored.
- **Who commits the retrospective's records today.**
  - `finish-or-stop.md` supplies the execution checkout as the retrospective's
    write location "so … wrap-up" commits its records.
  - The retrospective's "Write only in an owned checkout" section says the
    same.
  - `ci-completion-lifecycle-guidance.test.mjs` asserts the neighbouring
    finish-or-stop wording.
- **What wrap-up takes as input.** `dough-story-wrap-up/SKILL.md` lists
  "optional retrospective advice when present" as input and applies it under
  "Apply product-review decisions".

## Outside-in proof

| Key example (seed) | Slice | Observation |
| --- | --- | --- |
| A plan with an execution-complete record and advice is interpreted with that advice; a record without a readable advice entry is a gap; no record means not complete | 1 | Plan-reader unit cases |
| Detail view of a completed plan shows execution complete and the advice as recorded | 1 | Dashboard detail journey |
| Story Branch Mode story whose branch plan carries the record → card "execution complete, awaiting wrap-up", waiting time since the completion commit, branch label kept, no current-slice clock | 2 | Playwright spec against fake GitHub, paused page clock |
| Trunk Mode record with "no product change, because …" → card complete, detail shows that text | 2 | Same spec |
| All slices done but no record → slice progress, not complete; record without advice → gap on the card | 2 | Same spec |
| A completion commit pushed to the recorded branch → the automatic check shows the complete state without Refresh | 2 | Step in `auto-refresh-branches.spec.ts` |
| Execution finishes → one commit with record, advice, and any correction plan or `DearDough.md` entries, published through increment delivery before the completion wait; the final handoff reports the advice | 3 | Guidance assertions |
| `--skip-retro` → record says "retrospective skipped"; `--skip-product` → "product review skipped"; retrospective stops for missing context → no record | 3 | Guidance assertions |
| Fresh-session wrap-up without retrospective context applies the advice recorded in the plan; explicit human input still wins | 4 | Guidance assertions |

## Current decisions

- **The completion record's form.** It is one plan section, placed after the
  ordered slices:

  ```markdown
  ## Execution complete

  Product advice: <recommendations, or no change because …, or retrospective skipped, or product review skipped>
  ```

  The advice may continue across following lines or list items until the next
  `## ` heading.
  - The reader returns `completion: { advice }` when the section has a
    non-empty `Product advice:` entry.
  - It returns a completion problem when the section exists without that
    entry.
  - It returns no completion when the section is absent.
  - Slice interpretation is unchanged and independent.

  One section, one field: no retrospective state machine, no
  finding list, no second status vocabulary.
- **Waiting time reuses the delivered clock start.** The completion commit
  changes the plan, so the plan's last commit at the source ref is the
  completion time, and it is later than the Take; `startOf` already yields
  it. There is no new read kind. Source gaps (ambiguous owners, a branch no
  longer published) still take precedence, since no plan is read there.
- **The completion commit is an ordinary increment.** It is built in the
  execution checkout and published through managed increment delivery,
  followed by the existing completion operation. There is no new CI or
  publication mechanism. The retrospective keeps "do not commit, push, or
  change the backlog"; only the sentence saying wrap-up commits its records
  moves to execute-plan. Terry confirmed on 2026-09-24 that Trunk Mode may
  publish correction plans and findings to trunk before wrap-up.
- **Guidance is edited in `src/skills/` only.** Installed copies refresh through
  a release (AGENTS.md). Native cross-host acceptance follows
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) and is
  tracked separately, decided at wrap-up rather than added as a slice here.

## Ordered slices

### 1. The dashboard detail shows a plan's recorded completion and advice

Type: Behavior
Status: planned
Proof: new cases in `tests/support/product-backlog-plan-reader.test.mjs` via
`node --test tests/support/product-backlog-plan-reader.test.mjs`:
- a completed plan returns its advice, including multi-line advice;
- "no product change, because …" and "retrospective skipped" are returned
  verbatim;
- a section without `Product advice:` returns the completion problem;
- no section returns no completion;
- slices are interpreted as before in every case.

One dashboard detail journey serving a completed plan shows "Execution
complete" and the advice as plain text; a plan without the section shows no
completion. Run it with `npm run test:dashboard -- --grep '<journey>'`, plus
`npm run typecheck:dashboard` and `tests/product-backlog.sh`.

Behavior: a published plan with an `## Execution complete` section → detail
opens → the recorded completion and advice are shown, or its gap.

Extends `readPlanSlices`'s answer (or a sibling export in the same module)
and the zod projection in `dashboard/src/storyPlan.ts`.

### 2. Taken cards show "execution complete, awaiting wrap-up"

Type: Behavior
Status: planned
Proof: new `dashboard/tests/taken-execution-complete.spec.ts` via
`npm run test:dashboard -- taken-execution-complete`. It reuses
`publishFiles` with `branches` and `committed` and pauses the page clock.
- A Story Branch Mode profile, where the branch plan has all slices done plus
  the record, with the plan last committed 40 min ago → the card says
  "Execution complete, awaiting wrap-up" and "Completed 40 min ago", keeps
  the branch label with "not in trunk", and shows no "Current slice started".
- A Trunk Mode record with "no product change, because …" → complete, and the
  detail shows that text.
- All slices done without a record → the delivered bar ("N of N slices
  recorded complete") and clock, not complete.
- A record without advice → the completion gap on the card.
- A queued, not Taken, entry whose plan has a record → no complete card
  state.

A step in `dashboard/tests/auto-refresh-branches.spec.ts`: the recorded
branch moves to a head whose plan carries the record → within the check pace
the card shows the complete state, with reads only of that plan and its
commit time.

Also run `npm run typecheck:dashboard`. The `taken-slice-progress`,
`taken-slice-clock`, and `branch-slice-progress` specs stay green.

Behavior: a Taken entry whose plan at its progress source carries the
completion record → load or automatic check → the card replaces the
current-slice clock with the complete state and waiting time; the detail shows
the advice.

### 3. Execute-plan publishes one completion commit with the product advice

Type: Behavior
Status: planned
Proof: new assertions in
`src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs`
(or a sibling `execution-completion-record-guidance.test.mjs`) via
`node --test <file>`.

`finish-or-stop.md`:
- after the retrospective returns, or is skipped, it writes the
  `## Execution complete` record with `Product advice:`;
- it commits that record together with the retrospective's written records
  in one commit;
- it publishes through increment delivery before the completion operation;
- `--skip-retro` records "retrospective skipped" and `--skip-product`
  records "product review skipped";
- a retrospective context stop writes no record;
- the final handoff reports the product advice.

Planning guidance: `planning.md#write-an-executable-plan` names the element
and its form.

Retrospective: the write-location sentence names the invoking execution, not
wrap-up, as committer, and "do not implement, commit, push" still holds.

Run the existing guidance tests in that directory, and `tests/retrospective-reference-payload.sh`
if it covers the edited text.

Behavior: a planned execution's slices are done and its retrospective has
returned → execute-plan completes → one published completion commit carries
the record, the advice, and any retrospective records, and the completion
wait covers it.

Only the guidance changes. Review one representative use per AGENTS.md
behavior review: a Story Branch Mode run whose retrospective writes a
correction plan.

### 4. Wrap-up uses the product advice recorded in the plan

Type: Behavior
Status: planned
Proof: assertions in the same guidance test file over
`src/skills/dough-story-wrap-up/SKILL.md`:
- the inputs list includes the plan's recorded product advice;
- "Apply product-review decisions" uses the recorded advice when the
  conversation supplies none;
- explicit human input still wins;
- records already committed by the execution are not committed again, and
  the plan is still deleted as spent history.

Run `node --test <file>`.

Behavior: wrap-up runs in a fresh session for a story whose plan has a
completion record → it applies the recorded advice under existing authority →
it closes and deletes the plan as today.

## Promise ownership

Each seed scope bullet maps to the proof table:
- the one completion commit: slice 3;
- the required advice entry: form in slice 1, production in slice 3;
- the dashboard: slices 1 and 2;
- wrap-up: slice 4;
- gaps, never guesses: slices 1 and 2;
- shared guidance for all three hosts: slices 3 and 4, with one `src/skills`
  source.

The deferred promises have no slice.

## Learnings
