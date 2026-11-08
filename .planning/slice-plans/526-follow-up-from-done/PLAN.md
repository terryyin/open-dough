# Start a follow-up from recently done work

**Identity:** SEED-273#follow-up-from-done

**Source:** [Start a follow-up from recently done work](../../seeds/SEED-273-follow-up-from-done.md#follow-up-from-done)
**Source review:** [source-review.md](source-review.md)

## Goal and boundaries

A developer can start a new agent session from a done story's Story card or a
standalone Done Session entry in **Recently done** when no session it holds
offers **Open terminal**. The new session starts with the context the
dashboard still holds, sent alongside the developer's new request, through the
project's ordinary **Start session** launch. The source stays Done and
unchanged.

Exclusions, from the seed's deferred promises: no **Follow up** in the
Sessions sidebar or Intent; none beside a session that still offers **Open
terminal**; the new entry does not show or group with its source; the context
cannot be edited or trimmed and carries no source images; no story workflow or
new story is started.

## Current decisions

- **One context rule in `src/`.** A single module composes the follow-up
  context from a source: a done story (its `DoneStory` facts plus the sessions
  its card holds) or one retained session (workflow, story identity, original
  request, `completion.message`, `landing.revision`). The dialog's preview and
  the server's first input use it, so they cannot disagree.
- **The request names its source; the server resolves it.** The ad hoc
  request (`adHocLaunchRequestSchema`, `src/launchRequest.ts:111`) gains an
  optional `followUp` naming either a session reference or a story identity
  with the published revision the page showed. Admission
  (`server/agentLaunchAdmission.ts:144`) resolves it from the launch store
  (`server/launchRecordStore.ts`) and, for a story, the same published done
  record read the page uses (`server/doneCatalogRead.ts`, `done=bodies`) at
  that revision. The resolved context text is kept on the recorded request,
  so retries, Startup recovery and Codex's rebuilt input
  (`server/hosts/codex/input.ts`) resend the same text without reading again,
  even after the source record expires.
- **Identity.** `sameLaunch` (`src/launchRequest.ts:160`) also compares the
  follow-up source (not the resolved text). Launch attempts from a Follow up
  are keyed by project and source, not by `adHocKey(sourceId)` alone
  (`src/launchAttempts.ts:165`), so the project row's Start session attempt
  and each entry's follow-up attempt stay separate.
- **First input.** `unattachedInput` (`server/unattachedInput.ts:11`) places
  the context as its own block before the developer's text: `[context, own,
  reporting]` with no established block and `[block, reporting, context, own]`
  with one. `sendsFirstInput` (`src/unattachedSession.ts:40`) counts the
  context, so a blank follow-up on Default main · Wait for review still sends
  the context and the reporting context. The context never counts against
  `launchInstructionLimit`.
- **Where Follow up appears.** One predicate over the entry's sessions: no
  session whose `sessionAccess` (`src/sessionAccess.ts:31`) is `"terminal"`.
  `DoneStoryCard` puts **Follow up** in its Story actions group; a
  standalone `SessionEntry` in Recently done puts it beside its primary
  action.
- **The dialog.** `StartSession` gains a follow-up form opened by the entry's
  button: the same host, model, options, images, field and Session group, plus
  a read-only source line and context list from the shared rule. The label
  stays the request text, or the launch time when blank, as today
  (`server/hostLaunch.ts:79`).
- **Test data.** Arrange done stories with `makeMe.aDoneRecord` and sessions
  with `makeMe.aLaunchRecord`; add `LaunchRecordBuilder` methods for a
  completion report, a landing revision and a Done mark where missing
  (`tests/support/launchTestData.mjs`). See the
  [test data architecture](../../../tests/README.md#test-data-architecture).

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Follow up offered only when no session offers Open terminal; Read final report stays (seed scope, restriction, “Still reopenable”) | Slices 1 and 2 | Playwright: a standalone Done session with a missing workspace shows Read final report and Follow up; with an available conversation and workspace it shows Open terminal and no Follow up. A done story card with retired-workspace sessions, and one with none, show Follow up; a card holding a session that opens its terminal does not. |
| Dialog is Start session with source and context listed (seed scope, UI) | Slices 1 and 2 | Playwright: the dialog names the source, lists each context item, says when no final report or no session context is retained, and offers the Session group with the Start session defaults. |
| Context sent with the request, alone when blank (“Retired workspace”, “Blank request”) | Slice 1 (session), slice 2 (story) | Backend boundary: Claude's first input holds the context block and the request in the stated order for Default main · Wait for review and Isolated workspace; blank Default main sends context and reporting context. Playwright: the native stand-in receives that input and the session reads in Taken labelled by its request. |
| Different source is a different launch; the same follow-up resumes (“Same words, different sources”) | Slice 1 | Backend: two follow-ups with equal text and choices from different sources start two sessions; repeating one while its start is retained resumes it. |
| Source unchanged | Slices 1 and 2 | Playwright: after Start, the source entry is still in Recently done with Done and its actions; the stored source record and the published done record are unchanged. |
| Retries send the same context | Slice 1 (Claude), slice 3 (Codex, Cursor) | Backend: a continuation after a source record is removed sends the recorded context. |
| Any host | Slice 3 | Backend: Codex's rebuilt input and Cursor's prompt hold the same context; Cursor accepts a model choice with a blank follow-up. |

## Decisive premises

Observed on 2026-11-08 at `41f20e2a0` in this worktree, macOS, Node 24.21.0,
after `node scripts/setup-native.mjs npm`, `browser` and `check`.

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slices 1–3 prove through the dashboard Playwright and backend routes | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard -- backend-tests/launches/agent-launch-ad-hoc-boundary.spec.ts tests/launches/agent-launch-ad-hoc.spec.ts tests/sessions/recently-done-story-sessions.spec.ts --reporter=list --workers=2`, load about 2–3 | Exit 0, 18 passed, including “starting with an empty field sends no instruction”: today a blank default-policy Start sends nothing, which slice 1 changes. |
| Slice 1's predicate: a Done session whose workspace is gone offers Read final report, not Open terminal | Same command form with `tests/sessions/session-workspace-retirement-done.spec.ts tests/stories/recently-done-progressive-navigation-report.spec.ts backend-tests/observation/authenticated-read-done-catalog.spec.ts`, load about 3.8 | Exit 0, 6 passed: a Recently done entry with unconfirmed workspace offers Read final report. `sessionAccess` returns `"final-report"` for any non-available workspace and `"terminal"` only with an embedded terminal and a conversation not confirmed unavailable. |
| Slice 2 reads the done record the card shows | The backend done-catalog spec above passed through the server's `done=bodies` read at a named revision. Slice 2 calls the same server function in process; the transport differs, not the read, so the outcome cannot differ. | Settled. |
| The common case is a retired workspace | Read of `~/.open-dough/dashboard/agent-launches.json` | 1,106 Done story sessions, 7 with a workspace still present; 485 of 1,168 Done sessions carry a final report message, up to 4,536 characters. |
| No paid run | The proof uses the dashboard's native stand-ins; no native host is started. | Settled. |

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. Never sleep, never use `test.slow()`, and keep the default
timeouts. Run Playwright with `NO_COLOR`, `FORCE_COLOR` and
`GIT_ALTERNATE_OBJECT_DIRECTORIES` unset. For full runs on awake macOS with AC
power, use `caffeinate -s -i` and put Homebrew Bash first on `PATH`; on
battery, follow the lid-open procedure and read the sleep log.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Each slice runs its new specs and the existing Start session, ad hoc input,
Recently done and session entry specs it touches
(`tests/launches/agent-launch-ad-hoc*.spec.ts`,
`tests/launches/agent-launch-start-session-*.spec.ts`,
`backend-tests/launches/agent-launch-ad-hoc-*.spec.ts`,
`tests/sessions/recently-done-*.spec.ts`, `tests/stories/recently-done-*.spec.ts`)
plus `npm run typecheck:dashboard`. The first input, launch identity and
Recently done entries are shared paths, so once before landing run the whole
`npm run test:dashboard` and `npm test`.

Update [LAUNCH-START.md](../../../dashboard/LAUNCH-START.md#start-session)
and [AGENT-LAUNCH-HISTORY.md](../../../dashboard/AGENT-LAUNCH-HISTORY.md) in
the slice that changes the behavior they describe.

## Slices

### 1. Follow up a standalone Done session

Type: Behavior
Status: done
Proof: New `tests/launches/agent-launch-follow-up-session.spec.ts`,
`backend-tests/launches/agent-launch-follow-up-boundary.spec.ts` (first input)
and `backend-tests/launches/agent-launch-follow-up-identity.spec.ts` (identity,
resume, Continue after the source is gone, refusals), then the local gate
selection.
Accepted: after the refactor pass, the gate selection plus
`agent-launch-host-switch-fresh`, `agent-launch-story-card`,
`agent-launch-start-story-card` and `agent-launch-story-attachments` passed
137/137 at `--workers=3`; `npm run typecheck:dashboard` exit 0.
Learnings for slices 2–3: the follow-up source lives in
`dashboard/src/followUpRequest.ts` (`followUpSchema`, `followUpSourceKey`);
the context rule in `dashboard/src/followUpContext.ts` already takes a list of
sessions, so a story adds a preamble item; admission resolves it in
`dashboard/server/followUpAdmission.ts`. `StartSession` takes `launches` and an
optional `followUp`. Recently done listings lack `landing` until the entry's
history read, so a card-level Follow up needs the same read. Shared fixtures:
`dashboard/tests/support/followUpSources.ts` and
`dashboard/backend-tests/launches/followUpBoundaryCases.ts`. A blank Cursor
follow-up must be admitted where the page passes `choices.host === "cursor"`
to `launch` and where `AGENT-LAUNCH-HOSTS.md` describes the blank-with-model
refusal.

Behavior: A standalone Done Claude Code session in Recently done whose
workspace is missing, with a request and a final report → it shows **Read
final report** and **Follow up**; Follow up opens the Start session dialog
naming the session and listing its request and report (“no final report was
submitted” for a quiet completion). Starting with a request on Default main ·
Wait for review, and on Isolated workspace, sends the context with the request
in the stated order; blank sends the context and reporting context. The
session reads in Taken labelled by its request; the source stays Done and
unchanged. Two follow-ups with the same text from different sessions are two
launches; repeating one resumes its retained start; a continuation after the
source record is gone sends the recorded context. A Done session that still
offers Open terminal shows no Follow up.

### 2. Follow up a done story

Type: Behavior
Status: planned
Proof: New `tests/stories/recently-done-follow-up.spec.ts` and backend cases
in the slice 1 boundary spec for a story source, then the local gate
selection.

Behavior: A done story's card in Recently done holding Done sessions with
retired workspaces, or none → the card offers **Follow up**; the dialog names
“identity — title” and lists the story's completion time, developer and agent,
then each held session's context, or says no session context is retained. On
Start the first input carries the story facts (including that its seed and
plan may be removed while its history keeps the identity) and each session's
context, read from the done record at the revision the page showed. A card
holding a session that opens its terminal offers no Follow up. The card and
its done record are unchanged.

### 3. Codex and Cursor follow-ups carry the same context

Type: Behavior
Status: planned
Proof: Backend cases beside
`backend-tests/launches/agent-launch-ad-hoc-codex-input.spec.ts` and
`agent-launch-ad-hoc-cursor-established.spec.ts`, then the local gate
selection.

Behavior: A follow-up started with Codex or Cursor, with and without an
established session → Codex's input, including the one rebuilt from the
recorded request, and Cursor's prompt carry the same context block and
request as Claude's; a blank Cursor follow-up with a model choice is accepted
because the context gives it a prompt.

## Plan concerns

Refinement not needed: each slice has one proof loop over one source kind or
host route, all three extend the one context rule and request field from
slice 1, and slice 1 is the largest because the identity, attempt key and
input order are the minimum for any follow-up to start. This review found no
remaining slice-specific concern.
