# Comparison and keep decision

Recorded after A1–B2 completed (all `claude_exit=0`). Basis frozen in
`00-freeze-and-basis.md` before probes. Host: Claude Code 2.1.321, model
`claude-opus-5-5` / opus, permission auto, AC power, `caffeinate -s -i`.
Seven-day rate limit stayed `allowed_warning` at ~0.99 utilization (overage
rejected); arms still completed.

## Decision before → after (both cases)

| Case | Before (01-decisions-before-probes.md) | After probe |
| --- | --- | --- |
| Recently done | If maintained selection checks omit project-change supersession and an independent witness shows wrong navigation, next action is journey proof; recognize planned `SEED-272#prove-recently-done-check-supersession` rather than a new repair from the report alone. | **No change.** A1 and A2 both returned **Confirmed missing test path** with journey-proof next action and recognition of plan 529. |
| Landed CI | If maintained proof catches the stop-at-proof-wait fault, no product repair; name helper catch if applicable. | **No change.** B1 and B2 both returned **Caught** via `untilKept` (earlier helper), not the later history `toEqual`. |

A retained report alone still does not establish a changed repair decision.
Neither result claims value for routine automatic checking.

## Arm costs (measured)

| Arm | Skill set | Host elapsed (meta) | Report invocation elapsed | Tools | Stream tokens (in/out/cache_read/cache_create) | Runner (report) | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | frozen/current | 734970 ms | 440376 ms (start→report) | 19 | 80/1207/1594951/103816 | ~3.5 min | Confirmed missing |
| A2 | candidate | 429752 ms | 415738 ms | 18 | 76/486/1571012/105994 | ~2.9 min | Confirmed missing |
| B1 | frozen/current | 216207 ms | 189650 ms | 29 | 120/1200/2999996/120213 | ~56.5 s | Caught |
| B2 | candidate | 171974 ms | 154664 ms | 13 | 58/1236/1254782/102986 | ~55 s | Caught |

- **Caller handoff preparation:** current arms = none; candidate arms = hints
  already available from historical review (assembled into prompts; not a new
  research phase at request time).
- **Wrap-up wait:** unavailable — no real closure join observed in these arms.
- **Human effort:** unavailable on all arms (non-interactive).
- **Agent effort:** stream tool counts and token counters above (host-exposed in
  `stream.jsonl`); agents marked meters unavailable in-report.
- **One-time authoring/evaluation:** freeze, prompts, `run-arm.sh`, summaries —
  separated from arm totals; not counted as a keep saving.

## Keep criteria (ADR 0010)

1. **Lower total effort on search-heavy:** A2 host elapsed 429s vs A1 735s
   (−305s); report start→report 416s vs 440s (−24s). A2 validated/revised the
   suggested assertion (row-change check does not exercise project-change) and
   still reached Confirmed missing without a broad exploratory sweep. **Met.**
2. **Equally strong proof:** both pairs share baseline / fault / independent
   wrong-behavior (or catch on exercised path) / restore / restored pass, and
   matching truthful verdicts and next actions. **Met.**
3. **No material extra preparation on already-focused:** B2 was faster (172s vs
   216s host; 13 vs 29 tools), not slower. Hint pass-through did not add
   material focused-case preparation cost. **Met.**

## Confounds and unknowns

- Sequential order and warm Playwright/browser cache favor later arms.
- `run-arm.sh` launches Claude from the parent cwd (setup `cd` is subshell-only);
  B1/B2 agents rediscovered the scratch checkout. Inflates discovery on some
  arms; does not reverse the keep criteria (candidate still not worse on B).
- Rate-limit warning throughout; savings are not claimed as universal or
  all-host.
- Unsupported claim: routine automatic checking value — explicitly not
  established.

## Keep decision

**Keep** the candidate focused-handoff guidance in
`src/skills/dough-intent-coverage/SKILL.md` and
`src/skills/dough-story-wrap-up/SKILL.md` (already matching `skills-candidate/`).
Retain slice-1 verdict language independently (already on HEAD before this
trial). Trial evidence stays under this plan directory for retrospective;
wrap-up assimilates lasting guidance and removes spent records through ordinary
Git recovery.
