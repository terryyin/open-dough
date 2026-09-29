# Name the feature that runs moved seeding

## Source and authority

- **Identity:** SEED-044#name-the-feature-that-runs-moved-seeding.
- **Source:** [story](../../seeds/SEED-044-verify-planning-premises.md#name-the-feature-that-runs-moved-seeding),
  refined in this preparation. The story's Goal, Scope, and key examples apply
  unchanged.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.
- **Preparation workspace:** `.worktrees/name-the-feature-that-runs-moved-seeding`
  (branch `cursor/name-the-feature-that-runs-moved-seeding`), created at
  `214e5a38` and announced as agent Yuma-chan at `616a8aa2`.

## Execution

Story Branch Mode. Owned workspace
`/Users/terryyin/git/open-dough/.worktrees/name-the-feature-that-runs-moved-seeding`,
branch `cursor/name-the-feature-that-runs-moved-seeding`, created for this
execution. Originating and integration checkout:
`/Users/terryyin/git/open-dough`. Published claim `26677a2854b01eb4b768c35ebd4d508fcd678a1c`
on `origin/main` (starting revision `5a1c01e75f35855f4336b4109e269d541a759216`).
Agent Ai-chan. The claim's trunk CI is unobserved: Story Branch observation
covers the remote execution branch at increment delivery. Setup: `npm ci`, then
`npm run lint` passed in this workspace.

## Goal and scope

A maintainer accepting premise-verification guidance gets one Cursor
planning-only plan, for the recorded Pygardon seeding move, that names a
feature which actually runs the seeding script and records that observation.

Change the existing premise rule in
`src/skills/dough-slice-planning/SKILL.md` ("Write the plan"). That rule
already says a claim that a named proof exercises a behavior is observed by
searching for the tests and callers of what changes. Tighten it so the plan
names a caller that runs the moved behavior and records that observation. A
test of the moved unit that does not run the behavior does not settle the
claim. Keep one rule for any moved behavior. Do not add a Pygardon-only
recognizer, a second skill, or a parallel paragraph.

[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
still applies: the sentence speaks to the agent planning the project in front
of it. [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
still applies: the Cursor run is this change's evidence.

Excluded:

- Hand-editing installed copies under `.agents/skills/` or `.claude/skills/`
  (AGENTS.md). A released payload updates those.
- A wording test, a new native harness, or adding the run to `npm test`,
  `scripts/test.sh`, CI, or a wrapper whose default calls a real host.
- Re-running Doughnut, the Open Dough control, Claude Code, or Codex.
- Another run of unchanged guidance `0.3.46`. The recorded plan 208 fail is
  that baseline.
- Editing `record-preparation.md`. Its readiness criteria already take the
  definition of a decisive premise and its observation from slice planning.

## Current decisions

- One guidance file. Proudly Found Elsewhere: the responsibility already lives
  in the slice-planning premise paragraph. Change that paragraph.
- Slice 1 is useful on its own. Slice 2 is the one Cursor check of the changed
  guidance. A fail there stops for a human guidance decision.
- After plan 179 failed, Terry authorized one further edit of the same
  paragraph. A move must name a script, feature, command, or route that
  reaches the moved function, and a test that imports or calls the unit does
  not settle the claim while that entry exists. This decision does not
  authorize another Cursor run.
- The Cursor run is manually triggered and needs Terry's go-ahead. It is not
  a local gate for the guidance edit.
- No North Star topic. The change follows the two Accepted ADRs above and does
  not set a new product boundary.

## Planning premises observed

Observed 2026-09-29 from this workspace, read-only:

| Premise | Observation | Result |
| --- | --- | --- |
| The rule to change is the slice-planning premise paragraph | Read `src/skills/dough-slice-planning/SKILL.md` around the "named proof exercises a behavior" sentence | It says to search tests and callers. It does not say that a unit test which does not run the moved behavior fails to settle the claim. |
| Readiness already defers that definition | Read `src/skills/dough-product-backlog/references/record-preparation.md` "Criteria" | `ready` requires premises observed or probe-bounded, and defines those premises by link to slice planning. No contradicting sentence. |
| Installed skill copies are not the edit target | Read AGENTS.md "Layout" | Client-payload guidance is edited in `src/skills/<name>/`. |
| Plan 208 is the recoverable baseline | `git cat-file -e aed19fbc:native-results/cursor-premise/plans/pygardon-208.md` | The written plan is in that commit. |
| Pygardon at the parent of `b2ad7c394` has the feature and one script caller | In `/Users/terryyin/git/pygardon`: `git rev-parse b2ad7c394^` then `git grep` and `git ls-tree` | Parent is `546df0d94`. `e2e_test/features/live_strategies.feature` and `strategy_verify.feature` both exist. The only caller of `e2e_test/support/seed_named_genome_live_strategy_pair.py` is `e2e_test/step_definitions/live_strategies_steps.ts:25`. |
| The check can be installed and run on Cursor | `command -v cursor`; `cursor agent --version`; `install.sh` accepts `--platform` | Cursor agent `2026.09.28-64d2043` is on this machine. `install.sh --target <clone> --source <this checkout> --platform cursor` is the same install path the 2026-09-29 run used. |
| The skill file has no wording test | Search of `tests/` for `dough-slice-planning/SKILL` | None. Slice 1 uses the behavior review below, as plan 115 did. |

## Outside-in proof

| Promise | Owner | Proof |
| --- | --- | --- |
| A plan that moves a behavior names a caller that runs it, and a unit test that does not run it does not settle the claim | Slice 1 | Behavior review of the three story examples against the revised sentence |
| One Cursor planning-only plan for the Pygardon case names `live_strategies.feature` or another feature that runs the seeding script, and records that observation | Slice 2 | One manual Cursor run, judged against the story examples |
| Pytest-only proof, or only `strategy_verify.feature`, fails that check | Slice 2 | Same run's written plan |

Slice 1 also runs `npm run lint`, `tests/payload-declaration-links.sh`,
`tests/compare-payload.sh`, and `git diff --check`. Those checks guard the
payload edit. They do not prove planner behavior. Use a modern bash for the
shell checks; macOS system bash masks `set -e` assertion failures.

Keep ordinary post-change refactoring, delivery, CI observation, retrospective,
and wrap-up gates. The Cursor run stays out of those gates.

## Ordered slices

### 1. A moved behavior's proof names the caller that runs it

Type: Behavior
Status: done
Proof: behavior review of the three story examples against the revised
sentence in `src/skills/dough-slice-planning/SKILL.md`, plus the payload
checks in Outside-in proof.

Accepted: the premise paragraph now says that when a moved behavior's proof
depends on an existing caller, the plan names a caller that runs it and
records that observation, and that a test of the moved unit which does not
run that behavior does not settle the claim. Walked against the seeding
feature, pytest-only `gate_baseline_genome`, and `strategy_verify.feature`
when it does not run the script. Guards on that candidate: `npm run lint`,
`/opt/homebrew/bin/bash tests/payload-declaration-links.sh`,
`/opt/homebrew/bin/bash tests/compare-payload.sh`, and `git diff --check`,
all exit 0. Refactor: none — already clean.

Behavior: a planner following the installed guidance meets a move whose proof
depends on an existing caller → the written plan names a caller that runs the
moved behavior and records the observation that it does → a test that only
covers the moved unit, and does not run that behavior, does not settle the
claim.

Edit the existing premise paragraph. Do not add a second rule. Walk these
examples against the sentence before treating the slice as done:

- The Pygardon seeding move → the sentence requires naming a feature that
  runs `seed_named_genome_live_strategy_pair.py`, such as
  `live_strategies.feature`, and recording that observation.
- A plan that proves the same move only with pytest on
  `gate_baseline_genome` → the sentence says that does not settle the claim.
- A plan that cites only `strategy_verify.feature` → the sentence says that
  does not settle the claim when that feature does not run the script.

### 2. Cursor planning names the feature that runs moved seeding

Type: Behavior
Status: done
Proof: one Cursor planning-only run of the changed guidance, judged against
the story's three examples. Record the literal commands, Cursor agent version,
model, verdict, and where the written plan was kept.

Run 2026-09-29, one time, from guidance at `9d4bf02f`. Cursor agent
`2026.09.28-64d2043`. No model was named; the CLI default was used. Disposable
clone `/tmp/open-dough-153-pygardon` at `546df0d94`, origin removed, seed and
backlog restored from `b2ad7c394`, story state reset to `refined` /
`unselected`, then `install.sh --target /tmp/open-dough-153-pygardon --source
/Users/terryyin/git/open-dough/.worktrees/name-the-feature-that-runs-moved-seeding
--platform cursor --force`. Command: `cursor agent --print --force --trust
--sandbox disabled --workspace /tmp/open-dough-153-pygardon` with
`/dough-slice-planning
seeds/SEED-047-tfdc-search-and-verify-simplification.md#story-tfdc-dead-behavior-removal`
and an instruction not to implement, commit, push, or publish. Transcript:
`/tmp/open-dough-153-pygardon-cursor.txt`. Written plan:
`/tmp/open-dough-153-pygardon/.planning/quick/179-tfdc-dead-behavior-removal/PLAN.md`.

Verdict: fail. Slice 10 moves `gate_baseline_genome` and proves it with the
agreement test and genome/search/catalog tests. The plan never names
`live_strategies.feature` or `seed_named_genome_live_strategy_pair.py`.
Stopped for a human guidance decision. Terry then authorized the paragraph
edit recorded above. Another Cursor run is not part of that decision.

Behavior: a disposable Pygardon clone at `546df0d94` (parent of `b2ad7c394`),
`origin` removed, seed and backlog restored from `b2ad7c394` with the story
state reset to `refined` / `unselected`, guidance installed from this checkout
with `install.sh --target <clone> --source <this checkout> --platform cursor
--force` → one `cursor agent --print --force --trust --sandbox disabled`
planning-only run of `SEED-047#story-tfdc-dead-behavior-removal`, told not to
implement, commit, push, or publish → the written plan names
`live_strategies.feature` or another feature that runs
`e2e_test/support/seed_named_genome_live_strategy_pair.py`, and records that
observation.

A written plan that proves the move only with pytest, or only with
`strategy_verify.feature`, fails. The failed run stopped for a human guidance
decision. The authorized follow-up is the premise-paragraph edit, not another
run of this case.

Retest of that edit, one Cursor planning run on the same disposable clone
after reinstalling guidance from `aa650875`. Command: `cursor agent --print
--force --trust --sandbox disabled --workspace /tmp/open-dough-153-pygardon`
with the same planning-only prompt. Cursor agent `2026.09.28-64d2043`. No
model named. Transcript: `/tmp/open-dough-153-pygardon-cursor-2.txt`. Written
plan: `/tmp/open-dough-153-pygardon/.planning/quick/179-tfdc-dead-behavior-removal/PLAN.md`
(commit `6a99b2e9b` in that clone held the new sentence).

The plan records that `gate_baseline_genome` is imported from tests and from
`e2e_test/support/seed_named_genome_live_strategy_pair.py`, and slice 6
updates that script. It does not name `live_strategies.feature`. The slice
proof command is still pytest. Against the edited sentence, the script entry
is named. Against the story's pass line, which asks for a feature that runs
that script, the feature is still absent.

Feature-chain retest, one Cursor planning run after the sentence was changed
to require the feature whose steps run the script. Same clone, story reset to
`refined` / `unselected`, guidance reinstalled from the execution checkout
before that sentence was committed. Command: `cursor agent --print --force
--trust --sandbox disabled --workspace /tmp/open-dough-153-pygardon` with the
same planning-only prompt. Cursor agent `2026.09.28-64d2043`. No model named.
Transcript: `/tmp/open-dough-153-pygardon-cursor-3.txt`. Written plan:
`/tmp/open-dough-153-pygardon/.planning/quick/179-tfdc-dead-behavior-removal/PLAN.md`.

Verdict: fail. The plan says `gate_baseline_genome` is imported from `tests/`
and `e2e_test/support/seed_named_genome_live_strategy_pair.py`. It does not
name `live_strategies.feature` or `live_strategies_steps.ts`. Slice 6's proof
is agreement and importing suites green.

Cursor model check of that same sentence. One run with `cursor agent --print
--force --trust --sandbox disabled --model claude-opus-5-5-high` and the same
planning-only prompt. Cursor agent `2026.09.28-64d2043`. Transcript:
`/tmp/open-dough-153-pygardon-cursor-opus.txt`. Written plan:
`/tmp/open-dough-153-pygardon/.planning/quick/208-tfdc-dead-behavior-removal/PLAN.md`.

Verdict: pass. The plan records that the step `named genome {string} has a
linked live strategy {string}` runs
`seed_named_genome_live_strategy_pair.py`, which imports
`gate_baseline_genome`, and that the step is used by `live_strategies.feature`
"Saved list pairs live strategy with named genome by id". Slice 13's proof
runs that feature scenario, not pytest alone. The earlier misses used Cursor's
default model.

Needs Terry's go-ahead before the paid run. Add the run to no automated suite.
