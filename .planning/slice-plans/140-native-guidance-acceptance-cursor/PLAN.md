# Plan 140: Accept existing guidance natively on Cursor

## Source

- Story: [Accept existing guidance natively on Cursor](../../seeds/SEED-053-native-guidance-acceptance.md#native-acceptance-cursor)
- Identity: SEED-028#native-one-shot-other-hosts

## Goal and scope

Maintainers hold Cursor-native evidence for the shared premise-verification
cases and for the one-shot cases already accepted on Claude Code, including
escalation, so those behaviors may be claimed as accepted on Cursor under
ADR 0005.

Included: paid Cursor runs of the three premise cases (hand procedure with
`--platform cursor`) and of `publication/one-shot-result`,
`publication/one-shot-queued`, `publication/admission-investigation`, and
`publication/one-shot-escalation` via the existing publication native harness;
recording pass evidence (or a human handoff on fail) in SEED-053. Claude Code
passed escalation against guidance revision `23563ee0` on 2026-09-28; the exit
was not taken.

Excluded: new fixtures, cases, or guidance changes; Codex and Claude Code
acceptance work; CI / `npm test` / default wrappers that call a real host;
statistics or repeated runs beyond the story's one-run-per-case bound; inventing
Doughnut or Pygardon clone sources when they cannot be located.

Assumptions: paid native runs are manually triggered only and each needs
Terry's explicit go-ahead at execution time. A failed run reports a guidance
defect for a separate decision; it is not fixed here. Unrelated releases may
continue; Cursor-native acceptance claims for these paths require this
evidence.

## PFE

Responsibility: obtain Cursor-native acceptance evidence for already-delivered
premise-verification and one-shot guidance.

Reuse: `tests/git-publication-native.sh --native cursor` (and its substitute
suite) already owns one-shot and admission-investigation journeys; plan 115's
disposable-clone recipe (recoverable at
`874f9a8:.planning/slice-plans/115-verify-planning-premises/PLAN.md`) owns
premise-verification acceptance without a maintained harness. No new product
solution; no new harness justified by this acceptance-only story.

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Cursor agents pass the four Claude-accepted one-shot cases | 1 | Retained `--results-dir` observations from `tests/git-publication-native.sh --native cursor --case publication/one-shot-result\|one-shot-queued\|admission-investigation\|one-shot-escalation`, each assessed pass by the existing harness assessor; SEED-053 Cursor story records guidance revision and date |
| Cursor planners catch the recorded false premises and keep the control proportionate | 2 | Three disposable-clone planning-only Cursor runs judged against the shared premise table in SEED-053; Cursor story records revision, date, and per-case verdict |

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Publication harness selects the four one-shot cases by name for Cursor | `rg -n 'one-shot-result\|one-shot-queued\|one-shot-escalation\|admission-investigation' tests/support/git-publication-native-host.sh` | All four are listed in `native_case_known`; `--native cursor --case …` is supported |
| Credential-free substitutes already cover those journeys | `rg -n 'one-shot-result\|one-shot-queued\|one-shot-escalation\|admission-investigation' tests/support/git-publication-native-substitute-suite.sh` | Substitute suite runs all four journeys; no new fixture required for slice 1 |
| Cursor CLI can invoke agent print mode | `cursor agent --version` | `2026.09.28-64d2043`; live paid runs still need Terry's go-ahead |
| Installer accepts `--platform cursor` | `install.sh` usage line | Platforms include `codex\|cursor\|claude` |
| Premise acceptance has no maintained harness; recipe is recoverable | `ls tests/*premise*`; `git show 874f9a8:.planning/…/115-…/PLAN.md` | No premise harness files; plan 115 records disposable-clone + planning-only recipe (Claude flags; Cursor uses `cursor agent --print --force --trust --sandbox disabled`) |
| Doughnut and Pygardon sibling checkouts exist for premise cases | `test -d /Users/terryyin/git/doughnut; test -d /Users/terryyin/git/pygardon` | Both present. Slice 2 still builds disposable clones from them; failure to use those sources stops that slice |
| Open Dough control revision is present | `git cat-file -e e7107e5^{commit}` | Present |
| Claude Code one-shot baseline exists; Cursor still pending | SEED-028 story decomposition | Result, queued, and admission-investigation passed on `5181d769` (2026-09-27). Escalation passed on `23563ee0` (2026-09-28). Cursor remains pending |
| Escalation case exists and Claude Code accepted it | SEED-028 story decomposition; `native_case_known` | Pass recorded; exit was not taken. Cursor runs the existing case in slice 1 |

## Ordered slices

### 1. Accept existing one-shot cases natively on Cursor

Type: Behavior
Status: done
Proof: source revision `a99c67f7823b6c0f219d57748f3d8532d8723354`, Cursor agent
`2026.09.28-64d2043`, 2026-09-29. Each command
`tests/git-publication-native.sh --native cursor --case <case> --results-dir native-results/cursor-one-shot`
exited 0 with `assessment-status: pass`. Records:
`native-results/cursor-one-shot/cursor/publication/one-shot-result/20260929T035401-179d`,
`.../one-shot-queued/20260929T035727-18d3`,
`.../admission-investigation/20260929T035934-4301`,
`.../one-shot-escalation/20260929T040252-4fa6`.
SEED-053 Cursor story records the same revision, date, and verdicts.

Behavior: current guidance revision installed as the harness uses it → with
Terry's go-ahead, one paid Cursor run per case (at most one retry after
investigation of a harness or environment fault, not a guidance miss) of
`tests/git-publication-native.sh --native cursor --case publication/one-shot-result`,
`--case publication/one-shot-queued`,
`--case publication/admission-investigation`, and
`--case publication/one-shot-escalation`, each with `--results-dir` →
assessor passes → record revision, date, and outcomes in the Cursor story.
A guidance-level fail stops for Terry; no guidance edit in this story.

### 2. Accept premise verification natively on Cursor

Type: Behavior
Status: planned
Proof: three planning-only Cursor runs judged against the shared premise table;
SEED-053 Cursor evidence updated.

Behavior: Doughnut, Pygardon, and Open Dough control clones prepared per
SEED-053 shared setup (`origin` removed, pre-plan parent, refined seed with
state `refined`/`unselected`,
`install.sh --target <clone> --source <open-dough checkout> --platform cursor --force`)
→ with Terry's go-ahead, one paid Cursor planning-only invocation per case
naming the story link, told not to implement, commit, push, or publish →
written plans meet the shared pass criteria (Doughnut names
`scripts/test/quality_changed.test` with observation; Pygardon proves seeding
with a feature that runs the seeding script; Open Dough control reaches
`ready` without invented gates) → record revision, date, and per-case verdicts.

Cheap setup first: locate or clone Doughnut and Pygardon from maintainer-known
sources. If either cannot be located, stop slice 2 and report the gap; do not
invent a substitute case. Cursor invocation mirrors the harness print path
(`cursor agent --print --force --trust --sandbox disabled`) with an explicit
planning-only prompt analogous to plan 115's Claude recipe.

## Current decisions

- Gate stance A: Cursor-native acceptance claims for these paths require this
  evidence; unrelated releases may continue.
- Premise and one-shot stay one story. Slices 1 and 2 are independent and may
  run in either order once authorized.
- No new premise harness; one-off disposable-clone runs match plan 115's
  acceptance pattern.
- One paid pass per case per guidance version is the acceptance claim.
- Escalation stays in slice 1. Claude Code passed it on `23563ee0`
  (2026-09-28); the exit was not taken, so there is no drop step.

## Execution identity

- Mode: Story Branch
- Workspace: `/Users/terryyin/git/open-dough/.worktrees/native-guidance-acceptance-cursor`
- Branch: `cursor/native-guidance-acceptance-cursor`
- Starting revision: `2057f0dca8d160484b8ead5d3eb24466cf05f254`
- Published claim: `a99c67f7823b6c0f219d57748f3d8532d8723354` on `origin/cursor/native-guidance-acceptance-cursor`
- Agent: Akiho-chan
- Publisher: `cursor-native-guidance-acceptance-cursor`

## Learnings
