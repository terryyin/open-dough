# Make installation and native test setup map directly to the domain

**Identity:** SEED-261#map-installation-and-native-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-installation-and-native-test-data)

## Goal and boundaries

Maintainers arrange the remaining installation and native-check facts through
the shared MakeMe library, with case-driving values visible and independent
behavioral proof intact. Finish the seed's conversion inventory across its five
[declared entries](../../open-dough.json) and the additional
`tests/support/*.test.mjs` jobs in [Node discovery](../../../tests/node-test-files).

This is test setup work. Real installation, release tagging, Git, processes,
clocks, file writes under test and teardown keep their harness responsibilities.
Literal malformed/legacy inputs, generated product programs, captured streams,
assessor counterexamples and expected results keep their proof roles. No new
installation, scheduler or native host policy is part of this story. Do not
ship MakeMe in the managed payload or duplicate the project-registry and
Intent/CI Proof stories' work.

## Existing solutions and current decisions

- PFE: reuse [MakeMe](../../../tests/support/makeMe.mjs),
  [repository descriptions](../../../tests/support/repositoryTestData.mjs),
  [repository materialization](../../../tests/support/repository-fixture.mjs),
  [release facts](../../../tests/support/releaseTestData.mjs) and the shell
  [release-source writer](../../../tests/support/release-source.mjs).
  Most installer checks already use them. The remaining native ADR release
  writer in `dough-adr-awareness-delivery-to-use.sh` still uses
  `write_candidate_payload` and `tag_release`; remove those obsolete helpers
  when its final consumer migrates. Keep tagging and installation real.
- Existing host-hook scenario writers already cross Bash into Node. Move their
  valid settings construction behind MakeMe, returning the host's actual JSON
  document. Keep the settings writer, real fragments, explicit conflicting
  mutations and [independent assertions](../../../tests/helpers/host-hook-assertions.mjs).
  Use the production [host definitions](../../../src/install/open-dough-register-hooks-fragments.mjs)
  and [merge contract](../../../src/install/open-dough-register-hooks-merge.mjs),
  without running the merge under test to manufacture its expected input.
- Ordinary installed baselines come from the real older installer. The
  added-payload case currently also proves creation of an absent Claude root.
  Keep that as an explicitly asymmetric predecessor, established from an old
  verified installation with the absent root stated as a harness operation.
  Observe the ordinary complete predecessor too. Do not replace missing-root
  proof merely by switching to the ordinary baseline.
- Native starting published records reuse the same backlog, plan and repository
  facts as deterministic tests. The originating checkout in native preparation
  must remain non-bare, without a remote, with a sibling execution worktree.
  `materializeLocalCheckout` supports a local checkout without an origin; keep
  any additional worktree, local dependency installation and markers as actual
  operations. Do not replace this topology with the bare-origin default.
  Keep the authoritative `lockedNodeProject` and `wrapperProject` programs,
  lockfile generation, executable modes and preparation traces.
- The native fixtures' earlier “loading no MakeMe” comments are preservation
  hypotheses, not a product restriction. Establish equivalence at their actual
  file, Git and preparation boundaries before accepting conversion. Include new
  Node writers and their transitive imports in evidence identities. Retained
  streams and assessor observations are evidence, not synthetic records to
  normalize. No new native-attempt builder has a useful consumer in the
  inspected runner/replay cases.
- Feedback maintenance is unowned residue, including its saved choice; plan 540
  covers configured-project registry rows only. Extend existing ad hoc request
  facts to retain canonical `maintenance` fields, composing launch, host session,
  observation and attempt builders rather than recreating them. Add only the
  review/choice/observation builders required by real consumers, typed against
  `feedbackReview.ts`, `feedbackMaintenanceDue.ts`, `feedbackMaintenanceState.ts`
  and the saved choice contract. Keep source review, saved choice and observed
  session lifetimes separate.
- Runner duration setup returns the actual `Map<label, seconds>` consumed by
  `share-deal.mjs`. Keep exact TSV/parser inputs and output expectations literal.
  Do not substitute CI job/proof records for runner duration data.
- Follow [ADR 0002, direct domain mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [ADR 0003, release identity](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
  [ADR 0004, installation ownership](../../../docs/adrs/0004-client-installation-and-update-accepted.md),
  [ADR 0005, deterministic and native proof](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
  and [ADR 0008, published versus machine-local facts](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
  The ADR index and in-file Accepted statuses agree. The existing
  [North Star](../../NORTH-STAR.md) adds no new direction for this conversion.
  Evaluate the gain against the current literals and duplicate constructors
  under [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md):
  visible facts and one domain owner, with equivalent proof, justify the change;
  a forwarding layer that merely hides the same duplicate model does not.

## Preparation evidence and decisive premises

Observed in this assigned checkout at `2f08bababae8410472d4c8aa9abdf23c9358a48b`
on 2026-11-09, Node 24.21.0 and Homebrew Bash 5.3.20. The host was on AC with
77% free memory; focused shell/Node selections used the runner's normal four
jobs. These were credential-free observations. Scratch source edits were
restored before recording preparation. No native host session was launched.

| Premise and consuming operation | Observation and limit |
| --- | --- |
| The added-payload journey can consume an installation made by the actual 0.1.1 installer. | `PATH=/opt/homebrew/bin:$PATH npm test -- tests/update-adds-new-payload-skill.sh` passed on the original fixture. Replacing only its hand-copy baseline block with `bash "${older_checkout}/install.sh" --target "${target}" --source "${fixture}" --platform codex > /dev/null` also passed. This establishes the ordinary route; the explicit asymmetric case remains an execution obligation. |
| Real installation proof detects loss of unrelated host settings. | Baseline `npm test -- tests/install-ci-host-hooks.sh` passed. In a scratch edit to `open-dough-register-hooks-merge.mjs`, deleting `base.sentinel` made that command fail at `host-hook-assertions.mjs`'s expected `keep Codex settings`. Restored proof passed. The same suite contains independent idempotence, conflict and no-write assertions. |
| Feedback proof distinguishes an already served due date. | `npm test -- tests/support/feedback-maintenance-due.test.mjs tests/support/feedback-maintenance-state.test.mjs tests/support/feedback-review.test.mjs` passed. Disabling only `sessions.some((session) => session.due === due)` in `feedbackMaintenanceDue.ts` failed both the served-date case and the interrupted automatic-start case: actual `launch`, expected `wait/served`. Restored selection passed. |
| Runner proof distinguishes the lower-share tie rule. | `npm test -- tests/support/share-deal.test.mjs` passed. Reversing equal-total preference in `dealShares` made the tie and unrecorded-job cases fail, including a/c becoming b/d in share 1. The restored command passed. |
| Native preparation's existing local inputs actually produce separate working installations. | Direct `node --input-type=module` calls to `createLockedNodeFixture` with ordinary and `failingInstall: true` inputs, followed by the existing `hostPrepareCheckout(execution, env)`, observed no origin remote, non-bare origin, sibling worktree, unchanged integrity snapshot, one successful setup trace plus `npm run prove` emitting `fixture-cli-ok`, or failed preparation with zero successful traces. `createWrapperDrivenFixture`, then `./wrapper prepare` and `./wrapper prove`, preserved executable mode and emitted `wrapper-prove-ok`. This is fixture/command proof, not native-agent proof. |
| A newly imported shared builder is reachable by native dependency identity. | In an owned scratch source made by `node tests/support/native-identity-source.mjs "$PWD" <scratch-source>`, `node <scratch-source>/tests/support/native-import-closure.mjs <scratch-source> tests/support/execution-worktree-prep-native-fixture.mjs` listed 5 inputs. Adding a real relative MakeMe import to that scratch fixture produced 26 inputs, including MakeMe and 20 further builder modules. The scratch copy was removed. This proves closure expansion; each changed family must still include its actual writer as a closure root. |
| The actual Take fixture is claimable by its installed writer without changing its seed. | In an owned scratch target, sourced `product-backlog-native-take.sh`, ran `take_write_fixture TARGET`, `bash install.sh --target TARGET --source "$PWD" --platform claude`, and `take_record_preparation TARGET`. From TARGET, `node .claude/skills/dough-product-backlog/scripts/product-backlog.mjs take --identity 'SEED-101#publish-native-claim' --plan 'slice-plans/101-native-claim/PLAN.md'` reported Taken. `take_assert_backlog TARGET` and `cmp BEFORE TARGET/.planning/seeds/SEED-101-native-claim.md` passed. The scratch target was removed. This observes the installed operation, not native discovery. |
| Closure starting state reaches the distinct publication/conflict profiles. | An owned scratch Bash check ran through `npm test -- <scratch>/probe.sh`. `trunk_closure_create_fixture SOURCE HOST SCENARIO ROOT HARNESS` ran for cursor/codex × source/ignored-only. Each preserved remote main at base, candidate above base, the expected source/planning bytes and the integration checkout's pending human edit. Codex profiles armed their real private observer; Cursor profiles retained none. `story_closure_create_fixture SOURCE claude ROOT HARNESS` observed successful branch coverage, diverged story/trunk commits with the same base, and untouched human state. `story_closure_git WORKSPACE merge --no-commit --no-ff TRUNK_SHA` failed with the intended `product.txt` conflict; `merge --abort` restored its branch tip and human state stayed unchanged. Existing `native_harness_stop_observers` and fixture cleanup ended all started observers/watchers before the scratch source was removed. Native-agent conflict resolution and completion were not observed or claimed. |

The no-argument ADR delivery-to-use wrappers for Codex, Cursor and Claude,
`product-backlog-native.sh`, `git-publication-native.sh`,
`execution-worktree-preparation-native.sh`, and `native-evidence-identity.sh`
also passed through `npm test -- <those paths>`, along with the two installer
checks above. They establish their deterministic paths only. In particular,
the no-argument backlog wrapper does not perform the native Take case, and the
publication default does not prove every native closure. The separate Take and
closure observations above settle the starting-state premises used by slices
3 and 4; those slices repeat the comparisons after conversion.

## Proof ownership and delivery gates

| Final-state promise | Owning slice and observation |
| --- | --- |
| Source example 1: coherent older releases and complete/asymmetric installation baselines update safely. | 1: actual tagged releases, old installer, updater, both roots' bytes/version/source, sentinels and configuration; deterministic ADR release transition. |
| Source example 2: host differences and unrelated settings survive, with no-op and conflict proof. | 2: real installer hook suite, independent settings assertions and unchanged refusal snapshots. |
| Source example 3: claimable published starting state and preserved closure inputs. | 3: installed Take moves the selected identity and plan to Taken without changing its seed. 4: compare closure starting files, histories, dirty human state and observer setup before/after. |
| Source example 4: actual native preparation topology, programs, traces and input identity. | 5: pre/post fixture comparison, real preparation commands, native wrapper deterministic cases and dependency hash changes. |
| Source example 5: saved feedback choice, review, records and attempts retain separate meaning. | 6: due/state/review tests plus the real feedback launch, due-row and settings consumers. |
| Source example 6: runner duration data retains allocation and parsing proof. | 7: share-deal, duration and runner selection checks with unchanged independent allocations and raw parser cases. |
| One shared API, complete conversion coverage and no unused constructors. | Every slice migrates its full consumer family and removes displaced construction. Final verification reconciles all declared entries plus support jobs against the boundaries below. |

Use the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
for changed shared modules, call contracts and retired constructors. Follow
consumers into their assertions, run affected callers outside the listed
selections, and retain a disposition for exact-input/evidence exclusions.
Compare converted facts at their consuming boundary before relying on unchanged
assertions. Do not use the new builder to derive expected results.

Local gate. Apply [test automation](../../../AGENTS.md#test-automation) and carry
the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff. Use the
[native prerequisites and exact Node](../../../tests/native-setup.md), Bash 5
first on PATH, and the test runner for shell/Node checks. Run
`npm run typecheck:dashboard` for shared JavaScript changes, and `npm run lint`.
Before final delivery run `npm test` and `npm run test:dashboard`, because the
shared MakeMe entry point and composed requests have consumers in both suites.
Choose expensive proof using current load, memory and competing-work evidence;
the [shared full-suite admission](../../../tests/local-test-resources.md) still
applies. On fully awake macOS with AC power, wrap full runs in `caffeinate -s -i`.
On battery, plug in or start fully awake with the lid open under `caffeinate -i`
and read the sleep log afterwards, following
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Hosted CI follows the selected execution mode and the same failure policy.

Native proof: compare emitted fixture state and the mechanism exercised on each
affected host; record justified reuse of matching prior native observations
only for the boundaries that still match. A changed identity is not a new pass.
Substitutes, direct script calls and replay never establish fresh native-agent
behavior. If conversion changes agent-visible instructions, project convention,
preparation behavior or the integration mechanism beyond demonstrated
equivalence, stop that slice's acceptance and obtain the affected native
observation under the existing wrapper and authority. Do not launch paid native
sessions merely to compensate for an uninspected fixture change.

## Slices

### 1. Older installed releases update from coherent starting facts
Type: Behavior
Status: planned
Proof: Source example 1. Run `npm test -- tests/update-adds-new-payload-skill.sh tests/story-payload-update.sh tests/dough-adr-awareness-codex-delivery-to-use.sh tests/dough-adr-awareness-cursor-delivery-to-use.sh tests/dough-adr-awareness-claude-delivery-to-use.sh` and affected release-source consumers.

Use the existing release builder/writer for the remaining ADR baseline and
improved releases, retaining their different guidance and actual tags. Build
the added-payload ordinary predecessor with the older real installer. Preserve
its older-shared-root-only variant explicitly, with the absence applied after
an actual old installation. Real update must populate both roots and retain
the current sentinels, source/version and project-configuration proof. Remove
the final obsolete release constructors with their last caller. No shared
installer protection needs duplicate cases beyond its existing owning checks.

### 2. Host settings retain their unrelated handlers through installation
Type: Behavior
Status: planned
Proof: Source example 2. Run `npm test -- tests/install-ci-host-hooks.sh tests/install-ci-background-hook.sh tests/install-all-tools.sh tests/execution-payload-update.sh tests/update-skip-verified.sh tests/install-preserves-open-dough-json.sh` and any additional consumers of the host-settings helper.

Make the shell's existing Node scenarios delegate valid empty, mergeable and
manually registered host documents to MakeMe. Express event, matcher, command,
timeout and host distinctions where they drive the case. Preserve authoritative
fragment loading and independent assertions. Edited timeout, suffix delimiters,
duplicate handlers, narrower matchers, malformed JSON and unsafe filesystem
destinations remain explicit mutations or inputs. Retain exact adoption/no-op,
preservation and refusal-before-writes observations across all three hosts.

### 3. A native planned story stays claimable through the installed writer
Type: Behavior
Status: planned
Proof: Source example 3's claim. Run `npm test -- tests/product-backlog-native.sh tests/support/product-backlog-take.test.mjs tests/native-evidence-identity.sh`, plus a focused deterministic check of the actual Take fixture described below.

Move valid seed/plan/backlog construction in
`product-backlog-native-take-fixture.sh` onto the existing shared facts and
encoders. Keep installation, real preparation recording and the claim as actual
operations; preserve the native prompt and transcript assertions.

Retain a focused deterministic check of the real fixture and installed writer
as observed during preparation: assert the selected Taken entry/plan and the
untouched seed with the existing native assertions. Establish that it fails
without the claim, then run it before and after conversion. Update the Take
identity with its actual Node writer's transitive dependencies. Do not infer
native discovery from this direct operation.

### 4. Closure scenarios retain the same candidate, conflict and human state
Type: Behavior
Status: planned
Proof: Source example 3's closure. Run `npm test -- tests/git-publication-native.sh tests/git-publication-native-owned-context.sh tests/git-publication-fixture-identity.sh tests/native-evidence-identity.sh`, and retain the direct profile comparisons observed during preparation.

Move valid starting revision/planning facts in `trunk-closure-native-fixture.sh`,
`trunk-closure-native-owned-context.sh` and `story-branch-closure-native-fixture.sh`
onto the shared facts and encoders. Keep generated product source, workflow
YAML, ignore rules and prompt wording explicit when their exact form is the
proof input; do not create domain builders for arbitrary files. Keep worktrees,
competing commits, pending human changes, installation, observers and fake-host
control as harness operations. CI response data keeps the Intent/CI owner's
canonical representation rather than gaining a native-only copy.

Make the profile comparisons executable before conversion, then repeat them
afterwards: trunk source/ignored-only with each distinct observer-arming
profile, and the story-branch source conflict. Require identical relevant
starting files/planning meaning, branch ancestry, pending human state and
observer setup. The real merge must still conflict on `product.txt`, then abort
back to the original tip. Stop fixture observers/watchers before removal.
Check the owned-context variant through its existing all-host substitute
journey. Generic default wrapper passes alone do not establish these
comparisons. Update each affected family's writer/import identity in this slice.

### 5. Native worktree preparation keeps checkout-local state and commands
Type: Behavior
Status: planned
Proof: Source example 4. Run `npm test -- tests/execution-worktree-preparation-native.sh tests/native-evidence-identity.sh tests/support/native-import-closure.test.mjs` plus the existing `execution-worktree-preparation*.test.mjs` consumers reached by the changed project/fixture helpers.

Reuse shared repository facts in the locked-Node and wrapper native starting
fixtures. Capture the current generated files/modes and Git/preparation
observations before editing. Preserve their no-remote non-bare origin, sibling
worktree, lockfile and local dependency, origin-only markers, wrapper executable,
external artifact cache and execution-local output. Repeat fresh, reuse,
failed-preparation and wrapper observations through the actual preparation
boundary and compare them with the predecessor. Keep installation and generated
lockfile work as harness actions. Remove stale MakeMe-free claims once their
preserved requirement is expressed by the topology and command proof. Hash all
new writer and builder dependencies; editing a reached builder must change the
corresponding identity. Do not accept only a changed hash as fixture equivalence.

### 6. Feedback maintenance setup names its review, choice and served date
Type: Behavior
Status: planned
Proof: Source example 5. Run `npm test -- tests/support/feedback-review.test.mjs tests/support/feedback-maintenance-due.test.mjs tests/support/feedback-maintenance-state.test.mjs`. Run dashboard selections matching `feedback-maintenance` across launch/configuration/backend tests, and `agent-launch-ad-hoc-codex-input.spec.ts` for the shared request consumer.

Convert the valid review block, saved host/model choice, review observations and
maintenance-session facts in these support tests and
`dashboard/tests/support/feedbackMaintenanceDue.ts` / `feedbackMaintenanceServer.ts`.
Extend the canonical ad hoc request builder to carry `maintenance`, using the
same request in kept records and accepted/live attempts. Remove local
`automatic`, `record`, `attempt`, review and session constructors when displaced.
Keep due dates, process liveness, review-read time, source, host and done marks
visible wherever they explain the result. Preserve invalid review/schema/date
examples, exact request-contract inputs, Save actions, server writes under test
and saved/result bytes as independent observations. Cover real launch/due-row
and settings/boundary consumers of the changed writers, including the unchanged
choice and late-date cases.

### 7. Recorded durations still determine runner allocation
Type: Behavior
Status: planned
Proof: Source example 6. Run `npm test -- tests/support/share-deal.test.mjs tests/support/duration-list.test.mjs tests/support/test-shares.test.mjs tests/support/share-deal-recorded-runs.test.mjs tests/test-runner-selection.sh` and any additional changed-duration consumers.

Arrange valid recorded/observed duration maps through a small shared builder
typed against the actual runner input. Keep seconds and job labels explicit.
Retain raw TSV, headers, malformed/zero examples where their exact form is
under test, and independent expected shares, medians, fallback and output text.
Keep test program generation, runner subprocesses, environment and admission
under their current harness owners.

Finish the coverage reconciliation while completing these conversions: inspect
all five declared roots and every discovered support Node job, classify residual
setup by its actual domain owner, and convert remaining facts belonging to this
story. Preserve exact-input/evidence exclusions with concrete reasons. Reuse
landed sibling conversions and coordinate unfinished overlapping ownership,
without editing another active execution's files. Remove obsolete variants only
after tracing their last real consumer. Do not mark the story complete with an
unclassified remaining constructor; a newly discovered independent outcome or
domain-policy question returns to story refinement instead of expanding silently.

## Readiness review

Slice-plan refinement ran: split the independently evaluable claim and closure
proof loops into slices 3 and 4; retain the other boundaries. Seven slices
introduce builders with real consumers and retain one common rule that domain
facts belong in MakeMe while operations and evidence keep their owners. Native
identity and preservation checks stay with the conversions that reach them.
The final inventory reconciliation is an acceptance gate, not an unrelated audit
slice. No numeric slice limit was supplied; boundedness includes the named
consumers, focused proof and cleanup. The review found no remaining
slice-specific concern or human-owned decision. Native-agent behavior remains
bounded by the explicit reuse/renewal rule above, with no fresh native pass
claimed by preparation.
