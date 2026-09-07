#!/usr/bin/env bash
# shellcheck disable=SC1091 # Shared helpers are linted separately.
# shellcheck disable=SC2312 # pipefail preserves failures in digest pipelines.
set -Eeuo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/helpers/public-payload-fixture.bash
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck source=tests/helpers/release-fixture.bash
source "${source_dir}/tests/helpers/release-fixture.bash"
# shellcheck source=tests/support/native-codex.sh
source "${source_dir}/tests/support/native-codex.sh"
# shellcheck source=tests/support/dough-adr-awareness-proof.sh
source "${source_dir}/tests/support/dough-adr-awareness-proof.sh"
# shellcheck source=tests/support/dough-adr-awareness-use.sh
source "${source_dir}/tests/support/dough-adr-awareness-use.sh"

if [[ $# != 0 && ! ($# == 2 && $1 == '--native' && $2 =~ ^(explicit|automatic)$) ]]; then
  echo 'usage: tests/dough-adr-awareness-codex-use.sh [--native explicit|automatic]' >&2
  exit 2
fi

temporary_dir=$(mktemp -d)
output_file=''
transcript=''
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
candidate="${temporary_dir}/exact tagged source"
target="${temporary_dir}/installed ADR-awareness target"
build_current_tagged_release_fixture "${candidate}"
prepare_installed_adr_awareness_codex_target "${target}" "${candidate}"
version=$(cat "${source_dir}/VERSION")
tag="v${version}"
installed_version=$(cat "${target}/.agents/skills/dough-update/VERSION")
assert_tagged_adr_awareness_payload \
  "${candidate}" "${tag}" "${target}" "${installed_version}" "${version}"
[[ ! -e "${target}/.agents/skills/adr-awareness" ]]
[[ ! -L "${target}/.claude/skills/adr-awareness" ]]
for caller in \
  .cursor/rules/general.mdc \
  .cursor/rules/architecture-decisions.mdc \
  .cursor/agent-map.md \
  docs/adrs/README.md; do
  grep -Fq 'dough-adr-awareness' "${target}/${caller}"
  grep -Fq '.agents/skills/adr-awareness' "${target}/${caller}" && exit 1
done
grep -Fq 'Cross-cutting stack' \
  "${target}/.cursor/rules/architecture-decisions.mdc"
grep -Fq 'pointing at the ADR and the exception' \
  "${target}/.cursor/rules/architecture-decisions.mdc"
for protected_file in \
  .agents/skills/unrelated-guidance/SKILL.md \
  .cursor/skills/other-host-guidance/SKILL.md \
  .claude/skills/other-host-guidance/SKILL.md \
  AGENTS.md \
  docs/adrs/0001-session-state.md \
  docs/adrs/0002-package-sessions.md; do
  cmp \
    "${source_dir}/tests/fixtures/adr-awareness/installed-use/${protected_file}" \
    "${target}/${protected_file}"
done
before=$(snapshot_path_state "${target}")
source_before=$(snapshot_path_state "${candidate}")

if [[ $# == 0 ]]; then
  [[ ${before} == "$(snapshot_path_state "${target}")" ]]
  [[ ${source_before} == "$(snapshot_path_state "${candidate}")" ]]
  echo 'PASS: direct installed-use fixture has repaired callers, retained context and protected files, no obsolete original, and the exact tagged payload.'
  echo 'PENDING: native Codex installed-guidance use; run --native explicit and --native automatic.'
  exit 0
fi

mode=$2
command -v codex > /dev/null
command -v jq > /dev/null
native_codex_prepare "${temporary_dir}" "${candidate}"
output_file="${temporary_dir}/${mode}-output.md"
transcript="${temporary_dir}/${mode}-transcript.jsonl"
prompt='Assess how two backend instances should share login sessions. Do not edit files.'
if [[ ${mode} == 'explicit' ]]; then
  prompt="Use \$dough-adr-awareness. ${prompt}"
fi

native_codex_run "${target}" "${output_file}" "${prompt}" "${transcript}"
after=$(snapshot_path_state "${target}")
if [[ ${before} != "${after}" ]]; then
  echo 'FAIL: native use changed the target.' >&2
  diff <(printf '%s\n' "${before}") <(printf '%s\n' "${after}") >&2 || true
  exit 1
fi
source_after=$(snapshot_path_state "${candidate}")
[[ ${source_before} == "${source_after}" ]]
command_log="${temporary_dir}/${mode}-commands.txt"
jq -r 'select(.type == "item.completed" and .item.type == "command_execution") | .item.command' \
  "${transcript}" > "${command_log}"
assert_no_adr_awareness_maintenance "${command_log}" 'installed guidance use'
source_commit=$(git -C "${candidate}" rev-parse HEAD)
before_digest=$(printf '%s\n' "${before}" | shasum -a 256 | cut -d ' ' -f 1)
after_digest=$(printf '%s\n' "${after}" | shasum -a 256 | cut -d ' ' -f 1)
printf '\nNative observation: %s\nPrompt: %s\n' "${mode}" "${prompt}"
codex --version
printf 'Local fixture tag: %s\nLocal fixture commit: %s\n' \
  "${tag}" "${source_commit}"
printf 'Before target snapshot SHA-256: %s\n' "${before_digest}"
printf 'After target snapshot SHA-256: %s\n' "${after_digest}"
if [[ ${mode} == 'explicit' ]]; then
  # Native explicit invocation can expand the skill without a shell read.
  # Its unique completion instruction must be executed, not merely claimed.
  marker_sources=$(rg -l --hidden --no-ignore -F '## ADR CHECK COMPLETE' "${target}")
  [[ ${marker_sources} == "${target}/.agents/skills/dough-adr-awareness/SKILL.md" ]]
  if ! grep -Fxq '## ADR CHECK COMPLETE' "${output_file}"; then
    echo 'FAIL: explicit native use withheld skill completion; review the reported context gap before retrying.' >&2
    exit 1
  fi
else
  jq -e -s 'any(.[]; .type == "item.completed" and
    .item.type == "command_execution" and .item.exit_code == 0 and
    (.item.command | contains(".agents/skills/dough-adr-awareness/SKILL.md")) and
    (.item.aggregated_output | contains("# ADR awareness")))' \
    "${transcript}" > /dev/null
fi
grep -Fq 'docs/adrs/0001-session-state.md' "${output_file}"
grep -Eiq 'Redis' "${output_file}"
if [[ ${mode} == 'automatic' ]]; then
  grep -Fq '.cursor/rules/architecture-decisions.mdc' "${command_log}"
fi

printf 'Native command evidence:\n'
cat "${command_log}"
printf '\nNative response:\n'
cat "${output_file}"
printf '\nSuccessful native command output (loading evidence):\n'
jq -r 'select(.type == "item.completed" and .item.type == "command_execution" and .item.exit_code == 0) | .item.aggregated_output' \
  "${transcript}"
echo 'PASS: native skill-specific completion (explicit) or successful skill read (automatic), Accepted-ADR citation and Redis advice observed; complete installed target and source snapshots unchanged without maintenance machinery.'
echo 'REVIEW: confirm actual skill loading, Accepted/Proposed treatment, human authority, and absence of fallback in the native evidence above.'
