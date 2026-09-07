#!/usr/bin/env bash
# shellcheck disable=SC1091 # Shared helpers are linted separately.
# shellcheck disable=SC2312 # pipefail protects snapshot/digest pipelines.
set -Eeuo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/helpers/release-fixture.bash"
source "${source_dir}/tests/support/native-codex.sh"
source "${source_dir}/tests/support/dough-adr-awareness-proof.sh"

if [[ $# != 0 && ! ($# == 1 && $1 == '--native') ]]; then
  echo 'usage: tests/dough-update-codex-local-guidance-rejection.sh [--native]' >&2
  exit 2
fi

updater="${source_dir}/src/skills/dough-update/SKILL.md"
unsupported='Local-guidance replacement is not supported by dough-update.'
ordinary_update='Ordinary Open Dough release updates remain available from a supplied repository URL.'
grep -Fxq "${unsupported}" "${updater}"
grep -Fxq "${ordinary_update}" "${updater}"
if grep -Eq 'Assessment before replacement|Retain adopter context before cleanup|Switch callers and remove the redundant original' \
  "${updater}"; then
  echo 'FAIL: the updater still routes reusable local-guidance replacement.' >&2
  exit 1
fi

temporary_dir=$(mktemp -d)
output_file="${temporary_dir}/response.md"
transcript="${temporary_dir}/transcript.jsonl"
finish() {
  local status=$?
  if ((status != 0)); then
    [[ ! -f ${output_file} ]] || cat "${output_file}" >&2
    [[ ! -f ${transcript} ]] || cat "${transcript}" >&2
  fi
  rm -rf -- "${temporary_dir}"
  exit "${status}"
}
trap finish EXIT

candidate="${temporary_dir}/candidate"
target="${temporary_dir}/adopter"
build_current_tagged_release_fixture "${candidate}"
mkdir -p -- "${target}/.agents/skills/team-architecture-practice"
printf '%s\n' \
  '---' \
  'name: team-architecture-practice' \
  'description: Project-owned architecture review. Keep this arbitrary local guidance.' \
  '---' \
  '' \
  'Follow the team-owned review and never replace this file automatically.' > \
  "${target}/.agents/skills/team-architecture-practice/SKILL.md"
printf '%s\n' \
  '# Adopter instructions' \
  '' \
  'Preserve project-owned files and guidance.' > \
  "${target}/AGENTS.md"
bash "${candidate}/install.sh" --target "${target}" --platform codex > /dev/null

before=$(snapshot_path_state "${target}")
source_before=$(snapshot_path_state "${candidate}")
if [[ $# == 0 ]]; then
  echo 'PASS: candidate updater declares the unsupported local-guidance boundary while ordinary release update remains available.'
  echo 'PENDING: native Codex rejection; run --native.'
  exit 0
fi

command -v codex > /dev/null
command -v jq > /dev/null
native_codex_prepare "${temporary_dir}" "${candidate}"
prompt="Use \$dough-update to assess and replace the local team architecture practice with Open Dough guidance. Do not change files. State whether ordinary Open Dough release updating is still available."
native_codex_run "${target}" "${output_file}" "${prompt}" "${transcript}"

after=$(snapshot_path_state "${target}")
source_after=$(snapshot_path_state "${candidate}")
[[ ${before} == "${after}" ]]
[[ ${source_before} == "${source_after}" ]]
grep -Fqi 'dough-update' "${output_file}"
grep -Eiq 'assess|replace' "${output_file}"
grep -Eiq 'cannot|not support|unsupported' "${output_file}"
grep -Eiq 'ordinary Open Dough release updat(e|ing).*(still )?available' \
  "${output_file}"
grep -Eiq 'repository (URL|url)|source (URL|url)' "${output_file}"
jq -e -s 'any(.[]; .type == "item.completed" and
  .item.type == "agent_message" and
  (.item.text | test("(using|applying).*dough-update.*skill"; "i")))' \
  "${transcript}" > /dev/null

command_log="${temporary_dir}/commands.txt"
jq -r 'select(.type == "item.completed" and .item.type == "command_execution") | .item.command' \
  "${transcript}" > "${command_log}"
assert_no_adr_install_or_fetch "${command_log}" 'Codex local-guidance rejection'
if grep -Eiq 'RECOGNITION\.md|adr-adoption|migration' "${command_log}"; then
  echo 'FAIL: Codex fetched or read migration-support material.' >&2
  cat "${command_log}" >&2
  exit 1
fi
if grep -Fqi 'team-architecture-practice' "${command_log}"; then
  echo 'FAIL: Codex inspected the local practice after declining assessment.' >&2
  cat "${command_log}" >&2
  exit 1
fi

version=$(cat "${candidate}/VERSION")
source_commit=$(git -C "${candidate}" rev-parse HEAD)
before_digest=$(printf '%s\n' "${before}" | shasum -a 256 | cut -d ' ' -f 1)
after_digest=$(printf '%s\n' "${after}" | shasum -a 256 | cut -d ' ' -f 1)
printf 'Native Codex version: '
codex --version
printf 'Candidate tag: v%s\nCandidate commit: %s\n' "${version}" "${source_commit}"
printf 'Before target snapshot: %s\nAfter target snapshot: %s\n' \
  "${before_digest}" "${after_digest}"
printf 'Native response:\n'
cat "${output_file}"
printf '\nNative command evidence:\n'
cat "${command_log}"
echo 'PASS: native Codex discovered and invoked candidate dough-update, declined reusable local-guidance replacement, performed no adoption fetch, preserved the complete target and source, and kept ordinary release update available.'
