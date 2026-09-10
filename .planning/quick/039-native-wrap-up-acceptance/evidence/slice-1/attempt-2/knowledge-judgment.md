# Lasting knowledge judgment (attempt 2)

SEED-011: useful product knowledge appears in maintained documentation without
the old story/plan identity or judgments about its execution.

## Spent-plan source (deleted; recovered from f797bd4)

The spent plan stated that a supplied name keeps internal spaces, that only
end spaces are dropped, that an omitted argument greets Guest, and that the
CLI does not read a name from the environment, a config file, or standard
input because the first command-line argument is the only name source.

## README after wrap-up

```
The first command-line argument supplies the name. Leading and trailing
whitespace is removed while spaces within the name are preserved. When no name
is supplied, the greeting uses `Guest`.
```

## Judgment

Pass. The README now states current product behavior for later readers:
argument-sourced name, end-trim, internal spaces kept, Guest default. It
does not name Trim names, SEED-001, the plan path, or the empty retrospective.
It does not judge the execution. The environment/config/stdin negatives were
rewritten as the positive fact that the first argument supplies the name,
which matches "do not invent" and "without story or plan identity." Tests
were preserved unchanged. Exact spent-plan wording was not required.
