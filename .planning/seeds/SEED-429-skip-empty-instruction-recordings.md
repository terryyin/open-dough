---
id: SEED-429
status: active
planted: 2026-11-24
planted_during: Done-session review proof follow-up
trigger_when: selected from the product backlog
scope: one story
---

# SEED-429 — Skip transcription for empty instruction recordings

<a id="skip-empty-instruction-recordings"></a>

### Skip transcription for empty instruction recordings

**Identity:** SEED-429#skip-empty-instruction-recordings
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer who stops a voice recording before any audio is captured
can record again or keep editing their instruction immediately.

**Observed behavior.** After Stop, the
[recording hook](../../dashboard/src/useInstructionRecording.ts) collects the
recorder's final chunks and sends the Blob to transcription even when it has
zero bytes.

**Example.** Given a typed draft and a recorder that finishes with zero bytes,
when the developer presses Stop and the final data has arrived, the control
returns to Ready and shows “No audio was captured. Try recording again.”
Transcription receives no request and the draft is preserved. An explicit retry
with recorded audio transcribes normally.

**Proof.** Exercise Stop, the final zero-byte recorder data, and an explicit
retry through the mounted instruction voice checks in
`dashboard/frontend-tests/launches/`. Observe the transcription calls and the
visible draft through the dialog.
