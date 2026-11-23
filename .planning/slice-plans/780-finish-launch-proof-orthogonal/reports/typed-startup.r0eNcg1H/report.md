# Slice 6 — Typed story and unattached startup attempts

SEED-413#finish-launch-proof-orthogonal, accepted HEAD
82f46dc9b90f2962a65fec345781c4ed2d956680. Changes are uncommitted in the owned
worktree. See the [shared failure policy](/Users/terryyin/git/open-dough/.worktrees/get-launch-unit-proof-in-about-eight-seconds/Distribution/src/skills/dough-execute-plan/references/failure-policy.md) in the checkout.

## Implementation

StoryCard asks for the existing StoryCardLaunches and SessionFollowUp inputs
plus the two machine-read fields it uses itself. FollowUp asks for the
existing AdHocLaunches. The production Board, Recently done and file-anchored
Follow up still supply the same values through their normal entry points.
The composed story startup cases use the production StoryCard, launchOffers,
useLaunchAttempts, StartupRecovery and StartupAnnouncer with typed machine
answers and LaunchAttemptSource. The former broad noSessions stand-in and
MachineSessions spread are removed. The focused story launch mount evaluates
the real offers with each offered or held read at the StoryCardLaunches
input. The unattached and Follow up mounts use the existing ad hoc policy
fixture where installation offers are incidental, and supply the two real
attempt operations from useLaunchAttempts explicitly. The production
useAgentLaunches continues to own machine polling and the full page assembly.

The three keyboard journeys activate with native Enter. Direct focus places
the keyboard on enabled controls before Enter and, in the terminal journeys,
the intervening other task before the machine answer. The record, progress,
descriptions, automatic focus and successor focus observations remain. Separate
existing native Tab witnesses cover the exact dialog order at ordinary
viewport in ad-hoc-launch-dialog.spec.ts (refinement tabs through closed
disclosures) and ad-hoc-start-session-layout.spec.ts (Start session tabs
through session choices). The independent accessible-board-keyboard.spec.ts
retains its native route to Inspect story. The desktop status and refusal
cases click the actual enabled DOM button. Focus starts on the launcher and
actual dialog handoff restores it where observed.

The story startup helper and the Start session Escape/Cancel case now use the
runner's default viewport. One desktop refinement refusal case explicitly uses
its original 1440 × 900 because it checks the two offers share a row. The
project-actions touch rotation and wide opposite-action geometry retain their
purpose-sized viewport setup. Runner, pointer assignments and timeouts keep
their existing configuration.

## Promises and observations

| ID | Retained proof and concrete observation |
| --- | --- |
| 06 | ad-hoc-start-session-answer.spec.ts, "the Start session progress and direction stay readable in whole words on a phone". ProjectActions receives a typed starting attempt. Exact "Starting a session in Open Dough… Local startup in progress." appears within the action bounds with no split words, the launcher is disabled, and clearing restores it. |
| 07 | ad-hoc-start-session-answer.spec.ts, "the refusal and direction retain their room when opened, closed and rotated by touch". ProjectActions receives a typed refusal carrying the Claude reason and check. Exact rendered words, action bounds, touch hit testing, opening beneath the row and stable geometry survive both orientations. |
| 08 | responsive-unattached-startup.spec.ts, "a blank keyboard start presents its terminal without taking focus from another task". Native Enter opens and submits Start session. The accepted attempt disables the launcher and focuses its described progress, with zero early presentations. Listing its settled session calls presentTerminal once with that record and launcher, with takesKeyboard false and the other task focused. |
| 09 | responsive-unattached-startup.spec.ts, "an instructed keyboard start leaves the terminal closed and keeps the other task focused". Same real acceptance and record sequence. Exact instruction is present in the typed request, progress hands off, then disappears, and presentTerminal has no calls after settlement while the task keeps focus. The ad-hoc-start-session.spec.ts instructed handoff case still separately checks the launcher regains focus when keyboard stays on progress. |
| 26 | ad-hoc-creation-entry.spec.ts, "an unresolved creation names its stand-in host and displays the supplied inspection arguments". CreationEntry takes the existing typed creation record. Stand-in host heading, shell-quoted inspection arguments and absence of the record's Codex host word pass unchanged. |
| 49 | responsive-story-startup.spec.ts, "a keyboard start protects the selected story, announces each transition once, and leaves the next inspection focused". Native Enter and exact instruction lead to one typed acceptance for the selected story identity. Its real card stays selected and inspected, blocks its own actions with the named startup description, keeps visual selection and progress marks, and leaves the other story enabled with a different description. |
| 50 | Same composed story case attaches MutationObserver to its StartupAnnouncer live log before starting. Repeated running/publication evidence adds no announcement, and the observed log list is exactly progressing, settled waiting for published story state, then reconciled once each. It also observes static progress under reduced motion and the progress animation when allowed. |
| 51 | Same composed story case reaches the other card's enabled Inspect and opens it with Enter. It asserts Hide detail owns focus before settlement and after both later reads, while the completed session appears without taking focus. The selected card's original focus handoff and open detail also remain explicit. |
| 53 | Source inspection and the dashboard typecheck confirm StoryCard and FollowUp consume narrowed existing input types, story-startup-page drops the Board's noSessions MachineSessions fixture, and responsive-unattached-startup and follow-up-note-handoff stop spreading launchOffers. story-card-launch-page receives a typed offer read and focused StoryCardLaunches inputs, using one projection per view. Held offer/options, model change and desktop cue callers passed. |
| 63 | startup-recovery.spec.ts keeps held acceptance, already disabled Start, accepted focus on the protected card, and late uncertainty exclusively in recovery with Continue available. startup-recovery-reads.spec.ts keeps unread and unanswered gating with still-operable inspection, unsuccessful Recheck preserving a static lost acceptance, then a later confirmed acceptance becoming progressing while unrelated card actions stay enabled. Its protected source link, exact Recheck counts and one acceptance remain. StartupRecovery direct cases keep lost acknowledgment's Recheck-only behavior and host-specific recovery advice. |
| 73 | Both roster logs list all six story-card-startup cases on chromium-desktop, and the independent consumer proof repeats all six after the type fix. The other four desktop offer cases remain chromium-desktop and the rotation refusal remains chromium. |

The three story-card-startup accepting cases still exercise the typed service
callback and then real accepted evidence. They distinguish ordinary execution,
an installed establishing execution with a later settled refusal, and ordinary
refinement. Both focus/placement refusals and the direct host/workflow status
matrix pass. The composed Follow up case still sends the notes-selected and
notes-omitted request shapes and proves Cancel sends nothing. The real Taken
card still says "1 note waiting", describes its Notes action, and offers no
story Follow up.

## Timed proof

The existing launch-phases/run.log recorded 11 Tab calls in each of the two
unattached cases costing 691 and 452 ms, and 13 in the story case costing
846 ms. Individual launcher and submit clicks in five desktop startup cases
cost 364–694 ms per case. The exact two-worker matched scope is given by the
argv in baseline.log.run.json and verified.log.run.json. For both phases the
shell command had this shape with OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD
set to the corresponding fresh JSON file:

~~~
/usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/{responsive-story-startup,responsive-unattached-startup,ad-hoc-start-session,ad-hoc-start-session-answer,ad-hoc-creation-entry,story-card-startup,startup-recovery,startup-recovery-reads,follow-up-note-handoff,story-card-launch-dialogs,story-card-launch-offers,launch-refinement-options,launch-model-effort}.spec.ts --workers=2
~~~

The prelaunch decision was one matched 13-file pair covering every shared
mount caller, with existing installed dependencies, runner isolation and
normal cache behavior. A Mac on AC with 16 logical CPUs was awake for both
runs and the clock owned the guarded commands. No other verification owned
by this execution overlapped. Other host workload was outside execution
control. Start load was 24.48 for baseline, 24.50 on the exploratory
candidate, and 19.52 for the repaired candidate. The baseline and repaired
candidate both passed the exact 45-title roster across 13 files with 35
Chromium and ten Chromium Desktop cases.

| Observation | Baseline | Exploratory | Repaired |
| --- | ---: | ---: | ---: |
| Process wall, with preparation | 22.31 s | 21.40 s | 17.36 s |
| Summed durations, 45 cases | 28.652 s | 24.337 s | 20.844 s |
| Keyboard story startup case | 2060 ms | 1165 ms | 914 ms |
| Blank keyboard terminal case | 1270 ms | 372 ms | 155 ms |
| Instructed keyboard terminal case | 1568 ms | 374 ms | 457 ms |
| Five desktop starts/refusals, summed | 2840 ms | 945 ms | 384 ms |
| Terminal result | pass | 44 pass, 1 failure | pass |

The exploratory trial used the ordinary 390-wide viewport on the desktop
layout case, which wrapped the offers (top positions 88.65625 and 128.21875).
The screenshot and assertion are retained. Restoring only that test's original
wide viewport fixed its geometry and was the reason for the verified run.
The later TypeScript pass required HTMLButtonElement assertions for two
role-selected controls. Those assertions erase at build time. The final
consumer proof repeated the corrected compile and all six desktop starts.

The comparable-load exploratory case bodies and the repaired passing pair
show gains on the profiled actions. The repaired wall timing includes a
lighter starting load. This pair covers 13 files, so it supplies focused
timing under the recorded host workload. The full launch elapsed target
remains open. Even this subset was 9.36 s above eight seconds in its repaired
run. The plan's exact whole-selection paired acceptance belongs to slice 8.
Broader performance proof would require comparable host headroom.

## Consumer trace and terminal receipts

consumer-trace.md records the installed search, including StoryCard,
SessionFollowUp, StoryFollowUpSession, mountStoryStartup and mountStoryLaunches.
All five story-startup-page specs (responsive story, desktop status and
refusals, recovery, recovery reads, Follow up note handoff) and all four
story-card-launch-page specs (desktop offers, launch dialog wording,
refinement options, launch model and effort) are in the matched roster.
The project row, responsive unattached, Start session and creation are also
in that roster. The existing adHocLaunches and mounted-launch-attempts
suppliers themselves and their other callers have the same implementation.

Production StoryCard sees its input from Columns/Board. The consumer run
observes Taken card title/progress/control order and keyboard traversal in
story-card-scan-emphasis, launch dialog dismissal preserving the Board
position in board-paging-launch-dialog, and inspection leading to Review
changes in story-review-action. It observes active and Recently done
session association, compact entry details and Done disclosure through the
corresponding sessions specs and launch-record-details. RecentlyDoneEntry
and StoryAnchoredFollowUp reach FollowUp's narrowed input; the
recently-done-follow-up-membership cases verify correct retained follow-up
association and the file Follow up dialog. Existing production callers
compile against the narrower types. Other frame, story navigation and Intent
consumers see the same fields and runtime paths. The assertions, component
mounts and setup are retained in those named source files and the exact
consumer titles are in consumer-roster.tsv.

The literal consumer command is in consumers.log.run.json; shell form:

~~~
/usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/story-card-startup.spec.ts dashboard/frontend-tests/launches/launch-record-details.spec.ts dashboard/frontend-tests/stories/story-card-scan-emphasis.spec.ts dashboard/frontend-tests/review/story-review-action.spec.ts dashboard/frontend-tests/navigation/board-paging-launch-dialog.spec.ts dashboard/frontend-tests/sessions/{compact-session-entry,recently-done-active-story-sessions,recently-done-story-sessions,recently-done-follow-up-membership,story-card-done-disclosure}.spec.ts --workers=2
~~~

The 22 cases (15 mounted Vitest Chromium, including 6 on chromium-desktop,
and seven Playwright Chromium) passed. The non-timing consumer gate took
49.67 s. Dashboard typecheck via caffeinate -s -i npm run typecheck:dashboard
passed after correcting the two element types. The named terminal E2E gate
is conditional on a production handoff change. StartSession and its terminal
behavior are the same production path, and both typed terminal handoff
behaviors are exercised in the matched proof.

All commands reached their terminal receipts. The corresponding .log,
.log.run.json, .exit and proof JSON files are adjacent. matched-roster.tsv
contains the exact case, browser assignment and all three case durations.
The working diff passes git diff --check.

## Changed paths

- dashboard/src/StoryCard.tsx
- dashboard/src/FollowUp.tsx
- dashboard/frontend-tests/launches/story-startup-page.ts
- dashboard/frontend-tests/launches/story-card-launch-page.ts
- dashboard/frontend-tests/launches/story-card-startup.spec.ts
- dashboard/frontend-tests/launches/responsive-story-startup.spec.ts
- dashboard/frontend-tests/launches/responsive-unattached-startup.spec.ts
- dashboard/frontend-tests/launches/follow-up-note-handoff.spec.ts
- dashboard/frontend-tests/launches/ad-hoc-start-session.spec.ts
