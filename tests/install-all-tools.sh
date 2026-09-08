#!/usr/bin/env bash
# shellcheck disable=SC2312
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

assert_all_roots() {
  local target=$1 version=$2 marker=$3 source=$4 platform dest
  for platform in codex claude; do
    dest=$(bash "${source_dir}/src/install/open-dough-release.sh" destination "${target}" "${platform}")
    if [[ -n "${marker}" ]]; then
      assert_payload "${dest}" "${version}" "${marker}"
    else
      cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${dest}/SKILL.md"
      cmp "${source_dir}/src/skills/dough-adr-awareness/SKILL.md" \
        "$(dirname -- "${dest}")/dough-adr-awareness/SKILL.md"
      [[ $(cat "${dest}/VERSION") == "${version}" ]]
    fi
    [[ $(cat "${dest}/SOURCE") == "${source}" ]]
  done
  assert_sentinels "${target}"
}

# Any entry context gives a clean project the same two physical roots and bytes.
for entry in codex cursor claude; do
  target="${temporary_dir}/fresh-${entry}"
  prepare_target "${target}"
  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --platform "${entry}" > /dev/null
  assert_all_roots "${target}" "$(cat "${source_dir}/VERSION")" '' "$(cd "${source_dir}" && pwd -P)"
done

# A sibling edit refuses the complete ordinary operation before any root changes;
# explicit force is the only recovery path.
conflict_target="${temporary_dir}/conflict"
prepare_target "${conflict_target}"
bash "${source_dir}/install.sh" --target "${conflict_target}" --source "${source_dir}" > /dev/null
printf '%s\n' edited > "${conflict_target}/.claude/skills/dough-update/SKILL.md"
before=$(snapshot_path_state "${conflict_target}")
if bash "${source_dir}/install.sh" --target "${conflict_target}" --source "${source_dir}" 2>&1; then
  echo 'FAIL: edited sibling must refuse ordinary all-tool installation.' >&2
  exit 1
fi
[[ $(snapshot_path_state "${conflict_target}") == "${before}" ]]
bash "${source_dir}/install.sh" --target "${conflict_target}" --source "${source_dir}" --force > /dev/null
assert_all_roots "${conflict_target}" "$(cat "${source_dir}/VERSION")" '' "$(cd "${source_dir}" && pwd -P)"

# A no-URL update from one old root restores missing shared integrations.
fixture="${temporary_dir}/fixture.git"
build_latest_fixture "${fixture}"
old_checkout="${temporary_dir}/release-0.1.1"
checkout_tagged_release "${fixture}" "${old_checkout}" 0.1.1
update_target="${temporary_dir}/update"
prepare_target "${update_target}"
bash "${old_checkout}/install.sh" --target "${update_target}" --source "${fixture}" --platform codex > /dev/null
bash "${source_dir}/src/install/open-dough-release.sh" apply --target "${update_target}" --platform codex > /dev/null
fixture_source=$(cd "${fixture}" && pwd -P)
assert_all_roots "${update_target}" 0.1.10 payload-0.1.10 "${fixture_source}"

echo 'PASS: each entry context installs the two shared roots; ordinary conflicts stop before writes; force repairs them; and one-root update restores missing integrations.'
