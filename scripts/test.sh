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

# Independent checks use private temp directories. Four at a time is the
# measured point where the suite still passes; eight starved a 15s file wait
# in the CI runtime checks. OPEN_DOUGH_TEST_JOBS selects the slot count and
# cannot exceed four.
job_slots=${OPEN_DOUGH_TEST_JOBS:-$(getconf _NPROCESSORS_ONLN)}
if ((job_slots > 4)); then
  job_slots=4
fi
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

labels=()
run_job() {
  local index=$1
  local log="${output_root}/${index}.log"
  local status_file="${output_root}/${index}.status"
  shift
  if "$@" > "${log}" 2>&1; then
    printf '0\n' > "${status_file}"
  else
    printf '1\n' > "${status_file}"
  fi
  printf '\n' >&3
}

launch() {
  local label=$1
  shift
  local index=${#labels[@]}
  labels+=("${label}")
  read -r -u 3
  run_job "${index}" "$@" &
}

# OPEN_DOUGH_TEST_DIR names another directory of checks, such as substitutes
# in a runner test; it replaces the suite's own checks entirely.
test_dir=${OPEN_DOUGH_TEST_DIR:-tests}
find "${test_dir}" -type f -name '*.sh' ! -path "${test_dir}/support/*" -print0 \
  > "${output_root}/tests"
while IFS= read -r -d '' test_file; do
  launch "${test_file}" "${test_bash}" "${test_file}"
done < "${output_root}/tests"

if [[ -z ${OPEN_DOUGH_TEST_DIR:-} ]]; then
  launch 'scripts/check-self-installation.sh' \
    "${test_bash}" "${source_dir}/scripts/check-self-installation.sh" "${source_dir}"
fi

wait

# Report only failing checks, each with its own captured output.
status=0
for index in "${!labels[@]}"; do
  read -r job_status < "${output_root}/${index}.status"
  if [[ ${job_status} -ne 0 ]]; then
    {
      printf 'FAIL: %s\n' "${labels[index]}"
      cat -- "${output_root}/${index}.log"
    } >&2
    status=1
  fi
done

exit "${status}"
