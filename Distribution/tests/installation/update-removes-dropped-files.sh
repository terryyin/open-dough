#!/usr/bin/env bash
# shellcheck disable=SC2154 # Sourced fixture defines managed_files.
# An update removes installed files that earlier releases declared and the new
# release does not, found through the release tags at the recorded source.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/publication-update-proof.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
helper="${source_dir}/Distribution/src/install/open-dough-release.sh"
fixture="${temporary_dir}/fixture.git"

# C is delivered only by the directory-format 0.0.10, through its tree alone.
# A is declared only by 0.1.0, so a target recorded at 0.1.1 still holding it
# was stranded by an earlier update. B is declared through 0.1.1 and dropped by
# 0.1.2. Its directory also holds a project file in the target. W is in every
# list-era source tree but no release delivers it: never installed, and a copy
# kept through explicit force stays.
leftover_c='dough-directory-retired/c.md'
withheld_w='dough-manual-testing/references/exploration-workspace.md'
leftover_a='dough-retired/references/a.md'
leftover_b='dough-adr-awareness/extras/b.md'
project_beside_b='dough-adr-awareness/extras/project-notes.md'
retired_watcher='dough-execute-plan/scripts/watch-ci.mjs'
retired_select='dough-makeme/scripts/select-makeme.mjs'
retired_changed='dough-makeme/scripts/changed-makeme.mjs'

# 0.0.9's declaration is unreadable, as in early real releases. 0.0.10 ships
# its directory with C and without W. 0.1.0 removes C and adds A and B; later
# releases withhold W. 0.1.1 removes A and adds the wrappers. 0.1.2 removes B
# and the wrappers. Each added file's bytes name its release.
build_dropped_files_fixture() {
  local composed_files
  # This historical data fragment deliberately differs from the current one.
  # Only its same-tag bytes declare A; flattening every fixture would miss it.
  composed_files=$(
    node - "${leftover_a}" "${leftover_b}" << 'NODE'
const [a, b] = process.argv.slice(2);
process.stdout.write(JSON.stringify({
  "install.sh": 'managed_files=(\n  dough-update/SKILL.md\n)\nsource "$(dirname -- "${BASH_SOURCE[0]}")/Distribution/src/install/open-dough-execution-payload.sh"\n',
  "Distribution/src/install/open-dough-execution-payload.sh": `managed_files+=(\n  ${a}\n  ${b}\n)\n`,
}));
NODE
  )
  node "${source_dir}/Distribution/tests/support/release-source.mjs" "$1" << JSON
{"revisions": [
  {"name": "release 0.0.9 with an unreadable declaration", "release": {
    "version": "0.0.9", "taggedAt": "2026-08-30T00:00:00",
    "marker": "payload-0.0.9"},
    "files": {"install.sh": "managed_files=(dough-update/SKILL.md)\\n"}},
  {"name": "release 0.0.10 in directory format", "release": {
    "version": "0.0.10", "taggedAt": "2026-08-30T12:00:00",
    "marker": "payload-0.0.10", "declaration": "directory", "removed": ["${withheld_w}"],
    "added": {"${leftover_c}": "${leftover_c} from 0.0.10\\n"}}},
  {"name": "release 0.1.0", "release": {
    "version": "0.1.0", "taggedAt": "2026-08-31T00:00:00",
    "marker": "payload-0.1.0", "added": {
      "${leftover_a}": "${leftover_a} from 0.1.0\\n",
      "${leftover_b}": "${leftover_b} from 0.1.0\\n"}}, "files": ${composed_files},
    "remove": ["Distribution/src/skills/${leftover_c%%/*}"]},
  {"name": "release 0.1.1", "release": {
    "version": "0.1.1", "taggedAt": "2026-09-01T00:00:00",
    "marker": "payload-0.1.1", "withheld": ["${withheld_w}"], "added": {
      "${leftover_b}": "${leftover_b} from 0.1.1\\n",
      "${retired_watcher}": "// Retired observer from 0.1.1\\n",
      "${retired_select}": "// Retired source selector from 0.1.1\\n",
      "${retired_changed}": "// Retired changed selector from 0.1.1\\n"}},
    "remove": ["Distribution/src/skills/${leftover_a%%/*}"]},
  {"name": "release 0.1.2", "release": {
    "version": "0.1.2", "taggedAt": "2026-09-02T00:00:00",
    "marker": "payload-0.1.2", "withheld": ["${withheld_w}"]},
    "remove": ["Distribution/src/skills/${leftover_b%/*}", "Distribution/src/skills/${retired_watcher}",
      "Distribution/src/skills/${retired_select}", "Distribution/src/skills/${retired_changed}"]}
]}
JSON
}

# Install 0.1.1 with its own installer into both roots, then add A and C with
# their releases' bytes and the project's own files.
prepare_recorded_target() {
  local target=$1 older=$2 root

  prepare_target "${target}"
  write_project_configuration "${target}"
  bash "${older}/install.sh" --target "${target}" --source "${fixture}" \
    --platform codex > /dev/null
  mkdir -p -- "${target}/.claude/skills/own-skill"
  printf '%s\n' 'Project-owned skill.' > "${target}/.claude/skills/own-skill/SKILL.md"
  for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
    mkdir -p -- "${root}/${leftover_a%/*}"
    git -C "${fixture}" show "v0.1.0:Distribution/src/skills/${leftover_a}" > "${root}/${leftover_a}"
    mkdir -p -- "${root}/${leftover_c%/*}"
    git -C "${fixture}" show "v0.0.10:Distribution/src/skills/${leftover_c}" > "${root}/${leftover_c}"
    [[ ! -e "${root}/${withheld_w}" ]]
    printf '%s\n' 'Project notes beside a leftover.' > "${root}/${project_beside_b}"
    [[ -f "${root}/${leftover_b}" ]]
    [[ -f "${root}/${retired_watcher}" && -f "${root}/${retired_select}" &&
      -f "${root}/${retired_changed}" ]]
  done
}

# Print the indented paths the output lists under platform's removal heading.
removed_listing() {
  local output=$1 platform=$2 root=$3
  printf '%s\n' "${output}" | awk -v heading="${platform}: removed files 0.1.2 no longer declares from ${root}:" '
    $0 == heading { listing = 1; next }
    listing && /^  / { sub(/^  /, ""); print; next }
    { listing = 0 }
  ' | LC_ALL=C sort
}

# Both roots list the retired files as removed and contain the 0.1.2 payload.
assert_leftovers_replaced_by_release() {
  local target=$1 output=$2 platform_root platform root listed installed_version expected_removed

  expected_removed=$(printf '%s\n' "${leftover_a}" "${leftover_b}" "${leftover_c}" \
    "${retired_watcher}" "${retired_select}" "${retired_changed}" | LC_ALL=C sort)
  for platform_root in "codex:${target}/.agents/skills" "claude:${target}/.claude/skills"; do
    platform=${platform_root%%:*}
    root=${platform_root#*:}
    listed=$(removed_listing "${output}" "${platform}" "${root}")
    if [[ "${listed}" != "${expected_removed}" ]]; then
      printf 'FAIL: %s removal listing was:\n%s\nfull output:\n%s\n' "${platform}" "${listed}" "${output}" >&2
      exit 1
    fi
    [[ ! -e "${root}/${leftover_a}" && ! -e "${root}/${leftover_b}" && ! -e "${root}/${leftover_c}" ]]
    [[ ! -e "${root}/${retired_watcher}" && ! -e "${root}/${retired_select}" &&
      ! -e "${root}/${retired_changed}" ]]
    assert_payload_bytes_match "${fixture}/Distribution/src/skills" "${root}"
    installed_version=$(cat "${root}/dough-update/VERSION")
    [[ "${installed_version}" == '0.1.2' ]]
  done
}

assert_project_files_kept() {
  local target=$1 root contents

  contents=$(cat "${target}/.claude/skills/own-skill/SKILL.md")
  [[ "${contents}" == 'Project-owned skill.' ]]
  for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
    contents=$(cat "${root}/${project_beside_b}")
    [[ "${contents}" == 'Project notes beside a leftover.' ]]
    contents=$(cat "${root}/dough-update/SOURCE")
    [[ "${contents}" == "${recorded_source}" ]]
  done
  assert_sentinels "${target}"
  assert_project_configuration "${target}"
}

build_dropped_files_fixture "${fixture}"
recorded_source=$(cd -- "${fixture}" && pwd -P)
# The installed payload is 0.1.2's own declaration, which withholds W.
installed_declaration=$(read_managed_files_declaration "${fixture}/install.sh")
# shellcheck disable=SC2034 # The sourced payload-bytes helpers read managed_files.
mapfile -t managed_files <<< "${installed_declaration}"
older="${temporary_dir}/release-0.1.1"
checkout_tagged_release "${fixture}" "${older}" 0.1.1

# Ordinary update: unedited leftovers in both roots are removed and listed.
target="${temporary_dir}/ordinary"
prepare_recorded_target "${target}" "${older}"
output=$(bash "${helper}" apply --target "${target}" --platform codex 2>&1)

[[ "${output}" == *'installed or updated the shared Codex/Cursor root and Claude Code to 0.1.2'* ]]
if [[ "${output}" == *'filtering not recognized'* || "${output}" == *'promisor'* ]]; then
  printf 'FAIL: release-history fetch noise reached the update output:\n%s\n' "${output}" >&2
  exit 1
fi
assert_leftovers_replaced_by_release "${target}" "${output}"
# Removal leaves no empty directory; one still holding a project file stays.
for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
  [[ ! -e "${root}/${leftover_a%%/*}" && ! -e "${root}/${leftover_c%%/*}" && ! -e "${root}/${withheld_w}" ]]
  [[ -d "${root}/${leftover_b%/*}" ]]
done
assert_project_files_kept "${target}"

# Edited leftovers: the ordinary update names them in every root and refuses
# before any write, pointing to the explicit force replacement.
target="${temporary_dir}/edited"
prepare_recorded_target "${target}" "${older}"
printf '%s\n' 'local edit' >> "${target}/.agents/skills/${leftover_b}"
printf '%s\n' 'local edit' >> "${target}/.claude/skills/${leftover_b}"
printf '%s\n' 'local edit' >> "${target}/.claude/skills/${leftover_c}"
before=$(snapshot_path_state "${target}")
if output=$(bash "${helper}" apply --target "${target}" --platform codex 2>&1); then
  printf 'FAIL: ordinary update accepted an edited leftover:\n%s\n' "${output}" >&2
  exit 1
fi
expected_refusal="codex: edited files at paths 0.1.2 no longer declares in ${target}/.agents/skills:
  ${leftover_b}
claude: edited files at paths 0.1.2 no longer declares in ${target}/.claude/skills:
  ${leftover_c}
  ${leftover_b}
Ordinary update refuses without writes. Use --force to explicitly reinstall and remove them."
if [[ "${output}" != *"${expected_refusal}"* ||
  "${output}" != *'Outcome: refused; preserved the selected installation.'* ]]; then
  printf 'FAIL: edited-leftover refusal was:\n%s\n' "${output}" >&2
  exit 1
fi
after=$(snapshot_path_state "${target}")
if [[ "${after}" != "${before}" ]]; then
  echo 'FAIL: refusing an edited leftover changed the target.' >&2
  exit 1
fi
assert_project_files_kept "${target}"

# Explicit force installs 0.1.2 and removes every leftover, edited or not,
# keeping a copy of W with its tagged bytes.
for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
  mkdir -p -- "${root}/${withheld_w%/*}"
  git -C "${fixture}" show "v0.1.2:Distribution/src/skills/${withheld_w}" > "${root}/${withheld_w}"
done
output=$(bash "${helper}" apply --target "${target}" --platform codex --force 2>&1)
[[ "${output}" == *'Outcome: installed 0.1.2 in the shared Codex/Cursor root and Claude Code by explicit force.'* ]]
assert_leftovers_replaced_by_release "${target}" "${output}"
assert_project_files_kept "${target}"
for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
  git -C "${fixture}" show "v0.1.2:Distribution/src/skills/${withheld_w}" | cmp -s - "${root}/${withheld_w}"
done
