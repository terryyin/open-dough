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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/231-story-card-information-radiator/PLAN.md","assessment":"not-ready","reasons":["Slice 1 default-card visibility split remains a proposal pending Terry’s preference.","Slice 1 and final visual alignment depend on the renovated-frame foundation, which is not available at the observed published revision."],"basis":{"document":"167b1624bda4309bd8efe4c208f387b5c971d0644b0475354998914f7e44f0a4","plan":"6b0a7200361f9ccd9d28b51ee62a0ffa9e0316505b65804bdaaea390a00888d4"}}
```

**Slice plan:** [Compact story-card reading and actions](../slice-plans/231-story-card-information-radiator/PLAN.md).

**Goal:** A developer monitoring and directing story work can scan Backlog and
Taken cards to identify the story, its published preparation or execution state,
and the next available action, then inspect its supporting evidence when needed.
Compact, visually coherent cards let the developer compare more stories without
secondary metadata dominating the overview.

**Scope:**

- Modernize story cards in both existing stages, including their collapsed and
  inspected states. Align typography, colour, spacing, emphasis, and controls
  with the renovated dashboard frame. The story title leads the reading order;
  ordinary metadata and decoration do not compete with warnings or actions.
- Make the default view compact by reducing repeated explanatory text and
  moving secondary facts into inspection, rather than shrinking text or
  concealing meaningful state. The proposed default/detail split is recorded
  under UI below; its visibility choice remains open for Terry.
- Keep preparation and readiness distinct, including Planless, Not recorded,
  Not ready, Changed since readiness review, and evidence-conflict or
  unavailable states when present. Keep Preparing an assignment annotation,
  and Taken a published claim rather than an indication of live activity.
- Keep Taken progress interpretable: the recorded slice count, current-slice
  clock or execution-complete/awaiting-wrap-up state, and any uncertainty remain
  apparent. Progress read from a story branch still says it is not in trunk;
  a trunk copy with unknown execution branch remains qualified. Full branch
  names and revisions can be secondary detail. Counts never imply percentage
  of effort or independently verified completion.
- Keep dependency blocking, missing or conflicting evidence, startup progress,
  launch failures, and reasons an action is unavailable apparent beside the
  affected fact or action. Longer explanations and supporting records may be
  inspected. Ordinary absence, loading, unavailable evidence, and recorded
  zero completion must remain distinguishable.
- Arrange related actions together on one line when width permits, allowing
  wrapping: Start execution and Start refinement form the launch group;
  Inspect story/Hide detail and Review changes form the inspection group when
  offered. Keep their names, availability rules, effects, and recovery behavior.
  A Not ready badge does not itself disable Start execution; dependencies and
  open sessions retain their existing rules.
- Retain access to every existing card fact and source link. Inspection reveals
  already-loaded facts, preserves the story's stage and surrounding context,
  and can be closed with useful focus return. The existing agent-portrait
  route to the roster remains available. During protected startup, facts and
  source links remain readable even though Inspect story and other card actions
  are unavailable; compacting cannot strand evidence behind a disabled action.
- Keep titles readable, text meanings alongside colour or symbols, named
  controls, visible keyboard focus, and a usable scan-to-detail-to-source path
  at narrow widths and browser zoom. Existing selection, shown-in-terminal,
  and startup marks remain distinguishable without relying on colour alone.

**Key examples:**

- Several ordinary Backlog cards with no open sessions are shown at 1440px
  viewport width → the developer scans them → full titles, priorities,
  preparation/readiness, and launch actions are easy to compare, with less
  vertical space devoted to supporting metadata than today. Start execution
  and Start refinement share a line when the card width permits.
- A queued story has a published preparation assignment → the developer scans
  it → Preparing and its assigned developer are apparent alongside the
  existing priority and badges, without implying that an agent is running.
- A Taken story has two of five slices recorded complete on a story branch →
  the developer scans and then inspects it → the count and current-slice clock
  are visible, the progress is qualified as not in trunk, and inspection reaches
  the exact branch/revision, slice evidence, and source links. A completion
  record instead shows execution complete, awaiting wrap-up; it does not move
  the card or imply closure.
- A story has a blocking dependency, Changed since readiness review, or an
  unreadable plan → the developer scans it → the relevant warning is visible
  before inspection, and inspection explains the reason and available evidence.
  An unreadable plan does not appear as zero slices completed.
- A developer needs the purpose, full identity, assignment metadata, or source
  records → they activate Inspect story by pointer or keyboard → those facts
  are available with their existing distinctions and links; Hide detail returns
  them to the same story with useful focus. A portrait still opens its agent's
  roster entry and supports returning to the card.
- A local launch is starting or its answer fails → the developer looks at the
  card → startup or failure feedback stays visible with the existing recovery
  route. While startup protects the card, its actions stay unavailable and
  described, but source links remain readable without activating Inspect story.
- At 420px viewport width or 200% browser zoom → the developer reads a long
  title and navigates the action groups and detail → text and actions wrap in
  reading order without clipping, horizontal loss, or hover-only access to
  essential facts. Cards with sessions keep the existing session entries and
  attention feedback usable; this story promises no fixed card height.

**UI:** Describe two levels of reading within the existing story-card journey;
no particular layout, component, or technology is selected here.

- **Proposed scan view:** full story title, backlog priority, assigned or
  preparing developer and roster access, preparation/readiness badges,
  dependency summary and evidence warnings, Taken slice count/clock or
  awaiting-wrap-up state, available action groups, and local startup/failure
  feedback. Keep the existing session blocks and attention indications.
- **Proposed secondary detail:** full identity, host/model, mode and exact
  branch, credited human assignment detail, purpose, expanded preparation and
  dependency explanations, source revisions and links, slice evidence, and
  product advice. Existing unknown/conflicting states remain explicit; a short
  warning stays visible in the scan view when its explanation is secondary.
- **Evidence exceptions:** a short progress-source qualification remains beside
  the count whenever it is not plainly trunk. Source links stay readable during
  protected startup, regardless of whether they normally sit in inspection.
- **Density:** remove redundant supporting lines and align related actions;
  preserve readable type, useful action targets, and space separating different
  meanings. Compare equivalent ordinary cards before and after, using the same
  facts and session state, rather than imposing a height that would cut off
  warnings, long titles, or sessions. Follow the frame's light visual direction.

**Boundary:** This is one story for the existing story tag/card experience and
its inspection. Session blocks (including Working/Needs input entries and
Recent sessions), the dashboard frame, roster content, launch/review dialog
content, and terminal contents retain their existing responsibilities. No
story lifecycle, authoritative facts, launch policy, or source-read behavior is
changed. Presentation changes may touch the product parts needed for this
outcome; these boundaries are not implementation-file restrictions.

**Deferred promises:** New filtering, sorting, search, card movement or zoom,
new status or progress facts, new launch/review capabilities, a dark theme,
and a session-block redesign. These are not product rejection rules.

**Open decision:** Terry's default-card visibility preference is pending. The
scan-first split above is a proposal; alternatives are keeping mode/branch and
source links visible, or moving assignment into detail as well. The decision
changes scan density and how directly assignment/evidence can be reached; the
progress-source and protected-startup exceptions still apply.

**Refinement evidence:** Current card information and interactions were read in
`dashboard/src/WorkCard.tsx`, `PreparationCard.tsx`, `AgentAssignmentFacts.tsx`,
`DependenciesCard.tsx`, `SliceProgress.tsx`, `StoryDetail.tsx`, and
`CardLaunches.tsx`. Published/local distinctions and startup safeguards follow
the [UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md) and
[agent launch contract](../../dashboard/AGENT-LAUNCH.md). This was source
inspection for refinement, not an observation of rendered cards or a visual
acceptance review.

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
