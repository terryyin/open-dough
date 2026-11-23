#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2154 # The sourced fixture supplies internal_skill_names.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck source=Distribution/tests/helpers/public-payload-fixture.bash
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
# shellcheck source=Distribution/tests/helpers/payload-bytes.bash
source "${source_dir}/Distribution/tests/helpers/payload-bytes.bash"
# shellcheck source=Distribution/tests/helpers/installed-ci-proof-fixture.bash
source "${source_dir}/Distribution/tests/helpers/installed-ci-proof-fixture.bash"

if (($# < 2)); then
  echo "Usage: $0 <codex|cursor|claude> <managed-file>..." >&2
  exit 1
fi
platform=$1
shift
managed_files=("$@")

case "${platform}" in
  codex | cursor)
    relative_skill_root=.agents/skills
    ;;
  claude)
    relative_skill_root=.claude/skills
    ;;
  *)
    echo "Usage: $0 <codex|cursor|claude> <managed-file>..." >&2
    exit 1
    ;;
esac

skill_roots=(.agents/skills .claude/skills)

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

list_files() {
  (
    cd -- "$1"
    find . -type f -print | LC_ALL=C sort
  )
}

target="${temporary_dir}/target project"
mkdir -p -- "${target}/.agents/skills/existing-codex" \
  "${target}/.cursor/skills/existing-cursor" \
  "${target}/.claude/skills/existing-claude"
printf '%s\n' 'Keep this Codex guidance.' > \
  "${target}/.agents/skills/existing-codex/SKILL.md"
printf '%s\n' 'Keep this Cursor guidance.' > \
  "${target}/.cursor/skills/existing-cursor/SKILL.md"
printf '%s\n' 'Keep this Claude guidance.' > \
  "${target}/.claude/skills/existing-claude/SKILL.md"
printf '%s\n' 'Keep this project file.' > "${target}/keep.txt"

cd -- "${temporary_dir}"
bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
  --platform "${platform}" > /dev/null

expected_source=$(cd -- "${source_dir}" && pwd -P)
for skill_root in "${skill_roots[@]}"; do
  [[ ! -e "${target}/${skill_root}/dough-execute-plan/scripts/watch-ci.mjs" ]]
  [[ ! -e "${target}/${skill_root}/dough-makeme/scripts/select-makeme.mjs" ]]
  [[ ! -e "${target}/${skill_root}/dough-makeme/scripts/changed-makeme.mjs" ]]
  assert_payload_bytes_match "${source_dir}/Distribution/src/skills" "${target}/${skill_root}"
  assert_installed_ci_proof "${target}/${skill_root}"
  # Load the actual installed completion entry points and their relative imports.
  node --input-type=module - "${target}/${skill_root}" << 'NODE'
import { pathToFileURL } from "node:url";
import { join } from "node:path";
for (const path of ["dough-execute-plan/scripts/ci-mailbox.mjs", "dough-story-wrap-up/scripts/trunk-closure.mjs"])
  await import(pathToFileURL(join(process.argv[2], path)));
NODE
  recorded_source=$(cat "${target}/${skill_root}/dough-update/SOURCE")
  [[ "${recorded_source}" == "${expected_source}" ]]
done

for internal_skill in "${internal_skill_names[@]}"; do
  for skill_root in "${skill_roots[@]}"; do
    [[ ! -e "${target}/${skill_root}/${internal_skill}" ]]
  done
done
[[ ! -e "${target}/AGENTS.md" ]]
[[ ! -e "${target}/CLAUDE.md" ]]

for skill_root in "${skill_roots[@]}"; do
  for managed_file in "${managed_files[@]}"; do
    [[ -f "${target}/${skill_root}/${managed_file}" ]]
  done
done
expected_files=$(
  {
    printf '%s\n' \
      './.agents/skills/existing-codex/SKILL.md' \
      './.codex/hooks.json' \
      './.claude/settings.json' \
      './.claude/skills/existing-claude/SKILL.md' \
      './.cursor/hooks.json' \
      './.cursor/skills/existing-cursor/SKILL.md' \
      './keep.txt'
    for skill_root in "${skill_roots[@]}"; do
      for managed_file in "${managed_files[@]}"; do
        printf './%s/%s\n' "${skill_root}" "${managed_file}"
      done
      printf './%s/dough-update/SOURCE\n' "${skill_root}"
      printf './%s/dough-update/VERSION\n' "${skill_root}"
    done
  } | LC_ALL=C sort
)
actual_files=$(list_files "${target}")
[[ "${actual_files}" == "${expected_files}" ]]

# A source whose shipped directory holds an unsafe entry is refused whole.
invalid_source="${temporary_dir}/invalid source"
unsafe_entry=dough-update/linked-guidance.md
mkdir -p -- "${invalid_source}/Distribution/src/skills"
cp -- "${source_dir}/install.sh" "${invalid_source}/install.sh"
mkdir -p -- "${invalid_source}/src"
cp -R -- "${source_dir}/src/install" "${invalid_source}/src/"
cp -- "${source_dir}/VERSION" "${invalid_source}/VERSION"
cp -- "${source_dir}/CHANGELOG.md" "${invalid_source}/CHANGELOG.md"
cp -R -- "${source_dir}/Distribution/src/install" "${invalid_source}/Distribution/src/install"
copy_managed_payload "${source_dir}/Distribution/src/skills" "${invalid_source}/Distribution/src/skills"
ln -s SKILL.md "${invalid_source}/Distribution/src/skills/${unsafe_entry}"

invalid_target="${temporary_dir}/invalid target"
mkdir -p -- "${invalid_target}"
printf '%s\n' 'Do not change me.' > "${invalid_target}/sentinel.txt"
before=$(list_files "${invalid_target}")
if output=$(bash "${invalid_source}/install.sh" \
  --target "${invalid_target}" --source "${invalid_source}" \
  --platform "${platform}" 2>&1); then
  echo "FAIL: a client payload with an unsafe entry must be rejected." >&2
  exit 1
fi
[[ "${output}" == *"Unsafe shipped entry (symlink): ${unsafe_entry}"* ]]
[[ "${output}" == *'Client payload is unreadable:'* ]]
after=$(list_files "${invalid_target}")
[[ "${after}" == "${before}" ]]
[[ ! -e "${invalid_target}/${relative_skill_root%%/*}" ]]
sentinel_contents=$(cat "${invalid_target}/sentinel.txt")
[[ "${sentinel_contents}" == 'Do not change me.' ]]
