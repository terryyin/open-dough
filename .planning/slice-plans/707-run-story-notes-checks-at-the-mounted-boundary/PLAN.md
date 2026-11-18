# Run the story-notes frontend checks at the mounted boundary

**Identity:** SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed
**Source:** [Run the story-notes frontend checks at the mounted boundary](../../seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed)
**Source review:** [source-review.md](source-review.md)

## Goal and current decisions

A developer running the four story-notes specs gets their answer in at most a third of today's time at two workers, with every original product assertion accounted for. The seed gains the measured cost of real specs at the mounted boundary. Later families gain the mounted fixture these specs need.

The cases move from the built-app fixture to mounted Vitest specs that render the production app, answer its services in the page and deliver input directly. Excluded: the other `stories/` specs and families, the whole-group minute, making the test data importable in the browser, merging spec files, shared file isolation and CI shard rebalancing.

- **Arranged data is built in Node.** A mounted case asks a Vitest browser command for its arrangement. The command builds it with `defaultFrontendServiceState` and MakeMe and returns plain data, as `phoneBoardPublication` does today. A spec names its arrangement and writes no note or project literal that MakeMe owns.
- **One answering rule per service.** The notes rule (project-scoped reads, accepted changes, unreadable, refused, unreachable, held) lives in one module without Playwright or Node imports. The Playwright route substitute in `frontendStoryNotes.ts` and the mounted fetch answers both call it. `answerAuthenticatedRead` already has this form.
- **One page-object vocabulary.** The mounted notes page offers the phases and cues of `storyNotesPage.ts` under the same names, and both read control names, roles and announcement text from one module. `storyNotesPage.ts` stays the Playwright form because backend and end-to-end journeys use it.
- **The phone-board support becomes the general mounted support.** Its mount, cleanup, fetch answers and Node command generalize in place. The phone-board specs keep their own gesture page object.
- **The mounted fixture controls time.** It uses the fake timers the phone-board mount installs. A case advances them where the built-app case ran `page.clock.runFor`.
- **Where a case stays.** A case keeps a real page only when its proof needs the browser's reload or a live socket. Slice 6 judges the two candidates and records reason, destination and cost.

No Accepted decision conflicts. [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md) requires the comparison basis before the observed run; slice 1 records it. [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md) names apply to the support modules.

## Observations used for sizing

Observed in this preparation checkout at `ade2447a1` plus the preparation draft on 2026-11-18, Node 24.21.0, two workers, on a 16-core machine at load 7 to 21.

| Premise and consuming operation | Observation and result |
| --- | --- |
| Mounted specs select by folder and `--grep` (slices 3–7) | A scratch `stories/zz-probe.mounted.spec.ts` ran under `npm run test:dashboard:frontend -- stories/ --grep 'probe voice'`; the command selected and started exactly that case. Settled. |
| MakeMe and the service state cannot be imported by a mounted spec (decision above, slices 1–5) | The same scratch spec importing `Distribution/tests/support/makeMe.mjs` failed with `Module "node:fs" has been externalized`; importing `frontendServiceState.ts` failed resolving `kerberos` inside `@playwright/test`. A static walk found 8 of 110 and 117 of 403 modules importing Node modules. Settled: data crosses through a Node command. |
| A Node command already hands built state to a mounted case (slice 1) | `npm run test:dashboard:frontend -- board-swipe board-indicators` passed 7 cases in 5.5 s; they mount through `commands.phoneBoardPublication`, which calls `defaultFrontendServiceState`. Settled. |
| Role locators and direct clicks reach Story notes on the mounted app (slices 3–6) | A scratch mounted spec used `mountPhoneBoard`, clicked the first `Notes` button and `Add note` through `element.click()` inside `act`, and observed the `Story notes` dialog and `Note text` textbox with `expect.element`, all in 82 ms. Settled for opening and composing. Typing, keyboard activation and focus return were not exercised; slice 4 reaches them first. |
| `answerAuthenticatedRead` runs in the page (slices 1–3) | Its module graph has 5 modules and no Node or Playwright import, and the phone-board services call it in the page in the passing run above. Settled. |
| Baseline (slices 1 and 7) | `npm run test:dashboard:frontend -- stories/story-notes` took 22.1 s as a whole command at load 21. Twenty scratch copies of a two-case mounted file plus the two phone-board files ran 47 cases in 11.1 s. Slice 1 takes the matched baseline. |
| Files this work edits stay within the 250-line check | `phoneBoard.ts` 134, `phoneBoardServices.ts` 73, `mountedPhoneBoardCommands.ts` 51, `frontendStoryNotes.ts` 117, `storyNotesPage.ts` 235, `story-notes.spec.ts` 250. None is over; `storyNotesPage.ts` and the 250-line spec leave no room, so shared names move out of the first and the second splits as its cases move. |

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Comparison basis set before the change | 1 | Recorded matched baseline in this plan |
| Fresh mount and default answers for every case | 1 | Held-answer isolation case |
| Unreadable notes on every card kind | 3 | Mounted `story-notes-unreadable` case and its discrimination |
| Keyboard edit, cancel, delete, refused edit and deletion | 4 | Mounted `story-notes-edit` cases with recorded change requests |
| General notes, failed saves keep the draft, waiting and sent states, newer read against older read | 5 | Mounted `story-notes` cases |
| Retained note and attached terminal accounted for | 6 | Moved case or recorded stay with reason, destination and cost |
| One notes answering rule and one vocabulary | 2, 3 | Built-app notes consumers pass on the shared rule; mounted and Playwright page objects read one names module |
| File and `--grep` selection | 3 | `-- stories/ --grep 'unreadable'` lists the moved case |
| A third of the matched baseline, whole group no slower, per-file cost recorded | 7 | Matched before and after commands; seed evidence updated |

## Ordered slices

Each slice has a 15-active-minute budget, excluding commands. A moved spec's built-app original is removed in the same slice, so no case runs twice.

### 1. Mount the dashboard for any frontend case

Type: Structure
Status: done

Record the matched baseline first: run `npm run test:dashboard:frontend -- stories/story-notes` and the whole-group command twice each at two workers in one session, and note load, elapsed time and summed case time under Learnings. Then generalize the phone-board mount into the mounted dashboard support: a fresh root and document state per case, default service answers from a Node command that returns `defaultFrontendServiceState` data, an unanswered `/__` request failing the case by name, and cleanup that restores globals and ends any answer still held. The phone-board mount becomes a caller that adds its viewport, resize and gesture parts. External behavior is unchanged. This enables slice 3.

Proof: `npm run test:dashboard:frontend -- board-swipe board-indicators` passes its 7 cases. A mounted support case holds an answer, ends, and the next case in the same file opens the board with default answers and receives no late update; it fails when cleanup leaves the held answer in place. `npm run lint` and `npm run typecheck:dashboard` pass.

### 2. Answer the notes service by one rule

Type: Structure
Status: planned

Extract the notes answering rule from `frontendStoryNotes.ts` into a module without Playwright or Node imports: project-scoped reads, accepted changes with their recorded requests, unreadable, refused, unreachable and held answers. The route substitute keeps its interface and calls the rule. A new note's identity and time come from the caller, so the rule needs no MakeMe import. External behavior is unchanged. This enables slice 3.

Proof: the built-app notes consumers pass unchanged: `npm run test:dashboard:frontend -- stories/story-notes stories/story-note-voice review/`, and the backend and `e2e/` specs the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace) lists for `installFrontendStoryNotes`. A scratch mounted spec imports the rule module in the browser.

### 3. Read unreadable notes on the mounted board

Type: Behavior
Status: planned

Behavior: notes are unreadable for a project → the board opens and a later project read arrives → every card kind says notes are unreadable in place of a count, and Story notes says so.

Add the Node command arrangement for notes, the mounted notes answers on the shared rule, and the mounted notes page with the shared names module. Move `story-notes-unreadable.spec.ts` to a mounted spec with the same observations, advancing the fixture's timers for the project read.

Proof: `npm run test:dashboard:frontend -- stories/ --grep 'unreadable'` selects and passes the mounted case. With the project arranged readable in a scratch edit the case fails. The Playwright journeys the consumer trace lists for `storyNotesPage` pass on the shared names module.

### 4. Edit and delete a note on the mounted board

Type: Behavior
Status: planned

Behavior: a story holds a saved line note → the developer edits it by keyboard, cancels, saves, deletes, and meets a refused edit and a refused deletion → the saved text, context, count, announcements and focus match the built-app cases, and the recorded change requests are the same.

Move the three `story-notes-edit.spec.ts` cases. Add typing, keyboard activation and focus cues to the mounted notes page under the Playwright page object's names.

Proof: `npm run test:dashboard:frontend -- stories/story-notes-edit` passes three mounted cases. Each asserts the recorded change request. A scratch edit that accepts the refused change fails the refusal case.

### 5. Add, fail and refresh notes on the mounted board

Type: Behavior
Status: planned

Behavior: cards of every kind offer general notes → the developer saves, meets a refused and an unreachable save, and a newer and an older project read arrive → blank stays unsaved, newest shows first, a failed save keeps its draft and saves on retry, waiting and sent notes show their state, the card counts only waiting notes, and an older read cannot replace a save.

Move the general, failure, state and project-read cases of `story-notes.spec.ts`, using held answers and the fixture's timers. Split the spec file by these groups as they move.

Proof: `npm run test:dashboard:frontend -- stories/story-notes` passes the moved cases mounted and the remaining built-app case. Releasing the older read before the save in a scratch edit fails the older-read case.

### 6. Account for the retained note and the attached terminal

Type: Behavior
Status: planned

Behavior: a Taken note exists and a new launch and Done follow; separately, Story notes opens beside an attached terminal → the note appears on Done without workspace or launch records, and the terminal stays mounted and connected.

`story-notes-retained.spec.ts` reloads the page twice. Move it when a fresh mount on the same arranged services observes the same app-owned state. The attached-terminal case needs the terminal WebSocket. Move it when the mounted answers can hold that socket open with the existing terminal substitute's rule. Otherwise keep the case on the built-app fixture. Record each decision in this plan with its reason, destination and measured cost.

Proof: each case passes where it lives. A moved retained case fails when the note is dropped at the new launch in a scratch arrangement. A kept case is named in the record with its seconds from the run.

### 7. Compare the story-notes specs against their baseline

Type: Behavior
Status: planned

Behavior: the four specs run at the mounted boundary → a developer runs the same two commands as slice 1 in a matched session → the story-notes command takes at most a third of its baseline, the whole-group command is no slower, and the result is recorded.

Run each command twice, alternating with the baseline revision in a scratch worktree so both sides see the same load. Record elapsed time, summed case time, per-file import cost and load. Update the seed's refinement evidence with the per-file figure from these real specs, and describe the mounted support and when a case stays on a real page in `dashboard/frontend-tests/README.md`.

Proof: the recorded pairs show the ratio. A ratio above a third, or a slower whole group, leaves the story unfinished: record the measured costs and stop for Terry under learning escalation. `npm run test:dashboard:frontend -- stories/` passes with every original case accounted for in the record.

## Verification and plan review

Run changed cases and their reached consumers through `npm run test:dashboard:frontend -- <paths>`, with `npm run lint` and `npm run typecheck:dashboard`. Slices 1 and 7 run the whole frontend group because the shared mount and the comparison need it. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md) for every failing or flaky case. Tests follow [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md) and [`dough-page-objects`](../../../.agents/skills/dough-page-objects/SKILL.md). Keep the default test timeout.

Local gate on awake macOS uses `caffeinate -s -i` on AC power for the whole-group runs. On battery use the maintained open-lid `caffeinate -i` procedure and sleep-log check. [Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)

Slice-plan refinement ran in planning: the first mounted notes case was split so the shared notes rule lands as its own Structure slice before the mounted page object and arrangement command. The slices share one mounted fixture, one notes rule and one page-object vocabulary, and each moves an independently observable group of cases. Typing, keyboard activation and focus return on the mounted app are first reached in slice 4; a failure there returns under learning escalation. Review found no remaining slice-specific concern.

## Learnings

**Slice 1 baseline** (at `e8e01643a`, 2026-11-18/19, Node 24.21.0, two workers, AC power under `caffeinate -s -i`, 16-core machine, proof records `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` in the checkout's `open-dough/evidence`):

| Command | Run | Load before | Elapsed | Summed case time |
| --- | --- | --- | ---: | ---: |
| `npm run test:dashboard:frontend -- stories/story-notes` (11 cases) | 1 | 19.6 | 39.7 s | 36.3 s |
| same | 2 | 14.0 | 16.3 s | 23.4 s |
| `npm run test:dashboard:frontend` (715 cases) | 1 | 29.8 | 534 s after suite admission (3,142 s including 43 min queued) | 1,003 s |

The whole-group command takes the repository's one-full-local-suite admission (`refs/dough/local-test-suite`); run 1 waited 43 minutes behind another worktree's backend suite and run 2 is still queued behind it. Measure the whole group from admission (the proof record's Playwright output directory time to `finishedAt`), not from command launch. The story-notes command varied 2.4× between runs at similar load, so slice 7's alternating matched pairs, not these single figures, decide the ratio.

**Slice 1:** the board already sent `/__project-configuration/ci-follow-up` unanswered on the mounted board; the old stub threw and the app swallowed it. The mounted support now fails any unanswered `/__` request by name, so later mounted families must answer every service their board reads.

## Story obligations
