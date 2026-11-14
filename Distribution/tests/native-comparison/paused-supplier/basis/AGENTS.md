# CI follow-up

A small Node project with no dependencies or build step. It decides the
automatic CI repeat for a landed revision.

- Proof: `node --test tests/*.test.mjs` runs every check.
- Formatting: the project has no formatter or generator; formatting is a no-op.
- A failing or flaky check is a defect to fix, never an exemption.
- `src/fake-gh.mjs` answers the checks' GitHub reads.
- Planning records: `.planning/PRODUCT-BACKLOG.md`, seeds in
  `.planning/seeds/`, plans in `.planning/slice-plans/<NNN>-<slug>/PLAN.md`.
