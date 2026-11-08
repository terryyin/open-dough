# Build release source repositories from explicit MakeMe data

**Identity:** SEED-262#migrate-shell-release-and-native-fixtures

**Source:** [Build release source repositories from explicit MakeMe data](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-shell-release-and-native-fixtures)
**Source review:** [source-review.md](source-review.md)

## Execution state

- Mode: Story Branch Mode; workspace
  `/Users/terryyin/git/open-dough/.worktrees/build-release-source-repositories-from-explicit`,
  branch `claude/build-release-source-repositories-from-explicit`, remote
  `origin`, target `main`; publisher `dashboard-territory.local-open-dough`.
- Published claim `766cfa66f` accepted on `origin/main`; starting revision
  `54cc27451`. Replanning: existing planning authority (no flag).

## Goal and boundaries

A maintainer reading a shell install or update check can see, at its call
site or in its fixture file, which releases its release source holds. These
are each release's version and tag date, its payload marker, and the managed
paths it withholds or removes. Shell check feedback must not get slower.

Preserved promises and constraints:

- Migrated checks keep their verdicts and assertions.
- The native ADR-awareness delivery-to-use journey
  (`tests/support/dough-adr-awareness-delivery-to-use.sh`) keeps calling
  `init_fixture_repo`, `write_candidate_payload`, `commit_all` and
  `tag_release`, unchanged. Its retained evidence identity must not change.
- No paid or native host run. Adding the release fact changes MakeMe
  modules that three native identities hash through their import closures
  (premise P4). That is recorded with its reuse reason, not refreshed.
- [Test automation rules](../../../AGENTS.md#test-automation) and the
  [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests),
  as written there.

Exclusions:

- Git-publication native fixtures:
  [built from MakeMe data](../../../tests/README.md#test-data-architecture).
- Installed state, host-hook settings, runner settings and native scenario
  content:
  [installation and native test data](../../seeds/SEED-261-share-domain-test-data.md#map-installation-and-native-test-data).
- Worktree-preparation native builders, which stay MakeMe-free under
  [plan 532](../532-tighten-repository-description-facts/PLAN.md).
- Install targets without domain facts, `checkout_tagged_release`, and Git
  changes a check makes after the source is built, such as moving
  `BRANCH_HEAD`.
- No branch or merge model in the description, and no caching beyond
  building in place
  ([faster Git fixture construction](../../seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories)).

## Current decisions

- **A release is a revision fact.** `makeMe.aRelease` builds
  `{ version, taggedAt, marker, withheld, removed }`. A repository revision
  may carry one `release`. The release writes `VERSION` and a one-entry
  `CHANGELOG.md` (`## <version> - 2026-09-06`, then the marker) and appends
  the marker comment to `src/skills/dough-update/SKILL.md`. These are the
  bytes `write_candidate_payload` writes today. The materializer creates the
  annotated tag `v<version>`, with `GIT_COMMITTER_DATE` set to `taggedAt` as
  `tag_release` does. A tag whose `VERSION` disagrees, or an extra
  lightweight tag name, is stated literally: an explicit `files.VERSION`
  overrides the release's `VERSION`, and `tags` lists extra tag names.
- **Payload is a harness layer, copied once.** A release-source build copies
  `install.sh`, `src/install` and `src/skills` from the working tree once.
  Each revision then writes its release deltas. Withheld paths filter the
  `managed_files` declaration in that revision's `install.sh`, as
  `build_upgrade_releases --withhold` does. Removed paths are deleted from
  that revision's payload. A later revision that does not withhold or remove
  them restores them from the working tree.
- **A release source is one local checkout, built in place.** Installers read
  the source by path, so there is no bare origin or push. The source is not
  copied from a template, because each shell build is its own process. This
  is a materializer option. `materializeLocalCheckout` in the
  [repository harness](../../../tests/support/repository-fixture.mjs) already
  gives Node tests a checkout without an origin. Reuse that option and add
  building in place; do not add a second one.
- **One Node helper.** `tests/support/release-source.mjs <dest>` reads JSON
  release-source facts on stdin, builds them with MakeMe, and materializes
  them at `<dest>`. `tests/support/release-sources.mjs` exports the shared
  descriptions that several checks use, such as the latest set. A shell
  builder that remains passes its facts as a JSON here-document, so the
  facts stay visible at the call site.
- **Plan 532 overlap.** Plan 532 (Taken) changes `repositoryTestData.mjs`
  and the materializer, and makes `backlog: null` the no-backlog fact.
  Release revisions state no backlog in whichever spelling trunk holds when
  each slice starts. Rebase over 532 when it lands; neither plan changes the
  other's behavior.

## Proof ownership

| Example | Owner |
| --- | --- |
| 1. Latest by version | Slice 1 |
| 2. Upgrade with a withheld path | Slice 2 |
| 3. Mismatch under proof | Slice 3 |
| 4. Non-release tags | Slice 3 |
| 5. Payload backlog | Slice 4 |
| 6. Superseded setup removed | Slice 4 |
| Evaluation timing, latest | Slice 1 |
| Evaluation timing, upgrade family | Slice 2 |

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests),
as written there. On AC power, run long runs under `caffeinate -s -i` with
Homebrew Bash first on `PATH`; on battery, follow the lid-open procedure and
read the sleep log.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Focused runs use:

```sh
PATH=/opt/homebrew/bin:$PATH caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR bash scripts/test.sh <paths>
```

A quiet pass is exit 0 with no output. Run `npm run typecheck:dashboard`
whenever MakeMe or `tests/support/repositoryTestData.mjs` changes, because
MakeMe is in the dashboard type-check. Run `npm run lint` before each commit.

Slice 1 changes the shared description and materializer, which about 264
node test files load (plan 532, premise P5). So run the whole `npm test`
once before landing, not per slice.

Timing: compare before and after with the same command, back to back, under
comparable load, and record the load averages. Run each three times.

## Slices

### 1. Latest-release checks read their releases from a declared release source

Type: Behavior

Status: done

Proof: focused run of `tests/install-latest-release.sh` and the other nine
`build_latest_fixture` consumers: `compare-payload.sh`, `install-all-tools.sh`,
`install-preserves-open-dough-json.sh`, `pin-and-inspect.sh`,
`self-installation-baseline.sh`, `update-refuses-unverifiable.sh`,
`update-force-restores-latest.sh`, `update-reports-replacement-failure.sh` and
`update-skip-verified.sh`. Add a Git-free test in
`tests/support/repository-fixture.test.mjs` that a release revision's
`.please()` data holds the version, date, marker and deltas, and a
materialized case that the checkout has an annotated `v0.1.10` tag dated
2020-01-01 and no `origin` remote. Discrimination: in a scratch edit, declare
0.1.10 with a version below 0.1.2. `install-latest-release.sh` then fails at
its `v0.1.10` assertion. Revert. Timing: `build_latest_fixture` before and
after, and `install-latest-release.sh` wall time before and after.

Behavior: `install-latest-release.sh` states 0.1.1 tagged 2026-06-01, 0.1.2
tagged 2026-09-01 and 0.1.10 tagged 2020-01-01, under an untagged head that
adds `BRANCH_HEAD`, using the shared latest description that
`release-sources.mjs` exports and the check names → the check builds the
source and runs the installer → it resolves `v0.1.10`, installs
`payload-0.1.10`, and `BRANCH_HEAD` is absent. `build_latest_fixture` calls
`release-source.mjs` with that description. Add `makeMe.aRelease`, the
revision `release` fact, the local in-place materializer option with the
payload layer, and the helper.

Accepted proof (2026-11-08): the ten `build_latest_fixture` consumers,
`tests/support/repository-release.test.mjs` and the 120 node test files that
import MakeMe, the description or the materializer passed quietly through the
focused command after the refactor pass. Discrimination: 0.1.10 stated as
0.1.0 made `install-latest-release.sh` resolve `v0.1.2` and fail. Timing:
`build_latest_fixture` 0.93–0.97 s before, 0.62–0.71 s after (load about
9.7); `install-latest-release.sh` through `scripts/test.sh` 6.35–6.58 s
before (load 8.1), 5.65–6.19 s after (load 7.2–7.9).

Learnings: a release source is `materializeLocalCheckout`'s one checkout
with no remote, built in place with its `at` option (no template); the
branch's own `withoutOrigin` option was folded into it when plan 524 landed.
History building lives in `tests/support/repository-history.mjs` and the
release types in `tests/support/releaseTestData.mjs`. A stated `withheld` or
`removed` is not yet applied (G1, G2). Trunk's `commitDeclaredRevision`
export (from the dashboard-origin story) changed `repository-fixture.mjs`
after this branch started; merge it into `repository-history.mjs` before
slice 2. (Merged at `3bcdfdc55`.)

CI repair (run 42486448305, `dashboard (5/12)`, on `3bcdfdc55`):
`agent-launch-start-session-recovery.spec.ts:172` met an ownerless
session-store lock left by a server that exited between the lock's `mkdir`
and its owner record. The process now removes locks it holds at exit
(`dashboard/server/machineJsonLock.ts`), proved by the start-store spec's
ownerless-lock case, which failed with the CI error before the fix.

### 2. Upgrade checks state their older and newer releases

Type: Behavior

Status: done

Proof: focused run of the five `build_upgrade_releases` consumers,
`execution-payload-update.sh`, `product-backlog-payload-update.sh`,
`story-payload-update.sh`, `retrospective-reference-payload.sh` and
`update-adds-new-payload-skill.sh`, and the three
`build_current_tagged_release_fixture` consumers,
`dough-adr-awareness-codex-use.sh`, `dough-adr-awareness-context.sh` and
`dough-update-local-guidance-rejection.sh`. Discrimination: in a scratch edit,
drop the withheld path from `update-adds-new-payload-skill.sh`'s 0.1.1.
The check then fails where it expects the update to add that skill. Revert.
Timing: `story-payload-update.sh` and `update-adds-new-payload-skill.sh`
before and after.

Behavior: an update check states 0.1.1, which withholds a managed skill path
from its installer, and 0.1.2, the current payload → it checks 0.1.1 out
with Git, installs it, and updates → the update adds the withheld files, as
today. Each caller passes its labels, withheld prefixes and removed paths as
release facts at its call site. `build_upgrade_releases` keeps its signature
only if every caller still reads clearly; otherwise callers state JSON
facts. The refusal for a withheld prefix that declares nothing moves into
the release builder's `.please()` with a Git-free test.
`build_current_tagged_release_fixture` declares one release at the working
tree's `VERSION`.

Accepted proof (2026-11-08): the five upgrade consumers, the three tagged
candidate consumers, the six `native-*` checks that source
`dough-adr-awareness-context.sh`, the ten latest consumers,
`repository-release.test.mjs` (new Git-free refusal case) and the 120 node
files passed quietly. Discrimination: the planned edit (drop the withheld
path from `update-adds-new-payload-skill.sh`'s 0.1.1) passes both before and
after, because that check installs 0.1.1 by hand without reading its
declaration. Dropping `--withhold` in `retrospective-reference-payload.sh`
fails at its older-install absence check, and dropping `--remove` in
`update-adds-new-payload-skill.sh` fails with `Managed payload mismatch`.
Timing, interleaved at load 11.5–13.8: `story-payload-update.sh`
8.68–10.29 s before, 8.62–9.17 s after; `update-adds-new-payload-skill.sh`
3.30–3.86 s before, 3.15–3.62 s after.

Learnings: `removed` was needed by four of the five upgrade callers, so slice
2 applied it too; slice 3 still proves its own example. The payload layer now
lives in `writeRelease`, which copies each missing working-tree payload path,
so a later release restores what an earlier one removed; `release-source.mjs`
no longer copies it. `build_upgrade_releases` keeps its signature: callers
state labels, withheld and removed paths, while the versions 0.1.1 and 0.1.2
and their dates live in the builder. Slice 4 decides whether that still
reads clearly enough for commitments 1 and 13.

### 3. Inline release sources state their invalid releases at the call site

Type: Behavior

Status: done

Proof: focused run of `install-latest-release.sh`,
`update-refuses-unverifiable.sh`, `update-force-restores-latest.sh`,
`pin-and-inspect.sh`, `self-installation-baseline.sh`,
`compare-versions.sh`, `apply-temp-cleanup.sh` and
`update-removes-dropped-files.sh`. `git grep -nE 'git (-C [^ ]+ )?init'` on
those files lists only install targets and snapshots without release facts.
Discrimination: in a scratch edit, state the mismatch release's `VERSION` as
0.1.1. `update-refuses-unverifiable.sh` then fails where it expects
`baseline metadata mismatch`. Revert.

Behavior: `update-refuses-unverifiable.sh` states release 0.1.1 whose
`VERSION` says 0.1.8, then 0.1.10 → the update refuses with
`baseline metadata mismatch` and writes nothing. The branch-only source
states the lightweight tags `not-a-release` and `v1.2.3-rc.1` and no release
→ the installer refuses with `No numeric release tags`. Leading-zero
versions, two tags on one payload, and the decoy remotes become stated
facts in the same way.

Accepted proof (2026-11-08): the eight checks, `pin-and-inspect.sh` and
`repository-release.test.mjs` passed quietly, as did the 23 earlier shell
consumers and the 120 node files. The `git init` grep lists only
`pin-and-inspect.sh` snapshots and the decoy-origin install targets.
Discrimination: the mismatch release stated with `VERSION` 0.1.1 fails
`baseline metadata mismatch`; `v1.2.3-rc.1` stated as `v1.2.3` fails.
Timing: `update-refuses-unverifiable.sh` 11.6–19.1 s before, 12.8–19.0 s
after (load 8–10); the dropped-files build 1.13–1.18 s before, 0.75–0.80 s
after.

Learnings: payload the working tree does not hold is a release fact,
`added: {path: bytes}`, written under `src/skills/` and declared in that
release's installer; `withheld` and `removed` stay limited to declared paths.
`pin-and-inspect.sh`'s "release 0.1.11 appears after inspection" step still
uses the shell release writers on the built source (G3, slice 4).

### 4. Superseded release writers are gone and the payload backlog is rendered

Type: Behavior

Status: done

Proof: focused run of `tests/product-backlog-payload-update.sh` and every
check that sources `release-fixture.bash`. `git grep` finds no caller of a
release-writing builder outside `tests/support/dough-adr-awareness-delivery-to-use.sh`.
`git diff <start>.. -- tests/helpers/release-fixture.bash` shows no change to
`init_fixture_repo`, `write_candidate_payload`, `commit_all`,
`tag_release`, `copy_current_release_files` or `copy_installer_modules`.
`bash scripts/test.sh tests/native-evidence-identity.sh` passes quietly.
Under Learnings, record which identities changed: product-backlog native
take, git-publication admission, and worktree preparation unless plan 532
landed first. Give the reuse reason: none of their fixtures builds a release,
and their arranged repositories are unchanged. That reason follows
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md#5-assess-now-and-delete-spent-evidence).
Make no paid refresh.
Review `tests/README.md` lines 130 and 286 and the
[test data architecture](../../../tests/README.md#test-data-architecture)
against the code: the README names the release fact, the local in-place
source and the helper.

Behavior: the done-catalog proof states `CAT#finish` queued in
`plans/BACKLOG.md` through `render-published-backlog.mjs` → the installed
`catalog-done` leaves the backlog unchanged, and `complete` lists both
records at their blob hashes. Remove `build_latest_fixture`,
`build_upgrade_releases` and `build_current_tagged_release_fixture` if they
no longer add anything over the helper. Keep the four builders the native
journey calls, and the two helpers they call.

Accepted proof (2026-11-08): the 26 checks that source
`release-fixture.bash`, the six `native-*` context checks, the three
`dough-adr-awareness-*-delivery-to-use.sh` wrappers,
`tests/native-evidence-identity.sh` and 223 node files passed quietly.
Discrimination: `CAT#finish` stated as `CAT#other` fails at the installed
`complete`; release 0.1.11 stated as 0.1.9 fails `pin-and-inspect.sh:232`.
`git grep` finds `write_candidate_payload` and `tag_release` only in the
native journey. Timing: `product-backlog-payload-update.sh` 10.53–15.85 s
before, 10.19–13.55 s after; `story-payload-update.sh` 8.21–8.69 s before,
8.02–11.01 s after (load 10–18); the build is the same helper call.

Learnings:

- Native evidence identities (P4), compared with `54cc27451` by running every
  writer `tests/native-evidence-identity.sh` lists plus
  `take_write_evidence_inputs`: the git-publication admission and
  product-backlog native take closures changed (`makeMe.mjs`,
  `repositoryTestData.mjs`, new `releaseTestData.mjs`; admission's
  `product-backlog-fixture.mjs` change comes from trunk merges). Worktree
  preparation's identity is unchanged, since plan 532 landed first. Reuse
  reason under ADR 0005: none of their fixtures builds a release, and their
  arranged repositories are unchanged. No paid refresh.
- `build_current_tagged_release_fixture` moved unchanged into
  `tests/support/dough-adr-awareness-proof.sh`, because
  `tests/dough-adr-awareness-context.sh` calls it by name and is a hashed
  native identity input.
- `release-source.mjs --add <source>` adds a stated release to an existing
  checkout; `writeRelease` keeps existing non-installer files, where
  `write_candidate_payload` overwrote them.
- The done-catalog proof checks which identity the backlog holds, not its
  list state: stating `CAT#finish` as taken still passes.
- `take_write_evidence_inputs` is not among `native-evidence-identity.sh`'s
  writers; check it separately for import-closure changes.

CI repair (run 42497772037, `dashboard (8/12)`, on `b85ff0d19`):
`intent-ci-proof-ancestor.spec.ts:54` counted proof calls before the
trunk's run-11 proof read had settled; a request is recorded only when its
answer is ready, so a late run-11 read joined the counted slice. The spec now
waits for the trunk's proof row first, proved by a held-request reproduction
that failed with the CI diff and by `--repeat-each=20`.

## Decisive premises

| # | Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- | --- |
| P1 | The release checks pass before the change | `bash scripts/test.sh` on the checks | This checkout at `9aaae4bfa`, Homebrew Bash, `caffeinate -s -i`, alternates and color variables unset, 2026-11-08: `install-latest-release.sh`, `story-payload-update.sh`, `update-adds-new-payload-skill.sh`, `update-refuses-unverifiable.sh`, `product-backlog-payload-update.sh` | Quiet pass, exit 0, 19 s, load 8.9. The other 16 consumers (slices 1–3 lists, `dough-adr-awareness-*` and `dough-update-local-guidance-rejection.sh` included) in one run: quiet pass, exit 0, 68 s, load 17.6 |
| P2 | Installers read a non-bare local checkout with annotated tags by path | `open-dough-release.sh resolve-url` and `apply --url <path>` in the checks | P1's run: today's fixture is a non-bare `git init` repository at that path with `tag -a` tags | Passes. The planned source has the same form, without an origin remote, which today's fixture also lacks |
| P3 | The planned build is not slower | `build_latest_fixture` wall time | Scratch scripts in the job directory against this checkout, 2026-11-08, load 7–9, three runs each: today's shell builder; four releases through `materializeRepository` with the payload as files; a local checkout that copies the payload once, commits deltas and tags; the same plus a template copy | 1.09–1.14 s; 2.10–2.35 s; 0.88–1.17 s; plus 0.28–0.29 s. So the plan builds in place, copies the payload once and pushes nothing |
| P4 | Which native evidence identities a change here reaches | Every identity writer that `tests/native-evidence-identity.sh` lists, including `native_import_closure_input_hash_lines` | `grep` of the writers' listed files for `release-fixture`, the migrated checks, `render-published-backlog`, `repository-fixture` and `repositoryTestData`, then `node tests/support/native-import-closure.mjs .` on each closure-hashed entry set, 2026-11-08 at `9aaae4bfa` | No writer lists `release-fixture.bash` or a migrated check. `native_result_journey_input_hash_lines` lists `dough-adr-awareness-delivery-to-use.sh`, which stays unchanged. The closures include `makeMe.mjs` and `repositoryTestData.mjs` for the product-backlog native take (through `render-published-backlog.mjs`) and git-publication admission. Worktree preparation's closure also includes `repository-fixture.mjs` and `repository-revision-files.mjs` until plan 532 slice 1 lands. Slice 1 changes those identities; slice 4 records them |
| P5 | Consumers of each builder | `grep -l` over `tests/*.sh`, `tests/support/*.sh` and `tests/helpers/*.bash`, 2026-11-08 | Lists | `build_latest_fixture`: 10 checks; `build_upgrade_releases`: 5; `build_current_tagged_release_fixture`: 3; inline `write_candidate_payload` and `tag_release`: 8 checks plus the native journey. `execution-worktree-preparation-native.sh` sources the helper but calls no builder |

## Concern evidence

Refinement: not needed. Each slice owns one family of consumers and one
example with its own proof loop. The shared model is one release fact on one
description, and slices 2 and 3 extend it with facts their examples need.

Remaining slice-specific concerns: none identified in this review. Slice 1 is
the largest: a new fact, a materializer option, a helper and ten consumers.
Its consumers share one description, so they form one proof loop.


## Story obligations

### G1. Stated withheld paths are not yet applied (first reported in slice 1)
Reported: slice 2 — "Withheld and removed are held in the model only. The materializer does not write them yet, so a stated non-empty value is currently ignored."
Story clause: "the managed paths a release withholds from its installer declaration"
Disposition: proved by slice 2: writeRelease filters managed_files under each withheld prefix; dropping --withhold in tests/retrospective-reference-payload.sh fails at its older-install absence check :33
Commitment: 6.4


### G2. Stated removed paths are not yet applied
Reported: slice 1 — "Withheld and removed are held in the model only. The materializer does not write them yet, so a stated non-empty value is currently ignored."
Story clause: "or removes from its payload"
Disposition: proved by slice 2: dropping --remove in tests/update-adds-new-payload-skill.sh fails with Managed payload mismatch; slice 3 inspected update-removes-dropped-files.sh, whose dropped paths lie outside the working tree's payload and are stated through the release's added paths
Commitment: 6.5

### G3. A release still appears through the shell release writers
Reported: slice 3 — "the release 0.1.11 appears after inspection step still calls write_candidate_payload, commit_all and tag_release on the already-built source"
Story clause: "Remove `release-fixture.bash`'s release-writing builders once no consumer needs them."
Disposition: proved by slice 4: tests/pin-and-inspect.sh states release 0.1.11 through release-source.mjs --add; stating it as 0.1.9 fails at pin-and-inspect.sh:232; git grep finds write_candidate_payload and tag_release only in dough-adr-awareness-delivery-to-use.sh
Commitment: 24

## Execution complete

Product advice: no change. The release sources now state their releases at
each call site or in `tests/support/release-sources.mjs`, and the whole local
`npm test` passed quietly before landing (2026-11-08, AC power, load 12–34).
Two limits remain for later judgment, not corrections: the done-catalog proof
observes which identity the backlog holds but not its list state, and a
SIGKILL between a machine JSON lock's `mkdir` and its owner record still
leaves an ownerless lock.
