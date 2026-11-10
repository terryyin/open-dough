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
