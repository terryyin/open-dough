#!/usr/bin/env bash
# shellcheck disable=SC1091 # Shared helpers are linted separately.
# shellcheck disable=SC2312 # pipefail protects snapshot/digest pipelines.
set -Eeuo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/helpers/public-payload-fixture.bash
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/tests/helpers/release-fixture.bash"
source "${source_dir}/tests/support/native-codex.sh"
source "${source_dir}/tests/support/dough-adr-awareness-proof.sh"

if [[ $# != 0 && ! ($# == 1 && $1 == '--native') &&
  ! ($# == 2 && $1 == '--native' && $2 =~ ^(codex|cursor|claude)$) ]]; then
  echo 'usage: tests/dough-update-local-guidance-rejection.sh [--native [codex|cursor|claude]]' >&2
  exit 2
fi
platform=${2:-codex}
case ${platform} in
  codex) skill_root='.agents/skills' ;;
  cursor) skill_root='.cursor/skills' ;;
  claude) skill_root='.claude/skills' ;;
  *) exit 2 ;;
esac

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
mkdir -p -- "${target}/${skill_root}/team-architecture-practice"
printf '%s\n' \
  '---' \
  'name: team-architecture-practice' \
  'description: Project-owned architecture review. Keep this arbitrary local guidance.' \
  '---' \
  '' \
  'Follow the team-owned review and never replace this file automatically.' > \
  "${target}/${skill_root}/team-architecture-practice/SKILL.md"
printf '%s\n' \
  '# Adopter instructions' \
  '' \
  'Preserve project-owned files and guidance.' > \
  "${target}/AGENTS.md"
bash "${candidate}/install.sh" --target "${target}" --platform "${platform}" > /dev/null

before=$(snapshot_path_state "${target}")
source_before=$(snapshot_path_state "${candidate}")
if [[ $# == 0 ]]; then
  echo 'PASS: candidate updater declares the unsupported local-guidance boundary while ordinary release update remains available.'
  echo 'PENDING: native Codex, Cursor, and Claude Code rejection; run --native for each platform.'
  exit 0
fi

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
    jq -r 'select(.type == "result") | .result' "${transcript}" > "${output_file}"
    ;;
  claude)
    command -v claude > /dev/null
    native_version=$(claude --version)
    (
      cd -- "${target}"
      claude --print --permission-mode default --allowedTools 'Read,Glob,Grep,Skill' \
        --no-session-persistence --output-format stream-json --verbose "${prompt}"
    ) > "${transcript}"
    jq -r 'select(.type == "result") | .result' "${transcript}" > "${output_file}"
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
    jq -e -s 'any(.[]; .type == "item.completed" and
      .item.type == "agent_message" and
      (.item.text | test("(using|applying).*dough-update.*(skill|guidance)"; "i")))' \
      "${transcript}" > /dev/null
    ;;
  cursor)
    jq -e -s 'any(.[]; .tool_call.readToolCall? |
      ((.args.path // "") | endswith("/.cursor/skills/dough-update/SKILL.md")) and
      ((.result.success.content // "") | contains("Local-guidance replacement is not supported by dough-update.")))' \
      "${transcript}" > /dev/null
    ;;
  claude)
    jq -e -s 'any(.[] | .message.content[]?; .type == "tool_use" and
      .name == "Skill" and .input.skill == "dough-update")' \
      "${transcript}" > /dev/null
    ;;
  *) exit 2 ;;
esac

command_log="${temporary_dir}/commands.txt"
inspection_log="${temporary_dir}/inspection-targets.txt"
case ${platform} in
  codex)
    jq -r 'select(.type == "item.completed" and .item.type == "command_execution") | .item.command' \
      "${transcript}" > "${command_log}"
    ;;
  cursor)
    jq -r '.. | objects |
      (.command? // .args.command? // .input.command? // empty) | strings' \
      "${transcript}" > "${command_log}"
    jq -r '.. | objects | select(has("tool_call")) |
      .tool_call | .. | objects | .args? // empty | .. | strings' \
      "${transcript}" > "${inspection_log}"
    ;;
  claude)
    jq -r '.. | objects |
      (.command? // .args.command? // .input.command? // empty) | strings' \
      "${transcript}" > "${command_log}"
    jq -r '.message.content[]? |
      select(.type == "tool_use" and (.name == "Read" or .name == "Glob" or .name == "Grep")) |
      .input | .. | strings' "${transcript}" > "${inspection_log}"
    ;;
  *) exit 2 ;;
esac
if [[ -f ${inspection_log} ]] && grep -Fqi 'team-architecture-practice' \
  "${inspection_log}"; then
  echo "FAIL: ${platform} inspected the local practice after declining assessment." >&2
  exit 1
fi
if [[ -f ${inspection_log} ]] && grep -Eiq 'RECOGNITION\.md|adr-adoption|migration' \
  "${inspection_log}"; then
  echo "FAIL: ${platform} read migration-support material." >&2
  exit 1
fi
assert_no_adr_install_or_fetch "${command_log}" \
  "${platform} local-guidance rejection"
if grep -Eiq 'RECOGNITION\.md|adr-adoption|migration' "${command_log}"; then
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
