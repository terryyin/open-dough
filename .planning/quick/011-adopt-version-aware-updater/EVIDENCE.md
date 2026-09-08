# Plan 011 resolution evidence — 2026-09-06

Outcome: Open Dough independently adopted public `v0.2.0` in Codex, Cursor, and
Claude Code, used installed ADR-awareness against current Accepted decisions,
and proved current-version updates make no writes. The no-op checks were
repeated after `main` advanced the local updater and preserved that newer
project-local behavior. The released installation is committed at `706af65`.

The completed execution plan was removed after acceptance. This record retains
session identities for
[SEED-001 Story 5e](../../seeds/SEED-001-install-and-update-open-dough.md#adopt-version-aware-updater).

## Native evidence

| Platform | Adoption / ADR use / no-op |
| --- | --- |
| Codex CLI 0.144.1 | Adoption session `01a076d3-acbc-7153-bbfb-e3d698a40865` recorded unknown → 0.2.0; ADR session `01a076e5-d251-7411-81f6-daac52f98dd2` cited Accepted 0000/0003 and kept Proposed 0001/0002 non-binding; initial no-op session `01a076eb-1f4c-7621-aa01-df388ae35e8f` and post-main session `01a07708-e154-72b2-a414-6eced74922f7` both returned 0 with `apply-skip-equal`, no install entry, and unchanged exact metadata. |
| Cursor 3.19.13 / agent 2026.09.02-c22c1a3 | Interactive adoption recorded unknown → 0.2.0; ADR session `fceb7298-506a-4418-a5fe-10a0236e3417` produced the same current-decision result; no-op sessions `391a6d83-1cec-4566-b60f-06e3693232d5` and, after main, `b80048de-88b8-4d62-a9e1-ed88c6e83762` returned 0 with the selected skip trace and unchanged exact metadata. |
| Claude Code 2.1.263 | Adoption session `7de94a3f-9d3a-43dd-970c-46378d8d1f5d` recorded unknown → 0.2.0; ADR session `b66d03e0-5b54-4b02-b48c-8d62f43a9d43` produced the same current-decision result; no-op sessions `14312ac8-1273-4aca-8cbe-c4f329aa1b36` and, after main, `58741d28-e970-427a-963c-d9741d6571fc` returned 0 with the selected skip trace and unchanged exact metadata. |

Every adoption independently resolved `v0.2.0` to peeled commit
`676188a66504f7dc751e03311f9be5245757b24a`, inspected the complete helper and
payload chain, and used no `--force`. Prior native installation, version-decision,
and use evidence from Stories 5a, 5b, and
[Plan 007 evidence](../007-generalize-project-guidance/EVIDENCE.md) remains
applicable where those inputs are unchanged.
