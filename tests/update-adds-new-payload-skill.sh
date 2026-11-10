#!/usr/bin/env bash
# shellcheck disable=SC2154 # Sourced fixture defines managed_files.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/release-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/publication-update-proof.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
new_managed_files=(
  dough-maintain-findings/SKILL.md
  dough-triage-project-findings/SKILL.md
  dough-triage-project-findings/references/maintenance-delivery.md
  dough-triage-project-findings/references/finding-lifecycle.md
  dough-bug-fixing/SKILL.md
  dough-resplit-story/SKILL.md
  dough-slice-planning/SKILL.md
  dough-slice-plan-refinement/SKILL.md
  dough-test-optimization/SKILL.md
  dough-test-optimization/references/optimization-tactics.md
  dough-test-optimization/references/candidate-record.md
  dough-test-optimization/references/resolving-candidates.md
  dough-test-optimization/references/evidence-and-leads.md
  dough-test-optimization/scripts/ci-proof-read.mjs
  dough-test-optimization/scripts/ci-proof-archive.mjs
  dough-test-optimization/scripts/ci-proof-check.mjs
  dough-test-optimization/scripts/ci-proof-leads.mjs
  dough-test-optimization/scripts/ci-proof-attempts.mjs
  dough-test-optimization/scripts/ci-proof-gaps.mjs
  dough-test-optimization/scripts/ci-proof-project.mjs
  dough-test-optimization/scripts/ci-proof-revisions.mjs
  dough-test-optimization/scripts/ci-proof-scope.mjs
  dough-test-optimization/scripts/ci-proof-scope-gaps.mjs
  dough-test-optimization/scripts/ci-proof-ranking.mjs
  dough-test-optimization/scripts/ci-proof-leads-table.mjs
  dough-test-optimization/scripts/ci-proof-ranking-table.mjs
  dough-test-optimization/scripts/ci-proof-table-text.mjs
  dough-intent-coverage/SKILL.md
  dough-intent-coverage/finish-report.mjs
)

fixture="${temporary_dir}/fixture.git"
older_checkout="${temporary_dir}/release-0.1.1"
# Model a release declaring none of the added skills' files.
added_skill_paths=$(printf '"%s", ' "${new_managed_files[@]}")
node "${source_dir}/tests/support/release-source.mjs" "${fixture}" << JSON
{"revisions": [
  {"name": "release 0.1.1 payload-before-added-skills", "release": {
    "version": "0.1.1", "taggedAt": "2026-09-01T00:00:00",
    "marker": "payload-before-added-skills",
    "withheld": [${added_skill_paths%, }], "removed": [${added_skill_paths%, }]}},
  {"name": "release 0.1.2 payload-with-added-skills", "release": {
    "version": "0.1.2", "taggedAt": "2026-09-02T00:00:00",
    "marker": "payload-with-added-skills"}}
]}
JSON
source_url="file://$(cd -- "${fixture}" && pwd -P)"
checkout_tagged_release "${fixture}" "${older_checkout}" 0.1.1

# Only the older release's shipped paths are valid baseline expectations.
older_managed_files=()
for managed_file in "${managed_files[@]}"; do
  [[ -f "${older_checkout}/src/skills/${managed_file}" ]] || continue
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
      assert_payload_bytes_match "${older_checkout}/src/skills" "${root}"
    )
    actual_version=$(cat "${root}/dough-update/VERSION")
    actual_source=$(cat "${root}/dough-update/SOURCE")
    [[ ${actual_version} == '0.1.1' ]]
    [[ ${actual_source} == "${source_url}" ]]
    for managed_file in "${new_managed_files[@]}"; do
      [[ ! -e ${root}/${managed_file} ]]
    done
  done
  claude_sentinel="${target}/.claude/skills/other-skill/SKILL.md"
  if [[ ${predecessor} == shared-root-only ]]; then
    # Preserve unrelated guidance outside the explicitly absent Claude root.
    mv -- "${target}/.claude/skills/other-skill" "${target}/.claude/other-skill"
    claude_sentinel="${target}/.claude/other-skill/SKILL.md"
    rm -rf -- "${target}/.claude/skills"
    [[ ! -e ${target}/.claude/skills ]]
  fi

  output=$(bash "${source_dir}/src/install/open-dough-release.sh" apply \
    --target "${target}" --platform codex)

  [[ "${output}" == *'installed or updated the shared Codex/Cursor root and Claude Code to 0.1.2'* ]]
  for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
    assert_payload_bytes_match "${fixture}/src/skills" "${root}"
    actual_version=$(cat "${root}/dough-update/VERSION")
    actual_source=$(cat "${root}/dough-update/SOURCE")
    [[ ${actual_version} == '0.1.2' ]]
    [[ ${actual_source} == "${source_url}" ]]
  done
  assert_sentinels "${target}" "${claude_sentinel}"
  assert_project_configuration "${target}"
done
