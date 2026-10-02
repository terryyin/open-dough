# Startup advice follows the host description

**Identity:** SEED-075#startup-advice-from-host-description
**Source:** [refined story](../../seeds/SEED-075-host-neutral-dashboard-before-cursor.md#startup-advice-from-host-description).
**Authority:** Terry requested slice planning on 2026-10-02; preparation only.
**Preparation:** Reuse the established owned workspace
`/Users/terryyin/git/open-dough/.worktrees/startup-recovery-advice-comes-from-the-host-desc`,
branch `codex/startup-recovery-advice-comes-from-the-host-desc`, starting revision
`10968f4182a93a32febe9aef3c33189d349408ce`; agent `pyo-chan`, remote `origin`,
target `main`, integration checkout `/Users/terryyin/git/open-dough`.
The existing Preparing assignment remains published; retain this draft for review.

## Goal and scope

A developer watching or recovering a startup sees the selected host's words
and advice through its existing description. Preserve Claude Code and Codex
wording, preparation versus launching, no-phase start-establishment choice,
local-progress and reconciliation explanations, story protection, recovery
eligibility and existing Recheck/Continue behavior. Story and ad hoc recovery
share their host's advice when their existing rules offer Continue. Without
native-check advice, omit only that advice and its accessibility reference.

Defer Cursor launch/native recovery integration, new controls, persistence or
reconciliation changes, and recovery-answer rewriting removal (owned by
SEED-072#durable-startup-reconciliation). No native operation changes here.

## Existing solutions and direction

PFE searched startup/recovery/uncertainty/workflow wording across dashboard,
source skills, scripts, tests and documentation. Reuse `hostDescription.ts` as
one owner of host facts, `launchWorkflow.ts` for workflow and phase meaning,
and `StartupRecovery.tsx` for recovery presentation. `uncertaintyHint` is advice
for an untrusted launch answer in `agentLaunchClient.ts` and Claude's launch
boundary; it does not describe what Continue does. Extend the description with
the small optional native-check advice rather than rewriting that existing hint
or merging these different meanings. Keep inline command presentation through
the existing `LaunchExplanation` renderer where suitable. No generic host
framework, new store, or duplicate workflow table is needed.

Follow [North Star: agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment):
host-owned native operations, one host description, shared presentation.
Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires coherent responsibility and sufficient current structure;
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) keeps an
unsupported operation unavailable and distinguishes shared proof from native
acceptance. The ADR index agrees with these records; no conflict, exception or
new direction is needed. Preserve the [dashboard UX/UI direction](../../../docs/dashboard-ux-ui-north-star.md)
and current recovery placement outside protected story frames.

## Observed premises and proof boundaries

Observed in the preparation workspace at `10968f41` with only the seed draft
changed, on 2026-10-02:

- `rg -n 'startPhaseWords|spec.pending|launchWorkflows.*pending' dashboard --glob '*.ts' --glob '*.tsx'`
  reaches the workflow table/helper and `StartupStatus`. Reading that component
  and `CardLaunches.tsx` shows the card consumes actual startup host, phase and
  start-establishment facts, then replaces a Claude Code literal. Slice 2 must
  consume those facts directly and preserve the table's preparation choice.
- Reading `StartupRecovery.tsx` through `RecoveryEntry` shows native-check
  advice and its `aria-describedby` are conditional on Continue eligibility;
  `NativeCheck` gives every non-Claude host Codex's advice. Reading
  `hostDescription.ts` shows Cursor has an identity but no hint or offered
  launch. Slice 1 uses absence of advice, without adding a host operation.
- `rg -n 'before continuing|never submitted|claude agents' dashboard/tests`
  finds Claude recovery answer assertions but no full native-check advice
  assertions. Reading `responsive-session-recovery-ad-hoc.spec.ts` shows a real
  page observing uncertain Codex evidence and continuing the same blank intent
  with no submitted input. Advice assertions must be added; existing success
  does not prove description ownership or the missing-advice case.
- `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/responsive-session-recovery-ad-hoc.spec.ts dashboard/tests/agent-launch-start-card.spec.ts dashboard/tests/responsive-session-start-codex.spec.ts dashboard/tests/agent-launch-card-problems.spec.ts --workers=2`
  passed (exit 0). Tests build the production page and run isolated preview
  servers, synthetic native hosts, temporary stores and bare origins. This
  settles the current page/protection/continuation baseline consumed by both
  slices, not real native acceptance or future host behavior.
- Initial baseline could not spawn worktree-local Vite (no `node_modules`).
  A temporary local symlink to `/Users/terryyin/git/open-dough/node_modules`
  resolved that environment prerequisite; `NO_COLOR` was removed from the
  test environment to avoid quiet-reporter failure from color warnings.

## Ordered slices

### 1. Recovery offers the host's own native-check advice
Type: Behavior
Status: done
Proof: Story examples 1–3; Claude and Codex page advice, absent advice and
accessibility references, with existing controls and continuation preserved.

Behavior: An accepted story or ad hoc attempt offers Continue → the recovery
entry renders → it reads optional advice from its host description, preserving
Claude's `claude agents` wording and Codex's recorded-conversation rule exactly.
A description without advice shows no borrowed instruction and no dangling
`aria-describedby`; the entry and eligible controls remain.

Extend the existing description and recovery renderer together. Add explicit
native-check assertions to `agent-launch-card-problems.spec.ts` and
`responsive-session-recovery-ad-hoc.spec.ts`, separate from last-answer advice.
For absent advice, add a focused rendering proof of `StartupRecovery` in `startup-host-words.spec.ts` using an
otherwise eligible item and the existing advice-less Cursor description. Supply
only the recovery precondition; observe rendered advice, control availability
and description target. This is a presentation contract test, not evidence of
Cursor launch support. Use the existing browser machine-evidence GET seam (`agentLaunchEndpoint`)
to supply an unowned, unsettled ad hoc attempt with host `cursor`. The request
schema retains all `agentHosts`; `attemptObservationSchema` adds `owned`,
and `useStartupRecovery` renders the latest unresolved ad hoc attempt. Observe
the real page without pressing Continue or starting a native host. The supplied
attempt proves only this presentation boundary, not service admission.

Run `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-card-problems.spec.ts dashboard/tests/responsive-session-recovery-ad-hoc.spec.ts dashboard/tests/startup-host-words.spec.ts --workers=2`.
Before changing the renderer, establish the absent-advice assertion fails for
the current borrowed Codex advice, and retain the supported-host baseline.
Run `npm run typecheck:dashboard` after the contract edits. Safe stopping point:
recovery advice is host-owned; startup status may still need slice 2.

### 2. Startup status names its host directly
Type: Behavior
Status: planned
Proof: Story example 4; actual card words for execution/refinement, preparing,
launching and missing phase, preserving local progress and protected controls.

Behavior: A story startup is observed → the card renders its status → its
host description supplies host wording directly, with no Claude Code string
replacement. Preparing keeps its workflow's Preparing sentence; launching
names the recorded host. Missing phase retains the installed skill's existing
Preparing versus Starting choice. Reconciliation states remain unchanged.

The integrated trunk `4b00bfd7` already delivers direct startup words through
`startPhaseWords(workflow, phase, host)`, and `StartupStatus` consumes the actual
running host/phase or the established fallback. Preserve this implementation;
this slice owns verification and only any evidenced remaining gap. Search and
align all callers before changing helper signatures or pending representation.
Do not duplicate pending wording or broaden this story to notification policy.

Extend `responsive-session-start-codex.spec.ts` to observe held launching
wording as well as preparation; extend the existing card/phase tests with
refinement and missing-phase cases as necessary. Where page journeys already
cover the common choice, focused workflow/status contract cases may cover the
remaining equivalent combinations, rather than repeating full native starts.
Run `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-card.spec.ts dashboard/tests/agent-launch-start-phases.spec.ts dashboard/tests/agent-launch-preparation-phases.spec.ts dashboard/tests/responsive-session-start-codex.spec.ts dashboard/tests/startup-host-words.spec.ts --workers=2`
and `npm run typecheck:dashboard`. Safe stopping point: both story outcomes
are complete, without changing launch or recovery operations.

## Current decisions and delivery checks

The common rule is that descriptions own host-specific words and optional
advice; workflow facts and attempt facts still own phase and eligibility.
Two slices separate independently useful recovery and progress outcomes;
absence handling belongs with recovery, not a separate structural slice.
Each slice includes implementation, focused proof and local cleanup. No numeric
slice timing limit was supplied; boundedness follows the two proof loops.

Before each implicated edit, inspect current fetched trunk and reconcile any
published recovery-correction delivery (plan 206)
through execution's normal integration path. Re-observe the changed consumer
and rerun its focused proof before relying on this baseline. Advice must match
actual Continue semantics; a conflicting human-owned scope change stops that
path for a decision. This is an integration obligation, not permission to
change those stories or assume their future APIs.

Apply execution's post-change refactoring and delivery/review gates, run
`git diff --check`, and retain proof in this plan during execution. The named
page checks own affected behavior; typecheck covers the shared typed contract.
Hosted CI alone adds no full-suite local gate. These deterministic tests make
no new cross-host native acceptance claim. Keep the seed, plan and proof until
retrospective/wrap-up; write no execution-complete record during preparation.

## Preparation review

Landing review on 2026-10-02 integrated `4b00bfd7` before committing the draft.
The same focused baseline command was rerun on integrated `4b00bfd7` and
passed (exit 0), covering page startup/protection and recovery continuation.
Reading `sessionCapabilities.ts` confirms `hostName` delegates to the host
description. The completed session-wording sibling and its spent plan stay removed. Plan
207 was concurrently allocated, so this plan uses 208. Source and scope remain
the same; slice 2 preserves and verifies the delivered implementation.

No slice-specific concerns found in this review: both slices have bounded
outcomes, mapped examples and observed current premises. Future overlapping
delivery is explicitly re-observed at integration rather than assumed.

## Execution context

Execution authorized by Terry's `dough-execute-plan` instruction on 2026-10-02.
Established start: identity `SEED-075#startup-advice-from-host-description`,
publisher `dashboard-mac.lan-open-dough`, agent `joey-chan`, mode `story-branch`.
Execution checkout (reused):
`/Users/terryyin/git/open-dough/.worktrees/startup-recovery-advice-comes-from-the-host-desc`,
branch `codex/startup-recovery-advice-comes-from-the-host-desc`.
Originating and integration checkout: `/Users/terryyin/git/open-dough`.
Starting revision: `9beaf9729ccbc9f06a1365c87751ee812c665cd9`.
Accepted claim/base: `993006dc60a03200c6e39fefa284971d62e34740` on `origin/main`;
established candidate is the same revision. Increment target:
`origin/refs/heads/codex/startup-recovery-advice-comes-from-the-host-desc`.
No overrun replanning option supplied; retain existing planning authority.

Checkout preparation: `npm ci` and `npm run typecheck:dashboard` passed with
the current lockfile and worktree-local dependencies. Fetched `origin/main`
at `57519ee0` contains only an unrelated preparation announcement beyond the
claim; no newly delivered recovery correction changes the current consumer.
CI source: GitHub Actions `ci.yml`, verified push trigger and selector for
`terryyin/open-dough`; story-branch selector currently returns no prior run.
The trunk claim predates this execution's observation and remains unobserved.

Observer: Codex yielded-cell bridge, coordinator `/root`, cell `19`, session
`2311`, PID `81647`, mailbox `/tmp/dough-ci-501/watch-1axyJp`; checkout and
target match this execution. Managed increment delivery reuses this observer
and registers accepted story-branch revisions. Workflow selector `ci.yml`.

### Slice 1 accepted proof

Descriptions now own optional `nativeCheckAdvice`; `RecoveryEntry` renders
it through `LaunchExplanation` only when Continue is eligible and advice exists.
Advice absence omits its paragraph and `aria-describedby` together; controls,
handlers, uncertainty hints and recovery-answer rewriting are preserved.

Pre-change: the required three-spec command failed solely at the Cursor
no-advice assertion, displaying borrowed native-conversation instructions;
Claude and Codex explicit advice assertions passed. A prior fixture GET 403
was corrected by supplying same-origin metadata, with HTTP 200 asserted.

`env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-card-problems.spec.ts dashboard/tests/responsive-session-recovery-ad-hoc.spec.ts dashboard/tests/startup-host-words.spec.ts --workers=2`
passed. The production built page observes Claude's full advice and command
formatting in `agent-launch-card-problems.spec.ts` (hanging synthetic native
launch), Codex's full advice and same blank-intent continuation with no submitted
turn in `responsive-session-recovery-ad-hoc.spec.ts` (lost confirmation), and
advice absence plus enabled Recheck/Continue and no accessibility reference in
`startup-host-words.spec.ts` (GET evidence supplies an unowned unsettled Cursor
attempt only). Supported-host Continue accessible descriptions match their
advice. Existing story protection and controls assertions remain passing.

`npm run typecheck:dashboard` passed, covering the shared typed contract and
current consumers. Independent refactor review found none — already clean;
no refactor edits or repeated tests. `npm run format` exposed an unsafe JSON
spread in the new fixture; parsing with existing `launchRecordsSchema` removed
it. After that fixture-only correction,
`env -u NO_COLOR npm run test:dashboard -- dashboard/tests/startup-host-words.spec.ts --workers=2`
and `npm run typecheck:dashboard` passed again. No native acceptance or Cursor
operation support is claimed. No generator trigger changed.
