# Review and acceptance stopping rule: investigation input

For [Reach a proof decision from retained evidence](../SEED-345-session-token-efficiency.md#reach-a-proof-decision-from-retained-evidence).

## Incident and evidence limits

On 2026-11-17, during SEED-348#collect-notes-for-story-follow-ups,
Terry reported that the current slice appeared to have taken at least
45 minutes and asked whether the instructions had caused excessive
acceptance analysis. The coordinator acknowledged spending too long
considering possible edge cases after the returned proof was sufficient.
The 45 minutes is Terry's estimate of elapsed time, not a measured total
of acceptance work; command waits, implementation, refactoring and CI
repair need separate attribution before claiming a measured cause.

The coordinator's initial inspection found:

- Installed execute-plan oversized-slice guidance accounts for active
  implementation work but gives coordinator acceptance no explicit exit rule.
- The newer source guidance's slice clock pauses at the implementer's
  return and excludes review, refactoring and CI repair. That clock therefore
  does not resolve the reported acceptance overrun.
- Wrap-up acceptance guidance asks for product, setup, assertion and consumer
  inspection. It already requires a concrete expected/actual mismatch when
  returning work, but did not prevent this coordinator from extending analysis
  without one. Coordinator judgment contributed; an instruction defect is
  a hypothesis to investigate, not an established sole cause.
- Broad consumer searches returned hundreds of generic or historical matches.
  Repeated scrutiny of those matches and possible variants delayed the
  decision instead of settling relevant consumers and grouping exclusions.

Recover the execution and proof from the story branch's plan 671 at
`f918ecb54b55b45b53819208f4a6d568452107d1`; the launch reference is
`154b5180-ee1f-44b2-88e7-a70e47217593`. Compare installed and source
`dough-execute-plan/references/oversized-slice.md` and `wrap-up.md` at that
revision; the installed and source versions differ.

## Terry's requested direction

Keep refactoring intentionally unbounded. Bound the other review and
acceptance phases with stronger stopping instructions. Start with simple
instructions, rather than introducing timing machinery. This is future
work, to land as a queued-story update with the notes story; it authorizes
no guidance implementation in the notes execution.

Investigate an instruction along these lines: once source promises, affected
consumers and required gates have decisive observations and no unresolved
mismatch, accept and continue. Further investigation must name a concrete
expected/actual mismatch or a specific evidence gap. Generic and historical
search matches can receive a supported grouped disposition. This must not
waive required proof or prevent investigation of a real defect.

## Investigation and evaluation

Needs more investigation: establish which review phases and instruction
owners need the rule, distinguish necessary inspection from speculative
repetition, and choose representative acceptance examples and a retained
baseline. Demonstrate prompt acceptance when evidence is sufficient and
continued investigation when a real mismatch or missing proof remains.
Preserve the required proof rows, independent refactoring and its lack of a
time bound. Evaluate effort and decision quality on comparable executions;
do not assume shorter reports alone establish an improvement.

Earlier retained-evidence drivers remain: SEED-332 lost diagnostic traces,
truncated output recurred (ODF-264), and Claude Code coordinators retained
315 hand-backs with a median 7.8k characters throughout their sessions.

The concurrent [SEED-393 consumer-verification story](https://github.com/terryyin/open-dough/blob/1a21d9a44ca019ec95392437995f622c5a5cfd7a/.planning/seeds/SEED-393-test-quality-learning-from-effort-replays.md#proof-reaches-unchanged-consumers-of-changed-output)
was also checked. It owns reaching affected output readers and limiting
completion claims to observed proof. This story owns stopping review and
acceptance once sufficient evidence settles the decision; it must preserve
that consumer coverage. The related work does not replace this incident's
stopping-rule investigation.
