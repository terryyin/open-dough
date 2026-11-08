# Set up test preconditions without replaying unrelated workflows

**Identity:** SEED-262#arrange-prerequisite-state

**Source:** [Refined story](../../seeds/SEED-262-faster-dashboard-test-feedback.md#arrange-prerequisite-state)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Shorten the setup that developers wait through before the dashboard attention
and card session-state journeys can exercise an already-open session. Migrate
the two attention cases and the one card session-state restart case. Keep
their existing Board, native listing, restart, project switch, reload, and
Mark as done observations. Keep real Starts in the card Start and
launch-to-listing journeys and in cases that prove launch reconciliation.
Other session fixture migration, Git construction, test artifact production,
fixture lifetime, and polling cadence have separate scope.

## Current decisions

- Arrange matching launch records and fake Claude listings in each test's
  private machine before the first records read. Build records with
  [MakeMe](../../../tests/support/makeMe.mjs) and use
  `claudeListsSession` in the
  [existing fake listing](../../../dashboard/tests/support/fakeClaudeListing.ts).
  The record and listing share their native ID. The project, story identity,
  workflow, and starting state are explicit at the arrange call site. Use
  the canonical story facts already used to publish the origin.
- Extend the existing launch-record builder for kept execution and
  refinement records without an established assignment. Preserve existing
  story-branch execution callers and their start metadata. The
  [typed store writer](../../../dashboard/tests/support/storyLaunchRecord.ts)
  and [existing multi-project writer](../../../dashboard/tests/recentlyDoneSessionsSidebarPage.ts)
  already write the production format. Use one implementation that can write
  both project buckets together and preserve the current single-project
  call form. Both write paths replace the whole private store, so perform
  the write once before navigation, before the product can add a Done mark.
- Keep the live observation sources separate. Real published origin
  revisions place cards. The production records reader joins saved launch
  data with the current fake native listing. An unavailable or unreadable
  listing still goes through that reader and its recovery. The
  [Architectural North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
  and [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  describe the distinction. [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  and the [test data architecture](../../../tests/README.md#test-data-architecture)
  support readable domain facts. [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  requires the comparison with proof intact. The test setup uses current
  product contracts.

## Outside-in proof

| Seed example | Owner | Required observation |
| --- | --- | --- |
| 1. Backlog and Preparing attention | Slice 1 | Preserve the counts, reasons, native listing failure and recovery, unchanged published facts, and no-reload checks as the page advances on the existing controlled pace. |
| 2. Taken, Done, and project isolation | Slice 1 | Preserve the real Take and Mark as done, both project counts, reload, and the retained local Taken entry with its reason and Open terminal. Both projects start from the same grouped store write. |
| 3. Open sessions through observation failure and restart | Slice 2 | The real reader shows State unknown during listing failure, leaves the Start restrictions and terminal affordance intact, and shows the recovered states after restart, reload, and project switches. Keep the existing published-read and membership assertions. |
| 4. Real Starts still create new card entries | Slice 1, recheck after Slice 2 | Run the full card Start spec. Retain the separate launch-to-listing proof across column transitions and the real terminal attach and Mark as done it exercises. |
| Less arrangement time and request work | Slice 1 for attention, Slice 2 for restart and final matched comparison | Compare the same setup interval before and after with a normal strict run. The migrated cases send zero Start-related POSTs and invoke no native launch. The production page still reads the actual stored records and native listing. |

## Decisive premises

Observed in the owned worktree based on `6f30a92e1` on 2026-11-08,
with macOS on AC, Node 24.21.0, and the ordinary Chromium preview profile.

- The ordinary strict runner passed all 10 cases in attention,
  launch-to-listing and card Start with two workers. This exercised
  execution and refinement through the real dialog and native invocation,
  plus launch-to-listing and its existing terminal and Done operations.
- Temporary arrangement using the existing MakeMe record and fake listing
  controls, with ordinary records shaped without start/preparation
  metadata, passed the two complete attention cases and the real restart
  case through the ordinary dashboard runner. The probe wrote the matching
  records for both projects together before navigation. It exercised native
  listing loss and recovery, the real Mark as done on the stopped session,
  the second project's blocked session, local Taken, and the same machine
  across restart. The temporary code was reverted. The final builder API
  and its existing callers remain execution proof.
- Two matched strict runs of the selection below passed all three cases
  on each side. Attention arrangement fell from 1.77–2.20 s to
  0.61–0.73 s per case and restart arrangement from 1.72–1.75 s to
  0.58–0.63 s. Native starts fell from three to zero per initial
  arrangement, records GETs from 10–11 to one, and fake GitHub commands
  from 22 to 10. With the corrected Start endpoint counter, the baseline
  sent six Start POSTs per initial arrangement and the seeded run sent
  zero in each whole case, including the project switch. Temporary
  run-local instrumentation supplied the interval timings and counts.
  The strict proof transcripts supplied the verdicts and runner times
  of 15.12 and 16.73 s before, and 14.64 and 13.59 s after. Measure the
  delivered fixture again.

## Local gates and comparison

Follow [test automation](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. On a fully awake Mac on AC, run under `caffeinate -s -i`.
On battery, plug in or start fully awake with the lid open under
`caffeinate -i` and inspect the sleep log afterward. See
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

Run `npm run typecheck:dashboard` and `npm run lint` for changed fixtures
and specs. Use the [strict proof record](../../../dashboard/tests/proof-record.md)
with a fresh absolute `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` for each run and
no reporter override. The matched selection for both before and after is:

```sh
caffeinate -s -i npm run test:dashboard -- \
  'agent-launch-attention\.spec\.ts$' \
  'agent-launch-story-card-session-states\.spec\.ts$' --workers=2
```

Capture a baseline before editing and compare repeated runs with the same
worker settings and comparable load. Time the initial arrangement through
the initial quiet or Working checks. Record setup GETs for `/__agent-launch`,
fake GitHub command counts and native launches in that interval. Count the
Start accept, continue, verify and reconciled POSTs through the whole case,
including the old Doughnut Start after the initial setup interval. Keep
elapsed case and run time alongside the arrangement figures so shared build
or origin startup cannot be mistaken for the gain. Keep timing samples out
of the test's pass criteria and enforce the absence of Start requests and
native launches in the migrated journeys.

For the real action owners, add these selectors to a strict run:
`'agent-launch-story-card\.spec\.ts$'` and
`'agent-launch-story-card-sessions\.spec\.ts$'`. For fixture changes, use
the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
Check branch-backed records through `'story-review-mark\.spec\.ts$'` and
a moved grouped writer through `'recently-done-sessions-sidebar\.spec\.ts$'`.
Follow any changed contract to additional consumers and verify their distinct
observations. Unchanged cases that exercise the same calling form can share
proof.

## Slices

### 1. Attention journeys start with open sessions

**Type:** Behavior

**Status:** done

Given a private test machine and the published Board fixture, opening the
attention journeys starts with the specified open sessions in both required
projects. The page observes native status changes and published membership
at its normal boundaries. The real Mark as done still removes the affected
entry. Zero Starts are needed and the setup interval costs less.

Run the baseline before changing setup. Reuse the fake listing and canonical
store paths above. Extend MakeMe only for the workflow and optional established
metadata the fixture needs. Make both attention cases state their relevant
prerequisites and keep their independent observations of the arranged identities.
Update the affected ownership notes in
[native-host-fixtures.md](../../../dashboard/tests/native-host-fixtures.md).
Run both complete attention cases, the two real action owners, and applicable
store/builder consumers. This is a safe stopping point with the restart case
still using its original setup.

**Accepted proof (2026-11-08):** `openWithOpenSessions` in
`dashboard/tests/storyCardOpenSessions.ts` (moved there in Slice 2) keeps each session's MakeMe record
(`.executing`/`.refining`, no start metadata) and its `claudeListsSession`
listing under one native ID, all projects in one `keepProjectLaunchRecords`
write (`support/storyLaunchRecord.ts`, now the single store writer, with
`keepLaunchRecords` and `keepMoreLaunchRecords` delegating). `expectOpen`
checks each arranged ID on its entry; `expectNothingStarted` enforces no
Start POSTs and no native launches. Strict run of attention, card Start,
card sessions, story-review-mark and recently-done-sessions-sidebar passed
17; matched selection passed 3 (runner 13.1–14.0 s vs baseline 15.9 s at
load 6.6–8.6). Temporary instrumentation: attention setup interval
0.59–0.61 s, one records GET, zero native starts. Refactor rerun of
sidebar and sidebar-room passed 3. Existing `executing().onStoryBranch()`
records are byte-identical.

### 2. The card session-state journey starts with open sessions

**Type:** Behavior

**Status:** done

Given the same private-machine arrangement, the card session-state case
opens with working sessions and can exercise listing failure, subsequent
session changes, restart, reload, and project switching without replaying
Start. Reuse the arrangement from Slice 1 and keep the restarted server on
the same machine. Preserve the page and published-read assertions and check
the same arranged sessions across restart. Run the complete matched selection
and the action owners, review shared consumers, and record the before/after
comparison with the existing strict verdicts.

**Accepted proof (2026-11-08):** the session-state case opens through the
shared `openWithOpenSessions` (`dashboard/tests/storyCardOpenSessions.ts`)
with three working sessions, changes them through `becomes` while the
listing fails, checks the same arranged native IDs after restart, reload
and both project switches, and ends with `expectNothingStarted`. Strict run
of the matched selection plus card Start, card sessions, story-review-mark
and recently-done-sessions-sidebar passed 18.

| Matched comparison (2 workers, strict) | Before | After |
| --- | --- | --- |
| Runner time, 3 cases | 15.93 s (planning 15.12, 16.73) | 12.00, 12.22 s |
| Load | ~6.6 | 8.1–9.7 |
| Attention setup interval | 1.77–2.20 s | 0.59–0.61 s |
| Restart setup interval | 1.72–1.75 s | 0.54–0.57 s |
| Records GETs in setup | 10–11 | 1 |
| Fake GitHub commands in setup | 22 | 10 |
| Native starts in setup | 3 | 0 |
| Start POSTs per whole case | 6 | 0 (enforced) |

Before figures for intervals and counts are the planning premise's
instrumented runs on the same code; after figures come from temporary
run-local instrumentation, since removed. Timing is not a pass criterion.

## Preparation review

Slice-plan refinement was unnecessary. The attention migration owns the
initial setup reduction and the independent restart journey applies the same
arrangement with its own preservation proof. No remaining slice-specific
concern was found.

## Execution complete

Product advice: no change. The delivered fixture meets the story without a
correction. The `card-attention-launch-and-origin-setup` candidate in
`.planning/TEST-OPTIMIZATION-CANDIDATES.md` loses its launch cost here. Its
origin-setup cost stays with the remaining SEED-262 stories, which keep
their backlog order. Process findings: DD-450 (new), and a DD-449
occurrence (a superseded slice CI run reported as cancelled).
