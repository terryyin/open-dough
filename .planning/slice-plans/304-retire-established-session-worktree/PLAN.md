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
- No numeric slice budget is supplied; use the bounded proof loop. No overrun
  replanning instruction changes the existing planning authority.
- Selective formatter: `npm run format`; `.githooks/pre-commit` is check-only
  staged lint, plus dashboard typecheck when scripts are staged. No generator
  applies to this guidance change; installed copies stay unchanged.
- CI: GitHub Actions, verified selector `ci.yml`, display name `CI`, observing
  the execution branch. Codex coordinator `seed-066-ivan`, stream directory
  `/tmp/dough-ci-501/watch-dZB6xb`, PID `51578`, session `40781`, yielded cell
  `12`. The claim's earlier trunk publication is unobserved by this stream.
- On 2026-10-14 Terry authorized the release and native checks, then delegated
  the version choice to research. Latest origin was `0.3.60`; `v0.3.61` now
  identifies `1de2986ca45ad47198f0d43154be4d28e9d0e62d` on origin. The guidance
  landing `cc92c2ded35bc100ae38dc67cec789224b81eada` has the original launch's
  recorded landing receipt; later trunk publications take no landing context.
- Lizard's ordinary latest update passed for both roots: 251 declared files
  match the tagged bytes. Only updater-owned changes were published as
  `6463d42928732a12d7a95bdb66dca5f73a240d48` on `origin/master`.
- The first observer stopped with confirmed shutdown and pending CI unobserved.
  Resumed Codex stream: coordinator `seed-066-ivan`, directory
  `/tmp/dough-ci-501/watch-UhXGDV`, PID `87086`, session `22471`, cell `14`.

### CI repair before the native slice

Registered slice-1 revision `ba71df08887196d33d820765027da82e56c669b3` failed
run `38408615864`, attempt 1, `test (1/3)` at the installed diagnostic boundary
in `tests/helpers/installed-wait-entrypoint-fixture.bash`: the local request
owner's connection failed. The fixture forced a 100 ms idle expiry despite
testing installed entrypoints rather than expiry. A controlled 300 ms gap
showed its owner exited before diagnostics; ordinary allowance passed. The
repair removes that incidental expiry, preserving explicit teardown and the
runtime-owned idle-expiry test. The exact CI shutdown ordering is unproved;
no runtime counterexample or server-outage claim was established.

Focused terminal pass: `PATH="/opt/homebrew/bin:$PATH" npm test -- /tmp/seed066-installed-owner-lifetime.sh tests/execution-payload-update.sh src/skills/dough-execute-plan/scripts/github-request-owner.test.mjs`.
The sole helper consumer exercised copied installed runtimes in both layouts,
verdicts, diagnostics, routes and teardown. Independent refactor returned
`none — already clean`; formatting passed, with proof unchanged. Slice statuses
remain unchanged. All writers paused; stash save was `clean` with no entry,
record `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-pOwiJD/record.json`.

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
Status: planned
Prerequisite: pending a separately authorized release containing slice 1 and
the required native journeys. No native observation or release was performed
during slice 1; plan 301's pending evidence remains unchanged.
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

## Story obligations

### G1. Native retirement acceptance
Reported: slice 1 — "Native slice 2 was not performed and remains pending."
Story clause: "The correction is accepted when Claude Code and Cursor each retire the session worktree after an auto-land one-shot execution from the released payload."
Disposition: receiving slice 2
