# Refactor Checks

Inspect these checks in order during the skill's read-only decision pass.
Edit only after its scope and subsystem gates permit the candidates.

## Duplication

- **"New" duplication** means at least one copy is newly introduced or closely
  related to newly introduced code — not that every copy is new. Collapse it
  even when the other side already existed.
- Trace repeated domain knowledge through handlers, orchestration, and parallel
  representations, including existing code outside the diff. Shared persistence
  or utility helpers do not establish cohesion when callers still repeat the
  same rules or recognize successive example layouts separately.
- Distinct representations may serve distinct responsibilities; identify which
  rules need one authoritative home and which differences the domain requires.
- **Action:** use the simplest common rule supported by current evidence and
  make the complete implicated concept coherent. Reuse a suitable existing seam
  when it owns that rule; helper extraction alone is insufficient if repeated
  knowledge remains in orchestration. Preserve promised behavior and genuine
  constraints under the skill's decision gates. Do not introduce another
  recognizer or an extensibility framework justified only by hypothetical cases.

## Domain naming

- Read identifiers across the implicated concept, including untouched parallel
  representations — files, modules, classes, functions, variables, tests,
  feature files, fixtures.
- Ask: does the name match what a domain reader expects? Does it match this
  project's domain vocabulary?
- **Action:** rename when intent is unclear, misleading, mixes layers, or leaks
  development sequence numbers. Name product code by capability; keep sequence
  numbers in planning artifacts. Renaming story-shaped handlers is insufficient
  when their responsibilities still encode delivery groupings; check whether
  independent domain reasons justify the structure.

## Shotgun surgery

- Shotgun surgery: **one logical concept** (e.g. a version string) forces edits
  in many places for one purpose.
- Give shared knowledge **one** authoritative home across the concept's
  representations and orchestration. The next rule change should not require
  parallel updates to handlers for successive delivery examples.
- Acceptable extra touchpoints: tests that assert the concept, and generated
  code derived from it. Do not hardcode the same value in product paths,
  fixtures, E2E config, and feature files in parallel.
- **Action:** consolidate now behind one seam (one constant, config, or module).
  Leave only low-likelihood one-offs unabstracted.

## Dead or redundant code

Apply the [scope and justification boundary](../SKILL.md#discover-scope)
to code the current change introduced or exposed. Remove:

- Code with no caller.
- Unreachable branches.
- Pairs of edits that cancel each other (added then worked around, flags that
  never flip).
- Production code only exercised by unit tests — no real caller from a
  controller, mounted component, CLI command, MCP tool, or other entry.
- Unit tests that overlap another test on the same observable surface (same
  input/output, same entry point).
- Tests that pin internal structure rather than observable behavior — prefer
  the test that drives a stable boundary (controller, mounted component,
  end-to-end scenario).

Remove speculative code within that boundary; do not retain it for an
unspecified future need.

## File size

For every file in the current diff and every file proposed for editing:

```bash
wc -l <path>
```

Use this project's file-size limits and exemptions for plans, generated artifacts,
production code, and tests. Split files exceeding their applicable limit.
Do not impose limits copied from another project's stack.

- Split along **cohesive seams** — one concept per module, not arbitrary line
  cuts.
- Update imports. Keep the public API stable for callers outside the change.
