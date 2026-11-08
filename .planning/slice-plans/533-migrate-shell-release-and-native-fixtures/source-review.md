# Source review: Build release source repositories from explicit MakeMe data

Launch: 2026-11-08, a fresh general-purpose reviewer without conversation
inheritance, launched by the execution coordinator before slice 1 delegation.
Input: only the story section `SEED-262#migrate-shell-release-and-native-fixtures`
(Goal, Scope, Key examples, Evaluation, Architecture) copied verbatim from
`.planning/seeds/SEED-262-faster-dashboard-test-feedback.md` at `766cfa66f`,
without its state block. Instruction: read no other project files, change
nothing, number every commitment and split listed compound commitments.
Reviewer notes: rows 39–40 restate 15, 24 and 26; row 13's two alternatives
are equally acceptable; row 32 is a boundary assumption and row 33 its
recording action.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A maintainer reading a shell install or update check can see, at its call site, which releases its release source holds. | slice 4 | observed: each release-source call site states its releases as JSON facts or names release-sources.mjs latest / build_current_tagged_release_fixture in dough-adr-awareness-proof.sh (slice 4 grep and diff) |
| 1.1 | Those facts are each release's version, | slice 4 | observed: versions stated at call sites (e.g. tests/story-payload-update.sh 0.1.1/0.1.2 here-doc) and in release-sources.mjs |
| 1.2 | each release's tag date, | slice 4 | observed: tag dates stated at call sites (taggedAt) and in release-sources.mjs |
| 1.3 | and how its payload differs from the current one. | slice 4 | observed: payload differences stated as marker, withheld, removed, added facts at call sites |
| 2 | The install and update checks choose, verify and pin releases from these facts. | slice 4 | observed: installers choose, verify and pin from the stated sources: all 26 release-fixture consumers, 6 native-* and 3 delivery-to-use wrappers pass (slice 4 focused run) |
| 3 | Today `tests/helpers/release-fixture.bash` states these facts inside its builders; `install-latest-release.sh` asserts `v0.1.10` is chosen, but only `build_latest_fixture` says 0.1.10 is tagged 2020-01-01, after 0.1.1 and 0.1.2 by version and before them by date, under an untagged divergent head. | slice 1 | observed: tests/support/release-sources.mjs latest states 0.1.1@2026-06-01, 0.1.2@2026-09-01, 0.1.10@2020-01-01 under untagged divergent head; tests/install-latest-release.sh names it |
| 4 | The release sources move onto the shared repository description (`tests/support/repositoryTestData.mjs`) through a small Node helper. | slice 1 | observed: tests/support/release-source.mjs builds via makeMe.aRepository revisions in tests/support/repositoryTestData.mjs |
| 5 | Shell check feedback must not get slower. | slice 4 | observed: slice 1-4 timing: builds 0.62-1.2 s vs 0.93-1.23 s before; check timings within noise (plan slice proof notes) |
| 6 | MakeMe gains a release concept with: | slice 1 | observed: tests/support/makeMe.mjs aRelease; repository-release.test.mjs 'a release revision states its version, tag date, payload marker and payload deltas' |
| 6.1 | a version; | slice 1 | observed: repository-release.test.mjs release .please() deepEqual: version |
| 6.2 | a tag date; | slice 1 | observed: repository-release.test.mjs release .please() deepEqual: taggedAt |
| 6.3 | a payload marker; | slice 1 | observed: repository-release.test.mjs release .please() deepEqual: marker |
| 6.4 | the managed paths a release withholds from its installer declaration; |  | G1 |
| 6.5 | the managed paths a release removes from its payload. | slice 3 | G2 |
| 7 | A repository description revision can carry a release. | slice 1 | observed: repositoryTestData.mjs RevisionFacts.release; repository-release.test.mjs local release checkout case |
| 8 | The materializer tags a release revision with an annotated `v<version>` tag at the release's tag date. | slice 1 | observed: repository-fixture.mjs tagRevision; repository-release.test.mjs asserts refs/tags/v0.1.10 objecttype tag, tagger date 2020-01-01 00:00:00 |
| 9 | The current working tree's installer and payload are a harness layer that the materializer copies into each release revision. | slice 1 | observed: release-source.mjs copyPayloadLayer copies install.sh, src/install, declared src/skills once before materializeRepository(at) |
| 10 | The release's `VERSION`, changelog entry and marker are facts. | slice 1 | observed: repository-revision-files.mjs writeRelease (VERSION, CHANGELOG '## v - 2026-09-06', marker comment); files override; fixture test checks bytes at v0.1.10 |
| 11 | A Node helper reads a release-source description from the shell call site and materializes it. | slice 1 | observed: tests/support/release-source.mjs <dest> [name], JSON on stdin |
| 12 | Route these builders through the helper: | slice 2 | observed: tests/helpers/release-fixture.bash build_upgrade_releases and build_current_tagged_release_fixture pipe JSON facts into tests/support/release-source.mjs |
| 12.1 | `build_latest_fixture`; | slice 1 | observed: tests/helpers/release-fixture.bash build_latest_fixture -> release-source.mjs latest; ten consumers quiet pass (slice 1 focused run) |
| 12.2 | `build_upgrade_releases`; | slice 2 | observed: build_upgrade_releases here-document into release-source.mjs; five consumers quiet pass (slice 2 focused run) |
| 12.3 | `build_current_tagged_release_fixture`. | slice 2 | observed: build_current_tagged_release_fixture declares one release at the working tree VERSION; three consumers plus six native-* context checks quiet pass |
| 13 | Each caller states its releases at the call site, or names a shared description that its fixture file states (alternatives). | slice 4 | observed: call-site JSON here-docs; latest consumers name release-sources.mjs latest; tagged-candidate callers name dough-adr-awareness-proof.sh |
| 14 | On 2026-11-08, 18 checks called those builders. | slice 2 | observed: slice 2 git grep: no other build_upgrade_releases or build_current_tagged_release_fixture callers outside .planning and tests/README.md |
| 15 | Route the inline release sources (which used `write_candidate_payload` and `tag_release` after their own `git init`) too; on 2026-11-08 these were in: | slice 3 | observed: the eight checks pipe JSON release facts into tests/support/release-source.mjs at their call sites; slice 3 git grep lists only snapshots and install-target decoy origins |
| 15.1 | `install-latest-release.sh`; | slice 3 | observed: tests/install-latest-release.sh branch-only and invalid-highest sources stated as JSON; quiet pass |
| 15.2 | `update-refuses-unverifiable.sh`; | slice 3 | observed: tests/update-refuses-unverifiable.sh decoy and mismatch sources stated as JSON; quiet pass |
| 15.3 | `update-force-restores-latest.sh`; | slice 3 | observed: tests/update-force-restores-latest.sh decoy 9.9.9 stated as JSON; quiet pass |
| 15.4 | `pin-and-inspect.sh`; | slice 3 | observed: tests/pin-and-inspect.sh builds its source with build_latest_fixture (shared latest); quiet pass; post-inspection 0.1.11 is G3 |
| 15.5 | `self-installation-baseline.sh`; | slice 3 | observed: tests/self-installation-baseline.sh collision source stated as JSON; quiet pass |
| 15.6 | `compare-versions.sh`; | slice 3 | observed: tests/compare-versions.sh leading-zero source stated as JSON; quiet pass |
| 15.7 | `apply-temp-cleanup.sh`; | slice 3 | observed: tests/apply-temp-cleanup.sh invalid-highest release stated as JSON; quiet pass |
| 15.8 | `update-removes-dropped-files.sh`. | slice 3 | observed: tests/update-removes-dropped-files.sh build_dropped_files_fixture states releases with added paths; dropping B from added fails |
| 16 | Invalid input under proof stays visible at the call site. Examples: | slice 3 | observed: slice 3 call sites state files.VERSION mismatches, leading-zero versions, lightweight tags and decoy releases literally |
| 16.1 | a tag whose `VERSION` disagrees with it; | slice 3 | observed: update-refuses-unverifiable.sh 0.1.1 with files.VERSION 0.1.8; apply-temp-cleanup.sh and install-latest-release.sh v0.1.10 with VERSION 0.1.9 |
| 16.2 | two tags on one payload; | slice 3 | observed: release plus lightweight tags on one revision: repository-release.test.mjs 'local release checkout' case tags v0.1.10 and not-a-release; no check here stated two version tags on one payload |
| 16.3 | leading-zero versions; | slice 3 | observed: tests/compare-versions.sh states version 0.08.0 |
| 16.4 | non-release tags such as `not-a-release` and `v1.2.3-rc.1`; | slice 3 | observed: tests/install-latest-release.sh branch-only source states tags not-a-release and v1.2.3-rc.1 |
| 16.5 | a head that moves after resolution. | slice 3 | observed: tests/install-latest-release.sh moves BRANCH_HEAD with commit_all after resolution; pin-and-inspect.sh poisons the default branch with Git |
| 17 | The description states a mismatched `VERSION` or an extra tag name as a literal fact. | slice 3 | observed: files.VERSION and tags literals at the call sites above |
| 18 | A later change to a materialized source, such as moving `BRANCH_HEAD`, stays a Git operation in the check. | slice 3 | observed: install-latest-release.sh BRANCH_HEAD move and pin-and-inspect.sh branch poisoning stay Git operations in the checks |
| 19 | The hand-written backlog in the product-backlog payload check's `run_offline_done_catalog_proof` is rendered through `render-published-backlog.mjs`, as its merge proof's backlog already is. | slice 4 | observed: tests/helpers/product-backlog-payload-runtime.bash run_offline_done_catalog_proof renders plans/BACKLOG.md through render-published-backlog.mjs (byte-identical to the old text) |
| 20 | Its (the done-catalog proof's) Git repositories stay as they are. | slice 4 | observed: done-catalog proof's Git repositories unchanged (slice 4 diff) |
| 21 | The merge proof's ancestor holds one rendered backlog at a custom path, and its branches are Git under proof. | slice 4 | observed: merge proof untouched (slice 4 diff) |
| 22 | The recorder proof publishes what `record-state` wrote. | slice 4 | observed: recorder proof untouched (slice 4 diff) |
| 23 | The free-form payload seed that `record-state` proves stays literal bytes. | slice 4 | observed: record-state free-form seed stays literal bytes (untouched) |
| 24 | Remove `release-fixture.bash`'s release-writing builders once no consumer needs them. |  | G3 |
| 25 | `checkout_tagged_release` stays as a harness operation, because it checks out an older release with Git. | slice 4 | observed: checkout_tagged_release byte-unchanged in tests/helpers/release-fixture.bash (git diff 54cc27451) |
| 26 | The native ADR-awareness delivery-to-use journey (`tests/support/dough-adr-awareness-delivery-to-use.sh`) builds its release source with these, which keep their behavior for that caller: | slice 4 | observed: tests/support/dough-adr-awareness-delivery-to-use.sh byte-unchanged; its four builders unchanged (git diff 54cc27451) |
| 26.1 | `init_fixture_repo`; | slice 4 | observed: init_fixture_repo unchanged (git diff 54cc27451 -- tests/helpers/release-fixture.bash) |
| 26.2 | `write_candidate_payload`; | slice 4 | observed: write_candidate_payload unchanged (same diff) |
| 26.3 | `commit_all`; | slice 4 | observed: commit_all unchanged (same diff) |
| 26.4 | `tag_release`. | slice 4 | observed: tag_release unchanged (same diff) |
| 27 | An install target that holds no domain facts, such as an empty project or a baseline commit before install, stays harness setup. | slice 3 | observed: install targets and snapshots untouched (slice 3 git grep: pin-and-inspect snapshots, decoy-origin install targets) |
| 28 | Installed state, host-hook settings, runner settings and native scenario content belong to "installation and native test data" (`SEED-261-share-domain-test-data.md#map-installation-and-native-test-data`). | slice 4 | observed: no installed state, host-hook, runner or native scenario content touched (slice 4 changed paths) |
| 29 | Git-publication native fixtures belong to `#migrate-git-publication-native-fixtures`. | slice 4 | observed: no git-publication native fixture touched |
| 30 | The worktree-preparation native builders stay MakeMe-free under plan 532 (`532-tighten-repository-description-facts/PLAN.md`). | slice 4 | observed: worktree-preparation native builders untouched; prep_native_input_hash_lines unchanged |
| 31 | Release sources gain no branch or merge model. | slice 4 | observed: release description has no branch or merge model (releaseTestData.mjs) |
| 32 | Boundary assumption: no native evidence identity hashes these helpers or the migrated checks, so no paid run is needed. | slice 4 | observed: slice 4 identity diff 54cc27451 vs tree: no writer lists release-fixture.bash or a migrated check; tests/native-evidence-identity.sh quiet pass |
| 32.1 | `execution-worktree-preparation-native.sh` sources `release-fixture.bash` but calls none of its builders. | slice 4 | observed: execution-worktree-preparation-native.sh calls no builder; passes in slice 4 run |
| 32.2 | The delivery-to-use journey's identity hashes its own file, not `release-fixture.bash`, and its file is not migrated. | slice 4 | observed: native_result_journey_input_hash_lines inputs unchanged (dough-adr-awareness-delivery-to-use.sh byte-identical) |
| 32.3 | Adding the release fact changes `makeMe.mjs` and the repository description; three identities hash those through import closures: the product-backlog native take, git-publication admission, and (until plan 532 lands) worktree preparation. None of their fixtures builds a release. | slice 4 | observed: changed closures: git-publication admission and product-backlog native take (makeMe.mjs, repositoryTestData.mjs, releaseTestData.mjs); worktree preparation unchanged |
| 33 | Record "none of their fixtures builds a release" as the reuse reason under ADR 0005 (`#5-assess-now-and-delete-spent-evidence`) and make no paid refresh. | slice 4 | observed: PLAN.md slice 4 learnings record the ADR 0005 reuse reason; no paid refresh |
| 34 | Latest by version: `install-latest-release.sh` declares 0.1.1 tagged 2026-06-01, 0.1.2 tagged 2026-09-01 and 0.1.10 tagged 2020-01-01, under an untagged head with `BRANCH_HEAD`; the installer still resolves `v0.1.10`, the installed payload carries `payload-0.1.10`, and `BRANCH_HEAD` is absent. | slice 1 | observed: tests/install-latest-release.sh asserts resolve-url v0.1.10, payload-0.1.10, BRANCH_HEAD absent; quiet pass; discrimination 0.1.10->0.1.0 resolved v0.1.2 and failed |
| 35 | Upgrade with a withheld path: an update check declares 0.1.1 that withholds a managed skill path from its installer and 0.1.2 that is the current payload; it checks 0.1.1 out with Git and installs it; the update to 0.1.2 adds the withheld files, as today. | slice 2 | observed: update checks (story-payload-update.sh etc.) install 0.1.1 via checkout_tagged_release and assert_payload 0.1.2 after apply; discrimination: dropping --withhold in retrospective-reference-payload.sh fails at :33 older-install absence check |
| 36 | Mismatch under proof: `update-refuses-unverifiable.sh` declares at its call site release 0.1.1 whose `VERSION` says 0.1.8, then 0.1.10; the update still refuses with `baseline metadata mismatch` and writes nothing. | slice 3 | observed: update-refuses-unverifiable.sh quiet pass; discrimination: VERSION 0.1.1 instead of 0.1.8 fails 'baseline metadata mismatch: expected refusal to mention' |
| 37 | Non-release tags: the branch-only source declares `not-a-release` and `v1.2.3-rc.1` as literal lightweight tag names and no release; the installer still refuses with `No numeric release tags` and installs nothing. | slice 3 | observed: install-latest-release.sh branch-only source quiet pass; discrimination: v1.2.3-rc.1 stated as v1.2.3 fails |
| 38 | Payload backlog: the installed done-catalog proof declares `CAT#finish` queued in `plans/BACKLOG.md` through the renderer; installed `catalog-done` still leaves the backlog unchanged, and `complete` still lists both records at their blob hashes. | slice 4 | observed: product-backlog-payload-update.sh quiet pass; discrimination CAT#finish stated as CAT#other fails at installed complete (product-backlog-payload-runtime.bash:229) |
| 39 | Superseded setup removed: no install or update check runs its own `git init` to build a release source. | slice 4 | observed: slice 4 git init grep lists only install targets and snapshots |
| 40 | `release-fixture.bash` keeps only the builders the native delivery-to-use journey calls, unchanged. | slice 4 | observed: release-fixture.bash keeps configure_fixture_git, init_fixture_repo, copy_installer_modules, copy_current_release_files, write_candidate_payload, commit_all, tag_release, checkout_tagged_release |
| 41 | Migrated checks keep their verdicts and assertions. | slice 4 | observed: no assertion edited across slices; all migrated checks pass |
| 42 | A reviewer can name each check's releases from its call site or fixture file. | slice 4 | observed: call sites and release-sources.mjs name every release's version, date and payload facts |
| 43 | Record focused run times before and after, under comparable load, for: | slice 2 | observed: slice 2 return timing table (story-payload-update.sh, update-adds-new-payload-skill.sh before/after, three runs each, load 11-14) |
| 43.1 | `install-latest-release.sh`; | slice 1 | observed: slice 1 return: install-latest-release.sh via scripts/test.sh before 6.35-6.58 s (load ~8.1), after 5.65-6.19 s (load 7.2-7.9); build_latest_fixture 0.93-0.97 s -> 0.62-0.71 s (load ~9.7) |
| 43.2 | one upgrade family, such as `story-payload-update.sh` and `update-adds-new-payload-skill.sh`. | slice 2 | observed: interleaved: story-payload-update 8.68-10.29 s before vs 8.62-9.17 s after; update-adds 3.30-3.86 s vs 3.15-3.62 s; build_upgrade_releases 1.17-1.23 s vs 0.88-1.18 s |
| 44 | Those run times must not regress beyond run-to-run noise. | slice 2 | observed: slice 2 interleaved timings within run-to-run noise |
| 45 | One description, one materializer: a release is a revision fact in the repository description (`tests/support/repositoryTestData.mjs`); the materializer (`tests/support/repository-fixture.mjs`) writes its tag. | slice 1 | observed: repository-fixture.mjs materializeRepository writes the release tag via tagRevision |
| 46 | No release-specific Git builder is added (test data architecture). | slice 1 | observed: no release-specific Git builder: release-source.mjs only calls materializeRepository |
| 47 | Payload is a harness layer: the copied installer and skills describe the source under test, not a release fact. | slice 1 | observed: release-source.mjs copyPayloadLayer: working tree payload is harness layer, not a Release field |
| 48 | The release's version, date and payload differences are facts, so a check that proves selection by version states them. | slice 1 | observed: release-sources.mjs latest states versions, dates and markers |
| 49 | Under ADR 0003, a matching version tag such as `v0.1.0` identifies a release. | slice 1 | observed: repository-fixture.mjs tagRevision annotated v<version> |
| 50 | Shell reaches MakeMe through Node: the shell call site passes facts as JSON to one helper, as `render-published-backlog.mjs` already does. | slice 1 | observed: build_latest_fixture/install-latest-release.sh call node release-source.mjs; JSON stdin supported |
| 51 | A release source is one local checkout, built in place; installers read the source by path, so it needs no origin. | slice 1 | observed: materializeLocalCheckout(undefined, …, { at: dest }) in tests/support/release-source.mjs (one local-checkout option, trunk's, built in place); repository-release.test.mjs asserts git remote empty |
| 52 | Each shell build is its own Node process, so a per-process template is never reused. | slice 1 | observed: materializeLocalCheckout at: buildInPlace builds the checkout at <at> without a template copy |
| 53 | Measurements on 2026-11-08 under load 7–9: `build_latest_fixture` 1.09–1.14 s; four releases through today's path (bare origin, payload stated as 768 files per revision) 2.10–2.35 s; a local checkout copying the payload once and committing only release deltas 0.88–1.17 s; copying that as a template added 0.28–0.29 s. | slice 1 | observed: slice 1 return timing: in-place build 0.62-0.71 s vs shell builder 0.93-0.97 s, load ~9.7 |
