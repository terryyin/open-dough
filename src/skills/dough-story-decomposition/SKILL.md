---
name: dough-story-decomposition
description: >-
  Challenges and decomposes a broad product problem into ordered
  Valuable/Visible/Vertical stories with rough effort hypotheses. Use when the
  parent problem, candidate outcomes, or learning priority are unresolved.
  Writes one non-executable seed. Uses dough-story-refinement for selected-story
  detail.
---

<objective>
Produce one human-reviewed seed containing a clear parent problem and ordered
candidate stories. Read and apply [problem decomposition](references/problem-decomposition.md). Do not
inspect implementation or perform technical design to refine estimates.
</objective>

## Required adopter context

Resolve from the user's instructions and repository guidance:

- The adopting repository root, supplied seed or canonical seed directory, home
  ID allocation and filename conventions, and stable story-anchor convention.
- Required seed metadata and lifecycle vocabulary; use the bundled
  [seed format](references/seed-format.md) as the content structure and map its
  metadata to the adopter's conventions.
- The adopter's S/M/L effort bands. Do not import another project's time
  budgets.
- The canonical backlog path only if queueing or reprioritizing is requested.
- The execution-planning workflow only if that handoff is requested.

If context needed for the current action is missing, name it and stop that
activity before writing; ask only for the missing values. If a linked dependency
is unavailable, report it and stop the activity that requires it. Resolve
project paths from the adopting repository, not from the location where this
skill is stored.

<input_gate> Use this skill when at least one is true:

- the beneficiary, problem, desired effect, or value is unclear;
- the request prescribes a solution without establishing why it is needed;
- multiple product outcomes or story boundaries must be chosen;
- the highest-value or highest-learning first increment is disputed.

For selected stories, use
[dough-story-refinement](../dough-story-refinement/SKILL.md) to clarify goal,
scope, and key examples; use the adopter’s execution-planning workflow once one
story is understood. </input_gate>

<required_human_decisions> Before writing the seed, use an explicit answer the
human already gave or ask the human to accept/revise your proposed answer for:

| Decision            | Required answer                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------- |
| Beneficiary         | Who experiences the problem or evaluates the outcome?                                       |
| Current problem     | What happens now, including the workaround?                                                 |
| Desired effect      | What observable change would be worth having?                                               |
| Value now           | Why act now rather than defer or do nothing?                                                |
| Simpler alternative | What is the strongest smaller, manual, or existing-tool option, and why is it insufficient? |
| Highest learning    | Which assumption should the first story test?                                               |
| Constraints         | Which boundaries are problem facts rather than proposed design?                             |

- Do not repeat questions already answered.
- Ask only questions whose answers can change story selection or order.
- Ask at most three closely related questions per turn.
- State the current hypothesis and recommended answer with each question.
- If competing answers materially change the decomposition, stop and wait for
  the human instead of choosing silently. </required_human_decisions>

<process>

<step name="frame_and_challenge">
Write the parent problem as:

```text
For <beneficiary>, <current problem> should change to <desired effect>, within
<genuine constraints>.
```

Evaluate these options explicitly:

1. Do nothing or defer.
2. Make a smaller behavior change.
3. Use a manual or existing-tool workflow.
4. Pursue the requested direction.

Recommend one. Record the evidence, assumptions, and why the strongest rejected
alternative is insufficient. </step>

<step name="cut_candidate_stories">
For each candidate:

1. Name one user or stakeholder outcome.
2. Apply the 3V gate in
   [problem decomposition](references/problem-decomposition.md); reject
   failures.
3. State how the beneficiary evaluates the outcome.
4. State its user value or the consequential assumption it tests.
5. Name only genuine product prerequisites.
6. State the value that remains if later stories are cancelled and any safety
   condition this story must satisfy on its own.

Do not add file-level tasks, technical layers, APIs, or implementation design.
Acceptance examples are optional here; include one only when it changes the
story boundary.

A seed is a story's home, not a feature boundary. Frame stories as user journeys
that achieve a goal across related features when needed. Keep each story's
requirements in one home seed and link from related seeds instead of duplicating
them. Decompose only enough candidates for the current value or learning
question; do not exhaust a feature for completeness. </step>

<step name="estimate_and_order">
Use the S/M/L story bands from [problem decomposition](references/problem-decomposition.md) without code
inspection.

- Record band, confidence, and assumptions.
- Split a likely larger-than-L candidate using an allowed splitting move.
- Order by user value, then learning value, then genuine prerequisites.
- Move a later story earlier when it delivers more value or tests a more
  consequential assumption sooner.
- List stories in first-to-drop order for scope reduction.
</step>

<step name="write_the_seed">
Update a supplied seed or allocate a new home ID in the adopter’s canonical
seed directory using its naming convention. One seed represents the parent
problem; its stories are not separate seed files.

Use the bundled [seed format](references/seed-format.md). Preserve existing
metadata and story anchors when updating a seed.

Do not write an executable PLAN. Leave the seed uncommitted for review unless
the user explicitly asks for a commit.

When the user asks to queue or reprioritize stories, maintain the adopter’s
canonical product backlog as the global ordered list of story titles linked to
their home seed sections, with the seed ID. It contains no story details. Use
stable anchors for new queued stories; local story numbering is not global
priority. Unqueued candidates remain in their seeds. Backlog selection does not
authorize execution. </step>

</process>

<success_criteria>

- All required human decisions are answered or explicitly open.
- The strongest simpler alternative is evaluated.
- Every candidate passes the 3V gate and has observable evaluation.
- Estimates include band, confidence, and assumptions.
- Ordering follows value, learning, and genuine prerequisites.
- The output is one non-executable seed.
- Final response ends with `## STORY DECOMPOSITION WRITTEN`. </success_criteria>

<output>
Report the seed path, recommended first story, rejected simpler alternative,
effort distribution, and open decisions.

```text
## STORY DECOMPOSITION WRITTEN
```

</output>

<out_of_scope>

- Implementation inspection or technical design.
- Executable planning or implementation.
- Technical-layer, activity, or team-based stories. </out_of_scope>
