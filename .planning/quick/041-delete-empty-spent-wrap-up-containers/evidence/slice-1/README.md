# Slice 1 native Codex evidence

Assessment: pass. This judgment uses the native transcript only for observed
skill use and uses independent filesystem and Git checks for the behavior.

## Candidate and invocation

- Source checkout HEAD before the run: `cb76cbf66b176482f5b110ebac1518702ef8f31b`.
- `src/skills/dough-story-wrap-up/SKILL.md` SHA-256:
  `b7624ecb88cbaef2d06de0d1de96a02ca9cf93737b9e1c5ed1899006a4d01901`.
- Source patch SHA-256: `5d0c90b56412302b34de5d3bda25739369190910d410270d88a99e4568628691`.
- Host: `codex-cli 0.144.1`; model: `gpt-5.6-sol`; deadline: 3600s;
  grace: 15s.
- Fresh fixture: `/private/tmp/open-dough-quick-041-corrected.3PQGC6/fixture`.
  The installed `.agents/skills/dough-story-wrap-up/SKILL.md` byte-matched
  the candidate. An outer `sandbox-exec` profile limited writes to the
  disposable proof root and protected the Open Dough source checkout; the
  native invocation used `--sandbox danger-full-access` so Git metadata in the
  fixture was writable.
- Prompt identified the completed Trim names story and supplied the repository
  conventions, locations, status vocabulary, retrospective marker, and ordinary
  Git recovery convention. It did not supply the expected cleanup answer.

Before the run, the fixture contained the tracked plan
`planning/plans/trim-names.md`, tracked evidence
`planning/plans/trim-names/evidence/cli-run.txt`, and deliberately untracked
empty directories
`planning/plans/trim-names/evidence/session/raw`.

## Attempt disposition

The earlier workspace-write run is diagnostic only. It read the installed
wrap-up skill, but Codex could not create `.git/index.lock`, restored its
attempted cleanup, and refused closure. It supplies no behavioral proof. Its
[transcript](diagnostic-workspace-write/transcript.jsonl) and
[response](diagnostic-workspace-write/response.md) are retained to preserve the
failure diagnosis.

The corrected fresh run exited normally with `turn.completed`. Its
[transcript](native-codex/transcript.jsonl) records reading the installed
wrap-up skill. It also records the initial `rmdir` encountering the deliberately
nested directories, inspecting them, removing `raw`, `session`, `evidence`, and
`trim-names`, and committing the closure. The [response](native-codex/response.md)
reports recovery commit `27df9a7` and cleanup commit `204129b`.

## Independent checks

```text
proof:
  command: jq -e -s 'any(.[]; .type == "turn.completed")' /private/tmp/open-dough-quick-041-corrected.3PQGC6/transcript.jsonl && jq -e -s 'any(.[]; .type == "item.completed" and .item.type == "command_execution" and ((.item.command // "") | test("dough-story-wrap-up/SKILL\\.md")))' /private/tmp/open-dough-quick-041-corrected.3PQGC6/transcript.jsonl
  covers: completed native turn and observed installed skill use
  result: pass
```

```text
proof:
  command: test ! -e /private/tmp/open-dough-quick-041-corrected.3PQGC6/fixture/planning/plans/trim-names.md && test ! -e /private/tmp/open-dough-quick-041-corrected.3PQGC6/fixture/planning/plans/trim-names/evidence/cli-run.txt && test ! -e /private/tmp/open-dough-quick-041-corrected.3PQGC6/fixture/planning/plans/trim-names/evidence/session/raw && test ! -e /private/tmp/open-dough-quick-041-corrected.3PQGC6/fixture/planning/plans/trim-names/evidence && test ! -e /private/tmp/open-dough-quick-041-corrected.3PQGC6/fixture/planning/plans/trim-names
  covers: exact absence of the spent plan and all evidence container paths, including the nested untracked empty directories
  result: pass
```

```text
proof:
  command: git -C /private/tmp/open-dough-quick-041-corrected.3PQGC6/fixture show 27df9a7:planning/plans/trim-names.md >/dev/null && git -C /private/tmp/open-dough-quick-041-corrected.3PQGC6/fixture show 27df9a7:planning/plans/trim-names/evidence/cli-run.txt >/dev/null
  covers: Git recovery of both deleted tracked files from the before-cleanup commit
  result: pass
```

```text
proof:
  command: cmp /private/tmp/open-dough-quick-041-corrected.3PQGC6/unrelated-hashes-before.txt /private/tmp/open-dough-quick-041-corrected.3PQGC6/unrelated-hashes-after.txt && cmp /private/tmp/open-dough-quick-041-corrected.3PQGC6/formal-before.txt /private/tmp/open-dough-quick-041-corrected.3PQGC6/formal-after.txt && cmp /private/tmp/open-dough-quick-041-corrected.3PQGC6/direction-before.txt /private/tmp/open-dough-quick-041-corrected.3PQGC6/direction-after.txt && rg -q 'Formal titles' /private/tmp/open-dough-quick-041-corrected.3PQGC6/fixture/planning/PRODUCT-BACKLOG.md && rg -q 'DD-002' /private/tmp/open-dough-quick-041-corrected.3PQGC6/fixture/DearDough.md && test -z "$(git -C /private/tmp/open-dough-quick-041-corrected.3PQGC6/fixture status --porcelain --untracked-files=all)"
  covers: byte-preserved source/tests, sibling story and near-future direction, unrelated process-log entry, and a clean final fixture
  result: pass
```

Final fixture revisions:

- before-cleanup: `27df9a78e12d9c15e99127dd9b654c7e9d6154b3`;
- cleanup: `204129bf5f403f7a4ceb5cdb7aab1961a596e586`.

## Cursor and Claude applicability

The predecessor Cursor and Claude directory-absence observations recovered from
commit `c77be9790a44ab34ab2a6a065d95149fdd12e86e` remain applicable. Both hosts
consume the same shared wrap-up source and have no wrap-up-specific adapter;
both already removed the empty spent directories. This candidate differs only
by making that existing cleanup obligation explicit, including nested untracked
evidence directories and exact path-absence verification. This reuse does not
claim a fresh Cursor or Claude native skill-use run.
