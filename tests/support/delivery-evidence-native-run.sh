#!/usr/bin/env bash
# Shared native journey for the delivery-evidence cases (selection, claims,
# consumers, gaps): disposable fixture scaffolding, prompt, native command,
# assessment, retention, and evidence identity. Each case keeps its own
# scenario content, observations, and assessor in
# delivery-evidence-CASE-native-{scenario-content,observe,assess}.sh.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
for delivery_evidence_case in selection claims consumers gaps; do
  for delivery_evidence_part in scenario-content observe assess; do
    # shellcheck disable=SC1090,SC1091
    source "${delivery_evidence_support_dir}/delivery-evidence-${delivery_evidence_case}-native-${delivery_evidence_part}.sh"
  done
done
unset delivery_evidence_case delivery_evidence_part

delivery_evidence_root=
delivery_evidence_workspace=
delivery_evidence_scenario=
delivery_evidence_scenarios=
delivery_evidence_pass_basis=

# Case table: scenarios in run order and the observable basis named on PASS.
delivery_evidence_case_profile() {
  case $1 in
    selection)
      delivery_evidence_scenarios='zero-test partial-selection complete-selection'
      delivery_evidence_pass_basis='observable selection state'
      ;;
    claims)
      delivery_evidence_scenarios='unsupported-claim corrected-no-link equivalent-layout'
      delivery_evidence_pass_basis='observable claim support'
      ;;
    consumers)
      delivery_evidence_scenarios='changed-contract corrected-consumer unchanged-boundary'
      delivery_evidence_pass_basis='observable consumer applicability'
      ;;
    gaps)
      delivery_evidence_scenarios='repair-and-proceed unavailable-proof sufficient-reused'
      delivery_evidence_pass_basis='observable required-gap handling'
      ;;
    *) return 2 ;;
  esac
}

# Reads KEY from a case observations file of "key: value" lines.
delivery_evidence_obs_get() {
  local key=$1
  local file=$2
  awk -v k="${key}" -F': ' '$1 == k {print substr($0, index($0, ": ") + 2); exit}' \
    "${file}"
}

delivery_evidence_git() {
  local cwd=$1
  shift
  git -C "${cwd}" -c user.name='Delivery Evidence Fixture' \
    -c user.email='delivery-evidence@example.invalid' "$@"
}

# Case-specific workspace content comes from
# delivery_evidence_CASE_populate_fixture WORKSPACE SCENARIO.
delivery_evidence_create_fixture() {
  local case_name=$1
  local source_dir=$2
  local host=$3
  local scenario=$4
  local parent=$5
  local root workspace
  root=$(mktemp -d "${parent}/de${case_name}.XXXXXX")
  workspace="${root}/workspace"
  mkdir -p -- "${workspace}"
  delivery_evidence_root=${root}
  delivery_evidence_workspace=${workspace}
  delivery_evidence_scenario=${scenario}

  git init -b main "${workspace}" > /dev/null
  "delivery_evidence_${case_name}_populate_fixture" "${workspace}" "${scenario}"
  bash "${source_dir}/install.sh" --target "${workspace}" \
    --source "${source_dir}" --platform "${host}" > /dev/null
}

delivery_evidence_cleanup() {
  if [[ -n ${delivery_evidence_root:-} && -z ${GIT_PUBLICATION_KEEP:-} ]]; then
    rm -rf -- "${delivery_evidence_root}"
  fi
}

delivery_evidence_write_evidence_identity() {
  local case_name=$1
  local case_prefix="tests/support/delivery-evidence-${case_name}-native"
  printf 'helper-identity: tests/support/delivery-evidence-native-run.sh\n'
  native_result_print_adapter_identity
  printf 'fixture-identity: tests/support/delivery-evidence-native-run.sh\n'
  printf 'scenario-content-identity: %s-scenario-content.sh\n' "${case_prefix}"
  printf 'observe-identity: %s-observe.sh\n' "${case_prefix}"
  printf 'assessor-identity: %s-assess.sh\n' "${case_prefix}"
  native_result_input_hash_line tests/git-publication-native.sh
  native_result_input_hash_line tests/support/git-publication-native-host.sh
  native_result_input_hash_line tests/support/delivery-evidence-native-run.sh
  native_result_input_hash_line "${case_prefix}-assess.sh"
  native_result_input_hash_line "${case_prefix}-observe.sh"
  native_result_input_hash_line "${case_prefix}-scenario-content.sh"
  native_result_input_hash_line tests/support/git-publication-native-run.sh
  native_result_input_hash_line tests/support/native-run-supervise.sh
  native_result_input_hash_line tests/support/native-run-watchdog.sh
  native_result_input_hash_line \
    src/skills/dough-execute-plan/references/wrap-up.md
  native_result_input_hash_line \
    src/skills/dough-execute-plan/references/delegation.md
  if [[ ${case_name} == selection ]]; then
    native_result_input_hash_line "${case_prefix}-repository-content.sh"
    native_result_input_hash_line "${case_prefix}-proof-logger.sh"
  fi
  if [[ ${case_name} == consumers ]]; then
    native_result_input_hash_line \
      src/skills/dough-story-refinement/references/executable-proof.md
  fi
}

delivery_evidence_prompt_for() {
  printf '%s\n' \
    "Use this project's installed Open Dough guidance. An implementation agent returned uncommitted work and the proof report at .planning/implementation-return.md for the promises in .planning/slice-promises.md. Apply the existing acceptance workflow to that return. Do not commit. Leave a short acceptance outcome in .planning/acceptance-outcome.md naming each promise as accepted or incomplete with the evidence you inspected. Treat the installed guidance and project files as the task inputs; do not inspect parent processes or external test-harness source."
}

delivery_evidence_observe_scenario() {
  local case_name=$1 scenario=$2
  case ${case_name} in
    selection)
      delivery_evidence_selection_observe \
        "${scenario}" \
        "${delivery_evidence_selection_claimed}" \
        "${delivery_evidence_selection_initial}" \
        "${delivery_evidence_workspace}" \
        "${output_file}" \
        "${transcript}"
      ;;
    *)
      "delivery_evidence_${case_name}_observe" \
        "${scenario}" \
        "${delivery_evidence_workspace}" \
        "${output_file}" \
        "${transcript}"
      ;;
  esac
}

delivery_evidence_run_scenario() {
  local case_name=$1 source_dir=$2 host=$3 scenario=$4 results_dir=$5 parent=$6
  local prompt run_status=0 observations_file
  delivery_evidence_create_fixture \
    "${case_name}" "${source_dir}" "${host}" "${scenario}" "${parent}"
  prompt=$(
    set -e
    delivery_evidence_prompt_for
  )
  native_case_host=${host}
  native_case_id="delivery-evidence/${case_name}"
  native_case_results_dir=${results_dir}
  temporary_dir=${delivery_evidence_root}
  candidate=${source_dir}
  transcript="${delivery_evidence_root}/events-${scenario}.jsonl"
  output_file="${delivery_evidence_root}/response-${scenario}.md"
  native_stderr="${delivery_evidence_root}/stderr-${scenario}.log"
  target=${delivery_evidence_workspace}
  native_run_workspace=${delivery_evidence_workspace}
  platform=${host}
  : > "${transcript}"
  : > "${native_stderr}"

  git_publication_run_native_command || run_status=$?

  observations_file="${delivery_evidence_root}/observations-${scenario}.txt"
  delivery_evidence_observe_scenario "${case_name}" "${scenario}" \
    > "${observations_file}"

  # shellcheck disable=SC2310,SC2311
  if [[ ${native_run_stream_status:-missing} != complete ]]; then
    git_publication_assess_status=fail
    git_publication_assess_reason="incomplete or stale native stream (${native_run_stream_status:-missing})"
  elif [[ $(delivery_evidence_obs_get harness-inspected \
    "${observations_file}") == true ]]; then
    git_publication_assess_status=fail
    git_publication_assess_reason='agent inspected the native harness'
  elif "delivery_evidence_${case_name}_assess" "${observations_file}"; then
    git_publication_assess_status=pass
    git_publication_assess_reason="${case_name} acceptance honored for ${scenario}"
  else
    git_publication_assess_status=fail
    git_publication_assess_reason="${case_name} acceptance mismatch for ${scenario}"
  fi
  if [[ ${run_status} -ne 0 && ${git_publication_assess_status} == pass ]]; then
    git_publication_assess_status=fail
    git_publication_assess_reason="native host exited ${run_status} before completing ${scenario}"
  fi

  if [[ -n ${native_case_results_dir:-} ]]; then
    native_case_id="delivery-evidence/${case_name}/${scenario}"
    git_publication_retain_attempt "${source_dir}" "${prompt}" \
      "${transcript}" "${output_file}" "${native_stderr}" \
      "${observations_file}" "delivery-evidence-${case_name}"
    # Keep the agent-written outcome (and selection log) that observations
    # were derived from, so a verdict stays diagnosable after cleanup.
    native_result_copy_if_present \
      "${delivery_evidence_workspace}/.planning/acceptance-outcome.md" \
      acceptance-outcome.md
    native_result_copy_if_present \
      "${delivery_evidence_workspace}/.planning/selection.log" selection.log
  fi

  printf 'scenario: %s assessment-status: %s assessment-reason: %s\n' \
    "${scenario}" "${git_publication_assess_status}" \
    "${git_publication_assess_reason}"
  cat "${observations_file}"
  delivery_evidence_cleanup
  [[ ${git_publication_assess_status} == pass ]]
}

delivery_evidence_run_journey() {
  local case_name=$1 source_dir=$2 host=$3 results_dir=$4
  local root outstanding=0 scenario
  delivery_evidence_case_profile "${case_name}"
  root=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${root}'" RETURN
  for scenario in ${delivery_evidence_scenarios}; do
    printf '\n--- delivery-evidence/%s %s ---\n' "${case_name}" "${scenario}"
    set +e
    delivery_evidence_run_scenario "${case_name}" \
      "${source_dir}" "${host}" "${scenario}" "${results_dir}" "${root}"
    status=$?
    set -e
    if [[ ${status} -ne 0 ]]; then
      outstanding=1
    fi
  done
  if [[ ${outstanding} -ne 0 ]]; then
    echo "PENDING: delivery-evidence/${case_name} lacks passing fresh proof on one or more scenarios."
    return 1
  fi
  echo "PASS: delivery-evidence/${case_name} assessed from ${delivery_evidence_pass_basis}."
}
