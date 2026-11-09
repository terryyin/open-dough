# Align story tab cost records, Taken heading, and wording

**Identity:** SEED-275#align-story-tabs-records

**Source:** [Align story tab cost records, Taken heading, and wording](../../seeds/SEED-275-story-intent-tabs.md#align-story-tabs-records)

**Source review:** [Independent source commitments](source-review.md)

## Provenance and findings

This plan is a retrospective correction of SEED-275#story-intent-tabs (plan
531, recoverable at `c764457107b1519655fbbe30a7b00274255d5d19:.planning/slice-plans/531-review-story-intent-tabs/PLAN.md`). The reviewed commits are `4a13bba4f` through `c48528409` on
`claude/review-a-selected-story-in-intent-tabs`. The findings were current at
`c48528409`:

1. Cost contract (introduced in `9f1baacfb`). In
   `dashboard/src/IntentPerspective.tsx:75-81`, the trunk provider stays
   active after the first Project Intent showing, and the story provider stays
   active during a visit. `useIntentCiJudgment.ts` re-reads on each new
   observed head of an active target. `dashboard/GITHUB-REQUESTS.md:36-42`
   and `docs/dashboard-development-intent-ci-status.md:73-77` still say
   re-reads happen "while shown". No spec counts CI reads across a visit, a
   trunk advance while the story shows, or a story push during a visit.
2. Taken heading (introduced in slice 1; plan 531 handed it to slice 5, which
   dropped it). `dashboard/src/IntentCiJudgedBranch.tsx:123` renders "Story
   branch of {title}." under the persistent header. It is asserted at
   `dashboard/tests/intent/intent-ci-status-story.spec.ts:51` and
   `intent-ci-comparison-taken.spec.ts:41`.
3. Stale wording. "on Intent's homepage" appears in `IntentCiComparison.tsx:1`,
   `storyCiComparisonEntries.ts:1,9`, `storyCiComparisonWording.ts:1` and
   `IntentCiStatus.tsx:11`. "One segmented strip" appears in
   `IntentModeTabs.tsx:9`. The titles "choose Intent again" and "activating
   Intent" appear in `intent-home-activation.spec.ts:141,173,184`.
   `intent-ci-status-story.spec.ts:8,55` describes the story summary and the
   homepage.

## Preserved promises and constraints

- The CI behavior of SEED-275#story-intent-tabs stays as delivered. The trunk
  stays followed after the first Project Intent showing, and the story stays
  followed while it is selected; that was slice 2's recorded decision. This
  correction documents and proves that cost; it does not change it.
- The branch name, judgment, and `branchJudgmentCalls` assertions in
  `intent-ci-status-story.spec.ts` stay.
- ADR 0008: one page-owned Selected story.
- Test data goes through MakeMe. No sleeps, no `test.slow()`, and default
  timeouts. A failing or flaky test is a defect to fix, as
  [AGENTS.md](../../../AGENTS.md#failing-and-flaky-tests) states.

## Current decisions

- A Taken story's CI status names the role, for example "Story branch.",
  without the title. The persistent header already shows the title once.
- The wording pass changes comments and test titles only.

## Execution context

- Established Story Branch Mode checkout: `/Users/terryyin/git/open-dough/.worktrees/align-story-tab-cost-records-taken-heading-and-w`, branch `codex/align-story-tab-cost-records-taken-heading-and-w`.
- Identity `SEED-275#align-story-tabs-records`; publisher `dashboard-territory.local-open-dough`; agent `ziqing-chan`.
- Starting revision `a328505ac31b8da3f972b6eb6c47840170d90e80`; accepted claim `82fc915034f4262553561a1c79de876040738677` on `origin/main`. Claim CI is unobserved. Ordinary increments target the same-named remote execution branch.
- Default/integration checkout: `/Users/terryyin/git/open-dough`; do not change its unrelated work.
- Checkout setup: `npm ci`, then `npm run typecheck:dashboard`, both passed with the current lockfile.
- Existing planning authority allows in-scope refinement; no numeric slice budget is supplied. Keep one coherent proof loop per slice.
- CI source: GitHub Actions, local push workflow `ci.yml` (CI). Provider diagnostic verified selector `ci.yml`, active workflow ID `351271804`, name `CI` after the directed request pause.
- CI observer: coordinator `seed275-tabs`, key `ci-watch-execution:terryyin/open-dough:codex/align-story-tab-cost-records-taken-heading-and-w:seed275-tabs`, directory `/tmp/dough-ci-501/watch-0uCaJ7`, PID `20967`, session `28742`, yielded cell `g13:12`; checkout is the execution checkout above. GitHub subsequently directed a request pause until `2026-11-09T01:08:56.382Z`; observer retains coverage and resumes automatically.
- Slice 1 accepted on the remote execution branch at `0d0ac0a1f652ff3938933ff71b72de8d49d69154`, suffix base `82fc915034f4262553561a1c79de876040738677`. Guarded selective formatting, staged lint/typecheck hooks, agent commit, push confirmation and observer registration all succeeded. This accepted revision is the base for slice 2.

## Outside-in proof

| Promise | Owner | Observable check |
| --- | --- | --- |
| Accurate, protected follow cost | 1 | Protect `intent-project-visit-ci.spec.ts` with CI request counts: going to Project Intent and back asks CI nothing new; a trunk advance while the story shows reads exactly the trunk judgment; a story-branch push during a visit reads exactly the story judgment. The docs describe that. |
| Taken title once | 1 | The Taken story's CI tab shows its title only in the header; the branch name and judgment assertions stay. |
| Wording matches the delivered UI | 2 | The comments and test titles named above use the current names; the Intent suite still passes. |

## Slices

### 1. State and prove the story tabs' CI follow cost and the Taken heading

Type: Behavior
Status: done
Proof: the first two rows above, through the real scope controls and the
existing CI host fixtures with request counting; also run the
`intent-ci-status*` and `intent-ci-comparison-taken` consumers.

A maintainer reading the request docs sees the actual follow cost, and a
change to it fails a test. A developer on a Taken story sees its title once.

Implementation proof: `caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-project-visit.spec.ts dashboard/tests/intent/intent-ci-status-story.spec.ts dashboard/tests/intent/intent-ci-comparison-taken.spec.ts dashboard/tests/intent/intent-home-activation.spec.ts dashboard/tests/intent/intent-ci-status-story-gaps.spec.ts` passed (12 tests across five files, terminal exit 0).
The visit journey observes zero repeat-visit judgment calls, three hidden-trunk
refresh calls, and four story refresh calls during a visit, then the current
result on returning without additional calls. Setup first visits Project Intent
after selecting the story, because selecting through Development remounts
Intent. The initial run caught that setup omission; corrected proof passed.
The Taken status and comparison observations retain branch/judgment assertions,
show the role-only line, and reject a title repeated below the persistent header.
Consumer traces: `/tmp/seed275-slice1-consumer-trace.md` and
`/tmp/seed275-ci-run-consumer-trace.md`; whole Intent consumer proof was completed by the coordinator after the independent refactor pass.

Independent refactor `/root/refactor1` returned `## REFACTOR COMPLETE`. It split
visit reading, CI-follow, and selection journeys into cohesive specs, extracted
verbatim request-owner guidance into linked `dashboard/GITHUB-REQUEST-OWNER.md`,
and shortened MakeMe whitespace. Every touched non-plan file is at most 250 lines.
`caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-project-visit.spec.ts dashboard/tests/intent/intent-project-visit-ci.spec.ts dashboard/tests/intent/intent-project-visit-selection.spec.ts` passed (three tests, terminal exit 0).
Heading proof and the follow contract stayed unchanged. Replacement CI journey
proof retains the same setup and zero/three/four assertions; selection test body
and extracted owner prose were compared verbatim. Trace and content/link evidence:
`/tmp/seed275-refactor1-consumer-trace.md`.
Post-refactor typecheck found an unused `parts` import in the reading spec;
the coordinator removed it within the already-traced refactor boundary.
`npm run typecheck:dashboard` then passed; runtime proof remains unchanged.

Final local gates: `caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent` passed (terminal exit 0), as did `npm run typecheck:dashboard`. This covers every deferred Intent consumer in the implementation trace. The final whole-directory run used two workers on AC, load about 7.2 and free memory 55% at launch. Hook-owned staged lint remains part of guarded commit.

Heavy-proof decision: this macOS host is on AC, load about 5.7 and free memory
85% at implementation launch. Another worktree was running two launch-test
workers. The bounded focused run used `caffeinate -s -i`; reconsider load before
the final Intent gate or any repeated expensive proof.

### 2. Correct stale story tab wording

Type: Structure
Status: done
Proof: the third row; typecheck and the touched Intent specs.

Implementation `/root/slice2` corrected comments and test titles in seven named
files, with no runtime/assertion/fixture/selector changes.
`caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-home-activation.spec.ts dashboard/tests/intent/intent-ci-status-story.spec.ts`
passed (five tests in both files, no grep, terminal exit 0). Setup and assertions
remain unchanged: story/header retention, independent Project Intent selection,
keyboard versus direct activation, revision notice, branch judgment/request counts
and selection replacement. Consumer trace `/tmp/seed275-slice2-consumer-trace.md`
finds no external selectors using retired exact titles; file discovery and shard
paths stay unchanged. Conditional wording categories absent from touched test
titles required no invented edits. Proof ran on this macOS host on AC under
`caffeinate -s -i`, load about 5.6, free memory 57%, with two workers.
The prior whole Intent proof remains valid for unchanged runtime behavior.
Independent refactor `/root/refactor2` returned `none — already clean` and
`## REFACTOR COMPLETE`, with no edits or redundant test runs. Its read-only
TypeScript comparison confirmed all seven files match their prior runtime after
excluding comments and titles; maximum file size is 248 lines. Setup, assertions,
selectors, imports and selected spec paths are unchanged. `git diff --check` passed.

## Retrospective

Reviewed the original selected correction and execution-ready plan at the Take,
then both attributable implementation commits: `0d0ac0a1f652ff3938933ff71b72de8d49d69154`
(cost/heading/tests/docs) and `0ab4b94e6ae91340b0d769e2afd6083c0b5ccf5d`
(comment/title wording). Their remote acceptance and observer registration are
confirmed; the latter extends the former. Claim `82fc915034f4262553561a1c79de876040738677`
is provenance. Concurrent trunk preparation, test-count queueing, and Claude
effort work are excluded from this execution's manifest.

Outcome review: the aggregate changes satisfy the original source, preserve
ADR 0008's page-owned Selected story, and leave CI-follow implementation unchanged.
The new integrated journey observes provider lifecycle through actual scope
controls; its distinct zero/three/four request deltas justify retaining it.
Reading/selection journeys survive the refactor with unchanged assertions.
No product defect, architectural conflict, or actionable test-cleanup residue was
found in the affected concept and relevant existing consumers. Existing broad
Intent proof plus both focused returns and final hooks support this conclusion;
remote CI remains pending under GitHub's directed API pause.

Process review was enabled by project configuration and used this conversation,
agent returns and tool results. It recorded this execution's recurrence under
existing ODF-396 in `DearDough.md` (786 physical lines): the comment/title trace
had 628 lines and 402 located rows matching automatically derived `PLAN.md`.
No missed consumer was observed. No guidance or backlog was changed. The initial
journey-setup error and unused moved-spec import were repaired before publication.

## Execution complete

Product advice: no change. This bounded correction aligns the request contract,
its regression proof, and the visible Taken heading with the delivered story tabs;
it supports the current direction without introducing another product outcome.

## Proof and delivery gates

Run the focused specs and the whole `dashboard/tests/intent` directory once
before delivery, along with typecheck and lint. **Local gate.** On AC power,
start fully awake under `caffeinate -s -i` for long runs. On battery, start
fully awake with the lid open under `caffeinate -i` and inspect the sleep log.
Follow [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)
and [failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests).

## Decisive premises

The retrospective's outcome review at `c48528409` observed the findings at
the cited lines. A coordinator spot check confirmed
`IntentCiJudgedBranch.tsx:122-124`, `IntentPerspective.tsx:74-81`, and the
two docs' "while shown" clauses. Request-count fixtures already exist
(`branchJudgmentCalls` in `intent-ci-status-story.spec.ts`).

## Preparation review

Refinement was not needed: there are two slices, each with its own proof and
no interim behavior. No slice-specific concern remains.
