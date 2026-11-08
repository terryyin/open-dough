# Avoid redundant Board reads

**Identity:** SEED-262#refresh-without-unneeded-reloads

**Source:** [Avoid redundant board reads](../../seeds/SEED-262-faster-dashboard-test-feedback.md#refresh-without-unneeded-reloads)

## Goal and boundaries

Give developers faster feedback from the attention and card-session-state
journeys by replacing incidental Board reloads with in-page observation.
Keep the production browser, loopback read boundary, committed Git origin
fixture, synthetic external hosts, real launch and Mark as done actions, and
the existing behavioral assertions. Keep navigations that prove restoration
or project isolation. Production read policy, the broader journey suite, test
fixture lifecycle, and polling infrastructure changes belong outside this
story. The selected journeys work with the current fixtures and need no
supplier story.

## Current decisions

- Keep published observation and machine-local session observation separate.
  The [published observation contract](../../../dashboard/PUBLISHED-OBSERVATION.md)
  requires a fresh configured-ref read on true reload or project return.
  Follow [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and the [North Star’s observation and presentation boundary](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation).
- Reuse the published advance and displayed-revision wait from
  [the story-columns page helper](../../../dashboard/tests/storyColumnsPage.ts)
  and the controlled session pace and document marker from
  [sessionStatePace](../../../dashboard/tests/sessionStatePace.ts). The default
  dashboard fixture occupies both revision stream slots, so normal observation
  uses a revision check. Publish before driving the required controlled pace,
  then wait for the new revision and settled facts. Keep the existing reload
  and visibility call forms for other consumers. A new revision marker can
  precede the new details, so keep each semantic assertion and its settlement.
- Use the same strict two-worker selection before and after. Follow
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Count a full Board read as a source-only request to the authenticated read
  boundary. Distinguish it from a snapshot pinned to an already resolved
  revision, a conditional heads check, and a machine-local read. Trace parsed
  [fake GitHub calls](../../../dashboard/tests/support/fakeGitHub.ts) by
  repository, revision or ref, request kind, and path. Match generated SHAs
  by their logical fixture revision across runs. Separate unrelated launch
  and Actions traffic. Drain relevant replies so cancellation at teardown
  cannot appear as a saving. Count fewer full Board reads in each journey and
  report timed results and any costs displaced to other reads. Treat
  one-run wall-time differences as exploratory.

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Attention follows published placement in the open Board | Slice 1 | Preparing, Taken and the story leaving published lists each show the intended revision and membership in the original document. Keep the card counts, local Taken entry, its reason and Open terminal, the local listing failure and recovery, and Mark as done. The local-only steps retain published facts and do not request a new published snapshot. |
| Project switch and reload still exercise restoration | Slice 1 | The real Doughnut switch shows only Doughnut attention, returning shows Open Dough’s state, and the explicit reload observes the latest Open Dough session result. |
| An unreadable native listing need not reload the Board | Slice 2 | The current document and published revision stay in place, no new published snapshot is requested, and each existing entry shows State unknown with Open terminal. The real preview restart, reload, and project round trip still restore the entries and states, with their Start restrictions. |
| Developers get the same proof with less repeated Board work | Slices 1 and 2 | Each slice records counts and time for its journey. Slice 2 records the matched two-spec strict verdict, executed cases, focused wall time, and the timings and request counts for both journeys. The pinned reads that prove new origin revisions remain visible in the trace. |

## Decisive premises

On 2026-11-08 in the established worktree at
`dfc5bc234ab5cffaed6dd1987c0d138ddc1f96cd`, used awake macOS on AC, Node
24.21.0, Playwright 1.63.0 and the maintained built-preview Chromium profile.
The command for both scratch samples was:

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD="$proof_file" caffeinate -s -i /usr/bin/time -p \
  npm run --silent test:dashboard -- tests/sessions/agent-launch-attention.spec.ts \
  tests/sessions/agent-launch-story-card-session-states.spec.ts --workers=2
```

Both samples used the same disposable request recorder and unchanged journey
assertions. Both exited 0 with three completed passing attempts and a passing
strict verdict. The second sample used the in-page routes below and asserted
document continuity. Scratch edits were reverted.

| Consuming operation | Observed result |
| --- | --- |
| Slice 1 observes Preparing, Taken and removal with the attention page’s paused clock | Advancing origin before one existing controlled pace reached each expected revision and the original session/membership assertions without a new document. Taken and removal reused the pace already needed by their local session change. The two cases went from six to three document loads, 15 to 12 full Board reads and zero to three pinned Board reads. Open Dough direct `main` resolutions went from 13 to 10 and Doughnut stayed at two. Conditional heads checks went from eight to nine. Pinned content call count stayed at 51. The intentional reload and project switches passed. |
| Slice 2 sees a local listing failure before the restart sequence | Driving the existing session-record pace showed State unknown and Open terminal in the existing document, then the original restart, reload and project-switch sequence passed. The case went from three to two document loads and eight to seven full Board reads, with no new pinned Board snapshot. The replaced operation removed one Open Dough direct `main` read and one `.planning/open-dough.json` content request and added a conditional heads check. |
| Both slices can evaluate the savings in the normal strict profile | The attention transitions settled in 565–597 ms on the baseline and 500–600 ms on the probe. The local listing-failure step took 225 ms versus 89 ms. Command wall was 15.86 s versus 15.61 s under differing host load. These are feasibility observations. Repeat the comparison in execution using the accepted baseline and delivered change. |

## Local gates

Use `caffeinate -s -i` from a fully awake macOS machine on AC for full runs.
On battery follow the documented lid-open `caffeinate -i` and sleep-log
procedure. [Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Follow the [test automation rules](../../../AGENTS.md#test-automation) and
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Keep the current domain arrangement and use MakeMe for any new domain data.
Use controlled time and observable replies with the default timeout. Run the
affected journey at each slice, both journeys together at the final slice,
and `npm run typecheck:dashboard` for the test helper changes. Trace changed
helper call forms with the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
Run affected consumers, including
[the card-session placement journey](../../../dashboard/tests/sessions/agent-launch-story-card-sessions.spec.ts)
if the shared advance, settlement or existing visibility path changes.

## Slices

### 1. Follow published column changes on the open attention Board

Type: Behavior

Status: planned

With the attention sessions already launched, publish each intended revision
and observe it through the open Board. Keep the listing recovery and the
Preparing attention change distinct. Let Taken and removal use the same
controlled pace already required to observe their corresponding local session
change. Keep the actual project switch, return and explicit restoration
reload. Reuse the existing page helper and choose the in-page route at the
affected call sites.

Proof: Run both cases in
[agent-launch-attention](../../../dashboard/tests/sessions/agent-launch-attention.spec.ts).
Observe the new revision, settled membership, attention or retained session,
and the same document at each converted transition. Prove the unchanged
published facts for the local-only operations and keep the existing
Mark as done, switch and reload assertions. Record the baseline and delivered
request and elapsed-time comparison for the attention journey.

### 2. Observe an unreadable session listing without another Board snapshot

Type: Behavior

Status: planned

With the same Board revision and the launched entries present, change the
synthetic native listing and let the session-record observer receive its
failure. Keep the same Board and verify the existing entry and terminal
assertions. Restore the listing, then retain the actual server restart, reload
and project round trip.

Proof: Run
[agent-launch-story-card-session-states](../../../dashboard/tests/sessions/agent-launch-story-card-session-states.spec.ts).
Observe the same document and published revision, no new published snapshot
during the local step, and the existing restoration evidence after that step.
Run the two-spec matched selection and record the results for both journeys.

## Design and readiness review

Plan refinement was unnecessary. Each slice replaces one class of incidental
reload with an existing observation path and preserves its independent proof.
The shared helper change is part of the first journey that uses it. No
remaining slice-specific concern surfaced in the matched scratch runs.
