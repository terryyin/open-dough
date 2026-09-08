#!/usr/bin/env bash
# Credential-free proof of the shared execution+activation prerequisite gate.
# Shared cases run once. Decoder boundary cases cover each host's recorded form.
# Does not launch Codex, Cursor, or Claude Code.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced helper globals; pipefail covers jq.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/native-prerequisite-gate.sh
source "${source_dir}/tests/support/native-prerequisite-gate.sh"

work_dir=$(mktemp -d)
finish() {
  rm -rf -- "${work_dir}"
}
trap finish EXIT

identity='Do not require policies for situations absent from the current request.'
adopter="${work_dir}/adopter"
candidate="${work_dir}/candidate"
mkdir -p -- \
  "${adopter}/.cursor/skills/dough-adr-awareness" \
  "${adopter}/.agents/skills/dough-adr-awareness" \
  "${candidate}/src/skills/dough-adr-awareness"
printf '%s\n' "${identity}" > \
  "${adopter}/.cursor/skills/dough-adr-awareness/SKILL.md"
printf '%s\n' "${identity}" > \
  "${adopter}/.agents/skills/dough-adr-awareness/SKILL.md"
printf '%s\n' "${identity}" > \
  "${candidate}/src/skills/dough-adr-awareness/SKILL.md"

cursor_installed="${adopter}/.cursor/skills/dough-adr-awareness/SKILL.md"
codex_installed="${adopter}/.agents/skills/dough-adr-awareness/SKILL.md"
claude_installed="${adopter}/.claude/skills/dough-adr-awareness/SKILL.md"
response="${work_dir}/response.md"
printf '%s\n' '## ADR CHECK COMPLETE' > "${response}"

write_jsonl() {
  local dest=$1
  shift
  printf '%s\n' "$@" > "${dest}"
}

assess_with() {
  local host=$1
  local execution=$2
  local stream=$3
  local installed=$4

  native_prerequisite_host=${host}
  native_prerequisite_execution=${execution}
  native_prerequisite_stream=${stream}
  native_prerequisite_response=${response}
  native_prerequisite_installed_skill_path=${installed}
  native_prerequisite_installed_identity=${identity}
  native_prerequisite_candidate=${candidate}
  native_prerequisite_stream_artifact=events.jsonl
  native_prerequisite_assess
}

assert_gate() {
  local result=$1
  local reason_snippet=$2

  if [[ ${native_prerequisite_result} != "${result}" ]]; then
    echo "FAIL: expected prerequisite-result ${result}, got ${native_prerequisite_result}." >&2
    printf 'reason: %s\n' "${native_prerequisite_reason}" >&2
    printf 'evidence: %s\n' "${native_prerequisite_evidence}" >&2
    return 1
  fi
  grep -Fq "${reason_snippet}" <<< "${native_prerequisite_reason}"
  [[ -n ${native_prerequisite_evidence} ]]
}

assert_decode() {
  local form=$1

  if [[ ${native_activation_form} != "${form}" ]]; then
    echo "FAIL: expected activation form ${form}, got ${native_activation_form}." >&2
    printf 'reason: %s\n' "${native_activation_reason}" >&2
    return 1
  fi
}

cursor_loaded="${work_dir}/cursor-loaded.jsonl"
write_jsonl "${cursor_loaded}" "$(
  jq -n -c --arg path "${cursor_installed}" --arg content "${identity}" \
    '{tool_call:{readToolCall:{args:{path:$path},result:{success:{content:$content}}}}}'
)" '{
  "type":"result","result":"ok"
}'

cursor_request="${work_dir}/cursor-request.jsonl"
write_jsonl "${cursor_request}" "$(
  jq -n -c --arg path "${cursor_installed}" \
    '{tool_call:{readToolCall:{args:{path:$path}}}}'
)" '{"type":"result","result":"ok"}'

cursor_wrong="${work_dir}/cursor-wrong.jsonl"
write_jsonl "${cursor_wrong}" "$(
  jq -n -c --arg path "${candidate}/src/skills/dough-adr-awareness/SKILL.md" \
    --arg content "${identity}" \
    '{tool_call:{readToolCall:{args:{path:$path},result:{success:{content:$content}}}}}'
)" '{"type":"result","result":"ok"}'

codex_expansion="${work_dir}/codex-expansion.jsonl"
write_jsonl "${codex_expansion}" "$(
  jq -n -c --arg command "sed -n '1,260p' '${codex_installed}'" \
    --arg content "${identity}" \
    '{type:"item.completed",item:{id:"item_0",type:"command_execution",command:$command,aggregated_output:$content,exit_code:0,status:"completed"}}'
)" '{"type":"turn.completed"}'

codex_marker="${work_dir}/codex-marker.jsonl"
write_jsonl "${codex_marker}" '{"type":"turn.completed"}'

claude_skill="${work_dir}/claude-skill.jsonl"
write_jsonl "${claude_skill}" \
  '{"message":{"content":[{"type":"tool_use","name":"Skill","input":{"skill":"dough-adr-awareness"}}]}}' \
  '{"type":"result","result":"ok"}'

unknown_stream="${work_dir}/unknown.jsonl"
write_jsonl "${unknown_stream}" '{"type":"result","result":"ok"}' 'not-json{'

empty_stream="${work_dir}/empty.jsonl"
: > "${empty_stream}"

# Shared gate cases once (Cursor recorded success is the activation vehicle).
assess_with cursor exited "${cursor_loaded}" "${cursor_installed}"
assert_gate pass 'complete execution and supported installed activation'
grep -Fq 'events.jsonl' <<< "${native_prerequisite_evidence}"
grep -Fq 'tool_call.readToolCall' <<< "${native_prerequisite_evidence}"

assess_with cursor failed "${cursor_loaded}" "${cursor_installed}"
assert_gate fail 'execution failure'

assess_with cursor exited "${empty_stream}" "${cursor_installed}"
assert_gate inconclusive 'missing activation evidence'

assess_with cursor exited "${cursor_wrong}" "${cursor_installed}"
assert_gate fail 'activation of a non-installed copy'

# Decoder boundary: supported vs unsupported/failed per host. Claude has no
# supported recorded form; keep that result inconclusive for Story 3.
native_activation_decode cursor "${cursor_loaded}" "${cursor_installed}" \
  "${identity}" "${candidate}" "${response}"
assert_decode supported

native_activation_decode cursor "${cursor_request}" "${cursor_installed}" \
  "${identity}" "${candidate}" "${response}"
assert_decode unsupported

native_activation_decode codex "${codex_expansion}" "${codex_installed}" \
  "${identity}" "${candidate}" "${response}"
assert_decode supported

native_activation_decode codex "${codex_marker}" "${codex_installed}" \
  "${identity}" "${candidate}" "${response}"
assert_decode unsupported

native_activation_decode claude "${claude_skill}" "${claude_installed}" \
  "${identity}" "${candidate}" "${response}"
assert_decode unsupported
grep -Fq 'Skill request is insufficient' <<< "${native_activation_reason}"

assess_with claude exited "${claude_skill}" "${claude_installed}"
assert_gate inconclusive 'Skill request is insufficient'

native_activation_decode cursor "${unknown_stream}" "${cursor_installed}" \
  "${identity}" "${candidate}" "${response}"
assert_decode unknown
assess_with cursor exited "${unknown_stream}" "${cursor_installed}"
assert_gate inconclusive 'unknown activation event form'

echo 'PASS: shared prerequisite gate handles success, execution failure, missing evidence, and wrong-copy once; Codex and Cursor decode supported vs unsupported recorded forms; Claude Skill request stays inconclusive.'
