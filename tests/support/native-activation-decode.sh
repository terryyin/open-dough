#!/usr/bin/env bash
# Host activation decode: map a terminal stream onto installed, wrong-copy,
# unsupported, unknown, or missing activation. Behavioral assessment stays
# outside this module.
# shellcheck disable=SC2034,SC2249,SC2312 # native_activation_* globals are the decode contract.

native_activation_decode_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/support/native-activation-path.sh
# shellcheck disable=SC1091
source "${native_activation_decode_dir}/native-activation-path.sh"

native_activation_form=
native_activation_reason=
native_activation_evidence=
native_activation_path=

native_activation_note_event() {
  local kind=$1
  local path=$2
  local evidence=$3
  local host=$4
  local installed=$5
  local candidate=$6
  local classified

  native_activation_append native_activation_evidence "${evidence}"
  case ${kind} in
    loaded)
      classified=$(native_activation_classify_path \
        "${path}" "${installed}" "${candidate}" "${host}")
      native_activation_path=${path}
      case ${classified} in
        installed) native_activation_loaded_installed=1 ;;
        wrong-copy) native_activation_loaded_wrong=1 ;;
        *) native_activation_unsupported=1 ;;
      esac
      ;;
    *)
      native_activation_unsupported=1
      ;;
  esac
}

native_activation_decode_cursor() {
  local stream=$1
  local identity=$2
  local host=$3
  local installed=$4
  local candidate=$5
  local path kind

  while IFS=$'\t' read -r kind path; do
    [[ -z ${kind} ]] && continue
    case ${kind} in
      loaded)
        native_activation_note_event loaded "${path}" \
          'tool_call.readToolCall.result.success.content' \
          "${host}" "${installed}" "${candidate}"
        native_activation_append native_activation_evidence \
          'tool_call.readToolCall.args.path'
        ;;
      request)
        native_activation_note_event request "${path}" \
          'tool_call.readToolCall.args.path' \
          "${host}" "${installed}" "${candidate}"
        ;;
    esac
  done < <(
    jq -s -r --arg identity "${identity}" '
      .[]
      | .tool_call.readToolCall? // empty
      | [
          (if ((.result.success.content // "") | contains($identity))
            then "loaded" else "request" end),
          (.args.path // "")
        ]
      | @tsv
    ' "${stream}" 2> /dev/null || true
  )
}

native_activation_decode_codex() {
  local stream=$1
  local identity=$2
  local host=$3
  local installed=$4
  local candidate=$5
  local kind path_or_text path

  while IFS=$'\t' read -r kind path_or_text; do
    [[ -z ${kind} ]] && continue
    path=$(native_activation_path_from_text \
      "${path_or_text}" "${candidate}" "${host}")
    if [[ -z ${path} ]]; then
      path=${path_or_text}
    fi
    case ${kind} in
      loaded)
        native_activation_note_event loaded "${path}" \
          'item.path|item.content|item.aggregated_output' \
          "${host}" "${installed}" "${candidate}"
        ;;
      attempt)
        native_activation_note_event attempt "${path}" \
          'item.command' "${host}" "${installed}" "${candidate}"
        ;;
    esac
  done < <(
    jq -s -r --arg identity "${identity}" '
      .[]
      | if (.item.type? == "command_execution") then
          [
            (if (.item.exit_code == 0) and
              ((.item.aggregated_output // "") | contains($identity))
              then "loaded" else "attempt" end),
            (.item.command // "")
          ]
        elif (.item.path // "") != "" then
          [
            (if ((.item.content // .item.text // "") | contains($identity))
              then "loaded" else "attempt" end),
            (.item.path // "")
          ]
        else empty end
      | @tsv
    ' "${stream}" 2> /dev/null || true
  )
}

native_activation_decode_claude() {
  local stream=$1
  local host=$2
  local installed=$3
  local candidate=$4
  local skill path

  while IFS=$'\t' read -r skill path; do
    [[ -z ${skill} && -z ${path} ]] && continue
    native_activation_note_event skill-request "${path}" \
      'message.content[].name=Skill' \
      "${host}" "${installed}" "${candidate}"
    if [[ -n ${path} ]]; then
      native_activation_append native_activation_evidence \
        'message.content[].input.path'
    fi
  done < <(
    jq -s -r '
      .[]
      | .message.content[]?
      | select(.type == "tool_use" and .name == "Skill")
      | [(.input.skill // ""), (.input.path // "")]
      | @tsv
    ' "${stream}" 2> /dev/null || true
  )
}

native_activation_decode() {
  local host=$1
  local stream=$2
  local installed=$3
  local identity=$4
  local candidate=${5-}
  local response=${6-}

  native_activation_form=
  native_activation_reason=
  native_activation_evidence=
  native_activation_path=
  native_activation_loaded_installed=0
  native_activation_loaded_wrong=0
  native_activation_unsupported=0

  if [[ ! -f ${stream} || ! -s ${stream} ]]; then
    native_activation_form=none
    native_activation_reason='missing activation stream'
    native_activation_evidence=${stream:-missing-stream}
    return 0
  fi
  if ! jq -s '.' "${stream}" > /dev/null 2>&1; then
    native_activation_form=unknown
    native_activation_reason='unknown activation event form'
    native_activation_append native_activation_evidence "${stream}"
    return 0
  fi

  case ${host} in
    cursor) native_activation_decode_cursor \
      "${stream}" "${identity}" "${host}" "${installed}" "${candidate}" ;;
    codex) native_activation_decode_codex \
      "${stream}" "${identity}" "${host}" "${installed}" "${candidate}" ;;
    claude) native_activation_decode_claude \
      "${stream}" "${host}" "${installed}" "${candidate}" ;;
    *)
      native_activation_form=unknown
      native_activation_reason='unknown host'
      return 0
      ;;
  esac

  if ((native_activation_loaded_wrong)); then
    native_activation_form=wrong-copy
    native_activation_reason='activation of a non-installed copy'
    return 0
  fi
  if ((native_activation_loaded_installed)); then
    native_activation_form=supported
    native_activation_reason='supported installed activation'
    return 0
  fi
  if ((native_activation_unsupported)); then
    native_activation_form=unsupported
    case ${host} in
      claude)
        native_activation_reason='Skill request is insufficient to prove installed activation'
        ;;
      *)
        native_activation_reason='unsupported activation form'
        ;;
    esac
    return 0
  fi
  if [[ -n ${response} && -f ${response} ]] \
    && grep -Fq '## ADR CHECK COMPLETE' "${response}"; then
    native_activation_form=unsupported
    native_activation_reason='completion marker is not installed activation'
    native_activation_append native_activation_evidence "${response}"
    return 0
  fi
  native_activation_form=none
  native_activation_reason='missing activation evidence'
}
