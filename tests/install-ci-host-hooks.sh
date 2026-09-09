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

assert_unsafe_destination_refused() {
  local target=$1 outside=$2 description=$3 option output
  local target_before outside_before succeeded

  for option in ordinary force; do
    target_before=$(snapshot_path_state "${target}")
    outside_before=$(snapshot_path_state "${outside}")
    if [[ "${option}" == ordinary ]]; then
      output=$(bash "${source_dir}/install.sh" --target "${target}" \
        --source "${source_dir}" 2>&1) && succeeded=1 || succeeded=0
    else
      output=$(bash "${source_dir}/install.sh" --target "${target}" \
        --source "${source_dir}" --force 2>&1) && succeeded=1 || succeeded=0
    fi
    if [[ ${succeeded} -eq 1 ]]; then
      echo "FAIL: ${description} must refuse ${option} installation before writes." >&2
      exit 1
    fi
    [[ "${output}" == *'unsafe-hooks-destination'* ]]
    [[ $(snapshot_path_state "${target}") == "${target_before}" ]]
    [[ $(snapshot_path_state "${outside}") == "${outside_before}" ]]
  done
}

assert_managed_conflict_refused() {
  local target=$1 description=$2 option output
  local before succeeded

  before=$(snapshot_path_state "${target}")
  for option in ordinary force; do
    if [[ "${option}" == ordinary ]]; then
      output=$(bash "${source_dir}/install.sh" --target "${target}" \
        --source "${source_dir}" 2>&1) && succeeded=1 || succeeded=0
    else
      output=$(bash "${source_dir}/install.sh" --target "${target}" \
        --source "${source_dir}" --force 2>&1) && succeeded=1 || succeeded=0
    fi
    if [[ ${succeeded} -eq 1 ]]; then
      echo "FAIL: ${description} must refuse ${option} installation before writes." >&2
      exit 1
    fi
    [[ "${output}" == *'conflicting-managed-hooks'* ]]
    [[ $(snapshot_path_state "${target}") == "${before}" ]]
  done
}

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

# An absent settings file is a safe destination and is created normally.
missing_file_target="${temporary_dir}/missing-file"
prepare_target "${missing_file_target}"
seed_mergeable_host_settings "${missing_file_target}"
rm -- "${missing_file_target}/.cursor/hooks.json"
output=$(bash "${source_dir}/install.sh" --target "${missing_file_target}" --source "${source_dir}")
[[ "${output}" == *'hooks: registered Open Dough entries in .cursor/hooks.json.'* ]]
[[ "${output}" == *'hooks: registered Open Dough entries in .claude/settings.json.'* ]]
assert_cursor_managed_commands "${missing_file_target}"
node - "${missing_file_target}/.claude/settings.json" << 'EOF'
const fs = require("node:fs");
const settings = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
if (settings.sentinel !== "keep Claude settings") {
  console.error("FAIL: Claude settings changed while repairing missing Cursor settings.");
  process.exit(1);
}
EOF
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

# A known managed script with local arguments remains managed and conflicts.
local_argument_target="${temporary_dir}/local-argument"
prepare_target "${local_argument_target}"
seed_managed_command_with_local_argument "${local_argument_target}"
assert_managed_conflict_refused "${local_argument_target}" \
  'managed command with a local argument'

# A known managed command followed by a tab or a shell separator is still the
# known command invoked with edited arguments, for both hosts and under both
# ordinary and force installation. Recognizing these suffix delimiters is R6's
# fix; a normal-space suffix alone (above) did not cover this boundary.
for host in cursor claude; do
  for variant in tab semicolon; do
    if [[ "${variant}" == tab ]]; then
      suffix=$'\t--local'
    else
      suffix='; true'
    fi
    suffix_target="${temporary_dir}/${host}-${variant}-suffix"
    prepare_target "${suffix_target}"
    seed_managed_command_with_suffix "${suffix_target}" "${host}" "${suffix}"
    assert_managed_conflict_refused "${suffix_target}" \
      "managed ${host} command with a ${variant} suffix"
  done
done

# A distinct script that only shares the managed command as a name prefix
# (no delimiter boundary, e.g. a genuinely different script name) is unrelated
# and must not block installation or be treated as an edited managed variant.
for host in cursor claude; do
  similar_prefix_target="${temporary_dir}/${host}-similar-prefix"
  prepare_target "${similar_prefix_target}"
  seed_similarly_named_unmanaged_script "${similar_prefix_target}" "${host}"
  output=$(bash "${source_dir}/install.sh" --target "${similar_prefix_target}" --source "${source_dir}")
  [[ "${output}" == *'hooks: registered Open Dough entries in .cursor/hooks.json.'* ]]
  [[ "${output}" == *'hooks: registered Open Dough entries in .claude/settings.json.'* ]]
  assert_managed_host_hooks "${similar_prefix_target}"
  assert_unrelated_preserved "${similar_prefix_target}"
  node - "${similar_prefix_target}" "${host}" << 'EOF'
const fs = require("node:fs");
const [target, host] = process.argv.slice(2);
const path = host === "cursor" ? `${target}/.cursor/hooks.json` : `${target}/.claude/settings.json`;
const doc = JSON.parse(fs.readFileSync(path, "utf8"));
const found = host === "cursor"
  ? doc.hooks.stop?.some((entry) => entry.command?.endsWith("-extra"))
  : doc.hooks.Stop?.some((wrapper) => wrapper.hooks?.some((hook) => hook.command?.endsWith("-extra")));
if (!found) {
  console.error(`FAIL: ${host} similarly-named unmanaged script was not preserved.`);
  process.exit(1);
}
EOF
done

# Duplicate exact managed entries are ambiguous ownership, not adoption.
duplicate_target="${temporary_dir}/duplicate"
prepare_target "${duplicate_target}"
seed_duplicate_exact_managed_entry "${duplicate_target}"
assert_managed_conflict_refused "${duplicate_target}" \
  'duplicate exact managed entries'

# A managed Claude handler under a narrower matcher cannot be adopted.
matcher_target="${temporary_dir}/managed-read-matcher"
prepare_target "${matcher_target}"
seed_claude_managed_read_matcher "${matcher_target}"
assert_managed_conflict_refused "${matcher_target}" \
  'managed Claude handler under matcher Read'

# A valid settings-file symlink remains unsafe and refuses before writes.
unsafe_target="${temporary_dir}/unsafe"
prepare_target "${unsafe_target}"
seed_mergeable_host_settings "${unsafe_target}"
outside="${temporary_dir}/unsafe-outside"
mkdir -p -- "${outside}"
mv -- "${unsafe_target}/.claude/settings.json" "${outside}/settings.json"
ln -s -- "${outside}/settings.json" "${unsafe_target}/.claude/settings.json"
assert_unsafe_destination_refused "${unsafe_target}" "${outside}" 'valid settings-file symlink'

# Dangling settings-file links for both hosts are inspected as links, not absences.
for host in cursor claude; do
  dangling_target="${temporary_dir}/dangling-${host}-file"
  dangling_outside="${temporary_dir}/dangling-${host}-outside"
  prepare_target "${dangling_target}"
  seed_mergeable_host_settings "${dangling_target}"
  mkdir -p -- "${dangling_outside}"
  if [[ "${host}" == cursor ]]; then
    rm -- "${dangling_target}/.cursor/hooks.json"
    ln -s -- "${dangling_outside}/missing-hooks.json" \
      "${dangling_target}/.cursor/hooks.json"
  else
    rm -- "${dangling_target}/.claude/settings.json"
    ln -s -- "${dangling_outside}/missing-settings.json" \
      "${dangling_target}/.claude/settings.json"
  fi
  assert_unsafe_destination_refused "${dangling_target}" "${dangling_outside}" \
    "dangling ${host} settings-file symlink"
done

# A dangling host-settings parent is likewise refused before payload or outside writes.
dangling_parent_target="${temporary_dir}/dangling-parent"
dangling_parent_outside="${temporary_dir}/dangling-parent-outside"
prepare_target "${dangling_parent_target}"
mkdir -p -- "${dangling_parent_outside}"
mv -- "${dangling_parent_target}/.claude" \
  "${dangling_parent_target}/preserved-claude-directory"
ln -s -- "${dangling_parent_outside}/missing-claude-directory" \
  "${dangling_parent_target}/.claude"
assert_unsafe_destination_refused "${dangling_parent_target}" \
  "${dangling_parent_outside}" 'dangling host-settings parent symlink'

echo 'PASS: installer adopts only one exact unscoped managed registration while preserving unrelated handlers and matcher siblings; creates missing settings files; refuses malformed, edited, argument-extended, tab-suffixed, semicolon-suffixed, duplicate, matcher-scoped, valid-symlink, and dangling-symlink settings without target or outside mutation while leaving a genuinely different similarly-prefixed script unrelated; --force cannot clobber shared settings; a conflict in one host blocks both.'
