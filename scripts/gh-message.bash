# shellcheck shell=bash
# How the CI readers quote a failed `gh` call: gh's own stderr message, sourced
# by scripts/ci-test-times.sh and scripts/ci-repeat.sh after "gh … failed: ".

# Prints FILE (gh's own message) on one line.
gh_message() {
  local text
  text=$(< "$1")
  printf '%s' "${text//$'\n'/ }"
}
