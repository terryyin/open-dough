# Publish source for hosted proof without marking its slice complete

**Identity:** SEED-158#publish-awaiting-hosted-proof
**Source:** [Selected story](../../seeds/SEED-158-publish-awaiting-hosted-proof.md#publish-awaiting-hosted-proof)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Let a coordinator publish reviewed planned-slice source through the existing
guarded preparation, hook, credit and exact-candidate publication path while
that slice and its receiving obligations stay unfinished, then finish through
the ordinary done path once the hosted or external observation is accepted.
All four source examples belong to the one behavior below.

Change the existing fresh-increment preparation and delivery contract so a
progress publication may omit the selected-slice `done` mutation and may
proceed while receiving obligations that motivate that publication remain open
and owned. Do not close those obligations, invent accepted proof, grant release
or early trunk-integration authority, bypass hosted CI or merge gates, or make
agent-commit-plus-deliver the supported contract. Failed local prerequisites
still publish nothing. Ordinary fresh delivery that marks `done` remains the
completion path and still refuses while promised observation is missing.
This plan authorizes no execution, release or installed-copy edits by itself.

## Existing solution and architectural direction

PFE inspected the whole-product publication-before-proof responsibility through
the guarded fresh entry, preparation, obligation check, slice-status mutation,
managed delivery, wrap-up delivery handoff and the retained finding. The
coherent owner is the existing fresh path:

- [fresh-increment.md](../../../src/skills/dough-execute-plan/references/fresh-increment.md)
  already owns mechanical preparation, commit and authorized managed delivery
  for planned increments, and currently states that delivery marks the selected
  slice `done` itself.
- [execution-increment-preparation.mjs](../../../src/skills/dough-execute-plan/scripts/execution-increment-preparation.mjs)
  always runs story-obligation checks around `markSelectedSliceDone` for planned
  work before staging and commit.
- [trunk-publication.md](../../../src/skills/dough-execute-plan/references/trunk-publication.md)
  and existing-candidate `deliver` already publish an exact validated candidate
  with credit, hooks and resume; they are not a second supported unfinished-slice
  contract by themselves.
- [story-obligations.md](../../../src/skills/dough-execute-plan/references/story-obligations.md)
  correctly keeps receiving obligations open until their observation exists.

Extend that fresh preparation/delivery ownership rather than documenting the
manual agent-commit + `deliver --validated-candidate` workaround, inventing
Git plumbing, or adding a parallel publisher. Place the coordinator-facing rule
in the fresh-increment reference and keep script behavior aligned; link from
wrap-up delivery only where discovery needs it. No North Star topic is
warranted: target authority, workspace/observer ownership and resume stay with
their current owners.

Follow [AGENTS.md](../../../AGENTS.md),
[ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
[ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md),
[ADR 0009 — Git branching and integration](../../../docs/adrs/0009-git-branching-and-integration.md),
and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The ADR index and these records agree on Accepted; no supersession or conflict
was found. Author runtime guidance in `src/skills/`, addressing the executing
agent's project. Keep this repository's installed copies release-managed.
Keep one shared rule for Codex, Cursor and Claude Code. No installation or
discovery change is selected; ADR 0009's mode targets stay unchanged.

## Observed premises and proof limits

Preparation inspected revision
`aa14a2b1be68455e32fc4fadea9adcfaba9ac67e` in
`/Users/terryyin/git/open-dough/.worktrees/publish-source-for-hosted-proof-without-marking`.

- Fresh planned preparation always checks obligations, then marks the selected
  slice done, then checks again before staging/commit
  (`execution-increment-preparation.mjs`). `fresh-increment.md` documents that
  delivery marks the slice done and that planned preparation JSON supplies only
  `path` and `slice`.
- Existing automated discrimination, executed in the named checkout:
  `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh src/skills/dough-execute-plan/scripts/story-obligations.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-slice-status.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh.test.mjs`
  returned exit 0. The fresh suite includes
  `planned obligations refuse before the status step, also when already done, and after it before commit`,
  which observes `operation: "story obligations"` with `open-obligation` and an
  unchanged plan when a receiving obligation is open. Slice-status tests observe
  that only the selected real `Status:` line becomes `done` on success. These
  checks settle the current refusal/done gate this story extends; they do not
  yet prove a progress publication path.
- Retained Lizard DD-002 evidence in
  [ODF-275](../../../docs/maintainer/findings/ODF-275.md) shows the coordinator
  fallback (agent-commit + existing-candidate deliver, later plan-only fresh) and
  confirms no intervening provisional route through the assessed revisions. That
  history is context for scope, not a substitute for new discriminating proof.
- The proposed change depends on no new host, remote merge or release behavior.
  Local fixture publication with `authority: local-only` (existing fresh fixtures)
  is enough to prove commit and withheld remote effects; publish-authority resume
  and exact-candidate rules stay with current delivery tests where the change
  touches them.

No outstanding infrastructure premise or human-owned decision blocks this plan.
CLI shape (flag versus preparation field) is an implementation choice inside the
slice as long as the coordinator-facing contract stays one guarded fresh path.

## Outside-in proof

All promises map to slice 1. At execution, retain setup, literal commands,
observations and limits in this plan's accepted proof. Prefer owned temporary
fixtures from the existing fresh-test harness; do not treat another project's
hosted run as this story's required proof.

| Promise | Observable proof in slice 1 |
| --- | --- |
| Progress publication without done while receiving proof is pending | Fixture planned slice with an open receiving obligation whose observation needs the published revision: the guarded progress path prepares, commits and (under local-only or existing publish fixtures) yields an exact candidate SHA; the selected slice stays not `done`; the obligation stays open; plan bytes show no false done transition. |
| Failed local prerequisites publish nothing | Same fixture with a failing formatting or equivalent prerequisite: nonzero preparation, no commit/publication of a new candidate, plan unchanged for the progress attempt. |
| Ordinary completion after accepted observation | After recording accepted proof that closes the pending observation, ordinary fresh marks the same slice `done` and commits; completion still refuses while the observation is missing. |
| Preserve credit, ownership and resume | Progress success uses the same agent/ordinary commit and exact-candidate receipt shape as fresh; an interrupted or accepted provisional candidate resumes through existing-candidate delivery without a second preparation inventing another commit. Focused regression of preserved slice-status and obligation refusal for the ordinary done path stays green. |
| Guidance discoverability and finding evidence | Representative coordinator walk through the updated fresh-increment (and any necessary wrap-up link) matches examples 1–4. Update ODF-275 with actual response revision(s), proof/limits, unreleased/first-containing-release fact as known, and an ordinary-use request. Do not mark the finding resolved from delivery alone. |

Review invocation context, required project inputs and useful outcome under
AGENTS.md. Because no integration mechanism changes, do not add a routine
three-host discovery matrix. If execution introduces a new host dependency,
stop the dependent claim and reassess ADR 0005 obligations.

## Ordered slices

### 1. Publish unfinished-slice source through guarded fresh without claiming done
Type: Behavior
Status: done
Proof: Accepted 2026-10-28. Source review retained in `source-review.md`
(commitments 1–25.4 observed or excluded). Discriminating fixtures in
`execution-increment-fresh-progress.test.mjs` plus ordinary
fresh/slice-status/obligations regressions; consumer-trace dispositions for
prep/obligations/guidance; guidance walk of `fresh-increment.md` `progress`
and wrap-up link; ODF-275 response draft with SHA placeholder until the
response commit exists.
Command: `PATH="<checkout>/node_modules/.bin:/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/story-obligations.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-slice-status.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-progress.test.mjs` — pass.

Behavior: A coordinator has reviewed planned-slice source whose promised hosted
or external observation still depends on the published revision (receiving
obligation open) → they invoke the guarded progress publication on the existing
fresh path → preparation, hooks and credit run; an exact candidate is committed
and eligible for authorized publication; the slice remains unfinished; receiving
obligations stay open and owned; failed prerequisites publish nothing; after the
observation is accepted, ordinary fresh marks done and still refuses completion
without that observation.

Extend preparation/delivery so progress omits the selected-slice done mutation
and does not treat the motivating open receiving obligations as a commit refusal,
without closing them or weakening ordinary done/completion gates. Update
coordinator guidance in `src/skills/dough-execute-plan/references/` so the
supported path is the guarded fresh progress contract, not manual Git plumbing.
Keep target authority, workspace/observer ownership and interrupted-publication
recovery with their current owners.

Run focused fresh/obligation proof before treating the change as ready, then
perform the independent post-change refactor and normal delivery under
dough-execute-plan. Trace changed consumers before choosing regressions; begin
with the literal focused runner command under Observed premises and extend only
when the change reaches additional promises. The repository's pre-commit hook
owns staged lint; hosted CI is not a requirement to rerun every local suite for
an owned fixture change unless execution widens the blast radius.

Retain ODF-275's response/evaluation/ordinary-use request as part of this same
outcome. After the response commit exists, record its actual SHA through normal
completion bookkeeping; never insert a guessed future revision. If no release
contains it yet, record that honestly. This story does not authorize releasing,
updating other projects or claiming an ordinary-use result in advance.

Sizing: one cohesive delivery-contract outcome and proof loop, including
implementation, focused verification, guidance and cleanup; no preparatory
Structure slice or speculative second publisher. No numeric slice budget is
supplied here. Honor any budget supplied at execution.

## Story obligations

### X1. Early trunk / Dough Land for stable checkout
Reported: slice 1 — "Early trunk / Dough Land for stable checkout deferred"
Story clause: "Early trunk integration or early Dough Land solely to obtain a stable main checkout for later proof remains a separate publication-before-proof boundary and is not promised here."
Disposition: excluded "Early trunk integration or early Dough Land solely to obtain a stable main checkout for later proof remains a separate publication-before-proof boundary and is not promised here."
Commitment: 14

### X2. Second Git plumbing path
Reported: slice 1 — "No second Git plumbing path"
Story clause: "No second Git plumbing path"
Disposition: excluded "No second Git plumbing path"
Commitment: 15.1

### X3. Agent-commit-plus-deliver as supported contract
Reported: slice 1 — "Agent-commit-plus-deliver not the supported contract"
Story clause: "manual agent-commit-plus-deliver workaround as the supported contract"
Disposition: excluded "manual agent-commit-plus-deliver workaround as the supported contract"
Commitment: 15.2

### X4. New observer
Reported: slice 1 — "No new observer"
Story clause: "new observer"
Disposition: excluded "new observer"
Commitment: 15.3

### X5. Broad story-obligation redesign
Reported: slice 1 — "No broad story-obligation redesign"
Story clause: "broad redesign of story-obligation ownership"
Disposition: excluded "broad redesign of story-obligation ownership"
Commitment: 15.4

### X6. Preparation does not authorize implementation or release
Reported: slice 1 — "Preparation does not authorize implementation or a release"
Story clause: "This preparation does not authorize implementation or a release."
Disposition: excluded "This preparation does not authorize implementation or a release."
Commitment: 16

### X7. Queueing is not resolution
Reported: slice 1 — "Queueing is not resolution"
Story clause: "Queueing is **not resolution**."
Disposition: excluded "Queueing is **not resolution**."
Commitment: 17

## Current decisions and concern review

- One authoritative unfinished-slice publication contract on the existing fresh
  path; the agent-commit + existing-candidate workaround is not the supported
  product contract.
- Early trunk integration / early Dough Land for a stable main checkout remains
  deferred outside this story.
- Refinement was not needed: the one Behavior slice owns the complete outcome,
  its proof, guidance and finding evidence without fragmenting them into
  activities or a speculative Structure prelude.
- No remaining slice-specific concern was identified in this preparation.
  There is no pre-Take human decision or blocking supplier dependency.

## Learnings

- Progress is one guarded fresh field (`progress: true`): omit selected-slice
  `done` and pass `committing: false` into obligation checks so motivating open
  receiving obligations stay owned without refusing publication.
- Delivery read-budget required compressing recovery prose in
  `fresh-increment.md` to fit the progress contract; resume rules unchanged.
- Pre-existing `wrap-up.md` oversize left unresolved (unrelated to this outcome).
- ODF-275 response SHA and first containing release stay honest until the
  response commit and any later release exist; queueing is not resolution.
