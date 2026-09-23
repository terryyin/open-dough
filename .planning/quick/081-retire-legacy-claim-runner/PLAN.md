# Retire the superseded claim runner

Status: done.

**Identity:** quick/081-retire-legacy-claim-runner/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4958eeb7927b518346ed23633e268e0508de6051911e432db9c3f308e26552aa"}}
```

Source: execution retrospective for the completed startup story, recoverable at
`ce77380fa796b04e70d1d9973f930ce54f5bacb2:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#settle-taken-claims-on-remote-trunk`,
and its plan at
`ce77380fa796b04e70d1d9973f930ce54f5bacb2:.planning/quick/080-publish-startup-claims/PLAN.md`.
This is a bounded structural
correction to the delivered startup path, not a new feature story. Planning
does not authorize execution.

## Outcome and current finding

An agent or maintainer should find one installed queued-start runner and tests
that exercise that runner. Execution 080 delivered `execution-start.mjs` as the
installed command, but `workspace-publication.mjs` still ships in `install.sh`
and is called only by `workspace-publication.test.mjs` and one race test. It
retains a parallel `acquireWorkspaceClaim` orchestration with an `onImplement`
callback and a runtime import of `publication-test-fixtures.mjs`. Its passing
tests can therefore report startup/setup success without exercising the
installed command. The duplicate path may drift as claim recovery changes.

The source execution published the Taken claim `bb50966257004d8c9c9fe9b4f40a22958eb93438`
to remote main, then published implementation and repair commits
`194617bddce2613ef3030b60e0270a3e5e6ae684`,
`b77563688dfaf133f2afa19992ea7b7f5cb5a776`,
`de0a74e452233faa0ce3b9778e704a9e614c996f`,
`cb4479028199cc1434fd8d969e5543441c6f5430`, and
`1a63c0c5045703006af621f785e81cf6301873d3` to the execution branch.
The three repair commits corrected stale test assertions and a mailbox fixture
race; they are provenance, not part of this correction's scope. Other commits
on remote main and sibling execution branches are excluded.

## Scope and constraints

Remove the test-only installed runner and its payload entry. Move any unique
meaningful coverage to the actual `execution-start.mjs` boundary or the
separate project-command readiness boundary as appropriate. Keep the low-level
Git ownership and publication helpers that the installed command uses. Preserve
remote Taken confirmation before implementation, rival/ambiguous ownership
stops, recoverable setup failure, no duplicate claim on resume, project setup
failure after accepted publication, and human work preservation. Do not merge
project-command execution into the startup command or widen the command's
authority. Do not change claim/recovery behavior, release packaging, other
publication callers, or ADR status.

Existing source-of-truth decisions are the remote-publication topic in
[NORTH-STAR.md](../../NORTH-STAR.md#remote-publication-and-default-checkout-ownership)
and Accepted ADRs
[0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md),
[0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md), and
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
The source skill remains in `src/skills`; installed copies are released payloads.
Open native host acceptance gaps from execution 080 remain separate ADR 0005
work before release.

## Ordered slices

### 1. Keep one installed queued-start runner and its meaningful proof

Type: Structure
Status: done

Behavior preserved: queued work still reaches an owned, remote-confirmed Taken
claim through the installed command before project setup and implementation.
An unavailable workspace, failed project command, rival or ambiguous claim, and
resume retain their existing stop or accepted-claim outcomes. The correction
removes the obsolete parallel runner rather than adding another claim path.

Proof: inspect every `acquireWorkspaceClaim` test for a unique assertion.
Use the existing real CLI process fixtures to retain any missing ownership or
setup-failure observation. The command tests must construct queued prepared
source, invoke the installed CLI, and observe remote Git history and local
state; setup must not create the Taken result or fake implementation timing.
Use the project-command gate tests for preparation failure after acceptance.
Delete only redundant test cases once their surviving boundary is named.
Remove `workspace-publication.mjs` from `install.sh` and its payload assertion;
keep modules still used by other published callers. Check installed payload
import closure and the three-host installation mechanism using applicable
existing evidence under ADR 0005.

Focused commands: `node --test src/skills/dough-execute-plan/scripts/workspace-publication*.test.mjs`,
`bash tests/execution-payload-update.sh`,
`bash tests/git-publication-native.sh`, and
`bash tests/workspace-publication-callers.sh`. Run `git diff --check` and the
normal format/commit gates during execution. A fresh native host run is needed
only if this structural change invalidates existing behavior evidence.

Safe stopping point: only the installed runner expresses queued-start
orchestration, and retained tests prove the real remote claim and setup order.

## Preparation

The correction was planned read-only against the published execution result
`1a63c0c5045703006af621f785e81cf6301873d3` in the owned execution
worktree `/Users/terryyin/git/open-dough-worktrees/080-publish-startup-claims`.
The integration checkout is `/Users/terryyin/git/open-dough`; no default-checkout
access is claimed. The reviewed source path and payload callers make this one
bounded structural outcome. No remaining slice-specific blocking concern was
identified. This draft is unpublished and does not grant Take or execution.

## Execution identity

Story Branch Mode; retrospective skipped by user instruction; wrap-up authorized.
Originating and integration checkout: `/Users/terryyin/git/open-dough`.
Owned execution checkout: `/Users/terryyin/git/open-dough-worktrees/081-retire-legacy-claim-runner`,
created by this execution on `codex/081-retire-legacy-claim-runner` from
`b6ea5af`. Claim `ebe4db948f520bcd95d790a70f286065ef3e4024` accepted on
`origin refs/heads/main`; claim CI unobserved (planning-only change).
Increments target `origin refs/heads/codex/081-retire-legacy-claim-runner`;
wrap-up integrates into `origin refs/heads/main`. Default checkout refresh
deferred: no exclusive ownership declared; its clean HEAD was `b6ea5af`.
`npm ci` passed in the execution checkout; `npm exec -- prettier --version`
verifies project command availability. No active commit hooks; use selective
Prettier on changed supported source files, and focused check-only lint.
No numeric slice budget configured; one bounded Structure proof loop.
Existing planning authority retained; no scope expansion authorized.

CI observer: GitHub Actions `ci.yml` / `CI`, repository `terryyin/open-dough`,
target `codex/081-retire-legacy-claim-runner`, coordinator root, runtime in
this execution checkout. Mailbox `/tmp/dough-ci-501/watch-Qfn1HW`, PID 78134,
host session 30502, yielded cell 17.

## Accepted completion evidence

Removed the obsolete runner and payload entry; preserved select/push helpers.
CLI claim cases now own unavailable-workspace recovery and success/failure
through the separate readiness gate after remote acceptance. CLI race cases
own ambiguous provenance. Existing CLI recovery cases retain one claim on
resume; source/maintenance cases preserve human work. The coordinator inspected
`createQueuedTrunk`, `startCliResult`, `startProcess`, remote SHA/backlog
assertions, readiness markers, and conflict/candidate assertions. Fixture setup
provides queued prepared sources; the real command establishes Taken.

Terminal focused proof from this checkout:
- `node --test src/skills/dough-execute-plan/scripts/workspace-publication*.test.mjs`: 29/29.
- `bash tests/execution-payload-update.sh`: passed, installed import closure and both shared native layouts.
- `bash tests/git-publication-native.sh`: passed, Codex/Cursor/Claude substitute-process mechanics only.
- `bash tests/workspace-publication-callers.sh`: 14/14.
- `git diff --check`: passed.

The initial ambiguity migration reached the earlier source-refused guard;
using concurrent queued starts with the existing held-push fixture exposed the
intended ownership boundary. The corrected focused suite passed. No runtime
behavior was changed to satisfy that test.

Independent dough-post-change-refactor returned REFACTOR COMPLETE with no edits;
accepted proof boundaries unchanged and no redundant reruns. Selective Prettier,
ESLint, and shellcheck passed before commit. No active commit hook is configured.
Existing native behavior gaps stay with SEED-008#accept-queued-start-native-behavior.
Shared host installation and guidance mechanisms are unchanged; no new native
behavior success is claimed. Maintained execution-publication-design.md already
states the sole startup owner and separate project setup responsibility. The
North Star publication topic remains needed by active delivery/closure/checkout
coordination stories. No new follow-up or process finding was produced.

## Delivery and closure inputs

Implementation `6f5d0ef4d8043981fef2359c7a379317feef3db2` confirmed on
`origin refs/heads/codex/081-retire-legacy-claim-runner` and registered.
Completion wait receipt: requested that SHA on that branch, exact revision
state undiscovered, unresolvedReason `observation_unavailable`, detail
`worker_identity_unknown`. Observer stopped with unread 0; PID 78134 absent.
CI success is not claimed. Local proof remains accepted. Retrospective skipped
as requested; all slices done. Ordinary wrap-up is authorized and can proceed.
No new lasting fact needs assimilation: maintained design/source already state
the startup/setup boundary. No follow-up plan or attributable DearDough entry
exists. Retain the North Star topic for ongoing publication/coordination work.
