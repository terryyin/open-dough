---
id: SEED-262
status: active
planted: 2026-11-08
scope: epic
---

# Faster dashboard test feedback

Developers running dashboard checks should get a result sooner while keeping
the integration proof that makes each check worth running. Start with
[`agent-launch-attention.spec.ts`](../../dashboard/tests/sessions/agent-launch-attention.spec.ts).
Both cases passed in 12.02–13.01s wall with two local workers. That profile
separated run startup, shared hooks, and test bodies. Use it to find other
consumers of each cost and prove savings across the affected family.
[Profiling evidence](../TEST-OPTIMIZATION-CANDIDATES.md#card-attention-launch-and-origin-setup)

For each story, compare the same ordinary test selection before and after
under comparable conditions. Include the starting example where it bears the
cost and a second consumer or representative selection. Report elapsed time,
executed cases, and the phase or operation each story changes. Keep the
surviving proof explicit and include its runtime when coverage moves to another
tier. Follow the project's
[test automation rules](../../AGENTS.md#test-automation),
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests),
[macOS test gate](../../tests/local-test-resources.md#machine-sleep-on-macos),
and [definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Story decomposition

<a id="migrate-git-publication-native-fixtures"></a>

### Build git-publication native fixture repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-git-publication-native-fixtures
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/534-migrate-git-publication-native-fixtures/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"20cc8677d1582fd80bee81b3ddf95bc5240c27fdfc7f5e040c5e555c9bf6a9cd","plan":"78e7844848536c64734d799bc781fe94c2154ca48d14875c5d4f3c61b152ce69"}}
```

#### Goal

A maintainer reading a Git publication native check can tell which published
facts its starting repository contains and which Git operations the check
exercises. The maintainer can assess whether retained native evidence still
applies when an input that builds that fixture changes.

#### Scope

- Startup, admission, one-shot and owned-context fixtures declare their
  starting repository facts through the
  [shared MakeMe description](../../tests/support/repositoryTestData.mjs) and
  [materializer](../../tests/support/repository-fixture.mjs). Name the stories,
  their readiness and the relevant revisions at the call site or in the
  named fixture it selects. Preserve the Git histories, working state and
  existing assessor verdicts that each journey depends on.
- Keep real Git for owned worktrees, competing writers, interrupted and
  resumed publication, and other transitions observed by the checks. Keep
  real installed commands for the prior admissions and claims whose receipts
  or ownership the scenarios consume. Keep literal divergent or dirty data
  visible where the check depends on those exact inputs.
- Remove `createQueuedTrunk`, `createPreparationTrunk`, `createSiblingTrunk`
  and their legacy setup. Remove the last non-dashboard use of
  `writeQueuedStories`. Remove the writer itself when no caller remains.
- Each affected evidence identity covers the repository inputs that its
  fixture uses, including transitive builders and writer helpers. A failed
  required input read cannot yield an apparently complete current identity.
  Historical records retain their original hashes and remain available for
  replay and evidence assessment. Paid native runs remain manual-only.
- Dashboard origins, release-source fixtures and the MakeMe-free native
  worktree-preparation fixtures remain separate. Normalized repository
  hashing as an evidence key is deferred. Its comparison technique serves
  as migration proof.

#### Key examples

1. A startup fixture names Ready queued A and B and the setup and command
   files. When the claim proceeds in a new workspace, the real commands
   leave root markers after the claim, including when the workspace is gone.
2. An admission fixture names its queued trunk and the startup probe. The
   existing investigation still starts with no queued mission. Continuation
   and closure still observe real prior admissions and their ownership.
3. A queued one-shot fixture names Ready B and its unfinished sibling B2.
   Refinement selects B2 while keeping B Ready. The default-main case still
   observes the staged, unstaged and untracked human edits in that checkout.
4. The preparation-land fixture names rough C. Its real retained worktree
   holds the creation ref and the competing writer advances trunk. The
   existing landing verdict still checks that topology and publication.
5. The evidence writer runs after a fixture or transitive input changes.
   The corresponding input hash changes. Generated notes source remains
   fixture data, so its embedded imports cannot break the one-shot identity.

#### Architecture

Use the existing source-hash closure with traceable imports and explicit roots
for inputs loaded outside JavaScript imports. This follows the same dependency
mapping as compiler depfiles. The fixture entry point names the build, its
import and spawn edges identify dependencies, and the retained hashes record
the inputs. A byte change in shared MakeMe can invalidate a record even when
the built fixture behaves identically. Apply the evidence reuse judgment in
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md#5-assess-now-and-delete-spent-evidence)
to that case. An input identity establishes provenance for a recorded result.

A normalized repository digest could reduce those invalidations. Admission
builds in two scratch locations produced different trees even before the probe
commit because the generated scripts contain the fixture path. A reliable
snapshot key would have to normalize those tracked bytes and separately
account for configuration, dirty state, worktrees and writer helpers. Keeping
the existing identities without expanding their input coverage leaves the
observed gaps in startup, one-shot and owned-context.

#### Evaluation

Compare the same credential-free startup and admission selections before and
after under comparable load. Record elapsed time, the executed cases and the
fixture construction or identity work that changed, following the epic's
evaluation rule. Preserve the corresponding one-shot and owned-context
verdicts and verify input sensitivity without credentials.

<a id="declare-fake-github-planning-data"></a>

### Serve fake GitHub planning files from explicit MakeMe data

**Identity:** SEED-262#declare-fake-github-planning-data
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/530-declare-fake-github-planning-data/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e8ace42c9e9d224e19599d13bd01ccb41ac1c5a9057e7d504bdbe9ac46900aef","plan":"1d18ef03c22cf1236be76934b870e82aad5e67093434b02eb04297b754e8c84f"}}
```

#### Goal

A maintainer reading a dashboard journey that serves a project through the
fake GitHub can see which planning facts that project publishes at each
revision. Today about 40 dashboard helpers and specs put literal
`# Product backlog` text, seed headings, profiles or done records into the
fake GitHub's published files, so the facts that drive a case hide inside
Markdown templates. The served files come from the same
[repository description](../../tests/support/repository-fixture.mjs) that
Git fixtures use, rendered with the production encoders. Dashboard feedback
must not get slower.

#### Scope

- A `makeMe.aRepository` description renders to the published files of each
  named revision without Git, as the files the fake GitHub serves
  (`PublishedRevision`). A later revision serves the earlier revisions'
  files with its own changes and removals applied, as Git would publish
  them. Rendering uses the encoders the Git materializer already uses:
  backlog membership, story states, agent profiles, done records and the
  rebuilt done catalog. The Git materializer and this rendering share one
  file renderer.
- Fake GitHub helpers and specs that hand-write published planning files
  declare them instead. On 2026-11-08 these included `refreshJourney.ts`,
  `notificationStoryJourney.ts`, `sessionNavigationJourney.ts`,
  `sourceNavigationJourney.ts`, `doughnutProject.ts`, `recentlyDoneRecords.ts`,
  `accessibleBoard.ts`, `takenAgentProfileRecords.ts`, `agentRosterRecords.ts`,
  `authenticatedAvatarRecords.ts`, the shared, resuming and turn read
  supports, and the specs under `observation`, `sessions`, `stories`,
  `navigation`, `configuration` and `runtime` that build their own backlog
  text. Helpers that already call `renderPublishedBacklog` but hand-write
  seeds or records, such as `catalogProjectRecords.ts`, move to the same
  description. A seed's prose that the dashboard reads, such as a story's
  heading, identity line or purpose, stays a declared file in the revision;
  its story state comes from the declared facts.
- Moving published files (`publishMovingFiles` with `moveTrunk` and
  `moveBranch`) take their revisions from named revisions of one description.
  The fake GitHub's answers, observation and held or failing reads stay in
  the harness.
- Keep literal bytes at the call site where a spec proves them: malformed or
  truncated backlogs, legacy shapes, unreadable records, and deliberately
  invalid input. Build the surrounding valid files from the description.
- Remove superseded literal templates, such as `emptyBacklog` in
  `originAnswers.ts`, once their last consumer declares its facts.
- Boundary assumption: a helper that builds a Git repository belongs to
  dashboard test repositories (completed
  `SEED-262#migrate-dashboard-origin-fixtures`). A helper
  doing both migrates its fake GitHub files here and its Git origin there.
- Scope limits: this story adds no new MakeMe concept beyond what the
  description already states, except what a migrated case needs to state its
  driving facts. It changes no dashboard product behavior and no fake GitHub
  answer shape. Git reuse belongs to
  [faster Git fixture construction](#reuse-immutable-git-histories).

#### Key examples

1. **Empty published project.** A journey serves a project with no stated
   planning facts. The fake GitHub serves the description's default revision:
   an empty valid backlog. The board shows no stories, as before, and
   `emptyBacklog` is gone.
2. **Refresh across revisions.** The refresh journey declares revision A with
   one Taken and two queued stories, and revision B moving one queued story to
   Taken. Moving trunk from A to B shows the same titles and order as today.
   Seeds unchanged at B are served from A's files.
3. **Profiles and done records.** A Taken agent profile journey declares its
   profile, and a recently done journey declares its done records. The served
   profile, records and catalog equal what `renderAgentProfile`,
   `renderDoneRecord` and the catalog encoder write, and the cards read as
   today.
4. **Exact bytes kept.** The read-failure spec still serves its malformed
   backlog tail literally at the call site, and its verdict is unchanged.
   A long-title layout case declares the long titles, direction and
   identities as facts instead of a template.
5. **Superseded templates removed.** No dashboard helper or spec that serves
   the fake GitHub writes `# Product backlog` text, except a call site whose
   spec proves those bytes.

#### Evaluation

Migrated specs keep their verdicts and assertions. A reviewer can name each
journey's served planning facts from its call site or fixture file. Record
focused run times before and after under comparable load for one refresh or
navigation family and one recently done or profile family. They must not
regress beyond run-to-run noise.

#### Architecture

- **One description, two outputs.** The same description materializes as a
  Git origin or renders as served files. Both use one file renderer, so a
  journey and a Git spec stating the same facts publish the same bytes
  ([test data architecture](../../tests/README.md#test-data-architecture)).
- **Rendering stays in memory.** Served files need no Git or disk, so the
  done catalog uses the pure catalog encoder rather than a directory rebuild.
- **No native evidence change.** Fake GitHub helpers are not inputs to native
  evidence, so no paid run is needed
  ([native family layers](../../tests/native-family-layers.md)).

<a id="reuse-immutable-git-histories"></a>

### Speed up Git fixture construction behind the builder

**Identity:** SEED-262#reuse-immutable-git-histories
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/535-reuse-story-columns-git-history/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"31827b90916904e7b13e06db6bcbc4f29d09ea9d2390dfc43ee52ae88ea10031","plan":"13209d29934e2ea3ae1e31e2e70711019fcc915381442e0cd0646c8699f791c3"}}
```

#### Goal

Developers running dashboard checks get a result sooner when workers can
reuse equivalent Git history from the same MakeMe setup. The attention journey
and the other consumers of its story-columns history are the first place to
prove the gain. Keep the real Git and dashboard observations each case uses.
[Original profile and migration baseline](../TEST-OPTIMIZATION-CANDIDATES.md#card-attention-launch-and-origin-setup)

#### Scope

- Reuse the common queued, preparing, and taken history of the
  [story-columns fixture](../../dashboard/tests/launchJourney.ts) within one
  dashboard run. Its completion revision can differ by worker. Preserve the
  exact declared bytes, branch and checkout identities, authorship, ancestry,
  and named revision results. Keep reuse and the private copy inside the
  [shared materializer](../../tests/support/repository-fixture.mjs), with each
  returned fixture owning its mutable origin, refs, config, index, and working
  state. The ordinary per-process path covers requests without a suitable
  shared prefix.
- Compare the same attention and second-consumer selections before and after.
  Record cold build, warm reuse, and two-worker elapsed time alongside the
  executed cases and verdicts. Lower construction time must translate to
  faster test feedback on the affected selection. Both workers can still
  wait for one cold build, so count the wait and the copies in that comparison.
- Defer reuse across runs and additional families until these measurements
  justify their cost. The installed StartOrigin fixture already shares its
  default and queued origins through the run owner. Use its existing
  measurements and the readiness family's as comparison context.

#### Key examples

1. Two workers request the same first three revisions and different
   completion timestamps. Each builds its fixture through MakeMe. The common
   history is built once, and each origin answers its own completion record
   with the right ancestry, refs, and file contents.
2. Two requests materialize from the same prefix. One advances its branch,
   changes its local config and index, or is removed. The peer and a later
   request still read their own pristine state. Removing the shared source
   after materialization leaves both returned copies usable.
3. A request has different declared facts or runs without the dashboard
   owner. The materializer builds the requested history through its existing
   local route. If registered preparation fails mid-build, its callers get
   the setup failure, and a fresh run can build the history again.

#### Architecture

The dashboard run owns the lifetime of a completed snapshot through its
[artifact owner](../../dashboard/tests/support/runArtifacts.ts). The
materializer owns deciding whether the prefix matches and copying it before
applying a caller's suffix. This borrows the immutable-base idea from
container image layers. The Git copy has to remain usable after the shared
base disappears, so Git alternates and writable hardlinks are unsuitable.
Direct MakeMe domain facts and deterministic isolated proof follow
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
The timing comparison and cost of the shared machinery follow
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
