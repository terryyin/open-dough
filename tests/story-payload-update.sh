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
fixture="${temporary_dir}/source"
helper="${source_dir}/src/install/open-dough-release.sh"
mkdir -p -- "${fixture}"
git -C "${fixture}" init --quiet -b main
configure_fixture_git "${fixture}"
write_candidate_payload "${fixture}" 0.1.1 before-stories
# Model a release before decomposition and refinement, including its declared payload.
sed '/dough-story-decomposition\//d; /dough-story-refinement\//d' "${fixture}/install.sh" > "${fixture}/filtered"
mv -- "${fixture}/filtered" "${fixture}/install.sh"
rm -rf -- "${fixture}/src/skills/dough-story-decomposition" "${fixture}/src/skills/dough-story-refinement"
commit_all "${fixture}" 'release without decomposition and refinement skills'
tag_release "${fixture}" 0.1.1 '2026-09-01T00:00:00'
older="${temporary_dir}/older"
checkout_tagged_release "${fixture}" "${older}" 0.1.1
write_candidate_payload "${fixture}" 0.1.2 with-stories
commit_all "${fixture}" 'promote story skills and references'
tag_release "${fixture}" 0.1.2 '2026-09-02T00:00:00'

# The codex and cursor hints select the same .agents entry root, so cursor
# represents both; claude reads the .claude entry root.
for platform in cursor claude; do
  target="${temporary_dir}/${platform}"
  prepare_target "${target}"
  write_project_configuration "${target}"
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
    for managed_file in "${managed_files[@]}"; do
      [[ "${managed_file}" == dough-story-* ]] || continue
      sed -nE 's/.*\]\(([^)]+)\).*/\1/p' "${target}/${root}/${managed_file}" > "${temporary_dir}/links"
      while IFS= read -r link; do
        link=${link%%#*}
        [[ -n "${link}" ]] || continue
        if [[ ! -f "${target}/${root}/${managed_file%/*}/${link}" ]]; then
          printf 'FAIL: missing installed story dependency: %s -> %s\n' \
            "${target}/${root}/${managed_file}" "${link}" >&2
          exit 1
        fi
      done < "${temporary_dir}/links"
    done
    assert_installed_publication_modules "${target}/${root}"
  done
  # Successful operations traverse the same physical roots for every entry hint,
  # so one representative owns payload protection. One
  # install.sh declaration drives protection for every managed file, so one
  # edited and one removed file (their branches differ) prove it for all; this
  # check is the suite's owner of sibling-root protection.
  if [[ "${platform}" == cursor ]]; then
    for protection_case in dough-story-decomposition/references/problem-decomposition.md:edit \
      dough-story-refinement/references/planning.md:remove; do
      reference=${protection_case%:*}
      change=${protection_case##*:}
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
  fi
  assert_sentinels "${target}"
  assert_project_configuration "${target}"
done
