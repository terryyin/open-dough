# Slice 7 attachment proof

SEED-413#finish-launch-proof-orthogonal, slice 7. Clean starting revision
`e6ecba906120805687154b1ae827ecb686e45eee` on the claimed checkout.
The only changed path is `dashboard/frontend-tests/launches/launch-attachments.spec.ts`.
The matching rules select MakeMe and disable Page Objects for that spec.
The existing E2E selects both conventions and has no changes.

## Setup and consumer trace

`mountStartSession` uses the existing typed `StartSession` entry, the
existing MakeMe Open Dough project, and the existing typed `AdHocLaunches`
fixture. It sets `autoOpen: true` and uses the runner's default 390 × 844
viewport. The real Start session, LaunchDialog and attachment controls still
handle all input. The caller's `startAdHoc` is the observing collaborator.
The two dismissal cases still use the real launcher for the reopen. The
ordinary initial opening is setup for these attachment outcomes. Its native
launcher interaction has separate witnesses in both dismissal cases after
dismissal and in the reused attachment E2E cases at their initial opening.
The candidate removes four setup clicks and four viewport overrides. It
changes zero shared helpers, runtime boundaries, routes, or runner options.
It keeps the original readiness cues and default timeouts.

The earlier instrumented profile, `../launch-phases/run.log` lines 117–134,
recorded eight locator clicks totaling 1,341 ms across these four cases.
The text-paste case's only click was the incidental opening, 239 ms.
The installation's consumer trace against the accepted revision searched
the changed filename, `mountStartSession`, `launchAttachmentEndpoint`,
`pasteImageInField`, `pickImagesInDialog`, and derived `autoOpen`.
The [consumer trace](consumer-trace.md) records each matched purpose and
disposition. The local mount has no external callers. The E2E comment
still points to the text-paste witness. Existing runtime attachment and
follow-up paths remain covered at their current boundaries.

## Commitment dispositions

All mounted cases use the real Start session and shared LaunchDialog.

| ID | Result | Observation |
| --- | --- | --- |
| 10 | Reused | `e2e/launches/agent-launch-ad-hoc-attachments.spec.ts:161`, “pasting an image into the instruction field attaches it as pasted.png and Start sends its path”. Opens through the actual launcher, fills the draft, delivers image clipboard data to the field, sees Image 1 · pasted.png and exactly one image with the draft intact, then Starts and sees one fake Claude launch with the original text and a real copied 1-pasted.png containing the same bytes. |
| 11 | Passed | `launch-attachments.spec.ts:67` fills clipboard text, selects it and copies it in Chromium, places the cursor at the end of the existing draft and pastes. The field value equals the draft plus the complete pasted sentence. |
| 12 | Passed | The same text-paste case asserts the named Attached images list is absent after the text appears. |
| 13 | Passed | `launch-attachments.spec.ts:82` fills the draft and picks from the actual file input via a browser FileList and its change event. It first sees the enabled Attach images control and accepted card.png. The Refused images alert names notes.pdf as “Not an image (PNG, JPEG, GIF or WebP).”, huge.png as “Larger than 10 MB. Choose a smaller image or omit it.”, and extra-4.png as “At most 5 images”. |
| 14 | Passed | In the refusal case card.png remains the sole rendered preview after PDF/size refusals and remains first after the cap refusal. There are five previews, with extra-3.png fifth. A real Start action closes the dialog and calls the typed collaborator exactly once with the five expected file names in order. |
| 15 | Passed | The refusal case observes the same draft after each refusal, Claude and checked Default main and Wait for review controls, and Default main still checked after the cap refusal. The typed request contains the same instruction and Claude host. Its `unattached` choice is absent, the representation for default policy. |
| 16 | Passed | `launch-attachments.spec.ts:174` fills the instruction, chooses card.png and sees its preview. It clicks Cancel, observes the dialog has gone and clicks the actual launcher. The reopened instruction is empty. |
| 17 | Passed | The same Cancel case sees the Attached images list absent on reopening. |
| 18 | Passed | The Cancel case observes zero calls to `startAdHoc` and no fetch call to the actual attachment endpoint across mounting, selecting, dismissing and reopening. |
| 19 | Passed | `launch-attachments.spec.ts:177` has the same filled draft and actual accepted file preconditions, sends native Escape through `userEvent.keyboard`, observes closure, and clicks the actual launcher. The reopened instruction is empty. |
| 20 | Passed | The same Escape case sees the Attached images list absent on reopening. |
| 21 | Passed | The Escape case observes zero calls to `startAdHoc` and no fetch call to the actual attachment endpoint across mounting, selecting, dismissing and reopening. |

All four original mounted cases and their assertions remain. The submission
case additionally checks the transmitted host and the omission of the
default policy. Its file-chooser setup retains the test's in-Chromium
FileList for the oversized byte sample and exercises the actual picker
change handler. The first two reused E2E cases activate the real Attach
images button, receive a browser filechooser event, choose files through
it, Start, and observe copied files and their resulting launch prompts.
This keeps the native chooser and positive upload witness alongside the
mounted refusal and no-upload observations.

The retained E2E receipt is `../attachment-e2e-45108770652-proof.zip`,
`e2e-case-1.json`, GitHub Actions run 45108770652 at `82f46dc9`, E2E
shard 1/6 job 137476056242, artifact 14788798111. The exact file above is
recorded with 3 passed, 0 failed or other, 11,670 summed case ms.
The E2E title and assertions, actual StartSession, LaunchDialog,
attachment controls, clipboard/file helpers, upload client and upload
route are identical through the accepted revision and the candidate.
The only intervening change in `launchAttempts.ts` changed declarations
of the existing receiver-free callbacks. Production typecheck and a
fresh E2E run would gate runtime contract changes; this test-only edit
uses the existing positive proof.

## Paired scoped timing

Exact command in both slice-clock records, supplying a fresh
`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` for each.

```sh
/usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/launch-attachments.spec.ts --workers=2
```

Both rounds returned exit 0 with runner and strict terminal status passed.
One file and four exact cases in mounted Chromium, with two configured
workers and the maintained isolation and dependencies. Wall time includes
npm and runner preparation. No cache purge or other execution-owned test
ran between the rounds. The macOS arm64 26.6.2 host was awake on AC with 16
logical CPUs and the maintained sleep guard. Baseline one-minute load
started at 19.73 and ended at 18.79. Candidate started at 17.33 and ended
at 17.21. External work was outside the execution's control. Load was
above logical CPU count in both runs, with the candidate somewhat lighter.
This is one warm scoped pair. It observes shorter bodies in all four cases
and an elapsed change for this selection under those conditions.
Whole-launch elapsed acceptance remains open.

| Same exact case title in both Chromium runs | Baseline ms | Candidate ms |
| --- | ---: | ---: |
| pasting text into the instruction inserts it without attaching an image | 614.9 | 344.2 |
| refused images explain why, keep the draft, and leave only accepted images for Start | 384.1 | 233.7 |
| Cancel after attaching uploads nothing and opens an empty draft next time | 766.6 | 511.6 |
| Escape after attaching uploads nothing and opens an empty draft next time | 666.7 | 364.5 |
| Sum of case durations | 2432.3 | 1454.0 |
| Full wall time, expressed in milliseconds | 6360 | 5270 |

[Baseline run](before.log.run.json), [baseline proof](before-proof.json),
[baseline log](before.log), [baseline host](before-host.log),
[candidate run](after.log.run.json), [candidate proof](after-proof.json),
[candidate log](after.log), [candidate host](after-host.log),
[candidate diff](candidate.diff).
`git diff --check` and the scoped Prettier check both passed.

No open coverage gap for slice 7. The execution coordinator independently
reviews the change and owns the commit and delivery.
