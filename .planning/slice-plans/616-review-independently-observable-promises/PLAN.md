# Record evidence once per independently observable source promise

**Source:** [refined story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#review-independently-observable-promises)
**Source review:** [independent source review](source-review.md)
**Identity:** SEED-010#review-independently-observable-promises

## Goal and scope

Let planned-execution coordinators retain an independent source review that
catches missing proof without separately allocating and observing reasons,
restatements or other context with no independent result. Keep each promise's
conditions, alternatives, justified restrictions and original source traceable.

Change the review/execution guidance at its existing seams, retaining the
current source-review table and obligation CLI. No schema, automatic prose
classifier, bulk-recording API, new lifecycle owner, release or client rollout
is included. Do not weaken evidence sufficiency, isolation, amendment refresh,
execution authority or post-execution completion. Source-only review is still
obtained by execution, not written by this preparation.

## Existing solution and decisions

PFE: `Distribution/src/skills/dough-execute-plan/references/obtain-source-review.md`
(53 lines) owns the fresh review's input and promise extraction. Its current
instruction to number every commitment and give each listed item its own id
explains the recorded symptom. `story-obligations.md` (231 lines) owns
retention, allocation and observation, with the existing
`story-obligations.mjs record/list/check` boundary enforcing row ownership and
missing-proof refusals. `delegation.md`, `wrap-up.md`, the execute-plan
`SKILL.md`, `dough-resplit-story/SKILL.md` and refinement `planning.md` link
those owners. Change the existing rules rather than adding another ledger or a
coordinator-side filter that silently discards the reviewer's ids.

One common rule: a row owes an observable result under its source conditions.
Several clauses describing that same result share the row and sufficient
observation; distinct results or separately checkable alternatives still owe
proof, even when one command runs their tests. Preserve source text/locations
for attached qualifications. Keep non-promissory context outside the numbered
allocations, and retain a numbered promise when contextual wording also
contains a checkable outcome. Do not reinterpret scope limits as rejection rules.
Slices 2 and 3 exercise this same rule on harder sources; they revise its
wording only on a concrete replay failure and add no source-specific rules.

Relevant Accepted decisions:

- [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md): author Proposed guidance in `Distribution/src/skills`; do not hand-sync installed copies or fabricate a containing release.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md): keep one behavioral home, direct runtime wording and project-relative context. Apply the [maintainer behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review).
- [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md): representative useful behavior review for this conventional guidance change; no new discovery/integration mechanism or routine per-tool matrix. CLI replay proves record integration, not native agent behavior. Do not claim native behavior on an unobserved host.
- [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md): compare bookkeeping against retained reviews, keep useful gap detection, and distinguish delivered guidance from an observed ordinary-use improvement.

The existing `.planning/NORTH-STAR.md` topics govern the dashboard; this change
needs no new architectural direction. No Accepted-ADR conflict was identified.

## Outside-in proof and decisive premises

Observations first made at `ec7ec98a01` on 2026-11-13 were rechecked in this
owned checkout at `fc1fe54cc5` on 2026-11-15, after the Distribution
regrouping. No implementation or candidate guidance replay has been performed
by preparation; the scratch mutation below was restored, with no remaining diff.

| Premise and consuming operation | Observation, result and remaining work |
| --- | --- |
| Small historical replay can recover both source and old allocations (slice 1) | `git show f595336fb608dcfebfaa01685141db1b61fbcaf6:.planning/seeds/SEED-320-conditional-terminal-opening.md` and the same revision's `.planning/slice-plans/597-open-terminal-only-without-a-custom-instruction/source-review.md` recover the full input and 44 rows (rechecked present). Rows 1.4, 3.3, 5.5 and 9.3 repeat reasons or nearby outcomes. |
| Compound historical replay can recover source and old allocations (slice 2) | `git show ebaf16f6336d2d9111f95984b907a006b67f3c04:.planning/seeds/SEED-316-mobile-terminal-text-selection.md` and the same revision's `.planning/slice-plans/591-select-and-copy-terminal-text-on-mobile/source-review.md` recover the input and 112 rows (rechecked present), including context U1 and repeated automated-proof limits X5. |
| The known pronunciation miss is a source promise, not an inferred product requirement (slice 3) | Read-only `git -C /Users/terryyin/git/doughnut show e9f109c3c25b0355a897161f8a8180fdfb22a1a5:.planning/seeds/SEED-124-save-pronunciations-as-note-properties.md` (rechecked present): UI requires hiding `て` within `挙げて`; Scope separately refuses a reading as the written answer. [ODF-481](../../../docs/maintainer/findings/ODF-481.md) records the missed proof. Replay the source clauses, not Doughnut's implementation or live notebook. |
| Existing record contract carries qualified source text, refusal and lifecycle ownership without a new schema (slice 4) | `node --test Distribution/tests/skills/dough-execute-plan/story-obligations-source-review*.test.mjs`: 24/24 passed, 3.4 seconds. Tests drive `record/list/check` with real Markdown and distinguish allocated, unobserved, disposed and lifecycle-pending rows. This proves the unchanged record boundary, not extraction quality. |
| Maintained proof detects loss of the missing-observation gate (slice 4) | Scratch-replaced the `item.observed === undefined && !item.obligation` branch in `Distribution/src/skills/dough-execute-plan/scripts/story-obligation-source-review.mjs` with `false`; `node --test --test-name-pattern 'the allocated slice cannot finish until its commitment is observed' Distribution/tests/skills/dough-execute-plan/story-obligations-source-review.test.mjs` failed (`true !== false`). Restored bytes: same command 1/1 passed. |

ODF-481 also now retains a Pygardon review (55 rows for a 24-line change, some
rows recording only that their condition did not apply). It confirms the
symptom; it is not a replay input for this plan.

No cheap current-state premise remains unobserved. Fresh reviews of changed
guidance are the slices' intended product observations, not prerequisites for
preparing this plan. No paid, credentialed or developer-operated probe is needed.

| Source promise / example | Owner | Required observation |
| --- | --- | --- |
| One observation covers repeated descriptions of a single qualified result; context adds no rows (example 1) | Slice 1 | Fresh source-only small replay compared with the retained 44 rows; repeated reasons/outcomes collapse and every retained result/condition traces to source. |
| A separately checkable alternative stays separate (example 2) | Slice 1 | Blank versus typed terminal results remain distinct ids; developer-moved focus stays attached where it changes the result. |
| Compound journeys keep checkable results without proof-method rows (example 3) | Slice 2 | Fresh compound replay compared with the retained 112 rows; proof-limit and context statements add no rows, while copy, paste, scrolling and preservation results each keep an id. |
| Grouping keeps qualified results and genuine restrictions (example 4) | Slice 3 | Fresh replay of the pronunciation source keeps hiding inside `挙げて` explicit and keeps refusal as a written answer as its own restriction id. |
| Context stays context; a post-execution promise keeps its lifecycle owner (example 5) | Slice 4 | A source with a settled baseline, effort hypothesis and final target-CI requirement yields one `target CI` row; CLI lists it pending with an empty observation cell. |
| Every returned id retained; missing proof blocks acceptance or carries a disposing obligation | Slice 4 | CLI replay in a disposable directory with the slice 1 and 3 returns: withheld typed-input or inside-word observation is refused; sufficient evidence or a linked obligation is accepted. A successful check is never proof of semantic sufficiency. |
| Isolation, unchanged-source reuse and amendment replacement unchanged | Slices 1–4 | Every replay retains its launch/input/return; the reviewer sees no plan, product or expected answer. Slice 4 reviews the reuse and amendment paths in the changed guidance. |
| Delivered response remains attributable | Slice 4 | Update ODF-481 with the response revision and the bounded replay results; containing release stays pending until an actual tag contains it. |

## Ordered slices

All slices replay with fresh isolated reviewers as the execution guidance
requires, supplying only recovered source text, explicit amendments and the
candidate brief. Inspect actual inputs and returns, and evaluate each against
the source privately, without feeding expected groupings or proof gaps to the
reviewer. Retain replay evidence beside this plan as `replays/<source>.md`
for acceptance and retrospective. A return that still fragments
non-promissory context is a failed behavior review, not permission for the
coordinator to delete returned ids. Model/runtime differences limit causal
comparison; make no time or token saving claim.

### 1. Review the small conditional story as independently observable promises
Type: Behavior
Status: done
Proof: Fresh small-story replay against the retained 44 rows, under examples 1 and 2.

Behavior: Given the conditional-terminal story that repeats a qualified result
and explains it, when a fresh reviewer receives the changed brief, the
blank-input opening is one promise with its condition and example attached,
the explanation adds no row, and the typed-input alternative keeps its own id.

- Change the extraction instruction in `obtain-source-review.md` to the common
  rule above; preserve timing, isolation and caller links.
- Walk invocation, required source context and useful outcome under the
  maintainer behavior review.
- Before changing any test, apply installed `dough-makeme` selection for its
  exact path; `Distribution/tests/skills/**/*.test.mjs` uses no page objects.
  Change prose assertions only where an old expectation conflicts with the
  story; add no prose snapshot or semantic classifier.

### 2. Keep compound journeys' checkable results without proof-method rows
Type: Behavior
Status: done
Proof: Fresh compound-story replay against the retained 112 rows, under example 3.

Behavior: Given the mobile selection story that repeats a clipboard journey
across Goal, Scope and examples and explains automated-proof limits, when a
fresh reviewer receives the slice 1 brief, the journey's conditions attach to
its outcomes, proof-limit explanations add no rows, and copy, paste,
scrolling and preservation results each keep an id.

### 3. Keep qualified results and restrictions under grouping
Type: Behavior
Status: planned
Proof: Fresh pronunciation-source replay, under example 4.

Behavior: Given the pronunciation story whose related clauses include hiding
`て` inside `挙げて` and refusing a reading as the written answer, when a fresh
reviewer receives the current brief, the inside-word result remains explicit in
its promise and the refusal keeps its own restriction id.

### 4. Accept grouped promises through the existing obligations record
Type: Behavior
Status: planned
Proof: Disposable CLI replay of slice 1 and 3 returns plus a lifecycle source,
focused source-review tests, consumer trace and ODF-481 update, under example 5.

Behavior: Given grouped review returns, when the coordinator retains and
allocates every returned id and checks acceptance, withheld proof for the
typed-input or inside-word result is refused until sufficient evidence or a
linked obligation exists, context creates no row, and a target-CI promise
stays pending under its lifecycle owner.

- Align retention/observation wording in `story-obligations.md` only as the
  grouped rows need; keep its record form, refusals and lifecycle owners.
- Replay through the real `record/list/check` CLI with
  `story-obligations-test-fixtures.mjs` and the shared CLI fixture boundary;
  do not run the archived dashboard or Doughnut product journeys.
- Trace changed guidance to `delegation.md`, `wrap-up.md`, the execute-plan
  `SKILL.md`, `dough-resplit-story/SKILL.md`, refinement `planning.md`,
  obligation scripts, guidance tests and payload consumers, recording
  dispositions with the installed consumer-trace procedure. Run consumers the
  effect reaches.
- Record the bounded evaluation, including slices 1–3 comparisons and their
  limits, and the response provenance in ODF-481; do not close ordinary-use
  effectiveness by inference or release the payload.

## Local gates, delivery and failure policy

Focused local command:
`node --test Distribution/tests/skills/dough-execute-plan/story-obligations-source-review*.test.mjs`.
Add directly affected guidance/consumer checks from the trace; a full dashboard
or repository run is not required for this guidance-only change. Hosted checks
remain owned after publication under execution's normal asynchronous CI repair.
Use the project's [failure policy](../../../AGENTS.md#failing-and-flaky-tests)
as written, including repair of failing/flaky and base-attributed failures and
preservation of a separately evidenced active repair owner's files.

For a long local run, start fully awake. The maintained
[macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
is `caffeinate -s -i` on AC power; on battery plug in, or keep the lid open
under `caffeinate -i` and inspect the sleep log afterwards. Never use sleeps,
`test.slow()` or suite/hook timeout overrides.

`story-obligations.md` is 231 lines against the 250-line refactor limit. If
slice 4 grows it beyond that, move its source-review record responsibility to
one focused reference and update callers and payload checks; do not split by
arbitrary line counts or duplicate the behavioral rule.

## Current decisions and concern evidence

- Four Behavior slices, one per independent replay loop, each sized to the
  15-active-minute slice limit; reviewer run time is excluded. The earlier
  single slice combined three reviews, CLI replay and the consumer trace.
- Slices 2 and 3 extend slice 1's rule; they are not separate recognizers.
- No source-review schema or CLI behavior change is required by current
  evidence. Reconsider only on concrete replay failure within this scope.
- Slice-plan refinement was not needed: this planning pass already split the
  former slice by proof loop, and each slice has one bounded outcome and
  mapped proof without interim behavior.
- No remaining slice-specific, cumulative-design, proof-ownership or sizing
  concern was identified. No human decision is needed before Take.

## Learnings

None beyond the preparation observations above.

## Execution context

- Identity: `SEED-010#review-independently-observable-promises`; publisher `dashboard-territory.local-open-dough`; agent Sola-chan; mode story-branch.
- Originating/execution checkout: `/Users/terryyin/git/open-dough/.worktrees/record-source-review-evidence-once-per-independe`; owned branch `codex/record-source-review-evidence-once-per-independe`.
- Default integration checkout: `/Users/terryyin/git/open-dough`; authorized target `origin/main`.
- Established claim accepted on trunk and execution branch: `7bb9992277410f6b5c3ba8da0b461c3c61939a84`; starting revision `65fcf1bafe89d591f3b387c2cefd361c72f7b510`; initial candidate equals claim.
- Latest accepted branch revision: `8ac10364f82362f3dac2504304a52645ed661456`; suffix base `7bb9992277410f6b5c3ba8da0b461c3c61939a84`; observer reused. Slice 1 delivery repaired an EOF blank line before its successful commit; semantic proof unchanged.
- Setup: locked `npm ci --no-audit --no-fund` and `npm run --silent lint -- --staged` passed in this checkout. Check-only commit hook owns staged lint and dashboard typecheck for scripts. Selective formatter: `npm run format`; prose triggers no generation. Runner needs Bash 5: `PATH="/opt/homebrew/bin:$PATH" npm test -- …`.
- Replanning: no new overrun permission; retain existing planning authority; changed scope/consequential decisions stop the affected work.
- CI: GitHub `terryyin/open-dough`, verified `ci.yml` / `CI`, remote execution branch. Codex coordinator `sola-chan-616`; `/tmp/dough-ci-501/watch-hqI9ru`; PID `71264`; session `83233`; yielded cell `g464:11`. Claim trunk CI is unobserved by this branch observer. Retain for every increment/repair.

## Accepted slice evidence

### Slice 1

- Fresh isolated [small replay](replays/small.md): 26 returned promises versus
  the retained 44 rows; all historical rows mapped. Blank and typed results,
  developer-moved focus, retained inputs and Cursor continuation survive;
  reasons and repeated descriptions add no row. Actual launch/input/return
  retained. No source-specific rule or failed replay was needed.
- [Consumer trace](replays/small-consumers.md) dispositions every located path.
  Inspected extraction, source-only boundaries, qualified result provenance,
  record refusal assertions and payload-link boundary. No test changes.
- Passed: `PATH="/opt/homebrew/bin:$PATH" npm test -- Distribution/tests/skills/dough-execute-plan/story-obligations-source-review*.test.mjs Distribution/tests/installation/payload-declaration-links.sh`
  (24 Node cases plus payload links). Bash 5 first on PATH is the documented
  runner prerequisite; the initial Bash 3.2 refusal launched no tests.
- Early source freshness: unchanged at `7bb9992277410f6b5c3ba8da0b461c3c61939a84`;
  no named coordination sibling. Active implementation: about 5 minutes.
  Independent refactor complete: trace split by consumer responsibility, all 575 rows preserved; product/proof unchanged, no rerun.
  Bounded extraction evidence only; no effort, matched-model, cross-host or
  ordinary-use improvement claim.

### Slice 2

- [Compound replay](replays/compound.md): fresh isolated 43-promise return versus 112 historical rows; source/input/return and complete mapping retained. Copy, paste, scrolling and preservation stay distinct; non-promissory context/proof explanations stay unnumbered. No source correction needed.
- `records-only` delivery; slice-1 consumer/CLI/payload proof remains applicable without rerun. Early freshness unchanged at claim trunk; no named sibling. Active implementation about 7 minutes. Structural retention checks passed; no semantic gap found.
