#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "${source_dir}"

# Tests run in child shells, so check the bash they will actually use.
test_bash=$(command -v bash)
# Expand BASH_VERSION in the child shell, not this runner.
# shellcheck disable=SC2016
test_bash_version=$("${test_bash}" -c 'printf "%s" "${BASH_VERSION}"')
if [[ ${test_bash_version%%.*} -lt 4 ]]; then
  printf 'FAIL: shell tests require Bash 4+; resolved %s (version %s).\n' \
    "${test_bash}" "${test_bash_version}" >&2
  printf 'Install Bash 4+ and put its bin directory first on PATH, then rerun the tests.\n' >&2
  exit 1
fi

# The runner is the one scheduler: every shell check and every `node --test`
# file is its own job, and no job runs a worker pool of its own. Each job keeps
# a private temp directory. Plan 073 capped the pool at four because elapsed-time
# waits starved at eight; tests now wait for events, so the default is one slot
# per online CPU. OPEN_DOUGH_TEST_JOBS overrides it with any count of 1 or more.
job_slots=${OPEN_DOUGH_TEST_JOBS:-$(getconf _NPROCESSORS_ONLN)}
if ((job_slots < 1)); then
  job_slots=1
fi

output_root=$(mktemp -d)
trap 'rm -rf -- "${output_root}"' EXIT
mkfifo "${output_root}/slots"
exec 3<> "${output_root}/slots"
for ((slot = 0; slot < job_slots; slot++)); do
  printf '\n' >&3
done

node_reporter="${source_dir}/tests/support/node-test-failures-reporter.mjs"
run_job() {
  local index=$1 kind=$2 label=$3
  local log="${output_root}/${index}.log"
  local job_status=0 started=${EPOCHREALTIME}
  if [[ ${kind} == node ]]; then
    node --test --test-reporter="${node_reporter}" "${label}" > "${log}" 2>&1 \
      || job_status=1
  else
    "${test_bash}" "${label}" > "${log}" 2>&1 || job_status=1
  fi
  printf '%s\n' "${job_status}" > "${output_root}/${index}.status"
  awk -v start="${started}" -v end="${EPOCHREALTIME}" \
    'BEGIN { printf "%.1f\n", end - start }' > "${output_root}/${index}.seconds"
  printf '\n' >&3
}

# OPEN_DOUGH_TEST_DIR names another directory of checks, such as substitutes
# in a runner test; it replaces the suite's own checks entirely.
test_dir=${OPEN_DOUGH_TEST_DIR:-tests}
declare -A job_kinds=()
discovered=()
add_job() {
  job_kinds[$2]=$1
  discovered+=("$2")
}

find "${test_dir}" -type f -name '*.sh' ! -path "${test_dir}/support/*" -print0 \
  > "${output_root}/tests"
while IFS= read -r -d '' test_file; do
  add_job shell "${test_file}"
done < "${output_root}/tests"

# `node-test-files` lists glob patterns, relative to the repository root, of
# `node --test` files; each matching file is scheduled as its own job.
if [[ -f ${test_dir}/node-test-files ]]; then
  while read -r pattern; do
    [[ -z ${pattern} || ${pattern} == '#'* ]] && continue
    while IFS= read -r node_file; do
      add_job node "${node_file}"
    done < <(compgen -G "${pattern}" || true)
  done < "${test_dir}/node-test-files"
fi

if [[ -z ${OPEN_DOUGH_TEST_DIR:-} ]]; then
  add_job shell 'scripts/check-self-installation.sh'
fi

# `longest-first` names known long jobs, longest first. They start before the
# rest so the longest job does not begin last; unknown names are ignored.
labels=()
declare -A scheduled=()
if [[ -f ${test_dir}/longest-first ]]; then
  while read -r label; do
    [[ -z ${label} || ${label} == '#'* ]] && continue
    if [[ -n ${job_kinds[${label}]+set} && -z ${scheduled[${label}]+set} ]]; then
      labels+=("${label}")
      scheduled[${label}]=1
    fi
  done < "${test_dir}/longest-first"
fi
for label in "${discovered[@]}"; do
  [[ -n ${scheduled[${label}]+set} ]] || labels+=("${label}")
done

for index in "${!labels[@]}"; do
  read -r -u 3
  run_job "${index}" "${job_kinds[${labels[index]}]}" "${labels[index]}" &
done

wait

# Report only failing checks, each with its own captured output. A passing
# check must be silent, so a check that exits 0 but wrote anything fails too.
status=0
for index in "${!labels[@]}"; do
  read -r job_status < "${output_root}/${index}.status"
  log="${output_root}/${index}.log"
  if [[ ${job_status} -ne 0 ]]; then
    reason=''
  elif [[ -s ${log} ]]; then
    reason=' (passed but printed output)'
  else
    continue
  fi
  {
    printf 'FAIL: %s%s\n' "${labels[index]}" "${reason}"
    cat -- "${log}"
  } >&2
  status=1
done

# OPEN_DOUGH_TEST_TIMES names a file that receives each job's wall seconds and
# label, longest first, for profiling and for keeping `longest-first` current.
if [[ -n ${OPEN_DOUGH_TEST_TIMES:-} ]]; then
  for index in "${!labels[@]}"; do
    read -r seconds < "${output_root}/${index}.seconds"
    printf '%s\t%s\n' "${seconds}" "${labels[index]}"
  done | sort -rn > "${OPEN_DOUGH_TEST_TIMES}"
fi

exit "${status}"
