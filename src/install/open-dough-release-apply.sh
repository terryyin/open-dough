#!/usr/bin/env bash
# Ordinary, supplied-URL, and explicit-force apply: resolve source, pin,
# compare unless forced, then install.
# Sourced by open-dough-release.sh after platform, register-hooks, version,
# resolve, and baseline modules.
# Predicate functions are used in if/! conditions by design.
# shellcheck disable=SC2310,SC2312,SC2249

trace_line() {
  if [[ -n "${OPEN_DOUGH_TRACE:-}" ]]; then
    printf '%s\n' "$1" >> "${OPEN_DOUGH_TRACE}"
  fi
}

# Equal-version roots stay verified; hook completeness is a separate check.
# Restores only missing registration. Conflicts refuse without payload writes.
finish_equal_version_host_hooks() {
  local work=$1
  local target=$2
  local dest=$3
  local hooks_status

  if ! host_hook_fragments_present "${work}"; then
    trace_line "apply-skip-equal ${dest}"
    printf 'Outcome: both physical installations are current; no installer invocation or installed-file writes.\n'
    return 0
  fi
  if ! hooks_status=$(host_hooks_registration_status "${work}" "${target}"); then
    trace_line "apply-hooks-conflict ${dest}"
    printf 'Outcome: refused; preserved the selected installation.\n'
    return 1
  fi
  if [[ "${hooks_status}" == complete ]]; then
    trace_line "apply-skip-equal ${dest}"
    printf 'Outcome: both physical installations are current; no installer invocation or installed-file writes.\n'
    return 0
  fi
  if [[ "${hooks_status}" != repair ]]; then
    echo "Unexpected host hook registration status: ${hooks_status}" >&2
    printf 'Outcome: refused; preserved the selected installation.\n'
    return 1
  fi
  # Status already proved a mergeable write; apply re-plans and writes.
  trace_line "apply-hooks-repair ${dest}"
  if ! apply_host_hooks "${work}" "${target}"; then
    printf 'Outcome: refused; preserved the selected installation.\n'
    return 1
  fi
  printf 'Outcome: both physical installations are current; restored missing host hook registration without rewriting managed payload files.\n'
  return 0
}

run_installer() {
  local checkout=$1
  local target=$2
  local platform=$3
  local force=$4
  local source=$5
  local replace_verified=${6:-0}
  local -a args

  args=(--target "${target}" --platform "${platform}" --source "${source}")
  if [[ "${force}" -eq 1 ]]; then
    args+=(--force)
  elif [[ "${replace_verified}" -eq 1 ]]; then
    args+=(--replace-verified)
  fi
  bash "${checkout}/install.sh" "${args[@]}"
}

# Clear and remove the apply work root. Prefer this over relying on EXIT alone.
clear_apply_work_root() {
  [[ -n "${_open_dough_apply_work_root:-}" ]] && rm -rf -- "${_open_dough_apply_work_root}"
  _open_dough_apply_work_root=
}

apply_release() {
  local url=''
  local target=''
  local platform=codex
  local force=0
  local checkout=''
  local supplied_url=0
  local work resolved tag commit version
  local dest installed relation
  local -a fetched_release=()
  # Non-local: EXIT trap must still see the path if set -e aborts this function
  # before an explicit clear (bash 5 drops locals when the function unwinds).
  _open_dough_apply_work_root=

  while [[ $# -gt 0 ]]; do
    case $1 in
      --url)
        [[ $# -ge 2 ]] || usage
        url=$2
        supplied_url=1
        shift 2
        ;;
      --target)
        [[ $# -ge 2 ]] || usage
        target=$2
        shift 2
        ;;
      --platform)
        [[ $# -ge 2 ]] || usage
        platform=$2
        shift 2
        ;;
      --checkout)
        [[ $# -ge 2 ]] || usage
        checkout=$2
        shift 2
        ;;
      --force)
        force=1
        shift
        ;;
      *)
        if looks_like_version_request "$1"; then
          refuse_requested_version
        fi
        usage
        ;;
    esac
  done

  if [[ -z "${target}" ]]; then
    usage
  fi
  dest=$(destination_for "${target}" "${platform}")
  if [[ "${supplied_url}" -eq 0 ]]; then
    if [[ -d "${dest}" ]]; then
      if ! url=$(read_source_record "${dest}/SOURCE"); then
        report_unverifiable_installation "${dest}"
        return 1
      fi
    else
      usage
    fi
  fi

  _open_dough_apply_work_root=$(mktemp -d)
  trap 'clear_apply_work_root' EXIT
  if [[ -n "${checkout}" ]]; then
    work=${checkout}
    if ! resolved=$(require_pinned_checkout "${work}" "${url}"); then
      refuse_if_ordinary_unverifiable "${dest}" "${supplied_url}"
      clear_apply_work_root
      return 1
    fi
  else
    work="${_open_dough_apply_work_root}/release"
    if ! resolved=$(fetch_release "${url}" "${work}"); then
      refuse_if_ordinary_unverifiable "${dest}" "${supplied_url}"
      clear_apply_work_root
      return 1
    fi
  fi
  IFS=$'\t' read -r tag commit version << EOF
${resolved}
EOF

  printf 'Source: %s\n' "${url}"
  printf 'Release: %s (commit %s)\n' "${tag}" "${commit}"
  printf 'Tool path: %s\n' "${dest}"

  # Explicit force deliberately replaces every safe managed root.
  if [[ "${force}" -eq 1 ]]; then
    trace_line "apply-force ${dest}"
    if ! run_installer "${work}" "${target}" "${platform}" 1 "${url}"; then
      clear_apply_work_root
      return 1
    fi
    printf 'Outcome: installed %s in the shared Codex/Cursor root and Claude Code by explicit force.\n' "${version}"
    printf 'Start fresh sessions before invoking dough-update again.\n'
    clear_apply_work_root
    return 0
  fi

  # A supplied source is the fresh-install bootstrap only. Existing managed
  # roots still need the ordinary baseline proof or an explicit force.
  if [[ ! -d "${dest}" && "${supplied_url}" -eq 1 ]]; then
    trace_line "apply-install ${dest}"
    if ! run_installer "${work}" "${target}" "${platform}" 0 "${url}"; then
      clear_apply_work_root
      return 1
    fi
    printf 'Installed: unknown\n'
    printf 'Outcome: installed %s in the shared Codex/Cursor root and Claude Code.\n' "${version}"
    printf 'Start fresh sessions before invoking dough-update again.\n'
    clear_apply_work_root
    return 0
  fi

  if [[ ! -d "${dest}" ]]; then
    report_unverifiable_installation "${dest}"
    clear_apply_work_root
    return 1
  fi

  # A fetched release is a clean tagged tree; a caller's inspected checkout
  # may carry local edits, so it never stands in for a recorded baseline.
  [[ -n "${checkout}" ]] || fetched_release=("${version}" "${work}")
  if ! all_roots_verified_for_release "${target}" "${url}" "${_open_dough_apply_work_root}" "${version}" \
    ${fetched_release[@]+"${fetched_release[@]}"}; then
    report_unverifiable_installation "${dest}"
    clear_apply_work_root
    return 1
  fi

  needs_replacement=0
  while IFS=$'\t' read -r _ current_dest; do
    if [[ ! -d "${current_dest}" ]]; then
      needs_replacement=1
    else
      installed=$(read_record "${current_dest}/VERSION")
      relation=$(compare_versions "${installed}" "${version}")
      [[ "${relation}" == equal ]] || needs_replacement=1
    fi
  done < <(all_destinations_for "${target}")
  if [[ ${needs_replacement} -eq 0 ]]; then
    finish_equal_version_host_hooks "${work}" "${target}" "${dest}"
    equal_status=$?
    clear_apply_work_root
    return "${equal_status}"
  fi
  trace_line "apply-reconcile ${dest}"
  if ! run_installer "${work}" "${target}" "${platform}" 0 "${url}" 1; then
    clear_apply_work_root
    return 1
  fi
  printf 'Outcome: installed or updated the shared Codex/Cursor root and Claude Code to %s.\n' "${version}"
  printf 'Start fresh sessions before invoking dough-update again.\n'
  clear_apply_work_root
}
