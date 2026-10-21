# Match native replay inputs to historical evidence

**Identity:** SEED-053#match-historical-replay-inputs
**Source:** [Selected story](../../seeds/SEED-053-native-guidance-acceptance.md#match-historical-replay-inputs)
**Finding:** [DD-320](../../../ProjectFindings.md#dd-320)

## Execution context

Established Story Branch execution: publisher `dashboard-territory.local-open-dough`,
agent `ivan-chan`, workspace and originating checkout
`/Users/terryyin/git/open-dough/.worktrees/match-native-replay-inputs-to-historical-evidenc`,
branch `codex/match-native-replay-inputs-to-historical-evidenc`.
Integration/default checkout: `/Users/terryyin/git/open-dough`; remote `origin`,
trunk `main`. Starting revision `a397b76146efd51267efb25df91e2b07002ede91`;
accepted claim and first increment base `4164a53619c47939d47911ddfbc4df96201efe71`
(confirmed on the remote execution branch). Established-start ownership is reused;
no second Take. Existing planning authority permits in-scope replanning; no
numeric slice limit or exception applies beyond the plan's bounded outcome.

Prepared this exact checkout with locked Node `24.21.0` and successful
`node scripts/setup-native.mjs npm`, `browser`, and `check` stages. The check
launched Chromium `153.0.8010.12`. The selective formatter is `npm run format`;
the tracked pre-commit hook checks staged lint and typechecks staged scripts.
There is no generation trigger for this documentation/fixture-check change.

CI: GitHub Actions `terryyin/open-dough`, verified active `ci.yml` (`CI`),
observing the execution branch. Codex coordinator `ivan-chan-337`, yielded cell
`11`, session `70856`, directory `/tmp/dough-ci-501/watch-n1O1fz`, PID `7458`,
bound to this checkout. The earlier trunk claim remains unobserved by this
story-branch observer. Increment publication retains this observer identity.

## Goal and scope

Before spending another native run, maintainers can compare the existing
proof-scheduling scenarios with the retained historical occurrences and tell
which question each scenario can answer. Make introduced knowledge, actor and
delegation differences, missing context and historical reachability explicit.
Deliver a maintained, evidence-linked comparison beside the existing launch
instructions, consistent scenario descriptions and credential-free input checks.

The comparison covers plan 302 and plan 310 as retained at
[ODF-249](../../../docs/maintainer/findings/ODF-249.md), and both plan-323
scenarios. Preserve their useful controlled scheduling checks. No published
skill change, generic replay engine, new host integration, forced delegation,
proof-scheduling remedy, paid run, release or rollout is included. No native
behavior or cost saving is promised by this preparation or by fixture checks.
Update DD-320 with the actual response revision and remaining native outcome gap
when implementing; do not resolve it from a queue entry or green checks alone.

## Existing solutions and architectural direction

PFE: use [native publication documentation](../../../tests/native-publication.md)
as the maintained pre-launch comparison home. A small manual comparison meets
this story; a new historical-equivalence schema, classifier, launch gate or
framework has no demonstrated need. Keep the comparison outside the generated
agent workspace so it does not supply the answer under observation.

Reuse `tests/proof-scheduling-native.sh` and the existing delivery-evidence
family: `delivery-evidence-native-prompt.sh` constructs the task;
`delivery-evidence-scheduling-native-scenario-content.sh` writes project inputs;
`delivery-evidence-scheduling-native-checks.sh` exercises generated text and
product commands; the existing observer/assessor owns scheduling verdicts.
The runner and evidence helpers already retain the prompt, input hashes,
installed guidance identity, event stream, proof logs and final product.
Changing host launch, stream parsing or retention is unnecessary for this outcome.
Do not create another evidence home or conflate a scheduling pass with a
historical-equivalence verdict.

Follow [AGENTS.md](../../../AGENTS.md) and Accepted
[ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
no answer-supplying prompt, no substitute-process/native-proof equivalence,
no transfer of host evidence and no paid run in default checks. This story changes
repository-owned fixture interpretation, not distributed runtime guidance.
The current [North Star](../../NORTH-STAR.md) concerns dashboard and execution
infrastructure; this local comparison introduces no consequential architecture
choice and requires no new topic or ADR exception.

## Outside-in proof ownership

All promises belong to slice 1; the maintained comparison is the user-facing
boundary. Its semantic review and the executable input checks serve different
purposes.

| Promise | Observable proof |
| --- | --- |
| Explain introduced knowledge before selecting a run | Walk from existing launch instructions to the comparison. Recover plan 323's first fixture/result and plan 302's retained brief. The comparison names the fourteen-minute cost, stylesheet rule, actor receiving them and observed consequence, with source revision/path and retained-summary limits. |
| Distinguish coordinator and delegated implementer | Compare both current generated prompts/project files with both retained occurrences. The table states that one selected slice permits local implementation; a refactor call proves no implementer delegation. Plan 302's mistaken estimate and plan 310's whole-suite briefs stay distinct. |
| Keep unknown context and reachability honest | Review a source with unknown installed-guidance provenance and a missing full delegation transcript. The comparison leaves those unknown, qualifies reconstructed conditions, and never reports a reached historical boundary from input inspection or an ordinary scheduling pass. |
| Preserve useful controls and actual inputs | Extend the existing scheduling text checks to inspect the generated quick fixture's cost/layout instructions as well as the planned fixture's absence of them, and their prompt/plan shape. Run the existing product, counterexample and substitute-host journey via the focused command below. |
| State what a later authorized run could establish | Each scenario has a useful question, material mismatches and explicit limits. Known-cost control and qualified coordinator scenario are distinguished from a faithful historical replay; supplied answers cannot count as reaching the historical boundary. Native implementation delegation and refactor-time extraction require actual role/command evidence from a separately authorized run. |
| Retain finding evidence and response limits | Inspect DD-320 after implementation: original occurrence preserved, actual containing response revision and direct comparison linked, native behavior still unobserved where applicable. Do not rewrite ODF-249's settled remedy disposition. |

The generated instructions and prompt are consumed by native agents and by
`run_delivery_evidence_scheduling_text_checks`; comments/help and the native-test
documentation are consumed by maintainers selecting a run. Keep the comparison
out of those agent-visible instructions. Preserve scenario identifiers, prompt
behavior, observation field contracts and existing scheduling rejection semantics.
These constraints avoid unnecessary changes to shared runner/stream consumers.
If implementation changes any of those contracts, trace its real consumers and
extend proof before delivery; the current plan does not assume such a change.

Focused execution proof, per [tests/README.md](../../../tests/README.md):

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/proof-scheduling-native.sh
```

The added input checks must discriminate: temporarily remove the declared cost
or layout steer from the quick fixture and observe the appropriate check fail,
then restore and pass. Existing planned-text rejection checks cover the opposite
condition. Use semantic review for historical equivalence and source uncertainty;
do not encode a prose keyword checklist as evidence of historical fidelity.
Use broader native-evidence checks only if their shared contract changes.

## Ordered slices

### 1. Make the historical limits of each scheduling scenario visible before launch

Type: Behavior
Status: done
Proof: The comparison walk and generated-input checks above, with all existing
credential-free scheduling controls passing on the final changed state.

Behavior: Given a maintainer considering either scheduling scenario, when they
follow its launch documentation and inspect its generated inputs against the
retained occurrences, they see its historical sources, introduced assumptions,
actor/delegation differences, known gaps and allowable conclusions before paying
for a run. A control remains useful without masquerading as a faithful replay;
unknown source conditions remain inconclusive.

Add the compact comparison to the existing native-test documentation and link
it from the scheduling entry point's usage/comment guidance as appropriate.
Align misleading scenario descriptions (including the suggestion that the
planned fixture itself recreates delegated occurrences). Keep historical
quotations attributed to their actual retained source rather than asserting a
complete transcript was recovered. Explain the scheduling assessor's narrower
meaning without replacing its state/coverage checks with a historical verdict.
Extend generated-input proof in the existing check owner; do not add a parallel
runner or feed the comparison to the native agent. Update DD-320's response and
native-outcome gap once a real response revision exists, through normal execution
publication. Keep implementation, proof and local cleanup in this slice.

Sizing and safe stop: one comparison outcome and one existing fixture proof loop;
no numeric slice target or hard limit is supplied. A missing historical detail
is an explicit unknown, not a reason to fabricate a reconstruction. If the desired
outcome changes to a faithful delegated native replay or a guidance remedy,
stop that expansion for a separate human scope/paid-run instruction.

During authorized execution, apply installed Execute Plan's independent
post-change refactoring, focused proof, delivery and review gates. The project
sets `skipProcessRetrospective: false`. Apply changed-file formatting and the
repository commit hook; hosted CI alone does not mandate every local suite.
These future execution duties grant no implementation authority to preparation.

## Preparation observations and decisive premises

Observed on 2026-10-21 in
`/Users/terryyin/git/open-dough/.worktrees/match-native-replay-inputs-to-historical-evidenc`,
base `7d7353169a846b52c7ecc148a0e6f5be9e19cb5e`.

- `git show 6922dc32:.planning/slice-plans/323-schedule-proof-after-refactoring/PLAN.md`
  recovered the actual planned conditions and accepted execution records for
  both replays. The first explicitly prescribed stated realistic suite cost;
  its result records the no-suite refactor brief and early extraction. The second
  records local implementation, a baseline suite and an unreached move boundary.
- `git show dd2e25b59563d02bdbe4f484d98ccd4c113b6339:.planning/slice-plans/302-keep-direction-readable-after-phone-session-start/PLAN.md`
  recovered accepted proof of the stylesheet move and final-suite qualification.
  It is not the full delegation conversation. The “few minutes” brief, 13.6/14.4
  minute observations and plan-310 whole-suite briefs are retained summaries at
  ODF-249; DD-320 records the input mismatch. Missing full conversation and
  unknown plan-302 installed provenance limit historical claims, not this
  comparison's deliverability.
- Ran the exact focused command above in this checkout: exit 0. It generated
  both scenarios, checked planned text and neutral prompts, ran real product
  proof and broken-consumer controls, assessed controlled sequences, and exercised
  the existing substitute-host runner/retention. This establishes the reusable
  unpaid proof route. It proves neither agent behavior nor historical equivalence.
- Inspected those checks and the prompt, scenario writer and assessor. The current
  check asserts the planned fixture has no cost/layout steer but does not directly
  assert the quick fixture's declared cost/layout distinction; slice 1 adds that
  missing discriminating proof. No product source or native session was changed
  during preparation.

## Current decisions and concern assessment

- Preserve existing scenarios and identify their limits; no automated claim of
  historical fidelity and no forced reproduction. Existing input evidence and
  source locators are sufficient for the bounded manual comparison.
- No supplier dependency or pre-Take human decision is needed. Fresh native
  outcomes are deferred evidence, not a premise on which this implementation
  depends. Historical unknowns remain part of the promised result.
- Slice-plan refinement was not needed: one cohesive behavior owns the comparison,
  input proof and finding-response update, with no speculative structure.
- No remaining slice-specific concern was identified in this preparation review.


## Accepted implementation proof

Source-only review: fresh non-inheriting `/root/original_source_review`; its
launch contains the verbatim selected story at claim `4164a536`, and its full
returned commitments remain in this execution conversation. Acceptance used
that return, not the earlier paraphrased review or the narrower slice text.

| Original trigger and expected result | Actual observation and disposition |
| --- | --- |
| Before selecting another paid replay, compare both scenarios with plan 302 and plan 310 beside launch instructions | `tests/proof-scheduling-native.sh --help` leads to the maintained comparison in `tests/native-publication.md`; both historical rows name sources, their limits, knowledge, actors and consequence. |
| Inspect prompt, AGENTS.md, seed/plan and installed-guidance conditions together; neutrality alone is insufficient | Comparison tables name each input/recipient, current-branch authorization, quick/no-plan versus selected slice, required suite, cost/layout distinction and installed-payload identities; inspected current prompt, writer, installer and retained input revisions. |
| Quick control exposes fourteen-minute/layout knowledge against plan 302's mistaken estimate and first paid result | Tables and retained plan-323 observations distinguish the few-minute estimate, introduced cost/layout, no-suite refactor brief and implementation-time extraction. Recovered `6922dc32` plan 323 and `dd2e25b5` plan 302; brief/timing evidence remains attributed to ODF-249's summary. |
| Planned coordinator scenario preserves local-implementation possibility and distinguishes both historical implementer briefs | Comparison states that one selected slice permits local work, a refactor call proves no implementer delegation, missing cost differs from mistaken cost, and plan 310's whole-suite delegation is absent. |
| Summary-only or unknown guidance context stays unknown/inconclusive; labelled controls remain usable | Missing full transcripts and unknown plan-302 installed provenance remain explicit; useful questions and later-run limits require actual role/command/state evidence, with no machine historical-equivalence verdict. |
| Preserve controls and actual inputs without supplying the answer, forced delegation or a new harness/evidence home | Existing check owner observes generated quick cost/layout, prompt/no-plan shape and planned hint absence. No prompt/generated project bytes, scenario IDs, assessor field/rejection contracts, host adapters or distributed guidance changed. The comparison stays outside generated agent workspaces. |
| Fixture proof establishes inputs/control behavior, with no native behavior, historical replay or savings claim | Focused command below passes through real product commands, counterexamples and both substitute-host journeys/retention. Native claims remain limited to retained Claude conditions; no paid run, release, rollout or remedy occurred, and ODF-249 remains settled. |
| DD-320 preserves the qualified occurrence, links comparison and separates response from native outcome | Original occurrence is unchanged and direct comparison/native-gap text added. Actual response SHA is recorded after this implementation's accepted publication, before slice completion. |

Literal focused command: `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/proof-scheduling-native.sh`;
terminal exit 0 before mutations and after both restorations. Same command
with only quick cost removed exited 1 (`quick project text omits the declared
fourteen-minute suite cost`); with only quick layout removed exited 1 (`quick
project text omits the new-stylesheet layout steer`). Original source restored.
Inspected setup/assertions: `run_delivery_evidence_scheduling_text_checks`,
`run_delivery_evidence_scheduling_product_checks`, entry-point controlled trace
assertions, assessor counterexamples and selected planned substitute journey.
Consumer trace includes prompt/writer → fixture install → observer/assessor →
retained artifacts; documentation entry points/legacy anchors remain reachable.
This accepts fixture behavior and semantic comparison, not native equivalence.

## Story obligations

### G1. Native outcome remains unobserved
Reported: slice 1 — "no new native session ran; historical implementer delegation and refactor-time extraction remain unobserved in these scenarios."
Story clause: "The response can be implemented with the native outcome still unobserved"
Disposition: excluded "Paid runs, release and rollout are outside this delivery"

### G2. Full historical transcripts and plan-302 installed provenance are unavailable
Reported: slice 1 — "retained summaries/accepted proof do not recover a full delegation transcript or establish plan-302 installed-guidance provenance."
Story clause: "the comparison labels that context unknown and historical reachability inconclusive"
Disposition: proved by slice 1: `tests/native-publication.md#proof-scheduling-scenarios-compare-inputs-before-launch`, historical source-limit rows and retained-output interpretation explicitly label the unknowns and limit reconstructed reachability; inspected against ODF-249 and recovered plans 302/323.

Response revision: `fba97e9fbb90c4f97909a5e2ab899a0031c58308`, accepted on the remote execution branch.

## Execution complete

Product advice: no backlog change. The maintained pre-launch comparison and discriminating input checks satisfy this bounded story. Native recurrence/replay remains unobserved and explicitly outside this delivery; ODF-249 retains its settled no-guidance-change disposition.
