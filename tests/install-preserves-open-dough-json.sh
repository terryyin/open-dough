#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2154,SC2312
# Project open-dough.json is outside managed payload ownership. Ordinary
# install and update preserve its bytes or absence.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/tests/helpers/release-fixture.bash"
source "${source_dir}/tests/helpers/host-hooks-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

config_rel='.planning/open-dough.json'

write_skip_true_unknown() {
  local dest=$1
  mkdir -p -- "$(dirname -- "${dest}")"
  cat > "${dest}" << 'EOF'
{
  "skipProcessRetrospective": true,
  "unrelatedFutureSetting": "leave-me",
  "nested": { "also": true }
}
EOF
}

assert_not_managed() {
  local managed_file
  for managed_file in "${managed_files[@]}"; do
    if [[ "${managed_file}" == *'open-dough.json'* ]]; then
      echo "FAIL: managed payload lists ${managed_file}" >&2
      exit 1
    fi
  done
  if grep -Fq 'open-dough.json' "${source_dir}/install.sh" \
    "${source_dir}/src/install/open-dough-release-version.sh"; then
    echo 'FAIL: installer payload declarations mention open-dough.json' >&2
    exit 1
  fi
}

assert_config_absent() {
  local target=$1
  local label=$2
  local found
  if [[ -e "${target}/${config_rel}" ]]; then
    echo "FAIL: ${label}: created ${config_rel}" >&2
    exit 1
  fi
  found=$(find "${target}" -name 'open-dough.json' -print)
  if [[ -n "${found}" ]]; then
    echo "FAIL: ${label}: created unexpected open-dough.json:" >&2
    printf '%s\n' "${found}" >&2
    exit 1
  fi
}

assert_config_bytes() {
  local target=$1
  local expected=$2
  local label=$3
  local extras
  if ! cmp -s -- "${expected}" "${target}/${config_rel}"; then
    echo "FAIL: ${label}: ${config_rel} bytes changed" >&2
    exit 1
  fi
  extras=$(find "${target}" -name 'open-dough.json' \
    ! -path "${target}/${config_rel}" -print)
  if [[ -n "${extras}" ]]; then
    echo "FAIL: ${label}: extra open-dough.json paths:" >&2
    printf '%s\n' "${extras}" >&2
    exit 1
  fi
}

install_current() {
  local target=$1
  local platform=$2
  shift 2
  bash "${source_dir}/install.sh" --target "${target}" \
    --source "${source_dir}" --platform "${platform}" "$@"
}

assert_not_managed

# Shared Codex/Cursor entry: first install must not create a default file.
absent_cursor="${temporary_dir}/absent cursor"
prepare_target "${absent_cursor}"
install_current "${absent_cursor}" cursor > /dev/null
assert_config_absent "${absent_cursor}" 'cursor first install'
assert_sentinels "${absent_cursor}"

# Claude entry: first install must not create a default file.
absent_claude="${temporary_dir}/absent claude"
prepare_target "${absent_claude}"
install_current "${absent_claude}" claude > /dev/null
assert_config_absent "${absent_claude}" 'claude first install'
assert_sentinels "${absent_claude}"

# Existing true + unknown keys survive Codex/Cursor install and --force.
present_cursor="${temporary_dir}/present cursor"
prepare_target "${present_cursor}"
write_skip_true_unknown "${present_cursor}/${config_rel}"
expected_present="${temporary_dir}/expected-present.json"
cp -- "${present_cursor}/${config_rel}" "${expected_present}"
install_current "${present_cursor}" cursor > /dev/null
assert_config_bytes "${present_cursor}" "${expected_present}" \
  'cursor first install with existing config'
assert_sentinels "${present_cursor}"
install_current "${present_cursor}" cursor --force > /dev/null
assert_config_bytes "${present_cursor}" "${expected_present}" \
  'cursor --force with existing config'
assert_sentinels "${present_cursor}"

# Existing true + unknown keys survive Claude install and --force.
present_claude="${temporary_dir}/present claude"
prepare_target "${present_claude}"
write_skip_true_unknown "${present_claude}/${config_rel}"
install_current "${present_claude}" claude > /dev/null
assert_config_bytes "${present_claude}" "${expected_present}" \
  'claude first install with existing config'
assert_sentinels "${present_claude}"
install_current "${present_claude}" claude --force > /dev/null
assert_config_bytes "${present_claude}" "${expected_present}" \
  'claude --force with existing config'
assert_sentinels "${present_claude}"

# Ordinary no-URL update and supported force replacement from recorded SOURCE.
fixture="${temporary_dir}/fixture.git"
build_latest_fixture "${fixture}"
old_checkout="${temporary_dir}/release-0.1.1"
checkout_tagged_release "${fixture}" "${old_checkout}" 0.1.1
helper="${source_dir}/src/install/open-dough-release.sh"

update_present="${temporary_dir}/update present"
prepare_target "${update_present}"
seed_empty_host_settings "${update_present}"
write_skip_true_unknown "${update_present}/${config_rel}"
bash "${old_checkout}/install.sh" --target "${update_present}" \
  --source "${fixture}" --platform cursor > /dev/null
assert_config_bytes "${update_present}" "${expected_present}" \
  'old tagged install with existing config'
bash "${helper}" apply --target "${update_present}" --platform cursor > /dev/null
assert_config_bytes "${update_present}" "${expected_present}" \
  'ordinary update with existing config'
assert_sentinels "${update_present}"
bash "${helper}" apply --target "${update_present}" --platform claude --force \
  > /dev/null
assert_config_bytes "${update_present}" "${expected_present}" \
  'force update with existing config'
assert_sentinels "${update_present}"

update_absent="${temporary_dir}/update absent"
prepare_target "${update_absent}"
seed_empty_host_settings "${update_absent}"
bash "${old_checkout}/install.sh" --target "${update_absent}" \
  --source "${fixture}" --platform claude > /dev/null
assert_config_absent "${update_absent}" 'old tagged install without config'
bash "${helper}" apply --target "${update_absent}" --platform claude > /dev/null
assert_config_absent "${update_absent}" 'ordinary update without config'
bash "${helper}" apply --target "${update_absent}" --platform cursor --force \
  > /dev/null
assert_config_absent "${update_absent}" 'force update without config'
assert_sentinels "${update_absent}"

echo 'PASS: install and update preserve optional open-dough.json bytes or absence across Codex/Cursor and Claude paths, including force replacement, without adding it to managed payload lists.'
