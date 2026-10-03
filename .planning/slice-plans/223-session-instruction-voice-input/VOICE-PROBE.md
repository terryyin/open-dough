# Representative microphone observation

Supporting evidence for [slice 1](SLICE-CONTRACTS.md#1-a-representative-spoken-instruction-becomes-a-usable-transcript).

On 2026-10-03, Terry recorded a real short clip in Chrome and explicitly stopped.
The disposable probe mounted the existing `LaunchDialog`, with Start disabled
and no native launcher. It used the authorized transient environment credential;
no credential or audio was written to disk. One provider request occurred.

- Actual container/MIME: `audio/webm;codecs=opus`.
- Complete clip: 224,408 bytes.
- Fixed model: `gpt-transcribe`, after the official guide/model check.
- Provider result: HTTP 200; request elapsed time: 2,028 ms.
- Capture tracks were all ended before the completed clip was submitted.
- Returned text appeared once in the existing startup instruction field.
- The two project terms were misheard. The coordinator corrected them to
  `Open Dough` and `dough-execute-plan` through the real editable field;
  Chrome's accessibility state showed the corrected value.
- Terry explicitly chose to skip the additional usefulness-review click. The
  coordinator observed a readable, editable instruction draft and corrected the
  two terms. No developer usefulness endorsement is claimed.

This proves this clip's capture/decoding/model compatibility and editable draft,
not universal accuracy/latency. Terry's requested omission removes only the
additional operator signoff; recording, returned text, editing and microphone
release were observed. Product review/edit before explicit Start remains required.
No native session was launched.

The local probe server repeatedly ended with the chat session before recording.
The successful attempt used coordinator PTY session `22825` while the chat stayed
active. The loaded page retained the editable draft after the server stopped.

After capture, the coordinator stopped the probe with SIGINT; terminal exit 0.
The loaded page was handed off for local draft review; Terry then chose to skip
that extra click. The tab closed and the owned ignored harness was removed.
Independent evidence refactoring and `npm run format` passed; no production
changes or tests were needed for this evidence-only increment.
