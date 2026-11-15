# Show affected consumer proof at acceptance

**Source:** [refined story](../../seeds/SEED-376-affected-consumer-proof-at-acceptance.md#show-affected-consumer-proof-at-acceptance)
**Identity:** SEED-376#show-affected-consumer-proof-at-acceptance

## Goal and scope

Let the coordinator see which affected consumer and proof type remain unverified
before accepting dependent delivery. Carry the actual observation, applicable
reuse or supported exclusion in the existing trace and acceptance evidence.
Keep the seed's five key examples, cost comparison and response attribution.

Change the shared guidance and its representative acceptance evidence. No new
trace engine, semantic classifier, mandatory schema, registry, dashboard,
universal full-suite gate, release, rollout or prospective watch is included.
Do not repair or rerun the archived dashboard implementations. Historical
observations establish their boundaries; replay evaluates acceptance decisions.

## Existing solution and architectural decisions

PFE: the whole-product search found one existing responsibility chain in
`Distribution/src/skills/`: `dough-story-refinement/references/executable-proof.md`
owns effect-to-consumer proof selection and the consumer-trace record;
`dough-execute-plan/references/delegation.md` carries its implementation return;
`dough-execute-plan/references/wrap-up.md` owns acceptance; and
`dough-post-change-refactor/SKILL.md` carries accepted and invalidated proof.
The lexical CLI and `consumer-trace-record.mjs` supply discovery and an open
Disposition cell, not a semantic verdict. Existing source-review/obligation
records own story gaps; do not create another promise ledger or extend their
schema to represent every trace match.

Change the existing record guidance in place: for an affected purpose, connect
the changed effect and reached boundary to the relevant proof type and actual
evidence or named gap. Inline detail or links in the existing disposition and
return are sufficient; keep equivalent layouts valid. Put the common rule in
`executable-proof.md`, and link from return/acceptance/refactor instructions.
Acceptance checks the substance and obtains or returns missing proof. File
kind, `run`, a re-export, or one green mode cannot settle another affected mode.
Equivalent purposes may share sufficient evidence; inspect independent purposes
separately. Do not introduce a fixed lint/runtime/layout matrix for every file.

The [earlier assessment](../../../docs/maintainer/consumer-tracing-evaluation.md)
supports discovery plus better acceptance. The
[compact trial](../../../docs/maintainer/consumer-tracing-trial-v2.md) lost a useful
lead and increased combined effort; keep full discovery evidence available and
do not revive its rejected compact replacement or inherit its numerical targets.

Relevant Accepted decisions, checked against the ADR index and in-file status:

- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md): edit
  source guidance only; installed copies and a containing release stay separate.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one authoritative rule, direct instructions for the task's project, linked
  callers and no exported maintainer analysis.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): use the
  [maintainer behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review)
  for this conventional shared guidance change, with applicable deterministic
  checks. No host integration changes or per-tool discovery matrix are needed.
  A representative walkthrough does not claim fresh native behavior on all hosts.
- [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md): compare
  useful gap detection and total added work against a stated baseline, retaining
  unknown costs. Delivery and bounded replay do not establish ordinary-use benefit.

The inspected `.planning/NORTH-STAR.md` topics govern dashboard architecture;
none governs this acceptance-guidance change. No new direction or ADR exception
is needed, and no conflict with the relevant Accepted decisions was identified.

## Outside-in proof and decisive premises

Preparation observations below are from this owned workspace at
`2c71a1ea5e01fc57dd6d1a21fd615534a94e9689`, 2026-11-15. The scratch edit was
restored byte-for-byte before the seed/plan write; no product implementation
or candidate-guidance replay was retained.

| Premise and consuming operation | Observation, result and unverified remainder |
| --- | --- |
| The current CLI supplies whole-checkout discoveries with editable dispositions, without an enforcing acceptance parser | `node --test Distribution/tests/skills/dough-execute-plan/consumer-trace.test.mjs Distribution/tests/skills/dough-execute-plan/consumer-trace-terms.test.mjs`: 9/9 passed, 5.07 s. The fixture runs the real CLI with `--checkout`, `--path`, `--term` and base-derived changes, asserting consumers in each kind, empty kinds and Disposition. Reading the renderer and acceptance/return consumers confirms that semantic annotation belongs to the guidance. Candidate sufficiency remains slice proof. |
| The focused check discriminates loss of the existing disposition record | Scratch-renamed only the rendered `Disposition` heading to `State`; `node --test --test-name-pattern 'readers of a changed shared text' Distribution/tests/skills/dough-execute-plan/consumer-trace.test.mjs` failed at line 113, `/Disposition \|/`. Byte restoration made the identical command pass, 1/1 (1.22 s); `git diff --exit-code` for the renderer was clean. This proves the unchanged output boundary, not semantic acceptance. |
| The static counterexample reaches an untouched caller and has a retained terminal verdict | `git show 56dde3c:dashboard/server/ciWallTimeReference.ts` shows the explicit-endpoint overload returning `PriorBuildReference`; `git show 56dde3c:dashboard/server/ciFollowUpDecision.ts` shows its optional/undefined guards. The plan at `33eb3f8cd99cb7e9131d072bf06576ef01cf3eaa:.planning/slice-plans/609-read-ci-history-at-a-glance/PLAN.md` records CI 43387096022's lint failure and `45e6965`'s repair. Replay uses that historical candidate and verdict, not current dashboard lint. |
| The indirect readers and enclosing-page observer have retained outcomes in the replay's form | ODF-150's 2026-11-15 observations retain SEED-364's CI failures 43698671685/43705198875 and repairs `4c148b732`/`ea5742187`; `git show 4c148b732` exposes request-set and retained-measure expectations. SEED-372's same record retains the exact frontend failed-before/passed-after observation and six streaming passes; `git show 70fb3664d` shows the empty span gaining text. Recover its plan at that revision under `639-confirm-dashboard-updates-on-return`. These settle historical input/verdict availability, not a fresh product run. |
| The positive control preserves acceptance after obtaining known missing proof | `git show 55d98f179:.planning/slice-plans/625-close-launches-returned-to-the-backlog/PLAN.md` records five E2E families, 9 passes before acceptance. ODF-150 retains the 41.2 s run and the return's CI deferral. Replay reuses these observations with their historical scope; it does not attribute that duration to new review work. |

No cheap decisive premise remains open. New guidance and its acceptance decisions
are the intended slice observation, not an assumed current capability. No paid,
credentialed, developer-operated or state-changing probe is required.

| Source promise / example | Owner | Observable acceptance proof |
| --- | --- | --- |
| Consumer plus proof-type gap is visible despite passing nearby checks (examples 1–3) | Slice 1 | Replay each frozen historical return against the candidate guidance; identify the caller's static gap, indirect history/compatibility/status observations and enclosing layout gap, with inspected setup/observer and exact missing check. The historical incomplete return stays unaccepted. |
| Obtain or return missing proof before dependent acceptance (examples 1–4) | Slice 1 | For each replay, retain the initial decision and gap, then the decision after supplying the recorded relevant outcome. `run` alone, unsupported re-export exclusion and “CI covers it” remain insufficient. A failed check remains failed under the failure policy. |
| Reuse sufficient proof, supported exclusions and one check covering multiple consumers (examples 4–5) | Slice 1 | The SEED-358 control accepts after its retained 9-case observation without replaying it; a mixed return retains an unaffected proof/exclusion while returning the missing static or layout proof. No record-only resend or duplicate run is demanded. |
| Missed checks and added work are compared without dropping discovery evidence | Slice 1 | Keep the original full trace/return and candidate annotations; compare the purpose/check sets and preparation/review/recovery actions. Record measured new effort, retained command durations and unknown historical marginal costs separately, including evaluation overhead. |
| Delivered response and containing release are attributable | Slice 1 | ODF-150 links the delivered change and bounded replay judgment. A containing release stays unknown until a real tag contains it; update when known, without inventing a release or closing effectiveness. |

## Ordered slices

### 1. Accept each affected consumer on proof of its reached boundary
Type: Behavior
Status: planned
Proof: Representative behavior review and four retained-case acceptance replays,
including the mixed reuse/exclusion counterexample, plus focused checks below.

Behavior: Given a changed effect with known direct, indirect or enclosing
consumers and a return with passing focused checks, when the coordinator reviews
it for acceptance, the record exposes each affected purpose's relevant proof
and observation or gap. Dependent delivery remains unaccepted until sufficient
proof is obtained or a supported disposition applies; valid other evidence stays.

- Update the common consumer-trace/proof guidance and align the three existing
  handoff/acceptance callers above. Prefer annotation of the current record;
  no script/schema change is justified by the inspected inputs. If a replay
  disproves this premise, return the concrete limitation before adding machinery.
- Walk invocation, required context and useful outcome under the maintainer
  skill. Exercise missing input, unproved mode, invalid exclusion, applicable
  reuse and obtained-proof acceptance through the same common rule. Inspect
  actual evidence, rather than merely finding new phrases in the guidance.
- Before the replays, freeze the original inputs and quality basis in evidence
  beside this plan. Required result: expose every retained missed boundary,
  preserve useful original discoveries and valid reuse, and keep the control
  acceptable once its known proof is supplied. A candidate-only miss, lost lead,
  unsupported acceptance or unnecessary rerun fails the behavior review.
  Record a failed/inconclusive comparison honestly; do not claim improvement.
- Compare historical acceptance with reconstructed candidate decisions on the
  same four inputs. Label the comparison exploratory and the retained future
  CI verdicts as assessor evidence. Capture new preparation/review/tool/recovery
  work and evaluation cost; historical human/agent effort stays unknown where
  not retained. Claim no causal time saving, missed-check rate or prospective
  population benefit from this purposive replay.
- Preserve full search evidence, append or link the minimal boundary/proof
  annotation in the existing record, and retain only resumable replay evidence
  beside this plan. Do not request native sessions or rebuild archived products
  merely to repeat known observations.
- Record the response and evaluation at ODF-150. Apply the cohesive size decision
  below as part of this change. Refactor the implicated guidance before commit,
  then follow execution's normal delivery and owned-CI repair workflow.

Safe stopping point: coherent source guidance with its replay decisions and
passing affected checks. One rule handles all proof modes and traversal shapes;
there are no per-example recognizers or later replacement slices. Guidance,
handoff and acceptance remain one useful result. Budget: 15 active minutes,
excluding commands; follow the existing overrun/reassessment procedure if needed.

## Local gates, size and delivery

Local checks: `git diff --check` and
`node --test Distribution/tests/skills/dough-execute-plan/consumer-trace.test.mjs Distribution/tests/skills/dough-execute-plan/consumer-trace-terms.test.mjs`.
If guidance links or a reference extraction change, also run
`bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh`:
the assembled payload must retain linked guidance. Trace reached callers/tests
using the installed consumer-trace procedure, inspect their observations and add
only affected checks. These checks preserve discovery/delivery; representative
acceptance review owns the new semantic behavior. A full repository/dashboard
suite is not a local gate for this guidance-only change.

Carry the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written, including failing/flaky and base-attributed failures and owned CI
repair. Hosted CI remains owned after publication under the execution workflow.
Before test authoring, apply installed `dough-makeme` selection and, for any
browser test, `dough-page-objects`; no new prose snapshot tests are planned.
Never use `test.slow()` or file/group/hook timeout overrides.

Long local runs start fully awake under the maintained
[macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
`caffeinate -s -i` on AC; on battery plug in, or keep the lid open under
`caffeinate -i` and inspect the sleep log afterwards. Respect shared full-suite
admission and inspect actual host headroom before expensive proof.

Expected guidance sizes at preparation: executable-proof 220, wrap-up 127,
delegation 246, post-change-refactor 162 lines. Keep the common rule in its home;
rephrase/link the delegation return rather than duplicating it. If an edit needs
to exceed 250 lines, extract its cohesive return-report responsibility and align
links/payload, rather than cutting arbitrary lines.

ODF-150 is already 478 lines. Slice 1 owns its required reorganization before
adding the response: retain the canonical `odf-150`/`odf-240` anchors, response,
release/watch history and assessment in `ODF-150.md`; move retained execution
evidence into linked project-specific evidence companions under the same finding
directory. Preserve every episode, alias, source/recovery link, result and
uncertainty; keep each file within 250 lines. Update incoming section links,
including this story's evidence link, to their new owner. Existing earlier
evidence and trial records stay linked. Inspect links and compare preserved
episode/source sets before acceptance; this is reorganization, not occurrence
recounting, feedback maintenance, triage or a new watch.

## Current decisions and concern evidence

- One Behavior slice owns the common rule, handoffs and bounded replay loop;
  splitting by file, proof mode or evaluation would fragment its useful result.
- Slice-plan refinement was not needed: no independent second outcome, interim
  behavior, unresolved proof ownership or sizing concern was identified.
- No remaining slice-specific or cumulative-design concern was identified.
  No human decision is needed before Take. Readiness grants no execution authority.

## Learnings

The retained cases distinguish a known consumer missing a proof mode from an
indirect observer not followed at acceptance. Both need the same effect-to-boundary
evidence rule; neither justifies a replacement discovery engine.
