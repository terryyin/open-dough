# Tests

Prepare the [native prerequisites](native-setup.md) once, and again when the
lockfile changes. Repeated checks reuse them without installation.

The separate [dashboard suite](../dashboard/tests/README.md) runs integrated
browser tests in the ten [feature folders](../dashboard/tests/feature-groups.md)
under `dashboard/tests/`, frontend-only tests in
`dashboard/frontend-tests/`, and backend tests in `dashboard/backend-tests/`
together through `npm run test:dashboard`; `npm test` does not discover those
Playwright specs.

Run every check through the runner. `npm test` (or `bash scripts/test.sh`)
runs the whole suite; naming paths runs exactly those shell checks (`.sh`) or
`node --test` files (`.mjs`, `.js`):

```sh
npm test -- tests/payload-declaration-links.sh \
  tests/support/dashboard-dev-port.test.mjs
bash scripts/test.sh tests/payload-declaration-links.sh
```

A relative path is resolved from the directory `scripts/test.sh` starts in;
`npm test` starts it at the repository root. A path that is not a file, or not
one of those kinds, fails the run naming it before any check starts.

[Local resource use](local-test-resources.md) covers concurrency, cleanup and
machine sleep on macOS.

## Test data architecture

MakeMe owns domain data that tests arrange across all five test entries. Use
one test-only JavaScript ESM entry point at `tests/support/makeMe.mjs`, exporting
`makeMe`. Playwright TypeScript specs and `node:test` JavaScript tests import it
directly. A shell check that arranges domain data invokes a small Node
helper that calls MakeMe and writes it in the product's existing format.

Use the Donut-style syntax `makeMe.aThing.please()`. Each `aThing` or `anThing`
access starts a fresh builder. Named methods express the facts that distinguish
the case, and `.please()` returns the finished product value. Use deterministic
defaults for incidental facts. Pass times and identities explicitly when they
drive the case. Compose builders to keep related values consistent and give
each test its own mutable data.

Type builders against the production type, schema, or encoder input with
`@ts-check` and JSDoc imports. Include the builder sources in the dashboard
type-check. Organize builders by domain concept behind the one entry point.
Return the canonical shape directly to every caller. Preserve actual storage
and response distinctions, such as a persisted `LaunchRecord` and a live
`LaunchWithState`. Use existing production encoding at file and transport
boundaries. Keep servers, Git, installation, clocks, and teardown in the test
harness.
[ADR 0002, Direct domain mapping](../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
· [ADR 0008, Durable project state and local operational state](../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)

For example, dashboard and skill tests can build the same preparation profile
facts and hand them directly to `renderAgentProfile` when writing a published
profile. [Dashboard setup](../dashboard/tests/publishedFactsIsolation.ts) ·
[Skill setup](../src/skills/dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs)

```js
const profile = makeMe.anAgentProfile
  .preparing({ name: "Kirara", identity: storyIdentity, host: "claude" })
  .please();
const profileText = renderAgentProfile(profile);
```

Use MakeMe for valid domain setup even when the expected outcome is a refusal,
such as a request for another story. Keep the exact bytes, legacy shape, or
deliberate invalidity that a test depends on visible at the call site. Build
any surrounding valid state with MakeMe. Keep captured evidence, test actions,
and independently written expectations separate from builders.
[ADR 0005, Cross-tool validation](../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci)

Move existing domain constructors into the shared library or have fixtures
delegate their domain construction to it. Reject hand-built domain setup,
suite-specific models or builders, and defaults that hide facts the test
depends on when reviewing test changes. Preserve each test's proof boundary
and assertions during conversion.

For a real Git starting state, describe the published facts with
`makeMe.aRepository.withRevision(name, facts).please()`. Each revision can
declare membership, files, story state, profiles, done records, and commit
identities. Materialize that description with `materializeRepository` to
get a bare origin, a checkout, named commit IDs, and cleanup, or with
`materializeLocalCheckout(t, description)` to get one checkout with no origin,
removed after test `t`, for a case that reads no remote (`gitTemplates: false`
initializes it without Git's templates; `layer` adds harness files, such as
runner tooling read with `copiedLayer`, to its first commit; `at` builds it
in place at that directory without the shared template, as the shell checks'
release sources do). Identical
descriptions reuse one template within a process, so they give identical
commit IDs; each caller gets its own mutable copy. A run owner can prepare a
snapshot of a shared leading history once (`prepareRepositorySnapshot`) and
register it in its workers (`registerPreparedPrefix`); a description that
starts with that history is copied from the snapshot and commits only its
remaining revisions, with the same results as a full build. Keep commands and Git
transitions under proof in the case that observes their result.
[Builder](support/repositoryTestData.mjs) ·
[Repository harness](support/repository-fixture.mjs)
`commitDeclaredRevision` adds a later revision to an existing checkout with
the same author, committer and message defaults.
[Revision commit](support/repository-revision-commit.mjs)

A revision can also carry one `release`, built with
`makeMe.aRelease.with({ version, taggedAt, marker }).please()` and, where
its payload differs, the managed path prefixes it `withheld` from its
installer declaration, the payload paths it `removed`, and the payload it
`added`. The materializer writes the working tree's installer and payload as
a harness layer, then the release's `VERSION`, changelog entry, marker and
deltas, and tags the commit `v<version>` dated `taggedAt`. A `VERSION` that
disagrees with its tag, or an extra tag name, is stated literally through
`files` and `tags`. A shell install or update check states its release source
as JSON at its call site, read on stdin by
`tests/support/release-source.mjs <dest>`, or names a shared description in
`tests/support/release-sources.mjs`, such as `latest`; the helper builds it in
place with `materializeLocalCheckout`'s `at`. `release-source.mjs --add
<source>` commits and tags a release that appears after the check has read
the source.
[Release](support/releaseTestData.mjs) · [Helper](support/release-source.mjs)

Build a kept launch with `makeMe.aLaunchRecord`: the requested story or
instruction, the host session (the request takes the session's host), the
workspace its start established, and when it was launched. Dashboard tests keep
such records in the machine launch store only through
`dashboard/tests/support/launchStore.ts`, which writes the store's own
`{ [project]: records }` document under the machine home without retention;
the file and its location stay harness facts. Read the parsed document through
`keptLaunchStore` or one project's records through `keptLaunchRecords`, which
includes unresolved creations. Use `launchStoreFile` when checking exact bytes
or waiting for the file. Write exact store text under proof through
`keepLaunchStoreText`.
[Builder](support/launchTestData.mjs) ·
[Launch store harness](../dashboard/tests/support/launchStore.ts)

Build the host session a terminal or runner consumes on its own with
`makeMe.aHostSession.claude`, `.codex` or `.cursor`; a kept launch's
`inClaudeSession`, `inCodexSession` and `inCursorSession` use the same
construction. State the conversation's identity and where it continues: a
Codex thread's saved workspace and app-server endpoint, with its notice when
the case needs it, or a Cursor chat's UUID and workspace, with its saved
configuration scope when the case needs it. Resume arguments default to the
host's current resume command for that conversation, so each session resumes
its own identity. A Codex session without a continuation is a predecessor
record. [Host session builder](support/hostSessionTestData.mjs)

A kept launch states what happened after it started through
`.completedWith`, `.withReportRead`, `.landedAt` and `.markedDoneAt`: its
final report, the developer reading it, the comparison its landing recorded,
and the developer's Done mark. These stay separate facts. Build a final report
on its own with `makeMe.aCompletionReport`, and the body an agent submits with
`makeMe.aCompletionSubmission`. A submission is answered by a delivery receipt
and is not the stored report. State a receipt or receipt time when the case
reads more than one report or controls the clock.
[Outcome builders](support/launchOutcomeTestData.mjs)

A landing shares one comparison across its shapes: the launch's reporting
reference, the remote and target, and the base and revision. Build the
dashboard-prepared context with `makeMe.aLandingContext`, the submission with
`makeMe.aLandingSubmission`, the receiver's answer with
`makeMe.aLandingReceipt`, and the stored evidence with `makeMe.aLaunchLanding`
captured from `makeMe.aLandingAuthority`. A submission and a stored landing
always state `.comparing({ base, revision })` at the call site. Keep real Git,
publication and the capture path in the journeys that observe them.
[Landing builders](support/launchLandingTestData.mjs) ·
[Stored landing](support/launchLandingEvidenceTestData.mjs)

When a case needs another agent's claim only as a starting fact, declare it
with `takeRevision`: the agent authors it and the developer commits it under
`Take queued work: <identity>`, so claim readers find it as they find a real
start's claim. Run the real start only where the start, its refusal or its
resume is under proof. A real start commits uncommitted planning edits into
its claim, so declare such facts in the description instead. Record a
story's readiness review after its dependency agreements, which belong to
its readiness basis. [Queued repository](support/queued-repository.mjs)

A description can also name its trunk branch (`withTrunkBranch`, default
`main`), the integration checkout's committer (`withCheckoutIdentity`), and
one execution workspace: `withWorkspace(branch, { from, checkoutIdentity })`
with ordered `withUnpublishedRevision` commits. The materializer adds that
workspace as an `execution` worktree with its own committer and commits its
revisions without pushing; `candidateSha` names its tip. A revision's
`executables` lists files to commit with the executable mode. The first
revision gets an empty backlog unless it states one, as `backlog` or as bytes
at `.planning/PRODUCT-BACKLOG.md`; `backlog: null` states a trunk without
one. The builder refuses a backlog stated both ways and other descriptions it
cannot materialize, before any Git runs; its comments hold each method's
defaults. [Refusal test](support/repository-description.test.mjs)

A dashboard journey that serves a project through the fake GitHub states the
same description and serves its named revisions without Git.
`describedRevisions(description, shaPerName)` returns one published revision
per name, holding the earlier revisions' files with its own changes and
removals applied. One file renderer writes both these files and the
materialized checkout, so the same facts publish the same bytes, including
the done catalog rebuilt from the records. `describedRevision`,
`describedBacklog` and `describedFiles` serve one revision. Revision SHAs,
commit dates, path histories, unanswered paths and held or failing reads stay
harness inputs. [Served revisions](../dashboard/tests/describedRevisions.ts) ·
[Renderer](support/repository-revision-files.mjs)

Other branches, merges, competing writers, stashes, dirty files, submodules
and removed worktrees stay Git operations in the case. Installed skills, CI
adapters, mailboxes, ignored local configuration and generated install output
are harness layers added to the materialized checkout, not description facts.
A case that proves behavior without a remote removes it with Git. The Git
publication native fixtures for startup, admission, one-shot and owned-context
journeys materialize their starting trunk from such a description, and their
evidence identities hash the builders and materializer they reach. Dashboard
origins, release-source fixtures and the MakeMe-free native
worktree-preparation fixtures keep their own repository helpers.

## Check environment

The runner gives every check, in the whole suite or a chosen run alike, the
environment in `scripts/test-environment.bash`, before any check starts:

- **Bash 5 or newer, first on `PATH`.** macOS's Bash 3.2 can silently ignore
  failing `[[ ... ]]` assertions under `set -e`, and the runner times checks
  with Bash 5's `EPOCHREALTIME`. Checks launch `bash` through `PATH`, so the
  runner refuses an older `bash` there even when a newer one started it; put a
  current Bash's bin directory first, for example
  `PATH="/path/to/current-bash/bin:$PATH" npm test`. This is a contributor
  requirement; the product installer still supports Bash 3.2.
- **CI's uncolored output.** `FORCE_COLOR` and `NO_COLOR` are unset, so a
  check that compares tool output, such as Node's assertion diffs, sees the
  same bytes as in CI.
- **CI's Git state.** No global, system, or inherited configuration,
  identity or repository-location variables such as an alternate object
  store; automatic maintenance off, so no detached repack
  rewrites `.git/objects` while a check snapshots or removes a fixture (a push
  over Git's local transport drops these settings, so a fixture that copies a
  pushed-to bare remote turns maintenance off in that remote's own config); no
  identity or default branch, so a commit fails unless the check sets one (a
  shell fixture gets it from `tests/helpers/release-fixture.bash`'s
  `configure_fixture_git`).
- **No GitHub request owner.** `DOUGH_GITHUB_REQUEST_OWNER_ROOT` names a
  root of the job's own that admits no owner, so a check whose processes ask
  GitHub (`src/skills/dough-execute-plan/scripts/github-requests.mjs`) without
  naming a private root is answered by none, this machine's real one included,
  and fails with `Asked GitHub without a request owner root of its own.` Such
  a shell check gives those processes its own root and ends the owner there
  with `tests/helpers/private-request-owner.bash`, a node test with
  `github-request-owner-test-fixtures.mjs` beside that script
  (`tests/test-runner-github-requests.sh` proves both).
- **Chosen checks follow the same rules**, silence included, but are not held
  to the time budget (`tests/test-runner-selection.sh` proves a chosen run).

Running a check directly (`bash tests/<name>.sh`, `node --test <file>`) is
unsupported, except for a check's own options, which the runner never passes:
invoke the native ADR-awareness wrappers (manually triggered paid runs and
inventories, described with their proof scripts in
`tests/native-adr-awareness-wrappers.md`) or the
[native publication checks](native-publication.md) directly, with Bash 5 first on
`PATH`, outside the runner's Git state. CI's Bash can be older than a local
one and behave differently inside traps (before Bash 5.3 a bare `return` in a
function called from a trap takes the interrupted command's status).

### Reproducing CI's platform

Use the [container diagnostic helper](ci-container.md) when a check fails only
on CI or needs CI's Bash and Git. Ordinary checks stay native.

### Repeating CI on one revision

When a check passes and fails on CI without a code change, run CI itself on
that revision repeatedly and count what failed:

```sh
bash scripts/ci-repeat.sh 20            # the current branch, 20 times
bash scripts/ci-repeat.sh 5 some-branch # another pushed ref
```

It dispatches `ci.yml` unchanged on the ref's revision through `gh`, at most
two at a time, and counts only its own runs, naming each failing dashboard spec
location and other failed job with its failed-repetition count; it exits 0 only
when every repetition passed. Each also runs `lint` and `test`, so run it on
demand only. Its header lists its settings; `tests/ci-repeat.sh` proves it.

A dashboard failure on unchanged code, on CI or locally, is likewise a defect
to find and fix, not a reason to rerun until green. To repeat the dashboard
suite on this machine, idle, under load, or from a fresh worktree, use
`scripts/dashboard-repeat.sh`; the
[dashboard tests guide](../dashboard/tests/README.md) describes it and where a
failed run keeps its report and traces.

## Runner

The runner is the suite's one scheduler. Its jobs are each `tests/*.sh`
outside `tests/support/`, plus each `node --test` file matched by a glob in
`tests/node-test-files` (relative to the repository root), such as the suites
beside a skill's scripts under `src/skills/`. A new `*.test.mjs` under a
listed glob runs without further wiring. Each node file runs alone through
`tests/support/node-test-failures-reporter.mjs`: silent when every test passes
silently, it shows each failing test's name, location, error, and its file's
output, and a passing file's output under `output from passing <file>:`. No
job starts a worker pool of its own.
`OPEN_DOUGH_TEST_DIR` names another directory of checks, with its own optional
`node-test-files`, `longest-first`, and `time-budget`, to run instead of the
suite's own, which is how `tests/test-runner-failure-report.sh` runs
substitute checks. Chosen paths replace that discovery.

[Runner settings](runner-settings.md) cover the job count, the start order,
CI's shares, and the `OPEN_DOUGH_TEST_*` settings with what each writes.

The suite's time budget, `tests/time-budget`, and how a slice checks a change
against recent trunk CI timings are in [time-budget.md](time-budget.md).

A passing job must write nothing, so a passing suite prints nothing. For each
failing job the runner prints `FAIL: <job>` and that job's captured output. A
shell check that stopped on a failing command under `set -e` has, in that
output, `stopped at <file>:<line>: <command>`, naming the check or the support
file it sourced; a failure inside `$(...)` is named by the substitution's line
(`stopped at tests/x.sh:12: attempt=$(awk ...)`), and one inside a `( ... )`
subshell both at that command and at the subshell's line. The runner loads
`tests/support/check-stop-report.bash` into each shell check through
`BASH_ENV`, so no check carries a trap of its own. A failure the check handles
(under `set +e`, in an `if`, after `||`), a check's own `exit 1`, and scripts a
check launches get no such line. A job that exits 0 but wrote to stdout or
stderr fails as `FAIL: <job> (passed but printed output)`, and one whose shell
ends without recording an exit status (for example, killed) as
`FAIL: <job> (ended without recording an exit status)`, each with its output;
the run still finishes. Silence output at its source (`grep -q`, a quiet flag)
rather than filtering it.

Each job runs in a process group of its own, so a terminal's Ctrl-C reaches
the runner rather than the jobs. On INT or TERM the runner stops each running
job's process group and prints, for it and for any job the same signal ended,
`INTERRUPTED: <job> (after <seconds>s)` and the last lines of its output; it
then exits 130 for INT or 143 for TERM (`tests/test-runner-interrupt.sh`).
Workers a check detaches from its process group are that check's own
teardown. `npm test` execs the runner (`package.json`) and CI's test step
execs `npm`, so a signal sent only to the step's top process, as a cancelled
Actions run does, still reaches the runner (see that step's comment in
`.github/workflows/ci.yml`).

## Waits, fixtures, and teardown

Tests wait for an observable event, never for elapsed wall time. Shell checks
use `wait_for` or `poll_until` from `tests/helpers/wait-for.bash`; a missed
event fails naming what it awaited. A wait for a signal from a started process
lasts while that process lives and fails, naming its exit, if it ends first
(`src/skills/dough-execute-plan/scripts/process-lifetime-test-fixtures.mjs`).
File timestamps that must differ are set explicitly, and the dashboard's timed
journeys step a paused page clock. A dashboard journey waits in
the page for the answer a check depends on before the check's own bound
starts: it opens with `openUntilRead` or `reloadUntilRead`, or checks through
`expectMembership` or `expectSettledPage`, and marks done with `markDone`
([dashboard tests guide](../dashboard/tests/README.md)).

A test stops or releases what it started before removing the fixture those
things run from. `node:test` runs `t.after` hooks in registration order, so a
fixture builds its cleanup with `fixtureTeardown(...roots)`
(`src/skills/dough-execute-plan/scripts/fixture-teardown-test-fixtures.mjs`):
register its `cleanup` with `t.after` when the fixture is created, and pass
each stop or release step to its `defer` as soon as the process starts, before
any further setup or assertion. The steps run in reverse order, every root is
removed, and then a failing step fails the test; no stop swallows its failure.
A shared fixture that starts something owns this teardown and hands it to
its callers. The steps are:

- `deferWorkerStop` requests an in-process mailbox worker's stop, awaiting it;
- `deferChildExit` signals a test's own child process and awaits its exit;
- `deferObserverStop` (`watch-ci-test-fixtures.mjs`) runs a CI observer's real
  `stop`, skipped when its worker is already dead, and asserts that the
  recorded worker exited;
- `endProcess` (`process-lifetime-test-fixtures.mjs`) ends a recorded process
  that is not the test's child, only while its command still matches.

An inline stop a test asserts on stays inline; the deferred step then finds
it already ended. A leak usually appears only when the worker is blocked (for
example in `gh`) or its stop fails, so failing-path checks create that
condition. Observer stream processes retitle themselves `dough-ci:<hash>`, so
a process sweep for leftovers matches that title as well as `ci-mailbox.mjs`.

A dashboard journey hands its scratch repositories to the `afterGitHubStops`
fixture (`dashboard/tests/dashboardTest.ts`), which removes them only after
the page, its dashboard server, and the fake GitHub have stopped, so a read
still in flight when the journey ends never finds its repository gone.

`dashboard/tests` and `dashboard/server` import shared JavaScript fixtures
from `src/skills/*/scripts/` and `tests/support/`, and TypeScript infers their
signatures, so a fixture's own Node tests can pass while a dashboard consumer
no longer type-checks. `npm run typecheck:dashboard` is the focused check for
such a change, and the pre-commit hook runs it on every commit that stages a
JavaScript or TypeScript file
([commit gate](../docs/installation-platforms-and-update-safety.md)).

Fixture snapshots prune `.git` rather than walking it. A payload-update check
states its older and newer tagged releases at its call site, with the older
release's `withheld` declarations and `removed` sources, instead of editing a
copied installer by hand, and checks the older release out with
`checkout_tagged_release` from `tests/helpers/release-fixture.bash`.

## Native host streams

Native checks read a Claude Code, Codex, or Cursor output stream only through
one reader, and a replay check holds that reader to retained real streams:
[native host streams](native-host-streams.md).

## Shared installation and update protections

Every declared payload file is protected by the same installer and updater
walk, so each shared protection has one owning check, and a payload-update
check proves only what its own payload adds:

| Protection | Owning check |
| --- | --- |
| Ordinary update refuses an edited or missing managed file without writes | `tests/update-refuses-unverifiable.sh` |
| Repeat install refuses an edited or removed managed file without writes | `tests/install.sh` |
| `--force` restores an edited or incomplete installation | `tests/update-force-restores-latest.sh` |
| Ordinary update refuses an unrelated file at a newly managed path | `tests/story-payload-update.sh` |
| Linked supporting files are declared | `tests/payload-declaration-links.sh` |

`tests/payload-declaration-links.sh` reads `install.sh`'s `managed_files`
without running the installer and fails naming each relative link, in a
declared Markdown file, to an undeclared file. A new payload file needs a
declaration, not another copy of these proofs.

## Installation and update coverage gaps

The installer and updater checks prove each promise once at its boundary: the
codex and cursor hints share the `.agents` entry root, so one represents both,
and each shared protection above is proved once by its owning check, also in
the sibling `.claude` root. No check yet observes these promises:

- refusing a requested version (`--version`, `--tag`, or `v1.2.3`) instead of
  installing the latest numeric release;
- `apply` with an unsupported platform (only `install.sh` is checked);
- updating a Claude-only installation from the Claude entry, which must create
  the shared `.agents` root;
- installing without Node (the `cp`/`cmp` fallback and the hook-registration
  refusal).
