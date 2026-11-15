#!/usr/bin/env bash
# Credential-free automated checks; explicit native options use the case entry.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329
set -Eeuo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
if (($#)); then
  exec bash "${source_dir}/Distribution/evaluation/src/native-comparison.sh" "$@"
fi
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
entry=("${BASH}" "${source_dir}/Distribution/evaluation/src/native-comparison.sh")

# The catalog selects a case by its traits.
"${entry[@]}" --list > "${work}/catalog"
grep -Fqx 'paused-supplier' "${work}/catalog"
grep -Fqx 'doughnut-title-precedence' "${work}/catalog"
grep -Fqx 'supplier-watch' "${work}/catalog"
grep -Fqx 'unblocked-supplier' "${work}/catalog"
grep -Eq '^  (workflow|hosts|prerequisites|decisions-and-proof|duration): ' "${work}/catalog"
[[ $("${entry[@]}" --list --where hosts=codex --where workflow=blocked | grep -v '^ ') == $'paused-supplier\nsupplier-watch' ]]
[[ $("${entry[@]}" --list --where prerequisites=nix | grep -v '^ ') == doughnut-title-precedence ]]
if "${entry[@]}" --list --where workflow=no-such-workflow > /dev/null; then
  echo 'FAIL: a catalog filter that matches no case succeeded' >&2
  exit 1
fi
