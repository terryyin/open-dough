#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/public-payload-fixture.bash
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/release-fixture.bash
source "${source_dir}/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
cd -- "${temporary_dir}"

helper="${source_dir}/src/install/open-dough-release.sh"
fixture="${temporary_dir}/fixture.git"
build_latest_fixture "${fixture}"
checkout="${temporary_dir}/release-0.1.10"
checkout_tagged_release "${fixture}" "${checkout}" 0.1.10

target="${temporary_dir}/client project"
prepare_target "${target}"
bash "${checkout}/install.sh" --target "${target}" --source "${fixture}" \
  --platform cursor --force > /dev/null

agents_dest="${target}/.agents/skills/dough-update"
claude_dest="${target}/.claude/skills/dough-update"
agents_root=$(dirname -- "${agents_dest}")
claude_root=$(dirname -- "${claude_dest}")

assert_compare_payload_match() {
  local dest=$1
  local before after output

  before=$(snapshot_path_state "${target}")
  output=$(bash "${helper}" compare-payload "${dest}" "${checkout}" 2>&1)
  after=$(snapshot_path_state "${target}")
  [[ -z "${output}" ]]
  [[ "${after}" == "${before}" ]]
}

assert_compare_payload_mismatch() {
  local dest=$1
  local skill_root=$2
  local managed_file=$3
  local before after output

  before=$(snapshot_path_state "${target}")
  if output=$(bash "${helper}" compare-payload "${dest}" "${checkout}" 2>&1); then
    echo "FAIL: compare-payload must refuse a mismatched ${managed_file}." >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  after=$(snapshot_path_state "${target}")
  if [[ "${output}" != *"Managed payload mismatch: ${skill_root} ${managed_file}"* ]]; then
    echo "FAIL: expected mismatch to name native root ${skill_root} and path ${managed_file}." >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  [[ "${after}" == "${before}" ]]
}

assert_compare_payload_match "${agents_dest}"
assert_compare_payload_match "${claude_dest}"

printf '%s\n' 'local managed edit' >> "${agents_dest}/SKILL.md"
assert_compare_payload_mismatch "${agents_dest}" "${agents_root}" \
  'dough-update/SKILL.md'
cp -- "${checkout}/src/skills/dough-update/SKILL.md" "${agents_dest}/SKILL.md"

rm -f -- "${claude_root}/dough-adr-awareness/SKILL.md"
assert_compare_payload_mismatch "${claude_dest}" "${claude_root}" \
  'dough-adr-awareness/SKILL.md'
mkdir -p -- "${claude_root}/dough-adr-awareness"
cp -- "${checkout}/src/skills/dough-adr-awareness/SKILL.md" \
  "${claude_root}/dough-adr-awareness/SKILL.md"

rm -- "${checkout}/src/skills/dough-slice-planning/SKILL.md"
printf '%s\n' 'Keep this unrelated local slice-planning skill.' > \
  "${agents_root}/dough-slice-planning/SKILL.md"
assert_compare_payload_mismatch "${agents_dest}" "${agents_root}" \
  'dough-slice-planning/SKILL.md'

rm -- "${agents_root}/dough-slice-planning/SKILL.md"
assert_compare_payload_match "${agents_dest}"

echo 'PASS: compare-payload verifies a supplied local tagged checkout, names native root and path, writes nothing, and treats candidate-only collisions as mismatches.'
