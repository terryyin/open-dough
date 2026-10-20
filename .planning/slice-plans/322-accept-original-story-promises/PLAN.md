# Accept slices against the original story promises

**Identity:** SEED-010#accept-original-story-promises
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#accept-original-story-promises)
**Finding:** [ODF-139](../../../docs/maintainer/findings/ODF-139.md)

## Goal and scope

Acceptance derives the current slice's applicable promises from the original
story and explicit human amendments before comparing the plan, implementation
return, and product proof. A promise omitted by both plan and return must still
reach correction, legitimate remaining ownership, or a human decision before
its dependent delivery is accepted. Preserve sufficient proof and genuine slice
boundaries. The source's six key examples are the acceptance basis.

No second obligation registry, automated semantic completeness checker,
historical product repairs, general reliability claim, release rollout, or
sibling improvement work is included. A missing first containing release or
later adoption remains explicit at ODF-139, rather than guessed or marked passed.

## Current decisions and reuse

- Change the existing acceptance owner,
  [Accept proof](../../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof),
  whose current first comparison begins with promises the return treats as
  covered. Its named-gap path already reads the story. Extend that owner to
  derive applicable original promises independently; a repeated slogan that
  plans cannot narrow stories does not satisfy the outcome.
- Reuse [story obligations](../../../src/skills/dough-execute-plan/references/story-obligations.md)
  for discovered gaps and the existing delegation, correction, delivery and
  completion paths. Keep the original story authoritative and a compact
  source-to-slice/proof comparison in existing plan/acceptance records. Do not
  add a competing promise store or make a quote check judge semantic coverage.
  Inspect linked delegation and proof-ownership guidance for consistent entry
  into this rule; link to its owner instead of copying it.
- PFE considered planning's executable-proof mapping and retrospective's
  original-intent review. They help locate intended proof and historical
  counterevidence, but neither replaces acceptance before delivery. The gap
  belongs in acceptance; existing dispositions still own what happens next.
- Reuse the native delivery-evidence fixture, host adapters, isolated workspace,
  retention and assessment infrastructure under `tests/support/`. The current
  gaps fixture explicitly names readiness/requeue in its return, and the common
  prompt supplies a slice-promises document. Those cases preserve reported-gap
  behavior but do not prove discovering promises absent from both plan and
  return. Extend this family with original-story inputs and a neutral acceptance
  request; do not precompute the missing promise for the tested agent.
- Follow [AGENTS.md](../../../AGENTS.md) behavior review and source ownership:
  edit `src/skills/`, never installed managed copies. Apply Accepted
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (one coherent responsibility and empirical improvement),
  [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  (proposed source versus containing release),
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  (native behavior versus deterministic harness proof), and
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  (one authoritative runtime rule addressed to the executing project).
  The current North Star topics concern dashboard/runtime boundaries and need
  no change for this acceptance responsibility. No ADR exception is proposed.

## Outside-in proof ownership

| Source promise | Owner | Observable result |
| --- | --- | --- |
| Example 1: readiness original example defeats narrowed plan sentence | 2 | Native acceptance identifies the contradictory supplier-resolution result, withholds it and returns original behavior/proof before delivery. |
| Example 2: terminal result labels absent from both plan and return | 2 | Acceptance independently finds both missing qualifications from Scope; green subset assertions do not clear them. |
| Example 3: release fields and both status journeys | 2 | Each original commitment reaches an applicable owner and actual product observation; an owner-decision label cannot erase an existing promise. |
| Example 4: legitimate later owner, exclusion, explicit human amendment | 2 | Controls keep the early slice bounded, cite the real owner/decision, and do not invent work or drop a remaining promise. |
| Example 5: sufficient reused proof and reported gaps | 2 | Sufficient case proceeds without blanket reruns or format-only changes; reported-gap correction retains existing ownership and independent accepted evidence. |
| Example 6: unavailable proof or disputed decision | 2 | Exact dependent promise remains incomplete with missing evidence/decision named; independent proof is preserved. |
| Representative native follow-through and honest limits | 1 establishes route; 2 establishes changed outcome | Native trace and resulting acceptance/obligation state agree; quotes, records and helper exits alone cannot pass. |
| Response provenance, release/adoption and uncertainty at ODF-139 | 2 | Finding names actual response revision and observations; first release/adoption is evidenced or explicitly pending. |

Assess the three retained failures against the source revisions cited in
ODF-139, preserving their decisive contradictions. Reconstructed small fixtures
are controlled replays, not claims to rerun the historical products. Include
corrected/sufficient, later-owned, excluded/human-amended, unavailable-proof and
reported-gap controls; equivalent controls may share one fixture when they
observe the same boundary. Reject an assessor that passes a quote-only outcome,
a fabricated obligation, or accepting the narrowed product unchanged. Preserve
actual state and command evidence for review, not merely word recognition.

## Decisive premises and preparation observations

Named checkout for these observations:
`/Users/terryyin/git/open-dough/.worktrees/accept-slices-against-the-original-story-promise`,
base `a42e5a51b3063ace98f56c40f8055d57ac64f391`, 2026-10-20.

- Historical failures are the retained observations at ODF-139, with original
  story, plan, product, revision and later correction references. They establish
  the reported seam; they do not establish deterministic reproduction on today's
  hosts. Slice 1 owns that paid question before a remedy is selected.
- Read `wrap-up.md` Accept proof, `story-obligations.md`, planning's
  `executable-proof.md`, and `delivery-evidence-{native-prompt,gaps-native-scenario-content,gaps-native-assess}.sh`.
  The existing native gap inputs disclose the missing observation in the return;
  their current pass is not proof of silent-omission detection. No existing
  test is claimed to discriminate the new behavior.
- Ran the existing obligation and assessor control operations with:
  `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/story-obligations.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-cross-slice.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-completion.test.mjs tests/native-assessor-counterexamples.sh`.
  The selected checks completed without failure output. This establishes the
  current mechanical control route only, not native semantic acceptance.
- The default shell resolves Bash 3.2; `/opt/homebrew/bin/bash` supplies the
  required test-runner version. Native host version commands completed:
  `codex --version` → `codex-cli 0.163.0`; `claude --version` →
  `2.1.304 (Claude Code)`; `agent --version` → `2026.10.18-ea085cb`.
  These are the unpaid prefix, not proof of authenticated native follow-through.
  Actual host launch consumes credentials/paid work and is bounded by slice 1.

## Ordered slices

### 1. Establish a native acceptance replay that can expose an unreported promise
Type: Behavior
Status: planned
Proof: A bounded native run reaches acceptance with original story, narrowed
plan and return, and inspectable product proof; its observed disposition is
compared with a corrected control without supplying the answer in the prompt.

Behavior: Given the retained readiness contradiction and current guidance,
when an isolated native session receives the ordinary acceptance task, the
maintainer obtains a supported reproduction or an explicit non-reproduction /
unavailable route result before investing in the remedy.

Recover the cited historical inputs first and build the smallest controlled
case in the existing delivery-evidence family. Exercise fixture product commands
and assessor counterexamples through the repository runner before any paid run.
The failing product must actually contradict the source example while the
narrowed plan proof passes; the corrected control must satisfy that example.
Use current native CLI adapters and candidate installation. Select Claude Code
first because all three retained later failures name that host; use the existing
bounded supervisor and one initial attempt, investigating a failed or inconclusive
attempt before any retry. Retain candidate, host/runtime, source inputs and
observed acceptance/correction state in this plan during execution.

Stop dependent slice 2 if the fixture leaks the expected answer, does not reach
acceptance, cannot observe its disposition, or current guidance does not reproduce
the presumed failure. Record the result and revise the mechanism/proof on evidence;
do not claim a fix from a baseline that already passes or widen story scope.
An unavailable credential/owner-held step names its owner and stays stopped.
This early probe bounds the paid decisive premise; it is not completed preparation
proof and grants no launch authority beyond the later execution instruction.

### 2. Accept applicable promises independently of the plan and return
Type: Behavior
Status: planned
Proof: Changed native acceptance detects the three source-derived omissions,
feeds real correction/ownership decisions, and preserves the unchanged controls;
focused mechanical regression proof stays green.

Behavior: Given a slice whose plan and return omit or narrow an applicable
original-story promise, when the coordinator accepts its proof, it identifies
that promise from the original source and prevents dependent delivery until
behavior/proof or a legitimate human decision resolves it. Given sufficient
proof, an excluded promise or valid later ownership, it preserves that boundary
and proceeds where supported.

Change the acceptance rule and the smallest linked guidance needed to reach it.
Keep scope derivation before comparison with the return, preserve explicit human
amendments, and use existing obligation handling for newly found gaps. Exercise
readiness, terminal-label and release-progress cases through the same common
rule; do not create a recognizer or runtime branch for each historical symptom.

Extend the probe's fixtures and counterexamples only as required for the mapped
proof. Use representative native runs and justified reuse per affected requirement
on Codex, Cursor and Claude Code; one host's outcome proves nothing about another.
Share cases rather than multiplying every case across every host. At least one
native trace must show discovery followed by a correction handoff or a withheld
dependent delivery, and a corrected case must subsequently be accepted. Inspect
the concrete product/proof boundary and obligation ownership, not only the final
report. Record unresolved native requirements explicitly; without evidence or
justified reuse they remain unfinished and affected release is not cleared.

After edits and independent post-change refactoring, run focused affected proof
through `scripts/test.sh` with Bash 5 first on PATH. Preserve the existing
obligation/control checks above; add the selected new fixture/assessor checks and
any consumers their changes reach. Run `tests/payload-declaration-links.sh` if
runtime references or declared dependencies change. The local skill-authoring
gate is AGENTS.md's invocation/context/useful-outcome walkthrough, including the
human-conflict control. Hosted CI configuration alone adds no whole-suite local
gate. Follow ordinary execution delivery, agent commits and CI ownership; do not
publish a knowingly failing increment.

Update ODF-139 with the implemented response revision, observed discrimination,
retained positive/counterevidence and limits. Verify a first containing release
and adoption only if they actually exist; otherwise state they remain pending.
No release or cross-project rollout is authorized by this story's preparation.

## Sizing and safe stopping

Two cohesive proof loops: establish the uncertain native observation route,
then change and prove one acceptance behavior. The three historical cases are
examples of one rule, not separate production mechanisms. The probe can end
with useful contrary evidence and stop the remedy. No numeric slice limit or
S/M/L calibration is supplied; native availability and follow-through are the
material sizing uncertainty. If new evidence changes source scope, stop that
path for its human decision rather than expanding the plan.

## Learnings

None from execution yet. Preparation observed that existing named-gap fixtures
cannot by themselves demonstrate discovery of a promise absent from the return.
