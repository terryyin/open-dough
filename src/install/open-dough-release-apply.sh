#!/usr/bin/env bash
# Ordinary and supplied-URL apply: resolve source, pin, compare, install.
# Sourced by open-dough-release.sh after platform, version, and resolve modules.
# Predicate functions are used in if/! conditions by design.
# shellcheck disable=SC2310,SC2249

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
  local -a args

  args=(--target "${target}" --platform "${platform}" --source "${source}")
  if [[ "${force}" -eq 1 ]]; then
    args+=(--force)
  fi
  bash "${checkout}/install.sh" "${args[@]}"
}

apply_release() {
  local url=''
  local target=''
  local platform=codex
  local force=0
  local checkout=''
  local supplied_url=0
  local work resolved tag commit version work_root
  local dest installed relation
  local record_status=0

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

  if [[ "${force}" -eq 1 ]]; then
    trace_line "apply-force ${dest}"
    run_installer "${work}" "${target}" "${platform}" 1 "${url}"
    printf 'Outcome: installed %s by explicit force.\n' "${version}"
    printf 'Start a fresh session in this tool before invoking dough-update again.\n'
    return 0
  fi

  if [[ ! -d "${dest}" ]]; then
    trace_line "apply-install ${dest}"
    run_installer "${work}" "${target}" "${platform}" 0 "${url}"
    printf 'Installed: unknown\n'
    printf 'Outcome: installed %s.\n' "${version}"
    printf 'Start a fresh session in this tool before invoking dough-update again.\n'
    return 0
  fi

  installed=$(read_record "${dest}/VERSION") || record_status=$?
  if [[ "${record_status}" -eq 2 ]]; then
    trace_line "apply-malformed ${dest}"
    printf 'Outcome: refused; preserved the selected installation.\n'
    return 1
  fi

  if [[ -z "${installed}" ]]; then
    if [[ "${supplied_url}" -eq 0 ]]; then
      echo "Missing installed version record: ${dest}/VERSION" >&2
      report_unverifiable_installation "${dest}"
      return 1
    fi
    trace_line "apply-unknown ${dest}"
    printf 'Installed: unknown\n'
    run_installer "${work}" "${target}" "${platform}" 1 "${url}"
    printf 'Outcome: recorded %s for the previously unknown installation.\n' "${version}"
    printf 'Start a fresh session in this tool before invoking dough-update again.\n'
    return 0
  fi

  printf 'Installed: %s\n' "${installed}"
  relation=$(compare_versions "${installed}" "${version}")
  if ! require_ordinary_recorded_baseline "${dest}" "${supplied_url}" "${url}" \
    "${work_root}" "${installed}"; then
    if [[ "${relation}" == newer ]]; then
      report_unverifiable_installation "${dest}" \
        'unsupported; preserved the selected installation without a downgrade.'
    else
      report_unverifiable_installation "${dest}"
    fi
    return 1
  fi
  case "${relation}" in
    equal)
      trace_line "apply-skip-equal ${dest}"
      printf 'Outcome: already current; no installer invocation or installed-file writes.\n'
      ;;
    older)
      trace_line "apply-upgrade ${dest}"
      run_installer "${work}" "${target}" "${platform}" 1 "${url}"
      printf 'Outcome: updated from %s to %s.\n' "${installed}" "${version}"
      printf 'Start a fresh session in this tool before invoking dough-update again.\n'
      ;;
    newer)
      trace_line "apply-newer ${dest}"
      printf 'Outcome: installed %s is newer than source %s; no downgrade or target writes.\n' "${installed}" "${version}"
      ;;
  esac
}
