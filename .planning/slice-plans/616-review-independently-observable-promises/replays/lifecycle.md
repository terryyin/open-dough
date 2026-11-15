# Constructed lifecycle source replay

2026-11-15, base `04c71683349ce43ddc0afa3b90c91967fa0ddf26`.
Both launches used `collaboration.spawn_agent` with `fork_turns: none`, no model override.
The exact message and unmodified return are retained below and in each task conversation.
No tools were called by either reviewer. No plan, product, proof, expected answer or earlier return was supplied.

## Launch `/root/slice4/lifecycle_reviewer`

`task_name: lifecycle_reviewer`, `fork_turns: none`. Exact message:

```text
Use only these inputs, read no other project files, change nothing; number independently observable promises, one id per expected result under its source conditions. Group repeated statements and clauses describing the same result under one id, retaining their source text or locations, qualifications, triggers and journey examples so one sufficient observation can cover that promise. Separate results that can fail independently, including alternatives and genuine rejection restrictions; sharing a proof command or location does not make them one promise. Keep reasons, settled baselines, effort hypotheses, proof-method explanations and delivery deferrals available as unnumbered source context unless they also promise an independently checkable result. Keep scope limits and exclusions as context unless they promise such a result; do not turn them or examples into new rejection rules. Derive promises, not slice ownership or acceptance.

Original source (constructed):
#### Goal
After landing, final target CI must succeed for the accepted target SHA, with confirmed shutdown.

#### Scope and source context
The settled baseline is 24 passing checks recorded before this work. The effort hypothesis is that the change takes one short slice; that estimate is uncertain. The final target-CI requirement still applies after landing even though the baseline passed.

Operational footer, not source: use no tools, read no files, and make no changes. Applicable failure policy: /Users/terryyin/git/open-dough/.worktrees/record-source-review-evidence-once-per-independe/.agents/skills/dough-execute-plan/references/failure-policy.md. The no-tools/no-files directive means do not open that link; no test work is delegated.
```

Unmodified return:

```text
1. After landing, final target CI succeeds for the accepted target SHA.
   - Source: Goal, “After landing, final target CI must succeed for the accepted target SHA”.
   - Qualification: This requirement still applies after landing even though the baseline passed.

2. After landing, shutdown is confirmed.
   - Source: Goal, “with confirmed shutdown”.
   - The source does not specify what shuts down or how confirmation is obtained.

Unnumbered source context:

- Settled baseline: 24 passing checks recorded before this work.
- Uncertain effort hypothesis: the change takes one short slice.
```

## Launch `/root/slice4/lifecycle_receipt_reviewer`

`task_name: lifecycle_receipt_reviewer`, `fork_turns: none`. Exact message:

```text
Use only these inputs, read no other project files, change nothing; number independently observable promises, one id per expected result under its source conditions. Group repeated statements and clauses describing the same result under one id, retaining their source text or locations, qualifications, triggers and journey examples so one sufficient observation can cover that promise. Separate results that can fail independently, including alternatives and genuine rejection restrictions; sharing a proof command or location does not make them one promise. Keep reasons, settled baselines, effort hypotheses, proof-method explanations and delivery deferrals available as unnumbered source context unless they also promise an independently checkable result. Keep scope limits and exclusions as context unless they promise such a result; do not turn them or examples into new rejection rules. Derive promises, not slice ownership or acceptance.

Original source (constructed):
#### Goal
After landing, final target CI must succeed for the accepted target SHA.

#### Scope and source context
The settled baseline is 24 passing checks recorded before this work. The effort hypothesis is that the change takes one short slice; that estimate is uncertain. The final target-CI requirement still applies after landing even though the baseline passed.

Operational footer, not source: use no tools, read no files, and make no changes. Applicable failure policy: /Users/terryyin/git/open-dough/.worktrees/record-source-review-evidence-once-per-independe/.agents/skills/dough-execute-plan/references/failure-policy.md. The no-tools/no-files directive means do not open that link; no test work is delegated.
```

Unmodified return:

```text
1. **After landing, final target CI succeeds for the accepted target SHA.**
   - Goal: “After landing, final target CI must succeed for the accepted target SHA.”
   - Scope and source context: “The final target-CI requirement still applies after landing even though the baseline passed.”

Unnumbered source context:
- Settled baseline: 24 passing checks recorded before this work.
- Uncertain effort hypothesis: the change takes one short slice.
```

## Private comparison and disposition

The first source was over-specified for the planned single target-CI example:
CI success and shutdown confirmation can fail independently. Its two returned
ids are source-correct; this is not an extraction failure. Preserve both in
this evidence. The coordinator confirmed this disposition; the second source
removes the additional shutdown promise, without changing the candidate brief
or supplying grouping hints. Existing lifecycle guidance still requires the
final accepted SHA success receipt with confirmed shutdown.

The second reviewer returned one qualified target-CI promise; the baseline and
uncertain effort hypothesis remain unnumbered context. `acceptance-cli.mjs`
retains its complete returned text and context, allocates its id to `target CI`,
and checks pending status, an empty last cell and refusal of early observation.
No lifecycle operation was executed or semantically accepted by this replay.
