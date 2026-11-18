# Trial wording: first-report admission

Pinned for SEED-401#pilot-new-retrospective-findings only. It is not a release
and changes no Distribution source or installed copy.

- **Base:** `Distribution/src/skills/dough-execution-retrospective/references/process-finding-recording.md`, blob `49de76bfe` (installed identically in Doughnut `a23441f74` and Pygardon `7da34fc73`).
- **Replaces only:** “Record supported one-offs, practices, potential general issues, and retrospective observations with qualified generality.”
- **Everything else** in the base reference applies unchanged, including matching, allocation, occurrence rows, repeat rules and bounded retention.

## Candidate text (inserted in place of the replaced sentence)

**First-report admission.** First match each observation against the log as
below. A matched observation follows the existing occurrence rules unchanged.
For an unmatched observation, before allocating a `DD-NNN` or gathering
occurrence metadata, ask: *What future decision could this observation change?*
Name that decision, beyond accepting this execution's own proof, and the
evidence that bears on it. Record it through the ordinary new-finding path when
it shows any of:

- a concrete consequence, or a credible near miss or path to harm;
- a practice or technique with a named use beyond this execution;
- evidence that narrows an open question, even if the run was otherwise normal.

Cause, remedy, recurrence and measured cost may remain unknown; state the
observed fact and the uncertainty instead of resolving them. When the only
evidence is a control doing its expected job, or no future decision can be
named, keep the observation with the execution proof and record nothing. Return
the observation with `not recorded: execution proof only`.
