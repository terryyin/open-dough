# Composable lightweight session options

**Identity:** SEED-066#composable-lightweight-session-options
**Source:** [refined story](../../seeds/SEED-066-composable-lightweight-session-options.md#composable-lightweight-session-options)
**Authority:** Planning only. No Take, implementation, commit, or publication.
**Preparation:** Established workspace `/Users/terryyin/git/open-dough/.worktrees/choose-workspace-and-automatic-landing-independe`, branch `codex/choose-workspace-and-automatic-landing-independe`, remote `origin`, trunk `main`, agent `ebacky-chan`, published assignment `289071c542840f7cfec607b2167512602b6e78bf`, integration checkout `/Users/terryyin/git/open-dough`.

## Goal and scope

Let developers explicitly select one-shot refinement or execution, choose an
isolated or default checkout independently, and choose review or automatic
landing independently. One-shot defaults to isolation and review. Refinement
publishes preparation facts without Taking or completing the story; execution
retains applicable closure, escalation, and CI obligations.

Dashboard launch warns about any uncommitted change in the default checkout.
Confirmation permits including those changes in the result and committing all
checkout content; it does not select auto-land. A direct skill invocation gains
no clean-main prerequisite or dashboard confirmation requirement. Normal Git
operation and publication safeguards still apply.

Unattached Start session is the [next story](../../seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-options), not a slice here. This story delivers a coherent shared model usable by that later story without implementing ad hoc controls now. No new host, checkout registry, publisher queue, timing SLA, bulk task selector, or speculative plugin framework.

## Upfront domain and architecture design

### Domain model

| Concept | Values / meaning | Owning representation |
| --- | --- | --- |
| Workflow | Refinement or execution here; determines substantive authority and result obligations | Existing workflow table and installed workflow entry points |
| Work identity | Stable queued-story identity, optional for supported contextual execution | Existing backlog identity and ownership readers |
| Tracking | Ordinary assignment lifecycle or explicitly selected one-shot | Shared session-policy value, consumed by workflow start; not inferred from location |
| Workspace selection | Isolated owned checkout or established default checkout on resolved trunk | Shared session-policy value; resolved workspace contains actual path, branch, base, creation provenance |
| Landing policy | Review or automatic for one-shot | Shared session-policy value; default review; no copy in host code |
| Existing-change confirmation | Dashboard acknowledgment permitting inclusion of observed uncommitted content | Transient launch request/preflight evidence; never story state or landing policy |
| Established session context | Workflow, tracking, resolved workspace, remote/target, landing policy, and any actual assignment | Start receipt/handoff; one context reused through retries and native launch |
| Verified result | Retained checkout content and applicable proof/decision evidence | Workflow's existing result handling; no new global result registry |
| Publication receipt | Accepted candidate SHA and actual remote target | Existing publication protocol, distinct from local refresh/CI/cleanup |

The common rule is composition of independent choices followed by workflow-owned
eligibility and completion. Do not create a separate recognizer/handler for each
of four combinations or each host. Confirmation changes which existing content
may be included; landing policy determines the review stop. Verification covers
the combined result before automatic landing. Existing content is not discarded,
selectively hidden, or given a false passed-verification claim.

Use `--one-shot`, `--default-main`, and `--auto-land` as the direct invocation
contract. Absence of the last two means isolation and review on a one-shot
request. These flags are orthogonal; neither of the latter selects tracking.
Ordinary tracked requests retain their existing increment publication lifecycle;
this story promises the location/disposition combinations for one-shot work.
Do not reject a naturally supported ordinary combination solely because it was
not illustrated here; unsupported intent must be explained rather than ignored.
Established assigned starts preserve their context, including host and workspace.

### PFE decision and responsibility mapping

| Existing solution and evidence | Decision for this story |
| --- | --- |
| `execution-start-operation.mjs`, `execution-start-source.mjs`, `workspace-publication-select.mjs`: one-shot startup selects workspace without a claim; preparation already imports the selector | Change and modularize the shared startup/workspace responsibility. Add a small pure session-policy normalizer under the execute-plan runtime, reused by preparation and dashboard. Do not route refinement through execution admission/closure. |
| `execution-start-request.mjs`: currently requires push authorization and separate integration/workspace paths even for one-shot | Separate permission to work from permission to publish. A review-only start needs workspace/task authority, not advance push authority. A default-checkout selection is a legitimate workspace role, not a fake owned worktree. |
| `one-shot-ownership.mjs`: `requireUnheld`, `requireOneShotStart`, `queuedOwnershipGuard`; execution delivery and resume consume the latter | Reuse ownership meanings. Refinement must respect holders and queue membership but must be able to repair a not-ready record; keep execution readiness constraints workflow-specific. Apply the ownership guard at publication for either result. |
| `preparation-assignment-start.mjs`, `preparation-assignment-trunk.mjs`: current start announces a profile; retained assignments already continue | Add an unassigned lightweight preparation path sharing workspace establishment. Preserve existing assigned start/release; never invent an agent field or announce merely to format a lightweight handoff. |
| `publish-the-candidate.md`, managed delivery/resume, Dough Land and retirement | Reuse one remote reconciliation/containment/recovery contract. Extend the appropriate caller for explicit automatic landing; do not add a dashboard publisher. Preserve execution observer ownership and preparation's lack of an execution observer. |
| `commandOptions.ts`, installed refinement options, `launchOptions.ts`: offer and validate selected flags against the target installation | Reuse option validation, extend offers with the shared session meanings. Common session choices have one authoritative definition; per-workflow offers reference/compose it with refinement actions, not copied defaults or flag logic. |
| `launchStart.ts`, `startWorkflows.ts`, `startStore.ts`, `launchRun.ts`, host input builders | Extend the current start/context and write-ahead recovery model. Add an unassigned established result discriminant; do not label every established workspace Taken/Preparing. Host adapters only translate actual context. |
| `LaunchDialog`, `LaunchOptions`, `useLaunchDialogLauncher`, existing launch CSS | Reuse the semantic dialog and focus lifecycle; rearrange its information hierarchy and compose domain-specific field groups. No second refinement/execution dialog or modal framework. |

The pure shared module must have no filesystem/Node dependency when imported by
the browser, following the existing shared agent-profile reader pattern. Installed
runtime helpers consume the same defaults and flag mapping; dashboard TypeScript
schemas validate transport without becoming another policy engine. Keep policy
values in the semantic request, record, and established handoff; render command
flags only at invocation boundaries. Avoid storing both flags and a competing
independently mutable normalized policy. Workflow-specific options remain ordered
through the existing definition logic.

If new cross-skill imports are added, declare/include their installed payload
dependencies and prove real installed execution. Existing sibling imports show
reuse is feasible, not that arbitrary new files are automatically installed.

### Launch and result journey

1. The dialog presents workflow, instruction, host/model, tracking, location,
   landing, and optional refinement actions. Only supported installed options
   are offered. A retained start shows its immutable established facts.
2. Server admission validates origin, project, host/model and installed policy
   capability. Preflight resolves actual default checkout when selected and
   inspects tracked, staged, deleted, and untracked changes using Git status.
3. Unconfirmed changes return a warning before starting a workflow, native host,
   assignment publication, or workspace mutation. Confirm resubmits the same
   intent with acknowledgment; Cancel returns to the editable dialog.
   Recheck at launch. New/changed observed content requires a current warning,
   using a small local fingerprint, not a durable confirmation service.
4. Workflow start establishes the selected workspace and applicable assignment
   facts once. Isolated starts use fetched remote history. Default-checkout
   starts preserve its actual HEAD/index/worktree, even when dirty or locally
   ahead; fetching must not reset or fast-forward over its content. Remote
   source checks do not pretend local content is published.
5. Persist/reuse actual context through existing start and launch records; native
   input carries it. A retry resumes the same intent/context instead of silently
   applying newly chosen flags to a retained start. Existing records remain
   readable; missing new fields do not fabricate a published assignment.
6. Workflow produces a verified result. With review, stop and report the retained
   path/branch/proof and pending issues. Do not retire it or push. Keep queued
   execution closure changes local with its result until authorized landing;
   report that remote membership still differs from the local closure draft.
7. With auto-land selected separately, compose applicable closure/release and
   land the authorized checkout content after verification and resolved decisions.
   A refinement result does not complete the story. Publication rechecks ownership
   and uses the existing bounded non-force recovery. Lost push response resumes
   the retained candidate, not a new commit. Checkout role determines retirement:
   default checkout remains; only eligible owned worktrees are removed.

Changing a warning confirmation never turns review into automatic landing.
Changing a host must refresh its installed capability/option offer and clear
incompatible model selection as today. A missing shared-policy capability is
reported before native launch; no silently degraded location or landing policy.

### Accepted decisions and temporary direction

Follow ADR 0001 domain language, ADR 0002 direct domain mapping/cohesion and
continuous integration for ordinary tracked work, ADR 0005 native evidence,
ADR 0006 one source/runtime audience, and the repository's `AGENTS.md` authoring
rules. References are [in the seed](../../seeds/SEED-066-composable-lightweight-session-options.md#shared-architecture-direction).
Edit `src/skills/`; do not modify managed installed copies. No Accepted ADR
conflict was found for this bounded one-shot policy change. Proposed ADRs 0007–0009
supply no authority. Use [.planning/NORTH-STAR.md](../../NORTH-STAR.md#composable-session-policy-and-workflow-owned-start) and the [UX/UI direction](../../../docs/dashboard-ux-ui-north-star.md#launch-dialog-information-hierarchy).

## Upfront UX/UI design

[Interactive design study](DIALOG.html) is a planning artifact, not the product
or evidence that native launch works. It exercises the proposed hierarchy and
warning distinction. It uses a one-shot example; ordinary tracking preserves
its workflow's publication semantics. The implementation uses existing app
colors/typography and semantic controls, not the mockup's standalone style sheet.

```text
Start refinement                              [close]
Story title • identity

Instruction (optional)
[ What should the agent focus on?                    ]

Host [Claude Code v]       Model [Default v]

Session
Tracking      [Standard] [One-shot]
              One-shot creates no published assignment.
Workspace     [Isolated workspace] [Default main]
After checks  [Wait for review]    [Automatically land]
              Automatically land the verified checkout result.

▸ Refinement options                 Explore, UX/UI (2)
▸ Command details                    invocation + actual effects

Isolated workspace · One-shot · Wait for review
                                 [Cancel] [Start refinement]
```

- Story identity and concise purpose replace the current dense explanation.
  Instruction stays primary and initially focused. Put host/model on one row
  when space permits, stacking in reading order at narrow widths.
- Session choices remain visible: review and publication consequences must not
  be hidden in an advanced accordion. Use labeled fieldsets/radios for exclusive
  choices, not switches that obscure their counterpart. Standard tracking is
  the ordinary no-one-shot selection; show its actual workflow effects rather
  than claiming it waits for review. One-shot defaults to isolation/review.
- Refinement actions/focuses go in a collapsed disclosure with selected count
  and readable selected names in its summary. Opening preserves current option
  groups and semantics. Selections never disappear silently when collapsed.
- Move raw flags, full command, established-start metadata, and longer setup
  explanations into Command details. An always-visible plain-language summary
  names location, tracking/assignment effect, and review/landing intent.
- Use a restrained primary Start button and secondary Cancel. Keep the action
  row reachable with a scrollable dialog body, capped to the viewport; no page
  horizontal scrolling at 320 CSS pixels or 200% zoom. Long titles and paths wrap.
- Warning appears in the same dialog as a separate confirmation state after
  Start, keeping the developer's choices and text. Title: **Existing changes in
  default main**. List/count changed paths without reading or exposing file
  content. Copy: **Continuing includes these changes in this session's result.
  When committed, all checkout changes are committed together.** Show the
  actual landing selection below: **Wait for review remains selected**, or
  **Automatically land remains selected; verified changes may land without
  another review.** Actions: **Back** and **Continue with existing changes**.
  No prechecked confirmation, no auto-land toggle change, no second nested modal.
- Focus the warning heading on entry, preserve focus/values on Back, disable
  repeat submit while pending, announce errors politely, and restore launcher
  focus on cancellation/refusal. Start/confirmation keyboard behavior and visual
  reading order agree. Existing dismissal cannot cancel an already submitted
  launch; show its retained/uncertain outcome truthfully.
- Treat mockup dimensions as hypotheses. Slice 6 owns an actual visual review
  of long titles, maximal existing refinement selections, both hosts, kept-start
  state, mobile width, and zoom. Fix crowded/hidden essential controls before
  accepting its UX proof. Slice 7 covers the warning state and changing offers.

## Decisive premises and observations

Observed at workspace HEAD `289071c542840f7cfec607b2167512602b6e78bf` with planning-only
edits. These observations are baselines, not proof of the proposed features.

| Premise / consumer | Literal observation | Result and consequence |
| --- | --- | --- |
| Current one-shot prepares without a claim and delivery/queued closure/recovery are reusable (slices 1, 4, 5) | `node --test src/skills/dough-execute-plan/scripts/one-shot.test.mjs src/skills/dough-execute-plan/scripts/one-shot-queued.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-announce.test.mjs` | Passed 13 tests. Assertions inspect bare-origin refs/history, closure/sibling content, profiles, lost-response duplicate prevention, and assigned preparation continuation. They explicitly deliver; they do not prove a native agent's default disposition. |
| Browser selection reaches native input, selected-host capability refusal occurs before native calls, and current preparation uses real installed startup (slices 6–7) | `env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-options.spec.ts dashboard/tests/agent-launch-preparation-start.spec.ts dashboard/tests/agent-launch-codex-options.spec.ts --workers=2` | Exit 0: 9 focused tests passed. Real fixture Git and installed start; fake Claude and Codex protocol boundaries. These tests do not prove native agent compliance. Initial run failed before observation because the worktree lacked `node_modules/.bin/vite`; matching package locks allowed a temporary link to existing dependencies, then rerun passed. |
| Refinement must accept not-ready preparation, unlike execution (slice 2) | Read `execution-start-request.mjs`, `execution-start-source.mjs`, `one-shot-ownership.mjs`, and `preparation-assignment-trunk.mjs`; `rg -n 'selectOwnedWorkspace|requireOneShotStart|queuedOwnershipGuard' src tests dashboard --glob '*.mjs' --glob '*.ts'` | Current selector is shared; execution guard adds not-ready refusal. Its 18 relevant call-site hits include delivery/resume and direct fixture consumers. Preserve execution guard purpose; don't reuse it unchanged for refinement. |
| Default-checkout start must not run isolated refresh/create behavior (slice 4) | Read `workspace-publication-select.mjs`, `execution-start-request.mjs`, and `dough-land/SKILL.md` | Current startup refuses coincident integration/workspace and only continues a reused workspace after safe refresh. Land already handles the default checkout. Add a role-aware selection path preserving local content rather than weakening isolated-workspace checks. |
| Dialog crowding has a concrete structural cause (slice 6) | Read `LaunchDialog.tsx`, `LaunchOptions.tsx`, `StartLaunch.tsx`, `agent-launch.css`; focused Playwright option journey above | Current 32rem modal renders all option labels/flags/summaries in the main form, host/model separated, long startup prose above. This supports disclosure + grouping; no measured usability-speed claim. |
| New native review/refinement policy will be followed (slices 3, 8) | Inspect `tests/git-publication-native.sh`, `tests/support/git-publication-native-one-shot.sh`, and existing fixture/assessor callers | Existing harness supports actual installed skill/native-session/real-Git observation. Existing one-shot cases expect automatic publication and must change; archived results don't settle the new behavior. Only authenticated/paid native observations settle compliance: explicitly bounded early probe in slice 3, later affected-case acceptance in slice 8. No native pass claimed now. |
| Plan numbering and workspace | `git worktree list`; `git branch --show-current`; `git log --all --format= --name-only -- .planning/slice-plans` with numeric maximum extraction | Established workspace/branch match. No active plan directory exists; canonical root is explicitly defined by AGENTS.md. Highest allocated number recoverable from Git is 190; new number 191 was checked unused immediately before creation. |

## Promise and proof ownership

Future test paths/cases below are explicitly to be authored; existing baseline
commands are separately identified above. Every native result records installed
candidate, host/version, task prompt, setup, decisive Git/stream observations,
and limitations. Exit zero or self-report is insufficient.

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| One-shot isolation/review default; no advance push requirement; retained verified execution | 1 | Real CLI fixture, remote refs unchanged after finish, result recoverable, no profile/Take; later explicit land publishes it |
| Lightweight refinement, truthful state, queued retention, no new assignment; not-ready repair | 2 | Installed preparation CLI/recorder fixture, actual seed block and queue before/after, bare-origin refs/profiles |
| Native adoption of review and refinement meaning | 3 | Fresh installed native sessions on an isolated local origin; raw stream + Git observations |
| Default checkout, dirty direct work, no temporary branch or destructive refresh | 4 | Real Git fixture with staged/unstaged/untracked/deleted files and local commits; role/path/branch and content assertions |
| Both auto-land combinations; verified combined content; blockers and ownership changes; closure/resume/CI/retirement | 5 | Real publication fixture, exact accepted SHA/contents, no push on blocker, unchanged competing owner, lost-response resume, CI-bound receipt and role-aware cleanup |
| Scannable dialog, existing selections preserved, accessible/narrow/zoom behavior | 6 | Browser journey and actual visual/keyboard review; existing launch behavior regressions |
| Dashboard four combinations, existing-content confirmation independent of landing, same context in both hosts, retry and missing capability | 7 | Browser → loopback → installed runtime → native adapter fixture; dirty Cancel/Confirm, unchanged auto-land choice, origin and local record assertions |
| Affected native behavior on all three supported skill hosts; deterministic harness rejects false positives | 8 | Representative fresh native cases or justified candidate-matching reuse; changed policies cannot reuse old auto-publication proofs |

## Ordered slices

No numeric time target or hard limit is supplied. Each hypothesis includes edits,
focused proof and slice-local cleanup. Stop on ownership ambiguity or scope/ADR
conflict; a failed premise probe stops dependent slices and revises this same
plan. Do not invent a timeout policy or start another native run without changed
evidence. Each completed slice must leave its applicable proof green.

### 1. One-shot execution retains its verified result for review
Type: Behavior
Status: done
Accepted proof: `node --test --test-timeout=300000 src/skills/dough-execute-plan/scripts/one-shot.test.mjs src/skills/dough-execute-plan/scripts/one-shot-start-refusal.test.mjs src/skills/dough-execute-plan/scripts/one-shot-queued.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-announce.test.mjs src/skills/dough-execute-plan/scripts/session-policy.test.mjs src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs src/skills/dough-execute-plan/scripts/one-shot-escalation*.test.mjs`
(36 pass); `/opt/homebrew/bin/bash tests/payload-declaration-links.sh`; credential-free
`PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native-one-shot.sh`.
Learnings: shared normalizer is `scripts/session-policy.mjs` (`sessionPolicy`,
`sessionPolicyChoices`, `sessionPolicyToggles`), installed via `install.sh`.
`--default-main`/`--auto-land` are refused with `invalid-request` until slices 4–5.
One-shot admission escalation now needs push authority explicitly. The native
one-shot prompts still grant trunk publication and the substitute still lands
immediately; slices 3 and 8 own changing them. Native harness shells need
Homebrew bash on this machine.
Proof: Extend `one-shot.test.mjs` and guidance/installed-run assertions for finish
without automatic push, retained workspace, and later explicit landing. Add the
pure policy contract tests as part of this behavior.

Behavior: An explicit eligible one-shot request with no landing option runs in
isolation, publishes no claim, verifies its result, and stops for review without
requiring advance push authority. Explicit later landing uses the retained result.

Introduce the smallest common policy normalization here; keep standard assigned
startup/publication unchanged. Amend source guidance, runtime request validation,
retention and queued-closure timing coherently. Existing explicit delivery tests
remain useful; never reinterpret them as proof of automatic finish. Cover a
queued no-change conclusion too: retain any closure draft for review, rather
than publishing it merely because no product edits were needed.

### 2. One-shot refinement retains preparation without an assignment
Type: Behavior
Status: done
Accepted proof: `node --test --test-timeout=600000 src/skills/dough-story-refinement/scripts/*.test.mjs src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs src/skills/dough-execute-plan/scripts/session-policy.test.mjs src/skills/dough-execute-plan/scripts/one-shot-start-refusal.test.mjs`
(72 pass, including `one-shot-refinement.test.mjs` on an installed payload);
`tests/payload-declaration-links.sh`, `tests/install-public-payload.sh`,
`tests/install.sh` (Homebrew bash); Playwright
`dashboard/tests/agent-launch-preparation-start.spec.ts dashboard/tests/agent-launch-preparation-resume.spec.ts`.
Learnings: `preparation-assignment.mjs start --one-shot` routes to
`preparation-one-shot-start.mjs`; it uses `requireUnheld` (not
`requireOneShotStart`) so not-ready input can be repaired, checks the
workspace's own assignment first (`workspace-assigned`), and shares
`preparationRepository`/`selectAtFetchedTrunk` with the assigned start. Request
validation lives in `preparation-assignment-request.mjs`. No ownership recheck
happens yet when a kept one-shot refinement lands (slice 5). A rerun of
`start --one-shot` on a retained workspace with a result commit stops with
`workspace-selection-failed`; guidance continues in that workspace instead.
`install.sh` is near the 250-line limit because of its installed-file list.
Proof: New `one-shot-refinement.test.mjs` drives installed CLI + actual recorder
against local Git; test refined/unselected and recorded not-ready input, same
queue membership, no Preparing/Take/push, and preserved assigned-session resume.

Behavior: One-shot refinement establishes its workspace, refines the queued
story, records real preparation facts, and leaves the result for review. It can
repair not-ready input while refusing a competing holder. Reuse policy/workspace
and ownership readers; preparation retains its own lifecycle.

### 3. Observe native adoption before broadening the policy
Type: Behavior
Status: done
Native probe (manual, developer-triggered, Claude Code, candidate `d6301c9e`):
`publication/one-shot-review` and `preparation/one-shot-refinement` both
assessed `pass` / FRESH PROOF from real local-origin and workspace state (remote
unchanged, zero ref updates, workspace retained with one result commit, report
names the workspace; refinement recorded refined/unselected/not-ready, still
queued, sibling kept). Both responses stopped for review and named the later
landing request. Learning: the review agent briefly ran the fixture's
`scripts/ci-check.mjs` (a CI hook stub that waits for input) as a local check;
harmless here, worth watching in slice 8.
Credential-free proof (accepted): with `PATH=/opt/homebrew/bin:$PATH`,
`bash tests/git-publication-native-one-shot.sh` (substitutes pass; state and
whole-run pushing counterexamples rejected), `bash tests/git-publication-native.sh`,
`bash tests/native-stream-replay.sh`, `bash tests/native-assessor-counterexample-guard.sh`.
Pending manual probe: `PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native claude --case publication/one-shot-review --results-dir <DIR>`
and `... --case preparation/one-shot-refinement ...`. The existing
`one-shot-result`/`one-shot-queued` prompts now explicitly ask to land the
result; their archived native results no longer match and are not proof.
Proof: Extend the existing native harness with `publication/one-shot-review` and
`preparation/one-shot-refinement`. Use actual installed guidance in fresh sessions;
no expected answer embedded in task prompts. Compare raw commands/stream and
real local-origin/checkout facts with the stated outcomes.

Behavior: A representative native host follows the changed review default and
lightweight-refinement contract, creating recoverable results without publishing
an assignment or accidentally closing the refinement story.

This is an early credentialed/paid feasibility probe, not a planning-time run.
Native execution requires its explicit manual triggering authority. If unavailable,
retain this slice pending and stop dependent policy rollout; don't count mocks as
acceptance. Failure stops slices 4–8 until guidance/start/handoff is corrected.
All-host breadth is owned by slice 8; one host's probe cannot prove another.

### 4. Direct one-shot work uses the default checkout without a clean-main gate
Type: Behavior
Status: done
Accepted proof: `node --test --test-timeout=600000 src/skills/dough-execute-plan/scripts/default-checkout-session*.test.mjs src/skills/dough-execute-plan/scripts/one-shot*.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication*.test.mjs src/skills/dough-story-refinement/scripts/*.test.mjs src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/session-policy.test.mjs`
(202 pass); payload links, credential-free native one-shot suite, native evidence identity.
Learnings: contract is `--one-shot --default-main --workspace <default checkout>`
(`--branch` must equal target; `--integration`/`--repository` must name the same
checkout). `defaultCheckoutRequest`/`selectDefaultCheckout` in
`workspace-publication-select.mjs` take the checkout as is (no refresh, worktree,
branch, or push); holder checks read fetched trunk; wrong branch, ongoing Git
operation, or non-toplevel refuse. Receipt: `role: "default-checkout"`,
`startingRevision` = actual HEAD, `fetched`, `created: false`, no maintenance.
Tracked `--default-main` is refused with an explanation. Landing from the
default checkout is guidance only so far: slice 5 must prove it (merge-base
base, `--one-shot-identity`). Escalation `--carry` from the default checkout is
not code-blocked. The one-shot guidance edits make the slice 3 native evidence
stale; slice 8 re-accepts. Slice 7 must consume the new receipt shape.
Proof: New `default-checkout-session.test.mjs` exercises actual start entry points
for both workflows with a real default checkout containing existing changes and
unpublished commits. Assert path/trunk role, unchanged old content, no extra
worktree/branch, no push, retained result, and ordinary isolated regressions.

Behavior: Selecting default main directs the request there while retaining the
review default. The skill does not import a dashboard warning or require a clean
checkout. Resolve branch/target and existing Git-operation safeguards; do not
run the isolated selector's fast-forward eligibility on this role. Put any
necessary shared selector modularization inside this slice, not a preparatory
layer slice with no owned outcome.

### 5. Explicit auto-land publishes the verified checkout result
Type: Behavior
Status: done
Accepted proof: `node --test --test-timeout=600000 src/skills/dough-execute-plan/scripts/default-checkout-session*.test.mjs src/skills/dough-execute-plan/scripts/one-shot*.test.mjs src/skills/dough-execute-plan/scripts/lightweight-auto-land*.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication*.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-delivery*.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery*.test.mjs src/skills/dough-story-refinement/scripts/*.test.mjs src/skills/dough-land/scripts/*.test.mjs src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/session-policy.test.mjs`
(255 pass; refactor rerun of affected subset 117 pass); install/payload and
credential-free native suites.
Learnings: `--one-shot --auto-land` requires `--push-authorized`
(`needsPublicationAuthority`); prepared receipts carry `landing: "auto-land"`
only when selected (`withSelectedLanding`), which slice 7 reads. Refinement
landing (keep or auto-land) runs the new read-only
`preparation-assignment.mjs recheck` (`queuedOwnershipGuard`) before each push.
Managed `deliver` is observed only with a coordinator session (`--session-json`
or Claude session id). Retirement after the CI gate is guidance-enforced only.
Native one-shot evidence is stale until slice 8.
Proof: New `lightweight-auto-land.test.mjs`, extended queued/publication-resume
fixtures, and preparation publication cases cover isolation/default checkout,
all authorized content, blocker stops, holder changes, lost push response,
closure/siblings, observer coverage, and checkout-specific retirement.

Behavior: Auto-land selected independently permits landing after verification
and resolved decisions; review still waits. On confirmed dirty default-checkout
work, the combined checkout content is eligible for commit, but confirmation
alone never activates this policy. Preserve normal publication authority checks.

Share disposition/publication rules; workflow callers compose their own metadata
and completion. A refinement auto-land cannot call execution completion. A queued
execution's closure is included with its verified result. Retain state when
publication or verification stops; never claim CI or refresh completed merely
because remote acceptance is confirmed.

### 6. Launch dialogs remain scannable as choices grow
Type: Behavior
Status: done
Accepted proof: `env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch*.spec.ts dashboard/tests/launch-workspace.spec.ts dashboard/tests/session-sidebar*.spec.ts dashboard/tests/preparation-legend.spec.ts dashboard/tests/project-keyboard-navigation*.spec.ts dashboard/tests/story-readiness*.spec.ts dashboard/tests/agent-terminal*.spec.ts dashboard/tests/accessible-overview*.spec.ts --workers=2`
(402 pass, including `agent-launch-dialog-layout.spec.ts` at desktop, 320×640 and
640×450@2x); `npm run typecheck:dashboard`. Visual review (coordinator-inspected
screenshots, both hosts, kept start, long title, all 8 options) found and fixed a
collapsing instruction field and a truncated Model select (dialog now 40rem).
Learnings: `LaunchDialog` takes `subject`, `effects` (footer line, Start's
`aria-describedby`), `details` (Command details) and `optionsLabel`;
`LaunchOptions` owns its disclosure; `LaunchHostModel.tsx`,
`launchDialogLauncher.ts`, `launch-dialog.css` split out. Slice 7 adds session
fields and the warning state through these. The command hint no longer uses
`aria-live`; selections are announced through the summary and checkboxes. The
UX north-star launch-dialog wording ("current 32rem dialog") is now outdated
and belongs to wrap-up assimilation.
Proof: New `agent-launch-dialog-layout.spec.ts`, existing options/model/cancel
journeys, keyboard focus assertions, and visual review at desktop, 320px and
200% zoom with long story/path and maximal existing refinement selections.

Behavior: Developers can read purpose, enter instruction, choose host/model,
and find existing refinement options without a long undifferentiated form.
Disclosure summaries expose selections; essential launch effects remain visible.

Implement the UX design above within the existing dialog. Keep current launch
contracts working; newly designed session fields become functional in slice 7.
This slice delivers visible usability value without shipping inert controls or
changing publication behavior. Visual review is bounded to the owned fixture
and is required by this plan, not a proactive whole-product manual test.

### 7. Dashboard launches the selected policy with independent dirty confirmation
Type: Behavior
Status: done
Accepted proof: `env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-session-options.spec.ts dashboard/tests/agent-launch-session-kept-start.spec.ts dashboard/tests/agent-launch-session-refusal.spec.ts dashboard/tests/agent-launch-session-choices.spec.ts dashboard/tests/agent-launch-default-checkout-warning.spec.ts dashboard/tests/agent-launch-dialog-layout.spec.ts --workers=2`
(21 pass) and the broad launch regression plus `session-alerts*` (447 pass);
`npm run typecheck:dashboard`; `npm run build:dashboard`; skill script tests
(121 pass). Coordinator inspected warning and 320px one-shot screenshots.
Learnings: records carry a semantic `policy`; flags render only at command
boundaries through `sessionPolicyFlags`. `server/defaultCheckoutChanges.ts`
fingerprints HEAD, porcelain status, and path size/times (paths only).
`server/launchSessionPolicy.ts` admits one-shot only when the host's
installation ships `session-policy.mjs`. One-shot established contexts carry no
agent or `publishedSha`; installed formatters `established-start.mjs` and
`established-preparation.mjs` now write a one-shot block, which slice 8 must
re-accept natively. Start/session docs moved to `dashboard/LAUNCH-START.md`.
`dashboard/README.md` remains over 250 lines (pre-existing). Not separately
tested: dismissing a dialog while a confirmed launch is in flight.
Proof: New `agent-launch-session-options.spec.ts` and
`agent-launch-default-checkout-warning.spec.ts` use real installed startup +
local bare origin and existing fake Claude/Codex boundaries. Test all four
combinations, selected policy in native input/context/records, Cancel/Back/
Confirm, changed content, unchanged landing selection, kept start, and unavailable
installed capability. Reuse existing option boundary/refusal/recovery journeys.

Behavior: A story dialog's explicit one-shot/location/landing choices reach its
session through one established context. Default-checkout changes warn before
start; confirming includes them without changing landing intent. Missing or
stale offers fail truthfully before a native call. Existing assigned/kept starts
are continued rather than silently changed or duplicated.

Keep preflight observation/acknowledgment at the dashboard boundary. Reuse the
shared installed-policy capability, current records and native adapters rather
than a parallel launch route or publisher. Ad hoc controls remain deferred.

### 8. Accept the affected guidance across supported native hosts
Type: Behavior
Status: blocked — harness cases authored; awaiting developer-triggered paid native runs on Claude Code, Codex and Cursor
Credential-free proof (accepted): with `PATH=/opt/homebrew/bin:$PATH`,
`bash tests/git-publication-native-one-shot.sh` (10 one-shot journeys through
substitutes with state counterexamples rejected), `bash tests/git-publication-native.sh`,
`bash tests/native-stream-replay.sh`, `bash tests/native-assessor-counterexample-guard.sh`,
`bash tests/native-evidence-identity.sh`, `bash tests/native-case-selection.sh`.
New cases: `publication/one-shot-default-main`, `publication/one-shot-auto-land`,
`publication/one-shot-auto-land-blocked` (rival Take applied on first fetch after
the result commit through the fixture's upload-pack wrapper),
`publication/one-shot-established` (dashboard-formatted one-shot block),
`preparation/one-shot-refinement-auto-land`. Slices 4–7 changed one-shot
guidance and formatters, so the slice 3 Claude evidence is stale and must be
re-observed with the rest.
Proof: Extend the credential-free harness/assessors and run representative new
native cases across Claude Code, Codex and Cursor under explicit manual native
run authority. Reuse matching unaffected evidence only with its candidate and
boundary justification. Record pending native evidence separately from functional
implementation completion; do not release affected behavior while proof is missing.

Behavior: Each supported native host correctly retains review-default work,
refines without assigning/completing, follows explicit default-checkout work
without a clean-main gate, and obeys auto-land/blocker/lifecycle semantics.
Representative combinations may share a setup; do not require a full Cartesian
matrix. Existing archived automatic-publication runs do not prove changed policy.

Update maintained launch/skill docs and acceptance expectations. If native runs
are unavailable after functional completion, leave this slice pending; retain
required acceptance input for a separately selected acceptance story rather than
silently closing or inventing passed evidence.

## Verification, delivery and plan review

Existing observation commands are above. New proof commands to author alongside
slices include `node --test <new-runtime-test>` and targeted
`npx playwright test --config dashboard/playwright.config.ts <new-dashboard-spec>`.
Use existing `tests/git-publication-native.sh --native <host> --case <new-case>`
for explicitly selected native runs after those cases exist. Deterministic
substitute hosts remain separate from native acceptance.

Run `npm run typecheck:dashboard` for changed shared/dashboard contracts and
focused browser tests. Because new installed sibling imports affect multiple
consumers, run applicable real payload installation/update and link checks,
including `bash tests/payload-declaration-links.sh` and the affected installed
execution fixture, rather than accepting source-only tests. Do not change release
identity or promote/install this repository's managed guidance during planning.
AGENTS.md requires representative skill behavior review before readiness of
implemented guidance; walk refinement and execution context/outcome/conflict
stops. Execution retains its required post-change refactor and asynchronous CI
repair lifecycle. Hosted CI jobs alone do not make every test a local gate.

Cumulative design review: retain these eight boundaries. Each delivers an outcome
or bounded learning with one primary proof loop; shared policy is introduced with
its first consumer rather than in a speculative framework slice. Refinement and
execution are separate outcomes with distinct lifecycle proof. Default checkout
and auto-land extend the same model rather than adding combination handlers.
Dialog reorganization has usable value before new choices; enabling choices and
warning are kept together because default-checkout launch needs both. The early
probe bounds the new native premise before broad work; final acceptance covers
host-specific behavior after the composed solution exists.

No remaining source/domain/ADR concern was identified in this planning review.
Native compliance is intentionally unresolved until the explicit early probe,
not reported as observed. UX dimensions are design hypotheses with bounded visual
proof in slices 6–7. This plan grants no execution or publication authority.

Design-study observation: rendered `DIALOG.html` with Playwright Chromium at
900×1000 and 320×760, inspected both images, and observed no page horizontal
overflow at 320px. Simulated warning → confirmation preserved the selected
review radio. Mobile body scrolls while actions remain visible. This settles
only the study's layout/interaction; actual product keyboard, zoom, installed
offers, and launch behavior remain owned by slices 6–7.
