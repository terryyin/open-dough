# Share completed Intent review response watching across E2E specs

**Source:** [Share completed Intent review response watching across E2E specs](../../seeds/SEED-420-unified-intent-review.md#share-completed-intent-review-response-watching)
**Identity:** SEED-420#share-completed-intent-review-response-watching

## Goal and scope

Dashboard test maintainers change how completed story-review responses are
captured and parsed in one place. Add one historical story-review watcher to
[`completedReviewRequests.ts`](../../../dashboard/test-support/support/completedReviewRequests.ts),
beside `waitForLandedReview`, and replace the inline `historical=true` watcher
in the six E2E specs the seed lists. Each spec keeps its own assertions on the
parsed answer.

**Exclusions.** The transition journey's first Taken response watcher and its
explicit-run request listener, the prior-execution journey's direct
`getReview` unavailable read, and the frontend endpoint rule in
`frontendStoryReviewRule.ts` stay as they are. No product code changes.

**Assumptions.** The watcher takes the page and an optional story identity,
matches the story-review endpoint with `historical=true` (and the identity when
given), and resolves to the `storyReviewSchema`-parsed answer, the same shape
`waitForLandedReview` returns.

## Outside-in proof

The six specs are the proof: they observe the same published, unavailable and
completed answers through the shared watcher, with their assertions unchanged.
Run them through the existing E2E entry point with the E2E proof record:

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES \
  OPEN_DOUGH_E2E_PROOF_RECORD="$CLAUDE_JOB_DIR/tmp/e2e-proof.json" \
  npm run --silent test:e2e -- \
  e2e/intent/intent-ci-done-prior-provenance.spec.ts \
  e2e/intent/intent-done-completion-provenance.spec.ts \
  e2e/intent/intent-done-default-answer-selection.spec.ts \
  e2e/intent/intent-done-prior-execution.spec.ts \
  e2e/intent/intent-done-retained-landing.spec.ts \
  e2e/intent/intent-story-becomes-done.spec.ts
```

Accept when the record's `terminal.strictStatus` is `passed` with every
selected case passing on its first attempt, and
`git grep -n 'get("historical") === "true"' -- e2e` lists nothing. Typecheck
and lint run through the project's existing commands for the changed files.
Hosted CI runs these specs in E2E shard 3 (`e2e/intent/**`).

## Slices

### 1. One historical review watcher serves every completed Intent journey
Type: Structure
Status: done
Proof: the six-spec E2E run above passes; no inline `historical=true` watcher remains under `e2e/`.

Structure: add the shared watcher and use it in the six specs, removing each
spec's now-unused `storyReviewEndpoint` or `storyReviewSchema` imports only
where nothing else in that spec uses them. External behavior is unchanged.
This slice owns the test-suite weakness directly: six copies of the same
response capture and parse.

## Execution complete

Product advice: no change. The shared watcher reduces maintenance while keeping
each review assertion and its browser-to-server workflow in place. The current
near-future direction and backlog order still fit.

## Execution evidence

- Story Branch Mode on `origin/codex/share-completed-intent-review-response-watching`,
  integrating into `origin/main`. The accepted Take was
  `7cb2b5b5b27a005ffdc75fc9eb14ddcfc9abfd58`. The accepted slice revision was
  `ff8e9bb6c73106ed0061c6294148b0bd6cbad550`.
- GitHub Actions `ci.yml` monitors the execution branch through Codex coordinator
  `seed420-2f93db6d`, mailbox `/tmp/dough-ci-501/watch-6YE05Q`, stream session
  `41949` and yielded cell `g575:11`.
- The historical and landed watchers now share browser response capture and
  schema parsing. The focused Playwright run after that refactor passed all 11
  cases on their first attempt, including the eight planned Intent cases and
  the landed-review consumers. `refactor-e2e-proof.json` and the command record
  are in the checkout's Git evidence directory. Dashboard typecheck passed and
  the planned search found no inline historical watcher under `e2e/`.
- Outcome review found no correction. Process review is deferred to wrap-up
  for the configured Intent Coverage check of the changed test synchronization.

## Current decisions

- Scope covers all six specs that repeat the watcher, not only the four the
  original candidate named, so the capture lives in one place.
- The default-answer-selection spec passes `queuedIdentity` to keep its
  existing identity match.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Calling the shared async watcher before the triggering action arms it in time and yields the same parsed answers | Each spec's `selectDoneStoryInIntent` or `passTimeUntilChecked` step followed by its answer assertions | Scratch application at `1c30d89b7` of the watcher above in `intent-done-retained-landing.spec.ts` (published and shallow cases) and `intent-story-becomes-done.spec.ts`, run with `OPEN_DOUGH_E2E_PROOF_RECORD` through `npx playwright test --config e2e/playwright.config.ts`, then reverted; 2026-11-26 | All 3 selected cases passed on the first attempt; `strictStatus: passed`. The other four specs use the same pattern after `selectDoneStoryInIntent` or `selectDoneStoryForCiComparison`; their run is the slice's proof |

## Concerns

Refinement not needed: one cohesive slice with a settled premise. This review
identified no remaining slice-specific concern.

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to this plan and every repair handoff.
