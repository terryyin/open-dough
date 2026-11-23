# Wait for Codex workers with fewer model wakeups

**Identity:** SEED-345#wait-for-codex-workers-with-fewer-model-wakeups
**Source:** [Wait for Codex workers with fewer model wakeups](../../seeds/SEED-345-session-token-efficiency.md#wait-for-codex-workers-with-fewer-model-wakeups)

## Goal and scope

Qualify a deadline-bounded wait for a native Codex worker. Compare it with
the current short `wait_agent` cadence through independent acceptance of the
same delegated work. Keep the worker, proof, CI and recovery responsibilities
in both arms. Retain a recommendation for the tested profile, then update
the shared delegation reference only if the candidate meets the adoption
criteria. A hosted release, cross-host qualification and changes to the host,
shell wait, CI observer or supplier watcher are outside this trial.

Use the Dashboard-launched Codex app-server profile that produced the
historical exposure, with the executable, client identity, native tool and
instructions, model, effort, tier, guidance revision and cache settings
recorded before launch. Prefer the audited Codex 0.171.0 profile if it remains
available. A candidate must use the same profile as its control and honor
that profile's own instructions. Native evidence cannot be transferred from a
different profile based on a shared tool name.

Local gate: preparation checks the story/plan links and recorder. During
execution, run the case's focused proofs and, for an adopted guidance edit,
the installed-link and representative behavior checks in slice 4. For
long local runs, start fully awake under `caffeinate -s -i` on AC. On battery,
use `caffeinate -i` for an attended lid-open run and inspect the sleep log
afterward. Follow the [maintained macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
and the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
in the plan, delegation briefs and repair handoffs.

## Outside-in proof

| Story example | Owning observation |
| --- | --- |
| Native handback during an otherwise quiet wait | Slices 1 and 2 pair the owned worker ID, terminal proof, host delivery and first coordinator action. One acceptance follows and no second worker or verification starts. |
| Overdue proof or near-expiry observation calls for action | Slice 1 observes a pending worker at the earlier due boundary and a bounded inspection of the original command. Its supported continuation or explicit incomplete handback identifies the same proof and owner. Applicable CI loss stays separate from the local verdict. |
| Early return or a real deadline | Slice 1 records an early return on the supported same-worker path and a pending worker at the original deadline. Verify the resumed deadline and resulting action in the trace. |
| Worthwhile improvement and reliable proof | Slices 2 and 3 account for every worker and coordinator response through acceptance. The independent outcome verdict precedes review of comparative cost. Slice 4 checks that adopted guidance invokes the observed route under its actual preconditions. |

## Decisive premises

| Premise and consuming operation | Observation and remainder |
| --- | --- |
| The short cadence genuinely exposes coordinator idle waits. Slices 1–2 use this to select a matched control. | On 2026-11-23, a local JSONL read joined native `wait_agent` calls to outputs by `call_id`. The Codex 0.171.0 `vscode` roots `01a1fe3b-3b21-74b1-b7d0-8331302465f4` and `01a1febb-12ce-7db1-bb21-fcc4efd744c0` contained 126 and 121 `timed_out: true` receipts. The first root asked for 60,000 ms on 106 of its timeouts. The 111 in `01a1fef9-557f-71a0-9783-898b6ee7ab5e` followed the embedded parent metadata and were copied at fork. These are receipt counts. Slice 1 verifies distinct native response attribution and measures the effective matched control. |
| A compliant native wait can stay pending past the short cadence and return the right event before the original due time. Slices 2–4 depend on it. | The [prior comparison](https://github.com/terryyin/open-dough/blob/70db7200e/.planning/slice-plans/714-get-long-verification-results-without-empty-wakes/candidate.md) used Codex 0.170.0 app-server and observed a 60-second timeout on a quiet 120-second proof with a 145-second due check. Its instructions advised avoiding blocking waits longer than 60 seconds. The tool maximum was unmeasured. On 2026-11-23 the active tool contract advertised longer waits but the active instructions still advised avoiding blocking waits over 60 seconds. `codex --version` returned 0.171.0. Only slice 1 can establish a compliant, meaningfully longer wait and event delivery on the experiment profile. A cap or instruction that prevents it settles that route as unavailable. |
| The experiment can run a real long refactor with independent proof. Slice 2 consumes the existing replay case. | On 2026-11-23, `PATH=/opt/homebrew/bin:$PATH bash Distribution/evaluation/src/native-guidance-check.sh --list --where hosts=codex` listed [launch-command-tests](../../../Distribution/evaluation/cases/guidance-checks/launch-command-tests/case.md) with a retained 839-second native turn. Git resolved its pinned case revision `4b75c28885e49ace352561cad01907926e066fdd`. The retained run was a direct participant run. Slice 1 qualifies the native delegation and receipt route. Slice 2 uses the case materializer and observer for each isolated arm and checks that the matched control actually crosses the short cadence. |
| Cost counters and request ownership can be read without counting inherited history twice. Slices 1 and 3 consume the [effort reader](../../../dashboard/server/compareAgentEffort.ts). | On 2026-11-23 at `cf2375973`, Node v24.21.0 ran `node dashboard/server/compareAgentEffort.ts --comparison "$measurement_tmp/manifest.json" --store "$measurement_tmp/empty" --json` in the owned workspace with the same-revision installation's dependencies. The manifest used the first root and the inherited worker file above in both arms, with `host: codex` and an explicit window `2026-11-21T13:10:58Z` to `2026-11-22T00:00:00Z`. It returned 871 requests per arm (795 root and 76 worker), zero request delta, zero missing requests for the cost components in those files, and `missing-worker-evidence` and `idle-wake-evidence-unavailable`. This prefix validates the accounting entry point on those inputs. Slice 1 confirms exposure, exact event-to-response joins and complete launch inventory on the actual profile before slice 2. Slice 3 requires all spawned logs through acceptance. |

## Ordered slices

### 1. Qualify a worker wait and its due actions
Type: Behavior
Status: planned
Proof: Retain native timed worker and coordinator events with worker IDs,
call/receipt IDs, absolute check and deadline times, distinct usage receipts,
the original terminal proof and observed first actions. A refusal, elapsed
cap, missed event or unavailable attribution leaves a specific disposition.

Behavior: On the isolated native profile, delegate a quiet, bounded proof
using the existing run-record path. Reuse the [prior fixture and controls](https://github.com/terryyin/open-dough/blob/70db7200e/.planning/slice-plans/714-get-long-verification-results-without-empty-wakes/control.md)
for a proof that crosses 60 seconds, with the due check still ahead. Compare
the observed short wait with a longer native wait, capped by the earliest
existing due check or deadline and the supported limit. Obtain a completion
before the due time and a pending proof at its earlier due time. For an
early native return, use the same worker and remaining deadline. Exercise
deadline expiry while pending and record the existing stop or recovery
action. Use shell exit/log proof only for the original command and correlate
it with the native handback. Obtain explicit authorization before paid
native comparison calls as required by the
[evaluation instructions](../../../Distribution/evaluation/README.md).

Stop dependent experiments if the profile disallows the candidate, the
observed wait provides no longer quiet window than the matched control,
completion or due action is lost, or the route cannot attribute the
necessary evidence. Record the negative result or the exact evidence gap.
A substitute, declared timeout or shell wait cannot qualify native worker
completion. This is the early probe for the native and attribution premises.

### 2. Obtain two accepted deliveries on the same refactor case
Type: Behavior
Status: planned
Proof: The independent case observer and assessor apply the same contract
to both final trees, backend reports and unchanged E2E consumer reports.
Native traces and proof receipts identify the same delegated responsibilities,
all observed wait returns, the handback and the coordinator's acceptance
or incomplete disposition.

Behavior: With a qualified route and an agreed native comparison budget,
materialize two isolated, equivalent `launch-command-tests` workspaces
using the pinned case revision and overlay. Provide its neutral task to
one delegated refactor worker per arm. Run sequentially with identical
worker briefs, history policy, payload, proof/assessment boundaries and host
settings. Change only the coordinator's native worker wait choice via a
disposable candidate overlay. The control uses the current short cadence
bounded by actual due times. The candidate uses the longer qualified wait
bounded by those same times. Use the case's `case_materialize`, `case_observe`
and assessor. Retain the terminal verdict, exact native family/window and
all attributable retries, reviews and interventions. Freeze the proof
assessment without showing the assessor either arm's usage. Missing actual
quiet exposure or an incomplete proof closes the pair with a stated gap.

### 3. Decide whether the tested wait improves delivery
Type: Behavior
Status: planned
Proof: A reader can recompute the time-to-handback, empty wake count and
both roles' cost from the retained comparison, reproduce the quality
verdict, and apply the decision rule to the same evidence.

Behavior: With captured proof and native traces, reconstruct each worker's
native lineage from original events and exclude inherited call copies.
Match a timeout receipt to a distinct subsequent coordinator response that
resumes the same unchanged wait. Count actionable events, developer
interventions and independent work separately. Compare terminal worker
timestamp to coordinator handling and log each due check against its
original boundary. Require the candidate to use the first eligible native
handoff/continuation and respect the established due checks and recovery.
Run `node dashboard/server/compareAgentEffort.ts --comparison <manifest>
--store <isolated-empty-store> --json` with one explicit native family/window
per arm and every participating trace. Check that no workers, cost-bearing
requests or interventions through acceptance are missing. Compare fresh and
cached input and output by role and weighted combined effort using the same
versioned rate card. Include cache rebuilds and retries. Recommend adoption
in the observed profile only when both proofs and handling are equivalent
and empty wake requests and combined effort both fall. Reject demonstrated
regressions or a candidate with complete evidence and no gain. Record an
inconclusive verdict when comparable exposure, attribution or reliable
measurements are missing. A single pair supports a profile-bounded
recommendation.

### 4. Deliver the qualified coordinator wait in shared guidance
Type: Behavior
Status: planned
Proof: Reuse the qualifying native proof when the final wording invokes
the same contract and conditions. Review representative supported,
early-return and unsuitable-profile examples from the installed entry.
Check source links and confirm non-Codex paths retain their current native
instructions. Any new runtime condition needs matching native proof.

Behavior: When slice 3 supports adoption, change the Codex-specific choice
in the [shared delegation reference](../../../Distribution/src/skills/dough-execute-plan/references/delegation.md#await-delegated-results-without-empty-calls).
Use the earliest existing due boundary and the tested native capability.
When the route is unavailable, use the existing bounded wait. Follow
[author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review).
Keep source guidance as the single owner and qualify the installed route
in an isolated payload. Run
`bash Distribution/tests/installation/payload-declaration-links.sh` with
Bash 5. Leave promotion, release and installed client
updates to their established lifecycle. A rejection or inconclusive result
ends at the recorded verdict and leaves this conditional edit inapplicable.

## Current decisions

- Use the native worker's wait and the coordinator's existing due decision
  as one rule across delegated work. Existing short native waits are the
  control and fallback. Doing available independent work first can absorb
  some elapsed time but cannot deliver an idle worker's result. A passive
  notification would need a host-supported deadline and active coordinator
  continuation. A shell receipt can wake for a proof exit while the worker
  still has a handback to produce, so shell and CI wait machinery has a
  different completion contract.
- Preserve native worker identity, event delivery and interruption handling.
  The coordinator owns timely proof judgment, recovery and acceptance.
  [ADR 0005 — Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  governs the profile and matched arms.
  [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  keeps one behavior rule in the existing shared delegation source.
  [ADR 0004 — Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  keeps an adopted adaptation standalone within the shared client payload.
  [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  requires equivalent outcomes and lower total effort before adoption.
- The existing native case and effort reader own isolated proof and usage
  accounting. The narrow trace join for this trial stays in its working
  evidence. No test support expansion or new maintained trace parser is
  needed. Follow [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  by exercising the existing entry points.

## Plan review

Slice-plan refinement was unnecessary. The four slices bound native
qualification, matched capture, decision and conditional delivery. Each
has one observation boundary and fits the 15 active-minute slice budget
with the existing fixtures and command time excluded. The remaining
native-surface and evidence premises belong to the early probe. The review
identified no other slice-specific concern.
