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

## Execution identity (2026-09-25)

Terry authorized execution with `dough-execute-plan 97`. Story Branch Mode;
Claude Code agent Ai-chan (publisher `claude-job-c99d05b6`) created
`/Users/terryyin/git/open-dough/.claude/worktrees/097-agent-tool-mode-identities`
on `claude/097-agent-tool-mode-identities` from fetched
`0d9dd55a04c0c156c1de3650a5758fa2be14a3a5`. Originating/integration checkout:
`/Users/terryyin/git/open-dough`. Claim
`c99585269ef6ff8fa40dc47831496342bf31510d` was confirmed on
`origin/refs/heads/main`; the default checkout advanced to it. The trunk claim
has `pendingCi: unobserved`. Increments target
`origin/refs/heads/claude/097-agent-tool-mode-identities`, observed through
GitHub Actions `ci.yml` (`CI`) for `terryyin/open-dough` by managed delivery.

`npm ci` succeeded without lockfile changes and `npm run typecheck:dashboard`
passed there. No Git commit hook is active; formatting is `npm run format`.
No numeric slice target or hard limit was supplied; existing planning
authority is retained.

## Ordered slices

### 1. Recorded agents have their own portraits

Type: Behavior
Status: done
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

Accepted proof (2026-09-25): `npx playwright test --config
dashboard/playwright.config.ts dashboard/tests/taken-agent-profile.spec.ts
dashboard/tests/taken-agent-profile-refresh.spec.ts` passed 2/2;
`npm run typecheck:dashboard` and `npm run build:dashboard` passed. The step
"each recorded agent has its own approved portrait beside its name, and the
owner text is unchanged" checks Akiho, Yuma, Sola (atlas 1) and Rina (atlas 5,
last in the rotation) through `expectPortrait` in
`dashboard/tests/agentPortrait.ts`: tile source and position, `aria-hidden`,
served WebP, and placement at the start of the `.owner-agent` group. The
not-recorded, malformed-profile, and no-profile-before-refresh cases assert
no portrait. Loading and unavailable-profile states draw no portrait by code
inspection only; they had no browser test before this story either.

Learnings for slice 2: `OwnerSummary` in `dashboard/src/TakenOwnerFacts.tsx`
already groups each fact in `.owner-fact owner-<kind>` spans; put tool and
mode marks inside `.owner-host` and `.owner-mode`. `AgentOwner.name` carries
the rotation name from the shared reader. Owner styles live in
`dashboard/src/taken-owner.css`; the refresh journey moved to
`dashboard/tests/taken-agent-profile-refresh.spec.ts`.

### 2. Tool and mode marks sit beside their labels

Type: Behavior
Status: done
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

Accepted proof (2026-09-25): `npx playwright test --config
dashboard/playwright.config.ts dashboard/tests/taken-agent-profile.spec.ts
dashboard/tests/taken-agent-profile-refresh.spec.ts` passed 2/2 after
refactoring; `npm run typecheck:dashboard` and `npm run build:dashboard`
passed. The step "each recorded mode and host has its own mark beside its
label, clear of the portrait, at desktop and narrow widths" runs `expectMark`
(`dashboard/tests/agentPortrait.ts`) at 1280 px and 360 px for Trunk
Mode/Claude Code, Story Branch Mode/Codex, Trunk Mode/Cursor, and Story
Branch Mode/Claude Code: one decorative `alt=""` image at the start of the
group holding exactly its label, expected local file served, box disjoint
from the portrait. The refresh journey's missing-host card shows
`host not recorded` with no tool image; not-recorded cards have no images.
Gaps: asset URLs are observed only under the default base path, and loading
or unavailable-profile states are covered by code inspection only.

## Remaining concerns

No slice-specific concern remains in this review. Both slices use the same
existing Taken-card presentation and outside-in test entry; the first is a
useful independent portrait result, and the second completes the adjacent
metadata marks. No numeric slice target or hard limit was supplied.
