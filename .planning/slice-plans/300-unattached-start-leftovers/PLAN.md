# Leave nothing behind after an unattached start

**Identity:** SEED-066#unattached-start-leftovers
**Source:** [correction story](../../seeds/SEED-066-composable-lightweight-session-options.md#unattached-start-leftovers),
from the execution retrospective of SEED-066#unattached-session-options (its
story and plan are at `5a971a91`:
`.planning/seeds/SEED-066-composable-lightweight-session-options.md` and
`.planning/slice-plans/298-unattached-session-options/PLAN.md`;
commits `0601f38b`, `01743f09`, `b78790cd`, `4a9bd745`, `e5e26130`,
`eabbe51c`, `b1f662b7` on `claude/choose-workspace-and-automatic-landing-for-unatt`).
This preparation grants no Take or execution authority.

## Goal and scope

A developer whose Isolated workspace start succeeded but whose native session
failed to start knows which workspace and branch remain and can resume that
established start. Kept start records expire with their attempts. The correction
also removes the delivered story's unused session fact, obsolete explanation,
and duplicated proof while preserving its product promises.

Included: the four findings below. Deferred: deleting a worktree that never
lands, showing a landed run, and paid native-host observation. The last belongs
to SEED-066#unattached-session-native-observation; this correction does not claim
that observation passed. Record pruning removes machine evidence, not Git
worktrees or branches.

Preserve the reviewed story's workspace and landing choices, default-main
change confirmation, request matching, handoff, and landing capture. A refusal
before a workspace exists keeps nothing. An expired unattached start can still
resume its kept workspace; a live worker is never duplicated. Story starts keep
the slow-warning, automatic progress, receipt-recording checkpoint, liveness,
and own-record reconciliation delivered by SEED-130, now documented in
`dashboard/AGENT-LAUNCH-STARTUP.md`.

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

## Existing solutions and architecture

PFE selects changes to existing owners:

- `sessionStartStore.ts`, using `keptStarts.ts` and `machineJsonStore.ts`, owns
  the attempt's kept unattached establishment. `unattachedStarted` already
  reuses a kept session without rerunning its script. Extend that lifetime and
  its failure wording rather than creating another workspace registry.
- `LaunchAttemptOwner` and `launchAttemptContinuation.ts` own admission and
  locked continuation. `launchAttemptSelection.ts` owns recovery eligibility;
  `startupRecoveries.ts`, Start request handling, and the recovery UI consume
  it. Carry the necessary establishment evidence through the existing attempt
  contract so Continue and an identical Start retry recover the same attempt.
  Keep a definite refusal definite; recovery eligibility does not mean a native
  session might exist. Existing unconfirmed-input recovery retains its meaning.
- `replaceAttempts` owns retention and machine write serialization. Remove only
  the start keys belonging to attempts actually pruned by a successful write,
  across their project IDs; retain current, unsettled, and other-project starts.
  Reuse `removeSessionStart` and the existing recording/locking discipline.
  A refused write that leaves the attempt document unchanged must not prune
  its starts. Keep the existing lock ordering and late-result behavior.
- `launch-workspace.spec.ts`, `agent-launch-matching-rules.spec.ts`, and the
  existing launch/page fixtures already own the rule variations and real-start
  seams. Extend these rather than add a parallel harness.

This follows [North Star: Agent launch as a requested assignment and A start
establishes claim and workspace before the session](../../NORTH-STAR.md),
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one representation per responsibility),
[ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(shared deterministic rules once, distinct adapter purposes retained, native
acceptance separate), and
[ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one shared runtime source). No new direction topic, ADR change, or exception
is needed. Any necessary payload guidance edit belongs in `src/skills/`, never
in this repository's installed managed copies.

## Key examples and outside-in proof ownership

| Promise / example | Owning slice and observable proof |
| --- | --- |
| Isolated Start establishes `claude/session`; native launch refuses → the answer names workspace, branch, nothing published, and retained continuation; Continue or identical Start later opens there with one start and one worktree | Slice 1: extend the raw launch boundary in `agent-launch-start-session-kept.spec.ts`; include the page's recovery/Start selection in `agent-launch-start-session-recovery.spec.ts` |
| The installed formatter cannot be read after establishment → no native call; repairing it lets the retained attempt resume its established session | Slice 1: extend the existing formatter case in `agent-launch-start-session-stops.spec.ts` and observe the kept record plus successful retry |
| An expired unattached start finishes and remains uncontinued; its settled attempt passes retention and is pruned → its kept start disappears, other retained starts survive, Git worktree remains | Slice 2: kept-start retention case using `landingRetentionClock` and `dropExpiredAttempts`; cover a refused/non-pruning write at the store boundary |
| A start refused before establishment keeps nothing; expired or unconfirmed-input starts recover without duplicate work; live workers and story continuations retain their rules | Slices 1–2: existing kept, recovery, own-record continuation, and worker boundary cases |
| Session handoff and older machine records remain usable after removing session `created`; prepared receipt ownership information remains available | Slice 3: update shared session expectations, exercise parsing an older record, and retain the prepared-start script tests |
| A resumed workspace may be handed to the current source start through a symlink; older installed starts still receive the compatibility conversion | Slice 3: existing symbolic-link start case and the maintained explanation in `LAUNCH-START.md` and the helper comment |
| Each Start session rule retains one discriminating owner and affected external behavior remains green with less repeated harness work | Slice 4: ownership table below, before/after measurement with the same runner and workers, and surviving launch checks |

## Ordered slices

### 1. A failed established launch tells the developer where to resume
Type: Behavior
Status: planned
Proof: kept, stops, recovery, request-matching, and own-record continuation cases;
assert the answer, retained attempt/session, successful retry, start call count,
worktree count, and unchanged origin.

Behavior: an isolated unattached start establishes its workspace, then native
launch or formatting fails → the developer sees the established workspace and
branch and can resume it with Continue or the same Start request. A recovered
session consumes the original workspace, landing choice, and handoff; successful
launch removes its spent kept start. Different choices keep their existing
matching behavior. Keep failure explanation, retained evidence, selector,
admission/continuation, UI, and maintained documentation coherent in this slice.

Safe stopping point: the failed start is recoverable; age-based record cleanup
and proof deduplication can follow independently.

### 2. Kept unattached records expire with their attempts
Type: Behavior
Status: planned
Proof: extend the kept-start boundary with the real start, advance its isolated
clock 31 days, invoke the real retention write, and inspect both stores and Git;
retain unexpired/unsettled and other-project controls. Cover a write refusal
without treating filtered-but-unwritten attempts as pruned. Run the existing
landing-retention journey because it consumes the same attempt store.

Behavior: retention successfully removes an attempt that still keeps an
unattached start → only that attempt's kept start is removed. A still-running
script cannot recreate a removed start when its late answer arrives. No Git
worktree or branch is removed, and retained reporting/landing records keep
existing lifetimes.

Safe stopping point: record retention is coherent; residue and repeated tests
remain harmless unfinished correction work.

### 3. Session establishment carries only consumed facts
Type: Structure
Status: planned
Proof: all Start session specs using the shared session fixture, an older-record
parser case, dashboard typecheck, and `established-session-start.test.mjs`.

Change: remove the unused established-session `created` producer, schema member,
and fixture expectations together. Keep the prepared receipt's `created` and
workspace creation records: those serve other workflows. Describe the real-path
conversion in its helper and `LAUNCH-START.md` as compatibility for older
installations, with its release-dependent removal condition. This directly
owns finding 3 while preserving session establishment and recovery behavior.

Safe stopping point: the representation and maintained explanation agree with
current behavior; repeated proof can be reduced next.

### 4. Start session rules have one sufficient proof owner
Type: Structure
Status: planned
Proof: preserve the ownership below, demonstrate that retained rule tests fail
when their rule is disabled, run the surviving affected suites, and compare the
same selection's aggregate test time before and after. No speedup claim is
accepted without a comparable pre-change baseline.

Change: remove equivalent slow-harness repetitions and move their data
variations to existing rule tests. Keep distinct consuming purposes rather than
remove a case because its title sounds similar. This directly owns finding 4;
production behavior remains unchanged.

| Rule | Retained owner / boundary |
| --- | --- |
| Workspace and landing participate in request identity | `agent-launch-matching-rules.spec.ts` for both axes; one pending-Isolated journey with its same-choices recovery tail |
| Blank-session slug and collisions | `launch-workspace.spec.ts`, including `slugOf(title, "session")`; one real isolated creation journey |
| Expired, failed, and interrupted start recovery | The kept and recovery journeys, including slices 1–2; distinct restart and unconfirmed-input boundaries remain |
| Existing default-main changes and independent landing selection | One warning/Back/Cancel/Continue page journey, the automatic-landing line, isolated skip, and shared boundary confirmation case |
| Default choices run no establishment | Existing ad hoc launch journey with a no-start assertion |
| Launch-bound landing capture | One real unattached capture, unavailable-installation refusal, and retained-after-attempt-expiry journey; shared capture variations stay with their existing landing suite |
| Unavailable choices and accessible controls | One capability boundary case; responsive layout retains reachability/visibility purposes |
| Native adapters and tracked worker lifetime | Existing host boundary suites and SEED-130 warning/continuation cases; these distinct purposes are not duplicates of shared rules |

Before editing tests, obtain the baseline in this checkout using the selected
Node, production build, identical worker count, and a temporary timing reporter.
Include retained tracked warning/continuation cases when judging their timing;
do not resurrect the superseded timeout policy. If a planned removal lacks a
sufficient discriminating owner, retain it or add that proof in the same slice.

Safe stopping point: every correction promise has accepted proof; execution can
proceed to its ordinary retrospective and wrap-up.

## Verification and sizing

Each slice has one cohesive outcome and proof loop. No numeric slice target or
hard limit was supplied; no timing-policy exception is needed. Keep required
independent refactoring and delivery under the project's execute-plan workflow.
Before checks, use `tests/native-setup.md` and its exact `.node-version`.

Use `npm run test:dashboard -- <affected specs> --workers=3` for focused boundary
proof. Slice 3 changes a fixture consumed across the Start session suite, so run
`npm run test:dashboard -- dashboard/tests/agent-launch-start-session- --workers=3`
and `npm run typecheck:dashboard`. For slice 4, run the surviving Start session,
request-matching, workspace, ad hoc, and affected one-shot/landing/continuation
suites; broaden from actual consumers rather than every dashboard test. Hosted
CI remains independent and is not an extra local all-suite gate.

## Current decisions

- A failed established start is retained for reuse; pruning removes records,
  and leftover-worktree deletion remains deferred.
- Shared gates get shared rule proof; adapter and UI purposes retain their own
  evidence. Missing native acceptance remains in its separate story.
- Slice refinement split the old slice 2: retention and unused-fact cleanup have
  independent outcomes. The resulting plan has four slices and no resplit or
  sizing-exception recommendation.
- SEED-130 already replaced the tracked continuation timeout design. Extend its
  owners and preserve its journeys rather than reimplement that work.

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

## Learnings

- A kept start alone cannot make a failed/none attempt resumable. Failure
  settlement, shared recovery eligibility, and identical Start retry selection
  must agree on the retained establishment.
- Updating to `f9bd9a97` did not resolve either leftover defect. It did resolve
  the retrospective's tracked-start timeout concern, so that implementation
  work was removed from the remaining plan without dropping its behavior proof.
