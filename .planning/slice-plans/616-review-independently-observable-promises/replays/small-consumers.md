Replay trace command:
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base 7bb9992277410f6b5c3ba8da0b461c3c61939a84 --term 'independently observable promises' --term 'source-only review' --term 'obtain-source-review.md' --term 'source-review'`.

The base comparison includes coordinator-owned plan/review records. Their generic
`PLAN.md` term locates records and fixtures, not a changed parsing contract;
its broad derived `PLAN` term does not name the changed extraction behavior.
The broad derived `source-review` term was explicitly resupplied to trace the
actual changed contract. Source-only extraction is followed through runtime
callers to the unchanged table/CLI boundary. Per-file dispositions below use
those responsibility boundaries; the replay and focused observations are in
[small.md](small.md). No listed consumer is left unclassified.

# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md` | changed path |
| `PLAN.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md` |
| `.planning/slice-plans/616-review-independently-observable-promises/source-review.md` | changed path |
| `source-review.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/source-review.md` |
| `Distribution/src/skills/dough-execute-plan/references/obtain-source-review.md` | changed path |
| `obtain-source-review.md` | basename of `Distribution/src/skills/dough-execute-plan/references/obtain-source-review.md` |
| `independently observable promises` | supplied |
| `source-only review` | supplied |
| `source-review` | supplied |
| `.planning/slice-plans/616-review-independently-observable-promises/PLAN` | import path of `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md` |
| `PLAN` | import path of `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md`; in 2878 files, too broad to list consumers by itself; supply it as a `--term` to list them |
| `Distribution/src/skills/dough-execute-plan/references/obtain-source-review` | import path of `Distribution/src/skills/dough-execute-plan/references/obtain-source-review.md` |
| `obtain-source-review` | import path of `Distribution/src/skills/dough-execute-plan/references/obtain-source-review.md` |
| `.planning/slice-plans/616-review-independently-observable-promises/source-review` | import path of `.planning/slice-plans/616-review-independently-observable-promises/source-review.md` |
| `4a.1` | removed from `Distribution/src/skills/dough-execute-plan/references/obtain-source-review.md`:13 |
| `4a.6` | removed from `Distribution/src/skills/dough-execute-plan/references/obtain-source-review.md`:13 |

## Scope

Whole checkout at `7bb999227741`, including uncommitted and untracked files: 6815 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md`, `.planning/slice-plans/616-review-independently-observable-promises/source-review.md`, `Distribution/src/skills/dough-execute-plan/references/obtain-source-review.md`.

## Located consumers

The original 575 per-file dispositions are retained in the responsibility
records below. Runtime guidance and historical evidence have separate homes;
no result, matching excerpt or disposition was changed or dropped.

| Consumer responsibility | Located files | Record |
| --- | --- | --- |
| Production | 75 | [per-file dispositions](small-consumers-production.md) |
| Test | 99 | [per-file dispositions](small-consumers-tests.md) |
| Test support or stand-in | 110 | [per-file dispositions](small-consumers-test-support.md) |
| Journey or feature | 10 | [per-file dispositions](small-consumers-journeys.md) |
| Runtime guidance readers | 35 | [per-file dispositions](small-consumers-runtime-guidance.md) |
| Maintainer finding history | 201 | [per-file dispositions](small-consumers-finding-history.md) |
| Other retained evidence readers | 45 | [per-file dispositions](small-consumers-retained-evidence.md) |

## Refactor observation

The responsibility split preserves all 575 original consumer rows byte for
byte (multiset comparison passed). The existing incoming links remain valid.
The extraction brief, source-only input/return, historical mapping and record
CLI boundary are unchanged; their accepted observations remain valid.
No new product behavior or test was introduced.

Literal refactor trace command:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --path .planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-finding-history.md --path .planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-journeys.md --path .planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-production.md --path .planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-retained-evidence.md --path .planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-runtime-guidance.md --path .planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-test-support.md --path .planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-tests.md --path .planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers.md --term 'small-consumers.md'
```

# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-finding-history.md` | changed path |
| `small-consumers-finding-history.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-finding-history.md` |
| `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-journeys.md` | changed path |
| `small-consumers-journeys.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-journeys.md` |
| `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-production.md` | changed path |
| `small-consumers-production.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-production.md` |
| `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-retained-evidence.md` | changed path |
| `small-consumers-retained-evidence.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-retained-evidence.md` |
| `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-runtime-guidance.md` | changed path |
| `small-consumers-runtime-guidance.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-runtime-guidance.md` |
| `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-test-support.md` | changed path |
| `small-consumers-test-support.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-test-support.md` |
| `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-tests.md` | changed path |
| `small-consumers-tests.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-tests.md` |
| `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers.md` | changed path |
| `small-consumers.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers.md` |

## Scope

Whole checkout at `7bb999227741`, including uncommitted and untracked files: 6819 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-finding-history.md`, `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-journeys.md`, `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-production.md`, `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-retained-evidence.md`, `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-runtime-guidance.md`, `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-test-support.md`, `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers-tests.md`, `.planning/slice-plans/616-review-independently-observable-promises/replays/small-consumers.md`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

none found

### Test

none found

### Test support or stand-in

none found

### Journey or feature

none found

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md` | `small-consumers.md` | 239: `- [Consumer trace](replays/small-consumers.md) dispositions every located path.` | reused: inspected existing link still reaches this index and all preserved per-file dispositions |
| `.planning/slice-plans/616-review-independently-observable-promises/replays/small.md` | `small-consumers.md` | 230: `[Consumer trace with a disposition for every listed file](small-consumers.md).` | reused: inspected existing link still reaches this index and all preserved per-file dispositions |
