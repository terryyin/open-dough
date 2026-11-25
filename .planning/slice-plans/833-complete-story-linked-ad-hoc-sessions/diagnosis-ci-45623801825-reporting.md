# Diagnose story-branch CI attempt 45623801825/1

Round 1 investigates accepted slice 5 `aed91f904923b8a0c48bdc243c3bca04126f9cbe`
from clean current HEAD `a6b3b62e2b040e3e05cba26b3cdfc672ab35e4ee`.
The coordinator parked the unfinished plan edit at
`b31c12d49c01ced9189c78a00778a3fbe84dfd82`. Apply the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

The private attempt inventory and complete failing job logs are retained in
this worktree's Git evidence directory under `ci-45623801825-*`.

| CI job | Named failures | First hypothesis |
| --- | ---: | --- |
| Backend 1/3 `139238590909` | 13 | Default-checkout reporting gained the borrowed-claim instruction. The shared assertion still expects eight lines. The independent/plain launch test also checks the old landing-context contract. |
| Backend 2/3 `139238590957` | 5 | Same shared default-checkout reporting assertion. |
| E2E 6/6 `139238590969` | 6 | Voice submission reaches the same shared reporting assertion. |
| E2E 1/6 `139238591198` | 11 | Same shared assertion and two obsolete checks of the request metadata after blank Start. |
| E2E 2/6 `139238591309` | 1 | The Cursor Start journey reaches the same shared reporting assertion. |

Run one local baseline batch, sampling the shared assertion and the two
request-level assertions on the current merge before changing tests. The
current contract should expose a ninth instruction only for the exact
borrowed admitted claim, preserve native Start without injected text, and
keep the canonical context for publication. The complete affected local
batch then checks all known failures and the other callers of the changed
assertion. Run with one worker under `caffeinate -s -i` on AC and sequence
heavy browser/backend batches. Confirm mode, competing processes and load
at each run. Preserve the earlier reporting, native dispatch and published
membership assertions.

The baseline reproduced all four representative failures on macOS in one
batch, with no repair edits. This includes the eight-versus-nine-line test,
the backend plain launch's new context, and both empty and whitespace-only
Start tests. The latter two rejected the whole reporting object while their
assertions against injected input still passed. See
`ci-45623801825-baseline.log.run.json`. No platform-specific behavior is
needed to explain the matched failures. Round 1 closed at 4.0 active
minutes. The coordinator opened repair clock `ci-repair-45623801825`.

The first post-edit backend selection passed the revised reporting-block
checks and exposed an older full-attempt snapshot in Codex shutdown and
reconciliation. It lacked the landing repository now retained for that
admitted launch. The new plain-launch assertion also used a realpath for
the shown workspace on macOS. Preserve exact attempt snapshots at both
lifecycle points and use the launch's recorded spelling for the native
workspace, while the common Git directory stays resolved. Repeat the
backend selection once after correcting those expectations. The native
shutdown and reconciliation observations remain part of its proof.

The follow-on backend run passed all 78 cases on 16 files. The browser
selection passed all 45 on 18 files. Individual case names in the records
match all 18 failed backend and all 18 failed E2E cases from the five CI
jobs. Typecheck and targeted lint passed. Evidence is
`ci-45623801825-proof-matches.txt`, `ci-45623801825-revised-backend.json`
and `ci-45623801825-repair-e2e.json`. Four test and support files carry the
repair. The coordinator owns independent refactor, delivery and the
applicable hosted CI gate.

The independent refactor puts the exact borrowed authority and artifact
checks beside the existing landing capture assertions. Both affected
backend specs are under the file-size limit and all seven of their cases
passed again. Shared input and browser assertions stayed unchanged. The
focused refactor proof and static gate are retained as
`ci-45623801825-refactor-backend.json` and
`ci-45623801825-refactor-static.log.run.json`.
