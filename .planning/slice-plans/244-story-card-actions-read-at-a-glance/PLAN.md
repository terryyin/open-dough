# Story card actions read at a glance

**Identity:** SEED-098#story-card-actions-read-at-a-glance
**Source:** [refined story](../../seeds/SEED-098-story-card-actions-read-at-a-glance.md#story-card-actions-read-at-a-glance).
**Prepared:** 2026-10-04. Planning only, in the established preparation workspace.

## Goal and boundaries

A developer scanning story cards sees who is working on an engaged story
(agent, credited human, tool, model) and reads each card action's purpose and
state from the control: launch notes move from card text into a hover/focus
tooltip that stays the button's accessible description, and every card action
gets an icon that says what it does.

Scope, decisions, and key examples are those of the source story. Material
exclusions:

- Moving disabled-start reasons (open session, unread evidence, dependency
  problem) into a tooltip.
- Touch-specific hover substitutes; the launch dialog already states the note.
- Showing the mode or branch context on the scan view; they stay in
  **Inspect story**.
- Changing failed or uncertain launch answers, which stay visible text.

## Direction and PFE

Reuse, do not add: the frame's `Icon` and styled `frame-tooltip`
(`dashboard/src/Icon.tsx`, `src/icon-control.css`), the frame disclosure's
turning-chevron look (`src/frame-controls.css`), and the assignment facts the
detail already renders (`RecordedFacts` in `src/AssignmentRecords.tsx`,
`HumanCredit` in `src/HumanCredit.tsx`). The labelled-button tooltip extends
the frame's existing tooltip rather than adding a second tooltip style;
`dashboard/README.md#look-and-controls` names the shared foundation to extend.
No new consequential direction; no North Star topic.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Every launch note (“Not marked Ready for execution”, “Being prepared”, “Started here, no session yet”) reaches the card only through `StartLaunch`'s `note` prop, rendered as `.start-launch-note` beside the button and joined to its `aria-describedby` | Slice 2 | Read `dashboard/src/StartLaunch.tsx` and `src/CardLaunches.tsx` (`note={... keptStartNote : launchWorkflows[workflow].note(entry)}`) | Holds |
| The launch dialog already states the note | Slice 2 touch path | `StartLaunch` passes `note` to `LaunchDialog`, which renders it (`src/LaunchDialog.tsx:173`) | Holds |
| The styled tooltip exists only inside `IconButton` (`.icon-control > .frame-tooltip`) | Slice 2 | Read `src/Icon.tsx`, grep `frame-tooltip` in `src/*.css` | Holds: must be extended to a labelled button |
| Mode, host, model and the credited human left the scan view in `c58dc07d` (SEED-091) and now render only in `AssignmentDetail` | Slice 1 | `git show c58dc07d -- dashboard/src/AgentAssignmentFacts.tsx`; read `src/AssignmentRecords.tsx` | Holds; `RecordedFacts` and `HumanCredit` are reusable |
| Existing proofs assert the current absence and visible notes, and run green locally | Slices 1–2 | `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts dashboard/tests/taken-agent-profile.spec.ts dashboard/tests/agent-launch-card-noted-start.spec.ts` | 3 passed. `taken-agent-profile.spec.ts` and `backlog-preparing.spec.ts` assert host/model/human are **not** on the card; `agent-launch-card-noted-start.spec.ts` asserts the note visible in the launch group |
| Inspect story is a `<button aria-expanded>` toggling “Inspect story” / “Hide detail” (`src/WorkCard.tsx`); Review changes is a plain `start-launch-button` (`src/StoryReviewAction.tsx`) | Slice 3 | Read both files | Holds; the frame disclosure styles a `<summary>`, so only its chevron glyph and turn are reused |

Other specs read a note with `toContainText` on the card
(`agent-launch-start-codex`, `agent-launch-session-choices`,
`responsive-session-*`, `agent-launch-start-taken`, …). Slice 2 runs them and
updates any whose intent was a visible note; a match against hidden text
does not prove visibility.

## Proof ownership

| Promise (story example) | Slice | Proof |
| --- | --- | --- |
| Taken/Preparing card shows agent · human · tool · model; gaps shown | 1 | `taken-agent-profile.spec.ts`, `backlog-preparing.spec.ts` |
| Note leaves card text; tooltip on hover and focus; accessible description announced once; dialog still states it; Ready story shows none | 2 | `agent-launch-card-noted-start.spec.ts` |
| Disabled Starts keep icons and no tooltip promise; open-session reason unchanged | 2–3 | `agent-launch-card-open-session.spec.ts` stays green |
| Start icons; Inspect story chevron turns on expand; Review changes icon + trailing arrow, opens right panel | 3 | `agent-launch-card-noted-start.spec.ts`, `story-review-action.spec.ts` |

## Slices

### 1. Engaged cards show human, tool and model beside the agent
Type: Behavior
Status: done
Proof: `taken-agent-profile.spec.ts` and `backlog-preparing.spec.ts` assert
the scan-view line (for example “Akiho-chan · Fixture Committer · Claude Code ·
claude-opus-5-5” with the host mark) and that mode and branch stay out of it;
unrecorded host/model show “host not recorded” / “model not recorded”; an
unknown human keeps its short warning.
Accepted: `.owner-line` toHaveText scan lines in `taken-agent-profile.spec.ts`
(trunk, branch, modelless, rotation) and `backlog-preparing.spec.ts` (with
gaps), `expectMark` on `.card-owner` at 1280/360; `taken-agent-profile-refresh`
and `profile-addition-latency` keep the gap and warning. The scan line names
the human without the avatar, which stays in the detail and roster.

Behavior: a Taken or Preparing card with a recorded profile → the developer
scans it → beside each portrait and name the card shows the credited human,
the tool with its mark, and the model, without opening **Inspect story**.
Update `AGENT-ASSIGNMENTS.md` and the scan-view list in `dashboard/README.md`.

### 2. Launch notes become hover and focus tooltips
Type: Behavior
Status: done
Proof: `agent-launch-card-noted-start.spec.ts`: on the not-ready and
preparing cards the note is not visible in the launch group; hovering and
focusing the dashed Start shows the note in the styled tooltip; the button's
accessible description is the note, announced once; the dialog says “This
story is …”; a Ready story's Start shows no tooltip; existing layout, reading
order and noted-vs-disabled look checks stay green. Run the other note-reading
specs listed above.
Accepted: `expectNoteTooltip` in `agent-launch-card-noted-start.spec.ts`
(hidden at rest, shown on hover and keyboard focus in the aria-hidden
`.frame-tooltip`, exact accessible name and description, dialog wording,
Ready Start without tooltip); other note-reading specs use `expectStartNote`
(`tests/cardControls.ts`) on the Start's description. The labelled-button
tooltip shares `FrameTooltip` and the `.tooltip-control` group with
`IconButton`.

Behavior: a noted Start → hover or keyboard focus → the note appears as a
tooltip; at rest the card shows only the dashed Start. Update the note
wording in `AGENT-LAUNCH.md` and `dashboard/README.md`.

### 3. Card actions carry icons that say what they do
Type: Behavior
Status: planned
Proof: `agent-launch-card-noted-start.spec.ts` checks each Start's leading
decorative icon with the name unchanged; the Inspect story chevron is
decorative and turns with `aria-expanded`; `story-review-action.spec.ts`
checks Review changes' leading icon and trailing arrow, unchanged name, and
that the review still opens in the right panel. Icons and arrows meet 3:1
contrast as `README.md#look-and-controls` requires.

Behavior: any card → the developer scans its actions → Start execution
(`Play`) and Start refinement (`PencilLine`) lead with icons, Inspect story
leads with a chevron that turns when the detail is open, and Review changes
leads with a review icon (`GitCompare`) and ends with a right arrow. Glyphs
may change if another reads as the same action. Update `README.md` and
`AGENT-LAUNCH-REVIEW.md` where they describe these controls.

## Current decisions

- Local gate: the focused Playwright specs named per slice, run with
  `NODE_ENV` unset. Hosted CI runs the full suite after publication.
