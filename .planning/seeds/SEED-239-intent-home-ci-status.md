---
id: SEED-239
status: active
planted: 2026-11-05
planted_during: Terry Yin's request to make CI status the Intent homepage with timing, backend caching and visible refresh progress
trigger_when: A developer opens Intent to review the current CI result and the cost of its tests
scope: story
---

# SEED-239: Show CI status and timing on the Intent homepage

<a id="show-ci-status-on-intent-home"></a>

### Show CI status and timing on the Intent homepage

**Identity:** SEED-239#show-ci-status-on-intent-home
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/476-show-ci-status-on-intent-home/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"88999e014075a9d6adc8f2daa1fa2a86a345ca1096c664acd130d7a78817978f","plan":"2c5277cc73ae1dd4c8448cf0ebb7a5334e57ab34f17390f173c7a2447ea55d53"}}
```

**Goal.** A developer opening the dashboard's Intent perspective sees the
judged branch's CI result, its proof counts and what that CI attempt cost in
time as Intent's first content, without first choosing a tab or waiting on a
cold CI read when the dashboard already holds an answer. This shortens the
route to CI evidence the developer reviews before landing or test
optimization, and keeps that evidence's freshness visible.

**Scope.**

Required behavior:

- **CI status is Intent's homepage.** The Intent reading mode with nothing
  selected shows CI status in the content area, in place of the empty Purpose
  and Proof panes. The mode strip keeps Intent and Optimization Candidates and
  no longer offers a separate CI status mode. Selecting a location, folder or
  file shows its existing Summary or Purpose/Proof reading, and the developer
  can return to the CI homepage from any selection without leaving Intent. The
  homepage does not depend on Intent locations: it shows when none are
  configured or their read failed, beside that explanation.
- **Existing CI targeting and wording carry over.** The homepage judges the
  same branch the CI status tab judged (the project's trunk, or the selected
  story's published story branch, with the story gap explained when there is
  no branch), keeps the judgment, its proof rows per declared proof entry, the
  re-read on a new observed head, and Check again. Both the GitHub Actions and
  the CI-adapter reading paths keep working.
- **CI wall time.** For the attempt whose proof the homepage shows, show the
  elapsed time from that attempt starting to its completion, covering the
  whole pipeline including setup, checks and final reporting; overlapping jobs
  count once. It comes from the CI read of that attempt, not from summing
  test or job durations.
- **Test execution time per proof entry.** Beside each declared proof entry's
  counts (for example unit tests and browser tests), show the sum of that
  entry's individual test execution durations across its parts, shards or
  parallel workers. It is cumulative execution time, may exceed wall time, and
  is named so it does not read as elapsed time. The CI proof publication path
  (fragments and the attempt's summary) gains the durations it lacks.
- **Partial and absent timing.** Timing evidence that was read but not
  recorded (an older summary, or an adapter attempt without start/completion
  times) is shown as not recorded with why; an entry whose parts are missing,
  ambiguous or partly without durations shows its execution time as partial,
  never as a complete total; an unreadable source keeps the existing
  unavailable wording. No missing timing is shown as zero.
- **Backend cache with visible freshness.** The dashboard server keeps the
  last answer it read for each project and judged branch: the judgment, its
  proof and timings, and when they were retrieved. Each homepage show returns
  any kept answer at once, labelled previously retrieved with its retrieval
  time, and also reads CI afresh as the tab did; a spinner shows while that
  fresh read is in progress, from the start when nothing is kept. The fresh
  answer replaces the kept one on screen and in the cache and ends the
  spinner. A failed refresh ends the spinner, shows the failure, and keeps any
  kept answer labelled previously retrieved, never as newly verified; it does
  not overwrite the kept answer.
- **One target per answer.** Counts, timings and the result shown belong to
  one repository, branch, revision and attempt. A kept or fresh answer for a
  target other than the one now selected is never shown, including when the
  project or story changes while a read is in progress.

Scope limits and boundary assumptions:

- The cache lives in the dashboard server process and is rebuilt by reading
  CI; keeping it across a dashboard server restart is not undertaken.
- No time-based refresh or polling is added: refresh still happens on show,
  on a new observed head and on Check again, so the per-show GitHub request
  count does not grow (the request account in `dashboard/GITHUB-REQUESTS.md`
  states the cache).
- No per-job duration breakdown, trend history, or timing for checks that do
  not publish CI proof entries.
- Launch base CI and other CI surfaces keep their current behavior.

**Key examples.**

1. A developer opens Intent on a project with configured locations and nothing
   selected. CI status of `main` fills the content area; the mode strip shows
   Intent and Optimization Candidates only. They select a test file, read its
   Purpose and Proof, then return to the CI homepage within Intent.
2. A GitHub Actions attempt starts at 10:00 and completes at 10:03. Its
   `tests` entry's tests together execute for 4 minutes across shards and its
   `dashboard/tests` entry's for 2 minutes across parallel workers. The
   homepage shows **CI wall time 3 min**, and beside each entry's counts
   **test execution time 4 min** and **2 min**; wall time is not 6 min.
3. The dashboard read `main` 20 minutes ago. The developer reopens Intent:
   that result, its counts and timings appear immediately, marked previously
   retrieved 20 minutes ago, with a spinner. A newer completed attempt arrives;
   it replaces the shown answer, the previously-retrieved label goes, and the
   spinner stops.
4. After a dashboard server restart, the first visit shows only a spinner
   until CI answers. Later, with the network down, Check again ends with the
   read failure shown while the earlier answer stays visible as previously
   retrieved at its time.
5. A refresh of trunk is in progress when the developer selects a story whose
   story branch has a kept answer. Only the story branch's kept and fresh
   answers appear; the trunk answer arriving late is never shown for it.
6. The shown attempt's summary predates timing: its counts appear, each
   entry's execution time reads not recorded, and wall time still shows from
   the CI read. One browser-test shard's fragment is missing: that entry's
   execution time reads partial, with the missing part named.
7. A CI-adapter project whose adapter supplies no attempt start/completion
   times shows its result and counts with CI wall time not recorded.

**UI.** The homepage keeps the CI status content's existing order: branch
heading, retrieval line, judgment, then the attempt's proof. The retrieval
line carries the freshness: checking with a spinner, checked at a time, or
previously retrieved at a time while checking or after a failed refresh. CI
wall time is named once with the attempt; test execution time sits on each
proof entry's row. Wording follows the dashboard UX North Star's
[evidence and freshness distinctions](../../docs/dashboard-ux-ui-north-star.md#evidence-freshness-and-uncertainty)
(not recorded, unavailable, previously retrieved), applied consistently with
the existing CI proof wording.

**Architecture.**

- *Wall time belongs to the CI reading, execution time to CI proof.* The
  attempt summary is written inside the attempt, before its final reporting
  ends, so it cannot hold the attempt's wall time. The GitHub Actions read of
  the shown attempt supplies its start and completion; the CI-adapter contract
  (`src/skills/dough-execute-plan/manuals/custom-ci.md` and its proof manual)
  gains optional attempt start and completion times, so existing adapters stay
  valid and show wall time not recorded. Test execution durations join the CI
  proof contract as optional, additive fields on fragments and summary entries
  and parts, produced from the test reports the collector already converts
  (the outcomes file and the Playwright record). Older summaries and
  collectors remain valid; the released `dough-test-optimization` collector
  and its guidance carry the change to other projects.
- *A first kept read answer in the server.* Today the authenticated read
  boundary answers each read afresh (only avatars are kept by the process).
  The cache becomes one server-side owner of the last CI status answer per
  project and judged branch, beside the CI status and CI proof reads, keyed
  so an answer is only ever returned for its own target. It is disposable
  derived state rebuilt from CI under [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  never a home of project state; HTTP responses stay uncached
  (`no-store`). A kept answer is distinguished from a fresh one in the
  answer itself, so the page cannot present it as newly verified. Proof of a
  completed attempt is fixed by its attempt identity, so a kept proof only
  changes when the judgment names another attempt.
- *The homepage generalises the tab.* The CI status content moves into the
  Intent mode's empty-selection reading instead of a parallel copy; the
  `ci-status` mode and its separate panel go, and the per-project kept mode
  choice no longer offers it.

**Evaluation basis.** Under [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md),
compare the current journey (open Intent, choose CI status, wait for a cold
read) with the homepage journey and a warm-cache read: time to first CI
evidence on screen and GitHub requests per show. Verify both timing measures
against a known parallel attempt, including an incomplete and an older
report, and observe initial loading, kept-answer refresh, a newer attempt,
refresh failure and target switching.
