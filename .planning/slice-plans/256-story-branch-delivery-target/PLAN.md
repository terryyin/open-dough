# Story Branch increments publish only to their execution branch

**Identity:** SEED-008#story-branch-delivery-target
**Source:** [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#story-branch-delivery-target).
**Prepared:** 2026-10-06. Planning only, in the established preparation workspace.

## Goal and boundaries

A Story Branch increment delivered through `execution-increment-delivery.mjs
deliver` reaches only its remote execution branch, and the coordinator takes
the `--target-ref` value from the established start and the delivery guidance,
never from the script. Scope, constraints, and key examples are those of the
source story. Material exclusions and assumptions:

- `execution-increment-resume.mjs resume` keeps its contract. It replays a
  publication `deliver` already accepted or refused and takes no branch; a
  refused `deliver` leaves nothing to resume.
- Story Branch wrap-up integration does not run `deliver`
  (`dough-story-wrap-up/SKILL.md:213-233` merges and pushes the saved tip
  through [Preserve published history](../../../src/skills/dough-execute-plan/references/publish-the-candidate.md#preserve-published-history)),
  so it needs no declaration and is not changed.
- `trunk-closure.mjs finish` is Trunk Mode only; its CLI is unchanged. The
  settlement it runs names its mode internally (slice 1).
- The ODF-200 record update in the story's Done-when is a closure change:
  wrap-up rewrites the DearDough and catalog follow-up lines once the
  before-cleanup SHA exists, as `3c9efc16` did for SEED-094. No slice owns it.
- No Trunk Mode inverse guard, no established-start field for the delivery
  target, no reversal of `1be19216` on `main` (story exclusions).

## Direction and PFE

Established structure supports the work; no North Star topic governs it and
none is added. ADR 0009's Story Branch row is the constraint the refusal
enforces. Reuse:

- `deliver`'s existing refusal shape for a missing field
  (`execution-increment-delivery.mjs:52-68`: `ok: false`,
  `publication: "refused"`, `error`, exit code 1) for the new refusal, placed
  before `resolveCheckoutRuntime` and `establishObservation` so nothing is
  fetched, rebased, pushed, or observed.
- `execution-start.mjs start --mode trunk|story-branch` as the vocabulary of
  the new `deliver --mode`, and the established start's `tracking: one-shot`
  (`established-start.mjs`) as the vocabulary of the one-shot declaration.
- `targetBranchName` (`publication-git.mjs:24`) stays the owner of the
  `refs/heads/` form check; the new guard compares `--target-ref` with
  `refs/heads/<--branch>` as strings and runs first, so a Story Branch
  `origin/<branch>` or bare name is refused with the required value named.
- Test support: `createManagedFixture`, `deliverThroughCli`, `lsRemoteSha`,
  `watchCount` (`execution-increment-managed-delivery*-test-fixtures.mjs`),
  `markdownSection` (`tests/support/markdown-section.mjs`).

## Current decisions

- `--mode trunk|story-branch` is required on the `deliver` CLI: a missing
  mode is a usage error (exit 2), so the guard cannot be skipped by omission.
  On the function, `mode` stays optional so `trunk-closure-settlement.mjs`
  and test callers that spread `requestBase` keep working; the settlement
  passes `mode: "trunk"` explicitly.
- The guard: `mode === "story-branch"` and `tracking !== "one-shot"` and
  `targetRef !== "refs/heads/" + branch` → refused before any Git or observer
  operation, with an error naming `refs/heads/<branch>` as the required
  target and `--tracking one-shot` as the way a one-shot landing declares
  itself. `mode: "trunk"` keeps today's behavior.
- A one-shot landing declares `--tracking one-shot` (copied from its
  established start's first line) beside `--mode story-branch`; its target
  stays remote trunk as `one-shot.md` already says. The exemption cannot key
  on `--one-shot-identity`: an unqueued one-shot has none (premise below).
- The existing Story Branch delivery test, which delivers `exec/story` to
  `refs/heads/cursor/story-execution`, models the very mistake this story
  forbids; it is realigned to deliver to `refs/heads/exec/story` with
  `mode: "story-branch"`.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| `deliver` accepts a Story Branch increment aimed at trunk today; only the `refs/heads/` form is checked | Slice 1 | Read `execution-increment-delivery.mjs:16-70,185-215` and `publication-git.mjs:24-29`; read `execution-increment-managed-delivery.test.mjs:76-100` | No mode or branch/target cross-check exists. The Story Branch test delivers branch `exec/story` to a different target and asserts acceptance. Plan 250's occurrence in ODF-200 is the live symptom. |
| Managed delivery's production callers are the coordinator CLI and Trunk Mode closure only | Slice 1 | `grep -rln deliverManagedExecutionIncrement\|execution-increment-delivery src dashboard` excluding tests; read `dough-story-wrap-up/SKILL.md:195-233` and `wrap-up-closure-publication.md:26-50,98-130` | Callers: `trunk-closure-settlement.mjs:165` (function) and the CLI. Story Branch integration is a hand merge and push, never `deliver`. |
| An unqueued one-shot landing passes no `--one-shot-identity` | Slice 1 | Read `one-shot.test.mjs:99-114` and `one-shot.md:110-124,171-175` | The landing delivers `targetRef: refs/heads/main` with no identity; only queued one-shots add `--one-shot-identity`. |
| Direct function callers can keep omitting `mode` | Slice 1 | `grep -rc 'deliverManagedExecutionIncrement({' src` | 35 test call sites, nearly all spreading `fixture.requestBase`; one production caller (`trunk-closure-settlement.mjs`). |
| The Story Branch Mode and `refs/heads/` wording in `trunk-publication.md` is pinned to one occurrence | Slice 2 | Read `execution-increment-delivery.test.mjs:41-43`; `grep -rn target-ref src --include=*.md` | `does not push the execution branch`, `recorded remote execution branch`, `does not push it to remote trunk` must each appear exactly once. No delivery step names `--target-ref` literally today; only `wrap-up-closure-publication.md:39` and `dough-land/SKILL.md:192` do, for other commands. |
| `one-shot-guidance.test.mjs` reads "## Land the retained result" and forbids `deliver` only in the retain section | Slice 2 | Read `one-shot-guidance.test.mjs:34,70-81,102` | Adding the flags to the landing section is compatible with its assertions. |
| Focused tests run per file | Slices 1–2 | `env -u NODE_ENV node --test src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs` | 1 test, pass, 36 ms. `bash scripts/test.sh <path>` needs Bash 5 on PATH (`/opt/homebrew/bin`) and is silent on success. |

## Outside-in proof

| Promise | Slice | Proof |
| --- | --- | --- |
| A Story Branch increment aimed at trunk is refused before any push (example 1) | 1 | New CLI test: `deliverThroughCli` with `--mode story-branch`, branch `exec/story`, `--target-ref refs/heads/main` → exit 1, `publication: "refused"`, error names `refs/heads/exec/story`; `lsRemoteSha(origin, refs/heads/main)` still the trunk SHA, `refs/heads/exec/story` absent, `watchCount(storage)` 0, no `observation.directory`. Fails before the change (accepted today). |
| The execution branch is accepted in Story Branch Mode (example 2) | 1 | Realigned existing test: `mode: "story-branch"`, target `refs/heads/exec/story` → attached observer, receipt target `refs/heads/exec/story`, trunk unchanged. |
| Trunk Mode is unchanged (example 3) | 1 | Existing Trunk Mode tests with `mode: "trunk"` in `requestBase` and `--mode trunk` in `deliverThroughCli`; `trunk-closure` tests unchanged. |
| A one-shot landing still reaches trunk (example 5) | 1 | `one-shot.test.mjs` landing passes `mode: "story-branch", tracking: "one-shot"` and is accepted on `refs/heads/main`; a CLI run with `--mode story-branch` and no `--tracking` is refused with an error naming `--tracking one-shot`. |
| Mode cannot be omitted; `refs/heads/` form still required | 1 | CLI without `--mode` → exit 2, usage names `--mode trunk\|story-branch`, `--target-ref refs/heads/<branch>`, `[--tracking one-shot]`. `--mode trunk --target-ref main` → exit 2, `authorized target must be a branch ref` (regression for today's untested refusal). |
| No script lookup (example 4) | 2 | Guidance-structure tests: `trunk-publication.md` "Publish the candidate" holds a literal `deliver` command naming `--mode <mode>` and `--target-ref refs/heads/<execution branch>` (Story Branch) / `refs/heads/<trunk>` (Trunk); `one-shot.md` "Land the retained result" names `--mode story-branch --tracking one-shot` with the trunk target. Existing phrase-count pins stay green. |
| ODF-200 records name the response | wrap-up | Closure commit rewrites `DearDough.md` ODF-200 and `docs/maintainer/finding-names.md#odf-200` follow-up lines, as `3c9efc16` did. Not a slice. |

## Slices

### 1. `deliver` refuses a Story Branch increment aimed anywhere but its execution branch
Type: Behavior
Status: planned
Proof: `env -u NODE_ENV node --test src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-gaps.test.mjs src/skills/dough-execute-plan/scripts/one-shot.test.mjs src/skills/dough-story-wrap-up/scripts/*.test.mjs` plus the new CLI refusal test file beside the gaps tests. The refusal test fails before the change.

Behavior: an established start names `mode: story-branch`, `branch:
claude/x`, `target: main`; the coordinator runs `deliver --mode story-branch
--branch claude/x --target-ref refs/heads/main …` → the call returns
`ok: false`, `publication: "refused"`, an error naming
`refs/heads/claude/x`; nothing was fetched, rebased, pushed, or observed. With
`--target-ref refs/heads/claude/x` the increment is accepted as today. With
`--mode trunk`, or with `--tracking one-shot`, a trunk target is accepted as
today.

Add `mode` and `tracking` to `deliverManagedExecutionIncrement`'s request and
the guard above, before runtime resolution. Make `--mode` required in
`argumentsOf` and replace `REF` in the usage with
`--target-ref refs/heads/<branch>`, adding `--mode trunk|story-branch` and
`[--tracking one-shot]`. Pass `mode: "trunk"` from
`trunk-closure-settlement.mjs`. Put `mode: "trunk"` in the managed fixture's
`requestBase` and `--mode trunk` as `deliverThroughCli`'s default, overridable
through `extra`. Realign the Story Branch test to its execution branch and
give the one-shot landing test its declaration.

### 2. The delivery guidance names the target for each mode
Type: Behavior
Status: planned
Proof: `env -u NODE_ENV node --test src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs`, extended as in the proof table; the new assertions fail before the edit.

Behavior: a coordinator at its first delivery reads only
[Publish the candidate](../../../src/skills/dough-execute-plan/references/trunk-publication.md#publish-the-candidate)
→ it finds a `deliver` command block that names `--mode <mode from the
established start>` and `--target-ref refs/heads/<execution branch>` in Story
Branch Mode or `refs/heads/<trunk>` in Trunk Mode, and runs it without
opening the script or its usage. A one-shot coordinator reading
[Land the retained result](../../../src/skills/dough-execute-plan/references/one-shot.md#land-the-retained-result)
finds `--mode story-branch --tracking one-shot` with the trunk target.

Write the command block in the style of `wrap-up-closure-publication.md:35-41`,
keep the pinned phrases at one occurrence each, and name the value once in
"Publish an execution increment or repair" beside the Trunk/Story Branch
sentence. Do not add a third description of the sequence.
