# Slice 1 behavior walkthrough

Candidate: Proposed `dough-story-wrap-up` source after standalone closure.
Date: 2026-09-10. Local representative records, not native cross-tool
acceptance. Output wording was not a pass condition; inspection used the
target snapshot, `git status --short`, `rg`, and `git show`.

Invocation: wrap up story **Report widget status** after completed execution and
a retrospective with no actionable output. Project conventions from the
fixture `AGENTS.md`. Fixture builder: [build-fixture.sh](build-fixture.sh).

Spent marker: `SPENT-STORY-WIDGET-STATUS`. Unrelated sentinel:
`UNRELATED-SENTINEL-KEEP`.

## Isolated single-story closure

Starting snapshot: [starting/](starting/). Before-cleanup commit
`fe8e287945be719ee52231661dc23a928eb9d47b` in the disposable Git project.

Assimilated lasting knowledge into [closed/docs/widget.md](closed/docs/widget.md):
a failed widget status check is retried twice. Product test
[closed/tests/widget-status.sh](closed/tests/widget-status.sh) unchanged.

Deleted the spent plan, empty plan root, seed `SEED-W`, and that story's
queue entry. Remaining backlog still points at the unrelated sibling.

After wrap-up, `git status --short` in the target:

```
 M .planning/PRODUCT-BACKLOG.md
 D .planning/quick/001-widget-status/PLAN.md
 D .planning/seeds/SEED-W-widget-status.md
 M docs/widget.md
```

`rg --hidden --glob '!.git/**' SPENT-STORY-WIDGET-STATUS` matched nothing,
including untracked files. `001-widget-status` and `SEED-W` were absent.
`UNRELATED-SENTINEL-KEEP` remained in `SENTINEL.md` and `SEED-U`.

Recovery:

```
git show fe8e287945be719ee52231661dc23a928eb9d47b:.planning/quick/001-widget-status/PLAN.md
git show fe8e287945be719ee52231661dc23a928eb9d47b:.planning/seeds/SEED-W-widget-status.md
```

both returned the spent files. No archive, recently-done entry, or
replacement history was added.

Closed snapshot: [closed/](closed/). Recorded diff: [meta/wrap-up.diff](meta/wrap-up.diff).

## Incomplete-plan refusal

[incomplete-plan/](incomplete-plan/) has the same story with a `planned` slice.
Wrap-up judged execution unfinished, left the tree intact, and did not emit
`## STORY WRAP-UP COMPLETE`. Spent markers remain in the plan and seed.

## Incomplete-retrospective refusal

[incomplete-retrospective/](incomplete-retrospective/) is a completed plan with
no retrospective-completion evidence. Wrap-up left the tree intact. Spent
markers remain.

## Uncommitted-history refusal

[uncommitted-history/](uncommitted-history/) has uncommitted spent `NOTES.md`
and `AGENTS.md` without commit conventions. Recovery could not be resolved.
Wrap-up left `NOTES.md` and the plan in place and did not claim closure.

## Behavior review

1. **Invocation context.** Description names wrap-up after execution and
   retrospective; the body distinguishes successful closure from refusals.
2. **Required context.** Missing Git conventions, unfinished plan, and missing
   retrospective completion each stop deletion and name the gap.
3. **Useful outcome.** The completed standalone case removes spent history,
   keeps product tests and unrelated content, assimilates the retry rule, and
   recovers deleted files from the before-cleanup commit.

Follow-up plans, shared `DearDough.md` occurrences, and product-review advice
remain unsupported and were not present in this fixture.
