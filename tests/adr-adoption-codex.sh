#!/usr/bin/env bash
set -Eeuo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/release-fixture.bash
source "${source_dir}/tests/helpers/release-fixture.bash"
# shellcheck disable=SC1091
# shellcheck source=tests/support/native-codex.sh
source "${source_dir}/tests/support/native-codex.sh"
# shellcheck disable=SC1091
# shellcheck source=tests/support/adr-adoption-codex-preparation.sh
source "${source_dir}/tests/support/adr-adoption-codex-preparation.sh"

recognition="${source_dir}/src/skills/dough-adr-awareness/RECOGNITION.md"
updater="${source_dir}/src/skills/dough-update/SKILL.md"

grep -Fq '## Assessment before replacement' "${recognition}"
grep -Fq 'Assessment is read-only.' "${recognition}"
grep -Fq 'actual repository-relative callers and discovery' "${recognition}"
grep -Fq 'readiness in Codex, Cursor, and Claude Code remains pending' \
  "${recognition}"
grep -Fq '## Retain adopter context before cleanup' "${recognition}"
grep -Fq 'do not ask for it again' "${recognition}"
grep -Fq 'Verify every original-only value individually' "${recognition}"
grep -Fq 'caller cleanup and original' "${recognition}"
grep -Fq '../dough-adr-awareness/RECOGNITION.md' "${updater}"
grep -Fq 'Do not begin the install' "${updater}"
grep -Fq 'already-installed Open Dough' "${updater}"
grep -Fq 'without rewriting its payload' "${updater}"

temporary_dir=$(mktemp -d)
failure_line=''
failure_command=''
capture_native_failure() {
  local status=$?

  failure_line=${BASH_LINENO[0]}
  failure_command=${BASH_COMMAND}
  return "${status}"
}
print_native_failure() {
  local status=$?
  if ((status != 0)); then
    printf '%s\n' '--- FAILED CODEX ADR-ADOPTION HARNESS LOCATION ---' >&2
    printf 'line: %s\ncommand: %s\n' \
      "${failure_line:-unknown}" "${failure_command:-unknown}" >&2
  fi
  if ((status != 0)) && [[ -n ${output_file:-} && -f ${output_file} ]]; then
    printf '%s\n' '--- FAILED CODEX ADR-ADOPTION ASSESSMENT OUTPUT ---' >&2
    cat "${output_file}" >&2
    if [[ -n ${command_log:-} && -f ${command_log} ]]; then
      printf '%s\n' '--- FAILED CODEX ADR-ADOPTION COMMAND LOG ---' >&2
      cat "${command_log}" >&2
    fi
  fi
  rm -rf -- "${temporary_dir}"
  exit "${status}"
}
trap capture_native_failure ERR
trap print_native_failure EXIT
candidate="${temporary_dir}/exact tagged source"
target="${temporary_dir}/donut assessment target"

build_current_tagged_release_fixture "${candidate}"
if [[ ${2:-} == 'prepare' ]]; then
  prepare_donut_adr_codex_adoption_target "${target}" "${candidate}"
else
  prepare_donut_adr_assessment_target "${target}" "${candidate}"
fi

version=$(cat "${source_dir}/VERSION")
tag="v${version}"
source_commit=$(git -C "${candidate}" rev-parse HEAD)
source_url="file://${candidate}"
candidate_tag=$(git -C "${candidate}" describe --exact-match --tags HEAD)
[[ ${candidate_tag} == "${tag}" ]]

for managed_file in \
  dough-update/SKILL.md \
  dough-adr-awareness/SKILL.md \
  dough-adr-awareness/RECOGNITION.md; do
  git -C "${candidate}" show "${tag}:src/skills/${managed_file}" \
    | cmp - "${target}/.agents/skills/${managed_file}"
done
installed_version=$(cat "${target}/.agents/skills/dough-update/VERSION")
[[ ${installed_version} == "${version}" ]]

before=$(snapshot_path_state "${target}")
before_snapshot="${temporary_dir}/before.snapshot"
printf '%s\n' "${before}" > "${before_snapshot}"
[[ ${before} == *$'file\t.agents/skills/adr-awareness/SKILL.md\t'* ]]
if [[ ${2:-} == 'prepare' ]]; then
  [[ ${before} != *$'symlink\t.claude/skills/adr-awareness\t'* ]]
else
  [[ ${before} == *$'symlink\t.claude/skills/adr-awareness\t../../.agents/skills/adr-awareness'* ]]
fi

if [[ $# == 0 ]]; then
  adoption_target="${temporary_dir}/donut Codex adoption target"
  prepare_donut_adr_codex_adoption_target "${adoption_target}" "${candidate}"
  adoption_snapshot=$(snapshot_path_state "${adoption_target}")
  [[ ${adoption_snapshot} == *$'file\t.agents/skills/adr-awareness/SKILL.md\t'* ]]
  [[ ${adoption_snapshot} != *$'symlink\t.claude/skills/adr-awareness\t'* ]]
  cmp "${target}/.agents/skills/dough-adr-awareness/RECOGNITION.md" \
    "${adoption_target}/.agents/skills/dough-adr-awareness/RECOGNITION.md"
  echo 'PASS: the Codex ADR-adoption assessment fixture contains the exact current tagged three-file payload, a behaviorally comparable local original, concrete callers/context, and complete byte/existence/symlink snapshot support.'
  echo 'PASS: the separate Codex adoption fixture bounds native mutation to one integration while retaining the original and other-host guidance.'
  echo 'PENDING: native Codex assessment or authorized preparation; run tests/adr-adoption-codex.sh --native assessment or --native prepare.'
  exit 0
fi

if [[ $# != 2 || $1 != '--native' || ! $2 =~ ^(assessment|prepare)$ ]]; then
  echo 'usage: tests/adr-adoption-codex.sh [--native assessment|prepare]' >&2
  exit 2
fi

command -v codex > /dev/null
command -v jq > /dev/null

native_codex_prepare "${temporary_dir}" "${candidate}"

if [[ $2 == 'prepare' ]]; then
  run_codex_adr_adoption_preparation \
    "${target}" "${temporary_dir}" "${candidate}" "${before_snapshot}" \
    "${source_dir}"
  exit 0
fi

output_file="${temporary_dir}/codex-assessment-output.md"
transcript="${temporary_dir}/codex-assessment-transcript.jsonl"
tool_version=$(codex --version 2>&1 | tail -n 1)

native_codex_run "${target}" "${output_file}" \
  "Use \$dough-update to assess only whether the existing local ADR guidance in this adopter could be replaced by the installed Open Dough ADR guidance. Begin with exactly: Invocation: \$dough-update. Explain the behavioral match, any gap, the project context that would have to remain, and every affected caller or discovery link so I can decide later. Do not install, update, or clean up anything. Keep the response concise." \
  "${transcript}"

after=$(snapshot_path_state "${target}")
if [[ "${before}" != "${after}" ]]; then
  echo 'FAIL: native Codex changed the assessment target.' >&2
  diff <(printf '%s\n' "${before}") <(printf '%s\n' "${after}") >&2 || true
  exit 1
fi

command_log="${temporary_dir}/codex-assessment-commands.txt"
jq -r \
  'select(.type == "item.completed" and .item.type == "command_execution") | .item.command' \
  "${transcript}" > "${command_log}"
if grep -Eiq '(^|[ /])(install\.sh|open-dough-release\.sh)( |$)|git (fetch|ls-remote)' \
  "${command_log}"; then
  echo 'FAIL: assessment invoked installation or source-fetch machinery.' >&2
  cat "${command_log}" >&2
  exit 1
fi

grep -Fq "Invocation: \$dough-update" "${output_file}"
grep -Eiq 'equivalent|behavioral(ly)? (match|coverage|plausible)|behavioral(ly)?.*replace|covers|^- Match:' \
  "${output_file}"
grep -Eiq '0001.*Accepted|Accepted.*0001' "${output_file}"
grep -Eiq '0002.*Proposed.*(non-binding|not binding)|Proposed.*(non-binding|not binding).*0002' \
  "${output_file}"
grep -Eiq 'human.*(authority|own|approve)|approval.*human' "${output_file}"
grep -Fq 'docs/adrs/README.md' "${output_file}"
grep -Fq '.cursor/rules/architecture-decisions.mdc' "${output_file}"
for affected_path in \
  '.cursor/rules/general.mdc' \
  '.cursor/agent-map.md' \
  '.claude/skills/adr-awareness'; do
  grep -Fq "${affected_path}" "${output_file}"
done
grep -Eiq 'current.*(cleanup|replacement).*(pending|not)|pending.*cleanup|cleanup.*pending' \
  "${output_file}"
grep -Eiq 'assessment.*(read-only|only)|no (files|changes).*(changed|performed)|changed nothing|did not (change|modify)|nothing was .*(edited|changed)' \
  "${output_file}"

target_digest=$(printf '%s' "${before}" | shasum -a 256 | cut -d ' ' -f 1)
printf '%s\n' '--- CODEX ADR-ADOPTION ASSESSMENT PROOF ---'
cat "${output_file}"
printf '\n%s\n' '--- CODEX ADR-ADOPTION NATIVE IDENTITY AND INTEGRITY ---'
printf 'tool version: %s\n' "${tool_version}"
printf "actual entry: \$dough-update from .agents/skills/dough-update/SKILL.md\n"
printf 'installed source: %s\n' "${source_url}"
printf 'installed release: %s\n' "${tag}"
printf 'installed release commit: %s\n' "${source_commit}"
printf '%s\n' \
  'installed paths: .agents/skills/dough-update/SKILL.md, .agents/skills/dough-update/VERSION, .agents/skills/dough-adr-awareness/SKILL.md, .agents/skills/dough-adr-awareness/RECOGNITION.md'
printf 'complete target snapshot SHA-256: %s\n' "${target_digest}"
printf 'structured transcript: %s\n' "${transcript}"
printf 'native command transcript:\n'
sed 's/^/  /' "${command_log}"
printf '%s\n' \
  'PASS: fresh native Codex invoked the installed updater assessment entry and made no installer or source-fetch call.' \
  'PASS: Codex explained behavioral coverage, required retained context, and every fixture caller/discovery-link path; cleanup remains pending.' \
  'PASS: the complete adopter target is byte-, existence-, directory-, and symlink-identical before and after assessment.' \
  'PENDING: equivalent native assessment evidence in Cursor and Claude Code.'
