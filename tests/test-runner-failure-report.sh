#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
checks="${temporary_dir}/checks"
mkdir -p -- "${checks}/support"

write_check() {
  printf '#!/usr/bin/env bash\nset -euo pipefail\n%s\n' "$2" > "${checks}/$1"
}

run_suite() {
  OPEN_DOUGH_TEST_DIR="${checks}" "${BASH}" "${source_dir}/scripts/test.sh" \
    > "${temporary_dir}/$1.out" 2> "${temporary_dir}/$1.err"
}

write_check first.sh 'echo first-passed'
write_check second.sh 'echo second-passed >&2'
write_check support/helper.sh 'echo helper-ran; exit 1'

run_suite passing
if [[ -s ${temporary_dir}/passing.out || -s ${temporary_dir}/passing.err ]]; then
  echo 'FAIL: the runner printed output for passing checks.' >&2
  cat -- "${temporary_dir}/passing.out" "${temporary_dir}/passing.err" >&2
  exit 1
fi

write_check failing.sh 'echo failing-started; [[ a == b ]]; echo failing-continued'
failing_status=0
OPEN_DOUGH_TEST_DIR="${checks}" "${BASH}" "${source_dir}/scripts/test.sh" \
  > "${temporary_dir}/failing.out" 2> "${temporary_dir}/failing.err" || failing_status=$?
if ((failing_status != 1)); then
  printf 'FAIL: the runner exited %s for a failing check, not 1.\n' "${failing_status}" >&2
  exit 1
fi
cat -- "${temporary_dir}/failing.out" "${temporary_dir}/failing.err" > "${temporary_dir}/failing.log"
grep -F -- "FAIL: ${checks}/failing.sh" "${temporary_dir}/failing.log" > /dev/null
grep -F -- 'failing-started' "${temporary_dir}/failing.log" > /dev/null
if grep -E -- 'Running |first-passed|second-passed|helper-ran|failing-continued|FAIL: .*(first|second|helper)' \
  "${temporary_dir}/failing.log"; then
  echo 'FAIL: the runner reported more than the failing check and its output.' >&2
  exit 1
fi
echo 'PASS: the runner prints nothing for passing checks and reports only a failing check with its output.'
