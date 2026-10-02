# Dependency execution direction and baseline

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

## Slice 1 accepted proof

All commands used `PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH` and reached exit 0 through the project runner:

```sh
npm test -- tests/support/story-dependencies.test.mjs tests/support/story-state-assessment.test.mjs tests/support/story-state-sibling-readiness.test.mjs tests/support/story-state-browser-import.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-dependencies-cases.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-source-cases.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-readiness-cases.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-recovery.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-admission-recovery.test.mjs
npm test -- tests/product-backlog-payload-update.sh
npm test -- src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs src/skills/dough-execute-plan/scripts/one-shot.test.mjs src/skills/dough-execute-plan/scripts/one-shot-start-refusal.test.mjs src/skills/dough-execute-plan/scripts/one-shot-escalation-queued.test.mjs tests/payload-declaration-links.sh
```

The dependency CLI fixtures plant canonical homes and run real read/update commands. Observations in `story-dependencies.test.mjs` prove two suppliers, partial resolution, stale/invalid/ambiguous refusal without writes, sibling and preparation preservation, plan-homed corrections, decision questions, and changed-review indication without renewing Ready or erasing Not ready reasons. Pure import assertions prove no Node/filesystem/store imports.

Actual startup tests in `workspace-publication-startup-dependencies-cases.mjs` exercise published Git facts, stale local copies, ordinary/one-shot/admission/carry starts, interrupted unpublished claims, and owned continuations. Refusal assertions prove absent workspace/profile/branch/Take and unchanged remote targets; all-resolved starts succeed. Dependency-only changes permit accepted owned resume; changed prose still refuses. Existing publication/one-shot regressions remain green.

`story-dependencies-installed-observe.mjs`, called by fresh/update payload fixtures with the release source unavailable, proves installed read/update plus ordinary/one-shot refusal with no workspace/profile or remote advancement. Both managed roots carry required runtime files. Guidance review walked an explicit necessary prerequisite through required endpoint/basis inputs and useful refusal.

Independent review found no production refactor. After formatting expanded a test past 250 lines, the recovery cases and shared publication setup were split cohesively; the original startup case entry still imports every assertion. `npm test -- src/skills/dough-execute-plan/scripts/workspace-publication-startup-dependencies-cases.mjs` passed again through the pinned runner. All other proof boundaries stayed unchanged. `npm run format` passed after annotating the fixture's caller-supplied `source_dir` for ShellCheck; that comment and mechanical formatting do not change the observed behavior. `git diff --check` passed. Dashboard stale-card/native launch and supplier completion/reconciliation remain slices 2–4.
