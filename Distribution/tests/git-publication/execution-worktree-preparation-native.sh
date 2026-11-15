#!/usr/bin/env bash
# Credential-free automated checks; explicit native options use the case entry.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329
set -Eeuo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
if (($#)); then
  exec bash "${source_dir}/Distribution/evaluation/cases/git-publication/execution-worktree-preparation-native.sh" "$@"
fi
source "${source_dir}/Distribution/evaluation/cases/git-publication/execution-worktree-prep-native.sh"
source "${source_dir}/Distribution/tests/support/execution-worktree-prep-native-cheap.sh"
cheap_work=$(mktemp -d)
finish_cheap() {
  rm -rf -- "${cheap_work}"
}
trap finish_cheap EXIT
wrapper="${source_dir}/Distribution/evaluation/cases/git-publication/execution-worktree-preparation-native.sh"
run_cheap_assessor_contracts "${cheap_work}"
run_cheap_flag_contracts "${cheap_work}" "${wrapper}"
run_cheap_isolation "${cheap_work}" "${wrapper}"
exit 0
