---
id: SEED-278
status: active
planted: 2026-11-08
scope: story
---

# Give the dashboard a dark theme

<a id="dashboard-dark-theme"></a>

### Give the dashboard a dark theme

**Identity:** SEED-278#dashboard-dark-theme
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/578-dashboard-dark-theme/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3d02c39b28054891efd10492a75fea9d7daecbd69889a52be7f4b94c6e7c8cf5","plan":"9b51829924941447902a3e53dd63b796278be56c7650c7d015a515098619524b"}}
```

**Goal.** A developer whose system prefers a dark appearance can read the
whole dashboard in a coherent dark theme instead of a light page with a few
dark-tuned CI cues, keeping work and its evidence readable in the same session.

**Scope.** Follow the system color-scheme preference across the dashboard
frame, Development, and project and story Intent. Include the banner, Board,
story cards and badges, Sessions sidebar, Side panel chrome and its dashboard
readers, dialogs, System settings, story tabs, CI comparison and history,
Changed tests, and Intent coverage. Surfaces, ordinary and quiet text, links,
controls, hover, selection, keyboard focus, status cues, charts, source tokens,
and diff marks must remain legible together. Use the approved mockup's dark
appearance as the reference for the story-reading surfaces; extend its visual
relationships to the rest of the existing dashboard.

Changing system appearance while the page is open updates its presentation
without losing the selected project, perspective, story, file, reading place,
or open panel/dialog. The light preference keeps today's appearance. Existing
labels, signs, line styles, and focus/selection distinctions continue to carry
meaning alongside color.

The terminal's chosen palette and its settings sample keep their existing
meaning independently of dashboard appearance. Their surrounding dashboard
controls follow the system. This preserves an explicit user choice rather
than treating terminal output as dashboard chrome.

**Scope limits / deferred promises.** A dashboard-specific appearance switch,
saved appearance override, per-project theme, new terminal palette policy,
layout redesign, and new animations are outside this increment. These are
delivery limits, not reasons to reject otherwise supported browsing or data.

**Key examples.**

1. Dark system preference → open Development and inspect a story, show Sessions,
   open a Side panel and a launch/help dialog, or visit System settings → the
   dashboard surfaces form one dark presentation with readable controls,
   preparation/status badges, quiet notes, errors and keyboard focus.
2. Dark system preference and a selected Done story → visit CI comparison,
   Changed tests with its file sidebar shown and hidden, and Intent coverage
   → match the dark side of the
   [approved Story tabs mockup](SEED-275-story-intent-tabs/intent-story-tabs.html)
   at desktop and narrow widths. The coverage report and missing-evidence
   explanations remain readable.
3. Dark preference → read a highlighted test source and a changed-file diff,
   select/focus a row carrying CI cues, and inspect a timing chart → source
   text, line numbers, additions/removals, selection, focus, change marks,
   faster/slower cues and chart values remain distinguishable on their actual
   composed backgrounds. A plain or ungrammared file stays readable too.
4. An open Intent source with a selected file and reading place → change the
   system between light and dark → the page and highlighted source update
   together without navigation or lost reading state. Returning to light
   restores today's appearance. A terminal using a chosen Light or Solarized
   palette retains that choice through the same change.

**Exploration and challenge.** The existing partial dark styling is the
simplest alternative, but leaves most of the page light. A whole-page color
filter could darken it cheaply, but also transforms terminal output, portraits,
and semantic colors. Recommend a system-responsive palette of visual roles
that preserves those meanings and covers the complete reading journey.

The borrowed mechanism is instrument night lighting: ambient illumination can
change while each instrument's warning and measurement still mean the same
thing. Here, shared surfaces and text are the ambient layer; status, selection,
focus and evidence are the signals, and terminal output has its own selected
palette. The analogy does not supply usable web colors or prove contrast;
actual composed states still need observation.

The strongest consequential doubt is that a visually dark frame could satisfy
the title while making the evidence harder to read. The local preparation
observation at `d07fdaf39699fb539d39394638922dbed9b0b123` found identical
light/dark page backgrounds (`rgb(246, 246, 243)`), pale badge fills, a pale
dark-preference location header, and unchanged light-palette source tokens
after a temporary dark surface override. Examples 2–4 make evidence readability
part of this story's existing whole-dashboard purpose. No change to the
selected system-following interaction is needed.

The user/system trade-off is one automatic appearance across dashboard
surfaces, with no extra choice to manage, while explicitly chosen terminal
palettes remain independent. Appearance is presentation under
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#spatial-presentation-remains-derived);
this direction needs no project workflow record, server setting, new
architectural boundary, or ADR exception.

**Origin.** Deferred from the SEED-275 visual acceptance by Terry on
2026-11-08.
