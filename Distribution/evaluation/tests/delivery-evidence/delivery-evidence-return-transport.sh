#!/usr/bin/env bash
# Observe returned inputs at the public family's substitute-host boundary.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
source "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh"
# Import the owner's scenarios instead of maintaining a second registry.
source "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-cases.sh"
root=
native_check_workspace root
mkdir -p -- "${root}/bin"
support="${source_dir}/Distribution/evaluation/tests/delivery-evidence/support"
cp -- "${support}/native-agent-return-inputs.sh" "${root}/bin/claude"
chmod a+x "${root}/bin/claude"
entry="${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native.sh"

observe_return() {
  local case_name=$1 scenario=$2 legacy_revision=${3:-}
  local result="${root}/${case_name}-${scenario}-${legacy_revision:-current}" attempt
  native_check_run "${root}/bin" "${result}.stdout" "${result}.stderr" \
    env RETURN_TRANSPORT_SOURCE="${source_dir}" RETURN_TRANSPORT_CASE="${case_name}" \
    RETURN_TRANSPORT_SCENARIO="${scenario}" RETURN_TRANSPORT_RESULT="${result}.observed" \
    RETURN_TRANSPORT_LEGACY="${legacy_revision}" \
    delivery_evidence_only_scenario="${scenario}" delivery_evidence_payload_revision="${legacy_revision}" \
    bash "${entry}" --native claude --case "delivery-evidence/${case_name}" \
    --results-dir "${result}.results"
  native_check_expect_value "${case_name}/${scenario}: inputs observed before host completion" observed "$(cat "${result}.observed" 2> /dev/null || true)" "${result}.observed.diagnostic" "${result}.stdout" "${result}.stderr"
  # The substitute only observes inputs; it supplies no acceptance outcome.
  native_check_expect_status "${case_name}/${scenario}: native acceptance remains unclaimed" 1 "${native_check_status}" "${result}.stdout" "${result}.stderr"
  attempt=$(sed -n 's/^result-path: //p' "${result}.stdout")
  native_check_expect_field "${case_name}/${scenario}: substitute stream completed" "${attempt}/record" execution-status completed
  native_check_expect_line "${case_name}/${scenario}: completion remains neutral" "${attempt}/response.md" 'acceptance was not performed.'
}

for case_name in selection claims consumers gaps original terminal release drift deferred; do
  delivery_evidence_case_profile "${case_name}"
  for scenario in ${delivery_evidence_scenarios}; do
    observe_return "${case_name}" "${scenario}"
  done
done

# Real older payloads keep narrative returns and no Git evidence.
legacy_revision=51363529cfb748e2265241315e62d7f6d4ff901c
observe_return claims unsupported-claim "${legacy_revision}"
observe_return deferred known-caller "${legacy_revision}"
