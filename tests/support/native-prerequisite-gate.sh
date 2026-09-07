#!/usr/bin/env bash
# Shared native prerequisite gate: complete execution plus supported activation
# of the installed copy. Host decoding of activation is the only adapter.
# Behavioral/wording assessment is not this gate's result.
# shellcheck disable=SC2034,SC2154,SC2312 # native_prerequisite_* and native_activation_* are the sourced contract.

native_prerequisite_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/support/native-activation-decode.sh
# shellcheck disable=SC1091
source "${native_prerequisite_support_dir}/native-activation-decode.sh"

native_prerequisite_result=
native_prerequisite_reason=
native_prerequisite_evidence=

native_prerequisite_execution_is_complete() {
  case ${native_prerequisite_execution:-${native_run_outcome:-exited}} in
    timeout | failed | incomplete) return 1 ;;
    *) return 0 ;;
  esac
}

native_prerequisite_print_fields() {
  local line

  printf 'prerequisite-result: %s\n' "${native_prerequisite_result}"
  printf 'prerequisite-reason: %s\n' "${native_prerequisite_reason}"
  if [[ -z ${native_prerequisite_evidence} ]]; then
    printf 'prerequisite-evidence: none\n'
    return 0
  fi
  while IFS= read -r line; do
    [[ -z ${line} ]] && continue
    printf 'prerequisite-evidence: %s\n' "${line}"
  done <<< "${native_prerequisite_evidence}"
}

native_prerequisite_assert_record_fields() {
  local record=$1
  local label=$2

  grep -Fq 'assessment-status: not-run' "${record}"
  grep -Fq 'assessment-interpretation: none' "${record}"
  grep -Fq 'prerequisite-result:' "${record}"
  grep -Fq 'prerequisite-reason:' "${record}"
  grep -Fq 'prerequisite-evidence:' "${record}"
  if grep -Fq 'assessment-interpretation: limited-wording' "${record}"; then
    echo "FAIL: ${label} used context wording assessment." >&2
    cat "${record}" >&2
    return 1
  fi
  if grep -Fq 'assessment-status: pass' "${record}"; then
    echo "FAIL: ${label} treated execution as a wording pass." >&2
    cat "${record}" >&2
    return 1
  fi
}

native_prerequisite_assess() {
  local artifact=${native_prerequisite_stream_artifact:-events.jsonl}
  local execution=${native_prerequisite_execution:-${native_run_outcome:-exited}}
  local stream=${native_prerequisite_stream-}
  local response=${native_prerequisite_response-}
  local installed=${native_prerequisite_installed_skill_path-}
  local identity=${native_prerequisite_installed_identity-}
  local candidate=${native_prerequisite_candidate-}
  local host=${native_prerequisite_host:-${native_case_host-}}

  native_prerequisite_result=
  native_prerequisite_reason=
  native_prerequisite_evidence=

  if ! native_prerequisite_execution_is_complete; then
    native_prerequisite_result=fail
    native_prerequisite_reason="execution failure: ${execution}"
    native_prerequisite_evidence="record execution-status"
    if [[ -n ${stream} ]]; then
      native_activation_append native_prerequisite_evidence "${artifact}"
    fi
    return 0
  fi

  native_activation_decode \
    "${host}" "${stream}" "${installed}" "${identity}" \
    "${candidate}" "${response}"
  native_prerequisite_evidence=${artifact}
  if [[ -n ${native_activation_evidence} ]]; then
    native_activation_append native_prerequisite_evidence \
      "${native_activation_evidence}"
  fi
  if [[ -n ${native_activation_path} ]]; then
    native_activation_append native_prerequisite_evidence \
      "${native_activation_path}"
  fi

  case ${native_activation_form} in
    supported)
      native_prerequisite_result=pass
      native_prerequisite_reason='complete execution and supported installed activation'
      ;;
    wrong-copy)
      native_prerequisite_result=fail
      native_prerequisite_reason='activation of a non-installed copy'
      ;;
    unsupported)
      native_prerequisite_result=inconclusive
      native_prerequisite_reason=${native_activation_reason}
      ;;
    unknown)
      native_prerequisite_result=inconclusive
      native_prerequisite_reason='unknown activation event form'
      ;;
    *)
      native_prerequisite_result=inconclusive
      native_prerequisite_reason='missing activation evidence'
      ;;
  esac
}
