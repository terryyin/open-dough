#!/usr/bin/env bash
# PATH substitute for credential-free publication native runs.
# Logs every invocation, including version probes. On a complete stream it
# performs the bounded publication Git action for the selected journey so
# observations come from real repository state. Incomplete streams emit the
# shared adapter shapes without mutating remote history.
# NATIVE_PUBLICATION_JOURNEY selects the journey; NATIVE_AGENT_STREAM selects
# complete (default), truncated, missing, or unknown.
# NATIVE_PUBLICATION_SKIP_PUSH=1 claims success without accepting the candidate.
# NATIVE_AGENT_EXIT_AFTER_COMPLETE=1 emits a complete stream and exits nonzero.
# shellcheck disable=SC2249,SC2312 # Optional flag scan; pipefail covers jq.
set -euo pipefail

if [[ -n ${NATIVE_AGENT_SENTINEL_LOG:-} ]]; then
  {
    printf '%s' "${0##*/}"
    if [[ $# -gt 0 ]]; then
      printf ' %s' "$@"
    fi
    printf '\n'
  } >> "${NATIVE_AGENT_SENTINEL_LOG}"
fi

host=${0##*/}

if [[ ${host} == 'cursor' && ${1:-} == 'agent' && ${2:-} == '--version' ]]; then
  printf 'cursor-agent publication-1\n'
  exit 0
fi
if [[ ${host} == 'cursor' && ${1:-} == '--version' ]]; then
  printf 'cursor-editor publication-1\n'
  exit 0
fi
if [[ ${1:-} == '--version' ]]; then
  printf '%s publication-1\n' "${host}"
  exit 0
fi
if [[ ${host} == 'cursor' && ${1:-} == 'agent' ]]; then
  shift
fi

output_file=
workspace=
args=("$@")
idx=0
while [[ ${idx} -lt ${#args[@]} ]]; do
  case ${args[idx]} in
    -o)
      idx=$((idx + 1))
      output_file=${args[idx]}
      ;;
    --workspace | -C)
      idx=$((idx + 1))
      workspace=${args[idx]}
      ;;
  esac
  idx=$((idx + 1))
done
if [[ -z ${workspace} ]]; then
  workspace=${PWD}
fi
stream_kind=${NATIVE_AGENT_STREAM:-complete}
journey=${NATIVE_PUBLICATION_JOURNEY:-publish-boundary}

write_codex_complete() {
  if [[ ${journey} == 'story-branch-increment' ]]; then
    jq -n -c --arg command \
      "git -C ${workspace} push origin ${candidate_sha}:refs/heads/exec/story" \
      '{type:"item.started",item:{id:"item_push",type:"command_execution",command:$command}}'
  fi
  jq -n -c \
    '{type:"item.completed",item:{id:"item_0",type:"agent_message",text:"Recorded publication stage completed."}}'
  printf '%s\n' '{"type":"turn.completed"}'
}

write_stream_result() {
  jq -n -c --arg result "$1" '{type:"result",result:$result}'
}

emit_incomplete_stream() {
  case ${stream_kind} in
    missing)
      exit 0
      ;;
    unknown)
      printf '%s\n' '{"unrecognized":true}'
      exit 0
      ;;
    truncated)
      case ${host} in
        cursor)
          printf '%s\n' '{"tool_call":{}}'
          ;;
        claude)
          printf '%s\n' '{"message":{}}'
          ;;
        *)
          jq -n -c \
            '{type:"item.completed",item:{id:"item_0",type:"agent_message",text:"Partial response before terminal completion."}}'
          ;;
      esac
      exit 0
      ;;
    *)
      printf 'error: publication substitute does not implement stream %s\n' \
        "${stream_kind}" >&2
      exit 1
      ;;
  esac
}

if [[ ${stream_kind} != 'complete' ]]; then
  emit_incomplete_stream
fi

candidate_sha=$(git -C "${workspace}" rev-parse HEAD)
response=
case ${journey} in
  local-only)
    response=$(
      printf '%s\n' \
        "Retained the authorized result in the owned workspace under local-only authority. Publication remains pending; the candidate was left unpublished. A pending human edit on the default checkout was preserved."
    )
    ;;
  claim-race)
    response=$(
      printf '%s\n' \
        "Stopped: another execution already owns a published claim on the authorized remote. This is a recoverable conflict. No implementation started. A pending human edit on the default checkout was preserved."
    )
    ;;
  uncertain-recovery)
    response=$(
      printf '%s\n' \
        "Recovery: the retained candidate is already an ancestor of the accepted remote history after another writer's advance. No second push. Human edits on the default checkout remain preserved."
    )
    ;;
  admission-*)
    # shellcheck source=tests/support/native-agent-admission.sh
    # shellcheck disable=SC1091
    source "${0%/*}/native-agent-admission.sh"
    native_admission_substitute
    ;;
  story-branch-increment)
    if [[ -z ${NATIVE_PUBLICATION_SKIP_PUSH:-} ]]; then
      git -C "${workspace}" push --quiet origin \
        "${candidate_sha}:refs/heads/exec/story"
    fi
    response=$(
      printf '%s\n' \
        "Published the owned candidate ${candidate_sha}. The remote accepted that revision on the new Story Branch exec/story. Remote trunk and the default checkout stayed unchanged."
    )
    ;;
  preparation | trunk-closure | story-branch-closure | bug-disposition | publish-boundary | *)
    if [[ -z ${NATIVE_PUBLICATION_SKIP_PUSH:-} ]]; then
      git -C "${workspace}" push --quiet origin "${candidate_sha}:refs/heads/main"
    fi
    response=$(
      printf '%s\n' \
        "Published the owned candidate ${candidate_sha}. The remote accepted that revision on main. Default-checkout maintenance is deferred because a pending human edit is present; that edit was not staged, reset, or included."
    )
    ;;
esac

if [[ ${host} == 'codex' ]]; then
  if [[ -z ${output_file} ]]; then
    printf 'error: publication substitute requires -o for Codex.\n' >&2
    exit 1
  fi
  printf '%s\n' "${response}" > "${output_file}"
  printf '%s' "${admission_events:-}"
  write_codex_complete
  [[ -z ${NATIVE_AGENT_EXIT_AFTER_COMPLETE:-} ]] || exit 1
  exit 0
fi
printf '%s' "${admission_events:-}"
write_stream_result "${response}"
[[ -z ${NATIVE_AGENT_EXIT_AFTER_COMPLETE:-} ]] || exit 1
