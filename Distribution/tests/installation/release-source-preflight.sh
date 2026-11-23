#!/usr/bin/env bash
# The release preflight refuses test material and unsafe entries in the shipped
# directory, naming each path, and accepts runtime supporting files and drafts
# kept outside the shipped directory.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
preflight="${source_dir}/scripts/check-release-source.sh"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

# A checkout holding the current shipped directory.
fresh_checkout() {
  local checkout="${temporary_dir}/$1"
  mkdir -p -- "${checkout}/Distribution/src"
  cp -R -- "${source_dir}/Distribution/src/skills" "${checkout}/Distribution/src/skills"
  printf '%s\n' "${checkout}"
}

expect_pass() {
  local checkout=$1 label=$2 output
  if ! output=$(bash "${preflight}" "${checkout}" 2>&1); then
    printf 'FAIL: %s was refused:\n%s\n' "${label}" "${output}" >&2
    exit 1
  fi
}

expect_refusal() {
  local checkout=$1 expected=$2 output
  if output=$(bash "${preflight}" "${checkout}" 2>&1); then
    printf 'FAIL: accepted a source expected to report: %s\n' "${expected}" >&2
    exit 1
  fi
  if [[ "${output}" != *"${expected}"* ]]; then
    printf 'FAIL: expected %s in:\n%s\n' "${expected}" "${output}" >&2
    exit 1
  fi
}

# A runtime supporting file and a draft outside the tree stay valid.
valid=$(fresh_checkout valid)
printf '%s\n' 'export const value = 1;' > "${valid}/Distribution/src/skills/dough-update/scripts-helper.mjs"
mkdir -p -- "${valid}/Distribution/proposed/dough-draft"
printf '%s\n' 'Draft' > "${valid}/Distribution/proposed/dough-draft/SKILL.md"
ln -s ../proposed "${valid}/Distribution/proposed-link"
expect_pass "${valid}" 'a valid source'

misplaced_test=$(fresh_checkout misplaced-test)
printf '%s\n' 'test' > "${misplaced_test}/Distribution/src/skills/dough-update/update.test.mjs"
expect_refusal "${misplaced_test}" 'Test material in shipped directory: dough-update/update.test.mjs'

misplaced_fixture=$(fresh_checkout misplaced-fixture)
mkdir -p -- "${misplaced_fixture}/Distribution/src/skills/dough-update/fixtures"
printf '%s\n' 'data' > "${misplaced_fixture}/Distribution/src/skills/dough-update/fixtures/case.json"
expect_refusal "${misplaced_fixture}" 'Test material in shipped directory: dough-update/fixtures'

symlinked=$(fresh_checkout symlinked)
ln -s SKILL.md "${symlinked}/Distribution/src/skills/dough-update/alias.md"
expect_refusal "${symlinked}" 'Unsafe shipped entry (symlink): dough-update/alias.md'

unsafe_name=$(fresh_checkout unsafe-name)
printf '%s\n' 'notes' > "${unsafe_name}/Distribution/src/skills/dough-update/two"$'\n'"lines.md"
expect_refusal "${unsafe_name}" "Unsafe shipped entry (path name): \$'dough-update/two\\nlines.md'"

# The maintained source passes its own preflight.
expect_pass "${source_dir}" 'the maintained source'
