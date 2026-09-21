# Require current regression proof before live transitions

Status: in execution; Trunk Mode; slice 1 delivered, slice 2 remaining.

## Source and outcome

Identity: SEED-004#require-current-proof-before-live-transitions

Source: [selected story](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#require-current-proof-before-live-transitions).
Terry requested planning and refinement on 2026-09-21 after reviewing the narrow
planned-work proposal. Planless proof discovery is deferred, not prohibited.

A developer whose agent changes a live installation can rely on the active
plan's required regression evidence applying to the actual candidate and relevant
conditions before the dependent action. This is a small reliability intervention
supporting parallel trunk work, not a prerequisite for dashboard development.
Queue priority and near-future direction remain unchanged.

Evidence: [ODF-080](../../../docs/maintainer/finding-names.md#odf-080--live-transitions-proceed-without-current-named-regression-proof)
records missing named tests in Pygardon plan 150 and an invalidated earlier pass
in plan 160 after concurrent integration. CI excluded the affected test. The
record does not establish that omitting the test caused the reported outage.

## Scope and decisions

- Cover planned actions that change a live installation: for example a restart,
  deployed configuration change, upgrade, migration, or updater enrollment.
  Read-only observation alone is not a live transition. These examples are not
  an exhaustive allowlist or a new deployment policy.
- Apply existing required proof to each dependent action. Current means matching
  promise, implementation/candidate, setup, relevant conditions, and observation;
  it does not mean a recent timestamp or identical whole-repository SHA alone.
- Reuse applicable proof. Relevant code, tests, dependencies, configuration, or
  environment changes require reassessment. If applicability cannot be established,
  obtain the missing observation or leave the dependent action stopped.
- A pass in another checkout or for another artifact does not qualify the actual
  candidate without demonstrated correspondence. A newly observed candidate change
  before acting triggers reassessment. No atomic deployment/concurrency guarantee
  is introduced by this guidance.
- Missing, failed, or unavailable required proof stops only the dependent action,
  with the exact command/obligation and gap reported in the existing plan or
  conversation. Existing failure diagnosis resolves stale-test versus product
  failures; neither an explanation nor unrelated CI green waives required proof.
- Operational checks retain their own observations and timing. Do not require a
  post-transition observation before the transition it can only observe, and do
  not substitute curl/container health for the regression prerequisite.
- Preserve existing authority: proof passing never grants deployment permission.

Deferred promises: defining proof for planless work; mandatory full-suite reruns;
new approvals, deployment locks or rollback; CI-observer repairs; dashboard or
backlog schema changes; a proof database, scheduler, or generic evaluation framework.
No live installation is changed to evaluate this story. No release/version bump
or installed managed-copy edits are included.

## Existing solutions and architecture

PFE assessed these owners at starting revision bc468321292b79af040d85d6fa9073a16982d17e:

- `src/skills/dough-story-refinement/references/planning.md`, Own executable proof:
  existing promise/boundary/evidence ownership and valid reuse. Retain this owner.
- `src/skills/dough-execute-plan/SKILL.md`, Continue or recover at an execution
  boundary: matching implementation/setup proof reuse already exists, but the
  action-time trigger is not explicit for live transitions within a slice.
- `src/skills/dough-execute-plan/references/wrap-up.md`, Accept proof: useful
  acceptance after implementation, too late to be the sole live-action safeguard.
- `src/skills/dough-execute-plan/references/execution-decisions.md`: conditional
  execution decisions and failed-proof diagnosis are the suitable existing home
  for the live-action application. Link to proof ownership instead of duplicating it.
- `src/skills/dough-execute-plan/references/delegation.md`: carry the applicable
  condition to the actor before an in-slice live action; coordinator return review
  cannot retroactively protect it. Use a reference rather than a second procedure.
- The destructive-later-outcome check compares removal with promised later value;
  it does not own regression freshness. Manual testing observes behavior rather
  than waiving execution prerequisites. CI observes registered revisions and does
  not establish coverage of excluded commands. Leave these responsibilities intact.

Chosen approach: change existing execution guidance and its necessary entry links.
No new runtime helper/reference file or parallel evidence representation is needed.
The North Star's publication/CI distinction is preserved; neither current topic
requires amendment for this local application of the existing proof contract.

Follow [AGENTS.md](../../../AGENTS.md), Accepted
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(small useful delivery), [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(source changes and release distinction), [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(representative behavior review), and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one behavioral owner, executing-project perspective). ADR index classifies
0000–0006 Accepted and 0007–0008 Proposed; no conflicting decision identified.

## Outside-in proof and delivery gates

The product boundary is an agent applying execution guidance to a supplied plan,
not a string match in Markdown. Follow AGENTS.md's representative behavior review:
invocation, required context, useful observable result. For each slice, walk the
case with the proposed source guidance and inspect command ordering and the action
outcome. Record whether this was a maintainer walkthrough or a fresh native run;
do not label a walkthrough as native agent evidence or field effectiveness.

Use disposable fixture state only. Give the representative plan a named regression
command, an independently passing operational check, and a simulated live command
that appends to an action log. The simulated action must not itself enforce the
proof prerequisite: that would supply the product's outcome in the fixture.
Provide facts and an ordinary continuation task, not the expected answer.
Observe actual command/results and the action log, not agent self-report alone.
Record the literal commands, candidate, fixture/setup locations, observation
locations, and assessment in this plan during execution. No fixture has been
created or behavioral proof run during planning.

These are ordinary shared-guidance changes, with no host integration change.
Use the representative review rather than routine three-host discovery tests or
building a native runner. If execution reveals host-specific activation uncertainty,
keep that claim pending and resolve applicable ADR 0005 requirements before release;
one host's result never proves another's. Changed payload/reference declarations,
if unexpectedly needed, require their existing focused delivery checks.

For guidance-only edits, inspect links and run `git diff --check`; no prose-token
assertion suite or full CI rerun is a substitute for behavior review. Follow normal
execution proof acceptance, independent post-change refactoring, descriptive
imperative commits, publication and asynchronous CI observation when separately
authorized. Required existing CI remains `npm run lint` and `npm test`; dashboard
CI remains owned by the unchanged workflow. Shell tests require Bash 4+ on PATH.
Do not widen local checks absent a changed boundary or unresolved concern.

## Ordered slices

### 1. Establish missing regression proof before a live action

Type: Behavior
Status: done

Behavior: Given an active plan naming a regression prerequisite with no accepted
observation, when the agent reaches an authorized live action, it obtains the
required proof before acting or leaves that action unperformed with the exact gap.

Add the conditional live-action trigger in existing execution decisions and link
it where execution delegates or performs that action. Carry the condition to the
actual actor within the slice, not just the coordinator's later acceptance.
Reuse the existing proof and failure-diagnosis contracts. Explicitly distinguish
regression prerequisites from operational observations.

Proof: In disposable state, the regression command initially fails while the
operational check passes. Continuing the supplied plan must run the named command
and leave the simulated-action log unchanged, with the obligation reported.
After a valid repair, the same journey obtains a passing result before appending
the action. An unavailable command variant likewise leaves the action absent and
names the missing prerequisite. Unrelated authorized work remains possible.
Review that existing deployment authority and post-action observations are preserved.

Sizing: one prerequisite decision and proof loop; medium confidence. No framework
or host adapter. The setup observes the decision without mechanically enforcing it.
Safe stopping point: missing-proof cases are handled; freshness beyond this case
remains owned by slice 2 and must not be claimed complete.

Delivered: added `## Require current regression proof before a live action` to
`src/skills/dough-execute-plan/references/execution-decisions.md` (after
"Diagnose failed proof", reusing its contract rather than duplicating it) and one
new "Give the agent:" bullet to `src/skills/dough-execute-plan/references/delegation.md`
carrying the condition to the delegated actor at action time.
`src/skills/dough-execute-plan/SKILL.md` and `references/wrap-up.md` needed no
edit: "Execute the next slice" step 2 already applies execution decisions
generically, and wrap-up's proof acceptance is unaffected. Post-change refactor
found `none — already clean` (duplication, naming, shotgun-surgery, and
cross-file coherence checks all passed; `.agents/skills/`/`.claude/skills/`
installed copies untouched).

Accepted proof (maintainer walkthrough, disposable fixture under `/tmp/`,
deleted after use — not a native/field run): a fake `regression.sh` (fails until
repaired), an always-passing `operational_check.sh`, a dumb `live_command.sh`
(appends to `action.log`, no gating logic of its own), and an unrelated
`read_only_check.sh`.
- Regression failing: `operational_check.sh` passed, `regression.sh` failed
  (exit 1); live action withheld, `action.log` stayed empty; unrelated
  `read_only_check.sh` still ran (exit 0).
- Repaired: `regression.sh` passed (exit 0); only then `live_command.sh` ran,
  appending `did-it <timestamp>` to `action.log`.
- Unavailable variant: `regression.sh` renamed away (exit 127 on invocation);
  live action withheld again, `action.log` unchanged (still one line).
- `git diff --check`: exit 0, no output (checked by both the implementer and
  the refactor pass).

### 2. Reassess an earlier pass against the actual live candidate

Type: Behavior
Status: planned

Behavior: Given retained passing proof, when a later planned live action is reached,
the agent reuses that pass only when it still applies to the actual candidate and
conditions; otherwise it obtains current proof or stops the action.

Extend the same action-time decision, without a special handler for each kind of
change. Use known candidate/context evidence and focused comparison. Do not demand
identical repository SHAs, treat proof age as a policy, or trust unrelated green CI.
Use existing execution state to retain sufficient correspondence and the decision.

Proof: Run the named regression on candidate A and retain its pass. Introduce a
controlled relevant change in candidate B before a later simulated live action;
the named regression now fails while the operational check and CI-visible subset
pass. Observe the agent rerun that excluded regression and leave the action log
unchanged. Contrast with a documentation-only change whose covered implementation
and setup remain identical: observe justified reuse and the authorized action,
without a redundant regression run. A pass for A presented while B will be acted
on must not be accepted without correspondence. Missing correspondence has the
same obtain-or-stop outcome; no new uncertainty-specific machinery is required.

Sizing: one proof-applicability decision with positive/negative boundary examples;
medium confidence. Reuse slice 1's disposable setup and action log. Safe stopping
point: all included examples have an observed decision and qualified evidence.

After accepted story proof, update ODF-080's response with actual implementation
commit(s), recoverable story locator, and first containing release or explicitly
pending release. This is part of recording the delivered response, not a separate
behavior slice. Do not claim effectiveness proven merely from shipping guidance.

## Promise ownership

| Promise | Owner and observation |
| --- | --- |
| Required missing/failed/unavailable proof prevents dependent action | Slice 1, command trace and unchanged action log |
| Passing operational checks do not substitute; later valid proof permits action | Slice 1, failing then passing prerequisite journey |
| Condition reaches actor before action, including within a delegated slice | Slice 1, review the actual actor's supplied guidance and ordered actions |
| Relevant concurrent change invalidates an earlier pass, including CI-excluded proof | Slice 2, candidate A→B trace and absent action |
| Matching evidence is reused after irrelevant changes | Slice 2, retained evidence, no repeated regression command, action present |
| Proof qualifies actual candidate/setup, not a different checkout's pass | Slice 2, candidate correspondence assessment |
| Scope, authority and unrelated work preserved | Both slices' representative review |
| Truthful response/release/effectiveness record | Slice 2 completion, ODF-080 diff against actual evidence |

## Cumulative design, sizing, and refinement assessment

One existing rule owns proof applicability. The live-action boundary applies it;
slice 2 exercises retained evidence rather than introducing another owner or state
machine. No preparatory Structure slice is needed. No numeric slice target, hard
limit, S/M/L definition, or overrun threshold is supplied by the project; do not
invent one. Each slice includes focused verification and local cleanup.

Refinement review on 2026-09-21 under the explicit request to refine if needed:
Slices 1 and 2 each have one Behavior gate and one decision/proof loop. Failure,
unavailability, and valid reuse are boundaries of those decisions, not independent
features. The actor-time trigger and candidate correspondence are explicit to avoid
hidden implementation gaps. No slices replaced; two slices retained; no sizing
exceptions or resplit recommendation. No further slice-specific subdivision concern
identified. Ready for direct execution when separately authorized. This assessment
is not behavioral proof or execution authorization.

If representative review cannot establish actual action ordering, keep proof
incomplete and obtain the missing observation rather than accepting prose presence.
If a universal deployment controller or proof-discovery policy becomes necessary,
stop and revisit scope instead of expanding this plan. Preserve accepted evidence
and independently safe work if an execution attempt requires refinement.

## Preparation and current state

Preparation history: `/Users/terryyin/git/open-dough-proof-planning`, branch
`codex/plan-current-live-proof`, based on
`bc468321292b79af040d85d6fa9073a16982d17e`; that workspace and branch were
already removed before this execution started, after the plan itself was
integrated onto `main` (commit `7afd084`).

Execution identity (Trunk Mode, `/dough-execute-plan 67 --trunk`):
- Originating/integration checkout: `/Users/terryyin/git/open-dough`, branch
  `main`, authorized remote `origin` (`git@github.com:terryyin/open-dough.git`).
- Queue claim: backlog entry `SEED-004#require-current-proof-before-live-transitions`
  taken and committed on `main`, then published to `origin/main` as `f59df38`
  before workspace creation.
- Execution checkout: `/Users/terryyin/.claude-worktrees/open-dough/067-current-proof-before-live-transitions`,
  branch `claude/067-current-proof-before-live-transitions`, created from the
  published claim `f59df38`.
- CI observer: GitHub Actions default (`ci.yml` / display name `CI`),
  repository `terryyin/open-dough`, target branch `main`, mailbox directory
  `/tmp/dough-ci-501/watch-Bp7TE3`; claim `f59df38` registered with it.
- Replanning permission: no explicit `--replan`/`--no-replan` given; treated as
  allowed (no restriction was previously recorded for this plan).
- Retained published revisions: `f59df38` (claim). Slice 1's increment is
  accepted and delivered pending this update's own publication.
