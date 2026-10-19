# Input alerts survive observation gaps

**Source:** [Avoid repeating input notifications after session reconnection](../../seeds/SEED-140-dashboard-session-notifications.md#avoid-repeating-input-notifications-after-reconnection)

**Identity:** SEED-140#avoid-repeating-input-notifications-after-reconnection

## Goal and scope

A developer receives one useful input notification and sound for an outstanding
request, without repeated interruptions when session observation recovers. Keep
input-alert continuity across unknown, unreadable, incomplete, unrecognized,
unavailable and temporarily omitted observations. Preserve the quiet startup
baseline, independent native sessions, and alerts after observed resumed work.

Terry chose on 2026-10-19 to require positively observed resumed work before
another input alert for that session. If answer/work/new-question all happens
between successful observations, the next waiting reading may stay quiet. This
is an accepted limit, not an inference that no new request exists. Reconnect,
changed summary, elapsed time and absence alone are never evidence of progress.

Preserve current acknowledgement, other native alert categories, unread completion
reports, notification wording/title/sound, availability feedback and server
shutdown. The page continues to show the actual current observation. This work
adds no new Cursor input-alert category and changes no host observation contract.
Notification click navigation is the sibling story. Native request tracking,
subscriptions, time-based cooldowns, persistent notification history, delivery
retry changes and detecting unseen work are deferred.

## Current decisions and reuse

- Extend the existing `SessionAlerts` responsibility; reuse `sessionKey` for
  host-qualified identity and existing semantic activity/alert interpretation.
  Remember input-alert history for the server run independently of the latest
  reading. Only an available `working` observation rearms that session's input
  alert. Preserve memory when a record temporarily drops out of a poll.
- The first successful poll remains a quiet baseline, including its waiting
  sessions: an observation gap must not turn those historical waits into new
  alerts. Sessions first seen after that baseline retain existing first-alert
  behavior. A fresh dashboard process starts a fresh baseline.
- Keep the domain rule at one owner, without comparing question text globally,
  keying by opaque ID without host, or using presentation strings as progress
  evidence. The implementation may consolidate existing per-session memory;
  the exploratory Set is evidence of feasibility, not a required structure.
- PFE found the existing alert loop, host normalization and `sessionKey` suitable.
  Codex first-input `turnId` records startup acceptance, and completion delivery
  IDs identify completion submissions; neither identifies later input requests.
  Preserve those separate responsibilities. Current observations do not provide
  shared request identity; the chosen scope needs none.
- [ADR 0000 — Use ADRs](../../../docs/adrs/0000-use-adrs-accepted.md) keeps this
  feature-local design here and in maintained feature documentation. [ADR 0002 —
  Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  supports one coherent representation and reuse. No Accepted ADR conflict was
  found. Dashboard ADR 0008 is Proposed and imposes no constraint.
- The [Architectural North Star](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
  keeps host-specific observation with each host and shared alerting in the
  existing local boundary. This plan changes shared alert policy, not native
  observation or interactive ownership; it adds no session registry.
- Use the current [notification boundary](../../../dashboard/AGENT-LAUNCH-HISTORY.md)
  and its affected tests; keep continuity in the shared alert decision rather
  than restoring the older sender. Shared files alone do not create a blocking
  story dependency.
- The [dashboard North Star](../../../docs/dashboard-ux-ui-north-star.md),
  “Evidence, freshness, and uncertainty,” continues to govern the page: remembered
  alert history must not turn unknown observation into a displayed current wait.
  Established direction suffices; no new North Star topic is needed.

## Preparation observations

Observed on 2026-10-19 in
`/Users/terryyin/git/open-dough/.worktrees/avoid-repeating-input-notifications-after-sessio`,
branch `codex/avoid-repeating-input-notifications-after-sessio`, at
`b2a19339d29fc55159355591d88ecb21a92806e2`, using Node 24.21.0.
All experiments used the existing isolated dashboard harness with fake native
hosts and fake `osascript`; no production session or real notification ran.
Every scratch product/test change was reverted before this plan was written.

| Decisive premise and consuming boundary | Observation and result |
| --- | --- |
| Recovery can cause duplicate input notifications in the current product | Scratch extensions of `session-alerts.spec.ts` and `boundary/agent-launch-codex-observation-alerts.spec.ts` drove real polling through Claude listing failure/recovery, Claude omission/return and Codex metadata refusal/recovery to the fake `osascript` command log. `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/session-alerts.spec.ts dashboard/tests/boundary/agent-launch-codex-observation-alerts.spec.ts --grep 'observation keeps\|native transition alerts'` failed all three cases: one expected input alert became two. The seed records the scenarios and initial setup correction. |
| The proposed memory rule fixes those cases while preserving existing transitions | With disposable run-local input history keyed by `sessionKey`, populated at baseline and cleared only by available working, `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/session-alerts.spec.ts dashboard/tests/boundary/agent-launch-codex-observation-alerts.spec.ts dashboard/tests/boundary/session-alerts-unread-report.spec.ts` passed all 12 scenarios, including the three added recovery replays. Removing the rule restores the demonstrated failures. |
| The quiet baseline must survive a gap too; the proof distinguishes this loss | A disposable `boundary/session-alerts-preparation-observation.spec.ts` used saved native records with one already waiting at startup. `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/boundary/session-alerts-preparation-observation.spec.ts` failed at the first recovery: zero expected input alerts became one. |
| Host-qualified memory, repeated gaps, omitted machine records and rearming can compose without hiding current observation | With the same scratch rule, `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/boundary/session-alerts-preparation-observation.spec.ts dashboard/tests/session-alerts.spec.ts dashboard/tests/boundary/agent-launch-codex-observation-alerts.spec.ts dashboard/tests/boundary/session-alerts-unread-report.spec.ts` passed all 11 scenarios. The added journey reached three independent alerts with identical text (two Codex sessions and a Claude session sharing one Codex ID), changed-summary silence, three unknown/recovery cycles, incomplete/unrecognized/unavailable recovery, removal/restoration of machine records, and a fourth alert only after observed working. It also read the machine-sessions endpoint during a gap and observed `kind: unknown`, and observed only the sentinel record during omission. Further sentinel reads, not sleeps, established completed polling. |
| Notification availability still reaches its enclosing UI correctly | With that scratch rule, `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/session-alerts-unavailable.spec.ts` passed all three cases: working notification support, missing support, and refusal followed by successful notification and cleared sidebar feedback. |

The scratch spec is intentionally not retained as implementation. Its concrete
journey above is reproducible through `tests/support/codexObservation.ts`,
`codexLaunch.ts`, `sessionAlerts.ts`, the fake native listing, and the command log.
Execution must add lasting discriminating regression coverage at those existing
boundaries. These observations settle the approach and proof route, not completion
of the repair. The exact transport/host behind Terry's original incident remains
unattributed; this plan does not depend on that attribution or detecting unseen work.

## Outside-in proof ownership

All promises belong to slice 1. Use the notification command log as the stable
boundary for this logic; the existing sender remains responsible for actual macOS
delivery. Poll/read counts establish quiet periods. Do not call a private memory
helper and treat it as proof that the server's loop uses the rule.

| Promise | Observable proof in slice 1 |
| --- | --- |
| Same outstanding request stays quiet across repeated unknown, unreadable, incomplete, unavailable, unrecognized and absent observations | Extend the existing Claude and Codex alert journeys with loss/recovery cycles and temporarily omitted machine records. Count input notifications across the whole sequence, preserving unrelated unavailable/unrecognized alerts. |
| Summary changes and repeated waiting do not rearm; observed working allows identical-wording new input | Observe unchanged input count across summary changes and waiting reads, then observe working, return to the same waiting text and require exactly one new input notification. Returning from a gap without observed work stays quiet, including the accepted missed-cycle limit. |
| Sessions remain independent, including colliding native IDs across hosts | Two native sessions with the same question each alert; a Claude and Codex session with the same opaque ID also each alert. Recovering one does not reset or suppress the other. |
| Quiet baseline, later-discovered sessions and restart remain correct | An already-waiting baseline session stays quiet through a gap; restart keeps its quiet baseline. A session first seen later still alerts when it needs input. Existing working/re-entry scenarios remain green. |
| Current observation remains truthful | During a native read failure, machine-sessions still returns unknown for that session while notification history is retained. Reuse unchanged presentation evidence; no page status mapping is changed. |
| Acknowledgement, completion reports and unrelated notification behavior remain intact | Run complete `session-alerts.spec.ts`, `boundary/agent-launch-codex-observation-alerts.spec.ts`, `boundary/session-alerts-unread-report.spec.ts`, and `session-alerts-unavailable.spec.ts`, including title/text arguments, Glass, Mark as done, restart, non-input readings, independent unread report and shutdown/availability observations. |

## Ordered slices

### 1. An input request stays notified until observed work resumes

Type: Behavior
Status: planned
Proof: The complete promise mapping above, through real server polling, native
fixture answers, the notification-command log and the affected availability UI.

Behavior: Given a session whose outstanding input alert was emitted or quietly
baselined, observation can fail, become inconclusive, or omit the session and
later recover without sending that input alert again. Only observed resumed work
allows its next waiting request to alert once, even with identical text. Other
sessions and unrelated alert behavior retain their existing meanings.

Implement one coherent input-alert history rule in the existing alert owner,
covering initial baseline and later observations. Preserve current report and
non-input transition semantics and keep native observation separate. Add the
recovery regressions at the existing outside-in boundary and carry the edge
cases through that same rule rather than host-specific handlers. Update
`dashboard/AGENT-LAUNCH-HISTORY.md` and the alert loop/test descriptions with
continuity, positive rearming and the accepted missed-cycle limit. Keep
implementation, regression proof and local cleanup together in this slice.

The full alert suites above are the focused check because they consume the
changed suppression behavior and sender availability. Extend their support only
where needed to drive native facts or observe completed polls; fixtures must
not implement the alert-history rule. A fake unavailable host does not prove
that real native transports always fail the same way, and no such claim is
needed for this shared repair.

Safe stopping point: the complete selected outcome is delivered; notification
click navigation and unseen-request detection remain outside this story. There
is no interim implementation or later replacement slice.

## Verification and execution constraints

No numeric slice target or hard limit is supplied. One small state rule, one
stable notification boundary and the exercised focused suites keep this a
single bounded Behavior slice. Splitting by host, gap kind, test or layer would
fragment the same responsibility. No prerequisite Structure slice is needed.

Execution uses the installed execute-plan workflow, including independent
post-change refactoring, agent commits, delivery and its CI duties. The tracked
`.githooks/pre-commit` checks staged lint and dashboard typechecking for script
changes; preserve those local gates. Hosted CI alone does not require every
suite locally. Run the four complete affected alert suites after the final
implementation and refactoring; broaden only for newly affected consumers.

Plan 319 follows the highest allocated number 318. The sibling navigation
preparation took 318 during this session; this plan was renumbered before
publication after checking fetched trunk. Current paths and Git history were
also checked. No story dependency, unresolved
scope decision, additional feasibility probe or remaining slice concern was
identified. A separate slice-plan refinement pass is unnecessary: there is one
cohesive rule and all source promises have an owner. This preparation authorizes
no implementation, Take or story completion.

## Learnings

No execution learnings yet. Preparation findings and Terry's accepted limitation
are recorded above.
