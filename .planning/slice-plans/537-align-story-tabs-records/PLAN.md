# Align story tab cost records, Taken heading, and wording

**Identity:** SEED-275#align-story-tabs-records

**Source:** [Align story tab cost records, Taken heading, and wording](../../seeds/SEED-275-story-intent-tabs.md#align-story-tabs-records)

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

## Outside-in proof

| Promise | Owner | Observable check |
| --- | --- | --- |
| Accurate, protected follow cost | 1 | Extend `intent-project-visit.spec.ts` with CI request counts: going to Project Intent and back asks CI nothing new; a trunk advance while the story shows reads exactly the trunk judgment; a story-branch push during a visit reads exactly the story judgment. The docs describe that. |
| Taken title once | 1 | The Taken story's CI tab shows its title only in the header; the branch name and judgment assertions stay. |
| Wording matches the delivered UI | 2 | The comments and test titles named above use the current names; the Intent suite still passes. |

## Slices

### 1. State and prove the story tabs' CI follow cost and the Taken heading

Type: Behavior
Status: planned
Proof: the first two rows above, through the real scope controls and the
existing CI host fixtures with request counting; also run the
`intent-ci-status*` and `intent-ci-comparison-taken` consumers.

A maintainer reading the request docs sees the actual follow cost, and a
change to it fails a test. A developer on a Taken story sees its title once.

### 2. Correct stale story tab wording

Type: Structure
Status: planned
Proof: the third row; typecheck and the touched Intent specs.

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
