# Make installation and native test setup map directly to the domain

**Identity:** SEED-261#map-installation-and-native-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-installation-and-native-test-data)
**Source review:** [Source-only commitments](source-review.md)

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

See [Existing solutions and current decisions](design-context.md).
See [coverage inventory](coverage-inventory.md) for additional native guard and
admission-plan consumers, duration proof, exclusions and sibling ownership.

## Preparation evidence and decisive premises

See [Preparation evidence and decisive premises](preparation-evidence.md).

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
Status: done
Accepted proof: [slice 1](slice-1-proof.md).
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

## Execution context

Established Story Branch execution in this worktree on
`codex/make-installation-and-native-test-setup-map-dire`, publisher
`dashboard-territory.local-open-dough`, agent DavidKo-chan. Claim
`b26709dafe4a51e801ce1a4f34019d7ebeb6fbe3` accepted on `origin/main`;
starting revision `5deb0028f6b023eaa7a2d19c2a3e76bb31685cbe`.
Readiness remains changed since review; selected scope matches the retained plan.
No numeric slice limit or explicit overrun-replanning selection was supplied.
Locked npm setup and Chromium prerequisite command passed here on 2026-11-10
using Node 24.21.0; no mutable dependency state was copied.
CI source: GitHub Actions `terryyin/open-dough`, verified `ci.yml` / `CI`.
Observer: coordinator `seed261-install-davidko`, directory
`/tmp/dough-ci-501/watch-Q3D5st`, PID 47583, session 54844, yielded cell
`g1103:14`, bound to the execution branch. Claim trunk CI remains unobserved.

## Story obligations

### G1. Dependency scanner reads a documentation example as an import
Reported: slice 1 — "Including the actual scanner in hashed inputs exposed its comment example as a nonexistent executable dependency."
Story clause: "A changed fixture dependency must enter its evidence identity"
Disposition: proved by slice 1: slice-1-proof.md, scanner regression and real identity continuation.
