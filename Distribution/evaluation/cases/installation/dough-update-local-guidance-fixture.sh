#!/usr/bin/env bash
# Shared installed local-guidance rejection fixture.
# shellcheck disable=SC2034,SC2154 # Callers supply platform and consume snapshots.

temporary_dir=$(mktemp -d)
output_file="${temporary_dir}/response.md"
transcript="${temporary_dir}/transcript.jsonl"
finish() {
  local status=$?
  if ((status != 0)); then
    [[ ! -f ${output_file} ]] || cat "${output_file}" >&2
    [[ ! -f ${transcript} ]] || cat "${transcript}" >&2
  fi
  rm -rf -- "${temporary_dir}"
  exit "${status}"
}
trap finish EXIT

candidate="${temporary_dir}/candidate"
target="${temporary_dir}/adopter"
build_current_tagged_release_fixture "${candidate}"
mkdir -p -- "${target}/${skill_root}/team-architecture-practice"
printf '%s\n' \
  '---' \
  'name: team-architecture-practice' \
  'description: Project-owned architecture review. Keep this arbitrary local guidance.' \
  '---' \
  '' \
  'Follow the team-owned review and never replace this file automatically.' > \
  "${target}/${skill_root}/team-architecture-practice/SKILL.md"
printf '%s\n' \
  '# Client project instructions' \
  '' \
  'Preserve project-owned files and guidance.' > \
  "${target}/AGENTS.md"
bash "${candidate}/install.sh" --target "${target}" --source "${candidate}" \
  --platform "${platform}" > /dev/null

before=$(snapshot_path_state "${target}")
source_before=$(snapshot_path_state "${candidate}")
