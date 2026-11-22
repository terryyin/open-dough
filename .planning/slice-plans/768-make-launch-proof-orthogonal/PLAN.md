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
| A transcript at, one over, or well over 4,000 combined characters. | The overflow, edit and discard rules run on transcript text at their production owner. Held reply, late permission, track loss and capture failures still record through the real recorder. | 3 |
| A story card starts, recovers or attaches notes. | Presentation, recovery and note attachment run from typed status, attempt and read, and notes. One representative keyboard launch-to-focus journey stays. | 4, 5 |
| The whole selection runs at two workers. | About 7–8 s wall including preparation, paired with the starting selection under similar load. Every retired observation names its replacement. | 6 |

## Current decisions

- Before removing an assertion, name the retained case that fails for the
  same regression. Record the mapping in this plan per slice.
- Production narrowing is allowed only where production uses the narrowed
  owner. Never add an optional member, context default or defaulted
  parameter to make a test arrangement possible.
- Compare timing as paired runs under similar load (one-minute load
  recorded at start and end), never against the 32.04 s figure alone.
- If the target cannot be reached without losing a distinct observation,
  stop at Slice 6 with the measured remainder and its cause for Terry.

## Decisive premises observed

Observations ran in the preparation checkout at `d33ded4f9` on
2026-11-22, macOS on AC, Node 24.21.0, `npm ci` from the lockfile, with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i`.

| Consuming operation | Observed form and result | Limit |
| --- | --- | --- |
| Whole-selection measurement | `npm run test:dashboard:frontend -- dashboard/frontend-tests/launches --workers=2` passed 72/72 in 23 files: 36.7 s wall, Vitest 33.66 s, 51.3 summed case-seconds, load 14.4 → 13.7. Most costly files (summed s): `ad-hoc-launch-dialog` 6.62, `launch-model-effort` 4.00, `story-card-launch-offers` 3.65, `ad-hoc-start-session-layout` 3.33, the three dictation files 8.38, `launch-refinement-options` 3.14, `ad-hoc-refinement-touch` 2.89. | Taken under high load; Slice 1 retakes the paired baseline. |
| Fixed cost per run | One browser file (`ad-hoc-start-session.spec.ts`, 2 cases, 1.45 s of cases) took 3.9 s wall; a non-browser file took 2.3–2.6 s. About 2.5 s is fixed, leaving roughly 11 case-seconds across two workers. Wall exceeds half the summed case time by about 11 s, so per-file import, mount and imbalance count. | Per-file cost is not yet broken down; Slice 6 measures it. |
| Runner isolation | `dashboard/frontend.vitest.config.mts` sets `isolate: true` and adds a `chromium-desktop` instance for `story-card-launch-offers` and `story-card-startup` (fine pointer). | Changing either is shared group configuration. |
| Dense selection input | `LaunchDialog` accepts `kept` (the selection to start from) from `StartLaunch`, which sets it only after a refused Start. `StartSession` renders the same dialog. | False (Slice 1 probe at `0a6217aeb`): `kept` starts empty in `StartLaunch.tsx:139` and only a refused Start sets it from clicked choices; `StartSession` passes neither `options` nor `kept`, and its workspace and landing radios change only by clicking. Selection is arranged by clicking once per case. |
| Transcript text entry | Overflow review lives inside `useLaunchInstruction` (`LaunchInstruction.tsx`) and is fed only by `useInstructionRecording`'s transcript callback. No production owner takes transcript text directly. | Slice 3 must narrow production first. |

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
200% cases (G1 in Slice 4).

### 2. Shared model and effort reset is proved once at the dialog

Type: Behavior
Status: planned

Reshape `launch-model-effort`, `launch-native-effort` and
`launch-host-catalog`. Prove dismissal reset at the shared dialog once.
Keep one case per launcher for its distinct launch and focus wiring. Check
host-specific effort and request normalization at the contract that owns
them, without reopening three launchers.

Proof: the three files pass with paired timing and a mapping; the backend
reread case for requested effort still passes.

### 3. Transcript overflow and editing run on transcript text

Type: Behavior
Status: planned

Let the overflow review stand alone in production, taking transcript text,
with `useLaunchInstruction` rendering it from the recording callback.
Move `mounted-instruction-voice-overflow` cases to that owner with text
input and the exact LaunchChoices at Start. Keep held reply, late
permission, track loss and capture failures in `mounted-instruction-voice`
and `mounted-instruction-voice-capture-failures` at the recording boundary,
trimming repeated recordings.

Proof: the three dictation files pass with paired timing and a mapping; the
launch E2E 4,000-character case and dashboard typecheck pass.

### 4. Story card startup and recovery run from typed status and attempts

Type: Behavior
Status: planned

Reshape `story-card-startup`, `story-card-launch-offers`,
`story-card-launch-dialogs`, `responsive-story-startup`, `startup-recovery`
and `startup-recovery-reads`. Presentation takes typed status; recovery
takes its typed attempt and read. Keep one keyboard launch-to-focus journey
and check announcements through the real announcer. Revisit whether the two
desktop-pointer files still need their own Chromium instance.

Proof: the six files pass with paired timing and a mapping.

### 5. Unattached start, attachments and note handoff run from typed inputs

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

### 6. The whole launch selection runs in about eight seconds

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

Slice-plan refinement was not needed: six Behaviors, each one launch
family with its own proof loop, within the eight-slice limit. Slice 1
bounds the dense-selection premise with its early probe. Slices 4 and 5
touch six and seven files, but most are one- to three-case files under
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
  group only if Slice 6 changes shared runner configuration.

## Story obligations

### G1. Story card 200% zoom case may run at 100%
Reported: slice 1 — "Applying the 200% zoom and then resizing the window resets zoom to 100%; story-card-launch-offers.spec.ts:131-132 zooms before resizing."
Story clause: "Preserve genuine browser conditions (viewport, zoom, touch, pointer, native input and focus)"
Disposition: receiving slice 4
