# Preparation observations

Part of the [canonical executable plan](PLAN.md); the [selected approach and
verification duties](PREPARATION.md) consume this baseline and its limits.

## Decisive premises and observations

The initial observation baseline was `db9026fa`. Fetched `origin/main` was
`812969d420f03888179f4a699c3a7eafae67025d`; a path-scoped diff found no changes
to the relied-on publication, resume, reporting, binding, review or done-card
production files. Origin already allocates plan 280, so this plan uses 281.

Landing reconciled onto `b1d4dcd38482b0eed180280261fc310cf3a93b81`, where
Commits had landed and its spent plan was removed. Reading the current panel,
selection hook, admission, shared comparison and file-list code confirmed the
same fixed-pair approach. The current ownership and proof expectations above
include Commits; the earlier test observations below retain their original
baseline and do not claim acceptance of that sibling's implementation.

| Premise | Operation consuming it | Observation and result |
| --- | --- | --- |
| The final delivery base excludes intervening trunk and can be used directly | Slices 1–3's captured diff | Isolated observation C called production `publishExecutionIncrement` after `advanceOriginFromAnotherWriter`, asserted `suffixBase` equals that writer's commit, and consumed `git diff --name-only <suffixBase> <receipt.sha>`: only `increment.txt`, excluding `other-writer.txt`. |
| Comparison objects can outlive the retired worktree without altering a surviving checkout | Slice 2's pins; slice 3's repository read | C pinned both commit ends, actually removed the execution worktree and branch, deleted its remote-tracking tip, expired reflogs and ran `git gc --quiet --prune=now`. Reading the pinned pair still yielded only `increment.txt`; HEAD, status, index and diffs of the surviving checkout matched their pre-observation values. Git 2.50.1. |
| Real one-shot starts establish the exact launch context and reporting command in both installed layouts | Slice 2's workflow handoff and capture | B passed all `agent-launch-session-options.spec.ts` cases: refinement/execution, isolated/default checkout, review/auto-land, Claude and Codex input. `expectEstablishedOneShot` consumes installed formatter/start results, checks identity/base/target and untouched origin; `expectReportingBlock` checks the surviving copied CLI. The fixture substitutes native provider transport, not these operations. |
| The real copied CLI, receiver and store can report to an older launch, survive retirement and recover a lost acknowledgment | Slices 2 and 5's reporting protocol | B passed `agent-completion-identity.spec.ts` and `agent-completion-recovery.spec.ts`: the child runs the actual copied installed CLI against the production receiver; recovery exercises actual closure/retirement, receiver loss, a real write fault and lost acknowledgment. These prove the reusable delivery discipline, not the new landing fields or their early-binding preservation. |
| Existing review lists/counts/file diffs, refresh, mark persistence and refusal provide usable outside-in proof | Slices 3–4's common view and admission | B passed `story-review.spec.ts`, landed, refresh, mark and refusal specs. The main journey consumes actual Git snapshot/diff endpoints and asserts only story files; mark proof restarts the server and prunes objects; refusal checks no Git/checkout change. New historical admission and mark exclusion remain slice-owned proof. |
| Recently done retains identity and a full machine-record read independently of nested session filtering | Slice 6's review availability | Reading `RecentlyDone`, `DoneStoryCard`, `recentlyDoneView` and their callers found no existing review action. B passed recently-done story-sessions and progressive-navigation consumers. `view.records` is the full read; nested `sessions` includes only marked-done records, so it cannot alone supply historical review availability. |
| Resume already preserves the delivered base | Slice 1's interrupted handoff | **Disproved by reading through the result:** `execution-increment-resume.mjs` consumes `resumeInterruptedPublication` and exposes SHA/target without `suffixBase`; callers in one-shot, auto-land and managed-resume tests rely on it. Slice 1 adds explicitly retained base continuity; it must not infer the base from the accepted tip's parent. |

Observation commands from the workspace root:

```sh
# A: five source proof files passed through the required runner, Bash 5 first.
env PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=2 npm test -- src/skills/dough-execute-plan/scripts/execution-increment-publication-reconciliation.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume.test.mjs src/skills/dough-execute-plan/scripts/publication-resume.test.mjs src/skills/dough-execute-plan/scripts/one-shot-queued.test.mjs src/skills/dough-story-refinement/scripts/one-shot-refinement.test.mjs

# B: pinned Node 24.21.0; prerequisites passed, then 28 checks passed in 1.1m.
env PATH="/tmp/dough-planning-node.amtxSO/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" node scripts/setup-native.mjs check
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS PATH="/tmp/dough-planning-node.amtxSO/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" npm run test:dashboard -- --workers=1 --max-failures=3 --reporter=line dashboard/tests/story-review.spec.ts dashboard/tests/story-review-landed.spec.ts dashboard/tests/story-review-refresh.spec.ts dashboard/tests/story-review-mark.spec.ts dashboard/tests/story-review-refusal.spec.ts dashboard/tests/agent-completion-identity.spec.ts dashboard/tests/agent-completion-recovery.spec.ts dashboard/tests/agent-launch-session-options.spec.ts dashboard/tests/recently-done-story-sessions.spec.ts dashboard/tests/recently-done-progressive-navigation.spec.ts

# C: one isolated temporary observation through the runner; passed.
env PATH="/tmp/dough-planning-node.amtxSO/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 npm test -- /tmp/dough-one-shot-proof.XXXXXX.mjs
```

C used `publication-test-fixtures.mjs`'s `createCleanTrunkFixture`, production
`publishExecutionIncrement` and these consuming operations, with assertions
on their results; its temporary script is removed after planning:

```js
const c = await advanceOriginFromAnotherWriter(f.origin);
const result = await publishExecutionIncrement({
  workspace: f.execution, branch: "exec/story",
  previouslyPublishedBase: f.trunkSha, targetRef: "refs/heads/main",
  validate: async () => ({ ok: true }),
});
assert.equal(result.suffixBase, c);
const compare = async (cwd) =>
  (await git(cwd, "diff", "--name-only", result.suffixBase, result.receipt.sha)).stdout.trim();
assert.equal(await compare(f.execution), "increment.txt");
const before = await captureCheckout(f.integration);
await git(f.integration, "update-ref", "refs/open-dough/landed/probe/base", result.suffixBase);
await git(f.integration, "update-ref", "refs/open-dough/landed/probe/result", result.receipt.sha);
await git(f.integration, "worktree", "remove", f.execution);
await git(f.integration, "branch", "-D", "exec/story");
await git(f.integration, "update-ref", "-d", "refs/remotes/origin/main");
await git(f.integration, "reflog", "expire", "--expire=now", "--all");
await git(f.integration, "gc", "--quiet", "--prune=now");
assert.equal(await compare(f.integration), "increment.txt");
assert.deepEqual(await captureCheckout(f.integration), before);
```

Baseline limits: the initial dashboard run could not start fixture servers
because this worktree lacked `node_modules/.bin/vite`. After restoring access
to matching locked dependencies, a broader 86-check run on unselected Node
24.5 passed 72 and failed 14 with startup/browser/read timeouts. It is not
whole-suite acceptance. B deliberately changed to the repository's selected
Node, checked Chromium, and observed the exact relied-on journeys. Remaining
unselected broad-run failures are not claimed fixed; relevant consumers must
be green when their contracts change. New landing storage, recovery and UI are
planned outcomes, not premises treated as already implemented. No paid,
credentialed or external-state probe is needed.
