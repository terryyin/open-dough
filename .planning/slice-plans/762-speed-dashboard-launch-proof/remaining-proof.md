# Dictation, follow-up and responsive startup proof

See [launch proof for slices 1–6](proof.md) for the original baseline and
the other retired cases.

## Plan review

The eight Behavior slices cover distinct compose, refuse, and recover
outcomes through the same `LaunchDialog` and typed launch attempts. Native
host and installation journeys remain in E2E. The initial 81-case roster
can consolidate where setup and risk coincide. Slices 1, 5, 7, and 8 name
their early probes for host catalog, transcription, and terminal handoff.

## Comparable two-worker baseline

Reran the 29 legacy specs in an isolated checkout at `3eef0b526` on the
same Mac, on AC power with Node 24.21.0 and the same locked dependencies.
`caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches --workers=2`
passed all 81 cases in 46.48 s including preparation and CLI startup,
with 74.98 summed case-seconds. One-minute load went from 3.98 to 4.58.
The slowest were transcript overflow and discard (4.31 s), touch
rotation and Cancel (3.16 s), and dialog layout with every option
selected (2.42 s). This measurement supersedes the original 68.68 s
measurement for comparison at lower machine load.

## Slice 7. Instruction dictation

The early mounted case stopped an actual Chromium recorder on a
generated audio track. Cancel aborted the held call at the typed
transcription boundary and cleared the interaction. Microphone track
release and the next dialog's empty instruction were observed after a
late answer. Production supplies the same source interface.

| Retired file and title | Mounted destination and observation |
| --- | --- |
| `session-instruction-voice-lifecycle.spec.ts` · a held transcription is abandoned on Cancel; reopening stays empty and microphone tracks are released | `mounted-instruction-voice.spec.ts` · Cancel abandons a held transcription and a late reply leaves the next dialog empty. Asserts audio MIME and bytes, released track, Transcribing status, readonly instruction, disabled Start, enabled Cancel, aborted signal, no Start, and empty, ready next dialog. |
| `session-instruction-voice-lifecycle.spec.ts` · Escape stops active capture; a late permission grant after dismissal cannot record into a reopened dialog | `mounted-instruction-voice.spec.ts` · Escape stops active recording and late permission after either dismissal cannot populate the next dialog. Escape while Recording ends the track with zero requests. During permission the dialog protects its field and Start. After each dismissal and reopening, resolving an actual live stream ends its tracks, leaves the next field empty and dialog ready, and sends no request or Start. |
| `session-instruction-voice-lifecycle.spec.ts` · unexpected real microphone track end preserves typed text and makes no transcription request | `mounted-instruction-voice.spec.ts` · unexpected microphone track end keeps the typed draft editable without requesting transcription. Stops the real input track during recording, observes the ended-before-Stop alert, preserved value, editable field, Start and Record availability, ended track, and zero transcription/Start calls. |
| `session-instruction-voice-lifecycle.spec.ts` · a completed response delivered after Cancel cannot populate the next launch dialog | `mounted-instruction-voice.spec.ts` · Cancel abandons a held transcription and a late reply leaves the next dialog empty. Supplies successful text after reopening and awaits that reply, then proves the empty field, idle instructions, available Start, released track and zero sends. Separate mounted Escape case verifies both abort and reply abandonment on keyboard dismissal. |
| `session-instruction-voice-overflow.spec.ts` · exactly 4,000 combined characters, including the separator, append ordinarily and Start sends them unchanged | `mounted-instruction-voice-overflow.spec.ts` · exactly 4,000 combined characters including the separator append and Start sends them unchanged. Uses production story Session policy, exact combined value, absence of review, editable field, one clip, zero pre-Start sends and one exact LaunchChoices instruction after Start. Existing launch E2E covers the same 4,000 reaching story-session argv. |
| `session-instruction-voice-overflow.spec.ts` · one character over retains both drafts; keyboard shortening adds once and edited final text is what Start sends | `mounted-instruction-voice-overflow.spec.ts` · one character over keeps both drafts; keyboard shortening adds once and Start sends only the final edit. Original and transcript retained independently, candidate focused, original readonly, Start/Record/Add disabled, whitespace candidate still disabled with its cue and original unchanged, adding a 4,000-character combined correction with surrounding whitespace from the keyboard, field focus and editability restored, no remaining review, unchanged single clip count, final edited value asserted at Start boundary exactly once. |
| `session-instruction-voice-overflow.spec.ts` · the complete transcript beyond 4,000 remains editable; keyboard discard and launch dismissal clear only transient review | `mounted-instruction-voice-overflow.spec.ts` · the full over-limit transcript stays editable; discard keeps the draft and either dismissal clears review. Confirms the full transcript is editable and focused. Tab and Enter discard it, keeping the draft editable and restoring focus and Start. The next clip appends. Cancel and Escape each clear draft and candidate on reopen. Four clips were captured with zero starts. |
| `session-instruction-voice-capture-failures.spec.ts` · permission unavailability makes no transcription request and recovers within the same dialog | `mounted-instruction-voice-capture-failures.spec.ts` · permission refusal makes no transcription request and an explicit retry works in the same dialog. Browser NotAllowedError shows the exact public alert without its private diagnostic. The original stays editable with zero captures or requests. Retry appends once and clears the alert. Start sends the exact final instruction. |
| `session-instruction-voice-capture-failures.spec.ts` · device unavailability makes no transcription request and recovers within the same dialog | `mounted-instruction-voice-capture-failures.spec.ts` · an unavailable device makes no transcription request and typed Start works in the same dialog. Browser NotFoundError sets distinct device alert, no diagnostic/tracks/request, original remains editable, Start sends only typed final value. |
| `session-instruction-voice-capture-failures.spec.ts` · format unavailability makes no transcription request and recovers within the same dialog | `mounted-instruction-voice-capture-failures.spec.ts` · an unsupported recording format makes no transcription request and typed Start works in the same dialog. Browser recorder rejects all supported-format probes, distinct format alert, no diagnostic/tracks/request, original remains editable, Start sends only typed final value. |

Ten mounted cases in three files passed in 8.47 s including preparation
and CLI startup (11.90 summed case-seconds). The same-checkout legacy
selection of ten passed in 13.05 s (15.63 summed). The full over-limit
transcript and discard was the slowest mounted case at 2.56 s, down from
3.44 s in the legacy selection. Both selections used two workers.

The required source preserves the HTTP endpoint, audio body, cancellation
signal, validation and public answer mapping. Existing coverage passed for
voice capture, installed keys, exact story and unattached input and provider
recovery in launch E2E (9), terminal E2E (9), notes and terminal capture in
built-app Playwright (11), the real backend voice boundary (4), and the
affected mounted owners (27). Dashboard typecheck passed. See
`slice7-implementation.md` in Git evidence for the commands and receipts.

Independent refactoring made typed provider failures use the same
sanitizing recovery path as transport exceptions. Two provider and
terminal E2E cases, a built-app Story Notes case, and dashboard typecheck
passed. See `slice7-refactor.md`.
