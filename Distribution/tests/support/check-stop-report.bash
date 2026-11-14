# scripts/test.sh loads this file through BASH_ENV into each shell check it
# starts. When the check stops on a failing command under `set -e`, its log
# names where: `stopped at <file>:<line>: <command>`. ERR fires only where
# errexit would stop the shell, and the report is printed only while errexit
# is on, so a handled failure (under `set +e`, in an `if`, after `||`, or
# inside a `$(...)`, where errexit is off) prints nothing; a failure inside a
# substitution is named by the line that runs it. Scripts the check launches
# do not load this file, and a report reaches the log even from a function
# whose stderr is redirected.
unset BASH_ENV
exec {check_stop_report_fd}>&2
set -E
# shellcheck disable=SC2154 # BASH_COMMAND and LINENO are set by Bash in the trap.
trap '[[ $- != *e* ]] || printf "stopped at %s:%s: %s\n" "${BASH_SOURCE[0]}" "${LINENO}" "${BASH_COMMAND}" >&"${check_stop_report_fd}"' ERR
