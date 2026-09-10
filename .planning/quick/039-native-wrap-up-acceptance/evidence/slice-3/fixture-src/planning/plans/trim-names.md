# Trim names

Source: [Trim names](../seeds/SEED-001-greeting.md#trim-names)

Goal and scope: The selected story, unchanged.

## Slices

### 1. Greet a name without surrounding whitespace

Type: Behavior
Status: done
Behavior: CLI receives "  Ada  " → prints "Hello, Ada!"; internal spaces and Guest default remain unchanged.
Proof:
  command: node --test test/greet.test.mjs
  covers: no-argument default ("Hello, Guest!"), leading/trailing whitespace trim ("  Ada  " → "Hello, Ada!"), internal spaces preserved ("Ada Lovelace" → "Hello, Ada Lovelace!")
  result: pass
Evidence: [cli-run.txt](trim-names/evidence/cli-run.txt)

### 2. Confirm Guest default remains when the name argument is omitted

Type: Behavior
Status: planned
Behavior: omitting the name argument still prints "Hello, Guest!".
Proof:
  command: node --test test/greet.test.mjs
  covers: no-argument default ("Hello, Guest!")
  result: pending

## Current product behavior

A supplied name keeps every space that sits between its words; only spaces at
the two ends are dropped before the Hello line is printed. When the name
argument is omitted, the greeting uses Guest. The CLI does not read a name
from the environment, a config file, or standard input; the first command-line
argument is the only name source.

## Decisions

No generated files.

## Learnings

None.
