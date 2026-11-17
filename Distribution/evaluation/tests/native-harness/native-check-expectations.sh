#!/usr/bin/env bash
# Passing words stay quiet; failures stop a check and show its actual evidence.
# shellcheck disable=SC2312,SC2016 # Failing children are captured; child shells expand their arguments.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
expectations="${source_dir}/Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh"
# shellcheck source=Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh
# shellcheck disable=SC1091
source "${expectations}"
work_dir=
native_check_status=0
native_check_workspace work_dir

# Workspace cleanup survives both successful and failed child checks, including
# read-only contents, and preserves the child's original exit status.
for child_status in 0 7; do
  status=0
  bash -c 'set -euo pipefail; source "$1"; native_check_workspace scratch; printf "%s\n" "$scratch"; touch "$scratch/readonly"; chmod a-w "$scratch/readonly"; exit "$2"' \
    bash "${expectations}" "${child_status}" > "${work_dir}/scratch-path" || status=$?
  [[ ${status} == "${child_status}" ]]
  scratch=$(cat "${work_dir}/scratch-path")
  [[ ! -e ${scratch} ]]
done

# A real entry resolves the substitute host first and preserves both streams
# and a nonzero host status without stopping the surrounding check.
mkdir "${work_dir}/bin"
cat > "${work_dir}/bin/native-check-host" << 'HOST'
#!/usr/bin/env bash
printf '%s\n' 'substitute stdout'
printf '%s\n' 'substitute stderr' >&2
exit "${1}"
HOST
chmod +x "${work_dir}/bin/native-check-host"
for child_status in 0 9; do
  (
    native_check_run "${work_dir}/bin" "${work_dir}/stdout" "${work_dir}/stderr" bash -c 'native-check-host "$1"' bash "${child_status}"
    [[ ${native_check_status} == "${child_status}" ]]
    [[ $(cat "${work_dir}/stdout") == 'substitute stdout' ]]
    [[ $(cat "${work_dir}/stderr") == 'substitute stderr' ]]
  )
done

# These exact record bytes are the invalid input and evidence under proof.
printf '%s\n' 'execution-status: completed' 'payload: retained evidence' > "${work_dir}/record"
touch "${work_dir}/present"
(
  native_check_expect_status 'entry status' 0 0 "${work_dir}/stdout"
  native_check_expect_field 'execution outcome' "${work_dir}/record" execution-status completed
  native_check_expect_line 'retained payload' "${work_dir}/record" 'payload: retained evidence'
  native_check_expect_absent 'scratch gone' "${work_dir}/absent"
) > "${work_dir}/passing" 2>&1
[[ ! -s ${work_dir}/passing ]]

# Each failing expectation runs as a check with errexit, independently of the
# vocabulary being checked. The trailing line must never be reached.
assert_failure() {
  local fact=$1 expected=$2 actual=$3 evidence=$4 status=0
  shift 4
  bash -c 'set -euo pipefail; source "$1"; shift; "$@"; echo continued-after-failure' \
    bash "${expectations}" "$@" > "${work_dir}/failure-stdout" 2> "${work_dir}/failure-stderr" || status=$?
  [[ ${status} -ne 0 ]]
  [[ ! -s ${work_dir}/failure-stdout ]]
  grep -Fq "expectation failed: ${fact}" "${work_dir}/failure-stderr"
  grep -Fq "expected: ${expected}" "${work_dir}/failure-stderr"
  grep -Fq "actual: ${actual}" "${work_dir}/failure-stderr"
  grep -Fq "${evidence}" "${work_dir}/failure-stderr"
}

assert_failure 'entry status' 0 9 'substitute stderr' \
  native_check_expect_status 'entry status' 0 9 "${work_dir}/stderr"
assert_failure 'execution outcome (execution-status)' timeout completed 'payload: retained evidence' \
  native_check_expect_field 'execution outcome' "${work_dir}/record" execution-status timeout
grep -Fq 'execution-status: completed' "${work_dir}/failure-stderr"
assert_failure 'retained payload' 'payload: missing' '<line absent>' 'payload: retained evidence' \
  native_check_expect_line 'retained payload' "${work_dir}/record" 'payload: missing'
assert_failure 'scratch gone' '<absent>' '<present>' "${work_dir}/present" \
  native_check_expect_absent 'scratch gone' "${work_dir}/present"
