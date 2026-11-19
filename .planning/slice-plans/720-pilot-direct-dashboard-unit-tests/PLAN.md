# Pilot direct backend handler and narrow UI component tests on Story Notes

**Identity:** SEED-413#pilot-direct-dashboard-unit-tests
**Source:** [Pilot direct backend handler and narrow UI component tests on one dashboard family](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#pilot-direct-dashboard-unit-tests)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Story Notes becomes the reference family for dashboard unit tests. Its
backend cases call a typed notes handler in-process on plain Node Vitest, with
one wire check through a started server. Its frontend cases mount
`StoryNotesDialog` or the `StoryNotes` control with typed inputs and deliver
input in the page. Both test READMEs state the entry rules, and spent
`dashboard/test-support/` modules are deleted. The seed holds the full scope,
the scope limits, the key examples and the 2026-11-19 baseline.

Excluded, as the seed states: the other notes specs (`story-note-voice*`,
`intent-story-notes`, the `review/` notes specs, `follow-up-attach-notes`),
`frontendStoryNotesRule.ts` and `storyNotesPage.ts` while those import them,
both Playwright configs, the `.mounted.spec.ts` naming, the other endpoints in
`projectConfigurationBoundary.ts`, and `Distribution/src/`.

## Approach and reuse

This plan follows both topics of the
[Architectural North Star](../../NORTH-STAR.md): production seams instead of
test support, and plain Vitest for unit tests. ADR 0008's direct mapping of
dashboard data across the wire and ADR 0002 support the seams; no Accepted ADR
conflicts.

- **Shared contract (reuse).** `dashboard/src/storyNote.ts` already holds
  `storyNoteChangeSchema`, `StoryNoteChange`, `StoryNotesAnswer` and the
  endpoint. The handler and the frontend cases use these types; nothing is
  added to the contract.
- **Handler under the adapter (change).** `answerStoryNotes(req, signal)` in
  `dashboard/server/storyNotes.ts` (151 lines) keeps method, `?id=`, project
  admission, body parsing and abort, and calls an exported typed handler that
  reads or changes one admitted project's notes. Domain refusals, such as a
  note that no longer exists, stay in the handler. `localJsonEndpoints` keeps
  mapping refusals to statuses.
- **Machine state per case (reuse).** `machineDashboardPath` resolves `HOME`
  at each call, so a Node case sets a temporary home. `makeMe.aStoryNote`
  builds notes.
- **One group run for two engines (modularize).** The frontend group already
  selects, splits, times and records Vitest cases beside Playwright ones
  through `frontendMounted.mjs`, `frontendOutputs.mjs`, `frontendProof.mjs`
  and `frontendSelection.mjs`. That code ran a Node Vitest backend spec
  unchanged in the premise below. The backend command uses the same code with
  its own group and Vitest config; no second copy is written. One predicate
  says whether a file is a Vitest file, shared by the group command, the
  group's Playwright config and lint. The marker is transitional, since each
  group ends with one engine. The proof record names the engine a case ran
  on, so a Node case is not recorded as `mounted-chromium`.
- **Oversized file.** `scripts/test-frontend.mjs` is 253 lines, over the
  250-line check. Slice 1 reorganizes it by responsibility: the two-engine
  group run (deadline, suite admission, Vitest preparation, proof and times)
  taking a group and a Vitest config, and the retained Playwright child with
  its title selection. Each group's command is a thin entry. Its callers are
  `package.json`, `browserTestGroups.mjs`, the CI group workflow and
  `Distribution/tests/support/ci-browser-groups.test.mjs`,
  `ci-proof-action-replay.mjs` and `local-test-suite-checkout.mjs`. Preserved
  proof is slice 1's.
- **Typed source behind the hook (reuse).** `StoryNotesOnPage` already
  carries each project's `localSettingState`, built over a request function.
  A case builds that state over its own source typed
  `(change?: StoryNoteChange) => Promise<StoryNotesAnswer>` and provides it
  through the context. Production keeps binding the source to the notes
  endpoint. The only production change is exporting the typed constructor a
  case and `useStoryNotes` share.
- **Page-loadable MakeMe (modularize).** `makeMe.mjs` cannot load in a
  browser case. A page-loadable MakeMe entry holds `aStoryNote`, and
  `makeMe.mjs` exposes the same builder from it.
  `Distribution/tests/test-data-architecture.md` says which entry a browser
  case imports.
- **In-page input.** Cases mount with React `act` and deliver clicks and text
  in the page. A case uses the browser provider's keyboard only where native
  activation is the behavior, which is opening the dialog from the keyboard.
  Nothing is added to `dashboard/test-support/` for this.

### Owner of each existing frontend behavior

| Existing case | Owner after this plan |
| --- | --- |
| all card kinds offer general notes, blank is unsaved, newest first | Dialog: context heading, blank save asks nothing, a saved note shows, opener focus on close (control). Newest first: backend. Card hosting: board keyboard spec and Recently done follow-up E2E, unchanged. |
| a refused save keeps its draft | Dialog |
| an unreachable save keeps its draft | Dialog |
| a line note edits text alone, cancel keeps it, delete removes and updates count | Dialog; count on the control |
| saving an unchanged edit of a sent note shows it waiting again | Dialog asks for the edit and shows the answered state; the new version is the backend's |
| refused edits and refused deletion keep text and report failure | Dialog |
| waiting and sent notes show their state; the card counts only waiting notes | Dialog states; control waiting description |
| next project read updates the count and open list; an older read cannot replace a save | Control with a case-supplied source and a controlled clock |
| a Taken note survives a new launch and appears on Done | Keeping by project and identity: backend. Line context shown on a note: dialog. Saving a note from a diff line: the existing `review/` notes specs and `e2e/review/story-review-diff-add-note.spec.ts`, unchanged. |
| Story notes leaves an attached terminal mounted and connected | One step in `e2e/terminals/agent-terminal-lifetime.spec.ts` |
| unreadable notes replace the count and say so in Story notes | Control and dialog |

## Decisive premises

Observed on 2026-11-19 at `2633ef12d` in this workspace, Node 24.21.0,
Vitest 5.1.0, load about 4. Scratch files were removed after each run.

| Consuming operation | Observed result and limit |
| --- | --- |
| Frontend cases mount `StoryNotesDialog` directly and deliver input in the page (slice 4) | `vitest run --configLoader runner --config dashboard/frontend.vitest.config.mts` on a scratch `.mounted.spec.tsx`: mount 1–33 ms; add-a-note case about 5 ms with `act` and in-page events; 286–548 ms with the provider's `click()`. |
| The control reads through a case-supplied source (slice 5) | Same command, scratch spec providing `StoryNotesOnPage` with `localSettingState(source)`: unreadable state and "an older read cannot replace a save" passed at 20–33 ms without a production change. Not observed: advancing the check interval with a controlled clock; the existing mounted family already does this with `vi.useFakeTimers` over the same `localSettingState`. |
| A browser case imports note data from MakeMe (slice 4) | Importing `makeMe.mjs` failed: `Module "node:fs" has been externalized`. Importing `StoryNoteBuilder` from `storyNoteTestData.mjs` in the same spec passed. A page-loadable entry adds one Node-free module over that import. |
| Node Vitest calls the notes store in-process under a temporary `HOME` (slices 2, 3) | `vitest run --root .` on a scratch spec under `dashboard/backend-tests/`, calling `waitingStoryNotes` and `deliverAttachedStoryNotes` against a seeded file: three cases at 12–27 ms, 0.8 s wall, file content as expected. The handler split moves code inside the same module and store. |
| The frontend group's Vitest and proof code serves a Node Vitest backend spec (slices 1, 2) | A scratch script called `prepareMounted` with a Node-environment config and one backend spec, then `finishFrontendGroup`: status 0, proof record `completed` with both cases `passed`, times file labelled `backend-tests/...`. Not observed: the group's split and `--list` for backend files, which run through the same `selectedFiles` and listing code the frontend uses; slice 2 proves them. |
| The E2E terminal-lifetime journey can own notes beside a terminal (slice 6) | A scratch step after the project-switch step opened and closed Story notes on the ready story's card through `storyNotesPage`, typed into the terminal and asserted the single attachment. `playwright test --config e2e/playwright.config.ts terminals/agent-terminal-lifetime` exited 0. |
| Card hosting is already observed elsewhere (no slice) | With `<StoryNotes>` removed from `StoryCard.tsx` in a scratch edit, `playwright test --config dashboard/frontend.playwright.config.ts navigation/accessible-board-keyboard` failed on the first Backlog card's Notes stop. `e2e/stories/recently-done-follow-up.spec.ts` opens seeded notes from a Done card through the same role locator; that one was read, not run without the control. |
| Baseline for the timing promise (slices 3, 6) | `node scripts/test-frontend.mjs stories/story-notes`: 11 cases, 4.3 s summed, 6.1 s wall. `playwright test --config dashboard/backend.playwright.config.ts review/story-notes` with the proof record: 7 cases, 4.5 s summed, 5.3 s wall. |

## Ordered slices

### 1. One group run serves both dashboard groups

Type: Structure
Status: done

Structure: Reorganize `scripts/test-frontend.mjs` and its support modules into
a two-engine group run that takes a group and its Vitest config and uses
the one shared Vitest-file predicate, and a retained Playwright child with its title
selection. The frontend command stays `npm run test:dashboard:frontend` with
unchanged selection, listing, split, times, proof record, deadline,
interruption and exit status. The proof record names each case's engine.
Enables slice 2, where the backend group uses the same run.

Learning: the group run lives in `scripts/dashboard-group-run.mjs`, the
retained Playwright child in `scripts/retained-playwright.mjs`, and
`scripts/test-frontend.mjs` is an 11-line entry. The run takes a group, its
Vitest config and an engine name; the one predicate, `isVitestFile` in
`frontendSelection.mjs`, marks `.mounted` and `.unit` before `.spec`/`.test`,
so backend Vitest files are `*.unit.spec.ts`. The Vitest results directory
prefix is now `vitest-`. Lint uses globs, not the predicate.

Proof: `Distribution/tests/support/ci-browser-groups.test.mjs` and the proof
replay tests pass. `node scripts/test-frontend.mjs stories/story-notes`,
the same with `--list`, a mixed selection with `--grep` across a mounted and a
retained spec, and a run with `_SPLIT`, `_TIMES` and `_PROOF_RECORD` set give
the same cases and record shape as before the change. The whole frontend
group passes.

### 2. The backend group runs a Node Vitest case through the typed notes handler

Type: Behavior
Status: planned

Behavior: Given a project with two saved notes for one story in a temporary
machine home, when a plain Node Vitest case asks the typed handler to add a
note, then the answer lists the new note first with an assigned id and time
and the notes file holds the three notes, with no server started. The case
runs in `npm run test:dashboard:backend` beside the Playwright specs, is
listed by `--list`, obeys `_SPLIT`, and appears in the group's times and proof
record.

Structure carried from slice 1: once the backend group calls the run, rename
the frontend- and mounted-named support modules and exports
(`frontendSelection`, `frontendMounted`, `frontendOutputs`, `frontendProof`,
`frontendFiles`, `finishFrontendGroup`, `prepareMounted`, `printMountedListing`
and the `Mounted*` names) to group- and Vitest-named ones, with their importers.

Proof: The new case passes through `bash scripts/test.sh` on its path and
through `npm run test:dashboard:backend -- review/story-notes`, which also
runs the existing Playwright notes specs unchanged. A scratch failure in the
handler's ordering fails the case. A run with `_PROOF_RECORD` and `_TIMES`
set records the case; `--list` shows it; a `_SPLIT` run places it in exactly
one shard. `ci-browser-groups.test.mjs` agrees with the backend command and
`ci.yml`. The whole backend group passes, since the command every backend
spec runs through changes.

### 3. Every notes store rule is proven in-process, with one wire check

Type: Behavior
Status: planned

Behavior: Node Vitest cases through the handler prove the store rules the
seed lists: assigned ids and times with trimmed text and kept line context,
notes kept by project and identity and read again from the file, edit and
delete rules with unknown ids refused without a write, a delivered note
keeping `delivered` and getting a new version on edit, an unreadable file
reported and preserved with a refused save, and an unwritable store refused
then accepted once writable. One Playwright wire check keeps refused methods,
a missing or unconfigured project, malformed and non-JSON bodies, a foreign
origin, `no-store`, and the status an unreadable store and an unknown note
map to. The HTTP versions of the moved cases are deleted.

Proof: `npm run test:dashboard:backend -- review/story-notes` passes. Each
moved rule's case fails under a scratch edit that disables the rule in
`storyNotes.ts`. The in-process cases' summed time is reported against the
4.5 s baseline. `backend-tests/launches/followUpNotesCases.ts` consumers and
`e2e/stories/recently-done-follow-up.spec.ts`, which read the same store,
pass.

### 4. Story notes dialog behaviors are proven on the mounted dialog

Type: Behavior
Status: planned

Behavior: Given `StoryNotesDialog` mounted with MakeMe notes from the
page-loadable entry and a case-supplied `onChange`, a user adding, editing,
cancelling and deleting sees what the table assigns to the dialog: the story
context heading, a blank save asking for nothing, one typed change per save
with the story's identity, a refused or unreachable change keeping the draft
or the original note and saying so, waiting and sent states, a note's line
context, and the unreadable message. The existing add and edit files are
replaced by these cases.

Proof: The new cases pass through
`node scripts/test-frontend.mjs stories/story-notes`. Each fails under a
scratch edit of the dialog behavior it names. `makeMe.mjs` consumers still
get `aStoryNote`: the backend notes cases and
`Distribution/tests/makeme/` pass.

### 5. The notes control's count, refresh and focus are proven on the mounted control

Type: Behavior
Status: planned

Behavior: Given the `StoryNotes` control mounted with a case-supplied typed
source, the control shows the count and the waiting description, replaces the
count with "The notes could not be read." for an unreadable answer, updates
the count and the open list at the next check under a controlled clock, keeps
a save's notes when an older read answers later, opens from the keyboard, and
returns focus to its opener on close. The existing refresh, unreadable and
retained files are replaced by these and slice 4's cases.

Proof: The new cases pass through
`node scripts/test-frontend.mjs stories/story-notes`. The stale-read case
fails when `localSettingState` accepts the older answer in a scratch edit.
The built-app specs that read notes through `useStoryNotes`
(`story-note-voice*`, `review/story-review-notes`,
`launches/follow-up-attach-notes`, `intent/intent-story-notes`) pass.

### 6. The terminal journey owns notes beside a terminal, and spent support is gone

Type: Behavior
Status: planned

Behavior: In `e2e/terminals/agent-terminal-lifetime.spec.ts`, opening and
closing Story notes on a card leaves the attached terminal printing and on
its one attachment. `story-notes-terminal.mounted.spec.ts` is deleted, and
with it every `dashboard/test-support/` module and browser command with no
importer left: on 2026-11-19 `mountedStoryNotesBoard.ts`,
`mountedStoryNotesPage.ts`, `mountedSessionTerminal.ts`,
`mountedStoryReviewPage.ts`, `mountedRetainedNoteCommands.ts`, the notes
board commands, the terminal commands when unused, and the held notes answer
in `mountedServices.ts` and `mountedDashboard.ts`. The Story Notes unit cases
total at most about 1.1 s summed case time at two workers.

Proof: The E2E journey passes, and its notes step fails when a scratch edit
remounts the terminal panel while the dialog is open. An importer search
shows no remaining reference to each deleted module.
`test-harness/mounted-dashboard.mounted.spec.ts` and the `navigation/`
mounted specs, which share `mountedDashboard.ts`, pass. The summed case time
from `node scripts/test-frontend.mjs stories/story-notes` is reported with
case count, worker count and load against the 4.3 s baseline. `npm run lint`
and `npm run typecheck:dashboard` pass.

### 7. The test guidance states the entry rules and names the reference family

Type: Behavior
Status: planned

Behavior: A contributor reading `dashboard/backend-tests/README.md` or
`dashboard/frontend-tests/README.md` finds the entry rules this family
follows, the test-support freeze, and Story Notes named as the reference;
the frontend README's mounted-board section describes only what remains.
`Distribution/tests/test-data-architecture.md` names the page-loadable
MakeMe entry. `.planning/open-dough.json` disables `pageObjects` on
`dashboard/frontend-tests`, so the page-object convention no longer selects
its sources.

Proof: The installed intent-location settings
(`.agents/skills/dough-makeme/scripts/intent-location-settings.mjs`) report
`pageObjects` off for a `dashboard/frontend-tests` spec and unchanged for
`e2e`. Every path and module the READMEs name exists. The distribution tests
that read `.planning/open-dough.json` or the READMEs pass.

## Proof map

| Promise in the seed | Slice |
| --- | --- |
| Thin wire adapter over a typed handler on the shared contract | 2, 3 |
| Store rules proven in-process on Node Vitest with the real store | 2, 3 |
| One focused wire check | 3 |
| Node Vitest cases in the backend command and CI job with split, times and proof, no added job | 1, 2 |
| Each of the eleven frontend behaviors has one owner | 4, 5, 6 and the table above |
| Control reads through a typed source | 5 |
| In-page input; native input only where it is the behavior | 4, 5 |
| About 1.1 s summed at two workers | 6 |
| Page-loadable MakeMe entry | 4, 7 |
| READMEs, freeze, reference family | 7 |
| `pageObjects` disabled on `dashboard/frontend-tests` | 7 |
| Spent test-support deleted, nothing added outside MakeMe | 6 |

## Current decisions

- The backend Vitest marker is the executor's choice within the constraint in
  Approach: one shared predicate, transitional, with no rename of existing
  frontend files.
- Plan 719
  ([SEED-412](../../seeds/SEED-412-keep-dashboard-tests-off-the-developers-real-cursor-runner.md))
  also edits `scripts/test-frontend.mjs` and the run setup. Whichever lands
  second rebases onto the other; the backend Vitest run starts under the run
  isolation the group has at that time.
- No CI job is added and no shard count changes; the backend Vitest cases
  ride the existing `dashboard-backend` shards.

## Proof and local gates

Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep default timeouts and omit `test.slow()`. Apply
[dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) to affected
test sources and
[dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md) to
the E2E step.

- **Focused:** `bash scripts/test.sh <paths>` from the repository root, with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
- **Whole runs:** `npm run test:dashboard:frontend` in slice 1 and
  `npm run test:dashboard:backend` in slice 2, because those slices change
  the command every spec of the group runs through. Use Homebrew bash 5 and
  run on awake macOS on AC with `caffeinate -s -i`. On battery, follow the
  [open-lid procedure](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- **Lint and typecheck:** `npm run lint` and `npm run typecheck:dashboard`.

## Plan review

Slice-plan refinement was not needed: seven slices, each with one outcome and
its own proof loop, and every seed promise mapped. Slices 2 and 3 share the
handler and differ in outcome, the backend group running Node Vitest and then
the full rule set with the wire check reduced. Slices 4 and 5 follow the two
components that own the behaviors. Until slice 6, the old terminal case and
its support remain, and slice 6 removes them. This review found no remaining
slice-specific concern.
