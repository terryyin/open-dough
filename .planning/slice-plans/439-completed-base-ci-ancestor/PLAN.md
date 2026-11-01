# Show the nearest completed base CI ancestor

**Identity:** SEED-214#completed-base-ci-ancestor
**Source:** [story](../../seeds/SEED-214-completed-base-ci-ancestor.md#completed-base-ci-ancestor).
**Source review:** [independent commitments](source-review.md).

## Goal and scope

Give a developer starting a session enough CI context to judge a running base:
retain the current notice and show the nearest completed ancestor's revision,
subject, outcome, and run link. A nearer failure takes precedence over an older
success. Missing evidence is stated within the existing readable-history bounds.
Preserve launch confirmation and all existing pass/fail/unread behavior.
No release, installation, or CI ownership change.

## Existing solutions and decisions

PFE: extend `baseCiNearest.ts`, which already matches selected-check attempts
to the origin target's commit listing, and the existing `BaseCiFound` response
and `LaunchBaseCi` dialog. Both GitHub Actions and command adapters consume this
judgment. The CI observer's ancestry machinery owns execution coverage, a
different responsibility; do not reuse its ownership or persistence.

[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
requires observation without workflow ownership and truthful missing evidence.
No new architectural decision or North Star direction is needed.

## Ordered slices

### 1. Completed ancestor context beside a running base check
Type: Behavior
Status: done
Proof: extend the existing Playwright base-CI launch journeys for completed
success, nearer failure over older success, missing completed history, and
command-adapter parity. Run `npm run test:dashboard -- agent-launch-base-ci`
and `npm run typecheck:dashboard` from the owned checkout.

Running nearest check → open launch confirmation → current status remains;
nearest completed ancestor, outcome and link appear; Continue retains the
existing acceptance behavior. Use a discriminating failing assertion before
implementation. Include focused contract proof if needed for newest-attempt
selection without duplicating the browser journey.

Follow [the failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).

## Premises and proof ownership

- In this checkout a direct `judgeNearest` invocation with a running revision
  followed by a completed failing ancestor returned only the running judgment:
  `{"state":"running","revision":"running","subject":"Running","laterWithoutResult":0}`.
  This observes the reported missing information at its consuming operation.
- `npx playwright test --config dashboard/playwright.config.ts agent-launch-base-ci --list`
  completed successfully here; the existing launch specs supply the available
  outside-in route. Setup completed with `npm ci --no-audit --no-fund` and
  `npm run typecheck:dashboard`.
- The implementation agent owns assertions and terminal results for the
  completed-history examples and existing launch choices; the coordinator
  accepts proof, obtains independent refactoring, and owns publication/CI.

## Execution identity

Story Branch Mode; created checkout `/Users/terryyin/git/open-dough-base-ci-ancestor`
on `codex/completed-base-ci-ancestor`, originating/integration checkout
`/Users/terryyin/git/open-dough`. Starting revision
`a2b40da65fe4b5b317171240991c26a080244b9e`; accepted claim
`391eceb34a225fcb6f6dc5b25d2979d66c07cb55` on `origin/main`.
Execution increments target `origin/refs/heads/codex/completed-base-ci-ancestor`.

## Concern evidence

Refinement not needed: one Behavior slice and one existing judgment/display
model deliver the requested outcome. No remaining slice-specific concern.

## Accepted implementation proof

- `npm run typecheck:dashboard` passed in the owned checkout.
- `env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- agent-launch-base-ci --workers=1`
  passed all 13 selected journeys. Browser assertions observe running status,
  nearest completed revision/subject/outcome/link, newer completed attempt with
  pending rerun, nearer failure over older success, missing-history text,
  command-adapter parity, and unchanged Back/Continue/launch behavior.
- The Actions history tests construct a real merge: the sibling is reachable
  from the target but not from the running revision. Bypassing ancestry
  filtering failed the expected-completed-ancestor assertion; the original
  implementation was restored. Initial browser proof also failed before
  implementation because the supplemental context was absent.
- Inspected setup and assertions: `agent-launch-base-ci-completed-history.spec.ts`,
  `agent-launch-base-ci-adapter.spec.ts`, and existing
  `agent-launch-base-ci.spec.ts`; parent fields come from the real Git fixture
  through `support/baseCiActions.ts`. Consumer trace with every disposition is
  `/tmp/open-dough-base-ci-consumers-reviewed.md`. Runtime response/schema,
  dialog, and confirmation consumers are covered by the same journeys; default
  fixture consumers omit optional parents and preserve their existing shape.
- Verification ran on the local 48 GB host at load around 15, one worker to
  leave room for neighboring work. No additional owned heavy proof overlaps.
  Reconsider concurrency if failures or load invalidate that basis.

## Execution complete

Product advice: no change. The aggregate implementation at
`0238fde1889578b24245d733726c5139eae71147` fulfills the source commitments and
keeps the existing launch judgment and confirmation model. Relevant Accepted
ADR 0008 remains satisfied. Completed-history E2E scenarios protect the new
visible behavior through real response and dialog integration; existing launch
and unread scenarios remain covered. Independent refactoring consolidated the
completed-outcome rule and split history/unread proof into cohesive files;
its rerun passed the same 13 journeys and typecheck. No bounded correction or
product follow-up is needed. The claim is provenance; only this execution's
implementation commit is attributed, excluding concurrent trunk work.

Process review was enabled by project configuration and used this conversation's
actual tool history. One occurrence of existing ODF-264 was recorded in
`DearDough.md`: broad reference and consumer-record reads were truncated and
required targeted retrieval. The accepted log is 736 lines (500-line warning,
within the 1,000-line ceiling); no retention or unrelated maintenance occurred.
No new process code was allocated. Applicable branch CI remains pending at this
review; the coordinator owns its completion operation and later trunk evidence.

## CI repair: fixture Git identity

Run `41287614698`, attempt 1, dashboard shard 3/12 failed at the new sibling
`commit-tree`: the bare fixture had no explicit author, while local Git could
infer one. The repair supplies the established `Dashboard Developer` /
`developer@example.test` identity to both commit-tree calls, using per-command
`-c` arguments; no machine configuration or product behavior changes.

Red: `env -u FORCE_COLOR -u NO_COLOR GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=user.useConfigOnly GIT_CONFIG_VALUE_0=true OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/open-dough-base-ci-identity-no-fallback-red.json npm run test:dashboard -- agent-launch-base-ci-completed-history.spec.ts --grep 'nearest completed failure' --workers=1`
selected one journey and failed with `Author identity unknown`.

Green: `env -u FORCE_COLOR -u NO_COLOR GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=user.useConfigOnly GIT_CONFIG_VALUE_0=true OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/open-dough-base-ci-identity-green.json npm run test:dashboard -- agent-launch-base-ci-completed-history.spec.ts --workers=1`
passed all three completed-history journeys with the same assertions.
`npm run typecheck:dashboard` and `git diff --check` also passed. Independent
refactoring found no further edit; unaffected source commitments, product
review, and the remaining 10 launch journeys retain their accepted proof.
The repair's consumer trace is `/tmp/open-dough-base-ci-identity-consumers.md`.
CI remains owned through the applicable repaired revision.
