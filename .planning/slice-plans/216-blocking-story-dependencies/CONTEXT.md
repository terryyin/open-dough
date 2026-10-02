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

## Slice 2 accepted proof

All commands use the pinned PATH from slice 1. Each reached terminal exit 0:

```sh
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/story-dependencies.spec.ts dashboard/tests/agent-launch-start-dependencies.spec.ts dashboard/tests/story-readiness.spec.ts dashboard/tests/story-readiness-accessible.spec.ts dashboard/tests/story-readiness-gaps.spec.ts dashboard/tests/agent-launch-start.spec.ts dashboard/tests/agent-launch-start-card.spec.ts dashboard/tests/agent-launch-start-refusal.spec.ts --workers=2
npm run typecheck:dashboard
npm run build:dashboard
npm test -- tests/support/story-state-browser-import.test.mjs
```

`storyDependencyFixture.ts` authors real CLI records and publishes them to the real start-origin fixture; the built browser reads pinned canonical texts. `story-dependencies.spec.ts` observes two, one, then zero blockers; supplier cards have no reverse disclosure. Its assertions preserve priority, preparation, Not ready reasons, inspection/refinement dialogs, refresh focus, and satisfied evidence. Loading/malformed/unreadable facts disable only new execution with accessible reasons. After dependency resolution, the existing noted action returns but the actual installed start still refuses unrelated Not ready without a Take or native launch.

`storyDependencyAccessible.ts` observes keyboard disclosure/visible focus, 44px control, contrast, whole narrow/zoomed text, touch tap, supplier/evidence links, and non-color state/decision/condition/rationale text. `agent-launch-start-dependencies.spec.ts` publishes a blocker after rendering a ready card; UI start crosses the actual installed command, refuses naming the supplier/reason/condition, and leaves Taken profiles, native calls, and session records empty. Synthetic Claude supplies only native-process observation, never the refusal.

Independent refactor named the repeated launch predicate in `CardLaunches.tsx`; the two dependency files plus `agent-launch-start-card.spec.ts` passed again through `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/story-dependencies.spec.ts dashboard/tests/agent-launch-start-dependencies.spec.ts dashboard/tests/agent-launch-start-card.spec.ts --workers=2`, as did typecheck. Other inspected boundaries stayed unchanged. Mechanical lint repairs removed non-null assertions using fixed supplier tuples and a bounds assertion with the same observing meaning; typecheck and `npm run format` passed. `git diff --check` passed. The broader dashboard suite and native-agent reasoning are not claimed.

Fixture-only initial failures were diagnosed: routine Git stderr violated quiet output, refusal wording differed, a same-revision refresh reused canonical cache, and dialog Cancel focus handoff overlapped the focus assertion. Quiet output, actual wording, a new published revision, and awaited focus handoff corrected those prerequisites; passing observations establish the actual UI/start behavior.

## CI repair after slice 2

Run `36997893525`, attempt 1, at `29bd2aa07e7db835d17b819b4e84a0ec09b30f2e` exposed four legacy dashboard fixture assumptions: keyboard traversal expected disabled execution to receive focus, and two cross-project launch journeys omitted the canonical Doughnut source now required by dependency inspection. The repair preserves the production gate, publishes the existing shared canonical fixture, and reads actual enabled actions. Slice 3 remains planned; its paused draft is preserved separately during repair.

With the pinned PATH, terminal exit 0:

```sh
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/accessible-overview-keyboard.spec.ts dashboard/tests/accessible-overview.spec.ts dashboard/tests/agent-launch-recent-sessions.spec.ts dashboard/tests/agent-launch-attention.spec.ts dashboard/tests/story-dependencies.spec.ts dashboard/tests/agent-launch-start-dependencies.spec.ts --workers=2
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/accessible-overview-keyboard.spec.ts --workers=2
npm test -- tests/support/story-dependencies.test.mjs
```

The keyboard baseline failed on disabled execution focus. Final assertions observe the accessible unavailable-source reason and refinement availability. End navigation retains its viewport assertion, waiting for all 16 unavailable-source facts to settle card heights. The real stale-card start and dependency command observations remain green.

Independent refactor consolidated identical canonical fixture construction in `doughnutProject.ts`; `auto-refresh-project-isolation.spec.ts` imports it and retains its goal, membership, source revision, focus, and schedule assertions. `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/auto-refresh-project-isolation.spec.ts dashboard/tests/agent-launch-recent-sessions.spec.ts dashboard/tests/agent-launch-attention.spec.ts --workers=2` passed. Other accepted boundaries were unchanged. No product behavior changed; no full local CI run is claimed.

## Execution proof gates

Use the repository's execution/refactoring and delivery gates. Run affected
CLI/start/closure fixtures and mapped dashboard journeys, plus dashboard
typecheck/build when their code changes, hook-owned lint, and `git diff --check`.
Broaden tests when shared-reader or fixture changes affect additional consumers.
Hosted CI does not itself mandate every check as a local gate. Conventional
skill guidance changes use the AGENTS.md behavior review; installation/update
and native-host discovery checks apply when those contracts change. The older
preparation checkout and cited entry points were reconciled at established start;
execution authority comes from the current invocation, not preparation readiness.

## Slice 3 accepted proof

Pinned PATH as above; all commands reached terminal exit 0:

```sh
npm test -- tests/support/supplier-dependency-completion.test.mjs tests/support/product-backlog-plan-reader.test.mjs tests/support/product-backlog-plan-reader-bold.test.mjs tests/support/story-dependencies.test.mjs tests/support/story-state-browser-import.test.mjs src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-dependencies-cases.mjs
npm test -- tests/product-backlog-payload-update.sh tests/payload-declaration-links.sh tests/dough-update-guidance-payload.sh tests/install.sh tests/install-preserves-open-dough-json.sh tests/update-adds-new-payload-skill.sh
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/branch-slice-progress.spec.ts dashboard/tests/taken-slice-progress.spec.ts dashboard/tests/plan-execution-complete-detail.spec.ts --workers=2
npm test -- tests/support/supplier-dependency-completion.test.mjs tests/product-backlog-payload-update.sh
npm test -- tests/support/supplier-dependency-refusal.test.mjs src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs
```

Bare-origin fixtures author dependency records through real commands. Completion assertions observe unfinished increment/unpublished outcome refusal without consumer writes; resolving an unqueued sibling changes only it. Actual startup remains blocked before relationship publication, starts that sibling after publication, and still refuses the two-supplier consumer naming its remaining supplier. Stale condition/basis refusals preserve bytes. Planless completion requires explicit recoverable outcome evidence. Generic queue completion and missing supplier homes release nothing and create no workspace.

Cleanup and replay preserve exact consumer bytes and successfully recover the historical supplier path with `git show`. Closure tests consume the real accepted race/retry receipt, retain a distinct before-cleanup evidence revision, and repeat identically. Installed offline fixtures run discovery, guarded resolution and repeat with release source unavailable. No native-agent reasoning is claimed.

The existing pure plan reader gained the project's bold labels; exact-label, unsupported-status and quoted-fence assertions join existing plain-label/import proof. Existing dashboard plan-progress/detail consumers passed. Historical backlog plan links participate in completion checks, preventing a missing preparation record from silently becoming planless. Payload declarations remain inline because historical readers consume them; installer argument parsing alone was extracted, with install/update consumers checked.

Guidance review walked generic Land without a completed identity and completed wrap-up: outcome judgment and accepted integration remain distinct; Trunk resolution follows accepted before-cleanup publication, and Story Branch post-integration consumer changes need subsequent publication/completion before retirement. Discovery gaps retain affected context. Reconciliation and developer decisions remain slice 4. `git diff --check` passed; full local CI is not claimed.

Independent refactor: none — already clean; no proof boundaries changed and no tests repeated. Mechanical formatting passed after a local ShellCheck annotation for `platform`, assigned by the sourced argument parser. Changed files stay within 250 lines, and `git diff --check` passed.

## Slice 4 accepted proof

Pinned PATH as above; both commands reached terminal exit 0:

```sh
npm test -- tests/support/supplier-reconciliation.test.mjs tests/support/supplier-reconciliation-refusal.test.mjs tests/support/supplier-dependency-completion.test.mjs tests/support/supplier-dependency-refusal.test.mjs tests/support/story-dependencies.test.mjs tests/support/story-state-browser-import.test.mjs tests/payload-declaration-links.sh
npm test -- tests/product-backlog-payload-update.sh
```

The multi-consumer fixture supplies a completed seconds contract, consumer intent and an existing outdated assumption. Its explicit assumption edit represents bounded agent judgment; assertions verify the edited plan against historical contract evidence and unchanged goal. Real guarded outcome commands resolve direct and bounded consumers independently; another supplier still blocks the direct consumer. They record the literal unspecified-compatibility question and implemented-UI gap after the supplier home has been deleted. Waiting/decision receipts explicitly remain unresolved and repeat byte-identically. Historical outcome/accepted integration/agreement guards apply to all three states; ordinary authoring retains live endpoint checks and historical evidence cannot create a new prerequisite.

Actual start commands refuse the decision and implementation consumers without workspace creation or remote advancement. After dependency resolution, the queued bounded consumer still refuses its separate Not ready judgment; preparation reasons and changed-review indication survive assumption and dependency writes. The initial fixture used canonical admission, whose established authority permits admission despite preparation; replacing that setup with the real `add` command observes the intended ordinary route without changing startup behavior.

Refusal assertions preserve bytes for stale basis/condition, missing evidence, incomplete planned evidence, missing historical supplier, and absent agreement. The installed payload proof and affected existing direct-completion/authoring/import tests passed again. Existing slice 2 `storyDependencyAccessible.ts` observes the same literal question and accessibility; its boundary is unchanged and reused without rerun.

Guidance review uses the fixture's same goals/evidence: settled seconds intent permits a verified assumption adjustment; unspecified compatibility leaves the actual developer question; required consumer UI implementation remains blocked pending separate execution authorization. The procedure requires intent rereading, per-consumer outcomes and retained evidence, never automatically renews Ready, and preserves the wrap-up link's existing anchor. State-transition fixtures do not claim native-agent reasoning.

Independent refactor: none — already clean; accepted proof remains unchanged and no tests were repeated. `npm run format` and `git diff --check` passed; changed files remain within 250 lines.

## Automatic execution retrospective

Reviewed the completed planned execution against its selected seed, initial plan at the established Take, approved reconciliation boundary, and current whole-product direction. Attributable published implementation revisions are `8bb73be` (record/start guard), `29bd2aa` (dashboard), `a049909` (owned CI fixture repair), `186ef150` (supplier completion), and `ce8b9df` (reconciliation). The range contains no interleaved unrelated commits; Take is ownership provenance, not implementation. No implementation correction or new follow-up plan is needed.

Shared pure interpretation, pinned projection, installed startup guards, current-home discovery, historical completion validation and guarded per-consumer writes retain distinct responsibilities. Generic landing and backlog completion do not infer fulfillment. Review considered untouched callers and the aggregate suite: real CLI/Git/installed/start and browser journeys retain integration proof, while state variations use command boundaries. No unsupported consolidation or full-suite result is claimed. ADRs 0001/0002/0004/0005/0006 and the North Star remain aligned; no human-owned architectural decision changed.

Process review is enabled by the project setting. Coordinator tool results and targeted agent handoffs support occurrences under existing ODF-150, DD-200 and DD-201; no new codes or process implementation were created. Internal sub-agent reasoning/history is unavailable, limiting cost and cause inferences. DearDough grew from 919 to 943 physical lines, below its 1,000-line ceiling; its existing 500-line threshold requires a size warning. Product advice is reasoned no-change: preserve queue priorities, including the separately queued dashboard-owned CI story; no extra dependency view, scheduler or collaboration scope is proposed.

Review completed while CI remained pending on the retained story branch at `ce8b9df`, mailbox `/tmp/dough-ci-501/watch-cWrqJu`. Live Codex notification coverage is unavailable; final completion must supply its own verdict and shutdown receipt. This retrospective does not claim integration, CI success, native-agent reasoning, or cleanup.

## CI repair at completion

Completion of published `d306765` returned `observation_unavailable` and retained shutdown for an unread owned failure on `ce8b9df`, run `37003387678`/attempt 1, job `110825968667`. Its log locates `responsive-session-access.spec.ts:68`: direct focus/Enter ran before execution was enabled by canonical reads. A held initial canonical response reproduced the dialog absence. The repair observes enabled execution first; it preserves the shared visibility-only fixture needed by unavailable-evidence tests.

The selected proof exposed a second test prerequisite: native dialog focus return had been observed before the canceled refinement component detached. The repair observes that named dialog's removal, including hidden dialogs, before checking returned focus. Single summary focus and Tab/Shift+Tab/Space observations remain. Production guards and focus behavior are unchanged. Terminal exit 0 with pinned PATH: `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/responsive-session-access.spec.ts dashboard/tests/responsive-session-start.spec.ts dashboard/tests/responsive-session-start-codex.spec.ts dashboard/tests/responsive-session-recovery-reads.spec.ts dashboard/tests/story-dependencies.spec.ts dashboard/tests/agent-launch-start-dependencies.spec.ts --workers=2`.

The completion-record publication's SSH fetch stalled after remote acceptance; the installed resume operation with a fresh bounded SSH connection confirmed `d306765` already published, push count 0. Registration was recovered on the retained mailbox. Its exact handled failure sequence was durably acknowledged through the installed export, without discarding unseen evidence. Retrospective conclusions affected by the test repair were resumed: no production correction or product-priority change is indicated; aggregate proof now includes the responsive keyboard caller and settled dialog prerequisite. Final CI/shutdown remain the next obligation.

Independent repair review: none — already clean, no edits or repeated tests; accepted six-file proof stayed applicable. `npm run format` and `git diff --check` passed. The original execution-complete record remains authoritative; this repair changes test prerequisites and evidence only.
