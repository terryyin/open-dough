# Proof ownership and observations

Supporting evidence for [the active plan](PLAN.md); slice status remains there.

[Project-settings CI repair](CI-REPAIR.md) records the later stale-consumer
failure, diagnosed correction and focused proof without changing slice status.

[Real microphone observation](VOICE-PROBE.md) records the successful clip and
the developer-authorized omission of the additional usefulness-review click.

## Proof ownership and local gates

| Final promise | Owning slice and observation |
| --- | --- |
| Latest suitable model and representative microphone/format/service compatibility | 1: official-model check, actual capture and one real transcript consumed as an editable draft; test key stays transient. |
| One cohesive System settings view with useful navigation and empty-state access | 2: real entry/return, browser navigation, selection and keyboard/focus observations; narrow/zoom UI review. |
| Project add/remove preserves one list, validation, environment separation, checkouts and session records | 2: real forms/services/files, selected/unselected/last removal, restart/re-add and existing boundary cases. |
| General OpenAI key save/replace/remove survives restart and is independent of projects | 3: real page/service/private-store journeys and dev/preview reads of the same isolated credential store. |
| Saved key is status-only in reads, private on disk, absent from logs/browser storage/project records | 3: response, filesystem-permission, failure/predecessor and admission observations; inspected narrow secret lifetime. |
| Saving/configuration reads make no paid request; environment key is not a runtime fallback | 3: zero provider egress on settings operations; 4–5: saved synthetic key consumed, missing saved key refused despite synthetic environment key. |
| Settings → save key → restart → dictate → review/edit → explicit Start delivers final text | 4: page → real settings/transcription service → fake provider → real launch → synthetic native argv. |
| Preserve typed text, append once, repeat clips, no automatic agent launch | 4: original-plus-transcript assertions and no native/start calls until explicit Start. |
| Recording/waiting feedback, disabled edits/Start, usable Cancel | 4: named/status/focus/control assertions in each pending phase. |
| Dismissal/late permission/late result/shutdown release resources and never change a new dialog | 4: held permission/result, track-stop and request-abort signals; reopened field and no host calls. |
| Typing and explicit retry survive unavailable or failed dictation; missing-key settings round trip preserves the draft | 4–5: preserved draft/configuration return/retry and fake-provider request counts; no automatic paid retry. |
| Preserve full over-length text and existing draft; exactly 4,000 characters accepted | 6: both boundaries, shortening/discard, final native argv. |
| Same-origin/loopback audio admission, fixed/bounded upstream request and transient audio | 4: HTTP refusal/provider-contact assertions and lifetime; 5: safe failures. |
| Both existing dialog purposes and normal text startup remain intact | 4–6: story/unattached journeys plus the five existing baseline cases. Native-host audio behavior is unchanged. |

Before browser checks, use the selected `.node-version` runtime and run
`node scripts/setup-native.mjs check`, as required by
[dashboard commands](../../../dashboard/COMMANDS.md). Install dev dependencies
when `NODE_ENV=production` would omit them. Run the affected project/settings specs for slices 2–3, then focused voice specs
and the five startup baseline cases at affected slice boundaries, with live API credentials unset;
test fixtures supply only synthetic keys. The browser harness builds production
assets itself and isolates origins/native hosts. Check the new HTTP service in
dev and built preview so one mounting mode does not stand in for the other.

Run `npm run typecheck:dashboard` for changed TypeScript/browser-test contracts;
Vite/Playwright do not typecheck, as documented in
[dashboard technology guidance](../../../docs/dashboard-tech-stack.md).
No whole-repository or native-agent acceptance suite is a routine local gate for
this unchanged native text contract. Expand focused proof if implementation changes
other consumers. Execution still applies its independent post-change refactoring,
review, commit-hook lint, delivery and CI ownership; do not run hook-owned lint
as an extra planner gate. No numeric slice target/hard limit was supplied here:
size includes implementation, focused proof and cleanup under the shared bounded
slice rules, without inventing a timing policy.

## Accepted slice 2 proof

Implementation proof accepted after inspection of the changed UI, routing,
configuration service, and named setup/assertions. Independent refactoring
passed; formatter repairs passed before coordinator delivery. No slice-1 voice
proof is claimed.

All commands ran in the execution checkout with this prefix:
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH`.

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/project-add.spec.ts dashboard/tests/project-remove.spec.ts dashboard/tests/project-restored-session.spec.ts dashboard/tests/system-settings.spec.ts dashboard/tests/session-sidebar-keyboard.spec.ts dashboard/tests/agent-terminal-keyboard.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/project-add-boundary.spec.ts dashboard/tests/project-remove-boundary.spec.ts dashboard/tests/project-configuration-boundary.spec.ts dashboard/tests/project-add-validation.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard
```

Terminal results: exit 0, respectively 18 selected cases (list confirmed),
19 cases, and strict TypeScript build. Setup: existing `projectAddMachine`
provides isolated HOME/files/checkout and real dev/preview services; only
GitHub and native-host seams are simulated. No real API key or provider request.

- `project-add.spec.ts`: saved order/default branch, actual launch cwd,
  restart persistence, separate dev/production lists, Cancel/Escape/focus.
- `project-remove.spec.ts`: retained checkout marker/Git config/session-store
  bytes, removal/re-add, selected first/last removal and empty-state settings.
- `project-restored-session.spec.ts`: passive retained Codex preparation,
  one daemon/no conversation, retained session and selected-project URL/reload.
- `system-settings.spec.ts`: real roster return/focus and Back/Forward; direct
  settings/reload; unselected selection and selected next-neighbor; directory
  write failures preserve drafts/predecessor bytes and explicit retry works;
  exact `{id, localPath}` read, no-store, foreign-origin/method refusal and
  unchanged published-source read. Its terminal journey observes the same
  live attachment PID/count, pre-settings buffer, post-return echo and sidebar.
- Existing sidebar/terminal shortcut suites and the settings terminal journey
  cover the shared shortcut consumers. Raw boundary/validation suites preserve
  admission, body/deadline, cancel/shutdown, path/origin, duplicate and concurrent
  append contracts. No whole-suite or unrelated-host claim is made.

An initial selection/URL regression was diagnosed: App's synchronous return
render removed a changing project `popstate` subscription before the same event
reached it. The stable subscription reads current context through a ref;
selected-neighbor and restored-session URL/reload assertions now pass. Temporary
debug code was removed; successful retries alone were not used as diagnosis.

Manual review used an isolated two-row preview with long repository/path facts.
The 360-pixel screenshot `node_modules/.cache/settings-review-084/settings-narrow.png`
was inspected. Native Chrome CUA review then showed **Zoom: 200%**, CSS zoom 1,
innerWidth/scrollWidth 360, innerHeight 480 and devicePixelRatio 2 with a
720×960 override. Native screenshots showed full wrapped facts, actions after
facts, no overlap or horizontal clipping. Tab reached Back, Add, Remove Long;
Shift-Tab twice and Enter returned Long selection and System settings focus.
CSS zoom screenshots are supplemental only. Browser zoom/viewport restored;
review tab closed; exact fixture PID 90172 terminated with exit 0 and its
isolated machine removed. Probe resources remain separately owned by slice 1.

### Settings shortcut focus-loss correction

The first independent refactor left type/doc changes with unchanged runtime
proof and passing typecheck. It exposed a gap: Command shortcuts were blocked
only for targets inside settings. A real body click at (2,2), observed as
`document.activeElement === document.body`, followed by the two shortcuts made
the post-return Terminal visibility assertion fail (exit 1) in:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/system-settings.spec.ts --grep 'opening settings preserves' --workers=1
```

`pageShortcuts.ts` now suspends dashboard Command shortcuts whenever System
settings is mounted. The real click supplies only focus; the strengthened
terminal journey observes retained visible terminal/sidebar, previous buffer,
further echo and exactly one attachment without `endedBy`. Root inspected the
handler and assertions. Refreshed proof passed (exit 0):

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/system-settings.spec.ts dashboard/tests/session-sidebar-keyboard.spec.ts dashboard/tests/agent-terminal-keyboard.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard
```

These observations replace only the earlier Command-shortcut/context proof;
project management, HTTP/file, passive-restoration and native visual proof remain
valid.

### Final refactor and preparation

The fresh final refactor preserved all six settings test bodies/assertions while
moving project-management, failure and layout journeys to
`system-settings-project-management.spec.ts` and shared locators to
`support/systemSettingsPage.ts`. No production behavior changed. Root inspected
the relocated observations; replacement proof reached terminal exit 0:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/system-settings.spec.ts dashboard/tests/system-settings-project-management.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard
```

The first formatter launch's continuation identity was accidentally omitted from
the coordinator output. A repeat restored terminal evidence rather than assuming
success; it reached exit 1 on unsafe `history.state`/JSON accesses and a forbidden
test non-null assertion. Narrow type guards and an explicit test guard repair
those findings before delivery. No lint-only gate or successful formatter result
is inferred from the missing first receipt.

The implementation agent narrowed history/JSON from `unknown` and explicitly
guarded the test's attachment after its existence assertion. Root inspected these
three places; the existing expected history marker, string error feedback and
terminal PID observation retain their contracts. The shortcut-refreshed command
and typecheck above again reached terminal exit 0. A fresh independent review
found no further candidate and reused unchanged proof without tests. Two trailing
blank lines in the linked context/contracts were trimmed; tracked and new-file
whitespace checks passed. All changed/new files remain at most 250 lines.
The coordinator's repaired `npm run format` reached terminal exit 0 under the
same runtime/key-unset prefix; no unresolved findings remain.

## Accepted slice 3 proof

Root inspected the credential owner, status-only local boundary, sibling form,
Vite mounting, fixture and named assertions. Implementation and final independent
refactoring are accepted; coordinator formatting passed before this delivery.
At that delivery, real microphone and provider entitlement/usefulness remained
slice 1 obligations.

Terminal exit 0 for these literal commands, with the runtime/key-unset prefix:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/system-settings-openai.spec.ts dashboard/tests/system-settings-openai-recovery.spec.ts dashboard/tests/openai-configuration-boundary.spec.ts dashboard/tests/system-settings.spec.ts dashboard/tests/system-settings-project-management.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/system-settings-openai.spec.ts dashboard/tests/system-settings-openai-recovery.spec.ts dashboard/tests/openai-configuration-boundary.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/openai-configuration-boundary.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/system-settings-openai-race.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard
```

The full selection contains 11 Chromium cases, additionally confirmed with
`--list --reporter=list`. After it passed, test-only temporary-permission and
egress observations were strengthened and all five OpenAI cases passed again.
Exact mutation-response bodies were then added; all three boundary cases passed.
The later three race cases and final strict typecheck also passed.

- `system-settings-openai.spec.ts`: actual empty-development page saves;
  password field clears/focuses, private JSON contains the synthetic key,
  directory/final modes are 0700/0600, temporary files are observed as 0600;
  empty Save preserves bytes and leaving/reopening clears an unsaved draft.
  Actual restart and simultaneous preview share the same credential; replacement
  and removal become visible to the original process on its next read. Separate
  project files stay unchanged. Browser storage/URL/rendered text and server logs
  contain no saved key; browser HTTP(S) and server-provider egress counts are zero.
- `system-settings-openai-recovery.spec.ts`: actual traversal/write permissions
  deny Save/Remove; predecessor bytes, configured status and failed-save draft
  survive. Explicit retries succeed; no temporary file remains.
- `openai-configuration-boundary.spec.ts`: actual dev/preview HTTP refuses foreign
  origin/host, wrong methods/content type, malformed/empty/newline/oversized bodies
  without changing the predecessor or contacting a provider. Read/Save/Remove
  expose exactly `{configured: boolean}`. Malformed/unreadable files yield safe
  errors without secret echo, reseeding or synthetic-environment-key import;
  real form replacement and Retry status recover.
- `system-settings-openai-race.spec.ts`: holds delivery of an actual service GET
  snapshot (false, true, or malformed-file error), performs real Save/Remove,
  then releases it. Final UI status/input/error and actual credential bytes or
  absence show old reads cannot overwrite the mutation's feedback.

`openAISettingsMachine` supplies isolated HOME and real dev/preview/files.
Its preload blocks/counts non-loopback provider fetches and observes permissions
after the real temporary write; it does not simulate configuration/persistence.
Only synthetic credentials are supplied. `dashboardServer.output()` is additive
observation access; existing settings journeys cover its unchanged callers.
Existing local-origin, bounded JSON and mounting contracts remain unchanged.

Failures were diagnosed: successful Save focused a still-disabled input; focus
now follows the pending-state render. A data URL was incorrectly counted as
provider egress; the observation now counts HTTP(S). Three late real-status/error
responses reproduced stale feedback before the revision guard; all passed after
it. Root also moved invalidation after the empty-Save guard, since an empty Save
does not mutate storage. Typecheck passed after this narrow order correction;
successful-operation observations and service/file proof remain unchanged.

An independent refactor made Save reuse Read/Remove's directory-safety guard;
the five OpenAI persistence/recovery/boundary cases passed again. Root then found
and reproduced in both modes an exactly admitted 32,768-byte JSON Save producing
a 32,769-byte file that the reader rejected. Read/write now share one serialized
UTF-8 bound including the newline; Save checks it before touching storage.
`openai-configuration-size.spec.ts` observes exact ASCII/multibyte bodies,
actual bytes, subsequent configured read, replacement/removal and no egress.
Root inspected its real HTTP assertions and the shared bound. Terminal exit 0:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run test:dashboard -- dashboard/tests/openai-configuration-size.spec.ts dashboard/tests/openai-configuration-boundary.spec.ts --workers=1
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH npm run typecheck:dashboard
```

Five cases passed. Launch JSON admission and other accepted boundaries stayed
unchanged. Fresh final independent review found no further candidate; no edits
or tests were needed. Managed CI pause/restore preserved the reviewed credential
files; only the separate test-contract repair and its proof link were added.
The coordinator's `npm run format` reached terminal exit 0 under the same
runtime/key-unset prefix; all changed/new files remain at most 250 lines.
