# Keep standalone manual testing on a stable temporary work branch

## Source

[SEED-004 Story 23](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#run-standalone-manual-testing-in-isolated-execution),
first in the product backlog and refined on 2026-09-17.

## Goal and scope

A developer running standalone, checkout-bound manual testing gets one stable
temporary Git branch and worktree from preparation through observation, resume,
and safe cleanup, without changing the originating checkout.

Include the standalone workspace identity, reuse on resume, caller-supplied
checkout precedence, and safe cleanup or exact retention reporting. Exclude
plan execution, backlog transitions, commits or publication, trunk integration,
CI and retrospective work, diagnosis or repair, permanent test changes, external
service/data isolation, a general workspace manager, release, and adoption.

Assume the target is a Git repository with ordinary worktree support. Existing
project naming, location, and safety conventions remain authoritative; missing or
unsafe setup stops the session without modifying the originating checkout.

## PFE and decisions

Change `dough-manual-testing` directly: it already owns preparation, isolation,
cleanup, and temporary artifacts. Plan execution has similar Git mechanics but a
different implementation-and-delivery lifecycle, so coupling the two would add
the wrong responsibility. Keep the conventional skill self-contained; add no
shared workspace abstraction, reference file, North Star topic, or per-tool copy.

[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one concise runtime source written for the executing project.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) requires a
representative behavior review for this skill change, while existing shared
installation evidence remains reusable; routine per-tool native discovery is not
a gate for this conventional edit.

## Outside-in proof

All promises belong to Slice 1:

- A standalone request with no supplied checkout creates its temporary branch and
  worktree from a verified revision before checkout-bound preparation; the
  originating checkout remains unchanged.
- An interrupted session verifies and reuses that recorded workspace on resume.
- A caller-supplied or already-owned checkout is reused without nesting another
  workspace.
- Normal completion removes owned temporary state and the clean workspace;
  unsafe cleanup preserves and reports its exact identity.
- The guidance does not claim isolation of shared accounts, services, databases,
  or other external test state.

Proof: review the final runtime guidance against those five cases, inspect the
diff for concise direct instructions and preserved manual-testing behavior, then
run `npm run lint` and `bash tests/install-all-tools.sh` to verify formatting and
that the shared source still installs through the existing payload mechanism.

## Ordered slices

### 1. Keep one stable workspace for standalone manual testing
Type: Behavior
Status: planned
Proof: the outside-in review and focused commands above pass.

Behavior: Given a standalone manual-testing request that needs a project
checkout and supplies no checkout, when preparation begins, the agent creates
one temporary branch and worktree from a verified revision, uses and reuses that
workspace for the session, and removes it only when cleanup is safe; the
originating checkout remains unchanged. Existing workflow-owned or explicitly
selected checkouts remain in place without nesting.

Implementation boundary: revise the shared `dough-manual-testing` source and
only directly affected inexpensive proof. Preserve its current mission,
exploration, reporting, and no-repair rules. Do not hand-edit installed managed
copies or add machinery for hypothetical workspace consumers.

Safe stopping point: standalone manual testing has the promised stable temporary
workspace lifecycle, with the existing testing behavior and other workflows
unchanged.

No new native cross-tool run is planned unless implementation changes a shared
integration mechanism or the representative behavior review is inconclusive.
