# Separate bug exploration from repair execution

## Source

[SEED-008 Story 6](../../seeds/SEED-008-worktree-branch-trunk-sync.md#separate-bug-exploration-from-execution),
first in the product backlog and refined on 2026-09-18.

## Goal and scope

A developer reporting a bug gets one stable, disposable workspace for
standalone checkout-bound investigation, while any later repair starts through
`dough-execute-plan` in a separately owned execution workspace from the
applicable state integrated into `main`.

Include caller-owned checkout precedence; temporary branch/worktree creation,
identity, resume, and safe cleanup; exploration-only bug investigation; safe
preservation and local `main` integration of authorized durable story, plan, or
planning-evidence artifacts; and the handoff to a fresh execute-plan workspace.
Preserve current report gathering, the ten-minute bounded-repair decision,
reproduction quality, backlog routing, no-change result, and execution/refactor
obligations except for the sequencing required to close exploration before
repair.

Exclude a general workspace manager, new skill, state registry, configuration,
per-tool copy, automatic planning authority, remote publication or push, CI or
retrospective changes, external account/service/database isolation, changes to
`dough-execute-plan` workspace semantics, and changes to manual-testing
behavior. Temporary reproduction artifacts remain evidence rather than product
changes integrated into `main`.

Assume ordinary Git branch/worktree support and a resolvable local integration
checkout for `main`. Existing project naming, location, commit, merge, and
safety conventions remain authoritative. Unsafe or ambiguous integration,
rebase, or cleanup retains the exact exploration identity and blocks repair.

## PFE and decisions

The suitable existing solution is the standalone workspace lifecycle delivered
for `dough-manual-testing` in `2df8c8e`: caller-supplied checkout precedence,
one verified temporary branch/worktree identity, reuse on resume, an unchanged
originating checkout during exploration, and safe cleanup or exact retention.
Its completed plan explicitly rejected a shared abstraction while manual
testing was the only proven consumer. Standalone bug exploration is now the
second consumer with the same domain meaning, so modularize that lifecycle into
`dough-manual-testing/references/exploration-workspace.md` and link both skills
to it. Keep artifact integration and execute-plan handoff solely in
`dough-bug-fixing`; do not generalize the shared reference beyond exploration
workspace ownership.

Use one Behavior slice. The focused extraction is necessary inside the same
proof loop that makes bug investigation use the lifecycle; a separate Structure
slice would deliver no independently evaluable outcome. Keep the shared
lifecycle authoritative in the reference, brief caller-specific transitions in
each skill, and the managed-payload declarations synchronized so installed
links resolve.

[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires recoverable work, timely integration, and inexpensive changes of
direction. [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one shared runtime source, concise skills, and only necessary delivery
detail. Established structure and those decisions are sufficient; no North Star
topic or ADR change is warranted. ADR 0007 remains Proposed and is not planning
authority.

## Outside-in proof

All promises belong to Slice 1:

- A standalone checkout-bound bug investigation with no established checkout
  creates and retains one temporary branch/worktree identity before exploration,
  then starts an authorized repair only after that workspace is safely closed.
- Authorized durable story, plan, or planning-evidence artifacts are committed
  on the exploration branch, integrated into local `main`, and followed by the
  requested rebase and safe cleanup before later execution starts from updated
  `main`.
- A supported no-change result removes a safe temporary workspace without
  creating planning or execution artifacts.
- Interruption, ambiguity, dirty state, or failed integration/rebase/cleanup
  preserves and reports exact identity and evidence and starts no repair.
- An established checkout is reused without nesting, and manual testing retains
  its existing preparation, resume, external-state boundary, and cleanup
  behavior through the same authoritative reference.

Proof: review the final runtime guidance against those five cases and inspect
the complete diff for one shared lifecycle owner and bug-only integration and
handoff rules. Run `git diff --check`, `npm run lint`, and
`bash tests/install-all-tools.sh`; verify the new reference is declared in the
installer, release payload comparison, public-payload fixture, and installation
documentation and is installed identically for supported tool roots. Do not add
exact-prose assertions, a workspace manager test harness, or a native tool
matrix for this conventional shared-guidance change.

## Ordered slices

### 1. Investigate standalone bugs in a disposable workspace before repair
Type: Behavior
Status: planned
Proof: the outside-in behavior review and focused commands above pass.

Behavior: Given a standalone bug report that needs checkout-bound investigation
and has no established checkout, when the agent investigates and selects a
supported disposition, it uses one recoverable temporary branch/worktree,
preserves and integrates any authorized durable planning artifacts before safe
cleanup, and starts any later repair through `dough-execute-plan` in a different
execution workspace. Existing workflow-owned checkouts are not nested, and
manual testing retains the same workspace behavior.

Implementation boundary: extract only the proven exploration-workspace
lifecycle from `dough-manual-testing` into its focused reference; link both
skills to it; revise `dough-bug-fixing` only enough to separate exploration,
durable-artifact integration, and execute-plan repair; and add the reference to
the existing payload declarations and documentation. Do not edit installed
managed copies, alter unrelated bug-routing semantics, or add machinery for
hypothetical workspace consumers.

Safe stopping point: standalone bug investigation is recoverable and
disposable, current manual testing behavior has one authoritative source, all
installed links resolve, and repair remains wholly owned by a separate
execute-plan workspace.

No separate Structure slice is justified: the extraction and adoption are one
small cohesive behavior change with one outside-in review and installation
proof loop.
