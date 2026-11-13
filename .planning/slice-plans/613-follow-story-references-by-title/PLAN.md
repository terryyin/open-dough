# Follow story references by title

**Identity:** SEED-342#follow-story-references-by-title
**Source:** [Follow story references by title](../../seeds/SEED-342-follow-story-references-by-title.md#follow-story-references-by-title)
**Source review:** [Source-only commitments](source-review.md)

## Execution context

Story Branch Mode; established owned worktree `/Users/terryyin/git/open-dough/.worktrees/follow-story-references-by-title`, branch `codex/follow-story-references-by-title`; originating and default checkout `/Users/terryyin/git/open-dough`. Starting revision `e06bdfb8c056a277a332672f6cf417d7cefe29d0`; accepted claim and candidate `de4da5c4a48418becb30b10deedc68c17e7e2237` on `origin/main` and the execution branch. Publisher `dashboard-territory.local-open-dough`; agent `viktor-chan`. Replanning retains ordinary planning authority; no numeric slice budget is supplied.

Checkout readiness: locked `npm ci` and `npm run typecheck:dashboard` passed. Formatter is changed-files-only `npm run format`; the check-only pre-commit hook runs staged lint and dashboard typecheck for scripts. No generated payload update: author guidance in `src/skills` only.

CI: GitHub Actions `ci.yml` (verified workflow `CI`, ID 351271804), observing the execution branch. Coordinator `seed342-viktor`; cell `g92:13`, session 63487, directory `/tmp/dough-ci-501/watch-OrVuNu`, PID 910. Claim CI on trunk is unobserved. Slice 1 accepted on the execution branch at `0e5785c3c19875ccb025340b8a45f239231bbee5`, suffix base `de4da5c4a48418becb30b10deedc68c17e7e2237`; observer registration reused. Slice 2 accepted at `677c4d21edbcdfef48b6f38cc81ef1f22ef3ae86`, suffix base `0e5785c3c19875ccb025340b8a45f239231bbee5`, with the same observer. Installed runtime is checkout-bound at `.agents/skills/dough-execute-plan`.

## Goal and scope

Readers of a story, plan, or the dashboard's **Dependencies** panel see the
referenced story's title and reach that exact story in one click, including
when several stories share a seed or the story has completed.

Included: one short rule in Work item identity, the still-relevant audited
references, and supplier titles in **Dependencies**. Excluded: new guidance
sections or paragraphs, a title field in dependency facts or the done catalog,
backlog format changes, and rewriting older prose not otherwise touched. This
plan authorizes no implementation by itself.

## Architecture and PFE

Follow [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
one authoritative home, addressed to the agent writing the reference, linked
rather than restated. Terry asked for the shortest possible guidance change.

| Responsibility | Existing owner and disposition |
| --- | --- |
| Reference convention | Extend contract item 3 of `src/skills/dough-product-backlog/references/identity.md` (93 lines). Seed format and the plan format already link Work item identity; change them only to retarget an existing link, never to restate the rule. |
| Active supplier title | Reuse the published work entries' `title` (`dashboard/src/publishedWork.ts`), which `Columns.tsx` (200 lines) already holds for the project. |
| Completed supplier title | Reuse `useDoneDetails` (`dashboard/src/doneDetails.ts`) the way `useDoneRecord` in `useIntentStoryLens.ts` reads one catalogued record by identity; the record's `title` comes from `doneRecord.ts`. No new read path or catalog field. |
| Following the link | Keep `useStoryNavigation().follow({ project, identity })` and its recovery unchanged; only the label changes. |

`docs/dashboard-navigation.md` describes the reference target, not its label,
so it needs no edit. No expected code or test edit is over 250 lines:
`StoryCardDependencies.tsx` 111, `StoryCard.tsx` 212, `Columns.tsx` 200,
`storyReference.ts` 60, `storyDependencyFixture.ts` 160,
`story-reference-done.spec.ts` 149. Re-run `wc -l` on every actual edit.

## Decisive premises

Observed at `db49ccfb9` in this workspace.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Active entries carry titles by identity | Slice 3 label lookup | `publishedWork.ts:23` `title`; existing specs find cards by the same title (`storyCard(backlog, "Story B")`) | Settled |
| A completed supplier's title is readable by identity | Slice 3 done label | `useIntentStoryLens.ts` `useDoneRecord` reads exactly one catalogued record by identity through `useDoneDetails`; the record schema requires `title`. Same hook and read boundary; only the caller differs, which does not change what is read | Settled |
| The catalog has no titles | Slice 3 design | `product-backlog-done-catalog.mjs` entries: fileName, identity, completedAt, blob | Settled: a record read is required |
| Specs locate references by identity | Slice 3 proof | `dashboard/tests/storyReference.ts` `getByRole("link", { name: identity, exact: true })`; 29 call sites | Settled: page object changes to the title |
| Done reference specs assert the exact records read | Slice 3 proof | `story-reference-done.spec.ts` expects `donePathsThrough(10)` after opening Dependencies | Settled: that expectation gains the supplier records read for labels |
| No test reads identity.md's text | Slice 1 proof | `grep -rl "references/identity.md\|navigation, not identity" tests scripts` matches only a native-stream fixture transcript | Settled |

## Outside-in proof

| Promise | Slice | Proof |
| --- | --- | --- |
| Guidance adds about one sentence and no paragraph | 1 | `git diff --stat` and diff review of `src/skills/`; behavior review per [AGENTS.md](../../../AGENTS.md#behavior-review) |
| An agent reading only the contract can write key example 1's reference | 1 | Behavior review walk recorded in the plan |
| Audited references show titles and open their exact sections | 2 | For each changed link: the target anchor exists at its path, or at the retained revision via `git show <rev>:<path>`; the label is the story or seed title |
| Two suppliers sharing a seed show their own titles and open their own stories | 3 | New case in `dashboard/tests/stories/story-dependencies.spec.ts` |
| A completed supplier shows its title and opens its Recently done card | 3 | `story-reference-done.spec.ts`, with the records-read expectation updated |
| An unavailable title falls back to the identity and still opens that exact story | 3 | Case in `story-reference-recovery.spec.ts` or `story-reference-identity.spec.ts` |

## Ordered slices

### 1. Write story references a reader can follow

Type: Behavior
Status: done
Proof: diff review and behavior review above; `npm run lint`

Behavior: an agent writing a seed or plan that names another story → reads
Work item identity's contract → writes `[<story title>](<seed>#<anchor>)`, a
seed-title link for a whole seed, a retained-revision link for a removed
section, and resolves or flags an unclear target. Extend item 3 by about one
sentence; add no section or paragraph anywhere.

### 2. Label the audited references by title

Type: Behavior
Status: done
Proof: per-link anchor check above

Behavior: a reader of each still-relevant audited reference in the
[story's audit](../../seeds/SEED-342-follow-story-references-by-title.md#audited-references)
sees the title and reaches the exact section. At slice start, recheck the
backlog's **Taken** list; leave a Taken story's seed section and plan
unchanged (currently SEED-324's correction with plan 607 and SEED-332 with
plan 610) and report each left reference at execution completion.

### 3. Show supplier titles in Dependencies

Type: Behavior
Status: done
Proof: dashboard specs above; consumer trace over `storyReference.ts`,
`StoryCardDependencies.tsx` and the changed label

Behavior: a consumer card's open **Dependencies** labels each supplier with its
active entry's title, or, when the supplier is completed and catalogued, the
title from its done record, read when the disclosure opens. Until a title is
known, or when none can be read, the label is the recorded identity. Following
any label opens that exact story as today. Change the `storyReference` page
object to locate a reference by its title and update its callers.

## Execution complete

Product advice: no change. The original title/precise-target goal, short authoritative guidance, audited links and dependency labels are fulfilled with deliberate Taken-owner preservation reported below. Aggregate review found no unsupported new data/read boundary or refactoring residue. Retained browser journeys provide meaningful integration proof for exact seed/project navigation, lazy completed-title reads, fallback/retry and disclosure replacement; no suite consolidation correction is supported by current evidence.

Review provenance: delivered revisions `0e5785c3c19875ccb025340b8a45f239231bbee5`, `677c4d21edbcdfef48b6f38cc81ef1f22ef3ae86`, `fe1040f66e6bb20d894c8a300002efa444d0d6eb`; the claim and preparation are provenance, and unrelated trunk `07407e12b` finding maintenance is excluded. Original execution-ready seed/plan at `e06bdfb8c` were compared with the aggregate result, ADR 0006/0008, existing doneDetails/navigation/read contracts and the three-tier test strategy. Advice aligns with the backlog's near-future intent/proof direction without changing priorities. Applicable CI for `fe1040f66` remains pending on the execution branch; no CI success is claimed here. Process is selected by `skipProcessRetrospective: false` and deferred into wrap-up because automatic Intent Coverage is enabled; retain current conversation/tool history for that one review after its report and disposition. No correction plan or product recommendation was created. Records-only completion publication preserves accepted proof.

## Local gates

Slice 3 runs the affected dashboard specs with `caffeinate -s -i` on AC power
(on battery: lid open, `caffeinate -i`, then read `pmset -g log`), per
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos):
`dashboard/tests/stories/story-dependencies*.spec.ts`,
`dashboard/tests/navigation/story-reference-*.spec.ts`, and
`dashboard/tests/navigation/story-card-dependency-selection.spec.ts`, plus the
consumers the trace lists. Hosted CI runs the rest. Apply the project's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written.

## Current decisions

- Reading a completed supplier's done record when the developer opens
  **Dependencies** is a requested read, as Intent's lens is; records nobody
  opens stay unread. Blob reuse keeps one read per record.
- SEED-336 (327 lines) and SEED-053 (253 lines) take label-only edits that keep
  their line counts. Seed format keeps a parent problem's stories in one seed,
  so splitting them is not a cohesive redesign; the 250-line gate's redesign
  rule targets code, tests, and maintained documentation.

## Readiness review

Slice-plan refinement was not needed: three independent outcomes, each with
one proof loop and no Structure preparation. No remaining slice-specific
concern was identified.

## Learnings

Slice 1: full `npm run lint` passed; independent refactor returned none — already clean (no edits or tests). Slice 1 acceptance: item 3 adds one sentence, no paragraph or section, in a 96-line source file. Existing seed-format line 74 and planning line 131 links already reach the contract. Representative walk from the contract yields `[Read CI history at a glance in story comparison and test Proof](SEED-331-read-ci-history-at-a-glance.md#read-ci-history-at-a-glance)`; the same sentence covers seed titles, retained revisions and resolving or flagging uncertainty. `git diff --check` passed. Consumer trace command: `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/follow-story-references-by-title --base de4da5c4a48418becb30b10deedc68c17e7e2237 --term 'Work item identity' --term 'identity.md' --term 'story links'`; dispositions retained at `/tmp/seed342-slice1-consumer-trace.md`. Direct source guidance consumers reuse inspected contract links; installed copies and unchanged allocation/provenance matches are unaffected. Freshness returned unchanged at claim revision; no incoming sibling change exists at that pinned trunk.


Slice 2 acceptance (`records-only`): 25 unique changed links, 36 occurrences in 13 audited files. `python3 /tmp/seed342-slice2-validate.py` and `git diff --check` passed. Manifest `/tmp/seed342-slice2-links.json` records each label, source line, exact current or retained target and title. Frontmatter, fenced facts and line counts unchanged; SEED-336 stays 327 lines and SEED-053 253. Distinct retained page-object sections, completed review cue and external Doughnut targets checked. Whole-seed walkthrough: `[Keep dashboard status current with SSE](SEED-336-live-dashboard-status.md)`, matching H1. Consumer trace `/tmp/seed342-slice2-consumer-trace.md` used the prior published base and SEED-331, SEED-333, both SEED-300 identities and SEED-145 effect terms; every row dispositioned. No executable consumer asserts these prose labels; direct manifest checks own proof. Freshness unchanged at claim trunk; no incoming sibling changes.

Required execution-completion attention: plan slice 2 leaves Taken references with their owners. SEED-332 seed lines 18, 21, 24, 47, 68 (provenance 5–6 unchanged); SEED-324 correction seed lines 17, 33, 37; plan 607 lines 11–12, 16, 68, 70, 148, 153. Details `/tmp/seed342-slice2-held-references.md`. Plan 610 preserved; no additional audited references.


Slice 3 acceptance: active titles resolve across Taken and Backlog by exact recorded identity; completed titles reuse `useDoneDetails` in the recorded explanation, only after opening. Rendered labels change; `follow({ project, identity })`, schemas and recovery remain unchanged. `docs/dashboard-navigation.md:238` describes targets, so needs no edit. Coordinator inspected same-seed href/focus assertions, project-specific same-identity title/href, held identity-to-title transition, failed attempts 1/2/3, exact before/after disclosure record sets, successful blob reuse and unavailable→recorded closed/no-read→open/one-read assertions. Source review rows map each promise.

Proof: `/tmp/seed342-slice3-proof.md` retains complete literal commands and inspected setup/assertion locations. Initial 24-test/11-file affected run had 23 passes and one old failed-record count assertion; requested title read adds an earlier failed attempt. The test now observes title failure, navigation failure and explicit Done retry independently (1/2/3). Full Done plus malformed, start-eligibility and canonical arrival/failure/recovery consumers passed 16 tests in 6 files. After explanation lifecycle extraction, `caffeinate -s -i npm run test:dashboard -- dashboard/tests/navigation/story-reference-done.spec.ts dashboard/tests/stories/story-dependencies-malformed.spec.ts dashboard/tests/observation/published-facts-arrival.spec.ts dashboard/tests/observation/published-facts-failures.spec.ts dashboard/tests/observation/transient-detail-recovery.spec.ts --workers=1` passed 15 tests. Earlier same-seed, cross-column/project, keyboard/touch, selection, navigation and startup proof remains compatible. Final `npm run typecheck:dashboard` and `git diff --check` passed.

Consumer trace `/tmp/seed342-slice3-consumer-trace.md` at base `677c4d21edbcdfef48b6f38cc81ef1f22ef3ae86` includes exported reference/disclosure helpers, canonical-facts observations and title/read effects; all 761 rows dispositioned. Direct Board, navigation and Done consumers plus canonical arrival/failure/recovery ran; workflow/schema/backend, installed guidance and independent fixtures have explicit exclusions. No uncovered affected consumer. Current edited dashboard files ≤217 lines before coordinator formatting.

Expensive proof decision: local macOS, AC; one worker under `caffeinate -s -i`, default budgets. Initial load 26.90/free42%, final reconsideration 23.36/free51%; another execution's product-wide E2E work preserved. No deferred required observation; all commands reached terminal results. Freshness unchanged at `de4da5c4a`, no incoming named sibling changes.

Delivery freshness: unchanged source at pinned trunk `07407e12b40115862205041f03e27851b361cfb2`; incoming `07407e12b` changes only DearDough.md/ProjectFindings.md, no attributable named-sibling product change or proof impact. Independent slice 3 refactor returned none — already clean, no edits or tests; proof and consumer trace remain valid. Read-only formatting preview keeps all dashboard files ≤240 lines.

## Story obligations

### G1. Replacement disclosure could inherit stale open state
Reported: slice 3 — "A temporary unavailable/not-recorded state could leave stale open state and read a new supplier title before its replacement disclosure opened."
Story clause: "Label each supplier with its story title, read by the recorded identity from the project's active work or the supplier's done record"
Disposition: proved by slice 3: `story-reference-done.spec.ts` replacement-disclosure journey; unavailable facts unmount the recorded explanation, restored closed disclosure reads zero new supplier records after request quiescence, opening shows its title with one read (final 15-test pass).


### G2. Incoming completion removed an audited link target
Reported: slice 2 — "Pinned trunk f258e463b removed SEED-331's completed section, so the audited live link would no longer reach its story after integration."
Story clause: "Apply the convention to the still-relevant references below."
Disposition: proved by slice 2: SEED-337 reference targets the exact title/anchor in retained sibling revision `33eb3f8cd99cb7e9131d072bf06576ef01cf3eaa`; full audited manifest validation passes.

## Wrap-up context

Execution handoff accepted `726de30444471bd59858e76867fa8e84d527a934` on the execution branch; completion succeeded as ignored-only evidence based on successful `fe1040f66e6bb20d894c8a300002efa444d0d6eb`, with confirmed observer shutdown. Attention handoff receipt `828f71a7-6470-4b08-82e0-64d0e631ffcd` retained Taken references. No lifecycle commitments are pending. Product advice remains no change; process review is selected and deferred until Intent Coverage report/disposition.

Retirement ownership: `refs/worktree/dough/created-for/SEED-342#follow-story-references-by-title` names this work. Management context `/Users/terryyin/git/open-dough/.git`; surviving reporting cwd `/Users/terryyin/git/open-dough`; attention file `/tmp/seed342-completion-attention.txt`; supplied reporting executable and landing context remain outside this checkout. Lasting UI rules are documented beside their component, within refactor3's accepted paths/trace, with no behavioral change or invalidated proof.

Closure-branch observer rearmed after confirmed prior shutdown: coordinator `seed342-viktor`, cell `g92:124`, session 70256, directory `/tmp/dough-ci-501/watch-qhgNye`, PID 33459; same verified checkout-bound runtime and GitHub Actions `ci.yml`. Final branch publication must use this exact live stream, then complete its accepted closure tip before trunk observation/integration.


Intent Coverage: **Caught**, checked `726de30444471bd59858e76867fa8e84d527a934`. The scratch seed-prefix-only lookup rendered both distinct supplier anchors as Story B; the maintained same-seed test caught the duplicate title at its first href assertion. Baseline/fault/restored selection was one test; baseline and restoration passed, original bytes/status matched and scratch was removed. Verbatim report and separate disposition are `/tmp/seed342-intent-coverage-combined.txt`. Retain the assertion; no actual defect, new proof action or follow-up is needed. Comment-only knowledge assimilation preserves applicability.

Deferred process review completed once using this conversation/tool results and the Intent Coverage report/disposition. E2E assertions verified the implementation after the seam was written; no test-first claim. One supported recurrence recorded under ODF-264: oversized required-reference, consumer-trace and process-argument reads caused truncation followed by targeted recovery. `DearDough.md` ordinary candidate 1,008 lines would overflow; bounded candidate 997 lines removes only 11 redundant blank separators, preserving every existing fact. Exact before-retention bytes verified at `726de30444471bd59858e76867fa8e84d527a934:DearDough.md`, linked in Retention; existing high-water remains 512. New concrete evidence outranks redundant spacing; no issue or occurrence fact was removed. No process guidance edit, correction plan or queue recommendation. No unresolved review input or required observation remains.


Deletion freshness reconciliation at `f258e463b8f310a094e346125595cf456d059897`: named SEED-331 landed through merge `743adc47f` and its completed section was removed while the follow-up remains in that shared seed. Its product changes touch none of Columns, StoryCard, Dependencies, publishedWork, doneDetails, Intent lens or storyNavigation; the direction-disclosure test changes use a separate settled-clock helper. Dependency proof remains applicable. The live audited SEED-337 reference now targets the exact completed section at sibling before-cleanup `33eb3f8cd99cb7e9131d072bf06576ef01cf3eaa`, whose title/anchor were inspected. `python3 /tmp/seed342-slice2-validate.py` rechecks the full audited manifest. This is a records-only reconciliation; accepted code proof and refactor dispositions remain valid.
