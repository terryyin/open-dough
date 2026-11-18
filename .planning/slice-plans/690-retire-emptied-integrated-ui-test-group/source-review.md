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
| 1 | A snapshot link opens the blob at the inspected revision and preserves its recorded hash. | slice 2 |  |
| 2 | A bounded correction’s bare plan link is offered as a link. | slice 2 |  |
| 3 | A recorded `..` path resolves to its target inside the repository. | slice 2 |  |
| 4 | A recorded root path resolves to its target inside the repository. | slice 2 |  |
| 5 | A snapshot file is labeled “File in this snapshot.” | slice 2 |  |
| 6 | An external reference is labeled “External reference.” | slice 3 |  |
| 7 | Every card anchor has `target="_blank"`. | slice 2 |  |
| 8 | Every card anchor has `rel="noopener noreferrer"`. | slice 2 |  |
| 9 | Following a recorded link opens a new tab. | slice 2 |  |
| 10 | Following that link leaves the dashboard in place in the original tab. | slice 2 |  |
| 11 | A `javascript:` target is shown as text with its refusal reason and is unavailable as a link. Key example 1 locates this assertion in the maintained Frontend source-navigation spec. | slice 3 |  |
| 12 | A `data:` target is shown as text with its refusal reason and is unavailable as a link. | slice 3 |  |
| 13 | An invalid target is shown as text with its refusal reason and is unavailable as a link. | slice 3 |  |
| 14 | Recorded markup is displayed as literal text. | slice 3 |  |
| 15 | Displaying recorded markup executes none of it. | slice 3 |  |
| 16 | The page asks its own server for the canonical SEED-021 seed file. | slice 2 |  |
| 17 | The page asks its own server for the correction’s canonical plan file. | slice 2 |  |
| 18 | The page asks its own server for the canonical ADR file. | slice 2 |  |
| 19 | The page asks its own server for `docs/release notes/2026.md`. | slice 2 |  |
| 20 | Showing the links causes no additional in-repository file path to be requested. | slice 2 |  |
| 21 | An external reference causes no target read. | slice 2 |  |
| 22 | A refused target causes no target read. | slice 2 |  |
| 23 | Showing the links causes no request outside the dashboard’s origin. | slice 2 |  |
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
| 43 | `ci-proof-actions` runs or loads a remaining group. | slice 4 |  |
| 44 | `ci-proof-frontend-report` runs or loads a remaining group. | slice 4 |  |
| 45 | The `local-test-suite` checkout uses a remaining group. | slice 5 |  |
| 46 | The applicable `local-test-suite` fixtures use a remaining group. | slice 5 |  |
| 47 | The `local-test-suite` focused-runner tests use a remaining group. | slice 5 |  |
| 48 | Backend `runner-ownership` uses a remaining group. | slice 5 |  |
| 49 | Backend `start-origin-demand` uses a remaining group. | slice 4 |  |
| 50 | Backend `dashboard-artifact-demand` uses a remaining group. | slice 4 |  |
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
