#!/usr/bin/env bash
# Focused real-installer journey for merging CI host hooks beside existing settings.
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

# Unrelated event handlers and matcher siblings merge without duplicates.
merge_target="${temporary_dir}/merge"
prepare_target "${merge_target}"
seed_mergeable_host_settings "${merge_target}"
output=$(bash "${source_dir}/install.sh" --target "${merge_target}" --source "${source_dir}" --platform cursor)
[[ "${output}" == *'hooks: registered Open Dough entries in .cursor/hooks.json.'* ]]
[[ "${output}" == *'hooks: registered Open Dough entries in .claude/settings.json.'* ]]
assert_managed_host_hooks "${merge_target}"
assert_unrelated_preserved "${merge_target}"

# Exact prior manual registration is adopted; repeat install leaves settings unwritten.
manual_target="${temporary_dir}/manual"
prepare_target "${manual_target}"
seed_exact_manual_registration "${manual_target}"
output=$(bash "${source_dir}/install.sh" --target "${manual_target}" --source "${source_dir}")
[[ "${output}" == *'hooks: both host registrations already current; left unwritten.'* ]]
assert_managed_host_hooks "${manual_target}"
assert_unrelated_preserved "${manual_target}"
# Payload is new, so skill roots change; compare only settings files for no-op hooks.
cursor_before=$(shasum -a 256 "${manual_target}/.cursor/hooks.json")
claude_before=$(shasum -a 256 "${manual_target}/.claude/settings.json")
repeat_output=$(bash "${source_dir}/install.sh" --target "${manual_target}" --source "${source_dir}")
[[ "${repeat_output}" == *'already current; left unwritten.'* ]]
[[ $(shasum -a 256 "${manual_target}/.cursor/hooks.json") == "${cursor_before}" ]]
[[ $(shasum -a 256 "${manual_target}/.claude/settings.json") == "${claude_before}" ]]
assert_managed_host_hooks "${manual_target}"
assert_unrelated_preserved "${manual_target}"

# Malformed JSON refuses before any writes.
malformed_target="${temporary_dir}/malformed"
prepare_target "${malformed_target}"
seed_mergeable_host_settings "${malformed_target}"
printf '%s\n' 'not-json{' > "${malformed_target}/.claude/settings.json"
before=$(snapshot_path_state "${malformed_target}")
if output=$(bash "${source_dir}/install.sh" --target "${malformed_target}" --source "${source_dir}" 2>&1); then
  echo 'FAIL: malformed hooks settings must refuse before writes.' >&2
  exit 1
fi
[[ "${output}" == *'malformed-hooks-settings'* ]]
[[ $(snapshot_path_state "${malformed_target}") == "${before}" ]]
[[ ! -e "${malformed_target}/.agents/skills/dough-update" ]]
[[ ! -e "${malformed_target}/.claude/skills/dough-update" ]]

# Edited managed timeout/command conflicts; conflict in one host blocks both.
conflict_target="${temporary_dir}/conflict"
prepare_target "${conflict_target}"
seed_edited_managed_timeout "${conflict_target}"
before=$(snapshot_path_state "${conflict_target}")
if output=$(bash "${source_dir}/install.sh" --target "${conflict_target}" --source "${source_dir}" 2>&1); then
  echo 'FAIL: edited managed handler must refuse before writes.' >&2
  exit 1
fi
[[ "${output}" == *'conflicting-managed-hooks'* ]]
[[ $(snapshot_path_state "${conflict_target}") == "${before}" ]]
[[ ! -e "${conflict_target}/.agents/skills/dough-update" ]]
[[ ! -e "${conflict_target}/.claude/skills/dough-update" ]]

# --force for managed skill payloads still cannot clobber conflicting settings.
if output=$(bash "${source_dir}/install.sh" --target "${conflict_target}" --source "${source_dir}" --force 2>&1); then
  echo 'FAIL: --force must not override conflicting host hook settings.' >&2
  exit 1
fi
[[ "${output}" == *'conflicting-managed-hooks'* ]]
[[ $(snapshot_path_state "${conflict_target}") == "${before}" ]]

# Unsafe settings path refuses before writes.
unsafe_target="${temporary_dir}/unsafe"
prepare_target "${unsafe_target}"
seed_mergeable_host_settings "${unsafe_target}"
outside="${temporary_dir}/unsafe-outside"
mkdir -p -- "${outside}"
mv -- "${unsafe_target}/.claude/settings.json" "${outside}/settings.json"
ln -s -- "${outside}/settings.json" "${unsafe_target}/.claude/settings.json"
before=$(snapshot_path_state "${unsafe_target}")
if output=$(bash "${source_dir}/install.sh" --target "${unsafe_target}" --source "${source_dir}" 2>&1); then
  echo 'FAIL: unsafe hooks destination must refuse before writes.' >&2
  exit 1
fi
[[ "${output}" == *'unsafe-hooks-destination'* ]]
[[ $(snapshot_path_state "${unsafe_target}") == "${before}" ]]
[[ ! -e "${unsafe_target}/.agents/skills/dough-update" ]]

echo 'PASS: installer merges unrelated host hooks and exact manual registrations without duplicates; refuses malformed, conflicting, and unsafe settings without mutation; --force cannot clobber shared settings; a conflict in one host blocks both.'
