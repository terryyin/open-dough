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
Status: planned

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
