# Reach a proof decision from retained evidence

**Identity:** SEED-345#reach-a-proof-decision-from-retained-evidence
**Source:** [Reach a proof decision from retained evidence](../../seeds/SEED-345-session-token-efficiency.md#reach-a-proof-decision-from-retained-evidence)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

A coordinator accepts a slice as soon as the required evidence settles the
decision. It moves straight to the refactor pass and investigates further only
for a named expected/actual mismatch or a specific evidence gap. The story
section owns the scope, its limits and the key examples. This plan adds none.

Included: the stopping instruction in `dough-execute-plan`'s
[accept proof](../../../Distribution/src/skills/dough-execute-plan/references/wrap-up.md#accept-proof).
Also included is the grouped disposition for generic or historical matches in
[record the consumer trace](../../../Distribution/src/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace),
which owns the rule that every listed consumer gets a disposition. A guidance
structure test covers both.

Excluded: timers, budgets and slice-clock changes; the refactor pass;
diagnosis rounds; execution retrospectives and story review; retained output
and hand-backs, which belong to the
[sibling story](../../seeds/SEED-345-session-token-efficiency.md#recover-decisive-verification-evidence);
installed copies under `.agents/skills/` and `.claude/skills/`, which update
only from a release; and any paid run.

## Existing solution and direction

PFE result: both rules extend their existing owners in place.

- `wrap-up.md` already requires a concrete expected/actual mismatch before
  returning work (the paragraph beginning "Return a concrete expected/actual
  mismatch"). It does not say when acceptance ends. The new exit sentence
  belongs beside that requirement and states the decision both ways: when to
  accept, and what licenses further inspection.
- `executable-proof.md` requires `run`, `reused` or `excluded: <reason>` for
  every listed consumer. The grouped disposition reuses `excluded: <reason>`
  for a named group, such as done records, retired plans, the changelog or
  unrelated text matches. It adds no new disposition kind and no script
  change.

No Accepted ADR or North Star topic constrains this. Write the guidance for
the executing agent under
[author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md)
([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)).

## Outside-in proof

| Key example | Signal |
| --- | --- |
| 1. Sufficient evidence → accept and dispatch refactor | The structure test asserts that accept proof states the exit condition (decisive observations for source promises, affected consumers and required gates; recorded obligations; no unresolved mismatch) and the move to the refactor pass. The behavior review walks the SEED-348 slice 5 return to acceptance without further inspection. |
| 2. Real mismatch → return | The existing "Return a concrete expected/actual mismatch" requirement stays, and the test asserts it. The walk returns a wrong-view note. |
| 3. Evidence gap → obtain or return | The existing filtered-proof paragraph stays, and the test asserts it. The new sentence names a specific evidence gap as a reason to continue. |
| 4. Speculative edge case → no investigation | The test asserts that further inspection needs a named mismatch or evidence gap. The walk shows an unpromised "what if" reaching acceptance. |
| 5. Noisy search → grouped disposition | The test asserts that the consumer-trace rule allows one `excluded:` reason for a named group of generic or historical matches. The walk uses the premise's real trace below. |
| Refactoring unbounded; proof rows kept | The test asserts that neither changed section bounds the refactor pass in time, and that the filtered-proof, consumer-proof and failure-policy links remain. |

## Premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A broad consumer search lists hundreds of generic or historical matches | Example 5 and the slice's behavior walk | 2026-11-17, this workspace at `a53e3a2d4` plus the uncommitted seed edit: `node .claude/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base HEAD --term acceptance` → 1,072 lines, of which 285 name `.planning/` paths and 363 name DearDough or done records | Settled |
| The focused structure-test route selects and discriminates guidance text | Slice 1 proof | 2026-11-17, this workspace: `bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/execution-increment-delivery.test.mjs` → exit 0. A scratch edit breaking `wrap-up.md`'s owner link → exit 1 with the expected/actual match; reverted. | Settled |
| No existing test pins wording this change removes | Slice 1 consumer trace | `grep -rn` across `Distribution/tests` for `executable-proof.md` and "listed consumer" → none. `wrap-up.md` is read only by `execution-increment-delivery.test.mjs` (owner link, no push wording) and `ci-supported-host-contract.test.mjs` (observer wording), and this change touches neither. | Settled; the slice's consumer trace still runs |
| The overrun was acceptance deliberation, not command waits or lost evidence | Story evaluation baseline | Codex rollout `01a1e6bd-…`, items 2224–2339: worker return 02:16:10 → refactor dispatch 02:33:00; five file and diff reads, no test or wait; no tool call 02:23:52–02:31:39 | Settled; recorded in the story's Baseline |

## Slices

### 1. Acceptance ends once the evidence settles the decision
Type: Behavior
Status: done

Behavior: a coordinator has a slice return whose source promises, affected
consumers and required gates each have a decisive observation, with
obligations recorded and no unresolved mismatch → it reads accept proof → the
guidance tells it to accept and start the refactor pass. Further inspection
needs a named expected/actual mismatch or evidence gap. Generic and historical
consumer-trace matches take one grouped `excluded:` reason. The existing
mismatch return, filtered-proof selection, consumer proof and failure policy
stay unchanged. Contrary wording that invites open-ended scrutiny in the two
changed sections is removed.

Proof: new `Distribution/tests/skills/dough-execute-plan/acceptance-stopping-rule.test.mjs`,
a guidance-structure test following `execution-increment-delivery.test.mjs`'s
`markdownSection` pattern. It asserts the outside-in proof rows above and
fails when the scratch build removes the new exit or grouped-disposition
sentence. `bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/acceptance-stopping-rule.test.mjs Distribution/tests/skills/dough-execute-plan/execution-increment-delivery.test.mjs Distribution/tests/skills/dough-execute-plan/ci-supported-host-contract.test.mjs`
passes. Walk the
[behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review)
through examples 1, 2, 4 and 5 on the changed text. The consumer trace for
both changed files is recorded with dispositions. `npm run --silent format`
and `npm run lint -- --staged` are clean.

## Current decisions

- Instructions only, as Terry asked on 2026-11-17. Evaluation is a keep or
  stop judgment from the next real planned execution's trace against the
  story's Baseline. No paid comparison.
- Every local proof is the focused set above. No full suite is required: the
  change touches only guidance text and adds one test file, and hosted CI
  runs the rest after publication. Local gate: follow
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  start fully awake; on AC power use `caffeinate -s -i` for any longer run;
  on battery, plug in.
- Failures follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Accepted proof (slice 1)

- Command: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/acceptance-stopping-rule.test.mjs Distribution/tests/skills/dough-execute-plan/execution-increment-delivery.test.mjs Distribution/tests/skills/dough-execute-plan/ci-supported-host-contract.test.mjs` → exit 0 (coordinator re-ran subject after refactor reflow).
- Product: `wrap-up.md` Accept proof states exit + refactor move, retains mismatch return and filtered-proof gap path, gates further inspection on a named mismatch or evidence gap; `executable-proof.md` Record the consumer trace allows one grouped `excluded:` for generic/historical matches.
- Source commitments 1–8 observed in [source-review.md](./source-review.md).
- Refactor: file-size reflow of `executable-proof.md` to 250 lines; `## REFACTOR COMPLETE`.

## Learnings

- Structure-test regexes that pin wrap points are brittle under file-size reflow; keep asserted phrases contiguous or update the test with the reflow.

## Concern review

Refinement was not needed: one slice, one cohesive guidance change across the
two owners of the rule, with proof mapped and premises settled. This review
identified no remaining slice-specific concern.

## Execution complete

Product advice: No backlog change — delivery matches the planned stopping rule
and grouped consumer-trace exclusion; keep/stop still waits on the next ordinary
planned execution’s acceptance trace against the SEED-348 slice 5 baseline (this
delivery’s own accept→refactor handoff is an early keep signal, not a substitute
evaluation); sibling SEED-345#recover-decisive-verification-evidence stays
independent.
