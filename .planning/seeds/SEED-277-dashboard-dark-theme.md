---
id: SEED-277
status: active
planted: 2026-11-08
scope: story
---

# Give the dashboard a dark theme

<a id="dashboard-dark-theme"></a>

### Give the dashboard a dark theme

**Identity:** SEED-277#dashboard-dark-theme

**Goal.** A developer whose system prefers a dark appearance can read the
whole dashboard in a coherent dark theme instead of a light page with a few
dark-tuned CI cues.

**Scope.** Follow the system color-scheme preference across the dashboard
frame, Development, and Intent, including the story tabs, CI comparison,
changed tests, and coverage views. Keep text, controls, and CI cues
legible. Today only `dashboard/src/intent-ci-cues.css` and
`dashboard/src/intent-location-group.css` react to
`prefers-color-scheme: dark`.

**Key examples.** With a dark system preference, the selected story's CI
comparison, its Changed tests file pane with the sidebar shown and hidden,
and its Intent coverage tab match the dark side of the
[approved Story tabs mockup](SEED-275-story-intent-tabs/intent-story-tabs.html)
at desktop and narrow widths. The light preference keeps today's appearance.

**Origin.** Deferred from the SEED-275 visual acceptance by Terry on
2026-11-08.
