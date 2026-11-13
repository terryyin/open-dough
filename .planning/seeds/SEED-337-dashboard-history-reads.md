---
id: SEED-337
status: active
planted: 2026-11-13
planted_during: Terry asked to reduce the history and detail sent to dashboard views
trigger_when: selected from the product backlog
scope: story
---

# SEED-337 — Read only the history the dashboard needs

<a id="read-only-the-history-the-dashboard-needs"></a>

### Read only the history the dashboard needs

**Identity:** SEED-337#read-only-the-history-the-dashboard-needs
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

Developers can open **Recently done sessions** and Project Intent's **CI status**
history with a smaller initial transfer, then inspect the underlying session or
CI evidence when they need it.

#### Scope to refine

- Opening **Recently done sessions** uses the listing facts for the rows shown.
  Revealing more rows or inspecting one session requests only the additional
  data needed for that action. Preserve completed-story links, final report,
  review, and launch-reconciliation behavior. Read the consumers of the current
  retained-history response before changing its scope, including attempts that
  have left the overview.
- Project Intent's CI history initially receives the measured timings, dates,
  gaps, and reference figures needed for the chart and summary. Inspecting build
  or reference evidence retrieves the detail for that inspection. Preserve the
  meaning of measurements, gaps, and provenance. The selected-story and scoped
  chart responses belong to
  [SEED-331](SEED-331-read-ci-history-at-a-glance.md#read-ci-history-at-a-glance).
- Use compact subsets of Session, retained launch, CI build, timing, and
  evidence concepts. Preserve identities, names, units, and meanings, with the
  minimum necessary translation under
  [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).
  Keep the underlying retained evidence available for authorized inspection.

#### Key examples to refine

1. With more retained sessions than the first page can show, expand **Recently
   done sessions**. The first rows and their review cues are usable without a
   full-history transfer. Reveal older rows and open one report. The browser
   obtains the facts and detail for those actions while unrelated full records
   stay on the server.
2. Open **CI status** for a project with measured builds and gaps. The chart
   and reference summary retain their meaning. Inspecting a build or opening
   the evidence list retrieves the requested provenance without making the
   chart wait for that detail.
3. Compare request count, transferred bytes, and time to the initial useful
   view and to inspection on the same representative retained data before and
   after the change. Include the existing conditional and compressed reads in
   the baseline. Check that scope-limited reads lower initial transfer without
   replacing one bulk read with a request per visible row.

#### Evidence

[Expanding the sidebar](../../dashboard/src/SessionsSidebarOptionalSections.tsx)
currently triggers the full retained session-history read. A replay fixture
measured [9.88 MB decoded and 1.25 MB compressed](../../dashboard/AGENT-LAUNCH-OBSERVATION.md#measuring-the-sessions-answer)
for that response. Project Intent's
[history view](../../dashboard/src/IntentCiHistory.tsx) uses the richer answer
for both its chart and evidence disclosure. These are separate read paths.
