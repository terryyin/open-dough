# Choose expensive proof with shared-host headroom in view

**Identity:** SEED-010#check-shared-host-proof-headroom
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#check-shared-host-proof-headroom)

## Goal and scope

Help developers choose credible expensive proof before launching it on a shared
machine, and preserve the decision through proof ownership changes. Deliver
shared runtime guidance and an attributable review of retained examples, with
strict verdicts and required coverage preserved. The source owns the full Goal,
Scope, key examples and exclusions; no implementation is authorized by this plan.

No scheduler, host registry, universal threshold, automatic timeout relaxation,
unrelated process kill or routine approval gate. No historical stress recreation,
release, rollout, paid native runs or measured-savings claim is included. Record
unreleased status explicitly until a containing release is known; native
compliance and ordinary adoption remain pending. Existing pending lifecycle
obligations in the seed are not satisfied by a guidance review.

## Existing solution and architectural direction

PFE: change the existing proof ownership and execution handoffs. The shared
`src/skills/dough-story-refinement/references/executable-proof.md` owns sufficient
proof and reuse. `src/skills/dough-execute-plan/references/delegation.md` carries
commands, ownership and terminal results; `wrap-up.md` owns acceptance and
independent refactoring; `ci-monitor.md` owns CI diagnosis and pause/resume.
`src/skills/dough-post-change-refactor/SKILL.md` already reuses unchanged proof and
runs only affected checks. The test-optimization skill qualifies measurements
by machine load and comparable conditions, but does not own general proof
launches. Reuse these responsibilities rather than introducing a scheduler or a
second test-result policy. One shared pre-launch rule, reached from relevant
entry points, is sufficient; use a focused linked reference only if it keeps
those existing owners clearer. No script or adapter change is assumed.

Follow [maintainer guidance](../../../AGENTS.md),
[ADR 0002 — lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0003 — release lifecycle](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0005 — native acceptance](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
and [ADR 0006 — executing-agent audience](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Edit source guidance under `src/skills/`, never hand-synchronize installed copies.
Use one behavioral source across Codex, Cursor and Claude Code. Write for the
agent in its established project, preserving its command and policy context.
The ADR index and these records agree on Accepted status, with no supersession
or conflict. Existing `.planning/NORTH-STAR.md` topics concern dashboard domain,
launch and publication; this guidance change needs no new topic or ADR.

## Preparation observations and decisive premises

Observed in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/choose-expensive-proof-with-shared-host-headroom`
at `750b608a07c639582ecb6d4021d6dfd163518459` on 2026-10-21.

- Read the retained outcomes with
  `cat docs/maintainer/findings/ODF-228.md docs/maintainer/findings/ODF-209.md`.
  Plan 310 records four eight-worker attempts with no green local suite and a
  later four-worker/CI decision; plan 305 records failed overlapping whole proof,
  isolated success, then a separate controlled whole pass. These are recoverable
  review inputs, not fresh baseline measurements or proof of a precise cause.
- Walked those inputs through the current consuming instructions with
  `cat src/skills/dough-execute-plan/references/delegation.md` and
  `sed -n '160,240p' src/skills/dough-execute-plan/references/ci-monitor.md`:
  delegation supplies literal proof commands and terminal ownership but no
  target-machine/workload decision; repair pauses its own writers and proves a
  diagnosed defect, but does not account for other same-machine proof owners.
  Thus repair serialization already exists and must be preserved; the missing
  responsibility is shared-host headroom, not a new checkout lock.
- Read `src/skills/dough-post-change-refactor/SKILL.md` and the proof acceptance
  section of `src/skills/dough-execute-plan/references/wrap-up.md`: unchanged
  proof reuse and strict sufficient observations already apply. Applying them to
  plan 305 rejects substituting its focused pass for its failed whole verdict;
  the new rule must select conditions for obtaining proof without changing that
  verdict. Read `src/skills/dough-test-optimization/SKILL.md`: load qualification
  belongs to comparison, so general execution must not invoke profiling merely
  to decide whether to launch proof.

These are result-bearing manual instruction walkthroughs at the product's prose
boundary under AGENTS.md, not native agent compliance observations. No runner,
live host capacity, fixed worker count, paid route or existing automated assessor
is a decisive premise for this guidance-only implementation. The historical
numbers illustrate conditions; they cannot select today's policy by themselves.

## Outside-in proof and ownership

Use the representative behavior review required by AGENTS.md: invocation context,
required project context, and useful outcome. Read the resulting guidance through
its actual entry points and apply each case below; record the input available at
the decision, resulting action, retained proof obligation and evidence limits in
the active plan's accepted proof. Demonstrate discrimination by comparing the
current missing decision above with the changed instruction's required action.
Do not treat word presence or a static grep as behavioral proof. A prose walk is
not a native host run.

| Source promise | Owner | Observable review result |
| --- | --- | --- |
| Target host, cost/concurrency, available load/memory and project policy precede expensive launch | 1 | Plan 310 replay names actual host and available evidence, chooses a bounded action before launch; later-only observations are not backdated |
| No unchanged overloaded repeat; independent work continues and missing proof stays owned | 1 | Repeat has a changed basis or is deferred with owner, missing observation and reconsideration condition |
| Healthy host proceeds proportionately; remote condition can remain unknown | 1 | Brief healthy control proceeds; remote case never uses coordinator measurements as runner facts |
| Strict coverage/verdict, real defect diagnosis, accepted unchanged proof | 1 and preserved by 2 | Plan 315 fixture defect remains repair work; plan 305 focused pass cannot waive broad failure; plan 314 unchanged accepted proof is reused |
| Delegation, refactor and asynchronous repair share one machine-aware decision, including separate worktrees | 2 | Plan 305 overlap and ODF-209 repair case reach explicit ownership/coordination before heavy launches, without altering CI pause/resume |
| No scheduler, fixed threshold, unrelated kill, timeout loosening or routine human gate | 1 and 2 | Review each action for existing authority and boundedness; unresolved coverage/authority changes keep their human owner |
| Actual response and release/evaluation limits at both findings; useful decision and coordination burden assessed | 2 | Both owners cite implemented source/revision and reviewed cases, unreleased or verified containing release, and unproved adoption/compliance/savings; no new occurrence or resolution is invented |

## Ordered slices

### 1. Choose a credible expensive proof before launch
Type: Behavior
Status: planned
Proof: Walk plan 310's four attempts, the healthy-host and unknown-remote controls,
and the plan 315/314 diagnosis/reuse boundaries through the edited proof entry
point; record concrete decisions and outstanding evidence, using the table above.

Behavior: Given a long, repeated or resource-intensive proof and available
project/target-host facts, when its owner prepares to launch or repeat it, the
agent makes a proportionate bounded choice to run, reduce concurrency, sequence
owned work or defer proof, retaining strict coverage and command ownership.

Change the shared proof guidance and its direct execution entry point so the
agent can discover and apply the rule before launching. Establish one source
for host identity, available cost/load/memory observations, known competing work,
policy or explicit bounded judgment, and a reconsideration condition. Keep
unknowns qualified and repeat decisions evidence-based. Retain failed broad
verdicts, fixture diagnosis and accepted unchanged proof. Review runtime audience
and valid authority as part of the same change.

Safe stopping point: direct proof owners can make the decision. Propagation to
fresh delegated owners remains the explicit unfinished obligation of slice 2;
do not claim coordinated execution at this point.

### 2. Preserve the proof decision across delegated and repair ownership
Type: Behavior
Status: planned
Proof: Walk the plan 305 overlap and ODF-209 repair scenario from coordinator
brief to delegated launch/return and repair pause/resume; include the refactor
entry and verify one consistent rule. Recheck the source's final example matrix
and the two finding updates against the actual delivered change.

Behavior: Given proof owners sharing a machine, including distinct worktrees,
when implementation, refactoring or asynchronous CI repair takes ownership of
expensive verification, the existing handoff carries the target host, workload,
evidence/unknowns, bounded choice, ownership and reconsideration condition. Owned
heavy work is coordinated within authority; independent work continues and
required unperformed proof remains outstanding.

Link the shared rule from delegation, repair and refactor verification where
needed; preserve existing writer pause/resume, command-terminal ownership,
refactor ordering and strict acceptance. A separate checkout never implies
separate machine capacity. Review all affected entry points together instead of
adding separate host policies. Update `docs/maintainer/findings/ODF-228.md` and
`ODF-209.md` with the actual response, review evidence and limitations, including
release unknown/unreleased until verified. Assess the usefulness and burden of
the decisions, without estimating hours saved from historical elapsed time.

Safe stopping point: the guidance and attributable review are complete; native
compliance, adoption, release and measured savings remain explicitly outside
this implementation's claims, with existing acceptance obligations preserved.

## Verification, delivery and sizing

The local requirement is AGENTS.md's representative behavior review, not a full
dashboard suite or a new per-tool discovery run. Use `git diff --check` for edited
prose. Normal commits run `.githooks/pre-commit` (staged lint and script checks);
keep that hook and agent-commit delivery. No new automated test is prescribed for
this conventional instruction change. If implementation adds a runtime reference,
keep the existing payload/reference declaration and its affected checks coherent;
inspect the existing declaration before deciding any adjustment is needed.
Native skill behavior on each host remains distinct from this review under ADR
0005; before a future release, map missing evidence to the existing pending
planning/implementation lifecycle acceptance obligation or selected acceptance
work, without claiming this review supplies it.

Execution retains the installed Execute Plan workflow's source-only acceptance,
independent post-change refactoring, commits and owned CI handling. Hosted CI is
not a reason to run unrelated suites locally. This preparation runs no execution
or paid native work. No numeric slice target is supplied; each slice owns one
cohesive guidance outcome and a bounded manual proof loop, including cleanup.
No speculative Structure slice is needed. The sequence uses one common decision
rule; slice 2 propagates it rather than introducing scenario-specific policies.

## Current decisions

- Existing source guidance owns the behavior; no machine-level control service.
- Historical facts are review inputs with causal and timing limits, not a live
  capacity policy or measured improvement baseline.
- The implementation may finish with an explicitly unreleased response and
  pending native/adoption evidence; no release or cross-project operation is
  authorized by this preparation.

## Learnings

Current CI repair already pauses its own execution writers. Preserve that
protection and add shared-machine reasoning across ownership boundaries.

## Preparation review

Slice-plan refinement was not needed: two bounded outcomes share one rule and
have mapped proof, a safe intermediate boundary and no independent hidden build.
No remaining slice-specific concern was identified in this review. No human
pre-Take decision or unresolved decisive premise is required for this guidance
implementation; subsequent release/native evidence keeps its existing authority.
