# Move source navigation checks out and retire Dashboard Integrated UI Test

**Identity:** SEED-334#retire-emptied-integrated-ui-test-group
**Source:** [Source navigation and retirement](../../seeds/SEED-334-product-wide-end-to-end-tests.md#retire-emptied-integrated-ui-test-group)

## Goal and scope

Convert `dashboard/tests/navigation/source-navigation.spec.ts` (246 lines, 3
tests) to Dashboard Frontend Test and Dashboard Backend Test homes with every
assertion kept, then retire the emptied Dashboard Integrated UI Test group:
its Intent location, npm command, Playwright configuration, global setup, CI
producer and every live reference. The source owns scope and exclusions: no
product code change, no new group, no speed or shard target, and the
`dashboard/tests/` Markdown keeps only the edits that drop the retired group.
Both blocking dependencies are recorded satisfied.

## Existing solutions and current decisions

- Follow the delivered conversions (plan 688, recoverable at
  `7649aea947b870eb8d84da67f0fa63d0a9c6b9bb:.planning/slice-plans/688-move-story-destination-and-card-selection-checks/PLAN.md`):
  the Frontend spec lands in `dashboard/frontend-tests/navigation/`, takes
  `test` from `dashboard/tests/support/frontendApp.ts`, publishes through
  `putFrontendBacklog` of `frontendServiceState.ts` and reuses
  `dashboardPage`, `storyCardControls` (`canonicalRecord`, `slicePlanLink`,
  `inspectedDetail`) unchanged. Add no second app harness.
- The hostile backlog (`sourceNavigationJourney.ts` lines 19–100) and its
  page-only helpers (`card`, `inspectedSources`, `forEachStoryCardsSources`,
  `destination`, `followLeavingDashboard`, `injectedMarkup`, `revision`,
  `snapshotRoot`) move to a new
  `dashboard/tests/support/frontendSourceNavigation.ts`, with an opener that
  publishes the backlog and records what the page asked.
  `sourceNavigationJourney.ts` has no other importer and is deleted with the
  interim spec. No edited or new file may pass 250 lines; the Frontend cases
  go in two spec files for that reason.
- The interim "server's GitHub read list" is page-driven: the page asks its
  own server for each canonical file, and the server asks GitHub once per
  file. The Frontend home asserts the page's requests; the Backend home is
  `backend-tests/observation/authenticated-read-boundary.spec.ts`, whose
  existing record-read case (line 101 onwards) already asserts the single
  GitHub read, and gains only the path with a space.
- "Nothing left the server" becomes "the page requested nothing outside its
  own origin", measured after the page has loaded; the GitHub navigation in a
  new tab is the popup's request, observed through the browser context as
  today.
- SEED-334#keep-one-browser-test-group-roster (plan 617) has not delivered at
  `cefca2213`: the group's callers are the hard-coded ones named below. If it
  lands first, slices 5 and 6 remove the group from its roster instead and
  from whichever callers remain.
- SEED-334#carry-dashboard-test-knowledge-in-code (plan 691) removes the
  `dashboard/tests/` Markdown. If it lands first, slice 6 has no Markdown
  under `dashboard/tests/` to edit.
- `dashboard/tests/README.md` is 251 lines. Slice 6 only deletes the interim
  group's sentences from it, which takes it under the limit; no other
  reorganization.
- Old integrated proof needs no change: Intent reads locations at the shown
  revision and keys proof by location path. Its maintained owners stay as
  they are (see the promise table).
- Records of what was observed keep the group's name: findings, done records,
  `CHANGELOG.md`, `Distribution/tests/ci/ci-repeat.sh`,
  `helpers/ci-repeat-fixture.bash`, and fixture data using `dashboard/tests`
  as an example path.
- Accepted [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
  [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  support the move; no conflict, no North Star topic. Slice 6 edits the
  internal `rebalance-ci-shards` skill under
  [author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md).

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| P1. A Frontend arrangement of the hostile backlog shows recorded links, refuses unsafe targets and follows a link in a new tab | Slices 2 and 3 | At `cefca2213`, a scratch `frontend-tests/navigation` spec published the backlog with `putFrontendBacklog`, reused the journey's page helpers and ran under `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts <spec> --workers=1` | Passed: 11 cards, the SEED-021 link at `/terryyin/open-dough/blob/<revision>/…`, the `javascript:` reason with no link, the new-tab follow to `github.com`. The page asked by path for exactly the SEED-021 seed, plan 059, the ADR and `docs/release notes/2026.md`. Origin must be read after load: before it, the page's own first request counts as foreign. |
| P2. A record read asks GitHub for that record alone, and a path with a space is asked as `%20` | Slice 1 | `authenticated-read-boundary.spec.ts` lines 101–163, and the interim spec's read list, both green in trunk CI at `cefca2213` | Holds for a `.planning` path directly; the space path only through the browser journey, which slice 1 replaces with a direct case. |
| P3. Removing the group breaks exactly the named consumers | Slices 4 and 5 | At `cefca2213`, scratch removal of the job, `ci-proof` need and `expect` token, Intent location, npm script, configuration, `tsconfig.node.json` entry and `ci-container.sh` step; `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh` over every `Distribution/tests` check naming CI, the settings file, a group or the suite fixtures (106 files). Then scratch deletion of the configuration, setup, spec, journey and example entry with `npm run typecheck:dashboard`, `npm run lint` and the four Backend specs | Failing: `ci-proof-actions` ("no producer for root dashboard/tests"), `ci-proof-frontend-report` (`declaredPart` undefined), and every user of `local-test-suite-checkout.mjs`, which reads the integrated configuration (27 `ENOENT` failures across `local-test-suite*`, `test-runner-deadline*`, `ci-container-admission`, `distribution-ci-proof`). `ci-proof-declaration`, `ci-container-workflow`, `browser-group-shards` and `ci-browser-groups` pass once the declarations go together. Typecheck and lint pass and so cannot guard the cut. `runner-ownership`, `dashboard-artifact-demand`, `start-origin-demand` and `run-processes` fail. Not run under the removal: the whole Frontend, Backend and E2E groups and the hosted `ci-proof` job; slice 5's gate runs them. |

## Outside-in proof ownership and gates

Before removing the interim spec, each of its assertions has a destination in
the maps below; a step an existing maintained case already asserts is dropped
only where the map names that case.

For slices 1–3, apply one scratch product break before conversion, prove the
replacement catches it and passes when restored, and record the fault,
observation and literal commands and results here. The interim spec stays
until slice 5.

Each slice: rerun the installed test-entry selector for its paths (Frontend
selects MakeMe and page objects, Backend MakeMe), then the changed specs with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config <group config> <paths> --workers=2`,
`npm run lint`, `npm run --silent typecheck:dashboard`, and consumers from the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
of any changed support. Local gate: use `caffeinate -s -i` on awake macOS on
AC power; on battery use the maintained open-lid `caffeinate -i` procedure and
inspect sleep logs under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Default timeouts and retries stay; never `test.slow()`. Follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written and carry that link into every delegation and repair handoff.

Slices 4 and 5 change declarations and fixtures that distributed consumers
load, and typecheck and lint cannot see the cut (P3). For that reason their
gate is broader: the whole Distribution suite
(`PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh`) and
the whole Backend group (`npm run test:dashboard:backend`); slice 5 adds the
whole Frontend and E2E groups and a green branch CI run, including
`ci-proof`, before integration.

| Promise (source) | Owning slice |
| --- | --- |
| Key example 1: a link rule is caught in Dashboard Frontend Test | 2, 3 |
| Key example 2: the page's reads; the server's one encoded GitHub read | 2 (page), 1 (server) |
| Key example 3: no spec, script, job or Intent location remains | 5 |
| Key example 4: every remaining group runs what it ran; `ci-proof` collects four entries | 5 |
| Key example 5: old proof stays readable | 5 keeps green `frontend-tests/intent/intent-done-source-selection.spec.ts`, `intent-ci-comparison-locations.spec.ts`, `intent-ci-proof.spec.ts` ("historical-only entries have no dead link"), `intent-scope-timing-history-absent.spec.ts`, and `Distribution/tests/support/dashboard-ci-comparison-entries.test.mjs` ("a removed entry is marked without inventing an after value") |
| Live tooling and guidance lose the group | 5 (what CI needs), 6 (the rest) |
| Shared support and `integratedStateCompletion` stay | 5: remaining groups' `--list` and `.planning/open-dough.json` diff |

## Ordered slices

Each slice has 15 active minutes excluding command time.

### 1. Read a record whose path has a space
Type: Behavior
Status: planned
Proof: a new case in
`dashboard/backend-tests/observation/authenticated-read-boundary.spec.ts`
beside "the record itself is asked of GitHub". Scratch break: the server
passes the path to GitHub unencoded; the case fails on the asked path.

Behavior: the backlog at a revision links `/docs/release notes/2026.md` → the
page's read `…&revision=<revision>&path=docs/release notes/2026.md` reaches a
real dashboard server → 200 with that path and text, and GitHub was asked
once, for `contents/docs/release%20notes/2026.md?ref=<revision>`.

Assertion map: interim test 1 step 4, record set → this case for the encoded
path and the existing record-read case for "only the record itself"; ref and
backlog reads → `authenticated-read-revision-backlog.spec.ts`; agent and done
directory and settings reads → `authenticated-read-listed-records.spec.ts`.

### 2. Open canonical and plan records from the Frontend group
Type: Behavior
Status: planned
Proof: interim test 1 in
`dashboard/frontend-tests/navigation/source-navigation.spec.ts`, same test
name, on `tests/support/frontendSourceNavigation.ts`. Scratch break:
`resolveSourceLink` builds the snapshot link from the ref instead of the
inspected revision; the case fails on the pathname.

Behavior: the hostile backlog is published at a revision → a developer
inspects a card's sources → canonical and plan links open the blob at that
revision with their hashes in a new tab, the dashboard stays in place, and
showing them asked the server only for the in-repository files.

Assertion map (interim step → same step in the new test):

- Seed and plan link: text, origin, pathname, hash for both, two links,
  "File in this snapshot, at revision <short>".
- Bounded correction: one link, accessible name, pathname, empty hash.
- Dot segments and root path: ADR pathname and `#decision`; the
  `release%20notes` pathname.
- Reads: `expectSettledPage`; nothing requested outside the page's origin;
  the page's `path` reads sorted equal the four in-repository files (P1), so
  no external or refused target is asked for. GitHub-side reads → slice 1.
- Follow: new tab to `github.com` at the seed's pathname, dashboard URL and
  project choice unchanged, detail still open, `aria-expanded` true.
- Every card's anchors: `_blank`, `noopener noreferrer`, at least one seen.

### 3. Keep external and refused targets apart in the Frontend group
Type: Behavior
Status: planned
Proof: interim tests 2 and 3 in
`dashboard/frontend-tests/navigation/source-navigation-refused.spec.ts`, same
test names and arrangement. Scratch break: `resolveSourceLink` offers a
`javascript:` target as a link; the refused-targets case fails on "Not offered
as a link" and the link count.

Behavior: the same backlog → a developer inspects an external reference, a
script or data target, and five targets naming no file or web address → the
external reference is a link marked as outside the snapshot and opens in a new
tab; every other target is text with its reason, and no recorded markup runs.

Assertion map:

- External reference: both `href`s, the external statement twice, no "File in
  this snapshot", no short revision; follow to `status.example.com` with path
  and search kept.
- Script and data schemes: both recorded texts, both reasons, zero links,
  clicking the texts.
- Five non-file targets: recorded text, reason, zero links each.
- Nothing runs: the heading and direction shown as text, no injected markup
  before and after reading every card, anchor schemes only `https:` and
  `http:`, no dialog, title and URL unchanged.

### 4. Stop group-neutral tests borrowing the interim group
Type: Structure
Status: planned
Proof: the edited checks and the gate above stay green with the interim group
still present; every group's `--list` is unchanged.

Internal change, enabling slice 5: tests that use the interim group only as
their default example take a remaining group instead.
`backend-tests/runtime/dashboard-artifact-demand.spec.ts` (default setup) and
`backend-tests/launches/start-origin-demand.spec.ts` load
`backendGlobalSetup.ts`; `local-test-suite-fixtures.mjs` defaults to
`controlled-backend.config.mts`; `ci-proof-actions.test.mjs` and
`ci-proof-frontend-report.test.mjs` take their producer example and expected
entries from a remaining root. Per-group rows stay until slice 5. If
`dashboard-artifact-demand` cannot take the Backend setup without changing
what it proves, stop and replan before slice 5.

### 5. Retire Dashboard Integrated UI Test
Type: Behavior
Status: planned
Proof: Key examples 3 and 4.
`find dashboard/tests -name '*.spec.ts'` prints nothing;
`npm run test:dashboard:integrated` reports a missing script; each remaining
group's `npx playwright test --config <config> --list` equals its listing
before slice 1 plus the new source-navigation cases; the gate above; branch
CI green with `ci-proof` naming `e2e`, `dashboard/frontend-tests`,
`dashboard/backend-tests` and `Distribution`.

Behavior: slices 1–3 delivered → the interim spec is removed → the group no
longer exists anywhere a maintainer runs, lists or reads CI proof, and every
other group runs what it ran.

One delivery removes: `navigation/source-navigation.spec.ts` and
`sourceNavigationJourney.ts`; the `dashboard/tests` location in
`.planning/open-dough.json`; `test:dashboard:integrated` in `package.json`;
`dashboard/integrated.playwright.config.ts` and its `tsconfig.node.json`
entry; `integratedGlobalSetup.ts`; the `dashboard-integrated` job, its
`ci-proof` need and `dashboard/tests=1:case` in `ci.yml`; the step in
`scripts/ci-container.sh`; the entry in `groupRunnerExamples.ts` and
`runner-ownership.spec.ts`'s header; the group's row in
`run-processes.spec.ts`; the integrated layer and runner in
`local-test-suite-checkout.mjs` and `local-test-suite-fixtures.mjs` (its
controlled `ci.yml` and environment list included); the group's case in
`local-test-suite-focused-runners.test.mjs`.

### 6. Name three browser groups in tooling and guidance
Type: Behavior
Status: planned
Proof: `Distribution/tests/test-runner/dashboard-repeat.sh` updated with the
script and green;
`grep -rIl -e dashboard-integrated -e 'test:dashboard:integrated' -e 'Dashboard Integrated UI' -e integratedGlobalSetup -e OPEN_DOUGH_DASHBOARD_INTEGRATED .`
outside `.git`, `node_modules` and `.planning` lists only the records of what
was observed named under current decisions.

Behavior: the group is retired → a maintainer asks `scripts/dashboard-repeat.sh`
or `scripts/ci-shard-balance.mjs` for the integrated group, or reads the
commands and placement guidance → the scripts refuse it with usage naming the
remaining groups, and the guidance names three browser groups.

Edits: `scripts/dashboard-repeat.sh`, `scripts/ci-shard-balance.mjs`, the
`rebalance-ci-shards` skill (both installed copies), the
`browser-test-group.yml` header, `dashboard/COMMANDS.md`, `e2e/README.md`,
`Distribution/tests/README.md`, `local-test-resources.md`,
`Distribution/evaluation/native-setup.md`, the Frontend and Backend READMEs'
"moved from an integrated" sentences, the remaining `dashboard/tests/`
Markdown mentions, and the comments in `launchJourney.ts`,
`runnerConfig.mjs`, `testFiles.mjs` and `run-processes.spec.ts`.

## Concern evidence

Slice-plan refinement was not needed: the provisional plan was replaced in
this planning pass against the scratch observations above. This review
identified no remaining slice-specific concern. Slice 5 is one delivery by
necessity (P3) and holds only removals observed in the scratch run; slice 4
carries its preparation.
