# Hold and settle mounted frontend cases by one rule

**Identity:** SEED-404#hold-and-settle-mounted-frontend-cases-by-one-rule
**Source:** [Hold and settle mounted frontend cases by one rule](../../seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#hold-and-settle-mounted-frontend-cases-by-one-rule)
**Source review:** [source-review.md](source-review.md)

## Provenance and findings

The execution retrospective reviewed
the story-notes story (`7df4ade39b5f415c379f12615957ec779f6d93a5:.planning/seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md`, section `run-the-remaining-dashboard-frontend-checks-at-doughnut-speed`),
commits `91e716f20`..`f3e1e44d1`. At `f3e1e44d1` the review found:

1. **Two hold mechanisms; the isolation case proves the unused one.**
   - `answerMountedServices`'s `held` paths are ended by rejecting the request. Only `mounted-dashboard.mounted.spec.ts` uses them, through `mountDefaultDashboard`.
   - The story-notes cases use `holdNextNotes`, which delivers the stale answer at cleanup. That is safe only because cleanup unmounts before ending holds (`mountedDashboard.ts`), and no case pins that order.
   - `holdNextNotes` keeps every hold under one key, so a second hold silently replaces the first, and cleanup never ends the first.
2. **`actSettled` gives up silently** after 20 rounds (`mountedActInput.ts`). The case then reads an unsettled page outside act, which would bring back the act warnings and flaky reads the story removed.
3. **A remount is not a reload.** Every mount clears `localStorage`, resets the board position and sets history to `/`, while the README offers remounting for "a later page". A case that remounts to prove a stored preference would fail misleadingly.
4. **The README overstates two things.**
   - Only the next notes answer can be held.
   - `mountedStoryReviewPage.ts` repeats the "Review changes" name instead of reading `storyReviewNames.ts`.

5. **Intent Coverage at `7740fc354` (2026-11-19): Insufficient evidence** for "one case ends while a notes answer is still held; the next case opens with default answers and no late update".
   - No maintained case ends with a `holdNextNotes` hold still kept.
   - Settling held answers before unmounting (`await actSettled(() => endHeldAnswers())`) delivered a stale notes answer into the ending case's still-mounted board, and no maintained check noticed.
   - Under that fault the isolation pair failed once in 7 runs: the banner flipped from `data-connection="awaiting"` to `"disconnected"` after `advanceTimersByTimeAsync(0)`. Seven unfaulted runs passed, and nothing tied the flip to the held answer.
6. **Preparation at `a2b48ff54` (2026-11-19) found the banner flip's cause and one more unanswered service.**
   - The mounted paths are unchanged since `f3e1e44d1`, so findings 1 to 5 stand.
   - The board's revision stream is a real `EventSource` that no mounted answer covers. It reaches the Vitest server and errors in real time, sometimes after the mount returns. The banner then moves from `awaiting` to `disconnected` outside act, with a "not wrapped in act" line.
   - Neither cleanup-order fault in finding 5 fails an isolation pair that keeps a `holdNextNotes` hold, so cleanup order cannot be the proof.

## Preserved promises and constraints

- Every story-notes and phone-board case keeps its observations and passes: `npm run test:dashboard:frontend -- mounted-dashboard stories/story-notes board-swipe board-indicators`, with no "not wrapped in act" line.
- One case ending while a notes answer is held leaves the next case in the same file with default answers and no late update.
- Product code is unchanged.
- Files stay at or under 250 lines.
- Tests follow [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md) and [`dough-page-objects`](../../../.agents/skills/dough-page-objects/SKILL.md). Keep the default timeout.
- Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Current decisions

- **One hold mechanism.** The isolation pair and the story-notes cases hold the next notes answer the same way. The `held` paths option is removed. A second hold before the first is released fails by name.
- **A kept hold is abandoned, never delivered.** `release` delivers the answer. Cleanup ends a hold still kept by failing its request as an abort, as leaving a page does, so no stale answer reaches any board whatever the cleanup order. The hold reports whether its answer was delivered.
- **The revision stream is answered as unreachable.** The mounted services answer the board's revision stream with a stand-in that errors at once, inside act. Project reads continue through the check schedule that `runFor` drives, and the banner reads `disconnected` from the mount on.
- **Settling fails loudly.** Reaching the settle cap throws an error that names the cap, so a never-settling page fails the case.
- **Remounts carry only what is passed.** The README states that a remount resets page state and carries only the services passed in. The support does not imitate a reload.

## Premises and observations

Observed 2026-11-19 at `a2b48ff54` in this plan's preparation worktree with scratch edits, all reverted. Node 24.21.0 after `npm ci`, two workers, AC power, load 7 to 11. Each command is `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard:frontend -- <selection>`; "mounted families" is `stories/story-notes board-swipe board-indicators`, 17 cases.

| Premise and consuming operation | Observed result |
| --- | --- |
| Slice 1: the default board can keep a `holdNextNotes` hold with its request received. | Hold after mount, then `actSettled(() => vi.advanceTimersByTimeAsync(checkIntervalMs))`: the request arrived and the pair passed in 8 of 8 runs of `mounted-dashboard`. |
| Slice 1: cleanup order discriminates (the earlier plan's proof). | False. With that kept hold, ending holds before the unmount passed 8 of 8, and `await actSettled(() => endHeldAnswers())` before the unmount passed 10 of 10. |
| Slice 1: abandoning a kept hold discriminates, and the mounted families accept it. | With the hold ended at cleanup by an `AbortError` and a `delivered()` reading asserted in an `onTestFinished` registered before the mount: pair passed 6 of 6, mounted families 17 of 17 twice, `tsc --build dashboard/tsconfig.json` clean. With cleanup delivering instead: the first case failed 4 of 4, `expected true to be false`. A second hold threw the named error. |
| Slice 2: the banner flip comes from the unanswered revision stream. | Unmodified support, three default mounts a run asserting `data-connection="disconnected"` after the mount: 2 of 8 runs failed with `expected 'awaiting'`, each with one "not wrapped in act" line. A noted `EventSource` opened `/__authenticated-read` 6 ms before the mount returned. |
| Slice 2: an unreachable stand-in settles it, and the mounted families accept it. | `EventSource` stubbed to call `onerror` in a microtask: the banner read `disconnected` in 6 of 6 runs, and the mounted families passed 17 of 17 twice with no act line. |
| Slice 3: no maintained case reaches the settle cap, and a never-settling page fails by name. | With a throw after the 20 rounds: pair and mounted families passed 3 of 3 runs each, and a case whose action changes a `body` attribute every frame rejected with the error. |
| Slice 3: the "Review changes" card name has two owners. | `test-support/storyCardControls.ts:44` and `mounted-dashboard/mountedStoryReviewPage.ts:18` each repeat the literal; `storyReviewNames.ts` imports neither engine. Read, not run. |

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| A held notes answer cannot leak into the next case | 1 | Isolation pair keeping a received hold; the next case opens with default answers and no late update |
| A stale held notes answer cannot reach a board at cleanup | 1 | The pair's first case reads its hold as not delivered after cleanup; a scratch edit delivering at cleanup fails it |
| A double hold fails by name | 1 | A maintained case holding twice reads the named error |
| The isolation pair is stable and no update escapes act | 2 | Each isolation mount reads `disconnected`; 10 runs pass with no act line, against 2 failures in 8 before |
| An unsettled page fails by name | 3 | A maintained case changing an attribute every frame reads the settle error |
| README matches the support | 3 | README section names hold, settle, stream and remount limits; both engines read the review name from `storyReviewNames.ts` |

## Ordered slices

Each slice has a 15-active-minute budget, excluding commands. Local gate for every slice: the focused command named in its proof, from a fully awake machine; no full run is planned. A full run, if one is added, starts on AC power under `caffeinate -s -i` as [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos) requires; on battery, lid open under `caffeinate -i`, then read the sleep log.

### 1. Hold mounted answers by one mechanism

Type: Structure
Status: done

Removes two hold mechanisms whose isolation case proves the unused one. Make the isolation pair in `dashboard/frontend-tests/mounted-dashboard.mounted.spec.ts` keep the next notes answer through `holdNextNotes`, with its request received. Remove the `held` paths option from `answerMountedServices`, `mountAnsweredDashboard` and `mountDefaultDashboard`. Cleanup abandons a kept hold as an abort, `release` delivers, and the hold reports whether its answer was delivered. A second hold before the first is released fails with an error naming the notes answer.

Proof:
- `npm run test:dashboard:frontend -- mounted-dashboard stories/story-notes board-swipe board-indicators` passes, with no act warnings.
- The pair's first case reads its hold as not delivered from an `onTestFinished` registered before the mount. A scratch edit that delivers the answer at cleanup fails that case.
- A maintained case that holds twice reads the named error.
- `npm run typecheck:dashboard` and ESLint pass.

### 2. Answer the mounted board's revision stream

Type: Structure
Status: planned

Removes a real-time request the mounted support leaves unanswered. Answer the board's revision stream in `mountedServices.ts` with a stand-in that errors at once inside act, restored with the other globals at cleanup. Each isolation case reads the banner's connection as `disconnected` after its mount.

Proof:
- `npm run test:dashboard:frontend -- mounted-dashboard` passes 10 times in a row with no act warnings.
- `npm run test:dashboard:frontend -- stories/story-notes board-swipe board-indicators` passes, with no act warnings.
- `npm run typecheck:dashboard` and ESLint pass.

### 3. Fail unsettled mounted cases and describe the support as it is

Type: Structure
Status: planned

Removes a silent settle cap and a README that overstates the support. Make `actSettled` throw a named error when it reaches its round cap, with a maintained case in the isolation spec whose page changes every frame. Name the card's "Review changes" action once in `storyReviewNames.ts` and read it in `mountedStoryReviewPage.ts` and `storyCardControls.ts`. In the README's mounted support section, say that only the next notes answer can be held and a kept hold is abandoned at cleanup, that the revision stream is unreachable, that an unsettled page fails, and that a remount resets page state and carries only the services passed in.

Proof:
- The maintained never-settling case reads the settle error.
- The mounted specs from slice 1 still pass, with no act warnings.
- `npm run test:dashboard:frontend -- review/` passes, since those specs open the review through `storyCardControls.ts`. The name's text is unchanged, so its other readers in `intent/`, `navigation/` and `e2e/` rest on the typecheck.
- `npm run typecheck:dashboard` and ESLint pass.

## Plan review

Refinement was not needed: the three slices each own one outcome and proof loop, and every premise above was observed in the form its slice uses. This review found no remaining slice-specific concern.

## Learnings

## Story obligations
