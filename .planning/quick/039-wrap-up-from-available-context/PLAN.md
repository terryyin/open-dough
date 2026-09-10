# Wrap up work on the coordinator's retrospective decision

## Source and goal

[SEED-010 Story 7](../../seeds/SEED-010-learn-from-execution-retrospectives.md#prove-retrospective-completion-without-redundant-plan-ceremony).
Status: source complete, 2026-09-11. Slice delivered on
`worktree-quick-039-wrap-up-from-available-context`. Native acceptance remains
pending in Story 2.

Close completed planned or planless work using available execution context,
lasting knowledge, and existing follow-ups. The coordinator owns lifecycle
sequencing; retrospective output supplies optional advice to wrap-up.

## Scope and current decisions

The human selected removal of the retrospective-completion check and a useful
fallback when retrospective output is absent. Delete the obsolete requirement
from runtime guidance. Write the resulting positive workflow directly; keep
migration rationale in planning material. The invoking agent needs only the
current procedure, not a description of a removed gate.

Wrap-up resolves the selected work, establishes execution completion, assimilates
lasting knowledge, handles existing follow-ups and authorized product decisions,
and preserves Git recovery before cleanup. Use a plan when present; planless
feature work supplies its story, changes, and execution results. Keep the
existing bounded-correction identity contract. With retrospective advice, apply
it under existing authority; with absent or empty advice, perform closure using
the other available inputs. Concrete execution, attribution, and recovery gaps
retain their existing preservation behavior.

Primary source: `src/skills/dough-story-wrap-up/SKILL.md` and its recognition
record. Inspect `src/skills/dough-execution-retrospective/SKILL.md`, its recognition
record, and directly linked lifecycle references for assumptions that contradict
this flow; change only actual contradictions. Retrospective's review contents
and ordinary reporting remain outside this change. Keep installed managed copies
at their released version.

Deferred: quick execution, retrospective-content redesign, actual cleanup of
this or another story, release, installation, adoption, new orchestration or
completion-record machinery. Native acceptance belongs to
[SEED-010 Story 2](../../seeds/SEED-010-learn-from-execution-retrospectives.md#use-released-retrospective-log).

Relevant Accepted decisions:

- [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  source changes remain distinct from released and installed guidance.
- [ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  use representative local authoring review; assign changed native requirements
  to Story 2 and keep missing proof pending before release.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one shared behavioral source, direct current-workflow language, and project
  context resolved in the executing project.

## Ordered slices

### 1. Close completed work using available execution context
Type: Behavior
Status: done
Evidence: RECOGNITION.md Quick 039 walkthrough (Variants A–H);
`git diff --check`; frontmatter and relative-link check. Delivered on
`worktree-quick-039-wrap-up-from-available-context`. CI observer: unavailable
(Cursor host hook did not add `CI_MONITOR_READY`; pendingCi unobserved).

Behavior: Given selected completed work and the coordinator's wrap-up invocation,
when wrap-up reads the available execution context and optional retrospective
advice, it carries out supported closure, preserves active follow-ups and Git
recovery, and reports the actual outcome.

Remove the retrospective-completion prerequisite throughout wrap-up's description,
context resolution, completion judgment, and conditional actions. Make execution
context appropriate to planned and planless work. Express absent-review fallback
in the same closure flow. Existing follow-ups are handled by their presence,
including when retrospective advice is absent. Align current recognition text
and any directly conflicting lifecycle references with that behavior.

Proof: One local authoring walkthrough of the wrap-up invocation boundary, using
a small completed feature story with a maintained product fact, a recoverable
revision, and a queue entry. Vary the available context as specified below.
Inspect the resulting closure decisions and proposed edits using AGENTS.md's
invocation-context, required-context, and useful-outcome review. Keep all
walkthrough content isolated from actual story cleanup. Record decisive inputs,
observations, candidate revision, and limitations in the recognition record.
This is authoring evidence; native acceptance remains pending in Story 2.

| Input variant / owned promise | Observable result |
| --- | --- |
| Completed plan and available review advice | Closure uses execution evidence and applies authorized applicable advice |
| Completed planless story with changes and execution results | Closure resolves work and recovery using that supplied context |
| Completed work with retrospective output absent | Ordinary closure assimilates known product facts and handles the selected queue entry |
| Empty retrospective result | Same ordinary closure outcome |
| Absent review with existing active correction plan | Follow-up is preserved and queued through its existing canonical home before predecessor cleanup |
| Incomplete implementation | Affected active work remains intact; report identifies unfinished implementation |
| Unresolved attribution or Git recovery | Affected material remains intact; report identifies the actual gap |
| Changed description, body, examples, and linked references | Current workflow is coherent and positively stated; obsolete completion check is deleted |

Verify maintained knowledge, recovery-before-deletion, and unrelated-work
preservation in the same walkthrough. Reuse the existing bounded-correction
contract as a preservation case rather than designing a new planless correction
format. Review frontmatter and changed relative links, and run `git diff --check`.
Mechanical searches can locate stale language but are not behavioral proof.

Safe stopping point: the source workflow and recognition describe the same
usable closure behavior; local review is complete and native acceptance remains
explicitly pending. Keep this plan and source story for later lifecycle work.

Sizing: high confidence in one cohesive guidance change with one walkthrough
loop and context variants. Implementation, local review, and slice-local cleanup
belong together. There is no supplied numeric target, hard limit, or overrun
threshold. No infrastructure or storage experiment is implicated.

## Execution and delivery context

This plan uses `.planning/quick/NNN-<slug>/PLAN.md` with planned, in-progress,
and done slice statuses. No active plan for this story was found; 038 was the
highest allocated directory when this plan was created. Planning leaves the
story under Backlog list. Execution, when authorized, follows `dough-execute-plan`
for taking the item, independent post-change refactoring, coordinator-owned
proof review, commit/push, and asynchronous CI handling. Preserve pre-existing
edits to the backlog and both story seeds.

The repository provides `npm run format` and `npm run lint`, backed by
`scripts/lint.mjs`; formatting currently targets JavaScript/JSON and shell files,
not Markdown. No `core.hooksPath` is configured; only sample Git hooks are
present. Delivery uses `git diff --check` as the Markdown whitespace check and
`npm run format` once (no-op on this Markdown-only change). There is no
check-only commit hook to run independently. Authorized push destination is
`origin` (`git@github.com:terryyin/open-dough.git`) branch
`worktree-quick-039-wrap-up-from-available-context`. Workflow `ci.yml` / `CI`
is push-triggered. Guidance-only verification is the local behavior review plus
focused Markdown checks above; installer/update suites and new test
infrastructure are outside this change.

## Cumulative design assessment

One rule covers every example: wrap-up acts on available execution context;
retrospective advice augments those actions when present. Plan presence changes
where execution context is found, not the closure procedure. Review absence and
empty output exercise the same fallback. Existing active-work and recovery rules
remain common to all variants. A separate deletion slice or fallback slice would
leave the same workflow partially changed, so they remain one Behavior slice.

No slice-specific decomposition or cumulative-design concerns were identified
in this assessment. A separate refinement pass was not invoked. Delivery
configuration above remains an execution-time resolution item, not an extra
product slice.

## Learnings

- Wrap-up's linked lifecycle sources (retrospective, execute-plan, planning
  cleanup, product-backlog) already separate review, delivery, and closure; they
  did not restore the removed retrospective-completion gate, so they were left
  unchanged.
- Cursor CI host-bridge readiness was missing in this coordinator session
  (`CI_MONITOR_READY` not added). Execution continued without promised observation.
