# Maintainer evaluation tooling

This maintenance tool stays outside the installed client payload (ADR 0004).
Its implementation is in `src/`, reusable scenarios and assessors in `cases/`,
and controlled automated checks and retained stream inputs in `tests/`.

From the repository root, prepare the contributor toolchain:

```sh
node scripts/setup-native.mjs npm
node scripts/setup-native.mjs browser
npm run test:evaluation
```

The focused command uses the shared Distribution runner and runs only automated
tool checks. Checks use controlled hosts and retained streams; they do not prove
native agent behavior. `npm test` runs guidance and tool checks together, once
per check, under the existing Distribution Tests Intent and CI proof producer.
See [setup prerequisites](../tests/native-harness/native-setup.md) for pinned
Node, Bash, platform libraries and bounded acquisition.

Explicit native acceptance and comparison are on demand:

```sh
bash Distribution/evaluation/cases/git-publication/git-publication-native.sh --list
bash Distribution/evaluation/src/native-comparison.sh --list
bash Distribution/evaluation/src/native-comparison.sh --list --where hosts=codex --where workflow=blocked
```

Use each entry's help and case listing for supported host/case options. Native
runs retain their isolated workspace, observation, assessment and evidence
lifecycle. Paid comparisons require explicit authorization. Controlled checks
make no performance or host qualification claim (ADR 0005).

Retained stream replay inputs live in `tests/fixtures/native-streams/`. Historical
records retain their original paths and hashes; comparison recovery through
`src/native-comparison.sh --recover RECORD` preserves the original record.
See [family boundaries](../tests/native-harness/native-family-layers.md) and
[Distribution test commands](../tests/README.md).
