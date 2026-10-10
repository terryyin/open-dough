# Preparation journey

One story refinement invocation prepares its story through to a plan: story
refinement, then slice planning, then slice-plan refinement when slice
planning's own rule calls for it. The result is one preparation draft in one
owned workspace: the refined story and its plan with a recorded readiness
assessment.

## Continue into slice planning

Once the seed records the story's goal, scope, and key examples, `refined` is
recorded, and no question to the coordinator remains, report the story's
refinement outcome under
[report the refinement outcome](../SKILL.md#report-the-refinement-outcome)
and, in the same session, invoke
[dough-slice-planning](../../dough-slice-planning/SKILL.md) for that story.

Both ready outcomes continue: Ready for slice planning and Flawless. A Flawless
story gets its one-slice plan and recorded assessment, and executing it with an
explicit skip-planning instruction stays the coordinator's choice when
execution starts.

When several stories are refined together, continue for the story the
invocation names, which is the established identity when the instruction
carries one. Each sibling refined for its boundaries ends with its own
refinement outcome. A story that already has an associated plan continues with
that plan instead of a new one.

## Carry the same preparation

Slice planning runs in the same workspace, branch, and session as the
refinement, on the same Preparing assignment. Its `start` for this story in
this workspace returns `continued`, so the journey has no second Established
preparation block, announcement, workspace, or branch. Keep the recorded
identity, workspace, target, and integration checkout for the later `release`
or `abandon` commands and the keep decision.

## Stop before planning

Two conditions end the invocation at the refinement result:

- **An open coordinator question.** A Needs human engagement outcome lists
  each expected response, and no plan is written. When the coordinator
  answers in the same session and no question remains, finish refinement and
  continue into slice planning as above.
- **An explicit refine-only instruction.** The invocation carries
  `--refine-only` from [refinement options](refinement-options.json), or an
  ordinary-language instruction to leave planning for later. It composes with
  every option and focus: apply the others within the refinement, then report
  the refinement outcome with slice planning in that workspace as the next
  step.

[One-shot refinement](one-shot-refinement.md) is a separate journey that ends
at its review or landing. Missing context and failures stop each skill as that
skill describes.

## Stay within planning authority

A refinement invocation authorizes slice planning of its story and nothing
after it: no execution, no commit, and no push. The combined draft stays
uncommitted in the owned workspace with its Preparing assignment under
[preparation disposition](preparation-disposition.md), and landing it takes an
explicit keep.

## Report once at the end

The session's final report is slice planning's report. It carries the story's
refinement outcome, the plan path, the recorded readiness assessment, and the
pending draft and Preparing assignment as information, not as a request to
keep them.
