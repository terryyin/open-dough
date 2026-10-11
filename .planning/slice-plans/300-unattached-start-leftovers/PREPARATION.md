# Unattached-start correction preparation evidence

Historical pre-change evidence for [the active correction plan](PLAN.md).

## Findings reconciled with current truth

The original retrospective read `8308056f`. Preparation reproduced the first
two findings in this workspace at `f9bd9a97`, after incorporating the completed
SEED-130 work from origin.

1. **An established unattached start is lost after native or formatter
   failure.** `launchRun.ts` appends establishment/recovery words only for
   story starts, and `settleSessionStart` removes every non-uncertain result.
   A native refusal can incidentally name its working directory, but it does
   not name the branch or say the established start was kept. Continue refuses
   the settled failed attempt, and the same Start again creates `session-2`.
   A formatter failure names the workspace and branch, but likewise loses its
   kept established session. Merely changing the removal condition is
   insufficient: `needsReconciliation`, attempt continuation, and matching
   Start requests must consume the recoverable establishment too.
2. **Attempt retention leaves its kept unattached start behind.**
   `launchAttemptStore.ts` prunes settled attempts after 30 days on a write,
   without removing their entries from `session-starts.json`. A real expired
   start, completed after its wait, remains in that file after its attempt is
   pruned. This is record retention, not authorization to delete its worktree.
3. **Interim residue.** The established session's `created` value has no
   production reader; its producer and schema retain it, and the shared
   `startSessionLanding.ts` fixture predicts it. The prepared start receipt
   has its own `created` contract and remains intact. `LAUNCH-START.md` and
   `unattachedStartScript.ts` describe real-path spelling as a current source
   requirement, although the source start now accepts an equivalent symlink.
   The dashboard conversion remains an allowance for older installations until
   a released payload supplies that comparison.
4. **Repeated Start session proof.** Runner selection finds 36 cases in 13
   Start session spec files. The retrospective identified repeated request
   identity, slug numbering, expiry wording, shared change confirmation,
   default-path, landing capture, and unavailable-choice checks. Retain distinct
   UI, shared rule, installed-script, and host-adapter purposes; move equivalent
   data variations to their existing rule owner. The retrospective's proposed
   changes to the two tracked continuation specs are already superseded by
   SEED-130's warning/automatic-progress journeys; preserve those journeys.

## Settled premises and observations

Named checkout for the observations:
`/Users/terryyin/git/open-dough/.worktrees/leave-nothing-behind-after-an-unattached-start`.
Scratch probes and mutations were removed before preparation recording.

- **Failure/reuse and pruning symptoms, at `f9bd9a97`.** Temporary cases reused
  `preparationPage`, a real `startOrigin`, recorded installed starts, the fake
  native refusal/formatter failure, and the isolated retention clock.
  `env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/unattached-leftovers-planning-probe.spec.ts --workers=3`
  reached all three consuming operations and failed on the intended missing
  behavior: native refusal retained zero starts, omitted the branch, refused
  Continue, and retried in `session-2`; formatter refusal retained zero starts
  despite an established worktree and made zero native calls; real pruning
  removed the attempt but retained its start and worktree. No production code
  was changed by these probes. Recreate these assertions as the slice-owned
  regressions; the temporary file is not a delivery artifact.
- **Current recovery and continuation route, at `f9bd9a97`.**
  `env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-session-kept.spec.ts dashboard/tests/agent-launch-start-session-stops.spec.ts dashboard/tests/agent-launch-own-record-continuation-race.spec.ts --workers=3`
  passed. This reaches refusal, expiry, unconfirmed input, and the current
  locked own-record continuation consumers; it does not prove the new fixes.
- **Session-fact consumer discrimination, at `79107af7`, reused because the
  producer/schema/fixture contract is unchanged at `f9bd9a97`.** With only
  session `created` emission disabled,
  `env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-session-isolated.spec.ts --grep 'creates one worktree' --workers=1`
  failed at the record comparison against the shared fixture, specifically on
  missing `created`. Restoring emission made the same command pass. The fixture
  must change with the representation; searching production consumers found
  no reader of session `created`.
- **Current source permits equivalent real paths.**
  `env -u FORCE_COLOR -u NO_COLOR node --test src/skills/dough-execute-plan/scripts/established-session-start.test.mjs`
  passed eight cases, including the symlink's actual start returning prepared,
  `created: false`, the original revision, and no second worktree. Its source
  is unchanged by SEED-130. This proves current source reuse, not installation
  of that source by a release.
- **Suite inventory, not a performance baseline.**
  `env -u FORCE_COLOR -u NO_COLOR node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-start-session- --list --reporter=list`
  selected 36 cases in 13 files. Actual before/after timing and retained-test
  discrimination belong to slice 4, before any test removal invalidates them.
