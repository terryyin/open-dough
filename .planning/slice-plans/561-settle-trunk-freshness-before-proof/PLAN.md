# Settle trunk freshness before expensive proof and before delivery

**Identity:** SEED-010#hold-delivery-on-freshness-before-expensive-proof

**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#hold-delivery-on-freshness-before-expensive-proof)

**Source review:** [Independent commitments](source-review.md)

## Goal and scope

For a Story Branch coordinator receiving an implementation return, settle
already-landed source amendments and named coordinating siblings before the
refactor pass and expensive boundary proof. Require an inspected terminal result
before dependent work starts, retaining the final pre-delivery check for later
changes. Preserve the existing source comparison, attribution, reconciliation,
proof reuse and guarded publication contracts.

One guidance behavior change, one proof loop. It does not discover extra siblings,
merge every trunk advance, reserve trunk, add a clearance store, change the
publisher API or alter Trunk Mode. Focused implementation checks remain useful.
No release or rollout runs as part of this correction: record release follow-through
as pending until a containing tag is verified. Native acceptance is separately
owned below; this plan neither authorizes paid runs nor calls replay native proof.

## Existing solutions and architecture

PFE: change the existing coordinator boundary. Source comparison belongs to
`src/skills/dough-execute-plan/scripts/source-freshness.mjs` (result, exit status,
base and pinned trunk); source handling belongs to `references/source-freshness.md`;
named-sibling attribution and impact judgment belong to
`references/deliver-the-change.md#check-named-siblings`. The guarded fresh path
in `references/fresh-increment.md` owns mechanical generation, formatting,
obligations, done mutation, commit and managed publication. It accepts no
source/sibling inspection receipt. Reusing it as-is avoids a second source-state
model or pretending mechanical success proves coordinator judgment.

Give the early ordering and result-inspection rule one authoritative passage,
linked at implementation return before acceptance/refactoring and at delivery.
Keep the existing amendment/conflict and sibling procedures as their owners;
move or compact references only as needed for useful retrieval. Make the
delivery-time recheck explicit; an old inspected result cannot cover a later
amendment. Current `SKILL.md` is 242 lines, so keep its change to boundary routing
and put conditional detail in the reference. Respect the read budget rather
than raising its threshold or hiding mandatory reads behind incomplete links.

Relevant Accepted decisions, checked against [the ADR index](../../../docs/adrs/README.md):
[0002 — Lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one representation, reuse, low coordination cost),
[0003 — Release lifecycle](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(edit `src/skills/`, leave installed copies for released updates),
[0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(separate guidance checks and native evidence),
[0006 — Executing-agent guidance](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one runtime rule with project-resolved inputs), and
[0010 — Improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
(delivered correction differs from observed benefit). No conflict found.
[NORTH-STAR.md](../../NORTH-STAR.md) governs dashboard responsibilities; this
ordinary execution-guidance change needs no new topic or ADR.

## Outside-in proof ownership

| Source promise | Owner | Observable proof |
| --- | --- | --- |
| Early settlement before refactor and expensive final gates (example 1) | 1 | Representative guidance walk of ODF-465 plans 539 and 547: at implementation return identify the already-landed named changes, settle/reconcile first, then put refactor and whole-suite gates on the reconciled tree. Record the order and tree each gate covers; do not rerun historical hour-long suites. |
| Read an `amended` result before any dependent operation (example 2) | 1 | Walk ODF-477's amended result and the existing amended-source fixture; point to the separate tool-result inspection and existing absorption/review/recheck path before refactor, broad proof or guarded fresh invocation. Freshness regression retains nonzero amendment, conflict/refusal and absorb-to-unchanged behavior. |
| An affected sibling holds delivery even when source is unchanged (example 3) | 1 | Walk ODF-429's plan 538 counterexample: stop after the sibling inspection, preserve working changes, local HEAD and remote branch, and withhold done/commit/push. A command that checks and publishes together is a failing walk. |
| Unchanged/accounted-for/unrelated work proceeds without extra full proof (example 4) | 1 | Walk ODF-429's retained proceed controls and a no-named-sibling case. Reuse valid proof, retain disjoint work and the current obligations/publisher path; no new unconditional merge or suite. |
| Later movement still reaches delivery's check (example 5) | 1 | Walk a second amendment after early settlement: final check holds delivery again; map renewed proof only to the affected boundary. No zero-rerun or trunk-reservation claim. |
| Shared guidance remains reachable and fits the host budget | 1 | Updated source-freshness navigation assertions, execution-increment routing, read-budget and payload-link checks below, plus AGENTS.md behavior review. These are navigation/contract evidence only. |
| Delivered response, containing release and ordinary-use criterion at all three findings | 1 | Finding entries cite the accepted response, state pending release until actual tag containment is verified, and name the attributable later observation. Preserve previous ODF-429 response and counterevidence. Native gaps stay explicitly pending in the acceptance home. |

## Slices

### 1. Settle and inspect freshness before dependent work

Type: Behavior
Status: done
Proof: all ownership rows above, focused checks below, and the representative
AGENTS.md behavior review with its limits recorded in Learnings.

Precondition: a planned Story Branch implementation returns while selected
source amendments or named coordinating work may already have landed on trunk.
Trigger: the coordinator begins acceptance/refactoring and later delivery.
Result: the coordinator checks, receives and reads the terminal source result,
then the applicable sibling result, before starting dependent refactoring,
expensive boundary/whole suites or delivery. Held results use the current
handling before those operations resume; unchanged results add no broad run.
Final delivery checks for subsequent movement before its mutation/commit/push.

Change shared source guidance at the return and delivery entry points together.
Keep the inspection as a separate tool-result boundary: neither a shell chain
nor sequential awaited calls whose result has not reached the coordinator
qualifies. Keep existing conflict/refusal stops and proof reuse intact. Trace
changed links and operation preconditions through the boundary table, acceptance,
delivery, quick/repair callers, guidance tests and amended replay support.
Apply the story's early planned Story Branch rule conditionally rather than
inventing a plan or sibling check for quick work; retain existing source gates
for quick Story Branch completion and wrap-up.

Walk the retained positive and counterexample cases, including late movement,
using pinned historical facts and explicit operation ordering. Do not claim a
walk proves that a host follows the new rule. Update affected navigation tests
to follow the actual authoritative passage; require the early route and keep
completion/deletion and delivery checks covered. Consolidate duplicate wording
before adding read weight. Use the current MakeMe API for any added domain data.

Record the delivered response and bounded evaluation basis in
[ODF-465](../../../docs/maintainer/findings/ODF-465.md),
[ODF-477](../../../docs/maintainer/findings/ODF-477.md) and
[ODF-429](../../../docs/maintainer/findings/ODF-429.md).
At the next qualifying execution on a verified containing release, observe the
host/release, implementation return, pinned trunk and attributable sibling,
result-inspection time, reconciliation, refactor/suite starts and candidate,
delivery result, repeated proof and interruption of disjoint work. Compare
avoidable pre-reconciliation work with the retained cases; missing exposure
leaves improvement unknown, with no promised numerical saving.

Extend the existing
[guarded-delivery native acceptance home](../../seeds/SEED-053-native-guidance-acceptance.md#guarded-local-delivery-prerequisites)
with these changed ordering/inspection requirements, their three-host pending
state and representative cases. Reuse unaffected installation/transport evidence
only with a matching basis; the old amended replay stops before staging and
does not observe the new early-refactor ordering. Select native sessions later
by unresolved risk under ADR 0005, before releasing affected behavior or with an
explicit human-owned exception. No paid native run is authorized here.

## Verification and delivery

Follow [AGENTS.md behavior review](../../../AGENTS.md#behavior-review) and
[runtime audience](../../../AGENTS.md#runtime-audience). Inspect invocation,
required project context, and useful result through the cases above. After
edits and post-change refactoring, run the focused consumer suites through the
maintained runner, with Bash 5 first on PATH:

```sh
PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh \
  src/skills/dough-execute-plan/scripts/source-freshness-guidance.test.mjs \
  src/skills/dough-execute-plan/scripts/read-budget-guidance.test.mjs \
  src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs \
  src/skills/dough-execute-plan/scripts/source-freshness.test.mjs \
  tests/delivery-evidence-amended.sh \
  tests/payload-declaration-links.sh
```

The first two observe ordering navigation and the host read ceiling; routing and
the real local-source fixture protect unchanged delivery/source contracts;
payload checks observe runtime links. Follow the consumer trace if the actual
change reaches further observers. No full repository/dashboard suite is needed
locally for this guidance/record change: no executable publisher or dashboard
behavior changes. Required CI stays owned through its applicable final result.

Local gate: start fully awake; on AC guard long runs with `caffeinate -s -i`;
on battery use `caffeinate -i` with the lid open and read the sleep log, under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation brief and repair handoff. Run selective
formatting; keep check-only lint with the commit hook. Independent post-change
refactoring and the execution workflow's delivery/CI gates still apply.

## Decisive premises

Observed 2026-11-10 in this owned preparation checkout at
`ee1c34dcc5547b88ec9e4a7f33754e66cba777cf`, Node 24.21.0 and Homebrew Bash 5.
Scratch changes were reverted before the seed/plan writes; `git diff --exit-code
-- src/skills` confirmed no product edits remained.

| Premise and consuming operation | Literal observation and result | Unverified remainder |
| --- | --- | --- |
| Existing source command distinguishes hold and proceed outcomes without a new API | `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh src/skills/dough-execute-plan/scripts/source-freshness.test.mjs` exited 0 (12 cases). Inspected setup uses MakeMe-backed Taken branches and a local bare origin; assertions observe actual CLI result/exit, working copy, absorb and recheck. | No new source algorithm is planned. Native coordinator choice remains separate acceptance. |
| Current guidance permits the reported late ordering and current assertions do not prove the early boundary | Source has refactor steps 1–2 before freshness in step 5. `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh src/skills/dough-execute-plan/scripts/source-freshness-guidance.test.mjs src/skills/dough-execute-plan/scripts/read-budget-guidance.test.mjs` exited 0 (12 cases). Scratch relocation before refactor made the first navigation test fail because it selects only step 5. | Slice 1 must change that assertion and review the newly linked return path; no current test is credited with proving agent behavior. |
| A compact guidance change can fit the real host read ceiling | Scratch moved the existing freshness block before refactoring and added separate-result inspection. Naive version failed `read-budget-guidance.test.mjs`: delivery 30,014 > 30,000 bytes. Consolidating the duplicate stale-source paragraph made `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh src/skills/dough-execute-plan/scripts/read-budget-guidance.test.mjs` exit 0, net -27 bytes. Original bytes restored in `finally`. | Exact final passages must pass the same budget and useful-behavior review; the scratch is feasibility, not delivered behavior. |
| Retained cases expose ordering/inspection, not a missing attribution algorithm | ODF-465's plans 539/547 and ODF-477/ODF-429's plan 538 record actual late proof, `amended`/`unchanged` results and publication before inspection. ODF-429 also retains accounted-for, unrelated and no-sibling proceed controls. The same ordering persists in current source. | Predicted effort saving and adherence after release require ordinary use; neither is claimed by this correction. |

## Current decisions

- Execution established 2026-11-10 in the supplied owned worktree and branch
  `codex/settle-trunk-freshness-before-expensive-proof-an`; origin/main is the
  authorized integration target. Publisher `dashboard-territory.local-open-dough`,
  agent `yusuke-chan`, starting revision
  `5030bb8b1f9faa11566646a94159bdb9d66d5eff`, accepted claim and current candidate
  `14c211d145385d2fbbc50fb032781d3e45046354`. No second start or claim.
  Default checkout `/Users/terryyin/git/open-dough` is separate from execution.
- Checkout setup: Node 24.21.0; `node scripts/setup-native.mjs npm` and
  `node scripts/setup-native.mjs check` passed against the unchanged lockfile;
  the source-freshness guidance baseline passed through the Bash 5 runner.
  Check-only `.githooks/pre-commit` owns staged lint and script-triggered
  dashboard typecheck; `npm run format` is selective. No generator trigger
  is expected for shared Markdown guidance and its observing tests.
- CI observer: GitHub Actions `ci.yml` (verified workflow 351271804, CI),
  repository `terryyin/open-dough`, execution-branch target,
  coordinator `yusuke-freshness`, directory `/tmp/dough-ci-501/watch-KR3n5R`,
  PID 21180, session 39201, yielded cell `g538:12`. Claim on trunk remains
  `pendingCi: unobserved`; this stream covers subsequent branch delivery.
- Replanning permission retains the existing planned-work authority; no new
  scope or numeric time limit is inferred. One Behavior slice and focused proof
  remain proportionate; full local repository/dashboard suites are not selected.

- Default Story Branch execution is sufficient; no trunk-only release step or
  human checkpoint is needed for this guidance correction.
- Keep one cohesive Behavior slice. Splitting early checking from inspection
  would leave the observed ignored-result path unresolved; tests and evidence
  belong with that change. No preparatory Structure is needed.
- Scope follows the selected story; no backlog reorder, automatic execution,
  publisher receipt schema, sibling registry or full-suite policy change.
- This is planned work requiring execution authority. Preparation performs no
  implementation and supplies no authority to Take it.

## Learnings

The initial runner attempt selected system Bash 3.2 and refused before tests;
putting the already-installed Homebrew Bash first on PATH resolved the route.
The focused baseline and scratch observations above then completed. The read
budget is a real affected consumer; its fixed threshold stays intact.


### Slice 1 representative behavior review (2026-11-10)

The [representative review](acceptance-evidence.md#slice-1-representative-behavior-review-2026-11-10)
retains invocation/context, six historical guidance walks, runtime-audience
assessment and explicit native/benefit limits.

### Slice 1 focused proof

The [accepted focused proof](acceptance-evidence.md#slice-1-focused-proof)
retains literal commands, terminal results, setup and observing assertions.
[Consumer dispositions](consumer-trace.md) retain the affected routes and checks.

## Preparation review

Slice-plan refinement was not needed: one bounded behavior and proof loop
keeps early settlement, inspected-result gating and late-change coverage
together. This review identified no remaining slice-specific concern. Future
native acceptance and ordinary-use evaluation are explicitly owned pending
observations, not evidence of readiness to release affected behavior.
