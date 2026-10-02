# Necessary blocking story dependencies

**Source:** [SEED-041#deliberate-implementation-dependencies](../../seeds/SEED-041-deliberate-implementation-dependencies.md#deliberate-implementation-dependencies)
**Identity:** SEED-041#deliberate-implementation-dependencies
**Prepared:** 2026-10-02. Planning only; no Take or execution authorization.

## Outcome and boundaries

Developers and agents can record, see, and resolve the exceptional prerequisite
that must finish before a dependent story starts. Each story still delivers
external value. Shared internal solutions are encouraged; common architectural
direction, PFE, and reconciliation remain the normal way to coordinate work.
Shared code or modest convenience alone never creates a blocking relationship.

Only the dependent card exposes an expandable dependency list. The supplier's
landing/wrap-up agent discovers consumers and resolves each relationship from
the consumer's perspective. A completion without successful reconciliation
does not release the block. Resolving all dependencies removes only this gate;
readiness judgment, changed-content indication, ownership, and execution
authorization retain their existing meanings.

Exclude informational dependencies, parallel agent collaboration, graphs,
reverse annotations, automatic scheduling/reordering, and a policy for stopping
execution already in progress. A blocker discovered during ongoing execution
requires a developer decision; this start gate does not kill a running agent.
Refinement and planning remain possible while execution is blocked.

## Direction and observed premises

Read [the selected direction, record contract, and baseline observations](CONTEXT.md)
for the shared owners, canonical dependency schema, completion evidence, and
proof entry points. These remain constraints of this plan.

## Execution context

- Established execution: `SEED-041#deliberate-implementation-dependencies`,
  publisher `dashboard-territory.local-open-dough`, agent `bastiaan-chan`.
- Mode: Story Branch; workspace
  `/Users/terryyin/git/open-dough/.worktrees/capture-and-visualize-beneficial-implementation`,
  branch `codex/capture-and-visualize-beneficial-implementation`.
- Authorized remote: `origin`; integration target: `main`; increments publish
  to the retained story branch. The originating and execution checkout are
  this established workspace; no integration checkout was supplied.
- Starting revision: `7d2400e2a6adfc690c03aa4f44e4f9ede25af4b1`.
  Published Take and initial candidate:
  `926c749062e6d2868848a558efa88881ea37785e`, confirmed on remote trunk and
  story branch. The Take's trunk CI is unobserved; branch delivery owns its
  separate observation.
- Setup: pinned Node `24.21.0` from the official distribution, invoked with
  `PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:$PATH`.
  `node scripts/setup-native.mjs npm` passed in this checkout without lockfile
  changes; `node --test tests/support/story-state-assessment.test.mjs tests/support/story-state-browser-import.test.mjs`
  passed (4 tests). Browser acquisition also passed.
- Existing planned replanning authority is retained; no numeric slice target
  or hard limit is supplied. Execute coherent slices in order with delivery
  before their successors. Formatter: `npm run format`; commit hook is
  check-only `npm run --silent lint -- --staged`.
- CI source: GitHub Actions, verified selector `ci.yml`, repository
  `terryyin/open-dough`, branch `codex/capture-and-visualize-beneficial-implementation`.
  Codex yielded-cell observation is bound to this checkout and `/root`:
  cell `21`, session `44377`, PID `84391`, mailbox
  `/tmp/dough-ci-501/watch-7PZYuD`. Managed delivery reuses it and registers
  accepted branch revisions. Slice 1 accepted and registered:
  `8bb73be064a7778470389bd5a458fb70f5a96962`; this is the next delivery base.

## Ordered slices

### 1. Record a necessary prerequisite and prevent execution

**Type:** Behavior

**Status:** done

**Behavior:** An agent records a justified prerequisite on an otherwise ready
consumer; reading it explains the wait, and starting that consumer refuses
before an execution claim or native session is created. Stories without such
a record retain current startup behavior.

Implement the canonical dependency reader/writer and workflow guard together.
Use stable supplier identity and condition as the agreement; require a reason
why normal shared design/reconciliation is insufficient. Do not infer records
from prose or backlog order. Use the same interpretation for ordinary queued
start, queued one-shot start, and admission of a canonical story carrying a
record. Context-only work has no invented dependency home. Apply the rule to
new execution starts, not an automatic interruption of an existing session.
Recheck the selected published basis on startup retries so a stale local copy
or stale dashboard cannot bypass a newly published block. Missing/malformed
dependency data in a present record must not masquerade as an empty list.

**Proof:** Extend real CLI temporary-home cases under `tests/support/` and
the existing workspace-publication startup fixtures. Record → read → start
must show the supplier/reason and leave claim/session side effects absent.
Exercise two suppliers, one unresolved after the other is satisfied, an
unchanged no-dependency story, and the queued one-shot/admission routes.
Preparation rerecording preserves dependencies; dependency writes preserve
unrelated Not ready reasons and sibling stories. A changed dependency produces
the existing changed-review indication. Pure import-graph proof stays green.

**Accepted proof:** [Slice 1 command and observation record](CONTEXT.md#slice-1-accepted-proof).
Independent refactor: none — already clean; formatting passed.

**Safe stop:** A recorded unresolved relationship blocks execution even before
the dashboard gains its richer presentation; CLI refusal explains it.

### 2. Explain blockers inside the dependent story card

**Type:** Behavior

**Status:** done

**Behavior:** The consumer card shows “Dependencies · 2 blocking”; expansion
lists supplier links, rationale, completion condition, state, and available
evidence. Only execution launch is unavailable with an accessible reason;
planning/refinement and normal card inspection remain available.

Extend pinned canonical enrichment, the typed work-entry projection, and
`WorkCard`/launch controls using slice 1's pure reader. A satisfied entry stays
inspectable without counting as blocking. No reverse annotation appears on the
supplier. Keep stage, priority, focus, and unrelated readiness labels intact.
Treat unreadable dependency facts as an observation problem, not “no blockers”.

**Proof:** Add a repository-backed dependency scenario beside the existing
story-readiness Playwright fixtures. Publish records using the real writer,
observe them in the built dashboard, expand by keyboard and touch-sized
controls, and verify narrow/zoomed text, focus, and non-color state labels.
Refresh after resolving one then both dependencies; assert counts and execution
availability while an unrelated Not ready judgment remains. Extend the real
installed-start fixture used by `agent-launch-start*.spec.ts` with a stale-card
race: publish a blocker after rendering, attempt start, and observe the command
refusal with no native-process launch. The existing result-parser test alone
does not own this proof.

**Accepted proof:** [Slice 2 UI and startup observations](CONTEXT.md#slice-2-accepted-proof).
Refactor and formatting passed; independent readiness semantics are preserved.

**Safe stop:** Developers can inspect and author blockers while resolutions are
still performed explicitly through the slice 1 command.

### 3. Resolve simple dependencies during supplier completion

**Type:** Behavior

**Status:** planned

**Behavior:** A completed, integrated supplier's landing/wrap-up finds its
consumers and resolves each directly satisfied condition. Another unresolved
supplier still blocks. Retrying or later wrapping up preserves the earlier
resolution and evidence after supplier records are removed.

Add one shared discovery/update procedure called from the existing Land and
wrap-up guidance at the appropriate completion/publication boundaries. Reuse
canonical home discovery and Git recovery; do not turn the generic backlog
`complete` command or every landing into automatic fulfillment. A simple case
needs no changed consumer assumptions: completion evidence directly proves
the recorded condition. Leave all other cases unresolved for slice 4. Writes
must detect a changed consumer agreement before applying an old resolution.

**Proof:** In local bare-origin fixtures, drive discovery and updates through
the real commands with one supplier and two consumers, including an unqueued
canonical consumer and a sibling section. Resolve one relationship and prove
the actual start guard changes only for the appropriate consumer. An increment
landing, missing completion evidence, or absent supplier home without recovery
evidence releases nothing. Preserve evidence, delete the spent supplier home,
repeat the visit, and show stable consumer records and readable historical
links. Reuse existing closure publication/retry cases for accepted-revision
handling; add dependency assertions at the consuming operation.

Review the published guidance's invocation, required context, and useful
outcome as [AGENTS.md](../../../AGENTS.md) requires. Walk a generic land with no
completed story and a completed story wrap-up; neither may invent completion.

**Safe stop:** Directly satisfied conditions resolve automatically; cases
requiring reconciliation remain blocked with an explanation.

### 4. Reconcile bounded differences and retain developer decisions

**Type:** Behavior

**Status:** planned

**Behavior:** The supplier agent reads each consumer's goal, scope, and plan.
A bounded, unambiguous difference is reconciled and then verified before the
relationship is satisfied. A choice of behavior or architecture that the
consumer does not settle retains a `decision-needed` block with the actual
question. Other consumers can still be resolved independently.

**Selected boundary:** Reconciliation updates dependency evidence and existing
story/plan assumptions within the consumer's established goal and scope only.
Implementing the unstarted consumer requires its own execution authorization.
If satisfaction still needs consumer implementation, retain the block and
report the need; assumption edits alone do not prove fulfillment.

Under this boundary, moderate means the consumer's existing intent
determines the reconciliation without a new product/architecture choice.
Complexity is judged from that uncertainty, not an arbitrary score. Preserve
other readiness reasons and mark changed content through the existing reader;
never automatically renew Ready. A stale agreement or failed reconciliation
stays unresolved. Report the per-consumer outcome and retain enough context
for a later developer decision and retry.

**Proof:** Drive a multi-consumer fixture through shared discovery/update and
the start reader: directly satisfied, bounded assumption adjustment, and
unsettled behavior choice. Check independent outcomes, idempotent repeat visits,
stale-write refusal, preserved Not ready reasons, and the decision text shown
on the card. Walk the agent-facing procedure using those same goals and
evidence, including a refusal to choose unspecified product behavior. The
fixture proves state transitions; the guidance review assesses whether the
agent is told how to judge and stop. Do not claim native-agent reasoning from
a mocked protocol. Include a condition requiring consumer implementation;
verify that it remains blocked and the procedure requests separate execution
authorization rather than implementing the consumer or declaring satisfaction.

## Proof ownership and execution gates

| Story promise | Owning slice |
| --- | --- |
| Shared internals alone introduce no wait; real blocking records prevent new execution | 1 |
| Consumer-only disclosure, accessibility, and stale-card enforcement | 2 |
| Positive supplier completion, independent fulfillment, cleanup evidence, rerun safety | 3 |
| Consumer-perspective reconciliation and developer decision without readiness erasure | 4 |

All four are vertical Behavior slices; no preliminary Structure slice is
justified. Each owns one observable progression and its boundary cases. There
is no supplied numeric slice duration; none is invented. Keep the shared
dependency interpretation and update procedure cohesive across slices.

During authorized execution, first reconcile the older preparation checkout
with current source and confirm the cited entry points still exist. Use the
repository's execution/refactoring and delivery gates; the current planning
request authorizes no commit. Run affected CLI/start/closure fixtures and the
mapped dashboard journeys, plus dashboard typecheck/build when their code
changes, lint, and `git diff --check`. Broaden tests when shared-reader or
fixture changes affect additional consumers. Hosted CI does not itself mandate
every check as a local gate. Conventional skill guidance changes use the
AGENTS.md behavior review; installation/update/native-host discovery is outside
scope unless implementation actually changes those contracts.

## Readiness review

Terry selected evidence and story/plan assumption reconciliation only; consumer
implementation requires its own execution authorization. The seed and slice 4
now agree on that boundary and its proof. The four bounded slices map the
story's promises, including the UX/UI inspection and recovery examples, to
observable proof. No remaining blocking preparation concern was identified.
Record the assessment against the current seed and plan through the shared
recorder. Preparation readiness does not authorize implementation or Take.
