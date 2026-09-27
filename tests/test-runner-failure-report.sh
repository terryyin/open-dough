#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
checks="${temporary_dir}/checks"
mkdir -p -- "${checks}/support"

# Writes a substitute check, named second, into the directory named first.
write_check_in() {
  printf '#!/usr/bin/env bash\nset -euo pipefail\n%s\n' "$3" > "$1/$2"
}
write_check() {
  write_check_in "${checks}" "$@"
}

# Runs the runner over the checks, or over the directory given second, logging
# to <name>.log; runner settings such as OPEN_DOUGH_TEST_JOBS pass through.
run_suite() {
  suite_status=0
  OPEN_DOUGH_TEST_DIR="${2:-${checks}}" "${BASH}" "${source_dir}/scripts/test.sh" \
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
expect_in_log "${temporary_dir}/failing.log" -F -- "FAIL: ${checks}/failing.sh"
expect_in_log "${temporary_dir}/failing.log" -F -- 'failing-started'
if grep -E -- 'Running |helper-ran|failing-continued|FAIL: .*(first|second|helper)' \
  "${temporary_dir}/failing.log"; then
  echo 'FAIL: the runner reported more than the failing check and its output.' >&2
  exit 1
fi
rm -- "${checks}/failing.sh"

# A shell check that stops on a failing command under `set -e` has the file,
# line, and command where it stopped in its log: in the check, in a support
# file it sources, or, for a failure inside `$(...)`, the substitution's line.
# Handled failures, a check's own `exit 1`, and scripts a check launches get
# no such line.
stops="${temporary_dir}/stops"
mkdir -p -- "${stops}/support"
write_check_in "${stops}" bare.sh '[[ a == b ]]'
printf 'stop_helper() {\n  [[ 1 -eq 2 ]]\n}\n' > "${stops}/support/stop-helper.bash"
# shellcheck disable=SC2016 # The substitute check expands its own path.
write_check_in "${stops}" sourced.sh 'source "$(dirname -- "${BASH_SOURCE[0]}")/support/stop-helper.bash"
stop_helper 2> /dev/null'
write_check_in "${stops}" substitution.sh "attempt=\$(awk 'BEGIN { exit 1 }')"
# shellcheck disable=SC2016 # The substitute check expands its own variable.
write_check_in "${stops}" handled.sh 'set +e
false
set -e
if false; then :; fi
false || true
after=$(false; echo after)
[[ ${after} == after ]]'
write_check_in "${stops}" own-fail.sh 'set +e
false
set -e
echo "FAIL: own-fail message" >&2
exit 1'
write_check_in "${stops}" launched.sh "set +e
child_stderr=\$(bash -c 'set -e; echo child-line >&2; false' 2>&1 > /dev/null)
set -e
[[ \${child_stderr} == child-line ]]"
run_suite stops "${stops}"
if ((suite_status != 1)); then
  printf 'FAIL: the runner exited %s for checks that stopped, not 1.\n' "${suite_status}" >&2
  cat -- "${temporary_dir}/stops.log" >&2
  exit 1
fi
expected_stops=(
  "stopped at ${stops}/bare.sh:3: [[ a == b ]]"
  "stopped at ${stops}/substitution.sh:3: attempt=\$(awk 'BEGIN { exit 1 }')"
  "stopped at ${stops}/support/stop-helper.bash:2: [[ 1 -eq 2 ]]"
)
for expected in "FAIL: ${stops}/bare.sh" "FAIL: ${stops}/sourced.sh" \
  "FAIL: ${stops}/substitution.sh" "FAIL: ${stops}/own-fail.sh" \
  'FAIL: own-fail message' "${expected_stops[@]}"; do
  expect_in_log "${temporary_dir}/stops.log" -F -x -- "${expected}"
done
grep -F -- 'stopped at' "${temporary_dir}/stops.log" | LC_ALL=C sort > "${temporary_dir}/reported-stops"
mapfile -t reported_stops < "${temporary_dir}/reported-stops"
if [[ ${reported_stops[*]} != "${expected_stops[*]}" ]] \
  || grep -E -- 'FAIL: .*(handled|launched)' "${temporary_dir}/stops.log"; then
  echo 'FAIL: the runner reported a stop location for a handled or launched failure.' >&2
  cat -- "${temporary_dir}/stops.log" >&2
  exit 1
fi

# A check that passes but prints, on either stream, fails the run and is shown.
write_check noisy-stderr.sh 'echo stderr-warning >&2'
write_check noisy-stdout.sh 'echo stdout-chatter'
run_suite noisy
if ((suite_status != 1)); then
  printf 'FAIL: the runner exited %s for passing checks that printed, not 1.\n' "${suite_status}" >&2
  exit 1
fi
for noisy in noisy-stderr:stderr-warning noisy-stdout:stdout-chatter; do
  expect_in_log "${temporary_dir}/noisy.log" \
    -F -- "FAIL: ${checks}/${noisy%%:*}.sh (passed but printed output)"
  expect_in_log "${temporary_dir}/noisy.log" -F -x -- "${noisy#*:}"
done
if grep -E -- 'FAIL: .*(first|second|helper)|helper-ran' "${temporary_dir}/noisy.log"; then
  echo 'FAIL: the runner reported a silent passing check or a support file.' >&2
  exit 1
fi
rm -- "${checks}"/noisy-*.sh

# Files matched by `node-test-files` run as jobs of their own, through the
# failures-only reporter, under the same rules as shell checks.
mkdir -p -- "${checks}/node"
write_node_test() {
  printf 'import { appendFileSync } from "node:fs";\nimport { test } from "node:test";\ntest("%s", () => { %s });\n' \
    "$1" "$2" > "${checks}/node/$1.test.mjs"
}
printf '# substitute node tests\n%s\n' "${checks}/node/*.test.mjs" > "${checks}/node-test-files"
write_node_test node-quiet ''
write_node_test node-failing 'console.log("node-failing-output"); throw new Error("node-failing-error");'
write_node_test node-noisy 'console.log("node-noisy-output");'
run_suite node
if ((suite_status != 1)); then
  printf 'FAIL: the runner exited %s for failing and printing node files, not 1.\n' "${suite_status}" >&2
  exit 1
fi
for expected in "FAIL: ${checks}/node/node-failing.test.mjs" 'not ok: node-failing' \
  node-failing-error node-failing-output \
  "FAIL: ${checks}/node/node-noisy.test.mjs (passed but printed output)" node-noisy-output; do
  expect_in_log "${temporary_dir}/node.log" -F -- "${expected}"
done
if grep -E -- 'node-quiet|FAIL: .*(first|second)' "${temporary_dir}/node.log"; then
  echo 'FAIL: the runner reported a silent passing node file or shell check.' >&2
  exit 1
fi
rm -- "${checks}/node/node-failing.test.mjs" "${checks}/node/node-noisy.test.mjs"

# Jobs named in `longest-first` start first, in that order, then the rest;
# OPEN_DOUGH_TEST_TIMES receives every job's seconds and label, longest first,
# and the jobs themselves do not inherit it.
order="${temporary_dir}/order"
for name in alpha beta gamma; do
  write_check "${name}.sh" "[[ -z \${OPEN_DOUGH_TEST_TIMES+set} ]]; printf '%s\\n' ${name} >> '${order}'"
done
write_node_test node-ordered "appendFileSync('${order}', 'node-ordered\\n');"
printf '# longest first\n%s\n%s\n%s\n' "${checks}/gamma.sh" 'tests/not-a-job.sh' \
  "${checks}/node/node-ordered.test.mjs" > "${checks}/longest-first"
times="${temporary_dir}/times"
OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_TIMES="${times}" run_suite ordered
if ((suite_status != 0)) || [[ -s ${temporary_dir}/ordered.log ]]; then
  printf 'FAIL: the ordered run exited %s or printed output.\n' "${suite_status}" >&2
  cat -- "${temporary_dir}/ordered.log" >&2
  exit 1
fi
mapfile -t started < "${order}"
[[ ${started[0]} == gamma && ${started[1]} == node-ordered && ${#started[@]} -eq 4 ]]
for name in alpha beta; do
  grep -q -F -x -- "${name}" "${order}"
done
mapfile -t timed < "${times}"
[[ ${#timed[@]} -eq 7 ]]
grep -q -E -- "^[0-9]+\.[0-9]"$'\t'"${checks}/node/node-quiet\\.test\\.mjs\$" "${times}"
sort -r -n -c -- "${times}"

# A job whose shell is killed before it records a status is reported as failed
# with its log; the run still finishes, and every job still gets a time line.
lost="${temporary_dir}/lost"
mkdir -p -- "${lost}"
# shellcheck disable=SC2016 # The substitute check expands its own PPID.
printf '#!/usr/bin/env bash\necho lost-started\nkill -9 "${PPID}"\n' > "${lost}/lost.sh"
printf '#!/usr/bin/env bash\ntrue\n' > "${lost}/kept.sh"
OPEN_DOUGH_TEST_JOBS=2 OPEN_DOUGH_TEST_TIMES="${times}" run_suite lost "${lost}"
if ((suite_status != 1)); then
  printf 'FAIL: the runner exited %s for a job that left no status, not 1.\n' "${suite_status}" >&2
  cat -- "${temporary_dir}/lost.log" >&2
  exit 1
fi
expect_in_log "${temporary_dir}/lost.log" -F -x -- \
  "FAIL: ${lost}/lost.sh (ended without recording an exit status)"
expect_in_log "${temporary_dir}/lost.log" -F -x -- 'lost-started'
if grep -E -- 'FAIL: .*kept\.sh|No such file' "${temporary_dir}/lost.log"; then
  echo 'FAIL: the runner reported the passing check or crashed on the missing status.' >&2
  exit 1
fi
mapfile -t timed < "${times}"
[[ ${#timed[@]} -eq 2 ]]
for name in lost kept; do
  expect_in_log "${times}" -E -- "^[0-9]+\.[0-9]"$'\t'"${lost}/${name}\\.sh\$"
done
