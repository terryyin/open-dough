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

See [promise ownership and required local/native gates](proof-gates.md).

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
Status: done
Accepted proof: [slice 2](slice-2-proof.md).
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
Status: done
Accepted proof: [slice 3](slice-3-proof.md).
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
Status: done
Accepted proof: [slice 4](slice-4-proof.md).
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
Status: done
Accepted proof: [slice 5](slice-5-proof.md).
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
Status: done
Accepted proof: [slice 6](slice-6-proof.md).
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
Status: done
Accepted proof: [slice 7](slice-7-proof.md).
Additional traced consumers: `test-runner-{split,failure-report,budget,interrupt}.sh`,
`ci-test-times.sh`, deadline continuation/cutoff support cases and the dashboard
invalid-share precondition. G4/G5 own their semantic facts; parser/refresh bytes stay explicit.
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

See [retained execution and observation identity](execution-context.md).

## Story obligations

### G1. Dependency scanner reads a documentation example as an import
Reported: slice 1 — "Including the actual scanner in hashed inputs exposed its comment example as a nonexistent executable dependency."
Story clause: "A changed fixture dependency must enter its evidence identity"
Disposition: proved by slice 1: slice-1-proof.md, scanner regression and real identity continuation.


### G2. Native guard also arranges valid host settings
Reported: slice 2 — "Coordinator inspection of guard_write_codex_existing_hooks after slice 2 found another ordinary Codex settings constructor alongside the known guard backlog setup."
Story clause: "Convert remaining arranged release, payload, host-hook settings, native starting project and runner-duration facts through the shared MakeMe entry point"
Disposition: proved by slice 3: slice-3-proof.md; real guard installs, preserved handlers and equivalent settings.

### G3. Native locked fixture materialization followed installation
Reported: slice 5 — "The first converted probe encountered EISDIR while reading an installed local dependency symlink; the new fixture lifecycle must materialize before installing."
Story clause: "Preserve the actual originating checkout, worktree topology, executable inputs and preparation observations"
Disposition: proved by slice 5: slice-5-proof.md; exact four-profile equality and real readiness observations.


### G4. Ordinary CLI duration baselines remain arranged literals; later inspection also found the zero-median Map
Reported: slice 7 — "Coordinator inspection found test-shares allocation and preview baselines drive duration/median output rather than exact input syntax; these facts need the shared builder while emitted TSV stays unchanged."
Story clause: "Convert remaining arranged release, payload, host-hook settings, native starting project and runner-duration facts through the shared MakeMe entry point"
Disposition: proved by slice 7: slice-7-proof.md; actual duration Maps, zero fallback, three CLI baseline byte comparisons and independent allocations.

### G5. Ordinary duration facts in runner harness and deadline preconditions
Reported: slice 7 — "Targeted read-only research found ordinary synthetic timings in split, failure-report, budget, CI test-times, interrupt, deadline continuation/cutoff, and the dashboard invalid-share precondition; exact parser/refresh examples remain separate."
Story clause: "Reconcile remaining setup across the five declared test entries and the separately discovered `tests/support/*.test.mjs` jobs"
Disposition: proved by slice 7: slice-7-proof.md; all traced shell/deadline duration consumers, 16 exact file-boundary comparisons and final full suites.


### G6. Accepted sibling landings change native dependencies and inventory
Reported: slice 7 — "While full gates ran, CI Proof and dark-theme closures landed at a267a77fe; a later deadline-reaping repair landed at 34853dbe. Native input closure, duration-runner proof and current inventory need reconciliation before delivery."
Story clause: "A changed fixture dependency must enter its evidence identity"
Disposition: proved by slice 7: slice-7-proof.md; accepted sibling integration, current inventory and renewed native/runner proof.

### G7. Full dashboard run compares unsettled attach history

Reported: slice 7 — "The full dashboard run failed agent-launch-ad-hoc-terminal.spec.ts:214: its post-Close count was zero, then one attach ended by SIGHUP was observed after launch release while the panel stayed closed. A late initial record is the diagnosis hypothesis."
Story clause: "the existing independent behavioral proof intact"
Disposition: proved by slice 7: slice-7-proof.md; causal socket observation, independent native mapping, 19 focused tests, six race observations and successful full dashboard renewal.

### G8. Dedicated-port check leaks cache-dependent Vite info
Reported: slice 7 — "Renewed full repository run failed only dashboard-dev-port.test.mjs as passed-but-printed-output: Vite reported Re-optimizing dependencies because vite config has changed. Its assertions passed, but the test uses the shared default cache and normal logger."
Story clause: "the existing independent behavioral proof intact"
Disposition: proved by slice 7: slice-7-proof.md; private cache/normal-info isolation, unchanged real port/HTTP assertions, focused proof and final full repository exit0.

### G9. Released acceptance gate kept an unnecessary API transport
Reported: slice 7 — "CI repair: Run 42862962650 attempt 1 failed responsive-session-start-codex: route.fetch socket hang up preceded teardown; the empty Taken-card assertion followed cleanup. The released helper still proxied continuation POSTs through APIRequestContext."
Story clause: "the existing independent behavioral proof intact"
Disposition: proved by slice 7: slice-7-proof.md; primary trace timing, original-fails/repaired-passes control and all seven actual Codex/Claude caller cases.

## Execution complete

Product advice: no change.
