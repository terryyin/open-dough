# Plan 007 resolution evidence — 2026-09-06

Outcome: source-selectable internal extraction produced evaluated
`dough-adr-awareness` guidance. Native Codex, Cursor, and Claude Code each
proved internal extraction plus installed update-to-fresh-use behavior.

The completed execution plan was removed after acceptance. This record retains
the per-platform evidence map for
[SEED-004 Story 1](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#generalize-project-guidance).

## Native evidence

| Platform | Internal extraction | Original-context equivalence | Unrelated-project use | Installation/update/coexistence |
| --- | --- | --- | --- | --- |
| Codex | Done: slices 1–4 | Done: 5 | Done: 6, 12 | Done: 7, 10–12 |
| Cursor | Done: 13 | Shared source evaluated in 5; native behavior in 14 | Done: 14 | Done: 8, 10–11, 14 |
| Claude Code | Done: 15 | Shared source evaluated in 5; native behavior in 16 | Done: 16 | Done: 9–11, 16 |

Shared helpers centralize platform-neutral extraction and delivery assertions;
host wrappers retain only native CLI, skill-root, and isolation details.

The original native delivery used default-branch fixtures. Those discovery and
ADR observations remain reusable where source selection, payload paths, and
delivery behavior are unchanged. They do not establish later pinned-release
installation routes proved in later stories.

During final integration, `main`'s independently verified version-aware updater
superseded the branch's earlier default-branch selection. The merged installer,
updater contract, fixtures, and static checks combine that pinned-release model
with the same three-file payload; the native extraction and fresh-use behavior
above is unchanged by source selection.
