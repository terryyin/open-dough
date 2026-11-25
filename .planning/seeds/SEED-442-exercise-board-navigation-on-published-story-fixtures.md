---
id: SEED-442
status: active
planted: 2026-11-25
planted_during: Developer split of the Board fixture work from SEED-439
trigger_when: selected from the product backlog before SEED-439 resumes Board retirement
scope: one story
---

# SEED-442 — Exercise Board navigation on published story fixtures

<a id="exercise-board-navigation-on-published-story-fixtures"></a>

### Exercise Board navigation on published story fixtures

**Identity:** SEED-442#exercise-board-navigation-on-published-story-fixtures
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/844-exercise-board-navigation-on-published-story-fixtures/PLAN.md","assessment":"not-ready","reasons":["Refine the provisional fixture mapping and confirm which retained story-linked journeys prove each applicable navigation and native control observation."],"basis":{"document":"db8f10cf58ea123854a8f7373a97ecb4c4e2578c1852013f9666b4815e7470f3","plan":"de5a984eace4c1968455dff70b017c1832281381723e9881235c380c2820589f"}}
```

**Goal.** Dashboard maintainers can verify Recently done paging, session
navigation, and focus with published story membership in the test fixtures.
The same proof remains useful when the Board stops placing standalone rows.

**Scope.**

- Use published Taken and Done catalog entries for Board navigation and
  retain native sessions with the corresponding story identity. Where a
  journey changes the story's column, publish the corresponding membership.
- Preserve the applicable held-read, latest-page reset, revision refresh,
  cross-project selection, keyboard and terminal or report observations.
  Replace coverage that depended exclusively on a local Done mark moving
  a standalone row. Keep each distinct native control observation on an
  applicable story journey.
- Change test fixtures and assertions. The consuming story owns production
  Board retirement, the removal of the six named legacy frontend cases,
  and verification of exact published comparison ranges and warnings.

**Key examples.**

- Selecting the native session of an older published Done story reaches its
  card. A held record preserves the reading bound and keyboard destination
  until it answers. Choosing **Show latest 10** or selecting another project
  supersedes the pending reveal.
- An updated catalog retains the visible range and focused card when it can.
  A native terminal or final report retains its close and keyboard behavior
  with a session on a published story.

**Split from.** [SEED-439](SEED-439-complete-story-linked-ad-hoc-sessions.md#complete-story-linked-ad-hoc-sessions)
keeps its Taken identity, the five published slices, and the coordinated
production switch. Its paused slice 6 has a verified patch and proof. Two
targeted journeys failed at the old placement assumptions.
[Provisional plan 844](../slice-plans/844-exercise-board-navigation-on-published-story-fixtures/PLAN.md)
maps the extracted fixture work and the proof the consumer will reuse.
