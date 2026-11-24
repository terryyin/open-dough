#!/usr/bin/env bash
# compare-payload verifies an installation against a supplied local tagged
# checkout, names the native root and path of each mismatch, writes nothing,
# and treats candidate-only collisions as mismatches. It reads each tag's own
# payload format: a grouped or inline list, or a marked shipped directory.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/public-payload-fixture.bash
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/release-fixture.bash
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
cd -- "${temporary_dir}"

helper="${source_dir}/Distribution/src/install/open-dough-release.sh"
fixture="${temporary_dir}/fixture.git"
# The shared "latest" release source in Distribution/tests/support/release-sources.mjs.
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${fixture}" latest
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
  output=$(bash "${helper}" compare-payload "${dest}" "${checkout}" 2>&1) || {
    printf 'FAIL: compare-payload refused %s against %s\n%s\n' "${dest}" "${checkout}" "${output}" >&2
    exit 1
  }
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
cp -- "${checkout}/Distribution/src/skills/dough-update/SKILL.md" "${agents_dest}/SKILL.md"

rm -f -- "${claude_root}/dough-adr-awareness/SKILL.md"
assert_compare_payload_mismatch "${claude_dest}" "${claude_root}" \
  'dough-adr-awareness/SKILL.md'
mkdir -p -- "${claude_root}/dough-adr-awareness"
cp -- "${checkout}/Distribution/src/skills/dough-adr-awareness/SKILL.md" \
  "${claude_root}/dough-adr-awareness/SKILL.md"

rm -- "${checkout}/Distribution/src/skills/dough-slice-planning/SKILL.md"
printf '%s\n' 'Keep this unrelated local slice-planning skill.' > \
  "${agents_root}/dough-slice-planning/SKILL.md"
assert_compare_payload_mismatch "${agents_dest}" "${agents_root}" \
  'dough-slice-planning/SKILL.md'

rm -- "${agents_root}/dough-slice-planning/SKILL.md"
assert_compare_payload_match "${agents_dest}"

# An inline list-era tag withholds dough-adr-awareness from its payload while
# its source still holds it: the path is new to an installation of that tag,
# so it must be absent, and present bytes are a collision.
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${temporary_dir}/inline.git" << 'JSON'
{"revisions": [{"name": "inline 0.2.0", "release": {"version": "0.2.0",
  "taggedAt": "2026-10-01T00:00:00", "marker": "payload-0.2.0",
  "declaration": "inline", "withheld": ["dough-adr-awareness/"]}}]}
JSON
checkout="${temporary_dir}/release-0.2.0"
checkout_tagged_release "${temporary_dir}/inline.git" "${checkout}" 0.2.0
[[ -f "${checkout}/Distribution/src/skills/dough-adr-awareness/SKILL.md" ]]
rm -rf -- "${target}"
prepare_target "${target}"
bash "${checkout}/install.sh" --target "${target}" --source "${temporary_dir}/inline.git" \
  --platform cursor --force > /dev/null
[[ ! -e "${agents_root}/dough-adr-awareness/SKILL.md" ]]
assert_compare_payload_match "${agents_dest}"
printf '%s\n' 'local managed edit' >> "${agents_dest}/SKILL.md"
assert_compare_payload_mismatch "${agents_dest}" "${agents_root}" 'dough-update/SKILL.md'
cp -- "${checkout}/Distribution/src/skills/dough-update/SKILL.md" "${agents_dest}/SKILL.md"
mkdir -p -- "${agents_root}/dough-adr-awareness"
cp -- "${checkout}/Distribution/src/skills/dough-adr-awareness/SKILL.md" "${agents_root}/dough-adr-awareness/"
assert_compare_payload_mismatch "${agents_dest}" "${agents_root}" 'dough-adr-awareness/SKILL.md'

# A missing or malformed list-era declaration must not turn all paths into
# apparently unmanaged files when verifying an empty root.
empty_dest="${temporary_dir}/empty/dough-update"
mkdir -p -- "${empty_dest}"
rm -- "${checkout}/install.sh"
for declaration in missing malformed; do
  if [[ "${declaration}" == malformed ]]; then
    printf '%s\n' 'managed_files=(' '  dough-update/SKILL.md' > "${checkout}/install.sh"
  fi
  if output=$(bash "${helper}" compare-payload "${empty_dest}" "${checkout}" 2>&1); then
    echo "FAIL: accepted ${declaration} list-era payload declaration." >&2
    exit 1
  fi
  [[ "${output}" == *'Cannot read managed payload declaration:'* ]]
done

# A marked directory-format tag lists nothing: each current managed file is a
# member, delivered with the tag's bytes, by its directory entry alone.
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${temporary_dir}/directory.git" << 'JSON'
{"revisions": [{"name": "directory 0.3.0", "release": {"version": "0.3.0",
  "taggedAt": "2026-11-01T00:00:00", "marker": "payload-0.3.0",
  "declaration": "directory"}}]}
JSON
checkout="${temporary_dir}/release-0.3.0"
checkout_tagged_release "${temporary_dir}/directory.git" "${checkout}" 0.3.0
if grep -q 'managed_files' "${checkout}/install.sh"; then
  echo "FAIL: a directory-format installer must list no files." >&2
  exit 1
fi
for root in "${agents_root}" "${claude_root}"; do
  rm -rf -- "${root}"
  mkdir -p -- "${root}"
  cp -R -- "${checkout}/Distribution/src/skills/." "${root}/"
done
assert_compare_payload_match "${agents_dest}"
assert_compare_payload_match "${claude_dest}"
printf '%s\n' 'local managed edit' >> "${claude_root}/dough-adr-awareness/SKILL.md"
assert_compare_payload_mismatch "${claude_dest}" "${claude_root}" 'dough-adr-awareness/SKILL.md'
cp -- "${checkout}/Distribution/src/skills/dough-adr-awareness/SKILL.md" "${claude_root}/dough-adr-awareness/SKILL.md"
assert_compare_payload_match "${claude_dest}"

# An invalid directory-format source fails verification with its path.
ln -s SKILL.md "${checkout}/Distribution/src/skills/dough-update/linked.md"
if output=$(bash "${helper}" compare-payload "${claude_dest}" "${checkout}" 2>&1) \
  || [[ "${output}" != *'Unsafe shipped entry (symlink): dough-update/linked.md'* ]]; then
  printf 'FAIL: an unsafe directory-format source must fail verification.\n%s\n' "${output}" >&2
  exit 1
fi
