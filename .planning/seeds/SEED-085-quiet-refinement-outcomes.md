---
id: SEED-085
status: active
planted: 2026-10-03
planted_during: Maintainer request to streamline preparation starting with refinement
trigger_when: Refinement needs a clear next step without unnecessary human acknowledgement
scope: unestimated
---

# SEED-085: Streamline preparation starting with refinement

## Why This Matters

Developers want refinement to follow “no news is good news”: when no human
acknowledgement or decision is needed, leave a useful result without adding
another approval interaction. Start streamlining with refinement.

## Stories

<a id="quiet-refinement-outcomes"></a>

### Finish refinement quietly with a clear next step or explicit human response

**Identity:** SEED-085#quiet-refinement-outcomes
**Slice plan:** [Quiet refinement outcomes](../slice-plans/223-quiet-refinement-outcomes/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/223-quiet-refinement-outcomes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"fa644c0d6d8edbf4f59f63de871f86c7c8f10ca335358020a9ca5e6c8d7c313d","plan":"635d2d4ed4d7c91377335821a188608b90d702a7028fe41505a59858bbe7ad01"}}
```

**Goal:** A developer who finishes refining a story learns at once whether it
is ready for slice planning, flawless and ready for execution, or waiting on
specific human responses, and is asked to engage only in the last case. This
starts “no news is good news” for preparation at refinement, so routine
success no longer costs an acknowledgement round trip.

**Scope:**

- Every Story Refinement session ends each selected story with exactly one of
  three outcomes, on all three hosts, for direct and dashboard-started
  sessions, ordinary and one-shot alike:
  1. **Ready for slice planning** — goal, scope, and key examples are recorded,
     no human decision remains, and the work needs planned execution.
  2. **Flawless — ready for execution** — the same, and the story also
     qualifies to skip slice planning: one coherent outcome that fits a single
     planless slice under the project's slice sizing, with no decisive premise
     left unobserved and no needed probe.
  3. **Needs human engagement** — at least one response is required from a
     person: an unresolved goal, scope, or constraint decision; a boundary
     change such as splitting, merging, or dropping the story; missing required
     context; or a stopped write, recording, or landing. Missing context or a
     stop that blocks recording the seed still ends here, not as a silent
     failure.
- A ready outcome states the outcome, the story link, where the draft is, and
  one concrete next step (for example, slice planning in the same workspace,
  or execution with an explicit skip-planning instruction). It does not recap
  what the seed already records and ends without a question or approval
  request.
- A needs-engagement outcome lists each expected response separately: what
  must be answered or decided, who decides, a recommended answer where one
  exists, and what continues once it is given. It claims no readiness.
- Ordinary refinement keeps its current disposition: the seed edits and
  recorded facts stay uncommitted in the owned workspace, and any published
  Preparing assignment stays until an explicit keep, discard, or abandon.
  The ready outcome names this pending draft as information, not as a keep
  prompt. One-shot refinement keeps its committed result: review mode reports
  the outcome with that commit for review, and auto-land lands only on a
  ready outcome, exactly as today when no decision remains.
- “Flawless” is the refining agent's judgment, reported in prose. Refinement
  still records `refined` with an unselected approach and grants no planless
  authority: `planless` requires an explicit human or parent instruction to
  skip planning, which the next-step command supplies when the developer runs
  it.
- When several stories are refined together, report one outcome per story.

**Constraints:** Readiness does not authorize planning or implementation
([Story Refinement](../../src/skills/dough-story-refinement/SKILL.md); planless
authority in
[record preparation facts](../../src/skills/dough-product-backlog/references/record-preparation.md#planless-authority)).
Recording `planless` or `ready` from the flawless judgment alone is rejected.
Boundary changes stay human decisions under the refinement planning reference.

**Deferred promises:** No dashboard-visible “flawless” state or new
story-state value. No automatic dashboard session Done for refinement
sessions; [SEED-008's quiet completion](SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration)
covers Land and Wrap Up, and refinement may adopt its completion operation
later. No change to slice planning or slice-plan refinement reports, and no
automatic continuation into planning or execution.

**Related work:** [SEED-066](SEED-066-composable-lightweight-session-options.md)
owns one-shot workspace and landing choices; this story only adds the outcome
those sessions report. Neither is a prerequisite.

**Key examples:**

1. A queued story with clear scope that needs several slices is refined from
   the dashboard → the seed and recorded facts stay uncommitted in the
   workspace → the session ends with “Ready for slice planning,” the story
   link, the workspace, and the slice-planning next step, with no question.
2. A one-line wording correction story has clear scope, one planless slice,
   and no open premise → “Flawless — ready for execution” with the
   skip-planning execution command as the next step; the story state still
   shows `refined` with an unselected approach.
3. Refinement finds that the story's scope depends on whether removed guidance
   must remain readable → “Needs human engagement” names that decision,
   recommends an answer, and states that slice planning can follow once it is
   answered; no ready outcome is reported.
4. Refinement concludes the story holds two independent outcomes → “Needs
   human engagement” proposes the split and asks for that boundary decision
   instead of reporting ready.
5. One-shot refinement with auto-land leaves an open decision → the result
   stays committed and unlanded, and the outcome is “Needs human engagement”
   listing that decision.
6. The recorder refuses the story-state write → “Needs human engagement” names
   the refusal and what the developer must resolve.

## Breadcrumbs

- Terry's 2026-10-03 request: capture this as the second queued story; start
  streamlining at refinement; follow “no news is good news”; use the three
  outcomes above and discover omissions during refinement.
- 2026-10-03 refinement: added stopped refinements and boundary changes to
  the human-engagement outcome; defined “flawless” against planless sizing and
  authority; deferred dashboard session closure to SEED-008's mechanism.
- [Product backlog](../PRODUCT-BACKLOG.md).
