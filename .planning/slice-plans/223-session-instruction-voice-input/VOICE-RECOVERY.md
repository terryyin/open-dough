# Accepted slice 5 recovery proof

Part of [the active plan](PLAN.md). Implementation and independent refactoring
are accepted at the local change based on published keyboard repair
`0f10b8ebda76b66befd890c86825396ac6399d5a`.

The existing operation identity and failure cleanup now present locally authored
configuration, microphone, authentication, rate-limit, connection, deadline and
unusable-result categories. Browser exception messages are allowlisted rather
than displayed verbatim. Fixed-provider failures are classified at their owner;
provider bodies and credentials are not returned or logged. Shared
`responseSignal.ts`, native startup and dialog controls remain unchanged.

Root inspected the four production paths, all three new failure specs and their
`voiceRecovery`, `voicePage`, `voiceProvider` and `voiceTest` setup/observations.
The initial combined run exposed two test expectations: session display names
already shorten while instruction argv remains complete; Vite bundling erases
the filename initially used to select a test timer. Corrected proof reached
terminal exit 0, selecting all 25 cases without filters (14 new, 11 existing):

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/session-instruction-voice-provider-failures.spec.ts dashboard/tests/session-instruction-voice-capture-failures.spec.ts dashboard/tests/session-instruction-voice-key-failures.spec.ts dashboard/tests/session-instruction-voice.spec.ts dashboard/tests/session-instruction-voice-lifecycle.spec.ts dashboard/tests/session-instruction-voice-boundary.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard
```

Setup retains isolated machine storage, real settings operations, actual
Chromium fake-microphone capture/MediaRecorder, local upload and Node multipart
construction. Only external provider behavior, unavailable capture capabilities
and native host transport are substituted. Synthetic keys are saved through
settings; key-failure cases additionally supply a synthetic environment key.

- `voiceRecovery::recovered` observes the exact original draft, editable field,
  enabled Start/Record, disabled Stop, ready status, ended tracks and aborted
  latest upload signal after captured failures. Quiet call counts and no native
  or workflow starts precede the explicit developer action. Page/output checks
  exclude synthetic credentials and private provider diagnostics.
- `voiceRecovery::typedStart` edits that same dialog and observes exact full
  native instruction argv and working directory only after Start.
- Provider cases exercise 401, 429, 500, empty text, malformed JSON and actual
  socket disconnection. A separate 403 retry observes two calls and one fresh
  append, with rejected text absent. No automatic paid retry occurs.
- Deadline proof holds real upstream work. One test-only preload shortens the
  actual 60,000-ms timer, records its `withResponseSignal` stack and observes
  expiry, provider disconnection, safe timeout feedback and typed Start. The
  product timer/helper are unchanged; no production test mode is introduced.
- Capture cases observe denied permission, unavailable microphone and
  unsupported formats before capture/provider contact. Permission recovery
  restores the capability, records real audio and appends once.
- Key cases observe missing and unreadable configuration before recording,
  unreadability during capture, replacement Authorization on the same running
  server, and removal during capture. Removed/missing keys make no provider
  call despite the environment key. Restoring readability permits explicit
  retry. Existing voice/boundary proof retains setup-to-consumer, admission,
  bounds, cancellation, shutdown and late-result observations.

Fresh independent refactoring found no candidate; unchanged proof was retained
without reruns. Coordinator formatting initially found one `require-await`
callback issue. The test helper now accepts synchronous or asynchronous
before-Stop work, still awaited; the chmod-only callback is synchronous and the
real HTTP removal remains asynchronous. Root inspected both callers. Affected
key proof and strict typecheck again reached terminal exit 0:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/session-instruction-voice-key-failures.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard
```

All three key cases passed; the other 22 retain accepted proof. Repaired
coordinator `npm run format` reached exit 0. No additional paid call occurred.
Changed files remain at most 250 lines; this increment publishes slice 5.
