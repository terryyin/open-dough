# Skip transcription for empty instruction recordings

**Identity:** SEED-429#skip-empty-instruction-recordings
**Source:** [Skip transcription for empty instruction recordings](../../seeds/SEED-429-skip-empty-instruction-recordings.md#skip-empty-instruction-recordings)

## Goal and scope

After an explicit Stop whose final recorder data totals zero bytes, the
instruction voice control returns to Ready with “No audio was captured. Record
again or type the instruction.”, sends no transcription request and keeps the
typed draft. A recording with audio transcribes as today. Header-only or silent
recordings still go to transcription, as the seed's scope says.

## Current decisions

- In `recorder.onstop` of `dashboard/src/useInstructionRecording.ts`, after
  the explicit-Stop check, fail with the new problem when the collected bytes
  are zero, before building the Blob or calling `source.transcribe`.
- Add the message beside the other instruction voice problems in
  `dashboard/src/instructionTranscription.ts` so `safeInstructionProblem` and
  the dialog treat it like them.
- Prove it in
  `dashboard/frontend-tests/launches/mounted-instruction-voice-capture-failures.spec.ts`,
  whose cases already assert “no transcription request” and the preserved
  draft. Give `audioInput()` in `instruction-voice-page.ts` an operation that
  makes the recorder deliver empty data, by wrapping the
  `MediaRecorder.prototype.ondataavailable` setter so the hook's handler
  receives an empty `Blob`, and restoring it for the retry. Apply
  [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [Dough page objects](../../../.agents/skills/dough-page-objects/SKILL.md);
  keep the default test timeout.

## Decisive premises

| Consuming operation | Observation and result |
| --- | --- |
| A mounted check can produce zero-byte final data and observe today's request | At `4dcc2c44f`, a scratch spec in `dashboard/frontend-tests/launches/` used `audioInput()`, wrapped the `ondataavailable` setter to deliver `new Blob([])`, mounted `mountInstructionVoice()`, filled the draft and ran `recordClip()`. Run through `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:frontend -- <spec>` in Chromium, it passed: transcription received one request whose audio `size` was `0`. The symptom is reproduced and the seam works; the scratch spec was removed. |

## Slices

### 1. An empty recording returns to Ready without transcribing

Type: Behavior
Status: done

Behavior: typed draft “Keep this work local”, a recorder whose final data
totals zero bytes → Record, then Stop → the control is Ready and shows “No
audio was captured. Record again or type the instruction.”, transcription has
no request, and the draft is unchanged. Restoring real recorder data, Record
then Stop → one transcription request, and its text is appended to the draft.

**Proof.** The new case in `mounted-instruction-voice-capture-failures.spec.ts`
fails on the current hook (one transcription request with zero-byte audio) and
passes with the change. The instruction voice specs in
`dashboard/frontend-tests/launches/mounted-instruction-voice*.spec.ts` pass
through `npm run --silent test:dashboard:frontend -- <files>`.

**Accepted proof.** Before the hook change the new mounted case returned to
Ready and observed one transcription call. After the change it observed Ready,
zero calls, the recovery message, and the unchanged draft. A retry with
native recorder bytes made one call, appended its text, and cleared the alert.
The focused launch, story-note, and terminal set passed 21 tests in eight
files. All six focused E2E specs for voice recording and terminal readiness
passed. The independent refactor made the retry wait for recorder bytes and
passed all three tests in the changed Chromium spec. The production change and
other proof boundaries stayed unchanged during that pass.

## Concern evidence

Refinement was not needed: one slice with a settled seam and a single owner.
This review found no remaining slice-specific concern.

## Verification and delivery

- Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Local gate: the focused instruction voice specs above, a few seconds each;
  no full group run is planned, so the
  [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  (`caffeinate -s -i`, AC power) applies only if a full run becomes necessary.
  Hosted CI runs the full frontend group after publication.
- The execution workspace needs a complete `npm ci` on the pinned
  `.node-version` before proof. Apply the normal post-change refactor and the
  commit and publication gates.

## Execution context

Story Branch Mode, publisher `dashboard-territory.local-open-dough`, agent
Tsubomi-chan. The selected worktree and branch use
`skip-transcription-for-empty-instruction-recordi` and publish increments to
`origin/codex/skip-transcription-for-empty-instruction-recordi`. The accepted
Take base is `857f494304b9cee05b3aa88958ef8883ec4dc75d`. The Take was on
trunk, outside the story-branch observer's coverage.

CI is the push workflow `ci.yml` in `terryyin/open-dough`. Codex coordinator
`seed-429-6b7bcbeb` armed the story-branch observer in
`/tmp/dough-ci-501/watch-NgD3ew` (cell `g41:8`, session `21059`, PID `28110`).

## Execution complete

Product advice: no change. The mounted launch regression exercises the shared
recorder through explicit Stop and a successful retry. Existing real-recorder
journeys preserve the nonempty request and review paths. The guard stays in
the browser recording hook and uses the same failure and cleanup path.

Implementation was accepted on the story branch as
`d6d9ae22cde916b8a82ed93e5d89ec3d6d13ef7f`. The coordinator repaired two
fixture lint findings during delivery and reran the three affected mounted
cases before publishing. The retrospective recorded the formatting retry
under ODF-329 in `DearDough.md` and found no product follow-up.

CI run `45345508896` exposed a native zero-byte Stop in an existing test
that expected a held request. The failure screenshot showed Ready and the
new message. The repair makes existing positive recordings wait for native
bytes before Stop and preserves the original assertions and explicit empty
case. All 21 focused mounted tests passed again. The [diagnosis](diagnosis-mounted-voice-capture.md)
retains the failed attempt and the repair's observations.
