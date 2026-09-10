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

## Current product behavior

A supplied name keeps every space that sits between its words; only spaces at
the two ends are dropped before the Hello line is printed. When the name
argument is omitted, the greeting uses Guest.

## Decisions

Retain this plan at completion. No generated files.

## Learnings

None.

## Retrospective

Status: complete
Result:

The review finished with nothing to act on. No product-review advice, no
follow-up plan, and no additional human input.

## EXECUTION RETROSPECTIVE COMPLETE
