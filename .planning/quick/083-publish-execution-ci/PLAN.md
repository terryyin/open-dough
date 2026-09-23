# Publish execution increments with reliable CI observation

Status: done.
Identity: `SEED-008#script-driven-ci-observation`
Source: [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#script-driven-ci-observation).

Terry accepted the refinement recommendations and retained priority on 2026-09-23,
authorizing refinement and planning only. No Take, implementation, or release is
authorized by this plan. All slices below remain planned.

## Goal and scope

Each managed ordinary increment or authorized repair publishes with exact-revision
CI observation and owner-directed failure delivery, or an explicit actionable gap.
Remove routine manual observer setup/registration decisions and handle transcription.
Support the existing Trunk and Story Branch destinations, publication authority,
and host-owned/current-checkout restrictions. A necessary host binding is allowed;
a literal command count is not the outcome. Publication remains asynchronous.

Preserve unrelated work, published history, semantic backlog reconciliation,
candidate validation, bounded race recovery, separate local-refresh results, and
the existing completion/repair contracts. A coverage gap does not undo remote
acceptance or add an availability gate. Preparation, closure migration, new
providers, arbitrary-push watchers, dashboard changes, locks, new registries,
automatic semantic repair, and universal CI discovery are excluded.

## Architecture and reuse

Follow [North Star: remote publication and default-checkout ownership](../../NORTH-STAR.md#remote-publication-and-default-checkout-ownership).
Accepted ADR [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires cohesive responsibilities and useful increments;
[0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md) requires standalone payload delivery;
[0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) separates deterministic and native proof;
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md) requires one behavioral source.
Follow [maintainer guidance](../../../AGENTS.md) for eventual skill authoring.
ADR 0009 remains Proposed. This plan neither accepts it nor changes integration timing.
No new North Star topic or ADR is needed.

PFE inspected at `17143fa26f7a58cbb072d8ea9c6f6e01b57bc043`:

| Responsibility | Evidence and selected action |
| --- | --- |
| Git publication | `src/skills/dough-execute-plan/scripts/publication-git.mjs` owns production Git primitives; `workspace-publication-push.mjs` supplies bounded claim publication, containment, and semantic replay. Reuse/expose the candidate mechanics needed by delivery, keeping claim membership in startup. Do not turn an execution increment into another Take. |
| Increment examples | `execution-increment-publication.mjs` currently imports `publication-test-fixtures.mjs`, hardcodes origin, and invokes an optional registration callback. Its tests supply receipt collectors. These are useful Git examples, not a production command or automatic CI attachment proof. Replace/extract only the mechanics needed for managed delivery; no runtime import of fixtures. |
| Existing consumers | `current-branch-publication.mjs` and `dough-story-wrap-up/scripts/closure-publication.mjs` use the increment helper for different authority/closure purposes. Preserve their contracts if shared internals change. Preparation, claim publication, and closure must not acquire automatic execution observation accidentally. |
| Observation state | `ci-mailbox.mjs`, `ci-mailbox-revision-coverage.mjs`, and worker/store modules own startup, receipts, results, events, and completion. Extend this owner for matching context and attachment truth; do not add a workflow ledger. `registerPushedRevision` writes coverage regardless of worker state; `mailboxWorkerLoss` intentionally does not treat normal terminal results as crashes. Preserve that distinction while detecting ended attachment. |
| Host delivery | `ci-host-hook.mjs` owns Cursor/Claude delivery; `ci-observer-stream.mjs` and `references/ci-notify-codex.md` own the Codex stream binding. Retain necessary per-host transport. A shell process cannot itself promise Codex task notification. |
| Runtime and instructions | `references/runtime-setup.md`, `ci-notify-hosts.md`, `ci-monitor.md`, `wrap-up.md`, and `trunk-publication.md` supply current caller contracts. Replace managed delivery's repetitive setup/register recipe at its authoritative owner; preserve explicit observation for other callers. |
| Completion | Delivered `complete-revision`, `ci-completion-wait.md`, and completion tests remain the lifecycle authority. Do not implement another wait/shutdown policy or silently rearm a terminal finished observer. |

Paths in the table without a prefix are under `src/skills/dough-execute-plan/`.
Use existing payload declarations and installer operations for required dependencies;
never hand-edit installed `.agents/skills` or `.claude/skills` copies.

## Proof ownership and boundaries

| Final promise | Owning slice and observation |
| --- | --- |
| First publication establishes matching observation; later ordinary/repair delivery reuses it | 1: installed entry point plus real local Git remote, real mailbox/worker and host bridge; observe accepted SHA, one matching owner, later delivered failure. |
| Missing host alias does not hide usable checkout runtime; no manual handle bookkeeping | 1: isolated installation containing a usable canonical runtime with host alias absent; product resolution and delivery establish attachment. Native task trace proves workflow adoption. |
| Correct mode/authority/checkout and no automatic observation of local-only or wrong-target claim work | 1: both destination cases, no-authority counterexample, distinct claim target, unrelated checkout bytes and index preserved. |
| Reconciled candidate is validated before push; exact acceptance, history, bounded race recovery, deferred refresh | 2: independent remote history and recorded validation basis/order, a later remote descendant, conflict and repeated-race stops. |
| Accepted publication survives attachment failure or lost response; observation-only resume without another push | 3: controllable failure at attachment/response boundary, remote push count and candidate containment, recovered matching owner/coverage. |
| Ended/mismatched observer never appears active; unread evidence survives | 3: terminal-error and ambiguous-owner cases through ordinary managed delivery and host output; existing lifecycle eligibility governs recovery. |
| Delayed discovery delivers applicable failure once; another execution stays isolated; unresolved remains unproved | 1 establishes live delivery; 3 proves recovery retains it. Reuse late-GitHub-failure proof for discovery internals and add the missing managed caller boundary. |
| Existing completion, applicability, and unmigrated caller behavior preserved | Each changed boundary runs its affected regressions; 3 runs the composed publication-to-completion journey. |
| Standalone cross-tool delivery | Each behavior includes payload/runtime checks and representative guidance review; native evidence below owns actual agent behavior. |

Fixtures may supply authorization, repository state, CI response timing, and host
transport substitutes. They must not prestart/attach/register the observer when
those are the product outcome being proved. Provider stubs establish controlled
failure timing, not real provider availability. Inspect setup and assertions;
registration receipts or exit status alone are insufficient.

## Ordered slices

### 1. Managed delivery establishes observation and delivers failures
Type: Behavior
Status: done

Behavior: With an authorized validated increment and no prior observer, managed
delivery resolves the checkout runtime, establishes the supported host binding,
publishes to its authorized target, and attaches the accepted SHA. Later ordinary
increments and already-authorized repairs reuse the matching live owner. A delayed
failure arrives at the owning task's next safe boundary without a per-increment
CI wait or manual handle transcription. An unavailable bridge produces an explicit
coverage gap while preserving accepted publication.

Implement the smallest production delivery boundary using existing Git, observer,
and host owners. Integrate real host transport rather than hiding setup in a fixture.
Keep first attachment before the first applicable push where available and exact
revision registration after acceptance. Include runtime alias resolution and
standalone payload delivery. Replace the managed caller's obsolete recipe; preserve
local-only authority, current-checkout identity, claim-target distinctions, and
explicit observation paths for unmigrated callers. No generic command framework.

Proof: Extend `execution-increment-publication.test.mjs` (or a cohesive caller-level
successor) to invoke the installed delivery entry point against a bare local remote
and real worker, with controlled CI results. Cover Trunk and Story Branch targets,
second delivery/repair reuse, missing alias with usable runtime, unavailable bridge,
and local-only authority. Observe actual receipt, worker identity, host-delivered
failure, and independent Git history; do not inject the registration outcome.
Use `ci-host-hook-process.test.mjs`, `ci-custom-host-bridge.test.mjs`, and
`ci-observer-stream.test.mjs` for distinct transport regressions. Add the new caller
journey to existing native publication harness support as needed, with assessor
counterexamples for missing attachment and self-report-only success.

Safe stopping point: normal managed delivery supplies observation or a truthful
gap; candidate-changing reconciliation can return for explicit validation, and
unsupported recovery stops retain evidence. Slice 2 owns automatic continuation
across validated reconciliation; slice 3 owns resumed attachment obligations.

### 2. Reconciled delivery validates and observes the accepted candidate
Type: Behavior
Status: done

Behavior: Another writer advances the target before acceptance. Reconcile only
owned unpublished work while preserving published history and backlog semantics.
If the candidate changes and prior proof no longer applies, return that basis for
validation before any push; resumption publishes the validated candidate and
attaches its exact receipt. A later remote descendant does not erase acceptance.
A conflict or exhausted bounded retry preserves recoverable work. Deferred local
refresh is reported independently and does not invalidate remote acceptance.

Extend the same publication owner, not a separate reconciliation path for repairs.
Reuse the existing one-reconciliation/retry bound and existing agent proof judgment;
no validation framework or fixed broad test command is introduced. Preserve shared
callers' current authority and behavior when extracting common mechanics.

Proof: Extend real Git increment/racing-suffix/publication-resume cases through the
new caller. Record validation basis and push ordering independently. A clean rebase
without renewed applicable proof must not push. Retain previously published ancestry,
merge sibling backlog changes through existing semantics, preserve unrelated staged,
tracked, and untracked work, and assert no old SHA or other-writer attribution.
Reuse startup race and default-checkout tests only for unchanged shared mechanics;
add the changed delivery boundary. Native publication evidence must show the agent
responding to the changed candidate rather than blindly retrying.

Safe stopping point: both normal and reconciled delivery are usable; unresolved
publication and attachment gaps retain exact recovery context without pretending
that CI registration succeeded.

### 3. Resume accepted delivery without false coverage or duplicate publication
Type: Behavior
Status: done

Behavior: A push was accepted but its response or observation attachment was lost,
or its matching observer subsequently ended. Managed resume verifies actual remote
acceptance, recovers only matching execution/checkout/target context, and continues
the missing obligation without another push or duplicate live owner. Existing
lifecycle eligibility controls any rearm. Terminal finished or ambiguous ownership
returns an actionable gap, never a guessed replacement or apparent live attachment.
Unread failures survive; later applicable failure delivery and existing completion
remain correct for this execution and isolated from others.

Preserve historical terminal results and distinguish ended, lost, and unavailable
observation. Change attachment interpretation at the existing CI owner rather than
relabeling every finished observer as crashed. Do not broaden discovery windows or
listing limits to claim ODF-069 resolved. Where safe recovery cannot establish live
coverage, reporting the precise gap is the agreed outcome.

Proof: Real remote containment/push counts and CLI-level attachment recovery with
controlled lost response, failed attachment, normal terminal-after-errors, dead
worker, and mismatched owner. Assert no duplicate push/start, retained failures,
truthful bridge output, and exact completion target. Extend worker-loss, host-hook,
stream, and mailbox completion regressions where their shared contracts change.
Keep low-level coverage-fixture writes distinct from runtime claims of attachment.
Replay a delayed failure after resume and an undiscovered revision through the
existing completion boundary; do not count fixture cleanup as product shutdown.
Record actual responses and unresolved boundaries for ODF-069/073/085/089 only after
accepted implementation proof; all remain unresolved during preparation.

Safe stopping point: the full selected story works without preparation/closure
migration, arbitrary-push watching, or new lifecycle policy.

## Commands, native proof, and delivery gates

Focused executable entry points inspected during planning (extend their assertions
at the relevant slices; none was run as implementation proof during preparation):

```sh
node --test src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs src/skills/dough-execute-plan/scripts/current-branch-publication.test.mjs
node --test src/skills/dough-execute-plan/scripts/publication-racing-suffix.test.mjs src/skills/dough-execute-plan/scripts/publication-resume.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-race.test.mjs
node --test src/skills/dough-execute-plan/scripts/ci-mailbox-worker-loss.test.mjs src/skills/dough-execute-plan/scripts/ci-host-hook-process.test.mjs src/skills/dough-execute-plan/scripts/ci-custom-host-bridge.test.mjs src/skills/dough-execute-plan/scripts/ci-observer-stream.test.mjs
node --test src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-completion.test.mjs
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh
PATH=/opt/homebrew/bin:$PATH bash tests/execution-payload-update.sh
PATH=/opt/homebrew/bin:$PATH bash tests/install-ci-host-hooks.sh
```

Run only checks applicable to changed boundaries; include closure consumers when
shared publication changes. Use existing installer checks when required imports or
payload declarations change. New test paths/case names are selected during their
owning behavior slice and recorded with actual proof; the names above do not imply
that current tests already prove the new behavior.

Native acceptance is distinct from the credential-free harness. Reuse existing
`tests/git-publication-native.sh --native HOST --case CASE --results-dir DIR`
supervision, isolated projects, evidence retention, and independent Git inspections.
Do not pretend existing cases already establish automatic attachment. Extend that
harness with managed-delivery cases in their owning slices. Cover a fresh ordinary
journey for Codex's yielded stream and Cursor/Claude hooks, without prompts supplying
the expected commands. Assign missing-alias and ended-observer cases to the affected
Claude path; use shared deterministic evidence for equivalent cases on other hosts
with an explicit applicability judgment. Assess existing native evidence before
rerunning unaffected installation or completion behavior. Observe task receipt of
a delayed failure, not just a worker event file; count routine manual setup/handle
steps only as descriptive evidence, with no token-saving target.

Before claiming native acceptance, record candidate, host/runtime, requirement,
command, trace, independent state observations, and judgment. Run bounded sessions
under the existing harness deadline (900 seconds plus 15-second termination grace),
not retries until green. Quota/access failure is pending proof. Under ADR 0005,
functional implementation may finish separately, but any outstanding native
requirements must be retained in a linked acceptance story before this story closes;
never manufacture a pass or release authority. No such split or backlog addition
is performed by this preparation.

For execution, use the existing execute-plan proof acceptance, independent
post-change refactor, selective formatting, check-only commit hook, publication,
and retrospective gates. No full-suite run before every commit; broaden only for
affected boundaries or project requirements. Author source skills with the
representative invocation/context/outcome walkthrough and runtime-audience review.

## Sizing and review

Three Behavior slices own distinct observable delivery conditions rather than
separate code, documentation, and test layers. Necessary extraction belongs with
the behavior that uses it; no preparatory framework slice. No project numeric slice
target or hard limit was found, so no numeric estimate is invented. Slice 1 has the
largest integration surface, bounded to existing transports and one delivery path;
2 adds changed-candidate handling; 3 adds recovery and truthful attachment status.
If implementation exposes a new host feasibility requirement or incompatible
lifecycle meaning, stop the affected slice and reassess rather than expanding it.

Planning review found no remaining blocking scope or proof-mapping concern. Host
native evidence is still to be obtained during execution/acceptance, not asserted
here. The source's exact-command-count constraint was explicitly relaxed by Terry;
this avoids making a shell-only notification assumption. Existing terminal-finished
policy is preserved through explicit gaps, not an unapproved restart policy.

## Learnings and accepted proof

Slice 1 delivered:
- Outcome: Managed execution increment delivery resolves checkout runtime (host alias then same-checkout fallback), establishes or reuses matching live observation before push, publishes candidate to authorized target, registers accepted revision, and reports explicit coverage gaps on unavailable bridge without blocking remote acceptance. Local-only authority commits without pushing.
- Accepted proof:
  - `node --test src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-gaps.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs src/skills/dough-execute-plan/scripts/current-branch-publication.test.mjs src/skills/dough-execute-plan/scripts/ci-deployment-layout.test.mjs` (18 pass)
  - `node --test src/skills/dough-story-wrap-up/scripts/closure-publication.test.mjs src/skills/dough-execute-plan/scripts/ci-host-hook-process.test.mjs src/skills/dough-execute-plan/scripts/ci-custom-host-bridge.test.mjs src/skills/dough-execute-plan/scripts/ci-observer-stream.test.mjs` (10 pass)
  - `PATH=/opt/homebrew/bin:$PATH bash tests/execution-payload-update.sh` (pass)
  - `PATH=/opt/homebrew/bin:$PATH bash tests/install-ci-host-hooks.sh` (pass)
- Learnings:
  - Ref resolution (`targetBranchName` and `originTrackingRef`) belongs with production Git helpers in `publication-git.mjs`.
  - Observation establishment (matching, verification, launch, binding) forms a clean seam in `execution-increment-observation.mjs`, separating mailbox state management from Git increment delivery orchestration in `execution-increment-delivery.mjs`.
  - Host attachment requires real hook transport and host session identity; absent session identity or unregistered hook reports explicit unobserved coverage gap (`pendingCi: "unobserved"`) without blocking remote acceptance.

Slice 2 delivered:
- Outcome: Reconciled delivery rebases only the owned unpublished suffix (using the product backlog rebase adapter when touching the backlog), returns `needs-validation` with exact basis when candidate changes so unvalidated candidates never push without renewed proof, publishes and attaches the validated candidate on resume, stops cleanly on conflict or after one race retry, and preserves unrelated work and local checkout maintenance state independently.
- Accepted proof:
  - `node --test src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-reconciliation.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-reconciliation-stops.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-gaps.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-publication-reconciliation.test.mjs src/skills/dough-execute-plan/scripts/current-branch-publication.test.mjs src/skills/dough-story-wrap-up/scripts/closure-publication.test.mjs src/skills/dough-execute-plan/scripts/publication-racing-suffix.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-race.test.mjs` (33 pass)
  - `PATH=/opt/homebrew/bin:$PATH bash tests/execution-payload-update.sh` (pass)
- Learnings:
  - Owned-suffix rebase logic and applicable candidate proof gates separate cleanly into `owned-suffix-reconciliation.mjs` and `applicable-candidate-proof.mjs`, keeping publication modules modular and under 250 lines.
  - Candidate validation on race: A clean rebase must never push silently without applicable proof; returning `{ ok: false, publication: "reconciled", status: "needs-validation", ... }` allows caller validation before push.

Slice 3 delivered:
- Outcome: Managed resume verifies actual remote acceptance and never pushes duplicate commits (pushCount: 0). It recovers only an unambiguously matching live observer (matching repo, branch, checkout) without starting duplicate owners. Ended observers (`result.json`), lost workers, and ambiguous/mismatched owners explicitly report an unobserved coverage gap (`pendingCi: "unobserved"`), never false live coverage. Host hooks distinguish ended observers from active ones (reporting ended status rather than active attachment). Unread failures survive resume; later failure delivery and completion truth remain intact.
- Accepted proof:
  - `node --test src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume-ownership.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume-lifecycle.test.mjs` (9 pass)
  - Full suite of 63 managed delivery, publication, closure, host-hook, stream, and worker-loss regressions: `node --test src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery*.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-publication*.test.mjs src/skills/dough-execute-plan/scripts/current-branch-publication.test.mjs src/skills/dough-story-wrap-up/scripts/closure-publication.test.mjs src/skills/dough-execute-plan/scripts/publication-resume.test.mjs src/skills/dough-execute-plan/scripts/ci-host-hook-process.test.mjs src/skills/dough-execute-plan/scripts/ci-host-hook.test.mjs src/skills/dough-execute-plan/scripts/ci-custom-host-bridge.test.mjs src/skills/dough-execute-plan/scripts/ci-observer-stream.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-worker-loss.test.mjs` (63 pass)
  - `PATH=/opt/homebrew/bin:$PATH bash tests/execution-payload-update.sh` (pass)
- Learnings:
  - Resume uses production Git helpers (`publication-git.mjs`) rather than test fixtures so all modules deploy cleanly.
  - ODF-089 is addressed by distinguishing normal ended observers from active attachment in `ci-host-hook.mjs`: an ended observer's receipt reports its terminal status instead of emitting "CI observer attached to this coordinator". Probe redelivery stays silent.

Slice 4 repair delivered:
- Outcome: Fixed CI regression where `ci-supported-host-contract.test.mjs` failed due to missing exact match phrase in `references/ci-monitor.md`. Preserved `execution/review completion boundary below is the only routine CI wait` verbatim while keeping the file under 250 lines.
- Accepted proof:
  - `node --test src/skills/dough-execute-plan/scripts/ci-supported-host-contract.test.mjs` (1 pass)
  - `npm run lint` (pass)
- Published commit: `04791a7ec3e7c06575858b6adb71e357da5d52ee` on `cursor/083-publish-execution-ci`





