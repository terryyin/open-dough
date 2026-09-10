# Formal titles

Source: [Formal titles](../seeds/SEED-001-greeting.md#formal-titles)

Goal and scope: The selected story, unchanged.

## Slices

### 1. Optional formal honorific

Type: Behavior
Status: planned
Behavior: `node src/greet.mjs --formal Ada` prints "Hello, Dr. Ada!"; omitting `--formal` still prints "Hello, Ada!".
Proof:
  command: node --test test/greet.test.mjs
  covers: formal honorific present, default greeting unchanged when the flag is absent
  result: pending

## Decisions

Retain this plan until Formal titles is executed. No generated files.
