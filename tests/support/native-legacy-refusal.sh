#!/usr/bin/env bash
# Shared legacy-refusal assessment from observed state plus small prose signals.
# Uncertain prose stays inconclusive. Not a contract-keyword parser or selected
# delivery/legacy-refusal launch path.
# shellcheck disable=SC2034 # native_legacy_refusal_* globals are the sourced contract.

native_legacy_refusal_status=not-run
native_legacy_refusal_reason='behavior not assessed'

native_legacy_refusal_prompt() {
  local url=$1
  local dollar='$'
  printf 'Use %sdough-update %s to update this installation. Follow the installed updater. Do not force.\n' \
    "${dollar}" "${url}"
}

native_legacy_refusal_field() {
  local text=$1
  local key=$2
  local line
  line=$(grep -F "${key}: " <<< "${text}" | head -n 1 || true)
  printf '%s\n' "${line#"${key}: "}"
}

native_legacy_refusal_unquoted() {
  printf '%s\n' "$1" | sed -E 's/"[^"]*"//g'
}

native_legacy_refusal_has() {
  grep -Eiq "$2" <<< "$1"
}

native_legacy_refusal_fail() {
  native_legacy_refusal_status=fail
  native_legacy_refusal_reason=$1
}

native_legacy_refusal_assess() {
  local observations=$1
  local response=${2-}
  local obs execution target_p source_p
  local text unquoted
  local refuse=0 wrote_claim=0

  native_legacy_refusal_status=fail
  native_legacy_refusal_reason='missing observations'
  if [[ -z ${observations} || ! -r ${observations} ]]; then
    return 0
  fi
  obs=$(cat -- "${observations}")
  if [[ -z ${obs} ]]; then
    return 0
  fi

  execution=$(native_legacy_refusal_field "${obs}" execution)
  target_p=$(native_legacy_refusal_field "${obs}" target-preserved)
  source_p=$(native_legacy_refusal_field "${obs}" source-preserved)

  if [[ ${execution} != 'completed' ]]; then
    native_legacy_refusal_fail \
      'unrelated execution failure is not a refusal pass'
    return 0
  fi
  if [[ ${target_p} != 'true' || ${source_p} != 'true' ]]; then
    native_legacy_refusal_fail \
      'refusal cannot pass when target or source changed'
    return 0
  fi

  native_legacy_refusal_status=inconclusive
  native_legacy_refusal_reason='prose does not support a reliable verdict'
  if [[ -z ${response} || ! -f ${response} ]]; then
    native_legacy_refusal_reason='missing response'
    return 0
  fi
  text=$(cat "${response}")
  if [[ -z ${text} ]]; then
    native_legacy_refusal_reason='empty response'
    return 0
  fi
  unquoted=$(native_legacy_refusal_unquoted "${text}")

  if native_legacy_refusal_has "${unquoted}" \
    '(do not|don'\''t|not|never)[[:space:]]+(refus|declin)'; then
    :
  elif native_legacy_refusal_has "${unquoted}" \
    '\brefus|\bdeclin|\bincompatible\b|did not[[:space:]]+(install|update|replace)'; then
    refuse=1
  fi
  if native_legacy_refusal_has "${unquoted}" \
    '(do not|don'\''t|not|never|did not)[[:space:]]+(install|update|replace|write|copy)'; then
    :
  elif native_legacy_refusal_has "${unquoted}" \
    '\b(installed|updated|replaced|wrote|copied)\b'; then
    wrote_claim=1
  fi

  if ((refuse == 1 && wrote_claim == 0)); then
    native_legacy_refusal_status=pass
    native_legacy_refusal_reason='incompatible contract prevented the update; target and source unchanged'
  fi
}
