#!/usr/bin/env bash
# Derive structured consumer observations from outcome, response, product,
# stand-in, and compatibility proof. Green exit or instruction words alone
# cannot pass.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_consumers_outcome_response_text() {
  local outcome=$1
  local response=$2
  local text=''
  if [[ -f ${outcome} ]]; then
    text=$(cat "${outcome}")
  fi
  if [[ -n ${response} && -f ${response} ]]; then
    text="${text}"$'\n'"$(cat "${response}")"
  fi
  printf '%s' "${text}"
}

delivery_evidence_consumers_promise_accepted() {
  local outcome=$1
  local response=$2
  local text
  text=$(delivery_evidence_consumers_outcome_response_text \
    "${outcome}" "${response}")
  if [[ -z ${text} ]]; then
    printf 'false\n'
    return
  fi
  if grep -Eiq \
    "$(delivery_evidence_promise_status_pattern incomplete)"'|uncovered|not[[:space:]]+covered|stale[[:space:]]+exclusion|consumer[[:space:]]+(is[[:space:]]+)?(missed|incompatible|unaligned)|stand-?in[[:space:]]+(is[[:space:]]+)?(incompatible|unaligned|missed)' \
    <<< "${text}"; then
    if grep -Eiq \
      'factory|releaseTag|stand-?in|e2e|consumer|command|badge|status' \
      <<< "${text}"; then
      printf 'false\n'
      return
    fi
  fi
  if grep -Eiq \
    "$(delivery_evidence_promise_status_pattern accepted)"'|all[[:space:]]+.*promises?[[:space:]]+(are[[:space:]]+)?\*{0,2}accepted\*{0,2}' \
    <<< "${text}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_consumers_accepted_on_stale_exclusion() {
  local outcome=$1
  local response=$2
  local text
  text=$(delivery_evidence_consumers_outcome_response_text \
    "${outcome}" "${response}")
  if [[ -z ${text} ]]; then
    printf 'false\n'
    return
  fi
  # Rejection/correction language means the stale exclusion was not accepted.
  if grep -Eiq \
    'stale|invalid(ate[sd]?)?|no[[:space:]]+longer|reassess|does[[:space:]]+call|still[[:space:]]+calls|missed[[:space:]]+consumer|incompatible[[:space:]]+stand|stand-?in[[:space:]]+(is[[:space:]]+)?(incompatible|unaligned|broken)|cannot[[:space:]]+accept|incomplete|uncovered|must[[:space:]]+align|needs?[[:space:]]+align' \
    <<< "${text}"; then
    printf 'false\n'
    return
  fi
  if grep -Eiq \
    'e2e[[:space:]]+(suite[[:space:]]+)?(is[[:space:]]+)?unaffected|unaffected[[:space:]]+(suite|e2e)|stand-?in[[:space:]]+does[[:space:]]+not[[:space:]]+call|previously[[:space:]]+assessed|prior[[:space:]]+assessment|reuse[[:space:]]+this[[:space:]]+exclusion' \
    <<< "${text}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_consumers_required_gap_returned() {
  local outcome=$1
  local response=$2
  local text
  text=$(delivery_evidence_consumers_outcome_response_text \
    "${outcome}" "${response}")
  if [[ -z ${text} ]]; then
    printf 'false\n'
    return
  fi
  if grep -Eiq \
    'incomplete|uncovered|stale|reassess|stand-?in|consumer|compatib|align|releaseTag|e2e|factory[[:space:]]+contract|affected[[:space:]]+consumer' \
    <<< "${text}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_consumers_stand_in_aligned() {
  local workspace=$1
  local stand_in="${workspace}/e2e/support/e2eStandIn.mjs"
  if [[ ! -f ${stand_in} ]]; then
    printf 'false\n'
    return
  fi
  if grep -Eq 'createCommand\(context,\s*releaseTag\)' "${stand_in}" \
    && grep -Eq 'function buildE2eCommand\(context,\s*releaseTag\)' \
      "${stand_in}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_consumers_compat_assertion_present() {
  local workspace=$1
  local compat="${workspace}/e2e/stand-in-compat.test.mjs"
  if [[ ! -f ${compat} ]]; then
    printf 'false\n'
    return
  fi
  if grep -Eiq 'current[[:space:]]+factory[[:space:]]+contract|releaseTag|v1\.0\.0' \
    "${compat}" \
    && grep -Eq "buildE2eCommand\(\{ id: 1 \}, 'v1\.0\.0'\)" "${compat}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_consumers_compat_assertion_executed() {
  local response=$1
  local transcript=$2
  local outcome=${3-}
  local text
  text=$(delivery_evidence_consumers_outcome_response_text \
    "${outcome}" "${response}")
  if [[ -f ${transcript} ]]; then
    text="${text}"$'\n'"$(cat "${transcript}")"
  fi
  if [[ -z ${text} ]]; then
    printf 'false\n'
    return
  fi
  if grep -Eiq \
    'stand-in-compat|e2e/stand-in-compat|e2e[[:space:]]+stand-in[[:space:]]+builds|compatib(ility|le).*assert|node --test[^\n]*e2e' \
    <<< "${text}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_consumers_unrelated_boundary_unchanged() {
  local workspace=$1
  local badge="${workspace}/lib/statusBadge.mjs"
  if [[ ! -f ${badge} ]]; then
    printf 'false\n'
    return
  fi
  if grep -Eq 'export function badgeLabel\(status\)' "${badge}" \
    && grep -Eq "return String\(status" "${badge}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_consumers_unrelated_proof_retained() {
  local outcome=$1
  local response=$2
  local text
  text=$(delivery_evidence_consumers_outcome_response_text \
    "${outcome}" "${response}")
  if [[ -z ${text} ]]; then
    printf 'false\n'
    return
  fi
  if grep -Eiq \
    're-?send|reformat|formatting-only|must[[:space:]]+re-?run.*(badge|status)|badge.*(incomplete|uncovered|missing)' \
    <<< "${text}"; then
    printf 'false\n'
    return
  fi
  if grep -Eiq \
    'accepted|badge|status-badge|statusBadge|existing[[:space:]]+proof|still[[:space:]]+covers' \
    <<< "${text}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_consumers_observe() {
  local scenario=$1
  local workspace=$2
  local response=$3
  local transcript=$4
  local outcome="${workspace}/.planning/acceptance-outcome.md"
  local accepted stale_ok gap aligned compat_present compat_executed \
    unrelated_ok proof_retained instruction harness

  accepted=$(delivery_evidence_consumers_promise_accepted \
    "${outcome}" "${response}")
  stale_ok=$(delivery_evidence_consumers_accepted_on_stale_exclusion \
    "${outcome}" "${response}")
  gap=$(delivery_evidence_consumers_required_gap_returned \
    "${outcome}" "${response}")
  aligned=$(delivery_evidence_consumers_stand_in_aligned "${workspace}")
  compat_present=$(delivery_evidence_consumers_compat_assertion_present \
    "${workspace}")
  compat_executed=$(delivery_evidence_consumers_compat_assertion_executed \
    "${response}" "${transcript}" "${outcome}")
  unrelated_ok=$(delivery_evidence_consumers_unrelated_boundary_unchanged \
    "${workspace}")
  proof_retained=$(delivery_evidence_consumers_unrelated_proof_retained \
    "${outcome}" "${response}")

  instruction=false
  if [[ ! -f ${outcome} && ! -f ${response} ]]; then
    instruction=true
  elif [[ -f ${outcome} ]] && ! grep -Eiq \
    'accepted|incomplete|uncovered|consumer|stand-?in|factory|badge|promise|stale|e2e' \
    "${outcome}"; then
    if [[ ! -f ${response} ]] || ! grep -Eiq \
      'accepted|incomplete|uncovered|consumer|stand-?in|factory|badge|promise|stale|e2e' \
      "${response}"; then
      instruction=true
    fi
  fi

  harness=false
  if grep -Eiq \
    'tests/support/delivery-evidence-consumers-native|native harness source' \
    "${transcript}" "${response}" 2> /dev/null; then
    harness=true
  fi

  {
    printf 'scenario: %s\n' "${scenario}"
    printf 'promise-accepted: %s\n' "${accepted}"
    printf 'accepted-on-stale-exclusion: %s\n' "${stale_ok}"
    printf 'required-gap-returned: %s\n' "${gap}"
    printf 'consumer-aligned: %s\n' "${aligned}"
    printf 'compat-assertion-present: %s\n' "${compat_present}"
    printf 'compat-assertion-executed: %s\n' "${compat_executed}"
    printf 'unrelated-boundary-unchanged: %s\n' "${unrelated_ok}"
    printf 'unrelated-proof-retained: %s\n' "${proof_retained}"
    printf 'instruction-words-only: %s\n' "${instruction}"
    printf 'harness-inspected: %s\n' "${harness}"
  }
}
