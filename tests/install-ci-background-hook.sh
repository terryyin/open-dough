#!/usr/bin/env bash
# Upgrade an existing CI Stop registration without changing local host policy.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/release-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/host-hooks-fixture.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
target="${temporary_dir}/project"
prepare_target "${target}"
seed_exact_manual_registration "${target}"
# Starting precondition: the former exact synchronous hook, without async wake.
node - "${target}/.claude/settings.json" << 'NODE'
const fs = require('node:fs');
const file = process.argv[2];
const settings = JSON.parse(fs.readFileSync(file, 'utf8'));
settings.hooks.Stop = settings.hooks.Stop.filter(wrapper => !wrapper.hooks.some(hook => hook.asyncRewake));
fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n');
NODE
output=$(bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}")
[[ "${output}" == *'hooks: registered Open Dough entries in .claude/settings.json.'* ]]
assert_managed_host_hooks "${target}"
assert_unrelated_preserved "${target}"
node - "${target}/.claude/settings.json" << 'NODE'
const fs = require('node:fs');
const assert = require('node:assert/strict');
const settings = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const hooks = settings.hooks.Stop.flatMap(wrapper => wrapper.hooks);
const wake = hooks.filter(hook => hook.command.includes('/ci-background-hook.mjs'));
assert.equal(wake.length, 1);
assert.equal(wake[0].asyncRewake, true);
assert.ok(wake[0].timeout >= 610);
assert.equal(hooks.filter(hook => hook.command.includes('/ci-host-hook.mjs')).length, 1);
NODE
# A locally changed wake handler is a conflict, even with payload force.
node - "${target}/.claude/settings.json" << 'NODE'
const fs = require('node:fs');
const file = process.argv[2];
const settings = JSON.parse(fs.readFileSync(file, 'utf8'));
settings.hooks.Stop.flatMap(wrapper => wrapper.hooks).find(hook => hook.asyncRewake).asyncRewake = false;
fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n');
NODE
before=$(snapshot_path_state "${target}")
if output=$(bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --force 2>&1); then
  echo 'FAIL: edited native wake handler must refuse before writes.' >&2
  exit 1
fi
[[ "${output}" == *'conflicting-managed-hooks'* ]]
after=$(snapshot_path_state "${target}")
[[ "${after}" == "${before}" ]]
