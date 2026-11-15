# Native evaluation tooling

This home contains native evaluation tooling for maintainers.
Evaluation material is outside the installed client payload. Controlled-host
checks prove the tooling; they do not qualify a real native host or establish
an improvement's performance.

- `src/`: shared host-stream readers.
- `cases/`: reusable scenarios, fixtures and assessors, grouped by family.
- Automated checks run through the repository's existing test runner.

Prepare the [contributor toolchain](../tests/native-harness/native-setup.md).
An explicit native run also needs that host's authenticated CLI. Native runs
may incur usage costs; choose the case and retained-result directory first.

## ADR acceptance

List the existing context cases without starting a host:

```sh
bash Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-context.sh --list
```

Run one context case explicitly; `HOST` is `codex`, `cursor` or `claude`:

```sh
bash Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-context.sh --native HOST --case context/clear --results-dir /tmp/adr-clear
```

The [ADR entry guide](../tests/adr-awareness/native-adr-awareness-wrappers.md)
describes conflict cases, installed use, delivery/updated-use, deadlines,
cleanup and retained evidence. Entries keep their existing host/case options.
Reusable ADR inputs and assessors live beside these entries in
`cases/adr-awareness/`, including the `fixtures/` projects.

Run the credential-free ADR/tool checks through the same scheduler:

```sh
npm test -- Distribution/tests/adr-awareness/native-case-selection.sh Distribution/tests/adr-awareness/native-adr-behavior.sh Distribution/tests/native-harness/native-stream-replay.sh
```
