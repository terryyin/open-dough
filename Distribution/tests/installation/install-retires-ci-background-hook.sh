#!/usr/bin/env bash
# An update removes the former background wake Stop hook only while unchanged.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/host-hooks-fixture.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
target="${temporary_dir}/project"
settings="${target}/.claude/settings.json"

# Prints each remaining wake handler as timeout:asyncRewake.
wake_timeouts() {
  node - "${settings}" << 'NODE'
const settings = JSON.parse(require('node:fs').readFileSync(process.argv[2], 'utf8'));
const wake = Object.values(settings.hooks).flat().flatMap((wrapper) => wrapper.hooks ?? [])
  .filter((hook) => hook.command.includes('/ci-background-hook.mjs') || hook.asyncRewake !== undefined);
process.stdout.write(wake.map((hook) => `${hook.timeout}:${hook.asyncRewake}`).join(' '));
NODE
}

prepare_target "${target}"
seed_exact_manual_registration "${target}"
seed_former_wake_entry "${target}" 610
output=$(bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}")
[[ "${output}" == *'hooks: registered Open Dough entries in .claude/settings.json.'* ]]
remaining=$(wake_timeouts)
[[ -z ${remaining} ]]
assert_managed_host_hooks "${target}"
assert_unrelated_preserved "${target}"

# A locally edited former entry is the developer's own handler, not a conflict.
seed_former_wake_entry "${target}" 900
output=$(bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" 2>&1)
[[ "${output}" != *'conflicting-managed-hooks'* ]]
remaining=$(wake_timeouts)
[[ ${remaining} == '900:true' ]]
assert_managed_host_hooks "${target}"
assert_unrelated_preserved "${target}"
