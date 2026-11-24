# Reduce Codex wakes during supplier watches

**Identity:** SEED-431#reduce-codex-wakes-during-supplier-watches
**Source:** [Reduce Codex wakes during supplier watches](../../seeds/SEED-431-reduce-codex-wakes-during-supplier-watches.md#reduce-codex-wakes-during-supplier-watches)

## Goal and scope

Give the coordinator an active Codex supplier watch that meets the seed's wake
and cache limits and preserves publication judgment, continuation and deadline
handling. Reuse [the installed watch contract](../../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#watch-a-paused-supplier)
and its Git observer. This work is confined to Codex supplier waits. Keep
Claude Code's wait and the generic proof and CI wait routes. A new publication
transport and release rollout are outside the delivery scope.

The prior [released evaluation](https://github.com/terryyin/open-dough/blob/034822b01088941dd0b306874bc608e12c11be38/.planning/slice-plans/692-verify-silent-supplier-wait-in-codex/PLAN.md#measured-watches-and-recommendation)
observed at least 94 wait-only requests across five intervals with an
allowance of 19. Request and cache estimates there cover watch-only actions.
The native proof here also accounts for other requests caused solely by the
watch and bounds uncertainty from mixed or unattributed responses.

The local gate is the focused publication-wait CLI checks below and the
[representative skill behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review).
For long local commands use `caffeinate -s -i` on AC power under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Current decisions

- [ADR 0005, Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  requires native evidence for this changed host behavior. Use current and
  candidate payloads in the same isolated Codex profile, with fixed model and
  effort, comparable initial conversation/cache state, and an independent
  supplier schedule. Use the released evaluation as historical context and the
  matched current run as the comparison.
- [ADR 0006, Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  keeps result handling in the existing supplier-watch procedure. Change the
  Codex attachment to that procedure in the Distribution source. The existing
  CLI owns refs, publication deltas and absolute deadline. The CI observer is
  a separate failure-notification lifecycle. Keep its callers on the same route.
- [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  governs the comparison. Compare correct result handling first, then attributable
  requests, processed tokens and recovery effort. Bound the conclusion to the
  observed profile and cases.
- Follow [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  Exercise the existing CLI against a bare local remote. A deterministic
  regression for any added executable seam should call that seam directly.
  The existing test support supplies the Git fixture. Use the native
  coordinator for evidence of model wakes.

## Outside-in proof

| Promise | Owner | Observable signal |
| --- | --- | --- |
| Active unchanged watch meets wake and cache limits | 2 | In the publication and deadline journeys, match each interval from watch entry or rerun to receipt using tool handles and supplier events. Record elapsed time, allowance, distinct attributable request IDs, cached/input sums, and ambiguous requests. Zero requests passes the cache criterion. |
| Nonqualifying publication preserves the hold, and a qualifying push during judgment is caught on rerun | 2 | An independent producer records the intermediate push, its receipt, and the qualifying push before the next launch. The trace shows the same remote, refs and deadline and the expected change from the prior observation. Continuation and its proof happen once. |
| Deadline stops the hold with a usable resume condition | 2 | No qualifying push occurs. The coordinator handles the original deadline receipt, leaves the partial work intact and records the named condition for resuming. |
| Shared CLI receipts and Claude Code behavior are preserved | 2 | The focused CLI suite exercises quiet waiting, both terminal shapes and rerun continuity. The source diff and representative review verify the Claude Code path stays on its existing background completion route. |

Use `ceil(elapsed seconds / 300)` per unchanged interval. Exclude the initial
launch and terminal-result judgment, and count distinct responses that service
the watch, including retries and wait-only commentary or inspection. Record
independent work and mixed or unknown attribution separately. When ambiguous
responses could change either verdict, keep the measurement inconclusive.
Record each terminal result and next action beside its interval. Keep rollout
IDs and bounded lines or event IDs with the numbers so a reviewer can recount.
The historical count is a lower bound and remains labeled as such.

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| The published symptom can be attributed to wait returns | 1 chooses what to remove, 2 measures the before and after | Recounted the November 20 retained Codex 0.171.0 rollout ending `ee066c533a92`, Open Dough 0.3.109 at `d7bcd9af3`. Lines 3069–3147 cover 506.493 s. The seven distinct meters at 3078, 3084, 3107, 3113, 3119, 3139 and 3145 give 2,883,968 of 2,887,347 input tokens cached, with seven watch-only requests against two allowed. The retained evaluation ties the returns to the live cell and shell handles. Slice 1 tests the host route in the current profile. |
| The Git observer already supports the receipt and rerun contract | 2 preserves that contract | On `0b69dd0a7`, `node --test Distribution/tests/skills/dough-execute-plan/wait-for-publication.test.mjs Distribution/tests/skills/dough-execute-plan/continued-wait-for-publication.test.mjs` passed all 13 cases against local Git, including a push during judgment and expiry with an unreadable remote. A real-clock smoke check in an unchanged bare-remote fixture ran `node <source>/wait-for-publication.mjs --remote origin --ref main --duration-minutes 0.02` and exited zero at the deadline with one deadline receipt and empty stderr. Native coordinator handling at deadline remains Slice 2 proof. |
| A native Codex watch can survive short inner returns within a sufficiently long host wait | 1 probes the route before 2 changes guidance | In this preparation, a three-second shell command yielded a shell session at 250 ms. Empty `write_stdin` requesting 300,000 ms inside the same yielded cell, followed by `functions.wait` requesting 300,000 ms, returned the terminal output once. This short API observation leaves the effective native cap and wake count across five minutes open. Slice 1 owns that observation. |
| A native result can be observed using an isolated fixture and a saved rollout | 1 reaches the real tool envelope, 2 reaches publication and deadline through installed guidance | Here `codex --version` returned 0.171.0 and `codex exec --help` offered `--json` with a selected checkout. `PATH=/opt/homebrew/bin:$PATH bash Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-supplier-watch-retired.sh` passed, confirming the old fixture refuses before host start. The bare-remote fixture and retained rollouts provide inputs and a reader. Native admission and the actual wait route require Slice 1's probe. |

## Ordered slices

### 1. Observe the effective Codex wait
Type: Behavior
Status: planned
Proof: In the target native Codex profile, a bounded unchanged watch on a
local bare remote reaches its original deadline. Show literal calls, tool
return timestamps and the saved rollout. Record the effective outer wait,
how short shell returns were handled and how many model requests were needed.
Size: 10–15 active minutes with the existing Git fixture and rollout locators.
Time inside the observed wait uses the slice clock.

Behavior: With a named unchanged supplier and a deadline a little over five
minutes away, use the target coordinator's native route to run one watch in
an isolated checkout. Start with one cell that keeps its shell polls inside
the tool and waits on that cell for the supported outer duration. Use a local
producer and no shared remote. Inspect the real route through the terminal
receipt and wake counters. The [native guidance check procedure](../../../Distribution/evaluation/guidance-checks.md#redo-the-source-phase-for-an-uncovered-finding)
gives the isolated redo when no native case qualifies. Confirm the route
retains the rollout and matches the tool profile being tested. Obtain the
existing human authority for a paid native run before launch and apply
[the expensive-proof check](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#choose-expensive-proof-before-launch).

If the host truncates the outer wait below what the wake limit permits, use
at most one diagnostic of an existing host-supported terminal wait with the
same early-return and deadline evidence. Stop Slice 2 if no observed route
can satisfy the wake bound or if the real route or saved attribution is
unavailable. Retain the observed cap or refusal and replan from that evidence.
Keep experiments and any transient profile overrides in the isolated proof
setup.

### 2. Keep the Codex supplier watch active through its result
Type: Behavior
Status: planned
Proof: The two matched native journeys in the proof map exercise the installed
route and meet both bars with correct continuation or deadline handling. Re-run
the 13-case CLI gate and the representative skill review.
Size: 10–15 active minutes once Slice 1 supplies the route, proof commands and
trace locators. Run the matched journeys in the same fixture and record only
the evidence needed to recount their verdicts.

Behavior: With a blocked Codex execution and a named supplier, apply the route
observed in Slice 1 from the existing supplier-watch instructions. Keep one
watch in progress until the terminal receipt even when its tool handles return
early. Use the unchanged receipt to decide whether to continue, rerun against the
same absolute deadline or stop with a resume condition. Keep the shared
observer and existing caller routes.

Pin the before and after payloads and run one matched pair for publication and
one for expiry under the same native-run authority. In the publication pair
leave an unchanged interval a little over eight minutes, emit a nonqualifying
change, then publish the agreed outcome after the intermediate receipt and
before rerun. Capture both producer timings independently. In the expiry pair
hold the remote unchanged beyond five minutes through the original deadline.
Use a neutral blocked-work prompt and let the trace show the coordinator's
choices. If the producer did not hit the judgment window, that example
remains unobserved. Accept the change only with evidence of the bars and
terminal behavior. Keep inconclusive or negative results open under the
execution workflow.

## Plan review

Further refinement was unnecessary. The first slice isolates the host timing
premise and can stop the work before any product change. The second owns one
handoff from an active watch to its existing result handling and proves both
ways the watch ends. Both use the same retained Git observation and deadline.
No remaining slice-specific concern emerged beyond the bounded early probe.
