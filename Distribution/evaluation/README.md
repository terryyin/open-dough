# Maintainer evaluation tooling

This maintenance tool stays outside the installed client payload (ADR 0004).
Its implementation is in `src/`, reusable scenarios and assessors in `cases/`,
and controlled automated checks and retained stream inputs in `tests/`.

From the repository root, prepare the contributor toolchain:

```sh
node scripts/setup-native.mjs npm
node scripts/setup-native.mjs browser
node scripts/setup-native.mjs check
npm run test:evaluation
```

The focused command uses the shared Distribution runner and runs only automated
tool checks. Checks use controlled hosts and retained streams; they do not prove
native agent behavior. `npm test` runs guidance and tool checks together, once
per check, under the existing Distribution Tests Intent and CI proof producer.
See [setup prerequisites](native-setup.md) for pinned
Node, Bash, platform libraries and bounded acquisition.

Explicit native acceptance and Native guidance checks are on demand:

```sh
bash Distribution/evaluation/cases/git-publication/git-publication-native.sh --help
bash Distribution/evaluation/src/native-guidance-check.sh --list
bash Distribution/evaluation/src/native-guidance-check.sh --list --where hosts=codex --where workflow=blocked
```

Use each entry's help and case listing for supported host/case options. Native
runs retain their isolated workspace, observation, assessment and evidence
lifecycle. Paid comparisons require explicit authorization. Controlled checks
make no performance or host qualification claim (ADR 0005).

Acceptance is explicit: publication uses `--native HOST --case CASE
--results-dir DIR`; page-object authoring uses its positional host/mode/artifact
directory. Case selection and one journey are in the guidance-check guide; pair options,
payload selection, refusals and recovery are in the comparison guide. These entries keep their existing supported hosts; listing
a case or passing a controlled check does not qualify a native host.
Run long local checks on macOS from a fully awake machine on AC power under
`caffeinate -s -i`. The focused command has the same silence, failure,
deadline, named-file and reporting contracts as the [shared runner](../tests/README.md#runner).

## Write an evaluation check

Apply these rules when adding or changing a controlled shell check:

- Enter at the family command with a substitute host first on `PATH`, or at
  the named layer contract: an assessor applied to `observations.txt` through
  `native_assessor_counterexamples` (see [rejected cases](native-family-layers.md#rejected-cases)).
- Do not source a private `src/` helper to call its functions or read its
  globals. For a new supervision check, run the context command with a
  substitute host rather than sourcing `native-run-supervise.sh`.
- Keep data and configuration in the script that owns them: catalog entries,
  case lists, routing tables and input lists have one home. Prove the consuming
  rule with data the check controls. For example, give the catalog command two
  local cases and prove `--where` filters by trait; do not list shipped case names.
- State each expected fact in one line through the shared expectation
  vocabulary below. An existing one-line test may stay when the line itself
  gives sufficient failure evidence.
- Keep distinct behaviors as distinct cases. Put data-only variants of one
  behavior in a row table.

Source [the test-only vocabulary](tests/native-harness/support/native-check-expectations.sh).
`native_check_workspace` allocates scratch that cleans up at exit;
`native_check_own_process` registers a process the check must clean up;
`native_check_run` runs an entry with substitute hosts and captures
`native_check_status`, stdout and stderr. Each expectation takes the fact name first:
`native_check_expect_status`, `native_check_expect_field`,
`native_check_expect_line`, `native_check_expect_absent`,
`native_check_expect_value` and `native_check_expect_process`.
See [argument forms and failure behavior](native-family-layers.md#expectation-vocabulary).

[The timeout check](tests/native-harness/native-run-timeout.sh) is the worked
example: it runs the context command with a hung substitute host, then states
status `124`, `execution-status: timeout` and the absent `adopter` directory as
one fact each. A failed expectation names its fact and prints expected/actual
values and the evidence it read; passing expectations print nothing.

These checks prove the command or named layer's behavior on controlled inputs.
They leave native agent behavior and host qualification to explicit native
acceptance; neither a passing check nor the worked example certifies a host.
Other families adopt the vocabulary when next changed. Existing lower-level
regression checks keep their coverage until an equivalent entry-level check
exists; their helper calls are not a pattern for new checks.

## Maintainer guides

| Guide | Purpose |
| --- | --- |
| [Setup](native-setup.md) | Pinned toolchain, locked dependencies and Chromium |
| [Family layers](native-family-layers.md) | Runtime, cases, assessors and check-only helpers |
| [Host streams](native-host-streams.md) | Sole reader, retained corpus and replay limits |
| [Publication acceptance](acceptance.md) | Explicit native journeys and evidence review |
| [Page-object authoring](native-page-objects.md) | Explicit authoring probes and controlled browser proof |
| [Native guidance checks](guidance-checks.md) | Case selection, procedure, one journey and new cases |
| [Comparisons](comparison.md) | Pairs, records, refresh, recovery and limits |
| [Baselines](baselines.md) | Frozen evidence and justified reuse |
| [Combined shares](../tests/runner-settings.md) | One discovery; `Distribution/evaluation/**` is CI's share 2 |

Installation remains governed by the shipped payload under
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md).
The implementation, cases, retained streams and tool checks here are source
maintenance material and do not become installed runtime content.

Retained stream replay inputs live in `tests/fixtures/native-streams/`. Historical
records retain their original paths and hashes; comparison recovery through
`src/native-guidance-check.sh --recover RECORD` preserves the original record.
See [family boundaries](native-family-layers.md) and
[Distribution test commands](../tests/README.md).
