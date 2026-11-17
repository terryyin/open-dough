#!/usr/bin/env bash
# Planning evidence only: real materialization and wrapper, no native session.
# Project bytes stay in the owned checkout. The short /tmp alias holds no
# project bytes and is removed with the disposable fixture.
# shellcheck disable=SC1091,SC2154 # Runner and case supply the sourced globals.
set -euo pipefail
owner=${PWD}
probe=$(mktemp -d "${owner}/.prep-fixture.XXXXXX")
short=$(mktemp -d /tmp/od-prep.XXXXXX)
trap 'rm -rf -- "${probe}" "${short}"' EXIT
mkdir -p "${probe}/source" "${probe}/work/run" "${probe}/work/tmp" "${probe}/work/bin"
# Source and arm are siblings, so real source protection stays enabled.
git archive HEAD | tar -x -C "${probe}/source"
source_dir=${probe}/source
source "${source_dir}/Distribution/evaluation/src/native-guidance-check-run.sh"
export NATIVE_GUIDANCE_CHECK_OPEN_DOUGH_SOURCE=${owner}
source "${source_dir}/Distribution/evaluation/cases/guidance-checks/launch-command-tests/case.bash"
case_materialize "${probe}/work/run" "${source_dir}" codex
workspace=${probe}/work/run/workspace
native_codex_prepare "${probe}/work/run" "${source_dir}"
[[ ${native_codex_isolate} == 1 ]]

# An owned Git/Node project surrounds this observation. Bound ancestor
# discovery so empty fake projects and extensionless CommonJS fake hosts see
# the same context as the real runner's temp tree outside any repository.
export GIT_CEILING_DIRECTORIES=${probe}/work
printf '{"type":"commonjs"}\n' > "${probe}/work/tmp/package.json"
ln -s "${probe}/work/tmp" "${short}/t"
cp /bin/ps "${probe}/work/bin/ps"
chmod 755 "${probe}/work/bin/ps"
codesign --force --sign - "${probe}/work/bin/ps"
original_path=/opt/homebrew/bin:${PATH}
private_path=${probe}/work/bin:${original_path}
cd "${workspace}"

# Reports belong inside writable TEMP_ROOT, as in an actual native arm.
run_group() {
  local name=$1 group=$2 command_path=$3 command_tmp=$4
  local config specs=()
  if [[ ${group} == backend ]]; then
    config=dashboard/backend.playwright.config.ts
    specs=("${case_backend_specs[@]}")
  else
    config=e2e/playwright.config.ts
    specs=("${case_e2e_specs[@]}")
  fi
  native_codex_wrap env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR \
    "PATH=${command_path}" "TMPDIR=${command_tmp}" \
    "PLAYWRIGHT_JSON_OUTPUT_NAME=${probe}/work/${name}.json" \
    npx playwright test --config "${config}" --reporter=json "${specs[@]}"
  command_status=0
  "${native_codex_command[@]}" > "${probe}/work/${name}.log" 2>&1 || command_status=$?
  jq -c --arg name "${name}" --argjson status "${command_status}" \
    '{name:$name,exit:$status,stats,errors,failed:[.suites[] | .. | objects | select(has("results")) | .results[] | select(.status != "passed" and .status != "skipped") | .error.message]}' "${probe}/work/${name}.json"
}
counts_are() {
  jq -e --argjson passed "$2" --argjson failed "$3" \
    '.stats.expected == $passed and .stats.unexpected == $failed and .stats.skipped == 0 and .stats.flaky == 0 and (.errors | length) == 0' \
    "${probe}/work/$1.json" > /dev/null
}

# Preserve the starting state's intentionally failing E2E argv assertion.
if [[ ${1:-} != --boundaries-only ]]; then
  run_group starting-backend backend "${private_path}" "${short}/t"
  [[ ${command_status} == 0 ]]
  counts_are starting-backend 28 0
  run_group starting-e2e e2e "${private_path}" "${short}/t"
  [[ ${command_status} != 0 ]]
  counts_are starting-e2e 0 4
  jq -e '[.. | strings | gsub("\u001b\\[[0-9;]*m"; "") | select(contains("Received length: 5"))] | length > 0' \
    "${probe}/work/starting-e2e.json" > /dev/null
fi

# This existing known final state belongs only to the observation.
git apply "${source_dir}/Distribution/evaluation/tests/native-guidance-checks/support/launch-command-tests/protective.diff"
if [[ ${1:-} != --boundaries-only ]]; then
  run_group protective-backend backend "${private_path}" "${short}/t"
  [[ ${command_status} == 0 ]]
  counts_are protective-backend 28 0
  run_group protective-e2e e2e "${private_path}" "${short}/t"
  [[ ${command_status} == 0 ]]
  counts_are protective-e2e 4 0
fi

# Use disposable protected material; never write to the real native runtime.
native_codex_wrap touch "${source_dir}/.forbidden"
if "${native_codex_command[@]}" > "${probe}/work/protection.log" 2>&1; then
  echo 'FAIL: protected source was writable' >&2
  exit 1
fi
[[ ! -e ${source_dir}/.forbidden ]]
printf 'source protection: denied\n'

# The original tool is denied. A full backend negative observation already
# reproduced broken teardown (PLAN.md); repeating it strands workers, so this
# repeat checks that boundary directly, alongside complete positive journeys.
native_codex_wrap env "PATH=${original_path}" node -e '
  const result = require("node:child_process").spawnSync("ps", ["-axo", "pid=,pgid=,stat="], {encoding:"utf8"});
  require("node:assert/strict").equal(result.error?.code, "EPERM");
  console.log("original ps: EPERM");'
"${native_codex_command[@]}"
run_group long-temp e2e "${private_path}" "${probe}/work/tmp"
[[ ${command_status} != 0 ]]
counts_are long-temp 0 4
jq -e '[.. | strings | select(contains("published work could not be read"))] | length > 0' \
  "${probe}/work/long-temp.json" > /dev/null

# The page's failure is intentionally generic. Observe the actual pinned
# endpoint consumer too, with no gh executable or stored login in its env.
native_codex_wrap node --input-type=module - "${short}/t/endpoint-control" "${probe}/work/tmp/endpoint-control"
"${native_codex_command[@]}" << 'JS'
import assert from 'node:assert/strict';
import { EndpointBinding, newSocketName } from './Distribution/src/skills/dough-execute-plan/scripts/github-request-owner-endpoint.mjs';
const binding = root => new EndpointBinding({DOUGH_GITHUB_REQUEST_OWNER_ROOT:root, PATH:'/usr/bin:/bin', HOME:root, GH_HOST:'github.com'});
const directory = await binding(process.argv[2]).directory();
assert.ok(Buffer.byteLength(`${directory}/${newSocketName()}`) <= 103);
await assert.rejects(binding(process.argv[3]).directory(), error => error.failure?.cause === 'path-too-long');
console.log('pinned endpoint: short path accepted; long path refused (path-too-long)');
JS

printf 'owned fixture and alias: removed by EXIT trap\n'
