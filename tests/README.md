# Tests

Shell tests require **Bash 4 or newer**, with that `bash` first on `PATH`.
macOS's bundled Bash 3.2 can silently ignore failing `[[ ... ]]` assertions
under `set -e`. `npm test` (or `bash scripts/test.sh`) therefore checks the
resolved child Bash before running any checks and refuses unsupported versions.
Launching the runner with an explicit newer Bash path alone is insufficient:
the tests also launch `bash` through `PATH`.

Install a current Bash using your preferred package manager, then use its bin
directory for both the full suite and direct focused tests, for example:

```sh
PATH="/path/to/current-bash/bin:$PATH" npm test
PATH="/path/to/current-bash/bin:$PATH" bash tests/story-payload-assertions.sh
```

Direct test scripts rely on this prerequisite; the version guard lives in the
suite runner. This is a contributor test requirement; the product installer
continues to support Bash 3.2.

## Native ADR-awareness check wrappers

Exact flags implemented for selecting and inspecting the existing native
checks. Native invocation and behavior claims stay pending
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

Fixed inventory (three cases per host `codex`, `cursor`, `claude`):

- `context/clear`
- `context/conflict`
- `delivery/updated-use` — after a verified older current-contract install, ordinary no-URL update from recorded `SOURCE` then fresh use on the same verified target; both stages share one attempt

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
known stream records execution completion and `assessment-status` /
`assessment-reason` from that assessor (`pass`, `fail`, or `inconclusive`).
Process exit 0 is not a wording pass. Missing, truncated, or unknown
completion evidence is retained as `execution-status: incomplete` with
`assessment-status: not-run`, prints `result-path:`, deletes scratch, and does
not treat process exit 0 as a wording pass. Unknown event shapes stay
incomplete; adapters are not expanded to invent extra complete forms.
Recorded streams prove those contracts, not that native runtimes emit them.

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

No arguments: current deterministic cheap check (older current-contract install that writes `SOURCE`, ordinary no-URL helper update from that record, preservation). Native loading and no-URL skill behavior stay pending. `--native` with no extra arguments is the full two-session journey (ordinary update then fresh use). `--list` prints that
host's delivery case. `--native` plus junk, or an unknown `--case`,
fails before `delivery_prepare_fixture`. `--native --case delivery/updated-use` is the combined
ordinary no-URL update from recorded `SOURCE` then fresh use journey in one
attempt. Setup installs only the older tagged current-contract payload; the
ordinary update establishes the newer release. Codex, Cursor, and Claude Code each launch it through the
shared journey helpers and that host's command/event
adapter (`native_run_context_command`). `--deadline` and `--grace` apply to
both supervised stages (defaults 3600 and 15). A writable `--results-dir DIR`
retains both stages under `DIR/<host>/delivery/updated-use/<attempt-id>/`,
prints `result-path:`, and deletes scratch. Failed update starts no use; failed
use retains the successful update and the use failure. The selected path does
not retry.

### Retained selected journey evidence

A human reviewing whether a saved attempt still applies looks at that attempt
directory, not at live workspace bytes. Current retained contents:

| Path | What it is |
| --- | --- |
| `record` | Host, case, origin (`fresh`), execution-status/reason, assessment-status/reason from shared journey-state assessment, native executable/version-command/version, adapter-identity, helper/fixture/assessor identities, prompt hashes, input-hashes, artifact names |
| `update-events.jsonl` / `use-events.jsonl` | Raw supervised streams |
| `update-response.md` / `use-response.md` | Decoded stage output |
| `update-stderr.log` / `use-stderr.log` | Stage stderr |
| `update-before-snapshot.txt` / `update-after-snapshot.txt` | Target file digests around update |
| `use-before-snapshot.txt` / `use-after-snapshot.txt` | Target file digests around use |
| `source-before-snapshot.txt` / `source-after-snapshot.txt` | Fixture source digests |
| `observations.txt` | Stage outcomes, `same-target`, `real-transition`, preservation flags, versions |

Record fields used for applicability: `host`, `case`, `native-version-command`,
`native-version`, `adapter-identity`, `helper-identity`, `fixture-identity`,
`fixture-tag`, `baseline-tag`, `update-prompt-identity`, `use-prompt-identity`,
and `input-hash` lines. Cursor Agent identity is `cursor agent --version`, not
`cursor --version`. Adapter identities are `tests/support/native-codex.sh`,
`cursor-agent-stream-json`, and `claude-stream-json`. Codex activity uses
`item.completed` events and complete streams end with `turn.completed`; response
bytes still come from `-o` and are not themselves completeness proof. Cursor and
Claude Code complete streams use `{"type":"result"}`; `update-response.md` /
`use-response.md` are decoded from `.result`. Incomplete, truncated, or unknown streams stay
`execution-status: incomplete` with `assessment-status: not-run`. Execution
completion is not a behavior verdict; assessment uses observed state and
response. Native credentialed runs stay pending (SEED-007 Story 3).

## Focused proof scripts

These are credential-free checks of the wrappers above. They do not certify
native invocation or behavior.

- `tests/native-adr-behavior.sh` — shared clear/conflict behavior examples
  once (valid recommendation, valid stop, conditional stop, misleading
  wording, uncertain prose). Does not launch a native session.
- `tests/native-journey-state.sh` — shared update-then-use observation cases
  once (expected real transition, catalog/ARC-12 conflict stop, wrong
  bytes/version, protected writes, stale-target use, failed update with a
  success claim). Does not launch a native session.
- `tests/native-case-selection.sh` — listing prints the inventory with zero
  sentinel agent calls; invalid input exits nonzero before fixtures; default
  no-argument wrapper checks run independently.
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
  Complete execution records shared behavior assessment. Incomplete evidence
  with process exit 0 is retained as nonpassing with a reason and raw
  artifacts, including unknown event shapes. Complete execution is not
  recorded as a wording pass. Substitutes log every invocation.
- `tests/native-delivery-updated-use.sh` — Codex `--native --case
  delivery/updated-use` with a PATH substitute performs a real local fixture
  ordinary no-URL update from recorded `SOURCE`, then emits recorded use
  evidence. Both stages stay in one attempt after scratch cleanup. Ordinary
  prompts; assessment uses observed state and
  the shared conflict stop. Failed update starts no use; failed use retains
  the successful update and the use failure. The invocation log has no
  retry. Supervisor `--deadline`/`--grace` are accepted on the
  selected path.
- `tests/native-delivery-updated-use-adapters.sh` — Cursor and Claude Code
  `--native --case delivery/updated-use` through the same shared journey. Each
  adapter records Agent/`claude --version` identity, `--output-format
  stream-json` launches, decoded `type:result` responses, and retained stage
  artifacts. A truncated stream-json stage stays incomplete and does not start
  use. Does not repeat the Codex product-failure matrix.

## Installed story dependency checks

`bash tests/story-payload-update.sh` checks links in installed story guidance
as part of its installation/update scenarios. A missing target fails explicitly
and reports the referring installed file and unresolved target, including on
macOS's bundled Bash 3.2 without an interpreter upgrade.

`bash tests/story-payload-assertions.sh` exercises a deliberately missing
installed dependency and a valid payload in disposable fixtures. It checks the
real dependency checker and propagation through `scripts/test.sh`. This is
focused coverage of that check, not certification of every shell assertion.
