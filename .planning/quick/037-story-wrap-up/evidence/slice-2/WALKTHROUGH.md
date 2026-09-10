# Slice 2 behavior walkthrough

Candidate: Proposed `dough-story-wrap-up` after shared-record cleanup.
Date: 2026-09-10. Local representative records, not native acceptance.

Invocation: wrap up **Report widget status** on the Slice 1 fixture extended
with a shared seed, mixed `DearDough.md` issues, a recently-done finished
entry, an incoming plan link, and unrelated sentinels.
Builder: [build-fixture.sh](build-fixture.sh). Starting: [starting/](starting/).
Before-cleanup commit `2e11de96888e13e81bcf17824055e9f97cf6b825`.

## Shared-record closure

Deleted the spent plan, assessment `evidence/run.md`, empty plan root, spent
story section, queue entry, and recently-done tombstone. Incoming plan link
in `docs/index.md` was removed; the sibling seed link remains.

`DearDough.md`:

- `DD-001` (spent-only issue) removed as an empty container.
- `DD-003` kept with only the unrelated occurrence; spent occurrence gone.
- `DD-002` including its human note, and ambiguous `DD-004`, unchanged.

`rg --hidden --glob '!.git/**' SPENT-STORY-WIDGET-STATUS` matched nothing.
`001-widget-status` was absent. `UNRELATED-SENTINEL-KEEP` remained in
`SENTINEL.md`, the sibling seed section, and `DD-002`.

Recovery:

```
git show 2e11de96888e13e81bcf17824055e9f97cf6b825:.planning/quick/001-widget-status/PLAN.md
git show 2e11de96888e13e81bcf17824055e9f97cf6b825:DearDough.md
```

Closed snapshot: [closed/](closed/). Diff: [meta/wrap-up.diff](meta/wrap-up.diff).

## Second invocation

[rerun/](rerun/) is byte-identical to [closed/](closed/) (excluding `.git`).
Wrap-up did not recreate the plan, seed section, spent occurrences, or
finished entry, and did not claim a different story complete.

## Behavior review

1. **Invocation context.** Shared logs, incoming links, finished entries, and
   sibling seeds are now in scope for the same wrap-up.
2. **Required context.** Ambiguous log text without an execution identity is left
   intact rather than deleted.
3. **Useful outcome.** Only spent material disappeared; active sibling, human
   notes, unrelated issues, and sentinels stayed coherent; Git recovered the
   removed plan and log.

Follow-up plans and product-review advice remain unsupported.
