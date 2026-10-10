# Automatically land completed slice planning when no coordinator question remains

**Identity:** SEED-128#land-planning-without-coordinator-questions
**Source:** [refined story](../../seeds/SEED-128-automatic-preparation-handoffs.md#land-planning-without-coordinator-questions).
**Prepared:** 2026-10-10, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/automatically-land-completed-slice-planning-when`
on `claude/automatically-land-completed-slice-planning-when`, under the
preparation assignment for `ebacky-chan` (announced at `e1b0a009`, continued
for this plan). Publication target: `origin/main`; integration checkout:
`/Users/terryyin/git/open-dough`.

## Goal and boundaries

When a queued story's preparation ends with slice planning, and any slice-plan
refinement it invokes, with no open coordinator question and no opt-out, the
agent lands the retained preparation on remote main through the existing keep
sequence and Dough Land: seed, plan, recorded facts, and the Preparing
assignment's end in one commit, with no keep instruction from the coordinator.

In scope, from the story: the landing default at the end of preparation for a
queued story with an announced assignment (planning after refinement, planning
as the session's first activity, and a slice-plan refinement invoked directly
on that story's plan), entered through preparation disposition's keep sequence
with `release` staged; landing whatever the recorded assessment; stops for an
open coordinator question (Needs human engagement, missing context, disputed
constraint or Escalate finding, resplit recommendation, stopped write or
recording) and for the landing's own stops, each retaining the draft and
assignment; the `--retain` opt-out as a refinement option the dashboard offers
from the options file; the dashboard completion report as the final operation;
one landing policy in the preparation journey that the three preparation
skills link to; the slice-planning skill back under the 250-line limit; and a
concise ADR 0007 update.

Material exclusions, from the story: landing comparison receipts
(`landing-context.json`) for announced launches; dashboard dialog wording;
automatic landing for decomposition results or sessions ending at refinement;
the one-shot refinement journey's review default and `--auto-land`; ADR 0009;
ADR status changes. No script changes: `release`, Dough Land, the candidate
check, and completion reporting already exist and stay as they are.

Assumptions: the announcement's `--push-authorized` is publication authority
for landing to the same target; the recorder's state block is the only
readiness statement, so a `not-ready` plan lands as truthful preparation.

## Published baseline and integration context

Origin was fetched at `e1b0a009` by this plan's `start` (`continued`). The
highest plan directory on that history is `289`;
`290-land-planning-without-coordinator-questions` was free immediately before
this write. The workspace is at `e1b0a009` plus the refined seed. The installed
copies under `.claude/skills/` and `.agents/skills/` are a released payload and
are not edited here (AGENTS.md); `src/skills/` is the source.

No North Star topic governs the landing default. "Composable session policy
and workflow-owned start" (`.planning/NORTH-STAR.md`) keeps landing a policy
the installed contract supplies, which the opt-out as an installed refinement
option follows. ADR 0002 (one representation per conceptual solution) shapes
the shared keep sequence below; ADR 0006 (write for executing agents) shapes
the wording. No Accepted ADR conflicts; this plan adds no topic.

## Existing solutions and selected approach

| Need | Finding |
| --- | --- |
| Land a preparation result with its assignment ended | **Reuse** [Keep and publish the retained result](../../../src/skills/dough-story-refinement/references/preparation-disposition.md#keep-and-publish-the-retained-result): validation, `release` staging, Dough Land, confirmation. Dough Land already lands a preparation keep's staged release (`dough-land/SKILL.md`, "A preparation keep stages its assignment's release"). The journey gains an entry into that sequence; the sequence is not copied. |
| A second automatic entry already exists | **Change** one-shot refinement's [Land automatically when selected](../../../src/skills/dough-story-refinement/references/one-shot-refinement.md#land-automatically-when-selected): it is an advance keep with `recheck` as its candidate check and no release. Disposition's keep section names both entries and what each supplies (condition, candidate check), so the sequence has one home. |
| An opt-out the dashboard offers | **Reuse** [refinement options](../../../src/skills/dough-story-refinement/references/refinement-options.json): the dashboard reads the installed file afresh (`dashboard/AGENT-LAUNCH-OPTIONS.md`); an added entry appears in the dialog on release with no dashboard change. `--refine-only` is the model. |
| The final dashboard operation | **Reuse** [dashboard completion](../../../src/skills/dough-land/references/dashboard-completion.md): Dough Land's completion attention already runs it. Announced launches carry no `landing-context.json` (`dashboard/server/completionReporting.ts` writes it for one-shot only); reporting stays available. |
| Room in the slice-planning skill | **Gap.** `src/skills/dough-slice-planning/SKILL.md` is 250 lines; the limit is the post-change-refactor rule (`refactor-checks.md:128`). Slice 1 moves the premise-settling procedure to a reference. |
| Guidance proof | **Reuse** the `node --test` guidance tests in `src/skills/dough-story-refinement/scripts/` (`preparation-journey-guidance`, `refinement-outcome-guidance`, `established-preparation-guidance`, `one-shot-refinement-guidance`), which pin section wording and links; `scripts/test.sh` schedules them one job per file. |

## Current decisions

- One landing policy, written once in the preparation journey's end section.
  Story refinement, slice planning, and slice-plan refinement end by linking
  there; none keeps its own disposition paragraph.
- The keep sequence stays in preparation disposition. Its "Decide what happens"
  section lists three keep sources: an explicit keep instruction, the journey
  default at preparation's end (candidate check: `release` staging), and
  one-shot `--auto-land` (candidate check: `recheck`). Validation and the
  landing steps are shared and unchanged.
- An open coordinator question is a response the preparation needs before its
  result is complete. A recorded `not-ready` reason, early probe slice, or
  pre-Take decision already named in the plan is part of a complete result.
- `--retain` is an ordinary option (no exclusive group); it composes with
  every option and focus. `--refine-only` stays as it is and never lands.
- Guidance changes are proved by the guidance tests, rewritten to pin the new
  wording with the same discrimination the current tests have (observed below).
  The ADR change has no test; its proof is a read against the journey's words.

## Decisive premises and observations

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The guidance tests pin the journey's current authority wording and discriminate | Slices 2 and 3's proof | In this workspace: `node --test` on the four refinement guidance test files, 29 tests pass. Scratch edit replacing "explicit keep." in `preparation-journey.md` with other words, same command on `preparation-journey-guidance.test.mjs`: 8 pass, 1 fail; edit reverted. | Confirmed: the tests are the discriminating proof and must be rewritten with the text. |
| The slice-planning skill has no room | Slice 1 | `wc -l src/skills/dough-slice-planning/SKILL.md` = 250; the limit is `refactor-checks.md:128`. Only `preparation-journey-guidance.test.mjs` pins text of that file (its "Stay within the triggering instruction" section); nothing pins the premise paragraphs. | Confirmed. |
| `release` staging and the landing retry are the working mechanics the journey will enter | Slice 2 | `node --test` on the seven `preparation-assignment-*.test.mjs` files naming `release-staged`/`already-released`: 16 pass. Dough Land's text takes a staged release (`dough-land/SKILL.md:88-90`). | Confirmed; no script change planned. |
| An added option reaches the dashboard without dashboard code | Slice 3 | `dashboard/src/commandOptions.ts` reads options and optional groups; `AGENT-LAUNCH-OPTIONS.md` says the dialog reads the installed definition afresh. The dashboard reads the installed copy, which changes on release, so the dialog shows `--retain` after the next release, not from this landing. | Confirmed by reading the schema (`groups` optional, entries flat); the appearance in the dialog is a release-time fact and not this story's proof. |
| Announced launches carry no landing context | Scope (exclusion) | `completionReporting.ts:77-80`: `landing-context.json` is written only when `isEstablishedOneShot(established)`. | Confirmed. |

## Outside-in proof ownership

| Promise (story example) | Owning slice | Proof |
| --- | --- | --- |
| Planning with no concern lands as one commit, report last (1) | 2 | `preparation-journey-guidance.test.mjs` pins the end section: `release`, Dough Land, one snapshot, completion report final; `refinement-outcome-guidance.test.mjs` pins the ready outcome continuing to planning and landing. |
| Planning, then plan refinement, then landing with no approval step (2) | 2 | Same tests: refinement is part of planning, no second report. |
| A `not-ready` plan lands (3) | 2 | Journey test: "recorded assessment does not gate landing". |
| Resplit recommendation or Escalate stops landing (4) | 2 | Journey test: the open-question list names them; draft and assignment retained. |
| `--retain` finishes preparation and retains (5) | 3 | Journey test: options file defines `--retain` once, its summary and instruction; end section names it. |
| `story-left-queue` lands nothing (6) | 2 | Journey test: landing stops keep disposition's handling; `preparation-assignment-land.test.mjs` already proves the receipt. |
| Unreverted scratch edit stops before commit (7) | 2 | Journey test: the end section enters the keep sequence's validation. |
| One policy, skills link to it (scope) | 2 | Journey test: slice planning's and plan refinement's final sections link to the journey end, and neither carries "keep or discard decision" text of its own. |
| Skill under the limit (scope) | 1 | `wc -l` ≤ 250 after slice 2's additions; existing tests pass. |
| ADR 0007 states the default and opt-out (scope) | 4 | Read of the changed lines against the journey end; `node scripts/lint.mjs` passes. |

## Ordered slices

### 1. Slice planning's premise-settling procedure moves to a reference
Type: Structure
Status: planned
Proof: `node --test src/skills/dough-story-refinement/scripts/preparation-journey-guidance.test.mjs`
passes unchanged; `wc -l src/skills/dough-slice-planning/SKILL.md` is at most
200; every link into `#write-the-plan` (record-preparation.md, planning.md)
still resolves to an existing heading.

Structure: Move the paragraphs from "A decisive premise is a factual claim"
through "Such a plan can be `ready`; the probe's observation keeps its
existing authority requirements." into
`src/skills/dough-slice-planning/references/settle-decisive-premises.md`,
leaving in "Write the plan" one paragraph that defines a decisive premise and
links there. External behavior unchanged. Enables slice 2's link and end
section in this skill.

### 2. Completed preparation lands by default at the journey's end
Type: Behavior
Status: planned
Proof: `node --test src/skills/dough-story-refinement/scripts/*.test.mjs`
passes with `preparation-journey-guidance.test.mjs`,
`refinement-outcome-guidance.test.mjs`, and
`established-preparation-guidance.test.mjs` rewritten to pin the new end
section, the three keep sources in disposition, the one-shot entry's naming,
and the three skills' links; a scratch removal of the end section's landing
sentence fails the journey test before the edit is reverted.

Behavior: A queued story's preparation in an announced workspace → slice
planning records its readiness assessment (with any plan refinement it
invoked), or a directly invoked slice-plan refinement records its
reassessment, and no open coordinator question or opt-out remains → the agent
enters disposition's keep sequence: validate the workspace holds only this
preparation's result, stage `release`, land through Dough Land, report
publication, refresh, retirement, and the dashboard completion as the final
operation. `preparation-journey.md`: "Stay within planning authority" becomes
"Land at the end of preparation" (what ends preparation, the open coordinator
question defined by its list, assessment does not gate, the entry, stops that
retain draft and assignment with the expected response, landing stops under
disposition's handling), and "Report once at the end" carries the landing
result. `preparation-disposition.md`: "Decide what happens" names the three
keep sources with each one's candidate check; `established-preparation.md`
continues to the journey's end. `one-shot-refinement.md`'s automatic section
names itself as the one-shot entry of that sequence. `dough-story-refinement`,
`dough-slice-planning`, and `dough-slice-plan-refinement` SKILL.md end by
linking to the journey end instead of their keep-or-discard paragraph;
slice planning's continuation bullet points there.

### 3. `--retain` keeps the result for an explicit keep
Type: Behavior
Status: planned
Proof: `node --test src/skills/dough-story-refinement/scripts/preparation-journey-guidance.test.mjs`
with a test that the options file defines `--retain` once with label "Retain
for review", a summary naming an explicit keep, an instruction that finishes
preparation and records the assessment, and no group; and that the journey
end names `--retain` and an ordinary-language equivalent as the opt-out.
`node -e` parse of the JSON succeeds.

Behavior: An invocation carrying `--retain` (or an ordinary-language
instruction to leave landing for later) → preparation finishes and records
its assessment → the result stays in the workspace with its Preparing
assignment; the report gives the result's location and an explicit keep as
the next step, and says others still see the story as Preparing. The option
joins `refinement-options.json` after `--refine-only`; `--refine-only` is
unchanged and never lands.

### 4. ADR 0007 states the default and its opt-out
Type: Behavior
Status: planned
Proof: `node scripts/lint.mjs` passes; a read of the changed ADR lines
against the journey end finds the same default, opt-out, stops, and "no
execution authority" statement, and no remaining "explicit keep" default.

Behavior: A reader of ADR 0007 → the shared assignment rule ("announcing work
does not authorize landing"), the planning paragraph ("preparation grants
neither execution nor publication authority"), Story Branch Mode step 2, and
the flow edge "Explicit keep instruction" → read that completed preparation
lands on `main` by default with `--retain` or an ordinary-language opt-out,
that an open coordinator question retains the draft, and that landing grants
no execution authority. The "Revised" line gains the date; status stays
Proposed.

## Considered and excluded

- A new script or receipt for the automatic landing: `release` plus Dough
  Land is the mechanism; nothing mechanical changes.
- Dashboard changes (dialog wording, landing-context capture for announced
  launches): deferred by the story.
- Moving the slice-planning "Stay within the triggering instruction" section
  to a reference instead of the premise procedure: the journey test pins that
  section's text and location; the premise procedure is unpinned and larger.
- ADR 0009 edits: its text describes workspace freshness and owned inputs,
  which this story leaves true.
