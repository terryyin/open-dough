# Check reported gaps against the story before accepting a slice

## Source and authority

- **Identity:** SEED-058#accept-reported-story-gaps
- **Source:** [refined story](../../seeds/SEED-058-accept-reported-story-gaps.md#accept-reported-story-gaps)
  (Goal, Scope, Key examples; decision of 2026-09-30: a goal-contradicting gap
  returns for correction even when the story is silent, and only an explicit
  deferral becomes an owner scope decision).
- **Authority:** planning only. This plan grants no Take, implementation, paid
  native run, or publication beyond landing the preparation.

## Goal and scope

A coordinator accepting a slice tests every gap the return reports, and every
fixture change that turns proof green, against the story's goal and key
examples before accepting, so a contradiction returns for correction or reaches
the owner as a real scope decision and never becomes completion by being
written under Learnings. The seed's Scope, exclusions and key examples apply
unchanged.

Change only runtime guidance under `src/skills/`, in the existing "Accept
proof" section of `src/skills/dough-execute-plan/references/wrap-up.md`. It
already says a missing required observation is not cleared by a learning; add
the same discipline for (a) a reported gap or loss that contradicts the story,
(b) a fixture or setup change that moves proof away from the example's real
shape, and (c) a limitation whose consequence is losing the only saved work.
Edit the paragraph on missing observations rather than adding a parallel
section. Keep wording addressed to the agent in the target project (ADR 0006).

Excluded: return-contract layout changes in `delegation.md`, plan Learnings
rules, a blanket suite run, approvals, report resends, per-slice gap accounting,
the completed native assessor correction, closure bookkeeping on ODF-138/139/185/196
(story wrap-up owns it), and hand-editing installed copies under `.claude/skills/`
or `.agents/skills/` (AGENTS.md). Considered and excluded: a new native harness
(a one-off manual acceptance is enough for one story); creating a story for
Codex and Cursor acceptance (claims stay limited to Claude Code; the owner may
queue one).

## Direction followed

No Accepted ADR constrains the wording beyond [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(one host's evidence does not transfer), [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(runtime audience) and [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(edits under `src/skills/` are Proposed until promoted). No North Star topic
applies. No new topic is added.

## PFE: what is reused

`wrap-up.md` "Accept proof" already owns reading the return as an index,
inspecting setup and assertions, and returning contradictory evidence. The new
rule extends it; it adds no second acceptance step, reference file or script.
`delegation.md` already asks returns to list gaps and says a learning note is
not acceptance evidence, so the return contract needs no change. Gap: nothing
today tells the coordinator to compare a reported *contradiction* or a
*fixture substitution* with the story.

## Current decisions

- One guidance slice. The three checks are one rule at one decision point and
  share one proof loop; splitting them would add edits to the same paragraph.
- No wording test. `wrap-up.md` has no wording test and ADR 0005 does not count
  static prose as behavioral evidence. Behavior is judged by AGENTS.md behavior
  review (slice 1) and native replay (slice 2).
- Native replay is manual only and paid; it is added to no suite, CI or wrapper.
  Each case runs once per guidance version, and claims are limited to the observed
  runs compared with the pre-change baseline on Claude Code.
- If a replay case fails, revise slice 1 at most once and rerun only failed
  cases; a second failure stops for human judgment with retained evidence.

## Planning premises observed (2026-09-30)

| Premise | Observation | Result |
| --- | --- | --- |
| The cited executions are recoverable | `git -C <repo> cat-file -t <sha>` for pygardon `30c05783e`, `b5b450dbb`; doughnut `61d400007d`, `2a8fd844b4`, `4ba13d691c`, `e733844d01`, `485ed2eb49`, `b2faf56d14`; open-dough `8f88364`, `b11bb98` | All ten are commits. |
| The gap statements are retained | `git show b5b450dbb:.planning/slice-plans/280-.../PLAN.md` (Learnings), `git show 61d400007d:.planning/slice-plans/006-.../PLAN.md` (Learnings, "outside this story's promises"), `DearDough.md` ODF-196/138 entries | Present: the `benchmark_weight` and trailing-newline sentences are in plan Learnings; the ODF-196 gap and ODF-138 `none` gap are quoted in the findings. |
| The full hand-backs are not retained | Same sources | Only the quoted gap sentences and their slice diffs survive. Replays reconstruct the return from those sentences; this is a proof limit. |
| Slice diffs to replay exist | `git show --stat` of pygardon `b5b450dbb` (tests only), doughnut `61d400007d` (5 files), open-dough `8f88364` (7 files incl. `ci-monitor.md`); `git log 485ed2eb49..b2faf56d14 -- <plan 049 path> frontend cypress e2e_test` in doughnut | Present for three cases. **Not for ODF-196:** `485ed2eb49` is a plan-only commit and no commit holds the moved-cover fixture; the corrected slice is `b2faf56d14` (parent `9ce2aa8c28`), so the reshaped-fixture attempt was never committed. Its replay reconstructs the attempt: `9ce2aa8c28` plus a fixture-only edit giving the cover a targeting entry, with the Alice `wrap0000.xhtml` shape from the finding. This is a proof limit. |
| The ODF-138 story does not itself promise keeping paused work | `git show 8f88364:.planning/seeds/SEED-008-...md` at `truthful-repair-restore` | Goal is truthful reporting and not applying twice or dropping another writer's entry. So this case tests the consequence rule, not goal contradiction. |
| A real healthy control exists | Plan 280 Learnings at `b5b450dbb`: fill-day ATR note for slice 3 | Present, and it sits in the same slice as the `benchmark_weight` gap. It changes remaining work, so it is kept and does not block acceptance. |
| Guidance installs from this checkout into a disposable clone | `sed -n 120,135p src/install/open-dough-release-version.sh`; `grep -n -- '--source\|--platform' install.sh` | `install.sh` takes `--source <path> --platform claude --force` (lines 12, 27-32) and `validate_checkout` needs only `VERSION` and a dated `CHANGELOG.md` entry, both at this checkout's root. |

## Outside-in proof and verification

- Behavior review (AGENTS.md): walk each key example against the revised text,
  naming the sentence that produces the outcome, including both boundary examples.
- Deterministic checks on the prose edit: `npm run lint`,
  `/opt/homebrew/bin/bash tests/payload-declaration-links.sh`,
  `/opt/homebrew/bin/bash tests/compare-payload.sh`, `git diff --check` (modern
  bash; macOS system bash masks `set -e` failures).
- Replay method (slice 2): a disposable clone with `origin` removed, checked out
  at the slice's parent with its story seed present; apply the slice diff
  uncommitted; install guidance from this checkout; run `claude --print` told to
  act as the coordinator at proof acceptance for that slice with the
  reconstructed return, to state accept or return and why, and not to commit,
  push or publish. Retain transcripts under `$CLAUDE_JOB_DIR/tmp`, judge, summarize
  under Accepted proof, then delete (ADR 0005).
- Baseline before any slice 1 edit: run the same replays with unchanged guidance.
  If all four defect cases already return or escalate correctly, stop for human
  judgment before slice 1: the diagnosis that guidance causes the acceptances would
  be unsupported for this host and model. If some pass, report attribution as weak.

| Case | Replay at | Pass when the coordinator |
| --- | --- | --- |
| Searched parameter dropped (ODF-185) | pygardon `b5b450dbb^` + its diff, story from plan 280 | returns the `benchmark_weight` loss for correction; accepts the ATR note as a learning |
| Newline lost (ODF-139) | doughnut `61d400007d^` + its diff, SEED-046 story | returns the newline loss; does not treat the pinning example as proof |
| Fixture substitution (ODF-196) | doughnut `9ce2aa8c28` + reconstructed fixture-only edit, SEED-059 story | checks the real Alice EPUB shape, or returns the untargeted-spine-cover gap, instead of accepting green |
| Untested limit (ODF-138) | open-dough `8f88364^` + its diff | examines the `applied: none` consequence and returns or escalates before accepting a drop-ending guidance |
| Harmless gap (boundary) | plan 280 control above | accepts with no new run |
| Sufficient unchanged proof (boundary) | doughnut corrected slice-4 change at `b2faf56d14` | accepts without rerunning proof that still matches |

Keep ordinary independent post-change refactoring, delivery, CI observation,
retrospective and wrap-up gates.

## Ordered slices

### 1. Acceptance tests reported gaps against the story

Type: Behavior
Status: done
Proof: behavior review of all six examples above against the revised text;
deterministic prose checks above.

Precondition: the baseline replays are recorded (Outside-in proof).

Behavior: a coordinator accepting a slice whose return reports a gap, a loss,
a limitation, or a fixture change that turns proof green → it reads that against
the story's goal, key examples and stated exclusions → a contradiction returns
for correction in the same slice (also when the story is silent), an explicit
deferral stops only that path for the owner, a limit whose consequence loses the
only saved work is examined before acceptance, and a harmless gap outside the
goal or sufficient unchanged proof is accepted with no new run.

Edit only the missing-observation paragraph and its neighbours in `wrap-up.md`
"Accept proof". Check `delegation.md` and `planning.md` ("Learnings") for text
the new rule contradicts and align only contradictions.

### 2. Claude Code acceptance catches the retained cases

Type: Behavior
Status: done
Proof: six native Claude Code replays judged against the table, each compared
with its baseline; other hosts recorded as unclaimed.

Precondition: slice 1 is done with its deterministic checks green.

Behavior: the replayed coordinators return or escalate the four defect cases and
accept the two boundary cases without added runs. Record verdicts, literal
commands and the proof limit (reconstructed returns, one run per case, one host)
under Accepted proof. A failure follows the once-only revision rule.

## Accepted proof

Slice 1: added one paragraph after the missing-observation paragraph in
`src/skills/dough-execute-plan/references/wrap-up.md` "Accept proof". Behavior
review: the sentence "A gap that contradicts the goal or a key example returns
to implementation in the same slice, even when the story never lists it"
produces the ODF-185 and ODF-139 returns ("a test that pins the loss is not
proof of the example"); "check the example in its real shape" produces the
ODF-196 check; "Examine a limit that could lose the only copy of paused or saved
work for that consequence" produces the ODF-138 examination; "A gap outside the
goal that costs the user nothing is accepted" and the retained
"without another approval or blanket rerun" cover the harmless and unchanged-proof
boundaries; "Only a gap the story explicitly defers becomes an owner decision"
covers the deferral boundary. Deterministic checks pass:
`npm run lint`, `/opt/homebrew/bin/bash tests/payload-declaration-links.sh`,
`/opt/homebrew/bin/bash tests/compare-payload.sh`, `git diff --check`.

Slice 2 (manual, paid, Claude Code only; not part of any suite, CI or wrapper).
Each case: `cd <clone> && claude --print --permission-mode default
--allowedTools "Read Grep Glob Bash" --disallowedTools "Edit Write NotebookEdit"
--max-budget-usd 4 "$(cat <case>.prompt)"`, after installing this checkout's
guidance with `/opt/homebrew/bin/bash ./install.sh --target <clone> --source
<checkout> --platform claude --force`. Verdicts after the change, against
baseline: ODF-185 ACCEPT → RETURN (pass; the ATR note stays a learning);
ODF-139 RETURN → RETURN (pass); ODF-196 RETURN → RETURN (pass); ODF-138 RETURN →
RETURN (pass; now cites losing the only copy of the work for `applied: none`);
harmless gap ACCEPT → ACCEPT (pass, no new run); sufficient unchanged proof: the
as-is reconstruction RETURNED before and after because its invented
`pnpm cypress run` and "1 selected, 1 passed" made the proof ambiguous, while
the corrected reconstruction (plan's `pnpm cy:run`, whole feature 13/13)
ACCEPTED with no rerun (pass; no baseline was run for the corrected return).
Limits: returns are reconstructed from retained sentences and diffs, the
corrected control's E2E result is reconstructed, one run per case so variance is
unmeasured, one host and model; Codex and Cursor are unclaimed. No revision of
slice 1 was needed.

## Learnings

Baseline (2026-09-30, unchanged guidance, Claude Code, one run per case,
returns reconstructed from retained sentences): ODF-185 ACCEPT (fail: noticed
the `benchmark_weight` loss, treated it as an owner scope decision); ODF-139
RETURN, ODF-196 RETURN, ODF-138 RETURN (weak: returned for other defects, never
examined the drop consequence); harmless gap ACCEPT; sufficient-unchanged-proof
control RETURN (fail, partly an artifact of an invented E2E command in the
reconstructed return). Attribution to guidance is weak for three defect cases;
only ODF-185 reproduces the failure. Slice 2 compares against this.

## Execution complete

Product advice: No correction story. At wrap-up, record on ODF-138, ODF-139,
ODF-185 and ODF-196 the response (the new "Accept proof" paragraph in
`wrap-up.md`), implementation commits `b7930baf` and `3984e85c`, release
pending, and the proof limits (Claude Code only, reconstructed returns, one run
per case; only ODF-185 reproduced the failure at baseline, so attribution is weak
for the other three). Start a watch only from verified relevant use. Codex and
Cursor acceptance is unclaimed; the owner may queue it.
