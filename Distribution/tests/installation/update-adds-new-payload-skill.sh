#!/usr/bin/env bash
# shellcheck disable=SC2154 # Sourced fixture defines managed_files.
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
added_skill=dough-bug-fixing

fixture="${temporary_dir}/fixture.git"
older_checkout="${temporary_dir}/release-0.1.1"
# Model a release without the added skill.
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${fixture}" << JSON
{"revisions": [
  {"name": "release 0.1.1 payload-before-added-skill", "release": {
    "version": "0.1.1", "taggedAt": "2026-09-01T00:00:00",
    "marker": "payload-before-added-skill",
    "declaration": "grouped", "withheld": ["${added_skill}/"], "removed": ["${added_skill}"]}},
  {"name": "release 0.1.2 payload-with-added-skill", "release": {
    "version": "0.1.2", "taggedAt": "2026-09-02T00:00:00",
    "marker": "payload-with-added-skill"}}
]}
JSON
source_url="file://$(cd -- "${fixture}" && pwd -P)"
checkout_tagged_release "${fixture}" "${older_checkout}" 0.1.1

# Only the older release's shipped paths are valid baseline expectations.
older_managed_files=()
for managed_file in "${managed_files[@]}"; do
  [[ -f "${older_checkout}/Distribution/src/skills/${managed_file}" ]] || continue
  older_managed_files+=("${managed_file}")
done

for predecessor in complete shared-root-only; do
  target="${temporary_dir}/${predecessor}"
  prepare_target "${target}"
  write_project_configuration "${target}"
  bash "${older_checkout}/install.sh" --target "${target}" \
    --source "${source_url}" --platform codex > /dev/null
  for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
    (
      managed_files=("${older_managed_files[@]}")
      assert_payload_bytes_match "${older_checkout}/Distribution/src/skills" "${root}"
    )
    actual_version=$(cat "${root}/dough-update/VERSION")
    actual_source=$(cat "${root}/dough-update/SOURCE")
    [[ ${actual_version} == '0.1.1' ]]
    [[ ${actual_source} == "${source_url}" ]]
    [[ ! -e ${root}/${added_skill} ]]
  done
  claude_sentinel="${target}/.claude/skills/other-skill/SKILL.md"
  if [[ ${predecessor} == shared-root-only ]]; then
    # Preserve unrelated guidance outside the explicitly absent Claude root.
    mv -- "${target}/.claude/skills/other-skill" "${target}/.claude/other-skill"
    claude_sentinel="${target}/.claude/other-skill/SKILL.md"
    rm -rf -- "${target}/.claude/skills"
    [[ ! -e ${target}/.claude/skills ]]
  else
    # An unrelated file at a newly managed path stops the update unchanged.
    collision="${target}/.claude/skills/${added_skill}/SKILL.md"
    mkdir -p -- "${collision%/*}"
    printf '%s\n' 'Local guidance.' > "${collision}"
    before=$(snapshot_path_state "${target}")
    if bash "${source_dir}/Distribution/src/install/open-dough-release.sh" apply \
      --target "${target}" --platform codex > /dev/null 2>&1; then
      echo 'FAIL: update overwrote an unrelated file at a newly managed path.' >&2
      exit 1
    fi
    after=$(snapshot_path_state "${target}")
    [[ "${after}" == "${before}" ]]
    rm -r -- "${collision%/*}"
  fi

  output=$(bash "${source_dir}/Distribution/src/install/open-dough-release.sh" apply \
    --target "${target}" --platform codex)

  [[ "${output}" == *'installed or updated the shared Codex/Cursor root and Claude Code to 0.1.2'* ]]
  for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
    assert_payload_bytes_match "${fixture}/Distribution/src/skills" "${root}"
    actual_version=$(cat "${root}/dough-update/VERSION")
    actual_source=$(cat "${root}/dough-update/SOURCE")
    [[ ${actual_version} == '0.1.2' ]]
    [[ ${actual_source} == "${source_url}" ]]
  done
  assert_sentinels "${target}" "${claude_sentinel}"
  assert_project_configuration "${target}"
done
