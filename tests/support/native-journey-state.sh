#!/usr/bin/env bash
# Shared combined-update then fresh-use assessment from observed state.
# Conflict use reuses native_adr_behavior_assess. Not a per-tool matrix.
# shellcheck disable=SC2034,SC2154 # native_journey_state_* / native_adr_behavior_* are the sourced contract.

native_journey_state_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/support/native-adr-behavior.sh
# shellcheck disable=SC1091
source "${native_journey_state_support_dir}/native-adr-behavior.sh"

native_journey_state_status=not-run
native_journey_state_reason='behavior not assessed'

native_journey_state_print_fields() {
  printf 'assessment-status: %s\n' "${native_journey_state_status:-not-run}"
  printf 'assessment-reason: %s\n' \
    "${native_journey_state_reason:-behavior not assessed}"
}

native_journey_state_field() {
  local text=$1
  local key=$2
  local line
  line=$(grep -F "${key}: " <<< "${text}" | head -n 1 || true)
  printf '%s\n' "${line#"${key}: "}"
}

native_journey_state_fail() {
  native_journey_state_status=fail
  native_journey_state_reason=$1
}

native_journey_state_assess() {
  local observations=$1
  local response=${2-}
  local obs update_exec use_exec same_target real_transition skill_root
  local ver_before ver_after improvement
  local source_p companion_p cursor_p claude_p

  native_journey_state_status=fail
  native_journey_state_reason='missing observations'
  if [[ -z ${observations} || ! -r ${observations} ]]; then
    return 0
  fi
  obs=$(cat -- "${observations}")
  if [[ -z ${obs} ]]; then
    return 0
  fi

  update_exec=$(native_journey_state_field "${obs}" update-execution)
  use_exec=$(native_journey_state_field "${obs}" use-execution)
  same_target=$(native_journey_state_field "${obs}" same-target)
  skill_root=$(native_journey_state_field "${obs}" target-skill-root)
  real_transition=$(native_journey_state_field "${obs}" real-transition)
  ver_before=$(native_journey_state_field "${obs}" update-version-before)
  ver_after=$(native_journey_state_field "${obs}" update-version-after)
  improvement=$(native_journey_state_field "${obs}" improvement-after-update)
  source_p=$(native_journey_state_field "${obs}" source-preserved)
  companion_p=$(native_journey_state_field "${obs}" companion-preserved)
  cursor_p=$(native_journey_state_field "${obs}" other-tool-root-cursor-preserved)
  claude_p=$(native_journey_state_field "${obs}" other-tool-root-claude-preserved)

  if [[ ${update_exec} != 'completed' ]]; then
    native_journey_state_fail \
      'failed update cannot pass as a successful journey'
    return 0
  fi
  if [[ ${source_p} != 'true' || ${companion_p} != 'true' ]]; then
    native_journey_state_fail 'protected writes'
    return 0
  fi
  if [[ ${skill_root} != '.cursor/skills' && ${cursor_p} != 'true' ]]; then
    native_journey_state_fail 'protected writes'
    return 0
  fi
  if [[ ${skill_root} != '.claude/skills' && ${claude_p} != 'true' ]]; then
    native_journey_state_fail 'protected writes'
    return 0
  fi
  if [[ ${ver_before} != '0.2.1' || ${ver_after} != '0.2.2' ||
    ${improvement} != 'true' || ${real_transition} != 'true' ]]; then
    native_journey_state_fail 'wrong installed bytes or version'
    return 0
  fi
  if [[ ${same_target} != 'true' ]]; then
    native_journey_state_fail 'stale-target use'
    return 0
  fi
  if [[ -z ${response} ]]; then
    native_journey_state_status=pass
    native_journey_state_reason='expected real fixture update state'
    return 0
  fi
  if [[ ${use_exec} != 'completed' ]]; then
    native_journey_state_fail \
      'failed update cannot pass as a successful journey'
    return 0
  fi
  native_adr_behavior_assess conflict "${response}"
  native_journey_state_status=${native_adr_behavior_status}
  native_journey_state_reason=${native_adr_behavior_reason}
}
