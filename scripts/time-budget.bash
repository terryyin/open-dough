# shellcheck shell=bash
# The one reader of a time-budget file, sourced by every script that needs its
# ceilings. The file sets `per-job-seconds=<n>` and `total-job-seconds=<n>`;
# `#` lines and blank lines are ignored.

# Sets per_job_seconds and total_job_seconds from BUDGET_FILE. An unreadable
# file, or one without both numbers or with any other line, fails on stderr and
# returns 1.
read_time_budget() {
  local budget=$1 line number='^[0-9]+(\.[0-9]+)?$'
  per_job_seconds='' total_job_seconds=''
  while IFS= read -r line || [[ -n ${line} ]]; do
    case ${line} in
      '' | '#'*) ;;
      per-job-seconds=*) per_job_seconds=${line#*=} ;;
      total-job-seconds=*) total_job_seconds=${line#*=} ;;
      *) per_job_seconds='' total_job_seconds='' && break ;;
    esac
  done < "${budget}" || return 1
  if [[ ! ${per_job_seconds} =~ ${number} || ! ${total_job_seconds} =~ ${number} ]]; then
    printf 'FAIL: %s must set only per-job-seconds=<n> and total-job-seconds=<n>.\n' \
      "${budget}" >&2
    return 1
  fi
}
