#!/usr/bin/env bash
# Predicate functions are used in if/! conditions by design.
# shellcheck disable=SC2310,SC2249
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-platform.sh
source "${script_dir}/open-dough-platform.sh"
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-release-version.sh
source "${script_dir}/open-dough-release-version.sh"
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-release-resolve.sh
source "${script_dir}/open-dough-release-resolve.sh"

usage() {
  echo "Usage: $0 <command> [args]" >&2
  echo "Commands: validate-checkout, compare, destination, resolve-url," >&2
  echo "          fetch-release, pin-latest, apply" >&2
  exit 1
}

trace_line() {
  if [[ -n "${OPEN_DOUGH_TRACE:-}" ]]; then
    printf '%s\n' "$1" >> "${OPEN_DOUGH_TRACE}"
  fi
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
  local work resolved tag commit version work_root
  local dest installed relation
  local record_status=0

  while [[ $# -gt 0 ]]; do
    case $1 in
      --url)
        [[ $# -ge 2 ]] || usage
        url=$2
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

  if [[ -z "${url}" || -z "${target}" ]]; then
    usage
  fi
  dest=$(destination_for "${target}" "${platform}")

  if [[ -n "${checkout}" ]]; then
    work=${checkout}
    resolved=$(require_pinned_checkout "${work}" "${url}")
  else
    work_root=$(mktemp -d)
    trap 'rm -rf -- '"${work_root}" EXIT
    work="${work_root}/release"
    resolved=$(fetch_release "${url}" "${work}")
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
    printf 'Installed record: malformed\n'
    printf 'Outcome: refused; preserved the selected installation.\n'
    return 1
  fi

  if [[ -z "${installed}" ]]; then
    trace_line "apply-unknown ${dest}"
    printf 'Installed: unknown\n'
    run_installer "${work}" "${target}" "${platform}" 1 "${url}"
    printf 'Outcome: recorded %s for the previously unknown installation.\n' "${version}"
    printf 'Start a fresh session in this tool before invoking dough-update again.\n'
    return 0
  fi

  printf 'Installed: %s\n' "${installed}"
  relation=$(compare_versions "${installed}" "${version}")
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

if [[ $# -lt 1 ]]; then
  usage
fi

command=$1
shift
case "${command}" in
  validate-checkout)
    [[ $# -eq 1 ]] || usage
    validate_checkout "$1"
    ;;
  compare)
    [[ $# -eq 2 ]] || usage
    if ! is_release_version "$1" || ! is_release_version "$2"; then
      echo "Refusing to compare non-release versions" >&2
      exit 1
    fi
    compare_versions "$1" "$2"
    ;;
  destination)
    [[ $# -eq 2 ]] || usage
    destination_for "$1" "$2"
    ;;
  resolve-url)
    [[ $# -eq 1 ]] || usage
    resolve_url "$1"
    ;;
  fetch-release)
    [[ $# -eq 2 ]] || usage
    fetch_release "$1" "$2"
    ;;
  pin-latest)
    [[ $# -eq 1 || $# -eq 2 ]] || usage
    pin_latest "$1" "${2:-}"
    ;;
  apply)
    apply_release "$@"
    ;;
  --version | --tag | --release)
    refuse_requested_version
    ;;
  *)
    if looks_like_version_request "${command}"; then
      refuse_requested_version
    fi
    usage
    ;;
esac
