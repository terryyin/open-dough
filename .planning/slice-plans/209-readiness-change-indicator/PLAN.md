# Show changes since readiness review without blocking execution

**Identity:** SEED-080#readiness-change-indicator
**Source:** [refined story](../../seeds/SEED-080-readiness-change-indicator.md#readiness-change-indicator).
**Authority:** Terry requested slice planning on 2026-10-02; preparation only.
**Preparation:** Reuse the established workspace
`/Users/terryyin/git/open-dough/.worktrees/show-changes-since-readiness-review-without-bloc`,
branch `codex/show-changes-since-readiness-review-without-bloc`, agent `ruuf-chan`,
starting revision and published assignment `57519ee003f64f2fd37e0e720422084192136eb1`,
remote `origin`, target `main`, integration checkout
`/Users/terryyin/git/open-dough`. Retain the published Preparing assignment and
the uncommitted seed and plan for review.

## Goal and scope

Developers and executing agents see the last readiness judgment independently
of changes since that review. A changed story recorded Ready can start normally
under existing authorization and startup safeguards. Preserve recorded Not ready
and its reasons, unassessed and invalid preparation handling, ownership, plan
selection, publication, retry and native-start safeguards.

Show "Changed since readiness review" alongside readiness on cards, expanded
preparation facts and story details. A changed Ready story retains the Ready
badge and normal Start presentation. Current-content reassessment clears the
indication and uses the new Ready or Not ready judgment. Matching and absent
assessments show no change indication. Keep digest coverage, sibling isolation,
legacy basis interpretation, and optimistic concurrency checks on recording.
Take, resume and ordinary delivery updates never renew assessments automatically.
Authors still align scope and plans and review readiness after scope changes.

No diff viewer, semantic edit classification, automatic reassessment, new
readiness policy, installation/update change, release or implementation is
authorized by this preparation. Existing native-host support is unchanged.

## Existing solutions and direction

PFE searched assessment, digest mismatch, readiness badges and startup consumers
across `src/skills/`, `dashboard/`, `tests/` and maintained documentation.
Change the existing shared `product-backlog-story-state-assessment.mjs` reader:
it already owns recorded judgments and comparison with current/former bases.
Keep the judgment and derive a separate change fact there; consumers must not
reinterpret digests or persist a second readiness state. Stored assessments
remain Ready/Not ready with the reviewed basis. Align the typed dashboard
projection and actual execution consumer in the same delivery.

Reuse `storyPreparation.ts`, `PreparationCard.tsx`, `StoryDetail.tsx` and
`launchWorkflow.ts` for presentation and Start notes. Reuse the installed
execution start's receipt and `established-start.mjs` formatter to convey the
change indication to agents; preserve it through the dashboard's result reader,
start recording and launch-record schema. This uses the shared host handoff,
without introducing host-specific readiness rules or a separate warning store.
Inspect successful continuation/recovery receipt paths too; a retained start
must not drop the indication it is responsible for handing off.

Follow [North Star: one backlog interpretation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
and [workflow-owned start](../../NORTH-STAR.md#a-start-establishes-claim-and-workspace-before-the-session).
Relevant Accepted ADRs are [0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
(one domain vocabulary), [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(coherent current responsibility), [0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(source authoring and tagged delivery), [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(shared deterministic proof versus native acceptance) and
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one runtime guidance home and executing-project perspective). The ADR index
and record statuses agree; no conflict, exception or new North Star topic is
needed. Follow [maintainer guidance](../../../AGENTS.md): author reusable
changes under `src/skills/`, never hand-edit installed managed copies.

## Observed premises and proof boundaries

Observed in this workspace at `57519ee0` on 2026-10-02, with only this
preparation's seed draft changed:

- `rg -n 'needs-reassessment|normalizeAssessmentView|assessmentSummaryText|readyBadge' src dashboard tests --glob '!*.md'`
  reaches the shared normalizer, CLI help, reader tests, dashboard schemas,
  presentation helpers, badges, Start note and execution startup cases.
  Reading `product-backlog-story-state.mjs` shows `readStoryState` consumes the
  normalizer with current and former bases. `execution-source.mjs` consumes
  that result and requires assessment status Ready. These are shared contract
  consumers to align, not separate owners of change detection.
- `node --test tests/support/story-state-assessment-refusals.test.mjs tests/support/story-state-sibling-readiness.test.mjs`
  passed 7 tests. Real CLI recording/reading of temporary homes establishes
  that own/shared-context and plan edits produce `needs-reassessment`, sibling
  edits do not, and stale assessment submissions refuse without rewriting the
  home. This settles the current reader and recorder paths the slice changes
  or preserves; it does not prove the new behavior.
- `node --test src/skills/dough-execute-plan/scripts/workspace-publication-startup-source-cases.mjs src/skills/dough-execute-plan/scripts/established-start-guidance.test.mjs`
  passed 13 tests. The startup cases commit changed assessed content to an
  isolated bare origin and run the real start CLI; both ordinary and Ready-looking
  local copies still get `source-refused`, no workspace and no Take. This
  reproduces the startup symptom through the consuming operation. Publication
  authority and unavailable-source cases remain independent safeguards.
- `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/story-readiness-gaps.spec.ts dashboard/tests/story-readiness.spec.ts dashboard/tests/agent-launch-start-card.spec.ts dashboard/tests/agent-launch-start.spec.ts --workers=2`
  passed (exit 0). `storyReadinessPublications.ts` commits a shared-context edit,
  `publishCommittedOrigin` serves those pinned bytes, and the real page asserts
  Needs reassessment replaces Ready/Not ready. The start HTTP journey runs
  source skills copied into an isolated project against a bare origin and
  inspects the synthetic Claude launch instruction. Held-start card cases
  prove presentation only, not real publication.
- `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-launch-start-phases.spec.ts --workers=2`
  passed (exit 0). `support/preparationPage.ts` installs source skills into a
  disposable project, and `support/startProgressPage.ts` feeds its bare origin
  to the page, presses Start, and observes actual claim and launch phases for
  Claude and Codex. The Codex journey additionally observes refusal/retry with
  one retained workspace and the exact first input through `expectExecutionInput`.
  This settles the available outside-in proof seam for the new indication.
- Reading `execution-start-receipt.mjs`, `established-start.mjs`,
  `dashboard/server/startResult.ts`, `startRecording.ts`, and
  `dashboard/src/launchRecord.ts` shows no current indication field: the
  receipt-to-record-to-formatter chain must carry it explicitly. Existing
  `agent-launch-start.spec.ts` and `support/codexStartAssertions.ts` inspect
  the host-consumed input; formatter tests alone cannot prove delivery.

Dashboard observations used a temporary `node_modules` symlink to the existing
integration checkout's dependencies, removed after observation. Tests build
the production dashboard and use isolated preview servers, stores, Git origins
and synthetic vendor processes; no production claim or native agent ran.

## Ordered slices

### 1. Changed reviewed content retains its judgment through informed execution
Type: Behavior
Status: planned
Proof: All six story examples, through the CLI, committed-origin page and real
installed startup boundary described below.

Behavior: Content assessed Ready or Not ready changes → preparation is read
and displayed, and a developer authorizes execution when Ready → the recorded
judgment remains visible alongside "Changed since readiness review"; Start
uses its normal Ready presentation, the real startup succeeds under existing
safeguards, and the host-consumed instruction carries the indication. A fresh
assessment clears it; matching or absent assessment invents no change.

Change the normalizer and all its current contract consumers together. Keep
read-only reads, recorded reasons and basis, existing story-scoped/former basis
semantics and schemaVersion compatibility; no migration or new persisted
assessment status is needed for a derived read-time fact. Preserve readiness
unavailable and plan-association conflict presentation as distinct evidence
problems. Update the badge legend and maintained dashboard explanation to
describe the independent indication. Use text and accessible presentation,
following the existing dashboard UX direction.

Extend the existing scratch CLI tests for changed Ready/Not ready, story and
plan edits, matching/absent cases, and fresh reassessment. Continue asserting
stale expected-basis recording refuses with unchanged bytes. Update the sibling
and former-basis tests' observations without changing their digest rules.

Extend `story-readiness-gaps.spec.ts` and its publication helpers so actual
committed edits retain Ready/Not ready badges and reasons on cards and details;
record and publish a fresh assessment to observe the indication disappear.
Preserve plan failures, unsupported records, pinned revisions and slice-progress
observations. Include the new label in the existing accessibility proof.

At the real page/start seam in `support/preparationPage.ts`, publish a changed
Ready story to its bare origin before loading the page (do not plant a changed
display object). Extend an existing start journey or add one focused spec:
observe card/detail labels and absence of the unready note/muted class, press
Start, observe one published Take and owned workspace, and inspect the actual
host first input for the change indication. Cover the shared handoff once at
this boundary and the distinct Claude/Codex forwarding with their existing
input assertions. Extend the retained-start retry observation so it keeps the
indication without a second claim. Keep tests in those existing suites where
practical; any new spec's literal command is added here before accepting proof.

Update `workspace-publication-startup-source-cases.mjs` to observe successful
changed-Ready startup, including the Ready-looking local-copy case. Retain
recorded Not ready and absent preparation refusal cases and authority, ownership,
plan selection and native-start safeguards. Preserve source-change race checks
during publication; those checks remain distinct from a historical assessment
mismatch. Assert that startup retains the selected story's assessment block and
reviewed basis byte for byte rather than renewing them.

Align `src/skills/dough-product-backlog/references/record-preparation.md`, CLI
help and affected execution guidance. State that digest mismatch informs and
does not withdraw the recorded judgment or independently block authorized
startup; scope authors still review/alignment, and Take/resume/delivery do not
renew the reviewed basis. Walk one representative changed-Ready authorized
invocation under the `AGENTS.md` behavior review, including the retained-start
handoff, and one genuine Not ready refusal. This is conventional shared guidance
authoring, with no new installation or per-host native acceptance promise.

Safe stopping point: The complete bounded story is delivered with one readiness
meaning across reader, presentation, startup and guidance. No later slice is
required to repair an interim contract or unproved agent handoff.

## Proof ownership and checks

| Promise | Owner | Observable proof |
| --- | --- | --- |
| Incidental/shared-context and substantive story/plan changes preserve judgment and reasons | Slice 1 | CLI tests read edited homes/plans; committed-origin card/details retain badges and reasons |
| Changed Ready has normal Start and can execute | Slice 1 | Actual page click runs installed start; bare origin holds one Take and workspace is created |
| Agent receives change indication, including retained-start forwarding | Slice 1 | Actual Claude instruction and Codex first input assertions, with existing retry claim/workspace proof |
| Changed Not ready and absent/invalid preparation retain handling | Slice 1 | Reader/page assertions plus real startup refusal and preserved source/ownership/plan safeguards |
| Fresh review clears indication; matching/absent reviews do not fabricate it | Slice 1 | CLI reread and page refresh after recording and committing a fresh assessment |
| No auto-renewal, unchanged digest coverage/concurrency safety | Slice 1 | Reviewed basis bytes preserved through edits/start; sibling/legacy cases and stale expected-basis refusal |
| Guidance describes the same rule | Slice 1 | Representative invocation review per AGENTS.md; source references and CLI help agree |

Run focused commands after edits and slice-local cleanup:

```sh
node --test tests/support/story-state-*.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs src/skills/dough-execute-plan/scripts/established-start-guidance.test.mjs
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/story-readiness.spec.ts dashboard/tests/story-readiness-gaps.spec.ts dashboard/tests/story-readiness-accessible.spec.ts dashboard/tests/agent-launch-start.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-launch-start-phases.spec.ts dashboard/tests/execution-start-result.spec.ts --workers=2
npm run typecheck:dashboard
git diff --check
```

The shared CLI files exercise the changed read contract and retained recorder
invariants. `workspace-publication.test.mjs` imports the real source, ownership,
plan and retry cases. Page tests prove actual presentation and host-consumed
handoff; typecheck covers the changed typed reader/receipt/record contract.
These are affected-boundary checks, not a full-suite local gate inferred from
hosted CI. Update exact input-contract expectations to include the indication
when present and preserve unchanged handoffs when absent.

## Current decisions and preparation review

One common rule owns the outcome: retain the stored judgment and derive change
from its existing basis; all consumers use both facts. One vertical Behavior
slice keeps this shared read contract and its startup/UI consumers coherent.
It includes implementation, proof and local cleanup, without independent
structure or special-case slices. No numeric slice limit was supplied; the
boundedness assumption is the existing reader/consumer change, not a new
workflow or persistence mechanism. If implementation exposes a broader contract
or fixture problem, stop the affected path and refine this plan with evidence.

Apply execution's post-change refactoring, proof acceptance and delivery gates
when execution is separately authorized. Keep this plan, source and accepted
proof for retrospective and story wrap-up; do not write an execution-complete
record during planning. Re-observe changed overlapping startup consumers when
integrating newer trunk; this baseline makes no claim about future deliveries.

No slice-specific concerns found in this preparation review. The single
outcome has mapped proof and observed consuming paths; synthetic vendor
boundaries are explicitly distinguished from native skill-use acceptance.
No separate slice-plan refinement pass was needed.
