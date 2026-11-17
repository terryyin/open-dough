---
id: SEED-396
status: active
planted: 2026-11-17
planted_during: Terry asked to replace Distribution evaluation shell checks with fewer JavaScript tests at a higher entry point, and to keep the guideline with that tooling
trigger_when: selected from the product backlog
scope: story
---

# SEED-396 — Evaluation checks are JavaScript at the family entry

<a id="replace-evaluation-shell-checks"></a>

### Replace evaluation shell checks with entry-point JavaScript tests

**Identity:** SEED-396#replace-evaluation-shell-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A maintainer changing native evaluation behavior proves it with JavaScript
tests that start at the family command or the assessor, and reads one
guideline in `Distribution/evaluation` for how those tests are written. The
discovered shell checks under `Distribution/evaluation/tests` are gone.

#### Why this is one change

The main suite is already JavaScript. The evaluation tree is not.
`npm run test:evaluation` discovers every `.sh` file under
`Distribution/evaluation/tests`, except `support/`, through
`scripts/test-jobs.sh`. On 2026-11-17 that tree holds:

- 61 shell files outside `support/` (about 5,600 lines). Three aggregates are
  not scheduled as their own jobs (`git-publication-native-one-shot.sh`,
  `git-publication-native-admission.sh`, `makeme-native-use.sh`), so the suite
  runs 58 shell jobs.
- 72 shell files under `support/`, sourced by those jobs.
- 15 `node:test` files, already listed in
  `Distribution/evaluation/tests/node-test-files`.

About 25 of the shell checks `source` modules in `Distribution/evaluation/src`
and call functions such as `native_journey_state_assess` or
`native_guidance_check_run_case`, then read globals such as
`native_journey_state_status`. Comments on the comparison checks name
`src/native-guidance-check.sh` as the entry, and the same files still source
`native-observation.sh`, `native-comparison-verdict.sh`, and
`native-comparison-basis.sh`. The maintainer command itself is executed by two
checks. A rename or split of a private function fails those checks when the
command's behavior is unchanged.

That is below the test-boundary rule already in
`dough-post-change-refactor`: a unit test starts at the service's command, and
a lower entry is only for a stable domain contract. Private helpers stay
behind the caller. [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
sets the ceiling for this tree. Deterministic CI checks use real commands,
controlled inputs, and counterexamples for runners and assessors. Paid host
sessions stay on demand and are not a way to "raise" a CI check.
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)
keeps this tooling out of the installed payload, so the guideline belongs in
`Distribution/evaluation`, not in an installed skill.

#### What the replacement proves

Write the checks as `node:test` files the existing runner already schedules.
Each test starts a process:

- a family command, such as `src/native-guidance-check.sh` or
  `cases/git-publication/git-publication-native.sh`, with a substitute host
  and controlled inputs; or
- an assessor applied to `observations.txt`, which is the contract
  [family layers](../../Distribution/evaluation/native-family-layers.md)
  already gives assessors. Counterexamples stay. They move to JavaScript
  that runs the assessor, and they stop sourcing it.

`cases/` and `src/` stay shell and JavaScript as they are. They are the
product under test: fixtures, runners, observers, assessors, and the
maintainer commands. The 135 shell files under `cases/` are scenarios, not
tests. Shell checks under `Distribution/tests` (install, CI, the runner) are
out of this story.

Distinct observable behaviors stay distinct cases. The existing rule forbids
folding unrelated journeys into one long test to shrink a count. The
reduction is the files and branches that only exist because a shell test
called a private function:

- Four admission checks and three one-shot checks are four-line `exec`s of an
  aggregate. One JavaScript file per family can hold those journeys as cases.
- `git-publication-native.sh` already piles many counterexample runners into
  one scheduled job by sourcing support suites. Those suites become cases at
  the publication command.
- The launch-command-tests case is split across selection, probes, the
  fixture's end-to-end consumer, and the assessor. One case file can keep
  those four observations.
- Baseline conditions, misses, readers, reuse, unavailable evidence, and
  replay-after-cleanup are six comparison behaviors of one command. They can
  share a file. They are not one assertion.
- Timeout, watchdog cleanup, workspace isolation, result retention, launch
  failure, and truncated streams are separate process outcomes of the run
  entry. Drive them with a substitute host through that entry. Delete a
  check that only sources `native-run-supervise.sh` once the entry-level
  case fails when that behavior breaks.
- `native-journey-state.sh` crafts an observations file and calls the
  assessor function. The updated-use journey is the caller; the assessor
  contract covers the rejection signals.
- `native-stream-replay.sh` overlaps the shared reader in
  `src/native-host-stream.mjs`, which already has a JavaScript test.

A private-helper check is removed only when a named entry-point test fails
if that helper breaks. A rejection signal with no remaining observation stays.

#### Guideline

Add the rule to the evaluation guides (`Distribution/evaluation/README.md`
and [family layers](../../Distribution/evaluation/native-family-layers.md)),
which today tell a new check to live in shell under `tests/<feature>/` and
to source `src/` helpers. State:

- A new evaluation check is a `node:test` file. It starts the family command,
  or applies the assessor to observations when that is the contract.
- It does not `source` production shell. It does not read the shell's globals.
- Data setup uses the existing MakeMe builders. The test states only the
  facts the behavior depends on.
- Distinct behaviors stay separate cases. Data-only variants of one behavior
  share a case.
- Paid native runs stay on the command's existing `--native` path and are
  not CI jobs.

#### Boundary

`Distribution/tests` shell checks, dashboard tests, and rewriting `src/` or
`cases/` from shell into JavaScript are out of scope. So is shrinking the
suite by deleting a behavior that no entry-point test observes.

[SEED-346](SEED-346-native-ab-comparisons.md#close-native-comparison-harness-gaps)
is a ready plan for the comparison harness. Its proof is the shell pair,
refresh, and incomplete journeys this story replaces. Those promised
behaviors (arm cleanup, working-tree payloads, qualified-host selection,
per-turn command facts) have to survive here. Landing that plan first avoids
rewriting the files it names; this story does not depend on it to start.

#### Evaluation

`npm run test:evaluation` schedules no `.sh` file under
`Distribution/evaluation/tests`. Every former shell check's purpose is either
an assertion in a JavaScript test at the family command or the assessor, or
named in the story's removal note because that entry already fails when the
behavior breaks. The evaluation guides describe the JavaScript entry and no
longer instruct a new shell check.
