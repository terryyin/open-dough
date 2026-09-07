#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
updater="${source_dir}/src/skills/dough-update/SKILL.md"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/public-payload-fixture.bash
source "${source_dir}/tests/helpers/public-payload-fixture.bash"

for native_root in .agents/skills .cursor/skills .claude/skills; do
  recorded_version=$(cat \
    "${source_dir}/${native_root}/dough-update/VERSION")
  released_version=$(git -C "${source_dir}" show \
    "v${recorded_version}:VERSION")
  [[ "${recorded_version}" == "${released_version}" ]]
done

# shellcheck disable=SC2154 # Assigned by the sourced public-payload fixture.
for managed_file in "${managed_files[@]}"; do
  grep -Fq -- "\`${managed_file}\`" "${updater}"
done
grep -Fq 'complete public payload' "${updater}"
grep -Fq 'git ls-remote --tags' "${updater}"
grep -Fq 'highest numeric' "${updater}"
grep -Fq 'VERSION' "${updater}"
grep -Fq 'The old updater cannot perform a migration it' \
  "${source_dir}/docs/installation-and-updates.md"

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
cp -- "${source_dir}/src/skills/dough-adr-awareness/RECOGNITION.md" \
  "${fixture_source}/src/skills/dough-adr-awareness/RECOGNITION.md"

printf '\n%s\n' \
  'Fixture improvement: when several status authorities disagree, identify each conflicting repository-relative source before asking the human to resolve precedence.' \
  >> "${fixture_source}/src/skills/dough-adr-awareness/SKILL.md"
printf '\n%s\n' \
  '- Improvement fixture clue: explicitly enumerates conflicting local status authorities before requesting human precedence.' \
  >> "${fixture_source}/src/skills/dough-adr-awareness/RECOGNITION.md"
candidate_version=999.0.0
candidate_tag="v${candidate_version}"
printf '%s\n' "${candidate_version}" > "${fixture_source}/VERSION"
printf '## %s - 2026-09-06\n' "${candidate_version}" > \
  "${fixture_source}/CHANGELOG.md"

git -C "${fixture_source}" init -q --initial-branch=main
git -C "${fixture_source}" add install.sh src VERSION CHANGELOG.md
git -C "${fixture_source}" \
  -c user.name='Open Dough fixture' \
  -c user.email='fixture@example.invalid' \
  commit -qm 'fixture: improve ADR conflict reporting'
git -C "${fixture_source}" \
  -c user.name='Open Dough fixture' \
  -c user.email='fixture@example.invalid' \
  tag -am "${candidate_tag}" "${candidate_tag}"

source_revision=$(git -C "${fixture_source}" rev-parse HEAD)
source_url="file://${fixture_source}"

mkdir -p -- "${target}/.agents/skills/dough-update" \
  "${target}/.agents/skills/dough-adr-awareness" \
  "${target}/.cursor/skills/dough-update" \
  "${target}/.claude/skills/dough-update" \
  "${target}/.agents/skills/unrelated-guidance" \
  "${target}/src/skills/project-owned"
for managed_file in "${managed_files[@]}"; do
  cp -- "${source_dir}/.agents/skills/${managed_file}" \
    "${target}/.agents/skills/${managed_file}"
done
cp -- "${source_dir}/.agents/skills/dough-adr-awareness/RECOGNITION.md" \
  "${target}/.agents/skills/dough-adr-awareness/RECOGNITION.md"
cp -- "${source_dir}/.agents/skills/dough-update/VERSION" \
  "${target}/.agents/skills/dough-update/VERSION"
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

expected_changes=$(
  for managed_file in "${managed_files[@]}"; do
    if ! cmp -s -- "${fixture_source}/src/skills/${managed_file}" \
      "${target}/.agents/skills/${managed_file}"; then
      printf '.agents/skills/%s\n' "${managed_file}"
    fi
  done
  if ! cmp -s -- "${fixture_source}/VERSION" \
    "${target}/.agents/skills/dough-update/VERSION"; then
    printf '%s\n' '.agents/skills/dough-update/VERSION'
  fi
)
expected_changes=$(printf '%s\n' "${expected_changes}" | LC_ALL=C sort)

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
installed_recognition_before=$(shasum -a 256 \
  "${target}/.agents/skills/dough-adr-awareness/RECOGNITION.md")
native_copies_before=$(snapshot "${source_dir}/.agents/skills")
native_copies_before+=$(snapshot "${source_dir}/.cursor/skills")
native_copies_before+=$(snapshot "${source_dir}/.claude/skills")
output_file="${temporary_dir}/codex-output.md"

if [[ ${1:-} == '--native' ]]; then
  command -v codex > /dev/null
  codex exec --ephemeral --ignore-user-config --skip-git-repo-check \
    --sandbox danger-full-access -C "${target}" \
    -o "${output_file}" \
    "Use \$dough-update ${source_url} to update this adopter from the supplied cloneable fixture source. This is an updater proof only: follow the installed updater, do not invoke the ADR-awareness skill, do not edit the fixture source, and report the actual source, release tag, commit, running tool, and every installed path."
else
  pinned_checkout="${temporary_dir}/pinned candidate"
  mkdir -p -- "${pinned_checkout}"
  git -C "${pinned_checkout}" init -q
  git -C "${pinned_checkout}" fetch -q --depth 1 \
    "${source_url}" "${source_revision}"
  git -C "${pinned_checkout}" -c advice.detachedHead=false \
    checkout -q --detach FETCH_HEAD
  pinned_revision=$(git -C "${pinned_checkout}" rev-parse HEAD)
  [[ "${pinned_revision}" == "${source_revision}" ]]
  bash "${pinned_checkout}/src/install/open-dough-release.sh" apply \
    --url "${source_url}" --target "${target}" --platform codex \
    --checkout "${pinned_checkout}" > "${output_file}"
fi

source_after=$(snapshot "${fixture_source}")
[[ "${source_before}" == "${source_after}" ]]
fixture_source_status=$(git -C "${fixture_source}" status --porcelain)
[[ -z "${fixture_source_status}" ]]
native_copies_after=$(snapshot "${source_dir}/.agents/skills")
native_copies_after+=$(snapshot "${source_dir}/.cursor/skills")
native_copies_after+=$(snapshot "${source_dir}/.claude/skills")
[[ "${native_copies_before}" == "${native_copies_after}" ]]

for managed_file in "${managed_files[@]}"; do
  cmp "${fixture_source}/src/skills/${managed_file}" \
    "${target}/.agents/skills/${managed_file}"
done
installed_recognition_after=$(shasum -a 256 \
  "${target}/.agents/skills/dough-adr-awareness/RECOGNITION.md")
[[ "${installed_recognition_after}" == "${installed_recognition_before}" ]]

actual_changes=$(git -C "${target}" diff --name-only | LC_ALL=C sort)
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
grep -Fq "${candidate_tag}" "${output_file}"
grep -Fq "${target}/.agents/skills/dough-update" "${output_file}"
if [[ ${1:-} == '--native' ]]; then
  grep -Fqi 'Codex' "${output_file}"
  for managed_file in "${managed_files[@]}"; do
    grep -Fq ".agents/skills/${managed_file}" "${output_file}"
  done
fi

source_digest=$(printf '%s' "${source_before}" | shasum -a 256 | cut -d ' ' -f 1)

printf '%s\n' '--- CODEX EXPANDED-PAYLOAD UPDATE PROOF ---'
cat "${output_file}"
printf '\n%s\n' '--- UPDATE INTEGRITY PROOF ---'
printf 'fixture source: %s\n' "${source_url}"
printf 'fixture commit: %s\n' "${source_revision}"
printf 'fixture source digest: %s\n' "${source_digest}"
printf '%s\n' \
  'PASS: the installed updater selected the disposable candidate tag, reported its actual source and pinned commit, and left the cloneable fixture source byte-identical.'
printf '%s\n' \
  'PASS: the selected Codex two-skill payload byte-matches every candidate source; an older recognition record remains unchanged for later retirement; tracked native releases, Cursor, Claude Code, unrelated guidance, distributable source, and project files are unchanged.'
