---
id: SEED-426
status: active
planted: 2026-11-23
planted_during: Developer decision to replace completion-time ad hoc story creation
trigger_when: selected from the product backlog
scope: one story
---

# SEED-426 — Admit ad hoc work through the installed workflow

<a id="start-ad-hoc-work-under-a-story"></a>

### Admit ad hoc work through the installed workflow

**Identity:** SEED-426#start-ad-hoc-work-under-a-story
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/804-start-ad-hoc-work-under-a-story/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"aa4662eb541495475148a0bf8d1d928158ce9581fa827ac986d90a2774d8ba9b","plan":"f7f12e5b6d3aca59b7ef0bd845975fd8513ca806cb853307566cfb71bb866cb0"}}
```

**Goal.** A developer or workflow caller can establish an ordinary story
and Taken assignment before starting independent work, even when the project
has no seeds or loses the publication response.

**Scope.** Use the installed execution-start admission for a workflow-owned
draft and its retained attempt. Publish the canonical story and Taken
together, preserve unrelated checkout changes and queued order, and recover
the same accepted claim. On a definitively conflicting local candidate,
preserve it and allow a retry in the same verified clean worktree. Refuse
ambiguous ownership and keep the candidate and checkout recoverable. Keep
ordinary originating-checkout admission, accepted start and completion.

**Examples.** On an empty bare origin, the first admission creates one seed
and one Taken assignment. An interrupted reply resumes the same published
claim. A losing verified candidate can be preserved and replaced in the
same worktree, while a dirty or unrelated checkout is refused unchanged.
The admitted story can finish through the installed ordinary workflow.

**Split.** Dashboard launch, session lifetime, review and the production
migration moved to [Finish story-linked ad hoc sessions in the Dashboard](SEED-432-finish-story-linked-ad-hoc-sessions.md#finish-story-linked-ad-hoc-sessions).
They keep their single production cutover.
