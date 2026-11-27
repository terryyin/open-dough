# Remove leftover unbound recovery and overlapping story-linked session tests

**Identity:** SEED-447#clean-up-story-linked-session-tests
**Source:** [Remove leftover unbound recovery and overlapping story-linked session tests](../../seeds/SEED-447-clean-up-story-linked-session-tests.md#clean-up-story-linked-session-tests)

## Provenance and findings

This is a bounded retrospective correction of
SEED-439#complete-story-linked-ad-hoc-sessions. It covers that story's net
dashboard and E2E change `2b69bc19f..12753fa10`, which closed on
2026-11-26. On 2026-11-27, Terry asked for a review of dead code, test
overlap, test speed and shotgun surgery. He then chose this single
correction for findings 1–4. Finding 5 was the retention-dated historical
landing, follow-up and feedback branches. It was removed separately, before
this plan, at Terry's request, and is not in scope here.

Each finding below was rechecked on trunk at `dd230d271`. Specs the later
Vitest migration removed are not listed.

1. **Dead production chain.**
   - `dashboard/server/unboundLaunchRecovery.ts`.
   - `claudeSessionInWorkspace` in `hosts/claude/verification.ts`.
   - The `unboundRecovery` flag in `src/launchOutcome.ts`,
     `src/launchAttemptSelection.ts` and `src/startupRecoveries.ts`.
   - The `withUnboundRecovery` call in `agentLaunches.ts`.
   - The `recoveredSession` path in `launchAttemptAdmit.ts` and
     `launchAttemptContinuation.ts`.
   - The unbound workspace fallback in `terminalAdmission.ts`.

   Recovery needs an open Claude record with no story.
   `launchRun.ts` refuses to write one. A read-only check of the live store
   on 2026-11-27 found 1,573 records and 1,594 attempts. Only one record had
   no story, and it closed on 2026-11-09. None of the four candidate attempts
   had a matching open record.

   The chain's tests and support go with it:
   - `agent-launch-unbound-continuation` in backend-tests and in e2e;
   - `test-support/historicalClaudeRecovery.ts`;
   - the parts of `test-support/responsiveRecovery.ts` that only those
     tests use.

   `dashboard/backend-tests/launches/followUpBoundaryCases.ts` is not
   imported anywhere. Four comments still describe "standalone" sessions:
   - `src/StoryCardDoneSessions.tsx:5`
   - `src/followUpContext.ts:200`
   - `server/unattachedInput.ts:8`
   - `src/feedbackMaintenanceDue.ts:66`
2. **Decision matrices proven through servers and real Git.**
   - The landing refusal dimensions are spread across three places:
     - `backend-tests/server/retainedLandingDecision.spec.ts`, a pure
       `decideLanding` test;
     - `launches/declared-worktree-publication.spec.ts`, with real Git, a
       `vi.stubEnv("HOME")` environment mount and an in-file "v0.3.113"
       rewrite;
     - `launches/agent-launch-start-session-landing-policy.spec.ts`, about
       2.7 s per test on CI. Its auto-land capture repeats
       `e2e/launches/agent-launch-start-session-landing-context.spec.ts`.
       What it adds is the foreign `.git` handoff refusal and the
       `--outcome unfinished` report.
   - `launches/feedback-maintenance-admission.spec.ts` (2.5 s) repeats
     "claim reaches origin before the native session". Its distinct fact is
     that the maintenance start carries `maintenance.due` and its
     `storyIdentity`.
   - `sessions/admitted-session-no-change-completion` and
     `-shared-checkout-completion` (3.7–5 s per test) and
     `e2e/sessions/admitted-session-completion` run the same completion
     harness. Their distinct facts:
     - the no-change range;
     - the second launch from one checkout;
     - the lost-evidence hold;
     - the fresh-clone Review.
3. **Per-host and repeated E2E journeys.**
   - The default ad hoc start, with the story admitted, the session shown on
     the card and the title format, is repeated in:
     - `e2e/launches/agent-launch-ad-hoc.spec.ts`
     - `-ad-hoc-codex.spec.ts` (3 text variants)
     - `-ad-hoc-cursor.spec.ts` (2 variants)
   - Attachments are repeated in `-attachments`, `-attachments-cursor`,
     `-attachments-codex` and `-attachments-continuation`.
   - `responsive-session-start` and `-start-codex` both check the
     "Admitting a story." acceptance.
   - Four specs set up the same retained ad hoc completed story:
     - `e2e/sessions/recently-done-sessions-select-ad-hoc{,-review,-development}`
     - `-review-cue-ad-hoc`

     Each overrides the test timeout (90–120 s).
   - Two follow-up journeys can move down to a mounted test:
     - `agent-launch-follow-up-taken-card`;
     - the pair in `agent-launch-follow-up-session` that differs only by
       "workspace gone" vs "terminal open".
   - The "Ad hoc work — <date>" and "Admitting a story." wording is asserted
     in 5–7 E2E files.
4. **Shotgun surgery in test support.**
   - About 30 E2E specs rebuilt by hand the path to a session on its story
     card (`storyCard → showColumn → expandStoryCardDoneHistory`).
     `support/sessionFollowUpPage.ts` `showDoneHistory` copies
     `expandStoryCardDoneHistory`.
   - About 20 specs open an installed Board through three entry points:
     - `openBacklog(page, …, true)` in 13 files;
     - `openCatalogLaunchBoard` in 8;
     - `openCodexLaunchBoard`, an alias, in 3.
   - The record-on-a-published-story setup is repeated:
     - `publishRetainedProjectStory` in 5 files;
     - `takenStoryFiles` in 7;
     - `publishRevision` and `publishCommittedFiles` in launch specs.
   - The "Taken story:" prompt line is checked by splitting the prompt by
     hand in specs, next to `expectAdHocReportingInput`.

## Goal and boundaries

Each story-linked session behavior is proven once, at the cheapest level
that observes it. Each recurring test arrangement has one owner, and the
unbound recovery code is gone. Product behavior, wording and every distinct
assertion below stay. Removing a test requires naming the surviving case
that keeps its behavior.

Excluded:
- Finding 5's retention-dated branches, which are already removed.
- Specs that queued SEED-413 stories still own for their Vitest migration.
  Unchanged specs are left to their owners; only cases this plan's slices
  name are trimmed.
- New CI jobs or shard changes.

Preserved behaviors:
- Story admission before native dispatch, once per start kind (default,
  scheduled, follow-up), at one host.
- Each host's own behavior: Codex thread creation, Cursor create-chat and
  blank-model refusal, Claude attach.
- The landing refusal dimensions: identity, origin, remote, target, host,
  authority fields and deleted declaration.
- The foreign `.git` handoff refusal and the unfinished report.
- The completion facts listed in finding 2.
- One browser journey that reads published ranges from a fresh clone.

## Direction and current decisions

- [Plain Vitest for unit tests, Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e),
  [make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  govern every slice. Apply [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md)
  and [`dough-page-objects`](../../../.agents/skills/dough-page-objects/SKILL.md)
  before changing tests.
- Tests are examples of independent concerns, not a matrix covering every
  combination. A host or workspace repeat survives only for behavior that
  depends on that host or workspace.
- Unit cases target about 100 ms each. Measure E2E and backend cost
  relatively, from CI per-test times. The baseline is the CI run on this
  plan's execution base, read from the Playwright report artifacts. The
  reviewed reference is run 45768101743: 145 touched E2E tests averaged
  7.1 s and 111 touched backend tests averaged 1.9 s.
- No `test.slow()`. Keep the default timeout. Slice 5 removes the four
  `setTimeout` overrides unless one is shown to be essential.
- Order relative to [plan 876](../876-open-session-changes-in-intent/PLAN.md):
  this correction is queued first. Its slice 3 trims
  `e2e/sessions/admitted-session-completion.spec.ts`, which plan 876's
  slice 5 later points at Intent. If plan 876 executes first, slice 3
  rebases onto its Intent version instead.
- Failures follow the shared
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written. Carry it by link into every delegation brief and repair
  handoff.
- Local gate: Dashboard typecheck, plus each slice's focused selection
  through `scripts/test.sh <files>` or `npm run test:dashboard:backend --` /
  `npm run test:dashboard:frontend --`. Run full local suites only before
  landing shared test-support changes (slices 6–8). Use Homebrew bash 5
  under `caffeinate -s -i` from a fully awake machine on AC power.

## Decisive premises

| Consuming operation | Observation and result | Remaining proof |
| --- | --- | --- |
| Slice 1 deletes unbound recovery | Read-only live-store check on 2026-11-27: only one record has no story; it is closed (`doneAt` 2026-11-09). No candidate attempt has a matching open record. `launchRun.ts` refuses new records with no story. | Repeat the check at execution; stop and ask if an open record with no story appears. |
| Slice 1 deletes `followUpBoundaryCases.ts` | `git grep` at `dd230d271` finds no importer. | None. |
| Slice 4 removes E2E input and wording variants | At `dd230d271`, `backend-tests/launches/ad-hoc-start-labels.spec.ts` and `agent-launch-model-boundary.spec.ts` assert the "Ad hoc work" title. `frontend-tests/launches/responsive-unattached-startup.spec.ts` covers the mounted admission states. The Codex E2E repeats text, blank and whitespace input (`agent-launch-ad-hoc-codex.spec.ts:54`); the Cursor E2E repeats blank and text input (`-cursor.spec.ts:42`). | Before removing each variant, name its surviving lower-level case, or add one. |
| Slices 6–8 owners | `dashboardParts.ts` already exports `doneSessionEntriesOf` / `shownDoneSessionEntriesOf`, used by 25 E2E specs. `expandStoryCardDoneHistory` is used by 10 files and `showDoneHistory` by 6. | Slice 6 routes the remaining hand-built paths through them. |

## Ordered slices

### 1. Retire unbound Claude recovery
Type: Structure
Status: done
Proof: Dashboard typecheck. `git grep -w -E 'unboundRecovery|withUnboundRecovery|claudeSessionInWorkspace|keepHistoricalClaudeStart'`
returns nothing. The startup recovery, launch attempt continuation and
terminal admission selections pass, as does one E2E startup recovery
journey.

Delete everything finding 1 lists, along with its tests and support, plus
`followUpBoundaryCases.ts`. Reword the four stale comments. A
non-recoverable attempt keeps its existing Startup recovery outcome. Enables
slice 2 by leaving only story-bound landing and continuation paths.

Evidence (2026-11-27):
- The premise was rechecked read-only and held. The store had 1,578 records,
  and the only one with no story was closed. Of 1,598 attempts, 3 qualified,
  and none of them had a matching open record.
- The `onRecovered` callback and the `presentTerminal` prop of Startup
  recovery are removed with `recoveredSession`.
- `feedbackMaintenanceDue.ts:66` had no stale text left (`8f6a3bcdc`).
- Proof passed:
  - typecheck;
  - the grep, which finds nothing outside this plan;
  - 4 frontend startup-recovery specs;
  - 14 backend continuation, terminal-admission and attempt-selection specs;
  - the E2E startup-recovery and continuation journeys.
- Two tests flaked under load 20–33, and both also flake on the base:
  - `agent-launch-preparation-continuation-refusal.spec.ts:163`, which hits
    its 5 s timeout;
  - `agent-launch-ad-hoc-attachments-continuation.spec.ts:29`, which stays
    on "Admitting a story.".

  Both are repaired. The backend case is split so that each test body runs
  one real start; it passed 5 of 5 at load 14–21. The E2E case waits on the
  page's "Startup needs reconciliation" within `launchWaitMs`, instead of a
  5 s API poll; it passed 5 of 5 at load 22–30.
- E2E specs run through `npm run test:e2e -- <files>`, because
  `scripts/test.sh` refuses `.ts` files.

### 2. Prove landing refusals in one typed table
Type: Structure
Status: done
Proof: `retainedLandingDecision.spec.ts` covers every refusal dimension and
runs each case in about 100 ms. `declared-worktree-publication.spec.ts` and
`agent-launch-start-session-landing-policy.spec.ts` keep one wiring refusal
each, plus the foreign `.git` handoff and the unfinished report. The
`HOME` stub and the in-file version rewrite are gone. CI time for the three
files drops against the baseline.

Move the refusal dimensions into the `decideLanding` table. Pass the kept
record and declaration as typed inputs instead of mounting `HOME`. Drop the
auto-land capture that the E2E `landing-context` spec already proves.

Evidence (2026-11-27):
- The `decideLanding` table now has 15 cases, each taking 0–5 ms. Each
  authority dimension is a typed record change.
- A positive control showed that the old base record lacked `defaultStart`,
  so every older case failed for that reason and not its own. The record is
  fixed.
- A break check that removed the identity check failed only the identity
  case.
- `declared-worktree-publication.spec.ts` keeps:
  - one wrong-tip wiring refusal;
  - the trunk-revision mismatch, which is Git-backed;
  - the foreign-reference refusal and the publish/retry flow.
- `landing-policy` drops the auto-land capture, which the E2E
  `landing-context` spec proves, and keeps managed delivery with the foreign
  `.git` refusal and the unfinished report.
- Trunk's SEED-423 change (`04ab52101`) then extended that auto-land case to
  read the handoff from Dashboard records with the launches file parked. The
  trunk merge `befa92936` keeps it as that sibling's distinct proof.
- Local times, at load 14 then 7–18:
  - `landing-policy`: 12.8 s → 2.9 s;
  - `declared-worktree-publication`: 0.9 s → 0.7 s.
- Baseline CI (run 45961498530): 11.3 s and 1.1 s.
- The scratch `HOME` stays only in the shared wiring support
  (`doneCaptureCase.ts`). There, the installed publication script and the
  machine attempt store run for real. See G1.

### 3. Prove each admitted-session fact once
Type: Structure
Status: done
Proof: `feedback-maintenance-admission` asserts only that the scheduled
start carries its due date and story identity. The two backend completion
specs keep only the no-change range, the second launch from one checkout
and the lost-evidence hold. `e2e/sessions/admitted-session-completion`
keeps the borrowed checkout state and the fresh-clone Review, through one
server. Every finding 2 fact appears in exactly one surviving case, and the
selection's CI time drops.

Evidence (2026-11-27):
- Reconciled with trunk's SEED-423 `972db9e53`, which adopts admitted ranges
  from retained landings and whose assertions are all kept.
- `feedback-maintenance-admission` asserts only `maintenance.due` and
  `storyIdentity`. The claim-before-native-session fact survives in
  `admitted-session-start.spec.ts`, in "dispatches nothing while its
  admission is held".
- The no-change spec keeps:
  - the no-change range;
  - the cleared `first-landing-expectation.json`.

  The `--outcome completed` report survives in
  `agent-completion-identity.spec.ts:84`.
- The shared-checkout spec keeps:
  - the second launch from one checkout;
  - the later range's shared-checkout uncertainty;
  - the lost-evidence holds (retained landing missing or mismatched).

  The landing retry survives in `declared-worktree-publication.spec.ts`.
- The E2E spec keeps the borrowed checkout state and the fresh-clone Review.
  Its Intent closure-revision check survives in
  `e2e/intent/intent-story-completed.spec.ts:86`.
- Local selection time before the merge, at load 20–34:
  - backend 28.7 s → 19.5 s;
  - E2E 27.0 s → 13.4 s.
- Repaired: the shared-checkout second-launch case ran about 29.6 s at load
  about 30, against its 30 s bound. Its later closure, which took about 7 s,
  only proved the later range's uncertainty. That fact now has its own
  one-launch case, which writes the shared-checkout note directly. The note
  writing itself is proved in `shared-checkout-note.spec.ts`. The cases now
  run 9–14 s of 30 s and 6–10 s of 20 s, 5 of 5 at load 19–22. See G2 for
  the server count.
- CI `dashboard-frontend` failed on `1442aa439` with
  `VITEST_BROWSER_CONNECTION_CLOSED`. That is the trunk defect owned by
  SEED-413#keep-full-frontend-runs-connected (plan 881, in progress), and
  main fails the same way. This branch takes that fix by merging trunk.

### 4. Keep one admitted Start journey and host-specific E2E only
Type: Structure
Status: planned
Proof: one Claude default-start journey proves admission, the card
session and the title. Codex and Cursor specs keep only their host behavior.
Attachments keep one journey plus each host's distinct delivery. The
responsive Start keeps one host. Before an E2E variant is removed, its
input variants (blank, whitespace, text) and wording are shown in backend
or mounted tests, adding a mounted case where one is missing. E2E case
count and CI time for the touched files drop.

### 5. Merge the retained ad hoc story journeys and push follow-up availability down
Type: Structure
Status: planned
Proof: the four `recently-done-sessions-*ad-hoc*` specs become at most two
with the default timeout, keeping each distinct selection, review and
development observation. `agent-launch-follow-up-taken-card` and the
workspace-gone vs terminal-open pair in `agent-launch-follow-up-session`
become mounted cases plus at most one E2E follow-up journey. CI time
drops against the baseline.

### 6. Read session placement through one owner
Type: Structure
Status: planned
Proof: no spec builds the `storyCard → showColumn → expandStoryCardDoneHistory`
path by hand. Specs use the `dashboardParts.ts` readers (active and done),
and `showDoneHistory` is gone. The touched E2E files pass, and the full E2E
suite passes locally before landing.

### 7. Open an installed Board and read the reporting input through one owner each
Type: Structure
Status: planned
Proof: one fixture step opens an installed Board, replacing
`openBacklog(…, true)`, `openCatalogLaunchBoard` and
`openCodexLaunchBoard`. The "Taken story:" line is asserted only through
`expectAdHocReportingInput`. The touched E2E files pass, and the full E2E
suite passes locally before landing.

### 8. Arrange records on a published story through MakeMe
Type: Structure
Status: planned
Proof: one MakeMe builder step arranges a launch record on a published
story, for example `aLaunchRecord.onStory(...)`. Another arranges an
origin with a Taken story. Together they replace
`publishRetainedProjectStory`, `takenStoryFiles`, and the ad hoc
`publishRevision` / `publishCommittedFiles` story setup in specs. Specs
import fewer support modules. Full backend and E2E suites pass locally
before landing.

## Concern evidence

Refinement was not needed: each slice is one structural correction with its
own proof, and there are eight slices, at the limit. The original slice 6
combined three independent owners, so it was split into slices 6 and 7. No slice-specific
concern remains.

Interim behavior: none. Each slice keeps every preserved behavior when it
lands.

## Story obligations

### G1. Wiring specs keep a scratch HOME for installed publication
Reported: slice 2 — "Three other things still use the stubbed `HOME`"
Story clause: "move landing-refusal and follow-up decision matrices into typed unit tables, keeping one wiring case per integration spec"
Disposition: no user cost "keep each story-linked session behavior proven once, at the cheapest level that observes it": the refusal matrix now runs in the typed `decideLanding` table without any environment mount. The remaining scratch `HOME` isolates the real installed publication script and the machine attempt store in the kept wiring cases. Dropping it would write to the developer's real home, and removing it would change production signatures outside this correction's scope.

### G2. Admitted-session E2E still starts two servers
Reported: slice 3 — "the E2E spec started 2 dashboard servers before this slice (the preparation `dashboard` fixture plus the `openFreshClone` reader) and still starts 2"
Story clause: "keep each story-linked session behavior proven once, at the cheapest level that observes it"
Disposition: no user cost "keep each story-linked session behavior proven once, at the cheapest level that observes it": the fresh-clone Review needs its own reader server, and the journey is the only one that proves it. Each of its facts is still proven once. One server would mean admitting in process inside the Playwright worker, a fixture redesign that would add no proof.
