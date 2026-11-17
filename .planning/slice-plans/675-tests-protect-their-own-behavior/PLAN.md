# Tests protect their own behavior without incidental coupling

**Source:** [selected story](../../seeds/SEED-393-test-quality-learning-from-effort-replays.md#tests-ignore-unrelated-launch-changes-without-losing-proof)
**Source review:** [independent source promises](source-review.md)
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
and recovers its inputs from Git and the frozen transcripts; the earlier
scratch copies under `~/open-dough-scratch/seed-391/` are gone.

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
  roots, plan 664 as A left it, and frozen Claude B's exact first message
  (transcript `a46d7c72-ae04-4349-b60f-6f3f85545033`: `--skip-retro`,
  local-only, stop at the execution-complete record) with only its workspace
  path changed to the new clone, whose sole remote is a local bare repository.
  The participant receives no prior outcome, this story's text or criteria.
- A, frozen Codex B and frozen Claude B are never rerun or changed. The
  redo start carries only this story's guidance diff on top of `934a51a30`,
  not the delivered consumer-reach guidance, so the two are not composed.

## Execution context

Established execution: Julia-chan, publisher
`dashboard-territory.local-open-dough`, Story Branch Mode, owned workspace
`/Users/terryyin/git/open-dough/.worktrees/tests-protect-their-own-behavior-without-inciden`,
branch `codex/tests-protect-their-own-behavior-without-inciden`.
Starting revision `4eb4f8e594ee003a2894c28c8ab2600e1c42b835`;
published claim and initial candidate
`c35afa491790aa019d47efef8f3e376fa8ba94fa` accepted on `origin/main`.
Ordinary increments publish to the same branch on `origin`; no trunk landing
is selected. The claim’s trunk CI is unobserved by this execution.
The originating/integration checkout is `/Users/terryyin/git/open-dough`;
its state is not a prerequisite for this owned-worktree execution.
Checkout setup: `PATH=/opt/homebrew/bin:$PATH npm ci` with unchanged
`package-lock.json`, then `PATH=/opt/homebrew/bin:$PATH npm run --silent lint`
passed on 2026-11-17.
CI: GitHub Actions `terryyin/open-dough`, verified workflow `ci.yml` (CI,
351271804), execution branch target above. Codex yielded stream:
coordinator `julia-tests-focus`, directory `/tmp/dough-ci-501/watch-yGKWFz`,
PID 1471, session 62472, cell `g756:18`, checkout as above; runtime is this
checkout’s `.agents/skills/dough-execute-plan`. No other observer is owned.
Replanning: preserve the existing plan’s planning authority; no override.

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
| The redo can be rebuilt from Git and the frozen transcripts | Slice 2 construction | Re-observed 2026-11-17 at `74cc07039`: the scratch `retained/` directory is gone; `git cat-file -t` → commit for `c629d0d93` (start), `d8efcf6fb` (Claude B product/test cutoff) and `9cd8ee5f2` (Claude B head) in this repository; transcript `a46d7c72-…` first user message holds the exact frozen B instruction; the construction and command form `claude --bg --name … --model opus --effort medium <prompt>` are recorded at `fbfaa116b:.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/` (`execution-context.md`, `execution-observations.md`, `claude-comparison.md`). `claude --version` → 2.1.326, frozen B's CLI. The new clone's Claude trust step is part of slice 2's launch. |

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
Status: done
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
trigger, AC power and that no other paid run competes.

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

## Current continuation boundary

Slice 1 published `c9b39e4b8300ec00a9cff1b95b659d44d8a22209` to
`origin/codex/tests-protect-their-own-behavior-without-inciden`, based on the
claim. Slice 2 preparation is retained in [redo launch evidence](redo-launch.md).
Its clock is paused at 8.2 active minutes (6.8 remain). Slice 2 is not done.
Records-only progress disposition: this continuation record and launch evidence
change no product, tests or skill guidance; accepted slice-1 proof is unchanged.

The recovered exact first user message includes nested Python targeting old
`seed-391/b`, writing its receipt and launching another paid Claude session.
This invalidates the assumption that the exact message is a task-only replay
input. Exact evidence is preserved; a code-block-only removal is prepared but
unselected. **Awaiting story review:** the proof/evaluation input needs Terry’s
decision before amending the exact-input condition or launching. No paid run,
trust change, native guard or participant message has occurred. Native trust
and the no-competing-paid-run condition also remain unmet. No independent
remaining authorized work can settle the redo assessment before this decision.
Incoming trunk at `fc5bfc051` adds preparation for other stories; no named
sibling behavior affects this slice’s historical clone or accepted proof.

## Slice 1 accepted evidence

Frozen B inspected at `c629d0d93..d8efcf6fb`; candidate wording is the
uncommitted source diff over the claim. Each source key example maps below.

| Example | Settling instruction and observation |
| --- | --- |
| 1, feedback | “Give a promise the change adds its own test … do not add it to another behavior’s test or widen that test’s name or header.” Rejects the added effort assertion/header in `feedback-maintenance-launch.spec.ts`’s attention-report notification case. |
| 2, status | Same sentence requires a status-effort case instead of three complete effort strings in `system-settings-feedback-maintenance.spec.ts`’s persistence/privacy/reload case. |
| 3, model | “Its subject is what its own name promises, not its file, header or plan row” and “observe that part” reject medium, length 7 and effort fields in chosen-model cases of `agent-launch-model-boundary.spec.ts`. |
| 4, blank input | Same subject/partial-output rule preserves the actual argv reader’s absent-instruction assertion in `agent-launch-ad-hoc-boundary.spec.ts`; frozen B already did this correctly, so no extra instruction was added. |
| 5, branches | Existing “A body that branches on its case parameter holds separate tests” already requires splitting edited Cancel/Escape cases. Older unedited display loop is residue, not new scope. |
| 6, owners/witnesses | Existing whole-shape/default owner and positive-distinguishing/absence sentences are unchanged; the first launch-boundary case keeps complete argv. |

`node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log
/tmp/seed393-slice1-proof.log --exit-file /tmp/seed393-slice1-proof.exit -- env
PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
Distribution/tests/installation/payload-declaration-links.sh` passed, exit 0.
Setup: existing payload declaration and mutation copies; observing signal:
`check_declared_links` plus undeclared-target rejection checks. This proves
payload link structure, not agent behavior. No test source changed.
Consumer trace: `/tmp/seed393-slice1-consumer-trace.md`; source skill and
test-optimization entry links retain the single home; installed copies await
release; incidental phrase matches and frozen command fixtures do not consume
changed text. Invocation and required project inputs remain unchanged.
Source freshness: unchanged at trunk `3ecf64459`; incoming FollowUpBuilder
and story-5 environment preparation do not affect this slice or a named
coordination sibling’s behavior. Independent refactor `/root/refactor_slice1`:
`## REFACTOR COMPLETE`, none — already clean; no edits, unchanged proof reused,
`git diff --check` passed. Slice clock paused at 3.3 active minutes.
Improved agent application remains unverified and owned by slices 2–3.

## Story obligations

### G1. Blind redo awaits input decision and paid-run trigger
Reported: slice 2 — "No paid native launch occurred; exact frozen input contains nested launcher code targeting frozen B’s old path. The proposed task-only prompt is unselected; native trust and no-competing-paid-run checks also remain unmet."
Story clause: "The guidance change is judged by a fresh B redo of the frozen effort execution against frozen A."
Disposition: return
