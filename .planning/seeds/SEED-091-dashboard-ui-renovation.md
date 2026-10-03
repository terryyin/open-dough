---
id: SEED-091
status: active
planted: 2026-10-03
planted_during: Terry's request for two dashboard UX/UI renovation stories
trigger_when: A developer wants a polished dashboard frame and compact story information radiators
scope: unestimated
---

# SEED-091: Renovate the dashboard frame and story cards

## Why This Matters

A developer monitoring and directing story work needs a dashboard that looks
modern, feels coherent, and makes important information and actions easy to find.
Terry requested two stories, queued first and second respectively: renovate the
dashboard frame, then improve the story tag/card as an information radiator.

## Stories

<a id="dashboard-frame-renovation"></a>

### Modernize and streamline the dashboard frame

**Identity:** SEED-091#dashboard-frame-renovation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/230-dashboard-frame-renovation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"78b0bfd2023f61c7a9bb3c60d13f11597cb2df76d7436ba033822b6e7104d809","plan":"ebc6b570e76fa00ec88f9b9113cef30fcae4fc99d93cb7a0f5b9faf0db29f063"}}
```

**Goal:** A developer monitoring and directing story work can navigate and use
a visually polished, modern dashboard frame with clear controls, consistent
styling, and easy access to system settings, so the dashboard feels coherent
and its actions are easy to find.

**Scope:**

- Renovate the whole dashboard frame as one experience. The frame is every
  surface outside the story cards and their session boxes:
  - the pinned banner: Sessions toggle and its attention count, Source evidence
    disclosure, project tabs, Refresh/Retry, and the settings entry;
  - the Sessions sidebar, including its Running Cursor sessions list;
  - the row below the banner: Near-future direction, Start session, and the
    Preparation badge legend help control and its modal;
  - the Backlog and Taken stage containers, their headings and counts, and the
    Taking work connector;
  - the terminal and final-report panel's header and controls (title, Done,
    maximize/restore, Close);
  - dialog chrome and controls for the launch, Add project, and Remove project
    dialogs, with their existing content and hierarchy;
  - the agent roster view's surrounding chrome, and the frame's loading, empty,
    no-projects, and source-problem states;
  - System settings.
- Introduce Lucide icons (interpreting the requested "Lucida icons" as Lucide)
  with consistent size, stroke, placement, and meaning across the frame. Replace
  the frame's existing hand-drawn icons with Lucide icons.
- Modernize typography, colour, spacing, alignment, visual hierarchy, and
  controls; streamline interactions and reduce visual clutter. Buttons, fields,
  disclosures, and icon controls look and behave the same everywhere in the
  frame.
- Present the System settings entry as a gear icon at the far upper right of
  the banner, after Refresh, keeping the accessible name "System settings".
- Keep System settings a dedicated full page with today's navigation:
  `view=settings`, Back to dashboard, browser Back/Forward, and focus return.
  Give it a page header with a back control and one consistently styled section
  per setting group (today Projects and OpenAI), so later groups such as
  terminal theme fit the same layout.
- Keep controls understandable and usable: accessible names on every
  icon-only control, a visible tooltip naming each one on hover and focus,
  visible focus, contrast of at least 4.5:1 for text and 3:1 for controls and
  focus, and reachable controls at narrow widths and browser zoom.
- Keep existing behavior, wording, accessible names, and keyboard shortcuts.
  Update the dashboard's navigation guidance where it describes a changed
  presentation, such as the text "System settings" button becoming the gear.

**Key examples:**

- Opening the dashboard on Open Dough at 1440px wide, the developer sees one
  banner row: a Lucide sessions icon with its count at the left, the project
  name, project tabs in one consistent style, a Lucide refresh icon, and the
  gear at the far right. Every frame control shares the same type, sizes,
  radius, and colours.
- The developer hovers or tabs to the gear, sees "System settings", and
  activates it. A settings page opens with a back control and Projects and
  OpenAI sections styled like the dashboard. Add project, Remove project, and
  Save API key work as before, and Back to dashboard returns focus to the gear.
- A source read fails. The refresh icon becomes Retry, and the source problem
  is shown near the source context in the frame's problem styling.
- The developer opens a session terminal. The panel header shows the story
  title and Lucide Done, maximize, and Close icons in the frame's style, while
  the terminal contents look as before.
- At 420px wide or 200% browser zoom, the banner wraps without covering
  content, and every control stays reachable and named.
- Story cards, their session boxes, and the terminal contents look as they do
  today.

**UI:** Light theme only. The look follows the North Star's visual direction:
quiet neutral surfaces, readable system typography, generous spacing, and one
restrained accent for links, selection, and primary actions. Icon-only controls
are reserved for familiar frame actions (sessions, refresh, help, settings,
panel controls). Labelled actions such as Start session keep their text and may
add a leading icon.

**Architecture:** The frame's look comes from one shared visual foundation that
story cards can adopt later: design tokens on `:root` for colour, type scale,
spacing, radius, and elevation, and one icon component wrapping `lucide-react`
that sets size, stroke, and decorative hiding. Lucide is a new runtime
dependency bundled by Vite, not loaded from a CDN. No Accepted ADR conflicts.
ADR 0008 (Proposed) and the dashboard tech-stack recommendation inform the
design and bind nothing; ordinary CSS stays in place, with no component suite.

**Deferred promises:** A dark theme; tokens leave room for one. Settings
section navigation. A different project selector when more projects no longer
fit as tabs. Redesigning the content or information hierarchy of the dialogs,
roster entries, or the stage layout itself.

**Boundary:** Story cards and their session boxes (the "Working" and "Needs
input" entries and Recent sessions) are excluded; the story card redesign is the
second story below. Terminal contents and colours belong to
[SEED-090](SEED-090-dashboard-terminal-theme.md#shared-terminal-theme). This
story changes presentation and frame interactions without adding product
capabilities or changing published facts.

**Visual agreement:** The plan's first slice establishes the tokens, Lucide, and
the renovated banner with the gear, then stops for Terry's acceptance of
before/after screenshots at 1440px and 420px. The remaining surfaces follow the
accepted look.

<a id="story-card-information-radiator"></a>

### Make story cards modern, compact information radiators

**Identity:** SEED-091#story-card-information-radiator

**Goal:** A developer scanning story tags/cards can quickly understand the story
and its current state, find relevant actions, and see more stories with less
vertical clutter.

**Scope:**

- Modernize and beautify the story tag/card presentation so it serves as a clear
  information radiator, with a strong hierarchy for the important information.
- Hide excessive secondary detail from the default view while keeping it
  available when the developer needs it.
- Arrange similar or related buttons together on one line to reduce vertical
  space, allowing wrapping where the available width requires it.
- Align the cards' visual language with the renovated dashboard frame.

**Key examples:**

- A developer scans several cards and can readily identify each story and its
  current state without reading all of its supporting detail.
- Secondary detail does not dominate the card; the developer can reveal or reach
  it when needed.
- Similar actions share a horizontal row instead of consuming a separate row
  each, making the card more compact while keeping actions clear and usable.

**Boundary:** This is one story for the story tag/card experience. It does not
  redesign session blocks or change the underlying story lifecycle or facts.

**Refinement questions:** Confirm which current card details are essential for
  scanning, which should be hidden initially, and how they remain available.
  Identify related action groups and review representative card states and widths.

<a id="frame-look-checks-one-rule"></a>

### Give the frame's look checks one rule each

**Identity:** SEED-091#frame-look-checks-one-rule
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/235-frame-look-checks-one-rule/PLAN.md","assessment":"not-ready","reasons":["Planned against the unlanded frame-renovation branch; main has since changed OpenAISettings.tsx and added a terminal theme settings section, so recheck the premises on main after the frame lands."],"basis":{"document":"900628544288ea9d5daf65f373088b038d3de04875d1ef9e0b5b861d06b5f3bc","plan":"6475b96010fdf7cecd99afdb106c4122b510073e31d4777ba8fc617d0edbedaa"}}
```

**Goal:** A maintainer writing the next dashboard look check, such as the story
cards' renovation, finds one rule for the colour behind an element and one
check that an area's text reads clearly and its controls are recognisable, so
look checks stop copying divergent variants.

**Scope:** The dashboard's browser-test support only: the background walk
repeated in `expectReadableContrast`, `expectControlContrast`, and
`expectFrameIconControl`, and the two `expectReadableAndRecognisable` copies in
`system-settings-look.spec.ts` and `frame-launch-look.spec.ts`. No product
change and no weaker contrast assertion. This is a retrospective correction of
[the frame renovation](#dashboard-frame-renovation); its
[plan](../slice-plans/235-frame-look-checks-one-rule/PLAN.md) holds the
findings, preserved promises, and proof.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- Terry's 2026-10-03 request: capture the frame renovation as the first queued
  item and the story tag improvement as the second; work directly on main and
  sync with origin. These are captured stories awaiting refinement and planning.
