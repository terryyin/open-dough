#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
checks="${temporary_dir}/checks"
mkdir -p -- "${checks}"

# Each substitute check appends its own name to SPLIT_RECORD, and fails naming
# every OPEN_DOUGH_TEST_* variable it inherited: the runner's settings stay with
# the runner, so a check that runs the runner itself gets every one of its own
# checks. They are created in an order other than sorted, and `longest-first`
# names one of them, so the expected shares follow only from the runner's
# partition order: mu, then alpha, beta, delta, zeta.
write_checks() {
  local name
  for name in "$@"; do
    # shellcheck disable=SC2016 # The substitute check expands its own names.
    printf '#!/usr/bin/env bash\nset -euo pipefail\nprintf "%%s\\n" "${BASH_SOURCE[0]##*/}" >> "${SPLIT_RECORD}"\ninherited=$(compgen -e OPEN_DOUGH_TEST_ || true)\n[[ -z ${inherited} ]] || { for name in ${inherited}; do echo "inherited ${name}=${!name}"; done; exit 1; }\n' \
      > "${checks}/${name}.sh"
  done
}
write_checks zeta delta mu alpha beta
printf '# longest first\n%s\n' "${checks}/mu.sh" > "${checks}/longest-first"

# Runs the runner over the checks with OPEN_DOUGH_TEST_SPLIT set to the second
# argument, or unset when it is empty, logging to <name>.log, recording the
# checks that ran in <name>.record, and their times in <name>.times. It also
# gives the runner a job count and a setting the runner does not know, neither
# of which a check may inherit.
run_split() {
  local setting=()
  [[ -z $2 ]] || setting=("OPEN_DOUGH_TEST_SPLIT=$2")
  suite_status=0
  env "${setting[@]}" SPLIT_RECORD="${temporary_dir}/$1.record" \
    OPEN_DOUGH_TEST_TIMES="${temporary_dir}/$1.times" OPEN_DOUGH_TEST_DIR="${checks}" \
    OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_ANYTHING=x \
    "${BASH}" "${source_dir}/scripts/test.sh" > "${temporary_dir}/$1.log" 2>&1 \
    || suite_status=$?
}

# Asserts that FILE names exactly the expected checks, each once, in any order.
expect_names() {
  local file=$1 actual expected
  shift
  actual=$(LC_ALL=C sort -- "${file}" | paste -s -d ' ' -)
  expected=$(printf '%s\n' "$@" | LC_ALL=C sort | paste -s -d ' ' -)
  if [[ ${actual} != "${expected}" ]]; then
    printf 'FAIL: %s names [%s], not [%s].\n' "${file##*/}" "${actual}" "${expected}" >&2
    exit 1
  fi
}

# Runs the split given second as <name> and asserts that it passed silently,
# ran exactly the named checks, and its times file lists only those.
expect_share() {
  local name=$1 split=$2
  shift 2
  run_split "${name}" "${split}"
  if ((suite_status != 0)) || [[ -s ${temporary_dir}/${name}.log ]]; then
    printf 'FAIL: the %s run exited %s or printed output.\n' "${name}" "${suite_status}" >&2
    cat -- "${temporary_dir}/${name}.log" >&2
    exit 1
  fi
  expect_names "${temporary_dir}/${name}.record" "$@"
  cut -f 2 -- "${temporary_dir}/${name}.times" | sed 's|.*/||' > "${temporary_dir}/${name}.timed"
  expect_names "${temporary_dir}/${name}.timed" "$@"
}

# Unset, every check runs once.
expect_share all '' alpha.sh beta.sh delta.sh mu.sh zeta.sh

# Dealt round-robin from mu, alpha, beta, delta, zeta: each split runs a
# non-empty share of its own checks, and together they run every check exactly
# once.
expect_share first 1/2 mu.sh beta.sh zeta.sh
expect_share second 2/2 alpha.sh delta.sh
cat -- "${temporary_dir}/first.record" "${temporary_dir}/second.record" \
  > "${temporary_dir}/union.record"
expect_names "${temporary_dir}/union.record" alpha.sh beta.sh delta.sh mu.sh zeta.sh

# The same split runs the same checks again after the files are recreated in
# another order.
rm -- "${checks}"/*.sh
write_checks beta alpha mu delta zeta
expect_share again 1/2 mu.sh beta.sh zeta.sh

# A failing check fails its own split, naming it, and not the other split.
# Dealt from mu, alpha, beta, delta, epsilon, zeta, it lands in share 1.
printf '#!/usr/bin/env bash\necho epsilon-failed\nexit 1\n' > "${checks}/epsilon.sh"
run_split failing-second 2/2
if ((suite_status != 0)); then
  printf 'FAIL: the split without the failing check exited %s.\n' "${suite_status}" >&2
  cat -- "${temporary_dir}/failing-second.log" >&2
  exit 1
fi
run_split failing-first 1/2
if ((suite_status != 1)); then
  printf 'FAIL: the split with the failing check exited %s, not 1.\n' "${suite_status}" >&2
  exit 1
fi
expect_in_log "${temporary_dir}/failing-first.log" -F -x -- "FAIL: ${checks}/epsilon.sh"
rm -- "${checks}/epsilon.sh"

# A malformed split, or a share outside 1..n, fails naming the value before
# any check runs.
for invalid in 3/2 0/2 x; do
  run_split invalid "${invalid}"
  if ((suite_status != 1)) || [[ -e ${temporary_dir}/invalid.record ]]; then
    printf 'FAIL: OPEN_DOUGH_TEST_SPLIT=%s exited %s or ran checks.\n' \
      "${invalid}" "${suite_status}" >&2
    cat -- "${temporary_dir}/invalid.log" >&2
    exit 1
  fi
  expect_in_log "${temporary_dir}/invalid.log" -F -- "OPEN_DOUGH_TEST_SPLIT=${invalid} "
done
