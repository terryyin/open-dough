#!/usr/bin/env bash
# Shared native journey for the delivery-evidence cases registered in
# delivery-evidence-native-cases.sh: disposable fixture scaffolding, prompt,
# native command, assessment, retention, and evidence identity.
# Promise-status recognition lives in delivery-evidence-promise-status.sh. Each
# case keeps its own scenario content, observations, and assessor in
# delivery-evidence-CASE-native-{scenario-content,observe,assess}.sh, and may
# add delivery-evidence-CASE-native-checks.sh.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
for delivery_evidence_part in native-cases promise-status native-evidence native-prompt native-payload; do
  # shellcheck disable=SC1090,SC1091
  source "${delivery_evidence_support_dir}/delivery-evidence-${delivery_evidence_part}.sh"
done
# shellcheck disable=SC1091
source "${delivery_evidence_support_dir}/native-observation.sh"
for delivery_evidence_case in ${delivery_evidence_cases}; do
  for delivery_evidence_part in scenario-content observe assess checks; do
    delivery_evidence_file="${delivery_evidence_support_dir}/delivery-evidence-${delivery_evidence_case}-native-${delivery_evidence_part}.sh"
    [[ ${delivery_evidence_part} != checks || -f ${delivery_evidence_file} ]] || continue
    # shellcheck disable=SC1090
    source "${delivery_evidence_file}"
  done
done
unset delivery_evidence_case delivery_evidence_part delivery_evidence_file

delivery_evidence_root=
delivery_evidence_workspace=
delivery_evidence_scenario=
# A case assessor may name why it did not pass; the runner's reason carries it.
delivery_evidence_assess_detail=

# Reads KEY from a case observations file of "key: value" lines: the text
# after "KEY: " on the first line that starts with it. Parsed in the shell:
# assessors read many fields per case.
delivery_evidence_obs_get() {
  local key=$1
  local file=$2
  local line
  while IFS= read -r line || [[ -n ${line} ]]; do
    if [[ ${line} == "${key}: "* ]]; then
      printf '%s\n' "${line#"${key}: "}"
      return 0
    fi
  done < "${file}"
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
  # A neutral name: the agent sees this path, which must not name the case.
  root=$(mktemp -d "${parent}/de.XXXXXX")
  workspace="${root}/workspace"
  mkdir -p -- "${workspace}"
  delivery_evidence_root=${root}
  delivery_evidence_workspace=${workspace}

  git init -b main "${workspace}" > /dev/null
  "delivery_evidence_${case_name}_populate_fixture" "${workspace}" "${scenario}"
  delivery_evidence_install_payload "${source_dir}" "${workspace}" "${host}"
}

delivery_evidence_cleanup() {
  if [[ -n ${delivery_evidence_root:-} && -z ${GIT_PUBLICATION_KEEP:-} ]]; then
    rm -rf -- "${delivery_evidence_root}"
  fi
}

delivery_evidence_observe_scenario() {
  local case_name=$1 scenario=$2
  case ${case_name} in
    selection)
      delivery_evidence_selection_observe "${scenario}" \
        "${delivery_evidence_selection_claimed}" \
        "${delivery_evidence_selection_initial}" \
        "${delivery_evidence_workspace}" "${output_file}" "${transcript}"
      ;;
    *)
      "delivery_evidence_${case_name}_observe" "${scenario}" \
        "${delivery_evidence_workspace}" "${output_file}" "${transcript}"
      ;;
  esac
}

delivery_evidence_run_scenario() {
  local case_name=$1 source_dir=$2 host=$3 scenario=$4 results_dir=$5 parent=$6
  local prompt run_status=0 observations_file
  delivery_evidence_create_fixture \
    "${case_name}" "${source_dir}" "${host}" "${scenario}" "${parent}"
  if delivery_evidence_requires_review "${case_name}"; then
    delivery_evidence_capture_installed_inputs "${host}" "${case_name}"
  fi
  prompt=$(
    set -e
    delivery_evidence_prompt_for "${case_name}" "${scenario}"
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

  delivery_evidence_assess_detail=
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
  if [[ -n ${delivery_evidence_assess_detail} ]]; then
    git_publication_assess_reason+=": ${delivery_evidence_assess_detail}"
  fi
  # shellcheck disable=SC2310,SC2311
  if delivery_evidence_requires_review "${case_name}" \
    && [[ ${native_run_stream_status:-missing} == complete && ${run_status} -eq 0 &&
      $(delivery_evidence_obs_get harness-inspected "${observations_file}") == false ]]; then
    git_publication_assess_reason="${case_name} observations retained; explicit review required"
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
    if delivery_evidence_requires_review "${case_name}"; then
      delivery_evidence_retain_review_artifacts "${case_name}"
    fi
    # Keep the agent-written outcome (and selection log) that observations
    # were derived from, so a verdict stays diagnosable after cleanup.
    native_result_copy_if_present \
      "${delivery_evidence_workspace}/.planning/acceptance-outcome.md" \
      acceptance-outcome.md
    native_result_copy_if_present \
      "${delivery_evidence_workspace}/.planning/selection.log" selection.log
    if declare -F "delivery_evidence_${case_name}_retain" > /dev/null; then
      "delivery_evidence_${case_name}_retain" "${prompt}"
    fi
  fi

  printf 'scenario: %s assessment-status: %s assessment-reason: %s\n' \
    "${scenario}" "${git_publication_assess_status}" \
    "${git_publication_assess_reason}"
  cat "${observations_file}"
  delivery_evidence_cleanup
  [[ ${git_publication_assess_status} == pass ]]
}

# delivery_evidence_only_scenario, when set, runs only that scenario of the case;
# delivery_evidence_payload_revision, when set, installs that revision's payload.
delivery_evidence_run_journey() {
  local case_name=$1 source_dir=$2 host=$3 results_dir=$4
  local root outstanding=0 scenario
  delivery_evidence_case_profile "${case_name}"
  if [[ -n ${delivery_evidence_only_scenario:-} ]]; then
    if ! delivery_evidence_case_has_scenario "${case_name}" \
      "${delivery_evidence_only_scenario}"; then
      printf 'error: delivery-evidence/%s has no scenario %s\n' \
        "${case_name}" "${delivery_evidence_only_scenario}" >&2
      return 2
    fi
    delivery_evidence_scenarios=${delivery_evidence_only_scenario}
  fi
  # shellcheck disable=SC2310
  if ! delivery_evidence_installed_payload "${source_dir}" > /dev/null; then
    printf 'error: delivery_evidence_payload_revision %s is not a commit of %s\n' \
      "${delivery_evidence_payload_revision}" "${source_dir}" >&2
    return 2
  fi
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
