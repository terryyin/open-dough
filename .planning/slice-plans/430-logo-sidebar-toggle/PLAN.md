# Use the Open Dough mark as the sidebar toggle and drop the repeated project title

**Identity:** SEED-205#logo-sidebar-toggle
**Source:** [Use the Open Dough mark as the sidebar toggle and drop the repeated project title](../../seeds/SEED-205-compact-dashboard-banner.md#logo-sidebar-toggle)

## Goal and scope

A developer using the dashboard on any width gets a one-line banner: the Open
Dough mark is the Sessions toggle (name, ⌘B, expanded state, attention count,
background effect preserved), the duplicate project title heading is gone, and
Development and Intent show expressive SVG marks beside their labels. A
successful ad-hoc Start session no longer spends action-row space on "Ad hoc
session started"; startup progress and launch problem answers stay. Passive
marks on unconfigured and System settings views stay non-controls. Structure
perspective and Structure marks stay out.

## Exclusions and assumptions

- Structure choice and Structure SVG are deferred.
- Icon-only perspective choices on narrow widths are deferred.
- Recently done / Sessions sidebar wording for a started ad-hoc session is
  unchanged.
- Custom perspective SVGs follow the frame's icon stroke language; they are not
  Lucide glyphs and need not pass the Lucide-class frame-icon check.

## Outside-in proof

| Example | Owner | Observable proof |
| --- | --- | --- |
| Phone-width banner: mark-as-toggle, perspective with marks and labels, project selector, settings; no panel toggle or H1; no sideways scroll | Slice 1 | `dashboard-header.spec.ts` / `dashboard-header-compact.spec.ts` (and banner layout helpers) rewritten for the merged control and absent heading; mutation: restoring a separate Sessions icon or the H1 fails the one-line / membership check |
| Mark / ⌘B toggles sidebar with prior background effect; attention count remains | Slice 1 | `frame-sessions-look.spec.ts` and sessions sidebar journeys: Sessions control is the mark, still named "Sessions" with ⌘B tooltip, toggles the complementary; attention badge still shown when due |
| Passive mark elsewhere | Slice 1 | `frame-board-look.spec.ts` / `system-settings-look.spec.ts`: unconfigured banner and System settings still use `expectProductMark` (not a control) |
| Intent then Development stay distinct with marks | Slice 2 | `development-intent-frame.spec.ts` plus a mark check: each radio keeps its accessible name and shows one decorative SVG; the two SVGs differ |
| Successful ad-hoc start: no success log; failure still answered | Slice 3 | Ad-hoc launch specs that today wait on `parts(page).adHocStarted` assert its absence after success while terminal / listing still appear; problem specs still show the launch answer |

## Existing solutions (PFE)

- **Sessions control:** change `SessionsButton` / `sessions-toggle` to show
  `ProductMark` as its visual instead of `PanelLeft`. Reuse tooltip, ⌘B,
  `aria-expanded` / `aria-controls`, attention badge, and expanded background
  from `sessions-sidebar.css`. `IconButton` today requires a Lucide icon;
  either let this control host the mark without forcing Lucide, or specialize
  Sessions without inventing a second tooltip system. Update
  `expectFrameIconControl` / `expectProductMark` so the banner mark-as-toggle
  is allowed to be inside the Sessions control while passive placements stay
  non-controls.
- **Banner title:** remove the `h1.project-title` from `DashboardBanner`; keep
  `ProjectSelect` / compact title select as the name. Retarget journeys that
  read `parts(page).projectTitle` to the selector (or drop those assertions
  where the compact control already names the project).
- **Perspective marks:** extend `PerspectiveSelect` with two small custom SVG
  marks (Development: story-board cards in flight; Intent: document with
  verification mark) beside the existing labels. Do not add a Structure choice.
- **Ad-hoc success line:** remove the success `setAnnouncement` / empty
  `role="log"` slot from `StartSession`; keep starting progress and
  `LaunchProblemAnswer`.

## Decisive premises

| Premise | Settlement |
| --- | --- |
| Banner grid today places mark, Sessions, title, perspective, project, settings as separate columns (`banner.css`) | Observed in checkout; slice 1 collapses mark+Sessions and drops the title column |
| `expectProductMark` refuses a mark inside a control; `expectFrameIconControl` requires a Lucide SVG | Observed in `productMark.ts` / `frameIconControl.ts`; slice 1 updates those helpers for the new Sessions visual |
| Empty success `<p role="log">` remains in the action row after a successful start | Observed in `StartSession.tsx`; slice 3 removes it |

No premise needs an unpaid probe before `ready`.

## Slices

### 1. The mark toggles Sessions and the banner drops the duplicate title
Type: Behavior
Status: planned
Proof: phone and wide banner layout specs; Sessions look / toggle journeys;
passive-mark specs on unconfigured and System settings; focused helper updates
green.

Behavior: On a configured project, the banner's Open Dough mark is the Sessions
toggle (accessible name Sessions, ⌘B, expanded state, attention count, prior
toggle background). The separate panel icon and the level-1 project title are
gone; the project selector still names the selected project. Unconfigured and
System settings views keep a passive Open Dough mark that is not a control.

### 2. Development and Intent show their meaning marks
Type: Behavior
Status: planned
Proof: perspective frame / development-intent journeys; each choice shows its
decorative SVG and keeps its accessible name; the two marks differ.

Behavior: Each Development and Intent perspective choice shows its custom SVG
mark beside its label. The marks encode this product's meanings (work in flight
on the board; Purpose with verification). Structure is not offered.

### 3. A successful ad-hoc start leaves the action row quiet
Type: Behavior
Status: planned
Proof: ad-hoc success journeys assert no "Ad hoc session started" log and no
empty success log slot; problem journeys still show the launch answer; terminal
presentation after success unchanged.

Behavior: After Start session successfully starts an ad-hoc session, the project
actions row shows neither "Ad hoc session started" nor an empty success log.
Startup progress and launch problem answers beside the button remain.

## Current decisions

- Perspective marks keep visible labels in this story (icon-only narrow layout
  deferred).
- Sessions uses the product mark as its visual; it does not keep a second
  Lucide panel icon beside the mark.

## Plan review

- Slice-plan refinement: not needed — three independent Behavior outcomes, each
  with one proof loop, no hidden preparation beyond changing existing helpers,
  and no cumulative special-case design.
- Remaining slice-specific concerns: none.
