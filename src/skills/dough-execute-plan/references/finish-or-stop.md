# Finish or stop

On a human-judgment stop or cancellation, handle delivered failures, then close
the observer through the current host adapter without waiting for CI and report
pending CI as unobserved. On normal completion, use
[the one bounded completion operation](ci-monitor.md#await-the-applicable-revision-at-completion)
and handle its combined CI and shutdown receipt before the final handoff.

At the final execution/review handoff, the supported live-Claude Story Branch
coordinator may instead choose the explicit background alternative in
[completion mechanics](ci-completion-wait.md), after any required review and
execution-complete record publication below. That alternative satisfies the
completion operation below: report its CI pending receipt and retained session,
observer and resources instead of a successful shutdown. All other completion
paths keep the bounded completion operation.

After all planned slices satisfy proof/delivery, `--skip-retro` skips only this
execution's automatic retrospective; it changes no preferences or
proof/delivery/completion obligations. Explicit omit/defer instructions also
take precedence. When skipped, publish the
[execution-complete record](#record-execution-completion) with
`Product advice: retrospective skipped`, then invoke the completion operation
for the applicable accepted revision at this execution-completion boundary,
then handle its receipt. Retain the completed plan and judged proof for later
review and wrap-up; select the planned response below.

Otherwise invoke
[dough-execution-retrospective](../../dough-execution-retrospective/SKILL.md)
without another confirmation as soon as delivered implementation is available,
including while applicable CI is pending. Preserve explicit review instructions
and project preferences through its review selection; its authority excludes
implementing findings or changing the backlog. Delivered implementation starts
review; require no execution-completion banner as input. When review returns,
publish the
[execution-complete record](#record-execution-completion), invoke the
completion operation, handle its receipt, and select the planned response below.

For both reviewed and skipped planned completion, apply the shared
[completion attention](../../dough-land/references/completion-attention.md)
judgment after completion handling. Consume the retrospective's current unresolved
attention together with any delivery, CI or shutdown limitation in one combined
handoff. Combine overlapping review items once; neither a later successful check
nor `Product advice: no change` settles an unresolved item. Remove an item only
after its evidenced, authorized disposition. Keep an explicit review/retain stop
and provide explicitly requested details. Otherwise, when settled, give no
success message, or only the minimum native response; add no slice, proof, advice,
CI or shutdown recap or execution-completion banner. Preserve that evidence in its
existing records and receipts, including accurate `integrated_state` evidence
under [completion mechanics](ci-completion-wait.md). When attention remains, begin
with `DEVELOPER ATTENTION REQUIRED`, followed by the issue, consequence, next action
or decision, responsible owner when known, and needed evidence or recovery links.
Apply [report attention at the execution-complete handoff](#report-attention-at-the-execution-complete-handoff)
before giving the response; a quiet handoff submits nothing.

Continue in the recorded execution project/checkout. Supply available references/context:
source contract, original plan and approved changes, attributable commits, decisions, proof,
delivery state, CI limitations, and checkout/branch identity. Supply the execution checkout
path as the retrospective's write location, so its process findings and correction stories
and plans stay with this execution's changes and enter its completion commit. Trunk Mode
attributable commits are that identity's retained published revisions, not another ledger or a
rewrite's unpublished SHA. Include an initial quick attempt and its planned
continuation as one execution. Pass existing context to retrospective, which
validates attribution and follows its
[process-review evidence rules](../../dough-execution-retrospective/SKILL.md#review-process-only-from-a-real-record).

Execution completion and review completion are distinct. A retrospective context
stop leaves implementation delivered but the final execution/review handoff
incomplete: preserve its partial review, observer, applicable target/revision,
and CI state, and report the missing input without rerunning implementation or
claiming review completion. It writes no execution-complete record. On
recovery, use retained review state to continue or recognize completed review;
ambiguous state requires recovery rather than duplicate review or guessed
completion. A CI failure handled through an authorized repair invalidates only
the conclusions affected by changed code; resume those conclusions instead of
restarting the full retrospective.

When process history is unavailable, report the review limitation and continue
independently supported outcome review and delivery.

Retain the completed plan, proof decisions, execution checkout, branch, and
worktree for story wrap-up; do not invoke it here. Wholly planless completion
retains source, conversation, identity, delivered changes, and proof, invokes
the completion operation when
publication created that CI obligation,
reports delivered work, the CI verdict or exact unresolved reason, and shutdown,
and ends with `## QUICK EXECUTION COMPLETE` after required delivery/completion,
without automatic retrospective. The coordinator invokes wrap-up after successful branch delivery. Do not
report integrated completion here; wrap-up owns Story Branch merge and required
target push, Trunk Mode closure publication, and resource cleanup.

For incomplete work, failed delivery/shutdown, cancellation, or a human-judgment stop, report
source, active plan/next slice or quick-slice state, preserved work, observer state,
and required decision/recovery action. An applicable CI failure that existing
handling cannot resolve is such an incomplete stop, even when review finished
and the observer remains available for diagnosis. Emit no completion marker or
automatic retrospective. Before giving that stop response, apply
[report attention at the execution-complete handoff](#report-attention-at-the-execution-complete-handoff)
as an unfinished report. For planned work, use the shared completion-attention
judgment: begin with `DEVELOPER ATTENTION REQUIRED` and name the actual gap and
required recovery; quiet output never substitutes for an unfinished gate.

## Report attention at the execution-complete handoff

Use this only when the launch supplied a dashboard reporting context for this
session — its project, host, launch reference, and reporting command. Without
that context, make no dashboard report at this handoff and change nothing
above. This applies at the final execution/review handoff, before Dough Land
or Story Wrap Up. For a completed handoff it is after the
[execution-complete record](#record-execution-completion) is published and
the completion operation's receipts are handled (including the background
alternative's receipts, where that path was chosen).

At that completed handoff, settle the exact final response wording first. If
it finished with a reminder, write that exact response to a message file,
append `--outcome completed --message-file <file>` to the supplied reporting
command, and wait for its matching receipt before giving exactly that
response. For an incomplete, failed, cancelled, or human-judgment stop above,
after that stop's own handling, settle the exact stop response, write it to a
message file, append `--outcome unfinished --message-file <file>` to the
supplied reporting command, and wait for its matching receipt before giving
exactly that response.

When nothing at the handoff requires attention, submit nothing there, so a
plain completed report at Dough Land or Story Wrap Up stays the quiet final
operation. A handoff report is attention-only: it does not stop the session,
declare the story complete, or invoke Dough Land or Story Wrap Up.

## Record execution completion

After the retrospective returns, or is skipped, run the installed
[story-obligations script](../scripts/story-obligations.mjs):
`node '<installed-execute-plan>/scripts/story-obligations.mjs' check --plan '<PLAN.md>' --completion`.
Use the [resolved inputs](story-obligations.md#use-the-record-at-execution-boundaries).
A refusal blocks the execution-complete record; resolve every open return,
receiving, or interim obligation before continuing. Then add this record to
the plan after its ordered slices:

```markdown
## Execution complete

Product advice: <advice>
```

Take the advice from the review's product advice or reasoned no-change; it may
continue across following lines or list items until the next `## ` heading.
Write `retrospective skipped` when this execution skipped the retrospective,
and `product review skipped` when the review ran with `--skip-product`. Commit
the record together with the retrospective's records written in the execution
checkout — a correction story and plan, `DearDough.md` process findings — as one commit
under this project's commit conventions, made as an [agent commit](agent-commits.md)
when that reference applies. The commit changes records only, so
accepted slice proof still applies. Publish it through
[increment delivery](trunk-publication.md#publish-an-execution-increment-or-repair)
before the completion operation, so the completion wait covers it; do not start
another CI or publication path. A plan that already carries the record needs no
second record or commit on recovery.
