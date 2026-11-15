# Exploratory acceptance replay — 2026-11-15

Candidate: the uncommitted four shared-guidance edits based on
`65fcf1bafe89d591f3b387c2cefd361c72f7b510`. Inputs and quality basis were
[frozen before replay](replay-inputs.md). This is the implementation author's
representative walkthrough, available for independent coordinator acceptance.
Historical future verdicts are assessor evidence. No archived test was rerun.

## Invocation, context and common rule

The changed proof rule applies when a changed effect reaches a consumer purpose;
return, acceptance and refactor instructions link to that same record rule.
It uses the existing effect, inspected consumer and proof evidence, without
inventing a schema, classifier or lifecycle. Missing input walkthrough: a return
saying only `run` gives no observing assertion/setup or proof type. Acceptance
returns the particular affected purpose as unproved; it does not invent a green
result. An empty trace still keeps focused proof and does not excuse a known
consumer outside the lexical matches. No file requires every possible check.

## SEED-331 — traced caller, missing static proof

Frozen initial return: `ciFollowUpDecision.ts` is marked run through passing
follow-up behavior specs; selective delivery lint covers changed files only.
Historical acceptance published; CI 43387096022 then failed lint.

Inspected `56dde3c:dashboard/server/ciWallTimeReference.ts` explicit-endpoint
overload returns `PriorBuildReference`; at the same revision
`ciFollowUpDecision.ts:repeatDecisionOf` calls it with `landing.revision`, then
uses `reference?.averageMs` and `reference === undefined`. The static observer is
ESLint `no-unnecessary-condition`, distinct from follow-up behavior assertions.
`45e6965` removes those two now-unreachable guards without changing the purpose.

Candidate initial decision: retain the follow-up behavior observation for its
runtime purpose; return the untouched caller's static gap. A file-level `run`
and changed-file formatting do not show that lint ran. Obtain a sufficient
check covering that caller (the retained plan prescribes check-only `npm run lint`).
With the supplied recorded lint failure, reject dependent delivery and apply the
failure policy. With the recorded repair and applicable successful final check,
accept that boundary. The repair diff alone is not a passing command; missing
terminal proof would keep that last acceptance conditional. No new run occurs.

## SEED-364 — indirect contract and enclosing status observers

Frozen initial returns: slice 1's named measure/compatibility/collection passes
exclude scope consumers as unchanged through a re-export; slice 4 leaves reader
compatibility, Intent status and lifecycle scope proof for CI. Historical
acceptance published both; CI 43698671685 and 43705198875 found the gaps.

Inspecting `4c148b732` shows the reached collection observer in
`dashboard/backend-tests/intent/landed-ci-scope-proof-lifecycle.spec.ts`:
`collectingLandedCi` drives collection against recorded GitHub requests, and
`github.calls.filter(isActionsRequest).map(request.kind)` observes the request
set, including the then-new `actions-workflow`. The retained-window case builds
twenty measurements via `retainedTrunkProofs`, collects the twenty-first, then
asserts kept builds and the last build's `timeWithoutRunnerWaits`; its seeded
prior measures keep this a retention observation, not accidental backfill.
A re-export changes neither observer's consumption of the changed history.

Inspecting `ea5742187` shows the independent reader contract: retained history
with recorded gap reasons goes through the real local boundary and the frozen
previous reader. `ci-history-reader-compatibility.spec.ts` compares current
point entries with previous entries, mapping `wallTimeMs` to `timeMs` and only
omitting `runUrl` for selected reads. The status journey in
`e2e/intent/intent-ci-status-wall-time.spec.ts` supplies an adapter attempt with
no start/completion, then observes the history heading and empty-history words;
absence of jobs requests does not imply the measure chart heading is absent.
The lifecycle observer's expected request set changes again in this later slice.

Candidate initial decisions: return the specific scope request-set and retention
contract gaps in slice 1; in slice 4 return compatibility projection, Intent
status heading/empty state and current scope request-set gaps. Keep independently
sufficient measure and collection observations. Neither re-export nor passing
plan-named checks nor CI deferral settles these affected purposes. Supplied
historical failed results remain failures, requiring repair. The retained final
success on `ea5742187`, with those repaired observations, permits acceptance of
the reconstructed completed return; it does not retroactively accept either
initial return. No historical product run or native session is requested.

## SEED-372 — enclosing layout

Frozen initial return: six stream cases and status/live-region, header and
Sessions checks pass; indirect frontend layout is excluded. Historically
accepted; CI 43705938729/1 later fails `not read whole: ["SPAN: "]`.

At `70fb3664d`, the first case of
`dashboard/frontend-tests/launches/agent-launch-story-card-noted-start.spec.ts`
opens the real frontend through `openFrontendTakenBacklog` and controlled launch
answers. It checks Starts at 1440px, 420px and the 200% zoom proxy, then uses
`expectNoSidewaysScrollAndWholeText`. Its `dashboard/tests/pageLayout.ts`
`keptFromSight` exemption requires both one-pixel geometry and nonempty text;
`notReadWhole` scans enclosing body elements and expects an empty violations
list. An accessible name does not supply `textContent` to that observer.

Candidate initial decision: retain sufficient stream/header evidence; reject
the unsupported layout exclusion and return this enclosing whole-text proof.
The supplied failed-before result remains a defect. `70fb3664d` adds the existing
label as span text; its plan retains the exact frontend case passing after and
six stream passes. Reuse those observations for the reconstructed repaired
candidate and accept, without rerunning the archived suite. The narrow frontend
pass alone would not erase a stream failure, had one existed.

## SEED-358 — obtain known missing proof, then reuse it

Frozen initial return names five E2E families but defers them to hosted CI.
Both historical coordinator and candidate refuse initial acceptance. The
retained plan at `55d98f179` records the affected attention, sidebar, quiet
completion, Done reopen and one-shot review families passing together (nine
cases); ODF-150 retains 41.2 seconds. The journey setup uses installed closure,
real Git/receiver/storage/browser and synthetic native/provider boundaries;
observations inspect the returned reading/count and preserved session journeys,
not a fixture manufacturing the new reading. The plan's Accepted slice-2
entry records their result alongside the new returned-session observation.

After supplying that recorded sufficient nine-case outcome, accept all five
families together; request neither a duplicate run nor a record-only resend.
This preserves the observed positive guard rather than counting it as a miss.

## Mixed reuse/exclusion counterexample and comparison

Constructed mixed return using SEED-331's inspected boundary: keep its sufficient
follow-up behavior observation; exclude the independent status formatter's
unchanged text purpose because the explicit-endpoint type narrowing does not
change its input or rendering; return the caller's static gap. In the layout
variant retain SEED-372's stream receipt observation while returning whole-text
proof. New gaps invalidate neither of those independent observations. Unsupported
re-export and layout exclusions above are refused because their effects do
reach the named observer, not because exclusions are generally forbidden.

Outcome against frozen quality basis: three historical misses are exposed with
all retained missing purposes named; one positive control stays acceptable
after proof. The mixed control preserves valid reuse/exclusion. Zero original
useful leads are removed: original records remain at their frozen Git recovery
locations, all current discovery matches remain in the full generated trace,
and no compact replacement is introduced. This is a walkthrough judgment,
not a measured population rate or proof the instructions compel every agent.

## Cost and limits

New preparation recovered four plans, inspected four repair diffs and observer
setup/assertions, froze inputs and followed one corrected plan-629 locator.
New review adds purpose/proof annotations and four two-stage acceptance decisions,
plus the missing-input and mixed controls. Evaluation also pays for source
recovery, evidence writing, full lexical discovery, preservation/link checks and
focused delivery checks; these are costs, not claimed savings. Command durations
and the bounded wall window are recorded in `verification.md` after completion.
Historical marginal preparation/review time, full original conversational returns,
and some private trace availability are unknown. No causal time saving is claimed.
SEED-358's 41.2 s is a retained product run, not new review effort. The three
misses entailed four CI repair publications; SEED-372 also retained pause/stash/
restore. The control needed one coordinator proof run and no CI failure.
The candidate plausibly moves those checks before acceptance, but this purposive
replay cannot establish avoided repair cost, ordinary-use benefit or delayed
failure frequency. Keep effectiveness open and the failed watch closed.
