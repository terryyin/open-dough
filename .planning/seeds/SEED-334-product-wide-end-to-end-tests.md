---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests


<a id="keep-navigation-conversion-proof-whole"></a>

### Keep the converted navigation proof whole and time-independent

**Identity:** SEED-334#keep-navigation-conversion-proof-whole
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/687-keep-navigation-conversion-proof-whole/PLAN.md"}
```

**Goal:** A maintainer relies on the Frontend navigation checks that
SEED-334#move-navigation-checks-and-retire-integrated-ui-test converted: the
header's non-eager read counts hold however long a journey takes, the paging
view beside a newly arrived session keeps a home, and no live comment points
at a deleted interim spec.

**Scope:** Correct that execution's delivered Frontend specs and the one stale
E2E comment its retrospective found; no product change, no other conversion.

**Plan:** [Converted navigation proof correction](../slice-plans/687-keep-navigation-conversion-proof-whole/PLAN.md).

<a id="share-one-executing-agent-roster-arrangement"></a>

### Share one Frontend arrangement of an agent executing Open Dough's Taken story

**Identity:** SEED-334#share-one-executing-agent-roster-arrangement
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/694-share-one-executing-agent-roster-arrangement/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"988812d5a796704445537efb7f1ff833788727cdd1cd77593445032e169bed83","plan":"1203256add27181caa88d95861d382066fb6d529f1153c0ca2adf639678445bd"}}
```

**Goal:** A maintainer changes the Frontend arrangement of Open Dough with one
agent executing its Taken story in one place, so the roster and story URL
journeys cannot drift apart.

**Scope:** Retrospective correction of
SEED-334#retire-integrated-ui-test-and-its-documents (commit `c2f93725c`):
`publishRosterStory` in `dashboard/tests/support/frontendStoryUrlDestination.ts`
and `openRoster` in
`dashboard/frontend-tests/stories/agent-roster-collection.spec.ts` publish the
same revision through one shared arrangement, keeping each journey's agent
name, optional settings file and every assertion. No product change.

**Plan:** [Shared executing-agent roster arrangement](../slice-plans/694-share-one-executing-agent-roster-arrangement/PLAN.md)

<a id="move-story-reference-checks"></a>

### Move story reference checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#move-story-reference-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/689-move-story-reference-checks/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1ae32dfc3888added7254e0b95be56191423b42cb4d50d706ccd36256108029e","plan":"648d2bd6e0654c6a7270e01dd4f8f6c0a30ecbca9ea980a75f8fbcab9d3bdea3"}}
```

**Goal:** A maintainer keeps the protection for following a story reference,
to an active or a Done story, by its identity, with its cancellation and
recovery, in the **Dashboard Frontend Test** group with controlled answers
instead of a real dashboard server, so `source-navigation` is the interim
group's last spec and the group can retire next.

**Scope:**

- Convert `story-reference-navigation`, `-identity`, `-recovery`, `-done`,
  `-done-cancellation` and `-done-recovery` (6 of the remaining 7 navigation
  specs, 1,075 of 1,321 lines, 19 tests) with every distinct assertion kept at
  its real boundary as
  SEED-334#retire-integrated-ui-test-and-its-documents did: Frontend homes
  under `dashboard/frontend-tests/navigation/`, a Backend or representative
  E2E home only for a rule that needs the real server, and an existing
  maintained case named where it already makes the same assertion.
- A read the interim case counted at GitHub becomes a count of the page's own
  reads. A count only the server decides, such as what its cache spares,
  keeps a Backend home.
- The real Take behind a starting story stays with E2E
  `launches/agent-launch-start-dependencies.spec.ts`; the Frontend case
  observes the protected Inspect while the page's start is unanswered.
- The interim group stays runnable with `source-navigation` alone, its CI
  shard declaration reduced to what selects a spec.
- Test support the deletions leave without a consumer is removed.

Scope limits: `source-navigation`, the group's retirement and the
`dashboard/tests/` Markdown belong to the two stories below; no product
behavior change, new group or tier, speed or shard target.

**Key examples:**

1. Story A waits on Story B. Following the reference opens Story B's detail
   at its reading top with the keyboard on the card and a cue that does not
   select it. Following again while the cue fades restarts it and keeps the
   selection and detail made meanwhile. The canonical record opens the GitHub
   blob of the published revision, and a later revision leaves the keyboard
   where the developer put it.
2. Story B is starting and its start is unanswered. The reference moves the
   keyboard to its card, leaves the protected detail closed, and the page
   sends no further launch or attach request.
3. Two stories share one seed, and Pygardon tells `SEED-B#b` in a seed of its
   own. Each reference opens the story its identity names in the shown
   project, by keyboard or tap, with a reduced-motion reveal at narrow width.
4. `SEED-C#c` is not queued: the reference reads "unavailable". Retried while
   the backlog read is held it reads "Reading…", failed it reads "Could not
   read…", and once Story C is queued a retry reaches it. Choosing Pygardon
   or another story's Inspect meanwhile wins, with no late focus or detail.
5. A reference to the 27th Done story, with ten shown, grows the range to
   "Showing 27 of 35 entries" and keeps it; the page asks only for the shown
   records and the referenced suppliers. While that record is held the
   destination reads "Reading done story…"; failed, it shows its identified
   gap and "Retry done stories" recovers it.
6. While that Done destination is pending, Inspect, "Show latest 10", a
   pointer down or Tab away supersedes the jump: the record arrives and the
   keyboard stays where the developer moved it.
7. An expired or unlisted reference reads "unavailable" with no further read;
   a loading or failed Done catalog reads differently from absence, and an
   inspection chosen meanwhile stays when the catalog heals.

Safe stopping point: the three active-reference specs alone, or the three
Done-reference specs alone, is complete on its own.

**Provenance:** Second outcome of the resplit of
SEED-334#retire-integrated-ui-test-and-its-documents's earlier scope,
recoverable at `87dfb8fbf1f6dc78cbd279e8fb33d1396da9d8a6`.

**Plan:** [Story reference conversion](../slice-plans/689-move-story-reference-checks/PLAN.md)

<a id="retire-emptied-integrated-ui-test-group"></a>

### Move source navigation checks out and retire Dashboard Integrated UI Test

**Identity:** SEED-334#retire-emptied-integrated-ui-test-group
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-334#retire-emptied-integrated-ui-test-group","dependencies":[{"supplier":{"identity":"SEED-334#retire-integrated-ui-test-and-its-documents","href":"seeds/SEED-334-product-wide-end-to-end-tests.md#retire-integrated-ui-test-and-its-documents"},"implementation":"Converts the story destination and card selection specs out of dashboard/tests/navigation.","rationale":"A CI shard pattern or group selecting no spec is refused, and a group still holding specs cannot retire; shared direction or reconciliation cannot remove that order.","condition":"The four story destination and card selection specs are gone from dashboard/tests/navigation on trunk.","state":"satisfied","resolution":{"revision":"7649aea947b870eb8d84da67f0fa63d0a9c6b9bb","path":".planning/seeds/SEED-334-product-wide-end-to-end-tests.md#retire-integrated-ui-test-and-its-documents","summary":"At accepted trunk 5fa614519, dashboard/tests/navigation holds only source-navigation and the six story-reference specs; notification-story-navigation, story-destination-repeat-cue, story-card-selection and story-card-dependency-selection moved to dashboard/frontend-tests/navigation with all four plan 688 slices done.\nCondition satisfied: The four story destination and card selection specs are gone from dashboard/tests/navigation on trunk.\nAccepted integration: 5fa614519b253763f6153d596b0e35d1fa7472e1 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-334#move-story-reference-checks","href":"seeds/SEED-334-product-wide-end-to-end-tests.md#move-story-reference-checks"},"implementation":"Converts the six story-reference specs out of dashboard/tests/navigation.","rationale":"A CI shard pattern or group selecting no spec is refused, and a group still holding specs cannot retire; shared direction or reconciliation cannot remove that order.","condition":"The six story-reference specs are gone from dashboard/tests/navigation on trunk, leaving source-navigation as the group's only spec.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/690-retire-emptied-integrated-ui-test-group/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement and realignment of provisional plan 690."],"basis":{"document":"a0e8b3a7d1ce364e70fa28b488b55af7566a2ec89be47e3c1b4fdf6aed79f25d","plan":"734f6b6985aa0d5b372590cd28d7c0d18b9873d080c8f7a14fb41284bc60aaac"}}
```

- **For / why.** A maintainer keeps source navigation protection in
  maintained homes and runs only the **E2E Test**, **Dashboard Frontend
  Test** and **Dashboard Backend Test** browser groups.
- **Evaluation.** `source-navigation` (246 lines, 3 tests) keeps every
  distinct assertion: link targets, external references and refused targets
  in a Frontend home, the server's exact GitHub read list and "nothing leaves
  the server" in a Backend home. The emptied group retires in the same
  delivery that converts this last spec, because a CI shard pattern or group
  selecting no spec is refused: its Intent location, npm command, Playwright
  config, `dashboard-integrated` CI producer and shards, global setup, and
  live tooling and placement references. Shared support other groups import
  stays, as does `integratedStateCompletion`. Use the browser group roster
  where SEED-334#keep-one-browser-test-group-roster has delivered it,
  otherwise its current hard-coded callers. Every remaining group runs
  unchanged. Old integrated proof stays readable at its original revision,
  absent from current proof, with gaps rather than fabricated numeric
  comparisons or dead source links.
- **Inputs.** Scope item 3 and Key example 2 of the earlier scope at
  `87dfb8fbf1f6dc78cbd279e8fb33d1396da9d8a6`; provisional plan 648 slice 7
  and its retirement consumers at
  `4eb4f8e594ee003a2894c28c8ab2600e1c42b835`.
- **Boundary.** No product behavior change, new group or tier, speed or
  shard target, E2E naming or tagged-install proof. The `dashboard/tests/`
  Markdown keeps only the edits that remove the retired group from it.
- **Safe stopping point.** None before retirement: the conversion and the
  retirement deliver together.

**Plan:** [Provisional source navigation conversion and retirement](../slice-plans/690-retire-emptied-integrated-ui-test-group/PLAN.md)

<a id="carry-dashboard-test-knowledge-in-code"></a>

### Carry dashboard test knowledge in test code and remove its Markdown

**Identity:** SEED-334#carry-dashboard-test-knowledge-in-code
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/691-carry-dashboard-test-knowledge-in-code/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement and realignment of provisional plan 691."],"basis":{"document":"0215b0006e143bd4904208a442251596d4506e27083076f8324e48426169730c","plan":"d5b3ab5297baec05dd4d9723317d53f1312d4b5b3b237e31bb449aeac3c7a65f"}}
```

- **For / why.** A maintainer reads what the dashboard tests arrange,
  replace, place and record from the test code itself rather than from
  Markdown beside it, so that knowledge cannot drift from the code that
  embodies it.
- **Evaluation.** Every Markdown file under `dashboard/tests/` is removed:
  `README.md`, `feature-groups.md`, `shards.md`, `fixture-origins.md`,
  `intent-ci-comparison-proof.md`, `native-host-fixtures.md`,
  `proof-record.md`, `fluent-side-panel-pilot.md`,
  `fixtures/preparation-assignment-v0.3.51.md` and the whole spent
  `manual/2026-10-13-mobile-dashboard/` folder (report, `findings.json`,
  images and DOM capture; both its discrepancies are closed). Each
  still-current fact is represented in test code: names of specs, builders,
  page objects, fixtures and helpers, their types and configuration
  (`proofRecordTypes.ts`, `runnerConfig.mjs`, Playwright configs, `ci.yml`),
  or an existing or added executable check where the fact is a rule. History,
  measurements and interim-group notes are dropped; Git recovers them.
  Maintainer procedure a skill consumes, such as the shard job-count
  reasoning `rebalance-ci-shards` cites, moves into that skill. Every live
  incoming link (`AGENTS.md`, `e2e/README.md`, `dashboard/README.md`,
  `dashboard/frontend-tests/README.md`, `dashboard/backend-tests/README.md`,
  `Distribution/tests/README.md` and its sibling guides, the
  `rebalance-ci-shards` skill, CI workflow and code comments, findings and
  active seeds) points to the code that now carries the fact, or is dropped.
  Historical records and fixture bytes keep their recorded links.
  `find dashboard/tests -name '*.md'` returns nothing, and no live link
  points at a removed file.
- **Examples.** A maintainer wondering which synthetic hosts stand in for
  Claude, Codex and Cursor finds the answer in the fixture builders and their
  names; one reading a proof record finds its fields in
  `proofRecordTypes.ts`. A frontend-only spec that starts the real dashboard
  server breaks a placement rule the README states today; the rule is carried
  by an executable check or by the support module a frontend spec can import,
  not by prose. AGENTS.md's test-automation entry points at code (the MakeMe
  builders, the page-object entry and the fluent side-panel journeys).
- **Inputs.** Scope item 2 and Key examples 3–5 of the earlier scope at
  `87dfb8fbf1f6dc78cbd279e8fb33d1396da9d8a6`; document removal was requested
  in the refinement of
  SEED-334#move-navigation-checks-and-retire-integrated-ui-test on
  2026-11-17.
- **Boundary.** Other test roots' Markdown stays, gaining only repointed
  links; no product behavior change. Independent of the conversions: it can
  run before or after the retirement, dropping whatever interim-group notes
  remain.
- **Safe stopping point.** Each removed document with its facts rehomed and
  links repointed is complete on its own; `README.md`, the hub, goes last.

**Plan:** [Provisional document removal](../slice-plans/691-carry-dashboard-test-knowledge-in-code/PLAN.md)

<a id="observe-tagged-install-and-read-e2e-proof"></a>

### Observe a tagged installed workflow and read E2E proof in Intent

**Identity:** SEED-334#observe-tagged-install-and-read-e2e-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer sees a representative workflow run released
  Open Dough commands in an installed project, and reads **E2E Test** proof in
  Intent under its own name without false continuity from the retired
  `dashboard/tests` evidence.
- **Evaluation.** An isolated project with Open Dough installed from published
  `v0.3.97` (tag, resolved revision and installed version recorded) starts
  story preparation from the dashboard under `npm run test:e2e`, and the
  installed command publishes the assignment to its bare origin; a missing or
  unverifiable pinned release fails clearly without branch fallback. Each E2E
  journey names its real integrations and simulated boundaries. Project
  Intent, Purpose, Proof, story CI comparison and history name the **E2E
  Test** entry, open registering-helper sources, keep old `dashboard/tests`
  evidence readable at its revision, and show absent or changed scopes
  without fabricated numeric comparisons or dead links.
- **Inputs.** Scope 3, 4, 7 and 8 and Key examples 1 and 5 of
  SEED-334#run-and-observe-product-wide-end-to-end-tests, and plan slices 5
  and 6 with their premises and the accepted tagged prerequisite proof in its
  preparation assessment, recoverable at commit
  `d21a0ebc5ee0426f9898d10725c9e7765f49bc8e` from
  `.planning/seeds/SEED-334-product-wide-end-to-end-tests.md` and
  `.planning/slice-plans/608-product-wide-end-to-end-tests/PLAN.md`.
- **Boundary.** No new release, native agent acceptance or speed work.
- **Value / learning.** Completes the product-wide E2E goal's installed and
  Intent-reading promises on the runners SEED-334 delivered.
- **Safe stopping point.** The tagged journey alone, or the Intent naming and
  history alone, is complete on its own.

<a id="keep-one-browser-test-group-roster"></a>

### Keep one browser test group roster and current placement guidance

**Identity:** SEED-334#keep-one-browser-test-group-roster
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/617-keep-one-browser-test-group-roster/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"336ccf3ea5faf948d4e9fd9f8c23622341080fdf457b55e6503fd07ad10e44a2","plan":"52f1257a33e40e7007d41363e4da8ecdf55252473b4ca9c27cc5f3f074ea84e6"}}
```

#### Goal

A maintainer who adds, removes or reads the browser test groups delivered by
SEED-334#run-and-observe-product-wide-end-to-end-tests (recoverable at
`125c45649fa587c78ed7445deff35db87604489d`)
changes the group set in one place, finds helpers named for the groups they
run, has each CI producer's setup bounds guarded on their own, and reads
placement guidance that matches the independent groups.

#### Scope

Bounded retrospective correction of that execution's residue. Give the set of
browser test groups one authoritative home that proof-subprocess isolation,
the repeat helper, the container diagnostic and their tests derive from, with
a consistency check against `ci.yml` and `package.json`. Name the repeat
helper, the container option and shared selection helpers for browser test
groups rather than the dashboard. Check each workflow's Node, npm and browser
acquisition bounds separately. Correct the umbrella and placement wording in
`dashboard/tests/README.md`. Preserve every group's selection, settings,
outputs, shards, CI proof and the interim group; historical records keep their
recorded names. No new group, removal of the interim group, runner, CI job or
speed claim.

**Plan:** [Keep one browser test group roster](../slice-plans/617-keep-one-browser-test-group-roster/PLAN.md)

