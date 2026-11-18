# Source-only review

Fresh general-purpose agent `/root/source_review`, launched with `fork_turns: none`
on 2026-11-18. The launch message supplied only the selected [story's Goal, Scope,
limits, and key examples](../../seeds/SEED-334-product-wide-end-to-end-tests.md#retire-emptied-integrated-ui-test-group).
It asked for one id per independently observable promise and prohibited project
file access, changes, slice ownership, and acceptance. The rows retain its returned
ids and wording. The section context and allocations around them preserve their
source conditions.

- 1–15 are Scope at the Dashboard Frontend Test boundary. 16–23 apply with the
  hostile backlog shown and every card inspected (Scope and key example 2).
- 24–30 are Scope and key example 2 at the server boundary. 31–51 are Scope,
  including the same delivery as the last spec, and key example 3.
- 52–62 are Scope for live guidance, in the retirement delivery or the next.
  They apply to the delivered roster if present, or the current hard-coded callers.
- 63–68 are key example 4 for remaining coverage. 69–72 are the maintained
  historical proof cases from Scope and key example 5. 73–77 are Scope limits
  for historical names and paths.

## Source context from the reviewer

- The interim spec is described as 246 lines and three tests. The story identifies
  it as the only existing test coverage for `src/sourceLink.ts` and
  `RecordedLink.tsx`. The existing `authenticated-read-boundary` record case
  already asks GitHub for the record alone at the revision.
- CI rejecting empty shard selections, and `ci-proof-declaration` requiring
  agreement among needs, expect tokens and declared locations, explain why the
  last-spec move and retirement are delivered together.
- The Frontend scratch edit in key example 1 offers a `javascript:` link, causes
  the maintained spec to fail on “not offered as a link,” and passes once restored.
  That is proof of promise 11.
- Intent uses locations from the revision it displays, and CI proof keys entries
  by location path. Existing historical proof cases supply the observations for
  promises 69–72. The story allocates no new product behavior or historical proof
  cases.
- The story excludes new groups or tiers, speed or shard targets, E2E naming and
  tagged-install proof. Shared support and `integratedStateCompletion` are outside
  the retirement. The Markdown under `dashboard/tests/` is limited to retired-group
  edits, with its removal deferred to `SEED-334#carry-dashboard-test-knowledge-in-code`.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A snapshot link opens the blob at the inspected revision and preserves its recorded hash. | slice 2 | observed: frontend-tests/navigation/source-navigation.spec.ts seed and plan step: GitHub origin, pinned path, recorded hashes; follow step observed the popup request |
| 2 | A bounded correction’s bare plan link is offered as a link. | slice 2 | observed: source-navigation.spec.ts bounded correction step: one accessible canonical link, pinned pathname and empty hash |
| 3 | A recorded `..` path resolves to its target inside the repository. | slice 2 | observed: source-navigation.spec.ts dot and root path step: ADR pinned pathname and #decision from the dot path |
| 4 | A recorded root path resolves to its target inside the repository. | slice 2 | observed: source-navigation.spec.ts dot and root path step: pinned root-relative docs/release%20notes/2026.md |
| 5 | A snapshot file is labeled “File in this snapshot.” | slice 2 | observed: source-navigation.spec.ts seed and plan step: short inspected revision in the snapshot label |
| 6 | An external reference is labeled “External reference.” | slice 3 | observed: frontend-tests/navigation/source-navigation-refused.spec.ts external reference case: exact both hrefs, explanation twice, no snapshot label or short revision, actual popup request and dashboard stays |
| 7 | Every card anchor has `target="_blank"`. | slice 2 | observed: source-navigation.spec.ts every card anchor step: exact _blank on every anchor, with a nonempty set |
| 8 | Every card anchor has `rel="noopener noreferrer"`. | slice 2 | observed: source-navigation.spec.ts every card anchor step: exact noopener noreferrer on every anchor |
| 9 | Following a recorded link opens a new tab. | slice 2 | observed: source-navigation.spec.ts follows snapshot link; frontendSourceNavigation.ts followLeavingDashboard observes popup and request before closing |
| 10 | Following that link leaves the dashboard in place in the original tab. | slice 2 | observed: source-navigation.spec.ts follow step and frontendSourceNavigation.ts followLeavingDashboard, unchanged original URL/project and still-visible expanded detail |
| 11 | A `javascript:` target is shown as text with its refusal reason and is unavailable as a link. Key example 1 locates this assertion in the maintained Frontend source-navigation spec. | slice 3 | observed: source-navigation-refused.spec.ts script and data step: literal script text, refusal reason and zero links; scratch with clickable output failed both rejection assertions before clicks |
| 12 | A `data:` target is shown as text with its refusal reason and is unavailable as a link. | slice 3 | observed: source-navigation-refused.spec.ts script and data step: literal data text, refusal reason, zero links and click on text |
| 13 | An invalid target is shown as text with its refusal reason and is unavailable as a link. | slice 3 | observed: source-navigation-refused.spec.ts no-file/no-address step: five recorded texts and their reasons, each card has zero links |
| 14 | Recorded markup is displayed as literal text. | slice 3 | observed: source-navigation-refused.spec.ts recorded text step: heading and direction display the literal markup as text |
| 15 | Displaying recorded markup executes none of it. | slice 3 | observed: source-navigation-refused.spec.ts recorded text step: no injected markup before or after each card inspection, only web schemes, no dialogs, unchanged title and URL after clicks |
| 16 | The page asks its own server for the canonical SEED-021 seed file. | slice 2 | observed: source-navigation.spec.ts settled exact path array after inspecting all cards includes the SEED-021 seed |
| 17 | The page asks its own server for the correction’s canonical plan file. | slice 2 | observed: source-navigation.spec.ts settled exact path array after inspecting all cards includes plan 059 |
| 18 | The page asks its own server for the canonical ADR file. | slice 2 | observed: source-navigation.spec.ts settled exact path array after inspecting all cards includes the ADR |
| 19 | The page asks its own server for `docs/release notes/2026.md`. | slice 2 | observed: source-navigation.spec.ts settled exact path array after inspecting all cards includes docs/release notes/2026.md |
| 20 | Showing the links causes no additional in-repository file path to be requested. | slice 2 | observed: source-navigation.spec.ts compares entire settled path array to exactly four files after inspecting all cards |
| 21 | An external reference causes no target read. | slice 2 | observed: source-navigation.spec.ts exact path array and zero foreign origins after every card, including the external reference |
| 22 | A refused target causes no target read. | slice 2 | observed: source-navigation.spec.ts exact path array and zero foreign origins after every card, including refused targets |
| 23 | Showing the links causes no request outside the dashboard’s origin. | slice 2 | observed: source-navigation.spec.ts settled outsideDashboard() is empty before popup; frontendSourceNavigation.ts collects page requests from before navigation and compares after the origin is known |
| 24 | When a real dashboard server reads `docs/release notes/2026.md` at the inspected revision, it asks GitHub for `contents/docs/release%20notes/2026.md?ref=<revision>`. This Backend case belongs in `authenticated-read-boundary` and covers a path with a space outside the planning directory. | slice 1 | observed: authenticated-read-boundary.spec.ts encodes the space in a canonical path, 200/pinned path and exact contents argv; scratch unencoded argv failed |
| 25 | That file read makes exactly one GitHub request for the file. | slice 1 | observed: authenticated-read-boundary.spec.ts encodes the space in a canonical path, exact one-call ghCalls delta after membership read |
| 26 | The ref read keeps its existing Dashboard Backend Test owner. | slice 1 | observed: authenticated-read-revision-backlog.spec.ts asks again which commit the ref names, exact ref calls per membership read |
| 27 | The backlog read keeps its existing Dashboard Backend Test owner. | slice 1 | observed: authenticated-read-revision-backlog.spec.ts asks again which commit the ref names and reads the backlog pinned to the named revision, content call and bytes |
| 28 | The agent read keeps its existing Dashboard Backend Test owner. | slice 1 | observed: authenticated-read-listed-records.spec.ts a later revision with unchanged profiles asks GitHub for no profile content, profile bytes and changed requests |
| 29 | The done directory read keeps its existing Dashboard Backend Test owner. | slice 1 | observed: authenticated-read-listed-records.spec.ts several done records are read from GitHub at once and a later revision asks GitHub only for the record whose blob changed, catalog, exact calls and records |
| 30 | The settings read keeps its existing Dashboard Backend Test owner. | slice 1 | observed: authenticated-read-listed-records.spec.ts a later revision with unchanged profiles asks GitHub for no profile content, settings bytes at the revision |
| 31 | `dashboard/tests/` contains no `*.spec.ts`, including the original `dashboard/tests/navigation/source-navigation.spec.ts`. | slice 5 |  |
| 32 | `npm run test:dashboard:integrated` reports an unknown script. | slice 5 |  |
| 33 | Open Dough’s current Intent omits the `dashboard/tests` location and lists E2E Test, Dashboard Frontend Test, Dashboard Backend Test and Distribution Tests. | slice 5 |  |
| 34 | `dashboard/integrated.playwright.config.ts` is removed. | slice 5 |  |
| 35 | Its `tsconfig.node.json` entry is removed. | slice 5 |  |
| 36 | `integratedGlobalSetup.ts` is removed. | slice 5 |  |
| 37 | `ci.yml` contains no `dashboard-integrated` job. | slice 5 |  |
| 38 | `ci-proof` has no `dashboard-integrated` need. | slice 5 |  |
| 39 | `ci-proof` has no integrated-group expect token. | slice 5 |  |
| 40 | `scripts/ci-container.sh` drops the integrated-group step. | slice 5 |  |
| 41 | `groupRunnerExamples.ts` drops the integrated-group entry. | slice 5 |  |
| 42 | `sourceNavigationJourney.ts` is removed. | slice 5 |  |
| 43 | `ci-proof-actions` runs or loads a remaining group. | slice 4 | observed: Distribution/tests/support/ci-proof-actions.test.mjs replays actual CI action fragments from E2E, Frontend, Backend, and Distribution and observes exact counts, timing and missing parts |
| 44 | `ci-proof-frontend-report` runs or loads a remaining group. | slice 4 | observed: Distribution/tests/support/ci-proof-frontend-report.test.mjs runs actual summary and report shell blocks with E2E, Frontend, Backend; exact Markdown, excluding E2E/Backend files, and combined summary |
| 45 | The `local-test-suite` checkout uses a remaining group. | slice 5 |  |
| 46 | The applicable `local-test-suite` fixtures use a remaining group. | slice 5 |  |
| 47 | The `local-test-suite` focused-runner tests use a remaining group. | slice 5 |  |
| 48 | Backend `runner-ownership` uses a remaining group. | slice 5 |  |
| 49 | Backend `start-origin-demand` uses a remaining group. | slice 4 | observed: dashboard/backend-tests/launches/start-origin-demand.spec.ts partial Codex layout: Backend setup, distinct launches, only Claude completes, both isolated layouts are cleaned |
| 50 | Backend `dashboard-artifact-demand` uses a remaining group. | slice 4 | observed: dashboard/backend-tests/runtime/dashboard-artifact-demand.spec.ts Backend default setup: real app and server requests queue, one build, complete/fail/interrupt observations and teardown; focused run passes |
| 51 | Backend `run-processes` uses a remaining group. | slice 5 |  |
| 52 | `scripts/dashboard-repeat.sh` drops the group. | slice 6 |  |
| 53 | Its test drops the live group reference. | slice 6 |  |
| 54 | `scripts/ci-shard-balance.mjs` drops the group. | slice 6 |  |
| 55 | The `rebalance-ci-shards` skill drops the group. | slice 6 |  |
| 56 | `browser-test-group.yml` drops the group. | slice 6 |  |
| 57 | `dashboard/COMMANDS.md` drops the group. | slice 6 |  |
| 58 | `e2e/README.md` drops the group. | slice 6 |  |
| 59 | `Distribution/tests/README.md` drops the group. | slice 6 |  |
| 60 | `local-test-resources.md` drops the group. | slice 6 |  |
| 61 | `Distribution/evaluation/native-setup.md` drops the group. | slice 6 |  |
| 62 | Applicable code comments drop the group. | slice 6 |  |
| 63 | E2E Test retains its existing `--list` entries. | slice 5 |  |
| 64 | Dashboard Frontend Test retains its existing `--list` entries, with only the added source-navigation cases. | slice 5 |  |
| 65 | Dashboard Backend Test retains its existing `--list` entries, with only the added source-navigation coverage. | slice 5 |  |
| 66 | Distribution Tests retains its existing listed tests under the example’s “each remaining group” condition. | slice 5 |  |
| 67 | Trunk CI is green after the delivery. | target CI |  |
| 68 | `ci-proof` collects four entries after the delivery. | slice 5 |  |
| 69 | Opening a story marked Done before retirement shows the locations from that story’s own revision, including Dashboard Integrated UI Test. | slice 5 |  |
| 70 | An entry outside the shown revision’s locations is named without a link. | slice 5 |  |
| 71 | Comparing a current story against a baseline that still has `dashboard/tests` marks that entry removed and shows no after value. | slice 5 |  |
| 72 | Scope history shows a gap for a build without the scope. | slice 5 |  |
| 73 | Findings retain recorded integrated-group names. | slice 6 |  |
| 74 | Done records retain recorded integrated-group names. | slice 6 |  |
| 75 | `CHANGELOG.md` retains recorded integrated-group names. | slice 6 |  |
| 76 | CI repeat fixtures retain their recorded integrated job names. | slice 6 |  |
| 77 | Fixture data using `dashboard/tests` as an example path retains that path. | slice 6 |  |
