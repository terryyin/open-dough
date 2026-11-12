# SEED-303 early handoff — 11 November 2026

Terry explicitly requested five independent optimization stories, their priority
order, return of unfinished SEED-303 as item six, retention of its remaining plan,
Not ready assessment, agent release and execution-resource cleanup. No product
story is completed or dropped by this administrative handoff.

## Story ownership and queue order

| Priority | Canonical story | Former slices and promises |
| --- | --- | --- |
| 1 | [SEED-311 — watcher lifecycle](https://github.com/terryyin/open-dough/blob/b2f84f3854abd116dc1a801f2d284e0acd9e1802/.planning/seeds/SEED-311-production-watcher-lifecycle-checks.md#speed-up-production-watcher-lifecycle-checks) | Former 4; watcher recovery/cleanup SC-37–41 and G3; compatible delivered update-selection/source preparation from 2–3. |
| 2 | [SEED-312 — touch review](https://github.com/terryyin/open-dough/blob/03dff46c07c05315a026cafac77fccdbf30234bc/.planning/seeds/SEED-312-touch-review-checks.md#speed-up-touch-review-checks) | Former 7; real touch, pane/file and reading-position/viewport promises SC-50–51/54. |
| 3 | [SEED-313 — Cursor sessions](../../seeds/SEED-313-cursor-session-checks.md#speed-up-cursor-session-checks) | Former 8; holding/replacement, recorded scope, refusal/no-spawn and revival SC-56–60. |
| 4 | [SEED-314 — automatic repeat](../../seeds/SEED-314-landed-ci-repeat-checks.md#speed-up-landed-ci-repeat-checks) | Former 10; real receipt/collection/admission, threshold, exactly once, restart and distinct outcomes SC-64–69. |
| 5 | [SEED-315 — provider rate limits](https://github.com/terryyin/open-dough/blob/50fef3f8998ab463d05958acce039ea9204f2d4f/.planning/seeds/SEED-315-provider-rate-limit-checks.md#speed-up-provider-rate-limit-checks) | Former 5; deadline/recovery/cadence SC-42–46 and unresolved clock-authority G5. |
| 6 | [SEED-303 — remaining checks](../../seeds/SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks) | Former 6/9 plus existing pin 2 and narrowed verification 11; profile SC-47–49/52–53/55, pending Take SC-61–63 and pin SC-36. |

Former slice 1's baseline and repaired waits/preconditions, slice 2's source
projection and slice 3's stateful watcher substitution are delivered compatible
work, not duplicate new stories. G1/G2 were proved. The former G4/aggregate
45-case count and combined-five-family thirty-second goal are superseded by
Terry's split; each independent story must establish its own evaluable saving.
SEED-303 keeps a thirty-second target only for its remaining selection.
Cross-cutting ordinary-runner, one-worker, CI, MakeMe, equivalent-coverage and
honest-timing constraints follow each owner's scope. None of these priorities
creates an automatic dependency or authorizes execution.

## Evidence and recovery

The original complete source, plan and 74-commitment source review are recoverable
at `2a4a8d6f9f3bd61dc21d8679705e863c838883b9`. This folder moves the retained
research records out of the remaining plan's cleanup lifetime. `source-review.md`
and `execution-context.md` are historical; they do not allocate current work or
hold an active agent/observer. Former worktree paths and raw `/tmp` paths describe
past observations, not resources required for a new Take.

- [Comparable original baseline](comparable-baseline.md): 45/45, whole
  266.38/287.15/303.80 s; current families must re-establish matched baselines.
- [Coverage map](coverage-map.md) and [timing breakdown](test-timing-breakdown.md).
- [Watcher substitution](watcher-evidence.md): 25→23 checks, four fewer deployment
  stages, matched median saving 19.62 s. Existing CI behavior remains intact.
- [Rejected watcher/preview reuse experiment](preview-evidence.md): 7/7 in 44.61 s
  for an incomplete subset; not a universal floor or a maintained CI suite.
- [Pinned source projection](pinning-evidence.md), [Cursor setup correction](cursor-repair-evidence.md)
  and [repeat wait correction](repeat-wait-evidence.md).

Exact local preview-experiment source is retained as non-executable `.source.txt`
snapshots in `preview-experiment/`; original basenames and SHA256 values are in
preview-evidence.md. They are archived inputs, never extra CI or product code.
Compact timing records retain observed cases/outcomes/counts before scratch
cleanup. A fresh execution uses the canonical story and then-current source,
not a removed workspace, obsolete observer note or inherited readiness.
