#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 || $1 != --target ]]; then
  echo "Usage: $0 --target <project>" >&2
  exit 1
fi

target=$2
if [[ ! -d "$target" ]]; then
  echo "Target project directory does not exist: $target" >&2
  exit 1
fi

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
destination="$target/.agents/skills/dough-update"
mkdir -p -- "$destination"
cp -- "$source_dir/skills/dough-update/SKILL.md" "$destination/SKILL.md"
echo "Installed dough-update in $destination"
