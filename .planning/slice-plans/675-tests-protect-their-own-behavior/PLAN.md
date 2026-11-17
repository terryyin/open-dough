# Tests protect their own behavior without incidental coupling

**Source:** [selected story](../../seeds/SEED-393-test-quality-learning-from-effort-replays.md#tests-ignore-unrelated-launch-changes-without-losing-proof)
**Identity:** SEED-393#tests-ignore-unrelated-launch-changes-without-losing-proof

## Goal and scope

The story section owns the goal, investigated basis, direction, scope, limits,
key examples and the five redo criteria; this plan adds none. In short:
replace the refactor-check words that let a test's subject follow its file,
header or plan row, so an added promise gets its own test and an edited
case-branching body is split; then one blind Claude Code redo of the frozen
effort execution is judged against frozen A.

Exclusions carried from the source: consumer reach (story 2), planning-side
proof placement, a perturbation step in the guidance, the delivery brief's
counting clause and repairs to today's product tests. A no-wording-change
result remains available if slice 1's review shows the edit adds nothing.

## Existing solution and direction

PFE: the capability exists and is changed in place.
[Refactor checks](../../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md)
own the test-focus rules (“Write observable cases” and “Shotgun surgery”);
[test optimization tactics](../../../Distribution/src/skills/dough-test-optimization/references/optimization-tactics.md)
link to them and need no change. The redo reuses the SEED-391 construction at
`fbfaa116b:.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/`
and the retained inputs in `/Users/terryyin/open-dough-scratch/seed-391/retained/`
(`replays.bundle`, `b-claude-prompt.txt`, `b-claude-launch.json`).

[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
§3: one home for the rule. [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md):
clients receive it through a later release.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): the
redo is native acceptance of one candidate, not a host comparison.
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md):
criteria are fixed in the source before the run. No North Star topic applies.

## Current decisions

- Edit only `Distribution/src/skills`; installed copies under `.agents/` and
  `.claude/` change only through a release
  ([skill authoring](../../../.agents/skills/author-open-dough-skills/SKILL.md)).
- Replace words before adding any; net growth stays a sentence or two. Each
  edit traces to a key example; an example the current text already settles
  gets no new words. No example code is added unless a key example stays
  ambiguous without it.
- The redo is a paid native run: Terry triggers it manually (or authorizes
  it in the session); no automated or repeated case is added. Host: Claude
  Code 2.1.326 at Opus/medium, the frozen Claude B settings, confirmed from
  native metadata.
- Redo input mirrors frozen Claude B: start `c629d0d93` (A's Take plus
  `934a51a30`) with this story's guidance diff applied to both installed
  roots, plan 664 as A left it, the retained `b-claude-prompt.txt` (local bare
  remote, local-only, `--skip-retro`, stop at the execution-complete record).
  The participant receives no prior outcome, this story's text or criteria.
- A, frozen Codex B and frozen Claude B are never rerun or changed. Story 2's
  Codex redo is a separate run; the two redos are not composed.

## Proof ownership

| Promise (source scope / example) | Owning slice and observable proof |
| --- | --- |
| An added promise gets its own test; neighbours keep their subject (ex. 1, 2) | 1: edited sentence walked over the frozen Claude B feedback and status diffs; 3: redo test names and assertions for the feedback launch effort and the status phrase (criterion 1) |
| A test's subject is its own name, not its file or header (ex. 3, 4) | 1: edited sentence walked over the model-boundary chosen-model cases; 3: redo chosen-model, naming and blank-input cases (criterion 2) and the perturbation counterexample (criterion 4) |
| Edited case-branching bodies are split; unedited ones are residue (ex. 5) | 1: existing branching sentence checked against the Cancel/Escape loop, edited only if it does not already settle it; 3: criterion 3 |
| Strict owner and positive witnesses stay (ex. 6) | 1: existing owner/witness sentences unchanged; 3: the redo's first launch-boundary case and absence witnesses inspected |
| Loosened tests still fail for their own defects | 3: one deliberate fault per loosened family in a scratch copy of the redo (criterion 4) |
| Judgment against frozen A with residue named | 3: `## Result` of this plan (criterion 5) |

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| The current guidance is the guidance the frozen B ran | Slice 1 edits current text; slice 3 attributes differences to the edit | `git log -- Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md` at `e7cba86a8`: last change `934a51a30`, the trial patch. |
| Default perturbation discriminates incidental literal copies from owners | Slice 3 criterion 4 | 2026-11-17, scratch worktree of `d8efcf6fb` (frozen Claude B product/test), integration `node_modules` linked (package files unchanged against integration HEAD), `defaultEffort: "high"` in `dashboard/src/hostDescription.ts`, AC power: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx --no-install playwright test --config dashboard/backend.playwright.config.ts --reporter=list --workers=1 launches/agent-launch-model-boundary.spec.ts -g <title>` per test (the describe is serial) → the three chosen-model cases and the default-effort owner fail; the chosen-effort case passes. Same config over `feedback-maintenance-launch.spec.ts` and `agent-launch-ad-hoc-boundary.spec.ts` → all pass, including the mixed notification test, which reads the configured default. So perturbation detects literal copies but not mixed promises; criterion 1 is settled by inspection. Edit reverted, worktree removed. E2E persistence strings were not run; they copy the literal and are covered by inspection. |
| The redo can be rebuilt from retained evidence | Slice 2 construction | `git bundle list-heads replays.bundle` → `claude-B` `9cd8ee5f2` (fetched and inspected 2026-11-17; `c629d0d93..d8efcf6fb` diffs read). `claude --version` → 2.1.326, the frozen B's CLI per `b-claude-launch.json` (command form `claude --bg --name … --model opus --effort medium <prompt>`). The scratch trust step that frozen B needed is part of slice 2's launch. |

## Concerns

Slice-plan refinement was not needed: one guidance outcome with one review
loop (1), one paid native observation whose launch needs Terry (2), and one
assessment (3). Slice 2's run is long wall time inside the slice clock; its
active setup is small. Slice 2 waits for Terry's trigger; that is the plan's
only developer-operated step and changes no scope. No slice-specific concern
remains.

## Ordered slices

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Local gate per slice: the named checks only. Start fully awake
and wrap the redo and any E2E run on AC power in `caffeinate -s -i`
([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos));
on battery, stop the redo rather than run it under `-i` alone.

### 1. A test's subject is its own name, and an added promise gets its own test
Type: Behavior
Status: planned
Proof: behavior review of key examples 1–6 against the edited text, quoting
the sentence that settles each and naming the frozen Claude B diff it would
have changed; `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh`;
`npm run --silent format`; `git diff --stat` shows only `refactor-checks.md`
and this plan.

Behavior: an agent refactoring tests after a launch default change → reads
that a test's subject is what its own name promises (not its file, header or
plan row) and that a promise the change adds gets its own test → adds
separate tests for the feedback launch's effort and the status phrase instead
of extending the notification and persistence tests, keeps chosen-model cases
free of the default, and splits an edited case-branching body. Prefer
replacing “Give each test one behavior …” and the shotgun-surgery
“Acceptable extra touchpoints …” sentences over adding a paragraph.

### 2. A blind Claude Code redo executes the effort plan under the changed guidance
Type: Behavior
Status: planned
Proof: launch record (command, cwd, prompt path, CLI version, effective
model/effort from native metadata, power/load, start/end, exit) and the
redo's head; `git -C <redo> diff --stat c629d0d93 <redo start>` lists only
the installed guidance files; the real `origin` refs are unchanged.

Behavior: Terry triggers the prepared launch script (one short path) →
Claude Code executes plan 664 from the rebuilt start in a scratch clone
under `~/open-dough-scratch/seed-393/tests-focus/` with only a local bare
remote → it stops at its execution-complete record or a recorded stop, and
that stop is retained rather than coached. Before launch, confirm Terry's
trigger, AC power and that no other paid run (such as story 2's redo)
competes.

### 3. The redo is judged against frozen A, with residue named
Type: Behavior
Status: planned
Proof: `## Result` quoting, for each of the source's five criteria, the
redo's test names and assertions or command and result, met, missed or not
exercised; the perturbation run (default `high`, backend `launches/` per
test where a describe is serial) and one deliberate fault per loosened
family, each reverted; residue and unverified scope listed.

Behavior: the redo's checkout and transcript → inspected against frozen A
(and frozen Claude B as context) → keep, revise or drop for the slice 1 edit,
or inconclusive with the missing evidence. One run isolates no guidance
effect; disclose host, CLI and context differences and effort only as
secondary evidence.
