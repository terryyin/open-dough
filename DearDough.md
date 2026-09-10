# DearDough Process Findings

## DD-001 — Passing local proof concealed an invalidated CI assertion

Reassess proof after edits to runtime-consumed Markdown, including edits made by
independent refactoring. Make assertion failures explicit when supported shells
can interpret failure propagation differently.

### Occurrences

- Execution: .planning/quick/037-cohesive-design-from-examples/PLAN.md @ 0517e0b3729e1a1de83bf7c3e390687aae2e2ebb
  - Tool: Codex
  - Evidence: `475986e` repaired the old-payload fixture; `e8ada1a` subsequently added `#decompose-slices`; `tests/story-payload-update.sh:56-59` strips that fragment and checks the containing directory as a file. Final plan evidence treated the prior focused test as still valid. CI runs 34435679380 (execution end) and 34436876332 (current truth) fail this test.
  - Observed effect: The execution ended with CI unobserved and reported retained green local proof. Retrospective tracing on Bash 3.2 reaches the false directory assertion and continues within nested loops; a minimal nested-loop reproduction also continues. Thus merely repeating the same local invocation would not establish reliable green proof.
  - Inference: Guidance consumers belong in proof-impact analysis even for Markdown changes. Explicit assertion failure and representative shell coverage would make this boundary trustworthy; this record does not establish behavior on every shell version.

## DD-002 — Editing a running shell test invalidated its verification

Finish changing the test input before running it; if it changes during execution,
qualify that attempt and run the final stable input for proof.

### Occurrences

- Execution: .planning/quick/037-cohesive-design-from-examples/PLAN.md @ 0517e0b3729e1a1de83bf7c3e390687aae2e2ebb
  - Tool: Codex
  - Evidence: CI-repair agent reported changing the fixture commit-message text while `bash tests/story-payload-update.sh` was running, followed by a shell read-offset error. The active plan records the invalidated intermediate attempt.
  - Observed effect: A replacement invocation was needed after edits stopped. The agent identified the mutation rather than treating the failed attempt as evidence about the fixture repair.
  - Inference: This was avoidable verification work; elapsed cost was not measured.

## DD-003 — Oversized context reads obscured the needed review evidence

Use bounded reads for the specific unresolved decision and reuse already inspected
execution context instead of repeatedly loading complete skills and diffs.

### Occurrences

- Execution: .planning/quick/037-cohesive-design-from-examples/PLAN.md @ 0517e0b3729e1a1de83bf7c3e390687aae2e2ebb
  - Tool: Codex
  - Evidence: Execution initially combined the full quick workflow and plan in a truncated output before following the plan's explicit dough-execute-plan workflow. This retrospective again requested a full aggregate diff and file inventory, then a large all-tools test alongside other context; both outputs truncated.
  - Observed effect: Focused subsequent reads were required to recover the decisive executor-input and test-runner evidence. The broader dumps did not replace those reads.
  - Inference: The extra context and tool work were avoidable, but no token total or elapsed saving is claimed. Retain focused investigation that established the current CI failure and shell discrepancy.
