#!/usr/bin/env bash
# Times one fresh Dashboard Frontend Test invocation and sums the case
# durations its verbose reporter prints. Arguments are the command's own, for
# example: bash measure.sh stories/story-notes
set -u
output=$(mktemp)
trap 'rm -f "${output}"' EXIT
started=$(node -e 'console.log(performance.timeOrigin / 1000)')
env -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:frontend -- "$@" > "${output}" 2>&1
status=$?
elapsed=$(node -e 'console.log((performance.timeOrigin / 1000 - Number(process.argv[1])).toFixed(2))' "${started}")
load=$(node -e 'console.log(require("os").loadavg()[0].toFixed(1))')
plain=$(sed 's/\x1b\[[0-9;]*m//g' "${output}")
awk '
  / ✓ / { n++; d = $NF; sub(/ms$/, "", d); sum += d; printf "%6d ms  %s\n", d, $0 }
  / × |FAIL/ { failed++; print }
  END { printf "cases=%d failed=%d sum=%d ms mean=%.0f ms\n", n, failed, sum, n ? sum / n : 0 }' <<< "${plain}"
echo "exit=${status} elapsed=${elapsed} s load=${load}"
exit "${status}"
