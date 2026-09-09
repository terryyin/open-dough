# Trim names
Source: [Trim names](seed.md#trim-names)
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
## Decisions
Retain this plan at completion. No generated files.
## Learnings
None.
