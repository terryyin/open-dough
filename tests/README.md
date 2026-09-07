# Native ADR-awareness check wrappers

Exact flags implemented for selecting and inspecting the existing native
checks. Native discovery, invocation, and behavior claims stay pending
(SEED-007 Story 3). This file is internal test documentation.

Leaf 1 of `.planning/quick/020-select-and-retain-native-checks/PLAN.md` owns
`--list`, `--results-dir` for listing, invalid host/case/option rejection, and
the usage text. It does not run selected delivery cases, retain attempts,
enforce timeouts, check stream completeness, or reassess saved evidence.

## Shared options

| Option | Meaning |
| --- | --- |
| `--list` | Print the wrapper's inventory (host, case, purpose, setup, dependencies, prior-evidence). Read-only: no agent, no version probe, no fixture creation. |
| `--results-dir DIR` | Optional result directory. Listing may read `DIR/<host>/<case>/<attempt-id>/` as **unreviewed** prior-evidence; it never certifies reuse. DIR need not exist or be writable for listing. |
| `--case CASE` | Select one inventory case. Unknown values fail before setup. |
| `--native` | Existing native opt-in. |

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
tests/dough-adr-awareness-context.sh --native HOST SCENARIO [--results-dir DIR]
tests/dough-adr-awareness-context.sh --native HOST --case context/clear|context/conflict [--results-dir DIR]
```

`HOST` is `codex`, `cursor`, or `claude`. `SCENARIO` is `clear` or `conflict`.
No arguments: current deterministic cheap check. `--native HOST SCENARIO` is
the existing native launch path (leaf 2 owns result retention). `--list` prints
context cases for all three hosts.

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

## Later leaves (not this file's contract)

| Behavior | Owner |
| --- | --- |
| Selected context attempt + durable results | Leaf 2 |
| Hung process timeout | Leaf 3 |
| Failed/denied launch records | Leaf 4 |
| Incomplete stream rejection | Leaf 5 |
| Selected delivery journeys | Leaves 6–8 |
| Offline reassessment | Leaf 9 |
