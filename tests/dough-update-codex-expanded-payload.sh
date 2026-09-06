#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
updater="${source_dir}/src/skills/dough-update/SKILL.md"
managed_files=(
  dough-update/SKILL.md
  dough-adr-awareness/SKILL.md
  dough-adr-awareness/RECOGNITION.md
)

cmp "${updater}" "${source_dir}/.agents/skills/dough-update/SKILL.md"
cmp "${updater}" "${source_dir}/.cursor/skills/dough-update/SKILL.md"
cmp "${updater}" "${source_dir}/.claude/skills/dough-update/SKILL.md"

for managed_file in "${managed_files[@]}"; do
  grep -Fq -- "\`${managed_file}\`" "${updater}"
done
grep -Fq 'complete public payload' "${updater}"
grep -Fq 'git ls-remote --tags' "${updater}"
grep -Fq 'highest numeric' "${updater}"
grep -Fq 'VERSION' "${updater}"
grep -Fq 'The old updater cannot perform a migration it' \
  "${source_dir}/docs/installation-and-updates.md"

if [[ ${1:-} != '--native' ]]; then
  echo 'PASS: the shared updater and all native tracked copies declare the exact three-file payload, latest-release selection, byte verification, preservation boundary, and truthful legacy bootstrap.'
  exit 0
fi

command -v codex > /dev/null

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

fixture_source="${temporary_dir}/fixture-source"
target="${temporary_dir}/adopter project"
mkdir -p -- "${fixture_source}/src/install" \
  "${fixture_source}/src/skills/dough-update" \
  "${fixture_source}/src/skills/dough-adr-awareness" "${target}"

cp -- "${source_dir}/install.sh" "${fixture_source}/install.sh"
cp -- "${source_dir}/src/install/"*.sh "${fixture_source}/src/install/"
for managed_file in "${managed_files[@]}"; do
  cp -- "${source_dir}/src/skills/${managed_file}" \
    "${fixture_source}/src/skills/${managed_file}"
done

printf '\n%s\n' \
  'Fixture improvement: when several status authorities disagree, identify each conflicting repository-relative source before asking the human to resolve precedence.' \
  >> "${fixture_source}/src/skills/dough-adr-awareness/SKILL.md"
printf '\n%s\n' \
  '- Improvement fixture clue: explicitly enumerates conflicting local status authorities before requesting human precedence.' \
  >> "${fixture_source}/src/skills/dough-adr-awareness/RECOGNITION.md"
printf '%s\n' '0.1.1' > "${fixture_source}/VERSION"
printf '%s\n' '## 0.1.1 - 2026-09-06' > "${fixture_source}/CHANGELOG.md"

git -C "${fixture_source}" init -q --initial-branch=main
git -C "${fixture_source}" add install.sh src VERSION CHANGELOG.md
git -C "${fixture_source}" \
  -c user.name='Open Dough fixture' \
  -c user.email='fixture@example.invalid' \
  commit -qm 'fixture: improve ADR conflict reporting'
git -C "${fixture_source}" \
  -c user.name='Open Dough fixture' \
  -c user.email='fixture@example.invalid' \
  tag -am 'v0.1.1' v0.1.1

source_revision=$(git -C "${fixture_source}" rev-parse HEAD)
source_url="file://${fixture_source}"

bash "${source_dir}/install.sh" --target "${target}" --platform codex
mkdir -p -- "${target}/.cursor/skills/dough-update" \
  "${target}/.claude/skills/dough-update" \
  "${target}/.agents/skills/unrelated-guidance" \
  "${target}/src/skills/project-owned"
printf '%s\n' 'Keep the Cursor installation.' > \
  "${target}/.cursor/skills/dough-update/SKILL.md"
printf '%s\n' 'Keep the Claude Code installation.' > \
  "${target}/.claude/skills/dough-update/SKILL.md"
printf '%s\n' \
  '---' \
  'name: unrelated-guidance' \
  'description: Preserve this unrelated Codex guidance during updater proof.' \
  '---' \
  '' \
  'Keep unrelated Codex guidance.' > \
  "${target}/.agents/skills/unrelated-guidance/SKILL.md"
printf '%s\n' 'Keep project-owned distributable source.' > \
  "${target}/src/skills/project-owned/SKILL.md"
printf '%s\n' 'Keep this project file.' > "${target}/keep.txt"

git -C "${target}" init -q --initial-branch=main
git -C "${target}" add .
git -C "${target}" \
  -c user.name='Adopter fixture' \
  -c user.email='fixture@example.invalid' \
  commit -qm 'fixture: install baseline guidance'

snapshot() {
  local root=$1
  (
    cd -- "${root}"
    find . -type f ! -path './.git/*' -print0 \
      | LC_ALL=C sort -z \
      | xargs -0 shasum -a 256
  )
}

source_before=$(snapshot "${fixture_source}")
output_file="${temporary_dir}/codex-output.md"

codex exec --ephemeral --ignore-user-config --skip-git-repo-check \
  --sandbox danger-full-access -C "${target}" \
  -o "${output_file}" \
  "Use \$dough-update ${source_url} to update this adopter from the supplied cloneable fixture source. This is an updater proof only: follow the installed updater, do not invoke the ADR-awareness skill, do not edit the fixture source, and report the actual source, commit, running tool, and every installed path."

source_after=$(snapshot "${fixture_source}")
[[ "${source_before}" == "${source_after}" ]]
fixture_source_status=$(git -C "${fixture_source}" status --porcelain)
[[ -z "${fixture_source_status}" ]]

for managed_file in "${managed_files[@]}"; do
  cmp "${fixture_source}/src/skills/${managed_file}" \
    "${target}/.agents/skills/${managed_file}"
done

actual_changes=$(git -C "${target}" diff --name-only | LC_ALL=C sort)
expected_changes=$(printf '%s\n' \
  '.agents/skills/dough-adr-awareness/RECOGNITION.md' \
  '.agents/skills/dough-adr-awareness/SKILL.md' \
  '.agents/skills/dough-update/VERSION' | LC_ALL=C sort)
[[ "${actual_changes}" == "${expected_changes}" ]]
target_untracked=$(git -C "${target}" ls-files --others --exclude-standard)
[[ -z "${target_untracked}" ]]

grep -Fxq 'Keep the Cursor installation.' \
  "${target}/.cursor/skills/dough-update/SKILL.md"
grep -Fxq 'Keep the Claude Code installation.' \
  "${target}/.claude/skills/dough-update/SKILL.md"
grep -Fq 'Keep unrelated Codex guidance.' \
  "${target}/.agents/skills/unrelated-guidance/SKILL.md"
grep -Fxq 'Keep project-owned distributable source.' \
  "${target}/src/skills/project-owned/SKILL.md"
grep -Fxq 'Keep this project file.' "${target}/keep.txt"

grep -Fq "${source_url}" "${output_file}"
grep -Fq "${source_revision}" "${output_file}"
grep -Fqi 'Codex' "${output_file}"
for managed_file in "${managed_files[@]}"; do
  grep -Fq ".agents/skills/${managed_file}" "${output_file}"
done

source_digest=$(printf '%s' "${source_before}" | shasum -a 256 | cut -d ' ' -f 1)

printf '%s\n' '--- CODEX EXPANDED-PAYLOAD UPDATE PROOF ---'
cat "${output_file}"
printf '\n%s\n' '--- UPDATE INTEGRITY PROOF ---'
printf 'fixture source: %s\n' "${source_url}"
printf 'fixture commit: %s\n' "${source_revision}"
printf 'fixture source digest: %s\n' "${source_digest}"
printf '%s\n' \
  'PASS: native Codex invoked the installed updater, reported the actual pinned-release source identity, and left the cloneable fixture source byte-identical.'
printf '%s\n' \
  'PASS: the selected Codex payload byte-matches all three fetched sources; only the two intentionally improved ADR files differ from the committed baseline, while Cursor, Claude Code, unrelated guidance, distributable source, and project files are unchanged.'
