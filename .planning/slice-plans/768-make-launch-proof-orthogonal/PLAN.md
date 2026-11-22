# Get launch unit proof in about eight seconds

**Identity:** SEED-413#make-launch-proof-orthogonal
**Source:** [Get launch unit proof in about eight seconds](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#make-launch-proof-orthogonal)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Dashboard maintainers get the launch unit selection
(`npm run test:dashboard:frontend -- dashboard/frontend-tests/launches --workers=2`)
in about 7–8 s wall including preparation. Each case arranges its
preconditions at the smallest production owner through typed inputs and
depends only on what can change its asserted result. Independent dimensions
are proved separately; combinations stay where they change the result.

Included: the 23 Vitest specs and page helpers under
`dashboard/frontend-tests/launches/`, production narrowing that lets an owner
stand alone in production, and spent launch test support. Excluded: new E2E
cases, the native, install and backend journeys (they keep their owners), and
other frontend families. A shared runner configuration change needs whole
frontend group proof. Apply the
[shared acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories).

## Key examples and proof

| Given and trigger | Observer and expected result | Slice |
| --- | --- | --- |
| A refinement or Start session dialog with every option selected, at each viewport where layout differs. | Layout cases arrange the selection through a production input and assert reach, stacking and no sideways scroll. One case proves option-to-command mapping, one proves native tab order, one touch-resize case keeps the draft. | 1 |
| Model and effort are chosen and the dialog is dismissed. | Reset is proved once at the shared dialog. Each launcher keeps one case for its own launch and focus handoff; host effort rules are checked without reopening three launchers. | 2 |
| A transcript at, one over, or well over 4,000 combined characters. | The overflow, edit and discard rules run on transcript text at their production owner. Held reply, late permission, track loss and capture failures still record through the real recorder. | 3, 4 |
| A story card starts, recovers or attaches notes. | Presentation, recovery and note attachment run from typed status, attempt and read, and notes. One representative keyboard launch-to-focus journey stays. | 5, 6, 7 |
| The whole selection runs at two workers. | About 7–8 s wall including preparation, paired with the starting selection under similar load. Every retired observation names its replacement. | 8 |

## Current decisions

- Before removing an assertion, name the retained case that fails for the
  same regression. Record the mapping in this plan per slice.
- Production narrowing is allowed only where production uses the narrowed
  owner. Never add an optional member, context default or defaulted
  parameter to make a test arrangement possible.
- Compare timing as paired runs under similar load (one-minute load
  recorded at start and end), never against the 32.04 s figure alone.
- If the target cannot be reached without losing a distinct observation,
  stop at Slice 8 with the measured remainder and its cause for Terry.

## Decisive premises observed

Observations ran in the preparation checkout at `d33ded4f9` on
2026-11-22, macOS on AC, Node 24.21.0, `npm ci` from the lockfile, with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i`.

| Consuming operation | Observed form and result | Limit |
| --- | --- | --- |
| Whole-selection measurement | `npm run test:dashboard:frontend -- dashboard/frontend-tests/launches --workers=2` passed 72/72 in 23 files: 36.7 s wall, Vitest 33.66 s, 51.3 summed case-seconds, load 14.4 → 13.7. Most costly files (summed s): `ad-hoc-launch-dialog` 6.62, `launch-model-effort` 4.00, `story-card-launch-offers` 3.65, `ad-hoc-start-session-layout` 3.33, the three dictation files 8.38, `launch-refinement-options` 3.14, `ad-hoc-refinement-touch` 2.89. | Taken under high load; Slice 1 retakes the paired baseline. |
| Fixed cost per run | One browser file (`ad-hoc-start-session.spec.ts`, 2 cases, 1.45 s of cases) took 3.9 s wall; a non-browser file took 2.3–2.6 s. About 2.5 s is fixed, leaving roughly 11 case-seconds across two workers. Wall exceeds half the summed case time by about 11 s, so per-file import, mount and imbalance count. | Per-file cost is not yet broken down; Slice 8 measures it. |
| Runner isolation | `dashboard/frontend.vitest.config.mts` sets `isolate: true` and adds a `chromium-desktop` instance for `story-card-launch-offers` and `story-card-startup` (fine pointer). | Changing either is shared group configuration. |
| Dense selection input | `LaunchDialog` accepts `kept` (the selection to start from) from `StartLaunch`, which sets it only after a refused Start. `StartSession` renders the same dialog. | False (Slice 1 probe at `0a6217aeb`): `kept` starts empty in `StartLaunch.tsx:139` and only a refused Start sets it from clicked choices; `StartSession` passes neither `options` nor `kept`, and its workspace and landing radios change only by clicking. Selection is arranged by clicking once per case. |
| Transcript text entry | Overflow review lives inside `useLaunchInstruction` (`LaunchInstruction.tsx`) and is fed only by `useInstructionRecording`'s transcript callback. No production owner takes transcript text directly. | Slice 3 must narrow production first. The Slice 3 return at `73d028a52` found Start, the read-only field and the disabled Start and Record during review are `LaunchDialog` composition, and the fit check receives each transcript as an arrival; a standalone owner has no Start. |

## Slices

### 1. Dense launch layout is arranged through a production selection input

Type: Behavior
Status: done

Baseline retaken at `0a6217aeb`: whole selection 56.25 s wall at load
21.6 → 18.4 (evidence `baseline-whole-selection-1.log`). The dense-selection
premise is false (see the premise row), so each dialog keeps one clicked
selection case. That case selects every option once and observes layout at
each viewport where it differs by resizing and re-zooming in the same setup
(`page.viewport` and the device-metrics override), instead of separate
geometry cases that each reselect. Reshape `ad-hoc-launch-dialog`,
`ad-hoc-start-session-layout`, `ad-hoc-refinement-touch` and
`launch-refinement-options` that way: one case maps options to command
flags, one proves tab order, one touch-resize case keeps the draft at
constrained height.

Proof: the four files pass; paired before/after timing of those files;
mapping of every retired observation.

Mapping (13 → 10 cases; four files 19.17 s at load 11.2 → 17.1 before,
16.07 s at load 12.8 → 13.9 after):

- Refinement 320 px and 200% geometry cases → the dense refinement case,
  which also owns the all-flags command mapping. The 200% half now waits
  for `devicePixelRatio` 2, because zooming before a resize resets to 100%.
- First refinement case's `--explore --ux-ui` command text → the dense
  case's all-flags check; it keeps tab order and the "(2)" summary.
- Start session offered 320 px and 200% pair → one offered case;
  unavailable pair → one unavailable case, both at both sizes.
- No Approach `--c` preview text → the dense case's flag check plus the
  same case's submitted `options: ["--c"]`.

Learning: `zoomToTwoHundredPercent()` in `launch-layout-page.ts` resizes,
then zooms and waits for `devicePixelRatio` 2. Later slices reuse it for
200% cases (G1 in Slice 5).

### 2. Shared model and effort reset is proved once at the dialog

Type: Behavior
Status: done

Reshape `launch-model-effort`, `launch-native-effort` and
`launch-host-catalog`. Prove dismissal reset at the shared dialog once.
Keep one case per launcher for its distinct launch and focus wiring. Check
host-specific effort and request normalization at the contract that owns
them, without reopening three launchers.

Proof: the three files pass with paired timing and a mapping; the backend
reread case for requested effort still passes.

Mapping (11 → 12 cases; three files 20.15 s at load 22.5 → 26.7 before,
15.49 s at load 24.4 → 25.0 after):

- Cancel and Escape cases that reopened all three launchers → one reset
  case at the shared dialog, plus one launch-and-focus case per launcher
  (story card execution and refinement together, Start session alone).
- Host-catalog failed-read reset tail → the shared reset case.
- Native-effort tab order → the Slice 1 refinement tab-order case; its
  host-switch effort defaults → "changing hosts resets model and effort
  to each host's default", which also took over the catalog case's
  host-switch model reset; its reopen reset → the shared reset case.
- Mounted Cursor invalid-effort case → a direct `launchSettingsBlocked`
  case for the Cursor rule; `aria-invalid`, disabled Start and the shared
  "cannot be verified" feedback stay observed in the Codex case.
- The backend reread case for requested effort passed, observed through
  `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD`; the backend runner prints
  nothing on a pass.

### 3. Transcript fit and review run on transcript text

Type: Behavior
Status: done

Narrow production in `LaunchInstruction.tsx`: export the combined-text fit
rule (draft, blank line, transcript against `launchInstructionLimit`) that
`useLaunchInstruction` already applies, and extract the review (hint,
editable focused candidate, combined-length line, Add and Discard) into a
`TranscriptReview` component with required typed props that
`useLaunchInstruction` renders from the recording callback. Prove exactly
4,000 combined characters including the separator, one over and well over
as direct logic cases of the rule. Move the editing, keyboard shortening,
Add-once and Discard cases of `mounted-instruction-voice-overflow` to a
spec that mounts `TranscriptReview` with transcript text. Keep one
recording case that observes the composed consequence at Start: an
over-limit transcript blocks Start and Record until review ends, and the
final edit is what Start sends. Delete the overflow spec when empty.

Proof: the moved cases and the retained recording case pass with paired
timing against `s3-before.log` and a mapping; consumers of
`useLaunchInstruction` (`StoryNotesDialog` specs) pass; the launch E2E
4,000-character case (`e2e/launches/session-instruction-voice.spec.ts:165`)
and dashboard typecheck pass.

Mapping (3 overflow cases → 3 `transcript-review` cases and 2 recording
cases; dictation files 16.02 s at load about 18 before, 11.80 s after at
equal or higher load):

- Exactly 4,000 appends unchanged → the fit-rule case, with the E2E
  4,000-character case for the composed Start.
- One over: both drafts kept, keyboard shortening adds once, Start sends
  the final edit → the `TranscriptReview` shortening case plus the kept
  recording case (Start and Record blocked during review, read-only field,
  exact LaunchChoices after Add).
- Well over stays editable, Discard → the `TranscriptReview` well-over
  case; Discard keeps the draft with field focus and Escape during review
  leaves the reopened dialog empty → the new recording case (G3). Cancel
  shares Escape's close path, proved in Slice 2.
- `useLaunchInstruction` consumers passed: the four launch dictation specs
  and the story-notes specs (30/30), and the built-app note-voice specs
  (4/4) in their own run, which a mixed path list skips.

CI repair (run 44993112421 on `cb1ae5ce`): the G3 case pressed Tab before
`TranscriptReview`'s mount effect focused the candidate; it now waits for
the candidate's focus first (10 consecutive passes, `ci1-repeat-*`).

### 4. Native recording proof keeps only its distinct races and failures

Type: Behavior
Status: done

Trim `mounted-instruction-voice` and
`mounted-instruction-voice-capture-failures` to the held reply, late
permission, track loss and capture-failure cases at the recording
boundary, observing Cancel and Escape variants in one setup where they
share it. Remove `instruction-voice-page.ts` and `hold` code whose last
consumer goes.

Proof: the two files pass with paired timing and a mapping.

Mapping (7 → 5 cases; interleaved pairs at load 29 → 19: before 8.47 s
and 8.05 s, after 6.52 s and 6.83 s):

- Cancel and Escape held-transcription cases → one case running both
  rounds in one setup with every assertion per round; both reach
  `dictation.cancel()` in production, and both stay because the abort of
  in-flight work is the race. "Cancel is enabled" → the Cancel click.
- Unavailable-device and unsupported-format cases → one case observing
  each failure's wording, kept draft, hidden diagnostic and no tracks in
  turn, then typed Start; permission refusal keeps its own case because
  its recovery is an explicit retry that transcribes.
- Late permission and track loss are unchanged. No helper lost its last
  consumer.

### 5. Story card presentation runs from typed status and offers

Type: Behavior
Status: done

Reshape `story-card-launch-offers`, `story-card-launch-dialogs`,
`story-card-startup` and `responsive-story-startup`. Presentation takes the
typed `StoryStartup` status (`storyStartup.ts`, `StartupStatus.tsx`) at the
owner production renders it through, instead of the hand-built `launches`
composite in `story-card-launch-page.ts` where a typed owner exists. Keep
the keyboard start in `responsive-story-startup` as the one mounted
launch-to-focus journey, with announcements observed through the real
`StartupAnnouncer`. Make the 200% case use `zoomToTwoHundredPercent()`
(G1). Report which cases need the `chromium-desktop` fine-pointer instance:
the hover-tooltip cases in `story-card-launch-offers` do; the
`story-card-startup` layout check looks viewport-driven and is unverified.

Proof: the four files pass with interleaved paired timing and a mapping.

Mapping (story-card-startup 1 case replaced; four files 14/14):

- The composed host × workflow × establishing sample → a `StartupStatus`
  case rendered from typed `StoryStartup` for the same 8 combinations;
  the "Local startup in progress" note stays in the keyboard journey;
  disabled Starts during progress stay in the accepted-start cases and the
  keyboard journey; host and workflow derivation stays composed for
  Claude (G4).
- Both fine-pointer files still need `chromium-desktop`: the hover
  tooltips in `story-card-launch-offers`, and the refinement refusal
  layout in `story-card-startup`, whose two Starts stack under the default
  instance even at 1440 px (observed twice on a scratch copy).
- Timing: no measurable file-level change; the replaced case fell from
  122–158 ms to 40–71 ms. The interleaved pair is not comparable because
  the scratch before-copy ran on the default instance.
- The remaining offers, dialogs and responsive cases stay mounted through
  `mountStoryLaunches`, which builds `MachineSessions` from production
  `launchOffers` (G5).

### 6. Startup recovery runs from its typed attempt and read

Type: Behavior
Status: planned

Reshape `startup-recovery` and `startup-recovery-reads`. Recovery runs from
a typed `StartupRecoveryItem` and `AttemptEvidence` at `StartupRecovery`
(`startupRecoveries.ts`). Keep one composed race per distinct recovery
path: uncertain after acceptance; lost acknowledgment, unsuccessful recheck
and confirming read; the unanswered evidence read with Recheck; Cursor
without native-check advice; and the protected-card focus. Remove
`mounted-launch-attempts.ts` and `story-startup-page.ts` code whose last
consumer goes.

Proof: the two files pass with interleaved paired timing and a mapping.

### 7. Unattached start, attachments and note handoff run from typed inputs

Type: Behavior
Status: planned

Reshape `ad-hoc-start-session`, `ad-hoc-start-session-answer`,
`ad-hoc-creation-entry`, `responsive-unattached-startup`,
`launch-attachments`, `launch-record-details` and
`follow-up-note-handoff`. Note attachment takes its typed notes; startup
takes its typed answer. Keep the distinct no-waiting and unreadable notes
states.

Proof: the seven files pass with paired timing and a mapping; composed E2E
owners named in the source map still pass.

### 8. The whole launch selection runs in about eight seconds

Type: Behavior
Status: planned

Measure per-file overhead and worker balance on the reshaped selection.
Merge files that share one owner and setup where that cuts import and
mount cost; remove spent page helpers and test support. A shared runner
setting changes only with whole frontend group proof. Then run the paired
whole-selection comparison.

Proof: paired whole-selection wall including preparation at two workers,
counts by file, the slow cases that remain, and the complete case map. If
the target is missed without a remaining safe reduction, stop with the
measured remainder for Terry.

## Concern evidence

Slice-plan refinement was not needed at planning: six Behaviors, each one
launch family with its own proof loop, within the eight-slice limit. At
Slice 3 the transcript-entry premise proved incomplete (see its row): the
production narrowing and the recording trim were split into Slices 3 and 4,
moving later slices down one. At Slice 5 two composition helpers
(`story-card-launch-page.ts` and `story-startup-page.ts` with
`mounted-launch-attempts.ts`) and about 1,400 test lines split
presentation and recovery into Slices 5 and 6: eight, at the limit. Slice 1
bounds the dense-selection premise with its early probe. Slices 5 to 7
touch four, two and seven files, but most are one- to three-case files under
1 summed second each and share one typed-input change, so each fits one
slice. This review found no remaining slice-specific concern.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page objects](../../../.agents/skills/dough-page-objects/SKILL.md). Keep
  default timeouts and omit `test.slow()`.
- Run launch proof with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run --silent test:dashboard:frontend -- <paths> --workers=2`
  on AC power under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Run dashboard typecheck after production edits. Run the whole frontend
  group only if Slice 8 changes shared runner configuration.

## Story obligations

### G1. Story card 200% zoom case may run at 100%
Reported: slice 1 — "Applying the 200% zoom and then resizing the window resets zoom to 100%; story-card-launch-offers.spec.ts:131-132 zooms before resizing."
Story clause: "Preserve genuine browser conditions (viewport, zoom, touch, pointer, native input and focus)"
Disposition: proved by slice 5: story-card-launch-offers.spec.ts "story Starts keep their reading order and visible keyboard focus at narrow and zoomed widths" calls zoomToTwoHundredPercent(), which polls devicePixelRatio to 2 and asserts the 640x450 window before the zoomed focus checks; evidence s5-final-1.log

### G2. Shared reset case remounts the dialog itself
Reported: slice 2 — "The shared reset case remounts LaunchDialog through a new key, so it would not catch a launcher that keeps its dialog mounted, or passes kept, after dismissal."
Story clause: "Distinct launch behavior and the existing composed journeys stay covered"
Disposition: proved by slice 2: launch-model-effort.spec.ts per-launcher dismissal cases assert the dialog is no longer in the document after Escape or Cancel; launch-refinement-options.spec.ts "a refused selection stays checked until Cancel and is clear when next opened" observes kept clearing through StartLaunch

### G3. Launch dialog loses discard and dismissal during review
Reported: slice 3 — "In the launch dialog unit specs, no case now covers Discard, Cancel or Escape while the review is open (draft kept, focus back on the field, review cleared)."
Story clause: "Distinct launch behavior and the existing composed journeys stay covered"
Disposition: proved by slice 3: mounted-instruction-voice-overflow.spec.ts "Discard in review keeps the draft focused, and Escape in review leaves the reopened dialog empty" (two over-limit recordings through the real recorder; Discard keeps draft and field focus; Escape closes, reopen shows empty field and no candidate; send never called); evidence s3-g3-2.log

### G4. Codex host derivation no longer composed
Reported: slice 5 — "Codex-specific derivation is no longer composed, but host passes through storyStartup() unchanged and the Codex wording is in the typed case."
Story clause: "Distinct launch behavior and the existing composed journeys stay covered"
Disposition: proved by slice 5: storyStartup.ts copies request.host for every host with no host branch, so the composed Claude accepted-start cases in story-card-startup.spec.ts observe the one derivation path, and the typed StartupStatus case observes the Codex wording

### G5. Story card helper copies the MachineSessions composition
Reported: slice 5 — "story-card-launch-page.ts hand-builds the whole launches composite with launchOffers and inert attemptOf/storyStartupOf/keptStartOf stubs; no production owner takes those cases without copying the composition."
Story clause: "tests never copy a production composition"
Disposition: receiving slice 8
