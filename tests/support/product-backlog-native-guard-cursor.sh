#!/usr/bin/env bash
# Cursor native journey and deterministic install/CLI proof for the shared
# product-backlog edit guard fixture.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals and shared helpers come from the sourcing test.

guard_write_cursor_existing_hooks() {
  local target=$1
  mkdir -p -- "${target}/.cursor"
  cat > "${target}/.cursor/hooks.json" << 'EOF'
{
  "description": "Keep this Cursor hook config.",
  "hooks": {
    "sessionStart": [
      {
        "command": "true",
        "timeout": 1
      }
    ]
  }
}
EOF
}

guard_assert_cursor_preserved() {
  local target=$1
  grep -Fq 'Keep this Cursor hook config.' "${target}/.cursor/hooks.json" || {
    echo 'FAIL: Cursor guard registration did not preserve unrelated hook configuration.' >&2
    return 1
  }
  grep -Fq 'ci-host-hook.mjs cursor' "${target}/.cursor/hooks.json" || {
    echo 'FAIL: Cursor CI hook fragment was not preserved beside the guard.' >&2
    return 1
  }
}

guard_install_cursor_guard() {
  local source_dir=$1
  local target=$2
  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform cursor > /dev/null
  guard_assert_registered "${target}" cursor
  guard_assert_cursor_preserved "${target}"
  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform cursor > /dev/null
  guard_assert_no_duplicate_pretooluse "${target}" cursor
}

# Cursor permission schema plus Claude-compatibility skip, via the installed CLI.
guard_assert_cursor_cli() {
  local hook=$1
  local project_dir=$2
  local payload output
  payload=$(node -e '
    const projectDir = process.argv[1];
    process.stdout.write(JSON.stringify({
      tool_name: "Write",
      tool_input: { file_path: projectDir + "/.planning/PRODUCT-BACKLOG.md" },
      hook_event_name: "preToolUse",
      cursor_version: "test",
    }));
  ' "${project_dir}")
  output=$(printf '%s' "${payload}" | node "${hook}" "${project_dir}" cursor)
  if ! printf '%s' "${output}" | grep -Fq '"permission":"deny"'; then
    echo "FAIL: Cursor native CLI did not deny a Write to the backlog." >&2
    echo "${output}" >&2
    return 1
  fi
  output=$(printf '%s' "${payload}" | node "${hook}" "${project_dir}")
  if ! printf '%s' "${output}" | grep -Fq '"permission":"allow"'; then
    echo "FAIL: Claude-compat Cursor loading did not skip denial." >&2
    echo "${output}" >&2
    return 1
  fi
}

guard_run_deterministic_cursor() {
  local source_dir=$1
  local work_root=$2
  local cursor_target="${work_root}/cursor-project"
  mkdir -p -- "${cursor_target}"
  guard_write_project_backlog "${cursor_target}"
  guard_write_cursor_existing_hooks "${cursor_target}"
  guard_install_cursor_guard "${source_dir}" "${cursor_target}"
}

guard_cursor_native_cleanup() {
  local status=$?
  local output
  if [[ ${status} -eq 0 ]]; then
    rm -rf -- "${temporary_dir}"
    return
  fi
  printf '\nFAIL: preserving native Cursor guard evidence after status %s.\n' \
    "${status}" >&2
  for output in "${temporary_dir}"/native-guard-cursor-*; do
    [[ -f ${output} ]] || continue
    printf '%s\n' "--- $(basename -- "${output}") ---" >&2
    cat "${output}" >&2
  done
  printf 'PRESERVED: %s\n' "${temporary_dir}" >&2
}

guard_run_native_cursor() {
  local source_dir=$1
  local target other_file
  # Not `local`: guard_cursor_native_cleanup's EXIT trap reads this after this
  # function returns.
  temporary_dir=$(mktemp -d)
  target="${temporary_dir}/project"
  other_file="${target}/notes.md"
  mkdir -p -- "${target}"
  guard_write_project_backlog "${target}"
  guard_write_cursor_existing_hooks "${target}"
  printf '%s\n' 'unrelated' > "${other_file}"

  guard_install_cursor_guard "${source_dir}" "${target}"

  git -C "${target}" init --quiet -b main
  git -C "${target}" -c user.name='Guard fixture' \
    -c user.email='fixture@example.invalid' add -A
  git -C "${target}" -c user.name='Guard fixture' \
    -c user.email='fixture@example.invalid' commit --quiet -m 'fixture: installed guard'

  trap guard_cursor_native_cleanup EXIT

  run_native_guard_cursor() {
    local case_name=$1
    local prompt=$2
    (
      cd -- "${target}" || exit
      cursor agent --print --force --trust --sandbox enabled \
        --workspace "${target}" "${prompt}"
    ) > "${temporary_dir}/native-guard-cursor-${case_name}-output.md" 2>&1
  }

  local backlog_before backlog_after
  backlog_before=$(cat "${target}/${guard_backlog_rel}")
  run_native_guard_cursor deny \
    "Use the Write tool to add a new bullet '- item three' under the Backlog list heading in ${guard_backlog_rel}. Do not use a shell command or another editing mechanism. Report plainly whether the file edit succeeded or was denied."
  backlog_after=$(cat "${target}/${guard_backlog_rel}")
  if [[ "${backlog_before}" != "${backlog_after}" ]]; then
    echo 'FAIL: native Cursor changed the guarded backlog file via Write.' >&2
    return 1
  fi
  if ! grep -Eiq 'block|deny|refus|reject|hook|could not|cannot' \
    "${temporary_dir}/native-guard-cursor-deny-output.md"; then
    echo 'FAIL: native Cursor denial output did not report the refused edit.' >&2
    return 1
  fi

  run_native_guard_cursor allow-edit \
    "Use the Write or StrReplace tool to add a line containing exactly 'edited' after the existing line in notes.md. Do not use a shell command. Report plainly whether the file edit succeeded."
  if ! grep -Fxq 'edited' "${other_file}"; then
    echo 'FAIL: native Cursor could not edit an unrelated file while the guard was registered.' >&2
    return 1
  fi

  run_native_guard_cursor allow-read \
    "Read ${guard_backlog_rel} and report its exact contents. Do not edit any file."
  if ! grep -Fq 'Existing queued item' \
    "${temporary_dir}/native-guard-cursor-allow-read-output.md"; then
    echo 'FAIL: native Cursor could not read the guarded backlog file.' >&2
    return 1
  fi

  run_native_guard_cursor allow-script \
    "Run exactly this shell command, then report plainly whether it succeeded: printf '%s\\n' '- item three (via script)' >> .planning/PRODUCT-BACKLOG.md"
  if ! grep -Fq 'item three (via script)' "${target}/${guard_backlog_rel}"; then
    echo 'FAIL: a native Cursor shell-run script could not write the backlog file.' >&2
    return 1
  fi

  printf '%s\n' '- human repair' >> "${target}/${guard_backlog_rel}"
  if ! grep -Fq -- '- human repair' "${target}/${guard_backlog_rel}"; then
    echo 'FAIL: human repair outside Cursor could not write the backlog file.' >&2
    return 1
  fi

  native_tool_version=$(cursor agent --version)
  printf 'Native tool version: %s\n' "${native_tool_version}"
  printf '%s\n' \
    'PASS: install registered the Cursor preToolUse guard, preserved unrelated hooks and CI commands, delivered the fragment and shared guard to both roots, and repeat install/update stayed idempotent.' \
    'PASS: a fresh native Cursor session was denied a Write to the resolved product backlog path before bytes changed.' \
    'PASS: fresh native Cursor sessions edited an unrelated file, read the guarded backlog, and ran a shell script that wrote it while the guard stayed registered.' \
    'PASS: a human repair outside Cursor wrote the backlog normally.'
}
