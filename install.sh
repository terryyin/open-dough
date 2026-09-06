#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 --target <project> [--platform <codex|cursor|claude>] [--force]" >&2
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

managed_files=(
  dough-update/SKILL.md
  dough-adr-awareness/SKILL.md
  dough-adr-awareness/RECOGNITION.md
)

case "${platform}" in
  codex)
    relative_skill_root=.agents/skills
    ;;
  cursor)
    relative_skill_root=.cursor/skills
    ;;
  claude)
    relative_skill_root=.claude/skills
    ;;
  *)
    echo "Unsupported platform: ${platform}. Supported platforms: codex, cursor, claude." >&2
    exit 1
    ;;
esac

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source_skill_root="${source_dir}/src/skills"
destination_skill_root="${target}/${relative_skill_root}"

for managed_file in "${managed_files[@]}"; do
  source_file="${source_skill_root}/${managed_file}"
  if [[ ! -f "${source_file}" ]]; then
    echo "Public payload is incomplete: missing src/skills/${managed_file}." >&2
    exit 1
  fi
done

if [[ ${force} -ne 1 ]]; then
  for managed_file in "${managed_files[@]}"; do
    skill_name=${managed_file%%/*}
    destination="${destination_skill_root}/${skill_name}"
    if [[ -e "${destination}" ]]; then
      echo "Warning: ${skill_name} is already installed in ${destination}. Use --force to explicitly reinstall." >&2
      exit 1
    fi
  done
fi

for managed_file in "${managed_files[@]}"; do
  source_file="${source_skill_root}/${managed_file}"
  destination_file="${destination_skill_root}/${managed_file}"
  mkdir -p -- "$(dirname -- "${destination_file}")"
  cp -- "${source_file}" "${destination_file}"
done

echo "Installed Open Dough public guidance in ${destination_skill_root}"
