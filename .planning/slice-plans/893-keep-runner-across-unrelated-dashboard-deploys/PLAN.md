# Keep the Cursor runner across unrelated dashboard deploys

**Identity:** SEED-450#keep-runner-across-unrelated-dashboard-deploys
**Source:** [Story](../../seeds/SEED-450-keep-cursor-sessions-through-runner-restart.md#keep-runner-across-unrelated-dashboard-deploys)

## Goal and scope

A production dashboard redeploy that does not change code the accepting
Cursor runner executes leaves that runner and its held sessions running.
Revival continue is not required for that redeploy. A redeploy that changes
executed runner code still replaces the runner before the next new Cursor
work, and last-held revival then runs as it does today.

Source-mode identity counts the runner entry and every module reached
through a value import, including a dynamic `import()`. A module reached
only through a type-only import does not count. A module reached by any
value path still counts when another import of it is type-only. Bundled
mode stays a digest of the bundled file alone. Dashboard process start
stays start-if-absent and does not stop the runner.

Excluded: a digest limited to `dashboard/server/hosts/cursor/`; stopping
replacement when executed runner code changes; Claude or Codex runners; the
wrapped-continue submit; helper repair; leaving a runner that does not
answer the protocol.

## Current decisions

- The build identity stays `computeRunnerBuildId` in
  `dashboard/server/hosts/cursor/runnerBuild.ts`. That function already owns
  which files prove the runner current. Change its source walk so a
  type-only statement is not followed. Do not add a second digest or a
  directory allowlist.
- Follow
  [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e):
  proof stays a Node Vitest case in `dashboard/backend-tests/`.
- Follow
  [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support):
  the cases call `computeRunnerBuildId` on temporary source files. Add no
  test-support wrapper.
- `computeRunnerBuildId` is the domain contract for this rule, the same
  entry the existing identity cases use. Matching and differing identities
  already decide reuse and replacement in that spec; this slice changes
  which files move the identity.
- Apply the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written; carry this link into every delegation and repair handoff.

## Decisive premises

Observed 2026-11-28 in this workspace at `c9ea88153226154c51cb6ca016426906fa16b604`
(Node v24.21.0). Scratch file appends were restored; the worktree was clean
afterward.

| Premise / consuming operation | Observation and result |
| --- | --- |
| P1. The real source entry's identity currently includes a module reached only by `import type`, so the type-only example fails today (slice 1's new case) | Appending a comment to `dashboard/server/agentLaunches.ts` changed `computeRunnerBuildId` of `dashboard/server/hosts/cursor/runnerMain.ts`. `recover.ts` reaches that module with `import type`. |
| P2. A value import and a dynamic import currently move the same identity, and must keep doing so (slice 1) | Appending a comment to `dashboard/server/terminalAttachments.ts` changed that id. Appending a comment to `Distribution/src/skills/dough-execute-plan/scripts/ci-mailbox-cli.mjs` changed it too. |
| P3. The existing spec proves a matching identity is reused and a differing one replaces, through `computeRunnerBuildId` (slice 1 reuses those cases) | `caffeinate -s -i npx vitest run --config dashboard/backend.vitest.config.mts dashboard/backend-tests/sessions/cursor-runner-build-proof.spec.ts` passed 5 tests in 5.20 s. The value-sibling case moves the id; the bundled-file case moves with the bundle; the real entry hashes the same on a second read; wrong or missing proof, and a tampered recorded proof, replace before the next exec. |

## Ordered slices

### 1. Leave a type-only module out of the Cursor runner build identity
Type: Behavior
Status: done
Proof: extend
`dashboard/backend-tests/sessions/cursor-runner-build-proof.spec.ts` with
one case per form below. Each case builds a temporary entry and sibling,
calls `computeRunnerBuildId(entry)`, changes the sibling, and calls it
again. The type-only and `export type` cases fail on the current walk and
pass after it. The value, mixed, dynamic, and bundled cases pass before and
after. Then run
`caffeinate -s -i npx vitest run --config dashboard/backend.vitest.config.mts dashboard/backend-tests/sessions/cursor-runner-build-proof.spec.ts`
and `npm run lint`. Before the test edit, apply
[`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md) and
`test-entry-rules.mjs` for that spec. The cases are temporary source files
for this identity rule; use a MakeMe builder only when that skill selects
one. The layer is the existing identity function
([test boundary](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary)):
its input is the entry path, and the temporary files are the source it
hashes. No substitute. `runnerBuild.ts` is 107 lines; keep it within the
250-line file limit.

Behavior: source mode, accepting runner → a redeploy changes a module the
entry reaches only by a type-only import → `computeRunnerBuildId` is
unchanged, so the next new Cursor work reuses that runner (story examples 1
and 5). A value import, a mixed `import { type Label, read }`, or a dynamic
`import()` → the identity changes, so the next new Cursor work replaces the
runner (examples 2, 3, and 5). A bundled entry → only that file's content
moves the identity (example 4).

Accepted proof, uncommitted at `dda5d34b3e54efaaf5f08e10b24aa03b9bba6b3e`:
`caffeinate -s -i npx vitest run --config dashboard/backend.vitest.config.mts dashboard/backend-tests/sessions/cursor-runner-build-proof.spec.ts`
failed 3 and passed 8 before the walk change (`slice-1-red-spec.log.run.json`,
exit 1) and passed 11 after it (`slice-1-green-spec.log.run.json`, exit 0).
The three failures were `expect(after).toBe(before)` for `import type`,
`import { type Label }`, and `export type { Label }`. `npm run lint` then
passed (`slice-1-lint-2.log.run.json`, exit 0). Reached consumers in
`cursor-runner-current-proof.spec.ts`,
`cursor-runner-helper-repair-shapes.spec.ts`,
`cursor-runner-restart-shapes.spec.ts`, and
`cursor-runner-rejoin.spec.ts` passed 14
(`slice-1-consumer-specs.log.run.json`, exit 0), including
`runnerCurrent.ts` calling `currentRunnerBuildId()`.

## Proof map

| Promise | Owner | Proof |
| --- | --- | --- |
| A type-only-only module change leaves the identity unchanged (example 1, example 5's `import type`) | Slice 1 | New temporary-entry case, red before the walk change |
| An `export type` re-export does not count (same rule) | Slice 1 | New temporary-entry case, red before the walk change |
| A value import, a mixed type-and-value import, and a dynamic import still move the identity (examples 2, 3, and 5) | Slice 1 | Existing value-sibling case, plus new mixed and dynamic cases |
| Bundled identity stays the bundled file (example 4) | Slice 1 | Existing bundled case in the same spec |
| An unchanged identity is reused and a changed one replaces the runner | Slice 1 | Reused: the spec's stand-in and tampered-proof cases (P3). The decision still compares `computeRunnerBuildId` with the runner's published id |
| The real source entry still hashes | Slice 1 | Existing second-read assertion on `runnerMain.ts` |

## Verification and delivery gates

- Before test edits, apply installed `dough-makeme` and `test-entry-rules.mjs`
  on the spec path.
- Local gate, from a fully awake machine on AC power: the focused Vitest
  command above under `caffeinate -s -i`, then `npm run lint`.
- Keep the default test timeout. Never `test.slow()`.

## Plan concern assessment

Refinement not needed: one behavior slice, one identity rule, and one proof
file. The import forms are examples of that rule. No slice-specific concern.

## Learnings

- Slice 1 paused at 17.7 active minutes (limit 15, one story overrun). The assumption that the red and green identity runs, the walk change, lint, and the reached consumer specs fit in 15 active minutes was false. The behavior and its proof were already complete, so no unfinished product change was reverted. This is the only slice, so that assumption changes no later slice.
- Refactor pass skipped. `runnerBuild.ts` is 169 lines and the subject spec is 218. A search of `dashboard/server` found no other production classifier of import statements, and no test outside the subject spec was edited.

## Story obligations

### G1. Export specifier list has no case of its own
Reported: slice 1 — "There is no separate temporary-entry case for `export { type Label }`."
Story clause: "A module reached only through a type-only import (`import type`, `export type`, or a specifier list that is entirely `type`) does not count."
Disposition: proved by slice 1: `typeOnlyStatement` in `dashboard/server/hosts/cursor/runnerBuild.ts` matches an `import` or `export` specifier list in one check, and the green spec's `an entirely type specifier list leaves the build identity unchanged` observed `expect(after).toBe(before)` for `import { type Label } from "./sibling"` (`slice-1-green-spec.log.run.json`, exit 0).

## Execution resume

- Mode: story-branch
- Checkout: `/Users/terryyin/git/open-dough/.worktrees/keep-the-cursor-runner-across-unrelated-dashboar`
- Branch: `cursor/keep-the-cursor-runner-across-unrelated-dashboar`
- Remote: `origin`; trunk: `main`
- Published revision: `dda5d34b3e54efaaf5f08e10b24aa03b9bba6b3e` on `origin/cursor/keep-the-cursor-runner-across-unrelated-dashboar` (Take; base for the first increment)
- Starting revision: `fd08e4d8ad92d88848675bbc4b6fc4e9bb8bdf3d`
- CI: GitHub Actions, workflow `ci.yml` (display name `CI`), observed branch `cursor/keep-the-cursor-runner-across-unrelated-dashboar`, observer `/tmp/dough-ci-501/watch-fxDzFY`
- Slice 1 clock: paused, elapsed 17.7 minutes, overrun true, storyOverruns 1
- Trunk Take coverage: `pendingCi: unobserved` (the claim published before this story-branch observer was armed)
