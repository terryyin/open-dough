#!/usr/bin/env bash
# shellcheck disable=SC2016,SC2154,SC2312 # Calling wrappers supply globals and pipefail semantics; backticks are literal fixture text.

delivery_assert_legacy_install() {
  local managed_file

  for managed_file in "${delivery_legacy_managed_files[@]}"; do
    git -C "${delivery_source_dir}" show \
      "v${delivery_legacy_version}:src/skills/${managed_file}" \
      | cmp - "${delivery_target}/${delivery_skill_root}/${managed_file}"
  done
  [[ $(cat "${delivery_target}/${delivery_skill_root}/dough-update/VERSION") == "${delivery_legacy_version}" ]]
  grep -Fq 'all three public payload sources' \
    "${delivery_target}/${delivery_skill_root}/dough-update/SKILL.md"
  grep -Fq 'The complete public payload is `dough-update/SKILL.md` and' \
    "${delivery_fixture_source}/src/skills/dough-update/SKILL.md"
  [[ -f "${delivery_fixture_source}/src/skills/dough-adr-awareness/RECOGNITION.md" ]]
}

delivery_capture_legacy_state() {
  delivery_legacy_before=$(delivery_snapshot "${delivery_target}")
  delivery_bootstrap_source_before=$(delivery_snapshot "${delivery_fixture_source}")
}

delivery_assert_legacy_refusal() {
  local refusal_output=$1

  [[ ${delivery_legacy_before} == "$(delivery_snapshot "${delivery_target}")" ]]
  [[ ${delivery_bootstrap_source_before} == "$(delivery_snapshot "${delivery_fixture_source}")" ]]
  delivery_require_output 'the legacy three-file contract' \
    'three[- ]file|three .*payload|three .*installed|all three' "${refusal_output}"
  delivery_require_output 'the candidate two-file contract' \
    'two[- ]file|two .*payload|two .*installed|both .*payload' "${refusal_output}"
  delivery_require_output 'refusal without replacement' \
    'refus|declin|did not (install|update|change)|no .*change|unchanged' \
    "${refusal_output}"
}

delivery_bootstrap_candidate() {
  local checkout="${delivery_temporary_dir}/inspected-bootstrap"
  local resolved tag commit version managed_file

  [[ -n ${delivery_platform} ]]
  mkdir -p -- "${checkout}"
  git -C "${checkout}" init -q --initial-branch=main
  resolved=$(bash \
    "${delivery_fixture_source}/src/install/open-dough-release.sh" \
    pin-latest "${checkout}" "${delivery_source_url}")
  IFS=$'\t' read -r tag commit version << EOF
${resolved}
EOF
  [[ ${tag} == "v${delivery_bootstrap_version}" ]]
  [[ ${commit} == "${delivery_bootstrap_revision}" ]]
  [[ ${version} == "${delivery_bootstrap_version}" ]]
  for managed_file in install.sh src/install/open-dough-release.sh \
    src/skills/dough-update/SKILL.md \
    src/skills/dough-adr-awareness/SKILL.md; do
    cmp "${delivery_fixture_source}/${managed_file}" \
      "${checkout}/${managed_file}"
  done
  grep -Fq 'managed_files=(' "${checkout}/install.sh"
  grep -Fq 'The complete public payload is `dough-update/SKILL.md` and' \
    "${checkout}/src/skills/dough-update/SKILL.md"
  delivery_bootstrap_output="${delivery_temporary_dir}/bootstrap-output.txt"
  bash "${checkout}/src/install/open-dough-release.sh" apply \
    --url "${delivery_source_url}" --target "${delivery_target}" \
    --platform "${delivery_platform}" --checkout "${checkout}" --force > \
    "${delivery_bootstrap_output}"

  for managed_file in "${delivery_current_managed_files[@]}"; do
    cmp "${delivery_fixture_source}/src/skills/${managed_file}" \
      "${delivery_target}/${delivery_skill_root}/${managed_file}"
  done
  [[ ! -e "${delivery_target}/${delivery_skill_root}/dough-adr-awareness/RECOGNITION.md" ]]
  [[ $(cat "${delivery_target}/${delivery_skill_root}/dough-update/VERSION") == "${delivery_bootstrap_version}" ]]
  if grep -Fq "${delivery_improvement}" \
    "${delivery_target}/${delivery_skill_root}/dough-adr-awareness/SKILL.md"; then
    echo 'FAIL: inspected bootstrap already contains the later improvement.' >&2
    return 1
  fi
}

delivery_publish_improved_release() {
  printf '\n%s\n' '## Improved conflict evidence' \
    "${delivery_improvement}" >> \
    "${delivery_fixture_source}/src/skills/dough-adr-awareness/SKILL.md"
  printf '%s\n' "${delivery_update_version}" > \
    "${delivery_fixture_source}/VERSION"
  printf '## %s - 2026-09-07\n' "${delivery_update_version}" > \
    "${delivery_fixture_source}/CHANGELOG.md"
  git -C "${delivery_fixture_source}" add -A
  git -C "${delivery_fixture_source}" \
    -c user.name='Open Dough fixture' \
    -c user.email='fixture@example.invalid' \
    commit -qm 'fixture: improve conflicting ADR evidence'
  git -C "${delivery_fixture_source}" \
    -c user.name='Open Dough fixture' \
    -c user.email='fixture@example.invalid' \
    tag -am "v${delivery_update_version}" "v${delivery_update_version}"
  delivery_source_revision=$(git -C "${delivery_fixture_source}" rev-parse HEAD)
}

delivery_capture_update_state() {
  delivery_source_before=$(delivery_snapshot "${delivery_fixture_source}")
  delivery_companion_before=$(shasum -a 256 \
    "${delivery_target}/${delivery_skill_root}/companion-integration/SKILL.md")
}

delivery_assert_update() {
  local update_output=$1
  local require_native_report=${2:-1}
  local source_after source_status companion_after actual_changes expected_changes
  local recognition_install_claims recognition_unqualified_lines

  source_after=$(delivery_snapshot "${delivery_fixture_source}")
  source_status=$(git -C "${delivery_fixture_source}" status --porcelain)
  [[ "${delivery_source_before}" == "${source_after}" ]]
  [[ -z ${source_status} ]]
  for managed_file in "${delivery_current_managed_files[@]}"; do
    cmp "${delivery_fixture_source}/src/skills/${managed_file}" \
      "${delivery_target}/${delivery_skill_root}/${managed_file}"
  done
  grep -Fq "${delivery_improvement}" \
    "${delivery_target}/${delivery_skill_root}/dough-adr-awareness/SKILL.md"
  companion_after=$(shasum -a 256 \
    "${delivery_target}/${delivery_skill_root}/companion-integration/SKILL.md")
  [[ "${delivery_companion_before}" == "${companion_after}" ]]
  [[ ! -e "${delivery_target}/${delivery_skill_root}/dough-adr-awareness/RECOGNITION.md" ]]
  [[ ! -e "${delivery_target}/${delivery_skill_root}/adr-awareness" ]]

  actual_changes=$(git -C "${delivery_target}" diff --name-only)
  expected_changes=$(printf '%s\n' \
    "${delivery_skill_root}/dough-adr-awareness/RECOGNITION.md" \
    "${delivery_skill_root}/dough-adr-awareness/SKILL.md" \
    "${delivery_skill_root}/dough-update/SKILL.md" \
    "${delivery_skill_root}/dough-update/VERSION")
  [[ "${actual_changes}" == "${expected_changes}" ]]
  grep -Fq "${delivery_source_url}" "${update_output}"
  grep -Fq "${delivery_source_revision}" "${update_output}"
  if ! grep -Fqi "${delivery_host_name}" "${update_output}" \
    && ! grep -Fq "${delivery_skill_root}" "${update_output}"; then
    echo 'FAIL: update output omitted the selected native tool or skill root.' >&2
    return 1
  fi
  grep -Eiq "v${delivery_update_version}|release" "${update_output}"
  if [[ ${require_native_report} -eq 1 ]]; then
    for managed_file in "${delivery_current_managed_files[@]}"; do
      grep -Fq "${delivery_skill_root}/${managed_file}" "${update_output}"
    done
  fi
  if recognition_install_claims=$(
    grep -Ei 'RECOGNITION\.md' "${update_output}" \
      | grep -Ei 'install(ed|ing)?|cop(y|ied)|writ(e|ten)|wrote|creat(e|ed)|add(ed|ing)?' \
      | grep -Eiv '(not ([^[:space:]]+ )*installed|did not .*install|retir|remov|exclud)'
  ); then
    echo 'FAIL: current updater claimed recognition was installed:' >&2
    printf '%s\n' "${recognition_install_claims}" >&2
    return 1
  fi
  if recognition_unqualified_lines=$(
    grep -Ei 'RECOGNITION\.md' "${update_output}" \
      | grep -Eiv '(RECOGNITION\.md.{0,160}(retir|remov|source[- ]only|not ([^[:space:]]+ )*installed|excluded from ([^[:space:]]+ )*installed))|((retir|remov|source[- ]only|not ([^[:space:]]+ )*installed|excluded from ([^[:space:]]+ )*installed).{0,160}RECOGNITION\.md)'
  ); then
    echo 'FAIL: current updater reported recognition without its retired/source-only boundary:' >&2
    printf '%s\n' "${recognition_unqualified_lines}" >&2
    return 1
  fi
}

delivery_print_proof() {
  local update_output=$1
  local use_output=$2
  local refusal_output=$3
  local companion_digest
  companion_digest=${delivery_companion_before%% *}

  printf '%s\n' "--- ${delivery_host_upper} LEGACY REFUSAL PROOF ---"
  cat "${refusal_output}"
  printf '\n%s\n' "--- ${delivery_host_upper} INSPECTED BOOTSTRAP PROOF ---"
  cat "${delivery_bootstrap_output}"
  printf '%s\n' "--- ${delivery_host_upper} INSTALLED-IMPROVEMENT UPDATE PROOF ---"
  cat "${update_output}"
  printf '\n%s\n' "--- ${delivery_host_upper} INSTALLED-IMPROVEMENT USE PROOF ---"
  cat "${use_output}"
  printf '\n%s\n' "--- ${delivery_host_upper} DELIVERY-TO-USE INTEGRITY PROOF ---"
  printf 'fixture source: %s\n' "${delivery_source_url}"
  printf 'legacy release: v%s\n' "${delivery_legacy_version}"
  printf 'bootstrap release: v%s (commit %s)\n' \
    "${delivery_bootstrap_version}" "${delivery_bootstrap_revision}"
  printf 'fixture release: v%s\n' "${delivery_update_version}"
  printf 'fixture release commit: %s\n' "${delivery_source_revision}"
  printf 'installed recognition: absent\n'
  printf 'preserved companion SHA-256: %s\n' "${companion_digest}"
}
