# Native ADR-awareness check wrappers

Exact flags implemented for selecting and inspecting the existing native
checks. Native discovery, invocation, and behavior claims stay pending
(SEED-007 Story 3). This file is internal test documentation.

Leaf 1 of `.planning/quick/020-select-and-retain-native-checks/PLAN.md` owns
`--list`, `--results-dir` for listing, invalid host/case/option rejection, and
the usage text. Leaf 2 owns selected context launch with a **writable**
`--results-dir` (durable attempt under `DIR/<host>/<case>/<attempt-id>/`).
Leaf 3 owns `--deadline` and `--grace` on selected context launch (process-group
ownership; defaults leave recorded-success substitutes unchanged).
These leaves do not run selected delivery cases, enforce hung-attempt timeout,
check stream completeness, or reassess saved evidence.

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
- `delivery/legacy-refusal`
- `delivery/ordinary-update` — depends on inspected bootstrap plus a newer local tagged fixture, not a native legacy refusal
- `delivery/updated-use` — depends on the verified native `delivery/ordinary-update` in the same isolated target (record that update's attempt ID)

## `tests/dough-adr-awareness-context.sh`

```
tests/dough-adr-awareness-context.sh
tests/dough-adr-awareness-context.sh --list [--results-dir DIR]
tests/dough-adr-awareness-context.sh --native HOST SCENARIO [--results-dir DIR] [--deadline SECONDS] [--grace SECONDS]
tests/dough-adr-awareness-context.sh --native HOST --case context/clear|context/conflict [--results-dir DIR] [--deadline SECONDS] [--grace SECONDS]
```

`HOST` is `codex`, `cursor`, or `claude`. `SCENARIO` is `clear` or `conflict`.
No arguments: current deterministic cheap check. `--native HOST SCENARIO`
without `--results-dir` is the existing scratch-and-delete launch. With a
writable `--results-dir DIR`, leaf 2 retains the attempt at
`DIR/<host>/context/<scenario>/<attempt-id>/`, reports `result-path:`, and
deletes scratch. An unwritable DIR fails before launch. `--list` prints
context cases for all three hosts. `--deadline` and `--grace` are accepted on
selected native launch only (not `--list` or the no-argument check). Defaults
(3600 and 15) are high enough that recorded-success substitutes finish without
callers passing the flags. Missing or non-integer values, `--deadline 0`,
`--list --deadline`, and `--deadline` without `--native` fail before setup.

## Delivery wrappers

`tests/dough-adr-awareness-codex-delivery-to-use.sh`,
`tests/dough-adr-awareness-cursor-delivery-to-use.sh`, and
`tests/dough-adr-awareness-claude-delivery-to-use.sh`:

```
tests/dough-adr-awareness-<host>-delivery-to-use.sh
tests/dough-adr-awareness-<host>-delivery-to-use.sh --list [--results-dir DIR]
tests/dough-adr-awareness-<host>-delivery-to-use.sh --native
tests/dough-adr-awareness-<host>-delivery-to-use.sh --native --case CASE [--results-dir DIR]
```

No arguments: current deterministic cheap check. `--native` with no extra
arguments is the existing full three-session journey. `--list` prints that
host's three delivery cases. `--native` plus junk, or an unknown `--case`,
fails before `delivery_prepare_fixture`. A recognized selected `--case` is
parsed and not launched (leaves 6–8).

## `tests/native-case-selection.sh`

Credential-free proof for leaf 1: listing prints the inventory and dependencies
with zero sentinel agent calls; invalid input exits nonzero before fixtures;
default no-argument checks still pass.

## `tests/native-result-retention.sh`

Credential-free proof for leaf 2: selected context runs with recorded PATH
substitutes keep a durable unreviewed attempt after scratch cleanup. Cursor
runtime identity comes from `cursor agent --version`. An unwritable
`--results-dir` launches nothing. Explicit `--deadline`/`--grace` on a success
path are accepted; omitted flags use the high defaults.

## Later leaves (not this file's contract)

| Behavior | Owner |
| --- | --- |
| Selected context attempt + durable results | Leaf 2 |
| Deadline/grace process ownership | Leaf 3 |
| Hung process timeout | Leaf 4 |
| Failed/denied launch records | Leaf 5 |
| Incomplete stream rejection | Leaf 6 |
| Selected Codex delivery cases | Leaves 7–9 |
| Selected Cursor delivery cases | Leaves 10–12 |
| Selected Claude Code delivery cases | Leaves 13–15 |
| Offline reassessment | Leaf 16 |
