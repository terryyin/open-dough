#!/usr/bin/env bash
# Ordinary, supplied-URL, and explicit-force apply: resolve source, pin,
# compare unless forced, then install.
# Sourced by open-dough-release.sh after platform, version, and resolve modules.
# Predicate functions are used in if/! conditions by design.
# shellcheck disable=SC2310,SC2312,SC2249

trace_line() {
  if [[ -n "${OPEN_DOUGH_TRACE:-}" ]]; then
    printf '%s\n' "$1" >> "${OPEN_DOUGH_TRACE}"
  fi
}

report_unverifiable_installation() {
  local dest=$1
  local outcome=${2:-'refused; preserved the selected installation.'}

  trace_line "apply-unverifiable ${dest}"
  printf 'Outcome: %s\n' "${outcome}"
}

refuse_if_ordinary_unverifiable() {
  local dest=$1
  local supplied_url=$2

  if [[ "${supplied_url}" -eq 0 ]]; then
    report_unverifiable_installation "${dest}"
  fi
}

recorded_baseline_unchanged() {
  local dest=$1
  local url=$2
  local baseline=$3
  local installed=$4

  if ! fetch_tagged_release "${url}" "${baseline}" "${installed}" > /dev/null; then
    return 1
  fi
  if ! managed_payload_unchanged "${dest}" "${baseline}"; then
    echo "Installed files do not match recorded release ${installed}; ordinary update requires an unchanged installation." >&2
    return 1
  fi
}

require_ordinary_recorded_baseline() {
  local dest=$1
  local supplied_url=$2
  local url=$3
  local work_root=$4
  local installed=$5

  if [[ "${supplied_url}" -ne 0 ]]; then
    return 0
  fi
  recorded_baseline_unchanged "${dest}" "${url}" "${work_root}/baseline" "${installed}"
}

run_installer() {
  local checkout=$1
  local target=$2
  local platform=$3
  local force=$4
  local source=$5
  local replace_verified=${6:-0}
  local retire_legacy_cursor=${7:-0}
  local -a args

  args=(--target "${target}" --platform "${platform}" --source "${source}")
  if [[ "${force}" -eq 1 ]]; then
    args+=(--force)
  elif [[ "${replace_verified}" -eq 1 ]]; then
    args+=(--replace-verified)
  fi
  if [[ "${retire_legacy_cursor}" -eq 1 ]]; then
    args+=(--retire-legacy-cursor)
  fi
  bash "${checkout}/install.sh" "${args[@]}"
}

legacy_cursor_topology_is_safe() {
  local target=$1 legacy_root path

  legacy_root="${target}/.cursor/skills"
  for path in "${target}/.cursor" "${legacy_root}" \
    "${legacy_root}/dough-update" "${legacy_root}/dough-adr-awareness"; do
    [[ ! -L "${path}" && (! -e "${path}" || -d "${path}") ]] || {
      echo "Unsafe legacy Cursor destination: ${path}." >&2
      return 1
    }
  done
  for path in \
    "${legacy_root}/dough-update/SKILL.md" \
    "${legacy_root}/dough-update/SOURCE" \
    "${legacy_root}/dough-update/VERSION" \
    "${legacy_root}/dough-adr-awareness/SKILL.md" \
    "${legacy_root}/dough-adr-awareness/RECOGNITION.md"; do
    [[ ! -L "${path}" && (! -e "${path}" || -f "${path}") ]] || {
      echo "Unsafe legacy Cursor destination: ${path}." >&2
      return 1
    }
  done
}

all_roots_verified_for_release() {
  local target=$1 url=$2 work_root=$3 latest_version=$4
  local current_platform current_dest legacy_dest installed relation

  while IFS=$'\t' read -r current_platform current_dest; do
    if [[ ! -d "${current_dest}" ]]; then
      continue
    fi
    if [[ $(read_source_record "${current_dest}/SOURCE" 2> /dev/null || true) != "${url}" ]]; then
      echo "${current_platform}: SOURCE conflicts with the shared installation; ordinary update refuses without writes." >&2
      return 1
    fi
    installed=$(read_record "${current_dest}/VERSION") || {
      echo "${current_platform}: missing or malformed VERSION; ordinary all-tool update refuses without writes." >&2
      return 1
    }
    if ! recorded_baseline_unchanged "${current_dest}" "${url}" "${work_root}/baseline-${current_platform}" "${installed}"; then
      return 1
    fi
    relation=$(compare_versions "${installed}" "${latest_version}")
    if [[ "${relation}" == newer ]]; then
      echo "${current_platform}: installed ${installed} is newer than source ${latest_version}; ordinary all-tool update refuses without a downgrade." >&2
      return 1
    fi
  done < <(all_destinations_for "${target}")

  legacy_dest=$(legacy_cursor_destination_for "${target}")
  if [[ -d "${legacy_dest}" ]]; then
    if [[ $(read_source_record "${legacy_dest}/SOURCE" 2> /dev/null || true) != "${url}" ]]; then
      echo "legacy Cursor: SOURCE conflicts with the shared installation; ordinary migration refuses without writes." >&2
      return 1
    fi
    installed=$(read_record "${legacy_dest}/VERSION") || {
      echo "legacy Cursor: missing or malformed VERSION; ordinary migration refuses without writes." >&2
      return 1
    }
    if ! recorded_baseline_unchanged "${legacy_dest}" "${url}" "${work_root}/baseline-legacy-cursor" "${installed}"; then
      return 1
    fi
    relation=$(compare_versions "${installed}" "${latest_version}")
    if [[ "${relation}" == newer ]]; then
      echo "legacy Cursor: installed ${installed} is newer than source ${latest_version}; ordinary migration refuses without a downgrade." >&2
      return 1
    fi
  fi
}

apply_release() {
  local url=''
  local target=''
  local platform=codex
  local force=0
  local checkout=''
  local supplied_url=0
  local work resolved tag commit version work_root
  local dest legacy_dest installed relation retire_legacy_cursor=0

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
  legacy_dest=$(legacy_cursor_destination_for "${target}")
  if [[ -e "${target}/.cursor" ]] && ! legacy_cursor_topology_is_safe "${target}"; then
    report_unverifiable_installation "${legacy_dest}"
    return 1
  fi
  [[ -d "${legacy_dest}" ]] && retire_legacy_cursor=1

  if [[ "${supplied_url}" -eq 0 ]]; then
    if [[ -d "${dest}" ]]; then
      if ! url=$(read_source_record "${dest}/SOURCE"); then
        report_unverifiable_installation "${dest}"
        return 1
      fi
    elif [[ -d "${legacy_dest}" ]]; then
      if ! url=$(read_source_record "${legacy_dest}/SOURCE"); then
        report_unverifiable_installation "${legacy_dest}"
        return 1
      fi
    else
      usage
    fi
  fi

  work_root=$(mktemp -d)
  trap 'rm -rf -- '"${work_root}" EXIT
  if [[ -n "${checkout}" ]]; then
    work=${checkout}
    if ! resolved=$(require_pinned_checkout "${work}" "${url}"); then
      refuse_if_ordinary_unverifiable "${dest}" "${supplied_url}"
      return 1
    fi
  else
    work="${work_root}/release"
    if ! resolved=$(fetch_release "${url}" "${work}"); then
      refuse_if_ordinary_unverifiable "${dest}" "${supplied_url}"
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
    run_installer "${work}" "${target}" "${platform}" 1 "${url}" 0 "${retire_legacy_cursor}"
    printf 'Outcome: installed %s in the shared Codex/Cursor root and Claude Code by explicit force.\n' "${version}"
    printf 'Start fresh sessions before invoking dough-update again.\n'
    return 0
  fi

  # A supplied source is the fresh-install bootstrap only. Existing managed
  # roots still need the ordinary baseline proof or an explicit force.
  if [[ ! -d "${dest}" && "${supplied_url}" -eq 1 ]]; then
    trace_line "apply-install ${dest}"
    run_installer "${work}" "${target}" "${platform}" 0 "${url}" 0 "${retire_legacy_cursor}"
    printf 'Installed: unknown\n'
    printf 'Outcome: installed %s in Codex, Cursor, and Claude Code.\n' "${version}"
    printf 'Start fresh sessions before invoking dough-update again.\n'
    return 0
  fi

  if [[ ! -d "${dest}" && ! -d "${legacy_dest}" ]]; then
    report_unverifiable_installation "${dest}"
    return 1
  fi

  if ! all_roots_verified_for_release "${target}" "${url}" "${work_root}" "${version}"; then
    report_unverifiable_installation "${dest}"
    return 1
  fi

  needs_replacement=0
  while IFS=$'\t' read -r current_platform current_dest; do
    if [[ ! -d "${current_dest}" ]]; then
      needs_replacement=1
    else
      installed=$(read_record "${current_dest}/VERSION")
      relation=$(compare_versions "${installed}" "${version}")
      [[ "${relation}" == equal ]] || needs_replacement=1
    fi
  done < <(all_destinations_for "${target}")
  [[ ${retire_legacy_cursor} -eq 0 ]] || needs_replacement=1
  if [[ ${needs_replacement} -eq 0 ]]; then
    trace_line "apply-skip-equal ${dest}"
    printf 'Outcome: both physical installations are current; no installer invocation or installed-file writes.\n'
    return 0
  fi
  trace_line "apply-reconcile ${dest}"
  run_installer "${work}" "${target}" "${platform}" 0 "${url}" 1 "${retire_legacy_cursor}"
  printf 'Outcome: installed or updated the shared Codex/Cursor root and Claude Code to %s.\n' "${version}"
  printf 'Start fresh sessions before invoking dough-update again.\n'
}
