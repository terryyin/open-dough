# Preparation journey

One story refinement invocation prepares its story through to a landed plan:
story refinement, then slice planning, then slice-plan refinement when slice
planning's own rule calls for it, then the landing. The result is one
preparation draft in one owned workspace, the refined story and its plan with a
recorded readiness assessment, published on the remote target as one commit.

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
or `abandon` commands and the landing.

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

## Land at the end of preparation

Preparation of a queued story with an announced Preparing assignment ends when
slice planning records its readiness assessment, with any slice-plan
refinement it invoked, whether planning followed refinement in this session or
began it, or when a slice-plan refinement invoked directly on that story's
plan records its reassessment. A plan that needs no refinement adds nothing
before landing: no approval step and no second report.

At that end, with no open coordinator question and no opt-out, land the result.
The instruction that started this preparation is the advance keep instruction
for its completed result. Enter
[Validate a keep instruction before acting](preparation-disposition.md#validate-a-keep-instruction-before-acting),
which confirms the workspace holds only this preparation's result, with every
scratch observation edit reverted, then
[Keep and publish the retained result](preparation-disposition.md#keep-and-publish-the-retained-result):
stage `release` and land through Dough Land. Seed, plan, recorded facts, and
the assignment's end publish in one snapshot. The announcement's publication
authority (`--push-authorized`) covers landing to the same remote target.

The recorded assessment does not gate landing. A `ready` or `not-ready` plan
whose reasons, early probe slices, or pre-Take decisions the plan already
names is a complete result, and it lands so the coordinator sees it on the
remote target. The story stays queued with the recorder's facts: landing
neither Takes it, starts execution, nor completes it, and grants no execution
authority.

An open coordinator question is a response the preparation needs before its
result is complete:

- a Needs human engagement refinement outcome;
- missing required context;
- a disputed constraint or an Escalate finding;
- a story-resplit recommendation; or
- a stopped write or recording.

Any of these stops landing: report the expected response, keep the draft and
its Preparing assignment in the workspace, and say what continues once it is
given. When the coordinator answers in the same session and no question
remains, finish preparation and land.

The opt-out is `--retain` from [refinement options](refinement-options.json),
or an ordinary-language instruction to leave landing for later: finish
preparation and record the assessment, then keep the result with its Preparing
assignment for an explicit keep. An explicit instruction not to publish, which
already prevents the announcement, also disables landing.

A landing stop keeps the handling of
[Keep and publish the retained result](preparation-disposition.md#keep-and-publish-the-retained-result):
`story-left-queue` or `release-conflict` from the release, other content in
the workspace, a publication conflict, a second rejection, or an unclear push
ends with the draft retained and nothing more pushed. Report the receipt with
the decision or rerun that continues.

Other written results, such as a decomposition seed, a session that ends at
the refinement result, or a record with no announced assignment, follow
[Decide what happens to the written result](preparation-disposition.md#decide-what-happens-to-the-written-result).

## Report once at the end

The session's final report is slice planning's report, or the plan
refinement's when that skill was invoked directly, given once after the
landing settles. It carries the story's refinement outcome, the plan path, the
recorded readiness assessment, and the landing result: the landed commit, the
story's next step, and Dough Land's publication, refresh, and retirement
results. For a retained or stopped result it carries the draft's workspace,
the Preparing assignment others still see, and the expected response, which
for a result the opt-out retained is an explicit keep.

With supplied dashboard reporting context, the completion report under
[dashboard completion](../../dough-land/references/dashboard-completion.md) is
the session's final operation, after the landing settles. A retained or stopped
result reports `unfinished` with the expected response.
