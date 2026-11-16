---
id: SEED-391
status: active
planted: 2026-11-16
planted_during: Terry asked for an A/B check of the unreleased test-focus and refactoring guidance before the next release
trigger_when: selected from the backlog, before the release that would carry the guidance
scope: one story
---

# SEED-391 — Check the test-focus guidance by redoing a story

<a id="redo-the-effort-story-under-the-test-focus-guidance"></a>

### Redo the effort story under the test-focus guidance

**Identity:** SEED-391#redo-the-effort-story-under-the-test-focus-guidance
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9d14096ea2a337a294b9f544518cc4c9c8ed1d65660230cb1dbe5dc8d6096a21","plan":"2903474ba2a525823ff1bbde4e4e96a3e107ce7b392aa5c2e624ee0595fb496c"}}
```

#### Goal

An Open Dough maintainer can decide, edit by edit, whether the guidance in
`934a51a30` ("Guide tests to observe only their own subject") is ready to
release, from what it changes when the effort story is prepared and executed
again. The story's outcome is that evidence and a recommendation per edit;
revising the guidance is Terry's step afterwards.

The five edits and the moment each is expected to act:

| Edit | Guidance file | Moment in the rerun |
| --- | --- | --- |
| Shotgun surgery accepts only tests whose subject is the concept | `dough-post-change-refactor/references/refactor-checks.md` | Slice 1 refactor pass meets tests edited for effort that are not about effort |
| A test asserts what its name promises; one reader in test support; a branching parameterized body is separate tests | same file, reached by implementers through `dough-execute-plan/references/test-entry-rules.md` | Slice 1 implementer and refactor pass edit or add launch assertions |
| An oversized candidate is returned as a named follow-up and carried into wrap-up | `dough-post-change-refactor/SKILL.md`, `dough-execute-plan/references/deliver-the-change.md` | Slice 1 refactor return, then the plan's learnings at execution completion |
| The refactor brief states facts, including the count of tests edited outside the subject, and leaves remedies to the pass | `dough-execute-plan/references/deliver-the-change.md` | The coordinator's slice 1 refactor brief |
| Many consumers failing on an effect that is not their subject get a Structure slice ahead of the change | `dough-story-refinement/references/executable-proof.md` | Slice planning of the effort story |

#### Scope

**A, the delivered run.** SEED-388#show-the-effort-a-launch-runs-with ran under
the released guidance (0.3.102) from its Take `4b75c2888` to `eda73008b`, and
recorded execution completion at `c741f265f`. Outside planning records it
changed 43 files, 31 of them tests, 26 of those in slice 1 (`535898511`).
About 23 of the tests were not about effort: they compared whole `claude`
command lines, fixed positions and counts. Its repair added new positional
assertions and a looped test that branches on its case. The slice 1 refactor
pass saw the repeated expectations, accepted them under the shotgun-surgery
check, and made two comment-only edits. The coordinator was session
`fa9d77b7-c44c-4f51-9e03-d7b0073a5c6e` on `claude-opus-5-5` at `medium`
effort with 20 subagent transcripts; its brief, returns, active time and cost
are read from that transcript. Nothing is rerun for A.

**B, the execution rerun (Codex first).** Terry authorized “can we do codex
first?” after the Claude launch refused the scratch directory on 2026-11-16.
The first execution and planning replay now use Codex with its configured
model and effort, recorded from the launched sessions. The refused Claude
attempt is retained; the matched Claude replay remains pending its trust
prerequisite after this Codex-first run. One fresh Codex session executes
`.planning/slice-plans/664-show-the-effort-a-launch-runs-with/PLAN.md` as it
stood at A's Take `4b75c2888` (`3b1479996` plus the backlog claim), through
its execution-complete record. It stops there: no wrap-up, retrospective or
landing.

- *Historical guidance patch.* The scratch workspace is `4b75c2888` with only the
  `934a51a30` patch applied to its installed skill copies (`.agents/skills`
  and `.claude/skills`). Between `3b1479996` and that commit the skill source
  changed in 19 other files (slice clock, diagnosis rounds and others), so
  installing the whole current source would change more than the guidance
  under test. Codex is a second changed factor versus A, so this first run
  tests guidance mechanisms across hosts rather than isolating its effect.
  Three of the four
  patched files are unchanged since `3b1479996`; `executable-proof.md` differs
  by one line outside the patched paragraph.
- *A session that does not know the comparison.* The coordinator's own brief is
  one of the observations, so B's session receives the instruction A's session
  received, with the scratch workspace and revisions in place of A's, without
  its dashboard reporting context and without publication authority, and
  nothing from this seed, A's result, or the later test repair `0724558d6`.
  Its workspace history ends at the patched Take. Codex uses its configured
  defaults; no Claude model, effort or memory is represented as equivalent.
  Its input uses Codex's skill invocation syntax and names the installed
  scratch skill. Neither this amendment nor the comparison is given to B.
- *Nothing leaves the scratch workspace.* Its remote is a scratch repository;
  the real remote, trunk, backlog and dashboard receive nothing from B. B has
  no hosted CI; its local gates are the plan's.
- The plan's proof names no paid native-host run, and B adds none.

**P, the planning replay.** At `0e6b0f3dc`, where the effort story is refined,
with its plan removed and the same patch applied, one fresh Codex session slice-plans
the story. The resulting plan is read and not executed. The delivered plan
budgets nine specs' exact command lines as a mechanical slice 1 update; P
shows whether planning now puts a Structure slice ahead of that change.

**Result.** The story's plan records, for each of the five edits, the moment
observed (quoted from B's or P's brief, return, diff or plan), then keep,
revise or remove with the reason; a revise names the wording that failed. An
edit whose moment never occurred is recorded as not exercised, apart from one
that was read and changed nothing. Beside them:

- tests edited that are not about effort, and whether each was loosened or had
  its value updated;
- positional, count, whole-list and whole-object assertions the run adds;
- parameterized tests whose body branches on the case;
- active time of B beside A's, using one stated transcript definition where
  both hosts expose the needed timing; token usage and cost with their own
  provider's recorded billing basis. Missing cost is explicitly unavailable,
  never inferred by applying Claude prices to Codex tokens.

**Limits the result states.**

- **Accepted Codex evidence limit (2026-11-17).** Terry authorized “Okay, you
  can skip it and continue.” The original B refactor brief is unavailable:
  skip its wording assessment and record edit 4 as unassessed, without a
  keep/revise/remove verdict or a claim that its moment was not exercised.
  Continue the Codex-first result with B's extra retrospective retained as
  an observed protocol deviation. Keep product/test proof pinned before that
  review and separate its timing/usage; do not repeat B to erase the deviation.
- The plan B executes tells slice 1 to update nine specs "to expect `--effort
  medium` in their exact argv or record". B therefore shows what the guidance
  does against a plan that budgets the churn: value updates in B follow the
  plan and do not alone count against an edit; loosening in B shows the
  guidance prevailing over it.
- One run of each kind cannot separate the guidance from run-to-run variation.
  A recommendation rests on a traced moment; the counts, time and cost are
  context and support no effect size.
- A used Claude; B and P now use Codex and its available user context. The
  result records the effective host, model, effort and memory/context
  differences; it names observed moments they could explain. The preserved
  Claude memory includes `focused-proof-through-test-runner`, changed after
  A, but copying it for the refused attempt does not prove Codex loaded it.
  Host/model differences prevent attributing A/B differences to guidance alone.
- B commits locally and has no hosted CI, where A published its story branch
  and watched CI.

**Deferred.** The matched Claude execution/planning replay; executing P's
plan; repeating B or rerunning A for a variance
baseline; replaying only the refactor pass on A's slice 1 change.

#### Key examples

- B's slice 1 implementer meets the plan's instruction to update nine specs'
  exact argv → it updates each value → the result lists them as updated values
  following the plan, and the test-assertion edit is judged on the assertions
  B newly wrote and on what the refactor pass then did.
- B's slice 1 refactor pass receives a change with about 23 tests edited
  outside its subject → it returns `none — already clean` or accepts them as
  tests asserting the concept → the shotgun-surgery and named-follow-up edits
  are recorded revise, each with the sentence the pass relied on.
- The same pass loosens what fits and returns the rest as a follow-up naming
  smell, concept, file count and representative files, and B's plan carries it
  in its learnings → both edits are recorded keep with the quoted return.
- B's coordinator brief names remedies ("extract a helper for the argv") →
  the brief edit is recorded revise with the quoted line; a brief giving the
  outside-subject test count and no remedy → keep.
- B's implementer narrows the nine specs before the refactor pass, so the pass
  sees no outside-subject edits → the shotgun-surgery and follow-up edits are
  recorded not exercised, and the test-assertion edit keep.
- P's plan again lists the consumers as a mechanical slice 1 update → the
  planning edit is recorded revise; P's plan opens with a Structure slice that
  narrows them → keep.
- B stops on a failure unrelated to the guidance, such as a local resource
  conflict → the failure policy governs it, the result reports how far B
  reached, and edits whose moments lie beyond that point are not exercised.

#### Direction

The original preparation compared the options below. Terry's Codex-first
amendment supersedes their same-host assumption; the historical guidance
patch and five observation moments remain selected. Considered against the
same goal:

| Option | Shows | Does not show | Cost |
| --- | --- | --- | --- |
| B with all current skill source installed | The release as it would ship | Which change caused a difference; comparable timing | One execution |
| B with only the patch, plus P read-only (chosen) | All five edits at their own moment, one variable | Effect size; P's plan in execution | One execution and one planning session |
| Slice 1 only | 26 of the 31 test files and the refactor acceptance | A returned follow-up carried to completion; whole-run time and cost | About a third of an execution |
| Replay the refactor pass on A's recorded slice 1 change | The refactor-pass edits on identical input | Implementer and coordinator behavior | One agent |
| Judge on the next real story | Real use | This case: `0724558d6` already narrowed these tests on trunk, so the precondition exists only before it | None |

The method borrows from a blinded trial with endpoints fixed before the run:
the executing session is the participant, the guidance patch the treatment,
the five moments above the endpoints, and whoever reads the result the
assessor. The analogy breaks at sample size: one untreated and one treated run
of the same story give evidence of mechanism, not of effect.
