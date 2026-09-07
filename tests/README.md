# Native ADR-awareness check wrappers

Exact flags implemented for selecting and inspecting the existing native
checks. Native discovery, invocation, and behavior claims stay pending
(SEED-007 Story 3). This file is internal test documentation.

## Shared options

| Option | Meaning |
| --- | --- |
| `--list` | Print the wrapper's inventory (host, case, purpose, setup, dependencies, prior-evidence). Read-only: no agent, no version probe, no fixture creation. |
| `--results-dir DIR` | Result directory. Listing may read `DIR/<host>/<case>/<attempt-id>/` as **unreviewed** prior-evidence; it never certifies reuse. DIR need not exist or be writable for listing. Selected native launch requires DIR to be a writable directory before fixture or agent launch; omit it to keep the disposable scratch path. |
| `--case CASE` | Select one inventory case. Unknown values fail before setup. |
| `--native` | Existing native opt-in. |
| `--deadline SECONDS` | Selected native launch only. Integer >= 1. Default **3600**. Invalid values fail before setup or launch. |
| `--grace SECONDS` | Selected native launch only. Integer >= 0. Default **15**. Finite termination grace after a deadline. Invalid values fail before setup or launch. |

Prior-evidence values are `none` or `unreviewed <path>`. Listing cannot print a
certified/passing reuse verdict.

Fixed inventory (five cases per host `codex`, `cursor`, `claude`):

- `context/clear`
- `context/conflict`
- `delivery/legacy-refusal` — recognized; **unavailable** for selected launch
- `delivery/ordinary-update` — recognized; **unavailable** for selected launch
- `delivery/updated-use` — combined inspected-bootstrap update then fresh use on the same verified target; both stages share one attempt

## `tests/dough-adr-awareness-context.sh`

```
tests/dough-adr-awareness-context.sh
tests/dough-adr-awareness-context.sh --list [--results-dir DIR]
tests/dough-adr-awareness-context.sh --native HOST SCENARIO [--results-dir DIR] [--deadline SECONDS] [--grace SECONDS]
tests/dough-adr-awareness-context.sh --native HOST --case context/clear|context/conflict [--results-dir DIR] [--deadline SECONDS] [--grace SECONDS]
```

`HOST` is `codex`, `cursor`, or `claude`. `SCENARIO` is `clear` or `conflict`.
No arguments: current deterministic cheap check. `--native HOST SCENARIO`
without `--results-dir` is the scratch-and-delete launch. With a writable
`--results-dir DIR`, the attempt is retained at
`DIR/<host>/context/<scenario>/<attempt-id>/`, reports `result-path:`, and
deletes scratch. An unwritable DIR fails before launch. `--list` prints
context cases for all three hosts. `--deadline` and `--grace` are accepted on
selected native launch only (not `--list` or the no-argument check). Defaults
are 3600 and 15. Missing or non-integer values, `--deadline 0`,
`--list --deadline`, and `--deadline` without `--native` fail before setup.
If the owned native command is still running when the deadline expires, the
wrapper stops that process group (TERM, then KILL after `--grace`), records
the attempt as an execution timeout (not a wording pass), keeps partial
stdout/stderr under a new attempt directory, prints `result-path:`, and
exits 124 without retrying. A previously completed sibling attempt is left
unchanged. Bound: only processes in the owned group. If the selected command
cannot run (missing executable, nonzero launch, or denied operation), the
wrapper records a nonpassing attempt with available stderr/reason, prints
`result-path:`, and returns the original failure without retrying. Cleanup
does not mask that failure. When no version can be obtained, `native-version`
is `unknown` (Cursor Agent is not inferred from `cursor --version`).
After a selected native command exits 0, the wrapper inspects the host
terminal stream, then the shared clear/conflict behavior assessor. Clear and
conflict fixtures use the same ordinary session-storage request. A complete
known stream records execution completion, a separate prerequisite/activation
result, and `assessment-status` / `assessment-reason` from that assessor
(`pass`, `fail`, or `inconclusive`). Process exit 0 is not a wording pass.
Missing, truncated, or unknown completion evidence is retained as
`execution-status: incomplete` with `assessment-status: not-run`, prints
`result-path:`, deletes scratch, and does not treat process exit 0 as a
wording pass. Unknown event shapes stay incomplete; adapters are not expanded
to invent extra complete forms. Recorded streams prove those contracts, not
that native runtimes emit them.

## Delivery wrappers

`tests/dough-adr-awareness-codex-delivery-to-use.sh`,
`tests/dough-adr-awareness-cursor-delivery-to-use.sh`, and
`tests/dough-adr-awareness-claude-delivery-to-use.sh`:

```
tests/dough-adr-awareness-<host>-delivery-to-use.sh
tests/dough-adr-awareness-<host>-delivery-to-use.sh --list [--results-dir DIR]
tests/dough-adr-awareness-<host>-delivery-to-use.sh --native
tests/dough-adr-awareness-<host>-delivery-to-use.sh --native --case CASE [--results-dir DIR] [--deadline SECONDS] [--grace SECONDS]
```

No arguments: current deterministic cheap check (fixture mismatch, bootstrap,
ordinary update, preservation). It does not run native refusal and does not
certify native refusal. `--native` with no extra arguments is the full
three-session journey. Legacy-refusal prompts keep `$dough-update` and the
source URL; they do not coach contracts, refusal, or facts to repeat.
Assessment is the shared automatic check: the incompatible contract prevents
the update and target/source stay unchanged. Unresolved refusal prose stays
inconclusive for documented review (SEED-007 Story 3). `--list` prints that
host's three delivery cases. `--native` plus junk, or an unknown `--case`,
fails before `delivery_prepare_fixture`. `delivery/legacy-refusal` and
`delivery/ordinary-update` are recognized and unavailable for selected launch
(fail before setup). `--native --case delivery/updated-use` is the combined
update then fresh use journey in one attempt. Codex, Cursor, and Claude Code
each launch it through the shared journey helpers and that host's command/event
adapter (`native_run_context_command`). `--deadline` and `--grace` apply to
both supervised stages (defaults 3600 and 15). A writable `--results-dir DIR`
retains both stages under `DIR/<host>/delivery/updated-use/<attempt-id>/`,
prints `result-path:`, and deletes scratch. Failed update starts no use; failed
use retains the successful update and the use failure. The selected path does
not run native legacy refusal and does not retry.

### Retained selected journey evidence

A human reviewing whether a saved attempt still applies looks at that attempt
directory, not at live workspace bytes. Current retained contents:

| Path | What it is |
| --- | --- |
| `record` | Host, case, origin (`fresh`), execution-status/reason, prerequisite-result/reason/evidence, assessment-status/reason from shared journey-state assessment, native executable/version-command/version, adapter-identity, helper/fixture/assessor identities, prompt hashes, input-hashes, artifact names |
| `update-events.jsonl` / `use-events.jsonl` | Raw supervised streams |
| `update-response.md` / `use-response.md` | Decoded stage output |
| `update-stderr.log` / `use-stderr.log` | Stage stderr |
| `update-before-snapshot.txt` / `update-after-snapshot.txt` | Target file digests around update |
| `use-before-snapshot.txt` / `use-after-snapshot.txt` | Target file digests around use |
| `source-before-snapshot.txt` / `source-after-snapshot.txt` | Fixture source digests |
| `observations.txt` | Stage outcomes, `same-target`, `real-transition`, preservation flags, versions |

Record fields used for applicability: `host`, `case`, `native-version-command`,
`native-version`, `adapter-identity`, `helper-identity`, `fixture-identity`,
`fixture-tag`, `bootstrap-tag`, `update-prompt-identity`, `use-prompt-identity`,
and `input-hash` lines. Cursor Agent identity is `cursor agent --version`, not
`cursor --version`. Adapter identities are `tests/support/native-codex.sh`,
`cursor-agent-stream-json`, and `claude-stream-json`. Codex complete streams use
`{"type":"item"}` with response bytes from `-o`. Cursor and Claude Code complete
streams use `{"type":"result"}`; `update-response.md` / `use-response.md` are
decoded from `.result`. Incomplete, truncated, or unknown streams stay
`execution-status: incomplete` with `assessment-status: not-run` and
`prerequisite-result: fail`. Execution completion is not a behavior verdict;
the prerequisite gate records activation separately. Native credentialed runs stay pending
(SEED-007 Story 3).

## Focused proof scripts

These are credential-free checks of the wrappers above. They do not certify
native discovery, invocation, or behavior.

- `tests/native-prerequisite-gate.sh` — shared execution-and-activation
  prerequisite cases once (success, execution failure, missing evidence,
  wrong-copy) plus per-host decoder boundary forms from recorded JSONL.
  Claude Skill request stays inconclusive. Does not launch a native session.
- `tests/native-adr-behavior.sh` — shared clear/conflict behavior examples
  once (valid recommendation, valid stop, conditional stop, misleading
  wording, uncertain prose). Does not launch a native session.
- `tests/native-journey-state.sh` — shared update-then-use observation cases
  once (expected real transition, catalog/ARC-12 conflict stop, wrong
  bytes/version, protected writes, stale-target use, failed update with a
  success claim). Does not launch a native session.
- `tests/native-legacy-refusal.sh` — shared refusal examples once (unchanged
  trees plus a genuine refusal; unrelated execution failure; a refusal claim
  accompanied by writes). Automatic checks cover those cases; unresolved
  prose stays inconclusive for documented review. Does not launch a native
  session and does not add a selected `delivery/legacy-refusal` path. Cheap
  wrappers and these examples do not certify native refusal. Story 3 still
  needs representative native refusal evidence per tool: discovery,
  invocation or application, intended behavior, and affected
  install/update/coexistence or justified reuse.
- `tests/native-case-selection.sh` — listing prints the inventory with zero
  sentinel agent calls; invalid input exits nonzero before fixtures; default
  no-argument checks still pass; selected `delivery/legacy-refusal` and
  `delivery/ordinary-update` stay unavailable.
- `tests/native-result-retention.sh` — selected context runs with recorded PATH
  substitutes keep a durable unreviewed attempt after scratch cleanup. Cursor
  runtime identity comes from `cursor agent --version`. An unwritable
  `--results-dir` launches nothing. Explicit `--deadline`/`--grace` on a success
  path are accepted; omitted flags use the defaults.
- `tests/native-run-timeout.sh` — a hang substitute starts a child, emits
  partial output, and ignores SIGTERM. Selected context with a short
  `--deadline`/`--grace` returns 124 within that bound plus cleanup slack;
  owned pids are gone; partial evidence remains; `result-path:` is printed; a
  previously completed attempt stays byte-identical; the invocation log has one
  launch and no retry.
- `tests/native-runner-failures.sh` — missing executable, nonzero launch, and
  denied-operation fixtures return nonpassing selected-context records with
  available stderr/reason; `result-path:` is printed; scratch is gone; a
  previously completed attempt stays byte-identical; the invocation log has no
  retry. When Cursor Agent version cannot be obtained, the record stores
  `native-version: unknown` and does not call `cursor --version`.
- `tests/native-stream-completeness.sh` — per-host complete, truncated, and
  missing-terminal recorded streams through the selected context entry point.
  Complete execution records shared behavior assessment separately from the
  prerequisite. Incomplete evidence with process exit 0 is retained as
  nonpassing with a reason and raw artifacts, including unknown event shapes.
  Complete execution is not recorded as a wording pass. Substitutes log every
  invocation.
- `tests/native-delivery-updated-use.sh` — Codex `--native --case
  delivery/updated-use` with a PATH substitute performs a real local fixture
  update, then emits recorded use evidence. Both stages stay in one attempt
  after scratch cleanup. Ordinary prompts; assessment uses observed state and
  the shared conflict stop. Failed update starts no use; failed use retains
  the successful update and the use failure. The invocation log has no legacy
  refusal and no retry. Supervisor `--deadline`/`--grace` are accepted on the
  selected path.
- `tests/native-delivery-updated-use-adapters.sh` — Cursor and Claude Code
  `--native --case delivery/updated-use` through the same shared journey. Each
  adapter records Agent/`claude --version` identity, `--output-format
  stream-json` launches, decoded `type:result` responses, and retained stage
  artifacts. A truncated stream-json stage stays incomplete and does not start
  use. Does not repeat the Codex product-failure matrix.
