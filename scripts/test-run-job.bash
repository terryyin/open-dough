# One job of scripts/test.sh: a Node test file under the failures reporter or
# a Bash check. Sourced after slots, times, and lost_setpgid_race are ready.
# shellcheck shell=bash
# source_dir, output_root, test_bash, and lost_setpgid_race come from
# scripts/test.sh (see its shellcheck source= directive).
# shellcheck disable=SC2154

# Prints the seconds between two EPOCHREALTIME readings, to a tenth.
elapsed_seconds() {
  awk -v start="$1" -v end="$2" 'BEGIN { printf "%.1f\n", end - start }'
}

node_reporter="${source_dir}/Distribution/tests/support/node-test-failures-reporter.mjs"
check_stop_report="${source_dir}/Distribution/tests/support/check-stop-report.bash"
# A check that asks GitHub names a request owner root of its own. Each job is
# given one that admits no owner -- too deep for any socket path, so a consumer
# pointed there makes it and is refused -- and fails when it was reached.
printf -v ownerless_root '%-110s' asked-github-without-a-private-request-owner-root
ownerless_root=${ownerless_root// /-}
run_job() {
  exec 2>&4 4>&-
  local index=$1 kind=$2 label=$3
  local log="${output_root}/${index}.log" launch="${output_root}/${index}.launch"
  local job_status=0 started=${EPOCHREALTIME}
  export DOUGH_GITHUB_REQUEST_OWNER_ROOT="${output_root}/${index}.${ownerless_root}"
  if [[ ${kind} == node ]]; then
    node --test \
      --test-reporter="${node_reporter}" \
      "${label}" > "${log}" 2>&1 \
      || job_status=$?
  else
    BASH_ENV="${check_stop_report}" "${test_bash}" "${label}" > "${log}" 2>&1 \
      || job_status=$?
  fi
  if [[ -e ${DOUGH_GITHUB_REQUEST_OWNER_ROOT} ]]; then
    printf 'Asked GitHub without a request owner root of its own.\n' >> "${log}"
    job_status=1
  fi
  # Only a lost setpgid race's launch line is emptied; any other launch output
  # stays and fails the run.
  if [[ -s ${launch} ]] && lost_setpgid_race "${BASHPID}" "${launch}"; then
    : > "${launch}"
  fi
  printf '%s\n' "${job_status}" > "${output_root}/${index}.status"
  elapsed_seconds "${started}" "${EPOCHREALTIME}" > "${output_root}/${index}.seconds"
  printf '\n' >&3
}
