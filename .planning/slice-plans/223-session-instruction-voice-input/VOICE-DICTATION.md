# Accepted slice 4 proof

Supporting evidence for [the active plan](PLAN.md). Root inspected the shared
field, recorder identity/explicit-stop cleanup, intentional settings return,
audio reader, fixed provider operation and their real setup/assertions.
Independent refactoring and repaired coordinator formatting passed.

## Boundaries and observations

- `session-instruction-voice.spec.ts`: actual Settings Save, server restart,
  two real Chromium MediaRecorder clips and once-only append; synthetic saved
  Authorization, model, multipart file type/name and nonempty bytes; edited
  story and unattached text reaches exact native argv only after Start.
  Before Start, native calls and GitHub mutations are absent, and the HOME
  file tree is unchanged. Missing-key settings return preserves the same draft
  and field focus; saving a key permits an explicit retry.
- `session-instruction-voice-lifecycle.spec.ts`: Cancel aborts held upstream
  work; Escape stops capture; late permission releases tracks. Unexpected
  actual track termination preserves typing and makes no provider request.
  A fully received real response is held before client delivery, then its JSON
  is consumed after Cancel/reopen: the new field remains empty. Permission and
  transcription block Start/edits while Cancel remains available.
- `session-instruction-voice-boundary.spec.ts`: actual dev/preview HTTP refuses
  foreign origins, wrong methods/media, empty audio, declared oversize and an
  actual 24,000,001-byte chunked upload before provider contact. Caller
  disconnect/server shutdown close held upstream work. Empty, malformed,
  oversized and failing provider replies remain safe without raw diagnostics
  or key disclosure in page responses/server output.
- `support/voiceTest.ts` supplies isolated machine storage; `voiceProvider.ts`
  forwards only the fixed endpoint through a test-only Node fetch preload,
  observes real multipart serialization, and blocks other provider egress.
  `voicePage.ts` wraps actual getUserMedia/MediaRecorder for track/byte signals;
  its late-response hold buffers actual HTTP bytes, never supplies a transcript.
  Only provider/native seams are simulated. Real API keys are unset.
- Existing `agent-launch-dialog-layout.spec.ts` and the named keyboard case in
  `agent-launch-model.spec.ts` retain every prior focus/layout assertion and
  include Record before Host. Disabled Stop is skipped. Existing typed startup,
  native adapters, JSON launch admission and the shared 4,000-character limit
  remain unchanged.

The server reads the saved credential for each request, uploads Node FormData to
one fixed `gpt-transcribe` operation, admits at most 24,000,000 audio bytes,
uses the existing 60-second response signal and caps upstream replies at 256 KiB.
Only explicit Stop submits; dismissal/unmount invalidate work and release tracks.
Official file guidance supports the selected WebM/MP4 intersection; this proof
observes Chromium WebM, not external MP4 compatibility or universal accuracy.

## Terminal verification

All commands below reached exit 0 under this literal runtime/key-unset prefix:
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH`.

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/session-instruction-voice.spec.ts dashboard/tests/session-instruction-voice-lifecycle.spec.ts dashboard/tests/session-instruction-voice-boundary.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/session-instruction-voice-lifecycle.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/agent-launch-card.spec.ts dashboard/tests/agent-launch-ad-hoc.spec.ts --grep 'Escape or Cancel sends? nothing|starting sends the instruction after the execution command|starting with text sends it' --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/agent-launch-dialog-layout.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/agent-launch-model.spec.ts --grep 'the dialog opens in the instruction field' --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard
```

Selections were explicitly confirmed: 11 voice, four lifecycle, five typed-start,
three layout and one model-keyboard case. Refactoring moved three exact repeated
failure messages to `instructionTranscription.ts`; the 11 voice cases and strict
TypeScript check passed again. Unchanged typed/layout/keyboard proof was reused.

## Diagnosed failures and preparation

Early rejection of an incomplete oversized Content-Length left unread bytes on
a reused keepalive connection; the next chunked request received HTTP 400.
The audio operation now sends Connection: close on error while the request is
incomplete. Both actual dev/preview chunked-overflow cases then observed 413.
An unattached-name expectation was aligned with existing whitespace flattening;
its final instruction argv assertion was preserved.

The first formatter reported five ESLint diagnostics in three paths. Repairs
normalize unknown promise-rejection reasons while preserving Error subclasses;
represent media capability as genuinely optional while keeping its receiver;
document one narrowly intentional native-method extraction in the observer;
and normalize string/URL/Request inputs without Object stringification.
Root inspected these places; all 11 voice cases and TypeScript passed again.
The repaired `npm run format` reached terminal exit 0. All changed/new files
remain at most 250 lines. No unresolved implementation/refactor finding remains.

Detailed failure/retry/timeout and credential-consumption changes remain slice 5;
complete overflow shortening/add/discard and boundary native handoff remain slice 6.
No further paid request, completed-execution record or retrospective is claimed.
