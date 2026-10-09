# Managed delivery stops a stalled Git transport with a recoverable result

**Identity:** SEED-008#bound-managed-git-transport
**Source:** [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#bound-managed-git-transport).
**Prepared:** 2026-10-10, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/managed-delivery-stops-a-stalled-git-transport-w`
on `claude/managed-delivery-stops-a-stalled-git-transport-w`, under the
preparation assignment for `joey-chan` (published `324375f4`). Publication
target: `origin/main`; integration checkout: `/Users/terryyin/git/open-dough`.

## Goal and boundaries

When a fetch, push, or remote-tip read inside managed delivery stops
responding, `deliver` and `resume` end within a known bound with an explicit
transport stop that names the stalled stage, preserves the committed candidate
and the publication facts observed so far, and leaves the retry safe: the same
command run again publishes at most once more, and a candidate the remote
already accepted is recognized and registered rather than pushed twice.

In scope, from the story: a 120-second bound per fetch, push, and remote-tip
read in `deliver` and `resume`, raised only by one environment setting; ending
the whole stalled process tree; a structured `publication: stopped` result
with its own status and the listed facts, printed as JSON with the exit code
other stops use; every existing publication guarantee; a safe retry that
establishes the actual remote tip after a push of unknown acceptance; the
coordinator guidance naming the stop and its retry.

Material exclusions, from the story:

- Other callers of the shared helper (preparation start, release, abandon;
  Dough Land; wrap-up closure; the startup claim) may inherit the bound; no
  new result shape or guidance is promised for them, and their existing tests
  only have to stay green.
- The observation step `deliver` runs before publishing keeps its own bounds.
- No observer transport retry, dashboard change, SSH keepalive configuration,
  progress-based inactivity detection, or general shell timeout framework.
- ODF-222's unlocated stall is not assumed fixed. At wrap-up, record the
  response commits and first containing release on ODF-184 only, as the
  story's completion criterion asks.

## Published baseline and integration context

Origin was fetched at `1b28c208` (`origin/main`); this workspace branched at
`324375f4`, and the commits since are backlog claims and preparation records
that touch nothing this plan changes. The highest allocated plan on origin and
locally is `284-steady-dashboard-refresh`; `285-bound-managed-git-transport`
was free immediately before this write. No North Star topic governs managed
delivery's transport. No Accepted ADR is affected: ADR 0009 stays Proposed, and
ADR 0002's continuous-integration principle is served, not changed. This plan
adds no North Star topic.

## Existing solutions and selected approach

PFE, within the installed execute-plan scripts:

- **Change** `publication-git.mjs`: `git()` is the one path every managed
  fetch and push takes, and `lsRemoteSha` is the one remote-tip read; both run
  an unbounded `execFile`. The bound belongs here, applied by subcommand to
  `fetch`, `push`, and `ls-remote` only. Local Git commands keep `execFile`.
- **Not reused as-is:** `ci-command-adapter.mjs` `runAdapter` is the only
  existing bounded child (an `execFile` `timeout`). The probe below shows that
  shape returns on time but orphans the stalled `ssh`-shaped child; the
  transport bound instead spawns the command detached and ends its process
  group on expiry.
- **Change** `execution-increment-publication.mjs`: it already owns the
  publication stops (`unpublished-base`, `candidate-mismatch`, `conflict`,
  `persistent-contention`) through `stopped()` from
  `applicable-candidate-proof.mjs`. The transport stop is one more stop from
  the same sequence, built where each fetch, push, and tip read is called, so
  it knows the stage, whether a push was issued, and the facts of that
  attempt. `execution-increment-delivery.mjs` already surfaces every `!ok`
  publication result with its fields and exits 1; nothing new is needed there
  beyond the fields flowing through.
- **Change** `publication-resume.mjs` the same way, and
  `execution-increment-resume.mjs` reports it as it reports `held` stops.
- **Reuse** `publication-resume.mjs`'s ancestry classification
  (`merge-base --is-ancestor` after a fetch) in the publication sequence, so a
  retried `deliver` whose candidate the remote already holds returns accepted
  without a push and registers the receipt. Today that retry throws (probe
  below).
- **Reuse** the fixtures: `createCleanTrunkFixture`
  (`publication-clean-trunk-fixtures.mjs`, a bare `remote.git` with an
  `integration` checkout and an `execution` worktree) and
  `createManagedFixture` (`execution-increment-managed-delivery-test-fixtures.mjs`,
  deployed skill, controlled CI adapter, host session, real worker).
- **New** `publication-stall-test-fixtures.mjs`: makes a fixture's transport
  stall at a chosen point. It points `origin` at `ssh://localhost<remote.git>`
  and sets `core.sshCommand` in the workspace to a stand-in script that runs
  the requested `git-upload-pack` / `git-receive-pack` locally, or sleeps
  when a mode file says so (optionally only on the Nth call); a `pre-receive`
  hook that sleeps stalls a push before acceptance; a `post-receive` hook
  that sleeps accepts the push and loses its answer. Cleanup ends any
  stand-in still sleeping.
- **New** `publication-transport-bound.test.mjs` (slice 1) and
  `execution-increment-managed-delivery-transport.test.mjs` (slices 2–4) own
  the outside-in proofs; the bound is lowered through the environment setting
  so each stall case finishes in well under a second.

The one rule: every remote transport command managed delivery runs is bounded,
and a bound that expires becomes a publication stop carrying the attempt's
facts; nothing else about the sequence changes.

## Current decisions

- **Bound and override.** Default 120 000 ms per fetch, push, and remote-tip
  read; `OPEN_DOUGH_GIT_TRANSPORT_BOUND_MS` replaces it when set to a positive
  integer, read at call time so tests and an unusually slow network set it
  without code changes. No per-command values.
- **Ending the tree.** The transport command is spawned detached in its own
  process group; on expiry the group receives `SIGTERM`, and `SIGKILL` if it
  survives a short grace. The helper then rejects with an error carrying
  `code: "transport-timeout"`, the Git subcommand, the remote, and the bound.
  Callers outside managed delivery see that error as they see any other
  thrown Git failure.
- **Stop shape.** `publication: "stopped"`, `status: "transport-timeout"`,
  `stage` (`fetch`, `push`, `fetch-after-rejection`, `retry-push`,
  `confirmation-fetch`, `confirmation-tip`), `pushIssued` (true from the
  first push onward), `boundMs`, `remote`, `target`, `candidate`,
  `preRebaseSha`, `previouslyPublishedBase`, `suffixBase`, `remoteTip` (the
  last fetched tip, or null before the first fetch answered), and
  `reconciliations`. The stop rewrites nothing in the workspace. `resume`
  reports the same status with `stage` `fetch` or `push` and `pushCount: 0`.
- **Retry recognition.** In `publishExecutionIncrement`, after the first
  fetch answers, a candidate that is already an ancestor of the fetched target
  is accepted without reconciliation or push: the receipt is registered,
  maintenance is inspected, and the result says `reconciliations: 0` and
  `classification: "already-published"`. A candidate the remote does not hold
  continues through the existing sequence unchanged. This replaces the
  current throw ("rebase left the pre-rebase SHA as the candidate") on that
  retry; the throw stays for a genuine no-op rebase of an unpublished
  candidate.
- **Guidance.** `trunk-publication.md` gains a short paragraph beside the
  `unpublished-base` sentence: what a `transport-timeout` stop means, that the
  candidate is preserved, that the same `deliver` retries it, and that an
  issued push leaves acceptance unknown until the retry's fetch settles it.
  `publish-the-candidate.md`'s resume table already describes the lost-answer
  case and is unchanged.
- **Local tools.** This worktree has no `node_modules`; `node --test` needs
  none, and `node scripts/lint.mjs` runs with
  `PATH=/Users/terryyin/git/open-dough/node_modules/.bin:$PATH` (observed).
  Nothing is linked or installed into the worktree.

## Decisive premises and observations

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Every managed fetch, push, and remote-tip read goes through `publication-git.mjs` | Slice 1 design | `grep '"fetch"'` and `'"push"'` over `src/skills/**/*.mjs`: all production fetch sites call `git(cwd, "fetch", …)`; the only push is `pushExactRef`; `lsRemoteSha` is the only `ls-remote`. `execution-increment-publication.mjs:128,201,227` and `publication-resume.mjs:83,94` are the delivery and resume sites. | Confirmed. |
| A stalled fetch, a push stalled before acceptance, and a push accepted with a lost answer can be produced on a local bare remote | Slices 2–4 proof | Probe in a throwaway repo: `GIT_SSH_COMMAND` pointing at a script that sleeps, with `ssh://localhost<bare>`, stalled `git fetch`; a `pre-receive` hook that sleeps stalled `git push` with the remote tip unchanged; a `post-receive` hook that sleeps left the remote tip equal to the pushed SHA while the push never returned. | Confirmed for all three. |
| A plain child timeout does not end the stalled transport tree | Slice 1 design | Same probe: `execFile("git", …, { timeout: 2000 })` returned at 2 003 ms with `killed: true`, and the `ssh`-shaped child (`sleep 600`) was still running afterwards; `spawn(…, { detached: true })` with `process.kill(-pid, "SIGTERM")` returned at 2 006 ms and left no process, for fetch and for both push stalls. | Confirmed: group kill is required and sufficient. |
| Today's `deliver` retried after a lost answer does not recognize the accepted candidate | Slice 3 | Probe on `createCleanTrunkFixture`: candidate pushed to `main` by hand, then `publishExecutionIncrement` with the original base: without `validatedCandidate` it throws "rebase left the pre-rebase SHA as the candidate"; with it, it returns accepted with `reconciliations: 1` after a no-op push. | Confirmed; symptom reproduced. |
| Resume already classifies an accepted candidate without a push | Slices 3, 4 | `publication-resume.mjs:80-85` (`isAncestor` after fetch); `publication-resume.test.mjs:94-98,145-147,209-211` assert `already-published` with `pushCount` 0. | Confirmed. |
| Existing stops reach the `deliver` CLI as JSON with exit 1; thrown errors exit 2 with a bare message | Slice 2 | `execution-increment-delivery.mjs:106-134` spreads the stop fields; the CLI entry at the end writes JSON and sets `exitCode = 1` for `!ok`, and `2` on a throw. | Confirmed. |
| Ordinary transports answer in seconds; proven stalls last tens of minutes | Bound value | ODF-184 catalog: 2 s manual fetch, 12 s redelivery, immediate retry; stalls of about 15 and 49 minutes; the CI adapter's 20 s bound tripped in the same window as the push stall. | Inherited from the story; 120 s is between the two by two orders of magnitude on each side. |
| CI runs the suite on Linux, where process groups behave as on the probe machine | Slice 1 | `.github/workflows/ci.yml` `runs-on: ubuntu-24.04`; probe ran on macOS. | Confirmed POSIX on both; the slice 1 proof runs in CI. |
| The managed-delivery fixture publishes to a bare path remote whose URL and config a test may change | Slices 2–4 proof | `publication-clean-trunk-fixtures.mjs:14-33`: `origin` is `<fixture>/remote.git`, added by `git remote add` in the integration checkout; the execution worktree shares that remote. | Confirmed; the stall fixture re-points `origin` and sets `core.sshCommand` in that worktree. |
| One publication test file runs in a few seconds locally | Verification | `node --test src/skills/dough-execute-plan/scripts/publication-resume.test.mjs`: 2 passed in 2.7 s. | Confirmed. |

## Outside-in proof ownership

| Promise (story example) | Owning slice | Proof |
| --- | --- | --- |
| A stalled fetch ends within the bound with the stop naming that fetch, the candidate, and the base; no push; workspace untouched; the same `deliver` then publishes once and registers (1) | 2 | `execution-increment-managed-delivery-transport.test.mjs`: stand-in stalls upload-pack; `deliver` returns `stopped` / `transport-timeout` / `stage: fetch` / `pushIssued: false` within the lowered bound; remote tip unchanged; `HEAD`, branch, and `status --porcelain` unchanged; stand-in set to pass; `deliver` again → accepted, remote tip is the candidate, coverage holds it once. |
| A push that never answers, remote never receiving the candidate, stops with acceptance unknown; the retry pushes once and registers (2) | 2 | Same file: `pre-receive` sleeps; stop has `stage: push`, `pushIssued: true`; remote tip is the base; hook removed; `deliver` again → accepted once. |
| A push accepted with its answer lost stops with acceptance unknown; the retry pushes nothing, reports acceptance, registers; the remote holds the candidate once (3) | 3 | Same file: `post-receive` sleeps; stop has `stage: push`; remote tip already equals the candidate; hook removed; `deliver` again → accepted, `reconciliations: 0`, `classification: already-published`, receive-pack not invoked again (the stand-in's call log), coverage holds the SHA. |
| After a rejected push, a stalled fetch stops naming that fetch and the rejected candidate with the suffix unrewritten; the retry reconciles, revalidates, publishes (4) | 2 | Same file: target advanced by the integration checkout; stand-in stalls the second upload-pack call; stop has `stage: fetch-after-rejection`, `pushIssued: true`, candidate equals `preRebaseSha`; `deliver` again → accepted with `reconciliations: 1` and the validate callback called for the rewritten candidate. |
| A slow but responsive transport succeeds as today (5) | 1, 2 | Slice 1: stand-in delays each call by less than the lowered bound; fetch and push succeed. Slice 2: the same under `deliver` returns accepted with no `transport-timeout` anywhere in the result. |
| The same stalled fetch under `resume` stops with the candidate preserved and no push (6) | 4 | Same file: stand-in stalls; `resume` returns `stopped` / `transport-timeout` / `stage: fetch` / `pushCount: 0`; remote tip unchanged. |
| Ending the bounded command ends its process tree | 1 | `publication-transport-bound.test.mjs`: the stand-in records its PID; after the stop, that PID is gone and `git` rejected with `code: transport-timeout` naming the subcommand, remote, and bound. |
| Existing publication guarantees and other callers are preserved | 1 | Every `*.test.mjs` under `src/skills/dough-execute-plan/scripts`, `src/skills/dough-land/scripts`, `src/skills/dough-story-refinement/scripts`, and `src/skills/dough-story-wrap-up/scripts` green, since all load the changed helper. |
| The coordinator guidance names the stop and its retry | 2 | `trunk-publication.md` paragraph reviewed against the story's scope bullet; `node scripts/lint.mjs` green. |

## Ordered slices

### 1. Remote transport commands end within a bound that ends their process tree
Type: Structure
Status: done
Proof: new `publication-transport-bound.test.mjs`: with
`OPEN_DOUGH_GIT_TRANSPORT_BOUND_MS=300`, a fetch and a push against the
stalling stand-in reject within about the bound with
`code: "transport-timeout"`, the subcommand, remote, and bound; the stand-in's
recorded PID no longer exists; a stand-in that delays under the bound lets
fetch, push, and `lsRemoteSha` succeed; without the setting the default is
120 000. Then every `*.test.mjs` under the four script directories named in
the proof table green.

Structure: `publication-git.mjs` runs `fetch`, `push`, and `ls-remote`
through one bounded transport function (detached spawn, group `SIGTERM` then
`SIGKILL` after a short grace, stdout and stderr collected as `execFile`
returns them); `lsRemoteSha` uses it. Other subcommands are unchanged. This
enables slice 2 to turn an expired bound into a publication stop. Test
support: `publication-stall-test-fixtures.mjs` with the ssh stand-in, its
mode file, call log, and PID record, and cleanup that ends a sleeping
stand-in.

Accepted proof: `node --test src/skills/dough-execute-plan/scripts/publication-transport-bound.test.mjs`
(5 tests: stalled fetch, stalled push, pre- and post-receive hook stalls, slow
responsive transport, bound setting); every `*.test.mjs` under the four script
directories green via `bash scripts/test.sh` (Bash 5). `tests/native-setup.sh`
fails locally only on the machine's Node 24.5.0 versus `.node-version`, the same
on an untouched checkout.

Learnings for slices 2–4:
- Lower the bound only after fixture setup (setup's own pushes are bounded) and
  use 1–2 s, not 300 ms: Git, the node stand-in, receive-pack, and hooks need
  start-up room on a loaded machine.
- `installTransportStall({ fixture, workspace, origin })` returns `pass`,
  `stall({ service, call })`, `stallBeforeAcceptance`, `stallAfterAcceptance`,
  `removeHooks`, `calls`, `hookPids`, `alive`, and `cleanup`. The re-pointed
  `origin` lives in shared repository config, so integration-checkout pushes
  through `origin` count as calls; advance trunk with the bare remote path.
- The bound applies when the subcommand is the first argument to `git()`;
  managed callers already name it first.
- `boundedTransport` carries a JSDoc result type: dashboard TypeScript tests
  import `lsRemoteSha` and lint fails on an untyped result.

### 2. Managed delivery reports a stalled transport as a recoverable stop
Type: Behavior
Status: done
Proof: new `execution-increment-managed-delivery-transport.test.mjs` on
`createManagedFixture` plus the stall fixture, bound lowered: examples 1, 2,
4, and 5 as the proof table maps them, each followed by the retry; the
`deliver` CLI run through `deliverThroughCli` on example 1 prints the stop as
JSON and exits 1. `execution-increment-managed-delivery*.test.mjs` and
`execution-increment-publication*.test.mjs` green. `node scripts/lint.mjs`.

Behavior: a fetch, push, or tip read in `publishExecutionIncrement` exceeds
the bound → the sequence returns `stopped` / `transport-timeout` with the
stage, `pushIssued`, bound, remote, target, candidate, pre-rebase SHA, base,
suffix base, last fetched tip, and reconciliations; `deliver` surfaces it as
it surfaces other stops, keeping the established observation directory as it
does for other `!ok` results; the workspace is as it was. The same `deliver`
run again on a responsive transport continues the ordinary sequence.
`trunk-publication.md` names the stop and its retry.

Accepted proof: `node --test src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-transport.test.mjs`
(examples 1, 1 through the CLI with exit 1, 2, 4, 5); the managed-delivery,
publication, delivery, wrap-up, and refinement consumers and the payload-update
shell tests green.

Learnings for slices 3–4:
- A tip read after a second rejection stops with the added stage
  `contention-tip`.
- `publishExecutionIncrement` wraps each remote step in a `transport(stage,
  operation)` closure returning `{ stop | value }`; slice 3's recognition sits
  right after the first `fetchTarget("fetch")`. Slice 4 may lift the closure
  into a shared module for the resume path.
- `reconcileAndRequireProof` moved to `execution-increment-reconciliation.mjs`,
  declared in `install.sh` `managed_files`; a new runtime module needs that
  declaration.
- The managed transport tests share `execution-increment-managed-delivery-transport-test-fixtures.mjs`
  (trunk-mode `createManagedFixture` plus the stall, 2 s bound);
  `deliverThroughCli` needs the bound and `CLAUDE_CODE_SESSION_ID` in its `env`.

### 3. A retried delivery recognizes a candidate the remote already accepted
Type: Behavior
Status: done
Proof: same file, example 3 as mapped: after the lost-answer stop, `deliver`
again returns accepted with `reconciliations: 0`, no second receive-pack in
the stand-in's log, the SHA registered to the live owner once, and
maintenance inspected. `publication-racing-suffix*.test.mjs` and
`execution-increment-publication-reconciliation.test.mjs` green: an
unpublished candidate still reconciles and pushes as before, and a genuine
no-op rebase of an unpublished candidate still throws.

Behavior: the first fetch answers and the candidate (the validated candidate
when supplied, else the branch tip) is already an ancestor of the fetched
target → publication is accepted without reconciliation or push; the receipt
is registered and the default checkout inspected as after a push.

Accepted proof: `node --test src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-transport*.test.mjs`
(example 3 in the `-push` file beside example 2);
`execution-increment-publication.test.mjs` (direct already-published) and
`execution-increment-publication-reconciliation.test.mjs` (a no-op rebase of an
unpublished candidate still throws); every `*.test.mjs` under the four script
directories green.

Learnings for slice 4:
- Recognition excludes an empty suffix (candidate equals the previously
  published base): admitted completion publishes one to move onto current
  trunk, and it still reconciles onto the fetched tip.
- Recognition runs before `held(0)`, the order resume already uses.
- `receivePacks(stall)` lives in the transport test fixtures.

### 4. Resume reports a stalled transport the same way
Type: Behavior
Status: planned
Proof: same file, example 6 as mapped, for a stalled fetch and for a stalled
push on the not-on-remote path; `publication-resume*.test.mjs` and
`execution-increment-managed-delivery-resume*.test.mjs` green.

Behavior: a fetch or push in `resumeInterruptedPublication` exceeds the bound
→ `resume` returns `stopped` / `transport-timeout` with `stage`, `pushCount:
0`, the candidate, and the recovered observation, as it returns `held` stops;
nothing is pushed or rewritten.

## Verification and sizing

- Each slice is one proof loop. The focused command is
  `node --test src/skills/dough-execute-plan/scripts/<file>.test.mjs` for the
  named files, or `bash scripts/test.sh <those files>`; each stall case runs
  under a lowered bound, so a file finishes in seconds.
- Slice 1 changes a helper every publication script loads, so its proof runs
  every test file under the four script directories named in the proof
  table; that is the consumer check the story's preserved guarantees need,
  and the only broader local check. Hosted CI runs the whole suite on
  publication.
- `node scripts/lint.mjs` at each commit, as the pre-commit hook requires,
  with the integration checkout's `node_modules/.bin` on `PATH`.
- Sizes: slice 1 is small to medium (one helper, one fixture, one test
  file); slice 2 is the largest (stop construction at six call sites, four
  examples, one guidance paragraph) but one rule; slices 3 and 4 are small.

## Preparation review

Refinement was not needed: slice 1 is the structure slices 2–4 build on and
is placed immediately before them; slices 2, 3, and 4 each own one behavior
and one proof loop at the delivery boundary; the stall fixture is shared, not
per-example machinery; and the retry rule in slice 3 is the existing resume
classification applied once more. No slice-specific concern remains.
