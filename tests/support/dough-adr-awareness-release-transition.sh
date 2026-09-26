#!/usr/bin/env bash
# shellcheck disable=SC2016,SC2154,SC2312 # Calling wrappers supply globals and pipefail semantics; backticks are literal fixture text.

delivery_payload_skill_roots() {
  local destination

  while IFS=$'\t' read -r _ destination; do
    printf '%s\n' "$(dirname -- "${destination#"${delivery_target}/"}")"
  done < <(all_destinations_for "${delivery_target}")
}

delivery_assert_baseline_install() {
  local skill_root

  git -C "${delivery_fixture_source}" rev-parse --verify \
    "v${delivery_baseline_version}^{commit}" > /dev/null
  git -C "${delivery_fixture_source}" rev-parse --verify \
    "v${delivery_update_version}^{commit}" > /dev/null
  [[ ${delivery_baseline_revision} == "$(git -C "${delivery_fixture_source}" \
    rev-parse "v${delivery_baseline_version}^{commit}")" ]]
  [[ ${delivery_source_revision} == "$(git -C "${delivery_fixture_source}" \
    rev-parse "v${delivery_update_version}^{commit}")" ]]
  grep -Fq "${delivery_improvement}" \
    "${delivery_fixture_source}/src/skills/dough-adr-awareness/SKILL.md"
  while IFS= read -r skill_root; do
    assert_payload_bytes_match "${delivery_older_checkout}/src/skills" \
      "${delivery_target}/${skill_root}"
    [[ $(cat "${delivery_target}/${skill_root}/dough-update/VERSION") == "${delivery_baseline_version}" ]]
    [[ $(cat "${delivery_target}/${skill_root}/dough-update/SOURCE") == "${delivery_source_url}" ]]
    if grep -Fq "${delivery_improvement}" \
      "${delivery_target}/${skill_root}/dough-adr-awareness/SKILL.md"; then
      echo 'FAIL: older baseline already contains the later improvement.' >&2
      return 1
    fi
  done < <(delivery_payload_skill_roots)
}

delivery_apply_ordinary_from_recorded_source() {
  local output=$1
  local recorded

  recorded=$(cat "${delivery_target}/${delivery_skill_root}/dough-update/SOURCE")
  [[ ${recorded} == "${delivery_source_url}" ]]
  bash "${delivery_fixture_source}/src/install/open-dough-release.sh" apply \
    --target "${delivery_target}" --platform "${delivery_platform}" > "${output}"
  grep -Fq "Source: ${recorded}" "${output}"
  [[ $(cat "${delivery_target}/${delivery_skill_root}/dough-update/SOURCE") == "${recorded}" ]]
}

delivery_capture_update_state() {
  delivery_source_before=$(delivery_snapshot "${delivery_fixture_source}")
  delivery_companion_before=$(shasum -a 256 \
    "${delivery_target}/${delivery_skill_root}/companion-integration/SKILL.md")
}

delivery_assert_update_payload() {
  local source_after source_status companion_after actual_changes expected_changes
  local skill_root

  source_after=$(delivery_snapshot "${delivery_fixture_source}")
  source_status=$(git -C "${delivery_fixture_source}" status --porcelain)
  [[ "${delivery_source_before}" == "${source_after}" ]] || return 1
  [[ -z ${source_status} ]] || return 1
  while IFS= read -r skill_root; do
    assert_payload_bytes_match "${delivery_fixture_source}/src/skills" \
      "${delivery_target}/${skill_root}" || return 1
    [[ $(cat "${delivery_target}/${skill_root}/dough-update/SOURCE") == "${delivery_source_url}" ]] || return 1
    [[ $(cat "${delivery_target}/${skill_root}/dough-update/VERSION") == "${delivery_update_version}" ]] || return 1
  done < <(delivery_payload_skill_roots)
  grep -Fq "${delivery_improvement}" \
    "${delivery_target}/${delivery_skill_root}/dough-adr-awareness/SKILL.md" || return 1
  companion_after=$(shasum -a 256 \
    "${delivery_target}/${delivery_skill_root}/companion-integration/SKILL.md")
  [[ "${delivery_companion_before}" == "${companion_after}" ]] || return 1

  actual_changes=$(git -C "${delivery_target}" diff --name-only)
  expected_changes=''
  while IFS= read -r skill_root; do
    expected_changes+=$(printf '%s\n' \
      "${skill_root}/dough-adr-awareness/SKILL.md" \
      "${skill_root}/dough-update/SKILL.md" \
      "${skill_root}/dough-update/VERSION")
    expected_changes+=$'\n'
  done < <(delivery_payload_skill_roots)
  expected_changes=$(printf '%s' "${expected_changes}" | LC_ALL=C sort)
  [[ "${actual_changes}" == "${expected_changes}" ]] || return 1
}

delivery_assert_update() {
  local update_output=$1
  local require_native_report=${2:-1}

  delivery_assert_update_payload
  grep -Fq "${delivery_source_url}" "${update_output}"
  grep -Fq "${delivery_source_revision}" "${update_output}"
  if ! grep -Fqi "${delivery_host_name}" "${update_output}" \
    && ! grep -Fq "${delivery_skill_root}" "${update_output}"; then
    echo 'FAIL: update output omitted the selected native tool or skill root.' >&2
    return 1
  fi
  grep -Eiq "v${delivery_update_version}|release" "${update_output}"
  if [[ ${require_native_report} -eq 1 ]]; then
    # A real native report reasonably summarizes a long file list ("+ 9 files
    # under references/") rather than transcribing every nested path; asking
    # a genuine session to itemize all ~25 managed files verbatim tests
    # verbosity, not completeness. Require each managed *skill* to be named,
    # and rely on delivery_assert_update_payload above for byte-exact proof
    # of what actually landed on disk.
    local skill_name
    for managed_file in "${managed_files[@]}"; do
      skill_name=${managed_file%%/*}
      grep -Fq "${skill_name}" "${update_output}" || {
        echo "FAIL: update output omitted managed skill ${skill_name}." >&2
        return 1
      }
    done
  fi
}

delivery_print_proof() {
  local update_output=$1
  local use_output=$2
  local companion_digest
  companion_digest=${delivery_companion_before%% *}

  printf '%s\n' "--- ${delivery_host_upper} INSTALLED-IMPROVEMENT UPDATE PROOF ---"
  cat "${update_output}"
  printf '\n%s\n' "--- ${delivery_host_upper} INSTALLED-IMPROVEMENT USE PROOF ---"
  cat "${use_output}"
  printf '\n%s\n' "--- ${delivery_host_upper} DELIVERY-TO-USE INTEGRITY PROOF ---"
  printf 'fixture source: %s\n' "${delivery_source_url}"
  printf 'baseline release: v%s (commit %s)\n' \
    "${delivery_baseline_version}" "${delivery_baseline_revision}"
  printf 'fixture release: v%s\n' "${delivery_update_version}"
  printf 'fixture release commit: %s\n' "${delivery_source_revision}"
  printf 'preserved companion SHA-256: %s\n' "${companion_digest}"
}
