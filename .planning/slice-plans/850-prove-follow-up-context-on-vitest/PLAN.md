# Prove retained follow-up context in Node Vitest

**Identity:** SEED-413#prove-follow-up-context-on-vitest

**Source:** [Prove retained follow-up context in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-follow-up-context-on-vitest)

## Goal and scope

Give Dashboard maintainers fast typed proof that a follow-up sends the
receiving agent its source's context, the developer's own request and the
reporting context in order, and that a retry still sends them once the source
record is gone. Move the six legacy follow-up specs and the post-split
`agent-launch-follow-up-membership.spec.ts` (25 cases) off backend
Playwright. Preserve source context and identity, input order on each host,
repetition, continuation and refusal. Keep the real second process of the
cross-server answer. Story Notes, published file, comparison and range
selectors, attachment admission, isolated workspace choice and native first
input stay with their owners in the
[campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).
Product behavior is unchanged.

## Current decisions

- Follow the North Star on [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use the [direct domain mapping in ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [local operational state in ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [the proof and cost comparison in ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- PFE: the follow-up already has the typed chain these cases need. A start's
  context resolves in [`withFollowUpContext`](../../../dashboard/server/followUpAdmission.ts)
  through `FollowUpContextInput`, the request is kept by
  [`recordedRequest`](../../../dashboard/server/hostLaunch.ts), and
  [`unattachedInput`](../../../dashboard/server/unattachedInput.ts) builds the
  first input that [`codexInput`](../../../dashboard/server/hosts/codex/input.ts),
  [`cursorPrompt`](../../../dashboard/server/hosts/cursor/prompt.ts) and the
  Claude launch share. The existing
  [follow-up notes admission](../../../dashboard/backend-tests/launches/agent-launch-follow-up-notes-admission.spec.ts)
  already calls this chain on plain Vitest with MakeMe. Reuse it. Extend the
  inputs only where the legacy session cases read an ambient store or
  GitHub: the retained session (`keptSession`), a session's story membership
  (`requirePublishedFollowUpSessionStory`) and the Done record's catalog
  read. Keep attempts and records in a private HOME with the real
  [`LaunchAttemptOwner`](../../../dashboard/server/launchAttemptOwner.ts) and
  [`acceptLaunchRequest`](../../../dashboard/server/agentLaunchAccept.ts), as
  [cross-server accept](../../../dashboard/backend-tests/launches/agent-launch-cross-server-accept.spec.ts)
  does, and request admission through
  [`admittedLaunchRequest`](../../../dashboard/server/agentLaunchAdmission.ts).
- Substitute only GitHub for published facts. The Done record's read decision
  takes the catalog read as a typed input, so the two refusals (not published
  at the revision shown, unreadable) are observed on the production decision
  with a typed outcome, and the real read at a revision stays with the page
  journeys [session follow-up](../../../e2e/launches/agent-launch-follow-up-session.spec.ts),
  [Taken card follow-up](../../../e2e/launches/agent-launch-follow-up-taken-card.spec.ts)
  and [recently done follow-up](../../../e2e/stories/recently-done-follow-up.spec.ts).
  Start no server, Git origin or `claude`, `codex` or `cursor` fixture for
  the Node cases.
- Native receipt of a first input and a host's workspace choice are not
  follow-up behavior. Codex and Cursor follow-ups prove their own first-input
  spelling at `codexInput` and `cursorPrompt`; native dispatch, restart and
  the workspace at fetched trunk stay with their completed owners
  ([host choices and first input](https://github.com/terryyin/open-dough/blob/eac4d5e9e4041f64f603a5afc08378552a9c433c/.planning/slice-plans/849-prove-native-first-input-on-vitest/PLAN.md),
  [session workspace choices](https://github.com/terryyin/open-dough/blob/daea1238c354addf980ff601d7b794fe4523c927/.planning/slice-plans/848-prove-session-workspace-starts-on-vitest/PLAN.md)
  and [its correction](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#restore-session-workspace-vitest-proof)).
  The legacy Codex case's image copy belongs to
  [attachment admission](https://github.com/terryyin/open-dough/blob/ee8d963f593e06a2a2ca518b8c4072e888b8bae6/.planning/slice-plans/842-prove-launch-attachment-admission-on-vitest/PLAN.md).
- Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for requests,
  follow-ups, records and attempts. Keep malformed wire inputs visible. Add
  zero test-support wrappers. Remove `followUpBoundaryCases.ts` and any
  support only these specs use with their last consumer, after tracing the
  page journeys that share `followUpSources.ts` and `followUpStories.ts`.

## Decisive premises

Observed in the owned preparation checkout at `ca4b659de` on 26 November
2026 with Node 24.21.0, one worker, locked dependencies linked from the
integration checkout, and macOS on AC under `caffeinate -s -i`. The host load
average was about 18 from other work. Use these runs for behavioral evidence
and take a comparable pair for the execution's performance claim.

| Premise | Consuming operation and result |
| --- | --- |
| The maintained selector reaches all 25 legacy cases | The slice 1 selection below (`--reporter=list`) passed all 25 Chromium cases on the first attempt, in 75.62 s wall with 1.2 min reported by the runner. Listed case times sum to about 69.2 s (1.1–4.5 s each, none at or below 100 ms): 64.6 s for the 22 original cases and 4.6 s for the three membership cases. By spec: boundary 10.3 s, codex 11.4 s, cursor 10.6 s, identity 17.5 s, live 3.0 s, membership 4.6 s, story 11.8 s. |
| The typed chain builds a story follow-up's first input on plain Vitest, and independent owners race for real files | `npm run test:dashboard:backend -- 'launches/(agent-launch-follow-up-notes-admission\|agent-launch-cross-server-accept)\.spec\.ts$' --workers=1 --reporter=list` passed all 10 Node cases on the first attempt in 11.82 s wall (0–1,228 ms per case). The notes spec calls `admittedLaunchRequest`, `withFollowUpContext`, `recordedRequest` and `unattachedInput` with injected story and session reads and asserts the exact first input; the cross-server spec forks a second process over the same attempt file. They stand as the patterns for slices 2 to 6. |
| The legacy session cases read ambient state the typed inputs must replace | `resolveSessionFollowUp` calls `keptSession(source.id, …)` and `requirePublishedFollowUpSessionStory`, and `retainedFollowUpWithStory` repeats both, neither of which `FollowUpContextInput` carries. Slice 1 adds them. The other three reads (`publishedDoneStory`, `followUpStorySessions`, `pendingInputOf`) are already injected. Read at `ca4b659de`. |
| The Done record's refusals depend only on the catalog read's outcome | `publishedDoneStory` (`followUpStory.ts`, lines 59–86) makes one `performDoneCatalogRead` call and then decides from its outcome alone: a thrown or `failed` read is the 502, a read that is not an answer with records, has no record, or names another identity or an unreadable record is the 404, and a readable one is the story. Slice 3 takes that call as a typed input. Read at `ca4b659de`; no behavior is assumed beyond that decision. |
| Every host spells a follow-up's first input through the shared builder | `codexInput` (line 38), `cursorPrompt` (line 21) and the private `claudeInstruction` (line 51) call `unattachedInput` for an ad hoc request, and `codexInput` replays a saved text. Only `codexInput` and `cursorPrompt` are exported, so Claude's wiring is read, not run, and stays covered by the retained page journeys. Read at `ca4b659de`. |

## Ordered slices

### 1. Resolve a follow-up's session source from typed inputs

Type: Structure
Status: done
Estimate: 10–15 active minutes.

Behavior: the retained session and its published story membership are inputs
of the context resolution, so slices 2, 3, 4, 6 and 7 hand them to production.
`FollowUpContextInput` gains the kept-session read and the story-membership
check, `retainedFollowUpWithStory` takes the same input, and the Done
record's read decision takes its catalog outcome as a typed input. The
production composition in `agentLaunches.ts` and `launchRun.ts` passes the
current ambient reads.

Proof: the seven legacy specs, selected as in the local gate, still pass
unchanged, with `npm run typecheck:dashboard`. Enables slice 2.

### 2. Send a retained session's context, the request and the reporting context in order

Type: Behavior
Status: done
Estimate: 12 active minutes.

Proof: Admit a follow-up of a Done session kept as a MakeMe record, resolve
its context from typed inputs, record the request and build the first input
with `unattachedInput`, `codexInput` and `cursorPrompt`. Claude's private
instruction calls the same builder, and its real start stays with the page
journeys. On the execution checkout the context comes first, then the
developer's text, then the reporting context. A blank request sends no part
of its own and is titled by its launch time. The source record is unchanged.
Remove those two cases from `agent-launch-follow-up-boundary.spec.ts`. Keep
the file while its isolated-workspace and long-report cases remain. Keep the
new spec at or under 250 lines; put the kept-session arrangement in a
colocated module if the spec would pass that.

### 3. Send an established session's block, a long report, and a blank Cursor model

Type: Behavior
Status: done
Estimate: 12 active minutes.

Proof: With an established session its block and the reporting context come
first, then the context and the request. A final report longer than the
instruction field's limit is sent whole beside a request at that limit. A
chosen Cursor model with a blank request is admitted and recorded. Remove
the remaining cases of `agent-launch-follow-up-boundary.spec.ts` and that
one case of `agent-launch-follow-up-cursor.spec.ts`. Reuse slice 2's
arrangement. Keep the Claude page journeys for the real start.

### 4. Send a Done story's facts and its selected sessions' context

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: With a published Done record and sessions kept for the story, a
follow-up at the revision shown sends the story's facts and only the
selected sessions' context. Another story's sessions and a still open
session are left out. With no session kept it says that no context is
retained, and the first input and the recorded request agree. A story the
revision does not publish refuses with 404 and an unreadable record with
502, before any host starts and with the kept records unchanged. Convert the
two sending cases of `agent-launch-follow-up-story.spec.ts` and its two
refusals. The Codex story case's follow-up-specific observation moves here;
its image copy and workspace stay with their owners.

### 5. Keep follow-ups of different sources apart and resume the same one

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: With the real attempt owner and a private HOME, follow-ups of two
sessions or of two stories with the same words and choices are two kept
attempts, each with its own context. Repeating one after the host refused
resumes its kept attempt with the same id and acceptance time and sends its
saved context and the instruction once, also when the source record is gone.
Convert the two-session, resume and expiry-resume cases of
`agent-launch-follow-up-identity.spec.ts` and the two-story case of
`agent-launch-follow-up-story.spec.ts`.

### 6. Refuse a follow-up the project cannot stand behind

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: Request admission and the resolver refuse, before any host starts and
with the kept attempts and records unchanged: context text composed by a page
(400), a session the project no longer keeps (404), a repeat after expiry
that claims a new image (404, the claim abandoned and nothing left kept), a
session with no story binding or one the published project does not list
(404), and a binding the page supplies (400). Convert the refusal cases of
`agent-launch-follow-up-identity.spec.ts`, the forged-context and fresh-claim
parts of its expiry case, and `agent-launch-follow-up-membership.spec.ts`.

### 7. Continue a retained follow-up after its source and attempt records are gone

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: Continue a kept follow-up attempt after the source record is
removed. The recorded context and the story binding are sent, with the
instruction once. For Codex, a pending first input kept without its attempt
is recovered with the same saved text and the conversation reused. For
Cursor, a story follow-up saved with its context beside the instruction
still sends both. Convert the Continue cases of the identity, Codex and
Cursor specs through the production continuation and
`retainedFollowUpWithStory`. Native submission stays with the retained
Codex and Cursor journeys.

### 8. Answer a repeat of a follow-up running on another server

Type: Behavior
Status: planned
Estimate: 8–12 active minutes.

Proof: With one attempt running on the first server and its source record
gone, the second server's repeat answers `uncertain` with the running
attempt's explanation, starts nothing and keeps one attempt. Use two owners
over one private HOME and a real forked second process where its lock
supplies the condition, as the independent-writer spec does. Convert
`agent-launch-follow-up-live.spec.ts`. After slices 2 to 8, delete the
retired specs and `followUpBoundaryCases.ts`.

## Proof ownership and local gate

Files in the following map are relative to `dashboard/backend-tests/launches/`.

| Slice | Legacy selection | Observable proof |
| --- | --- | --- |
| 1 | the seven specs | Existing behavior and types stay green |
| 2 | `agent-launch-follow-up-boundary.spec.ts` (execution-checkout order, blank request) | Context, then the request, then the reporting context; blank request titled by launch time; source unchanged |
| 3 | `agent-launch-follow-up-boundary.spec.ts` (isolated workspace, long report), `agent-launch-follow-up-cursor.spec.ts` (blank request with a chosen model) | Established-session block first, whole long report, Cursor model with no instruction |
| 4 | `agent-launch-follow-up-story.spec.ts` (two sending and two refusal cases), `agent-launch-follow-up-codex.spec.ts` (story case) | Story facts, selected sessions only, no-session wording, 404 and 502 before any start |
| 5 | `agent-launch-follow-up-identity.spec.ts` (two sessions, resume, expiry resume), `agent-launch-follow-up-story.spec.ts` (two stories) | Two sources, two attempts; same attempt resumed with saved context |
| 6 | `agent-launch-follow-up-identity.spec.ts` (two refusals, expiry refusals), `agent-launch-follow-up-membership.spec.ts` (3) | Forged context, unkept source, claimed image and binding refusals before any start |
| 7 | `agent-launch-follow-up-identity.spec.ts` (Continue), `agent-launch-follow-up-codex.spec.ts` (two), `agent-launch-follow-up-cursor.spec.ts` (two) | Recorded context sent after expiry, pending Codex input recovered, legacy Cursor instruction kept |
| 8 | `agent-launch-follow-up-live.spec.ts` | Running attempt answered from a second process, nothing started |

For the first and final comparisons, use fresh absolute proof paths from the
repo root and one worker, and repeat the baseline at the execution base if
affected paths or the measurement conditions changed. Account for all 25 legacy
cases (22 at `07435ba0f` plus three membership cases) before accepting zero
Playwright selections for these seven files. If a replacement moves to a new
filename, add its exact selector to the candidate run and record the matching
proof owner. Confirm baseline discrimination for any legacy assertion
retired as redundant.

```sh
selection='launches/agent-launch-follow-up-(boundary|story|identity|live|codex|cursor|membership)\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$e2e_proof" /usr/bin/time -p npm run test:e2e -- 'e2e/(launches/agent-launch-follow-up-(session|taken-card)|stories/recently-done-follow-up)\.spec\.ts$' --workers=1
```

Run affected consumers from the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
and `npm run typecheck:dashboard` for changed typed contracts. Record engine
and case counts, per-case time against roughly 100 ms, summed case time,
elapsed selection time, and the separate cost of proof retained or moved to
E2E.

Use awake macOS on AC under `caffeinate -s -i` for long local checks per
[AGENTS.md](../../../AGENTS.md). Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to every failure and repair handoff. Keep default test timeouts.

## Execution

- Mode: story-branch. Identity: SEED-413#prove-follow-up-context-on-vitest. Publisher: dashboard-territory.local-open-dough. Agent: Shunka-chan.
- Workspace: `/Users/terryyin/git/open-dough/.worktrees/prove-retained-follow-up-context-in-node-vitest`, branch `cursor/prove-retained-follow-up-context-in-node-vitest`, reused from the established start. Starting revision `0633724b8d68d501eafaf4884ca22b04ab91659e`.
- Accepted publication: `1e48b975cff53d62f4828a5815b29fd04cbde201` on `origin/cursor/prove-retained-follow-up-context-in-node-vitest`. Previously published base for the next increment. The Take `2b92b4894804637356af4100c48bf331abcd853a` remains the claim; its CI is `pendingCi: unobserved`. Observer: `/tmp/dough-ci-501/watch-DljhmU`, GitHub Actions `ci.yml` (display name CI), reused for this branch.
- Readiness: Changed since readiness review. Recorded Ready stands; Take did not renew it.
- Replanning: existing planning authority (neither `--replan` nor `--no-replan`).
- Checkout setup: locked `npm ci` (lockfile unchanged) and `npm run typecheck:dashboard` passed on Node v24.21.0.

## Learnings

- `FollowUpContextInput` carries `keptSession` and `requirePublishedFollowUpSessionStory`. `followUpContextInput()` is the production composition both `AgentLaunches.accept` and `startedRun` pass. `publishedDoneStory` decides from a `DoneStoryCatalogRead`; its default still calls `performDoneCatalogRead` once, and the refusal text is unchanged.
- `agent-launch-follow-up-notes.spec.ts` was 249 lines. Putting the two new fields on separate lines, as formatting does, would have made it 251. The refused-follow-up arrangement now lives in `refusedNotesFollowUp.ts` (194 lines) and the spec is 63. Both are under the 250-line check.
- The seven-spec run after that composition was 25/25 in about 25s. The earlier 65s baseline on the same selection was at a higher load. The difference is the host, not this edit.
- Slice 2's first attempt overran at 17.3 active minutes with no proof. The draft spec was 268 lines and the blank-model Cursor case had been removed from Playwright before a Vitest replacement passed. That attempt was reverted. The false sizing assumption: the four boundary cases and the Cursor model case, including retiring the Playwright spec and staying under 250 lines, fit in one 15-minute slice. Those cases are now slices 2 and 3. This is the story's first overrun.
- Slice 3's proof had already passed when the clock was paused at 15.2 active minutes, so the story's second overrun is that pause, not a failed proof. Remaining slices 4 to 8 are separate families already bounded in this plan. Continue them one at a time. The delivered value so far is the typed follow-up inputs, the execution-checkout order, and the established-session, long-report, and blank-model cases.
- Slice 4's proof had already passed, 9 tests exit 0, when the clock reached 16.9 active minutes. That is the story's third overrun, and it is the return after a green proof, not an unfinished design. Delivered value adds the Done story's facts, selected sessions only, the no-session wording, and the 404 and 502 refusals before a host starts. Remaining scope is slices 5 to 8, each already one family inside the eight-slice cap. Continue them one at a time. Do not split those families again. If a later slice overruns before its proof passes, stop that attempt and reassess before more implementation.
- Slice 5's four tests had already passed when the clock reached 16.8 active minutes. That is the fourth overrun, again after a green proof. The resume cases need an isolated review policy so acceptance reaches the attempt owner without a Git status. Delivered value adds two sources kept apart and the same attempt resumed, including after the source record is gone. Remaining scope is slices 6 to 8. Continue them one at a time. The stop condition from slice 4 still holds: an overrun before the proof passes stops that attempt.
- Slice 6 reached 16.4 active minutes before its proof was launched. That is the fifth overrun. The false sizing assumption: the six refusal cases, including planting an attachment claim and staying under 250 lines, fit in 15 minutes with the proof still unstarted. The written spec then passed, 7 tests, once it was run; formatting it was 260 lines, so the arrangement moved to `followUpRefusal.ts`. No further cases were added after the overrun. Remaining scope is slices 7 and 8. Continue them one at a time, and launch the proof before any cleanup that can be done after it.

## Accepted proof

Slice 1. Promise: a follow-up's kept session and published story membership are inputs of context resolution, the Done record's catalog read is a typed input, and the seven legacy specs still pass. Boundary: production follow-up admission through the backend Playwright runner. Setup: those seven specs, unchanged. Command: `npm run test:dashboard:backend -- 'launches/agent-launch-follow-up-(boundary|story|identity|live|codex|cursor|membership)\.spec\.ts$' --workers=1`. Result: 25/25 passed, `strictStatus` passed, about 25s, recorded in the checkout evidence as `slice1-refactor-backend-proof.json`, after `followUpContextInput()` replaced the two inline objects. `npm run typecheck:dashboard` exited 0. The two notes specs, 9/9, passed again after the arrangement move, including both cases in `agent-launch-follow-up-notes.spec.ts`. Caller-supplied catalog outcomes stay with slice 4.

Slice 2. Promise: on the execution checkout a retained session's context comes first, then the developer's text, then the reporting context; a blank request sends no part of its own and is titled by its launch time; the source records stay unchanged. Boundary: `withFollowUpContext`, `recordedRequest`, `unattachedInput`, `codexInput`, and `cursorPrompt`. Setup: a MakeMe Done session and a typed `FollowUpContextInput`. Command: `npm run test:dashboard:backend -- launches/agent-launch-follow-up-session-input.spec.ts --workers=1`. Result: 2 passed, 8 ms and 1 ms, exit 0, `slice2.log.run.json`. The isolated-workspace and long-report cases remain in the Playwright boundary spec for slice 3. Refactor pass skipped: the edit is these tests only, and it adds no production concept past the typed inputs slice 1 already published.

Slice 3. Promise: an established session's block and the reporting context come first, then the retained context and the request; a final report longer than the instruction limit is sent whole beside a request at that limit; a blank Cursor request records its chosen model and is titled by its launch time. Boundary: `unattachedInput`, `codexInput`, and `cursorPrompt`, with the block from `formatEstablishedSession`. Setup: a MakeMe Done session and a typed `FollowUpContextInput`. Command: `npm run test:dashboard:backend -- launches/agent-launch-follow-up-established-input.spec.ts --workers=1`. Result: 3 passed (8 ms, 2 ms, 1 ms), exit 0, `slice3.log.run.json`. The boundary Playwright spec is removed. The two Cursor Continue tests stay for slice 7. Refactor pass skipped: the new spec repeats slice 2's expected-context text rather than a second production rule. Native Cursor arguments stay with their owner.

Slice 4. Promise: a follow-up at the revision shown sends the Done story's facts and only the selected sessions' context; another story's sessions and a still open session are left out; with no session kept it says no context is retained and the first input agrees with the recorded request; a story the revision does not publish is 404 and an unreadable record is 502, before any host starts, with the kept sessions unchanged. Boundary: `withFollowUpContext`, `recordedRequest`, `unattachedInput`, `codexInput`, and `acceptLaunchRequest` with a typed `DoneStoryCatalogRead`. Setup: MakeMe Done records and launch records, and a catalog read standing in for GitHub. Command: `npm run test:dashboard:backend -- launches/agent-launch-follow-up-story-input.spec.ts --workers=1`. Result: 9 passed, exit 0. The candidate that matches this assertion is `slice4-repair.log.run.json`, after the recorded follow-up was matched with `toMatchObject` so the union type checks. The first green run is `slice4.log.run.json`. The two sending cases and two refusal cases left the story Playwright spec; the Codex story case left that spec. The two-story resume stays for slice 5, and the Codex Continue cases stay for slice 7. Refactor pass skipped: the edit is these tests and their colocated arrangement, and it adds no production concept. Image copy, isolated workspace, and native Codex stay with their owners. The consumer trace's located rows are term collisions from the removed Playwright text; this slice changes no production contract.

Slice 5. Promise: two sessions, or two stories, with the same words and choices are two kept attempts, each with its own context; repeating one after the host refused resumes that attempt with the same id and acceptance time and sends the saved context and the instruction once, including after the source record is gone. Boundary: `LaunchAttemptOwner` and `acceptLaunchRequest` over a private HOME, with the host as the run callback. Setup: MakeMe sessions and Done records, and a typed `FollowUpContextInput`. Command: `npm run test:dashboard:backend -- launches/agent-launch-follow-up-attempt-identity.spec.ts --workers=1`. Result: 4 passed, exit 0. The candidate that matches this assertion is `slice5-repair.log.run.json`; the first green run is `slice5.log.run.json`. `npm run typecheck:dashboard` exited 0 after the input guard. The story Playwright spec is deleted. The identity spec keeps the forged-context 400, the fresh image-claim 404, Continue, and the other refusals. Refactor pass skipped: the edit is these tests and their colocated arrangement, and it adds no production concept.

Slice 6. Promise: admission refuses, before any host starts and with attempts and session records unchanged, a page-composed context (400), a session the project does not keep (404), a repeat after the source is gone that claims a new image (404, the claim abandoned), a session with no story binding (404), a story the catalog does not list (404), and a binding the page supplies (400). Boundary: `acceptLaunchRequest` and `claimLaunchAttachment` over a private HOME. Setup: MakeMe sessions and a typed catalog read standing in for the published list. Command: `npm run test:dashboard:backend -- launches/agent-launch-follow-up-refusal.spec.ts --workers=1`. Result: 7 passed, exit 0. The candidate that matches this assertion is `slice6-split.log.run.json`, after the arrangement moved to `followUpRefusal.ts` so formatting stays at or under 250 lines. The first green run of the unsplit spec is `slice6.log.run.json`. `npm run typecheck:dashboard` exited 0. The membership Playwright spec is deleted. The identity spec keeps Continue for slice 7. Refactor pass skipped: the edit is these tests and their colocated arrangement, and it adds no production concept.

## Plan review

Slice-plan refinement was not needed: the Structure slice comes first and only
opens the typed inputs that the Behavior slices consume, and each Behavior
slice owns one observable family and removes its legacy cases. This review
found no remaining slice-specific concern. Slices 5 to 7 convert five legacy
cases each from shared attempt, record and host setup; their estimates assume
one MakeMe attempt builder per slice and an owner that needs no server, as
the cross-server spec shows.
