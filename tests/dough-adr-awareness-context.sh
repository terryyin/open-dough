#!/usr/bin/env bash
# shellcheck disable=SC1091 # Shared helpers are linted separately.
# shellcheck disable=SC2312 # pipefail protects snapshot/digest pipelines.
set -Eeuo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/helpers/release-fixture.bash"
source "${source_dir}/tests/support/native-codex.sh"
source "${source_dir}/tests/support/dough-adr-awareness-proof.sh"
source "${source_dir}/tests/support/dough-adr-awareness-use.sh"

if [[ $# != 0 && ! ($# == 3 && $1 == '--native' &&
  $2 =~ ^(codex|cursor|claude)$ && $3 =~ ^(clear|conflict)$) ]]; then
  echo 'usage: tests/dough-adr-awareness-context.sh [--native codex|cursor|claude clear|conflict]' >&2
  exit 2
fi
platform=${2:-codex}
scenario=${3:-clear}
case ${platform} in
  codex) skill_root='.agents/skills' ;;
  cursor) skill_root='.cursor/skills' ;;
  claude) skill_root='.claude/skills' ;;
  *) exit 2 ;;
esac

temporary_dir=$(mktemp -d)
transcript="${temporary_dir}/native.jsonl"
output_file="${temporary_dir}/response.md"
finish() {
  local status=$?
  if ((status != 0)); then
    [[ ! -f ${transcript} ]] || cat "${transcript}" >&2
    [[ ! -f ${output_file} ]] || cat "${output_file}" >&2
  fi
  rm -rf -- "${temporary_dir}"
  exit "${status}"
}
trap finish EXIT
candidate="${temporary_dir}/candidate"
target="${temporary_dir}/adopter"
build_current_tagged_release_fixture "${candidate}"
prepare_installed_adr_awareness_target "${target}" "${candidate}" "${platform}"
if [[ ${scenario} == 'conflict' ]]; then
  sed 's/| Accepted |/| Proposed |/' "${target}/docs/adrs/README.md" \
    > "${temporary_dir}/index"
  cp -- "${temporary_dir}/index" "${target}/docs/adrs/README.md"
fi
cmp "${candidate}/src/skills/dough-adr-awareness/SKILL.md" \
  "${target}/${skill_root}/dough-adr-awareness/SKILL.md"
before=$(snapshot_path_state "${target}")
source_before=$(snapshot_path_state "${candidate}")

if [[ $# == 0 ]]; then
  echo 'PASS: context proof uses the direct installed-use fixture and unchanged installed shared source.'
  echo 'PENDING: native clear/conflicting-status observations in Codex, Cursor, and Claude Code.'
  exit 0
fi

# shellcheck disable=SC2016 # The dollar sign is the native skill invocation.
prompt='Use $dough-adr-awareness. Assess how two backend instances should share login sessions. Do not edit files.'
case ${platform} in
  codex)
    native_codex_prepare "${temporary_dir}" "${candidate}"
    tool_version=$(codex --version)
    native_codex_run "${target}" "${output_file}" "${prompt}" "${transcript}"
    ;;
  cursor)
    tool_version=$(cursor agent --version)
    (
      cd -- "${target}"
      cursor agent --print --force --trust --sandbox enabled \
        --output-format stream-json --workspace "${target}" "${prompt}"
    ) > "${transcript}"
    jq -r 'select(.type == "result") | .result' "${transcript}" > "${output_file}"
    ;;
  claude)
    tool_version=$(claude --version)
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
[[ ${before} == "${after}" && ${source_before} == "${source_after}" ]]
command_log="${temporary_dir}/${platform}-${scenario}-commands.txt"
jq -r '.. | objects |
  (.command? // .args.command? // .input.command? // empty) | strings' \
  "${transcript}" > "${command_log}"
assert_no_adr_awareness_maintenance \
  "${command_log}" "${platform} ${scenario} ADR assessment"
source_commit=$(git -C "${candidate}" rev-parse HEAD)
version=$(cat "${candidate}/VERSION")
before_digest=$(printf '%s\n' "${before}" | shasum -a 256 | cut -d ' ' -f 1)
after_digest=$(printf '%s\n' "${after}" | shasum -a 256 | cut -d ' ' -f 1)
printf 'Platform: %s\nNative version: %s\nScenario: %s\nEntry: %s\n' \
  "${platform}" "${tool_version}" "${scenario}" "${prompt}"
printf 'Local fixture tag: v%s\nLocal fixture commit: %s\n' "${version}" "${source_commit}"
printf 'Before snapshot: %s\nAfter snapshot: %s\n' "${before_digest}" "${after_digest}"
printf 'Installed skill: %s\n' "${skill_root}/dough-adr-awareness/SKILL.md"
shasum -a 256 "${target}/${skill_root}/dough-adr-awareness/SKILL.md"
cat "${output_file}"
case ${platform} in
  cursor)
    jq -e -s 'any(.[]; .tool_call.readToolCall? |
      ((.args.path // "") | endswith("/.cursor/skills/dough-adr-awareness/SKILL.md")) and
      ((.result.success.content // "") | contains("Do not require policies for situations absent from the current request.")))' \
      "${transcript}" > /dev/null
    ;;
  claude)
    jq -e -s 'any(.[] | .message.content[]?; .type == "tool_use" and
      .name == "Skill" and .input.skill == "dough-adr-awareness")' \
      "${transcript}" > /dev/null
    ;;
  codex) : ;; # Explicit skills expand natively; automatic reading is proved separately.
  *) exit 2 ;;
esac
grep -Fq '0001-session-state.md' "${output_file}"
if [[ ${scenario} == 'clear' ]]; then
  grep -Eiq 'Redis' "${output_file}"
  grep -Fq '## ADR CHECK COMPLETE' "${output_file}"
else
  if grep -Fq '## ADR CHECK COMPLETE' "${output_file}"; then
    echo 'FAIL: claimed completion despite conflicting authoritative statuses.' >&2
    exit 1
  fi
  grep -Fq 'docs/adrs/README.md' "${output_file}"
  grep -Eiq 'Accepted' "${output_file}"
  grep -Eiq 'Proposed' "${output_file}"
  grep -Eiq 'conflict|disagree|ambigu' "${output_file}"
  grep -Eiq 'stop|stopped|blocked|cannot proceed|until .*resolv|pending .*resolv' \
    "${output_file}"
  grep -Eiq 'human|clarif|resolv|confirm' "${output_file}"
fi
printf '\nNative command evidence:\n'
cat "${command_log}"
printf '\nNative transcript for loading and behavior review:\n'
cat "${transcript}"
printf '\nPASS: %s %s native assessment; candidate and complete target unchanged.\n' \
  "${platform}" "${scenario}"
