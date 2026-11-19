# Trial a quieter Codex wait for long verification

**Identity:** SEED-345#get-long-verification-results-without-empty-wakes
**Source:** [Selected story, scope and examples](../../seeds/SEED-345-session-token-efficiency.md#get-long-verification-results-without-empty-wakes)
**Source review:** [Independent source review](source-review.md)

## Goal and scope

Use a small native Codex trial to decide whether to release new coordinator wait
guidance. At the end of the story, record a second decision on whether retained
Claude Code evidence justifies a separate paid trial. The developer queued the
Codex trial for the next Take on 2026-11-19. This scope covers the two decisions
and the smallest supported Codex guidance change if it earns a Deploy decision.
A client rollout and a new Claude Code session are outside the story.

## Current decisions

- Use [delegation](../../../Distribution/src/skills/dough-execute-plan/references/delegation.md#await-delegated-results-without-empty-calls)
  for the coordinator's wait and [wait for proof](../../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md)
  for the original command's continuation. Keep one authority for each decision.
  The slice-clock run record, exit file and log identify terminal proof.
  [Overdue verification](../../../Distribution/src/skills/dough-execute-plan/references/overdue-delegated-verification.md)
  owns liveness, and [CI completion](../../../Distribution/src/skills/dough-execute-plan/references/ci-completion-wait.md)
  owns the applicable revision's receipt. [ADR 0006, Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
- Pin current source guidance and retain the earlier worker foreground wait in
  both Codex arms. Use isolated checkouts, a neutral prompt and the same command,
  expected window, intervention schedule, revision, host profile, model, effort,
  speed, cache policy and load conditions. Record actual settings and
  mismatches. Use the same versioned rate card and count both agents through
  proof acceptance, including rereads, handoffs and recovery. Track empty
  delegated waits, empty subprocess continuations, unavoidable host handbacks
  and meaningful interventions separately. [Native guidance checks](../../../Distribution/evaluation/guidance-checks.md),
  [ADR 0005, Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
  and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Decisive premises and retained evidence

| Operation | Observed result and remaining question |
| --- | --- |
| Read the Codex coordinator and worker | In root rollout `01a1ef2f-03bc-7f72-b131-aa967975fa9f`, 225 paired `wait_agent` calls yielded 166 timeouts, 58 completions and one input interruption. The audit linked 165 distinct responses to timeout-only batches across the execution. In worker `01a1ef33-a824-7a51-8490-d1903d398c28`, shell session 15565 returned the successful `s1-backend-proof` record. The coordinator made two timeout-following responses during that proof. The historical run used installed 0.3.106 with command-wait blob `852575ef2447`. Its evidence establishes exposure. |
| Pin the current Codex control | Distribution wait guidance includes the foreground wait from `bc3d8b734` (blob `604dee835f34` at preparation). That change separately observed a foreground caller returning exit 17 and an exact-revision CI caller returning after a host handback. The native catalog has no delegated-proof case. Codex 0.170.0 exposes app-server `turn/start`, `turn/steer` and `turn/interrupt` in its schema. Slice 1 probes actual delegation, an intervention and artifact attribution in the selected profile. |
| Recover exact terminal evidence | At claim `7c0ed001d`, the local preflight accepted real slice-clock exit 0 and exit 7 with the exact assertion. It rejected a live launch snapshot and a failure lacking its assertion. The report and run records are under `s1-terminal-proof.YI0Kw3Yy/` in the previous execution worktree's Git evidence directory. This qualifies the local assessor only. |
| Assess the prospect of a Claude Code saving | In family `47460e10-ccb0-41b1-abd2-286a85d35572`, Claude Code 2.1.327 worker `a060cb29e175aa014` launched background proof at 19:00:13 UTC. The 19:07:25 and 19:14:03 requests read zero cached input and created 67,327 and 68,407 tokens. The worker read terminal evidence, and combined effort attribution is partial. The records establish worker exposure. The end-of-story decision needs evidence that a viable alternate owner could recover enough of that cost. |

## Ordered slices

### 1. Observe the current native Codex coordinator wait

Type: Behavior
Status: done
Proof: an isolated trace associates the coordinator wait, worker receipt and
both agents' requests with the actual proof and its next genuine deadline.

Extract the selected historical backend proof phase. Substitute a small
controlled command with equivalent launch, quiet duration, exit and artifact
boundaries. Qualify success before the next due check and a controlled
assertion failure after a due check with the same command still live. Retain
the timing and disposition of an early user stop and an applicable CI event.
Reuse matching observations, including the local assessor rejection controls.
For the proof window, distinguish a late coordinator acceptance from a still
running worker. Establish which native routes actually deliver each event.
If the control already avoids empty wakes, the necessary route is unavailable,
or the trace cannot support comparison, record that terminal control result
and proceed to the two decisions without a candidate run.

Accepted control evidence: [Native Codex control](control.md). The worker-owned
exit 0, exit 7 with the original assertion, and early cancellation with exit
143 all have terminal receipts. The matching-revision CI route used a
controlled provider with the real observer. The quiet coordinator timeout,
qualified intervention routes, and attributed effort warrant the comparison.
Delivery disposition: records-only. Published on the story branch at
`70f2434bca1a162b14e1a458cba4a893d71ce34c`.

### 2. Compare the smallest Codex wait change when warranted

Type: Behavior
Status: done
Proof: the matched candidate returns original terminal proof once with zero
quiet empty wakes and lower combined effort, with required intervention and
CI behavior preserved, or the comparison records the exact deciding gap.

When slice 1 finds avoidable empty wakes and qualifies the control, vary only
the coordinator wait. Bound it by the next actual check and supported host
limit, with early return where the native facility delivers it. Exercise exit
0 and exact assertion failure, the due check first, early cancellation with
verified owned-work state, and CI action at the supported safe boundary.
Retain the applicable revision's independent CI receipt or its outstanding
coverage. Compare both arms through acceptance. If slice 1 rules out a run,
record that disposition at this boundary and carry the current guidance
forward.

Accepted comparison: [Native Codex candidate](candidate.md). In the matched
success journey, the coordinator verified the worker's original exit 0 before
the due check. The candidate still produced one quiet coordinator wake and
used 28.6% more combined effort. This fails the zero-wake bar and ends the
comparison. The exact count of terminal worker deliveries was obscured by a
masked message. Candidate overdue, cancellation, and CI journeys remain
unobserved. They are excluded from the deployment decision per the deciding-gap
branch of this slice. Delivery disposition: records-only.

### 3. Record both decisions and close the trial

Type: Behavior
Status: planned
Proof: the outcome explicitly records one decision from each row below and
links the observations that determined it. Any queued Claude Code follow-up
has its own identity and cites the positive evidence.

| Decision | Positive outcome | Otherwise |
| --- | --- | --- |
| Codex release | **Deploy** if a matched native candidate returns exact proof, preserves due checks, cancellation and CI handling, has zero quiet empty wakes, and lowers combined coordinator and worker effort. Retain only the supported Codex adaptation and run its focused release checks. | **Do not deploy**. Retain current guidance. A quiet control, regression, missing native result, or lower effort that cannot be established all lead to this disposition. |
| Claude Code follow-up | **Run the Claude Code trial** if retained native evidence shows a repeatable, separable cache-crossing proof, an already-authorized alternate owner with comparable access and a warm-context opportunity, and conservative projected savings across identified repeat opportunities that exceed the bounded trial cost after handoff and reread costs. Queue a separate follow-up with the evidence and comparable workload. | **Drop the Claude Code trial**. A low-value opportunity or evidence that cannot justify the spend both close the question in this story. |

Use retained Claude Code evidence only for the follow-up decision. Apply the
same rate card to both owner estimates, carry known unknowns into the
conservative estimate, and state the observed repeat opportunities used.
Assess this row independently of the Codex result. The release row records
the recommendation and its scope. Actual client rollout and launching a
separate Claude Code trial are separate work.

## Local gates and concern review

Each slice has a 15-active-minute budget. Run long commands through the slice
clock. Walk a representative use through any changed guidance and run focused
checks for its actual consumers. Start long local runs fully awake on AC under
`caffeinate -s -i`. On battery, plug in or keep the lid open under
`caffeinate -i` and inspect the sleep log afterwards.
[Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Carry the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
into every delegation and repair. Apply independent refactoring, review and
publication gates to any retained guidance change.

The control probes native feasibility before a candidate incurs cost. The
candidate and final decisions have separate proof boundaries. Missing native
or attributed cost evidence has a defined negative disposition for either
decision. The previous claim ended after the local preflight and never
delivered a slice. Take this revised plan from the top of the backlog.

## Execution context

- Story Branch Mode, `codex/trial-a-quieter-codex-wait-for-long-verification` in
  `/Users/terryyin/git/open-dough/.worktrees/trial-a-quieter-codex-wait-for-long-verification`.
  Publisher `dashboard-territory.local-open-dough`, agent Ai-chan, target
  `origin/main`. Starting revision `3a5f1ca2d97caa99fa52cd6fac31186f7f904574`.
  The established Take and initial branch head are `fad7d53dff7cc6373a16b39969addd1538e8a5de`.
- GitHub Actions `ci.yml` (ID `351271804`) observes the execution branch.
  Coordinator `codex-seed345-714` owns `/tmp/dough-ci-501/watch-UbRRTe`
  (PID 54336, tool session 79234, cell `g196:9`).


## Story obligations

### G1. Candidate terminal handoff count was obscured
Reported: slice 2 — "A worker message preceded the native worker final. The message body is masked in the retained trace, so exactly one delivery is unproved."
Story clause: "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted."
Disposition: no user cost "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted.": The coordinator verified one original terminal receipt in candidate.md. The quiet-wake failure disposes of this overlay before deployment, so its handoff cannot affect the waiting developer.
Commitment: P06


### G2. Candidate retained a quiet coordinator wake
Reported: slice 2 — "Root lines 47–50 show the empty wake at +72.809 before due or exit."
Story clause: "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted."
Disposition: no user cost "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted.": The observation is the release rejection criterion in candidate.md. The overlay was confined to the isolated trial and the release decision carries the current guidance forward.
Commitment: P07

### G3. Bounded candidate liveness at due check
Reported: slice 2 — "Bounded candidate liveness at due check was unobserved after decisive candidate rejection."
Story clause: "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted."
Disposition: no user cost "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted.": The deciding quiet wake ends the candidate run under the plan. The isolated overlay cannot reach subsequent developer work. See candidate.md and the control’s observed safe-boundary outcomes in control.md.
Commitment: P08

### G4. Candidate continuation of the original overdue command
Reported: slice 2 — "Candidate continuation of the original overdue command was unobserved after decisive candidate rejection."
Story clause: "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted."
Disposition: no user cost "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted.": The deciding quiet wake ends the candidate run under the plan. The isolated overlay cannot reach subsequent developer work. See candidate.md and the control’s observed safe-boundary outcomes in control.md.
Commitment: P09

### G5. Candidate explicit state if recovery is needed
Reported: slice 2 — "Candidate explicit state if recovery is needed was unobserved after decisive candidate rejection."
Story clause: "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted."
Disposition: no user cost "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted.": The deciding quiet wake ends the candidate run under the plan. The isolated overlay cannot reach subsequent developer work. See candidate.md and the control’s observed safe-boundary outcomes in control.md.
Commitment: P10

### G6. Candidate exact terminal failure evidence
Reported: slice 2 — "Candidate exact terminal failure evidence was unobserved after decisive candidate rejection."
Story clause: "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted."
Disposition: no user cost "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted.": The deciding quiet wake ends the candidate run under the plan. The isolated overlay cannot reach subsequent developer work. See candidate.md and the control’s observed safe-boundary outcomes in control.md.
Commitment: P11

### G7. Candidate cancellation at a safe boundary
Reported: slice 2 — "Candidate cancellation at a safe boundary was unobserved after decisive candidate rejection."
Story clause: "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted."
Disposition: no user cost "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted.": The deciding quiet wake ends the candidate run under the plan. The isolated overlay cannot reach subsequent developer work. See candidate.md and the control’s observed safe-boundary outcomes in control.md.
Commitment: P12

### G8. Candidate owned state after cancellation
Reported: slice 2 — "Candidate owned state after cancellation was unobserved after decisive candidate rejection."
Story clause: "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted."
Disposition: no user cost "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted.": The deciding quiet wake ends the candidate run under the plan. The isolated overlay cannot reach subsequent developer work. See candidate.md and the control’s observed safe-boundary outcomes in control.md.
Commitment: P13

### G9. Candidate CI action at a safe boundary
Reported: slice 2 — "Candidate CI action at a safe boundary was unobserved after decisive candidate rejection."
Story clause: "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted."
Disposition: no user cost "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted.": The deciding quiet wake ends the candidate run under the plan. The isolated overlay cannot reach subsequent developer work. See candidate.md and the control’s observed safe-boundary outcomes in control.md.
Commitment: P14

### G10. Candidate observer disposition
Reported: slice 2 — "Candidate observer disposition was unobserved after decisive candidate rejection."
Story clause: "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted."
Disposition: no user cost "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted.": The deciding quiet wake ends the candidate run under the plan. The isolated overlay cannot reach subsequent developer work. See candidate.md and the control’s observed safe-boundary outcomes in control.md.
Commitment: P15

### G11. Candidate applicable CI revision disposition
Reported: slice 2 — "Candidate applicable CI revision disposition was unobserved after decisive candidate rejection."
Story clause: "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted."
Disposition: no user cost "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted.": The deciding quiet wake ends the candidate run under the plan. The isolated overlay cannot reach subsequent developer work. See candidate.md and the control’s observed safe-boundary outcomes in control.md.
Commitment: P16

### G12. Candidate benefit unsupported
Reported: slice 2 — "Candidate did not show lower effort on the matched success journey and is ineligible for adoption. The full set has no effort estimate."
Story clause: "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted."
Disposition: no user cost "A developer waiting for proof should get the original result promptly, with lower combined coordinator and worker effort if the change is adopted.": The release bar is conditional on adoption. The measured success journey used more combined effort, and the isolated overlay was rejected. See candidate.md.
Commitment: P17