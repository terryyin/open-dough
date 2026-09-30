# Open Dough Project Findings

Project-owned retrospective findings: problems in how this repository builds,
tests, and proves Open Dough, rather than in the published Open Dough skills or
their release payload. General execution lessons and published-skill defects
remain in [DearDough.md](DearDough.md), which also keeps local-number
allocation (DD-NNN) and removed-finding recovery references. An occurrence in
this repository alone does not make a cause project-specific. Original finding
codes and occurrence evidence are retained.

Reviewed on 2026-09-29 against `d68fcde4`. Frequency counts distinct
executions, not commands, retries, or repairs.

## Priority assessment

1. **Native acceptance harness observations that do not match what the native
   agent did — first, correction done.** Two executions remain (plans 139 and 154),
   after DD-179's harness observation faults were resolved: an assessor
   ordering defect that cost a transcript investigation, and a loosened
   assessor that accepted failure reports. Story:
   the assessor counterexample discipline's remaining-gaps correction, done at
   `b6a3ac18` (story and plan recoverable from
   `b6a3ac18:.planning/seeds/SEED-055-trustworthy-project-proof.md` and
   `b6a3ac18:.planning/slice-plans/168-assessor-counterexample-gaps/PLAN.md`)
   (DD-160, DD-175, ODF-087's harness facet; the counterexample helper and its
   guard landed, and this correction closes what they still miss).
2. **Native host runs and observations routed through the developer — low,
   not queued.** Two executions with a cost (plans 139 and 150) and one where
   the agent found a free route itself (plan 152). The cost was a few developer
   round trips, and some of that friction is intended while paid native runs
   stay manual-only.
3. **Local checks whose result differs from CI's — low, not queued.** Five
   executions (plans 140, 146, 147, 157, 165), one finding each. DD-187 (a
   `pipefail` pipeline that git could lose to SIGPIPE) cost one CI repair. DD-168 and DD-178
   (tests that take the repository root from the working directory) had no
   delivery impact and each needs a small fix. DD-162 came from a coordinator-prescribed
   direct run that bypassed the runner's existing guard. DD-171 matches
   published ODF-003 (a consumer check missing non-import consumers); ODF-003's
   plan 104 occurrence failed in the same `dashboard/tests/preparingJourney.ts`.
4. **Behavior audits that miss guidance-directed actions (DD-113) — low, not
   queued.** One execution; plan 121 (`178e0346`) corrected its missed merge,
   and no recurrence is recorded.

Resolved and removed on 2026-09-29, each confirmed at `d68fcde4`
(recovery: `d68fcde4:ProjectFindings.md`):

- DD-114 (a runner setting reached checks that start the runner):
  `scripts/test.sh` unsets `${!OPEN_DOUGH_TEST_@}` after listing jobs, and
  `tests/test-runner-split.sh` fails on any inherited `OPEN_DOUGH_TEST_*`.
- DD-164 (negated assessor counterexamples never failed): every negated
  assessor call now sits in an `if` condition or is a function's return
  status, and native counterexamples run through
  `git_publication_suite_expect_rejected`.
- DD-166 (host `NODE_ENV` reached the dashboard build):
  `dashboard/vite.config.mts` sets `NODE_ENV=production` for every build.

Resolved and removed on 2026-09-29, confirmed at `1dfb75ee`
(recovery: `3f0f1ad3:ProjectFindings.md`):

- DD-158 (local paired A/B runs under load spent proving a CI-judged budget):
  `scripts/ci-test-times.sh` reports each job's and share total's recent trunk
  CI range against `tests/time-budget` with a wide or thin verdict, and
  `tests/time-budget.md` limits local timing to thin headroom, projected from
  the recent highest CI value.

Resolved and removed on 2026-09-30 (recovery: `34ceff06:ProjectFindings.md`):

- DD-179 (native harness observation and host shell shims failed on real
  hosts): plan 163 replays real Claude, Codex, and Cursor streams through one
  shared reader in the free suite, a guard refuses host-stream parsing
  outside it, and every harness shim is checked under each login-shell
  profile (plan at
  `2b20ed61:.planning/slice-plans/163-native-harness-replay/PLAN.md`). Its residue, continued-command
  reading and corpus admission, was corrected afterwards (plan at
  `79d5e22d:.planning/slice-plans/169-native-harness-replay-corrections/PLAN.md`).

Returned to DearDough.md on 2026-09-29: DD-155 (plan-number collision, the
published slice-planning allocation rule, catalog ODF-106) and DD-159
(a diagnosis misread; its own inference rules out a suite defect). Both had
moved here only for DearDough's line ceiling.

## Native acceptance harness observations that do not match what the native agent did (first priority)

Native acceptance ([ADR 0005](docs/adrs/0005-cross-tool-validation-accepted.md))
judges a paid native run through this repository's fixtures, substitute
actors, stream observation, host shell shims, and assessors. Each finding below
is a place where that machinery reported something other than what the native
agent did. A paid run was then wasted, or the verdict needed a human reading
the transcript. The DearDough finding ODF-087 (native agents skipping a
published gate) has the same harness facet: its plan 147 occurrence passed
because the assessor observes only the retired outcome. That finding stays in
DearDough because its cause is guidance-following; the assessor story below
owns its harness facet.

Each concrete fault below was repaired in its own execution: `afa43926`
(DD-160) and plan 158 (`8dff3ac0`, DD-175).

**Follow-up:** done at `b6a3ac18`, the assessor counterexample discipline's
remaining-gaps correction,
for DD-160, DD-175, and ODF-087's harness facet, after the counterexample
helper and its guard landed.

Assessor reads still unproved after the counterexample helper landed, each
found while migrating its suite: `trunk_closure_assess` never reads the
`response-completion-result` it observes; `native_journey_state_assess` never
reads `other-tool-root-claude-preserved`; `git_publication_assess`'s prose
`inconclusive` path has no rejected case; and
`git_publication_assess_print_fields` has no caller.

### DD-160 — An escalation counterexample removed two signals at once, hiding an assessor ordering defect

Plan 139 slice 1 planned "admission with no prior one-shot edits (admitted up
front) → inconclusive". The counterexample removed the `--one-shot` start and
the carried edits together, so an assessor that checked a clean workspace
before checking whether anything was carried still passed it. The first paid
run showed the uncovered shape: the agent started one-shot, edited nothing, and
admitted with `--carry`, and the assessor reported fail instead of the story's
inconclusive.

#### Occurrences

- Execution: `SEED-028#native-one-shot-escalation` / plan 139, first related implementation commit `23663a21`
  - Timestamp: 2026-09-28 (paid run 1, results `test-results/native-escalation-1`, before `afa43926`); exact time unknown
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision 0466e5ba
  - Evidence: `23663a21:tests/support/git-publication-native-one-shot-escalation.sh` counterexample "Admitted up front" and assessor order. Run 1 observations `one-shot-start-observed: true`, `edits-carried: false`, `workspace-edits:` empty → `fail`. Corrected in `afa43926` with a separate "admitted before editing" counterexample.
  - Observed effect: a transcript investigation and a correction commit before run 2; the paid run itself was needed anyway, because its fixture also had to change.
  - Inference: Qualified. Counterexamples that vary one planned signal at a time would have exposed the ordering; proof acceptance checked each named case, not whether each case isolated its signal.

### DD-175 — A loosened assessor was accepted on its old counterexamples, not on what it newly accepts

Plan 154 slice 3 narrowed a native response check's rejection to admit one reconstructed Cursor line. Its proof, the implementer, refactor, and coordinator acceptance checked only that existing counterexamples kept their verdicts; the retrospective then found four failure reports the new check accepts.

**Response to this instance:** plan 158 (`8dff3ac0`) judges Story Branch
closure responses by sentence and rejects any trunk CI, check, observer, or
watcher failure. Accepting a widened assessor only on its old
counterexamples remains open.

#### Occurrences

- Execution: `SEED-008#closure-proof-and-harness-correction` / plan 154, first related implementation commit `d1204cd7`; Timestamp: unknown (slice 3 accepted before `1e3880ed`, 2026-09-29T15:29:21+08:00); Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `b37292dd`
  - Evidence: `story_closure_response_trunk_result` at `1e3880ed` returns true for "Trunk CI passed. The watcher failed to start." and three similar lines, false at `a51510d2`; follow-up plan 158. Observed effect: one follow-up correction. Inference: qualified; widening an assessor needs paraphrased failure cases on the side it newly admits (ADR 0005 §2's recorded bad outputs).

## Local checks whose result differs from CI's (low priority, not selected)

This repository's checks should give CI's result however they are run
locally: directly or through `scripts/test.sh`, from any directory, under the
host's shell and environment, and with the focused proof a change selects. Each
finding below is a local run whose result differed from CI's. Two earlier
members of this family were resolved one at a time and are removed above:
DD-114 (runner settings) and DD-166 (host `NODE_ENV`). Their mechanisms
differ from the open findings, so this is not counted as a recurrence.

DD-171's cause matches published ODF-003, tracked in
[DearDough.md](DearDough.md); this group keeps its project facet, the
dashboard's typed import of a skill test fixture.

### DD-162 — A shell check run directly failed locally because its substitute host resolved macOS Bash 3.2

`tests/README.md` requires Bash 5 first on `PATH` and running checks through
`scripts/test.sh`, whose guard refuses Bash 3.2. A direct
`/opt/homebrew/bin/bash tests/git-publication-native.sh` bypassed that guard;
its substitute `claude` host (`#!/usr/bin/env bash`) resolved `/bin/bash` 3.2
and aborted on an empty-array expansion under `set -u`.

#### Occurrences

- Execution: `SEED-008#same-machine-merge-queue` / plan 140, first related implementation commit `9597bf61`
  - Timestamp: unknown (slice 1 return, before `9597bf61` at 2026-09-28T12:45:56+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: slice 1 return reported `substitute claude one-shot-result exited 1 … stream-status: missing`, identical at claim `5a5087c6`; `native-agent-one-shot.sh` line 35 `named[@]: unbound variable` under `/bin/bash`; `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/git-publication-native.sh` passed.
  - Observed effect: one diagnosis agent (about 66k tokens) spent on a failure CI never had.
  - Inference: Qualified. The coordinator's delegation prompt prescribed the direct absolute-Bash run; later prompts named `scripts/test.sh` with Homebrew Bash first on `PATH` and saw no recurrence.

### DD-168 — A CI-mailbox test fails when run from `src/skills`, passing only from the repository root

`ci-mailbox-complete-unresolved-cases.mjs:180` ("unconfirmed shutdown names the
limitation…") builds its mailbox with `root: process.cwd()`, so running it from
another directory reports "CI mailbox belongs to another checkout".

#### Occurrences

- Execution: `SEED-008#durable-workspace-creation-fact` / plan 147, first related implementation commit `cb066559`
  - Timestamp: unknown (slice 1 refactor pass, before `cb066559` at 2026-09-29)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: slice 1 refactor report: fails on every run from `src/skills`, 23/23 from the checkout root; slice 1's delegated proof command was phrased "from `src/skills`".
  - Observed effect: no delivery impact; a focused run from `src/skills` would show a false failure.
  - Inference: Qualified. Deriving the root from the test file's location would give the same result from any directory, as CI does.
- Execution: `SEED-052#card-session-residue` / plan 160, first related implementation commit `26099a6a`
  - Timestamp: unknown (CI repair refactor pass before `4e0b2420` at 2026-09-29T20:04:43+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: refactor report: `node --test ci-mailbox-complete.test.mjs` from `scripts/` fails an unresolved case with "belongs to another checkout"; the retrospective reviewer saw the same; both passed from the root.
  - Observed effect: no delivery impact; two agents spent a run confirming the directory dependence.

### DD-178 — The dashboard Playwright suite resolves its repository root from the working directory, and a run elsewhere leaves a build that breaks lint

`dashboard/tests/support/dashboardServer.ts:32` and
`support/fixtureExecutable.ts:12` take the repository root from
`process.cwd()`. A run from `dashboard/tests` fails with ENOENT on the fake
`gh`/`claude`, and its global setup has already built the app into
`dashboard/tests/dashboard/dist`, which `.gitignore` hides but `npm run format`
lints (4,779 `no-undef` errors).

#### Occurrences

- Execution: `SEED-052#keep-story-session-links` / plan 157, first related implementation commit `30bdc002`
  - Timestamp: unknown (slice 2 implementation, before `08f217af` at 2026-09-29T17:35:57+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: slice 2 implementer's report ("runs from `dashboard/tests` fail with ENOENT"); the coordinator's formatter failed on `dashboard/tests/dashboard/dist/assets/index-D2jPgcZa.js` and passed after removing that directory.
  - Observed effect: one failed formatter run and a diagnosis; nothing published.
  - Inference: Qualified. Same class as DD-168; deriving the root from the file's location would make every directory behave like CI.

### DD-171 — A Land test-fixture signature change failed only the dashboard's TypeScript check

`dashboard/tests/preparingJourney.ts` imports `landWorktree` from
`src/skills/dough-story-refinement/scripts/dough-land-test-fixtures.mjs`, so the
dashboard's `tsc --build` types that JavaScript fixture from its destructuring
defaults. Slice 1 added a required-looking `identity` parameter; the focused
Node suites passed and only CI's `dashboard` job failed.

#### Occurrences

- Execution: `SEED-008#installed-wrap-up-command` / plan 146, first related implementation commit `aa4fd510`
  - Timestamp: 2026-09-29T09:20:42+08:00 (`aa4fd510`)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: CI run `36507473752` job `dashboard (1/2)`: TS2345 at `preparingJourney.ts(88,38)`; repair `de81cb96` (`identity = undefined`), then `npm run typecheck:dashboard` and `backlog-preparing.spec.ts` passed.
  - Observed effect: one red CI run, a repair stash cycle, and one repair commit.
  - Inference: Qualified. A consumer search limited to `src/skills` misses the dashboard's typed imports; running `npm run typecheck:dashboard` when a shared fixture's signature changes would catch it locally.

### DD-186 — Two timing races passed every local run and failed only under CI's load, each on a trunk-merge revision

A CI mailbox completion confirmed shutdown while its exiting worker showed a
bare `[node]` command, and the dev-mode overview spec counted a second
`commits/main` lookup from StrictMode's aborted first read. Neither reproduced
in unthrottled local runs; each needed an in-run repair.

#### Occurrences

- Execution: `SEED-052#card-session-residue` / plan 160, first related implementation commit `26099a6a`
  - Timestamp: CI failures on `f5f4dce6` (2026-09-29T19:51:19+08:00) and `d83bb839` (2026-09-29T21:56:22+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: runs 36564344723 (`'unknown' !== 'dead'`, repaired in `4e0b2420`) and 36578884226 (`expectPinnedGhCalls` at `catalogProjectRecords.ts:107`, repaired in `bb5ee6a1`); red reproductions needed a stub `process.title` and CDP CPU throttling; 48 local runs under 16 `yes` processes passed.
  - Observed effect: two stash, diagnose, repair, publish, and restore cycles, with slices paused.
  - Inference: Qualified. Timing-sensitive proof here needs a deliberate slow-path reproduction; plain local load did not expose either race.

### DD-187 — A `git log | grep -q` observation under `pipefail` flipped on CI when git lost the race to SIGPIPE

The startup observer read `claim-owned` from `git log --format=%B … | grep -Fq`
in a suite run under `set -euo pipefail`. When `grep -q` matched and exited
while git was still writing, git died of SIGPIPE (141) and `pipefail` turned
the match into `claim-owned: false`. macOS usually let git finish first; the
Ubuntu runner did not.

#### Occurrences

- Execution: `SEED-055#assessor-counterexample-discipline` / plan 165, first related implementation commit `84b4f28f`
  - Timestamp: 2026-09-29T15:40:33Z (CI failure on `00cc1b62`)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: CI run 36591803631 `test (1/2)`: `FAIL: counterexample command-only (signal setup-marker) changes signals remote-claim, setup-marker (fields claim-owned, …)`; local `tests/git-publication-native.sh` passed. A repro with one extra commit under the claim gave `claim-owned: false` with `PIPESTATUS` `141 0`. Repaired in `66f96e34`; slice 7 (`abf2fc4f`) fixed three more observer derivations of the same shape.
  - Observed effect: one CI repair cycle (pause, stash, diagnosis agent, refactor pass, publication) during slice 6.
  - Inference: Qualified. A different mechanism from DD-186's load-dependent races. The new counterexample helper made the flip visible: it refuses a case whose change spans two signals, where the old primitive only checked the verdict. Other `producer | grep -q` pipelines under `pipefail` remain in `tests/support/product-backlog-native-use.sh` and `tests/helpers/product-backlog-payload-runtime.bash`.

## Native host runs and observations routed through the developer (low priority, not selected)

Paid native runs are manual-only in this repository (`tests/README.md`). Plans
and coordinators have then sent to the developer runs or observations the agent
could start itself, or whose approval did not reach the host's permission check.

### DD-161 — The developer's approval of paid runs did not let the coordinator start them

Paid native runs are manual-only and need the developer's go-ahead. On Claude
Code in auto mode, the host's permission check refused the coordinator's
native run after the developer approved all planned runs. The developer then
had to request the run explicitly.

#### Occurrences

- Execution: `SEED-028#native-one-shot-escalation` / plan 139, first related implementation commit `23663a21`
  - Timestamp: 2026-09-28 (slice 2 start, after "approve all"); exact time unknown
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision 0466e5ba
  - Evidence: the coordinator conversation: "approve all" → `tests/git-publication-native.sh --native claude` refused by the host's auto-mode classifier as agent creation. Run 1 started once the developer sent the command as a message; run 2 on "run 2".
  - Observed effect: two extra developer round trips before paid runs started.
  - Inference: Qualified. The request for go-ahead could offer the exact command, or the permission rule, the developer can use, instead of assuming approval lets the coordinator launch it.

### DD-169 — A plan handed a read-only `claude attach` probe to the developer, who expected the agent to run it

Plan 150 slice 3 said to ask Terry to run `claude attach` on a finished
session. Asked, he replied "why cannot you just do it by yourself?". The
coordinator then tried it in a pseudo-terminal and auto mode denied it, so
Terry ran it after all.

#### Occurrences

- Execution: `SEED-052#revisit-dashboard-sessions` / plan 150, first related implementation commit `5933bb9178a503409b9574f9b87207cbf5f8fbb5`
  - Timestamp: unknown (slice 3 start, between `29174888` at 2026-09-29T11:30:06+08:00 and `f332b5dd` at 11:44:42+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: plan 150 slice 3 ("Ask Terry to run `claude attach <id>`"); two questions to Terry; auto-mode denial of the pty attempt; recorded answer in plan 150 slice 3 Accepted.
  - Observed effect: two question rounds and one denied command; no delivery impact, since the implementation kept the rule behind one predicate meanwhile.
  - Inference: Qualified. Planning did not say who may run an interactive native-host observation, or whether this session's permissions allow it.

### DD-173 — A plan left a "paid" probe to the developer that the agent could run at no cost

Plan 152 slice 1 said only Terry could run the PTY attach/rename probe because starting a session costs model usage. The executing agent started a background session with no prompt (`claude --bg -n …`, "idle — send a prompt to start"), which runs no model turn, and ran the whole probe itself.

#### Occurrences

- Execution: `SEED-052#interact-with-claude-terminal` / plan 152, first related commit `e8553f8d`
  - Timestamp: 2026-09-29T12:49:01+08:00 (probe record `e8553f8d`)
  - Tool: Claude Code; Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd`
  - Evidence: plan 152 slice 1 as refined in `19c7e82b` versus its recorded observations in `e8553f8d`; the observation also found an unplanned fact (attaching a stopped session wakes it).
  - Observed effect: no developer wait for the probe; the busy-session rename, which does need a model turn, stayed unobserved and bounded by the plan's fallback.
  - Inference: Practice. Planning assumed a cost without checking a zero-cost route for the observation.

## Behavior audits that miss guidance-directed actions (low priority, not selected)

Open Dough's behavior is carried by both scripts and the skill guidance that
directs agents, so an audit of where a behavior happens has to cover both.

### DD-113 — The planning audit of commit paths missed commits made by following guidance

The planning audit listed only the scripts that create agent-authored commits. It missed the merge commit that guidance tells the agent to make in its owned workspace, so a scope promise went unplanned until the retrospective.

#### Occurrences

- Execution: `SEED-047#agent-and-developer-credit` / plan 119, first related implementation commit `01a3e2c`
  - Timestamp: 2026-09-27T07:47:40+08:00 (plan `e023a7f`)
  - Tool: Codex
  - Open Dough release: modified; revision 1b66466; base 0.3.41
  - Evidence: plan 119's PFE names the scripts that create commits (`--author` / `commit-tree`). `publish-the-candidate.md` "Preserve published history" and `product-backlog-git-merge.mjs` `commitAcceptedMerge` still make an agent-authored integration merge without the credit, as merge `199ae44` shows. Correction plan 121.
  - Observed effect: one follow-up correction story. Qualified inference: an audit that greps scripts for commit creation cannot see commits that guidance directs.

## Layout proof that checks arrangement but not usable content (low priority, not selected)

### DD-184 — A layout slice proved where columns sit but not that the page inside them stayed usable

Plan 164 slice 2 added a Sessions sidebar column beside the page and the
terminal. Its accepted proof asserted the columns' order, the sidebar's height
and scrolling, and the narrow overlay, but nothing about the page column's own
content. With the sidebar and terminal open on a 1280px window, the page column
was about 500px while the stages kept three columns (their `@media` rule reads
the window width), so cards were about 100px wide and over 2,000px tall. The
terminal-only split already had the same defect for windows between about 800
and 1,540px.

#### Occurrences

- Execution: `SEED-052#session-sidebar` / plan 164, first related implementation commit `0ebb635d`
  - Timestamp: 2026-09-29T21:19:00+08:00 (slice 2 delivered at `79e2eb9a`); found before slice 4's `fbf80b82` at 2026-09-29T22:01:19+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.47 (this repository's installed copy)
  - Evidence: slice 2's `session-sidebar.spec.ts` layout step (`expectSideBySideInOrder`, `elementFromPoint`); slice 4's implementation return noted the 100px cards while measuring a reveal; the fix made `.page-column` a CSS container (`@container page` in `stages.css`, `banner.css`) and added `expectStagesStacked`, which failed with the container removed.
  - Observed effect: a delivered slice broke card readability whenever both panels were open; it was found by chance one slice later, and fixed there within scope.
  - Inference: Qualified. Layout helpers in `pageLayout.ts` check arrangement and clipping, not whether content in a narrowed region keeps a usable layout; a region that changes width needs a check of what it contains.

## Retention

- Moved from `DearDough.md` at `7ebcb07c`: ODF-060, DD-113, DD-114.
- Recovery: `7ebcb07c:DearDough.md` (ODF-060 before its resolved removal).
- Moved from `DearDough.md` at `d68fcde4` on 2026-09-29: DD-173, DD-175, and
  ODF-096's plans 142 and 146 occurrences as DD-179 (recovery:
  `d68fcde4:DearDough.md`).
- Removed as resolved on 2026-09-29: DD-114, DD-164, DD-166; returned to
  DearDough.md: DD-155, DD-159 (recovery: `d68fcde4:ProjectFindings.md`).
