# Observe a planning premise through the operation that consumes it

## Source and authority

- **Identity:** SEED-059#observe-premise-consumers
- **Source:** [refined story](../../seeds/SEED-059-observe-planning-premise-consumers.md#observe-premise-consumers)
  (Goal, Scope, Key examples; decisions of 2026-09-30: premises are derived from
  the key examples, each names the consuming operation, the symptom-first rule for
  a claimed remedy is the same rule and not a separate one, and the rule is stated
  where premises are recorded, with readiness linking to it).
- **Authority:** planning only. This plan grants no Take, implementation, paid
  native run, or publication beyond landing the preparation.

## Goal and scope

A planner writing a plan finds the decisive premises by tracing each key example
from trigger to observable result through existing code, records for each the
operation that consumes its result and the observation that reaches it, and
treats existence or a grep hit as presence, not as settling the premise. A claim
that a change fixes a reported symptom is reproduced before dependent work. Where
an existing fixture can run the journey cheaply, it runs. Readiness stays blocked
while an observation records part of the promised journey as not covered. The
seed's Scope, exclusions and key examples apply unchanged.

Change only runtime guidance under `src/skills/`:

- the decisive-premise paragraph in "Write the plan" of
  `src/skills/dough-slice-planning/SKILL.md`: lead with the general rule, keep the
  delivered moved-function caller text as its worked instance (do not restate or
  drop it), and add the consumer column to what is recorded;
- the journey paragraph in `src/skills/dough-product-backlog/references/record-preparation.md`
  ("Criteria"): replace its own wording of the rule with a link to the planning
  paragraph and add the "not covered blocks readiness" sentence.

Excluded: an audit of every fact, new scripts, recorder or hook changes, a new
reference file, edits to slice-plan refinement or execution guidance, and
hand-editing installed copies under `.claude/skills/` or `.agents/skills/`
(AGENTS.md). Wording addresses the planning agent in the target project (ADR 0006):
no finding codes, no "retrospective", no Open Dough maintenance vocabulary.

## Direction followed

No Accepted ADR constrains the wording beyond [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(one host's evidence does not transfer), [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(runtime audience) and [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(edits under `src/skills/` are Proposed until promoted). No North Star topic
applies. No new topic is added.

## PFE: what is reused

The premise definition, the smallest-safe-observation list, the probe-slice rule
and the moved-function clauses in `dough-slice-planning` already exist, as does
the "promised journey through the consumer" sentence in `record-preparation.md`.
The change re-orders and sharpens them; it adds no section, file or script.
Gap: nothing tells the planner how to *find* premises it did not write, or that a
recorded observation must say which operation consumes the result, and the only
statement of the journey rule sits in readiness, away from where premises are
recorded.

## Current decisions

- One guidance slice. The two edits state one rule at the place it is applied and
  the place that checks it; splitting them leaves the rule stated twice.
- No wording test: nothing under `tests/` references this text and ADR 0005 does
  not count static prose as behavioral evidence. Behavior is judged by AGENTS.md
  behavior review (slice 1) and native replay (slice 2).
- Native replay is manual only and paid; it is added to no suite, CI or wrapper.
  Each case runs once per guidance version, and claims are limited to the observed
  runs compared with the pre-change baseline on Claude Code.
- Whether stating the rule in slice planning rather than readiness changes
  behavior is unverified: every failing case had the readiness text available.
  The replays report it as observed or not; the plan does not assume it.
- If a replay case fails, revise slice 1 at most once and rerun only failed
  cases; a second failure stops for human judgment with retained evidence.

## Planning premises observed (2026-09-30)

| Premise | Consumer | Observation reaching it | Result |
| --- | --- | --- | --- |
| The premise rule and the readiness journey sentence sit where slice 1 edits them | The two edits | `grep -n "decisive premise\|promised journey" src/skills/dough-slice-planning/SKILL.md src/skills/dough-product-backlog/references/record-preparation.md`; read lines 117-150 and 74-92 | Present at those places; the moved-function clauses occupy lines 131-139 of `SKILL.md`. |
| No test or script checks this wording | Payload and lint checks that slice 1 will run | `grep -rIl -e "Naming an entry" -e "promised journey" -e "decisive premise" tests scripts` | No match in either tree. |
| The installed copy equals source, so a native replay can install this checkout's guidance | `install.sh --source <path> --platform claude --force` | `diff .claude/skills/dough-slice-planning/SKILL.md src/skills/dough-slice-planning/SKILL.md`; plan 175 recorded the install premise from `install.sh` lines 12, 27-32 | Identical; the install premise from plan 175 is reused, not re-run. |
| The replay cases are recoverable at their parents | The replay clones | `git cat-file -t` on doughnut `5989892325`, `7c9935b2c2`, `f9a6f4a416`, `dfec19ca03`; pygardon `f621f06c9`, `1af611dca`; open-dough `e8ce93b9`, `d0101737`, `6f350f28`; `git show <commit>:<plan>` for each case's slice heading (053 slice 1 at `5989892325^`, 056 slice 2 at `7c9935b2c2^`, 275 slice 5 at `f621f06c9`, 112 slice 2 at `e8ce93b9`, 058 provisional slice 5 at `dfec19ca03`) | All are commits; the plans exist at `053-pdf-smooth-scroll-after-choosing-block`, `056-change-or-clear-reading-mark`, `058-current-block-same-in-pdf-and-epub` (doughnut), `275-stop-limit-required-evidence` (pygardon) and `112-one-shot-work` (open-dough). |
| The recorded findings match the executions | The case table below | Read the linked finding entries in the three repositories' `DearDough.md` | Doughnut 053, 055, 056 and pygardon 275 show what the plan missed. Doughnut 051 and 055 are doughnut, not pygardon. Only executions on 0.3.46 or 0.3.47 show the 0.3.43 rule failing to be applied. |
| **Not observed:** whether the retained plans hold the premise tables as they stood before the failure | The replay prompts | Plan 053 at `5989892325^` already holds a *Decisive premises* section, so replay prompts give the story's key examples and the slice text and withhold that section | A proof limit: the replay reconstructs the planner's input from the parent plan and the story's key examples, not from the original conversation. |

## Outside-in proof and verification

- Behavior review (AGENTS.md): walk each of the seed's seven key examples against
  the revised text, naming the sentence that produces the outcome, including both
  boundary examples.
- Deterministic checks on the prose edits: `npm run lint`,
  `/opt/homebrew/bin/bash tests/payload-declaration-links.sh`,
  `/opt/homebrew/bin/bash tests/compare-payload.sh`, `git diff --check` (modern
  bash; macOS system bash masks `set -e` failures).
- Replay method (slice 2): a disposable clone with `origin` removed, checked out at
  the case's parent commit with its story and plan present; remove any premise
  text the plan gained after the failure; install guidance from this checkout;
  run `claude --print` told to act as the slice planner for the named slice, to
  observe read-only with no file writes, and to output only the decisive-premise
  table and its readiness assessment. Retain transcripts under
  `$CLAUDE_JOB_DIR/tmp`, judge, summarize under Accepted proof, then delete
  (ADR 0005).
- Baseline before any slice 1 edit: run the same replays with unchanged guidance.
  If all five defect cases already produce a consumer-reaching table, stop for
  human judgment before slice 1: the diagnosis that guidance causes the shallow
  observations is unsupported for this host and model. If some pass, report
  attribution as weak.

| Case | Replay at | Pass when the planner's table |
| --- | --- | --- |
| Overlay collision (doughnut 053) | doughnut `5989892325^`, plan 053 slice 1 | derives a premise from the "scroll past without marking" example and reaches `blockAwaitingConfirmation` and the overlay classes, or leaves the panel position as an owner decision |
| Grep-only step premise (doughnut 056) | doughnut `7c9935b2c2^`, plan 056 slice 2 | names the step and the EPUB fixture path that consumes it, not only that the step exists |
| Fixture transformation (pygardon 275) | pygardon `f621f06c9`, plan 275 slice 5 | traces fixture inputs through `repair_genome` to the evaluated genome and names it |
| Race premise (open-dough 112) | open-dough `e8ce93b9`, plan 112 slice 2 | runs or names the existing racing-push fixture instead of only reading the hook's call sites |
| Symptom first (doughnut 198) | doughnut `dfec19ca03`, plan 058 provisional slice 5 | reproduces the symptom in the fixture before slicing, or moves the slice after a real-PDF check |
| Sound premise (control) | this repository at the plan-175 commit, slice 1 | observes each premise once, cheaply, and adds no extra investigation |

## Ordered slices

### 1. Premises are found from key examples and observed through their consumers
Type: Behavior
Status: done
Proof: behavior review of all seven examples above against the revised text;
deterministic prose checks above.

Precondition: the baseline replays are recorded (Outside-in proof).

Behavior: a planner writing a plan → traces each key example through existing
code and records each decisive premise with its consuming operation and the
observation that reaches it → a presence-only observation, a remedy claim without
a reproduced symptom, or a journey part recorded as not covered is not treated as
settled and blocks `ready`, while a sound premise and a paid or owner-held remainder
keep their current cheap-observation and probe-slice handling.

Edit only the two paragraphs named above. Check `dough-slice-plan-refinement` and
`dough-execute-plan` for text the new rule contradicts and align only
contradictions.

### 2. Claude Code planners observe the retained cases through their consumers
Type: Behavior
Status: done (accepted as is by human decision, 2026-09-30)
Proof: six native Claude Code replays judged against the table, each compared
with its baseline; other hosts recorded as unclaimed.

Precondition: slice 1 is done with its deterministic checks green.

Behavior: the replayed planners produce consumer-reaching premises, or an early
probe, for the five defect cases and add no extra investigation for the control.
Record verdicts, literal commands and the proof limit (reconstructed inputs, one
run per case, one host, attribution to the placement change unverified) under
Accepted proof. A failure follows the once-only revision rule.

## Accepted proof

**Baseline (pre-change, Claude Code, one run per case, default model):** 1 of 5
defect cases passed (doughnut 056); doughnut 053, pygardon 275, open-dough 112
and doughnut 058 read the code but stopped at presence for the decisive consumer;
the control passed on premises but investigated beyond slice 1. The stop rule
(all five pass) did not trigger. Transcripts: `$CLAUDE_JOB_DIR/tmp/plan176/baseline/`;
script `plan176/replay.sh <case> <label> <guidance-checkout>`. Proof limits: premise
sections removed by script; the prompt pointed at the story rather than pasting its
key examples; Bash was unrestricted (Edit/Write disallowed).

**Slice 1:** seven key examples walked against the revised text (rule paragraph
"Derive premises from the key examples" and the consumer clause in "Record each
premise" of `dough-slice-planning`; readiness sentence in `record-preparation.md`);
both boundary examples keep the retained cheap-observation and probe-slice
paragraphs. `npm run lint`, `/opt/homebrew/bin/bash tests/payload-declaration-links.sh`,
`/opt/homebrew/bin/bash tests/compare-payload.sh` and `git diff --check` pass.

**Slice 2 post-change replays (one run per case; transcripts under
`$CLAUDE_JOB_DIR/tmp/plan176/postchange/`, compared with `baseline/`):**

| Case | Baseline | Post-change |
| --- | --- | --- |
| Doughnut 053 | fail | fail; wrong premise ("panel still offered for 2.1 ... Holds by reading"), readiness "ready" |
| Doughnut 056 | pass | pass |
| Pygardon 275 | fail | fail; `repair_genome` absent from both |
| Open-dough 112 | fail | weak pass; names the race test and its `beforePush` use, does not run it |
| Doughnut 058 | fail | weak pass; states the symptom is "Not reproduced" and makes the first step a probe |
| Control (plan 175) | sound premises, extra investigation | sound premises, more extra investigation |

Proof limits: one run per case, one host and model, reconstructed inputs, the two
passes are "names or recommends" rather than "runs", attribution to the placement
change unverified (baseline already carried the readiness journey rule), other hosts
unclaimed.

## Learnings

- Human decision (2026-09-30): accept the post-change replays as is, without the
  one allowed revision.
  Failed or weak: 053, 275, control extra investigation; single samples may be noise.

## Execution complete

Product advice: no change. Placement of the rule in slice planning is not shown to change planner behavior (baseline 1/5, post-change 2/5 weak, single runs); revisit only with a multi-sample comparison and a countable extra-investigation measure.
