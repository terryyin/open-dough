# Invocation-supplied new evidence (not a process-log write)

A later execution also showed wrap-up replacing a reviewed commit. This note is
supplied at triage invocation for ODF-901. It is not an occurrence row in
`findings.md` and must not be collected into that file by this skill.

- Execution: `fixture:slice-4-new / wrap-up-overwrite @ fict-ddd444`
  - Tool: Codex
  - Model: test-model-slice-4
  - Open Dough release: unreleased
  - Evidence: fixture record `wrap-up-overwrite-later.md`, events W4–W6; the
    reviewed commit `fict-ddd444` is no longer reachable from the branch tip
  - Observed effect: the reviewed Taken-work patches disappeared; the later
    reviewer's notes on that commit were also lost during recovery
  - Inference: the same wrap-up overwrite may have recurred; that shared cause
    is not proven beyond these two executions
