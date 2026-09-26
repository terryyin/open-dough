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

# Installation with OPTION ('' or --force) refuses for REASON before any write
# to TARGET or, when named, OUTSIDE.
assert_refused_with() {
  local option=$1 reason=$2 description=$3 target=$4 outside=${5:-} output
  local target_before outside_before=''

  target_before=$(snapshot_path_state "${target}")
  [[ -z ${outside} ]] || outside_before=$(snapshot_path_state "${outside}")
  if output=$(bash "${source_dir}/install.sh" --target "${target}" \
    --source "${source_dir}" ${option:+"${option}"} 2>&1); then
    echo "FAIL: ${description} must refuse ${option:-ordinary} installation before writes." >&2
    exit 1
  fi
  [[ "${output}" == *"${reason}"* ]]
  [[ $(snapshot_path_state "${target}") == "${target_before}" ]]
  [[ -z ${outside} || $(snapshot_path_state "${outside}") == "${outside_before}" ]]
}

# Ordinary installation refuses for REASON before any write. The preflight
# runs whether or not --force is given, so each refusal reason's force case
# is proved once, by assert_install_refused_even_forced.
assert_install_refused() {
  assert_refused_with '' "$@"
}

# Ordinary and forced installation both refuse for REASON before any write.
assert_install_refused_even_forced() {
  assert_refused_with '' "$@"
  assert_refused_with --force "$@"
}

# Unrelated event handlers and matcher siblings merge without duplicates.
merge_target="${temporary_dir}/merge"
prepare_target "${merge_target}"
seed_mergeable_host_settings "${merge_target}"
output=$(bash "${source_dir}/install.sh" --target "${merge_target}" --source "${source_dir}" --platform cursor)
[[ "${output}" == *'hooks: registered Open Dough entries in .cursor/hooks.json.'* ]]
[[ "${output}" == *'hooks: registered Open Dough entries in .claude/settings.json.'* ]]
[[ "${output}" == *'hooks: registered Open Dough entries in .codex/hooks.json.'* ]]
assert_managed_host_hooks "${merge_target}"
assert_unrelated_preserved "${merge_target}"

# Exact prior manual registration is adopted; repeat install leaves settings unwritten.
manual_target="${temporary_dir}/manual"
prepare_target "${manual_target}"
seed_exact_manual_registration "${manual_target}"
output=$(bash "${source_dir}/install.sh" --target "${manual_target}" --source "${source_dir}")
[[ "${output}" == *'hooks: all host registrations already current; left unwritten.'* ]]
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
codex_before=$(shasum -a 256 "${manual_target}/.codex/hooks.json")
repeat_output=$(bash "${source_dir}/install.sh" --target "${manual_target}" --source "${source_dir}")
[[ "${repeat_output}" == *'already current; left unwritten.'* ]]
[[ $(shasum -a 256 "${manual_target}/.cursor/hooks.json") == "${cursor_before}" ]]
[[ $(shasum -a 256 "${manual_target}/.claude/settings.json") == "${claude_before}" ]]
[[ $(shasum -a 256 "${manual_target}/.codex/hooks.json") == "${codex_before}" ]]
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

# Edited managed timeout/command conflicts; conflict in one host blocks both,
# and --force for managed skill payloads still cannot clobber the settings.
conflict_target="${temporary_dir}/conflict"
prepare_target "${conflict_target}"
seed_edited_managed_timeout "${conflict_target}"
assert_install_refused_even_forced conflicting-managed-hooks 'edited managed handler' \
  "${conflict_target}"

# A known managed script with local arguments remains managed and conflicts.
local_argument_target="${temporary_dir}/local-argument"
prepare_target "${local_argument_target}"
seed_managed_command_with_local_argument "${local_argument_target}"
assert_install_refused conflicting-managed-hooks \
  'managed command with a local argument' "${local_argument_target}"

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
    assert_install_refused conflicting-managed-hooks \
      "managed ${host} command with a ${variant} suffix" "${suffix_target}"
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
assert_install_refused conflicting-managed-hooks \
  'duplicate exact managed entries' "${duplicate_target}"

# A managed Claude handler under a narrower matcher cannot be adopted.
matcher_target="${temporary_dir}/managed-read-matcher"
prepare_target "${matcher_target}"
seed_claude_managed_read_matcher "${matcher_target}"
assert_install_refused conflicting-managed-hooks \
  'managed Claude handler under matcher Read' "${matcher_target}"

# A valid settings-file symlink remains unsafe and refuses before writes.
unsafe_target="${temporary_dir}/unsafe"
prepare_target "${unsafe_target}"
seed_mergeable_host_settings "${unsafe_target}"
outside="${temporary_dir}/unsafe-outside"
mkdir -p -- "${outside}"
mv -- "${unsafe_target}/.claude/settings.json" "${outside}/settings.json"
ln -s -- "${outside}/settings.json" "${unsafe_target}/.claude/settings.json"
assert_install_refused_even_forced unsafe-hooks-destination 'valid settings-file symlink' \
  "${unsafe_target}" "${outside}"

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
  assert_install_refused unsafe-hooks-destination \
    "dangling ${host} settings-file symlink" "${dangling_target}" "${dangling_outside}"
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
assert_install_refused unsafe-hooks-destination \
  'dangling host-settings parent symlink' "${dangling_parent_target}" \
  "${dangling_parent_outside}"
