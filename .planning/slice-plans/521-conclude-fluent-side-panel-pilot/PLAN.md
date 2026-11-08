# Draw a conclusion from the three Side panel pilot journeys

**Identity:** SEED-268#conclude-fluent-side-panel-pilot

**Source:** [Refined story](../../seeds/SEED-268-fluent-side-panel-pilot-follow-up.md#conclude-fluent-side-panel-pilot)

**Source review:** [Independent source commitments](source-review.md)

## Goal and scope

Give dashboard test maintainers one evidence-linked assessment of where fluent
phases earned their cost and what, if anything, is worth trying next. Compare
the original and revised pilot against the procedural baseline where there is
comparable evidence. Deliver the assessment in the existing
[browser journey guide](../../../dashboard/tests/writing-journeys.md#fluent-phases-in-the-side-panel-content-journeys),
which already explains the design and remains after plan cleanup.

The story evaluates and recommends. A further trial, changes to specs or
helpers, and a rollout belong to separately authorized work. Wider adoption
is the developer's decision.

## Current decisions

- Use the two landed evaluations and the pilot specs as sources. Reuse the
  guide's account of locator ownership, phase navigation, and values read
  between phases. Keep the result alongside that account so maintainers can
  find the evidence for where they encounter the pattern.
- Apply [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Label the retrospective comparison exploratory. Weigh the demonstrated
  benefit against edit, reading, diagnostic, and helper costs. Distinguish a
  measured result, a source inspection, and a prospective gain. Timing samples
  provide run context and cannot establish a speedup.
- Use the dashboard concepts from
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
  The assessment concerns test design for the existing journeys.

## Decisive premises

Both observations below ran in the preparation worktree at `35ee34955`.
The slice consumes these pinned records through the same Git reads.

- `git show e0d4735e14ff40c64151d878d504af9aeab1515c:.planning/slice-plans/506-pilot-fluent-dashboard-page-objects/PLAN.md`
  returned **Pilot evaluation**, including the procedural comparison, rename
  experiment, diagnostics, and the original navigation and helper costs.
  The evaluation revision is an ancestor of the pilot landing `77741589a`.
- `git show 5217098d1bd32ad7f317d3f995a4f6807fd821b4:.planning/slice-plans/516-adjust-fluent-side-panel-page-objects/PLAN.md`
  returned **Revised design evaluation**, including three passing journeys,
  the compared step trees, the reverted extension and failure probes, and
  the sizes. The evaluation revision is an ancestor of the revision's landing
  `07dccccf8939572c8c99e8c15ec4d56795f406e9`.
- Both landings are ancestors of the preparation revision. The retrospective
  consumes recorded results. A proposed next trial's execution environment
  is outside this slice.

## Outside-in proof

| Promise from the seed | Owner | What a guide reader can verify |
| --- | --- | --- |
| All three journeys inform the conclusion | Slice 1 | A separate comparison for review/report replacement with the held response and panel controls, review/report retention with file selection across Board and Intent, and Terminal replacement with same-session reattachment. The reader can trace each to its spec and distinguish the passing runs from the step-tree comparison with the Terminal session ID masked. |
| The trade-off is visible | Slice 1 | The reader can trace the original three-to-one pilot rename and revised single-owner source check separately. The assessment describes the spec reading changes, the test/phase/cue failure with expected and received values and no later cues, and the helper-line code frame. It explains both the largest-module reduction (246 to 173) and the total runner/helper increase (709 to 761) with unchanged pilot spec lengths, and bounds the extension evidence to one reverted hand-off. |
| The next decision is actionable | Slice 1 | The reader finds either a stopping point and evidence that could reopen it, or one named existing candidate, its bounded scope, and what preserved behavior, maintainer gain, and diagnostic and helper costs would justify proceeding. A proposal states when to stop and identifies the developer's adoption decision. |

## Local gates

Read the resulting guide as a maintainer would and reconcile the statements
and links with the pinned evaluations and named spec cases. Run
`git diff --check`. The proof is the assessment and its traceable evidence.
The historical browser runs supply the observations for this comparison.

Follow the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. For any long local test run, start fully awake on macOS. On AC
use `caffeinate -s -i`. On battery, plug in or start fully awake with the lid
open under `caffeinate -i` and inspect the sleep log afterward.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

## Slices

### 1. Maintainers can decide whether to extend the pilot

**Type:** Behavior

**Status:** done

Given the original and revised records, a maintainer opening the guide's
fluent phases section can follow the evidence for all three journeys, judge
the cost and limits, and see the supported next step. Add the assessment and
check the reader-visible outcome against all three proof rows. The reviewed
guide entry is the safe stopping point.

## Preparation review

Slice-plan refinement was unnecessary. The evidence and recommendation form
one reader-visible decision with one source review loop. No remaining
slice-specific concern surfaced.

## Execution resume

- Identity `SEED-268#conclude-fluent-side-panel-pilot`, publisher
  `dashboard-territory.local-open-dough`, agent Jane-chan, Story Branch Mode.
- Execution checkout `/Users/terryyin/git/open-dough/.worktrees/draw-a-conclusion-from-the-three-side-panel-pilo`,
  branch `codex/draw-a-conclusion-from-the-three-side-panel-pilo`. Default
  checkout `/Users/terryyin/git/open-dough`, integration target `origin/main`.
- Starting revision `6c983df4fa49e218650c4e0b4f81e9ee93064d19`. Accepted claim
  and initial branch publication `ef5c3aca3158eacd1deb4b4a11e96ce4f64a9bd6`.
- Locked `npm ci` and `npm run lint` passed in the execution checkout.
- CI source GitHub Actions `terryyin/open-dough`, workflow `ci.yml` (CI),
  branch `codex/draw-a-conclusion-from-the-three-side-panel-pilo`, Codex
  coordinator `Jane-chan-521`, directory `/tmp/dough-ci-501/watch-Cd0a8z`,
  PID `6924`, stream session `90558`, cell `g118:16`.

## Slice 1 proof

The [guide assessment](../../../dashboard/tests/writing-journeys.md#what-the-pilot-earned)
was read against both pinned `git show` records under Decisive premises and
against the spec cases linked in its table. For replacement, the released
held read leaves Story B’s identity and files visible, and the divider is
exercised with mouse and keyboard. For retention, the chosen file and diff
survive both perspective changes and the request log distinguishes Intent’s
comparison. For Terminal replacement, the attach count and kept record
identify reattachment to the same session. Historical results, including the
masked tree comparison and restored controlled failure, were reused.

`git diff --check` passed. Consumer trace passed using
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout "$PWD" --base ef5c3aca3158eacd1deb4b4a11e96ce4f64a9bd6 --term writing-journeys.md --term fluent-phases-in-the-side-panel-content-journeys --term 'What the pilot earned' --term 'slice-plans/521-conclude-fluent-side-panel-pilot/PLAN.md'`
from the execution checkout. Inspected the README and native fixture guide
entry links and selected seed link. The unrelated timing guidance link and
workflow plan references retain their targets, and generic plan/source-review
basename matches have no dependency on this text. No executable consumer
changed.

The independent refactor linked procedural proof directly and tightened the
named negatives and recommendation text. Rechecked the procedural proof link,
nine named call sites, guide consumer links and `git diff --check`. The three
journey, diagnostic and size observations remained applicable.
