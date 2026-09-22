# Record preparation facts

Apply this after an authorized preparation write that leaves a work item with a
recorded identity in its canonical home. Call this project's installed
product-backlog recorder. Do not invent a second status grammar, free-form
readiness prose, or a parallel state file.

[dough-story-decomposition](../../dough-story-decomposition/SKILL.md),
[dough-story-refinement](../../dough-story-refinement/SKILL.md), and
[dough-slice-planning](../../dough-slice-planning/SKILL.md) link here from their
write steps. Keep competing recording rules out of those callers.

## Resolve the recorder

Resolve this project's installed skill directory in the checkout that holds the
canonical home, the same way other installed backlog tooling is resolved:
normally `.agents/skills/dough-product-backlog` for Codex/Cursor or
`.claude/skills/dough-product-backlog` for Claude Code. Run
`scripts/product-backlog.mjs` from that directory. Supply `--file` when the
backlog is not this project's default path. Resolve backlog and home links from
this project, not from this skill's location.

If the installed script, backlog path, work-item identity, or canonical home
required for the write cannot be identified, name the gap and stop that
recording step. Preserve the caller's missing-context stop for the prose write
itself. Do not guess an identity, home, or status spelling.

## When to record

Record inside the same owned preparation workspace and uncommitted disposition
as the prose write. The structured block is part of that retained draft;
[preparation disposition](../../dough-story-refinement/references/preparation-disposition.md)
still owns keep, leave-unpublished, and discard. Do not Take, move the queue,
start execution, or publish merely because recording finished.

| Authorized write | Facts to record |
| --- | --- |
| Decomposition leaves a candidate with a recorded identity | `--refinement not-refined` and `--approach unselected` |
| Refinement establishes goal, scope, and key examples | `--refinement refined`; keep an existing planned or planless approach, otherwise `--approach unselected` |
| Slice planning writes the active plan | `--refinement refined` and `--approach planned` with `--plan` relative to the canonical home |

Omit `--assessment` on these writes. A plan that still has a remaining concern
is recorded as planned, not ready. Readiness assessment is a separate
preparation-completion step; do not grant execution authority here.

## Canonical homes

- **Anchored feature story:** `--link` is the seed path plus the story anchor
  (for example `seeds/SEED-021-example.md#first-story`). `--identity` must match
  the identity that home already records.
- **Whole-document correction:** when the plan is the canonical home, `--link`
  is that plan path (for example `quick/075-correction/PLAN.md`). For
  `--approach planned`, `--plan` is relative to that file; use the plan's own
  basename (for example `PLAN.md`) so the association stays on the same
  document.

Create or update the plan file before recording a planned approach; the
recorder refuses a missing plan path.

## Commands

After the matching prose write:

```text
node <installed>/scripts/product-backlog.mjs record-state \
  --identity <id> --link <href> \
  --refinement not-refined|refined \
  --approach unselected|planned|planless \
  [--plan <path-relative-to-home>]
```

Optional check without writing:

```text
node <installed>/scripts/product-backlog.mjs read-state --link <href>
```

`read-state` reports `not-recorded`, recorded refinement/approach, and any
assessment view. Use it to confirm the facts just recorded. A refusal leaves
the home unchanged; report it and do not hand-edit a substitute block.
