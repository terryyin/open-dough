#!/usr/bin/env bash
# Credential-free automated checks; explicit native options use the case entry.
# The catalog check runs the real command over its own two cases, so shipped
# case names and traits stay out of its expectations.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329
set -Eeuo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
if (($#)); then
  exec bash "${source_dir}/Distribution/evaluation/src/native-guidance-check.sh" "$@"
fi
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT

# A checkout-shaped root whose only guidance-check cases are alpha and beta.
root="${work}/checkout"
mkdir -p -- "${root}/Distribution/evaluation/cases/guidance-checks"
cp -R -- "${source_dir}/Distribution/evaluation/src" "${root}/Distribution/evaluation/src"
ln -s -- "${source_dir}/scripts" "${root}/scripts"
ln -s -- "${source_dir}/Distribution/tests" "${root}/Distribution/tests"
for family in "${source_dir}"/Distribution/evaluation/cases/*/; do
  family=$(basename -- "${family}")
  [[ ${family} == guidance-checks ]] \
    || ln -s -- "${source_dir}/Distribution/evaluation/cases/${family}" "${root}/Distribution/evaluation/cases/${family}"
done
selection_case() {
  mkdir -p -- "${root}/Distribution/evaluation/cases/guidance-checks/$1"
  printf '# %s\n\n## Selection\n\n- workflow: %s\n- hosts: %s\n' \
    "$1" "$2" "$3" > "${root}/Distribution/evaluation/cases/guidance-checks/$1/case.md"
}
selection_case alpha 'blocked execution' 'codex (qualified); claude: not qualified'
selection_case beta 'release review' 'codex'
catalog() {
  bash "${root}/Distribution/evaluation/src/native-guidance-check.sh" --list "$@"
}
case_names() {
  catalog "$@" | grep -v '^ '
}

# Two cases sharing a host but differing in workflow are both listed.
[[ $(case_names) == $'alpha\nbeta' ]]
[[ $(case_names --where hosts=CODEX) == $'alpha\nbeta' ]]
# Filters ignore case and keep only the case matching every one of them.
[[ $(case_names --where hosts=CODEX --where workflow=BLOCK) == alpha ]]
# Each listed case is followed by its indented selection traits.
[[ $(catalog --where workflow=release) == $'beta\n  workflow: release review\n  hosts: codex' ]]
if catalog --where workflow=absent > /dev/null; then
  echo 'FAIL: a catalog filter that matches no case succeeded' >&2
  exit 1
fi
