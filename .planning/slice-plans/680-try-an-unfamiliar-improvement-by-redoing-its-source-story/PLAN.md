# Try an unfamiliar improvement by redoing its source story

**Identity:** SEED-393#try-guidance-improvements-by-redoing-the-source-story
**Source:** [Try an unfamiliar improvement by redoing its source story](../../seeds/SEED-393-test-quality-learning-from-effort-replays.md#try-guidance-improvements-by-redoing-the-source-story)

## Goal and scope

A maintainer gets a first, bounded decision on one guidance hypothesis for
[ODF-361](../../../docs/maintainer/findings/ODF-361.md) from one short native
redo, and the short recipe that produced it in
[Native guidance checks](../../../Distribution/evaluation/guidance-checks.md).
The story section owns the scope, restrictions, limits and key examples; this
plan adds none.

Included: the recipe section, one scratch redo of the plan 451 refactor pass
under the candidate wording, its reading, the follow-up note on ODF-361,
scratch removal, and, when the recipe is kept, its one-sentence trigger in
finding triage.

Excluded: a second arm, host or session; a script, assessor or case; adopting
the candidate wording in `Distribution/src/skills`; any product or test change.

## Existing solution and direction

PFE result: nothing is added to the product or the evaluation tooling. The
recipe reuses the guide's [procedure](../../../Distribution/evaluation/guidance-checks.md#procedure)
wording and the scratch construction plan 668 used (bare local remote, patch
committed into installed copies, `codex exec --json`), recoverable at
`fbfaa116b:.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/execution-context.md`.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) §4–5 and
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
already govern the basis, pinning, judgment and cleanup. No North Star topic
applies.

## Outside-in proof

| Key example | Signal |
| --- | --- |
| Basis stated before the run | Slice 1: this plan's `## Basis` section is committed before the session's first native timestamp |
| Moment reached, normal wrapping → keep within context | Slice 3: the session's refactor return or commands show it read the file-size check with the document at 253 lines; the final document's line count, its added lines over 80 characters, and a word comparison of the new paragraph, quoted in the ODF-361 note |
| Moment not reached → inconclusive | Slices 2–3: the note records how far the session got and the starting state that would reach the moment; no second session exists |
| Lines joined under the candidate → revise or drop | Slice 3: the same three document readings show joined lines; the note carries the verdict |
| Mismatches named | Slices 1 and 3: the basis lists host, model, effort, release and task differences; the note says which reading each limits |
| Session stops with a question | Slices 2–3: the quoted question in the note; no message sent after launch |
| Recipe outgrows the run | Slice 4: the recipe is shortened to what the run needed, or withdrawn with the reason in the note |
| Triage offers a kept recipe only to fitting findings | Slice 5: behavior review of the triage sentence walked on ODF-361 (offered) and on a finding answered by a deterministic check (not offered) |
| Nothing published by the redo | Slice 2: `git -C <scratch> remote -v` lists only the bare repository; `git ls-remote origin` here is unchanged across the session |

## Premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The pre-refactor state of plan 451's slice 1 is reconstructable from commits | Slice 2 scratch construction | 2026-11-17, this workspace: `git show 7466db352^:docs/project-visibility-requirements.md \| wc -l` → 247; `7466db352` adds one paragraph on two physical lines (186 and 206 characters) plus a blank line; `fold -s -w 80` of those two lines → 5 lines, so the normally wrapped document is 253 lines, the size ODF-361 records before the refactor reflowed it to 250 | Settled: apply `7466db352`'s diff uncommitted on `7466db352^` with that paragraph wrapped at 80 |
| The historical revision's hosts read installed copies holding the limit sentence | Slice 2 candidate commit | `git show 7466db352^:.agents/skills/dough-post-change-refactor/references/refactor-checks.md` (and `.claude/skills/…`) line 128: "Shorten or split every checked file exceeding **250 lines**"; installed `VERSION` 0.3.81 | Settled: the candidate edits that sentence in both installed copies |
| The redo document's long lines are readable against a baseline | Slice 3 reading | `7466db352^` version already has 27 lines over 80 characters (tables and links) | Settled: the reading compares added or changed lines only, not the whole file |
| Codex starts in a scratch clone with a local bare remote | Slice 2 launch | Retained: plan 668 slice 1, 2026-11-16, Codex CLI 0.169.0 at 0.3.102 skills started and delegated; `codex --version` today → 0.169.0 | Proxy: 0.3.81 skills and a `$dough-post-change-refactor` start are unobserved; only the paid launch settles it, so slice 2 is the probe |

## Slices

Each slice targets 15 active minutes; the session's own run time is command
time.

### 1. The recipe and this redo's basis exist before any session
Type: Behavior
Status: planned

Behavior: a maintainer with a finding no case covers opens Native guidance
checks → a short section after Procedure gives the seven recipe steps the
story records, and this plan gains a `## Basis` section for ODF-361: intended
gain (a file over the limit is shortened by content, with normal wrapping),
criteria (final document at most 250 lines; no added or changed prose line
over 80 characters; the new paragraph's words reduced or moved, not only
reflowed; the return does not call a reflow shortening), wrong outcome (lines
joined to meet the count), the moment (the session checks file size with the
document at 253 lines), the baseline (ODF-361's two recorded occurrences,
unchanged) and the known mismatches (redo on Codex today's defaults against a
Codex run of unrecorded model and effort at 0.3.81; a direct
`$dough-post-change-refactor` start against the original delegated brief,
which is not recoverable; single run).

Proof: the behavior review of
[author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review)
walked on the section for ODF-361; `npm run --silent format` and
`npm run lint -- --staged` clean.

### 2. One fresh Codex session starts on the pinned state under the candidate wording
Type: Behavior
Status: planned

Behavior: `~/open-dough-scratch/seed-393-odf-361/` holds a bare repository
with `main` at `7466db352^` plus one commit that states, in both installed
copies of `refactor-checks.md`, that the limit counts normally wrapped lines,
and a clone whose working tree carries `7466db352`'s diff uncommitted with the
new paragraph wrapped at 80 → `codex exec --json` from the clone with
`$dough-post-change-refactor` and one added line (`Local only: publish
nothing.`) runs once under a 30-minute deadline with nothing sent afterwards,
and its JSON stream is kept beside the clone.

Proof: before launch, `wc -l` of the document → 253 and `git status --short`
lists the 19 paths of `7466db352`; the nothing-published row above; the
stream's first event carries the effective model and effort.

Probe: when Codex refuses the start, stops before reading the file-size
check, or reaches the deadline, record the quoted stop and continue to slice
3 with an inconclusive reading. Do not relaunch.

This session is the story's one paid run, authorized by the execution
instruction; it is started by hand in this slice and by no test command. Keep
the machine awake on AC power with `caffeinate -s -i`
([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)).

### 3. ODF-361 carries the verdict and the case decision
Type: Behavior
Status: planned

Behavior: the finished or stopped session exists → ODF-361's follow-up note
states whether the moment was reached, the three document readings against
the basis, keep, revise, drop or inconclusive with the missing evidence, which
mismatch limits which reading, and separately whether extracting a case is
worthwhile and why.

Proof: the note's readings are reproduced by `wc -l`, an `awk 'length>80'`
over `git diff` added lines, and a word-level `git diff --word-diff` of the
paragraph in the scratch clone; the quoted return or stop is found in the
kept stream.

### 4. The recipe says what the run needed and the scratch is gone
Type: Behavior
Status: planned

Behavior: the note is written → the recipe section is corrected to the steps
and commands the run actually needed, or withdrawn with its reason in the
note when setup and reading outgrew the run; the scratch directory and stream
are removed.

Proof: `ls ~/open-dough-scratch/seed-393-odf-361` fails; the section's
commands match those recorded in slices 2–3; `npm run --silent format` and
`npm run lint -- --staged` clean.

### 5. Finding triage offers the kept recipe where it applies
Type: Behavior
Status: planned

Behavior: slice 4 kept the recipe → a maintainer triaging a finding whose
recommended response changes guidance wording, with no case exercising its
moment, sees the proposal's next step offer the redo with the recipe link; a
finding answered by a deterministic check or covered by a case gets no
mention. When slice 4 withdrew the recipe, this slice is skipped and the
return says so.

Proof: the behavior review of
[author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review)
walked on the edited
[Rank and propose](../../../.agents/skills/triage-retrospective-findings/SKILL.md#rank-and-propose)
section for both cases above; `npm run --silent format` and
`npm run lint -- --staged` clean.

## Current decisions

- Target ODF-361, host Codex, source occurrence plan 451 (the shorter phase
  with a reconstructable start). Terry may name another finding or host before
  Take; that replans slices 1–3.
- Keep from this one run is a predicted benefit; adopting the wording is the
  finding's ordinary follow-up.
- The session receives no finding text, prior outcome or purpose.

## Learnings

None yet.

## Preparation review

Slice-plan refinement was not needed: five slices, one outcome and proof loop
each. One premise stays open and is bounded by slice 2's probe: Codex starting
`$dough-post-change-refactor` on 0.3.81 skills in the scratch clone. No other
slice-specific concern remains from this review.

## Verification and delivery

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written; a failure inside the scratch session is recorded, not repaired
from outside. The change is maintainer documentation, one maintainer-skill sentence and one
finding note:
the local gate is the formatter and staged lint named in the slices, on AC
power under `caffeinate -s -i` for slice 2's wait
([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)).
