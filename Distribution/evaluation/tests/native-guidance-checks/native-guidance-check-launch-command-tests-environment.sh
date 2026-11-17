#!/usr/bin/env bash
# Purpose: a launch-command-tests participant can run its owning proof. The
# materialized arm exports a private process-listing tool and a short private
# TMPDIR (case-environment.bash); through the real macOS write sandbox
# (native_codex_wrap), the owning backend specs and the E2E consumer reach
# their assertions and tear down; here the backend specs on the starting
# state, while the predecessor's boundaries stay observable and protected
# source stays unwritable. The starting-state E2E consumer and the protective
# reference have their own checks (…-environment-e2e.sh, -protective.sh).
# Cleanup removes the environment after success and after a failed setup.
# The environment lifecycle is checked everywhere; the sandbox exists only on
# macOS.
# shellcheck disable=SC1091,SC2154,SC2312 # Sourced support, runner and case globals; checks read what each command gives.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
source "${source_dir}/Distribution/evaluation/tests/native-guidance-checks/support/launch-command-tests/environment.bash"
# shellcheck disable=SC2218 # The system mktemp; the recording override below comes later.
work=$(mktemp -d)
# shellcheck disable=SC2218 # The system mktemp, as above.
protected=$(mktemp -d)
trap 'case_cleanup; rm -rf -- "${work}" "${protected}"' EXIT
outer_path=${PATH} outer_tmpdir=${TMPDIR-}

# A setup step that fails leaves no alias, tool or arm temporary files.
# shellcheck disable=SC2329 # Invoked by case_environment_prepare.
mktemp() { command mktemp "$@" | tee -a "${work}/made"; }
touch "${work}/blocked"
if case_environment_prepare "${work}/blocked" 2> /dev/null; then
  echo 'FAIL: preparing under a file succeeded' >&2
  exit 1
fi
unset -f mktemp
[[ -s ${work}/made && ${PATH} == "${outer_path}" && ${TMPDIR-} == "${outer_tmpdir}" ]]
while IFS= read -r made; do [[ ! -e ${made} ]]; done < "${work}/made"

# A prepared environment exports a short TMPDIR alias and PATH; cleanup
# restores both and removes the alias, tool and temporary files.
mkdir -p -- "${work}/bare"
case_environment_prepare "${work}/bare"
alias_dir=${case_environment_alias}
[[ ${TMPDIR} == "${alias_dir}/t" && -L ${alias_dir}/t && -d ${work}/bare/environment/tmp ]]
((${#TMPDIR} < 30))
[[ ${PATH} == "${work}/bare/environment/bin:${outer_path}" ]]
case_cleanup > "${work}/cleanup.out"
[[ ! -s ${work}/cleanup.out ]]
[[ ${PATH} == "${outer_path}" && ${TMPDIR-} == "${outer_tmpdir}" ]]
[[ ! -e ${alias_dir} && ! -e ${work}/bare/environment ]]

if [[ $(uname -s) == Darwin ]]; then
  environment_arm "${work}" "${protected}"
  [[ $(command -v ps) == "${root}/environment/bin/ps" && ! -u ${root}/environment/bin/ps ]]
  run_group starting-backend backend
  counts_are starting-backend 28 0
  ((group_status == 0))

  # The predecessor's boundaries: the original ps is denied, and the arm's own
  # temporary directory is too long for the pinned GitHub owner's socket.
  native_codex_wrap env "PATH=${outer_path}" node -e '
    const result = require("node:child_process").spawnSync("ps", ["-axo", "pid=,pgid=,stat="], {encoding:"utf8"});
    require("node:assert/strict").equal(result.error?.code, "EPERM");'
  "${native_codex_command[@]}"
  native_codex_wrap node --input-type=module - "${TMPDIR}/endpoint-short" "${root}/environment/tmp/endpoint-long"
  "${native_codex_command[@]}" << 'JS'
import assert from 'node:assert/strict';
import { EndpointBinding, newSocketName } from './Distribution/src/skills/dough-execute-plan/scripts/github-request-owner-endpoint.mjs';
const binding = root => new EndpointBinding({DOUGH_GITHUB_REQUEST_OWNER_ROOT:root, PATH:'/usr/bin:/bin', HOME:root, GH_HOST:'github.com'});
assert.ok(Buffer.byteLength(`${await binding(process.argv[2]).directory()}/${newSocketName()}`) <= 103);
await assert.rejects(binding(process.argv[3]).directory(), error => error.failure?.cause === 'path-too-long');
JS

  # Protection is unchanged: the protected source stays unwritable.
  native_codex_wrap touch "${protected}/.forbidden"
  if "${native_codex_command[@]}" 2> /dev/null; then
    echo 'FAIL: protected source was writable' >&2
    exit 1
  fi
  [[ ! -e ${protected}/.forbidden ]]
fi
