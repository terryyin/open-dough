# Retire an established session's isolated worktree after its result lands

**Identity:** SEED-066#retire-established-session-worktree
**Source:** [correction story](../../seeds/SEED-066-composable-lightweight-session-options.md#retire-established-session-worktree)

## Source and provenance

Bounded correction from the native observation of
[SEED-066#unattached-session-native-observation](../../seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-native-observation)
(plan 301), run on 2026-10-13 in the Lizard project with installed release
`0.3.60` and dashboard deployment `e40d6854c99b`. Terry accepted planning this
correction the same day.

## Current findings

Each journey was Start session · Isolated workspace · Automatically land,
then one-shot execution of a queued story. All landed correctly; they differed
only at retirement.

| Host | Retirement call | Result |
| --- | --- | --- |
| Claude Code 2.1.296 (launch `68dc053f`) | `worktree-retirement.mjs retire … --identity <story>` | `ok: false`, “reused, host-owned, or unrecorded workspace, not created for this work”; worktree and branch kept |
| Codex 0.162.1 (launch `3226e1cf`) | `… --identity <story> --created-for-work --contained <sha>` | worktree and branch removed |
| Cursor 2026.10.01 (launch `2d5ab090`) | `… --identity <story> --contained <sha>` | kept; reported “preserved (`created: false` / host-owned established session workspace)” |
| Claude Code, review then `/dough-land` (launch `9d835c6c`) | through Dough Land | worktree and branch removed |

Cause, read from the released sources, unchanged on trunk at `52a4f6e9`:

- The dashboard's identity-free start creates the session worktree, so no
  creation ref names the later story, and the invoked workflow's own start
  answers `created: false`.
- [worktree-retirement.md](../../../src/skills/dough-land/references/worktree-retirement.md)
  allows `--created-for-work` only from a recorded `created: true` or when
  “the caller or developer states the worktree was created for this work”.
- [established-session.md](../../../src/skills/dough-execute-plan/references/established-session.md)
  calls an `isolated` workspace “an owned worktree created for this session”
  and says it is “retired once trunk contains its work” only in its Dough Land
  paragraph. Nothing tells a one-shot workflow that the block is that caller
  statement, so two hosts read `created: false` as decisive and one did not.

## Goal and scope

Make the block's `workspace role: isolated` the stated creation fact for a
workflow that retires after landing in that session, so every host retires the
session worktree after an auto-land one-shot result. Guidance only.

Preserved: `default-checkout` sessions retire nothing; review results stay
until landing is requested; tracked work keeps its own lifecycle; the
retirement command's containment gate, creation-ref gate and refusal for
“created for other work” are unchanged; `--created-for-work` is still never
inferred from a clean directory, a claim or a preparation assignment.

Excluded: recording a creation ref from the dashboard start, changing
`execution-start.mjs` receipts, dashboard changes, and the Cursor trust
prompt, which [plan 305](../305-cursor-trust-prompt-at-session-start/PLAN.md)
owns.

## Current decisions

- Guidance, not a new creation record. The retirement reference already
  accepts a caller statement; the block is that statement and only needs to be
  named as one. A script-recorded session creation fact would add a second
  ownership mechanism for a case the existing one covers. Revisit only if the
  native re-observation still diverges.
- State the rule once in `established-session.md` and link to it from the
  retirement reference's `--created-for-work` bullet and from one-shot
  [Retire the workspace](../../../src/skills/dough-execute-plan/references/one-shot.md#retire-the-workspace).
  Follow [AGENTS.md](../../../AGENTS.md) and
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  write for the agent in the session; edit `src/skills/` only.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  requires native evidence per affected host. As in plan 301, that evidence
  needs the released payload installed, so slice 2 follows a release Terry
  authorizes; this plan performs no release.

## Outside-in proof ownership

| Promise | Owning slice and observation |
| --- | --- |
| A workflow in an `isolated` established session is told to retire with the created-for-work fact after landing | 1: the guidance test reads the three references for the rule and its links |
| `default-checkout` and “created for other work” stay retained | 1: the same test keeps the existing statements; `retirement-checks` tests stay green |
| Claude Code and Cursor retire the session worktree after an auto-land one-shot execution | 2: native journeys; `git worktree list`, local and remote branches, and the retirement receipt in each transcript |

## Execution context

- Established start: `SEED-066#retire-established-session-worktree`, publisher
  `dashboard-territory.local-open-dough`, agent `ivan-chan`; no second start.
- Story Branch Mode; owned linked workspace
  `/Users/terryyin/git/open-dough/.worktrees/retire-an-established-session-s-isolated-worktre`,
  branch `codex/retire-an-established-session-s-isolated-worktre`. Originating
  and integration checkout: `/Users/terryyin/git/open-dough` (not mutated).
- Authorized remote: `origin`, trunk: `main`; increments publish to the
  recorded execution branch. Published claim and first increment base:
  `da1045de4aeb741cf1893fc51dd1041620452a95`; starting revision:
  `8d952334b254e672f83a404dc63fcaaf3cb9bc11`. Both remote refs held the claim
  at startup.
- Checkout setup passed: Node `24.21.0`, locked npm and browser acquisition
  through `node scripts/setup-native.mjs npm` and `browser`, then `check`
  (Chromium `153.0.8010.12`). Applicable command passed:
  `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/established-session-guidance.test.mjs`.
- Selective formatter: `npm run format`; `.githooks/pre-commit` is check-only
  staged lint, plus dashboard typecheck when scripts are staged. No generator
  applies to this guidance change; installed copies stay unchanged.
- CI: GitHub Actions, verified `ci.yml` / `CI`, execution branch; coordinator
  `seed-066-ivan`. First observer ended with confirmed shutdown and CI unobserved.
- On 2026-10-14 Terry authorized the release and native checks, then delegated
  the version choice to research. Latest origin was `0.3.60`; `v0.3.61` now
  identifies `1de2986ca45ad47198f0d43154be4d28e9d0e62d` on origin. The guidance
  landing `cc92c2ded35bc100ae38dc67cec789224b81eada` has the original launch's
  recorded landing receipt; later trunk publications take no landing context.
- Lizard's ordinary latest update passed for both roots: 251 declared files
  match the tagged bytes. Only updater-owned changes were published as
  `6463d42928732a12d7a95bdb66dca5f73a240d48` on `origin/master`.
- Resumed Codex stream: coordinator `seed-066-ivan`, directory
  `/tmp/dough-ci-501/watch-UhXGDV`, PID `87086`, session `22471`, cell `14`.

### CI repair before the native slice

Registered `ba71df08887196d33d820765027da82e56c669b3` failed CI run
`38408615864`/1 in installed diagnostics: its fixture forced 100 ms idle expiry
while testing installed entrypoints. A controlled 300 ms gap proved owner exit;
ordinary allowance passed. Repair `be06ef3783f2776803a78602ea40611bfb0a6a3f`
removes that incidental expiry, preserving explicit teardown and the dedicated
runtime expiry test. Exact CI ordering is unproved; no runtime/outage claim.
Focused terminal pass: `PATH="/opt/homebrew/bin:$PATH" npm test -- /tmp/seed066-installed-owner-lifetime.sh tests/execution-payload-update.sh src/skills/dough-execute-plan/scripts/github-request-owner.test.mjs`.
Copied installed runtimes, verdicts, diagnostics, routes and teardown were
exercised. Fresh independent refactor found none; formatting passed. All writers
paused; stash was clean, no entry, then restored with `applied: false`.
Record: `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-pOwiJD/record.json`.

## Ordered slices

### 1. The established session block states who created an isolated workspace
Type: Behavior
Status: done
Proof: `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/established-session-guidance.test.mjs`
extended with the rule and both links, then `PATH="/opt/homebrew/bin:$PATH" npm test`.
The repository's runner supplies the required test environment; direct
`node --test` is unsupported under `tests/README.md`.

Behavior: an agent in a session whose block says `workspace role: isolated`
finishes a one-shot landing and reads retirement guidance → it finds that the
block states the worktree was created for this session's work, and passes
`--created-for-work` with the landed revision as `--contained`. With
`workspace role: default-checkout` it finds that nothing is retired.

Accepted proof (2026-10-13): all commands below reached terminal exit 0 in
this execution checkout. The new guidance assertions read the actual three
references, observe the creation fact despite `created: false`, landing gates,
both flags, default retention and both resolving links, and accept an independent
paraphrase. Existing retirement tests construct real disposable repositories
and remotes, then observe flag-based removal, containment refusal, dirty-work
preservation and other-work creation-record refusal even with the flag. Source
guidance changes no runtime gate.

```sh
PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/established-session-guidance.test.mjs
PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-land/scripts/worktree-retirement.test.mjs src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs src/skills/dough-story-refinement/scripts/established-preparation-guidance.test.mjs src/skills/dough-execute-plan/scripts/established-session-start.test.mjs
PATH="/opt/homebrew/bin:$PATH" npm test
```

The start consumer observes reused `created: false` and preserved default
checkout state. The one-shot consumer retains review, no-change, default
checkout and automatic-landing gates. The whole suite includes payload-link
checks. Searches found no consumer assertion requiring the removed landing-only
retirement sentence. Representative AGENTS review walked isolated auto-land,
default-checkout, review, tracked work and an other-work creation record;
the rule is in one home and the intended outcomes are preserved. An initial
new prose assertion rejected a line wrap; accepting whitespace corrected the
assertion before the passing proofs. No installed managed copy was edited.
Independent post-change refactor returned `none — already clean` and
`## REFACTOR COMPLETE`; no edits or additional tests were needed. The required
formatter completed successfully; its only source change was test formatting,
with accepted proof unchanged. Story-obligations check passed with native
acceptance owned by slice 2. No readiness assessment was renewed.

### 2. Claude Code and Cursor retire the session worktree natively
Type: Behavior
Status: done
Prerequisite satisfied: Terry authorized release and native checks; both hosts
used released `0.3.61` on 2026-10-14, dashboard `1de2986ca45a-wypYFW`.
Proof: one paid native journey per host, manually triggered or explicitly
authorized, in a project whose installed release carries slice 1: Start
session · Isolated workspace · Automatically land, then one-shot execution of
a queued trivial story.

Behavior: after the result lands, the session worktree and its branch are
gone and the transcript holds a retirement receipt with `removed`. Record the
host, version, model, installed release, launch and observed result in this
plan, and in plan 301 where its slices 1 and 3 wait on this evidence. Codex's
2026-10-13 pass is reused only if the released wording leaves its path
unchanged; otherwise observe it again.

Accepted retirement proof: one fresh paid journey per host in Lizard, blank
Start session · Isolated workspace · Automatically land, followed only by
`/dough-execute-plan SEED-001#standalone-script-wording --one-shot` (Claude)
or `SEED-001#warning-limits-wording --one-shot` (Cursor). Both starts returned
`prepared`, `created: false`, `landing: auto-land`, without a second worktree.

| Host / native default | Launch / native session | Accepted trunk SHA |
| --- | --- | --- |
| Claude Code `2.1.296`, `claude-opus-5-5` | `c8f08604-1940-4be1-aa6f-1744a598232f` / `122d6dd3-4fc6-4dcc-97fc-f1faca40e484` | `a4c4db393e0c7ff86ca73d8793029f2757325ed5` |
| Cursor `2026.10.01-e373342`, Auto | `19786396-a8de-4a65-afbc-5ccb780386f6` / `394bd615-a31f-4f0a-a34a-9fb2af6c405b` | `34c50f0d3140307cf4db96a893a9c138741dc448` |

Each native command used `--created-for-work --contained <accepted SHA>`;
both receipts were `ok: true`, `removed: true`, `partial: false`, worktree and
branch `removed`. Independent Git checks proved registrations, directories,
local and remote session branches absent, and trunk containment. Original
launch landing captures and completed-with-attention reporting receipts are
recorded. Evidence: `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/seed066-cursor-prerequisite-wnhqomzj/summary.json`
and its paired Claude/SQLite Cursor commands and results. The obsolete deleted
Cursor startup was archived there and only its stale kept-start state cleared;
no other record changed. Its fresh trust prompt was answered once.

Limits: both installed CI receipts were `observation_unavailable` (`ci.yml`,
HTTP 404), shutdown confirmed. Claude separately observed Python run
`38478718455` green and pytest 1545 passed / 7 skipped. Cursor retired without
native CI-green evidence or a pytest result; later operator observation found
its Python run `38480094290` green. Retirement acceptance does not establish
those native completion gates. Plan 301 retains the broader gap and plan 305
owns trust. Codex's earlier pass is reused: it already used these exact flags,
and the retirement/start scripts and checks are unchanged from `0.3.60`.
Same-attempt recovery from surviving installed roots then produced exact-SHA
CI success with confirmed shutdown: Claude run `38478718455` attempt 2,
mailbox `/tmp/dough-ci-501/watch-zLUNxl`; Cursor run `38480094290` attempt 1,
mailbox `/tmp/dough-ci-501/watch-KlvZLj`. Claude used its original background
process; Cursor used its retained client. One coordinator-authorized rerun of
Claude's exact run supplied a fresh attempt because startup discovery excluded
its older completed attempt. No Git publication, fixture, configuration or
resource recreation. Same-launch recovery reports: Claude `bc965221-c6e1-4d5b-9fc8-37cb7d8d0d62`,
Cursor `85ec6d94-13da-4cdb-ba5e-a5c8eae733f6`; paired recovery evidence is beside
original proof. Current coverage is recovered; initial ordering is not proved.
Fresh independent refactor: empty scope, no edits/tests; required format passed.

## Story obligations

### G1. Native retirement acceptance
Reported: slice 1 — "Native slice 2 was not performed and remains pending."
Story clause: "The correction is accepted when Claude Code and Cursor each retire the session worktree after an auto-land one-shot execution from the released payload."
Disposition: proved by slice 2: paired native retirement receipts and independent Git absence in the evidence directory above

### G2. Native CI completion receipts were unavailable
Reported: slice 2 — "Neither receipt establishes its prescribed green gate."
Story clause: "that the workflow retires it on that statement after its landing gates pass."
Disposition: proved by slice 2: same-session exact-SHA CI success and confirmed shutdown in claude-ci-recovery-evidence.json and cursor-ci-recovery-evidence.json beside the original proof; original ordering remains explicitly unproved in parent plan 301

### G3. Obsolete Cursor startup blocked the fresh observation
Reported: slice 2 — "The obsolete deleted Cursor startup required the authorized reversible cleanup before its fresh attempt."
Story clause: "A developer who started an Isolated workspace session finds its worktree and branch retired once a one-shot workflow invoked there has landed its verified result, whichever host ran it."
Disposition: proved by slice 2: archived exact startup-state repair, fresh launch 19786396, and independent retirement/absence proof in the evidence directory above; no permanent startup behavior change is claimed
