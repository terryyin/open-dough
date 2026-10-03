# Accepted slice 6 overflow proof

Part of [the active plan](PLAN.md), based on published recovery
`8f4a60bf17980b699cf86eef644c29808d083e75`. Root inspected the shared hook,
its LaunchDialog busy/read-only/submission/cancel consumers, new spec setup and
actual assertions, both startup callers, and maintained documentation changes.

`useLaunchInstruction` now owns one separator/append/length rule for ordinary
and shortened transcripts. An over-length result preserves the original field
and complete editable candidate. Review receives focus; Start, Record and the
original field wait until explicit Add or Discard. Add is unavailable for empty
or still oversized candidates. Edited candidate whitespace is preserved; Add
or Discard returns focus to the original field. Dismissal clears transient review.
The authoritative 4,000-character limit, recorder, provider and native owners
remain unchanged. No audio history, second persisted field or truncation exists.

The new one-over case failed before editing because the named editable
transcript did not exist. Green reached terminal exit 0, all three cases selected:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/session-instruction-voice-overflow.spec.ts --workers=1
```

`session-instruction-voice-overflow.spec.ts` observes:

- Exactly 4,000 combined characters, including two separator newlines, append
  ordinarily and reach the story's native prompt unchanged only on Start.
- At 4,001, both drafts remain intact; Start/Record and oversized Add are
  unavailable. Empty review gives useful feedback. Keyboard shortening to
  exactly 4,000, Tab to Add and Enter inserts once, preserves edited whitespace,
  clears candidate and restores focus/editability. Subsequent edited field text
  reaches the unattached native prompt exactly.
- A full 4,137-character transcript retains beginning/end markers and remains
  editable. Tab skips disabled Add to Discard; Enter preserves original text
  and permits another real clip. Cancel/Escape with pending review reopen empty
  with no candidate. Four expected provider calls occur without a native start.

Setup saves a synthetic key through actual settings and uses isolated storage,
Chromium fake-microphone input, actual MediaRecorder, real local HTTP and Node
multipart serialization. Provider replies and native transport alone are faked.
Generic `voicePage.recordClip` textarea observations occur before review exists.
Existing ordinary/settings-trip and lifecycle proof reached exit 0 (six cases);
strict typecheck also passed:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/session-instruction-voice.spec.ts dashboard/tests/session-instruction-voice-lifecycle.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard
```

These retain two-clip append/edit/native handoff, settings return, held-request
cancel, late permission, unexpected track end and completed-response delivery
after dismissal. Prior HTTP admission/provider-bound proof remains applicable
and was not repeated. Fresh independent refactoring found no candidate; accepted
proof was retained without tests. Coordinator formatting passed. All changed
files remain at most 250 lines; this increment publishes the final slice.
