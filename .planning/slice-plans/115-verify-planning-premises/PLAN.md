# Verify planning premises before readiness

## Source

- Story: [Verify planning premises and proof setup before declaring readiness](../../seeds/SEED-044-verify-planning-premises.md#verify-planning-premises).
- **Identity:** SEED-044#verify-planning-premises
- Authority: refinement and planning only; execution requires a separate
  instruction. Decisions accepted during refinement (2026-09-26): premises
  that only a costly observation can establish become an early probe slice;
  ODF-110 is covered by the same rule; evaluation uses a native Claude Code
  re-planning with Codex and Cursor pending.

## Goal and scope

A plan recorded `ready` has observed the factual premises its slices depend
on, so an execution coordinator does not rediscover a cheaply checkable false
claim after Take. The seed's Goal, Scope, exclusions and key examples apply
unchanged.

Change only runtime guidance under `src/skills/`:

- `src/skills/dough-slice-planning/SKILL.md` — "Write the plan": decisive
  premises join what planning inspects. The existing infrastructure/storage
  assumption rule generalizes to any decisive premise: smallest safe
  observation, recorded premise, literal observation and result. Seed-inherited
  premises count. A premise that only a paid, credentialed, owner-held or
  state-changing observation can settle gets its cheap parts observed now and
  its remainder as an early probe slice that stops dependent work on failure.
- `src/skills/dough-product-backlog/references/record-preparation.md` —
  "Criteria": `ready` additionally requires decisive premises observed or
  bounded by such a probe slice. An unobserved, cheaply observable decisive
  premise is a blocking reason. Clearing a premise-based reason needs a fresh
  observation covering the slice's journey through the next operation that
  consumes the result; citing earlier evidence does not clear it.
  [dough-slice-plan-refinement](../../../src/skills/dough-slice-plan-refinement/SKILL.md)
  already reuses these criteria and needs no edit.

Excluded: the seed's exclusions (ODF-115, inventory deliberately left to
execution, story-refinement checks, planless and one-shot paths, checklists,
registries, scripts or validators, routine full-suite runs, new approvals).
Also excluded: hand-editing installed copies under `.claude/skills/` or
`.agents/skills/` (AGENTS.md), a reusable native harness for slice planning,
and closure bookkeeping on ODF-074/114/110, which story wrap-up owns.

## Current decisions

- One guidance slice. The planning rule and the readiness criterion express one
  rule (a decisive premise is observed before `ready`) at its two use points;
  they share one proof loop.
- No guidance-wording test. Neither changed file has a wording test today, and
  ADR 0005 does not count static prose checks as behavioral evidence. Slice 2's
  native runs own agent behavior; slice 1 uses the AGENTS.md behavior review.
- Native evaluation is a scripted-by-hand run in disposable clones with
  retained evidence, not a new `tests/*-native.sh` wrapper. It is a one-off
  acceptance for this guidance; a maintained harness is not justified by one
  story. The literal commands are recorded in the plan so the run can be
  repeated.
- Paid native runs are manually triggered only. Execution runs them by hand
  as recorded here; it adds none of them to `npm test`, `scripts/test.sh`, CI
  or any repeated automated suite, and adds no wrapper whose default mode
  would call a real host. Existing native wrappers already call real hosts
  only on an explicit `--native HOST`. The queued Codex/Cursor acceptance
  story inherits this constraint.
- Each native case runs once per guidance version. A single run can pass or
  fail by chance, so success claims are limited to the observed runs and
  compared with the baseline, not generalized.
- If a native case fails, revise slice 1's guidance at most once and rerun
  only the failed case. A second failure stops for human judgment with the
  retained evidence.

## Planning premises observed

Applying the story's own rule to this plan (2026-09-26):

| Premise | Observation | Result |
| --- | --- | --- |
| Doughnut's recorded "no test" case is replayable | `git log --diff-filter=A -- '.planning/quick/045-*/PLAN.md'` in `../doughnut`; `git cat-file -e 20efa7ec81^:scripts/test/quality_changed.test` | Plan added in `20efa7ec81` (2026-09-26; an older `3f7ecf3e2f` reused the number). The test exists at the pre-plan parent. |
| Pygardon plan 196's wrong seeding proof is replayable | `git log --diff-filter=A -- '.planning/quick/196-*/PLAN.md'` in `../pygardon`; `git ls-tree -r --name-only b2ad7c394^` | Plan added in `b2ad7c394`; `e2e_test/features/strategy_verify.feature` and `live_strategies.feature` both exist at its parent. |
| Plan 196's `src/hooks` selector had no specs | `git ls-tree` of `frontend/src/hooks` and `frontend/vite.config.ts` at `b2ad7c394^` | False as stated: `vitest run src/hooks` runs two specs, just not the ones covering the changed hooks. The seed example now uses the seeding-proof premise instead. |
| Unreleased guidance installs into a disposable clone | `install.sh` and `src/install/open-dough-release-version.sh` `validate_checkout` | `install.sh --target <clone> --source <this checkout> --platform claude` copies from the running checkout after VERSION/CHANGELOG validation, as existing native fixtures do. |
| Plan 111 is a sound-premise control | `DearDough.md` entries naming plan 111; plan at `0ff61b0^` | Its two findings (ODF-092 delivery identity, ODF-119 startup leftovers) are not planning premises. Planned in `e7107e5`. |
| No native slice-planning harness or fitting acceptance story exists | `tests/native-*`, `tests/support/*native*`, `.planning/seeds` | None; slice 2 records the Codex/Cursor gap in a new story. |

## Outside-in proof and verification

- Behavior review (AGENTS.md): walk each seed key example against the revised
  text, naming the sentence that produces the outcome, and the control example
  showing no new gate.
- Deterministic checks on any prose edit: `npm run lint`,
  `/opt/homebrew/bin/bash tests/payload-declaration-links.sh`,
  `/opt/homebrew/bin/bash tests/compare-payload.sh`, `git diff --check`.
  Use a modern bash; macOS system bash masks `set -e` assertion failures.
- Pre-change baseline, before any slice 1 edit: run slice 2's Doughnut and
  Pygardon cases with the guidance installed from this checkout's unchanged
  revision (the current released behavior). Record the verdicts under Accepted
  proof. If both cases already pass, stop for human judgment before slice 1:
  the story's diagnosis that guidance causes the misses would then be
  unsupported for the current host and model. If one passes, continue and
  report that case's attribution as weak.
- Native Claude Code runs (slice 2): paid, credentialed host runs in disposable
  clones with no reachable remote. Evidence is retained under a results
  directory in `$CLAUDE_JOB_DIR/tmp` (or the executing session's temporary
  root), judged, summarized under Accepted proof, then deleted per ADR 0005.

Keep ordinary independent post-change refactoring, delivery, CI observation,
retrospective and wrap-up gates.

## Ordered slices

### 1. Plans establish their decisive premises before readiness

Type: Behavior
Status: planned
Proof: behavior review of all seven seed key examples against the revised
text; deterministic prose checks above.

Behavior: a planner or readiness assessor following the installed guidance
meets a plan whose approach depends on a factual claim about the target
project → it observes that claim with the smallest safe observation (or
bounds a costly remainder with an early probe slice) and records premise,
observation and result → a false claim changes the plan or stays a named
`not-ready` reason, a premise-based reason clears only on a fresh observation
covering the slice's journey through its next consuming operation, and a plan
with sound premises reaches `ready` with no added gate.

Edit the two files named in Goal and scope, replacing the infrastructure-only
paragraph rather than adding a parallel rule. Keep the wording target-project
facing (ADR 0006). Check `dough-slice-plan-refinement` and
`dough-story-refinement/references/planning.md` for text that now contradicts
the widened rule, and align only contradictions.

### 2. Claude Code planning catches recorded false premises natively

Type: Behavior
Status: planned
Proof: three native Claude Code planning runs assessed against the rubric
below; Codex and Cursor recorded as pending in a linked story.

Precondition: the pre-change baseline is recorded (Outside-in proof).

Behavior: the slice 1 guidance installed into a disposable clone at a recorded
pre-plan revision → Claude Code plans the same refined story, planning-only
and told not to publish or commit → the written plan reflects the observed
premise, and the control plan reaches `ready` without invented gates.

For each case, clone the named repository into the temporary root, remove its
`origin`, check out the pre-plan parent, restore the refined seed from the
planning commit (the story as refined, without its plan), install this
checkout's guidance with `install.sh --platform claude`, and run
`claude --print` with a planning-only prompt naming the story link.

| Case | Revision | Pass when the written plan |
| --- | --- | --- |
| Doughnut "no test" | parent of `20efa7ec81`, seed from `20efa7ec81` | does not claim the commit-gate script lacks a test; it names `scripts/test/quality_changed.test` as proof to extend or preserve, with a recorded observation |
| Pygardon seeding proof | parent of `b2ad7c394`, seed from `b2ad7c394` | does not use `strategy_verify.feature` as the proof that moved seeding still works; it names a proof that runs the seeding script, such as `live_strategies.feature`, with a recorded observation |
| Open Dough control | parent of `e7107e5`, seed from `e7107e5` | records brief observations for its decisive premises, reaches `ready`, and adds no probe slice, new approval or full-suite run beyond what plan 111 already required |

Other defects in the replayed plans are out of scope for the verdict. Record
each case's literal commands, host version, model, verdict and limits under
Accepted proof.

Then add a story to SEED-044, "Accept premise verification natively on Codex
and Cursor", naming these three cases as reusable definitions and ADR 0005 as
the reason Claude Code evidence does not transfer. Queue it at the end of the
backlog list with the installed backlog tool. The backlog's validation passes.

## Promise coverage

| Seed promise or example | Owning slice | Observation |
| --- | --- | --- |
| Decisive premises observed and recorded before `ready` | 1, 2 | Review; Doughnut and Pygardon native cases |
| Seed-inherited premises count | 1 | Review (diarization example) |
| Costly remainder becomes an early probe slice | 1 | Review (diarization example) |
| Unobserved cheap premise is a blocking reason | 1 | Review (dataset example) |
| Reassessment re-observes; re-citing does not clear | 1 | Review (reassessment example) |
| Observation covers the journey through the next consuming operation | 1 | Review (pull-then-publish example) |
| Sound plan reaches `ready` without added gates | 1, 2 | Review; Open Dough control native case |
| The guidance change, not the host alone, produces the catch | baseline, 2 | Baseline verdicts versus slice 2 verdicts |
| Codex and Cursor stay pending, not inferred | 2 | Linked queued story |

Limits: the diarization, dataset, reassessment and pull-then-publish examples
are proved by review only, not native runs.

## Learnings

None yet.
