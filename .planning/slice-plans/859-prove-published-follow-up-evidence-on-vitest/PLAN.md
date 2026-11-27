# Prove published Follow up evidence in Node Vitest

**Source:** [Prove published Follow up evidence in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest)

**Identity:** SEED-413#prove-published-dashboard-reads-on-vitest

## Goal and scope

Give Dashboard maintainers fast backend proof that Follow up sends the
selected published comparison, file, line, and session facts, and that
Repeat and Continue preserve the admitted evidence. The six selected
Playwright specs contain 18 cases. Run their unit proofs in Node Vitest
through the existing production owners. Keep the Intent browser journeys
for selecting an actual Review target and seeing the received first input.

Board reads and refresh, Review creation and capture, and Intent source
reading have their own mapped plans below. Plan 850 owns generic retained
context and the other launch stories own notes, native host choice and
dispatch. This story checks the target evidence that enters those operations.

## Current decisions

- The existing typed path runs Start value admission, `withFollowUpContext`
  through `FollowUpContextInput`, kept request construction and
  `unattachedInput`. Use [the notes admission spec](../../../dashboard/backend-tests/launches/agent-launch-follow-up-notes-admission.spec.ts)
  for an observed example of that path. Use the [launch acceptance owner](../../../dashboard/server/agentLaunchAccept.ts)
  and persisted attempt records where matching, refusal before dispatch,
  or Continue is the outcome. Supply the project and private store paths.
  Control acceptance or receiving input at the host collaborator only.
- The same [historical comparison admission](../../../dashboard/server/storyReviewHistoricalFileAdmission.ts)
  serves Review and Follow up, and [file admission](../../../dashboard/server/followUpFileAdmission.ts)
  adds the line-side read. Reuse those operations and the published-session
  reader with kept records and a private fixture Git origin for ancestry,
  tree and text. Supply a typed published catalog answer only when observing
  context after that read, and observe the real record reader where
  ownership, join, range or fallback is the assertion. If the outer
  operation has incidental setup, expose its existing typed inputs at the
  production seam that owns the operation.
- Match source, story, comparison and evidence through the same chain.
  A completion, a captured landing and a published session range each
  supply their own authoritative comparison. Message composition uses the
  admitted target. Retrying reads the kept request. Avoid a separate
  resolver for the tests.
- Follow [Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads)
  by using the existing pins and Review repository. Follow
  [Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  through typed owners and MakeMe data. Apply
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  to any required browser proof adjustment. [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  keeps published Git evidence distinct from machine-local attempts.
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  keeps domain values direct across the wire and the server.

## Premises

| Consuming operation | Observation at `43b6506e7` in the preparation worktree | Consequence |
| --- | --- | --- |
| Maintained backend one-worker selection | The command below ran all six selected specs, with 18 first-attempt Chromium passes and zero Node cases. The proof record measured 50.65 s and shell wall time was 51.88 s. The 18 cases totalled 46.08 s and ranged from 1,768 to 4,717 ms. | Refresh the comparable baseline at the execution base if the paths or conditions changed. |
| Typed context and first-input construction | The one-worker backend run for `agent-launch-follow-up-notes-admission.spec.ts` reported seven passing Node cases, including Attach and unavailable notes with the first input composed from typed production values. | Use its typed entry and first-input observation. The slices own the Git-backed target and saved-attempt variants. |
| Whole landed pair is checked at Start | The selected mismatched-pair case passed in the full baseline. In scratch, bypassing only the landed pair check in `admitStoryComparison` made the same maintained case fail with 200 instead of 409. After restoration the case passed on the same one-worker selection. | Slice 1 keeps the admission observation and reproduces the failure under the replacement proof. |
| Browser selection reaches actual first input | The one-worker `e2e/intent/intent-story-follow-up.spec.ts` command below reached two Chromium journeys and both passed. Shell wall time was 16.20 s. | Both journeys stay as witnesses to browser-to-agent receipt. |

## Ordered slices

### 1. Admit the whole selected comparison

Type: Behavior
Status: done
Estimate: 11–14 active minutes.

Map the three `agent-launch-follow-up-landed-comparison-admission` cases
and the whole-target refusal in `agent-launch-follow-up-published-range-admission`.
Use a `PublishedSource`, the story, `FollowUpComparison`, and records for the
retained and published landing. Start returns admitted evidence with the exact
pair. A wrong baseline, tree, or foreign reference refuses with the existing
reason before acceptance or host invocation. Keep the whole-target browser receipt.

Delivered: the landed-comparison spec now runs four Node cases through
`acceptLaunchRequest`, `withFollowUpContext` and `admitStoryComparison` over a
private fixture origin; the range spec's whole-tree refusal moved into it.
Bypassing `requireLandedPair` failed only the mismatch case. The selection
ran 18 cases in 41.5 s (was 68.0 s); the four Node cases take 0.8–1.7 s each,
mostly fixture history and Review sync. Start reads the already-synced Review
repository, so tests sync it before Start. The shared receiving host lives in
`dashboard/backend-tests/support/receivingHost.ts`; move `aDoneStoryStart()`
beside it when slice 2 needs it.

CI repair (run 45913441426): fixture times fixed before the server's
real-clock 30-day retention window expired Done sessions and attempts; the
Done-listing, retained-history and settled-attempt specs now derive them
from the current clock.

### 2. Admit the file and line on the historical pair

Type: Behavior
Status: done
Estimate: 10–13 active minutes.

Map the accepted retained landing and the three target refusal cases in
`agent-launch-follow-up-file-admission`. Use `FollowUpFile` with literal
paths and old/new sides, a retained or completed comparison, and actual Git
file text. Start admits the retained file and rejects unlisted paths, an
out-of-range line, and a side without the named line. Observe no host calls
on rejection.

Delivered: two Node cases run file admission through `acceptLaunchRequest`,
`admitFollowUpFile` and `admitHistoricalReviewedFile`; disabling the
line-range check failed the refusal case. The two forged-context cases moved
unchanged to `agent-launch-follow-up-forged-context.spec.ts` for slice 7, and
the selection now names that file. The shared Start harness lives in
`dashboard/backend-tests/support/doneStoryStart.ts`. The gate ran 16 cases in
51.3 s; the Node cases take 1.1 and 2.8 s.

### 3. Admit the published session file range

Type: Behavior
Status: done
Estimate: 8–11 active minutes.

Move the file-range case in `agent-launch-follow-up-published-range-admission`.
Arrange a published session with multiple ordered ranges, exact paths and
owning story. The correct range keeps its path and endpoints in the input.
The existing wrong endpoints, path, and foreign story variants refuse before
any host receives input. Keep the real published record and Git histories.

Delivered: the range spec now runs one Node case over a real two-range
session record on the fixture origin, through `admitFollowUpFile` and
`admitPublishedSessionFile`; only the done-catalog answer is typed. Making
the range match ignore the baseline failed the wrong-endpoints refusal. The
gate ran 16 cases (7 Node) in 30.7 s.

### 4. Send the admitted file evidence in the first input

Type: Behavior
Status: done
Estimate: 10–14 active minutes.

Move the four content cases in `agent-launch-follow-up-file`. Observe the
message passed to the first-input builder for the renamed path and line,
the file-specific trunk-inclusive baseline, the widened incoming pair,
and the blank request's literal file. Assert framing and escaping where the
legacy test observes them. Use the same admitted target in the browser
old-line/file journeys.

Delivered: the four content cases run in Node and read the host's first
input. Relabelling the old-path line failed the renamed case, and admitting
a trunk-inclusive file against the review baseline failed the
trunk-inclusive case. The resume case moved unchanged to
`agent-launch-follow-up-line-resume.spec.ts` for slice 5, which the selection
now names. The E2E journeys already use the same Published completion
framing. The gate ran 16 cases (11 Node) in 43.4 s; the moved cases sum
6.8 s against 12.4 s before.

### 5. Resume only the same line attempt

Type: Behavior
Status: done
Estimate: 8–12 active minutes.

Move the remaining `agent-launch-follow-up-file` case. Start two different
line anchors over one private attempt store, then repeat one refused start.
Observe two kept attempts and the resumed attempt's existing identity and
input. Use the real acceptance matching and recorded attempts.

Delivered: the line-resume spec runs one Node case through
`acceptLaunchRequest` and the real continuation; the host refuses line 11
with its session start kept, then line 12 and line 11 again keep two
attempts and resume the first with the same input. Disabling the resume
branch failed the case. Start now answers `accepted` and the refusal shows on
the kept attempt's outcome. The gate ran 16 cases (12 Node) in 26.4 s.
Follow-up for slice 6: `doneStoryStart.ts`, the notes spec and the
uncertain-continuation spec each recompose `AgentLaunches.continueRequest`;
export one continuation operation from `agentLaunchAccept.ts` that
`AgentLaunches` delegates to, and use it in those three places.

### 6. Send and retain the selected session evidence

Type: Behavior
Status: done
Estimate: 11–14 active minutes.

Move `agent-launch-follow-up-selection` and `agent-launch-follow-up-published-sessions`.
Use the real selected-session join with published ranges, a matching local
record, a fallback without publication and a different story's record.
Observe the exact selected session facts, exclusion of foreign evidence,
and the identical saved input after the original source record disappears.

Delivered: both specs run in Node through the real `followUpStorySessions`
join; letting the join include another story's record failed the
published-sessions case. `continueKeptAttempt` in `agentLaunchAccept.ts` is
the one continuation operation for `AgentLaunches`, the harness and the
notes and uncertain-continuation specs. The gate ran 16 cases (14 Node) in
32.0 s; the moved cases take 0.8 and 1.0 s against 5.1 and 8.5 s. In the
111-spec consumer run at load 17–19, three held-gate duplicate cases missed
their 3 s native-launch poll; alone they passed 3 of 3 on both the base and
this change, so that load sensitivity predates this story.

### 7. Refuse page-authored evidence at Start value admission

Type: Behavior
Status: planned
Estimate: 5–8 active minutes.

Move the two forged-context cases in `agent-launch-follow-up-file-admission`
to the maintained Start value admission entry. Check both raw text and an
already-framed message using the actual incoming input shape, and prove the
refusal occurs before an attempt or host starts. Drop unused wrappers only
after checking all callers, including the cases in plan 850.

## Proof and local gate

From the repository root, use a fresh absolute backend proof-record path
that does not exist yet. Use the same profile for baseline and after. Include
any renamed paths in the selection, record a case-to-owner map when a case
moves, and verify zero remaining Playwright selections for this story's unit paths.

```sh
selection='launches/agent-launch-follow-up-(file-admission|file|forged-context|landed-comparison-admission|line-resume|published-range-admission|published-sessions|selection)\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR /usr/bin/time -p npm run test:e2e -- 'e2e/intent/intent-story-follow-up\.spec\.ts$' --workers=1 --reporter=line
```

Record engine/case counts, summed and per-case times against roughly
100 ms, wall time, and the separate retained E2E cost. Prove each distinct
refusal and preserved context, including admitting the corresponding valid
target. Check discrimination before retiring any duplicate. If typed
production boundaries change, run `npm run typecheck:dashboard` and select
affected callers using the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace),
especially plan 850's surviving specs and the published-session and
historical-file Review consumers. Apply
[MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
[page-object selection](../../../.agents/skills/dough-page-objects/SKILL.md)
before editing tests. Keep the default test timeout. Use awake macOS on AC
under `caffeinate -s -i` for long checks per [AGENTS.md](../../../AGENTS.md)
and follow the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Original proof disposition

The maintained backend selector at `43b6506e7` counted 607 paths, 369
Vitest and 238 Playwright. Within the old scope it returned 57 observation,
33 Review, 17 Intent and six selected launch paths on Playwright. Five
observation fixtures only prove harness behavior and go to runner cutover.
The 11 repeat paths stay with the [repeat correction](../607-close-landed-ci-repeat-check-gaps/PLAN.md)
until its accepted disposition. The remaining 97 paths are divided by
observable outcome in the [campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).
Each provisional plan carries the exact legacy path mapping for its outcome.

## Plan review

Slice-plan refinement separated retained comparison admission, file and
range admission, selected message composition, and launch retention into
separate proof loops. The replacement plan uses seven bounded slices that
extend the same admitted-evidence chain. No remaining slice-specific concern
was identified in the selected outcome. Renew the current proof selection after
any intervening relevant product or plan 850 delivery.
