# Learn from an unreviewed landing journey

**Identity:** SEED-010#learn-from-unreviewed-execution-paths
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#learn-from-unreviewed-execution-paths)

## Goal and scope

Give the developer a supported improvement recommendation or reasoned no-change
assessment of one completion interval previously excluded from review. Assess
session `01a157a5-1cdf-7611-94b3-8c1236961e4f`, lines 218–315, from the landing
handoff on 20 October 2026 at 04:54:42.797Z through the final response at
04:56:26.160Z. Include every attempt in that interval. Earlier preparation is
context only; later execution is outside the population. This is a deliberately
selected case, not an estimate of lifecycle failure frequency.

Write the compact result as a follow-up in
[the existing research report](../../../docs/maintainer/empirical-process-control-research.md).
Reuse the existing process-log contract for any supported findings, without
requiring a finding. Keep observations, causal hypotheses, current relevance,
and recommendations distinct. Preserve unknown guidance version, missing or
truncated history, unobserved costs, and unexercised paths as limitations.

No runtime guidance or code change, new event store, transcript archive,
scheduler, dashboard feature, release, cross-project operation, replay of the
old publication, or implementation of a recommended response is planned.
Other early exits, planless completions, wrap-ups, and post-own-review failures
remain later selection candidates. The completed sample stays completed.

## Existing solutions and architectural direction

PFE: the retrospective's
[real-record review](../../../src/skills/dough-execution-retrospective/SKILL.md#review-process-only-from-a-real-record)
already owns evidence-based process reasoning and
[process-finding recording](../../../src/skills/dough-execution-retrospective/references/process-finding-recording.md)
owns occurrence identity and bounded retention. Reuse them. The
[own-run review](../../../src/skills/dough-execution-retrospective/references/process-review-of-a-run.md)
observes only a run so far; it does not observe later refresh, retirement or
reporting. Land's separate publication/refresh/retirement results and dashboard
receipts already provide the outcome evidence needed here. The prior research
follow-up supplies the earlier review boundary. A retrospective assessment of
the retained tail extends their use without adding another runtime mechanism.

[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports one useful learning outcome and reuse before infrastructure.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) requires
actual history for process claims: this Codex case proves no other host's
behavior and is not fresh native acceptance. Under
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md),
maintainer analysis stays in the maintained report. No runtime edit or release
is selected under [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).
The ADR index agrees with these Accepted statuses. The current North Star's
launch topic separates completion reporting from story state; follow that
meaning without changing the dashboard or adding a topic. No ADR exception is
needed.

## Preparation observations and execution inputs

Observed read-only in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/learn-from-an-execution-or-completion-path-that`
at base `99e1846387acad7fe206f646b1c117fa3bb35bcd`:

- Native source: `/Users/terryyin/.codex/sessions/2026/10/20/rollout-2026-10-20T13-50-01-01a157a5-1cdf-7611-94b3-8c1236961e4f.jsonl`.
  The JSONL reader reached the actual result payloads, not just a file listing.
  It contains 318 records. Line 281 reports accepted publication of
  `ce6355980971225a1b9bf26ee7a935fc432f5636` and deferred maintenance;
  294 reports the later refresh advanced; 305 reports worktree and branch
  removed; 312 is the matching completed dashboard receipt; 315 is the final
  response. Line 229 retains a failed shell lookup. These observations establish
  feasibility, not the final process assessment or a causal defect finding.
- `git merge-base --is-ancestor ce6355980971225a1b9bf26ee7a935fc432f5636 HEAD`
  returned 0. Historical acceptance has independent Git corroboration.
- The research follow-up explicitly excludes lines 219–318; its preparation
  conclusions cannot stand in for this tail. No own-run process review was
  identified in the inspected tail. Execution must check the complete invocation
  context before asserting its selection, rather than inferring it from silence
  in DearDough.md.

Literal result-reading observation (run with Python 3 in the named checkout):

```python
import json
from pathlib import Path
source = next(Path('/Users/terryyin/.codex/sessions/2026/10/20').glob(
    '*01a157a5-1cdf-7611-94b3-8c1236961e4f.jsonl'))
rows = source.read_text().splitlines()
print('session lines', len(rows))
for n in [218, 281, 294, 305, 312, 315]:
    event = json.loads(rows[n - 1])
    value = event['payload']
    print(n, event['timestamp'], value.get('output') or
          ' '.join(c.get('text', '') for c in value.get('content', [])))
```

Execution reuses the source read-only and reads all selected events, including
nested custom-tool result blocks, without truncating decisive payloads. No paid
host run, credentialed observation, or state-changing historical operation is
needed. If that source disappears, retain the gap and stop dependent claims;
do not replace the sample with an easier successful run. The historical source
path is an input locator, not a required future execution workspace. All new
writes belong to the workspace established by execution startup.

## Outside-in proof ownership

All promises belong to slice 1 and its one evidence-to-decision review loop:

| Promise | Observable proof |
| --- | --- |
| Final applicable outcomes are observed separately | Assessment cites the actual publication, refresh, retirement and reporting result payloads, with chronology and final-response limits |
| Failed/cancelled attempts cannot disappear | Every selected attempt has a disposition; line 229's failed lookup survives the account; any other failure/stop is retained; no cancellation is invented |
| Coverage states are distinct | Complete-tail assessment and a labelled prefix-only control distinguish no finding, no review, unavailable tail, and unexercised own-review failure |
| Earlier review cannot prove later effects | Prefix-only control ending at line 281 leaves refresh, retirement and reporting unassessed; full tail supplies only the evidenced later outcomes |
| Useful decision and proportionate cost | Recommendation or no-change cites observed benefit/cost, uncertainty and current relevance; unsupported token/human-cost estimates and failure-rate denominators are absent |
| Re-review adds no occurrence or work | Repeat interpretation with the same session/interval and accepted revision; existing finding matches remain one occurrence and no old work is reclaimed, republished or reopened |

The cancellation and missing-tail controls test reasoning against explicit
counterexamples; they are not claimed as historical native events. A terminal
receipt establishes its own operation, not all future consequences. Assess each
claim against the inputs the reviewer could actually see.

## Ordered slices

### 1. Assess the omitted landing interval through its final outcome
Type: Behavior
Status: done
Proof: A developer can trace each assessment claim to the selected native event
or Git evidence, reproduce the prefix-only and repeat-review controls above,
and understand a supported recommendation or no-change result without mistaking
missing coverage for success.

Behavior: Given the prior review excludes this landing and its native tail is
available, assess the whole selected interval → retain all attempts, distinguish
review/exposure/history states, and record bounded learning through its final
applicable outcome in the existing report.

Read the full selected interval and only necessary surrounding selection context.
Reconcile potential findings with current DearDough.md and linked finding homes;
use original guidance when judging historical compliance and current guidance
when recommending a response. Record stable provenance, any unavailable evidence,
actual costs that can be supported, and why the conclusion follows. Apply the
existing process-selection/recording rules for supported findings; otherwise
leave the log unchanged and explain no-change in the assessment. Do not invoke
maintenance, queue work, or implement recommendations merely from finding them.

Walk the proof table against the report, including the restricted-prefix and
repeat-review controls. Perform the execution workflow's post-change refactoring
and delivery gates. Validate changed Markdown links and `git diff --check`;
no application test suite is required for an analysis-only edit. If execution
finds that a runtime change is necessary to fulfill this understood outcome,
stop and revisit scope instead of silently adding implementation.

## Current decisions

- One Behavior slice: source interpretation, coverage controls and the resulting
  decision form one cohesive proof loop. No independent infrastructure outcome
  or preparatory Structure is needed. One short interval bounds investigation;
  no supplied numeric slice target or hard limit was found, so none is invented.
- Preparation authorizes no execution. The eventual execution instruction owns
  the assessment, any process-record write and its ordinary delivery.
- Native history is not copied into the repository. Preserve compact supported
  conclusions in the existing report and findings; the spent plan follows normal
  wrap-up cleanup and Git recovery.

## Learnings

The previously omitted landing tail is recoverable through final reporting.
Publication acceptance alone left refresh unresolved, while the later tail
contains separate resolution evidence. This makes the chosen path evaluable
without assuming a new collection mechanism or a process defect.

## Plan concern review

Slice-plan refinement was not needed: one bounded outcome has one proof loop,
no cross-slice dependency and no separate structure. This review identified no
remaining slice-specific concerns. The source read reached the final consuming
results; loss of that input at execution is handled as an explicit evidence gap.

## Execution context

- Established start: publisher `dashboard-territory.local-open-dough`; agent
  `pyo-chan`; identity `SEED-010#learn-from-unreviewed-execution-paths`.
- Mode: story-branch. Originating, execution and owned workspace:
  `/Users/terryyin/git/open-dough/.worktrees/learn-from-an-execution-or-completion-path-that`;
  branch `codex/learn-from-an-execution-or-completion-path-that`.
  Existing linked workspace reused; no second claim or workspace was created.
  Default integration checkout: `/Users/terryyin/git/open-dough` on `main`.
- Authorized remote: `origin` (`terryyin/open-dough`); final target `main`.
  Slice delivery targets the recorded execution branch.
- Starting revision `0ac88cd7d11cc541aeaf2fb7f72933281e9fbe52`;
  accepted claim and initial delivery base
  `ae74a184a439b14368828a82ee77d28c7bc67af0`, verified on remote trunk and
  execution branch. Claim trunk CI was unobserved by this coordinator.
- Checkout setup: Node 24.21.0 matches `.node-version`; locked npm acquisition,
  browser setup and native prerequisite check passed in this exact checkout
  with `node scripts/setup-native.mjs npm`, `browser`, and `check`.
- No new replanning restriction; retain ordinary in-scope planning authority.
  No numeric slice budget was supplied. Scope and proof remain as prepared.
- CI: GitHub Actions `ci.yml` (verified active workflow `CI`), execution-branch
  target. Coordinator `pyo-chan-164f2f36`; observer
  `/tmp/dough-ci-501/watch-ula7kK`; PID 10163; exec cell 12; PTY session 41675.
  Runtime is the same-checkout `.agents/skills/dough-execute-plan`.

## Accepted slice evidence

Source-only review: `/root/source_commitments`, fresh context with only the
original selected story text and no project access. Its actual launch/input and
individual commitments are retained in the execution conversation. Coordinator
compared that return with the source, plan, product and observations:

| Original trigger / expected result | Actual observation / disposition |
| --- | --- |
| Omitted completion, exact session and lines 218–315, every intervening attempt | Report `#landing-history-follow-up` identifies all 98 records, 13 command starts and five polls; line 229's failed lookup and recovery remain. Selected population is complete; other journeys remain excluded. |
| Final outcomes, with publication separate from refresh/retirement/reporting | Actual native results 281, 294, 305, 312 and final prose 315 inspected. Report separates accepted publication/deferred refresh, advanced refresh, verified removal and matched receipt; Git ancestry corroborates acceptance only. |
| Review/no-finding/unavailable/no-exposure must differ; prefix cannot prove tail | Captured invocation/guidance 10, 12, 20, 54, 84, 98 supports unselected historical own-review. Report's prefix-through-281, missing-tail and cancellation controls retain unknown later outcomes and label counterfactuals; post-own-review failure is unexercised. |
| Reuse recording rules and findings, preserve occurrence identity and completed work | ODF-216/264 comparisons and earlier assessment distinguish different events; repeat-review control keeps the same session/interval/revision. No finding allocation, log change, old claim, reopening or publication. |
| Useful bounded learning with measured costs separated from work/wait and unknowns | Report records 103.363s wall interval, separate operation elapsed spans and qualified cumulative counters 212/310; unknown guidance release, human/review marginal cost, capture gaps and host limits remain explicit. |
| Supported recommendation or no-change, no mandatory mechanism/implementation | Existing boundaries suffice; selective further observation is advice only. No runtime edit, scheduler, new store, release, cross-project action or queue adoption. |

Accepted proof: implementation return `/root/assess_landing` retains literal
commands and terminal results. `git merge-base --is-ancestor
ce6355980971225a1b9bf26ee7a935fc432f5636 HEAD`, `git diff --check`, and
`git diff --quiet -- DearDough.md` all exit 0. Its Python link/anchor check
selected the added follow-up: six local targets/anchors, none missing.
Coordinator independently inspected the entire addition, decisive native
payloads, historical selection guidance and counters. No app behavior changed;
no app test suite is required. Original evidence limitations are preserved,
not uncovered promises. No story obligation remains.

Independent refactor `/root/refactor_assessment`: no edits, already clean;
accepted evidence boundaries unchanged. The selected existing-report destination
and exact same-file ODF-152 precedent justify retaining that maintained report
above the generic file-size threshold without unrelated restructuring.
