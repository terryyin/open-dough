# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md` | changed path |
| `PLAN.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md` |
| `Distribution/src/skills/dough-execute-plan/references/story-obligations.md` | changed path |
| `story-obligations.md` | basename of `Distribution/src/skills/dough-execute-plan/references/story-obligations.md` |
| `qualified source text` | supplied |
| `source conditions` | supplied |
| `.planning/slice-plans/616-review-independently-observable-promises/PLAN` | import path of `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md` |
| `PLAN` | import path of `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md`; in 2893 files, too broad to list consumers by itself; supply it as a `--term` to list them |
| `Distribution/src/skills/dough-execute-plan/references/story-obligations` | import path of `Distribution/src/skills/dough-execute-plan/references/story-obligations.md` |
| `story-obligations` | import path of `Distribution/src/skills/dough-execute-plan/references/story-obligations.md`; in 161 files, too broad to list consumers by itself; supply it as a `--term` to list them |
| `8ac10364f82362f3dac2504304a52645ed661456` | removed from `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md`:212 |
| `/opt/homebrew/bin:$PATH` | removed from `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md`:229 |

## Scope

Whole checkout at `04c71683349c`, including uncommitted and untracked files: 6831 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md`, `Distribution/src/skills/dough-execute-plan/references/story-obligations.md`.

## Dispositions

561 located consumers, each retained once across these files:

- [acceptance-consumers-installed-1.md](acceptance-consumers-installed-1.md)
- [acceptance-consumers-records-1.md](acceptance-consumers-records-1.md)
- [acceptance-consumers-records-2.md](acceptance-consumers-records-2.md)
- [acceptance-consumers-product-1.md](acceptance-consumers-product-1.md)
- [acceptance-consumers-runtime-1.md](acceptance-consumers-runtime-1.md)
- [acceptance-consumers-tests-1.md](acceptance-consumers-tests-1.md)
- [acceptance-consumers-fixtures-1.md](acceptance-consumers-fixtures-1.md)

The installed tracer combines all changes against `--base` with explicit
`--path`; it does not filter the base diff to that path. Therefore the
coordinator's unrelated uncommitted PLAN.md also contributes generic PLAN/PATH
matches. These are explicitly dispositioned above; none justify unrelated suites.
The earlier [source1 full trace](small-consumers.md) remains applicable to
unchanged extraction and native/installation boundaries.

Additional followed dependency: `dough-resplit-story/SKILL.md` refreshes through
`obtain-source-review.md#at-acceptance`; inspected along with delegation,
wrap-up, execute SKILL and refinement planning. No duplicated extraction rule,
coordinator-side filtering or changed amendment/reuse authority was found.

## Independent refactor review

The derived `story-obligations` term is the stripped Markdown basename for
the whole workflow. No CLI operation, table header, parser or lifecycle label
changed. An [explicit name confirmation](refactor-contract-consumers.md)
nevertheless resupplied it and dispositioned all 174 located current files.
The original trace and earlier source-review trace cover 140; additional
unchanged command callers, general obligation checks, metadata and current
records add no missing qualified-record proof. Accepted CLI/gates are reused.

The plan's shared freshness sentence now names slices 1–3; slice 4 retains its
own newer pinned trunk. This corrects record attribution without changing
guidance, source promises, setup, observations or accepted proof.

### Record-only refactor trace

Command (exit 0):
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --path .planning/slice-plans/616-review-independently-observable-promises/replays/acceptance-consumers.md --path .planning/slice-plans/616-review-independently-observable-promises/replays/refactor-contract-consumers.md --term 'Each early freshness settlement was unchanged at trunk' --term 'For slices 1–3, the early freshness settlements were unchanged at trunk'`

# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `.planning/slice-plans/616-review-independently-observable-promises/replays/acceptance-consumers.md` | changed path |
| `acceptance-consumers.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/replays/acceptance-consumers.md` |
| `.planning/slice-plans/616-review-independently-observable-promises/replays/refactor-contract-consumers.md` | changed path |
| `refactor-contract-consumers.md` | basename of `.planning/slice-plans/616-review-independently-observable-promises/replays/refactor-contract-consumers.md` |
| `Each early freshness settlement was unchanged at trunk` | supplied |
| `For slices 1–3, the early freshness settlements were unchanged at trunk` | supplied |

## Scope

Whole checkout at `04c71683349c`, including uncommitted and untracked files: 6850 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `.planning/slice-plans/616-review-independently-observable-promises/replays/acceptance-consumers.md`, `.planning/slice-plans/616-review-independently-observable-promises/replays/refactor-contract-consumers.md`.

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
| `.planning/slice-plans/616-review-independently-observable-promises/PLAN.md` | `acceptance-consumers.md`, `For slices 1–3, the early freshness settlements were unchanged at trunk` | 226: `\| 4 \| [Real CLI acceptance](replays/acceptance.md): all 26+39+1 ids retained; withheld typed/inside-word proof refused; receiving G11 leaves completion blocked…` | reused: source-freshness receipt and slice-4 row inspected; slices 1–3 attribution corrected, existing complete trace link unchanged |
| `.planning/slice-plans/616-review-independently-observable-promises/replays/acceptance.md` | `acceptance-consumers.md` | 73: `The [complete trace](acceptance-consumers.md) retains every located consumer` | reused: existing complete-trace link still reaches original 561 dispositions plus independent confirmation; behavioral observations unchanged |
