#!/usr/bin/env bash
# Credential-free proof of shared update-then-use journey-state assessment.
# Crafted observations once. Does not launch Codex, Cursor, or Claude Code.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced helper globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/native-journey-state.sh
source "${source_dir}/tests/support/native-journey-state.sh"
# shellcheck source=tests/support/native-assessor-counterexample.sh
source "${source_dir}/tests/support/native-assessor-counterexample.sh"

work_dir=$(mktemp -d)
finish() {
  rm -rf -- "${work_dir}"
}
trap finish EXIT

write_obs() {
  local dest=$1
  cat > "${dest}" << 'EOF'
update-execution: completed
use-execution: completed
same-target: true
target-skill-root: .agents/skills
source-preserved: true
companion-preserved: true
real-transition: true
update-version-before: 0.2.1
update-version-after: 0.2.2
improvement-after-update: true
other-tool-root-cursor: present
other-tool-root-claude: present
other-tool-root-cursor-preserved: true
other-tool-root-claude-preserved: true
EOF
}

write_conflict() {
  printf '%s\n' \
    'Stopped: architecture/decisions/CATALOG.md reports Replaced for ARC-12, while architecture/decisions/retain-complete-telemetry-history.md is Adopted. This conflict is unresolved. Cannot proceed until a human who owns precedence resolves the disagreement. No decision or implementation was changed.' \
    > "$1"
}

assert_status() {
  local file=$1
  local expected=$2
  local reason_snippet=$3
  local response=${4-}

  if [[ -n ${response} ]]; then
    native_journey_state_assess "${work_dir}/${file}" "${work_dir}/${response}"
  else
    native_journey_state_assess "${work_dir}/${file}"
  fi
  if [[ ${native_journey_state_status} != "${expected}" ]]; then
    echo "FAIL: ${file} expected ${expected}, got ${native_journey_state_status}." >&2
    printf 'reason: %s\n' "${native_journey_state_reason}" >&2
    cat "${work_dir}/${file}" >&2
    return 1
  fi
  grep -Fq "${reason_snippet}" <<< "${native_journey_state_reason}"
}

# Assesses observations $1 with the valid conflict response.
assess_with_conflict() {
  native_journey_state_assess "$1" "${work_dir}/valid-conflict.md"
}

write_obs "${work_dir}/expected.txt"
write_conflict "${work_dir}/valid-conflict.md"
assert_status expected.txt pass 'expected real fixture update state'
assert_status expected.txt pass 'named conflicting authorities and stopped' \
  valid-conflict.md

write_obs "${work_dir}/cursor-target.txt"
assert_status cursor-target.txt pass 'expected real fixture update state'

assessor="${source_dir}/tests/support/native-journey-state.sh"
native_assessor_counterexamples "${assessor}" "${work_dir}/expected.txt" \
  --verdict native_journey_state_status native_journey_state_reason \
  -- native_journey_state_assess
native_assessor_rejects_edit wrong-version installed-version \
  's/update-version-after: 0.2.2/update-version-after: 0.2.9/;s/real-transition: true/real-transition: false/' \
  fail 'wrong installed bytes or version'
native_assessor_rejects_edit missing-improvement skill-improvement \
  's/improvement-after-update: true/improvement-after-update: false/;s/real-transition: true/real-transition: false/' \
  fail 'wrong installed bytes or version'
native_assessor_rejects_edit protected-writes companion-preservation \
  's/companion-preserved: true/companion-preserved: false/' \
  fail 'protected writes'
native_assessor_rejects_edit stale-target target \
  's/same-target: true/same-target: false/' fail 'stale-target use'

# A valid conflict response does not rescue a failed update.
native_assessor_counterexamples "${assessor}" "${work_dir}/expected.txt" \
  --verdict native_journey_state_status native_journey_state_reason \
  -- assess_with_conflict
native_assessor_rejects_edit failed-update update-outcome \
  's/update-execution: completed/update-execution: failed/;s/real-transition: true/real-transition: false/' \
  fail 'failed update cannot pass as a successful journey'
