# Stable older-installation retry regression proof

## Source and provenance

- Identity: SEED-067#pin-older-preparation-command-proof.
- Story: [bounded correction](../../seeds/SEED-067-codex-refinement-launch-reliability.md#pin-older-preparation-command-proof).
- Review recovery: `aa488058c4305bd98c7ea049b5713bc2d8df1c24:.planning/slice-plans/194-codex-refinement-handoff-retry/PLAN.md`, with `OBSERVATIONS.md` beside it. Original story recovery is the same commit's `.planning/seeds/SEED-067-codex-refinement-launch-reliability.md#resolve-codex-refinement-launch-failures`; identity SEED-067#resolve-codex-refinement-launch-failures. Plan 194's spent records were removed during wrap-up; this active correction and its scope remain.
- Related implementation: `8ba333cdb3a74f090e432b5cfdba103d29760cba` adds safe continuation and the older-command scenario; `f5500724cd937250c74dd5964f27c486dd655d5a` fixes fixture typing before publication. `af0bf6ea`, `9e41c72b` preserve native evidence; `f5f134fc7f06d217f012638a0601de21de057732` documents realized handoff. Take `3dc604a9` is claim provenance only. Prior daemon repair and plan 192 work are excluded.
- Prepared in execution's supplied owned checkout `/Users/terryyin/git/open-dough/.worktrees/codex-refinement-handoff-retry`, branch `codex/codex-refinement-handoff-retry`. Existing integration checkout is `/Users/terryyin/git/open-dough`; review records were published with plan 194's completion increment. Terry authorized queuing this correction first during wrap-up on 2026-10-01; execution remains unauthorized.

## Finding and current observations

`dashboard/tests/agent-launch-preparation-codex-retry.spec.ts` replaces the
installed command for `older-script` using `git show HEAD:src/skills/dough-story-refinement/scripts/preparation-assignment.mjs`, with no separate revision or fixture.
During uncommitted implementation HEAD still held the predecessor. At the
published implementation HEAD, that same operation now returns the command
with `continue`. Consequently its missing-workspace refusal passes through the
current guard, duplicating another scenario instead of exercising an older
installation's rejection of the unsupported operation.

Literal read-only observation at `f5f134fc`: `git show HEAD:src/skills/dough-story-refinement/scripts/preparation-assignment.mjs | rg -n 'continue:'` returned the dispatch entry. The installed v0.3.51 command's operation table has only start/release/abandon. The scenario's setup and this Git lookup establish the drift; no native session is needed.

This does not invalidate the earlier correctly selected predecessor proof or
the unchanged production refusal. It weakens maintained regression coverage.
Only that weakness is in scope.

## Goal, constraints and selected existing solution

Use the existing `preparationPage`/`startOrigin` real installation and Git
fixture; `fakeCodex` continues to substitute native RPC only. Fix the existing
older-command setup, with explicitly identified predecessor bytes whose
meaning does not change when HEAD or installed managed guidance changes.
Use a real released CLI entry and the existing fixture installation seam;
no network-dependent release fetch, broad compatibility framework, or new
native acceptance is required.

Follow [North Star's established start](../../NORTH-STAR.md#a-start-establishes-claim-and-workspace-before-the-session) and [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): the installed script owns assignment, deterministic proof owns retry, and no native code or activation mechanism changes. No architectural decision or product promise is changed.

## Proof ownership and ordered slice

### 1. Preserve the unsupported-command retry scenario across commits

Type: Structure

Status: done

Correction: make the existing older-installation case use stable predecessor
command bytes and observe that the installed command truly lacks continuation.
Keep the integrated retained-start retry refusal and independently requested
story journey together. Document only the fixture's release/provenance where
needed to maintain its meaning.

Proof: first obtain a distinguishing red signal on the current fixture: against
an intact established fixture workspace, its purported older command currently
accepts `continue`. The corrected fixture must refuse that operation as
unsupported before ownership damage is introduced. Then run
`env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-preparation-codex-retry.spec.ts --workers=2 --grep 'older-script'` and observe unchanged saved-start bytes, profiles/allocation/origin tip, branches/worktrees and native call log through repeated dashboard retries, plus independent Story B success. Setup must not supply those product outcomes. Preserve existing current-command continuation proof; run the continuation spec only if its shared setup changes. No full suite or paid native probe is a local gate.

Safe stop: corrected fixture retains a distinct older-command rejection and the
real retry journey is green; otherwise retain the bounded red evidence without
claiming coverage. Execution owns fresh refactoring, selective formatting,
check-only staged lint, commit/publication and CI through dough-execute-plan.

## Construction review

One correction, one proof loop, no new product behavior or independent slice.
Existing solution and decisive lookup/dispatcher premises were inspected above.
No numeric slice target/hard limit was supplied. No slice-boundary, proof,
architecture or sizing concern remains in this planning review. Preparation
assessment records this judgment; it grants no execution or queue authority.

## Execution state and accepted proof

- Authorized by Terry's `dough-execute-plan 195` instruction on 2026-10-01.
- Mode: Story Branch. Originating/integration checkout: `/Users/terryyin/git/open-dough`.
- Created owned workspace: `/Users/terryyin/git/open-dough/.worktrees/older-preparation-command-proof`; branch `codex/older-preparation-command-proof`; starting revision `e2735f52d0e5252f935b8f3a310f699711bb8270`.
- Publisher: `codex-plan-195-20261001`; assigned agent `mike.li-chan`.
- Accepted Take: `d5284a8a4005eddb5c7bc33645938596ed25cf50` on `origin/main`; execution branch published at that Take. Default checkout maintenance: advanced. Claim CI remains unobserved.
- Setup: `npm ci` completed in the owned checkout, followed by passing `npm run test:dashboard -- --list dashboard/tests/agent-launch-preparation-codex-retry.spec.ts --grep older-script`.
- No numeric slice target/hard limit; existing same-scope planning authority retained. No replanning was needed.
- Implementation replaces the HEAD-dependent command with unchanged offline v0.3.51 CLI bytes; release/blob/checksum provenance is beside the maintained fixture. Production and shared setup are unchanged.
- Distinguishing red: `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-preparation-codex-retry.spec.ts --workers=2 --grep 'older-script'` with the direct CLI probe and original HEAD-backed command failed expected exit 2 / received 0, stdout `status: continued`, before workspace/branch damage.
- Green: the same literal command passed, terminal exit 0, selecting the older-script scenario. Its intact-ownership probe observes exit 2, empty stdout, start usage and absent continue usage. Dialog and HTTP retries observe unchanged saved-start bytes, profiles, origin tip, branches/worktrees and native call log; independent Story B launches with a second profile and one turn/start. The removed workspace has no allocation ref; published allocation/profile preservation is observed instead.
- Observing locations: `dashboard/tests/agent-launch-preparation-codex-retry.spec.ts`, older-script CLI probe, repeated retry preservation assertions and independent Story B assertions. Preconditions come from unchanged `support/preparationPage.ts` / `support/startOrigin.ts`; native substitution owns RPC only.
- Fresh independent refactor review: none — already clean; no edits or repeated tests. Selective Prettier formatting changes layout only. No current-command continuation rerun: its shared setup/implementation remains unchanged.
- Delivery target: `origin/refs/heads/codex/older-preparation-command-proof`; GitHub workflow `ci.yml` verified. The installed managed delivery starts a detached mailbox, but its Codex adapter exposes no supported way to attach the yielded stream to that existing mailbox. The documented stream command creates another mailbox. Delivery therefore reports an explicit unavailable notification bridge rather than claiming observed CI.
