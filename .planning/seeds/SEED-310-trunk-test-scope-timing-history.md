---
id: SEED-310
status: active
planted: 2026-11-11
planted_during: Terry requested timing history in Project Intent proof on main and trunk
trigger_when: Developers need to see how a test scope's execution time changes on trunk
scope: story
---

# SEED-310 — Trunk test scope timing history

<a id="show-trunk-test-scope-timing-history"></a>

### Show trunk test scope timing history

**Identity:** SEED-310#show-trunk-test-scope-timing-history
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

Developers reading Project Intent on the project's published trunk (`main` in
Open Dough) can see how measured test execution time has changed for a selected
test entry, folder, or file. Show a dated history diagram alongside its Proof,
similar to the history already available in Project Intent's CI status.

#### Scope to refine

- Show test execution time history in entry and folder Summary proof and in
  file Proof while reading Project Intent. It must work without selecting a
  Done story. Follow the project's configured trunk rather than hard-coding
  the branch name `main`.
- Use the existing collected trunk build history, with the scope's measured
  execution time on the vertical axis and build dates on the horizontal axis.
  Keep cumulative test execution time distinct from CI wall time. Preserve
  declared test-case and test-file units, build links, scope identity, and
  explanations for missing or incompatible evidence.
- Make the Project Intent endpoint and freshness explicit, consistent with
  CI status. Preserve a Done story's existing history through its own published
  landing when returning to that story.
- Keep the internal structure cohesive. Extend the existing scope-history
  reading, calculations, and shared chart presentation for Project Intent;
  do not create parallel collectors, stores, timing rules, or entry/folder/file
  chart implementations. Browsing and retry use collected evidence rather
  than acquiring historical CI proof. During refinement, identify the existing
  owners and the smallest context-specific change needed.

#### Acceptance examples

- With no story selected, a developer opens an entry Summary, a nested folder
  Summary, and a file's Proof on Project Intent. Each shows its own measured
  execution-time history across retained trunk builds, alongside its current
  proof. This works for a project's trunk named `main` or another configured
  name.
- A file measured at 8 s, 11 s, and 9 s in three collected trunk builds shows
  those dated observations and their build links. Entry and folder diagrams
  use their own evidenced scope totals. CI status continues to show CI wall
  time with its existing meaning.
- Missing, partial, or incompatible scope evidence is explained and breaks
  the plotted line; it is never shown as zero. An empty or failed history read
  gives a useful explanation and applicable retry while other proof remains
  readable.
- Visiting Project Intent while a Done story remains selected shows Project
  Intent's trunk history. Returning to the story restores its history bounded
  by that story's landing. The two views share the maintained history and
  chart behavior, with context determining the endpoint.

#### Existing behavior and design constraints

The [scope-history contract](../../docs/dashboard-development-intent-scope-reference.md#collected-timing-history)
currently describes Done-story entry, folder, and file history. Its existing
[scope-history view](../../dashboard/src/IntentScopeTimingHistory.tsx),
[history reader](../../dashboard/server/intentCiHistoryRead.ts), and
[shared timing chart](../../dashboard/src/IntentCiHistoryChart.tsx) are the
starting points for extending that behavior. This story adds the Project
Intent context to those capabilities.

Follow [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
keep Project Intent, selected-story context, and observed proof distinct, with
one name and responsibility for each concept.
