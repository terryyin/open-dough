#!/usr/bin/env bash

delivery_source_dir=
delivery_fixture=
delivery_host_name=
delivery_host_upper=
delivery_skill_root=
delivery_baseline_platforms=()
delivery_improvement='When authoritative status sources disagree, enumerate each conflicting repository-relative source and the value it reports before asking a human to resolve precedence.'
delivery_managed_files=(
  dough-update/SKILL.md
  dough-adr-awareness/SKILL.md
  dough-adr-awareness/RECOGNITION.md
)

delivery_snapshot() {
  local root=$1
  (
    cd -- "${root}" || exit
    # shellcheck disable=SC2312 # pipefail preserves failures across the digest pipeline.
    find . -type f ! -path './.git/*' -print0 \
      | LC_ALL=C sort -z \
      | xargs -0 shasum -a 256
  )
}

delivery_require_output() {
  local label=$1
  local pattern=$2
  local output_file=$3
  if ! grep -Eiq "${pattern}" "${output_file}"; then
    printf 'FAIL: native %s output omitted %s.\n' \
      "${delivery_host_name}" "${label}" >&2
    return 1
  fi
}

delivery_check_fixture() {
  [[ -n ${delivery_source_dir} ]]
  [[ -n ${delivery_fixture} ]]
  [[ -n ${delivery_host_name} ]]
  [[ -n ${delivery_host_upper} ]]
  [[ -n ${delivery_skill_root} ]]
  ((${#delivery_baseline_platforms[@]} > 0))
  grep -Fq 'The catalog and each record' "${delivery_fixture}/AGENTS.md"
  grep -Fq '| [ARC-12]' \
    "${delivery_fixture}/architecture/decisions/CATALOG.md"
  grep -Fq 'Standing: Adopted' \
    "${delivery_fixture}/architecture/decisions/retain-complete-telemetry-history.md"
  grep -Fq "| ${delivery_host_name} |" \
    "${delivery_source_dir}/src/skills/dough-update/SKILL.md"
}

delivery_prepare_fixture() {
  delivery_temporary_dir=$(mktemp -d)
  trap 'rm -rf -- "${delivery_temporary_dir}"' EXIT
  delivery_fixture_source="${delivery_temporary_dir}/fixture-source"
  delivery_target="${delivery_temporary_dir}/atlas adopter"
  mkdir -p -- "${delivery_fixture_source}/src/skills/dough-update" \
    "${delivery_fixture_source}/src/skills/dough-adr-awareness"
  cp -R -- "${delivery_fixture}" "${delivery_target}"
  cp -- "${delivery_source_dir}/install.sh" \
    "${delivery_fixture_source}/install.sh"
  for managed_file in "${delivery_managed_files[@]}"; do
    cp -- "${delivery_source_dir}/src/skills/${managed_file}" \
      "${delivery_fixture_source}/src/skills/${managed_file}"
  done

  printf '\n%s\n' '## Improved conflict evidence' \
    "${delivery_improvement}" >> \
    "${delivery_fixture_source}/src/skills/dough-adr-awareness/SKILL.md"
  printf '\n%s\n' \
    '- Improvement evidence: names every conflicting repository-relative status authority and its reported value before requesting human precedence.' >> \
    "${delivery_fixture_source}/src/skills/dough-adr-awareness/RECOGNITION.md"
  git -C "${delivery_fixture_source}" init -q --initial-branch=main
  git -C "${delivery_fixture_source}" add install.sh src
  git -C "${delivery_fixture_source}" \
    -c user.name='Open Dough fixture' \
    -c user.email='fixture@example.invalid' \
    commit -qm 'fixture: enumerate conflicting ADR status sources'
  delivery_source_revision=$(git -C "${delivery_fixture_source}" rev-parse HEAD)
  delivery_source_url="file://${delivery_fixture_source}"

  for platform in "${delivery_baseline_platforms[@]}"; do
    bash "${delivery_source_dir}/install.sh" \
      --target "${delivery_target}" --platform "${platform}"
  done
  if grep -Fq "${delivery_improvement}" \
    "${delivery_target}/${delivery_skill_root}/dough-adr-awareness/SKILL.md"; then
    printf 'FAIL: baseline %s installation already has fixture improvement.\n' \
      "${delivery_host_name}" >&2
    return 1
  fi

  mkdir -p -- \
    "${delivery_target}/${delivery_skill_root}/companion-integration"
  printf '%s\n' \
    '---' \
    'name: companion-integration' \
    'description: Existing adopter integration preserved by updates.' \
    '---' \
    '' \
    '# Companion integration' \
    '' \
    'Keep this installed integration unchanged.' > \
    "${delivery_target}/${delivery_skill_root}/companion-integration/SKILL.md"
  sed -i '' \
    's/| \[ARC-12\](\.\/retain-complete-telemetry-history\.md) | Adopted |/| [ARC-12](.\/retain-complete-telemetry-history.md) | Replaced |/' \
    "${delivery_target}/architecture/decisions/CATALOG.md"
  git -C "${delivery_target}" init -q --initial-branch=main
  git -C "${delivery_target}" add .
  git -C "${delivery_target}" \
    -c user.name='Adopter fixture' \
    -c user.email='fixture@example.invalid' \
    commit -qm 'fixture: install previous public guidance'
}

delivery_capture_update_state() {
  delivery_source_before=$(delivery_snapshot "${delivery_fixture_source}")
  delivery_companion_before=$(shasum -a 256 \
    "${delivery_target}/${delivery_skill_root}/companion-integration/SKILL.md")
}

delivery_assert_update() {
  local update_output=$1
  local source_after source_status companion_after actual_changes expected_changes

  source_after=$(delivery_snapshot "${delivery_fixture_source}")
  source_status=$(git -C "${delivery_fixture_source}" status --porcelain)
  [[ "${delivery_source_before}" == "${source_after}" ]]
  [[ -z ${source_status} ]]
  for managed_file in "${delivery_managed_files[@]}"; do
    cmp "${delivery_fixture_source}/src/skills/${managed_file}" \
      "${delivery_target}/${delivery_skill_root}/${managed_file}"
  done
  grep -Fq "${delivery_improvement}" \
    "${delivery_target}/${delivery_skill_root}/dough-adr-awareness/SKILL.md"
  companion_after=$(shasum -a 256 \
    "${delivery_target}/${delivery_skill_root}/companion-integration/SKILL.md")
  [[ "${delivery_companion_before}" == "${companion_after}" ]]
  [[ ! -e "${delivery_target}/${delivery_skill_root}/adr-awareness" ]]

  actual_changes=$(git -C "${delivery_target}" diff --name-only)
  expected_changes=$(printf '%s\n' \
    "${delivery_skill_root}/dough-adr-awareness/RECOGNITION.md" \
    "${delivery_skill_root}/dough-adr-awareness/SKILL.md")
  [[ "${actual_changes}" == "${expected_changes}" ]]
  grep -Fq "${delivery_source_url}" "${update_output}"
  grep -Fq "${delivery_source_revision}" "${update_output}"
  grep -Fqi "${delivery_host_name}" "${update_output}"
  grep -Eiq 'default branch|default-branch' "${update_output}"
  grep -Eiq \
    'not .*release|rather than a release|not .*version|no .*release|no .*version' \
    "${update_output}"
  for managed_file in "${delivery_managed_files[@]}"; do
    grep -Fq "${delivery_skill_root}/${managed_file}" "${update_output}"
  done
}

delivery_assert_use() {
  local use_output=$1
  local dollar='$'

  delivery_require_output 'the explicit skill invocation' \
    "Invocation: \\${dollar}dough-adr-awareness" "${use_output}"
  delivery_require_output 'the catalog authority' \
    'architecture/decisions/CATALOG\.md' "${use_output}"
  delivery_require_output 'the ARC-12 record authority' \
    'architecture/decisions/retain-complete-telemetry-history\.md' "${use_output}"
  delivery_require_output 'the Replaced catalog value' 'Replaced' "${use_output}"
  delivery_require_output 'the Adopted record value' 'Adopted' "${use_output}"
  delivery_require_output 'conflict recognition' \
    'conflict|disagree|ambigu' "${use_output}"
  delivery_require_output 'a stop pending resolution' \
    'stop|stopped|blocked|did not proceed|cannot proceed|cannot yet be assessed|remains incomplete|until .*resolved|pending .*resolution' \
    "${use_output}"
  delivery_require_output 'human-owned precedence resolution' \
    'human|you.*(choose|resolve)|owns?.*precedence' "${use_output}"
  delivery_require_output 'the no-change report' \
    'no .*changed|did not (change|modify)|changed (neither|no)|changed .*:.*no' \
    "${use_output}"
  if grep -Fq '## ADR CHECK COMPLETE' "${use_output}"; then
    printf 'FAIL: %s claimed completion despite unresolved authority.\n' \
      "${delivery_host_name}" >&2
    return 1
  fi
  if grep -Eiq 'docs/adrs|doughnut' "${use_output}"; then
    echo 'FAIL: native use fell back to source-project layout or identity.' >&2
    return 1
  fi
}

delivery_print_proof() {
  local update_output=$1
  local use_output=$2
  local recognition_digest recognition_line companion_digest
  recognition_line=$(shasum -a 256 \
    "${delivery_target}/${delivery_skill_root}/dough-adr-awareness/RECOGNITION.md")
  recognition_digest=${recognition_line%% *}
  companion_digest=${delivery_companion_before%% *}

  printf '%s\n' "--- ${delivery_host_upper} INSTALLED-IMPROVEMENT UPDATE PROOF ---"
  cat "${update_output}"
  printf '\n%s\n' "--- ${delivery_host_upper} INSTALLED-IMPROVEMENT USE PROOF ---"
  cat "${use_output}"
  printf '\n%s\n' "--- ${delivery_host_upper} DELIVERY-TO-USE INTEGRITY PROOF ---"
  printf 'fixture source: %s\n' "${delivery_source_url}"
  printf 'fixture default-branch commit: %s\n' "${delivery_source_revision}"
  printf 'installed recognition SHA-256: %s\n' "${recognition_digest}"
  printf 'preserved companion SHA-256: %s\n' "${companion_digest}"
}
