---
id: SEED-381
status: active
planted: 2026-11-16
planted_during: Developer request to replace automatic test sharding with fixed CI shards
trigger_when: selected from the product backlog
scope: story
---

# SEED-381 — Fixed CI test shards

Open Dough maintainers currently keep an automatic, duration-driven deal of
browser tests into CI shards: committed `longest-first` duration lists, the deal and
preview scripts, a normalized time budget with runner factors, stale-list
detection, and the tests and documents for all of it. The lists churn with
every refresh, and the machinery is far larger than the decision it serves.
Replace it with fixed shards declared in the CI configuration by folder and
file patterns, and rebalance them only on request.

The story removes the replaced behavior completely: code, data, fixtures,
tests and documentation. The result keeps no historical record of the former
deal and no text describing what no longer exists. Git history is the only
record.

<a id="fixed-shards-for-browser-tests-and-on-demand-rebalancing"></a>

### Fixed shards for browser tests and on-demand rebalancing

**Identity:** SEED-381#fixed-shards-for-browser-tests-and-on-demand-rebalancing
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/656-fixed-shards-for-browser-tests-and-on-demand-rebalancing/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5ae59e7de4d80e8a744ecc57bc70c3f14eef62c2877d854b56cfbe4858ceab16","plan":"d0844331ab518981c9230ff484c4b5a77b197ec247679f69d1781684ae81b974"}}
```

**Goal:** Maintainers rebalance every CI test group's shards only when they
choose to, from recent CI evidence, with every remaining shard declared as
fixed configuration.

**Scope:**

- The `e2e`, `dashboard-integrated`, `dashboard-frontend` and
  `dashboard-backend` jobs in `.github/workflows/ci.yml` each declare their
  shards there, as the `distribution-tests` matrix does: every shard but the
  last names the spec files it runs as repository-relative folder or file
  glob patterns over the spec files the group's configuration already
  discovers, and the last shard names no pattern and runs every discovered
  spec no earlier shard claims. A one-shard group declares no pattern. Shard
  counts, job names, CI proof parts and the `<group>-times-<shard>` artifact
  names stay as they are.
- Loading a group's configuration fails, before any test is selected, when a
  spec file matches the patterns of two shards, naming the file and the
  shards, or when a pattern matches no spec file, naming the pattern. This is
  the same rule and the same check the Distribution shares use.
- A shard is reproducible locally by its number through the group's existing
  `<prefix>_SPLIT=i/n`. A run without it runs every spec of the group.
- The starting shards come from recent `main` timing through the rebalancing
  script below, use folder patterns first and file-name globs only where one
  folder outweighs an even shard, and are tuned once from the story's own CI
  runs.
- Each shard keeps uploading its `<group>-times-<shard>` artifact, now
  retained for 90 days as the Distribution `test-times-<i>` artifacts are.
- Remove completely what remains of the automatic deal: `e2e/longest-first*`,
  `dashboard/*.longest-first*`, the deal, duration-list reading, preview and
  refresh code (`scripts/share-deal.mjs`, `scripts/share-preview.mjs`,
  `scripts/test-shares.mjs`, and what of `scripts/duration-list.mjs` only they
  use), their tests and fixtures, the deal, preview and refresh passages of
  `dashboard/tests/shards.md`, every other passage that refers to them
  (group READMEs, configuration comments, maintainer timing documents, queued
  stories' seeds and plans), and the maintainer findings entries that describe
  the deal or a refreshed duration list as the current response.
- Add a private maintainer skill under `.agents/skills/`, not distributed by
  the installer, backed by one script. For a chosen group (the four browser
  groups or the Distribution suite) the script reads that group's times
  artifacts from the last successful `ci.yml` runs on `main`, takes each
  file's median seconds across them, and prints:
  - each shard's total seconds under the patterns currently in `ci.yml`, with
    the files the runs did not time listed apart;
  - the notably slow files, those that alone carry a large part of an even
    shard, as candidates for a faster test rather than a move;
  - the smallest pattern change that brings the slowest shard closest to the
    even total, as a unified diff to `ci.yml`: one existing pattern moved to
    another shard, or one new folder or file pattern taken out of the last
    shard's rest. When no single change improves the slowest shard notably, it
    says the shards are balanced and prints no diff.
- The script only reads: it starts no run, changes no file, and the maintainer
  applies the diff. The skill says when to use it, how to invoke it, and that
  the next `main` runs are the check of an applied change.

**Scope limits:**

- Shard counts and deadlines are not changed. `scripts/ci-job-times.sh` and
  the job-count rule in `dashboard/tests/shards.md` stay and keep deciding how
  many jobs a group has;
  [SEED-382](SEED-382-browser-test-job-headroom-on-slow-runners.md#browser-test-job-headroom-on-slow-runners)
  owns deadline headroom on slow runners.
- Shards are declared by spec patterns only. The `chromium-deployments` and
  `chromium` Playwright projects keep queueing the serial production chains
  first inside whichever shard their files belong to.
- The per-spec times reporter and the times form of the artifacts are kept;
  they are the rebalancing input.
- The script proposes one change per invocation. A maintainer who wants more
  applies it and invokes the script again.
- Released `CHANGELOG.md` entries and the done-story catalog are release and
  identity records, not descriptions of current behavior, and stay.

**Key examples:**

- A maintainer adds `e2e/new-area/first.spec.ts` and changes nothing else →
  CI runs it once, in the last E2E shard; no list or preview step precedes
  the push.
- A maintainer adds `dashboard/backend-tests/launches/new-case.spec.ts` → CI
  runs it once, in the backend shard whose pattern names that folder.
- A maintainer gives one E2E shard `e2e/sessions/**` while another keeps
  `e2e/sessions/agent-*` → `npm run test:e2e` and every E2E shard fail before
  any test starts, naming one overlapping spec file and both shards.
- A story moves the last spec out of `dashboard/tests/intent` and leaves the
  pattern behind → the integrated configuration fails naming the pattern that
  matches no spec file.
- `OPEN_DOUGH_E2E_SPLIT=2/6 npm run test:e2e` locally → runs exactly the spec
  files CI's second E2E shard runs.
- A maintainer invokes the skill for `e2e` when the fourth shard totals 1,050
  seconds and the sixth 600 against an even 820 → the script prints the six
  totals, the slow files, and a `ci.yml` diff moving one pattern from the
  fourth shard to the sixth; `ci.yml` on disk is unchanged.
- The maintainer invokes it again after applying that diff, or for a group
  whose shards are already close → it prints the totals and that the shards
  are balanced, with no diff.
- A recent run's times artifacts were produced under an older shard layout →
  its per-file seconds still count, because totals come from applying the
  current patterns to each file's seconds.
- No successful `main` run still holds the group's times artifacts → the
  script fails saying so and proposes nothing.
- A maintainer invokes the skill for the Distribution suite → the same report
  and proposal over the `distribution-tests` matrix and its `test-times-<i>`
  artifacts.

**Architecture:**

- `ci.yml` is the one owner of shard membership for all five groups. The
  module that reads the `distribution-tests` matrix for the Node runner
  becomes the one reader for every group: each browser configuration asks it
  for its shard's spec files and is told only the shard number, and the
  rebalancing script asks it for every shard's files. The selection and
  overlap rules exist once. The repository has no YAML parser, so each
  group's shard declaration stays in a form that module reads and the called
  `browser-test-group.yml` turns into its matrix. No Accepted ADR constrains
  this.
- Shard balance has no automatic owner. The rebalancing script is the only
  place per-file seconds are read, and nothing in the repository records
  them. A shard that grows past its deadline fails that shard; drift before
  then is visible through `scripts/ci-job-times.sh`, the job durations, or
  the script.
- Folder and file-name patterns can carry the current load. In the recorded
  seconds, E2E totals about 4,940 over six shards (about 820 each) and only
  `sessions` (1,120) and `launches` (1,094) exceed an even shard, each
  dividing at its `agent-*` files (555 and 732); backend totals about 3,210
  over three shards and its nine folders group into about 1,060, 1,055 and
  1,090; integrated's `navigation` divides by file-name prefix; frontend is
  one shard. The longest single spec file is about 150 seconds.

**Considered:**

- Declaring a shard as a Playwright project. A pattern over the same files
  says the same thing in the one form all five groups share, and the two E2E
  projects already have another job, queueing the production chains, that is
  independent of shard membership.
- Folding the job-count report into the rebalancing script. They answer
  different questions from different data, job step times against the
  deadline and per-file seconds per shard, and the job-count rule has its own
  readers.

**Outcome:** No duration list or dealing code remains in the repository. CI
runs every browser spec file exactly once across each group's fixed shards,
with each group's slowest shard no slower than under the deal. A maintainer
can rebalance any group by invoking the skill and reviewing its proposed
`ci.yml` change.
