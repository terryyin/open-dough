#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2154 # Sourced fixture consumes platform paths and initializes snapshots.
# shellcheck disable=SC2312 # pipefail protects snapshot/digest pipelines.
set -Eeuo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
if [[ $# == 0 ]]; then
  exec bash "${source_dir}/Distribution/tests/installation/dough-update-local-guidance-rejection.sh"
fi
# shellcheck source=Distribution/tests/helpers/public-payload-fixture.bash
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"
source "${source_dir}/Distribution/evaluation/src/native-codex.sh"
source "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-proof.sh"
# shellcheck source=Distribution/evaluation/src/native-host-stream.sh
source "${source_dir}/Distribution/evaluation/src/native-host-stream.sh"

if [[ $# != 0 && ! ($# == 1 && $1 == '--native') &&
  ! ($# == 2 && $1 == '--native' && $2 =~ ^(codex|cursor|claude)$) ]]; then
  echo 'usage: Distribution/evaluation/cases/installation/dough-update-local-guidance-rejection.sh [--native [codex|cursor|claude]]' >&2
  exit 2
fi
platform=${2:-codex}
case ${platform} in
  codex) skill_root='.agents/skills' ;;
  cursor) skill_root='.agents/skills' ;;
  claude) skill_root='.claude/skills' ;;
  *) exit 2 ;;
esac

# shellcheck source=Distribution/evaluation/cases/installation/dough-update-local-guidance-fixture.sh
source "${source_dir}/Distribution/evaluation/cases/installation/dough-update-local-guidance-fixture.sh"

command -v jq > /dev/null
prompt="Use \$dough-update to assess and replace the local team architecture practice with Open Dough guidance. Do not change files. State whether ordinary Open Dough release updating is still available."
case ${platform} in
  codex)
    command -v codex > /dev/null
    native_version=$(codex --version)
    native_codex_prepare "${temporary_dir}" "${candidate}"
    native_codex_run "${target}" "${output_file}" "${prompt}" "${transcript}"
    ;;
  cursor)
    command -v cursor > /dev/null
    native_version=$(cursor agent --version)
    (
      cd -- "${target}"
      cursor agent --print --force --trust --sandbox enabled \
        --output-format stream-json --workspace "${target}" "${prompt}"
    ) > "${transcript}"
    native_host_stream cursor "${transcript}" response > "${output_file}"
    ;;
  claude)
    command -v claude > /dev/null
    native_version=$(claude --version)
    (
      cd -- "${target}"
      claude --print --permission-mode default --allowedTools 'Read,Glob,Grep,Skill' \
        --no-session-persistence --output-format stream-json --verbose "${prompt}"
    ) > "${transcript}"
    native_host_stream claude "${transcript}" response > "${output_file}"
    ;;
  *) exit 2 ;;
esac

after=$(snapshot_path_state "${target}")
source_after=$(snapshot_path_state "${candidate}")
[[ ${before} == "${after}" ]]
[[ ${source_before} == "${source_after}" ]]
grep -Fqi 'dough-update' "${output_file}"
grep -Eiq 'assess|replace' "${output_file}"
if [[ ${platform} == 'claude' ]]; then
  grep -Eiq "cannot|not support|unsupported|out of scope|isn.t something" "${output_file}"
else
  grep -Eiq 'cannot|not support|unsupported' "${output_file}"
fi
grep -Eiq 'ordinary Open Dough release updat(e|ing).*(still )?available' \
  "${output_file}"
grep -Eiq 'repository (URL|url)|source (URL|url)' "${output_file}"
case ${platform} in
  codex)
    native_host_stream codex "${transcript}" messages \
      | jq -e -s 'any(.[];
        test("(using|applying).*dough-update.*(skill|guidance)"; "i"))' > /dev/null
    ;;
  cursor)
    native_host_stream cursor "${transcript}" reads \
      | jq -e -s 'any(.[];
        (.path | endswith("/.agents/skills/dough-update/SKILL.md")) and
        (.content // "" | contains("Local-guidance replacement is not supported by dough-update.")))' \
        > /dev/null
    ;;
  claude)
    native_host_stream claude "${transcript}" tools \
      | jq -e -s 'any(.[]; .name == "Skill" and .input.skill == "dough-update")' \
        > /dev/null
    ;;
  *) exit 2 ;;
esac

command_log="${temporary_dir}/commands.txt"
inspection_log="${temporary_dir}/inspection-targets.txt"
native_host_stream "${platform}" "${transcript}" segments > "${command_log}"
native_host_stream "${platform}" "${transcript}" targets > "${inspection_log}"
if grep -Fqi 'team-architecture-practice' "${inspection_log}"; then
  echo "FAIL: ${platform} inspected the local practice after declining assessment." >&2
  exit 1
fi
if grep -Eiq 'adr-adoption|migration' "${inspection_log}"; then
  echo "FAIL: ${platform} read migration-support material." >&2
  exit 1
fi
assert_no_adr_install_or_fetch "${command_log}" \
  "${platform} local-guidance rejection"
if grep -Eiq 'adr-adoption|migration' "${command_log}"; then
  echo "FAIL: ${platform} fetched or read migration-support material." >&2
  cat "${command_log}" >&2
  exit 1
fi
if grep -Fqi 'team-architecture-practice' "${command_log}"; then
  echo "FAIL: ${platform} inspected the local practice after declining assessment." >&2
  cat "${command_log}" >&2
  exit 1
fi

version=$(cat "${candidate}/VERSION")
source_commit=$(git -C "${candidate}" rev-parse HEAD)
before_digest=$(printf '%s\n' "${before}" | shasum -a 256 | cut -d ' ' -f 1)
after_digest=$(printf '%s\n' "${after}" | shasum -a 256 | cut -d ' ' -f 1)
source_before_digest=$(printf '%s\n' "${source_before}" | shasum -a 256 | cut -d ' ' -f 1)
source_after_digest=$(printf '%s\n' "${source_after}" | shasum -a 256 | cut -d ' ' -f 1)
printf 'Platform: %s\nNative version: %s\n' "${platform}" "${native_version}"
printf 'Candidate tag: v%s\nCandidate commit: %s\n' "${version}" "${source_commit}"
printf 'Before target snapshot: %s\nAfter target snapshot: %s\n' \
  "${before_digest}" "${after_digest}"
printf 'Before source snapshot: %s\nAfter source snapshot: %s\n' \
  "${source_before_digest}" "${source_after_digest}"
printf 'Native response:\n'
cat "${output_file}"
printf '\nNative command evidence:\n'
cat "${command_log}"
printf 'PASS: native %s discovered and invoked candidate dough-update, declined reusable local-guidance replacement, performed no adoption fetch, preserved the complete target and source, and kept ordinary release update available.\n' \
  "${platform}"
