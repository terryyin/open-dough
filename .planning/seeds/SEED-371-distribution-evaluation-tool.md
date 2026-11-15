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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/638-distribution-evaluation-tool/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"55ea1e279fe7da2bc79be09fd9a77d16fe5b39a1331f0384c035eb51e4d8ce19","plan":"9474a2e8814af021e7cb5a1a76384d36ff3012546a26f899ed862c5591781165"}}
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

#### Scope

- Give the tool one home under `Distribution/evaluation/`, with `src/` for
  implementation, `cases/` for reusable scenarios and their assessors, `tests/`
  for automated checks of the tool, and a maintainer `README.md`.
- Reuse the existing native execution, observation and assessment in acceptance
  journeys and A/B comparisons. Relocate their shared implementation once;
  preserve case selection, host support, outcome and failure semantics,
  supervision, retention and evidence identity during the move.
- Provide the focused automated-check command `npm run test:evaluation`.
  Extend the existing Distribution Tests Intent source patterns and retain combined
  CI proof. A separate Intent entry can be considered later.
- Keep real native journeys and A/B experiments explicitly invoked on demand;
  routine automated checks continue to use controlled hosts and retained streams.
- Update affected callers, discovery, documentation and evidence-recovery paths.
  Keep retained comparison records and baseline archives byte for byte, with
  their original hashes and historical paths; relocation must not relabel an
  earlier observation or make it unrecoverable.
- Keep installation governed by the declared payload. The new home is
  maintenance material under ADR 0004, so no evaluation implementation, case,
  retained stream or automated check becomes installed runtime content.

Scope limits: no new native host support, case qualification, experiment,
performance claim, release, installation change or separate Intent entry. The
queued comparison-harness corrections retain their own outcome and proof.
Old command paths need no permanent compatibility layer: update maintained
callers and document the new commands, preserving historical evidence paths.

#### Key examples

- Given an installed contributor toolchain, a maintainer runs
  `npm run test:evaluation` → only the tool's automated checks run, using
  controlled hosts and retained streams; a broken assessor or runner fails the
  command without starting a real native host.
- Given an ordinary CI run, both guidance checks and evaluation-tool checks run
  → their file and Node-case results remain in the existing Distribution Tests
  proof, with each check scheduled once across its shares.
- Given an existing acceptance case, a maintainer explicitly invokes its new
  entry with the same host and case options → it runs the same isolated
  journey, assessment and retained-result lifecycle. An ordinary test command
  never starts that native journey.
- Given the existing comparison catalog, a maintainer lists or filters it from
  the new entry → the same cases and traits are selected. An explicitly
  requested comparison retains its existing quality-first verdict and limits;
  controlled substitutes prove the relocation without purchasing native runs.
- Given a comparison record kept before the move, a maintainer recovers it
  through the new entry → recovery finds the original committed basis and
  prints the original record unchanged. An immutable baseline archive remains
  reassessable with its original provenance after raw attempts are removed.
- Given the relocated tool in the release source, an ordinary supported
  installation → installed managed bytes and unrelated project content remain
  as before, and no evaluation material appears in the installed output.

#### Architecture

Follow [ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)
for maintenance material and
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) for the
deterministic, native-acceptance and comparison evidence boundaries. This is a
maintenance-tool relocation; a controlled host is not native acceptance proof.

Terry approved the narrow layout amendment to
[ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md) on 2026-11-15:
name `Distribution/evaluation/` as maintainer evaluation tooling, retaining
Distribution Tests as the shared Intent and CI group.

#### Refinement boundaries

Keep the plan short and the migration bounded. The third blocked-execution
attempt has landed; preserve its delivered wait behavior and the
[maintained findings](../../docs/maintainer/blocked-execution-experiment-findings.md).
Keep the separately queued
[native comparison harness corrections](SEED-346-native-ab-comparisons.md#close-native-comparison-harness-gaps)
outside this story. Recheck overlapping work on fetched trunk at execution start;
merge compatible changes and preserve their proof rather than treating a
shared filename alone as a blocking dependency.
