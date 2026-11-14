# Close the landed CI repeat checks' coverage gaps and tidy their support

**Identity:** SEED-324#close-landed-ci-repeat-check-gaps
**Source:** [canonical story](../../seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps)
**Source review:** [amended source commitments](source-review.md)
**Disposition:** unfinished; early return to the backlog authorized by Terry on 2026-11-14.
**Next slice:** 3. Slices 1–2 are delivered; 3 is partial; 4–8 are unstarted.

## Early-return handoff

Preserve this story, plan, implementation, source review and acceptance gaps.
This execution ends and releases darren-chan; it does not complete the story.
A future execution starts from the queued item after its recorded dependency
is satisfied. Do not revive the old watchers or repeat completed slices blindly.

The full pre-return record is recoverable from
`1e7e6f98153870b4ce04fb347d882dc79ece1975:.planning/slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md`.
That checkpoint also preserves the entire partial implementation.
It was reconciled with main7a100c396 in merge694219d0b.
Historical observer commands and elapsed-time logs are evidence, not instructions.
Use this plan and [handoff evidence](handoff-evidence.md) for the new execution.

Terry explicitly requests this story at the top of Backlog list with a blocking
dependency on SEED-332#answer-fake-gh-reads-in-process (philip-chan).
The canonical dependency block in the story is authoritative.
Shared fixture performance/stability is the supplier's responsibility;
integrating its outcome and proving this correction remain consumer work.

## Preserved work and qualified proof

- Slice 1: whole-comparison phone overflow assertion, three passes and F26/P3;
  published1c04004870edef23d1628a70a06e79e83fee2db7.
- Slice 2: queued repeat progress and same-journey finished warning, three passes
  and F27/P4; published7348487b92dd963babcf946e3dc163ae0f3e2d0a.
- Partial slice 3: stage-file split; shared waitingRequest/aWholePass;
  adapter prior-state readiness and coherent matching-card observations;
  pending server-start ownership; origin-owned standalone collector teardown.
- Approved product repair: read-scoped immutable completion/claim-history reuse.
  Keep mutable reads live, abort/error behavior and shallow-history semantics.
  Real-Git tests cover successful and negative graph walks after deepening.
- Isolated historical proof includes twelve history/endpoint cases and seven
  native lifetime/caller cases, plus typecheck. It is not three current family
  passes or the required natural-load profile.
- The supplier's ordinary-pool full passed2793 cases with one expected benchmark
  skip. Its later receiving diagnostic passed75/75 after adopting7a100c396.
  These are supplier observations, not acceptance of this unfinished correction.
- Slices 1–2 implementation stays done; renew affected proof after reconciliation
  of CI-glance vocabulary, settled-clock helpers and fixture changes.

## Scope and execution limits

Keep all prior seven-case promises and faults F1–F11/F14–F24.
The product-code exception is Terry's bounded immutable-history optimization;
it authorizes no cross-request cache, transport redesign or weakened test bound.
Retain default30s cases/5s expectations, no sleeps, retries, skips, test.slow()
or timeout overrides. Apply the selected MakeMe/page-object conventions.
Use the existing rerun, ledger, held-answer and product-proof owners.

The [repository failure policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to every slice, delegation and repair handoff.
At an exact active repair owner, preserve its files and record the coordination
boundary. Attribution to earlier commits is never a failure exemption.

A future attempt must be bounded: obtain the supplier outcome, reconcile it,
and run the next focused proof. After a failure, diagnose before another run.
When a required host window or human decision is absent, return a precise handoff.
Do not leave an open-ended watcher or repeatedly run until green.

## Verification

Local gates use fully awake AC macOS under
[caffeinate -s -i](../../../tests/local-test-resources.md#machine-sleep-on-macos).
On battery, follow that maintained alternative and audit sleep.
Put Homebrew Bash first on PATH; unset NO_COLOR, FORCE_COLOR and
GIT_ALTERNATE_OBJECT_DIRECTORIES for direct dashboard tests.

[proof-selection.txt](proof-selection.txt) retains the slice3–5 family:
18 spec files, previously56 cases. List the current selection before running;
Playwright silently ignores absent paths. Use two workers and require three
consecutive current passes for changed cases/support before slice acceptance.
The early-return preservation run is one run, not those three passes.

For support moves in3/4/8, run consumer-trace with the actual change base and
retired exports/effects. Give every caller a run, reused or reasoned excluded
disposition. Run distinct reached behavior beyond the named starting selection.
Keep [source-review.md](source-review.md)'s89 commitment rows and allocations.

Run the ledger suite through `bash scripts/test.sh tests/support/ci-follow-up-ledger.test.mjs`.
Run fault controls singly on scratch changes at load about27 or less; observe the
named failure and restore before commit. Original fault recipes and P1–P5
preparation observations are recoverable from the pre-return checkpoint above.
Lint/typecheck remain the normal check-only commit-hook gates.

Once, after slice8, run the original nine-spec selection through
`bash scripts/dashboard-repeat.sh 1 <specs>`, two workers, no reporter override,
with OPEN_DOUGH_DASHBOARD_PROOF_RECORD. Start only in a natural CPU-bound
one-minute load30–50 window; before and after must remain in range.
Every case passes within25s. Burners and quiet passes do not count.
The nine specs are the first nine entries of proof-selection.txt.
If the window is absent, stop and report the missing proof rather than waiting
indefinitely. Terry has not waived this acceptance requirement.
Hosted CI on the final published candidate remains required for story completion.

## Remaining preparation concern

Before another long execution, establish a bounded way to obtain the required
natural-load observation. Earlier quiet passes and passive monitoring did not
settle that host premise. This concern is separate from the supplier dependency;
the recorded readiness judgment must describe it honestly.

## Ordered slices

### 1. The Intent phone reading checks its whole comparison for sideways scroll
Type: Behavior
Status: done
Proof: retained three passes plus F26/P3; renew when affected shared UI changes.
Keep expectNoSidewaysScrollIn(page, comparison) beyond the three part checks.

### 2. A queued repeat reads "CI rerun in progress" on a phone
Type: Behavior
Status: done
Proof: retained three passes plus F27/P4; keep the finished-warning observation.
The accepted-request backend case retains in_progress and its F16 owner.

### 3. The automatic-repeat checks are filed by the stage they start from
Type: Structure
Status: planned
Proof: current family three consecutive passes, unchanged moved titles/assertions,
F2/F8 refused, F9 uncertain and F4 saved-outcome controls. Resolve G1–G6.
Implementation is partial and preserved; first reconcile the supplier's published
fixture interfaces, CI-glance wording and settled-clock helper rename.
Keep only the receipt journey in automatic-repeat; eligible-receipt owns refused/
uncertain; verdict owns saved accepted outcome. waitingRequest owns run72 and
aWholePass reads its run. Preserve the native lifetime and real-history tests.
One focused diagnostic may identify a concrete remaining fault; do not repeat
the family or extend product scope without the necessary causal evidence.

### 4. One owner answers, holds and counts rerun requests, and arrangements layer one way
Type: Structure
Status: planned
Proof: family three current passes, consumer dispositions, no retired exports/
call forms; F2/F8/F14 still fail their owners.
providerRepeatRun answers/holds its run; rerunRuns is the only count.
Compose existing held replies and one fallback layer in ciFollowUpRepeatRun.
Remove scenario.serve(), OtherAnswers and competing scenario rerun ownership.

### 5. A dashboard sends no rerun request for a landing another dashboard spent during its preparation
Type: Behavior
Status: planned
Proof: new eligible-receipt case three passes; F12 and F25 each fail rerun requests;
ledger node tests pass. Keep coverage row C5's dashboard and node owners.
Hold run71's first preparation read after pre-check, write another writer's
accepted request through the real ledger lock, release and complete a pass.
Expect no provider rerun and preserve the accepted reference/submission.

### 6. The kept scope proof is what collection keeps
Type: Structure
Status: planned
Proof: completion spec three passes and F28 discrimination.
For identical run63/revision/files, compare the complete collected proof directly
with keptScopeFileProof, including zero-duration file evidence. Do not rewrap it.
The builder already agrees; add protection without inventing representation drift.

### 7. A later start-origin revision may name the first revision as its parent
Type: Structure
Status: planned
Proof: meaningful real-origin parents case, three passes, isolation/demand/refresh
consumers. Retained preparation reproduced Unknown parent.
Seed initializeStartOrigin's parent map with first revision name → checkout HEAD
before later commits. Assert actual origin-main ancestry.

### 8. The origins one process holds have their own module
Type: Structure
Status: planned
Proof: isolation, demand, ambiguous completed-story association, new parent case
and kept-story consumers three passes; full consumer dispositions; final load proof.
Move privatelyPrepared/privateDirectories/exit cleanup/keepStartedOrigin/
preparedPrivately to one process-held owner. Keep run-wide preparation and the
installation layer in startOriginPreparation; preparedStartOrigin keeps answers.
Update keptPublishedStory, pageTest and fixture-origins documentation.

## Story obligations

### G1. Adapter-comparability failures during slice 3 proof
Reported: slice 3 — "The first focused family run, launched at natural load 67.80, has observed adapter-comparability polls timing out with stale accepted/intent explanations instead of the expected mismatch or incomplete-proof verdict. Terminal inventory and causal diagnosis remain outstanding."
Story clause: "Every check still passes at load 30–50 within the default timeouts."
Disposition: return

### G2. Reconciliation submission observation can precede its prerequisites
Reported: slice 3 — "The second renewed family run failed multiple-attempt reconciliation: after receipt ingestion the five-second initial rerun-count poll still read zero, at observed natural load 34.94. That is within the promised range; diagnosis and repair remain owed."
Story clause: "Moving the support owners preserves the existing receipt journey and stage checks."
Disposition: return

### G3. Custom comparison reading exceeds its case budget
Reported: slice 3 — "The second renewed family run timed out at 30 seconds while the recovered custom comparison still read Reading retained CI follow-up, after the same case’s slow-outcome navigation. Existing bounds remain unchanged; diagnosis and repair remain owed."
Story clause: "Every check still passes at load 30–50 within the default timeouts."
Disposition: return

### G4. Teardown can lose a server whose startup is pending
Reported: slice 3 — "The real pending-start regression failed on the old fixture with the late server still running after teardown. The original refusal timeout also reached origin cleanup while a restarted server was still starting, producing ENOTEMPTY."
Story clause: "finds one owner for each support responsibility"
Disposition: return

### G5. A second fresh card read assumes continued history availability
Reported: slice 3 — "Malformed-JSON rejection first observed its matching card, but a second fresh endpoint read supplied no card. Each read independently resolves published completion history; the first successful read does not establish the second read’s availability."
Story clause: "Every check still passes at load 30–50 within the default timeouts."
Disposition: return

### G6. Refresh proof exhausts its case budget on unrelated comparison reads
Reported: slice 3 — "The third renewed family run had 54 passes and one refresh-case timeout at 30 seconds, with natural load 30.89 to 38.90. Trace shows an initial CI comparison read taking 9.249 seconds, later revision checking taking 5.83 seconds, and another read drain at the deadline; kept worker preparation is outside that case budget."
Story clause: "Every check still passes at load 30–50 within the default timeouts."
Disposition: return

### G7. A shallow negative ancestry result can change after deepening
Reported: slice 3 — "A real Git shallow boundary makes ancestry return false/exit 1 before deepening and true after removal. The prototype retained the rejected exit-1 query and incorrectly kept returning false in the same reader; the new regression reproduced this mismatch."
Story clause: "Functional behavior, mutable-ref observation, error/abort handling and every existing test gate remain unchanged."
Disposition: proved by slice 3: dashboard/backend-tests/intent/published-story-history-semantics.spec.ts negative ancestry deepening; real red then green, /tmp/seed324-history-shallow-follow-up.md and current graph follow-up

### G8. Successful walks can still describe incomplete shallow history
Reported: slice 3 — "Real Git differentials showed ordered commits, authored commits, merges and profile-path walks change after a shallow boundary is removed, while the prototype reused their incomplete lists for the same full commit IDs. Full object names alone do not establish complete graph knowledge."
Story clause: "Functional behavior, mutable-ref observation, error/abort handling and every existing test gate remain unchanged."
Disposition: proved by slice 3: dashboard/backend-tests/intent/published-story-history-semantics.spec.ts all four successful graph walks versus independent Git before/after deepening; /tmp/seed324-history-graph-follow-up.md, twelve-case pass plus final graph pass

### G9. A standalone follow-up collector can outlive its test
Reported: slice 3 — "Supplier full proof52807 reached the correct queued-rejection card and ledger after restart, then its final native collectFollowUps call continued past the case deadline. The native collector is started by ciFollowUpAdapterScenario through promisified execFile without fixture ownership; later continuation read adapter-requests.jsonl after origin cleanup. The pending-server-start registry does not own this separate collector child."
Story clause: "finds one owner for each support responsibility"
Disposition: proved by slice 3: landed-ci-collector-lifetime.spec.ts native red/green plus seven final focused caller/lifetime cases and typecheck; /tmp/seed324-collector-lifetime-return.md. G1–G6, full family/load and delivery remain open.
