#!/usr/bin/env bash
# Credential-free proof of shared update-then-use journey-state assessment.
# Crafted observations once. Does not launch Codex, Cursor, or Claude Code.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced helper globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/native-journey-state.sh
source "${source_dir}/tests/support/native-journey-state.sh"

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

assert_not_pass() {
  local file=$1
  local reason_snippet=$2
  local response=${3-}

  if [[ -n ${response} ]]; then
    native_journey_state_assess "${work_dir}/${file}" "${work_dir}/${response}"
  else
    native_journey_state_assess "${work_dir}/${file}"
  fi
  if [[ ${native_journey_state_status} == 'pass' ]]; then
    echo "FAIL: ${file} passed on a journey-state counterexample." >&2
    printf 'reason: %s\n' "${native_journey_state_reason}" >&2
    cat "${work_dir}/${file}" >&2
    return 1
  fi
  grep -Fq "${reason_snippet}" <<< "${native_journey_state_reason}"
}

write_obs "${work_dir}/expected.txt"
write_conflict "${work_dir}/valid-conflict.md"
assert_status expected.txt pass 'expected real fixture update state'
assert_status expected.txt pass 'named conflicting authorities and stopped' \
  valid-conflict.md

write_obs "${work_dir}/cursor-target.txt"
sed -i '' \
  -e 's|target-skill-root: \.agents/skills|target-skill-root: .cursor/skills|' \
  -e 's/other-tool-root-cursor-preserved: true/other-tool-root-cursor-preserved: false/' \
  "${work_dir}/cursor-target.txt"
assert_status cursor-target.txt pass 'expected real fixture update state'

write_obs "${work_dir}/wrong-version.txt"
sed -i '' \
  -e 's/update-version-after: 0.2.2/update-version-after: 0.2.9/' \
  -e 's/improvement-after-update: true/improvement-after-update: false/' \
  -e 's/real-transition: true/real-transition: false/' \
  "${work_dir}/wrong-version.txt"
assert_not_pass wrong-version.txt 'wrong installed bytes or version'

write_obs "${work_dir}/protected-writes.txt"
sed -i '' 's/companion-preserved: true/companion-preserved: false/' \
  "${work_dir}/protected-writes.txt"
assert_not_pass protected-writes.txt 'protected writes'

write_obs "${work_dir}/stale-target.txt"
sed -i '' 's/same-target: true/same-target: false/' \
  "${work_dir}/stale-target.txt"
assert_not_pass stale-target.txt 'stale-target use'

write_obs "${work_dir}/failed-update.txt"
sed -i '' \
  -e 's/update-execution: completed/update-execution: failed/' \
  -e 's/real-transition: true/real-transition: false/' \
  "${work_dir}/failed-update.txt"
assert_not_pass failed-update.txt \
  'failed update cannot pass as a successful journey' valid-conflict.md

echo 'PASS: shared journey-state assessment accepts the expected real fixture update and a catalog/ARC-12 conflict stop; wrong bytes/version, protected writes, stale-target use, and a failed update with a success claim cannot pass.'
