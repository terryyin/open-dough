#!/usr/bin/env bash
# shellcheck disable=SC2154 # Sourced fixture defines managed_files.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fixture="${temporary_dir}/source"
helper="${source_dir}/src/install/open-dough-release.sh"
mkdir -p -- "${fixture}"
git -C "${fixture}" init --quiet -b main
git_identity "${fixture}"
write_candidate_payload "${fixture}" 0.1.1 before-stories
# Model the previous three-skill release, including its declared payload.
for script in install.sh src/install/open-dough-release-version.sh; do
  sed '/dough-story-/d' "${fixture}/${script}" > "${fixture}/filtered"
  mv -- "${fixture}/filtered" "${fixture}/${script}"
done
rm -rf -- "${fixture}/src/skills/dough-story-decomposition" "${fixture}/src/skills/dough-story-refinement"
commit_all "${fixture}" 'release without story skills'
tag_release "${fixture}" 0.1.1 '2026-09-01T00:00:00'
older="${temporary_dir}/older"
checkout_tagged_release "${fixture}" "${older}" 0.1.1
write_candidate_payload "${fixture}" 0.1.2 with-stories
commit_all "${fixture}" 'promote story skills and references'
tag_release "${fixture}" 0.1.2 '2026-09-02T00:00:00'

for platform in codex cursor claude; do
  target="${temporary_dir}/${platform}"
  prepare_target "${target}"
  bash "${older}/install.sh" --target "${target}" --source "${fixture}" --platform "${platform}" > /dev/null
  # A new managed reference must not overwrite an unrelated pre-existing file.
  collision="${target}/.claude/skills/dough-story-refinement/references/planning.md"
  mkdir -p -- "${collision%/*}"
  printf '%s\n' 'Local planning guidance.' > "${collision}"
  before=$(snapshot_path_state "${target}")
  if bash "${helper}" apply --target "${target}" --platform "${platform}" > /dev/null 2>&1; then
    echo 'FAIL: candidate-only dependency overwrote local guidance.' >&2
    exit 1
  fi
  after=$(snapshot_path_state "${target}")
  [[ "${before}" == "${after}" ]]
  rm -- "${collision}"
  bash "${helper}" apply --target "${target}" --platform "${platform}" > /dev/null
  for root in .agents/skills .claude/skills; do
    assert_payload "${target}/${root}/dough-update" 0.1.2 with-stories
    [[ ! -e "${target}/${root}/dough-story-decomposition/RECOGNITION.md" ]]
    [[ ! -e "${target}/${root}/dough-story-refinement/RECOGNITION.md" ]]
    for managed_file in "${managed_files[@]}"; do
      [[ "${managed_file}" == dough-story-* ]] || continue
      sed -nE 's/.*\]\(([^)]+)\).*/\1/p' "${target}/${root}/${managed_file}" > "${temporary_dir}/links"
      while IFS= read -r link; do
        [[ -f "${target}/${root}/${managed_file%/*}/${link}" ]]
      done < "${temporary_dir}/links"
    done
  done
  # Each support file participates in both repeat-install and update checks.
  for reference in dough-story-decomposition/references/problem-decomposition.md \
    dough-story-decomposition/references/seed-format.md dough-story-refinement/references/planning.md; do
    for change in edit remove; do
      path="${target}/.claude/skills/${reference}"
      if [[ "${change}" == edit ]]; then
        printf '\nLocal edit\n' >> "${path}"
      else
        rm -- "${path}"
      fi
      before=$(snapshot_path_state "${target}")
      if bash "${helper}" apply --target "${target}" --platform "${platform}" > /dev/null 2>&1; then
        echo 'FAIL: changed reference accepted by ordinary update.' >&2
        exit 1
      fi
      if bash "${fixture}/install.sh" --target "${target}" --source "${fixture}" --platform "${platform}" > /dev/null 2>&1; then
        echo 'FAIL: changed reference accepted by repeat install.' >&2
        exit 1
      fi
      after=$(snapshot_path_state "${target}")
      [[ "${before}" == "${after}" ]]
      bash "${helper}" apply --target "${target}" --platform "${platform}" --force > /dev/null
      assert_payload "${target}/.claude/skills/dough-update" 0.1.2 with-stories
    done
  done
  assert_sentinels "${target}"
done

echo 'PASS: all entry contexts upgrade older payloads with story dependencies, refuse edited or missing references without writes, and restore them by explicit force.'
