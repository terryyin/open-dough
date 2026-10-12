# Prove affected indirect consumers before accepting a slice

**Identity:** SEED-132#prove-indirect-consumers-before-acceptance
**Source:** [selected story](../../seeds/SEED-132-acceptance-follows-reachable-behavior.md#prove-indirect-consumers-before-acceptance)

## Goal and scope

A developer accepts a slice with sufficient proof for the consumers its changed
behavior reaches, avoiding preventable CI repair and interrupted parallel work.
Improve discovery and acceptance together: trace changed effects into aggregate
observations and caller preconditions instead of treating named files, selectors,
helper references or plan proof as the complete boundary. Preserve proportional
selection, sufficient equivalent-purpose evidence, unchanged-boundary exclusions,
the changed-surface-suite rule and the project's failure policy.

The historical dashboard and Pygardon repairs, automatic consumer graphs,
mandatory whole-repository suites, a new acceptance schema, the sibling's gap
disposition work, a release and a full native-host matrix are outside delivery.
No story prerequisite blocks this work.

## Existing solutions and current decisions

PFE selects an in-place change to
[executable proof](../../../src/skills/dough-story-refinement/references/executable-proof.md),
which already owns consumer selection and proportional proof. Its current list
already names whole-page assertions and changed defaults: adding another list
alone does not address the supported recurrence. Make the discovery operation
explicit from the changed effect to enclosing observation or entry-point
scenarios, and account for that boundary in the existing return and acceptance.

[Delegation](../../../src/skills/dough-execute-plan/references/delegation.md)
already says named proof is a minimum and asks for searches, consumers run and
unrun consumers. [Accept proof](../../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof)
already compares the return with current consumers and refuses known unrun ones.
Align these callers to the shared rule, without copying it into independent
procedures or inventing a new report. The planner's
[decisive-premise guidance](../../../src/skills/dough-slice-planning/references/settle-decisive-premises.md)
already follows effects to consuming assertions; reuse its compatible concept
without turning preparation probes into mandatory implementation ceremony.
Post-change refactoring already owns invalidated-proof selection; preserve that
boundary instead of absorbing ODF-217's separate response.

The existing `tests/support/delivery-evidence-consumers-native-*` fixture tests
a changed factory contract, a stale stand-in exclusion and an unchanged badge.
It is useful preservation coverage, but it does not observe whole-page text or
conditional I/O discovery. Do not claim that its existing pass proves either
recurrence. Extend existing support only if a useful executable example needs it;
a new generic consumer-discovery runner is not required.

Follow [AGENTS.md](../../../AGENTS.md)'s behavior review and source ownership:
edit published guidance under `src/skills/`, not installed managed copies.
Relevant Accepted decisions are
[ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
and [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Their index and in-file statuses agree. Keep one shared runtime rule, addressed
to the agent in its established project; keep these historical cases and findings
in maintainer evidence. The [North Star](../../NORTH-STAR.md) establishes no
additional consumer-selection design. No new topic, ADR or exception is needed.

## Decisive premises and preparation observations

Preparation inspected base `4304dba015c1b1f87e38f0ca4c379afe1faabdee` on
2026-10-12 in
`/Users/terryyin/git/open-dough/.worktrees/prove-affected-indirect-consumers-before-accepti`,
with Node v24.21.0. Historical failures are retained results, not a claim that
today's repaired applications still fail. The planned change concerns guidance
judgment; it does not depend on reproducing an old product defect in current code.

- **The prior rule was used but did not prevent the selected failures.**
  [ODF-150](../../../docs/maintainer/finding-names.md#odf-150) retains the response
  commit `cca9bff4`, first release 0.3.57, and two verified later executions:
  Open Dough `426c42fb` / CI `38010086816` and Pygardon plan 321's slice
  `8980468563` / CI `edd470c2` on `a0f2b270b`. The former selected 42 then 51
  specs; the latter selected three files before repair found 27 endpoint
  consumer files. These are observed selection/failure results, not a claim
  that every one of those 27 files requires separate proof.
- **The page failure is an aggregate observation, not a missing direct import.**
  `git show 426c42fb:dashboard/tests/published-work.spec.ts` exposes the
  `membership makes no live or completion claim` assertion: body text minus
  Recently done is matched against forbidden claim words. `git show f64da99b --
  dashboard/tests/published-work.spec.ts` records the repair excluding the
  Sessions sidebar from that membership assertion. The catalog retains the
  failing assertion result and heading-reorder trigger. Reuse that historical
  observation; inspect its legitimate domain purpose before accepting a repair.
- **The storage failure changes a caller precondition.** The retained Pygardon
  report records the conditional-to-unconditional read, no-store profiles,
  `FileNotFoundError`, the two failing endpoint tests and repair `7633dacb1`.
  This supplies the historical consuming outcome. No access to, or mutation of,
  the Pygardon checkout is assumed. Any further reconstruction must be labeled
  as such and retain that no-store precondition.
- **The existing fixture discriminates its narrower contract boundary.**
  In a temporary directory under this workspace, source
  `tests/support/delivery-evidence-consumers-native-scenario-content.sh`, call
  `delivery_evidence_consumers_write_baseline_revision "$fixture"` then
  `delivery_evidence_consumers_write_promises_and_return "$fixture" "$scenario"`
  for `changed-contract`, `corrected-consumer` and `unchanged-boundary`.
  From each fixture run `node --test --test-reporter=tap tests/producer.test.mjs
  e2e/stand-in-compat.test.mjs tests/status-badge.test.mjs`.
  Changed-contract: 2 pass, 1 fail (`releaseTag is required` at the E2E stand-in);
  corrected-consumer and unchanged-boundary: 3 pass each. This reaches the
  actual factory consumer and shows preserved unrelated behavior. All scratch
  files were removed before records were written. This is executable fixture
  evidence, not native skill-behavior evidence or either historical recurrence.

The proof route is a representative guidance walkthrough over retained
historical outcomes plus a constructed unchanged control. It requires no paid,
credentialed, live-host or production observation. A future native run must have
its own authority and risk-based selection; no native success is presumed here.

## Outside-in proof ownership

Every row belongs to slice 1. Recover each historical case's change, prior
selection, consumer setup/assertion and observed failure from the catalog's
provenance. Start discovery from the change and repository surface, not a prompt
that hands the executing agent the missing test name. Compare with 0.3.57's
actual instructions, not an artificially weaker baseline. Record the trace,
proof selected or reused, result, and acceptance decision in execution evidence.

| Promise | Observable result |
| --- | --- |
| Whole-page consumers are discovered | Following the heading reorder into enclosing text observations identifies the body-text assertion despite no selector/helper match. Its observed failure prevents acceptance until the promised membership boundary and sufficient proof agree. |
| Conditional-to-unconditional I/O reaches additional callers | Follow exit-settings entry points and caller setup to no-store profiles; retain the missing-store failure and require aligned behavior/proof. Three named green files or a fixture supplying the missing store cannot establish coverage. |
| Selection remains proportional | For an independent status formatter reached by neither change, retain sufficient existing proof and exclude a new run. Reassess a formerly excluded boundary only when the effect now reaches it. Equivalent purposes can share sufficient proof; incompatible purposes receive their own observation. |
| Acceptance does not defer known missing proof to CI | A return naming green focused proof and an unrun affected caller receives missing proof or is returned before acceptance/publication. Keep independent valid evidence and the project's failure policy. A changed-surface suite that fits the focused-check time retains its existing requirement. |
| Evaluation is honest | Compare both decisions with the recorded 0.3.57 failures and the benign control. Record additional searches/inspection, actual commands and elapsed time where measured, limits, implementation commit and first containing release only when known in ODF-150. Do not mark the failed watch successful from guidance delivery. |

A wording test, passing assessor, list of consumers or count alone is not the
acceptance signal. The walkthrough must reach what the guidance would require
the agent to observe or leave unaccepted. Where retained evidence cannot settle
a required runtime fact, obtain the smallest safe discriminating observation
or leave that example unproved; do not invent a result. Apply AGENTS.md's
invocation-context, required-context and useful-outcome review to the final
shared instruction and its callers. Distinguish this review from native use.

## Slice 1 implementation observations (2026-10-12)

[Recovered evidence and guidance walkthrough](PROOF.md) compare the actual
0.3.57 rule with both historical failures, unchanged control and incomplete
return. Source recovery, inspected setup/assertions, decisions, measured costs
and limits are retained there. This is representative review, not native use;
[outstanding native acceptance](../../seeds/SEED-132-acceptance-follows-reachable-behavior.md#accept-indirect-consumer-proof-natively)
remains pending before affected release. ODF-150's failed watch stays failed.

## Execution context

- Established claim: `d3058cafca6744cc2fbdc414659ebd00ffe064d5` on
  `origin/main`; publisher `dashboard-territory.local-open-dough`, agent
  `ziqing-chan`, starting revision `0ccc1432577fb2d853b945789b307d3b8b79cf5c`.
- Execution checkout (reused):
  `/Users/terryyin/git/open-dough/.worktrees/prove-affected-indirect-consumers-before-accepti`;
  branch `codex/prove-affected-indirect-consumers-before-accepti`, story-branch
  mode. Ordinary increments target that branch on `origin`; trunk is `main`.
  The default checkout is `/Users/terryyin/git/open-dough`; it is not a task base
  or delivery source. Published implementation is `d8184b02bbfd855ff3838de6ffa6a0ed5c2a868b`; its suffix base is the established claim above.
- Checkout setup: Node `24.21.0`, locked npm and browser acquisition through
  `node scripts/setup-native.mjs npm` and `browser`, prerequisite `check` and
  `npm run --silent typecheck:dashboard` all passed in this checkout.
- Replanning retains existing planning authority; no numeric slice budget or
  hard limit was supplied. The slice remains one shared rule and proof loop.
- CI: GitHub Actions `terryyin/open-dough`, verified selector `ci.yml`
  (workflow `351271804`, display name `CI`), observing the execution branch.
  Codex coordinator `ziqing-chan-132`, directory `/tmp/dough-ci-501/watch-N3dUjg`,
  PID `55576`, stream session `78850`, yielded cell `2`. This observer is bound
  to the execution checkout. The claim's trunk CI is `unobserved`.

## Ordered slices

Independent refactor review found the guidance coherent and shortened only the
new native-acceptance seed to 250 lines, preserving accepted proof. The developer
explicitly authorized the existing finding catalog's file-size exception and
instructed execution to proceed; the exception applies only to this ODF-150
evaluation update. Refactor returned `REFACTOR COMPLETE`; effort was approximately
ten uninstrumented minutes. `npm run format` and whitespace checks passed.
Earlier observer `watch-H4Knm5` stopped with no unread events and confirmed PID
exit. The replacement above was armed before delivery; no proof rerun was needed.

### 1. Select and accept proof from the changed effect's consumer boundary
Type: Behavior
Status: done
Proof: the mapped historical walkthroughs, unchanged control, incomplete-return
case, and ODF-150 response evaluation.

Behavior: given a change to output or operation preconditions, implementation
traces its effect through enclosing observations and entry-point scenarios;
acceptance accounts for the consumers reached. Missing affected proof is
obtained or returned before publication. Unrelated boundaries retain sufficient
proof, and no global-suite mandate or weakened failure policy is introduced.

Change the shared selection guidance and align its delegation/acceptance callers
as one coherent outcome. Use the two recurrences as examples of the same rule,
not separate special-case handlers. Keep selection evidence in existing return
and proof locations. Complete the representative behavior review and record
ODF-150's actual response/evaluation; add the implementation SHA once known and
leave release unknown until a containing tag exists.

Run focused checks for any changed executable examples or contracts. Reuse the
fixture observation above for unchanged support; if that support changes, rerun
its affected scenarios and assessor counterexamples. Do not add phrase-pinning
tests for prose. If runtime reference links change, run
`PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/payload-declaration-links.sh`.
Ordinary commit hooks remain required. A dashboard-wide suite is not justified
for a guidance-only change; hosted CI's job list is not itself a local gate.

Safe stop: shared rule, caller alignment, behavior review and finding evaluation
land together. No intermediate acceptance weakness or cleanup-only slice.
Boundedness is one consumer-selection/acceptance rule and its proof loop;
no numeric slice target or hard limit was supplied. Native integration does not
change. Under ADR 0005, retain any unresolved native behavioral requirement in
linked acceptance work before affected release, without claiming all-host proof.

## Story obligations

### G1. Native and historical runtime observations
Reported: slice 1 — "No fresh native behavior or historical product runtime rerun is claimed."
Story clause: "A developer can accept a slice without preventable CI repairs or interrupting parallel work because proof missed an indirect consumer of the changed behavior."
Disposition: no user cost "A developer can accept a slice without preventable CI repairs or interrupting parallel work because proof missed an indirect consumer of the changed behavior.": The promised representative evaluation reaches retained observed failures and inspected source; installed guidance is unchanged. Native behavior remains owned by SEED-132#accept-indirect-consumer-proof-natively before affected release.

### G2. Uninstrumented active effort
Reported: slice 1 — "Approximate active effort was 20 minutes, not instrumented."
Story clause: "record extra inspection, commands, elapsed proof cost where observed, and limits."
Disposition: proved by slice 1: PROOF.md records measured source recovery and focused-check time, inspected locations, the failed retrieval and unmeasured reading-time limit; no numeric active-work budget was supplied.

### G3. Failed guessed-filename retrieval
Reported: slice 1 — "an earlier guessed-filename query exited 2 and supplied no setup proof."
Story clause: "Inspect actual assertions and setup"
Disposition: proved by slice 1: PROOF.md's operation-preconditions walkthrough inspects both actual a0f2b270b no-store setups and plane ownership after successful source recovery; coordinator independently inspected those files.

## Review and execution gates

Slice-plan refinement was not needed: one common rule owns every example,
selection and acceptance are one useful outcome, and all final promises map to
observable proof in that slice. No remaining slice-specific concern was found.
The completed representative behavior review is in PROOF.md; native use stays pending.

Authorized execution retains independent post-change refactoring, proof,
commit and delivery gates from the installed workflow. This plan grants no Take
or implementation authority. Preparation changes only records; validate links,
recorded readiness and whitespace before landing.

## Execution complete

Product advice: Refine and prioritize SEED-132#accept-indirect-consumer-proof-natively before releasing this guidance. No additional product correction is supported.

Retrospective: reviewed the uncontaminated claim-to-`d8184b02` diff, original story/plan, shared rule and callers, retained historical observations, unchanged fixture support and current architecture. Outcome and test review found no correction; native evidence remains limited as recorded. Process review recorded this execution under ODF-152 and ODF-097 in DearDough.md (289 physical lines). CI remains pending on the accepted story-branch revision until the execution-owned completion receipt.
