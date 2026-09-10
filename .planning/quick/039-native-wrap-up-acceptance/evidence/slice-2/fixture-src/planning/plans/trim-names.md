# Trim names

Source: [Trim names](../seeds/SEED-001-greeting.md#trim-names)

Goal and scope: The selected story, unchanged.

## Slices

### 1. Greet a name without surrounding whitespace

Type: Behavior
Status: done
Behavior: CLI receives "  Ada  " → prints a greeting for Ada; internal spaces and Guest default remain unchanged.
Proof:
  command: node --test test/greet.test.mjs
  covers: no-argument default, leading/trailing whitespace trim, internal spaces preserved
  result: pass
Evidence: [cli-run.txt](trim-names/evidence/cli-run.txt)

## Current product behavior

A supplied name keeps every space that sits between its words; only spaces at
the two ends are dropped before the greeting line is printed. When the name
argument is omitted, the greeting uses Guest. The CLI does not read a name
from the environment, a config file, or standard input; the first command-line
argument is the only name source.

## Decisions

Retain this plan at completion. No generated files.

## Learnings

None.

## Retrospective

Status: complete

The review finished. Follow-up plan:
[Remove extra greeting prefix](remove-extra-greeting-prefix.md)

Product advice: put Formal titles first in the backlog so the next
customer-facing feature ships sooner than the prefix correction.

## EXECUTION RETROSPECTIVE COMPLETE
