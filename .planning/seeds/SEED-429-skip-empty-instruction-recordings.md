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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/807-skip-empty-instruction-recordings/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9f50841e51deb412bdaa3bfdba8b7594f3085556922c3791bcc8f7f0c491496b","plan":"38dc1af21edd7779ff93413d0cb5981c314aa3af0c5b10606bc84af690cb9acb"}}
```

**Goal.** A developer who stops a voice recording before any audio is captured
can record again or keep editing their instruction immediately, instead of
waiting on a transcription request that cannot produce text.

**Scope.** Today the
[recording hook](../../dashboard/src/useInstructionRecording.ts) sends even a
zero-byte Blob to transcription. After an explicit Stop, once the recorder's
final data has arrived, a recording of zero bytes returns the voice control to
Ready with
“No audio was captured. Record again or type the instruction.”, in the wording
of the other instruction voice problems. It sends no transcription request and
leaves the typed draft unchanged. A recording with any audio bytes transcribes
as today. The check applies wherever the instruction voice control is used.
Recordings that hold only container data or silence still go to transcription;
the existing empty-transcript message covers them.

**Key examples.**

- Given the typed draft “Keep this work local” and a recorder whose final data
  totals zero bytes, when the developer presses Stop, the control returns to
  Ready showing “No audio was captured. Record again or type the instruction.”,
  transcription receives no request, and the draft still reads “Keep this work
  local”.
- Continuing from there, the developer presses Record, captures audio and
  presses Stop: transcription receives one request and its text is appended to
  the draft.
