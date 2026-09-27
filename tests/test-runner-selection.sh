#!/usr/bin/env bash
# Named checks run alone through the runner: only the chosen shell and
# `node --test` files start, under the runner's Git environment, and a focused
# run is not held to the suite's time budget. Relative paths resolve from the
# caller's directory. A path that is not a file, or not a check's kind, fails
# the run, naming it, before any check starts.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
checks="${temporary_dir}/checks"
markers="${temporary_dir}/markers"
mkdir -p -- "${checks}/node" "${markers}"

# Each check leaves a marker, so the markers show exactly which checks ran.
# The chosen shell check also records the Git state it sees.
cat > "${checks}/chosen.sh" << CHECK
#!/usr/bin/env bash
set -euo pipefail
{
  printf 'global=%s\n' "\${GIT_CONFIG_GLOBAL:-unset}"
  printf 'maintenance.auto=%s\n' "\$(git config --get maintenance.auto || echo unset)"
} > '${markers}/chosen'
CHECK
# Unchosen checks are slow, so a full run breaches the budget below.
printf '#!/usr/bin/env bash\ntouch -- %q\nsleep 0.3\n' "${markers}/other" \
  > "${checks}/other.sh"
cat > "${checks}/node/chosen.test.mjs" << CHECK
import { writeFileSync } from 'node:fs';
import { test } from 'node:test';
test('chosen', () => writeFileSync('${markers}/node-chosen', ''));
CHECK
cat > "${checks}/node/other.test.mjs" << CHECK
import { writeFileSync } from 'node:fs';
import { test } from 'node:test';
test('other', () => writeFileSync('${markers}/node-other', ''));
CHECK
printf '%s\n' "${checks}/node/*.test.mjs" > "${checks}/node-test-files"
printf 'per-job-seconds=0.1\ntotal-job-seconds=0.2\n' > "${checks}/time-budget"

# Runs the runner over the checks with the given paths, logging to <name>.log.
run_suite() {
  local name=$1
  shift
  suite_status=0
  OPEN_DOUGH_TEST_DIR="${checks}" "${BASH}" "${source_dir}/scripts/test.sh" "$@" \
    > "${temporary_dir}/${name}.log" 2>&1 || suite_status=$?
}

# The full run breaches the budget, so the focused run's silence is selection.
run_suite full
expect_in_log "${temporary_dir}/full.log" -F -- 'OVER BUDGET:'
rm -f -- "${markers}"/*

cd -- "${checks}"
run_suite chosen chosen.sh node/chosen.test.mjs
if ((suite_status != 0)) || [[ -s ${temporary_dir}/chosen.log ]]; then
  printf 'FAIL: the chosen run exited %s or printed output:\n' "${suite_status}" >&2
  cat -- "${temporary_dir}/chosen.log" >&2
  exit 1
fi
if [[ ! -e ${markers}/chosen || ! -e ${markers}/node-chosen ]] \
  || [[ -e ${markers}/other || -e ${markers}/node-other ]]; then
  printf 'FAIL: the chosen run did not run exactly the chosen checks; markers:\n' >&2
  ls -- "${markers}" >&2
  exit 1
fi
expect_in_log "${markers}/chosen" -x -F -- 'global=/dev/null'
expect_in_log "${markers}/chosen" -x -F -- 'maintenance.auto=false'

for bad in "${checks}/absent.sh" "${checks}/node-test-files"; do
  rm -f -- "${markers}"/*
  run_suite bad "${checks}/chosen.sh" "${bad}"
  if ((suite_status != 1)); then
    printf 'FAIL: a run naming %s exited %s, not 1.\n' "${bad}" "${suite_status}" >&2
    cat -- "${temporary_dir}/bad.log" >&2
    exit 1
  fi
  expect_in_log "${temporary_dir}/bad.log" -F -- "FAIL: ${bad} is "
  expect_in_log "${temporary_dir}/bad.log" -F -- 'no check was run'
  started=("${markers}"/*)
  if [[ -e ${started[0]} ]]; then
    printf 'FAIL: a run naming %s started a check.\n' "${bad}" >&2
    exit 1
  fi
done
