---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests

<a id="retire-emptied-integrated-ui-test-group"></a>

### Move source navigation checks out and retire Dashboard Integrated UI Test

**Identity:** SEED-334#retire-emptied-integrated-ui-test-group
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-334#retire-emptied-integrated-ui-test-group","dependencies":[{"supplier":{"identity":"SEED-334#retire-integrated-ui-test-and-its-documents","href":"seeds/SEED-334-product-wide-end-to-end-tests.md#retire-integrated-ui-test-and-its-documents"},"implementation":"Converts the story destination and card selection specs out of dashboard/tests/navigation.","rationale":"A CI shard pattern or group selecting no spec is refused, and a group still holding specs cannot retire; shared direction or reconciliation cannot remove that order.","condition":"The four story destination and card selection specs are gone from dashboard/tests/navigation on trunk.","state":"satisfied","resolution":{"revision":"7649aea947b870eb8d84da67f0fa63d0a9c6b9bb","path":".planning/seeds/SEED-334-product-wide-end-to-end-tests.md#retire-integrated-ui-test-and-its-documents","summary":"At accepted trunk 5fa614519, dashboard/tests/navigation holds only source-navigation and the six story-reference specs; notification-story-navigation, story-destination-repeat-cue, story-card-selection and story-card-dependency-selection moved to dashboard/frontend-tests/navigation with all four plan 688 slices done.\nCondition satisfied: The four story destination and card selection specs are gone from dashboard/tests/navigation on trunk.\nAccepted integration: 5fa614519b253763f6153d596b0e35d1fa7472e1 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-334#move-story-reference-checks","href":"seeds/SEED-334-product-wide-end-to-end-tests.md#move-story-reference-checks"},"implementation":"Converts the six story-reference specs out of dashboard/tests/navigation.","rationale":"A CI shard pattern or group selecting no spec is refused, and a group still holding specs cannot retire; shared direction or reconciliation cannot remove that order.","condition":"The six story-reference specs are gone from dashboard/tests/navigation on trunk, leaving source-navigation as the group's only spec.","state":"satisfied","resolution":{"revision":"badcebeb685c551d94f359e8e22cad41dc6e380b","path":".planning/seeds/SEED-334-product-wide-end-to-end-tests.md#move-story-reference-checks","summary":"At accepted trunk 37bac9d2c, dashboard/tests/navigation holds only source-navigation.spec.ts; the six story-reference specs moved to dashboard/frontend-tests/navigation with all eight plan 689 slices done and the integrated group's --list showing 3 tests in 1 file.\nCondition satisfied: The six story-reference specs are gone from dashboard/tests/navigation on trunk, leaving source-navigation as the group's only spec.\nAccepted integration: 37bac9d2cb857fd1ae88ed599f47ec4dd1a81703 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/690-retire-emptied-integrated-ui-test-group/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8ef572348f7539f0ac20ccd793d0558ffdd797aa3f45dbbcbb42aaa8a398d88c","plan":"260d4acb98b72a3afdf0606b19c745c1aa13fbca157a134c1651922c6fb54a11"}}
```

#### Goal

A maintainer runs and reads three browser test groups, **E2E Test**,
**Dashboard Frontend Test** and **Dashboard Backend Test**, with no interim
fourth group to place specs in, shard, wait on in CI or explain. Source
navigation, the last behavior only the interim group protects, stays protected
in those maintained groups. This story's outcome is the retired group with
every source-navigation assertion kept; `dashboard/tests/` remaining the home
of shared test support is outside it.

#### Scope

Convert `dashboard/tests/navigation/source-navigation.spec.ts` (246 lines, 3
tests), keeping every distinct assertion at the boundary that owns it:

- **Dashboard Frontend Test** owns what the page does with recorded links:
  snapshot links to the blob at the inspected revision with their hashes, a
  bounded correction's bare plan link, `..` and root paths resolved inside the
  repository, the "File in this snapshot" and "External reference"
  statements, `_blank` with `noopener noreferrer` on every card's anchors,
  following a link in a new tab while the dashboard stays in place,
  `javascript:`, `data:` and invalid targets shown as text with their reasons,
  recorded markup shown as text with nothing run, and what showing the links
  reads: the page asks its own server for exactly the in-repository canonical
  files, for no external or refused target, and for nothing outside its own
  origin. No spec or unit test covers `src/sourceLink.ts` or
  `RecordedLink.tsx` apart from the interim spec.
- **Dashboard Backend Test** owns what the server asks of GitHub for one such
  file. `authenticated-read-boundary` already shows a record read asking
  GitHub for that record alone at the revision; it gains the interim spec's
  remaining shape, a path outside the planning directory with a space, read
  once as `docs/release%20notes/2026.md`. The ref, backlog, agent and done
  directory and settings reads keep their existing Backend owners.

With its last spec gone the group retires in the same delivery, because CI
refuses a shard pattern or group that selects no spec and
`ci-proof-declaration` requires the `ci-proof` needs, its `expect` list and
the declared locations to agree. That delivery removes the `dashboard/tests`
Intent location, `test:dashboard:integrated`,
`dashboard/integrated.playwright.config.ts` with its `tsconfig.node.json`
entry, `integratedGlobalSetup.ts`, the `dashboard-integrated` job with its
`ci-proof` need and `expect` token, the group's step in
`scripts/ci-container.sh`, its entry in `groupRunnerExamples.ts`, and
`sourceNavigationJourney.ts`, and moves every test that runs or loads the
group onto a remaining one: `ci-proof-actions`, `ci-proof-frontend-report`,
the `local-test-suite` checkout, fixtures and focused-runner tests, and
Backend `runner-ownership`, `start-origin-demand`, `dashboard-artifact-demand`
and `run-processes`.

Live tooling and guidance that only name the group lose it, in that delivery
or the next: `scripts/dashboard-repeat.sh` with its test,
`scripts/ci-shard-balance.mjs`, the `rebalance-ci-shards` skill,
`browser-test-group.yml`, `dashboard/COMMANDS.md`, `e2e/README.md`,
`Distribution/tests/README.md`, `local-test-resources.md`,
`Distribution/evaluation/native-setup.md` and code comments. Use the browser
group roster where SEED-334#keep-one-browser-test-group-roster has delivered
it, otherwise its current hard-coded callers.

Old integrated proof needs no product change. Intent reads locations at the
revision it shows, CI proof is keyed by location path, and maintained cases
already cover a location absent from one side: a Done story lists the
locations of its own revision, an entry outside the shown locations is named
without a link, a removed comparison entry carries no invented after value,
and history shows a gap for a build without the scope. This story keeps those
cases passing and adds none.

Scope limits: no product behavior change, new group or tier, speed or shard
target, E2E naming or tagged-install proof. Shared support other groups
import stays under `dashboard/tests/`, as does `integratedStateCompletion`,
the unrelated closure policy. The `dashboard/tests/` Markdown keeps only the
edits that remove the retired group from it;
SEED-334#carry-dashboard-test-knowledge-in-code owns its removal. Records of
what was observed keep the group's name: findings, done records,
`CHANGELOG.md`, the CI repeat fixtures' recorded job names and fixture data
that uses `dashboard/tests` as an example path.

#### Key examples

1. **A link rule is caught in a maintained group.** `source-navigation` is
   gone and `resolveSourceLink` is changed in a scratch edit to offer a
   `javascript:` target as a link → `npm run test:dashboard:frontend` on the
   source-navigation spec fails on "not offered as a link"; restored, it
   passes.
2. **What showing links reads is caught in maintained groups.** The hostile
   backlog is shown and every card inspected → the page asked its server for
   the SEED-021 seed, the correction's plan, the ADR and
   `docs/release notes/2026.md`, and for nothing else by path or outside its
   origin. A real dashboard server asked for `docs/release notes/2026.md` at
   the revision → GitHub was asked once, for
   `contents/docs/release%20notes/2026.md?ref=<revision>`.
3. **The group is gone.** After the delivery →
   `find dashboard/tests -name '*.spec.ts'` prints nothing,
   `npm run test:dashboard:integrated` is an unknown script, `ci.yml` has no
   `dashboard-integrated` job, and Open Dough's Intent lists E2E Test,
   Dashboard Frontend Test, Dashboard Backend Test and Distribution Tests.
4. **Every remaining group runs what it ran.** Each remaining group's
   `--list` before and after the delivery differs only by the added
   source-navigation cases, and trunk CI is green with `ci-proof` collecting
   four entries.
5. **Old proof stays readable.** A story done before the retirement is opened
   in Intent → its locations include Dashboard Integrated UI Test at its own
   revision; a current story's comparison against a baseline that still had
   `dashboard/tests` marks the entry removed with no after value; scope
   history shows a gap for builds without the scope.

**Plan:** [Source navigation conversion and retirement](../slice-plans/690-retire-emptied-integrated-ui-test-group/PLAN.md)

<a id="carry-dashboard-test-knowledge-in-code"></a>

### Carry dashboard test knowledge in test code and remove its Markdown

**Identity:** SEED-334#carry-dashboard-test-knowledge-in-code
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/691-carry-dashboard-test-knowledge-in-code/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b3c9f6aab47754e22a4cec416ae1ab19187fdae0006c1fe8c2d6ed048b0f10b4","plan":"ed7fc2abce04393f8fb060e404ba187e4815fd6f82bdd1dd26faec6baf679ad4"}}
```

#### Goal

A maintainer or agent about to add, place or read a dashboard test learns what
the tests arrange, replace, place and record from the code they are about to
touch: its names, types and configuration, and checks that refuse a broken
rule. That knowledge then cannot drift the way the Markdown beside the code
has. This story's outcome is a `dashboard/tests/` tree with no Markdown and no
fact a test author needs made unfindable; drift-free guidance in the other
test roots is the wider ambition and stays outside it.

#### Scope

Remove every Markdown file under `dashboard/tests/`: `README.md`,
`feature-groups.md`, `shards.md`, `fixture-origins.md`,
`intent-ci-comparison-proof.md`, `native-host-fixtures.md`, `proof-record.md`,
`fluent-side-panel-pilot.md`, `fixtures/preparation-assignment-v0.3.51.md`
and the whole spent `manual/2026-10-13-mobile-dashboard/` folder (report,
`findings.json`, images and DOM capture; both its discrepancies are closed).

Each statement in them takes the first carrier that fits:

1. **Already carried** by a name, type, configuration value, existing check
   or module header, or by a guide that stays (`e2e/README.md`, the Frontend
   and Backend READMEs, the `Distribution/tests/` guides, `AGENTS.md`, a
   shared skill): it is deleted with its document.
2. **A rule tooling can refuse:** an existing or added executable check. The
   Frontend placement rule gets one: a Frontend spec cannot take the
   server-starting `test` fixture, start the dashboard server or build a fake
   GitHub or host, while the helpers Frontend specs import today from the same
   modules stay importable.
3. **A fact a name, type or configuration can state:** the name, type or
   value states it, as `proofRecordTypes.ts`, `runnerConfig.mjs`, the
   Playwright configurations and `ci.yml` already do for most.
4. **A procedure a skill or script performs:** it moves to that consumer. The
   job-count rule moves into `rebalance-ci-shards`, under
   [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
   and the repository's skill-authoring guidance; a command's usage belongs to
   the command.
5. **A reason or usage rule for one helper or fixture that nothing above
   carries:** a short statement in that module's own header, where its next
   user reads it. It describes only that module and cites no other document.
6. **Everything else is dropped:** history, measurements, dated decisions,
   per-spec inventories, the pilot's evaluation and interim-group notes. Git
   recovers them.

Every live incoming link points to the carrier or is dropped with its
sentence: `AGENTS.md`, `e2e/README.md`, `dashboard/README.md`, the Frontend
and Backend READMEs, `Distribution/tests/README.md` and
`test-environment.md`, the
`rebalance-ci-shards` skill, `ci.yml` and `browser-test-group.yml` comments,
active seeds, and the code comments that cite a removed document. A sentence in a staying guide
that delegates to a removed document ("the dashboard test guide owns
placement") goes with the link. Records of what was observed keep their
recorded links: the findings logs (`ProjectFindings.md`, `DearDough.md`,
`docs/maintainer/` findings and history), `.planning/evidence/`,
`.planning/done/`, `CHANGELOG.md` and fixture bytes
(`fixtures/observed-runs-ci.yml`). Another story's active plan adapts when
that story is prepared or executed.

Scope limits: no prose moves into another Markdown file except the skill in
carrier 4; the other test roots' Markdown is otherwise unchanged, including
drift of its own such as the Backend README's folder table; no spec is
converted and no product behavior changes; feature-folder membership stays
carried by the directory names, with no added check. Independent of the
conversions and the retirement: it runs before or after them and drops
whatever interim-group notes remain. The README wording correction in
SEED-334#keep-one-browser-test-group-roster ends with the file when this
story lands first.

Boundary assumption: the repository's 250-line limit applies to every module
that gains a carrier-5 statement, so a statement that does not fit is a sign
it belongs to carriers 1–4 or 6.

#### Key examples

1. **A rule becomes a refusal.** Frontend specs take `test` only from
   `support/frontendApp.ts`, `support/pageTest.ts` or
   `support/comparisonMountPage.ts`, and 30 of them import helpers such as
   `pausePageClockAt` from `dashboardTest.ts` → a scratch Frontend spec
   imports `test` from `dashboardTest.ts` → `npm run lint` fails naming the
   rule, and the 30 existing helper imports still pass.
2. **A fact already has a carrier.** `native-host-fixtures.md` says which
   synthetic hosts stand in for Claude, Codex and Cursor, and the
   `support/fakeClaude.ts` header already says the same → the document is
   removed → the header is unchanged, and `e2e/README.md` names the fixture
   modules where it linked the document.
3. **An inventory is dropped.** The same document lists some fifty spec
   files and what each walks → the document is removed → no list appears in
   any comment or guide; the spec names and titles are the inventory.
4. **A usage rule sits on its helper.** The README's "touch journeys use one
   device unless the other reaches an asserted branch" has no check and no
   name → the README is removed → the rule is one short statement in the
   header of the responsive fixture a touch journey imports, and nowhere else.
5. **A stale citation is replaced by the statement.**
   `support/dashboardServer.ts` cites `../README.md, "Two tiers"`, a section
   that no longer exists → the README is removed → the comment says what
   `developmentBoundary` is for in its own words and cites nothing.
6. **A procedure moves to its skill.** `rebalance-ci-shards` links
   `shards.md#the-job-count` → `shards.md` is removed → the skill states the
   job-count rule itself; the dated job-count decisions are gone and `ci.yml`
   holds the counts.
7. **The entry point names code.** `AGENTS.md`'s test-automation entry links
   the dashboard test guide and the pilot document → both are removed → the
   entry names the MakeMe builders, the page-object entry and the fluent
   side-panel journeys, `find dashboard/tests -name '*.md'` returns nothing,
   and no link outside the records above points at a removed file.

Provenance: scope item 2 and Key examples 3–5 of the earlier scope at
`87dfb8fbf1f6dc78cbd279e8fb33d1396da9d8a6`; document removal was requested in
the refinement of
SEED-334#move-navigation-checks-and-retire-integrated-ui-test on 2026-11-17.

**Plan:** [Document removal](../slice-plans/691-carry-dashboard-test-knowledge-in-code/PLAN.md)

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

