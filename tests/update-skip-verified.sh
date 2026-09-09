#!/usr/bin/env bash
# shellcheck disable=SC2312,SC2249
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
fixture="${temporary_dir}/fixture.git"
target="${temporary_dir}/target"
build_latest_fixture "${fixture}"
prepare_target "${target}"
seed_mergeable_host_settings "${target}"
helper="${source_dir}/src/install/open-dough-release.sh"
bash "${helper}" apply --url "${fixture}" --target "${target}" --platform cursor > /dev/null
assert_managed_host_hooks "${target}"
assert_unrelated_preserved "${target}"

agents_root="${target}/.agents/skills"
claude_root="${target}/.claude/skills"
dest="${agents_root}/dough-update"

capture_payload_baseline() {
  payload_snapshot=$(snapshot_path_state "${agents_root}")
  claude_payload_snapshot=$(snapshot_path_state "${claude_root}")
  version_mtime=$(file_mtime "${dest}/VERSION")
  source_mtime=$(file_mtime "${dest}/SOURCE")
  skill_mtime=$(file_mtime "${dest}/SKILL.md")
  version_bytes=$(shasum -a 256 "${dest}/VERSION")
  source_bytes=$(shasum -a 256 "${dest}/SOURCE")
  skill_bytes=$(shasum -a 256 "${dest}/SKILL.md")
}

assert_payload_unwritten() {
  local label=$1
  local path expected_mtime expected_bytes

  if [[ $(snapshot_path_state "${agents_root}") != "${payload_snapshot}" ]]; then
    echo "FAIL: ${label}: agents payload tree changed." >&2
    exit 1
  fi
  if [[ $(snapshot_path_state "${claude_root}") != "${claude_payload_snapshot}" ]]; then
    echo "FAIL: ${label}: Claude payload tree changed." >&2
    exit 1
  fi
  for path in VERSION SOURCE SKILL.md; do
    case "${path}" in
      VERSION)
        expected_mtime=${version_mtime}
        expected_bytes=${version_bytes}
        ;;
      SOURCE)
        expected_mtime=${source_mtime}
        expected_bytes=${source_bytes}
        ;;
      SKILL.md)
        expected_mtime=${skill_mtime}
        expected_bytes=${skill_bytes}
        ;;
    esac
    if [[ $(file_mtime "${dest}/${path}") != "${expected_mtime}" ]]; then
      echo "FAIL: ${label}: ${path} mtime changed." >&2
      exit 1
    fi
    if [[ $(shasum -a 256 "${dest}/${path}") != "${expected_bytes}" ]]; then
      echo "FAIL: ${label}: ${path} bytes changed." >&2
      exit 1
    fi
  done
}

capture_settings_baseline() {
  cursor_settings_mtime=$(file_mtime "${target}/.cursor/hooks.json")
  claude_settings_mtime=$(file_mtime "${target}/.claude/settings.json")
  cursor_settings_bytes=$(shasum -a 256 "${target}/.cursor/hooks.json")
  claude_settings_bytes=$(shasum -a 256 "${target}/.claude/settings.json")
}

assert_settings_unwritten() {
  local label=$1

  if [[ $(file_mtime "${target}/.cursor/hooks.json") != "${cursor_settings_mtime}" ]] \
    || [[ $(shasum -a 256 "${target}/.cursor/hooks.json") != "${cursor_settings_bytes}" ]]; then
    echo "FAIL: ${label}: Cursor settings bytes or mtime changed." >&2
    exit 1
  fi
  if [[ $(file_mtime "${target}/.claude/settings.json") != "${claude_settings_mtime}" ]] \
    || [[ $(shasum -a 256 "${target}/.claude/settings.json") != "${claude_settings_bytes}" ]]; then
    echo "FAIL: ${label}: Claude settings bytes or mtime changed." >&2
    exit 1
  fi
}

assert_full_noop() {
  local label=$1
  local output_file=$2
  local trace_file=$3
  local before

  capture_payload_baseline
  capture_settings_baseline
  before=$(snapshot_path_state "${target}")
  : > "${trace_file}"
  OPEN_DOUGH_TRACE="${trace_file}" bash "${helper}" apply --target "${target}" --platform cursor \
    > "${output_file}"
  [[ $(snapshot_path_state "${target}") == "${before}" ]]
  assert_payload_unwritten "${label}"
  assert_settings_unwritten "${label}"
  grep -Fq 'both physical installations are current; no installer invocation or installed-file writes.' \
    "${output_file}"
  grep -qx "apply-skip-equal ${dest}" "${trace_file}"
  if grep -qE '^(install |apply-hooks-repair )' "${trace_file}"; then
    echo "FAIL: ${label}: complete install must remain a no-write skip." >&2
    exit 1
  fi
}

assert_hooks_repaired_without_payload_writes() {
  local label=$1
  local output_file=$2
  local trace_file=$3

  assert_payload_unwritten "${label}"
  grep -Fq 'restored missing host hook registration without rewriting managed payload files' \
    "${output_file}"
  grep -qx "apply-hooks-repair ${dest}" "${trace_file}"
  if grep -q '^install ' "${trace_file}"; then
    echo "FAIL: ${label}: repair must not invoke the payload installer." >&2
    exit 1
  fi
}

# Intact complete install remains a full no-op.
trace="${temporary_dir}/trace-intact"
assert_full_noop 'intact current install' "${temporary_dir}/output-intact" "${trace}"
echo 'PASS: intact verified current install skips without target writes.'

# Semantically identical registrations stay unwritten despite compact JSON and
# reversed object-key order throughout managed handlers and unrelated settings.
node - "${target}" << 'EOF'
const fs = require("node:fs");
const target = process.argv[2];

function reverseObjectKeys(value) {
  if (Array.isArray(value)) {
    return value.map(reverseObjectKeys);
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value)
      .reverse()
      .map(([key, nested]) => [key, reverseObjectKeys(nested)]),
  );
}

for (const relativePath of [".cursor/hooks.json", ".claude/settings.json"]) {
  const path = `${target}/${relativePath}`;
  const document = JSON.parse(fs.readFileSync(path, "utf8"));
  fs.writeFileSync(path, JSON.stringify(reverseObjectKeys(document)));
}
EOF
assert_managed_host_hooks "${target}"
assert_unrelated_preserved "${target}"
# A canonicalizing write would now visibly change both bytes and mtimes.
sleep 1
trace="${temporary_dir}/trace-semantic-noop"
assert_full_noop \
  'semantically complete noncanonical settings' \
  "${temporary_dir}/output-semantic-noop" \
  "${trace}"
echo 'PASS: semantically complete noncanonical settings remain wholly unwritten.'

# Missing managed entry restores only settings; payload records stay unwritten.
capture_payload_baseline
cursor_complete=$(shasum -a 256 "${target}/.cursor/hooks.json")
remove_one_cursor_managed_entry "${target}"
[[ $(shasum -a 256 "${target}/.cursor/hooks.json") != "${cursor_complete}" ]]
# Ensure mtime can move on settings write without colliding with payload checks.
sleep 1
trace="${temporary_dir}/trace-missing-entry"
: > "${trace}"
OPEN_DOUGH_TRACE="${trace}" bash "${helper}" apply --target "${target}" --platform cursor \
  > "${temporary_dir}/output-missing-entry"
assert_hooks_repaired_without_payload_writes \
  'missing managed entry' "${temporary_dir}/output-missing-entry" "${trace}"
[[ $(shasum -a 256 "${target}/.cursor/hooks.json") == "${cursor_complete}" ]]
assert_managed_host_hooks "${target}"
assert_unrelated_preserved "${target}"
echo 'PASS: missing managed entry restores only host registration.'

# Re-run repaired target proves a full no-op.
trace="${temporary_dir}/trace-repaired-noop"
assert_full_noop 'repaired then complete' "${temporary_dir}/output-repaired-noop" "${trace}"
echo 'PASS: repaired target is a full no-op on the next ordinary update.'

# Missing settings file restores registration without payload writes.
claude_before_missing_file=$(shasum -a 256 "${target}/.claude/settings.json")
rm -f -- "${target}/.cursor/hooks.json"
capture_payload_baseline
sleep 1
trace="${temporary_dir}/trace-missing-file"
: > "${trace}"
OPEN_DOUGH_TRACE="${trace}" bash "${helper}" apply --target "${target}" --platform cursor \
  > "${temporary_dir}/output-missing-file"
assert_hooks_repaired_without_payload_writes \
  'missing hooks file' "${temporary_dir}/output-missing-file" "${trace}"
[[ -f "${target}/.cursor/hooks.json" ]]
[[ $(shasum -a 256 "${target}/.claude/settings.json") == "${claude_before_missing_file}" ]]
assert_cursor_managed_commands "${target}"
echo 'PASS: missing hooks file restores only host registration.'

# Conflicting modified managed entry refuses without writes.
seed_edited_managed_timeout "${target}"
capture_payload_baseline
before_conflict=$(snapshot_path_state "${target}")
cursor_conflict_bytes=$(shasum -a 256 "${target}/.cursor/hooks.json")
claude_conflict_bytes=$(shasum -a 256 "${target}/.claude/settings.json")
trace="${temporary_dir}/trace-conflict"
: > "${trace}"
if output=$(OPEN_DOUGH_TRACE="${trace}" bash "${helper}" apply --target "${target}" \
  --platform cursor 2>&1); then
  echo 'FAIL: conflicting managed hooks must refuse ordinary equal-version update.' >&2
  printf '%s\n' "${output}" >&2
  exit 1
fi
[[ "${output}" == *'conflicting-managed-hooks'* ]]
[[ "${output}" == *'Outcome: refused; preserved the selected installation.'* ]]
grep -qx "apply-hooks-conflict ${dest}" "${trace}"
if grep -qE '^(install |apply-hooks-repair )' "${trace}"; then
  echo 'FAIL: hook conflict must not install or repair.' >&2
  exit 1
fi
[[ $(snapshot_path_state "${target}") == "${before_conflict}" ]]
assert_payload_unwritten 'conflicting managed hooks'
[[ $(shasum -a 256 "${target}/.cursor/hooks.json") == "${cursor_conflict_bytes}" ]]
[[ $(shasum -a 256 "${target}/.claude/settings.json") == "${claude_conflict_bytes}" ]]
echo 'PASS: conflicting managed hooks refuse without writes.'

echo 'PASS: equal-version update skips complete installs, repairs missing registration only, and refuses conflicts without writes.'
