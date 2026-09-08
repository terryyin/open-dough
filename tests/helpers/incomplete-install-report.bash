#!/usr/bin/env bash
# Shared assertions for incomplete replacement reports and uncertified records.

assert_incomplete_install_report() {
  local output=$1
  local reason=$2
  local forbidden_success=$3

  [[ "${output}" == *"${reason}"* ]]
  [[ "${output}" == *'Installed files may be incomplete'* ]]
  [[ "${output}" == *'last successful record was left unchanged'* ]]
  [[ "${output}" == *'explicit --force reinstall'* ]]
  [[ "${output}" != *"${forbidden_success}"* ]]
  [[ "${output}" != *'Recorded version'* ]]
}

assert_direct_incomplete_install_report() {
  assert_incomplete_install_report "$1" "$2" \
    'Installed Open Dough public guidance'
}

assert_apply_incomplete_install_report() {
  assert_incomplete_install_report "$1" "$2" 'Outcome: updated'
}

assert_preserved_install_records() {
  local record_dir=$1
  local expected_source=$2
  local expected_version=$3
  local source_contents version_contents

  source_contents=$(cat "${record_dir}/SOURCE")
  version_contents=$(cat "${record_dir}/VERSION")
  [[ "${source_contents}" == "${expected_source}" ]]
  [[ "${version_contents}" == "${expected_version}" ]]
}
