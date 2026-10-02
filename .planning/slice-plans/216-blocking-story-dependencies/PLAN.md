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

## Direction and existing owners

- [ADR 0001 — Ubiquitous Language](../../../docs/adrs/0001-ubiquitous-language-accepted.md): stable work identities and canonical story homes.
- [ADR 0002 — Software Development Lifecycle Principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md): shared solutions, continuous integration, PFE, and one authority per fact. Includes the user's authorized, still-uncommitted clarification that blocking sequences are exceptional.
- [ADR 0003 — Tagged Release Versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and [ADR 0006 — Write Skills for Executing Agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md): author distributed guidance in `src/skills/`, leave installed managed copies alone, and speak from the executing project's perspective.
- [ADR 0005 — Cross-Tool Validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md): deterministic fixtures establish command/protocol behavior, not native-agent reasoning quality.
- [North Star](../../NORTH-STAR.md), “One backlog interpretation, separate observation and presentation” and “A start establishes claim and workspace before the session”: share pure domain interpretation, project pinned repository facts into the dashboard, and enforce execution conditions at the actual workflow start.
- [UX/UI direction](../../../docs/dashboard-ux-ui-north-star.md) and [requirements](../../../docs/project-visibility-requirements.md) hold the selected card presentation and supplier-driven resolution behavior.

PFE found suitable identity/home readers, preparation recording, published-source
startup, dashboard enrichment, and closure publication. Reuse those boundaries.
Dependency fulfillment is a different fact from preparation judgment; do not
encode it as a synthetic Not ready reason or duplicate it in an agent profile.
No new North Star topic, generic graph service, or relationship registry is needed.

### Record and completion choices

Use one versioned `json dough-story-dependencies` block in the consumer's
canonical story section, including a plan-homed canonical correction where
supported. Each entry names the supplier's stable identity and locator, the
shared implementation involved, sequencing rationale, completion condition,
state (`waiting`, `satisfied`, or `decision-needed`), and resolution evidence.
This is a dependency record, not another readiness grammar. Keep interpretation
pure beside the existing backlog readers; filesystem commands own discovery
and writes. Add a narrow dependency read/update command through existing CLI
dispatch. Validate endpoints and required fields, preserve sibling content,
and refuse an ambiguous home or stale write without partially changing it.

A separate block is deliberate: `recordStoryState` reconstructs its own payload,
and readiness hashing excludes that entire block. Putting dependency facts
there would otherwise risk losing them on a preparation write or hiding a
changed agreement. The dependency block remains in the story's review basis;
changing it reports changed content without replacing the recorded judgment.

Discover consumers through the project's current canonical homes and backlog
identity conventions, including queued, Taken, and prepared unqueued stories.
Derive reverse references during the supplier visit; maintain no second store.
Discovery must report an unreadable relevant home rather than claim every
consumer was handled. Historical supplier evidence uses a recoverable Git
revision and path; do not scan history to invent live consumers.

Completion requires both the selected supplier's outcome evidence (all planned
slices done, or evidenced planless completion) and delivery to the authorized
integration target. A local commit, an increment landing, absence from Taken,
or cleanup alone is insufficient. Persist the supplier's recoverable outcome
evidence before deletion. Resolution updates may be published after the
supplier's accepted landing; until their publication consumers remain blocked.
Wrap-up must finish or explicitly retain unresolved dependency work before
retiring the context needed to perform it. Evidence travels in the consumer's
record, including the accepted supplier revision and what satisfied its condition.

## Observed premises and proof entry points

Inspection and fixture runs used the clean integration checkout at
`662fdf5117d67def93c55137f4ead577867b8753`. The relevant product-backlog,
execute-plan, wrap-up, dashboard tests, and story-preparation paths had no diff
against fetched `origin/main` at `a8e0926c2cc4373d2a828ee886f94b9f4ea6302f`.
The preparation worktree remains at `52de01a92a6552582840486ee2f6b30b422ca003`
with these drafts. Reconcile it with current trunk through the established
workflow before implementation; preserve the drafts and the now-delivered
changed-readiness behavior. The older installed recorder here must not be
mistaken for current source behavior.

| Premise consumed by the plan | Observation and result |
| --- | --- |
| Canonical parsing and review judgment can be shared without browser filesystem access. | Read `product-backlog-story-state.mjs`, its home/block/basis modules, and `dashboard/src/storyPreparation.ts`. The browser imports the pure reader; recording rebuilds its preparation payload and hashing excludes only its state fences. The CLI assessment/sibling and import-graph tests below passed. |
| Actual startup can stop before claiming or launching, independently of card state. | Traced `execution-start-source.mjs` → `readPublishedExecutionSource` → pinned home/plan reads and preparation checks. Traced the alternate one-shot route to `requireOneShotStart` in `one-shot-ownership.mjs`; this needs the same dependency guard. Startup fixture cases below exercised successful claims, changed Ready, absent/Not ready refusals, and failed-fetch no-claim behavior. |
| Dashboard enrichment and accessible disclosure have an existing repository-backed seam. | Traced `preparationEnrichment.ts` through pinned canonical text reads and `storyPreparation.ts`; `story-readiness-accessible.spec.ts` publishes committed fixture revisions via `publishCommittedOrigin` and opens the built page. The targeted run below passed. `execution-start-result.spec.ts` checks result interpretation, not the complete launch journey. |
| Landing publication is not story completion; closure already preserves recoverable evidence and retries. | Read `dough-land/SKILL.md`, `dough-story-wrap-up/SKILL.md`, and closure integration tests. Land accepts a checkout; wrap-up separately judges all slices/outcome and preserves the before-cleanup revision. The integration fixture below exercised accepted target publication and no duplicate publication on retry. It does not prove agent reconciliation. |

Literal baseline commands, run from the integration checkout:

```sh
node --test tests/support/story-state-assessment.test.mjs tests/support/story-state-sibling-readiness.test.mjs tests/support/story-state-browser-import.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-source-cases.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-readiness-cases.mjs src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/story-readiness-accessible.spec.ts dashboard/tests/execution-start-result.spec.ts --workers=2
```

Node: 22 passed, zero failures. Dashboard: exit 0. The initial dashboard run
passed assertions but exited 1 because conflicting NO_COLOR/FORCE_COLOR
settings wrote warnings; removing NO_COLOR made the same run pass its quiet
output rule. These are observations of existing seams, not proof of the new
dependency behavior. All repositories/remotes in the runs were local fixtures.

## Ordered slices

### 1. Record a necessary prerequisite and prevent execution

**Type:** Behavior

**Status:** planned

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

**Safe stop:** A recorded unresolved relationship blocks execution even before
the dashboard gains its richer presentation; CLI refusal explains it.

### 2. Explain blockers inside the dependent story card

**Type:** Behavior

**Status:** planned

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
