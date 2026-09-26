#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2154 # Sourced fixtures provide managed_files and helpers.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/tests/helpers/release-fixture.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
reference=dough-execution-retrospective/references/bounded-process-log.md
fixture="${temporary_dir}/source"
helper="${source_dir}/src/install/open-dough-release.sh"
mkdir -p -- "${fixture}"
git -C "${fixture}" init --quiet -b main
configure_fixture_git "${fixture}"
write_candidate_payload "${fixture}" 0.1.1 missing-reference
# The earlier release shipped the skill with a dangling link, omitting only
# this reference from its install.sh declaration (the source file itself
# existed).
sed '/dough-execution-retrospective\/references\/bounded-process-log.md/d' \
  "${fixture}/install.sh" > "${fixture}/filtered"
mv -- "${fixture}/filtered" "${fixture}/install.sh"
commit_all "${fixture}" 'release with omitted retrospective reference'
tag_release "${fixture}" 0.1.1 '2026-09-01T00:00:00'
older="${temporary_dir}/older"
checkout_tagged_release "${fixture}" "${older}" 0.1.1
write_candidate_payload "${fixture}" 0.1.2 with-reference
commit_all "${fixture}" 'ship retrospective reference'
tag_release "${fixture}" 0.1.2 '2026-09-02T00:00:00'

assert_reference_links() {
  local target=$1 root file link
  for root in .agents/skills .claude/skills; do
    cmp "${source_dir}/src/skills/${reference}" "${target}/${root}/${reference}"
    for file in dough-execution-retrospective/SKILL.md "${reference}"; do
      sed -nE 's/.*\]\(([^)]+)\).*/\1/p' "${target}/${root}/${file}" > "${temporary_dir}/links"
      while IFS= read -r link; do
        link=${link%%#*}
        [[ -n "${link}" ]] || continue
        [[ -f "${target}/${root}/${file%/*}/${link}" ]]
      done < "${temporary_dir}/links"
    done
  done
}

printf '%s\n' '{"skipProcessRetrospective":false,"sentinel":"keep"}' > "${temporary_dir}/preferences"
# The codex and cursor hints select the same .agents entry root, so cursor
# represents both; claude reads the .claude entry root.
for platform in cursor claude; do
  target="${temporary_dir}/upgrade ${platform}"
  prepare_target "${target}"
  cp -- "${temporary_dir}/preferences" "${target}/open-dough.json"
  bash "${older}/install.sh" --target "${target}" --source "${fixture}" --platform "${platform}" > /dev/null
  for root in .agents/skills .claude/skills; do
    [[ ! -e "${target}/${root}/${reference}" ]]
  done
  # A source-only reference was not owned by the old installation; refuse
  # an unrelated local file at that path before replacing either root.
  collision="${target}/.claude/skills/${reference}"
  mkdir -p -- "${collision%/*}"
  printf '%s\n' 'Local reference; keep it.' > "${collision}"
  before=$(snapshot_path_state "${target}")
  if bash "${helper}" apply --target "${target}" --platform "${platform}" > /dev/null 2>&1; then
    echo 'FAIL: ordinary update overwrote an unmanaged reference collision.' >&2
    exit 1
  fi
  after=$(snapshot_path_state "${target}")
  [[ "${after}" == "${before}" ]]
  rm -- "${collision}"
  bash "${helper}" apply --target "${target}" --platform "${platform}" > /dev/null
  for root in .agents/skills .claude/skills; do
    assert_payload "${target}/${root}/dough-update" 0.1.2 with-reference
  done
  assert_reference_links "${target}"
  cmp "${temporary_dir}/preferences" "${target}/open-dough.json"
  assert_sentinels "${target}"
  # Protection of edited or removed managed files, driven by the one install.sh
  # declaration for every file, is owned by story-payload-update.sh.
done

# A missing or malformed historical declaration must not turn all paths into
# apparently unmanaged files when verifying an empty root.
empty_root="${temporary_dir}/empty/dough-update"
mkdir -p -- "${empty_root}"
rm -- "${older}/install.sh"
for declaration in missing malformed; do
  if [[ "${declaration}" == malformed ]]; then
    printf '%s\n' 'managed_files=(' '  dough-update/SKILL.md' > "${older}/install.sh"
  fi
  if output=$(bash "${helper}" compare-payload "${empty_root}" "${older}" 2>&1); then
    echo "FAIL: accepted ${declaration} historical payload declaration." >&2
    exit 1
  fi
  [[ "${output}" == *'Cannot read managed payload declaration:'* ]]
done
