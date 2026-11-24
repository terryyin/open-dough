# Diagnosis: story-note-voice-clip

## Failure
- CI run https://github.com/terryyin/open-dough/actions/runs/45305912032 attempt 1, job "dashboard-frontend / shard 2/2" (138149704020), SHA 28407491faf579a14072b10eb29fdf39e52d6a5f (merge of origin/main into story branch). Log: `$E/ci-45305912032-shard2.log`.
- Signature: `dashboard/frontend-tests/stories/story-note-voice.spec.ts:18` "Taken line dictation waits for permission and transcription, then permits correction before saving exact context": `AssertionError: expected 0 to be greater than 0` at line 66 (`transcribe.mock.lastCall?.[0].size`).
- CI trace: "Recording…" visible at +415ms, Stop clicked at +417ms (55ms click). The clip handed to transcription was empty.

## Attribution
- Branch diff vs origin/main touches none of: `dashboard/src/useInstructionRecording.ts`, `dashboard/frontend-tests/stories/story-note-*`, `dashboard/frontend-tests/launches/instruction-voice-page.ts`, `terminal-dictation-page.ts`. Leading attribution: the test (race in the fake capture), not branch or trunk production code.
- Production `useInstructionRecording` calls `recorder.start(250)` and sets phase "recording" immediately; Stop forces a final `dataavailable` carrying whatever the encoder produced. If no audio frame reached the encoder before Stop, the Blob is 0 bytes.
- Same race shape exists in `terminals/session-terminal-voice.spec.ts:42` and `session-terminal-voice-touch.spec.ts:42` (also assert size > 0).

## Round 1 (hypotheses and experiments)
### H1: Stop before any audio frame reaches the encoder yields a 0-byte clip
- Hypothesis: the test presses Stop as soon as "Recording…" shows; when the MediaRecorder has not yet encoded any audio (CI load), the forced final chunk is empty. Stopping count: one forced batch of 8 clips in one case; reproduced if any clip is 0 bytes.
- Instrument (temporary, removed): `dashboard/frontend-tests/stories/scratch-voice-race.spec.ts` — 8 × (Dictate, wait "Recording…", programmatic Stop click), log sizes.
- Command: `npm run test:dashboard:frontend -- dashboard/frontend-tests/stories/scratch-voice-race.spec.ts --workers=2` (load 3.55, macOS, local Chromium, no other suite running). Run record `$E/voiceclip-forced-1.log.run.json`.
- Result: SIZES [0,0,0,0,0,0,0,0] — 8/8 empty, signature "expected 0 > 0" matches. CONFIRMED (forced). Cause is in the test: it never observes that the capture produced audio before Stop. Production code unchanged by branch or recent trunk; branch not attributable.

### Repair
- `audioInput()` (shared fake capture) observes what each MediaRecorder actually delivers and exposes `recordedAudio()`, a retrying assertion that the current recording has delivered non-empty audio. Specs that assert a non-empty clip stop only after it: story-note-voice first case, and `stopDictation` (terminal voice specs; same race).
- After-fix forced check: same scratch spec with `await capture.recordedAudio()` before the programmatic Stop. Expect 8/8 non-empty; stopping count: one batch.
- Result: SIZES [5973,5973,5973,5973,5973,5973,4991,5973], passed. Run record `$E/voiceclip-forced-2.log.run.json`. Scratch spec removed.
- Repeat batch (proof): hypothesis — with the repair, every spec sharing the fake capture passes. Stopping count: 5 consecutive runs of the 8 voice/dictation files (story-note-voice, story-note-voice-recovery, session-terminal-voice, session-terminal-voice-touch, agent-terminal-ended-input-recovery, mounted-instruction-voice, -overflow, -capture-failures) at --workers=2; any failure stops the batch.
- Final repair form (lint: unbound-method forbade wrapping `start`): `audioInput()` spies `MediaRecorder.prototype.start` (calls through); `recordedAudio()` listens on the latest started recorder and polls until it delivers non-empty audio. Re-proof hypothesis: forced scratch 8/8 non-empty, then the 5× repeat batch green. Stopping count: one forced batch + 5 repeats; any failure stops.
- Refactor pass: `recordNoteClip(capture)` (story-note-dictation-page) now waits on `recordedAudio()` before Stop, so every note-clip caller is race-free like `stopDictation`; the first story-note-voice case uses it instead of inlining. Re-proof: story-note-voice + -recovery ×5, 4/4 each, load 3.2–3.8 (`$E/voiceclip-refactor-repeat.log`); typecheck and eslint exit 0; consumer trace `$E/voiceclip-refactor-consumer-trace.txt`.
- Result: forced scratch SIZES [4991,4991,4991,5973,5973,5973,4991,5973] passed (`$E/voiceclip-forced-3.log.run.json`); scratch removed. Repeat 5× of the 8 files, 20/20 each, load 3.56–4.78 (`$E/voiceclip-repeat-2.log.run.json`; earlier form: `$E/voiceclip-repeat-1.log.run.json`). Typecheck exit 0 (`$E/voiceclip-typecheck-3.log.run.json`); eslint on changed files exit 0 (`$E/voiceclip-eslint-3.log.run.json`). Consumer trace (base 28407491) `$E/voiceclip-consumer-trace.txt`: 7 test consumers, all run in the repeat batch; no production, support or journey consumers.

## Status
- Cause confirmed (forced reproduction, 8/8 before; 0/8 after). Test-side race in the fake capture; no production or branch code involved. Repair uncommitted in `instruction-voice-page.ts`, `terminal-dictation-page.ts`, `story-note-voice.spec.ts`.
- Environments ruled out: none needed; reproduction forced locally on macOS Chromium.
- Temporary diagnostic edits: none remain. Parked changes: coordinator-owned stash (untouched).
- Unrelated defects: production sends a 0-byte clip to transcription if a user stops before any audio is encoded (product question, not changed here).
- Round 1, cumulative 3.5 active minutes; clock paused.
