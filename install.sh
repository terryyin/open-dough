#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 || ${1:-} != --target || ($# -eq 3 && ${3:-} != --force) ]]; then
  echo "Usage: $0 --target <project> [--force]" >&2
  exit 1
fi

target=$2
if [[ ! -d "${target}" ]]; then
  echo "Target project directory does not exist: ${target}" >&2
  exit 1
fi

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
destination="${target}/.agents/skills/dough-update"
if [[ -d "${destination}" && ${3:-} != --force ]]; then
  echo "Warning: dough-update is already installed in ${destination}. Use --force to explicitly reinstall." >&2
  exit 1
fi

mkdir -p -- "${destination}"
cp -- "${source_dir}/src/skills/dough-update/SKILL.md" "${destination}/SKILL.md"
echo "Installed dough-update in ${destination}"
