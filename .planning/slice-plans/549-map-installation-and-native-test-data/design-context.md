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

## Native identity check organization

Slice 3 extends `tests/native-evidence-identity.sh` (246 lines before the edit)
with its previously omitted real Take writer. Extract the writer inventory and
writer-loading/capture harness into `tests/support/native-identity-writers.bash`;
keep closure, membership, supervision and content-sensitivity assertions in the
main check. This cohesive setup/proof seam preserves the public check command
and all existing assertions while admitting the actual Take writer and its
new shared dependencies. Slice 3 owns the extraction and focused identity proof.
`take_run_native` directly invokes Claude and prints input hashes; it does not
use native-run-supervise or standardized result retention. Keep all existing
supervised-writer propagation checks, while checking Take's actual closure,
required inputs and content sensitivity. Do not invent a native policy change.

## Feedback proof organization

Slice 6 may separate `observedSessions` projection cases from the due-decision
support test when canonical launch/attempt composition expands it. Keep the
projection's complete assertions in a discovered support Node test, and retain
calendar/authorization/due-decision rules in the current due test. Both use the
same canonical builders; do not introduce local record/request/attempt models.
This cohesive producer/decision seam preserves all cases and the relevant
focused selection, and keeps edited files within 250 lines.

## Landed sibling reconciliation

At pinned trunk `49367c2e4d10ce1aeb96bb7a40512e585fa0bd8c`, the CI adapter/queue/
coverage sibling is accepted. Its `3a9a9bdbb` repair clears inherited outer CI
split/outcome/deadline settings from nested runner-split checks; slice 7 must
retain that repair with its new duration setup before broad proof. New CI
MakeMe imports also enter native dependency identity. Merge both published
histories in this owned checkout, preserving the uncommitted slice through an
owned patch/content backup, and renew affected proof on the combined candidate.

The merged `tests/test-data-architecture.md` is expected to be 257 lines (the
sibling's CI recipes plus this story's native topology correction). Extract the
cohesive CI proof/run/adapter/queue/coverage recipes to `tests/ci-test-data.md`,
keep their relative references and meaning, and link from the general data
architecture. Slice 7's independent refactor owns this required documentation
organization; no runtime or policy change and no new documentation authority.

## Terminal proof repair organization

The failing spec is 250 lines. Before or with its repair, extract its cohesive
withheld-outcome / controlled-page-clock startup harness to a test helper; keep
the three terminal journeys and independent assertions in the spec. Preserve
closing while launch status is starting, reopening and keyboard/focus outcomes.
Do not infer a reattachment from a late initial fake-host record. Diagnose the
causal observation before changing the assertion or narrowing its setup.

## Final accepted sibling integration

CI Proof closed at `a267a77fe3a09eaf19a3b4a5715ec94c7fd9e6c6` after
the dark-theme integration. CI Proof's attributable `c61170efd` extracts unchanged
figures helpers into `ciProofFiguresTestData.mjs` and adds explicit per-part
facts. Its default empty part map preserves prior construction; native writers
reach the new runtime module through MakeMe. Appearance adds five selected test
files and no installation/native/runner constructor. CI proof setup retains its
canonical builders and separate owner. The CI recipe extraction's links stay valid.

Subsequent trunk `34853dbe8874fdb501ec1d8d2072c25a128b9dc3` carries
SEED-296's closure and `4fda2d1ec`, a runner repair replacing Bash wait-any
reaping with worker completion records and slot events. Retain that repair and
renew the changed runner/deadline consumers before final slice acceptance.
Both published histories are merged; no published commit is rebased.

## Port check isolation repair

G8 retains the actual Vite config, dedicated-port/strictPort assertions and real
ephemeral-port HTTP observation. The test must own any generated dependency cache
and normal framework logging, preserving unexpected warnings/errors. Reuse the
existing private-cache/warn-log test-server approach where its responsibility
fits. This is harness isolation, not a product port or logging-policy change.
