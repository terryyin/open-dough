# Recognize recorded agent, tool, and execution mode in Taken cards

## Source

**Identity:** SEED-038#recognize-agents-and-tools-by-avatar

[SEED-038](../../seeds/SEED-038-agent-and-tool-avatars.md#recognize-agents-and-tools-by-avatar)
owns the goal, scope, examples, and deferred GitHub-author work. This plan
implements its dashboard presentation only.

## Goal and scope

A developer scanning Taken cards can distinguish the recorded agent, host tool,
and execution mode at a glance. Every mark remains adjacent to its own text
label. The dashboard still names all recorded facts, reports missing or
unreadable facts explicitly, and makes no claim that an agent is active.

Use the approved local portrait atlases and tool marks in `dashboard/public/`
and the two local SVG mode symbols. The portrait is beside the agent name;
the tool icon is beside the tool name, never on the portrait; the mode symbol
is beside the mode name. Do not change profile data, commit authors, GitHub
avatars, or source-of-progress rules.

## Current product evidence and direction

- **PFE:** `dashboard/src/TakenOwnerFacts.tsx` already owns the owner summary,
  mode and host labels, and missing-profile messages. Extend that presentation
  instead of creating a parallel identity model. The fixed agent rotation is
  already exported by
  `src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs`;
  use it to select portrait tiles, without duplicating the name list. Asset
  provenance and tile order are in `dashboard/public/AVATARS.md`.
- **Proof entry:** `dashboard/tests/taken-agent-profile.spec.ts` exercises
  published Taken cards, including Trunk Mode, Story Branch Mode, missing
  host/model, absent profile, and unreadable profile. Extend that journey to
  observe the rendered images, labels, and placement. The Vite base URL must
  continue to resolve local assets under the dashboard's deployed base path.
- **Direction:** The [dashboard UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction)
  keeps metadata legible, avoids presence signals, and requires text to carry
  meaning conveyed by visuals. No consequential new architecture or Accepted
  ADR exception is needed for a local presentation change.
- **Existing draft:** A local, unpublished prototype branch has agent
  portraits and initial badge styling. It is exploratory only; its tool badge
  covers the portrait and does not satisfy this plan. Execution starts from the
  selected published revision and may reuse only compatible parts.

## Outside-in proof

| Source promise | Owning slice | Observation |
| --- | --- | --- |
| Recorded agent is recognizable beside its name, with the original text intact | 1 | A Taken card renders the expected atlas tile beside its recorded agent name; its owner summary still names that agent and the other recorded facts. |
| Recorded host and mode are distinguishable beside their own names, without covering the portrait | 2 | Trunk Mode/Claude Code and Story Branch Mode/Codex cards render their respective local symbols inside the corresponding text groups; browser geometry shows the tool icon does not overlap the portrait. |
| Missing host and missing or unreadable profile facts are not invented | 1, 2 | Missing-host card has its agent portrait and `host not recorded` with no tool icon; absent/unreadable-profile cases retain their explicit messages with no guessed portrait or icons. |
| Visual aids are accessible and do not imply presence | 1, 2 | Labels remain readable text; decorative images add no duplicate or live-status announcement; targeted browser assertions and dashboard build/typecheck pass. |

## Current decisions

- Use decorative `<img>` elements for the local tool and mode files, with
  accessible meaning supplied by adjacent text. A CSS background crop for the
  agent atlas is also decorative because the name remains text.
- Keep a single owner summary in source order: agent, mode, host, model.
  Group each icon with its own label in markup so visual placement and text
  association agree at narrow widths.
- Do not turn unknown facts into fallback identities or status indicators.

## Ordered slices

### 1. Recorded agents have their own portraits

Type: Behavior
Status: planned
Proof: Extend `dashboard/tests/taken-agent-profile.spec.ts` with Taken cards
for different recorded agents; verify their atlas source/tile mapping, visible
portrait beside the name, and unchanged readable owner text. Verify absent and
unreadable profiles still show their existing explicit messages without a
portrait. Run that focused Playwright spec, `npm run typecheck:dashboard`, and
`npm run build:dashboard`.

Behavior: a Taken card has a readable profile with a recorded agent → the
approved portrait for that name appears beside the name. When no readable
profile identifies an owner, the card preserves the existing text gap without
guessing a portrait.

### 2. Tool and mode marks sit beside their labels

Type: Behavior
Status: planned
Proof: Extend the same Taken-card journey: Trunk Mode with Claude Code and
Story Branch Mode with Codex use the corresponding local files; a Cursor host
uses the Cursor mark; each icon is in the group containing its exact text label.
At desktop and narrow widths, assert the tool icon's box does not intersect
the agent portrait. A missing host displays `host not recorded` and no tool
mark. Screen-reader-facing text still contains the original names and no
presence status. Run the focused Playwright spec, `npm run typecheck:dashboard`,
and `npm run build:dashboard`.

Behavior: a Taken card shows a recorded mode and host → the appropriate mode
symbol and official host mark appear immediately beside their respective
labels, leaving the portrait clear. An unrecorded host remains an explicit
text gap without a fabricated icon.

## Remaining concerns

No slice-specific concern remains in this review. Both slices use the same
existing Taken-card presentation and outside-in test entry; the first is a
useful independent portrait result, and the second completes the adjacent
metadata marks. No numeric slice target or hard limit was supplied.
