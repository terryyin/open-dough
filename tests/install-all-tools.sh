#!/usr/bin/env bash
# shellcheck disable=SC2312
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/release-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/host-hooks-fixture.bash"

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
      cmp "${source_dir}/src/skills/dough-product-backlog/SKILL.md" \
        "$(dirname -- "${dest}")/dough-product-backlog/SKILL.md"
      cmp "${source_dir}/src/skills/dough-execution-retrospective/SKILL.md" \
        "$(dirname -- "${dest}")/dough-execution-retrospective/SKILL.md"
      cmp "${source_dir}/src/skills/dough-story-wrap-up/SKILL.md" \
        "$(dirname -- "${dest}")/dough-story-wrap-up/SKILL.md"
      [[ $(cat "${dest}/VERSION") == "${version}" ]]
    fi
    [[ $(cat "${dest}/SOURCE") == "${source}" ]]
  done
  assert_sentinels "${target}"
}

assert_no_git_commit() {
  local target=$1
  local before=$2
  if [[ ! -d "${target}/.git" ]]; then
    echo "FAIL: expected a git repository for commit checks." >&2
    exit 1
  fi
  local after
  after=$(git -C "${target}" rev-parse HEAD)
  # HEAD must stay put; uncommitted settings/skills after install are expected.
  [[ "${after}" == "${before}" ]]
}

snapshot_payload_mtimes() {
  local target=$1 root path relative
  for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
    while IFS= read -r -d '' path; do
      relative=${path#"${target}/"}
      printf '%s\t%s\n' "${relative}" "$(file_mtime "${path}")"
    done < <(find "${root}" -type f -print0 | LC_ALL=C sort -z)
  done
}

assert_payload_unchanged() {
  local target=$1 agents_state_before=$2 claude_state_before=$3
  local mtimes_before=$4 label=$5 mtimes_after
  if [[ $(snapshot_path_state "${target}/.agents/skills") != "${agents_state_before}" ]] \
    || [[ $(snapshot_path_state "${target}/.claude/skills") != "${claude_state_before}" ]]; then
    echo "FAIL: ${label}: managed payload bytes changed." >&2
    exit 1
  fi
  mtimes_after=$(snapshot_payload_mtimes "${target}")
  if [[ "${mtimes_after}" != "${mtimes_before}" ]]; then
    echo "FAIL: ${label}: managed payload mtimes changed." >&2
    exit 1
  fi
}

# Any entry context gives a clean project the same two physical roots, bytes,
# and both native hook registrations (including a path with spaces).
for entry in codex cursor claude; do
  target="${temporary_dir}/fresh ${entry}"
  prepare_target "${target}"
  seed_empty_host_settings "${target}"
  git -C "${target}" init --quiet
  git -C "${target}" config user.email 'fixture@example.com'
  git -C "${target}" config user.name 'Open Dough Fixture'
  git -C "${target}" add -A
  git -C "${target}" commit --quiet -m 'baseline before install'
  head_before=$(git -C "${target}" rev-parse HEAD)
  output=$(bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --platform "${entry}")
  [[ "${output}" == *'hooks: registered Open Dough entries in .cursor/hooks.json.'* ]]
  [[ "${output}" == *'hooks: registered Open Dough entries in .claude/settings.json.'* ]]
  assert_all_roots "${target}" "$(cat "${source_dir}/VERSION")" '' "$(cd "${source_dir}" && pwd -P)"
  assert_managed_host_hooks "${target}"
  assert_no_git_commit "${target}" "${head_before}"

  agents_payload_state=$(snapshot_path_state "${target}/.agents/skills")
  claude_payload_state=$(snapshot_path_state "${target}/.claude/skills")
  payload_mtimes=$(snapshot_payload_mtimes "${target}")
  if [[ "${entry}" == claude ]]; then
    rm -- "${target}/.cursor/hooks.json"
  else
    remove_one_cursor_managed_entry "${target}"
  fi

  # Repeat installation repairs missing registration without rewriting payload.
  repeat_output=$(bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --platform "${entry}")
  [[ "${repeat_output}" == *'already current; left unwritten.'* ]]
  [[ "${repeat_output}" == *'hooks: registered Open Dough entries in .cursor/hooks.json.'* ]]
  assert_payload_unchanged "${target}" "${agents_payload_state}" "${claude_payload_state}" \
    "${payload_mtimes}" \
    "${entry} repeat-install hook repair"
  if [[ "${entry}" == claude ]]; then
    [[ $(node "${source_dir}/src/install/open-dough-register-hooks.mjs" status \
      "${target}" "${source_dir}") == complete ]]
    assert_cursor_managed_commands "${target}"
  else
    assert_managed_host_hooks "${target}"
  fi
  assert_no_git_commit "${target}" "${head_before}"

  # Once repaired, another installation is a full no-op, including mtimes.
  target_before=$(snapshot_path_state "${target}")
  payload_mtimes=$(snapshot_payload_mtimes "${target}")
  cursor_mtime=$(file_mtime "${target}/.cursor/hooks.json")
  claude_mtime=$(file_mtime "${target}/.claude/settings.json")
  final_output=$(bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --platform "${entry}")
  [[ "${final_output}" == *'already current; left unwritten.'* ]]
  [[ "${final_output}" == *'hooks: both host registrations already current; left unwritten.'* ]]
  [[ $(snapshot_path_state "${target}") == "${target_before}" ]]
  assert_payload_unchanged "${target}" "${agents_payload_state}" "${claude_payload_state}" \
    "${payload_mtimes}" \
    "${entry} final repeat-install no-op"
  [[ $(file_mtime "${target}/.cursor/hooks.json") == "${cursor_mtime}" ]]
  [[ $(file_mtime "${target}/.claude/settings.json") == "${claude_mtime}" ]]
  assert_no_git_commit "${target}" "${head_before}"
done

# A sibling edit refuses the complete ordinary operation before any root changes;
# explicit force is the only recovery path. Exact managed hooks stay unduplicated.
conflict_target="${temporary_dir}/conflict"
prepare_target "${conflict_target}"
seed_empty_host_settings "${conflict_target}"
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
assert_managed_host_hooks "${conflict_target}"

# Preflight malformed or unsafe settings before writes.
malformed_target="${temporary_dir}/malformed"
prepare_target "${malformed_target}"
mkdir -p -- "${malformed_target}/.cursor"
printf '%s\n' 'not-json' > "${malformed_target}/.cursor/hooks.json"
before=$(snapshot_path_state "${malformed_target}")
if output=$(bash "${source_dir}/install.sh" --target "${malformed_target}" --source "${source_dir}" 2>&1); then
  echo 'FAIL: malformed hooks settings must refuse before writes.' >&2
  exit 1
fi
[[ "${output}" == *'malformed-hooks-settings'* ]]
[[ $(snapshot_path_state "${malformed_target}") == "${before}" ]]
[[ ! -e "${malformed_target}/.agents/skills/dough-update" ]]
[[ ! -e "${malformed_target}/.claude/skills/dough-update" ]]

# Current payload roots do not bypass malformed settings preflight.
current_malformed_target="${temporary_dir}/current-malformed"
prepare_target "${current_malformed_target}"
seed_empty_host_settings "${current_malformed_target}"
bash "${source_dir}/install.sh" --target "${current_malformed_target}" \
  --source "${source_dir}" > /dev/null
printf '%s\n' 'not-json' > "${current_malformed_target}/.cursor/hooks.json"
current_malformed_before=$(snapshot_path_state "${current_malformed_target}")
current_malformed_mtimes=$(snapshot_payload_mtimes "${current_malformed_target}")
current_malformed_settings_mtime=$(file_mtime "${current_malformed_target}/.cursor/hooks.json")
if output=$(bash "${source_dir}/install.sh" --target "${current_malformed_target}" \
  --source "${source_dir}" 2>&1); then
  echo 'FAIL: current roots must not skip malformed hooks preflight.' >&2
  exit 1
fi
[[ "${output}" == *'malformed-hooks-settings'* ]]
[[ $(snapshot_path_state "${current_malformed_target}") == "${current_malformed_before}" ]]
[[ $(snapshot_payload_mtimes "${current_malformed_target}") == "${current_malformed_mtimes}" ]]
[[ $(file_mtime "${current_malformed_target}/.cursor/hooks.json") == "${current_malformed_settings_mtime}" ]]

# Current payload roots also retain the managed-registration conflict policy.
current_conflict_target="${temporary_dir}/current-conflict"
prepare_target "${current_conflict_target}"
seed_empty_host_settings "${current_conflict_target}"
bash "${source_dir}/install.sh" --target "${current_conflict_target}" \
  --source "${source_dir}" > /dev/null
seed_edited_managed_timeout "${current_conflict_target}"
current_conflict_before=$(snapshot_path_state "${current_conflict_target}")
current_conflict_mtimes=$(snapshot_payload_mtimes "${current_conflict_target}")
current_conflict_cursor_mtime=$(file_mtime "${current_conflict_target}/.cursor/hooks.json")
current_conflict_claude_mtime=$(file_mtime "${current_conflict_target}/.claude/settings.json")
if output=$(bash "${source_dir}/install.sh" --target "${current_conflict_target}" \
  --source "${source_dir}" 2>&1); then
  echo 'FAIL: current roots must not skip conflicting hooks preflight.' >&2
  exit 1
fi
[[ "${output}" == *'conflicting-managed-hooks'* ]]
[[ $(snapshot_path_state "${current_conflict_target}") == "${current_conflict_before}" ]]
[[ $(snapshot_payload_mtimes "${current_conflict_target}") == "${current_conflict_mtimes}" ]]
[[ $(file_mtime "${current_conflict_target}/.cursor/hooks.json") == "${current_conflict_cursor_mtime}" ]]
[[ $(file_mtime "${current_conflict_target}/.claude/settings.json") == "${current_conflict_claude_mtime}" ]]

unsafe_target="${temporary_dir}/unsafe"
prepare_target "${unsafe_target}"
outside="${temporary_dir}/unsafe-outside"
mkdir -p -- "${outside}" "${unsafe_target}/.cursor" "${unsafe_target}/.claude"
printf '%s\n' '{"hooks":{}}' > "${outside}/hooks.json"
ln -s -- "${outside}/hooks.json" "${unsafe_target}/.cursor/hooks.json"
printf '%s\n' '{"hooks":{},"sentinel":"keep Claude settings"}' > "${unsafe_target}/.claude/settings.json"
before=$(snapshot_path_state "${unsafe_target}")
if output=$(bash "${source_dir}/install.sh" --target "${unsafe_target}" --source "${source_dir}" 2>&1); then
  echo 'FAIL: unsafe hooks destination must refuse before writes.' >&2
  exit 1
fi
[[ "${output}" == *'unsafe-hooks-destination'* ]]
[[ $(snapshot_path_state "${unsafe_target}") == "${before}" ]]
[[ ! -e "${unsafe_target}/.agents/skills/dough-update" ]]

# Nonempty unrelated hooks are owned by tests/install-ci-host-hooks.sh (Slice 2).

# A no-URL update from one old root restores missing shared integrations.
fixture="${temporary_dir}/fixture.git"
build_latest_fixture "${fixture}"
old_checkout="${temporary_dir}/release-0.1.1"
checkout_tagged_release "${fixture}" "${old_checkout}" 0.1.1
update_target="${temporary_dir}/update"
prepare_target "${update_target}"
seed_empty_host_settings "${update_target}"
bash "${old_checkout}/install.sh" --target "${update_target}" --source "${fixture}" --platform codex > /dev/null
bash "${source_dir}/src/install/open-dough-release.sh" apply --target "${update_target}" --platform codex > /dev/null
fixture_source=$(cd "${fixture}" && pwd -P)
assert_all_roots "${update_target}" 0.1.10 payload-0.1.10 "${fixture_source}"
assert_managed_host_hooks "${update_target}"

echo 'PASS: each entry context installs the complete client payload in two shared roots with both native hooks; repeat installation repairs missing registrations without payload writes and then becomes a full no-op; current-root malformed/conflicting settings still refuse; force repairs payload conflicts; unsafe hooks refuse before mutation; and one-root update restores missing integrations.'
