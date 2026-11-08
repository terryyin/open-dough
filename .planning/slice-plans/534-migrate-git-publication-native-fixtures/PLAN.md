# Build Git publication native fixtures from explicit MakeMe data

**Source:** [Build Git publication native fixture repositories from explicit MakeMe data](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-git-publication-native-fixtures)
**Source review:** [source review](source-review.md)

**Identity:** SEED-262#migrate-git-publication-native-fixtures

## Goal and scope

Make the starting Git repository facts legible in startup, admission,
one-shot and owned-context checks and give maintainers a complete input
identity for retained evidence from those fixtures. Preserve the check
verdicts, meaningful Git histories and real transitions. This plan covers
those fixtures and their identities. Dashboard origins, release-source
construction and the MakeMe-free native worktree-preparation path have their
own boundaries. The credential-free proof and manual native evidence have
separate verdicts.

## Current decisions

- Reuse [the queued repository facts](../../../tests/support/queued-repository.mjs),
  [startup command files](../../../tests/support/startup-command-files.mjs),
  [one-shot sibling facts](../../../src/skills/dough-execute-plan/scripts/one-shot-queued-repository.mjs)
  and [the materializer](../../../tests/support/repository-fixture.mjs).
  Name the distinguishing facts at their native call sites. Git, installation,
  tool instrumentation and cleanup stay in the harness under the
  [test data architecture](../../../tests/README.md#test-data-architecture).
- Extend the [existing identity writer](../../../tests/support/git-publication-native-evidence.sh)
  with fixture roots and their actual dependency closure. Same-checkout
  fixture entries can import their helpers relatively. Pass shell-launched
  Node modules and non-imported data as explicit roots or hash inputs. Scope
  fixture-specific roots to the journeys that consume them. Reuse the existing
  `input-hash` record shape and preserve other profiles' inputs.
- The installer uses working-tree bytes. Cover its entry, fresh-install
  implementation, `VERSION`, `CHANGELOG.md` and payload inputs for the four
  migrated families. Reuse `read_managed_files_declaration` in
  [the release version helper](../../../src/install/open-dough-release-version.sh)
  for payload paths, including hook fragments. The recorded source revision
  alone cannot identify dirty input bytes. Bound the root list to this install
  path and keep the installed source choice the same.
- Compare the pre- and post-migration fixtures using real Git, as
  [completed plan 532](../../done/SEED-262_tighten-repository-description-facts.json)
  did. Recover its comparison from revision `03e354b81`. Compare the refs and
  ancestry, trees and modes, messages and authors, applicable configuration,
  worktree layout and dirty or staged state the journey observes. Account for
  temporary paths and times and explain intentional marker-script byte
  differences by running the scripts. Keep this comparison as proof, with no
  new snapshot identity or fixture cache.
- A shared MakeMe edit can make a record stale even when an individual
  fixture's behavior matches. Keep historical hashes, distinguish justified
  reuse from fresh results per affected requirement and host, and leave
  missing native proof pending under
  [ADR 0005, Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md).
  The timing comparison follows
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Local gates

Follow [test automation](../../../AGENTS.md#test-automation) and the
[failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. On fully awake macOS with AC power, use `caffeinate -s -i` for
long runs. On battery, plug in or start fully awake with the lid open under
`caffeinate -i` and read the sleep log after the run.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Run focused checks through `bash scripts/test.sh` with Bash 5 first on `PATH`.
Run `npm run lint` before committing. If a slice changes the shared builder
or materializer contract, trace the distributed consumers and run their
affected checks, including the dashboard type-check when its typed builder
inputs change. The planned approach reuses the contract directly.

The baseline command below uses two job slots to limit local contention.
Repeat the same selection after the migration with the same job count and
comparable host load. Retain job times, executed cases, command outcomes and
the changed setup or identity work. Attribute timing differences to the
conditions observed. If trunk changes these paths before Take, capture a
matching before run before replacing the fixtures.

```sh
OPEN_DOUGH_TEST_JOBS=2 PATH=/opt/homebrew/bin:$PATH caffeinate -s -i \
  env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR \
  /usr/bin/time -p bash scripts/test.sh \
  tests/git-publication-native.sh tests/git-publication-native-admission.sh \
  tests/git-publication-native-one-shot-results.sh \
  tests/git-publication-native-one-shot-workspaces.sh \
  tests/git-publication-native-owned-context.sh tests/native-evidence-identity.sh
```

Before run at Take `23d29ac79` (trunk had changed `queued-repository.mjs` and
`repository-fixture.mjs` since the preparation observation): exit 0, six
passed, 148.49 s real on AC, load averages 16.77 at start and 12.83 at end.
Job seconds were 72.9 one-shot results, 60.8 admission, 55.8 publication,
43.6 one-shot workspaces, 31.9 owned-context and 29.4 identity. Slice 1 moved
the family identity checks into `tests/git-publication-fixture-identity.sh`;
the after run adds that check and attributes its time to identity work.

## Slices

### 1. Native records identify the inputs that build their fixtures

Type: Behavior

Status: done

Behavior: A startup, admission, one-shot or owned-context attempt records
identity → the writer hashes the fixture's actual inputs, including transitive
Git and data helpers, the installer inputs and generated sample files. Resolve
the dynamic imports from the fixture's actual source checkout. Keep generated
notes source as explicitly hashed data so its embedded imports are never
walked as harness modules. Propagate an input-read or closure failure through
retention even when a caller captures the journey's exit status with `errexit`
disabled. Preserve available diagnostic artifacts on that path.

Proof: extend `tests/native-evidence-identity.sh` to cover startup and one-shot
alongside admission and owned-context. Exercise the actual writer. Change a
transitive fixture or writer helper, a generated source input, an installer
helper and a declared payload input in scratch, and observe the matching
changed hash. Remove a required input and observe a failed identity rather
than a successful partial record. Assert closure exit status directly. The
retained hashes in replay fixtures stay historical. Run that identity check
and the one-shot escalation fixture check.

Accepted: family identities live in
`tests/support/git-publication-native-fixture-identity.sh`; their checks moved
to `tests/git-publication-fixture-identity.sh`, while
`tests/native-evidence-identity.sh` keeps the all-writer checks with startup
and one-shot added. Retention failure fails the journey even with `errexit`
off. The closure tool blanks template-literal text, so generated notes stay
data; every previously successful closure is byte-identical. Input rows:
publication 22, startup 377, admission 384, one-shot 410, owned-context 390.
Six native checks with the escalation test, the four routing, scheduling,
replay and backlog consumers, and the refactored identity checks passed.
Learning: every family record now hashes the installed payload, so any payload,
`VERSION` or `CHANGELOG.md` edit makes those records stale for reuse judgment.
Later slices update their family's roots in
`git_publication_fixture_family_identity`.

CI repair (run 42488867557/1, `e33993231`): `tests/native-evidence-identity.sh`
took 67.8 s against the 64 s job ceiling. Seven one-input supervision captures
and one `awk` per hash line grew with the larger family identities. One
capture now changes every supervision and listed `src/` input together; each
identity must carry every supervision input's own content hash, and each
changed input's line must change. Local time fell from 41.7 s to about 13 s
(base 24.3 s); break checks still fail on a dropped supervision input, a
fixed hash, an omitted closure module and an unchanged payload line. Refactor
disposition: already traced within slice 1's refactor return for this file.

### 2. Startup cases name their queued and Ready trunk

Type: Behavior

Status: done

Behavior: A startup case names Ready queued A/B and the durable command
files → the shared materializer supplies the trunk and the existing Git setup
adds only the state that distinguishes the case. Keep the pending human
edits, rival claim, unpublished interrupted claim and later remote advance
where the corresponding case exercises them.

Proof: `tests/git-publication-native.sh` plus a credential-free comparison
through `git_publication_fixture_create_startup` for `startup-trunk`,
`startup-story-branch`, `startup-selected-source`, `startup-claim-race` and
`startup-resume`. Observe the worktree marker scripts writing to the fixture
root and their markers surviving workspace removal. Verify branch, local
edits and remote claim or later commit in the matching cases. Confirm the
startup evidence writer names the new entry point and the materializer.

Accepted: `tests/support/git-publication-native-startup-fixture.mjs` names
Ready queued A and B with the durable setup and command files and materializes
them; the shell fixture adds only each case's state. Comparing the old and new
builds of all five cases with real Git, the only differences were
`scripts/setup.js` and `scripts/command.js`. They now locate the root markers
relative to `__dirname`, and running both from a sibling worktree left the
markers in the fixture root after the worktree was removed. Build times matched
within noise, and the startup identity rose from 378 to 383 rows. The startup
native check and both identity checks passed, and the refactor pass found
nothing to change. Learning: admission and owned-context need the same durable
Ready A/B trunk. A shared builder may hold the description, provided each call
site still names its stories and readiness.

### 3. Admission cases name their starting repository and probe

Type: Behavior

Status: done

Behavior: An admission case names the queued trunk, investigation probe and
starting tracked facts → the repository comes from MakeMe. Real admissions,
the recorded preparation they consume, and the local correction draft keep
their existing published or local boundaries. The command that writes the
probe marker still leaves it at the fixture root.

Proof: `tests/git-publication-native-admission.sh` plus the Git comparison for
the investigation and a continued or closed mission with prior ownership.
Compare the relevant pre-session state for the local correction draft as
well. Verify the admission identity reaches the materializer and whichever
admission helpers remain in use. Record the historical evidence comparison
without rewriting its record.

Accepted: each admission journey's starting trunk is a named MakeMe
description, materialized through `materializeRepository`. Every journey
starts from Ready A and B plus the startup probe, built with the shared
`queuedReadyStartupRepository` in `tests/support/startup-command-files.mjs`.
Closure adds a documented README and correction adds the completed seed R.
Real admissions, the published preparation and the local correction draft
are unchanged. The old and new builds of all four cases were compared with
real Git, including the correction draft's local state. They differed only in
the setup, command and probe scripts, which now locate their root markers
relative to `__dirname`; running them from a worktree left every marker at
the fixture root. The admission identity rose from 385 to 389 rows and
reaches the materializer and every remaining admission helper. Compared with
the three retained 2026-11-08 `publication/admission-investigation` records,
no recorded input is missing, 264 inputs are new and 10 shared inputs have
different hashes. Those records are therefore stale for reuse, and fresh
native outcomes stay manual. The admission, startup and identity checks, the
workspace-publication, repository-fixture and repository-description tests,
and the dashboard type-check passed. Local admission time stayed at its base
(54–60 s against a 57–58 s base); CI recorded 25.7 s.

### 4. One-shot cases name their selected and sibling stories

Type: Behavior

Status: done

Behavior: A one-shot fixture chooses its ordinary, queued, refinement or
escalation facts → the materialized trunk exposes that choice, including B's
Ready state and B2's unrefined section when selected. The real setup for
default-main edits, a competing Take, established start, installed skills
and workspace retirement remains observable through the current wrapper.

Proof: `tests/git-publication-native-one-shot-results.sh`,
`tests/git-publication-native-one-shot-workspaces.sh` and
`tests/support/git-publication-native-one-shot-escalation-fixture.test.mjs`.
Compare B/B2 order and readiness, the default-main local state and the
escalation project's actual command. Verify the one-shot identity's new
fixture closure. Remove `createSiblingTrunk` and now-unused setup only after
checking its consumers.

Accepted: each one-shot journey's trunk is a named MakeMe description,
materialized through `materializeRepository`. It starts from Ready A and B,
and queued journeys add sibling B2 through `queuedRepositoryWithSiblingB2`.
The call site names B as Ready and B2 without a story state, and it gives
B2's outcome only to refinement journeys. `createSiblingTrunk`,
`recordStoryBReady` and `siblingSection` are removed, and the escalation
product is a files map.

The old and new builds of all ten journeys were compared with real Git
through the current wrapper. They differed only in the marker-path script
bytes and in the installed `dough-update/SOURCE`, which records the source
checkout path. B/B2 order and readiness, the default-main local commit and
its staged, unstaged and untracked edits, the rival Take, the established
block and the escalation command's effect all matched.

The one-shot fixture closure fell from 177 to 107 modules and its identity
from 411 to 401 rows. The refactor pass shared `readyStartupFiles` and derived
`identityB2` from `storyB2`. The one-shot checks, both identity checks, the
five one-shot unit tests, the escalation fixture test and the dashboard
type-check passed. Local times did not grow against a matched base run.

### 5. Owned-context cases name their trunk and retain real worktree ownership

Type: Behavior

Status: planned

Behavior: Owned startup selects Ready A/B or preparation landing selects
rough C → the fixture builds its starting trunk from explicit facts, installs
the selected host guidance and creates the retained worktree. A real writer
still advances the origin, and the local ready-looking A or C creation ref
stays in the intended workspace. Remove the remaining legacy native trunk
builders after tracing their callers. Remove `writeQueuedStories` only if the
dashboard no longer needs it.

Proof: `tests/git-publication-native-owned-context.sh` plus a comparison of
the two in-scope owned-context configurations. Observe the bare repository,
retained checkout, install commit, distinct local source or creation ref,
and the competing advance. Verify the owned-context identity changes with
the actual writer helpers. Run the final six-check comparison above and
`tests/native-stream-replay.sh` for retained assessor replay. Update the
native evidence fixture exception in `tests/README.md` to reflect the
migrated families.

## Decisive premises observed during preparation

All observations are from the assigned checkout at `78e8b3715` on 2026-11-08.

| Premise | Consuming operation and result |
| --- | --- |
| Existing identities have reachable input gaps. | `node tests/support/native-import-closure.mjs . <fixture-entry>` returns only the entry for `git-publication-native-admission-fixture.mjs` and `git-publication-native-owned-context-fixture.mjs`. The one-shot entry exits 1 at `tests/src/notes.mjs`, which its generated project imports. Sourcing `git-publication-native-run.sh` in Bash 5 and invoking `git_publication_write_evidence_identity` emitted 22, 128, 203 and 91 input rows for publication, admission, one-shot and owned-context respectively. Admission covered the old queued trunk. Startup, one-shot and owned-context omitted it, and these profiles omitted `install.sh`. The current identity check omits one-shot. |
| A normalized snapshot would need to transform committed bytes. | Two real `node tests/support/git-publication-native-admission-fixture.mjs "$PWD" admission-investigation <scratch-parent>` builds in different parent paths produced different trees in `git log --format='%T %s' --reverse` for both the base and probe commits. The setup, command and probe scripts write absolute scratch paths. This affects the identity choice even when checkout configuration and timestamps are excluded. |
| The shared startup facts preserve the durable command behavior. | A scratch `queuedReadyRepository({files: startupCommandFiles({contributing: readyContributing, durableCommandEvidence: true})}).please()` materialization matched the old startup trunk's tracked inventory and bytes except for the two marker path expressions. `node scripts/setup.js` and `node scripts/command.js` from a real sibling worktree wrote both root markers, which remained after worktree removal. The five startup cases built through `git_publication_fixture_create_startup` in 6.2 s. Selected-source retained its local edit, claim-race published the rival Take, and resume observed the later independent advance. |
| The substitute verdicts and evaluation route are available. | The six-check command under Local gates exited 0 with six passed jobs in 123.19 s on AC, at start load averages 3.96, 8.18 and 11.10. Per-job seconds were 45.2 publication, 54.9 admission, 53.3 one-shot results, 35.9 one-shot workspaces, 29.6 owned-context and 23.0 identity. The substitute journeys exercised the selected installer through the public wrapper. |
| Retained evidence can already differ from current input bytes. | Compared the recorded SHA-256 paths to this checkout for the 2026-11-08 `publication/admission-investigation` records under `tests/fixtures/native-streams` for Codex, Cursor and Claude. Each differed on five of 125 inputs, including `makeMe.mjs` and `repositoryTestData.mjs`. This is evidence for assessing reuse, with fresh host outcomes still manual. |

## Manual native commands

Use only under separate native-run authorization. The results directory
must be outside the fixture. Select the host and case that need evidence under
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md#4-run-and-assess-only-the-checks-needed).
The following commands show the live wrapper and both case namespaces.

```sh
results_dir=$(mktemp -d)
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native codex --case publication/startup-trunk --results-dir "$results_dir"
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native cursor --case publication/admission-investigation --results-dir "$results_dir"
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native claude --case publication/one-shot-queued --results-dir "$results_dir"
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native claude --case preparation/one-shot-refinement --results-dir "$results_dir"
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native codex --case publication/startup-owned-context --results-dir "$results_dir"
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native cursor --case publication/preparation-land --results-dir "$results_dir"
```

## Concern evidence

Refinement was unnecessary. Each slice owns one proof boundary. The identity
change precedes the data changes so each migration can use the same writer
and update its own roots in one increment. The fixture slices reuse the
same repository description and materializer. Native host execution remains
manual under the story's existing boundary. This review identified no
remaining slice-specific concern for the planned credential-free work.
