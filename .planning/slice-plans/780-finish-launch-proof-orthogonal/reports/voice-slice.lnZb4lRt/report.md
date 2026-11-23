# Slice 4 voice fixture and dismissal proof

## Decision and boundary

At published base `1830ffb17b081f8cc1284aaed21295a476f0080e` the three mounted voice specs already exercised the real LaunchDialog, MediaRecorder, and real tracks from a supplied audio stream. The selected improvement removes incidental opening work from every test while leaving native reopening and the actual interaction under test. ADR 0010's decision basis and experiment bounds are in [experiment.md](experiment.md).

In `dashboard/frontend-tests/launches/instruction-voice-page.ts` the existing fixture starts with LaunchDialog open and uses the runner's default viewport. The unchanged launcher control still opens another real dialog following dismissal. The old fixture opened the first dialog by pointer in all seven cases. Its production dialog, audio source, typed transcription and launch collaborators stay in place.

In `dashboard/frontend-tests/launches/mounted-instruction-voice.spec.ts` the existing combined active Escape and pending permission case became a focused active-recording check for each dismissal and a pending-permission case for both dismissal paths. The actual Cancel button and Escape key dispatch different browser events and active Cancel was previously untested. One new witness catches the concrete regression where Cancel becomes disabled during active recording or leaves the microphone track live. Each active case now asserts the live track before dismissal, the ended track and closed dialog after dismissal, and zero transcription or launch requests. The old Escape witness remains present.

## Proof observations

The active, permission, transcription, and unexpected-track selections use `audioInput` and `mountInstructionVoice` in `dashboard/frontend-tests/launches/instruction-voice-page.ts`. The supplied audio source creates real Chromium tracks, and the test controls only the audio and transcription collaborators. Product Record, Stop, and dismissal controls drive the state transitions.

| Promise | Location and observation in passing candidate |
| --- | --- |
| 43 Cancel ends active recording | `mounted-instruction-voice.spec.ts`, “Cancel stops active recording without transcribing”. `voice.begin()` observes the recording cue and disabled submission. Real track asserts live, the Cancel control is clicked, and the dialog disappears and the track asserts ended. Neither transcription nor a launch happened. |
| 44 Cancel abandons held transcription | `mounted-instruction-voice.spec.ts`, “Cancel and Escape each abandon a held transcription and a late reply leaves the next dialog empty”, Cancel iteration. Real Record and Stop reach the held typed request. Its signal is live before the click and aborted after dismissal, and prior tracks are ended. |
| 45 Escape ends active recording | `mounted-instruction-voice.spec.ts`, “Escape stops active recording without transcribing”. The same live/ended and no-request assertions observe the native Escape key. |
| 46 Escape abandons held transcription | The Escape iteration of the held-transcription case verifies the same signals after the actual Escape key. |
| 47 A late permission answer leaves the next draft empty | “late permission after either dismissal cannot populate the next dialog” holds the real cloned input stream at the permission boundary until after Cancel or Escape and a native reopen. The prior stream is still live before answer, ends after answer, and the reopened field stays empty and becomes ready. No start or transcription request occurs. |
| 48 A late transcription answer leaves the next draft empty | Both iterations of the held-transcription case reopen by the actual launcher, resolve the previous held text, then observe the empty editable draft and ready controls. |
| 62 Preserve capture races | The two late-answer cases above preserve distinct permission and transcription races. “unexpected microphone track end keeps the typed draft editable without requesting transcription” stops a real track and observes the exact error, retained draft, restored controls and no requests. |

The [consumer trace](consumer-trace.txt) searched the whole checkout for the two changed paths and the effect terms `mountInstructionVoice` and `audioInput`. It locates both changed-helper consumers, `mounted-instruction-voice-overflow.spec.ts` and `mounted-instruction-voice-capture-failures.spec.ts`. Both were exercised in Chromium. Overflow uses real recording with a controlled oversized transcription, then asserts read-only and disabled buttons before review, an exact edited submit, and Discard focus plus an empty dialog after Escape and reopen. Capture failures use controlled permission/device failures or an unsupported format and observe the typed draft, safe problem text, no streams, usable controls and exact instruction submitted. Permission retry also proves the successful recorded text joins the draft. `dashboard/test-support/support/voicePage.ts` matches the device kind `audioinput` and uses a different fixture. The broad derived term `viewport` does not name an affected boundary. Only these three local consumers use the changed mount.

## Timing

| Trial | Setup | Chromium cases passed | Elapsed | One-minute host load |
| --- | --- | ---: | ---: | --- |
| before | Published base | 7 | 6.25 s | 7.99–7.59 |
| phase | Disposable instrumentation, original behavior | 7 | 9.25 s | 9.82–10.48 |
| after | Candidate, recording dismissal split | 9 | 11.99 s | 20.91–22.25 |
| matched-before | Published base, immediately before candidate | 7 | 17.07 s | 29.13–28.83 |
| matched-after | Candidate reapplied, same checkout | 9 | 14.44 s | 28.83–33.79 |

All commands selected the same three files at two workers on AC macOS. The first pair has dissimilar natural host load. The interleaved pair had the same files, worktree and browser runner with a comparable start load and a higher load through the end of the candidate. It is one observed focused comparison. Summed case time fell from 15.48 s to 10.60 s in that pair despite adding the active Cancel/Escape isolates. Whole-selection wall timing was outside this measurement.

The disposable [phase trace](phase.log) found seven initial clicks taking 1.816 s total across cases and the mount/resize calls taking 0.036 s. Six required reopens took 1.160 s. Eight Record clicks took 1.914 s, six Stop clicks took 1.091 s, and observing the recording cue after Record took 0.196 s. Ten audio-source request/resume measurements took 0.182 s, independent of the deliberate held permission gate in the test. These are summed phase measurements under natural load, not additive wall time. The candidate removes only the initial launch clicks and resize. All profiling edits were restored before candidate proof.

## Exact commands and run records

### before

[before run record](before.log.run.json), [before output](before.log), [before exact case proof](before.json)

```sh
env OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/Users/terryyin/git/open-dough/.git/worktrees/get-launch-unit-proof-in-about-eight-seconds/open-dough/evidence/voice-slice.lnZb4lRt/before.json /usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/mounted-instruction-voice.spec.ts dashboard/frontend-tests/launches/mounted-instruction-voice-overflow.spec.ts dashboard/frontend-tests/launches/mounted-instruction-voice-capture-failures.spec.ts --workers=2
```

Terminal status 0. Revision `1830ffb17b081f8cc1284aaed21295a476f0080e`.

### phase

[phase run record](phase.log.run.json), [phase output](phase.log), [phase exact case proof](phase.json)

```sh
env OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/Users/terryyin/git/open-dough/.git/worktrees/get-launch-unit-proof-in-about-eight-seconds/open-dough/evidence/voice-slice.lnZb4lRt/phase.json /usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/mounted-instruction-voice.spec.ts dashboard/frontend-tests/launches/mounted-instruction-voice-overflow.spec.ts dashboard/frontend-tests/launches/mounted-instruction-voice-capture-failures.spec.ts --workers=2
```

Terminal status 0. Revision `1830ffb17b081f8cc1284aaed21295a476f0080e`.

### after

[after run record](after.log.run.json), [after output](after.log), [after exact case proof](after.json)

```sh
env OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/Users/terryyin/git/open-dough/.git/worktrees/get-launch-unit-proof-in-about-eight-seconds/open-dough/evidence/voice-slice.lnZb4lRt/after.json /usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/mounted-instruction-voice.spec.ts dashboard/frontend-tests/launches/mounted-instruction-voice-overflow.spec.ts dashboard/frontend-tests/launches/mounted-instruction-voice-capture-failures.spec.ts --workers=2
```

Terminal status 0. Revision `1830ffb17b081f8cc1284aaed21295a476f0080e`.

### matched-before

[matched-before run record](matched-before.log.run.json), [matched-before output](matched-before.log), [matched-before exact case proof](matched-before.json)

```sh
env OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/Users/terryyin/git/open-dough/.git/worktrees/get-launch-unit-proof-in-about-eight-seconds/open-dough/evidence/voice-slice.lnZb4lRt/matched-before.json /usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/mounted-instruction-voice.spec.ts dashboard/frontend-tests/launches/mounted-instruction-voice-overflow.spec.ts dashboard/frontend-tests/launches/mounted-instruction-voice-capture-failures.spec.ts --workers=2
```

Terminal status 0. Revision `1830ffb17b081f8cc1284aaed21295a476f0080e`.

### matched-after

[matched-after run record](matched-after.log.run.json), [matched-after output](matched-after.log), [matched-after exact case proof](matched-after.json)

```sh
env OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/Users/terryyin/git/open-dough/.git/worktrees/get-launch-unit-proof-in-about-eight-seconds/open-dough/evidence/voice-slice.lnZb4lRt/matched-after.json /usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/mounted-instruction-voice.spec.ts dashboard/frontend-tests/launches/mounted-instruction-voice-overflow.spec.ts dashboard/frontend-tests/launches/mounted-instruction-voice-capture-failures.spec.ts --workers=2
```

Terminal status 0. Revision `1830ffb17b081f8cc1284aaed21295a476f0080e`.
