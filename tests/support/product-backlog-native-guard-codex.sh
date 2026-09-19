#!/usr/bin/env bash
# Codex native journey for the shared product-backlog edit guard fixture.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals and shared helpers come from the sourcing test.

guard_codex_native_cleanup() {
  local status=$?
  local output
  if [[ ${status} -eq 0 ]]; then
    rm -rf -- "${temporary_dir}"
    return
  fi
  printf '\nFAIL: preserving native Codex guard evidence after status %s.\n' \
    "${status}" >&2
  for output in "${temporary_dir}"/native-guard-codex-*; do
    [[ -f ${output} ]] || continue
    printf '%s\n' "--- $(basename -- "${output}") ---" >&2
    cat "${output}" >&2
  done
  printf 'PRESERVED: %s\n' "${temporary_dir}" >&2
}

guard_run_native_codex() {
  local source_dir=$1
  local target other_file
  # Not `local`: guard_codex_native_cleanup's EXIT trap reads this after this
  # function returns.
  temporary_dir=$(mktemp -d)
  target="${temporary_dir}/project"
  other_file="${target}/notes.md"
  mkdir -p -- "${target}"
  guard_write_project_backlog "${target}"
  guard_write_codex_existing_hooks "${target}"
  printf '%s\n' 'unrelated' > "${other_file}"

  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform codex > /dev/null
  guard_assert_registered "${target}" codex
  grep -Fq 'Keep this Codex hook config.' "${target}/.codex/hooks.json" || {
    echo 'FAIL: Codex guard registration did not preserve unrelated hook configuration.' >&2
    return 1
  }

  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform codex > /dev/null
  guard_assert_no_duplicate_pretooluse "${target}" codex

  git -C "${target}" init --quiet -b main
  git -C "${target}" -c user.name='Guard fixture' \
    -c user.email='fixture@example.invalid' add -A
  git -C "${target}" -c user.name='Guard fixture' \
    -c user.email='fixture@example.invalid' commit --quiet -m 'fixture: installed guard'

  native_codex_prepare "${temporary_dir}" "${source_dir}"
  trap guard_codex_native_cleanup EXIT

  run_native_guard_codex() {
    local case_name=$1
    local prompt=$2
    native_codex_run "${target}" \
      "${temporary_dir}/native-guard-codex-${case_name}-output.md" \
      "${prompt}" \
      "${temporary_dir}/native-guard-codex-${case_name}-transcript.jsonl" \
      bypass-hook-trust
  }

  local backlog_before backlog_after
  backlog_before=$(cat "${target}/${guard_backlog_rel}")
  run_native_guard_codex deny \
    "Use apply_patch to add a new bullet '- item three' under the Backlog list heading in ${guard_backlog_rel}. Do not use a shell command or another editing mechanism. Report plainly whether the patch succeeded."
  backlog_after=$(cat "${target}/${guard_backlog_rel}")
  if [[ "${backlog_before}" != "${backlog_after}" ]]; then
    echo 'FAIL: native Codex changed the guarded backlog file via apply_patch.' >&2
    return 1
  fi
  if ! grep -Eiq 'block|deny|refus|reject|hook|could not|cannot' \
    "${temporary_dir}/native-guard-codex-deny-output.md"; then
    echo 'FAIL: native Codex denial output did not report the refused patch.' >&2
    return 1
  fi

  run_native_guard_codex allow-edit \
    "Use apply_patch to add a line containing exactly 'edited' after the existing line in notes.md. Report plainly whether the patch succeeded."
  if ! grep -Fxq 'edited' "${other_file}"; then
    echo 'FAIL: native Codex could not apply_patch an unrelated file while the guard was registered.' >&2
    return 1
  fi

  run_native_guard_codex allow-read \
    "Read ${guard_backlog_rel} with a read-only shell command and report its exact contents. Do not edit any file."
  if ! grep -Fq 'Existing queued item' \
    "${temporary_dir}/native-guard-codex-allow-read-output.md"; then
    echo 'FAIL: native Codex could not read the guarded backlog file.' >&2
    return 1
  fi

  run_native_guard_codex allow-script \
    "Run exactly this shell command, then report plainly whether it succeeded: printf '%s\\n' '- item three (via script)' >> .planning/PRODUCT-BACKLOG.md"
  if ! grep -Fq 'item three (via script)' "${target}/${guard_backlog_rel}"; then
    echo 'FAIL: a native Codex shell-run script could not write the backlog file.' >&2
    return 1
  fi

  printf '%s\n' '- human repair' >> "${target}/${guard_backlog_rel}"
  if ! grep -Fq -- '- human repair' "${target}/${guard_backlog_rel}"; then
    echo 'FAIL: human repair outside Codex could not write the backlog file.' >&2
    return 1
  fi

  native_tool_version=$(codex --version)
  printf 'Native tool version: %s\n' "${native_tool_version}"
  printf '%s\n' \
    'PASS: install registered the Codex apply_patch guard, preserved unrelated hooks, delivered the fragment and shared guard to both roots, and repeat install/update stayed idempotent.' \
    'PASS: a fresh native Codex session was denied an apply_patch to the resolved product backlog path before bytes changed.' \
    'PASS: fresh native Codex sessions applied a patch to an unrelated file, read the guarded backlog, and ran a shell script that wrote it while the guard stayed registered.' \
    'PASS: a human repair outside Codex wrote the backlog normally.'
}
