# Problem decomposition

Read for problem framing, story splitting, ordering, and rough sizing. These are
the story-level decisions extracted from the source rule. They apply during
skill use; this reference is not an automatically applied host rule and does not
supply execution planning or implementation instructions.

## Choose the resolution

- If the beneficiary, problem, desired effect, constraints, or direction is
  unclear, frame an evaluable decision, assumption, or outcome first.
- If the problem is clear but several increments are possible, use
  [dough-story-decomposition](../SKILL.md) for ordered stories.
- If selected stories need goal, scope, or examples clarified, use
  [dough-story-refinement](../../dough-story-refinement/SKILL.md).
- Only after one story is understood, and execution planning is requested, hand
  off to the adopter's planning workflow. A seed is not executable.

## Rules for every story split

| Judgment                                                                 | Action                                                                |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| A child contains two independently useful outcomes or acceptance signals | Split it                                                              |
| A child has no named evaluator or observable evidence                    | Refine it before keeping it                                           |
| Stopping after a child leaves only unused preparation                    | Merge preparation into the behavior it enables                        |
| A later child has higher value or tests a more consequential assumption  | Move it earlier unless a genuine product prerequisite prevents it     |
| A child exists only to build a layer, component, activity, or framework  | Put that work inside a vertical story                                 |
| A general solution is proposed before a concrete case requires it        | Start with the concrete case                                          |
| Evidence invalidates the parent outcome, boundary, or order              | Stop at a safe boundary and revisit that decomposition with the human |

## Story gate: Valuable, Visible, Vertical

Keep a candidate only when all answers are yes:

1. **Valuable:** Does it change an outcome for a named user or stakeholder?
   “Needed for later work” is insufficient.
2. **Visible:** Can that person evaluate the result without inspecting
   implementation?
3. **Vertical:** Does it work end to end across every required layer?

Revise failures. Necessary non-3V work belongs inside another story, not in a
separate story. Name an evaluable outcome and boundaries distinguishing
siblings; exhaustive acceptance scenarios are unnecessary.

## Decomposition procedure

1. Restate the solution as beneficiary → current problem → desired effect →
   genuine constraints.
2. Use a representative example, counterexample, boundary, or relevant exception
   when it changes the story boundary. Describe behavior as pre-condition →
   trigger → result.
3. Cut around user behavior, a product decision, risk, or learning question;
   reject cuts around technical layers or roles.
4. Apply the 3V gate.
5. Order by user value, then learning value, then genuine product prerequisites.
6. Check stopping points. Remove or move preparation that becomes waste if later
   children are cancelled.
7. When evidence arrives, revisit the highest resolution it invalidates. Changes
   to goals, scope, examples, or sibling order need human story review; do not
   silently cancel remaining scope or rewrite siblings.

## Permitted splitting moves

- Narrow the beneficiary, pre-condition, or data variation.
- Deliver one independently usable, observable workflow step.
- Separate common behavior from a later special policy or exception.
- Separate a cheap assumption test from the broader outcome it may justify.
- Use interim behavior when it delivers usable value or earlier end-to-end
  evidence; name the later replacement that removes it.

Choose breadth-first or depth-first based on earlier value or learning. Retain
an externally evaluable result either way.

## Story effort hypotheses

Use the adopter's definitions of S, M, and L, estimating comparatively without
implementation design or code inspection. Record the band, confidence, and
assumptions. If those definitions are unavailable, resolve them before writing
estimates; do not silently import the source project's hours.

Split a likely larger-than-L story by behavior, policy, risk, or learning. Do
not split merely to equalize estimates if the result fails the 3V gate.

## Correct these smells

- Backend first, frontend later: reassemble one end-to-end behavior.
- A requirement per component, specialist, or team: coordinate the work inside
  one vertical story.
- Abstraction first: start with a concrete case, extracting after repetition.
- A large story as permanent specification: keep it as planning input; enduring
  behavior belongs in executable examples and product documentation.
- A prototype growing past its question: limit it to the cheapest needed
  evidence.
- One giant implementation task: hand off to the adopter's bounded execution
  workflow after story understanding and authorization are established.
