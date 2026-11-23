# Get launch unit proof in about eight seconds

**Identity:** SEED-413#finish-launch-proof-orthogonal
**Source:** [Get launch unit proof in about eight seconds](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-launch-proof-orthogonal)

## Goal and scope

Dashboard maintainers can run the whole launch unit selection in about 7–8
seconds at two workers, including runner preparation, with the same distinct
behavior and native browser coverage. Use the story's six reopened specs and
seven original specs, the launch helpers those cases depend on, and production
owners where a narrower typed entry preserves the behavior. Existing native,
installation, backend, and composed E2E journeys keep their proof. Use the
[shared acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories).

### Proof ownership

File names in this table are below `dashboard/frontend-tests/launches/`.
Before removing, moving, or consolidating a case, record the original assertion
and the retained case that would fail for the same regression. Include the
case's prerequisites, action, and observable result.

| Promise | Slice | Proof |
| --- | --- | --- |
| Narrow and zoomed dialogs keep geometry, text, reachable actions and native tab order, including policy descriptions, all selected option flags and the native touch witness where shared helpers reach it | 1 | `ad-hoc-launch-dialog`, `ad-hoc-start-session-layout`, and recipients of any changed viewport or reachability helper |
| Launch offers distinguish ready, noted, preparing and unavailable in both schemes, with real hover, keyboard focus and disclosure | 2 | `story-card-launch-offers` in `chromium-desktop`, plus affected callers of the typed story-offer entry |
| Refinement alone sees its options. Held reads, exclusive choices, submitted flags, refusal retention and Cancel reset each have independent proof | 3 | All four current cases in `launch-refinement-options`, including the production start/refusal path and native keyboard choice |
| Recording, pending permission and pending transcription have their own dismissal and recovery observations | 4 | `mounted-instruction-voice`; run its overflow and capture-failure siblings if their shared mount changes |
| Follow-up notes reflect the required answer, including waiting, no waiting and unreadable, with the composed request and Taken-card note still observed | 5 | `follow-up-note-handoff`; existing `e2e/stories/recently-done-follow-up.spec.ts` for affected composition |
| Story and unattached startup keep their typed attempt, status, recovery, protected selection and blank-versus-instructed focus behavior | 6 | `responsive-story-startup`, `responsive-unattached-startup`, `ad-hoc-start-session`, `ad-hoc-start-session-answer`, and affected `story-startup-page` callers. `ad-hoc-creation-entry` keeps the typed creation proof and participates in the full selection. |
| The launch dialog pastes text, refuses invalid images, starts with accepted images and discards on Cancel and Escape | 7 | `launch-attachments`; existing attachment E2E if the dialog or attachment contract changes |
| The model, effort and options appear on the right recorded session and disappear when absent | 8 | `launch-record-details` through the actual card, sidebar and details owners, with independent Board association observations retained |
| The exact whole launch command reaches the elapsed target and has a mapped case roster | 1–8 | Slice 1 establishes the timing checkpoint. Every retained change carries paired evidence. Slice 8 repeats the complete acceptance comparison. |

## Timing evidence and decisions

- The [seed evidence](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-launch-proof-orthogonal)
  records the exact focused command at `1764d8dea` on AC macOS, 16 logical
  CPUs. All 71 cases in 24 files passed. The original configuration took
  28.03 and 29.64 s. A temporary `isolate: false` took 18.18 and 19.79 s
  with the same titles. The 17 other files alone passed in 19.14 s with that
  setting. At 18.18 s those files accumulated 26.99 case-seconds and the seven
  original files 4.87. Case time can guide selection. Elapsed time decides
  acceptance. The new scope reaches slow costs the original seven alone could
  never cover in that experiment.
- The failed attempt (recoverable in plan 771 at `d98865823^`) added
  arrangement and production code with no demonstrated wall-time gain.
  Keep pressure on time spent in real input, repeating setup, and waiting for
  observable states. The scratch Chromium frame-rate flag regressed to
  27.03 s. Leave it out of further rounds.
- A second preparation probe ran
  `npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/launch-refinement-options.spec.ts --workers=2`
  in the normal browser config at `1764d8dea` on 23 November. The refusal
  case took 2.434 and 2.940 s with locator clicks for the two option setup
  choices, and 1.555 and 2.571 s with direct input clicks for those two
  choices. All four titles passed in every round. File-run wall times
  overlapped (21.67/23.95 s baseline, 14.59/27.52 s probe) and start loads
  ranged from 10.04 to 15.27. The probe was reverted. It establishes the
  source of the two actions and the observed refusal path. It leaves the
  saving unconfirmed.
- Reuse `launchOffers` for machine facts, `useLaunchAttempts` over typed
  attempts and `LaunchAttemptSource` for attempt transitions, `StartLaunch`
  and `StartSession` for their respective launch paths, and `launchSubject`
  for recorded words. Let focused cases supply the relevant typed inputs and
  callbacks. Keep the production composed owner for proof that spans owners.
  Avoid a second MachineSessions assembly or a new wrapper in shared test
  support. Follow the [Architectural North Star](../../NORTH-STAR.md)
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
- Treat reusing browser state as a separate candidate. The focused pass
  established the timing lead and roster. Cross-file state isolation and
  whole frontend compatibility are unobserved. Compare with the maintained
  isolation setting first. If reaching the target depends on reusing browser
  state, reassess the remaining slices and give that experiment its own
  bounded proof loop before adopting it. Require the same roster and
  desktop/touch assignments, an intentional different file order across
  consumers of DOM, viewport, storage and media state, and the whole frontend
  group with the candidate. Keep the two named desktop files on their
  fine-pointer instance, whose Linux evidence is recoverable from
  `092de062e:.planning/slice-plans/762-speed-dashboard-launch-proof/diagnosis-launch-browser-input.md`.

## Slices

### 1. Narrow and zoomed launch dialogs keep their full browser proof

Type: Behavior
Status: planned

Begin with the costly layout cases in `ad-hoc-launch-dialog` and
`ad-hoc-start-session-layout`. With temporary per-phase timestamps, measure
mount and reveal, native inputs, resize and paint, and reachability assertions
in one baseline of the two files. Try one removal of evidenced repeated setup
or wait in the highest-cost phase. Reuse the production dialog and
`launch-layout-page` geometry. Take a real narrow and zoomed observation and
retain native Tab, disclosure and hit geometry where asserted. Delete the
instrumentation before verifying the candidate. A before/after run of both
files observes each layout and action cue. If the helper changes, include all
its callers, including the native touch rotation case.

At this first checkpoint run the whole selection at two workers with the
chosen comparison condition. Record the remaining wall gap and which
measured steps in later slices can close it. At the best exploratory time
the gap is still about ten seconds. Continue only when the measured costs
support a route to the target through simpler proof with equivalent
observations. If the gap cannot plausibly close, stop before the next edit
and name the remaining costs, rejected approaches and decision needed.
Apply this check again after any result that changes the remaining estimate.

### 2. Desktop offers keep their hover, keyboard and contrast observations

Type: Behavior
Status: planned

Measure offer transitions, hover/focus and light/dark changes separately.
Try shortening setup before these observations or using one settled render
for adjacent synchronous checks. Keep both note identities and both
availability states, real hover and Tab disclosure, dialog wording,
dismissal/focus, glyph, accessible description and both scheme comparisons.
Use the typed `StoryCardLaunches` input with production offers and callbacks
for the few facts it consumes. Prefer narrowing what the production owner
needs over copying the machine's full launch composition. Prove the whole
desktop spec and affected `story-card-launch-page` consumers, including
refinement options and model/effort.

### 3. Refinement options keep both submission and refusal behavior

Type: Behavior
Status: planned

Trace display through `launchOffers` and the dialog, and refusal through
`LaunchAttemptSource.accept` and the reopened dialog. Measure the repeated
arrangement of option choices and reopening. Use existing typed offer and
acceptance seams to reduce incidental setup. Keep the action that exercises
each contract: native keyboard clear, held reread, exact send, refused
selection retained on reopen, and Cancel clearing the next open. Retain
the Board case if it uniquely observes workflow eligibility or title
ownership. Compare all four cases in paired runs before retaining any
arrangement change. Mapping must preserve the refusal reason and its effect
on the actual dialog.

### 4. Dismissing recording work leaves the next draft clean

Type: Behavior
Status: planned

Time permission and recording transitions separately from opening and
reopening the dialog. The existing `LaunchDialog` mount runs MediaRecorder
and MediaStream against its supplied audio source and typed
`InstructionTranscriptionSource`. Simplify incidental opening or repeated
waiting only where the observed states stay explicit. Preserve native Escape,
the Cancel control, active track shutdown, abort state, and distinct late
permission and transcription results. Compare the voice cases and all
consumers of any changed audio or dialog mount.

### 5. Follow-up note attachment renders the typed answer

Type: Behavior
Status: planned

Let the existing notes reader render the choice from its required note
answer, with the waiting, no-waiting and unreadable cases on that owner.
Reuse the required `storyNotes` page read, or pass its typed answer to the
existing choice rendering if the read is incidental to the case. Preserve
one composed Start session request with the selected notes and Cancel
sending nothing. Keep the Taken-card waiting cue. Compare the file against
its own original proof and verify the existing E2E journey if the composed
path changes.

### 6. Typed attempts keep story and unattached startup behavior

Type: Behavior
Status: planned

Use the existing typed attempts and `LaunchAttemptSource` for tests of
attempt progression. Wire narrow consumers through production offers,
attempts and recovery owners. Replace the remaining test copies of launches
composition in the startup helper and responsive and follow-up mounts as
their cases move. Keep the composed test where it observes handoff between
the card, announcer and terminal, including protected selection, one
announcement per transition, and subsequent inspection focus. Preserve
blank and instructed keyboard starts and the progress and refusal wording.
Run the startup specs in the proof table and every direct and indirect
consumer of the changed mount. If `StartSession` handoff changes, reuse
`e2e/terminals/agent-launch-ad-hoc-terminal.spec.ts` and
`e2e/launches/agent-launch-ad-hoc-instructed.spec.ts` on the affected path.

### 7. The dialog keeps accepted attachments and discards them on dismissal

Type: Behavior
Status: planned

Use the existing launch dialog and its attachment controls with the typed
options/submit collaborators they already take. Move only observations they
own. Keep clipboard input, file rules and explanations, the draft and
accepted-file list sent by Start, both dismissal paths and the no-upload
observation. Run `launch-attachments` and affected existing attachment
E2E consumers of changed submission or upload behavior, including
`e2e/launches/agent-launch-ad-hoc-attachments.spec.ts`.

### 8. Recorded launch words follow their own session

Type: Behavior
Status: planned

Exercise `SessionEntry`, `SessionsSidebarSessionEntry` and `SessionDetails`
with typed launch records using their existing production rendering of
`launchSubject`. Preserve explicit and defaulted model and effort behavior,
options present and absent, and the right story or ad hoc entry. Keep the
composed association and empty Recently done observations wherever there
would otherwise be no discriminating check. Remove spent support only
after tracing its final consumer. Repeat the exact paired whole-selection
comparison, including runner preparation, and close each case disposition.
If the target is still out of reach, record the observed remainder and stop
for the maintainer's decision.

## Proof and local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  and the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
  Use the shared [test-entry selector](../../../.agents/skills/dough-execute-plan/references/test-entry-rules.md)
  for the affected cases. The target frontend specs use MakeMe. Preserve
  existing colocated page objects and apply the selected rules to any E2E
  changes. Keep default test timeouts and omit `test.slow()`.
- Use `caffeinate -s -i npm run test:dashboard:frontend -- <paths> --workers=2`
  on AC and a fully awake macOS host under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  On battery use that policy's fully awake, lid-open `caffeinate -i` fallback
  and inspect the sleep log. For timing, wrap the exact command in
  `/usr/bin/time -p`, capture a fresh proof record with
  `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`, and report wall time, exact
  titles and engine per run. Interleave matched baseline and candidate runs
  and record load, worker count and cache conditions. Final selection is
  `dashboard/frontend-tests/launches` with two workers. Assess host headroom
  before a broad run.
- Run `npm run typecheck:dashboard` for production or config contract
  changes. `StartSession.tsx` and `SessionEntry.tsx` are already at 250
  lines; use their existing rendering seams or fit any needed change
  through cohesive deletion. Run the whole frontend group for changed
  shared runner configuration, including the desktop and touch consumers.
  Keep unaffected native/install, backend and E2E coverage in CI.

## Concern evidence

Slice-plan refinement was unnecessary. Each slice follows one proof loop
from existing setup to a named observable result. Timebox the first
instrumented comparison and single candidate within the 15 active minutes;
command time uses the slice clock. Existing baseline and case roster settle
the measurement route. Slice 1 bounds the open future saving with an early
experiment and stop. A shared runner change is optional and has a separate
proof requirement. The preparation found no additional slice-specific
concern.
