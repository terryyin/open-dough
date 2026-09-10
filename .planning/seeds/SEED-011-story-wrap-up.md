---
id: SEED-011
status: active
planted: 2026-09-10
planted_during: Human request for a highest-priority public Story Wrap-Up skill
trigger_when: After plan execution and its retrospective are complete
scope: bounded
---

# SEED-011: Story Wrap-Up

## Goal

A developer or product owner using Open Dough can close one completed story
with the next work correctly queued and a clean, organized, well-documented,
judgment-free current repository. Lasting knowledge is assimilated into the
product; the spent plan, story, execution, and impact history exist only in Git.
This supplies the missing closure step in the near-future direction's software
development lifecycle coverage.

## Stories

<a id="story-wrap-up"></a>

### 1. Story Wrap-Up

**Status:** Native acceptance complete on Codex, Cursor, and Claude Code
for [Quick 039](../quick/039-native-wrap-up-acceptance/PLAN.md). Source
includes post-v0.3.6 seedless-correction work and later wrap-up
clarifications exercised by that plan. Release of those later source
changes is not part of this acceptance.
**Working skill name:** `dough-story-wrap-up` (public Open Dough skill).

**Scope:** Deliver one manually invoked skill that closes one selected story
following completed plan execution and retrospective. Use the existing plan,
retrospective output when present, project conventions, and optional additional
human input. An empty retrospective result requires no extra artifact or input.

- Verify the selected execution and retrospective are complete. Consume their
  evidence before deleting it; unfinished work stays active.
- Apply supported product-review advice together with additional human input,
  with explicit human instructions taking precedence. Limit edits to relevant
  queue entries and canonical stories. Remove the completed item; put an
  existing follow-up plan's work first using a canonical story with an active
  plan link. Add other understood stories only when the review/input calls for
  them. Preserve unrelated order and the established near-future direction.
- Assimilate lasting behavior and design knowledge into maintained code, tests,
  and documentation. Describe the current product and its decisions without
  execution narratives, impact chronology, or retrospective judgments.
- Delete the spent plan, completed story section, related execution and
  retrospective records, proof, evidence, completion entries, and references
  preserving that history. This includes related historical occurrences in
  shared records such as `DearDough.md`; preserve unrelated content and active
  work. Delete empty containers. Keep active follow-up work self-contained.
- Leave no trace of the spent plan or story history in the current snapshot:
  no archive, tombstone, finished-list entry, replacement history summary, or
  broken live link. Ensure removed history is recoverable in Git before
  deleting its only copy, using ordinary project commit conventions. Keep
  maintained product tests; delete historical test-run artifacts.

**Consistency within this story:** Make the smallest changes to public source
skills and directly linked guidance that establish the same lifecycle:

| Participant | Required responsibility |
| --- | --- |
| Plan execution | Retain the completed plan and review evidence for retrospective and wrap-up. |
| Execution retrospective | Review and produce recommendations and any corrective follow-up plan; leave the plan and routine completion/backlog actions for wrap-up. |
| Story Wrap-Up | Apply review/input decisions, queue follow-up work, assimilate lasting knowledge, and delete spent artifacts/history. |
| Product backlog maintenance | Supply active-story and priority conventions consistent with deletion of completed history; retain standalone human-requested maintenance. |
| Shared planning/refinement cleanup guidance | Hand completed-story cleanup to wrap-up instead of retaining anchors, completion records, or prematurely trimming review inputs. |

Update affected descriptions, examples, references, and checks only where they
contradict these responsibilities. Keep slice delivery/refactoring and the
retrospective's review substance, skip options, and correction planning intact.
This story changes when historical records are removed, not the review's
ability to collect and use them before wrap-up.

**Key examples:**

- **No follow-up:** Given one completed plan and a finished retrospective with
  no actionable output, invoking wrap-up removes its queue entry, story, plan,
  and related history. Current product documentation remains useful, links
  resolve, and Git can recover what was deleted. Nothing replaces the history.
- **Follow-up and product advice:** Given a corrective follow-up plan and a
  recommendation to reprioritize another story, plus a human correction to
  that recommendation, wrap-up puts the follow-up first and applies the human's
  compatible decision. It removes the old execution history while preserving
  the active follow-up, unrelated stories, and direction. An unresolved product
  choice is reported rather than guessed; its needed context stays with active
  work, without requiring a new retrospective or discovery workflow.
- **Shared records and durable knowledge:** Given a shared seed and process log,
  wrap-up deletes only the completed story and its historical material, repairs
  affected references, and retains unrelated entries. Useful product knowledge
  appears in maintained documentation without the old story/plan identity or
  judgments about its execution. Repeating wrap-up adds no duplicate work and
  recreates no history.
- **Lifecycle boundary:** Walking execution → retrospective → wrap-up leaves
  the plan available through the first two steps and removes it only in the
  third. An unfinished plan or unfinished retrospective prevents closure. If
  deletion would lose the only copy of needed history, establish Git recovery
  before deleting it; do not manufacture a successful wrap-up result.

**Material exclusions:** No bulk cleanup of old stories, whole-repository
reorganization, unrelated refactoring, new discovery or decomposition, new
follow-up execution planning beyond consuming the retrospective's plan, or
execution of queued work. No scheduler, automatic invocation, new record
schema, cleanup engine, migration framework, audit ledger, history viewer,
Git rewriting, or cross-project workflow. Preserve release metadata and
current architectural decisions; removing story history is not erasing the
product's version identity or governing decisions.

**Remaining outcome:** Judged complete through [Quick 039](../quick/039-native-wrap-up-acceptance/PLAN.md)
on Codex, Cursor, and Claude Code. The implementation scope and examples
above described behavior to verify, not features to rebuild.

**Smallest remaining scope:** Reuse applicable integration and behavioral proof
before running fresh sessions. Exercise one representative closure journey per
host, assigning boundary cases by unresolved risk rather than repeating every
case on every host. Include the current seedless-correction lifecycle: queue an
existing correction directly, preserve recoverable provenance, avoid duplicate
queueing, and later close the completed correction by plan identity. Retain the
existing-feature-story variant. Verify unfinished execution or retrospective
prevents closure, shared content survives, and empty review output adds no
ceremony. Assess actual filesystem and Git outcomes, not success claims alone.

**Excluded from remaining work:** New wrap-up capabilities, redesign of the
lifecycle, unrelated retrospective/CI/adapter acceptance, release or adoption,
bulk repository cleanup, and a new test runner or acceptance framework. A
failure may receive the smallest correction needed for these existing promises;
a change to the promises requires story review. Missing host access leaves the
specific proof pending; it does not expand this story into host setup work.

**Completion:** Every included requirement has fresh native proof or justified
reuse for each affected host under ADR 0005. Results are judged while this story
is active. Retrospective and eventual wrap-up consume that evidence; this
acceptance work does not prematurely delete it or manufacture closure.

**Active plan:** [Native wrap-up acceptance](../quick/039-native-wrap-up-acceptance/PLAN.md).

**Architectural alignment:**
[ADR 0005, section 5](../../docs/adrs/0005-cross-tool-validation-accepted.md)
now requires judging active work and deleting spent evidence and assessment
records at wrap-up, with history recoverable through Git. Apply that decision
to the participating guidance; do not retain records for later judgment or
defer current acceptance decisions. Do not redesign native acceptance or waive
required proof.
[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) continues
to govern payload selection and immutable releases.

**Related work:**
[Retrospective product review](SEED-010-learn-from-execution-retrospectives.md#turn-execution-learning-into-product-backlog-decisions)
and [process recording](SEED-010-learn-from-execution-retrospectives.md#turn-retrospectives-into-learning-loop)
provide existing inputs. Reconcile their source guidance at the handoff and
cleanup boundaries; do not reopen their review or logging designs.

**Open decisions:** None. Native wrap-up acceptance is recorded in Quick 039.
The v0.3.6 exception remains historical release context for that tag, not the
passing proof. No new release is part of this work.

## Human-Owned Decisions

- Highest-priority public skill; working name Story Wrap-Up.
- Sequence: execute plan, complete retrospective, then wrap up.
- Incorporate optional human input and queue an available follow-up first.
- Consistency across participating skills belongs to this same story.
- Delete all spent-plan/story records, proof, evidence, and execution/impact
  history from the current snapshot. This supersedes the earlier finished-list
  and completion-record requirement. Git owns history; maintained product
  content carries lasting knowledge without historical narration or judgments.
- Keep other scope minimal so the coherent public increment can ship promptly.
