#!/usr/bin/env bash
# Credential-free dispatch proof; the native process is the external boundary.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2312
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/support/git-publication-native-run.sh"
source "${source_dir}/tests/support/delivery-evidence-native-run.sh"
source "${source_dir}/tests/support/git-publication-native-host.sh"
root=$(mktemp -d)
trap 'rm -rf -- "${root}"' EXIT
native_case_host=codex
delivery_evidence_scenarios='active scenarios'
delivery_evidence_pass_basis='active basis'
for case_name in selection claims consumers gaps aggregate nostore deferred original terminal release drift amended; do
  native_case_known "delivery-evidence/${case_name}"
done
[[ ${delivery_evidence_scenarios} == 'active scenarios' ]]
[[ ${delivery_evidence_pass_basis} == 'active basis' ]]
delivery_evidence_case_has_scenario drift narrowed
delivery_evidence_case_has_scenario drift amended-corrected
status=0
bash "${source_dir}/tests/git-publication-native.sh" \
  --native codex --case delivery-evidence/missing > "${root}/unknown.txt" 2>&1 || status=$?
[[ ${status} -eq 2 ]]
grep -q "unknown native case 'delivery-evidence/missing'" "${root}/unknown.txt"

# Retention follows the family's artifact shape; ordinary review families keep
# the default lib/tests/e2e copy and original acceptance adds its planning state.
for case_name in original terminal release drift aggregate; do
  scenario=narrowed
  [[ ${case_name} != aggregate ]] || scenario=heading-reorder
  source_acceptance=false
  if declare -F "delivery_evidence_${case_name}_product_observation" > /dev/null; then
    source_acceptance=true
  fi
  delivery_evidence_create_fixture "${case_name}" "${source_dir}" claude \
    "${scenario}" "${root}" > "${root}/fixture.txt" 2>&1
  native_result_attempt_dir="${root}/artifacts-${case_name}"
  mkdir -p -- "${native_result_attempt_dir}"
  printf 'retained command sentinel\n' > "${delivery_evidence_root}/command-results.jsonl"
  printf 'acceptance sentinel\n' > "${delivery_evidence_workspace}/.planning/acceptance-outcome.md"
  if ${source_acceptance}; then
    "delivery_evidence_${case_name}_product_observation" "${delivery_evidence_workspace}" \
      > "${delivery_evidence_root}/product-observation.json"
    cp "${delivery_evidence_workspace}/.planning/producer-proof.md" "${delivery_evidence_root}/final-proof.txt"
  fi
  delivery_evidence_retain_review_artifacts "${case_name}"
  cmp "${delivery_evidence_root}/command-results.jsonl" \
    "${native_result_attempt_dir}/command-results.jsonl"
  case ${case_name} in
    terminal) product_dirs='research' ;;
    release) product_dirs='deployment records tests' ;;
    drift) product_dirs='entry tests' ;;
    *) product_dirs='lib tests' ;;
  esac
  for product_dir in ${product_dirs}; do
    diff -r "${delivery_evidence_workspace}/${product_dir}" \
      "${native_result_attempt_dir}/final-product/${product_dir}"
  done
  if ${source_acceptance}; then
    cmp "${delivery_evidence_root}/product-observation.json" "${native_result_attempt_dir}/product-observation.json"
    cmp "${delivery_evidence_root}/final-proof.txt" "${native_result_attempt_dir}/final-proof.txt"
    diff -r "${delivery_evidence_root}/original-inputs" "${native_result_attempt_dir}/original-inputs"
    diff -r "${delivery_evidence_workspace}/.planning" "${native_result_attempt_dir}/final-product/.planning"
  else
    diff -r "${delivery_evidence_workspace}/e2e" "${native_result_attempt_dir}/final-product/e2e"
  fi
done

# The amended family retains its fixture facts, final freshness and planning.
delivery_evidence_create_fixture amended "${source_dir}" claude story-amended \
  "${root}" > "${root}/fixture.txt" 2>&1
native_result_attempt_dir="${root}/artifacts-amended"
mkdir -p -- "${native_result_attempt_dir}"
printf 'final freshness sentinel\n' > "${delivery_evidence_root}/final-freshness.json"
delivery_evidence_amended_retain
for file in amended-fixture.txt final-freshness.json; do
  cmp "${delivery_evidence_root}/${file}" "${native_result_attempt_dir}/${file}"
done
diff -r "${delivery_evidence_workspace}/.planning" "${native_result_attempt_dir}/final-product/.planning"

# Replace the paid journey, preserving the public host dispatch around it.
mkdir -p -- "${root}/host-tmp"
export TMPDIR="${root}/host-tmp"
codex() { :; }
delivery_evidence_run_journey() {
  printf '%s\n' "$1" > "${root}/dispatched"
}
for case_name in gaps original terminal release drift amended; do
  run_native_host codex "delivery-evidence/${case_name}" "${root}/retained" \
    > "${root}/host.txt"
  [[ $(cat "${root}/dispatched") == "${case_name}" ]]
  delivery_evidence_write_evidence_identity "${case_name}" > "${root}/direct"
  git_publication_write_evidence_identity "delivery-evidence-${case_name}" > "${root}/wrapped"
  cmp "${root}/direct" "${root}/wrapped"
done
status=0
git_publication_write_evidence_identity delivery-evidence-missing \
  > "${root}/unknown-identity" || status=$?
[[ ${status} -eq 2 && ! -s ${root}/unknown-identity ]]
status=0
GIT_PUBLICATION_NATIVE_JOURNEYS=delivery-evidence/missing run_native_host codex \
  > "${root}/unknown-host.txt" || status=$?
[[ ${status} -eq 2 ]]
