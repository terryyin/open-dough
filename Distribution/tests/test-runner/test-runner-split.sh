#!/usr/bin/env bash
# OPEN_DOUGH_TEST_SPLIT=<i>/<n> runs share i of the `distribution-tests`
# matrix in the runner's own .github/workflows/ci.yml: an included share runs
# the checks its patterns match, the last share the rest. A matrix whose
# shares overlap, or whose pattern matches no check, fails every share and the
# unsplit run before any check starts.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/expect-in-log.bash
source "${source_dir}/Distribution/tests/helpers/expect-in-log.bash"
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/copy-runner.bash
source "${source_dir}/Distribution/tests/helpers/copy-runner.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fixture="${temporary_dir}/source"
copy_runner "${fixture}"
mkdir -p -- "${fixture}/.github/workflows" "${fixture}/Distribution/tests/support"
cp -- "${source_dir}/Distribution/tests/support/node-test-failures-reporter.mjs" \
  "${fixture}/Distribution/tests/support/"
printf '%s\n' 'Distribution/tests/skills/*/*.test.mjs' > "${fixture}/Distribution/tests/node-test-files"

# The matrix as CI states it, share 2 taking the patterns given.
write_workflow() {
  printf '%s\n' 'jobs:' '  distribution-tests:' '    strategy:' '      matrix:' \
    '        share: [1, 2, 3]' '        include:' '          - share: 1' \
    '            tests: Distribution/tests/skills/dough-execute-plan/**' \
    '          - share: 2' "            tests: $*" > "${fixture}/.github/workflows/ci.yml"
}

# Each check appends its own label to SPLIT_RECORD, and fails naming every
# OPEN_DOUGH_TEST_* variable it inherited: the runner's settings stay with the
# runner, so a check that runs the runner itself gets every one of its own
# checks.
write_checks() {
  local label
  for label in "$@"; do
    mkdir -p -- "${fixture}/${label%/*}"
    case ${label} in
      *.sh)
        # shellcheck disable=SC2016 # The check expands its own names.
        printf '#!/usr/bin/env bash\nset -euo pipefail\nprintf "%%s\\n" %q >> "${SPLIT_RECORD}"\ninherited=$(compgen -e OPEN_DOUGH_TEST_ || true)\n[[ -z ${inherited} ]] || { for name in ${inherited}; do echo "inherited ${name}=${!name}"; done; exit 1; }\n' \
          "${label}" > "${fixture}/${label}"
        ;;
      *)
        printf 'import { appendFileSync } from "node:fs";\nappendFileSync(process.env.SPLIT_RECORD, "%s\\n");\n' \
          "${label}" > "${fixture}/${label}"
        ;;
    esac
  done
}
plan=Distribution/tests/skills/dough-execute-plan/plan.sh
other=Distribution/tests/skills/other/other.sh
judge=Distribution/evaluation/tests/judge/judge.sh
self=scripts/check-self-installation.sh
write_checks "${plan}" "${other}" "${judge}" "${self}"
write_workflow 'Distribution/evaluation/**'

# Runs the fixture's runner with OPEN_DOUGH_TEST_SPLIT set to the second
# argument, or unset when it is empty, so an outer CI share cannot leak in.
# CI=true keeps an unsplit run out of the local admission, which this check
# does not prove. Also clears outer CI outcomes and deadline settings, gives
# the runner a job count and a setting it does not know, neither of which a
# check may inherit. Logs to <name>.log, records the checks that ran in
# <name>.record and their times in <name>.times.
run_split() {
  local setting=()
  [[ -z $2 ]] || setting=("OPEN_DOUGH_TEST_SPLIT=$2")
  suite_status=0
  # shellcheck disable=SC2086 # intentional: empty setting must expand to nothing
  env -u OPEN_DOUGH_TEST_SPLIT -u OPEN_DOUGH_TEST_DIR -u OPEN_DOUGH_TEST_OUTCOMES \
    -u OPEN_DOUGH_TEST_DEADLINE_MS -u OPEN_DOUGH_NODE_DEADLINE_MS -u OPEN_DOUGH_SETUP_DEADLINE_MS \
    ${setting[@]+"${setting[@]}"} CI=true \
    SPLIT_RECORD="${temporary_dir}/$1.record" OPEN_DOUGH_TEST_TIMES="${temporary_dir}/$1.times" \
    OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_ANYTHING=x \
    "${BASH}" "${fixture}/scripts/test.sh" "${@:3}" > "${temporary_dir}/$1.log" 2>&1 \
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
  cut -f 2 -- "${temporary_dir}/${name}.times" > "${temporary_dir}/${name}.timed"
  expect_names "${temporary_dir}/${name}.timed" "$@"
}

# Runs <name> with the split given second, and the named paths after it, and
# asserts that it failed before any check started, its log matching the
# extended regular expression given third.
expect_refused() {
  local name=$1 split=$2 message=$3
  run_split "${name}" "${split}" "${@:4}"
  if ((suite_status != 1)) || [[ -e ${temporary_dir}/${name}.record ]]; then
    printf 'FAIL: the %s run exited %s or started a check.\n' "${name}" "${suite_status}" >&2
    cat -- "${temporary_dir}/${name}.log" >&2
    exit 1
  fi
  expect_in_log "${temporary_dir}/${name}.log" -E -- "${message}"
}

# Unset, every check runs once; each share runs the checks the matrix gives
# it, the last share the rest.
expect_share all '' "${plan}" "${other}" "${judge}" "${self}"
expect_share first 1/3 "${plan}"
expect_share second 2/3 "${judge}"
expect_share third 3/3 "${other}" "${self}"

# A new folder's check, with nothing else changed, runs once, in the last
# share; a new check in the planned folder runs in the share naming it.
new_area=Distribution/tests/new-area/first.sh
new_case=Distribution/tests/skills/dough-execute-plan/new-case.test.mjs
write_checks "${new_area}" "${new_case}"
expect_share first-added 1/3 "${plan}" "${new_case}"
expect_share second-added 2/3 "${judge}"
expect_share third-added 3/3 "${other}" "${self}" "${new_area}"

# Moving a pattern in the workflow is the only edit a move needs.
write_workflow 'Distribution/evaluation/**' 'Distribution/tests/new-area/**'
expect_share second-moved 2/3 "${judge}" "${new_area}"
expect_share third-moved 3/3 "${other}" "${self}"

# A failing check fails its own share, naming it, and not another share.
printf '#!/usr/bin/env bash\necho other-failed\nexit 1\n' > "${fixture}/${other}"
run_split failing-first 1/3
if ((suite_status != 0)); then
  printf 'FAIL: the share without the failing check exited %s.\n' "${suite_status}" >&2
  cat -- "${temporary_dir}/failing-first.log" >&2
  exit 1
fi
run_split failing-third 3/3
if ((suite_status != 1)); then
  printf 'FAIL: the share with the failing check exited %s, not 1.\n' "${suite_status}" >&2
  exit 1
fi
expect_in_log "${temporary_dir}/failing-third.log" -F -x -- "FAIL: ${other}"
write_checks "${other}"

# Overlapping shares fail every share and the unsplit run, naming one check
# both match and both shares.
write_workflow 'Distribution/tests/skills/**'
for split in 1/3 2/3 3/3 ''; do
  expect_refused overlap "${split}" \
    "Distribution/tests/skills/dough-execute-plan/[^ ]+ matches the patterns of shares 1 and 2\.$"
done

# A renamed folder whose pattern stays behind fails naming the pattern; its
# checks do not silently join the last share.
write_workflow 'Distribution/evaluation/**'
mv -- "${fixture}/${judge%/*}" "${fixture}/Distribution/tests/assessment"
for split in 2/3 3/3 ''; do
  expect_refused unmatched "${split}" 'pattern Distribution/evaluation/\*\* of share 2 matches no check\.$'
done

# A split whose n is not the declared share count fails naming the value
# (scripts/test-share-matrix.mjs refuses every other malformed split the same
# way); so does a split of named paths.
expect_refused invalid 1/2 'OPEN_DOUGH_TEST_SPLIT=1/2 '
expect_refused named 1/3 'OPEN_DOUGH_TEST_SPLIT=1/3 selects a share of the discovered checks' "${fixture}/${plan}"
