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

## Execution context

- Story Branch Mode from claim commit `15ca615`.
- Originating integration checkout: `/Users/terryyin/git/open-dough`, branch
  `main`. Execution checkout: `/tmp/open-dough-056.o4TIt8/worktree`, branch
  `codex/quick-056-bug-exploration-workspace`. Integration target: local and
  remote `main` through ordinary story wrap-up.
- Replanning remained allowed; no overrun or story-scope change occurred.
- CI source: GitHub Actions workflow `ci.yml`, display name `CI`, observing the
  pushed execution branch through Codex observer directory
  `/tmp/dough-ci-501/watch-B3zVUb`, PID `45853`, cell `59`.

## Ordered slices

### 1. Investigate standalone bugs in a disposable workspace before repair
Type: Behavior
Status: done
Proof: the outside-in behavior review and focused commands above pass.

Accepted proof:

- Inspected `src/skills/dough-manual-testing/references/exploration-workspace.md`
  as the single owner of checkout precedence, temporary branch/worktree
  identity, resume verification, external-state boundaries, and safe cleanup
  or exact retention. Both callers link to it; manual testing preserves its
  prior behavior while bug fixing retains only its distinct sequencing.
- Inspected `src/skills/dough-bug-fixing/SKILL.md` against all five examples:
  standalone exploration precedes repair; no-change closes without execution;
  larger or inconclusive work preserves and locally integrates only authorized
  planning artifacts; unsafe closure blocks repair with exact retained state;
  and workflow-owned checkouts are reused without nesting.
- Inspected all four managed-payload declarations/documentation locations. The
  new reference is installed in supported roots and included in release
  comparison. No managed installed copy was edited.
- `git diff --check` — pass.
- `npm run lint` — pass, including after the post-change refactor.
- `bash tests/install-all-tools.sh` — pass; disposable supported roots received
  matching payload bytes and the update/repair cases completed.
- `bash tests/compare-payload.sh` — pass; tagged release comparison and mismatch
  behavior retained their expected signals.
- Post-change refactor: `## REFACTOR COMPLETE`. It removed repeated caller
  detail, preserved the proof boundaries, and left every changed file at or
  below 250 lines.

Outcome: delivered one authoritative exploration-workspace reference, preserved
manual-testing behavior through it, and made bug fixing close standalone
exploration before separate repair execution. Durable planning artifacts use
the requested local-main integration, rebase, and safe-cleanup handoff. Payload
declarations and installation documentation now deliver the reference.

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
