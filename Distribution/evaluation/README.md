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

Explicit native acceptance and comparison are on demand:

```sh
bash Distribution/evaluation/cases/git-publication/git-publication-native.sh --help
bash Distribution/evaluation/src/native-comparison.sh --list
bash Distribution/evaluation/src/native-comparison.sh --list --where hosts=codex --where workflow=blocked
```

Use each entry's help and case listing for supported host/case options. Native
runs retain their isolated workspace, observation, assessment and evidence
lifecycle. Paid comparisons require explicit authorization. Controlled checks
make no performance or host qualification claim (ADR 0005).

Acceptance is explicit: publication uses `--native HOST --case CASE
--results-dir DIR`; page-object authoring uses its positional host/mode/artifact
directory. Comparison options, payload selection, refusals and recovery are in
the comparison guide. These entries keep their existing supported hosts; listing
a case or passing a controlled check does not qualify a native host.
For long local runs follow the maintained [macOS sleep guard and power
condition](../tests/local-test-resources.md#machine-sleep-on-macos) and shared
full-suite admission. The focused command has the same silence, failure,
deadline, named-file and reporting contracts as the [shared runner](../tests/README.md#runner).

## Maintainer guides

| Guide | Purpose |
| --- | --- |
| [Setup](native-setup.md) | Pinned toolchain, locked dependencies and Chromium |
| [Family layers](native-family-layers.md) | Runtime, cases, assessors and check-only helpers |
| [Host streams](native-host-streams.md) | Sole reader, retained corpus and replay limits |
| [Publication acceptance](acceptance.md) | Explicit native journeys and evidence review |
| [Page-object authoring](native-page-objects.md) | Explicit authoring probes and controlled browser proof |
| [Comparisons](comparison.md) | Case selection, pairs, provenance, recovery and limits |
| [Baselines](baselines.md) | Frozen evidence and justified reuse |
| [Combined shares](../tests/test-shares.md) | One discovery and deal |

Installation remains governed by the declared payload under
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md).
The implementation, cases, retained streams and tool checks here are source
maintenance material and do not become installed runtime content.

Retained stream replay inputs live in `tests/fixtures/native-streams/`. Historical
records retain their original paths and hashes; comparison recovery through
`src/native-comparison.sh --recover RECORD` preserves the original record.
See [family boundaries](native-family-layers.md) and
[Distribution test commands](../tests/README.md).
