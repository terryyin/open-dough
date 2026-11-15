---
id: SEED-371
status: active
planted: 2026-11-15
planted_during: Terry reviewed the evaluation infrastructure retained by the second blocked-execution attempt
trigger_when: selected from the product backlog
scope: story
---

# SEED-371 — Maintain native evaluations as a distinct Distribution tool

<a id="run-and-maintain-native-evaluations-as-a-distinct-distribution-tool"></a>

### Run and maintain native evaluations as a distinct Distribution tool

**Identity:** SEED-371#run-and-maintain-native-evaluations-as-a-distinct-distribution-tool
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

For an Open Dough maintainer, make native acceptance and A/B evaluation tooling
recognizable and independently runnable, with its own automated checks, while
keeping its CI proof in the existing Distribution Tests Intent entry and its
implementation outside the installed client payload.

#### Starting evidence

`Distribution/tests/` currently mixes native runners, host adapters, comparison
orchestration, reusable scenarios and assessors with automated checks of those
tools. Some entry points combine routine checks with optional native execution.
The second blocked-execution attempt retained substantial evaluation-infrastructure
work without delivering the intended token reduction; see the
[retained findings](../../docs/maintainer/blocked-execution-experiment-findings.md).

#### Agreed scope

- Give the tool one home under `Distribution/evaluation/`, with `src/` for
  implementation, `cases/` for reusable scenarios and their assessors, `tests/`
  for automated checks of the tool, and a maintainer `README.md`.
- Share native execution, observation and assessment between acceptance journeys
  and A/B comparisons. Preserve current behavior during the relocation.
- Provide a focused evaluation-test command, such as `npm run test:evaluation`.
  Extend the existing Distribution Tests Intent source patterns and retain combined
  CI proof. A separate Intent entry can be considered later.
- Keep real native journeys and A/B experiments explicitly invoked on demand;
  routine automated checks continue to use controlled hosts and retained streams.
- Update affected callers, discovery, documentation and evidence-recovery paths.
  Keep installation governed by the declared payload.

#### Evaluation examples

- A maintainer can run the evaluation tool's automated checks independently;
  ordinary CI still reports both test sets under Distribution Tests.
- A maintainer can select and run an existing native case or comparison from its
  new home, and retained comparison evidence remains recoverable after relocation.
- Installed guidance and runtime behavior remain unchanged. Use existing
  deterministic and replay checks to verify the migration.

#### Refinement boundaries

Keep the plan short and the migration bounded. Coordinate shared-path changes with
[the active third blocked-execution attempt](SEED-368-third-blocked-execution-attempt.md#reduce-model-work-during-prolonged-supplier-waiting).
Keep the separately queued
[native comparison harness corrections](SEED-346-native-ab-comparisons.md#close-native-comparison-harness-gaps)
outside this story. Follow [ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)
for maintenance material and [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
for the evidence boundaries; align the layout description in
[ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md) through the existing
human-owned decision process if its wording needs amendment.
