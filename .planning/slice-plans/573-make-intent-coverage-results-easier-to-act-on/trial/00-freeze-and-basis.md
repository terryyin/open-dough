# Slice 2 trial freeze and comparison basis

Recorded before handoff edits or paired sampling.
Freeze source revision for pre-handoff request prose: `d95199a1f556d3e37b8d3d04c3ec855e76c81d0a`.
Execution checkout HEAD (slice 1 delivered): `be07058e3550a5527ed77bba00b3d7be4b1f4f2a`.

## Early paid probe

| Item | Value |
| --- | --- |
| Host choice | Claude Code (authenticated); Codex present as fallback |
| Host version | Claude Code 2.1.321 |
| Effective model | `opus` from `~/.claude/settings.json` |
| Permission mode | `auto` default |
| Auth probe | `claude -p "Reply with only the word AUTH_OK"` → `AUTH_OK` |
| Machine | AC Power, battery 100% charged |
| Load at dispatch | ~3.9–6.4 / 9–11 / 11 on 16 cores; sequenced heavy runs |
| Sleep guard | `caffeinate -s -i` on AC |
| Probe root | see `probe-root.txt` |

Isolated detached worktrees:

- Recently done: `1935f49a58e35557e2026500baf61113351e691e`
- Landed CI: `9fcff1d9a765df93a6e3f783fcbbfd75b0b17fb6`

Setup (`scripts/setup-native.mjs` npm → browser → check) passed for both;
recheck after landed-CI browser stage still reported Chromium 153.0.8010.12.

Focused passing baselines:

| Case | Command / family | Result |
| --- | --- | --- |
| Recently done | four `recently-done-sessions-select*.spec.ts` files | 8 passed (27.4 s) |
| Recently done nearest | `recently-done-sessions-select-check.spec.ts` | 1 passed (4.2 s) |
| Landed CI | `backend-tests/intent/landed-ci-history-pending-proof.spec.ts` | 2 passed (12.2 s) |

Logs: `setup-*.log`, `baseline-*.log` in this directory.

## Frozen current workflow (handoff axis)

Copied before edits into `skills-frozen/`:

- Pre-handoff checker at HEAD (slice 1 verdicts, no focused-hint validation):
  `skills-frozen/dough-intent-coverage.SKILL.md` (119 lines)
- Pre-handoff Wrap Up request (story/plan/revision; prefer plausible gap; no
  promise/fault/command/fixture/assertion hint pass-through):
  `skills-frozen/dough-story-wrap-up.SKILL.md` (250 lines)
- Exact `d95199a1f` skill snapshots retained for audit
  (`skills-frozen/d95199a1f-*.SKILL.md`). Wrap Up assess prose matches HEAD;
  that revision's checker lacks Confirmed missing and is **not** used for arms
  so slice-1 classification differences stay preserved.

Current arms therefore use: frozen Wrap Up request style (no focused hints) +
frozen HEAD checker (slice 1 verdicts only). Candidate arms use edited Wrap Up
hint pass-through + edited checker validate/revise/bounded-search guidance.
Slice-1 verdict language remains in both.

## Candidate under trial

Smallest cohesive change:

1. Wrap Up `Assess intent coverage`: when requesting a check, pass any already
   available promise, plausible fault, focused command, fixture, and assertion
   hints from review/execution context. Do not require rediscovery. Do not add a
   caller research phase. Leave probe mechanics and disposition with existing
   owners. Preserve concurrent closure join/selection/disposition ownership.
2. Checker: treat supplied hints as suggestions; validate or revise with
   consequential explanation; when hints are incomplete, search only the
   narrowest relevant proof and stop with a named gap instead of an automatic
   broad exploratory run. Preserve one-promise check, independent evidence,
   restoration, and all four slice-1 verdicts.

No new worker service, report schema, or finish-report API change.

## Keep criteria (set before probes; ADR 0010)

Keep the candidate handoff only if the paired comparison shows:

1. Lower total effort by avoiding an unnecessary broad run or equivalent setup
   (search-heavy case), **and**
2. Equally strong proof (baseline, faulted wrong-behavior observation, restore,
   restored pass; truthful verdict/next action), **and**
3. No material extra preparation on the already-focused case.

Otherwise simplify/revert handoff edits; retain slice-1 verdict guidance.
An unknown effect settles the trial without claiming improvement.
Unsupported savings remain unknown. Tokens only if the host already exposes them.

## Selected promises / faults (same revision+promise within each pair)

### Search-heavy — Recently done unanswered-read project change

- Story: `SEED-272#select-recently-done-sessions`
- Revision: `1935f49a58e35557e2026500baf61113351e691e`
- Promise: while a linked done-catalog check is unresolved, choosing another
  project keeps reading where they are (supersede unanswered check).
- Fault: delete `useLayoutEffect(supersede, [stories.selected, supersede]);`
  in `dashboard/src/recentlyDoneSelection.ts`.
- Nearest maintained: `recently-done-sessions-select-check.spec.ts` (row change,
  not project change); selection family omits project-change path.
- Decision before probe (both arms): if evidence shows maintained checks omit
  the project-change path and an independent witness shows wrong navigation,
  treat as needing journey proof / recognize planned correction
  `SEED-272#prove-recently-done-check-supersession`. Do not invent a new repair
  from a retained report alone.

### Focused — Landed CI proof-wait walk

- Story: `SEED-285#see-landed-ci-wall-time-history`
- Revision: `9fcff1d9a765df93a6e3f783fcbbfd75b0b17fb6`
- Promise: wait while CI proof is unanswered and still measure older landings
  past that skip.
- Fault: widen walk stop in `dashboard/server/landedCiCollection.ts` so
  `pending` + `waitsFor === "proof"` also returns (same isolated form as
  historical probe).
- Focused command/fixture/assertion: pending-proof spec; catch historically at
  `untilKept` for `older`.
- Decision before probe (both arms): if maintained proof catches the fault on
  the walked path, no product repair; note helper-catch limit if applicable.

## Evidence requirements (both arms)

Passing baseline that exercised the checks; one fault leaving fixtures/assertions
intact; independently observed wrong behavior on the intended path (or catch on
exercised path); exact restoration and restored pass; named next proof action;
four cost entries with units/basis.

## Cost endpoints to retain per arm

- Caller handoff preparation (hints assembled or explicitly none)
- Setup / probe work outside runner totals
- Runner runtime (Playwright reported)
- Complete invocation-to-report elapsed (finish-report or host interval)
- Wrap-up wait: only if a real closure join is observed; else unavailable + reason
- Human effort and agent effort with basis; tokens only if already exposed
- Separate one-time authoring/evaluation from arm costs

## Prompts (shared structure; arms differ only as noted)

All arms: fresh independent Claude Code session, model opus, permission auto,
`--print --dangerously-skip-permissions --no-session-persistence` (or equivalent
owned supervise path), matched scratch checkout at the case revision with npm/
browser already prepared from early probe (or re-setup if removed), report via
installed/copied finish-report when Node available. Do **not** supply expected
verdicts or findings.

Current arm prompt: request Intent Coverage for the selected story/revision;
prefer the named promise as a plausible protection gap; point at frozen skill
path; supply no fault/command/fixture/assertion hints.

Candidate arm prompt: same request plus available promise/fault/command/
fixture/assertion hints; point at candidate skill path; instruct validate/reuse
per skill.

## Run order (recorded)

1. Early probe (complete)
2. Author candidate skills
3. Arm A1: Recently done / current
4. Arm A2: Recently done / candidate
5. Arm B1: Landed CI / current
6. Arm B2: Landed CI / candidate

Warm-cache/order confounds: shared Playwright browser cache; sequential order
favors later arms; landed-CI pair runs after recently-done pair. Note in
comparison. Historical Done timings are exploratory context only.
