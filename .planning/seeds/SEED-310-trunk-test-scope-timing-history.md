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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/581-show-trunk-test-scope-timing-history/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6287e548c93ba3a23507e319a3c042f931d6f9e79e65d9c32f531283e288ca4e","plan":"2348253e02636c6ec62cd4999e795d3ac8d1814977c0e955abe6d103fe8c8d0a"}}
```

**Plan:** [Show trunk test scope timing history](../slice-plans/581-show-trunk-test-scope-timing-history/PLAN.md)

#### Goal

Developers reading Project Intent can see how measured test execution time has
changed for a selected test entry, folder, or file across collected published
trunk builds. A dated history beside Proof lets them inspect the observations
without first selecting a Done story or confusing test execution time with CI
wall time.

#### Scope

- Show **Test execution time history** in entry and folder **Summary** and file
  **Proof**, including with no selected story. Use the configured trunk
  (`main` in Open Dough), preserving each scope's own measured totals.
- Bound Project Intent history by the last observed configured-trunk head.
  Name that branch, revision and observation freshness. This endpoint is
  distinct from the CI result's measured revision and the latest collected
  landing. If the endpoint has no collected observation, keep independently
  evidenced preceding history and explain the endpoint gap; never silently
  replace it with an older measured revision.
- Plot cumulative test execution time against actual build dates. Preserve
  declared test-case and test-file units separately, scope/owning-entry identity,
  provenance, deduplicated attempts, represented landings, build links and
  existing prior-build reference behavior. Incomplete, missing or incompatible
  evidence breaks the line with an explanation; measured zero remains zero.
- Follow the existing CI-status observation lifecycle: showing Project Intent,
  observing a new trunk head, and **Check again** can refresh the local history;
  elapsed time alone does not. Distinguish a previously retrieved answer from
  a newly answered read. A failed history read offers its own **Retry history**
  while other Proof stays usable. An empty collection explains what is absent.
- Visiting Project Intent while a Done story remains selected uses the project
  endpoint. Returning restores that story's existing history through its exact
  published landing, together with its reading context. File Purpose/Proof
  navigation and absent current live Proof do not remove available history.
- Extend the existing scope-history reading, calculations and chart presentation
  for all three scope levels. Browsing and retry read collected local evidence;
  they never acquire historical CI proof or extend its retained cohort.

**Scope limits:** no new collector, history store, retention policy, timing or
prior-build calculation, historical rename inference, benchmarking claim,
regression alert, comparison UI, or Taken-story timing history is required.
These deferred capabilities do not justify rejecting naturally supported cases.

**Required restrictions:** do not join incompatible owning-entry/path/unit
readings or substitute missing measurements with zero: either would misstate
what was measured. Preserve the local-read boundary to keep navigation and
retry independent of upstream acquisition and its availability.

#### Key examples

1. With no selected story, a developer opens entry Summary, nested folder
   Summary and file Proof → each shows its own dated retained observations
   beside its existing evidence. The same behavior follows a configured trunk
   named `main` or `trunk`; the name is configuration, not a special case.
2. Three retained builds measured a file at 8 s, 11 s and 9 s → its diagram and
   accessible evidence identify those dates, values and build links. Entry and
   folder histories use their evidenced totals, including descendants absent
   from the visible tree. CI status continues to describe CI wall time.
3. The observed trunk head has no collected landing, or its scope evidence is
   partial/incompatible → the endpoint remains explicitly named, supported
   preceding observations remain readable where ancestry is known, and a gap
   explains the missing evidence. Unknown ancestry is explained conservatively;
   a complete measured zero is still plotted. No CI proof is acquired by viewing
   or retrying this history.
4. The local collection is empty or its read fails → show the absence or failure
   with applicable retry while existing scope Proof stays readable. A failed
   refresh preserves a clearly identified prior answer for the same endpoint;
   another project, scope or endpoint's answer never appears as the current one.
5. A Done story ends at the middle of three retained trunk builds → its history
   excludes later observations. Visiting Project Intent while that story remains
   selected shows history through the project endpoint, including the later
   build; returning restores the story endpoint, selected test and reading place.
6. New proof is collected for the same head, then the developer chooses Check
   again → the local history can show it without a head change. A newly observed
   trunk head changes the project endpoint; a kept CI judgment about an older
   measured build never pins history to that older revision.

#### UI and architectural direction

Use the existing Summary/Proof placement and shared chart/evidence presentation;
no new layout or chart interaction is selected. One context description must
name Project Intent's observed trunk endpoint or the Done landing consistently
in the introduction, selected-point/gap words, chart accessible description and
evidence rows. Date and value evidence remains available without colour or
hover, including keyboard and phone reading.

The strongest challenge is that a convincing diagram ending at the latest
collected build could conceal collection lag and fail the published-trunk goal.
The chosen refinement assumption is the observed trunk head, consistent with
[Project Intent's own published revision](../../docs/dashboard-ux-ui-north-star.md#one-intent-workspace-from-project-to-file).
This is a clarification of the existing endpoint/freshness promise, not a new
collector obligation. A laboratory observation log supplies a useful mechanism:
retain each observation's date, unit and provenance, with missing readings as
gaps. Its limit is causal: changed test membership and cumulative duration do
not establish a speedup in CI wall time or timing attributable to a story.

Follow Accepted [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md):
Project Intent, selected story, published revision, observed proof and local
collection remain distinct. Accepted [ADR 0002 — Software development lifecycle
principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports one representation of each domain responsibility. The ADR index and
record statuses agree; no relevant supersession or conflict was found.

Reuse the [history reader](../../dashboard/server/intentCiHistoryRead.ts),
[scope projector](../../dashboard/server/ciScopeHistory.ts),
[endpoint cohort rule](../../dashboard/server/ciHistoryEndpoint.ts),
[scope view](../../dashboard/src/IntentScopeTimingHistory.tsx),
[endpoint read lifecycle](../../dashboard/src/useIntentCiEndpointHistory.ts) and
[shared timing chart](../../dashboard/src/IntentCiHistoryChart.tsx).
The server already accepts a pinned scope endpoint without a story identity;
Project Intent is excluded by the current view's Done-only gate. The existing
[separate evidence providers](../../dashboard/src/IntentPerspective.tsx) own
Project Intent and selected-story contexts. Extend those owners with endpoint,
freshness and wording context; keep collection, scope arithmetic, compatibility
and chart rules in their current shared homes. The
[scope-history contract](../../docs/dashboard-development-intent-scope-reference.md#collected-timing-history)
owns lasting behavior after implementation.
