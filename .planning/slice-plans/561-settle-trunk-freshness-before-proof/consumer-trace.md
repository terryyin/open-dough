# Slice 1 consumer trace and dispositions

Command: `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/settle-trunk-freshness-before-expensive-proof-an --base 14c211d145385d2fbbc50fb032781d3e45046354 --term source-freshness --term check-named-siblings --term 'For planned execution' --term 'freshness settlement' --term 'Deliver the change'`.

The installed script searched the whole checkout, including owned uncommitted
changes. Its effect terms include changed paths/basenames, declared and removed
symbols and the five supplied terms above. `PLAN.md`, `SKILL.md`, source-review,
finding filenames and removed wording produce broad name matches; they do not
make every matching feature depend on this ordering change. `SKILL`, `PLAN` and
`wrap-up` are broad derived terms, not changed callable contracts. Every located
consumer has an explicit run/reuse disposition or belongs to a partition below. Changed paths are reviewed
in the implementation diff and PLAN's representative walks.

Run dispositions use the literal commands and observations in PLAN's Slice 1 proof.
The source algorithm/fixtures remain unchanged and are exercised by source-freshness
and amended replay; payload links observe installer/reference reachability.
Replay/routing support checks are deterministic evidence only, never native proof.

Reused routes retain their current callers, anchors, mode/authority and required
observations. Entry routing, completion/deletion, refactor dispositions, writer
ownership, obligation checks, source review, developer observation and progress
proof were inspected and their focused consumer suites passed. Quick work keeps
its existing completion/deletion source gates; early planned settlement creates
no quick plan or sibling requirement. CI repairs retain wrap-up and the one
publication owner.

Installed-copy exclusions mean no hand-synchronization or installation was requested.
Historical-record exclusions preserve past evidence, not current assertions.
Generic/unrelated exclusions match names such as PLAN.md/SKILL.md, untouched
source-review formats, or unchanged publication/installation mechanisms: no changed
format, API, discovered skill path, data model, fixture signal or native transport
reaches their product boundary. Actual native ordering coverage is pending in
SEED-053 on all three hosts and is not claimed by an exclusion.

## run — focused consumer checks and support

- `install.sh`
- `src/skills/dough-execute-plan/scripts/source-freshness-comparison.mjs`
- `src/skills/dough-execute-plan/scripts/source-freshness.mjs`
- `src/skills/dough-execute-plan/scripts/ci-supported-host-contract.test.mjs`
- `src/skills/dough-execute-plan/scripts/consumer-trace-guidance.test.mjs`
- `src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs`
- `src/skills/dough-execute-plan/scripts/interrupted-delegation-guidance.test.mjs`
- `src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs`
- `src/skills/dough-execute-plan/scripts/source-freshness.test.mjs`
- `src/skills/dough-execute-plan/scripts/story-obligations-source-review-guidance.test.mjs`
- `src/skills/dough-story-refinement/scripts/developer-observation-guidance.test.mjs`
- `tests/delivery-evidence-amended.sh`
- `tests/delivery-evidence-native-routing.sh`
- `src/skills/dough-execute-plan/scripts/source-freshness-test-fixtures.mjs`
- `tests/support/delivery-evidence-amended-native-assess.sh`
- `tests/support/delivery-evidence-amended-native-observe.sh`
- `tests/support/delivery-evidence-native-evidence.sh`

## reused — inspected unchanged routes into shared owners

- `src/skills/dough-bug-fixing/SKILL.md`
- `src/skills/dough-execute-plan/references/ci-monitor.md`
- `src/skills/dough-execute-plan/references/delegation.md`
- `src/skills/dough-execute-plan/references/execution-decisions.md`
- `src/skills/dough-execute-plan/references/execution-location.md`
- `src/skills/dough-execute-plan/references/finish-or-stop.md`
- `src/skills/dough-execute-plan/references/one-shot.md`
- `src/skills/dough-execute-plan/references/oversized-slice.md`
- `src/skills/dough-execute-plan/references/source-freshness.md`
- `src/skills/dough-execute-plan/references/story-obligations.md`
- `src/skills/dough-execute-plan/references/trunk-publication.md`
- `src/skills/dough-slice-planning/SKILL.md`
- `src/skills/dough-story-wrap-up/SKILL.md`

## Excluded broad matches

The trace partitions all 732 located consumers: 17 run, 13 reused, and the
following disjoint exclusions. Run/reused paths above take precedence over the
selectors below. Counts preserve complete dispositions without a raw name dump.
No changed contract reaches these excluded boundaries.

| Group / selector | Located paths | Disposition and basis |
| --- | ---: | --- |
| Installed `.agents/skills/` and `.claude/skills/` copies | 131 | Excluded: author shared guidance only in `src/skills/`; no installation or update is requested. |
| `.planning/done/`, `tests/fixtures/native-streams/`, `docs/maintainer/`, and `DearDough.md` | 294 | Excluded: retained completion, native, finding and research evidence; preserve historical observations rather than rewriting them as current assertions. |
| Remaining generic basename or unchanged-contract matches | 277 | Excluded: `PLAN`/`SKILL`/`wrap-up` and source-review names, unrelated active planning records, and unchanged mechanics. No callable API, record format, fixture signal, discovery path, native transport or dashboard behavior changed. |

## Independent refactor trace

The same installed command above was run again after moving cohesive evidence
and native cases into linked records. It still located 732 consumers, with the
same dispositions. New record links resolve through PLAN and the existing
SEED-053 guarded-delivery anchor. The direct-acceptance navigation assertion now
requires the settlement link to exist before comparing its position; its focused
suite observes that route. No runtime guidance or source/publisher executable
changed during refactoring, so other accepted proof remains applicable.
