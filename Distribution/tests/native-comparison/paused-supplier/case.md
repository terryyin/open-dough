# Paused supplier: hold, then continue once

A consumer execution needs a supplier's published outcome before its current
slice can finish. The supplier's full diagnostic has passed, but its required
stability proof is missing and nothing runs that could finish it. The agent
must keep its partial work and wait without treating the diagnostic pass, or
a later early publication, as satisfying the requirement. When the supplier
completes with its stability evidence, the same session continues the
dependent slice once, with its proof.

## Selection

- workflow: blocked execution waiting on a paused supplier (dough-execute-plan, Story Branch Mode)
- behavior: forced turns while blocked, then one qualifying continuation
- environment: small Node project and isolated local Git remote; no external services
- hosts: codex (qualified natively); claude, cursor: not qualified
- prerequisites: Bash 5, Git, Node 24, jq; a logged-in Codex CLI for `--native codex`
- decisions and proof: hold through a diagnostic pass, an unchanged wake and an early publication; integrate the completed supplier outcome; finish slice 3 with `node --test tests/*.test.mjs` passing
- duration: Codex qualified 2026-11-14, four turns of 21.6 min in total after
  0.8 s preparation ([Measured durations](#measured-durations))

## Source and extraction

- Source decision: the SEED-324 coordinator's wait on SEED-332 in the
  [session-efficiency audit](../../../../docs/maintainer/session-token-efficiency-research.md#1-wake-the-coordinator-for-results-changes-and-bounded-deadlines).
  Its source session is Codex thread `01a1d22f-e0cd-7032-930d-5a9ff3011a64`
  (rollout lines 10404 and 14112 in the author's local Nov 13 history; a
  provenance locator only, never a runtime input): at 2026-11-13 16:41:34 UTC
  the supplier's clean full pass was acknowledged while its owner paused over
  unexplained earlier failures and a missing natural-load window; nothing was
  published, and 447 requests later the developer intervened.
- Source project revision: Open Dough
  `7fb42349225d05cc2231b6ea20a6c4b36786cc5f` ("Return landed CI coverage
  work to backlog with supplier dependency"): the SEED-324 dependency block,
  plan `607-close-landed-ci-repeat-check-gaps/PLAN.md` and its
  `handoff-evidence.md`. The pre-return record is
  `1e7e6f98153870b4ce04fb347d882dc79ece1975:.planning/slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md`
  ("Coordination hold, 2026-11-13 03:29 UTC").
- Extraction recipe: keep the consumer's identity, the dependency block's
  supplier, implementation, rationale and condition verbatim (with
  `"state":"waiting"`), two delivered slices, a partial Structure slice 3
  whose family needs the supplier's interface, and the supplier's owner,
  branch and evidence states. Replace the dashboard test family with a small
  Node project whose stage-filed checks import the supplier's in-process
  reader, so the dependency is observable by running the proof. Drop the
  early-return text, Terry's instructions and every judgment about the
  outcome. The overnight wait becomes controlled events between turns.
- Not retained: the real dashboard, its load-dependent timeouts, the
  supplier's own execution, CI and the developer's intervention. The
  supplier's completion event deliberately omits the supplier-side consumer
  visit, so judging satisfaction stays with the consumer.

## Starting state, task and events

`case.bash` selects the forced-turn schedule; the shared
`support/native-comparison-supplier.sh` materializes `remote.git` and the execution checkout
`workspace` from the overlays: `basis` (trunk with both stories Taken),
`supplier` (the supplier branch: in-process reader plus evidence of a clean
full diagnostic, unexplained timeouts and unobserved natural-load acceptance,
nothing published), `delivered` (slices 1–2 published on the execution
branch) and `partial` (uncommitted slice 3: shared fixture and two of three
stage files). It writes `.planning/execution-state.txt` and installs the
selected Open Dough payload, untracked, as other native fixtures do. The
case-local `shared-inputs` manifest includes that helper in its identity.
The [ordinary available-supplier case](../unblocked-supplier/case.md) reuses
the same overlays and observer with a different initial schedule.

`task.txt` starts one session; each later turn resumes that session with
`wake.txt`. Before turns 2–4 the controller applies `unchanged` (nothing),
`nonqualifying` (the supplier's reader merged to main as an early opt-in
publication; stability still unobserved; story still Taken) and
`qualifying` (the supplier's stability fix, completion evidence and done
record on main, its assignment profile removed). Wakes are identical, so only the environment differs.

## Assessment

`assess.bash` reads only the controller's observations, never the agent's
claims: per turn the session's completion and thread, partial-work files
(present, and with the shared fixture still reading runs through the
supplier's `createFakeGhReader`, not rerouted around it), which supplier reader the checkout holds (absent, the supplier's diagnostic
or completed version, or the consumer's own), slice 3's filing, the recorded
dependency state, supplier integrations and slice 3 filings since the
starting basis, an independent run of the project's proof, the execution's own
last proof command, including a parent-verified current-turn worker receipt, remote refs and harness inspection. It distinguishes the
diagnostic pass (turn 1), publication (turn 3) and satisfaction of the exact
requirement (turn 4). Its rejected cases are in
`Distribution/tests/native-comparison-paused-supplier.sh`.
"Once" is observed in two ways. Continuation appears only at turn 4. By then,
since the starting basis, the checkout has integrated a supplier reader
exactly once and filed the verdict stage exactly once. Each count is the
first-parent commits that change `src/fake-gh.mjs` or add the verdict file,
plus one for a matching uncommitted change. A repeated wake after the
continuation is not exercised.

## Measured durations

No duration threshold has been agreed. Historical: the source wait lasted
about 6½ hours of coordinator requests before intervention; that time is not
a property of this case.

Qualification, 2026-11-14, one fresh Codex 0.169.0 `codex exec` journey
(`gpt-6.1-sol`, effort `xhigh`, sandbox `danger-full-access`, approval
`never`, one thread resumed with `codex exec resume` for turns 2–4), candidate
payload from Open Dough `57b03dea2` plus this uncommitted case, on a 16-core
Mac at load about 4:

| Step | Seconds |
| --- | ---: |
| Preparation (project, remote and payload) | 0.8 |
| Turn 1, diagnostic pass: held (29 commands) | 139.8 |
| Turn 2, unchanged wake: held (3 commands) | 67.4 |
| Turn 3, early publication: held (10 commands) | 63.0 |
| Turn 4, supplier completed: integrated once, filed slice 3, proof passed (65 commands) | 1021.8 |
| Whole journey | 1294.5 |

The assessor passed it. The exactly-once counts were added after the run and
re-derived from its retained final state (one integration, one filing); the
reassessment still passes. Turn 4 includes the payload's refactoring and
acceptance steps; one journey is not a repeatable-cost estimate.

## Comparisons

Each pair's compact record (basis, criteria, conditions, sessions, outcomes,
effort and limits) is kept under `comparisons/`, outside the case's identity;
the raw arm evidence stays with the maintainer who ran it. A record keeps the
case basis it ran: `Distribution/tests/native-comparison.sh --recover RECORD`
finds the commit holding its exact inputs and prints it unchanged.

The 2026-11-14 assessment refresh rejects a hold that reroutes the partial
slice around the supplier's reader; its agent-facing task, wake, overlays and
events are unchanged. The record below ran the earlier case, recovered at
`9c20a808` with its inputs under `tests/`.

- [`20261114T045440-40bf`](comparisons/20261114T045440-40bf.txt), 2026-11-14:
  release v0.3.98 (`ad7aa7d`) against trunk `91f32d39`, arms concurrent at
  load about 5–16. Both held through the diagnostic pass, the unchanged wake
  and the early publication and continued once with passing proof:
  preserved. The candidate used 59 commands against 69 and 1,216 s against
  1,150 s; its two empty wakes took 8 commands and 185 s against 7 and
  165 s. Each coordinator spawned three workers. Tokens are not counted.

- [20261114T102744-1921](comparisons/20261114T102744-1921.txt), SEED-345:
  baseline 91f32d3 vs candidate 764c4e0, blocked guidance/runtime only. Both held
  through diagnostic/unchanged/early-publication events and continued once.
  Original verdict improved because the coordinator-only observer missed the
  baseline worker's passing proof; a separate owned-worker audit preserves the
  original record and establishes matching passing outcomes.
  [Token observations and conditional estimate](comparisons/20261114T102744-1921-tokens.md)
  include coordinator plus three native workers per arm: 8,386,947 vs 13,434,290
  processed tokens, with no measured saving in this forced-wake CLI case.
  The case still forces four turns; it does not observe daemon wake elimination.

- [Retained observer nonregression](comparisons/20261114T102744-1921-observer-ab.json):
  after withdrawing SEED-345's resume implementation, replay the same saved
  subjects through old and fixed proof observers. Correct delegated-proof
  recognition; 21,821,237 tokens per variant, 0.00% difference. No fresh native
  invocation; the observer runs after the model and changes no agent input.

## Reuse and limits

The original pair summaries, corrected observer audit, token-method note and
account-free per-response usage remain byte-identical. The 20261114T102744 pair
retains 174 own responses: baseline 80 / 8,386,947 processed tokens and candidate
94 / 13,434,290, across four native threads in each arm. The linked method and
usage evidence preserve turn/root-turn attribution and deduplicate inherited
history and cumulative CLI prefixes. They support historical correctness-audit
and per-wake accounting questions under those forced-turn conditions.

The known original raw attempt directories are no longer present. The summaries
and audit alone lack the turn-completion and decisive proof inputs needed by
the current reusable-baseline exporter and assessor. They are historical
evidence, insufficient for a new comparison requiring that current replay;
no complete archive or new passing judgment is manufactured from their verdicts.
Reuse the retained facts when sufficient for the declared question. A later
authorized comparison requiring missing evidence takes the ordinary fresh path;
do not rerun solely to populate a newer archive format.

The separately qualified [unblocked observation](../unblocked-supplier/case.md)
has an already-completed supplier and one ordinary root turn. Neither its lack
of event wakes nor this case's forced wakes demonstrates suppressed wakes or
event-driven savings. Those observations belong to SEED-356's actual delivery
path and quiet-workflow/skipped-wake proof, not these retained measurements.
