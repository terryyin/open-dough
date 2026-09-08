#!/usr/bin/env bash
# shellcheck disable=SC2034,SC2154,SC2312 # Platform wrappers and sourced helpers consume these globals.

delivery_source_dir=
delivery_fixture=
delivery_host_name=
delivery_host_upper=
delivery_platform=
delivery_skill_root=
delivery_baseline_platforms=()
delivery_improvement='When authoritative status sources disagree, enumerate each conflicting repository-relative source and the value it reports before asking a human to resolve precedence.'
delivery_current_managed_files=(
  dough-update/SKILL.md
  dough-adr-awareness/SKILL.md
  dough-product-backlog/SKILL.md
)
delivery_legacy_managed_files=(
  dough-update/SKILL.md
  dough-adr-awareness/SKILL.md
  dough-adr-awareness/RECOGNITION.md
)
delivery_legacy_version=0.2.0
delivery_bootstrap_version=0.2.1
delivery_update_version=0.2.2

# shellcheck source=tests/support/dough-adr-awareness-release-transition.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/dough-adr-awareness-release-transition.sh"
# shellcheck source=tests/support/native-cases.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-cases.sh"
# shellcheck source=tests/support/native-result-retain.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-result-retain.sh"
# shellcheck source=tests/support/native-run-supervise.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-run-supervise.sh"
# shellcheck source=tests/support/dough-adr-awareness-updated-use.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/dough-adr-awareness-updated-use.sh"

delivery_parse_native_case_args() {
  native_case_entry="tests/dough-adr-awareness-${delivery_platform}-delivery-to-use.sh"
  native_case_parse --wrapper delivery --host "${delivery_platform}" "$@"
  case ${native_case_mode} in
    list)
      native_case_print_listing
      exit 0
      ;;
    native-selected)
      case ${native_case_id} in
        delivery/updated-use)
          delivery_run_selected_updated_use
          exit 0
          ;;
        delivery/legacy-refusal | delivery/ordinary-update)
          native_case_reject_unavailable_selected
          ;;
        *)
          native_case_fail "unknown case '${native_case_id}'"
          ;;
      esac
      ;;
    default | native-full) ;;
    *)
      native_case_fail "internal error: unexpected mode ${native_case_mode}"
      ;;
  esac
}

delivery_run_deterministic_transition() {
  local output

  delivery_prepare_fixture
  delivery_assert_legacy_install
  delivery_capture_legacy_state
  delivery_bootstrap_candidate
  delivery_publish_improved_release
  delivery_capture_update_state
  output="${delivery_temporary_dir}/deterministic-update-output.txt"
  delivery_apply_ordinary_from_recorded_source "${output}"
  delivery_assert_update "${output}" 0
  echo "PASS: the ${delivery_host_name} delivery-to-use fixture starts from the genuine v0.2.0 three-file payload, exposes its contract mismatch with the two-file candidate, bootstraps the inspected v0.2.1 candidate with supplied-source force, ordinarily updates to v0.2.2 from the recorded SOURCE without a URL, retires recognition, and preserves coexistence."
  echo "PENDING: native ${delivery_host_name} legacy refusal, ordinary update, and improved ADR use; run --native."
}

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
  mkdir -p -- "${delivery_fixture_source}/src/install" \
    "${delivery_fixture_source}/src/skills/dough-update" \
    "${delivery_fixture_source}/src/skills/dough-adr-awareness" \
    "${delivery_fixture_source}/src/skills/dough-product-backlog"
  cp -R -- "${delivery_fixture}" "${delivery_target}"
  cp -- "${delivery_source_dir}/install.sh" \
    "${delivery_fixture_source}/install.sh"
  cp -- "${delivery_source_dir}/src/install/"*.sh \
    "${delivery_fixture_source}/src/install/"
  for managed_file in "${delivery_current_managed_files[@]}"; do
    cp -- "${delivery_source_dir}/src/skills/${managed_file}" \
      "${delivery_fixture_source}/src/skills/${managed_file}"
  done
  cp -- "${delivery_source_dir}/src/skills/dough-adr-awareness/RECOGNITION.md" \
    "${delivery_fixture_source}/src/skills/dough-adr-awareness/RECOGNITION.md"
  printf '%s\n' "${delivery_bootstrap_version}" > \
    "${delivery_fixture_source}/VERSION"
  printf '## %s - 2026-09-07\n' "${delivery_bootstrap_version}" > \
    "${delivery_fixture_source}/CHANGELOG.md"
  git -C "${delivery_fixture_source}" init -q --initial-branch=main
  git -C "${delivery_fixture_source}" add install.sh src VERSION CHANGELOG.md
  git -C "${delivery_fixture_source}" \
    -c user.name='Open Dough fixture' \
    -c user.email='fixture@example.invalid' \
    commit -qm 'fixture: bootstrap three-skill public payload'
  git -C "${delivery_fixture_source}" \
    -c user.name='Open Dough fixture' \
    -c user.email='fixture@example.invalid' \
    tag -am "v${delivery_bootstrap_version}" "v${delivery_bootstrap_version}"
  delivery_bootstrap_revision=$(git -C "${delivery_fixture_source}" rev-parse HEAD)
  delivery_source_url="file://${delivery_fixture_source}"

  for platform in "${delivery_baseline_platforms[@]}"; do
    local skill_root managed_file
    case ${platform} in
      codex) skill_root='.agents/skills' ;;
      cursor) skill_root='.cursor/skills' ;;
      claude) skill_root='.claude/skills' ;;
      *) return 2 ;;
    esac
    for managed_file in "${delivery_legacy_managed_files[@]}"; do
      mkdir -p -- "${delivery_target}/${skill_root}/$(dirname -- "${managed_file}")"
      git -C "${delivery_source_dir}" show \
        "v${delivery_legacy_version}:src/skills/${managed_file}" > \
        "${delivery_target}/${skill_root}/${managed_file}"
    done
    printf '%s\n' "${delivery_legacy_version}" > \
      "${delivery_target}/${skill_root}/dough-update/VERSION"
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
