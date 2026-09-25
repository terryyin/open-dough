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
  suite_status=0
  OPEN_DOUGH_TEST_DIR="${checks}" "${BASH}" "${source_dir}/scripts/test.sh" \
    > "${temporary_dir}/$1.log" 2>&1 || suite_status=$?
}

write_check first.sh '[[ a == a ]]'
write_check second.sh 'true'
write_check support/helper.sh 'echo helper-ran; exit 1'

run_suite passing
if ((suite_status != 0)) || [[ -s ${temporary_dir}/passing.log ]]; then
  printf 'FAIL: the runner exited %s or printed output for passing checks.\n' "${suite_status}" >&2
  cat -- "${temporary_dir}/passing.log" >&2
  exit 1
fi

write_check failing.sh 'echo failing-started; [[ a == b ]]; echo failing-continued'
run_suite failing
if ((suite_status != 1)); then
  printf 'FAIL: the runner exited %s for a failing check, not 1.\n' "${suite_status}" >&2
  exit 1
fi
grep -q -F -- "FAIL: ${checks}/failing.sh" "${temporary_dir}/failing.log"
grep -q -F -- 'failing-started' "${temporary_dir}/failing.log"
if grep -E -- 'Running |helper-ran|failing-continued|FAIL: .*(first|second|helper)' \
  "${temporary_dir}/failing.log"; then
  echo 'FAIL: the runner reported more than the failing check and its output.' >&2
  exit 1
fi
rm -- "${checks}/failing.sh"

# A check that passes but prints, on either stream, fails the run and is shown.
write_check noisy-stderr.sh 'echo stderr-warning >&2'
write_check noisy-stdout.sh 'echo stdout-chatter'
run_suite noisy
if ((suite_status != 1)); then
  printf 'FAIL: the runner exited %s for passing checks that printed, not 1.\n' "${suite_status}" >&2
  exit 1
fi
for noisy in noisy-stderr:stderr-warning noisy-stdout:stdout-chatter; do
  grep -q -F -- "FAIL: ${checks}/${noisy%%:*}.sh (passed but printed output)" \
    "${temporary_dir}/noisy.log"
  grep -q -F -x -- "${noisy#*:}" "${temporary_dir}/noisy.log"
done
if grep -E -- 'FAIL: .*(first|second|helper)|helper-ran' "${temporary_dir}/noisy.log"; then
  echo 'FAIL: the runner reported a silent passing check or a support file.' >&2
  exit 1
fi

# The shared `node --test` reporter prints only failing tests, with their output.
node --test --test-reporter="${source_dir}/tests/support/node-test-failures-reporter.mjs" \
  "${source_dir}/tests/support/node-test-failures-reporter.test.mjs"
