#!/usr/bin/env bash
# Installer request: parses the original positional arguments, then checks and
# resolves the target project and recorded source. Sourced after the platform
# helper; the caller assigns original_pwd before its own directory changes.
# shellcheck disable=SC2034,SC2154,SC2310
usage() {
  echo "Usage: $0 --target <project> --source <url-or-path> [--platform <codex|cursor|claude>] [--force]" >&2
  exit 1
}
# Sets the variable named $1 to the value following option $2, or stops.
option_value() {
  [[ $# -ge 3 ]] || usage
  printf -v "$1" '%s' "$3"
}
target=''
recorded_source=''
platform=codex
force=0
replace_verified=0
while [[ $# -gt 0 ]]; do
  case $1 in
    --target) option_value target "$@" && shift 2 ;;
    --source) option_value recorded_source "$@" && shift 2 ;;
    --platform) option_value platform "$@" && shift 2 ;;
    --force) force=1 && shift ;;
    # Internal apply handoff: its caller verified every managed baseline first.
    --replace-verified) replace_verified=1 && shift ;;
    --version | --tag | --release) refuse_requested_version ;;
    *)
      looks_like_version_request "$1" && refuse_requested_version
      usage
      ;;
  esac
done
[[ -n "${target}" && -n "${recorded_source}" ]] || usage
# An unsupported platform stops here, before anything is resolved.
destination_for /dev/null "${platform}" > /dev/null
if [[ "${recorded_source}" == /* && -d "${recorded_source}" ]]; then
  recorded_source=$(cd -- "${recorded_source}" && pwd -P)
elif [[ -d "${original_pwd}/${recorded_source}" ]]; then
  recorded_source=$(cd -- "${original_pwd}/${recorded_source}" && pwd -P)
fi
[[ -d "${target}" ]] || { echo "Client project directory does not exist: ${target}" >&2 && exit 1; }
target=$(cd -- "${target}" && pwd -P)
