#!/usr/bin/env bash
# Predicate functions are used in if/! conditions by design.
# shellcheck disable=SC2310,SC2249
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-platform.sh
source "${script_dir}/open-dough-platform.sh"
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-register-hooks.sh
source "${script_dir}/open-dough-register-hooks.sh"
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-release-version.sh
source "${script_dir}/open-dough-release-version.sh"
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-release-resolve.sh
source "${script_dir}/open-dough-release-resolve.sh"
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-release-apply.sh
source "${script_dir}/open-dough-release-apply.sh"

usage() {
  echo "Usage: $0 <command> [args]" >&2
  echo "Commands: validate-checkout, compare, compare-payload, destination," >&2
  echo "          resolve-url, fetch-release, pin-latest, apply" >&2
  exit 1
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
  compare-payload)
    [[ $# -eq 2 ]] || usage
    managed_payload_unchanged "$1" "$2"
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
