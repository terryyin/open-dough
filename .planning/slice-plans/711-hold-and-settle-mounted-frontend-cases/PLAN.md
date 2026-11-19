# Hold and settle mounted frontend cases by one rule

**Identity:** SEED-404#hold-and-settle-mounted-frontend-cases-by-one-rule
**Source:** [Hold and settle mounted frontend cases by one rule](../../seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#hold-and-settle-mounted-frontend-cases-by-one-rule)

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

## Preserved promises and constraints

- Every story-notes case keeps its observations and passes: `npm run test:dashboard:frontend -- stories/story-notes`, with no "not wrapped in act" line.
- One case ending while a notes answer is held leaves the next case in the same file with default answers and no late update.
- Product code is unchanged.
- Files stay at or under 250 lines.
- Tests follow [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md) and [`dough-page-objects`](../../../.agents/skills/dough-page-objects/SKILL.md). Keep the default timeout.
- Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Current decisions

- **One hold mechanism.** The isolation pair and the story-notes cases hold the next notes answer the same way. The `held` paths option is removed. A second hold before the first is answered fails by name.
- **Settling fails loudly.** Reaching the settle cap throws an error that names the action, so a never-settling page fails the case.
- **Remounts carry only what is passed.** The README states that a remount resets page state and carries only the services passed in. The support does not imitate a reload.

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| A held notes answer cannot leak into the next case | 1 | Isolation pair on the shared hold; a scratch edit ending holds before unmounting fails it |
| A stale held notes answer cannot reach a mounted board unnoticed, and the isolation pair is stable | 1 | Kept-hold isolation pair; scratch settle-before-unmount fails it; banner flip explained |
| A double hold fails by name | 1 | A focused case holding twice fails with the named error |
| An unsettled page fails by name | 2 | A scratch case changing an attribute every frame fails with the settle error |
| README matches the support | 2 | README section names hold, settle and remount limits; review names read from `storyReviewNames.ts` |

## Ordered slices

Each slice has a 15-active-minute budget, excluding commands.

### 1. Hold mounted answers by one mechanism

Type: Structure
Status: planned

Make the isolation pair in `dashboard/frontend-tests/mounted-dashboard.mounted.spec.ts` hold the next notes answer through the same hold the story-notes cases use. Remove the `held` paths option from `answerMountedServices`, `mountAnsweredDashboard` and `mountDefaultDashboard`. A second hold before the first is answered fails with an error naming the notes answer.

Proof:
- `npm run test:dashboard:frontend -- mounted-dashboard stories/story-notes board-swipe board-indicators` passes, with no act warnings.
- A scratch edit that ends holds before unmounting fails the isolation pair.
- A focused case that holds twice fails with the named error.
- The isolation pair ends its first case with a story-notes hold still kept. Settling held answers before unmounting, in a scratch edit, fails that pair.
- Find the cause of the connection-banner flip. Repeat the isolation pair until the flip reproduces or is ruled out, and fix any instability under the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- `npm run typecheck:dashboard` and ESLint pass.

### 2. Fail unsettled mounted cases and describe the support as it is

Type: Structure
Status: planned

Make `actSettled` throw a named error when it reaches its round cap. Read the "Review changes" name in `mountedStoryReviewPage.ts` from `storyReviewNames.ts`. In the README's mounted support section, say that a remount resets page state and carries only the services passed in, and that only the next notes answer can be held.

Proof:
- A scratch mounted case that changes an attribute every frame fails with the settle error.
- The mounted specs from slice 1 still pass, with no act warnings.
- `npm run typecheck:dashboard` and ESLint pass.

## Learnings

## Story obligations
