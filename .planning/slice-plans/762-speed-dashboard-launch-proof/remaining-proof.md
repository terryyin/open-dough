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

## Slice 8. Follow-up notes and responsive startup

| Legacy case | Replacement and preserved observations |
| --- | --- |
| `follow-up-attach-notes` · card Follow up checks Attach when notes wait; Start names notes: true; uncheck and cancel name none | `follow-up-note-handoff` reads one waiting and one sent note through the production notes owner. It checks the enabled, selected choice and accessible count. The actual Start sends the exact story identity and revision with `notes: true`. Reopening restores the checked choice. Unchecking omits `notes` from the next request, and Cancel adds no request. `e2e/stories/recently-done-follow-up.spec.ts` exercises the real card and observes the sent note on reload. The real backend verifies which notes reach the first input. |
| `follow-up-attach-notes` · Attach is unavailable with No waiting notes; unreadable says so and Start still works | Two `follow-up-note-handoff` cases supply sent-only and unreadable notes separately. Both observe a disabled, unchecked control with the exact explanation and then submit the same story and revision without a `notes` field. |
| `follow-up-attach-notes` · file header and line menu Follow up offer Attach story notes | Existing E2E cases in `story-review-follow-up` and `story-review-diff-line-follow-up` each seed one note. The actual file heading and line menu open their own Follow up dialog and show Attach checked, enabled, and described as one waiting of one. The file case unchecks before its existing file-only submission and the line case Cancels. |
| `follow-up-attach-notes` · Taken card shows notes waiting and offers no Follow up to attach them | `follow-up-note-handoff` mounts the production Taken card. Its status and Notes button say one note is waiting, and it has no Follow up action. |
| `responsive-session-access` · a keyboard start under reduced motion hands the keyboard to the story's card, says why its actions are unavailable, announces each transition once, and leaves a task begun meanwhile focused when it settles | `responsive-story-startup` submits the exact typed instruction once. The story takes focus, both Starts and Hide detail are disabled and described, and the other card stays independent. Startup wording stays separate from the headings and open detail. The selected and open card shows its dashed accent, the indicator is static with reduced motion and pulses without it, and the announcement log speaks progress, waiting and reconciliation once each. Repeated running evidence adds no announcement. The resulting session is visible with detail retained, and the new inspection keeps focus. The held Claude execution case in `e2e/launches/responsive-session-start.spec.ts` now verifies that the actual Take moves the story to Taken with protection still visible before the host releases. |
| `responsive-session-access-unattached` · a keyboard Start session hands the keyboard to its progress, and its session later opens in the terminal without taking the keyboard from a task begun meanwhile | `responsive-unattached-startup` exercises the production attempt path through an accepted blank start and a later matching record. The launcher is disabled and described by the focused progress, then re-enables. The presenter receives the exact record and launcher once with `takesKeyboard: false`. There is no extra announcement. The existing real `agent-launch-ad-hoc-terminal` E2E checks the rendered terminal and Taken entry mark. |
| `responsive-session-access-unattached` · a keyboard Start session hands the keyboard to its progress, and its instructed session later starts with no terminal and without taking the keyboard from a task begun meanwhile | The second `responsive-unattached-startup` case observes the same progress and focus conditions. It verifies the exact instruction and zero presenter calls. The real `agent-launch-ad-hoc-instructed` E2E checks no terminal socket is requested, the existing panel remains as it was, and the resulting entry can be found. |
| `responsive-session-recovery-reads` · no story's Start is offered before this machine's launch evidence answers, and an unanswered read is said and rechecked | `startup-recovery-reads` observes a visible, inspectable card with both Starts disabled and described during the unread state. The supplied read releases them. A separate unanswered read shows the exact explanation and disables both again. Recheck invokes the machine read, restores the offers on answer, and removes the recovery region. |
| `responsive-session-recovery-reads` · a lost acceptance answer keeps the story protected statically with Recheck while the service is unavailable, until a later read shows the accepted start | The second `startup-recovery-reads` case supplies one unacknowledged attempt to the production hook. It observes static protection, a usable source link, Recheck without Continue, the exact uncertainty message, and usable independent card actions. An unanswered Recheck retains the protection. Another Recheck and an accepted read show progress and clear recovery while the story remains protected. |

The terminal handoff passed its early probe through the production
`OpenTerminal` operation. The paired Slice 8 selection of nine cases
went from 7.35 s of built-app Playwright to 6.53 s of mounted Chromium,
including preparation at two workers. The separate no-waiting and
unreadable cases guard distinct states. Three existing E2E cases gained
observations. The paired anchor commands took 8.84 s before and 8.21 s
after, and the held Take 8.38 s before and 10.32 s after. The combined
wall-time sample increased by 1.31 s. No case was added to E2E.

Passed 18 mounted checks, 17 composed E2E checks, three retained
navigation cases, four backend notes checks, and dashboard typecheck.
See `slice8-implementation.md` and `slice8-consumer-trace.md` in Git
evidence for the exact selections, case results, and unaffected callers.

The two existing E2E cases in `slice8-product-conflicts-proof.jsonl`
pass with standalone retry available after an uncertain timeout and with
no recovery region during known progress. The maintainer approved keeping
these behaviors. The amended startup example and source review preserve
both observed outcomes.

## Whole-launch comparison

| Selection | Engine | Specs | Cases | Wall including preparation | Summed case seconds |
| --- | --- | ---: | ---: | ---: | ---: |
| Legacy baseline at `3eef0b526` | Built-app Playwright Chromium | 29 | 81 | 46.48 s | 74.98 s |
| Local candidate including Slice 8 | Mounted Vitest Chromium | 23 | 72 | 32.04 s | 57.57 s |

Both selections passed at two workers on the same AC Mac with the same
locked dependencies and Node 24.21.0. The candidate entered at one-minute
load 3.70 and finished at 4.42. The comparable wall time fell by 14.44 s
(31%). The candidate's slowest were refinement touch rotation and
restricted height (3.74 s), refinement control reach at 320 px (2.94 s)
and at 200% zoom (2.74 s), status wording in both color schemes (2.55 s),
and keyboard order with command details (2.33 s).

All 29 original files are retired in the candidate. Four existing E2E
cases gained observations and the E2E case count did not grow. Slice 6's
changed options case took 2.13 case-seconds in its 7.50 s three-case
command. Slice 8's three changed cases added 1.31 s in the paired command
samples above. Existing native, install, and cross-service cases retain
their original owners. The backend case amended in Slice 6 verifies the
actual reread of a requested effort without growing its case count.

Shared tests under `dashboard/test-support` remove 255 net lines against
the merged base `396f81d69`. Launch specs no longer use `actSettled`,
React `act`, `IS_REACT_ACT_ENVIRONMENT`, or the old whole-app launch
substitutes. The one live navigation consumer keeps its reduced facade.
The reports `paired-legacy-proof.jsonl` and `paired-mounted-proof.jsonl`
in Git evidence retain the selections and terminal results.

## Reassess launch proof timing

The maintainer set this target for the same two-worker selection including
preparation. The separate launch unit proof follow-up owns it. Each test
should depend only on code and data that can change its outcome. The
32.04 s candidate establishes migration coverage and the baseline for
the speed target. Its 57.57 summed case-seconds imply at least
28.79 s on two workers before other costs. An eight-second run can spend
at most 16 case-seconds, and preparation and uneven worker load reduce that
budget further. The eight highest-cost files sum to 35.98 case-seconds.
Even removing all of that cost would leave 21.59 case-seconds. A few
isolated fixes cannot close the gap.

The hosted proof at `b743ef2b0` includes both dashboard frontend shards
and records 40.4 summed launch case-seconds in 23 files. Its shard uses
`test:dashboard:frontend` with the complement of Intent, navigation, and
review. It still contains the four legacy Slice 8 files. Use it to locate
cost in unchanged tests. Use the local candidate's retained run for the
target comparison.
[Hosted CI, attempt 1](https://github.com/terryyin/open-dough/actions/runs/44939724575)

| Repeated work in the retained candidate | Smaller production boundary and proof to retain |
| --- | --- |
| `ad-hoc-launch-dialog`, `ad-hoc-start-session-layout`, and `ad-hoc-refinement-touch` spend 15.44 summed case-seconds. Both refinement geometry cases select every option and check command text. Both session geometry cases replay both workspace choices and their descriptions. The touch case repeats ordinary selection and focus work at each size. | Arrange dense rendered layout through production inputs. Keep the viewport conditions where layout differs, one case for option-to-command mapping, one for native tab order, and one touch-resize case exercising the draft at constrained height. Preserve independent request choices and the scoping of the Start or Cancel action at their owners. |
| `launch-model-effort` spends 4.12 summed case-seconds. Its two dismissal cases each select model and effort in three launchers and reopen each launcher. Catalog and dialog cases repeat defaults and input traversal. | Prove shared dialog reset with one dismissal path per representative production launcher boundary. Keep the wrappers' unique launch and focus wiring and check the host-specific effort rules independently. Assert command or request normalization at the production contract that owns it. |
| The three mounted dictation files spend 9.39 summed case-seconds. Overflow and discard drive native recording, including four recordings in one case, even where the behavior starts with the returned transcript. | Exercise overflow, editing, and discard at the production owner that consumes transcript text. Keep capture and cleanup checks for a held reply, late permission, and track loss at the recording boundary. Existing composed E2E retains real audio and provider transport. Any narrower production owner must be used by production and preserve the exact launch request. |
| Startup presentation, launcher focus, attempt reconciliation, and note handoff often reach the same dialogs and card setup. | Give presentation its typed status, give recovery its typed attempt and read, and give note attachment its typed notes. Keep representative launch-to-focus journeys and real origin or native settlement in existing composed owners. Check announcements through the real announcer with the relevant transitions. |

Before removing an old assertion, name the replacement that would fail
for the same regression. Compare each changed family with the matching
legacy selection and rerun the whole launch selection at two workers on
the same setup. Use its preparation-inclusive wall time for acceptance
and record any added composed cost. The passes above are leads from
inspection and retained timings. Their savings have yet to be measured.
