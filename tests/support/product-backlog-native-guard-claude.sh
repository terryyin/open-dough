#!/usr/bin/env bash
# Claude Code native journey for the shared product-backlog edit guard fixture.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals and shared helpers come from the sourcing test.

guard_native_cleanup() {
  local status=$?
  local output
  if [[ ${status} -eq 0 ]]; then
    rm -rf -- "${temporary_dir}"
    return
  fi
  printf '\nFAIL: preserving native Claude Code guard evidence after status %s.\n' \
    "${status}" >&2
  for output in "${temporary_dir}"/native-guard-*-output.md; do
    [[ -f ${output} ]] || continue
    printf '%s\n' "--- $(basename -- "${output}") ---" >&2
    cat "${output}" >&2
  done
  printf 'PRESERVED: %s\n' "${temporary_dir}" >&2
}

guard_run_native() {
  local source_dir=$1
  local target output
  # Not `local`: guard_native_cleanup's EXIT trap reads this after this
  # function returns.
  temporary_dir=$(mktemp -d)
  target="${temporary_dir}/project"
  mkdir -p -- "${target}"
  guard_write_project_backlog "${target}"

  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform claude > /dev/null
  guard_assert_registered "${target}"

  git -C "${target}" init --quiet -b main
  git -C "${target}" -c user.name='Guard fixture' \
    -c user.email='fixture@example.invalid' add -A
  git -C "${target}" -c user.name='Guard fixture' \
    -c user.email='fixture@example.invalid' commit --quiet -m 'fixture: installed guard'

  trap guard_native_cleanup EXIT

  run_native_guard_claude() {
    local output_file=$1
    local prompt=$2
    (
      cd -- "${target}" || exit
      claude --print --dangerously-skip-permissions --no-session-persistence \
        "${prompt}"
    ) > "${output_file}" 2>&1
  }

  local backlog_before backlog_after other_file="${target}/notes.md"
  backlog_before=$(cat "${target}/${guard_backlog_rel}")

  run_native_guard_claude "${temporary_dir}/native-guard-deny-output.md" \
    "Use the Edit tool to add a new bullet '- item three' under the Backlog list heading in the file ${guard_backlog_rel} in this project. Report success or failure plainly."
  backlog_after=$(cat "${target}/${guard_backlog_rel}")
  if [[ "${backlog_before}" != "${backlog_after}" ]]; then
    echo 'FAIL: native Claude Code changed the guarded backlog file via Edit.' >&2
    exit 1
  fi
  if ! grep -Eiq 'block|deny|refus|reject|hook' \
    "${temporary_dir}/native-guard-deny-output.md"; then
    echo 'FAIL: native denial output did not mention a block/deny/hook.' >&2
    exit 1
  fi

  echo 'unrelated' > "${other_file}"
  run_native_guard_claude "${temporary_dir}/native-guard-allow-edit-output.md" \
    "Use the Edit tool to add the line 'edited' to the file notes.md in this project. Report success or failure plainly."
  if ! grep -Fq 'edited' "${other_file}"; then
    echo 'FAIL: native Claude Code could not Edit an unrelated file while the guard is registered.' >&2
    exit 1
  fi

  run_native_guard_claude "${temporary_dir}/native-guard-allow-read-output.md" \
    "Use the Read tool to read ${guard_backlog_rel} in this project and report its exact contents verbatim."
  if ! grep -Fq 'Existing queued item' \
    "${temporary_dir}/native-guard-allow-read-output.md"; then
    echo 'FAIL: native Claude Code could not Read the guarded backlog file.' >&2
    exit 1
  fi

  run_native_guard_claude "${temporary_dir}/native-guard-allow-bash-output.md" \
    "Use the Bash tool to run exactly: echo '- item three (via bash)' >> ${guard_backlog_rel} . Then report success or failure plainly."
  if ! grep -Fq 'item three (via bash)' "${target}/${guard_backlog_rel}"; then
    echo 'FAIL: a Bash-run command could not write the backlog file directly.' >&2
    exit 1
  fi

  native_tool_version=$(claude --version)
  printf 'Native tool version: %s\n' "${native_tool_version}"
  printf '%s\n' \
    'PASS: a fresh native Claude Code session was denied an Edit to the resolved product backlog path, and the file bytes were unchanged.' \
    'PASS: the same session Edited an unrelated file normally while the guard stayed registered.' \
    'PASS: the same session Read the guarded backlog file normally.' \
    'PASS: a Bash-run command wrote the guarded backlog file directly via shell redirection, unaffected by the guard.'
}
