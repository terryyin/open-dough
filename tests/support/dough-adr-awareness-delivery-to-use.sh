#!/usr/bin/env bash
# shellcheck disable=SC2034,SC2154,SC2312 # Platform wrappers and sourced helpers consume these globals.

delivery_source_dir=
delivery_fixture=
delivery_host_name=
delivery_host_upper=
delivery_platform=
delivery_skill_root=
delivery_improvement='When authoritative status sources disagree, enumerate each conflicting repository-relative source and the value it reports before asking a human to resolve precedence.'
# shellcheck source=tests/helpers/public-payload-fixture.bash
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
delivery_current_managed_files=("${managed_files[@]}")
delivery_baseline_version=0.2.1
delivery_update_version=0.2.2

# shellcheck source=tests/helpers/release-fixture.bash
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/release-fixture.bash"
# shellcheck source=tests/helpers/rewrite-file.bash
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/rewrite-file.bash"
# shellcheck source=src/install/open-dough-platform.sh
# shellcheck disable=SC1091
source "${source_dir}/src/install/open-dough-platform.sh"
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
  delivery_assert_baseline_install
  delivery_capture_update_state
  output="${delivery_temporary_dir}/deterministic-update-output.txt"
  delivery_apply_ordinary_from_recorded_source "${output}"
  delivery_assert_update "${output}" 0
  echo "PASS: the ${delivery_host_name} delivery-to-use fixture installs a verified older current-contract payload with recorded SOURCE, ordinarily updates to the newer tagged release from that SOURCE without a URL, and preserves coexistence."
  echo "PENDING: native ${delivery_host_name} ordinary update and improved ADR use; run --native."
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
  delivery_older_checkout="${delivery_temporary_dir}/older-release"
  delivery_target="${delivery_temporary_dir}/atlas adopter"
  mkdir -p -- "${delivery_fixture_source}"
  cp -R -- "${delivery_fixture}" "${delivery_target}"
  mkdir -p -- \
    "${delivery_target}/${delivery_skill_root}/companion-integration"
  printf '%s\n' \
    '---' \
    'name: companion-integration' \
    'description: Existing client project integration preserved by updates.' \
    '---' \
    '' \
    '# Companion integration' \
    '' \
    'Keep this installed integration unchanged.' > \
    "${delivery_target}/${delivery_skill_root}/companion-integration/SKILL.md"
  rewrite_file "${delivery_target}/architecture/decisions/CATALOG.md" \
    's/| \[ARC-12\](\.\/retain-complete-telemetry-history\.md) | Adopted |/| [ARC-12](.\/retain-complete-telemetry-history.md) | Replaced |/'

  git -C "${delivery_fixture_source}" init --quiet -b main
  git_identity "${delivery_fixture_source}"
  write_candidate_payload "${delivery_fixture_source}" \
    "${delivery_baseline_version}" baseline-adr
  if grep -Fq "${delivery_improvement}" \
    "${delivery_fixture_source}/src/skills/dough-adr-awareness/SKILL.md"; then
    echo 'FAIL: baseline fixture already has the later ADR improvement.' >&2
    return 1
  fi
  commit_all "${delivery_fixture_source}" 'release baseline current-contract payload'
  tag_release "${delivery_fixture_source}" "${delivery_baseline_version}" \
    '2026-09-06T00:00:00'
  delivery_baseline_revision=$(git -C "${delivery_fixture_source}" rev-parse HEAD)

  write_candidate_payload "${delivery_fixture_source}" \
    "${delivery_update_version}" improved-adr
  printf '\n%s\n' '## Improved conflict evidence' \
    "${delivery_improvement}" >> \
    "${delivery_fixture_source}/src/skills/dough-adr-awareness/SKILL.md"
  commit_all "${delivery_fixture_source}" 'release improved ADR conflict evidence'
  tag_release "${delivery_fixture_source}" "${delivery_update_version}" \
    '2026-09-07T00:00:00'
  delivery_source_revision=$(git -C "${delivery_fixture_source}" rev-parse HEAD)
  delivery_source_url="file://$(cd -- "${delivery_fixture_source}" && pwd -P)"

  checkout_tagged_release "${delivery_fixture_source}" \
    "${delivery_older_checkout}" "${delivery_baseline_version}"
  bash "${delivery_older_checkout}/install.sh" \
    --target "${delivery_target}" --source "${delivery_source_url}" \
    --platform "${delivery_platform}" > /dev/null

  if grep -Fq "${delivery_improvement}" \
    "${delivery_target}/${delivery_skill_root}/dough-adr-awareness/SKILL.md"; then
    printf 'FAIL: baseline %s installation already has fixture improvement.\n' \
      "${delivery_host_name}" >&2
    return 1
  fi

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
