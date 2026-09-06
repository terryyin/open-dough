#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 --target <project> [--platform <codex|cursor>] [--force]" >&2
  exit 1
}

target=""
platform=codex
force=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --target)
      if [[ $# -lt 2 ]]; then
        usage
      fi
      target=$2
      shift 2
      ;;
    --platform)
      if [[ $# -lt 2 ]]; then
        usage
      fi
      platform=$2
      shift 2
      ;;
    --force)
      force=1
      shift
      ;;
    *)
      usage
      ;;
  esac
done

if [[ -z "${target}" ]]; then
  usage
fi

if [[ ! -d "${target}" ]]; then
  echo "Target project directory does not exist: ${target}" >&2
  exit 1
fi

case "${platform}" in
  codex)
    relative_destination=.agents/skills/dough-update
    ;;
  cursor)
    relative_destination=.cursor/skills/dough-update
    ;;
  *)
    echo "Unsupported platform: ${platform}. Supported platforms: codex, cursor." >&2
    exit 1
    ;;
esac

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
destination="${target}/${relative_destination}"
if [[ -d "${destination}" && ${force} -ne 1 ]]; then
  echo "Warning: dough-update is already installed in ${destination}. Use --force to explicitly reinstall." >&2
  exit 1
fi

mkdir -p -- "${destination}"
cp -- "${source_dir}/src/skills/dough-update/SKILL.md" "${destination}/SKILL.md"
echo "Installed dough-update in ${destination}"
