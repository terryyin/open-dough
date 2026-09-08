#!/usr/bin/env bash
# Combined delivery/updated-use journey: inspected bootstrap, then ordinary
# no-URL update from recorded SOURCE, then fresh use in one attempt. Each host
# wrapper launches this helper; stage files and observations stay host-agnostic
# via ${delivery_platform}. Inspected bootstrap is supplied-source --force and
# is not the ordinary update.
# shellcheck disable=SC2034,SC2154,SC2312 # Wrappers and retention consume these globals.

delivery_update_outcome=unrun
delivery_use_outcome=unrun
delivery_version_before=
delivery_version_after=
delivery_improvement_after=false
delivery_update_before=
delivery_update_after=
delivery_use_before=
delivery_use_after=
delivery_source_after=
delivery_companion_after=
delivery_cursor_root_before=
delivery_claude_root_before=
delivery_cursor_root_after=
delivery_claude_root_after=
update_output=
update_transcript=
update_stderr=
use_output=
use_transcript=
use_stderr=
update_prompt=
use_prompt=

delivery_updated_use_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/support/native-result-retain-journey.sh
# shellcheck disable=SC1091
source "${delivery_updated_use_support_dir}/native-result-retain-journey.sh"

delivery_stage_status_label() {
  case $1 in
    exited) printf 'completed\n' ;;
    unrun | '') printf 'unrun\n' ;;
    *) printf '%s\n' "$1" ;;
  esac
}

delivery_other_tool_root_state() {
  local root=$1
  if [[ -d ${root} ]]; then
    delivery_snapshot "${root}"
  else
    printf 'absent\n'
  fi
}

delivery_capture_post_update_state() {
  delivery_update_after=$(delivery_snapshot "${delivery_target}")
  delivery_source_after=$(delivery_snapshot "${delivery_fixture_source}")
  delivery_companion_after=$(shasum -a 256 \
    "${delivery_target}/${delivery_skill_root}/companion-integration/SKILL.md")
  delivery_cursor_root_after=$(delivery_other_tool_root_state \
    "${delivery_target}/.cursor/skills")
  delivery_claude_root_after=$(delivery_other_tool_root_state \
    "${delivery_target}/.claude/skills")
  if [[ -f ${delivery_target}/${delivery_skill_root}/dough-update/VERSION ]]; then
    delivery_version_after=$(cat \
      "${delivery_target}/${delivery_skill_root}/dough-update/VERSION")
  else
    delivery_version_after=missing
  fi
  if grep -Fq "${delivery_improvement}" \
    "${delivery_target}/${delivery_skill_root}/dough-adr-awareness/SKILL.md"; then
    delivery_improvement_after=true
  else
    delivery_improvement_after=false
  fi
}

delivery_build_journey_observations() {
  local source_preserved=false
  local companion_preserved=false
  local real_transition=false
  local cursor_root claude_root

  if [[ -n ${delivery_source_before} &&
    ${delivery_source_before} == "${delivery_source_after}" ]]; then
    source_preserved=true
  fi
  if [[ -n ${delivery_companion_before} &&
    ${delivery_companion_before} == "${delivery_companion_after}" ]]; then
    companion_preserved=true
  fi
  if [[ ${delivery_update_outcome} == 'exited' &&
    ${delivery_version_before} == "${delivery_bootstrap_version}" &&
    ${delivery_version_after} == "${delivery_update_version}" &&
    ${delivery_improvement_after} == 'true' &&
    ${delivery_update_before} != "${delivery_update_after}" ]]; then
    real_transition=true
  fi
  cursor_root=$(delivery_other_tool_root_state "${delivery_target}/.cursor/skills")
  claude_root=$(delivery_other_tool_root_state "${delivery_target}/.claude/skills")

  printf 'update-execution: %s\n' \
    "$(delivery_stage_status_label "${delivery_update_outcome}")"
  printf 'use-execution: %s\n' \
    "$(delivery_stage_status_label "${delivery_use_outcome}")"
  printf 'same-target: true\n'
  printf 'target-skill-root: %s\n' "${delivery_skill_root}"
  printf 'source-preserved: %s\n' "${source_preserved}"
  printf 'companion-preserved: %s\n' "${companion_preserved}"
  printf 'real-transition: %s\n' "${real_transition}"
  printf 'update-version-before: %s\n' "${delivery_version_before}"
  printf 'update-version-after: %s\n' "${delivery_version_after}"
  printf 'improvement-after-update: %s\n' "${delivery_improvement_after}"
  printf 'other-tool-root-cursor: %s\n' "$(
    if [[ ${cursor_root} == 'absent' ]]; then
      printf 'absent\n'
    else
      printf 'present\n'
    fi
  )"
  printf 'other-tool-root-claude: %s\n' "$(
    if [[ ${claude_root} == 'absent' ]]; then
      printf 'absent\n'
    else
      printf 'present\n'
    fi
  )"
  printf 'other-tool-root-cursor-preserved: %s\n' "$(
    if [[ ${delivery_cursor_root_before} == "${delivery_cursor_root_after}" ]]; then
      printf 'true\n'
    else
      printf 'false\n'
    fi
  )"
  printf 'other-tool-root-claude-preserved: %s\n' "$(
    if [[ ${delivery_claude_root_before} == "${delivery_claude_root_after}" ]]; then
      printf 'true\n'
    else
      printf 'false\n'
    fi
  )"
  if [[ ${delivery_use_outcome} == 'unrun' ]]; then
    printf 'use-pending: true\n'
  fi
}

delivery_run_supervised_stage() {
  output_file=$1
  transcript=$2
  native_stderr=$3
  prompt=$4
  : > "${native_stderr}"
  : > "${output_file}"
  native_run_context_command
}

delivery_selected_fail() {
  local status=$1
  native_result_report_journey
  if [[ ${native_run_outcome} == timeout ]]; then
    exit 124
  fi
  exit "${status}"
}

delivery_run_selected_updated_use() {
  local update_status=0
  local use_status=0
  local dollar='$'
  local stage_prefix

  if [[ -n ${native_case_results_dir} ]]; then
    native_result_require_writable "${native_case_results_dir}"
  fi

  delivery_prepare_fixture
  delivery_assert_legacy_install
  delivery_bootstrap_candidate
  delivery_publish_improved_release
  delivery_capture_update_state

  platform=${delivery_platform}
  temporary_dir=${delivery_temporary_dir}
  candidate=${delivery_fixture_source}
  target=${delivery_target}
  stage_prefix="${delivery_temporary_dir}/${delivery_platform}"

  update_output="${stage_prefix}-update-output.md"
  update_transcript="${stage_prefix}-update.jsonl"
  update_stderr="${stage_prefix}-update-stderr.log"
  use_output="${stage_prefix}-use-output.md"
  use_transcript="${stage_prefix}-use.jsonl"
  use_stderr="${stage_prefix}-use-stderr.log"
  # shellcheck disable=SC2016 # The dollar sign is the native skill invocation.
  update_prompt="Use ${dollar}dough-update for an ordinary newer-release update of this inspected-bootstrap installation. Follow the installed updater. Do not force. Do not invoke ADR awareness."
  # shellcheck disable=SC2016 # The dollar sign is the native skill invocation.
  use_prompt="Use ${dollar}dough-adr-awareness. Assess whether work may switch telemetry history to per-node files. Do not edit files."

  delivery_version_before=$(cat \
    "${delivery_target}/${delivery_skill_root}/dough-update/VERSION")
  delivery_update_before=$(delivery_snapshot "${delivery_target}")
  delivery_cursor_root_before=$(delivery_other_tool_root_state \
    "${delivery_target}/.cursor/skills")
  delivery_claude_root_before=$(delivery_other_tool_root_state \
    "${delivery_target}/.claude/skills")

  # shellcheck disable=SC2310 # Timeout and launch failure must be observed, not lost to set -e.
  delivery_run_supervised_stage \
    "${update_output}" "${update_transcript}" "${update_stderr}" \
    "${update_prompt}" || update_status=$?
  delivery_update_outcome=${native_run_outcome}
  delivery_capture_post_update_state
  if [[ ${update_status} -ne 0 ]]; then
    delivery_selected_fail "${update_status}"
  fi
  delivery_assert_update_payload

  delivery_use_before=$(delivery_snapshot "${delivery_target}")
  # shellcheck disable=SC2310 # Timeout and launch failure must be observed, not lost to set -e.
  delivery_run_supervised_stage \
    "${use_output}" "${use_transcript}" "${use_stderr}" \
    "${use_prompt}" || use_status=$?
  delivery_use_outcome=${native_run_outcome}
  delivery_use_after=$(delivery_snapshot "${delivery_target}")
  if [[ ${use_status} -ne 0 ]]; then
    delivery_selected_fail "${use_status}"
  fi
  if [[ ${delivery_use_before} != "${delivery_use_after}" ]]; then
    printf 'FAIL: native %s changed adopter files during ADR use.\n' \
      "${delivery_host_name}" >&2
    native_result_report_journey
    exit 1
  fi
  native_journey_state_assess \
    <(delivery_build_journey_observations) "${use_output}"
  if [[ ${native_journey_state_status} == 'fail' ]]; then
    printf 'FAIL: selected %s journey state/behavior: %s\n' \
      "${delivery_host_name}" "${native_journey_state_reason}" >&2
    delivery_selected_fail 1
  fi

  printf 'PASS: selected %s delivery/updated-use completed the combined update then fresh use journey.\n' \
    "${delivery_host_name}"
  native_result_report_journey
}
