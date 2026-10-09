# Preparation for reviewing a merged one-shot change

Part of the [canonical executable plan](PLAN.md). Read the selected approach,
integration decisions, promise ownership and verification duties with its slices.
The [preparation observations](OBSERVATIONS.md) retain the relied-on baseline.

**Prepared:** 2026-10-08, planning only, in
`/Users/terryyin/git/open-dough/.worktrees/review-a-story-s-merged-one-shot-change`
on `codex/review-a-story-s-merged-one-shot-change`, continuing the published
Preparing assignment for `ebacky-chan`. Target: `origin/main`; integration
checkout: `/Users/terryyin/git/open-dough`. Starting revision:
`db9026fade984650bf6573d7d252d544b3c1bd97`.

## Existing solutions and selected approach

PFE followed the delivery, recording and review responsibilities across source
skills, dashboard production code, installed fixtures and their consumers.

| Responsibility | Evidence and decision |
| --- | --- |
| Identify what actually landed | **Change** the existing publication contract. `execution-increment-publication.mjs` returns accepted `receipt.sha`, target and final `suffixBase`; its normal and retry `beforePush` callbacks currently expose only candidate and attempt. `execution-increment-resume.mjs` returns the accepted SHA but loses the base. Carry the same comparison through pre-push retention, acceptance and resume; do not compute a new baseline from current trunk. |
| Report to the original launch, including before native binding | **Change** the existing launch reporting channel: `completionReporting.ts` copies the installed standalone CLI into a directory outside the workspace; admission resolves an exact accepted attempt, reservation retains write-ahead evidence, and binding imports retained facts. Add a separate landing-record operation with this identity and retry discipline. A landing receipt is independent of completion outcome, message and native Done. Do not implement another session registry or overwrite the attempt's existing start-publication receipt. |
| Persist and retain comparison objects | **Reuse** `machineJsonStore.ts`, attempt-before-record lock ordering and the existing launch documents. **Change** their typed records to carry the applied landing fact, preserving it through binding and other writers. `storyReviewMarks.ts` already pins Git objects before saving their metadata; apply that ordering to the two comparison ends with launch-specific refs. The server resolves the common repository from the established workspace while it still exists. |
| Compare two trees and read one file | **Reuse** `storyReviewFiles.ts`'s `changedFrom` for complete tree comparisons and `storyReviewSnapshot.ts`'s file diffs. **Modularize** the view only as needed: `SnapshotView` already receives a `ReviewComparison` and explicit destination tree, but requires workspace-specific snapshot and empty-state facts. Keep workspace restatement in `storyReviewComparison.ts` and live selection in `useStoryReviewComparison.ts`; expose historical context through the common view. Add historical admission to the same file-diff boundary, using the chosen run's saved repository. |
| Offer all runs without disturbing the latest-workspace rule | **Change** review availability and selection alongside `reviewWorkspaceOf`, which remains the owner of the latest live workspace. Derive retained one-shot runs from their established tracking and exact project/work identity; map captured facts to the same runs. Extend the existing panel and comparison switch rather than adding a second panel. |
| Reach a completed story | **Change** `RecentlyDone`/`DoneStoryCard` to use the same review action. Recently done currently has its own card and nests only marked-done sessions; its view also retains the full machine-record read. Supply that full read for review availability, independently of which sessions are nested, and keep published done identity/title as card context. |
| Obtain outside-in proof | **Reuse** `startOrigin.ts` (real source skills copied into host-specific installed roots, local bare origin), `oneShotLaunch.ts`, `storyReviewWorktree.ts`, real reporting CLI helpers and preview servers. Native/gh/CI provider answers supply external preconditions; the installed scripts, receiver, storage, Git, retirement and rendered review must establish the outcomes. Do not seed the landing metadata in a fixture that claims to prove capture. |

Relevant Accepted decisions are [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md)
(feature design here), [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one authoritative comparison and distinct publication/completion facts),
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
(edit `src/skills/`, keep runtime standalone, leave managed installed copies to
released updates), and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one shared runtime instruction, with project-local context).
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) and
[AGENTS.md](../../../AGENTS.md) supply proportionate skill behavior review:
walk a representative one-shot landing through invocation, required context,
accepted comparison and useful outcome. Protocol fixtures are functional
proof, not native agent acceptance. Existing host activation is unchanged;
do not commission paid native runs or claim new native evidence from these tests.

Follow the existing [North Star](../../NORTH-STAR.md) topics **Remote history
and optional local refresh**, **Agent launch as a requested assignment**,
and **Dashboard-owned CI observation and session delivery**: local evidence
does not own story state, and accepted publication is independent of refresh
and observation. No new topic or ADR is needed. Proposed ADRs are not constraints.

## Current decisions and integration boundaries

- One landing comparison is the accepted candidate and the actual base of its
  owned published suffix, with the authorized remote target. Retain that pair
  for each candidate before its push, updating it after a reconciliation.
  Reuse the reporting CLI's launch-specific retained-request directory for
  interrupted handoff; do not invent a parallel publication catalog.
- The new reporting operation verifies acceptance against the established
  launch's authorized remote/target and repository, not the caller's message.
  Validate object types, the comparison ancestry and target containment. A
  supplied path or another launch's identity cannot select a repository.
  Unknown or unconfirmed candidates are refused, leaving an actionable gap.
- Recording is a write; pin both ends before publishing their metadata. A
  historical read uses the captured repository and pair and writes no ref,
  index or checkout content. A missing repository/object is unavailable; a
  fresh clone does not silently replace the captured repository.
- Use a landing-record operation distinct from the final completion report.
  It can return a launch-only receipt before native binding without setting
  Done, renaming/stopping the host, completing the story, or starting CI.
  Completion remains the final operation after the existing finish duties.
- Normal capture precedes retirement; recording failure never reverses an
  accepted push. Retain exact retry input outside the workspace, report the
  gap, and retry only recording. No revised run comparison is inferred from
  a current HEAD, completion date, subject or moving trunk.
- Historical requests name source, identity and retained launch reference;
  file requests also carry the admitted comparison objects and literal paths.
  The boundary checks these against that run and uses the same Git diff
  reader. Keep the current workspace request and mark contracts compatible.
- The delivered [Commits comparison](../../../dashboard/STORY-REVIEW-COMMITS.md)
  shares the panel, comparison switch, admission and comparison view.
  Its Commits choice remains a workspace comparison, with its range selection
  and refresh behavior owned by `useStoryReviewComparison.ts`. Reuse that
  implementation; historical fixed pairs need no restatement or separate diff
  engine. The [dashboard CI plan](../224-dashboard-owned-ci-monitoring/PLAN.md)
  also uses launch reporting; share its channel while retaining distinct
  landing, CI and completion facts.

## Promise ownership

| Final promise / seed example | Owning slice and observable proof |
| --- | --- |
| Final base/candidate after reconciliation, several commits, default-checkout owned content; example 2 | 1: production delivery and resume contract consumed by actual tree diffs, preserving publication/CI behavior |
| Capture automatic/later explicit refinement or execution against exact launch; accepted publication independent of completion/refresh/CI; examples 1 and 7 | 2: installed handoff and reporting CLI → real acceptance verification/store/receipt, with no native Done or story mutation |
| Preserve objects for retained evidence, no arbitrary request paths, rejected candidates never labeled landed | 2: pins survive actual retirement/GC; refusal and checkout snapshots; 5 owns interrupted writes |
| File list, counts, renames, binary/text diffs and navigation use the fixed pair after retirement, restart and subsequent trunk changes; examples 1 and 5 | 3: captured-through-CLI result → rendered review and file endpoints; read-only assertions |
| Old evidence gap, missing repository/object, valid empty comparison; example 6 | 3: selecting each state gives the right explanation and no substitute files |
| All retained runs, live workspace coexistence, keyboard choice, mark exclusion, Refresh retaining selection; example 3 | 4: multi-run browser journey plus existing review/panel consumers |
| Lost push result/recording acknowledgment, real write refusal, early native binding and late writers; example 7 | 5: durable retry and binding journeys, exact pair/launch survives, push count unchanged |
| Completed execution remains reviewable without seed/plan/worktree; example 4 | 6: real queued one-shot closure → published done card → same historical comparison, including default-checkout content |

## Verification, delivery and sizing

Use the selected Node in `.node-version`, Bash 5 first on PATH and matching
locked dependencies/Chromium under [native setup](../../../tests/native-setup.md).
The preparation observations used an official checksum-verified temporary
Node 24.21.0; execution resolves its own retained prerequisites and does not
depend on that temporary path. The temporary dependency link and observation
script are removed after planning.

Run Node/shell checks through `npm test -- <owning files>` per
[tests/README.md](../../../tests/README.md). Slice 1 owns publication,
reconciliation, managed-delivery/resume, racing-suffix, one-shot and auto-land
consumers; search every caller of changed callback/receipt/resume fields and
select all affected purposes, including CLI callers. Slice 2 owns the new
capture spec, `agent-completion*.spec.ts`, `agent-launch-session-*.spec.ts`, and
reporting-input consumers found by searching `expectReportingBlock` and
`expectAdHocReportingInput` (including Cursor, preparation and ad-hoc builders).
Slice 5 owns early binding, recovery and deletion consumers as well. Extend
functional source guidance tests where their contract changes; if runtime files
or dependencies change, run `tests/payload-declaration-links.sh` and applicable
public-payload delivery checks. A prose-only conventional change uses the
representative behavior review, not a routine tool-discovery matrix.

For UI slices use the environment cleanup and production Playwright command
shape in B with the owning spec plus affected existing suites. Slices 3–4 own
`dashboard/tests/story-review*.spec.ts`, panel replacement/switching and
`side-panel-width*.spec.ts` where shared view geometry or frame contracts change.
Slice 6 owns the Recently done story/session and progressive suites, including
report/Cursor navigation when their shared card/view/focus contracts change.
Inspect whole-surface element/role/count assertions; preserve unrelated purpose
while adding the narrowly available action. Run `npm run typecheck:dashboard`
for the shared TypeScript schema/props/admission changes. These are local
integration checks justified by affected contracts. Hosted CI's full suite is
not an extra mandatory local gate, and old timeouts are not waived for an
affected consumer.

Each slice keeps its implementation, outside-in proof, documentation and
post-change cleanup together. Authorized execution follows the installed
[execute-plan workflow](../../../.agents/skills/dough-execute-plan/SKILL.md)
for independent refactoring, proof acceptance, selective formatting, agent
commits, delivery and asynchronous CI ownership. This plan authorizes none of
Take, execution, commit, publication, landing, cleanup or completion reporting.

No numeric target/hard limit was supplied. Slice 1 is one compatibility/proof
loop and immediately enables slice 2. Each Behavior has one owned observation:
capture, inspect, choose, recover, or reach a completed story. Recovery is kept
separate because write ordering and lost acceptance are consequential failure
boundaries; it is not a test-only slice. The common fixed-pair rule handles all
run variants. If an attempt discovers an additional independent outcome or
overruns, preserve attempt-owned work and revise the same remaining plan under
ordinary sizing guidance; do not weaken the source examples or add a handler
per workflow/host.

## Preparation review

Cumulative design: one publication comparison, one launch reporting channel,
the existing record store and binding discipline, one common diff/view, one
run selection and the same story-card review action. Refinement/execution,
isolated/default checkout, ordinary/done card and normal/retried delivery
exercise those owners rather than creating separate recognizers or diff engines.

Slice-plan refinement was not needed: the six boundaries have one proof loop
each, the sole Structure immediately enables capture, and the named interim
states preserve useful behavior and recoverable evidence. There are six slices,
no sizing exceptions and no resplit recommendation. No remaining slice-specific
concern was identified in this preparation review. The disproved resume-base
premise is owned by slice 1 rather than relied on as an existing capability;
the broad-run baseline limits do not substitute for fresh B/C observations.

The current story's goal, scope and seven examples map to these slices;
the relied-on current behavior and Git engine assumptions were observed.
Record the planned approach and a ready assessment against the current story
and plan digests through the shared recorder. Readiness is preparation judgment,
not execution authority. Keep the seed and plan as uncommitted drafts in the
same retained workspace with its Preparing assignment.
