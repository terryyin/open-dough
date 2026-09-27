# shellcheck shell=bash
# Job control has the launching shell and the launched child each put the child
# into a new group led by the child. On macOS those two calls can race; the
# loser fails with EPERM, and when that is the child, Bash prints one
# `child setpgid` line to the launch's stderr before the child starts. A group
# whose id is the child's pid exists only if one of the two calls moved the
# child into it.

# Succeeds only when LAUNCH_FILE holds exactly that one line for PID and PID's
# group exists; any other launch output is the caller's to report.
lost_setpgid_race() {
  local pid=$1 launch_file=$2
  kill -0 -- "-${pid}" 2> /dev/null \
    && cmp -s - "${launch_file}" \
      <<< "${0}: child setpgid (${pid} to ${pid}): Operation not permitted"
}
